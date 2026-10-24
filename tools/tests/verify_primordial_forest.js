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
      enterGame();setGraphicsProfile('potato');const d=ANCIENT_GROVE_DATA,g=ancientGrove,m=forestGuardian,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      const place=(x,z)=>{playerGroup.position.set(x,getGroundElevation(x,z,20),z);currentGroundY=playerGroup.position.y;isGrounded=true;};
      const tick=(seconds)=>{for(let i=0;i<seconds*60;i++)m.update(1/60);};
      check('Forest is three times its previous rectangular area',d.areaScale===3&&(d.bounds.maxX-d.bounds.minX)*(d.bounds.maxZ-d.bounds.minZ)===3*98*284);
      check('Blender scene contains over 1000 normal trees',d.source==='Blender'&&d.instances.filter(p=>['birch','pine','willow','fern'].includes(p.kind)).length>=1020);
      check('No trail geometry or trail route remains',d.trail.length===0&&!g.group.children.some(p=>p.name==='GroveFootpath'));
      const elder=d.instances.find(p=>p.kind==='elder'),height=Math.max(...d.prototypes.elder.flatMap(p=>p.vertices.map(v=>v[1])));check('Original giant elder remains over 100m tall',elder.x===202&&elder.z===-206&&height>100);
      function walkTo(tx,tz){
        const step=2,x0=150,z0=-242,nx=145,nz=140,start=[70,138],goal=[Math.round((tx-x0)/step),Math.round((tz-z0)/step)],queue=[start],parents=new Map([[start.join(','),null]]);let found=false;
        for(let n=0;n<queue.length;n++){const [i,j]=queue[n];if(i===goal[0]&&j===goal[1]){found=true;break;}for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,key=ni+','+nj;if(ni<0||nj<0||ni>=nx||nj>=nz||parents.has(key))continue;const x=x0+ni*step,z=z0+nj*step,y=g.ground(x,z);if(y===null||checkCollision(x,z,y,.36))continue;let obstructed=false;for(let q=1;q<=8;q++){const sx=x0+(i+di*q/8)*step,sz=z0+(j+dj*q/8)*step;if(checkCollision(sx,sz,g.ground(sx,sz),.36))obstructed=true;}if(obstructed)continue;parents.set(key,[i,j]);queue.push([ni,nj]);}}
        if(!found)return {found:false};const route=[];let at=goal;while(at){route.push(at);at=parents.get(at.join(','));}route.reverse();place(x0+start[0]*step,z0+start[1]*step);
        for(const [i,j] of route.slice(1)){const x=x0+i*step,z=z0+j*step,dx=x-playerGroup.position.x,dz=z-playerGroup.position.z,parts=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));for(let k=0;k<parts;k++){movePlayerWithCollisions(dx/parts,dz/parts);updatePlayerVertical(1/60);}if(Math.hypot(playerGroup.position.x-x,playerGroup.position.z-z)>.3)return {found:true,walked:false,at:[x,z],p:playerGroup.position.toArray()};}
        return {found:true,walked:true};
      }
      for(const [name,x,z] of [['elder',202,-190],['guardian',340,-138]]){const route=walkTo(x,z);check('Natural forest remains traversable from gate to '+name,route.found&&route.walked,route);}
      g.update(202,-190);check('Elder discovery still persists',g.discovered&&localStorage.getItem('tsuventure_ancient_grove_discovered_v1')==='true');
      const mismatches=d.instances.filter(p=>g.contains(p.x,p.z)&&Math.abs(g.ground(p.x,p.z)-p.y-(p.kind==='rock'?.5:0))>.07);check('Blender placements align with physical ground',mismatches.length===0,{count:mismatches.length});
      check('Minimal retains all essential trees',g.batches.filter(o=>!o.userData.optionalFlora).every(o=>o.visible));setGraphicsProfile('ultra');check('Ultra restores optional woodland detail',g.batches.every(o=>o.visible));setGraphicsProfile('potato');
      const b=d.bounds,open=[];
      for(let x=b.minX;x<=b.maxX;x++){if(!checkCollision(x,b.minZ,getGroundElevation(x,b.minZ,20)))open.push([x,b.minZ]);if(!checkCollision(x,b.maxZ,getGroundElevation(x,b.maxZ,20)))open.push([x,b.maxZ]);}
      for(let z=b.minZ;z<=b.maxZ;z++){if(!checkCollision(b.minX,z,getGroundElevation(b.minX,z,20)))open.push([b.minX,z]);if(!checkCollision(b.maxX,z,getGroundElevation(b.maxX,z,20)))open.push([b.maxX,z]);}
      check('Exactly one open perimeter passage',open.length>=5&&open.every(([x,z])=>Math.abs(x-d.gate.x)<4&&z===d.gate.z),{open});
      check('Fence blocks a jumping character too',d.fence.every(c=>checkCollision(c.x,c.z,c.minY+3)));
      g.travel();check('Fast travel lands outside the only entrance',playerGroup.position.x===290&&playerGroup.position.z===48&&!checkCollision(290,48,playerGroup.position.y));
      for(let i=0;i<180;i++){movePlayerWithCollisions(0,-.1);updatePlayerVertical(1/60);}check('Actual walking enters through the gate',playerGroup.position.z<32,{p:playerGroup.position.toArray()});
      for(let i=0;i<180;i++){movePlayerWithCollisions(0,.1);updatePlayerVertical(1/60);}check('Same gate allows returning outside',playerGroup.position.z>47);
      check('Guardian mesh was authored in Blender with six joints',m.data.source==='Blender'&&Object.keys(m.joints).length===6&&m.health===7000);
      g.travel();tick(2);check('Distant guardian is an ordinary tree',m.state==='tree'&&m.treeModel.visible&&!m.awakeModel.visible&&!fieldGuide.records.forest_guardian);
      place(m.position.x+10,m.position.z);tick(2);check('Approach transforms tree into guardian',m.state!=='tree'&&m.awakeModel.visible&&!m.treeModel.visible);
      check('Transformation unlocks guardian in library',Boolean(fieldGuide.records.forest_guardian));
      const armor=gameState.armor;tick(2);check('Guardian attacks an intruder after a warning',gameState.armor<armor,{armor:gameState.armor});
      g.travel();const protectedArmor=gameState.armor;tick(3);check('Leaving restores tree disguise and stops damage',m.state==='tree'&&m.treeModel.visible&&!m.awakeModel.visible&&gameState.armor===protectedArmor);
      place(m.position.x,m.position.z+3.5);tick(2);
      for(const [hero,damage] of [['hamster',145],['rabbit',110],['dragon_knight',135]]){applyHeroSelection(hero);isAttacking=false;gameState.stamina=100;const hp=m.health;triggerAttack();tick(.25);check(hero+' actual attack damages guardian once',m.health===hp-damage,{before:hp,after:m.health});tick(.5);check(hero+' damage does not repeat during swing',m.health===hp-damage);}
      openModal('modal-settings');const frozen=m.health,beforeArmor=gameState.armor;tick(4);check('Settings pause guardian simulation',m.health===frozen&&gameState.armor===beforeArmor);closeModal('modal-settings');
      place(m.position.x+10,m.position.z);m.pause();gameState.health=1;gameState.armor=0;tick(6);check('Guardian defeat recovers player at the single safe entrance',gameState.health===100&&playerGroup.position.x===290&&playerGroup.position.z===48);
      m.hit(10000);tick(1);check('Death clamps HP and disables collision',m.health===0&&m.state==='dead'&&m.collider.disabled&&fieldGuide.records.forest_guardian.defeated);
      check('Library still excludes playable characters',!fieldGuide.catalog.some(i=>i.type==='heroes'));
      for(const item of fieldGuide.catalog)fieldGuide.record(item.id);fieldGuide.open();
      check('Known monster cards show actual rendered images',document.querySelectorAll('.field-guide-grid img').length===3&&[...document.querySelectorAll('.field-guide-grid img')].every(img=>img.src.startsWith('data:image/png')));
      const images=fieldGuide.catalog.map(item=>({id:item.id,image:libraryPreviews.get(item.id)}));check('Every NPC and environment has a real render',images.every(i=>i.image?.length>4000),{lengths:images.map(i=>[i.id,i.image?.length])});check('Images are distinct for each entry',new Set(images.map(i=>i.image)).size===images.length);
      document.querySelector('[data-category=npcs]').click();check('NPC cards use model renders',document.querySelectorAll('.field-guide-grid img').length===2&&!document.querySelector('.field-guide-grid .field-guide-icon'));
      document.querySelector('[data-category=places]').click();check('Place cards use scene renders',document.querySelectorAll('.field-guide-grid img').length===landmarksData.length);
      document.querySelector('[data-category=monsters]').click();
      return {results};
    })()`);
    fs.writeFileSync(path.join(output,'primordial-forest-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));assert.equal(errors.length,0);
    await pause(600);const book=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'library-real-models.png'),Buffer.from(book.data,'base64'));
    for(const [name,expression] of [
      ['forest-guardian-model',"libraryPreviews.get('forest_guardian')"],
      ['primordial-forest-overview',"libraryPreviews.get('place_6')"],
      ['guardian-tree-disguise',"(()=>{const g=forestGuardian;g.treeModel.visible=true;g.treeModel.scale.setScalar(1);return libraryPreviews.cache.get('tree')||null;})()"]]){
        const data=await evaluate(expression);if(data)fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
    }
    await cdp('Page.reload',{ignoreCache:true});await pause(500);for(let i=0;i<100;i++){if(await evaluate('Boolean(window.fieldGuide)'))break;await pause(300);}
    assert(await evaluate('fieldGuide.records.forest_guardian?.defeated===true&&ancientGrove.discovered'));assert.equal(errors.length,0);
    console.log('Primordial forest, titanium perimeter, mimic guardian combat, real model library renders and persistence verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
