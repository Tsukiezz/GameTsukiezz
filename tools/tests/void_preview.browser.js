(()=>{
 const checks=[],check=(name,ok)=>checks.push({name,ok:!!ok}),views={},v=voidDistrict,a=antarcticRealm.arena,f=antarcticRealm.factory;
 check('Royal frost mosaic installed',antarcticRealm.group.getObjectByName('QueenRoyalFrostMosaic'));
 check('Eight furnished towers',v.towers.length===8);
 gameState.isPlaying=true;gameState.inDialogue=true;document.getElementById('home-screen').style.display='none';document.querySelectorAll('.modal-overlay.active').forEach(m=>closeModal(m.id));gameHUD.closePanels();playerLife.dismissDeath();itemReceipts.element.hidden=true;graphicsQuality.apply('balanced');
 function shot(name,p,target,position=target){playerGroup.position.copy(position);v.update(0);camera.position.copy(p);camera.lookAt(target);scene.fog.density=.0004;graphicsQuality.update(1);realmScenery.update();renderer.render(scene,camera);views[name]=renderer.domElement.toDataURL('image/png');}
 shot('queen-royal-arena',new THREE.Vector3(a.x+90,a.y+55,a.z+105),new THREE.Vector3(a.x,a.y+1,a.z));
 shot('factory-production',new THREE.Vector3(f.x+9,f.y+6,f.z-22),new THREE.Vector3(f.x-16,f.y+2,f.z+8));
 shot('factory-gate',new THREE.Vector3(f.x+42,f.y+9,f.z-106),new THREE.Vector3(f.x,f.y+6,f.z-54));
 shot('eight-towers',v.world(235,155,210),v.world(0,45,0),v.world(0,0,0));
 const t=v.towers[0];shot('furnished-room',v.world(t.x-1,2.3,t.z+4.4),v.world(t.x,1.5,t.z+10),v.world(t.x,0,t.z+7));
 gameState.inDialogue=false;technologyCraft.grant();technologyCraft.equip('diving',false);playerExperience.sync();playerGroup.position.copy(v.world(0,0,0));playerGroup.visible=true;
 shot('rage-armor-worn',playerGroup.position.clone().add(new THREE.Vector3(1.6,1.1,1.6)),playerGroup.position.clone().add(new THREE.Vector3(0,.8,0)),playerGroup.position.clone());
 itemReceipts.element.hidden=true;itemReceipts.element.style.visibility='hidden';openModal('modal-backpack');inventoryWorkspace.select(technologyCraft.rows.rage);inventoryWorkspace.render();check('Inventory has five real columns',getComputedStyle(inventoryWorkspace.slots).gridTemplateColumns.split(' ').length===5);check('Blender rage armor attached',!!playerExperience.overlay.model?.getObjectByName('BlenderRageArmor'));
 return {checks,views};
})()
