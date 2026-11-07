(()=>{
 const checks=[],views={},check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail}),base=technologyBase,rocket=base.rocket,data=TECHNOLOGY_ROCKET_DATA;
 check('Blender source is wired into the real station',rocket.userData.source===data.source&&rocket.parent===base.group&&data.design==='TSU-07 ruined lunar explorer');
 check('Complete detailed model within rendering budget',data.sourceObjects>=140&&data.triangles>30000&&data.triangles<50000&&rocket.children.length===12,{triangles:data.triangles,sourceObjects:data.sourceObjects,draws:rocket.children.length});
 for(const part of data.parts){const m=rocket.getObjectByName('TSU07_'+part.material);check('Valid geometry: '+part.material,!!m&&m.geometry.attributes.position.count===m.geometry.attributes.normal.count&&m.geometry.index.count===part.indices.length&&part.positions.every(Number.isFinite)&&part.normals.every(Number.isFinite));}
 check('Restrained palette and small status lights',rocket.children.filter(m=>m.material.emissiveIntensity>0&&m.material.emissive.getHex()>0).every(m=>m.name==='TSU07_lamp')&&!rocket.children.some(m=>m.isLight));
 rocket.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(rocket),size=bounds.getSize(new THREE.Vector3());check('Wreck lies on the actual forecourt ground',Math.abs(bounds.min.y-base.level)<.08&&size.x>25&&size.y<8&&size.z<10,{min:bounds.min.toArray(),max:bounds.max.toArray(),level:base.level});
 check('Wreck stays within the existing headquarters terrain',[[bounds.min.x,bounds.min.z],[bounds.max.x,bounds.max.z]].every(([x,z])=>base.contains(x,z)));
 check('Old oversized blocker has been replaced',!colliders.some(c=>c.name==='technology-ruined-rocket')&&base.rocketColliders.length===8&&base.rocketColliders.every(c=>base.solids.includes(c)&&c.minY>=base.level-.01));
 const cx=base.center.x,cz=base.center.z;check('Central approach corridor stays clear of the wreck',base.rocketColliders.every(c=>c.minX>cx+3));
 check('Camera collision follows visible solid meshes',rocket.children.filter(m=>m.name!=='TSU07_ground').every(m=>base.cameraObstacles.includes(m))&&!base.cameraObstacles.includes(rocket.getObjectByName('TSU07_ground')));
 check('No pretense of a usable vehicle',!interactables.some(i=>i.type?.includes('rocket')));
 check('Crafting station and recipes preserved',interactables.includes(base.bench)&&base.resources.length===2&&technologyCraft.recipes.rage.cost.iron===50&&technologyCraft.recipes.rage.cost.uranium===20);
 const solids=base.rocketColliders;let conflicts=[];
 for(const s of moonRailway.segments){const vx=s.b.x-s.a.x,vz=s.b.z-s.a.z,len=vx*vx+vz*vz;for(const c of solids){const x=(c.minX+c.maxX)/2,z=(c.minZ+c.maxZ)/2,t=THREE.MathUtils.clamp(((x-s.a.x)*vx+(z-s.a.z)*vz)/(len||1),0,1),px=s.a.x+vx*t,pz=s.a.z+vz*t;if(px>c.minX-3&&px<c.maxX+3&&pz>c.minZ-3&&pz<c.maxZ+3)conflicts.push([px,pz,c.name]);}}
 check('Railway clearance around the rebuilt wreck',conflicts.length===0,conflicts.slice(0,5));
 enterGame();gameState.inDialogue=false;document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active'));crystalWings.stopFlight();riverBoat.packForTravel();moonRailway.leaveForRespawn();resetGameplayInput();playerLife.resetFall();playerGroup.visible=true;
 playerGroup.position.set(cx,base.level,cz+40);currentGroundY=base.level;isGrounded=true;jumpY=jumpVelocityY=0;heroMotion.reset();
 for(let i=0;i<190;i++)movePlayerWithCollisions(0,-.2);
 check('Player can walk through the main station entrance',playerGroup.position.z<cz+4,{position:playerGroup.position.toArray(),bench:base.bench.pos.toArray()});
 const body=base.rocketColliders.find(c=>c.name==='technology-rocket-pressure-hull'),bx=(body.minX+body.maxX)/2;playerGroup.position.set(bx,base.level+2,body.maxZ+3);currentGroundY=base.level;isGrounded=false;for(let i=0;i<60;i++)movePlayerWithCollisions(0,-.1);check('The shell blocks movement at its actual height',playerGroup.position.z>body.maxZ&&playerGroup.position.z<body.maxZ+1,{z:playerGroup.position.z,bodyMaxZ:body.maxZ,playerY:playerGroup.position.y});
 const cradle=base.rocketColliders.find(c=>c.name==='technology-rocket-cradle');check('Ground-level cradle collision is present',checkCollision((cradle.minX+cradle.maxX)/2,(cradle.minZ+cradle.maxZ)/2,base.level,PLAYER_RADIUS));
 const ray=new THREE.Raycaster(new THREE.Vector3(bx,base.level+3,rocket.position.z+9),new THREE.Vector3(0,0,-1),0,20);check('Camera rays hit the actual new shell',ray.intersectObjects(rocket.children.filter(m=>m.name!=='TSU07_ground'),false).length>0);
 gameState.inDialogue=true;playerGroup.position.set(cx+7,base.level,cz+46);graphicsQuality.apply('balanced');realmScenery.update();graphicsQuality.update(1);const target=rocket.position.clone().add(new THREE.Vector3(0,2,0));
 for(const [name,offset]of [['forecourt-overview',new THREE.Vector3(27,20,37)],['broken-hull-closeup',new THREE.Vector3(11,10,18)],['engine-view',new THREE.Vector3(-25,10,15)]]){camera.position.copy(target).add(offset);camera.lookAt(target);renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');}
 gameState.inDialogue=false;return {checks,views,mesh:{triangles:data.triangles,draws:rocket.children.length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}},entrance:base.bench.pos.toArray()};
})()
