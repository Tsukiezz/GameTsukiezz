/* Survey existing geometry before building rails. All dimensions are world metres. */
function surveyRailwayObstacles(scene, excluded,height=null){
    const boxes=[],grid=new Map(),cell=32,largeMeshes=[];let currentSource='';
    scene.updateMatrixWorld(true);
    const add=box=>{
        const size=box.getSize(new THREE.Vector3());
        if(!Number.isFinite(box.max.y))return;
        if(size.lengthSq()<1e-10)return;
        if(size.y<.08){box.min.y-=.04;box.max.y+=.04;}
        box.source=currentSource;
        const id=boxes.push(box)-1;
        for(let x=Math.floor(box.min.x/cell);x<=Math.floor(box.max.x/cell);x++)for(let z=Math.floor(box.min.z/cell);z<=Math.floor(box.max.z/cell);z++){
            const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(id);
        }
    };
    scene.traverse(mesh=>{
        if(!mesh.isMesh||excluded.includes(mesh)||mesh.material?.transparent||mesh.material?.depthWrite===false||/SealedEdges|Shore|Bedrock|Water|MoltenRiver|AntarcticIceRidges|VillageSwitchbackTrail/i.test(mesh.name))return;
        for(let p=mesh;p;p=p.parent)if(p.userData.railwayIgnore||p===playerGroup||!p.visible||/Player|Sky|Cloud|MoonRailway/.test(p.name))return;
        currentSource=mesh.name||mesh.parent?.name||'unnamed';
        mesh.geometry.computeBoundingBox();const base=mesh.geometry.boundingBox;
        if(mesh.isInstancedMesh){const m=new THREE.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);if(height&&/^(Grove_|MoonwellFlora_|BachKhuyet_|LegacyFlora_)/.test(mesh.name)){const e=m.elements;e[13]=height(e[12],e[14])+(mesh.name.startsWith('LegacyFlora_')?e[13]:0);}add(base.clone().applyMatrix4(m.premultiply(mesh.matrixWorld)));}}
        else {
            const size=base.getSize(new THREE.Vector3()),g=mesh.geometry,index=g.index,position=g.attributes.position;
            if((size.x>240||size.z>240||size.y>180)&&index){
                // Exported architecture is merged by material over the whole map.
                // Split connected index components; never discard those big meshes.
                const parent=Array.from({length:position.count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
                for(let i=0;i<index.count;i+=3){const a=find(index.getX(i));parent[find(index.getX(i+1))]=a;parent[find(index.getX(i+2))]=a;}
                const components=new Map();for(let i=0;i<position.count;i++){const id=find(i);if(!components.has(id))components.set(id,new THREE.Box3());components.get(id).expandByPoint(new THREE.Vector3().fromBufferAttribute(position,i));}
                largeMeshes.push({name:mesh.name,components:components.size});
                for(const box of components.values())add(box.applyMatrix4(mesh.matrixWorld));
            }else add(base.clone().applyMatrix4(mesh.matrixWorld));
        }
    });
    function top(x,z,padding=0,ceiling=Infinity,bottom=-Infinity){let y=-Infinity;const ids=new Set();
        for(let a=Math.floor((x-padding)/cell);a<=Math.floor((x+padding)/cell);a++)for(let b=Math.floor((z-padding)/cell);b<=Math.floor((z+padding)/cell);b++)for(const id of grid.get(a+','+b)||[])ids.add(id);
        for(const id of ids){const box=boxes[id];if(box.min.y<=ceiling&&box.max.y>=bottom&&x+padding>=box.min.x&&x-padding<=box.max.x&&z+padding>=box.min.z&&z-padding<=box.max.z)y=Math.max(y,box.max.y);}
        return y;
    }
    return {boxes,top,largeMeshes};
}

function smoothRailwayCurve(nodes,spacing=48){
    const controls=[nodes[0].clone(),nodes[0].clone(),nodes[0].clone()];
    // Uniform spacing across the whole polyline prevents a tiny grid/portal
    // segment from becoming a sharp hook between otherwise broad curves.
    let travelled=0,next=spacing;
    for(let i=0;i<nodes.length-1;i++){const length=nodes[i].distanceTo(nodes[i+1]);while(next<travelled+length){controls.push(nodes[i].clone().lerp(nodes[i+1],(next-travelled)/length));next+=spacing;}travelled+=length;}
    if(controls.length>3&&controls.at(-1).distanceTo(nodes.at(-1))<spacing*.5)controls.pop();
    controls.push(nodes.at(-1).clone(),nodes.at(-1).clone(),nodes.at(-1).clone());
    class RailSpline extends THREE.Curve{constructor(){super();this.arcLengthDivisions=Math.max(800,controls.length*30);}getPoint(t,target=new THREE.Vector3()){const scaled=t*(controls.length-3),i=Math.min(controls.length-4,Math.floor(scaled)),u=Math.min(1,scaled-i),u2=u*u,u3=u2*u;return target.set(0,0,0).addScaledVector(controls[i],(1-u)**3/6).addScaledVector(controls[i+1],(3*u3-6*u2+4)/6).addScaledVector(controls[i+2],(-3*u3+3*u2+3*u+1)/6).addScaledVector(controls[i+3],u3/6);}}
    return new RailSpline();
}

