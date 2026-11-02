// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?antarctic=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/world-ecology');
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
 fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.url.startsWith(new URL(url).origin)&&m.params.response.status>=400&&!m.params.response.url.endsWith('/favicon.ico'))errors.push(m.params.response.url);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');await cdp('Network.enable');for(let i=0;i<220;i++){if(await evaluate('Boolean(window.santaGifts&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
 const report=await evaluate(fs.readFileSync(path.join(__dirname,'world_ecology.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'ecology-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({...report,checks:report.checks.length}));
 const audit=await evaluate(fs.readFileSync(path.join(__dirname,'polar_rail_audit.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'rail-audit.json'),JSON.stringify({audit,errors},null,2));assert.deepEqual(audit.failures,[]);console.log(JSON.stringify({railAudit:audit.failures,minGap:audit.minGap}));
 const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_polar_design.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));const camps=await evaluate(fs.readFileSync(path.join(__dirname,'export_camp_economy.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-camps.json'),JSON.stringify(camps));
 for(const [name,expr] of [
 ['river-ecology',`const h=aquaticEcology.habitats.find(h=>h.z<-2000&&Math.abs(h.x)>1500);fastTravelTo(h.x,h.z,'River');setGraphicsProfile('ultra');aquaticEcology.update(1);camera.position.set(h.x+8,h.y+7,h.z+10);camera.position.set(h.x+3,h.y-2,h.z+5);camera.lookAt(h.x,h.y-3,h.z);`],
 ['polar-wildlife',`const a=polarEcology.actors.find(a=>a.kind==='penguin');fastTravelTo(a.home.x,a.home.z,'Wildlife');polarEcology.update(1);camera.position.copy(a.home).add(new THREE.Vector3(5,3,-7));camera.lookAt(a.home.clone().add(new THREE.Vector3(0,1,0)));`],
 ['factory-crystals',`const n=snowCrystals.nodes[2];fastTravelTo(n.item.pos.x,n.item.pos.z-7,'Crystals',antarcticRealm.factory.y);camera.position.copy(n.item.pos).add(new THREE.Vector3(8,5,-10));camera.lookAt(n.item.pos);`]
 ]){await evaluate(`(()=>{${expr}gameState.inDialogue=true;playerSurvival.refresh();playerSurvival.environment();antarcticRealm.environment();graphicsQuality.update(1);scene.updateMatrixWorld(true);renderer.render(scene,camera);})()`);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));await evaluate('gameState.inDialogue=false;');}
 await evaluate("setGraphicsProfile('balanced')");await cdp('Page.reload',{ignoreCache:true});let restored;for(let i=0;i<220;i++){if(await evaluate('Boolean(window.graphicsQuality&&window.snowCrystals)')){restored=await evaluate('({crystals:snowCrystals.count,collected:snowCrystals.nodes.filter(n=>n.item.collected).map(n=>n.item.id),graphics:currentProfileKey})');break;}await pause(300);}assert.equal(restored.crystals,report.crystals);assert(restored.collected.includes(report.crystalId));assert.equal(restored.graphics,'balanced');assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
