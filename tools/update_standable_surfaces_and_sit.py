import os
import sys

INDEX_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\demo\index.html"

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize CRLF to LF in content for robust cross-platform matching
is_crlf = '\r\n' in content
content = content.replace('\r\n', '\n')

replacements = []

# 1. Update HUD Tour Bar: add Sit button
old_tour_needle = """                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>"""

new_tour_needle = """                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
                <button class="tour-btn" id="btn-toggle-sit" onclick="toggleSitting()" style="background: rgba(255, 215, 0, 0.25); border-color: #ffd700; color: #ffd700; font-weight: 700; box-shadow: 0 0 12px rgba(255, 215, 0, 0.35);">🧘 Ngồi Nghỉ (C)</button>
            </div>"""
replacements.append(("Tour bar sit button", old_tour_needle, new_tour_needle))

# 2. Update controls helper
old_controls_helper = """                <div><span class="hud-key">Space</span> Nhảy</div>
                <div><span class="hud-key">Chuột Phải (Giữ & Kéo)</span> Xoay góc nhìn 360°</div>"""

new_controls_helper = """                <div><span class="hud-key">Space</span> Nhảy lên chướng ngại vật</div>
                <div><span class="hud-key">C</span> Ngồi nghỉ / Đứng dậy</div>
                <div><span class="hud-key">Chuột Phải (Giữ & Kéo)</span> Xoay góc nhìn 360°</div>"""
replacements.append(("Controls helper", old_controls_helper, new_controls_helper))

