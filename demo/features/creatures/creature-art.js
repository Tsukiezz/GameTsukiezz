/* Shared Blender meshes: world models and guide portraits use the same source. */
const creatureArtCache=new Map();
const creatureArt={
    get kinds(){return Object.keys(CREATURE_STUDIO_DATA.models);},
    create(kind,forward=1){
        const spec=CREATURE_STUDIO_DATA.models[kind];if(!spec)return null;
        const facing=forward<0?-1:1;
        const root=new THREE.Group();root.name='BlenderCreature_'+kind;root.userData.blenderCreature=kind;root.userData.creatureForward=facing;const joints=[];
        for(const [joint,part] of Object.entries(spec.parts)){
            const key=kind+':'+joint+':'+facing;let cached=creatureArtCache.get(key);
            // Bake the heading into vertices, normals and joint locations. A yaw
            // of PI on an animated XYZ pivot is decomposed to X/Z=PI when cloned;
            // writing its walking X angle then turns the legs upside down.
            if(!cached){const g=new THREE.BufferGeometry(),pivot=new THREE.Vector3(...spec.joints[joint]),p=part.p.map((v,i)=>(v-pivot.getComponent(i%3))*(i%3===1?1:facing)),n=part.n.map((v,i)=>v*(i%3===1?1:facing));g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(part.c,3));g.setIndex(part.i);g.computeBoundingSphere();cached={g,m:new THREE.MeshStandardMaterial({vertexColors:true,color:0x888888,roughness:.78,metalness:.02,emissive:0x17232b,emissiveIntensity:.1})};creatureArtCache.set(key,cached);}
            const pivot=new THREE.Group();pivot.name=joint==='body'?'body':'leg';pivot.userData.creatureJoint=joint;pivot.position.fromArray(spec.joints[joint]);pivot.position.x*=facing;pivot.position.z*=facing;const mesh=new THREE.Mesh(cached.g,cached.m);mesh.name='BlenderSurface_'+kind+'_'+joint;mesh.castShadow=true;pivot.add(mesh);root.add(pivot);if(joint!=='body')joints.push(pivot);
        }
        return {root,group:root,joints,limbs:joints,legs:joints};
    },
    merged(kind,forward=1){const model=this.create(kind,forward);if(!model)return null;model.root.updateMatrixWorld(true);const positions=[],normals=[],colors=[];model.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.toNonIndexed().applyMatrix4(m.matrixWorld);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);colors.push(...g.attributes.color.array);g.dispose();});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeBoundingSphere();return g;}
};
