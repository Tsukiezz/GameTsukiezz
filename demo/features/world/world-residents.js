/* Peaceful residents and riverbed species share the same models as the guide. */
const COMMUNITY_GUIDE=[
 ['candy_ginger','npcs','Dân bánh gừng','Gingerbread resident','Cư dân bánh quy sống trong vương quốc bánh kẹo, đi dạo trên các lối kem và quảng trường bánh ngọt.'],
 ['candy_mallow','npcs','Dân kẹo dẻo','Marshmallow resident','Cư dân kẹo dẻo đội mũ đường, đi dạo cùng dân bánh gừng trong vương quốc.'],
 ['void_guard','npcs','Bảo vệ Hư Không','Void security guard','Bảo vệ mặc đồng phục tím và huy hiệu vàng, canh lối vào cả tám tòa và khu vực thang máy.'],
 ['santa_gatekeeper','npcs','Vệ binh cổng Noel','Santa gatekeeper','Canh cổng xưởng quà. Hai cánh cổng mở khi đến gần và đóng khi lối qua đã trống.'],
 ['santa_worker','npcs','Thợ xưởng quà Noel','Santa workshop elf','Công nhân làm việc tại ba tầng lắp ráp, kiểm tra và đóng gói quà của nhà máy Tuyết.'],
 ['river_shrimp','wildlife','Tôm càng nguyệt','Moon river prawn','Tôm hiền lành, râu dài, thân nhiều đốt, bò sát cát phù sa dưới toàn bộ mạng sông.'],
 ['river_glass_shrimp','wildlife','Tôm ngọc lam','Blue pearl shrimp','Tôm nhỏ màu lam ngọc sống giữa rong nước và các bờ cát chìm.'],
 ['river_crab','wildlife','Cua sông đỏ','Red river crab','Cua đỏ có hai càng, di chuyển chậm trên đáy sông. Không tấn công người chơi.'],
 ['river_moon_crab','wildlife','Cua mai nguyệt','Moon-shell crab','Cua mai xanh tròn sống ở các nhánh sông, kể cả sông vùng mở rộng và sông băng.'],
 ['river_snail','wildlife','Ốc xoắn phù sa','Alluvial spiral snail','Ốc có vỏ xoắn nâu vàng, bò trên lớp cát ở đáy nước, tránh bờ khô.'],
 ['river_ice_snail','wildlife','Ốc ngọc băng','Ice pearl snail','Ốc vỏ trắng lam xuất hiện dưới các dòng sông, cùng các đàn cá và cỏ nước.']
];
const communityModelCache=new Map();
function communityModel(kind){

    if(CREATURE_STUDIO_DATA.models[kind])return creatureArt.create(kind).root;
    if(communityModelCache.has(kind))return communityModelCache.get(kind).clone(true);
    if(kind==='santa_gatekeeper')return voidModel('guard');if(kind==='santa_worker')return voidModel('elf');
    const root=new THREE.Group(),parts=[];
    function part(g,p,s,color){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color}));m.position.set(...p);m.scale.set(...s);m.updateMatrix();root.add(m);parts.push(m);return m;}
    const orb=(p,s,c)=>part(new THREE.SphereGeometry(1,10,7),p,s,c),box=(p,s,c)=>part(new THREE.BoxGeometry(1,1,1),p,s,c);
    function rod(a,b,r,color){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),m=part(new THREE.CylinderGeometry(r,r,A.distanceTo(B),6),A.clone().lerp(B,.5).toArray(),[1,1,1],color);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());m.updateMatrix();return m;}
    if(kind.startsWith('river_')){
        const shrimp=kind.includes('shrimp'),crab=kind.includes('crab'),color=kind.includes('glass')?0x82bcbf:kind.includes('moon')?0x658eae:kind.includes('ice')?0xaac9d3:shrimp?0xc88a77:crab?0xae5b57:0xb29465;
        if(shrimp){for(let i=0;i<7;i++)orb([0,.18+Math.sin(i*.45)*.07,(i-3)*.11],[.12-i*.008,.11,.1],color);orb([0,.22,-.42],[.16,.14,.18],color);for(const side of [-1,1]){orb([side*.1,.31,-.53],[.035,.04,.035],0x233745);rod([side*.09,.25,-.52],[side*.32,.25,-.98],.012,color);rod([side*.32,.25,-.98],[side*.42,.3,-1.12],.009,color);for(let i=0;i<5;i++)rod([side*.05,.15,-.2+i*.12],[side*.23,.03,-.25+i*.12],.014,color);orb([side*.12,.16,.46],[.15,.035,.1],color);}}
        else if(crab){orb([0,.22,0],[.38,.2,.28],color);for(const side of [-1,1]){for(let i=0;i<4;i++){const z=(i-1.5)*.14;rod([side*.25,.17,z],[side*.52,.17,z+.08],.025,color);rod([side*.52,.17,z+.08],[side*.63,.025,z+.18],.02,color);}rod([side*.22,.25,-.18],[side*.5,.28,-.45],.055,color);orb([side*.5,.3,-.48],[.12,.12,.16],color);rod([side*.46,.35,-.56],[side*.42,.35,-.69],.035,color);rod([side*.56,.3,-.56],[side*.57,.31,-.66],.03,color);rod([side*.16,.32,-.16],[side*.16,.44,-.25],.03,color);orb([side*.16,.45,-.25],[.04,.045,.04],0x1f2b37);}}
        else{orb([0,.07,.02],[.21,.08,.43],0x879986);orb([0,.18,-.32],[.17,.15,.15],0x9faa87);orb([0,.32,.1],[.31,.33,.28],color);for(let i=0;i<28;i++){const a=i*.45,r=.23*(1-i/32);orb([r*Math.cos(a),.35+r*Math.sin(a),-.15],[.03,.03,.035],0x786e61);}for(const s of [-1,1]){rod([s*.08,.23,-.36],[s*.12,.41,-.48],.014,0x9faa87);orb([s*.12,.42,-.48],[.025,.03,.025],0x233745);}}
    }else{
        const guard=kind==='void_guard',mallow=kind==='candy_mallow',main=guard?0x66537f:mallow?0xe1cbd8:0xba8d62,cream=guard?0xc7bca9:0xf0dfc7;
        orb([0,.7,0],[.35,.43,.26],main);orb([0,1.28,.03],[.38,.36,.32],mallow?0xe6dce3:cream);for(const side of [-1,1]){orb([side*.15,.15,.05],[.17,.15,.23],guard?0x253445:main);rod([side*.17,.45,0],[side*.15,.2,.02],.1,main);rod([side*.3,.9,0],[side*.45,.55,.06],.105,main);orb([side*.45,.55,.06],[.12,.12,.12],cream);orb([side*.13,1.31,.33],[.05,.07,.028],0x253445);orb([side*.24,1.2,.31],[.065,.025,.015],0xc88791);}
        box([0,.68,.26],[.66,.1,.07],guard?0x253445:0xe5d5bd);for(let i=0;i<3;i++)orb([0,.55+i*.2,.28],[.045,.045,.03],guard?0xc9a86b:0xad6088);
        if(guard){box([0,1.62,0],[.78,.14,.62],0x66537f);box([0,1.69,-.02],[.63,.15,.48],0x3a3554);orb([0,1.67,.33],[.09,.1,.025],0xd3b366);box([.17,.87,.27],[.16,.2,.05],0xc9a86b);box([-.26,.52,.3],[.16,.25,.05],0x273e52);}
        else{orb([0,1.65,0],[.41,.13,.34],mallow?0xd5a9bd:0xd7b989);orb([.1,1.8,0],[.12,.12,.12],0xb65c7e);for(const side of [-1,1])box([side*.3,.87,.05],[.08,.09,.52],0xf0dfc7);}
        root.scale.setScalar(.7);
    }
    const positions=[],colors=[];for(const m of parts){m.updateMatrix();const g=m.geometry.toNonIndexed();g.applyMatrix4(m.matrix);positions.push(...g.attributes.position.array);const n=g.attributes.normal,c=m.material.color;for(let i=0;i<n.count;i++){const s=.67+.25*Math.max(0,n.getY(i))+.08*Math.max(0,n.getZ(i));colors.push(c.r*s,c.g*s,c.b*s);}g.dispose();m.geometry.dispose();m.material.dispose();root.remove(m);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();root.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true})));root.name=kind;communityModelCache.set(kind,root);return root.clone(true);
}
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installWorldResidents(){
    const root=new THREE.Group();root.name='PeacefulWorldResidents';scene.add(root);const actors=[],benthic=[],pools=[],species=COMMUNITY_GUIDE.filter(s=>s[1]==='wildlife').map(s=>s[0]);let time=0,clock=1;
    function add(kind,position,homeRadius=0){const group=communityModel(kind);group.position.copy(position);root.add(group);const a={kind,group,home:position.clone(),homeRadius,phase:actors.length*.8};actors.push(a);return a;}
    const c=candyRealm.center;
    for(let i=0;i<22;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();let found=null;for(let k=0;k<48;k++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const x=c.x-82+((i*37+k*19)%164),z=c.z-10+((i*23+k*31)%86),y=getGroundElevation(x,z,c.y+1);if(!checkCollision(x,z,y,.6)&&Math.abs(y-c.y)<1.1&&!riverBoat.waterAt(x,z)){found=new THREE.Vector3(x,y+.225,z);break;}}if(found)add(i%2?'candy_mallow':'candy_ginger',found,2);}
    for(const t of voidDistrict.towers){if(window.gameBoot.shouldYield())await window.gameBoot.yield();for(const side of [-1,1]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const a=add('void_guard',voidDistrict.world(t.x-31,0,t.z+side*4.5));a.group.rotation.y=voidDistrict.plan.yaw-Math.PI/2;}}
    // The gatekeepers and workers already exist: register rather than duplicate.
    for(const g of antarcticRealm.winterStructure.guards){if(window.gameBoot.shouldYield())await window.gameBoot.yield();actors.push({kind:'santa_gatekeeper',group:g,home:g.position.clone(),homeRadius:0,phase:0,existing:true});}
    for(const w of antarcticRealm.winterStructure.workers){if(window.gameBoot.shouldYield())await window.gameBoot.yield();actors.push({kind:'santa_worker',group:w.model,home:w.model.position.clone(),homeRadius:0,phase:w.phase,existing:true});}
    for(const kind of species){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const mesh=new THREE.InstancedMesh(creatureArt.merged(kind),new THREE.MeshBasicMaterial({vertexColors:true}),100);mesh.name='Riverbed_'+kind;mesh.count=0;mesh.frustumCulled=false;mesh.userData.ecologyDynamic=true;root.add(mesh);pools.push({kind,mesh});}
    const dummy=new THREE.Object3D();
    function nearby(){if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return null;return actors.filter(a=>a.group.visible&&playerGroup.position.distanceTo(a.group.position)<2.4).sort((a,b)=>a.group.position.distanceToSquared(playerGroup.position)-b.group.position.distanceToSquared(playerGroup.position))[0]||null;}
    function talk(){return false;}
    const prompt=document.createElement('div');prompt.className='community-prompt';prompt.hidden=true;gameHud.append(prompt);
    function update(dt){if(!gameState.isPlaying){root.visible=false;prompt.hidden=true;return;}root.visible=true;dt=Math.min(.1,Math.max(0,dt));const paused=gameState.inDialogue||document.querySelector('.modal-overlay.active');if(!paused)time+=dt;for(const a of actors){if(a.group.visible&&playerGroup.position.distanceTo(a.group.position)<18)fieldGuide.record(a.kind);if(a.existing)continue;a.group.visible=playerGroup.position.distanceTo(a.home)<(currentProfileKey==='low'?220:700);if(!a.group.visible||paused)continue;if(a.homeRadius){const x=a.home.x+Math.sin(time*.2+a.phase)*a.homeRadius,z=a.home.z+Math.cos(time*.17+a.phase)*a.homeRadius,y=getGroundElevation(x,z,a.home.y+.2)+(a.kind.startsWith('candy_')?.225:0);if(!checkCollision(x,z,y,.35)&&Math.abs(y-a.home.y)<.4){a.group.position.set(x,y,z);a.group.rotation.y=Math.atan2(Math.cos(time*.2+a.phase),-Math.sin(time*.17+a.phase));}}if(playerGroup.position.distanceTo(a.group.position)<20)fieldGuide.record(a.kind);}
        prompt.hidden=true;
        clock+=dt;const interval=currentProfileKey==='low'?.2:.08;if(clock<interval)return;clock=0;benthic.length=0;const distance=currentProfileKey==='low'?75:currentProfileKey==='ultra'?260:160,limit=currentProfileKey==='low'?48:currentProfileKey==='ultra'?420:180,counts=species.map(()=>0),p=playerGroup.position,gx=Math.floor(p.x/96),gz=Math.floor(p.z/96),r=Math.ceil(distance/96),near=[];
        for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)for(const h of aquaticEcology.cells.get((gx+i)+','+(gz+j))||[])if(Math.hypot(h.x-p.x,h.z-p.z)<distance)near.push(h);near.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
        outer:for(const h of near)for(let k=0;k<species.length;k++){if(benthic.length>=limit)break outer;const angle=h.seed*1.1+k*2.4,x=h.x+Math.sin(angle+time*.035)*2.8,z=h.z+Math.cos(angle+time*.04)*2.8,w=riverBoat.waterAt(x,z);if(!w||w.y-w.bottom<.5||moonRailway.obstacleSurvey.top(x,z,.5,w.bottom+.55,w.bottom+.05)>w.bottom+.05)continue;const index=counts[k]++;if(index>=100)continue;dummy.position.set(x,w.bottom+.035,z);dummy.rotation.set(0,angle+Math.sin(time*.3+h.seed)*.15,0);dummy.scale.setScalar(k<2?.65:.75);dummy.updateMatrix();pools[k].mesh.setMatrixAt(index,dummy.matrix);benthic.push({kind:species[k],position:dummy.position.clone(),water:w});if(playerSurvival.underwater&&playerGroup.position.distanceTo(dummy.position)<15)fieldGuide.record(species[k]);}
        pools.forEach((pool,i)=>{pool.mesh.count=Math.min(100,counts[i]);pool.mesh.visible=pool.mesh.count>0;pool.mesh.instanceMatrix.needsUpdate=true;});
    }
    window.worldResidents={root,actors,pools,benthic,species,nearby,talk,update,preview:communityModel};constructionZones.refresh();window.monsterCamps?.revalidate?.();
}
