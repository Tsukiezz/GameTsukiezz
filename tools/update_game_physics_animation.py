import re
import sys

def main():
    path = r'demo/index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Tour Buttons in HUD
    old_tour_bar = '''            <!-- FAST TRAVEL TOUR BAR -->
            <div class="hud-tour-bar">
                <div class="hud-tour-title">🚀 Tham Quan:</div>
                <button class="tour-btn" onclick="fastTravelTo(0, 0, 'Đền Thần Điện Trung Tâm')">🏛️ Đền Trung Tâm</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 120, 'Lâu Đài Hoàng Gia Tsukiezz')">🏰 Lâu Đài</button>
                <button class="tour-btn" onclick="fastTravelTo(115, 110, 'Đấu Trường La Mã Bị Bỏ Hoang')">⚔️ Đấu Trường</button>
                <button class="tour-btn" onclick="fastTravelTo(-145, -35, 'Trạm Vũ Trụ Công Nghệ Tối Tân')">🛸 Trạm Vũ Trụ</button>
                <button class="tour-btn" onclick="fastTravelTo(-85, -95, 'Trụ Tế Đàn 2 Tầng Huyết Sắc')">🩸 Tế Đàn 2 Tầng</button>
                <button class="tour-btn" onclick="fastTravelTo(-35, -135, 'Hồ Nước Thủy Ngân Gương Bạc')">🌊 Hồ Thủy Ngân</button>
                <button class="tour-btn" onclick="fastTravelTo(145, 30, 'Đại Cổ Thụ Nguyệt Tộc 45m')">🌳 Cổ Thụ 45m</button>
                <button class="tour-btn" onclick="fastTravelTo(125, -110, 'Hang Động Nguyệt Tinh')">💎 Hang Động</button>
                <button class="tour-btn" onclick="fastTravelTo(-120, -125, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>'''

    new_tour_bar = '''            <!-- FAST TRAVEL TOUR BAR -->
            <div class="hud-tour-bar">
                <div class="hud-tour-title">🚀 Tham Quan:</div>
                <button class="tour-btn" onclick="fastTravelTo(0, 5, 'Đền Thần Điện Trung Tâm')">🏛️ Đền Trung Tâm</button>
                <button class="tour-btn" onclick="fastTravelTo(-110, 126, 'Lâu Đài Hoàng Gia Tsukiezz')">🏰 Lâu Đài</button>
                <button class="tour-btn" onclick="fastTravelTo(115, 105, 'Đấu Trường La Mã Bị Bỏ Hoang')">⚔️ Đấu Trường</button>
                <button class="tour-btn" onclick="fastTravelTo(-147, -28, 'Trạm Vũ Trụ Công Nghệ Tối Tân')">🛸 Trạm Vũ Trụ</button>
                <button class="tour-btn" onclick="fastTravelTo(-85, -100, 'Trụ Tế Đàn 2 Tầng Huyết Sắc')">🩸 Tế Đàn 2 Tầng</button>
                <button class="tour-btn" onclick="fastTravelTo(-35, -145, 'Hồ Nước Thủy Ngân Gương Bạc')">🌊 Hồ Thủy Ngân</button>
                <button class="tour-btn" onclick="fastTravelTo(145, 20, 'Đại Cổ Thụ Nguyệt Tộc 45m')">🌳 Cổ Thụ 45m</button>
                <button class="tour-btn" onclick="fastTravelTo(133, -116, 'Hang Động Nguyệt Tinh')">💎 Hang Động</button>
                <button class="tour-btn" onclick="fastTravelTo(-120, -118, 'Đài Thiên Văn Tổ Tiên')">🔭 Đài Thiên Văn</button>
            </div>'''

    if old_tour_bar in content:
        content = content.replace(old_tour_bar, new_tour_bar)
        print("Updated tour bar buttons.")
    else:
        print("Warning: old_tour_bar not found exactly.")

    # 2. Replace Characters, Colliders, Landmarks, and Physics engine from "// CHARACTER BUILDERS" to end of script
    character_start_mark = "// =====================================================================\n        // CHARACTER BUILDERS (HAMSTER WARRIOR & RABBIT MAGE)\n        // ====================================================================="
    
    # We will locate character_start_mark and replace everything up to the end of the script before </script>
    script_end_mark = "    </script>"

    if character_start_mark not in content or script_end_mark not in content:
        print("Error: Could not find marks in file.")
        return

    before_chars = content[:content.find(character_start_mark)]
    
    new_script_code = '''// =====================================================================
        // CHARACTER BUILDERS (HAMSTER WARRIOR & RABBIT MAGE) WITH FULL LIMB RIGGING
        // =====================================================================
        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, 0, 10);
        scene.add(playerGroup);

        let activeHeroType = 'hamster'; // 'hamster' | 'rabbit'
        let hamsterVisualGroup = null;
        let rabbitVisualGroup = null;
        let activeWeaponArm = null;
        let activeLimbs = null;

        // Shared Materials
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 });
        const matSteel = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.9, roughness: 0.25 });
        const matCapeRed = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.65, side: THREE.DoubleSide });
        const matRobePurple = new THREE.MeshStandardMaterial({ color: 0x2d0b59, roughness: 0.6, side: THREE.DoubleSide });
        const matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.5, roughness: 0.2 });
        const matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.5, roughness: 0.2 });

        // BUILD HAMSTER WITH ARTICULATED LEGS, ARMS, BODY AND SHADOW
        function buildHamsterModel() {
            const g = new THREE.Group();
            const limbs = {};

            const matFur = new THREE.MeshStandardMaterial({ color: 0xf77f00, roughness: 0.85 });
            const matBelly = new THREE.MeshStandardMaterial({ color: 0xfffdf0, roughness: 0.85 });
            const matBlush = new THREE.MeshStandardMaterial({ color: 0xff758f, roughness: 0.7 });
            const matEyes = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });

            // Ground Shadow Decal (Anchors character firmly to ground, removes floating appearance)
            const shadowGeo = new THREE.RingGeometry(0, 0.78, 24);
            const shadowMat = new THREE.MeshBasicMaterial({ color: 0x010308, transparent: true, opacity: 0.6, depthWrite: false });
            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.y = 0.02;
            g.add(shadow);
            limbs.shadow = shadow;

            // Body Root Pivot (for bobbing, waddling, breathing)
            const bodyRoot = new THREE.Group();
            bodyRoot.position.y = 0.45;
            g.add(bodyRoot);
            limbs.body = bodyRoot;

            // Torso
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 18), matFur);
            body.scale.set(1.05, 0.95, 1.15);
            body.position.y = 0.35;
            body.castShadow = true;
            bodyRoot.add(body);

            const belly = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), matBelly);
            belly.scale.set(0.85, 0.5, 0.95);
            belly.position.set(0, 0.3, 0.35);
            bodyRoot.add(belly);

            // Head & Cheeks
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), matFur);
            head.position.set(0, 1.1, 0.1);
            bodyRoot.add(head);

            [-0.36, 0.36].forEach(x => {
                const chk = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), matBlush);
                chk.position.set(x, 1.0, 0.42);
                bodyRoot.add(chk);

                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), matEyes);
                eye.position.set(x * 0.8, 1.23, 0.55);
                bodyRoot.add(eye);
            });

            // Cute Snout
            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), matBlush);
            nose.position.set(0, 1.11, 0.65);
            bodyRoot.add(nose);

            // Hamster Ears with Bouncing Pivots
            const earPivotL = new THREE.Group();
            earPivotL.position.set(-0.42, 1.5, -0.05);
            const earOuterL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), matFur);
            earOuterL.scale.set(0.9, 1.1, 0.4);
            earPivotL.add(earOuterL);
            const earInnerL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), matBlush);
            earInnerL.scale.set(0.8, 1.0, 0.3);
            earInnerL.position.set(0, 0, 0.05);
            earPivotL.add(earInnerL);
            earPivotL.rotation.z = 0.28;
            bodyRoot.add(earPivotL);
            limbs.leftEar = earPivotL;

            const earPivotR = new THREE.Group();
            earPivotR.position.set(0.42, 1.5, -0.05);
            const earOuterR = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), matFur);
            earOuterR.scale.set(0.9, 1.1, 0.4);
            earPivotR.add(earOuterR);
            const earInnerR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), matBlush);
            earInnerR.scale.set(0.8, 1.0, 0.3);
            earInnerR.position.set(0, 0, 0.05);
            earPivotR.add(earInnerR);
            earPivotR.rotation.z = -0.28;
            bodyRoot.add(earPivotR);
            limbs.rightEar = earPivotR;

            // Helmet & Spike
            const helmRim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.18, 20), matSteel);
            helmRim.position.set(0, 1.5, 0.1);
            bodyRoot.add(helmRim);

            const helmDome = new THREE.Mesh(new THREE.SphereGeometry(0.56, 20, 14), matSteel);
            helmDome.scale.set(1.0, 0.95, 0.68);
            helmDome.position.set(0, 1.57, 0.1);
            bodyRoot.add(helmDome);

            const noseGuard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.1), matSteel);
            noseGuard.position.set(0, 1.37, 0.64);
            bodyRoot.add(noseGuard);

            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 12), matSteel);
            spike.position.set(0, 1.95, 0.1);
            bodyRoot.add(spike);

            // Scale Armor Chestplate & Leather Belt
            const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.48, 20), matSteel);
            chest.position.set(0, 0.4, 0.05);
            bodyRoot.add(chest);

            const belt = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.035, 12, 24), new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.8 }));
            belt.rotation.x = Math.PI / 2;
            belt.position.set(0, 0.27, 0.05);
            bodyRoot.add(belt);

            // Flowing Red Cape
            const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.25), matCapeRed);
            cape.position.set(0, 0.6, -0.65);
            cape.rotation.x = 0.32;
            bodyRoot.add(cape);
            limbs.cape = cape;

            // Left Arm Pivot (Round Buckler Shield)
            const leftArmPivot = new THREE.Group();
            leftArmPivot.position.set(-0.76, 0.5, 0.15);
            const shMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x7c4722, roughness: 0.8 }));
            shMesh.rotation.z = Math.PI / 2;
            shMesh.position.set(-0.15, 0, 0.25);
            leftArmPivot.add(shMesh);
            const shRim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 12, 24), matSteel);
            shRim.rotation.y = Math.PI / 2;
            shRim.position.set(-0.15, 0, 0.25);
            leftArmPivot.add(shRim);
            const shBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), matSteel);
            shBoss.scale.set(0.5, 1.0, 1.0);
            shBoss.position.set(-0.19, 0, 0.25);
            leftArmPivot.add(shBoss);
            bodyRoot.add(leftArmPivot);
            limbs.leftArm = leftArmPivot;

            // Right Arm Pivot (Glowing Cyan Blade)
            const rightArmPivot = new THREE.Group();
            rightArmPivot.position.set(0.76, 0.5, 0.15);
            const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.95), matSteel);
            swordBlade.position.set(0.15, 0, 0.65);
            rightArmPivot.add(swordBlade);
            const swordGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85), matCyanGlow);
            swordGlow.rotation.x = Math.PI / 2;
            swordGlow.position.set(0.15, 0, 0.65);
            rightArmPivot.add(swordGlow);
            bodyRoot.add(rightArmPivot);
            limbs.rightArm = rightArmPivot;

            // Independent Articulated Walking Legs
            // Left Leg (Hip socket at y=0.45, extends to y=0 on ground)
            const leftLeg = new THREE.Group();
            leftLeg.position.set(-0.32, 0.45, 0.05);
            const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.35, 12), matFur);
            legMeshL.position.y = -0.15;
            leftLeg.add(legMeshL);
            const footL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), matBlush);
            footL.scale.set(0.9, 0.5, 1.4);
            footL.position.set(0, -0.35, 0.1);
            leftLeg.add(footL);
            g.add(leftLeg);
            limbs.leftLeg = leftLeg;

            // Right Leg
            const rightLeg = new THREE.Group();
            rightLeg.position.set(0.32, 0.45, 0.05);
            const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.35, 12), matFur);
            legMeshR.position.y = -0.15;
            rightLeg.add(legMeshR);
            const footR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), matBlush);
            footR.scale.set(0.9, 0.5, 1.4);
            footR.position.set(0, -0.35, 0.1);
            rightLeg.add(footR);
            g.add(rightLeg);
            limbs.rightLeg = rightLeg;

            g.limbs = limbs;
            g.swordArm = rightArmPivot;
            return g;
        }

        // BUILD RABBIT MAGE WITH ARTICULATED LEGS, ARMS, ROBE, EARS AND SHADOW
        function buildRabbitModel() {
            const g = new THREE.Group();
            const limbs = {};

            const matFur = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.85 });
            const matInnerEar = new THREE.MeshStandardMaterial({ color: 0xffb5a7, roughness: 0.6 });
            const matBlush = new THREE.MeshStandardMaterial({ color: 0xff758f, roughness: 0.7 });
            const matEyePurple = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.2 });

            // Ground Shadow Decal
            const shadowGeo = new THREE.RingGeometry(0, 0.78, 24);
            const shadowMat = new THREE.MeshBasicMaterial({ color: 0x010308, transparent: true, opacity: 0.6, depthWrite: false });
            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.y = 0.02;
            g.add(shadow);
            limbs.shadow = shadow;

            // Body Root Pivot
            const bodyRoot = new THREE.Group();
            bodyRoot.position.y = 0.45;
            g.add(bodyRoot);
            limbs.body = bodyRoot;

            // Torso & Mystic Robe
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 18), matFur);
            body.scale.set(0.95, 0.9, 1.25);
            body.position.y = 0.4;
            bodyRoot.add(body);

            const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 0.9, 20), matRobePurple);
            robe.position.set(0, 0.3, 0.02);
            bodyRoot.add(robe);

            // Head
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), matFur);
            head.position.set(0, 1.2, 0.05);
            bodyRoot.add(head);

            [-0.32, 0.32].forEach(x => {
                const chk = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), matBlush);
                chk.position.set(x, 1.1, 0.35);
                bodyRoot.add(chk);

                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), matEyePurple);
                eye.position.set(x * 0.8, 1.3, 0.5);
                bodyRoot.add(eye);
            });

            // Long Bunny Ears with Bouncing Pivots
            const earPivotL = new THREE.Group();
            earPivotL.position.set(-0.35, 1.7, 0.02);
            const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16), matFur);
            earL.position.y = 0.7;
            earPivotL.add(earL);
            const innerL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.2, 14), matInnerEar);
            innerL.position.set(0, 0.7, 0.04);
            earPivotL.add(innerL);
            earPivotL.rotation.z = 0.12;
            bodyRoot.add(earPivotL);
            limbs.leftEar = earPivotL;

            const earPivotR = new THREE.Group();
            earPivotR.position.set(0.35, 1.7, 0.02);
            const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16), matFur);
            earR.position.y = 0.7;
            earPivotR.add(earR);
            const innerR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.2, 14), matInnerEar);
            innerR.position.set(0, 0.7, 0.04);
            earPivotR.add(innerR);
            earPivotR.rotation.z = -0.12;
            bodyRoot.add(earPivotR);
            limbs.rightEar = earPivotR;

            // Wizard Hat
            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 20), matRobePurple);
            hatBrim.position.set(0, 1.65, 0.05);
            bodyRoot.add(hatBrim);

            const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 20), matRobePurple);
            hatCone.position.set(0, 2.2, 0.05);
            hatCone.rotation.x = 0.15;
            bodyRoot.add(hatCone);

            const hatStar = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), matGold);
            hatStar.position.set(0, 2.8, -0.05);
            bodyRoot.add(hatStar);

            // Left Arm Pivot (Grimoire Book)
            const leftArmPivot = new THREE.Group();
            leftArmPivot.position.set(-0.75, 0.5, 0.2);
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.5), new THREE.MeshStandardMaterial({ color: 0x3b0764 }));
            book.position.set(-0.15, 0.2, 0.3);
            leftArmPivot.add(book);
            bodyRoot.add(leftArmPivot);
            limbs.leftArm = leftArmPivot;

            // Right Arm Pivot (Magic Staff)
            const rightArmPivot = new THREE.Group();
            rightArmPivot.position.set(0.75, 0.5, 0.2);
            const staffWood = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0), new THREE.MeshStandardMaterial({ color: 0x5a3214 }));
            staffWood.position.set(0.15, 0.4, 0.5);
            staffWood.rotation.x = 0.2;
            rightArmPivot.add(staffWood);
            const staffMoon = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 16), matGold);
            staffMoon.position.set(0.15, 1.4, 0.7);
            staffMoon.rotation.y = Math.PI / 2;
            rightArmPivot.add(staffMoon);
            const staffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), matPurpleGlow);
            staffOrb.position.set(0.15, 1.4, 0.7);
            rightArmPivot.add(staffOrb);
            bodyRoot.add(rightArmPivot);
            limbs.rightArm = rightArmPivot;

            // Articulated Legs
            const leftLeg = new THREE.Group();
            leftLeg.position.set(-0.28, 0.45, 0.05);
            const footL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), matFur);
            footL.scale.set(0.9, 0.5, 1.4);
            footL.position.set(0, -0.35, 0.1);
            leftLeg.add(footL);
            g.add(leftLeg);
            limbs.leftLeg = leftLeg;

            const rightLeg = new THREE.Group();
            rightLeg.position.set(0.28, 0.45, 0.05);
            const footR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), matFur);
            footR.scale.set(0.9, 0.5, 1.4);
            footR.position.set(0, -0.35, 0.1);
            rightLeg.add(footR);
            g.add(rightLeg);
            limbs.rightLeg = rightLeg;

            g.limbs = limbs;
            g.swordArm = rightArmPivot;
            return g;
        }

        hamsterVisualGroup = buildHamsterModel();
        rabbitVisualGroup = buildRabbitModel();

        playerGroup.add(hamsterVisualGroup);
        activeWeaponArm = hamsterVisualGroup.swordArm;
        activeLimbs = hamsterVisualGroup.limbs;

        function applyHeroSelection(type) {
            activeHeroType = type;
            playerGroup.remove(hamsterVisualGroup);
            playerGroup.remove(rabbitVisualGroup);

            if (type === 'hamster') {
                playerGroup.add(hamsterVisualGroup);
                activeWeaponArm = hamsterVisualGroup.swordArm;
                activeLimbs = hamsterVisualGroup.limbs;
                document.getElementById('home-hero-avatar').textContent = '🐹';
                document.getElementById('home-hero-name').textContent = 'Chiến Binh Hamster';
                document.getElementById('hud-avatar-icon').textContent = '🐹';
                document.getElementById('hud-name').textContent = 'Chiến Binh Hamster';
                document.getElementById('hud-attack-name').textContent = 'Chém kiếm';
            } else {
                playerGroup.add(rabbitVisualGroup);
                activeWeaponArm = rabbitVisualGroup.swordArm;
                activeLimbs = rabbitVisualGroup.limbs;
                document.getElementById('home-hero-avatar').textContent = '🐰';
                document.getElementById('home-hero-name').textContent = 'Thỏ Phù Thủy';
                document.getElementById('hud-avatar-icon').textContent = '🐰';
                document.getElementById('hud-name').textContent = 'Thỏ Phù Thủy';
                document.getElementById('hud-attack-name').textContent = 'Bắn ma thuật';
            }
        }

        // =====================================================================
        // TERRAIN ELEVATION & RAMP TRAVERSAL ENGINE
        // =====================================================================
        function getGroundElevation(px, pz) {
            // 1. Castle Ramp / Bridge (from z = 42 to z = 95, x in [-114, -106])
            if (px >= -114.5 && px <= -105.5 && pz >= 42.0 && pz <= 95.0) {
                const rampT = (pz - 42.0) / (95.0 - 42.0);
                return rampT * 6.0;
            }
            // 2. Castle Courtyard Platform (x in [-135, -85], z in [95, 146])
            if (px >= -135.0 && px <= -85.0 && pz >= 95.0 && pz <= 146.0) {
                // Throne dais elevation
                if (px >= -115.5 && px <= -104.5 && pz >= 130.0 && pz <= 142.0) {
                    return 6.6;
                }
                return 6.0;
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
        }

        // =====================================================================
        // 520M OPEN WORLD ARCHITECTURAL LANDMARKS & INTERACTABLES
        // =====================================================================
        const interactables = [];
        const landmarksData = [
            { name: "Đền Thần Điện Tsukiezz", x: 0, z: 0, color: "#00f5d4", icon: "🏛️" },
            { name: "Lâu Đài Hoàng Gia", x: -110, z: 120, color: "#ffd700", icon: "🏰" },
            { name: "Đấu Trường La Mã", x: 115, z: 110, color: "#ff4d6d", icon: "⚔️" },
            { name: "Trạm Vũ Trụ Tối Tân", x: -145, z: -35, color: "#00f5d4", icon: "🛸" },
            { name: "Tế Đàn 2 Tầng Huyết Sắc", x: -85, z: -95, color: "#ff1744", icon: "🩸" },
            { name: "Hồ Nước Thủy Ngân", x: -35, z: -135, color: "#93c5fd", icon: "🌊" },
            { name: "Cổ Thụ Nguyệt Tộc 45m", x: 145, z: 30, color: "#4ade80", icon: "🌳" },
            { name: "Hang Động Nguyệt Tinh", x: 125, z: -110, color: "#a855f7", icon: "💎" },
            { name: "Đài Thiên Văn", x: -120, z: -125, color: "#38bdf8", icon: "🔭" }
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

        // 2. LÂU ĐÀI HOÀNG GIA (-110, 120)
        function buildCastle3D() {
            const cg = new THREE.Group();
            const matCastle = new THREE.MeshStandardMaterial({ color: 0x253046, roughness: 0.75, metalness: 0.1 });
            const matDarkBase = new THREE.MeshStandardMaterial({ color: 0x161d2a, roughness: 0.8 });
            const matRoof = new THREE.MeshStandardMaterial({ color: 0x24123c, roughness: 0.35, metalness: 0.2 });

            // Base Mesa Platform (Height: 6m)
            const base = new THREE.Mesh(new THREE.BoxGeometry(52, 6, 56), matDarkBase);
            base.position.y = 3;
            base.receiveShadow = true;
            cg.add(base);

            // 4 Corner Spire Towers
            [[-21, -23], [21, -23], [-21, 23], [21, 23]].forEach(([tx, tz]) => {
                const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 30, 16), matCastle);
                tower.position.set(tx, 20, tz);
                cg.add(tower);

                const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 10, 16), matRoof);
                roof.position.set(tx, 40, tz);
                cg.add(roof);

                const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 1), matCyanGlow);
                gem.position.set(tx, 46, tz);
                cg.add(gem);

                // Tower Colliders
                addCylinderCollider(-110 + tx, 120 + tz, 5.0);
            });

            // Solid Courtyard Walls & Balustrades
            // Left Curtain Wall
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 14, 46), matCastle);
            w1.position.set(-21, 12, 0); cg.add(w1);
            addBoxCollider(-110 - 21, 120, 3.5, 46);

            // Right Curtain Wall
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 14, 46), matCastle);
            w2.position.set(21, 12, 0); cg.add(w2);
            addBoxCollider(-110 + 21, 120, 3.5, 46);

            // Back Curtain Wall
            const w3 = new THREE.Mesh(new THREE.BoxGeometry(44, 14, 2.5), matCastle);
            w3.position.set(0, 12, 23); cg.add(w3);
            addBoxCollider(-110, 120 + 23, 44, 3.5);

            // Front Balustrades left & right of Grand Bridge Gate
            const fwL = new THREE.Mesh(new THREE.BoxGeometry(19, 8, 2.5), matCastle);
            fwL.position.set(-13, 9, -26); cg.add(fwL);
            addBoxCollider(-110 - 13, 120 - 26, 19, 3.5);

            const fwR = new THREE.Mesh(new THREE.BoxGeometry(19, 8, 2.5), matCastle);
            fwR.position.set(13, 9, -26); cg.add(fwR);
            addBoxCollider(-110 + 13, 120 - 26, 19, 3.5);

            // Throne Room Interior
            const carpet = new THREE.Mesh(new THREE.PlaneGeometry(6, 36), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }));
            carpet.rotation.x = -Math.PI / 2;
            carpet.position.set(0, 6.06, 0);
            cg.add(carpet);

            // Royal Throne Dais
            const dais = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 6), matCastle);
            dais.position.set(0, 6.6, 15);
            cg.add(dais);

            const throne = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.4 }));
            throne.position.set(0, 9.2, 15.5);
            cg.add(throne);
            addBoxCollider(-110, 120 + 15.5, 4.5, 3.0);

            const halo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.2, 12, 24), matCyanGlow);
            halo.position.set(0, 12.0, 15.2);
            cg.add(halo);

            // Grand Bridge Ramp down to ground (from y=6m at courtyard to y=0 at z=-77.5)
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.8, 55), matCastle);
            bridge.position.set(0, 3.0, -51);
            bridge.rotation.x = -0.11;
            cg.add(bridge);

            // Bridge Side Railings (prevents falling off sides)
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

            interactables.push({
                id: 'castle_throne',
                pos: new THREE.Vector3(-110, 6.0, 135),
                radius: 8.5,
                prompt: 'Ngồi lên Ngai Vàng Tsukiezz',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_gate',
                pos: new THREE.Vector3(-110, 6.0, 96),
                radius: 7.5,
                prompt: 'Khám phá Đại Sảnh Lâu Đài Tsukiezz',
                type: 'throne'
            });
        }
        buildCastle3D();

        // 3. ĐẤU TRƯỜNG LA MÃ (115, 110)
        function buildColosseum3D() {
            const cg = new THREE.Group();
            const matStone = new THREE.MeshStandardMaterial({ color: 0x333642, roughness: 0.85 });
            const matSand = new THREE.MeshStandardMaterial({ color: 0x232630, roughness: 0.95 });

            // Arena Sand Floor
            const arena = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 0.5, 32), matSand);
            arena.position.y = 0.25;
            cg.add(arena);

            // Tiered Benches
            [28, 30.5, 33].forEach((rad, idx) => {
                const bench = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 1.2, 32), matStone);
                bench.position.y = 0.6 + idx * 1.0;
                cg.add(bench);
            });

            // 24 Arcade Arches Ring (Radius 34m)
            for(let i = 0; i < 24; i++) {
                const ang = i * (Math.PI * 2 / 24);
                const ax = Math.cos(ang) * 34.0;
                const az = Math.sin(ang) * 34.0;
                const isBroken = [3, 4, 11, 12, 18].includes(i);
                const colH = isBroken ? 4.5 : 10.0;
                const col = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, colH, 12), matStone);
                col.position.set(ax, colH / 2, az);
                cg.add(col);

                if (!isBroken) {
                    const entab = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.2, 1.8), matStone);
                    entab.position.set(ax, colH + 0.6, az);
                    entab.rotation.y = -ang + Math.PI / 2;
                    cg.add(entab);
                }

                // Add solid pillar colliders
                addCylinderCollider(115 + ax, 110 + az, 1.4);
            }

            // 8 Torch Braziers around Arena
            for(let i = 0; i < 8; i++) {
                const ang = i * (Math.PI * 2 / 8) + 0.2;
                const tx = Math.cos(ang) * 27.5;
                const tz = Math.sin(ang) * 27.5;
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.8, 8), matStone);
                post.position.set(tx, 2.5, tz);
                cg.add(post);

                const fire = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), matPurpleGlow);
                fire.position.set(tx, 4.1, tz);
                cg.add(fire);
            }

            // Central Hero Duel Pedestal with Glowing Cyan Blade
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 20), matStone);
            ped.position.y = 0.4;
            cg.add(ped);

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.8, 0.7), matCyanGlow);
            blade.position.set(0, 3.2, 0);
            cg.add(blade);

            const pLight = new THREE.PointLight(0x00f5d4, 2.0, 18);
            pLight.position.set(0, 3.8, 0);
            cg.add(pLight);

            cg.position.set(115, 0, 110);
            scene.add(cg);

            addCylinderCollider(115, 110, 3.4); // Central pedestal collider

            interactables.push({
                id: 'colosseum_duel',
                pos: new THREE.Vector3(115, 0.4, 110),
                radius: 8.5,
                prompt: 'Thách Đấu Võ Đài La Mã (Kiếm Anh Hùng)',
                type: 'colosseum'
            });
        }
        buildColosseum3D();

        // 4. TRẠM VŨ TRỤ CÔNG NGHỆ TỐI TÂN (-145, -35)
        function buildSpaceStation3D() {
            const sg = new THREE.Group();
            const matDark = new THREE.MeshStandardMaterial({ color: 0x121722, roughness: 0.4, metalness: 0.85 });
            const matWhite = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.7 });
            const matSolar = new THREE.MeshStandardMaterial({ color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 1.5, metalness: 0.9 });
            const matHazard = new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xca8a04, emissiveIntensity: 1.2 });

            // Octagonal Landing Pad (Radius 18m)
            const pad = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1.0, 8), matDark);
            pad.position.y = 0.5;
            sg.add(pad);

            const hazard = new THREE.Mesh(new THREE.TorusGeometry(17.2, 0.35, 8, 32), matHazard);
            hazard.rotation.x = Math.PI / 2;
            hazard.position.y = 1.05;
            sg.add(hazard);

            // 8 Runway Beacons
            for(let i = 0; i < 8; i++) {
                const ang = i * (Math.PI * 2 / 8);
                const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), matCyanGlow);
                bMesh.position.set(Math.cos(ang) * 16.5, 1.3, Math.sin(ang) * 16.5);
                sg.add(bMesh);
            }

            // Command Habitation Hub Module
            const hubX = -12, hubZ = 12;
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 7, 8), matWhite);
            hub.position.set(hubX, 4.5, hubZ);
            sg.add(hub);

            const dome = new THREE.Mesh(new THREE.SphereGeometry(5.5, 20, 16), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.7, roughness: 0.1 }));
            dome.scale.set(1.0, 0.65, 1.0);
            dome.position.set(hubX, 8.0, hubZ);
            sg.add(dome);

            const neonRing = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.15, 8, 32), matCyanGlow);
            neonRing.rotation.x = Math.PI / 2;
            neonRing.position.set(hubX, 4.5, hubZ);
            sg.add(neonRing);

            // Quantum Solar Array Wings
            [-1, 1].forEach(side => {
                const wing = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 6), matSolar);
                wing.position.set(hubX + side * 18, 5.0, hubZ);
                wing.rotation.x = 0.45;
                sg.add(wing);

                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), matDark);
                arm.position.set(hubX + side * 13, 5.0, hubZ);
                arm.rotation.z = Math.PI / 2;
                sg.add(arm);

                addBoxCollider(-145 + hubX + side * 18, -35 + hubZ, 10, 6);
            });

            // Communications Radar Dish
            const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 4.0, 12), matDark);
            dishMast.position.set(hubX + 8, 3.0, hubZ + 14);
            sg.add(dishMast);

            const dish = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 12), matWhite);
            dish.scale.set(1.0, 0.4, 1.0);
            dish.rotation.set(0.6, 0.2, 0.8);
            dish.position.set(hubX + 8, 5.8, hubZ + 14);
            sg.add(dish);

            // 4 Sci-Fi Cargo Crates
            [[4, 6], [6.5, 4], [-5, 8], [8, -4]].forEach(([cx, cz]) => {
                const crate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 1.6), matDark);
                crate.position.set(cx, 1.8, cz);
                sg.add(crate);

                const cLight = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.2), matCyanGlow);
                cLight.position.set(cx, 2.7, cz);
                sg.add(cLight);

                addBoxCollider(-145 + cx, -35 + cz, 2.6, 2.0);
            });

            // Sci-Fi Hologram Console on the pad
            const consoleBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.0), matDark);
            consoleBase.position.set(-2, 1.1, 7);
            sg.add(consoleBase);
            const consoleScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), matCyanGlow);
            consoleScreen.rotation.x = -0.4;
            consoleScreen.position.set(-2, 1.7, 7.2);
            sg.add(consoleScreen);

            sg.position.set(-145, 0, -35);
            scene.add(sg);

            // Hub central collider
            addCylinderCollider(-145 + hubX, -35 + hubZ, 8.8);
            addCylinderCollider(-145 + hubX + 8, -35 + hubZ + 14, 2.2);

            interactables.push({
                id: 'space_station_console',
                pos: new THREE.Vector3(-147, 0.5, -28),
                radius: 9.0,
                prompt: 'Kích hoạt Trạm Vũ Trụ Tối Tân (Hologram Console)',
                type: 'space_station'
            });
        }
        buildSpaceStation3D();

        // 5. TRỤ TẾ ĐÀN 2 TẦNG HUYẾT SẮC (-85, -95)
        function buildAltar2Tier3D() {
            const ag = new THREE.Group();
            const matAltarDark = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.7, metalness: 0.2 });
            const matBloodRune = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 3.5 });

            // Altar Tier 1 (18m diameter, 1.8m tall)
            const t1 = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 9.5, 1.8, 32), matAltarDark);
            t1.position.y = 0.9;
            t1.receiveShadow = true;
            ag.add(t1);

            const runeRing1 = new THREE.Mesh(new THREE.TorusGeometry(8.8, 0.18, 8, 36), matBloodRune);
            runeRing1.rotation.x = Math.PI / 2;
            runeRing1.position.y = 1.85;
            ag.add(runeRing1);

            // 4 Mystical Pillars with Purple Fire Braziers on Tier 1
            for(let i = 0; i < 4; i++) {
                const ang = i * (Math.PI / 2) + Math.PI / 4;
                const px = Math.cos(ang) * 5.2;
                const pz = Math.sin(ang) * 5.2;
                const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 4.8, 12), matAltarDark);
                pil.position.set(px, 4.2, pz);
                ag.add(pil);

                const flame = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), matPurpleGlow);
                flame.position.set(px, 6.8, pz);
                ag.add(flame);

                const lt = new THREE.PointLight(0xa855f7, 2.8, 16);
                lt.position.set(px, 7.0, pz);
                ag.add(lt);

                addCylinderCollider(-85 + px, -95 + pz, 1.2);
            }

            // Stone Steps leading up to Tier 1 and Tier 2
            for(let s = 0; s < 6; s++) {
                const step = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.4), matAltarDark);
                step.position.set(0, 0.3 + s * 0.35, -9.5 + s * 1.2);
                ag.add(step);
            }

            // Altar Tier 2 (11m diameter, 5.2m tall)
            const t2 = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.8, 1.0, 24), matAltarDark);
            t2.position.y = 5.2;
            ag.add(t2);

            const runeRing2 = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.15, 8, 32), matBloodRune);
            runeRing2.rotation.x = Math.PI / 2;
            runeRing2.position.y = 5.75;
            ag.add(runeRing2);

            // Center Sacrificial Pillar
            const sPil = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 2.4, 12), matAltarDark);
            sPil.position.y = 6.9;
            ag.add(sPil);

            // Floating Void Heart Relic
            const voidHeart = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 2), matBloodRune);
            voidHeart.position.y = 9.4;
            ag.add(voidHeart);

            const vLight = new THREE.PointLight(0xff1744, 3.8, 25);
            vLight.position.set(0, 9.6, 0);
            ag.add(vLight);

            // 6 Orbiting Rune Crystal Shards
            for(let i = 0; i < 6; i++) {
                const ang = i * (Math.PI * 2 / 6);
                const shard = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 4), matBloodRune);
                shard.position.set(Math.cos(ang) * 2.6, 9.4, Math.sin(ang) * 2.6);
                shard.rotation.z = 0.45;
                ag.add(shard);
            }

            // 4 Guardian Obelisks around outer altar
            for(let g = 0; g < 4; g++) {
                const gang = g * (Math.PI / 2);
                const gx = Math.cos(gang) * 12.0;
                const gz = Math.sin(gang) * 12.0;
                const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 5.5, 6), matAltarDark);
                obelisk.position.set(gx, 2.75, gz);
                ag.add(obelisk);
                addCylinderCollider(-85 + gx, -95 + gz, 1.4);
            }

            ag.position.set(-85, 0, -95);
            scene.add(ag);

            // Central pillar collider (player can walk on Tier 1 and Tier 2 around it)
            addCylinderCollider(-85, -95, 2.0);

            interactables.push({
                id: 'void_altar',
                pos: new THREE.Vector3(-85, 1.8, -95),
                radius: 12.0,
                prompt: 'Thức Tỉnh Phong Ấn Trái Tim Hư Không (Trụ Tế Đàn 2 Tầng)',
                type: 'altar'
            });
        }
        buildAltar2Tier3D();

        // 6. HỒ NƯỚC THỦY NGÂN GƯƠNG BẠC (-35, -135)
        function buildMercuryLake3D() {
            const lg = new THREE.Group();
            const matMercury = new THREE.MeshStandardMaterial({ color: 0xd8e6f8, roughness: 0.02, metalness: 1.0 });
            const matLakeRim = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });
            const matCrystalBlue = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 2.2 });

            // Liquid Mercury Pool (55m diameter)
            const lake = new THREE.Mesh(new THREE.CylinderGeometry(27.5, 27.5, 0.45, 48), matMercury);
            lake.position.y = 0.22;
            lg.add(lake);

            // Outer Obsidian Rim Wall
            const rim = new THREE.Mesh(new THREE.TorusGeometry(27.5, 1.4, 16, 48), matLakeRim);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.6;
            lg.add(rim);

            // Stepping Stone Piers leading to central viewing pavilion
            for(let i = 0; i < 9; i++) {
                const sp = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.8, 16), matLakeRim);
                sp.position.set(0, 0.45, -26 + i * 3.2);
                lg.add(sp);
            }

            // Central Moonlit Viewing Gazebo / Pavilion
            const gaz = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.9, 16), matLakeRim);
            gaz.position.set(0, 0.5, 0);
            lg.add(gaz);

            // 4 Crystal Spire Lanterns in the Lake
            for(let c = 0; c < 4; c++) {
                const cang = c * (Math.PI / 2) + 0.3;
                const cx = Math.cos(cang) * 18.0;
                const cz = Math.sin(cang) * 18.0;
                const crys = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4.2, 6), matCrystalBlue);
                crys.position.set(cx, 2.1, cz);
                lg.add(crys);

                const clt = new THREE.PointLight(0x60a5fa, 2.0, 18);
                clt.position.set(cx, 3.2, cz);
                lg.add(clt);

                addCylinderCollider(-35 + cx, -135 + cz, 1.5);
            }

            lg.position.set(-35, 0, -135);
            scene.add(lg);

            // Gazebo center small pillar collider
            addCylinderCollider(-35, -135, 1.2);

            interactables.push({
                id: 'mercury_lake',
                pos: new THREE.Vector3(-35, 0.5, -135),
                radius: 14.0,
                prompt: 'Thanh Tẩy Linh Lực (Hồ Nước Thủy Ngân Gương Bạc)',
                type: 'mercury_lake'
            });

            interactables.push({
                id: 'mercury_shore',
                pos: new THREE.Vector3(-35, 0.5, -155),
                radius: 10.0,
                prompt: 'Thanh Tẩy Linh Lực (Bến Hồ Thủy Ngân)',
                type: 'mercury_lake'
            });
        }
        buildMercuryLake3D();

        // 7. ĐẠI CỔ THỤ NGUYỆT TỘC 45M (145, 30)
        function buildAncientTree3D() {
            const tg = new THREE.Group();
            const matBark = new THREE.MeshStandardMaterial({ color: 0x1f1624, roughness: 0.9 });
            const matLeaves = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 2.0, roughness: 0.4 });

            // Giant Trunk
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 5.8, 38, 16), matBark);
            trunk.position.y = 19;
            tg.add(trunk);

            // 3-Tier Layered Foliage Canopy
            [
                { r: 16, y: 32, h: 10 },
                { r: 12, y: 39, h: 8 },
                { r: 7, y: 44, h: 6 }
            ].forEach(layer => {
                const foliage = new THREE.Mesh(new THREE.ConeGeometry(layer.r, layer.h, 16), matLeaves);
                foliage.position.y = layer.y;
                tg.add(foliage);
            });

            // Hanging bioluminescent tendrils
            for(let i = 0; i < 12; i++) {
                const ang = i * (Math.PI * 2 / 12);
                const tRad = 11.5 + Math.sin(i) * 2;
                const tendril = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 12, 6), matCyanGlow);
                tendril.position.set(Math.cos(ang) * tRad, 26, Math.sin(ang) * tRad);
                tg.add(tendril);
            }

            const treeLight = new THREE.PointLight(0x00f5d4, 3.0, 35);
            treeLight.position.set(0, 34, 0);
            tg.add(treeLight);

            tg.position.set(145, 0, 30);
            scene.add(tg);

            // Tree Trunk Collider
            addCylinderCollider(145, 30, 5.5);

            interactables.push({
                id: 'ancient_tree',
                pos: new THREE.Vector3(145, 0, 30),
                radius: 12.0,
                prompt: 'Hấp Thụ Năng Lượng Cổ Thụ 45m',
                type: 'tree'
            });
        }
        buildAncientTree3D();

        // 8. HANG ĐỘNG NGUYỆT TINH (125, -110)
        function buildCave3D() {
            const cg = new THREE.Group();
            const matRock = new THREE.MeshStandardMaterial({ color: 0x161822, roughness: 0.95 });
            const matStarlight = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.8, roughness: 0.1 });

            // Entrance Arch
            const arch = new THREE.Mesh(new THREE.TorusGeometry(7.0, 2.4, 12, 24), matRock);
            arch.rotation.y = Math.PI / 4;
            arch.position.set(0, 5.0, 0);
            cg.add(arch);

            // Subterranean Starlight Pond
            const pool = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 0.4, 20), matStarlight);
            pool.position.set(9.0, 0.2, -9.0);
            cg.add(pool);

            // Stalactites
            for(let i = 0; i < 6; i++) {
                const ang = i * (Math.PI * 2 / 6);
                const st = new THREE.Mesh(new THREE.ConeGeometry(0.4, 3.5, 6), matPurpleGlow);
                st.rotation.x = Math.PI;
                st.position.set(9.0 + Math.cos(ang) * 5.0, 9.0, -9.0 + Math.sin(ang) * 5.0);
                cg.add(st);
            }

            // Treasure Chest
            const chestGroup = new THREE.Group();
            const chestBox = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 }));
            chestBox.position.y = 0.6;
            chestGroup.add(chestBox);

            const chestLid = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.0, 12, 1, false, 0, Math.PI), matGold);
            chestLid.rotation.z = Math.PI / 2;
            chestLid.position.y = 1.2;
            chestGroup.add(chestLid);

            chestGroup.position.set(11.0, 0, -9.0);
            cg.add(chestGroup);

            cg.position.set(125, 0, -110);
            scene.add(cg);

            // Cave entrance walls & chest colliders
            addBoxCollider(125 - 6, -110, 4.5, 12);
            addBoxCollider(125 + 6, -110, 4.5, 12);
            addBoxCollider(125 + 11.0, -110 - 9.0, 2.4, 2.4);

            interactables.push({
                id: 'cave_chest',
                pos: new THREE.Vector3(125 + 11.0, 0, -110 - 9.0),
                radius: 7.5,
                prompt: 'Mở Rương Báu Nguyệt Tinh',
                type: 'chest'
            });
        }
        buildCave3D();

        // 9. ĐÀI THIÊN VĂN TỔ TIÊN (-120, -125)
        function buildObservatory3D() {
            const og = new THREE.Group();
            const matDarkStone = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.8 });
            const matBrass = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.85 });

            // Platform
            const base = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 2.0, 24), matDarkStone);
            base.position.y = 1.0;
            og.add(base);

            // Observatory Dome
            const dome = new THREE.Mesh(new THREE.SphereGeometry(7.0, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), matDarkStone);
            dome.position.y = 2.0;
            og.add(dome);

            // Great Brass Telescope
            const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 14, 16), matBrass);
            scope.rotation.x = -0.75;
            scope.position.set(0, 9.0, 2.0);
            og.add(scope);

            const scopeLens = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), matCyanGlow);
            scopeLens.position.set(0, 13.5, -3.2);
            og.add(scopeLens);

            og.position.set(-120, 0, -125);
            scene.add(og);

            // Telescope central pedestal collider
            addCylinderCollider(-120, -125, 3.4);

            interactables.push({
                id: 'observatory',
                pos: new THREE.Vector3(-120, 1.0, -125),
                radius: 10.0,
                prompt: 'Chiêm Ngưỡng Thiên Hà Tsukiezz (Kính Viễn Vọng)',
                type: 'observatory'
            });
        }
        buildObservatory3D();

        // 10. CỎ BIẾN DỊ DẠ QUANG (MUTANT ALIEN FLORA)
        const grassColors = [matCyanGlow, matPurpleGlow, new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 2.2 })];
        function spawnMutantClump(gx, gz, scale = 1.0) {
            const clump = new THREE.Group();
            const cMat = grassColors[Math.floor(Math.random() * grassColors.length)];
            const bladeCount = 7 + Math.floor(Math.random() * 4);

            for(let b = 0; b < bladeCount; b++) {
                const bAng = b * (Math.PI * 2 / bladeCount) + (Math.random() - 0.5) * 0.4;
                const h = (1.2 + Math.random() * 1.4) * scale;
                const rad = 0.08 * scale;
                const blade = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 4), cMat);
                blade.position.set(Math.cos(bAng) * 0.35 * scale, h / 2, Math.sin(bAng) * 0.35 * scale);
                blade.rotation.set(Math.cos(bAng) * 0.35, Math.random() * Math.PI, Math.sin(bAng) * 0.35);
                clump.add(blade);
            }

            const spore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 * scale, 1), cMat);
            spore.position.y = 0.75 * scale;
            clump.add(spore);

            clump.position.set(gx, 0, gz);
            scene.add(clump);
        }

        // Spawn along road network
        [
            [-110, 120], [115, 110], [-145, -35], [-45, -115],
            [145, 30], [125, -110], [-120, -125]
        ].forEach(([tx, tz]) => {
            for(let s = 1; s <= 12; s++) {
                const ratio = s / 13;
                const rx = tx * ratio + (Math.random() - 0.5) * 6.5;
                const rz = tz * ratio + (Math.random() - 0.5) * 6.5;
                spawnMutantClump(rx, rz, 0.8 + Math.random() * 0.6);
            }
        });

        // Spawn around landmarks
        landmarksData.forEach(lm => {
            for(let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                spawnMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });

        // =====================================================================
        // FAST TRAVEL TOUR & REAL-TIME MINIMAP RADAR
        // =====================================================================
        function fastTravelTo(tx, tz, name) {
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
        }

        const minimapCanvas = document.getElementById('minimap-canvas');
        const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

        function updateMinimap(px, pz, pRot) {
            if (!minimapCtx) return;
            const w = minimapCanvas.width;
            const h = minimapCanvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const scale = w / 520; // 520m to 130px

            minimapCtx.clearRect(0, 0, w, h);

            // Radar background grid & circles
            minimapCtx.fillStyle = "rgba(6, 10, 22, 0.95)";
            minimapCtx.fillRect(0, 0, w, h);

            minimapCtx.strokeStyle = "rgba(0, 245, 212, 0.15)";
            minimapCtx.lineWidth = 1;
            minimapCtx.beginPath();
            minimapCtx.arc(cx, cy, 28, 0, Math.PI * 2);
            minimapCtx.arc(cx, cy, 52, 0, Math.PI * 2);
            minimapCtx.stroke();

            // Landmarks blips
            landmarksData.forEach(lm => {
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

            // Check nearest landmark for indicator
            let nearest = landmarksData[0];
            let minDist = 9999;
            landmarksData.forEach(lm => {
                const d = Math.sqrt((px - lm.x)**2 + (pz - lm.z)**2);
                if (d < minDist) { minDist = d; nearest = lm; }
            });
            const badgeName = document.getElementById('landmark-current-name');
            const badgeIcon = document.getElementById('landmark-icon');
            if (badgeName && badgeIcon) {
                badgeName.textContent = `${nearest.name} (${Math.round(minDist)}m)`;
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
            inDialogue: false
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
            "Vương quốc Tsukiezz đã chìm trong giấc ngủ ngàn năm bởi kết giới bóng tối.",
            "Hãy chu du qua 9 kỳ quan nguyệt tộc: Lâu Đài, Đấu Trường, Trạm Vũ Trụ, Tế Đàn 2 Tầng, Hồ Thủy Ngân, Cổ Thụ, Hang Động và Đài Thiên Văn!",
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
        const keys = { forward: false, backward: false, left: false, right: false, shift: false, jump: false };

        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') keys.forward = true;
            if (k === 's' || e.key === 'ArrowDown') keys.backward = true;
            if (k === 'a' || e.key === 'ArrowLeft') keys.left = true;
            if (k === 'd' || e.key === 'ArrowRight') keys.right = true;
            if (e.key === 'Shift') keys.shift = true;
            if (e.key === ' ' || k === 'space') {
                if (gameState.inDialogue) advanceDialogue();
                else if (gameState.isPlaying) keys.jump = true;
            }
            if (k === 'e' && gameState.isPlaying) handleInteraction();
            if (k === 'j' && gameState.isPlaying) triggerAttack();
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') keys.forward = false;
            if (k === 's' || e.key === 'ArrowDown') keys.backward = false;
            if (k === 'a' || e.key === 'ArrowLeft') keys.left = false;
            if (k === 'd' || e.key === 'ArrowRight') keys.right = false;
            if (e.key === 'Shift') keys.shift = false;
        });

        // MOUSE ORBIT CAMERA & ROTATION SYSTEM
        let isRightMouseDown = false;
        let mouseLastX = 0;
        let mouseLastY = 0;
        let camYaw = 0;
        let camPitch = 0.32;
        let camDistance = 8.5;

        // Prevent browser right-click context menu
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
        });

        window.addEventListener('wheel', (e) => {
            if (gameState.isPlaying) {
                camDistance = Math.max(3.8, Math.min(24.0, camDistance + e.deltaY * 0.012));
            }
        }, { passive: true });

        let isAttacking = false;
        function triggerAttack() {
            if (isAttacking || !activeWeaponArm || gameState.inDialogue) return;
            isAttacking = true;
            sfx.attackSound(activeHeroType === 'rabbit');

            let progress = 0;
            const interval = setInterval(() => {
                progress += 0.22;
                if (progress <= 1.0) {
                    activeWeaponArm.rotation.x = Math.sin(progress * Math.PI) * 1.5;
                    activeWeaponArm.rotation.y = -Math.sin(progress * Math.PI) * 1.2;
                } else {
                    activeWeaponArm.rotation.x = 0;
                    activeWeaponArm.rotation.y = 0;
                    isAttacking = false;
                    clearInterval(interval);
                }
            }, 20);
        }

        // ACCURATE 2D HORIZONTAL INTERACTION DETECTION (NO HEIGHT BARRIER BUG)
        let nearbyItem = null;
        function checkInteractables() {
            let found = null;
            const p = playerGroup.position;
            for (const item of interactables) {
                if (item.collected) continue;
                const dx = p.x - item.pos.x;
                const dz = p.z - item.pos.z;
                const distXZ = Math.hypot(dx, dz);
                const distY = Math.abs(p.y - item.pos.y);
                // Check generous horizontal range and vertical tolerance
                if (distXZ <= item.radius && distY <= 10.0) {
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

        function handleInteraction() {
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
        }

        // =====================================================================
        // UI MODAL & TRANSITION HANDLERS
        // =====================================================================
        function openModal(id) {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }
        function closeModal(id) {
            document.getElementById(id).classList.remove('active');
        }

        function selectHero(type) {
            document.getElementById('card-hero-hamster').classList.toggle('selected', type === 'hamster');
            document.getElementById('card-hero-rabbit').classList.toggle('selected', type === 'rabbit');
            applyHeroSelection(type);
            closeModal('modal-heroes');
            showNotification(`Đã chọn: ${type === 'hamster' ? 'Chiến Binh Hamster' : 'Thỏ Phù Thủy Chiến Binh'}!`);
        }

        function enterGame() {
            sfx.init();
            homeScreen.classList.add('hidden');
            gameHud.classList.add('active');
            gameState.isPlaying = true;
            const gy = getGroundElevation(playerGroup.position.x, playerGroup.position.z);
            currentGroundY = gy;
            playerGroup.position.y = gy;
            camera.position.set(playerGroup.position.x, gy + 4.2, playerGroup.position.z + 7.8);
            camera.lookAt(playerGroup.position.x, gy + 1.2, playerGroup.position.z);
            showNotification("Chào mừng đến với Tsukiezz! Dùng WASD để đi bộ, Chuột Phải để xoay góc nhìn, E để tương tác!");
        }

        function returnToHome() {
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
        document.getElementById('btn-open-lore').addEventListener('click', () => openModal('modal-lore'));
        document.getElementById('btn-open-settings').addEventListener('click', () => openModal('modal-settings'));
        document.getElementById('btn-return-home').addEventListener('click', returnToHome);

        // Sound volume control
        document.getElementById('slider-bgm').addEventListener('input', (e) => {
            if (sfx.bgmGain) sfx.bgmGain.gain.value = e.target.value / 100 * 0.1;
        });
        document.getElementById('slider-sfx').addEventListener('input', (e) => {
            if (sfx.sfxGain) sfx.sfxGain.gain.value = e.target.value / 100;
        });

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
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Rotate celestial planetary ring
            if (typeof ringMesh !== 'undefined' && ringMesh) {
                ringMesh.rotation.z += 0.04 * delta;
            }

            if (gameState.isPlaying && !gameState.inDialogue) {
                let inputX = 0;
                let inputZ = 0;

                if (keys.forward) inputZ -= 1;
                if (keys.backward) inputZ += 1;
                if (keys.left) inputX -= 1;
                if (keys.right) inputX += 1;

                const isMoving = (inputX !== 0 || inputZ !== 0);
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
                } else {
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
                }

                // =========================================================
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
                camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.3, playerGroup.position.z);
            } else if (!gameState.isPlaying) {
                // Atmospheric cinematic camera slow orbit around the moonlit ruins for Home Screen
                const orbitAngle = time * 0.08;
                camera.position.set(Math.sin(orbitAngle) * 22, 11 + Math.sin(time * 0.15) * 2, Math.cos(orbitAngle) * 22);
                camera.lookAt(0, 2.5, 0);
            }

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    '''

    final_content = before_chars + new_script_code + "\n</script>\n</body>\n</html>\n"

    with open(path, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print("Successfully updated demo/index.html with full collision, ramp elevation, and real walking animation!")

if __name__ == '__main__':
    main()
