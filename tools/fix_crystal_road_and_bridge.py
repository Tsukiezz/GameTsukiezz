import os
import re

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Route 1 Crystal Highway to connect seamlessly to Castle Bridge at z = 41.5
old_route1 = "buildCrystalHighway(0, 0, -110, 42, 6.4);"
new_route1 = "buildCrystalHighway(0, 0, -110, 41.5, 6.8);"
assert old_route1 in content, "old_route1 not found"
content = content.replace(old_route1, new_route1, 1)

# 2. Update getGroundElevation:
# Fix Castle Bridge Ramp to be exactly 0.35m at z=41.5 to 6.00m at z=95.0
# Add smooth curb beveling for plaza and crystal roads
old_elev_part = """            // Castle Grand Bridge Ramp (from z = 42 to z = 95, x in [-114.5, -105.5])
            if (px >= -114.5 && px <= -105.5 && pz >= 42.0 && pz <= 95.0) {
                const rampT = (pz - 42.0) / (95.0 - 42.0);
                baseElev = rampT * 6.0;
            }
            // Castle Multi-Story complex floor plates
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.0 && pz <= 146.0) {"""

new_elev_part = """            // Castle Grand Bridge Ramp (from z = 41.5 to z = 95.0, x in [-114.5, -105.5])
            // Seamlessly connects Route 1 Crystal Highway (Y = 0.35m at z = 41.5) to Castle Floor 1 (Y = 6.0m at z = 95.0)
            if (px >= -114.5 && px <= -105.5 && pz >= 41.5 && pz <= 95.0) {
                const rampT = (pz - 41.5) / (95.0 - 41.5);
                baseElev = 0.35 + rampT * (6.0 - 0.35);
            }
            // Castle Multi-Story complex floor plates
            else if (px >= -136.0 && px <= -84.0 && pz >= 94.5 && pz <= 146.0) {"""

assert old_elev_part in content, "old_elev_part not found"
content = content.replace(old_elev_part, new_elev_part, 1)

old_road_elev = """            // Central Crystal Plaza elevation (Y = 0.35m at radius <= 16.5m)
            if (Math.hypot(px, pz) <= 16.5) {
                if (baseElev < 0.35) baseElev = 0.35;
            }

            // Crystal Road Segments elevation (Y = 0.35m)
            for (let r = 0; r < crystalRoadSegments.length; r++) {
                const seg = crystalRoadSegments[r];
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                const lenSq = dx * dx + dz * dz;
                const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (pz - seg.z1) * dz) / lenSq));
                const projX = seg.x1 + t * dx;
                const projZ = seg.z1 + t * dz;
                const dSq = (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
                if (dSq <= (seg.width * 0.58) * (seg.width * 0.58)) {
                    if (baseElev < 0.35) baseElev = 0.35;
                    break;
                }
            }"""

new_road_elev = """            // Central Crystal Plaza elevation (Y = 0.35m at radius <= 16.0m with smooth beveled edge to 16.8m)
            const distPlaza = Math.hypot(px, pz);
            if (distPlaza <= 16.0) {
                if (baseElev < 0.35) baseElev = 0.35;
            } else if (distPlaza <= 16.8) {
                const curbT = (distPlaza - 16.0) / 0.8;
                const plazaElev = 0.35 * (1.0 - curbT);
                if (baseElev < plazaElev) baseElev = plazaElev;
            }

            // Crystal Road Segments elevation (Y = 0.35m with continuous smooth beveled edge)
            for (let r = 0; r < crystalRoadSegments.length; r++) {
                const seg = crystalRoadSegments[r];
                const dx = seg.x2 - seg.x1;
                const dz = seg.z2 - seg.z1;
                const lenSq = dx * dx + dz * dz;
                const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (pz - seg.z1) * dz) / lenSq));
                const projX = seg.x1 + t * dx;
                const projZ = seg.z1 + t * dz;
                const distToRoad = Math.hypot(px - projX, pz - projZ);
                const halfW = seg.width * 0.5;
                if (distToRoad <= halfW) {
                    if (baseElev < 0.35) baseElev = 0.35;
                    break;
                } else if (distToRoad <= halfW + 0.6) {
                    const curbT = (distToRoad - halfW) / 0.6;
                    const roadElev = 0.35 * (1.0 - curbT);
                    if (baseElev < roadElev) baseElev = roadElev;
                    break;
                }
            }"""

