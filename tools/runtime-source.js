        // =====================================================================
        // THREE.JS 3D SCENE & ENGINE
        // =====================================================================
        const canvas = document.getElementById('webgl-canvas');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050814);
        scene.fog = new THREE.FogExp2(0x080e22, 0.0030);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', precision: 'highp' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Default pixel ratio capped to 1.0 for instant 3x-4x fill-rate performance boost on low-end laptops
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;

        // Expose globals for inspection & debugging
        window.scene = scene;
        window.renderer = renderer;
        window.camera = camera;

        // DYNAMIC LIGHT CULLING MANAGER
        const dynamicLights = [];
        window.dynamicLights = dynamicLights;
        function registerDynamicLight(light, maxDist = 90) {
            if (light) dynamicLights.push({ light, maxDist });
        }

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x28385e, 1.4);
        scene.add(ambientLight);

        const moonLight = new THREE.DirectionalLight(0xa5d8ff, 2.0);
        moonLight.position.set(60, 120, -70);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 1024;
        moonLight.shadow.mapSize.height = 1024;
        moonLight.shadow.camera.near = 10;
        moonLight.shadow.camera.far = 320;
        moonLight.shadow.camera.left = -110;
        moonLight.shadow.camera.right = 110;
        moonLight.shadow.camera.top = 110;
        moonLight.shadow.camera.bottom = -110;
        moonLight.shadow.bias = -0.0005;
        scene.add(moonLight);

        const cyanRimLight = new THREE.DirectionalLight(0x00f5d4, 0.9);
        cyanRimLight.position.set(-80, 40, 80);
        scene.add(cyanRimLight);

        // COLOSSAL RINGED CELESTIAL PLANET IN SKY
        const planetGroup = new THREE.Group();
        const planetGeo = new THREE.SphereGeometry(36, 48, 36);
        const planetMat = new THREE.MeshBasicMaterial({ color: 0xebf4ff });
        const planetMesh = new THREE.Mesh(planetGeo, planetMat);
        planetGroup.add(planetMesh);

        const ringGeo = new THREE.RingGeometry(46, 75, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x9be8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI * 0.42;
        ringMesh.rotation.y = Math.PI * 0.15;
        planetGroup.add(ringMesh);

        planetGroup.position.set(90, 160, -260);
        scene.add(planetGroup);

        // STARFIELD (1500 Stars across 520m sky)
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1500;
        const starCoords = new Float32Array(starCount * 3);
        for(let i = 0; i < starCount * 3; i += 3) {
            starCoords[i] = (Math.random() - 0.5) * EXPANDED_REALM_DATA.size*1.4;
            starCoords[i+1] = Math.random() * 250 + 40;
            starCoords[i+2] = (Math.random() - 0.5) * EXPANDED_REALM_DATA.size*1.4;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.9 }));
        scene.add(stars);

        // =====================================================================
        // CORE SHARED GLOW & METALLIC MATERIALS
        // =====================================================================
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 });
        const matSteel = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.9, roughness: 0.25 });
        const matCapeRed = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.65, side: THREE.DoubleSide });
        const matRobePurple = new THREE.MeshStandardMaterial({ color: 0x2d0b59, roughness: 0.6, side: THREE.DoubleSide });
        const matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.5, roughness: 0.2 });
        const matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.5, roughness: 0.2 });
        const matGreenGlow = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 2.2, roughness: 0.2 });

        // =====================================================================
        // REALISTIC PROCEDURAL MOON REGOLITH & CRATER SURFACE TEXTURE
        // =====================================================================
        function createLunarSurfaceTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            // 1. Base lunar regolith gradient (lunar silver-slate grey with cosmic stardust)
            const bgGrad = ctx.createRadialGradient(512, 512, 40, 512, 512, 720);
            bgGrad.addColorStop(0, '#3a4454');
            bgGrad.addColorStop(0.4, '#2d3748');
            bgGrad.addColorStop(0.8, '#1f2735');
            bgGrad.addColorStop(1, '#171e2b');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1024, 1024);

            // 2. Dark Lunar Mare (Basalt seas)
            const mareCenters = [
                { x: 260, y: 320, r: 160 },
                { x: 740, y: 680, r: 190 },
                { x: 310, y: 820, r: 130 },
                { x: 820, y: 240, r: 150 }
            ];
            mareCenters.forEach(m => {
                const mGrad = ctx.createRadialGradient(m.x, m.y, 20, m.x, m.y, m.r);
                mGrad.addColorStop(0, 'rgba(18, 24, 34, 0.65)');
                mGrad.addColorStop(0.6, 'rgba(28, 36, 48, 0.4)');
                mGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = mGrad;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Realistic Impact Craters with illuminated crescent rims & deep shadow bowls
            const craters = [
                { x: 200, y: 190, r: 72 },
                { x: 800, y: 280, r: 64 },
                { x: 440, y: 710, r: 85 },
                { x: 850, y: 790, r: 52 },
                { x: 250, y: 830, r: 58 },
                { x: 520, y: 360, r: 42 },
                { x: 680, y: 590, r: 38 },
                { x: 130, y: 530, r: 34 },
                { x: 910, y: 140, r: 48 },
                { x: 330, y: 110, r: 28 },
                { x: 490, y: 90, r: 35 },
                { x: 730, y: 460, r: 30 }
            ];

            craters.forEach(c => {
                // Shadow bowl
                const cGrad = ctx.createRadialGradient(c.x + c.r * 0.15, c.y + c.r * 0.15, c.r * 0.1, c.x, c.y, c.r);
                cGrad.addColorStop(0, '#0a0e16');
                cGrad.addColorStop(0.7, '#141a26');
                cGrad.addColorStop(0.9, '#2a3446');
                cGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = cGrad;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fill();

                // Bright silver starlight rim
                ctx.save();
                ctx.strokeStyle = 'rgba(215, 228, 245, 0.82)';
                ctx.lineWidth = Math.max(2.5, c.r * 0.09);
                ctx.shadowColor = '#00f5d4';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r * 0.94, -Math.PI * 0.75, Math.PI * 0.25);
                ctx.stroke();
                ctx.restore();

                // Central crater peak
                if (c.r > 50) {
                    const pGrad = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, c.r * 0.22);
                    pGrad.addColorStop(0, '#cbd5e1');
                    pGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = pGrad;
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.r * 0.22, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // 4. Moon dust grains & starlight specks
            ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
            for (let i = 0; i < 500; i++) {
                const sx = (i * 7919) % 1024;
                const sy = (i * 6271) % 1024;
                const sr = (i % 6 === 0) ? 2.4 : 1.2;
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }

            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(12, 12);
            return tex;
        }

        // GROUND TERRAIN (2080M EXPANDED MOON REALM)
        const moonTexture = createLunarSurfaceTexture();
        moonTexture.repeat.set(48,48);
        const groundGeo = new THREE.PlaneGeometry(EXPANDED_REALM_DATA.size, EXPANDED_REALM_DATA.size, EXPANDED_REALM_DATA.segments, EXPANDED_REALM_DATA.segments);
        const posAttr = groundGeo.attributes.position;
        // Central region (within 175m) is leveled for clear crystal road walking
        // Outer perimeter (beyond 175m) forms dramatic crater mountains
        for(let i = 0; i < posAttr.count; i++) {
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
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            map: moonTexture,
            color: 0x8a99ad,
            roughness: 0.78,
            metalness: 0.18,
            emissive: 0x0f172a,
            emissiveIntensity: 0.25
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // =====================================================================
        // OPTIMIZED MAP INSTANCING: 35 Lunar Boulders & 12 Crystals in 2 Draw Calls!
        // =====================================================================
        const matLunarRock = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.2 });
        const matMoonCrystal = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.2 });

        const rockBaseGeo = new THREE.DodecahedronGeometry(1.0, 0);
        const instancedRocks = new THREE.InstancedMesh(rockBaseGeo, matLunarRock, 35);
        instancedRocks.instanceMatrix.setUsage(THREE.StaticDrawUsage);

        const crystalSpireGeo = new THREE.ConeGeometry(0.35, 2.2, 5);
        const instancedSpires = new THREE.InstancedMesh(crystalSpireGeo, matMoonCrystal, 12);
        instancedSpires.instanceMatrix.setUsage(THREE.StaticDrawUsage);

        const dummyProp = new THREE.Object3D();
        let spireCount = 0;
        for (let rk = 0; rk < 35; rk++) {
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
        instancedRocks.instanceMatrix.needsUpdate = true;
        instancedSpires.instanceMatrix.needsUpdate = true;
        instancedRocks.matrixAutoUpdate = false;
        instancedSpires.matrixAutoUpdate = false;
        scene.add(instancedRocks);
        scene.add(instancedSpires);

        // =====================================================================
        // CON ĐƯỜNG PHA LÊ HUYỀN BÍ (LUMINOUS CELESTIAL CRYSTAL ROADWAYS)
        // =====================================================================
        const crystalRoadSegments = [];
        const crystalPylonLights = [];

        // Materials for Crystal Highways
        const matCrystalRoad = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.72,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true,
            opacity: 0.92
        });

        const matCrystalRuneCenter = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0xa855f7,
            emissiveIntensity: 2.2,
            roughness: 0.1
        });

        const matCrystalCurb = new THREE.MeshStandardMaterial({
            color: 0x00f5d4,
            emissive: 0x00f5d4,
            emissiveIntensity: 1.6,
            roughness: 0.25,
            metalness: 0.4
        });

        const matPylonPost = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.7 });

        // Collection of all pylon transforms across the entire realm for GPU Instancing
        const allHighwayPylons = [];

        // 1. Central Grand Moon Crystal Plaza (28m diameter at (0, 0))
        const plazaGroup = new THREE.Group();
        const plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 16.0, 0.35, 28), matCrystalRoad);
        plazaBase.position.y = 0.18;
        plazaBase.matrixAutoUpdate = false;
        plazaBase.updateMatrix();
        plazaGroup.add(plazaBase);

        const plazaRuneRing = new THREE.Mesh(new THREE.RingGeometry(9.0, 10.6, 28), matCrystalRuneCenter);
        plazaRuneRing.rotation.x = -Math.PI / 2;
        plazaRuneRing.position.y = 0.38;
        plazaRuneRing.matrixAutoUpdate = false;
        plazaRuneRing.updateMatrix();
        plazaGroup.add(plazaRuneRing);

        const plazaInnerRing = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.2, 28), matCrystalCurb);
        plazaInnerRing.rotation.x = -Math.PI / 2;
        plazaInnerRing.position.y = 0.38;
        plazaInnerRing.matrixAutoUpdate = false;
        plazaInnerRing.updateMatrix();
        plazaGroup.add(plazaInnerRing);

        // 8 Perimeter Crystal Beacon Pylons around central plaza (collected for instancing)
        for (let p = 0; p < 8; p++) {
            const pAng = p * (Math.PI * 2 / 8);
            const px = Math.cos(pAng) * 14.8;
            const pz = Math.sin(pAng) * 14.8;
            allHighwayPylons.push({ x: px, y: 1.1, z: pz, shardY: 2.6, isCyan: (p % 2 === 0) });
        }

        // Single soft atmospheric plaza beacon light (replaces 8 overlapping lights with 8x less GPU work)
        const centralPlazaLight = new THREE.PointLight(0x00f5d4, 2.2, 24);
        centralPlazaLight.position.set(0, 2.8, 0);
        plazaGroup.add(centralPlazaLight);
        registerDynamicLight(centralPlazaLight, 75);

        plazaGroup.matrixAutoUpdate = false;
        plazaGroup.updateMatrix();
        scene.add(plazaGroup);

        // Inter-building crystal highways removed. Keep only the eight plaza lights.
        // UNIFIED GPU INSTANCING: ALL HIGHWAY PYLONS & GLOWING CRYSTALS IN 3 DRAW CALLS!
        // =====================================================================
        const pylonPostGeo = new THREE.CylinderGeometry(0.2, 0.28, 1.8, 8);
        const instancedPylonPosts = new THREE.InstancedMesh(pylonPostGeo, matPylonPost, allHighwayPylons.length);
        instancedPylonPosts.instanceMatrix.setUsage(THREE.StaticDrawUsage);

        const cyanPylons = allHighwayPylons.filter(p => p.isCyan);
        const purplePylons = allHighwayPylons.filter(p => !p.isCyan);

        const shardGeo = new THREE.IcosahedronGeometry(0.36, 1);
        const instancedCyanShards = new THREE.InstancedMesh(shardGeo, matCyanGlow, cyanPylons.length);
        const instancedPurpleShards = new THREE.InstancedMesh(shardGeo, matPurpleGlow, purplePylons.length);
        instancedCyanShards.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        instancedPurpleShards.instanceMatrix.setUsage(THREE.StaticDrawUsage);

        const dummyPylon = new THREE.Object3D();
        allHighwayPylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.y, p.z);
            dummyPylon.rotation.set(0, 0, 0);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedPylonPosts.setMatrixAt(idx, dummyPylon.matrix);
        });
        instancedPylonPosts.instanceMatrix.needsUpdate = true;
        instancedPylonPosts.matrixAutoUpdate = false;
        scene.add(instancedPylonPosts);

        cyanPylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.shardY, p.z);
            dummyPylon.rotation.set(0.12, (idx * 0.4), -0.12);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedCyanShards.setMatrixAt(idx, dummyPylon.matrix);
        });
        instancedCyanShards.instanceMatrix.needsUpdate = true;
        instancedCyanShards.matrixAutoUpdate = false;
        scene.add(instancedCyanShards);

        purplePylons.forEach((p, idx) => {
            dummyPylon.position.set(p.x, p.shardY, p.z);
            dummyPylon.rotation.set(-0.12, (idx * 0.4), 0.12);
            dummyPylon.scale.set(1, 1, 1);
            dummyPylon.updateMatrix();
            instancedPurpleShards.setMatrixAt(idx, dummyPylon.matrix);
        });
        instancedPurpleShards.instanceMatrix.needsUpdate = true;
        instancedPurpleShards.matrixAutoUpdate = false;
        scene.add(instancedPurpleShards);

        // =====================================================================
        // CHARACTER BUILDERS (HAMSTER WARRIOR & RABBIT MAGE) WITH FULL LIMB RIGGING
        // =====================================================================
        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        playerGroup.scale.set(0.2, 0.36, 0.2);
        scene.add(playerGroup);

        // Soft ground contact shadow disk: guarantees player's feet are visibly planted on ground/road!
        const footShadowGeo = new THREE.CircleGeometry(0.72, 24);
        const footShadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 });
        const footContactShadow = new THREE.Mesh(footShadowGeo, footShadowMat);
        footContactShadow.rotation.x = -Math.PI / 2;
        footContactShadow.position.y = 0.02;
        playerGroup.add(footContactShadow);

        // Rotating magical aura ring beneath player's feet
        const magicAuraRingGeo = new THREE.RingGeometry(0.68, 0.88, 28);
        const magicAuraRingMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const magicAuraRing = new THREE.Mesh(magicAuraRingGeo, magicAuraRingMat);
        magicAuraRing.rotation.x = -Math.PI / 2;
        magicAuraRing.position.y = 0.03;
        playerGroup.add(magicAuraRing);

        // Character point light: ensures character is never a dark silhouette against scenery!
        const playerSpotLight = new THREE.PointLight(0x00f5d4, 1.35, 6.5);
        playerSpotLight.position.set(0, 1.2, 0);
        playerGroup.add(playerSpotLight);

        // Floating Golden Crown for Royal Throne interaction
        const crownGroup = new THREE.Group();
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 }));
        crownGroup.add(crownBase);
        for (let cr = 0; cr < 5; cr++) {
            const crAng = cr * (Math.PI * 2 / 5);
            const peak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 }));
            peak.position.set(Math.cos(crAng) * 0.45, 0.25, Math.sin(crAng) * 0.45);
            crownGroup.add(peak);
        }
        const crownGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 2.2 }));
        crownGem.position.set(0, 0.22, 0);
        crownGroup.add(crownGem);
        crownGroup.position.set(0, 2.2, 0);
        crownGroup.visible = false;
        playerGroup.add(crownGroup);

        // Dynamic Footstep Crystal Sparkle Particles Pool
        const footstepParticles = [];
        const stepParticleGeo = new THREE.RingGeometry(0.08, 0.18, 12);
        const stepParticleMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        for (let sp = 0; sp < 18; sp++) {
            const pMesh = new THREE.Mesh(stepParticleGeo, stepParticleMat.clone());
            pMesh.rotation.x = -Math.PI / 2;
            pMesh.visible = false;
            scene.add(pMesh);
            footstepParticles.push({ mesh: pMesh, life: 0, maxLife: 0.65 });
        }
        let particleIdx = 0;
        function emitFootstepSparkle(x, y, z) {
            if (currentProfileKey === 'low') return;
            const p = footstepParticles[particleIdx];
            p.mesh.position.set(x, y + 0.04, z);
            p.mesh.scale.set(1, 1, 1);
            p.mesh.material.opacity = 0.85;
            p.mesh.visible = true;
            p.life = 0;
            particleIdx = (particleIdx + 1) % footstepParticles.length;
        }

        let activeHeroType = 'hamster'; // 'hamster' | 'rabbit'
        let hamsterVisualGroup = null;
        let rabbitVisualGroup = null;
        let activeWeaponArm = null;
        let activeLimbs = null;