function createRailwayRoutePlanner(height,survey){
    const step=20,bound=3340,n=335,costs=new Map();
    let bounds=null,junctions=[];const reservations=new Map(),reservationCell=32;
    const nearHub=(x,z)=>junctions.some(p=>Math.hypot(x-p.x,z-p.z)<80);
    function reserved(x,z,clearance=26){const gx=Math.floor(x/reservationCell),gz=Math.floor(z/reservationCell);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(const p of reservations.get((gx+a)+','+(gz+b))||[])if(Math.hypot(x-p.x,z-p.z)<clearance)return true;return false;}
    const decode=id=>new THREE.Vector3((id%n)*step-bound,0,Math.floor(id/n)*step-bound);
    const encode=p=>THREE.MathUtils.clamp(Math.round((p.z+bound)/step),0,n-1)*n+THREE.MathUtils.clamp(Math.round((p.x+bound)/step),0,n-1);
    function remember(curve){if(bounds){const count=Math.ceil(curve.getLength()/4);for(let i=0;i<=count;i++){const p=curve.getPointAt(i/count);if(nearHub(p.x,p.z))continue;const key=Math.floor(p.x/reservationCell)+','+Math.floor(p.z/reservationCell);if(!reservations.has(key))reservations.set(key,[]);reservations.get(key).push(p);}}return curve;}
    function cost(id){if(costs.has(id))return costs.get(id);const p=decode(id);let floor=-Infinity;
        for(const dx of [-10,0,10])for(const dz of [-10,0,10])floor=Math.max(floor,height(p.x+dx,p.z+dz));
        // Reserve room for rounded corners as well as the whole train, including
        // existing elevated structures. This avoids rising into them on approach.
        const ground=height(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z),rail=water!==null&&ground<water+.2?water+3.2:ground;
        const obstacle=Math.max(0,survey.top(p.x,p.z,32,Infinity,rail+.5)-rail);
        const c=1+Math.pow(Math.max(0,floor-ground)/4,2)+obstacle*4;costs.set(id,c);return c;
    }
    function route(a,b,clearance=9){
        const direction=b.clone().sub(a).normalize(),leadLength=Math.min(55,a.distanceTo(b)*.22);
        function portal(p,sign){let length=leadLength;while(length>8){let clear=true;for(let d=4;d<=length;d+=4){const q=p.clone().addScaledVector(direction,d*sign),floor=height(q.x,q.z),water=playerSurvival.surfaceAt(q.x,q.z);if(survey.top(q.x,q.z,Math.max(10,clearance),floor+7.2,floor+.5)>floor+.5&&!(water!==null&&floor<water+.2)&&(height.maxOverRect?.(q.x,q.z,8)??floor)-floor<=6&&floor<=65){clear=false;break;}}if(clear)break;length=Math.max(8,length-8);}return p.clone().addScaledVector(direction,length*sign);}
        const lead=portal(a,1),tail=portal(b,-1);
        if(a.distanceTo(b)<180&&clearLine(a,b))return remember(new THREE.LineCurve3(a,b));
        const start=encode(lead),goal=encode(tail),end=decode(goal),open=[{id:start,f:0}],g=new Map([[start,0]]),previous=new Map(),closed=new Set();
        const push=item=>{open.push(item);let i=open.length-1;while(i){const p=(i-1)>>1;if(open[p].f<=item.f)break;open[i]=open[p];i=p;}open[i]=item;};
        const pop=()=>{const first=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(open[c].f>=last.f)break;open[i]=open[c];i=c;}open[i]=last;}return first;};
        while(open.length){const {id}=pop();if(closed.has(id))continue;if(id===goal)break;closed.add(id);const p=decode(id);
            for(const dx of [-1,0,1])for(const dz of [-1,0,1]){if(!dx&&!dz)continue;const x=id%n+dx,z=Math.floor(id/n)+dz;if(x<0||x>=n||z<0||z>=n)continue;const next=z*n+x,q=decode(next);if(id===start&&q.clone().sub(decode(start)).dot(direction)<-.5||next===goal&&decode(goal).sub(p).dot(direction)<-.5)continue;if(q.x<-2470&&window.westernHighlands?.villages.some(v=>Math.hypot(q.x-v.center.x,q.z-v.center.z)<80))continue;if(bounds&&(q.x<bounds.x0||q.x>bounds.x1||q.z<bounds.z0||q.z>bounds.z1))continue;if(junctions.some(p=>q.distanceTo(p)<100&&p.distanceTo(a)>65&&p.distanceTo(b)>65))continue;if(!nearHub(q.x,q.z)&&reserved(q.x,q.z)&&next!==goal)continue;const floor=height(q.x,q.z);if(next!==goal&&survey.top(q.x,q.z,clearance,floor+7.2,floor+.5)>floor+.5){const water=playerSurvival.surfaceAt(q.x,q.z),wet=water!==null&&floor<water+.2,rough=floor>65||(height.maxOverRect?.(q.x,q.z,8)??floor)-floor>6;if(wet||!rough||q.x<-2470)continue;}let bend=0;if(previous.has(id)){const before=p.clone().sub(decode(previous.get(id))).normalize(),after=q.clone().sub(p).normalize(),dot=before.dot(after);if(dot<-.01)continue;bend=(1-dot)*35;}const score=g.get(id)+Math.hypot(dx,dz)*step*(cost(id)+cost(next))/2+bend;
                if(score<(g.get(next)??Infinity)){g.set(next,score);previous.set(next,id);const q=decode(next);push({id:next,f:score+q.distanceTo(end)});}
            }
        }
        if(!g.has(goal)){if(bounds?.region&&!bounds.relaxed){const previous=bounds;bounds={...bounds.region,relaxed:true};try{return route(a,b,clearance);}finally{bounds=previous;}}throw Error('No safe railway corridor '+JSON.stringify({a:a.toArray(),b:b.toArray(),lead:lead.toArray(),tail:tail.toArray(),obstacle:survey.top(tail.x,tail.z,10,height(tail.x,tail.z)+7.2,height(tail.x,tail.z)+.5),reserved:reserved(tail.x,tail.z),visited:g.size,sources:survey.boxes.filter(box=>box.min.x<lead.x+25&&box.max.x>lead.x-25&&box.min.z<lead.z+25&&box.max.z>lead.z-25&&box.min.y<height(lead.x,lead.z)+7.2&&box.max.y>height(lead.x,lead.z)+.5).map(box=>({source:box.source,min:box.min.toArray(),max:box.max.toArray()})),bounds}));}
        const ids=[goal];while(ids.at(-1)!==start)ids.push(previous.get(ids.at(-1)));ids.reverse();
        const core=[lead,...ids.slice(1,-1).map(decode),tail],simplified=[lead];
        function clearLine(u,v){const heading=v.clone().sub(u).normalize();if(u===lead&&heading.dot(direction)<.8||v===tail&&heading.dot(direction)<.8)return false;const count=Math.ceil(u.distanceTo(v)/4),terrainLimit=Math.max(height(u.x,u.z),height(v.x,v.z))+12;for(let i=1;i<count;i++){const p=u.clone().lerp(v,i/count);if(bounds&&(p.x<bounds.x0||p.x>bounds.x1||p.z<bounds.z0||p.z>bounds.z1))return false;if(!nearHub(p.x,p.z)&&reserved(p.x,p.z))return false;const floor=height(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z),rail=water!==null&&floor<water+.2?water+3.2:floor;if(survey.top(p.x,p.z,Math.max(10,clearance),rail+7.2,rail+.5)>rail+.5&&floor<=65||floor>terrainLimit)return false;}return true;}
        for(let i=0;i<core.length-1;){let next=i+1;for(let j=core.length-1;j>i+1;j--)if(clearLine(core[i],core[j])){next=j;break;}simplified.push(core[next]);i=next;}
        const raw=[a.clone(),...simplified,b.clone()],nodes=[raw[0]];
        // Keep direction changes, then round their corners for coach-sized turns.
        for(let i=1;i<raw.length-1;i++){const u=raw[i].clone().sub(raw[i-1]).normalize(),v=raw[i+1].clone().sub(raw[i]).normalize();if(u.dot(v)<.999)nodes.push(raw[i]);}nodes.push(raw.at(-1));
        let curve=smoothRailwayCurve(nodes);
        const countCheck=Math.ceil(curve.getLength()/3);let constrained=false;
        for(let i=0;i<=countCheck;i++){const p=curve.getPointAt(i/countCheck),floor=height(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z);if(!nearHub(p.x,p.z)&&reserved(p.x,p.z,14)||survey.top(p.x,p.z,8,floor+7.2,floor+.5)>floor+.5&&!(water!==null&&floor<water+.2)&&(height.maxOverRect?.(p.x,p.z,8)??floor)-floor<=6&&floor<=65){constrained=true;break;}}
        if(constrained)curve=smoothRailwayCurve(nodes,24);
        return remember(curve);
    }
    route.costAt=p=>cost(encode(p));
    route.configure=options=>{bounds=options.bounds??null;junctions=options.junctions??junctions;};
    return route;
}

