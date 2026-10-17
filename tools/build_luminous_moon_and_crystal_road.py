import os
import sys

INDEX_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\demo\index.html"

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

is_crlf = '\r\n' in content
content = content.replace('\r\n', '\n')

replacements = []

# =====================================================================
# 1. GROUND TERRAIN & LUMINOUS CRYSTAL HIGHWAY NETWORK
# =====================================================================
old_ground_and_roads = """        // GROUND TERRAIN (520M OPEN REALM)
        const groundGeo = new THREE.PlaneGeometry(560, 560, 48, 48);
        const posAttr = groundGeo.attributes.position;
        // Subtle rolling moon dunes & craters
        for(let i = 0; i < posAttr.count; i++) {
            const vx = posAttr.getX(i);
            const vy = posAttr.getY(i);
            // distance from center and landmarks
            const distCenter = Math.sqrt(vx*vx + vy*vy);
            let zOffset = Math.sin(vx * 0.02) * Math.cos(vy * 0.02) * 2.5;
            if (distCenter > 180) zOffset += Math.sin(vx * 0.04) * 4.0;
            posAttr.setZ(i, zOffset);
        }
        groundGeo.computeVertexNormals();
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x141c2c, roughness: 0.9, metalness: 0.05 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // STONE PATHWAYS CONNECTING ALL 8 LANDMARKS
        const pathMat = new THREE.MeshStandardMaterial({ color: 0x223046, roughness: 0.85, metalness: 0.1 });
        function buildRoad(x1, z1, x2, z2, width = 4.2) {
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.sqrt(dx*dx + dz*dz);
            const rMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, len), pathMat);
            rMesh.rotation.x = -Math.PI / 2;
            rMesh.rotation.z = -Math.atan2(dx, dz);
            rMesh.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
            rMesh.receiveShadow = true;
            scene.add(rMesh);
        }
        // Central crossroads connecting all 9 landmarks
        buildRoad(0, 0, -110, 120);   // To Castle
        buildRoad(0, 0, 115, 110);    // To Colosseum
        buildRoad(0, 0, -145, -35);   // To Space Station
        buildRoad(0, 0, -85, -95);    // To 2-Tier Altar
        buildRoad(0, 0, -35, -135);   // To Mercury Lake
        buildRoad(-85, -95, -35, -135, 3.5); // Road connecting Altar and Mercury Lake
        buildRoad(0, 0, 145, 30);     // To Ancient Tree
        buildRoad(0, 0, 125, -110);   // To Cave
        buildRoad(0, 0, -120, -125);  // To Observatory"""

