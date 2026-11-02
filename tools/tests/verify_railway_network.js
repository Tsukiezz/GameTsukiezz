// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.join(os.tmpdir(),'tsuventure-mangrove-verification');
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
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,200),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(`(()=>{
        enterGame();setGraphicsProfile('low');const r=moonRailway,checks=[],check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name);};
        check(r.network.edges.length>=24&&r.network.junctions.length>=8,'Dense connected rail graph with real junctions');
        check(r.stations.length===10&&r.networkPaths.length>30,'Ten stations and curved branch tracks rendered');
        check(r.stops.length>=r.stations.length,'Stations recognized on repeated shared tracks');
        r.travel(0);check(!r.requests.length&&r.state==='moving','Travel does not automatically stop train');r.requestStop(0);let n=0;while(r.state!=='stopped'&&n++<4000)r.update(.5);check(r.stationIndex===0&&r.state==='stopped','Train calls at requested station');
        r.toggleRide();check(r.aboard&&r.passenger.coach===1,'Boards first coach');
        const move=(x,z,steps=1)=>{for(let i=0;i<steps;i++){const car=r.vehicles[r.passenger.coach];car.updateWorldMatrix(true,false);const delta=new THREE.Vector3(x,0,z).applyQuaternion(car.getWorldQuaternion(new THREE.Quaternion()));movePlayerWithCollisions(delta.x,delta.z);updatePlayerVertical(1/60);}};
        move(0,.08,15);check(r.passenger.z>1,'Actual movement walks along aisle instead of locking position');
        r.chooseSeat(0);check(r.passenger.seat===0&&isSitting&&r.passenger.x<0,'Can select left window seat');r.updateCamera();let eye=r.vehicles[1].worldToLocal(camera.position.clone());check(eye.x<0&&eye.y<5,'Seated camera stays by window below roof');
        r.chooseSeat(7);check(r.passenger.seat===7&&r.passenger.x>0,'Can choose a different seat');r.standPassenger();check(r.passenger.seat===null&&!isSitting&&r.passenger.x===0,'Stand returns safely to aisle');
        move(0,-.08,400);check(r.passenger.coach===3,'Can walk through gangways to third coach');check(r.gangways.length===2,'Both carriage connectors have visible decks and guardrails');
        move(0,.08,600);check(r.passenger.coach===1&&r.passenger.z<=5.75,'Can return to first coach and cannot leave through locomotive');
        move(.08,0,100);check(Math.abs(r.passenger.x)<1.8,'Cannot walk through carriage side');
        r.chooseSeat(2);const local={coach:r.passenger.coach,x:r.passenger.x,z:r.passenger.z};r.update(r.remaining);for(let i=0;i<200;i++)r.update(.1);check(r.passenger.coach===local.coach&&r.passenger.x===local.x&&r.passenger.z===local.z,'Chosen seat is carried with moving train');
        r.standPassenger();const before=r.passenger.z;move(0,-.08,15);check(r.passenger.z<before-.5,'Walking works while train moves');const floor=r.passenger.coach;r.updateCamera();const p=r.vehicles[floor].worldToLocal(playerGroup.position.clone());check(Math.abs(p.y-1.92)<.05,'Passenger stays on moving coach floor');
        const destination=(r.stationIndex+2)%r.stations.length;check(r.requestStop(destination),'Can request destination from any coach');n=0;while(r.state!=='stopped'&&n++<4000)r.update(.5);check(r.stationIndex===destination,'Requested destination served through network');r.toggleRide();check(!r.aboard&&playerGroup.visible&&!isSitting,'Exit restores visible walking character');
        r.travel(0);gameState.inDialogue=true;const st=r.stations[0];camera.position.copy(st.model.localToWorld(new THREE.Vector3(54,30,65)));camera.lookAt(st.model.localToWorld(new THREE.Vector3(12,3,0)));renderer.render(scene,camera);
        return {checks,edges:r.network.edges.length,junctions:r.network.junctions.length,stations:r.stations.length,patrolLength:r.length};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'network-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    await evaluate(`(()=>{gameState.inDialogue=false;const r=moonRailway;r.travel(0);r.requestStop(0);let i=0;while(!(r.state==='stopped'&&r.stationIndex===0)&&i++<4000)r.update(.5);r.toggleRide();camYaw=r.vehicles[1].rotation.y+Math.PI;camPitch=0;heroMotion.reset();renderer.domElement.focus();})()`);
    const start=await evaluate('moonRailway.passenger.z');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});let moved=false;for(let attempt=0;attempt<40;attempt++){await pause(250);moved=await evaluate('Math.abs(moonRailway.passenger.z-'+start+')>.2');if(moved)break;}if(!moved)console.error('Live movement state',await evaluate('({keys:{...keys},passenger:{...moonRailway.passenger},playing:gameState.isPlaying,dialogue:gameState.inDialogue,modal:!!document.querySelector(".modal-overlay.active"),focus:document.activeElement.tagName,sitting:isSitting,speed:heroMotion.state.speed})'));await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
    assert(await evaluate('Math.abs(moonRailway.passenger.z-'+start+')>.2'),'Real W input moves passenger within coach');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'c',code:'KeyC',windowsVirtualKeyCode:67});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'c',code:'KeyC',windowsVirtualKeyCode:67});assert(await evaluate('moonRailway.passenger.seat!==null'),'Real C input selects seat');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'c',code:'KeyC',windowsVirtualKeyCode:67});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'c',code:'KeyC',windowsVirtualKeyCode:67});assert(await evaluate('moonRailway.passenger.seat===null'),'Real C input stands up');
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(150);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Seat and destination controls fit mobile');
    console.log('Live W/C input and mobile controls verified');
    console.log('Dense rail network, walking between three coaches, seat choice and moving floor verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
