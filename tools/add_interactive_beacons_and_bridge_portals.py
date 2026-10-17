import os
import sys

INDEX_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\demo\index.html"

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

is_crlf = '\r\n' in content
content = content.replace('\r\n', '\n')

replacements = []

# 1. Add Grand Moonstone Portal Pillars at Castle Bridge Entrance (Z = 42, X = -110)
old_bridge_entrance = """            const railR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
            railR.position.set(3.4, 4.2, -51);
            railR.rotation.x = -0.11;
            cg.add(railR);
            addBoxCollider(-110 + 3.4, 120 - 51, 1.0, 55, 0, 7.5);"""

new_bridge_entrance = """            const railR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 55), matCastle);
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
replacements.append(("Castle Bridge Portal Pillars", old_bridge_entrance, new_bridge_entrance))

# 2. Add Floating 3D Holographic Interaction Beacons for all interactables
old_landmarks_end = """        // Spawn around landmarks
        landmarksData.forEach(lm => {
            for(let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                spawnMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });"""

new_landmarks_end = """        // Spawn around landmarks
        landmarksData.forEach(lm => {
            for(let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                spawnMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });

        // =====================================================================
        // FLOATING 3D HOLOGRAPHIC INTERACTION BEACONS (FOR ALL LANDMARKS)
        // =====================================================================
        const beaconGroups = [];
        interactables.forEach((item, idx) => {
            const bg = new THREE.Group();

            // Glowing Torus Rune Ring
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.4, 0.12, 12, 28),
                new THREE.MeshStandardMaterial({
                    color: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    emissive: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    emissiveIntensity: 2.2,
                    roughness: 0.1
                })
            );
            ring.rotation.x = Math.PI / 2;
            bg.add(ring);

            // Floating rotating star diamond glyph
            const diamond = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.55, 0),
                new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 2.4
                })
            );
            bg.add(diamond);

            // Vertical downward starlight beam
            const beam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.35, 2.6, 8),
                new THREE.MeshBasicMaterial({
                    color: (idx % 2 === 0 ? 0x00f5d4 : 0xa855f7),
                    transparent: true,
                    opacity: 0.35
                })
            );
            beam.position.y = -1.3;
            bg.add(beam);

            bg.position.set(item.pos.x, item.pos.y + 2.8, item.pos.z);
            scene.add(bg);
            beaconGroups.push({ group: bg, ring, diamond, item, baseY: item.pos.y + 2.8 });
        });"""
replacements.append(("Floating Holographic Beacons", old_landmarks_end, new_landmarks_end))

# 3. Animate beacons in animate()
old_anim_beacon_hook = """                checkInteractables();
                updateMinimap(playerGroup.position.x, playerGroup.position.z, playerGroup.rotation.y);"""

new_anim_beacon_hook = """                checkInteractables();
                updateMinimap(playerGroup.position.x, playerGroup.position.z, playerGroup.rotation.y);

                // Animate floating holographic 3D interaction beacons
                beaconGroups.forEach((b, idx) => {
                    b.group.position.y = b.baseY + Math.sin(time * 2.2 + idx) * 0.25;
                    b.ring.rotation.z += 0.025;
                    b.diamond.rotation.y += 0.04;
                    b.diamond.rotation.x += 0.02;

                    // Proximity pulse when player is nearby
                    const pDist = Math.hypot(playerGroup.position.x - b.item.pos.x, playerGroup.position.z - b.item.pos.z);
                    if (pDist <= b.item.radius) {
                        b.diamond.scale.setScalar(1.35 + Math.sin(time * 7.0) * 0.2);
                        b.ring.scale.setScalar(1.2 + Math.sin(time * 5.0) * 0.1);
                    } else {
                        b.diamond.scale.setScalar(1.0);
                        b.ring.scale.setScalar(1.0);
                    }
                });"""
replacements.append(("Animate Beacons Hook", old_anim_beacon_hook, new_anim_beacon_hook))

# Verify all needles first
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

for name, old_str, new_str in replacements:
    old_norm = old_str.replace('\r\n', '\n')
    new_norm = new_str.replace('\r\n', '\n')
    content = content.replace(old_norm, new_norm, 1)
    print(f"Applied: {name}")

if is_crlf:
    content = content.replace('\n', '\r\n')

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESS: All Interactive Beacons and Portal Pillars added to demo/index.html!")
