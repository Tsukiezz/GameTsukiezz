// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/realm-transit');
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
    ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith(new URL(url).origin)&&message.params.response.status>=400&&!message.params.response.url.endsWith('/favicon.ico'))errors.push(message.params.response.url);if(pending.has(message.id)){const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);}};
    await cdp('Runtime.enable');await cdp('Network.enable');
    let ready=false;
    for(let i=0;i<150;i++){ready=await evaluate('Boolean(window.realmTransitUpdate&&window.graphicsQuality)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    assert(ready,'All current gameplay modules initialize');
    await pause(700);
    console.log('Runtime ready. Auditing travel, crafting and combat');
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'realm_transit.browser.js'),'utf8'));
    fs.writeFileSync(path.join(output,'transit-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,wet:report.wet,minWater:report.minimumWater,stations:report.stations,bridges:report.bridges}));
    await evaluate('worldAtlas.open()');await pause(400);let shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'world-atlas.png'),Buffer.from(shot.data,'base64'));
    await cdp('Page.reload',{ignoreCache:true});for(let i=0;i<220;i++){if(await evaluate('Boolean(window.realmTransitUpdate&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    const restored=await evaluate(`(()=>{gameState.isPlaying=true;gameState.inDialogue=false;document.querySelectorAll('.modal-overlay.active').forEach(n=>n.classList.remove('active'));fastTravelTo(0,10,'Starvation check');gameState.health=100;gameState.armor=200;for(let i=0;i<21;i++)monsterCamps.update(.1);const hungryHealth=gameState.health;monsterCamps.add('meat',1);monsterCamps.eat();for(let i=0;i<30;i++)monsterCamps.update(.1);return {equipment:technologyCraft.state,maxArmor:gameState.maxArmor,hungryHealth,healthAfterFood:gameState.health,hunger:monsterCamps.hunger};})()`);
    assert(restored.hungryHealth<=97&&restored.hungryHealth>=94,'Zero hunger drains health');assert.equal(restored.healthAfterFood,restored.hungryHealth,'Food stops starvation');assert(restored.hunger>39);assert(restored.equipment.ironOwned&&restored.equipment.divingOwned);assert.equal(restored.maxArmor,200);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));console.log('Persistence, starvation and food recovery passed');

}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
