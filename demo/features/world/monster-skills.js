/* Special attacks have independent cooldowns. Ordinary attacks stay in their AI modules. */
function installMonsterSkills(){
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    const states={ness:{cooldown:5},space_croc:{cooldown:7},forest:{cooldown:6}},projectiles=[],minions=[];
    const group=new THREE.Group();group.name='MonsterSpecialSkills';scene.add(group);
    const status=document.createElement('div');status.id='monster-skill-warning';status.setAttribute('role','status');status.hidden=true;gameHud.append(status);
    const sphere=new THREE.SphereGeometry(1,16,10),wood=new THREE.MeshStandardMaterial({color:0x564a38,roughness:1}),leaf=new THREE.MeshStandardMaterial({color:0x447b58,roughness:.9}),glow=new THREE.MeshBasicMaterial({color:0x91fff1});
    let capture=null,immunity=0,pending=null,bleed=null;
    function previewMinion(){const model=new THREE.Group();
                const trunk=new THREE.Mesh(sphere,wood);trunk.scale.set(.42,.85,.38);trunk.position.y=.7;model.add(trunk);
                const crown=new THREE.Mesh(sphere,leaf);crown.scale.set(.85,.65,.7);crown.position.y=1.7;model.add(crown);
                for(const side of [-1,1]){const arm=new THREE.Mesh(sphere,wood);arm.scale.set(.17,.65,.17);arm.position.set(side*.62,.9,0);arm.rotation.z=side*.7;model.add(arm);const eye=new THREE.Mesh(sphere,glow);eye.scale.set(.08,.09,.05);eye.position.set(side*.16,1.13,.35);model.add(eye);}
        return model;
    }
    function ring(color,radius){const mesh=new THREE.Mesh(new THREE.RingGeometry(radius-.12,radius,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.visible=false;group.add(mesh);return mesh;}
    for(const s of Object.values(states)){s.phase='idle';s.timer=0;s.marker=ring(0xff714e,4);}
    const isBusy=id=>states[id]?.phase!=='idle'&&Boolean(states[id]);
    function cleanupMinions(){for(const m of minions)group.remove(m.group,m.marker);minions.length=0;}
    function release(){
        if(!capture)return;const last=capture;capture=null;
        // Never drag a player back after fast travel or an oxygen respawn.
        if(playerGroup.position.distanceTo(last.anchor)<6){playerGroup.position.copy(last.release);currentGroundY=last.release.y;jumpY=0;jumpVelocityY=0;isGrounded=false;}
        resetGameplayInput();
    }
    function pause(){release();bleed=null;pending=null;status.hidden=true;for(const s of Object.values(states)){s.phase='idle';s.marker.visible=false;s.cooldown=Math.max(2,s.cooldown);}for(const p of projectiles)group.remove(p.mesh);projectiles.length=0;cleanupMinions();}
    function landDamage(amount,ignoreArmor=false){
        if(!active()||immunity>0||!Number.isFinite(amount)||amount<=0)return false;
        amount=heroIncomingDamage(amount);const armor=ignoreArmor?0:Math.min(gameState.armor,amount);gameState.armor-=armor;gameState.health=Math.max(0,gameState.health-amount+armor);immunity=.45;
        gameHud.classList.add('monster-hit');setTimeout(()=>gameHud.classList.remove('monster-hit'),250);
        if(gameState.health===0){const mountain=window.bachKhuyet?.contains(playerGroup.position.x,playerGroup.position.z);pause();Object.assign(gameState,{health:gameState.maxHealth,armor:gameState.maxArmor,stamina:100,oxygen:100});resetGameplayInput();if(mountain)bachKhuyet.travel();else ancientGrove.travel();immunity=3;showNotification('Bạn đã gục ngã. Hồi phục tại lối vào an toàn.');}
        updatePlayerVitals();return true;
    }
    function applyBleed(){if(active())bleed={remaining:8,tick:1};}
    function start(id){
        const s=states[id];if(!s||s.phase!=='idle'||s.cooldown>0||!active())return false;
        const m=lakeMonsters.actors.find(a=>a.spec.id===id);
        if(id==='forest'){if(forestGuardian.health<=0||forestGuardian.state!=='awake'||playerGroup.position.distanceTo(forestGuardian.position)>24)return false;}
        else if(!m||!lakeMonsters.canTarget(m,playerGroup.position)||!['patrol','pursue','recover'].includes(m.state)||(id==='space_croc'&&m.position.distanceTo(playerGroup.position)>42))return false;
        s.phase='windup';s.timer=0;s.target=playerGroup.position.clone();s.marker.position.copy(s.target).y+=.08;s.marker.visible=true;
        if(m){m.state='pursue';m.timer=0;m.marker.visible=false;}
        if(id==='forest'){
            cleanupMinions();
            for(let i=0;i<4;i++){
                const a=i*Math.PI/2,x=s.target.x+Math.cos(a)*3.7,z=s.target.z+Math.sin(a)*3.7,y=ancientGrove.ground(x,z);
                if(y===null||checkCollision(x,z,y,.65))continue;
                const model=previewMinion();model.position.set(x,y,z);group.add(model);
                const mark=ring(0x91d97a,1.2);mark.position.set(x,y+.07,z);mark.visible=true;model.scale.y=.01;
                minions.push({group:model,marker:mark,health:190,age:0,cooldown:0,state:'emerging'});
            }
        }
        return true;
    }
    function segmentDistance(p,a,b){const d=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(d)/(d.lengthSq()||1)));return p.distanceTo(a.clone().addScaledVector(d,t));}
    function update(dt){
        dt=Math.max(0,Math.min(.1,dt));if(!active()){pause();return;}immunity=Math.max(0,immunity-dt);
        if(bleed){bleed.remaining-=dt;bleed.tick-=dt;if(bleed.tick<=0){bleed.tick+=1;landDamage(4,true);}if(bleed&&bleed.remaining<=0)bleed=null;}
        if(pending){pending.time-=dt;if(pending.time<=0){const range=pending.hero==='rabbit'?22:2.8;const m=minions.filter(m=>m.health>0&&m.group.position.distanceTo(playerGroup.position)<range).sort((a,b)=>a.group.position.distanceTo(playerGroup.position)-b.group.position.distanceTo(playerGroup.position))[0];if(m){m.health-=145;if(m.health<=0)window.fieldGuide?.record('forest_sapling',true);}pending=null;}}
        for(const [id,s] of Object.entries(states)){
            s.cooldown=Math.max(0,s.cooldown-dt);const m=lakeMonsters.actors.find(a=>a.spec.id===id);
            const eligible=id==='forest'?forestGuardian.health>0&&ancientGrove.contains(playerGroup.position.x,playerGroup.position.z)&&playerGroup.position.distanceTo(forestGuardian.position)<30:lakeMonsters.canTarget(m,playerGroup.position);
            if(!eligible){if(id==='space_croc')release();s.phase='idle';s.marker.visible=false;if(id==='forest')cleanupMinions();continue;}
            if(s.phase==='idle'){if(s.cooldown===0)start(id);continue;}
            s.timer+=dt;s.marker.material.opacity=.45+Math.sin(s.timer*16)*.23;
            if(s.phase==='windup'&&s.timer>=1.4){
                s.marker.visible=false;s.phase='recover';s.timer=0;s.cooldown=id==='forest'?16:12;
                if(id==='ness'){
                    const origin=m.group.localToWorld(new THREE.Vector3(0,34,23)),mesh=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:0x73ecff}));mesh.scale.setScalar(1.05);mesh.position.copy(origin);group.add(mesh);
                    const halo=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:0x4267ff,transparent:true,opacity:.22,depthWrite:false}));halo.scale.setScalar(1.5);mesh.add(halo);
                    projectiles.push({mesh,velocity:s.target.clone().add(new THREE.Vector3(0,.35,0)).sub(origin).normalize().multiplyScalar(34),life:7});
                }else if(id==='space_croc'&&playerGroup.position.distanceTo(s.target)<4&&m.position.distanceTo(playerGroup.position)<47){
                    const releasePosition=playerGroup.position.clone();if(lakeMonsters.damagePlayer(68)&&lakeMonsters.canTarget(m,playerGroup.position)){capture={actor:m,remaining:1.3,release:releasePosition,anchor:playerGroup.position.clone()};resetGameplayInput();}
                }
            }
            if(s.phase==='recover'&&s.timer>1.6)s.phase='idle';
        }
        if(capture){
            if(!lakeMonsters.canTarget(capture.actor,capture.release)||playerGroup.position.distanceTo(capture.anchor)>6)release();
            else {capture.remaining-=dt;if(capture.remaining<=0)release();else {const m=capture.actor;m.joints.jaw.rotation.x=.3;capture.anchor.copy(m.group.localToWorld(new THREE.Vector3(0,1.2,28)));playerGroup.position.copy(capture.anchor);jumpVelocityY=0;}}
        }
        for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(!p)continue;const previous=p.mesh.position.clone();p.mesh.position.addScaledVector(p.velocity,dt);p.life-=dt;p.mesh.rotation.y+=dt*3;
            if(segmentDistance(playerGroup.position.clone().add(new THREE.Vector3(0,.3,0)),previous,p.mesh.position)<1.45){if(lakeMonsters.damagePlayer(78))p.life=0;}
            const direction=p.mesh.position.clone().sub(previous),length=direction.length();
            const ray=new THREE.Raycaster(previous,direction.normalize(),0,length+.3);
            if(ray.intersectObjects(mercuryLake.group.children.filter(o=>o.name.startsWith('MercuryArchitecture_')),false).length||p.mesh.position.y<realmTerrainHeight(p.mesh.position.x,p.mesh.position.z))p.life=0;
            if(p.life<=0){group.remove(p.mesh);p.mesh.material.dispose();projectiles.splice(i,1);}
        }
        for(let i=minions.length-1;i>=0;i--){const m=minions[i];if(!m)continue;m.age+=dt;m.cooldown=Math.max(0,m.cooldown-dt);
            if(forestGuardian.health<=0||m.age>17||m.health<=0){group.remove(m.group,m.marker);minions.splice(i,1);continue;}
            if(m.age<1.4){m.group.scale.y=Math.max(.01,m.age/1.4);continue;}m.state='chasing';m.marker.visible=false;m.group.scale.y=1;
            const p=playerGroup.position,dir=p.clone().sub(m.group.position);dir.y=0;const distance=dir.length();
            if(distance>1){dir.normalize();const x=m.group.position.x+dir.x*2.4*dt,z=m.group.position.z+dir.z*2.4*dt,y=ancientGrove.ground(x,z);if(y!==null&&!checkCollision(x,z,y,.45))m.group.position.set(x,y,z);m.group.rotation.y=Math.atan2(dir.x,dir.z);}
            if(distance<1.35&&Math.abs(p.y-m.group.position.y)<2&&m.cooldown===0){landDamage(12);m.cooldown=1.3;}m.group.rotation.z=Math.sin(m.age*7)*.06;
        }
        const casting=Object.entries(states).find(([,s])=>s.phase==='windup');
        const text=capture?'Cá sấu đang ngoạm bạn — sắp nhả ra!':casting?({ness:'Loch Ness tụ cầu năng lượng — né sang bên!',space_croc:'Cá sấu chuẩn bị ngoạm — rời vòng đỏ!',forest:'Thần Rừng triệu hồi sinh linh — tránh các vòng xanh!'}[casting[0]]):bleed?'Chảy máu · '+Math.ceil(bleed.remaining)+' giây':'';
        status.hidden=!text;status.textContent=text;
    }
    window.monsterSkills={previewMinion,states,projectiles,minions,start,update,pause,release,landDamage,applyBleed,busy:isBusy,beginPlayerAttack(hero){pending={hero,time:.18};},get captured(){return Boolean(capture);},get bleed(){return bleed;}};
}
