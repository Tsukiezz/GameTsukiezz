(()=>{
    enterGame();setGraphicsProfile('potato');applyHeroSelection('hamster');
    const r=riverRealm,d=r.data,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
    const place=(x,y,z)=>{playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpVelocityY=0;jumpY=0;resetGameplayInput();playerSurvival.refresh();};
    const flora=d.vegetation.instances,trees=flora.filter(p=>p.kind==='cherry'||p.kind==='pine');
    check('Blender-authored cherry and evergreen forest covers the mountain',flora.filter(p=>p.kind==='cherry').length>=60&&flora.filter(p=>p.kind==='pine').length>=30);
    check('Living understory includes abundant flowers, grass, ferns and bushes',['flower','grass','fern','bush'].every(k=>flora.filter(p=>p.kind===k).length>100));
    check('Wildflower geometry stays light enough for dense meadows',d.vegetation.prototypes.flower.reduce((n,p)=>n+p.indices.length/3,0)<60);
    const shoreline=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return r.ground(d.spring.x+Math.cos(a)*d.spring.rx*.97,d.spring.z+Math.sin(a)*d.spring.rz*.97);});
    check('Hot spring water meets a solid raised shoreline instead of floating over a dry bowl',Math.min(...shoreline)>d.spring.waterY-.6,{lowestShore:Math.min(...shoreline)});
    check('Every plant is rooted in the actual terrain',flora.every(p=>Math.abs(r.ground(p.x,p.z)-p.y)<.001));
    check('Tree trunks leave the hiking trail clear',trees.every(p=>r.trailAt(p.x,p.z).distance>=7));
    check('Every tree has a physical trunk collider',r.mountainLife.treeColliders.length===trees.length&&r.mountainLife.treeColliders.every(c=>!c.isStandable));
    const tree=trees.find(p=>p.y>224);check('Tree trunks block the player',checkCollision(tree.x,tree.z,tree.y,.2));
    check('Real meshes render flowers and pink cherry canopies',r.mountainLife.meshes.some(m=>m.name.includes('cherry_blossom'))&&r.mountainLife.meshes.some(m=>m.name.includes('flower_')));
    r.travel('spring');setGraphicsProfile('balanced');r.update(.1);const before=r.mountainLife.petals.geometry.attributes.position.array.slice();r.update(.1);check('Cherry petals drift through the living grove',r.mountainLife.petals.visible&&before.some((v,i)=>v!==r.mountainLife.petals.geometry.attributes.position.array[i]));setGraphicsProfile('potato');
    // Use the engine's actual movement for both hiking and attempted shortcuts.
    let cliff=null;
    for(let x=-925;x<-780&&!cliff;x+=5)for(let z=500;z<810&&!cliff;z+=5){const y=r.ground(x,z);if(y<25||y>205||r.trailAt(x,z).distance<15||checkCollision(x,z,y))continue;for(const [dx,dz] of [[.06,0],[-.06,0],[0,.06],[0,-.06]]){if(r.ground(x+dx,z+dz)>y+.04&&!r.canTraverse(new THREE.Vector3(x,y,z),x+dx,z+dz)){cliff={x,y,z,dx,dz};break;}}}
    check('A steep off-trail slope is rejected by terrain physics',!!cliff);
    if(cliff){place(cliff.x,cliff.y,cliff.z);const start=playerGroup.position.clone();for(let i=0;i<240;i++){if(i%30===0)keys.jump=true;movePlayerWithCollisions(cliff.dx,cliff.dz);updatePlayerVertical(1/60);}check('Walking and repeated jumping cannot climb the steep face',Math.hypot(playerGroup.position.x-start.x,playerGroup.position.z-start.z)<.15,{start:start.toArray(),end:playerGroup.position.toArray()});check('Equipped flight remains an explicit alternative',r.canTraverse(start,cliff.x+cliff.dx,cliff.z+cliff.dz,true));}
    r.wolf.health=0;r.wolf.collider.disabled=true;
    place(...d.trail[0]);let missed=0,maxError=0;
    for(const target of d.trail.slice(1)){const dx=target[0]-playerGroup.position.x,dz=target[2]-playerGroup.position.z,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));for(let i=0;i<n;i++){movePlayerWithCollisions(dx/n,dz/n);updatePlayerVertical(1/60);maxError=Math.max(maxError,Math.abs(playerGroup.position.y-r.ground(playerGroup.position.x,playerGroup.position.z)));}if(Math.hypot(playerGroup.position.x-target[0],playerGroup.position.z-target[2])>.25)missed++;}
    check('Complete clear trail remains walkable to the summit',missed===0&&maxError<.31,{missed,maxError});
    check('Wolf patrol includes foothills and summit rather than only the pool',Math.min(...d.wolfPatrol.map(p=>p[1]))<15&&Math.max(...d.wolfPatrol.map(p=>p[1]))>230&&d.wolfPatrol.some(p=>Math.hypot(p[0]-d.spring.x,p[2]-d.spring.z)>150));
    place(0,0,0);r.pause();const w=r.wolf;w.health=w.maxHealth;w.group.position.fromArray(d.wolfSpawn);w.state='patrol';w.timer=0;r.pause();let low=Infinity,high=-Infinity,wet=0,maxFloorError=0;const visited=new Set();
    for(let i=0;i<6000;i++){r.update(.1);const p=w.group.position;low=Math.min(low,p.y);high=Math.max(high,p.y);visited.add(w.route);const water=r.waterAt(p.x,p.z);if(water&&p.y<water.y-.35)wet++;maxFloorError=Math.max(maxFloorError,Math.abs(p.y-r.ground(p.x,p.z)));}
    check('Live wolf AI traverses the mountain across multiple altitudes',high-low>150&&visited.size>65,{low,high,waypoints:visited.size,position:w.group.position.toArray(),route:w.route});
    check('Patrolling wolf stays on the ground and out of deep water',wet===0&&maxFloorError<.001,{wet,maxFloorError});
    // Aggro at the foot of the mountain must not depend on distance to the pool.
    const at=d.trail[12],next=d.trail[14];w.group.position.fromArray(at);w.state='patrol';w.cooldown=999;w.specialCooldown=999;place(...next);r.update(0);
    check('Wolf detects the player far below and away from the spring',w.state==='pursue'&&Math.hypot(at[0]-d.spring.x,at[2]-d.spring.z)>145,{state:w.state});
    r.travel('spring');return {results};
})()
