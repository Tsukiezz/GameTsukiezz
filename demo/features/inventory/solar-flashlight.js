/* Temple relic: persistent equipment, aimed light and real wall shadows. */
function installSolarFlashlight(){
    const key='tsuventure_solar_flashlight_v1',tr=(vi,en)=>window.tsuventureSettings?.language==='en'?en:vi;
    let owned=false,equipped=false,enabled=false;
    try{const s=JSON.parse(localStorage.getItem(key)||'{}');owned=s.owned===true;equipped=owned&&s.equipped===true;enabled=equipped&&s.enabled===true;}catch{}
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    const save=()=>{try{localStorage.setItem(key,JSON.stringify({owned,equipped,enabled}));}catch{}};
    function model(){const root=new THREE.Group(),materials={};for(const [name,rgb] of Object.entries(SOLAR_FLASHLIGHT_DATA.materials))materials[name]=new THREE.MeshStandardMaterial({color:new THREE.Color(...rgb),roughness:name==='lens'?.15:.4,metalness:name==='gold'?.65:.2,envMapIntensity:0});for(const p of SOLAR_FLASHLIGHT_DATA.parts){if(!materials[p.material])throw new Error('Unknown flashlight material: '+p.material);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flat(),3));geo.setIndex(p.indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,materials[p.material]);mesh.name=p.name;root.add(mesh);}root.traverse(o=>o.layers.enable(2));return root;}
    const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.48,.65,.8,8),new THREE.MeshStandardMaterial({color:0x777784,roughness:.85}));pedestal.name='TempleSolarRelic';pedestal.position.set(4.5,getGroundElevation(4.5,8,0)+.4,8);scene.add(pedestal);
    addCylinderCollider(4.5,8,.48,pedestal.position.y-.4,pedestal.position.y+.4,false);
    const relic=model();relic.position.copy(pedestal.position).y+=.65;relic.rotation.y=.8;scene.add(relic);
    const held=model();held.name='EquippedSolarFlashlight';scene.add(held);
    const item={id:'solar_flashlight',type:'solar_flashlight',pos:relic.position.clone(),radius:2.2,prompt:'Nhặt Đèn Pin Mặt Trời'};
    const light=new THREE.SpotLight(0xfff2d6,18,40,Math.PI/5,.65,1);light.name='SolarFlashlightBeam';light.layers.enable(2);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.near=.05;light.shadow.camera.far=40;light.shadow.bias=-.0001;light.shadow.normalBias=.025;scene.add(light,light.target);
    const row=document.createElement('div');row.className='backpack-item';row.innerHTML='<div style="font-size:48px" aria-hidden="true">🔦</div><div><h3></h3><p></p><strong></strong></div><button type="button"></button>';document.querySelector('#modal-backpack .backpack-hint').before(row);
    const equipButton=row.querySelector('button'),button=document.createElement('button'),touchButton=document.createElement('button');button.type=touchButton.type='button';button.className='hud-sit-button';touchButton.className='hud-touch-button';document.querySelector('.hud-quickbar').append(button);document.querySelector('.hud-touch-actions').append(touchButton);
    function render(){relic.visible=!owned;row.querySelector('h3').textContent=tr('Đèn Pin Mặt Trời','Solar Flashlight');row.querySelector('p').textContent=tr('Lõi năng lượng mặt trời · Không cần thay pin. Trang bị rồi nhấn L để bật/tắt; xoay camera để chiếu sáng.','Solar core · No battery replacements. Equip, then L to toggle; aim with the camera.');row.querySelector('strong').textContent=!owned?tr('Tại bệ đá ở Đền Trung Tâm','On the pedestal at the Central Temple'):equipped?tr('Đang trang bị','Equipped'):tr('Đã sở hữu','Owned');equipButton.textContent=equipped?tr('Tháo đèn','Unequip'):tr('Trang bị','Equip');equipButton.disabled=!owned||!gameState.isPlaying;equipButton.setAttribute('aria-pressed',String(equipped));button.hidden=touchButton.hidden=!equipped;button.textContent=enabled?tr('L · Tắt đèn','L · Light off'):tr('L · Bật đèn','L · Light on');touchButton.textContent='🔦';for(const b of [button,touchButton]){b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',button.textContent);}touchButton.parentElement.classList.toggle('has-flashlight',equipped);}
    function equip(value=!equipped){if(!owned||!gameState.isPlaying)return false;equipped=Boolean(value);enabled=equipped;save();render();update();return true;}
    function toggle(){if(!active()||!equipped)return false;enabled=!enabled;save();render();update();return true;}
    function nearby(p){return !owned&&p.distanceTo(item.pos)<=item.radius?item:null;}
    function interact(target){if(target!==item)return false;if(!active()||!nearby(playerGroup.position))return true;owned=true;save();render();sfx.pickup();showNotification(tr('Đã nhặt Đèn Pin Mặt Trời! Nhấn I để trang bị, L để bật/tắt.','Solar Flashlight acquired! I to equip, L to toggle.'));return true;}
    let initialized=false;const previousHand=new THREE.Vector3(),forward=new THREE.Vector3(0,0,-1);
    held.scale.setScalar(.48);
    function update(dt){window.heroMotion?.environment();const on=gameState.isPlaying&&equipped&&enabled;light.visible=on;held.visible=gameState.isPlaying&&equipped&&(!window.evilCavern?.inside()||on);
        renderer.shadowMap.enabled=Boolean(graphicsProfiles[currentProfileKey].shadows||((on||(gameState.isPlaying&&window.templeSupplies?.visionActive))&&window.evilCavern?.inside()));if(!held.visible){initialized=false;return;}
        const direction=camera.getWorldDirection(new THREE.Vector3()),hand=window.heroMotion?.hand('left',new THREE.Vector3(-.12,0,.6)),origin=hand?.position||playerGroup.position.clone().add(new THREE.Vector3(-.2,.4,0));
        const target=new THREE.Quaternion().setFromUnitVectors(forward,direction),snap=!initialized||dt===undefined||previousHand.distanceTo(origin)>3;
        if(snap)held.quaternion.copy(target);else held.quaternion.slerp(target,1-Math.exp(-18*Math.min(.1,dt)));
        held.position.copy(origin);previousHand.copy(origin);initialized=true;const aim=forward.clone().applyQuaternion(held.quaternion),muzzle=origin.clone().addScaledVector(aim,.18),head=playerGroup.position.clone().add(new THREE.Vector3(0,.45,0));
        light.position.copy(window.evilCavern?.inside()?evilCavern.clipCamera(head,muzzle):muzzle);light.target.position.copy(light.position).add(aim);
    }

    equipButton.onclick=()=>equip();button.onclick=()=>{toggle();button.blur();};touchButton.onclick=e=>{e.preventDefault();toggle();touchButton.blur();};
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='l'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.closest?.('input,textarea,select,button,summary')){if(toggle())e.preventDefault();}});
    window.addEventListener('tsuventure-settings-saved',render);new MutationObserver(render).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});
    window.solarFlashlight={grant(){owned=true;save();render();},item,pedestal,relic,held,light,row,button,touchButton,nearby,interact,equip,toggle,update,render,get owned(){return owned;},get equipped(){return equipped;},get enabled(){return enabled;}};render();update();
}

