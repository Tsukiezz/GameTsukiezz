// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/lunar-rivers');
const debugPort = 9500 + Math.floor(Math.random()*1500);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--enable-webgl',
    '--window-size=1280,800', url
], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(r => setTimeout(r, ms));
let ws, sequence = 0;
const pending = new Map(), errors = [];
async function cdp(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, method==='Browser.close'?2000:240000);
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
    fs.mkdirSync(output, {recursive:true});
    let tabs;
    for(let i=0;i<80;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}
    assert(tabs,'Chrome debugger starts');console.log('Chrome connected');
    const tab=tabs.find(t=>t.url.startsWith(url));assert(tab,'Current game opens');
    ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
    ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error'){const text=message.params.args.map(a=>a.value||a.description||'').join(' ');if(/WebGLProgram|shader error|VALIDATE_STATUS/i.test(text))errors.push(text);}if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith(new URL(url).origin)&&message.params.response.status>=400&&!message.params.response.url.endsWith('/favicon.ico'))errors.push(message.params.response.url);if(pending.has(message.id)){const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);}};
    await cdp('Runtime.enable');await cdp('Network.enable');
    let ready=false;
    for(let i=0;i<150;i++){ready=await evaluate('Boolean(window.lunarSurfaceFinish&&window.realmTransitUpdate&&window.graphicsQuality)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    assert(ready,'All current gameplay modules initialize');
    await pause(700);
    console.log('Runtime ready. Auditing travel, crafting and combat');
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'lunar_rivers.browser.js'),'utf8'));
    const oldNames=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../demo/verification/world-ecology/blender-design.json'),'utf8')).stations.map(s=>s.name);const actualNames=report.checks.filter(c=>c.name.startsWith('Both buildings keep old name: ')).map(c=>c.name.slice('Both buildings keep old name: '.length));assert.deepEqual(oldNames.filter(n=>!actualNames.includes(n)),[],'Keep all prior station names');
    fs.writeFileSync(path.join(output,'lunar-rivers-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,wet:report.wet,minWater:report.minimumWater,stations:report.stations,bridges:report.bridges}));
    await evaluate("worldAtlas.open()");await pause(350);let shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'atlas.png'),Buffer.from(shot.data,'base64'));await evaluate("closeModal('modal-world-atlas');gameState.inDialogue=true;const s=moonRailway.stations[0];playerGroup.position.copy(s.platform);camera.position.copy(s.platform).add(new THREE.Vector3(62,48,68));camera.lookAt(s.model.position);graphicsQuality.update(1);renderer.render(scene,camera)");await pause(350);shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'paired-stations.png'),Buffer.from(shot.data,'base64'));
    await evaluate(`(()=>{const b=realmTransitUpdate.bridges[8];playerGroup.position.copy(b.center);camera.position.copy(b.center).add(new THREE.Vector3(65,40,80));camera.lookAt(b.rows[Math.floor(b.rows.length/2)].p);graphicsQuality.update(1);renderer.render(scene,camera)})()`);await pause(350);shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'river-bridge.png'),Buffer.from(shot.data,'base64'));
    await evaluate("(()=>{gameState.inDialogue=true;const q=worldExpansion.nearest(2841,-733);const p=q.a.clone().lerp(q.b,.5);playerGroup.position.set(p.x,worldExpansion.waterY+4,p.z);camera.position.set(p.x+62,worldExpansion.waterY+36,p.z+58);camera.lookAt(new THREE.Vector3(p.x,worldExpansion.waterY,p.z));graphicsQuality.update(1);renderer.render(scene,camera)})()");await pause(500);shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'river-banks-alluvium.png'),Buffer.from(shot.data,'base64'));
    await evaluate("(()=>{const q=worldExpansion.nearest(2841,-733),p=q.a.clone().lerp(q.b,.5);camera.position.set(p.x,worldExpansion.waterY-1.3,p.z);camera.lookAt(new THREE.Vector3(p.x+5,worldExpansion.height(p.x+5,p.z),p.z+8));graphicsQuality.update(1);renderer.render(scene,camera)})()");await pause(500);shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'riverbed-sand.png'),Buffer.from(shot.data,'base64'));
    await cdp('Page.reload',{ignoreCache:true});for(let i=0;i<220;i++){if(await evaluate('Boolean(window.lunarSurfaceFinish&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    const restored=await evaluate("({unique:giftCode.unique,owned:[crystalWings.owned,solarFlashlight.owned,mangroveRealm.owned]})");for(const id of ['wings','flashlight','ancientFragment'])assert.equal(restored.unique[id],1);assert(restored.owned.every(Boolean));assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'singleton-persistence.json'),JSON.stringify({restored,errors},null,2));console.log('Legacy singleton counts migrated and persisted');

}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
