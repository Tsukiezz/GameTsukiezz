// References and adaptation notes: docs/ROMAN_ARENA.md.
function buildRomanArenaDetails({group,materials,mesh,box,sector}) {
    const atlas=document.createElement('canvas');atlas.width=atlas.height=2048;
    const ctx=atlas.getContext('2d');const texture=new THREE.CanvasTexture(atlas);
    materials.inscription=new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide});
    let count=0;
    function label(text,x,y,z,w,h,rotation=0){
        const index=count++,col=index%8,row=Math.floor(index/8),px=col*256,py=row*256;
        ctx.fillStyle='#342d27';ctx.fillRect(px,py,256,256);ctx.strokeStyle='#b7a374';ctx.lineWidth=8;
        ctx.strokeRect(px+8,py+8,240,240);ctx.fillStyle='#dbc9a1';ctx.textAlign='center';ctx.textBaseline='middle';
        const lines=text.split('|');ctx.font='bold '+(lines.length>1?25:38)+'px serif';
        lines.forEach((line,i)=>ctx.fillText(line,px+128,py+128+(i-(lines.length-1)/2)*43,230));
        const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
        for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/8,1-(row+1-uv.getY(i))/8);
        mesh(g,'inscription',x,y,z,rotation);texture.needsUpdate=true;
    }
    // Numbered entrances and Doric-inspired capitals link the facade visually.
    const numerals=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
    for(let i=0;i<36;i++){
        const a=i*Math.PI*2/36,edge=a-Math.PI/36,x=Math.cos(edge)*35*1.15,z=Math.sin(edge)*35*.9;
        if(Math.abs(a-Math.PI/2)<.11||Math.abs(a-Math.PI*.75)<.11)continue;
        box(x,4.45,z,1.65,.22,1.7,'worn');
        const drum=mesh(new THREE.CylinderGeometry(.8,.65,.25,10),'limestone',x,4.23,z);
        if(i%3===0)label(numerals[i/3],Math.cos(a)*36*1.15,6.2,Math.sin(a)*36*.9,1.1,.65,Math.PI/2-a);
        // Surviving mast sockets and torn velarium fragments above spectators.
        if(i%3===0 && ![3,18].includes(i)){
            box(x,12.2,z,.16,3,.16,'wood');
            box(x,10.2,z,.7,1.8,.04,'red');
        }
    }
    // Two service trapdoors remain closed, with wood and iron detailing.
    for(const [x,z] of [[-9,7],[9,-7]]){
        box(x,.37,z,2.4,.04,3,'dark');
        for(let i=0;i<7;i++)box(x-.98+i*.325,.405,z,.29,.035,2.8,'wood');
        for(const dz of [-.9,.9])box(x,.43,z+dz,2.1,.025,.08,'worn');
        for(const dx of [-.7,.7])box(x+dx,.46,z,.08,.04,.3,'gold');
    }
    // Drainage channels frame the arena without opening holes in the floor.
    for(let i=0;i<40;i++){
        const a=i*Math.PI*2/40;
        if(Math.abs(Math.sin(a))>.99||Math.cos(a)<-.99||Math.cos(a)>.99)continue;
        const x=Math.cos(a)*22.4*1.15,z=Math.sin(a)*22.4*.9;
        box(x,.372,z,.7,.025,.25,'dark',false,Math.PI/2-a);
        for(let j=0;j<4;j++)box(x+(j-1.5)*.13,.39,z,.045,.02,.24,'worn');
    }
    // Stone rail panels above the fighting pit, with simple carved motifs.
    for(let i=0;i<36;i++){
        const a=i*Math.PI*2/36;
        if(Math.abs(Math.sin(a))>.99||Math.cos(a)<-.99||Math.cos(a)>.99)continue;
        box(Math.cos(a)*23.08*1.15,2.95,Math.sin(a)*23.08*.9,.26,.35,.12,'worn',false,Math.PI/2-a);
    }
    // Seating markers and stone bench divisions; the aisles stay empty.
    for(let row=0;row<18;row++)for(let i=0;i<54;i++){
        const a=i*Math.PI*2/54;
        if(Math.abs(Math.sin(a))>.99||Math.cos(a)<-.99)continue;
        const r=26+(row+.55)*7/18,y=2.45+(row+1)*.55;
        box(Math.cos(a)*r*1.15,y+.035,Math.sin(a)*r*.9,.06,.025,.4,'dark',false,Math.PI/2-a);
    }
    for(const angle of [Math.PI/2,Math.PI*.75]){
        for(const side of [-1,1])for(let i=0;i<20;i++){
            const r=21+i*.6,a=angle+side*.083,y=.35+Math.min(80,Math.floor((r-20.5)/12.5*80)+1)*.15;
            box(Math.cos(a)*r*1.15,y+.38,Math.sin(a)*r*.9,.1,.75,.1,'worn');
        }
    }
    label('CAVEA|KHÁN ĐÀI',0,14,32.7,3,1,Math.PI);
    label('PODIUM|KHÁCH DANH DỰ',25.4,4.8,-5,2.8,1,-Math.PI/2);
    // Retaining walls are already supplied by the cavea; no solid box through the east tunnel.
    const vipMeshStart=group.children.length,vipColliderStart=colliders.length;
    const vipBox=(x,y,z,...args)=>box(x+8,y+11.55,z,...args);
    for(const z of [-3.5,3.5])vipBox(24.65,3.05,z,.25,1.2,4,'limestone',true);
    vipBox(28,2.2,0,7,.5,11,'limestone');
    // Roofed VIP loggia, with a clear central aisle and individual seats.
    for(const x of [27,29.4])for(const z of [-5,5]){
        vipBox(x,4.15,z,.18,3.4,.18,'limestone',true);
        vipBox(x,5.84,z,.45,.18,.45,'gold');
    }
    vipBox(28.2,5.95,0,3.7,.18,10.8,'red');
    for(const z of [-3.6,-1.8,1.8,3.6]){
        vipBox(28.3,2.95,z,.85,1,.85,'wood',true);
        vipBox(28.62,3.5,z,.14,.9,.85,'red');
        vipBox(28.71,3.5,z,.08,.95,.95,'gold');
        vipBox(28.64,3.48,z,.16,.7,.7,'red');
        vipBox(28.3,3.01,z,.8,.16,.78,'red');
        for(const dz of [-.48,.48])vipBox(28.3,3.2,z+dz,.9,.12,.1,'gold');
    }
    for(const z of [-5.4])vipBox(28.2,3.1,z,3.8,1.3,.18,'limestone',true);

    vipBox(31.3,3.1,0,.18,1.3,10.9,'limestone',true);
    label('VIP|TRIBUNE',34.8,16.75,0,2.6,1,-Math.PI/2);
    // Rotate the complete royal box to the north end, facing the arena centre.
    for(const m of group.children.slice(vipMeshStart)){
        const x=m.position.x;m.position.x=-m.position.z;m.position.z=x-6;m.position.y-=1.65;m.rotation.y+=Math.PI/2;
    }
    for(const c of colliders.slice(vipColliderStart)){
        if(c.type==='box'){
            const x0=c.minX-115,x1=c.maxX-115,z0=c.minZ-110,z1=c.maxZ-110;
            c.minX=115-z1;c.maxX=115-z0;c.minZ=110+x0-6;c.maxZ=110+x1-6;c.minY-=1.65;c.maxY-=1.65;
        }
    }
    // A visible masonry support merges the box with the north cavea.
    box(0,7.9,30,11,8.6,7,'limestone',true);
    // Ticket counters are a game interpretation, separate from the ancient
    // seating hierarchy. Tickets are free; there is no money/payment flow.
    for(const x of [-7,7]){
        box(x,1.8,-39,3,2.9,.2,'limestone',true);
        for(const dx of [-1.4,1.4])box(x+dx,1.75,-40.2,.16,2.8,2.4,'wood',true);
        box(x,3.25,-40.1,3.3,.18,2.8,x>0?'red':'cloth');
        box(x,1.05,-40.7,2.7,1.4,.7,'wood',true);
        label(x>0?'VÉ VIP|NHẤN E':'CỔNG VÀO|PORTA I',x,2.55,-41,2.5,.7,Math.PI);
    }
    const ticket={id:'arena_vip_ticket',type:'arena_ticket',pos:new THREE.Vector3(122,.35,67.8),radius:2.4,prompt:'E: Nhận vé VIP miễn phí'};
    interactables.unshift(ticket);
    const gateGroup=new THREE.Group();gateGroup.name='ArenaVIPGate';group.add(gateGroup);
    for(let i=0;i<9;i++){
        const m=new THREE.Mesh(new THREE.BoxGeometry(.12,1.7,.06),materials.gold);
        m.position.set(-5.4,13.2,30.5+i*.375);gateGroup.add(m);
    }
    addBoxCollider(109.6,142,.18,3.5,12.35,14.05);const gateCollider=colliders.at(-1);
    gateCollider.name='arena-vip-gate';
    interactables.unshift({id:'arena_vip_gate',type:'arena_vip_gate',pos:new THREE.Vector3(108.5,12.35,142),radius:2,prompt:'E: Xuất trình vé VIP'});
    materials.flame=new THREE.MeshBasicMaterial({color:0xffaa32,toneMapped:false});
    let torches=0,speakers=0,flags=0;
    for(let i=0;i<24;i++) {
        const a=(i+.5)*Math.PI*2/24;
        if(Math.abs(Math.sin(a))>.98 || (Math.cos(a)>.8&&Math.sin(a)>0&&Math.sin(a)<.4))continue;
        const x=Math.cos(a)*24.1*1.15,z=Math.sin(a)*24.1*.9;
        box(x,3.35,z,.12,1.8,.12,'iron');
        mesh(new THREE.CylinderGeometry(.32,.14,.3,8),'iron',x,4.15,z);
        mesh(new THREE.ConeGeometry(.21,.65,7),'flame',x,4.55,z);
        mesh(new THREE.ConeGeometry(.11,.4,6),'gold',x,4.45,z);torches++;
    }
    for(let i=0;i<12;i++) {
        const a=(i+.5)*Math.PI*2/12,x=Math.cos(a)*36.1*1.15,z=Math.sin(a)*36.1*.9;
        box(x,14.6,z,.12,3,.12,'iron');
        // Small pennants above the rim, clear of the spectator promenade.
        box(x+.6,15.4,z,1.1,1.5,.035,i%2?'red':'cloth',false);
        box(x+.6,15.4,z-.025,.12,1.1,.025,'gold',false);flags++;
        if(i%2===0) {
            box(x,13.8,z,.85,1.15,.65,'iron',true);
            for(const dy of [-.3,0,.3])box(x,13.8+dy,z-.34,.65,.045,.035,'dark',false);
            mesh(new THREE.CylinderGeometry(.18,.18,.04,10),'dark',x,13.6,z-.36).rotation.x=Math.PI/2;
            speakers++;
        }
    }
    return {gateGroup,gateCollider,ticket,signCount:count,seats:4,torches,speakers,flags};
}
