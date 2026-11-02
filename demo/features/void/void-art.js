/* Actual Blender triangulation, merged by material and shared between instances. */
const voidModelCache=new Map();
function voidModel(kind){
    if(voidModelCache.has(kind))return voidModelCache.get(kind).clone(true);
    const root=new THREE.Group(),bins=new Map();root.name='Blender_'+kind;root.userData.blenderAuthored=true;
    for(const p of (kind==='rage_plate'?VOID_ASSETS.models.rage_armor.filter(p=>/ChestPlate|BreastSeal|Pauldron|ShoulderMeteor|Torso/.test(p.name)):VOID_ASSETS.models[kind])){let b=bins.get(p.role);if(!b)bins.set(p.role,b={v:[],i:[]});const n=b.v.length/3;b.v.push(...p.vertices.flat());b.i.push(...p.indices.map(i=>i+n));}
    for(const [role,b] of bins){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.v,3));g.setIndex(b.i);g.computeVertexNormals();const colors=[],n=g.attributes.normal,c=new THREE.Color(VOID_ASSETS.materials[role]);for(let i=0;i<n.count;i++){const shade=.65+.25*Math.max(0,n.getY(i))+.1*Math.max(0,n.getZ(i));colors.push(c.r*shade,c.g*shade,c.b*shade);}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const m=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});const mesh=new THREE.Mesh(g,m);mesh.name=kind+'_'+role;root.add(mesh);}
    voidModelCache.set(kind,root);return root.clone(true);
}
function voidInstances(parent,kind,transforms){const template=voidModel(kind);for(const part of template.children){const mesh=new THREE.InstancedMesh(part.geometry,part.material,transforms.length);transforms.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.name='BlenderInstances_'+kind;mesh.frustumCulled=false;parent.add(mesh);}return parent;}
function voidLabel(text,width=8){const c=document.createElement('canvas');c.width=1024;c.height=160;const p=c.getContext('2d');p.fillStyle='#142334';p.fillRect(0,0,1024,160);p.strokeStyle='#bcaa7f';p.lineWidth=8;p.strokeRect(5,5,1014,150);p.textAlign='center';p.fillStyle='#e4dbbd';p.font='bold 48px sans-serif';p.fillText(text,512,100);return new THREE.Mesh(new THREE.PlaneGeometry(width,width*160/1024),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));}
function voidBox(root,name,x,y,z,w,h,d,color){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7}));mesh.name=name;mesh.position.set(x,y,z);root.add(mesh);return mesh;}
function voidReserved(x,z,margin=0){const p=window.voidDistrictPlan;if(!p)return false;const q=new THREE.Vector3(x-p.center.x,0,z-p.center.z).applyAxisAngle(new THREE.Vector3(0,1,0),-p.yaw);return Math.abs(q.x)<175+margin&&Math.abs(q.z)<105+margin;}
function planVoidPromenade(start,end,floor,blocked){
    const step=4,key=(x,z)=>x+','+z,sx=Math.round(start.x/step),sz=Math.round(start.z/step),ex=Math.round(end.x/step),ez=Math.round(end.z/step),nodes=new Map(),open=[],margin=30;
    function at(x,z){const k=key(x,z);if(nodes.has(k))return nodes.get(k);const px=x*step,pz=z*step,y=floor(px,pz),nearEnd=Math.hypot(px-end.x,pz-end.z)<10,valid=nearEnd||!blocked(px,pz,y,.65)&&!checkCollision(px,pz,y,.65);const n={x,z,y,key:k,g:Infinity,f:Infinity,parent:null,closed:false,valid};nodes.set(k,n);return n;}
    const first=at(sx,sz);first.g=0;first.f=Math.hypot(ex-sx,ez-sz);open.push(first);let found=null;
    for(let iteration=0;open.length&&iteration<18000;iteration++){
        let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;const p=open.splice(best,1)[0];if(p.closed)continue;p.closed=true;if(Math.hypot(p.x-ex,p.z-ez)<=1){found=p;break;}
        for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=p.x+dx,z=p.z+dz;if(x<Math.min(sx,ex)-margin||x>Math.max(sx,ex)+margin||z<Math.min(sz,ez)-margin||z>Math.max(sz,ez)+margin)continue;const n=at(x,z);if(n.closed||!n.valid||Math.abs(n.y-p.y)>step*.55)continue;if(dx&&dz&&(!at(p.x+dx,p.z).valid||!at(p.x,p.z+dz).valid))continue;const g=p.g+Math.hypot(dx,dz)+Math.abs(n.y-p.y)*.25;if(g<n.g){n.g=g;n.f=g+Math.hypot(x-ex,z-ez);n.parent=p;open.push(n);}}
    }
    window.voidPromenadeDebug={start:start.toArray(),end:end.toArray(),visited:[...nodes.values()].filter(n=>n.closed).length,closest:[...nodes.values()].filter(n=>n.closed).sort((a,b)=>Math.hypot(a.x-ex,a.z-ez)-Math.hypot(b.x-ex,b.z-ez)).slice(0,3).map(n=>({x:n.x*step,z:n.z*step,y:n.y,d:Math.hypot(n.x-ex,n.z-ez)*step}))};if(!found)return null;const chain=[];for(let n=found;n;n=n.parent)chain.push(new THREE.Vector3(n.x*step,n.y,n.z*step));chain.reverse();chain[0]=start.clone();chain.push(end.clone());const points=[];for(let i=0;i<chain.length-1;i++){const a=chain[i],b=chain[i+1],count=Math.max(1,Math.ceil(a.distanceTo(b)/1.5));for(let j=0;j<count;j++){const p=a.clone().lerp(b,j/count);points.push(p);}}points.push(end.clone());return points;
}

