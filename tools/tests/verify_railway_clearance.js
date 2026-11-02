// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/railway-clearance');
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
        enterGame();setGraphicsProfile('low');const r=moonRailway,check=(ok,name)=>{if(!ok)throw Error(name);};
        let maxGrade=0,minClearance=Infinity,bridges=0,water=0;
        for(let i=0;i<r.points.length;i++){
            const p=r.points[i],b=r.points[(i+1)%r.points.length],run=Math.hypot(b.x-p.x,b.z-p.z);
            maxGrade=Math.max(maxGrade,Math.abs(b.y-p.y)/run);check(p.y>=r.clearance.required.get(p.x.toFixed(2)+','+p.z.toFixed(2))-1e-4,'Required clearance '+i);
            check(r.obstacleSurvey.top(p.x,p.z,8,p.y+6.8,p.y-1.05)===-Infinity,'Train body and bridge deck clear surveyed geometry '+i);
            minClearance=Math.min(minClearance,p.y-r.terrainHeight(p.x,p.z));if(r.isBridge(p))bridges++;if(r.waterCrossings[i])water++;
        }
        check(maxGrade<=.06001,'Rail grade limited to six percent '+maxGrade);check(r.clearance.passes<200,'Profile converged');
        const stationBounds=RAILWAY_ASSETS.models.station.map(part=>{const box=new THREE.Box3();for(const v of part.vertices)box.expandByPoint(new THREE.Vector3(...v));return box;});
        for(const station of r.stations){station.model.updateWorldMatrix(true,false);const inverse=station.model.matrixWorld.clone().invert();const boxes=[...stationBounds,new THREE.Box3(new THREE.Vector3(-6,.58,-48),new THREE.Vector3(34,.72,48))];
            for(let d=0;d<r.length;d+=6){const pose=r.pose(d);if(pose.position.distanceTo(station.model.position)>105)continue;const object=new THREE.Object3D();object.position.copy(pose.position);object.rotation.set(pose.pitch,pose.yaw,0,'YXZ');object.updateMatrix();const box=new THREE.Box3(new THREE.Vector3(-2.45,.05,-6.7),new THREE.Vector3(2.45,6.6,6.7)).applyMatrix4(inverse.clone().multiply(object.matrix));
                for(let b=0;b<boxes.length;b++)check(!box.intersectsBox(boxes[b]),'Train clearance from station '+station.name+' part '+b+' distance '+d+' local '+JSON.stringify({min:box.min.toArray(),max:box.max.toArray()}));
            }
        }
        const walkResults=[];
        for(let i=0;i<r.stations.length;i++){
            const station=r.stations[i],access=station.access;check(Math.abs(access.entrance.y-r.terrainHeight(access.entrance.x,access.entrance.z))<.05,'Stair entrance touches actual ground '+i);playerGroup.position.copy(access.entrance);currentGroundY=playerGroup.position.y;isGrounded=true;jumpY=0;jumpVelocityY=0;heroMotion.reset();
            const trace=[];
            for(const target of access.waypoints){
                const delta=target.clone().sub(playerGroup.position),steps=Math.ceil(Math.hypot(delta.x,delta.z)/.06);
                for(let j=0;j<steps;j++){movePlayerWithCollisions(delta.x/Math.max(1,steps),delta.z/Math.max(1,steps));updatePlayerVertical(1/60);}
                check(Math.hypot(playerGroup.position.x-target.x,playerGroup.position.z-target.z)<.31&&Math.abs(playerGroup.position.y-target.y)<.31,'Walk up staircase '+i+' '+JSON.stringify({target:target.toArray(),actual:playerGroup.position.toArray(),entrance:access.entrance.toArray(),rise:access.rise}));
                trace.push({distance:Math.hypot(playerGroup.position.x-target.x,playerGroup.position.z-target.z),dy:playerGroup.position.y-target.y});
            }
            for(const target of [...access.waypoints].reverse()){
                const delta=target.clone().sub(playerGroup.position),steps=Math.ceil(Math.hypot(delta.x,delta.z)/.06);
                for(let j=0;j<steps;j++){movePlayerWithCollisions(delta.x/Math.max(1,steps),delta.z/Math.max(1,steps));updatePlayerVertical(1/60);}
                check(Math.hypot(playerGroup.position.x-target.x,playerGroup.position.z-target.z)<.31&&Math.abs(playerGroup.position.y-target.y)<.31,'Walk down staircase '+i+' '+JSON.stringify({target:target.toArray(),actual:playerGroup.position.toArray(),entrance:access.entrance.toArray(),rise:access.rise}));
            }
            walkResults.push({i,trace,maxError:Math.max(...trace.map(t=>Math.max(t.distance,Math.abs(t.dy)))),finish:playerGroup.position.toArray(),target:station.platform.toArray()});
        }
        check(walkResults.every(v=>v.maxError<.31),'Walk from ground to all ten platforms without jumping');
        const stations=r.stations.map((s,i)=>({i,name:s.name,y:s.platform.y,rise:s.access.rise,entrance:s.access.entrance.toArray(),steps:s.access.surfaces.length}));
        return {highest:[...r.points].sort((a,b)=>(r.clearance.required.get(b.x.toFixed(2)+','+b.z.toFixed(2))||0)-(r.clearance.required.get(a.x.toFixed(2)+','+a.z.toFixed(2))||0)).slice(0,5).map(p=>({p:p.toArray(),ground:r.terrainHeight(p.x,p.z),top:r.obstacleSurvey.top(p.x,p.z,10),boxes:r.obstacleSurvey.boxes.filter(b=>p.x+10>=b.min.x&&p.x-10<=b.max.x&&p.z+10>=b.min.z&&p.z-10<=b.max.z).map(b=>({min:b.min.toArray(),max:b.max.toArray()}))})),maxGrade,minClearance,bridges,water,pillars:r.pillars.length,obstacles:r.obstacleSurvey.boxes.length,passes:r.clearance.passes,walkResults,stations};
    })()`);
    console.log(JSON.stringify({maxGrade:report.maxGrade,minClearance:report.minClearance,bridges:report.bridges,water:report.water,pillars:report.pillars,obstacles:report.obstacles,passes:report.passes,walkErrors:report.walkResults.map(v=>v.maxError),stationRises:report.stations.map(v=>v.rise)},null,2));fs.writeFileSync(path.join(output,'clearance-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    const engineering=await evaluate(`(()=>{const r=moonRailway;return {bridgeSections:r.renderedBridgeSections.map(p=>({pathIndex:p.pathIndex,position:p.position.toArray(),yaw:p.yaw,pitch:p.pitch,widthScale:p.widthScale,guards:p.guards})),junctionDeckCells:[...r.junctionDeckCells.values()].map(p=>p.toArray()),junctions:r.junctions.map(j=>({id:j.id,center:j.center.toArray(),radius:j.radius})),bridgeFlags:r.networkPaths.map(path=>path.points.map(p=>r.isBridge(p)&&!r.junctions.some(j=>Math.hypot(p.x-j.center.x,p.z-j.center.z)<80))),paths:r.networkPaths.map(path=>path.points.map(p=>p.toArray())),pillars:r.pillars.map(p=>({position:p.position.toArray(),height:p.userData.height})),stations:r.stations.map(s=>({name:s.name,position:s.model.position.toArray(),yaw:s.yaw,access:{position:s.access.root.position.toArray(),surfaces:s.access.surfaces,solids:s.access.solids},slabTop:s.slabTop})),materials:RAILWAY_ASSETS.materials};})()`);
    fs.writeFileSync(path.join(output,'engineering.json'),JSON.stringify(engineering));
    for(const view of ['bridge','station']){
      await evaluate(`(()=>{const r=moonRailway;gameState.inDialogue=true;let p;if('${view}'==='bridge'){p=r.points.find(p=>r.isBridge(p)&&r.waterCrossings[r.points.indexOf(p)] )||r.points[0];camera.position.copy(p).add(new THREE.Vector3(50,35,50));camera.lookAt(p);}else{const s=r.stations[0];camera.position.copy(s.model.localToWorld(new THREE.Vector3(80,30,95)));camera.lookAt(s.model.localToWorld(new THREE.Vector3(25,-s.access.rise/2,25)));}scene.fog.density=.00025;renderer.render(scene,camera);})()`);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,view+'.png'),Buffer.from(shot.data,'base64'));
    }
}

main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});