# 3. Update getGroundElevation and Collider definitions to support Standable Solid Surfaces
old_elev_coll_engine = """        // =====================================================================
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

new_elev_coll_engine = """        // =====================================================================
        // SOLID 3D STANDABLE SURFACE & ELEVATION PHYSICS ENGINE
        // (Allows standing, walking, jumping & sitting ON steps and obstacles)
        // =====================================================================
        const colliders = [];

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

        function getGroundElevation(px, pz, py = currentGroundY) {
            // 1. BASE TERRAIN & ARCHITECTURAL FLOOR ELEVATION
            let baseElev = 0;

            // Castle Grand Bridge Ramp (from z = 42 to z = 95, x in [-114.5, -105.5])
            if (px >= -114.5 && px <= -105.5 && pz >= 42.0 && pz <= 95.0) {
                const rampT = (pz - 42.0) / (95.0 - 42.0);
                baseElev = rampT * 6.0;
            }
            // Castle Multi-Story complex floor plates
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.0 && pz <= 146.0) {
                if (currentGroundY < 3.8) {
                    baseElev = 1.0; // TẦNG HẦM (DUNGEON / CRYPT)
                } else if (currentGroundY < 9.8) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                } else if (currentGroundY < 16.8) {
                    baseElev = 13.0; // TẦNG 2 (NGẠI VÀNG & THƯ VIỆN)
                } else {
                    baseElev = 20.0; // TẦNG 3 (GÁC MÁI BÍ MẬT)
                }
            }
            // Altar 2-tier platforms
            else if (Math.hypot(px - (-85), pz - (-95)) <= 5.6) {
                baseElev = 5.2;
            } else if (Math.hypot(px - (-85), pz - (-95)) <= 9.2) {
                baseElev = 1.8;
            } else if (px >= -88.0 && px <= -82.0 && pz >= -104.0 && pz <= -95.0) {
                const stepT = (pz - (-104.0)) / ((-95.0) - (-104.0));
                baseElev = Math.max(0, stepT * 1.8);
            }
            // Space station landing pad
            else if (Math.hypot(px - (-145), pz - (-35)) <= 18.0) {
                baseElev = 0.5;
            }
            // Colosseum arena floor
            else if (Math.hypot(px - 115, pz - 110) <= 26.0) {
                baseElev = 0.25;
            }
            // Observatory platform
            else if (Math.hypot(px - (-120), pz - (-125)) <= 14.5) {
                baseElev = 1.0;
            }
            // Mercury lake pier & gazebo
            else if (px >= -37.5 && px <= -32.5 && pz >= -162.0 && pz <= -135.0) {
                baseElev = 0.45;
            } else if (Math.hypot(px - (-35), pz - (-135)) <= 4.5) {
                baseElev = 0.5;
            }
            // Moon dunes terrain
            else {
                let zOffset = Math.sin(px * 0.02) * Math.cos(pz * 0.02) * 2.5;
                const distCenter = Math.hypot(px, pz);
                if (distCenter > 180) zOffset += Math.sin(px * 0.04) * 4.0;
                baseElev = Math.max(0, zOffset);
            }

            // 2. DYNAMIC STANDABLE SURFACES (Stair steps, Tables, Sarcophagus, Dais, Pedestals, Chests)
            let maxSurfaceY = baseElev;

            for (let i = 0; i < colliders.length; i++) {
                const c = colliders[i];
                if (!c.isStandable) continue;

                let isOver = false;
                if (c.type === 'box') {
                    if (px >= c.minX - 0.12 && px <= c.maxX + 0.12 &&
                        pz >= c.minZ - 0.12 && pz <= c.maxZ + 0.12) {
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
                    if (py >= c.minY - 0.25 && c.maxY <= py + 0.55) {
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
            }

            for (let i = 0; i < colliders.length; i++) {
                const c = colliders[i];

                // If player is walking ON TOP of this obstacle: do not block horizontally!
                if (c.isStandable && py >= c.maxY - 0.08) {
                    continue;
                }

                // If this is a standable obstacle within step-up reach (<= py + 0.45m): do not block!
                if (c.isStandable && c.maxY <= py + 0.45 && py >= c.minY - 0.25) {
                    continue;
                }

                // Vertical bounds check for tall walls and non-step barriers:
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
replacements.append(("Elevation & Collision Engine", old_elev_coll_engine, new_elev_coll_engine))

# 4. Dungeon steps with standable box colliders for every step
old_dungeon_steps = """            // Stone Steps descending from Floor 1 to Dungeon (Northwest: X = -16, Z = -22 to -10)
            for(let s = 0; s <= 10; s++) {
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.3), matCastle);
                step.position.set(-16, 5.8 - s * 0.48, -22 + s * 1.2);
                cg.add(step);
            }"""

new_dungeon_steps = """            // Stone Steps descending from Floor 1 to Dungeon (Northwest: X = -16, Z = -22 to -10)
            for(let s = 0; s <= 10; s++) {
                const stepY = 5.8 - s * 0.48;
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.3), matCastle);
                step.position.set(-16, stepY, -22 + s * 1.2);
                cg.add(step);
                // Standable surface on every single stone step:
                addBoxCollider(-110 - 16, 120 - 22 + s * 1.2, 3.8, 1.25, 0.8, stepY + 0.25, true);
            }"""
replacements.append(("Dungeon steps colliders", old_dungeon_steps, new_dungeon_steps))

# 5. Sarcophagus with standable top surface
old_sarco_collider = "addBoxCollider(-110, 120, 4.4, 2.6, 1.0, 3.5); // Sarcophagus collider (Dungeon only!)"
new_sarco_collider = "addBoxCollider(-110, 120, 4.4, 2.6, 1.0, 2.5, true); // Standable Sarcophagus lid top (Y = 2.5m)"
replacements.append(("Sarcophagus standable", old_sarco_collider, new_sarco_collider))

# 6. Treasury chests with standable top
old_treasury_collider = "addBoxCollider(-110 + 15, 120 + 9, 2.5, 8.0, 1.0, 3.5); // Treasury chests collider (Dungeon only!)"
new_treasury_collider = """for(let ch = 0; ch < 3; ch++) {
                addBoxCollider(-110 + 15, 120 + 6 + ch * 3.2, 1.7, 1.3, 1.0, 2.0, true);
            }"""
replacements.append(("Treasury standable", old_treasury_collider, new_treasury_collider))

# 7. Banquet table and chairs with standable top
old_banquet_colliders = """            // Banquet Chairs
            for(let ch = 0; ch < 5; ch++) {
                [-2.2, 2.2].forEach(chSide => {
                    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), matWoodDark);
                    chair.position.set(-12 + chSide, 6.9, -10 + ch * 2.5);
                    cg.add(chair);
                });
            }
            addBoxCollider(-110 - 12, 120 - 5, 3.5, 14.0, 5.8, 8.5); // Banquet table collider (Floor 1 only!)"""

new_banquet_colliders = """            // Banquet Chairs (Standable & Sit-on-able)
            for(let ch = 0; ch < 5; ch++) {
                [-2.2, 2.2].forEach(chSide => {
                    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), matWoodDark);
                    chair.position.set(-12 + chSide, 6.9, -10 + ch * 2.5);
                    cg.add(chair);
                    // Standable seat on every chair:
                    addBoxCollider(-110 - 12 + chSide, 120 - 10 + ch * 2.5, 0.9, 0.9, 5.8, 6.9, true);
                });
            }
            // Standable Banquet Table top at Y = 7.15m:
            addBoxCollider(-110 - 12, 120 - 5, 3.4, 14.2, 5.8, 7.15, true);"""
replacements.append(("Banquet standable", old_banquet_colliders, new_banquet_colliders))

# 8. Armory pedestals standable
old_armory_collider = "addBoxCollider(-110 + 12, 120 - 5, 3.0, 12.0, 5.8, 10.0); // Armory collider (Floor 1 only!)"
new_armory_collider = """for(let a = 0; a < 2; a++) {
                addCylinderCollider(-110 + 12, 120 - 9 + a * 8, 1.3, 5.8, 6.8, true);
            }"""
replacements.append(("Armory standable", old_armory_collider, new_armory_collider))

# 9. Grand Imperial Double Staircase: register every step and landing as standable
old_imperial_stairs = """            // Grand Imperial Double Staircase rising to Floor 2 (Z = 5 to 18)
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

new_imperial_stairs = """            // Grand Imperial Double Staircase rising to Floor 2 (Z = 5 to 18)
            // 1. Central lower landing (Z = 5 to 11, Y = 6.0 to 9.5m)
            for(let s = 0; s < 7; s++) {
                const st = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 1.2), matCastle);
                st.position.set(0, 6.25 + s * 0.5, 5 + s * 1.0);
                cg.add(st);
                // Standable surface on each of the 7 central steps:
                const stepTopY = 6.0 + (s + 1) * 0.5;
                addBoxCollider(-110, 120 + 5 + s * 1.0, 7.2, 1.25, 6.0, stepTopY, true);
            }

            // 2. Intermediate Landing Platform connecting central flight to Left and Right Wings (Y = 9.5m)
            const midLanding = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 3.5), matCastle);
            midLanding.position.set(0, 9.25, 11.5);
            cg.add(midLanding);
            addBoxCollider(-110, 120 + 11.5, 32.0, 3.6, 6.0, 9.5, true);

            // 3. Split into Left Wing (X = -13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stL.position.set(-13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stL);
                const wingStepTopY = 9.5 + (s + 1) * 0.5;
                addBoxCollider(-110 - 13, 120 + 12 + s * 0.95, 4.8, 1.15, 9.0, wingStepTopY, true);
            }

            // 4. Split into Right Wing (X = 13, Z = 11.5 to 18, Y = 9.5 to 13.0m)
            for(let s = 0; s < 7; s++) {
                const stR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), matCastle);
                stR.position.set(13, 9.75 + s * 0.5, 12 + s * 0.95);
                cg.add(stR);
                const wingStepTopY = 9.5 + (s + 1) * 0.5;
                addBoxCollider(-110 + 13, 120 + 12 + s * 0.95, 4.8, 1.15, 9.0, wingStepTopY, true);
            }"""
replacements.append(("Imperial stairs standable steps", old_imperial_stairs, new_imperial_stairs))

# 10. Moon Throne Dais and Seat standable
old_throne_collider = "addBoxCollider(-110, 120 + 18.5, 3.6, 2.8, 13.5, 18.0); // Throne collider (Floor 2 only!)"
new_throne_collider = """// Standable Moon Throne Dais (Y = 14.2m) and Throne Seat (Y = 15.5m)
            addBoxCollider(-110, 120 + 18.0, 10.2, 7.2, 13.0, 14.2, true);
            addBoxCollider(-110, 120 + 18.5, 3.4, 2.4, 14.2, 15.5, true);"""
replacements.append(("Throne standable", old_throne_collider, new_throne_collider))

# 11. Scholar study desk standable
old_scholar_desk = """            // Scholar Study Desk & Floating Grimoire
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);"""

new_scholar_desk = """            // Scholar Study Desk & Floating Grimoire
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);
            addBoxCollider(-110 + 13.5, 120 - 4, 2.5, 1.7, 13.0, 14.1, true); // Standable study desk top"""
