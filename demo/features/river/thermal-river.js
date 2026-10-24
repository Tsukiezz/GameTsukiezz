/* Shared Blender river triangles, navigable bridges, thermal ecology and stun predator. */
function installThermalRiver(){
    const data=THERMAL_RIVER_DATA,t=data.terrain,heights=new Map(t.keys.map((k,i)=>[k,t.heights[i]])),cells=new Set(t.cells),grid=new Map(),group=new THREE.Group();group.name='ThermalRiverRealm';scene.add(group);
    const CELL=64;
    data.segments.forEach((s,index)=>{const r=s.w+25;for(let x=Math.floor((Math.min(s.a[0],s.b[0])-r)/CELL);x<=Math.floor((Math.max(s.a[0],s.b[0])+r)/CELL);x++)for(let z=Math.floor((Math.min(s.a[2],s.b[2])-r)/CELL);z<=Math.floor((Math.max(s.a[2],s.b[2])+r)/CELL);z++){const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);}});
    function nearest(x,z){let best=null,score=Infinity;for(const index of grid.get(Math.floor(x/CELL)+','+Math.floor(z/CELL))||[]){const s=data.segments[index],dx=s.b[0]-s.a[0],dz=s.b[2]-s.a[2],q=THREE.MathUtils.clamp(((x-s.a[0])*dx+(z-s.a[2])*dz)/(dx*dx+dz*dz),0,1),distance=Math.hypot(x-s.a[0]-dx*q,z-s.a[2]-dz*q);if(distance-s.w<score){score=distance-s.w;best={distance,y:s.a[1]+(s.b[1]-s.a[1])*q,width:s.w,index,q};}}return best;}
    function ground(x,z){
        const u=(x-t.x0)/t.step,v=(z-t.z0)/t.step;let i=Math.floor(u),j=Math.floor(v);
        if(i<0||j<0||i>t.n||j>t.n)return null;
        if(!cells.has(j*t.n+i)||i===t.n||j===t.n){const candidates=[];if(Math.abs(u-i)<1e-7)candidates.push([i-1,j]);if(Math.abs(v-j)<1e-7)candidates.push([i,j-1]);if(Math.abs(u-i)<1e-7&&Math.abs(v-j)<1e-7)candidates.push([i-1,j-1]);const valid=candidates.find(([a,b])=>a>=0&&b>=0&&a<t.n&&b<t.n&&cells.has(b*t.n+a));if(!valid)return null;[i,j]=valid;}
        const fx=u-i,fz=v-j,a=heights.get(j*(t.n+1)+i),b=heights.get(j*(t.n+1)+i+1),c=heights.get((j+1)*(t.n+1)+i),d=heights.get((j+1)*(t.n+1)+i+1);return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);
    }
    function waterAt(x,z){
        const s=data.spring;if(Math.hypot((x-s.x)/s.rx,(z-s.z)/s.rz)<.97)return {y:s.waterY,kind:'spring',bottom:ground(x,z)};
        const hit=nearest(x,z);if(!hit||hit.distance>hit.width*.94)return null;
        const bottom=ground(x,z);return bottom!==null&&bottom<hit.y-.15?{y:hit.y,kind:'river',bottom}:null;
    }
    function mountainContains(x,z){return x>=-992&&x<=-530&&z>=420&&z<=880&&Math.hypot(x+760,z-650)<245;}
    const trailGrid=new Map();
    for(let i=0;i<data.trail.length-1;i++){const a=data.trail[i],b=data.trail[i+1];for(let gx=Math.floor((Math.min(a[0],b[0])-16)/32);gx<=Math.floor((Math.max(a[0],b[0])+16)/32);gx++)for(let gz=Math.floor((Math.min(a[2],b[2])-16)/32);gz<=Math.floor((Math.max(a[2],b[2])+16)/32);gz++){const key=gx+','+gz;if(!trailGrid.has(key))trailGrid.set(key,[]);trailGrid.get(key).push(i);}}
    function trailAt(x,z){
        let best={distance:Infinity,index:0,y:0};
        for(const i of trailGrid.get(Math.floor(x/32)+','+Math.floor(z/32))||[]){const a=data.trail[i],b=data.trail[i+1],dx=b[0]-a[0],dz=b[2]-a[2],q=THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1),0,1),distance=Math.hypot(x-a[0]-dx*q,z-a[2]-dz*q);if(distance<best.distance)best={distance,index:i,y:a[1]+(b[1]-a[1])*q};}
        return best;
    }
    function canTraverse(from,x,z,flying=false){
        if(flying||!mountainContains(x,z))return true;
        const a=ground(from.x,from.z),b=ground(x,z);if(a===null||b===null||b<=a+.00001||from.y>Math.max(a,b)+2)return true;
        const path=trailAt(x,z);if(path.distance<4.6&&Math.abs(path.y-b)<2)return true;
        if(Math.hypot(x-data.spring.x,z-data.spring.z)<78&&b>224)return true;
        const gradient=Math.hypot((ground(x+.25,z)-ground(x-.25,z))/.5,(ground(x,z+.25)-ground(x,z-.25))/.5);
        return gradient<.55&&(b<12||gradient<.18);
    }
    function localBridge(b,x,z){const dx=x-b.x,dz=z-b.z;return {u:dx*b.nx+dz*b.nz,v:-dx*b.nz+dz*b.nx};}
    function bridgeY(b,u){if(Math.abs(u)<=b.half)return b.top;const q=Math.min(1,(Math.abs(u)-b.half)/b.run);return b.top+(b.anchors[u<0?0:1]-b.top)*q;}
    function support(x,z,y){let floor=-Infinity;for(const b of data.bridges){if(Math.abs(x-b.x)>b.half+b.run+3||Math.abs(z-b.z)>b.half+b.run+3)continue;const {u,v}=localBridge(b,x,z);if(Math.abs(u)<=b.half+b.run&&Math.abs(v)<=b.width/2+.02){const h=bridgeY(b,u);if(y>=h-MAX_STEP_HEIGHT-.005)floor=Math.max(floor,h);}}const c=data.cliff;if(Math.abs(x-c.x)<=c.width/2&&Math.abs(z-c.z)<=c.depth/2&&y>=c.top-MAX_STEP_HEIGHT)floor=Math.max(floor,c.top);if(Math.abs(x+653)<=29.5&&Math.abs(z-600)<=12&&y>=130-MAX_STEP_HEIGHT)floor=Math.max(floor,130);return floor;}
    function blocked(x,z,y,r=PLAYER_RADIUS){for(const b of data.bridges){if(Math.abs(x-b.x)>b.half+3||Math.abs(z-b.z)>b.half+3)continue;const {u,v}=localBridge(b,x,z);if(Math.abs(u)<b.half+r&&Math.abs(Math.abs(v)-1.7)<r+.08&&y+PLAYER_HEIGHT>b.top+.12&&y<b.top+1.05)return true;}return false;}
    function ceiling(x,z,previous,next){if(next<=previous)return next;for(const b of data.bridges){const {u,v}=localBridge(b,x,z);if(Math.abs(u)>b.half+b.run||Math.abs(v)>b.width/2+PLAYER_RADIUS)continue;const underside=bridgeY(b,u)-.24;if(previous+PLAYER_HEIGHT<=underside+.001&&next+PLAYER_HEIGHT>underside)next=Math.min(next,underside-PLAYER_HEIGHT-.002);}return next;}
    const materials={};for(const [key,rgb] of Object.entries(data.materials))materials[key]=new THREE.MeshStandardMaterial({color:new THREE.Color(...rgb),roughness:.86,...(key==='eye'?{emissive:new THREE.Color(...rgb),emissiveIntensity:.8}:{})});
    const positions=[],uvs=[],colors=[],moonColor=new THREE.Color(0xa4a6ac);
    for(let i=0;i<t.keys.length;i++){const k=t.keys[i],x=t.x0+k%(t.n+1)*t.step,z=t.z0+Math.floor(k/(t.n+1))*t.step;positions.push(x,t.heights[i],z);uvs.push((x+EXPANDED_REALM_DATA.size/2)/EXPANDED_REALM_DATA.size,(EXPANDED_REALM_DATA.size/2-z)/EXPANDED_REALM_DATA.size);const hit=nearest(x,z),mountain=Math.hypot(x+760,z-650),bank=hit?THREE.MathUtils.clamp((hit.width+20-hit.distance)/12,0,1):0,massif=mountain<230?THREE.MathUtils.clamp((230-mountain)/15,0,1):0,blend=Math.max(bank,massif);colors.push(moonColor.r*(1-blend)+t.colors[i*3]*blend,moonColor.g*(1-blend)+t.colors[i*3+1]*blend,moonColor.b*(1-blend)+t.colors[i*3+2]*blend);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(t.indices);geo.computeVertexNormals();
    const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:moonTexture,vertexColors:true,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));terrain.name='ThermalRiver_ExactTerrain';terrain.receiveShadow=true;group.add(terrain);
    // Keep lunar ground elsewhere; the thermal mountain has soil and living moss.
    terrain.material.onBeforeCompile=shader=>{
        shader.vertexShader='varying vec3 thermalPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n thermalPosition=position;');
        shader.fragmentShader='varying vec3 thermalPosition;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n float greenRegion=1.-smoothstep(214.,232.,length(thermalPosition.xz-vec2(-760.,650.)));\n float soilGrain=.78+.035*sin(thermalPosition.x*.41+sin(thermalPosition.z*.27))+.025*cos(thermalPosition.z*.19+sin(thermalPosition.x*.12));\n diffuseColor.rgb=mix(diffuseColor.rgb,vec3(soilGrain),greenRegion);');
    };
    // Remove old terrain from beneath the new carved banks and waterfall massif.
    const basePositions=groundGeo.attributes.position;for(let i=0;i<basePositions.count;i++){const x=basePositions.getX(i),z=-basePositions.getY(i),h=ground(x,z);if(h!==null)basePositions.setZ(i,Math.min(basePositions.getZ(i),h)-2);}basePositions.needsUpdate=true;groundGeo.computeVertexNormals();
    const bins=new Map();for(const p of data.parts){if(!bins.has(p.material))bins.set(p.material,{vertices:[],indices:[]});const b=bins.get(p.material),offset=b.vertices.length/3;b.vertices.push(...p.vertices.flat());b.indices.push(...p.indices.map(i=>i+offset));}
    for(const [key,b] of bins){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.vertices,3));g.setIndex(b.indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,materials[key]);mesh.name='ThermalArchitecture_'+key;group.add(mesh);}
    const cliff=data.cliff;addBoxCollider(cliff.x,cliff.z,cliff.width,cliff.depth,cliff.bottom,cliff.top,true);colliders.at(-1).name='thermal-waterfall-cliff';
    addBoxCollider(-653,600,59,24,124,130,true);colliders.at(-1).name='thermal-cascade-ledge';
    const mountainLife=installMoonwellLife({data,group,materials,ground});
    const timeUniform={value:0},fogUniform={value:scene.fog.density};
    const waterMeshes=[];
    for(const surface of data.water){
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(surface.vertices.flat(),3));g.setAttribute('uv',new THREE.Float32BufferAttribute(surface.uvs,2));g.setIndex(surface.indices);g.computeVertexNormals();
        const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:timeUniform,fogDensity:fogUniform,kind:{value:surface.kind==='fall'?2:surface.kind==='spring'?1:0}},
            vertexShader:'varying vec2 p;varying vec3 world;varying float depth;void main(){p=uv;vec4 w=modelMatrix*vec4(position,1.);world=w.xyz;vec4 eye=viewMatrix*w;depth=length(eye.xyz);gl_Position=projectionMatrix*eye;}',
            fragmentShader:`uniform float time;uniform float kind;uniform float fogDensity;varying vec2 p;varying vec3 world;varying float depth;
            void main(){if(kind<.5&&length((world.xz-vec2(-370.,-430.))/vec2(150.,125.))<.985)discard;
            float waves=sin(p.y*4.-time*2.4+sin(p.x*23.+time)*.4);float ripples=sin(p.x*70.+sin(p.y*2.-time)*3.);vec3 color=mix(vec3(.035,.17,.22),vec3(.22,.53,.58),.45+waves*.18+ripples*.07);float alpha=.72;
            if(kind>1.5){float bands=sin(p.x*180.+sin(p.y*3.-time*5.)*3.);color=mix(vec3(.17,.44,.53),vec3(.82,.94,.96),.6+.22*bands+.12*waves);alpha=.9;}
            else if(kind>.5){color=mix(vec3(.025,.24,.28),vec3(.13,.62,.65),.5+waves*.15+ripples*.05);alpha=.82;}
            else{float bank=pow(abs(p.x*2.-1.),12.);color+=bank*vec3(.35,.45,.42)*(.65+waves*.25);}
            if(cameraPosition.y<world.y-.1)alpha=.25;float fog=1.-exp(-fogDensity*fogDensity*depth*depth);color=mix(color,vec3(.025,.04,.08),fog);gl_FragColor=vec4(color,alpha);}`});
        const mesh=new THREE.Mesh(g,mat);mesh.name=surface.name;mesh.renderOrder=2;group.add(mesh);waterMeshes.push(mesh);
    }
    // Soft steam at the summit, waterfall impact and the intermediate ledge.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(215,240,239,.6)');gradient.addColorStop(1,'rgba(215,240,239,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const mistMat=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,opacity:.32,depthWrite:false}),mist=[];
    for(let i=0;i<38;i++){const pool=i<25,a=i*2.4,r=pool?8+i%6*5:Math.random()*17,x=(pool?data.spring.x:-665)+Math.cos(a)*r,z=(pool?data.spring.z:555)+Math.sin(a)*r,y=pool?237:data.nodes.source[1]+1;const sprite=new THREE.Sprite(mistMat);sprite.position.set(x,y,z);sprite.scale.setScalar(pool?8:15);sprite.userData={x,y,z,phase:i};group.add(sprite);mist.push(sprite);}
    const protoGeo={};for(const [name,p] of Object.entries(data.prototypes)){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flat(),3));g.setIndex(p.indices);g.computeVertexNormals();protoGeo[name]=g;}
    materials.kelp.side=THREE.DoubleSide;materials.kelp.onBeforeCompile=shader=>{shader.uniforms.riverTime=timeUniform;shader.vertexShader='uniform float riverTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x+=sin(riverTime*1.7+position.y*2.)*position.y*.09;');};
    const plantBins=new Map(),dummy=new THREE.Object3D();for(const p of data.decor){const key=p.kind+':'+Math.floor(p.x/128)+':'+Math.floor(p.z/128);if(!plantBins.has(key))plantBins.set(key,[]);plantBins.get(key).push(p);}
    for(const ps of plantBins.values()){const kind=ps[0].kind,mesh=new THREE.InstancedMesh(protoGeo[kind].clone(),materials[kind],ps.length),bounds=new THREE.Box3();mesh.name='ThermalAquatic_'+kind;ps.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(p.scale);dummy.rotation.y=i*2.3;dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);bounds.expandByPoint(dummy.position);});bounds.expandByScalar(4);mesh.geometry.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());group.add(mesh);}
    const fishBins=new Map();for(const p of data.fish){const key=p.kind+':'+Math.floor(p.x/128)+':'+Math.floor(p.z/128);if(!fishBins.has(key))fishBins.set(key,[]);fishBins.get(key).push(p);}
    const schools=[];for(const ps of fishBins.values()){const mesh=new THREE.InstancedMesh(protoGeo.fish,materials[['fishGold','fishBlue','fishPink'][ps[0].kind]],ps.length);mesh.name='RiverFishSchool';mesh.geometry=protoGeo.fish.clone();const bounds=new THREE.Box3();ps.forEach(p=>bounds.expandByPoint(new THREE.Vector3(p.x,p.y,p.z)));bounds.expandByScalar(8);mesh.geometry.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());group.add(mesh);schools.push({mesh,fish:ps,center:bounds.getCenter(new THREE.Vector3())});}
    function createAnimal(kind){
        const spec=data.models[kind],root=new THREE.Group(),joints={},bins=new Map();root.name=kind==='monkey'?'RedRumpedMonkey':'SpeedWolf';
        for(const [key,pivot] of Object.entries(spec.joints)){const j=new THREE.Group();j.position.fromArray(pivot);root.add(j);joints[key]=j;}
        for(const p of spec.pieces){const key=p.joint+':'+p.material;if(!bins.has(key))bins.set(key,{joint:p.joint,material:p.material,vertices:[],indices:[]});const b=bins.get(key),offset=b.vertices.length/3,pivot=spec.joints[p.joint];for(const v of p.vertices)b.vertices.push(...v.map((x,i)=>x-pivot[i]));b.indices.push(...p.indices.map(i=>i+offset));}
        for(const b of bins.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.vertices,3));g.setIndex(b.indices);g.computeVertexNormals();joints[b.joint].add(new THREE.Mesh(g,materials[b.material]));}
        return {group:root,joints};
    }
    const monkeys=data.monkeys.map(home=>{const actor=createAnimal('monkey');actor.group.position.set(home.x,home.y,home.z);group.add(actor.group);return {...actor,home,angle:home.phase,phase:home.phase};});
    const patrol=data.wolfPatrol||data.trail;
    const wolf={...createAnimal('wolf'),route:0,health:2400,maxHealth:2400,state:'patrol',timer:0,cooldown:2,specialCooldown:4,phase:0,home:new THREE.Vector3(...data.wolfSpawn),target:new THREE.Vector3(...data.wolfSpawn)};wolf.group.position.copy(wolf.home);group.add(wolf.group);
    addCylinderCollider(wolf.home.x,wolf.home.z,.6,wolf.home.y,wolf.home.y+2,false);wolf.collider=colliders.at(-1);Object.assign(wolf.collider,{name:'thermal-speed-wolf',dynamicLakeMonster:true});
    const marker=new THREE.Mesh(new THREE.RingGeometry(2,2.2,40),new THREE.MeshBasicMaterial({color:0xffb355,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;group.add(marker);
    const panel=document.createElement('section');panel.id='river-wolf-hud';panel.hidden=true;panel.innerHTML='<strong>Sói Tốc Độ · Nanh Choáng</strong><div class="lake-boss-bar" role="progressbar" aria-label="Máu sói tốc độ" aria-valuemin="0" aria-valuemax="2400"><div></div></div><small></small>';gameHud.append(panel);
    const stunStatus=document.createElement('div');stunStatus.id='river-stun-status';stunStatus.setAttribute('role','status');stunStatus.hidden=true;gameHud.append(stunStatus);
    const stars=new THREE.Group();for(let i=0;i<5;i++){const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.07),new THREE.MeshBasicMaterial({color:0xffdd72}));mesh.position.set(Math.cos(i*Math.PI*.4)*.38,0,Math.sin(i*Math.PI*.4)*.38);stars.add(mesh);}stars.visible=false;scene.add(stars);
    let stun=0,immunity=0,pending=null,time=0;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    function dry(x,z){const y=ground(x,z);return y!==null&&mountainContains(x,z)&&(!waterAt(x,z)||y>=waterAt(x,z).y-.35);}
    function nearestPatrol(){let index=0,best=Infinity;patrol.forEach((p,i)=>{const d=wolf.group.position.distanceTo(new THREE.Vector3(...p));if(d<best){best=d;index=i;}});return index;}
    wolf.route=nearestPatrol();
    function syncWolf(){const p=wolf.group.position;Object.assign(wolf.collider,{x:p.x,z:p.z,minY:p.y,maxY:p.y+2,disabled:wolf.health<=0});}
    function moveWolf(target,speed,dt){
        const p=wolf.group.position,dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d<.05)return false;
        const distance=Math.min(d,speed*dt),slices=Math.max(1,Math.ceil(distance/.12));let moved=false;
        for(let i=0;i<slices;i++){
            let advanced=false;
            for(const angle of [0,.55,-.55,1,-1]){
                const step=distance/slices,x=p.x+(dx*Math.cos(angle)-dz*Math.sin(angle))/d*step,z=p.z+(dx*Math.sin(angle)+dz*Math.cos(angle))/d*step,y=ground(x,z);
                wolf.collider.disabled=true;
                const valid=dry(x,z)&&Math.abs(y-p.y)<=step*1.5+.035&&canTraverse(p,x,z)&&!checkCollision(x,z,y,.6);
                wolf.collider.disabled=wolf.health<=0;
                if(valid){const heading=Math.atan2(x-p.x,z-p.z);p.set(x,y,z);wolf.group.rotation.y=heading;advanced=moved=true;break;}
            }
            if(!advanced)break;
        }
        return moved;
    }
    function pursue(target,speed,dt){
        const a=trailAt(wolf.group.position.x,wolf.group.position.z),b=trailAt(target.x,target.z);
        if(a.distance<12&&b.distance<14&&Math.abs(a.index-b.index)>5){const index=THREE.MathUtils.clamp(a.index+Math.sign(b.index-a.index)*3,0,data.trail.length-1);return moveWolf(new THREE.Vector3(...data.trail[index]),speed,dt);}
        return moveWolf(target,speed,dt);
    }
    function seesPlayer(){const origin=wolf.group.position.clone().add(new THREE.Vector3(0,1.4,0)),end=playerGroup.position.clone().add(new THREE.Vector3(0,.45,0)),delta=end.sub(origin),length=delta.length();return !new THREE.Raycaster(origin,delta.normalize(),.1,Math.max(.1,length-.25)).intersectObject(terrain,false).length;}
    function pause(){stun=0;pending=null;marker.visible=false;stars.visible=false;stunStatus.hidden=true;if(wolf.health>0){wolf.state='patrol';wolf.timer=0;wolf.cooldown=Math.max(2,wolf.cooldown);wolf.route=nearestPatrol();wolf.target.fromArray(patrol[wolf.route]);}}
    function hitWolf(amount){if(!active()||wolf.health<=0||!Number.isFinite(amount)||amount<=0)return false;wolf.health=Math.max(0,wolf.health-amount);if(wolf.health===0){wolf.state='dead';window.fieldGuide?.record('speed_wolf',true);wolf.timer=0;marker.visible=false;syncWolf();showNotification('Đã hạ Sói Tốc Độ!');}return true;}
    function attackWolf(hero){const p=playerGroup.position,range=hero==='rabbit'?22:3.2;if(p.distanceTo(wolf.group.position)>range)return false;wolf.collider.disabled=true;let blocked=false;const end=wolf.group.position.clone(),steps=Math.ceil(p.distanceTo(end)/.5);for(let i=1;i<steps-2;i++){const q=p.clone().lerp(end,i/steps);if(checkCollision(q.x,q.z,q.y+.2,.03)){blocked=true;break;}}wolf.collider.disabled=wolf.health<=0;return !blocked&&hitWolf(hero==='rabbit'?110:145);}
    function hurt(amount,stunning){
        if(!active()||immunity>0)return false;amount=heroIncomingDamage(amount);const armor=Math.min(gameState.armor,amount);gameState.armor-=armor;gameState.health=Math.max(0,gameState.health-amount+armor);immunity=.7;
        if(stunning){stun=1.4;window.crystalWings?.stopFlight();resetGameplayInput();showNotification('Nanh Sói Tốc Độ: choáng 1,4 giây!');}
        if(gameState.health===0){pause();Object.assign(gameState,{health:gameState.maxHealth,armor:gameState.maxArmor,stamina:100,oxygen:100});immunity=3;travel('base');showNotification('Bạn đã gục ngã. Hồi phục tại lối vào thác.');}
        updatePlayerVitals();return true;
    }
    function update(dt){
        dt=Math.min(.1,Math.max(0,dt));fogUniform.value=scene.fog.density;if(!active()){panel.hidden=true;return;}time+=dt;timeUniform.value=time;mountainLife.update(dt);stun=Math.max(0,stun-dt);immunity=Math.max(0,immunity-dt);
        const p=playerGroup.position;stars.visible=stun>0;stars.position.copy(p).y+=.95;stars.rotation.y+=dt*5;stunStatus.hidden=stun===0;stunStatus.textContent='Đang choáng · '+stun.toFixed(1)+' giây';
        if(pending){pending.remaining-=dt;if(pending.remaining<=0){attackWolf(pending.hero);pending=null;}}
        for(const school of schools){const near=Math.hypot(p.x-school.center.x,p.z-school.center.z)<180&&Math.abs(p.y-school.center.y)<80;school.mesh.visible=near;if(!near)continue;school.fish.forEach((f,i)=>{let x=f.x+Math.sin(time*.55+f.phase)*1.8,z=f.z+Math.cos(time*.37+f.phase)*1.4,w=waterAt(x,z);if(!w){x=f.x;z=f.z;w=waterAt(x,z);}const y=w?Math.max(w.bottom+.55,Math.min(w.y-.6,f.y+Math.sin(time+f.phase)*.22)):f.y;dummy.position.set(x,y,z);dummy.rotation.set(0,Math.atan2(Math.cos(time*.55+f.phase),-Math.sin(time*.37+f.phase)),0);const kind=f.kind;dummy.scale.set(kind===2?.85:.7,kind===1?.65:.8,kind===1?1.1:.75);dummy.updateMatrix();school.mesh.setMatrixAt(i,dummy.matrix);});school.mesh.instanceMatrix.needsUpdate=true;}
        let monkeyBudget=10;for(const a of monkeys){const pos=a.group.position;a.group.visible=monkeyBudget>0&&Math.hypot(pos.x-p.x,pos.z-p.z)<100&&Math.abs(pos.y-p.y)<30;if(!a.group.visible)continue;monkeyBudget--;a.phase+=dt*5;a.angle+=Math.sin(time*.7+a.home.phase)*dt*.4;if(Math.hypot(pos.x-a.home.x,pos.z-a.home.z)>5)a.angle=Math.atan2(a.home.x-pos.x,a.home.z-pos.z);const x=pos.x+Math.sin(a.angle)*dt*.8,z=pos.z+Math.cos(a.angle)*dt*.8;if(dry(x,z)&&!checkCollision(x,z,ground(x,z),.2))pos.set(x,ground(x,z),z);else a.angle+=dt*2;a.group.rotation.y=a.angle;a.joints.tail.rotation.y=Math.sin(a.phase*.4)*.25;['legFL','legFR','legBL','legBR'].forEach((key,i)=>a.joints[key].rotation.x=Math.sin(a.phase+i*Math.PI)*.3);}
        mist.forEach((sprite,i)=>{const h=sprite.userData;sprite.position.set(h.x+Math.sin(time*.2+i)*1.5,h.y+((time*.7+i)%7),h.z+Math.cos(time*.2+i));sprite.material.opacity=.26;});
        wolf.timer+=dt;wolf.phase+=dt;wolf.cooldown=Math.max(0,wolf.cooldown-dt);wolf.specialCooldown=Math.max(0,wolf.specialCooldown-dt);const distance=p.distanceTo(wolf.group.position),eligible=distance<50&&mountainContains(p.x,p.z)&&Math.abs(p.y-wolf.group.position.y)<9&&seesPlayer();
        panel.hidden=wolf.health<=0||distance>55;const bar=panel.querySelector('[role=progressbar]');bar.setAttribute('aria-valuenow',wolf.health);bar.firstChild.style.width=wolf.health/24+'%';panel.querySelector('small').textContent=wolf.state==='windup'?'Sói chuẩn bị vồ gây choáng — né vòng vàng!':wolf.state==='bite'?'Sói chuẩn bị cắn!':wolf.health+' / 2400 · '+(wolf.state==='patrol'?'Tuần tra núi Nguyệt Tuyền':'Đang săn đuổi');
        if(wolf.health<=0){wolf.group.rotation.z=Math.min(1.5,wolf.timer*.8);syncWolf();return;}
        if(!eligible){
            if(wolf.state!=='patrol'){wolf.state='patrol';wolf.timer=0;marker.visible=false;wolf.route=nearestPatrol();wolf.target.fromArray(patrol[wolf.route]);}
            if(wolf.timer>18||wolf.group.position.distanceTo(wolf.target)<1.8){wolf.timer=0;wolf.route=(wolf.route+1)%patrol.length;wolf.target.fromArray(patrol[wolf.route]);}
            moveWolf(wolf.target,3.4,dt);
        }
        else if(wolf.state==='patrol'||wolf.state==='pursue'){
            wolf.state='pursue';if(distance<12&&Math.abs(p.y-wolf.group.position.y)<1.8&&wolf.specialCooldown===0){wolf.state='windup';wolf.timer=0;wolf.target.copy(p);marker.position.copy(p).y+=.06;marker.visible=true;}
            else if(distance<2.5&&wolf.cooldown===0){wolf.state='bite';wolf.timer=0;wolf.target.copy(p);marker.position.copy(p).y+=.06;marker.visible=true;}
            else if(distance>2)pursue(p,8.8,dt);
        }else if(wolf.state==='windup'&&wolf.timer>.9){wolf.state='rush';wolf.timer=0;marker.visible=false;wolf.specialCooldown=10;}
        else if(wolf.state==='rush'){moveWolf(wolf.target,16,dt);if(distance<2.35&&Math.abs(p.y-wolf.group.position.y)<1.8){hurt(36,true);wolf.state='recover';wolf.timer=0;wolf.cooldown=2;}else if(wolf.timer>.8){wolf.state='recover';wolf.timer=0;wolf.cooldown=2;}}
        else if(wolf.state==='bite'&&wolf.timer>.65){if(distance<3&&p.distanceTo(wolf.target)<2.1)hurt(16,false);wolf.state='recover';wolf.timer=0;wolf.cooldown=2;marker.visible=false;}
        else if(wolf.state==='recover'&&wolf.timer>1.1){wolf.state='pursue';wolf.timer=0;}
        const moving=['patrol','pursue','rush'].includes(wolf.state);['legFL','legFR','legBL','legBR'].forEach((key,i)=>wolf.joints[key].rotation.x=moving?Math.sin(wolf.phase*(wolf.state==='rush'?15:9)+(i===0||i===3?0:Math.PI))*.5:0);wolf.joints.jaw.rotation.x=['bite','windup','rush'].includes(wolf.state)?.45:0;wolf.joints.tail.rotation.y=Math.sin(wolf.phase*2)*.3;syncWolf();
    }
    function travel(where='base'){
        let point,name;if(where==='spring'){point=data.trail.at(-1);name='Suối Nước Nóng Nguyệt Tuyền';}else if(where==='delta'){const b=data.bridges.find(b=>b.edge==='west');point=[b.x+b.nx*(b.half+b.run),b.anchors[1],b.z+b.nz*(b.half+b.run)];name='Cầu Sông Nguyệt Tuyền';}else{point=data.trail[0];name='Thác Núi Nguyệt Tuyền';}
        fastTravelTo(point[0],point[2],name,point[1]);camDistance=5;camPitch=.24;
        if(where==='spring'){camYaw=-Math.PI/2;playerGroup.rotation.y=Math.PI/2;}
    }
    function rescue(){const p=playerGroup.position;if(Math.hypot(p.x-data.spring.x,p.z-data.spring.z)<100){travel('spring');return;}const b=[...data.bridges].sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];fastTravelTo(b.x+b.nx*(b.half+b.run-.1),b.z+b.nz*(b.half+b.run-.1),'Bờ sông an toàn',bridgeY(b,b.half+b.run-.1));}
    function clipCamera(origin,desired){const delta=desired.clone().sub(origin),samples=Math.max(8,Math.ceil(delta.length()/.2));for(let i=1;i<=samples;i++){const p=origin.clone().addScaledVector(delta,i/samples),g=ground(p.x,p.z);if(g!==null&&p.y<g+.15)return origin.clone().addScaledVector(delta,Math.max(0,(i-2)/samples));}return desired;}
    function drawMinimap(ctx,cx,cy,scale){ctx.save();ctx.fillStyle='#548d9b55';ctx.beginPath();ctx.ellipse(cx-370*scale,cy-430*scale,150*scale,125*scale,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#68c3ceaa';ctx.lineWidth=1;for(const edge of data.edges){ctx.beginPath();edge.points.forEach((p,i)=>{if(i===0)ctx.moveTo(cx+p[0]*scale,cy+p[2]*scale);else ctx.lineTo(cx+p[0]*scale,cy+p[2]*scale);});ctx.stroke();}ctx.fillStyle='#b1e5d5';ctx.beginPath();ctx.arc(cx+data.spring.x*scale,cy+data.spring.z*scale,2.2,0,Math.PI*2);ctx.fill();ctx.restore();}
    for(const [where,text] of [['base','🌊 Thác Núi Nguyệt Tuyền'],['spring','♨ Suối nước nóng'],['delta','🌉 Sông & cầu gỗ']]){const button=document.createElement('button');button.className='tour-btn';button.dataset.riverTravel=where;button.textContent=text;button.onclick=()=>{gameHUD.closePanels();travel(where);};document.querySelector('#hud-travel .hud-destinations').append(button);}
    landmarksData.push({id:'thermal_waterfall',name:'Thác Núi Nguyệt Tuyền',icon:'🌊',x:-760,z:650,color:'#83dbef'},{id:'thermal_spring',name:'Suối Nước Nóng',icon:'♨',x:-765,z:660,color:'#b0dfc7'});
    // Loot placements computed earlier now follow the new carved ground.
    for(let i=backpack.spots.length-1;i>=0;i--){const spot=backpack.spots[i],g=ground(spot.x,spot.z);if(g===null)continue;if(waterAt(spot.x,spot.z))backpack.spots.splice(i,1);else spot.y=g;}
    function previewAquatic(kind){const root=new THREE.Group(),fish=Number.isInteger(kind);const mesh=new THREE.Mesh(protoGeo[fish?'fish':kind],materials[fish?['fishGold','fishBlue','fishPink'][kind]:kind]);if(fish)mesh.scale.set(kind===2?.85:.7,kind===1?.65:.8,kind===1?1.1:.75);root.add(mesh);return root;}
    window.riverRealm={mountainLife,mountainContains,trailAt,canTraverse,previewAquatic,data,group,terrain,nearest,ground,waterAt,support,blocked,ceiling,clipCamera,drawMinimap,waterMeshes,schools,monkeys,wolf,marker,stunStatus,stars,update,travel,rescue,pause,hitWolf,attackWolf,beginPlayerAttack(hero){pending={hero,remaining:.18};},get stunned(){return stun>0;},get stunRemaining(){return stun;}};syncWolf();
}
