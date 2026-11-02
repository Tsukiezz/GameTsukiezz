// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?technology=1&transit=two-way';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/player-experience');
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
 fs.mkdirSync(output,{recursive:true});const manifest=await(await fetch(new URL('manifest.webmanifest',url))).json();assert.equal(manifest.display,'standalone');for(const icon of manifest.icons){const response=await fetch(new URL(icon.src,url));assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());const size=Number(icon.sizes.split('x')[0]);assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);}
 let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith(url));assert(tab);ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const message=m.params.args.map(a=>a.value||a.description||'').join(' ');if(/WebGLProgram|shader error|VALIDATE_STATUS/i.test(message))errors.push(message);}if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');console.log('Chrome connected');let ready=false;for(let i=0;i<250;i++){ready=await evaluate('Boolean(window.playerExperience&&window.graphicsQuality)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}assert(ready);console.log('Testing player rules, equipment and train collisions');
 const report=await evaluate(fs.readFileSync(path.join(__dirname,'player_experience.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'player-report.json'),JSON.stringify({report,manifest,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,suits:report.suits.length,receipts:report.received.length,deaths:report.deaths}));
 await evaluate("document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active'));gameState.inDialogue=false;gameMouse.release();renderer.domElement.focus()");await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'right',buttons:2,clickCount:1,x:640,y:360});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'right',buttons:0,clickCount:1,x:640,y:360});await pause(150);assert(await evaluate('gameMouse.captured'),'One right click keeps mouse captured after release');const yaw=await evaluate('camYaw');await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:665,y:370});assert.notEqual(await evaluate('camYaw'),yaw,'Mouse rotates camera after release');
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'m',code:'KeyM'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'m',code:'KeyM'});await pause(150);assert(await evaluate("document.getElementById('modal-world-atlas').classList.contains('active')&&!gameMouse.captured"),'Map releases cursor');const menuYaw=await evaluate('camYaw');await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:700,y:380});assert.equal(await evaluate('camYaw'),menuYaw,'Mouse UI does not rotate camera');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await pause(100);assert(await evaluate('!gameMouse.captured'),'Escape restores cursor');console.log('Native pointer lock, map UI and Escape passed');
 for(const hero of ['hamster','rabbit','dragon_knight','kingkong','ninja_yinyang'])for(const type of ['iron','diving']){await evaluate(`(()=>{gameState.inDialogue=true;isAttacking=false;applyHeroSelection('${hero}');technologyCraft.equip('diving',${type==='diving'});technologyCraft.equip('iron',${type==='iron'});playerExperience.sync();playerGroup.position.set(0,.35,10);playerGroup.rotation.set(0,0,0);playerGroup.visible=true;itemReceipts.element.hidden=true;const box=new THREE.Box3().setFromObject(playerGroup),center=box.getCenter(new THREE.Vector3());camera.position.copy(center).add(new THREE.Vector3(.65,.3,1.5));camera.lookAt(center);graphicsQuality.update(1);renderer.render(scene,camera)})()`);await pause(250);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,hero+'-'+type+'.png'),Buffer.from(shot.data,'base64'));}
 await evaluate("gameState.inDialogue=false;riverBoat.addWood(2);itemReceipts.scan();itemReceipts.flush()");await pause(100);const receipt=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'item-receipt.png'),Buffer.from(receipt.data,'base64'));
 await cdp('Page.reload',{ignoreCache:true});for(let i=0;i<250;i++){if(await evaluate('Boolean(window.playerExperience&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}const restored=await evaluate('({equipment:technologyCraft.state,overlay:playerExperience.overlay.mode,history:itemReceipts.history.length})');assert(restored.equipment.divingEquipped);assert.equal(restored.overlay,'diving');assert.equal(restored.history,0,'Restoring inventory is not a new receipt');assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors,pointerLock:true},null,2));console.log('Equipment persistence and quiet inventory restore passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