function createRailwayServices(source){
    const fleet=[{id:'red',name:'Tuyến Đỏ',color:'#d94f58'},{id:'blue',name:'Tuyến Xanh',color:'#258ddd'},{id:'yellow',name:'Tuyến Vàng',color:'#f1bd35'}];
    const service={...fleet[0],bounds:{x0:-3250,x1:3250,z0:-3250,z1:3250},left:-900,right:900,points:[]},services=[service],nodes={},edges=new Map();
    // A continuous interior weave shares one clockwise itinerary between all
    // three liveries. Parallel corridors stay separated instead of crossing
    // into a stack of conflicting tracks.
    const anchors=[[-920,-920],[920,-920],[920,920],[-920,920],[-920,660],[700,660],[700,400],[-440,400],[-440,140],[700,140],[700,-120],[-440,-120],[-440,-380],[700,-380],[700,-640],[-920,-640],[-1300,-640],[-1300,1100],[-1700,1100],[-1700,-1100],[-2100,-1100],[-2100,1100],[-2500,1100],[-2500,-1100],[-2900,-1100],[-2900,1100],[-3200,1100],[-3200,3200],[3200,3200],[3200,2900],[-2900,2900],[-2900,2500],[2900,2500],[2900,2100],[-2900,2100],[-2900,1700],[2900,1700],[2900,1300],[1300,1300],[1300,-1100],[1700,-1100],[1700,1100],[2100,1100],[2100,-1100],[2500,-1100],[2500,1100],[2900,1100],[2900,-1100],[3200,-1100],[3200,-3200],[-3200,-3200],[-3200,-2900],[2900,-2900],[2900,-2500],[-2900,-2500],[-2900,-2100],[2900,-2100],[2900,-1700],[-1300,-1700],[-1300,-1300],[-920,-1300]];
    const western=window.westernHighlands?expandHighlandRailNetwork(anchors):null;
    service.patrol=anchors.map((p,i)=>'red_P'+String(i).padStart(2,'0'));
    anchors.forEach(([x,z],i)=>nodes[service.patrol[i]]=[x,0,z]);
    for(let i=0;i<service.patrol.length;i++){const a=service.patrol[i],b=service.patrol[(i+1)%service.patrol.length];edges.set([a,b].sort().join('|'),{a,b,lineId:service.id});}
    const list=[...edges.values()],junctions=Object.keys(nodes).filter(id=>list.filter(e=>e.a===id||e.b===id).length>2);
    const stations=source.stations.map(s=>({...s,lineId:'red'}));
    if(window.worldExpansion)stations.push({name:'Ga Nam C\u1ef1c',position:[-2300,0,1700],lineId:'red',maxDistance:600},{name:'Ga Nh\u00e0 M\u00e1y Tuy\u1ebft',position:[-1000,0,2100],lineId:'red',maxDistance:700},{name:'Ga H\u1ed3 B\u0103ng',position:[1800,0,2900],lineId:'red',maxDistance:700},{name:'Ga Vi\u1ec5n B\u1eafc',position:[500,0,-3000],lineId:'red',maxDistance:700});
    if(window.desertRealm)stations.unshift({name:'Ga Kim Tự Tháp',position:[desertRealm.center.x+140,0,desertRealm.center.z-220],lineId:'red',maxDistance:420});
    const architectural=[['Lâu Đài',-110,120],['Công Nghệ',-225,20],['Rừng Cổ',202,-206],['Hang Tà Thần',125,-110],['\u0110\u1ea5u Tr\u01b0\u1eddng',(window.romanArena?.center?.x??115)+240,(window.romanArena?.center?.z??110)-70],['Hồ Thủy Ngân',-370,-430],['Nữ Chúa Tuyết',-2200,2250],['Thác Băng',1100,2830]];
    for(const [name,x,z] of architectural)stations.push({name:'Ga '+name,position:[x,0,z],lineId:'red',maxDistance:name==='\u0110\u1ea5u Tr\u01b0\u1eddng'?350:name==='Hang T\u00e0 Th\u1ea7n'?900:600,optional:!['Hang T\u00e0 Th\u1ea7n','\u0110\u1ea5u Tr\u01b0\u1eddng'].includes(name)});
    if(window.candyRealm)stations.unshift({name:'Ga Vương Quốc Bánh Kẹo',position:candyRealm.center.toArray(),lineId:'red',maxDistance:750});
    const regional=[[-1700,-700],[-2100,600],[-2500,-600],[-2900,700],[-2600,2500],[-1600,2500],[-400,2500],[800,2500],[2100,2500],[-2600,1700],[400,1700],[2100,1700],[1300,-600],[1700,600],[2100,-600],[2500,600],[2900,-600],[-2200,-2900],[-1200,-2500],[1000,-2500],[2200,-2100],[-500,-1700]];
    regional.forEach(([x,z],i)=>stations.push({name:'Ga '+(z>1450?'Băng Nguyệt ':'Viễn Du ')+(i+1),position:[x,0,z],lineId:'red',maxDistance:550,optional:true}));
    const fixedNodes={red_P12:[-440,0,-400]};if(western)for(let i=western.from;i<western.to;i++)fixedNodes[service.patrol[i]]=[anchors[i][0],0,anchors[i][1]];
    for(const village of window.westernHighlands?.villages||[])stations.push({name:'Ga '+village.plan.name,position:village.center.toArray(),lineId:'red',maxDistance:340,villageId:village.plan.id});
    return {fleet,services,nodes,fixedNodes,sourceNodes:structuredClone(nodes),edges:list,junctions,stations,patrol:services[0].patrol};
}

