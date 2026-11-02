// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?railway=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/dense-shared-services');
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
    if(process.argv.includes('--ui-only')){
        const selected=await evaluate(`(()=>{const r=moonRailway,result=[];for(const t of r.trains){r.travel(0);r.stationCalls.clear();r.trains.forEach(v=>v.requests.clear());const select=document.querySelector('#railway-line');select.value=t.id;select.dispatchEvent(new Event('change',{bubbles:true}));if(r.activeTrain.id!==t.id)throw Error('Line selection '+t.id);document.querySelector('#railway-wait').click();if(!t.requests.has(0)||r.trains.some(v=>v!==t&&v.requests.has(0))||!select.disabled)throw Error('Wait request must use selected line '+t.id);result.push(t.id);}r.stationCalls.clear();r.trains.forEach(v=>v.requests.clear());r.travel(0);return result;})()`);
        assert.deepEqual(selected,['red','blue','yellow']);
        await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
        assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Line selector fits mobile');
        fs.writeFileSync(path.join(output,'line-ui-report.json'),JSON.stringify({selected,mobile:true,errors},null,2));
        assert.deepEqual(errors,[]);console.log('Three line choices, real wait button and mobile layout verified');return;
    }

    const report=await evaluate(`(()=>{enterGame();setGraphicsProfile('low');const r=moonRailway,stations=r.stations.map(s=>({name:s.name,line:s.lineId,gap:s.platform.y-r.terrainHeight(s.platform.x,s.platform.z),planned:s.grounded}));const routes=r.trains.map(t=>{let low=0,flat=0,flatLow=0,high=0,maxTurn=0;const bends=[];for(const p of t.points){const floor=r.terrainHeight(p.x,p.z),gap=p.y-floor;if(gap<.8)low++;else high++;if(playerSurvival.surfaceAt(p.x,p.z)===null&&r.terrainHeight.maxOverRect(p.x,p.z,8)-floor<.4&&floor-Math.min(r.terrainHeight(p.x-8,p.z),r.terrainHeight(p.x+8,p.z),r.terrainHeight(p.x,p.z-8),r.terrainHeight(p.x,p.z+8))<.4){flat++;if(gap<.8)flatLow++;}}for(let d=0;d<t.length;d++){const a=r.pose(d,t),b=r.pose(d+1,t),turn=Math.abs(Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw)));if(turn>maxTurn){maxTurn=turn;bends.push({d,turn,p:a.position.toArray()});}}return {id:t.id,length:t.length,points:t.points.length,low,high,flat,flatLow,maxTurn,bends:bends.slice(-3)};});return {stations,routes,vehicles:r.allVehicles.length,physical:r.networkPaths.length};})()`);console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'three-services-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    const engineering=await evaluate(fs.readFileSync(path.join(__dirname,'export_three_services.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'engineering.json'),JSON.stringify(engineering));
    const acceptance=await evaluate(fs.readFileSync(path.join(__dirname,'three_services_acceptance.browser.js'),'utf8'));
    console.log(JSON.stringify(acceptance,null,2));fs.writeFileSync(path.join(output,'acceptance.json'),JSON.stringify(acceptance,null,2));
    assert.deepEqual(acceptance.geometryFailures,[],'Track geometry must pass every survey');
    await evaluate(`(()=>{const r=moonRailway;r.travel(0);gameState.inDialogue=true;const s=r.stations[0];camera.position.copy(s.model.localToWorld(new THREE.Vector3(55,22,66)));camera.lookAt(s.model.localToWorld(new THREE.Vector3(10,2,0)));scene.fog.density=.00025;renderer.render(scene,camera);})()`);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'station.png'),Buffer.from(shot.data,'base64'));
    assert.deepEqual(errors,[]);


}

main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});

