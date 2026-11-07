/* A surveyed, supported railway hall. Active trains keep their existing timetable. */
async function planGrandTerminal(services,plans,height,water,survey){
 const service=services[0],plan=plans.find(p=>/^Ga Viễn Du 18$/.test(p.name));
 if(!plan)throw Error('Grand terminal needs the northern station reservation');
 const ps=service.points,n=ps.length,candidates=[];
 const rejected={neighbor:0,water:0,obstacle:0,terrain:0,curve:0};
 for(let offset=-220;offset<=220;offset+=16)for(const lateral of [0,24,-24,48,-48,72,-72,96,-96,112,-112]){
  if(gameBoot.shouldYield())await gameBoot.yield();
  const index=(plan.routeIndex+offset+n)%n,p=ps[index],dir=ps[(index+12)%n].clone().sub(ps[(index-12+n)%n]);dir.y=0;dir.normalize();
  const side=new THREE.Vector3(dir.z,0,-dir.x),origin=p.clone().addScaledVector(side,-9),center=origin.clone().addScaledVector(side,lateral),yaw=Math.atan2(dir.x,dir.z),floors=[];let wet=false,obstructed=false;
  if(plans.some(s=>{const d=s.center.clone().sub(origin);return s!==plan&&Math.abs(d.dot(side))<70&&Math.abs(d.dot(dir))<800;})){rejected.neighbor++;continue;}
  for(let x=-88;x<=88;x+=11)for(let z=-104;z<=104;z+=13){const q=center.clone().addScaledVector(side,x).addScaledVector(dir,z),h=height(q.x,q.z);floors.push(h);const w=water(q.x,q.z);if(w!==null&&h<(typeof w==='number'?w:w.y)+.6)wet=true;if(survey.top(q.x,q.z,2,h+14,h+1)>h+1)obstructed=true;}
  if(wet){rejected.water++;continue;}if(obstructed){rejected.obstacle++;continue;}
  const high=Math.max(...floors),low=Math.min(...floors);if(high-low>4.5){rejected.terrain++;continue;}
  let straight=true;for(let j=-65;j<=65;j++){const q=ps[(index+j+n)%n].clone().sub(p);if(Math.abs(q.dot(side))>.35||ps[(index+j+n)%n].y>high+16)straight=false;}
  if(!straight){rejected.curve++;continue;}
  candidates.push({index,origin,center,side,dir,yaw,lateral,base:high+.12,low,high,score:(high-low)*20+Math.abs(offset)*.02+Math.abs(lateral)*.04});
 }
 if(!candidates.length)throw Error('Grand terminal survey requires another site: '+JSON.stringify(rejected));
 candidates.sort((a,b)=>a.score-b.score);const site=candidates[0],trackY=site.base+GRAND_TERMINAL_DATA.deckY+.08,changed=[];
 // Level central tracks, with a gentle parallel deviation if the riverside is narrow.
 for(const s of services)for(const p of s.points){const v=p.clone().sub(site.origin),x=v.dot(site.side),z=v.dot(site.dir),d=Math.abs(z);if(Math.abs(x)>35||d>=650)continue;const t=THREE.MathUtils.clamp((650-d)/525,0,1),w=t*t*t*(t*(t*6-15)+10),before=p.y;p.addScaledVector(site.side,site.lateral*w);p.y=Math.max(THREE.MathUtils.lerp(before,Math.max(before,trackY),w),height(p.x,p.z)+.12);const waterY=water(p.x,p.z);if(waterY!==null)p.y=Math.max(p.y,waterY+6.5);p.terrainMode='bridge';if(p.y-before>.001)changed.push({line:s.id,x:p.x,z:p.z,before,after:p.y});}
 plan.routeIndex=site.index;plan.center.copy(ps[site.index]);plan.trackY=trackY;plan.yaw=site.yaw;plan.grounded=false;plan.grandTerminal=true;plan.name=TSUKIEZZ_TERMINAL_NAME;
 site.stationIndex=plans.indexOf(plan);site.trackY=trackY;site.changed=changed;site.width=168;site.length=198;site.name=plan.name;site.plan=plan;
 window.grandTerminalPlan=site;return site;
}

