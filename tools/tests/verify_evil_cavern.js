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
    '--headless=new', '--remote-debugging-port=9415', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9415/json')).json(); break; } catch { await pause(250); }
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
        ready = await evaluate('Boolean(window.evilCavern && window.fieldGuide)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,200),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(fs.readFileSync(path.join(__dirname,'evil_cavern_checks.js'),'utf8'));
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'evil-cavern-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    await evaluate("evilCavern.travel();gameState.inDialogue=true;setGraphicsProfile('balanced');camera.position.set(145,15,-82);camera.lookAt(125,3,-109);playerSurvival.environment();renderer.render(scene,camera);");
    let shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'evil-cavern-entrance.png'),Buffer.from(shot.data,'base64'));
    await evaluate("playerGroup.position.copy(evilCavern.center(evilCavern.data.middle));camera.position.copy(playerGroup.position).add(new THREE.Vector3(0,2,4));camera.lookAt(playerGroup.position);evilCavern.environment();renderer.render(scene,camera);");
    shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'evil-cavern-absolute-darkness.png'),Buffer.from(shot.data,'base64'));
    const darkness=await evaluate(`(()=>{const target=new THREE.WebGLRenderTarget(80,50),old=renderer.getRenderTarget(),pixels=new Uint8Array(80*50*4);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,80,50,pixels);renderer.setRenderTarget(old);target.dispose();let max=0;for(let i=0;i<pixels.length;i+=4)max=Math.max(max,pixels[i],pixels[i+1],pixels[i+2]);return max;})()`);assert(darkness<=1,'Actual cave render has no leaked light');
    // A separate diagnostic studio render shows geometry without changing the unlit game.
    const diagnostic=await evaluate(`(()=>{
        const stage=new THREE.Scene();stage.background=new THREE.Color(0x101522);stage.add(new THREE.HemisphereLight(0xffffff,0x555555,2));const light=new THREE.DirectionalLight(0xffead4,2);light.position.set(100,100,50);stage.add(light);
        const bins=new Map();for(const p of evilCavern.data.parts.filter(p=>!p.name.includes('Roof'))){if(!bins.has(p.material))bins.set(p.material,{v:[],i:[]});const b=bins.get(p.material),offset=b.v.length/3;b.v.push(...p.vertices.flat());b.i.push(...p.indices.map(i=>i+offset));}
        for(const [name,b] of bins){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.v,3));g.setIndex(b.i);g.computeVertexNormals();const material=new THREE.MeshStandardMaterial({color:new THREE.Color(...evilCavern.data.materials[name]),roughness:.9});stage.add(new THREE.Mesh(g,material));}
        const cam=new THREE.PerspectiveCamera(45,1.6,.1,1500);cam.position.set(125,400,-270);cam.lookAt(125,-44,-270);const target=new THREE.WebGLRenderTarget(1280,800),old=renderer.getRenderTarget(),pixels=new Uint8Array(1280*800*4);renderer.setRenderTarget(target);renderer.render(stage,cam);renderer.readRenderTargetPixels(target,0,0,1280,800,pixels);renderer.setRenderTarget(old);target.dispose();const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=800;const ctx=canvas.getContext('2d'),data=ctx.createImageData(1280,800);for(let y=0;y<800;y++)data.data.set(pixels.subarray((799-y)*1280*4,(800-y)*1280*4),y*1280*4);ctx.putImageData(data,0,0);return canvas.toDataURL();
    })()`);
    fs.writeFileSync(path.join(output,'evil-cavern-diagnostic-cutaway.png'),Buffer.from(diagnostic.split(',')[1],'base64'));
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(250);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Cave HUD fits mobile width');
    assert.deepEqual(errors,[]);assert(report.results.every(r=>r.ok));console.log('Cavern regression and actual pitch-black render verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