replacements.append(("Scholar desk standable", old_scholar_desk, new_scholar_desk))

# 12. Secret Attic Stairs standable steps
old_secret_steps = """            // Secret Attic Staircase behind bookshelf (East Wing: X = 16, Z = 1.5 to 13, Y = 13.0 to 20.0m)
            for(let s = 0; s <= 12; s++) {
                const aStep = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
                aStep.position.set(16, 13.25 + s * 0.58, 1.5 + s * 0.92);
                cg.add(aStep);
            }"""

new_secret_steps = """            // Secret Attic Staircase behind bookshelf (East Wing: X = 16, Z = 1.5 to 13, Y = 13.0 to 20.0m)
            for(let s = 0; s <= 12; s++) {
                const aStep = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
                aStep.position.set(16, 13.25 + s * 0.58, 1.5 + s * 0.92);
                cg.add(aStep);
                // Standable surface on each of the 13 secret attic steps:
                const aStepTopY = 13.0 + (s + 1) * 0.54;
                addBoxCollider(-110 + 16, 120 + 1.5 + s * 0.92, 3.8, 1.05, 12.8, aStepTopY, true);
            }"""
replacements.append(("Secret attic stairs standable", old_secret_steps, new_secret_steps))

# 13. Attic Altar Core Dais and Chest standable
old_attic_colliders = """            addCylinderCollider(-110, 120, 2.8, 19.8, 26.0); // Altar core collider (Attic only!)

            // Secret Moonstone Treasure Chest in Attic Corner (X = -12, Z = 8)
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);

            const aChestGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.5), matCyanGlow);
            aChestGlow.position.set(-12, 21.2, 8);
            cg.add(aChestGlow);

            addBoxCollider(-110 - 12, 120 + 8, 2.2, 2.2, 19.8, 23.0); // Attic chest collider (Attic only!)"""

