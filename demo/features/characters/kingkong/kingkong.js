/* Same shared rig contract as the other playable characters. */
function buildKingKongModel(){
    const root=new THREE.Group(),nodes={},palette={},bins=new Map(),data=KINGKONG;root.name='KingKongGuardian';
    for(const [name,pivot] of Object.entries(data.pivots)){const node=new THREE.Group();node.name='kong-'+name;node.position.fromArray(pivot);root.add(node);nodes[name]=node;}
    for(const name of ['head','arm_L','arm_R']){nodes[name].position.sub(nodes.body.position);nodes.body.add(nodes[name]);}
    for(const [name,color] of Object.entries(data.colors)){palette[name]=new THREE.MeshStandardMaterial({color:parseInt(color,16),roughness:.65,metalness:['gold','silver','steel'].includes(name)?.4:0,side:THREE.DoubleSide});palette[name].color.convertSRGBToLinear();}
    for(const part of data.parts){const key=part.bone+':'+part.material;if(!bins.has(key))bins.set(key,{bone:part.bone,material:part.material,positions:[],indices:[]});const bin=bins.get(key),offset=bin.positions.length/3;bin.positions.push(...part.vertices.flat());bin.indices.push(...part.indices.map(i=>i+offset));}
    for(const bin of bins.values()){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(bin.positions,3));geo.setIndex(bin.indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,palette[bin.material]);mesh.castShadow=true;mesh.receiveShadow=true;nodes[bin.bone].add(mesh);}
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.7,24),new THREE.MeshBasicMaterial({color:0x010308,transparent:true,opacity:.45,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;root.add(shadow);
    root.swordArm=nodes.arm_R;root.limbs={body:nodes.body,leftLeg:nodes.leg_L,rightLeg:nodes.leg_R,leftArm:nodes.arm_L,rightArm:nodes.arm_R,shadow};root.userData.bones=nodes;return root;
}
function heroIncomingDamage(amount){return activeHeroType==='kingkong'?amount*.8:amount;}
