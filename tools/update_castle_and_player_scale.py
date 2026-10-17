import os
import sys

INDEX_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\demo\index.html"

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = []

# 1. Update Tour Bar: remove duplicate buttons and add explicit elevation
old_tour_block = """            <!-- FAST TRAVEL TOUR BAR -->
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
            </div>
                <button class="tour-btn" onclick="fastTravelTo(0, 5, 'Đền Thần Điện Trung Tâm')">🏛️ Đền Trung Tâm</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 126, 'Lâu Đài Hoàng Gia Tsukiezz')">🏰 Lâu Đài</button>
                <button class="tour-btn" onclick="fastTravelTo(115, 105, 'Đấu Trường La Mã Bị Bỏ Hoang')">⚔️ Đấu Trường</button>
                <button class="tour-btn" onclick="fastTravelTo(-147, -28, 'Trạm Vũ Trụ Công Nghệ Tối Tân')">🛸 Trạm Vũ Trụ</button>
                <button class="tour-btn" onclick="fastTravelTo(-85, -100, 'Trụ Tế Đàn 2 Tầng Huyết Sắc')">🩸 Tế Đàn 2 Tầng</button>
                <button class="tour-btn" onclick="fastTravelTo(-35, -145, 'Hồ Nước Thủy Ngân Gương Bạc')">🌊 Hồ Thủy Ngân</button>
                <button class="tour-btn" onclick="fastTravelTo(145, 20, 'Đại Cổ Thụ Nguyệt Tộc 45m')">🌳 Cổ Thụ 45m</button>
                <button class="tour-btn" onclick="fastTravelTo(133, -116, 'Hang Động Nguyệt Tinh')">💎 Hang Động</button>
                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>"""

new_tour_block = """            <!-- FAST TRAVEL TOUR BAR -->
            <div class="hud-tour-bar">
                <div class="hud-tour-title">🚀 Tham Quan:</div>
                <button class="tour-btn" onclick="fastTravelTo(0, 5, 'Đền Thần Điện Trung Tâm', 0.2)">🏛️ Đền Trung Tâm</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 105, 'Lâu Đài (Tầng 1 - Đại Điện)', 6.0)">🏰 Lâu Đài T1</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 133, 'Lâu Đài (Tầng 2 - Ngai Vàng)', 13.0)">👑 Ngai Vàng T2</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 114, 'Lâu Đài (Gác Mái Bí Mật)', 20.0)">✨ Gác Mái Bí Mật</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 115, 'Lâu Đài (Hầm Ngục & Kho Báu)', 1.0)">🗝️ Hầm Ngục</button>
                <button class="tour-btn" onclick="fastTravelTo(115, 105, 'Đấu Trường La Mã Bị Bỏ Hoang')">⚔️ Đấu Trường</button>
                <button class="tour-btn" onclick="fastTravelTo(-147, -28, 'Trạm Vũ Trụ Công Nghệ Tối Tân')">🛸 Trạm Vũ Trụ</button>
                <button class="tour-btn" onclick="fastTravelTo(-85, -100, 'Trụ Tế Đàn 2 Tầng Huyết Sắc')">🩸 Tế Đàn 2 Tầng</button>
                <button class="tour-btn" onclick="fastTravelTo(-35, -145, 'Hồ Nước Thủy Ngân Gương Bạc')">🌊 Hồ Thủy Ngân</button>
                <button class="tour-btn" onclick="fastTravelTo(145, 20, 'Đại Cổ Thụ Nguyệt Tộc 45m')">🌳 Cổ Thụ 45m</button>
                <button class="tour-btn" onclick="fastTravelTo(133, -116, 'Hang Động Nguyệt Tinh')">💎 Hang Động</button>
                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>"""
replacements.append(("Tour bar", old_tour_block, new_tour_block))

# 2. Player Scale 5x Smaller
old_pg_block = """        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        scene.add(playerGroup);"""

new_pg_block = """        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        playerGroup.scale.set(0.2, 0.2, 0.2); // Player scaled 5x smaller so scenery feels colossal
        scene.add(playerGroup);"""
replacements.append(("Player scale", old_pg_block, new_pg_block))

