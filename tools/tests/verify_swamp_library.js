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
    '--headless=new', '--remote-debugging-port=9441', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9441/json')).json(); break; } catch { await pause(250); }
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

    const report=await evaluate(`(()=>{
        enterGame();const m=mangroveRealm,checks=[],check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name);};
        const kinds=['fish','turtle','crab','lotus','lotusFlower'];
        check(kinds.every(k=>fieldGuide.catalog.some(e=>e.id==='swamp_'+k&&e.type==='wildlife')),'All five swamp entries registered');
        check(kinds.every(k=>!fieldGuide.records['swamp_'+k]),'Unseen swamp wildlife stays locked');
        for(const kind of kinds){
            const id='swamp_'+kind,png=libraryPreviews.get(id);
            check(png?.startsWith('data:image/png;base64,')&&png.length>3000,'Real mesh portrait: '+kind);
            check(libraryPreviews.get(id)===png,'Cached portrait: '+kind);
            const a=m.life.populations[kind][0];playerGroup.position.copy(a.position).add(new THREE.Vector3(0,0,3));
            camera.position.copy(a.position).add(new THREE.Vector3(0,1,4));camera.lookAt(a.position);camera.updateMatrixWorld(true);
            playerSurvival.refresh();fieldGuide.update(.5);
            check(!!fieldGuide.records[id],'Nearby visible encounter: '+kind);
        }
        fieldGuide.open();document.querySelector('[data-category=wildlife]').click();
        check(kinds.every(k=>document.querySelector('[data-entry=swamp_'+k+'] img')),'Library displays all five portraits');
        return {checks};
    })()`);
    console.log(JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    await cdp('Page.reload',{ignoreCache:true});
    for(let i=0;i<100;i++){if(await evaluate('Boolean(window.fieldGuide&&window.mangroveRealm)'))break;await pause(250);}
    assert(await evaluate("['fish','turtle','crab','lotus','lotusFlower'].every(k=>!!fieldGuide.records['swamp_'+k])"),'All encounters persist after reload');
    console.log('Swamp library and persistence verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
