(() => {
    enterGame();setGraphicsProfile('potato');
    const results=[];const check=(name,ok,detail={})=>results.push({name,ok:!!ok,detail});
    scene.updateMatrixWorld(true);
    const rays=new THREE.Raycaster();
    for(const hidden of CASTLE_EXTENSION.hiddenStairs){
        const plan=CASTLE_EXTENSION.compactStairs.find(p=>p.name===hidden.stair);
        const room=CASTLE_EXTENSION.rooms.find(r=>r.floor===hidden.floor&&r.name===hidden.room);
        const origin=new THREE.Vector3(room.door.x-110,room.floor+.65,room.door.z+120);
        const target=new THREE.Vector3(plan.flights[0].x-110,room.floor+.65,plan.z+120.2);
        const direction=target.clone().sub(origin);
        rays.far=direction.length();rays.set(origin,direction.normalize());
        const hits=rays.intersectObjects(castlePhysics.cameraObstacles,false);
        check(hidden.stair+' hidden from its room doorway',hits.some(h=>Math.abs(h.point.x-(hidden.screen[0]-110))<.2),{room:room.name,hits:hits.map(h=>h.object.name)});
    }
    const parts=CASTLE_EXTENSION.parts;
    check('Ancient library contains at least 120 visible books',parts.filter(p=>p.name==='room-library-book').length>=120);
    check('Armor museum has six complete display suits',parts.filter(p=>p.name==='armor-helmet'&&p.position[1]>9.5&&p.position[1]<12).length>=6);
    check('Royal bedroom retains its complete canopy bed',CASTLE_EXTENSION.furnishings.some(f=>f.kind==='four-poster state bed'&&f.floor===13&&f.x< -5&&f.z< -10));
    check('Gold vault contains stacked ingots',parts.filter(p=>p.name==='room-vault-ingot').length>=50);
    check('Gold keeps its warm color under castle lighting',castlePhysics.group.children.some(m=>m.name==='armory-detail-batch'&&m.material.color.getHex()===0xe8b449&&m.material.toneMapped===false));
    const panes=[];castlePhysics.group.traverse(o=>{if(o.name==='castle-stained-glass')panes.push(o);});
    check('Windows use stable opaque colored glass',panes.length===30&&panes.every(p=>!p.material.transparent&&!p.material.toneMapped&&p.material.color.getHex()===0x426383));
    check('New decor is batched with no per-book draw calls',!castlePhysics.group.children.some(m=>m.name==='room-library-book'||m.name==='room-secret-book'));
    const baffles=parts.filter(p=>p.name==='room-maze-baffle');
    check('Central straight route is blocked on all five floors',[1,6,9.5,13,20].every(f=>baffles.some(p=>Math.abs(p.position[1]-p.size[1]/2-f)<.01&&checkCollision(-110,p.position[2]+120,f))));
    return {results};
})()
