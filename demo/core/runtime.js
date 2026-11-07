/* Generated cooperative initialization; global bindings remain in runtime-state.js. */
window.gameBoot.initialization=window.gameBoot.initialize(async function initializeGame(){
await window.gameBoot.checkpoint(0,1875,"Chuẩn bị thế giới",1);
canvas = document.getElementById('webgl-canvas');

await window.gameBoot.checkpoint(1,1875,"Chuẩn bị thế giới",1);
scene = new THREE.Scene();

await window.gameBoot.checkpoint(2,1875,"Chuẩn bị thế giới",1);
scene.background = new THREE.Color(0x050814);

await window.gameBoot.checkpoint(3,1875,"Chuẩn bị thế giới",1);
scene.fog = new THREE.FogExp2(0x080e22, 0.0030);

await window.gameBoot.checkpoint(4,1875,"Chuẩn bị thế giới",1);
camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);

await window.gameBoot.checkpoint(5,1875,"Chuẩn bị thế giới",1);
renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', precision: 'highp' });

await window.gameBoot.checkpoint(6,1875,"Chuẩn bị thế giới",1);
renderer.setSize(window.innerWidth, window.innerHeight);

await window.gameBoot.checkpoint(7,1875,"Chuẩn bị thế giới",1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));

await window.gameBoot.checkpoint(8,1875,"Chuẩn bị thế giới",1);
renderer.shadowMap.enabled = true;

await window.gameBoot.checkpoint(9,1875,"Chuẩn bị thế giới",1);
renderer.shadowMap.type = THREE.PCFShadowMap;

await window.gameBoot.checkpoint(10,1875,"Chuẩn bị thế giới",1);
window.scene = scene;

await window.gameBoot.checkpoint(11,1875,"Chuẩn bị thế giới",1);
window.renderer = renderer;

await window.gameBoot.checkpoint(12,1875,"Chuẩn bị thế giới",1);
window.camera = camera;

await window.gameBoot.checkpoint(13,1875,"Chuẩn bị thế giới",1);
dynamicLights = [];

await window.gameBoot.checkpoint(14,1875,"Chuẩn bị thế giới",1);
window.dynamicLights = dynamicLights;

await window.gameBoot.checkpoint(15,1875,"Chuẩn bị thế giới",1);
ambientLight = new THREE.AmbientLight(0x28385e, 1.4);

await window.gameBoot.checkpoint(16,1875,"Chuẩn bị thế giới",1);
scene.add(ambientLight);

await window.gameBoot.checkpoint(17,1875,"Chuẩn bị thế giới",1);
moonLight = new THREE.DirectionalLight(0xa5d8ff, 2.0);

await window.gameBoot.checkpoint(18,1875,"Chuẩn bị thế giới",1);
moonLight.position.set(60, 120, -70);

await window.gameBoot.checkpoint(19,1875,"Chuẩn bị thế giới",1);
moonLight.castShadow = true;

await window.gameBoot.checkpoint(20,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.mapSize.width = 1024;

await window.gameBoot.checkpoint(21,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.mapSize.height = 1024;

await window.gameBoot.checkpoint(22,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.near = 10;

await window.gameBoot.checkpoint(23,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.far = 320;

await window.gameBoot.checkpoint(24,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.left = -110;

await window.gameBoot.checkpoint(25,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.right = 110;

await window.gameBoot.checkpoint(26,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.top = 110;

await window.gameBoot.checkpoint(27,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.camera.bottom = -110;

await window.gameBoot.checkpoint(28,1875,"Chuẩn bị thế giới",1);
moonLight.shadow.bias = -0.0005;

await window.gameBoot.checkpoint(29,1875,"Chuẩn bị thế giới",1);
scene.add(moonLight);

await window.gameBoot.checkpoint(30,1875,"Chuẩn bị thế giới",1);
cyanRimLight = new THREE.DirectionalLight(0x00f5d4, 0.9);

await window.gameBoot.checkpoint(31,1875,"Chuẩn bị thế giới",1);
cyanRimLight.position.set(-80, 40, 80);

await window.gameBoot.checkpoint(32,1875,"Chuẩn bị thế giới",1);
scene.add(cyanRimLight);

await window.gameBoot.checkpoint(33,1875,"Chuẩn bị thế giới",1);
planetGroup = new THREE.Group();

await window.gameBoot.checkpoint(34,1875,"Chuẩn bị thế giới",1);
planetGeo = new THREE.SphereGeometry(36, 48, 36);

await window.gameBoot.checkpoint(35,1875,"Chuẩn bị thế giới",1);
planetMat = new THREE.MeshBasicMaterial({ color: 0xebf4ff });

await window.gameBoot.checkpoint(36,1875,"Chuẩn bị thế giới",1);
planetMesh = new THREE.Mesh(planetGeo, planetMat);

await window.gameBoot.checkpoint(37,1875,"Chuẩn bị thế giới",1);
planetGroup.add(planetMesh);

await window.gameBoot.checkpoint(38,1875,"Chuẩn bị thế giới",1);
ringGeo = new THREE.RingGeometry(46, 75, 64);

await window.gameBoot.checkpoint(39,1875,"Chuẩn bị thế giới",1);
ringMat = new THREE.MeshBasicMaterial({ color: 0x9be8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

await window.gameBoot.checkpoint(40,1875,"Chuẩn bị thế giới",1);
ringMesh = new THREE.Mesh(ringGeo, ringMat);

await window.gameBoot.checkpoint(41,1875,"Chuẩn bị thế giới",1);
ringMesh.rotation.x = Math.PI * 0.42;

await window.gameBoot.checkpoint(42,1875,"Chuẩn bị thế giới",1);
ringMesh.rotation.y = Math.PI * 0.15;

await window.gameBoot.checkpoint(43,1875,"Chuẩn bị thế giới",1);
planetGroup.add(ringMesh);

await window.gameBoot.checkpoint(44,1875,"Chuẩn bị thế giới",1);
planetGroup.position.set(90, 160, -260);

await window.gameBoot.checkpoint(45,1875,"Chuẩn bị thế giới",1);
scene.add(planetGroup);

await window.gameBoot.checkpoint(46,1875,"Chuẩn bị thế giới",1);
starGeo = new THREE.BufferGeometry();

await window.gameBoot.checkpoint(47,1875,"Chuẩn bị thế giới",1);
starCount = 1500;

await window.gameBoot.checkpoint(48,1875,"Chuẩn bị thế giới",1);
starCoords = new Float32Array(starCount * 3);

await window.gameBoot.checkpoint(49,1875,"Chuẩn bị thế giới",1);
for(let i = 0; i < starCount * 3; i += 3) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            starCoords[i] = (Math.random() - 0.5) * EXPANDED_REALM_DATA.size*1.4;
            starCoords[i+1] = Math.random() * 250 + 40;
            starCoords[i+2] = (Math.random() - 0.5) * EXPANDED_REALM_DATA.size*1.4;
        }

await window.gameBoot.checkpoint(50,1875,"Chuẩn bị thế giới",1);
starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));

await window.gameBoot.checkpoint(51,1875,"Chuẩn bị thế giới",1);
stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.9 }));

await window.gameBoot.checkpoint(52,1875,"Chuẩn bị thế giới",1);
scene.add(stars);

await window.gameBoot.checkpoint(53,1875,"Chuẩn bị thế giới",1);
matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 });

await window.gameBoot.checkpoint(54,1875,"Chuẩn bị thế giới",1);
matSteel = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.9, roughness: 0.25 });

await window.gameBoot.checkpoint(55,1875,"Chuẩn bị thế giới",1);
matCapeRed = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.65, side: THREE.DoubleSide });

await window.gameBoot.checkpoint(56,1875,"Chuẩn bị thế giới",1);
matRobePurple = new THREE.MeshStandardMaterial({ color: 0x2d0b59, roughness: 0.6, side: THREE.DoubleSide });

