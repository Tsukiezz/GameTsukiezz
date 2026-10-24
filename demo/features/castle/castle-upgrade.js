// Blender-authored geometry and shared runtime collision/vertical movement.
let castleGate = null;
const castleGatekeepers=[];
let secretHatch = null;
let castleSafeAnchor=null;
let lunarUnicorn=null;
let prisonState=null;
let collisionGrid=null;
const COLLISION_CELL=4;

function rebuildCollisionGrid() {
    collisionGrid=new Map();
    for(const c of colliders) {
        if(c.dynamicLakeMonster)continue;
        if(c===castleGate?.leftCollider || c===castleGate?.rightCollider) continue;
        const minX=c.type==='cylinder'?c.x-c.radius:c.minX;
        const maxX=c.type==='cylinder'?c.x+c.radius:c.maxX;
        const minZ=c.type==='cylinder'?c.z-c.radius:c.minZ;
        const maxZ=c.type==='cylinder'?c.z+c.radius:c.maxZ;
        if(!Number.isFinite(minX)) continue;
        for(let x=Math.floor(minX/COLLISION_CELL);x<=Math.floor(maxX/COLLISION_CELL);x++)
            for(let z=Math.floor(minZ/COLLISION_CELL);z<=Math.floor(maxZ/COLLISION_CELL);z++) {
                const key=x+','+z;
                if(!collisionGrid.has(key)) collisionGrid.set(key,[]);
                collisionGrid.get(key).push(c);
            }
    }
}

function nearbyColliders(x,z,radius=PLAYER_RADIUS) {
    if(!collisionGrid) return colliders;
    const result=new Set();
    for(let gx=Math.floor((x-radius)/COLLISION_CELL);gx<=Math.floor((x+radius)/COLLISION_CELL);gx++)
        for(let gz=Math.floor((z-radius)/COLLISION_CELL);gz<=Math.floor((z+radius)/COLLISION_CELL);gz++)
            for(const c of collisionGrid.get(gx+','+gz)||[]) result.add(c);
    if(castleGate) { result.add(castleGate.leftCollider);result.add(castleGate.rightCollider); }
    if(prisonState) result.add(prisonState.collider);
    for(const c of window.lakeMonsters?.colliders||[])result.add(c);
    if(window.bachKhuyet?.tigerCollider)result.add(bachKhuyet.tigerCollider);
    if(window.riverRealm?.wolf.collider)result.add(riverRealm.wolf.collider);
    return result;
}

function inCastleEnvelope(x,z) {
    return x>=-136 && x<=-84 && z>=88 && z<=148;
}

function onCastleTransition(x,z,y) {
    if(x>=-114.5 && x<=-105.5 && z>=41.5 && z<=95.5 && y<6.4) return true;
    // A return stair's landing joins two separate flights. Treat that deck as
    // part of the stair so normal descent does not trigger floor-fall recovery.
    if(window.CASTLE_EXTENSION?.compactStairs?.some(p=>
        Math.abs(x-(p.x-110))<=p.width/2+.3 && z>=p.z+119.5 && z<=p.z+p.depth+120.3 &&
        y>=p.bottom-1 && y<=p.top+1)) return true;
    return castlePhysics.flights.some(f=>{
        const width=f.width || (f.name==='grand-center'?7:f.name.startsWith('grand-')?4.5:f.name==='throne-dais'?4:3.6);
        return Math.abs(x-f.x)<=width/2+.3 && z>=Math.min(f.z0,f.z1)-.5 &&
            z<=Math.max(f.z0,f.z1)+.5 && y>=f.bottom-1 && y<=f.top+1;
    });
}

function canCastleStep(x,z,y) {
    if(!inCastleEnvelope(x,z) || onCastleTransition(x,z,y)) return true;
    return getGroundElevation(x,z,y)>=y-MAX_STEP_HEIGHT-.001;
}

function castleLookDirection(yaw,pitch) {
    return new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
}

function currentCastleRoom() {
    if(!playerGroup || !window.CASTLE_EXTENSION?.rooms) return null;
    const p=playerGroup.position,x=p.x+110,z=p.z-120;
    return CASTLE_EXTENSION.rooms.find(r=>Math.abs(p.y-r.floor)<.5 &&
        x>=r.minX && x<=r.maxX && z>=r.minZ && z<=r.maxZ);
}