assert old_road_elev in content, "old_road_elev not found"
content = content.replace(old_road_elev, new_road_elev, 1)

# 3. Update Grand Bridge 3D meshes and Colliders in buildCastle3D()
old_bridge_part = """            // =================================================================
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
            addBoxCollider(-110 + 3.4, 120 - 51, 1.0, 55, 0, 7.5);

            // Grand Moonstone Portal Pillars at Castle Bridge Entrance (connecting seamlessly to Crystal Highway!)
            [-4.8, 4.8].forEach((px, idx) => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 7.5, 12), matCastle);
                pillar.position.set(px, 3.75, -78.5); // Local Z = -78.5 corresponds to World Z = 41.5
                cg.add(pillar);

                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 10, 24, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(px, 7.8, -78.5);
                crescent.rotation.z = (idx === 0 ? 0.35 : -0.35);
                cg.add(crescent);

                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);

                addCylinderCollider(-110 + px, 41.5, 1.2, 0, 8.5);
            });"""

new_bridge_part = """            // =================================================================
            // GRAND BRIDGE RAMP & CRYSTAL HIGHWAY (Connecting Moon Ground to Floor 1)
            // Perfectly calibrated: top surface starts at Y = 0.35m at z = 41.5 and reaches Y = 6.0m at z = 95.0
            // Rotation angle: -0.10522 rad; Center: local Z = -51.75, local Y = 2.78m; 3D Length = 53.8m
            // =================================================================
            const bridgeSlopeAng = -0.10522;
            const bridgeCenterZ = -51.75;
            const bridgeCenterY = 2.78;

            // Main Stone Ramp Foundation Slab
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.8, 53.8), matDarkBase);
            bridge.position.set(0, bridgeCenterY, bridgeCenterZ);
            bridge.rotation.x = bridgeSlopeAng;
            bridge.receiveShadow = true;
            cg.add(bridge);

            // Seamless Royal Crystal Pavement along bridge ramp (5.4m wide)
            const bridgeCrystalRoad = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 53.8), matCrystalRoad);
            bridgeCrystalRoad.position.set(0, bridgeCenterY + 0.38, bridgeCenterZ);
            bridgeCrystalRoad.rotation.x = bridgeSlopeAng;
            bridgeCrystalRoad.receiveShadow = true;
            cg.add(bridgeCrystalRoad);

            // Glowing central amethyst rune ribbon
            const bridgeRuneRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 53.8), matCrystalRuneCenter);
            bridgeRuneRibbon.position.set(0, bridgeCenterY + 0.40, bridgeCenterZ);
            bridgeRuneRibbon.rotation.x = bridgeSlopeAng;
            cg.add(bridgeRuneRibbon);

            // Raised cyan crystal curb borders along bridge walkway
            [-2.8, 2.8].forEach(curbX => {
                const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 53.8), matCrystalCurb);
                curb.position.set(curbX, bridgeCenterY + 0.46, bridgeCenterZ);
                curb.rotation.x = bridgeSlopeAng;
                cg.add(curb);
            });

            // Stately Castle Stone Railings with Gold Trim
            [-3.7, 3.7].forEach((railX, idx) => {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 53.8), matCastle);
                rail.position.set(railX, bridgeCenterY + 0.95, bridgeCenterZ);
                rail.rotation.x = bridgeSlopeAng;
                cg.add(rail);

                const railCap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 53.8), matGoldTrim);
                railCap.position.set(railX, bridgeCenterY + 1.62, bridgeCenterZ);
                railCap.rotation.x = bridgeSlopeAng;
                cg.add(railCap);
            });

            // Bridge Side Railing Colliders (Left & Right safety barriers: Y = 0 to 8.5m)
            addBoxCollider(-110 - 3.7, 68.25, 0.8, 53.5, 0, 8.5);
            addBoxCollider(-110 + 3.7, 68.25, 0.8, 53.5, 0, 8.5);

            // Bridge Lantern Pylons every 14m along the ramp
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
                });
            }

            // Grand Moonstone Portal Pillars at Castle Bridge Entrance (connecting seamlessly to Crystal Highway!)
            [-4.6, 4.6].forEach((px, idx) => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 7.5, 12), matCastle);
                pillar.position.set(px, 3.75, -78.5); // Local Z = -78.5 corresponds to World Z = 41.5
                cg.add(pillar);

                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 10, 24, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(px, 7.8, -78.5);
                crescent.rotation.z = (idx === 0 ? 0.35 : -0.35);
                cg.add(crescent);

                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);

                // Entrance pillar colliders with generous 7.4m clear central passage
                addCylinderCollider(-110 + px, 41.5, 0.9, 0, 8.5);
            });"""

