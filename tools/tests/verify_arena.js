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
    console.log('Game scene initialized; running arena checks');
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'arena_checks.js'),'utf8'));
    report.errors=errors;
    fs.writeFileSync(path.join(output,'arena-report.json'),JSON.stringify(report,null,2));
    for(const r of report.results.filter(r=>!r.ok)) console.error('FAIL',r.name,JSON.stringify(r.detail));
    console.log(report.results.filter(r=>r.ok).length+'/'+report.results.length+' arena checks passed');
    if(process.env.EXPORT_ARENA_BLEND==='1'){
    const exportSize=await evaluate(`(() => {
        const materials={},parts=[];
        function add(m,index,offset){
            const material=m.material,key=material.name||material.uuid;
            if(!materials[key])materials[key]={color:[material.color.r,material.color.g,material.color.b],roughness:material.roughness??1,
                image:material.map?.image instanceof HTMLCanvasElement?material.map.image.toDataURL('image/png'):null};
            m.updateMatrixWorld(true);const g=m.geometry,p=g.attributes.position,positions=[],uv=g.attributes.uv;
            for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(!m.parent && offset.x!==0)v.add(offset);positions.push(v.x,v.y,v.z);}
            let category='Arcades';const x=m.position.x,z=m.position.z;
            if(offset.x===0)category='MoonSafety';
            else if(z< -36)category='TicketCourtyard';
            else if(x>40&&x<48&&Math.abs(z)<10)category='VIP';
            else if(m.position.y<1&&Math.hypot(x/1.15,z/.9)<23)category='ArenaFloor';
            else if(m.geometry.type==='BufferGeometry')category='Cavea';
            parts.push({name:'arena-'+category+'-'+index,material:key,category,positions,
                indices:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),uv:uv?Array.from(uv.array):null});
        }
        romanArena.editParts.forEach((m,i)=>add(m,i,new THREE.Vector3(115,0,110)));
        for(const root of [romanArena.details.gateGroup,...romanArena.tunnels.map(t=>t.gate)])root.traverse(m=>{if(m.isMesh)add(m,parts.length,new THREE.Vector3(115,0,110));});
        add(moonSafetyLayer.mesh,romanArena.editParts.length,new THREE.Vector3());
        window.__arenaExport=JSON.stringify({materials,parts});return window.__arenaExport.length;
    })()`);
    const runtime=path.resolve(__dirname,'../../.runtime');fs.mkdirSync(runtime,{recursive:true});
    const chunks=[];for(let offset=0;offset<exportSize;offset+=250000)chunks.push(await evaluate('window.__arenaExport.slice('+offset+','+(offset+250000)+')'));
    fs.writeFileSync(path.join(runtime,'arena-scene.json'),chunks.join(''));
    await evaluate('delete window.__arenaExport');
    console.log('Blender geometry exported',exportSize,'bytes');
    }
    for(const [name,x,y,z,yaw,pitch] of [['arena-entrance',115,.35,72,Math.PI,-.12],['arena-interior',115,.35,100,Math.PI,-.1],['arena-stands',115,12.35,140.2,0,.2],['arena-vip',115,12.35,142,0,.1],['arena-tickets',122,.35,66,Math.PI,-.12],['arena-overview',115,26,61,Math.PI,.3]]) {
        await evaluate(`playerGroup.position.set(${x},${y},${z});currentGroundY=${y};isGrounded=true;jumpVelocityY=0;castleSafeAnchor=null;camYaw=${yaw};camPitch=${pitch};camDistance=3;scene.updateMatrixWorld(true);camera.position.copy(clipCastleCamera(new THREE.Vector3(${x},${y}+.45,${z}),new THREE.Vector3(${x}+Math.sin(${yaw})*2.7,${y}+1.1,${z}+Math.cos(${yaw})*2.7)));`);
        await pause(1800);console.log(name,JSON.stringify(await evaluate('({player:playerGroup.position.toArray(),camera:camera.position.toArray(),distance:camera.position.distanceTo(playerGroup.position)})')));const shot=await cdp('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    const overview=await evaluate("camera.position.set(176,43,53);camera.lookAt(115,7,110);renderer.render(scene,camera);renderer.domElement.toDataURL('image/png')");
    fs.writeFileSync(path.join(output,'arena-overview.png'),Buffer.from(overview.split(',')[1],'base64'));
    assert(report.results.every(r=>r.ok),'All arena checks pass');
    assert.equal(errors.length,0,'No browser runtime errors');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
