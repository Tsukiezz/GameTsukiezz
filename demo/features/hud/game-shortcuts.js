/* One keyboard entry point for panels and train actions while looking around. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installGameShortcuts(){
    const bindings=[['1','Đổi góc nhìn','#btn-toggle-view'],['G','Địa điểm','#hud-travel summary'],['P','Skin','#hud-heroes-button'],['I','Balo','#hud-backpack-button'],['B','Thư viện','#btn-field-guide'],['M','Bản đồ',null],['O','Cài đặt','.hud-settings-button'],['H','Điều khiển','#hud-help summary'],['Home','Về sảnh','#btn-return-home']];
    for(const [key,label,selector] of bindings){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const el=selector&&document.querySelector(selector);if(el){el.setAttribute('aria-keyshortcuts',key);el.title=label+' · '+key;}}
    const info=document.createElement('div');info.className='hud-shortcut-list';info.innerHTML='<p><b>1</b> Góc nhìn thứ nhất / thứ ba · <b>G</b> Địa điểm · <b>P</b> Skin &middot; <b>I</b> Balo · <b>B</b> Thư viện · <b>M</b> Bản đồ · <b>O</b> Cài đặt · <b>H</b> Trợ giúp · <b>Home</b> Sảnh</p><p>Ở ga: <b>R</b> gọi tàu, <b>T</b> đổi tuyến, <b>E</b> lên tàu. <b>U</b> mở bảng điều độ.</p><p>Trên tàu: <b>E</b> xuống ở ga kế tiếp, <b>C</b> ngồi/đứng, <b>1–8</b> chọn ghế, <b>N</b> đổi ghế, <b>V</b> đổi góc cửa sổ, <b>Z/X</b> thu/phóng.</p><p>Bản đồ: <b>+/−</b> phóng/thu, <b>phím mũi tên</b> di chuyển, <b>0</b> vị trí của bạn, <b>9</b> toàn bản đồ.</p><p><b>L</b> đèn pin · <b>F</b> c&#225;nh pha l&#234; &middot; <b>Esc</b> hiện chuột/đóng bảng.</p>';document.querySelector('#hud-help .hud-help-content').append(info);
    const hint=document.createElement('span');hint.innerHTML='<span class="hud-key">H</span> Ph?m t?t';document.querySelector('.hud-quickbar').append(hint);
    function toggleModal(id,open){const el=document.getElementById(id);if(!el)return false;gameMouse.release(true);gameHUD.closePanels();if(el.classList.contains('active'))closeModal(id);else{document.querySelectorAll('.modal-overlay.active').forEach(n=>closeModal(n.id));open?open():openModal(id);}return true;}
    function toggleDetails(details){gameMouse.release(true);const opened=details.open;gameHUD.closePanels();details.open=!opened;resetGameplayInput();details.querySelector('summary').focus();return true;}
    function handle(e){
        if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||!gameState.isPlaying||e.target?.closest?.('textarea,[contenteditable=true],select,input:not([type=range]):not([type=checkbox])'))return;
        const key=e.key.toLowerCase();let used=false;
        if(key==='enter'&&!playerLife.notice.hidden){playerLife.dismissDeath();used=true;}
        else if(document.getElementById('modal-world-atlas').classList.contains('active')){
            const atlas=worldAtlas.atlas;if(key==='+'||key==='='){atlas.querySelector('[data-zoom="1"]').click();used=true;}else if(key==='-'){atlas.querySelector('[data-zoom="-1"]').click();used=true;}else if(key==='0'){atlas.querySelector('[data-center]').click();used=true;}else if(key==='9'){atlas.querySelector('[data-all]').click();used=true;}else if(key.startsWith('arrow')){worldAtlas.pan(key==='arrowleft'?-1:key==='arrowright'?1:0,key==='arrowup'?-1:key==='arrowdown'?1:0);used=true;}else if(key==='m'){closeModal(atlas.id);used=true;}
        }else if(key==='i')used=toggleModal('modal-backpack',()=>document.getElementById('hud-backpack-button').click());
        else if(key==='b')used=toggleModal('modal-field-guide',()=>fieldGuide.open());
        else if(key==='m')used=toggleModal('modal-world-atlas',()=>worldAtlas.open());
        else if(key==='o')used=toggleModal('modal-settings');
        else if(key==='p')used=toggleModal('modal-heroes');
        else if(!document.querySelector('.modal-overlay.active')){
            if(key==='g')used=toggleDetails(gameHUD.travel);else if(key==='h'||key==='?')used=toggleDetails(gameHUD.help);
            else if(key==='home'){document.getElementById('btn-return-home').click();used=true;}
            else if(!gameState.inDialogue){if(key==='r')used=moonRailway.aboard?moonRailway.requestNextStop():moonRailway.requestStop();else if(key==='t')used=moonRailway.cycleLine();else if(moonRailway.aboard){if(key==='v')used=moonRailway.cycleView();else if(key==='z')used=moonRailway.zoomBy(-6);else if(key==='x')used=moonRailway.zoomBy(6);else if(key==='n')used=moonRailway.cycleSeat();else if(/^[1-8]$/.test(key))used=moonRailway.chooseSeat(Number(key)-1);}}
        }
        if(used){e.preventDefault();e.stopImmediatePropagation();}
    }
    window.addEventListener('keydown',handle,true);
    window.gameShortcuts={bindings,handle};
}
