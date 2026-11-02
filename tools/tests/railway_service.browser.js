(async()=>{
 const checks=[],check=(ok,name,detail)=>{checks.push({ok:!!ok,name,detail});};
 const rail=moonRailway,baseline=window.RAILWAY_STATION_BASELINE;
 gameState.isPlaying=true;gameState.inDialogue=false;document.querySelectorAll('.modal-overlay.active').forEach(n=>n.classList.remove('active'));resetGameplayInput();
 check(highlandTrails.fromCache,'Baked walking paths match updated terrain');
 check(rail.stations.length===baseline.stations.length+1&&rail.trains.length===6,'Preserve original stations, add Void district and retain six trains');
 check(baseline.stations.every(name=>rail.stations.some(s=>s.name===name)),'Preserve every station name');
 let curveCount=0,curveChanges=0;
 for(const expected of baseline.curves){const service=rail.services.find(s=>s.id===expected.id),ps=service.points,buffer=new ArrayBuffer(28),view=new DataView(buffer),bytes=new Uint8Array(buffer);let hash=2166136261,count=0;for(let i=0;i<ps.length;i++){const p=ps[i],a=p.clone().sub(ps[(i+ps.length-4)%ps.length]),b=ps[(i+4)%ps.length].clone().sub(p);a.y=b.y=0;const length=(a.length()+b.length())/2,k=Math.acos(THREE.MathUtils.clamp(a.normalize().dot(b.normalize()),-1,1))/Math.max(.001,length);if(k<=.001)continue;count++;view.setUint32(0,i,true);view.setFloat64(4,p.x,true);view.setFloat64(12,p.y,true);view.setFloat64(20,p.z,true);for(const byte of bytes)hash=Math.imul(hash^byte,16777619);}curveCount+=count;if(count!==expected.count||(hash>>>0).toString(16).padStart(8,'0')!==expected.hash)curveChanges++;}
 check(curveCount>9000&&rail.stationGrounding.curveChanges===0,'Retain dense curves and preserve elevated bends during station grounding',{curveCount,curveChanges});
 const audit=rail.stationGrounding;
 check(audit.stations.length===rail.stations.length&&audit.stations.every(s=>Number.isFinite(s.newY)&&s.lowered>=-.02),'Audit every station; only centimeter surface fitting may raise a sample');
 check(audit.moved.length>=20,'Lower clear station approaches',audit.moved);
 check(audit.stations.filter(s=>s.eligible).every(s=>s.grounded||s.reason==='preserve-curves-or-clearance'),'Keep only engineering constraints above native ground');
 let minWater=Infinity,maxGrade=0,minGap=Infinity;
 for(const s of rail.services)for(let i=0;i<s.points.length;i++){const p=s.points[i],q=s.points[(i+1)%s.points.length],d=Math.hypot(p.x-q.x,p.z-q.z);minGap=Math.min(minGap,p.y-rail.terrainHeight(p.x,p.z));if(d>.001)maxGrade=Math.max(maxGrade,Math.abs(p.y-q.y)/d);const v=q.clone().sub(p).normalize();for(const a of [-6,0,6]){const w=rail.railWaterAt(p.x+v.z*a,p.z-v.x*a);if(w!==null)minWater=Math.min(minWater,p.y-w);}}
 let missedBridges=0;for(const service of rail.services)for(const p of service.points)if(p.y-rail.terrainHeight(p.x,p.z)>1.05&&!rail.isBridge(p))missedBridges++;
 check(!missedBridges,'Every raised section uses an open bridge, never a solid embankment',missedBridges);
 const bed=rail.earthBed.geometry.attributes.position;let maxFill=0;for(let i=0;i<bed.count;i++)maxFill=Math.max(maxFill,bed.getY(i)-rail.terrainHeight(bed.getX(i),bed.getZ(i)));
 check(maxFill<=1.03,'No tall stone shoulder anywhere along the network',maxFill);
 let ballast=0;rail.group.traverse(m=>{if(m.name==='Railway_ballast')ballast++;});check(ballast===0,'Protruding stone ballast blocks are removed');
 const ruins=rail.stations.find(s=>s.name==='Ga Ph\u1ebf T\u00edch');const ruinsAudit=audit.stations[rail.stations.indexOf(ruins)].approaches.find(a=>a.line==='return');check(ruinsAudit.gap<5&&(ruinsAudit.gap<1.2||ruinsAudit.protectedAnchors>0),'Ruins opposite platform stays accessible while retaining protected bends',ruinsAudit);
 check(audit.stations.every(s=>s.approaches?.length===2),'Audit both directions at every station');
 check(rail.pillars.length>0&&rail.pillars.every(p=>Math.abs(p.position.y-p.userData.height/2-rail.terrainHeight(p.position.x,p.position.z))<.02),'Bridge piers reach the real ground');
 const obstructed=[];for(const service of rail.services)for(let i=0;i<service.points.length;i+=3){const p=service.points[i],top=rail.obstacleSurvey.top(p.x,p.z,3,p.y+6.8,p.y+.5);if(top>p.y+.5)obstructed.push({line:service.id,index:i,top});}check(!obstructed.length,'Lowered train envelopes avoid original structures',obstructed.slice(0,6));
 for(const a of audit.stations.filter(a=>a.lowApproach)){const station=rail.stations.find(s=>s.name===a.name);check(station.grounded&&station.platform.y-worldSurface.height(station.platform.x,station.platform.z)<1.2&&!station.access.replacedSteepRamp,'Clear ground station uses a low approach: '+a.name,{gap:station.platform.y-worldSurface.height(station.platform.x,station.platform.z),rise:station.access.rise});}
 check(minWater>=6.45,'Both track decks retain river clearance',minWater);check(maxGrade<=.351,'Approaches keep safe grades',maxGrade);check(minGap>=-.15,'Lowered rails stay above actual terrain',minGap);
 const key=(key,code)=>{renderer.domElement.dispatchEvent(new KeyboardEvent('keydown',{key,code,bubbles:true,cancelable:true}));renderer.domElement.dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true,cancelable:true}));};
 function board(train){rail.travel(0,train.trackId==='return');document.getElementById('railway-line').value=train.id;const stop=train.stops.find(s=>s.station===0);train.distance=stop.distance;train.nextStop=(train.stops.indexOf(stop)+1)%train.stops.length;train.state='stopped';train.stationIndex=0;train.remaining=60;train.speed=0;rail.update(0);gameState.health=100;gameState.armor=100;return rail.toggleRide();}
 monsterCamps.add('goldCoin',30);
 const startFov=camera.fov;
 for(const train of rail.trains){
  const coins=monsterCamps.stock.goldCoin;
  check(board(train),'Board '+train.id);if(!rail.aboard)throw Error('Board fixture failed');
  check(monsterCamps.stock.goldCoin===coins-1,'Exactly one fare on '+train.id);
  check(playerLife.protectedOnTrain&&!playerLife.targetable,'Not targetable aboard '+train.id);const parkedNext=rail.nextStop();check(rail.requestNextStop()&&rail.aboard&&rail.exitStation===parkedNext.station,'Request next stop even before departure '+train.id);check(document.getElementById('railway-panel').hidden&&rail.exitStation===parkedNext.station,'Next-station exit is the default even while parked '+train.id);
  const before={health:gameState.health,armor:gameState.armor,deaths:playerLife.deaths};
  check(!playerLife.hurt(99999,false,'poison'),'Central damage rejected '+train.id);
  gameState.health=0;gameState.armor=0;playerLife.die('Forced external death');
  monsterSkills.landDamage(9999,true);desertRealm.hurt(9999,{seconds:20,dps:99});volcanicValley.hurt(9999,true);snowQueen.startFreeze();candyRealm.cast();
  for(let i=0;i<30;i++){playerLife.update(.1);monsterSkills.update(.1);desertRealm.update(.1);volcanicValley.update(.1);snowQueen.update(.1);candyRealm.update(.1);realmTransitUpdate.update(.1);}
  check(gameState.health===before.health&&gameState.armor===before.armor&&playerLife.deaths===before.deaths,'Legacy writes, bosses and DoT cannot damage passenger '+train.id);
  check(!desertRealm.petrified&&!desertRealm.poison.remaining&&!snowQueen.frozen&&!candyRealm.hypnotized&&!monsterSkills.captured,'No hostile status aboard '+train.id);
  check(rail.chooseSeat(3)&&isSitting,'Choose passenger seat '+train.id);check(rail.standPassenger()&&!isSitting,'Stand in carriage '+train.id);const pos=playerGroup.position.clone();rail.movePassenger(.2,0);check(playerGroup.position.distanceTo(pos)>.01,'Walk inside carriage '+train.id);
  const seat=rail.passenger.seat;key('c','KeyC');check(rail.passenger.seat!==seat,'Nearest physical seat with C '+train.id);rail.standPassenger();
  key('v','KeyV');rail.updateCamera();check(rail.viewMode===1,'Left window viewpoint '+train.id);key('v','KeyV');rail.updateCamera();check(rail.viewMode===2,'Right window viewpoint '+train.id);key('z','KeyZ');rail.updateCamera();check(camera.fov===66,'Keyboard scenic zoom '+train.id);rail.zoomBy(-999);rail.updateCamera();check(camera.fov===30,'Scenic zoom lower bound '+train.id);rail.zoomBy(999);rail.updateCamera();check(camera.fov===95,'Scenic zoom upper bound '+train.id);key('v','KeyV');check(rail.viewMode===0,'Return inside viewpoint '+train.id);
  train.state='moving';train.remaining=0;train.distance=(train.distance+20)%train.length;rail.update(0);const next=rail.nextStop();
  check(next&&next.station!==0,'Next station follows actual travel direction '+train.id);
  key('e','KeyE');check(rail.exitStation===next.station&&train.requests.has(next.station),'E requests automatic exit at next station '+train.id);
  check(!document.getElementById('railway-destination'),'No manual destination selector '+train.id);
  check(document.getElementById('railway-request-exit').disabled,'Exit request cannot change destination '+train.id);
  for(const [i,other] of rail.trains.entries())if(other!==train){other.distance=(other.stops.find(s=>s.station===next.station).distance+other.length/2+i*300)%other.length;other.state='stopped';other.remaining=600;}train.distance=(next.distance-.005+train.length)%train.length;train.speed=1;train.nextStop=train.stops.indexOf(next);rail.update(.1);
  check(!rail.aboard&&train.state==='stopped'&&train.stationIndex===next.station,'Auto disembark at requested next stop '+train.id);
  const expected=train.trackId==='return'?rail.stations[next.station].returnPlatform:rail.stations[next.station].platform;
  check(playerGroup.position.distanceTo(expected)<.01,'Exit to correct side '+train.id);check(camera.fov===startFov,'Restore world FOV '+train.id);
  check(!playerLife.protectedOnTrain&&playerLife.targetable,'Protection ends after disembark '+train.id);
 }
 for(const [keyName,id] of [['i','modal-backpack'],['b','modal-field-guide'],['m','modal-world-atlas'],['o','modal-settings'],['p','modal-heroes']]){key(keyName);check(document.getElementById(id).classList.contains('active'),'Panel shortcut '+keyName);key('Escape');document.querySelectorAll('.modal-overlay.active').forEach(n=>closeModal(n.id));}
 key('g');check(gameHUD.travel.open,'G opens locations');key('g');check(!gameHUD.travel.open,'G closes locations');key('h');check(gameHUD.help.open,'H opens help');key('h');
 // Exercise actual causes and the respawn notice, including direct legacy writes.
 fastTravelTo(0,10,'Death checks');playerLife.update(4);gameState.armor=0;gameState.health=10;const healthy=gameState.health;playerLife.hurt(1,false,'hunger');check(gameState.health===healthy-1,'Damage resumes outside train');
 const deathsBefore=playerLife.deaths;
 for(const cause of ['hunger','oxygen','poison','lava','snow_queen','candy_boss']){playerLife.update(4);gameState.health=1;playerLife.hurt(999,false,cause);check(!playerLife.notice.hidden&&playerLife.lastDeath.cause!=='Thương tích không xác định','Specific death cause '+cause,playerLife.lastDeath);check(playerGroup.position.distanceTo(playerLife.spawn)<.1,'Respawn at original spawn '+cause);key('Enter');check(playerLife.notice.hidden,'Enter dismisses death notice '+cause);}
 playerLife.update(4);gameState.health=1;playerLife.noteDamage('guardian');gameState.health=0;playerLife.update(0);check(playerLife.lastDeath.cause.includes('Thần Rừng'),'Legacy direct writes retain death cause');
 playerLife.update(4);gameState.health=1;playerLife.resetFall();isGrounded=false;playerLife.sample(30,0,true);check(playerLife.lastDeath.cause.includes('Rơi từ độ cao'),'Fall death records actual height');
 for(const train of [rail.trains[0],rail.trains[3]]){for(const t of rail.trains){t.state='stopped';t.speed=0;}const car=train.vehicles[0];car.position.set(100,2,100);car.rotation.set(0,0,0);playerGroup.position.set(100,2,100);playerExperience.checkTrains();gameState.health=100;gameState.armor=100;train.state='moving';train.speed=4;car.position.x+=1;check(playerExperience.checkTrains()&&playerLife.lastDeath.cause.includes(train.name),'Death notice identifies the train '+train.id);}
 check(playerLife.deaths>=deathsBefore+8,'All death paths respawn');
 for(const train of rail.trains){train.state='stopped';train.speed=0;}rail.update(0);playerExperience.update(0);playerLife.dismissDeath();gameState.health=gameState.maxHealth;gameState.armor=gameState.maxArmor;
 const pathProbes=[[-3222,125.325,-2509.6],[-3220.0345,173.345,-2065.793]].map(([x,y,z])=>({point:[x,y,z],rail:rail.blocked(x,z,y,.35),trails:highlandTrails.blocked(x,z,y,.35),collision:checkCollision(x,z,y,.35),near:highlandTrails.nearRail(x,z),nearby:[...nearbyColliders(x,z,2)].filter(c=>!c.disabled&&c.maxY>y&&c.minY<y+2).map(c=>({name:c.name,x:c.x,z:c.z,minX:c.minX,maxX:c.maxX,minZ:c.minZ,maxZ:c.maxZ,minY:c.minY,maxY:c.maxY})),ground:worldSurface.height(x,z)}));
 return {checks,pathProbes,maxFill,pierCount:rail.pillars.length,ruinsReturnGap:ruins.returnPlatform.y-rail.terrainHeight(ruins.returnPlatform.x,ruins.returnPlatform.z),fromCache:highlandTrails.fromCache,stations:rail.stations.map(s=>({name:s.name,grounded:s.grounded,rise:s.access.rise,gap:s.platform.y-worldSurface.height(s.platform.x,s.platform.z)})),stationAudit:audit,curveCount,curveChanges,minWater,minGap,maxGrade,trails:highlandTrails.failures,deaths:playerLife.deaths};
})()
