import os
import sys

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# =============================================================================
# 1. Update Floor 2 Floor Plates: Close the 7.5m Gap to Front Balcony
# =============================================================================
old_f2_plates = """            // LEVEL 2: TẦNG 2 - THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN HOÀNG GIA (Y = 13.0m)
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
            cg.add(f2South);"""

new_f2_plates = """            // LEVEL 2: TẦNG 2 - THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN HOÀNG GIA (Y = 13.0m)
            // =================================================================
            // Sàn Mezzanine 3D đá cẩm thạch dày 0.4m (Bịt kín hoàn toàn khoảng hở, kết nối thẳng ra Ban Công Hoàng Gia)
            // Sàn Bắc (North Mezzanine: Z = 10 to 22)
            const f2North = new THREE.Mesh(new THREE.BoxGeometry(38, 0.4, 12), matMarble);
            f2North.position.set(0, 12.82, 16);
            cg.add(f2North);

            // Sàn Tây (West Mezzanine: X = -19 to -9, Z = -15 to 12)
            const f2West = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 27), matMarble);
            f2West.position.set(-14, 12.82, -1.5);
            cg.add(f2West);

            // Sàn Đông (East Mezzanine: X = 9 to 19, Z = -15 to 12)
            const f2East = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 27), matMarble);
            f2East.position.set(14, 12.82, -1.5);
            cg.add(f2East);

            // Sàn Nam (South Mezzanine: Z = -13.5 đến -26.0 - Nối liền mạch ra cổng vòm Ban Công Hoàng Gia)
            const f2South = new THREE.Mesh(new THREE.BoxGeometry(38, 0.4, 12.5), matMarble);
            f2South.position.set(0, 12.82, -19.75);
            cg.add(f2South);
            addBoxCollider(-110, 120 - 19.75, 38.0, 12.6, 12.5, 13.0, true);

            // Vòm Cửa Hoàng Gia Lối Ra Ban Công Tầng 2 (Portal Frame at Z = -26)
            const fl2DoorFrame = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.35, 12, 16, Math.PI), matGoldTrim);
            fl2DoorFrame.position.set(0, 16.5, -26.0);
            cg.add(fl2DoorFrame);

            // 2 Ngọn đuốc dạ quang ngọc bích 2 bên cửa ban công Tầng 2
            [-4.2, 4.2].forEach(dx => {
                const bTorch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.2, 8), matGoldTrim);
                bTorch.position.set(dx, 15.0, -25.8);
                cg.add(bTorch);

                const bFlame = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), matCyanGlow);
                bFlame.position.set(dx, 15.8, -25.8);
                cg.add(bFlame);
            });"""

assert old_f2_plates in content, "old_f2_plates not found"
content = content.replace(old_f2_plates, new_f2_plates, 1)

# =============================================================================
# 2. Update Floor 1 Plates: Extend Vestibule to Gate Z = -26
# =============================================================================
old_f1_plates = """            // LEVEL 1: TẦNG 1 - ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ (Y = 6.0m)
            // =================================================================
            // Sàn đá cẩm thạch Tầng 1 (Chừa giếng cầu thang xuống hầm tại X=[-19, -14], Z=[-22, -10])
            const hallFloorMain = new THREE.Mesh(new THREE.PlaneGeometry(33, 42), matMarble);
            hallFloorMain.rotation.x = -Math.PI / 2;
            hallFloorMain.position.set(2.5, 6.02, 0);
            cg.add(hallFloorMain);

            const hallFloorSW = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), matMarble);
            hallFloorSW.rotation.x = -Math.PI / 2;
            hallFloorSW.position.set(-16.5, 6.02, 6.0);
            cg.add(hallFloorSW);"""

