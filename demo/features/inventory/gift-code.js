/* Local single-player reward code, stored independently from equipment state. */
function installGiftCode(){
    const key='tsuventure_gift_code_v1',quantity=9999;let state={claimed:false,unique:{}};try{const s=JSON.parse(localStorage.getItem(key)||'{}');if(s?.claimed===true)state={claimed:true,unique:s.unique||{}};}catch{}
    const form=document.createElement('form');form.className='gift-code-form';form.innerHTML='<label for="gift-code">CODE</label><p>Nhập mã quà tặng để nhận vật phẩm.</p><div><input id="gift-code" autocomplete="off" spellcheck="false" placeholder="Nhập mã quà tặng" maxlength="48"><button type="submit">Nhận quà</button></div><p id="gift-code-status" role="status"></p>';
    document.querySelector('#modal-settings .settings-save-footer').before(form);
    const uniques=[['wings','Đôi Cánh Pha Lê',crystalWings],['flashlight','Đèn Pin Mặt Trời',solarFlashlight],['lavaSword','Gươm Dung Nham',volcanicValley],['boat','Thuyền thám hiểm',riverBoat],['ancientFragment','Mảnh Vỡ Cổ Đại',mangroveRealm]];
    const singletonIds=new Set(['wings','flashlight','ancientFragment']);for(const id of singletonIds)if(state.claimed||state.unique[id])state.unique[id]=1;try{localStorage.setItem(key,JSON.stringify(state));}catch{}
    function render(){for(const [id,label,api] of uniques){const row=api.row;if(!row)continue;let count=row.querySelector('.gift-quantity');if(!count){count=document.createElement('p');count.className='gift-quantity';row.querySelector('strong')?.after(count);}count.textContent=singletonIds.has(id)?'Vật phẩm duy nhất · '+(api.owned?'1 / 1':'Chưa sở hữu'):state.claimed?label+' · Số lượng: '+quantity:'';count.hidden=singletonIds.has(id)?false:!state.claimed;}}
    function redeem(code){const status=form.querySelector('#gift-code-status');if(code.trim()!=='Tsukiezz'){status.textContent='Mã không hợp lệ.';return false;}if(state.claimed){status.textContent='Bạn đã nhận mã này trên thiết bị này.';return false;}
        // Set ownership through each live system; consumables use the same stores as normal loot.
        window.technologyCraft?.grant();window.snowCrystals?.add(quantity);window.candyProvisions?.add(quantity);window.santaGifts?.addEngines(quantity);backpack.add(quantity);for(const type of ['elixir','bandage'])templeSupplies.add(type,quantity);riverBoat.addMaterials({wood:quantity,scrap:quantity});bachKhuyet.addOres(quantity);
        for(const type of Object.keys(monsterCamps.stock))monsterCamps.add(type,quantity);
        for(const [id,,api] of uniques){api.grant();state.unique[id]=singletonIds.has(id)?1:quantity;}
        state.claimed=true;try{localStorage.setItem(key,JSON.stringify(state));}catch{}render();window.treeWood?.update(.2);inventoryLayout.render();status.textContent='Đã nhận 9999 mỗi vật phẩm và mở khóa toàn bộ trang bị, cổ vật hiện có!';showNotification(status.textContent);return true;
    }
    form.addEventListener('submit',e=>{e.preventDefault();redeem(form.querySelector('input').value);});
    new MutationObserver(render).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});
    if(state.claimed)for(const [,,api] of uniques)api.grant();render();window.giftCode={form,redeem,render,get claimed(){return state.claimed;},get unique(){return {...state.unique};}};
}