# 3. getGroundElevation & Solid Height-Aware Collision Physics
old_elev_coll_block = """        // =====================================================================
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
        }

        // =====================================================================
        // SOLID COLLISION PHYSICS ENGINE (NO MORE WALL-CLIPPING)
        // =====================================================================
        const colliders = [];

        function addCylinderCollider(x, z, radius) {
            colliders.push({ type: 'cylinder', x, z, radius });
        }

        function addBoxCollider(cx, cz, width, depth) {
            colliders.push({
                type: 'box',
                minX: cx - width / 2,
                maxX: cx + width / 2,
                minZ: cz - depth / 2,
                maxZ: cz + depth / 2
            });
        }

        function checkCollision(px, pz, playerRadius = 0.85) {
            // World Boundary (520m total realm, player bounded within +/- 248m)
            if (Math.abs(px) > 248 || Math.abs(pz) > 248) return true;

            // Solid Castle Base Mesa Cliff:
            // When player is down at ground level (elevation < 4.8m), they CANNOT walk into the 6m stone cliff
            const curElevation = getGroundElevation(px, pz);
            if (curElevation < 4.8) {
                if (px + playerRadius > -136.0 && px - playerRadius < -84.0 &&
                    pz + playerRadius > 92.0 && pz - playerRadius < 148.0) {
                    // Only allow passage if player is on the ramp entry corridor:
                    const onRamp = (px >= -114.0 && px <= -106.0 && pz <= 95.0);
                    if (!onRamp) return true;
                }
            }

            for (let i = 0; i < colliders.length; i++) {
                const c = colliders[i];
                if (c.type === 'cylinder') {
                    const dx = px - c.x;
                    const dz = pz - c.z;
                    const minDist = c.radius + playerRadius;
                    if (dx * dx + dz * dz < minDist * minDist) {
                        return true;
                    }
                } else if (c.type === 'box') {
                    if (px + playerRadius > c.minX && px - playerRadius < c.maxX &&
                        pz + playerRadius > c.minZ && pz - playerRadius < c.maxZ) {
                        return true;
                    }
                }
            }
            return false;
        }"""

