// Shared time-based poses for all playable characters. Physics owns world position.
const heroAnimationBindings=new WeakMap();
function registerHeroAnimation(model) {
    const limbs=model.limbs,rest={};
    for(const [name,node] of Object.entries(limbs))if(node?.isObject3D)
        rest[name]={position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()};
    const bones=model.userData.bones||{};
    heroAnimationBindings.set(limbs,{rest,phase:0,gait:0,run:0,wasGrounded:true,landing:0,bones,model,wasAttacking:false,punchSide:0,quaternion:new THREE.Quaternion(),euler:new THREE.Euler()});
}
function resetHeroAnimation(model) {
    const state=heroAnimationBindings.get(model.limbs);if(!state)return;
    for(const [name,rest] of Object.entries(state.rest)) {
        const node=model.limbs[name];node.position.copy(rest.position);node.rotation.copy(rest.rotation);node.scale.copy(rest.scale);
    }
    state.phase=0;state.gait=0;state.run=0;state.landing=0;state.wasGrounded=true;state.wasAttacking=false;state.punchSide=0;
    model.rotation.x=0;
}
function updateHeroAnimation(limbs,{dt,time,moving,sprint,grounded,velocity,sitting,attacking,attackProgress,hero,swimming=false,diving=false,speed=1,turn=0,flashlight=false,moveForward=1,strafe=0,ropeRiding=false,flying=false}) {
    const state=heroAnimationBindings.get(limbs);if(!state)return;
    dt=Math.min(Math.max(dt,0),.1);
    const blend=1-Math.exp(-(attacking?22:14)*dt),rest=state.rest,oldGait=state.gait;
    state.gait+=((moving?Math.min(1,Math.max(0,speed)):0)-state.gait)*(1-Math.exp(-12*dt));
    state.run+=((sprint?1:0)-state.run)*(1-Math.exp(-8*dt));
    if(!ropeRiding&&grounded&&!sitting)state.phase+=dt*(9+4*state.run)*(oldGait+state.gait)*.5;
    if(grounded&&!state.wasGrounded)state.landing=1;
    state.wasGrounded=grounded;state.landing=Math.max(0,state.landing-dt*3.6);
    const pose={};
    for(const [name,r] of Object.entries(rest))pose[name]={x:r.rotation.x,y:r.rotation.y,z:r.rotation.z,py:r.position.y,pz:r.position.z};
    const set=(name,values)=>{if(pose[name])Object.assign(pose[name],values);};
    const body=rest.body,breath=Math.sin(time*1.9)*.009;
    set('body',{py:body.position.y+breath});
    if(!moving&&!sitting&&!attacking){set('leftArm',{x:rest.leftArm.rotation.x+Math.sin(time*1.9+.3)*.012,z:rest.leftArm.rotation.z-.018});set('rightArm',{x:rest.rightArm.rotation.x-Math.sin(time*1.9+.3)*.012});set('cape',{x:rest.cape?.rotation.x||0,z:Math.sin(time*1.2)*.018});}
    state.model.rotation.x+=((swimming?(moving?1.05:.25):0)-state.model.rotation.x)*blend;
    if(ropeRiding){
        set('leftArm',{x:-2.75,z:-.12});set('rightArm',{x:-2.9,z:.12});
        set('leftLeg',{x:-.3});set('rightLeg',{x:-.2});set('body',{x:.05,py:body.position.y});set('cape',{x:.35});
    }else if(swimming){
        state.phase+=dt*(sprint?9:5);const stroke=Math.sin(state.phase);
        set('leftArm',{x:stroke*.85-.4,z:-.65});set('rightArm',{x:-stroke*.85-.4,z:.65});
        set('leftLeg',{x:stroke*.35});set('rightLeg',{x:-stroke*.35});set('cape',{x:.8});
        set('body',{py:body.position.y+Math.sin(state.phase*2)*.025,x:diving?.15:0});
    }else if(flying){
        set('leftArm',{x:-.26,z:-.38});set('rightArm',{x:-.26,z:.38});set('leftLeg',{x:.17+Math.sin(time*2)*.035});set('rightLeg',{x:.24-Math.sin(time*2)*.035});set('body',{x:.13,py:body.position.y+Math.sin(time*2)*.012});set('cape',{x:.85});
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
    } else if(state.gait>.002) {
        const step=Math.sin(state.phase),stride=(.46+.26*state.run)*state.gait;
        const lift=(.045+.03*state.run)*state.gait;
        set('leftLeg',{x:step*stride*moveForward,z:step*stride*.6*strafe,py:rest.leftLeg.position.y+Math.pow(Math.max(0,-step),2)*lift});
        set('rightLeg',{x:-step*stride*moveForward,z:-step*stride*.6*strafe,py:rest.rightLeg.position.y+Math.pow(Math.max(0,step),2)*lift});
        set('leftArm',{x:step*stride*.55,z:-.1});set('rightArm',{x:-step*stride*.6});
        set('body',{x:(.06+.09*state.run)*state.gait,y:step*.035*state.gait,z:step*.025*state.gait,py:body.position.y+(1-Math.cos(state.phase*2))*.018*state.gait});
        set('cape',{x:.4+.25*state.run+Math.sin(state.phase-.35)*.055});
    }
    if(!ropeRiding&&!swimming&&!sitting&&hero!=='kingkong')set('rightArm',{x:pose.rightArm.x-.12,z:pose.rightArm.z+.04});
    if(!ropeRiding&&flashlight&&!swimming){set('leftArm',{x:-.48+Math.sin(state.phase)*.025*state.gait,y:.08,z:-.16});}
    if(!ropeRiding&&grounded&&!sitting){pose.body.z-=THREE.MathUtils.clamp(turn*.018,-.12,.12);}
    if(!ropeRiding&&grounded&&!sitting&&state.landing>0) {
        pose.body.py-=Math.sin(state.landing*Math.PI)*.07;
        pose.leftLeg.x-=Math.sin(state.landing*Math.PI)*.18;
        pose.rightLeg.x-=Math.sin(state.landing*Math.PI)*.18;
    }
    if(!ropeRiding&&hero==='kingkong'&&grounded&&!swimming&&!sitting){
        const sway=moving?Math.sin(state.phase)*.12:Math.sin(time*2)*.025;
        set('leftArm',{x:sway,y:.08});set('rightArm',{x:-sway,y:-.08});
    }
    if(!ropeRiding&&attacking&&hero==='kingkong'){
        if(!state.wasAttacking)state.punchSide=1-state.punchSide;
        const hand=state.punchSide?'leftArm':'rightArm',sign=state.punchSide?-1:1;
        const progress=THREE.MathUtils.clamp(attackProgress,0,1),stroke=Math.sin(Math.min(1,progress/.85)*Math.PI);
        set(hand,{pz:rest[hand].position.z+stroke*.9,x:-.12*stroke,y:sign*.34*stroke});
        set('body',{x:.07*stroke,y:-sign*.19*stroke,py:body.position.y-.025*stroke});
    }else if(!ropeRiding&&attacking) {
        const p=Math.min(1,Math.max(0,attackProgress));
        const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
        const wind=ease(p/.28),strike=ease((p-.28)/.24);
        const recover=ease((p-.52)/.48);
        const amount=(1-recover);
        set('rightArm',{x:(-.8*wind+2.1*strike)*amount,y:(-.3*wind+.8*strike)*amount,z:-.12*amount});
        if(!flashlight)set('leftArm',{x:hero==='ninja_yinyang'?(1.6*strike-.7*wind)*amount:-.32,y:hero==='ninja_yinyang'?-.7*strike*amount:0,z:-.12});
        set('body',{y:(hero==='rabbit'?.13:-.2)*Math.sin(p*Math.PI),x:.045*strike*amount,py:body.position.y-.025*wind*amount});
        if(grounded&&!moving&&!sitting){set('leftLeg',{x:-.1*wind*amount,z:-.04*amount});set('rightLeg',{x:.1*wind*amount,z:.04*amount});}
    }
    state.wasAttacking=attacking;
    for(const [name,target] of Object.entries(pose)) {
        const node=limbs[name];state.euler.set(target.x,target.y,target.z,node.rotation.order);state.quaternion.setFromEuler(state.euler);node.quaternion.slerp(state.quaternion,blend);
        node.position.y+=(target.py-node.position.y)*blend;node.position.z+=(target.pz-node.position.z)*blend;
    }
    if(limbs.leftEar&&limbs.rightEar) {
        limbs.leftEar.rotation.z+=(.28+Math.sin(time*3)*.025-limbs.leftEar.rotation.z)*blend;
        limbs.rightEar.rotation.z+=(-.28-Math.sin(time*3)*.025-limbs.rightEar.rotation.z)*blend;
    }
    if(state.bones.wing_L) {
        const amplitude=grounded?.05:.18;
        state.bones.wing_L.rotation.z+=(.12+Math.sin(time*3)*amplitude-state.bones.wing_L.rotation.z)*blend;
        state.bones.wing_R.rotation.z+=(-.12-Math.sin(time*3)*amplitude-state.bones.wing_R.rotation.z)*blend;
        state.bones.tail.rotation.y+=(Math.sin(time*2)*.09-state.bones.tail.rotation.y)*blend;
    }
}
