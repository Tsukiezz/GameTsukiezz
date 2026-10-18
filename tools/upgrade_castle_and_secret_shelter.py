import os
import re

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# -----------------------------------------------------------------------------
# 1. Update getGroundElevation and checkCollision
# -----------------------------------------------------------------------------
old_ground_and_collision = """            // Castle Multi-Story complex floor plates
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.5 && pz <= 146.0) {
                // Front entrance vestibule connected directly to Grand Bridge Ramp: always Floor 1
                if (px >= -116.0 && px <= -104.0 && pz <= 104.0) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                } else if (py < 3.8 && (px <= -118.0 || pz >= 105.0)) {
                    baseElev = 1.0; // TẦNG HẦM (DUNGEON / CRYPT)
                } else if (py < 9.8) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                } else if (py < 16.8) {
                    baseElev = 13.0; // TẦNG 2 (NGẠI VÀNG & THƯ VIỆN)
                } else {
                    baseElev = 20.0; // TẦNG 3 (GÁC MÁI BÍ MẬT)
                }
            }"""

new_ground_and_collision = """            // Castle Multi-Story complex floor plates (Basement Y=1.0m, Fl.1 Y=6.0m, Fl.2 Y=13.0m, Attic Y=20.0m)
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.0 && pz <= 146.0) {
                // Front entrance vestibule connected directly to Grand Bridge Ramp: always Floor 1
                if (px >= -116.0 && px <= -104.0 && pz <= 104.0) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                } else if (py < 4.2) {
                    baseElev = 1.0; // TẦNG HẦM (HẦM TRÚ ẨN BÍ MẬT & HẦM NGỤC)
                } else if (py < 10.2) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN HOÀNG GIA)
                } else if (py < 17.2) {
                    // Level 2 Atrium Gap opening: between X=[-118.5, -101.5] and Z=[106.5, 131.0]
                    if (px > -118.5 && px < -101.5 && pz > 106.5 && pz < 131.0) {
                        baseElev = 6.0; // Open air mezzanine void - falls down to Floor 1
                    } else {
                        baseElev = 13.0; // TẦNG 2 (THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN)
                    }
                } else {
                    baseElev = 20.0; // TẦNG 3 (GÁC MÁI BÍ MẬT & VỌNG CẢNH)
                }
            }"""

assert old_ground_and_collision in content, "old_ground_and_collision not found"
content = content.replace(old_ground_and_collision, new_ground_and_collision, 1)

# Check and update checkCollision for solid castle boundary
old_check_collision = """        function checkCollision(px, pz, py = (playerGroup ? playerGroup.position.y : 0), playerRadius = 0.20) {
            // World Boundary (520m total realm, player bounded within +/- 248m)
            if (Math.abs(px) > 248 || Math.abs(pz) > 248) return true;

            // Solid Castle Base Mesa Cliff:
            if (py < 4.8 && currentGroundY < 3.8) {
                if (px + playerRadius > -136.0 && px - playerRadius < -84.0 &&
                    pz + playerRadius > 92.0 && pz - playerRadius < 148.0) {
                    if (pz <= 95.0) {
                        const onRamp = (px >= -114.5 && px <= -105.5);
                        if (!onRamp) return true;
                    }
                }
            }"""

new_check_collision = """        function checkCollision(px, pz, py = (playerGroup ? playerGroup.position.y : 0), playerRadius = 0.20) {
            // World Boundary (520m total realm, player bounded within +/- 248m)
            if (Math.abs(px) > 248 || Math.abs(pz) > 248) return true;

            // Solid Castle Base Mesa Cliff:
            // Prevents walking through stone base from moon ground outside the castle
            if (py < 5.0) {
                if (px + playerRadius > -136.0 && px - playerRadius < -84.0 &&
                    pz + playerRadius > 93.5 && pz - playerRadius < 146.5) {
                    // Only allowed entrance is Grand Bridge Ramp
                    const onBridgeRamp = (px >= -114.5 && px <= -105.5 && pz <= 95.5);
                    // Or inside underground dungeon interior
                    const insideDungeon = (px >= -129.0 && px <= -91.0 && pz >= 99.0 && pz <= 141.0 && py >= 0.8 && py <= 4.8);
                    if (!onBridgeRamp && !insideDungeon) {
                        return true;
                    }
                }
            }"""

assert old_check_collision in content, "old_check_collision not found"
content = content.replace(old_check_collision, new_check_collision, 1)

# -----------------------------------------------------------------------------
# 2. Extract and Replace buildCastle3D() with Complete Realistic Castle Model
# -----------------------------------------------------------------------------
# Find exact start of buildCastle3D
castle_start_marker = "        // 2. ĐẠI LÂU ĐÀI HOÀNG GIA 4 TẦNG CHI TIẾT (-110, 120)"
castle_end_marker = "        buildCastle3D();\n\n        // 3. ĐẤU TRƯỜNG LA MÃ (115, 110)"

assert castle_start_marker in content, "castle_start_marker not found"
assert castle_end_marker in content, "castle_end_marker not found"

start_idx = content.find(castle_start_marker)
end_idx = content.find(castle_end_marker) + len("        buildCastle3D();")

old_castle_block = content[start_idx:end_idx]