new_attic_colliders = """            addCylinderCollider(-110, 120, 3.0, 19.8, 20.9, true); // Standable Altar Core dais top (Y = 20.9m)

            // Secret Moonstone Treasure Chest in Attic Corner (X = -12, Z = 8)
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);

            const aChestGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.5), matCyanGlow);
            aChestGlow.position.set(-12, 21.2, 8);
            cg.add(aChestGlow);

            addBoxCollider(-110 - 12, 120 + 8, 2.2, 2.2, 19.8, 21.2, true); // Standable Attic chest top (Y = 21.2m)"""
replacements.append(("Attic colliders standable", old_attic_colliders, new_attic_colliders))

# 14. Attic Spire Balcony floor standable
old_balcony_floor = """            const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 6), matCastle);
            balconyFloor.position.set(0, 19.8, -22);
            cg.add(balconyFloor);"""

new_balcony_floor = """            const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 6), matCastle);
            balconyFloor.position.set(0, 19.8, -22);
            cg.add(balconyFloor);
            addBoxCollider(-110, 120 - 22, 10.2, 6.2, 19.5, 20.2, true); // Standable Balcony floor surface"""
replacements.append(("Balcony floor standable", old_balcony_floor, new_balcony_floor))

# 15. Keydown: add 'c' key for sitting
old_keydown = """            if (k === 'e' && gameState.isPlaying) handleInteraction();
            if (k === 'j' && gameState.isPlaying) triggerAttack();"""

