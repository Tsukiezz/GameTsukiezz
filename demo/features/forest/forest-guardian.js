/* Blender bark giant disguises itself as a normal forest tree. */
function installForestGuardian(){
    const data=FOREST_GUARDIAN_DATA,p=new THREE.Vector3(data.spawn[0],ancientGrove.ground(...data.spawn),data.spawn[1]);
    const group=new THREE.Group();group.name='ForestGuardian';group.position.copy(p);scene.add(group);
    const awakeModel=new THREE.Group(),treeModel=new THREE.Group();group.add(treeModel,awakeModel);
    const joints={},materials={};
    for(const [key,rgb] of Object.entries(data.materials)){
        const color=new THREE.Color(...rgb);materials[key]=new THREE.MeshStandardMaterial({color,roughness:.9,...(['eye','rune'].includes(key)?{emissive:color,emissiveIntensity:1.2}:{})});
    }
    for(const [key,bone] of Object.entries(data.joints)){const node=new THREE.Group();node.position.fromArray(bone.pivot);node.name='Guardian_'+key;awakeModel.add(node);joints[key]=node;}
    for(const part of data.pieces){const pivot=data.joints[part.joint].pivot,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flatMap(v=>v.map((n,i)=>n-pivot[i])),3));geo.setIndex(part.indices);geo.computeVertexNormals();joints[part.joint].add(new THREE.Mesh(geo,materials[part.material]));}
    for(const part of ANCIENT_GROVE_DATA.prototypes.fern){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flat(),3));geo.setIndex(part.indices);geo.computeVertexNormals();treeModel.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:new THREE.Color(...ANCIENT_GROVE_DATA.materials[part.material]),roughness:.9})));}
    addCylinderCollider(p.x,p.z,1.7,p.y-.2,p.y+17,false);const collider=colliders.at(-1);collider.name='forest-guardian';
    const panel=document.createElement('section');panel.id='forest-guardian-hud';panel.hidden=true;
    const label=document.createElement('div'),hp=document.createElement('span'),bar=document.createElement('div'),fill=document.createElement('div'),status=document.createElement('small');
    bar.className='lake-boss-bar';bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','7000');bar.append(fill);panel.append(label,hp,bar,status);gameHud.append(panel);
    const marker=new THREE.Mesh(new THREE.RingGeometry(3.2,3.45,40),new THREE.MeshBasicMaterial({color:0xdca343,side:THREE.DoubleSide,transparent:true,opacity:.85,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
    let health=7000,state='tree',blend=0,time=0,timer=0,cooldown=1,immunity=0,pending=null;const target=new THREE.Vector3();
    const tr=(vi,en)=>window.tsuventureSettings?.language==='en'?en:vi;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    const distance=()=>Math.hypot(playerGroup.position.x-p.x,playerGroup.position.z-p.z);
    function hud(){panel.hidden=!gameState.isPlaying||distance()>42||state==='tree';label.textContent=tr('Thần Rừng','Forest Guardian');hp.textContent=health+' / 7000';bar.setAttribute('aria-label',label.textContent);bar.setAttribute('aria-valuenow',health);fill.style.width=health/70+'%';status.textContent=state==='dead'?tr('Đã bị hạ','Defeated'):state==='windup'?tr('Thần Rừng chuẩn bị đập tay!','The guardian is preparing a slam!'):tr('Kẻ bảo vệ Rừng Nguyên Sinh','Defender of the Primordial Forest');}
    function hit(amount){if(!active()||health<=0||!Number.isFinite(amount)||amount<=0)return false;health=Math.max(0,health-amount);if(health===0){state='dead';timer=0;marker.visible=false;collider.disabled=true;window.fieldGuide?.record(data.id,true);}else if(state==='tree'){state='waking';timer=0;}hud();return true;}
    function playerAttack(hero){
        const range=hero==='rabbit'?22:2.6;if(distance()-1.7>range||Math.abs(playerGroup.position.y-p.y)>4||health<=0)return false;
        const start=playerGroup.position.clone().add(new THREE.Vector3(0,.4,0)),end=p.clone().add(new THREE.Vector3(0,.7,0)),dir=end.sub(start),length=dir.length();
        // Tree trunks and titanium walls block ranged strikes.
        const steps=Math.ceil(length/.6);collider.disabled=true;let blocked=false;
        for(let i=1;i<steps-2;i++){const q=start.clone().addScaledVector(dir,i/steps);if(checkCollision(q.x,q.z,q.y,.03)){blocked=true;break;}}
        collider.disabled=health<=0;if(blocked)return false;return hit(hero==='rabbit'?110:['dragon_knight','kingkong'].includes(hero)?135:145);
    }
    function hurt(){
        if(!active()||immunity>0||Math.abs(playerGroup.position.y-target.y)>2||playerGroup.position.distanceTo(target)>3.2)return false;
        const amount=heroIncomingDamage(32),armor=Math.min(gameState.armor,amount);gameState.armor-=armor;gameState.health=Math.max(0,gameState.health-(amount-armor));immunity=.8;
        gameHud.classList.add('monster-hit');setTimeout(()=>gameHud.classList.remove('monster-hit'),250);
        if(gameState.health===0){Object.assign(gameState,{health:100,armor:100,stamina:100,oxygen:100});resetGameplayInput();ancientGrove.travel();pause();immunity=3;showNotification(tr('Thần Rừng đã đánh bại bạn. Hồi phục tại cổng rừng.','The guardian defeated you. Recovered at the forest gate.'));}
        updatePlayerVitals();return true;
    }
    function update(dt){
        dt=Math.max(0,Math.min(.1,dt));if(!active()){hud();return;}time+=dt;timer+=dt;cooldown=Math.max(0,cooldown-dt);immunity=Math.max(0,immunity-dt);
        if(pending){pending.remaining-=dt;if(pending.remaining<=0){playerAttack(pending.hero);pending=null;}}
        const near=ancientGrove.contains(playerGroup.position.x,playerGroup.position.z)&&distance()<20&&Math.abs(playerGroup.position.y-p.y)<8;
        const far=distance()>32||!ancientGrove.contains(playerGroup.position.x,playerGroup.position.z);
        if(window.monsterSkills?.busy('forest'))cooldown=Math.max(cooldown,.2);
        if(health>0){
            if(state==='tree'&&near){state='waking';timer=0;}
            if(state!=='tree'&&far){state='tree';timer=0;marker.visible=false;}
            if(state==='waking'&&timer>1.7){state='awake';timer=0;window.fieldGuide?.record(data.id);}
            if(state==='awake'&&near&&cooldown===0){state='windup';timer=0;target.copy(playerGroup.position);marker.position.set(target.x,target.y+.06,target.z);marker.visible=true;}
            if(state==='windup'&&timer>=1.2){if(!far)hurt();if(health>0&&state!=='tree')state='awake';timer=0;cooldown=2.2;marker.visible=false;}
        }
        const desired=state==='tree'?0:1;blend+=(desired-blend)*(1-Math.exp(-dt*3));
        treeModel.visible=blend<.98;treeModel.scale.setScalar(Math.max(.001,1-blend));awakeModel.visible=blend>.02;awakeModel.scale.setScalar(Math.max(.001,blend));
        if(health>0){
            const yaw=Math.atan2(playerGroup.position.x-p.x,playerGroup.position.z-p.z);awakeModel.rotation.y+=Math.atan2(Math.sin(yaw-awakeModel.rotation.y),Math.cos(yaw-awakeModel.rotation.y))*(1-Math.exp(-dt*3));
            const strike=state==='windup'?Math.sin(Math.min(1,timer/1.2)*Math.PI)*1.2:Math.sin(time*1.4)*.07;
            joints.leftArm.rotation.x=-strike;joints.rightArm.rotation.x=-strike;joints.head.rotation.z=Math.sin(time*.8)*.025;
        }else{awakeModel.rotation.z=Math.min(Math.PI/2,timer*.35);panel.hidden=distance()>42;}
        marker.scale.setScalar(1+Math.sin(time*12)*.025);hud();
    }
    function pause(){pending=null;marker.visible=false;if(health>0){state='tree';timer=0;cooldown=1;}}
    window.forestGuardian={group,awakeModel,treeModel,joints,position:p,collider,marker,data,update,hit,playerAttack,pause,beginPlayerAttack(hero){pending={hero,remaining:.18};},get health(){return health;},get state(){return state;}};
    awakeModel.visible=false;hud();
}