function inSecretCellar(x, z) {
    return x > -125 && x < -113 && z > 114 && z < 138;
}
function inSecretOpening(x, z) {
    return x > -123.8 && x < -120.2 && z >= 120 && z <= 134;
}

function installCastleUpgrade() {
    const cg = castlePhysics.group;
    const data = window.CASTLE_EXTENSION;
    if (!data) throw new Error('Missing Blender castle extension');
    const obsoleteGuard=cg.getObjectByName('basement-west-guard');
    if(obsoleteGuard) {
        cg.remove(obsoleteGuard);
        castlePhysics.cameraObstacles=castlePhysics.cameraObstacles.filter(o=>o!==obsoleteGuard);
        for(let i=colliders.length-1;i>=0;i--) if(colliders[i].name==='basement-west-guard') colliders.splice(i,1);
    }
    // Replace the old narrow 9.5m landing with the Blender-authored full deck.
    const oldLanding=cg.getObjectByName('grand-landing');
    cg.remove(oldLanding);
    castlePhysics.cameraObstacles=castlePhysics.cameraObstacles.filter(o=>o!==oldLanding);
    const landingSurface=castleSurfaces.findIndex(s=>s.name==='grand-landing');
    if(landingSurface>=0) castleSurfaces.splice(landingSurface,1);
    for(let i=colliders.length-1;i>=0;i--) {
        const c=colliders[i];
        if(c.isStandable && c.type==='box' && c.minX===-126 && c.maxX===-94 &&
            c.minZ===130.9 && c.maxZ===132.4 && c.maxY===9.5) colliders.splice(i,1);
    }
    const palette = {
        stone: new THREE.MeshStandardMaterial({color:0x263449,roughness:.9}),
        gold: new THREE.MeshStandardMaterial({color:0xc4a64b,roughness:.7}),
        bullion: new THREE.MeshBasicMaterial({color:0xe8b449,toneMapped:false}),
        wood: new THREE.MeshStandardMaterial({color:0x492a22,roughness:.9}),
        glow: new THREE.MeshBasicMaterial({color:0x00e5d0}),
        steel: new THREE.MeshStandardMaterial({color:0xa8bdd1,metalness:.5,roughness:.4}),
        red: new THREE.MeshStandardMaterial({color:0x7e1730,roughness:.9}),
        dark: new THREE.MeshStandardMaterial({color:0x0b1320,roughness:.85}),
        pearl: new THREE.MeshStandardMaterial({color:0xe5ebfa,roughness:.32,metalness:.15}),
        lilac: new THREE.MeshStandardMaterial({color:0x8846ba,roughness:.45}),
        aqua: new THREE.MeshStandardMaterial({color:0x39cedb,emissive:0x087788,emissiveIntensity:.35,roughness:.35})
    };
    const pictureTexture=new THREE.TextureLoader().load('features/lobby/assets/background.jpg');pictureTexture.encoding=THREE.sRGBEncoding;
    const royalTexture=new THREE.TextureLoader().load('features/characters/assets/hamster_warrior.jpg');royalTexture.encoding=THREE.sRGBEncoding;
    const landscapeMaterial=new THREE.MeshBasicMaterial({map:pictureTexture,toneMapped:false});
    const portraitMaterial=new THREE.MeshBasicMaterial({map:royalTexture,toneMapped:false});
    palette.stone.map=cg.getObjectByName('hall-main').material.map;
    const floorMaterial=cg.getObjectByName('mezzanine-west').material;
    if(data.version>=5) {
        const oldFloor=name=>/^(hall-|mezzanine-|attic-(main|east)|grand-landing|legacy-stair)/.test(name);
        for(const mesh of [...cg.children]) {
            if(oldFloor(mesh.name) || (mesh.geometry?.type==='PlaneGeometry' && mesh.position.y===5.8)) {
                cg.remove(mesh);castlePhysics.cameraObstacles=castlePhysics.cameraObstacles.filter(o=>o!==mesh);
            }
        }
        for(let i=castleSurfaces.length-1;i>=0;i--)if(oldFloor(castleSurfaces[i].name))castleSurfaces.splice(i,1);
        for(let i=colliders.length-1;i>=0;i--)if(oldFloor(colliders[i].name||''))colliders.splice(i,1);
        castleStairGuards.length=0;
    }
    // Cut the actual foundation and floor, rather than hiding a stair under them.
    for (const mesh of [...cg.children]) {
        const g = mesh.geometry?.parameters;
        if (g && ((g.width===52 && g.height===1 && g.depth===56) ||
            (mesh.geometry.type==='PlaneGeometry' && g.width===38 && g.height===42 && mesh.position.y===1.02))) {
            cg.remove(mesh);
            castlePhysics.cameraObstacles = castlePhysics.cameraObstacles.filter(o=>o!==mesh);
            mesh.geometry.dispose();
        }
    }
    for (let i=castleSurfaces.length-1;i>=0;i--) {
        const s=castleSurfaces[i];
        if (s.name==='balcony-or-foundation' && s.y===1) castleSurfaces.splice(i,1);
    }
    function addPart(part) {
        const [x,y,z]=part.position, [w,h,d]=part.size;
        const material=part.name==='room-detail-painting-sky' ? landscapeMaterial : part.name==='furniture-portrait-canvas' ? portraitMaterial : part.name==='room-vault-ingot' ? palette.bullion :
            (part.name.startsWith('mezzanine-') || part.name.startsWith('landing-full-') || part.name.startsWith('floor-seal-') || part.name.startsWith('compact-floor-'))
            ? floorMaterial : palette[part.material];
        let geometry;
        if(part.vertices) {
            geometry=new THREE.BufferGeometry();
            geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flat(),3));
            geometry.setIndex(part.indices); geometry.computeVertexNormals();
        } else geometry=new THREE.BoxGeometry(w,h,d);
        const mesh=new THREE.Mesh(geometry,material);
        mesh.name=part.name; mesh.position.set(x,y,z); mesh.receiveShadow=true;
        mesh.visible=!part.collisionOnly;
        mesh.userData.partition=part.name.startsWith('room-') && !!part.solid;
        mesh.userData.compactStructure=part.name.startsWith('compact-');
        mesh.userData.interiorDetail=part.name.startsWith('room-') || (!part.solid && /^(armor-|armory-|dragon-|furniture-|prison-fixed-bar)/.test(part.name));
        if(mesh.userData.partition) mesh.userData.partitionFloor=[20,13,9.5,6,1,-5].find(f=>f<=y-h/2+.01);
        cg.add(mesh);
        if (part.solid) {
            const furniture=!!part.furniture || /^(armor-|armory-|dragon-)/.test(part.name);
            addBoxCollider(x-110,z+120,w,d,y-h/2,y+h/2,!!part.surface || furniture);
            colliders.at(-1).stepHeight=furniture ? 0.12 : MAX_STEP_HEIGHT;
            if(part.name.startsWith('compact-')) colliders.at(-1).supportPadding=.001;
            colliders.at(-1).furniture=furniture;
            colliders.at(-1).name=part.name;
            castlePhysics.cameraObstacles.push(mesh);
        }
        if (part.surface) castleSurfaces.push({name:part.name,minX:x-110-w/2,
            maxX:x-110+w/2,minZ:z+120-d/2,maxZ:z+120+d/2,y:y+h/2});
        return mesh;
    }
    // Four slabs leave an exact 3.6m-wide opening for the stairwell.
    for (const [x,z,w,d] of (data.version>=5?[]:[[-19.9,0,12.2,56],[7.9,0,36.2,56],[-12,-14,3.6,28],[-12,21,3.6,14]])) {
        addPart({name:'foundation-cut-slab',position:[x,.8,z],size:[w,.4,d],material:'stone',surface:true,solid:true});
    }
    // Remove moon terrain triangles intersecting the cellar's footprint. Ground
    // under the castle is replaced by the physical slabs and crypt floor above.
    const index=groundGeo.index;
    const positions=groundGeo.attributes.position;
    const kept=[];
    for (let i=0;i<index.count;i+=3) {
        const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];
        const xs=ids.map(v=>positions.getX(v)), zs=ids.map(v=>-positions.getY(v));
        if (Math.max(...xs)>-125 && Math.min(...xs)<-113 && Math.max(...zs)>114 && Math.min(...zs)<138) continue;
        kept.push(...ids);
    }
    groundGeo.setIndex(kept);
    const gateGroup=new THREE.Group(); gateGroup.name='InteractiveCastleGate'; cg.add(gateGroup);
    const unicornGroup=new THREE.Group();unicornGroup.name='LunarUnicorn';cg.add(unicornGroup);
    const leftGate=new THREE.Group(), rightGate=new THREE.Group();
    gateGroup.add(leftGate,rightGate);
    for(const side of [-1,1]){
        const group=new THREE.Group(),arm=new THREE.Group();group.name='CastleGuardNPC';
        arm.position.set(side*3.05+.23,castleBridgeTop(-110,92.2)+.58,-27.8);group.add(arm);cg.add(group);
        castleGatekeepers.push({side,group,arm});
    }
    for (const part of data.parts) {
        const mesh=addPart(part);
        if(part.gatekeeper){
            const guard=castleGatekeepers.find(g=>g.side===part.gatekeeper);
            if(part.guardArm){mesh.position.sub(guard.arm.position);guard.arm.add(mesh);}
            else guard.group.add(mesh);
        }
        if(part.name.startsWith('unicorn-')) unicornGroup.add(mesh);
        if (part.name.startsWith('gate-') && !part.name.startsWith('gate-throat-') && part.name!=='gate-upper-closure') (part.position[0]<=0?leftGate:rightGate).add(mesh);
    }
    // The legacy foundation's visual faces were 60 cm behind its collision
    // faces. Match the authored basement floor edges, hiding exterior terrain
    // and avoiding the black gap visible when looking along the front wall.
    for(const [x,z,w,d] of [[-18.7,0,.6,41.4],[18.7,0,.6,41.4],
                            [0,-20.7,38,.6],[0,20.7,38,.6]]) {
        addPart({name:'room-basement-lining',position:[x,3.5,z],size:[w,5,d],material:'stone',solid:true});
    }
    // Bake exhibit relief into one draw call per material. A whole suit does
    // not incur a separate draw call for every finger plate or dragon scale.
    const interiorBatches=new Map();
    const removedCameraMeshes=new Set();
    for(const mesh of [...cg.children]) {
        if((!mesh.userData.interiorDetail && !mesh.userData.compactStructure) || !mesh.visible) continue;
        const key=mesh.material.uuid+':'+(mesh.userData.compactStructure?'compact':mesh.userData.partition?mesh.userData.partitionFloor:'interiors');
        if(!interiorBatches.has(key)) interiorBatches.set(key,{material:mesh.material,meshes:[],partition:mesh.userData.partition,compact:mesh.userData.compactStructure});
        interiorBatches.get(key).meshes.push(mesh);
    }
    for(const {material,meshes,partition,compact} of interiorBatches.values()) {
        const positions=[],indices=[],uvs=[];
        for(const mesh of meshes) {
            const attr=mesh.geometry.attributes.position,offset=positions.length/3;
            const uv=mesh.geometry.attributes.uv;
            for(let i=0;i<attr.count;i++) {
                positions.push(attr.getX(i)+mesh.position.x,attr.getY(i)+mesh.position.y,attr.getZ(i)+mesh.position.z);
                uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);
            }
            const idx=mesh.geometry.index;
            for(let i=0;i<(idx?idx.count:attr.count);i++) indices.push(offset+(idx?idx.getX(i):i));
            cg.remove(mesh); mesh.geometry.dispose();
            if(partition || compact) removedCameraMeshes.add(mesh);
        }
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        const batch=new THREE.Mesh(geometry,material);
        batch.name=compact?'compact-structure-batch':partition?'room-wall-batch':'armory-detail-batch'; batch.receiveShadow=true; cg.add(batch);
        if(partition || compact) castlePhysics.cameraObstacles.push(batch);
    }
    castlePhysics.cameraObstacles=castlePhysics.cameraObstacles.filter(o=>!removedCameraMeshes.has(o));
    // Batch repeated relief and studs by material; retain solid door panels for
    // camera occlusion. Detailed doors still require only eight draw calls.
    for (const wing of [leftGate,rightGate]) {
        const batches=new Map();
        for (const mesh of [...wing.children]) {
            if (mesh.name==='gate-panel' || mesh.geometry.type!=='BoxGeometry') continue;
            if (!batches.has(mesh.material)) batches.set(mesh.material,[]);
            batches.get(mesh.material).push(mesh);
        }
        for (const [material,meshes] of batches) {
            const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,meshes.length);
            batch.name='gate-relief';
            const transform=new THREE.Object3D();
            meshes.forEach((mesh,i)=>{
                const g=mesh.geometry.parameters;
                transform.position.copy(mesh.position);
                transform.scale.set(g.width,g.height,g.depth); transform.updateMatrix();
                batch.setMatrixAt(i,transform.matrix);
                wing.remove(mesh); mesh.geometry.dispose();
            });
            wing.add(batch);
        }
    }
    const stair=data.stairs;
    if(data.compactStairs) {
        for(const plan of data.compactStairs) for(const f of plan.flights)
            castlePhysics.flights.push({...f,x:f.x-110,z0:f.z0+120,z1:f.z1+120});
    } else castlePhysics.flights.push({...stair,name:'secret-crypt',x:stair.x-110,z0:stair.z0+120,z1:stair.z1+120});
    // Existing decorative door leaves obstruct the new functional entrance.
    for (const mesh of [...cg.children]) {
        const g=mesh.geometry?.parameters;
        if (g?.width===.25 && g.height===5.5 && g.depth===2.8) {
            cg.remove(mesh);
            castlePhysics.cameraObstacles=castlePhysics.cameraObstacles.filter(o=>o!==mesh);
        }
    }
    for (let i=colliders.length-1;i>=0;i--) {
        if (colliders[i].type==='orientedBox') colliders.splice(i,1);
    }
    addBoxCollider(-111.75,94,3.56,.4,6,11.5);
    const leftCollider=colliders.at(-1);
    addBoxCollider(-108.25,94,3.56,.4,6,11.5);
    castleGate={group:gateGroup,leftGate,rightGate,leftCollider,rightCollider:colliders.at(-1),open:false,offset:0,guardAction:null};
    for(const guard of castleGatekeepers){
        colliders.push({type:'cylinder',x:-110+guard.side*3.05,z:92.2,radius:.23,minY:castleBridgeTop(-110,92.2),maxY:castleBridgeTop(-110,92.2)+.94,name:'castle-guard-npc'});
    }
    const unicornBody=unicornGroup.children.find(o=>o.name==='unicorn-body');
    unicornGroup.userData.sourceMeshCount=unicornGroup.children.length;
    const unicornBatches=new Map();
    for(const mesh of unicornGroup.children) {
        if(mesh===unicornBody) continue;
        if(!unicornBatches.has(mesh.material))unicornBatches.set(mesh.material,[]);
        unicornBatches.get(mesh.material).push(mesh);
    }
    for(const [material,meshes] of unicornBatches) {
        const vertices=[],indices=[];
        for(const mesh of meshes) {
            const positions=mesh.geometry.attributes.position,offset=vertices.length/3;
            for(let i=0;i<positions.count;i++)vertices.push(positions.getX(i)+mesh.position.x,positions.getY(i)+mesh.position.y,positions.getZ(i)+mesh.position.z);
            const index=mesh.geometry.index;
            for(let i=0;i<(index?index.count:positions.count);i++)indices.push(offset+(index?index.getX(i):i));
            unicornGroup.remove(mesh);mesh.geometry.dispose();
        }
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
        geometry.setIndex(indices);geometry.computeVertexNormals();
        const mesh=new THREE.Mesh(geometry,material);mesh.name='unicorn-detail-batch';unicornGroup.add(mesh);
    }
    lunarUnicorn={group:unicornGroup,body:unicornBody,time:0};
    addCylinderCollider(-107,102,.58,6,8.8);
    interactables.unshift({id:'lunar_unicorn',type:'lunar_unicorn',pos:new THREE.Vector3(-107,6,102),radius:2.1,prompt:'Làm quen kỳ lân Nguyệt Quang'});
    castlePhysics.cameraObstacles.push(...leftGate.children,...rightGate.children);
    // A stone hatch at the upper landing opens the secret stair entrance.
    const cryptPlan=data.compactStairs?.find(p=>p.name==='compact-crypt');
    const hatchX=cryptPlan?cryptPlan.flights[1].x:-12;
    const hatchZ=cryptPlan?cryptPlan.z-.35:13.55;
    const hatch=addPart({name:'secret-hatch',position:[hatchX,1.3,hatchZ],size:[cryptPlan?1.65:3.6,.6,.18],material:'wood',solid:true});
    secretHatch={mesh:hatch,collider:colliders.at(-1),open:false};
    interactables.unshift(
        {id:'castle_gate',type:'castle_gate',pos:new THREE.Vector3(-110,6,94),radius:3,prompt:'Mở cổng lâu đài'},
        {id:'secret_hatch',type:'secret_hatch',pos:new THREE.Vector3(hatchX-110,1,hatchZ+119.3),radius:1.5,prompt:'Mở lối xuống mật thất'},
        {id:'crypt_relic',type:'crypt_relic',pos:new THREE.Vector3(-116,-5,118),radius:1.8,prompt:'Khám phá cổ vật trong mật thất'}
    );
    if(data.prison) {
        const gate=data.prison.gate;
        const group=new THREE.Group();group.name='PrisonGate';cg.add(group);
        for(const mesh of [...cg.children])if(mesh.name.startsWith('prison-moving-'))group.add(mesh);
        addBoxCollider(gate.x-110,gate.z+120,gate.width,gate.depth,gate.bottom,gate.top);
        prisonState={group,collider:colliders.at(-1),open:false,offset:0,gate};
        castlePhysics.cameraObstacles.push(...group.children);
        interactables.unshift(
            {id:'prison_control',type:'prison_control',pos:new THREE.Vector3(data.prison.control[0]-110,-5,data.prison.control[2]+120),radius:1.5,prompt:'Nhấn nút mở / khóa nhà tù'},
            {id:'prison_emergency',type:'prison_emergency',pos:new THREE.Vector3(data.prison.emergency[0]-110,-5,data.prison.emergency[2]+120),radius:1.35,prompt:'Nút mở khẩn cấp từ trong buồng giam'});
    }
    interactables.unshift(
        {id:'dragon_sword_main',type:'dragon_display',pos:new THREE.Vector3(-105,1,121),radius:2.5,prompt:'Xem thanh kiếm Rồng Nguyệt Ảnh'},
        {id:'dragon_sword_crypt',type:'dragon_display',pos:new THREE.Vector3(-116,-5,122),radius:2.3,prompt:'Xem kiếm rồng trong mật thất'}
    );
    castlePhysics.colliderEnd=colliders.length;
    for(const c of colliders) {
        if(c.type==='box' && c.isStandable && c.stepHeight===undefined &&
            c.maxY-c.minY>.7 && c.maxY-c.minY<3 && c.maxX-c.minX<6 && c.maxZ-c.minZ<6) {
            c.furniture=true; c.stepHeight=.12;
        }
    }
    scene.updateMatrixWorld(true);
    rebuildCollisionGrid();
}

