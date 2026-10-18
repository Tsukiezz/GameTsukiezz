import os
import sys

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# =============================================================================
# 1. Update Materials: Set DoubleSide to eliminate interior graphic culling
# =============================================================================
old_materials = """            // Materials
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
            const matOrangeGlow = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2.8 });"""

new_materials = """            // Materials (Enhanced with DoubleSide to eliminate all backface culling & see-through graphics bugs)
            const matCastle = new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.8, metalness: 0.15, side: THREE.DoubleSide });
            const matDarkBase = new THREE.MeshStandardMaterial({ color: 0x131824, roughness: 0.9, side: THREE.DoubleSide });
            const matRoof = new THREE.MeshStandardMaterial({ color: 0x24123c, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide });
            const matMarble = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });
            const matGoldTrim = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85, side: THREE.DoubleSide });
            const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8, side: THREE.DoubleSide });
            const matVelvetRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7, side: THREE.DoubleSide });
            const matVelvetPurple = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.5, side: THREE.DoubleSide });
            const matIronBars = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
            const matTimber = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.85, side: THREE.DoubleSide });
            const matOrangeGlow = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2.8 });"""

assert old_materials in content, "old_materials not found"
content = content.replace(old_materials, new_materials, 1)

# =============================================================================
# 2. Add Floor 2 Royal Front Balcony with Covered Canopy Roof & Entrance Porch
# =============================================================================
old_gate_arch = """            // Front Grand Arch Portal Gate
            const gateArch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.7, 12, 16, Math.PI), matGoldTrim);
            gateArch.position.set(0, 11.5, -26);
            cg.add(gateArch);"""