await window.gameBoot.checkpoint(57,1875,"Chuẩn bị thế giới",1);
matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.5, roughness: 0.2 });

await window.gameBoot.checkpoint(58,1875,"Chuẩn bị thế giới",1);
matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.5, roughness: 0.2 });

await window.gameBoot.checkpoint(59,1875,"Chuẩn bị thế giới",1);
matGreenGlow = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 2.2, roughness: 0.2 });

await window.gameBoot.checkpoint(60,1875,"Chuẩn bị thế giới",1);
moonTexture = createLunarSurfaceTexture();

await window.gameBoot.checkpoint(61,1875,"Chuẩn bị thế giới",1);
moonTexture.repeat.set(48,48);

await window.gameBoot.checkpoint(62,1875,"Chuẩn bị thế giới",1);
groundGeo = new THREE.PlaneGeometry(EXPANDED_REALM_DATA.size, EXPANDED_REALM_DATA.size, EXPANDED_REALM_DATA.segments, EXPANDED_REALM_DATA.segments);

await window.gameBoot.checkpoint(63,1875,"Chuẩn bị thế giới",1);
posAttr = groundGeo.attributes.position;

await window.gameBoot.checkpoint(64,1875,"Chuẩn bị thế giới",1);
for(let i = 0; i < posAttr.count; i++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const vx = posAttr.getX(i);
            const vy = posAttr.getY(i);
            const distCenter = Math.sqrt(vx*vx + vy*vy);
            let zOffset = 0;
            if (distCenter > 175) {
                zOffset = Math.sin(vx * 0.03) * Math.cos(vy * 0.03) * 3.8;
            } else {
                zOffset = Math.sin(vx * 0.015) * Math.cos(vy * 0.015) * 0.12;
            }
            posAttr.setZ(i, realmTerrainHeight(vx,-vy));
            const arenaTerrainRadius=Math.hypot((vx-115)/1.15,(-vy-110)/.9);
            if(arenaTerrainRadius<50)posAttr.setZ(i,zOffset*Math.max(0,(arenaTerrainRadius-43)/7));
        }

await window.gameBoot.checkpoint(65,1875,"Chuẩn bị thế giới",1);
groundGeo.computeVertexNormals();

await window.gameBoot.checkpoint(66,1875,"Chuẩn bị thế giới",1);
groundMat = new THREE.MeshStandardMaterial({
            map: moonTexture,
            color: 0x8a99ad,
            roughness: 0.78,
            metalness: 0.18,
            emissive: 0x0f172a,
            emissiveIntensity: 0.25
        });

await window.gameBoot.checkpoint(67,1875,"Chuẩn bị thế giới",1);
ground = new THREE.Mesh(groundGeo, groundMat);

await window.gameBoot.checkpoint(68,1875,"Chuẩn bị thế giới",1);
ground.rotation.x = -Math.PI / 2;

await window.gameBoot.checkpoint(69,1875,"Chuẩn bị thế giới",1);
ground.receiveShadow = true;

await window.gameBoot.checkpoint(70,1875,"Chuẩn bị thế giới",1);
scene.add(ground);

await window.gameBoot.checkpoint(71,1875,"Chuẩn bị thế giới",1);
matLunarRock = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.2 });

await window.gameBoot.checkpoint(72,1875,"Chuẩn bị thế giới",1);
matMoonCrystal = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.2 });

await window.gameBoot.checkpoint(73,1875,"Chuẩn bị thế giới",1);
rockBaseGeo = new THREE.DodecahedronGeometry(1.0, 0);

await window.gameBoot.checkpoint(74,1875,"Chuẩn bị thế giới",1);
instancedRocks = new THREE.InstancedMesh(rockBaseGeo, matLunarRock, 35);

await window.gameBoot.checkpoint(75,1875,"Chuẩn bị thế giới",1);
instancedRocks.instanceMatrix.setUsage(THREE.StaticDrawUsage);

await window.gameBoot.checkpoint(76,1875,"Chuẩn bị thế giới",1);
crystalSpireGeo = new THREE.ConeGeometry(0.35, 2.2, 5);

await window.gameBoot.checkpoint(77,1875,"Chuẩn bị thế giới",1);
instancedSpires = new THREE.InstancedMesh(crystalSpireGeo, matMoonCrystal, 12);

await window.gameBoot.checkpoint(78,1875,"Chuẩn bị thế giới",1);
instancedSpires.instanceMatrix.setUsage(THREE.StaticDrawUsage);

await window.gameBoot.checkpoint(79,1875,"Chuẩn bị thế giới",1);
dummyProp = new THREE.Object3D();

await window.gameBoot.checkpoint(80,1875,"Chuẩn bị thế giới",1);
spireCount = 0;

await window.gameBoot.checkpoint(81,1875,"Chuẩn bị thế giới",1);
for (let rk = 0; rk < 35; rk++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const rkAngle = rk * 1.83;
            const rkDist = 28 + (rk * 17) % 190;
            const rx = Math.cos(rkAngle) * rkDist;
            const rz = Math.sin(rkAngle) * rkDist;
            const rockScale = 0.8 + (rk % 4) * 0.4;

            // Boulder instance
            dummyProp.position.set(rx, 0.4 * rockScale, rz);
            dummyProp.rotation.set(rk, rk * 0.5, rk * 0.8);
            dummyProp.scale.set(rockScale, rockScale, rockScale);
            dummyProp.updateMatrix();
            instancedRocks.setMatrixAt(rk, dummyProp.matrix);

            // Crystal spire instance beside boulder
            if (rk % 3 === 0 && spireCount < 12) {
                dummyProp.position.set(rx + 1.2, 1.1, rz + 0.8);
                dummyProp.rotation.set(0.15, rk, -0.2);
                dummyProp.scale.set(1, 1, 1);
                dummyProp.updateMatrix();
                instancedSpires.setMatrixAt(spireCount++, dummyProp.matrix);
            }
        }

await window.gameBoot.checkpoint(82,1875,"Chuẩn bị thế giới",1);
instancedRocks.instanceMatrix.needsUpdate = true;

await window.gameBoot.checkpoint(83,1875,"Chuẩn bị thế giới",1);
instancedSpires.instanceMatrix.needsUpdate = true;

await window.gameBoot.checkpoint(84,1875,"Chuẩn bị thế giới",1);
instancedRocks.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(85,1875,"Chuẩn bị thế giới",1);
instancedSpires.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(86,1875,"Chuẩn bị thế giới",1);
scene.add(instancedRocks);

await window.gameBoot.checkpoint(87,1875,"Chuẩn bị thế giới",1);
scene.add(instancedSpires);

await window.gameBoot.checkpoint(88,1875,"Chuẩn bị thế giới",1);
crystalRoadSegments = [];

await window.gameBoot.checkpoint(89,1875,"Chuẩn bị thế giới",1);
crystalPylonLights = [];

await window.gameBoot.checkpoint(90,1875,"Chuẩn bị thế giới",1);
matCrystalRoad = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.72,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true,
            opacity: 0.92
        });

await window.gameBoot.checkpoint(91,1875,"Chuẩn bị thế giới",1);
matCrystalRuneCenter = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0xa855f7,
            emissiveIntensity: 2.2,
            roughness: 0.1
        });

await window.gameBoot.checkpoint(92,1875,"Chuẩn bị thế giới",1);
matCrystalCurb = new THREE.MeshStandardMaterial({
            color: 0x00f5d4,
            emissive: 0x00f5d4,
            emissiveIntensity: 1.6,
            roughness: 0.25,
            metalness: 0.4
        });

await window.gameBoot.checkpoint(93,1875,"Chuẩn bị thế giới",1);
matPylonPost = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.7 });

await window.gameBoot.checkpoint(94,1875,"Chuẩn bị thế giới",1);
allHighwayPylons = [];

await window.gameBoot.checkpoint(95,1875,"Chuẩn bị thế giới",1);
plazaGroup = new THREE.Group();

