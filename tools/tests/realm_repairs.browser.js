(async()=>{
 const checks=[],views={},check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail}),P=moonveilPalace,c=P.center;
 const river=riverRealm.waterMeshes.find(m=>m.material.uniforms.kind.value===0).material;
 check('Lake and river use identical ripple shader',P.water.material.fragmentShader===river.fragmentShader);
 check('Lake and river use one animation clock',P.water.material.uniforms.time===river.uniforms.time);
 check('Exclusive water layers prevent overlapping alpha',P.water.material.uniforms.palaceLayer.value===1&&river.uniforms.palaceLayer.value===0&&river.fragmentShader.includes('basin>=0.'));
 for(const [dx,dz] of [[135,0],[-135,0],[0,-135],[0,135]]){const w=riverBoat.waterAt(c.x+dx,c.z+dz);check('Deep physical lake '+dx+','+dz,w&&w.y-w.bottom>18,{water:w,terrain:worldSurface.height(c.x+dx,c.z+dz)});}
 check('All six catalogued fish species inhabit castle lake',aquaticEcology.palaceHabitats.length>=160&&new Set(aquaticEcology.palaceHabitats.map(h=>h.kind)).size===6,aquaticEcology.palaceHabitats.length);
 playerGroup.position.set(c.x+135,0,c.z);aquaticEcology.applyProfile('low');aquaticEcology.update(1);
 check('Fish actually stream near castle lake',aquaticEcology.visibleFish>0&&aquaticEcology.visibleFish<=aquaticEcology.limits.low.fish,aquaticEcology.visibleFish);
 const fishErrors=[];for(const pool of aquaticEcology.pools){const m=new THREE.Matrix4(),p=new THREE.Vector3();for(let i=0;i<pool.body.count;i++){pool.body.getMatrixAt(i,m);p.setFromMatrixPosition(m);const w=riverBoat.waterAt(p.x,p.z);if(!w||p.y>=w.y||p.y<=w.bottom)fishErrors.push(p.toArray());}}
 check('Streamed fish remain submerged and above the bed',fishErrors.length===0,fishErrors);
 check('Authored structure has a spatial collision index',P.structure.length>1000&&P.structureGrid.size>100,P.structure.length);
 for(const [u,v] of [[30,0],[-30,0],[0,-5]]){const below=c.y+25,up=P.ceiling(c.x+u,c.z+v,below,c.y+70),down=P.ceiling(c.x+u,c.z+v,c.y+75,c.y+25);check('Real roof stops upward flight '+u,up<c.y+60,up);check('Roof stops descent from outside '+u,down>c.y+28,down);}
 for(const side of [-1,1])for(const y of [4,8,18,23])check('Window and exterior masonry stop movement '+side+':'+y,P.blocked(c.x+side*49,c.z+6,c.y+y));
 for(const st of MOONVEIL_PALACE_DATA.stairs){resetGameplayInput();isGrounded=true;jumpY=0;jumpVelocityY=0;playerGroup.position.set(c.x+st.x,c.y,c.z+st.z1+.2);for(let i=0;i<750;i++)movePlayerWithCollisions(0,-.1);check('Real movement can climb palace staircase '+st.x,playerGroup.position.z<c.z+st.z0&&playerGroup.position.y>c.y+13.5,playerGroup.position.toArray());}
 // Test the actual wing-flight path through the global physics resolver.
 crystalWings.grant();if(!crystalWings.equipped)crystalWings.equip();if(!crystalWings.flying)crystalWings.toggleFlight();check('Flight physics test has equipped active wings',crystalWings.flying);
 playerGroup.position.set(c.x+30,c.y+25,c.z);keys.swimUp=true;keys.dive=false;for(let i=0;i<120;i++)crystalWings.vertical(.05);keys.swimUp=false;
 check('Equipped wings cannot fly through palace roof',playerGroup.position.y<c.y+45,playerGroup.position.y);
 if(crystalWings.flying)crystalWings.stopFlight();
 worldWeather.stop();worldWeather.start('comet');for(let i=0;i<70;i++)worldWeather.update(.1);worldWeather.camera();
 check('Comet event has visible animated aurora',worldWeather.aurora.visible&&worldWeather.auroraUniforms.strength.value>.95&&worldWeather.auroraUniforms.time.value>6);
 check('Comet event retains safe duration and probability',worldWeather.durations.comet>300&&worldWeather.chance===.15);
 const stats=moonRailway.stations.map((s,i)=>({name:s.name,forward:{kind:s.access.kind,direct:s.access.direct,rise:s.access.rise,meshes:s.access.root.children.length,gap:s.platform.y-moonRailway.terrainHeight(s.platform.x,s.platform.z)},reverse:{kind:moonRailway.reversePlatforms[i].access?.kind,direct:moonRailway.reversePlatforms[i].access?.direct,rise:moonRailway.reversePlatforms[i].access?.rise},audit:moonRailway.stationPlans[i].groundAudit}));
 check('Direct ground entrances replace all redundant low stairs',stats.every(s=>[s.forward,s.reverse].every(a=>a.kind!=='stairs'||Math.abs(a.rise)>.75)),stats.filter(s=>[s.forward,s.reverse].some(a=>a.kind==='stairs'&&Math.abs(a.rise)<=.75)));
 check('Ground entries have no redundant ramp or railing enclosure',moonRailway.stations.every(s=>s.access.kind!=='ground'||s.access.direct&&s.access.root.children.length===0||s.access.requiredTerrainGap>MAX_STEP_HEIGHT));
 check('Both directions have accessible entries at every station',stats.every(s=>s.forward.kind&&s.reverse.kind));
 check('Lowland stations have been audited across the map',stats.every(s=>s.audit&&Number.isFinite(s.audit.newY)),stats);
 check('At least half of stations have direct ground access',stats.filter(s=>s.forward.direct).length>=stats.length*.5,{ground:stats.filter(s=>s.forward.direct).length,total:stats.length});
 let maxGrade=0,buried=0;for(const s of moonRailway.services)for(let i=0;i<s.points.length;i++){const a=s.points[i],b=s.points[(i+1)%s.points.length],d=Math.hypot(a.x-b.x,a.z-b.z);if(d>.01)maxGrade=Math.max(maxGrade,Math.abs(a.y-b.y)/d);if(a.y<moonRailway.terrainHeight(a.x,a.z)-.25)buried++;}
 check('Railway profiles remain smooth after station lowering',maxGrade<=.351,maxGrade);check('No rails buried by ground station grading',buried===0,buried);
 check('Six trains with three coaches remain intact',moonRailway.trains.length===6&&moonRailway.trains.every(t=>t.vehicles.length===4));
 const oldPosition=playerGroup.position.clone(),oldCamera=camera.position.clone(),oldQuat=camera.quaternion.clone(),fog=scene.fog.density;
 function shot(name,pos,target){playerGroup.position.copy(pos);camera.position.copy(pos);camera.lookAt(target);scene.fog.density=.00035;realmScenery.update();worldWeather.camera();P.environment();renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');}
 shot('aurora-sky',new THREE.Vector3(c.x+225,c.y+18,c.z+220),new THREE.Vector3(c.x+150,c.y+120,c.z-100));worldWeather.stop();
 check('Stopping comet restores normal sky without changing base dome',!worldWeather.aurora.visible&&worldWeather.auroraUniforms.strength.value===0);
 shot('lake-river-connection',new THREE.Vector3(306,102,534),new THREE.Vector3(174,-3,430));
 const flat=moonRailway.stations.find(s=>s.access.direct);if(flat){const right=new THREE.Vector3(Math.cos(flat.yaw),0,-Math.sin(flat.yaw)),forward=new THREE.Vector3(Math.sin(flat.yaw),0,Math.cos(flat.yaw));shot('ground-station',flat.platform.clone().addScaledVector(right,52).addScaledVector(forward,48).add(new THREE.Vector3(0,12,0)),flat.platform.clone().add(new THREE.Vector3(0,2,0)));}
 camera.position.copy(oldCamera);camera.quaternion.copy(oldQuat);playerGroup.position.copy(oldPosition);scene.fog.density=fog;
 check('Village walking routes remain complete',highlandTrails.routes.length===69&&highlandTrails.failures.length===0,{routes:highlandTrails.routes.length,failures:highlandTrails.failures});
 return {checks,views,stations:stats,trails:highlandTrails.export()};
})()