function recoverFromFurniture() {
    if(!playerGroup || !isGrounded) return false;
    const p=playerGroup.position,eps=.000001;
    const inside=[...nearbyColliders(p.x,p.z)].some(c=>c.furniture && !c.disabled &&
        p.y+PLAYER_HEIGHT>c.minY+eps && p.y<c.maxY-eps &&
        p.x+PLAYER_RADIUS>c.minX+eps && p.x-PLAYER_RADIUS<c.maxX-eps &&
        p.z+PLAYER_RADIUS>c.minZ+eps && p.z-PLAYER_RADIUS<c.maxZ-eps);
    if(!inside) return false;
    // If a load, teleport or landing starts inside a prop, find the nearest
    // clear point on the same level. Never move the player through a floor.
    for(let radius=.15;radius<=3;radius+=.15) {
        for(let angle=0;angle<24;angle++) {
            const x=p.x+Math.cos(angle*Math.PI/12)*radius;
            const z=p.z+Math.sin(angle*Math.PI/12)*radius;
            const y=getGroundElevation(x,z,p.y);
            if(Math.abs(y-p.y)<=MAX_STEP_HEIGHT && !checkCollision(x,z,y)) {
                p.set(x,y,z);currentGroundY=y;jumpY=0;return true;
            }
        }
    }
    return false;
}