await window.gameBoot.checkpoint(96,1875,"Chuẩn bị thế giới",1);
plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 16.0, 0.35, 28), matCrystalRoad);

await window.gameBoot.checkpoint(97,1875,"Chuẩn bị thế giới",1);
plazaBase.position.y = 0.18;

await window.gameBoot.checkpoint(98,1875,"Chuẩn bị thế giới",1);
plazaBase.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(99,1875,"Chuẩn bị thế giới",1);
plazaBase.updateMatrix();

await window.gameBoot.checkpoint(100,1875,"Chuẩn bị thế giới",1);
plazaGroup.add(plazaBase);

await window.gameBoot.checkpoint(101,1875,"Chuẩn bị thế giới",1);
plazaRuneRing = new THREE.Mesh(new THREE.RingGeometry(9.0, 10.6, 28), matCrystalRuneCenter);

await window.gameBoot.checkpoint(102,1875,"Chuẩn bị thế giới",1);
plazaRuneRing.rotation.x = -Math.PI / 2;

await window.gameBoot.checkpoint(103,1875,"Chuẩn bị thế giới",1);
plazaRuneRing.position.y = 0.38;

await window.gameBoot.checkpoint(104,1875,"Chuẩn bị thế giới",1);
plazaRuneRing.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(105,1875,"Chuẩn bị thế giới",1);
plazaRuneRing.updateMatrix();

await window.gameBoot.checkpoint(106,1875,"Chuẩn bị thế giới",1);
plazaGroup.add(plazaRuneRing);

await window.gameBoot.checkpoint(107,1875,"Chuẩn bị thế giới",1);
plazaInnerRing = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.2, 28), matCrystalCurb);

await window.gameBoot.checkpoint(108,1875,"Chuẩn bị thế giới",1);
plazaInnerRing.rotation.x = -Math.PI / 2;

await window.gameBoot.checkpoint(109,1875,"Chuẩn bị thế giới",1);
plazaInnerRing.position.y = 0.38;

await window.gameBoot.checkpoint(110,1875,"Chuẩn bị thế giới",1);
plazaInnerRing.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(111,1875,"Chuẩn bị thế giới",1);
plazaInnerRing.updateMatrix();

await window.gameBoot.checkpoint(112,1875,"Chuẩn bị thế giới",1);
plazaGroup.add(plazaInnerRing);

await window.gameBoot.checkpoint(113,1875,"Chuẩn bị thế giới",1);
for (let p = 0; p < 8; p++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const pAng = p * (Math.PI * 2 / 8);
            const px = Math.cos(pAng) * 14.8;
            const pz = Math.sin(pAng) * 14.8;
            allHighwayPylons.push({ x: px, y: 1.1, z: pz, shardY: 2.6, isCyan: (p % 2 === 0) });
        }

await window.gameBoot.checkpoint(114,1875,"Chuẩn bị thế giới",1);
centralPlazaLight = new THREE.PointLight(0x00f5d4, 2.2, 24);

await window.gameBoot.checkpoint(115,1875,"Chuẩn bị thế giới",1);
centralPlazaLight.position.set(0, 2.8, 0);

await window.gameBoot.checkpoint(116,1875,"Chuẩn bị thế giới",1);
plazaGroup.add(centralPlazaLight);

await window.gameBoot.checkpoint(117,1875,"Chuẩn bị thế giới",1);
registerDynamicLight(centralPlazaLight, 75);

await window.gameBoot.checkpoint(118,1875,"Chuẩn bị thế giới",1);
plazaGroup.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(119,1875,"Chuẩn bị thế giới",1);
plazaGroup.updateMatrix();

await window.gameBoot.checkpoint(120,1875,"Chuẩn bị thế giới",1);
scene.add(plazaGroup);

await window.gameBoot.checkpoint(121,1875,"Chuẩn bị thế giới",1);
pylonPostGeo = new THREE.CylinderGeometry(0.2, 0.28, 1.8, 8);

await window.gameBoot.checkpoint(122,1875,"Chuẩn bị thế giới",1);
instancedPylonPosts = new THREE.InstancedMesh(pylonPostGeo, matPylonPost, allHighwayPylons.length);

await window.gameBoot.checkpoint(123,1875,"Chuẩn bị thế giới",1);
instancedPylonPosts.instanceMatrix.setUsage(THREE.StaticDrawUsage);

await window.gameBoot.checkpoint(124,1875,"Chuẩn bị thế giới",1);
cyanPylons = allHighwayPylons.filter(p => p.isCyan);

await window.gameBoot.checkpoint(125,1875,"Chuẩn bị thế giới",1);
purplePylons = allHighwayPylons.filter(p => !p.isCyan);

await window.gameBoot.checkpoint(126,1875,"Chuẩn bị thế giới",1);
shardGeo = new THREE.IcosahedronGeometry(0.36, 1);

await window.gameBoot.checkpoint(127,1875,"Chuẩn bị thế giới",1);
instancedCyanShards = new THREE.InstancedMesh(shardGeo, matCyanGlow, cyanPylons.length);

await window.gameBoot.checkpoint(128,1875,"Chuẩn bị thế giới",1);
instancedPurpleShards = new THREE.InstancedMesh(shardGeo, matPurpleGlow, purplePylons.length);

await window.gameBoot.checkpoint(129,1875,"Chuẩn bị thế giới",1);
instancedCyanShards.instanceMatrix.setUsage(THREE.StaticDrawUsage);

await window.gameBoot.checkpoint(130,1875,"Chuẩn bị thế giới",1);
instancedPurpleShards.instanceMatrix.setUsage(THREE.StaticDrawUsage);

await window.gameBoot.checkpoint(131,1875,"Chuẩn bị thế giới",1);
dummyPylon = new THREE.Object3D();

await window.gameBoot.checkpoint(132,1875,"Chuẩn bị thế giới",1);
allHighwayPylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.y, p.z);
            dummyPylon.rotation.set(0, 0, 0);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedPylonPosts.setMatrixAt(idx, dummyPylon.matrix);
        });

await window.gameBoot.checkpoint(133,1875,"Chuẩn bị thế giới",1);
instancedPylonPosts.instanceMatrix.needsUpdate = true;

await window.gameBoot.checkpoint(134,1875,"Chuẩn bị thế giới",1);
instancedPylonPosts.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(135,1875,"Chuẩn bị thế giới",1);
scene.add(instancedPylonPosts);

await window.gameBoot.checkpoint(136,1875,"Chuẩn bị thế giới",1);
cyanPylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.shardY, p.z);
            dummyPylon.rotation.set(0.12, (idx * 0.4), -0.12);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedCyanShards.setMatrixAt(idx, dummyPylon.matrix);
        });

await window.gameBoot.checkpoint(137,1875,"Chuẩn bị thế giới",1);
instancedCyanShards.instanceMatrix.needsUpdate = true;

await window.gameBoot.checkpoint(138,1875,"Chuẩn bị thế giới",1);
instancedCyanShards.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(139,1875,"Chuẩn bị thế giới",1);
scene.add(instancedCyanShards);

await window.gameBoot.checkpoint(140,1875,"Chuẩn bị thế giới",1);
purplePylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.shardY, p.z);
            dummyPylon.rotation.set(-0.12, (idx * 0.4), 0.12);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedPurpleShards.setMatrixAt(idx, dummyPylon.matrix);
        });

await window.gameBoot.checkpoint(141,1875,"Chuẩn bị thế giới",1);
instancedPurpleShards.instanceMatrix.needsUpdate = true;

await window.gameBoot.checkpoint(142,1875,"Chuẩn bị thế giới",1);
instancedPurpleShards.matrixAutoUpdate = false;

await window.gameBoot.checkpoint(143,1875,"Chuẩn bị thế giới",1);
scene.add(instancedPurpleShards);

await window.gameBoot.checkpoint(144,1875,"Chuẩn bị thế giới",1);
playerGroup = new THREE.Group();

await window.gameBoot.checkpoint(145,1875,"Chuẩn bị thế giới",1);
playerGroup.position.set(0, 0, 10);

