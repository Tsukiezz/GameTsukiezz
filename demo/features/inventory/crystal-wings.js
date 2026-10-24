/* Permanent chest equipment, visible wings and collision-aware flight. */
function installCrystalWings(){
    const key='tsuventure_crystal_wings_v1';let owned=false,equipped=false,flying=false,time=0,lidAngle=0;
    try{const saved=JSON.parse(localStorage.getItem(key)||'{}');owned=saved.owned===true;equipped=owned&&saved.equipped===true;}catch{}
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    const tr=(vi,en)=>window.tsuventureSettings?.language==='en'?en:vi;
    const save=()=>{try{localStorage.setItem(key,JSON.stringify({owned,equipped}));}catch{}};
    const crystal=new THREE.MeshStandardMaterial({color:0x92d5ef,emissive:0x274e74,emissiveIntensity:.45,roughness:.22,metalness:.25,flatShading:true});
    const violet=new THREE.MeshStandardMaterial({color:0xaf9de4,emissive:0x41335f,emissiveIntensity:.35,roughness:.25,metalness:.2,flatShading:true});
    const silver=new THREE.MeshStandardMaterial({color:0xc9dfeb,roughness:.35,metalness:.65});
    const model=new THREE.Group();model.name='EquippedCrystalWings';model.position.set(0,1.9,-.65);playerGroup.add(model);
    const joints=[];
    for(const side of [-1,1]){
        const joint=new THREE.Group();joint.name=side<0?'CrystalWingLeft':'CrystalWingRight';joint.position.x=side*.55;model.add(joint);joints.push(joint);
        for(let i=0;i<6;i++){
            const start=new THREE.Vector3(side*.12,.25-i*.15,0),end=new THREE.Vector3(side*(4.5-i*.46),2.5-i*.8,-.3-i*.06),delta=end.clone().sub(start);
            const feather=new THREE.Mesh(new THREE.OctahedronGeometry(1,0),i%2?crystal:violet);feather.name='CrystalFlightFeather';feather.position.copy(start).addScaledVector(delta,.53);feather.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());feather.scale.set(.32,delta.length()*.65,.15);joint.add(feather);
        }
        const spar=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,3.8,6),silver);spar.position.set(side*1.7,.8,.03);spar.rotation.z=-side*1.08;joint.add(spar);
    }
    const clasp=new THREE.Mesh(new THREE.OctahedronGeometry(.48),crystal);clasp.position.set(0,.3,.12);model.add(clasp);
    // Find a real free niche in the existing deepest basement, away from its door.
    const candidates=[];for(const x of [-114.5,-115.5,-116.5,-117.5])for(const z of [126.8,125.7,124.6,123.5])candidates.push({x,z});
    let location=null,approach=null;
    for(const c of candidates){
        if(checkCollision(c.x,c.z,-5,.65)||Math.abs(getGroundElevation(c.x,c.z,-5)+5)>.1)continue;
        for(const [dx,dz] of [[0,-1.3],[-1.3,0],[0,1.3],[1.3,0]]){const x=c.x+dx,z=c.z+dz;if(x<=-119.3||x>=-113.6||z<=121.3||z>=127.7||checkCollision(x,z,-5,.3))continue;location=c;approach=new THREE.Vector3(x,-5,z);break;}if(location)break;
    }
    if(!location)throw new Error('No accessible basement niche for crystal wings chest');
    const chest=new THREE.Group();chest.name='BasementCrystalWingsChest';chest.position.set(location.x,-5,location.z);scene.add(chest);
    chest.rotation.y=Math.atan2(approach.x-location.x,approach.z-location.z);
    const oak=new THREE.MeshStandardMaterial({color:0x352c44,roughness:.8}),gold=new THREE.MeshStandardMaterial({color:0xbca46b,metalness:.65,roughness:.4});
    const body=new THREE.Mesh(new THREE.BoxGeometry(1,.58,.72),oak);body.position.y=.29;chest.add(body);
    const lid=new THREE.Group();lid.position.set(0,.58,-.36);chest.add(lid);
    const lidMesh=new THREE.Mesh(new THREE.BoxGeometry(1.04,.18,.76),oak);lidMesh.position.set(0,.09,.36);lid.add(lidMesh);
    for(const x of [-.36,.36]){const band=new THREE.Mesh(new THREE.BoxGeometry(.07,.63,.76),gold);band.position.set(x,.31,0);chest.add(band);const strip=new THREE.Mesh(new THREE.BoxGeometry(.075,.22,.79),gold);strip.position.set(x,.09,.36);lid.add(strip);}
    const lock=new THREE.Mesh(new THREE.OctahedronGeometry(.14),crystal);lock.position.set(0,.46,.39);chest.add(lock);
    const relic=model.clone(true);relic.position.set(0,.82,0);relic.scale.setScalar(.12);chest.add(relic);
    const sideways=Math.abs(Math.sin(chest.rotation.y))>.5;
    addBoxCollider(location.x,location.z,sideways?.72:1,sideways?1:.72,-5,-4.22,true);const chestCollider=colliders.at(-1);Object.assign(chestCollider,{name:'crystal-wings-chest',stepHeight:.12});
    const item={id:'basement_crystal_wings',type:'crystal_wings_chest',pos:new THREE.Vector3(location.x,-5,location.z),radius:1.8,prompt:''};interactables.push(item);
    const row=document.createElement('article');row.className='backpack-item';row.id='crystal-wings-item';row.innerHTML='<img src="features/inventory/assets/crystal-wings.svg" alt=""><div><h3></h3><p></p><strong role="status"></strong><button type="button" id="equip-crystal-wings"></button></div>';
    document.querySelector('#modal-backpack .backpack-hint').before(row);const equipButton=row.querySelector('button');
    const button=document.createElement('button');button.type='button';button.id='hud-crystal-flight';button.className='hud-sit-button';document.querySelector('.hud-quickbar').append(button);
    const touchButton=document.createElement('button');touchButton.type='button';touchButton.id='touch-crystal-flight';touchButton.className='hud-touch-button';document.querySelector('.hud-touch-actions').append(touchButton);
    const hint=document.createElement('div');hint.id='crystal-flight-hint';hint.hidden=true;gameHud.append(hint);
    function render(){
        model.visible=equipped;relic.visible=!owned;item.prompt=owned?tr('Rương cánh pha lê đã mở','Crystal wings chest opened'):tr('Mở rương — nhận Đôi Cánh Pha Lê','Open chest — claim Crystal Wings');
        if(nearbyItem===item)hudPromptText.textContent=item.prompt;
        row.querySelector('h3').textContent=tr('Đôi Cánh Pha Lê','Crystal Wings');row.querySelector('img').alt=tr('Đôi cánh pha lê xanh tím','Blue and violet crystal wings');
        row.querySelector('p').textContent=tr('Bay và lướt nhanh trên bầu trời. F: bật/tắt bay · Space: bay lên · Q/Ctrl: hạ xuống · Shift: bay nhanh.','Fly and glide across the sky. F: toggle flight · Space: ascend · Q/Ctrl: descend · Shift: fly faster.');
        row.querySelector('strong').textContent=!owned?tr('Chưa sở hữu · Trong rương phòng lưu giữ, tầng hầm sâu nhất của lâu đài.','Not owned · In the storage-room chest in the deepest castle basement.'):equipped?tr('Đang trang bị','Equipped'):tr('Đã sở hữu','Owned');
        equipButton.textContent=equipped?tr('Tháo cánh','Unequip'):tr('Trang bị','Equip');equipButton.disabled=!owned||!gameState.isPlaying;equipButton.setAttribute('aria-pressed',String(equipped));
        button.hidden=!equipped;button.textContent=flying?tr('F · Ngừng bay','F · Stop flying'):tr('F · Bay','F · Fly');button.setAttribute('aria-pressed',String(flying));button.setAttribute('aria-label',button.textContent);
        touchButton.hidden=!equipped;touchButton.textContent=flying?'✧↓':'✧↑';touchButton.setAttribute('aria-label',flying?tr('Ngừng bay','Stop flying'):tr('Bay bằng cánh pha lê','Fly with crystal wings'));touchButton.setAttribute('aria-pressed',String(flying));
        touchButton.parentElement.classList.toggle('has-flight',equipped);
        hint.hidden=!flying;hint.textContent=matchMedia('(pointer:coarse)').matches?tr('Đang bay · ↥ Lên · ↧ Xuống · ✧↓ Ngừng bay','Flying · ↥ Up · ↧ Down · ✧↓ Stop'):tr('Đang bay · Space ↑ · Q/Ctrl ↓ · Shift nhanh · F ngừng bay','Flying · Space ↑ · Q/Ctrl ↓ · Shift faster · F stop flying');
    }
    function stopFlight(){flying=false;keys.swimUp=false;keys.dive=false;keys.jump=false;jumpVelocityY=0;jumpY=0;render();}
    function equip(value=!equipped){
        if(!owned||!gameState.isPlaying)return false;equipped=Boolean(value);if(!equipped&&flying)stopFlight();save();render();return true;
    }
    function toggleFlight(){
        if(!active()||!equipped||window.monsterSkills?.captured||window.riverRealm?.stunned)return false;
        if(flying){stopFlight();return true;}flying=true;isGrounded=false;isSitting=false;castleSafeAnchor=null;jumpVelocityY=0;jumpY=0;keys.jump=false;render();return true;
    }
    function interact(target){
        if(target!==item)return false;if(!active()||playerGroup.position.distanceTo(item.pos)>item.radius||owned)return true;
        owned=true;save();render();sfx.pickup();showNotification(tr('Đã nhận Đôi Cánh Pha Lê! Nhấn I → Trang bị, rồi F để bay.','Crystal Wings acquired! Press I → Equip, then F to fly.'));return true;
    }
    equipButton.onclick=()=>equip();button.onclick=()=>{toggleFlight();button.blur();renderer.domElement.focus({preventScroll:true});};
    touchButton.onclick=e=>{e.preventDefault();toggleFlight();touchButton.blur();};
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='f'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target?.closest?.('button,summary,input,textarea,select')||!active())return;if(toggleFlight())e.preventDefault();});
    window.addEventListener('tsuventure-settings-saved',render);
    function overlaps(c,x,z,r=PLAYER_RADIUS){
        if(c.type==='cylinder')return Math.hypot(x-c.x,z-c.z)<c.radius+r;
        if(c.type==='orientedBox'){const dx=x-c.x,dz=z-c.z;return Math.abs(dx*Math.cos(c.angle)-dz*Math.sin(c.angle))<c.width/2+r&&Math.abs(dx*Math.sin(c.angle)+dz*Math.cos(c.angle))<c.depth/2+r;}
        return x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ;
    }
    function blockedAt(x,z,y){
        if(!flying)return false;if(getGroundElevation(x,z,y)>y+MAX_STEP_HEIGHT)return true;
        return [...nearbyColliders(x,z)].some(c=>!c.disabled&&overlaps(c,x,z)&&y<c.maxY-.001&&y+PLAYER_HEIGHT>c.minY+.001);
    }
    function vertical(dt){
        if(!flying)return false;if(!equipped||window.monsterSkills?.captured){stopFlight();return false;}if(!active())return true;
        dt=Math.max(0,Math.min(.1,dt));const p=playerGroup.position,previous=p.y,velocity=(keys.swimUp?1:0)-(keys.dive?1:0);let next=Math.min(500,previous+velocity*(keys.shift?9:5)*dt);
        for(const c of nearbyColliders(p.x,p.z)){
            if(c.disabled||!overlaps(c,p.x,p.z))continue;
            if(next>previous&&previous+PLAYER_HEIGHT<=c.minY+.002&&next+PLAYER_HEIGHT>=c.minY)next=Math.min(next,c.minY-PLAYER_HEIGHT-.002);
            if(next<previous&&previous>=c.maxY-.002&&next<c.maxY)next=Math.max(next,c.maxY);
        }
        next=resolveCastleCeiling(p.x,p.z,previous,next);
        const floor=getGroundElevation(p.x,p.z,previous);p.y=Math.max(floor,next);currentGroundY=p.y;isGrounded=false;jumpVelocityY=0;jumpY=0;keys.jump=false;
        if(p.y>=500&&velocity>0)hint.textContent=tr('Đã đạt độ cao tối đa · Q/Ctrl để hạ xuống','Maximum altitude reached · Q/Ctrl to descend');return true;
    }
    function update(dt){
        if(window.monsterSkills?.captured&&flying)stopFlight();if(active())time+=Math.min(.1,Math.max(0,dt));
        const target=owned?-1.8:0;lidAngle+=(target-lidAngle)*(1-Math.exp(-Math.min(.1,dt)*6));lid.rotation.x=lidAngle;
        joints.forEach((joint,i)=>{const side=i===0?-1:1;joint.rotation.y=side*(flying?-.22:-.6);joint.rotation.z=side*(flying?Math.sin(time*6)*.18:Math.sin(time*1.5)*.025);});
    }
    new MutationObserver(render).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});
    window.crystalWings={model,joints,chest,lid,chestCollider,item,approach,row,button,touchButton,hint,interact,equip,toggleFlight,stopFlight,blockedAt,vertical,update,render,get owned(){return owned;},get equipped(){return equipped;},get flying(){return flying;},get speed(){return keys.shift?18:10;}};render();if(owned){lidAngle=-1.8;lid.rotation.x=lidAngle;}
}