new_f1_plates = """            // LEVEL 1: TẦNG 1 - ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ (Y = 6.0m)
            // =================================================================
            // Sàn đá cẩm thạch 3D dày 0.4m của Tầng 1 (Kéo dài trọn vẹn từ Cổng Z=-26 đến vách Bắc Z=23)
            const hallFloorMain = new THREE.Mesh(new THREE.BoxGeometry(33, 0.4, 49), matMarble);
            hallFloorMain.position.set(2.5, 5.82, -1.5);
            cg.add(hallFloorMain);

            const hallFloorSW = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 33), matMarble);
            hallFloorSW.position.set(-16.5, 5.82, 6.5);
            cg.add(hallFloorSW);

            const hallFloorVestL = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 4), matMarble);
            hallFloorVestL.position.set(-16.5, 5.82, -24.0);
            cg.add(hallFloorVestL);

            // Đôi Cánh Cửa Hoàng Gia Mở Rộng Ở Cổng Chính Tầng 1 (Double Palace Gate Doors)
            const gateDoorL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.5, 2.8), matWoodDark);
            gateDoorL.position.set(-4.2, 8.8, -25.2);
            gateDoorL.rotation.y = 0.65;
            cg.add(gateDoorL);

            const gateDoorR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.5, 2.8), matWoodDark);
            gateDoorR.position.set(4.2, 8.8, -25.2);
            gateDoorR.rotation.y = -0.65;
            cg.add(gateDoorR);"""

assert old_f1_plates in content, "old_f1_plates not found"
content = content.replace(old_f1_plates, new_f1_plates, 1)

# =============================================================================
# 3. Update Attic Floor: Cut Open Stairwell for Headroom at X=[14, 18], Z=[3, 14]
# =============================================================================
old_attic_box = """            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & VỌNG CẢNH ASTRAL (Y = 20.0m)
            // =================================================================
            // Sàn gỗ sồi 3D dày (Phía trên là sàn Gác Mái Y=20.0m, phía dưới là trần Tầng 2 Y=19.6m - Không bị xuyên thấu)
            const atticFloor = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 40), matTimber);
            atticFloor.position.set(0, 19.8, 0);
            cg.add(atticFloor);"""

new_attic_box = """            // LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & VỌNG CẢNH ASTRAL (Y = 20.0m)
            // =================================================================
            // Sàn gỗ sồi 3D dày (Chừa giếng cầu thang bí mật tại X=[14, 18], Z=[3, 13.5] để leo lên gác mái không bị va đầu)
            const atticFloorMain = new THREE.Mesh(new THREE.BoxGeometry(32, 0.4, 43), matTimber);
            atticFloorMain.position.set(-2.0, 19.8, 1.0);
            cg.add(atticFloorMain);

            const atticFloorES = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 23.5), matTimber);
            atticFloorES.position.set(16.0, 19.8, -8.75);
            cg.add(atticFloorES);

            const atticFloorEN = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 9.0), matTimber);
            atticFloorEN.position.set(16.0, 19.8, 18.0);
            cg.add(atticFloorEN);

            // Lan can bảo vệ bằng vàng mạ quanh giếng cầu thang Gác Mái
            const atticStairRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 10.5), matGoldTrim);
            atticStairRail.position.set(14.0, 20.6, 8.25);
            cg.add(atticStairRail);
            addBoxCollider(-110 + 14.0, 120 + 8.25, 0.5, 10.8, 19.8, 21.8);"""

assert old_attic_box in content, "old_attic_box not found"
content = content.replace(old_attic_box, new_attic_box, 1)

# =============================================================================
# 4. Add South & North Gable Roofs to Complete 4-Way Gothic Roof Complex
# =============================================================================
old_roof_wing = """            // 3. Mái dốc Cánh Đông (East Wing Pitched Gable Roof at Y=26.5m)
            const eastWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            eastWingRoof.position.set(11, 26.5, 0);
            eastWingRoof.rotation.y = Math.PI / 4;
            cg.add(eastWingRoof);"""

new_roof_wing = """            // 3. Mái dốc Cánh Đông (East Wing Pitched Gable Roof at Y=26.5m)
            const eastWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            eastWingRoof.position.set(11, 26.5, 0);
            eastWingRoof.rotation.y = Math.PI / 4;
            cg.add(eastWingRoof);

            // 4. Mái dốc Cánh Nam (South Wing Pitched Gable Roof at Y=26.5m)
            const southWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            southWingRoof.position.set(0, 26.5, -11);
            southWingRoof.rotation.y = Math.PI / 4;
            cg.add(southWingRoof);

            // 5. Mái dốc Cánh Bắc (North Wing Pitched Gable Roof at Y=26.5m)
            const northWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            northWingRoof.position.set(0, 26.5, 11);
            northWingRoof.rotation.y = Math.PI / 4;
            cg.add(northWingRoof);"""

