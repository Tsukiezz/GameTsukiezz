// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.join(os.tmpdir(),'tsuventure-mangrove-verification');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=9437', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9437/json')).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith(url)&&!message.params.response.url.endsWith('/favicon.ico')&&message.params.response.status>=400)errors.push('HTTP '+message.params.response.status+' '+message.params.response.url);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');await cdp('Network.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.mangroveRealm && window.fieldGuide)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,200),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(fs.readFileSync(path.join(__dirname,'mangrove_checks.js'),'utf8'));
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    for(const view of ['overview','roots','sanctuary','crocodile']){
        const data=await evaluate(`(()=>{const m=mangroveRealm;const views={overview:[[350,165,-565],[70,18,-825]],roots:[[102,14,-760],[145,18,-810]],sanctuary:[[96,20,-849],[70,9,-886]],crocodile:[[165,17,-783],[135,2,-815]]};const [eye,look]=views[${JSON.stringify(view)}];m.crocodile.group.position.set(135,-.6,-815);m.crocodile.group.rotation.set(0,0,0);camera.position.fromArray(eye);camera.lookAt(new THREE.Vector3(...look));scene.fog.density=.001;m.water.material.uniforms.fogDensity.value=.001;renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');})()`);
        fs.writeFileSync(path.join(output,view+'.png'),Buffer.from(data.split(',')[1],'base64'));
    }
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('mangroveRealm.travel();backpack.open()');await pause(250);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Backpack fits mobile');
    await cdp('Page.reload',{ignoreCache:true});for(let i=0;i<100;i++){if(await evaluate('Boolean(window.fieldGuide&&window.mangroveRealm)'))break;await pause(250);}
    assert(await evaluate('mangroveRealm.owned&&mangroveRealm.defeated&&mangroveRealm.item.collected'),'Fragment and boss defeat persist');assert.deepEqual(errors,[]);console.log('Mangrove terrain, traversal, combat, inventory, mobile and persistence verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
