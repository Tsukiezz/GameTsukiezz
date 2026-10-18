import os

html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

old_flora = """        // 10. CỎ BIẾN DỊ DẠ QUANG (MUTANT ALIEN FLORA)
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
        });"""

new_flora = """        // 10. CỎ BIẾN DỊ DẠ QUANG (HIGH-PERFORMANCE GPU INSTANCED MUTANT FLORA)
        // Optimizes 1,380 individual meshes down into 3 ultra-fast GPU InstancedMeshes!
        const matGreenGlow = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 2.2, roughness: 0.2 });
        const floraColors = [matCyanGlow, matPurpleGlow, matGreenGlow];

        const floraBladeBins = [[], [], []]; // 0: Cyan, 1: Purple, 2: Green
        const floraSporeBins = [[], [], []];

        const dummyFlora = new THREE.Object3D();

        function queueMutantClump(gx, gz, scale = 1.0) {
            const colorIdx = Math.floor(Math.random() * 3);
            const bladeCount = 8;

            for (let b = 0; b < bladeCount; b++) {
                const bAng = b * (Math.PI * 2 / bladeCount) + (Math.random() - 0.5) * 0.4;
                const h = (1.2 + Math.random() * 1.4) * scale;
                const bx = gx + Math.cos(bAng) * 0.35 * scale;
                const bz = gz + Math.sin(bAng) * 0.35 * scale;

                dummyFlora.position.set(bx, h / 2, bz);
                dummyFlora.rotation.set(Math.cos(bAng) * 0.35, Math.random() * Math.PI, Math.sin(bAng) * 0.35);
                dummyFlora.scale.set(scale, h / 1.8, scale);
                dummyFlora.updateMatrix();
                floraBladeBins[colorIdx].push(dummyFlora.matrix.clone());
            }

            // Spore
            dummyFlora.position.set(gx, 0.75 * scale, gz);
            dummyFlora.rotation.set(0, 0, 0);
            dummyFlora.scale.set(scale, scale, scale);
            dummyFlora.updateMatrix();
            floraSporeBins[colorIdx].push(dummyFlora.matrix.clone());
        }

        // Collect along road network
        [
            [-110, 120], [115, 110], [-145, -35], [-45, -115],
            [145, 30], [125, -110], [-120, -125]
        ].forEach(([tx, tz]) => {
            for (let s = 1; s <= 12; s++) {
                const ratio = s / 13;
                const rx = tx * ratio + (Math.random() - 0.5) * 6.5;
                const rz = tz * ratio + (Math.random() - 0.5) * 6.5;
                queueMutantClump(rx, rz, 0.8 + Math.random() * 0.6);
            }
        });

        // Collect around landmarks
        landmarksData.forEach(lm => {
            for (let c = 0; c < 6; c++) {
                const ang = c * (Math.PI * 2 / 6) + Math.random();
                const dist = 16 + Math.random() * 12;
                queueMutantClump(lm.x + Math.cos(ang) * dist, lm.z + Math.sin(ang) * dist, 1.0 + Math.random() * 0.5);
            }
        });

        // Instantiate unified GPU InstancedMeshes
        const baseFloraBladeGeo = new THREE.ConeGeometry(0.08, 1.8, 4);
        const baseFloraSporeGeo = new THREE.IcosahedronGeometry(0.22, 1);

        for (let col = 0; col < 3; col++) {
            const blades = floraBladeBins[col];
            if (blades.length > 0) {
                const instBlades = new THREE.InstancedMesh(baseFloraBladeGeo, floraColors[col], blades.length);
                instBlades.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                for (let i = 0; i < blades.length; i++) {
                    instBlades.setMatrixAt(i, blades[i]);
                }
                instBlades.instanceMatrix.needsUpdate = true;
                instBlades.matrixAutoUpdate = false;
                scene.add(instBlades);
            }

            const spores = floraSporeBins[col];
            if (spores.length > 0) {
                const instSpores = new THREE.InstancedMesh(baseFloraSporeGeo, floraColors[col], spores.length);
                instSpores.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                for (let i = 0; i < spores.length; i++) {
                    instSpores.setMatrixAt(i, spores[i]);
                }
                instSpores.instanceMatrix.needsUpdate = true;
                instSpores.matrixAutoUpdate = false;
                scene.add(instSpores);
            }
        }"""

assert old_flora in content, "old_flora not found"
content = content.replace(old_flora, new_flora, 1)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully applied flora GPU instancing!")