/* Choose a completely dry unoccupied district beside an existing straight route.
   Adds a stop, never replaces any of the old stops or changes protected curves. */
function planVoidDistrict(services,height,survey,waterAt,specs){
    const all=services.flatMap(s=>s.points),cell=100,grid=new Map();for(const p of all){const k=Math.floor(p.x/cell)+','+Math.floor(p.z/cell);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(p);}
    const nearRail=(x,z,r)=>{for(let a=Math.floor((x-r)/cell);a<=Math.floor((x+r)/cell);a++)for(let b=Math.floor((z-r)/cell);b<=Math.floor((z+r)/cell);b++)if((grid.get(a+','+b)||[]).some(p=>Math.hypot(p.x-x,p.z-z)<r))return true;return false;};
    let best=null;
    for(const service of services)for(let i=100;i<service.points.length-100;i+=45){const p=service.points[i];if(p.z> -1200||Math.abs(p.x)>2150||specs.some(s=>Math.hypot(s.position[0]-p.x,s.position[2]-p.z)<380))continue;const a=service.points[i-35],b=service.points[i+35],d=b.clone().sub(a);d.y=0;d.normalize();if(service.points.slice(i-35,i+36).some(q=>Math.abs((q.x-p.x)*d.z-(q.z-p.z)*d.x)>.2))continue;
        const yaw=Math.atan2(d.x,d.z);
        for(const sign of [-1,1]){const center=p.clone().add(new THREE.Vector3(d.z*sign*290,0,-d.x*sign*290)),local=(x,z)=>new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(center);let valid=true,lo=Infinity,hi=-Infinity;
            for(let x=-155;x<=155&&valid;x+=25)for(let z=-85;z<=85;z+=25){const q=local(x,z),h=height(q.x,q.z);if(Math.abs(q.x)>3150||Math.abs(q.z)>3150||waterAt(q.x,q.z)||nearRail(q.x,q.z,65)||survey.top(q.x,q.z,8,h+150,h+.4)>h+.4){valid=false;break;}lo=Math.min(lo,h);hi=Math.max(hi,h);}
            if(!valid||hi-lo>5)continue;const score=(hi-lo)*100+Math.abs(p.x)*.01;if(!best||score<best.score)best={score,center,yaw,lineId:service.id,railPoint:p.clone(),level:hi+.12};
        }
    }
    if(!best)throw Error('Void district: no safe dry site beside railway');
    window.voidDistrictPlan=best;specs.push({name:'Ga Chung Cư Hư Không',lineId:best.lineId,position:best.railPoint.toArray(),maxDistance:220});return best;
}
