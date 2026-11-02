/* Blender-authored tidal forest. Shared triangles drive visible terrain and physics. */
function installMangroveRealm(){
    const data=MANGROVE_ASSETS,b=data.bounds,waterY=data.waterY,group=new THREE.Group();group.name='GiantMangroveRealm';scene.add(group);
    const tr=(vi,en)=>window.tsuventureSettings?.language==='en'?en:vi;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active')&&!window.moonRailway?.aboard;
    const contains=(x,z)=>x>=b.x0&&x<=b.x0+b.nx*b.step&&z>=b.z0&&z<=b.z0+b.nz*b.step;
    const basin=(x,z)=>Math.hypot((x-data.center[0])/data.rx,(z-data.center[1])/data.rz);
    function ground(x,z){
        if(contains(x,z)&&window.worldSurface?.modifiedAt(x,z))return worldSurface.height(x,z);
        if(!contains(x,z))return null;
        const u=Math.min(b.nx-1e-7,(x-b.x0)/b.step),v=Math.min(b.nz-1e-7,(z-b.z0)/b.step),i=Math.floor(u),j=Math.floor(v),fx=u-i,fz=v-j,k=j*(b.nx+1)+i;
        const A=data.heights[k],B=data.heights[k+1],C=data.heights[k+b.nx+1],D=data.heights[k+b.nx+2];
        return fx+fz<=1?A+(B-A)*fx+(C-A)*fz:D+(C-D)*(1-fx)+(B-D)*(1-fz);
    }
    const waterAt=(x,z)=>basin(x,z)<.995&&ground(x,z)<waterY-.15?{y:waterY,kind:'mangrove',bottom:ground(x,z)}:null;
    const mats={};for(const [key,rgb] of Object.entries(data.materials))mats[key]=new THREE.MeshStandardMaterial({color:new THREE.Color(...rgb),roughness:.9,side:THREE.DoubleSide,...(['eye','relic'].includes(key)?{emissive:new THREE.Color(...rgb),emissiveIntensity:.9}:{})});
    function geometry(p,pivot=[0,0,0]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flatMap(v=>v.map((n,i)=>n-pivot[i])),3));g.setIndex(p.indices);g.computeVertexNormals();return g;}
    function model(kind,pivots={}){
        const root=new THREE.Group(),joints={};
        for(const p of data.models[kind]){if(!joints[p.joint]){const j=new THREE.Group();j.position.fromArray(pivots[p.joint]||[0,0,0]);root.add(j);joints[p.joint]=j;}
            const mesh=new THREE.Mesh(geometry(p,pivots[p.joint]),mats[p.material]);mesh.castShadow=true;mesh.receiveShadow=true;joints[p.joint].add(mesh);}
        return {group:root,joints};
    }
    const terrain=model('terrain').group.children[0].children[0];terrain.name='MangroveSharedTerrain';group.add(terrain);
    // Match the surrounding lunar skin at the border instead of a rectangular mud patch.
    const terrainUV=[],terrainColors=[],lunarColor=new THREE.Color(0xa4a6ac),mudColor=new THREE.Color(0x57503a),tp=terrain.geometry.attributes.position;
    for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),q=basin(x,z),blend=THREE.MathUtils.smoothstep(q,.98,1.12),color=mudColor.clone().lerp(lunarColor,blend);terrainUV.push((x+EXPANDED_REALM_DATA.size/2)/EXPANDED_REALM_DATA.size,(EXPANDED_REALM_DATA.size/2-z)/EXPANDED_REALM_DATA.size);terrainColors.push(color.r,color.g,color.b);}
    terrain.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(terrainUV,2));terrain.geometry.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));terrain.material=new THREE.MeshStandardMaterial({map:moonTexture,vertexColors:true,roughness:1,side:THREE.DoubleSide});
    const architecture=model('architecture').group;architecture.name='DrownedMangroveSanctuary';group.add(architecture);
    // Cut both prior surfaces at the same rectangle. No buried lunar triangles across water.
    function excavate(g,lunar=false){
        if(!g)return;const p=g.attributes.position,uv=g.attributes.uv,col=g.attributes.color,idx=g.index,verts=[],uvs=[],colors=[];
        function clip(poly,axis,limit,greater){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length],ia=greater?a[axis]>=limit:a[axis]<=limit,ic=greater?c[axis]>=limit:c[axis]<=limit;if(ia)out.push(a);if(ia!==ic){const q=(limit-a[axis])/(c[axis]-a[axis]);out.push(a.map((n,j)=>n+(c[j]-n)*q));}}return out;}
        function emit(poly){for(let i=1;i<poly.length-1;i++)for(const v of [poly[0],poly[i],poly[i+1]]){verts.push(v[0],lunar?-v[2]:v[1],lunar?v[1]:v[2]);if(uv)uvs.push(v[3],v[4]);if(col)colors.push(v[5],v[6],v[7]);}}
        for(let i=0;i<(idx?.count??p.count);i+=3){let poly=[];for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j;poly.push([p.getX(k),lunar?p.getZ(k):p.getY(k),lunar?-p.getY(k):p.getZ(k),uv?.getX(k)??0,uv?.getY(k)??0,col?.getX(k)??1,col?.getY(k)??1,col?.getZ(k)??1]);}
            for(const [axis,limit,greater] of [[0,b.x0,true],[0,b.x0+b.nx*b.step,false],[2,b.z0,true],[2,b.z0+b.nz*b.step,false]]){emit(clip(poly,axis,limit,!greater));poly=clip(poly,axis,limit,greater);if(!poly.length)break;}}
        const compact=[],compactUV=[],compactColor=[],indices=[],shared=new Map();
        for(let i=0;i<verts.length/3;i++){const key=verts.slice(i*3,i*3+3).map(v=>v.toFixed(5)).join(',');let index=shared.get(key);if(index===undefined){index=compact.length/3;shared.set(key,index);compact.push(...verts.slice(i*3,i*3+3));if(uv)compactUV.push(...uvs.slice(i*2,i*2+2));if(col)compactColor.push(...colors.slice(i*3,i*3+3));}indices.push(index);}
        const replacement=new THREE.BufferGeometry();replacement.setAttribute('position',new THREE.Float32BufferAttribute(compact,3));replacement.setIndex(indices);if(uv)replacement.setAttribute('uv',new THREE.Float32BufferAttribute(compactUV,2));if(col)replacement.setAttribute('color',new THREE.Float32BufferAttribute(compactColor,3));replacement.computeVertexNormals();g.dispose();g.copy(replacement);g.computeBoundingSphere();
    }
    excavate(groundGeo,true);excavate(window.riverRealm?.terrain.geometry);
    // Reuse the Blender crown in instanced batches, instead of thousands of draw calls.
    const dummy=new THREE.Object3D();
    for(const p of data.models.tree){const mesh=new THREE.InstancedMesh(geometry(p),mats[p.material],data.trees.length);mesh.name='GiantMangrove_'+p.material;mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;
        data.trees.forEach((t,i)=>{dummy.position.set(t.x,t.y,t.z);dummy.rotation.y=t.yaw;dummy.scale.setScalar(t.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});group.add(mesh);}
    const obstacles=[],obstacleGrid=new Map();
    function obstacle(a,c,r,minY,maxY){const o={a,c,r,minY,maxY};obstacles.push(o);for(let x=Math.floor((Math.min(a[0],c[0])-r-1)/32);x<=Math.floor((Math.max(a[0],c[0])+r+1)/32);x++)for(let z=Math.floor((Math.min(a[1],c[1])-r-1)/32);z<=Math.floor((Math.max(a[1],c[1])+r+1)/32);z++){const key=x+','+z;if(!obstacleGrid.has(key))obstacleGrid.set(key,[]);obstacleGrid.get(key).push(o);}}
    for(const t of data.trees){obstacle([t.x,t.z],[t.x,t.z],3.5*t.scale,t.y,t.y+60*t.scale);
        const transform=p=>[t.x+(p[0]*Math.cos(t.yaw)+p[2]*Math.sin(t.yaw))*t.scale,t.y+p[1]*t.scale,t.z+(-p[0]*Math.sin(t.yaw)+p[2]*Math.cos(t.yaw))*t.scale];
        for(const path of data.rootPaths)for(let i=0;i<path.length-1;i++){const a=transform(path[i]),c=transform(path[i+1]);obstacle([a[0],a[2]],[c[0],c[2]],(.9-i*.23)*t.scale,Math.min(a[1],c[1])-.6,Math.max(a[1],c[1])+.8);}}
    for(const p of data.pillars)obstacle([p.x,p.z],[p.x,p.z],p.r,p.minY,p.maxY);
    function blocked(x,z,y,r=PLAYER_RADIUS){if(!contains(x,z))return false;for(const o of obstacleGrid.get(Math.floor(x/32)+','+Math.floor(z/32))||[]){if(y>=o.maxY||y+PLAYER_HEIGHT<=o.minY)continue;const dx=o.c[0]-o.a[0],dz=o.c[1]-o.a[1],q=THREE.MathUtils.clamp(((x-o.a[0])*dx+(z-o.a[1])*dz)/(dx*dx+dz*dz||1),0,1);if(Math.hypot(x-o.a[0]-dx*q,z-o.a[1]-dz*q)<o.r+r)return true;}return false;}
    // Ramp joins dry riverbank to the continuous 5.8 m wide deck.
    const rampStart=data.entry[1],rampEnd=2.8,rampZ=-665,rampLength=51;
    function rampY(z){return rampStart+(rampEnd-rampStart)*THREE.MathUtils.clamp((rampZ-z)/rampLength,0,1);}
    const rv=[67.1,rampStart,-665,72.9,rampStart,-665,67.1,rampEnd,-716,72.9,rampEnd,-716],rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));rg.setIndex([0,1,2,1,3,2]);rg.computeVertexNormals();const ramp=new THREE.Mesh(rg,mats.wood);ramp.name='MangroveRiverbankRamp';group.add(ramp);
    function support(x,z,y){let h=-Infinity;if(Math.abs(x-70)<=2.9&&z<=-665&&z>=-716){const next=rampY(z);if(y>=next-MAX_STEP_HEIGHT-.01)h=next;}
        if(Math.abs(x-70)<=3&&z<=-860&&z>=-872){const next=.65+(-860-z)/12*2.15;if(y>=next-MAX_STEP_HEIGHT-.01)h=Math.max(h,next);}
        for(const d of data.decks)if(Math.abs(x-d.x)<=d.w/2&&Math.abs(z-d.z)<=d.d/2&&y>=d.y-MAX_STEP_HEIGHT-.01)h=Math.max(h,d.y);
        // Low central altar is part of the sanctuary floor, not a hidden wall.
        if(Math.abs(x-70)<3&&Math.abs(z+886)<3&&y>=3.4)h=Math.max(h,4.23);return h;}
    function ceiling(x,z,previous,next){if(next<=previous)return next;const h=support(x,z,100);if(Number.isFinite(h)&&previous+PLAYER_HEIGHT<h-.46&&next+PLAYER_HEIGHT>=h-.46)return h-.46-PLAYER_HEIGHT-.01;return next;}
    const waterGeo=new THREE.CircleGeometry(1,96);waterGeo.rotateX(-Math.PI/2);waterGeo.scale(data.rx*.995,1,data.rz*.995);waterGeo.translate(70,waterY,-825);
    const uniforms={time:{value:0},fogDensity:{value:scene.fog.density}},waterMat=new THREE.ShaderMaterial({uniforms,side:THREE.DoubleSide,
        vertexShader:'varying vec3 world;varying float depth;void main(){vec4 p=modelMatrix*vec4(position,1.);world=p.xyz;vec4 eye=viewMatrix*p;depth=length(eye.xyz);gl_Position=projectionMatrix*eye;}',
        fragmentShader:'uniform float time;uniform float fogDensity;varying vec3 world;varying float depth;void main(){float s=sin(world.x*.28+sin(world.z*.18+time*.35)*2.)*.45+sin(world.z*.65-time*.8)*.15;float sediment=sin(world.x*.041+world.z*.063+sin(world.z*.02)*3.);vec3 c=mix(vec3(.18,.20,.075),vec3(.37,.34,.16),.48+s*.16+sediment*.16);float foam=pow(max(0.,sin(world.x*.12+world.z*.31-time*.4)),22.);c+=foam*vec3(.06,.065,.025);float fog=1.-exp(-fogDensity*fogDensity*depth*depth);gl_FragColor=vec4(mix(c,vec3(.025,.04,.08),fog),1.);}' });
    const water=new THREE.Mesh(waterGeo,waterMat);water.name='OpaqueBrackishSaltwater';group.add(water);
    const life=installMangroveLife({data,group,geometry,mats,ground,waterY});
    // Tide marks, floating leaves and emerging pneumatophores provide scale at water level.
    const shoots=[];for(let i=0;i<320;i++){const a=i*2.39996,r=Math.sqrt((i+.5)/320)*.92,x=70+Math.cos(a)*225*r,z=-825+Math.sin(a)*120*r;if(Math.abs(x-70)<7||!waterAt(x,z))continue;shoots.push({x,z,h:.3+(i%5)*.18});}
    const shootsMesh=new THREE.InstancedMesh(new THREE.ConeGeometry(.17,1,5),mats.root,shoots.length);shootsMesh.frustumCulled=false;shoots.forEach((p,i)=>{dummy.position.set(p.x,waterY+p.h/2,p.z);dummy.scale.set(1,p.h,1);dummy.rotation.set(0,i,.08);dummy.updateMatrix();shootsMesh.setMatrixAt(i,dummy.matrix);});group.add(shootsMesh);
    let owned=false,defeated=false;const storageKey='tsuventure_mangrove_v1';try{const s=JSON.parse(localStorage.getItem(storageKey)||'{}');owned=s.ancientFragment===true;defeated=s.crocodileDefeated===true;}catch{}
    const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify({ancientFragment:owned,crocodileDefeated:defeated}));}catch{}};
    const relic=model('relic').group;relic.name='AncientFragment';relic.position.fromArray(data.treasure);group.add(relic);
    const item={id:'mangrove_ancient_fragment',type:'ancient_fragment',pos:new THREE.Vector3(70,3.5,-886),radius:4,prompt:'Nhặt Mảnh Vỡ Cổ Đại',collected:owned};interactables.push(item);
    const chest=new THREE.Mesh(new THREE.BoxGeometry(2.7,1.4,1.8),mats.stone);chest.position.set(70,3.5,-886);group.add(chest);
    const lid=new THREE.Mesh(new THREE.BoxGeometry(2.9,.3,2),mats.gold);lid.position.set(70,4.3,-886);group.add(lid);
    const row=document.createElement('article');row.className='backpack-item';row.id='ancient-fragment-inventory';row.innerHTML='<div aria-hidden="true" style="font-size:38px;color:#80f4cc">◈</div><div><h3></h3><p></p><strong></strong></div>';document.querySelector('.backpack-card').insertBefore(row,document.getElementById('backpack-effect'));
    function render(){row.hidden=!owned;row.querySelector('h3').textContent=tr('Mảnh Vỡ Cổ Đại','Ancient Fragment');row.querySelector('p').textContent=tr('Cổ vật tìm được trong phế tích rừng ngập mặn. Giữ trong kho đồ để dùng trong hành trình sau.','A relic found in the drowned mangrove sanctuary. Stored for a future journey.');row.querySelector('strong').textContent=tr('Số lượng: 1 · Vật phẩm nhiệm vụ','Quantity: 1 · Quest item');item.prompt=tr('Nhặt Mảnh Vỡ Cổ Đại','Collect Ancient Fragment');item.collected=owned;relic.visible=!owned;lid.rotation.z=owned?-.25:0;}
    function interact(target){if(target!==item)return false;if(!active()||owned||playerGroup.position.distanceTo(item.pos)>item.radius)return true;owned=true;save();render();sfx.pickup();showNotification(tr('Đã cất Mảnh Vỡ Cổ Đại vào balo. Cổ vật sẽ được dùng sau.','Ancient Fragment stored in your backpack for later.'));return true;}
    window.addEventListener('tsuventure-settings-saved',render);render();
    const crocodile={...model('crocodile',data.crocodile.pivots),health:defeated?0:10000,maxHealth:10000,state:defeated?'dead':'patrol',timer:0,cooldown:2,target:new THREE.Vector3(),destination:null};crocodile.group.name='SavageSwampCrocodile';crocodile.group.position.fromArray(data.crocodile.spawn);group.add(crocodile.group);
    const hud=document.createElement('section');hud.id='mangrove-boss-hud';hud.hidden=true;hud.innerHTML='<strong></strong><div class="lake-boss-bar" role="progressbar" aria-label="Máu cá sấu đầm lầy" aria-valuemin="0" aria-valuemax="10000"><div></div></div><small></small>';gameHud.append(hud);
    const style=document.createElement('style');style.textContent='#mangrove-boss-hud{position:absolute;top:125px;left:50%;transform:translateX(-50%);width:min(420px,88vw);padding:12px 16px;border:1px solid #9a9b53;border-radius:12px;background:#152217e8;color:#e4edb6;text-align:center;pointer-events:none}#mangrove-boss-hud[hidden]{display:none}#mangrove-boss-hud small{display:block;margin-top:5px;font-size:12px}#mangrove-boss-hud .lake-boss-bar>div{height:100%;background:#b6c96b}';document.head.append(style);
    const marker=new THREE.Mesh(new THREE.RingGeometry(4.3,4.7,48),new THREE.MeshBasicMaterial({color:0xff763b,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;group.add(marker);
    let time=0,pending=null,immunity=0;
    function pause(){pending=null;marker.visible=false;hud.hidden=true;if(crocodile.health>0){crocodile.state='patrol';crocodile.timer=0;crocodile.cooldown=Math.max(2,crocodile.cooldown);}}
    function travel(){window.crystalWings?.stopFlight();fastTravelTo(data.entry[0],data.entry[2],tr('Rừng Ngập Mặn — Phế Tích Triều Mặn','Mangrove — Drowned Sanctuary'),data.entry[1]);camYaw=0;camPitch=.25;camDistance=8;}
    function rescue(){pause();Object.assign(gameState,{health:gameState.maxHealth,armor:gameState.maxArmor,oxygen:100,stamina:100});travel();immunity=3;updatePlayerVitals();showNotification(tr('Đã trở về bờ rừng ngập mặn an toàn.','Returned to the safe mangrove bank.'));}
    function hit(amount){if(!active()||crocodile.health<=0||!Number.isFinite(amount)||amount<=0)return false;crocodile.health=Math.max(0,crocodile.health-heroOutgoingDamage(amount));window.fieldGuide?.record('swamp_crocodile',crocodile.health===0);if(!crocodile.health){crocodile.state='dead';defeated=true;marker.visible=false;save();showNotification(tr('Đã hạ Cá Sấu Đầm Lầy!','Swamp Crocodile defeated!'));}return true;}
    function hurt(amount){if(!active()||immunity>0)return false;window.playerLife?.noteDamage('crocodile');const damage=heroIncomingDamage(amount),armor=Math.min(gameState.armor,damage);gameState.armor-=armor;gameState.health=Math.max(0,gameState.health-damage+armor);immunity=.8;updatePlayerVitals();if(gameState.health<=0)rescue();return true;}
    function bodyDistance(p){const local=crocodile.group.worldToLocal(p.clone()),z=THREE.MathUtils.clamp(local.z,-7,10);return Math.hypot(local.x,local.y-2,local.z-z);}
    function beginPlayerAttack(hero){if(active()&&waterAt(playerGroup.position.x,playerGroup.position.z))pending={hero,time:.18};}
    function startBite(){if(!active()||crocodile.health<=0||!['patrol','pursue'].includes(crocodile.state)||crocodile.cooldown>0)return false;crocodile.state='warning';crocodile.timer=0;crocodile.target.copy(playerGroup.position);marker.position.set(crocodile.target.x,waterY+.08,crocodile.target.z);marker.visible=true;return true;}
    function move(target,speed,dt){const p=crocodile.group.position,delta=target.clone().sub(p);delta.y=0;const distance=delta.length();if(distance<.5)return;delta.normalize();const next=p.clone().addScaledVector(delta,Math.min(distance,speed*dt));if(basin(next.x,next.z)>.72)return;const y=ground(next.x,next.z);if(y===null||y>waterY-3)return;p.x=next.x;p.z=next.z;crocodile.group.rotation.y=Math.atan2(delta.x,delta.z);}
    function update(dt){dt=THREE.MathUtils.clamp(dt,0,.1);time+=dt;uniforms.time.value=time;uniforms.fogDensity.value=scene.fog.density;relic.rotation.y=time*.45;relic.position.y=data.treasure[1]+Math.sin(time*1.4)*.16;
        if(!active()){pause();return;}life.update(dt);immunity=Math.max(0,immunity-dt);const p=playerGroup.position,near=contains(p.x,p.z)&&p.y<70;
        if(!near){pause();return;}hud.hidden=false;hud.querySelector('strong').textContent=tr('Cá Sấu Đầm Lầy · ','Swamp Crocodile · ')+Math.ceil(crocodile.health)+' / 10.000 HP';hud.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(crocodile.health));hud.querySelector('.lake-boss-bar>div').style.width=crocodile.health/100+'%';hud.querySelector('small').textContent=crocodile.state==='warning'?tr('Hàm đang mở — rời vòng cam!','Jaws opening — leave the orange circle!'):tr('Phải bơi tới phế tích · Cá sấu đang ngụp lặn dưới hồ','Swim to the sanctuary · The crocodile dives into the depths');
        if(crocodile.health<=0){crocodile.group.rotation.z=Math.PI*.36;return;}
        const cp=crocodile.group.position,attacking=['warning','lunge'].includes(crocodile.state);
        const swimTarget=attacking?crocodile.target.y-1.5:crocodile.state==='pursue'?p.y-1.5:waterY-3-(1+Math.sin(time*.19))*13;
        const swimY=THREE.MathUtils.clamp(swimTarget,ground(cp.x,cp.z)+3.5,waterY-1.8),beforeY=cp.y;
        cp.y+=THREE.MathUtils.clamp(swimY-cp.y,-dt*4,dt*4);crocodile.group.rotation.x=THREE.MathUtils.clamp(-(cp.y-beforeY)*2,-.22,.22);
        const distance=p.distanceTo(cp);if(distance<95)window.fieldGuide?.record('swamp_crocodile');
        if(pending){pending.time-=dt;if(pending.time<=0){crocodile.group.updateMatrixWorld(true);if(bodyDistance(p)<(pending.hero==='rabbit'?25:8))hit(pending.hero==='rabbit'?110:145);pending=null;}}
        crocodile.timer+=dt;crocodile.cooldown=Math.max(0,crocodile.cooldown-dt);
        const vulnerable=Boolean(waterAt(p.x,p.z))&&p.y<waterY+.4&&p.y>ground(p.x,p.z)-.5;
        if(['patrol','pursue'].includes(crocodile.state)){
            if(vulnerable&&distance<85){crocodile.state='pursue';if(distance<18&&crocodile.cooldown===0)startBite();else move(p,7.5,dt);}
            else{crocodile.state='patrol';if(!crocodile.destination||crocodile.group.position.distanceTo(crocodile.destination)<5){const a=time*.37;crocodile.destination=new THREE.Vector3(70+Math.cos(a)*115,waterY-1.8,-825+Math.sin(a)*65);}move(crocodile.destination,3.4,dt);}
        }else if(crocodile.state==='warning'&&crocodile.timer>=1.15){marker.visible=false;crocodile.state='lunge';crocodile.timer=0;}
        else if(crocodile.state==='lunge'){move(crocodile.target,20,dt);if(vulnerable&&p.distanceTo(crocodile.target)<4.7&&p.distanceTo(crocodile.group.position)<21)hurt(48);if(crocodile.timer>.65){crocodile.state='recover';crocodile.timer=0;crocodile.cooldown=3.5;}}
        else if(crocodile.state==='recover'&&crocodile.timer>1.2){crocodile.state='patrol';crocodile.timer=0;}
        crocodile.joints.jaw.rotation.x=['warning','lunge'].includes(crocodile.state)?.48:.04;crocodile.joints.tail.rotation.y=Math.sin(time*2.5)*.22;crocodile.joints.head.rotation.y=Math.sin(time)*.035;for(const side of [-1,1])for(const leg of ['front','rear'])crocodile.joints[leg+side].rotation.z=Math.sin(time*4+(side<0?Math.PI:0)+(leg==='rear'?Math.PI:0))*.15;
    }
    function drawMinimap(ctx,cx,cy,scale){ctx.save();ctx.fillStyle='#72813d99';ctx.beginPath();ctx.ellipse(cx+70*scale,cy-825*scale,230*scale,125*scale,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8c18d';ctx.fillRect(cx+56*scale,cy-900*scale,28*scale,28*scale);ctx.restore();}
    landmarksData.push({id:'mangrove_realm',name:'Rừng Ngập Mặn',icon:'🌳',x:70,z:-825,color:'#b7c56a'});
    const button=document.createElement('button');button.className='tour-btn';button.id='travel-mangrove';button.textContent='🌳 Rừng Ngập Mặn';button.onclick=()=>{gameHUD.closePanels();travel();};document.querySelector('#hud-travel .hud-destinations').append(button);
    window.mangroveRealm={row,grant(){owned=true;save();render();},data,group,terrain,architecture,water,life,ground,contains,waterAt,basin,blocked,support,ceiling,obstacles,crocodile,marker,hud,relic,item,row,travel,rescue,pause,hit,hurt,bodyDistance,startBite,beginPlayerAttack,update,drawMinimap,interact,get owned(){return owned;},get defeated(){return defeated;}};
}
