/* Art-preserving articulation of legacy meshes exported as one body batch.
   Connected mesh islands retain every vertex, normal, color and triangle. */
const creatureMotionRigCache=new Map();
function creatureMotionRig(kind){
    if(creatureMotionRigCache.has(kind))return creatureMotionRigCache.get(kind);
    const source=CREATURE_STUDIO_DATA.models[kind];
    if(source?.articulation==='authored')return source;
    if(!['spider','cobra','stone_worm','frog','monkey','turtle','dwarf','robot','cursed_warrior','sapling','wolf','speed_wolf','sabertooth'].includes(kind)||!source?.parts.body)return source;
    const body=source.parts.body,count=body.p.length/3,parent=Array.from({length:count},(_,i)=>i);
    const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    const union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
    for(let i=0;i<body.i.length;i+=3){union(body.i[i],body.i[i+1]);union(body.i[i],body.i[i+2]);}
    const islands=new Map();
    for(let i=0;i<count;i++){const key=find(i);if(!islands.has(key))islands.set(key,{vertices:[],triangles:[],min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]});const island=islands.get(key);island.vertices.push(i);for(let a=0;a<3;a++){island.min[a]=Math.min(island.min[a],body.p[i*3+a]);island.max[a]=Math.max(island.max[a],body.p[i*3+a]);}}
    for(let i=0;i<body.i.length;i+=3)islands.get(find(body.i[i])).triangles.push(body.i[i],body.i[i+1],body.i[i+2]);
    const joints=Object.fromEntries(Object.entries(source.joints).map(([k,p])=>[k,p.slice()])),parts={...source.parts};delete parts.body;
    const bins=new Map();
    for(const island of islands.values()){
        const [x,y,z]=island.min.map((v,i)=>(v+island.max[i])/2),side=x<0?-1:1;let joint='body',pivot=[0,0,0];
        if(kind==='spider'&&Math.abs(x)>.4&&y<.72){const lower=Math.max(Math.abs(island.min[0]),Math.abs(island.max[0]))>.95,index=THREE.MathUtils.clamp(Math.round(z/(lower?.47:.31)+1.5),0,3);joint='leg'+((side<0?0:4)+index);pivot=[side*.18,.4,(index-1.5)*.2];}
        if(kind==='cobra'&&y>1.08){joint='head';pivot=[0,1.1,.35];}
        if(kind==='stone_worm'&&y>1.7){const index=y>3.2?2:1;joint=index===2?'head':'spine';pivot=[0,index===2?3.15:1.7,index===2?-.8:-.4];}
        if(kind==='frog'&&Math.abs(x)>.21&&y<.2){joint='leg'+((side<0?0:2)+(z>.12?1:0));pivot=[side*.16,.14,z>.12?.2:-.15];}
        if(kind==='monkey'&&Math.abs(x)>.29&&y<1){joint=side<0?'armL':'armR';pivot=[side*.28,.79,0];}
        if(['dwarf','robot'].includes(kind)&&Math.abs(x)>.39&&y<1.05){joint=side<0?'armL':'armR';pivot=[side*.31,.98,0];}
        if(['dwarf','robot'].includes(kind)&&y>1.1){joint='head';pivot=[0,1.15,.04];}
        if(kind==='cursed_warrior'&&Math.abs(x)>.39&&y<1.6){joint=side<0?'armL':'armR';pivot=[side*.31,.98,0];}
        if(kind==='cursed_warrior'&&Math.abs(x)<.39&&y>1.1){joint='head';pivot=[0,1.15,.04];}
        if(kind==='sapling'&&Math.abs(x)>.33&&y>.7){joint=side<0?'armL':'armR';pivot=[side*.2,.85,0];}
        if(['wolf','speed_wolf','sabertooth'].includes(kind)){const h=kind==='sabertooth'?.6:1.4;if((y>h*.66&&z>h*.3)||(y>h*.55&&z>h*.53)){joint='head';pivot=[0,h*.67,h*.46];}}
        if(kind==='turtle'&&Math.abs(x)>.5&&y<.25){joint='fin'+(side<0?'L':'R')+(z>0?'Front':'Rear');pivot=[side*.4,.18,z>0?.5:-.5];}
        if(!joints[joint])joints[joint]=pivot;
        if(!bins.has(joint))bins.set(joint,{p:[],n:[],c:[],i:[]});const out=bins.get(joint),offset=out.p.length/3,remap=new Map();
        for(const [index,v] of island.vertices.entries()){remap.set(v,offset+index);for(const attr of ['p','n','c'])out[attr].push(body[attr][v*3],body[attr][v*3+1],body[attr][v*3+2]);}
        for(const i of island.triangles)out.i.push(remap.get(i));
    }
    for(const [name,part] of bins)parts[name]=part;
    const spec={...source,joints,parts,gait:Object.keys(joints).filter(k=>k.startsWith('leg')),motionPartition:true};creatureMotionRigCache.set(kind,spec);return spec;
}