new_elev_coll_block = """        // =====================================================================
        // TERRAIN ELEVATION & RAMP / 4-LEVEL CASTLE STAIRS ENGINE
        // =====================================================================
        function getGroundElevation(px, pz) {
            // 1. Castle Grand Bridge Ramp (from z = 42 to z = 95, x in [-114.5, -105.5])
            if (px >= -114.5 && px <= -105.5 && pz >= 42.0 && pz <= 95.0) {
                const rampT = (pz - 42.0) / (95.0 - 42.0);
                return rampT * 6.0;
            }

            // 2. CASTLE 4-LEVEL MULTI-STORY COMPLEX (x in [-136, -84], z in [94, 146])
            const clx = px - (-110.0);
            const clz = pz - 120.0;
            if (clx >= -26.0 && clx <= 26.0 && clz >= -26.0 && clz <= 26.0) {
                // A. Dungeon Stairs (Northwest: localX in [-18.5, -13.5], localZ in [-23.0, -9.5])
                // Smooth slope connecting Floor 1 (Y=6.0m at localZ = -22.5) to Dungeon (Y=1.0m at localZ = -10.0)
                if (clx >= -18.5 && clx <= -13.5 && clz >= -23.0 && clz <= -9.5) {
                    const st = (clz - (-22.5)) / ((-10.0) - (-22.5));
                    return 6.0 - Math.max(0, Math.min(1, st)) * 5.0;
                }

                // B. Grand Imperial Double Staircase (Floors 1 to 2)
                // 1) Central Lower Flight: localX in [-4.5, 4.5], localZ in [4.5, 11.5]
                // Ascends from Floor 1 (Y=6.0m) to Intermediate Landing (Y=9.5m)
                if (clx >= -4.5 && clx <= 4.5 && clz >= 4.5 && clz <= 11.5) {
                    const st = (clz - 4.5) / 7.0;
                    return 6.0 + Math.max(0, Math.min(1, st)) * 3.5;
                }

                // 2) Intermediate Landing Platform: localX in [-16.0, 16.0], localZ in [10.5, 12.5]
                if (clx >= -16.0 && clx <= 16.0 && clz >= 10.5 && clz <= 12.5) {
                    return 9.5;
                }

                // 3) Left Wing Flight: localX in [-16.0, -9.5], localZ in [11.5, 18.5]
                // Ascends from Intermediate Landing (Y=9.5m) to Floor 2 Mezzanine (Y=13.0m)
                if (clx >= -16.0 && clx <= -9.5 && clz >= 11.5 && clz <= 18.5) {
                    const st = (clz - 11.5) / 7.0;
                    return 9.5 + Math.max(0, Math.min(1, st)) * 3.5;
                }

                // 4) Right Wing Flight: localX in [9.5, 16.0], localZ in [11.5, 18.5]
                // Ascends from Intermediate Landing (Y=9.5m) to Floor 2 Mezzanine (Y=13.0m)
                if (clx >= 9.5 && clx <= 16.0 && clz >= 11.5 && clz <= 18.5) {
                    const st = (clz - 11.5) / 7.0;
                    return 9.5 + Math.max(0, Math.min(1, st)) * 3.5;
                }

                // C. Secret Attic Staircase behind bookshelf (East Wing: localX in [13.5, 18.5], localZ in [1.5, 13.5])
                // Ascends from Floor 2 (Y=13.0m at localZ = 1.5) to Secret Attic (Y=20.0m at localZ = 13.0)
                if (clx >= 13.5 && clx <= 18.5 && clz >= 1.5 && clz <= 13.5) {
                    const st = (clz - 1.5) / 11.5;
                    return 13.0 + Math.max(0, Math.min(1, st)) * 7.0;
                }

                // D. Exterior Secret Spire Balcony (Attic Level, localZ in [-25.5, -19.5], localX in [-6.0, 6.0])
                if (currentGroundY >= 16.8 && clx >= -6.0 && clx <= 6.0 && clz >= -25.5 && clz <= -19.5) {
                    return 20.0;
                }

                // E. Royal Moon Throne Dais (Floor 2: localX in [-6.0, 6.0], localZ in [15.0, 21.5])
                if (currentGroundY >= 9.8 && currentGroundY < 16.8 && clx >= -6.0 && clx <= 6.0 && clz >= 15.0 && clz <= 21.5) {
                    return 14.0;
                }

                // Default floor elevation based on current elevation zone of player
                if (currentGroundY < 3.8) {
                    // TẦNG HẦM (DUNGEON / CRYPT)
                    return 1.0;
                } else if (currentGroundY < 9.8) {
                    // TẦNG 1 (GRAND IMPERIAL HALL)
                    return 6.0;
                } else if (currentGroundY < 16.8) {
                    // TẦNG 2 (ROYAL THRONE & ARCHIVES)
                    return 13.0;
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
        }

        // =====================================================================
        // SOLID HEIGHT-AWARE COLLISION PHYSICS ENGINE (MULTI-FLOOR COMPATIBLE)
        // =====================================================================
        const colliders = [];

        function addCylinderCollider(x, z, radius, minY = -100, maxY = 500) {
            colliders.push({ type: 'cylinder', x, z, radius, minY, maxY });
        }

        function addBoxCollider(cx, cz, width, depth, minY = -100, maxY = 500) {
            colliders.push({
                type: 'box',
                minX: cx - width / 2,
                maxX: cx + width / 2,
                minZ: cz - depth / 2,
                maxZ: cz + depth / 2,
                minY,
                maxY
            });
        }

        function checkCollision(px, pz, py = (playerGroup ? playerGroup.position.y : 0), playerRadius = 0.20) {
            // World Boundary (520m total realm, player bounded within +/- 248m)
            if (Math.abs(px) > 248 || Math.abs(pz) > 248) return true;

            // Solid Castle Base Mesa Cliff:
            // Prevents walking into the 6m stone foundation from outside at ground level
            if (py < 4.8 && currentGroundY < 3.8) {
                if (px + playerRadius > -136.0 && px - playerRadius < -84.0 &&
                    pz + playerRadius > 92.0 && pz - playerRadius < 148.0) {
                    // If approaching from outside front, only allow entry via bridge ramp:
                    if (pz <= 95.0) {
                        const onRamp = (px >= -114.5 && px <= -105.5);
                        if (!onRamp) return true;
                    }
                }
            }

            for (let i = 0; i < colliders.length; i++) {
                const c = colliders[i];
                // Height check: if player is outside vertical bounds of this collider, ignore it!
                if (py + 0.35 < c.minY || py > c.maxY) continue;

                if (c.type === 'cylinder') {
                    const dx = px - c.x;
                    const dz = pz - c.z;
                    const minDist = c.radius + playerRadius;
                    if (dx * dx + dz * dz < minDist * minDist) {
                        return true;
                    }
                } else if (c.type === 'box') {
                    if (px + playerRadius > c.minX && px - playerRadius < c.maxX &&
                        pz + playerRadius > c.minZ && pz - playerRadius < c.maxZ) {
                        return true;
                    }
                }
            }
            return false;
        }"""