new_keydown = """            if (k === 'e' && gameState.isPlaying) handleInteraction();
            if (k === 'j' && gameState.isPlaying) triggerAttack();
            if (k === 'c' && gameState.isPlaying && !gameState.inDialogue) toggleSitting();"""
replacements.append(("Keydown C key", old_keydown, new_keydown))

# 16. Sitting function definition
old_sitting_def = """        // Prevent browser right-click context menu"""

new_sitting_def = """        // =====================================================================
        // SITTING ACTION (NGỒI NGHỈ NGƠI TRÊN BẬC THANG & CHƯỚNG NGẠI VẬT)
        // =====================================================================
        let isSitting = false;

        function toggleSitting() {
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
                    showNotification("👑 BẠN ĐÃ NGỒI LÊN NGAI VÀNG MẶT TRĂNG! Uy phong trị vì Vương Quốc Tsukiezz!");
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

        // Prevent browser right-click context menu"""
replacements.append(("Sitting function", old_sitting_def, new_sitting_def))

# 17. Animation Loop: sitting animation, auto-standup on movement, snappy elevation snapping
old_loop_movement = """                const isMoving = (inputX !== 0 || inputZ !== 0);
                const currentSpeed = keys.shift ? 7.5 : 4.5; // Proportional and nimble for 5x smaller character

                if (isMoving) {"""

new_loop_movement = """                const isMoving = (inputX !== 0 || inputZ !== 0);
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

                if (isMoving && !isSitting) {"""
replacements.append(("Loop auto standup", old_loop_movement, new_loop_movement))

# 18. Animation Loop: idle vs sitting limbs pose
old_idle_pose = """                } else {
                    // IDLE BREATHING & RESTING POSE (STATIONARY)
                    if (activeLimbs) {
                        const breath = Math.sin(time * 2.8) * 0.025;
                        activeLimbs.leftLeg.rotation.x = THREE.MathUtils.lerp(activeLimbs.leftLeg.rotation.x, 0, 10 * delta);
                        activeLimbs.rightLeg.rotation.x = THREE.MathUtils.lerp(activeLimbs.rightLeg.rotation.x, 0, 10 * delta);
                        activeLimbs.leftLeg.position.y = 0.45;
                        activeLimbs.rightLeg.position.y = 0.45;

                        if (!isAttacking) {
                            activeLimbs.rightArm.rotation.x = THREE.MathUtils.lerp(activeLimbs.rightArm.rotation.x, 0, 10 * delta);
                            activeLimbs.leftArm.rotation.x = THREE.MathUtils.lerp(activeLimbs.leftArm.rotation.x, 0, 10 * delta);
                            activeLimbs.leftArm.rotation.z = -0.15;
                        }

                        activeLimbs.body.position.y = 0.45 + breath;
                        activeLimbs.body.rotation.z = THREE.MathUtils.lerp(activeLimbs.body.rotation.z, 0, 8 * delta);
                        activeLimbs.body.rotation.y = THREE.MathUtils.lerp(activeLimbs.body.rotation.y, 0, 8 * delta);

                        if (activeLimbs.cape) {
                            activeLimbs.cape.rotation.x = 0.32 + Math.sin(time * 1.8) * 0.05;
                        }
                        if (activeLimbs.leftEar && activeLimbs.rightEar) {
                            activeLimbs.leftEar.rotation.z = 0.28 + Math.sin(time * 3.5) * 0.03;
                            activeLimbs.rightEar.rotation.z = -0.28 - Math.sin(time * 3.5) * 0.03;
                        }
                    }
                }"""

