/* Local backpack, deterministic map loot and a real-time three-minute buff. */
function installBackpack(){
    const key='tsuventure_backpack_v1',duration=180000,respawnDelay=300000,icon='features/inventory/assets/chocolate.svg';
    let count=0,buffUntil=0,collected={},scan=0,lastSecond=-1,returnFocus=null;
    try{const saved=JSON.parse(localStorage.getItem(key)||'{}');count=Number.isSafeInteger(saved.chocolate)?Math.max(0,Math.min(99999,saved.chocolate)):0;const until=Number(saved.buffUntil);buffUntil=Number.isFinite(until)&&until>Date.now()?Math.min(until,Date.now()+duration):0;for(const [id,until] of Object.entries(saved.collected||{}))if(typeof until==='number'&&Number.isFinite(until)&&until>Date.now())collected[id]=Math.min(until,Date.now()+respawnDelay);}catch{}
    const tr=(vi,en)=>window.tsuventureSettings?.language==='en'?en:vi;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    function save(){try{localStorage.setItem(key,JSON.stringify({chocolate:count,buffUntil,collected}));}catch{}}
    const modal=document.createElement('div');modal.id='modal-backpack';modal.className='modal-overlay';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','backpack-title');
    modal.innerHTML='<section class="backpack-card"><header><h2 id="backpack-title"></h2><button class="backpack-close" type="button">×</button></header><p class="backpack-intro"></p><article class="backpack-item"><img src="'+icon+'" alt="Chocolate"><div><h3>Chocolate</h3><p id="chocolate-description"></p><strong id="chocolate-count"></strong><button type="button" id="use-chocolate"></button></div></article><p id="backpack-effect" role="status"></p><p class="backpack-hint"></p></section>';document.body.append(modal);
    const use=modal.querySelector('#use-chocolate'),close=modal.querySelector('.backpack-close');
    const button=document.createElement('button');button.id='hud-backpack-button';button.className='hud-action';button.type='button';button.innerHTML='▣ <span class="hud-action-text"></span>';button.onclick=open;
    document.querySelector('.hud-actions').insertBefore(button,document.querySelector('.hud-settings-button'));
    const lobby=document.getElementById('btn-inventory');lobby.disabled=false;lobby.classList.remove('inventory-pending');lobby.onclick=open;
    const badge=document.createElement('div');badge.id='chocolate-buff';badge.hidden=true;badge.innerHTML='<img src="'+icon+'" alt=""><span></span>';document.querySelector('.hud-bars').append(badge);
    const timerText=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
    const remaining=()=>Math.max(0,Math.ceil((buffUntil-Date.now())/1000));
    function render(){
        const seconds=remaining();modal.querySelector('h2').textContent=tr('BALO','BACKPACK');close.setAttribute('aria-label',tr('Đóng balo','Close backpack'));
        modal.querySelector('.backpack-intro').textContent=tr('Vật phẩm đã nhặt được lưu trên thiết bị này.','Collected items are saved on this device.');
        modal.querySelector('#chocolate-description').textContent=tr('Không giới hạn thể lực trong 3 phút. Không tăng oxy.','Unlimited stamina for 3 minutes. Does not increase oxygen.');
        modal.querySelector('#chocolate-count').textContent=tr('Số lượng: ','Quantity: ')+count;
        use.disabled=count===0||seconds>0||!gameState.isPlaying;use.textContent=seconds>0?tr('Đang có hiệu lực','Effect active'):tr('Sử dụng','Use');
        modal.querySelector('#backpack-effect').textContent=seconds>0?tr('Thể lực vô hạn · ','Unlimited stamina · ')+timerText(seconds):count===0&&!window.crystalWings?.owned?tr('Chưa có chocolate. Tìm trên map và nhấn E để nhặt.','No chocolate yet. Find it on the map and press E to collect it.'):!gameState.isPlaying?tr('Vào game để sử dụng vật phẩm.','Enter the game to use items.'):' ';
        modal.querySelector('.backpack-hint').textContent=tr('I: Balo · E: Nhặt vật phẩm · Chocolate xuất hiện ngẫu nhiên ở nơi đi được.','I: Backpack · E: Pick up · Chocolate appears randomly in walkable places.');
        button.querySelector('span').textContent=tr('Balo','Backpack');button.setAttribute('aria-label',tr('Balo (I)','Backpack (I)'));button.title=button.getAttribute('aria-label');
        const small=lobby.querySelector('small');if(small)small.textContent=tr('Balo & vật phẩm đã nhặt','Backpack & collected items');
        badge.hidden=seconds===0;badge.querySelector('span').textContent=tr('Thể lực ∞ · ','Stamina ∞ · ')+timerText(seconds);
        for(const drop of drops.values())drop.item.prompt=tr('Nhặt chocolate','Pick up chocolate');
        if(nearbyItem?.type==='world_loot')hudPromptText.textContent=nearbyItem.prompt;
    }
    function open(){returnFocus=document.activeElement;render();openModal(modal.id);close.focus({preventScroll:true});}
    function dismiss(){closeModal(modal.id);if(gameState.isPlaying)renderer.domElement.focus({preventScroll:true});else (returnFocus||lobby).focus({preventScroll:true});}
    close.onclick=dismiss;use.onclick=consume;
    function consume(){
        if(!gameState.isPlaying||gameState.inDialogue||count<=0||remaining()>0||document.querySelector('.modal-overlay.active')!==modal)return false;
        count--;buffUntil=Date.now()+duration;gameState.stamina=100;save();render();updatePlayerVitals();return true;
    }
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i'&&!e.repeat&&!e.target.closest('input,textarea,select')){e.preventDefault();modal.classList.contains('active')?dismiss():open();}});
    modal.addEventListener('keydown',e=>{if(e.key==='Tab'){const list=[...modal.querySelectorAll('button:not(:disabled)')],first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    window.addEventListener('tsuventure-settings-saved',render);
    // Stable 25% occupancy per 64 m world cell, checked against actual terrain.
    const spots=[],drops=new Map(),group=new THREE.Group();group.name='ChocolateMapLoot';scene.add(group);
    function randomCell(x,z,salt=0){let v=Math.imul(x+1013,374761393)^Math.imul(z+2017,668265263)^salt;v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967296;}
    function groundAt(x,z){
        if(Math.abs(x)>980||Math.abs(z)>980||Math.hypot((x-mercuryLake.data.x)/mercuryLake.data.rx,(z-mercuryLake.data.z)/mercuryLake.data.rz)<1.4)return null;
        if(x> -142&&x< -78&&z>36&&z<154||Math.hypot((x-115)/1.15,(z-110)/.9)<60)return null;
        if(landmarksData.some(l=>l.id!=='ancient_tree'&&Math.hypot(x-l.x,z-l.z)<21)||Math.hypot(x-202,z+206)<10||Math.hypot(x-340,z+150)<8)return null;
        const y=ancientGrove.ground(x,z)??realmTerrainHeight(x,z);const support=getGroundElevation(x,z,y+1);if(Math.abs(support-y)>.7||checkCollision(x,z,support,.4))return null;return support;
    }
    for(let iz=-15;iz<=15;iz++)for(let ix=-15;ix<=15;ix++){
        if(randomCell(ix,iz)>=.25)continue;const x=ix*64+(randomCell(ix,iz,71)-.5)*50,z=iz*64+(randomCell(ix,iz,931)-.5)*50,y=groundAt(x,z);
        if(y!==null)spots.push({id:ix+':'+iz,x,y,z});
    }
    // One introductory drop near the plaza so the mechanic is discoverable.
    for(const [x,z] of [[22,16],[24,8],[-23,12],[24,-15]]){const y=groundAt(x,z);if(y!==null){spots.push({id:'intro',x,y,z});break;}}
    const brown=new THREE.MeshStandardMaterial({color:0x623a29,roughness:.8}),gold=new THREE.MeshStandardMaterial({color:0xd0a34b,metalness:.3,roughness:.6}),foil=new THREE.MeshStandardMaterial({color:0xc9c9be,metalness:.6,roughness:.4});
    const prototype=new THREE.Group(),geometry=new THREE.BoxGeometry(1,1,1);
    function part(x,y,z,sx,sy,sz,material){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);prototype.add(mesh);}
    part(0,0,0,.34,.07,.5,brown);for(const x of [-.09,.09])for(const z of [-.16,0,.16])part(x,.05,z,.145,.04,.13,brown);part(0,.045,.15,.36,.09,.16,gold);part(0,.05,.065,.35,.095,.025,foil);
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const glowContext=glowCanvas.getContext('2d'),gradient=glowContext.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,225,1)');gradient.addColorStop(.12,'rgba(255,235,143,1)');gradient.addColorStop(.35,'rgba(255,196,65,.65)');gradient.addColorStop(1,'rgba(255,172,32,0)');glowContext.fillStyle=gradient;glowContext.fillRect(0,0,64,64);
    const glowTexture=new THREE.CanvasTexture(glowCanvas),glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending});
    const glow=new THREE.Sprite(glowMaterial);glow.name='ChocolateLootGlow';glow.position.y=.28;glow.scale.set(.7,.7,1);prototype.add(glow);
    function remove(id){const drop=drops.get(id);if(!drop)return;drop.item.collected=true;const index=interactables.indexOf(drop.item);if(index>=0)interactables.splice(index,1);group.remove(drop.model);drops.delete(id);}
    function spawn(spot){
        const model=prototype.clone(true);model.position.set(spot.x,spot.y+.22,spot.z);model.rotation.y=randomCell(Math.round(spot.x),Math.round(spot.z))*6;group.add(model);
        const item={id:'chocolate:'+spot.id,type:'world_loot',lootId:spot.id,pos:new THREE.Vector3(spot.x,spot.y+.2,spot.z),radius:1.35,prompt:tr('Nhặt chocolate','Pick up chocolate')};interactables.push(item);drops.set(spot.id,{spot,model,item});
    }
    function nearbyLoot(p){return [...drops.values()].map(d=>d.item).filter(i=>Math.hypot(i.pos.x-p.x,i.pos.z-p.z)<=i.radius&&Math.abs(i.pos.y-p.y)<1.2).sort((a,b)=>a.pos.distanceToSquared(p)-b.pos.distanceToSquared(p))[0]||null;}
    function interact(item){
        if(item?.type!=='world_loot')return false;if(!active()||!drops.has(item.lootId)||nearbyLoot(playerGroup.position)!==item)return true;
        if(count>=99999)return true;collected[item.lootId]=Date.now()+respawnDelay;count++;remove(item.lootId);save();render();showNotification(tr('Đã nhặt chocolate! Nhấn I để mở balo.','Chocolate collected! Press I to open the backpack.'));return true;
    }
    function update(dt){
        const seconds=remaining();if(seconds!==lastSecond){lastSecond=seconds;render();updatePlayerVitals();}
        if(!active())return;scan+=Math.min(.1,Math.max(0,dt));if(scan>.6){scan=0;const p=playerGroup.position;for(const [id,d] of drops)if(Math.hypot(d.spot.x-p.x,d.spot.z-p.z)>100)remove(id);for(const spot of spots){if(drops.size>=24)break;if(!drops.has(spot.id)&&!(collected[spot.id]>Date.now())&&Math.hypot(spot.x-p.x,spot.z-p.z)<80)spawn(spot);}}
        for(const d of drops.values()){d.model.rotation.y+=dt*.25;d.model.position.y=d.spot.y+.22+Math.sin(performance.now()*.002+d.spot.x)*.035;const glow=d.model.getObjectByName('ChocolateLootGlow'),size=.7+Math.sin(performance.now()*.003+d.spot.z)*.12;glow.scale.set(size,size,1);}
    }
    window.backpack={open,consume,interact,nearbyLoot,update,spots,drops,group,icon,spawnProbability:.25,duration,get count(){return count;},get buffUntil(){return buffUntil;},get infiniteStamina(){return remaining()>0;},get remainingSeconds(){return remaining();}};
    render();
}