new_gate_and_fl2_balcony = """            // Front Grand Arch Portal Gate (Tầng 1)
            const gateArch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.7, 12, 16, Math.PI), matGoldTrim);
            gateArch.position.set(0, 11.5, -26);
            cg.add(gateArch);

            // MÁI CHE VÒM CỔNG CHÍNH TẦNG 1 (GRAND GATE ENTRANCE CANOPY ROOF at Y=11.8m)
            const gatePorchRoof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.6, 3.2), matRoof);
            gatePorchRoof.position.set(0, 12.0, -27.6);
            cg.add(gatePorchRoof);

            const gatePorchTrim = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.2, 3.4), matGoldTrim);
            gatePorchTrim.position.set(0, 12.35, -27.6);
            cg.add(gatePorchTrim);

            // =================================================================
            // BAN CÔNG HOÀNG GIA TẦNG 2 & MÁI CHE VÒM GOTHIC (Y = 13.0m to 17.8m)
            // [Vươn ra phía trước che chở cổng chính và ngắm toàn cảnh Đại Lộ Pha Lê & Cầu Dẫn]
            // =================================================================
            // 1. Sàn Ban Công Cẩm Thạch Dày (Local Z = -26 to -31, Width = 16m)
            const fl2BalconyFloor = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.6, 5.2), matMarble);
            fl2BalconyFloor.position.set(0, 12.7, -28.6);
            fl2BalconyFloor.receiveShadow = true;
            cg.add(fl2BalconyFloor);

            // 4 Con bọ đỡ ban công Gothic uốn lượn bên dưới (Console Corbels)
            [-6, -2, 2, 6].forEach(cx => {
                const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.8, 4.2), matCastle);
                corbel.position.set(cx, 10.6, -28.1);
                corbel.rotation.x = -0.35;
                cg.add(corbel);
            });

            // 2. Lan Can Mạ Vàng Hoàng Gia 3 Mặt Ban Công (Cao 1.3m bảo vệ an toàn tuyệt đối)
            // Lan can mặt trước (Z = -31.1)
            const fl2RailF = new THREE.Mesh(new THREE.BoxGeometry(16.0, 1.25, 0.35), matGoldTrim);
            fl2RailF.position.set(0, 13.62, -31.1);
            cg.add(fl2RailF);
            addBoxCollider(-110, 120 - 31.1, 16.2, 0.8, 12.8, 15.5);

            // Lan can cánh trái (X = -7.9)
            const fl2RailL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 5.2), matGoldTrim);
            fl2RailL.position.set(-7.9, 13.62, -28.6);
            cg.add(fl2RailL);
            addBoxCollider(-110 - 7.9, 120 - 28.6, 0.8, 5.4, 12.8, 15.5);

            // Lan can cánh phải (X = 7.9)
            const fl2RailR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 5.2), matGoldTrim);
            fl2RailR.position.set(7.9, 13.62, -28.6);
            cg.add(fl2RailR);
            addBoxCollider(-110 + 7.9, 120 - 28.6, 0.8, 5.4, 12.8, 15.5);

            // 4 Trụ đá góc ban công gắn tinh thể dạ quang
            [[-7.9, -31.1], [7.9, -31.1], [-7.9, -26.2], [7.9, -26.2]].forEach(([px, pz], pIdx) => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.45, 12), matCastle);
                post.position.set(px, 13.72, pz);
                cg.add(post);

                const pGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), (pIdx % 2 === 0 ? matCyanGlow : matPurpleGlow));
                pGem.position.set(px, 14.65, pz);
                cg.add(pGem);
            });

            // 3. MÁI CHE BAN CÔNG HOÀNG GIA (ROYAL CANOPY ROOF at Y=17.5m)
            // 2 Cột trụ Gothic đá cẩm thạch đỡ phía trước
            const fl2ColL = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.4, 16), matCastle);
            fl2ColL.position.set(-7.2, 15.2, -30.6);
            cg.add(fl2ColL);
            addCylinderCollider(-110 - 7.2, 120 - 30.6, 0.5, 12.8, 17.5);

            const fl2ColR = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.4, 16), matCastle);
            fl2ColR.position.set(7.2, 15.2, -30.6);
            cg.add(fl2ColR);
            addCylinderCollider(-110 + 7.2, 120 - 30.6, 0.5, 12.8, 17.5);

            // Mái che dốc ngói tím viền vàng che chắn toàn bộ ban công
            const fl2CanopyRoof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.8, 5.8), matRoof);
            fl2CanopyRoof.position.set(0, 17.6, -28.6);
            cg.add(fl2CanopyRoof);

            const fl2CanopyRidge = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.3, 0.6), matGoldTrim);
            fl2CanopyRidge.position.set(0, 18.1, -26.0);
            cg.add(fl2CanopyRidge);

            // Đèn lồng hoàng gia treo giữa mái che ban công
            const fl2Lantern = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matCyanGlow);
            fl2Lantern.position.set(0, 16.6, -28.6);
            cg.add(fl2Lantern);

            const fl2BalconyLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
            fl2BalconyLight.position.set(0, 16.5, -28.6);
            cg.add(fl2BalconyLight);
            registerDynamicLight(fl2BalconyLight, 85);

            // Đăng ký bề mặt sàn ban công Tầng 2 đứng được vững vàng (Y = 13.0m)
            addBoxCollider(-110, 120 - 28.6, 16.2, 5.4, 12.4, 13.0, true);"""

assert old_gate_arch in content, "old_gate_arch not found"
content = content.replace(old_gate_arch, new_gate_and_fl2_balcony, 1)

# =============================================================================
# 3. Upgrade Attic Balcony & Complete Multi-Wing Castle Roof Architecture
# =============================================================================
old_attic_balcony_and_roof = """            // Central Soaring Gothic Spire Roof
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
            addBoxCollider(-110 + 5.0, 120 - 22.0, 1.0, 6.2, 19.5, 23.0); // Right rail"""

