/* Versioned single-player gift. Stackable items use their real loot/save stores. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installGiftCode(){
    const key='tsuventure_gift_code_v1',quantity=9999,revision=5;
    let state={claimed:false,revision:0,unique:{}};
    try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object')state={...state,...saved,unique:saved.unique||{}};}catch{}
    const form=document.createElement('form');form.className='gift-code-form';
    form.innerHTML='<label for="gift-code">CODE</label><p>Mã Tsukiezz cấp 9999 vật phẩm thường và tối đa một bản mỗi món hiếm.</p><div><input id="gift-code" autocomplete="off" spellcheck="false" placeholder="Nhập mã quà tặng" maxlength="48"><button type="submit">Nhận quà</button></div><p id="gift-code-status" role="status"></p>';
    document.querySelector('#modal-settings .settings-save-footer').before(form);
    const uniques=[['wings',crystalWings],['flashlight',solarFlashlight],['lavaSword',volcanicValley],['boat',riverBoat],['forestSword',weaponSystem],['ancientFragment',mangroveRealm]];
    const rowIds={wings:'crystal-wings-item',ancientFragment:'ancient-fragment-inventory',forestSword:'equipment-forest-sword',boat:'backpack-river-boat',map:'backpack-cavern-exit-map',bean:'backpack-magic-bean',voidFragments:'void-fragment-inventory',iron:'equipment-iron',diving:'equipment-diving',rage:'equipment-rage'};
    const rareIds=new Set(['wings','flashlight','lavaSword','forestSword','ancientFragment','rage']);
    function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
    function count(id,earned=0){const n=state.unique[id];return Math.min(rareIds.has(id)?1:Infinity,Math.max(earned,Number.isSafeInteger(n)&&n>=0?n:0));}
    for(const id of rareIds)if(Object.hasOwn(state.unique,id))state.unique[id]=count(id);
    function renderQuantity(row){
        const id=Object.keys(rowIds).find(id=>rowIds[id]===row.id)||uniques.find(([,api])=>api.row===row)?.[0]||(row.id.startsWith('arena-medal-')?row.id:null);
        if(!id||count(id)===0)return;
        const strong=row.querySelector('strong');if(!strong)return;
        const suffix=row.querySelector('[aria-pressed="true"]')?' · Đang trang bị':'';
        const text='Số lượng: '+count(id)+suffix;
        if(strong.textContent!==text)strong.textContent=text;
        if(row.id.startsWith('arena-medal-'))row.dataset.owned='true';
    }
    function render(){for(const row of document.querySelectorAll('#modal-backpack .backpack-item'))renderQuantity(row);}
    function topUp(current,add){const amount=Math.max(0,quantity-current);if(amount)add(amount);}
    function restoreOwnership(){
        for(const [id,api] of uniques)if(count(id))api.grant();
        if(count('map'))explorationUpdate.grantMap();
        if(count('bean'))explorationUpdate.grantBean();
    }
    function redeem(code){
        const status=form.querySelector('#gift-code-status');
        if(code.trim()!=='Tsukiezz'){status.textContent='Mã không hợp lệ.';return false;}
        if(state.claimed&&state.revision>=revision){status.textContent='Bạn đã nhận bản quà 9999 đầy đủ này trên thiết bị này.';return false;}
        technologyCraft.grant();gearSystem.grantIron();window.undergroundNetwork?.grantStock(9999);
        topUp(snowCrystals.count,n=>snowCrystals.add(n));topUp(candyProvisions.count,n=>candyProvisions.add(n));
        topUp(santaGifts.engines,n=>santaGifts.addEngines(n));topUp(backpack.count,n=>backpack.add(n));
        for(const kind of ['elixir','bandage'])topUp(templeSupplies.counts[kind],n=>templeSupplies.add(kind,n));
        const materials={};for(const kind of Object.keys(riverBoat.stock))materials[kind]=Math.max(0,quantity-riverBoat.stock[kind]);riverBoat.addMaterials(materials);
        bachKhuyet.grantOres(quantity);
        for(const kind of Object.keys(monsterCamps.stock))topUp(monsterCamps.stock[kind],n=>monsterCamps.add(kind,n));
        for(const id of [...uniques.map(([id])=>id),'map','bean','voidFragments','iron','diving','rage',...Array.from({length:5},(_,i)=>'arena-medal-'+(i+1))])state.unique[id]=rareIds.has(id)?1:Math.max(count(id),quantity);
        state.claimed=true;state.revision=revision;save();restoreOwnership();render();treeWood.update(.2);inventoryLayout.render();
        status.textContent='Đã nhận vật phẩm và trang bị. Mỗi món hiếm có giới hạn sở hữu là 1.';showNotification(status.textContent);return true;
    }
    form.addEventListener('submit',e=>{e.preventDefault();redeem(form.querySelector('input').value);});
    window.giftCode={form,redeem,render,renderQuantity,count,get claimed(){return state.claimed&&state.revision>=revision;},get unique(){return {...state.unique};}};
    if(state.claimed)save();restoreOwnership();render();
    new MutationObserver(()=>{render();window.inventoryWorkspace?.render();}).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});
}