// Shared Materials declared at top level

        // BUILD HAMSTER WITH ARTICULATED LEGS, ARMS, BODY AND SHADOW
        const dragonVisualGroup=buildDragonKnightModel();
        const kingkongVisualGroup=buildKingKongModel();
        const ninjaVisualGroup=buildNinjaYinYangModel();
        hamsterVisualGroup = buildHamsterModel();
        rabbitVisualGroup = buildRabbitModel();

        for(const model of [hamsterVisualGroup,rabbitVisualGroup,dragonVisualGroup,kingkongVisualGroup,ninjaVisualGroup])registerHeroAnimation(model);
        playerGroup.add(hamsterVisualGroup);
        activeWeaponArm = hamsterVisualGroup.swordArm;
        activeLimbs = hamsterVisualGroup.limbs;



        // =====================================================================
        // SOLID 3D STANDABLE SURFACE & ELEVATION PHYSICS ENGINE
        // (Allows standing, walking, jumping & sitting ON steps and obstacles)
        // =====================================================================
        const colliders = [];
        const castleSurfaces = [];
        const castleStairGuards = [];
        const PLAYER_RADIUS = 0.20;
        const PLAYER_HEIGHT = 1.17;
        const MAX_STEP_HEIGHT = 0.30;
        const castleCameraRay = new THREE.Raycaster();

        function clipCastleCamera(origin, desired) {
            if(window.undergroundNetwork?.inside(origin))return undergroundNetwork.clipCamera(origin,desired);
            if(window.voidDistrict?.inside(origin))return voidDistrict.clipCamera(origin,desired);
            if(window.grandTerminal?.inside(origin.x,origin.z,10))return grandTerminal.clipCamera(origin,desired);
            if(window.evilCavern?.inside(origin))return evilCavern.clipCamera(origin,desired);
            if (!window.castlePhysics) return desired;
            const direction = desired.clone().sub(origin);
            const distance = direction.length();
            if (distance < 0.001) return desired;
            castleCameraRay.set(origin, direction.normalize());
            castleCameraRay.far = distance;
            const hits = castleCameraRay.intersectObjects(castlePhysics.cameraObstacles.filter(o=>o.visible), false);
            const clipped=hits.length ? origin.clone().addScaledVector(direction, Math.max(0.05, hits[0].distance - 0.22)) : desired;
            const mountainClipped=window.bachKhuyet?.clipCamera(origin,clipped)||clipped;
            return window.riverRealm?.clipCamera(origin,mountainClipped)||mountainClipped;
        }

        function castleSupport(px, pz, py) {
            let support = -Infinity;
            for (const surface of castleSurfaces) {
                if (px >= surface.minX && px <= surface.maxX &&
                    pz >= surface.minZ && pz <= surface.maxZ && surface.y <= py + MAX_STEP_HEIGHT + 0.001) {
                    support = Math.max(support, surface.y);
                }
            }
            return support;
        }

        function resolveCastleCeiling(x, z, previousY, nextY) {
            if(window.grandTerminal?.inside(x,z))return grandTerminal.ceiling(x,z,previousY,nextY);
            if(window.undergroundNetwork?.owns(x,z,previousY))return window.undergroundNetwork?.ceiling(x,z,previousY,nextY)??nextY;
            nextY=window.voidDistrict?.ceiling(x,z,previousY,nextY)??nextY;
            nextY=window.antarcticRealm?.ceiling(x,z,previousY,nextY)??nextY;
            nextY=window.moonveilPalace?.ceiling(x,z,previousY,nextY)??nextY;
            if (nextY <= previousY) return nextY;
            let resolved=window.evilCavern?.ceiling(x,z,previousY,nextY)??nextY;
            resolved=window.riverRealm?.ceiling(x,z,previousY,resolved)??resolved;
            resolved=window.mangroveRealm?.ceiling(x,z,previousY,resolved)??resolved;
            resolved=window.explorationUpdate?.ceiling(x,z,previousY,resolved)??resolved;
            resolved=window.desertRealm?.ceiling(x,z,previousY,resolved)??resolved;
            resolved=window.technologyBase?.ceiling(x,z,previousY,resolved)??resolved;
            const deck=castleBridgeTop(x,z), underside=deck===null?null:deck-.8;
            if(underside!==null && previousY+PLAYER_HEIGHT<=underside && nextY+PLAYER_HEIGHT>underside)resolved=underside-PLAYER_HEIGHT;
            if(x < -136 || x > -84 || z < 88 || z > 148)return resolved;
            for (const c of nearbyColliders(x,z)) {
                if (c.disabled) continue;
                if (c.type !== 'box' || !c.isStandable) continue;
                if (x + PLAYER_RADIUS <= c.minX || x - PLAYER_RADIUS >= c.maxX ||
                    z + PLAYER_RADIUS <= c.minZ || z - PLAYER_RADIUS >= c.maxZ) continue;
                if (previousY + PLAYER_HEIGHT <= c.minY + 0.001 && nextY + PLAYER_HEIGHT > c.minY) {
                    resolved = Math.min(resolved, c.minY - PLAYER_HEIGHT);
                }
            }
            return resolved;
        }

        // Small movement slices prevent running through thin walls after a slow frame.
        // Both animation and the castle regression tests use this movement function.
        function movePlayerWithCollisions(dx, dz) {
            if(window.explorationUpdate?.climbing||(window.snowQueen?.frozen||window.candyRealm?.hypnotized))return;
            if(window.riverBoat?.aboard||window.stationMobility?.riding||window.voidDistrict?.riding)return;
            if(window.moonRailway?.movePassenger(dx,dz))return;
            if(window.forestGuardian?.rooted||window.monsterSkills?.captured||window.riverRealm?.stunned||window.desertRealm?.petrified)return;
            recoverFromFurniture();
            const slices = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
            for (let slice = 0; slice < slices; slice++) {
                for (const [axis, distance] of [['x', dx / slices], ['z', dz / slices]]) {
                    if (Math.abs(distance) < 1e-10) continue;
                    const x = playerGroup.position.x + (axis === 'x' ? distance : 0);
                    const z = playerGroup.position.z + (axis === 'z' ? distance : 0);
                    const undergroundStep=Boolean(window.undergroundNetwork?.owns(x,z,playerGroup.position.y));
                    const onRailwayGround=undergroundStep||window.moonRailway?.onGradedGround(x,z,playerGroup.position.y);
                    if(!onRailwayGround&&window.volcanicValley&&!volcanicValley.canTraverse(playerGroup.position,x,z,Boolean(window.crystalWings?.flying)))continue;
                    if(!undergroundStep&&window.crystalWings?.blockedAt(x,z,playerGroup.position.y))continue;
                    if(!onRailwayGround&&window.riverRealm&&!riverRealm.canTraverse(playerGroup.position,x,z,Boolean(window.crystalWings?.flying)))continue;
                    if(window.terrainTraversal&&!terrainTraversal.canMove(playerGroup.position,x,z))continue;
                    if(!undergroundStep && isGrounded && jumpY===0 && !canCastleStep(x,z,playerGroup.position.y)) continue;
                    if (!checkCollision(x, z, playerGroup.position.y, PLAYER_RADIUS)) {
                        playerGroup.position[axis] += distance;
                        if (isGrounded && jumpY === 0) {
                            const support = getGroundElevation(x, z, playerGroup.position.y);
                            // Stair risers are snapped only within the physical step limit.
                            if (Math.abs(support - playerGroup.position.y) <= MAX_STEP_HEIGHT + 0.001) {
                                playerGroup.position.y = support;
                                currentGroundY = support;
                            }
                        }
                    }
                }
            }
        }

        function addCylinderCollider(x, z, radius, minY = -100, maxY = 500, isStandable = false) {
            colliders.push({ type: 'cylinder', x, z, radius, minY, maxY, isStandable });
        }

        function addBoxCollider(cx, cz, width, depth, minY = -100, maxY = 500, isStandable = false) {
            colliders.push({
                type: 'box',
                minX: cx - width / 2,
                maxX: cx + width / 2,
                minZ: cz - depth / 2,
                maxZ: cz + depth / 2,
                minY,
                maxY,
                isStandable
            });
        }

        function castleBridgeTop(x,z) {
            return null; // The retired castle has no bridge or elevated collision slab.
        }
        function getGroundElevation(px, pz, py = currentGroundY) {
            const quarryTop=window.caveAccess?.surfaceSupport(px,pz,py);if(Number.isFinite(quarryTop))return quarryTop;
            if(window.undergroundNetwork?.owns(px,pz,py))return undergroundNetwork.ground(px,pz,py);
            const terminalSupport=window.grandTerminal?.support(px,pz,py);if(Number.isFinite(terminalSupport))return terminalSupport;
            const palaceSupport=window.moonveilPalace?.support(px,pz,py);if(Number.isFinite(palaceSupport))return palaceSupport;
            const voidSupport=window.voidDistrict?.support(px,pz,py);if(Number.isFinite(voidSupport))return voidSupport;
            const liftSupport=window.stationMobility?.support(px,pz,py);if(Number.isFinite(liftSupport))return liftSupport;
            const trailSupport=window.highlandTrails?.support(px,pz,py);if(Number.isFinite(trailSupport))return trailSupport;
            const footbridgeSupport=window.realmTransitUpdate?.support(px,pz,py);if(Number.isFinite(footbridgeSupport))return footbridgeSupport;
            const polarSupport=window.antarcticRealm?.support(px,pz,py);if(Number.isFinite(polarSupport))return polarSupport;
            const treeSupport=window.explorationUpdate?.treeSupport(px,pz,py);if(Number.isFinite(treeSupport))return treeSupport;
            const pyramidSupport=window.desertRealm?.support(px,pz,py);if(Number.isFinite(pyramidSupport))return pyramidSupport;
            const railwaySupport=window.moonRailway?.support(px,pz,py);if(Number.isFinite(railwaySupport))return railwaySupport;
            const mangroveGround=window.mangroveRealm?.ground(px,pz);if(mangroveGround!==null&&mangroveGround!==undefined)return Math.max(window.worldSurface?.height(px,pz)??mangroveGround,mangroveGround,mangroveRealm.support(px,pz,py),window.riverRealm?.support(px,pz,py)??-Infinity);
            const volcanicGround=window.volcanicValley?.ground(px,pz);if(volcanicGround!==null&&volcanicGround!==undefined)return Math.max(volcanicGround,window.worldSurface?.height(px,pz)??-Infinity);
            const caveGround=window.evilCavern?.ground(px,pz,py);if(caveGround!==null&&caveGround!==undefined)return caveGround;
            const riverGround=window.riverRealm?.ground(px,pz);if(riverGround!==null&&riverGround!==undefined)return Math.max(window.worldSurface?.height(px,pz)??riverGround,riverGround,riverRealm.support(px,pz,py));
            const mountainGround=window.bachKhuyet?.ground(px,pz);if(mountainGround!==null&&mountainGround!==undefined)return Math.max(mountainGround,window.worldSurface?.height(px,pz)??-Infinity);
            if(window.moonSafetyLayer && py < -6 && !window.playerSurvival?.inLakeColumn(px,pz) && moonSafetyLayer.contains(px,pz))return window.worldSurface?.height(px,pz)??moonSafetyLayer.top;
            // 1. BASE TERRAIN & ARCHITECTURAL FLOOR ELEVATION
            let baseElev = 0;

            // Castle Grand Bridge Ramp (from z = 41.5 to z = 95.0, x in [-114.5, -105.5])
            // When py < 10.5m: Walking on Bridge Ramp; when py >= 10.5m: Standing on Floor 2 Balcony above!
            if (castleBridgeTop(px,pz)!==null && py >= castleBridgeTop(px,pz)-MAX_STEP_HEIGHT-.001 && py < 10.5) {
                const rampT = (pz - 41.5) / (95.0 - 41.5);
                baseElev = 0.35 + rampT * (6.0 - 0.35);
            }
            else if (inCastleEnvelope(px,pz)) {
                baseElev = 0;
            }
            // Colosseum arena floor
            else if (Math.hypot(px - 115, pz - 110) <= 26.0) {
                baseElev = 0.25;
            }
            // Shared Blender-authored terrain in the expanded realm.
            else {baseElev=window.worldSurface?.height(px,pz)??realmTerrainHeight(px,pz);}

            // Central Crystal Plaza elevation (Y = 0.35m at radius <= 16.0m with smooth beveled edge to 16.8m)
            const distPlaza = Math.hypot(px, pz);
            if (distPlaza <= 16.0) {
                if (baseElev < 0.35) baseElev = 0.35;
            } else if (distPlaza <= 16.8) {
                const curbT = (distPlaza - 16.0) / 0.8;
                const plazaElev = 0.35 * (1.0 - curbT);
                if (baseElev < plazaElev) baseElev = plazaElev;
            }

            // Crystal Road Segments elevation (Y = 0.35m with continuous smooth beveled edge)
            for (let r = 0; r < crystalRoadSegments.length; r++) {
                const seg = crystalRoadSegments[r];
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                const lenSq = dx * dx + dz * dz;
                const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (pz - seg.z1) * dz) / lenSq));
                const projX = seg.x1 + t * dx;
                const projZ = seg.z1 + t * dz;
                const distToRoad = Math.hypot(px - projX, pz - projZ);
                const halfW = seg.width * 0.5;
                if (distToRoad <= halfW) {
                    if (baseElev < 0.35) baseElev = 0.35;
                    break;
                } else if (distToRoad <= halfW + 0.6) {
                    const curbT = (distToRoad - halfW) / 0.6;
                    const roadElev = 0.35 * (1.0 - curbT);
                    if (baseElev < roadElev) baseElev = roadElev;
                    break;
                }
            }

            // 2. DYNAMIC STANDABLE SURFACES (Stair steps, Tables, Sarcophagus, Dais, Pedestals, Chests)
            const groveGround=window.ancientGrove?.ground(px,pz);
            if(groveGround!==null && groveGround!==undefined)baseElev=groveGround;
            const arenaTerrainRadius=Math.hypot((px-115)/1.15,(pz-110)/.9);
            if(arenaTerrainRadius<43)baseElev=arenaTerrainRadius<=37?.35:0;
            else if(arenaTerrainRadius<50)baseElev*=((arenaTerrainRadius-43)/7);
            if (inSecretCellar(px, pz) && (py < 0.8 || inSecretOpening(px,pz))) baseElev = -5;
            let maxSurfaceY = Math.max(baseElev, castleSupport(px, pz, py), window.romanArena?.support(px,pz,py) ?? -Infinity, window.mercuryLake?.support(px,pz,py) ?? -Infinity);

            for (const c of nearbyColliders(px,pz)) {
                if (c.disabled) continue;
                if (!c.isStandable) continue;

                let isOver = false;
                if (c.type === 'box') {
                    const padding = c.supportPadding ?? 0.12;
                    if (px >= c.minX - padding && px <= c.maxX + padding &&
                        pz >= c.minZ - padding && pz <= c.maxZ + padding) {
                        isOver = true;
                    }
                } else if (c.type === 'cylinder') {
                    const dx = px - c.x;
                    const dz = pz - c.z;
                    const rad = c.radius + 0.12;
                    if (dx * dx + dz * dz <= rad * rad) {
                        isOver = true;
                    }
                }

                if (isOver) {
                    // Check if player's elevation is eligible to step up or land on this surface:
                    // Step-up reach: c.maxY <= py + 0.55m
                    // Bottom reach: py >= c.minY - 0.25m
                    if (py >= c.minY - 0.25 && c.maxY <= py + (c.stepHeight ?? 0.65)) {
                        if (c.maxY > maxSurfaceY) {
                            maxSurfaceY = c.maxY;
                        }
                    }
                }
            }

            return maxSurfaceY;
        }

        // =====================================================================
        // SOLID HEIGHT-AWARE COLLISION PHYSICS ENGINE
        // (Allows stepping up onto standable obstacles, blocks horizontal walls)
        // =====================================================================
        function checkCollision(px, pz, py = (playerGroup ? playerGroup.position.y : 0), playerRadius = 0.20) {
            if(window.undergroundNetwork?.owns(px,pz,py)&&!Number.isFinite(window.caveAccess?.surfaceSupport(px,pz,py)))return undergroundNetwork.blocked(px,pz,py,playerRadius);
            if(window.caveAccess?.surfaceSolid(px,pz,py))return true;
            if(window.moonveilPalace?.blocked(px,pz,py,playerRadius))return true;
            if(window.voidDistrict?.blocked(px,pz,py,playerRadius))return true;
            if(window.grandTerminal?.blocked(px,pz,py,playerRadius))return true;
            if(window.stationMobility?.blocked(px,pz,py,playerRadius))return true;
            if(window.highlandTrails?.blocked(px,pz,py,playerRadius))return true;
            if(window.explorationUpdate?.blocked(px,pz,py,playerRadius))return true;
            if(window.desertRealm?.blocked(px,pz,py,playerRadius))return true;
            if(window.moonRailway?.blocked(px,pz,py,playerRadius))return true;
            if(window.mangroveRealm?.blocked(px,pz,py,playerRadius))return true;
            if (window.romanArena?.blocked(px,pz,py)||window.riverRealm?.blocked(px,pz,py,playerRadius)) return true;
            // World Boundary (Expanded realm, playable bounds scale by four on each axis)
            if (Math.abs(px) > EXPANDED_REALM_DATA.bound || Math.abs(pz) > EXPANDED_REALM_DATA.bound) return true;
            const deck=castleBridgeTop(px,pz);
            // A real sloped slab: ground traffic stays below it; deck traffic stays above it.
            if(deck!==null && py+PLAYER_HEIGHT>deck-.8+.001 && py<deck-MAX_STEP_HEIGHT-.001)return true;
            if(deck!==null && pz>=41.5 && pz<=95 && Math.abs(Math.abs(px+110)-3.7)<playerRadius+.09){
                const railY=.35+(pz-41.5)/53.5*5.65;
                if(py+PLAYER_HEIGHT>railY-.15 && py<railY+.4)return true;
            }

            for (const guard of castleStairGuards) {
                const t = (pz - guard.z0) / (guard.z1 - guard.z0);
                if (t < 0 || t > 1) continue;
                const y = guard.bottom + (guard.top - guard.bottom) * t;
                if (py + PLAYER_HEIGHT > y && py < y + 0.45 && Math.abs(px - guard.x) < playerRadius + 0.08) return true;
            }

            // Solid Castle Base Mesa Cliff:
            // Prevents walking through stone base from moon ground outside the castle
            if (window.castlePhysics?.active !== false && py < 5.0) {
                if (px + playerRadius > -136.0 && px - playerRadius < -84.0 &&
                    pz + playerRadius > 92 && pz - playerRadius < 148) {
                    // Only allowed entrance is Grand Bridge Ramp
                    const onBridgeRamp = (castleBridgeTop(px,pz)!==null && py>=castleBridgeTop(px,pz)-MAX_STEP_HEIGHT);
                    // Or inside underground dungeon interior
                    const insideDungeon = (px >= -129.0 && px <= -91.0 && pz >= 99.0 && pz <= 141.0 && py >= 0.8 && py < 5.8);
                    if (!onBridgeRamp && !insideDungeon && !(inSecretCellar(px,pz) && py >= -5.1)) {
                        return true;
                    }
                }
            }

            for (const c of nearbyColliders(px,pz,playerRadius)) {
                if (c.disabled) continue;

                // If player is walking ON TOP of this obstacle: do not block horizontally!
                if (c.isStandable && py >= c.maxY - 0.08) {
                    continue;
                }

                // If this is a standable obstacle within step-up reach (<= py + MAX_STEP_HEIGHTm): do not block!
                if (c.isStandable && c.maxY <= py + (c.stepHeight ?? 0.65) && py >= c.minY - 0.25) {
                    continue;
                }

                // Vertical bounds check for tall walls and non-step barriers:
                if (py + PLAYER_HEIGHT <= c.minY + 0.001 || py >= c.maxY - 0.001) continue;

                if (c.type === 'orientedBox') {
                    const dx = px - c.x, dz = pz - c.z;
                    const lx = dx * Math.cos(c.angle) - dz * Math.sin(c.angle);
                    const lz = dx * Math.sin(c.angle) + dz * Math.cos(c.angle);
                    if (Math.abs(lx) < c.width / 2 + playerRadius - 0.000001 && Math.abs(lz) < c.depth / 2 + playerRadius - 0.000001) return true;
                } else if (c.type === 'cylinder') {
                    const dx = px - c.x;
                    const dz = pz - c.z;
                    const minDist = c.radius + playerRadius;
                    if (dx * dx + dz * dz < minDist * minDist - 0.000001) {
                        return true;
                    }
                } else if (c.type === 'box') {
                    // Contact is allowed; only penetration blocks movement. A
                    // tiny tolerance prevents float roundoff snagging corners.
                    if (px + playerRadius > c.minX + 0.000001 && px - playerRadius < c.maxX - 0.000001 &&
                        pz + playerRadius > c.minZ + 0.000001 && pz - playerRadius < c.maxZ - 0.000001) {
                        return true;
                    }
                }
            }
            return false;
        }

        // =====================================================================
        // 2080M OPEN WORLD ARCHITECTURAL LANDMARKS & INTERACTABLES
        // =====================================================================
        const interactables = [];
        const landmarksData = [
            { name: "Đền Thần Điện Tsuventure", x: 0, z: 0, color: "#00f5d4", icon: "🏛️" },
            // Retain the old journal index without exposing a retired destination.
            { id:'retired_castle',name:'Đồng Nguyệt Quang',x:-110,z:120,color:'#7eb4a8',icon:'☾',hidden:true,retired:true },
            { name: "Đấu Trường La Mã", x: 115, z: 110, color: "#ff4d6d", icon: "⚔️" },
            { name: "Hồ Thủy Ngân — Vực Tĩnh Lặng", x: -370, z: -430, color: "#93c5fd", icon: "🌊" },
            { id:'ancient_tree',name: "Rừng Nguyên Sinh", x: 202, z: -206, color: "#4ade80", icon: "🌳",hidden:true },
            { id:'evil_cavern',name: "Hang Tà Thần", x: 125, z: -110, color: "#81758c", icon: "🕳" },
        ];

        // 1. ĐỀN THỜ TRUNG TÂM (0, 0)
        const monolith = new THREE.Group();
        monolith.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.0), matSteel));
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x2d3a4f, roughness: 0.9 }));
        pillar.position.y = 2.25;
        monolith.add(pillar);
        const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.8), matCyanGlow);
        rune.position.set(0, 2.4, 0.46);
        monolith.add(rune);
        scene.add(monolith);

        addCylinderCollider(0, 0, 1.8);

        interactables.push({
            id: 'monolith',
            pos: new THREE.Vector3(0, 0, 0),
            radius: 6.5,
            prompt: 'Lắng nghe Bia Đá Thì Thầm',
            type: 'npc'
        });

        // 2. ĐẠI LÂU ĐÀI HOÀNG GIA 4 TẦNG CHI TIẾT (-110, 120)
        // [Tầng Hầm (Y=1.0m) -> Tầng 1 Đại Điện (Y=6.0m) -> Tầng 2 Ngai Vàng (Y=13.0m) -> Gác Mái Bí Mật (Y=20.0m)]
        // HỆ THỐNG VẬT LÝ VA CHẠM TUYỆT ĐỐI (100% CHƯỚNG NGẠI VẬT RẮN KHÔNG ĐI XUYÊN QUA ĐƯỢC)
        // VÀ HỆ THỐNG HOẠT HỌA THỜI GIAN THỰC SỐNG ĐỘNG (LỬA ĐUỐC, LÒ SƯỞI, CỜ PHƯỚN, TINH THỂ, MA PHÁP)
        const castleAnimators = [];
        window.castleAnimators = castleAnimators;

        installRemovedCastle();

        // 3. ĐẤU TRƯỜNG LA MÃ (115, 110)
        // Arena is installed after expanded terrain.





        // 6. HỒ NƯỚC THỦY NGÂN GƯƠNG BẠC (-35, -135)
        installMercuryLake();

        // 7. Hidden ancient grove, authored in Blender.
        installAncientGrove();

        // Underground Evil God maze is installed after the shared game systems.



        // 10. CỎ BIẾN DỊ DẠ QUANG (HIGH-PERFORMANCE GPU INSTANCED MUTANT FLORA)
        // Optimizes 1,380 individual meshes down into 3 ultra-fast GPU InstancedMeshes!
        const floraColors = [matCyanGlow, matPurpleGlow, matGreenGlow];

        const floraBladeBins = [[], [], []]; // 0: Cyan, 1: Purple, 2: Green
        const floraSporeBins = [[], [], []];

        const dummyFlora = new THREE.Object3D();

        function queueMutantClump(gx, gz, scale = 1.0) {
            if(Math.hypot((gx-115)/1.15,(gz-110)/.9)<39)return;
            const colorIdx = Math.floor(Math.random() * 3);
            const bladeCount = 8;

            for (let b = 0; b < bladeCount; b++) {
                const bAng = b * (Math.PI * 2 / bladeCount) + (Math.random() - 0.5) * 0.4;
                const h = (1.2 + Math.random() * 1.4) * scale;
                const bx = gx + Math.cos(bAng) * 0.35 * scale;
                const bz = gz + Math.sin(bAng) * 0.35 * scale;

                dummyFlora.position.set(bx, h / 2, bz);
                dummyFlora.rotation.set(Math.cos(bAng) * 0.35, Math.random() * Math.PI, Math.sin(bAng) * 0.35);
                dummyFlora.scale.set(scale, h / 1.8, scale);
                dummyFlora.updateMatrix();
                floraBladeBins[colorIdx].push(dummyFlora.matrix.clone());
            }

            // Spore
            dummyFlora.position.set(gx, 0.75 * scale, gz);
            dummyFlora.rotation.set(0, 0, 0);
            dummyFlora.scale.set(scale, scale, scale);
            dummyFlora.updateMatrix();
            floraSporeBins[colorIdx].push(dummyFlora.matrix.clone());
        }

        // Collect along road network
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

        // Collect around landmarks
        landmarksData.forEach(lm => {
            for (let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                queueMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });

        // Instantiate unified GPU InstancedMeshes
        const baseFloraBladeGeo = new THREE.ConeGeometry(0.08, 1.8, 4);
        const baseFloraSporeGeo = new THREE.IcosahedronGeometry(0.22, 1);

        for (let col = 0; col < 3; col++) {
            const blades = floraBladeBins[col];
            if (blades.length > 0) {
                const instBlades = new THREE.InstancedMesh(baseFloraBladeGeo, floraColors[col], blades.length);
                instBlades.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                for (let i = 0; i < blades.length; i++) {
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
                for (let i = 0; i < spores.length; i++) {
                    instSpores.setMatrixAt(i, spores[i]);
                }
                instSpores.instanceMatrix.needsUpdate = true;
                instSpores.matrixAutoUpdate = false;
                instSpores.name='LegacyFlora_Spores';
                instSpores.userData.optionalFlora = true;
                scene.add(instSpores);
            }
        }

        // =====================================================================
        // FLOATING 3D HOLOGRAPHIC INTERACTION BEACONS (FOR ALL LANDMARKS)
        // =====================================================================
        const beaconGroups = [];
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

        // =====================================================================
        // FAST TRAVEL TOUR & REAL-TIME MINIMAP RADAR
        // =====================================================================
        function fastTravelTo(tx, tz, name, explicitY = null) {
            window.playerLife?.resetFall();window.snowQueen?.release();window.candyRealm?.release();window.moonRailway?.leaveForRespawn();
            window.riverBoat?.packForTravel();
            window.mangroveRealm?.pause();
            window.volcanicValley?.pause();
            window.evilCavern?.pause();
            window.crystalWings?.stopFlight();window.riverRealm?.pause();
            window.volcanicValley?.pause();
            window.evilCavern?.pause();window.monsterSkills?.pause();window.bachKhuyet?.pause();
            let gy = (explicitY !== null) ? explicitY : getGroundElevation(tx, tz);
            currentGroundY = gy;
            playerGroup.position.set(tx, gy, tz);
            window.playerSurvival?.refresh();
            jumpY = 0;
            jumpVelocityY = 0;
            isGrounded = true;
            camYaw = 0;
            camPitch = 0.28;
            camDistance = 3.2; // 5x scale view distance
            camera.position.set(tx, gy + 1.2, tz + 3.2);
            camera.lookAt(tx, gy + 0.35, tz);window.heroMotion?.reset();
            sfx.pickup();
            showNotification(`🚀 Đã dịch chuyển đến: ${name}!`);
            const badgeName = document.getElementById('landmark-current-name');
            if (badgeName) badgeName.textContent = name;
            window.evilCavern?.environment();
        }

        const minimapCanvas = document.getElementById('minimap-canvas');
        const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

        function updateMinimap(px, pz, pRot) {
            if(!window.evilCavern?.inside())window.ancientGrove?.update(px,pz);
            if (!minimapCtx) return;
            const w = minimapCanvas.width;
            const h = minimapCanvas.height;
            const riding = Boolean(window.moonRailway?.aboard);
            const span = riding ? 1800 : EXPANDED_REALM_DATA.mapSpan;
            const scale = w / span;
            const cx = w / 2 - (riding ? px * scale : 0);
            const cy = h / 2 - (riding ? pz * scale : 0);

            minimapCtx.clearRect(0, 0, w, h);

            // Radar background grid & circles
            minimapCtx.fillStyle = "rgba(6, 10, 22, 0.95)";
            minimapCtx.fillRect(0, 0, w, h);

            minimapCtx.strokeStyle = "rgba(0, 245, 212, 0.15)";
            minimapCtx.lineWidth = 1;
            minimapCtx.beginPath();
            minimapCtx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);
            minimapCtx.arc(w / 2, h / 2, 52, 0, Math.PI * 2);
            minimapCtx.stroke();

            // Landmarks blips
            window.worldExpansion?.drawMinimap(minimapCtx,cx,cy,scale);
            window.riverRealm?.drawMinimap(minimapCtx,cx,cy,scale);
            window.mangroveRealm?.drawMinimap(minimapCtx,cx,cy,scale);
            window.moonRailway?.drawMinimap(minimapCtx,cx,cy,scale);
            landmarksData.filter(lm=>!lm.hidden).forEach(lm => {
                const lx = cx + lm.x * scale;
                const ly = cy + lm.z * scale;
                minimapCtx.fillStyle = lm.color;
                minimapCtx.beginPath();
                minimapCtx.arc(lx, ly, 3.5, 0, Math.PI * 2);
                minimapCtx.fill();
            });

            // Player dot & direction pointer
            const plx = cx + px * scale;
            const ply = cy + pz * scale;

            minimapCtx.fillStyle = "#ffffff";
            minimapCtx.beginPath();
            minimapCtx.arc(plx, ply, 4, 0, Math.PI * 2);
            minimapCtx.fill();

            minimapCtx.strokeStyle = "#00f5d4";
            minimapCtx.lineWidth = 2;
            minimapCtx.beginPath();
            minimapCtx.moveTo(plx, ply);
            minimapCtx.lineTo(plx + Math.sin(pRot) * 9, ply + Math.cos(pRot) * 9);
            minimapCtx.stroke();

            // Update Coords text
            const coordsEl = document.getElementById('minimap-coords');
            if (coordsEl) coordsEl.textContent = `(${Math.round(px)}m, ${Math.round(pz)}m)`;

            window.santaGifts?.drawMinimap(minimapCtx,px,pz,scale,cx,cy);
            // Check nearest landmark for indicator
            let nearest = landmarksData[0];
            let minDist = 9999;
            landmarksData.filter(lm=>!lm.hidden).forEach(lm => {
                const d = Math.sqrt((px - lm.x)**2 + (pz - lm.z)**2);
                if (d < minDist) { minDist = d; nearest = lm; }
            });
            const badgeName = document.getElementById('landmark-current-name');
            const badgeIcon = document.getElementById('landmark-icon');
            if (badgeName && badgeIcon) {
                const room=currentCastleRoom();
                const groveBiome=window.ancientGrove?.biomeAt(px,pz);
                badgeName.textContent = room ? room.name : groveBiome && (nearest.id!=='ancient_tree' || minDist>40) ? groveBiome : inSecretCellar(px,pz) && playerGroup.position.y < 0.8
                    ? 'Mật thất Nguyệt Thạch (Tầng hầm sâu)'
                    : `${nearest.name} (${Math.round(minDist)}m)`;
                badgeIcon.textContent = nearest.icon;
            }
        }

        // =====================================================================
        // GAME STATE & HUD LOGIC
        // =====================================================================
        const gameState = {
            isPlaying: false,
            hasTalkedToMonolith: false,
            shardsCollected: 0,
            hasKey: false,
            gateUnlocked: false,
            inDialogue: false,
            health:250,maxHealth:250,armor:0,maxArmor:0
        };

        const homeScreen = document.getElementById('home-screen');
        const gameHud = document.getElementById('game-hud');
        const hudPrompt = document.getElementById('hud-prompt');
        const hudPromptText = document.getElementById('hud-prompt-text');
        const hudToast = document.getElementById('hud-toast');
        const hudDialogue = document.getElementById('hud-dialogue-modal');
        const hudVictory = document.getElementById('hud-victory-modal');

        function showNotification(msg) {
            hudToast.textContent = msg;
            hudToast.style.display = 'block';
            sfx.pickup();
            setTimeout(() => { hudToast.style.display = 'none'; }, 3200);
        }

        function updateQuestTracker() {
            const qMonolith = document.getElementById('q-monolith');
            if (qMonolith && gameState.hasTalkedToMonolith) {
                qMonolith.classList.add('done');
                qMonolith.textContent = '✓ Đã trò chuyện với Bia Đá Thì Thầm';
            }
        }

        // DIALOGUE
        const dialogueLines = [
            "Hỡi Người Bảo Hộ Anh Hùng! Ngươi cuối cùng đã thức tỉnh dưới ánh trăng bạc...",
            "Vương quốc Tsuventure đã chìm trong giấc ngủ ngàn năm bởi kết giới bóng tối.",
            "Khám phá kim tự tháp và trụ sở công nghệ; chế tạo thuyền để phiêu lưu trên sông!",
            "Nhấn [E] để tương tác với từng công trình và đánh thức nguồn sức mạnh cổ xưa!"
        ];
        let dIdx = 0;
        let dInterval = null;

        function startDialogue() {
            gameState.inDialogue = true;
            dIdx = 0;
            hudDialogue.style.display = 'flex';
            advanceDialogue();
        }

        function advanceDialogue() {
            if (dIdx >= dialogueLines.length) {
                if (dInterval) clearInterval(dInterval);
                hudDialogue.style.display = 'none';
                gameState.inDialogue = false;
                window.gameMouse?.resume();
                gameState.hasTalkedToMonolith = true;
                updateQuestTracker();
                return;
            }

            const sentence = dialogueLines[dIdx];
            dIdx++;
            if (dInterval) clearInterval(dInterval);

            const textEl = document.getElementById('dialogue-text-body');
            textEl.textContent = "";
            let cIdx = 0;
            dInterval = setInterval(() => {
                if (cIdx < sentence.length) {
                    textEl.textContent += sentence[cIdx];
                    if (cIdx % 3 === 0) sfx.typewriter();
                    cIdx++;
                } else {
                    clearInterval(dInterval);
                }
            }, 25);
        }

        document.getElementById('btn-dialogue-advance').addEventListener('click', advanceDialogue);

        // =====================================================================
        // CONTROLS & INTERACTIONS
        // =====================================================================
        const keys = { forward: false, backward: false, left: false, right: false, shift: false, jump: false,swimUp:false,dive:false };

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

        // MOUSE ORBIT CAMERA & ROTATION SYSTEM
        let isRightMouseDown = false;
        let mouseLastX = 0;
        let mouseLastY = 0;
        let camYaw = 0;
        let camPitch = 0.38; // Slightly elevated pitch so ground & crystal road beneath feet are always crystal clear!
        let camDistance = 3.4; // Beautiful framing for 5x scale character on the vast moon

        // =====================================================================
        // SITTING ACTION (NGỒI NGHỈ NGƠI TRÊN BẬC THANG & CHƯỚNG NGẠI VẬT)
        // =====================================================================
        let isSitting = false;

        function toggleSitting() {
            if(window.explorationUpdate?.climbing||window.riverBoat?.aboard)return;
            if(window.moonRailway?.aboard){moonRailway.toggleSeat();return;}
            if (!gameState.isPlaying || gameState.inDialogue) return;
            isSitting = !isSitting;
            sfx.pickup();

            const sitBtn = document.getElementById('btn-toggle-sit');
            if (sitBtn) {
                sitBtn.textContent = isSitting ? '🚶 Đứng Dậy (C)' : '🧘 Ngồi Nghỉ (C)';
                sitBtn.style.background = isSitting ? 'rgba(0, 245, 212, 0.35)' : 'rgba(255, 215, 0, 0.25)';
                sitBtn.style.color = isSitting ? '#00f5d4' : '#ffd700';
            }

            if (isSitting) {
                const p = playerGroup.position;
                const distThrone = Math.hypot(p.x - (-110), p.z - (120 + 18.5));
                const distBanquet = Math.hypot(p.x - (-110 - 12), p.z - (120 - 5));
                const distAttic = Math.hypot(p.x - (-110), p.z - 120);

                if (distThrone < 3.5 && p.y >= 13.5) {
                    sfx.portalOpen();
                    showNotification("👑 BẠN ĐÃ NGỒI LÊN NGAI VÀNG MẶT TRĂNG! Uy phong trị vì Vương Quốc Tsuventure!");
                } else if (distBanquet < 8.0 && p.y >= 5.8 && p.y <= 9.0) {
                    showNotification("🍖 Bạn đang ngồi tại Bàn Tiệc Kỵ Sĩ Hoàng Gia!");
                } else if (p.y >= 19.5 && distAttic < 5.0) {
                    showNotification("✨ Bạn đang ngồi thiền định bên cạnh Lõi Tinh Tú Gác Mái!");
                } else {
                    showNotification("🧘 Bạn đang ngồi nghỉ ngơi trên bậc thang / chướng ngại vật! Nhấn WASD hoặc C để đứng dậy.");
                }
            } else {
                showNotification("🚶 Đã đứng dậy, sẵn sàng tiếp tục khám phá!");
            }
        }

        // POINTER LOCK API & OMNIDIRECTIONAL RIGHT-CLICK CHARACTER CONTROL
        // (Ấn chuột phải ẩn con chuột và xoay điều khiển nhân vật tùy hướng 360 độ siêu mượt)
        let isPointerLocked = false;

        document.addEventListener('pointerlockchange', () => {
            isPointerLocked = (document.pointerLockElement === document.body || document.pointerLockElement === renderer.domElement);
            if (!isPointerLocked) {
                isRightMouseDown = false;
            }
        });

        // Prevent browser right-click context menu
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        window.addEventListener('mousedown', (e) => {
            if(e.target?.closest?.('button,a,input,textarea,select,summary,.modal-overlay,#game-hud')&&!isPointerLocked)return;
            if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
            if(e.button===2){e.preventDefault();if(!window.grandTerminal?.dispatch?.pointAt(e))window.gameMouse?.capture();}
            else if(e.button===0)triggerAttack();
        });
        window.addEventListener('mousemove',e=>{
            if(!isPointerLocked||!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
            camYaw-=e.movementX*.0035;camPitch=THREE.MathUtils.clamp(camPitch+e.movementY*.003,-1.25,1.25);
        });

        window.addEventListener('wheel', (e) => {
            if(e.target?.closest?.('#game-hud,.modal-overlay'))return;
            if (gameState.isPlaying) {
                if(window.moonRailway?.aboard){moonRailway.zoomBy(e.deltaY*.025);return;}
                camDistance = Math.max(0, Math.min(24.0, camDistance + e.deltaY * 0.008));
            }
        }, { passive: true });

        let isAttacking = false;
        let heroAttackElapsed=0;
        function triggerAttack() {
            if(window.explorationUpdate?.climbing)return;
            if((window.snowQueen?.frozen||window.candyRealm?.hypnotized)||window.riverRealm?.stunned||window.desertRealm?.petrified)return;
            if (isAttacking || !activeWeaponArm || gameState.inDialogue || !gameState.isPlaying || document.querySelector('.modal-overlay.active')) return;
            isAttacking = true;
            window.weaponSystem?.beginAttack();
            window.combatEffects?.playerAttack();
            if(activeHeroType==='kingkong'){sfx.playTone(95,'sine',.13,.24);sfx.playTone(210,'triangle',.07,.08);}else sfx.attackSound(activeHeroType === 'rabbit');

            heroAttackElapsed=0;
            const combatSkin='hamster';
            window.lakeMonsters?.beginPlayerAttack(combatSkin);
            window.forestGuardian?.beginPlayerAttack(combatSkin);
            window.monsterSkills?.beginPlayerAttack(combatSkin);
            window.bachKhuyet?.beginPlayerAttack(combatSkin);
            window.riverRealm?.beginPlayerAttack(combatSkin);
            window.evilCavern?.beginPlayerAttack(combatSkin);
            window.volcanicValley?.beginPlayerAttack(combatSkin);
            window.mangroveRealm?.beginPlayerAttack(combatSkin);
            window.desertRealm?.beginPlayerAttack(combatSkin);
            window.monsterCamps?.beginPlayerAttack(combatSkin);
            window.romanArena?.beginPlayerAttack?.(combatSkin);
            window.snowQueen?.beginPlayerAttack(combatSkin);window.candyRealm?.beginPlayerAttack(combatSkin);
        }

        // ACCURATE 2D HORIZONTAL INTERACTION DETECTION (NO HEIGHT BARRIER BUG)
        let nearbyItem = null;
        function checkInteractables() {
            window.treeWood?.refresh();
            if(window.explorationUpdate?.climbing){nearbyItem=null;hudPrompt.style.display="none";return;}
            const p = playerGroup.position;
            let found = window.explorationUpdate?.nearby(p)||[window.santaGifts?.nearby(p),window.foodPickups?.nearby(p),window.candyProvisions?.nearby(p),window.westernHighlands?.nearby(p),window.monsterCamps?.nearby(p),window.templeSupplies?.nearby(p),window.solarFlashlight?.nearby(p),window.backpack?.nearbyLoot(p)].filter(item=>item&&isUsefulInteraction(item)).sort((a,b)=>a.pos.distanceToSquared(p)-b.pos.distanceToSquared(p))[0]||null;
            for (const item of interactables) {
                if(found)break;
                if (item.collected || !isUsefulInteraction(item)) continue;
                const dx = p.x - item.pos.x;
                const dz = p.z - item.pos.z;
                const distXZ = Math.hypot(dx, dz);
                const distY = Math.abs(p.y - item.pos.y);
                // Check generous horizontal range and strict floor vertical tolerance (3.0m so floors don't cross-trigger)
                if (distXZ <= item.radius && distY <= 3.0) {
                    found = item;
                    break;
                }
            }
            if (found !== nearbyItem) {
                nearbyItem = found;
                if (found) {
                    hudPromptText.textContent = found.prompt;
                    hudPrompt.style.display = 'flex';
                } else {
                    hudPrompt.style.display = 'none';
                }
            }
        }

        let speedBuffTimer = 0;

        function handleInteraction() {
            if(window.grandTerminal?.vip.finishMassage())return;
            if(window.undergroundNetwork?.interact(nearbyItem))return;
            if(window.riverRealm?.stunned)return;
            if (!nearbyItem || gameState.inDialogue) return;
            const item = nearbyItem;
            if(!isUsefulInteraction(item)||window.explorationUpdate?.climbing)return;
            if(window.grandTerminal?.vip?.interact(item))return;
            if(window.explorationUpdate?.interact(item))return;
            if(window.moonveilPalace?.interact(item))return;
            if(window.mangroveRealm?.interact(item))return;
            if(window.caveTreasury?.interact(item))return;
            if(window.evilCavern?.interact(item))return;
            if(window.templeSupplies?.interact(item))return;
            if(window.monsterCamps?.interact(item))return;
            if(window.foodPickups?.interact(item))return;
            if(window.candyProvisions?.interact(item))return;
            if(window.westernHighlands?.interact(item))return;
            if(window.santaGifts?.interact(item))return;
            if(window.snowCrystals?.interact(item))return;
            if(window.volcanicValley?.interact(item))return;
            if(window.desertRealm?.interact(item))return;
            if(window.gearSystem?.interact(item)||window.progressionLoot?.interact(item))return;
            if(window.treeWood?.interact(item))return;
            if(window.riverBoat?.interact(item))return;
            if(window.solarFlashlight?.interact(item))return;
            if(window.crystalWings?.interact(item))return;
            if(window.bachKhuyet?.interact(item))return;
            if(window.backpack?.interact(item))return;
            if (interactCastleUpgrade(item)) return;
            if (window.romanArena?.interact(item)) return;

            if (item.type === 'npc') {
                startDialogue();
            }
            else if (item.id === 'castle_hall_banquet') {
                sfx.pickup();
                speedBuffTimer = 30.0; // 30 seconds speed boost!
                showNotification("🍖 ĐẠI ĐIỆN HOÀNG GIA (TẦNG 1): Thưởng thức Bàn Tiệc Kỵ Sĩ! Nhận Buff [Vó Ngựa Nguyệt Tộc] (+40% Tốc Độ Di Chuyển trong 30s)!");
            }
            else if (item.id === 'castle_throne' || item.type === 'throne') {
                sfx.portalOpen();
                crownGroup.visible = true; // Crown appears above head!
                showNotification("👑 THÁNH ĐIỆN NGAI VÀNG (TẦNG 2): Bạn đã tiếp nhận Ngai Vàng Mặt Trăng! Vương Miện Hoàng Kim Dạ Quang xuất hiện!");
            }
            else if (item.id === 'castle_library') {
                window.fieldGuide?.open();
                sfx.playTone(840, 'sine', 0.35, 0.2);

            }

        }

        // =====================================================================
        // UI MODAL & TRANSITION HANDLERS
        // =====================================================================
        function openModal(id) {
            window.gameMouse?.release(true);
            window.mangroveRealm?.pause();
            window.volcanicValley?.pause();
            window.evilCavern?.pause();window.monsterSkills?.pause();window.bachKhuyet?.pause();
            if(id==='modal-settings')window.resetSettingsDraft?.();
            window.resetGameplayInput?.();
            window.gameHUD?.closePanels();
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }
        function closeModal(id) {
            document.getElementById(id).classList.remove('active');
            if(gameState.isPlaying)renderer.domElement.focus({preventScroll:true});
            window.gameMouse?.resume();
        }

        function selectHero(type) {
            if (!['hamster','rabbit','dragon_knight','kingkong','ninja_yinyang'].includes(type)) return;
            if (isAttacking) return;
            document.querySelectorAll('.hero-card').forEach(card=>card.classList.toggle('selected',card.id==='card-hero-'+type));
            applyHeroSelection(type);
            closeModal('modal-heroes');
            showNotification(document.getElementById('home-hero-name').textContent);
        }

        function enterGame() {
            sfx.init();
            homeScreen.classList.add('hidden');
            gameHud.classList.add('active');
            gameState.isPlaying = true;
            window.worldSurface?.resetCamera();
            const gy = getGroundElevation(playerGroup.position.x, playerGroup.position.z);
            currentGroundY = gy;
            playerGroup.position.y = gy;
            camera.position.set(playerGroup.position.x, gy + 1.2, playerGroup.position.z + 3.2);
            camera.lookAt(playerGroup.position.x, gy + 0.35, playerGroup.position.z);
            showNotification("Chào mừng đến với Tsuventure! Dùng WASD để đi bộ, Chuột Phải để xoay góc nhìn, E để tương tác!");
        }

        function returnToHome() {
            window.mangroveRealm?.pause();
            window.volcanicValley?.pause();
            window.evilCavern?.pause();
            window.crystalWings?.stopFlight();window.riverRealm?.pause();
            window.lakeMonsters?.pause();
            window.forestGuardian?.pause();
            window.volcanicValley?.pause();
            window.evilCavern?.pause();window.monsterSkills?.pause();window.bachKhuyet?.pause();
            isAttacking=false;heroAttackElapsed=0;
            for(const model of [hamsterVisualGroup,rabbitVisualGroup,dragonVisualGroup,kingkongVisualGroup,ninjaVisualGroup])resetHeroAnimation(model);
            window.resetGameplayInput?.();
            window.gameHUD?.closePanels();
            hudVictory.style.display = 'none';
            gameHud.classList.remove('active');
            homeScreen.classList.remove('hidden');
            gameState.isPlaying = false;
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        // Hook up menu buttons
        document.getElementById('btn-play-game').addEventListener('click', enterGame);
        document.getElementById('btn-open-heroes').addEventListener('click', () => openModal('modal-heroes'));
        document.getElementById('btn-preview-hero').addEventListener('click', () => openModal('modal-heroes'));

        document.getElementById('btn-open-settings').addEventListener('click', () => openModal('modal-settings'));
        document.getElementById('btn-return-home').addEventListener('click', returnToHome);

        // =====================================================================
        // ADVANCED GRAPHICS PROFILES & HARDWARE OPTIMIZATION SYSTEM
        // Performance depends on hardware; the lightweight preset reduces GPU and CPU work.
        // =====================================================================
        const graphicsProfiles = {
            low:{name:'M\u01b0\u1ee3t',tag:'M\u01af\u1ee2T',pixelRatio:.65,shadows:false,shadowMapSize:256,lightDistance:0,fogDensity:.009,drawDistance:280},
            balanced:{name:'Trung B\u00ecnh',tag:'TRUNG B\u00ccNH',pixelRatio:Math.min(devicePixelRatio,1),shadows:false,shadowMapSize:1024,lightDistance:95,fogDensity:.0035,drawDistance:900},
            ultra:{name:'Cao',tag:'CAO',pixelRatio:Math.min(devicePixelRatio,1.5),shadows:true,shadowMapSize:2048,lightDistance:160,fogDensity:.0018,drawDistance:2200}
        };
        let currentProfileKey = 'low';
        let adaptiveRatio = 0.6;
        let slowSamples = 0;
        let fastSamples = 0;
        try {
            const saved = localStorage.getItem('tsukiezz_graphics_profile');
            if(saved==='potato')currentProfileKey='low';else if(saved&&graphicsProfiles[saved])currentProfileKey=saved;
        } catch(e) {}

        function applyRenderResolution() {
            const ratio = currentProfileKey === 'low'
                ? Math.min(adaptiveRatio, 960 / Math.max(1, window.innerWidth), 540 / Math.max(1, window.innerHeight))
                : graphicsProfiles[currentProfileKey].pixelRatio;
            if(Math.abs(renderer.getPixelRatio()-ratio)>.001)renderer.setPixelRatio(ratio);
        }

        function setGraphicsProfile(key) {
            if(key==='potato')key='low';
            if (!graphicsProfiles[key]) return;
            currentProfileKey = key;
            const p = graphicsProfiles[key];

            // Apply resolution scaling
            adaptiveRatio = p.pixelRatio;
            slowSamples = fastSamples = 0;
            applyRenderResolution();
            const lightweight = key === 'low';
            document.body.classList.toggle('lightweight', lightweight);
            camera.far = p.drawDistance;
            camera.updateProjectionMatrix();
            scene.traverse(obj => {
                if (obj.isPointLight) obj.visible = !lightweight;
                if (obj.userData.optionalFlora) obj.visible = !lightweight;
            });
            window.ancientGrove?.setDetailProfile(key);
            footstepParticles.forEach(particle => { particle.mesh.visible = false; particle.life = particle.maxLife; });
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Apply dynamic shadow mapping
            renderer.shadowMap.enabled = p.shadows;
            moonLight.castShadow = p.shadows;
            if (renderer.shadowMap.enabled) {
                renderer.shadowMap.type = key==='ultra'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
                moonLight.shadow.mapSize.width = p.shadowMapSize;
                moonLight.shadow.mapSize.height = p.shadowMapSize;
                if (moonLight.shadow.map) moonLight.shadow.map.dispose();
                moonLight.shadow.map = null;
            }

            // Apply celestial fog
            if (scene.fog) scene.fog.density = p.fogDensity;

            window.graphicsQuality?.apply(key);
            window.aquaticEcology?.applyProfile(key);window.polarEcology?.applyProfile(key);
            // Update UI buttons
            document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
            const activeBtn = document.getElementById(`btn-preset-${key}`);
            if (activeBtn) activeBtn.classList.add('active');

            const label = document.getElementById('current-profile-label');
            if (label) label.textContent = p.name;

            const modeTag = document.getElementById('hud-mode-tag');
            if (modeTag) modeTag.textContent = p.tag;

            try {
                localStorage.setItem('tsukiezz_graphics_profile', key);
            } catch(e) {}

            showNotification(`Đã chuyển đồ họa: ${p.name}!`);
        }
        window.setGraphicsProfile = setGraphicsProfile;

        // Apply saved profile immediately
        setGraphicsProfile(currentProfileKey);

        // Audio toggle
        document.getElementById('btn-audio-toggle').addEventListener('click', (e) => {
            sfx.init();
            sfx.muted = !sfx.muted;
            e.target.textContent = sfx.muted ? '🔇' : '🔊';
        });

        // =====================================================================
        // REAL WALKING ANIMATION & PHYSICS ENGINE
        // =====================================================================
        let currentGroundY = 0;
        let jumpY = 0;
        let jumpVelocityY = 0;
        const gravity = -24.0;
        let isGrounded = true;
        let walkCycle = 0;
        const heroMoveDirection=new THREE.Vector3();
        const clock = new THREE.Clock();

        let frameCount = 0;
        let fpsFrames = 0;
        let fpsLastTime = performance.now();

        window.addEventListener('resize', () => {
            applyRenderResolution();
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        installGameHUD();
        window.ancientGrove?.refreshButton();
        installMoonUnderlayer();
        installLakeMonsters();
        installPlayerSurvival();
        installForestGuardian();
        installForestWildlife();
        installHeroMotion();
        installBackpack();
        installCrystalWings();
        installBachKhuyet();
        installThermalRiver();
        installMonsterSkills();
        installEvilCavern();
        installSolarFlashlight();
        installTempleSupplies();
        installVolcanicValley();
        installVolcanicDragonFlight();
        installMangroveRealm();
        installMapVisualRepair();
        installTerrainContinuity();
        installSouthernExpansion();
        installArenaRelocation();
        installDesertRealm();
        installAntarcticRealm();
        installTechnologyBase();
        installCandyRealm();
        installMoonveilPalace();
        installWesternVillages();
        installMoonRailway();
installGrandTerminal();
        installWorldSurfaceSync();
        moonRailway.mountainBridges=finishMountainRailBridges(moonRailway);
        installHighlandTrails();
        installWesternNature();
        worldExpansion.rebuildWater();
        antarcticRealm.finishTerrainArt();
        desertRealm.connectStation();
        romanArena.connectStation();
        installRiverBoat();
        installNinjaAbilities();
        installLivingWorld();
        installPlayerLife();
        installSnowQueen();
        installAquaticEcology();
        installPolarEcology();
        installSnowCrystals();
        installSantaGifts();
        antarcticRealm.attachTravel();
        installTreeWood();
        installConstructionZones();
        installMonsterCamps();
        installFoodPickups();
        installCandyProvisions();
        installInventoryLayout();
        installHeroStatSync();
        window.mercuryLake?.finishShore?.();
        installLibraryPreviews();
        installCreatureRefresh();
        installFieldGuide();
        installLunarBiome();
        installLunarSurfaceFinish();
        rebuildCollisionGrid();
        installRealmTransitUpdate();
        installStationMobility();
        installVoidDistrict();
        installCaveTreasury();
        installRageArmor();
        installWorldWeather();
        installInventoryWorkspace();
        installWorldResidents();
        installTerrainTraversal();
        installExplorationUpdate();
        installWorkshopUpdate();
        installGearService();
        installTreasureSupplies();
        installGiftCode();
        installGraphicsQuality();
        installPlayerExperience();
        installGameShortcuts();
        installRealmScenery();
        moonveilPalace.registerLandmark();
        if(new URLSearchParams(location.search).has('mountain')){enterGame();bachKhuyet.travel();}
        if(new URLSearchParams(location.search).has('river')){enterGame();riverRealm.travel(new URLSearchParams(location.search).get('river')||'base');}
        if(new URLSearchParams(location.search).has('cavern')){enterGame();evilCavern.travel();}
        if(new URLSearchParams(location.search).has('volcano')){enterGame();volcanicValley.travel();}
        if(new URLSearchParams(location.search).has('mangrove')){enterGame();mangroveRealm.travel();}
        if(new URLSearchParams(location.search).has('antarctic')){enterGame();fastTravelTo(-700,2114,'Nam Cực');}
        if(new URLSearchParams(location.search).has('technology')){enterGame();technologyBase.travel();}
        if(new URLSearchParams(location.search).has('boat')){enterGame();riverBoat.travelDock();}
        if(new URLSearchParams(location.search).has('desert')){enterGame();desertRealm.travel();}
        if(new URLSearchParams(location.search).has('arena')){enterGame();romanArena.travel();}
        if(new URLSearchParams(location.search).has('railway')){enterGame();moonRailway.travel(0);}
        installActorAnimation();
        installUndergroundNetwork();
        installCaveWalkin();
        animate();
    
