/* Diverse flora in spatial batches, and randomly spawned, terrain-aware wildlife. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installLivingWorld(){
    const group=new THREE.Group();group.name='LivingWorldEcology';scene.add(group);
    const species=['bull','goat','doe','deer','dog','cat','butterfly','elephant','chicken','buffalo'],names={bull:'Bò Tót',goat:'Dê',doe:'Nai',deer:'Hươu',dog:'Chó',cat:'Mèo',butterfly:'Bươm Bướm',elephant:'Voi',chicken:'Gà',buffalo:'Trâu'};
    const surface=(x,z)=>window.worldSurface?.height(x,z)??window.mangroveRealm?.ground(x,z)??window.volcanicValley?.ground(x,z)??window.riverRealm?.ground(x,z)??window.bachKhuyet?.ground(x,z)??window.ancientGrove?.ground(x,z)??realmTerrainHeight(x,z);
    function allowed(x,z,animal=false,radius=.65){if(voidReserved(x,z,25))return false;
        if(window.highlandTrails?.corridorAt(x,z,3.5))return false;
        if(window.technologyBase?.contains(x,z)||window.candyRealm?.contains(x,z))return false;
        if(window.desertRealm?.contains(x,z))return false;
        if(window.moonRailway?.infrastructureAt(x,z))return false;
        if(window.mangroveRealm?.contains(x,z))return false;
        if(Math.abs(x)>worldExpansion.half-90||Math.abs(z)>worldExpansion.half-90||Math.hypot(x,z)<30||worldExpansion.antarctic(x,z)||riverBoat.waterAt(x,z))return false;if(Math.hypot(x-antarcticRealm.factory.x,z-antarcticRealm.factory.z)<190||Math.hypot(x-antarcticRealm.arena.x,z-antarcticRealm.arena.z)<160)return false;
        if(window.volcanicValley?.contains(x,z)||window.riverRealm?.waterAt(x,z)||window.riverRealm?.mountainContains(x,z)||window.bachKhuyet?.contains(x,z))return false;
        if(landmarksData.some(l=>Math.hypot(x-l.x,z-l.z)<(l.id==='mercury_lake'?190:42)))return false;
        if(Math.hypot((x-mercuryLake.data.x)/mercuryLake.data.rx,(z-mercuryLake.data.z)/mercuryLake.data.rz)<1.32)return false;
        if(x>-148&&x<-72&&z>35&&z<160||window.romanArena?.contains(x,z)||window.romanArena?.pedestrianPathContains?.(x,z))return false;
        for(const s of crystalRoadSegments){const dx=s.x2-s.x1,dz=s.z2-s.z1,q=THREE.MathUtils.clamp(((x-s.x1)*dx+(z-s.z1)*dz)/(dx*dx+dz*dz||1),0,1);if(Math.hypot(x-s.x1-dx*q,z-s.z1-dz*q)<s.width/2+3)return false;}
        const y=surface(x,z);if(!Number.isFinite(y)||y< -3||Math.hypot(surface(x+1,z)-surface(x-1,z),surface(x,z+1)-surface(x,z-1))/2>.42)return false;
        return !animal||!checkCollision(x,z,y,radius)&&[-1,1].every(s=>Math.abs(surface(x+s*radius,z)-y)<.6&&Math.abs(surface(x,z+s*radius)-y)<.6);
    }
    const material={bark:new THREE.MeshStandardMaterial({color:0x67533e,roughness:1}),leaf:new THREE.MeshStandardMaterial({color:0x649258,roughness:.95}),pine:new THREE.MeshStandardMaterial({color:0x396d61,roughness:.95}),bush:new THREE.MeshStandardMaterial({color:0x8aab63,roughness:.95}),fern:new THREE.MeshStandardMaterial({color:0x538b70,side:THREE.DoubleSide,roughness:1}),pink:new THREE.MeshStandardMaterial({color:0xef9abd,roughness:.85}),gold:new THREE.MeshStandardMaterial({color:0xe7c95b,roughness:.85}),violet:new THREE.MeshStandardMaterial({color:0x9c8bc9,roughness:.85})};
    const protos={tree:[{g:new THREE.CylinderGeometry(.2,.35,4.5,6).translate(0,2.25,0),m:'bark'},{g:new THREE.IcosahedronGeometry(2.4,1).scale(1,1.25,1).translate(0,5.2,0),m:'leaf'}],pine:[{g:new THREE.CylinderGeometry(.13,.25,5.5,6).translate(0,2.75,0),m:'bark'},...[2.7,4.2,5.6].map((y,i)=>({g:new THREE.ConeGeometry(2-i*.4,3.7-i*.6,7).translate(0,y,0),m:'pine'}))],bush:[{g:new THREE.IcosahedronGeometry(.9,1).scale(1.3,.8,1.1).translate(0,.65,0),m:'bush'}],fern:[],flower_pink:[],flower_gold:[],flower_violet:[]};
    for(let i=0;i<6;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const g=new THREE.PlaneGeometry(.26,1.3,1,3);g.translate(0,.65,0);g.rotateZ(.65);g.rotateY(i*Math.PI/3);protos.fern.push({g,m:'fern'});}
    for(const [kind,m] of [['flower_pink','pink'],['flower_gold','gold'],['flower_violet','violet']]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();protos[kind].push({g:new THREE.CylinderGeometry(.018,.025,.45,4).translate(0,.225,0),m:'leaf'});for(let i=0;i<5;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const a=i*Math.PI*2/5;protos[kind].push({g:new THREE.SphereGeometry(.13,5,3).scale(1,.4,1.5).rotateY(a).translate(Math.cos(a)*.12,.48,Math.sin(a)*.12),m});}}
    function merge(list){const p=[],n=[],idx=[];for(const source of list){const g=source.index?source.toNonIndexed():source.clone();g.computeVertexNormals();const off=p.length/3;p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);for(let i=0;i<g.attributes.position.count;i++)idx.push(off+i);g.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setIndex(idx);return g;}
    const prototypeBins={};for(const [kind,parts] of Object.entries(protos)){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const bins={};for(const p of parts){if(window.gameBoot.shouldYield())await window.gameBoot.yield();(bins[p.m]??=[]).push(p.g);}prototypeBins[kind]=Object.entries(bins).map(([m,gs])=>({m,g:merge(gs)}));}
    const placements=[],chunks=new Map(),kinds=Object.keys(protos);
    // Stratification covers the whole map, with a new random arrangement per session.
    for(let gx=-3100;gx<=3100;gx+=160){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let gz=-3100;gz<=3100;gz+=160){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let j=0;j<31;j++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const x=gx+Math.random()*145-72.5,z=gz+Math.random()*145-72.5;if(!allowed(x,z))continue;const kind=j<2?'tree':j<4?'pine':kinds[2+Math.floor(Math.random()*(kinds.length-2))],p={kind,x,z,y:surface(x,z),scale:kind==='tree'||kind==='pine'?.7+Math.random()*.7:.55+Math.random()*.9,yaw:Math.random()*Math.PI*2};placements.push(p);const key=Math.floor(x/128)+','+Math.floor(z/128);if(!chunks.has(key))chunks.set(key,{x:Math.floor(x/128)*128+64,z:Math.floor(z/128)*128+64,items:[]});chunks.get(key).items.push(p);}}}
    const dummy=new THREE.Object3D(),chunkGroups=[];
    for(const chunk of chunks.values()){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        const root=new THREE.Group();root.name='EcologyPatch';group.add(root);chunkGroups.push({...chunk,group:root});
        for(const kind of kinds){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const ps=chunk.items.filter(p=>p.kind===kind);if(!ps.length)continue;for(const proto of prototypeBins[kind]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const g=proto.g.clone(),mesh=new THREE.InstancedMesh(g,material[proto.m],ps.length),box=new THREE.Box3();mesh.name='Flora_'+kind;mesh.receiveShadow=true;
            mesh.castShadow=kind==='tree'||kind==='pine';ps.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.y=p.yaw;dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);box.expandByPoint(new THREE.Vector3(p.x-5,p.y,p.z-5));box.expandByPoint(new THREE.Vector3(p.x+5,p.y+12,p.z+5));});g.boundingSphere=box.getBoundingSphere(new THREE.Sphere());root.add(mesh);}
            if(kind==='tree'||kind==='pine')for(const p of ps){if(window.gameBoot.shouldYield())await window.gameBoot.yield();addCylinderCollider(p.x,p.z,.25*p.scale,p.y,p.y+4*p.scale,false);colliders.at(-1).name='ecology-tree-trunk';}
        }
    }
    rebuildCollisionGrid();
    const templates={},actors=[],animalMaterials={},animalRadius=kind=>kind==='elephant'?1.3:kind==='buffalo'?.95:kind==='chicken'?.25:.65;
    const mat=(key,color)=>animalMaterials[key]??(animalMaterials[key]=new THREE.MeshStandardMaterial({color,roughness:.85}));
    function animal(kind){
        if(creatureArt.kinds.includes(kind))return creatureArt.create(kind,-1);
        const root=new THREE.Group(),joints=[],dark=mat('dark',0x302b2a),horn=mat('horn',0xd6cba9),eye=mat('eye',0x171b20),skin=mat(kind,{bull:0x3f3430,goat:0xc9c3b3,doe:0xb58e67,deer:0x9b7350,dog:0xcea777,cat:0x8f9297,butterfly:0xe7a15e,elephant:0x7e8486,buffalo:0x41494b,chicken:0xc4b899}[kind]);
        const s=kind==='bull'?1.55:kind==='deer'?1.12:kind==='doe'?1:kind==='goat'?.75:kind==='dog'?.55:kind==='cat'?.38:1;
        function orb(x,y,z,sx,sy,sz,m=skin,parent=root){const o=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
        function rod(a,b,r,m=horn,parent=root){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=new THREE.Mesh(new THREE.CylinderGeometry(r*.35,r,d.length(),6),m);o.position.fromArray(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(o);return o;}
        if(kind==='elephant'||kind==='buffalo'||kind==='chicken'){
            const coat=mat(kind,kind==='elephant'?0x7e8486:kind==='buffalo'?0x41494b:0xc4b899);
            if(kind==='chicken'){orb(0,.48,0,.3,.34,.4,coat);orb(0,.83,-.3,.19,.23,.22,coat);orb(0,.82,-.55,.08,.06,.14,mat('beak',0xb69145));for(const s of [-1,1]){orb(s*.14,.89,-.42,.032,.035,.03,eye);orb(s*.27,.52,.02,.09,.23,.27,coat);const j=new THREE.Group();j.position.set(s*.12,.3,0);root.add(j);joints.push(j);rod([0,0,0],[0,-.25,-.04],.04,horn,j);rod([0,-.25,-.04],[0,-.28,-.19],.03,horn,j);}for(let i=0;i<3;i++)orb(0,1.06,-.42+i*.12,.07,.09,.08,mat('comb',0x9a3e3b));orb(0,.7,.4,.15,.28,.12,coat);}
            else {const large=kind==='elephant';orb(0,large?1.9:1.35,0,large?1.05:.75,large?.95:.65,large?1.6:1.25,coat);orb(0,large?2.5:1.55,large?-1.5:-1.35,large?.72:.55,large?.7:.46,large?.75:.6,coat);
                for(const side of [-1,1]){orb(side*(large?.88:.6),large?2.5:1.8,large?-1.3:-1.25,large?.55:.3,large?.7:.13,large?.18:.2,coat);orb(side*(large?.49:.44),large?2.66:1.7,large?-2:-1.72,.055,.065,.045,eye);for(const z of [-.95,.95]){const j=new THREE.Group();j.position.set(side*(large?.68:.48),large?1.4:1,z);root.add(j);joints.push(j);rod([0,0,0],[0,large?-1.12:-.76,0],large?.27:.14,coat,j);orb(0,large?-1.15:-.8,-.04,large?.29:.18,large?.25:.2,large?.35:.23,dark,j);}if(large){rod([side*.4,2,-2],[side*.55,1.75,-2.65],.13,horn);rod([side*.55,1.75,-2.65],[side*.58,2,-2.85],.08,horn);}else{rod([side*.4,1.98,-1.3],[side*1.1,2.1,-1.2],.13,horn);rod([side*1.1,2.1,-1.2],[side*1.26,2.45,-1.5],.09,horn);}}
                if(large)for(let i=0;i<7;i++)orb(Math.sin(i*.3)*.08,2.25-i*.22,-2.06-i*.09,.24-i*.014,.22,.25,coat);rod([0,large?2:1.5,large?1.4:1.1],[.15,large?1.1:.8,large?2:1.7],.07,coat);
            }
            return {group:root,joints};
        }
        if(kind==='butterfly'){for(const side of [-1,1]){const wing=new THREE.Group();root.add(wing);joints.push(wing);orb(side*.3,0,0,.34,.025,.44,mat('wing'+side,side<0?0xf5bb65:0xc58ddd),wing);orb(side*.23,0,.34,.23,.025,.29,mat('wing2',0x71b4bc),wing);for(let i=0;i<3;i++)orb(side*(.2+i*.09),.03,-.12+i*.13,.055,.01,.07,dark,wing);}orb(0,.02,.1,.035,.045,.35,dark);rod([0,0,-.2],[.12,.13,-.4],.012,dark);rod([0,0,-.2],[-.12,.13,-.4],.012,dark);return {group:root,joints};}
        orb(0,1.35,0,.55,.58,1);orb(0,1.75,-.85,.32,.66,.35);orb(0,2.12,-1.1,.35,.37,.58);orb(0,1.98,-1.48,.29,.22,.27,kind==='bull'?dark:skin);
        for(const side of [-1,1]){orb(side*.32,2.24,-1.1,.26,.1,.14);orb(side*.29,2.21,-1.35,.045,.055,.045,eye);for(const z of [-.65,.65]){const joint=new THREE.Group();joint.position.set(side*.34,1.13,z);root.add(joint);joints.push(joint);rod([0,0,0],[0,-.9,0],.085,skin,joint);orb(0,-.91,-.04,.13,.12,.18,dark,joint);}}
        rod([0,1.5,.85],[.1,1.15,1.55],.06,skin);if(kind==='bull')for(const side of [-1,1]){rod([side*.22,2.4,-1],[side*.75,2.5,-1.1],.12);rod([side*.75,2.5,-1.1],[side*.9,2.9,-1.2],.085);orb(side*.4,1.7,-.6,.45,.6,.5,dark);}
        if(kind==='goat'){for(const side of [-1,1]){rod([side*.2,2.4,-1],[side*.26,2.9,-.8],.08);rod([side*.26,2.9,-.8],[side*.29,2.75,-.5],.055);}rod([0,1.9,-1.45],[0,1.55,-1.4],.12,dark);}
        if(kind==='deer')for(const side of [-1,1]){rod([side*.22,2.4,-1],[side*.58,3.5,-.9],.065);for(let i=0;i<3;i++)rod([side*(.3+i*.1),2.7+i*.25,-.95],[side*(.65+i*.12),3+i*.25,-1.18],.04);}
        if(kind==='dog'){for(const side of [-1,1])orb(side*.34,2.04,-1.03,.15,.32,.2,dark);rod([0,1.5,.8],[0,2,1.45],.1,skin);}
        if(kind==='cat'){for(const side of [-1,1])rod([side*.23,2.35,-1],[side*.3,2.7,-1],.16,skin);rod([0,1.4,.8],[.2,2.1,1.45],.08,skin);rod([.2,2.1,1.45],[.35,2.3,1.3],.07,skin);}
        if(kind==='doe')for(let i=0;i<14;i++){const a=i*.8;orb(Math.cos(a)*.5,1.5+Math.sin(a)*.2,(i%5-2)*.3,.05,.06,.05,horn);}
        root.scale.setScalar(s);root.updateMatrixWorld(true);const foot=new THREE.Box3().setFromObject(root).min.y/s;for(const child of root.children)child.position.y-=foot;return {group:root,joints};
    }
    for(const kind of species){if(window.gameBoot.shouldYield())await window.gameBoot.yield();templates[kind]=animal(kind);}
    function findSpawn(kind){for(let tries=0;tries<500;tries++){const x=(Math.random()*2-1)*940,z=(Math.random()*2-1)*940;if(allowed(x,z,true,animalRadius(kind)))return new THREE.Vector3(x,surface(x,z)+(kind==='butterfly'?1.2:0),z);}return null;}
    function spawn(kind){if(!species.includes(kind)||actors.filter(a=>a.kind===kind).length>60)return null;const p=findSpawn(kind);if(!p)return null;const template=templates[kind],model=template.group.clone(true),joints=template.joints.map(j=>model.children[template.group.children.indexOf(j)]),a={kind,group:model,joints,home:p.clone(),destination:null,rest:Math.random()*3,phase:Math.random()*Math.PI*2,age:0};model.position.copy(p);model.rotation.y=Math.random()*Math.PI*2;group.add(model);actors.push(a);return a;}
    for(const kind of species){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(let i=0;i<(kind==='butterfly'?48:kind==='elephant'?8:kind==='buffalo'?12:kind==='chicken'?24:16);i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();spawn(kind);}}
    let cullTimer=1,respawnTimer=0;const population=actors.length;
    function update(dt){group.visible=gameState.isPlaying&&!window.evilCavern?.inside();if(!gameState.isPlaying)return;dt=Math.min(.1,Math.max(0,dt));const p=playerGroup.position,inCave=window.evilCavern?.inside(p);cullTimer+=dt;respawnTimer+=dt;
        if(cullTimer>.5){cullTimer=0;const range=currentProfileKey==='low'?220:460;for(const c of chunkGroups)c.group.visible=!inCave&&Math.hypot(p.x-c.x,p.z-c.z)<range;for(const a of actors)a.group.visible=!inCave&&p.distanceTo(a.group.position)<range*.7;}
        if(gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
        for(const a of actors){a.age+=dt;if(!a.group.visible)continue;const pos=a.group.position;a.rest-=dt;a.phase+=dt;
            if(a.kind==='butterfly'){a.joints.forEach((j,i)=>j.rotation.z=(i?1:-1)*Math.sin(a.phase*15)*.9);pos.y=surface(pos.x,pos.z)+1.3+Math.sin(a.phase*2)*.6;}
            if(a.rest<=0){if(!a.destination||Math.hypot(a.destination.x-pos.x,a.destination.z-pos.z)<.8){a.destination=null;for(let i=0;i<12;i++){const angle=Math.random()*Math.PI*2,r=4+Math.random()*20,x=a.home.x+Math.cos(angle)*r,z=a.home.z+Math.sin(angle)*r;if(allowed(x,z,true,animalRadius(a.kind))){a.destination=new THREE.Vector3(x,surface(x,z),z);break;}}if(!a.destination)a.rest=2;}
                if(a.destination){const delta=a.destination.clone().sub(pos);delta.y=0;const len=delta.length(),speed=a.kind==='butterfly'?1.6:a.kind==='cat'?.8:1.3,step=Math.min(len,speed*dt);delta.normalize();const x=pos.x+delta.x*step,z=pos.z+delta.z*step;if(allowed(x,z,true,animalRadius(a.kind))&&Math.abs(surface(x,z)-surface(pos.x,pos.z))<.25){pos.x=x;pos.z=z;if(a.kind!=='butterfly')pos.y=surface(x,z);a.group.rotation.y=Math.atan2(-delta.x,-delta.z);if(a.kind!=='butterfly')a.joints.forEach((j,i)=>j.rotation.x=Math.sin(a.phase*5+(i%2)*Math.PI)*.3);}else{a.destination=null;a.rest=2;}if(len<.8){a.destination=null;a.rest=1+Math.random()*4;}}
            }
            if(p.distanceTo(pos)<(a.kind==='butterfly'?10:20))window.fieldGuide?.record('roaming_'+a.kind);
        }
        // Redistribute distant animals occasionally, without popping near the player.
        if(respawnTimer>35){respawnTimer=0;const a=actors[Math.floor(Math.random()*actors.length)];if(p.distanceTo(a.group.position)>350){const next=findSpawn(a.kind);if(next&&p.distanceTo(next)>250){a.home.copy(next);a.group.position.copy(next);a.destination=null;}}}
    }
    window.livingWorld={group,species,names,placements,chunks:chunkGroups,actors,population,surface,allowed,spawn,update,preview:kind=>templates[kind]?.group};
    update(.1);
}