new_ground_and_roads = """        // =====================================================================
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

        // GROUND TERRAIN (520M REALISTIC MOON REALM)
        const moonTexture = createLunarSurfaceTexture();
        const groundGeo = new THREE.PlaneGeometry(560, 560, 64, 64);
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
            posAttr.setZ(i, zOffset);
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

        // Scatter 3D Lunar Boulders & Glowing Moon Crystals across the terrain
        const matLunarRock = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.2 });
        const matMoonCrystal = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.2 });
        for (let rk = 0; rk < 35; rk++) {
            const rkAngle = rk * 1.83;
            const rkDist = 28 + (rk * 17) % 190;
            const rx = Math.cos(rkAngle) * rkDist;
            const rz = Math.sin(rkAngle) * rkDist;

            // Boulder
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + (rk % 4) * 0.4, 0), matLunarRock);
            rock.position.set(rx, 0.4, rz);
            rock.rotation.set(rk, rk * 0.5, rk * 0.8);
            scene.add(rock);

            // Occasional glowing lunar crystal spire beside rock
            if (rk % 3 === 0) {
                const cry = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 5), matMoonCrystal);
                cry.position.set(rx + 1.2, 1.1, rz + 0.8);
                cry.rotation.set(0.15, rk, -0.2);
                scene.add(cry);
            }
        }

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

        // 1. Central Grand Moon Crystal Plaza (28m diameter at (0, 0))
        const plazaGroup = new THREE.Group();
        const plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 16.0, 0.35, 36), matCrystalRoad);
        plazaBase.position.y = 0.18;
        plazaGroup.add(plazaBase);

        const plazaRuneRing = new THREE.Mesh(new THREE.RingGeometry(9.0, 10.6, 36), matCrystalRuneCenter);
        plazaRuneRing.rotation.x = -Math.PI / 2;
        plazaRuneRing.position.y = 0.38;
        plazaGroup.add(plazaRuneRing);

        const plazaInnerRing = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.2, 36), matCrystalCurb);
        plazaInnerRing.rotation.x = -Math.PI / 2;
        plazaInnerRing.position.y = 0.38;
        plazaGroup.add(plazaInnerRing);

        // 8 Perimeter Crystal Beacon Pylons around central plaza
        for (let p = 0; p < 8; p++) {
            const pAng = p * (Math.PI * 2 / 8);
            const px = Math.cos(pAng) * 14.8;
            const pz = Math.sin(pAng) * 14.8;

            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 8), matPylonPost);
            post.position.set(px, 1.1, pz);
            plazaGroup.add(post);

            const shard = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), (p % 2 === 0 ? matCyanGlow : matPurpleGlow));
            shard.position.set(px, 2.6, pz);
            plazaGroup.add(shard);

            const pLight = new THREE.PointLight((p % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.6, 14);
            pLight.position.set(px, 2.6, pz);
            plazaGroup.add(pLight);
            crystalPylonLights.push({ mesh: shard, light: pLight, baseY: 2.6, offset: p });
        }
        scene.add(plazaGroup);

        // 2. High-Tech Luminous Crystal Highway Builder
        function buildCrystalHighway(x1, z1, x2, z2, width = 5.6) {
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.hypot(dx, dz);
            const ang = Math.atan2(dx, dz);
            const cx = (x1 + x2) / 2;
            const cz = (z1 + z2) / 2;

            crystalRoadSegments.push({ x1, z1, x2, z2, width, len });

            const roadGroup = new THREE.Group();

            // Main crystal pavement slab
            const pavement = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, len), matCrystalRoad);
            pavement.position.set(0, 0.22, 0);
            pavement.receiveShadow = true;
            roadGroup.add(pavement);

            // Central glowing amethyst rune ribbon
            const runeRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.30, len), matCrystalRuneCenter);
            runeRibbon.position.set(0, 0.23, 0);
            roadGroup.add(runeRibbon);

            // Left & Right raised cyan crystal curb borders
            [-width / 2, width / 2].forEach(curbX => {
                const curb = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, len), matCrystalCurb);
                curb.position.set(curbX, 0.28, 0);
                roadGroup.add(curb);
            });

            // Lantern Pylons every 16 meters along both sides
            const pylonStep = 16.0;
            const pylonCount = Math.floor(len / pylonStep);
            for (let i = 1; i <= pylonCount; i++) {
                const pz = -len / 2 + i * pylonStep;
                [-width / 2 - 0.45, width / 2 + 0.45].forEach((px, sideIdx) => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.8, 8), matPylonPost);
                    post.position.set(px, 1.0, pz);
                    roadGroup.add(post);

                    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), ((i + sideIdx) % 2 === 0 ? matCyanGlow : matPurpleGlow));
                    crystal.position.set(px, 2.2, pz);
                    roadGroup.add(crystal);

                    // Add point light every 32 meters to optimize performance while maintaining breathtaking lighting
                    if (i % 2 === 0 && sideIdx === 0) {
                        const rLight = new THREE.PointLight(0x00f5d4, 1.4, 18);
                        rLight.position.set(px, 2.2, pz);
                        roadGroup.add(rLight);
                    }
                });
            }

            roadGroup.position.set(cx, 0, cz);
            roadGroup.rotation.y = ang;
            scene.add(roadGroup);
        }

        // Construct Crystal Highways radiating from Central Plaza (0, 0) directly to every single landmark:
        // 1. To Castle Grand Bridge Entrance (Connects precisely onto Bridge Ramp at z = 42!)
        buildCrystalHighway(0, 0, -110, 42, 6.4);

        // 2. To Colosseum Roman Arena entrance
        buildCrystalHighway(0, 0, 115, 84, 5.6);

        // 3. To Space Station Tech Bridge
        buildCrystalHighway(0, 0, -128, -35, 5.6);

        // 4. To Blood Altar Southern Steps
        buildCrystalHighway(0, 0, -85, -84, 5.6);

        // 5. To Mercury Lake Pier
        buildCrystalHighway(0, 0, -35, -108, 5.6);

        // 6. Scenic Lake-to-Altar Crystal Promenade
        buildCrystalHighway(-85, -84, -35, -108, 4.6);

        // 7. To Great Ancient Moon Tree 45m
        buildCrystalHighway(0, 0, 125, 25, 5.6);

        // 8. To Crystal Cave Entrance
        buildCrystalHighway(0, 0, 112, -98, 5.6);

        // 9. To Ancestral Observatory Terrace
        buildCrystalHighway(0, 0, -106, -112, 5.6);"""