new_castle_code = """        // 2. ĐẠI LÂU ĐÀI HOÀNG GIA 4 TẦNG CHI TIẾT (-110, 120)
        // [Tầng Hầm (Y=1.0m) -> Tầng 1 Đại Điện (Y=6.0m) -> Tầng 2 Ngai Vàng (Y=13.0m) -> Gác Mái Bí Mật (Y=20.0m)]
        // HỆ THỐNG VẬT LÝ VA CHẠM TUYỆT ĐỐI (100% CHƯỚNG NGẠI VẬT RẮN KHÔNG ĐI XUYÊN QUA ĐƯỢC)
        // VÀ HỆ THỐNG HOẠT HỌA THỜI GIAN THỰC SỐNG ĐỘNG (LỬA ĐUỐC, LÒ SƯỞI, CỜ PHƯỚN, TINH THỂ, MA PHÁP)
        const castleAnimators = [];
        window.castleAnimators = castleAnimators;

        function buildCastle3D() {
            const cg = new THREE.Group();

            // Materials
            const matCastle = new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.8, metalness: 0.15 });
            const matDarkBase = new THREE.MeshStandardMaterial({ color: 0x131824, roughness: 0.9 });
            const matRoof = new THREE.MeshStandardMaterial({ color: 0x24123c, roughness: 0.35, metalness: 0.25 });
            const matMarble = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.4, metalness: 0.1 });
            const matGoldTrim = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });
            const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });
            const matVelvetRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
            const matVelvetPurple = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.5 });
            const matIronBars = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
            const matTimber = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.85 });
            const matOrangeGlow = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2.8 });

            // Base Mesa Platform (Foundation Y = 0 to 6m)
            const base = new THREE.Mesh(new THREE.BoxGeometry(52, 6, 56), matDarkBase);
            base.position.y = 3;
            base.receiveShadow = true;
            cg.add(base);

            // 4 Colossal Corner Gothic Spire Towers (Height: 48m, World X/Z at (+/-21, +/-23))
            [[-21, -23], [21, -23], [-21, 23], [21, 23]].forEach(([tx, tz], idx) => {
                const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 38, 16), matCastle);
                tower.position.set(tx, 22, tz);
                cg.add(tower);

                const balcony = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1.8, 16), matGoldTrim);
                balcony.position.set(tx, 41, tz);
                cg.add(balcony);

                const roof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 14, 16), matRoof);
                roof.position.set(tx, 48, tz);
                cg.add(roof);

                const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), (idx % 2 === 0 ? matCyanGlow : matPurpleGlow));
                gem.position.set(tx, 56, tz);
                cg.add(gem);

                // Register spire gem animation
                castleAnimators.push({
                    type: 'spireGem',
                    mesh: gem,
                    baseY: 56,
                    speed: 1.2 + idx * 0.3
                });

                // Add Point Light atop each spire
                const spLt = new THREE.PointLight((idx % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.5, 30);
                spLt.position.set(tx, 56, tz);
                cg.add(spLt);
                registerDynamicLight(spLt, 120);

                addCylinderCollider(-110 + tx, 120 + tz, 4.8, 0, 50);
            });

            // =================================================================
            // OUTER CASTLE WALLS ACROSS ALL FLOORS (SOLID, CANNOT BE PENETRATED)
            // Left Wall (X = -21, World -131, Z in [97, 143])
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 26, 46), matCastle);
            w1.position.set(-21, 16, 0); cg.add(w1);
            addBoxCollider(-110 - 21, 120, 2.8, 46.5, 0, 32);

            // Right Wall (X = 21, World -89, Z in [97, 143])
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 26, 46), matCastle);
            w2.position.set(21, 16, 0); cg.add(w2);
            addBoxCollider(-110 + 21, 120, 2.8, 46.5, 0, 32);

            // Back Wall (Z = 23, World 143, X in [-131, -89])
            const w3 = new THREE.Mesh(new THREE.BoxGeometry(44, 26, 2.5), matCastle);
            w3.position.set(0, 16, 23); cg.add(w3);
            addBoxCollider(-110, 120 + 23, 44.5, 2.8, 0, 32);

            // Front Balustrades left & right of Grand Bridge Gate (Fl.1 gate open at X=[-114.5, -105.5])
            const fwL = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwL.position.set(-13, 12, -26); cg.add(fwL);
            addBoxCollider(-110 - 13, 120 - 26, 17.5, 2.8, 0, 19.5);

            const fwR = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwR.position.set(13, 12, -26); cg.add(fwR);
            addBoxCollider(-110 + 13, 120 - 26, 17.5, 2.8, 0, 19.5);

            // Front Grand Arch Portal Gate
            const gateArch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.7, 12, 16, Math.PI), matGoldTrim);
            gateArch.position.set(0, 11.5, -26);
            cg.add(gateArch);

            // =================================================================
            // LEVEL 0: TẦNG HẦM - HẦM TRÚ ẨN BÍ MẬT & HẦM NGỤC HOÀNG GIA (Y = 1.0m)
            // =================================================================
            // Sàn đá phiến dày chịu lực
            const dungeonFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.95 }));
            dungeonFloor.rotation.x = -Math.PI / 2;
            dungeonFloor.position.set(0, 1.02, 0);
            cg.add(dungeonFloor);

            // Trần đá vòm kiên cố ngăn cách với Tầng 1
            const dungeonCeil = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matDarkBase);
            dungeonCeil.rotation.x = Math.PI / 2;
            dungeonCeil.position.set(0, 5.8, 0);
            cg.add(dungeonCeil);

            // 4 Bức tường bao quanh kín mít của Tầng Hầm (Y = 1.0 đến 5.8m)
            addBoxCollider(-110 - 19, 120, 1.2, 42, 0.8, 5.8); // West wall
            addBoxCollider(-110 + 19, 120, 1.2, 42, 0.8, 5.8); // East wall
            addBoxCollider(-110, 120 + 21, 38, 1.2, 0.8, 5.8); // North wall
            addBoxCollider(-110, 120 - 21, 38, 1.2, 0.8, 5.8); // South wall

            // --- KHU TRÚ ẨN BÍ MẬT HOÀNG GIA (ROYAL SECRET SHELTER & SURVIVAL BUNKER) ---
            // Tường ngăn cách kiên cố giữa Khu Trú Ẩn và Hầm Mộ (có vòm cửa đi qua)
            const shelterWallW = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.8, 16), matCastle);
            shelterWallW.position.set(-2, 3.4, -10);
            cg.add(shelterWallW);
            addBoxCollider(-110 - 2, 120 - 10, 0.9, 16, 0.8, 5.8);

            // 1. Giường Trú Ẩn Khẩn Cấp (Royal Survival Bunk Bed)
            const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 1.8), matWoodDark);
            bedFrame.position.set(-8, 1.35, -16);
            cg.add(bedFrame);

            const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.6), matVelvetRed);
            mattress.position.set(-8, 1.7, -16);
            cg.add(mattress);

            const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 1.3), matGoldTrim);
            pillow.position.set(-9.0, 1.9, -16);
            cg.add(pillow);

            // Bàn đầu giường và đèn dầu ma thuật
            const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), matWoodDark);
            nightstand.position.set(-11, 1.5, -16);
            cg.add(nightstand);

            const nightLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), matGoldTrim);
            nightLamp.position.set(-11, 2.2, -16);
            cg.add(nightLamp);

            const nightGlow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), matCyanGlow);
            nightGlow.position.set(-11, 2.5, -16);
            cg.add(nightGlow);

            // Standable & Sit-on-able bed collider (Y = 1.88m)
            addBoxCollider(-110 - 8, 120 - 16, 2.7, 1.9, 0.8, 1.88, true);
            addBoxCollider(-110 - 11, 120 - 16, 1.0, 1.0, 0.8, 2.0, true);

            // 2. Lò Sưởi Đá Âm Tường (Shelter Hearth & Fireplace)
            const hearthStone = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 3.8), matCastle);
            hearthStone.position.set(-18, 2.7, -6);
            cg.add(hearthStone);

            // Hốc lò sưởi
            const hearthHole = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 2.4), matDarkBase);
            hearthHole.position.set(-17.6, 2.0, -6);
            cg.add(hearthHole);

            // Củi gỗ đang cháy
            const logs = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8), matWoodDark);
            logs.rotation.z = Math.PI / 2;
            logs.position.set(-17.4, 1.3, -6);
            cg.add(logs);

            // Ngọn lửa lò sưởi ma thuật rực rỡ
            const hearthFlame = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), matOrangeGlow);
            hearthFlame.position.set(-17.2, 1.75, -6);
            cg.add(hearthFlame);

            const hearthLight = new THREE.PointLight(0xff6600, 3.2, 18);
            hearthLight.position.set(-16.8, 2.0, -6);
            cg.add(hearthLight);
            registerDynamicLight(hearthLight, 75);

            // Register hearth fire animation
            castleAnimators.push({
                type: 'hearthFire',
                mesh: hearthFlame,
                light: hearthLight,
                baseIntensity: 3.2,
                baseY: 1.75
            });

            // Hearth solid collider (Chặn không cho đi xuyên vào vách lò sưởi)
            addBoxCollider(-110 - 18, 120 - 6, 2.2, 4.0, 0.8, 4.5);

            // 3. Bàn Sa Bàn Tác Chiến Hoàng Gia (Command Strategy War Table)
            const stratTable = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 2.6), matCastle);
            stratTable.position.set(-10, 1.45, 0);
            cg.add(stratTable);

            // Bản đồ nổi phù điêu dạ quang
            const stratMap = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.0), matCyanGlow);
            stratMap.rotation.x = -Math.PI / 2;
            stratMap.position.set(-10, 1.92, 0);
            cg.add(stratMap);

            // 3 Tinh Thể Chiến Lược Lơ Lửng Xoay Quanh Sa Bàn
            const stratCrystals = [];
            [0x00f5d4, 0xff0055, 0xa855f7].forEach((col, cIdx) => {
                const cMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.5 });
                const crys = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), cMat);
                crys.position.set(-10, 2.4, 0);
                cg.add(crys);
                stratCrystals.push({ mesh: crys, offset: cIdx * (Math.PI * 2 / 3) });
            });
            castleAnimators.push({
                type: 'strategyCrystals',
                items: stratCrystals,
                centerX: -10,
                centerZ: 0,
                baseY: 2.35
            });

            // 2 Ghế đá chỉ huy ở 2 bên sa bàn (Ngồi được)
            [-1.8, 1.8].forEach(sideZ => {
                const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matCastle);
                chair.position.set(-10, 1.4, sideZ);
                cg.add(chair);
                addBoxCollider(-110 - 10, 120 + sideZ, 0.9, 0.9, 0.8, 1.8, true);
            });
            // Standable strategy table top (Y = 1.95m)
            addBoxCollider(-110 - 10, 120, 4.4, 2.8, 0.8, 1.95, true);

            // 4. Bàn Giả Kim Thuật & Nghiên Cứu Sinh Tồn (Alchemy Station)
            const alchTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.6), matWoodDark);
            alchTable.position.set(-10, 1.45, 8);
            cg.add(alchTable);

            // 4 Bình thuốc giả kim dạ quang
            [matCyanGlow, matPurpleGlow, matGreenGlow, matOrangeGlow].forEach((pMat, pIdx) => {
                const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.5, 8), pMat);
                bottle.position.set(-11.2 + pIdx * 0.75, 2.15, 8);
                cg.add(bottle);
            });
            // Standable alchemy table top (Y = 1.95m)
            addBoxCollider(-110 - 10, 120 + 8, 3.8, 1.8, 0.8, 1.95, true);

            // 5. Cụm Thùng Gỗ Lương Thảo & Rượu Tiếp Tế Sinh Tồn
            // 3 thùng dưới, 2 thùng trên xếp chồng
            [[-16, -14], [-14.5, -14], [-16, -12.5]].forEach(([bx, bz]) => {
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.3, 10), matWoodDark);
                barrel.position.set(bx, 1.65, bz);
                cg.add(barrel);
            });
            const topBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 1.2, 10), matWoodDark);
            topBarrel.position.set(-15.2, 2.8, -13.2);
            cg.add(topBarrel);

            // Rương quân lương
            const rationBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.2), matWoodDark);
            rationBox.position.set(-16, 1.55, 14);
            cg.add(rationBox);

            // Standable barrels & ration box colliders (Có thể nhảy lên nắp thùng!)
            addBoxCollider(-110 - 15.2, 120 - 13.5, 2.8, 2.8, 0.8, 2.3, true);
            addBoxCollider(-110 - 16, 120 + 14, 1.8, 1.4, 0.8, 2.1, true);

            // --- KHU HẦM MỘ KỴ SĨ MẶT TRĂNG CỔ ĐẠI (NORTH CRYPT) ---
            const sarcoBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 2.5), matCastle);
            sarcoBase.position.set(6, 1.6, 12);
            cg.add(sarcoBase);

            const sarcoLid = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 2.7), matGoldTrim);
            sarcoLid.position.set(6, 2.3, 12);
            cg.add(sarcoLid);

            const sarcoRune = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 8, 24), matPurpleGlow);
            sarcoRune.rotation.x = Math.PI / 2;
            sarcoRune.position.set(6, 2.52, 12);
            cg.add(sarcoRune);

            const sarcoLight = new THREE.PointLight(0xa855f7, 2.4, 15);
            sarcoLight.position.set(6, 3.2, 12);
            cg.add(sarcoLight);
            registerDynamicLight(sarcoLight, 75);

            // Standable Sarcophagus lid top (Y = 2.5m)
            addBoxCollider(-110 + 6, 120 + 12, 4.6, 2.8, 0.8, 2.55, true);

            castleAnimators.push({
                type: 'sarcoRune',
                mesh: sarcoRune
            });

            // --- KHU KHO BÁU HOÀNG GIA & CỔNG THOÁT HIỂM (EAST WING) ---
            // 3 Rương kho báu hoàng gia lớn mở nắp để lộ vàng ngọc
            for(let ch = 0; ch < 3; ch++) {
                const chest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.3), matGoldTrim);
                chest.position.set(16, 1.55, -8 + ch * 3.5);
                cg.add(chest);

                const gemLoot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), matCyanGlow);
                gemLoot.position.set(16, 2.25, -8 + ch * 3.5);
                cg.add(gemLoot);

                // Standable chest top
                addBoxCollider(-110 + 16, 120 - 8 + ch * 3.5, 2.0, 1.5, 0.8, 2.1, true);
            }

            // Giá vũ khí hoàng gia (Royal Weapon Rack)
            const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 3.4), matWoodDark);
            rackFrame.position.set(17, 2.1, 3);
            cg.add(rackFrame);
            addBoxCollider(-110 + 17, 120 + 3, 0.8, 3.6, 0.8, 3.5);

            // Cổng Dịch Chuyển Thoát Hiểm Khẩn Cấp (Secret Escape Portal)
            const portalRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.15, 8, 32), matCyanGlow);
            portalRing.rotation.x = -Math.PI / 2;
            portalRing.position.set(12, 1.05, 12);
            cg.add(portalRing);

            const portalCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), matPurpleGlow);
            portalCrystal.position.set(12, 2.4, 12);
            cg.add(portalCrystal);

            castleAnimators.push({
                type: 'portalRing',
                ring: portalRing,
                crystal: portalCrystal
            });

            // --- KHU NGỤC GIAM SẮT THÉP (SOUTHWEST CELLS) ---
            // 3 buồng giam riêng biệt
            const cellYMin = 0.8;
            const cellYMax = 5.5;

            for(let cell = 0; cell < 3; cell++) {
                const cellZ = -16 + cell * 5.2;

                // Tường ngăn cách giữa các buồng
                const pWall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.6, 0.4), matCastle);
                pWall.position.set(-16, 3.3, cellZ);
                cg.add(pWall);
                addBoxCollider(-110 - 16, 120 + cellZ, 5.0, 0.5, cellYMin, cellYMax);

                // Hàng song sắt mặt trước buồng giam (X = -13.5)
                // Buồng giam số 1 (cell === 1) bị đứt gãy mở toang lối đi cho người chơi chui vào!
                const isBrokenOpen = (cell === 1);
                for(let b = 0; b < 6; b++) {
                    if (isBrokenOpen && (b === 2 || b === 3)) continue; // Lối đi mở rộng 1.8m!
                    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 8), matIronBars);
                    bar.position.set(-13.6, 3.3, cellZ - 2.0 + b * 0.8);
                    cg.add(bar);
                }

                // Chặn va chạm song sắt: buồng 0 và 2 chặn kín, buồng 1 chừa cửa giữa
                if (!isBrokenOpen) {
                    addBoxCollider(-110 - 13.6, 120 + cellZ, 0.4, 4.8, cellYMin, cellYMax);
                } else {
                    // Buồng 1: Chặn 2 bên cạnh, để trống ở giữa
                    addBoxCollider(-110 - 13.6, 120 + cellZ - 1.6, 0.4, 1.2, cellYMin, cellYMax);
                    addBoxCollider(-110 - 13.6, 120 + cellZ + 1.6, 0.4, 1.2, cellYMin, cellYMax);
                }

                // Sợi xích sắt treo từ trần nhà đung đưa
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6), matIronBars);
                chain.position.set(-16.5, 4.6, cellZ - 1.2);
                cg.add(chain);
                castleAnimators.push({
                    type: 'chainSway',
                    mesh: chain,
                    offset: cell * 1.5
                });
            }

            // Cổ vật Hộp Sọ Dạ Quang bên trong buồng giam số 1
            const skullRelic = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matCyanGlow);
            skullRelic.position.set(-16.5, 1.4, -10.8);
            cg.add(skullRelic);

            // 4 Đuốc Đồng Ma Mị Tầng Hầm (Purple Braziers)
            const dungeonTorches = [];
            [[-6, -18], [6, -18], [-6, 18], [6, 18]].forEach(([bx, bz], fIdx) => {
                const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 1.2, 12), matIronBars);
                brazier.position.set(bx, 1.6, bz);
                cg.add(brazier);

                const flame = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), matPurpleGlow);
                flame.position.set(bx, 2.4, bz);
                cg.add(flame);

                const bLt = new THREE.PointLight(0xa855f7, 1.8, 14);
                bLt.position.set(bx, 2.6, bz);
                cg.add(bLt);
                registerDynamicLight(bLt, 75);

                dungeonTorches.push({ mesh: flame, light: bLt, offset: fIdx * 1.2 });
                addCylinderCollider(-110 + bx, 120 + bz, 0.5, 0.8, 2.5);
            });
            castleAnimators.push({
                type: 'torchesGroup',
                torches: dungeonTorches,
                baseY: 2.4
            });

            // Cầu Thang Đá Nối Tầng Hầm Lên Tầng 1 (Northwest Stairs: X = -16, Z = -22 to -10, Y = 1.0 to 6.0m)
            for(let s = 0; s <= 10; s++) {
                const stepY = 5.8 - s * 0.48;
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.3), matCastle);
                step.position.set(-16, stepY, -22 + s * 1.2);
                cg.add(step);
                addBoxCollider(-110 - 16, 120 - 22 + s * 1.2, 3.8, 1.25, 0.8, stepY + 0.25, true);
            }

            // =================================================================
            // LEVEL 1: TẦNG 1 - ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ (Y = 6.0m)
            // =================================================================
            const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matMarble);
            hallFloor.rotation.x = -Math.PI / 2;
            hallFloor.position.set(0, 6.02, 0);
            cg.add(hallFloor);

            // Thảm nhung đỏ hoàng gia trải dọc Đại Điện
            const carpet = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 34), matVelvetRed);
            carpet.rotation.x = -Math.PI / 2;
            carpet.position.set(0, 6.05, -3);
            cg.add(carpet);

            // 6 Cột Trụ Gothic với Đuốc Dạ Quang và CỜ PHƯỚN HOÀNG GIA PHẤP PHỚI
            const hallTorches = [];
            const hallBanners = [];

            for(let col = 0; col < 3; col++) {
                const colZ = -14 + col * 12;
                [-8, 8].forEach((colX, cSide) => {
                    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 7.0, 16), matCastle);
                    pillar.position.set(colX, 9.5, colZ);
                    cg.add(pillar);

                    const pCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), matGoldTrim);
                    pCap.position.set(colX, 13.0, colZ);
                    cg.add(pCap);

                    // Đuốc Đại Điện
                    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), matGoldTrim);
                    torch.position.set(colX + (colX > 0 ? -1.0 : 1.0), 9.8, colZ);
                    cg.add(torch);

                    const torchFlame = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), matCyanGlow);
                    torchFlame.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.4, colZ);
                    cg.add(torchFlame);

                    const tLt = new THREE.PointLight(0x00f5d4, 1.8, 16);
                    tLt.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.5, colZ);
                    cg.add(tLt);
                    registerDynamicLight(tLt, 85);

                    hallTorches.push({ mesh: torchFlame, light: tLt, offset: col * 1.5 + cSide });

                    // Lá Cờ Phướn Hoàng Gia (Heraldic Royal Banner)
                    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.2), matVelvetRed);
                    banner.position.set(colX + (colX > 0 ? -1.1 : 1.1), 9.6, colZ + 0.8);
                    banner.rotation.y = (colX > 0 ? -Math.PI / 2 : Math.PI / 2);
                    cg.add(banner);

                    hallBanners.push({ mesh: banner, offset: col * 1.2 + cSide });

                    addCylinderCollider(-110 + colX, 120 + colZ, 1.2, 5.8, 13.0);
                });
            }

            castleAnimators.push({
                type: 'torchesGroup',
                torches: hallTorches,
                baseY: 10.4
            });

            castleAnimators.push({
                type: 'bannersWave',
                banners: hallBanners
            });

            // Bàn Tiệc Kỵ Sĩ Hoàng Gia (Phía Tây: X = -12, Z = -5)
            const bTable = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 14), matWoodDark);
            bTable.position.set(-12, 6.6, -5);
            cg.add(bTable);

            // Ghế tiệc hoàng gia
            for(let ch = 0; ch < 5; ch++) {
                [-2.2, 2.2].forEach(chSide => {
                    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), matWoodDark);
                    chair.position.set(-12 + chSide, 6.9, -10 + ch * 2.5);
                    cg.add(chair);
                    addBoxCollider(-110 - 12 + chSide, 120 - 10 + ch * 2.5, 0.9, 0.9, 5.8, 6.9, true);
                });
            }
            // Standable Banquet Table top (Y = 7.15m)
            addBoxCollider(-110 - 12, 120 - 5, 3.4, 14.2, 5.8, 7.15, true);

            // Giá Trưng Bày Giáp Trụ Hoàng Gia (Phía Đông: X = 12, Z = -5)
            for(let a = 0; a < 2; a++) {
                const armZ = -9 + a * 8;
                const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16), matCastle);
                ped.position.set(12, 6.4, armZ);
                cg.add(ped);

                const armorSuit = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 2.4, 12), matSteel);
                armorSuit.position.set(12, 8.0, armZ);
                cg.add(armorSuit);

                const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.9), matGoldTrim);
                shield.position.set(11.4, 8.0, armZ);
                cg.add(shield);

                addCylinderCollider(-110 + 12, 120 + armZ, 1.4, 5.8, 9.6);
            }

            // Cầu Thang Đôi Hoàng Gia Dẫn Lên Tầng 2 (Z = 5 to 18)
            // 1. Nhánh giữa (Z = 5 to 11, Y = 6.0 to 9.5m)
            for(let s = 0; s < 7; s++) {
                const st = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 1.2), matCastle);
                st.position.set(0, 6.25 + s * 0.5, 5 + s * 1.0);
                cg.add(st);
                const stepTopY = 6.0 + (s + 1) * 0.5;
                addBoxCollider(-110, 120 + 5 + s * 1.0, 7.2, 1.25, 6.0, stepTopY, true);
            }

            // 2. Chiếu nghỉ trung gian (Y = 9.5m)
            const midLanding = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 3.5), matCastle);
            midLanding.position.set(0, 9.25, 11.5);
            cg.add(midLanding);
            addBoxCollider(-110, 120 + 11.5, 32.0, 3.6, 6.0, 9.5, true);

            // 3. Tách sang cánh Trái (X = -13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stL.position.set(-13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stL);
                const wingStepTopY = 9.5 + (s + 1) * 0.5;
                addBoxCollider(-110 - 13, 120 + 12 + s * 0.95, 4.8, 1.15, 9.0, wingStepTopY, true);
            }

            // 4. Tách sang cánh Phải (X = 13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stR.position.set(13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stR);
                const wingStepTopY = 9.5 + (s + 1) * 0.5;
                addBoxCollider(-110 + 13, 120 + 12 + s * 0.95, 4.8, 1.15, 9.0, wingStepTopY, true);
            }

            // =================================================================
            // LEVEL 2: TẦNG 2 - THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN HOÀNG GIA (Y = 13.0m)
            // =================================================================
            // Sàn Mezzanine lượn quanh khoảng giếng trời
            const f2North = new THREE.Mesh(new THREE.PlaneGeometry(38, 12), matMarble);
            f2North.rotation.x = -Math.PI / 2;
            f2North.position.set(0, 13.02, 16);
            cg.add(f2North);

            const f2West = new THREE.Mesh(new THREE.PlaneGeometry(10, 27), matMarble);
            f2West.rotation.x = -Math.PI / 2;
            f2West.position.set(-14, 13.02, -1.5);
            cg.add(f2West);

            const f2East = new THREE.Mesh(new THREE.PlaneGeometry(10, 27), matMarble);
            f2East.rotation.x = -Math.PI / 2;
            f2East.position.set(14, 13.02, -1.5);
            cg.add(f2East);

            const f2South = new THREE.Mesh(new THREE.PlaneGeometry(38, 5), matMarble);
            f2South.rotation.x = -Math.PI / 2;
            f2South.position.set(0, 13.02, -16);
            cg.add(f2South);

            // Lan can bảo vệ toàn bộ 4 phía Giếng Trời Atrium (Floor 2: Y = 12.8 to 15.5m)
            // Lan can Tây
            const railAtriumW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumW.position.set(-9.2, 13.6, -1.5);
            cg.add(railAtriumW);
            addBoxCollider(-110 - 9.2, 120 - 1.5, 0.6, 26.2, 12.8, 15.5);

            // Lan can Đông
            const railAtriumE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumE.position.set(9.2, 13.6, -1.5);
            cg.add(railAtriumE);
            addBoxCollider(-110 + 9.2, 120 - 1.5, 0.6, 26.2, 12.8, 15.5);

            // Lan can Nam
            const railAtriumS = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.4), matGoldTrim);
            railAtriumS.position.set(0, 13.6, -14.5);
            cg.add(railAtriumS);
            addBoxCollider(-110, 120 - 14.5, 18.2, 0.6, 12.8, 15.5);

            // Lan can Bắc
            const railAtriumN = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.4), matGoldTrim);
            railAtriumN.position.set(0, 13.6, 11.5);
            cg.add(railAtriumN);
            addBoxCollider(-110, 120 + 11.5, 18.2, 0.6, 12.8, 15.5);

            // --- NGAI VÀNG MẶT TRĂNG CỔ ĐẠI (COLOSSAL MOON THRONE) ---
            const throneDais = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), matCastle);
            throneDais.position.set(0, 13.6, 18);
            cg.add(throneDais);

            const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 2.2), matVelvetPurple);
            throneSeat.position.set(0, 14.8, 18.5);
            cg.add(throneSeat);

            const throneBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.6, 0.6), matGoldTrim);
            throneBack.position.set(0, 17.0, 19.4);
            cg.add(throneBack);

            // 2 Vầng trăng khuyết mạ vàng uy nghi 2 bên ngai
            [-1.8, 1.8].forEach(mSide => {
                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 12, 32, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(mSide, 17.5, 19.0);
                crescent.rotation.z = (mSide > 0 ? -0.4 : 0.4);
                cg.add(crescent);
            });

            // Vách hoa hồng Gothic trên tường sau lưng ngai
            const roseWindow = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.35, 16, 32), matGoldTrim);
            roseWindow.position.set(0, 18.0, 22.8);
            cg.add(roseWindow);

            const roseGlass = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), matCyanGlow);
            roseGlass.position.set(0, 18.0, 22.7);
            cg.add(roseGlass);

            const throneGlowLt = new THREE.PointLight(0x00f5d4, 3.5, 24);
            throneGlowLt.position.set(0, 17.5, 18.0);
            cg.add(throneGlowLt);
            registerDynamicLight(throneGlowLt, 95);

            // Standable Dais & Seat
            addBoxCollider(-110, 120 + 18.0, 10.2, 7.2, 13.0, 14.2, true);
            addBoxCollider(-110, 120 + 18.5, 3.4, 2.4, 14.2, 15.5, true);

            // SOLID THRONE BACK WALL (CHẶN TUYỆT ĐỐI KHÔNG CHO ĐI XUYÊN QUA LƯNG NGAI VÀNG!)
            addBoxCollider(-110, 120 + 19.4, 4.2, 1.0, 14.5, 20.0);

            // --- THƯ VIỆN HOÀNG GIA & CUỐN SÁCH MA THUẬT LƠ LỬNG ---
            for(let b = 0; b < 3; b++) {
                const bShelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 5.0), matWoodDark);
                bShelf.position.set(18.5, 15.6, -11 + b * 6.5);
                cg.add(bShelf);

                for(let bk = 0; bk < 4; bk++) {
                    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), bk % 2 === 0 ? matPurpleGlow : matCyanGlow);
                    bMesh.position.set(18.2, 14.2 + bk * 1.0, -12 + b * 6.5 + bk * 0.7);
                    cg.add(bMesh);
                }
            }
            addBoxCollider(-110 + 18.2, 120 - 6.5, 2.0, 13.0, 12.8, 19.5);

            // Bàn học học giả
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);
            addBoxCollider(-110 + 13.5, 120 - 4, 2.5, 1.7, 13.0, 14.1, true);

            // Cuốn sách Grimoire ma thuật lơ lửng xoay tròn
            const floatBook = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.8), matVelvetPurple);
            floatBook.position.set(13.5, 14.6, -4);
            floatBook.rotation.y = 0.4;
            cg.add(floatBook);

            castleAnimators.push({
                type: 'floatingBook',
                mesh: floatBook,
                baseY: 14.6
            });

            // Cầu thang bí mật 13 bậc lên Gác Mái (X = 16, Z = 1.5 to 13, Y = 13.0 to 20.0m)
            for(let s = 0; s <= 12; s++) {
                const aStep = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
                aStep.position.set(16, 13.25 + s * 0.58, 1.5 + s * 0.92);
                cg.add(aStep);
                const aStepTopY = 13.0 + (s + 1) * 0.54;
                addBoxCollider(-110 + 16, 120 + 1.5 + s * 0.92, 3.8, 1.05, 12.8, aStepTopY, true);
            }

            // =================================================================
            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & VỌNG CẢNH ASTRAL (Y = 20.0m)
            // =================================================================
            const atticFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 40), matTimber);
            atticFloor.rotation.x = -Math.PI / 2;
            atticFloor.position.set(0, 20.02, 0);
            cg.add(atticFloor);

            // Tường trước gác mái (Z = -21, World 99, Y = 19.5 to 26m)
            // Có cửa vòm ở giữa ra ban công (X = [-5, 5] mở)
            const atticFrontWallL = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 1.5), matCastle);
            atticFrontWallL.position.set(-11.5, 23, -20.5);
            cg.add(atticFrontWallL);
            addBoxCollider(-110 - 11.5, 120 - 20.5, 13.2, 1.8, 19.5, 26.0);

            const atticFrontWallR = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 1.5), matCastle);
            atticFrontWallR.position.set(11.5, 23, -20.5);
            cg.add(atticFrontWallR);
            addBoxCollider(-110 + 11.5, 120 - 20.5, 13.2, 1.8, 19.5, 26.0);

            // Vì kèo gỗ Gothic
            for(let r = 0; r < 5; r++) {
                const rZ = -16 + r * 8;
                const trussL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 0.5), matTimber);
                trussL.position.set(-9, 27, rZ);
                trussL.rotation.z = -0.55;
                cg.add(trussL);

                const trussR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 0.5), matTimber);
                trussR.position.set(9, 27, rZ);
                trussR.rotation.z = 0.55;
                cg.add(trussR);

                const tieBeam = new THREE.Mesh(new THREE.BoxGeometry(19, 0.5, 0.5), matTimber);
                tieBeam.position.set(0, 26, rZ);
                cg.add(tieBeam);
            }

            // Central Soaring Gothic Spire Roof
            const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(18, 22, 4), matRoof);
            spireRoof.position.set(0, 31, 0);
            spireRoof.rotation.y = Math.PI / 4;
            cg.add(spireRoof);

            // Giếng trời ngắm trăng (Skylight)
            const skylightGlass = new THREE.Mesh(new THREE.CircleGeometry(2.8, 16), matCyanGlow);
            skylightGlass.rotation.x = -Math.PI / 2;
            skylightGlass.position.set(0, 26.48, 0);
            cg.add(skylightGlass);

            // --- BÀN TẾ & TRÁI TIM NGUYỆT TỘC (ASTRAL CORE) ---
            const altarDais = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.9, 16), matCastle);
            altarDais.position.set(0, 20.45, 0);
            cg.add(altarDais);

            const floatingRelic = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 2), matPurpleGlow);
            floatingRelic.position.set(0, 22.2, 0);
            cg.add(floatingRelic);

            const relicRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.1, 8, 32), matCyanGlow);
            relicRing.position.set(0, 22.2, 0);
            relicRing.rotation.x = 0.6;
            cg.add(relicRing);

            const atticCoreLt = new THREE.PointLight(0xa855f7, 4.0, 25);
            atticCoreLt.position.set(0, 22.5, 0);
            cg.add(atticCoreLt);
            registerDynamicLight(atticCoreLt, 95);

            addCylinderCollider(-110, 120, 3.0, 19.8, 20.9, true);

            castleAnimators.push({
                type: 'astralCore',
                relic: floatingRelic,
                ring: relicRing,
                light: atticCoreLt,
                baseY: 22.2
            });

            // Rương báu đá mặt trăng góc gác mái
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);
            addBoxCollider(-110 - 12, 120 + 8, 2.2, 2.2, 19.8, 21.2, true);

            // Ban công bí mật ngắm toàn cảnh 20m
            const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 6), matCastle);
            balconyFloor.position.set(0, 19.8, -22);
            cg.add(balconyFloor);
            addBoxCollider(-110, 120 - 22, 10.2, 6.2, 19.5, 20.2, true);

            // Lan can an toàn ban công (Chặn tuyệt đối không cho rơi tự do)
            addBoxCollider(-110, 120 - 25.0, 10.2, 1.0, 19.5, 23.0); // Front rail
            addBoxCollider(-110 - 5.0, 120 - 22.0, 1.0, 6.2, 19.5, 23.0); // Left rail
            addBoxCollider(-110 + 5.0, 120 - 22.0, 1.0, 6.2, 19.5, 23.0); // Right rail

            // =================================================================
            // CẦU DẪN GRAND BRIDGE RAMP & CỘT ĐÈN
            // =================================================================
            const bridgeSlopeAng = -0.10522;
            const bridgeCenterZ = -51.75;
            const bridgeCenterY = 2.78;

            const bridge = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.8, 53.8), matDarkBase);
            bridge.position.set(0, bridgeCenterY, bridgeCenterZ);
            bridge.rotation.x = bridgeSlopeAng;
            bridge.receiveShadow = true;
            cg.add(bridge);

            const bridgeCrystalRoad = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 53.8), matCrystalRoad);
            bridgeCrystalRoad.position.set(0, bridgeCenterY + 0.38, bridgeCenterZ);
            bridgeCrystalRoad.rotation.x = bridgeSlopeAng;
            bridgeCrystalRoad.receiveShadow = true;
            cg.add(bridgeCrystalRoad);

            const bridgeRuneRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 53.8), matCrystalRuneCenter);
            bridgeRuneRibbon.position.set(0, bridgeCenterY + 0.40, bridgeCenterZ);
            bridgeRuneRibbon.rotation.x = bridgeSlopeAng;
            cg.add(bridgeRuneRibbon);

            [-2.8, 2.8].forEach(curbX => {
                const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 53.8), matCrystalCurb);
                curb.position.set(curbX, bridgeCenterY + 0.46, bridgeCenterZ);
                curb.rotation.x = bridgeSlopeAng;
                cg.add(curb);
            });

            [-3.7, 3.7].forEach(railX => {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 53.8), matCastle);
                rail.position.set(railX, bridgeCenterY + 0.95, bridgeCenterZ);
                rail.rotation.x = bridgeSlopeAng;
                cg.add(rail);

                const railCap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 53.8), matGoldTrim);
                railCap.position.set(railX, bridgeCenterY + 1.62, bridgeCenterZ);
                railCap.rotation.x = bridgeSlopeAng;
                cg.add(railCap);
            });

            addBoxCollider(-110 - 3.7, 68.25, 0.8, 53.5, 0, 8.5);
            addBoxCollider(-110 + 3.7, 68.25, 0.8, 53.5, 0, 8.5);

            for (let bStep = 1; bStep <= 3; bStep++) {
                const lpZLocal = -78.5 + bStep * 13.5;
                const lpT = (bStep * 13.5) / 53.5;
                const lpYLocal = 0.35 + lpT * 5.65;
                [-3.9, 3.9].forEach((lpX, side) => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.2, 8), matPylonPost);
                    post.position.set(lpX, lpYLocal + 1.1, lpZLocal);
                    cg.add(post);

                    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), ((bStep + side) % 2 === 0 ? matCyanGlow : matPurpleGlow));
                    crystal.position.set(lpX, lpYLocal + 2.3, lpZLocal);
                    cg.add(crystal);

                    const pLight = new THREE.PointLight(0x00f5d4, 1.5, 16);
                    pLight.position.set(lpX, lpYLocal + 2.3, lpZLocal);
                    cg.add(pLight);
                    registerDynamicLight(pLight, 65);
                });
            }

            // Cột đèn cổng tráng lệ lối vào cầu
            [-4.6, 4.6].forEach((px, idx) => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 7.5, 12), matCastle);
                pillar.position.set(px, 3.75, -78.5);
                cg.add(pillar);

                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 10, 24, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(px, 7.8, -78.5);
                crescent.rotation.z = (idx === 0 ? 0.35 : -0.35);
                cg.add(crescent);

                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);
                registerDynamicLight(beaconLight, 85);

                addCylinderCollider(-110 + px, 41.5, 0.9, 0, 8.5);
            });

            cg.position.set(-110, 0, 120);
            scene.add(cg);

            // =================================================================
            // ĐIỂM TƯƠNG TÁC CHI TIẾT TẠI CÁC TẦNG LÂU ĐÀI
            // =================================================================
            interactables.push({
                id: 'castle_shelter_bunker',
                pos: new THREE.Vector3(-110 - 10, 1.0, 120),
                radius: 6.0,
                prompt: 'Khám phá Hầm Trú Ẩn Bí Mật (Sa Bàn Chiến Lược & Lò Sưởi Hoàng Gia)',
                type: 'shelter_bunker'
            });

            interactables.push({
                id: 'castle_dungeon_cell',
                pos: new THREE.Vector3(-110 - 16.5, 1.0, 120 - 10.8),
                radius: 4.5,
                prompt: 'Khám phá Ngục Giam Bí Mật (Cổ Vật Đầu Lâu Dạ Quang)',
                type: 'dungeon_cell'
            });

            interactables.push({
                id: 'castle_dungeon_treasury',
                pos: new THREE.Vector3(-110 + 14, 1.0, 120 + 10),
                radius: 6.5,
                prompt: 'Mở Khóa Kho Báu Hoàng Gia & Cổng Thoát Hiểm Bí Mật',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_hall_banquet',
                pos: new THREE.Vector3(-110 - 10, 6.0, 120 - 5),
                radius: 8.5,
                prompt: 'Khám phá Bàn Tiệc & Giáp Trụ Kỵ Sĩ Đại Điện (Tầng 1)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_throne',
                pos: new THREE.Vector3(-110, 14.0, 120 + 17),
                radius: 8.5,
                prompt: 'Ngồi lên Ngai Vàng Mặt Trăng Tsukiezz (Thánh Điện Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_library',
                pos: new THREE.Vector3(-110 + 14, 13.0, 120 - 4),
                radius: 8.0,
                prompt: 'Đọc Mật Điển Lịch Sử Vương Quốc (Thư Viện Hoàng Gia Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_attic_core',
                pos: new THREE.Vector3(-110, 20.0, 120),
                radius: 8.5,
                prompt: 'Kích hoạt Trái Tim Nguyệt Tộc (Bí Mật Tối Cao Gác Mái Lâu Đài)',
                type: 'throne'
            });
        }
        buildCastle3D();"""

