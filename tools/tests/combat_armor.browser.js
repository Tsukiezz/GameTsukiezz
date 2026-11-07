(async () => {
    const checks=[];
    const check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail});
    const close=()=>document.querySelectorAll('.modal-overlay.active').forEach(m=>closeModal(m.id));
    const near=(a,b)=>Math.abs(a-b)<1e-6;
    const selectArmor=id=>{gearSystem.reset(id);technologyCraft.equip(id,true);};
    const armorRow=document.querySelector('#hud-armor-bar').closest('.hud-vital-row');
    const random=Math.random;
    close();moonRailway.leaveForRespawn();playerLife.update(5);gameState.health=gameState.maxHealth;
    const start=playerGroup.position.clone();
    for(const id of Object.keys(skins.catalog))selectHero(id);
    selectHero('hamster');
    check('All skins use 250 HP and a 1.8x vertical visual and collider scale',gameState.health===250&&gameState.maxHealth===250&&near(playerGroup.scale.y,.36)&&near(playerGroup.scale.x,.2)&&near(PLAYER_HEIGHT,1.17));
    try{
        selectArmor('iron');Math.random=()=>.99;
        playerLife.hitMonster(40,'wolf');
        check('A regular monster hit gains 50% damage and only wears equipped armor',gameState.health===250&&near(gameState.armor,140)&&near(gearSystem.durability.iron,2450));
        selectArmor('rage');
        playerLife.hitMonster(100,'wolf',{special:true});
        check('Special hits split 150 damage into 45 HP and 105 armor',near(gameState.health,205)&&near(gameState.armor,395)&&near(gearSystem.durability.rage,2765)&&rageArmor.active);
        technologyCraft.equip('rage',false);
        check('Unequipped armor has no shield or HUD bar',gameState.armor===0&&gameState.maxArmor===0&&armorRow.hidden);
        technologyCraft.equip('rage',true);
        check('Re-equipping preserves wear and restores the same shield',near(gameState.armor,395)&&!armorRow.hidden);
        Math.random=()=>0;
        playerLife.hitMonster(40,'wolf');
        check('A critical melee hit also splits damage 30/70',near(gameState.health,187)&&near(gameState.armor,353));
        gearSystem.wear('rage',gearSystem.durability.rage-70);
        playerLife.hitMonster(40,'wolf',{special:true});
        check('Shield overflow reaches HP and broken armor stays repairable',near(gameState.health,137)&&gearSystem.durability.rage===0&&gearSystem.broken('rage')&&technologyCraft.state.rageOwned&&!technologyCraft.equip('rage',true)&&armorRow.hidden);
        const repair=gearSystem.repairItem;
        playerGroup.position.copy(repair.pos);openModal(gearSystem.modal.id);
        monsterCamps.stock.iron=10;monsterCamps.stock.goldCoin=1;
        const repaired=gearSystem.repair('rage',1);
        close();technologyCraft.equip('rage',true);
        check('Workshop repairs 10% for 10 iron and 1 coin, restoring 50 shield',repaired&&near(gameState.armor,50)&&gearSystem.durability.rage===350&&monsterCamps.stock.iron===0&&monsterCamps.stock.goldCoin===0);
        const deaths=playerLife.deaths;
        playerLife.hurt(500,false,'Kiểm thử hồi sinh');
        check('Respawn restores 250 HP without repairing armor',playerLife.deaths===deaths+1&&gameState.health===250&&near(gameState.armor,50)&&gearSystem.durability.rage===350);

        playerLife.update(5);technologyCraft.equip('rage',false);Math.random=()=>.99;
        const actor=monsterCamps.actors.find(a=>a.health>0&&!a.camp.suspended&&a.group.position.distanceTo(a.camp.center)<20);
        const pos=actor.group.position.clone();
        combatEffects.clearPlayerThreats();crystalWings.grant();crystalWings.equip(true);
        playerGroup.position.copy(pos).y+=13;crystalWings.toggleFlight();
        for(let i=0;i<45;i++){monsterCamps.update(.1);realmTransitUpdate.update(.1);}
        check('Camp monsters never launch aerial casts or projectiles',combatEffects.enemies().some(e=>e.model===actor.group&&!e.ranged)&&combatEffects.casts.every(c=>c.enemy.ranged)&&gameState.health===250);
        crystalWings.stopFlight();playerGroup.position.copy(actor.group.position).z+=.75;
        for(const enemy of actor.camp.actors)enemy.cooldown=10;
        actor.animationAttack={time:.17,landed:false};
        const damage=monsterCamps.specs[actor.kind].damage;
        monsterCamps.update(.1);
        check('Camp monster still deals scaled damage in melee range',near(gameState.health,250-damage*1.5),{health:gameState.health,damage});
    }finally{Math.random=random;close();crystalWings.stopFlight();playerGroup.position.copy(start);gameState.health=gameState.maxHealth;playerLife.dismissDeath();}

    check('Every rare stack uses a one-item backing-store cap', ['forestHeart','nakat','galacticLava','eternalEmber'].every(id=>monsterCamps.stock[id]===1&&!monsterCamps.add(id,50))&&santaGifts.engines===1&&!santaGifts.addEngines(50)&&['wings','flashlight','lavaSword','forestSword','ancientFragment','rage'].every(id=>giftCode.count(id)===1));
    check('Rare Santa reward quantity is always one',santaGifts.rollLoot(()=>0).find(x=>x.type==='engine')?.quantity===1);
    return {checks};
})()
