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

    const portrait=await evaluate(`(()=>{
      const scene=new THREE.Scene(),model=buildDragonKnightModel();scene.add(model);
      scene.add(new THREE.HemisphereLight(0xe9f5ff,0x617767,.9));const key=new THREE.DirectionalLight(0xffe8c9,1.0);key.position.set(3,5,6);scene.add(key);
      const r=new THREE.WebGLRenderer({alpha:true,antialias:true});r.setSize(600,600);r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1;
      const c=new THREE.PerspectiveCamera(34,1,.1,100);c.position.set(3,2.4,6);c.lookAt(0,1.45,0);r.render(scene,c);const data=r.domElement.toDataURL('image/png');r.dispose();return data;
    })()`);
    const file=path.resolve(__dirname,'../../demo/features/characters/dragon-knight/portrait.png');fs.writeFileSync(file,Buffer.from(portrait.split(',')[1],'base64'));
    const report=await evaluate(`(()=>{
      const results=[],check=(name,ok)=>results.push({name,ok});
      check('Four characters in selection',document.querySelectorAll('.hero-card').length===4);
      selectHero('dragon_knight');check('Dragon selected',activeHeroType==='dragon_knight'&&playerGroup.children.includes(dragonVisualGroup));
      enterGame();check('Sword arm bound',activeWeaponArm===dragonVisualGroup.swordArm);triggerAttack();check('Dragon attacks',isAttacking);
      return results;
    })()`);
    await pause(900);
    const before=await evaluate('playerGroup.position.z');await evaluate('keys.forward=true');await pause(500);await evaluate('keys.forward=false');
    report.push({name:'Dragon moves with controls',ok:await evaluate('playerGroup.position.z')!==before});
    await evaluate('keys.jump=true');await pause(100);report.push({name:'Dragon jumps',ok:await evaluate('!isGrounded')});await evaluate('keys.jump=false');await pause(900);
    await evaluate('isSitting=true');await pause(200);report.push({name:'Dragon sitting pose',ok:await evaluate('dragonVisualGroup.limbs.leftLeg.rotation.x<-.4')});await evaluate('isSitting=false');
    for(const hero of ['hamster','rabbit','dragon_knight','kingkong']){await evaluate('selectHero('+JSON.stringify(hero)+')');report.push({name:hero+' switches correctly',ok:await evaluate('activeHeroType')===hero});}
    console.log(JSON.stringify(report));assert(report.every(r=>r.ok));assert.equal(errors.length,0);
    await evaluate("returnToHome();document.getElementById('btn-open-heroes').click()");await evaluate("document.querySelector('#card-hero-dragon_knight img').src+='?refresh=1'");await pause(400);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'dragon-hero-selection.png'),Buffer.from(shot.data,'base64'));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
