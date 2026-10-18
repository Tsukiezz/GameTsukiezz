import os
import sys

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# =============================================================================
# 1. Update Base Mesa Platform in buildCastle3D() to be HOLLOW
# =============================================================================
old_base_mesa = """            // Base Mesa Platform (Foundation Y = 0 to 6m)
            const base = new THREE.Mesh(new THREE.BoxGeometry(52, 6, 56), matDarkBase);
            base.position.y = 3;
            base.receiveShadow = true;
            cg.add(base);"""

new_base_mesa = """            // Base Mesa Platform Foundation (Hollow Interior: Underground Bunker & Dungeon at Y=1.0m to 5.8m)
            // 1. Bedrock Foundation Slab under basement floor (Y = 0 to 1.0m)
            const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(52, 1.0, 56), matDarkBase);
            baseFloor.position.y = 0.5;
            baseFloor.receiveShadow = true;
            cg.add(baseFloor);

            // 2. Thick Exterior Foundation Mesa Cliff Walls (Y = 1.0 to 6.0m, Height = 5.0m, Center Y = 3.5m)
            // Left Foundation Wall (West: X = -22.5, Width = 7m)
            const baseWallW = new THREE.Mesh(new THREE.BoxGeometry(7.0, 5.0, 56), matDarkBase);
            baseWallW.position.set(-22.5, 3.5, 0);
            cg.add(baseWallW);

            // Right Foundation Wall (East: X = 22.5, Width = 7m)
            const baseWallE = new THREE.Mesh(new THREE.BoxGeometry(7.0, 5.0, 56), matDarkBase);
            baseWallE.position.set(22.5, 3.5, 0);
            cg.add(baseWallE);

            // Back Foundation Wall (North: Z = 24.5, Depth = 7m)
            const baseWallN = new THREE.Mesh(new THREE.BoxGeometry(38.0, 5.0, 7.0), matDarkBase);
            baseWallN.position.set(0, 3.5, 24.5);
            cg.add(baseWallN);

            // Front Foundation Walls left & right of Grand Bridge Ramp (South: Z = -24.5)
            const baseWallSL = new THREE.Mesh(new THREE.BoxGeometry(16.0, 5.0, 7.0), matDarkBase);
            baseWallSL.position.set(-13.0, 3.5, -24.5);
            cg.add(baseWallSL);

            const baseWallSR = new THREE.Mesh(new THREE.BoxGeometry(16.0, 5.0, 7.0), matDarkBase);
            baseWallSR.position.set(13.0, 3.5, -24.5);
            cg.add(baseWallSR);

            // Center Foundation Ramp Support under Grand Bridge Ramp (X = [-5, 5])
            const baseWallSC = new THREE.Mesh(new THREE.BoxGeometry(10.0, 5.0, 7.0), matDarkBase);
            baseWallSC.position.set(0, 3.5, -24.5);
            cg.add(baseWallSC);"""

assert old_base_mesa in content, "old_base_mesa not found in demo/index.html"
content = content.replace(old_base_mesa, new_base_mesa, 1)

# =============================================================================
# 2. Update Dungeon Ceiling & Floor 1 Slab to create a real open stairwell
# =============================================================================
old_ceil_and_floor = """            // Sàn đá phiến dày chịu lực
            const dungeonFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.95 }));
            dungeonFloor.rotation.x = -Math.PI / 2;
            dungeonFloor.position.set(0, 1.02, 0);
            cg.add(dungeonFloor);

            // Trần đá vòm kiên cố ngăn cách với Tầng 1
            const dungeonCeil = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matDarkBase);
            dungeonCeil.rotation.x = Math.PI / 2;
            dungeonCeil.position.set(0, 5.8, 0);
            cg.add(dungeonCeil);"""

new_ceil_and_floor = """            // Sàn đá phiến dày chịu lực của Tầng Hầm (Y = 1.02m)
            const dungeonFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.95 }));
            dungeonFloor.rotation.x = -Math.PI / 2;
            dungeonFloor.position.set(0, 1.02, 0);
            cg.add(dungeonFloor);

            // Trần đá vòm kiên cố ngăn cách với Tầng 1 (Chừa khoảng mở cầu thang Tây Bắc tại X=[-19, -14], Z=[-22, -10])
            const dungeonCeilMain = new THREE.Mesh(new THREE.PlaneGeometry(33, 42), matDarkBase);
            dungeonCeilMain.rotation.x = Math.PI / 2;
            dungeonCeilMain.position.set(2.5, 5.8, 0);
            cg.add(dungeonCeilMain);

            const dungeonCeilSW = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), matDarkBase);
            dungeonCeilSW.rotation.x = Math.PI / 2;
            dungeonCeilSW.position.set(-16.5, 5.8, 6.0);
            cg.add(dungeonCeilSW);"""

