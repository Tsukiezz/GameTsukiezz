(async () => {
    const checks = [], views = {};
    const check = (name, ok, detail) => checks.push({name, ok: !!ok, detail});
    const T = grandTerminal, R = moonRailway, C = undergroundNetwork, V = T.vip, D = T.dispatch;
    const close = () => document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
    const place = p => { playerGroup.position.copy(p); currentGroundY = p.y; jumpVelocityY = jumpY = 0; isGrounded = true; resetGameplayInput(); };
    const initialPlayer = playerGroup.position.clone();
    close(); R.leaveForRespawn(); gameMouse.release();
    check('VIP lounge is authored in Blender', VIP_MINE_ART.source.endsWith('TsukiezzVIPAndMines.blend') && V.model.children.length >= 2);
    V.travel();
    check('Location menu reaches the physical third floor', Math.abs(T.local(playerGroup.position).y - V.floor) < .01 && Math.abs(getGroundElevation(playerGroup.position.x, playerGroup.position.z, playerGroup.position.y) - playerGroup.position.y) < .02);
    const lift = T.lifts[0];
    place(lift.worldPoint(0, true));
    if (lift.floor !== 0) { lift.request(0); for (let i = 0; i < 70; i++) lift.tick(.1); }
    window.dispatchEvent(new KeyboardEvent('keydown', {key: '3', code: 'Digit3', bubbles: true, cancelable: true}));
    for (let i = 0; i < 70; i++) stationMobility.update(.1);
    check('Cabin key 3 rides to the VIP deck', lift.floor === 2 && Math.abs(playerGroup.position.y - lift.worldPoint(2, true).y) < .03);
    const landing = lift.worldPoint(2);
    check('The third floor has an open landing with physical support', !T.blocked(landing.x, landing.z, landing.y, .24) && Math.abs(T.support(landing.x, landing.z, landing.y) - landing.y) < .02);
    const machines=V.stations.filter(s=>s.kind==='pusher'||s.kind==='claw');
    check('VIP has exactly two coin pushers, two claw machines and no food purchasing', machines.filter(s=>s.kind==='pusher').length===2&&machines.filter(s=>s.kind==='claw').length===2&&!V.stations.some(s=>s.kind==='food'));
    const arcade=machines[0], claw=machines.find(s=>s.kind==='claw'), random=Math.random;
    const play=()=>document.querySelector('#modal-terminal-vip .terminal-dialog-actions button');
    place(arcade.pos);monsterCamps.stock.goldCoin=20;checkInteractables();handleInteraction();
    try {
        check('Coin pusher displays the 3% success rate',document.querySelector('#modal-terminal-vip p').textContent.includes('3%'));
        Math.random=()=>.03;play().click();
        check('Coin pusher charges one coin and .03 is outside the prize interval',monsterCamps.stock.goldCoin===19);
        let rolls=[.0299,0];Math.random=()=>rolls.shift()??.5;play().click();
        check('Coin pusher jackpot has a 50 coin minimum',monsterCamps.stock.goldCoin===68);
        rolls=[0,.999];play().click();
        check('Coin pusher jackpot has a 100 coin maximum',monsterCamps.stock.goldCoin===167);
        close();place(claw.pos);checkInteractables();handleInteraction();
        const prizes=[...document.querySelectorAll('#modal-terminal-vip .terminal-prize')];
        check('Claw machine has five rewards with halving base rates',prizes.length===5&&prizes.map(b=>b.querySelector('span').textContent).join(',')==='1 xu · 80%,2 xu · 40%,3 xu · 20%,4 xu · 10%,5 xu · 5%');
        Math.random=()=>.052;prizes[4].click();play().click();
        check('Claw pays one coin immediately and increases the odds on left click',monsterCamps.stock.goldCoin===166&&document.querySelector('#modal-terminal-vip p').textContent.includes('5,4%'));
        await new Promise(resolve=>setTimeout(resolve,3200));
        check('Claw settles once after three seconds using the boosted odds',monsterCamps.stock.goldCoin===171&&document.querySelector('#modal-terminal-vip p').textContent.includes('5 xu vàng'));
    }finally{Math.random=random;close();}
    const massage=V.stations.find(s=>s.kind==='massage');
    place(massage.pos);gameState.stamina=20;
    checkInteractables();handleInteraction();
    for(let i=0;i<62;i++){V.update(.1);updatePlayerVertical(.03);}
    check('Massage costs two coins and keeps the player seated with full stamina',monsterCamps.stock.goldCoin===169&&isSitting&&gameState.stamina===100&&playerGroup.position.distanceTo(massage.seat)<.03);
    handleInteraction();
    keys.shift=true;playerSurvival.update(.1,true);keys.shift=false;
    check('Leaving massage starts a five-minute stamina lock',!isSitting&&V.staminaLocked&&V.massageRemaining>298000&&gameState.stamina===100);
    const now=Date.now;
    try{Date.now=()=>now()+301000;check('Massage effect expires after five minutes',!V.staminaLocked);}finally{Date.now=now;}

    check('Cave passages use the narrower 15 m lattice and preserved loot IDs', C.cell === 15 && C.legacyTiles.size === 7986 && C.chests.length === 186 && C.deposits.length === 470);
    check('Every chest is aligned to a wall and accessible', C.chests.every(c => c.wall && !C.blocked(c.item.pos.x, c.item.pos.z, c.item.pos.y, .45)), C.chests.filter(c => !c.wall).length);
    check('All four ores use individual meshes and bats are sparse', ['goldOre','diamond','krystal','mothball'].every(k => VIP_MINE_ART.models[k]?.[0].positions.length > 500) && C.bats.length === 2);
    const chance = C.chests.filter(c => c.loot.some(([kind]) => kind === 'elixir')).length / C.chests.length;
    check('Radiant Elixir has a high independent chest chance', chance > .45 && chance < .7, chance);
    const chest = C.chests.find(c => !c.item.collected && c.loot.some(([kind]) => kind === 'elixir'));
    place(chest.item.pos); const count = templeSupplies.counts.elixir;
    const gain = chest.loot.find(([kind]) => kind === 'elixir')[1];
    checkInteractables(); handleInteraction();
    check('Cave chest deposits Radiant Elixir in the actual consumables inventory once', chest.item.collected && templeSupplies.counts.elixir === count + gain && !C.interact(chest.item));
    const point = C.nodes[40].clone(); point.y = C.floor(point.x, point.z);
    place(point); crystalWings.stopFlight(); gameState.stamina = 100;
    window.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true, cancelable: true}));
    for (let i = 0; i < 6; i++) { C.update(.04); updatePlayerVertical(.04); }
    check('Space jumps normally below the cave roof', playerGroup.position.y > point.y + .5, playerGroup.position.y - point.y);
    place(point); crystalWings.grant(); crystalWings.equip(true); crystalWings.toggleFlight(); keys.swimUp = true;
    for (let i = 0; i < 35; i++) { C.update(.1); updatePlayerVertical(.1); }
    check('Wings stay active underground and stop at the roof', crystalWings.flying && playerGroup.position.y > point.y + 2 && playerGroup.position.y + PLAYER_HEIGHT <= C.roof(point.x, point.z) + .001);
    keys.swimUp = false; keys.dive = true;
    for (let i = 0; i < 30; i++) { C.update(.1); updatePlayerVertical(.1); }
    check('Controlled cave descent lands above the rock floor', Math.abs(playerGroup.position.y - point.y) < .03);
    crystalWings.stopFlight();

    const reserve = T.reserves[0], originals = R.trains.map(t => ({t, distance:t.distance,speed:t.speed,state:t.state,remaining:t.remaining,stationIndex:t.stationIndex,nextStop:t.nextStop}));
    place(T.world(reserve.x + 6, 18, 30)); C.environment(); T.update(0); gameMouse.release();
    const view = camera.position.clone(), orientation = camera.quaternion.clone();
    camera.position.copy(T.world(reserve.x + 6, 21, 30)); camera.lookAt(T.world(reserve.x, 21, 30));
    const rect = renderer.domElement.getBoundingClientRect();
    window.dispatchEvent(new MouseEvent('mousedown', {button:2, clientX:rect.left+rect.width/2, clientY:rect.top+rect.height/2, cancelable:true, bubbles:true}));
    const action = document.querySelector('#modal-reserve-dispatch.active .terminal-dialog-actions button');
    check('Right-clicking the visible locomotive opens Chạy tuyến chính', action?.textContent === 'Chạy tuyến chính');
    if (action) action.click(); else { close(); D.request(reserve); }
    check('A departure request queues only the selected reserve', D.queue.length === 1 && D.queue[0] === reserve && reserve.parked);
    const forward = R.trains.filter(t => t.trackId === reserve.trackId), leader = forward[0], follower = forward[1], merge = reserve.route.merge;
    const wrap = d => (d + reserve.route.service.length) % reserve.route.service.length;
    function resetTrain(train,distance,state='moving') {
        train.distance=wrap(distance);train.state=state;train.speed=0;train.remaining=state==='stopped'?60:0;
        train.nextStop=train.stops.reduce((best,s,i)=>wrap(s.distance-train.distance)<wrap(train.stops[best].distance-train.distance)?i:best,0);
    }
    resetTrain(leader,merge+115); resetTrain(follower,merge-1320); resetTrain(forward[2],merge-2800); R.update(0);
    check('A leader gets departure acceleration when requested reserve follows', D.accelerate(leader));
    D.update(.1);
    check('Departure uses siding with visible moving stock and reserves an approach signal', reserve.status === 'joining' && !reserve.parked && R.physicalTrains.includes(D.joining?.train) && Number.isFinite(D.signalGap(follower)));
    resetTrain(leader,merge+115,'stopped');R.update(0);
    for(let i=0;i<450;i++)D.update(.1);
    const held = D.joining;
    check('A reserve stops behind a stationary leader with safe main-line headway', held && held.train.speed < .05 && held.distance <= reserve.route.length + 15.01, held?.distance - reserve.route.length);
    resetTrain(leader,merge+430);R.update(0);
    for(let i=0;i<180&&D.joining;i++)D.update(.1);
    const train=R.trains.find(t=>t.id==='reserve-'+reserve.id);
    check('Reserve joins the existing service with all coaches, gangways and stops', reserve.status==='active' && train?.vehicles.length===4 && train?.gangways.length===2 && train.stops.length>=69 && !D.joining && train.vehicles[0].position.distanceTo(R.vehiclePose(train.distance,train).position)<.015);
    check('Every departure is a continuous curve ending exactly on its assigned main track', T.reserves.every(v=>{const r=v.route;const a=r.pose(r.length+9),b=R.vehiclePose(r.merge+9,r.service);return r.points.every((p,i)=>!i||p.distanceTo(r.points[i-1])<3.4)&&a.position.distanceTo(b.position)<.01;}));
    const obstructions=[];
    for(const v of T.reserves)for(const route of [v.route,v.inbound])for(let d=route.start||0;d<route.length;d+=3){
        const {position,yaw}=route.pose(d),q=T.local(position),angle=yaw-T.plan.yaw;
        const width=3.3*Math.abs(Math.cos(angle))+6.8*Math.abs(Math.sin(angle));
        const depth=3.3*Math.abs(Math.sin(angle))+6.8*Math.abs(Math.cos(angle));
        const hit=T.solids.find(b=>!b.reserve && b.name!=='ReserveGate_'+v.id && q.y+.32<b.maxY && q.y+6.5>b.minY && q.x+width>b.minX && q.x-width<b.maxX && q.z+depth>b.minZ && q.z-depth<b.maxZ);
        if(hit)obstructions.push({train:v.id,solid:hit.name,point:q.toArray()});
    }
    check('All twelve turnout paths clear station structures', obstructions.length===0, obstructions.slice(0,8));
    check('Every inbound turnout joins from behind and ends at the correct berth',T.reserves.every(v=>{
        const {inbound:r}=v, end=T.local(r.pose(r.length).position);
        return r.pose(-9).position.distanceTo(R.vehiclePose(r.merge-9,r.service).position)<.02&&Math.abs(end.x-v.x)<.02&&Math.abs(end.z-Math.sign(v.x)*30)<.02;
    }));
    document.querySelector('.hud-actions [aria-label="Điều độ tàu"]').click();
    const panel=document.getElementById('modal-terminal-fleet'), rows=panel.querySelectorAll('.terminal-fleet-list>div');
    check('Consolidated fleet lists six always-running main trains and six controllable reserves',rows.length===12&&[...rows].slice(0,6).every(r=>!r.querySelector('button'))&&[...rows].slice(6).every(r=>r.querySelector('button')));
    const beforeControl=leader.distance;
    R.update(.1);
    check('Main-line simulation continues while the fleet dashboard is open',leader.distance!==beforeControl);
    [...rows[6].querySelectorAll('button')].find(b=>b.textContent==='Về nghỉ')?.click();
    check('Fleet return command queues the selected active reserve',reserve.status==='returnQueued'&&train?.returnToDepot);
    close();
    if(train&&reserve.status==='returnQueued'){
        const entry=reserve.inbound.merge;
        resetTrain(leader,entry+770);resetTrain(follower,entry-1500);resetTrain(forward[2],entry-2900);
        resetTrain(train,entry-10);train.speed=6;
        for(let i=0;i<70&&!D.joining;i++)R.update(.1);
        check('Rail service brakes at the rear turnout and removes both barriers before returning',D.joining?.inbound&&reserve.status==='returning'&&reserve.gates.every(g=>!g.barrier.visible&&g.collider.disabled)&&R.trains.length===6,{status:reserve.status, gap:D.returnGap(train), distance:train.distance, entry, waiting:train.waitingForSignal});
        for(let i=0;i<520&&D.joining;i++)D.update(.1);
        check('Returned reserve is parked behind closed gates and can dispatch again',reserve.status==='parked'&&reserve.parked&&reserve.gates.every(g=>g.barrier.visible&&!g.collider.disabled)&&reserve.display.every(m=>m.visible)&&R.trains.length===6,{status:reserve.status, progress:D.joining?.distance, target:reserve.inbound.length, speed:train.speed, position:T.local(train.vehicles[0].position).toArray()});
    }
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'u',bubbles:true,cancelable:true}));
    const fleetActions=panel.querySelectorAll('.terminal-dialog-actions button');
    fleetActions[0]?.click();
    check('Keyboard opens fleet controls and the group command queues all six reserves',panel.classList.contains('active')&&D.queue.length===6);
    panel.querySelectorAll('.terminal-dialog-actions button')[1]?.click();
    check('Group rest cancels all pending departures and keeps the six main trains',!D.queue.length&&R.trains.length===6);
    close();
    for (const {t,...state} of originals) Object.assign(t,state);
    if (train&&R.trains.includes(train)) { R.releaseReserve(train); R.parkReserve(reserve,train); }
    R.update(0);
    const ramp=caveAccess.paths[0], surface=ramp.points[0], shallow=ramp.points[4], lower=ramp.points[10];
    const uncovered=[];
    for(const [i,path] of caveAccess.paths.entries()){
        const cut=caveAccess.openings[i];
        for(let z=cut.z+.25;z<cut.w-.45;z+=.75){
            const width=cut.y*THREE.MathUtils.lerp(.52,1,THREE.MathUtils.smoothstep(z,cut.z,cut.z+4));
            for(const fraction of [-.96,0,.96]){
                const x=cut.x+width*fraction;
                if(caveAccess.portalTop(x,z)<worldSurface.height(x,z)-.03)uncovered.push({i,x,z});
            }
        }
    }
    check('All fifteen Blender canopies cover the cut from above',caveAccess.paths.length===15&&uncovered.length===0,uncovered.slice(0,8));
    const ridgeZ=surface.z-9, ridgeTop=caveAccess.portalTop(surface.x,ridgeZ);
    check('Canopy gives the player real support when landing from above',ridgeTop>surface.y+4&&Math.abs(getGroundElevation(surface.x,ridgeZ,ridgeTop+.4)-ridgeTop)<.03);
    check('Rock shoulders are solid and the walk-in arch stays clear',checkCollision(surface.x+4,surface.z-2,worldSurface.height(surface.x+4,surface.z-2))&&!checkCollision(shallow.x,shallow.z,shallow.y));
    place(surface);C.environment();
    check('Surface camera cannot cut down through earth at a quarry mouth',C.clipView(surface,surface.clone().add(new THREE.Vector3(0,-5,2))).y>surface.y-.15);
    place(shallow);C.environment();
    check('Open quarry approach keeps surrounding terrain visible',(camera.layers.mask&1)!==0);
    place(lower);C.environment();
    check('Covered shaft isolates the underground render layer',camera.layers.mask===(1<<3));
    place(point);C.environment();
    const clipped=C.clipView(point,point.clone().add(new THREE.Vector3(0,-8,0)));
    check('Camera ray stops before the deep cave floor',clipped.y>=point.y+.09,clipped.y-point.y);
    place(initialPlayer);C.environment();
    const gripRig=new THREE.Group();gripRig.scale.setScalar(.2);
    applyHeroSelection('hamster');heroMotion.alignWeapon(gripRig,.25);
    const expected=activeLimbs.rightArm.localToWorld(new THREE.Vector3(.15,0,.32));
    const actual=gripRig.position.clone().add(new THREE.Vector3(0,.05,0).applyQuaternion(gripRig.quaternion));
    check('Right-hand grip aligns the blade handle with the right palm',actual.distanceTo(expected)<.001&&actual.distanceTo(activeLimbs.leftArm.getWorldPosition(new THREE.Vector3()))>.1);
    const fog=scene.fog.density;
    function shot(name,pos,target){place(pos);camera.position.copy(pos);camera.lookAt(target);T.update(0);caveAccess.update();C.update(0);C.environment();graphicsQuality.update(1);realmScenery.update();scene.fog.density=.0002;const vis=playerGroup.visible;playerGroup.visible=false;heroMotion.syncWeapons();renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');playerGroup.visible=vis;heroMotion.syncWeapons();}
    shot('vip-cafe',T.world(1,V.floor+4,-22),T.world(-14,V.floor+2,-36));
    shot('vip-arcade',T.world(5,V.floor+2,21),T.world(15,V.floor+1.8,17));
    shot('vip-lounge',T.world(0,V.floor+4,32),T.world(4,V.floor+1.7,58));
    shot('terminal-brighter',T.world(45,5,-83),T.world(-28,10,50));
    shot('quarry-oblique',surface.clone().add(new THREE.Vector3(14,14,10)),surface.clone().add(new THREE.Vector3(0,2.5,-8)));
    shot('quarry-front',surface.clone().add(new THREE.Vector3(5.5,2.8,11)),surface.clone().add(new THREE.Vector3(0,2.15,-3)));
    scene.fog.density=fog;camera.position.copy(view);camera.quaternion.copy(orientation);place(initialPlayer);C.environment();
    return {checks,views};
})()
