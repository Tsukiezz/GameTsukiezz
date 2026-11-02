// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?antarctic=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/world-ecology');
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
        pending.set(id, { resolve: v => { clearTimeout(timeout); resolve(v); }, reject:e=>{clearTimeout(timeout);reject(e);} });
        ws.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function main(){
    fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');for(let i=0;i<200;i++){if(await evaluate('Boolean(window.fieldGuide&&window.santaGifts)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    const report=await evaluate(`(async()=>{enterGame();setGraphicsProfile('potato');fastTravelTo(${Number(process.env.PERF_X||-700)},${Number(process.env.PERF_Z||2070)},'Performance');await new Promise(r=>setTimeout(r,2200));const times={},modules=['moonRailway','monsterCamps','livingWorld','pyramidInterior','riverRealm','worldSurface','fieldGuide','templeSupplies','antarcticRealm','santaGifts','backpack','treeWood','desertRealm'];for(const name of modules){const api=window[name];for(const method of ['update','clipCamera','environment','height'])if(typeof api?.[method]==='function'){const old=api[method].bind(api);api[method]=(...args)=>{const t=performance.now();const value=old(...args);const id=name+'.'+method;times[id]=(times[id]||0)+performance.now()-t;return value;};}}const originalRender=renderer.render.bind(renderer);renderer.render=(...args)=>{const t=performance.now();const v=originalRender(...args);times['renderer.render']=(times['renderer.render']||0)+performance.now()-t;return v;};let frames=0,previous=performance.now(),start=previous,deltas=[];await new Promise(resolve=>{function frame(t){deltas.push(t-previous);previous=t;frames++;if(t-start<5000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');return {fps:frames*1000/(previous-start),frames,duration:previous-start,times,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,renderSize:[renderer.domElement.width,renderer.domElement.height],gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unknown',errors:[]};})()`);fs.writeFileSync(path.join(output,process.env.PERF_NAME||'performance-before.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
