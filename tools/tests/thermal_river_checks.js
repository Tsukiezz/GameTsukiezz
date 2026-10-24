(()=>{
 enterGame();setGraphicsProfile('potato');applyHeroSelection('hamster');const r=riverRealm,d=r.data,results=[],check=(name,ok,detail={})=>results.push({name,ok,detail});
 const place=(x,y,z)=>{playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpVelocityY=0;jumpY=0;resetGameplayInput();playerSurvival.refresh();};
 const tick=(f,t)=>{for(let i=0;i<Math.ceil(t*60);i++)f(1/60);};
 check('Entire new environment genuinely authored in Blender',d.source==='Blender'&&d.parts.length>500&&r.terrain.geometry.index.count===d.terrain.indices.length);
 check('Braided river covers the world and contains many small bridges',d.edges.length===8&&d.bridges.length>=20&&d.segments.some(s=>s.a[0]>700)&&d.segments.some(s=>s.a[2]<-700),{bridges:d.bridges.length,segments:d.segments.length});
 const key=p=>p.join(','),adj=new Map();for(const s of d.segments){const a=key(s.a);if(!adj.has(a))adj.set(a,[]);adj.get(a).push(key(s.b));}
 const sinks=new Set([key(d.nodes.lake_w),key(d.nodes.lake_e)]),visiting=new Set(),cache=new Map();
 function drains(node){if(sinks.has(node))return true;if(cache.has(node))return cache.get(node);if(visiting.has(node))return false;visiting.add(node);const next=adj.get(node)||[],ok=next.length>0&&next.every(drains);visiting.delete(node);cache.set(node,ok);return ok;}
 check('Every branch drains continuously from the waterfall to Mercury Lake',drains(key(d.nodes.source))&&d.segments.every(s=>drains(key(s.a))));
 check('Flowing water never climbs uphill along any branch',d.segments.every(s=>s.b[1]<=s.a[1]+.0001));
 check('Both outlets physically enter the existing Mercury Lake', [...sinks].every(k=>{const [x,y,z]=k.split(',').map(Number),l=mercuryLake.data;return Math.hypot((x-l.x)/l.rx,(z-l.z)/l.rz)<1&&Math.abs(y-l.waterY)<.01;}));
 check('Waterfall drops over 200m below the summit spring',d.waterfall[0][1]-d.waterfall.at(-1)[1]>=200&&d.spring.waterY===236&&r.waterMeshes.some(m=>m.name==='Titanic_ThermalWaterfall'));
 const level=mercuryLake.data.waterY;
 check('Every lowland branch is a single horizontal water plane',d.edges.every(e=>e.points.every(p=>Math.abs(p[1]-level)<.0001)));
 check('Rendered river surfaces match the lake plane without raised offsets',d.water.filter(s=>s.kind==='river').every(s=>s.vertices.every(p=>Math.abs(p[1]-level)<.0001)));
 let bedFailures=0;for(const s of d.segments){const x=(s.a[0]+s.b[0])/2,z=(s.a[2]+s.b[2])/2;if(r.ground(x,z)>=level-.5)bedFailures++;}
 check('Carved channel stays below the water along every branch',bedFailures===0,{bedFailures});
 let raisedBanks=0,samples=0,raisedExamples=[];for(const s of d.segments.filter((s,i)=>i%13===0)){const x=s.a[0],z=s.a[2];if(r.mountainContains(x,z))continue;const dx=s.b[0]-x,dz=s.b[2]-z,len=Math.hypot(dx,dz);for(const sign of [-1,1]){const xx=x-dz/len*(s.w+10)*sign,zz=z+dx/len*(s.w+10)*sign;if(r.mountainContains(xx,zz)||d.bridges.some(b=>Math.hypot(xx-b.x,zz-b.z)<b.half+b.run+6))continue;const y=r.ground(xx,zz);if(y!==null){samples++;if(y>Math.max(realmTerrainHeight(xx,zz),level+.7)+.1){raisedBanks++;raisedExamples.push({x:xx,z:zz,y,base:realmTerrainHeight(xx,zz)});}}}}
 check('Bank grading stays at ground level or the low shoreline without elevated river walls',samples>30&&raisedBanks===0,{samples,raisedBanks,raisedExamples});
 check('Waterfall ends exactly at the flat river source',Math.abs(d.waterfall.at(-1)[1]-level)<.0001&&Math.abs(d.nodes.source[1]-level)<.0001);
 check('Spring and river fast travel are available',document.querySelectorAll('[data-river-travel]').length===3);
 let mismatch=0;const gp=r.terrain.geometry.attributes.position;for(let i=0;i<gp.count;i+=173)if(Math.abs(r.ground(gp.getX(i),gp.getZ(i))-gp.getY(i))>.002)mismatch++;
 check('Rendered terrain vertices match the walking and swimming floor',mismatch===0,{mismatch});
 check('Existing deep Mercury basin remains unchanged',realmTerrainHeight(-370,-430)===-72&&(r.ground(-370,-430)===null||r.ground(-370,-430)===-72));
 // Walk every bridge, including both bank ramps, using the actual engine.
 let failures=[],maxDeckError=0;for(const b of d.bridges){const length=b.half+b.run,u0=-length+.05,y0=b.top+(b.anchors[0]-b.top)*((Math.abs(u0)-b.half)/b.run);place(b.x+b.nx*u0,y0,b.z+b.nz*u0);let max=0;const slices=Math.ceil((length*2-.1)/.1);
   for(let i=0;i<slices;i++){movePlayerWithCollisions(b.nx*.1,b.nz*.1);updatePlayerVertical(1/60);const p=playerGroup.position,dx=p.x-b.x,dz=p.z-b.z,u=dx*b.nx+dz*b.nz;if(Math.abs(u)<b.half-.2)max=Math.max(max,Math.abs(p.y-b.top));}
   const goal=new THREE.Vector3(b.x+b.nx*(length-.05),b.anchors[1],b.z+b.nz*(length-.05));maxDeckError=Math.max(maxDeckError,max);if(Math.hypot(playerGroup.position.x-goal.x,playerGroup.position.z-goal.z)>.3||max>.31)failures.push({id:b.id,max,end:playerGroup.position.toArray(),goal:goal.toArray()});
 }
 check('Every bridge and approach ramp can be walked without falling through',failures.length===0,{failures,maxDeckError});
 const b=d.bridges[0];place(b.x,b.top,b.z);movePlayerWithCollisions(-b.nz*3,b.nx*3);const q=playerGroup.position,side=Math.abs(-(q.x-b.x)*b.nz+(q.z-b.z)*b.nx);check('Bridge rails block accidental sideways falls',side<1.7,{side});
 place(b.x-b.nx*(b.half-.5),b.top,b.z-b.nz*(b.half-.5));keys.jump=true;let minY=Infinity;for(let i=0;i<150;i++){movePlayerWithCollisions(b.nx*.045,b.nz*.045);updatePlayerVertical(1/60);minY=Math.min(minY,playerGroup.position.y);}check('Running jump on bridge returns to the deck safely',minY>=b.top-.01&&Math.abs(playerGroup.position.y-b.top)<.01,{minY});
 // The western switchbacks stay above solid triangles all the way to the pool.
 r.wolf.health=0;r.wolf.collider.disabled=true;
 const entry=d.trail[0];place(...entry);let trailFailures=0,maxFall=0,worst=null;for(const target of d.trail.slice(1)){const dx=target[0]-playerGroup.position.x,dz=target[2]-playerGroup.position.z,count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));for(let i=0;i<count;i++){movePlayerWithCollisions(dx/count,dz/count);updatePlayerVertical(1/60);const floor=r.ground(playerGroup.position.x,playerGroup.position.z),error=Math.abs(playerGroup.position.y-floor);if(error>maxFall){maxFall=error;worst={position:playerGroup.position.toArray(),floor,support:getGroundElevation(playerGroup.position.x,playerGroup.position.z,playerGroup.position.y),grounded:isGrounded};}}if(Math.hypot(playerGroup.position.x-target[0],playerGroup.position.z-target[2])>.25)trailFailures++;}
 check('Complete mountain trail reaches the hot spring on foot',trailFailures===0&&maxFall<.31,{trailFailures,maxFall,worst,end:playerGroup.position.toArray()});
 const s=d.segments[Math.floor(d.segments.length/3)],x=(s.a[0]+s.b[0])/2,z=(s.a[2]+s.b[2])/2,water=r.waterAt(x,z);place(x,water.y-.5,z);check('Actual survival system recognizes river swimming',playerSurvival.refresh());keys.dive=true;const y=playerGroup.position.y;tick(updatePlayerVertical,1);keys.dive=false;check('Diving descends toward the carved river bed',playerGroup.position.y<y-1&&playerGroup.position.y>=r.ground(x,z));
 const oxygen=gameState.oxygen;tick(dt=>playerSurvival.update(dt,false),1);check('River diving uses the existing oxygen system',gameState.oxygen<oxygen);keys.swimUp=true;tick(updatePlayerVertical,4);keys.swimUp=false;check('River swimmer resurfaces at local water level',Math.abs(playerGroup.position.y-(water.y-.5))<.02);
 place(d.spring.x,233,d.spring.z);check('Summit hot spring swims at its elevated water level',playerSurvival.refresh()&&playerSurvival.surfaceAt(d.spring.x,d.spring.z)===236);tick(dt=>playerSurvival.update(dt,false),1);check('Being underwater high on the mountain consumes oxygen',gameState.oxygen<100);
 gameState.health=100;gameState.oxygen=0;tick(dt=>playerSurvival.update(dt,false),14);check('Oxygen defeat returns to a dry safe bank',gameState.health===100&&gameState.oxygen===100&&!playerSurvival.inWater(playerGroup.position));
 check('Underwater ecology contains three fish species, kelp and coral',d.fish.length>=400&&new Set(d.fish.map(f=>f.kind)).size===3&&d.decor.filter(p=>p.kind==='kelp').length>=700&&d.decor.some(p=>p.kind==='coral'),{fish:d.fish.length,plants:d.decor.length});
 r.wolf.health=0;r.travel('spring');r.update(.05);const school=r.schools.find(s=>s.mesh.visible),matrixA=new THREE.Matrix4(),matrixB=new THREE.Matrix4();school.mesh.getMatrixAt(0,matrixA);tick(dt=>r.update(dt),1);school.mesh.getMatrixAt(0,matrixB);check('Fish actively swim rather than remaining static props',!matrixA.equals(matrixB));
 const monkey=r.monkeys.find(a=>a.group.visible);const monkeyBefore=monkey.group.position.clone();tick(dt=>r.update(dt),2);check('Red-rumped monkeys have distinctive anatomy and roam',d.models.monkey.pieces.some(p=>p.material==='rump')&&monkey.group.position.distanceTo(monkeyBefore)>.05);
 // Combat: a locked attack warning, dodgeable rush, timed stun, ordinary bite.
 const wolf=r.wolf;wolf.health=wolf.maxHealth;wolf.group.rotation.z=0;wolf.group.position.copy(wolf.home);wolf.state='pursue';wolf.cooldown=999;wolf.specialCooldown=0;let combatSpot=null;
 for(let a=0;a<Math.PI*2;a+=.25){const xx=wolf.home.x+Math.cos(a)*4,zz=wolf.home.z+Math.sin(a)*4,yy=r.ground(xx,zz);if(yy!==null&&!r.waterAt(xx,zz)&&!checkCollision(xx,zz,yy)){combatSpot=[xx,yy,zz];break;}}
 place(...combatSpot);gameState.health=100;gameState.armor=100;r.update(0);check('Wolf announces its stunning rush before hitting',wolf.state==='windup'&&r.marker.visible&&gameState.armor===100);
 tick(dt=>r.update(dt),.5);check('Rush has a real reaction interval',gameState.armor===100&&!r.stunned);
 for(let i=0;i<150&&!r.stunned;i++)r.update(1/60);check('Rush bite deals damage and stuns the player',r.stunned&&gameState.armor===64,{state:wolf.state,armor:gameState.armor});
 const stunned=playerGroup.position.clone();movePlayerWithCollisions(2,0);isAttacking=false;triggerAttack();keys.jump=true;updatePlayerVertical(1/60);check('Stun blocks movement, attacks and jumping',playerGroup.position.distanceTo(stunned)<.01&&!isAttacking&&!keys.jump);
 tick(dt=>r.update(dt),1.6);check('Stun automatically expires without a soft lock',!r.stunned&&!r.stars.visible);
 r.pause();wolf.group.position.copy(wolf.home);wolf.state='pursue';wolf.cooldown=999;wolf.specialCooldown=0;place(...combatSpot);gameState.armor=100;r.update(0);playerGroup.position.x-=10;tick(dt=>r.update(dt),2.2);check('Moving out of the locked rush target dodges stun',!r.stunned&&gameState.armor===100);
 r.pause();wolf.group.position.copy(wolf.home);wolf.state='pursue';wolf.cooldown=0;wolf.specialCooldown=999;const cp=new THREE.Vector3(...combatSpot),dir=cp.clone().sub(wolf.home).normalize();place(wolf.home.x+dir.x*2,wolf.home.y,wolf.home.z+dir.z*2);gameState.armor=100;r.update(0);tick(dt=>r.update(dt),.75);check('Wolf also has a separate ordinary bite',gameState.armor===84&&!r.stunned,{armor:gameState.armor,state:wolf.state});
 const hp=wolf.health;isAttacking=false;triggerAttack();tick(dt=>r.update(dt),.3);check('Real hero attack reduces wolf health',wolf.health===hp-145,{before:hp,after:wolf.health});
 r.hitWolf(99999);check('Defeated wolf loses its physical and hostile behavior',wolf.health===0&&wolf.collider.disabled&&wolf.state==='dead');r.pause();check('Travel/pause clears stun effects',!r.stunned&&!r.marker.visible);
 r.travel('spring');return {results};
})()
