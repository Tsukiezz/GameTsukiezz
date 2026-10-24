function updatePlayerVitals(){
    for(const [key,maxKey] of [['health','maxHealth'],['armor','maxArmor'],['stamina','maxStamina'],['oxygen','maxOxygen']]){
        const max=Math.max(1,Number(gameState[maxKey])||100),value=Math.max(0,Math.min(max,Number(gameState[key])||0));
        gameState[key]=value;
        const bar=document.getElementById('hud-'+key+'-bar'),text=document.getElementById('hud-'+key+'-value');
        if(!bar)continue;
        if(key==='oxygen')bar.closest('.hud-vital-row').hidden=!window.playerSurvival?.swimming;
        const display=key==='stamina'&&window.backpack?.infiniteStamina?'∞':Math.ceil(value)+' / '+max;
        if(text.textContent!==display)text.textContent=display;
        if(bar.getAttribute('aria-valuenow')!==String(value)){
            bar.setAttribute('aria-valuenow',value);bar.setAttribute('aria-valuemax',max);
            bar.firstElementChild.style.width=(100*value/max)+'%';
        }
    }
}
function installGameHUD(){
    const hud=document.getElementById('game-hud'),header=hud.querySelector('.hud-top-bar');
    const status=hud.querySelector('.player-status-card'),map=hud.querySelector('.hud-minimap-card');
    const location=document.getElementById('hud-landmark-badge'),helper=hud.querySelector('.hud-controls-helper');
    const perf=document.getElementById('hud-perf-chip'),home=document.getElementById('btn-return-home');
    const sit=document.getElementById('btn-toggle-sit'),tour=hud.querySelector('.hud-tour-bar');
    status.children[1].classList.add('hud-status-content');status.children[1].children[0].classList.add('hud-status-heading');
    const bars=status.querySelector('.hud-bars');bars.setAttribute('aria-label','Máu và giáp');
    for(const [key,label,selector] of [['health','Máu','.hud-bar-hp'],['armor','Giáp','.hud-bar-sp']]){
        const fill=bars.querySelector(selector),track=fill.parentElement,row=document.createElement('div');row.className='hud-vital-row';
        const heading=document.createElement('div');heading.className='hud-vital-heading';
        const name=document.createElement('span'),value=document.createElement('span');name.textContent=label;value.id='hud-'+key+'-value';
        heading.append(name,value);track.before(row);row.append(heading,track);
        track.id='hud-'+key+'-bar';track.setAttribute('role','progressbar');track.setAttribute('aria-label',label);track.setAttribute('aria-valuemin','0');
    }
    for(const [key,label] of [['stamina','Thể lực'],['oxygen','Oxy']]){
        const row=document.createElement('div');row.className='hud-vital-row';
        const heading=document.createElement('div');heading.className='hud-vital-heading';const name=document.createElement('span');name.textContent=label;
        const value=document.createElement('span');value.id='hud-'+key+'-value';heading.append(name,value);
        const track=document.createElement('div');track.className='hud-bar-bg';track.id='hud-'+key+'-bar';track.setAttribute('role','progressbar');track.setAttribute('aria-label',label);track.setAttribute('aria-valuemin','0');
        const fill=document.createElement('div');fill.className='hud-bar-'+key;track.append(fill);row.append(heading,track);bars.append(row);
    }
    updatePlayerVitals();
    // Keep location and boss panels below all currently visible vital bars.
    const placeLocation=()=>{const bottom=Math.ceil(status.getBoundingClientRect().bottom-hud.getBoundingClientRect().top);location.style.top=(bottom+10)+'px';hud.style.setProperty('--hud-boss-top',(bottom+70)+'px');};
    new ResizeObserver(placeLocation).observe(status);
    map.querySelector('.hud-minimap-header>span').textContent='BẢN ĐỒ · 2080m';
    home.textContent='↩ Trang chủ';home.title='Về trang chủ';home.setAttribute('aria-label','Về trang chủ');
    perf.title='Hiệu năng và đồ họa';perf.setAttribute('role','button');perf.tabIndex=0;
    perf.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal('modal-settings');}});
    const actions=document.createElement('nav');actions.className='hud-actions';actions.setAttribute('aria-label','Menu trong game');
    function button(text,label,callback,className=''){
        const b=document.createElement('button');b.type='button';b.className='hud-action '+className;b.innerHTML=text;b.title=label;b.setAttribute('aria-label',label);
        b.onclick=()=>{closePanels();callback();};return b;
    }
    const panels=[];
    function closePanels(except=null){for(const p of panels)if(p!==except)p.open=false;}
    function panel(id,title,description,summary){
        const d=document.createElement('details');d.id=id;
        const s=document.createElement('summary');s.textContent=summary;s.setAttribute('aria-label',title);s.setAttribute('aria-expanded','false');
        const content=document.createElement('div');content.className=id==='hud-travel'?'hud-travel-content':'hud-help-content';
        const heading=document.createElement('div');heading.className='hud-panel-heading';
        const words=document.createElement('div'),h=document.createElement('h2'),p=document.createElement('p');h.textContent=title;p.textContent=description;words.append(h,p);
        const x=document.createElement('button');x.className='hud-panel-close';x.textContent='×';x.setAttribute('aria-label','Đóng '+title.toLowerCase());
        x.onclick=()=>{d.open=false;s.focus();};heading.append(words,x);content.append(heading);d.append(s,content);
        d.addEventListener('toggle',()=>{s.setAttribute('aria-expanded',String(d.open));if(d.open){closePanels(d);resetGameplayInput();}});
        panels.push(d);return {details:d,content};
    }
    const travel=panel('hud-travel','Chọn điểm đến','Di chuyển nhanh đến khu vực bạn muốn khám phá.','⌖ Địa điểm');
    const buttons=[...tour.querySelectorAll('.tour-btn')].filter(b=>b!==sit);
    const renames={1:'🏰 Đại điện',3:'🧱 Phòng tiếp khách',4:'👑 Ngai vàng',5:'✨ Gác mái',7:'🚪 Cửa hầm bí mật',9:'⚔️ Đấu trường',11:'🩸 Tế đàn',13:'🌳 Cổ thụ'};
    for(const [index,text] of Object.entries(renames))buttons[index].textContent=text;
    for(const [title,indices] of [['Thế giới',[0,9,10,11,12,13,14,15]],['Lâu đài',[1,2,3,4,5,6,7,8]]]){
        const group=document.createElement('section');group.className='hud-travel-group';
        const h=document.createElement('h3');h.textContent=title;
        const grid=document.createElement('div');grid.className='hud-destinations';
        for(const i of indices){const b=buttons[i];b.addEventListener('click',()=>{closePanels();b.blur();renderer.domElement.focus({preventScroll:true});});grid.append(b);}
        group.append(h,grid);travel.content.append(group);
    }
    const help=panel('hud-help','Điều khiển','Giữ chuột phải để nhìn quanh, lăn chuột để đổi khoảng cách.','?');
    helper.children[2].lastChild.textContent=' Nhảy';helper.children[3].lastChild.textContent=' Ngồi / đứng';
    helper.children[4].querySelector('.hud-key').textContent='Chuột phải';
    help.content.append(helper);
    const helpSettings=button('⚙ Cài đặt đồ họa','Cài đặt đồ họa',()=>openModal('modal-settings'));help.content.append(helpSettings);
    const heroButton=button('♙ <span class="hud-action-text">Nhân vật</span>','Đổi nhân vật',()=>openModal('modal-heroes'));heroButton.id='hud-heroes-button';
    actions.append(travel.details,heroButton,
        button('⚙','Cài đặt',()=>openModal('modal-settings'),'hud-settings-button'),help.details,perf,home);
    header.replaceChildren(status,actions);hud.append(location,map);
    tour.remove();hud.querySelector('.hud-bottom-bar').remove();
    const quick=document.createElement('div');quick.className='hud-quickbar';
    quick.innerHTML='<span><span class="hud-key">WASD</span> Di chuyển</span><span><span class="hud-key">Space</span> Nhảy</span><span><span class="hud-key">E</span> Tương tác</span>';
    sit.removeAttribute('style');sit.textContent='C · Ngồi / đứng';sit.className='hud-sit-button';quick.append(sit);hud.append(quick);
    document.getElementById('hud-toast').setAttribute('role','status');document.getElementById('hud-toast').setAttribute('aria-live','polite');
    document.getElementById('hud-prompt').setAttribute('role','status');renderer.domElement.tabIndex=0;
    window.resetGameplayInput=function(){for(const key of Object.keys(keys))keys[key]=false;hud.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));isRightMouseDown=false;if(document.pointerLockElement)document.exitPointerLock();};
    hud.addEventListener('pointerdown',()=>resetGameplayInput());
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('#game-hud details'))closePanels();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){
        const modal=document.querySelector('.modal-overlay.active'),opened=panels.find(p=>p.open);
        if(modal){closeModal(modal.id);renderer.domElement.focus({preventScroll:true});}
        closePanels();opened?.querySelector('summary').focus();resetGameplayInput();
    }});
    window.addEventListener('blur',resetGameplayInput);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)resetGameplayInput();});
    installHUDTouchControls(hud);
    window.gameHUD={closePanels,travel:travel.details,help:help.details};
}
function installHUDTouchControls(hud){
    const controls=document.createElement('div');controls.className='hud-touch-controls';controls.setAttribute('aria-label','Điều khiển cảm ứng');
    const pad=document.createElement('div');pad.className='hud-dpad';
    const actions=document.createElement('div');actions.className='hud-touch-actions';
    function held(label,name,start,end){
        const b=document.createElement('button');b.className='hud-touch-button';b.textContent=label;b.setAttribute('aria-label',name);
        const release=()=>{b.classList.remove('pressed');end?.();};
        b.onpointerdown=e=>{e.preventDefault();e.stopPropagation();if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;b.setPointerCapture(e.pointerId);b.classList.add('pressed');start();};
        b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;return b;
    }
    for(const [key,icon,label] of [['forward','↑','Đi tới'],['left','←','Sang trái'],['backward','↓','Đi lùi'],['right','→','Sang phải']]){
        const b=held(icon,label,()=>{keys[key]=true;},()=>{keys[key]=false;});b.dataset.move=key;pad.append(b);
    }
    actions.append(held('⚔','Tấn công',triggerAttack),held('↥','Nhảy / Nổi lên',()=>{keys.jump=true;keys.swimUp=true;},()=>{keys.swimUp=false;}),held('↧','Lặn',()=>{keys.dive=true;},()=>{keys.dive=false;}),held('E','Tương tác',()=>{checkInteractables();handleInteraction();}));
    controls.append(pad,actions);hud.append(controls);
    let touch=null;
    renderer.domElement.style.touchAction='none';
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&gameState.isPlaying&&!gameState.inDialogue){e.preventDefault();touch={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}});
    renderer.domElement.addEventListener('pointermove',e=>{if(touch?.id===e.pointerId){camYaw-=(e.clientX-touch.x)*.006;camPitch=Math.max(-1.25,Math.min(1.25,camPitch+(e.clientY-touch.y)*.005));touch.x=e.clientX;touch.y=e.clientY;playerGroup.rotation.y=camYaw;}});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,e=>{if(touch?.id===e.pointerId)touch=null;});
}
