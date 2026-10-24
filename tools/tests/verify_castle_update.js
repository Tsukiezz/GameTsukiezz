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

    const report=await evaluate(`(()=>{
      enterGame();setGraphicsProfile('potato');
      const results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      for(const z of [62,72,82,89]){
        playerGroup.position.set(-116,.35,z);currentGroundY=.35;isGrounded=true;
        for(let i=0;i<120;i++){movePlayerWithCollisions(.1,0);updatePlayerVertical(1/60);}
        check('Walk across below bridge at z='+z,playerGroup.position.x>-105&&playerGroup.position.y<.7,{position:playerGroup.position.toArray()});
      }
      playerGroup.position.set(-110,.35,41.5);currentGroundY=.35;isGrounded=true;
      castleGate.open=true;for(let i=0;i<120;i++)updateCastleGate(1/60);
      for(let i=0;i<535;i++){movePlayerWithCollisions(0,.1);updatePlayerVertical(1/60);}
      check('Walk up bridge still reaches gate',playerGroup.position.z>94&&Math.abs(playerGroup.position.y-6)<.15,{position:playerGroup.position.toArray()});
      const roof=castleBridgeTop(-110,72)-.8;
      check('Jump under bridge hits underside',resolveCastleCeiling(-110,72,roof-PLAYER_HEIGHT-.1,roof)===roof-PLAYER_HEIGHT);
      check('Foundation blocks ground entry',checkCollision(-120,92,0));
      const walls=castlePhysics.group.children.filter(m=>m.geometry?.parameters?.height===7 && m.geometry?.parameters?.depth===56);
      check('Exterior masonry meets terrain',walls.length>=2&&walls.every(m=>m.position.y-m.geometry.parameters.height/2<=-1));
      playerGroup.position.set(-110,6,92.5);castleGate.open=false;castleGate.offset=0;updateCastleGate(0);
      const item=interactables.find(i=>i.type==='castle_gate');
      interactCastleUpgrade(item);updateCastleGate(.25);
      check('Two guards act before gate opens',castleGatekeepers.length===2&&castleGatekeepers.every(g=>g.arm.rotation.x<-.1)&&!castleGate.open);
      const guards=colliders.filter(c=>c.name==='castle-guard-npc');guards.forEach(c=>c.disabled=true);
      check('Guards stand on bridge outside solid walls',guards.length===2&&guards.every(c=>!checkCollision(c.x,c.z,c.minY)&&Math.abs(getGroundElevation(c.x,c.z,c.minY)-c.minY)<.05));
      guards.forEach(c=>c.disabled=false);
      for(let i=0;i<150;i++)updateCastleGate(1/60);
      check('Guard action opens passable gate',castleGate.open&&castleGate.offset===3.55&&!checkCollision(-110,94,6)&&castleGatekeepers.every(g=>g.arm.rotation.x===0));
      interactCastleUpgrade(item);for(let i=0;i<150;i++)updateCastleGate(1/60);
      check('Guard action closes solid gate',!castleGate.open&&checkCollision(-110,94,6));
      castleGate.open=true;playerGroup.position.set(-110,6,94);interactCastleUpgrade(item);for(let i=0;i<150;i++)updateCastleGate(1/60);
      check('Guard cannot close gate onto player',castleGate.open);
      gameState.health=63;gameState.armor=27;updatePlayerVitals();
      check('Health and armor show actual values',document.getElementById('hud-health-value').textContent==='63 / 100'&&document.getElementById('hud-armor-bar').getAttribute('aria-valuenow')==='27');
      openModal('modal-settings');
      const old=tsuventureSettings.language,profile=currentProfileKey;
      document.getElementById('setting-language').value='en';document.getElementById('setting-language').dispatchEvent(new Event('change'));
      document.getElementById('slider-bgm').value=37;document.getElementById('slider-bgm').dispatchEvent(new Event('input'));
      tsuventureSettings.chooseGraphics('low');
      check('Settings remain pending until Save',tsuventureSettings.language===old&&currentProfileKey===profile&&!document.getElementById('btn-save-settings').disabled);
      document.getElementById('btn-save-settings').click();
      check('Save immediately applies and persists settings',document.documentElement.lang==='en'&&currentProfileKey==='low'&&JSON.parse(localStorage.getItem('tsuventure_settings')).bgm===37&&document.getElementById('btn-save-settings').disabled);
      document.getElementById('slider-sfx').value=1;document.getElementById('slider-sfx').dispatchEvent(new Event('input'));closeModal('modal-settings');openModal('modal-settings');
      check('Discarded draft resets on reopening',document.getElementById('slider-sfx').value==='90');
      return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await cdp('Page.reload',{ignoreCache:true});await pause(500);
    for(let i=0;i<100;i++){if(await evaluate('document.readyState==="complete" && typeof tsuventureSettings!=="undefined"'))break;await pause(300);}
    assert.equal(await evaluate('document.documentElement.lang'),'en');
    assert.equal(await evaluate('currentProfileKey'),'low');
    assert.equal(await evaluate('document.getElementById("slider-bgm").value'),'37');
    await evaluate("enterGame();fastTravelTo(-110,91.5,'Castle',castleBridgeTop(-110,91.5));camYaw=Math.PI;camPitch=-.04;camDistance=5.5;camera.position.set(-110,6.7,86);");await pause(3500);
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'castle-guards-vitals.png'),Buffer.from(shot.data,'base64'));
    console.log('Castle, gate NPCs, vitals, Save and reload persistence verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
