/* Blender-authored moon railway: closed loop, arc-length motion and timed stops. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installMoonRailway(){
    window.gameBoot.taskProgress(0,171);
const data=RAILWAY_ASSETS,group=new THREE.Group();window.gameBoot.taskProgress(1,171);
group.name='MoonRailway';window.gameBoot.taskProgress(2,171);
scene.add(group);
    window.gameBoot.taskProgress(3,171);
const materials={};window.gameBoot.taskProgress(4,171);
for(const [key,color] of Object.entries(data.materials)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();materials[key]=new THREE.MeshStandardMaterial({color:new THREE.Color(...color),roughness:.65,metalness:key==='steel'||key==='gold'?.6:0});}
    window.gameBoot.taskProgress(5,171);
materials.lamp.emissive=new THREE.Color(0xffd68a);window.gameBoot.taskProgress(6,171);
materials.lamp.emissiveIntensity=.8;
    window.gameBoot.taskProgress(7,171);
materials.glass.transparent=true;window.gameBoot.taskProgress(8,171);
materials.glass.opacity=.18;window.gameBoot.taskProgress(9,171);
materials.glass.depthWrite=false;window.gameBoot.taskProgress(10,171);
materials.glass.side=THREE.DoubleSide;
    window.gameBoot.taskProgress(11,171);
const templates={};window.gameBoot.taskProgress(12,171);
for(const [kind,pieces] of Object.entries(data.models)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        const model=new THREE.Group();for(const p of pieces){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flat(),3));g.setIndex(p.indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,materials[p.material]);mesh.name=p.name;model.add(mesh);}templates[kind]=model;
    }
    window.gameBoot.taskProgress(13,171);
const vehicleTemplates={};
    window.gameBoot.taskProgress(14,171);
for(const kind of ['engine','coach']){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const root=new THREE.Group(),buffers=new Map();for(const mesh of templates[kind].children){if(window.gameBoot.shouldYield())await window.gameBoot.yield();let b=buffers.get(mesh.material);if(!b){b={positions:[],normals:[],indices:[]};buffers.set(mesh.material,b);}const offset=b.positions.length/3,g=mesh.geometry;b.positions.push(...g.attributes.position.array);b.normals.push(...g.attributes.normal.array);for(const i of g.index.array){if(window.gameBoot.shouldYield())await window.gameBoot.yield();b.indices.push(offset+i);}}for(const [material,b] of buffers){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.normals,3));g.setIndex(b.indices);root.add(new THREE.Mesh(g,material));}vehicleTemplates[kind]=root;}
    // Share merged static station meshes across the ten stops to keep draw calls low.
    window.gameBoot.taskProgress(15,171);
const stationDisplay=new THREE.Group(),stationBuffers=new Map();
    window.gameBoot.taskProgress(16,171);
for(const mesh of templates.station.children){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(mesh.name==='Platform'||mesh.name==='TicketHallFloor'){stationDisplay.add(mesh.clone());continue;}let buffer=stationBuffers.get(mesh.material);if(!buffer){buffer={positions:[],normals:[],indices:[]};stationBuffers.set(mesh.material,buffer);}const g=mesh.geometry,offset=buffer.positions.length/3;buffer.positions.push(...g.attributes.position.array);buffer.normals.push(...g.attributes.normal.array);for(const index of g.index.array){if(window.gameBoot.shouldYield())await window.gameBoot.yield();buffer.indices.push(offset+index);}}
    window.gameBoot.taskProgress(17,171);
for(const [material,b] of stationBuffers){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(b.normals,3));geometry.setIndex(b.indices);stationDisplay.add(new THREE.Mesh(geometry,material));}
    // Query rendered triangles, not the analytic terrain approximation: the
    // coarse lunar skin and cut-out river meshes have different heights at seams.
    window.gameBoot.taskProgress(18,171);
const terrainMeshes=[window.moonveilPalace?.terrain,window.worldExpansion?.terrain,window.candyRealm?.terrain,ground,window.terrainContinuity?.terrain,window.technologyBase?.terrain,window.desertRealm?.terrain,window.riverRealm?.terrain,window.bachKhuyet?.terrain,window.volcanicValley?.terrain,window.mangroveRealm?.terrain,window.ancientGrove?.group.getObjectByName('GroveForestFloor')].filter(Boolean);
    window.gameBoot.taskProgress(19,171);
terrainMeshes.forEach(m=>m.updateWorldMatrix(true,false));
    window.gameBoot.taskProgress(20,171);
const terrainCells=new Map(),heightCache=new Map(),footprintCache=new Map(),cellSize=32;
    // Index actual projected triangles once, so thousands of height queries
    // do not raycast the whole map during loading or while the player moves.
    async function rebuildTerrainIndex(){terrainCells.clear();heightCache.clear();footprintCache.clear();
    for(const mesh of terrainMeshes){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const g=mesh.geometry,position=g.attributes.position,index=g.index;
        for(let i=0;i<(index?.count??position.count);i+=3){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const v=[];for(let k=0;k<3;k++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();v.push(new THREE.Vector3().fromBufferAttribute(position,index?index.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld));}
            const [a,b,c]=v,den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-8)continue;const triangle={a,b,c,den};
            for(let x=Math.floor(Math.min(a.x,b.x,c.x)/cellSize);x<=Math.floor(Math.max(a.x,b.x,c.x)/cellSize);x++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let z=Math.floor(Math.min(a.z,b.z,c.z)/cellSize);z<=Math.floor(Math.max(a.z,b.z,c.z)/cellSize);z++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const key=x+','+z;if(!terrainCells.has(key))terrainCells.set(key,[]);terrainCells.get(key).push(triangle);}}
        }
    }
    }
    window.gameBoot.taskProgress(21,171);
await rebuildTerrainIndex();
    window.gameBoot.taskProgress(22,171);
const nativeStationTerrain=captureStationTerrain(terrainMeshes,terrainCells,realmTerrainHeight);
    function terrainHeight(x,z){const key=x.toFixed(2)+','+z.toFixed(2);if(heightCache.has(key))return heightCache.get(key);let top=-Infinity;
        for(const {a,b,c,den} of terrainCells.get(Math.floor(x/cellSize)+','+Math.floor(z/cellSize))||[]){const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;if(u>=-1e-6&&v>=-1e-6&&w>=-1e-6)top=Math.max(top,u*a.y+v*b.y+w*c.y);}
        const height=Number.isFinite(top)?top:realmTerrainHeight(x,z);if(heightCache.size>200000)heightCache.clear();heightCache.set(key,height);return height;
    }
    window.gameBoot.taskProgress(23,171);
terrainHeight.maxOverRect=(x,z,radius=10)=>{const key=x.toFixed(2)+','+z.toFixed(2)+','+radius;if(footprintCache.has(key))return footprintCache.get(key);let top=-Infinity;const seen=new Set();
        for(let cx=Math.floor((x-radius)/cellSize);cx<=Math.floor((x+radius)/cellSize);cx++)for(let cz=Math.floor((z-radius)/cellSize);cz<=Math.floor((z+radius)/cellSize);cz++)for(const triangle of terrainCells.get(cx+','+cz)||[]){if(seen.has(triangle))continue;seen.add(triangle);let poly=[triangle.a,triangle.b,triangle.c];
            for(const [axis,limit,sign] of [['x',x-radius,1],['x',x+radius,-1],['z',z-radius,1],['z',z+radius,-1]]){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-limit)*sign,db=(b[axis]-limit)*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.clone().lerp(b,da/(da-db)));}poly=out;if(!poly.length)break;}
            for(const p of poly)top=Math.max(top,p.y);
        }
        if(!Number.isFinite(top))top=terrainHeight(x,z);footprintCache.set(key,top);return top;
    };
    function railWaterAt(x,z){
        let top=playerSurvival.surfaceAt(x,z);const hit=window.worldExpansion?.nearest(x,z),oldHit=window.riverRealm?.nearest(x,z);if(oldHit&&oldHit.distance<=oldHit.width+1)top=Math.max(top??-Infinity,oldHit.y);
        if(hit&&hit.distance<=hit.width+1&&worldExpansion.height(x,z)<worldExpansion.waterY+.05)top=Math.max(top??-Infinity,worldExpansion.waterY);
        return top;
    }
    window.gameBoot.taskProgress(24,171);
const obstacleSurvey=await surveyRailwayObstacles(scene,terrainMeshes,terrainHeight),planRoute=createRailwayRoutePlanner(terrainHeight,obstacleSurvey);
    window.gameBoot.taskProgress(25,171);
const network=createRailwayServices(data.network),services=network.services,networkPaths=[],pathMap=new Map(),points=[];
    window.gameBoot.taskProgress(26,171);
const placedNodes=[];
    window.gameBoot.taskProgress(27,171);
for(const [id,xyz] of Object.entries(network.nodes)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        const service=services.find(t=>id.startsWith(t.id+'_')),original=new THREE.Vector3(...xyz);let best=Infinity,chosen=original;
        const fixed=network.fixedNodes?.[id];if(fixed){const p=new THREE.Vector3(...fixed),floor=terrainHeight(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z),rail=water!==null&&floor<water+.2?water+3.2:floor;if(obstacleSurvey.top(p.x,p.z,14,rail+7.2,rail+.5)<=rail+.5){network.nodes[id]=[...fixed];p.lineId=service.id;placedNodes.push(p);continue;}}
        for(let x=Math.ceil(Math.max(service.bounds.x0+8,original.x-80)/20)*20;x<=Math.min(service.bounds.x1-8,original.x+80);x+=20){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let dz=-60;dz<=60;dz+=20){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const p=new THREE.Vector3(x,0,original.z+dz),sameRowLeft=network.nodes[id.replace('_R','_L')];if(Math.abs(p.z)>service.bounds.z1-30||id.includes('_L')&&x>(service.left+service.right)/2-30||id.includes('_R')&&x<sameRowLeft[0]+190||placedNodes.some(q=>q.lineId===service.id&&q.distanceTo(p)<190))continue;
            const floors=[];for(const ox of [-65,0,65]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const oz of [-65,0,65]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();floors.push(terrainHeight(p.x+ox,p.z+oz));}}const floor=terrainHeight(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z),wet=water!==null&&floor<water+.2,obstacle=obstacleSurvey.top(p.x,p.z,window.desertRealm&&['red_P08','red_P11'].includes(id)?32:100,(wet?water+3.2:floor)+7.2,floor+.5),score=planRoute.costAt(p)*60+(Math.max(...floors)-Math.min(...floors))*40+(Number.isFinite(obstacle)?10000:0)+(wet?20000:0)+Math.hypot(x-original.x,dz);if(score<best){best=score;chosen=p;}}}
        network.nodes[id]=chosen.toArray();chosen.lineId=service.id;placedNodes.push(chosen);
    }
    window.gameBoot.taskProgress(28,171);
const junctions=Object.entries(network.nodes).map(([id,p])=>({id,lineId:id.split('_')[0],center:new THREE.Vector3(...p),radius:80}));
    window.gameBoot.taskProgress(29,171);
let buildingService=null,recordPath=false;
    function corridor(a,b,from,to){const service=buildingService,u=network.sourceNodes[from],v=network.sourceNodes[to],horizontal=Math.abs(v[0]-u[0])>Math.abs(v[2]-u[2]);
        return {x0:Math.max(service.bounds.x0,horizontal?Math.min(a.x,b.x)-35:u[0]-100),x1:Math.min(service.bounds.x1,horizontal?Math.max(a.x,b.x)+35:u[0]+100),z0:Math.max(service.bounds.z0,horizontal?u[2]-100:Math.min(a.z,b.z)-35),z1:Math.min(service.bounds.z1,horizontal?u[2]+100:Math.max(a.z,b.z)+35)};
    }
    function addPath(a,b,control,from,to){const key=[a.toArray().join(','),b.toArray().join(',')].sort().join('|')+'|'+(control?.toArray().join(',')||'line');let path=pathMap.get(key);
        if(!path&&!control)planRoute.configure({bounds:{...corridor(a,b,from,to),region:buildingService.bounds},junctions:junctions.filter(j=>j.lineId===buildingService.id).map(j=>j.center)});
        if(!path){const curve=control?new THREE.QuadraticBezierCurve3(a,control,b):planRoute(a,b),count=Math.max(2,Math.ceil(curve.getLength()/2));path={id:networkPaths.length,lineId:buildingService.id,a:a.clone(),b:b.clone(),points:Array.from({length:count+1},(_,i)=>curve.getPointAt(i/count))};path.points.forEach(p=>p.lineId=buildingService.id);pathMap.set(key,path);networkPaths.push(path);}
        const forward=path.a.distanceTo(a)<.01,list=forward?path.points:[...path.points].reverse();if(recordPath)buildingService.points.push(...list.slice(0,-1));
    }
    window.gameBoot.taskProgress(30,171);
for(const service of services){if(window.gameBoot.shouldYield())await window.gameBoot.yield();buildingService=service;const edges=network.edges.filter(e=>e.lineId===service.id).sort((a,b)=>new THREE.Vector3(...network.sourceNodes[b.a]).distanceTo(new THREE.Vector3(...network.sourceNodes[b.b]))-new THREE.Vector3(...network.sourceNodes[a.a]).distanceTo(new THREE.Vector3(...network.sourceNodes[a.b])));for(const edge of edges){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const a=new THREE.Vector3(...network.nodes[edge.a]),b=new THREE.Vector3(...network.nodes[edge.b]),direction=b.clone().sub(a).normalize();addPath(a.clone().addScaledVector(direction,64),b.clone().addScaledVector(direction,-64),null,edge.a,edge.b);}}
    window.gameBoot.taskProgress(31,171);
recordPath=true;
    window.gameBoot.taskProgress(32,171);
for(const service of services){if(window.gameBoot.shouldYield())await window.gameBoot.yield();buildingService=service;const walk=service.patrol.map(id=>new THREE.Vector3(...network.nodes[id])),radius=64;
        for(let i=0;i<walk.length;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const prev=walk[(i-1+walk.length)%walk.length],node=walk[i],next=walk[(i+1)%walk.length],entry=node.clone().addScaledVector(prev.clone().sub(node).normalize(),radius),exit=node.clone().addScaledVector(next.clone().sub(node).normalize(),radius),nextEntry=next.clone().addScaledVector(node.clone().sub(next).normalize(),radius);addPath(entry,exit,node);addPath(exit,nextEntry,null,service.patrol[i],service.patrol[(i+1)%walk.length]);}
        service.points.forEach((p,i)=>{p.lineId=service.id;p.railDirection=service.points[(i+1)%service.points.length].clone().sub(service.points[(i+service.points.length-1)%service.points.length]).normalize();});points.push(...service.points);
    }
    window.gameBoot.taskProgress(33,171);
const samples=points.length,groundHeights=[],waterCrossings=[];
    window.gameBoot.taskProgress(34,171);
for(const p of points){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const floor=terrainHeight(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z);groundHeights.push(floor);waterCrossings.push(water!==null&&floor<water+.15);}
    window.gameBoot.taskProgress(35,171);
await resolveRailwayClearance(points,networkPaths,terrainHeight,railWaterAt,obstacleSurvey,[],junctions,services);
    window.gameBoot.taskProgress(36,171);
const stationSpecs=network.stations;
    window.gameBoot.taskProgress(37,171);
await planVoidDistrict(services,terrainHeight,obstacleSurvey,railWaterAt,stationSpecs);
    window.gameBoot.taskProgress(38,171);
const planningGrid=new Map();window.gameBoot.taskProgress(39,171);
for(const p of points){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const key=Math.floor(p.x/64)+','+Math.floor(p.z/64);if(!planningGrid.has(key))planningGrid.set(key,[]);planningGrid.get(key).push(p);}
    function clearStationSite(p,yaw){const gx=Math.floor(p.x/64),gz=Math.floor(p.z/64),cs=Math.cos(yaw),sn=Math.sin(yaw);for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)for(const other of planningGrid.get((gx+a)+','+(gz+b))||[]){const dx=other.x-p.x,dz=other.z-p.z,x=dx*cs-dz*sn,z=dx*sn+dz*cs;if(Math.abs(z)<66&&x>-12&&x<78&&Math.abs(x)>3.3)return false;}return true;}
    window.gameBoot.taskProgress(40,171);
const selectedStationCenters=[],chosenStationPlans=[];
    window.gameBoot.taskProgress(41,171);
const stationPlans=[];
async function bootPlanStation(spec){
        const original=new THREE.Vector3(...spec.position);if(spec.villageId!==undefined){const shared=chosenStationPlans.find(p=>!p.villageIds?.length&&Math.hypot(p.center.x-original.x,p.center.z-original.z)<210);if(shared){(shared.villageIds??=[]).push(spec.villageId);return null;}}const service=services.find(t=>t.id===spec.lineId);let best=Infinity,plan;
        for(let j=0;j<service.points.length;j++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const p=service.points[j],distance=Math.hypot(p.x-original.x,p.z-original.z),water=playerSurvival.surfaceAt(p.x,p.z);if(distance>(['Ga Rừng Cổ','Ga Băng Nguyệt 5'].includes(spec.name)?1400:spec.villageId!==undefined?340:Math.max(spec.maxDistance??2800,window.westernHighlands?.contains(original.x,original.z)?1300:0))||water!==null&&terrainHeight(p.x,p.z)<water+.15)continue;
            if(junctions.some(h=>h.lineId===service.id&&Math.hypot(p.x-h.center.x,p.z-h.center.z)<(spec.villageId!==undefined?35:175))||selectedStationCenters.some(c=>Math.hypot(c.x-p.x,c.z-p.z)<(spec.villageId!==undefined?145:170)))continue;
            const ahead=service.points[(j+1)%service.points.length],heading=Math.atan2(ahead.x-p.x,ahead.z-p.z);
            for(const yaw of [heading]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
                if(!clearStationSite(p,yaw))continue;const heights=[];let wet=false,straight=true,profileHigh=p.y;
                for(let offset=-32;offset<=32;offset+=2){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const near=service.points[(j+offset+service.points.length)%service.points.length],q=near.clone().sub(p).applyAxisAngle(new THREE.Vector3(0,1,0),-yaw);if(Math.abs(q.x)>.4)straight=false;profileHigh=Math.max(profileHigh,near.y);}
                for(const x of [-6,4,14,24,34]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const z of [-48,-24,0,24,48]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const v=new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(p),h=terrainHeight(v.x,v.z),w=playerSurvival.surfaceAt(v.x,v.z);heights.push(h);if(Math.abs(v.x)>EXPANDED_REALM_DATA.bound-5||Math.abs(v.z)>EXPANDED_REALM_DATA.bound-5||w!==null&&h<w||obstacleSurvey.top(v.x,v.z,2,h+17,h+.5)>h+.5)wet=true;}}
                for(const x of [6,8,10]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let z=50;z<=72;z+=4){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const v=new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(p),h=terrainHeight(v.x,v.z),w=playerSurvival.surfaceAt(v.x,v.z);if(w!==null&&h<w+.4||obstacleSurvey.top(v.x,v.z,.8,h+3,h+.4)>h+.4)wet=true;}}
                if(wet||!straight)continue;const high=Math.max(...heights),low=Math.min(...heights),grounded=profileHigh-high<1&&high-low<6,right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),inside=(service.left+service.right)/2-p.x,score=spec.villageId!==undefined?distance*80+(high-low)*2:(grounded?0:100000)+(high-low)*180+distance+(straight?0:5000)-(right.x*inside>0?15:0);
                if(spec.optional&&!grounded&&!window.westernHighlands?.contains(original.x,original.z))continue;if(score<best){best=score;plan={villageIds:spec.villageId!==undefined?[spec.villageId]:[],index:points.indexOf(p),routeIndex:j,lineId:service.id,yaw,grade:grounded?[...heights].sort((a,b)=>a-b)[Math.floor(heights.length/2)]:high,center:p.clone(),name:spec.name,straight,grounded,nativeSite:{low,high,median:[...heights].sort((a,b)=>a-b)[Math.floor(heights.length/2)]}};}
            }
        }
        if(!plan){if(spec.optional)return null;throw Error('No safe station site '+spec.name);};selectedStationCenters.push(plan.center);chosenStationPlans.push(plan);return plan;
    }
for(const spec of stationSpecs){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const plan=await bootPlanStation(spec);if(plan)stationPlans.push(plan);}
stationPlans.sort((a,b)=>a.index-b.index);
    window.gameBoot.taskProgress(42,171);
for(const plan of stationPlans){if(window.gameBoot.shouldYield())await window.gameBoot.yield();plan.name=plan.name.replace(/lâu đài/gi,'Đồng Nguyệt Quang');}
    window.gameBoot.taskProgress(43,171);
const names=stationPlans.map(plan=>plan.name);
    window.gameBoot.taskProgress(44,171);
for(let i=0;i<samples;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const p=points[i];groundHeights[i]=terrainHeight(p.x,p.z);const water=playerSurvival.surfaceAt(p.x,p.z);waterCrossings[i]=water!==null&&groundHeights[i]<water+.15;}
    // Only shallow station pads are levelled. Buildings and rugged terrain are
    // excluded by site selection; the surrounding ground blends back gradually.
    window.gameBoot.taskProgress(45,171);
for(const mesh of terrainMeshes){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const vertices=mesh.geometry.attributes.position,inverse=mesh.matrixWorld.clone().invert();let changed=false;
        for(let i=0;i<vertices.count;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const v=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(mesh.matrixWorld);if(window.westernHighlands?.villages.some(t=>Math.hypot(v.x-t.center.x,v.z-t.center.z)<70))continue;let y=v.y;for(const plan of stationPlans){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(!plan.grounded)continue;const q=v.clone().sub(plan.center).applyAxisAngle(new THREE.Vector3(0,1,0),-plan.yaw),edge=Math.max(THREE.MathUtils.smoothstep(Math.abs(q.x-14),22,48),THREE.MathUtils.smoothstep(Math.abs(q.z),56,78));if(edge<1)y=THREE.MathUtils.lerp(y,plan.grade,1-edge);}if(Math.abs(y-v.y)>.00001){v.y=y;v.applyMatrix4(inverse);vertices.setXYZ(i,v.x,v.y,v.z);changed=true;}}
        if(changed){vertices.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}}
    window.gameBoot.taskProgress(46,171);
await rebuildTerrainIndex();window.gameBoot.taskProgress(47,171);
for(let i=0;i<points.length;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();groundHeights[i]=terrainHeight(points[i].x,points[i].z);}
    window.gameBoot.taskProgress(48,171);
const clearance=await resolveRailwayClearance(points,networkPaths,terrainHeight,railWaterAt,obstacleSurvey,stationPlans,junctions,services);
    window.gameBoot.taskProgress(49,171);
const outward=services[0],returnPoints=outward.points.map((p,i)=>{const direction=outward.points[(i+1)%outward.points.length].clone().sub(outward.points[(i+outward.points.length-1)%outward.points.length]);direction.y=0;direction.normalize();const q=p.clone().add(new THREE.Vector3(-direction.z*18,0,direction.x*18));q.lineId='return';return q;}).reverse();
    window.gameBoot.taskProgress(50,171);
const returnService={id:'return',name:'Chiều về',points:returnPoints};window.gameBoot.taskProgress(51,171);
returnPoints.forEach((p,i)=>p.railDirection=returnPoints[(i+1)%returnPoints.length].clone().sub(returnPoints[(i+returnPoints.length-1)%returnPoints.length]).normalize());
    window.gameBoot.taskProgress(52,171);
const returnPath={id:networkPaths.length,lineId:'return',a:returnPoints[0].clone(),b:returnPoints[0].clone(),points:[...returnPoints,returnPoints[0]]};window.gameBoot.taskProgress(53,171);
networkPaths.push(returnPath);window.gameBoot.taskProgress(54,171);
services.push(returnService);
    window.gameBoot.taskProgress(55,171);
const parallelOffsets=new Float32Array(returnPoints.length).fill(18),parallelAvoidance=[];
    window.gameBoot.taskProgress(56,171);
const resetReturnAlignment=()=>returnPoints.forEach((p,i)=>{const original=outward.points[outward.points.length-1-i],d=original.railDirection;p.x=original.x-d.z*parallelOffsets[i];p.z=original.z+d.x*parallelOffsets[i];p.railDirection=returnPoints[(i+1)%returnPoints.length].clone().sub(returnPoints[(i+returnPoints.length-1)%returnPoints.length]).normalize();});
    window.gameBoot.taskProgress(57,171);
let returnClearance;
    window.gameBoot.taskProgress(58,171);
for(let attempt=0;attempt<5;attempt++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        returnClearance=await resolveRailwayClearance(returnPoints,[returnPath],terrainHeight,railWaterAt,obstacleSurvey,[],[],[returnService]);let changed=false;
        for(let i=0;i<returnPoints.length;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const p=returnPoints[i];if(obstacleSurvey.top(p.x,p.z,4,p.y+7,p.y+.4)<=p.y+.4)continue;const original=outward.points[outward.points.length-1-i],d=original.railDirection;let choice=null;
            for(const offset of [18,22,26,30,34,38,42,46,50,16]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const x=original.x-d.z*offset,z=original.z+d.x*offset,h=terrainHeight(x,z),water=railWaterAt(x,z),y=Math.max(h+.12,water===null?-Infinity:water+6.5);if(obstacleSurvey.top(x,z,7,y+7,y+.4)>y+.4)continue;choice=offset;break;}
            if(choice===null)continue;parallelAvoidance.push({index:i,offset:choice});for(let k=-60;k<=60;k++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const j=(i+k+returnPoints.length)%returnPoints.length,weight=Math.pow(1-Math.abs(k)/61,2);parallelOffsets[j]=THREE.MathUtils.lerp(parallelOffsets[j],choice,weight);}changed=true;
        }
        if(!changed)break;resetReturnAlignment();
    }
    window.gameBoot.taskProgress(59,171);
returnClearance=await resolveRailwayClearance(returnPoints,[returnPath],terrainHeight,railWaterAt,obstacleSurvey,[],[],[returnService]);
    // A raised approach can meet the side of a ridge after grade propagation.
    // Enforce the complete vehicle envelope again, and spread each rise into a ramp.
    window.gameBoot.taskProgress(60,171);
let returnOverpasses=0;
    window.gameBoot.taskProgress(61,171);
for(let pass=0;pass<30;pass++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();let changed=false;for(const p of returnPoints){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const top=obstacleSurvey.top(p.x,p.z,4,p.y+7,p.y+.4);if(top>p.y+.4){p.y=top+1.5;p.terrainMode='obstacle-bridge';returnOverpasses++;changed=true;}}for(const sign of [1,-1]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let n=0;n<returnPoints.length;n++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const i=(n*sign+returnPoints.length)%returnPoints.length,a=returnPoints[i],b=returnPoints[(i+sign+returnPoints.length)%returnPoints.length],y=a.y-Math.hypot(a.x-b.x,a.z-b.z)*.2;if(y>b.y+1e-6){b.y=y;b.terrainMode=a.terrainMode;changed=true;}}}if(!changed)break;}
    window.gameBoot.taskProgress(62,171);
clearance.returnLane=returnClearance;window.gameBoot.taskProgress(63,171);
clearance.parallelAvoidance=parallelAvoidance;window.gameBoot.taskProgress(64,171);
clearance.returnOverpasses=returnOverpasses;
    window.gameBoot.taskProgress(65,171);
points.push(...returnPoints);window.gameBoot.taskProgress(66,171);
for(const p of returnPoints){if(window.gameBoot.shouldYield())await window.gameBoot.yield();groundHeights.push(terrainHeight(p.x,p.z));waterCrossings.push(railWaterAt(p.x,p.z)!==null);}
    window.gameBoot.taskProgress(67,171);
await levelRailwayStationApproaches(services,stationPlans,terrainHeight);
    window.gameBoot.taskProgress(68,171);
let highlandGradedVertices=0;window.gameBoot.taskProgress(69,171);
for(let pass=0;pass<2;pass++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();await classifyHighlandRails(services,terrainHeight,railWaterAt);for(const plan of stationPlans){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(plan.center.x<-2470){plan.trackY=outward.points[plan.routeIndex].y;plan.grounded=true;plan.grade=plan.trackY-.12;}}highlandGradedVertices+=await gradeHighlandRailTerrain(services,worldExpansion.terrain,terrainHeight,railWaterAt,stationPlans);await rebuildTerrainIndex();for(const service of services){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const p of service.points){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(p.x<-2470&&p.terrainMode==='ground')p.y=Math.max(p.y,terrainHeight(p.x,p.z)+.12);}}await levelRailwayStationApproaches(services,stationPlans,terrainHeight);}window.gameBoot.taskProgress(70,171);
await classifyHighlandRails(services,terrainHeight,railWaterAt);

    window.gameBoot.taskProgress(71,171);
const stationGrounding=await groundUnneededStations(services,stationPlans,nativeStationTerrain,railWaterAt,obstacleSurvey,async()=>{await rebuildTerrainIndex();return terrainHeight;});
    window.gameBoot.taskProgress(72,171);
await rebuildTerrainIndex();
await planGrandTerminal(services,stationPlans,terrainHeight,railWaterAt,obstacleSurvey);
for(let i=0;i<stationPlans.length;i++)names[i]=stationPlans[i].name;
    window.gameBoot.taskProgress(73,171);
const sampledHeights=new Map();window.gameBoot.taskProgress(74,171);
for(const p of points){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const key=p.x.toFixed(2)+','+p.z.toFixed(2);sampledHeights.set(key,Math.max(sampledHeights.get(key)??-Infinity,p.y));}window.gameBoot.taskProgress(75,171);
for(const path of networkPaths){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const p=path.points.at(-1);p.y=sampledHeights.get(p.x.toFixed(2)+','+p.z.toFixed(2))??terrainHeight(p.x,p.z)+.2;}
    window.gameBoot.taskProgress(76,171);
for(const service of services){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const ps=service.points;service.distances=[0];for(let i=1;i<=ps.length;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();service.distances.push(service.distances.at(-1)+ps[i%ps.length].distanceTo(ps[i-1]));}service.length=service.distances.at(-1);service.tangents=ps.map((p,i)=>ps[(i+1)%ps.length].clone().sub(ps[(i+ps.length-1)%ps.length]).normalize());}
    window.gameBoot.taskProgress(77,171);
for(const service of services){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const ps=service.points,n=ps.length,angle=(a,b)=>Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));service.speedLimits=ps.map((p,i)=>{const before=(i+n-1)%n,next=(i+1)%n,k=Math.max(angle(service.tangents[before],service.tangents[i])/Math.max(.01,p.distanceTo(ps[before])),angle(service.tangents[i],service.tangents[next])/Math.max(.01,p.distanceTo(ps[next])));return k<.0001?84:Math.max(2,Math.min(84,.5/k,Math.sqrt(2.4/k)));});for(let pass=0;pass<2;pass++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let i=n-1;i>=0;i--){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const next=(i+1)%n;service.speedLimits[i]=Math.min(service.speedLimits[i],Math.sqrt(service.speedLimits[next]**2+8*ps[i].distanceTo(ps[next])));}}}
    function pose(distance,service=services[0]){const {points:ps,distances,length,tangents}=service,d=(distance%length+length)%length,count=ps.length;let lo=0,hi=count;while(lo+1<hi){const m=(lo+hi)>>1;if(distances[m]<=d)lo=m;else hi=m;}
        const next=(lo+1)%count,t=(d-distances[lo])/(distances[lo+1]-distances[lo]),direction=tangents[lo].clone().lerp(tangents[next],t).normalize();const position=ps[lo].clone().lerp(ps[next],t);position.lineId=service.id;position.terrainMode=ps[lo].terrainMode;return {position,speedLimit:THREE.MathUtils.lerp(service.speedLimits[lo],service.speedLimits[next],t),yaw:Math.atan2(direction.x,direction.z),pitch:-Math.atan2(direction.y,Math.hypot(direction.x,direction.z))};}
    function vehiclePose(d,service=services[0]){const front=pose(d+4,service).position,rear=pose(d-4,service).position,direction=front.clone().sub(rear).normalize(),position=front.clone().add(rear).multiplyScalar(.5);position.y+=.16;return {position,yaw:Math.atan2(direction.x,direction.z),pitch:-Math.atan2(direction.y,Math.hypot(direction.x,direction.z))};}
    function place(object,d,service=services[0]){const p=object.userData.railVehicle?vehiclePose(d,service):pose(d,service);object.position.copy(p.position);object.rotation.set(p.pitch,p.yaw,0,'YXZ');return p;}
    function sectionPose(path,i){const p=path.points[i],a=path.points[Math.max(0,i-1)],b=path.points[Math.min(path.points.length-1,i+1)];return {pathIndex:path.id,position:p,yaw:Math.atan2(b.x-a.x,b.z-a.z),pitch:-Math.atan2(b.y-a.y,Math.hypot(b.x-a.x,b.z-a.z))};}
    window.gameBoot.taskProgress(78,171);
const renderedTrackSegments=[],renderedBridgeSections=[],bridgeWidthScale=1.8;
    window.gameBoot.taskProgress(79,171);
const noGuardAt=p=>p.y-terrainHeight(p.x,p.z)<3||(window.grandTerminalPlan&&Math.abs((p.x-grandTerminalPlan.center.x)*grandTerminalPlan.side.x+(p.z-grandTerminalPlan.center.z)*grandTerminalPlan.side.z)<28&&Math.abs((p.x-grandTerminalPlan.center.x)*grandTerminalPlan.dir.x+(p.z-grandTerminalPlan.center.z)*grandTerminalPlan.dir.z)<108)||stationPlans.some(plan=>(!p.lineId||plan.lineId===p.lineId)&&Math.hypot(p.x-plan.center.x,p.z-plan.center.z)<90);
    function batch(kind,spacing,filter=()=>true){const poses=[],seen=new Set();for(const path of networkPaths)for(let i=0;i<path.points.length-1;i+=Math.max(1,Math.round(spacing/2))){const p=sectionPose(path,i),key=p.position.toArray().map(v=>v.toFixed(2)).join(',')+','+((p.yaw%Math.PI+Math.PI)%Math.PI).toFixed(3);if(filter(p.position)&&!seen.has(key)){seen.add(key);poses.push(p);}}if(!poses.length)return;if(kind==='track')renderedTrackSegments.push(...poses);
        if(kind==='bridge')renderedBridgeSections.push(...poses.map(p=>({...p,widthScale:bridgeWidthScale,guards:!noGuardAt(p.position)})));
        const dummy=new THREE.Object3D();for(const source of templates[kind].children){const selected=kind==='bridge'&&/^Bridge(Guard|Post)/.test(source.name)?poses.filter(p=>!noGuardAt(p.position)):poses;if(!selected.length)continue;const buckets=new Map();for(const p of selected){const key=Math.floor(p.position.x/512)+','+Math.floor(p.position.z/512);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(p);}for(const bucket of buckets.values()){const mesh=new THREE.InstancedMesh(source.geometry,source.material,bucket.length);mesh.name='Railway_'+kind;for(let i=0;i<bucket.length;i++){const p=bucket[i];dummy.position.copy(p.position);dummy.rotation.set(p.pitch,p.yaw,0,'YXZ');dummy.scale.set(kind==='bridge'?bridgeWidthScale:1,1,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.computeBoundingSphere?.();group.add(mesh);}}}
    // Final clearance is authoritative; stale ground tags must not create tall walls.
    window.gameBoot.taskProgress(80,171);
const isBridge=p=>p.y-terrainHeight(p.x,p.z)>1.05;
    window.gameBoot.taskProgress(81,171);
const inJunction=p=>junctions.some(j=>(!p.lineId||j.lineId===p.lineId)&&Math.hypot(p.x-j.center.x,p.z-j.center.z)<80);
    // Sleepers sit on the continuous ground bed; omit the old protruding stone blocks.
    window.gameBoot.taskProgress(82,171);
batch('track',2);window.gameBoot.taskProgress(83,171);
batch('bridge',8,p=>isBridge(p)&&!inJunction(p));
    // A shared switch bed replaces overlapping decks and guardrails at a hub.
    window.gameBoot.taskProgress(84,171);
const junctionDeckCells=new Map(),tile=2.5;
    window.gameBoot.taskProgress(85,171);
for(const path of networkPaths){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const p of path.points){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(!inJunction(p))continue;for(let dx=-2;dx<=2;dx++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let dz=-2;dz<=2;dz++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const x=Math.round(p.x/tile)+dx,z=Math.round(p.z/tile)+dz,key=x+','+z;junctionDeckCells.set(key,new THREE.Vector3(x*tile,p.y-.7,z*tile));}}}}
    window.gameBoot.taskProgress(86,171);
const switchBed=new THREE.InstancedMesh(new THREE.BoxGeometry(tile,.8,tile),materials.stone,junctionDeckCells.size);window.gameBoot.taskProgress(87,171);
switchBed.name='RailwaySharedSwitchBed';window.gameBoot.taskProgress(88,171);
const tileMatrix=new THREE.Matrix4();window.gameBoot.taskProgress(89,171);
let tileIndex=0;window.gameBoot.taskProgress(90,171);
for(const p of junctionDeckCells.values()){if(window.gameBoot.shouldYield())await window.gameBoot.yield();tileMatrix.makeTranslation(p.x,p.y,p.z);switchBed.setMatrixAt(tileIndex++,tileMatrix);}window.gameBoot.taskProgress(91,171);
group.add(switchBed);
    window.gameBoot.taskProgress(92,171);
const pillars=[],pierKeys=new Set(),pierGeometry=new THREE.CylinderGeometry(.65,.9,1,8);
    window.gameBoot.taskProgress(93,171);
for(const path of networkPaths){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let i=0;i<path.points.length;i+=12){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const p=path.points[i];if(window.grandTerminalPlan){const t=grandTerminalPlan,v=p.clone().sub(t.center);if(Math.abs(v.dot(t.side))<84&&Math.abs(v.dot(t.dir))<98)continue;}if(!isBridge(p))continue;const bottom=terrainHeight(p.x,p.z),height=p.y-1.1-bottom,key=Math.round(p.x/4)+','+Math.round(p.z/4);if(height>.2&&!pierKeys.has(key)&&obstacleSurvey.top(p.x,p.z,p.x<-2470?4:1,p.y-1.1,bottom)<bottom+.25){const mesh=new THREE.Mesh(pierGeometry,materials.stone);mesh.name='RailwayBridgePier';mesh.position.set(p.x,bottom+height/2,p.z);const width=p.x<-2470&&height>25?Math.min(4,1+height/40):1;mesh.scale.set(width,height,width);mesh.userData.width=width;mesh.userData.height=height;mesh.updateMatrix();pillars.push(mesh);pierKeys.add(key);}}}
    window.gameBoot.taskProgress(94,171);
const pierDisplay=new THREE.InstancedMesh(pierGeometry,materials.stone,pillars.length);window.gameBoot.taskProgress(95,171);
pierDisplay.name='RailwayBridgePiers';window.gameBoot.taskProgress(96,171);
pillars.forEach((p,i)=>pierDisplay.setMatrixAt(i,p.matrix));window.gameBoot.taskProgress(97,171);
group.add(pierDisplay);
    // One continuous earth mesh fills ground approaches and provides the
    // matching walkable surface, without thousands of separate stone boxes.
    window.gameBoot.taskProgress(98,171);
const segments=networkPaths.flatMap(path=>path.points.slice(0,-1).map((a,i)=>({a,b:path.points[i+1]}))),trackGrid=new Map(),cellKey=(x,z)=>Math.floor(x/16)+','+Math.floor(z/16);
    window.gameBoot.taskProgress(99,171);
segments.forEach((segment,i)=>{const key=cellKey(segment.a.x,segment.a.z);if(!trackGrid.has(key))trackGrid.set(key,[]);trackGrid.get(key).push(i);});
    window.gameBoot.taskProgress(100,171);
const roadGrid=new Map(),roadVertices=[],roadIndices=[];
    function roadTriangle(a,b,c){const den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-9)return;const triangle={a,b,c,den};for(let x=Math.floor(Math.min(a.x,b.x,c.x)/16);x<=Math.floor(Math.max(a.x,b.x,c.x)/16);x++)for(let z=Math.floor(Math.min(a.z,b.z,c.z)/16);z<=Math.floor(Math.max(a.z,b.z,c.z)/16);z++){const key=x+','+z;if(!roadGrid.has(key))roadGrid.set(key,[]);roadGrid.get(key).push(triangle);}}
    window.gameBoot.taskProgress(101,171);
for(const {a,b} of segments){if(window.gameBoot.shouldYield())await window.gameBoot.yield();if(isBridge(a)||isBridge(b))continue;const direction=b.clone().sub(a).normalize(),rows=[];for(const p of [a,b]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const row=[];for(const side of [-12,-6,-3.3,0,3.3,6,12]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const x=p.x+direction.z*side,z=p.z-direction.x*side,floor=terrainHeight(x,z),weight=1-THREE.MathUtils.smoothstep(Math.abs(side),3.3,12),y=THREE.MathUtils.lerp(floor,Math.max(floor,Math.min(p.y-.12,floor+1)),weight)+.015;row.push(new THREE.Vector3(x,y,z));}rows.push(row);}for(let j=0;j<6;j++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const [a,b,c,d]=[rows[0][j],rows[1][j],rows[1][j+1],rows[0][j+1]],offset=roadVertices.length/3;for(const v of [a,b,c,d]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();roadVertices.push(v.x,v.y,v.z);}roadIndices.push(offset,offset+2,offset+1,offset,offset+3,offset+2);roadTriangle(a,c,b);roadTriangle(a,d,c);}}
    window.gameBoot.taskProgress(102,171);
const earthGeometry=new THREE.BufferGeometry();window.gameBoot.taskProgress(103,171);
earthGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roadVertices,3));window.gameBoot.taskProgress(104,171);
earthGeometry.setIndex(roadIndices);window.gameBoot.taskProgress(105,171);
earthGeometry.computeVertexNormals();window.gameBoot.taskProgress(106,171);
const earthBed=new THREE.Mesh(earthGeometry,new THREE.MeshBasicMaterial({color:0x81949c,toneMapped:false,side:THREE.DoubleSide}));window.gameBoot.taskProgress(107,171);
earthBed.name='RailwayGroundEmbankment';window.gameBoot.taskProgress(108,171);
group.add(earthBed);
    function roadHeight(x,z,y=Infinity){let top=-Infinity;for(const {a,b,c,den} of roadGrid.get(cellKey(x,z))||[]){const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;if(u>=-1e-6&&v>=-1e-6&&w>=-1e-6){const height=u*a.y+v*b.y+w*c.y;if(y>=height-MAX_STEP_HEIGHT-.001)top=Math.max(top,height);}}return top;}
    function trackSupport(x,z,y){let top=-Infinity;for(const s of stations){if(!s.returnPlatform)continue;const q=new THREE.Vector3(x-s.returnPlatform.x,0,z-s.returnPlatform.z).applyAxisAngle(new THREE.Vector3(0,1,0),-pose(s.returnDistance,returnService).yaw);if(Math.abs(q.x)<=1.75&&Math.abs(q.z)<=31&&y>=s.returnPlatform.y-MAX_STEP_HEIGHT)top=Math.max(top,s.returnPlatform.y);}const cell=junctionDeckCells.get(Math.round(x/tile)+','+Math.round(z/tile));if(cell&&y>=cell.y+.1)top=cell.y+.42;const gx=Math.floor(x/16),gz=Math.floor(z/16);
        for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const i of trackGrid.get((gx+dx)+','+(gz+dz))||[]){const {a,b}=segments[i],vx=b.x-a.x,vz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*vx+(z-a.z)*vz)/(vx*vx+vz*vz),0,1),height=a.y+(b.y-a.y)*t-.2,width=isBridge(a)&&!inJunction(a)?6.1:3.2;if(Math.hypot(x-a.x-vx*t,z-a.z-vz*t)<width&&y>=height-.65){top=Math.max(top,height);const side=((x-a.x)*vz-(z-a.z)*vx)/Math.hypot(vx,vz),railTop=height+.36;if(!isBridge(a)&&Math.abs(Math.abs(side)-2.15)<.16&&y>=railTop-MAX_STEP_HEIGHT-.001)top=Math.max(top,railTop);}}return top;
    }
    function bridgeGuardBlocked(x,z,y){const gx=Math.floor(x/16),gz=Math.floor(z/16);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const i of trackGrid.get((gx+dx)+','+(gz+dz))||[]){const {a,b}=segments[i];if(!isBridge(a)||inJunction(a)||noGuardAt(a))continue;const vx=b.x-a.x,vz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*vx+(z-a.z)*vz)/(vx*vx+vz*vz),0,1),height=a.y+(b.y-a.y)*t,side=Math.hypot(x-a.x-vx*t,z-a.z-vz*t);if(t>0&&t<1&&side>5.5&&side<6.5&&y>=height-.45&&y<height+1.4)return true;}return false;}
    window.gameBoot.taskProgress(109,171);
const stations=[];window.gameBoot.taskProgress(110,171);
for(const [i,plan] of stationPlans.entries()){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        const index=plan.index,service=services.find(t=>t.id===plan.lineId),distance=service.distances[plan.routeIndex],model=stationDisplay.clone(true),p=place(model,distance,service);p.yaw=plan.yaw;model.rotation.set(0,p.yaw,0,'YXZ');model.position.y=p.position.y-.9;p.position.y=model.position.y;group.add(model);
        const platform=new THREE.Vector3(7,.82,-15).applyAxisAngle(new THREE.Vector3(0,1,0),p.yaw).add(p.position);
        const slabTop=model.position.y+.72,foundation=new THREE.Mesh(new THREE.BoxGeometry(40,.14,96),materials.stone);
        foundation.position.copy(new THREE.Vector3(14,slabTop-.07-p.position.y,0).applyAxisAngle(new THREE.Vector3(0,1,0),p.yaw).add(p.position));foundation.rotation.y=p.yaw;foundation.receiveShadow=true;group.add(foundation);
        const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#0c3038';c.fillRect(0,0,1024,128);c.strokeStyle='#d6b66a';c.lineWidth=5;c.strokeRect(5,5,1014,118);c.fillStyle='#ffe8b0';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText(names[i],512,62);c.font='19px sans-serif';c.fillText('NGUYỆT HÀNH  •  MOON RAILWAY',512,102);
        const sign=new THREE.Mesh(new THREE.PlaneGeometry(14,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));sign.position.set(3.17,4.55,0);sign.rotation.y=-Math.PI/2;model.add(sign);
        const lamps=new THREE.PointLight(0xffdfac,2,26,1.5);lamps.position.set(8,5,0);model.add(lamps);
        const lm={id:'railway_'+i,name:names[i],icon:'🚂',x:platform.x,z:platform.z,color:'#edc56c'};landmarksData.push(lm);
        const button=document.createElement('button');button.className='tour-btn';button.textContent='🚂 '+names[i];button.onclick=()=>{gameHUD.closePanels();travel(i);};document.querySelector('#hud-travel .hud-destinations').append(button);
        const stopDistances=[];service.points.forEach((point,j)=>{if(Math.hypot(point.x-p.position.x,point.z-p.position.z)<.05)stopDistances.push(service.distances[j]);});stations.push({grandTerminal:Boolean(plan.grandTerminal),villageIds:plan.villageIds||[],lineId:plan.lineId,grounded:plan.grounded&&slabTop-terrainHeight(platform.x,platform.z)<1.2,name:names[i],distance,stopDistances,model,platform,yaw:p.yaw,foundation,slabTop,sign});}
    window.gameBoot.taskProgress(111,171);
for(const station of stations){if(window.gameBoot.shouldYield())await window.gameBoot.yield();station.access=station.grandTerminal?{root:new THREE.Group(),kind:"terminal",surfaces:[],solids:[],rise:18}:buildRailwayAccess(station,terrainHeight,obstacleSurvey,materials,group);}
    window.gameBoot.taskProgress(112,171);
const reversePlatforms=[];window.gameBoot.taskProgress(113,171);
for(const s of stations){if(window.gameBoot.shouldYield())await window.gameBoot.yield();let best=Infinity,index=0;returnPoints.forEach((p,i)=>{const d=Math.hypot(p.x-s.model.position.x,p.z-s.model.position.z);if(d<best){best=d;index=i;}});s.returnDistance=returnService.distances[index];const p=pose(s.returnDistance,returnService),forward=new THREE.Vector3(Math.sin(p.yaw),0,Math.cos(p.yaw)),side=new THREE.Vector3(forward.z,0,-forward.x),root=new THREE.Group();root.name='ReturnPlatform';root.position.copy(p.position);root.rotation.y=p.yaw;group.add(root);const deck=new THREE.Mesh(new THREE.BoxGeometry(3.5,.25,62),materials.stone);deck.position.set(6,-.2,0);root.add(deck);s.returnPlatform=p.position.clone().addScaledVector(side,6);s.returnPlatform.y-=.075;const platform={root,position:s.returnPlatform,yaw:p.yaw};reversePlatforms.push(platform);}
    // Platforms over a nearby river approach need open supports too, rather
    // than extending the whole station slab down to the ground as a wall.
    window.gameBoot.taskProgress(114,171);
const stationPillars=[];
    function platformPiers(root,top,xs,zs,station){for(const x of xs)for(const z of zs){const p=new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),root.rotation.y).add(root.position),bottom=terrainHeight(p.x,p.z),height=top-bottom;if(height<=.8||obstacleSurvey.top(p.x,p.z,.65,top-.2,bottom+.2)>bottom+.25)continue;const mesh=new THREE.Mesh(pierGeometry,materials.stone);mesh.position.set(p.x,bottom+height/2,p.z);mesh.scale.set(.8,height,.8);mesh.userData={height,width:.8,station};mesh.updateMatrix();stationPillars.push(mesh);pillars.push(mesh);}}
    window.gameBoot.taskProgress(115,171);
stations.forEach((s,i)=>{if(s.grandTerminal)return;platformPiers(s.model,s.slabTop-.14,[4,24],[-34,0,34],i);const p=reversePlatforms[i];platformPiers(p.root,p.position.y-.2,[4.5,12],[-26,0,26],i);});
    window.gameBoot.taskProgress(116,171);
const stationPierDisplay=new THREE.InstancedMesh(pierGeometry,materials.stone,stationPillars.length);window.gameBoot.taskProgress(117,171);
stationPierDisplay.name='RailwayBridgePiers';window.gameBoot.taskProgress(118,171);
stationPillars.forEach((p,i)=>stationPierDisplay.setMatrixAt(i,p.matrix));window.gameBoot.taskProgress(119,171);
group.add(stationPierDisplay);
    window.gameBoot.taskProgress(120,171);
for(const village of window.westernHighlands?.villages||[]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const index=stations.findIndex(s=>s.villageIds.includes(village.plan.id));if(index<0)throw Error('Village has no station '+village.plan.name);village.stationIndex=index;village.station=stations[index];}
    window.gameBoot.taskProgress(121,171);
const fleet=[...network.fleet.map(t=>({...t,trackId:'red'})),{id:'purple',name:'Tuyến Tím · chiều về',color:'#9957db',trackId:'return'},{id:'green',name:'Tuyến Xanh Lá · chiều về',color:'#42b86c',trackId:'return'},{id:'black',name:'Tuyến Đen · chiều về',color:'#232b38',trackId:'return'}];
    window.gameBoot.taskProgress(122,171);
network.fleet=fleet;
    window.gameBoot.taskProgress(123,171);
const trains=fleet.map(config=>({...services.find(s=>s.id===config.trackId),...config})),stationCalls=new Map(),minimumHeadway=100;window.gameBoot.taskProgress(124,171);
let selectedLineId=trains[0].id,ridingTrain=null,aboard=false,rideYaw=0;
    window.gameBoot.taskProgress(125,171);
const passenger={coach:1,x:0,z:0,seat:null},seats=[];window.gameBoot.taskProgress(126,171);
for(const z of [-4,-1,2,4.5]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const x of [-1.25,1.25]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();seats.push({x,z});}}
    window.gameBoot.taskProgress(127,171);
let exitStation=null,viewMode=0,viewFov=72,worldFov=null;
    function restoreView(){if(worldFov!==null){camera.fov=worldFov;camera.updateProjectionMatrix();worldFov=null;}viewMode=0;}
    function zoomBy(amount){if(!aboard)return false;viewFov=THREE.MathUtils.clamp(viewFov+amount,30,95);render();return true;}
    function cycleView(){if(!aboard)return false;viewMode=(viewMode+1)%3;if(viewMode){camYaw=rideYaw+(viewMode===1?Math.PI/2:-Math.PI/2);camPitch=0;}render();return true;}
    window.gameBoot.taskProgress(128,171);
for(const train of trains){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        train.vehicles=[];train.gangways=[];train.requests=new Set();train.stops=stations.flatMap((s,i)=>(train.trackId==='return'?[s.returnDistance]:s.stopDistances).map(distance=>({distance,station:i}))).sort((a,b)=>a.distance-b.distance);
        if(!train.stops.length)throw Error('No stations on '+train.id);
        train.distance=(train.stops[0].distance-220+(trains.indexOf(train)%3)*train.length/3+train.length)%train.length;train.stationIndex=train.stops[0].station;train.nextStop=train.stops.reduce((best,stop,i)=>(stop.distance-train.distance+train.length)%train.length<(train.stops[best].distance-train.distance+train.length)%train.length?i:best,0);train.remaining=0;train.state='moving';train.speed=0;
        const paint=materials.red.clone();paint.color.set(train.color);const accent=materials.gold.clone();accent.color.set(train.id==='yellow'?'#287bc2':'#edc65c');const roof=materials.roof.clone();roof.color.set(train.id==='blue'?'#103e67':train.id==='yellow'?'#8b641a':'#283944');
        for(let i=0;i<4;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const model=vehicleTemplates[i?'coach':'engine'].clone(true);model.userData.railVehicle=true;model.name=train.id+(i?'_Coach_'+i:'_Locomotive');model.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.material===materials.red)mesh.material=paint;else if(mesh.material===materials.gold)mesh.material=accent;else if(mesh.material===materials.roof)mesh.material=roof;});group.add(model);train.vehicles.push(model);}
        train.driver=templates.driver.clone(true);train.driver.name='RoyalTinSoldierDriver_'+train.id;train.driver.position.set(0,1.9,-4);train.vehicles[0].add(train.driver);
        const logo=new THREE.TextureLoader().load('features/lobby/assets/tsuventure-logo.png'),badge=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),new THREE.MeshBasicMaterial({map:logo,side:THREE.DoubleSide}));badge.position.set(0,3.2,5.94);train.vehicles[0].add(badge);
        for(let i=1;i<3;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const boot=new THREE.Group(),deck=new THREE.Mesh(new THREE.BoxGeometry(1.5,.14,1),materials.steel);deck.position.y=-.07;boot.add(deck);for(const side of [-1,1]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const rail=new THREE.Mesh(new THREE.BoxGeometry(.08,1.15,1),accent);rail.position.set(side*.72,.55,0);boot.add(rail);}group.add(boot);train.gangways.push(boot);}
        const lamp=new THREE.PointLight(0xffdfac,1.6,14,1.5);lamp.position.set(0,4.9,0);train.vehicles[1].add(lamp);
    }
    function trainForStation(i){
        const called=trains.find(t=>t.id===stationCalls.get(i));if(called)return called;
        const selected=trains.find(t=>t.id===lineChoice.value&&!t.returnToDepot);if(selected)return selected;
        const station=stations[i],returnSide=playerGroup.position.distanceTo(station.returnPlatform)<playerGroup.position.distanceTo(station.platform),available=trains.filter(t=>(t.trackId==='return')===returnSide&&!t.returnToDepot);
        const stopped=available.find(t=>t.state==='stopped'&&t.stationIndex===i);if(stopped)return stopped;
        return available.reduce((best,t)=>{const ahead=train=>Math.min(...train.stops.filter(s=>s.station===i).map(s=>(s.distance-train.distance+train.length)%train.length));return ahead(t)<ahead(best)?t:best;},available[0]);
    }
    function focusTrain(){if(ridingTrain)return ridingTrain;const nearby=nearestStation();return nearby>=0?trainForStation(nearby):trains.find(t=>t.id===selectedLineId)||trains[0];}
    function trafficGap(train){
        const dispatchGap = window.grandTerminal?.dispatch?.signalGap(train) ?? Infinity;
        return Math.min(dispatchGap,...trains.filter(t=>t!==train&&t.trackId===train.trackId).map(t=>(t.distance-train.distance+train.length)%train.length));
    }
    function movementClear(train,distance){
        const head=vehiclePose(distance,train).position;
        for(const other of trains){if(other===train)continue;const otherHead=vehiclePose(other.distance,other).position;if(head.distanceToSquared(otherHead)>160*160)continue;
            const occupied=Array.from({length:4},(_,i)=>vehiclePose(other.distance-i*15,other).position);
            for(let i=0;i<4;i++){const p=vehiclePose(distance-i*15,train).position;if(occupied.some(q=>p.distanceToSquared(q)<(train.trackId===other.trackId?22*22:9*9)))return false;}
        }
        return true;
    }
    window.gameBoot.taskProgress(129,171);
const panel=document.createElement('div');window.gameBoot.taskProgress(130,171);
panel.id='railway-panel';window.gameBoot.taskProgress(131,171);
panel.className='railway-panel';
    window.gameBoot.taskProgress(132,171);
const label=document.createElement('div'),detail=document.createElement('small'),actions=document.createElement('div'),wait=document.createElement('button'),ride=document.createElement('button'),nextLabel=document.createElement('output'),requestExit=document.createElement('button');
    window.gameBoot.taskProgress(133,171);
label.className='railway-title';window.gameBoot.taskProgress(134,171);
detail.className='railway-detail';window.gameBoot.taskProgress(135,171);
actions.className='railway-actions';window.gameBoot.taskProgress(136,171);
wait.id='railway-wait';window.gameBoot.taskProgress(137,171);
ride.id='railway-board';window.gameBoot.taskProgress(138,171);
nextLabel.id='railway-next-stop';window.gameBoot.taskProgress(139,171);
requestExit.id='railway-request-exit';window.gameBoot.taskProgress(140,171);
requestExit.textContent='Xuống ở ga kế tiếp (E)';
    window.gameBoot.taskProgress(141,171);
const lineChoice=document.createElement('select');window.gameBoot.taskProgress(142,171);
lineChoice.id='railway-line';window.gameBoot.taskProgress(143,171);
lineChoice.setAttribute('aria-label','Chọn tuyến tàu');window.gameBoot.taskProgress(144,171);
for(const [value,text] of [['next','Chuyến gần nhất'],...trains.map(t=>[t.id,t.name])]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const option=document.createElement('option');option.value=value;option.textContent=text;lineChoice.append(option);}window.gameBoot.taskProgress(145,171);
lineChoice.value='next';window.gameBoot.taskProgress(146,171);
lineChoice.onchange=()=>{render();focusGameplay();};
    window.gameBoot.taskProgress(147,171);
const seatChoice=document.createElement('select'),seatButton=document.createElement('button'),passengerHint=document.createElement('small');window.gameBoot.taskProgress(148,171);
seatChoice.id='railway-seat-choice';window.gameBoot.taskProgress(149,171);
seatChoice.setAttribute('aria-label','Chọn ghế trong toa');window.gameBoot.taskProgress(150,171);
seatButton.id='railway-seat';
    window.gameBoot.taskProgress(151,171);
seats.forEach((s,i)=>{const option=document.createElement('option');option.value=i;option.textContent='Ghế '+(Math.floor(i/2)+1)+(s.x<0?'A · cửa sổ trái':'B · cửa sổ phải');seatChoice.append(option);});window.gameBoot.taskProgress(152,171);
seatChoice.value='2';window.gameBoot.taskProgress(153,171);
passengerHint.className='railway-detail';
    window.gameBoot.taskProgress(154,171);
seatButton.onclick=()=>passenger.seat===null?chooseSeat(Number(seatChoice.value)):standPassenger();
    window.gameBoot.taskProgress(155,171);
const viewButton=document.createElement('button');window.gameBoot.taskProgress(156,171);
viewButton.id='railway-view';window.gameBoot.taskProgress(157,171);
viewButton.onclick=cycleView;
    window.gameBoot.taskProgress(158,171);
actions.append(lineChoice,wait,ride,nextLabel,requestExit,seatChoice,seatButton,viewButton);window.gameBoot.taskProgress(159,171);
panel.append(passengerHint);
window.gameBoot.taskProgress(160,171);
panel.append(label,detail,actions);window.gameBoot.taskProgress(161,171);
document.body.append(panel);
    function focusGameplay(){if(gameState.isPlaying)renderer.domElement.focus({preventScroll:true});}
    function nearestStation(){let found=-1,best=Infinity;stations.forEach((s,i)=>{const d=Math.min(playerGroup.position.distanceTo(s.platform),playerGroup.position.distanceTo(s.returnPlatform));if(d<best&&d<48&&Math.abs(playerGroup.position.y-s.platform.y)<5){best=d;found=i;}});return found;}
    function requestStop(i=nearestStation()){
        if(!Number.isInteger(i)||i<0||i>=stations.length||(!aboard&&nearestStation()!==i))return false;
        const train=aboard?ridingTrain:trainForStation(i);if(train.state==='stopped'&&train.stationIndex===i)return false;
        selectedLineId=train.id;train.requests.add(i);if(!aboard)stationCalls.set(i,train.id);render();focusGameplay();return true;
    }
    function nextStop(){if(!aboard)return null;const train=ridingTrain;for(let j=0;j<train.stops.length;j++){const stop=train.stops[(train.nextStop+j)%train.stops.length];if((stop.distance-train.distance+train.length)%train.length>.2)return stop;}return train.stops[train.nextStop];}
    function requestNextStop(){if(!aboard)return false;if(exitStation!==null)return true;const stop=nextStop();if(!stop||!requestStop(stop.station))return false;exitStation=stop.station;render();return true;}
    function cycleLine(){if(aboard||nearestStation()<0||lineChoice.disabled)return false;lineChoice.selectedIndex=(lineChoice.selectedIndex+1)%lineChoice.options.length;render();return true;}
    function cycleSeat(){if(!aboard)return false;const index=(Number(seatChoice.value)+1)%seats.length;seatChoice.value=String(index);return chooseSeat(index);}
    function travel(i=0,returnLane=false,keepPointerLock=false){restoreView();exitStation=null;lineChoice.value='next';window.worldSurface?.resetCamera();aboard=false;ridingTrain=null;selectedLineId=stations[i].lineId;passenger.seat=null;isSitting=false;playerGroup.visible=true;const s=stations[i];const landing=returnLane?s.returnPlatform:s.platform;playerGroup.position.copy(landing);currentGroundY=landing.y;isGrounded=true;jumpVelocityY=0;resetGameplayInput({keepPointerLock});heroMotion.reset();playerSurvival.refresh();camYaw=s.yaw+Math.PI/2;camPitch=.05;window.playerLife?.resetFall();render();focusGameplay();}
    function toggleRide(){const train=focusTrain();if(train.state!=='stopped')return aboard?requestNextStop():false;if(aboard){travel(train.stationIndex,train.trackId==='return',Boolean(window.gameMouse?.captured));}else if(nearestStation()===train.stationIndex){if(train.returnToDepot){showNotification('Đoàn này đang về bến nghỉ. Hãy chọn đoàn khác.');return false;}if(gameState.health<=0)return false;if(!window.monsterCamps?.spendCoin()){showNotification('Cần 1 xu vàng để lên tàu. Dọn sạch bãi quái để nhận xu.');return false;}worldFov=camera.fov;viewFov=72;viewMode=0;exitStation=null;aboard=true;ridingTrain=train;window.playerLife?.protectTrain();Object.assign(passenger,{coach:1,x:0,z:0,seat:null});isSitting=false;rideYaw=train.vehicles[1].rotation.y;camYaw=rideYaw+Math.PI;camPitch=0;resetGameplayInput({keepPointerLock:true});heroMotion.reset();positionPassenger();window.fieldGuide?.record('royal_train_driver');}else return false;render();focusGameplay();return true;}
    window.gameBoot.taskProgress(162,171);
wait.onclick=()=>requestStop();window.gameBoot.taskProgress(163,171);
ride.onclick=toggleRide;window.gameBoot.taskProgress(164,171);
requestExit.onclick=requestNextStop;
    function render(){document.body.classList.toggle('aboard-sightseeing',aboard&&gameState.isPlaying);const nearby=aboard?-1:nearestStation(),s=stations[nearby];panel.hidden=aboard||!gameState.isPlaying||nearby<0;if(panel.hidden&&!aboard)return;const train=focusTrain(),{state,stationIndex,remaining,requests}=train;const here=state==='stopped'&&(aboard||nearby===stationIndex);
        label.style.color=train.id==='black'?'#b7c6d5':train.color;label.textContent=train.name+' | '+(here?'🚂 '+stations[stationIndex].name+' · Còn '+Math.ceil(remaining)+' giây':aboard?'🚂 Nguyệt Hành · Đang chạy':s?'🚉 '+s.name:'');
        detail.textContent=aboard?(here?'Đang ở ga · E để xuống tàu.':'Được bảo vệ trên tàu · E để xuống ở ga kế tiếp.'):here?'Tàu đã đến · 1 xu vàng / lượt lên tàu.':nearby>=0&&requests.has(nearby)?'Đã gọi tàu · Tàu sẽ dừng ở lượt tới.':'R · Chờ tàu / T · Đổi tuyến. Không có yêu cầu, tàu chạy qua.';
        if(train.waitingForSignal)detail.textContent='🚦 Chờ tín hiệu · Tàu phía trước đang chiếm đoạn ray.';
        lineChoice.hidden=aboard||here;lineChoice.disabled=nearby>=0&&stationCalls.has(nearby);
        wait.hidden=aboard||here;wait.disabled=nearby>=0&&requests.has(nearby);wait.textContent=wait.disabled?'✓ Đã yêu cầu dừng':'Chờ tàu';
        seatChoice.hidden=seatButton.hidden=passengerHint.hidden=viewButton.hidden=!aboard;seatButton.textContent=passenger.seat===null?'Ngồi ghế (C / 1–8)':'Đứng dậy (C)';passengerHint.textContent=aboard?'Toa '+passenger.coach+' / 3 · WASD đi lại · 1–8 chọn ghế · N đổi ghế · V cửa sổ · Z/X hoặc lăn chuột thu/phóng':'';
        viewButton.textContent=['V · Trong toa','V · Cửa sổ trái','V · Cửa sổ phải'][viewMode]+' · '+Math.round(72/viewFov*100)+'%';
        ride.hidden=aboard||!here;ride.textContent=aboard?'Xuống tàu (E)':'Lên tàu (E)';nextLabel.hidden=!aboard;const next=aboard?nextStop():null;nextLabel.textContent=next?'Ga kế tiếp: '+stations[exitStation??next.station].name:'';requestExit.hidden=!aboard;requestExit.disabled=exitStation!==null;requestExit.textContent=exitStation!==null?'✓ Sẽ tự xuống tại '+stations[exitStation].name:'Xuống ở ga kế tiếp (E)';
    }
    window.gameBoot.taskProgress(165,171);
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='e'||e.repeat||e.target?.closest?.('input,textarea,select')||document.querySelector('.modal-overlay.active'))return;if(!aboard&&window.stationMobility?.nearest())return;if(gameState.isPlaying&&(aboard||focusTrain().state==='stopped'&&nearestStation()===focusTrain().stationIndex)){e.preventDefault();e.stopImmediatePropagation();aboard?requestNextStop():toggleRide();}},true);
    window.gameBoot.taskProgress(166,171);
const solidNames=/^(HallBack|HallEnd|HallFrontPillar|ClockTower|CanopyColumn|TicketCounter|Bench|Planter)/;
    window.gameBoot.taskProgress(167,171);
const stationSolids=templates.station.children.filter(m=>solidNames.test(m.name)).map(m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.clone();});
    function blocked(x,z,y,radius=.35){if(bridgeGuardBlocked(x,z,y))return true;for(const p of reversePlatforms){if(!p.access)continue;const q=new THREE.Vector3(x,y,z).sub(p.root.position).applyAxisAngle(new THREE.Vector3(0,1,0),-p.yaw);for(const b of p.access.solids)if(q.y+PLAYER_HEIGHT>b.minY&&q.y<b.maxY&&q.x+radius>b.minX&&q.x-radius<b.maxX&&q.z+radius>b.minZ&&q.z-radius<b.maxZ)return true;}for(const s of stations){if(s.grandTerminal||Math.hypot(x-s.model.position.x,z-s.model.position.z)>110)continue;const p=new THREE.Vector3(x-s.model.position.x,y-s.model.position.y,z-s.model.position.z).applyAxisAngle(new THREE.Vector3(0,1,0),-s.yaw);for(const b of stationSolids)if(p.y+PLAYER_HEIGHT>b.min.y+.1&&p.y<b.max.y-.1&&p.x+radius>b.min.x&&p.x-radius<b.max.x&&p.z+radius>b.min.z&&p.z-radius<b.max.z)return true;for(const b of s.access.solids)if(p.y+PLAYER_HEIGHT>b.minY&&p.y<b.maxY&&p.x+radius>b.minX&&p.x-radius<b.maxX&&p.z+radius>b.minZ&&p.z-radius<b.maxZ)return true;}return false;}
    function infrastructureAt(x,z){if(window.grandTerminal?.inside(x,z,10))return true;for(const s of stations){const p=new THREE.Vector3(x-s.model.position.x,0,z-s.model.position.z).applyAxisAngle(new THREE.Vector3(0,1,0),-s.yaw);if(p.x>=-6&&p.x<=34&&Math.abs(p.z)<=48||p.x>=4&&p.x<=12&&Math.abs(p.z)<=120||s.access.surfaces.some(b=>p.x>b.minX-1&&p.x<b.maxX+1&&p.z>b.minZ-1&&p.z<b.maxZ+1))return true;}const gx=Math.floor(x/16),gz=Math.floor(z/16);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const i of trackGrid.get((gx+dx)+','+(gz+dz))||[]){const {a,b}=segments[i],vx=b.x-a.x,vz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*vx+(z-a.z)*vz)/(vx*vx+vz*vz),0,1);if(Math.hypot(x-a.x-vx*t,z-a.z-vz*t)<16)return true;}return false;}
    function onGradedGround(x,z,y){return Number.isFinite(roadHeight(x,z,y))||Number.isFinite(trackSupport(x,z,y))||stations.some(s=>{const p=new THREE.Vector3(x,y,z).sub(s.model.position).applyAxisAngle(new THREE.Vector3(0,1,0),-s.yaw);return Number.isFinite(s.access.height?.(x,z,y))||s.access.surfaces.some(b=>p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ&&Math.abs(p.y-b.maxY)<.4)||p.x>=-6&&p.x<=34&&Math.abs(p.z)<=48&&Math.abs(y-s.slabTop)<1;});}
    function support(x,z,y){
        if(aboard)return passengerPoint(passenger.seat===null?1.92:2.55).y;
        let accessTop=-Infinity;for(const p of reversePlatforms){const a=p.access;if(!a||(x-p.root.position.x)**2+(z-p.root.position.z)**2>32400)continue;const q=new THREE.Vector3(x,y,z).sub(p.root.position).applyAxisAngle(new THREE.Vector3(0,1,0),-p.yaw);for(const b of a.surfaces)if(q.x>=b.minX&&q.x<=b.maxX&&q.z>=b.minZ&&q.z<=b.maxZ&&q.y>=b.maxY-MAX_STEP_HEIGHT-.001)accessTop=Math.max(accessTop,b.maxY+p.root.position.y);}for(const s of stations)if((x-s.model.position.x)**2+(z-s.model.position.z)**2<=32400)accessTop=Math.max(accessTop,s.access.height?.(x,z,y)??-Infinity);
        for(const s of stations){const p=new THREE.Vector3(x,y,z).sub(s.model.position).applyAxisAngle(new THREE.Vector3(0,1,0),-s.yaw);if(Math.abs(p.x)>80||Math.abs(p.z)>85)continue;for(const b of s.access.surfaces)if(p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ&&p.y>=b.maxY-MAX_STEP_HEIGHT-.001)accessTop=Math.max(accessTop,b.maxY+s.model.position.y);}
        if(Number.isFinite(accessTop))return accessTop;
        for(const s of stations){if(s.grandTerminal||(x-s.model.position.x)**2+(z-s.model.position.z)**2>32400)continue;const d=new THREE.Vector3(x-s.model.position.x,0,z-s.model.position.z).applyAxisAngle(new THREE.Vector3(0,1,0),-s.yaw);
            if(d.x>=3&&d.x<=15&&Math.abs(d.z)<40&&y>=s.platform.y-MAX_STEP_HEIGHT-.001)return s.platform.y;
            if(d.x>=16&&d.x<=28&&d.z>=-17&&d.z<=5&&y>=s.model.position.y-.1)return s.model.position.y+.8;
            if(d.x>=-6&&d.x<=34&&Math.abs(d.z)<=48&&y>=s.slabTop-MAX_STEP_HEIGHT-.001)return s.slabTop;
        }const track=trackSupport(x,z,y),floor=onGradedGround(x,z,y)?terrainHeight(x,z):-Infinity;return Math.max(track,floor,roadHeight(x,z,y));
    }
    function update(dt){const overlay=document.querySelector('.modal-overlay.active');if(!gameState.isPlaying||gameState.inDialogue||overlay&&overlay.id!=='modal-terminal-fleet'){render();return;}
        const dispatch=window.grandTerminal?.dispatch;
        for(const train of [...trains]){let left=Math.max(0,dt),events=0;while(left>1e-8&&events++<10000){if(train.state==='stopped'){const step=Math.min(left,train.remaining);train.remaining-=step;left-=step;if(train.remaining<=1e-8){train.state='moving';train.remaining=0;}}else{
            if(dispatch?.tryReturn(train))break;
            const returnGap=dispatch?.returnGap(train)??Infinity;
            const stop=train.stops[train.nextStop],gap=(stop.distance-train.distance+train.length)%train.length,requested=train.requests.has(stop.station),available=Math.max(0,trafficGap(train)-minimumHeadway),limit=Math.min(pose(train.distance,train).speedLimit,Math.sqrt(8*available),Math.sqrt(8*Math.max(.01,returnGap))),target=requested?Math.min(limit,Math.sqrt(12*Math.max(gap,.01))):limit,slice=Math.min(left,.1);if(available<.0001){train.speed=0;train.waitingForSignal=true;left=0;break;}train.waitingForSignal=false;const acceleration=window.grandTerminal?.dispatch?.accelerate(train)?9:5;train.speed=Math.min(target,train.speed+acceleration*slice);const speed=Math.max(.02,train.speed),step=Math.min(slice,gap/speed,available/speed,returnGap/speed);
            const nextDistance=(train.distance+speed*step)%train.length;if(!movementClear(train,nextDistance)){train.speed=0;train.waitingForSignal=true;left=0;break;}train.distance=nextDistance;left-=step;if(gap-speed*step<.0001){train.distance=stop.distance;train.stationIndex=stop.station;train.nextStop=(train.nextStop+1)%train.stops.length;if(requested){train.requests.delete(stop.station);if(stationCalls.get(stop.station)===train.id)stationCalls.delete(stop.station);train.state='stopped';train.remaining=60;train.speed=0;}}
        }}if(!trains.includes(train)||dispatch?.tryReturn(train))continue;train.vehicles.forEach((model,i)=>place(model,train.distance-i*15,train));updateGangways(train);if(playerGroup.position.distanceTo(train.vehicles[0].position)<18)window.fieldGuide?.record('royal_train_driver');}
        if(aboard&&exitStation!==null&&ridingTrain.state==='stopped'&&ridingTrain.stationIndex===exitStation){const name=stations[exitStation].name;toggleRide();showNotification('Đã xuống tàu tại '+name);}else if(aboard){const yaw=ridingTrain.vehicles[passenger.coach].rotation.y;camYaw+=Math.atan2(Math.sin(yaw-rideYaw),Math.cos(yaw-rideYaw));rideYaw=yaw;positionPassenger();}render();
    }
    function admitReserve(reserve, distance, speed) {
        const service = services.find(s => s.id === reserve.trackId);
        const existing = trains.find(t => t.trackId === reserve.trackId);
        const train = {...service, id: 'reserve-' + reserve.id, name: 'Tàu ' + reserve.name,
            color: reserve.color, trackId: reserve.trackId, distance, speed, state: 'moving',
            remaining: 0, stationIndex: -1, stops: existing.stops, requests: new Set(),
            vehicles: reserve.vehicles, gangways: []};
        train.nextStop = train.stops.reduce((nearest, stop, index) => {
            const gap = (stop.distance - distance + train.length) % train.length;
            const best = (train.stops[nearest].distance - distance + train.length) % train.length;
            return gap < best ? index : nearest;
        }, 0);
        train.driver = templates.driver.clone(true);
        train.driver.position.set(0,1.9,-4);
        train.vehicles[0].add(train.driver);
        for (let i = 1; i < 3; i++) {
            const boot = new THREE.Group();
            const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5,.14,1),materials.steel);
            deck.position.y = -.07;
            boot.add(deck);
            for (const side of [-1,1]) {
                const handrail = new THREE.Mesh(new THREE.BoxGeometry(.08,1.15,1),materials.gold);
                handrail.position.set(side*.72,.55,0);
                boot.add(handrail);
            }
            group.add(boot);
            train.gangways.push(boot);
        }
        train.vehicles.forEach((vehicle,i) => { vehicle.userData.railVehicle = true; place(vehicle,distance-i*15,train); });
        updateGangways(train);
        trains.push(train);
        const option = document.createElement('option');
        option.value = train.id;
        option.textContent = train.name;
        lineChoice.append(option);
        return train;
    }
    function releaseReserve(train) {
        const index=trains.indexOf(train);
        if(index<0||!train.id.startsWith('reserve-')||ridingTrain===train)return false;
        trains.splice(index,1);
        for(const [station,id] of stationCalls)if(id===train.id){
            const next=trains.find(t=>t.trackId===train.trackId&&!t.returnToDepot);
            next.requests.add(station);
            stationCalls.set(station,next.id);
        }
        lineChoice.querySelector('option[value="'+train.id+'"]')?.remove();
        if(selectedLineId===train.id)selectedLineId=trains[0].id;
        return true;
    }
    function parkReserve(reserve, train) {
        train.driver.parent?.remove(train.driver);
        for(const boot of train.gangways){
            boot.parent?.remove(boot);
            boot.traverse(mesh=>{if(mesh.isMesh)mesh.geometry.dispose();});
        }
        train.vehicles.forEach((car,i)=>{
            reserve.group.add(car);
            car.position.set(0,18.24,30-i*15);
            car.rotation.set(0,0,0);
            car.visible=false;
        });
        reserve.display.forEach(mesh=>mesh.visible=true);
    }
    function passengerPoint(height){
        const car=focusTrain().vehicles[passenger.coach];car.updateWorldMatrix(true,false);const z=passenger.z;
        if(Math.abs(z)<=6)return car.localToWorld(new THREE.Vector3(passenger.x,height,z));
        const rear=z<0,other=passenger.coach+(rear?1:-1);if(other<1||other>3)return car.localToWorld(new THREE.Vector3(passenger.x,height,THREE.MathUtils.clamp(z,-6,6)));
        const next=focusTrain().vehicles[other];next.updateWorldMatrix(true,false);const a=car.localToWorld(new THREE.Vector3(passenger.x,height,rear?-6:6)),b=next.localToWorld(new THREE.Vector3(passenger.x,height,rear?6:-6));return a.lerp(b,(Math.abs(z)-6)/3);
    }
    function updateGangways(train){const vehicles=train.vehicles;for(let i=1;i<3;i++){vehicles[i].updateWorldMatrix(true,false);vehicles[i+1].updateWorldMatrix(true,false);const a=vehicles[i].localToWorld(new THREE.Vector3(0,1.92,-6)),b=vehicles[i+1].localToWorld(new THREE.Vector3(0,1.92,6)),boot=train.gangways[i-1];boot.position.copy(a).lerp(b,.5);boot.lookAt(b);boot.scale.z=Math.max(.2,a.distanceTo(b));}}
    function standPassenger(){if(!aboard)return false;passenger.seat=null;passenger.x=0;isSitting=false;heroMotion.stop();positionPassenger();render();focusGameplay();return true;}
    function chooseSeat(index){if(!aboard||!Number.isInteger(index)||!seats[index])return false;const seat=seats[index];if(Math.hypot(passenger.x-seat.x,passenger.z-seat.z)>1.65)return false;passenger.seat=index;passenger.x=seat.x;passenger.z=seat.z;isSitting=true;heroMotion.stop();seatChoice.value=String(index);camYaw=focusTrain().vehicles[passenger.coach].rotation.y+(seat.x<0?Math.PI/2:-Math.PI/2);camPitch=0;positionPassenger();render();focusGameplay();return true;}
    function nearestSeat(){let found=-1,best=1.65;seats.forEach((s,i)=>{const d=Math.hypot(passenger.x-s.x,passenger.z-s.z);if(d<best){best=d;found=i;}});return found;}
    function toggleSeat(){if(!aboard)return false;return passenger.seat===null?chooseSeat(nearestSeat()):standPassenger();}
    function seatBlocked(x,z){return seats.some(seat=>Math.abs(x-seat.x)<.73&&Math.abs(z-seat.z)<.94);}
    function movePassenger(dx,dz){if(!aboard)return false;if(Math.hypot(dx,dz)<1e-8)return true;if(passenger.seat!==null)standPassenger();const car=focusTrain().vehicles[passenger.coach];car.updateWorldMatrix(true,false);const q=car.getWorldQuaternion(new THREE.Quaternion()).invert(),delta=new THREE.Vector3(dx,0,dz).applyQuaternion(q);let x=THREE.MathUtils.clamp(passenger.x+delta.x,-1.77,1.77),z=passenger.z+delta.z;
        if(seatBlocked(x,z)){if(!seatBlocked(passenger.x,z))x=passenger.x;else if(!seatBlocked(x,passenger.z))z=passenger.z;else{x=passenger.x;z=passenger.z;}}
        if(passenger.coach===1)z=Math.min(5.75,z);if(passenger.coach===3)z=Math.max(-5.75,z);
        if(Math.abs(z)>5.65)x=THREE.MathUtils.clamp(x,-.48,.48);
        passenger.x=x;passenger.z=z;
        if(z< -7.5&&passenger.coach<3){passenger.coach++;passenger.z+=15;}else if(z>7.5&&passenger.coach>1){passenger.coach--;passenger.z-=15;}
        rideYaw=focusTrain().vehicles[passenger.coach].rotation.y;positionPassenger();return true;
    }
    function passengerVertical(){if(!aboard)return false;keys.jump=false;jumpY=0;jumpVelocityY=0;isGrounded=true;return true;}
    function positionPassenger(){playerGroup.position.copy(passengerPoint(passenger.seat===null?1.92:2.55));playerGroup.visible=false;currentGroundY=playerGroup.position.y;isGrounded=true;jumpVelocityY=0;}
    function updateCamera(){if(!gameState.isPlaying){restoreView();exitStation=null;aboard=false;ridingTrain=null;passenger.seat=null;isSitting=false;playerGroup.visible=true;return;}if(!aboard)return;camera.position.copy(passengerPoint(passenger.seat===null?3.35:3.65));if(viewMode){const car=ridingTrain.vehicles[passenger.coach];car.updateWorldMatrix(true,false);camera.position.copy(car.localToWorld(new THREE.Vector3(viewMode===1?-2.65:2.65,3.65,THREE.MathUtils.clamp(passenger.z,-5.2,5.2))));}const pitch=THREE.MathUtils.clamp(camPitch,-1.15,1);camera.lookAt(camera.position.clone().add(castleLookDirection(camYaw,pitch)));if(camera.fov!==viewFov||camera.near!==.05){camera.fov=viewFov;camera.near=.05;camera.updateProjectionMatrix();}}
    function drawMinimap(ctx,cx,cy,scale){ctx.save();ctx.lineWidth=2;for(const path of networkPaths){ctx.strokeStyle=path.lineId==='return'?'#9a8bbb':'#d9bd73';ctx.beginPath();path.points.forEach((p,i)=>{if(!i)ctx.moveTo(cx+p.x*scale,cy+p.z*scale);else ctx.lineTo(cx+p.x*scale,cy+p.z*scale);});ctx.stroke();}for(const s of stations){ctx.fillStyle='#d9bd73';ctx.fillRect(cx+s.platform.x*scale-3,cy+s.platform.z*scale-3,6,6);}for(const train of trains){const p=train.vehicles[0].position;ctx.fillStyle=train.color;ctx.beginPath();ctx.arc(cx+p.x*scale,cy+p.z*scale,4,0,Math.PI*2);ctx.fill();}ctx.restore();}
    window.gameBoot.taskProgress(168,171);
for(const train of trains){if(window.gameBoot.shouldYield())await window.gameBoot.yield();train.vehicles.forEach((model,i)=>place(model,train.distance-i*15,train));updateGangways(train);}
    window.gameBoot.taskProgress(169,171);
window.moonRailway={admitReserve,releaseReserve,parkReserve,updateGangways,get physicalTrains(){const joining=window.grandTerminal?.dispatch?.joining?.train;return joining?[...trains,joining]:trains;},createDisplayVehicle(kind,color){const model=vehicleTemplates[kind].clone(true),paint=materials.red.clone();paint.color.set(color);model.traverse(m=>{if(m.isMesh&&m.material===materials.red)m.material=paint;});return model;},stationPillars,stationGrounding,highlandGradedVertices,materials,cruiseSpeed:84,leaveForRespawn(){restoreView();exitStation=null;aboard=false;ridingTrain=null;passenger.seat=null;isSitting=false;playerGroup.visible=true;},group,stations,trains,services,reversePlatforms,railWaterAt,returnService,minimumHeadway,trafficGap,stationCalls,passenger,junctions,junctionDeckCells,renderedTrackSegments,renderedBridgeSections,bridgeWidthScale,obstacleSurvey,clearance,isBridge,seats,nearestSeat,chooseSeat,standPassenger,toggleSeat,movePassenger,passengerVertical,network,networkPaths,points,segments,groundHeights,waterCrossings,pillars,terrainHeight,roadHeight,earthBed,infrastructureAt,onGradedGround,stationPlans,requestStop,requestNextStop,nextStop,cycleLine,cycleSeat,cycleView,zoomBy,get viewMode(){return viewMode;},get viewFov(){return viewFov;},get exitStation(){return exitStation;},nearestStation,pose:(d,service=focusTrain())=>pose(d,service),vehiclePose:(d,service=focusTrain())=>vehiclePose(d,service),support,blocked,travel,update,updateCamera,toggleRide,drawMinimap,get activeTrain(){return focusTrain();},get vehicles(){return focusTrain().vehicles;},get allVehicles(){return this.physicalTrains.flatMap(t=>t.vehicles);},get driver(){return focusTrain().driver;},get stops(){return focusTrain().stops;},get gangways(){return focusTrain().gangways;},get requests(){return [...focusTrain().requests];},get length(){return focusTrain().length;},get distance(){return focusTrain().distance;},get state(){return focusTrain().state;},get remaining(){return focusTrain().remaining;},get aboard(){return aboard;},get stationIndex(){return focusTrain().stationIndex;}};window.gameBoot.taskProgress(170,171);
render();
}
