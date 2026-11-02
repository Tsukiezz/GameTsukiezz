(()=>{
    enterGame();setGraphicsProfile('potato');
    const f=solarFlashlight,c=evilCavern,results=[];
    const check=(name,ok,detail)=>{results.push({name,ok,detail});if(!ok)throw new Error(name+' '+JSON.stringify(detail));};
    const place=p=>{playerGroup.position.copy(p);currentGroundY=p.y;isGrounded=true;jumpVelocityY=0;};
    const renderPixels=()=>{f.update();c.environment();const target=new THREE.WebGLRenderTarget(160,100),old=renderer.getRenderTarget(),pixels=new Uint8Array(160*100*4);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,160,100,pixels);renderer.setRenderTarget(old);target.dispose();let max=0,lit=0;for(let i=0;i<pixels.length;i+=4){const v=Math.max(pixels[i],pixels[i+1],pixels[i+2]);max=Math.max(max,v);if(v>15)lit++;}return {max,lit};};
    check('Blender model is used by the actual equipment',SOLAR_FLASHLIGHT_DATA.source==='Blender'&&f.held.children.length>=39);
    f.interact(f.item);check('Cannot pick up remotely',!f.owned);
    place(f.item.pos.clone().add(new THREE.Vector3(0,0,1.3)));checkInteractables();check('Temple pickup has priority over other interactions',nearbyItem===f.item);
    handleInteraction();check('E interaction acquires the relic',f.owned&&!f.relic.visible);
    f.row.querySelector('button').click();check('Backpack equips the flashlight',f.equipped&&f.enabled);
    check('Pedestal approach is not blocked',!checkCollision(playerGroup.position.x,playerGroup.position.z,playerGroup.position.y));
    for(const a of c.warriors){a.health=0;a.collider.disabled=true;}c.worm.health=0;
    place(c.center(c.data.entry));camera.position.copy(playerGroup.position).add(new THREE.Vector3(0,1,2));camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0,1,-8)));c.environment();f.update();
    check('Aimed spotlight reaches underground layer',f.light.layers.test(camera.layers)&&f.light.visible&&f.light.castShadow);
    check('Walls have physical UV textures and cast shadows',c.cameraObstacles.every(m=>m.geometry.attributes.uv&&m.castShadow)&&c.cameraObstacles.some(m=>m.material.bumpMap));
    check('Low graphics retains flashlight wall shadows',renderer.shadowMap.enabled);
    const on=renderPixels();check('Actual GPU render illuminates the cave',on.max>35&&on.lit>100,on);
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'l'}));check('L turns off the light',!f.enabled);const off=renderPixels();check('Switching off restores complete darkness',off.max<=1,off);
    check('Shadow preference restored when light is off',!renderer.shadowMap.enabled);
    f.touchButton.click();check('Touch control turns on the light',f.enabled);
    const before=f.light.target.position.clone().sub(f.light.position);camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(8,2,0)));f.update();const after=f.light.target.position.clone().sub(f.light.position);check('Light follows camera aiming',before.dot(after)<.3);
    f.equip(false);check('Unequipping removes model and light',!f.light.visible&&!f.held.visible&&!f.enabled);
    f.equip(true);camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0,1,-8)));f.update();c.environment();renderer.render(scene,camera);
    return {results,on,off};
})()
