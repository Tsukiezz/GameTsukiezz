(async()=>{
    const checks=[],views={};
    const check=(name,ok,detail)=>checks.push({name,ok:Boolean(ok),detail});
    const expected=['space_moon_ninja','mars_robot','millennium_dragon','monkey_king','ocean_queen'];
    const ids=Object.keys(skins.catalog);
    check('Five playable skins replace the old cast',ids.join()===expected.join()&&skins.selected===expected[0]);
    openModal('modal-heroes');
    const cards=[...document.querySelectorAll('#modal-heroes .hero-card')];
    await Promise.all(cards.map(card=>card.querySelector('img').decode()));
    check('All cards have working concept portraits and descriptions',cards.length===5&&cards.every(card=>card.querySelector('.skin-details').textContent.length>30));
    const baseVitals=[gameState.maxHealth,gameState.health,gameState.stamina,gameState.armor];
    const pose={dt:.016,time:0,moving:false,sprint:false,grounded:true,velocity:0,sitting:false,attacking:false,attackProgress:0};
    function movePose(overrides,frames=40){
        for(let i=0;i<frames;i++)updateHeroAnimation(activeLimbs,{...pose,...overrides,time:i*.016});
    }
    for(const [i,id] of ids.entries()){
        if(i)openModal('modal-heroes');
        cards[i].click();
        const actor=heroAnimationBindings.get(activeLimbs).model;
        const meshes=[];
        actor.traverse(o=>{if(o.isMesh)meshes.push(o);});
        const hilt=actor.userData.rightGrip;
        const bounds=new THREE.Box3().setFromObject(actor),height=bounds.max.y-bounds.min.y;
        check(id+' selects the corresponding Blender model',skins.selected===id&&actor.name===id&&meshes.length>=22&&height>1&&height<1.45,{height,parts:meshes.length});
        const original=hilt.getWorldPosition(new THREE.Vector3());
        movePose({moving:true,speed:.9});
        const walk=activeLimbs.leftKnee.quaternion.clone();
        movePose({moving:true,speed:1,sprint:true});
        check(id+' bends its knees while walking and changes stride while sprinting',Math.abs(walk.x)>.012&&walk.angleTo(activeLimbs.leftKnee.quaternion)>.02);
        movePose({attacking:true,attackProgress:.48},15);
        const hit=hilt.getWorldPosition(new THREE.Vector3());
        check(id+' swings from the right hand',original.distanceTo(hit)>.14);
        movePose({flying:true,moving:true,speed:1,grounded:false,vertical:1});
        const fly=actor.rotation.x;
        movePose({swimming:true,diving:true,moving:true,speed:1,grounded:false});
        check(id+' leans into flight and switches to swim strokes',fly>.22&&actor.rotation.x>fly+.25&&Math.abs(activeLimbs.leftElbow.rotation.x)>.25);
        movePose({sitting:true});
        check(id+' sits with bent knees',Math.abs(activeLimbs.leftKnee.rotation.x)>1.1);
        resetHeroAnimation(actor);
    }
    check('Skin choice preserves shared vitals',baseVitals.every((v,i)=>v===[gameState.maxHealth,gameState.health,gameState.stamina,gameState.armor][i]));
    const frameActor=heroAnimationBindings.get(activeLimbs).model;
    const sample=fps=>{
        resetHeroAnimation(frameActor);
        for(let i=0;i<fps;i++)updateHeroAnimation(activeLimbs,{...pose,dt:1/fps,time:i/fps,moving:true,sprint:true});
        return activeLimbs.leftLeg.quaternion.clone();
    };
    check('The run pose stays consistent at 30 and 120 FPS',sample(30).angleTo(sample(120))<.20);
    resetHeroAnimation(frameActor);
    technologyCraft.grant();
    for(const id of ids){
        selectHero(id);
        for(const gear of ['iron','rage','samurai','diving']){
            for(const other of ['iron','rage','samurai','diving']) technologyCraft.equip(other,false);
            technologyCraft.equip(gear,true);
            playerExperience.sync();
            const overlay=playerExperience.overlay;
            const joints=new Set(overlay.covers.map(piece=>piece.parent));
            check(id+' accepts '+gear+' on articulated mounts',overlay.mode===gear&&overlay.covers.length>=8&&[activeLimbs.body,activeLimbs.head,activeLimbs.leftElbow].every(joint=>joints.has(joint)));
        }
    }
    technologyCraft.equip('diving',false);
    crystalWings.grant();
    crystalWings.equip(true);
    crystalWings.update(.1);
    check('Crystal wings use Blender geometry on the torso',crystalWings.model.visible&&crystalWings.model.parent===activeLimbs.body&&crystalWings.joints.every(j=>j.children.some(m=>m.isMesh)));
    crystalWings.equip(false);
    weaponSystem.grant();
    weaponSystem.equip(true);
    heroMotion.syncWeapons();
    const sword=weaponSystem.model;
    sword.updateWorldMatrix(true,false);
    const handle=new THREE.Vector3(0,.25,0);
    const distance=sword.localToWorld(handle).distanceTo(heroAnimationBindings.get(activeLimbs).model.userData.rightGrip.getWorldPosition(new THREE.Vector3()));
    check('Forest sword hilt sits in the animated right grip',sword.visible&&sword.getObjectByName('forest_sword')&&distance<.001,distance);
    weaponSystem.equip(false);
    selectHero(ids[0]);
    const weather=worldWeather;
    weather.stop();
    check('Most 120-second checks keep ordinary weather',weather.interval===120&&weather.chance===.15&&!weather.roll(()=>.2));
    const sampled={};
    for(const [name,n] of Object.entries(weather.weights)){
        const total=Object.values(sampled).reduce((a,b)=>a+b,0);
        const rolls=[.01,(total+n*.5)/100];
        check('Weighted weather rolls '+name,weather.roll(()=>rolls.shift())&&weather.kind===name,weather.kind);
        weather.stop();
        sampled[name]=n;
    }
    gameState.inDialogue=false;
    gameState.isPlaying=true;
    for(let x=500;x<1300;x+=90){
        playerGroup.position.set(x,worldSurface.height(x,870),870);
        if(!weather.sheltered()&&playerSurvival.surfaceAt(x,870)===null)break;
    }
    const p=playerGroup.position;
    camera.position.copy(p).add(new THREE.Vector3(1.4,1.6,2.5));
    camera.lookAt(p.x,p.y+.7,p.z-4);
    const renderWeather=()=>{
        playerSurvival.environment();
        templeSupplies.environment();
        realmScenery.update();
        weather.environment();
        renderer.render(scene,camera);
    };
    weather.start('sandstorm');
    for(let i=0;i<40;i++)weather.update(.1);
    renderWeather();
    const storm=scene.fog.density, dust=weather.root.getObjectByName('SandstormDust');
    views['sandstorm']=renderer.domElement.toDataURL();
    check('Sandstorm severely restricts outdoor visibility',dust.visible&&storm>.17&&!stars.visible,{density:storm,position:p.toArray()});
    templeSupplies.add('elixir',1);
    openModal('modal-backpack');
    const drank=templeSupplies.consume('elixir');
    closeModal('modal-backpack');
    renderWeather();
    const clear=scene.fog.density;
    views['sandstorm-with-elixir']=renderer.domElement.toDataURL();
    check('Drinking Radiant Elixir increases storm visibility by 70 percent',drank&&dust.visible&&Math.abs(storm/clear-1.7)<.001,{storm,clear});
    const outdoor=p.clone();
    const room=voidDistrict.towers[0];
    p.copy(voidDistrict.world(room.x,0,room.z));
    renderWeather();
    check('Sandstorm stays outside buildings',weather.sheltered()&&!dust.visible&&scene.fog.density<.02);
    p.copy(outdoor);
    weather.stop();
    weather.start('sun');
    for(let i=0;i<40;i++)weather.update(.1);
    renderWeather();
    views['sun']=renderer.domElement.toDataURL();
    const solar=weather.root.getObjectByName('SunlitLunarSky');
    check('Sunny weather renders a bright sky and warm lighting',solar.visible&&!stars.visible&&weather.root.getObjectByName('SolarWeatherLight').intensity>.55&&!renderer.info.programs.some(p=>p.diagnostics?.runnable===false));
    weather.stop();
    renderWeather();
    check('Weather clears and restores the normal sky',!solar.visible&&!dust.visible&&stars.visible&&realmScenery.sky.visible&&scene.fog.density<.02);
    return {checks,views};
})()
