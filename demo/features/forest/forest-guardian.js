/* Blender bark giant disguises itself as a normal forest tree. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installForestGuardian(){
    const data=FOREST_GUARDIAN_DATA,p=new THREE.Vector3(data.spawn[0],ancientGrove.ground(...data.spawn),data.spawn[1]);
    const group=new THREE.Group();group.name='ForestGuardian';group.position.copy(p);scene.add(group);
    const awakeModel=new THREE.Group(),treeModel=new THREE.Group();group.add(treeModel,awakeModel);
    const joints={},materials={};
    for(const [key,rgb] of Object.entries(data.materials)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        const color=new THREE.Color(...rgb);materials[key]=new THREE.MeshStandardMaterial({color,roughness:.9,...(['eye','rune'].includes(key)?{emissive:color,emissiveIntensity:1.2}:{})});
    }
    const artKit=CREATURE_STUDIO_DATA.models.forest_guardian_reference?creatureArt.create('forest_guardian_reference'):null;
    if(artKit){awakeModel.add(artKit.root);awakeModel.userData.blenderCreature='forest_guardian_reference';Object.assign(joints,{body:artKit.rig.body,leftArm:artKit.rig.armL,rightArm:artKit.rig.armR,head:artKit.rig.head,leftLeg:artKit.rig.leg0,rightLeg:artKit.rig.leg1});}
    else {for(const [key,bone] of Object.entries(data.joints)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const node=new THREE.Group();node.position.fromArray(bone.pivot);node.name='Guardian_'+key;awakeModel.add(node);joints[key]=node;}
    for(const part of data.pieces){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const pivot=data.joints[part.joint].pivot,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flatMap(v=>v.map((n,i)=>n-pivot[i])),3));geo.setIndex(part.indices);geo.computeVertexNormals();joints[part.joint].add(new THREE.Mesh(geo,materials[part.material]));}}
    for(const part of ANCIENT_GROVE_DATA.prototypes.fern){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flat(),3));geo.setIndex(part.indices);geo.computeVertexNormals();treeModel.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:new THREE.Color(...ANCIENT_GROVE_DATA.materials[part.material]),roughness:.9})));}
    addCylinderCollider(p.x,p.z,1.7,p.y-.2,p.y+17,false);const collider=colliders.at(-1);collider.name='forest-guardian';
    const panel=document.createElement('section');panel.id='forest-guardian-hud';panel.hidden=true;
    const label=document.createElement('div'),hp=document.createElement('span'),bar=document.createElement('div'),fill=document.createElement('div'),status=document.createElement('small');
    bar.className='lake-boss-bar';bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','10000');bar.append(fill);panel.append(label,hp,bar,status);gameHud.append(panel);
    const marker=new THREE.Mesh(new THREE.RingGeometry(3.2,3.45,40),new THREE.MeshBasicMaterial({color:0xdca343,side:THREE.DoubleSide,transparent:true,opacity:.85,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
    const MAX_HP=10000,MELEE_DAMAGE=65,ROOT_DAMAGE=25,ROOT_SECONDS=3;
    let health=MAX_HP,state='tree',blend=0,time=0,timer=0,cooldown=1,rootCooldown=7,roarCooldown=0,pending=null,rootTimer=0,rootAge=99,rootHit=false,rewarded=false,walkSpeed=0;
    const home=p.clone();collider.dynamicLakeMonster=true;
    const target=new THREE.Vector3(),rootTarget=new THREE.Vector3(),rootAnchor=new THREE.Vector3();
    const roots=new THREE.Group();roots.name='GuardianBindingRoots';roots.visible=false;scene.add(roots);
    const bark=new THREE.MeshStandardMaterial({color:0x59452d,roughness:.95}),rune=new THREE.MeshBasicMaterial({color:0x8cdc67});
    for(let i=0;i<8;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const a=i*Math.PI/4,curve=new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a)*2.8,-.2,Math.sin(a)*2.8),new THREE.Vector3(Math.cos(a+.15)*1.5,.15,Math.sin(a+.15)*1.5),new THREE.Vector3(Math.cos(a+.5)*.8,.9,Math.sin(a+.5)*.8),new THREE.Vector3(Math.cos(a+.9)*.45,.5,Math.sin(a+.9)*.45)]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,14,.1,5,false),bark);roots.add(mesh);const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.4,5),rune);tip.position.copy(curve.getPoint(.82));tip.rotation.z=.6;roots.add(tip);}
    const rootWarning=new THREE.Mesh(new THREE.RingGeometry(2.75,3,48),new THREE.MeshBasicMaterial({color:0x95e366,side:THREE.DoubleSide,transparent:true,opacity:.75,depthWrite:false}));rootWarning.rotation.x=-Math.PI/2;rootWarning.visible=false;scene.add(rootWarning);
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active')&&!window.moonRailway?.aboard;
    const distance=()=>Math.hypot(playerGroup.position.x-p.x,playerGroup.position.z-p.z);
    const sound=action=>window.forestAudio?.play('guardian',action,p,group);
    function releaseRoots(){rootTimer=0;rootAge=99;roots.visible=false;rootWarning.visible=false;}
    function canBind(){return rootTimer>0&&health>0&&active()&&playerGroup.position.distanceTo(rootAnchor)<5;}
    function hud(){panel.hidden=!gameState.isPlaying||distance()>42||state==='tree';label.textContent='Thần Rừng';hp.textContent=health+' / '+MAX_HP;bar.setAttribute('aria-label',label.textContent);bar.setAttribute('aria-valuenow',health);fill.style.width=health/MAX_HP*100+'%';status.textContent=state==='dead'?'Đã bị hạ':rootTimer>0?'Rễ trói chân · '+Math.ceil(rootTimer)+' giây':state==='rootcast'?'Rễ đang trỗi dậy — rời vòng xanh!':state==='summoning'?'Tuyệt chiêu: triệu hồi Sinh Linh Cây Cối!':state==='windup'?'Đòn tay — tránh vòng vàng!':'Kẻ bảo vệ Rừng Nguyên Sinh';}
    function wake(){state='waking';timer=0;sound('emerge');}
    function hit(amount){if(!active()||health<=0||!Number.isFinite(amount)||amount<=0)return false;health=Math.max(0,health-heroOutgoingDamage(amount,health));if(!health){state='dead';timer=0;marker.visible=false;collider.disabled=true;releaseRoots();sound('death');window.fieldGuide?.record(data.id,true);if(!rewarded){rewarded=true;window.monsterCamps?.add('forestHeart',1);window.itemReceipts?.scan();sfx.pickup();showNotification('Đánh bại Thần Rừng · Nhận Trái Tim Rừng Rậm!');}}else if(state==='tree')wake();hud();return true;}
    function playerAttack(hero){
        const range=hero==='rabbit'?22:2.6;if(distance()-1.7>range||Math.abs(playerGroup.position.y-p.y)>4||health<=0)return false;
        const start=playerGroup.position.clone().add(new THREE.Vector3(0,.4,0)),dir=p.clone().add(new THREE.Vector3(0,.7,0)).sub(start),steps=Math.ceil(dir.length()/.6);collider.disabled=true;let blocked=false;
        for(let i=1;i<steps-2;i++){const q=start.clone().addScaledVector(dir,i/steps);if(checkCollision(q.x,q.z,q.y,.03)){blocked=true;break;}}
        collider.disabled=health<=0;return !blocked&&hit(hero==='rabbit'?110:['dragon_knight','kingkong'].includes(hero)?135:145);
    }
    function clearHand(){const dir=playerGroup.position.clone().sub(p),steps=Math.ceil(dir.length()/.6);collider.disabled=true;let clear=true;for(let i=3;i<steps;i++){const q=p.clone().addScaledVector(dir,i/steps);if(checkCollision(q.x,q.z,q.y+.6,.05)){clear=false;break;}}collider.disabled=health<=0;return clear;}
    function beginSummon(){if(!active()||state!=='awake'||health<=0||distance()>24)return false;state='summoning';timer=0;marker.visible=false;sound('ultimate');return true;}
    function beginRoots(){state='rootcast';timer=0;rootTarget.copy(playerGroup.position);rootTarget.y=ancientGrove.ground(rootTarget.x,rootTarget.z)??rootTarget.y;rootWarning.position.copy(rootTarget).y+=.06;rootWarning.visible=true;rootAge=99;rootHit=false;sound('skill');}
    function walk(dt,near){const desired=state==='awake'&&near&&distance()>5.5?1.7:0;walkSpeed+=(desired-walkSpeed)*(1-Math.exp(-dt*5));if(desired&&walkSpeed>.01){const dir=playerGroup.position.clone().sub(p);dir.y=0;dir.normalize();const next=p.clone().addScaledVector(dir,walkSpeed*dt),y=ancientGrove.ground(next.x,next.z);collider.disabled=true;const valid=y!==null&&Math.abs(y-p.y)<.5&&Math.hypot(next.x-home.x,next.z-home.z)<22&&!checkCollision(next.x,next.z,y,1.7);collider.disabled=false;if(valid){p.set(next.x,y,next.z);group.position.copy(p);Object.assign(collider,{x:p.x,z:p.z,minY:p.y-.2,maxY:p.y+17});}}window.forestAudio?.movement('guardian',group,p,dt);}
    function update(dt){
        dt=THREE.MathUtils.clamp(dt,0,.1);if(!active()){releaseRoots();hud();return;}time+=dt;timer+=dt;cooldown=Math.max(0,cooldown-dt);rootCooldown=Math.max(0,rootCooldown-dt);roarCooldown=Math.max(0,roarCooldown-dt);
        if(rootTimer>0){if(playerGroup.position.distanceTo(rootAnchor)>5||health<=0)releaseRoots();else{rootTimer=Math.max(0,rootTimer-dt);if(!rootTimer)rootAge=Math.max(rootAge,3);}}
        if(rootAge<5){rootAge+=dt;const rise=THREE.MathUtils.smoothstep(rootAge,0,.4),fall=1-THREE.MathUtils.smoothstep(rootAge,3.2,4);roots.scale.y=Math.max(.001,rise*fall);roots.visible=rootAge<4;
            if(!rootHit&&rootAge>=.22){rootHit=true;const q=playerGroup.position;if(Math.hypot(q.x-rootTarget.x,q.z-rootTarget.z)<2.75&&Math.abs(q.y-rootTarget.y)<1.7&&window.playerLife?.targetable&&playerLife.immune<=0){playerLife.hitMonster(ROOT_DAMAGE,'guardian',{special:true});if(health>0&&playerGroup.position.distanceTo(rootTarget)<3){rootTimer=ROOT_SECONDS;rootAnchor.copy(playerGroup.position);window.crystalWings?.stopFlight();window.heroMotion?.stop();keys.jump=false;keys.swimUp=false;}}}}
        if(pending){pending.remaining-=dt;if(pending.remaining<=0){const hero=pending.hero;pending=null;playerAttack(hero);}}
        const near=ancientGrove.contains(playerGroup.position.x,playerGroup.position.z)&&distance()<27&&Math.abs(playerGroup.position.y-p.y)<12,far=distance()>38||!ancientGrove.contains(playerGroup.position.x,playerGroup.position.z);
        if(health>0){
            if(state==='tree'&&near)wake();
            if(state!=='tree'&&far){state='tree';timer=0;marker.visible=false;releaseRoots();}
            if(state==='waking'&&timer>=1.7){state='awake';timer=0;window.fieldGuide?.record(data.id);if(!roarCooldown){sound('roar');roarCooldown=14;}}
            if(state==='awake'&&near){
                if(!rootCooldown&&rootTimer===0){beginRoots();rootCooldown=10;}
                else if(cooldown===0&&distance()<7&&Math.abs(playerGroup.position.y-p.y)<4&&clearHand()){state='windup';timer=0;target.copy(playerGroup.position);marker.position.copy(target).y+=.06;marker.visible=true;}
            }
            if(state==='windup'&&timer>=.9){sound('attack');if(playerGroup.position.distanceTo(target)<3.2&&distance()<8&&clearHand())playerLife.hitMonster(MELEE_DAMAGE,'guardian');if(health>0&&state==='windup'){state='recover';timer=0;}cooldown=2.6;marker.visible=false;}
            if(state==='recover'&&timer>=.55){state='awake';timer=0;}
            if(state==='rootcast'&&timer>=1.25){rootWarning.visible=false;rootAge=0;roots.position.copy(rootTarget);roots.visible=true;roots.scale.y=.001;state='rootrecover';timer=0;}
            if(state==='rootrecover'&&timer>=.6){state='awake';timer=0;}
            if(state==='summoning'&&timer>=3.1){state='awake';timer=0;cooldown=Math.max(cooldown,1);}
        }
        const desired=state==='tree'?0:1;blend+=(desired-blend)*(1-Math.exp(-dt*3));treeModel.visible=blend<.98;treeModel.scale.setScalar(Math.max(.001,1-blend));awakeModel.visible=blend>.02;awakeModel.scale.setScalar(Math.max(.001,blend));
        if(health>0){const yaw=Math.atan2(playerGroup.position.x-p.x,playerGroup.position.z-p.z);awakeModel.rotation.y+=Math.atan2(Math.sin(yaw-awakeModel.rotation.y),Math.cos(yaw-awakeModel.rotation.y))*(1-Math.exp(-dt*3));}
        else{awakeModel.rotation.z+=(Math.min(Math.PI*.48,timer*.36)-awakeModel.rotation.z)*(1-Math.exp(-dt*5));panel.hidden=distance()>42;}
        if(health>0)walk(dt,near);marker.scale.setScalar(1+Math.sin(time*12)*.025);rootWarning.material.opacity=.5+Math.sin(time*13)*.22;hud();
    }
    function pause(){pending=null;marker.visible=false;releaseRoots();window.forestAudio?.stop();if(health>0){state='tree';timer=0;cooldown=1;}}
    window.forestGuardian={group,awakeModel,treeModel,joints,artKit,position:p,collider,marker,roots,rootWarning,data,update,hit,playerAttack,pause,beginSummon,releaseRoots,stats:{maxHealth:MAX_HP,meleeDamage:MELEE_DAMAGE,rootDamage:ROOT_DAMAGE,rootSeconds:ROOT_SECONDS},beginPlayerAttack(hero){pending={hero,remaining:.18};},get health(){return health;},get maxHealth(){return MAX_HP;},get timer(){return timer;},get state(){return state;},get roaring(){return health>0&&state==='awake'&&roarCooldown>11.6;},get rooted(){return canBind();},get rootRemaining(){return canBind()?rootTimer:0;}};
    awakeModel.visible=false;hud();
}
