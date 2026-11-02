// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/western-highlands');
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
 fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const message=m.params.args.map(a=>a.value||a.description||'').join(' ');if(/WebGLProgram|shader error|VALIDATE_STATUS/i.test(message))errors.push(message);}if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');console.log('Chrome connected');let ready=false;for(let i=0;i<300;i++){ready=await evaluate('Boolean(window.candyProvisions&&window.realmScenery&&window.graphicsQuality)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}assert(ready);console.log('Highlands runtime ready');const report=await evaluate(fs.readFileSync(path.join(__dirname,'western_highlands.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,villages:report.villages,residents:report.residents,cookies:report.cookies,stations:report.stations}));
 const previous=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../demo/verification/candy-kingdom/report.json'),'utf8')).report.checks.filter(c=>c.name.startsWith('Station level: ')).map(c=>c.name.slice('Station level: '.length));assert.deepEqual(previous.filter(name=>!report.stationNames.includes(name)),[],'Preserve every prior station name');
 const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_western_design.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-design.json'),JSON.stringify(design));
 await cdp('Emulation.setVirtualTimePolicy',{policy:'pause'});const shots={fortress:`candyRealm.travel();playerGroup.position.copy(candyRealm.center);camera.position.copy(candyRealm.center).add(new THREE.Vector3(110,85,130));camera.lookAt(candyRealm.center.clone().add(new THREE.Vector3(0,8,0)));candyRealm.group.visible=true;`,market:`playerGroup.position.copy(candyRealm.center);camera.position.copy(candyRealm.center).add(new THREE.Vector3(4,8,82));camera.lookAt(candyRealm.center.clone().add(new THREE.Vector3(0,6,-12)));candyRealm.group.visible=true;candyProvisions.update(.5);`,highlands:`westernHighlands.travel(2);const p=westernHighlands.villages[2].center;camera.position.copy(p).add(new THREE.Vector3(130,95,100));camera.lookAt(p);westernHighlands.update(0);`,snow:`const index=westernHighlands.villages.findIndex(v=>v.center.z>2200);westernHighlands.travel(index);const p=westernHighlands.villages[index].center;camera.position.copy(p).add(new THREE.Vector3(50,35,65));camera.lookAt(p);westernHighlands.update(0);`,village:`westernHighlands.travel(0);const p=westernHighlands.villages[0].center;camera.position.copy(p).add(new THREE.Vector3(45,28,52));camera.lookAt(p.clone().add(new THREE.Vector3(0,2,0)));westernHighlands.update(0);`,ridge:`playerGroup.position.set(-3100,worldSurface.height(-3100,400),400);camera.position.set(-3000,260,650);camera.lookAt(new THREE.Vector3(-3200,100,150));westernHighlands.update(0);`};for(const [name,code] of Object.entries(shots)){await evaluate(`(()=>{gameState.inDialogue=true;itemReceipts.element.hidden=true;candyRealm.hud.hidden=true;${code};camera.far=2400;camera.updateProjectionMatrix();scene.fog.density=.0006;realmScenery.update();graphicsQuality.apply('ultra');graphicsQuality.update(1);renderer.render(scene,camera)})()`);await pause(200);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));}assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify({errors},null,2));console.log('Visual and shader audit passed');
 await cdp('Emulation.setVirtualTimePolicy',{policy:'advance'});await cdp('Page.reload',{ignoreCache:true});for(let i=0;i<300;i++){if(await evaluate('Boolean(window.candyProvisions&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}const restored=await evaluate('({cookies:candyProvisions.count,collected:candyProvisions.collected})');assert.equal(restored.cookies,report.savedCookies);assert(restored.collected[report.collectedId]>Date.now());fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));console.log('Cookies persist across reload');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
