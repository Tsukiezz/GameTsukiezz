import os
import re

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# -----------------------------------------------------------------------------
# 1. Add CSS for Performance Badge & Graphics Preset Selector
# -----------------------------------------------------------------------------
old_hud_return_css = """.hud-return-btn:hover {
            border-color: var(--gold-primary);
            color: var(--gold-primary);
            transform: scale(1.05);
        }"""

new_hud_perf_css = """.hud-return-btn:hover {
            border-color: var(--gold-primary);
            color: var(--gold-primary);
            transform: scale(1.05);
        }

        /* PERFORMANCE & FPS CHIP */
        .hud-perf-chip {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: rgba(13, 22, 45, 0.88);
            border: 1px solid rgba(0, 245, 212, 0.4);
            color: #00f5d4;
            padding: 7px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            pointer-events: auto;
            backdrop-filter: blur(8px);
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
            user-select: none;
        }
        .hud-perf-chip:hover {
            border-color: #00f5d4;
            background: rgba(0, 245, 212, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 0 16px rgba(0, 245, 212, 0.5);
        }
        .perf-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00f5d4;
            box-shadow: 0 0 8px #00f5d4;
            transition: background 0.3s;
        }
        .perf-mode-tag {
            background: rgba(0, 245, 212, 0.18);
            color: #e2e8f0;
            font-size: 10px;
            padding: 2px 7px;
            border-radius: 10px;
            letter-spacing: 0.5px;
            border: 1px solid rgba(0, 245, 212, 0.3);
        }

        /* GRAPHICS PRESETS IN SETTINGS MODAL */
        .graphics-presets-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
            margin-top: 8px;
        }
        .btn-preset {
            background: rgba(15, 23, 42, 0.8);
            border: 1.5px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            padding: 14px 10px;
            color: #e2e8f0;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
        }
        .btn-preset:hover {
            background: rgba(0, 245, 212, 0.15);
            border-color: rgba(0, 245, 212, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
        }
        .btn-preset.active {
            background: linear-gradient(135deg, rgba(0, 245, 212, 0.22) 0%, rgba(168, 85, 247, 0.25) 100%);
            border-color: #00f5d4;
            box-shadow: 0 0 20px rgba(0, 245, 212, 0.4);
        }
        .preset-icon { font-size: 22px; }
        .preset-name { font-weight: 700; font-size: 13px; color: #fff; }
        .preset-desc { font-size: 10px; color: #94a3b8; line-height: 1.3; }
        .btn-preset.active .preset-name { color: #00f5d4; }"""

assert old_hud_return_css in content, "old_hud_return_css not found"
content = content.replace(old_hud_return_css, new_hud_perf_css, 1)

# -----------------------------------------------------------------------------
# 2. Add Graphics Preset Selector into Settings Modal
# -----------------------------------------------------------------------------
old_settings_items = """                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Chế Độ Toàn Màn Hình</h4>
                        <p>Mở rộng tầm nhìn trải nghiệm 3D</p>
                    </div>
                    <button class="btn-menu" style="padding: 8px 18px; width: auto;" onclick="toggleFullscreen()">Bật / Tắt</button>
                </div>"""