replacements.append(("Elevation & Collision Engine", old_elev_coll_block, new_elev_coll_block))

# 4. Castle 4 corner towers collider
old_sp_col = "addCylinderCollider(-110 + tx, 120 + tz, 5.0);"
new_sp_col = "addCylinderCollider(-110 + tx, 120 + tz, 4.8, 0, 50);"
replacements.append(("Corner towers", old_sp_col, new_sp_col))

# 5. Castle outer walls colliders
old_walls_block = """            // Outer Castle Walls (Height: 24m, enclosing Floors 1, 2, and Attic)
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
            addBoxCollider(-110 + 13, 120 - 26, 19, 3.5);"""

new_walls_block = """            // Outer Castle Walls (Height: 24m, enclosing Floors 1, 2, and Attic)
            // Left Wall
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 22, 46), matCastle);
            w1.position.set(-21, 16, 0); cg.add(w1);
            addBoxCollider(-110 - 21, 120, 2.5, 46, 0, 32);

            // Right Wall
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 22, 46), matCastle);
            w2.position.set(21, 16, 0); cg.add(w2);
            addBoxCollider(-110 + 21, 120, 2.5, 46, 0, 32);

            // Back Wall
            const w3 = new THREE.Mesh(new THREE.BoxGeometry(44, 22, 2.5), matCastle);
            w3.position.set(0, 16, 23); cg.add(w3);
            addBoxCollider(-110, 120 + 23, 44, 2.5, 0, 32);

            // Front Balustrades left & right of Grand Bridge Gate (Fl.1 gate open at X=[-113.5, -106.5])
            const fwL = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwL.position.set(-13, 12, -26); cg.add(fwL);
            addBoxCollider(-110 - 13, 120 - 26, 17, 2.5, 5.5, 19.5);

            const fwR = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwR.position.set(13, 12, -26); cg.add(fwR);
            addBoxCollider(-110 + 13, 120 - 26, 17, 2.5, 5.5, 19.5);"""
replacements.append(("Outer walls colliders", old_walls_block, new_walls_block))

# 6. Prison cells, open cell 1, remove giant collider
old_cells_block = """            // 3 Iron Prison Cells along West Wall
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
            addBoxCollider(-110 - 16, 120, 8.0, 32.0); // Cell boundary collider"""

new_cells_block = """            // 3 Iron Prison Cells along West Wall (Cell 1 has open door for player exploration!)
            for(let cell = 0; cell < 3; cell++) {
                const cellZ = -10 + cell * 10;
                // Partition wall
                const pWall = new THREE.Mesh(new THREE.BoxGeometry(6, 4.8, 0.4), matCastle);
                pWall.position.set(-16, 3.4, cellZ);
                cg.add(pWall);

                // Vertical Iron Bars (Center cell #1 has broken open bars so player can enter!)
                for(let b = 0; b < 6; b++) {
                    if (cell === 1 && (b === 2 || b === 3)) continue; // Open entrance to cell!
                    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8), matIronBars);
                    bar.position.set(-13, 3.4, cellZ - 4.2 + b * 0.85);
                    cg.add(bar);
                }

                // Hanging chains in cells
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), matIronBars);
                chain.position.set(-17, 4.5, cellZ - 2.0);
                cg.add(chain);

                // Precise partition collider (Y = 1.0 to 5.5m only!)
                addBoxCollider(-110 - 16, 120 + cellZ, 6.0, 0.4, 1.0, 5.5);
            }

            // Glowing Ancient Prisoner Moon Relic inside open prison cell
            const cellRelic = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matCyanGlow);
            cellRelic.position.set(-16, 1.4, 0);
            cg.add(cellRelic);"""
replacements.append(("Prison cells", old_cells_block, new_cells_block))

# 7. Sarcophagus, Treasury, Dungeon Steps
old_dungeon_rest = """            addBoxCollider(-110, 120, 4.6, 2.8); // Sarcophagus collider

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
            }"""

new_dungeon_rest = """            addBoxCollider(-110, 120, 4.4, 2.6, 1.0, 3.5); // Sarcophagus collider (Dungeon only!)

            // Royal Secret Treasury in East Alcove (X = 16, Z = 10)
            for(let ch = 0; ch < 3; ch++) {
                const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2), matGoldTrim);
                chest.position.set(15, 1.5, 6 + ch * 3.2);
                cg.add(chest);

                const gemLoot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), matCyanGlow);
                gemLoot.position.set(15, 2.2, 6 + ch * 3.2);
                cg.add(gemLoot);
            }
            addBoxCollider(-110 + 15, 120 + 9, 2.5, 8.0, 1.0, 3.5); // Treasury chests collider (Dungeon only!)

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
            for(let s = 0; s <= 10; s++) {
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.3), matCastle);
                step.position.set(-16, 5.8 - s * 0.48, -22 + s * 1.2);
                cg.add(step);
            }"""
