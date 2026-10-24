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
      enterGame();setGraphicsProfile('potato');
      const s=playerSurvival,l=mercuryLake.data,c=lakeMonsters,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      const step=(seconds,moving=false,ai=false)=>{for(let i=0;i<Math.ceil(seconds*60);i++){s.update(1/60,moving);updatePlayerVertical(1/60);if(ai)c.update(1/60);}};
      const place=(x,y,z)=>{resetGameplayInput();playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=false;jumpVelocityY=0;s.refresh();};
      check('Stamina bar initializes full',gameState.stamina===100&&document.getElementById('hud-stamina-value').textContent==='100 / 100');
      check('Oxygen is hidden on land',document.getElementById('hud-oxygen-bar').closest('.hud-vital-row').hidden);
      keys.shift=true;step(6.5,true);check('Sprint consumes stamina and exhaustion stops sprint',gameState.stamina<10&&!s.sprinting&&s.speed===4.8,{stamina:gameState.stamina});keys.shift=false;step(3);check('Rest restores stamina',gameState.stamina>40);
      gameState.stamina=0;isAttacking=false;triggerAttack();check('No stamina prevents attack',!isAttacking);
      gameState.stamina=100;playerGroup.position.set(0,.35,10);isGrounded=true;keys.jump=true;updatePlayerVertical(1/60);check('Jump has a real stamina cost',gameState.stamina===88);
      for(const hero of ['hamster','rabbit','dragon_knight','kingkong']){
        applyHeroSelection(hero);place(l.x+40,l.waterY-.5,l.z+60);gameState.stamina=100;gameState.oxygen=100;keys.dive=true;step(5);
        const oxygen=gameState.oxygen;
        check(hero+' can dive and consumes oxygen',playerGroup.position.y< -12&&s.underwater&&oxygen<90,{depth:playerGroup.position.y,oxygen});
        check(hero+' shows oxygen while swimming',!document.getElementById('hud-oxygen-bar').closest('.hud-vital-row').hidden);
        for(let i=0;i<30;i++)updateHeroAnimation(activeLimbs,{dt:1/30,time:i/30,moving:true,sprint:false,grounded:false,velocity:0,sitting:false,attacking:false,attackProgress:0,hero,swimming:true,diving:true});
        check(hero+' has a swimming pose',heroAnimationBindings.get(activeLimbs).model.rotation.x>.8);
        keys.dive=false;keys.swimUp=true;step(6);
        check(hero+' resurfaces and restores oxygen',Math.abs(playerGroup.position.y-(l.waterY-.5))<.02&&!s.underwater&&gameState.oxygen>oxygen);
        fieldGuide.update(.5);
      }
      check('Playable characters are excluded from the library',!fieldGuide.catalog.some(item=>item.type==='heroes')&&!['hamster','rabbit','dragon_knight','kingkong'].some(id=>fieldGuide.records[id]));
      place(l.x+40,-20,l.z+60);gameState.stamina=0;keys.dive=true;step(1);check('Exhausted swimmer floats upward',playerGroup.position.y> -19);
      gameState.stamina=100;place(l.x+40,-15,l.z+60);gameState.oxygen=.01;gameState.health=8;step(3);
      check('Running out of oxygen safely recovers the player',c.onBridge(playerGroup.position)&&gameState.health===100&&gameState.oxygen===100);
      place(l.x+40,-10,l.z+60);gameState.oxygen=60;fieldGuide.open();step(2);check('Book pauses oxygen and stamina simulation',gameState.oxygen===60);closeModal('modal-field-guide');
      place(l.x+45,5.4,l.z+165);check('Dry shore is safe despite not being the bridge',!s.inWater(playerGroup.position)&&!c.onBridge(playerGroup.position)&&c.actors.every(m=>!c.canTarget(m,playerGroup.position))&&!c.damagePlayer(50));
      place(l.x,5.4,l.z+100);const minima=c.actors.map(()=>Infinity);
      for(let i=0;i<600;i++){c.update(.1);c.actors.forEach((m,n)=>minima[n]=Math.min(minima[n],m.group.position.y));}
      const maxima=LAKE_MONSTER_DATA.models.map(m=>Math.max(...m.pieces.flatMap(p=>p.vertices.map(v=>v[1]))));
      check('Both giants fully submerge during patrol',minima.every((y,i)=>y+maxima[i]<l.waterY),{minima,maxima});
      const ness=c.actors[0];ness.health=10000;ness.state='patrol';ness.timer=0;ness.cooldown=0;ness.position.set(l.x-65,-25,l.z-20);place(l.x-65,-15,l.z+10);gameState.health=100;gameState.armor=100;c.update(0);for(let i=0;i<90;i++)c.update(1/60);
      check('Monsters can attack submerged swimmers',gameState.armor<100&&ness.marker.position.y<l.waterY,{armor:gameState.armor});
      place(l.x+45,5.4,l.z+165);const hp=gameState.health,armor=gameState.armor;for(let i=0;i<120;i++)c.update(1/60);check('Leaving water cancels aggro and damage',gameState.health===hp&&gameState.armor===armor&&c.actors.every(m=>m.state==='patrol'));
      check('Mutant grass is spread over the world',lunarBiome.placements.length>8000&&[[-1,-1],[-1,1],[1,-1],[1,1]].every(([x,z])=>lunarBiome.placements.some(p=>p.x*x>650&&p.z*z>650)),{count:lunarBiome.placements.length,base:lunarBiome.baseCount});
      check('Grass avoids lake and does not create colliders',lunarBiome.placements.every(p=>Math.hypot((p.x-l.x)/l.rx,(p.z-l.z)/l.rz)>1.4)&&!colliders.some(p=>p.name?.startsWith('LunarGrass')));
      check('Minimal keeps a sparse grass layer',lunarBiome.group.children.some(m=>!m.userData.optionalFlora&&m.visible)&&lunarBiome.group.children.filter(m=>m.userData.optionalFlora).every(m=>!m.visible));
      const groveFloor=ancientGrove.group.getObjectByName('GroveForestFloor');check('Ground and forest share the lunar texture',groundMat.map===groveFloor.material.map&&groundMat.emissive.getHex()===0);
      const unknown=!fieldGuide.records.ness&&!fieldGuide.records.space_croc;check('Unseen monsters stay locked in the book',unknown);
      place(l.x,5.4,l.z);ness.position.set(l.x-72,-2,l.z-34);ness.state='patrol';ness.health=10000;ness.group.visible=true;c.actors[1].position.y=-50;c.update(0);
      ness.group.updateMatrixWorld(true);const head=ness.joints.head.getWorldPosition(new THREE.Vector3());camera.position.set(l.x-10,40,l.z+20);camera.lookAt(head);camera.updateMatrixWorld(true);fieldGuide.update(.5);
      check('Actually seeing a monster unlocks its entry',Boolean(fieldGuide.records.ness));check('Submerged unseen crocodile remains locked',!fieldGuide.records.space_croc);
      c.hitMonster(ness,20000);check('A defeated monster is marked in the library',fieldGuide.records.ness?.defeated===true);
      fieldGuide.open();document.querySelector('.field-guide-tabs [data-category=monsters]').click();
      check('Known entry reveals HP and unknown entry reveals no identity',document.querySelector('[data-entry=ness]').textContent.includes('10000')&&document.querySelector('[data-entry=space_croc]').classList.contains('locked')&&!document.querySelector('[data-entry=space_croc]').textContent.includes('7000'));
      return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'survival-library-report.json'),JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await pause(600);
    const book=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'encounter-library.png'),Buffer.from(book.data,'base64'));
    await evaluate("closeModal('modal-field-guide');playerGroup.position.set(mercuryLake.data.x+40,-14,mercuryLake.data.z+60);playerSurvival.refresh();keys.dive=false;gameState.oxygen=48;updatePlayerVitals();camYaw=Math.PI;camPitch=.1;camera.position.set(playerGroup.position.x,-12,playerGroup.position.z-3);camera.lookAt(playerGroup.position.x,-13.7,playerGroup.position.z);playerSurvival.environment();gameState.inDialogue=true;renderer.render(scene,camera);");
    const swim=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'underwater-oxygen.png'),Buffer.from(swim.data,'base64'));
    await cdp('Page.reload',{ignoreCache:true});await pause(500);
    for(let i=0;i<100;i++){if(await evaluate('document.readyState===\"complete\" && Boolean(window.fieldGuide)'))break;await pause(300);}
    assert(await evaluate('fieldGuide.records.ness?.defeated===true && !fieldGuide.records.space_croc'));
    await evaluate("enterGame();playerGroup.position.set(mercuryLake.data.x+40,-10,mercuryLake.data.z+60);currentGroundY=-10;playerSurvival.refresh();gameState.oxygen=100;renderer.domElement.focus();");
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'q',code:'KeyQ'});await pause(800);
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'q',code:'KeyQ'});
    const depth=await evaluate('playerGroup.position.y');assert(depth< -10.1,'Real Q input dives during the live loop');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await pause(800);
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});
    assert(await evaluate('playerGroup.position.y')>depth+.1,'Real Space input ascends');
    assert(await evaluate('gameState.oxygen<100 && !keys.dive && !keys.swimUp'),'Live loop consumes oxygen and releases controls');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'b',code:'KeyB'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'b',code:'KeyB'});
    assert(await evaluate("document.getElementById('modal-field-guide').classList.contains('active')"),'B opens the library');
    await evaluate("document.querySelector('.field-guide-close').click()");
    assert(await evaluate('document.activeElement===renderer.domElement'),'Closing the book restores gameplay controls');
    await evaluate("openModal('modal-settings');const select=document.getElementById('setting-language');select.value='en';select.dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();fieldGuide.open();");
    assert(await evaluate("document.getElementById('field-guide-title').textContent==='JOURNEY LIBRARY'"),'Library follows saved English language');
    await evaluate("closeModal('modal-field-guide');mercuryLake.travel();playerGroup.position.set(mercuryLake.data.x+40,-10,mercuryLake.data.z+60);playerSurvival.refresh();updatePlayerVitals();lakeMonsters.update(0);gameState.inDialogue=true;");
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(250);
    assert(await evaluate("(()=>{const hp=document.querySelector('.player-status-card').getBoundingClientRect(),location=document.getElementById('hud-landmark-badge').getBoundingClientRect(),boss=document.getElementById('lake-boss-hud').getBoundingClientRect();return hp.bottom<location.top&&location.bottom<boss.top&&boss.right<=390&&boss.left>=0;})()"),'Mobile oxygen, location and boss HUD do not overlap');
    assert.equal(errors.length,0);
    console.log('Survival, all hero swimming, diving, monster water rules, lunar biome and persistent library verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
