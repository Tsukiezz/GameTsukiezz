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
        check(RAILWAY_ASSETS.source==='Blender'&&r.vehicles.length===4,'Blender locomotive and three coaches');
        check(r.stations.length===10&&r.driver.parent===r.vehicles[0],'Ten stations and royal NPC driver retained');
        check(r.state==='moving'&&!r.requests.length,'Train starts moving with no automatic stops');
        // Run more than a full unrequested lap: no station may stop the train.
        const start=r.distance;for(let i=0;i<Math.ceil((r.length+250)/42);i++){r.update(1);check(r.state==='moving','Unrequested pass '+i);}
        checks.splice(3,checks.length-3,'A full lap passes all unrequested stations');
        const ray=new THREE.Raycaster();
        for(let n=0;n<r.stations.length;n++){
            const st=r.stations[n];r.travel(n);check(!r.requests.length,'Travelling to a station does not call train '+n);
            const actual=ray;actual.set(st.platform.clone().add(new THREE.Vector3(0,100,0)),new THREE.Vector3(0,-1,0));st.model.updateWorldMatrix(true,true);const floor=st.model.children.find(m=>m.name.startsWith('Platform')&&!m.name.startsWith('PlatformStep'));const hit=actual.intersectObject(floor)[0];check(!!hit&&Math.abs(hit.point.y-st.platform.y)<.05,'Spawn matches visible platform '+n);
            const before=playerGroup.position.y;for(let i=0;i<120;i++)updatePlayerVertical(1/60);check(Math.abs(playerGroup.position.y-before)<.08,'Real gravity does not drop passenger through platform '+n);
            // Real movement across the public platform aisle.
            const forward=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),st.yaw);for(let k=0;k<50;k++){movePlayerWithCollisions(forward.x*.08,forward.z*.08);updatePlayerVertical(1/60);}check(playerGroup.position.distanceTo(st.platform)>2,'Player can walk on station platform '+n+' '+JSON.stringify({p:playerGroup.position.toArray(),spawn:st.platform.toArray(),bound:EXPANDED_REALM_DATA.bound,railBlocked:r.blocked(playerGroup.position.x,playerGroup.position.z,playerGroup.position.y),collision:checkCollision(playerGroup.position.x,playerGroup.position.z),river:riverRealm.canTraverse(playerGroup.position,playerGroup.position.x,playerGroup.position.z,false),volcano:volcanicValley.canTraverse(playerGroup.position,playerGroup.position.x,playerGroup.position.z,false)}));
            check(playerGroup.position.y>=st.platform.y-.1,'Walking stays above platform '+n);
            check(st.access&&st.access.waypoints.length>2,'Elevated station has connected stairs '+n);
            const under=st.platform.clone();under.y=r.terrainHeight(under.x,under.z);if(st.platform.y-under.y>2)check(r.support(under.x,under.z,under.y)<st.platform.y-.5,'Walking below station cannot teleport onto deck '+n);
            r.travel(n);document.getElementById('railway-wait').click();check(r.requests.includes(n),'Wait button calls this station '+n);
            let ticks=0;while(r.state!=='stopped'&&ticks++<4000)r.update(.5);
            check(r.state==='stopped'&&r.stationIndex===n,'Requested station receives train '+n);check(r.remaining>59&&r.remaining<=60,'Requested stop lasts 60 seconds '+n);
            r.toggleRide();check(r.aboard,'Boards coach at requested stop '+n);r.updateCamera();r.vehicles[1].updateMatrixWorld(true);const local=r.vehicles[1].worldToLocal(camera.position.clone());check(local.y>3&&local.y<4,'Camera remains inside coach '+n);
            r.toggleRide();check(!r.aboard&&Math.abs(playerGroup.position.y-st.platform.y)<.05,'Exits onto safe platform '+n);
            r.update(r.remaining-1);check(r.state==='stopped'&&Math.abs(r.remaining-1)<.001,'Still stopped at second 59 '+n);r.update(1);check(r.state==='moving','Departs after requested dwell '+n);
        }
        r.travel(0);check(!r.requestStop(1),'Cannot request another station from land');
        r.requestStop(0);let ticks=0;while(r.state!=='stopped'&&ticks++<4000)r.update(.5);r.toggleRide();check(r.requestStop(2),'Onboard passenger can request destination');
        r.update(r.remaining);ticks=0;while(r.state!=='stopped'&&ticks++<4000)r.update(.5);check(r.stationIndex===2,'Train skips unrequested intermediate station for selected destination');r.toggleRide();
        r.travel(0);gameState.inDialogue=true;const st=r.stations[0];camera.position.copy(st.model.localToWorld(new THREE.Vector3(53,28,65)));camera.lookAt(st.model.localToWorld(new THREE.Vector3(12,4,0)));scene.fog.density=.0003;renderer.render(scene,camera);
        return {checks,length:r.length};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'stations-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'stations.png'),Buffer.from(shot.data,'base64'));
    console.log('Rendered station foundations, real walking, wait requests, pass-throughs and 60-second stops verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
