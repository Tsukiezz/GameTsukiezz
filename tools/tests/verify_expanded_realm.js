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
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(`(()=>{
      enterGame();setGraphicsProfile('potato');
      const d=EXPANDED_REALM_DATA,l=mercuryLake,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
      check('Terrain and each playable axis are four times the previous size',d.size===560*4&&d.bound===248*4&&groundGeo.parameters.width===2240,{size:d.size,bound:d.bound});
      check('Hero size unchanged',playerGroup.scale.x===.2);
      for(const [x,z] of [[900,900],[-900,900],[900,-900],[-900,-900]]){
        const y=getGroundElevation(x,z,50);check('Expanded corner is walkable '+x+','+z,!checkCollision(x,z,y)&&Math.abs(y-realmTerrainHeight(x,z))<.01);
      }
      check('Expanded world boundary is physical',checkCollision(993,0,0)&&checkCollision(0,-993,0)&&!checkCollision(990,0,getGroundElevation(990,0,0)));
      check('Safety bedrock spans entire expanded map',moonSafetyLayer.size===2240&&moonSafetyLayer.contains(1000,-1000));
      check('Crystal highways and ghost road support removed',crystalRoadSegments.length===0&&allHighwayPylons.length===8,{roads:crystalRoadSegments.length,pylons:allHighwayPylons.length});
      check('Lake was authored in Blender and grew beyond 290m across',d.source==='Blender'&&l.data.rx*2===300&&l.data.parts.length>200);
      check('Old lake colliders and interactions removed',!interactables.some(i=>i.type==='mercury_lake'&&Math.hypot(i.pos.x+35,i.pos.z+135)<40));
      check('Basalt cliffs reach above 100 metres',Math.max(...l.data.parts.filter(p=>p.name==='lake-basalt-cliff').flatMap(p=>p.vertices.map(v=>v[1])))>100);
      l.travel();check('Lake travel lands on a safe lookout',playerGroup.position.y===5.4&&!checkCollision(playerGroup.position.x,playerGroup.position.z,5.4));
      for(let i=0;i<1540;i++){movePlayerWithCollisions(0,-.1);updatePlayerVertical(1/60);}
      check('Entire stone causeway reaches central shrine',Math.hypot(playerGroup.position.x-l.data.x,playerGroup.position.z-l.data.z)<.2&&Math.abs(playerGroup.position.y-5.4)<.1,{position:playerGroup.position.toArray()});
      check('Shrine E interaction is reachable',playerGroup.position.distanceTo(interactables.find(i=>i.id==='mercury_shrine').pos)<11);
      const c=l.data.colliders.find(c=>c.name==='lake-basalt-cliff');check('Cliff collision blocks walking through stone',checkCollision(l.data.x+c.x,l.data.z+c.z,c.minY+.4));
      playerGroup.position.set(l.data.x+50,3,l.data.z);currentGroundY=3;isGrounded=false;jumpVelocityY=0;
      for(let i=0;i<180;i++)updatePlayerVertical(1/60);
      check('Leaving the bridge settles at the liquid instead of an inescapable pit',Math.abs(playerGroup.position.y-(l.data.waterY-.5))<.03,{height:playerGroup.position.y});
      playerGroup.position.set(l.data.x+45,getGroundElevation(l.data.x+45,l.data.z+40,1),l.data.z+40);isGrounded=true;currentGroundY=playerGroup.position.y;
      for(let i=0;i<1250;i++){movePlayerWithCollisions(0,.1);updatePlayerVertical(1/60);}
      check('Player can leave liquid via open graded north bank',playerGroup.position.z>l.data.z+155&&playerGroup.position.y>1,{position:playerGroup.position.toArray()});
      setGraphicsProfile('potato');check('Minimal disables lake point lights',l.group.children.filter(o=>o.isPointLight).every(o=>!o.visible));
      l.update(3);check('Animated silver surface updates',l.water.material.uniforms.time.value===3);
      return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'expanded-realm-report.json'),JSON.stringify(report,null,2));assert(report.results.every(r=>r.ok));if(errors.length)console.error(errors);assert.equal(errors.length,0);
    await evaluate("mercuryLake.travel();setGraphicsProfile('balanced');gameState.inDialogue=true;camera.far=3400;camera.updateProjectionMatrix();renderer.setPixelRatio(.8);camera.position.set(-205,105,-212);camera.lookAt(-370,23,-455);mercuryLake.update(8);renderer.render(scene,camera);");
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'mercury-lake-overview.png'),Buffer.from(shot.data,'base64'));
    assert(await evaluate('renderer.info.programs.every(p=>p.diagnostics?.runnable!==false)'),'Lake shaders compile');
    await evaluate("camera.position.set(-370,7.5,-288);camera.lookAt(-370,26,-452);mercuryLake.update(12);renderer.render(scene,camera);");
    const close=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'mercury-lake-causeway.png'),Buffer.from(close.data,'base64'));
    console.log('Expanded map, lake, collision and navigation verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