assert old_ceil_and_floor in content, "old_ceil_and_floor not found"
content = content.replace(old_ceil_and_floor, new_ceil_and_floor, 1)

# Also update Floor 1 floor slab:
old_hall_floor = """            // LEVEL 1: TẦNG 1 - ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ (Y = 6.0m)
            // =================================================================
            const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), matMarble);
            hallFloor.rotation.x = -Math.PI / 2;
            hallFloor.position.set(0, 6.02, 0);
            cg.add(hallFloor);"""

new_hall_floor = """            // LEVEL 1: TẦNG 1 - ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ (Y = 6.0m)
            // =================================================================
            // Sàn đá cẩm thạch Tầng 1 (Chừa giếng cầu thang xuống hầm tại X=[-19, -14], Z=[-22, -10])
            const hallFloorMain = new THREE.Mesh(new THREE.PlaneGeometry(33, 42), matMarble);
            hallFloorMain.rotation.x = -Math.PI / 2;
            hallFloorMain.position.set(2.5, 6.02, 0);
            cg.add(hallFloorMain);

            const hallFloorSW = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), matMarble);
            hallFloorSW.rotation.x = -Math.PI / 2;
            hallFloorSW.position.set(-16.5, 6.02, 6.0);
            cg.add(hallFloorSW);

            // Lan can bảo vệ bằng vàng mạ quanh miệng giếng cầu thang Tầng Hầm (X = -14, Z = -21 to -10)
            const stairWellRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 11), matGoldTrim);
            stairWellRail.position.set(-14.0, 6.6, -15.5);
            cg.add(stairWellRail);
            addBoxCollider(-110 - 14.0, 120 - 15.5, 0.5, 11.2, 5.8, 7.8);"""

assert old_hall_floor in content, "old_hall_floor not found"
content = content.replace(old_hall_floor, new_hall_floor, 1)

# =============================================================================
# 3. Add Extra Secret Shelter Features (Blast Vault Door, Fur Hearth Rug, Weapons)
# =============================================================================
old_shelter_end = """            // 5. Cụm Thùng Gỗ Lương Thảo & Rượu Tiếp Tế Sinh Tồn"""

new_shelter_additions = """            // Thảm Lông Sưởi Ấm Trước Lò Sưởi Hoàng Gia (Sittable Warmth Rug)
            const hearthRug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), matVelvetPurple);
            hearthRug.rotation.x = -Math.PI / 2;
            hearthRug.position.set(-15.0, 1.04, -6);
            cg.add(hearthRug);

            // Cửa Thép Trọng Lực Kiên Cố Của Hầm Trú Ẩn (Heavy Armored Blast Vault Door)
            // Cánh cửa vòm thép tròn có vô-lăng khóa bánh răng vàng
            const vaultFrame = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 12, 24), matIronBars);
            vaultFrame.position.set(-2.0, 2.8, -1.8);
            cg.add(vaultFrame);

            const vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 16), matGoldTrim);
            vaultWheel.position.set(-2.0, 2.8, -1.8);
            cg.add(vaultWheel);

            // Giá Treo Kiếm & Khiên Phòng Thủ Sinh Tồn Trong Hầm
            const shelterShield = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16), matGoldTrim);
            shelterShield.rotation.x = Math.PI / 2;
            shelterShield.position.set(-18.5, 3.2, 2.5);
            cg.add(shelterShield);

            const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.06), matCyanGlow);
            swordBlade.position.set(-18.4, 3.2, 2.5);
            swordBlade.rotation.z = 0.45;
            cg.add(swordBlade);

            // 5. Cụm Thùng Gỗ Lương Thảo & Rượu Tiếp Tế Sinh Tồn"""

assert old_shelter_end in content, "old_shelter_end not found"
content = content.replace(old_shelter_end, new_shelter_additions, 1)

