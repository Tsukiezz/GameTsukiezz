// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.join(os.tmpdir(),'tsuventure-mangrove-verification');
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
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, method==='Browser.close'?2000:120000);
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
        try { tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith(url)&&!message.params.response.url.endsWith('/favicon.ico')&&message.params.response.status>=400)errors.push('HTTP '+message.params.response.status+' '+message.params.response.url);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');await cdp('Network.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.moonRailway && window.fieldGuide)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,200),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(`(()=>{
        enterGame();setGraphicsProfile('low');const checks=[],check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name);},r=moonRailway;
        check(!!worldSurface&&worldSurface.anchored.length>0,'Rendered terrain surface and plant anchors initialized');
        const visible=worldSurface.anchored.filter(a=>!a.cleared);check(visible.every(a=>Math.abs(a.y-a.offset-worldSurface.height(a.x,a.z))<.02),'Existing forest, mountain and legacy flora rest on actual terrain');
        const surfaces=[ground,window.terrainContinuity?.terrain,window.technologyBase?.terrain,riverRealm.terrain,bachKhuyet.terrain,volcanicValley.terrain,mangroveRealm.terrain,ancientGrove.group.getObjectByName('GroveForestFloor')],ray=new THREE.Raycaster(),matrix=new THREE.Matrix4(),point=new THREE.Vector3();scene.updateMatrixWorld(true);
        let samples=0;for(let i=0;i<visible.length;i+=137){const anchor=visible[i];anchor.mesh.getMatrixAt(anchor.index,matrix);point.setFromMatrixPosition(matrix);ray.set(new THREE.Vector3(point.x,1400,point.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(surfaces,false)[0];if(!hit)continue;check(Math.abs(point.y-anchor.offset-hit.point.y)<.035,'Actual plant matrix matches independent terrain ray '+samples++);}check(samples>50,'Plant grounding checked against rendered triangles across map');
        check(livingWorld.placements.every(p=>Math.abs(p.y-worldSurface.height(p.x,p.z))<.02),'World trees and flowers generated after terrain grading');
        check(lunarBiome.placements.every(p=>Math.abs(p.y-worldSurface.height(p.x,p.z))<.02),'Lunar grass follows graded terrain');
        check(!livingWorld.placements.some(p=>r.infrastructureAt(p.x,p.z))&&!lunarBiome.placements.some(p=>r.infrastructureAt(p.x,p.z)),'Station forecourts and rail tracks are clear of new plants');
        for(const actor of livingWorld.actors.filter(a=>a.kind!=='butterfly'))check(Math.abs(actor.group.position.y-worldSurface.height(actor.group.position.x,actor.group.position.z))<.05,'Grounded wildlife '+actor.kind);
        for(const actor of livingWorld.actors.filter(a=>a.kind!=='butterfly')){actor.group.updateWorldMatrix(true,true);const feet=new THREE.Box3().setFromObject(actor.group).min.y;check(Math.abs(feet-worldSurface.height(actor.group.position.x,actor.group.position.z))<.08,'Actual wildlife feet touch terrain '+actor.kind);}
        for(let i=0;i<r.stations.length;i++){const st=r.stations[i],origin=st.platform.clone().add(new THREE.Vector3(0,.45,0)),desired=origin.clone().add(new THREE.Vector3(3,-3,3)),clipped=mapVisualRepair.clipCamera(origin,desired);check(clipped.y>=worldSurface.height(clipped.x,clipped.z)+.1,'Camera stays above rendered ground at station '+i);}
        const station=r.stations[0],origin=station.model.localToWorld(new THREE.Vector3(7,1.5,-10)),behind=station.model.localToWorld(new THREE.Vector3(35,1.5,-10)),clipped=mapVisualRepair.clipCamera(origin,behind);check(clipped.distanceTo(origin)<behind.distanceTo(origin)-2,'Camera clips against actual station walls and pillars');
        worldSurface.resetCamera();check(worldSurface.cameraNeedsReset(playerGroup.position),'Camera snaps cleanly on first frame after travel');check(!worldSurface.cameraNeedsReset(playerGroup.position),'Camera remains smoothly attached during ordinary movement');check(worldSurface.cameraNeedsReset(playerGroup.position.clone().add(new THREE.Vector3(100,0,0))),'Teleport resets camera instead of dragging through terrain');
        applyHeroSelection('ninja_yinyang');check(activeHeroType==='ninja_yinyang'&&playerGroup.children.includes(ninjaVisualGroup),'Ninja is a real selectable player model');
        for(const state of [{grounded:true,moving:true},{grounded:false,moving:false},{grounded:true,moving:false,sitting:true},{grounded:false,moving:true,swimming:true}]){updateHeroAnimation(activeLimbs,{dt:.05,time:1,sprint:false,velocity:0,attacking:true,attackProgress:.5,hero:'ninja_yinyang',...state});check(Number.isFinite(activeLimbs.leftArm.rotation.x),'Ninja walk, jump, sit and swim pose stays finite');}
        check(ninjaVisualGroup.userData.bones.arm_L&&ninjaVisualGroup.userData.bones.arm_R&&heroAnimationBindings.has(activeLimbs),'Ninja rig supports shared movement animation');
        r.travel(0);gameState.stamina=100;gameState.oxygen=100;const before=playerGroup.position.clone();heroMotion.state.yaw=r.stations[0].yaw+Math.PI/2;check(ninjaAbilities.dash(),'Shadow Step can start on ground');check(gameState.stamina===80,'Shadow Step has real stamina cost');check(!ninjaAbilities.dash(),'Shadow Step cooldown prevents spam');for(let i=0;i<20;i++){ninjaAbilities.update(.01);updatePlayerVertical(.01);}check(playerGroup.position.distanceTo(before)>.3,'Shadow Step moves through actual collision system');
        gameState.stamina=100;isAttacking=false;triggerAttack();check(isAttacking&&gameState.stamina===94,'Ninja dual-dagger attack has its own stamina cost');ninjaAbilities.reset();isAttacking=false;
        const target=new THREE.Group();target.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.5),new THREE.MeshBasicMaterial()));target.position.copy(playerGroup.position).add(new THREE.Vector3(0,.35,.8));scene.add(target);const health={value:500};monsterSkills.minions.push({group:target,get health(){return health.value;},set health(v){health.value=v;}});
        ninjaAbilities.strike();ninjaAbilities.strike();ninjaAbilities.strike();check(health.value===86,'Assassin combo deals 112, 112 and 190 critical damage');monsterSkills.minions.pop();scene.remove(target);ninjaAbilities.reset();
        for(const hero of ['hamster','rabbit','dragon_knight','kingkong','ninja_yinyang']){applyHeroSelection(hero);check(!!activeLimbs&&!!activeWeaponArm,'Existing hero selection retained '+hero);}
        applyHeroSelection('ninja_yinyang');r.travel(0);gameState.inDialogue=true;const png=libraryPreviews.get('royal_train_driver');check(!!png,'Existing library remains available');
        return {checks,anchored:worldSurface.anchored.length,flora:livingWorld.placements.length,grass:lunarBiome.placements.length};
    })()`);
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'surface-ninja-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);console.log('Surface, ecology, camera and ninja integration verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
