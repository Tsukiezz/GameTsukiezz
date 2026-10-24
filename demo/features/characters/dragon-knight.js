// Uses the actual meshes and articulation pivots exported by Blender.
function buildDragonKnightModel() {
    const root=new THREE.Group(),nodes={},palette={},bins=new Map(),data=DRAGON_KNIGHT;
    root.name='DragonKnight';
    for(const [name,pivot] of Object.entries(data.pivots)) {
        const node=new THREE.Group();node.name='dragon-'+name;node.position.fromArray(pivot);root.add(node);nodes[name]=node;
    }
    for(const name of ['head','arm_L','arm_R','wing_L','wing_R','tail']) {
        nodes[name].position.sub(nodes.body.position);nodes.body.add(nodes[name]);
    }
    for(const [name,color] of Object.entries(data.colors))palette[name]=new THREE.MeshStandardMaterial({color:parseInt(color,16),roughness:.6,metalness:['silver','gold','steel'].includes(name)?.4:0,side:THREE.DoubleSide});
    for(const material of Object.values(palette))material.color.convertSRGBToLinear();
    for(const part of data.parts) {
        const key=part.bone+':'+part.material;
        if(!bins.has(key))bins.set(key,{bone:part.bone,material:part.material,positions:[],indices:[]});
        const bin=bins.get(key),offset=bin.positions.length/3;
        bin.positions.push(...part.vertices.flat());bin.indices.push(...part.indices.map(i=>i+offset));
    }
    for(const bin of bins.values()) {
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(bin.positions,3));g.setIndex(bin.indices);g.computeVertexNormals();
        const mesh=new THREE.Mesh(g,palette[bin.material]);mesh.castShadow=true;mesh.receiveShadow=true;nodes[bin.bone].add(mesh);
    }
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.7,24),new THREE.MeshBasicMaterial({color:0x010308,transparent:true,opacity:.45,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;root.add(shadow);
    root.swordArm=nodes.arm_R;
    root.limbs={body:nodes.body,leftLeg:nodes.leg_L,rightLeg:nodes.leg_R,leftArm:nodes.arm_L,rightArm:nodes.arm_R,shadow};
    root.userData.bones=nodes;
    return root;
}
