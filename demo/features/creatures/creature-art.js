/* Shared Blender meshes: world models and guide portraits use the same source. */
const creatureArtCache=new Map();
let forestReferenceBarkTexture=null;
function forestReferenceBark(material){
    if(!forestReferenceBarkTexture){forestReferenceBarkTexture=new THREE.TextureLoader().load('features/forest/assets/ancient-bark.png',()=>{for(const id of ['forest_guardian','forest_sapling','forest_sapling_stump','forest_sapling_thorn','forest_sapling_mushroom'])window.libraryPreviews?.cache.delete(id);window.fieldGuide?.render();});forestReferenceBarkTexture.wrapS=forestReferenceBarkTexture.wrapT=THREE.RepeatWrapping;forestReferenceBarkTexture.anisotropy=4;}
    material.onBeforeCompile=shader=>{shader.uniforms.forestBark={value:forestReferenceBarkTexture};shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vForestBarkUV;').replace('#include <begin_vertex>','#include <begin_vertex>\nvForestBarkUV=uv;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D forestBark; varying vec2 vForestBarkUV;').replace('#include <color_fragment>',`#include <color_fragment>
        float woodMask=step(vColor.g*1.04,vColor.r)*step(vColor.b*1.12,vColor.g);
        float barkGrain=texture2D(forestBark,vForestBarkUV).r;
        diffuseColor.rgb*=mix(1.0,0.4+0.75*barkGrain,woodMask);
    `);};material.customProgramCacheKey=()=> 'forest-reference-bark-v1';
}
const creatureArt={
    get kinds(){return Object.keys(CREATURE_STUDIO_DATA.models);},
    create(kind,forward=1){
        const spec=typeof creatureMotionRig==='function'?creatureMotionRig(kind):CREATURE_STUDIO_DATA.models[kind];if(!spec)return null;
        const facing=forward<0?-1:1;
        const root=new THREE.Group();root.name='BlenderCreature_'+kind;root.userData.blenderCreature=kind;root.userData.creatureForward=facing;root.userData.creatureDesign=spec.design;const joints=[],rig={};
        for(const [joint,part] of Object.entries(spec.parts)){
            const key=kind+':'+joint+':'+facing;let cached=creatureArtCache.get(key);
            // Bake the heading into vertices, normals and joint locations. A yaw
            // of PI on an animated XYZ pivot is decomposed to X/Z=PI when cloned;
            // writing its walking X angle then turns the legs upside down.
            if(!cached){const g=new THREE.BufferGeometry(),pivot=new THREE.Vector3(...spec.joints[joint]),p=part.p.map((v,i)=>(v-pivot.getComponent(i%3))*(i%3===1?1:facing)),n=part.n.map((v,i)=>v*(i%3===1?1:facing));g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(part.c,3));g.setIndex(part.i);g.computeBoundingSphere();cached={g,m:part.emissive?new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}):new THREE.MeshStandardMaterial({vertexColors:true,color:0x888888,roughness:spec.roughness??.78,metalness:.02,emissive:0x17232b,emissiveIntensity:.1})};creatureArtCache.set(key,cached);}
            if(spec.design==='forest-reference-2026-11-02'&&!part.emissive&&!cached.g.attributes.uv){const uv=[];for(let i=0;i<part.p.length;i+=3)uv.push(part.p[i]*.23+part.p[i+2]*.17,part.p[i+1]*.22);cached.g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));forestReferenceBark(cached.m);}
            const walking=spec.gait?spec.gait.includes(joint):joint.startsWith('leg');const pivot=new THREE.Group();pivot.name=walking?'leg':joint;pivot.userData.creatureJoint=joint;pivot.position.fromArray(spec.joints[joint]);pivot.position.x*=facing;pivot.position.z*=facing;const mesh=new THREE.Mesh(cached.g,cached.m);mesh.name='BlenderSurface_'+kind+'_'+joint;mesh.castShadow=!part.emissive;pivot.add(mesh);root.add(pivot);rig[joint]=pivot;if(walking)joints.push(pivot);
        }
        for(const [name,parent] of Object.entries(spec.parents||{}))if(rig[name]&&rig[parent]){rig[parent].add(rig[name]);rig[name].position.set((spec.joints[name][0]-spec.joints[parent][0])*facing,spec.joints[name][1]-spec.joints[parent][1],(spec.joints[name][2]-spec.joints[parent][2])*facing);}
        return {root,group:root,joints,limbs:joints,legs:joints,rig};
    },
    merged(kind,forward=1){const model=this.create(kind,forward);if(!model)return null;model.root.updateMatrixWorld(true);const positions=[],normals=[],colors=[];model.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.toNonIndexed().applyMatrix4(m.matrixWorld);for(const [target,name] of [[positions,'position'],[normals,'normal'],[colors,'color']])for(const value of g.attributes[name].array)target.push(value);g.dispose();});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeBoundingSphere();return g;}
};
