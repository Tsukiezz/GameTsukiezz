        function buildCastle3D() {
            const cg = new THREE.Group();
            cg.name = 'RoyalCastle';
            const castleColliderStart = colliders.length;
            function floorPlate(name, x, z, width, depth, y, material, thickness = 0.4) {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), material);
                mesh.name = name;
                mesh.userData.cameraSolid = true;
                mesh.position.set(x, y - thickness / 2, z);
                mesh.receiveShadow = true;
                cg.add(mesh);
                castleSurfaces.push({ name, minX: x - 110 - width / 2, maxX: x - 110 + width / 2,
                    minZ: z + 120 - depth / 2, maxZ: z + 120 + depth / 2, y });
                addBoxCollider(x - 110, z + 120, width, depth, y - thickness, y, true);
                colliders[colliders.length - 1].stepHeight = MAX_STEP_HEIGHT;
                colliders[colliders.length - 1].name = name;
                return mesh;
            }
            function solidBox(name, x, y, z, width, height, depth, material) {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
                mesh.name = name;
                mesh.userData.cameraSolid = true;
                mesh.position.set(x, y, z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                cg.add(mesh);
                addBoxCollider(x - 110, z + 120, width, depth, y - height / 2, y + height / 2);
                colliders[colliders.length-1].name=name;
                return mesh;
            }
            const flights = [];
            function staircase(name, x, z0, z1, width, bottom, top, count) {
                if (window.CASTLE_EXTENSION?.version >= 5 && name !== 'throne-dais') return;
                const run = (z1 - z0) / count, rise = (top - bottom) / count;
                flights.push({ name, x: x - 110, z0: z0 + 120, z1: z1 + 120, bottom, top, count });
                for (let i = 0; i < count; i++) {
                    const y = bottom + rise * (i + 1), z = z0 + run * (i + 0.5);
                    floorPlate(name + '-tread-' + i, x, z, width, Math.abs(run) + 0.002, y, matCastle, y - bottom + 0.15);
                    const nosing = new THREE.Mesh(new THREE.BoxGeometry(width, 0.035, 0.055), matGoldTrim);
                    nosing.position.set(x, y + 0.018, z - run / 2);
                    cg.add(nosing);
                }
                // Continuous sloped handrails with evenly spaced stone balusters.
                for (const side of [-1, 1]) {
                    const railX = x + side * (width / 2 + 0.12);
                    castleStairGuards.push({ x: railX - 110, z0: z0 + 120, z1: z1 + 120, bottom, top });
                    const length = Math.hypot(z1 - z0, top - bottom);
                    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, length), matGoldTrim);
                    rail.position.set(railX, (bottom + top) / 2 + 0.38, (z0 + z1) / 2);
                    rail.rotation.x = -Math.atan((top - bottom) / (z1 - z0));
                    cg.add(rail);
                    for (let i = 0; i <= count; i += 2) {
                        const t = i / count;
                        const postY = bottom + (top - bottom) * t;
                        solidBox(name + '-baluster', railX, postY + 0.19, z0 + (z1 - z0) * t,
                            0.12, 0.38, 0.12, matCastle);
                    }
                }
            }

            // Materials (Enhanced with DoubleSide to eliminate all backface culling & see-through graphics bugs)
            const matCastle = new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.8, metalness: 0.15, side: THREE.DoubleSide });
            const matDarkBase = new THREE.MeshStandardMaterial({ color: 0x131824, roughness: 0.9, side: THREE.DoubleSide });
            const matRoof = new THREE.MeshStandardMaterial({ color: 0x24123c, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide });
            const matMarble = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });
            const matGoldTrim = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85, side: THREE.DoubleSide });
            const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8, side: THREE.DoubleSide });
            const matVelvetRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7, side: THREE.DoubleSide });
            const matVelvetPurple = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.5, side: THREE.DoubleSide });
            const matIronBars = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
            const matTimber = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.85, side: THREE.DoubleSide });
            const matOrangeGlow = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2.8 });

            // Local stone and marble patterns remain available without extra downloads.
            function masonryTexture(marble) {
                const tile = document.createElement('canvas'); tile.width = tile.height = 256;
                const ctx = tile.getContext('2d');
                ctx.fillStyle = marble ? '#c5c7ce' : '#969ca6'; ctx.fillRect(0, 0, 256, 256);
                ctx.strokeStyle = marble ? '#969ba5' : '#7b8390'; ctx.lineWidth = 1;
                for (let row = 0; row <= 4; row++) {
                    ctx.beginPath(); ctx.moveTo(0, row * 64); ctx.lineTo(256, row * 64); ctx.stroke();
                    for (let col = 0; col < 4; col++) {
                        const x = col * 80 + (row % 2) * 40;
                        ctx.beginPath(); ctx.moveTo(x, row * 64); ctx.lineTo(x, row * 64 + 64); ctx.stroke();
                    }
                }
                const texture = new THREE.CanvasTexture(tile);
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(marble ? 6 : 3, marble ? 6 : 3);
                texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
                return texture;
            }
            matCastle.map = masonryTexture(false);
            matMarble.map = masonryTexture(true);

            // Base Mesa Platform Foundation (Hollow Interior: Underground Bunker & Dungeon at Y=1.0m to 5.8m)
            // 1. Bedrock Foundation Slab under basement floor (Y = 0 to 1.0m)
            const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(52, 1.0, 56), matDarkBase);
            baseFloor.position.y = 0.5;
            baseFloor.receiveShadow = true;
            cg.add(baseFloor);

            // 2. Thick Exterior Foundation Mesa Cliff Walls (Y = 1.0 to 6.0m, Height = 5.0m, Center Y = 3.5m)
            // Left Foundation Wall (West: X = -22.5, Width = 7m)
            const baseWallW = new THREE.Mesh(new THREE.BoxGeometry(7.0, 7.0, 56), matDarkBase);
            baseWallW.position.set(-22.5, 2.5, 0);
            cg.add(baseWallW);

            // Right Foundation Wall (East: X = 22.5, Width = 7m)
            const baseWallE = new THREE.Mesh(new THREE.BoxGeometry(7.0, 7.0, 56), matDarkBase);
            baseWallE.position.set(22.5, 2.5, 0);
            cg.add(baseWallE);

            // Back Foundation Wall (North: Z = 24.5, Depth = 7m)
            const baseWallN = new THREE.Mesh(new THREE.BoxGeometry(38.0, 7.0, 7.0), matDarkBase);
            baseWallN.position.set(0, 2.5, 24.5);
            cg.add(baseWallN);

            // Front Foundation Walls left & right of Grand Bridge Ramp (South: Z = -24.5)
            const baseWallSL = new THREE.Mesh(new THREE.BoxGeometry(16.0, 7.0, 7.0), matDarkBase);
            baseWallSL.position.set(-13.0, 2.5, -24.5);
            cg.add(baseWallSL);

            const baseWallSR = new THREE.Mesh(new THREE.BoxGeometry(16.0, 7.0, 7.0), matDarkBase);
            baseWallSR.position.set(13.0, 2.5, -24.5);
            cg.add(baseWallSR);

            // Center Foundation Ramp Support under Grand Bridge Ramp (X = [-5, 5])
            const baseWallSC = new THREE.Mesh(new THREE.BoxGeometry(10.0, 7.0, 7.0), matDarkBase);
            baseWallSC.position.set(0, 2.5, -24.5);
            cg.add(baseWallSC);

            // 4 Colossal Corner Gothic Spire Towers (Height: 48m, World X/Z at (+/-21, +/-23))
            [[-21, -23], [21, -23], [-21, 23], [21, 23]].forEach(([tx, tz], idx) => {
                const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 38, 16), matCastle);
                tower.position.set(tx, 22, tz);
                tower.userData.cameraSolid = true;
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

                // Register spire gem animation
                castleAnimators.push({
                    type: 'spireGem',
                    mesh: gem,
                    baseY: 56,
                    speed: 1.2 + idx * 0.3
                });

                // Add Point Light atop each spire
                const spLt = new THREE.PointLight((idx % 2 === 0 ? 0x00f5d4 : 0xa855f7), 1.5, 30);
                spLt.position.set(tx, 56, tz);
                cg.add(spLt);
                registerDynamicLight(spLt, 120);

                addCylinderCollider(-110 + tx, 120 + tz, 4.8, 0, 50);
            });

            // =================================================================
            // OUTER CASTLE WALLS ACROSS ALL FLOORS (SOLID, CANNOT BE PENETRATED)
            // Left Wall (X = -21, World -131, Z in [97, 143])
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 26, 46), matCastle);
            w1.position.set(-21, 16, 0); cg.add(w1);
            addBoxCollider(-110 - 21, 120, 2.8, 46.5, 0, 32);

            // Right Wall (X = 21, World -89, Z in [97, 143])
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 26, 46), matCastle);
            w2.position.set(21, 16, 0); cg.add(w2);
            addBoxCollider(-110 + 21, 120, 2.8, 46.5, 0, 32);

            // Back Wall (Z = 23, World 143, X in [-131, -89])
            const w3 = new THREE.Mesh(new THREE.BoxGeometry(44, 26, 2.5), matCastle);
            w3.position.set(0, 16, 23); cg.add(w3);
            addBoxCollider(-110, 120 + 23, 44.5, 2.8, 0, 32);

            // Front Balustrades left & right of Grand Bridge Gate (Fl.1 gate open at X=[-114.5, -105.5])
            const fwL = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwL.position.set(-13, 12, -26); cg.add(fwL);
            addBoxCollider(-110 - 13, 120 - 26, 19, 2.5, 5, 19);

            const fwR = new THREE.Mesh(new THREE.BoxGeometry(19, 14, 2.5), matCastle);
            fwR.position.set(13, 12, -26); cg.add(fwR);
            addBoxCollider(-110 + 13, 120 - 26, 19, 2.5, 5, 19);

            // Front Grand Arch Portal Gate (Tầng 1)
            const gateArch = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.7, 12, 16, Math.PI), matGoldTrim);
            gateArch.position.set(0, 11.5, -26);
            cg.add(gateArch);

            // MÁI CHE VÒM CỔNG CHÍNH TẦNG 1 (GRAND GATE ENTRANCE CANOPY ROOF at Y=11.8m)
            const gatePorchRoof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.6, 3.2), matRoof);
            gatePorchRoof.position.set(0, 12.0, -27.6);
            cg.add(gatePorchRoof);

            const gatePorchTrim = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.2, 3.4), matGoldTrim);
            gatePorchTrim.position.set(0, 12.35, -27.6);
            cg.add(gatePorchTrim);

            // =================================================================
            // BAN CÔNG HOÀNG GIA TẦNG 2 & MÁI CHE VÒM GOTHIC (Y = 13.0m to 17.8m)
            // [Vươn ra phía trước che chở cổng chính và ngắm toàn cảnh Đại Lộ Pha Lê & Cầu Dẫn]
            // =================================================================
            // 1. Sàn Ban Công Cẩm Thạch Dày (Local Z = -26 to -31, Width = 16m)
            const fl2BalconyFloor = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.6, 5.2), matMarble);
            fl2BalconyFloor.position.set(0, 12.7, -28.6);
            fl2BalconyFloor.receiveShadow = true;
            cg.add(fl2BalconyFloor);

            // 4 Con bọ đỡ ban công Gothic uốn lượn bên dưới (Console Corbels)
            [-6, -2, 2, 6].forEach(cx => {
                const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.8, 4.2), matCastle);
                corbel.position.set(cx, 10.6, -28.1);
                corbel.rotation.x = -0.35;
                cg.add(corbel);
            });

            // 2. Lan Can Mạ Vàng Hoàng Gia 3 Mặt Ban Công (Cao 1.3m bảo vệ an toàn tuyệt đối)
            // Lan can mặt trước (Z = -31.1)
            const fl2RailF = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.42, 0.12), matGoldTrim);
            fl2RailF.position.set(0, 13.21, -31.1);
            cg.add(fl2RailF);
            addBoxCollider(-110, 120 - 31.1, 16.2, 0.8, 12.98, 13.42);

            // Lan can cánh trái (X = -7.9)
            const fl2RailL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 5.2), matGoldTrim);
            fl2RailL.position.set(-7.9, 13.21, -28.6);
            cg.add(fl2RailL);
            addBoxCollider(-110 - 7.9, 120 - 28.6, 0.8, 5.4, 12.98, 13.42);

            // Lan can cánh phải (X = 7.9)
            const fl2RailR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 5.2), matGoldTrim);
            fl2RailR.position.set(7.9, 13.21, -28.6);
            cg.add(fl2RailR);
            addBoxCollider(-110 + 7.9, 120 - 28.6, 0.8, 5.4, 12.98, 13.42);

            // 4 Trụ đá góc ban công gắn tinh thể dạ quang
            [[-7.9, -31.1], [7.9, -31.1], [-7.9, -26.2], [7.9, -26.2]].forEach(([px, pz], pIdx) => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.42, 12), matCastle);
                post.position.set(px, 13.21, pz);
                cg.add(post);

                const pGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), (pIdx % 2 === 0 ? matCyanGlow : matPurpleGlow));
                pGem.position.set(px, 13.47, pz);
                cg.add(pGem);
            });

            // 3. MÁI CHE BAN CÔNG HOÀNG GIA (ROYAL CANOPY ROOF at Y=17.5m)
            // 2 Cột trụ Gothic đá cẩm thạch đỡ phía trước
            const fl2ColL = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.4, 16), matCastle);
            fl2ColL.position.set(-7.2, 15.2, -30.6);
            cg.add(fl2ColL);
            addCylinderCollider(-110 - 7.2, 120 - 30.6, 0.5, 12.8, 17.5);

            const fl2ColR = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.4, 16), matCastle);
            fl2ColR.position.set(7.2, 15.2, -30.6);
            cg.add(fl2ColR);
            addCylinderCollider(-110 + 7.2, 120 - 30.6, 0.5, 12.8, 17.5);

            // Mái che dốc ngói tím viền vàng che chắn toàn bộ ban công
            const fl2CanopyRoof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.8, 5.8), matRoof);
            fl2CanopyRoof.position.set(0, 17.6, -28.6);
            cg.add(fl2CanopyRoof);

            const fl2CanopyRidge = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.3, 0.6), matGoldTrim);
            fl2CanopyRidge.position.set(0, 18.1, -26.0);
            cg.add(fl2CanopyRidge);

            // Đèn lồng hoàng gia treo giữa mái che ban công
            const fl2Lantern = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matCyanGlow);
            fl2Lantern.position.set(0, 16.6, -28.6);
            cg.add(fl2Lantern);

            const fl2BalconyLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
            fl2BalconyLight.position.set(0, 16.5, -28.6);
            cg.add(fl2BalconyLight);
            registerDynamicLight(fl2BalconyLight, 85);

            // Đăng ký bề mặt sàn ban công Tầng 2 đứng được vững vàng (Y = 13.0m)
            addBoxCollider(-110, 120 - 28.6, 16.2, 5.4, 12.4, 13.0, true);

            // =================================================================
            // LEVEL 0: TẦNG HẦM - HẦM TRÚ ẨN BÍ MẬT & HẦM NGỤC HOÀNG GIA (Y = 1.0m)
            // =================================================================
            // Sàn đá phiến dày chịu lực của Tầng Hầm (Y = 1.02m)
            const dungeonFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 42), new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.95 }));
            dungeonFloor.rotation.x = -Math.PI / 2;
            dungeonFloor.position.set(0, 1.02, 0);
            cg.add(dungeonFloor);

            // Trần đá vòm kiên cố ngăn cách với Tầng 1 (Chừa khoảng mở cầu thang Tây Bắc tại X=[-19, -14], Z=[-22, -10])
            const dungeonCeilMain = new THREE.Mesh(new THREE.PlaneGeometry(33, 42), matDarkBase);
            dungeonCeilMain.rotation.x = Math.PI / 2;
            dungeonCeilMain.position.set(2.5, 5.8, 0);
            cg.add(dungeonCeilMain);

            const dungeonCeilSW = new THREE.Mesh(new THREE.PlaneGeometry(5, 28.5), matDarkBase);
            dungeonCeilSW.rotation.x = Math.PI / 2;
            dungeonCeilSW.position.set(-16.5, 5.8, 6.75);
            cg.add(dungeonCeilSW);

            // 4 Bức tường bao quanh kín mít của Tầng Hầm (Y = 1.0 đến 5.8m)
            addBoxCollider(-110 - 19, 120, 1.2, 42, 0.8, 5.8); // West wall
            addBoxCollider(-110 + 19, 120, 1.2, 42, 0.8, 5.8); // East wall
            addBoxCollider(-110, 120 + 21, 38, 1.2, 0.8, 5.8); // North wall
            addBoxCollider(-110, 120 - 21, 38, 1.2, 0.8, 5.8); // South wall

            // --- KHU TRÚ ẨN BÍ MẬT HOÀNG GIA (ROYAL SECRET SHELTER & SURVIVAL BUNKER) ---
            // Tường ngăn cách kiên cố giữa Khu Trú Ẩn và Hầm Mộ (có vòm cửa đi qua)
            const shelterWallW = solidBox('shelter-partition-south',-2,3.4,-15.1,.8,4.8,5.8,matCastle);
            solidBox('shelter-partition-north',-2,3.4,-4.9,.8,4.8,5.8,matCastle);
            solidBox('shelter-door-lintel',-2,5.2,-10,.8,1.2,4.4,matCastle);

            // 1. Giường Trú Ẩn Khẩn Cấp (Royal Survival Bunk Bed)
            function beginHeroFurniture(x,y,z,scale=.525){return {anchor:new THREE.Vector3(x,y,z),scale,objects:new Set(cg.children),colliderStart:colliders.length,animatorStart:castleAnimators.length};}
            function finishHeroFurniture(state){
                const {anchor,scale}=state;
                for(const o of cg.children)if(!state.objects.has(o)){o.position.sub(anchor).multiplyScalar(scale).add(anchor);o.scale.multiplyScalar(scale);o.userData.heroFurnitureScale=scale;if(o.isPointLight)o.distance*=scale;}
                const wx=anchor.x-110,wz=anchor.z+120;
                for(const c of colliders.slice(state.colliderStart)){
                    if(c.type==='box'){c.minX=wx+(c.minX-wx)*scale;c.maxX=wx+(c.maxX-wx)*scale;c.minZ=wz+(c.minZ-wz)*scale;c.maxZ=wz+(c.maxZ-wz)*scale;}
                    c.minY=anchor.y+(c.minY-anchor.y)*scale;c.maxY=anchor.y+(c.maxY-anchor.y)*scale;c.heroFurnitureScale=scale;
                }
                for(const a of castleAnimators.slice(state.animatorStart)){
                    if(a.baseY!==undefined)a.baseY=anchor.y+(a.baseY-anchor.y)*scale;
                    if(a.centerX!==undefined)a.centerX=anchor.x+(a.centerX-anchor.x)*scale;
                    if(a.centerZ!==undefined)a.centerZ=anchor.z+(a.centerZ-anchor.z)*scale;
                    a.furnitureScale=scale;
                }
            }
            const heroBed=beginHeroFurniture(-8,1,-16);
            const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 1.8), matWoodDark);
            bedFrame.position.set(-8, 1.35, -16);
            cg.add(bedFrame);

            const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.6), matVelvetRed);
            mattress.position.set(-8, 1.7, -16);
            cg.add(mattress);

            const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 1.3), matGoldTrim);
            pillow.position.set(-9.0, 1.9, -16);
            cg.add(pillow);

            // Bàn đầu giường và đèn dầu ma thuật
            const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), matWoodDark);
            nightstand.position.set(-11, 1.5, -16);
            cg.add(nightstand);

            const nightLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), matGoldTrim);
            nightLamp.position.set(-11, 2.2, -16);
            cg.add(nightLamp);

            const nightGlow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), matCyanGlow);
            nightGlow.position.set(-11, 2.5, -16);
            cg.add(nightGlow);

            // Standable & Sit-on-able bed collider (Y = 1.88m)
            addBoxCollider(-110 - 8, 120 - 16, 2.7, 1.9, 0.8, 1.88, true);
            addBoxCollider(-110 - 11, 120 - 16, 1.0, 1.0, 0.8, 2.0, true);

            // 2. Lò Sưởi Đá Âm Tường (Shelter Hearth & Fireplace)
            finishHeroFurniture(heroBed);
            const heroHearth=beginHeroFurniture(-18,1,-4);
            const hearthStone = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 3.8), matCastle);
            hearthStone.position.set(-18, 2.7, -4);
            cg.add(hearthStone);

            // Hốc lò sưởi
            const hearthHole = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 2.4), matDarkBase);
            hearthHole.position.set(-17.6, 2.0, -4);
            cg.add(hearthHole);

            // Củi gỗ đang cháy
            const logs = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8), matWoodDark);
            logs.rotation.z = Math.PI / 2;
            logs.position.set(-17.4, 1.3, -4);
            cg.add(logs);

            // Ngọn lửa lò sưởi ma thuật rực rỡ
            const hearthFlame = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), matOrangeGlow);
            hearthFlame.position.set(-17.2, 1.75, -4);
            cg.add(hearthFlame);

            const hearthLight = new THREE.PointLight(0xff6600, 3.2, 18);
            hearthLight.position.set(-16.8, 2.0, -4);
            cg.add(hearthLight);
            registerDynamicLight(hearthLight, 75);

            // Register hearth fire animation
            castleAnimators.push({
                type: 'hearthFire',
                mesh: hearthFlame,
                light: hearthLight,
                baseIntensity: 3.2,
                baseY: 1.75
            });

            // Hearth solid collider (Chặn không cho đi xuyên vào vách lò sưởi)
            addBoxCollider(-110 - 18, 120 - 4, 2.2, 4.0, 0.8, 4.5);

            // 3. Bàn Sa Bàn Tác Chiến Hoàng Gia (Command Strategy War Table)
            finishHeroFurniture(heroHearth);
            const heroStrategy=beginHeroFurniture(-6,1,0);
            const stratTable = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 2.6), matCastle);
            stratTable.position.set(-6, 1.45, 0);
            cg.add(stratTable);

            // Bản đồ nổi phù điêu dạ quang
            const stratMap = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.0), matCyanGlow);
            stratMap.rotation.x = -Math.PI / 2;
            stratMap.position.set(-6, 1.92, 0);
            cg.add(stratMap);

            // 3 Tinh Thể Chiến Lược Lơ Lửng Xoay Quanh Sa Bàn
            const stratCrystals = [];
            [0x00f5d4, 0xff0055, 0xa855f7].forEach((col, cIdx) => {
                const cMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.5 });
                const crys = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), cMat);
                crys.position.set(-6, 2.4, 0);
                cg.add(crys);
                stratCrystals.push({ mesh: crys, offset: cIdx * (Math.PI * 2 / 3) });
            });
            castleAnimators.push({
                type: 'strategyCrystals',
                items: stratCrystals,
                centerX: -6,
                centerZ: 0,
                baseY: 2.35
            });

            // 2 Ghế đá chỉ huy ở 2 bên sa bàn (Ngồi được)
            [-1.8, 1.8].forEach(sideZ => {
                const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matCastle);
                chair.position.set(-6, 1.4, sideZ);
                cg.add(chair);
                addBoxCollider(-110 - 6, 120 + sideZ, 0.9, 0.9, 0.8, 1.8, true);
            });
            // Standable strategy table top (Y = 1.95m)
            addBoxCollider(-110 - 6, 120, 4.4, 2.8, 0.8, 1.95, true);

            // 4. Bàn Giả Kim Thuật & Nghiên Cứu Sinh Tồn (Alchemy Station)
            finishHeroFurniture(heroStrategy);
            const heroAlchemy=beginHeroFurniture(-6,1,8);
            const alchTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.6), matWoodDark);
            alchTable.position.set(-6, 1.45, 8);
            cg.add(alchTable);

            // 4 Bình thuốc giả kim dạ quang
            [matCyanGlow, matPurpleGlow, matGreenGlow, matOrangeGlow].forEach((pMat, pIdx) => {
                const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.5, 8), pMat);
                bottle.position.set(-7.2 + pIdx * 0.75, 2.15, 8);
                cg.add(bottle);
            });
            // Standable alchemy table top (Y = 1.95m)
            addBoxCollider(-110 - 6, 120 + 8, 3.8, 1.8, 0.8, 1.95, true);

            // Thảm Lông Sưởi Ấm Trước Lò Sưởi Hoàng Gia (Sittable Warmth Rug)
            finishHeroFurniture(heroAlchemy);
            const hearthRug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), matVelvetPurple);
            hearthRug.rotation.x = -Math.PI / 2;
            hearthRug.position.set(-15.0, 1.04, -6);
            cg.add(hearthRug);

            // Cửa Thép Trọng Lực Kiên Cố Của Hầm Trú Ẩn (Heavy Armored Blast Vault Door)
            // Cánh cửa vòm thép tròn có vô-lăng khóa bánh răng vàng
            const vaultFrame = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 12, 24), matIronBars);
            vaultFrame.position.set(-2.0, 2.8, -10);
            vaultFrame.rotation.y=Math.PI/2;
            cg.add(vaultFrame);

            const vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 16), matGoldTrim);
            vaultWheel.position.set(-2.0, 2.8, -10);
            vaultWheel.rotation.y=Math.PI/2;
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

            // 5. Cụm Thùng Gỗ Lương Thảo & Rượu Tiếp Tế Sinh Tồn
            // 3 thùng dưới, 2 thùng trên xếp chồng
            [[-16, -14], [-14.5, -14], [-16, -12.5]].forEach(([bx, bz]) => {
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.3, 10), matWoodDark);
                barrel.position.set(bx, 1.65, bz);
                cg.add(barrel);
            });
            const topBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 1.2, 10), matWoodDark);
            topBarrel.position.set(-15.2, 2.8, -13.2);
            cg.add(topBarrel);

            // Rương quân lương
            const rationBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.2), matWoodDark);
            rationBox.position.set(-16, 1.55, 16);
            cg.add(rationBox);

            // Standable barrels & ration box colliders (Có thể nhảy lên nắp thùng!)
            addBoxCollider(-110 - 15.2, 120 - 13.5, 2.8, 2.8, 0.8, 2.3, true);
            addBoxCollider(-110 - 16, 120 + 16, 1.8, 1.4, 0.8, 2.1, true);

            // --- KHU HẦM MỘ KỴ SĨ MẶT TRĂNG CỔ ĐẠI (NORTH CRYPT) ---
            const sarcoBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 2.5), matCastle);
            sarcoBase.position.set(6, 1.6, 12);
            cg.add(sarcoBase);

            const sarcoLid = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 2.7), matGoldTrim);
            sarcoLid.position.set(6, 2.3, 12);
            cg.add(sarcoLid);

            const sarcoRune = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 8, 24), matPurpleGlow);
            sarcoRune.rotation.x = Math.PI / 2;
            sarcoRune.position.set(6, 2.52, 12);
            cg.add(sarcoRune);

            const sarcoLight = new THREE.PointLight(0xa855f7, 2.4, 15);
            sarcoLight.position.set(6, 3.2, 12);
            cg.add(sarcoLight);
            registerDynamicLight(sarcoLight, 75);

            // Standable Sarcophagus lid top (Y = 2.5m)
            addBoxCollider(-110 + 6, 120 + 12, 4.6, 2.8, 0.8, 2.55, true);

            castleAnimators.push({
                type: 'sarcoRune',
                mesh: sarcoRune
            });

            // --- KHU KHO BÁU HOÀNG GIA & CỔNG THOÁT HIỂM (EAST WING) ---
            // 3 Rương kho báu hoàng gia lớn mở nắp để lộ vàng ngọc
            for(let ch = 0; ch < 3; ch++) {
                const chest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.3), matGoldTrim);
                chest.position.set(16, 1.55, -8 + ch * 3.5);
                cg.add(chest);

                const gemLoot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), matCyanGlow);
                gemLoot.position.set(16, 2.25, -8 + ch * 3.5);
                cg.add(gemLoot);

                // Standable chest top
                addBoxCollider(-110 + 16, 120 - 8 + ch * 3.5, 2.0, 1.5, 0.8, 2.1, true);
            }

            // Giá vũ khí hoàng gia (Royal Weapon Rack)
            const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 3.4), matWoodDark);
            rackFrame.position.set(17, 2.1, 3);
            cg.add(rackFrame);
            addBoxCollider(-110 + 17, 120 + 3, 0.8, 3.6, 0.8, 3.5);

            // Cổng Dịch Chuyển Thoát Hiểm Khẩn Cấp (Secret Escape Portal)
            const portalRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.15, 8, 32), matCyanGlow);
            portalRing.rotation.x = -Math.PI / 2;
            portalRing.position.set(12, 1.05, 12);
            cg.add(portalRing);

            const portalCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), matPurpleGlow);
            portalCrystal.position.set(12, 2.4, 12);
            cg.add(portalCrystal);

            castleAnimators.push({
                type: 'portalRing',
                ring: portalRing,
                crystal: portalCrystal
            });

            // --- KHU NGỤC GIAM SẮT THÉP (SOUTHWEST CELLS) ---
            // 3 buồng giam riêng biệt
            const cellYMin = 0.8;
            const cellYMax = 5.5;

            for(let cell = 0; cell < 3; cell++) {
                const cellZ = -16 + cell * 5.2;

                // Tường ngăn cách giữa các buồng
                const pWall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.6, 0.4), matCastle);
                pWall.position.set(6, 3.3, cellZ);
                cg.add(pWall);
                addBoxCollider(-110 + 6, 120 + cellZ, 5.0, 0.5, cellYMin, cellYMax);

                // Hàng song sắt mặt trước buồng giam (X = -13.5)
                // Buồng giam số 1 (cell === 1) bị đứt gãy mở toang lối đi cho người chơi chui vào!
                const isBrokenOpen = true; // Every cell has a usable inspection doorway.
                for(let b = 0; b < 6; b++) {
                    if (isBrokenOpen && (b === 2 || b === 3)) continue; // Lối đi mở rộng 1.8m!
                    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 8), matIronBars);
                    bar.position.set(8.4, 3.3, cellZ - 2.0 + b * 0.8);
                    cg.add(bar);
                }

                // Chặn va chạm song sắt: buồng 0 và 2 chặn kín, buồng 1 chừa cửa giữa
                if (!isBrokenOpen) {
                    addBoxCollider(-110 + 8.4, 120 + cellZ, 0.4, 4.8, cellYMin, cellYMax);
                } else {
                    // Buồng 1: Chặn 2 bên cạnh, để trống ở giữa
                    addBoxCollider(-110 + 8.4, 120 + cellZ - 1.6, 0.4, 1.2, cellYMin, cellYMax);
                    addBoxCollider(-110 + 8.4, 120 + cellZ + 1.6, 0.4, 1.2, cellYMin, cellYMax);
                }

                // Sợi xích sắt treo từ trần nhà đung đưa
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6), matIronBars);
                chain.position.set(5.5, 4.6, cellZ - 1.2);
                cg.add(chain);
                castleAnimators.push({
                    type: 'chainSway',
                    mesh: chain,
                    offset: cell * 1.5
                });
            }

            // Cổ vật Hộp Sọ Dạ Quang bên trong buồng giam số 1
            const skullRelic = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matCyanGlow);
            skullRelic.position.set(5.5, 1.4, -10.8);
            cg.add(skullRelic);

            // 4 Đuốc Đồng Ma Mị Tầng Hầm (Purple Braziers)
            const dungeonTorches = [];
            [[-6, -18], [6, -18], [-6, 18], [6, 18]].forEach(([bx, bz], fIdx) => {
                const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 1.2, 12), matIronBars);
                brazier.position.set(bx, 1.6, bz);
                cg.add(brazier);

                const flame = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), matPurpleGlow);
                flame.position.set(bx, 2.4, bz);
                cg.add(flame);

                const bLt = new THREE.PointLight(0xa855f7, 1.8, 14);
                bLt.position.set(bx, 2.6, bz);
                cg.add(bLt);
                registerDynamicLight(bLt, 75);

                dungeonTorches.push({ mesh: flame, light: bLt, offset: fIdx * 1.2 });
                addCylinderCollider(-110 + bx, 120 + bz, 0.5, 0.8, 2.5);
            });
            castleAnimators.push({
                type: 'torchesGroup',
                torches: dungeonTorches,
                baseY: 2.4
            });

            // Basement stairs descend northward; their opening matches every floor and ceiling.
            staircase('basement', -15.7, -7.5, -20, 3.6, 1, 6, 20);
            floorPlate('hall-main', 2.5, -1.5, 33, 49, 6, matMarble);
            floorPlate('hall-west-north', -16.5, 7.75, 5, 30.5, 6, matMarble);
            floorPlate('hall-west-south', -16.5, -23, 5, 6, 6, matMarble);

            // Đôi Cánh Cửa Hoàng Gia Mở Rộng Ở Cổng Chính Tầng 1 (Double Palace Gate Doors)
            const gateDoorL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.5, 2.8), matWoodDark);
            gateDoorL.position.set(-4.2, 8.8, -25.2);
            gateDoorL.rotation.y = 0.65;
            cg.add(gateDoorL);

            const gateDoorR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.5, 2.8), matWoodDark);
            gateDoorR.position.set(4.2, 8.8, -25.2);
            gateDoorR.rotation.y = -0.65;
            cg.add(gateDoorR);

            // Lan can bảo vệ bằng vàng mạ quanh miệng giếng cầu thang Tầng Hầm (X = -14, Z = -21 to -10)
            const stairWellRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 11), matGoldTrim);
            stairWellRail.position.set(-14.0, 6.6, -15.5);
            cg.add(stairWellRail);
            stairWellRail.name='legacy-stair-rail';
            addBoxCollider(-110 - 14.0, 120 - 15.5, 0.5, 11.2, 5.8, 7.8);
            colliders.at(-1).name='legacy-stair-rail';

            // Thảm nhung đỏ hoàng gia trải dọc Đại Điện
            const carpet = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 34), matVelvetRed);
            carpet.rotation.x = -Math.PI / 2;
            carpet.position.set(0, 6.05, -3);
            cg.add(carpet);

            // 6 Cột Trụ Gothic với Đuốc Dạ Quang và CỜ PHƯỚN HOÀNG GIA PHẤP PHỚI
            const hallTorches = [];
            const hallBanners = [];

            for(let col = 0; col < 3; col++) {
                const colZ = -14 + col * 12;
                [-8, 8].forEach((colX, cSide) => {
                    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 7.0, 16), matCastle);
                    pillar.position.set(colX, 9.5, colZ);
                    cg.add(pillar);

                    const pCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), matGoldTrim);
                    pCap.position.set(colX, 13.0, colZ);
                    cg.add(pCap);

                    // Đuốc Đại Điện
                    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), matGoldTrim);
                    torch.position.set(colX + (colX > 0 ? -1.0 : 1.0), 9.8, colZ);
                    cg.add(torch);

                    const torchFlame = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), matCyanGlow);
                    torchFlame.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.4, colZ);
                    cg.add(torchFlame);

                    const tLt = new THREE.PointLight(0x00f5d4, 1.8, 16);
                    tLt.position.set(colX + (colX > 0 ? -1.0 : 1.0), 10.5, colZ);
                    cg.add(tLt);
                    registerDynamicLight(tLt, 85);

                    hallTorches.push({ mesh: torchFlame, light: tLt, offset: col * 1.5 + cSide });

                    // Lá Cờ Phướn Hoàng Gia (Heraldic Royal Banner)
                    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.2), matVelvetRed);
                    banner.position.set(colX + (colX > 0 ? -1.1 : 1.1), 9.6, colZ + 0.8);
                    banner.rotation.y = (colX > 0 ? -Math.PI / 2 : Math.PI / 2);
                    cg.add(banner);

                    hallBanners.push({ mesh: banner, offset: col * 1.2 + cSide });

                    addCylinderCollider(-110 + colX, 120 + colZ, 1.2, 5.8, 13.0);
                });
            }

            castleAnimators.push({
                type: 'torchesGroup',
                torches: hallTorches,
                baseY: 10.4
            });

            castleAnimators.push({
                type: 'bannersWave',
                banners: hallBanners
            });

            // Dining furniture and armor displays come from the Blender room
            // manifest. The old duplicate table/chairs intersected that layout.

            // Paired grand stairs, 25cm risers and a full-width intermediate landing.
            staircase('grand-center', 0, 4.4, 10.9, 7, 6, 9.5, 14);
            floorPlate('grand-landing', 0, 11.65, 32, 1.5, 9.5, matCastle);
            staircase('grand-west', -13, 12.4, 18.7, 4.5, 9.5, 13, 14);
            staircase('grand-east', 13, 12.4, 18.7, 4.5, 9.5, 13, 14);

            // Real openings in the north mezzanine above both flights.
            floorPlate('mezzanine-north-center', 0, 16, 21, 12, 13, matMarble);
            floorPlate('mezzanine-north-landing', 0, 20.35, 38, 3.3, 13, matMarble);
            for (const side of [-1, 1]) {
                floorPlate('mezzanine-north-outer', side * 17.35, 14.35, 3.3, 8.7, 13, matMarble);
            }
            floorPlate('mezzanine-west', -14, -1.75, 10, 26.5, 13, matMarble);
            floorPlate('mezzanine-east', 14, -1.75, 10, 26.5, 13, matMarble);
            floorPlate('mezzanine-south', 0, -19.75, 38, 12.5, 13, matMarble);

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
            });

            // The former atrium is now a usable full-width upper-floor room.
            // Its old internal railings were removed with their colliders.
            const throneDais = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), matCastle);
            throneDais.position.set(0, 13.6, 18);
            cg.add(throneDais);
            staircase('throne-dais', 0, 12.8, 14.6, 4, 13, 14.2, 6);

            const heroThrone=beginHeroFurniture(0,14.2,18.5,.375);
            const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 2.2), matVelvetPurple);
            throneSeat.position.set(0, 14.8, 18.5);
            cg.add(throneSeat);

            const throneBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.6, 0.6), matGoldTrim);
            throneBack.position.set(0, 17.0, 19.4);
            cg.add(throneBack);

            // 2 Vầng trăng khuyết mạ vàng uy nghi 2 bên ngai
            [-1.8, 1.8].forEach(mSide => {
                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 12, 32, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(mSide, 17.5, 19.0);
                crescent.rotation.z = (mSide > 0 ? -0.4 : 0.4);
                cg.add(crescent);
            });

            // Vách hoa hồng Gothic trên tường sau lưng ngai
            finishHeroFurniture(heroThrone);
            const roseWindow = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.35, 16, 32), matGoldTrim);
            roseWindow.position.set(0, 18.0, 22.8);
            cg.add(roseWindow);

            const roseGlass = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), matCyanGlow);
            roseGlass.position.set(0, 18.0, 22.7);
            cg.add(roseGlass);

            const throneGlowLt = new THREE.PointLight(0x00f5d4, 3.5, 24);
            throneGlowLt.position.set(0, 17.5, 18.0);
            cg.add(throneGlowLt);
            registerDynamicLight(throneGlowLt, 95);

            // Standable Dais & Seat
            addBoxCollider(-110, 120 + 18.0, 10.2, 7.2, 13.0, 14.2, true);
            addBoxCollider(-110, 120 + 18.5, 1.275, .9, 14.2, 14.6875, true);

            // SOLID THRONE BACK WALL (CHẶN TUYỆT ĐỐI KHÔNG CHO ĐI XUYÊN QUA LƯNG NGAI VÀNG!)
            addBoxCollider(-110, 120 + 18.8375, 1.575, .375, 14.3125, 16.375);

            // --- THƯ VIỆN HOÀNG GIA & CUỐN SÁCH MA THUẬT LƠ LỬNG ---
            const heroShelves=beginHeroFurniture(18.2,13,-6.5,.225);
            for(let b = 0; b < 3; b++) {
                const bShelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 5.0), matWoodDark);
                bShelf.position.set(18.5, 15.6, -11 + b * 6.5);
                cg.add(bShelf);

                for(let bk = 0; bk < 4; bk++) {
                    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), bk % 2 === 0 ? matPurpleGlow : matCyanGlow);
                    bMesh.position.set(18.2, 14.2 + bk * 1.0, -12 + b * 6.5 + bk * 0.7);
                    cg.add(bMesh);
                }
            }
            addBoxCollider(-110 + 18.2, 120 - 6.5, 2.0, 13.0, 12.8, 19.5);

            // Bàn học học giả
            finishHeroFurniture(heroShelves);
            const heroDesk=beginHeroFurniture(13.5,13,-4);
            const sDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.6), matWoodDark);
            sDesk.position.set(13.5, 13.55, -4);
            cg.add(sDesk);
            addBoxCollider(-110 + 13.5, 120 - 4, 2.5, 1.7, 13.0, 14.1, true);

            // Cuốn sách Grimoire ma thuật lơ lửng xoay tròn
            const floatBook = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.8), matVelvetPurple);
            floatBook.position.set(13.5, 14.6, -4);
            floatBook.rotation.y = 0.4;
            cg.add(floatBook);

            castleAnimators.push({
                type: 'floatingBook',
                mesh: floatBook,
                baseY: 14.6
            });

            finishHeroFurniture(heroDesk);
            staircase('attic', 16, 1.5, 13.5, 3.6, 13, 20, 28);
            floorPlate('attic-main', -2, 1, 32, 43, 20, matTimber);
            floorPlate('attic-east-south', 16, -9.5, 4, 22, 20, matTimber);
            floorPlate('attic-east-north', 16, 18, 4, 9, 20, matTimber);

            // Lan can bảo vệ bằng vàng mạ quanh giếng cầu thang Gác Mái
            const atticStairRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 10.5), matGoldTrim);
            atticStairRail.position.set(14.0, 20.6, 8.25);
            cg.add(atticStairRail);
            atticStairRail.name='legacy-stair-rail';
            addBoxCollider(-110 + 14.0, 120 + 8.25, 0.5, 10.8, 19.8, 21.8);
            colliders.at(-1).name='legacy-stair-rail';

            // Tường trước gác mái (Z = -21, World 99, Y = 19.5 to 26m)
            // Có cửa vòm ở giữa ra ban công (X = [-5, 5] mở)
            const atticFrontWallL = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 1.5), matCastle);
            atticFrontWallL.position.set(-11.5, 23, -20.5);
            cg.add(atticFrontWallL);
            addBoxCollider(-110 - 11.5, 120 - 20.5, 13.2, 1.8, 19.5, 26.0);

            const atticFrontWallR = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 1.5), matCastle);
            atticFrontWallR.position.set(11.5, 23, -20.5);
            cg.add(atticFrontWallR);
            addBoxCollider(-110 + 11.5, 120 - 20.5, 13.2, 1.8, 19.5, 26.0);

            // Vì kèo gỗ Gothic
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

            // =================================================================
            // HỆ THỐNG MÁI CHE TOÀN THỂ LÂU ĐÀI (COMPLETE GOTHIC PITCHED ROOF COMPLEX)
            // [Bao phủ toàn bộ 4 cánh và trung tâm, không còn bất kỳ khoảng trống nhìn xuyên thủng nào]
            // =================================================================
            // 1. Mái chóp nhọn bát giác Trung Tâm (Central Soaring Spire Roof at Y=30m)
            const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(18, 20, 8), matRoof);
            spireRoof.position.set(0, 38, 0);
            cg.add(spireRoof);

            // Tháp Chóp Kim Tinh vút cao trên đỉnh lâu đài (Apex Pinnacle Spire at Y=42m)
            const apexSpireNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.7, 10, 8), matGoldTrim);
            apexSpireNeedle.position.set(0, 42, 0);
            cg.add(apexSpireNeedle);

            const apexCrownGem = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), matCyanGlow);
            apexCrownGem.position.set(0, 47.5, 0);
            cg.add(apexCrownGem);

            // 2. Mái dốc Cánh Tây (West Wing Pitched Gable Roof at Y=26.5m)
            const westWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            westWingRoof.position.set(-11, 31.5, 0);
            westWingRoof.rotation.y = Math.PI / 4;
            cg.add(westWingRoof);

            // 3. Mái dốc Cánh Đông (East Wing Pitched Gable Roof at Y=26.5m)
            const eastWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            eastWingRoof.position.set(11, 31.5, 0);
            eastWingRoof.rotation.y = Math.PI / 4;
            cg.add(eastWingRoof);

            // 4. Mái dốc Cánh Nam (South Wing Pitched Gable Roof at Y=26.5m)
            const southWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            southWingRoof.position.set(0, 31.5, -11);
            southWingRoof.rotation.y = Math.PI / 4;
            cg.add(southWingRoof);

            // 5. Mái dốc Cánh Bắc (North Wing Pitched Gable Roof at Y=26.5m)
            const northWingRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11, 4), matRoof);
            northWingRoof.position.set(0, 31.5, 11);
            northWingRoof.rotation.y = Math.PI / 4;
            cg.add(northWingRoof);

            // 4. Hàng Lỗ Châu Mai Tường Thành Bảo Vệ Mái (Parapet Battlements & Merlons at Y=26.5m)
            for (let mer = -18; mer <= 18; mer += 3.6) {
                // Merlons bờ Bắc & bờ Nam
                const mNorth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), matCastle);
                mNorth.position.set(mer, 26.6, 23.0);
                cg.add(mNorth);

                const mSouth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), matCastle);
                mSouth.position.set(mer, 26.6, -20.0);
                cg.add(mSouth);
            }

            // Giếng trời ngắm trăng (Skylight)
            const skylightGlass = new THREE.Mesh(new THREE.CircleGeometry(2.8, 16), matCyanGlow);
            skylightGlass.rotation.x = -Math.PI / 2;
            skylightGlass.position.set(0, 26.48, 0);
            cg.add(skylightGlass);

            // --- BÀN TẾ & TRÁI TIM NGUYỆT TỘC (ASTRAL CORE) ---
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
            registerDynamicLight(atticCoreLt, 95);

            addCylinderCollider(-110, 120, 3.0, 19.8, 20.9, true);

            castleAnimators.push({
                type: 'astralCore',
                relic: floatingRelic,
                ring: relicRing,
                light: atticCoreLt,
                baseY: 22.2
            });

            // Rương báu đá mặt trăng góc gác mái
            const aChest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), matGoldTrim);
            aChest.position.set(-12, 20.6, 8);
            cg.add(aChest);
            addBoxCollider(-110 - 12, 120 + 8, 2.2, 2.2, 19.8, 21.2, true);

            // =================================================================
            // BAN CÔNG VỌNG CẢNH GÁC MÁI TẦNG 3 & MÁI CHE TINH TÚ (Y = 20.0m to 25.0m)
            // =================================================================
            // 1. Sàn ban công đá cẩm thạch đen vươn ra ngắm vũ trụ (Local Z = -20.5 to -27.0)
            const fl3BalconyFloor = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.6, 6.5), matMarble);
            fl3BalconyFloor.position.set(0, 19.7, -23.75);
            fl3BalconyFloor.receiveShadow = true;
            cg.add(fl3BalconyFloor);
            addBoxCollider(-110, 120 - 23.75, 12.2, 6.8, 19.4, 20.0, true);

            // 2. Lan can 3D mạ vàng Gothic thực tế (Visible 3D Balustrades cao 1.25m)
            // Lan can mặt trước (Z = -27.0)
            const fl3RailF = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.42, 0.12), matGoldTrim);
            fl3RailF.position.set(0, 20.21, -27.0);
            cg.add(fl3RailF);
            addBoxCollider(-110, 120 - 27.0, 12.2, 0.8, 19.98, 20.42);

            // Lan can cánh trái (X = -5.85)
            const fl3RailL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 6.5), matGoldTrim);
            fl3RailL.position.set(-5.85, 20.21, -23.75);
            cg.add(fl3RailL);
            addBoxCollider(-110 - 5.85, 120 - 23.75, 0.8, 6.8, 19.98, 20.42);

            // Lan can cánh phải (X = 5.85)
            const fl3RailR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 6.5), matGoldTrim);
            fl3RailR.position.set(5.85, 20.21, -23.75);
            cg.add(fl3RailR);
            addBoxCollider(-110 + 5.85, 120 - 23.75, 0.8, 6.8, 19.98, 20.42);

            // Trụ lan can đính tinh thể phát sáng
            [[-5.85, -27.0], [5.85, -27.0], [-5.85, -20.5], [5.85, -20.5]].forEach(([px, pz]) => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.42, 12), matCastle);
                post.position.set(px, 20.21, pz);
                cg.add(post);

                const cGem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), matPurpleGlow);
                cGem.position.set(px, 20.47, pz);
                cg.add(cGem);
            });

            // 3. MÁI CHE BAN CÔNG GÁC MÁI (CELESTIAL CANOPY ROOF at Y=24.8m)
            // 2 Cột gỗ mun cổ Gothic đỡ phía trước
            const fl3ColL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 12), matTimber);
            fl3ColL.position.set(-5.2, 22.5, -26.5);
            cg.add(fl3ColL);
            addCylinderCollider(-110 - 5.2, 120 - 26.5, 0.45, 19.8, 24.8);

            const fl3ColR = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 12), matTimber);
            fl3ColR.position.set(5.2, 22.5, -26.5);
            cg.add(fl3ColR);
            addCylinderCollider(-110 + 5.2, 120 - 26.5, 0.45, 19.8, 24.8);

            // Mái che dốc ngói tím viền vàng che phủ toàn bộ ban công gác mái
            const fl3CanopyRoof = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.7, 7.2), matRoof);
            fl3CanopyRoof.position.set(0, 24.8, -23.75);
            cg.add(fl3CanopyRoof);

            const fl3CanopyRidge = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.3, 0.5), matGoldTrim);
            fl3CanopyRidge.position.set(0, 25.2, -20.5);
            cg.add(fl3CanopyRidge);

            // Đèn lồng tím Astral ma mị treo dưới mái che ban công
            const fl3Lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), matPurpleGlow);
            fl3Lantern.position.set(0, 23.8, -24.0);
            cg.add(fl3Lantern);

            const fl3BalconyLt = new THREE.PointLight(0xa855f7, 2.8, 18);
            fl3BalconyLt.position.set(0, 23.8, -24.0);
            cg.add(fl3BalconyLt);
            registerDynamicLight(fl3BalconyLt, 80);

            // Băng ghế đá ngắm sao có nệm nhung (Ngồi được 'C' hoặc đứng 'Space')
            const heroBench=beginHeroFurniture(0,20,-25.2);
            const viewBench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.0), matCastle);
            viewBench.position.set(0, 20.25, -25.2);
            cg.add(viewBench);

            const benchCushion = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 0.9), matVelvetPurple);
            benchCushion.position.set(0, 20.55, -25.2);
            cg.add(benchCushion);
            addBoxCollider(-110, 120 - 25.2, 3.8, 1.2, 19.8, 20.65, true);
            finishHeroFurniture(heroBench);

            // =================================================================
            // CẦU DẪN GRAND BRIDGE RAMP & CỘT ĐÈN
            // =================================================================
            const bridgeSlopeAng = -0.10522;
            const bridgeCenterZ = -51.75;
            const bridgeCenterY = 2.78;

            const bridge = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.8, 53.8), matDarkBase);
            bridge.position.set(0, bridgeCenterY, bridgeCenterZ);
            bridge.rotation.x = bridgeSlopeAng;
            bridge.receiveShadow = true;
            cg.add(bridge);

            const bridgeCrystalRoad = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 53.8), matMarble);
            bridgeCrystalRoad.position.set(0, bridgeCenterY + 0.38, bridgeCenterZ);
            bridgeCrystalRoad.rotation.x = bridgeSlopeAng;
            bridgeCrystalRoad.receiveShadow = true;
            cg.add(bridgeCrystalRoad);

            const bridgeRuneRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 53.8), matGoldTrim);
            bridgeRuneRibbon.position.set(0, bridgeCenterY + 0.40, bridgeCenterZ);
            bridgeRuneRibbon.rotation.x = bridgeSlopeAng;
            cg.add(bridgeRuneRibbon);

            [-2.8, 2.8].forEach(curbX => {
                const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 53.8), matCastle);
                curb.position.set(curbX, bridgeCenterY + 0.46, bridgeCenterZ);
                curb.rotation.x = bridgeSlopeAng;
                cg.add(curb);
            });

            [-3.7, 3.7].forEach(railX => {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 53.8), matCastle);
                rail.position.set(railX, bridgeCenterY + 0.22, bridgeCenterZ);
                rail.rotation.x = bridgeSlopeAng;
                cg.add(rail);

                const railCap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 53.8), matGoldTrim);
                railCap.position.set(railX, bridgeCenterY + 0.45, bridgeCenterZ);
                railCap.rotation.x = bridgeSlopeAng;
                cg.add(railCap);
            });

            for (const x of [-113.7,-106.3]) {
                castleStairGuards.push({x,z0:41.5,z1:95,bottom:.35,top:6});
            }

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
                    registerDynamicLight(pLight, 65);
                });
            }

            // Cột đèn cổng tráng lệ lối vào cầu
            [-4.6, 4.6].forEach((px, idx) => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 7.5, 12), matCastle);
                pillar.position.set(px, 3.75, -78.5);
                cg.add(pillar);

                const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 10, 24, Math.PI * 1.3), matGoldTrim);
                crescent.position.set(px, 7.8, -78.5);
                crescent.rotation.z = (idx === 0 ? 0.35 : -0.35);
                cg.add(crescent);

                const beaconLight = new THREE.PointLight(0x00f5d4, 2.5, 20);
                beaconLight.position.set(px, 8.0, -78.5);
                cg.add(beaconLight);
                registerDynamicLight(beaconLight, 85);

                addCylinderCollider(-110 + px, 41.5, 0.9, 0, 8.5);
            });

            // Surface footprints derive from the visible balcony meshes.
            for (const mesh of [fl2BalconyFloor, fl3BalconyFloor, baseFloor]) {
                const p = mesh.geometry.parameters;
                castleSurfaces.push({ name: 'balcony-or-foundation', minX: mesh.position.x - 110 - p.width / 2,
                    maxX: mesh.position.x - 110 + p.width / 2, minZ: mesh.position.z + 120 - p.depth / 2,
                    maxZ: mesh.position.z + 120 + p.depth / 2, y: mesh.position.y + p.height / 2 });
            }
            // Door leaves use their rotation instead of an oversized axis-aligned box.
            for (const door of [gateDoorL, gateDoorR]) {
                const p = door.geometry.parameters;
                colliders.push({ type: 'orientedBox', x: door.position.x - 110, z: door.position.z + 120,
                    width: p.width, depth: p.depth, angle: door.rotation.y, minY: door.position.y - p.height / 2,
                    maxY: door.position.y + p.height / 2 });
            }

            // Ashlar masonry, inset Gothic windows, cornices and exterior buttresses.
            // Instancing keeps hundreds of stone details to a handful of draw calls.
            const matCastleGlass = new THREE.MeshBasicMaterial({ color: 0x426383, side: THREE.DoubleSide, toneMapped: false });
            for (const side of [-1, 1]) {
                for (let z = -16; z <= 16; z += 8) {
                    solidBox('exterior-buttress', side * 22.6, 16, z, 1.2, 22, 1.8, matMarble);
                    for (const y of [9, 16.2, 23]) {
                        const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), matCastleGlass);
                        pane.name='castle-stained-glass';
                        pane.position.set(side * 19.69, y, z);
                        pane.rotation.y = -side * Math.PI / 2;
                        cg.add(pane);
                        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.10, 6, 12, Math.PI), matGoldTrim);
                        arch.position.set(side * 19.57, y + 1.2, z);
                        arch.rotation.y = Math.PI / 2;
                        cg.add(arch);
                        solidBox('window-mullion', side * 19.53, y, z, 0.1, 2.5, 0.08, matGoldTrim);
                        solidBox('window-transom', side * 19.53, y, z, 0.1, 0.08, 1.8, matGoldTrim);
                    }
                }
                for (const y of [6.3, 12.5, 19.3, 25.5]) {
                    solidBox('wall-cornice', side * 19.65, y, 0, 0.22, 0.16, 43, matGoldTrim);
                }
            }
            // A single continuous opaque wall per side carries the brick pattern.
            // Separate raised brick overlays created visible gaps at shallow angles.
            for (const wall of [w1,w2,w3,fwL,fwR]) {
                wall.material.transparent=false;
                wall.material.opacity=1;
                wall.material.depthWrite=true;
            }

            // Solid gate lintels and front upper wall close gaps outside the intended doors.
            solidBox('gate-lintel', 0, 12.1, -26, 7, 1.3, 2.5, matCastle);
            solidBox('balcony-lintel', 0, 18.4, -26, 7, 1, 2.5, matCastle);
            // Stairwell side guards protect the openings, leaving both landings open.
            solidBox('basement-west-guard', -18.25, 6.21, -13.75, 0.12, 0.42, 12.5, matGoldTrim);
            const cameraObstacles = cg.children.filter(mesh => mesh.userData.cameraSolid).concat([
                w1, w2, w3, fwL, fwR, atticFrontWallL, atticFrontWallR, gateDoorL, gateDoorR,
                baseWallW, baseWallE, baseWallN, baseWallSL, baseWallSR, baseWallSC,
                shelterWallW, dungeonCeilMain, dungeonCeilSW]);
            window.castlePhysics = { flights, surfaces: castleSurfaces, cameraObstacles, colliderStart: castleColliderStart,
                colliderEnd: colliders.length, group: cg };

            cg.position.set(-110, 0, 120);
            scene.add(cg);

            // =================================================================
            // ĐIỂM TƯƠNG TÁC CHI TIẾT TẠI CÁC TẦNG LÂU ĐÀI
            // =================================================================
            interactables.push({
                id: 'castle_shelter_bunker',
                pos: new THREE.Vector3(-110 - 10, 1.0, 120),
                radius: 6.0,
                prompt: 'Khám phá Hầm Trú Ẩn Bí Mật (Sa Bàn Chiến Lược & Lò Sưởi Hoàng Gia)',
                type: 'shelter_bunker'
            });

            interactables.push({
                id: 'castle_dungeon_cell',
                pos: new THREE.Vector3(-110 + 5.5, 1.0, 120 - 10.8),
                radius: 4.5,
                prompt: 'Khám phá Ngục Giam Bí Mật (Cổ Vật Đầu Lâu Dạ Quang)',
                type: 'dungeon_cell'
            });

            interactables.push({
                id: 'castle_dungeon_treasury',
                pos: new THREE.Vector3(-110 + 14, 1.0, 120 + 10),
                radius: 6.5,
                prompt: 'Mở Khóa Kho Báu Hoàng Gia & Cổng Thoát Hiểm Bí Mật',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_hall_banquet',
                pos: new THREE.Vector3(-110 - 10, 6.0, 120 - 5),
                radius: 8.5,
                prompt: 'Khám phá Bàn Tiệc & Giáp Trụ Kỵ Sĩ Đại Điện (Tầng 1)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_throne',
                pos: new THREE.Vector3(-110, 14.0, 120 + 17),
                radius: 8.5,
                prompt: 'Ngồi lên Ngai Vàng Mặt Trăng Tsuventure (Thánh Điện Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_library',
                pos: new THREE.Vector3(-110 + 14, 13.0, 120 - 4),
                radius: 8.0,
                prompt: 'Đọc Mật Điển Lịch Sử Vương Quốc (Thư Viện Hoàng Gia Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_attic_core',
                pos: new THREE.Vector3(-110, 20.0, 120),
                radius: 8.5,
                prompt: 'Kích hoạt Trái Tim Nguyệt Tộc (Bí Mật Tối Cao Gác Mái Lâu Đài)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_balcony_fl2',
                pos: new THREE.Vector3(-110, 13.0, 120 - 28.6),
                radius: 6.5,
                prompt: 'Ngắm toàn cảnh Nguyệt Giới từ Ban Công Hoàng Gia (Tầng 2)',
                type: 'throne'
            });

            interactables.push({
                id: 'castle_balcony_fl3',
                pos: new THREE.Vector3(-110, 20.0, 120 - 23.75),
                radius: 6.5,
                prompt: 'Chiêm ngưỡng Vũ Trụ Tinh Tú từ Ban Công Vọng Cảnh Gác Mái (Tầng 3)',
                type: 'throne'
            });
        }