new_attic_balcony_and_roof = """            // =================================================================
            // HỆ THỐNG MÁI CHE TOÀN THỂ LÂU ĐÀI (COMPLETE GOTHIC PITCHED ROOF COMPLEX)
            // [Bao phủ toàn bộ 4 cánh và trung tâm, không còn bất kỳ khoảng trống nhìn xuyên thủng nào]
            // =================================================================
            // 1. Mái chóp nhọn bát giác Trung Tâm (Central Soaring Spire Roof at Y=30m)
            const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(18, 20, 8), matRoof);
            spireRoof.position.set(0, 30, 0);
            cg.add(spireRoof);

            // Tháp Chóp Kim Tinh vút cao trên đỉnh lâu đài (Apex Pinnacle Spire at Y=42m)
            const apexSpireNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.7, 10, 8), matGoldTrim);
            apexSpireNeedle.position.set(0, 42, 0);
            cg.add(apexSpireNeedle);

            const apexCrownGem = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), matCyanGlow);
            apexCrownGem.position.set(0, 47.5, 0);
            cg.add(apexCrownGem);

            // 2. Mái dốc Cánh Tây (West Wing Pitched Gable Roof at Y=26.5m)
            const westWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            westWingRoof.position.set(-11, 26.5, 0);
            westWingRoof.rotation.y = Math.PI / 4;
            cg.add(westWingRoof);

            // 3. Mái dốc Cánh Đông (East Wing Pitched Gable Roof at Y=26.5m)
            const eastWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            eastWingRoof.position.set(11, 26.5, 0);
            eastWingRoof.rotation.y = Math.PI / 4;
            cg.add(eastWingRoof);

            // 4. Hàng Lỗ Châu Mai Tường Thành Bảo Vệ Mái (Parapet Battlements & Merlons at Y=26.5m)
            for (let mer = -18; mer <= 18; mer += 3.6) {
                // Merlons bờ Bắc & bờ Nam
                const mNorth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), matCastle);
                mNorth.position.set(mer, 26.6, 23.0);
                cg.add(mNorth);

                const mSouth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), matCastle);
                mSouth.position.set(mer, 26.6, -20.0);
                cg.add(mSouth);
            }

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

            // =================================================================
            // BAN CÔNG VỌNG CẢNH GÁC MÁI TẦNG 3 & MÁI CHE TINH TÚ (Y = 20.0m to 25.0m)
            // =================================================================
            // 1. Sàn ban công đá cẩm thạch đen vươn ra ngắm vũ trụ (Local Z = -20.5 to -27.0)
            const fl3BalconyFloor = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.6, 6.5), matMarble);
            fl3BalconyFloor.position.set(0, 19.7, -23.75);
            fl3BalconyFloor.receiveShadow = true;
            cg.add(fl3BalconyFloor);
            addBoxCollider(-110, 120 - 23.75, 12.2, 6.8, 19.4, 20.0, true);

            // 2. Lan can 3D mạ vàng Gothic thực tế (Visible 3D Balustrades cao 1.25m)
            // Lan can mặt trước (Z = -27.0)
            const fl3RailF = new THREE.Mesh(new THREE.BoxGeometry(12.0, 1.25, 0.35), matGoldTrim);
            fl3RailF.position.set(0, 20.62, -27.0);
            cg.add(fl3RailF);
            addBoxCollider(-110, 120 - 27.0, 12.2, 0.8, 19.8, 22.5);

            // Lan can cánh trái (X = -5.85)
            const fl3RailL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 6.5), matGoldTrim);
            fl3RailL.position.set(-5.85, 20.62, -23.75);
            cg.add(fl3RailL);
            addBoxCollider(-110 - 5.85, 120 - 23.75, 0.8, 6.8, 19.8, 22.5);

            // Lan can cánh phải (X = 5.85)
            const fl3RailR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 6.5), matGoldTrim);
            fl3RailR.position.set(5.85, 20.62, -23.75);
            cg.add(fl3RailR);
            addBoxCollider(-110 + 5.85, 120 - 23.75, 0.8, 6.8, 19.8, 22.5);

            // Trụ lan can đính tinh thể phát sáng
            [[-5.85, -27.0], [5.85, -27.0], [-5.85, -20.5], [5.85, -20.5]].forEach(([px, pz]) => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.4, 12), matCastle);
                post.position.set(px, 20.7, pz);
                cg.add(post);

                const cGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), matPurpleGlow);
                cGem.position.set(px, 21.55, pz);
                cg.add(cGem);
            });

            // 3. MÁI CHE BAN CÔNG GÁC MÁI (CELESTIAL CANOPY ROOF at Y=24.8m)
            // 2 Cột gỗ mun cổ Gothic đỡ phía trước
            const fl3ColL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 12), matTimber);
            fl3ColL.position.set(-5.2, 22.5, -26.5);
            cg.add(fl3ColL);
            addCylinderCollider(-110 - 5.2, 120 - 26.5, 0.45, 19.8, 24.8);

            const fl3ColR = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 12), matTimber);
            fl3ColR.position.set(5.2, 22.5, -26.5);
            cg.add(fl3ColR);
            addCylinderCollider(-110 + 5.2, 120 - 26.5, 0.45, 19.8, 24.8);

            // Mái che dốc ngói tím viền vàng che phủ toàn bộ ban công gác mái
            const fl3CanopyRoof = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.7, 7.2), matRoof);
            fl3CanopyRoof.position.set(0, 24.8, -23.75);
            cg.add(fl3CanopyRoof);

            const fl3CanopyRidge = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.3, 0.5), matGoldTrim);
            fl3CanopyRidge.position.set(0, 25.2, -20.5);
            cg.add(fl3CanopyRidge);

            // Đèn lồng tím Astral ma mị treo dưới mái che ban công
            const fl3Lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), matPurpleGlow);
            fl3Lantern.position.set(0, 23.8, -24.0);
            cg.add(fl3Lantern);

            const fl3BalconyLt = new THREE.PointLight(0xa855f7, 2.8, 18);
            fl3BalconyLt.position.set(0, 23.8, -24.0);
            cg.add(fl3BalconyLt);
            registerDynamicLight(fl3BalconyLt, 80);

            // Băng ghế đá ngắm sao có nệm nhung (Ngồi được 'C' hoặc đứng 'Space')
            const viewBench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
            viewBench.position.set(0, 20.25, -25.2);
            cg.add(viewBench);

            const benchCushion = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 0.9), matVelvetPurple);
            benchCushion.position.set(0, 20.55, -25.2);
            cg.add(benchCushion);
            addBoxCollider(-110, 120 - 25.2, 3.8, 1.2, 19.8, 20.65, true);"""

