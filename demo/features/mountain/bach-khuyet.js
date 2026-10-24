/* Exact Blender triangles serve rendering, trail walking and the roaming sabertooth. */
function installBachKhuyet(){
    const data=BACH_KHUYET_DATA,t=data.terrain,n=t.n,group=new THREE.Group();group.name='BachKhuyetMountain';scene.add(group);
    function contains(x,z){return x>=t.x0&&z>=t.z0&&x<=t.x0+n*t.step&&z<=t.z0+n*t.step;}
    function ground(x,z){
        if(!contains(x,z))return null;const u=Math.min(n-1e-7,(x-t.x0)/t.step),v=Math.min(n-1e-7,(z-t.z0)/t.step),i=Math.floor(u),j=Math.floor(v),fx=u-i,fz=v-j,a=t.heights[j*(n+1)+i],b=t.heights[j*(n+1)+i+1],c=t.heights[(j+1)*(n+1)+i],d=t.heights[(j+1)*(n+1)+i+1];
        return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);
    }
    const vertices=[],indices=[],uvs=[];for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){vertices.push(t.x0+i*t.step,t.heights[j*(n+1)+i],t.z0+j*t.step);uvs.push(i/n,j/n);}
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(t.colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const context=canvas.getContext('2d'),pixels=context.createImageData(256,256);let seed=210624;
    for(let i=0;i<256*256;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=i%256,y=Math.floor(i/256),grain=99+(seed>>>25)+Math.sin(x*.14+Math.sin(y*.06)*3)*12+Math.sin(y*.4+x*.1)*5;pixels.data.set([grain,grain,grain,255],i*4);}context.putImageData(pixels,0,0);
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(100,100);
    const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:texture,vertexColors:true,roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));terrain.name='BachKhuyet_SharedTerrain';terrain.receiveShadow=true;group.add(terrain);
    // The old lunar skin must not protrude through carved trail sections.
    const basePositions=groundGeo.attributes.position;
    for(let i=0;i<basePositions.count;i++){const x=basePositions.getX(i),z=-basePositions.getY(i);if(!contains(x,z))continue;const edge=Math.min(x-t.x0,z-t.z0,t.x0+n*t.step-x,t.z0+n*t.step-z),blend=Math.min(1,edge/12);basePositions.setZ(i,Math.min(basePositions.getZ(i),ground(x,z))-blend*2);}
    basePositions.needsUpdate=true;groundGeo.computeVertexNormals();
    const materials={};for(const [key,rgb] of Object.entries(data.materials))materials[key]=new THREE.MeshStandardMaterial({color:new THREE.Color(...rgb),roughness:.86,...(['eye','crystal'].includes(key)?{emissive:new THREE.Color(...rgb),emissiveIntensity:.6}:{})});
    const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),rockColliders=[];
    for(const [kind,proto] of Object.entries(data.prototypes)){
        if(kind==='crystal'||kind==='gold')continue;
        const ps=data.placements.filter(p=>p.kind===kind),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(proto.vertices.flat(),3));g.setIndex(proto.indices);g.computeVertexNormals();const batch=new THREE.InstancedMesh(g,materials[kind],ps.length);batch.name='BachKhuyet_'+kind;
        ps.forEach((p,i)=>{matrix.compose(new THREE.Vector3(p.x,p.y,p.z),q.setFromAxisAngle(up,p.yaw),new THREE.Vector3(p.scale,p.scale,p.scale));batch.setMatrixAt(i,matrix);if(kind==='rock'){addCylinderCollider(p.x,p.z,p.scale*.9,p.y,p.y+p.scale*1.25,false);const c=colliders.at(-1);c.name='bach-khuyet-rock';rockColliders.push(c);}});group.add(batch);
    }
    // Trail cairns and a visibly different summit monument keep navigation readable.
    const cairnGeo=new THREE.CylinderGeometry(.28,.45,.7,6),postGeo=new THREE.ConeGeometry(.22,1.7,6);
    data.trail.forEach((p,i)=>{if(i%16||i<16)return;const next=data.trail[Math.min(i+1,data.trail.length-1)],dx=next[0]-p[0],dz=next[2]-p[2],len=Math.hypot(dx,dz)||1,x=p[0]+dz/len*6.7,z=p[2]-dx/len*6.7;const m=new THREE.Mesh(cairnGeo,materials.rock);m.position.set(x,ground(x,z)+.35,z);group.add(m);const post=new THREE.Mesh(postGeo,materials.crystal);post.position.set(x,m.position.y+1.1,z);group.add(post);});
    const summit=data.trail.at(-1),shrine=new THREE.Group();shrine.position.fromArray(summit);shrine.name='BachKhuyet_SummitSanctuary';group.add(shrine);
    for(const x of [-4,4]){const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,8,8),materials.rock);pillar.position.set(x,4,-3);shrine.add(pillar);}const lintel=new THREE.Mesh(new THREE.BoxGeometry(10,1.4,1.8),materials.snow);lintel.position.set(0,8,-3);shrine.add(lintel);const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(1.4),materials.crystal);beacon.position.set(0,4,-3);shrine.add(beacon);
    const inventoryKey='tsuventure_mountain_ores_v1';let inventory={gold:0,crystal:0},collected=[];
    try{const saved=JSON.parse(localStorage.getItem(inventoryKey)||'{}');for(const k of ['gold','crystal'])inventory[k]=Number.isSafeInteger(saved[k])?Math.max(0,Math.min(99999,saved[k])):0;collected=Array.isArray(saved.collected)?saved.collected.filter(x=>typeof x==='string'):[];}catch{}
    const oreModels=new Map();
    for(const ore of data.ores){
        const proto=data.prototypes[ore.kind],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(proto.vertices.flat(),3));g.setIndex(proto.indices);g.computeVertexNormals();const model=new THREE.Mesh(g,materials[ore.kind]);model.position.set(ore.x,ore.y,ore.z);model.visible=!collected.includes(ore.id);group.add(model);oreModels.set(ore.id,model);
        interactables.push({id:ore.id,type:'mountain_ore',kind:ore.kind,pos:new THREE.Vector3(ore.x,ore.y,ore.z),radius:2.8,prompt:ore.kind==='gold'?'Khai thác quặng vàng nguyệt':'Thu thập tinh thể không gian',collected:!model.visible});
    }
    const oreRow=document.createElement('article');oreRow.className='backpack-item';oreRow.id='mountain-minerals';document.querySelector('#modal-backpack .backpack-hint').before(oreRow);
    const renderOres=()=>{oreRow.textContent='Khoáng sản Bạch Khuyết · Vàng nguyệt: '+inventory.gold+' · Tinh thể không gian: '+inventory.crystal;};renderOres();
    function interact(item){if(item?.type!=='mountain_ore')return false;if(!gameState.isPlaying||item.collected||item.pos.distanceTo(playerGroup.position)>3.8)return true;item.collected=true;collected.push(item.id);inventory[item.kind]++;oreModels.get(item.id).visible=false;try{localStorage.setItem(inventoryKey,JSON.stringify({...inventory,collected}));}catch{}renderOres();showNotification('Đã thu thập khoáng sản. Nhấn I xem balo.');return true;}
    const tigerGroup=new THREE.Group();tigerGroup.name='SpaceSabertooth';group.add(tigerGroup);const joints={};
    for(const [key,pivot] of Object.entries(data.tiger.joints)){const j=new THREE.Group();j.position.fromArray(pivot);joints[key]=j;tigerGroup.add(j);}
    const bins=new Map();for(const part of data.tiger.pieces){const key=part.joint+':'+part.material;if(!bins.has(key))bins.set(key,{joint:part.joint,material:part.material,vertices:[],indices:[]});const b=bins.get(key),offset=b.vertices.length/3,pivot=data.tiger.joints[part.joint];for(const v of part.vertices)b.vertices.push(...v.map((x,i)=>x-pivot[i]));b.indices.push(...part.indices.map(i=>i+offset));}
    for(const b of bins.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.vertices,3));g.setIndex(b.indices);g.computeVertexNormals();joints[b.joint].add(new THREE.Mesh(g,materials[b.material]));}
    const routes=[data.trail[130],data.trail[240],data.trail[355],data.trail[465],data.trail[560]],tiger={group:tigerGroup,joints,health:3600,maxHealth:3600,state:'hidden',cooldown:2,specialCooldown:7,timer:0,route:Math.floor(Math.random()*routes.length),destination:null,attackTarget:null};
    tigerGroup.position.fromArray(routes[tiger.route]);tiger.destination=new THREE.Vector3(...routes[(tiger.route+1)%routes.length]);
    const marker=new THREE.Mesh(new THREE.RingGeometry(2.5,2.7,40),new THREE.MeshBasicMaterial({color:0xff527e,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
    addCylinderCollider(tigerGroup.position.x,tigerGroup.position.z,.85,tigerGroup.position.y,tigerGroup.position.y+2.9,false);const tigerCollider=colliders.at(-1);Object.assign(tigerCollider,{name:'space-sabertooth',dynamicLakeMonster:true});
    const panel=document.createElement('section');panel.id='mountain-boss-hud';panel.hidden=true;panel.innerHTML='<strong>Hổ Răng Kiếm Không Gian</strong><div class="lake-boss-bar" role="progressbar" aria-label="Máu hổ răng kiếm" aria-valuemin="0" aria-valuemax="3600"><div></div></div><small></small>';gameHud.append(panel);
    let pending=null,time=0;
    function sync(){const p=tigerGroup.position;tigerCollider.x=p.x;tigerCollider.z=p.z;tigerCollider.minY=p.y;tigerCollider.maxY=p.y+2.9;tigerCollider.disabled=tiger.health<=0;}
    function moveToward(target,speed,dt){const p=tigerGroup.position,dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d<.1)return;const step=Math.min(d,speed*dt);for(const turn of [0,.7,-.7]){const x=p.x+(dx*Math.cos(turn)-dz*Math.sin(turn))/d*step,z=p.z+(dx*Math.sin(turn)+dz*Math.cos(turn))/d*step,y=ground(x,z);tigerCollider.disabled=true;const blocked=y===null||checkCollision(x,z,y,.8);tigerCollider.disabled=tiger.health<=0;if(blocked)continue;p.set(x,y,z);tigerGroup.rotation.y=Math.atan2(dx,dz);break;}}
    function hit(amount){if(!gameState.isPlaying||tiger.health<=0||!Number.isFinite(amount)||amount<=0)return false;tiger.health=Math.max(0,tiger.health-amount);if(tiger.health===0){tiger.state='dead';window.fieldGuide?.record('space_sabertooth',true);tiger.timer=0;marker.visible=false;tigerCollider.disabled=true;showNotification('Đã hạ Hổ Răng Kiếm Không Gian!');}return true;}
    function playerAttack(hero){const p=playerGroup.position,range=hero==='rabbit'?22:3.5;if(p.distanceTo(tigerGroup.position)>range||tiger.health<=0)return false;const ray=new THREE.Raycaster(p.clone().add(new THREE.Vector3(0,.45,0)),tigerGroup.position.clone().add(new THREE.Vector3(0,1,0)).sub(p).normalize(),.1,Math.max(0,p.distanceTo(tigerGroup.position)-1));if(ray.intersectObject(terrain,false).length)return false;return hit(hero==='rabbit'?110:145);}
    function pause(){pending=null;marker.visible=false;tiger.timer=0;if(tiger.health>0){tiger.state='hidden';tiger.cooldown=Math.max(2,tiger.cooldown);}}
    function update(dt){
        dt=Math.min(.1,Math.max(0,dt));if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active')){pause();panel.hidden=true;return;}time+=dt;tiger.timer+=dt;tiger.cooldown=Math.max(0,tiger.cooldown-dt);tiger.specialCooldown=Math.max(0,tiger.specialCooldown-dt);
        if(pending){pending.time-=dt;if(pending.time<=0){playerAttack(pending.hero);pending=null;}}
        const p=playerGroup.position,distance=p.distanceTo(tigerGroup.position),near=contains(p.x,p.z)&&distance<40;
        panel.hidden=!near||tiger.health<=0;const bar=panel.querySelector('[role=progressbar]');bar.setAttribute('aria-valuenow',tiger.health);bar.firstChild.style.width=tiger.health/36+'%';panel.querySelector('small').textContent=tiger.state==='bite'?'Cắn xé không gian — né vòng hồng!':tiger.state==='windup'?'Hổ chuẩn bị vồ!':tiger.health+' / 3600 · Đang săn mồi';
        if(tiger.health<=0){tigerGroup.rotation.z=Math.min(1.5,tiger.timer*.8);sync();return;}
        if(!near){tiger.state='hidden';marker.visible=false;if(tigerGroup.position.distanceTo(tiger.destination)<3||tiger.timer>18){tiger.route=(tiger.route+1+Math.floor(Math.random()*3))%routes.length;tiger.destination.fromArray(routes[tiger.route]);tiger.timer=0;}moveToward(tiger.destination,2.1,dt);}
        else if(['hidden','stalk'].includes(tiger.state)){
            tiger.state='stalk';if(distance>3)moveToward(p,3.8,dt);
            else if(tiger.cooldown===0){tiger.state=tiger.specialCooldown===0?'bite':'windup';tiger.timer=0;tiger.attackTarget=p.clone();marker.position.copy(p).y+=.07;marker.visible=true;}
        }else if(tiger.state==='windup'||tiger.state==='bite'){
            const special=tiger.state==='bite',duration=special?1.25:.75;joints.jaw.rotation.x=Math.sin(Math.min(1,tiger.timer/duration)*Math.PI)*.7;
            if(tiger.timer>=duration){if(p.distanceTo(tiger.attackTarget)<2.7&&distance<4.2){if(monsterSkills.landDamage(special?40:18)&&special&&contains(playerGroup.position.x,playerGroup.position.z))monsterSkills.applyBleed();}if(special)tiger.specialCooldown=13;tiger.cooldown=2.1;tiger.state='recover';tiger.timer=0;marker.visible=false;}
        }else if(tiger.state==='recover'&&tiger.timer>1){tiger.state='stalk';joints.jaw.rotation.x=0;}
        const moving=tiger.state==='hidden'||tiger.state==='stalk';for(const [i,key] of ['legFL','legFR','legBL','legBR'].entries())joints[key].rotation.x=moving?Math.sin(time*7+(i===0||i===3?0:Math.PI))*.35:0;joints.tail.rotation.y=Math.sin(time*2)*.22;sync();
    }
    function travel(){const p=data.trail[0];fastTravelTo(p[0],p[2],'Núi Bạch Khuyết — Đường mòn Nguyệt Sơn',ground(p[0],p[2]));camYaw=Math.PI/2;camPitch=.2;camDistance=5;}
    function clipCamera(origin,desired){
        const delta=desired.clone().sub(origin),distance=delta.length(),samples=Math.max(8,Math.ceil(distance/.15));
        for(let i=1;i<=samples;i++){const p=origin.clone().addScaledVector(delta,i/samples),y=ground(p.x,p.z);if(y!==null&&p.y<y+.15)return origin.clone().addScaledVector(delta,Math.max(0,(i-2)/samples));}return desired;
    }
    for(const spot of window.backpack?.spots||[])if(contains(spot.x,spot.z))spot.y=ground(spot.x,spot.z);
    const button=document.createElement('button');button.className='tour-btn';button.id='btn-travel-bach-khuyet';button.textContent='🏔 Núi Bạch Khuyết';button.onclick=()=>{gameHUD.closePanels();travel();};document.querySelector('#hud-travel .hud-destinations').append(button);
    landmarksData.push({id:'bach_khuyet',name:'Núi Bạch Khuyết',icon:'🏔',x:610,z:610,radius:300,color:'#b5dce8'});
    window.bachKhuyet={data,group,terrain,ground,contains,clipCamera,travel,interact,inventory,oreModels,rockColliders,tiger,tigerCollider,marker,panel,update,pause,hit,playerAttack,beginPlayerAttack(hero){pending={hero,time:.18};}};sync();
}
