/* New royal engineering headquarters; the retired station is not instantiated. */
function installTechnologyBase(){
    const group=new THREE.Group();group.name='RoyalTechnologyHeadquarters';scene.add(group);const cx=-225,cz=20,sample=terrainContinuity.height;
    let level=-Infinity;for(let x=-46;x<=46;x+=4)for(let z=-32;z<=74;z+=4)level=Math.max(level,sample(cx+x,cz+z));level+=.15;
    const positions=[],indices=[],n=34,m=42,step=4,x0=cx-68,z0=cz-50;
    for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const x=x0+i*step,z=z0+j*step,edge=Math.max(THREE.MathUtils.smoothstep(Math.abs(x-cx),46,68),THREE.MathUtils.smoothstep(z-cz,72,118),1-THREE.MathUtils.smoothstep(z-cz,-50,-32));positions.push(x,THREE.MathUtils.lerp(level,sample(x,z),edge),z);}
    for(let j=0;j<m;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x59636c,roughness:1}));terrain.name='TechnologyFoundationTerrain';group.add(terrain);
    function foundationHeight(x,z){const u=THREE.MathUtils.clamp((x-x0)/step,0,n-1e-8),v=THREE.MathUtils.clamp((z-z0)/step,0,m-1e-8),i=Math.floor(u),j=Math.floor(v),fx=u-i,fz=v-j,a=j*(n+1)+i,A=positions[a*3+1],B=positions[(a+1)*3+1],C=positions[(a+n+1)*3+1],D=positions[(a+n+2)*3+1];return fx+fz<=1?A+(B-A)*fx+(C-A)*fz:D+(C-D)*(1-fx)+(B-D)*(1-fz);}
    ground.updateWorldMatrix(true,false);const old=ground.geometry.attributes.position,inverse=ground.matrixWorld.clone().invert();
    for(let i=0;i<old.count;i++){const p=new THREE.Vector3().fromBufferAttribute(old,i).applyMatrix4(ground.matrixWorld);if(p.x>x0&&p.x<x0+n*step&&p.z>z0&&p.z<z0+m*step){p.y=Math.min(p.y,foundationHeight(p.x,p.z)-.04);p.applyMatrix4(inverse);old.setXYZ(i,p.x,p.y,p.z);}}old.needsUpdate=true;ground.geometry.computeVertexNormals();ground.geometry.computeBoundingSphere();
    const mats={stone:new THREE.MeshStandardMaterial({color:0x596778,roughness:.75}),white:new THREE.MeshStandardMaterial({color:0xa3aeb8,roughness:.7}),dark:new THREE.MeshStandardMaterial({color:0x232e3c,roughness:.7}),gold:new THREE.MeshStandardMaterial({color:0x9c8150,metalness:.35,roughness:.6}),glass:new THREE.MeshStandardMaterial({color:0x386578,roughness:.35}),screen:new THREE.MeshBasicMaterial({color:0x468f9d}),rust:new THREE.MeshStandardMaterial({color:0x674132,roughness:1}),char:new THREE.MeshStandardMaterial({color:0x201e1d,roughness:1})};
    const solids=[],cameraObstacles=[],ceilings=[];
    function box(name,x,y,z,w,h,d,material='stone',solid=true,stand=false){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[material]);mesh.name=name;mesh.position.set(cx+x,level+y,cz+z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);cameraObstacles.push(mesh);if(solid){addBoxCollider(cx+x,cz+z,w,d,level+y-h/2,level+y+h/2,stand);const c=colliders.at(-1);c.name='technology-'+name;solids.push(c);}return mesh;}
    box('GreatHallBack',0,9,-30,90,18,2);box('GreatHallWest',-44,9,0,2,18,60);box('GreatHallEast',44,9,0,2,18,60);
    for(const s of [-1,1]){box('GrandFacade',s*26,9,30,38,18,2,'white');box('RoyalPylon',s*39,17,27,7,34,7,'dark');box('PylonCrown',s*39,34,27,10,2,10,'gold',false);box('GlassGallery',s*26,12,31.1,25,7,.15,'glass',false);}
    box('EntranceArch',0,17,30,16,3,4,'gold');const roof=box('EngineeringRoof',0,19,0,92,2,64,'dark',true,true);ceilings.push({x0:cx-46,x1:cx+46,z0:cz-32,z1:cz+32,y:level+18});
    for(const s of [-1,1])for(const z of [-18,12]){box('InteriorColumn',s*31,8,z,2,16,2,'white');box('Fabricator',s*25,1.1,z,9,2.2,6,'dark');box('FabricatorScreen',s*25,2.3,z,7,.2,4,'screen',false);}
    box('CentralBlueprintDesk',0,1,-5,10,2,6,'dark');box('BlueprintDisplay',0,2.05,-5,8,.1,4,'screen',false);
    const fabricatorRig=new THREE.Group();fabricatorRig.name='HolographicBoatFabricator';fabricatorRig.position.set(cx,level,cz-5);group.add(fabricatorRig);
    const workScreen=group.getObjectByName('BlueprintDisplay');workScreen.rotation.x=-.28;
    for(const side of [-1,1]){box('FabricatorStatusRail',side*4.4,1.6,-5,.14,.14,5,'screen',false);for(const z of [-7,-3]){const joint=new THREE.Mesh(new THREE.SphereGeometry(.28,10,6),mats.gold);joint.position.set(side*4,2.3,z+5);fabricatorRig.add(joint);const arm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,2.4,8),mats.white);arm.position.set(side*3.4,3.1,z+5);arm.rotation.z=side*.65;fabricatorRig.add(arm);}}
    const hologram=new THREE.Mesh(new THREE.BoxGeometry(1.2,.3,2.5),new THREE.MeshBasicMaterial({color:0x69b8c5,wireframe:true,transparent:true,opacity:.7,depthWrite:false}));hologram.name='FabricatorBoatBlueprint';hologram.position.set(0,3.7,0);fabricatorRig.add(hologram);
    for(const side of [-1,1])for(const x of [10,24,37])box('FacadeRib',side*x,10,32,1.1,16,1.5,'gold',false);
    const spire=new THREE.Mesh(new THREE.CylinderGeometry(5,8,22,8),mats.dark);spire.name='RoyalTechnologySpire';spire.position.set(cx,level+31,cz-12);group.add(spire);cameraObstacles.push(spire);
    const dome=new THREE.Mesh(new THREE.ConeGeometry(7,10,8),mats.glass);dome.position.set(cx,level+47,cz-12);group.add(dome);cameraObstacles.push(dome);
    for(let y=23;y<=40;y+=4)box('SpireRing',0,y,-12,14,.5,14,'gold',false);
    // A ruined launch vehicle in the forecourt: split hull, scorched panels and loose engine.
    const rocket=new THREE.Group();rocket.name='RuinedDecorativeRocket';rocket.position.set(cx+6,level+5,cz+59);rocket.rotation.z=1.35;group.add(rocket);
    function rocketPart(g,material,y){const mesh=new THREE.Mesh(g,mats[material]);mesh.position.y=y;rocket.add(mesh);cameraObstacles.push(mesh);return mesh;}
    rocketPart(new THREE.CylinderGeometry(2.8,3.2,15,12,1,true),'white',1);rocketPart(new THREE.CylinderGeometry(3.21,3.21,3,12,1,true),'char',-5);
    const broken=rocketPart(new THREE.ConeGeometry(2.8,7,12,1,true),'rust',15);broken.position.x=2.8;broken.rotation.z=-.4;
    for(let i=0;i<8;i++){const panel=rocketPart(new THREE.BoxGeometry(1.1,1.5,.18),i%2?'char':'rust',-4+i*2);panel.position.z=3;panel.rotation.z=i*.31;}
    const engine=new THREE.Mesh(new THREE.ConeGeometry(2.7,4,10,1,true),mats.char);engine.position.set(cx+20,level+1.3,cz+57);engine.rotation.z=1.8;group.add(engine);cameraObstacles.push(engine);addBoxCollider(cx+6,cz+59,25,8,level,level+6,false);colliders.at(-1).name='technology-ruined-rocket';
    function plaque(text,x,z){const c=document.createElement('canvas');c.width=1024;c.height=128;const p=c.getContext('2d');p.fillStyle='#1e2937';p.fillRect(0,0,1024,128);p.fillStyle='#b8b095';p.font='bold 42px sans-serif';p.textAlign='center';p.fillText(text,512,80);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(25,3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));mesh.position.set(cx+x,level+13,cz+z);group.add(mesh);}
    plaque('TRỤ SỞ CÔNG NGHỆ HOÀNG GIA',0,32.2);
    const bench={id:'technology_fabricator',type:'technology_craft',pos:new THREE.Vector3(cx,level,cz-1),radius:5,prompt:'Mở bàn chế tạo công nghệ'};interactables.push(bench);
    const resources=[];for(const [kind,x,z] of [['wood',-20,15],['scrap',20,15]]){box('Supply_'+kind,x,.7,z,4,1.4,3,kind==='wood'?'rust':'gold');const item={id:'technology_supply_'+kind,type:'technology_supply',kind,pos:new THREE.Vector3(cx+x,level,cz+z+2),radius:3,prompt:kind==='wood'?'Lấy gỗ đóng thuyền ×8':'Thu hồi hợp kim ×4'};interactables.push(item);resources.push(item);}
    const contains=(x,z)=>Math.abs(x-cx)<68&&z>z0&&z<z0+m*step;
    function ceiling(x,z,previous,next){for(const c of ceilings)if(x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1&&previous+PLAYER_HEIGHT<=c.y+.02&&next+PLAYER_HEIGHT>c.y)next=Math.min(next,c.y-PLAYER_HEIGHT);return next;}
    function travel(){window.riverBoat?.packForTravel();if(window.moonRailway?.aboard)moonRailway.travel(0);fastTravelTo(cx,cz+39,'Trụ Sở Công Nghệ Hoàng Gia',window.worldSurface?.height(cx,cz+39)??level);}
    landmarksData.push({id:'technology_headquarters',name:'Trụ Sở Công Nghệ Hoàng Gia',x:cx,z:cz,color:'#8bafbc',icon:'⚙️'});
    const button=document.createElement('button');button.className='tour-btn';button.textContent='⚙️ Trụ Sở Công Nghệ';button.onclick=()=>{gameHUD.closePanels();travel();};document.querySelector('#hud-travel .hud-destinations').append(button);
    window.technologyBase={group,terrain,contains,level,center:new THREE.Vector3(cx,level,cz),bench,resources,rocket,cameraObstacles,solids,ceiling,travel,hologram,update(dt){hologram.rotation.y+=Math.min(dt,.1)*.3;}};
}
