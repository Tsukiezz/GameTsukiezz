/* One saved tournament, one opponent at a time, no replayable medal rewards. */
const ARENA_LEVELS=[
    {id:'arena_beast',model:'arena_beast',name:'Cự Thú Đấu Trường',hp:2400,damage:35,speed:8,radius:3.9,scale:3,skill:'Giậm đất',description:'Né vòng cảnh báo trước đòn giậm đất.'},
    {id:'arena_dark_horse',model:'dark_horse',name:'Ngựa Hắc Ám',hp:5000,damage:50,speed:10,radius:3.1,scale:3.8,skill:'Húc bóng tối',description:'Lao theo hướng đã báo trước; trúng húc bị làm chậm 55% trong 4 giây.'},
    {id:'arena_spinosaurus',model:'spinosaurus',name:'Spinosaurus',hp:8000,damage:55,speed:7,radius:5.6,scale:3.6,skill:'Cắn xé',description:'Cắn gây chảy máu 6 máu/giây trong 6 giây. Lùi khỏi vùng hàm trước khi cắn.'},
    {id:'arena_trex',model:'trex',name:'T-rex',hp:10000,damage:60,speed:8,radius:5.8,scale:3.6,skill:'Gầm cuồng nộ',description:'Gầm tăng 100% sát thương và 70% tốc độ trong 10 giây; ánh đỏ báo trạng thái cuồng nộ.'},
    {id:'arena_zeus',model:'zeus',name:'Thần Zeus',hp:20000,damage:130,speed:8,radius:4.2,scale:3.8,skill:'Thiên Phạt',description:'Kiếm sét quét rộng 14 m, tạo 7 vùng sét gây sát thương. Mỗi 120 giây giao chiến hồi 10% máu tối đa.'}
];
function installArenaTournament(a){
    const key='tsuventure_arena_tournament_v1',gate=a.tunnels.find(t=>t.role==='beast'),root=new THREE.Group();root.name='ArenaTournament';scene.add(root);
    let completed=0,savedHealth=null;try{const s=JSON.parse(localStorage.getItem(key)||'{}');if(Number.isInteger(s.completed)&&s.completed>=0&&s.completed<=5){completed=s.completed;savedHealth=s.health;}}catch{}
    let opponent=null,transition=0,pending=0,elapsed=0,saveTimer=0,slow=0,bleed=0,bleedTick=0,lastDeaths=0;const zones=[],rows=[];
    const hud=document.createElement('section');hud.id='arena-beast-hud';hud.className='arena-tournament-hud';hud.hidden=true;hud.innerHTML='<strong></strong><div class="arena-health-track"><i></i></div><small></small>';gameHud.append(hud);
    const warning=new THREE.Mesh(new THREE.RingGeometry(.97,1,48),new THREE.MeshBasicMaterial({color:0xff8d55,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));warning.rotation.x=-Math.PI/2;warning.visible=false;root.add(warning);
    const chargeLane=new THREE.Mesh(new THREE.PlaneGeometry(5,28),new THREE.MeshBasicMaterial({color:0xa987ef,side:THREE.DoubleSide,transparent:true,opacity:.35,depthWrite:false}));chargeLane.rotation.x=-Math.PI/2;chargeLane.visible=false;root.add(chargeLane);
    const fury=new THREE.Mesh(new THREE.RingGeometry(3.8,4.2,48),new THREE.MeshBasicMaterial({color:0xff4e38,side:THREE.DoubleSide,transparent:true,opacity:.65,depthWrite:false}));fury.rotation.x=-Math.PI/2;fury.visible=false;root.add(fury);
    function save(){try{localStorage.setItem(key,JSON.stringify({completed,health:opponent?.health??null}));}catch{}}
    const inPit=p=>a.region(p.x,p.z).r<20&&p.y>=a.floor-1&&p.y<a.floor+30;
    const targetable=()=>playerLife.targetable&&!moonRailway.aboard&&inPit(playerGroup.position);
    function ring(position,radius){const mesh=new THREE.Mesh(new THREE.CircleGeometry(radius,40),new THREE.MeshBasicMaterial({color:0xffb14e,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(position).setY(a.floor+.05);root.add(mesh);return mesh;}
    function clearThreats(){slow=bleed=bleedTick=0;warning.visible=chargeLane.visible=fury.visible=false;for(const z of zones){root.remove(z.mesh);z.mesh.geometry.dispose();z.mesh.material.dispose();}zones.length=0;}
    function spawn(){
        if(opponent)root.remove(opponent.group);if(completed>=ARENA_LEVELS.length){opponent=null;return;}
        const spec=ARENA_LEVELS[completed],m=creatureArt.create(spec.model);opponent={spec,group:m.root,joints:m.joints,rig:m.rig,health:Number.isFinite(savedHealth)&&savedHealth>0?Math.min(savedHealth,spec.hp):spec.hp,maxHealth:spec.hp,state:'caged',velocity:new THREE.Vector3(),travelled:0,timer:0,cooldown:2,special:5,enrage:0,healClock:0,charge:null};savedHealth=null;
        opponent.group.scale.setScalar(spec.scale);opponent.group.position.copy(a.point(new THREE.Vector3(48,.35,110)));root.add(opponent.group);a.beast=opponent;gate.open=false;gate.collider.disabled=false;gate.gate.visible=true;clearThreats();save();
    }
    function renderMedals(){for(let i=0;i<5;i++){rows[i].querySelector('strong').textContent=i<completed?'Đã nhận · 1 / 1':'Chưa nhận · 0 / 1';rows[i].dataset.owned=String(i<completed);}window.inventoryWorkspace?.render();}
    const parent=document.querySelector('#modal-backpack .backpack-hint');
    for(let i=1;i<=5;i++){
        const row=document.createElement('article');row.className='backpack-item';row.id='arena-medal-'+i;row.dataset.category='materials';const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#795baf" d="M23 3h23l6 39-19 8z"/><path fill="#b95c6b" d="M54 3h23L67 50l-19-8z"/><circle cx="50" cy="61" r="32" fill="#bd8b3d" stroke="#f5d58c" stroke-width="5"/><circle cx="50" cy="61" r="23" fill="#624434" stroke="#e5b85e" stroke-width="2"/><text x="50" y="73" font-size="34" font-family="serif" text-anchor="middle" fill="#ffe6a0">'+i+'</text></svg>';
        row.innerHTML='<img alt="Huân Chương '+i+'"><div><h3>Huân Chương '+i+'</h3><p>Chiến thắng '+ARENA_LEVELS[i-1].name+'. Vật phẩm thành tích duy nhất. Năng lực riêng sẽ được cập nhật sau.</p><strong></strong></div>';row.querySelector('img').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);parent.before(row);rows.push(row);
    }
    function finish(){
        if(!opponent||opponent.health>0||opponent.state==='defeated')return;
        opponent.state='defeated';opponent.group.visible=false;completed++;clearThreats();transition=6;save();renderMedals();fieldGuide.record(opponent.spec.id,true);if(completed===1){monsterCamps.add('goldCoin',1);monsterCamps.add('meat',5);}showNotification('🏅 Nhận Huân Chương '+completed+' · '+(completed===5?'Hoàn thành đấu trường!':'Đối thủ cấp '+(completed+1)+' đang được đưa vào hầm.'));}
    function hit(amount){if(!opponent||opponent.health<=0||opponent.state==='caged'||!Number.isFinite(amount)||amount<=0||!targetable()||!inPit(opponent.group.position))return false;window.weaponSystem?.onHit(Math.min(opponent.health,amount));opponent.health=Math.max(0,opponent.health-amount);save();finish();return true;}
    function damage(amount,effect,special=Boolean(effect)){if(!targetable())return false;const ok=playerLife.hitMonster(amount,opponent.spec.name+' · '+opponent.spec.skill,{special});if(ok&&playerLife.deaths===lastDeaths){if(effect==='slow')slow=4;if(effect==='bleed'){bleed=6;bleedTick=0;}}return ok;}
    function warn(kind,radius){const b=opponent;b.state=kind;b.timer=0;b.animationAttack={time:0,duration:2.2};b.target=playerGroup.position.clone();b.origin=b.group.position.clone();warning.position.copy(b.origin).setY(a.floor+.065);warning.scale.set(radius,radius,1);warning.visible=true;if(kind==='warning_charge'){const d=b.target.clone().sub(b.origin);d.y=0;d.normalize();chargeLane.position.copy(b.origin).addScaledVector(d,14).setY(a.floor+.07);chargeLane.rotation.set(-Math.PI/2,0,-Math.atan2(d.x,d.z));chargeLane.visible=true;}}
    function keepInside(p){const dx=p.x-a.center.x,dz=p.z-a.center.z,k=Math.hypot(dx/51,dz/39);if(k>1){p.x=a.center.x+dx/k;p.z=a.center.z+dz/k;}p.y=a.floor;}
    const obstacleColliders=colliders.filter(c=>{const x=c.x??((c.minX+c.maxX)/2),z=c.z??((c.minZ+c.maxZ)/2);return Math.hypot(x-a.center.x,z-a.center.z)<240&&c.maxY>a.floor+1;});
    function navigable(x,z,r){
        // Probe architecture only, never the opponent's own dynamic hitbox.
        for(const [dx,dz]of [[0,0],[r,0],[-r,0],[0,r],[0,-r]])if(originalBlocked(x+dx,z+dz,a.floor+.3))return false;
        for(const c of obstacleColliders){if(c.disabled||c.minY>a.floor+8)continue;if(Number.isFinite(c.minX)&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ)return false;}return true;
    }
    function move(target,speed,dt){
        const b=opponent,d=target.clone().sub(b.group.position);d.y=0;const distance=d.length();if(distance<.08){b.velocity.multiplyScalar(Math.exp(-12*dt));return;}d.normalize();let direction=null,best=-Infinity;const probe=Math.max(.3,speed*dt*2),radius=b.spec.radius*.7;
        for(const angle of [0,.3,-.3,.65,-.65,1,-1,1.5,-1.5,2,-2]){const q=d.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle),p=b.group.position.clone().addScaledVector(q,probe);if(!navigable(p.x,p.z,radius))continue;const score=q.dot(d)*2+q.dot(b.velocity.clone().normalize())*.45;if(score>best){best=score;direction=q;}}
        if(!direction){b.velocity.multiplyScalar(Math.exp(-12*dt));return;}
        b.velocity.lerp(direction.multiplyScalar(Math.min(speed,distance/Math.max(.001,dt))),1-Math.exp(-7*dt));const step=b.velocity.clone().multiplyScalar(dt),n=Math.max(1,Math.ceil(step.length()/.2));
        for(let i=0;i<n;i++){const x=b.group.position.x+step.x/n,z=b.group.position.z+step.z/n;if(!navigable(x,z,radius)){b.velocity.multiplyScalar(.2);break;}b.group.position.x=x;b.group.position.z=z;b.travelled+=step.length()/n;}
        const yaw=Math.atan2(b.velocity.x,b.velocity.z);b.group.rotation.y+=Math.atan2(Math.sin(yaw-b.group.rotation.y),Math.cos(yaw-b.group.rotation.y))*(1-Math.exp(-9*dt));if(b.state!=='entering')keepInside(b.group.position);
    }
    function createZones(){
        for(let i=0;i<7;i++){const p=i===0?playerGroup.position.clone():a.center.clone().add(new THREE.Vector3(Math.sin(i*2.4+elapsed)*34,0,Math.cos(i*2.4+elapsed)*27));keepInside(p);zones.push({mesh:ring(p,5),age:0,tick:0});}
    }
    function updateZones(dt){for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.age+=dt;if(z.age>=2){z.mesh.material.color.setHex(0x93dfff);z.mesh.material.opacity=.55;z.tick-=dt;if(z.tick<=0){z.tick=1;if(targetable()&&playerGroup.position.distanceTo(z.mesh.position)<5.4)damage(90,null,true);}}if(z.age>5){root.remove(z.mesh);z.mesh.geometry.dispose();z.mesh.material.dispose();zones.splice(i,1);}}}
    const originalBlocked=a.blocked;a.blocked=(x,z,y)=>!!opponent&&opponent.health>0&&y>=a.floor-.2&&y<a.floor+12&&Math.hypot(x-opponent.group.position.x,z-opponent.group.position.z)<opponent.spec.radius||originalBlocked(x,z,y);
    a.beginPlayerAttack=()=>{if(gameState.isPlaying&&!gameState.inDialogue&&!moonRailway.aboard&&pending<=0)pending=.2;};
    function update(dt){
        dt=Math.min(.1,Math.max(0,dt));if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;elapsed+=dt;
        if(lastDeaths!==playerLife.deaths){clearThreats();lastDeaths=playerLife.deaths;}
        const near=a.center.distanceTo(playerGroup.position)<650;hud.hidden=!near||moonRailway.aboard;if(opponent)opponent.group.visible=near&&opponent.health>0;
        if(!near||moonRailway.aboard){clearThreats();return;}
        if(!opponent){hud.querySelector('strong').textContent='Đấu trường hoàn thành · 5 / 5 huân chương';hud.querySelector('i').style.width='100%';hud.querySelector('small').textContent='Mở balo để xem huân chương.';return;}
        const b=opponent,s=b.spec;if(b.animationAttack){b.animationAttack.time+=dt;if(b.animationAttack.time>b.animationAttack.duration)b.animationAttack=null;}
        if(b.rig){const windup=b.state.startsWith('warning');if(b.rig.jaw)b.rig.jaw.rotation.x=windup?.14+Math.sin(elapsed*5)*.045:.025+Math.sin(elapsed*2)*.025;if(b.rig.tail)b.rig.tail.rotation.y=Math.sin(elapsed*1.8)*.1;for(const [name,sign] of [['armL',1],['armR',-1]])if(b.rig[name])b.rig[name].rotation.x=windup?-.26:.05+Math.sin(elapsed*2+sign)*.035;}
        hud.querySelector('strong').textContent=(completed===4?'MAX':'LV '+(completed+1))+' · '+s.name+' · '+Math.ceil(b.health)+' / '+s.hp;hud.querySelector('i').style.width=(100*b.health/s.hp)+'%';hud.querySelector('small').textContent=transition>0?'Đối thủ tiếp theo xuất hiện sau '+Math.ceil(transition)+' giây':b.state==='caged'?'Mở cổng hầm thú để bắt đầu · '+s.skill:(slow>0?'Bị làm chậm · '+Math.ceil(slow)+'s':bleed>0?'Chảy máu · '+Math.ceil(bleed)+'s':b.enrage>0?'Cuồng nộ · sát thương ×2 · '+Math.ceil(b.enrage)+'s':s.skill);
        if(transition>0){if(completed===5)hud.querySelector('small').textContent='Đã nhận đủ 5 Huân Chương · Hoàn thành đấu trường!';transition-=dt;if(transition<=0)spawn();return;}
        slow=Math.max(0,slow-dt);if(bleed>0){bleed-=dt;bleedTick+=dt;if(bleedTick>=1){bleedTick-=1;playerLife.hitMonster(6,'Chảy máu · Spinosaurus',{special:true});}}updateZones(dt);
        if(pending>0){pending-=dt;if(pending<=0&&inPit(playerGroup.position)){const delta=b.group.position.clone().sub(playerGroup.position),distance=delta.length(),forward=castleLookDirection(heroMotion.state.yaw,0);if(distance<s.radius+2.8&&Math.abs(delta.y)<10&&(distance<s.radius+1||delta.normalize().dot(forward)>.05))hit(heroOutgoingDamage(100));}}
        if(b.health<=0)return;fieldGuide.record(s.id);saveTimer+=dt;if(saveTimer>5){saveTimer=0;save();}
        b.velocity.multiplyScalar(Math.exp(-2*dt));if(b.state==='caged'){if(!gate.open)return;b.state='entering';}
        if(b.state==='entering'){move(a.center.clone().setY(a.floor),s.speed,dt);if(b.group.position.x>a.center.x-40)b.state='pursue';return;}
        const target=targetable()?playerGroup.position:a.center.clone().setY(a.floor),distance=b.group.position.distanceTo(target);b.timer+=dt;b.cooldown=Math.max(0,b.cooldown-dt);b.special=Math.max(0,b.special-dt);b.enrage=Math.max(0,b.enrage-dt);
        b.group.scale.setScalar(THREE.MathUtils.damp(b.group.scale.x,s.scale*(b.enrage>0?1.04:1),8,dt));fury.visible=b.enrage>0;fury.position.copy(b.group.position).setY(a.floor+.06);
        if(targetable()&&s.model==='zeus'){b.healClock+=dt;if(b.healClock>=120){b.healClock-=120;b.health=Math.min(s.hp,b.health+s.hp*.1);save();showNotification('Thần Zeus hồi 10% máu tối đa!');}}
        if(b.state==='charge'){
            move(b.charge,28,dt);if(!b.chargeHit&&playerGroup.position.distanceTo(b.group.position)<s.radius+1.5){b.chargeHit=true;damage(s.damage,'slow');}if(b.timer>.95||b.group.position.distanceTo(b.charge)<1){b.state='pursue';b.cooldown=2;warning.visible=chargeLane.visible=false;}return;
        }
        if(b.state.startsWith('warning')){
            if(b.timer<1.15)return;warning.visible=false;
            if(b.state==='warning_charge'){const d=b.target.clone().sub(b.origin);d.y=0;d.normalize();b.charge=b.origin.clone().addScaledVector(d,28);keepInside(b.charge);b.chargeHit=false;b.state='charge';b.timer=0;return;}
            if(b.state==='warning_roar'){b.enrage=10;b.special=18;showNotification('T-rex gầm cuồng nộ · sát thương ×2!');}
            else if(b.state==='warning_zones'){createZones();b.special=16;}
            else {const range=s.model==='zeus'?14:s.radius+4;if(targetable()&&playerGroup.position.distanceTo(b.origin)<range)damage(s.damage*(b.enrage>0?2:1),s.model==='spinosaurus'?'bleed':null,s.model==='spinosaurus'||s.model==='zeus'||b.enrage>0);}
            b.state='pursue';b.cooldown=s.model==='zeus'?3:2;return;
        }
        if(!targetable()){warning.visible=false;move(target,s.speed,dt);return;}
        if(!b.special&&s.model==='trex'){warn('warning_roar',9);return;}
        if(!b.special&&s.model==='zeus'){warn('warning_zones',14);return;}
        if(!b.cooldown&&s.model==='dark_horse'&&distance<35){warn('warning_charge',4);return;}
        if(distance>s.radius+2.5)move(target,s.speed*(b.enrage>0?1.7:1),dt);else if(!b.cooldown)warn('warning_strike',s.model==='zeus'?14:s.radius+4);
    }
    spawn();renderMedals();a.beastHud=hud;a.tournament={levels:ARENA_LEVELS,obstacleColliders,navigable,move,root,hud,rows,zones,update,hit,save,clearThreats,preview(level){return creatureArt.create(ARENA_LEVELS[level-1]?.model)?.root;},get completed(){return completed;},get opponent(){return opponent;},get movementMultiplier(){return slow>0?.45:1;},get slow(){return slow;},get bleed(){return bleed;}};
}
