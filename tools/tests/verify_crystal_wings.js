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
    '--headless=new', '--remote-debugging-port=9396', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9396/json')).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.crystalWings && typeof playerGroup !== "undefined" && playerGroup)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({player:typeof playerGroup,castle:!!window.castlePhysics,monsters:!!window.lakeMonsters})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(fs.readFileSync(path.join(__dirname,'crystal_wings_checks.js'),'utf8'));
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'crystal-wings-report.json'),JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.deepEqual(errors,[]);
    await evaluate("fastTravelTo(crystalWings.approach.x,crystalWings.approach.z,'Crystal Wings Chest',-5);gameState.inDialogue=true;{const c=crystalWings.chest.position;camera.position.set(crystalWings.approach.x-.2,c.y+1.4,crystalWings.approach.z-.2);camera.lookAt(c.x,c.y+.6,c.z);}renderer.render(scene,camera);");
    let shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'crystal-wings-chest.png'),Buffer.from(shot.data,'base64'));
    await evaluate("gameState.inDialogue=false;fastTravelTo(35,35,'Wings preview');crystalWings.equip(true);playerGroup.position.y+=8;currentGroundY=playerGroup.position.y;isGrounded=false;crystalWings.toggleFlight();crystalWings.update(.1);checkInteractables();gameState.inDialogue=true;{const p=playerGroup.position;camera.position.set(p.x+1.7,p.y+1.2,p.z-2.5);camera.lookAt(p.x,p.y+.4,p.z);}renderer.render(scene,camera);");
    shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'crystal-wings-flight.png'),Buffer.from(shot.data,'base64'));
    await evaluate("gameState.inDialogue=false;backpack.open();");shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'crystal-wings-backpack.png'),Buffer.from(shot.data,'base64'));
    await evaluate("closeModal('modal-backpack');crystalWings.stopFlight();");
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await pause(300);
    const touch=await evaluate("(()=>{const r=crystalWings.touchButton.getBoundingClientRect(),p=document.querySelector('.hud-dpad').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,visible:r.width>0&&r.right<=390&&r.bottom<=844,overlap:!(r.left>=p.right||r.right<=p.left||r.top>=p.bottom||r.bottom<=p.top)};})()");
    assert(touch.visible&&!touch.overlap,'Touch flight control is visible and does not overlap movement pad');
    await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert(await evaluate('crystalWings.flying'),'Real touch input starts flight');
    await evaluate('backpack.open();document.getElementById("crystal-wings-item").scrollIntoView({block:"nearest"})');assert(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),'Mobile equipment card stays inside viewport');shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'crystal-wings-mobile.png'),Buffer.from(shot.data,'base64'));
    await cdp('Page.reload',{ignoreCache:true});
    let persisted=false;for(let i=0;i<120;i++){persisted=await evaluate('Boolean(window.crystalWings?.owned&&crystalWings.equipped&&crystalWings.model.visible&&!crystalWings.flying)');if(persisted)break;await pause(250);}
    assert(persisted,'Ownership and worn wings must survive a real page reload without auto-flying');assert.deepEqual(errors,[]);console.log('Real reload persistence passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