await window.gameBoot.checkpoint(146,1875,"Chuẩn bị thế giới",1);
playerGroup.scale.set(0.2, 0.36, 0.2);

await window.gameBoot.checkpoint(147,1875,"Chuẩn bị thế giới",1);
scene.add(playerGroup);

await window.gameBoot.checkpoint(148,1875,"Chuẩn bị thế giới",1);
footShadowGeo = new THREE.CircleGeometry(0.72, 24);

await window.gameBoot.checkpoint(149,1875,"Chuẩn bị thế giới",1);
footShadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 });

await window.gameBoot.checkpoint(150,1875,"Chuẩn bị thế giới",1);
footContactShadow = new THREE.Mesh(footShadowGeo, footShadowMat);

await window.gameBoot.checkpoint(151,1875,"Chuẩn bị thế giới",1);
footContactShadow.rotation.x = -Math.PI / 2;

await window.gameBoot.checkpoint(152,1875,"Chuẩn bị thế giới",1);
footContactShadow.position.y = 0.02;

await window.gameBoot.checkpoint(153,1875,"Chuẩn bị thế giới",1);
playerGroup.add(footContactShadow);

await window.gameBoot.checkpoint(154,1875,"Chuẩn bị thế giới",1);
magicAuraRingGeo = new THREE.RingGeometry(0.68, 0.88, 28);

await window.gameBoot.checkpoint(155,1875,"Chuẩn bị thế giới",1);
magicAuraRingMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.55, side: THREE.DoubleSide });

await window.gameBoot.checkpoint(156,1875,"Chuẩn bị thế giới",1);
magicAuraRing = new THREE.Mesh(magicAuraRingGeo, magicAuraRingMat);

await window.gameBoot.checkpoint(157,1875,"Chuẩn bị thế giới",1);
magicAuraRing.rotation.x = -Math.PI / 2;

await window.gameBoot.checkpoint(158,1875,"Chuẩn bị thế giới",1);
magicAuraRing.position.y = 0.03;

await window.gameBoot.checkpoint(159,1875,"Chuẩn bị thế giới",1);
playerGroup.add(magicAuraRing);

await window.gameBoot.checkpoint(160,1875,"Chuẩn bị thế giới",1);
playerSpotLight = new THREE.PointLight(0x00f5d4, 1.35, 6.5);

await window.gameBoot.checkpoint(161,1875,"Chuẩn bị thế giới",1);
playerSpotLight.position.set(0, 1.2, 0);

await window.gameBoot.checkpoint(162,1875,"Chuẩn bị thế giới",1);
playerGroup.add(playerSpotLight);

await window.gameBoot.checkpoint(163,1875,"Chuẩn bị thế giới",1);
crownGroup = new THREE.Group();

await window.gameBoot.checkpoint(164,1875,"Chuẩn bị thế giới",1);
crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 }));

await window.gameBoot.checkpoint(165,1875,"Chuẩn bị thế giới",1);
crownGroup.add(crownBase);

await window.gameBoot.checkpoint(166,1875,"Chuẩn bị thế giới",1);
for (let cr = 0; cr < 5; cr++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const crAng = cr * (Math.PI * 2 / 5);
            const peak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 }));
            peak.position.set(Math.cos(crAng) * 0.45, 0.25, Math.sin(crAng) * 0.45);
            crownGroup.add(peak);
        }

await window.gameBoot.checkpoint(167,1875,"Chuẩn bị thế giới",1);
crownGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 2.2 }));

await window.gameBoot.checkpoint(168,1875,"Chuẩn bị thế giới",1);
crownGem.position.set(0, 0.22, 0);

await window.gameBoot.checkpoint(169,1875,"Chuẩn bị thế giới",1);
crownGroup.add(crownGem);

await window.gameBoot.checkpoint(170,1875,"Chuẩn bị thế giới",1);
crownGroup.position.set(0, 2.2, 0);

await window.gameBoot.checkpoint(171,1875,"Chuẩn bị thế giới",1);
crownGroup.visible = false;

await window.gameBoot.checkpoint(172,1875,"Chuẩn bị thế giới",1);
playerGroup.add(crownGroup);

await window.gameBoot.checkpoint(173,1875,"Chuẩn bị thế giới",1);
footstepParticles = [];

await window.gameBoot.checkpoint(174,1875,"Chuẩn bị thế giới",1);
stepParticleGeo = new THREE.RingGeometry(0.08, 0.18, 12);

await window.gameBoot.checkpoint(175,1875,"Chuẩn bị thế giới",1);
stepParticleMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.8, side: THREE.DoubleSide });

await window.gameBoot.checkpoint(176,1875,"Chuẩn bị thế giới",1);
for (let sp = 0; sp < 18; sp++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const pMesh = new THREE.Mesh(stepParticleGeo, stepParticleMat.clone());
            pMesh.rotation.x = -Math.PI / 2;
            pMesh.visible = false;
            scene.add(pMesh);
            footstepParticles.push({ mesh: pMesh, life: 0, maxLife: 0.65 });
        }

await window.gameBoot.checkpoint(177,1875,"Chuẩn bị thế giới",1);
particleIdx = 0;

await window.gameBoot.checkpoint(178,1875,"Chuẩn bị thế giới",1);
activeHeroType = 'hamster';

await window.gameBoot.checkpoint(179,1875,"Chuẩn bị thế giới",1);
hamsterVisualGroup = null;

await window.gameBoot.checkpoint(180,1875,"Chuẩn bị thế giới",1);
rabbitVisualGroup = null;

await window.gameBoot.checkpoint(181,1875,"Chuẩn bị thế giới",1);
activeWeaponArm = null;

await window.gameBoot.checkpoint(182,1875,"Chuẩn bị thế giới",1);
activeLimbs = null;

await window.gameBoot.checkpoint(183,1875,"Chuẩn bị thế giới",1);
dragonVisualGroup = buildDragonKnightModel();

await window.gameBoot.checkpoint(184,1875,"Chuẩn bị thế giới",1);
kingkongVisualGroup = buildKingKongModel();

await window.gameBoot.checkpoint(185,1875,"Chuẩn bị thế giới",1);
ninjaVisualGroup = buildNinjaYinYangModel();

await window.gameBoot.checkpoint(186,1875,"Chuẩn bị thế giới",1);
hamsterVisualGroup = buildHamsterModel();

await window.gameBoot.checkpoint(187,1875,"Chuẩn bị thế giới",1);
rabbitVisualGroup = buildRabbitModel();

await window.gameBoot.checkpoint(188,1875,"Chuẩn bị thế giới",1);
for(const model of [hamsterVisualGroup,rabbitVisualGroup,dragonVisualGroup,kingkongVisualGroup,ninjaVisualGroup]){if(window.gameBoot.shouldYield())await window.gameBoot.yield();registerHeroAnimation(model);}

await window.gameBoot.checkpoint(189,1875,"Chuẩn bị thế giới",1);
playerGroup.add(hamsterVisualGroup);

await window.gameBoot.checkpoint(190,1875,"Chuẩn bị thế giới",1);
activeWeaponArm = hamsterVisualGroup.swordArm;

await window.gameBoot.checkpoint(191,1875,"Chuẩn bị thế giới",1);
activeLimbs = hamsterVisualGroup.limbs;

await window.gameBoot.checkpoint(192,1875,"Chuẩn bị thế giới",1);
colliders = [];

await window.gameBoot.checkpoint(193,1875,"Chuẩn bị thế giới",1);
castleSurfaces = [];

await window.gameBoot.checkpoint(194,1875,"Chuẩn bị thế giới",1);
castleStairGuards = [];

await window.gameBoot.checkpoint(195,1875,"Chuẩn bị thế giới",1);
PLAYER_RADIUS = 0.20;

await window.gameBoot.checkpoint(196,1875,"Chuẩn bị thế giới",1);
PLAYER_HEIGHT = 1.17;