assert old_roof_wing in content, "old_roof_wing not found"
content = content.replace(old_roof_wing, new_roof_wing, 1)

# =============================================================================
# 5. Update Step-Up Reach in Collision & Elevation Physics (Smooth Stairs)
# =============================================================================
old_step_reach = """                    if (py >= c.minY - 0.25 && c.maxY <= py + 0.55) {"""
new_step_reach = """                    if (py >= c.minY - 0.25 && c.maxY <= py + 0.65) {"""
assert old_step_reach in content, "old_step_reach not found"
content = content.replace(old_step_reach, new_step_reach, 1)

old_check_step = """                // If this is a standable obstacle within step-up reach (<= py + 0.45m): do not block!
                if (c.isStandable && c.maxY <= py + 0.45 && py >= c.minY - 0.25) {
                    continue;
                }"""
new_check_step = """                // If this is a standable obstacle within step-up reach (<= py + 0.65m): do not block!
                if (c.isStandable && c.maxY <= py + 0.65 && py >= c.minY - 0.25) {
                    continue;
                }"""
assert old_check_step in content, "old_check_step not found"
content = content.replace(old_check_step, new_check_step, 1)

# =============================================================================
# 6. Pointer Lock API & Right-Click Omnidirectional Character Control
# =============================================================================
old_mouse_handlers = """        // Prevent browser right-click context menu
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                isRightMouseDown = true;
                mouseLastX = e.clientX;
                mouseLastY = e.clientY;
            } else if (e.button === 0 && gameState.isPlaying && !gameState.inDialogue) {
                triggerAttack();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                isRightMouseDown = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isRightMouseDown && gameState.isPlaying) {
                const deltaX = e.clientX - mouseLastX;
                const deltaY = e.clientY - mouseLastY;
                mouseLastX = e.clientX;
                mouseLastY = e.clientY;

                // Orbit camera horizontally and vertically
                camYaw -= deltaX * 0.007;
                camPitch = Math.max(-0.15, Math.min(1.15, camPitch + deltaY * 0.005));

                // When holding right-click without walking, rotate character to face the view
                if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
                    playerGroup.rotation.y = camYaw;
                }
            }
        });"""

new_mouse_handlers = """        // POINTER LOCK API & OMNIDIRECTIONAL RIGHT-CLICK CHARACTER CONTROL
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
            if (e.button === 2 && gameState.isPlaying && !gameState.inDialogue) {
                isRightMouseDown = true;
                mouseLastX = e.clientX;
                mouseLastY = e.clientY;

                // Lock and hide cursor when clicking right mouse button
                if (!isPointerLocked && document.body.requestPointerLock) {
                    document.body.requestPointerLock().catch(() => {});
                }
            } else if (e.button === 0 && gameState.isPlaying && !gameState.inDialogue) {
                triggerAttack();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                isRightMouseDown = false;
                // Exit pointer lock when right mouse button is released
                if (isPointerLocked && document.exitPointerLock) {
                    document.exitPointerLock();
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            if ((isRightMouseDown || isPointerLocked) && gameState.isPlaying) {
                // High-precision pointer movement when locked or mouse dragging
                const deltaX = (typeof e.movementX !== 'undefined' && e.movementX !== 0) ? e.movementX : (e.clientX - mouseLastX);
                const deltaY = (typeof e.movementY !== 'undefined' && e.movementY !== 0) ? e.movementY : (e.clientY - mouseLastY);
                mouseLastX = e.clientX;
                mouseLastY = e.clientY;

                const sensX = isPointerLocked ? 0.0035 : 0.006;
                const sensY = isPointerLocked ? 0.0030 : 0.005;

                // Orbit camera horizontally and vertically
                camYaw -= deltaX * sensX;
                camPitch = Math.max(-0.25, Math.min(1.20, camPitch + deltaY * sensY));

                // Always rotate character to face the camera direction when right-clicking or locked
                if (playerGroup) {
                    playerGroup.rotation.y = camYaw;
                }
            }
        });"""

assert old_mouse_handlers in content, "old_mouse_handlers not found"
content = content.replace(old_mouse_handlers, new_mouse_handlers, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully applied Pointer Lock, Floor 2 gap fix, Attic stairwell opening, 4-way roof, and step reach!")