function resolveRailwayClearance(points,paths,height,waterAt,survey,plans,junctions=[],routes=[{points}]){
    const required=new Map(),key=p=>p.x.toFixed(2)+','+p.z.toFixed(2),terrainModes=[];
    for(let i=0;i<points.length;i++){
        const p=points[i],direction=p.railDirection??new THREE.Vector3(0,0,1),floor=height(p.x,p.z),water=waterAt(p.x,p.z);
        const deckWater=[];for(const dx of [-7,0,7])for(const dz of [-7,0,7]){const w=waterAt(p.x+dx,p.z+dz);if(Number.isFinite(w))deckWater.push(w);}const waterTop=deckWater.length?Math.max(...deckWater):null;const crossing=waterTop!==null;
        const cross=Math.max(floor,height(p.x-direction.z*2.8,p.z+direction.x*2.8),height(p.x+direction.z*2.8,p.z-direction.x*2.8));
        const footprint=height.maxOverRect?.(p.x,p.z,8)??cross;
        const highMountain=floor>65&&(Math.min(height(p.x-24,p.z),height(p.x+24,p.z),height(p.x,p.z-24),height(p.x,p.z+24))<floor-6||survey.top(p.x,p.z,9,floor+7.2,floor+.5)>floor+.5);
        const rough=highMountain||footprint-floor>6;
        let y=cross+.12,mode='ground';
        if(crossing){y=Math.max(y,waterTop+6.5);mode='river';}
        else if(rough&&p.x>=-2470){y=Math.max(y,footprint+1.5);mode='mountain';}
        if(mode!=='ground'){for(let pass=0;pass<4;pass++){const obstacle=survey.top(p.x,p.z,9,y+7,y-1.1);if(!Number.isFinite(obstacle))break;y=Math.max(y,obstacle+1.5);}}
        p.terrainMode=mode;required.set(key(p),Math.max(required.get(key(p))??-Infinity,y));terrainModes.push(mode);
    }
    points.forEach(p=>p.y=required.get(key(p)));
    const groups=plans.map(plan=>{const indices=[];points.forEach((p,i)=>{const q=p.clone().sub(plan.center).applyAxisAngle(new THREE.Vector3(0,1,0),-plan.yaw);if(p.lineId===plan.lineId&&Math.abs(q.x)<10&&q.z>-58&&q.z<52)indices.push(i);});return {indices,minimum:plan.grade+.12};});
    for(const hub of junctions){const centers=[hub.center];for(const path of paths)if(path.lineId===hub.lineId)for(const p of [path.a,path.b])if(Math.abs(Math.hypot(p.x-hub.center.x,p.z-hub.center.z)-64)<1)centers.push(p);for(const center of centers){const indices=[];points.forEach((p,i)=>{if(p.lineId===hub.lineId&&Math.hypot(p.x-center.x,p.z-center.z)<14)indices.push(i);});groups.push({indices,minimum:-Infinity});}}
    let passes=0;
    for(;passes<100;passes++){
        let changed=false;
        for(const group of groups){const y=Math.max(group.minimum,...group.indices.map(i=>points[i].y));for(const i of group.indices)if(y>points[i].y+1e-6){points[i].y=y;changed=true;}}
        const tops=new Map();for(const p of points)tops.set(key(p),Math.max(tops.get(key(p))??-Infinity,p.y));
        for(const p of points)if(tops.get(key(p))>p.y+1e-6){p.y=tops.get(key(p));changed=true;}
        for(const route of routes)for(const direction of [1,-1])for(let n=0;n<route.points.length;n++){const count=route.points.length,i=(n*direction+count)%count,a=route.points[i],b=route.points[(i+direction+count)%count],y=a.y-Math.hypot(a.x-b.x,a.z-b.z)*.35;if(y>b.y+1e-6){b.y=y;if(a.terrainMode!=='ground')b.terrainMode=a.terrainMode;changed=true;}}
        if(!changed)break;
    }
    const tops=new Map(points.map(p=>[key(p),p.y])),modes=new Map(points.map(p=>[key(p),p.terrainMode]));for(const path of paths)for(const p of path.points){p.y=tops.get(key(p))??p.y;p.terrainMode=modes.get(key(p))??'ground';}
    return {required,passes,maxGrade:.35,terrainModes};
}

