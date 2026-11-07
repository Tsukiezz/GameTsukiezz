/* Shared frame-rate-independent movement, turning, camera aim and hand sockets. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installHeroMotion(){
    const velocity=new THREE.Vector3(),direction=new THREE.Vector3(),lastPosition=playerGroup.position.clone();
    const state={yaw:camYaw,pitch:camPitch,distance:camDistance,speed:0,weight:0,turn:0,phase:0,aiming:false};
    const deltaAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
    function stop(){velocity.set(0,0,0);heroMoveDirection.set(0,0,0);state.speed=0;state.weight=0;}
    function reset(){stop();state.yaw=camYaw;state.pitch=camPitch;state.distance=camDistance;state.turn=0;lastPosition.copy(playerGroup.position);}
    function look(dt){dt=THREE.MathUtils.clamp(dt,0,.1);if(lastPosition.distanceTo(playerGroup.position)>6)reset();const a=1-Math.exp(-24*dt);state.yaw+=deltaAngle(state.yaw,camYaw)*a;state.pitch+=(camPitch-state.pitch)*a;state.distance+=(camDistance-state.distance)*(1-Math.exp(-14*dt));}
    function step(x,z,speed,dt){
        dt=THREE.MathUtils.clamp(dt,0,.1);if(window.forestGuardian?.rooted){stop();x=0;z=0;keys.jump=false;keys.swimUp=false;}const requested=Boolean(x||z)&&!isSitting;
        direction.set(x*Math.cos(state.yaw)+z*Math.sin(state.yaw),0,-x*Math.sin(state.yaw)+z*Math.cos(state.yaw));if(direction.lengthSq()>1)direction.normalize();
        if(!requested)direction.set(0,0,0);const target=direction.clone().multiplyScalar(speed),rate=requested?(velocity.dot(target)<0?7:14):23;
        velocity.lerp(target,1-Math.exp(-rate*dt));if(!requested&&velocity.lengthSq()<.0004)velocity.set(0,0,0);
        const before=playerGroup.position.clone();if(!isSitting&&velocity.lengthSq()>0)movePlayerWithCollisions(velocity.x*dt,velocity.z*dt);
        const dx=playerGroup.position.x-before.x,dz=playerGroup.position.z-before.z;state.speed=dt>0?Math.hypot(dx,dz)/dt:0;state.weight=Math.min(1,state.speed/Math.max(.01,speed));heroMoveDirection.copy(velocity).divideScalar(Math.max(.01,speed));
        const aim=state.aiming||isRightMouseDown||isPointerLocked||window.solarFlashlight?.equipped||isAttacking;
        let targetAngle=playerGroup.rotation.y;if(aim)targetAngle=state.yaw+Math.PI;else if(requested)targetAngle=Math.atan2(direction.x,direction.z);
        const turn=deltaAngle(playerGroup.rotation.y,targetAngle)*(1-Math.exp(-13*dt));playerGroup.rotation.y+=turn;state.turn=dt>0?turn/dt:0;state.phase+=state.speed*dt*2.3;lastPosition.copy(playerGroup.position);
        const length=Math.max(.01,velocity.length()),yaw=playerGroup.rotation.y;return {moving:state.speed>.04,speed:state.weight,turn:state.turn,forward:(velocity.x*Math.sin(yaw)+velocity.z*Math.cos(yaw))/length,strafe:(velocity.x*Math.cos(yaw)-velocity.z*Math.sin(yaw))/length};
    }
    function hand(side,offset=new THREE.Vector3()){const arm=activeLimbs?.[side==='left'?'leftArm':'rightArm'];if(!arm)return null;playerGroup.updateMatrixWorld(true);return {position:arm.localToWorld(offset.clone()),quaternion:arm.getWorldQuaternion(new THREE.Quaternion())};}
    const rightGrips={hamster:[.15,0,.32],rabbit:[.15,.12,.445],dragon_knight:[.085,-.36,.21],ninja_yinyang:[.14,-.36,.29],kingkong:[.115,-.03,.65]};
    const hiltOffset=new THREE.Vector3();
    function alignWeapon(model,handleY){
        const arm=activeLimbs?.rightArm;
        if(!arm)return;
        arm.localToWorld(model.position.fromArray(rightGrips[activeHeroType]||rightGrips.hamster));
        model.quaternion.identity();
        for(let node=arm;node;node=node.parent)model.quaternion.premultiply(node.quaternion);
        model.position.sub(hiltOffset.set(0,handleY*model.scale.y,0).applyQuaternion(model.quaternion));
    }
    function syncWeapons(){
        for(const [model,equipped,handle] of [
            [window.gearSystem?.ironModel,window.gearSystem?.ironEquipped,.25],
            [window.weaponSystem?.model,window.weaponSystem?.equipped,.25],
            [window.volcanicValley?.heldSword,window.volcanicValley?.equipped,-.25]
        ]){
            if(!model)continue;
            model.visible=gameState.isPlaying&&playerGroup.visible&&Boolean(equipped);
            if(model.visible)alignWeapon(model,handle);
        }
    }
    const layers=new Map();
    function environment(){playerGroup.traverse(o=>{if(o.userData.defaultWeapon)o.visible=!(gameState.isPlaying&&(window.volcanicValley?.equipped||window.weaponSystem?.equipped||window.gearSystem?.ironEquipped));});const visible=gameState.isPlaying&&window.evilCavern?.inside()&&((window.solarFlashlight?.equipped&&window.solarFlashlight?.enabled)||window.templeSupplies?.visionActive);if(visible){playerGroup.traverse(o=>{if(!layers.has(o))layers.set(o,o.layers.mask);o.layers.enable(2);});}else{for(const [o,mask] of layers)o.layers.mask=mask;layers.clear();}}
    window.heroMotion={state,velocity,look,step,stop,reset,hand,alignWeapon,syncWeapons,environment,deltaAngle};reset();
}
