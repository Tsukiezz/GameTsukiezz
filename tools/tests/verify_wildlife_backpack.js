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

    await cdp('Network.enable');
    const assets=await evaluate(`(async()=>{const urls=[...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(e=>e.src||e.href).filter(u=>u.startsWith(location.origin));return Promise.all(urls.map(async url=>({url,status:(await fetch(url)).status})));})()`);assert(assets.every(a=>a.status===200),'Every relocated module and stylesheet must load');
    const report=await evaluate(`(()=>{
      enterGame();setGraphicsProfile('potato');const w=forestWildlife,b=backpack,g=ancientGrove,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      const place=(x,z)=>{playerGroup.position.set(x,getGroundElevation(x,z,20),z);currentGroundY=playerGroup.position.y;isGrounded=true;};
      const tick=(s)=>{for(let i=0;i<s*60;i++)w.update(1/60);};
      const treeKinds=new Set(ANCIENT_GROVE_DATA.instances.filter(i=>i.radius&&i.kind!=='elder'&&i.kind!=='rock').map(i=>i.kind));
      check('Nine kinds of trees now populate the forest',treeKinds.size===9,{kinds:[...treeKinds]});
      check('All forest trees stay inside the titanium enclosure',ANCIENT_GROVE_DATA.instances.filter(i=>i.radius&&i.kind!=='rock').every(i=>g.contains(i.x,i.z)));
      check('Underbrush remains on Minimal',g.batches.filter(o=>o.name==='Grove_bush').every(o=>o.visible));
      check('Minimal uses the reduced Blender forest meshes',g.batches.every(m=>m.geometry===m.groveLow)&&g.batches.reduce((n,m)=>n+m.groveLow.index.count*m.count,0)<g.batches.reduce((n,m)=>n+m.groveHigh.index.count*m.count,0)*.4);setGraphicsProfile('ultra');check('Ultra restores original forest geometry',g.batches.every(m=>m.geometry===m.groveHigh));setGraphicsProfile('potato');
      check('Four animal species have valid forest habitats',w.habitats.length>50&&new Set(w.habitats.map(h=>h.kind)).size===4,{habitats:w.habitats.length});
      place(290,-75);tick(2);check('Wildlife spawns only around nearby player',w.actors.size>0&&w.actors.size<=16&&[...w.actors.values()].every(a=>a.model.position.distanceTo(playerGroup.position)<66),{count:w.actors.size});
      const before=[...w.actors.values()].map(a=>[a,a.model.position.clone()]),hp=gameState.health,armor=gameState.armor;tick(10);
      check('Animals roam rather than remaining statues',before.some(([a,p])=>a.model.position.distanceTo(p)>.3));
      check('Animals do not walk through trees or leave forest', [...w.actors.values()].every(a=>g.contains(a.model.position.x,a.model.position.z)&&!checkCollision(a.model.position.x,a.model.position.z,g.ground(a.model.position.x,a.model.position.z),a.kind==='horse'?.4:.23)));
      check('Wildlife is harmless and nonblocking',gameState.health===hp&&gameState.armor===armor&&!colliders.some(c=>c.name?.startsWith('Wildlife_')));
      place(0,0);tick(3);check('Distant animals despawn and their models are pooled',w.actors.size===0&&w.pool.length>0);
      check('World loot probability and duration are explicit',b.spawnProbability===.25&&b.duration===180000);
      check('Chocolate distribution is sparse and spread across world',b.spots.length>100&&b.spots.length<300&&b.spots.some(s=>s.x>700)&&b.spots.some(s=>s.x< -700),{spots:b.spots.length});
      check('Chocolate is placed on reachable dry ground',b.spots.every(s=>!checkCollision(s.x,s.z,s.y,.4)&&Math.abs(getGroundElevation(s.x,s.z,s.y)-s.y)<.1&&!playerSurvival.inWater(new THREE.Vector3(s.x,s.y,s.z))));
      const intro=b.spots.find(s=>s.id==='intro');check('A tutorial chocolate can be found near plaza',Boolean(intro));place(intro.x,intro.z);for(let i=0;i<60;i++)b.update(1/60);check('Nearby chocolate renders in world',b.drops.has('intro'));
      const item=b.nearbyLoot(playerGroup.position);check('Chocolate pickup is prioritized by interaction',item?.type==='world_loot');checkInteractables();check('E prompt targets the loot',nearbyItem===item);handleInteraction();
      check('Picking up puts exactly one chocolate in backpack',b.count===1&&!b.drops.has('intro'));b.interact(item);check('Same pickup cannot be collected twice',b.count===1);
      for(let i=0;i<120;i++)b.update(1/60);check('Collected drop does not immediately respawn',!b.drops.has('intro'));
      b.open();check('Backpack shows count and a real chocolate image',document.getElementById('chocolate-count').textContent.includes('1')&&document.querySelector('.backpack-item img').src.endsWith('chocolate.svg'));
      const realNow=Date.now;try{
        check('Use consumes chocolate and starts three-minute effect',b.consume()&&b.count===0&&b.remainingSeconds===180);const until=b.buffUntil;
        check('Cannot repeatedly consume active effect',!b.consume()&&b.buffUntil===until);
        closeModal('modal-backpack');gameState.stamina=0;keys.shift=true;for(let i=0;i<120;i++)playerSurvival.update(1/60,true);
        check('Chocolate overrides exhaustion and sprint drain',gameState.stamina===100&&playerSurvival.sprinting);
        check('Jump and attack spending cannot drain buffed stamina',playerSurvival.spend(12)&&playerSurvival.spend(8)&&gameState.stamina===100);
        playerGroup.position.set(mercuryLake.data.x+40,-10,mercuryLake.data.z+60);gameState.oxygen=80;playerSurvival.refresh();playerSurvival.update(.1,true);check('Chocolate does not grant infinite oxygen',gameState.oxygen<80);
        Date.now=()=>until-1;check('Buff remains effective until its last millisecond',b.infiniteStamina);Date.now=()=>until;check('Buff expires at exactly three minutes',!b.infiniteStamina);playerSurvival.update(.1,true);check('Normal stamina drain resumes after expiry',gameState.stamina<100);
      }finally{Date.now=realNow;keys.shift=false;}
      const saved=JSON.parse(localStorage.getItem('tsuventure_backpack_v1'));check('Backpack, buff expiry and pickup cooldown save together',saved.chocolate===0&&saved.buffUntil===b.buffUntil&&saved.collected.intro>Date.now());
      place(22,16);b.open();return {results,until:b.buffUntil};
    })()`);
    fs.writeFileSync(path.join(output,'wildlife-backpack-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await pause(400);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'backpack-chocolate.png'),Buffer.from(shot.data,'base64'));
    await evaluate("document.querySelector('.backpack-close').click();renderer.domElement.focus()");
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'i',code:'KeyI'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'i',code:'KeyI'});assert(await evaluate("document.getElementById('modal-backpack').classList.contains('active')"),'Real I input opens backpack');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});assert(await evaluate('document.activeElement===renderer.domElement'),'Escape returns focus to gameplay');
    for(const kind of ['frog','rabbit','pig','horse']){const data=await evaluate("libraryPreviews.get('wildlife_"+kind+"')");fs.writeFileSync(path.join(output,'wildlife-'+kind+'.png'),Buffer.from(data.split(',')[1],'base64'));}
    await cdp('Page.reload',{ignoreCache:true});await pause(600);for(let i=0;i<100;i++){if(await evaluate('Boolean(window.backpack)'))break;await pause(300);}
    assert(await evaluate('backpack.count===0&&backpack.infiniteStamina&&backpack.buffUntil==='+report.until),'Buff expiry persists exactly across reload');
    await evaluate("enterGame();const s=backpack.spots.find(s=>s.id==='intro');playerGroup.position.set(s.x,s.y,s.z);for(let i=0;i<90;i++)backpack.update(1/60);");assert(await evaluate("!backpack.drops.has('intro')"),'Reload does not farm collected chocolate');
    await evaluate("const extra=backpack.spots.find(s=>s.id!=='intro');playerGroup.position.set(extra.x,extra.y,extra.z);for(let i=0;i<90;i++)backpack.update(1/60);renderer.domElement.focus();");
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'e',code:'KeyE'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'e',code:'KeyE'});
    assert(await evaluate('backpack.count===1'),'Real E input picks up another chocolate');
    await cdp('Page.reload',{ignoreCache:true});await pause(600);for(let i=0;i<100;i++){if(await evaluate('Boolean(window.backpack)'))break;await pause(300);}
    assert(await evaluate('backpack.count===1&&backpack.buffUntil==='+report.until),'Unused chocolate and the exact active buff survive reload together');await evaluate('enterGame()');
    const mobile=await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('backpack.open()');await pause(200);assert(await evaluate("(()=>{const r=document.querySelector('.backpack-card').getBoundingClientRect();return r.left>=0&&r.right<=390&&r.top>=0&&r.bottom<=844;})()"),'Mobile backpack stays inside viewport');
    assert.equal(errors.length,0);console.log('Wildlife streaming, roaming, map loot, backpack persistence, exact stamina buff expiry and keyboard controls verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
