// Ruined amphitheatre: continuous foundation, raised cavea and VIP podium.
function buildRuinedRomanArena() {
    const colliderStart=colliders.length,existingInteractions=new Set(interactables),RISE=0;
    const group=new THREE.Group();group.name='AbandonedRomanArena';group.position.set(115,0,110);
    const materials={
        limestone:new THREE.MeshStandardMaterial({color:0xc8baa0,roughness:1,emissive:0x3b3021,emissiveIntensity:.22}),
        worn:new THREE.MeshStandardMaterial({color:0x756e62,roughness:1}),
        sand:new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),
        dark:new THREE.MeshStandardMaterial({color:0x514c45,roughness:1}),
        moss:new THREE.MeshStandardMaterial({color:0x445440,roughness:1}),
        red:new THREE.MeshStandardMaterial({color:0x692937,roughness:1,side:THREE.DoubleSide}),
        iron:new THREE.MeshStandardMaterial({color:0x303840,roughness:.55,metalness:.65}),
        gold:new THREE.MeshBasicMaterial({color:0xb69650,toneMapped:false}),
        wood:new THREE.MeshStandardMaterial({color:0x473829,roughness:1}),
        cloth:new THREE.MeshStandardMaterial({color:0xa39676,roughness:1,side:THREE.DoubleSide})
    };
    const tile=document.createElement('canvas');tile.width=tile.height=128;
    const ctx=tile.getContext('2d');ctx.fillStyle='#c4bba7';ctx.fillRect(0,0,128,128);
    ctx.strokeStyle='#928977';ctx.lineWidth=2;
    for(let y=0;y<=128;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();
        for(let x=-32;x<128;x+=64){ctx.strokeRect(x+(y%64?32:0),y,64,32);}}
    const texture=new THREE.CanvasTexture(tile);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    materials.limestone.map=texture;
    // Warm, weathered sand stays readable under the realm's cyan moonlight.
    const sandTile=document.createElement('canvas');sandTile.width=sandTile.height=256;
    const sandCtx=sandTile.getContext('2d');sandCtx.fillStyle='#a08a65';sandCtx.fillRect(0,0,256,256);
    let seed=73;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<4000;i++){
        sandCtx.fillStyle=i%2?'rgba(62,46,28,.13)':'rgba(226,205,161,.15)';
        sandCtx.fillRect(random()*256,random()*256,1+random()*2,1+random()*2);
    }
    materials.sand.map=new THREE.CanvasTexture(sandTile);
    const meshes=[],obstacles=[];
    function mesh(geometry,mat,x=0,y=0,z=0,rotation=0){
        const m=new THREE.Mesh(geometry,materials[mat]);m.position.set(x,y,z);m.rotation.y=rotation;
        m.receiveShadow=true;group.add(m);meshes.push(m);return m;
    }
    function box(x,y,z,w,h,d,mat='limestone',solid=null,rotation=0){
        const m=mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,rotation);
        if(solid===null)solid=h>.45 && d>.09;
        if(solid){
            if(rotation)colliders.push({type:'orientedBox',x:x+115,z:z+110,width:w,depth:d,angle:rotation,minY:y-h/2,maxY:y+h/2,name:'arena-solid-box'});
            else {addBoxCollider(x+115,z+110,w,d,y-h/2,y+h/2);colliders.at(-1).name='arena-solid-box';}
            obstacles.push(m);
        }
        return m;
    }
    function sector(inner,outer,bottom,top,a,b,mat='worn',carve=true){
        // Seating slabs bridge the two warrior tunnels instead of filling them.
        if(carve && bottom===0 && inner>=23 && inner<33){
            let spans=[[a,b]];
            for(const axis of [0,Math.PI,Math.PI*2]){
                const next=[];
                for(const [lo,hi] of spans){
                    const l=Math.max(lo,axis-.13),r=Math.min(hi,axis+.13);
                    if(l>=r){next.push([lo,hi]);continue;}
                    if(lo<l)next.push([lo,l]);if(r<hi)next.push([r,hi]);
                    if(top>3.5)sector(inner,outer,3.5,top,l,r,mat,false);
                }
                spans=next;
            }
            for(const [lo,hi] of spans)sector(inner,outer,bottom,top,lo,hi,mat,false);
            return;
        }
        const positions=[],indices=[],uv=[];const n=Math.max(1,Math.ceil((b-a)/.045));
        for(let i=0;i<=n;i++){
            const t=a+(b-a)*i/n;
            for(const [r,y] of [[inner,bottom],[outer,bottom],[inner,top],[outer,top]]){
                positions.push(Math.cos(t)*r*1.15,y,Math.sin(t)*r*.9);uv.push(t*6,r*.3+y*.2);
            }
            if(i<n){const k=i*4;
                for(const face of [[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]){
                    indices.push(k+face[0],k+face[1],k+face[2],k+face[0],k+face[2],k+face[3]);}
            }
        }
        for(const k of [0,n*4])indices.push(k,k+1,k+3,k,k+3,k+2);
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
        // Closed shells are opaque from either side, including broken ends.
        materials[mat].side=THREE.DoubleSide;
        return mesh(g,mat);
    }
    const TAU=Math.PI*2,gateHalf=.115,stairsHalf=.075;
    const angleDistance=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    function region(x,z){
        const dx=x-115,dz=z-110,r=Math.hypot(dx/1.15,dz/.9),a=Math.atan2(dz/.9,dx/1.15);
        return {r,a,gate:angleDistance(a,-Math.PI/2)<gateHalf,
            stairs:false,
            vipStairs:angleDistance(a,0)<stairsHalf};
    }
    function localLevel(p){

        if(p.r>37||p.r<20.5)return .35;
        if(p.r>=33)return 12.35;
        if(p.gate)return .35;
        if(p.stairs)return .35+Math.min(80,Math.floor((p.r-20.5)/12.5*80+1e-5)+1)*.15;

        if(p.r<23)return .35;
        if(p.r<26)return 2.45;
        return 2.45+(Math.min(17,Math.floor((p.r-26)/(7/18)+1e-5))+1)*.55;
    }
    function level(p){return RISE+localLevel(p);}
    // The sandy floor is an ellipse, not a stack of solid seating cylinders.
    const sand=mesh(new THREE.CylinderGeometry(37.05,37.05,.35,192), 'sand',0,.175,0);sand.scale.set(1.15,1,.9);
    // Every cut in the seating has a real floor underneath. A lower arena
    // never relies on the distant moon terrain as an accidental landing.
    function spans(skip){
        let ranges=[[-Math.PI/2,Math.PI*1.5]];
        for(const [axis,half] of skip){const next=[];
            for(const [a,b] of ranges){const lo=Math.max(a,axis-half),hi=Math.min(b,axis+half);
                if(lo>=hi){next.push([a,b]);continue;}if(a<lo)next.push([a,lo]);if(hi<b)next.push([hi,b]);}
            ranges=next;
        }return ranges;
    }
    const aisles=[];
    const audienceRanges=spans(aisles);
    for(const [a,b] of audienceRanges)sector(23,26,0,2.45,a,b,'limestone');
    for(let tier=0;tier<18;tier++){
        const a=26+tier*7/18,b=a+7/18,top=2.45+(tier+1)*.55;
        for(const [start,end] of audienceRanges){
            sector(a,b,0,top,start,end,tier%2?'limestone':'worn');
            sector(a,a+.14,top,top+.045,start,end,'limestone');
        }
    }
    // Spectators climb outside the cavea; the sand has no public stairs.
    const accessHeight=(a)=>.35+Math.min(80,Math.floor(Math.min(Math.PI/2,Math.abs(Math.atan2(Math.cos(a),-Math.sin(a))))/(Math.PI/2)*80+1e-5)+1)*.15;
    sector(37.3,46,0,.35,0,TAU,'limestone',false);
    for(const side of [-1,1])for(let i=0;i<80;i++){
        const a=-Math.PI/2+side*i*Math.PI/160,b=-Math.PI/2+side*(i+1)*Math.PI/160;
        const top=.35+(i+1)*.15;
        sector(39,43,0,top,Math.min(a,b),Math.max(a,b),'limestone',false);
        for(const r of [39,43].filter(r=>i>=4&&(r===43||i<75)))sector(r,r+.12,top,top+.85,Math.min(a,b),Math.max(a,b),'iron',false);
    }
    for(const a of [0,Math.PI])sector(33,39,12,12.35,a-.10,a+.10,'limestone',false);
    for(const a of [0,Math.PI])sector(39,43,12,12.35,a===0?a:a-.10,a===0?a+.10:a,'limestone',false);
    // Open a six-metre south entrance through BOTH stair guard rings.
    for(const x of [-4.5,4.5])box(x,1.8,-41.5,.6,3.6,.6,'limestone',true);
    box(0,3.8,-41.5,9.6,.35,.8,'limestone');
    // Close the old straight entrance to the fighting pit; the foyer turns outward.
    box(0,1.8,-21,9,2.9,.5,'limestone',true);
    // Annular outer promenade and a level entrance aligned with the road.
    sector(33,37,12,12.35,0,TAU,'limestone');
    // No decorative bridge across the entrance or public stair aisles.
    // Continuous parapets keep spectators behind the edge even at ruined bays.
    for(const [a,b] of spans([[0,.11],[Math.PI,.11]]))sector(36.5,36.85,12.35,13.4,a,b,'limestone');
    for(const [a,b] of spans([[0,.14],[Math.PI,.14]]))sector(22.85,23.1,.35,3.3,a,b,'limestone');
    for(let i=0;i<72;i++){
        const a=i*TAU/72;
        box(Math.cos(a)*36.68*1.15,13.5,Math.sin(a)*36.68*.9,.25,.18,.25,'worn');
    }
    box(0,.175,-30,6.6,.35,20,'limestone');
    box(0,.175,-40.5,22,.35,9,'worn');
    box(0,.175,-8,3.8,.35,22,'sand');
    function arch(x,z,angle,base,width,height){
        const outer=width/2,inner=outer-.4;
        const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI,false);
        shape.lineTo(-inner,0);shape.absarc(0,0,inner,Math.PI,0,true);shape.closePath();
        const g=new THREE.ExtrudeGeometry(shape,{depth:1.1,bevelEnabled:false,steps:1,curveSegments:10});g.translate(0,0,-.55);
        const rotation=Math.PI/2-angle;
        for(let i=0;i<16;i++){
            const lx=-outer+(i+.5)*width/16;
            const lower=Math.sqrt(Math.max(0,inner*inner-lx*lx));
            const upper=Math.sqrt(Math.max(0,outer*outer-lx*lx));
            colliders.push({type:'orientedBox',x:115+x+lx*Math.cos(rotation),z:110+z-lx*Math.sin(rotation),width:width/16,depth:1.1,angle:rotation,minY:base+height+lower,maxY:base+height+upper,name:'arena-arch'});
        }
        return mesh(g,'limestone',x,base+height,z,rotation);
    }
    // Three coherent arcaded storeys: height belongs to the spectator building.
    for(let row=0;row<3;row++)for(let i=0;i<36;i++){
        const a=i*TAU/36,edge=a-TAU/72;
        const x=Math.cos(edge)*36*1.15,z=Math.sin(edge)*36*.9,base=.35+row*4.7;
        if(x>22&&z>5&&z<10.5)continue;
        if(row===2&&Math.abs(x)<6&&z>25)continue;
        box(x,base+1.7,z,.9,3.4,1.1,'limestone');
        box(x,base+3.32,z,1.35,.22,1.4,'worn');
        arch(Math.cos(a)*36*1.15,Math.sin(a)*36*.9,a,base,5.8,2.1);
    }
    for(const y of [4.95,9.65,14.35]){
        sector(35.7,37.15,y-.18,y+.12,0,TAU,'limestone',false);
        sector(36.75,37.3,y+.12,y+.25,0,TAU,'worn',false);
    }
    const marker=mesh(new THREE.CylinderGeometry(1.35,1.6,.35,16),'worn',0,.525,0);
    addCylinderCollider(115,110,1.6,.35,.7,true);obstacles.push(marker);
    const details=buildRomanArenaDetails({group,materials,mesh,box,sector});
    const tunnels=buildArenaWarriorTunnels({group,materials,mesh,box,sector,RISE});
    // Shift render geometry and physical volumes together; Blender exports these same parts.
    for(const m of meshes)m.position.y+=RISE;
    for(const child of group.children)if(!meshes.includes(child))child.position.y+=RISE;
    for(const c of colliders.slice(colliderStart)){c.minY+=RISE;c.maxY+=RISE;}
    for(const item of interactables.filter(item=>!existingInteractions.has(item)))if(item.pos)item.pos.y+=RISE;
    details.ticket.pos.y=RISE+.35;

    // Combat gates sit on the floor; keep their collider and interaction positions aligned.
    for(const t of tunnels)t.item.pos.y=RISE+.35;

    for(const [name,material] of Object.entries(materials))material.name='arena-'+name;
    // Bake static architecture once per material, rather than one draw per stone.
    const batches=[];
    for(const material of Object.values(materials)){
        const positions=[],uvs=[],indices=[];
        for(const m of meshes.filter(m=>m.material===material&&!m.userData.dynamic)){
            m.updateMatrix();const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,offset=positions.length/3;
            for(let i=0;i<p.count;i++){
                const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrix);
                positions.push(v.x,v.y,v.z);uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);
            }
            for(let i=0;i<(g.index?.count??p.count);i++)indices.push(offset+(g.index?g.index.getX(i):i));
            group.remove(m);g.dispose();
        }
        if(!positions.length)continue;
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
        const batch=new THREE.Mesh(g,material);batch.name='roman-arena-batch';batch.receiveShadow=true;group.add(batch);batches.push(batch);
    }
    scene.add(group);castlePhysics.cameraObstacles.push(...batches);
    let safeAnchor=null,hasTicket=false;
    window.romanArena={group,region,level,details,editParts:meshes,tunnels,
        support(x,z,y){

            const dx=x-115,dz=z-110;

            const pAccess=region(x,z);
            if(pAccess.r>=33&&pAccess.r<=43&&(angleDistance(pAccess.a,0)<.02||angleDistance(pAccess.a,Math.PI)<.02)&&y>=12.05)return 12.35;
            if(pAccess.r>=43&&pAccess.r<=46)return .35;
            if(pAccess.r>=39&&pAccess.r<43&&pAccess.a<=0)return accessHeight(pAccess.a);
            if(pAccess.r>=33&&pAccess.r<=43&&(angleDistance(pAccess.a,0)<.10||angleDistance(pAccess.a,Math.PI)<.10)&&y>=12.05)return 12.35;
            if(dx>=-5.5&&dx<=5.5&&dz>=26.5&&dz<=33.5&&y>=12.05)return 12.35;
            if(Math.abs(dx)>=23&&Math.abs(dx)<=43&&Math.abs(dz)<=2.3&&y<RISE+2)return RISE+.35;
            if((Math.abs(x-115)<=3.3&&z>=70&&z<=90)||(Math.abs(x-115)<=11&&z>=65&&z<=74))return RISE+.35;
            const p=region(x,z);if(p.r>37&&!(p.vipStairs&&p.r<=38.3))return -Infinity;const h=level(p);return h<=y+MAX_STEP_HEIGHT+.001?h:RISE+.35;
        },
        blocked(x,z,y){
            const dx=x-115,dz=z-110;

            const access=region(x,z);
            if(dx>=-5.5&&dx<=5.5&&dz>=26.5&&dz<=33.5&&y>=12.05)return false;
            if(access.r>=33&&access.r<=43&&(angleDistance(access.a,0)<.02||angleDistance(access.a,Math.PI)<.02)&&y>=12.05)return false;
            if(access.r>=39&&access.r<=46&&angleDistance(access.a,-Math.PI/2)<.065)return access.r<43&&accessHeight(access.a)>y+MAX_STEP_HEIGHT+.001;
            if(access.r>=43&&access.r<=46)return false;
            if(access.r>=39&&access.r<43&&access.a<=0){
                if(access.r<39.23||access.r>42.77)return true;
                return accessHeight(access.a)>y+MAX_STEP_HEIGHT+.001;
            }
            if(access.r>=33&&access.r<=43&&(angleDistance(access.a,0)<.10||angleDistance(access.a,Math.PI)<.10)&&y>=12.05)return false;
            if(Math.abs(dx)>=22.5&&Math.abs(dx)<=43&&Math.abs(dz)<=2.1&&y>=.3&&y<1.8)return false;
            y-=RISE;
            const p=region(x,z);
            if(p.r<=37&&y<-.1)return true;
            if(angleDistance(p.a,0)>.11&&angleDistance(p.a,Math.PI)>.11&&p.r>36.27&&p.r<37.2&&y>=11.6&&y<13.5)return true;
            if(p.r>22.65&&p.r<23.3&&!p.stairs&&!p.vipStairs&&!p.gate&&y>=2.1&&y<3.3)return true;
            if(p.gate&&y<5.8)return p.r<23.35;
            return p.r>=20.5&&p.r<=37&&localLevel(p)>y+MAX_STEP_HEIGHT+.001;
        },
        safety(){
            const p=playerGroup.position,r=region(p.x,p.z).r;
            const area=region(p.x,p.z);
            if(isGrounded&&r<33&&!(Math.abs(p.x-115)<=5.5&&p.z-110>=26.5)&&!(p.x-115>=23&&p.x-115<=38.5&&p.z-110>=6&&p.z-110<=9)&&!(Math.abs(p.x-115)>22.5&&Math.abs(p.z-110)<2.1)&&!area.gate&&!area.stairs&&!area.vipStairs&&level(area)>p.y+MAX_STEP_HEIGHT+.001){
                p.set(115+Math.cos(area.a)*19.5*1.15,RISE+.35,110+Math.sin(area.a)*19.5*.9);jumpVelocityY=0;
            }
            if(isGrounded&&r<36.2&&Math.abs(p.y-level(region(p.x,p.z)))<.06&&!checkCollision(p.x,p.z,p.y))safeAnchor=p.clone();
            if((r<42&&p.y<RISE-.1)||(safeAnchor&&r>36&&r<42&&safeAnchor.y>RISE+11.6&&p.y<RISE+10)){
                const target=safeAnchor&&!checkCollision(safeAnchor.x,safeAnchor.z,safeAnchor.y)?safeAnchor:new THREE.Vector3(115,RISE+.35,100);
                p.copy(target);isGrounded=true;jumpVelocityY=0;keys.jump=false;
            }
            if(isGrounded&&r>44)safeAnchor=null;
        },
        resetSafety(){safeAnchor=null;},
        interact(item){
            if(item.type==='arena_warrior_gate'){
                const tunnel=tunnels.find(t=>t.item===item);
                tunnel.open=!tunnel.open;tunnel.collider.disabled=tunnel.open;tunnel.gate.visible=!tunnel.open;
                showNotification(tunnel.open?'\u0110\u00e3 m\u1edf c\u1ed5ng s\u1eaft h\u1ea7m chi\u1ebfn binh.':'\u0110\u00e3 \u0111\u00f3ng c\u1ed5ng s\u1eaft h\u1ea7m chi\u1ebfn binh.');return true;
            }
            if(item.type==='arena_ticket'){
                hasTicket=true;showNotification('🎟️ Đã nhận vé VIP. Đi lên cầu thang phía đông và xuất trình tại cổng vàng.');return true;
            }
            if(item.type==='arena_vip_gate'){
                if(!hasTicket){showNotification('🎟️ Nhận vé VIP miễn phí tại quầy bên phải cổng chính.');return true;}
                details.gateCollider.disabled=true;details.gateGroup.visible=false;
                showNotification('🏛️ Cổng VIP đã mở. Mời vào khu ghế danh dự.');return true;
            }
            return false;
        },
        get hasTicket(){return hasTicket;},floor:RISE+.35,podium:RISE+2.45,upper:RISE+12.35,vipFloor:RISE+12.35,rise:RISE,tiers:18,stairs:80};
    interactables.push({id:'colosseum_duel',pos:new THREE.Vector3(115,RISE+.35,110),radius:3,
        prompt:'Khám phá dấu tích đấu trường cổ',type:'colosseum'});
}