replacements.append(("Dungeon sarcophagus, treasury and steps", old_dungeon_rest, new_dungeon_rest))

# 8. Floor 1 Nave Pillars collider
old_f1_pillars = "addCylinderCollider(-110 + colX, 120 + colZ, 1.4);"
new_f1_pillars = "addCylinderCollider(-110 + colX, 120 + colZ, 1.1, 5.8, 13.0);"
replacements.append(("Floor 1 pillars", old_f1_pillars, new_f1_pillars))

# 9. Banquet & Armory colliders
old_f1_furniture = """            addBoxCollider(-110 - 12, 120 - 5, 5.5, 15.0); // Banquet table collider

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
            addBoxCollider(-110 + 12, 120 - 5, 4.0, 14.0); // Armory collider"""

new_f1_furniture = """            addBoxCollider(-110 - 12, 120 - 5, 3.5, 14.0, 5.8, 8.5); // Banquet table collider (Floor 1 only!)

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
            addBoxCollider(-110 + 12, 120 - 5, 3.0, 12.0, 5.8, 10.0); // Armory collider (Floor 1 only!)"""
replacements.append(("Floor 1 banquet and armory", old_f1_furniture, new_f1_furniture))

# 10. Imperial Double Staircase: add intermediate landing
old_stairs_block = """            // Grand Imperial Double Staircase rising to Floor 2 (Z = 6 to 18)
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
            }"""

new_stairs_block = """            // Grand Imperial Double Staircase rising to Floor 2 (Z = 5 to 18)
            // 1. Central lower landing (Z = 5 to 11, Y = 6.0 to 9.5m)
            for(let s = 0; s < 7; s++) {
                const st = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 1.2), matCastle);
                st.position.set(0, 6.25 + s * 0.5, 5 + s * 1.0);
                cg.add(st);
            }

            // 2. Intermediate Landing Platform connecting central flight to Left and Right Wings (Y = 9.5m)
            const midLanding = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 3.5), matCastle);
            midLanding.position.set(0, 9.25, 11.5);
            cg.add(midLanding);

            // 3. Split into Left Wing (X = -13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stL.position.set(-13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stL);
            }

            // 4. Split into Right Wing (X = 13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stR.position.set(13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stR);
            }"""
replacements.append(("Imperial double stairs", old_stairs_block, new_stairs_block))

# 11. Floor 2 Balustrades, Throne, Bookshelves, Secret Attic Stairs
old_f2_block = """            // Balustrades around Atrium Opening (keeps player from falling)
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
            }"""

new_f2_block = """            // Balustrades around Atrium Opening (Floor 2 ONLY: Y = 12.8 to 15.5m - does NOT block Floor 1!)
            const railAtriumW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumW.position.set(-9.2, 13.6, -1.5);
            cg.add(railAtriumW);
            addBoxCollider(-110 - 9.2, 120 - 1.5, 0.6, 26, 12.8, 15.5);

            const railAtriumE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), matGoldTrim);
            railAtriumE.position.set(9.2, 13.6, -1.5);
            cg.add(railAtriumE);
            addBoxCollider(-110 + 9.2, 120 - 1.5, 0.6, 26, 12.8, 15.5);

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

            addBoxCollider(-110, 120 + 18.5, 3.6, 2.8, 13.5, 18.0); // Throne collider (Floor 2 only!)

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
            // Bookshelves collider: covers Z = -13 to 0, leaves Z = 1.5 to 13 completely open for Secret Stairs!
            addBoxCollider(-110 + 18.2, 120 - 6.5, 2.0, 13.0, 12.8, 19.5);

            // Scholar Study Desk & Floating Grimoire
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);

            const floatBook = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.8), matVelvetPurple);
            floatBook.position.set(13.5, 14.6, -4);
            floatBook.rotation.y = 0.4;
            cg.add(floatBook);

            // Secret Attic Staircase behind bookshelf (East Wing: X = 16, Z = 1.5 to 13, Y = 13.0 to 20.0m)
            for(let s = 0; s <= 12; s++) {
                const aStep = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
                aStep.position.set(16, 13.25 + s * 0.58, 1.5 + s * 0.92);
                cg.add(aStep);
            }"""