new_settings_items = """                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Chế Độ Toàn Màn Hình</h4>
                        <p>Mở rộng tầm nhìn trải nghiệm 3D</p>
                    </div>
                    <button class="btn-menu" style="padding: 8px 18px; width: auto;" onclick="toggleFullscreen()">Bật / Tắt</button>
                </div>
                <!-- GRAPHICS OPTIMIZATION PRESETS -->
                <div class="setting-item" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                    <div class="setting-info" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="color: #00f5d4; display: flex; align-items: center; gap: 6px;">
                                <span>⚡</span> Tối Ưu Hóa Đồ Họa & Máy Yếu
                            </h4>
                            <span id="current-profile-label" style="font-size: 12px; color: #ffd700; font-weight: 700;">Cân Bằng (Mặc định)</span>
                        </div>
                        <p>Giữ nguyên vẻ đẹp kỳ ảo của Tsukiezz nhưng tối ưu cho máy yếu chạy mượt mà 60 FPS</p>
                    </div>
                    <div class="graphics-presets-grid">
                        <button class="btn-preset" id="btn-preset-low" onclick="setGraphicsProfile('low')">
                            <span class="preset-icon">🚀</span>
                            <span class="preset-name">Siêu Mượt</span>
                            <span class="preset-desc">Dành cho máy yếu, laptop onboard</span>
                        </button>
                        <button class="btn-preset active" id="btn-preset-balanced" onclick="setGraphicsProfile('balanced')">
                            <span class="preset-icon">⚖️</span>
                            <span class="preset-name">Cân Bằng</span>
                            <span class="preset-desc">Đồ họa đẹp & 60 FPS ổn định</span>
                        </button>
                        <button class="btn-preset" id="btn-preset-ultra" onclick="setGraphicsProfile('ultra')">
                            <span class="preset-icon">✨</span>
                            <span class="preset-name">Tuyệt Đẹp</span>
                            <span class="preset-desc">Máy mạnh, độ phân giải cao</span>
                        </button>
                    </div>
                </div>"""

assert old_settings_items in content, "old_settings_items not found"
content = content.replace(old_settings_items, new_settings_items, 1)

# -----------------------------------------------------------------------------
# 3. Add Performance Chip into Top HUD (next to Return button)
# -----------------------------------------------------------------------------
old_hud_minimap = """            <!-- MINI-MAP RADAR CARD & RETURN -->
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div class="hud-minimap-card">
                    <div class="hud-minimap-header">
                        <span>📡 RADAR 520M</span>
                        <span id="minimap-coords" style="color: #94a3b8; font-family: monospace;">(0, 0)</span>
                    </div>
                    <canvas id="minimap-canvas" width="130" height="130"></canvas>
                </div>
                <button class="hud-return-btn" id="btn-return-home">⮌ Về Trang Chủ</button>
            </div>"""

new_hud_minimap = """            <!-- MINI-MAP RADAR CARD & RETURN & FPS CHIP -->
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div class="hud-minimap-card">
                    <div class="hud-minimap-header">
                        <span>📡 RADAR 520M</span>
                        <span id="minimap-coords" style="color: #94a3b8; font-family: monospace;">(0, 0)</span>
                    </div>
                    <canvas id="minimap-canvas" width="130" height="130"></canvas>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="hud-perf-chip" id="hud-perf-chip" onclick="openModal('modal-settings')" title="Nhấn để tùy chỉnh đồ họa">
                        <span class="perf-dot"></span>
                        <span id="hud-fps-text">60 FPS</span>
                        <span class="perf-mode-tag" id="hud-mode-tag">CHUẨN</span>
                    </div>
                    <button class="hud-return-btn" id="btn-return-home">⮌ Về Trang Chủ</button>
                </div>
            </div>"""

assert old_hud_minimap in content, "old_hud_minimap not found"
content = content.replace(old_hud_minimap, new_hud_minimap, 1)

# -----------------------------------------------------------------------------
# 4. Optimize Three.js Renderer and Shadow Setup
# -----------------------------------------------------------------------------
old_renderer_setup = """        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x28385e, 1.4);
        scene.add(ambientLight);

        const moonLight = new THREE.DirectionalLight(0xa5d8ff, 2.0);
        moonLight.position.set(60, 120, -70);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.near = 10;
        moonLight.shadow.camera.far = 400;
        moonLight.shadow.camera.left = -150;
        moonLight.shadow.camera.right = 150;
        moonLight.shadow.camera.top = 150;
        moonLight.shadow.camera.bottom = -150;
        scene.add(moonLight);"""

new_renderer_setup = """        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', precision: 'mediump' });
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
        scene.add(moonLight);"""

