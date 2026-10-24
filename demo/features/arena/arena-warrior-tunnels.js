// Opposing covered warrior passages, closed by independently operated iron gates.
function buildArenaWarriorTunnels({group,materials,mesh,box,RISE}) {
    const tunnels=[];
    for(const side of [-1,1]) {
        const name=side<0?'Tây':'Đông';
        box(side*32,.17,0,22,.36,4.6,'worn');
        for(const z of [-2.6,2.6])box(side*33,1.9,z,20,3.8,.5,'dark',true);
        box(side*33,3.7,0,20,.4,5.7,'limestone');
        // Repeated stone portal frames make the passage legible from the arena.
        for(const r of [23,28,33,42]) {
            for(const z of [-2.35,2.35])box(side*r,1.9,z,.6,3.8,.45,'limestone',true);
            box(side*r,3.45,0,.7,.65,5.1,'worn');
        }
        // A closed rear wall prevents walking out beneath the raised cavea.
        box(side*43,1.8,0,.5,3.6,5.7,'dark',true);
        for(const r of [27,36]) {
            box(side*r,1.1,2.15,2.7,.4,.55,'wood',true);
            box(side*r,2.3,2.15,.45,.65,.18,'gold');
        }
        const gate=new THREE.Group();gate.name='ArenaWarriorGate-'+name;group.add(gate);
        function iron(y,z,h,d) {
            const m=new THREE.Mesh(new THREE.BoxGeometry(.18,h,d),materials.iron);
            m.position.set(side*23,y,z);gate.add(m);
        }
        for(let i=0;i<13;i++)iron(1.85,-2.1+i*.35,3,.12);
        for(const y of [.5,1.7,3.2])iron(y,0,.18,4.6);
        addBoxCollider(115+side*23,110,.25,4.7,.35,3.5);
        const collider=colliders.at(-1);collider.name='arena-warrior-gate';
        const item={id:'arena-warrior-gate-'+side,type:'arena_warrior_gate',
            pos:new THREE.Vector3(115+side*22.7,.35,110),radius:2.5,
            prompt:'E: Mở / đóng cổng sắt hầm '+name};
        interactables.unshift(item);
        tunnels.push({side,name,gate,collider,item,open:false});
    }
    return tunnels;
}