replacements.append(("Moon ground and Crystal Highways", old_ground_and_roads, new_ground_and_roads))

# =====================================================================
# 2. PLAYER GROUP: CONTACT SHADOW, MAGIC AURA RING & CROWN BUFF DECAL
# =====================================================================
old_player_group = """        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        playerGroup.scale.set(0.2, 0.2, 0.2); // Player scaled 5x smaller so scenery feels colossal
        scene.add(playerGroup);"""

new_player_group = """        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        playerGroup.scale.set(0.2, 0.2, 0.2); // Player scaled 5x smaller so scenery feels colossal
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
            const p = footstepParticles[particleIdx];
            p.mesh.position.set(x, y + 0.04, z);
            p.mesh.scale.set(1, 1, 1);
            p.mesh.material.opacity = 0.85;
            p.mesh.visible = true;
            p.life = 0;
            particleIdx = (particleIdx + 1) % footstepParticles.length;
        }"""
replacements.append(("Player Group Contact Shadow & Light", old_player_group, new_player_group))

# =====================================================================
# 3. GET GROUND ELEVATION: CRYSTAL ROAD ELEVATION INTEGRATION
# =====================================================================
old_ground_elev_crystal = """            // Moon dunes terrain
            else {
                let zOffset = Math.sin(px * 0.02) * Math.cos(pz * 0.02) * 2.5;
                const distCenter = Math.hypot(px, pz);
                if (distCenter > 180) zOffset += Math.sin(px * 0.04) * 4.0;
                baseElev = Math.max(0, zOffset);
            }"""

new_ground_elev_crystal = """            // Moon dunes terrain
            else {
                const distCenter = Math.hypot(px, pz);
                if (distCenter > 175) {
                    baseElev = Math.max(0, Math.sin(px * 0.03) * Math.cos(pz * 0.03) * 3.8);
                } else {
                    baseElev = Math.max(0, Math.sin(px * 0.015) * Math.cos(pz * 0.015) * 0.12);
                }
            }

            // Central Crystal Plaza elevation (Y = 0.35m at radius <= 16.5m)
            if (Math.hypot(px, pz) <= 16.5) {
                if (baseElev < 0.35) baseElev = 0.35;
            }

            // Crystal Road Segments elevation (Y = 0.35m)
            for (let r = 0; r < crystalRoadSegments.length; r++) {
                const seg = crystalRoadSegments[r];
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                const lenSq = dx * dx + dz * dz;
                const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (pz - seg.z1) * dz) / lenSq));
                const projX = seg.x1 + t * dx;
                const projZ = seg.z1 + t * dz;
                const dSq = (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
                if (dSq <= (seg.width * 0.58) * (seg.width * 0.58)) {
                    if (baseElev < 0.35) baseElev = 0.35;
                    break;
                }
            }"""
replacements.append(("Elevation Crystal Roads", old_ground_elev_crystal, new_ground_elev_crystal))