assert old_attic_balcony_and_roof in content, "old_attic_balcony_and_roof not found"
content = content.replace(old_attic_balcony_and_roof, new_attic_balcony_and_roof, 1)

# =============================================================================
# 4. Update Floor Plates (Replace single plane with solid 3D box slabs)
# =============================================================================
old_attic_floor_plane = """            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & VỌNG CẢNH ASTRAL (Y = 20.0m)
            // =================================================================
            const atticFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 40), matTimber);
            atticFloor.rotation.x = -Math.PI / 2;
            atticFloor.position.set(0, 20.02, 0);
            cg.add(atticFloor);"""

new_attic_floor_box = """            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & VỌNG CẢNH ASTRAL (Y = 20.0m)
            // =================================================================
            // Sàn gỗ sồi 3D dày (Phía trên là sàn Gác Mái Y=20.0m, phía dưới là trần Tầng 2 Y=19.6m - Không bị xuyên thấu)
            const atticFloor = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 40), matTimber);
            atticFloor.position.set(0, 19.8, 0);
            cg.add(atticFloor);"""

assert old_attic_floor_plane in content, "old_attic_floor_plane not found"
content = content.replace(old_attic_floor_plane, new_attic_floor_box, 1)

# =============================================================================
# 5. Update getGroundElevation for both Balconies
# =============================================================================
old_elevation_check = """                // Front entrance vestibule connected directly to Grand Bridge Ramp: always Floor 1
                if (px >= -116.0 && px <= -104.0 && pz <= 104.0) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                }"""

