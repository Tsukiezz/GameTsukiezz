/* Small, harmless woodland animals. Only nearby habitats own live models. */
function installForestWildlife(){
    const species=['frog','rabbit','pig','horse'],templates={},materials=new Map(),sphere=new THREE.SphereGeometry(1,10,7),box=new THREE.BoxGeometry(1,1,1);
    function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);}
    function make(kind){
        const root=new THREE.Group();root.name='Wildlife_'+kind;
        const color={frog:0x638d46,rabbit:0xd8d0bd,pig:0xc98c8c,horse:0x8e6040}[kind];
        function part(name,x,y,z,sx,sy,sz,tint=color,cube=false){const mesh=new THREE.Mesh(cube?box:sphere,material(tint));mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh;}
        if(kind==='frog'){
            part('body',0,.13,0,.17,.1,.22);part('head',0,.18,.15,.17,.09,.12);
            for(const s of [-1,1]){part('haunch',s*.15,.08,-.12,.09,.07,.12);part('foot',s*.18,.025,.12,.07,.025,.09);part('eye',s*.11,.26,.18,.045,.05,.045,0xe6dd9a);part('pupil',s*.11,.27,.217,.018,.028,.015,0x18201b);}
        }else{
            const horse=kind==='horse',pig=kind==='pig',h=horse?.65:pig?.29:.2,w=horse?.22:pig?.2:.13,length=horse?.45:pig?.28:.2;
            part('body',0,h,0,w,horse?.27:pig?.19:.15,length);
            const headY=horse?1.08:pig?.34:.34,headZ=horse?.42:pig?.28:.18;
            if(horse){const neck=part('neck',0,.88,.28,.14,.34,.14);neck.rotation.x=-.3;part('mane',0,.96,.16,.035,.32,.08,0x30271f);}
            part('head',0,headY,headZ,horse?.16:pig?.16:.12,horse?.2:.13,horse?.22:.13);
            if(pig){part('snout',0,headY-.025,headZ+.115,.095,.06,.045,0xb87579);for(const s of [-1,1])part('nostril',s*.03,headY-.02,headZ+.155,.012,.016,.008,0x653e48);}
            if(horse)part('muzzle',0,headY-.08,headZ+.14,.13,.1,.15,0x5c4635);
            for(const s of [-1,1]){
                part('eye',s*(horse?.135:pig?.125:.09),headY+.035,headZ+.09,.023,.028,.02,0x18202a);
                const ear=part('ear',s*(horse?.11:pig?.13:.065),headY+(horse?.23:pig?.15:.23),headZ-.01,horse?.045:pig?.075:.04,horse?.12:pig?.085:.19,horse?.045:.035);ear.rotation.z=-s*.16;
                if(!horse&&!pig)part('innerEar',s*.065,headY+.24,headZ+.02,.019,.13,.012,0xc7919c);
                for(const z of [-1,1]){part('leg',s*w*.75,h/2,z*length*.65,horse?.055:pig?.055:.045,h/2,horse?.055:.05);if(horse)part('hoof',s*w*.75,.045,z*length*.65,.065,.045,.065,0x302b29);}
            }
            const tail=part('tail',0,h+.03,-length-.07,horse?.06:pig?.035:.065,horse?.22:.05,horse?.07:.065,horse?0x30271f:color);tail.rotation.x=.5;
        }
        root.userData.kind=kind;return root;
    }
    species.forEach(kind=>templates[kind]=make(kind));
    let seed=82971;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const habitats=[],actors=new Map(),pool=[],group=new THREE.Group();group.name='PrimordialWildlife';scene.add(group);
    function valid(x,z,r=.35){const y=ancientGrove.ground(x,z);return y!==null&&x>151&&x<439&&z> -241&&z<37&&Math.hypot(x-340,z+150)>18&&!checkCollision(x,z,y,r);}
    for(let iz=0;iz<9;iz++)for(let ix=0;ix<9;ix++){
        for(let attempt=0;attempt<24;attempt++){const x=162+ix*31+random()*12,z=-232+iz*29+random()*12;if(valid(x,z,.5)){habitats.push({id:ix+','+iz,kind:species[(ix+iz*3)%4],x,z});break;}}
    }
    let scan=0,time=0;
    function spawn(home){
        const slot=pool.findIndex(a=>a.kind===home.kind),actor=slot>=0?pool.splice(slot,1)[0]:{kind:home.kind,model:templates[home.kind].clone(true)};
        Object.assign(actor,{home,angle:random()*Math.PI*2,turn:1+random()*3,phase:random()*6,pauseOffset:random()*6,fade:0});actor.model.position.set(home.x,ancientGrove.ground(home.x,home.z),home.z);actor.model.visible=true;actor.model.scale.setScalar(.001);group.add(actor.model);actors.set(home.id,actor);return actor;
    }
    function update(dt){
        if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
        dt=Math.min(.1,Math.max(0,dt));time+=dt;scan+=dt;const p=playerGroup.position;
        if(scan>.6){scan=0;for(const home of habitats){if(actors.size>=16)break;if(!actors.has(home.id)&&Math.hypot(home.x-p.x,home.z-p.z)<45&&Math.hypot(home.x-p.x,home.z-p.z)>5)spawn(home);}}
        for(const [id,a] of actors){
            const pos=a.model.position,far=Math.hypot(pos.x-p.x,pos.z-p.z)>65;
            a.fade=THREE.MathUtils.clamp(a.fade+dt*(far?-2:2),0,1);a.model.scale.setScalar(Math.max(.001,a.fade));
            if(far&&a.fade===0){group.remove(a.model);actors.delete(id);if(pool.length<20)pool.push(a);continue;}
            a.turn-=dt;if(a.turn<=0){a.angle+=(random()-.5)*2.5;a.turn=1+random()*3;}
            const away=Math.hypot(pos.x-a.home.x,pos.z-a.home.z);if(away>13)a.angle=Math.atan2(a.home.x-pos.x,a.home.z-pos.z);
            const speed={frog:.28,rabbit:.55,pig:.4,horse:.65}[a.kind],nx=pos.x+Math.sin(a.angle)*speed*dt,nz=pos.z+Math.cos(a.angle)*speed*dt;
            const moving=Math.sin(time*.55+a.pauseOffset)>-.35;
            if(moving&&valid(nx,nz,a.kind==='horse'?.4:.23)){pos.x=nx;pos.z=nz;}else if(moving)a.angle+=dt*3;
            const ground=ancientGrove.ground(pos.x,pos.z);a.phase+=dt*(a.kind==='rabbit'?8:5);
            pos.y=ground+((a.kind==='frog'||a.kind==='rabbit')&&moving?Math.max(0,Math.sin(a.phase))*.09:0);
            a.model.rotation.y+=Math.atan2(Math.sin(a.angle-a.model.rotation.y),Math.cos(a.angle-a.model.rotation.y))*(1-Math.exp(-dt*4));
            a.model.children.filter(c=>c.name==='leg').forEach((leg,i)=>leg.rotation.x=moving?Math.sin(a.phase+(i%2)*Math.PI)*.3:0);
            if(Math.hypot(pos.x-p.x,pos.z-p.z)<18)window.fieldGuide?.record('wildlife_'+a.kind);
        }
    }
    window.forestWildlife={group,habitats,actors,pool,species,update,preview:kind=>templates[kind]};
}
