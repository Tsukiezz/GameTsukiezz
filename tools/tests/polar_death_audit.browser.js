(()=>{
    enterGame();setGraphicsProfile('low');const results=[];
    for(let i=0;i<40;i++)playerLife.update(.1);
    fastTravelTo(40,35,'Test');gameState.health=1;gameState.armor=0;monsterSkills.landDamage(100,true);results.push({name:'Legacy special monster damage respawns at initial spawn',ok:playerGroup.position.distanceTo(playerLife.spawn)<.05&&gameState.health===100});
    for(let i=0;i<40;i++){playerLife.update(.1);monsterSkills.update(.1);}
    const wolf=riverRealm.wolf;fastTravelTo(wolf.group.position.x,wolf.group.position.z,'Test',wolf.group.position.y);wolf.state='bite';wolf.timer=1;wolf.target.copy(playerGroup.position);gameState.health=1;gameState.armor=0;riverRealm.update(.1);results.push({name:'Legacy river-wolf bite respawns at initial spawn',ok:playerGroup.position.distanceTo(playerLife.spawn)<.05&&gameState.health===100});
    const failures=results.filter(r=>!r.ok);if(failures.length)throw Error(JSON.stringify(failures));return {results};
})()
