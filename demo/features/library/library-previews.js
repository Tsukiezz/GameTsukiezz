/* Real renders of the game's meshes and environments, never symbolic art. */
function installLibraryPreviews(){
    const cache=new Map(),width=384,height=240,target=new THREE.WebGLRenderTarget(width,height,{depthBuffer:true});
    const pixels=new Uint8Array(width*height*4),previewCamera=new THREE.PerspectiveCamera(40,width/height,.05,4000);
    function capture(world){
        const previous=renderer.getRenderTarget(),viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),scissorTest=renderer.getScissorTest();
        try{
            // RenderTarget owns its pixel viewport. setViewport would incorrectly
            // scale it again by the game's adaptive device pixel ratio.
            renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.clear();renderer.render(world,previewCamera);renderer.readRenderTargetPixels(target,0,0,width,height,pixels);
            const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d'),data=context.createImageData(width,height);
            for(let y=0;y<height;y++)data.data.set(pixels.subarray((height-y-1)*width*4,(height-y)*width*4),y*width*4);
            context.putImageData(data,0,0);return canvas.toDataURL('image/png');
        }finally{renderer.setRenderTarget(previous);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);}
    }
    function portrait(source){
        if(!source)return null;const world=new THREE.Scene();world.background=new THREE.Color(0x152530);
        world.add(new THREE.HemisphereLight(0xd8edff,0x565040,1.7));const key=new THREE.DirectionalLight(0xffedcc,2);key.position.set(10,25,20);world.add(key);
        const model=source.clone(true);model.visible=true;model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.setScalar(1);world.add(model);model.updateMatrixWorld(true);
        const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
        const distance=Math.max(size.y/(2*Math.tan(THREE.MathUtils.degToRad(20))),size.x/(2*Math.tan(THREE.MathUtils.degToRad(20))*width/height),size.z*.65)*1.25;
        const direction=new THREE.Vector3(.9,.28,1).normalize();let fit=distance;
        // Fit every box corner, including the crocodile's projecting muzzle.
        for(let attempt=0;attempt<24;attempt++){
            previewCamera.position.copy(center).addScaledVector(direction,fit);previewCamera.lookAt(center);previewCamera.updateProjectionMatrix();previewCamera.updateMatrixWorld(true);
            let clipped=false;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const q=new THREE.Vector3(x,y,z).project(previewCamera);if(Math.abs(q.x)>.92||Math.abs(q.y)>.92||q.z>1)clipped=true;}
            if(!clipped)break;fit*=1.12;
        }
        return capture(world);
    }
    function place(index){
        const lm=landmarksData[index];if(!lm)return null;
        const views={0:[[28,24,40],[0,8,0]],1:[[-50,44,35],[-110,19,120]],2:[[195,90,16],[115,15,110]],3:[[-105,38,20],[-145,12,-35]],4:[[-50,33,-40],[-85,10,-95]],5:[[-205,105,-212],[-370,23,-455]],6:[[282,85,-100],[202,53,-206]],7:[[166,32,-65],[125,10,-110]],8:[[-70,38,-65],[-120,15,-125]]};
        const extra={bach_khuyet:[[870,275,900],[610,110,610]],thermal_waterfall:[[-510,180,880],[-745,137,650]],thermal_spring:[[-700,285,725],[-765,235,660]]};
        const [eye,look]=extra[lm.id]||views[index]||[[lm.x+35,30,lm.z+50],[lm.x,8,lm.z]];previewCamera.position.fromArray(eye);previewCamera.lookAt(new THREE.Vector3(...look));
        const fog=scene.fog,uniform=window.riverRealm?.waterMeshes[0]?.material.uniforms.fogDensity,oldDensity=uniform?.value;try{scene.fog=new THREE.FogExp2(0x101827,.0012);if(uniform)uniform.value=.0012;return capture(scene);}finally{scene.fog=fog;if(uniform)uniform.value=oldDensity;}
    }
    function get(id){
        if(cache.has(id))return cache.get(id);let image;
        const monster=lakeMonsters.actors.find(m=>m.spec.id===id);
        if(monster)image=portrait(monster.group);
        else if(id==='space_sabertooth')image=portrait(bachKhuyet.tiger.group);
        else if(id==='speed_wolf')image=portrait(riverRealm.wolf.group);
        else if(id==='forest_sapling')image=portrait(monsterSkills.previewMinion());
        else if(id==='red_rumped_monkey')image=portrait(riverRealm.monkeys[0]?.group);
        else if(id.startsWith('river_fish_'))image=portrait(riverRealm.previewAquatic(Number(id.slice(11))));
        else if(id==='river_kelp'||id==='thermal_coral')image=portrait(riverRealm.previewAquatic(id==='river_kelp'?'kelp':'coral'));
        else if(id==='forest_guardian')image=portrait(forestGuardian.awakeModel);
        else if(id.startsWith('wildlife_'))image=portrait(forestWildlife.preview(id.slice(9)));
        else if(id==='royal_guards')image=portrait(castleGatekeepers[0]?.group);
        else if(id==='lunar_unicorn')image=portrait(lunarUnicorn?.group);
        else if(id.startsWith('place_'))image=place(Number(id.slice(6)));
        if(image)cache.set(id,image);return image;
    }
    window.libraryPreviews={get,cache};
}
