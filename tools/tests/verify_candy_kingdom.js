// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/candy-kingdom');
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
async function main(){
 fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const text=m.params.args.map(a=>a.value||a.description||'').join(' ');if(/WebGLProgram|shader error|VALIDATE_STATUS/i.test(text))errors.push(text);}if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');console.log('Chrome connected');let ready=false;for(let i=0;i<300;i++){ready=await evaluate('Boolean(window.realmScenery&&window.graphicsQuality)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}assert(ready);console.log('World ready');const report=process.env.GAME_VERIFY_VISUAL_ONLY?await evaluate("(()=>{gameState.isPlaying=true;gameState.inDialogue=true;document.getElementById('home-screen').style.display='none';applyHeroSelection('hamster');return {checks:[],center:candyRealm.center.toArray(),stations:moonRailway.stations.length,elevated:moonRailway.stations.filter(s=>!s.grounded).length}})()"):await evaluate(fs.readFileSync(path.join(__dirname,'candy_kingdom.browser.js'),'utf8'));fs.writeFileSync(path.join(output,process.env.GAME_VERIFY_VISUAL_ONLY?'visual-report.json':'report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,center:report.center,stations:report.stations,elevated:report.elevated}));
 const design=await evaluate(`(()=>{const meshes=[],station=moonRailway.stations.find(s=>s.name===candyRealm.stationName),other=moonRailway.reversePlatforms[moonRailway.stations.indexOf(station)];scene.updateMatrixWorld(true);for(const root of [candyRealm.group,station.model,station.access.root,other.root,other.access?.root,realmScenery.fence].filter(Boolean))root.traverse(m=>{if(!m.isMesh||m.isInstancedMesh)return;const g=m.geometry,p=g.attributes.position,c=g.attributes.color,positions=[],colors=[],v=new THREE.Vector3(),mat=m.material;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);positions.push(v.x,-v.z,v.y);colors.push(c?c.getX(i):mat.color?.r||.5,c?c.getY(i):mat.color?.g||.5,c?c.getZ(i):mat.color?.b||.5);}meshes.push({name:m.name||'KingdomPart',positions,colors,indices:g.index?Array.from(g.index.array):null});});return {center:candyRealm.center.toArray(),meshes};})()`);fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));
 await cdp('Emulation.setVirtualTimePolicy' ,{policy:'pause'});
 const shots={kingdom:`candyRealm.travel();gameState.inDialogue=true;playerGroup.position.copy(candyRealm.center);camera.position.copy(candyRealm.center).add(new THREE.Vector3(150,125,195));camera.lookAt(candyRealm.center.clone().add(new THREE.Vector3(0,6,0)));candyRealm.group.visible=true;`,palace:`camera.position.copy(candyRealm.center).add(new THREE.Vector3(60,36,95));camera.lookAt(candyRealm.center.clone().add(new THREE.Vector3(0,12,-28)));candyRealm.group.visible=true;`,boss:`camera.position.copy(candyRealm.boss.home).add(new THREE.Vector3(17,11,23));camera.lookAt(candyRealm.boss.home.clone().add(new THREE.Vector3(0,6,0)));candyRealm.group.visible=true;candyRealm.boss.group.visible=true;`,waterfall:`riverRealm.travel('base');gameState.inDialogue=true;playerGroup.position.set(-650,50,820);camera.position.set(-950,150,720);camera.lookAt(new THREE.Vector3(-760,150,650));`,fence:`mercuryLake.travel();gameState.inDialogue=true;playerGroup.position.set(-370,12,-270);camera.position.set(-300,12,-225);camera.lookAt(new THREE.Vector3(-365,4,-300));realmScenery.fence.visible=true;`,station:`(()=>{const s=moonRailway.stations.find(s=>!s.grounded)||moonRailway.stations[0];playerGroup.position.copy(s.platform);camera.position.copy(s.model.position).add(new THREE.Vector3(100,65,100));camera.lookAt(s.model.position.clone().add(new THREE.Vector3(20,-6,20)));})()`,sky:`camera.position.copy(candyRealm.center).add(new THREE.Vector3(0,5,0));camera.lookAt(camera.position.clone().add(new THREE.Vector3(0,150,500)));realmScenery.update();`};
 for(const [name,script] of Object.entries(shots)){await evaluate(script+';realmScenery.update();scene.fog.density=.00035;graphicsQuality.update(1);renderer.render(scene,camera)');await pause(350);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));}assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify({errors},null,2));console.log('Screenshots and shader checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
