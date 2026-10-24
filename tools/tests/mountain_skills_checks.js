(()=>{
 enterGame();setGraphicsProfile('potato');applyHeroSelection('hamster');
 const results=[],check=(name,ok,detail={})=>results.push({name,ok,detail}),mount=bachKhuyet,skills=monsterSkills,[ness,croc]=lakeMonsters.actors,l=mercuryLake.data;
 const tick=(fn,t)=>{for(let i=0;i<Math.ceil(t*60);i++)fn(1/60);};
 const place=(x,y,z)=>{playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpVelocityY=0;jumpY=0;keys.jump=false;};
 const reset=()=>{skills.pause();gameState.isPlaying=true;gameState.inDialogue=false;gameState.health=100;gameState.armor=100;for(const s of Object.values(skills.states))s.cooldown=999;for(const m of lakeMonsters.actors){m.health=m.maxHealth;m.state='pursue';m.timer=0;m.cooldown=999;m.yaw=0;}place(l.x,l.waterY-.5,l.z+50);tick(d=>{lakeMonsters.update(d);skills.update(d);},3.2);};
 check('Mountain and sabertooth come from Blender',BACH_KHUYET_DATA.source==='Blender'&&mount.data.tiger.pieces.length>=30);
 check('Monumental 600m massif with 200m summit',mount.data.terrain.n*mount.data.terrain.step===600&&Math.max(...mount.data.terrain.heights)>200);
 check('Subordinate peaks, hundreds of details and rare mineral sites',mount.data.placements.length>450&&mount.data.ores.length===12);
 check('Fast travel destination is in the actual HUD',!!document.getElementById('btn-travel-bach-khuyet'));
 mount.travel();check('Mountain travel lands on actual ground',Math.abs(playerGroup.position.y-mount.ground(playerGroup.position.x,playerGroup.position.z))<.001);
 const oldTiger=mount.tiger.group.position.clone();mount.tigerCollider.disabled=true;let maxError=0,blocked=0,steps=0;
 for(const target of mount.data.trail.slice(1)){
   const from=playerGroup.position.clone(),dx=target[0]-from.x,dz=target[2]-from.z,slices=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.16));
   for(let j=0;j<slices;j++){movePlayerWithCollisions(dx/slices,dz/slices);updatePlayerVertical(1/60);steps++;const p=playerGroup.position;maxError=Math.max(maxError,Math.abs(p.y-mount.ground(p.x,p.z)));}
   if(Math.hypot(playerGroup.position.x-target[0],playerGroup.position.z-target[2])>.2)blocked++;
 }
 check('Walk the entire winding trail using real collision and gravity',blocked===0&&maxError<.31,{steps,blocked,maxError,end:playerGroup.position.toArray()});
 const sample=mount.data.trail[200];place(sample[0],mount.ground(sample[0],sample[2]),sample[2]);keys.jump=true;let jumpPeak=0;for(let i=0;i<160;i++){movePlayerWithCollisions(.015,-.015);updatePlayerVertical(1/60);jumpPeak=Math.max(jumpPeak,playerGroup.position.y-mount.ground(playerGroup.position.x,playerGroup.position.z));}
 check('Running jump lands on mountain without falling through',jumpPeak>.3&&Math.abs(playerGroup.position.y-mount.ground(playerGroup.position.x,playerGroup.position.z))<.01,{jumpPeak});
 let mismatch=0;const pos=mount.terrain.geometry.attributes.position;for(let i=0;i<pos.count;i+=137)if(Math.abs(mount.ground(pos.getX(i),pos.getZ(i))-pos.getY(i))>.001)mismatch++;
 check('Visible vertices exactly agree with support triangles',mismatch===0,{mismatch});
 reset();ness.position.set(l.x-65,-2,l.z-20);place(l.x-65,l.waterY-.5,l.z+10);lakeMonsters.update(0);ness.state='pursue';skills.states.ness.cooldown=0;
 check('Ness special has its own cast and cooldown',skills.start('ness')&&skills.busy('ness')&&ness.cooldown>100&&gameState.armor===100);
 tick(d=>skills.update(d),1);check('Energy ball has a visible dodge warning',skills.states.ness.marker.visible&&skills.projectiles.length===0&&gameState.armor===100);
 tick(d=>skills.update(d),3.5);check('Energy projectile hits actual armor for heavy damage',gameState.armor===22,{armor:gameState.armor,projectiles:skills.projectiles.length});
 check('Special cannot immediately repeat',!skills.start('ness'));
 reset();ness.position.set(l.x-65,-2,l.z-20);place(l.x-65,l.waterY-.5,l.z+10);lakeMonsters.update(0);ness.state='pursue';skills.states.ness.cooldown=0;skills.start('ness');tick(d=>skills.update(d),1.3);playerGroup.position.x-=12;tick(d=>skills.update(d),4);check('Energy ball can be dodged rather than tracking forever',gameState.armor===100);
 reset();croc.position.set(l.x+65,-2,l.z);place(l.x+65,l.waterY-.5,l.z+30);lakeMonsters.update(0);croc.state='pursue';skills.states.space_croc.cooldown=0;
 check('Croc special starts separately from ordinary bite',skills.start('space_croc'));tick(d=>skills.update(d),1.5);
 check('Croc captures player and deals heavy damage once',skills.captured&&gameState.armor===32,{captured:skills.captured,armor:gameState.armor});
 const captured=playerGroup.position.clone();movePlayerWithCollisions(3,0);check('Capture prevents movement through the monster',playerGroup.position.equals(captured));
 tick(d=>skills.update(d),1.5);check('Croc automatically releases without another damage tick',!skills.captured&&gameState.armor===32&&lakeMonsters.canTarget(croc,playerGroup.position));
 reset();croc.position.set(l.x+65,-2,l.z);place(l.x+65,l.waterY-.5,l.z+30);lakeMonsters.update(0);croc.state='pursue';skills.states.space_croc.cooldown=0;skills.start('space_croc');tick(d=>skills.update(d),1.5);mount.travel();const afterTravel=playerGroup.position.clone();tick(d=>skills.update(d),2);check('Fast travel cancels capture and never drags player back',!skills.captured&&playerGroup.position.equals(afterTravel));
 reset();place(l.x,5.4,l.z+100);skills.states.ness.cooldown=0;skills.states.space_croc.cooldown=0;check('Bridge remains safe from both special attacks',!skills.start('ness')&&!skills.start('space_croc'));
 const gp=forestGuardian.position;let spot=null;for(let a=0;a<Math.PI*2;a+=.3){const x=gp.x+Math.cos(a)*9,z=gp.z+Math.sin(a)*9,y=ancientGrove.ground(x,z);if(y!==null&&!checkCollision(x,z,y,.5)){spot=[x,y,z];break;}}
 reset();place(...spot);forestGuardian.hit(1);tick(d=>forestGuardian.update(d),3.2);skills.states.forest.cooldown=0;
 check('Guardian has a separate summon skill',skills.start('forest'));
 check('Plants emerge from marked ground positions',skills.minions.length>=2&&skills.minions.every(m=>m.state==='emerging'&&m.marker.visible&&m.group.scale.y===.01),{count:skills.minions.length});
 tick(d=>skills.update(d),1.6);const minion=skills.minions[0];const minionBefore=minion?.group.position.clone();tick(d=>skills.update(d),.4);
 check('Summons really chase after emerging',!!minion&&minion.state==='chasing'&&minion.group.position.distanceTo(minionBefore)>.1);
 if(minion){place(minion.group.position.x,minion.group.position.y,minion.group.position.z);tick(d=>skills.update(d),1);}
 check('Summons damage actual player vitals',gameState.armor<100,{armor:gameState.armor});
 if(minion){skills.beginPlayerAttack('hamster');tick(d=>skills.update(d),.25);skills.beginPlayerAttack('hamster');tick(d=>skills.update(d),.25);}
 check('Summoned plants can be defeated by player attacks',!minion||minion.health<=0);
 tick(d=>skills.update(d),18);check('Summons have bounded lifetime and do not accumulate',skills.minions.length<=4);skills.pause();check('Pause removes summons and hostile effects',skills.minions.length===0&&skills.projectiles.length===0&&!skills.captured);
 mount.travel();const tp=mount.tiger.group.position.clone();tick(d=>mount.update(d),2);check('Hidden tiger patrols instead of remaining fixed',mount.tiger.group.position.distanceTo(tp)>.2,{moved:mount.tiger.group.position.distanceTo(tp)});
 const tiger=mount.tiger;tiger.specialCooldown=0;tiger.cooldown=0;tiger.state='stalk';place(tiger.group.position.x+2.3,tiger.group.position.y,tiger.group.position.z);gameState.armor=100;gameState.health=100;mount.update(.01);
 check('Sabertooth telegraphs its bleeding bite',tiger.state==='bite'&&mount.marker.visible);tick(d=>mount.update(d),1.3);check('Special bite damages armor and applies finite bleeding',gameState.armor===60&&!!skills.bleed,{armor:gameState.armor,bleed:skills.bleed});
 tick(d=>skills.update(d),2.2);check('Bleeding ticks hurt health independently of armor',gameState.health<100&&gameState.armor===60,{health:gameState.health});tick(d=>skills.update(d),6.1);check('Bleeding expires rather than staying forever',!skills.bleed);
 skills.applyBleed();openModal('modal-settings');check('Opening settings clears damage-over-time effects',!skills.bleed&&!skills.captured);closeModal('modal-settings');
 const ore=interactables.find(i=>i.type==='mountain_ore'&&!i.collected);if(ore){place(ore.pos.x,ore.pos.y,ore.pos.z);const before=mount.inventory[ore.kind];mount.interact(ore);mount.interact(ore);check('Ore collected once, visible in backpack and persisted',mount.inventory[ore.kind]===before+1&&!mount.oreModels.get(ore.id).visible&&document.getElementById('mountain-minerals').textContent.includes(String(before+1))&&JSON.parse(localStorage.getItem('tsuventure_mountain_ores_v1'))[ore.kind]===before+1);}
 skills.applyBleed();gameState.armor=0;gameState.health=1;tick(d=>skills.update(d),1.2);check('Fatal bleed respawns safely and clears effects',gameState.health===100&&!skills.bleed&&!skills.captured);
 mount.tiger.group.position.copy(oldTiger);mount.travel();return {results};
})()