/* Level the complete stopped consist on BOTH tracks. Only raise rail heights,
   preserving all surveyed obstacle/water clearance and the gradual approaches. */
function levelRailwayStationApproaches(services,plans,height){
    const groups=[];
    for(const service of services)for(const plan of plans){const ps=service.points,n=ps.length;let nearest=0,best=Infinity;ps.forEach((p,i)=>{const d=Math.hypot(p.x-plan.center.x,p.z-plan.center.z);if(d<best){best=d;nearest=i;}});if(best>90)continue;const indices=new Set([nearest]);for(const direction of [-1,1]){let distance=0,i=nearest;for(let k=0;k<n;k++){const j=(i+direction+n)%n;distance+=ps[j].distanceTo(ps[i]);if(distance>105)break;indices.add(j);i=j;}}groups.push({service,indices:[...indices]});}
    for(let pass=0;pass<120;pass++){let changed=false;if(services.length===2){const forward=services[0].points,back=services[1].points;for(let i=0;i<forward.length;i++){const a=forward[i],b=back[back.length-1-i];if(a.x<-2470){const y=Math.max(a.y,b.y);if(y>a.y+1e-6||y>b.y+1e-6)changed=true;a.y=b.y=y;}}}for(const {service,indices} of groups){const top=Math.max(...indices.map(i=>service.points[i].y));for(const i of indices)if(top-service.points[i].y>1e-6){service.points[i].y=top;changed=true;}}for(const {points:ps} of services)for(const dir of [-1,1])for(let k=0;k<ps.length;k++){const i=(k*dir+ps.length)%ps.length,a=ps[i],b=ps[(i+dir+ps.length)%ps.length],minimum=a.y-Math.hypot(a.x-b.x,a.z-b.z)*.2;if(b.y<minimum-1e-6){b.y=minimum;changed=true;}}if(!changed)break;}
    for(const service of services)for(const p of service.points)if(p.x>=-2470&&p.terrainMode==='ground'&&p.y-height(p.x,p.z)>1.05)p.terrainMode='station-bridge';
    return groups;
}