# =====================================================================
# 4. ENHANCED BUILDING INTERACTIONS & REWARDING GAMEPLAY BUFFS
# =====================================================================
old_interactions = """        function handleInteraction() {
            if (!nearbyItem || gameState.inDialogue) return;
            const item = nearbyItem;

            if (item.type === 'npc') {
                startDialogue();
            }
            else if (item.type === 'colosseum') {
                sfx.attackSound(false);
                showNotification("⚔️ ĐẤU TRƯỜNG LA MÃ: Bạn đã khiêu chiến võ đài! Nhận Chúc Phúc Đấu Sĩ Nguyệt Tộc (+50 Sức Mạnh)!");
            }
            else if (item.type === 'space_station') {
                sfx.playTone(880, 'square', 0.3, 0.2);
                showNotification("🛸 TRẠM VŨ TRỤ TSUKIEZZ: Tín hiệu vệ tinh lượng tử đã kết nối! Kích hoạt radar quét thiên hà!");
            }
            else if (item.type === 'altar') {
                sfx.portalOpen();
                showNotification("🩸 TRỤ TẾ ĐÀN 2 TẦNG: Trái Tim Hư Không bừng sáng! Hồi phục 100% Sinh Lực & Mana!");
            }
            else if (item.type === 'mercury_lake') {
                sfx.pickup();
                showNotification("🌊 HỒ THỦY NGÂN GƯƠNG BẠC: Dòng nước phản chiếu thiên hà! Nhận Khiên Hộ Thể Nguyệt Quang (+100 Giáp)!");
            }
            else if (item.id === 'castle_dungeon_cell') {
                sfx.pickup();
                showNotification("🗝️ NGỤC GIAM BÍ MẬT: Nhặt được Hộp Sọ Dạ Quang & Chìa Khóa Hư Không của Tù Nhân Cổ Đại!");
            }
            else if (item.id === 'castle_dungeon_treasury') {
                sfx.pickup();
                showNotification("🗝️ HẦM NGỤC HOÀNG GIA: Đã mở rương kho báu bí mật! Nhận 1000 Tinh Thể Nguyệt Tộc & Bí Kíp Cổ!");
            }
            else if (item.id === 'castle_hall_banquet') {
                sfx.pickup();
                showNotification("🏰 ĐẠI ĐIỆN HOÀNG GIA (TẦNG 1): Khám phá bàn tiệc kỵ sĩ và dàn giáp trụ thần điện Tsukiezz!");
            }
            else if (item.id === 'castle_throne') {
                sfx.pickup();
                showNotification("👑 THÁNH ĐIỆN NGAI VÀNG (TẦNG 2): Ngồi lên Ngai Vàng Mặt Trăng! Vinh danh Tân Vương Tsukiezz!");
            }
            else if (item.id === 'castle_library') {
                sfx.playTone(840, 'sine', 0.3, 0.2);
                showNotification("📜 THƯ VIỆN HOÀNG GIA (TẦNG 2): Đọc cuốn sách ma thuật cổ! Mở khóa bí mật lối lên gác mái!");
            }
            else if (item.id === 'castle_attic_core') {
                sfx.portalOpen();
                showNotification("✨ GÁC MÁI BÍ MẬT (TẦNG 3): Kích hoạt Trái Tim Nguyệt Tộc! Nhận Chúc Phúc Tinh Tú Tối Thượng!");
            }
            else if (item.type === 'throne') {
                sfx.pickup();
                showNotification("👑 ĐÃ NGỒI LÊN NGAI VÀNG TSUKIEZZ: Vinh danh Tân Vương của Vương Quốc Mặt Trăng!");
            }
            else if (item.type === 'tree') {
                sfx.pickup();
                showNotification("🌳 ĐẠI CỔ THỤ NGUYỆT TỘC: Tinh hoa 1000 năm thấm nhuần! Tăng 100% Tốc Độ Di Chuyển!");
            }
            else if (item.type === 'cave' || item.type === 'chest') {
                sfx.pickup();
                showNotification("💎 RƯƠNG BÁU HANG ĐỘNG: Đã mở khóa 500 Tinh Thể Nguyệt Quang Cổ Đại!");
            }
            else if (item.type === 'observatory') {
                sfx.playTone(920, 'sine', 0.4, 0.2);
                showNotification("🔭 ĐÀI THIÊN VĂN: Đã phát hiện vành đai Sao Thổ và chòm sao Linh Thú Tsukiezz!");
            }
        }"""

