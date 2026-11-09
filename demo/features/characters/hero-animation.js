// The skin skeleton shares a pose across the cast. The simulation still owns world position.
const heroAnimationBindings = new WeakMap();
function registerHeroAnimation(model) {
    const rest = Object.fromEntries(Object.entries(model.limbs).map(([name,node])=>[name,node.position.clone()]));
    heroAnimationBindings.set(model.limbs,{
        model,rest,phase:0,gait:0,run:0,landing:0,grounded:true,
        target:new THREE.Quaternion(),euler:new THREE.Euler()
    });
}
function resetHeroAnimation(model) {
    const state=heroAnimationBindings.get(model.limbs);
    for (const [name,node] of Object.entries(model.limbs)) {
        node.position.copy(state.rest[name]);
        node.rotation.set(0,0,0);
    }
    for (const side of ['L','R']) model.userData.bones['wing_'+side].rotation.set(0,0,0);
    model.rotation.set(0,0,0);
    Object.assign(state,{phase:0,gait:0,run:0,landing:0,grounded:true});
}
function updateHeroAnimation(limbs,{
    dt,time,moving,sprint,grounded,velocity,sitting,attacking,attackProgress,
    swimming=false,diving=false,speed=1,turn=0,flashlight=false,moveForward=1,strafe=0,
    ropeRiding=false,flying=false,vertical=0
}) {
    const state=heroAnimationBindings.get(limbs);
    if (!state) return;
    dt=THREE.MathUtils.clamp(dt,0,.1);
    const blend=1-Math.exp(-(attacking?27:14)*dt);
    state.gait+=((moving?THREE.MathUtils.clamp(speed,0,1):0)-state.gait)*(1-Math.exp(-12*dt));
    state.run+=((sprint?1:0)-state.run)*(1-Math.exp(-8*dt));
    if (grounded&&!state.grounded&&!swimming&&!flying) state.landing=1;
    state.grounded=grounded;
    state.landing=Math.max(0,state.landing-4.1*dt);
    if (swimming||grounded) state.phase=(state.phase+dt*(swimming?4+state.gait*5:(8+5.5*state.run)*state.gait))%(Math.PI*2);
    const pose={};
    const set=(name,x=0,y=0,z=0)=>{pose[name]=[x,y,z];};
    const phase=state.phase, gait=state.gait, step=Math.sin(phase), breathing=Math.sin(time*2)*.009;
    const bank=THREE.MathUtils.clamp(turn*.014,-.17,.17);
    let bob=breathing, hipDrop=0, pitch=0;
    set('cape',.045+Math.sin(time*1.7)*.03);
    set('tail',Math.sin(time*2)*.03,Math.sin(time*2.4)*(.09+.11*gait));
    set('head',Math.sin(time*1.15)*.023,-bank*.5);
    set('leftArm',.015,0,-.12);
    set('rightArm',-.09,0,.11);
    set('leftElbow',-.16);
    set('rightElbow',-.28);
    if (ropeRiding) {
        set('leftArm',-2.52,.05,-.2);
        set('rightArm',-2.64,-.08,.2);
        set('leftElbow',-.48);
        set('rightElbow',-.43);
        set('leftLeg',-.35);
        set('rightLeg',-.31);
        set('leftKnee',.62);
        set('rightKnee',.65);
        set('cape',.37);
    } else if (sitting) {
        hipDrop=-.27;
        bob=hipDrop+breathing;
        set('leftLeg',-1.39,0,-.08);
        set('rightLeg',-1.39,0,.08);
        set('leftKnee',1.49);
        set('rightKnee',1.49);
        set('leftArm',-.25,0,-.12);
        set('rightArm',-.25,0,.12);
        set('cape',.55);
    } else if (swimming) {
        pitch=(diving?.62:.35)+.57*gait+.18*vertical;
        bob=Math.sin(phase*2)*.017;
        set('head',-pitch*.71);
        set('cape',.72);
        for (const [side,sign] of [['left',-1],['right',1]]) {
            const stroke=phase+(sign===1?Math.PI:0), wave=Math.sin(stroke);
            set(side+'Arm',-.38-.91*wave*gait,.25*sign*Math.cos(stroke),sign*(.24+.44*gait));
            set(side+'Elbow',-.36-.79*Math.max(0,wave)*gait);
            set(side+'Hand',.17*Math.cos(stroke));
            set(side+'Leg',-.12+.32*wave*gait);
            set(side+'Knee',.20+.31*Math.max(0,-wave)*gait);
            set(side+'Foot',.35+.14*wave);
        }
    } else if (flying) {
        pitch=.18+.40*gait-.20*vertical;
        bob=.032*Math.sin(time*4);
        set('body',.1,0,-bank);
        set('head',-.75*pitch);
        set('cape',.59+.20*gait+Math.sin(time*9)*.065);
        set('leftArm',-.14,0,-.35-.30*gait);
        set('rightArm',-.25,0,.29+.23*gait);
        set('leftLeg',.09+.28*gait);
        set('rightLeg',-.12+.36*gait);
        set('leftKnee',.24+.08*Math.sin(time*4));
        set('rightKnee',.36-.08*Math.sin(time*4));
    } else if (!grounded) {
        const rising=velocity>0;
        set('body',rising?-.12:.11);
        set('leftArm',rising?-.62:-.27,0,-.35);
        set('rightArm',rising?-.55:-.21,0,.35);
        set('leftLeg',rising?-.73:-.20);
        set('rightLeg',rising?-.37:.04);
        set('leftKnee',rising?.91:.32);
        set('rightKnee',rising?.65:.29);
        set('cape',rising?.57:.82);
    } else {
        const landing=Math.sin(Math.PI*state.landing);
        const stride=(.49+.33*state.run)*gait;
        const forward=Math.abs(moveForward)<.08?0:moveForward;
        hipDrop=-.08*landing;
        bob=hipDrop+breathing-(1-Math.cos(phase*2))*.026*gait;
        set('body',(.065+.13*state.run)*gait+.13*landing,step*.085*gait,-bank+step*.038*gait);
        set('cape',(.30+.40*state.run)*gait+.08*Math.sin(phase+.5)*gait);
        for (const [side,sign] of [['left',-1],['right',1]]) {
            const swing=step*sign, swingLift=Math.max(0,Math.cos(phase)*sign);
            const thigh=swing*stride*forward-.12*landing;
            const knee=swingLift*(.51+.53*state.run)*gait+.38*landing;
            set(side+'Leg',thigh,0,sign*.04+swing*stride*.64*strafe);
            set(side+'Knee',knee);
            set(side+'Foot',-(thigh+knee)*(.79-.33*swingLift),0,-sign*.035);
            set(side+'Arm',-swing*stride*.81,0,sign*.13);
            set(side+'Elbow',-.17-state.run*.74*gait-.31*Math.max(0,swing)*gait);
        }
    }
    if (flashlight&&!ropeRiding&&!swimming) {
        set('leftArm',-.60,.14,-.19);
        set('leftElbow',-.77);
        set('leftHand',.30);
    }
    if (attacking&&!ropeRiding&&!sitting) {
        const ease=value=>THREE.MathUtils.smoothstep(value,0,1);
        const wind=ease(attackProgress/.25), hit=ease((attackProgress-.25)/.27);
        const recover=1-ease((attackProgress-.52)/.48);
        const strike=(1.19*wind-2.20*hit)*recover;
        set('rightArm',strike,(.73*wind-1.51*hit)*recover,.20+.49*recover);
        set('rightElbow',(-.32-1.10*wind+.97*hit)*recover);
        set('rightHand',-.25*hit*recover,.35*hit*recover);
        const [bodyX,bodyY,bodyZ]=pose.body||[0,0,0];
        set('body',bodyX+.19*hit*recover,bodyY+(.31*wind-.72*hit)*recover,bodyZ-.08*hit*recover);
        set('head',-.075*hit*recover,.17*hit*recover);
        if (!flashlight) set('leftArm',-.44*recover,.20*recover,-.32*recover);
    }
    state.model.rotation.x+=(pitch-state.model.rotation.x)*blend;
    for (const [name,node] of Object.entries(limbs)) {
        state.euler.set(...(pose[name]||[0,0,0]),'YXZ');
        state.target.setFromEuler(state.euler);
        node.quaternion.slerp(state.target,blend);
        const offset=name==='body'?bob:(name==='leftLeg'||name==='rightLeg')?hipDrop:0;
        node.position.y+=(state.rest[name].y+offset-node.position.y)*blend;
    }
    for (const [side,sign] of [['L',-1],['R',1]]) {
        const wing=state.model.userData.bones['wing_'+side];
        const wingsCover=window.crystalWings?.equipped;
        wing.visible=!wingsCover;
        const flutter=Math.sin(time*(flying?6:2.3));
        wing.rotation.y+=(sign*(flying?-.18:-.38)-wing.rotation.y)*blend;
        wing.rotation.z+=(sign*flutter*(flying?.25:.05)-wing.rotation.z)*blend;
    }
}
