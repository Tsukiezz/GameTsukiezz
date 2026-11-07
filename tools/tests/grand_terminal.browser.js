(async()=>{
 for(const m of document.querySelectorAll('.modal-overlay.active'))closeModal(m.id);gameState.health=100;
 const checks=[],views={},T=window.grandTerminal,R=moonRailway,check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail});
 check('Grand terminal uses editable Blender architecture',T&&GRAND_TERMINAL_DATA.source.endsWith('GrandLunarTerminal.blend')&&GRAND_TERMINAL_DATA.sourceObjects>2000);
 if(!T)return {checks};
 check('Six active trains and sixty-nine existing stops preserved',R.trains.length===6&&R.stations.length===69&&R.trains.every(t=>t.vehicles.length===4));
 check('Six reserve liveries split evenly between both directions',T.reserves.length===6&&new Set(T.reserves.map(t=>t.color)).size===6&&['red','return'].every(id=>T.reserves.filter(t=>t.trackId===id).length===3));
 check('Parked trains are merged by material for limited draw calls',T.reserves.every(t=>t.display.length<=15));
 check('Reserve trains retain one locomotive and three coaches',T.reserves.every(t=>t.parked&&t.vehicles.length===4));
 check('Reserve trains stay out of active dispatch and have 18m berth spacing',T.reserves.every(t=>!R.trains.includes(t)&&Math.abs(t.x)>=30)&&T.reserves.every((t,i)=>T.reserves.every((v,j)=>i===j||Math.abs(t.x-v.x)>=18)));
 check('Gigantic ground waiting hall and supported railway floor',GRAND_TERMINAL_DATA.width>=160&&GRAND_TERMINAL_DATA.length>=190&&T.footings.length>=30&&T.solids.filter(b=>/Load-bearing pier/.test(b.name)).length===49);
 let wet=0;for(let x=-84;x<=84;x+=7)for(let z=-98;z<=98;z+=7){const p=T.world(x,0,z);if(riverBoat.waterAt(p.x,p.z))wet++;}
 check('Hall footprint is on dry terrain with no river dam or floating water',wet===0,{wet,base:T.plan.base,range:[T.plan.low,T.plan.high],center:T.group.position.toArray()});
 let grade=0,buried=0;for(const service of R.services)for(let i=0;i<service.points.length;i++){const p=service.points[i],v=service.points[(i+1)%service.points.length],d=Math.hypot(v.x-p.x,v.z-p.z);if(d>.01)grade=Math.max(grade,Math.abs(v.y-p.y)/d);if(p.y<R.terrainHeight(p.x,p.z)-.25)buried++;}
 check('Railway approaches remain smooth and no track is buried',grade<=.351&&buried===0,{grade,buried});
 for(const [id,side] of [['red',9],['return',-9]]){const service=R.services.find(s=>s.id===id),points=service.points.filter(p=>{const q=T.local(p);return Math.abs(q.x-side)<1&&Math.abs(q.z)<110;});check('Level central main track '+id,points.length>60&&points.every(p=>Math.abs(p.y-T.plan.trackY)<.001),{points:points.length});}
 check('Both opposing platforms share one level',Math.abs(T.station.platform.y-T.station.returnPlatform.y)<.001&&T.station.access.kind==='terminal'&&R.reversePlatforms[T.stationIndex].access.kind==='terminal');
 check('Four public elevators serve the two train platforms and VIP floor',T.lifts.length===4&&T.lifts.every(l=>l.levels.length===3&&l.levels[1]===18&&l.levels[2]===T.vip.floor&&stationMobility.lifts.includes(l)));
 const originalProfile=graphicsQuality.key;camera.position.copy(T.entrance);for(const profile of Object.keys(graphicsQuality.levels)){graphicsQuality.apply(profile);graphicsQuality.update(1);check('Graphics '+profile+' cannot resurrect the replaced station',!T.station.model.visible&&!T.station.foundation.visible&&!R.reversePlatforms[T.stationIndex].root.visible);}graphicsQuality.apply(originalProfile);
 const reset=p=>{R.leaveForRespawn();resetGameplayInput();playerGroup.position.copy(p);currentGroundY=p.y;isGrounded=true;jumpY=0;jumpVelocityY=0;playerLife.resetFall();};
 reset(T.world(39,.07,-87));for(let i=0;i<210;i++){const d=new THREE.Vector3(0,0,.1).applyAxisAngle(new THREE.Vector3(0,1,0),T.plan.yaw);movePlayerWithCollisions(d.x,d.z);}
 check('Actual collision movement walks through the ground waiting hall',T.local(playerGroup.position).z>-68,{position:T.local(playerGroup.position).toArray()});
 const pier=T.world(29,.1,0),open=T.world(18,.1,0);check('Pier bodies block movement while the open hall stays accessible',checkCollision(pier.x,pier.z,pier.y,.3)&&!checkCollision(open.x,open.z,open.y,.3));
 const ceiling=T.world(35,0,5),cap=resolveCastleCeiling(ceiling.x,ceiling.z,T.plan.base+14,T.plan.base+23);check('Solid railway deck prevents flight through the hall ceiling',cap<T.plan.base+17,{cap});
 for(const [index,lift] of T.lifts.entries()){
  reset(lift.worldPoint(0,true));const boarded=stationMobility.interact();for(let i=0;i<180;i++)stationMobility.update(.05);
  check('Elevator physically carries player upstairs '+index,boarded&&lift.floor===1&&Math.abs(T.local(playerGroup.position).y-18)<.05&&lift.open>.99,{floor:lift.floor,y:T.local(playerGroup.position).y});
  const exit=lift.worldPoint(1);check('Upper elevator landing is walkable '+index,Math.abs(getGroundElevation(exit.x,exit.z,exit.y)-(T.plan.base+18))<.06&&!checkCollision(exit.x,exit.z,exit.y,.3));
  reset(lift.worldPoint(1,true));stationMobility.interact();for(let i=0;i<180;i++)stationMobility.update(.05);
  check('Elevator physically returns player to the hall '+index,lift.floor===0&&Math.abs(T.local(playerGroup.position).y-.08)<.05);
 }
 const reserve=T.reserves[0],body=T.world(reserve.x,18.7,0);check('Parked reserve bodies cannot be walked through',checkCollision(body.x,body.z,body.y,.35));
 check('Construction reservation excludes monster camps and quarry mouths',constructionZones.contains(T.group.position.x,T.group.position.z,10)&&!undergroundNetwork.entrances.some(e=>T.inside(e.spot.x,e.spot.z,12)));
 // Exercise ordinary requested-stop boarding at the new through-platform.
 reset(T.station.platform);check('Normal R request works from the new upper platform',R.nearestStation()===T.stationIndex&&R.requestStop(T.stationIndex));
 const train=R.trains.find(t=>t.requests.has(T.stationIndex)),stop=train.stops.find(t=>t.station===T.stationIndex);train.distance=(stop.distance-.5+train.length)%train.length;train.nextStop=train.stops.indexOf(stop);train.speed=2;for(let i=0;i<80&&train.state!=='stopped';i++)R.update(.05);
 check('Active train stops at the central platform for sixty seconds',train.state==='stopped'&&train.stationIndex===T.stationIndex&&train.remaining>59,{remaining:train.remaining});
 monsterCamps.add('goldCoin',2);check('Ordinary E boarding works at the new terminal',R.toggleRide()&&R.aboard);
 const old=playerGroup.position.clone();R.movePassenger(.1,.1);check('Onboard walking remains enabled',R.aboard&&R.passenger.seat===null&&playerGroup.position.distanceTo(old)>0);
 check('E requests the next station after terminal departure',R.requestNextStop()&&R.exitStation!==null);
 R.leaveForRespawn();reset(T.entrance);T.update();
 const oldCamera=camera.position.clone(),quat=camera.quaternion.clone(),fog=scene.fog.density;
 function shot(name,pos,target){playerGroup.position.copy(pos);T.update();undergroundNetwork.environment();camera.position.copy(pos);camera.lookAt(target);graphicsQuality.update(1);realmScenery.update();scene.fog.density=.00016;const visible=playerGroup.visible;playerGroup.visible=false;renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');playerGroup.visible=visible;}
 shot('terminal-overview',T.world(170,92,195),T.world(0,17,0));
 shot('terminal-platforms',T.world(58,29,79),T.world(-25,21,-30));
 shot('terminal-waiting-hall',T.world(45,5,-83),T.world(10,8,55));
 camera.position.copy(oldCamera);camera.quaternion.copy(quat);scene.fog.density=fog;reset(T.entrance);
 return {checks,views,terminal:{name:T.station.name,center:T.group.position.toArray(),reserve:T.reserves.map(t=>({id:t.id,track:t.trackId,x:t.x})),grade,wet,sourceObjects:GRAND_TERMINAL_DATA.sourceObjects,triangles:GRAND_TERMINAL_DATA.triangles}};
})()