new_interactions = """        let speedBuffTimer = 0;

        function handleInteraction() {
            if (!nearbyItem || gameState.inDialogue) return;
            const item = nearbyItem;

            if (item.type === 'npc') {
                startDialogue();
            }
            else if (item.type === 'colosseum') {
                sfx.attackSound(false);
                triggerAttack();
                showNotification("⚔️ ĐẤU TRƯỜNG LA MÃ: Bạn đã rút Thánh Kiếm Nguyệt Quang! Kích hoạt Luồng Kiếm Khí Quét Chướng Khí (+50 Sức Mạnh)!");
            }
            else if (item.type === 'space_station') {
                sfx.playTone(880, 'square', 0.4, 0.25);
                sfx.playTone(1174, 'sine', 0.5, 0.2);
                showNotification("🛸 TRẠM VŨ TRỤ TSUKIEZZ: Vệ tinh lượng tử kích hoạt! Chiếu chùm laser định vị thiên hà!");
            }
            else if (item.type === 'altar') {
                sfx.portalOpen();
                showNotification("🩸 TRỤ TẾ ĐÀN 2 TẦNG: Trái Tim Hư Không bừng sáng! Cột lửa huyết sắc bùng cháy, hồi 100% Sinh Lực & Mana!");
            }
            else if (item.type === 'mercury_lake') {
                sfx.pickup();
                sfx.playTone(720, 'sine', 0.5, 0.2);
                showNotification("🌊 HỒ THỦY NGÂN GƯƠNG BẠC: Dòng nước phản chiếu thiên hà! Nhận Khiên Thủy Ngân Gương Bạc (+100 Giáp)!");
            }
            else if (item.id === 'castle_dungeon_cell') {
                sfx.pickup();
                showNotification("🗝️ NGỤC GIAM BÍ MẬT: Nhặt được Hộp Sọ Dạ Quang & Chìa Khóa Hư Không của Tù Nhân Cổ Đại!");
            }
            else if (item.id === 'castle_dungeon_treasury') {
                sfx.pickup();
                sfx.playTone(987, 'sine', 0.4, 0.25);
                showNotification("🗝️ HẦM NGỤC HOÀNG GIA: Đã mở rương kho báu bí mật! Tinh thể phát sáng bùng nổ (+1000 Nguyệt Tinh)!");
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
                sfx.playTone(840, 'sine', 0.35, 0.2);
                showNotification("📜 THƯ VIỆN HOÀNG GIA (TẦNG 2): Đọc Mật Điển Ma Thuật! Mở khóa bí mật cầu thang dẫn lên Gác Mái!");
            }
            else if (item.id === 'castle_attic_core') {
                sfx.portalOpen();
                sfx.playTone(1046, 'sine', 0.6, 0.3);
                showNotification("✨ GÁC MÁI BÍ MẬT (TẦNG 3): Kích hoạt Trái Tim Nguyệt Tộc! Mưa sao băng tinh tú bùng nổ quanh gác mái!");
            }
            else if (item.type === 'tree') {
                sfx.pickup();
                speedBuffTimer = 25.0;
                showNotification("🌳 ĐẠI CỔ THỤ NGUYỆT TỘC: Tinh hoa 1000 năm ban tặng phước lành ánh sáng (+40% Tốc Độ)!");
            }
            else if (item.type === 'cave' || item.type === 'chest') {
                sfx.pickup();
                sfx.playTone(880, 'sine', 0.4, 0.25);
                showNotification("💎 HANG ĐỘNG NGUYỆT TINH: Đã mở Rương Báu Pha Lê! Nhận 500 Tinh Thể Nguyệt Quang Cổ Đại!");
            }
            else if (item.type === 'observatory') {
                sfx.playTone(920, 'sine', 0.4, 0.2);
                sfx.playTone(1318, 'sine', 0.5, 0.2);
                showNotification("🔭 ĐÀI THIÊN VĂN: Kính viễn vọng tự động xoay và chiếu chùm tia laser lên vành đai Sao Thổ!");
            }
        }"""
replacements.append(("Enhanced Building Interactions", old_interactions, new_interactions))