function interactCastleUpgrade(item) {
    if(item.type==='prison_control' || item.type==='prison_emergency') {
        const p=playerGroup.position,g=prisonState.gate;
        if(prisonState.open && item.type!=='prison_emergency' && Math.abs(p.x-(g.x-110))<.7 && p.z>g.z+119 && p.z<g.z+123) {
            showNotification('Hãy rời khỏi ngưỡng song sắt trước khi khóa.');return true;
        }
        prisonState.open=item.type==='prison_emergency'?true:!prisonState.open;
        sfx.pickup();showNotification(prisonState.open?'🔓 Song sắt đã mở — có thể vào nhà tù.':'🔒 Đã kích hoạt khóa nhà tù.');return true;
    } else if(item.type==='lunar_unicorn') {
        lunarUnicorn.time=3;
        sfx.pickup();
        showNotification('🦄 Nguyệt Quang khẽ cúi đầu chào bạn. Bờm kỳ lân tỏa ánh sáng xanh tím dịu dàng.');
        return true;
    } else if(item.type==='dragon_display') {
        showNotification('Kiếm Rồng Nguyệt Ảnh — chuôi khắc đầu rồng, hộ thủ hình cánh rồng và lưỡi kiếm khảm Nguyệt Thạch.');
        return true;
    } else if (item.type==='castle_gate') {
        // Do not close onto a player standing in the threshold.
        if (castleGate.open && Math.abs(playerGroup.position.x+110)<3.7 && Math.abs(playerGroup.position.z-94)<.8) {
            showNotification('Hãy bước ra khỏi ngưỡng cổng trước khi đóng.'); return true;
        }
        if(castleGate.guardAction)return true;
        castleGate.guardAction={time:0,opening:!castleGate.open,item,latched:false};
    } else if (item.type==='secret_hatch') {
        if (secretHatch.open && Math.abs(playerGroup.position.x-(secretHatch.mesh.position.x-110))<2 && Math.abs(playerGroup.position.z-(secretHatch.mesh.position.z+120))<1) {
            showNotification('Hãy rời khỏi cửa hầm trước khi đóng.'); return true;
        }
        secretHatch.open=!secretHatch.open;
        secretHatch.mesh.visible=!secretHatch.open;
        secretHatch.collider.disabled=secretHatch.open;
        item.prompt=secretHatch.open?'Đóng cửa mật thất':'Mở lối xuống mật thất';
    } else if (item.type==='crypt_relic') {
        showNotification('Đã khám phá mật thất Nguyệt Thạch, sâu dưới hầm trú ẩn!'); return true;
    } else return false;
    hudPromptText.textContent=item.prompt;
    return true;
}