async function installGrandTerminal(){
 const P=window.grandTerminalPlan;if(!P)return;
 const D=GRAND_TERMINAL_DATA,R=moonRailway,s=R.stations[P.stationIndex],reverse=R.reversePlatforms[P.stationIndex],root=new THREE.Group();root.name='GrandLunarTerminal';root.position.copy(P.center);root.position.y=P.base;root.rotation.y=P.yaw;scene.add(root);
 const materials={},cameraObstacles=[],solids=D.solids.map(b=>({...b})),surfaces=D.surfaces.map(b=>({...b}));
 for(const [key,p] of Object.entries(D.palette)){materials[key]=new THREE.MeshStandardMaterial({...p,side:THREE.DoubleSide});if(key==='lamp'){materials[key].emissive.set(p.color);materials[key].emissiveIntensity=.8;}}
 materials.stone.color.multiplyScalar(.72);materials.ivory.color.multiplyScalar(.8);
 const tiles=document.createElement('canvas');tiles.width=tiles.height=256;const ctx=tiles.getContext('2d');ctx.fillStyle='#c2cbd0';ctx.fillRect(0,0,256,256);for(let x=0;x<4;x++)for(let y=0;y<4;y++){ctx.fillStyle=(x+y)%2?'#b4c0c7':'#ccd2d3';ctx.fillRect(x*64+1,y*64+1,62,62);ctx.fillStyle='#c4ab78';ctx.fillRect(x*64+29,y*64+29,6,6);}const texture=new THREE.CanvasTexture(tiles);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;materials.stone.map=texture;
 for(const part of D.parts){if(gameBoot.shouldYield())await gameBoot.yield();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(part.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(part.normals,3));g.setIndex(part.indices);if(part.material==='stone'){const uv=[];for(let i=0;i<part.positions.length;i+=3){const p=part.positions,n=part.normals;uv.push((Math.abs(n[i])>.7?p[i+2]:p[i])/16,(Math.abs(n[i+1])>.7?p[i+2]:p[i+1])/16);}g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}g.computeBoundingSphere();const m=new THREE.Mesh(g,materials[part.material]);m.name='Terminal_'+part.material;m.receiveShadow=true;m.castShadow=false;root.add(m);cameraObstacles.push(m);}
 root.updateWorldMatrix(true,true);const local=p=>root.worldToLocal(p.clone()),world=(x,y,z)=>root.localToWorld(new THREE.Vector3(x,y,z));
 for(const x of [-40,40]){const lamp=new THREE.PointLight(0xffecd6,.82,106,1.2);lamp.position.set(x,12,0);root.add(lamp);}
 // Remove only the ordinary station's presentation. The stop itself is preserved.
 s.grandTerminal=true;s.model.visible=false;s.foundation.visible=false;s.access.root.visible=false;reverse.root.visible=false;reverse.grandTerminal=true;
 s.platform.copy(world(18,18,-15));s.returnPlatform.copy(world(-18,18,15));reverse.position=s.returnPlatform;s.slabTop=P.base+18;
 s.access.kind='terminal';s.access.rise=18;s.access.direct=false;s.access.surfaces=[];s.access.solids=[];
 reverse.access={kind:'terminal',rise:18,direct:false,root:new THREE.Group(),surfaces:[],solids:[]};
 // The four existing shafts serve the public hall, platforms and VIP deck.
 const vip=installTerminalVip(root,world,s.name);
 solids.push(...VIP_MINE_ART.solids);surfaces.push(...VIP_MINE_ART.surfaces);
 vip.model.traverse(mesh=>{if(mesh.isMesh)cameraObstacles.push(mesh);});
 const lifts=[];
 for(const x of [-18,18])for(const z of [-74,74])lifts.push(createStationLift({root,materials,cx:x,cz:z,levels:[.08,18,vip.floor],labels:['1 · Đại sảnh chờ','2 · Sân ga '+(x>0?'chiều xuôi':'chiều ngược'),'3 · Phòng chờ VIP'],name:s.name,role:'terminal'}));
 const reserveColors=[['orange','#ed903a',30,1,'Cam'],['pink','#d878a9',48,1,'Hồng'],['white','#e2e8e5',66,1,'Trắng'],['gray','#858e9b',-30,-1,'Xám'],['brown','#84563e',-48,-1,'Nâu'],['beige','#c5b48d',-66,-1,'Be']],reserves=[];
 for(const [id,color,x,dir,name] of reserveColors){const train=new THREE.Group();train.name='Reserve_'+id;train.position.x=x;train.rotation.y=dir<0?Math.PI:0;root.add(train);const vehicles=[],parkedBoxes=[];
  for(let i=0;i<4;i++){const model=R.createDisplayVehicle(i?'coach':'engine',color);model.position.set(0,18.24,30-i*15);train.add(model);vehicles.push(model);const z=(30-i*15)*dir;parkedBoxes.push({name:'Reserve '+id+' vehicle '+i,minX:x-3,maxX:x+3,minZ:z-6.8,maxZ:z+6.8,minY:18.4,maxY:24});}
  const bins=new Map();train.updateMatrixWorld(true);for(const vehicle of vehicles){vehicle.updateMatrix();vehicle.traverse(m=>{if(!m.isMesh)return;const key=m.material.uuid+'|'+m.material.color.getHexString(),paint=m.material===R.materials.red||m.material.color.getHexString()===color.slice(1),id=paint?'paint':key;let b=bins.get(id);if(!b){b={p:[],n:[],i:[],material:m.material};bins.set(id,b);}m.updateMatrix();const matrix=vehicle.matrix.clone().multiply(m.matrix),normal=new THREE.Matrix3().getNormalMatrix(matrix),p=m.geometry.attributes.position,n=m.geometry.attributes.normal,base=b.p.length/3,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);b.p.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(normal).normalize();b.n.push(v.x,v.y,v.z);}const index=m.geometry.index;for(let i=0;i<index.count;i++)b.i.push(base+index.getX(i));});vehicle.visible=false;}
  const display=[];for(const b of bins.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setIndex(b.i);g.computeBoundingSphere();const mesh=new THREE.Mesh(g,b.material);mesh.name='ReserveMerged_'+id;train.add(mesh);cameraObstacles.push(mesh);display.push(mesh);}
  const reserve={id,color,name,group:train,vehicles,display,trackId:dir>0?'red':'return',parked:true,x};
  reserves.push(reserve);for(const box of parkedBoxes){box.reserve=reserve;solids.push(box);}
  stationAccessSign(root,'DỰ BỊ · '+name.toUpperCase(),dir>0?'Chiều xuôi · 3 toa':'Chiều ngược · 3 toa',new THREE.Vector3(x,27.1,dir>0?44:-44),dir>0?Math.PI:0);
 }
 // Foundations meet the sampled ground; a shallow apron joins the huge hall.
 const apron=new THREE.Group();apron.name='TerminalGroundApron';scene.add(apron);const art=stationAccessGeometry(apron,materials),footings=[];
 const fillHeight=Math.max(.4,P.base-P.low+.2),foundation=new THREE.Mesh(new THREE.BoxGeometry(168,fillHeight,198),materials.stone);foundation.name='TerminalTerrainFoundation';foundation.position.set(0,-fillHeight/2,0);root.add(foundation);solids.push({name:'Terrain foundation',minX:-84,maxX:84,minZ:-99,maxZ:99,minY:-fillHeight,maxY:0});
 for(const x of [-77,-55,-29,0,29,55,77])for(const z of [-84,-56,-28,0,28,56,84]){const p=world(x,0,z),h=R.terrainHeight(p.x,p.z),rise=P.base-h;if(rise>.02){art.box(p.x,h+rise/2,p.z,3.4,rise,3.4,'stone');footings.push({x:p.x,z:p.z,bottom:h,top:P.base});}}
 const verts=[],ix=[],ramps=[];
 for(const side of [-1,1]){const rows=[];for(let i=0;i<=12;i++){const x=side*(83+i*2),row=[];for(let j=0;j<=44;j++){const z=-88+j*4,p=world(x,0,z),h=R.terrainHeight(p.x,p.z),t=i/12;p.y=THREE.MathUtils.lerp(P.base+.035,h+.025,t*t*(3-2*t));row.push(p);verts.push(p.x,p.y,p.z);}rows.push(row);}
  const start=(side<0?0:13*45);for(let i=0;i<12;i++)for(let j=0;j<44;j++){const a=start+i*45+j,b=a+45;ix.push(a,b,a+1,a+1,b,b+1);const v=rows[i][j],w=rows[i+1][j],u=rows[i][j+1],q=rows[i+1][j+1];ramps.push([v,w,u],[u,w,q]);}
 }
 for(const side of [-1,1]){const start=verts.length/3,rows=[];for(let i=0;i<=12;i++){const z=side*(98+i*2),row=[];for(const x of [30,48]){const p=world(x,0,z),h=R.terrainHeight(p.x,p.z),t=i/12;p.y=THREE.MathUtils.lerp(P.base+.07,h+.025,t*t*(3-2*t));row.push(p);verts.push(p.x,p.y,p.z);}rows.push(row);}for(let i=0;i<12;i++){const a=start+i*2,b=a+2;ix.push(a,b,a+1,a+1,b,b+1);ramps.push([rows[i][0],rows[i+1][0],rows[i][1]],[rows[i][1],rows[i+1][0],rows[i+1][1]]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(verts.flatMap((v,i)=>i%3===1?[]:[v/16]),2));g.setIndex(ix);g.computeVertexNormals();const rampMesh=new THREE.Mesh(g,materials.stone);rampMesh.name='TerminalShallowApron';apron.add(rampMesh);art.finish();
 // Labels remain short and spatial; the familiar R/E/C train controls remain.
 const ambience=installTerminalLife({root,rail:R,station:s,local,world});solids.push(...ambience.solids);surfaces.push(...ambience.solids);cameraObstacles.push(...ambience.decor,...ambience.screens.flatMap(s=>[s.mesh,s.back]));
 for(const x of [-18,18])stationAccessSign(root,x>0?'SÂN GA CHIỀU XUÔI':'SÂN GA CHIỀU NGƯỢC','R · Chờ tàu   |   E · Lên tàu',new THREE.Vector3(x,22,-54),Math.PI);
 const dispatch=installReserveDispatch({rail:R,station:s,reserves,root,world,cameraObstacles,solids});
 const grid=new Map(),cell=12;
 for(const b of solids)for(let x=Math.floor(b.minX/cell);x<=Math.floor(b.maxX/cell);x++)for(let z=Math.floor(b.minZ/cell);z<=Math.floor(b.maxZ/cell);z++){const k=x+','+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(b);}
 const inside=(x,z,pad=0)=>{const q=local(new THREE.Vector3(x,P.base,z));return Math.abs(q.x)<84+pad&&Math.abs(q.z)<99+pad;};
 function support(x,z,y){if(R.aboard||!inside(x,z,25))return -Infinity;const q=local(new THREE.Vector3(x,y,z));let top=vip.seatSupport(x,z,y);
  for(const b of surfaces)if(q.x>=b.minX&&q.x<=b.maxX&&q.z>=b.minZ&&q.z<=b.maxZ&&q.y>=b.maxY-MAX_STEP_HEIGHT-.01)top=Math.max(top,P.base+b.maxY);
  for(const lift of lifts)top=Math.max(top,lift.support(x,z,y));
  const roof=roofHeight(q);if(roof!==null&&y>=roof-MAX_STEP_HEIGHT-.01)top=Math.max(top,roof);
  if(!Number.isFinite(top))for(const [a,b,c] of ramps){const den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-8)continue;const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;if(u>=0&&v>=0&&w>=0){const h=u*a.y+v*b.y+w*c.y;if(y>=h-MAX_STEP_HEIGHT-.01)top=Math.max(top,h);}}
  return top;
 }
 function blocked(x,z,y,r=.35){if(!inside(x,z,4))return false;const q=local(new THREE.Vector3(x,y,z));for(const b of grid.get(Math.floor(q.x/cell)+','+Math.floor(q.z/cell))||[])if((!b.reserve||b.reserve.parked)&&!b.disabled&&q.y+PLAYER_HEIGHT>b.minY+.01&&q.y<b.maxY-.01&&q.x+r>b.minX&&q.x-r<b.maxX&&q.z+r>b.minZ&&q.z-r<b.maxZ)return true;return lifts.some(l=>l.blocked(x,z,y,r))||ambience.blocked(q.x,q.z,q.y,r);}
 function roofHeight(q){if(Math.abs(q.z)>91||Math.abs(q.x)>83)return null;let h=30;for(const [x,r,rise] of [[0,25,17],[-55,28,12],[55,28,12]]){const t=(q.x-x)/r;if(Math.abs(t)<=1)h=Math.max(h,30+rise*Math.sqrt(1-t*t));}return P.base+h;}
 function ceiling(x,z,a,b){if(!inside(x,z))return b;const q=local(new THREE.Vector3(x,a,z));let out=b;const roof=roofHeight(q);if(roof!==null){if(b>a&&a+PLAYER_HEIGHT<roof&&b+PLAYER_HEIGHT>=roof)out=Math.min(out,roof-PLAYER_HEIGHT-.04);if(b<a&&a>=roof&&b<roof)out=Math.max(out,roof+.04);}for(const box of grid.get(Math.floor(q.x/cell)+','+Math.floor(q.z/cell))||[]){if(box.disabled||box.reserve&&!box.reserve.parked||q.x<box.minX||q.x>box.maxX||q.z<box.minZ||q.z>box.maxZ)continue;const low=P.base+box.minY,high=P.base+box.maxY;if(b>a&&a+PLAYER_HEIGHT<=low+.02&&out+PLAYER_HEIGHT>low)out=Math.min(out,low-PLAYER_HEIGHT-.02);if(b<a&&a>=high-.02&&out<high)out=Math.max(out,high+.02);}return out;}
 function clipCamera(origin,desired){if(!inside(origin.x,origin.z,12))return desired;const d=desired.clone().sub(origin),len=d.length();if(len<.01)return desired;const ray=new THREE.Raycaster(origin,d.normalize(),.12,len),hit=ray.intersectObjects(cameraObstacles.filter(mesh=>mesh.visible),false)[0];return hit?origin.clone().addScaledVector(d,Math.max(.1,hit.distance-.15)):desired;}
 const lm=landmarksData.find(l=>l.id==='railway_'+P.stationIndex);if(lm){lm.name=TSUKIEZZ_TERMINAL_NAME;lm.x=s.platform.x;lm.z=s.platform.z;}
 // Add a dedicated ground entrance without changing old travel buttons.
 const entrance=world(39,.08,-89),go=document.createElement('button');go.className='tour-btn';go.textContent='🏛 '+TSUKIEZZ_TERMINAL_NAME+' · Tầng trệt';go.onclick=()=>{gameHUD.closePanels();R.leaveForRespawn();playerGroup.position.copy(entrance);currentGroundY=entrance.y;isGrounded=true;jumpVelocityY=0;playerLife.resetFall();worldSurface.resetCamera();camYaw=P.yaw;camPitch=.05;};document.querySelector('#hud-travel .hud-destinations').append(go);
 for(const reverse of [false,true]){const b=document.createElement('button');b.className='tour-btn';b.textContent='🚉 '+TSUKIEZZ_TERMINAL_NAME+' · Ga '+(reverse?'chiều ngược':'chiều xuôi');b.onclick=()=>{gameHUD.closePanels();R.travel(P.stationIndex,reverse);};document.querySelector('#hud-travel .hud-destinations').append(b);}
 const api={dispatch,vip,ambience,group:root,apron,plan:P,station:s,stationIndex:P.stationIndex,reserves,lifts,materials,solids,surfaces,footings,cameraObstacles,grid,local,world,inside,support,blocked,ceiling,clipCamera,entrance,travel:()=>go.click(),update(dt=0){const distance=playerGroup.position.distanceTo(root.position);root.visible=gameState.isPlaying&&distance<1100;apron.visible=root.visible;ambience.group.visible=root.visible;if(root.visible)ambience.update(dt);vip.update(dt);dispatch.update(dt);dispatch.refreshFleet();}};
 window.grandTerminal=api;
 window.constructionZones?.refresh();
}