# =====================================================================
# 5. ANIMATION LOOP: ENHANCED ANIMATIONS, LEANING, CAPE, FOOTSTEPS & CAMERA
# =====================================================================
old_anim_loop_core = """                const isMoving = (inputX !== 0 || inputZ !== 0);
                const currentSpeed = keys.shift ? 7.5 : 4.5; // Proportional and nimble for 5x smaller character

                // Auto-standup if sitting and player starts moving or jumps
                if (isSitting && (isMoving || keys.jump)) {
                    isSitting = false;
                    const sitBtn = document.getElementById('btn-toggle-sit');
                    if (sitBtn) {
                        sitBtn.textContent = '🧘 Ngồi Nghỉ (C)';
                        sitBtn.style.background = 'rgba(255, 215, 0, 0.25)';
                        sitBtn.style.color = '#ffd700';
                    }
                }

                if (isMoving && !isSitting) {
                    // Camera forward & right vectors on XZ ground plane
                    const forwardX = -Math.sin(camYaw);
                    const forwardZ = -Math.cos(camYaw);
                    const rightX = Math.cos(camYaw);
                    const rightZ = -Math.sin(camYaw);

                    const moveDir = new THREE.Vector3(
                        inputX * rightX + inputZ * (-forwardX),
                        0,
                        inputX * rightZ + inputZ * (-forwardZ)
                    ).normalize();

                    const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                    playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, 14 * delta);

                    const stepX = moveDir.x * currentSpeed * delta;
                    const stepZ = moveDir.z * currentSpeed * delta;

                    // Axis-separated solid collision resolution with height awareness (allows smooth sliding along walls & pillars)
                    if (!checkCollision(playerGroup.position.x + stepX, playerGroup.position.z, playerGroup.position.y, 0.20)) {
                        playerGroup.position.x += stepX;
                    }
                    if (!checkCollision(playerGroup.position.x, playerGroup.position.z + stepZ, playerGroup.position.y, 0.20)) {
                        playerGroup.position.z += stepZ;
                    }

                    // Increment walk cadence
                    walkCycle += delta * (keys.shift ? 16 : 10.5);

                    // =========================================================
                    // REAL WALKING LIMB ANIMATION (LEGS, ARMS, BODY, CAPE, EARS)
                    // =========================================================
                    if (activeLimbs) {
                        const legSwing = Math.sin(walkCycle) * 0.72;

                        // Alternating Leg Swings
                        activeLimbs.leftLeg.rotation.x = legSwing;
                        activeLimbs.rightLeg.rotation.x = -legSwing;

                        // Foot lift off ground during forward stride
                        activeLimbs.leftLeg.position.y = 0.45 + Math.max(0, -Math.sin(walkCycle)) * 0.12;
                        activeLimbs.rightLeg.position.y = 0.45 + Math.max(0, Math.sin(walkCycle)) * 0.12;

                        // Natural Arm Swings opposing legs
                        if (!isAttacking) {
                            activeLimbs.rightArm.rotation.x = -legSwing * 0.55;
                            activeLimbs.leftArm.rotation.x = legSwing * 0.42;
                            activeLimbs.leftArm.rotation.z = -0.15 + Math.cos(walkCycle) * 0.08;
                        }

                        // Body Torso Bounce & Cute Waddle
                        activeLimbs.body.position.y = 0.45 + Math.abs(Math.sin(walkCycle * 2)) * 0.12;
                        activeLimbs.body.rotation.z = Math.sin(walkCycle) * 0.075; // Hip waddle
                        activeLimbs.body.rotation.y = Math.sin(walkCycle) * 0.045;

                        // Flowing Cape & Ear Physics
                        if (activeLimbs.cape) {
                            activeLimbs.cape.rotation.x = 0.38 + (keys.shift ? 0.35 : 0.18) + Math.sin(walkCycle * 2) * 0.12;
                        }
                        if (activeLimbs.leftEar && activeLimbs.rightEar) {
                            activeLimbs.leftEar.rotation.z = 0.28 + Math.sin(walkCycle * 2) * 0.07;
                            activeLimbs.rightEar.rotation.z = -0.28 - Math.sin(walkCycle * 2) * 0.07;
                        }
                    }
                } else {"""

