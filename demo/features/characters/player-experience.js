/* Equipped character shells, item receipts, persistent mouse look and lethal train contact. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installPlayerExperience(){
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    let wantedMouse=false,releasedForUI=false;
    function releaseMouse(forUI=false){releasedForUI=forUI;if(!forUI)wantedMouse=false;isRightMouseDown=false;document.body.classList.remove('game-mouse-captured');if(document.pointerLockElement)document.exitPointerLock();}
    function captureMouse(){if(!active())return false;wantedMouse=true;releasedForUI=false;const request=renderer.domElement.requestPointerLock?.();request?.catch(()=>{wantedMouse=false;document.body.classList.remove('game-mouse-captured');});return true;}
    document.addEventListener('pointerlockchange',()=>{const locked=document.pointerLockElement===renderer.domElement||document.pointerLockElement===document.body;document.body.classList.toggle('game-mouse-captured',locked);if(!locked&&!releasedForUI)wantedMouse=false;});
    window.addEventListener('keydown',e=>{if(e.key==='Escape')releaseMouse();},true);
    window.addEventListener('blur',()=>releaseMouse());
    window.addEventListener('toggle',e=>{if(e.target?.tagName==='DETAILS'){if(e.target.open)releaseMouse(true);else if(wantedMouse&&active()&&!document.querySelector('details[open]'))captureMouse();}},true);
    window.gameMouse={capture:captureMouse,release:releaseMouse,resume(){if(wantedMouse&&active())captureMouse();},get captured(){return document.pointerLockElement===renderer.domElement||document.pointerLockElement===document.body;}};

    const overlay = {model:null,mode:null,covers:[]};
    function clearSuit(){
        for (const piece of overlay.covers) piece.parent?.remove(piece);
        if (overlay.model) overlay.model.limbs.cape.visible=true;
        Object.assign(overlay,{model:null,mode:null,covers:[]});
    }
    function sync(){
        const model=heroAnimationBindings.get(activeLimbs)?.model;
        const state=window.technologyCraft?.state;
        const armor=state?.samuraiEquipped?'samurai':state?.rageEquipped?'rage':state?.ironEquipped?'iron':null;
        const mode=state?.divingEquipped&&(!armor||window.playerSurvival?.swimming)?'diving':armor;
        if (overlay.model===model&&overlay.mode===mode) return;
        clearSuit();
        if (!model||!mode) return;
        overlay.model=model;
        overlay.mode=mode;
        model.limbs.cape.visible=mode!=='diving';
        overlay.covers=mountCollectionParts(mode,model.userData.bones);
        for (const piece of overlay.covers) {
            const joint=piece.parent.name;
            piece.name='EquippedSuit_'+mode+'_'+joint;
            if (mode==='diving'&&joint==='head') {
                piece.position.z=activeHeroType==='millennium_dragon'?.19:activeHeroType==='monkey_king'?.065:.02;
            }
            if (joint==='body'&&activeHeroType==='mars_robot') piece.position.z=mode==='diving'?-.07:.115;
        }
    }

    const receipts=document.createElement('section');receipts.id='item-receipt';receipts.setAttribute('role','status');receipts.setAttribute('aria-live','polite');receipts.hidden=true;receipts.innerHTML='<div class="receipt-emblem">✦</div><div><strong>NHẬN VẬT PHẨM</strong><ul></ul></div>';document.body.append(receipts);const history=[],pending=[];let receiptTimer=0;
    function inventory(){const entries={},add=(id,name,n)=>entries[id]={name,count:Number(n)||0};for(const [id,name] of Object.entries({forestHeart:'Trái Tim Rừng Rậm',goldCoin:'Xu vàng',meat:'Thịt đùi',iron:'Sắt',uranium:'Uranium',rubber:'Cao su',silicon:'Silicon'}))add('camp_'+id,name,monsterCamps.stock[id]);for(const [id,name] of [['wood','Gỗ'],['scrap','Hợp kim']])add(id,name,riverBoat.stock[id]);add('chocolate','Chocolate',backpack.count);for(const [id,name] of [['elixir','Thuốc tiên'],['bandage','Băng gạc']])add(id,name,templeSupplies.counts[id]);add('snowCrystal','Pha lê tuyết',snowCrystals.count);add('engine','Động cơ vĩnh cửu',santaGifts.engines);for(const [id,n] of Object.entries(bachKhuyet.inventory))add('ore_'+id,id==='gold'?'Vàng thô':id==='titanium'?'Titan':id==='crystal'?'Tinh thể':id,n);for(const [id,name,owned] of [['wings','Cánh pha lê',crystalWings.owned],['flashlight','Đèn pin mặt trời',solarFlashlight.owned],['fragment','Mảnh vỡ cổ đại',mangroveRealm.owned],['lavaSword','Kiếm dung nham',volcanicValley.owned],['boat','Thuyền thám hiểm',riverBoat.owned],['ironArmor','Giáp sắt',technologyCraft.state.ironOwned],['divingSuit','Bộ đồ lặn',technologyCraft.state.divingOwned],['key','Chìa khóa',gameState.hasKey]])add(id,name,Number(owned));add('cookies','M\u1ea3nh b\u00e1nh quy',window.candyProvisions?.count);add('shards','Mảnh nguyệt thạch',gameState.shardsCollected);add('voidFragments','Void fragments',window.voidDistrict?.count);add('nakat','Nakat',monsterCamps.stock.nakat);add('cavernMap','B\u1ea3n \u0111\u1ed3 l\u1ed1i ra',window.explorationUpdate?.mapOwned?1:0);add('magicBean','H\u1ea1t \u0111\u1eadu th\u1ea7n',window.explorationUpdate?.beanOwned?1:0);add('rageArmor','Rage armor',technologyCraft.state.rageOwned?1:0);for(const [id,name]of [['goldOre','Quặng vàng'],['diamond','Kim cương'],['krystal','Krystal'],['mothball','Băng phiến']])add('deep_'+id,name,window.undergroundNetwork?.oreStock[id]);return entries;}
    let previousInventory=inventory();
    function scanItems(){const next=inventory(),fresh=[];for(const [id,item] of Object.entries(next)){const n=item.count-(previousInventory[id]?.count||0);if(n>0){const name=({voidFragments:'Mảnh hư không',nakat:'Thiên thạch Nakat',rageArmor:'Giáp cuồng nộ'})[id]||item.name;const receipt={id,name,quantity:n};fresh.push(receipt);history.push(receipt);if(history.length>120)history.shift();}}previousInventory=next;if(fresh.length){pending.unshift(...fresh);receiptTimer=0;}}
    function showReceipts(dt){receiptTimer=Math.max(0,receiptTimer-dt);if(receiptTimer>0)return;if(!pending.length){receipts.hidden=true;return;}const batch=pending.splice(0,8),list=receipts.querySelector('ul');list.replaceChildren();for(const item of batch){const li=document.createElement('li');li.textContent='+'+item.quantity+'  '+item.name;list.append(li);}receipts.hidden=false;receiptTimer=pending.length?2.2:3.5;}

    const vehiclePrevious=new WeakMap();let lastPlayer=playerGroup.position.clone();
    function intersects(a,b,min,max){let lo=0,hi=1;for(const axis of ['x','y','z']){const d=b[axis]-a[axis];if(Math.abs(d)<1e-8){if(a[axis]<min[axis]||a[axis]>max[axis])return false;continue;}let t0=(min[axis]-a[axis])/d,t1=(max[axis]-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}return true;}
    function checkTrains(){const p=playerGroup.position.clone(),teleported=p.distanceTo(lastPlayer)>30;let hit=null;for(const train of moonRailway.physicalTrains)for(const car of train.vehicles){const now=car.position.clone(),previous=vehiclePrevious.get(car)||now;vehiclePrevious.set(car,now.clone());if(!active()||moonRailway.aboard||(train.state!=='moving'||train.speed<.15)&&now.distanceToSquared(previous)<.0004||now.distanceToSquared(previous)>1600||teleported||hit)continue;const radius=now.distanceTo(previous)+p.distanceTo(lastPlayer)+14;if(p.distanceToSquared(now)>radius*radius)continue;const yaw=-car.rotation.y,a=(teleported?p:lastPlayer).clone().sub(previous).applyAxisAngle(new THREE.Vector3(0,1,0),yaw),b=p.clone().sub(now).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);if(intersects(a,b,new THREE.Vector3(-3.35,-PLAYER_HEIGHT-.3,-7.6),new THREE.Vector3(3.35,6.8,7.6)))hit=train.id;}
        lastPlayer.copy(p);if(hit){const cause='Bị '+moonRailway.physicalTrains.find(t=>t.id===hit).name+' đâm';playerLife.noteDamage(cause);gameState.health=0;playerLife.die(cause);lastPlayer.copy(playerGroup.position);return true;}return false;
    }
    function update(dt){const near=window.explorationUpdate?.firstPerson ? .045 :(moonRailway.aboard||evilCavern.inside()||inCastleEnvelope(playerGroup.position.x,playerGroup.position.z))?0.08:0.18;if(Math.abs(camera.near-near)>.001){camera.near=near;camera.updateProjectionMatrix();}dt=Math.min(.1,Math.max(0,dt));sync();scanItems();showReceipts(dt);if(!active()){if(gameMouse.captured)releaseMouse(true);lastPlayer.copy(playerGroup.position);for(const train of moonRailway.trains)for(const car of train.vehicles)vehiclePrevious.set(car,car.position.clone());return;}checkTrains();}
    window.itemReceipts={element:receipts,history,scan:scanItems,flush(){receiptTimer=0;showReceipts(0);}};
    window.playerExperience={update,sync,overlay,checkTrains,clearSuit};sync();
}
