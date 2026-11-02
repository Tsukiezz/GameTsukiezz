// Opposing covered warrior passages, closed by independently operated iron gates.
function buildArenaWarriorTunnels({group,materials,mesh,box,RISE}) {
    const tunnels=[];
    for(const side of [-1,1]) {
        const name=side<0?'H\u1ea7m C\u1ef1 Th\u00fa':'L\u1ed1i Chi\u1ebfn Binh',width=side<0?14:4.6,height=side<0?8.4:3.8;
        box(side*32,.17,0,22,.36,width,'worn');
        for(const z of [-width/2-.3,width/2+.3])box(side*33,height/2,z,20,height,.5,'dark',true);
        box(side*33,height-.1,0,20,.4,width+1.1,'limestone');
        // Repeated stone portal frames make the passage legible from the arena.
        for(const r of [23,28,33,42]) {
            for(const z of [-width/2-.05,width/2+.05])box(side*r,height/2,z,.6,height,.45,'limestone',true);
            box(side*r,height-.35,0,.7,.65,width+.5,'worn');
        }
        // A closed rear wall prevents walking out beneath the raised cavea.
        if(side<0)box(side*82,4.5,0,1,9,30,'dark',true);
        for(const r of [27,36]) {
            box(side*r,1.1,width/2-.25,2.7,.4,.55,'wood',true);
            box(side*r,2.3,width/2-.25,.45,.65,.18,'gold');
        }
        if(side<0){
            box(-68,.17,0,30,.36,30,'worn',false);box(-68,9.5,0,31,.6,31,'limestone',true);
            for(const z of [-15,15]){box(-68,4.5,z,30,9,.8,'dark',true);for(let x=-80;x<-54;x+=3)box(x,4.3,z*.94,.25,8.4,.25,'iron',true);}
            for(const z of [-10,10])box(-53,4.5,z,.8,9,10,'dark',true);
            // Broad approach cut beneath the west seating, one holding room only.
            box(-38,.17,0,31,.36,14,'worn',false);
            for(const z of [-7.4,7.4])box(-38,4.2,z,31,8.4,.7,'dark',true);box(-38,8.6,0,31,.5,15.5,'limestone',true);
        }else{
            box(62,.17,0,40,.36,6,'worn',false);
            for(const z of [-3.5,3.5])box(62,2.4,z,40,4.8,.6,'limestone',true);box(62,5,0,40,.4,7.6,'limestone',true);
            for(const z of [-2.7,2.7])box(70,1,z,3,.6,.7,'wood',true);
        }
        const gate=new THREE.Group();gate.name='ArenaWarriorGate-'+name;group.add(gate);
        function iron(y,z,h,d) {
            const m=new THREE.Mesh(new THREE.BoxGeometry(.18,h,d),materials.iron);
            m.position.set(side*23,y,z);gate.add(m);
        }
        for(let i=0,n=Math.ceil(width/.35);i<=n;i++)iron(height/2,-width/2+i*width/n,height-.5,.12);
        for(const y of [.5,height/2,height-.6])iron(y,0,.18,width);
        addBoxCollider(115+side*23,110,.25,width+.1,.35,height-.2);
        const collider=colliders.at(-1);collider.name='arena-warrior-gate';
        const item={id:'arena-warrior-gate-'+side,type:'arena_warrior_gate',
            pos:new THREE.Vector3(115+side*22.7,.35,110),radius:2.5,
            prompt:'E: Mở / đóng cổng sắt hầm '+name};
        if(side>0){gate.visible=false;collider.disabled=true;}else item.prompt='E · Mở / đóng cổng hầm Cự Thú';
        interactables.unshift(item);
        tunnels.push({side,name,role:side<0?'beast':'warrior',gate,collider,item,open:side>0});
    }
    return tunnels;
}