new_anim_loop_core = """                const isMoving = (inputX !== 0 || inputZ !== 0);

                // Handle speed buff
                if (speedBuffTimer > 0) speedBuffTimer -= delta;
                const buffMultiplier = (speedBuffTimer > 0) ? 1.4 : 1.0;
                const currentSpeed = (keys.shift ? 8.0 : 4.8) * buffMultiplier;

                // Auto-standup if sitting and player starts moving or jumps
                if (isSitting && (isMoving || keys.jump)) {
                    isSitting = false;
                    const sitBtn = document.getElementById('btn-toggle-sit');
                    if (sitBtn) {
                        sitBtn.textContent = '🧘 Ngồi Nghỉ (C)';
                        sitBtn.style.background = 'rgba(255, 215, 0, 0.25)';
                        sitBtn.style.color = '#ffd700';
                    }
                }

                // Animate rotating magic aura ring beneath feet
                if (magicAuraRing) {
                    magicAuraRing.rotation.z += 0.025;
                    magicAuraRing.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.05);
                }

                // Animate floating crown if active
                if (crownGroup && crownGroup.visible) {
                    crownGroup.rotation.y += 0.03;
                    crownGroup.position.y = 2.2 + Math.sin(time * 3.0) * 0.08;
                }

                // Update fading footstep sparkle particles
                footstepParticles.forEach(p => {
                    if (p.mesh.visible) {
                        p.life += delta;
                        p.mesh.scale.multiplyScalar(1.0 + 0.8 * delta);
                        p.mesh.material.opacity = Math.max(0, 0.85 * (1.0 - p.life / p.maxLife));
                        if (p.life >= p.maxLife) p.mesh.visible = false;
                    }
                });

                // Animate road pylon lanterns floating crystals
                crystalPylonLights.forEach(p => {
                    p.mesh.position.y = p.baseY + Math.sin(time * 2.5 + p.offset) * 0.12;
                    p.mesh.rotation.y += 0.03;
                    p.mesh.rotation.x += 0.015;
                });

                if (isMoving && !isSitting) {
                    // Camera forward & right vectors on XZ ground plane
                    const forwardX = -Math.sin(camYaw);
                    const forwardZ = -Math.cos(camYaw);
                    const rightX = Math.cos(camYaw);
                    const rightZ = -Math.sin(camYaw);

                    const moveDir = new THREE.Vector3(
                        inputX * rightX + inputZ * (-forwardX),
                        0,
                        inputX * rightZ + inputZ * (-forwardZ)
                    ).normalize();

                    const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                    playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, 14 * delta);

                    const stepX = moveDir.x * currentSpeed * delta;
                    const stepZ = moveDir.z * currentSpeed * delta;

                    // Axis-separated solid collision resolution with height awareness (allows smooth sliding along walls & pillars)
                    if (!checkCollision(playerGroup.position.x + stepX, playerGroup.position.z, playerGroup.position.y, 0.20)) {
                        playerGroup.position.x += stepX;
                    }
                    if (!checkCollision(playerGroup.position.x, playerGroup.position.z + stepZ, playerGroup.position.y, 0.20)) {
                        playerGroup.position.z += stepZ;
                    }

                    // Increment walk cadence
                    walkCycle += delta * (keys.shift ? 18 : 11.5);

                    // Emit footstep sparkle on road / ground every step
                    if (Math.sin(walkCycle) > 0.95 || Math.sin(walkCycle) < -0.95) {
                        emitFootstepSparkle(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z);
                    }

                    // =========================================================
                    // HIGH-FIDELITY WALKING LIMB ANIMATION (LEGS, ARMS, LEAN, CAPE, EARS)
                    // =========================================================
                    if (activeLimbs) {
                        const strideAmp = keys.shift ? 0.92 : 0.74;
                        const legSwing = Math.sin(walkCycle) * strideAmp;

                        // Alternating Leg Swings with natural stride
                        activeLimbs.leftLeg.rotation.x = legSwing;
                        activeLimbs.rightLeg.rotation.x = -legSwing;

                        // Foot lift off ground during forward stride & firm plant
                        activeLimbs.leftLeg.position.y = 0.45 + Math.max(0, -Math.sin(walkCycle)) * 0.16;
                        activeLimbs.rightLeg.position.y = 0.45 + Math.max(0, Math.sin(walkCycle)) * 0.16;

                        // Natural Arm Swings opposing legs
                        if (!isAttacking) {
                            activeLimbs.rightArm.rotation.x = -legSwing * 0.65;
                            activeLimbs.leftArm.rotation.x = legSwing * 0.52;
                            activeLimbs.leftArm.rotation.z = -0.15 + Math.cos(walkCycle) * 0.08;
                        }

                        // Torso Forward Lean into Movement Direction (Realistic Sprint/Walk Lean)
                        const targetTorsoLean = keys.shift ? 0.22 : 0.12;
                        activeLimbs.body.rotation.x = THREE.MathUtils.lerp(activeLimbs.body.rotation.x, targetTorsoLean, 10 * delta);

                        // Body Torso Bounce & Cute Waddle
                        activeLimbs.body.position.y = 0.45 + Math.abs(Math.sin(walkCycle * 2)) * 0.14;
                        activeLimbs.body.rotation.z = Math.sin(walkCycle) * (keys.shift ? 0.11 : 0.075);
                        activeLimbs.body.rotation.y = Math.sin(walkCycle) * 0.05;

                        // Flowing Cape & Ear Physics (Billowing high during sprint!)
                        if (activeLimbs.cape) {
                            const targetCape = (keys.shift ? 0.88 : 0.48) + Math.sin(walkCycle * 2) * 0.16;
                            activeLimbs.cape.rotation.x = THREE.MathUtils.lerp(activeLimbs.cape.rotation.x, targetCape, 12 * delta);
                        }
                        if (activeLimbs.leftEar && activeLimbs.rightEar) {
                            activeLimbs.leftEar.rotation.z = 0.28 + Math.sin(walkCycle * 2) * 0.09;
                            activeLimbs.rightEar.rotation.z = -0.28 - Math.sin(walkCycle * 2) * 0.09;
                        }
                    }
                } else {"""
