/* Linked Blender plants, spatial ground cover, and drifting cherry petals. */
function installMoonwellLife({data,group,materials,ground}){
    const vegetation=data.vegetation,root=new THREE.Group();root.name='MoonwellLivingMountain';group.add(root);
    if(!vegetation)return {root,update(){}};
    const dummy=new THREE.Object3D(),meshes=[],treeColliders=[];
    for(const [kind,pieces] of Object.entries(vegetation.prototypes)){
        const placements=vegetation.instances.filter(p=>p.kind===kind),bounds=new THREE.Box3();
        for(const p of placements){bounds.expandByPoint(new THREE.Vector3(p.x-8,p.y-1,p.z-8));bounds.expandByPoint(new THREE.Vector3(p.x+8,p.y+15,p.z+8));}
        for(const piece of pieces){
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(piece.vertices.flat(),3));geo.setIndex(piece.indices);geo.computeVertexNormals();geo.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());
            const material=materials[piece.material];material.side=THREE.DoubleSide;if(piece.material.startsWith('blossom')){material.emissive.copy(material.color);material.emissiveIntensity=.5;}
            const mesh=new THREE.InstancedMesh(geo,material,placements.length);mesh.name='MoonwellFlora_'+kind+'_'+piece.material;mesh.userData.optionalFlora=kind==='grass'||kind==='fern';mesh.visible=!mesh.userData.optionalFlora||currentProfileKey!=='potato';
            placements.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
            mesh.castShadow=kind==='cherry'||kind==='pine';mesh.receiveShadow=true;root.add(mesh);meshes.push(mesh);
        }
        if(kind==='cherry'||kind==='pine')for(const p of placements){addCylinderCollider(p.x,p.z,.46*p.scale,p.y-.3,p.y+5.5*p.scale,false);const c=colliders.at(-1);c.name='moonwell-tree-'+kind;treeColliders.push(c);}
    }
    const cherries=vegetation.instances.filter(p=>p.kind==='cherry'),petalCount=180,positions=new Float32Array(petalCount*3),seeds=[];
    for(let i=0;i<petalCount;i++){const tree=cherries[i%cherries.length];seeds.push({tree,phase:i*.618,angle:i*2.4});positions.set([tree.x,tree.y+6*tree.scale,tree.z],i*3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const petals=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xffb9d2,size:.13,transparent:true,opacity:.8,depthWrite:false}));petals.name='MoonwellCherryPetals';petals.frustumCulled=false;root.add(petals);
    let time=0;
    function update(dt){
        time+=dt;petals.visible=currentProfileKey!=='potato'&&Math.hypot(playerGroup.position.x+760,playerGroup.position.z-650)<240;
        if(!petals.visible)return;
        seeds.forEach((s,i)=>{const tree=s.tree,age=(time*.65+s.phase)%(7*tree.scale),x=tree.x+Math.cos(s.angle)*2.2+Math.sin(time*.5+s.phase)*1.2+age*.16,z=tree.z+Math.sin(s.angle)*2.2+Math.cos(time*.3+s.phase)*.7;positions.set([x,Math.max(ground(x,z)+.08,tree.y+7*tree.scale-age),z],i*3);});geometry.attributes.position.needsUpdate=true;
    }
    return {root,meshes,treeColliders,petals,update};
}
