// Shared time-based poses for all playable characters. Physics owns world position.
const heroAnimationBindings=new WeakMap();
function registerHeroAnimation(model) {
    const limbs=model.limbs,rest={};
    for(const [name,node] of Object.entries(limbs))if(node?.isObject3D)
        rest[name]={position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()};
    const bones=model.userData.bones||{};
    heroAnimationBindings.set(limbs,{rest,phase:0,wasGrounded:true,landing:0,bones,model,wasAttacking:false,punchSide:0});
}
function resetHeroAnimation(model) {
    const state=heroAnimationBindings.get(model.limbs);if(!state)return;
    for(const [name,rest] of Object.entries(state.rest)) {
        const node=model.limbs[name];node.position.copy(rest.position);node.rotation.copy(rest.rotation);node.scale.copy(rest.scale);
    }
    state.phase=0;state.landing=0;state.wasGrounded=true;state.wasAttacking=false;state.punchSide=0;
    model.rotation.x=0;
}
function updateHeroAnimation(limbs,{dt,time,moving,sprint,grounded,velocity,sitting,attacking,attackProgress,hero,swimming=false,diving=false}) {
    const state=heroAnimationBindings.get(limbs);if(!state)return;
    dt=Math.min(Math.max(dt,0),.1);
    const blend=1-Math.exp(-14*dt),rest=state.rest;
    if(moving&&grounded&&!sitting)state.phase+=dt*(sprint?13:9);
    if(grounded&&!state.wasGrounded)state.landing=1;
    state.wasGrounded=grounded;state.landing=Math.max(0,state.landing-dt*5);
    const pose={};
    for(const [name,r] of Object.entries(rest))pose[name]={x:r.rotation.x,y:r.rotation.y,z:r.rotation.z,py:r.position.y,pz:r.position.z};
    const set=(name,values)=>{if(pose[name])Object.assign(pose[name],values);};
    const body=rest.body,breath=Math.sin(time*2.4)*.012;
    set('body',{py:body.position.y+breath});
    state.model.rotation.x+=((swimming?(moving?1.05:.25):0)-state.model.rotation.x)*blend;
    if(swimming){
        state.phase+=dt*(sprint?9:5);const stroke=Math.sin(state.phase);
        set('leftArm',{x:stroke*.85-.4,z:-.65});set('rightArm',{x:-stroke*.85-.4,z:.65});
        set('leftLeg',{x:stroke*.35});set('rightLeg',{x:-stroke*.35});set('cape',{x:.8});
        set('body',{py:body.position.y+Math.sin(state.phase*2)*.025,x:diving?.15:0});
    }else if(!grounded) {
        // Gather the feet during ascent, then prepare an open landing pose.
        const rise=velocity>0;
        set('leftLeg',{x:rise?-.55:.18});set('rightLeg',{x:rise?-.35:.26});
        set('leftArm',{x:-.3,z:-.25});set('rightArm',{x:-.3,z:.15});
        set('body',{x:rise?-.07:.07});
        set('cape',{x:.7});
    } else if(sitting) {
        set('body',{py:body.position.y-.17+breath,x:0,y:0,z:0});
        set('leftLeg',{x:-1.15,py:rest.leftLeg.position.y-.18});
        set('rightLeg',{x:-1.15,py:rest.rightLeg.position.y-.18});
        set('leftArm',{x:-.42,z:-.12});set('rightArm',{x:-.42});set('cape',{x:.65});
    } else if(moving) {
        const step=Math.sin(state.phase),stride=sprint?.72:.46;
        set('leftLeg',{x:step*stride,py:rest.leftLeg.position.y+Math.max(0,-step)*.065});
        set('rightLeg',{x:-step*stride,py:rest.rightLeg.position.y+Math.max(0,step)*.065});
        set('leftArm',{x:step*stride*.55,z:-.1});set('rightArm',{x:-step*stride*.6});
        set('body',{x:sprint?.15:.06,y:step*.025,z:step*.025,py:body.position.y+Math.abs(Math.sin(state.phase*2))*.04});
        set('cape',{x:(sprint?.65:.4)+Math.sin(state.phase)*.07});
    }
    if(grounded&&!sitting&&state.landing>0) {
        pose.body.py-=Math.sin(state.landing*Math.PI)*.07;
        pose.leftLeg.x-=Math.sin(state.landing*Math.PI)*.18;
        pose.rightLeg.x-=Math.sin(state.landing*Math.PI)*.18;
    }
    if(hero==='kingkong'&&grounded&&!swimming&&!sitting){
        const sway=moving?Math.sin(state.phase)*.12:Math.sin(time*2)*.025;
        set('leftArm',{x:sway,y:.08});set('rightArm',{x:-sway,y:-.08});
    }
    if(attacking&&hero==='kingkong'){
        if(!state.wasAttacking)state.punchSide=1-state.punchSide;
        const hand=state.punchSide?'leftArm':'rightArm',sign=state.punchSide?-1:1;
        const stroke=Math.sin(Math.min(1,Math.max(0,attackProgress)/.85)*Math.PI);
        set(hand,{pz:rest[hand].position.z+stroke*.9,x:-.12*stroke,y:sign*.34*stroke});
        set('body',{y:-sign*.15*stroke});
    }else if(attacking) {
        const p=Math.min(1,Math.max(0,attackProgress));
        const wind=Math.min(1,p/.28),strike=Math.min(1,Math.max(0,(p-.28)/.3));
        const recover=Math.min(1,Math.max(0,(p-.58)/.42));
        const amount=(1-recover);
        set('rightArm',{x:(-.8*wind+2.1*strike)*amount,y:(-.3*wind+.8*strike)*amount,z:-.12*amount});
        set('leftArm',{x:-.32,z:-.12});
        set('body',{y:(hero==='rabbit'?.09:-.12)*Math.sin(p*Math.PI)});
    }
    state.wasAttacking=attacking;
    for(const [name,target] of Object.entries(pose)) {
        const node=limbs[name];node.rotation.x+=(target.x-node.rotation.x)*blend;
        node.rotation.y+=(target.y-node.rotation.y)*blend;node.rotation.z+=(target.z-node.rotation.z)*blend;
        node.position.y+=(target.py-node.position.y)*blend;node.position.z+=(target.pz-node.position.z)*blend;
    }
    if(limbs.leftEar&&limbs.rightEar) {
        limbs.leftEar.rotation.z+=(.28+Math.sin(time*3)*.025-limbs.leftEar.rotation.z)*blend;
        limbs.rightEar.rotation.z+=(-.28-Math.sin(time*3)*.025-limbs.rightEar.rotation.z)*blend;
    }
    if(state.bones.wing_L) {
        const amplitude=grounded?.05:.18;
        state.bones.wing_L.rotation.z=.12+Math.sin(time*3)*amplitude;
        state.bones.wing_R.rotation.z=-.12-Math.sin(time*3)*amplitude;
        state.bones.tail.rotation.y=Math.sin(time*2)*.09;
    }
}
