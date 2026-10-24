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
      const c=lakeMonsters,[ness,croc]=c.actors,l=mercuryLake.data,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      const tick=t=>{for(let i=0;i<Math.ceil(t*60);i++)c.update(1/60);};
      const place=(x,z,y=.95)=>{playerGroup.position.set(l.x+x,y,l.z+z);currentGroundY=y;isGrounded=true;};
      function reset(){
        closeModal('modal-settings');gameState.isPlaying=true;gameState.inDialogue=false;place(0,100,5.4);tick(3.2);
        gameState.health=100;gameState.armor=100;
        for(const m of c.actors){m.health=m.maxHealth;m.group.visible=true;m.state='patrol';m.timer=0;m.cooldown=0;m.yaw=0;m.group.rotation.z=0;m.position.copy(m.home);}
        c.update(0);
      }
      check('Exact boss health pools',ness.maxHealth===10000&&ness.health===10000&&croc.maxHealth===7000&&croc.health===7000);
      check('Both models genuinely authored in Blender',LAKE_MONSTER_DATA.source==='Blender'&&Object.keys(ness.joints).length>=6&&Object.keys(croc.joints).length>=6);
      const dimensions=LAKE_MONSTER_DATA.models.map(m=>{const vs=m.pieces.flatMap(p=>p.vertices);return {id:m.id,height:Math.max(...vs.map(v=>v[1]))-Math.min(...vs.map(v=>v[1])),length:Math.max(...vs.map(v=>v[2]))-Math.min(...vs.map(v=>v[2]))};});
      check('Two gigantic distinct articulated silhouettes',dimensions[0].height>40&&dimensions[1].length>75,{dimensions});
      check('Lake is over 73m deep and bedrock is below its floor',l.depthFloor===-72&&l.waterY-realmTerrainHeight(l.x,l.z)>73&&moonSafetyLayer.top<-72,{floor:realmTerrainHeight(l.x,l.z),bedrock:moonSafetyLayer.top});
      reset();place(-8,-34);c.update(.05);check('Ness detects a player over 60m away',ness.state==='pursue'&&Math.hypot(ness.position.x-playerGroup.position.x,ness.position.z-playerGroup.position.z)>60);
      reset();place(75,-50);c.update(.05);check('Space crocodile detects a player over 60m away',croc.state==='pursue');
      reset();ness.position.copy(ness.home);place(ness.home.x-l.x-10,ness.home.z-l.z+90);c.update(0);const before=ness.position.clone();tick(2);
      check('Detected target causes actual pursuit movement',ness.position.distanceTo(before)>1,{distance:ness.position.distanceTo(before)});
      reset();croc.position.copy(croc.home);place(croc.home.x-l.x,croc.home.z-l.z-75);c.update(0);const crocBefore=croc.position.clone();tick(2);
      check('Crocodile also physically pursues a distant target',croc.position.distanceTo(crocBefore)>1,{distance:croc.position.distanceTo(crocBefore)});
      reset();for(const z of [0,30,75,145,154]){place(0,z,5.4);tick(1);check('Both ignore player on bridge at '+z,c.actors.every(m=>!c.canTarget(m,playerGroup.position)&&m.state==='patrol')&&gameState.health===100&&gameState.armor===100);}
      check('Bridge is not obstructed by moving boss bodies',!checkCollision(l.x,l.z+75,5.4));
      place(0,40,.95);check('Standing UNDER the bridge does not grant safety',!c.onBridge(playerGroup.position)&&c.actors.some(m=>c.canTarget(m,playerGroup.position)));
      reset();ness.position.set(l.x-65,-2,l.z-20);croc.cooldown=100;place(-65,10);c.update(0);
      check('Ness telegraphs instead of dealing immediate damage',ness.state==='windup'&&ness.marker.visible&&gameState.armor===100);
      tick(.6);check('Windup allows a dodge interval',gameState.armor===100);tick(.7);
      check('Ness strike damages actual armor',gameState.armor===62&&gameState.health===100,{armor:gameState.armor,health:gameState.health});
      reset();croc.position.set(l.x+65,-2,l.z);ness.cooldown=100;place(65,30);c.update(0);tick(1.1);
      check('Crocodile strike damages actual armor',gameState.armor===72&&gameState.health===100,{armor:gameState.armor});
      reset();ness.position.set(l.x-65,-2,l.z-20);croc.cooldown=100;place(-65,10);c.update(0);tick(.3);place(-80,10);tick(1.1);
      check('Leaving the warning circle evades the attack',gameState.armor===100&&gameState.health===100);
      reset();ness.position.set(l.x-65,-2,l.z-20);place(-65,10);c.update(0);tick(.3);place(0,75,5.4);tick(2);
      check('Reaching bridge cancels a committed attack',gameState.armor===100&&ness.state==='patrol'&&!ness.marker.visible);
      check('Damage function independently enforces bridge safety',!c.damagePlayer(1000)&&gameState.health===100);
      reset();ness.position.set(l.x-65,-2,l.z-20);place(-65,10);c.update(0);openModal('modal-settings');tick(3);
      check('Settings pause hostile combat',gameState.health===100&&gameState.armor===100);closeModal('modal-settings');
      reset();ness.position.set(l.x-65,-2,l.z-35);ness.cooldown=100;croc.cooldown=100;place(-75,-35);c.update(0);
      for(const [hero,damage] of [['hamster',145],['rabbit',110],['dragon_knight',135]]){
        applyHeroSelection(hero);isAttacking=false;const hp=ness.health;triggerAttack();tick(.23);
        check(hero+' real attack reduces boss HP once',ness.health===hp-damage,{before:hp,after:ness.health});tick(.5);check(hero+' swing does not repeatedly damage',ness.health===hp-damage);
      }
      place(0,100,5.4);const hp=ness.health;c.hitMonster(ness,99999);tick(4.2);
      check('Death clamps HP and removes hostile collision',ness.health===0&&ness.state==='dead'&&ness.colliders.every(v=>v.disabled)&&!ness.group.visible&&!c.hitMonster(ness,1));
      check('HP bars expose real current and maximum health',ness.bar.getAttribute('aria-valuenow')==='0'&&ness.bar.getAttribute('aria-valuemax')==='10000'&&croc.bar.getAttribute('aria-valuemax')==='7000');
      reset();place(70,70);gameState.armor=5;gameState.health=90;c.damagePlayer(20);check('Armor absorbs first and overflow reduces health',gameState.armor===0&&gameState.health===75);
      place(0,100,5.4);tick(1);place(70,70);gameState.armor=0;gameState.health=1;c.damagePlayer(1000);
      check('Defeat returns player to the safe bridge with restored vitals',c.onBridge(playerGroup.position)&&gameState.health===100&&gameState.armor===100);
      reset();mercuryLake.travel();return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'lake-monsters-report.json'),JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await evaluate("gameState.inDialogue=true;setGraphicsProfile('balanced');camera.far=1500;camera.updateProjectionMatrix();renderer.setPixelRatio(1);camera.position.set(-370,34,-325);camera.lookAt(-370,12,-450);renderer.render(scene,camera);");
    const overview=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'lake-monsters-overview.png'),Buffer.from(overview.data,'base64'));
    await evaluate("document.getElementById('lake-boss-hud').style.visibility='hidden';{const m=lakeMonsters.actors[0];m.joints.jaw.rotation.x=.35;camera.position.set(m.position.x-24,23,m.position.z+43);camera.lookAt(m.position.x,27,m.position.z+14);}renderer.render(scene,camera);");
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'loch-ness-boss.png'),Buffer.from(shot.data,'base64'));
    await evaluate("{const m=lakeMonsters.actors[1];m.joints.head.rotation.x=-.3;m.joints.jaw.rotation.x=.4;m.group.position.y=-.5;camera.position.set(m.position.x-25,19,m.position.z+47);camera.lookAt(m.position.x,3,m.position.z+14);}renderer.render(scene,camera);");
    const croc=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'space-crocodile-boss.png'),Buffer.from(croc.data,'base64'));
    assert(await evaluate('renderer.info.programs.every(p=>p.diagnostics?.runnable!==false)'));assert.equal(errors.length,0);console.log('Lake monsters, depth, pursuit, bridge immunity, combat and respawn verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
