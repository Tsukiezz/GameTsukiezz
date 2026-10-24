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
      enterGame();setGraphicsProfile('potato');
      const data=CASTLE_EXTENSION,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      const rooms=data.rooms.filter(r=>!r.corridor);
      check('All 33 rooms receive extra furniture',rooms.length===33&&rooms.every(r=>r.newFurniture?.length>=(r.prison?4:8)),{rooms:rooms.length});
      check('At least 340 complete furniture assemblies',data.furnishings.length>=340,{count:data.furnishings.length});
      const tables=data.parts.filter(p=>p.name==='furniture-tabletop');
      check('Legacy table height fits hero',tables.every(p=>p.size[0]<1.5&&p.size[1]<.15),{width:tables[0]?.size[0],heroHeight:PLAYER_HEIGHT});
      check('Bookcase height near hero height',data.parts.filter(p=>p.name==='room-mini-bookcase-back').every(p=>p.size[1]<=PLAYER_HEIGHT*2.1));
      check('All original assemblies scaled consistently',data.parts.filter(p=>p.assembly!==undefined).every(p=>p.heroScale===.525));
      const minis=colliders.filter(c=>c.name==='furniture-volume');
      check('All furniture colliders retain support and escape tags',minis.length>300&&minis.every(c=>c.furniture&&c.isStandable));
      const legacy=castlePhysics.group.children.filter(m=>m.userData.heroFurnitureScale);
      check('Native legacy props scaled alongside Blender props',legacy.length>30&&legacy.every(m=>m.scale.x<=.525));
      return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    const items=await evaluate("CASTLE_EXTENSION.furnishings.filter(f=>f.room&&f.floor===13)");
    for(const [name,item]of [['bedroom',items.find(i=>i.kind==='bed')],['reading-room',items.find(i=>i.kind==='bookcase')]]){
      await evaluate(`playerGroup.position.set(${item.x+.8-110},13,${item.z+120});currentGroundY=13;isGrounded=true;camYaw=Math.PI;camPitch=.14;camDistance=1.8;`);await pause(1000);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'hero-scale-'+name+'.png'),Buffer.from(shot.data,'base64'));
    }
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
