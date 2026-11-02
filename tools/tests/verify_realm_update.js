// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/realm-interiors');
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
    fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<80;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs,'Chrome starts');const tab=tabs.find(t=>t.url.startsWith(url));assert(tab,'Game tab');ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.url.startsWith(new URL(url).origin)&&m.params.response.status>=400&&!m.params.response.url.endsWith('/favicon.ico'))errors.push(m.params.response.url);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');await cdp('Network.enable');
    for(let i=0;i<150;i++){if(await evaluate('Boolean(window.monsterCamps&&window.fieldGuide)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    if(process.env.GAME_CHECK_SCRIPT){const audit=await evaluate(fs.readFileSync(path.join(__dirname,process.env.GAME_CHECK_SCRIPT),'utf8'));assert.deepEqual(errors,[]);if(audit.results){fs.writeFileSync(path.join(output,'castle-walking-report.json'),JSON.stringify({audit,errors},null,2));const failures=audit.results.filter(r=>!r.ok);console.log(JSON.stringify({checks:audit.results.length,failures}));assert.deepEqual(failures,[]);return;}fs.writeFileSync(path.join(output,'castle-envelope-report.json'),JSON.stringify({audit,errors},null,2));console.log(JSON.stringify({faceSamples:audit.faceSamples,roofSamples:audit.roofSamples,basementSamples:audit.basementSamples,leaks:audit.leaks.slice(0,10),doors:audit.blockedRoomDoors,floorHoles:audit.floorHoles.slice(0,10)}));assert.equal(audit.leaks.length,0);assert.equal(audit.blockedRoomDoors.length,0);assert.equal(audit.floorHoles.length,0);return;}
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'realm_update.browser.js'),'utf8'));const envelope=await evaluate(fs.readFileSync(path.join(__dirname,'castle_envelope.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'castle-envelope-report.json'),JSON.stringify({audit:envelope,errors},null,2));assert.equal(envelope.leaks.length,0);assert.equal(envelope.blockedRoomDoors.length,0);assert.equal(envelope.floorHoles.length,0);console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'realm-report.json'),JSON.stringify({report,errors},null,2));
    const shots=[['pyramid-entry','desertRealm.travel();playerGroup.position.copy(desertRealm.maze.point(desertRealm.maze.entrance));pyramidInterior.update(.2);camera.position.copy(playerGroup.position).add(new THREE.Vector3(1,2.3,3));camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0,1,-8)));'],['pyramid-upper','playerGroup.position.copy(desertRealm.floors.levels[3].point(12));pyramidInterior.update(.2);camera.position.copy(playerGroup.position).add(new THREE.Vector3(1,2.3,3));camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0,1,-8)));'],['castle-room','playerGroup.position.set(-121,6,126);pyramidInterior.update(.2);camera.position.set(-126,8,136);camera.lookAt(-121,7,125);'],['wolf-camp','playerGroup.position.copy(monsterCamps.camps[10].center);monsterCamps.update(.01);camera.position.copy(playerGroup.position).add(new THREE.Vector3(12,9,13));camera.lookAt(playerGroup.position);']];
    for(const [name,expression] of (process.env.SKIP_SHOTS?[]:shots)){await evaluate(expression+'gameState.inDialogue=true;renderer.render(scene,camera);');const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));await evaluate('gameState.inDialogue=false;');}
    await cdp('Page.reload',{ignoreCache:true});let restored;for(let i=0;i<150;i++){if(await evaluate('Boolean(window.monsterCamps&&window.fieldGuide)')){restored=await evaluate(`(()=>{const c=monsterCamps.camps.find(c=>c.id===${JSON.stringify(report.persistence.camp)});return {camp:{respawnAt:c.respawnAt,health:c.actors.map(a=>a.health)},stock:monsterCamps.stock,hunger:monsterCamps.hunger};})()`);break;}await pause(300);}assert(restored,'Reload initializes');assert.equal(restored.camp.respawnAt,report.persistence.respawnAt);assert(restored.camp.health.every(h=>h===0));assert.deepEqual(restored.stock,report.persistence.stock);assert(Math.abs(restored.hunger-report.persistence.hunger)<1);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));
    const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_realm_design.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
