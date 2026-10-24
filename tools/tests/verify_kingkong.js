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
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
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
    if(!ready)console.error('Startup errors',errors,await evaluate('({player:typeof playerGroup,castle:!!window.castlePhysics,monsters:!!window.lakeMonsters})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(`(()=>{
      const results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      check('Four selectable character cards',document.querySelectorAll('.hero-card').length===4);
      const card=document.getElementById('card-hero-kingkong');check('Kong has matching stats, guardian role and portrait',card.querySelectorAll('.stat-row').length===4&&card.querySelector('.hero-class').textContent.includes('Quy')&&card.querySelector('img').src.includes('kingkong/portrait-art.png'));
      card.click();check('Selection binds the Kong model and boxing arm',activeHeroType==='kingkong'&&playerGroup.children.includes(kingkongVisualGroup)&&activeWeaponArm===kingkongVisualGroup.swordArm&&activeLimbs===kingkongVisualGroup.limbs);
      check('Exactly one player model remains visible',playerGroup.children.filter(c=>[hamsterVisualGroup,rabbitVisualGroup,dragonVisualGroup,kingkongVisualGroup].includes(c)).length===1);
      check('King Kong was genuinely authored in Blender',KINGKONG.source==='Blender'&&Object.keys(KINGKONG.pivots).length===6&&KINGKONG.parts.some(p=>p.name==='boxing-glove'));
      const box=new THREE.Box3().setFromObject(kingkongVisualGroup),size=box.getSize(new THREE.Vector3());check('Matches other characters physical scale',playerGroup.scale.x===.2&&size.y>.5&&size.y<.7&&size.x<.55,{size:size.toArray()});
      enterGame();check('HUD names boxing correctly',document.getElementById('hud-name').textContent.includes('King Kong')&&document.getElementById('hud-attack-name').textContent.length>0);
      const l=activeLimbs,tickPose=(state)=>{for(let i=0;i<30;i++)updateHeroAnimation(l,{dt:1/60,time:i/60,moving:false,sprint:false,grounded:true,velocity:0,sitting:false,attacking:false,attackProgress:0,hero:'kingkong',...state});};
      resetHeroAnimation(kingkongVisualGroup);const zL=l.leftArm.position.z,zR=l.rightArm.position.z;
      tickPose({attacking:true,attackProgress:.5});check('First strike extends the left glove',l.leftArm.position.z>zL+.5&&Math.abs(l.rightArm.position.z-zR)<.02);
      tickPose({});check('Gloves smoothly recover after jab',Math.abs(l.leftArm.position.z-zL)<.02);
      tickPose({attacking:true,attackProgress:.5});check('Second strike alternates to the right glove',l.rightArm.position.z>zR+.5&&Math.abs(l.leftArm.position.z-zL)<.02);tickPose({});
      const c=lakeMonsters,ness=c.actors[0],lake=mercuryLake.data,tick=(seconds)=>{for(let i=0;i<seconds*60;i++)c.update(1/60);};
      ness.position.set(lake.x-65,-2,lake.z-35);ness.health=10000;ness.state='patrol';ness.cooldown=100;c.actors[1].cooldown=100;playerGroup.position.set(lake.x-75,.7,lake.z-35);currentGroundY=.7;isGrounded=false;playerSurvival.refresh();c.update(0);
      gameState.stamina=100;isAttacking=false;triggerAttack();tick(.23);check('Actual boxing hit damages lake monster',ness.health===9865,{health:ness.health});tick(.5);check('One punch deals damage only once',ness.health===9865);
      gameState.armor=100;gameState.health=100;c.damagePlayer(20);check('Guardian takes exactly 20 percent less lake damage',Math.abs(gameState.armor-84)<.001&&gameState.health===100,{armor:gameState.armor});tick(1);
      isAttacking=false;selectHero('hamster');gameState.armor=100;c.damagePlayer(20);check('Other characters retain their original damage taken',gameState.armor===80);isAttacking=false;selectHero('kingkong');
      playerGroup.position.set(lake.x,5.4,lake.z+100);check('Guardian still respects bridge immunity',!c.damagePlayer(1000));
      const m=forestGuardian;
      for(const [hero,armor] of [['kingkong',74.4],['hamster',68]]){isAttacking=false;applyHeroSelection(hero);playerGroup.position.set(m.position.x+10,m.position.y,m.position.z);m.pause();gameState.armor=100;gameState.health=100;for(let i=0;i<246;i++)m.update(1/60);check(hero+' takes the correct forest strike damage',Math.abs(gameState.armor-armor)<.01,{armor:gameState.armor});}
      isAttacking=false;applyHeroSelection('kingkong');playerGroup.position.set(m.position.x,m.position.y,m.position.z+3.5);m.pause();gameState.stamina=100;const health=m.health;triggerAttack();for(let i=0;i<16;i++)m.update(1/60);check('Boxing also damages Forest Guardian',m.health===health-135);
      isAttacking=false;selectHero('dragon_knight');check('Switching away resets extended boxing arms',Math.abs(l.leftArm.position.z-zL)<.01&&Math.abs(l.rightArm.position.z-zR)<.01);
      isAttacking=false;selectHero('kingkong');gameState.stamina=100;triggerAttack();returnToHome();check('Returning to lobby cancels punch and resets pose',!isAttacking&&Math.abs(l.leftArm.position.z-zL)<.01&&kingkongVisualGroup.rotation.x===0);
      check('Playable Kong remains excluded from library',!fieldGuide.catalog.some(item=>item.id==='kingkong'));
      document.getElementById('btn-open-heroes').click();return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'kingkong-report.json'),JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await pause(500);const heroes=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'four-characters-kingkong.png'),Buffer.from(heroes.data,'base64'));
    const portrait=await evaluate(`(()=>{const world=new THREE.Scene();world.background=new THREE.Color(0x142336);const model=buildKingKongModel();world.add(model);world.add(new THREE.HemisphereLight(0xdceaff,0x726253,1));const light=new THREE.DirectionalLight(0xffe6b9,1.5);light.position.set(3,5,6);world.add(light);const r=new THREE.WebGLRenderer({antialias:true});r.setSize(600,600);r.outputEncoding=THREE.sRGBEncoding;const cam=new THREE.PerspectiveCamera(36,1,.1,100);cam.position.set(3,2.6,6);cam.lookAt(0,1.5,0);r.render(world,cam);const data=r.domElement.toDataURL('image/png');r.dispose();return data;})()`);fs.writeFileSync(path.join(output,'kingkong-model.png'),Buffer.from(portrait.split(',')[1],'base64'));
    await evaluate("closeModal('modal-heroes');openModal('modal-settings');const select=document.getElementById('setting-language');select.value='en';select.dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();openModal('modal-heroes');");assert(await evaluate("document.querySelector('#card-hero-kingkong h3').textContent==='King Kong Boxer'&&document.querySelector('#card-hero-kingkong .hero-class').textContent==='Guardian • Boxing'"),'Kong supports saved English interface');
    for(const [width,height] of [[1024,768],[390,844]]){await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await pause(150);assert(await evaluate("document.querySelector('#card-hero-kingkong').getBoundingClientRect().width>100&&document.querySelector('#modal-heroes .modal-card').scrollWidth<=document.querySelector('#modal-heroes .modal-card').clientWidth+2"),'Character cards fit '+width);}
    await evaluate("document.getElementById('card-hero-kingkong').scrollIntoView({block:'center'});document.getElementById('card-hero-kingkong').focus()");await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});assert(await evaluate("activeHeroType==='kingkong'&&!document.getElementById('modal-heroes').classList.contains('active')"),'Kong selection works by keyboard');assert.equal(errors.length,0);
    await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
    await evaluate("enterGame();fastTravelTo(22,16,'Keyboard test');gameState.stamina=100;renderer.domElement.focus()");const before=await evaluate('playerGroup.position.toArray()');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await pause(500);await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});const after=await evaluate('playerGroup.position.toArray()');assert(Math.hypot(after[0]-before[0],after[2]-before[2])>.15,'Real W input moves Kong');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await pause(250);assert(await evaluate('!isGrounded'),'Real Space input makes Kong jump');await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});assert.equal(errors.length,0);
    console.log('King Kong selection, guardian mitigation, actual boxing combat, alternating jabs, recovery and responsive bilingual UI verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
