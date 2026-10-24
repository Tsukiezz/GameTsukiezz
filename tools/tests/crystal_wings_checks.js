(()=>{
 enterGame();setGraphicsProfile('potato');const w=crystalWings,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
 const tick=(f,t)=>{for(let i=0;i<Math.ceil(t*60);i++)f(1/60);};
 check('Wings start locked and cannot be equipped or flown',!w.owned&&!w.equip(true)&&!w.toggleFlight()&&!w.model.visible);
 check('Chest is in the actual deepest basement storage room',w.item.pos.y===-5&&w.item.pos.x>-119.7&&w.item.pos.x<-113.3&&w.item.pos.z>121&&w.item.pos.z<128,{position:w.item.pos.toArray()});
 check('Chest has a clear approach and solid collision',!checkCollision(w.approach.x,w.approach.z,-5)&&checkCollision(w.item.pos.x,w.item.pos.z,-5),{collider:{...w.chestCollider},registered:colliders.includes(w.chestCollider),nearby:[...nearbyColliders(w.item.pos.x,w.item.pos.z)].includes(w.chestCollider)});
 playerGroup.position.copy(w.item.pos).y=-2;isGrounded=false;jumpVelocityY=0;tick(updatePlayerVertical,1);
 check('Landing on the chest does not fall inside its collision',Math.abs(playerGroup.position.y-w.chestCollider.maxY)<.001,{height:playerGroup.position.y,support:getGroundElevation(w.item.pos.x,w.item.pos.z,-2)});
 const step=.25,start={x:-119.5,z:124.5},queue=[start],parents=new Map([['0,0',null]]);let route=null;
 for(let i=0;i<queue.length&&i<1600;i++){
   const node=queue[i];if(Math.hypot(node.x-w.approach.x,node.z-w.approach.z)<.3){route=[];let cur=node;while(cur){route.unshift(cur);cur=cur.parent;}break;}
   for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const x=node.x+dx,z=node.z+dz,id=Math.round((x-start.x)/step)+','+Math.round((z-start.z)/step);if(parents.has(id)||x< -119.6||x> -113.6||z<121.3||z>127.7||checkCollision(x,z,-5))continue;parents.set(id,node);queue.push({x,z,parent:node});}
 }
 if(route){fastTravelTo(start.x,start.z,'Storage room door',-5);for(const node of route){movePlayerWithCollisions(node.x-playerGroup.position.x,node.z-playerGroup.position.z);updatePlayerVertical(1/60);}}
 check('Treasure can be reached by walking from the storage room doorway',!!route&&playerGroup.position.distanceTo(w.approach)<.35,{routeSteps:route?.length});
 fastTravelTo(0,10,'Away from chest');
 w.interact(w.item);check('Chest cannot be remotely claimed',!w.owned);fastTravelTo(w.item.pos.x,w.item.pos.z,'Wrong floor',1);w.interact(w.item);check('Chest cannot be opened from the floor above',!w.owned);
 fastTravelTo(w.approach.x,w.approach.z,'Basement chest',-5);checkInteractables();check('Real interaction selects the treasure chest',nearbyItem===w.item,{selected:nearbyItem?.id});handleInteraction();
 check('Opening chest unlocks a permanent backpack item',w.owned&&document.getElementById('crystal-wings-item')&&!w.equipped);
 w.interact(w.item);check('Opening twice cannot duplicate or auto-equip wings',JSON.parse(localStorage.getItem('tsuventure_crystal_wings_v1')).owned&&!w.equipped);
 backpack.open();const equip=document.getElementById('equip-crystal-wings');check('Backpack exposes an enabled equip control',!equip.disabled&&equip.getAttribute('aria-pressed')==='false');equip.click();
 check('Equipping through backpack wears actual geometry',w.equipped&&w.model.visible&&w.model.parent===playerGroup&&equip.getAttribute('aria-pressed')==='true'&&!w.flying);
 check('Touch flight control unlocks alongside worn wings',!w.touchButton.hidden&&w.touchButton.parentElement.classList.contains('has-flight'));
 check('Modal prevents flight input',!w.toggleFlight());closeModal('modal-backpack');
 fastTravelTo(35,35,'Flight test');window.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true}));check('F starts flight when wings are worn',w.flying&&!isGrounded);
 const initial=playerGroup.position.y;keys.swimUp=true;tick(updatePlayerVertical,2);keys.swimUp=false;check('Space ascends using real vertical physics',playerGroup.position.y>initial+9.5,{initial,y:playerGroup.position.y});
 const hover=playerGroup.position.clone();tick(updatePlayerVertical,1.5);check('No vertical input hovers rather than falling',playerGroup.position.distanceTo(hover)<.001);
 check('Flight speed is faster than walking',w.speed>playerSurvival.speed);keys.shift=true;check('Shift increases flight speed',w.speed===18);keys.shift=false;
 const before=playerGroup.position.clone();movePlayerWithCollisions(1.5,0);check('Actual horizontal movement works while airborne',playerGroup.position.x>before.x+1.4);
 keys.dive=true;tick(updatePlayerVertical,1);keys.dive=false;check('Q descends in flight',playerGroup.position.y<hover.y-4.8);
 // A thin ceiling and wall are real colliders in the same engine, not mock physics.
 const p=playerGroup.position.clone();addBoxCollider(p.x,p.z,4,4,p.y+1.5,p.y+1.6,true);const ceiling=colliders.at(-1);ceiling.name='wings-test-ceiling';rebuildCollisionGrid();keys.swimUp=true;tick(updatePlayerVertical,3);keys.swimUp=false;
 check('Flight cannot tunnel through a thin ceiling',playerGroup.position.y+PLAYER_HEIGHT<ceiling.minY+.001,{feet:playerGroup.position.y,ceiling:ceiling.minY});ceiling.disabled=true;
 const wallX=playerGroup.position.x+.9;addBoxCollider(wallX,playerGroup.position.z,.12,5,playerGroup.position.y-2,playerGroup.position.y+3,false);const wall=colliders.at(-1);rebuildCollisionGrid();const wallStart=playerGroup.position.x;movePlayerWithCollisions(4,0);check('Flight cannot phase through walls',playerGroup.position.x<wallX-.2&&playerGroup.position.x>=wallStart);wall.disabled=true;
 // Swept descent onto the visible mountain and world boundary enforcement.
 bachKhuyet.travel();w.toggleFlight();playerGroup.position.y=bachKhuyet.ground(playerGroup.position.x,playerGroup.position.z)+10;keys.dive=true;tick(updatePlayerVertical,4);keys.dive=false;
 check('Flight descends onto terrain without falling below it',Math.abs(playerGroup.position.y-bachKhuyet.ground(playerGroup.position.x,playerGroup.position.z))<.001);
 playerGroup.position.y=499.9;keys.swimUp=true;tick(updatePlayerVertical,1);keys.swimUp=false;check('Flight height is bounded',playerGroup.position.y===500);
 fastTravelTo(EXPANDED_REALM_DATA.bound-.3,300,'World edge',50);w.toggleFlight();const edge=playerGroup.position.x;movePlayerWithCollisions(3,0);check('Flight respects map bounds',playerGroup.position.x<=EXPANDED_REALM_DATA.bound&&playerGroup.position.x>=edge);
 const pauseY=playerGroup.position.y;backpack.open();keys.swimUp=true;tick(updatePlayerVertical,1);keys.swimUp=false;check('Inventory pauses flight without moving the player',playerGroup.position.y===pauseY);equip.click();check('Unequip from backpack hides wings and cancels flight',!w.equipped&&!w.flying&&!w.model.visible);closeModal('modal-backpack');
 const fallStart=playerGroup.position.y;tick(updatePlayerVertical,.3);check('Removing wings restores normal gravity',playerGroup.position.y<fallStart);
 w.equip(true);for(const hero of ['hamster','rabbit','dragon_knight','kingkong']){applyHeroSelection(hero);check('Wings remain worn on '+hero,w.model.parent===playerGroup&&w.model.visible&&w.equipped);}
 applyHeroSelection('hamster');w.toggleFlight();fastTravelTo(w.approach.x,w.approach.z,'Basement',-5);check('Fast travel safely stops flying but keeps equipment',!w.flying&&w.equipped&&playerGroup.position.y===-5);
 w.toggleFlight();keys.swimUp=true;tick(updatePlayerVertical,4);keys.swimUp=false;check('Actual castle ceiling blocks ascent from basement',playerGroup.position.y<1,{height:playerGroup.position.y});
 returnToHome();check('Returning home clears flight while retaining ownership',!w.flying&&w.owned&&w.equipped);enterGame();w.render();check('Backpack keeps equipment persisted separately from chocolate',JSON.parse(localStorage.getItem('tsuventure_crystal_wings_v1')).equipped&&backpack.count===0);
 w.update(.1);return {results};
})()