replacements.append(("Floor 2 and secret stairs", old_f2_block, new_f2_block))

# 12. Floor 3 (Attic) Altar Core, Chest, Balcony Door Arch & Balcony Colliders, Bridge Colliders
old_attic_bridge = """            addCylinderCollider(-110, 120, 3.2); // Altar core collider

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
            addBoxCollider(-110 + 3.4, 120 - 51, 1.2, 55);"""

new_attic_bridge = """            addCylinderCollider(-110, 120, 2.8, 19.8, 26.0); // Altar core collider (Attic only!)

            // Secret Moonstone Treasure Chest in Attic Corner (X = -12, Z = 8)
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);

            const aChestGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.5), matCyanGlow);
            aChestGlow.position.set(-12, 21.2, 8);
            cg.add(aChestGlow);

            addBoxCollider(-110 - 12, 120 + 8, 2.2, 2.2, 19.8, 23.0); // Attic chest collider (Attic only!)

            // Decorative Arch doorway leading to Exterior Spire Balcony
            const balconyArch = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 12, 16, Math.PI), matGoldTrim);
            balconyArch.position.set(0, 22.0, -21);
            cg.add(balconyArch);

            // Exterior Secret Spire Balcony (Z = -22, overlooking realm from 20m high)
            const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 6), matCastle);
            balconyFloor.position.set(0, 19.8, -22);
            cg.add(balconyFloor);

            const balconyRail = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.25, 8, 16, Math.PI), matGoldTrim);
            balconyRail.position.set(0, 20.8, -23);
            cg.add(balconyRail);

            // Balcony safety colliders (Attic level only: Y = 19.5 to 23.0m)
            addBoxCollider(-110, 120 - 25.0, 10.0, 1.0, 19.5, 23.0); // Front railing
            addBoxCollider(-110 - 5.0, 120 - 22.0, 1.0, 6.0, 19.5, 23.0); // Left railing
            addBoxCollider(-110 + 5.0, 120 - 22.0, 1.0, 6.0, 19.5, 23.0); // Right railing

            // =================================================================
            // GRAND BRIDGE RAMP & RAILS (Connecting Moon Ground to Floor 1)
            // =================================================================
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.8, 55), matCastle);
            bridge.position.set(0, 3.0, -51);
            bridge.rotation.x = -0.11;
            cg.add(bridge);

            // Bridge Side Railings (Ground to Floor 1 level only: Y = 0 to 7.5m)
            const railL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
            railL.position.set(-3.4, 4.2, -51);
            railL.rotation.x = -0.11;
            cg.add(railL);
            addBoxCollider(-110 - 3.4, 120 - 51, 1.0, 55, 0, 7.5);

            const railR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
            railR.position.set(3.4, 4.2, -51);
            railR.rotation.x = -0.11;
            cg.add(railR);
            addBoxCollider(-110 + 3.4, 120 - 51, 1.0, 55, 0, 7.5);"""
replacements.append(("Attic and bridge colliders", old_attic_bridge, new_attic_bridge))

# 13. Add Dungeon Cell interactable
old_interactable_needle = """            interactables.push({
                id: 'castle_dungeon_treasury',"""

new_interactable_needle = """            // Level 0: Dungeon Secret Cell with Moon Relic
            interactables.push({
                id: 'castle_dungeon_cell',
                pos: new THREE.Vector3(-110 - 16, 1.0, 120),
                radius: 4.5,
                prompt: 'Khám phá Ngục Giam Bí Mật (Hộp Sọ Dạ Quang)',
                type: 'dungeon_cell'
            });

            interactables.push({
                id: 'castle_dungeon_treasury',"""
replacements.append(("Dungeon cell interactable", old_interactable_needle, new_interactable_needle))

# 14. fastTravelTo
old_fasttravel_block = """        function fastTravelTo(tx, tz, name) {
            const gy = getGroundElevation(tx, tz);
            playerGroup.position.set(tx, gy, tz);
            currentGroundY = gy;
            jumpY = 0;
            jumpVelocityY = 0;
            isGrounded = true;
            camYaw = 0;
            camPitch = 0.32;
            camera.position.set(tx, gy + 4.5, tz + 8.5);
            camera.lookAt(tx, gy + 1.2, tz);
            sfx.pickup();
            showNotification(`🚀 Đã dịch chuyển đến: ${name}!`);
            const badgeName = document.getElementById('landmark-current-name');
            if (badgeName) badgeName.textContent = name;
        }"""

