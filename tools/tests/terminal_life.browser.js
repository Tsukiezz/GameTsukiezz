(async()=>{
 const T=grandTerminal,L=T.ambience,R=moonRailway,checks=[],views={},check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail});
 for(const m of document.querySelectorAll('.modal-overlay.active'))closeModal(m.id);R.leaveForRespawn();
 check('Central terminal renamed consistently',T.station.name==='Bến Xe Lửa Tsukiezz'&&T.plan.name===T.station.name&&landmarksData.find(l=>l.id==='railway_'+T.stationIndex).name===T.station.name);
 const buttons=[...document.querySelectorAll('#hud-travel .tour-btn')].map(b=>b.textContent);check('Travel menu exposes both directions and ground hall under new name',buttons.filter(t=>t.includes('Bến Xe Lửa Tsukiezz')).length>=4&&!buttons.some(t=>t.includes('Đại Sảnh Nguyệt Hành')));
 check('Four main facade signs use the new brand',L.nameplates.length===4&&L.nameplates.every(m=>m.material.map.image.width===1536));
 check('Fourteen real TVs share two changing textures',L.screens.length===14&&new Set(L.screens.map(s=>s.mesh.material.map)).size===2&&L.screens.filter(s=>s.kind==='space').length===4&&L.screens.every(s=>s.back.material.map===s.mesh.material.map));
 const tvBox=L.solids[0],tv=T.world((tvBox.minX+tvBox.maxX)/2,tvBox.minY+.1,(tvBox.minZ+tvBox.maxZ)/2);check('TV chassis have actual collision',L.solids.length===14&&T.blocked(tv.x,tv.z,tv.y,.25));
 check('Fourteen neutral employees have three distinct Blender models',L.staff.length===14&&new Set(L.staff.map(s=>s.kind)).size===3&&TERMINAL_LIFE_DATA.source.endsWith('TsukiezzTerminalLife.blend'));
 check('Employees have independent upright head, arm and leg pivots',L.staff.every(s=>Object.keys(s.parts).length===6&&s.parts.head.position.y>1&&s.parts.leftLeg.position.y>0));
 check('Additional hall lights have no expensive shadows',L.lamps.length===2&&L.lamps.every(l=>!l.castShadow&&l.distance<=80));
 playerGroup.position.copy(T.world(43,.07,0));currentGroundY=playerGroup.position.y;isGrounded=true;resetGameplayInput();
 const initial=L.staff.filter(s=>s.patrol).map(s=>s.root.position.clone()),spaceRevision=L.space.revision,departuresRevision=L.departures.revision;
 for(let i=0;i<100;i++)T.update(.05);
 check('Patrols move smoothly and TV programs advance',L.staff.filter(s=>s.patrol).every((s,i)=>s.root.position.distanceTo(initial[i])>.2)&&L.space.revision>spaceRevision&&L.departures.revision>departuresRevision);
 check('Departure TV reads all six actual train services',L.rows().length===6&&L.rows().every((row,i)=>row.id===R.trains[i].id&&Number.isFinite(row.eta)));
 const train=R.trains[0],previous={state:train.state,index:train.stationIndex,remaining:train.remaining};train.state='stopped';train.stationIndex=T.stationIndex;train.remaining=37;L.paintDepartures();
 check('Boarding countdown on TV follows real train state',L.rows().find(t=>t.id===train.id).boarding&&L.rows().find(t=>t.id===train.id).eta===37);
 Object.assign(train,{state:previous.state,stationIndex:previous.index,remaining:previous.remaining});L.paintDepartures();
 // Audit the actual open aisles for every patrol orbit, not just their start.
 const pathErrors=[];for(const actor of L.staff.filter(s=>s.patrol)){const p=actor.patrol;for(let i=0;i<120;i++){const phase=i*Math.PI*2/120,x=p.x+p.rx*Math.sin(phase),z=p.z+p.rz*Math.cos(phase),point=T.world(x,actor.baseY,z);const solid=T.solids.find(b=>actor.baseY+1.6>b.minY+.01&&actor.baseY<b.maxY-.01&&x+.48>b.minX&&x-.48<b.maxX&&z+.48>b.minZ&&z-.48<b.maxZ);if(solid||!Number.isFinite(T.support(point.x,point.z,point.y)))pathErrors.push({name:actor.name,x,z,solid:solid?.name});}}
 check('Staff patrol orbits clear columns, counters and benches',pathErrors.length===0,pathErrors.slice(0,8));
 const guide=L.staff[0],p=T.world(guide.root.position.x,.07,guide.root.position.z-3);playerGroup.position.copy(p);for(let i=0;i<80;i++)T.update(.05);
 check('Nearby guide turns and waves smoothly',guide.parts.rightArm.rotation.z>1.5&&guide.sprite.visible);
 const body=T.world(guide.root.position.x,.07,guide.root.position.z);check('Employees have physical personal space',T.blocked(body.x,body.z,body.y,.3));
 playerGroup.position.copy(T.world(120,.07,0));T.update(.05);check('Distant employees use merged static geometry',L.staff.some(s=>s.root.visible&&s.lod.visible&&!s.full.visible));
 const oldPlaying=gameState.isPlaying,oldElapsed=L.elapsed;gameState.isPlaying=false;L.update(.1);check('Station animation pauses with gameplay',L.elapsed===oldElapsed);gameState.isPlaying=oldPlaying;
 const oldCamera=camera.position.clone(),quat=camera.quaternion.clone(),fog=scene.fog.density;
 function shot(name,p,target){playerGroup.position.copy(p);camera.position.copy(p);camera.lookAt(target);T.update(.05);undergroundNetwork.environment();graphicsQuality.update(1);realmScenery.update();scene.fog.density=.00018;const vis=playerGroup.visible;playerGroup.visible=false;renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');playerGroup.visible=vis;}
 shot('tsukiezz-entrance',T.world(90,24,-157),T.world(0,14,-20));
 shot('tsukiezz-living-hall',T.world(45,5,-83),T.world(-28,10,50));
 shot('tsukiezz-staff',T.world(35,2.2,-88),T.world(35,1.8,-83));
 shot('tsukiezz-television',T.world(52,5.5,-42),T.world(61.4,5.6,-42));
 camera.position.copy(oldCamera);camera.quaternion.copy(quat);scene.fog.density=fog;playerGroup.position.copy(T.entrance);currentGroundY=T.entrance.y;
 return {checks,views,life:{name:T.station.name,staff:L.staff.length,screens:L.screens.length,triangles:TERMINAL_LIFE_DATA.triangles,objects:TERMINAL_LIFE_DATA.sourceObjects}};
})()
