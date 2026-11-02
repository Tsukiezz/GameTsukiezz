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
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, method==='Browser.close'?2000:120000);
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

    const report=await evaluate(`(()=>{const r=moonRailway,guards=[],grid=new Map(),matrix=new THREE.Matrix4();r.group.updateMatrixWorld(true);r.group.traverse(mesh=>{if(!mesh.isInstancedMesh||mesh.name!=='Railway_bridge')return;mesh.geometry.computeBoundingBox();if(mesh.geometry.boundingBox.max.y<.1)return;for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);const transform=matrix.clone().premultiply(mesh.matrixWorld),box=mesh.geometry.boundingBox.clone().applyMatrix4(transform),guard={geometry:mesh.geometry,transform,box};guards.push(guard);for(let x=Math.floor(box.min.x/32);x<=Math.floor(box.max.x/32);x++)for(let z=Math.floor(box.min.z/32);z<=Math.floor(box.max.z/32);z++){const k=x+','+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(guard);}}});
      const hits=[],dummy=new THREE.Object3D(),triangle=new THREE.Triangle();let samples=0;
      const parts=[...RAILWAY_ASSETS.models.engine,...RAILWAY_ASSETS.models.coach].map(part=>{const box=new THREE.Box3();for(const v of part.vertices)box.expandByPoint(new THREE.Vector3(...v));return {name:part.name,box};});
      for(const service of r.services)for(let distance=0;distance<service.length;distance+=3){const pose=r.vehiclePose(distance,service);dummy.position.copy(pose.position);dummy.rotation.set(pose.pitch,pose.yaw,0,'YXZ');dummy.updateMatrix();const inverse=dummy.matrix.clone().invert(),seen=new Set();samples++;for(let x=Math.floor(pose.position.x/32)-1;x<=Math.floor(pose.position.x/32)+1;x++)for(let z=Math.floor(pose.position.z/32)-1;z<=Math.floor(pose.position.z/32)+1;z++)for(const guard of grid.get(x+','+z)||[]){if(seen.has(guard))continue;seen.add(guard);const transform=inverse.clone().multiply(guard.transform),box=guard.geometry.boundingBox.clone().applyMatrix4(transform);for(const part of parts){if(!box.intersectsBox(part.box))continue;const g=guard.geometry;let collision=false;for(let k=0;k<g.index.count;k+=3){for(const [j,key] of [[0,'a'],[1,'b'],[2,'c']])triangle[key].fromBufferAttribute(g.attributes.position,g.index.getX(k+j)).applyMatrix4(transform);if(part.box.intersectsTriangle(triangle)){collision=true;break;}}if(collision){hits.push({line:service.id,distance,part:part.name,position:pose.position.toArray()});if(hits.length>=5)return {guards:guards.length,samples,hits};}}}}
      return {guards:guards.length,samples,hits};})()`);console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'guard-report.json'),JSON.stringify(report,null,2));assert.deepEqual(report.hits,[],'Locomotive and coaches must clear rendered bridge guards');assert.deepEqual(errors,[]);
}

main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});

