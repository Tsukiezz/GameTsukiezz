// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/autumn-upgrade');
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
    const root=path.resolve(__dirname,'../../demo');
    function collect(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?collect(path.join(directory,e.name)):[path.join(directory,e.name)]);}
    const assets=[path.join(root,'index.html'),...collect(path.join(root,'core')),...collect(path.join(root,'features'))];
    const assetFailures=[];
    for(const file of assets){const relative=path.relative(root,file).split(path.sep).map(encodeURIComponent).join('/');const response=await fetch(new URL(relative,url));if(response.status!==200||Number(response.headers.get('content-length'))!==fs.statSync(file).size)assetFailures.push(relative);await response.arrayBuffer();}
    assert.deepEqual(assetFailures,[],'All shipped files must load from the game server');
    let tabs;
    for(let i=0;i<80;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}
    assert(tabs,'Chrome debugger starts');
    const tab=tabs.find(t=>t.url.startsWith(url));assert(tab,'Current game opens');
    ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
    ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith(new URL(url).origin)&&message.params.response.status>=400&&!message.params.response.url.endsWith('/favicon.ico'))errors.push(message.params.response.url);if(pending.has(message.id)){const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);}};
    await cdp('Runtime.enable');await cdp('Network.enable');
    // Reload after attaching so early script errors and missing dynamic resources are observed.
    await cdp('Page.reload',{ignoreCache:true});
    let ready=false;
    for(let i=0;i<150;i++){ready=await evaluate('Boolean(window.fieldGuide&&window.treeWood&&window.desertRealm?.floors&&window.riverBoat&&window.moonRailway)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    assert(ready,'All current gameplay modules initialize');
    await pause(700);
    const state=await evaluate('({pyramidFloors:desertRealm.floors.levels.length,trains:moonRailway.trains.length,trees:treeWood.trees.length,boatSpeed:riverBoat.cruiseSpeed||12,heroArt:document.querySelector("#card-hero-ninja_yinyang img").getAttribute("src")})');
    assert.equal(state.pyramidFloors,13);assert.equal(state.trains,6);assert(state.trees>100);assert(state.heroArt.includes('portrait-art-v2.png'));assert.deepEqual(errors,[]);
    const result={assetsChecked:assets.length,assetFailures,state,errors};
    fs.writeFileSync(path.join(output,'cleanup-smoke.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