function updateCastleGate(dt) {
    if (!castleGate) return;
    const action=castleGate.guardAction;
    if(action){
        action.time+=dt;
        const reach=Math.min(1,action.time/.55)*Math.min(1,Math.max(0,(2.2-action.time)/.55));
        for(const guard of castleGatekeepers)guard.arm.rotation.x=-1.2*(reach*reach*(3-2*reach));
        if(action.time>=.55 && !action.latched){
            // Recheck the threshold at the actual closing instant.
            const blocked=!action.opening && Math.abs(playerGroup.position.x+110)<3.7 && Math.abs(playerGroup.position.z-94)<.8;
            if(!blocked)castleGate.open=action.opening;
            action.item.prompt=castleGate.open?'Đóng cổng lâu đài':'Mở cổng lâu đài';
            action.latched=true;
        }
        if(action.time>=2.2){castleGate.guardAction=null;for(const guard of castleGatekeepers)guard.arm.rotation.x=0;}
    }
    if(prisonState) {
        const target=prisonState.open?2:0;
        prisonState.offset+=Math.sign(target-prisonState.offset)*Math.min(Math.abs(target-prisonState.offset),dt*1.8);
        prisonState.group.position.z=prisonState.offset;
        prisonState.collider.minZ=prisonState.gate.z+120-prisonState.gate.depth/2+prisonState.offset;
        prisonState.collider.maxZ=prisonState.gate.z+120+prisonState.gate.depth/2+prisonState.offset;
        prisonState.group.updateMatrixWorld(true);
    }
    if(lunarUnicorn) {
        lunarUnicorn.time=Math.max(0,lunarUnicorn.time-dt);
        const t=performance.now()/1000;
        lunarUnicorn.body.scale.y=1+Math.sin(t*2)*.012;
        lunarUnicorn.group.position.y=lunarUnicorn.time>0?Math.sin(t*4)*.025:0;
    }
    if(!castleGate.open && castleGate.offset>0 && Math.abs(playerGroup.position.x+110)<3.7 && Math.abs(playerGroup.position.z-94)<.8){
        castleGate.open=true;
        const item=interactables.find(i=>i.type==='castle_gate');if(item)item.prompt='Đóng cổng lâu đài';
    }
    const target=castleGate.open?3.55:0;
    castleGate.offset += Math.sign(target-castleGate.offset)*Math.min(Math.abs(target-castleGate.offset),dt*3);
    castleGate.leftGate.position.x=-castleGate.offset;
    castleGate.rightGate.position.x=castleGate.offset;
    castleGate.leftCollider.minX=-113.53-castleGate.offset;
    castleGate.leftCollider.maxX=-109.97-castleGate.offset;
    castleGate.rightCollider.minX=-110.03+castleGate.offset;
    castleGate.rightCollider.maxX=-106.47+castleGate.offset;
    castleGate.group.updateMatrixWorld(true);
}

