/* A deterministic connected rock labyrinth, isolated below every existing biome. */
async function installUndergroundNetwork(){
 const group=new THREE.Group();group.name='LunarDeepCaveNetwork';scene.add(group);
 const cell=15,n=9,spacing=650,tiles=new Map(),legacyTiles=new Map(),nodes=[],links=[],entrances=[],chunks=[],deposits=[],chests=[],bats=[],torchSites=[];
 let seed=761237,time=0,activeLast=false,previousMask=1,previousBackground=null,oldLightIntensity=18,oldShadowMask=1,lastProfile='';
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),key=(x,z)=>x+','+z;
 const atDepth=p=>p.y< -105,inside=(p=playerGroup.position)=>atDepth(p)||Boolean(window.caveAccess?.inside(p)),owns=(x,z,y)=>y< -105||Boolean(window.caveAccess?.owns(x,z,y));
 // Warp the same rock lattice for rendering and physics: no rectangular tunnel walls.
 const warp=(x,z)=>new THREE.Vector2(x+Math.sin(z/39+x/91)*3.1+Math.sin(z/13)*.55,z+Math.sin(x/43-z/97)*3+Math.cos(x/17)*.55);
 function unwarp(x,z){let a=x,b=z;for(let i=0;i<6;i++){const p=warp(a,b);a+=x-p.x;b+=z-p.y;}return {x:a,z:b};}
 const rawFloor=(x,z)=>-140+Math.sin(x/110)*3.5+Math.cos(z/140)*3+Math.sin((x+z)/45)*1.8+Math.sin(x/19)*Math.cos(z/23)*.9+Math.abs(Math.sin(x/75+z/90))*1.5+Math.sin(x/3.4)*Math.cos(z/2.7)*.18;
 const rawRoof=(x,z)=>rawFloor(x,z)+8.2+Math.sin(x/51+z/77)*1.4+Math.cos(z/33-x/67)*.8;
 function surface(x,z,ceiling=false){const q=unwarp(x,z),gx=Math.floor(q.x/5)*5,gz=Math.floor(q.z/5)*5,p=[[gx,gz],[gx+5,gz],[gx,gz+5],[gx+5,gz+5]].map(([a,b])=>{const w=warp(a,b);return {x:w.x,z:w.y,y:(ceiling?rawRoof:rawFloor)(w.x,w.y)};});
  for(const ids of [[0,2,1],[1,2,3]]){const [a,b,c]=ids.map(i=>p[i]),den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z),u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den;if(u>=-.0001&&v>=-.0001&&u+v<=1.0001)return u*a.y+v*b.y+(1-u-v)*c.y;}return (ceiling?rawRoof:rawFloor)(x,z);
 }
 const floor=(x,z)=>surface(x,z),roof=(x,z)=>surface(x,z,true);
 const formations=[],formationCells=new Map();
 for(let z=0;z<n;z++)for(let x=0;x<n;x++)nodes.push(new THREE.Vector3((x-4)*spacing+Math.sin(z*2+x)*70,0,(z-4)*spacing+Math.cos(x*2-z)*70));
 const visited=new Set([0]),stack=[0],edgeSet=new Set();
 function connect(a,b){const id=[a,b].sort((x,y)=>x-y).join(':');if(edgeSet.has(id))return;edgeSet.add(id);links.push({a,b});}
 while(stack.length){const a=stack.at(-1),x=a%n,z=Math.floor(a/n),options=[[x-1,z],[x+1,z],[x,z-1],[x,z+1]].filter(([x,z])=>x>=0&&x<n&&z>=0&&z<n).map(([x,z])=>z*n+x).filter(i=>!visited.has(i));if(!options.length){stack.pop();continue;}const b=options[Math.floor(random()*options.length)];connect(a,b);visited.add(b);stack.push(b);}
 for(let z=0;z<n;z++)for(let x=0;x<n;x++){const a=z*n+x;if(x<n-1&&random()<.36)connect(a,a+1);if(z<n-1&&random()<.36)connect(a,a+n);}
 function carve(x,z,r=29){for(const [map,size,radius]of [[tiles,cell,r*.49],[legacyTiles,28,r]]){const gx=Math.floor(x/size),gz=Math.floor(z/size);for(let ix=gx-1;ix<=gx+1;ix++)for(let iz=gz-1;iz<=gz+1;iz++)if(Math.hypot((ix+.5)*size-x,(iz+.5)*size-z)<radius+size*.55)map.set(key(ix,iz),{x:ix,z:iz});}}
 const deadEnds=[];
 for(const link of links){if(gameBoot.shouldYield())await gameBoot.yield();const a=nodes[link.a],b=nodes[link.b],d=a.distanceTo(b),side=new THREE.Vector3(b.z-a.z,0,a.x-b.x).normalize(),curve=new THREE.CatmullRomCurve3([a,a.clone().lerp(b,.3).addScaledVector(side,(random()-.5)*220),a.clone().lerp(b,.7).addScaledVector(side,(random()-.5)*200),b]);for(let i=0,m=Math.ceil(d/12);i<=m;i++){const p=curve.getPoint(i/m);carve(p.x,p.z);}}
 for(let i=0;i<36;i++){const node=nodes[(i*17)%nodes.length],angle=random()*Math.PI*2,len=130+random()*180;for(let d=0;d<=len;d+=10)carve(node.x+Math.sin(angle)*d,node.z+Math.cos(angle)*d,22);deadEnds.push(new THREE.Vector3(node.x+Math.sin(angle)*len,0,node.z+Math.cos(angle)*len));}
 const occupied=(x,z)=>{const p=unwarp(x,z);return tiles.has(key(Math.floor(p.x/cell),Math.floor(p.z/cell)));};
 function stairTop(x,z,y=Infinity){return -Infinity;}

 function blocked(x,z,y,r=PLAYER_RADIUS){const a=window.caveAccess?.blocked(x,z,y,r);if(a!==null&&a!==undefined)return a;if(y>=-105)return false;for(const [dx,dz]of [[0,0],[r+1.5,0],[-r-1.5,0],[0,r+1.5],[0,-r-1.5]])if(!occupied(x+dx,z+dz))return true;for(const f of formationCells.get(key(Math.floor(x/cell),Math.floor(z/cell)))||[])if(!f.disabled&&y<f.y+f.h&&y+PLAYER_HEIGHT>f.y&&Math.hypot(x-f.x,z-f.z)<f.r+r)return true;return y<floor(x,z)-.35||y+PLAYER_HEIGHT>roof(x,z)-.03;}
 function ground(x,z,y){const h=window.caveAccess?.ground(x,z,y);return h!==null&&h!==undefined?h:y< -105?floor(x,z):null;}
 function ceiling(x,z,a,b){const h0=window.caveAccess?.ceiling(x,z,a,b);if(h0!==null&&h0!==undefined)return h0;if(a>=-105&&b>=-105)return b;const h=roof(x,z);if(b+PLAYER_HEIGHT>h)b=h-PLAYER_HEIGHT-.02;return Math.max(floor(x,z),b);}
 function clipCamera(origin,desired){
  const delta=desired.clone().sub(origin),length=delta.length();
  const count=Math.max(1,Math.ceil(length/.12)),point=new THREE.Vector3();
  for(let i=1;i<=count;i++){
   point.copy(origin).addScaledVector(delta,i/count);
   const shaft=window.caveAccess?.cameraVolume(point);
   const valid=shaft??(atDepth(point)&&occupied(point.x,point.z)&&
      point.y>floor(point.x,point.z)+.12&&point.y<roof(point.x,point.z)-.15&&
      !blocked(point.x,point.z,point.y-.15,.17));
   if(!valid)return origin.clone().addScaledVector(delta,(i-1)/count);
  }
  return desired;
 }
 function clipView(player, desired){
  const origin=player.clone().add(new THREE.Vector3(0,PLAYER_HEIGHT*.8,0));
  if(inside(player))return clipCamera(origin,desired);
  const near=entrances.some(e=>Math.hypot(player.x-e.spot.x,player.z-e.spot.z)<45);
  if(!near)return desired;
  const d=desired.clone().sub(origin),n=Math.max(1,Math.ceil(d.length()/.2)),point=new THREE.Vector3();
  for(let i=1;i<=n;i++){
   point.copy(origin).addScaledVector(d,i/n);
   const terrain=point.y<worldSurface.height(point.x,point.z)+.08;
   const rock=point.y<(window.caveAccess?.portalTop(point.x,point.z)??-Infinity)-.07;
   if((terrain||rock)&&window.caveAccess?.cameraVolume(point)!==true)return origin.clone().addScaledVector(d,(i-1)/n);
  }
  return desired;
 }
 const terrainSeed=seed;const rockCanvas=document.createElement('canvas');rockCanvas.width=rockCanvas.height=256;const paint=rockCanvas.getContext('2d'),pixels=paint.createImageData(256,256);
 for (let y=0; y<256; y++) for (let x=0; x<256; x++) {
  const i=(y*256+x)*4;
  const strata=Math.sin(y*.132+Math.sin(x*.038)*2.8+Math.cos(x*.013+y*.02));
  const vein=Math.pow(Math.max(0,strata),13);
  const cloud=Math.sin(x*.039+y*.019)*Math.cos(y*.048-x*.019);
  const grain=(random()-.5)*23+Math.sin(x*.89+y*.74)*5;
  pixels.data[i]=136+cloud*19+strata*13+vein*36+grain;
  pixels.data[i+1]=145+cloud*15+strata*10+vein*26+grain;
  pixels.data[i+2]=150+cloud*12+strata*8+vein*13+grain;
  pixels.data[i+3]=255;
 }
 paint.putImageData(pixels,0,0);
 paint.strokeStyle='#222e3759';
 paint.lineWidth=1.2;
 for(let k=0;k<16;k++){
  let x=random()*256,y=random()*256;
  paint.beginPath();paint.moveTo(x,y);
  for(let j=0;j<9;j++){x+=10+random()*15;y+=(random()-.5)*12;paint.lineTo(x,y);}
  paint.stroke();
 }
 seed=terrainSeed;
 const rockTexture=new THREE.CanvasTexture(rockCanvas);
 rockTexture.wrapS=rockTexture.wrapT=THREE.RepeatWrapping;
 const stone=new THREE.MeshStandardMaterial({color:0x9fa4a1,roughness:.97,side:THREE.DoubleSide,map:rockTexture,bumpMap:rockTexture,bumpScale:.18,flatShading:true});
 const bins=new Map();function bin(t){const k=key(Math.floor(t.x/6),Math.floor(t.z/6));if(!bins.has(k))bins.set(k,{x:Math.floor(t.x/6)*cell*6+cell*3,z:Math.floor(t.z/6)*cell*6+cell*3,p:[],uv:[],i:[]});return bins.get(k);}
 function quad(b,a,c,d,e,flip=false,wall=false){const j=b.p.length/3,verticalAxis=Math.abs(c[0]-a[0])<Math.abs(c[2]-a[2]);for(const p of [a,c,d,e]){b.p.push(...p);b.uv.push((wall&&verticalAxis?p[2]:p[0])/4,(wall?p[1]:p[2])/4);}b.i.push(...(flip?[j,j+1,j+2,j+1,j+3,j+2]:[j,j+2,j+1,j+1,j+2,j+3]));}
 function rockPoint(x,z,ratio){const p=warp(x,z),bulge=Math.sin(ratio*Math.PI);return [p.x+Math.sin(x/13+z/9)*1.4*bulge,rawFloor(p.x,p.y)+(rawRoof(p.x,p.y)-rawFloor(p.x,p.y))*ratio,p.y+Math.cos(z/15-x/11)*1.4*bulge];}
 for(const t of tiles.values()){if(gameBoot.shouldYield())await gameBoot.yield();const b=bin(t),x=t.x*cell,z=t.z*cell;
  for(let ix=0;ix<cell/5;ix++)for(let iz=0;iz<cell/5;iz++){const x0=x+ix*5,z0=z+iz*5,corners=[[x0,z0],[x0+5,z0],[x0,z0+5],[x0+5,z0+5]];quad(b,...corners.map(([x,z])=>rockPoint(x,z,0)));quad(b,...corners.map(([x,z])=>rockPoint(x,z,1)),true);}
  let edge=false;
  for(const [dx,dz,ax,az,bx,bz]of [[-1,0,x,z,x,z+cell],[1,0,x+cell,z+cell,x+cell,z],[0,-1,x+cell,z,x,z],[0,1,x,z+cell,x+cell,z+cell]])if(!tiles.has(key(t.x+dx,t.z+dz))){edge=true;for(let k=0;k<cell/5;k++){const u=k/(cell/5),v=(k+1)/(cell/5),xx=ax+(bx-ax)*u,zz=az+(bz-az)*u,xx1=ax+(bx-ax)*v,zz1=az+(bz-az)*v;for(let h=0;h<4;h++)quad(b,rockPoint(xx,zz,h/4),rockPoint(xx1,zz1,h/4),rockPoint(xx,zz,(h+1)/4),rockPoint(xx1,zz1,(h+1)/4),false,true);}}
  const hash=Math.abs(Math.imul(t.x,374761393)^Math.imul(t.z,668265263));
  if(edge&&hash%5===0&&!nodes.some(p=>Math.hypot(p.x-x-cell/2,p.z-z-cell/2)<30)){const p=warp(x+cell/2+(hash%2?4.9:-4.9),z+cell/2+(hash%3?4.9:-4.9)),f={x:p.x,z:p.y,y:floor(p.x,p.y),r:1.2+(hash%13)*.09,h:1.4+(hash%17)*.13};formations.push(f);if(!b.formations)b.formations=[];b.formations.push(f);for(let ix=Math.floor((f.x-f.r-1)/cell);ix<=Math.floor((f.x+f.r+1)/cell);ix++)for(let iz=Math.floor((f.z-f.r-1)/cell);iz<=Math.floor((f.z+f.r+1)/cell);iz++){const k=key(ix,iz);if(!formationCells.has(k))formationCells.set(k,[]);formationCells.get(k).push(f);}}
 }
 const boulderGeometry=new THREE.IcosahedronGeometry(1,1),stalactiteGeometry=new THREE.ConeGeometry(1,1,7),formationDummy=new THREE.Object3D();
 for(const b of bins.values()){if(gameBoot.shouldYield())await gameBoot.yield();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.setIndex(b.i);g.computeVertexNormals();g.computeBoundingSphere();const root=new THREE.Group(),mesh=new THREE.Mesh(g,stone);mesh.name='SealedCaveRockChunk';root.add(mesh);
  if(b.formations?.length){const rocks=new THREE.InstancedMesh(boulderGeometry,stone,b.formations.length),teeth=new THREE.InstancedMesh(stalactiteGeometry,stone,b.formations.length);rocks.name='CaveRockOutcrops';teeth.name='CaveStalactites';rocks.frustumCulled=teeth.frustumCulled=false;for(let i=0;i<b.formations.length;i++){const f=b.formations[i];f.rockMesh=rocks;f.toothMesh=teeth;f.instance=i;formationDummy.position.set(f.x,f.y+f.h*.45,f.z);formationDummy.rotation.set(.1,Math.sin(f.x),.15);formationDummy.scale.set(f.r,f.h*.55,f.r*.85);formationDummy.updateMatrix();rocks.setMatrixAt(i,formationDummy.matrix);formationDummy.position.y=roof(f.x,f.z)-f.h*.65;formationDummy.rotation.set(Math.PI,0,.12);formationDummy.scale.set(f.r*.75,f.h*1.3,f.r*.65);formationDummy.updateMatrix();teeth.setMatrixAt(i,formationDummy.matrix);}root.add(rocks,teeth);}
  root.traverse(o=>{o.layers.set(3);if(o.isMesh)o.castShadow=o.receiveShadow=true;});root.visible=false;group.add(root);chunks.push({mesh:root,x:b.x,z:b.z});}
 // Only survey mouth placement; the deep graph itself never changes with surface art.
 function dry(x,z){
  if(window.constructionZones?.contains?.(x,z,18))return false;
  const h=worldSurface.height(x,z);
  for(const [dx,dz] of [[0,0],[0,8],[0,13],[-5,8],[5,8],[-7,0],[7,0],[-7,-8],[7,-8],[-4,-15],[4,-15],[0,-19]]){
   const px=x+dx,pz=z+dz,y=worldSurface.height(px,pz),limit=dz>=8?1.3:2.5;
   if(!Number.isFinite(y)||Math.abs(y-h)>limit||riverBoat.waterAt(px,pz)||moonRailway.infrastructureAt(px,pz)||checkCollision(px,pz,y,2.35))return false;
  }
  return true;
 }
 function part(root,geo,mat,x,y,z,sx,sy,sz){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);root.add(o);return o;}
 for(let i=0;i<15;i++){if(gameBoot.shouldYield())await gameBoot.yield();const index=[1,7,12,18,25,30,36,40,45,50,57,62,68,73,79][i],target=nodes[index];let spot=null;
  for(let r=40;r<=320&&!spot;r+=40)for(let k=0;k<16&&!spot;k++){const a=k*Math.PI/8+i*.4,x=target.x+Math.sin(a)*r,z=target.z+Math.cos(a)*r;if(dry(x,z))spot=new THREE.Vector3(x,worldSurface.height(x,z),z);}
  if(!spot)continue;
  const mouth=createVipMineModel('quarryPortal');
  mouth.name='QuarryCaveEntrance_'+i;
  const shell=mouth.children[0];
  mouth.add(createVipMineModel('quarryDetails'));
  stationAccessSign(mouth,'MỎ '+String(i+1).padStart(2,'0'),'Hang mỏ liên vùng',new THREE.Vector3(0,4.9,.846)).scale.set(.55,.45,1);
  const lantern=new THREE.PointLight(0xffaf63,2.4,12,1.35);
  lantern.position.set(0,3.6,.62);lantern.visible=false;mouth.add(lantern);
  mouth.position.copy(spot);
  scene.add(mouth);
  const entry={id:'deep_cave_entry_'+i,type:'deep_cave_walkin',pos:spot.clone().add(new THREE.Vector3(0,0,6))},landing=target.clone();landing.y=floor(landing.x,landing.z);
  mouth.traverse(o=>o.layers.enable(3));entrances.push({entry,spot,landing,index,mouth,shell,lantern});
  landmarksData.push({id:entry.id,name:'Hang Mỏ Liên Vùng '+(i+1),x:spot.x,z:spot.z,color:'#b8a27b',icon:'⛏'});
 }
 const saveKey='tsuventure_deep_caves_v1';let claimed=new Set(),oreStock={goldOre:0,diamond:0,krystal:0,mothball:0};try{const s=JSON.parse(localStorage.getItem(saveKey)||'{}');claimed=new Set(Array.isArray(s.claimed)?s.claimed:[]);for(const k of Object.keys(oreStock))if(Number.isSafeInteger(s.stock?.[k])&&s.stock[k]>=0)oreStock[k]=s.stock[k];}catch{}
 const save=()=>localStorage.setItem(saveKey,JSON.stringify({version:1,claimed:[...claimed],stock:oreStock}));
 const oreKinds=[['goldOre','Quặng vàng',0xd5ac55],['diamond','Kim cương',0xb1e5f5],['krystal','Krystal',0x9982dc],['mothball','Băng phiến',0xc5d8c4]],rows={};
 for(const [id,name,color]of oreKinds){const row=document.createElement('article');row.className='backpack-item';row.id='cave-resource-'+id;row.dataset.category='materials';row.innerHTML='<div class="camp-item-icon">◆</div><div><h3></h3><p>Khoáng vật khai thác trong hang mỏ sâu. Dành cho các công thức trong tương lai.</p><strong></strong></div>';row.querySelector('h3').textContent=name;row.querySelector('.camp-item-icon').style.color='#'+color.toString(16);inventoryLayout.grid.append(row);rows[id]=row;}
 const render=()=>{for(const [id,row]of Object.entries(rows))row.querySelector('strong').textContent='Số lượng: '+oreStock[id];};render();
 const caveTiles=[...tiles.values()],tileList=[...legacyTiles.values()].sort((a,b)=>a.x-b.x||a.z-b.z);
 function lootPoint(t,offset=0) {
  const x=(t.x+.5)*28+offset,z=(t.z+.5)*28;
  if(!blocked(x,z,floor(x,z),.5))return {x,z};
  const q=unwarp(x,z),gx=Math.floor(q.x/cell),gz=Math.floor(q.z/cell);
  for(let reach=1;reach<=12;reach++){
   let best=null;
   for(let i=gx-reach;i<=gx+reach;i++)for(let j=gz-reach;j<=gz+reach;j++){
    if(!tiles.has(key(i,j)))continue;
    const w=warp((i+.5)*cell,(j+.5)*cell);
    const distance=Math.hypot(w.x-x,w.y-z);
    if((!best||distance<best.distance)&&!blocked(w.x,w.y,floor(w.x,w.y),.5))best={x:w.x,z:w.y,distance};
   }
   if(best)return best;
  }
  return {x:nodes[0].x,z:nodes[0].z};
 }
 for(let i=0;i<tileList.length;i+=17){
  if(gameBoot.shouldYield())await gameBoot.yield();
  const tile=tileList[i],{x,z}=lootPoint(tile),id='ore_'+tile.x+'_'+tile.z;
  const [kind,name]=oreKinds[Math.floor(random()*4)];
  const root=createVipMineModel(kind);
  root.position.set(x,floor(x,z),z);
  root.rotation.y=(i*.43)%Math.PI;
  root.traverse(o=>o.layers.set(3));
  group.add(root);
  const item={id,type:'deep_cave_ore',kind,quantity:1+Math.floor(random()*4),pos:root.position.clone(),radius:3,prompt:'E · Khai thác '+name,collected:claimed.has(id)};
  deposits.push({item,root});
  interactables.push(item);
 }
 const wallTiles=caveTiles.filter(tile=>[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dz])=>!tiles.has(key(tile.x+dx,tile.z+dz))));
 const chestSpots=[];
 function nearWall(tile) {
  const from=lootPoint(tile,5),cellX=Math.floor(from.x/cell),cellZ=Math.floor(from.z/cell);
  let best=null;
  for(const t of wallTiles){
   if(Math.abs(t.x-cellX)>6||Math.abs(t.z-cellZ)>6)continue;
   for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]]){
    if(tiles.has(key(t.x+dx,t.z+dz)))continue;
    for(const offset of [-4.5,0,4.5]){
     const x0=(t.x+.5)*cell+dx*(cell/2-2.45)-dz*offset;
     const z0=(t.z+.5)*cell+dz*(cell/2-2.45)+dx*offset;
     const p=warp(x0,z0),approach=warp(x0-dx*1.7,z0-dz*1.7);
     const distance=Math.hypot(p.x-from.x,p.y-from.z);
     if(best&&distance>=best.distance)continue;
     if(blocked(p.x,p.y,floor(p.x,p.y),.55)||blocked(approach.x,approach.y,floor(approach.x,approach.y),.35))continue;
     if(chestSpots.some(q=>Math.hypot(q.x-p.x,q.z-p.y)<3.2)||deposits.some(d=>Math.hypot(d.item.pos.x-p.x,d.item.pos.z-p.y)<2.4))continue;
     best={x:p.x,z:p.y,yaw:Math.atan2(-dx,-dz),distance};
    }
   }
  }
  return best||from;
 }
 const elixirChance=.58;
 for(let i=0;i<tileList.length;i+=43){
  if(gameBoot.shouldYield())await gameBoot.yield();
  const t=tileList[i],spot=nearWall(t),{x,z}=spot,id='cache_'+t.x+'_'+t.z;
  const model=createTreasuryModel(i%3===0?'chest_cavern':'chest_basic');
  model.position.set(x,floor(x,z),z);
  model.rotation.y=spot.yaw??0;
  model.traverse(o=>o.layers.set(3));
  group.add(model);
  const item={id,type:'deep_cave_chest',pos:model.position.clone(),radius:3,prompt:'E · Mở rương trong hang',collected:claimed.has(id)};
  const loot=[[['iron','wood','meat','silicon','uranium','bandage'][Math.floor(random()*6)],3+Math.floor(random()*8)],['goldCoin',1+Math.floor(random()*3)],['ore:'+oreKinds[i%4][0],1+Math.floor(random()*3)]];
  const roll=((Math.imul(t.x+327,0x45d9f3b)^Math.imul(t.z+911,0x27d4eb2d))>>>0)%1000;
  if(roll<elixirChance*1000)loot.push(['elixir',1+roll%3]);
  chestSpots.push(spot);
  chests.push({item,model,loot,wall:spot.yaw!==undefined});
  interactables.push(item);
 }
 for(let i=0;i<tileList.length;i+=31){const t=tileList[i];if(random()>.3)continue;const {x,z}=lootPoint(t);torchSites.push(new THREE.Vector3(x,floor(x,z)+2.7,z));const flame=part(group,new THREE.ConeGeometry(.16,.6,5),new THREE.MeshBasicMaterial({color:0xd79148}),x,floor(x,z)+2.7,z,1,1,1);flame.layers.set(3);flame.visible=false;torchSites.at(-1).flame=flame;}
 const lights=Array.from({length:2},()=>{const l=new THREE.PointLight(0xffc184,1.6,48,1.5);l.layers.set(3);l.visible=false;group.add(l);return l;});
 for(let i=0;i<2;i++){const root=createTreasuryModel('cave_bat');root.scale.setScalar(.7);root.traverse(o=>{o.layers.set(3);if(o.material){o.material=o.material.clone();o.material.side=THREE.DoubleSide;}});group.add(root);bats.push({root,home:new THREE.Vector3(),phase:i*2.4});}
 function previewBat(){return createTreasuryModel('cave_bat');}
 function interact(item){if(!['deep_cave_ore','deep_cave_chest'].includes(item?.type))return false;if(!gameState.isPlaying||gameState.inDialogue||item.pos.distanceTo(playerGroup.position)>item.radius+.1||item.collected)return false;
  if(item.type==='deep_cave_ore'){oreStock[item.kind]+=item.quantity;claimed.add(item.id);item.collected=true;render();save();window.itemReceipts?.scan();showNotification('Nhận '+oreKinds.find(k=>k[0]===item.kind)[1]+' ×'+item.quantity);}
  else {
   const chest=chests.find(c=>c.item===item);
   let elixirs=0;
   for(const [kind,count] of chest.loot) {
    if(kind.startsWith('ore:'))oreStock[kind.slice(4)]+=count;
    else if(kind==='elixir'||kind==='bandage'){
     const amount=Math.min(count,99999-templeSupplies.counts[kind]);
     if(amount>0&&templeSupplies.add(kind,amount)&&kind==='elixir')elixirs+=amount;
    } else if(kind==='wood')riverBoat.addWood(count);
    else monsterCamps.add(kind,count);
   }
   claimed.add(item.id);item.collected=true;render();save();window.itemReceipts?.scan();
   showNotification('Đã mở rương hang mỏ'+(elixirs?' · Thuốc Tiên Minh Quang ×'+elixirs:' · Nhận tài nguyên, xu vàng và khoáng vật'));
  }
  return true;
 }
 const visionAmbient=new THREE.HemisphereLight(0xd5eee0,0x46516a,.85);visionAmbient.layers.set(3);visionAmbient.visible=false;scene.add(visionAmbient);
 const stoneFill=new THREE.HemisphereLight(0xd3ddd9,0x594d45,.44);
 stoneFill.layers.set(3);stoneFill.visible=false;scene.add(stoneFill);
 function environment(){const active=gameState.isPlaying&&inside();if(active&&!activeLast){previousMask=camera.layers.mask;previousBackground=scene.background;playerGroup.traverse(o=>o.layers.enable(3));solarFlashlight.held.traverse(o=>o.layers.enable(3));solarFlashlight.light.layers.enable(3);oldLightIntensity=solarFlashlight.light.intensity;oldShadowMask=solarFlashlight.light.shadow.camera.layers.mask;solarFlashlight.light.shadow.camera.layers.set(3);solarFlashlight.light.intensity=3.5;}
  if(active){for(const o of [playerGroup,weaponSystem.model,gearSystem.ironModel,volcanicValley.heldSword])o?.traverse(n=>n.layers.enable(3));const shallow=window.caveAccess?.surfaceVisible(playerGroup.position);
   camera.layers.set(3);
   if(shallow){camera.layers.mask|=previousMask;scene.background=previousBackground;}
   else{scene.background=new THREE.Color(0);scene.fog.color.setHex(0);scene.fog.density=templeSupplies.visionActive?.0035:.012;}document.getElementById('landmark-current-name').textContent='Hang Mỏ Sâu · Mạng hang liên vùng';}
  else if(activeLast){camera.layers.mask=previousMask;scene.background=previousBackground;solarFlashlight.light.layers.disable(3);solarFlashlight.light.intensity=oldLightIntensity;solarFlashlight.light.shadow.camera.layers.mask=oldShadowMask;}stoneFill.visible=active;visionAmbient.visible=active&&templeSupplies.visionActive;activeLast=active;return active;
 }
 function update(dt){dt=Math.min(.1,dt);time+=dt;const active=gameState.isPlaying&&inside(),p=playerGroup.position,range=currentProfileKey==='low'?210:currentProfileKey==='ultra'?530:350;
  for(const c of chunks)c.mesh.visible=active&&Math.hypot(c.x-p.x,c.z-p.z)<range+120;
  for(const d of deposits)d.root.visible=active&&!d.item.collected&&d.root.position.distanceTo(p)<range;
  for(const c of chests){c.model.visible=active&&c.model.position.distanceTo(p)<range;if(c.model.userData.lid)c.model.userData.lid.rotation.x=c.item.collected?-1.25:0;}
  const near=active?torchSites.filter(t=>t.distanceTo(p)<range):[];for(const t of torchSites)t.flame.visible=active&&t.distanceTo(p)<range;near.sort((a,b)=>a.distanceToSquared(p)-b.distanceToSquared(p));for(let i=0;i<lights.length;i++){lights[i].visible=!!near[i];if(near[i])lights[i].position.copy(near[i]);}
  let habitats=[];
  if(active&&atDepth(p)){
   const q=unwarp(p.x,p.z),cx=Math.floor(q.x/cell),cz=Math.floor(q.z/cell);
   for(let x=cx-3;x<=cx+3;x++)for(let z=cz-3;z<=cz+3;z++){
    const hash=(Math.imul(x,374761393)^Math.imul(z,668265263))>>>0;
    if(hash%19!==0||!tiles.has(key(x,z)))continue;
    const w=warp((x+.5)*cell,(z+.5)*cell);
    const distance=Math.hypot(w.x-p.x,w.y-p.z);
    if(distance<34)habitats.push({x:w.x,z:w.y,distance});
   }
   habitats.sort((a,b)=>a.distance-b.distance);
  }
  for(let i=0;i<bats.length;i++){
   const bat=bats[i],home=habitats[i];
   bat.root.visible=Boolean(home);
   if(!home)continue;
   const angle=time*.55+bat.phase;
   const x=home.x+Math.sin(angle)*2.6,z=home.z+Math.cos(angle)*2.6;
   const y=floor(x,z)+3.7+Math.sin(time+bat.phase)*.55;
   if(blocked(x,z,y,.25)){bat.root.visible=false;continue;}
   bat.root.position.set(x,y,z);bat.root.rotation.y=angle+Math.PI/2;
   bat.root.children.forEach((part,index)=>{
    const mount=SURVIVAL_ITEM_DATA.models.cave_bat.parts[index]?.mount;
    if(mount==='wing_L'||mount==='wing_R')part.rotation.z=Math.sin(time*12+bat.phase)*.48*(mount==='wing_L'?-1:1);
   });
   if(bat.root.position.distanceTo(p)<28)window.fieldGuide?.record('cave_bat');
  }
 }
 const travel=(index=0)=>{const e=entrances[index];if(e){const p=e.walkPoints?.[0]??e.entry.pos;fastTravelTo(p.x,p.z+3,'Hang Mỏ Liên Vùng',worldSurface.height(p.x,p.z+3));}};const button=document.createElement('button');button.className='tour-btn';button.textContent='⛏ Hang Mỏ Liên Vùng';button.onclick=()=>{gameHUD.closePanels();travel();};document.querySelector('#hud-travel .hud-destinations').append(button);
 window.undergroundNetwork={grantStock(n=9999){for(const k of Object.keys(oreStock))oreStock[k]=Math.max(oreStock[k],n);render();save();},travel,group,cell,legacyTiles,visionAmbient,owns,warp,unwarp,rawFloor,rawRoof,formations,stairTop,nodes,links,deadEnds,tiles,entrances,chunks,deposits,chests,bats,torchSites,lights,elixirChance,stoneFill,oreStock,rows,render,inside,atDepth,floor,roof,occupied,blocked,ground,ceiling,clipCamera,clipView,interact,environment,update,previewBat,get claimed(){return new Set(claimed);}};update(0);
}