# =============================================================================
# 4. Update getGroundElevation for Stair Openings (Walkable Stairs Between Floors)
# =============================================================================
old_elevation_code = """            // Castle Multi-Story complex floor plates (Basement Y=1.0m, Fl.1 Y=6.0m, Fl.2 Y=13.0m, Attic Y=20.0m)
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

new_elevation_code = """            // Castle Multi-Story complex floor plates (Basement Y=1.0m, Fl.1 Y=6.0m, Fl.2 Y=13.0m, Attic Y=20.0m)
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.0 && pz <= 146.0) {
                // Front entrance vestibule connected directly to Grand Bridge Ramp: always Floor 1
                if (px >= -116.0 && px <= -104.0 && pz <= 104.0) {
                    baseElev = 6.0; // TẦNG 1 (ĐẠI ĐIỆN)
                }
                // Stair opening between Floor 1 and Basement (Northwest corner: X in [-128.5, -123.5], Z in [97.0, 111.0])
                else if (px >= -128.5 && px <= -123.5 && pz >= 97.0 && pz <= 111.0 && py < 7.0) {
                    baseElev = 1.0; // Drops to Basement so stairs are fully walkable up and down!
                }
                // Stair descent from Floor 2 wings down to Floor 1 (Left wing: X in [-125.5, -120.5], Right wing: X in [-99.5, -94.5], Z in [131.5, 138.5])
                else if (((px >= -125.5 && px <= -120.5) || (px >= -99.5 && px <= -94.5)) && pz >= 131.5 && pz <= 138.5 && py < 13.8) {
                    baseElev = 6.0; // Drops to Floor 1 so double grand stairs are walkable up and down!
                }
                // Stair opening between Attic and Floor 2 (East wing: X in [-96.5, -91.5], Z in [121.0, 134.0])
                else if (px >= -96.5 && px <= -91.5 && pz >= 121.0 && pz <= 134.0 && py >= 12.5) {
                    baseElev = 13.0; // Drops to Floor 2 so attic stairs are walkable up and down!
                }
                else if (py < 4.2) {
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

assert old_elevation_code in content, "old_elevation_code not found"
content = content.replace(old_elevation_code, new_elevation_code, 1)

# =============================================================================
# 5. Update Third-Person Orbit Camera for Indoor Rooms (Intelligent Clamping)
# =============================================================================
old_camera_code = """                // Third-person Orbit Camera with 360-degree right-click rotation (Framed for 5x smaller character)
                const targetCamX = playerGroup.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDistance;
                const targetCamY = playerGroup.position.y + 0.45 + Math.sin(camPitch) * camDistance;
                const targetCamZ = playerGroup.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDistance;

                camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
                camera.lookAt(playerGroup.position.x, playerGroup.position.y + 0.35, playerGroup.position.z);"""

new_camera_code = """                // Third-person Orbit Camera with Intelligent Interior Clamping (Prevents wall/ceiling clipping)
                const inCastle = (playerGroup.position.x >= -133.0 && playerGroup.position.x <= -87.0 &&
                                  playerGroup.position.z >= 95.0 && playerGroup.position.z <= 145.0);

                let effectiveDist = camDistance;
                let effectivePitch = camPitch;
                if (inCastle) {
                    effectiveDist = Math.min(camDistance, 2.2);
                    effectivePitch = Math.max(0.12, Math.min(camPitch, 0.38));
                }

                let targetCamX = playerGroup.position.x + Math.sin(camYaw) * Math.cos(effectivePitch) * effectiveDist;
                let targetCamY = playerGroup.position.y + 0.42 + Math.sin(effectivePitch) * effectiveDist;
                let targetCamZ = playerGroup.position.z + Math.cos(camYaw) * Math.cos(effectivePitch) * effectiveDist;

                if (inCastle) {
                    // Confine camera within interior walls (Outer walls at X=[-131, -89], Z=[94, 143])
                    targetCamX = Math.max(-130.0, Math.min(-90.0, targetCamX));
                    targetCamZ = Math.max(95.5, Math.min(142.0, targetCamZ));

                    // Confine camera under each floor's ceiling:
                    if (playerGroup.position.y < 5.0) {
                        targetCamY = Math.max(1.3, Math.min(5.3, targetCamY)); // Basement ceiling is at 5.8m
                    } else if (playerGroup.position.y < 12.0) {
                        targetCamY = Math.max(6.3, Math.min(12.2, targetCamY)); // Floor 1 ceiling is at 12.8m
                    } else if (playerGroup.position.y < 19.0) {
                        targetCamY = Math.max(13.3, Math.min(19.2, targetCamY)); // Floor 2 ceiling is at 19.8m
                    } else {
                        targetCamY = Math.max(20.3, Math.min(27.0, targetCamY)); // Attic roof
                    }
                }

                camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.18);
                camera.lookAt(playerGroup.position.x, playerGroup.position.y + 0.35, playerGroup.position.z);"""

assert old_camera_code in content, "old_camera_code not found"
content = content.replace(old_camera_code, new_camera_code, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully applied hollow mesa, open stairwells, shelter additions, and interior camera clamping!")
