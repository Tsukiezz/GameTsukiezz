/* Continuous walkable mine descents. No interaction, teleport or position reset. */
async function installCaveWalkin(){
 const cave=undergroundNetwork,root=new THREE.Group();root.name='ContinuousStoneMineDescents';scene.add(root);
 const paths=[],cells=new Map(),size=12,half=1.72,geometries=[],openings=[];
 const stone=cave.chunks[0].mesh.children[0].material;
 const entryStone=new THREE.MeshStandardMaterial({color:0x606568,roughness:1,side:THREE.DoubleSide,vertexColors:true});
 const roofRay=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,30),roofHits=[];
 function fitPortal(entry,start){
  entry.mouth.position.copy(start);
  if(!entry.shell)return;
  const heights=new Map();
  entry.mouth.traverse(mesh=>{
   if(!mesh.isMesh||mesh.material.isMeshBasicMaterial)return;
   const source=mesh.geometry.getAttribute('position');
   if(!source||!source.array.some((value,index)=>index%3===1&&value<0))return;
   const geometry=mesh.geometry.clone(),vertices=geometry.getAttribute('position');
   for(let i=0;i<vertices.count;i++){
    const y=vertices.getY(i);
    if(y>=0)continue;
    const x=vertices.getX(i),z=vertices.getZ(i),key=x+','+z;
    if(!heights.has(key))heights.set(key,worldSurface.height(start.x+x,start.z+z));
    vertices.setY(i,Math.min(y,heights.get(key)-start.y-.26));
   }
   geometry.computeVertexNormals();geometry.computeBoundingSphere();mesh.geometry=geometry;
  });
  entry.mouth.updateMatrixWorld(true);
 }
 function portalTop(x,z){
  let top=-Infinity;
  for(const {mouth,shell} of cave.entrances){
   const p=mouth.position;
   if(!shell||Math.abs(x-p.x)>10||z>p.z+1||z<p.z-28)continue;
   roofHits.length=0;roofRay.ray.origin.set(x,p.y+15,z);
   roofRay.intersectObject(shell,false,roofHits);
   if(roofHits.length)top=Math.max(top,roofHits[0].point.y);
  }
  return top;
 }
 function surfaceSupport(x,z,y){
  const top=portalTop(x,z);
  return Number.isFinite(top)&&y>=top-MAX_STEP_HEIGHT-.01&&top>worldSurface.height(x,z)+.04?top:-Infinity;
 }
 function surfaceSolid(x,z,y){
  const top=portalTop(x,z);
  return y<top-MAX_STEP_HEIGHT&&y+PLAYER_HEIGHT>worldSurface.height(x,z)-.04;
 }
 function addSegment(a,b,entry,index){const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<.01)return null;const s={a,b,length,dx:dx/length,dz:dz/length,entry,index};s.network=index>=entry.connectorStart&&a.y<-105&&b.y<-105&&[a,b,a.clone().lerp(b,.5)].every(p=>cave.occupied(p.x,p.z)&&Math.abs(cave.floor(p.x,p.z)-p.y)<.015&&!cave.blocked(p.x,p.z,p.y,.25));
  for(let x=Math.floor((Math.min(a.x,b.x)-5)/size);x<=Math.floor((Math.max(a.x,b.x)+5)/size);x++)for(let z=Math.floor((Math.min(a.z,b.z)-5)/size);z<=Math.floor((Math.max(a.z,b.z)+5)/size);z++){const k=x+','+z;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(s);}return s;}
 function sample(x,z,y,padding=1.3){let best=null;for(const s of cells.get(Math.floor(x/size)+','+Math.floor(z/size))||[]){const dx=x-s.a.x,dz=z-s.a.z,t=THREE.MathUtils.clamp((dx*s.dx+dz*s.dz)/s.length,0,1),h=THREE.MathUtils.lerp(s.a.y,s.b.y,t),across=dx*s.dz-dz*s.dx,along=dx*s.dx+dz*s.dz;
   if(along<-.3||along>s.length+.3||Math.abs(across)>half+padding)continue;
   const mouth=s.index<5&&y>=h-.5&&y<s.entry.spot.y+4;
   if(!mouth&&(y<h-.65||y>h+4.8))continue;const distance=Math.hypot(dx-s.dx*s.length*t,dz-s.dz*s.length*t)+Math.abs(y-h)*.02;if(!best||distance<best.distance)best={s,h,across,distance,roof:h+4.45};
  }return best;}
 function owns(x,z,y){const q=sample(x,z,y);return !!q&&!q.s.network;}
 function inside(p){const s=sample(p.x,p.z,p.y);return !!s&&(s.s.index>=3&&p.y<s.s.entry.spot.y-.15||p.y<worldSurface.height(p.x,p.z)-.15);}
 function ground(x,z,y){const q=sample(x,z,y);return q&&!q.s.network?q.h:null;}
 function blocked(x,z,y,r){const q=sample(x,z,y);if(!q||q.s.network)return null;return Math.abs(q.across)>half-r||y<q.h-.4||y+PLAYER_HEIGHT>q.roof-.05;}
 function ceiling(x,z,a,b){const q=sample(x,z,a);if(!q||q.s.network)return null;if(b>a)return Math.min(b,q.roof-PLAYER_HEIGHT-.03);return Math.max(q.h,b);}
 function cameraVolume(p){
  const q=sample(p.x,p.z,p.y);
  if(!q||q.s.network)return null;
  return Math.abs(q.across)<half-.11&&p.y>q.h+.09&&p.y<q.roof-.13;
 }
 function surfaceVisible(p){
  const q=sample(p.x,p.z,p.y);
  return !!q&&!q.s.network&&q.s.index<8&&p.y>q.s.entry.spot.y-5;
 }
 function triangle(buffer,a,b,c){buffer.p.push(...a,...b,...c);const normal=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a))).normalize();const axis=Math.abs(normal.x)>Math.abs(normal.z);for(const p of [a,b,c]){
   buffer.uv.push((Math.abs(normal.y)>.6?p[0]:axis?p[2]:p[0])/2.5,(Math.abs(normal.y)>.6?p[2]:p[1])/2.5);
   if(buffer.colors){const shade=.63+.16*Math.sin(p[0]*1.7+p[1]*2.4+p[2]*.87);buffer.colors.push(shade*1.04,shade,shade*.94);}
  }}
 function meshFor(buffer,name,material=stone){if(!buffer.p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(buffer.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(buffer.uv,2));if(buffer.colors)g.setAttribute('color',new THREE.Float32BufferAttribute(buffer.colors,3));g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,material);m.name=name;m.layers.enable(3);m.castShadow=m.receiveShadow=true;root.add(m);geometries.push(m);return m;}
 for(const e of cave.entrances){if(gameBoot.shouldYield())await gameBoot.yield();
  const p=e.spot,points=[],start=new THREE.Vector3(p.x,worldSurface.height(p.x,p.z+8),p.z+8),mouth=new THREE.Vector3(p.x,p.y-8,p.z-16),radius=14,center=new THREE.Vector3(p.x+radius,0,p.z-16),bottom=cave.floor(mouth.x,mouth.z);
  for(let i=0;i<=12;i++)points.push(start.clone().lerp(mouth,i/12));
  const turns=Math.max(1,Math.ceil((mouth.y-bottom)/26)),steps=turns*72;
  for(let i=1;i<=steps;i++){const a=Math.PI+i/steps*turns*Math.PI*2,variation=Math.sin(i/steps*Math.PI)*.35;points.push(new THREE.Vector3(center.x+Math.cos(a)*radius,THREE.MathUtils.lerp(mouth.y,bottom,i/steps),center.z+Math.sin(a)*(radius+variation)));}
  e.connectorStart=points.length-1;
  const last=points.at(-1),target=e.landing.clone(),route=[last],startAngle=Math.atan2(-20,-radius),targetAngle=Math.atan2(target.z-center.z,target.x-center.x),turn=Math.atan2(Math.sin(targetAngle-startAngle),Math.cos(targetAngle-startAngle));
  for(let i=0,n=Math.max(1,Math.ceil(Math.abs(turn)/.12));i<=n;i++){const a=startAngle+turn*i/n;route.push(new THREE.Vector3(center.x+Math.cos(a)*(radius+12),0,center.z+Math.sin(a)*(radius+12)));}route.push(target);
  for(let j=1;j<route.length;j++){const a=route[j-1],b=route[j],n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/1));for(let i=1;i<=n;i++){const q=a.clone().lerp(b,i/n);q.y=cave.floor(q.x,q.z);points.push(q);}}
  const segments=[],buffer={p:[],uv:[]},entranceRock={p:[],uv:[],colors:[]};
  const cross=[[-half,0],[-half-.35,1],[-half-.2,2.5],[-.87,4.04],[0,4.57],[.87,4.04],[half+.2,2.5],[half+.35,1],[half,0]];
  function ring(i){const p=points[i],d=points[Math.min(points.length-1,i+1)].clone().sub(points[Math.max(0,i-1)]);d.y=0;d.normalize();return cross.map(([x,y],j)=>{const rough=j===0||j===8?0:Math.sin(p.x*.27+p.z*.19+j)*.13;return [p.x+d.z*(x+rough),p.y+y,p.z-d.x*(x+rough)];});}
  let previous=ring(0);
  for(let i=0;i<points.length-1;i++){const s=addSegment(points[i],points[i+1],e,i);segments.push(s);const next=ring(i+1),rock=i<12?entranceRock:buffer;if(s&&!s.network)for(let j=0;j<cross.length;j++){const k=(j+1)%cross.length;triangle(rock,previous[j],next[j],previous[k]);triangle(rock,previous[k],next[j],next[k]);}previous=next;}
  meshFor(buffer,'ContinuousMineRockRamp');
  meshFor(entranceRock,'QuarrySlateEntranceTunnel',entryStone);
  fitPortal(e,start);
  e.walkPoints=points;e.walkSegments=segments;e.entry.pos.copy(start);paths.push({entry:e,points,segments,length:points.slice(1).reduce((sum,q,i)=>sum+q.distanceTo(points[i]),0)});
  openings.push(new THREE.Vector4(p.x,half+.5,p.z-12,start.z+.03));
 }
 const zero=new THREE.Matrix4().makeScale(0,0,0);for(const f of cave.formations){const q=sample(f.x,f.z,f.y,Math.max(1.3,f.r+.8));if(q&&Math.abs(q.across)<half+f.r+.8){f.disabled=true;for(const mesh of [f.rockMesh,f.toothMesh])if(mesh){mesh.setMatrixAt(f.instance,zero);mesh.instanceMatrix.needsUpdate=true;}}}
 // Surface remains intact everywhere except the fifteen small mine mouths.
 const cutMaterials=new Set();scene.traverse(o=>{if(o.isMesh&&o.material?.userData?.lunarSurfaceBase)cutMaterials.add(o.material);});
 for(const m of [ground.material,worldExpansion.terrain.material,terrainContinuity.terrain.material])if(m)cutMaterials.add(m);
 for(const m of cutMaterials){const prior=m.onBeforeCompile,cacheKey=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(shader,...rest){prior.call(this,shader,...rest);shader.uniforms.caveMouths={value:openings};shader.uniforms.caveMouthLevels={value:cave.entrances.map(e=>e.spot.y)};
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCaveMouthWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCaveMouthWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCaveMouthWorld;uniform vec4 caveMouths['+openings.length+'];uniform float caveMouthLevels['+openings.length+'];').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfor(int i=0;i<'+openings.length+';i++){vec4 q=caveMouths[i];float span=q.y*mix(.52,1.,smoothstep(q.z,q.z+4.,vCaveMouthWorld.z));if(abs(vCaveMouthWorld.x-q.x)<span&&vCaveMouthWorld.z>q.z&&vCaveMouthWorld.z<q.w&&vCaveMouthWorld.y>caveMouthLevels[i]-16.)discard;}');};m.customProgramCacheKey=()=>cacheKey()+':covered-quarries';m.needsUpdate=true;}
 window.caveAccess={root,paths,cells,openings,cutMaterials,sample,owns,inside,ground,blocked,ceiling,cameraVolume,surfaceVisible,portalTop,surfaceSupport,surfaceSolid,update(){
  const p=playerGroup.position;
  for(const mesh of geometries)mesh.visible=gameState.isPlaying&&mesh.geometry.boundingSphere.center.distanceTo(p)<mesh.geometry.boundingSphere.radius+220;
  for(const {mouth,lantern} of cave.entrances){const distance=mouth.position.distanceToSquared(p);mouth.visible=gameState.isPlaying&&distance<260**2;if(lantern)lantern.visible=mouth.visible&&distance<30**2;}
 }};
}
