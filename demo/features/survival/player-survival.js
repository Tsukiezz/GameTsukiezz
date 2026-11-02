/* Shared stamina, buoyancy, diving and oxygen for every playable hero. */
function installPlayerSurvival(){
    const lake=mercuryLake.data,normalFog=scene.fog.color.clone(),waterFog=new THREE.Color(0x122b39);
    Object.assign(gameState,{stamina:100,maxStamina:100,oxygen:100,maxOxygen:100});
    let swimming=false,underwater=false,exhausted=false,sprinting=false,oxygenDamage=0;
    function inOriginalLake(x,z){return Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)<.99;}
    function inLakeColumn(x,z){return Boolean(window.worldExpansion?.waterAt(x,z))||inOriginalLake(x,z)||Boolean(window.mangroveRealm?.waterAt(x,z)||window.riverRealm?.waterAt(x,z));}
    function surfaceAt(x,z){return window.worldExpansion?.waterAt(x,z)?.y??window.mangroveRealm?.waterAt(x,z)?.y??window.riverRealm?.waterAt(x,z)?.y??(inOriginalLake(x,z)?lake.waterY:null);}
    function bottomAt(x,z){return window.worldExpansion?.height(x,z)??window.mangroveRealm?.ground(x,z)??window.riverRealm?.ground(x,z)??realmTerrainHeight(x,z);}
    function inWater(p){const surface=surfaceAt(p.x,p.z),deck=window.mangroveRealm?.support(p.x,p.z,p.y);if(Number.isFinite(deck)&&deck>=surface-.6&&p.y>=deck-.15)return false;return surface!==null&&bottomAt(p.x,p.z)<surface-.3&&p.y<surface-.05&&!lakeMonsters.onBridge(p);}
    function active(){return gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');}
    function spend(){return active();}
    function refresh(){swimming=inWater(playerGroup.position);underwater=swimming&&playerGroup.position.y+PLAYER_HEIGHT<surfaceAt(playerGroup.position.x,playerGroup.position.z)-.1;return swimming;}
    function respawn(){if(window.playerLife){playerLife.die();return;}
        if(window.mangroveRealm?.contains(playerGroup.position.x,playerGroup.position.z)){oxygenDamage=0;exhausted=false;resetGameplayInput();mangroveRealm.rescue();refresh();return;}
        gameState.health=gameState.maxHealth;gameState.armor=gameState.maxArmor;gameState.oxygen=100;gameState.stamina=100;
        const river=Boolean(window.riverRealm?.waterAt(playerGroup.position.x,playerGroup.position.z))&&!inOriginalLake(playerGroup.position.x,playerGroup.position.z);
        oxygenDamage=0;exhausted=false;resetGameplayInput();lakeMonsters.pause();if(river)riverRealm.rescue();else mercuryLake.travel();refresh();
        showNotification('Hết oxy! Bạn đã được đưa về bờ an toàn.');
    }
    function update(dt,moving){
        dt=Math.min(.1,Math.max(0,dt));refresh();if(!active())return;
        const infinite=Boolean(window.backpack?.infiniteStamina);if(infinite)gameState.stamina=100;
        if(gameState.stamina<=.05)exhausted=true;if(gameState.stamina>=20)exhausted=false;
        sprinting=keys.shift&&moving&&isGrounded&&!swimming&&!window.crystalWings?.flying&&!window.moonRailway?.aboard&&!window.riverBoat?.aboard&&!exhausted&&gameState.stamina>0;
        if(infinite)gameState.stamina=100;
        else if(sprinting)gameState.stamina=Math.max(0,gameState.stamina-dt*16);
        
        else gameState.stamina=Math.min(100,gameState.stamina+dt*(isSitting?22:14));
        if(underwater){
            if(window.technologyCraft?.divingEquipped){gameState.oxygen=100;oxygenDamage=0;}else gameState.oxygen=Math.max(0,gameState.oxygen-dt*14);
            if(gameState.oxygen===0){oxygenDamage+=dt;while(oxygenDamage>=1){oxygenDamage--;window.playerLife?.noteDamage('oxygen');gameState.health=Math.max(0,gameState.health-8);}}
            if(gameState.health===0)respawn();
        }else{gameState.oxygen=Math.min(100,gameState.oxygen+dt*16);oxygenDamage=0;}
        updatePlayerVitals();
    }
    function vertical(dt){
        if(!refresh())return false;window.playerLife?.resetFall();
        isSitting=false;isGrounded=false;jumpVelocityY=0;jumpY=0;
        const p=playerGroup.position,surface=surfaceAt(p.x,p.z)-.5,bottom=bottomAt(p.x,p.z)+.12;
        let velocity=0;
        const suited=Boolean(window.technologyCraft?.divingEquipped);
        if(exhausted&&!suited)velocity=.6;
        else if(keys.swimUp||keys.jump)velocity=suited?3.5:.6;
        else if(keys.dive)velocity=suited?-3:-.4;
        else if(p.y>surface)velocity=-1.5;
        let next=Math.max(bottom,Math.min(surface,p.y+velocity*dt));
        for(const c of nearbyColliders(p.x,p.z)){
            if(c.disabled||c.type!=='box'||p.x+PLAYER_RADIUS<c.minX||p.x-PLAYER_RADIUS>c.maxX||p.z+PLAYER_RADIUS<c.minZ||p.z-PLAYER_RADIUS>c.maxZ)continue;
            if(next>p.y&&p.y+PLAYER_HEIGHT<=c.minY&&next+PLAYER_HEIGHT>c.minY)next=c.minY-PLAYER_HEIGHT;
            if(next<p.y&&p.y>=c.maxY&&next<c.maxY)next=c.maxY;
        }
        next=window.riverRealm?.ceiling(p.x,p.z,p.y,next)??next;
        next=window.mangroveRealm?.ceiling(p.x,p.z,p.y,next)??next;
        p.y=next;currentGroundY=p.y;keys.jump=false;refresh();return true;
    }
    function environment(){
        const cameraWater=surfaceAt(camera.position.x,camera.position.z),submerged=cameraWater!==null&&camera.position.y<cameraWater;
        const brackish=submerged&&Boolean(window.mangroveRealm?.waterAt(camera.position.x,camera.position.z));
        scene.fog.color.copy(brackish?new THREE.Color(0x343d19):submerged?waterFog:normalFog);
        scene.fog.density=brackish?.09:submerged?.025:graphicsProfiles[currentProfileKey].fogDensity;
        document.body.classList.toggle('is-underwater',submerged);
        const hint=document.getElementById('swim-hint');if(hint)hint.hidden=!swimming;
    }
    const hint=document.createElement('div');hint.id='swim-hint';hint.hidden=true;
    hint.textContent='Bơi: WASD · Space nổi lên · Q / Ctrl lặn · Shift bơi nhanh';gameHud.append(hint);
    window.playerSurvival={inLakeColumn,inWater,surfaceAt,bottomAt,refresh,update,vertical,environment,spend,respawn,
        get swimming(){return swimming;},get underwater(){return underwater;},get sprinting(){return sprinting;},
        get speed(){return swimming?(window.technologyCraft?.divingEquipped?(keys.shift?5.2:3.8):.45):(sprinting?8:4.8);}};
    updatePlayerVitals();
}
