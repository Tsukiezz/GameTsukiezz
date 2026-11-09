const HERO_SKINS = {
    space_moon_ninja:{name:'Ninja Mặt Trăng Không Gian',theme:'Áo giáp tím bạc · Đoản đao trăng',detail:'Gấu trúc ninja với đôi mắt xanh tím, khăn hai dải và đoản đao lưỡi liềm.'},
    mars_robot:{name:'Robot Sao Hỏa',theme:'Giáp thám hiểm · Lõi hổ phách',detail:'Robot thám hiểm với vỏ gốm đỏ đất, kính đen, ăng-ten và bộ đẩy sau lưng.'},
    millennium_dragon:{name:'Chiến Binh Rồng Ngàn Năm',theme:'Ngọc bích · Vảy đồng',detail:'Rồng có sừng ngà, cánh ngọc bích, giáp lá đồng và khiên tròn.'},
    monkey_king:{name:'Tề Thiên Đại Thánh',theme:'Áo choàng đỏ · Gậy như ý',detail:'Mũ vàng gắn hai lông trĩ, giáp đỏ vàng, đuôi cuộn và gậy như ý.'},
    ocean_queen:{name:'Nữ Hoàng Đại Dương',theme:'Xà cừ · Đinh ba san hô',detail:'Nữ hoàng với tóc xanh như sóng, vương miện ngọc trai và đinh ba san hô.'}
};
const DEFAULT_HERO = 'space_moon_ninja';
const HERO_ALIASES = {hamster:DEFAULT_HERO,ninja_yinyang:DEFAULT_HERO,rabbit:'ocean_queen',dragon_knight:'millennium_dragon',kingkong:'monkey_king'};
const heroModels = new Map();
const collectionMeshes = new Map(), collectionMaterials = new Map();

function heroSkinId(type) {
    return Object.hasOwn(HERO_SKINS,type)?type:Object.hasOwn(HERO_ALIASES,type)?HERO_ALIASES[type]:null;
}
function heroSkinPortrait(type) {
    return 'features/characters/assets/cast/'+type+'.webp';
}
function collectionMesh(part) {
    const [bone,color,positions,normals,indices] = part;
    let geometry = collectionMeshes.get(part);
    if (!geometry) {
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
        geometry.setIndex(indices);
        collectionMeshes.set(part,geometry);
    }
    let material = collectionMaterials.get(color);
    if (!material) {
        const value = '#'+HERO_COLLECTION.colors[color], metallic = HERO_COLLECTION.metal.includes(color);
        material = new THREE.MeshStandardMaterial({
            color:value,roughness:metallic?.38:.58,metalness:metallic?.45:.05,
            emissive:HERO_COLLECTION.glow.includes(color)?value:0,emissiveIntensity:.52
        });
        collectionMaterials.set(color,material);
    }
    const mesh = new THREE.Mesh(geometry,material);
    mesh.name = bone+'_'+color;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
function mountCollectionParts(type,bones) {
    const parts = [];
    for (const part of HERO_COLLECTION.models[type]) {
        const joint = bones[part[0]];
        if (!joint) continue;
        const mesh = collectionMesh(part);
        joint.add(mesh);
        parts.push(mesh);
    }
    return parts;
}
function buildCollectionModel(type,articulated=true) {
    const model = new THREE.Group(), bones = {root:model};
    model.name = type;
    if (articulated) {
        for (const [name,[parent,origin]] of Object.entries(HERO_COLLECTION.rig)) {
            if (!parent) continue;
            const node = new THREE.Group();
            node.name = name;
            node.position.fromArray(origin).sub(new THREE.Vector3(...HERO_COLLECTION.rig[parent][1]));
            bones[parent].add(node);
            bones[name] = node;
        }
        bones.weapon = new THREE.Group();
        bones.weapon.name = 'SkinWeapon';
        bones.weapon.userData.defaultWeapon = true;
        bones.hand_R.add(bones.weapon);
        const rightGrip = new THREE.Group();
        rightGrip.name = 'RightGrip';
        rightGrip.position.z = .04;
        bones.hand_R.add(rightGrip);
        model.userData.rightGrip = rightGrip;
        model.limbs = {
            body:bones.body,head:bones.head,cape:bones.cape,tail:bones.tail,
            leftArm:bones.arm_L,rightArm:bones.arm_R,leftElbow:bones.forearm_L,rightElbow:bones.forearm_R,
            leftHand:bones.hand_L,rightHand:bones.hand_R,leftLeg:bones.leg_L,rightLeg:bones.leg_R,
            leftKnee:bones.shin_L,rightKnee:bones.shin_R,leftFoot:bones.foot_L,rightFoot:bones.foot_R
        };
        model.swordArm = bones.arm_R;
    }
    model.userData.bones = bones;
    mountCollectionParts(type,bones);
    return model;
}

function applyHeroSelection(type) {
    const id = heroSkinId(type);
    if (!id) return false;
    const previous = heroModels.get(activeHeroType);
    if (previous) {
        resetHeroAnimation(previous);
        playerGroup.remove(previous);
    }
    if (!heroModels.has(id)) {
        const model = buildCollectionModel(id);
        registerHeroAnimation(model);
        heroModels.set(id,model);
    }
    const model = heroModels.get(id);
    resetHeroAnimation(model);
    activeHeroType = id;
    playerGroup.add(model);
    activeWeaponArm = model.swordArm;
    activeLimbs = model.limbs;
    heroMoveDirection?.set(0,0,0);
    window.heroMotion?.reset();
    for (const element of ['home-hero-name','hud-name']) document.getElementById(element).textContent = HERO_SKINS[id].name;
    for (const element of ['home-hero-avatar','hud-avatar-icon']) {
        const image = new Image();
        image.src = heroSkinPortrait(id);
        image.alt = '';
        image.className = 'current-skin-portrait';
        document.getElementById(element).replaceChildren(image);
    }
    document.getElementById('hud-attack-name').textContent = 'Đánh cận chiến';
    window.playerExperience?.sync();
    return true;
}
