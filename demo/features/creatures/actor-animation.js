/* Render-only motion. AI/physics always receives its own unmodified transforms. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installActorAnimation(){
    const bindings=new Map(),applied=new Set(),dimensions=new Map(),legacyRigs=new WeakMap(),clock={value:0};
    const pos=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion(),euler=new THREE.Euler(),offset=new THREE.Vector3();
    const up=new THREE.Vector3(0,1,0);let scan=1,serial=0,lastActive=false,processed=0;
    const damp=(rate,dt)=>1-Math.exp(-rate*dt),smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
    function pose(node){return {p:node.position.clone(),q:node.quaternion.clone(),s:node.scale.clone()};}
    function assign(node,p){node.position.copy(p.p);node.quaternion.copy(p.q);node.scale.copy(p.s);node.updateMatrix();}
    function height(kind){if(dimensions.has(kind))return dimensions.get(kind);const spec=window.CREATURE_STUDIO_DATA?.models[kind];let lo=Infinity,hi=-Infinity;if(spec)for(const part of Object.values(spec.parts))for(let i=1;i<part.p.length;i+=3){lo=Math.min(lo,part.p[i]);hi=Math.max(hi,part.p[i]);}const legacy={sphinx:52.5,forest_guardian:15.7,war_dragon:10.6,ness:49,space_croc:20,swamp_croc:5.5,snow_queen:7.7,candy_lord:12},h=Number.isFinite(hi-lo)?Math.max(.2,hi-lo):legacy[kind]||2;dimensions.set(kind,h);return h;}
    function role(name){if(/^leg|fore-|rear-|front|hind/i.test(name))return 'leg';if(/wing|fin/i.test(name))return 'wing';if(/tail|spine/i.test(name))return 'tail';if(/jaw/i.test(name))return 'jaw';if(/arm/i.test(name))return 'arm';if(/head/i.test(name))return 'head';if(/body|torso|chest/i.test(name))return 'body';return 'other';}
    function track(root,{kind=root?.userData.blenderCreature||'resident',driver=root,source=null,nodes=null,flight=false,aquatic=false}={}){
        if(!root||bindings.has(root))return bindings.get(root);
        if(!nodes){nodes={};root.traverse(n=>{if(n!==root&&n.isGroup&&n.userData.creatureJoint)nodes[n.userData.creatureJoint]=n;});if(!Object.keys(nodes).length)nodes=Object.fromEntries(root.children.filter(n=>n.isGroup&&n.children.length).map((n,i)=>[n.name||'joint'+i,n]));}
        if(!Object.keys(nodes).length)return null;
        const bones=Object.entries(nodes).filter(([,n])=>n?.isObject3D&&n!==root).map(([name,node])=>({name,node,role:role(name),rest:pose(node),source:pose(node),visual:pose(node),target:pose(node)}));
        if(root.userData.blenderCreature)for(const bone of bones)if(bone.role==='leg')bone.rest.q.identity();
        driver.updateWorldMatrix(true,false);driver.getWorldPosition(pos);
        const b={root,driver,source,bones,kind,flight,aquatic,phase:(serial++*.73)%Math.PI*2,speed:0,weight:0,run:0,idleTime:99,last:pos.clone(),renderPosition:pos.clone(),spatialOffset:new THREE.Vector3(),nativeHeight:height(kind),turn:0,heading:0,headingReady:false,teleports:0};bindings.set(root,b);return b;
    }
    function split(root,definitions){if(!root||legacyRigs.has(root))return legacyRigs.get(root);const rig={};
        for(const [name,pivot,select] of definitions){const meshes=root.children.filter(c=>c.isMesh&&select(c));if(!meshes.length)continue;const node=new THREE.Group();node.name='Motion_'+name;node.position.fromArray(pivot);root.add(node);for(const mesh of meshes){root.remove(mesh);mesh.position.sub(node.position);node.add(mesh);}rig[name]=node;}
        legacyRigs.set(root,rig);return rig;
    }
    function collect(force=false){
        const range=(currentProfileKey==='low'?200:currentProfileKey==='ultra'?1400:600)+96;
        const nearby=(root,driver=root)=>{if(!root)return false;if(bindings.has(root))return false;if(force)return true;if(!visible(root))return false;driver.getWorldPosition(pos);return pos.distanceToSquared(camera.position)<range*range;};
        const add=(a,kind)=>{const root=a?.group||a?.model;if(nearby(root))track(root,{kind:kind||a.kind||root.userData.blenderCreature,source:a});};
        for(const a of window.livingWorld?.actors||[])add(a);
        for(const a of window.forestWildlife?.actors.values()||[])add(a);
        for(const a of window.polarEcology?.actors||[])add(a);
        for(const a of window.monsterCamps?.actors||[])add(a,a.kind==='rabbit'?'moon_rabbit':a.kind);
        const sources=[window.riverRealm?.wolf,window.bachKhuyet?.tiger,window.evilCavern?.worm,...(window.evilCavern?.warriors||[]),...(window.desertRealm?.infestation.actors||[])];
        for(const a of window.creatureRefresh?.actors||[])if(nearby(a.kit.root,a.group))track(a.kit.root,{kind:a.kit.root.userData.blenderCreature,driver:a.group,source:sources.find(s=>s?.group===a.group)||a,flight:a.group.name.startsWith('FlyingReindeer')});
        for(const a of window.lakeMonsters?.actors||[])track(a.group,{kind:a.spec.id,source:a,nodes:a.joints,aquatic:true});
        const arena=window.romanArena?.tournament?.opponent;if(arena)track(arena.group,{kind:arena.spec.model,source:arena,nodes:arena.rig});
        const dragon=window.volcanicValley?.dragon;if(dragon)track(dragon.group,{kind:'war_dragon',source:dragon,nodes:dragon.joints});
        const guardian=window.forestGuardian;if(guardian)track(guardian.artKit?.root||guardian.awakeModel,{kind:guardian.artKit?'forest_guardian_reference':'forest_guardian',driver:guardian.group,source:guardian,nodes:guardian.artKit?.rig||guardian.joints});
        const sphinx=window.desertRealm?.boss;if(sphinx)track(sphinx.group,{kind:'sphinx',source:sphinx});
        const croc=window.mangroveRealm?.crocodile;if(croc)track(croc.group,{kind:'swamp_croc',source:croc,nodes:croc.joints,aquatic:true});
        const queen=window.snowQueen;if(queen){const rig=split(queen.group,[['rightArm',[1.3,4.8,0],m=>Math.abs(m.position.x-1.9)<.01||Math.abs(m.position.x-1.3)<.01],['leftArm',[-1.3,4.8,0],m=>Math.abs(m.position.x+1.3)<.01],['head',[0,5.3,0],m=>m.position.y>4.9]]);track(queen.group,{kind:'snow_queen',source:queen.boss,nodes:rig});}
        const candy=window.candyRealm?.boss;if(candy){const rig=split(candy.group,[['head',[0,8,0],m=>m.position.y>5.5||m.geometry.type==='TubeGeometry'],['leftArm',[-1,5,0],m=>m.position.x< -1.5],['rightArm',[1,5,0],m=>m.position.x>1.5],['leg0',[-1.2,1.3,0],m=>m.position.x<0&&m.position.y<1],['leg1',[1.2,1.3,0],m=>m.position.x>0&&m.position.y<1]]);track(candy.group,{kind:'candy_lord',source:candy,nodes:rig});}
        for(const m of window.monsterSkills?.minions||[])if(nearby(m.model||m.group))track(m.model||m.group,{kind:m.kind||'sapling',source:m});
        for(const a of window.westernHighlands?.residents||[])add(a,'resident');
        for(const a of window.worldResidents?.actors||[])add(a,'resident');
    }
    function visible(root){for(let p=root;p;p=p.parent){if(!p.visible)return false;if(p===scene)return true;}return false;}
    function beginFrame(){for(const b of applied)for(const bone of b.bones)assign(bone.node,bone.source);applied.clear();}
    function update(dt){
        dt=THREE.MathUtils.clamp(dt,0,.1);scan+=dt;if(scan>=.25){scan=0;collect();}
        const active=gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
        if(active)clock.value+=dt;processed=0;
        const range=currentProfileKey==='low'?200:currentProfileKey==='ultra'?1400:600;
        for(const b of bindings.values()){
            if(!b.root.parent){bindings.delete(b.root);continue;}if(!visible(b.root))continue;
            b.driver.getWorldPosition(pos);if(pos.distanceToSquared(camera.position)>range*range){b.last.copy(pos);b.headingReady=false;continue;}
            for(const bone of b.bones){bone.source.p.copy(bone.node.position);bone.source.q.copy(bone.node.quaternion);bone.source.s.copy(bone.node.scale);}
            if(!active||!lastActive||dt===0){b.last.copy(pos);b.renderPosition.copy(pos);if(!active){for(const bone of b.bones)assign(bone.node,bone.visual);applied.add(b);}continue;}
            const dx=pos.x-b.last.x,dz=pos.z-b.last.z,distance=Math.hypot(dx,dz);b.last.copy(pos);
            b.root.getWorldScale(scale);const h=b.nativeHeight*Math.max(.001,Math.abs(scale.y)),stride=Math.max(.35,Math.min(12,h*.8));
            const teleport=distance>Math.max(10,h*5);if(teleport){b.speed=0;b.weight=0;b.idleTime=99;b.teleports++;b.headingReady=false;b.renderPosition.copy(pos);}
            const rawSpeed=!teleport?distance/dt:0;b.idleTime=rawSpeed>.025?0:b.idleTime+dt;b.speed+=(rawSpeed-b.speed)*damp(10,dt);b.weight+=((b.idleTime<.16?1:0)-b.weight)*damp(b.idleTime<.16?9:13,dt);
            b.renderPosition.lerp(pos,damp(24,dt));offset.copy(b.renderPosition).sub(pos).clampLength(0,Math.min(.25,h*.04));b.renderPosition.copy(pos).add(offset);
            b.root.getWorldQuaternion(rotation).invert();b.spatialOffset.copy(offset).applyQuaternion(rotation);b.spatialOffset.set(b.spatialOffset.x/Math.max(.001,Math.abs(scale.x)),b.spatialOffset.y/Math.max(.001,Math.abs(scale.y)),b.spatialOffset.z/Math.max(.001,Math.abs(scale.z)));
            const flight=b.flight||b.source?.flight?.state&&b.source.flight.state!=='grounded';
            b.run+=(THREE.MathUtils.clamp((b.speed/stride-.65)/1.1,0,1)-b.run)*damp(7,dt);if(!teleport)b.phase+=flight?dt*7.5:distance/stride*Math.PI*2;
            const phase=b.phase,weight=b.weight,run=b.run,breath=Math.sin(clock.value*1.7+phase*.09),state=b.source?.state||b.source?.boss?.state||'idle';
            const forest=b.root.userData.creatureDesign==='forest-reference-2026-11-02',swordRecovery=b.kind==='cursed_warrior'&&state==='recover',attack=!!b.source?.animationAttack||swordRecovery||/windup|warning|casting|strike|slash|breath|lunge|slam|gaze/.test(state)||(forest&&/rootcast|rootrecover|summoning|waking|recover/.test(state)),dead=/dead|defeated/.test(state);
            const progress=b.source?.animationAttack?THREE.MathUtils.clamp(b.source.animationAttack.time/(b.source.animationAttack.duration||.5),0,1):state==='slash'?.52*THREE.MathUtils.clamp((b.source?.timer||0)/.65,0,1):swordRecovery?.52+.48*THREE.MathUtils.clamp((b.source?.timer||0)/.8,0,1):THREE.MathUtils.clamp((b.source?.timer||0)/1.1,0,1),wind=smooth(progress/.28),strike=smooth((progress-.28)/.24),recover=1-smooth((progress-.52)/.48);
            const yaw=euler.setFromQuaternion(b.driver.getWorldQuaternion(rotation),'YXZ').y;
            if(!b.headingReady){b.heading=yaw;b.headingReady=true;}const angle=Math.atan2(Math.sin(yaw-b.heading),Math.cos(yaw-b.heading));b.heading+=angle*damp(12,dt);b.turn=Math.atan2(Math.sin(b.heading-yaw),Math.cos(b.heading-yaw));
            const legs=b.bones.filter(n=>n.role==='leg'),amplitude=(.28+run*.24)*weight*(b.aquatic?.45:1),facing=b.root.userData.creatureForward||1;
            for(const bone of b.bones){
                const p=bone.target.p.copy(bone.source.p),q=bone.target.q.copy(bone.source.q),s=bone.target.s.copy(bone.source.s);let procedural=false,x=0,y=0,z=0;
                if(bone.role==='leg'&&!dead){
                    const i=legs.indexOf(bone),side=bone.rest.p.x<0?-1:1,front=bone.rest.p.z>=0,diagonal=(side<0)===front?0:Math.PI;
                    const walkOffset=legs.length===4?((side<0?0:Math.PI)+(front?0:Math.PI*.5)):legs.length>4?i*Math.PI*.65:(side<0?0:Math.PI);
                    const legPhase=phase+walkOffset+(legs.length===4?Math.atan2(Math.sin(diagonal-walkOffset),Math.cos(diagonal-walkOffset))*run:0),wave=Math.sin(legPhase);
                    if(b.kind==='butterfly'){z=(i%2?1:-1)*Math.sin(clock.value*11)*.8;}
                    else if(['rabbit','moon_rabbit'].includes(b.kind)){x=Math.sin(phase+(front?Math.PI*.4:0))*.35*weight;p.copy(bone.rest.p);p.y+=Math.pow(Math.max(0,-Math.sin(phase)),2)*b.nativeHeight*.035*weight;}
                    else{x=wave*(flight?.48:amplitude);p.copy(bone.rest.p);p.y+=Math.pow(Math.max(0,-wave),2)*b.nativeHeight*.025*weight;}
                    q.copy(bone.rest.q);procedural=true;
                }else if(bone.role==='body'&&!dead){p.y+=breath*b.nativeHeight*.003+Math.sin(phase*2)*weight*b.nativeHeight*.008;x=facing*((run*.065)*weight+(attack?(-.035*wind+.065*strike)*recover:0));z=Math.sin(phase)*weight*.018;procedural=true;}
                else if(bone.role==='tail'&&!dead){y=Math.sin(clock.value*(1.2+run)+phase*.15)*(.035+weight*.07);procedural=true;}
                else if(bone.role==='wing'&&!dead){z=Math.sin(clock.value*(b.aquatic?2:3)+phase*.2+(bone.rest.p.x<0?Math.PI:0))*(b.aquatic?.065:.045);procedural=true;}
                else if(bone.role==='head'&&!dead){y=Math.sin(clock.value*.6+phase*.07)*.022;z=breath*.009;if(attack)x+=facing*(-.07*wind+.18*strike)*recover;procedural=true;}
                else if(bone.role==='jaw'&&!dead&&b.root.userData.creatureDesign==='forest-reference-2026-11-02'){x=attack?(.14*wind+.14*strike)*recover:.018+Math.sin(clock.value*1.9)*.018;procedural=true;}
                else if(bone.role==='arm'&&!dead){const side=/left|L$/.test(bone.name)?-1:1;x=side*Math.sin(phase)*weight*.12+breath*.012;if(attack){x-=facing*(-.5*wind+1.1*strike)*recover;y+=side*.18*Math.sin(progress*Math.PI);}procedural=true;}
                if(forest&&!dead&&b.kind==='forest_guardian_reference'){
                    const t=b.source?.timer||0,left=/left|L$/.test(bone.name);
                    if(bone.role==='arm'){
                        if(state==='summoning'){x=-2.15*smooth(t/.8)*(1-smooth((t-2.3)/.8));z=(left?-.3:.3)*Math.sin(Math.min(1,t/.8)*Math.PI/2);}
                        else if(state==='rootcast'){x=-.6*smooth(t/.7);z=(left?-.25:.25)*smooth(t/.7);}
                        else if(state==='rootrecover'){x=.65*(1-smooth(t/.6));}
                        else if(state==='windup'){x=-(left?1.65:.55)*smooth(t/.7);}
                        else if(state==='recover'){x=(left?.8:.2)*(1-smooth(t/.55));}
                        else if(state==='waking'){x=-.25*Math.sin(Math.min(1,t/1.7)*Math.PI);}
                        q.copy(bone.rest.q);procedural=true;
                    }
                    if(bone.role==='jaw'&&(b.source?.roaring||state==='waking'||state==='summoning')){x=.3+.06*Math.sin(clock.value*11);q.copy(bone.rest.q);procedural=true;}
                    if(bone.role==='head'&&state==='summoning'){x=-.14*Math.sin(Math.min(1,t/.7)*Math.PI/2);q.copy(bone.rest.q);procedural=true;}
                }
                if(procedural){euler.set(x,y,z);q.multiply(rotation.setFromEuler(euler));}
                // Turn the render skeleton around its actor origin, never the AI
                // root. BeginFrame restores authored transforms before simulation.
                if(bone.node.parent===b.root&&Math.abs(b.turn)>.00001){rotation.setFromAxisAngle(up,b.turn);p.applyQuaternion(rotation);q.premultiply(rotation);}
                if(bone.node.parent===b.root)p.add(b.spatialOffset);
                const a=damp(attack?22:14,dt);bone.visual.p.lerp(p,a);bone.visual.q.slerp(q,a);bone.visual.s.lerp(s,a);assign(bone.node,bone.visual);
            }
            applied.add(b);processed++;
        }
        lastActive=active;
    }
    const shaders=new Set(),interpolated=new WeakSet(),geometryOwners=new WeakMap();
    function interpolateInstances(mesh){
        if(!mesh.isInstancedMesh||interpolated.has(mesh))return;interpolated.add(mesh);
        if(geometryOwners.has(mesh.geometry))mesh.geometry=mesh.geometry.clone();geometryOwners.set(mesh.geometry,mesh);
        const capacity=mesh.instanceMatrix.count,previous=new THREE.InstancedBufferAttribute(new Float32Array(capacity*3),3),stamp=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1),original=mesh.setMatrixAt;
        mesh.geometry.setAttribute('actorPreviousDelta',previous);mesh.geometry.setAttribute('actorSampleTime',stamp);
        mesh.setMatrixAt=function(index,matrix){const base=index*16+12,old=this.instanceMatrix.array,age=THREE.MathUtils.clamp((clock.value-stamp.getX(index))/.12,0,1),remaining=1-smooth(age),v=index*3;
            let x=old[base]+previous.array[v]*remaining-matrix.elements[12],y=old[base+1]+previous.array[v+1]*remaining-matrix.elements[13],z=old[base+2]+previous.array[v+2]*remaining-matrix.elements[14];
            if(x*x+y*y+z*z>9)x=y=z=0;previous.setXYZ(index,x,y,z);stamp.setX(index,clock.value);previous.needsUpdate=true;stamp.needsUpdate=true;original.call(this,index,matrix);
        };
    }
    function waterMotion(mesh,kind='fish',forward=1){
        if(!mesh?.isMesh||!mesh.geometry)return;interpolateInstances(mesh);const list=Array.isArray(mesh.material)?mesh.material:[mesh.material];
        for(const material of list){if(shaders.has(material))continue;shaders.add(material);mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,length=Math.max(.1,box.max.z-box.min.z),tail=forward>0?box.min.z:box.max.z,old=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);const amplitude=kind==='fish'?length*.032:kind==='crab'?.035:.018;
            material.onBeforeCompile=function(shader,renderer){old.call(this,shader,renderer);shader.uniforms.actorMotionTime=clock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float actorMotionTime;\n#ifdef USE_INSTANCING\nattribute vec3 actorPreviousDelta; attribute float actorSampleTime;\n#endif');shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
                float actorSeed=modelMatrix[3].x*0.019+modelMatrix[3].z*0.023;
                #ifdef USE_INSTANCING
                actorSeed+=instanceMatrix[3].x*0.071+instanceMatrix[3].z*0.057;
                #endif
                float tailWeight=smoothstep(0.0,1.0,1.0-abs(position.z-(${tail.toFixed(6)}))/${length.toFixed(6)});
                transformed.${kind==='crab'?'y':'x'}+=sin(actorMotionTime*${kind==='fish'?'5.0':'3.2'}+actorSeed+position.z*3.0)*${amplitude.toFixed(6)}*tailWeight*tailWeight;
            `);shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
                #ifdef USE_INSTANCING
                vec3 actorCorrection=actorPreviousDelta*(1.0-smoothstep(0.0,0.12,actorMotionTime-actorSampleTime));
                mvPosition.xyz+=(modelViewMatrix*vec4(actorCorrection,0.0)).xyz;
                gl_Position=projectionMatrix*mvPosition;
                #endif
            `);};material.customProgramCacheKey=()=>key()+'actor-motion-'+kind+'-'+forward+'-'+tail+'-'+length+'-'+amplitude;material.needsUpdate=true;
        }
    }
    function installWaterMotion(){
        for(const pool of window.aquaticEcology?.pools||[])waterMotion(pool.body,'fish',-1);
        for(const school of window.riverRealm?.schools||[])waterMotion(school.mesh);
        const batches=window.mangroveRealm?.life?.batches;
        if(Array.isArray(batches)){for(const {kind,mesh} of batches)if(['fish','crab','turtle'].includes(kind))waterMotion(mesh,kind);}
        else if(batches)for(const [kind,mesh] of batches instanceof Map?batches:Object.entries(batches))if(['fish','crab','turtle'].includes(kind))waterMotion(mesh,kind);
        for(const [i,pool] of (window.worldResidents?.pools||[]).entries())waterMotion(pool.mesh,window.worldResidents.species[i]?.includes('crab')?'crab':'shellfish');
    }
    window.actorAnimation={track,collect,beginFrame,update,waterMotion,bindings,clock,get processed(){return processed;},get shaders(){return shaders.size;},reset(){beginFrame();for(const b of bindings.values()){b.driver.getWorldPosition(b.last);b.speed=b.weight=b.run=0;b.headingReady=false;for(const bone of b.bones){assign(bone.node,bone.source);bone.visual=pose(bone.node);}}lastActive=false;}};
    collect();installWaterMotion();
}
