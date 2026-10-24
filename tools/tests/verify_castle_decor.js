// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = path.resolve(__dirname, '../../demo/verification');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=9384', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--enable-webgl',
    '--window-size=1280,800', url
], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(r => setTimeout(r, ms));
let ws, sequence = 0;
const pending = new Map(), errors = [];
async function cdp(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 60000);
        pending.set(id, { resolve: v => { clearTimeout(timeout); resolve(v); }, reject });
        ws.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function main() {
    fs.mkdirSync(output, { recursive: true });
    let tabs;
    for (let i = 0; i < 80; i++) {
        try { tabs = await (await fetch('http://127.0.0.1:9384/json')).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.castlePhysics && typeof playerGroup !== "undefined" && playerGroup)');
        if (ready) break;
        await pause(300);
    }
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(`(()=>{
      const p=CASTLE_EXTENSION.parts,art=p.filter(p=>p.name.startsWith('furniture-portrait-')||p.name.startsWith('furniture-mirror-'));
      const outside=art.filter(p=>Math.abs(p.position[0])>20||p.position[2]<-26||p.position[2]>22);
      const results=[{name:'No legacy wall art outside castle envelope',ok:outside.length===0,detail:outside},
      {name:'Wall art detached from moving furniture',ok:art.every(p=>p.assembly===undefined)},
      {name:'Every main room has painting and torches',ok:p.filter(p=>p.name==='room-detail-frame').length===30&&p.filter(p=>p.name==='room-detail-torch-flame').length===60},
      {name:'Ballroom plus library and dining functions',ok:CASTLE_EXTENSION.rooms.some(r=>r.theme==='ballroom')&&CASTLE_EXTENSION.themes.some(t=>t.kind==='ancient-library')&&CASTLE_EXTENSION.rooms.some(r=>r.theme==='dining')},
      {name:'New furnishings added',ok:CASTLE_EXTENSION.furnishings.length>70,detail:{count:CASTLE_EXTENSION.furnishings.length}}];
      enterGame();playerGroup.position.set(25,getGroundElevation(25,25),25);currentGroundY=playerGroup.position.y;isGrounded=true;camYaw=0;keys.left=true;return {results};
    })()`);
    await pause(250);
    const left=await evaluate('heroMoveDirection.x');
    await evaluate('keys.left=false;keys.right=true');await evaluate('new Promise(resolve=>requestAnimationFrame(()=>resolve(true)))');
    const first=await evaluate('heroMoveDirection.x');await pause(350);const right=await evaluate('heroMoveDirection.x');
    report.results.push({name:'Left right reversal blends rather than snapping',ok:left<-.5&&first<.7&&right>.7,detail:{left,first,right}});await evaluate('keys.right=false');
    console.log(JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    const rooms=await evaluate('CASTLE_EXTENSION.rooms.filter(r=>r.floor===9.5&&!r.corridor)');
    for(const [name,r]of [['ballroom',rooms.find(r=>r.theme==='ballroom')],['gallery',rooms.find(r=>r.name.includes('tranh'))]]){
      const x=(r.minX+r.maxX)/2-110,z=r.maxZ+117;
      await evaluate(`playerGroup.position.set(${x},9.5,${z});currentGroundY=9.5;isGrounded=true;camYaw=Math.PI;camPitch=-.05;camDistance=2`);await pause(1000);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'furnished-'+name+'.png'),Buffer.from(shot.data,'base64'));
    }
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