await window.gameBoot.checkpoint(197,1875,"Chuẩn bị thế giới",1);
MAX_STEP_HEIGHT = 0.30;

await window.gameBoot.checkpoint(198,1875,"Chuẩn bị thế giới",1);
castleCameraRay = new THREE.Raycaster();

await window.gameBoot.checkpoint(199,1875,"Chuẩn bị thế giới",1);
interactables = [];

await window.gameBoot.checkpoint(200,1875,"Chuẩn bị thế giới",1);
landmarksData = [
            { name: "Đền Thần Điện Tsuventure", x: 0, z: 0, color: "#00f5d4", icon: "🏛️" },
            // Retain the old journal index without exposing a retired destination.
            { id:'retired_castle',name:'Đồng Nguyệt Quang',x:-110,z:120,color:'#7eb4a8',icon:'☾',hidden:true,retired:true },
            { name: "Đấu Trường La Mã", x: 115, z: 110, color: "#ff4d6d", icon: "⚔️" },
            { name: "Hồ Thủy Ngân — Vực Tĩnh Lặng", x: -370, z: -430, color: "#93c5fd", icon: "🌊" },
            { id:'ancient_tree',name: "Rừng Nguyên Sinh", x: 202, z: -206, color: "#4ade80", icon: "🌳",hidden:true },
            { id:'evil_cavern',name: "Hang Tà Thần", x: 125, z: -110, color: "#81758c", icon: "🕳" },
        ];

await window.gameBoot.checkpoint(201,1875,"Chuẩn bị thế giới",1);
monolith = new THREE.Group();

await window.gameBoot.checkpoint(202,1875,"Chuẩn bị thế giới",1);
monolith.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.0), matSteel));

await window.gameBoot.checkpoint(203,1875,"Chuẩn bị thế giới",1);
pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x2d3a4f, roughness: 0.9 }));

await window.gameBoot.checkpoint(204,1875,"Chuẩn bị thế giới",1);
pillar.position.y = 2.25;

await window.gameBoot.checkpoint(205,1875,"Chuẩn bị thế giới",1);
monolith.add(pillar);

await window.gameBoot.checkpoint(206,1875,"Chuẩn bị thế giới",1);
rune = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.8), matCyanGlow);

await window.gameBoot.checkpoint(207,1875,"Chuẩn bị thế giới",1);
rune.position.set(0, 2.4, 0.46);

await window.gameBoot.checkpoint(208,1875,"Chuẩn bị thế giới",1);
monolith.add(rune);

await window.gameBoot.checkpoint(209,1875,"Chuẩn bị thế giới",1);
scene.add(monolith);

await window.gameBoot.checkpoint(210,1875,"Chuẩn bị thế giới",1);
addCylinderCollider(0, 0, 1.8);

await window.gameBoot.checkpoint(211,1875,"Chuẩn bị thế giới",1);
interactables.push({
            id: 'monolith',
            pos: new THREE.Vector3(0, 0, 0),
            radius: 6.5,
            prompt: 'Lắng nghe Bia Đá Thì Thầm',
            type: 'npc'
        });

await window.gameBoot.checkpoint(212,1875,"Chuẩn bị thế giới",1);
castleAnimators = [];

await window.gameBoot.checkpoint(213,1875,"Chuẩn bị thế giới",1);
window.castleAnimators = castleAnimators;

await window.gameBoot.checkpoint(214,1875,"Chuẩn bị khu vực khám phá",8);
await installRemovedCastle();

await window.gameBoot.checkpoint(222,1875,"Dựng sông hồ và hệ sinh thái",8);
await installMercuryLake();

await window.gameBoot.checkpoint(230,1875,"Chuẩn bị khu vực khám phá",8);
await installAncientGrove();

await window.gameBoot.checkpoint(238,1875,"Chuẩn bị thế giới",1);
floraColors = [matCyanGlow, matPurpleGlow, matGreenGlow];

await window.gameBoot.checkpoint(239,1875,"Chuẩn bị thế giới",1);
floraBladeBins = [[], [], []];

await window.gameBoot.checkpoint(240,1875,"Chuẩn bị thế giới",1);
floraSporeBins = [[], [], []];

await window.gameBoot.checkpoint(241,1875,"Chuẩn bị thế giới",1);
dummyFlora = new THREE.Object3D();

await window.gameBoot.checkpoint(242,1875,"Chuẩn bị thế giới",1);
[
            [-110, 120], [115, 110], [-145, -35], [-45, -115],
            [145, 30], [125, -110], [-120, -125]
        ].forEach(([tx, tz]) => {
            for (let s = 1; s <= 12; s++) {
                const ratio = s / 13;
                const rx = tx * ratio + (Math.random() - 0.5) * 6.5;
                const rz = tz * ratio + (Math.random() - 0.5) * 6.5;
                queueMutantClump(rx, rz, 0.8 + Math.random() * 0.6);
            }
        });

await window.gameBoot.checkpoint(243,1875,"Chuẩn bị thế giới",1);
landmarksData.forEach(lm => {
            for (let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                queueMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });

await window.gameBoot.checkpoint(244,1875,"Chuẩn bị thế giới",1);
baseFloraBladeGeo = new THREE.ConeGeometry(0.08, 1.8, 4);

await window.gameBoot.checkpoint(245,1875,"Chuẩn bị thế giới",1);
baseFloraSporeGeo = new THREE.IcosahedronGeometry(0.22, 1);

await window.gameBoot.checkpoint(246,1875,"Chuẩn bị thế giới",1);
for (let col = 0; col < 3; col++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const blades = floraBladeBins[col];
            if (blades.length > 0) {
                const instBlades = new THREE.InstancedMesh(baseFloraBladeGeo, floraColors[col], blades.length);
                instBlades.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                for (let i = 0; i < blades.length; i++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
                    instBlades.setMatrixAt(i, blades[i]);
                }
                instBlades.instanceMatrix.needsUpdate = true;
                instBlades.matrixAutoUpdate = false;
                instBlades.name='LegacyFlora_Blades';
                instBlades.userData.optionalFlora = true;
                scene.add(instBlades);
            }

            const spores = floraSporeBins[col];
            if (spores.length > 0) {
                const instSpores = new THREE.InstancedMesh(baseFloraSporeGeo, floraColors[col], spores.length);
                instSpores.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                for (let i = 0; i < spores.length; i++) {if(window.gameBoot.shouldYield())await window.gameBoot.yield();
                    instSpores.setMatrixAt(i, spores[i]);
                }
                instSpores.instanceMatrix.needsUpdate = true;
                instSpores.matrixAutoUpdate = false;
                instSpores.name='LegacyFlora_Spores';
                instSpores.userData.optionalFlora = true;
                scene.add(instSpores);
            }
        }

await window.gameBoot.checkpoint(247,1875,"Chuẩn bị thế giới",1);
beaconGroups = [];

await window.gameBoot.checkpoint(248,1875,"Chuẩn bị thế giới",1);
interactables.forEach((item, idx) => {
            // The unicorn's silhouette and glowing horn are its own marker.
            if (['lunar_unicorn','prison_control','prison_emergency','colosseum','arena_ticket','arena_vip_gate','arena_warrior_gate'].includes(item.type)) return;
            if(!isUsefulInteraction(item))return;
            if(item.type==='dragon_display' || item.type==='tree' || item.type==='mercury_lake') return;
            const bg = new THREE.Group();

            // Glowing Torus Rune Ring
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.4, 0.12, 12, 28),
                new THREE.MeshStandardMaterial({
                    color: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    emissive: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    emissiveIntensity: 2.2,
                    roughness: 0.1
                })
            );
            ring.rotation.x = Math.PI / 2;
            bg.add(ring);

            // Floating rotating star diamond glyph
            const diamond = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.55, 0),
                new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 2.4
                })
            );
            bg.add(diamond);

            // Vertical downward starlight beam
            const beam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.35, 2.6, 8),
                new THREE.MeshBasicMaterial({
                    color: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    transparent: true,
                    opacity: 0.35
                })
            );
            beam.position.y = -1.3;
            bg.add(beam);

            bg.position.set(item.pos.x, item.pos.y + 2.8, item.pos.z);
            scene.add(bg);
            beaconGroups.push({ group: bg, ring, diamond, item, baseY: item.pos.y + 2.8 });
        });

