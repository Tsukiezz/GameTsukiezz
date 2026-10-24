(() => {
 enterGame();setGraphicsProfile('potato');
 const results=[],check=(name,ok,detail={})=>results.push({name,ok:!!ok,detail});
 const floor=romanArena.floor;
 function place(x,y,z){playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpVelocityY=0;castleSafeAnchor=null;romanArena.resetSafety();keys.jump=false;}
 function walk(x,z,speed=4.8,fps=60){for(let i=0;i<8000;i++){
  const dx=x-playerGroup.position.x,dz=z-playerGroup.position.z,d=Math.hypot(dx,dz);if(d<.02)return true;
  const before=playerGroup.position.clone(),step=Math.min(d,speed/fps);
  movePlayerWithCollisions(dx/d*step,dz/d*step);updatePlayerVertical(1/fps);
  if(before.distanceTo(playerGroup.position)<1e-7)return false;
 }return false;}
 check('Original ground-level floor restored',Math.abs(floor-.35)<.001);
 check('VIP box above public stands',romanArena.vipFloor>=romanArena.upper);
 check('Original heroes and cute dragon available',document.querySelectorAll('.hero-card').length===3&&typeof BLENDER_HEROES==='undefined');
 for(const hero of ['hamster','rabbit']){selectHero(hero);check(hero+' remains playable',activeHeroType===hero&&playerGroup.children.length>0);}
 selectHero('hamster');selectHero('ninja');check('Removed hero cannot be selected',activeHeroType==='hamster');
 const ray=new THREE.Raycaster(),holes=[];scene.updateMatrixWorld(true);
 for(let x=-20;x<=20;x++)for(let z=-15;z<=15;z++){
  ray.set(new THREE.Vector3(115+x,floor+.1,110+z),new THREE.Vector3(0,-1,0));ray.far=.2;
  if(!ray.intersectObjects(romanArena.group.children,true).length)holes.push([x,z]);
 }
 check('Raised fighting floor visibly continuous',holes.length===0,{holes});
 check('Old entrance to sand is sealed',checkCollision(115,89,.35));
 for(const side of [-1,1])for(const fps of [15,60,144]){
  place(115,.35,62);let up=walk(115,73.1,8,fps);
  check('Road crosses open entrance '+side+' '+fps,up,{position:playerGroup.position.toArray()});
  for(let i=1;i<=160&&up;i++){const a=-Math.PI/2+side*i*Math.PI/320;up=walk(115+41*1.15*Math.cos(a),110+41*.9*Math.sin(a),8,fps);}
  const top=playerGroup.position.toArray();
  check('Outside stair reaches stands '+side+' '+fps,up&&Math.abs(top[1]-12.35)<.06,{top});
  check('Bridge into public promenade '+side+' '+fps,walk(115+side*34*1.15,110,8,fps),{position:playerGroup.position.toArray()});
 }
 for(const t of romanArena.tunnels){
  place(115+t.side*21,floor,110);
  check(t.name+' gate initially closed',checkCollision(115+t.side*23,110,floor)&&!t.open);
  checkInteractables();check(t.name+' gate offers E interaction',nearbyItem===t.item);handleInteraction();
  const inside=walk(115+t.side*40,110),position=playerGroup.position.toArray();
  check(t.name+' tunnel enters and exits',inside&&walk(115+t.side*21,110),{position});
  romanArena.interact(t.item);check(t.name+' gate closes physically',checkCollision(115+t.side*23,110,floor)&&!t.open);
 }
 place(107.5,12.35,142);
 check('VIP at north faces centre',romanArena.details.gateCollider.minZ>139);
 check('VIP gate locked',checkCollision(109.6,142,12.35));
 romanArena.interact(romanArena.details.ticket);romanArena.interact(interactables.find(i=>i.type==='arena_vip_gate'));
 check('VIP reachable from upper promenade',walk(110.5,142)&&walk(110.5,142.8)&&walk(115,142.8),{position:playerGroup.position.toArray()});
 place(115,floor,105);updatePlayerVertical(1/60);playerGroup.position.y=-10;isGrounded=false;jumpVelocityY=-30;updatePlayerVertical(1/60);
 check('Abnormal fall recovers raised floor',isGrounded&&playerGroup.position.y>=floor);
 check('Architecture batched',romanArena.group.children.filter(c=>c.name==='roman-arena-batch').length<=12);
 const blockedHeads=[];scene.updateMatrixWorld(true);
 for(const side of [-1,1])for(let i=0;i<80;i++){
  const a=-Math.PI/2+side*(i+.5)*Math.PI/160,x=115+41*1.15*Math.cos(a),z=110+41*.9*Math.sin(a),y=.35+(i+1)*.15;
  ray.set(new THREE.Vector3(x,y+.08,z),new THREE.Vector3(0,1,0));ray.far=PLAYER_HEIGHT-.08;
  if(ray.intersectObjects(romanArena.group.children,true).length)blockedHeads.push([x,y,z]);
 }
 check('Exterior stairs have clear headroom',blockedHeads.length===0,{blockedHeads});
 const solidBoxes=colliders.filter(c=>c.name==='arena-solid-box');
 const missed=solidBoxes.filter(c=>!checkCollision(c.type==='orientedBox'?c.x:(c.minX+c.maxX)/2,c.type==='orientedBox'?c.z:(c.minZ+c.maxZ)/2,c.minY+.01));
 check('Solid architecture cannot be penetrated',solidBoxes.length>100&&missed.length===0,{count:solidBoxes.length,missed});
 check('Torches loudspeakers and flags installed',romanArena.details.torches>=12&&romanArena.details.speakers===6&&romanArena.details.flags===12,{torches:romanArena.details.torches});
 return {results};
})()
