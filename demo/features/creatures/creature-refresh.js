/* Replace remaining legacy bodies while retaining AI roots, colliders and stats. */
function installCreatureRefresh(){
    const actors=[];
    function replace(group,kind,height){
        if(!group||group.userData.blenderCreature)return;const kit=creatureArt.create(kind);if(!kit)return;const box=new THREE.Box3().setFromObject(kit.root),scale=height/box.getSize(new THREE.Vector3()).y;kit.root.scale.setScalar(scale);kit.root.position.y=-box.min.y*scale;
        for(const child of group.children)child.visible=false;group.add(kit.root);kit.root.traverse(o=>o.layers.mask=group.layers.mask);group.userData.blenderCreature=kind;actors.push({group,kit});
    }
    replace(riverRealm.wolf.group,'speed_wolf',2);replace(bachKhuyet.tiger.group,'sabertooth',2.8);
    for(const m of riverRealm.monkeys)replace(m.group,'monkey',1.2);
    for(const a of desertRealm.infestation.actors)replace(a.group,a.kind==='snake'?'cobra':'spider',a.kind==='snake'?1.5:1.15);
    replace(evilCavern.worm.group,'stone_worm',6);for(const w of evilCavern.warriors)replace(w.group,'cursed_warrior',2.3);
    if(lunarUnicorn?.group)replace(lunarUnicorn.group,'unicorn',2.5);
    for(const deer of santaGifts.reindeer)replace(deer,'reindeer',2.2);
    const riverFish=[1,2,3];for(const school of riverRealm.schools){const kind=riverFish[school.fish[0].kind],g=creatureArt.merged('fish_'+kind);g.scale(.4,.4,.4);school.mesh.geometry=g;school.mesh.material=new THREE.MeshStandardMaterial({vertexColors:true,color:0x888888,roughness:.7});school.mesh.frustumCulled=false;}
    const oldPreview=riverRealm.previewAquatic;riverRealm.previewAquatic=kind=>Number.isInteger(kind)?creatureArt.create('fish_'+riverFish[kind]).root:oldPreview(kind);
    const minionPreview=monsterSkills.previewMinion;monsterSkills.previewMinion=()=>creatureArt.create('sapling')?.root||minionPreview();
    let time=0;window.creatureRefresh={actors,replace,update(dt){time+=dt;for(const a of actors){if(!a.group.visible)continue;a.kit.joints.forEach((j,i)=>j.rotation.x=Math.sin(time*4+i*Math.PI)*.17);}}};
}
