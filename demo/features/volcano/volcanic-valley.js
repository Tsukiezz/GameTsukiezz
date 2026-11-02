/* One triangle height field for the volcanic rift's rendering and collision. */
function installVolcanicValley(){
    const group=new THREE.Group();group.name='VolcanicRiftValley';scene.add(group);
    const profile={floor:72,lava:66,bed:60,rim:150};
    const bounds={x0:550,z0:-820,nx:110,nz:145,step:4},lavaY=profile.lava,entry=new THREE.Vector3(825,0,-255),heights=[],v=[],indices=[],uv=[],colors=[];
    const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
    const channel=z=>770+Math.sin((z+540)/65)*17;
    const contains=(x,z)=>x>=550&&x<=990&&z>=-820&&z<=-240;
    function design(x,z){
        const base=window.riverRealm?.ground(x,z)??realmTerrainHeight(x,z),q=Math.hypot((x-770)/175,(z+530)/240),blend=1-smooth(.98,1.18,q);
        const angle=Math.atan2((z+530)/240,(x-770)/175);
        // Eroded caldera: separate summits, radial gullies and stepped basalt strata.
        const crest=.84+.035*Math.sin(angle*5)+.018*Math.sin(angle*11);
        const ridges=Math.exp(-Math.pow((q-crest)/.175,2));
        const gullies=.72+.18*Math.sin(angle*13+q*8)+.10*Math.sin(angle*23-q*5);
        let y=profile.floor+ridges*(105+30*gullies);
        const peaks=[[648,-605,90,43,65],[695,-715,120,50,46],[834,-731,85,42,40],[904,-542,80,34,62],[650,-402,65,40,49]];
        for(const [px,pz,h,rx,rz] of peaks)y+=h*Math.exp(-(((x-px)/rx)**2+((z-pz)/rz)**2)*1.6);
        const cliff=smooth(.62,.76,q)*(1-smooth(.99,1.12,q));
        y+=cliff*(5*Math.sin(y*.19)+3*Math.sin(x*.19+z*.12));
        const bank=Math.abs(x-channel(z)),river=bank<17&&z>-737&&z<-335;
        if(river)y=profile.bed+Math.min(1,bank/17)*2;
        const crater=Math.hypot(x-770,z+695);if(crater<40)y=profile.bed-3;else if(crater<62)y=Math.max(y,profile.floor+7+Math.sin((crater-40)/22*Math.PI)*14);
        // A visible, gently graded approach cuts through the eastern rim.
        const trailX=825+Math.sin((z+255)/90)*8,trailDistance=Math.abs(x-trailX);
        if(z>-558&&z<-245&&trailDistance<12){const level=profile.floor*smooth(0,1,(-z-255)/280);y=THREE.MathUtils.lerp(y,level,1-smooth(6,12,trailDistance));}
        if(Math.hypot(x-770,z+540)<12)y=profile.floor;
        if(Math.abs(z+540)<3.2&&x>=770&&x<=830)y=profile.floor;
        return THREE.MathUtils.lerp(base,y,blend);
    }
    for(let j=0;j<=bounds.nz;j++)for(let i=0;i<=bounds.nx;i++){
        const x=bounds.x0+i*4,z=bounds.z0+j*4,y=design(x,z);heights.push(y);v.push(x,y,z);uv.push((x+EXPANDED_REALM_DATA.size/2)/EXPANDED_REALM_DATA.size,(EXPANDED_REALM_DATA.size/2-z)/EXPANDED_REALM_DATA.size);
        const q=Math.hypot((x-770)/175,(z+530)/240),char=1-smooth(.8,1.2,q),trailX=825+Math.sin((z+255)/90)*8,trail=z>-558&&z<-245?(1-smooth(5,8,Math.abs(x-trailX)))*char:0;
        const strata=.5+.5*Math.sin(y*.21),ash=smooth(165,300,y),rock=new THREE.Color().setRGB(.21+strata*.065+ash*.12,.14+strata*.045+ash*.10,.115+strata*.035+ash*.085);
        colors.push(THREE.MathUtils.lerp(groundMat.color.r*(1-char)+rock.r*char,.48,trail),THREE.MathUtils.lerp(groundMat.color.g*(1-char)+rock.g*char,.32,trail),THREE.MathUtils.lerp(groundMat.color.b*(1-char)+rock.b*char,.19,trail));
    }

    for(let j=0;j<bounds.nz;j++)for(let i=0;i<bounds.nx;i++){const a=j*(bounds.nx+1)+i;indices.push(a,a+bounds.nx+1,a+1,a+1,a+bounds.nx+1,a+bounds.nx+2);}
    function ground(x,z){
        if(contains(x,z)&&window.worldSurface?.modifiedAt(x,z))return worldSurface.height(x,z);if(!contains(x,z))return null;const u=Math.min(bounds.nx-1e-7,(x-550)/4),w=Math.min(bounds.nz-1e-7,(z+820)/4),i=Math.floor(u),j=Math.floor(w),fx=u-i,fz=w-j,a=j*(bounds.nx+1)+i,A=heights[a],B=heights[a+1],C=heights[a+bounds.nx+1],D=heights[a+bounds.nx+2];return fx+fz<=1?A+(B-A)*fx+(C-A)*fz:D+(C-D)*(1-fx)+(B-D)*(1-fz);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
    const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:moonTexture,vertexColors:true,roughness:.96}));terrain.name='VolcanicSharedTerrain';terrain.receiveShadow=true;group.add(terrain);
    const base=groundGeo.attributes.position;for(let i=0;i<base.count;i++){const x=base.getX(i),z=-base.getY(i),h=ground(x,z);if(h!==null)base.setZ(i,Math.min(base.getZ(i),h)-3);}base.needsUpdate=true;groundGeo.computeVertexNormals();
    const lavaGeo=new THREE.BufferGeometry(),lv=[],li=[];
    for(let z=-735;z<=-335;z+=2){const x=channel(z),a=lv.length/3;lv.push(x-16,lavaY,z,x+16,lavaY,z);if(z>-735)li.push(a-2,a,a-1,a-1,a,a+1);}lavaGeo.setAttribute('position',new THREE.Float32BufferAttribute(lv,3));lavaGeo.setIndex(li);lavaGeo.computeVertexNormals();
    const uniforms={time:{value:0}},lavaMat=new THREE.ShaderMaterial({uniforms,side:THREE.DoubleSide,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform float time;void main(){float wave=sin(p.x*.22+sin(p.z*.14+time*.2)*2.)+sin(p.z*.31-time*.25)+.35*sin(p.x*.71+p.z*.47);float vein=1.-smoothstep(.18,.55,abs(wave));vec3 c=mix(vec3(.16,.025,.007),vec3(1.,.31,.018),vein);gl_FragColor=vec4(c,1.);}'});
    const lava=new THREE.Mesh(lavaGeo,lavaMat);lava.name='FatalMoltenRiver';group.add(lava);const craterLava=new THREE.Mesh(new THREE.CircleGeometry(39,48),lavaMat);craterLava.rotation.x=-Math.PI/2;craterLava.position.set(770,lavaY,-695);group.add(craterLava);
    const mats={};for(const [name,rgb] of Object.entries(VOLCANIC_ASSETS.materials))mats[name]=new THREE.MeshStandardMaterial({color:new THREE.Color(...rgb),roughness:.65,metalness:name==='metal'?.65:.12,side:name==='wing'?THREE.DoubleSide:THREE.FrontSide,...(['eye','lava'].includes(name)?{emissive:new THREE.Color(...rgb),emissiveIntensity:1.1}:{})});
    for(let z=-280;z>=-520;z-=20)for(const side of [-1,1]){const x=825+Math.sin((z+255)/90)*8+side*5.1,y=ground(x,z),post=new THREE.Mesh(new THREE.ConeGeometry(.3,1.8,6),mats.armor),cap=new THREE.Mesh(new THREE.OctahedronGeometry(.16),mats.lava);post.position.set(x,y+.9,z);cap.position.set(x,y+1.85,z);group.add(post,cap);addCylinderCollider(x,z,.27,y,y+1.8,false);colliders.at(-1).name='volcanic-trail-marker';}
    const bankRocks=[],rockMatrix=new THREE.Object3D();
    for(let z=-720;z<-340;z+=9)for(const side of [-1,1]){const x=channel(z)+side*(23+Math.sin(z*1.3)*4),h=ground(x,z);if(Math.abs(z+540)<16||Math.hypot(x-770,z+695)<65||Math.abs(x-(825+Math.sin((z+255)/90)*8))<14||h<lavaY)continue;bankRocks.push({x,z,y:h,size:1+Math.abs(Math.sin(z*.7))*2});}
    const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),mats.armor,bankRocks.length);rocks.name='VolcanicBasaltBoulders';rocks.frustumCulled=false;rocks.castShadow=true;rocks.receiveShadow=true;
    bankRocks.forEach((p,i)=>{rockMatrix.position.set(p.x,p.y+p.size*.55,p.z);rockMatrix.rotation.set(.2,p.z,0);rockMatrix.scale.set(p.size,p.size*.75,p.size*.8);rockMatrix.updateMatrix();rocks.setMatrixAt(i,rockMatrix.matrix);addCylinderCollider(p.x,p.z,p.size*.7,p.y,p.y+p.size*1.25,false);colliders.at(-1).name='volcanic-basalt';});group.add(rocks);
    for(const z of [-480,-695]){const glow=new THREE.PointLight(0xff5a16,2,95,2);glow.position.set(channel(z),lavaY+12,z);glow.visible=currentProfileKey!=='low';group.add(glow);registerDynamicLight(glow,150);}
    function model(kind){const root=new THREE.Group(),joints={},bins=new Map(),pivots={head:[0,5.9,-4.3],tail:[0,3,3.5],'wing-1':[-1.5,5,-1],wing1:[1.5,5,-1]};for(const p of VOLCANIC_ASSETS.models[kind]){if(!mats[p.material])throw new Error('Unknown volcanic material: '+p.material);const key=p.joint+':'+p.material;if(!bins.has(key))bins.set(key,{joint:p.joint,material:p.material,v:[],i:[]});const b=bins.get(key),off=b.v.length/3,pivot=pivots[p.joint]||[0,0,0];for(const a of p.vertices)b.v.push(...a.map((n,i)=>n-pivot[i]));b.i.push(...p.indices.map(i=>i+off));}for(const b of bins.values()){if(!joints[b.joint]){const joint=new THREE.Group();joint.position.fromArray(pivots[b.joint]||[0,0,0]);joints[b.joint]=joint;root.add(joint);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.v,3));g.setIndex(b.i);g.computeVertexNormals();const m=new THREE.Mesh(g,mats[b.material]);m.castShadow=true;m.receiveShadow=true;joints[b.joint].add(m);}return {group:root,joints};}
    const dragon={...model('dragon'),health:20000,maxHealth:20000,state:'patrol',timer:0,cooldown:2,breathCooldown:7,ballCooldown:4,destination:null,target:null};dragon.group.name='WarDragon';dragon.group.position.set(830,ground(830,-590),-590);group.add(dragon.group);
    addCylinderCollider(dragon.group.position.x,dragon.group.position.z,2.5,dragon.group.position.y,dragon.group.position.y+8,false);const dragonCollider=colliders.at(-1);Object.assign(dragonCollider,{name:'war-dragon',dynamicLakeMonster:true});const dynamicColliders=[dragonCollider];
    const swordModel=model('sword').group;swordModel.name='HiddenLavaSword';swordModel.position.set(770,ground(770,-540)+1,-540);group.add(swordModel);
    const altar=new THREE.Mesh(new THREE.CylinderGeometry(2.8,3.8,1.2,8),mats.armor);altar.position.set(770,ground(770,-540)+.6,-540);group.add(altar);addCylinderCollider(770,-540,2.8,altar.position.y-.6,altar.position.y+.6,true);
    const item={id:'lava_sword',type:'lava_sword',pos:new THREE.Vector3(770,ground(770,-540),-540),radius:4,prompt:'Rút Thanh Gươm Dung Nham'};interactables.push(item);
    let owned=false,equipped=false;try{const s=JSON.parse(localStorage.getItem('tsuventure_lava_sword_v1')||'{}');owned=s.owned===true;equipped=owned&&s.equipped===true;}catch{}
    const heldSword=model('sword').group;heldSword.scale.setScalar(.18);heldSword.name='EquippedLavaSword';scene.add(heldSword);
    const row=document.createElement('article');row.className='backpack-item';row.innerHTML='<div style="font-size:40px">🗡️</div><div><h3>Thanh Gươm Dung Nham</h3><p>600 sát thương lên Rồng Chiến Tranh. Đòn đánh vẫn tiêu hao thể lực.</p><strong></strong></div><button type="button"></button>';document.querySelector('#modal-backpack .backpack-hint').before(row);
    function save(){try{localStorage.setItem('tsuventure_lava_sword_v1',JSON.stringify({owned,equipped}));}catch{}}
    function render(){swordModel.visible=!owned;item.collected=owned;row.querySelector('strong').textContent=!owned?'Ẩn trong thung lũng núi lửa':equipped?'Đang trang bị':'Đã sở hữu';const b=row.querySelector('button');b.textContent=equipped?'Tháo gươm':'Trang bị';b.disabled=!owned||!gameState.isPlaying;b.setAttribute('aria-pressed',String(equipped));}
    row.querySelector('button').onclick=()=>{if(!owned||!gameState.isPlaying)return;equipped=!equipped;save();render();};new MutationObserver(render).observe(document.getElementById('modal-backpack'),{attributes:true,attributeFilter:['class']});render();
    const hud=document.createElement('div');hud.className='volcano-status';hud.hidden=true;gameHud.append(hud);const style=document.createElement('style');style.textContent='.volcano-status{position:absolute;left:50%;top:92px;transform:translateX(-50%);max-width:calc(100% - 32px);padding:10px 18px;background:#26100de8;border:1px solid #ce713a;border-radius:12px;color:#ffe4bc;text-align:center;font-size:13px;pointer-events:none}.volcano-status[hidden]{display:none}@media(max-width:650px){.volcano-status{top:150px;width:85%;font-size:11px}}';document.head.append(style);
    const marker=new THREE.Mesh(new THREE.RingGeometry(5.8,6.2,40),new THREE.MeshBasicMaterial({color:0xff6622,side:THREE.DoubleSide,transparent:true,opacity:.7}));marker.rotation.x=-Math.PI/2;marker.visible=false;group.add(marker);
    const projectiles=[],vents=[new THREE.Vector3(801,ground(801,-480),-480),new THREE.Vector3(740,ground(740,-610),-610),new THREE.Vector3(835,ground(835,-650),-650)];
    const ventMeshes=vents.map(p=>{const m=new THREE.Mesh(new THREE.ConeGeometry(2.5,1.5,10,1,true),mats.armor);m.position.copy(p).y+=.75;group.add(m);return m;});
    const eruption={state:'quiet',timer:0,check:0,chance:.18,interval:12,vent:0,warning:3,duration:5};let time=0,burn=0,burnTick=0,immunity=0,pending=null,deaths=0;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active')&&!window.moonRailway?.aboard;
    function inLava(p){return contains(p.x,p.z)&&p.y<lavaY+.35&&((p.z>-737&&p.z<-335&&Math.abs(p.x-channel(p.z))<15.5)||Math.hypot(p.x-770,p.z+695)<39);}
    function respawn(reason){if(window.playerLife){playerLife.die(reason);return;}deaths++;gameState.health=0;pause();Object.assign(gameState,{health:gameState.maxHealth,armor:gameState.maxArmor,stamina:100,oxygen:100});window.crystalWings?.stopFlight();fastTravelTo(entry.x,entry.z,'Lối vào Thung Lũng Dung Nham',ground(entry.x,entry.z));immunity=3;updatePlayerVitals();showNotification(reason);}
    function hurt(amount,burning=false){if(!active()||immunity>0)return false;window.playerLife?.noteDamage(burning?'lava':'volcano_monster');const damage=heroIncomingDamage(amount),armor=Math.min(gameState.armor,damage);gameState.armor-=armor;gameState.health=Math.max(0,gameState.health-(damage-armor));immunity=.4;if(burning){burn=6;burnTick=0;}updatePlayerVitals();if(gameState.health<=0)respawn('Bạn đã gục ngã trong thung lũng núi lửa.');return true;}
    function startBreath(){if(!active()||dragon.health<=0||dragon.state!=='patrol'||dragon.breathCooldown>0)return false;dragon.state='breath-warning';dragon.timer=0;dragon.target=playerGroup.position.clone();dragon.breathCooldown=13;return true;}
    function startBalls(){if(!active()||dragon.health<=0||dragon.state!=='patrol'||dragon.ballCooldown>0)return false;dragon.state='ball-warning';dragon.timer=0;dragon.target=playerGroup.position.clone();dragon.ballCooldown=9;return true;}
    function mouth(){dragon.group.updateMatrixWorld(true);return dragon.group.localToWorld(new THREE.Vector3(0,6.2,-9));}
    function fireball(target,origin=mouth(),volcanic=false){const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(volcanic?1.2:1,1),new THREE.MeshBasicMaterial({color:0xff7c13}));mesh.position.copy(origin);group.add(mesh);const direction=target.clone().add(new THREE.Vector3(0,.4,0)).sub(origin).normalize();projectiles.push({mesh,velocity:direction.multiplyScalar(volcanic?17:24),age:0,volcanic});}
    function startEruption(){if(eruption.state!=='quiet')return false;eruption.state='warning';eruption.timer=0;eruption.vent=Math.floor(Math.random()*vents.length);return true;}
    function hit(amount){if(!active()||dragon.health<=0||!Number.isFinite(amount)||amount<=0)return false;dragon.health=Math.max(0,dragon.health-heroOutgoingDamage(amount));window.fieldGuide?.record('war_dragon',dragon.health===0);if(!dragon.health){dragon.state='dead';dragon.group.rotation.z=Math.PI*.42;marker.visible=false;showNotification('Rồng Chiến Tranh đã bị đánh bại.');}return true;}
    function beginPlayerAttack(hero){if(active())pending={time:.18,hero};}
    function pause(){breath.visible=false;for(const vent of ventMeshes)vent.material=mats.armor;burn=0;burnTick=0;pending=null;for(const p of projectiles)group.remove(p.mesh);projectiles.length=0;marker.visible=false;hud.hidden=true;if(dragon.health>0){dragon.state='patrol';dragon.timer=0;}eruption.state='quiet';eruption.timer=0;eruption.check=0;}
    function update(dt){dt=THREE.MathUtils.clamp(dt,0,.1);time+=dt;uniforms.time.value=time;heldSword.visible=gameState.isPlaying&&equipped;
        if(heldSword.visible){const grip=window.heroMotion?.hand('right',new THREE.Vector3(.15,0,.4));if(grip){heldSword.position.copy(grip.position);heldSword.quaternion.copy(grip.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)));}}
        if(!active()){hud.hidden=true;return;}immunity=Math.max(0,immunity-dt);const p=playerGroup.position;
        if(inLava(p)){respawn('Dung nham đã thiêu rụi bạn. Hồi sinh tại lối vào thung lũng.');return;}
        const near=contains(p.x,p.z)&&Math.abs(p.y-ground(p.x,p.z))<80;
        if(!near){if(burn||projectiles.length||dragon.state!=='patrol')pause();hud.hidden=true;return;}
        if(burn>0){burn=Math.max(0,burn-dt);burnTick+=dt;while(burnTick>=1){burnTick--;window.playerLife?.noteDamage('lava');gameState.health=Math.max(0,gameState.health-5);updatePlayerVitals();if(gameState.health<=0){respawn('Bạn đã gục ngã vì bỏng dung nham.');return;}}}
        if(pending){pending.time-=dt;if(pending.time<=0){const range=pending.hero==='rabbit'?25:8;if(p.distanceTo(dragon.group.position)<range)hit(equipped?600:pending.hero==='rabbit'?110:145);pending=null;}}
        dragon.timer+=dt;dragon.cooldown=Math.max(0,dragon.cooldown-dt);dragon.breathCooldown=Math.max(0,dragon.breathCooldown-dt);dragon.ballCooldown=Math.max(0,dragon.ballCooldown-dt);
        const distance=p.distanceTo(dragon.group.position),dpos=dragon.group.position;
        if(dragon.health>0){if(distance<110)window.fieldGuide?.record('war_dragon');dragon.joints.head.rotation.x=Math.sin(time*1.7)*.06;dragon.joints.tail.rotation.y=Math.sin(time)*.13;if(!dragon.flight)for(const side of [-1,1])dragon.joints['wing'+side].rotation.z=side*(.08+Math.sin(time*1.8)*.12);
            if(dragon.state==='patrol'){
                if(distance<48&&dragon.breathCooldown===0)startBreath();else if(distance<80&&dragon.ballCooldown===0)startBalls();else if(distance<7&&dragon.cooldown===0){dragon.state='claw';dragon.timer=0;dragon.target=p.clone();}
                else if(!dragon.flight||dragon.flight.state==='grounded'){if(!dragon.destination||dpos.distanceTo(dragon.destination)<3){const z=-600+Math.random()*130,x=815+Math.random()*30;dragon.destination=new THREE.Vector3(x,ground(x,z),z);}const delta=dragon.destination.clone().sub(dpos),len=delta.length();if(len>.1){const next=dpos.clone().addScaledVector(delta,Math.min(1,dt*3/len));if(ground(next.x,next.z)>lavaY+1){dpos.copy(next);dpos.y=ground(next.x,next.z);dragon.group.rotation.y=Math.atan2(-delta.x,-delta.z);}}}
            }else if(dragon.state.endsWith('warning')){
                const aim=dragon.target.clone().sub(dpos);dragon.group.rotation.y=Math.atan2(-aim.x,-aim.z);marker.visible=true;marker.position.copy(dragon.target);marker.position.y=ground(marker.position.x,marker.position.z)+.08;
                if(dragon.timer>1.8){marker.visible=false;dragon.timer=0;if(dragon.state==='breath-warning')dragon.state='breath';else{for(const offset of [-3,0,3])fireball(dragon.target.clone().add(new THREE.Vector3(offset,0,0)));dragon.state='recover';}}
            }else if(dragon.state==='breath'){
                const origin=mouth(),dir=dragon.target.clone().add(new THREE.Vector3(0,.35,0)).sub(origin).normalize(),to=p.clone().add(new THREE.Vector3(0,.35,0)).sub(origin),length=to.length();if(length<40&&to.normalize().dot(dir)>.89)hurt(15,true);if(dragon.timer>3){dragon.state='recover';dragon.timer=0;}
            }else if(dragon.state==='claw'&&dragon.timer>.7){if(distance<8&&p.distanceTo(dragon.target)<3)hurt(24);dragon.cooldown=2;dragon.state='recover';dragon.timer=0;}
            else if(dragon.state==='recover'&&dragon.timer>1){dragon.state='patrol';dragon.timer=0;}
        }
        // Lava breath is a tapered, animated plume, aligned to the locked aim.
        breath.visible=dragon.state==='breath'&&dragon.health>0;breath.position.copy(mouth());if(breath.visible){const dir=dragon.target.clone().sub(breath.position).normalize();breath.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().negate());breath.position.addScaledVector(dir,20);breath.scale.set(1+Math.sin(time*24)*.08,1,1);}
        for(let i=projectiles.length-1;i>=0;i--){const a=projectiles[i];a.age+=dt;const before=a.mesh.position.clone();a.mesh.position.addScaledVector(a.velocity,dt);a.mesh.rotation.x+=dt*3;const line=new THREE.Line3(before,a.mesh.position),nearest=line.closestPointToPoint(p.clone().add(new THREE.Vector3(0,.35,0)),true,new THREE.Vector3());let done=false;if(nearest.distanceTo(p.clone().add(new THREE.Vector3(0,.35,0)))<1.6){hurt(a.volcanic?28:42,true);done=true;}const floor=ground(a.mesh.position.x,a.mesh.position.z);if(a.age>5||floor!==null&&a.mesh.position.y<floor+.2)done=true;if(done){group.remove(a.mesh);a.mesh.geometry.dispose();a.mesh.material.dispose();projectiles.splice(i,1);}}
        eruption.check+=dt;if(eruption.state==='quiet'&&eruption.check>=eruption.interval){eruption.check=0;if(Math.random()<eruption.chance)startEruption();}if(eruption.state!=='quiet'){eruption.timer+=dt;const vent=vents[eruption.vent];marker.visible=eruption.state==='warning';if(marker.visible)marker.position.copy(vent).y+=.08;if(eruption.state==='warning'&&eruption.timer>=3){eruption.state='erupting';eruption.timer=0;}else if(eruption.state==='erupting'){ventMeshes[eruption.vent].material=mats.lava;if(Math.hypot(p.x-vent.x,p.z-vent.z)<9&&Math.abs(p.y-vent.y)<7)hurt(26,true);if(Math.floor(eruption.timer*4)!==Math.floor((eruption.timer-dt)*4)){const angle=Math.random()*Math.PI*2,r=8+Math.random()*20,target=vent.clone().add(new THREE.Vector3(Math.cos(angle)*r,0,Math.sin(angle)*r));target.y=ground(target.x,target.z);fireball(target,vent.clone().add(new THREE.Vector3(0,18,0)),true);}if(eruption.timer>5){eruption.state='quiet';eruption.timer=0;ventMeshes[eruption.vent].material=mats.armor;}}}
        hud.hidden=false;hud.textContent='🐉 Rồng Chiến Tranh '+Math.ceil(dragon.health)+' / 20.000 HP'+(dragon.state==='breath-warning'?' · Sắp phun dung nham! Né sang bên!':dragon.state==='ball-warning'?' · Sắp ném cầu lửa!':eruption.state==='warning'?' · Mặt đất rung — tránh vòng phun trào!':eruption.state==='erupting'?' · NÚI LỬA ĐANG PHUN TRÀO!':'')+(burn>0?' · Bỏng: '+burn.toFixed(1)+' giây':'');
    }
    const breath=new THREE.Mesh(new THREE.ConeGeometry(6,40,12,1,true),new THREE.MeshBasicMaterial({color:0xff650c,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));breath.visible=false;group.add(breath);
    const jet=new THREE.Mesh(new THREE.ConeGeometry(4,24,10,1,true),new THREE.MeshBasicMaterial({color:0xff7b12,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));jet.visible=false;group.add(jet);
    const oldUpdate=update;
    function updateWorld(dt){oldUpdate(dt);const p=dragon.group.position;Object.assign(dragonCollider,{x:p.x,z:p.z,minY:p.y,maxY:p.y+8,disabled:dragon.health<=0});jet.visible=active()&&eruption.state==='erupting';if(jet.visible){jet.position.copy(vents[eruption.vent]).y+=12;jet.scale.setScalar(.9+Math.sin(time*18)*.1);}if(!active())breath.visible=false;}
    function interact(target){if(target!==item)return false;if(!active()||owned||pDistance(item.pos)>item.radius)return true;owned=true;equipped=false;save();render();sfx.pickup();showNotification('Đã rút Thanh Gươm Dung Nham! Mở I để trang bị.');return true;}
    const pDistance=p=>p.distanceTo(playerGroup.position);
    function travel(){fastTravelTo(entry.x,entry.z,'Thung Lũng Núi Lửa — Lối mòn tro đen',ground(entry.x,entry.z));camYaw=0;camPitch=.3;camDistance=7;}
    function canTraverse(from,x,z,flying){if(flying||!contains(x,z))return true;const h=ground(x,z),before=ground(from.x,from.z);if(before===null||h<=before||from.y>Math.max(h,before)+2)return true;return Math.hypot((ground(x+.25,z)??h)-(ground(x-.25,z)??h),(ground(x,z+.25)??h)-(ground(x,z-.25)??h))/.5<.75;}
    entry.y=ground(entry.x,entry.z);landmarksData.push({id:'volcanic_valley',name:'Thung Lũng Núi Lửa',icon:'🌋',x:770,z:-530,color:'#ff7429'});
    const button=document.createElement('button');button.className='tour-btn';button.textContent='🌋 Thung Lũng Núi Lửa';button.onclick=()=>{gameHUD.closePanels();travel();};document.querySelector('#hud-travel .hud-destinations').append(button);
    window.volcanicValley={grant(){owned=true;save();render();},group,terrain,profile,bounds,heights,ground,contains,channel,lava,lavaY,entry,dragon,dragonCollider,dynamicColliders,swordModel,heldSword,item,row,hud,eruption,vents,projectiles,model,update:updateWorld,travel,interact,hit,startBreath,startBalls,startEruption,fireball,hurt,inLava,canTraverse,pause,beginPlayerAttack,get burn(){return burn;},get deaths(){return deaths;},get owned(){return owned;},get equipped(){return equipped;}};
}