new_elevation_check = """                // BAN CÔNG HOÀNG GIA TẦNG 2 (World X in [-118, -102], Z in [88.5, 94.5], Y=13.0m)
                if (px >= -118.0 && px <= -102.0 && pz >= 88.5 && pz <= 94.5 && py >= 10.5) {
                    baseElev = 13.0; // Sàn Ban Công Tầng 2
                }
                // BAN CÔNG VỌNG CẢNH GÁC MÁI TẦNG 3 (World X in [-116, -104], Z in [93.0, 99.5], Y=20.0m)
                else if (px >= -116.0 && px <= -104.0 && pz >= 93.0 && pz <= 99.5 && py >= 17.5) {
                    baseElev = 20.0; // Sàn Ban Công Gác Mái Tầng 3
                }
                // Front entrance vestibule connected directly to Grand Bridge Ramp: always Floor 1
                else if (px >= -116.0 && px <= -104.0 && pz <= 104.0 && py < 10.5) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                }"""

assert old_elevation_check in content, "old_elevation_check not found"
content = content.replace(old_elevation_check, new_elevation_check, 1)

# Also update ramp condition in getGroundElevation so ramp doesn't override Balcony 1:
old_ramp_elev = """            // Castle Grand Bridge Ramp (from z = 41.5 to z = 95.0, x in [-114.5, -105.5])
            // Seamlessly connects Route 1 Crystal Highway (Y = 0.35m at z = 41.5) to Castle Floor 1 (Y = 6.0m at z = 95.0)
            if (px >= -114.5 && px <= -105.5 && pz >= 41.5 && pz <= 95.0) {"""

new_ramp_elev = """            // Castle Grand Bridge Ramp (from z = 41.5 to z = 95.0, x in [-114.5, -105.5])
            // When py < 10.5m: Walking on Bridge Ramp; when py >= 10.5m: Standing on Floor 2 Balcony above!
            if (px >= -114.5 && px <= -105.5 && pz >= 41.5 && pz <= 95.0 && py < 10.5) {"""

assert old_ramp_elev in content, "old_ramp_elev not found"
content = content.replace(old_ramp_elev, new_ramp_elev, 1)

# =============================================================================
# 6. Update Interior Camera Clamping for Balconies
# =============================================================================
old_cam_in_castle = """                // Third-person Orbit Camera with Intelligent Interior Clamping (Prevents wall/ceiling clipping)
                const inCastle = (playerGroup.position.x >= -133.0 && playerGroup.position.x <= -87.0 &&
                                  playerGroup.position.z >= 95.0 && playerGroup.position.z <= 145.0);"""

new_cam_in_castle = """                // Third-person Orbit Camera with Intelligent Interior Clamping (Prevents wall/ceiling clipping, supports balconies)
                const onBalconyFl2 = (playerGroup.position.x >= -119.0 && playerGroup.position.x <= -101.0 &&
                                      playerGroup.position.z >= 87.5 && playerGroup.position.z <= 95.0 && playerGroup.position.y >= 11.5);
                const onBalconyFl3 = (playerGroup.position.x >= -117.0 && playerGroup.position.x <= -103.0 &&
                                      playerGroup.position.z >= 92.5 && playerGroup.position.z <= 99.5 && playerGroup.position.y >= 18.5);
                const inCastle = (playerGroup.position.x >= -133.0 && playerGroup.position.x <= -87.0 &&
                                  playerGroup.position.z >= 95.0 && playerGroup.position.z <= 145.0) || onBalconyFl2 || onBalconyFl3;"""