new_fasttravel_block = """        function fastTravelTo(tx, tz, name, explicitY = null) {
            let gy = (explicitY !== null) ? explicitY : getGroundElevation(tx, tz);
            currentGroundY = gy;
            playerGroup.position.set(tx, gy, tz);
            jumpY = 0;
            jumpVelocityY = 0;
            isGrounded = true;
            camYaw = 0;
            camPitch = 0.28;
            camDistance = 3.2; // 5x scale view distance
            camera.position.set(tx, gy + 1.2, tz + 3.2);
            camera.lookAt(tx, gy + 0.35, tz);
            sfx.pickup();
            showNotification(`🚀 Đã dịch chuyển đến: ${name}!`);
            const badgeName = document.getElementById('landmark-current-name');
            if (badgeName) badgeName.textContent = name;
        }"""
replacements.append(("fastTravelTo function", old_fasttravel_block, new_fasttravel_block))

# 15. Camera controls & distance
old_cam_controls = """        let mouseLastY = 0;
        let camYaw = 0;
        let camPitch = 0.32;
        let camDistance = 8.5;"""

new_cam_controls = """        let mouseLastY = 0;
        let camYaw = 0;
        let camPitch = 0.28;
        let camDistance = 3.2; // Optimized for 5x smaller character to appreciate colossal scale"""
replacements.append(("cam controls", old_cam_controls, new_cam_controls))

old_wheel_block = """        window.addEventListener('wheel', (e) => {
            if (gameState.isPlaying) {
                camDistance = Math.max(3.8, Math.min(24.0, camDistance + e.deltaY * 0.012));
            }
        }, { passive: true });"""

new_wheel_block = """        window.addEventListener('wheel', (e) => {
            if (gameState.isPlaying) {
                camDistance = Math.max(1.0, Math.min(24.0, camDistance + e.deltaY * 0.008));
            }
        }, { passive: true });"""
replacements.append(("cam zoom", old_wheel_block, new_wheel_block))

# 16. checkInteractables vertical tolerance
old_check_interact = """                const distXZ = Math.hypot(dx, dz);
                const distY = Math.abs(p.y - item.pos.y);
                // Check generous horizontal range and vertical tolerance
                if (distXZ <= item.radius && distY <= 10.0) {"""

new_check_interact = """                const distXZ = Math.hypot(dx, dz);
                const distY = Math.abs(p.y - item.pos.y);
                // Check generous horizontal range and strict floor vertical tolerance (3.0m so floors don't cross-trigger)
                if (distXZ <= item.radius && distY <= 3.0) {"""
replacements.append(("checkInteractables", old_check_interact, new_check_interact))

# 17. handleInteraction: add dungeon cell
old_handle_interact = """            else if (item.id === 'castle_dungeon_treasury') {"""

new_handle_interact = """            else if (item.id === 'castle_dungeon_cell') {
                sfx.pickup();
                showNotification("🗝️ NGỤC GIAM BÍ MẬT: Nhặt được Hộp Sọ Dạ Quang & Chìa Khóa Hư Không của Tù Nhân Cổ Đại!");
            }
            else if (item.id === 'castle_dungeon_treasury') {"""
replacements.append(("handleInteraction dungeon cell", old_handle_interact, new_handle_interact))

# 18. enterGame camera
old_enter_game = """            camera.position.set(playerGroup.position.x, gy + 4.2, playerGroup.position.z + 7.8);
            camera.lookAt(playerGroup.position.x, gy + 1.2, playerGroup.position.z);"""

new_enter_game = """            camera.position.set(playerGroup.position.x, gy + 1.2, playerGroup.position.z + 3.2);
            camera.lookAt(playerGroup.position.x, gy + 0.35, playerGroup.position.z);"""
replacements.append(("enterGame camera", old_enter_game, new_enter_game))

# 19. Movement loop: speed and height-aware checkCollision
old_loop_block = """                const isMoving = (inputX !== 0 || inputZ !== 0);
                const currentSpeed = keys.shift ? 10.5 : 6.2;

                if (isMoving) {
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

                    // Axis-separated solid collision resolution (allows smooth sliding along walls & pillars)
                    if (!checkCollision(playerGroup.position.x + stepX, playerGroup.position.z)) {
                        playerGroup.position.x += stepX;
                    }
                    if (!checkCollision(playerGroup.position.x, playerGroup.position.z + stepZ)) {
                        playerGroup.position.z += stepZ;
                    }"""