assert old_castle_block in content, "old_castle_block not found"
content = content.replace(old_castle_block, new_castle_code, 1)

# -----------------------------------------------------------------------------
# 3. Add updateCastleAnimations() call in animate()
# -----------------------------------------------------------------------------
old_animate_call = """            // Rotate celestial planetary ring
            if (typeof ringMesh !== 'undefined' && ringMesh) {
                ringMesh.rotation.z += 0.04 * delta;
            }"""

new_animate_call = """            // Rotate celestial planetary ring
            if (typeof ringMesh !== 'undefined' && ringMesh) {
                ringMesh.rotation.z += 0.04 * delta;
            }

            // Real-time Castle Dynamic Atmospheric Animations (Torches, Banners, Fireplace, Crystals, Core)
            if (window.castleAnimators && window.castleAnimators.length > 0) {
                for (let i = 0; i < window.castleAnimators.length; i++) {
                    const anim = window.castleAnimators[i];
                    if (anim.type === 'spireGem') {
                        anim.mesh.rotation.y += 0.03 * anim.speed;
                        anim.mesh.position.y = anim.baseY + Math.sin(time * 2.5 + anim.speed) * 0.25;
                    } else if (anim.type === 'hearthFire') {
                        const flicker = Math.sin(time * 12.0) * 0.1 + Math.cos(time * 22.0) * 0.08;
                        anim.mesh.scale.set(1.0 + flicker, 1.0 + flicker * 1.5, 1.0 + flicker);
                        anim.mesh.position.y = anim.baseY + Math.abs(Math.sin(time * 8.0)) * 0.08;
                        anim.light.intensity = anim.baseIntensity + flicker * 1.8;
                    } else if (anim.type === 'strategyCrystals') {
                        for (let c = 0; c < anim.items.length; c++) {
                            const item = anim.items[c];
                            const orbAng = time * 1.4 + item.offset;
                            item.mesh.position.x = anim.centerX + Math.cos(orbAng) * 1.1;
                            item.mesh.position.z = anim.centerZ + Math.sin(orbAng) * 0.7;
                            item.mesh.position.y = anim.baseY + Math.sin(time * 3.0 + item.offset) * 0.15;
                            item.mesh.rotation.y += 0.04;
                            item.mesh.rotation.x += 0.02;
                        }
                    } else if (anim.type === 'sarcoRune') {
                        anim.mesh.rotation.z += 0.02;
                    } else if (anim.type === 'portalRing') {
                        anim.ring.rotation.z += 0.025;
                        anim.crystal.rotation.y += 0.035;
                        anim.crystal.rotation.x += 0.02;
                        anim.crystal.position.y = 2.4 + Math.sin(time * 2.8) * 0.18;
                    } else if (anim.type === 'chainSway') {
                        anim.mesh.rotation.z = Math.sin(time * 1.8 + anim.offset) * 0.08;
                        anim.mesh.rotation.x = Math.cos(time * 1.4 + anim.offset) * 0.06;
                    } else if (anim.type === 'torchesGroup') {
                        for (let t = 0; t < anim.torches.length; t++) {
                            const torch = anim.torches[t];
                            const flicker = Math.sin(time * 10.0 + torch.offset) * 0.12 + Math.cos(time * 18.0 + torch.offset) * 0.08;
                            torch.mesh.scale.set(1.0 + flicker, 1.0 + flicker * 1.4, 1.0 + flicker);
                            torch.mesh.position.y = anim.baseY + Math.sin(time * 6.0 + torch.offset) * 0.04;
                            torch.light.intensity = 1.8 + flicker * 0.9;
                        }
                    } else if (anim.type === 'bannersWave') {
                        for (let b = 0; b < anim.banners.length; b++) {
                            const bnr = anim.banners[b];
                            bnr.mesh.rotation.y += Math.sin(time * 2.8 + bnr.offset) * 0.005;
                            bnr.mesh.rotation.z = Math.sin(time * 2.2 + bnr.offset) * 0.06;
                        }
                    } else if (anim.type === 'floatingBook') {
                        anim.mesh.position.y = anim.baseY + Math.sin(time * 2.4) * 0.14;
                        anim.mesh.rotation.y += 0.015;
                    } else if (anim.type === 'astralCore') {
                        anim.relic.rotation.x += 0.025;
                        anim.relic.rotation.y += 0.035;
                        anim.relic.position.y = anim.baseY + Math.sin(time * 2.8) * 0.18;
                        anim.ring.rotation.z += 0.04;
                        anim.ring.rotation.x = 0.6 + Math.sin(time * 2.0) * 0.15;
                        anim.light.intensity = 3.6 + Math.sin(time * 3.5) * 1.2;
                    }
                }
            }"""