await window.gameBoot.checkpoint(249,1875,"Chuẩn bị thế giới",1);
minimapCanvas = document.getElementById('minimap-canvas');

await window.gameBoot.checkpoint(250,1875,"Chuẩn bị thế giới",1);
minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

await window.gameBoot.checkpoint(251,1875,"Chuẩn bị thế giới",1);
gameState = {
            isPlaying: false,
            hasTalkedToMonolith: false,
            shardsCollected: 0,
            hasKey: false,
            gateUnlocked: false,
            inDialogue: false,
            health:250,maxHealth:250,armor:0,maxArmor:0
        };

await window.gameBoot.checkpoint(252,1875,"Chuẩn bị thế giới",1);
homeScreen = document.getElementById('home-screen');

await window.gameBoot.checkpoint(253,1875,"Chuẩn bị thế giới",1);
gameHud = document.getElementById('game-hud');

await window.gameBoot.checkpoint(254,1875,"Chuẩn bị thế giới",1);
hudPrompt = document.getElementById('hud-prompt');

await window.gameBoot.checkpoint(255,1875,"Chuẩn bị thế giới",1);
hudPromptText = document.getElementById('hud-prompt-text');

await window.gameBoot.checkpoint(256,1875,"Chuẩn bị thế giới",1);
hudToast = document.getElementById('hud-toast');

await window.gameBoot.checkpoint(257,1875,"Chuẩn bị thế giới",1);
hudDialogue = document.getElementById('hud-dialogue-modal');

await window.gameBoot.checkpoint(258,1875,"Chuẩn bị thế giới",1);
hudVictory = document.getElementById('hud-victory-modal');

await window.gameBoot.checkpoint(259,1875,"Chuẩn bị thế giới",1);
dialogueLines = [
            "Hỡi Người Bảo Hộ Anh Hùng! Ngươi cuối cùng đã thức tỉnh dưới ánh trăng bạc...",
            "Vương quốc Tsuventure đã chìm trong giấc ngủ ngàn năm bởi kết giới bóng tối.",
            "Khám phá kim tự tháp và trụ sở công nghệ; chế tạo thuyền để phiêu lưu trên sông!",
            "Nhấn [E] để tương tác với từng công trình và đánh thức nguồn sức mạnh cổ xưa!"
        ];

await window.gameBoot.checkpoint(260,1875,"Chuẩn bị thế giới",1);
dIdx = 0;

await window.gameBoot.checkpoint(261,1875,"Chuẩn bị thế giới",1);
dInterval = null;

await window.gameBoot.checkpoint(262,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-dialogue-advance').addEventListener('click', advanceDialogue);

await window.gameBoot.checkpoint(263,1875,"Chuẩn bị thế giới",1);
keys = { forward: false, backward: false, left: false, right: false, shift: false, jump: false,swimUp:false,dive:false };

await window.gameBoot.checkpoint(264,1875,"Chuẩn bị thế giới",1);
window.addEventListener('keydown', (e) => {
            if(e.defaultPrevented || !gameState.isPlaying || document.querySelector('.modal-overlay.active') || e.target?.closest?.('button,summary,input,textarea,select'))return;
            const k = e.key.toLowerCase();
            if((e.ctrlKey||e.key==='Control')&&window.playerSurvival?.swimming)e.preventDefault();
            if (k === 'w' || e.key === 'ArrowUp') keys.forward = true;
            if (k === 's' || e.key === 'ArrowDown') keys.backward = true;
            if (k === 'a' || e.key === 'ArrowLeft') keys.left = true;
            if (k === 'd' || e.key === 'ArrowRight') keys.right = true;
            if (e.key === 'Shift') keys.shift = true;
            if(k==='q'||e.key==='Control')keys.dive=true;
            if (e.key === ' ' || k === 'space') {
                e.preventDefault();keys.swimUp=true;
                if (gameState.inDialogue) advanceDialogue();
                else if (gameState.isPlaying) keys.jump = true;
            }
            if (k === 'e' && gameState.isPlaying && !e.repeat) { if(window.riverBoat?.aboard){if(window.treeWood?.nearest())treeWood.harvest();else riverBoat.disembark();}else{checkInteractables(); handleInteraction();} }
            if ((e.code === 'Digit1' || e.code === 'Numpad1' || k === '1') && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey && !gameState.inDialogue) { e.preventDefault(); window.explorationUpdate?.toggleView(); }
            if (k === 'j' && gameState.isPlaying) triggerAttack();
            if (k === 'c' && gameState.isPlaying && !gameState.inDialogue) toggleSitting();
        });

await window.gameBoot.checkpoint(265,1875,"Chuẩn bị thế giới",1);
window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') keys.forward = false;
            if (k === 's' || e.key === 'ArrowDown') keys.backward = false;
            if (k === 'a' || e.key === 'ArrowLeft') keys.left = false;
            if (k === 'd' || e.key === 'ArrowRight') keys.right = false;
            if (e.key === 'Shift') keys.shift = false;
            if(e.key===' ')keys.swimUp=false;
            if(k==='q'||e.key==='Control')keys.dive=false;
        });

await window.gameBoot.checkpoint(266,1875,"Chuẩn bị thế giới",1);
isRightMouseDown = false;

await window.gameBoot.checkpoint(267,1875,"Chuẩn bị thế giới",1);
mouseLastX = 0;

await window.gameBoot.checkpoint(268,1875,"Chuẩn bị thế giới",1);
mouseLastY = 0;

await window.gameBoot.checkpoint(269,1875,"Chuẩn bị thế giới",1);
camYaw = 0;

await window.gameBoot.checkpoint(270,1875,"Chuẩn bị thế giới",1);
camPitch = 0.38;

await window.gameBoot.checkpoint(271,1875,"Chuẩn bị thế giới",1);
camDistance = 3.4;

await window.gameBoot.checkpoint(272,1875,"Chuẩn bị thế giới",1);
isSitting = false;

await window.gameBoot.checkpoint(273,1875,"Chuẩn bị thế giới",1);
isPointerLocked = false;

await window.gameBoot.checkpoint(274,1875,"Chuẩn bị thế giới",1);
document.addEventListener('pointerlockchange', () => {
            isPointerLocked = (document.pointerLockElement === document.body || document.pointerLockElement === renderer.domElement);
            if (!isPointerLocked) {
                isRightMouseDown = false;
            }
        });

await window.gameBoot.checkpoint(275,1875,"Chuẩn bị thế giới",1);
window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

await window.gameBoot.checkpoint(276,1875,"Chuẩn bị thế giới",1);
window.addEventListener('mousedown', (e) => {
            if(e.target?.closest?.('button,a,input,textarea,select,summary,.modal-overlay,#game-hud')&&!isPointerLocked)return;
            if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
            if(e.button===2){e.preventDefault();if(!window.grandTerminal?.dispatch?.pointAt(e))window.gameMouse?.capture();}
            else if(e.button===0)triggerAttack();
        });

