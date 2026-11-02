// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/railway-junctions');
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
        const surfaces=[ground,riverRealm.terrain,bachKhuyet.terrain,volcanicValley.terrain,mangroveRealm.terrain,ancientGrove.group.getObjectByName('GroveForestFloor')];
        livingWorld.group.traverse(o=>o.visible=true);const liveSurvey=surveyRailwayObstacles(scene,surfaces);
        check(r.obstacleSurvey.largeMeshes.some(m=>m.name==='ThermalArchitecture_wood')&&r.obstacleSurvey.largeMeshes.some(m=>m.name==='PrimordialTitaniumFence'),'Large merged architecture is included');
        for(const p of r.points)if(liveSurvey.top(p.x,p.z,8,p.y+7,p.y-1.05)!==-Infinity){const boxes=liveSurvey.boxes.filter(b=>b.min.y<=p.y+7&&b.max.y>=p.y-1.05&&p.x+8>=b.min.x&&p.x-8<=b.max.x&&p.z+8>=b.min.z&&p.z-8<=b.max.z);throw Error('Live scene obstruction '+JSON.stringify({p:p.toArray(),boxes:boxes.slice(0,10).map(b=>({source:b.source,min:b.min.toArray(),max:b.max.toArray()}))}));}
        let maxGrade=0,minClearance=Infinity,bridges=0,water=0;
        for(let i=0;i<r.points.length;i++){
            const p=r.points[i],b=r.points[(i+1)%r.points.length],run=Math.hypot(b.x-p.x,b.z-p.z);
            maxGrade=Math.max(maxGrade,Math.abs(b.y-p.y)/run);check(p.y>=r.clearance.required.get(p.x.toFixed(2)+','+p.z.toFixed(2))-1e-4,'Required clearance '+i);
            check(r.obstacleSurvey.top(p.x,p.z,8,p.y+7,p.y-1.05)===-Infinity,'Train body and bridge deck clear surveyed geometry '+i);
            minClearance=Math.min(minClearance,p.y-r.terrainHeight(p.x,p.z));if(r.isBridge(p))bridges++;if(r.waterCrossings[i])water++;
        }
        check(maxGrade<=.06001,'Rail grade limited to six percent '+maxGrade);check(r.clearance.passes<200,'Profile converged');
        const topology={segments:0,nearPairs:0,junctionPairs:0,conflicts:[]},segments=[],cells=new Map(),visited=new Set();
        const project=(p,a,b)=>Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.z-a.z)*(b.z-a.z))/((b.x-a.x)**2+(b.z-a.z)**2)));
        function closest(a,b,c,d){const ux=b.x-a.x,uz=b.z-a.z,vx=d.x-c.x,vz=d.z-c.z,den=ux*vz-uz*vx;
            if(Math.abs(den)>1e-8){const t=((c.x-a.x)*vz-(c.z-a.z)*vx)/den,u=((c.x-a.x)*uz-(c.z-a.z)*ux)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return {gap:0,p:a.clone().lerp(b,t),q:c.clone().lerp(d,u)};}
            const pairs=[[a,c.clone().lerp(d,project(a,c,d))],[b,c.clone().lerp(d,project(b,c,d))],[a.clone().lerp(b,project(c,a,b)),c],[a.clone().lerp(b,project(d,a,b)),d]];return pairs.map(([p,q])=>({gap:Math.hypot(p.x-q.x,p.z-q.z),p,q})).sort((u,v)=>u.gap-v.gap)[0];
        }
        for(let path=0;path<r.networkPaths.length;path++)for(let i=0;i<r.networkPaths[path].points.length-1;i++){
            const [a,b]=[r.networkPaths[path].points[i],r.networkPaths[path].points[i+1]],segment={a,b,path,i,id:segments.length};segments.push(segment);
            for(let x=Math.floor((Math.min(a.x,b.x)-8)/32);x<=Math.floor((Math.max(a.x,b.x)+8)/32);x++)for(let z=Math.floor((Math.min(a.z,b.z)-8)/32);z<=Math.floor((Math.max(a.z,b.z)+8)/32);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(segment);}
        }
        for(const list of cells.values())for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
            const a=list[i],b=list[j];if(a.path===b.path&&Math.abs(a.i-b.i)<16)continue;const key=Math.min(a.id,b.id)+','+Math.max(a.id,b.id);if(visited.has(key))continue;visited.add(key);const hit=closest(a.a,a.b,b.a,b.b);if(hit.gap>=13.0)continue;topology.nearPairs++;
            const hub=r.junctions.find(h=>Math.hypot(hit.p.x-h.center.x,hit.p.z-h.center.z)<84&&Math.hypot(hit.q.x-h.center.x,hit.q.z-h.center.z)<84);
            if(hub&&Math.abs(hit.p.y-hit.q.y)<.03){topology.junctionPairs++;continue;}
            if(topology.conflicts.length<20)topology.conflicts.push({paths:[a.path,b.path],gap:hit.gap,p:hit.p.toArray(),q:hit.q.toArray(),hub:hub?.id});
        }
        topology.segments=segments.length;check(!topology.conflicts.length,'Rail corridors overlap or intersect outside a level junction '+JSON.stringify(topology.conflicts));
        for(const pier of r.pillars){const bottom=pier.position.y-pier.scale.y/2,top=pier.position.y+pier.scale.y/2;check(r.obstacleSurvey.top(pier.position.x,pier.position.z,1,top,bottom)<bottom+.25,'Pier cuts through old structure');}
        for(let distance=0;distance<r.length;distance+=6){const pose=r.pose(distance),object=new THREE.Object3D();object.position.copy(pose.position);object.rotation.set(pose.pitch,pose.yaw,0,'YXZ');object.updateMatrix();for(const x of [-2.15,2.15])for(const z of [-4,4]){const foot=new THREE.Vector3(x,.02,z).applyMatrix4(object.matrix);check(foot.y>=r.terrainHeight(foot.x,foot.z)-.03,'Actual pitched wheel intersects terrain '+distance);}}
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
        const bridge=r.renderedBridgeSections.find(p=>p.guards&&Math.abs(p.pitch)<.005&&playerSurvival.surfaceAt(p.position.x,p.position.z)===null&&p.position.y-r.terrainHeight(p.position.x,p.position.z)>3);check(!!bridge,'A land bridge is available for walking audit');
        const side=new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),bridge.yaw);playerGroup.position.copy(bridge.position).addScaledVector(side,4.6);playerGroup.position.y-=.2;currentGroundY=playerGroup.position.y;isGrounded=true;jumpY=0;jumpVelocityY=0;playerSurvival.refresh();const bridgeY=playerGroup.position.y;for(let i=0;i<90;i++)updatePlayerVertical(1/60);check(Math.abs(playerGroup.position.y-bridgeY)<.1,'Wide bridge walkway has a real matching floor');for(let i=0;i<70;i++){movePlayerWithCollisions(side.x*.05,side.z*.05);updatePlayerVertical(1/60);}const lateral=playerGroup.position.clone().sub(bridge.position).dot(side);check(lateral>4.7&&lateral<5.7&&Math.abs(playerGroup.position.y-bridgeY)<.1,'Guard prevents falling off the widened bridge '+JSON.stringify({lateral,y:playerGroup.position.y,bridgeY,bridge:bridge.position.toArray()}));
        const stations=r.stations.map((s,i)=>({i,name:s.name,y:s.platform.y,rise:s.access.rise,entrance:s.access.entrance.toArray(),steps:s.access.surfaces.length}));
        return {liveObstacles:liveSurvey.boxes.length,largeMeshes:r.obstacleSurvey.largeMeshes,topology,highest:[...r.points].sort((a,b)=>(r.clearance.required.get(b.x.toFixed(2)+','+b.z.toFixed(2))||0)-(r.clearance.required.get(a.x.toFixed(2)+','+a.z.toFixed(2))||0)).slice(0,5).map(p=>({p:p.toArray(),ground:r.terrainHeight(p.x,p.z),top:r.obstacleSurvey.top(p.x,p.z,10),boxes:r.obstacleSurvey.boxes.filter(b=>p.x+10>=b.min.x&&p.x-10<=b.max.x&&p.z+10>=b.min.z&&p.z-10<=b.max.z).map(b=>({min:b.min.toArray(),max:b.max.toArray()}))})),maxGrade,minClearance,bridges,water,pillars:r.pillars.length,obstacles:r.obstacleSurvey.boxes.length,passes:r.clearance.passes,walkResults,stations};
    })()`);
    console.log(JSON.stringify({topology:report.topology,maxGrade:report.maxGrade,minClearance:report.minClearance,bridges:report.bridges,water:report.water,pillars:report.pillars,obstacles:report.obstacles,passes:report.passes,walkErrors:report.walkResults.map(v=>v.maxError),stationRises:report.stations.map(v=>v.rise)},null,2));fs.writeFileSync(path.join(output,'clearance-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    const engineering=await evaluate(`(()=>{const r=moonRailway;return {bridgeSections:r.renderedBridgeSections.map(p=>({pathIndex:p.pathIndex,position:p.position.toArray(),yaw:p.yaw,pitch:p.pitch,widthScale:p.widthScale,guards:p.guards})),junctionDeckCells:[...r.junctionDeckCells.values()].map(p=>p.toArray()),junctions:r.junctions.map(j=>({id:j.id,center:j.center.toArray(),radius:j.radius})),bridgeFlags:r.networkPaths.map(path=>path.points.map(p=>r.isBridge(p)&&!r.junctions.some(j=>Math.hypot(p.x-j.center.x,p.z-j.center.z)<80))),paths:r.networkPaths.map(path=>path.points.map(p=>p.toArray())),pillars:r.pillars.map(p=>({position:p.position.toArray(),height:p.userData.height})),stations:r.stations.map(s=>({name:s.name,position:s.model.position.toArray(),yaw:s.yaw,access:{position:s.access.root.position.toArray(),surfaces:s.access.surfaces,solids:s.access.solids},slabTop:s.slabTop})),materials:RAILWAY_ASSETS.materials};})()`);
    fs.writeFileSync(path.join(output,'engineering.json'),JSON.stringify(engineering));
    for(const view of ['bridge','station','junction']){
      await evaluate(`(()=>{const r=moonRailway;gameState.inDialogue=true;let p;if('${view}'==='junction'){const j=r.junctions.find(j=>r.network.junctions.includes(j.id));const v=r.points.find(p=>Math.hypot(p.x-j.center.x,p.z-j.center.z)<60);p=new THREE.Vector3(j.center.x,v.y,j.center.z);camera.position.copy(p).add(new THREE.Vector3(115,100,115));camera.lookAt(p);}else if('${view}'==='bridge'){p=r.points.find(p=>r.isBridge(p)&&r.waterCrossings[r.points.indexOf(p)] )||r.points[0];camera.position.copy(p).add(new THREE.Vector3(50,35,50));camera.lookAt(p);}else{const s=r.stations[0];camera.position.copy(s.model.localToWorld(new THREE.Vector3(80,30,95)));camera.lookAt(s.model.localToWorld(new THREE.Vector3(25,-s.access.rise/2,25)));}scene.fog.density=.00025;renderer.render(scene,camera);})()`);
      const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,view+'.png'),Buffer.from(shot.data,'base64'));
    }
    report.reloadAudits=[];
    for(let attempt=0;attempt<2;attempt++){
        const oldOrigin=await evaluate('performance.timeOrigin'),next=new URL(url);next.searchParams.set('rail_audit_reload',String(attempt));await cdp('Page.navigate',{url:next.href});
        let loaded=false;for(let n=0;n<120;n++){try{loaded=await evaluate('performance.timeOrigin!=='+oldOrigin+'&&Boolean(window.moonRailway&&window.fieldGuide&&window.livingWorld)');}catch{}if(loaded)break;await pause(250);}assert(loaded,'Fresh game scene reloads');
        const audit=await evaluate(`(()=>{gameState.inDialogue=true;const r=moonRailway;livingWorld.group.traverse(o=>o.visible=true);const live=surveyRailwayObstacles(scene,[ground,riverRealm.terrain,bachKhuyet.terrain,volcanicValley.terrain,mangroveRealm.terrain,ancientGrove.group.getObjectByName('GroveForestFloor')]);for(const p of r.points)if(live.top(p.x,p.z,8,p.y+7,p.y-1.05)!==-Infinity)throw Error('New random flora overlaps railway '+JSON.stringify(p.toArray()));return {objects:live.boxes.length,plants:livingWorld.placements.length,points:r.points.length};})()`);
        report.reloadAudits.push(audit);
    }
    fs.writeFileSync(path.join(output,'clearance-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);console.log('Two fresh random-flora reloads also clear');

}

main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});