assert old_animate_call in content, "old_animate_call not found"
content = content.replace(old_animate_call, new_animate_call, 1)

# Also add dialogue response for castle_shelter_bunker in handleInteraction
old_dialogue = """            else if (item.id === 'castle_dungeon_cell') {
                sfx.pickup();
                showNotification("🗝️ NGỤC GIAM BÍ MẬT: Nhặt được Hộp Sọ Dạ Quang & Chìa Khóa Hư Không của Tù Nhân Cổ Đại!");
            }"""

new_dialogue = """            else if (item.id === 'castle_shelter_bunker') {
                sfx.pickup();
                showNotification("🛡️ HẦM TRÚ ẨN BÍ MẬT: Đã bước vào Căn Cứ Sinh Tồn Hoàng Gia! Lò Sưởi Đá & Sa Bàn Tác Chiến đang sưởi ấm!");
            }
            else if (item.id === 'castle_dungeon_cell') {
                sfx.pickup();
                showNotification("🗝️ NGỤC GIAM BÍ MẬT: Nhặt được Hộp Sọ Dạ Quang & Chìa Khóa Hư Không của Tù Nhân Cổ Đại!");
            }"""

assert old_dialogue in content, "old_dialogue not found"
content = content.replace(old_dialogue, new_dialogue, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully upgraded castle, secret shelter, animations, and collisions in demo/index.html!")