await window.gameBoot.checkpoint(277,1875,"Chuẩn bị thế giới",1);
window.addEventListener('mousemove',e=>{
            if(!isPointerLocked||!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
            camYaw-=e.movementX*.0035;camPitch=THREE.MathUtils.clamp(camPitch+e.movementY*.003,-1.25,1.25);
        });

await window.gameBoot.checkpoint(278,1875,"Chuẩn bị thế giới",1);
window.addEventListener('wheel', (e) => {
            if(e.target?.closest?.('#game-hud,.modal-overlay'))return;
            if (gameState.isPlaying) {
                if(window.moonRailway?.aboard){moonRailway.zoomBy(e.deltaY*.025);return;}
                camDistance = Math.max(0, Math.min(24.0, camDistance + e.deltaY * 0.008));
            }
        }, { passive: true });

await window.gameBoot.checkpoint(279,1875,"Chuẩn bị thế giới",1);
isAttacking = false;

await window.gameBoot.checkpoint(280,1875,"Chuẩn bị thế giới",1);
heroAttackElapsed = 0;

await window.gameBoot.checkpoint(281,1875,"Chuẩn bị thế giới",1);
nearbyItem = null;

await window.gameBoot.checkpoint(282,1875,"Chuẩn bị thế giới",1);
speedBuffTimer = 0;

await window.gameBoot.checkpoint(283,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-play-game').addEventListener('click', enterGame);

await window.gameBoot.checkpoint(284,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-open-heroes').addEventListener('click', () => openModal('modal-heroes'));

await window.gameBoot.checkpoint(285,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-preview-hero').addEventListener('click', () => openModal('modal-heroes'));

await window.gameBoot.checkpoint(286,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-open-settings').addEventListener('click', () => openModal('modal-settings'));

await window.gameBoot.checkpoint(287,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-return-home').addEventListener('click', returnToHome);

await window.gameBoot.checkpoint(288,1875,"Chuẩn bị thế giới",1);
graphicsProfiles = {
            low:{name:'M\u01b0\u1ee3t',tag:'M\u01af\u1ee2T',pixelRatio:.65,shadows:false,shadowMapSize:256,lightDistance:0,fogDensity:.009,drawDistance:280},
            balanced:{name:'Trung B\u00ecnh',tag:'TRUNG B\u00ccNH',pixelRatio:Math.min(devicePixelRatio,1),shadows:false,shadowMapSize:1024,lightDistance:95,fogDensity:.0035,drawDistance:900},
            ultra:{name:'Cao',tag:'CAO',pixelRatio:Math.min(devicePixelRatio,1.5),shadows:true,shadowMapSize:2048,lightDistance:160,fogDensity:.0018,drawDistance:2200}
        };

await window.gameBoot.checkpoint(289,1875,"Chuẩn bị thế giới",1);
currentProfileKey = 'low';

await window.gameBoot.checkpoint(290,1875,"Chuẩn bị thế giới",1);
adaptiveRatio = 0.6;

await window.gameBoot.checkpoint(291,1875,"Chuẩn bị thế giới",1);
slowSamples = 0;

await window.gameBoot.checkpoint(292,1875,"Chuẩn bị thế giới",1);
fastSamples = 0;

await window.gameBoot.checkpoint(293,1875,"Chuẩn bị thế giới",1);
try {
            const saved = localStorage.getItem('tsukiezz_graphics_profile');
            if(saved==='potato')currentProfileKey='low';else if(saved&&graphicsProfiles[saved])currentProfileKey=saved;
        } catch(e) {}

await window.gameBoot.checkpoint(294,1875,"Chuẩn bị thế giới",1);
window.setGraphicsProfile = setGraphicsProfile;

await window.gameBoot.checkpoint(295,1875,"Chuẩn bị thế giới",1);
setGraphicsProfile(currentProfileKey);

await window.gameBoot.checkpoint(296,1875,"Chuẩn bị thế giới",1);
document.getElementById('btn-audio-toggle').addEventListener('click', (e) => {
            sfx.init();
            sfx.muted = !sfx.muted;
            e.target.textContent = sfx.muted ? '🔇' : '🔊';
        });

await window.gameBoot.checkpoint(297,1875,"Chuẩn bị thế giới",1);
currentGroundY = 0;

await window.gameBoot.checkpoint(298,1875,"Chuẩn bị thế giới",1);
jumpY = 0;

await window.gameBoot.checkpoint(299,1875,"Chuẩn bị thế giới",1);
jumpVelocityY = 0;

await window.gameBoot.checkpoint(300,1875,"Chuẩn bị thế giới",1);
gravity = -24.0;

await window.gameBoot.checkpoint(301,1875,"Chuẩn bị thế giới",1);
isGrounded = true;

await window.gameBoot.checkpoint(302,1875,"Chuẩn bị thế giới",1);
walkCycle = 0;

await window.gameBoot.checkpoint(303,1875,"Chuẩn bị thế giới",1);
heroMoveDirection = new THREE.Vector3();

await window.gameBoot.checkpoint(304,1875,"Chuẩn bị thế giới",1);
clock = new THREE.Clock();

await window.gameBoot.checkpoint(305,1875,"Chuẩn bị thế giới",1);
frameCount = 0;

await window.gameBoot.checkpoint(306,1875,"Chuẩn bị thế giới",1);
fpsFrames = 0;

await window.gameBoot.checkpoint(307,1875,"Chuẩn bị thế giới",1);
fpsLastTime = performance.now();

await window.gameBoot.checkpoint(308,1875,"Chuẩn bị thế giới",1);
window.addEventListener('resize', () => {
            applyRenderResolution();
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

await window.gameBoot.checkpoint(309,1875,"Chuẩn bị giao diện hành trình",8);
await installGameHUD();

await window.gameBoot.checkpoint(317,1875,"Chuẩn bị thế giới",1);
window.ancientGrove?.refreshButton();

await window.gameBoot.checkpoint(318,1875,"Chuẩn bị khu vực khám phá",8);
await installMoonUnderlayer();

await window.gameBoot.checkpoint(326,1875,"Dựng sông hồ và hệ sinh thái",8);
await installLakeMonsters();

await window.gameBoot.checkpoint(334,1875,"Chuẩn bị khu vực khám phá",8);
await installPlayerSurvival();

await window.gameBoot.checkpoint(342,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installForestGuardian();

await window.gameBoot.checkpoint(350,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installForestWildlife();

await window.gameBoot.checkpoint(358,1875,"Chuẩn bị khu vực khám phá",8);
await installHeroMotion();

await window.gameBoot.checkpoint(366,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installBackpack();

await window.gameBoot.checkpoint(374,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installCrystalWings();

await window.gameBoot.checkpoint(382,1875,"Chuẩn bị khu vực khám phá",8);
await installBachKhuyet();

await window.gameBoot.checkpoint(390,1875,"Dựng sông hồ và hệ sinh thái",8);
await installThermalRiver();

await window.gameBoot.checkpoint(398,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installMonsterSkills();

await window.gameBoot.checkpoint(406,1875,"Chuẩn bị khu vực khám phá",8);
await installEvilCavern();

await window.gameBoot.checkpoint(414,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installSolarFlashlight();

await window.gameBoot.checkpoint(422,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installTempleSupplies();

await window.gameBoot.checkpoint(430,1875,"Chuẩn bị khu vực khám phá",8);
await installVolcanicValley();

await window.gameBoot.checkpoint(438,1875,"Chuẩn bị khu vực khám phá",8);
await installVolcanicDragonFlight();

await window.gameBoot.checkpoint(446,1875,"Dựng sông hồ và hệ sinh thái",8);
await installMangroveRealm();

await window.gameBoot.checkpoint(454,1875,"Chuẩn bị khu vực khám phá",8);
await installMapVisualRepair();

await window.gameBoot.checkpoint(462,1875,"Dựng địa hình và các vùng đất",8);
await installTerrainContinuity();

await window.gameBoot.checkpoint(470,1875,"Chuẩn bị khu vực khám phá",8);
await installSouthernExpansion();

await window.gameBoot.checkpoint(478,1875,"Chuẩn bị khu vực khám phá",8);
await installArenaRelocation();

await window.gameBoot.checkpoint(486,1875,"Dựng địa hình và các vùng đất",8);
await installDesertRealm();

await window.gameBoot.checkpoint(494,1875,"Dựng địa hình và các vùng đất",8);
await installAntarcticRealm();

await window.gameBoot.checkpoint(502,1875,"Chuẩn bị khu vực khám phá",8);
await installTechnologyBase();

await window.gameBoot.checkpoint(510,1875,"Dựng địa hình và các vùng đất",8);
await installCandyRealm();

await window.gameBoot.checkpoint(518,1875,"Chuẩn bị khu vực khám phá",8);
await installMoonveilPalace();

await window.gameBoot.checkpoint(526,1875,"Chuẩn bị khu vực khám phá",8);
await installWesternVillages();

await window.gameBoot.checkpoint(534,1875,"Dựng đường đi và mạng đường sắt",900);
await installMoonRailway();
await installGrandTerminal();

await window.gameBoot.checkpoint(1434,1875,"Dựng địa hình và các vùng đất",8);
await installWorldSurfaceSync();

await window.gameBoot.checkpoint(1442,1875,"Chuẩn bị thế giới",1);
moonRailway.mountainBridges=finishMountainRailBridges(moonRailway);

await window.gameBoot.checkpoint(1443,1875,"Dựng đường đi và mạng đường sắt",8);
await installHighlandTrails();

await window.gameBoot.checkpoint(1451,1875,"Chuẩn bị khu vực khám phá",8);
await installWesternNature();

await window.gameBoot.checkpoint(1459,1875,"Chuẩn bị thế giới",1);
worldExpansion.rebuildWater();

await window.gameBoot.checkpoint(1460,1875,"Chuẩn bị thế giới",1);
antarcticRealm.finishTerrainArt();

await window.gameBoot.checkpoint(1461,1875,"Chuẩn bị thế giới",1);
desertRealm.connectStation();

await window.gameBoot.checkpoint(1462,1875,"Chuẩn bị thế giới",1);
romanArena.connectStation();

await window.gameBoot.checkpoint(1463,1875,"Dựng sông hồ và hệ sinh thái",8);
await installRiverBoat();

await window.gameBoot.checkpoint(1471,1875,"Chuẩn bị khu vực khám phá",8);
await installNinjaAbilities();

await window.gameBoot.checkpoint(1479,1875,"Dựng địa hình và các vùng đất",8);
await installLivingWorld();

await window.gameBoot.checkpoint(1487,1875,"Chuẩn bị khu vực khám phá",8);
await installPlayerLife();

await window.gameBoot.checkpoint(1495,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installSnowQueen();

await window.gameBoot.checkpoint(1503,1875,"Dựng sông hồ và hệ sinh thái",8);
await installAquaticEcology();

await window.gameBoot.checkpoint(1511,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installPolarEcology();

await window.gameBoot.checkpoint(1519,1875,"Chuẩn bị khu vực khám phá",8);
await installSnowCrystals();

await window.gameBoot.checkpoint(1527,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installSantaGifts();

await window.gameBoot.checkpoint(1535,1875,"Chuẩn bị thế giới",1);
antarcticRealm.attachTravel();

await window.gameBoot.checkpoint(1536,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installTreeWood();

await window.gameBoot.checkpoint(1544,1875,"Chuẩn bị khu vực khám phá",8);
await installConstructionZones();

await window.gameBoot.checkpoint(1552,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installMonsterCamps();

await window.gameBoot.checkpoint(1560,1875,"Chuẩn bị khu vực khám phá",8);
await installFoodPickups();

await window.gameBoot.checkpoint(1568,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installCandyProvisions();

await window.gameBoot.checkpoint(1576,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installInventoryLayout();

await window.gameBoot.checkpoint(1584,1875,"Chuẩn bị khu vực khám phá",8);
await installHeroStatSync();

await window.gameBoot.checkpoint(1592,1875,"Chuẩn bị thế giới",1);
window.mercuryLake?.finishShore?.();

await window.gameBoot.checkpoint(1593,1875,"Chuẩn bị giao diện hành trình",8);
await installLibraryPreviews();

await window.gameBoot.checkpoint(1601,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installCreatureRefresh();

await window.gameBoot.checkpoint(1609,1875,"Chuẩn bị giao diện hành trình",8);
await installFieldGuide();

await window.gameBoot.checkpoint(1617,1875,"Chuẩn bị khu vực khám phá",8);
await installLunarBiome();

await window.gameBoot.checkpoint(1625,1875,"Dựng địa hình và các vùng đất",25);
await installLunarSurfaceFinish();

await window.gameBoot.checkpoint(1650,1875,"Chuẩn bị thế giới",1);
rebuildCollisionGrid();

await window.gameBoot.checkpoint(1651,1875,"Dựng địa hình và các vùng đất",65);
await installRealmTransitUpdate();

await window.gameBoot.checkpoint(1716,1875,"Dựng đường đi và mạng đường sắt",8);
await installStationMobility();

await window.gameBoot.checkpoint(1724,1875,"Chuẩn bị khu vực khám phá",8);
await installVoidDistrict();

await window.gameBoot.checkpoint(1732,1875,"Chuẩn bị khu vực khám phá",8);
await installCaveTreasury();

await window.gameBoot.checkpoint(1740,1875,"Chuẩn bị khu vực khám phá",8);
await installRageArmor();

await window.gameBoot.checkpoint(1748,1875,"Dựng địa hình và các vùng đất",8);
await installWorldWeather();

await window.gameBoot.checkpoint(1756,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installInventoryWorkspace();

await window.gameBoot.checkpoint(1764,1875,"Dựng địa hình và các vùng đất",8);
await installWorldResidents();

await window.gameBoot.checkpoint(1772,1875,"Dựng địa hình và các vùng đất",8);
await installTerrainTraversal();

await window.gameBoot.checkpoint(1780,1875,"Chuẩn bị khu vực khám phá",8);
await installExplorationUpdate();

await window.gameBoot.checkpoint(1788,1875,"Chuẩn bị vật phẩm và kho đồ",8);
await installWorkshopUpdate();
await installGearService();
await installTreasureSupplies();
await installGiftCode();

await window.gameBoot.checkpoint(1796,1875,"Chuẩn bị khu vực khám phá",35);
await installGraphicsQuality();

await window.gameBoot.checkpoint(1831,1875,"Chuẩn bị khu vực khám phá",8);
await installPlayerExperience();

await window.gameBoot.checkpoint(1839,1875,"Chuẩn bị giao diện hành trình",8);
await installGameShortcuts();

await window.gameBoot.checkpoint(1847,1875,"Dựng địa hình và các vùng đất",8);
await installRealmScenery();

await window.gameBoot.checkpoint(1855,1875,"Chuẩn bị thế giới",1);
moonveilPalace.registerLandmark();

await window.gameBoot.checkpoint(1856,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('mountain')){enterGame();bachKhuyet.travel();}

await window.gameBoot.checkpoint(1857,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('river')){enterGame();riverRealm.travel(new URLSearchParams(location.search).get('river')||'base');}

await window.gameBoot.checkpoint(1858,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('cavern')){enterGame();evilCavern.travel();}

await window.gameBoot.checkpoint(1859,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('volcano')){enterGame();volcanicValley.travel();}

await window.gameBoot.checkpoint(1860,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('mangrove')){enterGame();mangroveRealm.travel();}

await window.gameBoot.checkpoint(1861,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('antarctic')){enterGame();fastTravelTo(-700,2114,'Nam Cực');}

await window.gameBoot.checkpoint(1862,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('technology')){enterGame();technologyBase.travel();}

await window.gameBoot.checkpoint(1863,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('boat')){enterGame();riverBoat.travelDock();}

await window.gameBoot.checkpoint(1864,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('desert')){enterGame();desertRealm.travel();}

await window.gameBoot.checkpoint(1865,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('arena')){enterGame();romanArena.travel();}

await window.gameBoot.checkpoint(1866,1875,"Chuẩn bị thế giới",1);
if(new URLSearchParams(location.search).has('railway')){enterGame();moonRailway.travel(0);}

await window.gameBoot.checkpoint(1867,1875,"Chuẩn bị sinh vật và hoạt ảnh",8);
await installActorAnimation();
await installUndergroundNetwork();
await installCaveWalkin();
await window.gameBoot.checkpoint(1875,1875,'Hoàn tất thế giới');
});
