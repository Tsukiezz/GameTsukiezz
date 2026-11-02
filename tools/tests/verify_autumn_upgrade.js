// Browser regression: real scene, shared movement function, no copied physics.
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
    fs.mkdirSync(output, { recursive: true });
    let tabs;
    for (let i = 0; i < 80; i++) {
        try { tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json(); break; } catch { await pause(250); }
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
        ready = await evaluate('Boolean(window.moonRailway && window.fieldGuide)');
        if (ready) break;
        if(errors.length)throw Error(errors.join('\n'));
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,200),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'autumn_upgrade.browser.js'),'utf8'));
    fs.writeFileSync(path.join(output,'adventure-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors},null,2));
    await evaluate("technologyBase.travel();gameState.inDialogue=true;camera.position.copy(technologyBase.center).add(new THREE.Vector3(90,60,120));camera.lookAt(technologyBase.center.clone().add(new THREE.Vector3(0,8,20)));renderer.render(scene,camera);");
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'technology.png'),Buffer.from(shot.data,'base64'));
    await evaluate("gameState.inDialogue=false;playerGroup.position.copy(technologyBase.bench.pos).z+=4;riverBoat.interact(technologyBase.bench);");
    await pause(400);const craftShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'crafting.png'),Buffer.from(craftShot.data,'base64'));
    await evaluate("closeModal('modal-technology-craft');backpack.open();inventoryLayout.toolbar.querySelector('[data-category=all]').click();");
    await pause(400);const inventoryShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'inventory.png'),Buffer.from(inventoryShot.data,'base64'));await evaluate("closeModal('modal-backpack');");
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate("backpack.open();inventoryLayout.toolbar.querySelector('[data-category=all]').click();");assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'Inventory fits mobile width');await pause(400);const mobileShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'inventory-mobile.png'),Buffer.from(mobileShot.data,'base64'));await evaluate("closeModal('modal-backpack');");await cdp('Emulation.clearDeviceMetricsOverride');
    const engineering=await evaluate(fs.readFileSync(path.join(__dirname,'export_three_services.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'engineering.json'),JSON.stringify(engineering));assert.deepEqual(errors,[]);
    await cdp('Page.reload',{ignoreCache:true});let restored=false;for(let i=0;i<100;i++){if(await evaluate('Boolean(window.riverBoat&&window.fieldGuide)')){restored=await evaluate('riverBoat.owned&&riverBoat.stock.wood===0&&!riverBoat.deployed');break;}await pause(300);}assert(restored,'Crafted inventory restored after actual page reload');fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