replacements.append(("Core Animation Loop Overhaul", old_anim_loop_core, new_anim_loop_core))

# =====================================================================
# 6. IDLE BREATHING TORSO LEAN RESET
# =====================================================================
old_idle_reset = """                            activeLimbs.body.position.y = 0.45 + breath;
                            activeLimbs.body.rotation.z = THREE.MathUtils.lerp(activeLimbs.body.rotation.z, 0, 8 * delta);
                            activeLimbs.body.rotation.y = THREE.MathUtils.lerp(activeLimbs.body.rotation.y, 0, 8 * delta);"""

new_idle_reset = """                            activeLimbs.body.position.y = 0.45 + breath;
                            activeLimbs.body.rotation.x = THREE.MathUtils.lerp(activeLimbs.body.rotation.x, 0, 8 * delta);
                            activeLimbs.body.rotation.z = THREE.MathUtils.lerp(activeLimbs.body.rotation.z, 0, 8 * delta);
                            activeLimbs.body.rotation.y = THREE.MathUtils.lerp(activeLimbs.body.rotation.y, 0, 8 * delta);"""
replacements.append(("Idle Lean Reset", old_idle_reset, new_idle_reset))

# =====================================================================
# 7. CAMERA POSITIONING & PITCH (FRAMES GROUND & FEET CLEARLY)
# =====================================================================
old_camera_pitch = """        let camYaw = 0;
        let camPitch = 0.28;
        let camDistance = 3.2; // Optimized for 5x smaller character to appreciate colossal scale"""

new_camera_pitch = """        let camYaw = 0;
        let camPitch = 0.38; // Slightly elevated pitch so ground & crystal road beneath feet are always crystal clear!
        let camDistance = 3.4; // Beautiful framing for 5x scale character on the vast moon"""
replacements.append(("Camera Pitch & Distance", old_camera_pitch, new_camera_pitch))

# Verify all needles first
all_ok = True
for name, old_str, new_str in replacements:
    old_norm = old_str.replace('\r\n', '\n')
    if old_norm not in content:
        print(f"ERROR: could not find match for: {name}")
        all_ok = False
    else:
        print(f"VERIFIED: {name}")

if not all_ok:
    print("\nAborting due to missing matches.")
    sys.exit(1)

for name, old_str, new_str in replacements:
    old_norm = old_str.replace('\r\n', '\n')
    new_norm = new_str.replace('\r\n', '\n')
    content = content.replace(old_norm, new_norm, 1)
    print(f"Applied: {name}")

if is_crlf:
    content = content.replace('\n', '\r\n')

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESS: All Moon Surface, Crystal Roadways, Enhanced Animations, and Interactions applied to demo/index.html!")
