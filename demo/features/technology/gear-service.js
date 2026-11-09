/* Persisted wear for repairable armor and weapons. */
async function installGearService(){
 const key='tsuventure_gear_condition_v1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 const maxima={iron:3500,ironSword:1000,rage:3500,samurai:3500,lavaSword:3500,forestSword:3500},names={iron:'Giáp sắt',ironSword:'Thanh Kiếm Sắt',rage:'Giáp cuồng nộ',samurai:'Giáp Samurai',lavaSword:'Thanh Gươm Dung Nham',forestSword:'Thanh Kiếm Rừng Sâu'},durability={},pending=[];
 let ironOwned=saved.ironOwned===true,ironEquipped=ironOwned&&saved.ironEquipped===true;
 function owned(id){return id==='ironSword'?ironOwned:id==='lavaSword'?volcanicValley.owned:id==='forestSword'?weaponSystem.owned:technologyCraft.state[id+'Owned'];}
 for(const [id,max]of Object.entries(maxima)){
     const n=saved.durability?.[id];
     if(Number.isFinite(n)){
         const scale=id==='iron'&&saved.version!==2?max/1000:1;
         durability[id]=THREE.MathUtils.clamp(n*scale,0,max);
     }else if(owned(id))durability[id]=max;
 }
 const save=()=>localStorage.setItem(key,JSON.stringify({version:2,durability,ironOwned,ironEquipped}));
 const broken=id=>owned(id)&&durability[id]===0;
 function reset(id){if(!maxima[id])return false;durability[id]=maxima[id];save();technologyCraft.syncArmor();render();return true;}
 const ironModel=createTreasuryModel('iron_sword');ironModel.name='EquippedIronSword';ironModel.scale.setScalar(.62);ironModel.visible=false;scene.add(ironModel);
 const ironRow=document.createElement('article');ironRow.id='equipment-iron-sword';ironRow.className='backpack-item';ironRow.dataset.category='equipment';ironRow.innerHTML='<img src="features/inventory/assets/progression/iron_sword.png" alt="Thanh Kiếm Sắt"><div><h3>Thanh Kiếm Sắt</h3><p>80 sát thương cơ bản · Độ bền 1000 · Bị hủy khi hết độ bền.</p><strong></strong><button type="button">Trang bị</button></div>';inventoryLayout.grid.append(ironRow);
 function equipIron(value){if(value&&(!ironOwned||broken('ironSword')||!gameState.isPlaying))return false;ironEquipped=!!value;if(value){weaponSystem.equip(false);volcanicValley.setEquipped(false);}save();render();return true;}ironRow.querySelector('button').onclick=()=>equipIron(!ironEquipped);
 function breakItem(id){if(id==='ironSword'){ironOwned=ironEquipped=false;}else if(id==='lavaSword')volcanicValley.breakWeapon();else if(id==='forestSword')weaponSystem.breakWeapon();else technologyCraft.breakEquipment(id);save();render();showNotification((id.endsWith('Sword')?'Kiếm hỏng · ':'Giáp hỏng · ')+names[id]+(maxima[id]===1000?' đã bị hủy.':' · Mang đến bàn sửa chữa.'));}
 function wear(id,amount){
     if(!owned(id)||!Number.isFinite(amount)||amount<=0)return false;
     const previous=durability[id]??maxima[id];
     if(previous===0)return false;
     const cost=Object.hasOwn(technologyCraft.armorPools,id)?amount:Math.ceil(amount);
     durability[id]=previous-cost<1e-8?0:previous-cost;
     if(durability[id]===0)breakItem(id);
     else if(technologyCraft.equippedArmor()===id)technologyCraft.syncArmor();
     save();render();return true;
 }
 function remainingFraction(id){return id?(durability[id]??maxima[id])/maxima[id]:0;}
 function absorbArmor(amount){
     const id=technologyCraft.equippedArmor();
     if(!id||amount<=0)return 0;
     const pool=technologyCraft.armorPools[id];
     const absorbed=Math.min(amount,pool*remainingFraction(id));
     wear(id,absorbed*maxima[id]/pool);
     return absorbed;
 }
 function weaponHit(damage){const id=weaponSystem.equipped?'forestSword':volcanicValley.equipped?'lavaSword':ironEquipped?'ironSword':null;if(id&&Number.isFinite(damage)&&damage>0)pending.push({id,amount:Math.max(1,Math.ceil(damage*.1))});}
 function fallDamage(amount){return technologyCraft.equippedArmor()==='samurai'&&!broken('samurai')?Math.round(amount*.2):amount;}
 const repairRoot=new THREE.Group();repairRoot.name='TechnologyRepairStation';repairRoot.position.copy(technologyBase.center).add(new THREE.Vector3(38,0,-25));scene.add(repairRoot);
 const steel=new THREE.MeshStandardMaterial({color:0x526777,metalness:.5,roughness:.45}),light=new THREE.MeshBasicMaterial({color:0x7ad9c9});
 function part(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);repairRoot.add(o);return o;}
 part(new THREE.BoxGeometry(9,1.6,3),steel,0,.8,0);part(new THREE.BoxGeometry(8.5,.15,2.8),light,0,1.68,0);for(const x of [-3.7,3.7]){part(new THREE.BoxGeometry(.3,3.3,.3),steel,x,3,-.9);part(new THREE.SphereGeometry(.25,10,6),light,x,4.7,-.9);}part(new THREE.BoxGeometry(7.6,.3,.3),steel,0,4.5,-.9);part(new THREE.CylinderGeometry(.12,.22,1.3,8),steel,0,3.65,-.9);part(new THREE.BoxGeometry(1.6,.2,1.2),steel,0,2.97,-.9);
 const terminal=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.4),new THREE.MeshBasicMaterial({map:technologyBase.group.getObjectByName('CraftingComputerDisplay').material.map}));terminal.position.set(-2.4,2.9,-1.2);repairRoot.add(terminal);
 addBoxCollider(repairRoot.position.x,repairRoot.position.z,9,3,repairRoot.position.y,repairRoot.position.y+1.7,false);colliders.at(-1).name='technology-repair-bench';
 const repairItem={id:'technology_repair_bench',type:'technology_repair',pos:repairRoot.position.clone().add(new THREE.Vector3(0,0,6)),radius:5,prompt:'E · Mở bàn sửa chữa'};interactables.push(repairItem);
 const modal=document.createElement('div');modal.id='modal-gear-repair';modal.className='modal-overlay';modal.innerHTML='<section class="modal-content workshop-panel"><header><small>TSU · MAINTENANCE</small><h2>Bàn Sửa Chữa</h2><p>Giáp có độ bền 3500. Mỗi 10% cần 10 sắt và 1 xu vàng.</p></header><div class="repair-list"></div><button type="button" class="close-repair">Đóng</button></section>';document.body.append(modal);modal.querySelector('.close-repair').onclick=()=>closeModal(modal.id);
 const images={iron:'iron_armor.png',rage:'rage_armor.png',samurai:'progression/samurai_armor.png',lavaSword:'lava_sword.png',forestSword:'progression/forest_sword.png'},repairCards={};
 function quote(id,steps=10){if(!maxima[id]||id==='ironSword'||!owned(id))return null;steps=Number(steps);if(!Number.isInteger(steps)||steps<1||steps>10)return null;const missing=maxima[id]-(durability[id]??maxima[id]),gain=Math.min(missing,maxima[id]*steps/10),units=Math.ceil(gain/(maxima[id]/10)-1e-10);return {missing,gain,steps,iron:units*10,goldCoin:units};}
 function nearRepair(){return gameState.isPlaying&&!gameState.inDialogue&&modal.classList.contains('active')&&playerGroup.position.distanceTo(repairItem.pos)<=repairItem.radius;}
 function repair(id,steps=10){const q=quote(id,steps);if(!q||!q.missing||!nearRepair()||monsterCamps.stock.iron<q.iron||monsterCamps.stock.goldCoin<q.goldCoin)return false;monsterCamps.stock.iron-=q.iron;monsterCamps.stock.goldCoin-=q.goldCoin;monsterCamps.save();monsterCamps.render();durability[id]=Math.min(maxima[id],durability[id]+q.gain);save();technologyCraft.syncArmor();technologyCraft.render();render();showNotification('Đã sửa '+names[id]+' · '+Math.ceil(durability[id])+'/'+maxima[id]);return true;}
 for(const [id,image]of Object.entries(images)){const card=document.createElement('article');card.className='repair-card';card.dataset.rarity=id==='iron'?'common':'rare';card.dataset.gear=id;card.innerHTML='<img alt="" src="features/inventory/assets/'+image+'"><div><h3>'+names[id]+'</h3><p></p><button type="button">Sửa chữa</button></div>';const select=document.createElement('select');select.setAttribute('aria-label','Phần trăm độ bền cần sửa');for(let n=1;n<=10;n++){const o=document.createElement('option');o.value=n;o.textContent=(n*10)+'% · '+(n*10)+' sắt + '+n+' xu';select.append(o);}card.querySelector('button').before(select);select.onchange=render;card.querySelector('button').onclick=()=>repair(id,Number(select.value));modal.querySelector('.repair-list').append(card);repairCards[id]=card;}
 const gearRows=()=>({iron:technologyCraft.rows.iron,rage:technologyCraft.rows.rage,samurai:technologyCraft.rows.samurai,lavaSword:volcanicValley.row,forestSword:weaponSystem.row,ironSword:ironRow});
 function render(){ironRow.querySelector('strong').textContent=ironEquipped?'Đang trang bị':ironOwned?'Đã sở hữu':'Chưa chế tạo';ironRow.querySelector('button').disabled=!ironOwned||broken('ironSword')||!gameState.isPlaying;ironRow.querySelector('button').textContent=ironEquipped?'Tháo trang bị':'Trang bị';for(const [id,row]of Object.entries(gearRows())){if(!row)continue;let text=row.querySelector('.gear-condition');if(!text){text=document.createElement('p');text.className='gear-condition';row.append(text);}const value=owned(id)?(durability[id]??maxima[id]):0,label=owned(id)?value===0?(id.endsWith('Sword')?'Kiếm hỏng':'Giáp hỏng'):'Độ bền: '+Math.ceil(value)+' / '+maxima[id]:durability[id]===0?(id.endsWith('Sword')?'Kiếm hỏng · Đã hủy':'Giáp hỏng · Đã hủy'):'Chưa sở hữu';if(text.textContent!==label)text.textContent=label;text.classList.toggle('is-broken',owned(id)&&value===0);if(broken(id))row.querySelector('button').disabled=true;}
  for(const [id,card]of Object.entries(repairCards)){const q=quote(id,Number(card.querySelector('select').value)),p=card.querySelector('p'),label=!q?'Chưa sở hữu':!q.missing?'Độ bền đầy đủ':(broken(id)?'Đã hỏng · ':'')+(Math.ceil(durability[id]??maxima[id]))+'/'+maxima[id]+' · '+q.iron+' sắt + '+q.goldCoin+' xu vàng';if(p.textContent!==label)p.textContent=label;card.querySelector('button').disabled=!q||!q.missing||!nearRepair()||monsterCamps.stock.iron<q.iron||monsterCamps.stock.goldCoin<q.goldCoin;}
 }
 function craftWeapon(id,cost){if(!gameState.isPlaying||gameState.inDialogue||!riverBoat.modal.classList.contains('active')||playerGroup.position.distanceTo(technologyBase.bench.pos)>technologyBase.bench.radius||owned(id)||Object.entries(cost).some(([k,n])=>monsterCamps.stock[k]<n))return false;for(const [k,n]of Object.entries(cost))monsterCamps.stock[k]-=n;monsterCamps.save();monsterCamps.render();if(id==='ironSword')ironOwned=true;else volcanicValley.grant();reset(id);if(id==='ironSword')equipIron(true);else volcanicValley.setEquipped(true);workshopUI.render();inventoryLayout.render();showNotification('Đã chế tạo '+names[id]);return true;}
 for(const [id,cost,image]of [['ironSword',{iron:40},'progression/iron_sword.png'],['lavaSword',{galacticLava:1,iron:120},'lava_sword.png']]){const card=document.createElement('article');card.innerHTML='<h3>'+names[id]+'</h3><p>'+(id==='ironSword'?'80 sát thương · Độ bền 1000.':'Sát thương cao · Đòn trúng thứ hai liên tiếp +10% · Độ bền 3500.')+'</p><p class="recipe-stock"></p><button type="button">Chế tạo</button>';card.querySelector('button').onclick=()=>craftWeapon(id,cost);workshopUI.addRecipe({id,name:names[id],cost,image,card,render(){card.querySelector('p.recipe-stock').textContent=Object.entries(cost).map(([k,n])=>(k==='iron'?'Sắt':'Dung Nham Thiên Hà')+': '+monsterCamps.stock[k]+' / '+n).join(' · ');card.querySelector('button').disabled=owned(id)||!gameState.isPlaying||playerGroup.position.distanceTo(technologyBase.bench.pos)>technologyBase.bench.radius||Object.entries(cost).some(([k,n])=>monsterCamps.stock[k]<n);}});}
 function update(dt){for(const {id,amount}of pending.splice(0))wear(id,amount);for(const id of Object.keys(maxima))if(owned(id)&&durability[id]===undefined){durability[id]=maxima[id];save();}ironModel.visible=gameState.isPlaying&&ironEquipped&&!broken('ironSword');if(ironModel.visible){heroMotion.alignWeapon(ironModel,.25);}if(modal.classList.contains('active'))render();}
 window.gearSystem={maxima,names,durability,ironModel,ironRow,repairItem,repairRoot,modal,quote,repair,broken,reset,wear,remainingFraction,absorbArmor,weaponHit,fallDamage,craftWeapon,equipIron,unequipIron(){if(ironEquipped)equipIron(false);},grantIron(){ironOwned=true;reset('ironSword');},render,update,interact(item){if(item!==repairItem)return false;if(playerGroup.position.distanceTo(item.pos)>item.radius)return false;openModal(modal.id);render();return true;},get ironOwned(){return ironOwned;},get ironEquipped(){return ironEquipped;}};
 if(ironEquipped){weaponSystem.equip(false);volcanicValley.setEquipped(false);}
 for(const id of Object.keys(maxima))if(broken(id)){if(id==='ironSword')ironEquipped=false;else if(id==='lavaSword')volcanicValley.breakWeapon();else if(id==='forestSword')weaponSystem.breakWeapon();else technologyCraft.breakEquipment(id);}technologyCraft.syncArmor();save();render();
 new MutationObserver(render).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});
}