// World-space vertical motion: a lost support starts a fall, never snaps down.
function updatePlayerVertical(dt) {
    if(window.monsterSkills?.captured)return;
    if(window.riverRealm?.stunned){keys.jump=false;keys.swimUp=false;keys.dive=false;}
    if(window.crystalWings?.vertical(dt))return;
    if(window.playerSurvival?.vertical(dt))return;
    const p=playerGroup.position;
    const previous=p.y;
    const support=getGroundElevation(p.x,p.z,previous);
    if(isGrounded) {
        const onFloor=[-5,1,6,9.5,13,20].some(y=>Math.abs(y-p.y)<.03);
        if(onFloor && inCastleEnvelope(p.x,p.z) && Math.abs(support-p.y)<.03 && !checkCollision(p.x,p.z,p.y)) {
            castleSafeAnchor=p.clone();
        } else if(Math.abs(support-p.y)>.3 && castleSafeAnchor && castleSafeAnchor.distanceTo(p)>3) {
            castleSafeAnchor=null;
        }
    }
    if (isGrounded && support<previous-MAX_STEP_HEIGHT-.001) {
        isGrounded=false; jumpVelocityY=0;
    }
    if (keys.jump) {
        if (isGrounded && (!window.playerSurvival || playerSurvival.spend(12))) { jumpVelocityY=5.4; isGrounded=false; }
        keys.jump=false;
    }
    if (isGrounded) {
        p.y=support;
    } else {
        let next=previous+jumpVelocityY*dt+.5*gravity*dt*dt;
        jumpVelocityY+=gravity*dt;
        const ceiling=resolveCastleCeiling(p.x,p.z,previous,next);
        if (ceiling<next) { next=ceiling; jumpVelocityY=Math.min(0,jumpVelocityY); }
        // Horizontal movement up a slope can put the support slightly ABOVE
        // the previous feet position. Catch that crossing instead of falling
        // through the ramp forever after a running jump.
        if (jumpVelocityY<=0 && next<=support && previous>=support-MAX_STEP_HEIGHT-.001) {
            next=support; isGrounded=true; jumpVelocityY=0;
        }
        p.y=next;
    }
    if(castleSafeAnchor && inCastleEnvelope(p.x,p.z) && p.y<castleSafeAnchor.y-1.3 &&
        Math.hypot(p.x-castleSafeAnchor.x,p.z-castleSafeAnchor.z)<6 &&
        !onCastleTransition(p.x,p.z,p.y) &&
        !checkCollision(castleSafeAnchor.x,castleSafeAnchor.z,castleSafeAnchor.y)) {
        // Last resort for a jump into an inaccessible void. Normal stair travel
        // and free falling elsewhere retain their gravity-based movement.
        p.copy(castleSafeAnchor);isGrounded=true;jumpVelocityY=0;
    }
    window.romanArena?.safety();
    window.moonSafetyLayer?.catchFall();
    currentGroundY=p.y; jumpY=0;
}