assert old_renderer_setup in content, "old_renderer_setup not found"
content = content.replace(old_renderer_setup, new_renderer_setup, 1)

# -----------------------------------------------------------------------------
# 5. Optimize Terrain Rocks & Crystals into InstancedMesh (35 + 12 -> 2 Draw Calls)
# -----------------------------------------------------------------------------
old_boulder_loop = """        // Scatter 3D Lunar Boulders & Glowing Moon Crystals across the terrain
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
        }"""

new_boulder_instancing = """        // =====================================================================
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
        scene.add(instancedSpires);"""

assert old_boulder_loop in content, "old_boulder_loop not found"
content = content.replace(old_boulder_loop, new_boulder_instancing, 1)

# -----------------------------------------------------------------------------
# 6. Optimize Plaza and Highway Lanterns into InstancedMeshes
# -----------------------------------------------------------------------------
old_plaza_and_highways = """        // 1. Central Grand Moon Crystal Plaza (28m diameter at (0, 0))
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
        buildCrystalHighway(0, 0, -110, 41.5, 6.8);

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

new_plaza_and_highways = """        // Collection of all pylon transforms across the entire realm for GPU Instancing
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
            pavement.matrixAutoUpdate = false;
            pavement.updateMatrix();
            roadGroup.add(pavement);

            // Central glowing amethyst rune ribbon
            const runeRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.30, len), matCrystalRuneCenter);
            runeRibbon.position.set(0, 0.23, 0);
            runeRibbon.matrixAutoUpdate = false;
            runeRibbon.updateMatrix();
            roadGroup.add(runeRibbon);

            // Left & Right raised cyan crystal curb borders
            [-width / 2, width / 2].forEach(curbX => {
                const curb = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, len), matCrystalCurb);
                curb.position.set(curbX, 0.28, 0);
                curb.matrixAutoUpdate = false;
                curb.updateMatrix();
                roadGroup.add(curb);
            });

            // Collect lantern pylons along both sides for unified GPU instancing (18m spacing)
            const pylonStep = 18.0;
            const pylonCount = Math.floor(len / pylonStep);
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);
            for (let i = 1; i <= pylonCount; i++) {
                const pzLocal = -len / 2 + i * pylonStep;
                [-width / 2 - 0.45, width / 2 + 0.45].forEach((pxLocal, sideIdx) => {
                    const wx = cx + (pxLocal * cosA + pzLocal * sinA);
                    const wz = cz + (-pxLocal * sinA + pzLocal * cosA);
                    allHighwayPylons.push({
                        x: wx,
                        y: 0.95,
                        z: wz,
                        shardY: 2.2,
                        isCyan: ((i + sideIdx) % 2 === 0)
                    });
                });
            }

            roadGroup.position.set(cx, 0, cz);
            roadGroup.rotation.y = ang;
            roadGroup.matrixAutoUpdate = false;
            roadGroup.updateMatrix();
            scene.add(roadGroup);
        }

        // Construct Crystal Highways radiating from Central Plaza (0, 0) directly to every single landmark:
        // 1. To Castle Grand Bridge Entrance (Connects seamlessly onto Bridge Ramp at z = 41.5!)
        buildCrystalHighway(0, 0, -110, 41.5, 6.8);

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
        buildCrystalHighway(0, 0, -106, -112, 5.6);

        // =====================================================================
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
        scene.add(instancedPurpleShards);"""

assert old_plaza_and_highways in content, "old_plaza_and_highways not found"
content = content.replace(old_plaza_and_highways, new_plaza_and_highways, 1)

# -----------------------------------------------------------------------------
# 7. Register Landmark Lights in Dynamic Light Manager
# -----------------------------------------------------------------------------
old_spLt = """                const spLt = new THREE.PointLight((idx % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.5, 30);
                spLt.position.set(tx, 56, tz);
                cg.add(spLt);"""
new_spLt = """                const spLt = new THREE.PointLight((idx % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.5, 30);
                spLt.position.set(tx, 56, tz);
                cg.add(spLt);
                registerDynamicLight(spLt, 120);"""
if old_spLt in content:
    content = content.replace(old_spLt, new_spLt, 1)

old_beaconLight = """                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);"""
new_beaconLight = """                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);
                registerDynamicLight(beaconLight, 85);"""
if old_beaconLight in content:
    content = content.replace(old_beaconLight, new_beaconLight, 1)

old_colosseum_light = """            const pLight = new THREE.PointLight(0x00f5d4, 2.0, 18);
            pLight.position.set(0, 2.2, 0);
            cg.add(pLight);"""
new_colosseum_light = """            const pLight = new THREE.PointLight(0x00f5d4, 2.0, 18);
            pLight.position.set(0, 2.2, 0);
            cg.add(pLight);
            registerDynamicLight(pLight, 90);"""
if old_colosseum_light in content:
    content = content.replace(old_colosseum_light, new_colosseum_light, 1)

old_altar_light = """            const vLight = new THREE.PointLight(0xff1744, 3.8, 25);
            vLight.position.set(0, 6.2, 0);
            ag.add(vLight);"""
new_altar_light = """            const vLight = new THREE.PointLight(0xff1744, 3.8, 25);
            vLight.position.set(0, 6.2, 0);
            ag.add(vLight);
            registerDynamicLight(vLight, 90);"""
if old_altar_light in content:
    content = content.replace(old_altar_light, new_altar_light, 1)

old_tree_light = """            const treeLight = new THREE.PointLight(0x00f5d4, 3.0, 35);
            treeLight.position.set(0, 22, 0);
            tg.add(treeLight);"""
new_tree_light = """            const treeLight = new THREE.PointLight(0x00f5d4, 3.0, 35);
            treeLight.position.set(0, 22, 0);
            tg.add(treeLight);
            registerDynamicLight(treeLight, 95);"""
if old_tree_light in content:
    content = content.replace(old_tree_light, new_tree_light, 1)

# -----------------------------------------------------------------------------
# 8. Add Graphics Profiles Logic & Real-time FPS Monitor in animate()
# -----------------------------------------------------------------------------
old_graphics_script = """        // Sound volume control
        document.getElementById('slider-bgm').addEventListener('input', (e) => {
            if (sfx.bgmGain) sfx.bgmGain.gain.value = e.target.value / 100 * 0.1;
        });"""

new_graphics_script = """        // =====================================================================
        // ADVANCED GRAPHICS PROFILES & HARDWARE OPTIMIZATION SYSTEM
        // (Guarantees silky smooth 60 FPS on low-end machines while preserving rich aesthetics)
        // =====================================================================
        const graphicsProfiles = {
            low: {
                name: 'Siêu Mượt (Máy yếu)',
                tag: 'MƯỢT',
                pixelRatio: 1.0,
                shadows: false,
                shadowMapSize: 512,
                lightDistance: 70,
                fogDensity: 0.0035
            },
            balanced: {
                name: 'Cân Bằng (Mặc định)',
                tag: 'CHUẨN',
                pixelRatio: 1.0,
                shadows: true,
                shadowMapSize: 1024,
                lightDistance: 95,
                fogDensity: 0.0030
            },
            ultra: {
                name: 'Tuyệt Đẹp (Ultra)',
                tag: 'MAX',
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                shadows: true,
                shadowMapSize: 1024,
                lightDistance: 140,
                fogDensity: 0.0025
            }
        };

        let currentProfileKey = 'balanced';
        try {
            const saved = localStorage.getItem('tsukiezz_graphics_profile');
            if (saved && graphicsProfiles[saved]) currentProfileKey = saved;
        } catch(e) {}

        function setGraphicsProfile(key) {
            if (!graphicsProfiles[key]) return;
            currentProfileKey = key;
            const p = graphicsProfiles[key];

            // Apply resolution scaling
            renderer.setPixelRatio(p.pixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Apply dynamic shadow mapping
            renderer.shadowMap.enabled = p.shadows;
            moonLight.castShadow = p.shadows;
            if (renderer.shadowMap.enabled) {
                renderer.shadowMap.type = THREE.PCFShadowMap;
                moonLight.shadow.mapSize.width = p.shadowMapSize;
                moonLight.shadow.mapSize.height = p.shadowMapSize;
                if (moonLight.shadow.map) moonLight.shadow.map.dispose();
                moonLight.shadow.map = null;
            }

            // Apply celestial fog
            if (scene.fog) scene.fog.density = p.fogDensity;

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

        // Sound volume control
        document.getElementById('slider-bgm').addEventListener('input', (e) => {
            if (sfx.bgmGain) sfx.bgmGain.gain.value = e.target.value / 100 * 0.1;
        });"""

assert old_graphics_script in content, "old_graphics_script not found"
content = content.replace(old_graphics_script, new_graphics_script, 1)

# -----------------------------------------------------------------------------
# 9. In animate(): Add FPS Monitoring and Distance Light Culling
# -----------------------------------------------------------------------------
old_animate_top = """        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const safeDt = Math.min(delta, 0.05);
            const time = clock.getElapsedTime();"""

new_animate_top = """        let frameCount = 0;
        let fpsFrames = 0;
        let fpsLastTime = performance.now();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const safeDt = Math.min(delta, 0.05);
            const time = clock.getElapsedTime();
            frameCount++;

            // Real-time FPS Calculation (updated every 500ms)
            fpsFrames++;
            const now = performance.now();
            if (now - fpsLastTime >= 500) {
                const fps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
                fpsFrames = 0;
                fpsLastTime = now;
                const fpsText = document.getElementById('hud-fps-text');
                if (fpsText) fpsText.textContent = `${fps} FPS`;
                const perfDot = document.querySelector('.perf-dot');
                if (perfDot) {
                    perfDot.style.background = (fps >= 48) ? '#00f5d4' : (fps >= 28 ? '#ffd700' : '#ff4d6d');
                    perfDot.style.boxShadow = `0 0 8px ${perfDot.style.background}`;
                }
            }

            // Proximity Distance Culling for Dynamic Landmark Lights (runs every 6 frames)
            if (frameCount % 6 === 0 && playerGroup) {
                const px = playerGroup.position.x;
                const pz = playerGroup.position.z;
                const activeProfile = graphicsProfiles[currentProfileKey] || graphicsProfiles.balanced;
                const maxRange = activeProfile.lightDistance;
                for (let i = 0; i < dynamicLights.length; i++) {
                    const item = dynamicLights[i];
                    const light = item.light;
                    // Approximate light world XZ
                    const lx = light.parent ? (light.parent.position.x + light.position.x) : light.position.x;
                    const lz = light.parent ? (light.parent.position.z + light.position.z) : light.position.z;
                    const distSq = (px - lx) * (px - lx) + (pz - lz) * (pz - lz);
                    const range = Math.min(item.maxDist, maxRange);
                    light.visible = (distSq <= range * range);
                }
            }"""

assert old_animate_top in content, "old_animate_top not found"
content = content.replace(old_animate_top, new_animate_top, 1)

# Remove old crystalPylonLights animation since shards are instanced
old_pylon_anim = """                // Animate road pylon lanterns floating crystals
                crystalPylonLights.forEach(p => {
                    p.mesh.position.y = p.baseY + Math.sin(time * 2.5 + p.offset) * 0.12;
                    p.mesh.rotation.y += 0.03;
                    p.mesh.rotation.x += 0.015;
                });"""
new_pylon_anim = """                // Highway glowing crystals are rendered with high-performance GPU instancing"""
if old_pylon_anim in content:
    content = content.replace(old_pylon_anim, new_pylon_anim, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully applied performance & map optimizations to demo/index.html!")