assert old_cam_in_castle in content, "old_cam_in_castle not found"
content = content.replace(old_cam_in_castle, new_cam_in_castle, 1)

# And update camera Z clamp when on balcony:
old_target_cam_z_clamp = """                    targetCamZ = Math.max(95.5, Math.min(142.0, targetCamZ));"""
new_target_cam_z_clamp = """                    if (onBalconyFl2 || onBalconyFl3) {
                        targetCamZ = Math.max(86.0, Math.min(142.0, targetCamZ));
                    } else {
                        targetCamZ = Math.max(95.5, Math.min(142.0, targetCamZ));
                    }"""

assert old_target_cam_z_clamp in content, "old_target_cam_z_clamp not found"
content = content.replace(old_target_cam_z_clamp, new_target_cam_z_clamp, 1)

# =============================================================================
# 7. Add Interaction points & dialogs for the Balconies
# =============================================================================
old_interactables = """            interactables.push({
                id: 'castle_attic_core',
                pos: new THREE.Vector3(-110, 20.0, 120),
                radius: 8.5,
                prompt: 'Kích hoạt Trái Tim Nguyệt Tộc (Bí Mật Tối Cao Gác Mái Lâu Đài)',
                type: 'throne'
            });"""

new_interactables = """            interactables.push({
                id: 'castle_attic_core',
                pos: new THREE.Vector3(-110, 20.0, 120),
                radius: 8.5,
                prompt: 'Kích hoạt Trái Tim Nguyệt Tộc (Bí Mật Tối Cao Gác Mái Lâu Đài)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_balcony_fl2',
                pos: new THREE.Vector3(-110, 13.0, 120 - 28.6),
                radius: 6.5,
                prompt: 'Ngắm toàn cảnh Nguyệt Giới từ Ban Công Hoàng Gia (Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_balcony_fl3',
                pos: new THREE.Vector3(-110, 20.0, 120 - 23.75),
                radius: 6.5,
                prompt: 'Chiêm ngưỡng Vũ Trụ Tinh Tú từ Ban Công Vọng Cảnh Gác Mái (Tầng 3)',
                type: 'throne'
            });"""

assert old_interactables in content, "old_interactables not found"
content = content.replace(old_interactables, new_interactables, 1)

old_dialog = """            else if (item.id === 'castle_attic_core') {
                sfx.portalOpen();
                sfx.playTone(1046, 'sine', 0.6, 0.3);
                showNotification("✨ GÁC MÁI BÍ MẬT (TẦNG 3): Kích hoạt Trái Tim Nguyệt Tộc! Mưa sao băng tinh tú bùng nổ quanh gác mái!");
            }"""

new_dialog = """            else if (item.id === 'castle_attic_core') {
                sfx.portalOpen();
                sfx.playTone(1046, 'sine', 0.6, 0.3);
                showNotification("✨ GÁC MÁI BÍ MẬT (TẦNG 3): Kích hoạt Trái Tim Nguyệt Tộc! Mưa sao băng tinh tú bùng nổ quanh gác mái!");
            }
            else if (item.id === 'castle_balcony_fl2') {
                sfx.portalOpen();
                showNotification("🏰 BAN CÔNG HOÀNG GIA (TẦNG 2): Đang đứng dưới Mái Che Vòm Hoàng Gia! Toàn cảnh Đại Lộ Pha Lê & Cầu Dẫn rực sáng trước mắt!");
            }
            else if (item.id === 'castle_balcony_fl3') {
                sfx.portalOpen();
                showNotification("✨ BAN CÔNG VỌNG CẢNH (TẦNG 3): Bạn đang đứng tại Mái Che Tinh Tú cao nhất lâu đài! Toàn cõi Tsukiezz lung linh dưới chân!");
            }"""

assert old_dialog in content, "old_dialog not found"
content = content.replace(old_dialog, new_dialog, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully added balconies, canopies, full multi-wing roof, and fixed graphic errors!")
