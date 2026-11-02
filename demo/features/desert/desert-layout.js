/* Shared geometry helpers: river-safe terrain, deterministic maze and path finding. */
function sampleDesertTerrain(meshes){
    const cells=new Map(),size=32;
    for(const mesh of meshes.filter(Boolean)){mesh.updateWorldMatrix(true,false);const g=mesh.geometry,p=g.attributes.position,index=g.index;
        for(let n=0;n<(index?.count??p.count);n+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(n+k):n+k).applyMatrix4(mesh.matrixWorld)),[a,b,c]=v,den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-8)continue;const t={a,b,c,den};for(let x=Math.floor(Math.min(a.x,b.x,c.x)/size);x<=Math.floor(Math.max(a.x,b.x,c.x)/size);x++)for(let z=Math.floor(Math.min(a.z,b.z,c.z)/size);z<=Math.floor(Math.max(a.z,b.z,c.z)/size);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);}}
    }
    return (x,z)=>{let y=-Infinity;for(const {a,b,c,den} of cells.get(Math.floor(x/size)+','+Math.floor(z/size))||[]){const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;if(u>=-1e-6&&v>=-1e-6&&w>=-1e-6)y=Math.max(y,u*a.y+v*b.y+w*c.y);}return Number.isFinite(y)?y:realmTerrainHeight(x,z);};
}
function createPyramidMaze(cx,cz,base,options={}){
    const n=options.n??11,step=options.step??12,roomHeight=options.roomHeight??9,half=n*step/2,entrance=(n-1)*n+Math.floor(n/2),treasure=Math.floor(n/2),adj=Array.from({length:n*n},()=>[]),seen=new Set([entrance]),stack=[entrance];let seed=67291+(options.level??0)*997;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    while(stack.length){const a=stack.at(-1),x=a%n,z=Math.floor(a/n),next=[[x-1,z],[x+1,z],[x,z-1],[x,z+1]].filter(([i,j])=>i>=0&&j>=0&&i<n&&j<n).map(([i,j])=>j*n+i).filter(b=>!seen.has(b));if(!next.length){stack.pop();continue;}const b=next[Math.floor(random()*next.length)];adj[a].push(b);adj[b].push(a);seen.add(b);stack.push(b);}
    const point=id=>new THREE.Vector3(cx+(id%n-(n-1)/2)*step,base,cz+(Math.floor(id/n)-(n-1)/2)*step);
    const cell=(x,z)=>{const i=Math.floor((x-cx+half)/step),j=Math.floor((z-cz+half)/step);return i>=0&&j>=0&&i<n&&j<n?j*n+i:null;};
    function path(a,b){if(a===null||b===null)return [];const prev=new Map([[a,null]]),queue=[a];for(let i=0;i<queue.length&&!prev.has(b);i++)for(const q of adj[queue[i]])if(!prev.has(q)){prev.set(q,queue[i]);queue.push(q);}if(!prev.has(b))return [];const out=[];for(let p=b;p!==null;p=prev.get(p))out.unshift(p);return out;}
    const center=Math.floor(n*n/2);if(n>1){for(const q of [...adj[center]])adj[q]=adj[q].filter(x=>x!==center);adj[center]=[];const offsets=[-n-1,-n,-n+1,1,n+1,n,n-1,-1],ring=offsets.map(i=>center+i);for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if(!adj[a].includes(b)){adj[a].push(b);adj[b].push(a);}}adj[center].push(center+1);adj[center+1].push(center);}
    const boxes=[];const box=(x,z,w,d,name)=>boxes.push({name,center:[cx+x,base+roomHeight/2,cz+z],size:[w,roomHeight,d]});
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*n+i,x=-half+i*step,z=-half+j*step;if(j===0)box(x+step/2,z,step+.8,.8,'MazeNorth');if(i===0)box(x,z+step/2,.8,step+.8,'MazeWest');if(i===n-1||!adj[a].includes(a+1))box(x+step,z+step/2,.8,step+.8,'MazeEast');if(j===n-1){if(options.level||a!==entrance)box(x+step/2,z+step,step+.8,.8,'MazeSouth');}else if(!adj[a].includes(a+n))box(x+step/2,z+step,step+.8,.8,'MazeInner');}
    if(!options.level)for(const side of [-1,1])box(side*6.4,(half+100)/2,1,100-half,'EntryWall');
    // Close the shell opening either side of the actual passage.
    if(!options.level)for(const side of [-1,1])box(side*9,98,6,2,'EntryJamb');
    return {n,step,half,roomHeight,base,center,level:options.level??0,adj,entrance,treasure,point,cell,path,boxes,solution:path(entrance,treasure)};
}
function makeDesertMeshBins(parent){
    const bins=new Map();
    function add(geometry,matrix,color,name='DesertStone'){
        const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.applyMatrix4(matrix);g.computeVertexNormals();let b=bins.get(name);if(!b){b={p:[],c:[],color:new THREE.Color(color)};bins.set(name,b);}const p=g.attributes.position,n=g.attributes.normal;
        for(let i=0;i<p.count;i++){b.p.push(p.getX(i),p.getY(i),p.getZ(i));const shade=.58+.22*Math.max(0,n.getY(i))+.09*Math.max(0,n.getZ(i));b.c.push(b.color.r*shade,b.color.g*shade,b.color.b*shade);}g.dispose();
    }
    function finish(){const meshes=[];for(const [name,b] of bins){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.computeVertexNormals();g.computeBoundingBox();const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false,side:THREE.DoubleSide}));m.name=name;parent.add(m);meshes.push(m);}return meshes;}
    return {add,finish};
}
