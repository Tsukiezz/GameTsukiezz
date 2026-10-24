/* Articulated Blender meshes, authoritative boss health and lake-only combat. */
function installLakeMonsters(){
    const data=LAKE_MONSTER_DATA,lake=mercuryLake.data,actors=[],dynamicColliders=[];
    const panel=document.createElement('section');panel.id='lake-boss-hud';panel.hidden=true;panel.setAttribute('aria-label','Quái vật Hồ Thủy Ngân');
    const safety=document.createElement('div');safety.className='lake-boss-safety';panel.append(safety);document.getElementById('game-hud').append(panel);
    const statuses={patrol:'Tuần tra',pursue:'Đang săn đuổi',windup:'Chuẩn bị tấn công',recover:'Đang hồi đòn',dead:'Đã bị hạ'};
    let immunity=0,pendingAttack=null,elapsed=0;
    function onBridge(p){
        if(p.y<5.1||p.y>8.5)return false;
        const x=p.x-lake.x,z=p.z-lake.z;
        if(Math.abs(x)<=3.5&&z>=0&&z<=150)return true;
        if(Math.abs(x)<=12.5&&z>=146&&z<=162)return true;
        if(Math.abs(x)<=15&&Math.abs(z)<=15)return true;
        if(Math.abs(x)<=lake.ramp.width/2&&z>=162&&z<=192){
            const y=lake.ramp.bottom+(lake.ramp.top-lake.ramp.bottom)*(z-162)/30;return p.y>=y-.25&&p.y<=y+2;
        }
        return false;
    }
    function inZone(p){return Math.hypot((p.x-lake.x)/lake.rx,(p.z-lake.z)/lake.rz)<1.36&&p.y<20;}
    function canTarget(m,p){return m.health>0&&inZone(p)&&Boolean(window.playerSurvival?.inWater(p))&&!onBridge(p)&&m.position.distanceTo(new THREE.Vector3(p.x,m.position.y,p.z))<=m.spec.detect;}
    for(const spec of data.models){
        const group=new THREE.Group();group.name='LakeBoss_'+spec.id;scene.add(group);
        const joints={},materials={};
        for(const [key,rgb] of Object.entries(data.materials)){
            const color=new THREE.Color(...rgb);materials[key]=['eye','cosmic','rune'].includes(key)?new THREE.MeshBasicMaterial({color}):new THREE.MeshStandardMaterial({color,roughness:.7,metalness:key==='plate'?.4:.12});
        }
        for(const [key,bone] of Object.entries(spec.joints)){
            const joint=new THREE.Group();joint.name=spec.id+'_'+key;const parent=bone.parent?spec.joints[bone.parent].pivot:[0,0,0];joint.position.fromArray(bone.pivot).sub(new THREE.Vector3(...parent));
            (bone.parent?joints[bone.parent]:group).add(joint);joints[key]=joint;
        }
        for(const part of spec.pieces){
            const pivot=spec.joints[part.joint].pivot;
            const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flatMap(v=>v.map((n,i)=>n-pivot[i])),3));geometry.setIndex(part.indices);geometry.computeVertexNormals();
            const mesh=new THREE.Mesh(geometry,materials[part.material]);mesh.name=spec.id+'_'+part.joint+'_'+part.material;mesh.userData.lakeMonster=spec.id;joints[part.joint].add(mesh);
        }
        const row=document.createElement('div');row.className='lake-boss-row';
        const label=document.createElement('div');label.className='lake-boss-label';const name=document.createElement('span');name.textContent=spec.name;
        const hp=document.createElement('span');label.append(name,hp);
        const bar=document.createElement('div');bar.className='lake-boss-bar';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',spec.name);bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',spec.maxHealth);
        const fill=document.createElement('div');bar.append(fill);const state=document.createElement('small');row.append(label,bar,state);panel.append(row);
        const marker=new THREE.Mesh(new THREE.RingGeometry(spec.id==='ness'?7:6,spec.id==='ness'?7.4:6.4,48),new THREE.MeshBasicMaterial({color:0xff334c,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
        const m={spec,group,joints,materials,health:spec.maxHealth,maxHealth:spec.maxHealth,position:new THREE.Vector3(lake.x+spec.spawn[0],-2,lake.z+spec.spawn[1]),state:'patrol',timer:0,cooldown:0,phase:0,flash:0,yaw:0,marker,colliders:[],hp,bar,fill,stateLabel:state};
        const shapes=spec.id==='ness'?[[0,0,7.5],[0,-14,4],[0,-27,2],[0,10,3.5]]:[[0,-3,8],[0,-22,4.5],[0,-37,2],[0,21,6],[0,32,4.5]];
        for(const [x,z,radius] of shapes){
            const high=z<-20?2.5:z<-10?4:spec.id==='ness'&&z===10?43:spec.id==='space_croc'&&z>15?13:8;
            const c={type:'cylinder',x:m.position.x+x,z:m.position.z+z,radius,minY:-12,maxY:6,localMinY:-8,localMaxY:high,isStandable:false,name:'lake-boss-'+spec.id,dynamicLakeMonster:true,localX:x,localZ:z};
            colliders.push(c);dynamicColliders.push(c);m.colliders.push(c);
        }
        group.position.copy(m.position);actors.push(m);
    }
    function blockedAt(m,x,z,yaw){
        const sin=Math.sin(yaw),cos=Math.cos(yaw);
        m.colliders.forEach(c=>c.disabled=true);
        const blocked=m.colliders.filter(c=>c.localMaxY>4).some(c=>checkCollision(x+c.localX*cos+c.localZ*sin,z-c.localX*sin+c.localZ*cos,m.position.y+2,c.radius));
        m.colliders.forEach(c=>c.disabled=m.health<=0);return blocked;
    }
    function syncColliders(m){
        const sin=Math.sin(m.yaw),cos=Math.cos(m.yaw);
        for(const c of m.colliders){c.x=m.position.x+c.localX*cos+c.localZ*sin;c.z=m.position.z-c.localX*sin+c.localZ*cos;c.minY=m.position.y+c.localMinY;c.maxY=m.position.y+c.localMaxY;c.disabled=m.health<=0;}
    }
    function setState(m,state){m.state=state;m.timer=0;if(state!=='windup')m.marker.visible=false;}
    function distanceToBody(m,p){return Math.min(...m.colliders.map(c=>Math.hypot(Math.max(0,Math.hypot(p.x-c.x,p.z-c.z)-c.radius),Math.max(0,c.minY-p.y,p.y-c.maxY))));}
    function damagePlayer(amount){
        if(!Number.isFinite(amount)||amount<=0)return false;
        if(!gameState.isPlaying||gameState.inDialogue||!window.playerSurvival?.inWater(playerGroup.position)||onBridge(playerGroup.position)||immunity>0)return false;
        amount=heroIncomingDamage(amount);const absorbed=Math.min(gameState.armor,amount);gameState.armor-=absorbed;gameState.health=Math.max(0,gameState.health-(amount-absorbed));immunity=.65;
        gameHud.classList.add('monster-hit');setTimeout(()=>gameHud.classList.remove('monster-hit'),250);
        if(gameState.health===0){
            gameState.health=gameState.maxHealth;gameState.armor=gameState.maxArmor;gameState.stamina=100;gameState.oxygen=100;immunity=3;pendingAttack=null;
            for(const actor of actors)if(actor.health>0)setState(actor,'patrol');
            resetGameplayInput();mercuryLake.travel();showNotification('Bạn đã gục ngã. Hồi phục tại cầu đá an toàn.');
        }
        updatePlayerVitals();return true;
    }
    function hitMonster(m,amount){
        if(m.health<=0||!Number.isFinite(amount)||amount<=0)return false;
        m.health=Math.max(0,m.health-Math.max(0,amount));m.flash=.22;
        if(m.health===0){setState(m,'dead');syncColliders(m);window.fieldGuide?.record(m.spec.id,true);showNotification('Đã hạ '+m.spec.name+'!');}
        return true;
    }
    function beginPlayerAttack(hero){pendingAttack={hero,remaining:.18};}
    function resolvePlayerAttack(hero){
        const p=playerGroup.position,range=hero==='rabbit'?22:2.6;
        if(!inZone(p)||p.y>9)return false;
        const target=actors.filter(m=>m.health>0&&distanceToBody(m,p)<=range).sort((a,b)=>distanceToBody(a,p)-distanceToBody(b,p))[0];
        if(!target)return false;
        // Stone blocks attacks: a ranged hero cannot shoot through a cliff.
        const end=target.position.clone();end.y=p.y+.4;
        const start=p.clone().add(new THREE.Vector3(0,.4,0)),direction=end.clone().sub(start),distance=direction.length();
        const ray=new THREE.Raycaster(start,direction.normalize(),.1,distance*.8);
        if(ray.intersectObjects(mercuryLake.group.children.filter(o=>o.name.startsWith('MercuryArchitecture_')),false).length)return false;
        return hitMonster(target,hero==='rabbit'?110:['dragon_knight','kingkong'].includes(hero)?135:145);
    }
    function moveActor(m,dx,dz){
        const distance=Math.hypot(dx,dz);if(distance<.00001)return;
        for(const turn of [0,.55,-.55,1.1,-1.1]){
            const tx=dx*Math.cos(turn)-dz*Math.sin(turn),tz=dx*Math.sin(turn)+dz*Math.cos(turn);
            const x=m.position.x+tx,z=m.position.z+tz,lx=x-lake.x,lz=z-lake.z;
            if(m.spec.side*lx<26||Math.hypot(lx/(lake.rx*.82),lz/(lake.rz*.82))>1)continue;
            const desired=Math.atan2(tx,tz),yaw=m.yaw+Math.atan2(Math.sin(desired-m.yaw),Math.cos(desired-m.yaw))*.12;
            const sin=Math.sin(yaw),cos=Math.cos(yaw);
            // Keep the whole body out of the stone bridge corridor, and never
            // move a large collision shape onto the player's current position.
            if(m.colliders.some(c=>m.spec.side*(lx+c.localX*cos+c.localZ*sin)-c.radius<5.5))continue;
            if(m.colliders.some(c=>Math.hypot(playerGroup.position.x-x-c.localX*cos-c.localZ*sin,playerGroup.position.z-z+c.localX*sin-c.localZ*cos)<c.radius+.6))continue;
            if(blockedAt(m,x,z,yaw))continue;
            m.position.x=x;m.position.z=z;m.yaw=yaw;return;
        }
    }
    function pose(m,dt){
        const j=m.joints;m.phase+=dt;
        const special=window.monsterSkills?.states[m.spec.id];
        const wind=m.state==='windup'?Math.min(1,m.timer/m.spec.windup):special?.phase==='windup'?Math.min(1,special.timer/1.4):0;
        j.tail.rotation.y=Math.sin(m.phase*1.8)*.19;j.finL.rotation.z=Math.sin(m.phase*2)*.12;j.finR.rotation.z=-Math.sin(m.phase*2)*.12;
        if(j.neck)j.neck.rotation.z=Math.sin(m.phase*.8)*.05;
        j.head.rotation.x=Math.sin(m.phase*1.2)*.045-wind*(m.spec.id==='space_croc'?.3:.12);
        j.jaw.rotation.x=.055+wind*.72+(m.state==='recover'?Math.max(0,.7-m.timer)*.65:0);
        m.group.position.copy(m.position);m.group.position.y+=Math.sin(m.phase*1.3)*.24+wind*(m.spec.id==='space_croc'?1.5:.6);
        m.group.rotation.y=m.yaw;
        if(m.state==='dead'){m.group.position.y-=m.timer*6;m.group.rotation.z=Math.min(.7,m.timer*.23);m.group.visible=m.timer<4;}
        m.flash=Math.max(0,m.flash-dt);
        for(const mat of Object.values(m.materials))if(mat.isMeshStandardMaterial){mat.emissive.setHex(m.flash>0?0x8b1526:0x000000);mat.emissiveIntensity=m.flash>0?.7:0;}
        syncColliders(m);
    }
    function updateHUD(){
        const p=playerGroup.position;panel.hidden=!gameState.isPlaying||Math.hypot(p.x-lake.x,p.z-lake.z)>230;
        const safe=!window.playerSurvival?.inWater(p),text=onBridge(p)?'Cầu đá: an toàn':safe?'Trên bờ: an toàn':'Trong nước: quái vật có thể phát hiện bạn';
        const translate=window.tsuventureSettings?.translate||((v)=>v);if(safety.textContent!==translate(text))safety.textContent=translate(text);
        safety.classList.toggle('safe',safe);
        for(const m of actors){
            const value=m.health+' / '+m.maxHealth;if(m.hp.textContent!==value)m.hp.textContent=value;
            if(m.bar.getAttribute('aria-valuenow')!==String(m.health)){m.bar.setAttribute('aria-valuenow',m.health);m.fill.style.width=(100*m.health/m.maxHealth)+'%';}
            const state=translate(statuses[m.state]);if(m.stateLabel.textContent!==state)m.stateLabel.textContent=state;
        }
    }
    function update(dt){
        dt=Math.min(.1,Math.max(0,dt));updateHUD();
        if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active')){pendingAttack=null;return;}
        elapsed+=dt;immunity=Math.max(0,immunity-dt);
        if(pendingAttack){pendingAttack.remaining-=dt;if(pendingAttack.remaining<=0){const hero=pendingAttack.hero;pendingAttack=null;resolvePlayerAttack(hero);}}
        for(const m of actors){
            m.timer+=dt;m.cooldown=Math.max(0,m.cooldown-dt);
            if(m.health<=0){pose(m,dt);continue;}
            if(window.monsterSkills?.busy(m.spec.id)){pose(m,dt);continue;}
            const p=playerGroup.position,eligible=canTarget(m,p),distance=Math.hypot(m.position.x-p.x,m.position.z-p.z);
            const dive=m.spec.id==='ness'?52:23;
            const depth=eligible?Math.max(lake.depthFloor+9,p.y-(m.spec.id==='ness'?10:4)):-2-Math.pow(Math.sin(m.phase*(m.spec.id==='ness'?.18:.22)),2)*dive;
            m.position.y+=(depth-m.position.y)*(1-Math.exp(-dt*.8));
            if(!eligible&&m.state!=='patrol'){setState(m,'patrol');m.cooldown=Math.max(m.cooldown,1);}
            if(eligible&&m.state==='patrol')setState(m,'pursue');
            if(m.state==='pursue'){
                if(distance<=m.spec.reach&&Math.abs(m.position.y-p.y)<18&&m.cooldown===0){
                    setState(m,'windup');m.target=p.clone();m.marker.position.set(p.x,p.y>lake.waterY-2?lake.waterY+.08:p.y+.2,p.z);m.marker.visible=true;
                }else if(distance>m.spec.reach*.72){
                    moveActor(m,(p.x-m.position.x)/distance*m.spec.speed*dt,(p.z-m.position.z)/distance*m.spec.speed*dt);
                }
            }else if(m.state==='windup'){
                m.marker.material.opacity=.35+Math.sin(m.timer*18)*.25;
                if(m.timer>=m.spec.windup){
                    if(canTarget(m,p)&&p.distanceTo(m.target)<(m.spec.id==='ness'?7:6)&&Math.abs(m.position.y-p.y)<23&&distance<=m.spec.reach+5)damagePlayer(m.spec.damage);
                    // A lethal strike can return the player to the safe bridge.
                    setState(m,onBridge(playerGroup.position)?'patrol':'recover');m.cooldown=2.4;
                }
            }else if(m.state==='recover'){
                if(m.timer>1.1)setState(m,eligible?'pursue':'patrol');
            }else if(m.state==='patrol'){
                const tx=m.home.x+Math.sin(elapsed*.12+(m.spec.side>0?2:0))*18;
                const tz=m.home.z+Math.cos(elapsed*.12)*24;
                const length=Math.hypot(tx-m.position.x,tz-m.position.z);if(length>2)moveActor(m,(tx-m.position.x)/length*2*dt,(tz-m.position.z)/length*2*dt);
            }
            pose(m,dt);
        }
        updateHUD();
    }
    function pause(){pendingAttack=null;for(const m of actors)if(m.health>0){setState(m,'patrol');m.cooldown=Math.max(1,m.cooldown);}}
    window.lakeMonsters={actors,colliders:dynamicColliders,onBridge,canTarget,update,beginPlayerAttack,resolvePlayerAttack,damagePlayer,hitMonster,pause};
    for(const m of actors){
        // Exported lake ruins are collidable. Find a clear home for the entire
        // surfaced body before its first patrol, rather than spawning in stone.
        const start=m.position.clone();let found=false;
        for(const radius of [0,12,24,36,48]){
            for(let i=0;i<16;i++){
                const x=start.x+Math.cos(i*Math.PI/8)*radius,z=start.z+Math.sin(i*Math.PI/8)*radius;
                if(m.spec.side*(x-lake.x)<38||Math.hypot((x-lake.x)/(lake.rx*.8),(z-lake.z)/(lake.rz*.8))>1||blockedAt(m,x,z,0))continue;
                m.position.set(x,-2,z);found=true;break;
            }
            if(found)break;
        }
        m.home=m.position.clone();syncColliders(m);pose(m,0);
    }
    updateHUD();
}