assert old_bridge_part in content, "old_bridge_part not found"
content = content.replace(old_bridge_part, new_bridge_part, 1)

# 4. Fix movement loop: replace unstable lerp with unconditionally stable exponential damping and strict safety clamps
old_physics_loop = """                // =========================================================
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

new_physics_loop = """                // =========================================================
                // UNCONDITIONALLY STABLE TERRAIN & RAMP ELEVATION ENGINE
                // (Framerate-independent exponential damping - NEVER overshoots, oscillates or launches)
                // =========================================================
                const targetGroundY = getGroundElevation(playerGroup.position.x, playerGroup.position.z, playerGroup.position.y);
                const safeDt = Math.min(delta, 0.05);
                const groundDamp = 1.0 - Math.exp(-24.0 * safeDt);
                currentGroundY += (targetGroundY - currentGroundY) * groundDamp;

                // Precision snap when close
                if (Math.abs(currentGroundY - targetGroundY) < 0.003) {
                    currentGroundY = targetGroundY;
                }

                // Strict vertical velocity limiter to prevent any anomalous spikes
                const maxStepDelta = 12.0 * safeDt;
                if (currentGroundY > targetGroundY + maxStepDelta) {
                    currentGroundY = targetGroundY + maxStepDelta;
                } else if (currentGroundY < targetGroundY - maxStepDelta) {
                    currentGroundY = targetGroundY - maxStepDelta;
                }

                // Physical safety guard: never penetrate below moon surface floor
                if (currentGroundY < 0.0) currentGroundY = 0.0;

                // Jump Physics (Cute bouncy hop for 5x smaller character)
                if (keys.jump && isGrounded) {
                    jumpVelocityY = 5.4;
                    isGrounded = false;
                    keys.jump = false;
                }

                if (!isGrounded) {
                    jumpVelocityY += gravity * safeDt;
                    jumpY += jumpVelocityY * safeDt;
                    if (jumpY <= 0) {
                        jumpY = 0;
                        jumpVelocityY = 0;
                        isGrounded = true;
                        // Immediate solid ground landing on top of obstacles/steps
                        currentGroundY = targetGroundY;
                    }"""

assert old_physics_loop in content, "old_physics_loop not found"
content = content.replace(old_physics_loop, new_physics_loop, 1)

# Also stabilize player rotation lerp
old_rot = "playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, 14 * delta);"
new_rot = "playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, 1.0 - Math.exp(-14.0 * safeDt));"
if old_rot in content:
    content = content.replace(old_rot, new_rot, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully applied crystal road & castle bridge fixes!")
