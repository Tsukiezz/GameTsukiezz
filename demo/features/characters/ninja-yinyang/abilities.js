const NINJA_COMBAT={attack:112,critical:190,stamina:0,speed:1.18,attackDuration:.32,dashCost:0,dashCooldown:6,dashSpeed:19};
/* Fast dual-dagger assassin using the world's existing hit and collision APIs. */
function installNinjaAbilities(){
    let cooldown=0,dashTime=0,pending=0,combo=0;
    const direction=new THREE.Vector3(),box=new THREE.Box3(),closest=new THREE.Vector3();
    const button=document.createElement('button');button.id='ninja-shadow-step';button.textContent='F · Ảnh Bộ';
    button.style.cssText='position:fixed;right:18px;bottom:180px;z-index:85;padding:12px;border:1px solid #9bdedb;border-radius:10px;background:#243346;color:#fff;cursor:pointer';document.getElementById('game-hud').append(button);
    const active=()=>false&&gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    function dash(){
        if(window.snowQueen?.frozen||window.candyRealm?.hypnotized||window.desertRealm?.petrified||!active()||cooldown>0||!isGrounded||playerSurvival.swimming||moonRailway.aboard)return false;
        if(!playerSurvival.spend(NINJA_COMBAT.dashCost))return false;
        direction.copy(castleLookDirection(heroMotion.state.yaw,0));cooldown=NINJA_COMBAT.dashCooldown;dashTime=.18;renderer.domElement.focus({preventScroll:true});return true;
    }
    function reset(){pending=0;dashTime=0;combo=0;}
    function targets(){
        const items=[],add=(id,model,health,hit)=>{if(model&&model.visible&&health>0)items.push({id,model,hit});};
        if(window.snowQueen)add('snow_queen',snowQueen.group,snowQueen.boss.health,damage=>snowQueen.hit(damage));
        if(window.candyRealm)add('candy_cavity',candyRealm.boss.group,candyRealm.boss.health,damage=>candyRealm.hit(damage));
        for(const a of window.monsterCamps?.actors||[])add(a.id,a.group,a.health,damage=>monsterCamps.hit(a,damage));
        for(const a of lakeMonsters.actors)add(a.spec.id,a.group,a.health,damage=>lakeMonsters.hitMonster(a,damage));
        add('forest_guardian',forestGuardian.group,forestGuardian.health,damage=>forestGuardian.hit(damage));
        add('space_sabertooth',bachKhuyet.tiger.group,bachKhuyet.tiger.health,damage=>bachKhuyet.hit(damage));
        add('speed_wolf',riverRealm.wolf.group,riverRealm.wolf.health,damage=>riverRealm.hitWolf(damage));
        add('swamp_crocodile',mangroveRealm.crocodile.group,mangroveRealm.crocodile.health,damage=>mangroveRealm.hit(damage));
        if(window.desertRealm)add('wise_sphinx',desertRealm.boss.group,desertRealm.boss.health,damage=>desertRealm.hit(damage));
        for(const a of window.desertRealm?.infestation.actors||[])add(a.id,a.group,a.health,damage=>desertRealm.infestation.hit(a,damage));
        add('war_dragon',volcanicValley.dragon.group,volcanicValley.dragon.health,damage=>volcanicValley.hit(damage));
        for(const a of [...evilCavern.warriors,evilCavern.worm])add(a.id,a.group,a.health,damage=>evilCavern.hit(a,damage));
        for(const a of monsterSkills.minions)add('forest_sapling',a.group,a.health,damage=>{a.health=Math.max(0,a.health-heroOutgoingDamage(damage));if(!a.health)fieldGuide.record('forest_sapling',true);return true;});
        return items;
    }
    function strike(){
        const p=playerGroup.position.clone().add(new THREE.Vector3(0,.3,0)),candidates=[];
        for(const a of targets()){
            if(!a.model.parent?.visible)continue;a.model.updateWorldMatrix(true,true);box.setFromObject(a.model);box.clampPoint(p,closest);const distance=closest.distanceTo(p);
            if(distance>2.8)continue;
            const delta=closest.clone().sub(p),ray=new THREE.Raycaster(p,delta.clone().normalize(),.08,Math.max(.08,delta.length()-.1));
            if(ray.intersectObjects([ground,riverRealm.terrain,bachKhuyet.terrain,...evilCavern.cameraObstacles,...(window.desertRealm?.cameraObstacles||[])],true).some(h=>h.distance<distance-.12))continue;
            candidates.push({...a,distance});
        }
        const target=candidates.sort((a,b)=>a.distance-b.distance)[0];if(!target)return false;
        combo++;const critical=combo%3===0,damage=critical?NINJA_COMBAT.critical:NINJA_COMBAT.attack,result=target.hit(damage);
        if(result!==false&&critical)showNotification('☯ Liên kích chí mạng · '+heroOutgoingDamage(NINJA_COMBAT.critical)+' sát thương');return result!==false;
    }
    function update(dt){
        button.hidden=true;if(!active())return;
        dt=Math.min(.1,Math.max(0,dt));cooldown=Math.max(0,cooldown-dt);
        button.textContent=cooldown>0?'Ảnh Bộ · '+cooldown.toFixed(1)+'s':'F · Ảnh Bộ';button.disabled=cooldown>0||moonRailway.aboard;
        if(pending>0){pending-=dt;if(pending<=0)strike();}
        if(dashTime>0){const step=Math.min(dt,dashTime);movePlayerWithCollisions(direction.x*step*NINJA_COMBAT.dashSpeed,direction.z*step*NINJA_COMBAT.dashSpeed);dashTime-=step;}
    }
    button.onclick=dash;
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!e.repeat&&!e.target.closest('input,textarea,select')&&active()){e.preventDefault();dash();}});
    window.ninjaAbilities={dash,strike,update,reset,beginAttack(){pending=.12;},get cooldown(){return cooldown;},get combo(){return combo;}};update(0);
}
