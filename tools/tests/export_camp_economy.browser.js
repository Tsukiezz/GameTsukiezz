(()=>{
    const templates={},placements=[],decorations=[];
    function parts(root){root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),out=[];root.traverse(m=>{if(!m.isMesh||Array.isArray(m.material))return;const g=m.geometry,p=g.attributes.position,matrix=inverse.clone().multiply(m.matrixWorld),vertices=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);vertices.push(...v.toArray());}out.push({vertices,indices:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),color:m.material.color.toArray()});});return out;}
    for(const a of monsterCamps.actors){templates[a.kind]??=parts(a.group);placements.push({kind:a.kind,position:a.home.toArray()});}
    for(const c of monsterCamps.camps)decorations.push({position:c.center.toArray(),parts:parts(c.decor)});
    return {templates,placements,decorations,camps:monsterCamps.camps.length,respawnMinutes:30,fare:1,reward:'1 gold coin and 1 random item',foodSpots:foodPickups.spots.length};
})()