new_idle_pose = """                } else {
                    if (activeLimbs) {
                        if (isSitting) {
                            // REAL SITTING POSE ON STEPS / CHAIRS / OBSTACLES
                            const sitBreath = Math.sin(time * 2.2) * 0.015;
                            activeLimbs.leftLeg.rotation.x = -1.35;
                            activeLimbs.rightLeg.rotation.x = -1.35;
                            activeLimbs.leftLeg.position.y = 0.18;
                            activeLimbs.rightLeg.position.y = 0.18;

                            activeLimbs.body.position.y = 0.22 + sitBreath;
                            activeLimbs.body.rotation.z = 0;
                            activeLimbs.body.rotation.y = 0;

                            if (!isAttacking) {
                                activeLimbs.rightArm.rotation.x = -0.45;
                                activeLimbs.leftArm.rotation.x = -0.45;
                                activeLimbs.leftArm.rotation.z = -0.15;
                            }

                            if (activeLimbs.cape) {
                                activeLimbs.cape.rotation.x = 0.78 + sitBreath;
                            }
                            if (activeLimbs.leftEar && activeLimbs.rightEar) {
                                activeLimbs.leftEar.rotation.z = 0.35 + Math.sin(time * 2.2) * 0.03;
                                activeLimbs.rightEar.rotation.z = -0.35 - Math.sin(time * 2.2) * 0.03;
                            }
                        } else {
                            // IDLE BREATHING & RESTING POSE (STATIONARY STANDING)
                            const breath = Math.sin(time * 2.8) * 0.025;
                            activeLimbs.leftLeg.rotation.x = THREE.MathUtils.lerp(activeLimbs.leftLeg.rotation.x, 0, 10 * delta);
                            activeLimbs.rightLeg.rotation.x = THREE.MathUtils.lerp(activeLimbs.rightLeg.rotation.x, 0, 10 * delta);
                            activeLimbs.leftLeg.position.y = 0.45;
                            activeLimbs.rightLeg.position.y = 0.45;

                            if (!isAttacking) {
                                activeLimbs.rightArm.rotation.x = THREE.MathUtils.lerp(activeLimbs.rightArm.rotation.x, 0, 10 * delta);
                                activeLimbs.leftArm.rotation.x = THREE.MathUtils.lerp(activeLimbs.leftArm.rotation.x, 0, 10 * delta);
                                activeLimbs.leftArm.rotation.z = -0.15;
                            }

                            activeLimbs.body.position.y = 0.45 + breath;
                            activeLimbs.body.rotation.z = THREE.MathUtils.lerp(activeLimbs.body.rotation.z, 0, 8 * delta);
                            activeLimbs.body.rotation.y = THREE.MathUtils.lerp(activeLimbs.body.rotation.y, 0, 8 * delta);

                            if (activeLimbs.cape) {
                                activeLimbs.cape.rotation.x = 0.32 + Math.sin(time * 1.8) * 0.05;
                            }
                            if (activeLimbs.leftEar && activeLimbs.rightEar) {
                                activeLimbs.leftEar.rotation.z = 0.28 + Math.sin(time * 3.5) * 0.03;
                                activeLimbs.rightEar.rotation.z = -0.28 - Math.sin(time * 3.5) * 0.03;
                            }
                        }
                    }
                }"""
replacements.append(("Idle vs sitting pose", old_idle_pose, new_idle_pose))

# 19. Elevation snapping with py argument and jump landing immediate snap
old_elev_snap = """                // =========================================================
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
                    }"""

new_elev_snap = """                // =========================================================
                // SMOOTH TERRAIN & RAMP ELEVATION SNAPPING
                // =========================================================
                const targetGroundY = getGroundElevation(playerGroup.position.x, playerGroup.position.z, playerGroup.position.y);
                currentGroundY = THREE.MathUtils.lerp(currentGroundY, targetGroundY, 28 * delta);

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
                        // Immediate solid ground landing on top of obstacles/steps
                        currentGroundY = targetGroundY;
                    }"""
replacements.append(("Elevation snapping & landing", old_elev_snap, new_elev_snap))

# First check that ALL needles exist in content before applying anything
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

# Apply all replacements sequentially
for name, old_str, new_str in replacements:
    old_norm = old_str.replace('\r\n', '\n')
    new_norm = new_str.replace('\r\n', '\n')
    content = content.replace(old_norm, new_norm, 1)
    print(f"Applied: {name}")

# Restore original newline format if needed
if is_crlf:
    content = content.replace('\n', '\r\n')

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESS: All standable surface and sitting upgrades applied to demo/index.html!")
