(async()=>{
 const checks=[],views={},check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail}),wait=ms=>new Promise(r=>setTimeout(r,ms));
 check('Old stacked unique materials migrate to one',monsterCamps.stock.forestHeart===1&&monsterCamps.stock.nakat===1,{heart:monsterCamps.stock.forestHeart,nakat:monsterCamps.stock.nakat});
 check('Duplicate unique pickups are rejected',!monsterCamps.add('forestHeart',9999)&&!monsterCamps.add('nakat',9999));
 const target=technologyBase.bench.pos.clone().add(new THREE.Vector3(0,0,1));playerGroup.position.copy(target);checkInteractables();check('E detects the moved corner workbench',nearbyItem===technologyBase.bench);handleInteraction();
 check('E opens the illustrated workshop',riverBoat.modal.classList.contains('active')&&workshopUI.catalog.length>=5);
 check('Workbench moved close to two walls with a computer',technologyBase.bench.pos.x===technologyBase.center.x-38&&!!technologyBase.group.getObjectByName('CraftingComputerDisplay'));
 check('Bench front is physically accessible',!checkCollision(target.x,target.z,target.y));
 check('Every blueprint has a local item image',workshopUI.catalog.every(r=>r.image&&r.card));
 const recipe=workshopUI.catalog.find(r=>r.id==='forestSword');workshopUI.select(recipe);check('Forest recipe uses one heart and 100 iron',recipe.cost.forestHeart===1&&recipe.cost.iron===100);
 const oldIron=monsterCamps.stock.iron;monsterCamps.stock.iron=99;check('Craft rejects insufficient iron without consuming heart',!weaponSystem.craft()&&monsterCamps.stock.forestHeart===1&&monsterCamps.stock.iron===99);
 monsterCamps.stock.iron=100;recipe.card.querySelector('button').disabled=false;recipe.card.querySelector('button').click();
 check('Click crafts and equips forest sword with exact costs',weaponSystem.owned&&weaponSystem.equipped&&monsterCamps.stock.forestHeart===0&&monsterCamps.stock.iron===0);
 check('Owned weapon cannot be crafted twice',!weaponSystem.craft());
 check('Crafted sword is persisted',JSON.parse(localStorage.getItem('tsuventure_forest_sword_v1')).owned===true);
 for(const r of workshopUI.catalog){workshopUI.select(r);riverBoat.render();technologyCraft.render();check('Selecting '+r.id+' preserves original crafting controls',!!document.getElementById('craft-river-boat')&&r.card.parentElement===workshopUI.detail&&!r.card.hidden);}
 closeModal(riverBoat.modal.id);const a=monsterCamps.actors.find(a=>a.health>0),previousHealth=a.health;gameState.health=50;weaponSystem.beginAttack();const forestDamage=heroOutgoingDamage(100);check('Damage previews do not heal the player',gameState.health===50);a.health=5;monsterCamps.hit(a,100);check('Lifesteal uses actual remaining HP, not overkill',Math.abs(gameState.health-50.5)<.001,gameState.health);
 weaponSystem.beginAttack();combatEffects.playerAttack();check('A missed forest swing does not heal',gameState.health===50.5);
 a.health=1000;a.group.visible=true;gameState.health=gameState.maxHealth-1;weaponSystem.beginAttack();monsterCamps.hit(a,100);check('Lifesteal cannot exceed maximum HP',gameState.health===gameState.maxHealth);
 volcanicValley.grant();volcanicValley.setEquipped(true);check('Equipping lava automatically removes forest sword',!weaponSystem.equipped&&volcanicValley.equipped);weaponSystem.beginAttack();const lavaDamage=heroOutgoingDamage(100);check('Both special swords have equal base damage',forestDamage===lavaDamage,{forestDamage,lavaDamage});
 a.health=1000;monsterCamps.hit(a,100);weaponSystem.beginAttack();check('Second consecutive landed attack adds 10 percent',heroOutgoingDamage(100)===Math.round(lavaDamage*1.1),heroOutgoingDamage(100));monsterCamps.hit(a,100);weaponSystem.beginAttack();check('Third attack starts a new pair',weaponSystem.multiplier===1);
 volcanicValley.setEquipped(true);weaponSystem.beginAttack();a.health=1000;monsterCamps.hit(a,100);weaponSystem.beginAttack();weaponSystem.beginAttack();check('Missed second attack breaks the combo',weaponSystem.multiplier===1);
 volcanicValley.setEquipped(true);weaponSystem.beginAttack();a.health=1000;monsterCamps.hit(a,100);weaponSystem.beginAttack(performance.now()+1800);check('Late attacks do not continue combo',weaponSystem.multiplier===1);
 volcanicValley.setEquipped(false);weaponSystem.equip(false);weaponSystem.beginAttack();check('Normal attack damage remains substantially lower',heroOutgoingDamage(100)===22,heroOutgoingDamage(100));
 for(const m of ['normal','forest','lava']){if(m==='forest')weaponSystem.equip(true);else{weaponSystem.equip(false);volcanicValley.setEquipped(m==='lava');}weaponSystem.beginAttack();combatEffects.playerAttack();check('New bounded slash trail for '+m,weaponSystem.trails.length>0&&weaponSystem.trails.length<=12);}
 for(let i=0;i<10;i++)weaponSystem.update(.1);check('Attack trails clean up after fading',weaponSystem.trails.length===0);
 const select=document.getElementById('setting-language');
 check('Four languages have actual flag images',document.querySelectorAll('.language-picker img').length===4&&select.options.length===4);
 for(const [lang,play,cost]of [['fr','JOUER','Fer'],['es','JUGAR','Hierro'],['vi','CHƠI','Sắt']]){select.value=lang;select.dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();await wait(350);check('Language applies and persists '+lang,document.documentElement.lang===lang&&tsuventureSettings.language===lang&&document.getElementById('btn-play-game').textContent.includes(play)&&JSON.parse(localStorage.getItem('tsuventure_settings')).language===lang);check('Dynamic materials translated '+lang,tsuventureSettings.translate('Sắt: 100 / 100').includes(cost));}
 check('All flag images load locally',Array.from(document.querySelectorAll('.language-picker img')).every(i=>i.complete&&i.naturalWidth>0));
 check('Exclusive ocean cursor is applied to controls',getComputedStyle(document.getElementById('btn-play-game')).cursor.includes('tsu-ocean-cursor.png'));document.body.classList.add('game-mouse-captured');check('Mouse-look mode still hides the custom cursor',getComputedStyle(renderer.domElement).cursor==='none');document.body.classList.remove('game-mouse-captured');
 monsterCamps.add('forestHeart',1);monsterCamps.stock.iron=250;monsterCamps.save();playerGroup.position.copy(target);openModal(riverBoat.modal.id);workshopUI.select(recipe);await wait(350);
 check('Selected recipe image loads',workshopUI.detail.querySelector('img').complete&&workshopUI.detail.querySelector('img').naturalWidth>0);
 const overflow=riverBoat.modal.querySelector('.workshop-panel');check('Crafting panel fits the screen',overflow.getBoundingClientRect().width<=innerWidth&&overflow.scrollWidth<=overflow.clientWidth+1);
 // Readable UI screenshots use the same live DOM shown to the player.
 closeModal(riverBoat.modal.id);a.health=previousHealth;a.group.visible=true;monsterCamps.save();
 if(!window.__deferGiftCode){check('Gift code respects unique material cap',giftCode.redeem('Tsukiezz')&&monsterCamps.stock.forestHeart===1&&monsterCamps.stock.nakat===1);
 check('Stackable gift resources retain their previous 9999 behavior',monsterCamps.stock.iron>=9999&&monsterCamps.stock.uranium>=9999);
 }
 return {checks,views};
})()
