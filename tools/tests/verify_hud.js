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
    const results=[];const check=(name,ok,detail={})=>results.push({name,ok:!!ok,detail});
    await evaluate('enterGame();setGraphicsProfile("potato");');await pause(900);
    async function click(selector){const p=await evaluate(`(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});await pause(100);}
    for(const [name,width,height,mobile] of [['desktop',1280,800,false],['wide',1920,1080,false],['tablet',768,1024,false],['mobile',390,844,true],['landscape',844,390,true]]){
        await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
        await cdp('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:5});await pause(350);
        const layout=await evaluate(`(() => {
            gameHUD.closePanels();
            const selectors=['.player-status-card','.hud-actions','.hud-landmark-indicator','.hud-minimap-card','.hud-quickbar','.hud-touch-controls'];
            const boxes=selectors.map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom,visible:s.display!=='none'&&r.width>0&&r.height>0};});
            const a=boxes[0],b=boxes[1];return {boxes,headerOverlap:Math.min(a.right,b.right)>Math.max(a.x,b.x)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.y,b.y)+1,overflow:document.documentElement.scrollWidth>innerWidth};
        })()`);
        check(name+' has no page overflow',!layout.overflow,layout);
        check(name+' status and menu do not overlap',!layout.headerOverlap,layout);
        check(name+' HUD stays inside screen',layout.boxes.filter(b=>b.visible).every(b=>b.x>=-1&&b.y>=-1&&b.right<=width+1&&b.bottom<=height+1),layout);
        await click('#hud-travel summary');
        const panel=await evaluate(`(() => {const e=document.querySelector('.hud-travel-content'),r=e.getBoundingClientRect();return {open:gameHUD.travel.open,count:e.querySelectorAll('.tour-btn').length,x:r.x,right:r.right,bottom:r.bottom,top:r.top,scrollable:e.scrollHeight>e.clientHeight};})()`);
        check(name+' destinations are accessible in a bounded panel',panel.open&&panel.count===16&&panel.x>=0&&panel.right<=width+1&&panel.top>=0&&panel.bottom<=height+1,panel);
        await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await pause(80);
        check(name+' escape closes destination panel',await evaluate('!gameHUD.travel.open'));
        await evaluate('document.getElementById("hud-toast").style.display="none"');
        const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'hud-'+name+'.png'),Buffer.from(shot.data,'base64'));
    }
    await evaluate('fastTravelTo(115,100,"Arena",.35)');
    const touchPoint=await evaluate("(() => {const r=document.querySelector('[data-move=forward]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:1};})()");
    await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint]});await pause(180);
    check('Touch direction holds movement',await evaluate('keys.forward'));
    await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(50);
    check('Releasing touch stops movement',await evaluate('!keys.forward'));
    await evaluate('gameState.inDialogue=true');await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint]});check('Touch movement respects dialogue',await evaluate('!keys.forward'));await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await evaluate('gameState.inDialogue=false');
    const yaw=await evaluate('camYaw');
    await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:410,y:200,id:2}]});
    await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:450,y:210,id:2}]});
    await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    check('Dragging the game view turns camera',Math.abs((await evaluate('camYaw'))-yaw)>.1);
    await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});await pause(100);
    await evaluate('keys.forward=true;isAttacking=false;');await click('#hud-travel summary');
    check('Opening menus clears held movement and does not attack',await evaluate('!keys.forward&&!isAttacking&&gameHUD.travel.open'));
    const before=await evaluate('camDistance');await evaluate("document.querySelector('.hud-travel-content').dispatchEvent(new WheelEvent('wheel',{deltaY:150,bubbles:true}))");
    check('Scrolling menus does not zoom the camera',await evaluate('camDistance')===before);
    await evaluate("document.querySelectorAll('#hud-travel .tour-btn')[1].click()");
    check('Arena travel works and closes the panel',await evaluate('Math.abs(playerGroup.position.x-115)<.01&&Math.abs(playerGroup.position.z-72)<.01&&!gameHUD.travel.open'));
    await click('#hud-heroes-button');
    check('Hero selection opens without an attack',await evaluate('document.getElementById("modal-heroes").classList.contains("active")&&!isAttacking'));
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});check('Modal keyboard does not move player',await evaluate('!keys.forward'));await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
    check('Escape dismisses hero selection',await evaluate('!document.getElementById("modal-heroes").classList.contains("active")'));
    await evaluate("keys.forward=true;window.dispatchEvent(new Event('blur'))");check('Losing focus releases movement keys',await evaluate('!keys.forward'));
    await evaluate('returnToHome()');check('HUD is completely hidden on home',await evaluate('getComputedStyle(gameHud).display==="none"'));
    const report={results,errors};fs.writeFileSync(path.join(output,'hud-report.json'),JSON.stringify(report,null,2));
    for(const r of results.filter(r=>!r.ok))console.error('FAIL',r.name,JSON.stringify(r.detail));
    console.log(results.filter(r=>r.ok).length+'/'+results.length+' HUD checks passed');
    assert(results.every(r=>r.ok),'HUD layout and interactions pass');assert.equal(errors.length,0,'No runtime errors');

}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
