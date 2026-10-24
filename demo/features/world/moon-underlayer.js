// Physical lunar bedrock below every playable area, including the -5 m crypt.
function installMoonUnderlayer() {
    const top=Math.min(-12,EXPANDED_REALM_DATA.lake.depthFloor-6),bottom=top-6,size=EXPANDED_REALM_DATA.size;
    const material=new THREE.MeshStandardMaterial({map:moonTexture,color:0x747b85,roughness:1,side:THREE.DoubleSide});
    material.name='moon-bedrock';
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(size,top-bottom,size),material);
    mesh.name='MoonSafetyBedrock';mesh.position.y=(top+bottom)/2;mesh.receiveShadow=true;scene.add(mesh);
    addBoxCollider(0,0,size,size,bottom,top,true);
    const collider=colliders.at(-1);collider.name='moon-safety-bedrock';collider.stepHeight=MAX_STEP_HEIGHT;
    window.moonSafetyLayer={top,bottom,size,mesh,collider,
        contains(x,z){return Math.abs(x)<=size/2&&Math.abs(z)<=size/2;},
        catchFall(){
            const p=playerGroup.position;
            // Independent of frame rate or the normal terrain support: even
            // an already-invalid below-slab position cannot fall indefinitely.
            if(this.contains(p.x,p.z)&&p.y<top){p.y=top;isGrounded=true;jumpVelocityY=0;keys.jump=false;}
        }};
}
