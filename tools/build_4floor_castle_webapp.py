import re
import sys

def main():
    path = r'demo/index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Tour Buttons in HUD to include all 4 Castle Floors
    old_tour_bar_pattern = re.compile(r'<!-- FAST TRAVEL TOUR BAR -->\s*<div class="hud-tour-bar">.*?</div>', re.DOTALL)
    
    new_tour_bar = '''<!-- FAST TRAVEL TOUR BAR -->
            <div class="hud-tour-bar">
                <div class="hud-tour-title">🚀 Tham Quan:</div>
                <button class="tour-btn" onclick="fastTravelTo(0, 5, 'Đền Thần Điện Trung Tâm')">🏛️ Đền Trung Tâm</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 105, 'Lâu Đài (Tầng 1 - Đại Điện)')">🏰 Lâu Đài T1</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 134, 'Lâu Đài (Tầng 2 - Ngai Vàng)')">👑 Ngai Vàng T2</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 118, 'Lâu Đài (Gác Mái Bí Mật)')">✨ Gác Mái Bí Mật</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 120, 'Lâu Đài (Hầm Ngục & Kho Báu)')">🗝️ Hầm Ngục</button>
                <button class="tour-btn" onclick="fastTravelTo(115, 105, 'Đấu Trường La Mã Bị Bỏ Hoang')">⚔️ Đấu Trường</button>
                <button class="tour-btn" onclick="fastTravelTo(-147, -28, 'Trạm Vũ Trụ Công Nghệ Tối Tân')">🛸 Trạm Vũ Trụ</button>
                <button class="tour-btn" onclick="fastTravelTo(-85, -100, 'Trụ Tế Đàn 2 Tầng Huyết Sắc')">🩸 Tế Đàn 2 Tầng</button>
                <button class="tour-btn" onclick="fastTravelTo(-35, -145, 'Hồ Nước Thủy Ngân Gương Bạc')">🌊 Hồ Thủy Ngân</button>
                <button class="tour-btn" onclick="fastTravelTo(145, 20, 'Đại Cổ Thụ Nguyệt Tộc 45m')">🌳 Cổ Thụ 45m</button>
                <button class="tour-btn" onclick="fastTravelTo(133, -116, 'Hang Động Nguyệt Tinh')">💎 Hang Động</button>
                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>'''

    if old_tour_bar_pattern.search(content):
        content = old_tour_bar_pattern.sub(new_tour_bar, content, count=1)
        print("Updated tour bar buttons with 4 Castle floors.")
    else:
        print("Warning: old_tour_bar pattern not matched.")

    # 2. Locate getGroundElevation and buildCastle3D
    # We will update getGroundElevation to support 4 floors & stairs
    old_elevation_pattern = re.compile(r'// =====================================================================\s*// TERRAIN ELEVATION & RAMP TRAVERSAL ENGINE\s*// =====================================================================.*?function getGroundElevation\(px, pz\) \{.*?return Math\.max\(0, zOffset\);\s*\}', re.DOTALL)

    new_elevation = '''// =====================================================================
        // TERRAIN ELEVATION & RAMP / 4-LEVEL CASTLE STAIRS ENGINE
        // =====================================================================
        function getGroundElevation(px, pz) {
            // 1. Castle Grand Bridge Ramp (from z = 42 to z = 95, x in [-114, -106])
            if (px >= -114.5 && px <= -105.5 && pz >= 42.0 && pz <= 95.0) {
                const rampT = (pz - 42.0) / (95.0 - 42.0);
                return rampT * 6.0;
            }

            // 2. CASTLE 4-LEVEL MULTI-STORY COMPLEX (x in [-136, -84], z in [94, 146])
            if (px >= -136.0 && px <= -84.0 && pz >= 94.0 && pz <= 146.0) {
                // A. Dungeon Stairs (Northwest: X in [-129, -123], Z in [97, 109])
                // Going from Floor 1 (Y=6.0m at Z=97) down to Dungeon (Y=1.0m at Z=109)
                if (px >= -129.5 && px <= -122.5 && pz >= 97.0 && pz <= 109.0) {
                    const st = (pz - 97.0) / 12.0;
                    return 6.0 - Math.max(0, Math.min(1, st)) * 5.0;
                }

                // B. Floor 2 Double Imperial Stairs (Z in [124, 138])
                // Left Wing: X in [-128, -117], Right Wing: X in [-103, -92]
                // Going from Floor 1 (Y=6.0m at Z=124) up to Floor 2 Mezzanine (Y=13.0m at Z=138)
                if ((px >= -128.5 && px <= -117.0 || px >= -103.0 && px <= -91.5) && pz >= 124.0 && pz <= 138.0) {
                    const st = (pz - 124.0) / 14.0;
                    return 6.0 + Math.max(0, Math.min(1, st)) * 7.0;
                }

                // C. Secret Attic Spiral Stairs (East Library: X in [-98, -90], Z in [117, 129])
                // Going from Floor 2 (Y=13.0m at Z=117) up to Secret Attic (Y=20.0m at Z=129)
                if (px >= -98.0 && px <= -90.0 && pz >= 117.0 && pz <= 129.0) {
                    const st = (pz - 117.0) / 12.0;
                    return 13.0 + Math.max(0, Math.min(1, st)) * 7.0;
                }

                // Floor elevation based on current elevation zone of player
                if (currentGroundY < 3.8) {
                    // TẦNG HẦM (DUNGEON / CRYPT)
                    return 1.0;
                } else if (currentGroundY < 9.8) {
                    // TẦNG 1 (GRAND IMPERIAL HALL)
                    return 6.0;
                } else if (currentGroundY < 16.8) {
                    // TẦNG 2 (ROYAL THRONE & ARCHIVES)
                    if (px >= -116.0 && px <= -104.0 && pz >= 136.0 && pz <= 144.0) {
                        return 14.0; // 3-tier Throne Dais
                    }
                    return 13.0; // Mezzanine promenade
                } else {
                    // TẦNG 3 - GÁC MÁI BÍ MẬT (SECRET ATTIC)
                    return 20.0;
                }
            }

            // 3. Altar 2-Tier Stairs & Platforms (-85, -95)
            const adx = px - (-85);
            const adz = pz - (-95);
            const altarDist = Math.hypot(adx, adz);
            if (altarDist <= 5.6) {
                return 5.2; // Tier 2 surface
            }
            if (altarDist <= 9.2) {
                return 1.8; // Tier 1 surface
            }
            // Altar southern steps
            if (px >= -88.0 && px <= -82.0 && pz >= -104.0 && pz <= -95.0) {
                const stepT = (pz - (-104.0)) / ((-95.0) - (-104.0));
                return Math.max(0, stepT * 1.8);
            }

            // 4. Space Station Landing Pad (-145, -35)
            const spdx = px - (-145);
            const spdz = pz - (-35);
            if (Math.hypot(spdx, spdz) <= 18.0) {
                return 0.5; // Pad surface
            }

            // 5. Colosseum Arena (115, 110)
            const cdx = px - 115;
            const cdz = pz - 110;
            if (Math.hypot(cdx, cdz) <= 26.0) {
                return 0.25; // Sand floor
            }

            // 6. Observatory Platform (-120, -125)
            const odx = px - (-120);
            const odz = pz - (-125);
            if (Math.hypot(odx, odz) <= 14.5) {
                return 1.0; // Platform surface
            }

            // 7. Mercury Lake Pier & Gazebo (-35, -135)
            if (px >= -37.5 && px <= -32.5 && pz >= -162.0 && pz <= -135.0) {
                return 0.45; // Stepping stone pier
            }
            if (Math.hypot(px - (-35), pz - (-135)) <= 4.5) {
                return 0.5; // Gazebo floor
            }

            // Default moon dunes terrain height matching ground geometry
            let zOffset = Math.sin(px * 0.02) * Math.cos(pz * 0.02) * 2.5;
            const distCenter = Math.hypot(px, pz);
            if (distCenter > 180) zOffset += Math.sin(px * 0.04) * 4.0;
            return Math.max(0, zOffset);
        }'''

    if old_elevation_pattern.search(content):
        content = old_elevation_pattern.sub(new_elevation, content, count=1)
        print("Updated getGroundElevation.")
    else:
        print("Warning: old_elevation pattern not matched.")

    # 3. Replace buildCastle3D with the glorious 4-Level Castle
    old_castle_pattern = re.compile(r'// 2\. LÂU ĐÀI HOÀNG GIA \(-110, 120\)\s*function buildCastle3D\(\) \{.*?buildCastle3D\(\);', re.DOTALL)

    new_castle = '''// 2. ĐẠI LÂU ĐÀI HOÀNG GIA 4 TẦNG CHI TIẾT (-110, 120)
        // [Tầng Hầm (Y=1.0m) -> Tầng 1 Đại Điện (Y=6.0m) -> Tầng 2 Ngai Vàng (Y=13.0m) -> Gác Mái Bí Mật (Y=20.0m)]
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

            // Base Mesa Platform (Foundation Y = 0 to 6m)
            const base = new THREE.Mesh(new THREE.BoxGeometry(52, 6, 56), matDarkBase);
            base.position.y = 3;
            base.receiveShadow = true;
            cg.add(base);

            // 4 Colossal Corner Gothic Spire Towers (Height: 48m)
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

                // Add Point Light atop each spire
                const spLt = new THREE.PointLight((idx % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.5, 30);
                spLt.position.set(tx, 56, tz);
                cg.add(spLt);

                addCylinderCollider(-110 + tx, 120 + tz, 5.0);
            });

            // Outer Castle Walls (Height: 24m, enclosing Floors 1, 2, and Attic)
            // Left Wall
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 22, 46), matCastle);
            w1.position.set(-21, 16, 0); cg.add(w1);
            addBoxCollider(-110 - 21, 120, 3.5, 46);

            // Right Wall
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 22, 46), matCastle);
            w2.position.set(21, 16, 0); cg.add(w2);
            addBoxCollider(-110 + 21, 120, 3.5, 46);

            // Back Wall
            const w3 = new THREE.Mesh(new THREE.BoxGeometry(44, 22, 2.5), matCastle);
            w3.position.set(0, 16, 23); cg.add(w3);
            addBoxCollider(-110, 120 + 23, 44, 3.5);

            // Front Balustrades left & right of Grand Bridge Gate
            const fwL = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwL.position.set(-13, 12, -26); cg.add(fwL);
            addBoxCollider(-110 - 13, 120 - 26, 19, 3.5);

            const fwR = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwR.position.set(13, 12, -26); cg.add(fwR);
            addBoxCollider(-110 + 13, 120 - 26, 19, 3.5);

            // Front Grand Arch Portal Gate
            const gateArch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.7, 12, 16, Math.PI), matGoldTrim);
            gateArch.position.set(0, 11.5, -26);
            cg.add(gateArch);

            // =================================================================
            // LEVEL 0: TẦNG HẦM (BASEMENT DUNGEON, CRYPT & SECRET TREASURY - Y = 1.0m)
            // =================================================================
            const dungeonFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), new THREE.MeshStandardMaterial({ color: 0x0a0e16, roughness: 0.95 }));
            dungeonFloor.rotation.x = -Math.PI / 2;
            dungeonFloor.position.set(0, 1.02, 0);
            cg.add(dungeonFloor);

            // Dungeon Stone Ceiling
            const dungeonCeil = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matDarkBase);
            dungeonCeil.rotation.x = Math.PI / 2;
            dungeonCeil.position.set(0, 5.8, 0);
            cg.add(dungeonCeil);

            // 3 Iron Prison Cells along West Wall
            for(let cell = 0; cell < 3; cell++) {
                const cellZ = -10 + cell * 10;
                // Partition wall
                const pWall = new THREE.Mesh(new THREE.BoxGeometry(6, 4.8, 0.4), matCastle);
                pWall.position.set(-16, 3.4, cellZ);
                cg.add(pWall);

                // Vertical Iron Bars
                for(let b = 0; b < 6; b++) {
                    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8), matIronBars);
                    bar.position.set(-13, 3.4, cellZ - 4.2 + b * 0.85);
                    cg.add(bar);
                }

                // Hanging chains in cells
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), matIronBars);
                chain.position.set(-17, 4.5, cellZ - 2.0);
                cg.add(chain);
            }
            addBoxCollider(-110 - 16, 120, 8.0, 32.0); // Cell boundary collider

            // Ancient Moon Knight Sarcophagus in the Center of Dungeon
            const sarcoBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.4), matCastle);
            sarcoBase.position.set(0, 1.6, 0);
            cg.add(sarcoBase);

            const sarcoLid = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, 2.6), matGoldTrim);
            sarcoLid.position.set(0, 2.3, 0);
            cg.add(sarcoLid);

            const sarcoRune = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.12, 8, 24), matPurpleGlow);
            sarcoRune.rotation.x = Math.PI / 2;
            sarcoRune.position.set(0, 2.52, 0);
            cg.add(sarcoRune);

            const sarcoLight = new THREE.PointLight(0xa855f7, 2.2, 14);
            sarcoLight.position.set(0, 3.2, 0);
            cg.add(sarcoLight);

            addBoxCollider(-110, 120, 4.6, 2.8); // Sarcophagus collider

            // Royal Secret Treasury in East Alcove (X = 16, Z = 10)
            for(let ch = 0; ch < 3; ch++) {
                const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2), matGoldTrim);
                chest.position.set(15, 1.5, 6 + ch * 3.2);
                cg.add(chest);

                const gemLoot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), matCyanGlow);
                gemLoot.position.set(15, 2.2, 6 + ch * 3.2);
                cg.add(gemLoot);
            }
            addBoxCollider(-110 + 15, 120 + 9, 3.0, 10.0); // Treasury chests collider

            // 4 Dungeon Purple Braziers
            [[-10, -14], [10, -14], [-10, 14], [10, 14]].forEach(([bx, bz]) => {
                const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 1.2, 12), matIronBars);
                brazier.position.set(bx, 1.6, bz);
                cg.add(brazier);

                const flame = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), matPurpleGlow);
                flame.position.set(bx, 2.4, bz);
                cg.add(flame);
            });

            // Stone Steps descending from Floor 1 to Dungeon (Northwest: X = -16, Z = -22 to -10)
            for(let s = 0; s < 10; s++) {
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.3), matCastle);
                step.position.set(-16, 5.8 - s * 0.5, -22 + s * 1.2);
                cg.add(step);
            }

            // =================================================================
            // LEVEL 1: TẦNG 1 (ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ - Y = 6.0m)
            // =================================================================
            const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matMarble);
            hallFloor.rotation.x = -Math.PI / 2;
            hallFloor.position.set(0, 6.02, 0);
            cg.add(hallFloor);

            // Grand Royal Velvet Red Carpet down Central Nave
            const carpet = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 34), matVelvetRed);
            carpet.rotation.x = -Math.PI / 2;
            carpet.position.set(0, 6.05, -3);
            cg.add(carpet);

            // 6 Fluted Columns with Torches along Nave
            for(let col = 0; col < 3; col++) {
                const colZ = -14 + col * 12;
                [-8, 8].forEach(colX => {
                    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 7.0, 16), matCastle);
                    pillar.position.set(colX, 9.5, colZ);
                    cg.add(pillar);

                    const pCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), matGoldTrim);
                    pCap.position.set(colX, 13.0, colZ);
                    cg.add(pCap);

                    // Torch Sconce
                    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), matGoldTrim);
                    torch.position.set(colX + (colX > 0 ? -1.0 : 1.0), 9.8, colZ);
                    cg.add(torch);

                    const torchFlame = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), matCyanGlow);
                    torchFlame.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.4, colZ);
                    cg.add(torchFlame);

                    const tLt = new THREE.PointLight(0xffd700, 1.2, 16);
                    tLt.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.5, colZ);
                    cg.add(tLt);

                    addCylinderCollider(-110 + colX, 120 + colZ, 1.4);
                });
            }

            // Royal Banquet Table on West Side (X = -12, Z = -5)
            const bTable = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 14), matWoodDark);
            bTable.position.set(-12, 6.6, -5);
            cg.add(bTable);

            // Banquet Chairs
            for(let ch = 0; ch < 5; ch++) {
                [-2.2, 2.2].forEach(chSide => {
                    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), matWoodDark);
                    chair.position.set(-12 + chSide, 6.9, -10 + ch * 2.5);
                    cg.add(chair);
                });
            }
            addBoxCollider(-110 - 12, 120 - 5, 5.5, 15.0); // Banquet table collider

            // Imperial Knights' Armory Display on East Side (X = 12, Z = -5)
            for(let a = 0; a < 2; a++) {
                const armZ = -9 + a * 8;
                // Armor Pedestal
                const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16), matCastle);
                ped.position.set(12, 6.4, armZ);
                cg.add(ped);

                // Knight Suit of Armor (Steel dummy)
                const armorSuit = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 2.4, 12), matSteel);
                armorSuit.position.set(12, 8.0, armZ);
                cg.add(armorSuit);

                const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.9), matGoldTrim);
                shield.position.set(11.4, 8.0, armZ);
                cg.add(shield);
            }
            addBoxCollider(-110 + 12, 120 - 5, 4.0, 14.0); // Armory collider

            // Grand Imperial Double Staircase rising to Floor 2 (Z = 6 to 18)
            // Central lower landing (Z = 6 to 10, Y = 6.0 to 9.5m)
            for(let s = 0; s < 7; s++) {
                const st = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 1.2), matCastle);
                st.position.set(0, 6.25 + s * 0.5, 5 + s * 1.0);
                cg.add(st);
            }

            // Split into Left Wing (X = -13, Z = 11 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stL.position.set(-13, 9.75 + s * 0.5, 11 + s * 1.0);
                cg.add(stL);
            }

            // Split into Right Wing (X = 13, Z = 11 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stR.position.set(13, 9.75 + s * 0.5, 11 + s * 1.0);
                cg.add(stR);
            }

            // =================================================================
            // LEVEL 2: TẦNG 2 (THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN HOÀNG GIA - Y = 13.0m)
            // =================================================================
            // Floor Plate with Atrium Opening in Center (Mezzanine Gallery)
            // North Balcony (Z = 12 to 22)
            const f2North = new THREE.Mesh(new THREE.PlaneGeometry(38, 12), matMarble);
            f2North.rotation.x = -Math.PI / 2;
            f2North.position.set(0, 13.02, 16);
            cg.add(f2North);

            // West Gallery (X = -14, Z = -15 to 12)
            const f2West = new THREE.Mesh(new THREE.PlaneGeometry(10, 27), matMarble);
            f2West.rotation.x = -Math.PI / 2;
            f2West.position.set(-14, 13.02, -1.5);
            cg.add(f2West);

            // East Gallery (X = 14, Z = -15 to 12)
            const f2East = new THREE.Mesh(new THREE.PlaneGeometry(10, 27), matMarble);
            f2East.rotation.x = -Math.PI / 2;
            f2East.position.set(14, 13.02, -1.5);
            cg.add(f2East);

            // South Walkway (Z = -18 to -14)
            const f2South = new THREE.Mesh(new THREE.PlaneGeometry(38, 5), matMarble);
            f2South.rotation.x = -Math.PI / 2;
            f2South.position.set(0, 13.02, -16);
            cg.add(f2South);

            // Balustrades around Atrium Opening (keeps player from falling)
            const railAtriumW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumW.position.set(-9.2, 13.6, -1.5);
            cg.add(railAtriumW);
            addBoxCollider(-110 - 9.2, 120 - 1.5, 0.8, 26);

            const railAtriumE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumE.position.set(9.2, 13.6, -1.5);
            cg.add(railAtriumE);
            addBoxCollider(-110 + 9.2, 120 - 1.5, 0.8, 26);

            // --- NGAI VÀNG MẶT TRĂNG CỔ ĐẠI (COLOSSAL MOON THRONE - Y = 14.0m) ---
            const throneDais = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), matCastle);
            throneDais.position.set(0, 13.6, 18);
            cg.add(throneDais);

            const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 2.2), matVelvetPurple);
            throneSeat.position.set(0, 14.8, 18.5);
            cg.add(throneSeat);

            const throneBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.6, 0.6), matGoldTrim);
            throneBack.position.set(0, 17.0, 19.4);
            cg.add(throneBack);

            // 2 Colossal Glowing Golden Crescent Moons flanking throne
            [-1.8, 1.8].forEach(mSide => {
                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 12, 32, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(mSide, 17.5, 19.0);
                crescent.rotation.z = (mSide > 0 ? -0.4 : 0.4);
                cg.add(crescent);
            });

            // Majestic Gothic Rose Window on back wall behind throne
            const roseWindow = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.35, 16, 32), matGoldTrim);
            roseWindow.position.set(0, 18.0, 22.8);
            cg.add(roseWindow);

            const roseGlass = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), matCyanGlow);
            roseGlass.position.set(0, 18.0, 22.7);
            cg.add(roseGlass);

            const throneGlowLt = new THREE.PointLight(0x00f5d4, 3.5, 24);
            throneGlowLt.position.set(0, 17.5, 18.0);
            cg.add(throneGlowLt);

            addBoxCollider(-110, 120 + 18.5, 5.0, 3.5); // Throne collider

            // --- THƯ VIỆN HOÀNG GIA (ROYAL ARCHIVES - East Wing X = 14, Z = -4) ---
            for(let b = 0; b < 3; b++) {
                const bShelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 5.0), matWoodDark);
                bShelf.position.set(18.5, 15.6, -11 + b * 6.5);
                cg.add(bShelf);

                // Glowing Spellbooks on shelves
                for(let bk = 0; bk < 4; bk++) {
                    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), bk % 2 === 0 ? matPurpleGlow : matCyanGlow);
                    bMesh.position.set(18.2, 14.2 + bk * 1.0, -12 + b * 6.5 + bk * 0.7);
                    cg.add(bMesh);
                }
            }
            addBoxCollider(-110 + 18, 120 - 4, 3.0, 18.0); // Bookshelves collider

            // Scholar Study Desk & Floating Grimoire
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);

            const floatBook = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.8), matVelvetPurple);
            floatBook.position.set(13.5, 14.6, -4);
            floatBook.rotation.y = 0.4;
            cg.add(floatBook);

            // Secret Attic Staircase behind bookshelf (East Wing: X = 16, Z = 2 to 12)
            for(let s = 0; s < 12; s++) {
                const aStep = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 1.0), matCastle);
                aStep.position.set(16, 13.25 + s * 0.58, 2 + s * 0.9);
                cg.add(aStep);
            }

            // =================================================================
            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT (SECRET ATTIC & ASTRAL SANCTUM - Y = 20.0m)
            // =================================================================
            // Dark Timber Plank Attic Floor
            const atticFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 40), matTimber);
            atticFloor.rotation.x = -Math.PI / 2;
            atticFloor.position.set(0, 20.02, 0);
            cg.add(atticFloor);

            // Exposed Gothic Timber Roof Trusses & Rafters
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

            // Starlight Moon Skylight / Oculum
            const skylight = new THREE.Mesh(new THREE.RingGeometry(1.8, 3.2, 16), matGoldTrim);
            skylight.rotation.x = -Math.PI / 2;
            skylight.position.set(0, 26.5, 0);
            cg.add(skylight);

            const skylightGlass = new THREE.Mesh(new THREE.CircleGeometry(2.8, 16), matCyanGlow);
            skylightGlass.rotation.x = -Math.PI / 2;
            skylightGlass.position.set(0, 26.48, 0);
            cg.add(skylightGlass);

            // --- BÀN TẾ HUYỀN THUẬT & TRÁI TIM NGUYỆT TỘC (ASTRAL CORE) ---
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

            addCylinderCollider(-110, 120, 3.2); // Altar core collider

            // Secret Moonstone Treasure Chest in Attic Corner (X = -12, Z = 8)
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);

            const aChestGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.5), matCyanGlow);
            aChestGlow.position.set(-12, 21.2, 8);
            cg.add(aChestGlow);

            addBoxCollider(-110 - 12, 120 + 8, 2.5, 2.5); // Attic chest collider

            // Exterior Secret Spire Balcony (Z = -20, overlooking realm from 20m high)
            const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 6), matCastle);
            balconyFloor.position.set(0, 19.8, -22);
            cg.add(balconyFloor);

            const balconyRail = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.25, 8, 16, Math.PI), matGoldTrim);
            balconyRail.position.set(0, 20.8, -23);
            cg.add(balconyRail);

            // =================================================================
            // GRAND BRIDGE RAMP & RAILS (Connecting Moon Ground to Floor 1)
            // =================================================================
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.8, 55), matCastle);
            bridge.position.set(0, 3.0, -51);
            bridge.rotation.x = -0.11;
            cg.add(bridge);

            // Bridge Side Railings
            const railL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
            railL.position.set(-3.4, 4.2, -51);
            railL.rotation.x = -0.11;
            cg.add(railL);
            addBoxCollider(-110 - 3.4, 120 - 51, 1.2, 55);

            const railR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
            railR.position.set(3.4, 4.2, -51);
            railR.rotation.x = -0.11;
            cg.add(railR);
            addBoxCollider(-110 + 3.4, 120 - 51, 1.2, 55);

            cg.position.set(-110, 0, 120);
            scene.add(cg);

            // =================================================================
            // 5 INTERACTABLES ACROSS ALL 4 CASTLE LEVELS
            // =================================================================
            // Level 0: Dungeon Vault
            interactables.push({
                id: 'castle_dungeon_treasury',
                pos: new THREE.Vector3(-110 + 15, 1.0, 120 + 9),
                radius: 8.5,
                prompt: 'Mở Khóa Kho Báu Hầm Ngục Hoàng Gia (Nhận Bí Kíp Nguyệt Tộc)',
                type: 'throne'
            });

            // Level 1: Great Hall Banquet & Knights
            interactables.push({
                id: 'castle_hall_banquet',
                pos: new THREE.Vector3(-110 - 10, 6.0, 120 - 5),
                radius: 8.5,
                prompt: 'Khám phá Bàn Tiệc & Giáp Trụ Kỵ Sĩ Đại Điện (Tầng 1)',
                type: 'throne'
            });

            // Level 2: Moon Throne
            interactables.push({
                id: 'castle_throne',
                pos: new THREE.Vector3(-110, 14.0, 120 + 17),
                radius: 8.5,
                prompt: 'Ngồi lên Ngai Vàng Mặt Trăng Tsukiezz (Thánh Điện Tầng 2)',
                type: 'throne'
            });

            // Level 2: Royal Archives / Library
            interactables.push({
                id: 'castle_library',
                pos: new THREE.Vector3(-110 + 14, 13.0, 120 - 4),
                radius: 8.0,
                prompt: 'Đọc Mật Điển Lịch Sử Vương Quốc (Thư Viện Hoàng Gia Tầng 2)',
                type: 'throne'
            });

            // Level 3: Secret Attic Astral Core
            interactables.push({
                id: 'castle_attic_core',
                pos: new THREE.Vector3(-110, 20.0, 120),
                radius: 8.5,
                prompt: 'Kích hoạt Trái Tim Nguyệt Tộc (Bí Mật Tối Cao Gác Mái Lâu Đài)',
                type: 'throne'
            });
        }
        buildCastle3D();'''

    if old_castle_pattern.search(content):
        content = old_castle_pattern.sub(new_castle, content, count=1)
        print("Updated buildCastle3D with 4 detailed floors, dungeon, attic, and stairs!")
    else:
        print("Warning: old_castle pattern not matched.")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Finished updating demo/index.html!")

if __name__ == '__main__':
    main()
