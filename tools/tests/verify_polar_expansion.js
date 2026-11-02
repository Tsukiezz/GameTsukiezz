// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?antarctic=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/polar-expansion');
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
        pending.set(id, { resolve: v => { clearTimeout(timeout); resolve(v); }, reject:e=>{clearTimeout(timeout);reject(e);} });
        ws.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function main(){
    fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.url.startsWith(new URL(url).origin)&&m.params.response.status>=400&&!m.params.response.url.endsWith('/favicon.ico'))errors.push(m.params.response.url);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');await cdp('Network.enable');for(let i=0;i<200;i++){if(await evaluate('Boolean(window.santaGifts&&window.fieldGuide)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    if(process.env.POLAR_DEATH_AUDIT){const audit=await evaluate(fs.readFileSync(path.join(__dirname,'polar_death_audit.browser.js'),'utf8'));assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'death-audit.json'),JSON.stringify({audit,errors},null,2));console.log(JSON.stringify(audit));return;}
    if(process.env.POLAR_EXPORT_ONLY){const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_polar_design.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));assert.deepEqual(errors,[]);console.log(JSON.stringify({meshes:design.meshes.length,railLength:design.railLength}));return;}
    if(process.env.POLAR_AUDIT){const audit=await evaluate(fs.readFileSync(path.join(__dirname,'polar_rail_audit.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'rail-audit.json'),JSON.stringify({audit,errors},null,2));console.log(JSON.stringify(audit));assert.deepEqual(audit.failures,[]);assert.deepEqual(errors,[]);const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_polar_design.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));return;}
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'polar_expansion.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'polar-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,surfaceSamples:report.surfaceSamples,railPoints:report.railPoints,railLength:report.railLength,stations:report.stations,rivers:report.rivers,engines:report.engines}));
    for(const [name,expr] of [['snow-factory','playerGroup.position.set(-700,worldSurface.height(-700,2070),2070);camera.position.set(-890,150,1960);camera.lookAt(-700,28,2200);'],['ice-waterfall','playerGroup.position.set(1400,worldSurface.height(1400,2600),2600);camera.position.set(1360,100,2470);camera.lookAt(1100,45,2850);'],['snow-queen','playerGroup.position.copy(snowQueen.home).z+=12;camera.position.copy(snowQueen.home).add(new THREE.Vector3(18,12,22));camera.lookAt(snowQueen.home.clone().add(new THREE.Vector3(0,3,0)));'],['flying-santa','camera.position.copy(santaGifts.group.position).add(new THREE.Vector3(28,18,30));camera.lookAt(santaGifts.group.position);'],['red-smoke','(()=>{const c=santaGifts.drop(1800,1700,()=>.8);c.data.y=c.data.floor;c.data.landed=true;c.model.position.y=c.data.floor;santaGifts.update(.1);playerGroup.position.set(c.data.x+12,c.data.floor,c.data.z+12);camera.position.copy(playerGroup.position).add(new THREE.Vector3(15,25,20));camera.lookAt(c.data.x,c.data.floor+16,c.data.z);})()']]){await evaluate(expr+';gameState.inDialogue=true;antarcticRealm.environment();renderer.render(scene,camera);');const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));await evaluate('gameState.inDialogue=false;');}
    await cdp('Page.reload',{ignoreCache:true});let restored;for(let i=0;i<200;i++){if(await evaluate('Boolean(window.santaGifts&&window.fieldGuide)')){restored=await evaluate('({engines:santaGifts.engines,chests:santaGifts.chests.map(c=>c.data.id),size:worldExpansion.size})');break;}await pause(300);}assert(restored);assert.equal(restored.engines,report.engines);assert(!restored.chests.includes(report.giftId));assert.equal(restored.size,6720);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
