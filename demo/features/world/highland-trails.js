/* Surveyed, physical hillside paths. Steps and their supports share one model. */
function installHighlandTrails(){
    const started=performance.now();
    const group=new THREE.Group();group.name='HighlandWalkingRoutes';scene.add(group);
    const routes=[],failures=[],cells=new Map(),cell=8,width=1.8,riser=.14;let junctionSamples=null;
    const rock=new THREE.MeshStandardMaterial({color:0x9b887a,roughness:.95}),snow=new THREE.MeshStandardMaterial({color:0xc2cbd1,roughness:.9});
    const metal=new THREE.MeshStandardMaterial({color:0x526473,roughness:.65,metalness:.4}),trim=new THREE.MeshStandardMaterial({color:0xc0a16c,roughness:.65});
    const cube=new THREE.BoxGeometry(1,1,1),postGeo=new THREE.CylinderGeometry(1,1,1,5);
    const ground=(x,z)=>worldSurface.height(x,z);
    const railCells=new Map(),railCell=32;
    for(const service of moonRailway.services)for(let i=0;i<service.points.length;i+=4){const a=service.points[i],b=service.points[(i+4)%service.points.length],s={a,b};for(let x=Math.floor((Math.min(a.x,b.x)-10)/railCell);x<=Math.floor((Math.max(a.x,b.x)+10)/railCell);x++)for(let z=Math.floor((Math.min(a.z,b.z)-10)/railCell);z<=Math.floor((Math.max(a.z,b.z)+10)/railCell);z++){const key=x+','+z;if(!railCells.has(key))railCells.set(key,[]);railCells.get(key).push(s);}}
    function nearRail(x,z){let nearest=null;for(const {a,b} of railCells.get(Math.floor(x/railCell)+','+Math.floor(z/railCell))||[]){const dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1),distance=Math.hypot(x-a.x-dx*t,z-a.z-dz*t);if(!nearest||distance<nearest.distance)nearest={distance,y:a.y+(b.y-a.y)*t};}return nearest;}
    const wet=(x,z)=>{const y=playerSurvival.surfaceAt(x,z);return y!==null&&ground(x,z)<y+.5;};
    function accessBlocked(x,z,y){for(const station of moonRailway.stations){if(Math.hypot(x-station.model.position.x,z-station.model.position.z)>120)continue;const p=new THREE.Vector3(x,y,z).sub(station.model.position).applyAxisAngle(new THREE.Vector3(0,1,0),-station.yaw);for(const b of station.access.surfaces){if(p.y>=b.maxY-.05)continue;if(p.x>b.minX-.9&&p.x<b.maxX+.9&&p.z>b.minZ-.9&&p.z<b.maxZ+.9&&p.y+PLAYER_HEIGHT+.5>b.minY)return true;}}return false;}
    const heightCache=new Map();
    function safeHeight(x,z){const key=x.toFixed(3)+','+z.toFixed(3);if(heightCache.has(key))return heightCache.get(key);const y=Math.max(ground(x,z),ground(x-width/2,z),ground(x+width/2,z),ground(x,z-width/2),ground(x,z+width/2))+.055;if(heightCache.size>180000)heightCache.clear();heightCache.set(key,y);return y;}
    class Queue{
        constructor(){this.items=[];}
        push(v){const a=this.items;a.push(v);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}
        pop(){const a=this.items,first=a[0],v=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].f<a[j].f)j++;if(a[j].f>=v.f)break;a[i]=a[j];i=j;}a[i]=v;}return first;}
    }
    const directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
    for(const a of [3,4,6])for(const sx of [-1,1])for(const sz of [-1,1])directions.push([a*sx,sz],[sx,a*sz]);
    function survey(start,end,margin=140){
        const step=4,x0=Math.max(-3330,Math.min(start.x,end.x)-margin),x1=Math.min(3330,Math.max(start.x,end.x)+margin),z0=Math.max(-3310,Math.min(start.z,end.z)-margin),z1=Math.min(3310,Math.max(start.z,end.z)+margin);
        const nodes=new Map(),heap=new Queue(),goal=end.clone();goal.y=safeHeight(goal.x,goal.z);
        function node(ix,iz){const key=ix+','+iz;if(nodes.has(key))return nodes.get(key);const x=start.x+ix*step,z=start.z+iz*step;
            if(x<x0||x>x1||z<z0||z>z1)return null;
            const y=safeHeight(x,z),p=new THREE.Vector3(x,y,z),blocked=wet(x,z)||checkCollision(x,z,y,.8)||accessBlocked(x,z,y);
            const n={key,ix,iz,p,blocked,g:Infinity,parent:null};nodes.set(key,n);return n;
        }
        function edge(a,b){const d=Math.hypot(b.x-a.x,b.z-a.z);if(Math.abs(b.y-a.y)>d*.66+.02)return false;
            for(let i=1,n=Math.ceil(d/.5);i<n;i++){const t=i/n,x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t),y=safeHeight(x,z);if(wet(x,z)||Math.abs(y-THREE.MathUtils.lerp(a.y,b.y,t))>.28||checkCollision(x,z,y,.8)||checkCollision(x,z,y+.18,.8)||accessBlocked(x,z,y))return false;}
            return true;
        }
        const first=node(0,0);if(!first||first.blocked)return null;first.g=0;heap.push({n:first,f:start.distanceTo(goal)});let visited=0;
        while(heap.items.length&&visited++<14000){const {n}=heap.pop();if(n.closed)continue;n.closed=true;
            if(Math.hypot(n.p.x-goal.x,n.p.z-goal.z)<=step*2.3&&edge(n.p,goal)){
                const path=[goal];for(let q=n;q;q=q.parent)path.push(q.p);return path.reverse();
            }
            for(const [dx,dz] of directions){let turn=1;if(n.parent){const a=n.p.clone().sub(n.parent.p);a.y=0;turn=(a.x*dx+a.z*dz)/(a.length()*Math.hypot(dx,dz));if(turn<-.01)continue;}const q=node(n.ix+dx,n.iz+dz);if(!q||q.blocked||q.closed||n.g+n.p.distanceTo(q.p)>=q.g||!edge(n.p,q.p))continue;
                const d=n.p.distanceTo(q.p),grade=Math.abs(q.p.y-n.p.y)/Math.hypot(q.p.x-n.p.x,q.p.z-n.p.z),cost=n.g+d*(1+grade*.7)+Math.abs(q.p.y-n.p.y)*.25+(1-turn)*4;
                if(cost>=q.g)continue;q.g=cost;q.parent=n;heap.push({n:q,f:cost+q.p.distanceTo(goal)});
            }
        }
        return null;
    }
    function addSlab(route,a,b,top,steep,corners){
        const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<1e-5)return;
        const s={x:(a.x+b.x)/2,z:(a.z+b.z)/2,ux:dx/length,uz:dz/length,length,width,top,steep,route,corners};
        route.steps.push(s);
        for(let x=Math.floor(Math.min(...corners.map(p=>p.x))/cell);x<=Math.floor(Math.max(...corners.map(p=>p.x))/cell);x++)for(let z=Math.floor(Math.min(...corners.map(p=>p.z))/cell);z<=Math.floor(Math.max(...corners.map(p=>p.z))/cell);z++){
            const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(s);
        }
        return s;
    }
    function local(s,x,z){const dx=x-s.x,dz=z-s.z;return {along:dx*s.ux+dz*s.uz,across:dx*s.uz-dz*s.ux};}
    function contains(s,x,z){const [a,b,c,d]=s.corners;function tri(a,b,c){const den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-9)return false;const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den;return u>=-1e-5&&v>=-1e-5&&u+v<=1.00001;}return tri(a,b,c)||tri(b,d,c);}
    function support(x,z,y){let top=-Infinity;for(const s of cells.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[]){if(contains(s,x,z)&&y>=s.top-MAX_STEP_HEIGHT-.015)top=Math.max(top,s.top);}return top;}
    function corridorAt(x,z,padding=2){if(x>-2380)return false;const gx=Math.floor(x/cell),gz=Math.floor(z/cell),r=Math.ceil(padding/cell);for(let a=gx-r;a<=gx+r;a++)for(let b=gz-r;b<=gz+r;b++)for(const s of cells.get(a+','+b)||[]){const p=local(s,x,z);if(Math.abs(p.along)<=s.length/2+padding&&Math.abs(p.across)<=width/2+padding)return true;}return false;}
    function blocked(x,z,y,radius=PLAYER_RADIUS){const near=cells.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[];if(near.some(s=>contains(s,x,z)&&y>=s.top-MAX_STEP_HEIGHT-.02&&y<s.top+3))return false;for(const s of near){if(!s.steep||y>s.top+1.05||y+PLAYER_HEIGHT<s.top+.15)continue;const p=local(s,x,z);if(Math.abs(p.along)<s.length/2-.01&&Math.abs(p.across)>width/2-radius*.5&&Math.abs(p.across)<width/2+.1+radius)return true;}return false;}
    function matrix(x,y,z,w,h,d,yaw=0){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw),new THREE.Vector3(w,h,d));}
    function batch(root,name,g,mat,items){if(!items.length)return;const m=new THREE.InstancedMesh(g,mat,items.length);m.name=name;items.forEach((v,i)=>m.setMatrixAt(i,v));root.add(m);m.receiveShadow=true;return m;}
    function solidQuad(buffer,corners,top,bottom){const upper=corners.map(p=>new THREE.Vector3(p.x,top,p.z)),lower=corners.map(p=>new THREE.Vector3(p.x,bottom,p.z));for(const face of [[upper[0],upper[1],upper[3],upper[2]],[lower[0],lower[2],lower[3],lower[1]],[lower[0],upper[0],upper[2],lower[2]],[lower[1],lower[3],upper[3],upper[1]],[lower[0],lower[1],upper[1],upper[0]],[lower[2],upper[2],upper[3],lower[3]]]){const o=buffer.p.length/3;for(const p of face)buffer.p.push(p.x,p.y,p.z);buffer.i.push(o,o+1,o+2,o,o+2,o+3);}}
    function solidMesh(root,name,buffer,material){if(!buffer.i.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(buffer.p,3));g.setIndex(buffer.i);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.name=name;m.receiveShadow=true;root.add(m);}
    function sign(root,p,text){const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#243944';ctx.fillRect(0,0,768,160);ctx.strokeStyle='#bfa775';ctx.lineWidth=6;ctx.strokeRect(4,4,760,152);ctx.fillStyle='#f0dfb8';ctx.textAlign='center';ctx.font='bold 29px sans-serif';ctx.fillText(text,384,65);ctx.font='25px sans-serif';ctx.fillText('Đường đi bộ · Bậc đá và tay vịn',384,118);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.8,.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));m.position.copy(p).y+=1.5;root.add(m);}
    function build(path,kind,village){
        const route={kind,village:village.plan.id,name:kind==='station'?village.station.name:kind==='summit'?'Đỉnh '+village.plan.name:'Lối xuống chân núi',root:new THREE.Group(),nodes:path,steps:[],floors:[],tops:[],crossings:[],length:0,stairs:0};
        route.root.name='HighlandRoute_'+kind+'_'+route.village;group.add(route.root);const slabs={p:[],i:[]},bases={p:[],i:[]},posts=[],rails=[],noses=[];let lastPost=-10;
        const walkPath=[...path];
        if(kind==='station'){
            // Meet the station on its level approach, rather than ending on
            // the high side of the cross-slope at the old ramp's outer toe.
            const points=village.station.access.waypoints;walkPath.at(-1).y=Math.max(walkPath.at(-1).y,points[0].y);
            walkPath.push(...points.slice(1).map(p=>p.clone()));
        }
        route.endPoint=walkPath.at(-1).clone();
        route.baseSampleCount=path.slice(1).reduce((n,p,i)=>n+Math.ceil(Math.hypot(p.x-path[i].x,p.z-path[i].z)/.28),0);
        const saved=readyProfiles?packed.routes.find(r=>r.kind===kind&&r.village===village.plan.id):null,samples=saved?saved.profile.map(p=>new THREE.Vector3(...p)):[];
        if(!saved){for(let j=0;j<walkPath.length-1;j++){const a=walkPath[j],b=walkPath[j+1],len=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(len/.28);for(let i=0;i<n;i++)samples.push(a.clone().lerp(b,i/n));}samples.push(walkPath.at(-1).clone());}
        const profile=samples.map(p=>saved?p.y:Math.max(p.y,safeHeight(p.x,p.z)));
        if(junctionSamples&&!saved)for(let i=0;i<samples.length;i++){if(kind==='station'&&i>=route.baseSampleCount)continue;const p=samples[i],gx=Math.floor(p.x/2),gz=Math.floor(p.z/2),original=profile[i];for(let x=gx-1;x<=gx+1;x++)for(let z=gz-1;z<=gz+1;z++)for(const other of junctionSamples.get(x+','+z)||[]){if(other.kind===kind&&other.village===village.plan.id&&Math.abs(other.index-i)<8||Math.abs(other.p.y-original)>4.5)continue;const d=Math.hypot(p.x-other.p.x,p.z-other.p.z);if(d<1.9)profile[i]=Math.max(profile[i],other.p.y-.1*d);}const rail=nearRail(p.x,p.z);if(rail&&rail.distance<10&&Math.abs(original-rail.y)<1.5)profile[i]=Math.min(profile[i],original+.06);}
        if(!saved){for(let i=1;i<profile.length;i++)profile[i]=Math.max(profile[i],profile[i-1]-.66*Math.hypot(samples[i].x-samples[i-1].x,samples[i].z-samples[i-1].z));
        for(let i=profile.length-2;i>=0;i--)profile[i]=Math.max(profile[i],profile[i+1]-.66*Math.hypot(samples[i].x-samples[i+1].x,samples[i].z-samples[i+1].z));}
        for(let i=0;i<samples.length;i++)samples[i].y=profile[i];
        route.profileSamples=samples;
        if(!junctionSamples){route.profileSamples=samples;routes.push(route);return route;}
        const edges=samples.map((p,i)=>{const before=p.clone().sub(samples[Math.max(0,i-1)]),after=samples[Math.min(samples.length-1,i+1)].clone().sub(p);before.y=after.y=0;if(before.lengthSq()<1e-8)before.copy(after);if(after.lengthSq()<1e-8)after.copy(before);before.normalize();after.normalize();const sa=new THREE.Vector3(before.z,0,-before.x),sb=new THREE.Vector3(after.z,0,-after.x),side=sa.clone().add(sb);if(side.lengthSq()<.01)side.copy(sa);side.normalize().multiplyScalar(width/2/Math.max(.5,side.dot(sa)));return [p.clone().add(side),p.clone().sub(side)];});
        for(let j=0;j<samples.length-1;j++){
            const a=samples[j],b=samples[j+1],len=Math.hypot(b.x-a.x,b.z-a.z);if(len<.01)continue;const dx=(b.x-a.x)/len,dz=(b.z-a.z)/len,yaw=Math.atan2(dx,dz),steep=Math.abs(b.y-a.y)/len>.18,n=1;
            for(let i=0;i<n;i++){
                const p=a.clone().lerp(b,i/n),q=a.clone().lerp(b,(i+1)/n),x=(p.x+q.x)/2,z=(p.z+q.z)/2;
                const slot=route.steps.length,safe=Math.max(a.y,b.y),rail=nearRail(x,z),crossing=saved?Boolean(saved.crossings[slot]):rail&&rail.distance<5.8&&Math.abs(rail.y-ground(x,z))<1.8;
                const top=saved?saved.tops[slot]:crossing?Math.min(ground(x,z)+.025,rail.y-.04):Math.ceil((safe-1e-8)/riser)*riser+.025,guard=steep&&!(rail&&rail.distance<8&&Math.abs(safe-rail.y)<5);
                const corners=[...edges[j],...edges[j+1]],s=addSlab(route,p,q,top,guard,corners),floor=saved?saved.floors[slot]:Math.min(ground(x,z),...corners.map(p=>ground(p.x,p.z)))-.15;s.crossing=Boolean(crossing);s.railY=rail?.y;route.tops.push(top);route.floors.push(floor);route.crossings.push(crossing?1:0);
                solidQuad(slabs,corners,top,top-.14);
                if(top-floor>.16&&top-floor<3.6)solidQuad(bases,corners,top-.14,floor);
                if(steep&&!crossing){route.stairs++;noses.push(matrix(x,top+.003,z,width,.018,.035,yaw));}
                if(guard&&route.length-lastPost>=3.8){lastPost=route.length;for(const side of [-1,1])posts.push(matrix(x+dz*side*width/2,top+.5,z-dx*side*width/2,.055,1,.055));}
                route.length+=s.length;
            }
            const rail=nearRail((a.x+b.x)/2,(a.z+b.z)/2);if(steep&&!(rail&&rail.distance<8&&Math.abs(a.y-rail.y)<5))for(const side of [-1,1]){const from=a.clone().add(new THREE.Vector3(dz*side*width/2,.96,-dx*side*width/2)),to=b.clone().add(new THREE.Vector3(dz*side*width/2,.96,-dx*side*width/2)),mid=from.clone().lerp(to,.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());rails.push(new THREE.Matrix4().compose(mid,q,new THREE.Vector3(.052,from.distanceTo(to),.052)));}
        }
        solidMesh(route.root,'HighlandPathTreads',slabs,village.plan.z>1500?snow:rock);solidMesh(route.root,'HighlandPathFoundations',bases,rock);batch(route.root,'HighlandPathPosts',postGeo,metal,posts);batch(route.root,'HighlandPathHandrails',postGeo,trim,rails);batch(route.root,'HighlandPathNosing',cube,trim,noses);
        sign(route.root,path[0],route.name);routes.push(route);return route;
    }
    const signature=JSON.stringify(westernHighlands.villages.map(v=>[...v.center.toArray(),...v.station.access.entrance.toArray()].map(n=>Math.round(n*100)/100)));
    const terrainPositions=worldExpansion.terrain.geometry.attributes.position,terrainBits=new Uint32Array(terrainPositions.array.buffer,terrainPositions.array.byteOffset,terrainPositions.array.length);let hash=2166136261;for(let i=0;i<terrainPositions.count;i++)if(terrainPositions.getX(i)<-2380)hash=Math.imul(hash^terrainBits[i*3+1],16777619);const terrainHash=(hash>>>0).toString(16);
    const packed=window.HIGHLAND_WALKING_ROUTES,oldCenters=packed?.signature?JSON.parse(packed.signature):[],newCenters=JSON.parse(signature),cacheValid=oldCenters.length===newCenters.length&&oldCenters.every((a,i)=>a.slice(0,3).every((v,j)=>v===newCenters[i][j]))&&!new URLSearchParams(location.search).has('surveyTrails');
    const readyProfiles=cacheValid&&(!packed.terrainHash||packed.terrainHash===terrainHash)&&packed.signature===signature&&packed.version===6&&packed.width===width&&packed.routes.length===69&&packed.routes.every(r=>r.profile?.length>1&&r.floors?.length===r.tops?.length&&r.floors.length===r.profile.slice(1).filter((p,i)=>Math.hypot(p[0]-r.profile[i][0],p[2]-r.profile[i][2])>=.01).length);
    if(readyProfiles)junctionSamples=new Map();
    function routeTerrainChanged(row){
        if(!row?.profile||!row.floors)return true;const ps=row.profile.map(p=>new THREE.Vector3(...p));let slot=0;
        function edge(i){const p=ps[i],a=p.clone().sub(ps[Math.max(0,i-1)]),b=ps[Math.min(ps.length-1,i+1)].clone().sub(p);a.y=b.y=0;if(a.lengthSq()<1e-8)a.copy(b);if(b.lengthSq()<1e-8)b.copy(a);a.normalize();b.normalize();const sa=new THREE.Vector3(a.z,0,-a.x),sb=new THREE.Vector3(b.z,0,-b.x),s=sa.clone().add(sb);if(s.lengthSq()<.01)s.copy(sa);s.normalize().multiplyScalar(width/2/Math.max(.5,s.dot(sa)));return [p.clone().add(s),p.clone().sub(s)];}
        for(let i=0;i<ps.length-1;i++){if(Math.hypot(ps[i].x-ps[i+1].x,ps[i].z-ps[i+1].z)<.01)continue;if(slot%16===0){const corners=[...edge(i),...edge(i+1)],x=(ps[i].x+ps[i+1].x)/2,z=(ps[i].z+ps[i+1].z)/2,floor=Math.min(ground(x,z),...corners.map(p=>ground(p.x,p.z)))-.15;if(Math.abs(floor-row.floors[slot])>.2)return true;}slot++;}return false;
    }
    function cached(kind,village){const rows=cacheValid?packed.routes.find(r=>r.kind===kind&&r.village===village.plan.id)?.nodes:null;if(!Array.isArray(rows))return null;if(kind==='foothill'&&village.plan.id===12&&packed.version<6)return null;if(kind==='station'&&(new THREE.Vector3(...rows.at(-1)).distanceTo(village.station.access.entrance)>1||village.plan.id===21&&packed.version<2||village.plan.id===12&&packed.version<4))return null;if(packed.terrainHash&&packed.terrainHash!==terrainHash&&routeTerrainChanged(packed.routes.find(r=>r.kind===kind&&r.village===village.plan.id)))return null;return rows.map(p=>new THREE.Vector3(...p));}
    function connect(start,end,kind,village){const onlyCache=cacheValid&&new URLSearchParams(location.search).has('cachedTrailsOnly');const path=cached(kind,village)||(!onlyCache&&(survey(start,end)||survey(start,end,300)));if(!path){failures.push({kind,village:village.plan.id,start:start.toArray(),end:end.toArray(),startBlocked:checkCollision(start.x,start.z,safeHeight(start.x,start.z),.8),endBlocked:checkCollision(end.x,end.z,safeHeight(end.x,end.z),.8),startSafe:safeHeight(start.x,start.z),endSafe:safeHeight(end.x,end.z)});return null;}return build(path,kind,village);}
    for(const village of westernHighlands.villages){
        const start=village.center.clone().add(new THREE.Vector3(4,0,2));
        const station=connect(start,village.station.access.entrance,'station',village);village.stationWalkingRoute=station;
        if(station){village.stationPath=station.nodes.map((p,i,a)=>{const d=(a[Math.min(i+1,a.length-1)].clone().sub(a[Math.max(0,i-1)]));return {p,side:new THREE.Vector3(d.z,0,-d.x).normalize()};});const old=village.root.getObjectByName('VillageStationFootpath');if(old)old.visible=false;}
        // Every settlement gets a reachable lookout near the local ridge crest.
        const peaks=[];for(let dz=-70;dz<=70;dz+=35){const z=village.center.z+dz,x=westernHighlands.profile.crest(village.plan.side,z),p=new THREE.Vector3(x,ground(x,z),z);if(!wet(x,z)&&!checkCollision(x,z,p.y,.9)&&p.distanceTo(start)>28)peaks.push(p);}
        peaks.sort((a,b)=>b.y-a.y);let summit=null;const savedPeak=cached('summit',village);if(savedPeak)summit=build(savedPeak,'summit',village);else for(const p of peaks){const path=survey(start,p);if(path){summit=build(path,'summit',village);break;}}if(!summit)failures.push({kind:'summit',village:village.plan.id});village.summitWalkingRoute=summit;
        const old=westernHighlands.trails.find(t=>t.village.id===village.plan.id);if(old)old.root.visible=false;
        const outward=village.plan.side===0?1:-1,candidates=[120,160,200].map(d=>new THREE.Vector3(village.center.x+outward*d,0,village.center.z+80)).filter(p=>!wet(p.x,p.z));
        const savedBase=cached('foothill',village);if(savedBase)village.foothillWalkingRoute=build(savedBase,'foothill',village);else for(const end of candidates){end.y=ground(end.x,end.z);const path=survey(start,end);if(path){village.foothillWalkingRoute=build(path,'foothill',village);break;}}
    }
    // Shared prefixes and junctions meet at a common height. Independent wide
    // stair flights must not create an abrupt drop when their footprints meet.
    if(!readyProfiles){const plans=[...routes];junctionSamples=new Map();
    for(const route of plans)for(const [index,p] of route.profileSamples.entries()){if(route.kind==='station'&&index>=route.baseSampleCount)continue;const key=Math.floor(p.x/2)+','+Math.floor(p.z/2);if(!junctionSamples.has(key))junctionSamples.set(key,[]);junctionSamples.get(key).push({p,index,kind:route.kind,village:route.village});}
    routes.length=0;for(const route of plans){group.remove(route.root);const village=westernHighlands.villages.find(v=>v.plan.id===route.village),result=build(route.nodes,route.kind,village);if(route.kind==='station')village.stationWalkingRoute=result;else if(route.kind==='summit')village.summitWalkingRoute=result;else village.foothillWalkingRoute=result;}}
    // Collision uses the same exact tread rectangles as the renderer. No
    // special permission to climb bare slopes is attached to a route label.
    window.highlandTrails={group,routes,failures,support,blocked,corridorAt,width,riser,survey,nearRail,signature,fromCache:readyProfiles,usingSurveyedNodes:cacheValid,buildMs:performance.now()-started,export(){return {version:6,width,signature,terrainHash,routes:routes.map(r=>({kind:r.kind,village:r.village,nodes:r.nodes.map(p=>p.toArray()),profile:r.profileSamples.map(p=>p.toArray()),floors:r.floors,tops:r.tops,crossings:r.crossings}))};}};
}
