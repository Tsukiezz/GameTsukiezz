// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/terrain-traversal');
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
async function main(){
 fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description||'').join(' '));if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');console.log('Chrome connected');let ready=false;for(let i=0;i<300;i++){ready=await evaluate('Boolean(window.realmScenery&&window.terrainTraversal)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}assert(ready);console.log('Terrain runtime ready');await cdp('Emulation.setVirtualTimePolicy',{policy:'pause'});const report=await evaluate(fs.readFileSync(path.join(__dirname,process.env.GAME_VERIFY_SCRIPT||'terrain_traversal.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,routes:report.routes,kinds:report.kinds,walked:report.walked,maxRiser:report.maxRiser,failures:report.checks.filter(c=>!c.ok)}));if(!process.env.GAME_VERIFY_SCRIPT){
 const shots={stairs:0,station:12,snow:20};for(const [name,id] of Object.entries(shots)){
 await evaluate(`(()=>{gameState.isPlaying=true;gameState.inDialogue=true;const r=highlandTrails.routes.find(r=>r.village===${id}&&r.kind==='station'),s=r.steps[Math.floor(r.steps.length*.55)],p=new THREE.Vector3(s.x,s.top,s.z);playerGroup.position.copy(p);camera.position.copy(p).add(new THREE.Vector3(20,13,22));camera.lookAt(p.clone().add(new THREE.Vector3(0,1,0)));camera.far=1500;camera.updateProjectionMatrix();scene.fog.density=.0006;westernHighlands.update(0);graphicsQuality.apply('balanced');graphicsQuality.update(1);itemReceipts.element.hidden=true;renderer.render(scene,camera);})()`);
 const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
 }
 }
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));assert.deepEqual(errors,[]);assert(report.checks.every(c=>c.ok),'Terrain checks pass');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