new_loop_block = """                const isMoving = (inputX !== 0 || inputZ !== 0);
                const currentSpeed = keys.shift ? 7.5 : 4.5; // Proportional and nimble for 5x smaller character

                if (isMoving) {
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
                    }"""
replacements.append(("movement loop", old_loop_block, new_loop_block))

# 20. Elevation lerp, jump & camera target
old_elev_cam_block = """                // =========================================================
                // SMOOTH TERRAIN & RAMP ELEVATION SNAPPING
                // =========================================================
                const targetGroundY = getGroundElevation(playerGroup.position.x, playerGroup.position.z);
                currentGroundY = THREE.MathUtils.lerp(currentGroundY, targetGroundY, 18 * delta);

                // Jump Physics
                if (keys.jump && isGrounded) {
                    jumpVelocityY = 8.5;
                    isGrounded = false;
                    keys.jump = false;
                }

                if (!isGrounded) {
                    jumpVelocityY += gravity * delta;
                    jumpY += jumpVelocityY * delta;
                    if (jumpY <= 0) {
                        jumpY = 0;
                        jumpVelocityY = 0;
                        isGrounded = true;
                    }

                    // Mid-air Jump Tuck Animation
                    if (activeLimbs) {
                        activeLimbs.leftLeg.rotation.x = -0.42;
                        activeLimbs.rightLeg.rotation.x = -0.32;
                        if (activeLimbs.cape) activeLimbs.cape.rotation.x = 0.65;
                    }
                }

                // Final player Y position strictly anchored to ground elevation + jump
                playerGroup.position.y = currentGroundY + jumpY;

                checkInteractables();
                updateMinimap(playerGroup.position.x, playerGroup.position.z, playerGroup.rotation.y);

                // Third-person Orbit Camera with 360-degree right-click rotation
                const targetCamX = playerGroup.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDistance;
                const targetCamY = playerGroup.position.y + 1.8 + Math.sin(camPitch) * camDistance;
                const targetCamZ = playerGroup.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDistance;

                camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
                camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.3, playerGroup.position.z);"""

new_elev_cam_block = """                // =========================================================
                // SMOOTH TERRAIN & RAMP ELEVATION SNAPPING
                // =========================================================
                const targetGroundY = getGroundElevation(playerGroup.position.x, playerGroup.position.z);
                currentGroundY = THREE.MathUtils.lerp(currentGroundY, targetGroundY, 22 * delta);

                // Jump Physics (Cute bouncy hop for 5x smaller character)
                if (keys.jump && isGrounded) {
                    jumpVelocityY = 5.4;
                    isGrounded = false;
                    keys.jump = false;
                }

                if (!isGrounded) {
                    jumpVelocityY += gravity * delta;
                    jumpY += jumpVelocityY * delta;
                    if (jumpY <= 0) {
                        jumpY = 0;
                        jumpVelocityY = 0;
                        isGrounded = true;
                    }

                    // Mid-air Jump Tuck Animation
                    if (activeLimbs) {
                        activeLimbs.leftLeg.rotation.x = -0.42;
                        activeLimbs.rightLeg.rotation.x = -0.32;
                        if (activeLimbs.cape) activeLimbs.cape.rotation.x = 0.65;
                    }
                }

                // Final player Y position strictly anchored to ground elevation + jump
                playerGroup.position.y = currentGroundY + jumpY;

                checkInteractables();
                updateMinimap(playerGroup.position.x, playerGroup.position.z, playerGroup.rotation.y);

                // Third-person Orbit Camera with 360-degree right-click rotation (Framed for 5x smaller character)
                const targetCamX = playerGroup.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDistance;
                const targetCamY = playerGroup.position.y + 0.45 + Math.sin(camPitch) * camDistance;
                const targetCamZ = playerGroup.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDistance;

                camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
                camera.lookAt(playerGroup.position.x, playerGroup.position.y + 0.35, playerGroup.position.z);"""
replacements.append(("elevation snapping and cam lookAt", old_elev_cam_block, new_elev_cam_block))

# Apply all replacements sequentially
for name, old_str, new_str in replacements:
    if old_str not in content:
        print(f"ERROR: could not find match for: {name}")
        sys.exit(1)
    content = content.replace(old_str, new_str, 1)
    print(f"Applied: {name}")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESS: All replacements applied successfully!")
