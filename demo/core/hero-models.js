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
            const swordHand = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), matFur);
            swordHand.position.set(.15, 0, .32);
            rightArmPivot.add(swordHand);
            const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.95), matSteel);
            swordBlade.position.set(0.15, 0, 0.65);
            swordBlade.userData.defaultWeapon=true;rightArmPivot.add(swordBlade);
            const swordGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85), matCyanGlow);
            swordGlow.rotation.x = Math.PI / 2;
            swordGlow.position.set(0.15, 0, 0.65);
            swordGlow.userData.defaultWeapon=true;rightArmPivot.add(swordGlow);
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
            const staffHand = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), matFur);
            staffHand.position.set(.15, .12, .445);
            rightArmPivot.add(staffHand);
            const staffWood = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0), new THREE.MeshStandardMaterial({ color: 0x5a3214 }));
            staffWood.position.set(0.15, 0.4, 0.5);
            staffWood.rotation.x = 0.2;
            staffWood.userData.defaultWeapon=true;rightArmPivot.add(staffWood);
            const staffMoon = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 16), matGold);
            staffMoon.position.set(0.15, 1.4, 0.7);
            staffMoon.rotation.y = Math.PI / 2;
            staffMoon.userData.defaultWeapon=true;rightArmPivot.add(staffMoon);
            const staffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), matPurpleGlow);
            staffOrb.position.set(0.15, 1.4, 0.7);
            staffOrb.userData.defaultWeapon=true;rightArmPivot.add(staffOrb);
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

        function applyHeroSelection(type) {
            if (!['hamster','rabbit','dragon_knight','kingkong','ninja_yinyang'].includes(type)) return;
            for(const model of [hamsterVisualGroup,rabbitVisualGroup,dragonVisualGroup,kingkongVisualGroup,ninjaVisualGroup])resetHeroAnimation(model);
            heroMoveDirection?.set(0,0,0);window.heroMotion?.reset();
            activeHeroType = type;
            playerGroup.remove(hamsterVisualGroup);
            playerGroup.remove(rabbitVisualGroup);
            playerGroup.remove(dragonVisualGroup);
            playerGroup.remove(kingkongVisualGroup);
            playerGroup.remove(ninjaVisualGroup);
            window.ninjaAbilities?.reset();
            if(type==='ninja_yinyang'){playerGroup.add(ninjaVisualGroup);activeWeaponArm=ninjaVisualGroup.swordArm;activeLimbs=ninjaVisualGroup.limbs;for(const id of ['home-hero-name','hud-name'])document.getElementById(id).textContent='Ninja \u00c2m D\u01b0\u01a1ng';for(const id of ['home-hero-avatar','hud-avatar-icon'])document.getElementById(id).textContent='\ud83e\udd77';document.getElementById('hud-attack-name').textContent='Song \u0111o\u1ea3n \u0111ao';return;}
            if(type==='kingkong'){
                playerGroup.add(kingkongVisualGroup);activeWeaponArm=kingkongVisualGroup.swordArm;activeLimbs=kingkongVisualGroup.limbs;
                for(const id of ['home-hero-name','hud-name'])document.getElementById(id).textContent='King Kong Đấm Bốc';
                for(const id of ['home-hero-avatar','hud-avatar-icon'])document.getElementById(id).textContent='🦍';
                document.getElementById('hud-attack-name').textContent='Đấm bốc';return;
            }
            if(type==='dragon_knight'){
                playerGroup.add(dragonVisualGroup);activeWeaponArm=dragonVisualGroup.swordArm;activeLimbs=dragonVisualGroup.limbs;
                for(const id of ['home-hero-name','hud-name'])document.getElementById(id).textContent='Chi\u1ebfn Binh R\u1ed3ng';
                for(const id of ['home-hero-avatar','hud-avatar-icon'])document.getElementById(id).textContent='\ud83d\udc32';
                document.getElementById('hud-attack-name').textContent='Ch\u00e9m ki\u1ebfm';return;
            }


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