/* Two alternating stair flights, landings and rails; physics uses the same boxes. */
function buildRailwayAccess(station,height,survey,materials,parent){
    station.model.updateWorldMatrix(true,false);
    const surfaces=[],solids=[],buffers=new Map(),root=new THREE.Group();root.name='RailwayAccess';root.position.copy(station.model.position);root.rotation.y=station.yaw;parent.add(root);
    const top=station.platform.y-station.model.position.y;
    if(station.grounded){
        const vertices=[],indices=[],rows=[],triangles=[];
        for(let z=70;z>=36;z-=2){const row=[];for(const x of [6,10]){const world=station.model.localToWorld(new THREE.Vector3(x,0,z)),blend=1-THREE.MathUtils.smoothstep(z,38,62);world.y=THREE.MathUtils.lerp(height(world.x,world.z)+.02,station.platform.y,blend);const local=station.model.worldToLocal(world.clone());vertices.push(local.x,local.y,local.z);row.push(world);}rows.push(row);}
        for(let i=0;i<rows.length-1;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);for(const [a,b,c] of [[rows[i][0],rows[i][1],rows[i+1][0]],[rows[i][1],rows[i+1][1],rows[i+1][0]]])triangles.push({a,b,c,den:(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z)});}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();root.add(new THREE.Mesh(g,materials.stone));root.updateWorldMatrix(true,true);
        const rampHeight=(x,z,y=Infinity)=>{let top=-Infinity;for(const {a,b,c,den} of triangles){if(Math.abs(den)<1e-8)continue;const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;if(u>=-1e-6&&v>=-1e-6&&w>=-1e-6){const h=u*a.y+v*b.y+w*c.y;if(y>=h-MAX_STEP_HEIGHT-.001)top=Math.max(top,h);}}return top;};
        const waypoints=rows.map(row=>row[0].clone().add(row[1]).multiplyScalar(.5));
        const maxGrade=Math.max(...waypoints.slice(1).map((p,i)=>Math.abs(p.y-waypoints[i].y)/Math.hypot(p.x-waypoints[i].x,p.z-waypoints[i].z)));
        if(maxGrade>.65){
            // A grounded hall can still sit beside a deep hillside. A ramp
            // must not become a near-vertical shortcut down that cliff.
            parent.remove(root);g.dispose();
            const stairs=buildRailwayAccess({...station,grounded:false},height,survey,materials,parent);
            stairs.replacedSteepRamp=true;stairs.oldMaxGrade=maxGrade;return stairs;
        }
        return {kind:'ground',root,surfaces:[],solids:[],waypoints,rise:station.platform.y-waypoints[0].y,entrance:waypoints[0].clone(),height:rampHeight,rampVertices:vertices,rampIndices:indices};
    }
    let choice=null;
    for(const z of [32,-32,55,-55,72,-72])for(const x of [36,44,52,60,68]){
        const p=station.model.localToWorld(new THREE.Vector3(x+2,0,z+7.5)),bottom=height(p.x,p.z),obstacle=survey.top(p.x,p.z,9),floors=[];let outside=false,wet=false;
        for(const dx of [-4,0,4])for(const dz of [-1,0,1]){const q=station.model.localToWorld(new THREE.Vector3(x+2+dx,0,z+7.5+dz)),floor=height(q.x,q.z),water=playerSurvival.surfaceAt(q.x,q.z);floors.push(floor);if(water!==null&&floor<water+.4)wet=true;if(Math.abs(q.x)>EXPANDED_REALM_DATA.bound-3||Math.abs(q.z)>EXPANDED_REALM_DATA.bound-3)outside=true;}
        const score=(outside?1e10:0)+(wet?1e9:0)+(Math.max(...floors)-Math.min(...floors))*1000+(Number.isFinite(obstacle)?Math.max(0,obstacle-bottom)*1000:0)+Math.abs(z-32)+x;
        if(!choice||score<choice.score)choice={x,z,bottom,score};
    }
    const {x,z,bottom}=choice,base=bottom-station.model.position.y+.02,rise=top-base;
    if(Math.abs(rise)>=5){parent.remove(root);return buildStationLiftAccess(station,height,survey,materials,parent,choice);}
    function box(cx,cy,cz,w,h,d,material,walk=false,solid=false){
        const geometry=new THREE.BoxGeometry(w,h,d);geometry.translate(cx,cy,cz);let b=buffers.get(material);if(!b){b={p:[],n:[],i:[]};buffers.set(material,b);}const offset=b.p.length/3;
        b.p.push(...geometry.attributes.position.array);b.n.push(...geometry.attributes.normal.array);for(const i of geometry.index.array)b.i.push(offset+i);geometry.dispose();
        const bounds={minX:cx-w/2,maxX:cx+w/2,minZ:cz-d/2,maxZ:cz+d/2,minY:cy-h/2,maxY:cy+h/2};if(walk)surfaces.push(bounds);if(solid)solids.push(bounds);
    }
    function beam(a,b,width,depth,material){const geometry=new THREE.BoxGeometry(width,a.distanceTo(b),depth),matrix=new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()),new THREE.Vector3(1,1,1));geometry.applyMatrix4(matrix);let data=buffers.get(material);if(!data){data={p:[],n:[],i:[]};buffers.set(material,data);}const offset=data.p.length/3;data.p.push(...geometry.attributes.position.array);data.n.push(...geometry.attributes.normal.array);for(const i of geometry.index.array)data.i.push(offset+i);geometry.dispose();}
    const waypoints=[new THREE.Vector3(x+2,base,z+7.5)];
    // Each full flight rises at most 2.4m; a step is never higher than 15cm.
    const flights=Math.max(1,Math.ceil(Math.abs(rise)/2.4)),flightRise=rise/flights;
    box(x+2,base-.1,z+7.5,9,.2,3,'stone',true);
    for(let f=0;f<flights;f++){
        const dir=f%2===0?-1:1,cx=x+(f%2)*4,from=z-dir*6,y0=base+f*flightRise,steps=Math.max(1,Math.ceil(Math.abs(flightRise)/.15));
        waypoints.push(new THREE.Vector3(cx,y0,from));
        for(let j=0;j<steps;j++){
            const y=y0+(j+1)*flightRise/steps,cz=from+dir*(j+.5)*12/steps;
            box(cx,y-.09,cz,3.6,.18,12/steps+.025,'stone',true);
            box(cx,y+.008,cz+dir*(6/steps-.04),3.45,.025,.08,'gold');
        }
        for(const side of [-1,1]){beam(new THREE.Vector3(cx+side*1.9,y0+1.05,from),new THREE.Vector3(cx+side*1.9,y0+flightRise+1.05,from+dir*12),.14,.14,'gold');beam(new THREE.Vector3(cx+side*1.88,y0-.28,from),new THREE.Vector3(cx+side*1.88,y0+flightRise-.28,from+dir*12),.22,.32,'teal');for(let j=0;j<=8;j++){const cz=from+dir*j*1.5,yt=y0+flightRise*j/8;box(cx+side*1.9,yt+.52,cz,.12,1.04,.12,'teal',false,true);}for(let j=0;j<steps;j++){const cz=from+dir*(j+.5)*12/steps,yt=y0+flightRise*(j+1)/steps;solids.push({minX:cx+side*1.9-.1,maxX:cx+side*1.9+.1,minZ:cz-6/steps,maxZ:cz+6/steps,minY:yt+.15,maxY:yt+1.1});}}
        const end=from+dir*12,yt=y0+flightRise;
        box(x+2,yt-.1,end+dir*.9,8,.2,1.8,'stone',true);waypoints.push(new THREE.Vector3(cx,yt,end+dir*.9),new THREE.Vector3(x+(1-f%2)*4,yt,end+dir*.9));
        box(x+2,yt-.25,end+dir*.9,8.4,.12,2.1,'gold');box(x+2,yt+1.05,end+dir*1.8,8,.12,.12,'gold',false,true);for(const dx of [-3,0,3])box(x+2+dx,yt+.5,end+dir*1.8,.1,1,.1,'teal',false,true);box(x-2,yt+1.2,end,.42,.65,.42,'lamp');
        for(const side of [-1,1])if(!(f===flights-1&&side===1))box(x+2+side*4,yt+.5,end+dir*.9,.12,1.2,1.8,'teal',false,true);
    }
    const last=waypoints.at(-1),landingZ=last.z;
    // The approach stays on the hall's outer side, then meets the open platform end.
    // Route the upper gallery OUTSIDE the stairwell so it cannot cover a flight
    // and prevent walking back down beneath it.
    box((last.x+x+8)/2,top-.1,landingZ,x+8-last.x+3,.2,1.8,'stone',true);
    box(x+8,top-.1,(landingZ+44)/2,3,.2,Math.abs(44-landingZ)+1.8,'stone',true);
    box((x+15)/2,top-.1,44,x+5,.2,4,'stone',true);
    box(7,top-.1,40,4,.2,10,'stone',true);
    waypoints.push(new THREE.Vector3(x+8,top,landingZ),new THREE.Vector3(x+8,top,44),new THREE.Vector3(7,top,44),new THREE.Vector3(7,top,36));
    box((x+8)/2,top+.55,46,x+2,.1,.1,'gold',false,true);
    box((12+x+5)/2,top+.55,42,x-7,.1,.1,'gold',false,true);
    box(x+9.5,top+.55,(landingZ+44)/2,.1,.1,Math.abs(44-landingZ)+1.8,'gold',false,true);
    // Four slim tower legs: do not fill the space below the elevated station.
    for(const dx of [-2,6])for(const dz of [-7.8,7.8])if(rise>1){box(x+dx,(base+top)/2,z+dz,.65,rise,.65,'teal',false,true);box(x+dx,base+.2,z+dz,1.3,.4,1.3,'stone',false,true);box(x+dx,top-.3,z+dz,1,.3,1,'gold');}
    for(const dx of [-2,6]){beam(new THREE.Vector3(x+dx,base+.5,z-7),new THREE.Vector3(x+dx,Math.min(top-.5,base+4),z+7),.18,.18,'gold');beam(new THREE.Vector3(x+dx,base+.5,z+7),new THREE.Vector3(x+dx,Math.min(top-.5,base+4),z-7),.18,.18,'gold');}
    // Cantilever beams and columns support the level waiting hall, not just the stairs.
    for(const lx of [0,28])for(const lz of [-40,0,40]){const p=station.model.localToWorld(new THREE.Vector3(lx,0,lz)),floor=height(p.x,p.z)-station.model.position.y,h=top-.25-floor;if(h>1){box(lx,floor+h/2,lz,1.1,h,1.1,'stone',false,true);box(lx,top-.4,lz,3,.45,3,'gold');}}
    for(const [material,b] of buffers){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setIndex(b.i);root.add(new THREE.Mesh(g,materials[material]));}
    root.updateWorldMatrix(true,true);
    return finishLowStationStairs({root,surfaces,solids,waypoints:waypoints.map(p=>root.localToWorld(p)),rise,entrance:root.localToWorld(new THREE.Vector3(x+2,base,z+7.5))},station,height,materials);
}
