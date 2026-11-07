(()=>{const checks=[],check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail}),P=moonveilPalace,D=MOONVEIL_PALACE_DATA,[x,y,z]=D.center;
check('Blender asset source and rich geometry',D.source.endsWith('MoonveilPalace.blend')&&D.sourceObjects>5000&&D.triangles>80000,{objects:D.sourceObjects,triangles:D.triangles});
check('Exactly two sculpted armoured sentries',P.guards.length===2&&P.guards.every(Boolean));
check('Bedroom, library, bath, council, garden and prison authored',D.rooms.length>=12,D.rooms.map(r=>r.name));
check('Closed main gate blocks entry',P.blocked(x,z+61,y));
playerGroup.position.set(x,y,z+66);checkInteractables();check('E prompt finds main gate',nearbyItem===P.gateItem,nearbyItem?.id);handleInteraction();P.update(.05);check('E opens main gate',P.gateOpen&&!P.blocked(x,z+61,y));
playerGroup.position.set(x,y,z+61);checkInteractables();handleInteraction();check('Gate cannot close on the player',P.gateOpen);
playerGroup.position.set(x,y,z+66);checkInteractables();handleInteraction();check('E closes main gate safely',!P.gateOpen&&P.blocked(x,z+61,y));handleInteraction();
for(const s of [-1,1])check('Curtain wall blocks side entry '+s,P.blocked(x+s*69,z+30,y));
for(let v=65;v<=219;v+=7){const h=getGroundElevation(x,z+v,y);check('Single bridge has continuous support '+v,Math.abs(h-y)<.02&&!checkCollision(x,z+v,y),h);}
// Connected doors and broad hallway, moving in genuine game-sized increments.
for(const [name,a,b]of [['gate to entrance',[0,66],[0,28]],['hall to throne',[0,28],[0,-28]],['library doorway',[-6,9],[-22,9]],['dining doorway',[6,9],[22,9]],['bedroom doorway',[-6,-26],[-20,-26]],['bath doorway',[6,-26],[16,-26]]]){
 let ok=true,blockedPoints=[];for(let i=0;i<=180;i++){const u=a[0]+(b[0]-a[0])*i/180,v=a[1]+(b[1]-a[1])*i/180;if(checkCollision(x+u,z+v,y)){ok=false;if(blockedPoints.length<8)blockedPoints.push({u,v,palace:P.blocked(x+u,z+v,y),nearby:nearbyColliders(x+u,z+v,.2).filter(c=>!c.disabled&&c.minY<y+PLAYER_HEIGHT&&c.maxY>y).map(c=>({name:c.name,x:c.x,z:c.z,minX:c.minX,maxX:c.maxX,minZ:c.minZ,maxZ:c.maxZ})),rail:moonRailway.blocked(x+u,z+v,y,.2)});}}check('Walkable route '+name,ok,blockedPoints);
}
for(const st of D.stairs){let h=y,ok=true;for(let v=st.z1+.4;v>=st.z0-.6;v-=.2){const next=getGroundElevation(x+st.x,z+v,h);if(!Number.isFinite(next)||next-h>.66||checkCollision(x+st.x,z+v,next))ok=false;h=next;}const s=Math.sign(st.x);check('Physical staircase reaches upper storey '+s,ok&&Math.abs(h-(y+14))<.3,h);check('Upstairs door connects landing to suite '+s,!checkCollision(x+s*49,z+D.upperDoorZ,y+14));check('Tower walls are solid instead of traversable '+s,checkCollision(x+s*49,z-42,y+14));}
for(const r of D.rooms){const h=getGroundElevation(x+r.x,z+r.z,y+r.y);check('Correct floor in '+r.name,Math.abs(h-y-r.y)<.7,h);}
for(const [u,v]of [[140,0],[-140,0],[0,-140],[0,140]]){const w=P.waterAt(x+u,z+v);check('Moat level and carved bed '+u+','+v,w?.y===1.2&&playerSurvival.surfaceAt(x+u,z+v)===1.2&&worldSurface.height(x+u,z+v)<.8,{water:w,terrain:worldSurface.height(x+u,z+v)});}
for(let i=0;i<D.channel.length-1;i++)for(let t=0;t<=1;t+=.125){const a=D.channel[i],b=D.channel[i+1],px=a[0]+(b[0]-a[0])*t,pz=a[1]+(b[1]-a[1])*t;check('River to moat continuous '+i+':'+t,P.waterAt(px,pz)?.y===1.2&&playerSurvival.bottomAt(px,pz)<.7);}
check('Rail planner avoids protected island and moat',moonRailway.services.every(s=>s.points.every(p=>!P.railReserved(p.x,p.z))),moonRailway.services.map(s=>({id:s.id,violations:s.points.filter(p=>P.railReserved(p.x,p.z)).length})));
check('Six complete trains preserved',moonRailway.trains.length===6&&moonRailway.trains.every(t=>t.vehicles.length===4));check('Palace reserved from monster camps',constructionZones.contains(x,z,30));check('New map destination exists',landmarksData.some(l=>l.id==='moonveil_palace'));
check('Later river footbridges leave the entire palace lake clear',realmTransitUpdate.bridges.every(b=>b.rows.every(r=>!P.affects(r.p.x,r.p.z))));
check('Replaced thermal bridges have no invisible walking surfaces',['bridge-15','bridge-17'].every(id=>{const b=riverRealm.data.bridges.find(b=>b.id===id);return riverRealm.retiredBridges.has(id)&&!riverRealm.activeBridges.includes(b)&&!Number.isFinite(riverRealm.support(b.x,b.z,y+100));}));
check('Palace footprint does not overlap Bạch Khuyết',!bachKhuyet.contains(x,z)&&!P.affects(610,610)&&worldSurface.height(610,610)>150);
const eye=P.center.clone().add(new THREE.Vector3(170,162,290)),aim=P.center.clone().add(new THREE.Vector3(0,20,0)),ray=new THREE.Raycaster(eye,aim.clone().sub(eye).normalize(),.1,700),visible=[];ray.camera=camera;scene.updateMatrixWorld(true);scene.traverseVisible(o=>{if(o.isMesh&&o.material)visible.push(o)});const first=ray.intersectObjects(visible,false)[0];check('Exterior approach sees the palace before terrain',first?.object.name.startsWith('Moonveil_'),first&&{name:first.object.name,point:first.point.toArray()});
return {checks};})()
