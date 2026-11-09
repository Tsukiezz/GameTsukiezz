        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const safeDt = Math.min(delta, 0.05);
            window.moonveilPalace?.update(safeDt);window.weaponSystem?.update(safeDt);window.gearSystem?.update(safeDt);window.progressionLoot?.update(safeDt);
            window.actorAnimation?.beginFrame();
            window.forestAudio?.update();
            window.grandTerminal?.update(safeDt);window.stationMobility?.update(safeDt);
            window.voidDistrict?.update(safeDt);
            window.worldResidents?.update(safeDt);
            const time = clock.getElapsedTime();
            window.mercuryLake?.update(time);
            frameCount++;
            updateCastleGate(safeDt);
            updatePlayerVitals();

            // Real-time FPS Calculation (updated every 500ms)
            fpsFrames++;
            const now = performance.now();
            if (now - fpsLastTime >= 500) {
                const fps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
                fpsFrames = 0;
                fpsLastTime = now;
                if (currentProfileKey === 'low' && !document.hidden) {
                    slowSamples = fps < 54 ? slowSamples + 1 : 0;
                    fastSamples = fps > 62 ? fastSamples + 1 : 0;
                    if (slowSamples >= 12 && adaptiveRatio > 0.35) {
                        adaptiveRatio = Math.max(0.35, adaptiveRatio - 0.05);
                        slowSamples = 0;
                        applyRenderResolution();
                    } else if (fastSamples >= 60 && adaptiveRatio < 0.6) {
                        adaptiveRatio = Math.min(0.6, adaptiveRatio + 0.05);
                        fastSamples = 0;
                        applyRenderResolution();
                    }
                }
                const fpsText = document.getElementById('hud-fps-text');
                if (fpsText) fpsText.textContent = `${fps} FPS`;
                const perfDot = document.querySelector('.perf-dot');
                if (perfDot) {
                    perfDot.style.background = (fps >= 48) ? '#00f5d4' : (fps >= 28 ? '#ffd700' : '#ff4d6d');
                    perfDot.style.boxShadow = `0 0 8px ${perfDot.style.background}`;
                }
            }

            // Proximity Distance Culling for Dynamic Landmark Lights (runs every 6 frames)
            if (frameCount % 6 === 0 && playerGroup) {
                const px = playerGroup.position.x;
                const pz = playerGroup.position.z;
                const activeProfile = graphicsProfiles[currentProfileKey] || graphicsProfiles.balanced;
                const maxRange = activeProfile.lightDistance;
                for (let i = 0; i < dynamicLights.length; i++) {
                    const item = dynamicLights[i];
                    const light = item.light;
                    // Approximate light world XZ
                    const lx = light.parent ? (light.parent.position.x + light.position.x) : light.position.x;
                    const lz = light.parent ? (light.parent.position.z + light.position.z) : light.position.z;
                    const distSq = (px - lx) * (px - lx) + (pz - lz) * (pz - lz);
                    const range = Math.min(item.maxDist, maxRange);
                    light.visible = currentProfileKey !== 'low' && (distSq <= range * range);
                }
            }

            // Rotate celestial planetary ring
            if (typeof ringMesh !== 'undefined' && ringMesh) {
                ringMesh.rotation.z += 0.04 * delta;
            }

            // Real-time Castle Dynamic Atmospheric Animations (Torches, Banners, Fireplace, Crystals, Core)
            if (currentProfileKey !== 'low' && window.castleAnimators && window.castleAnimators.length > 0) {
                for (let i = 0; i < window.castleAnimators.length; i++) {
                    const anim = window.castleAnimators[i];
                    if (anim.type === 'spireGem') {
                        anim.mesh.rotation.y += 0.03 * anim.speed;
                        anim.mesh.position.y = anim.baseY + Math.sin(time * 2.5 + anim.speed) * 0.25;
                    } else if (anim.type === 'hearthFire') {
                        const flicker = Math.sin(time * 12.0) * 0.1 + Math.cos(time * 22.0) * 0.08;
                        const size=anim.furnitureScale||1;anim.mesh.scale.set((1+flicker)*size,(1+flicker*1.5)*size,(1+flicker)*size);
                        anim.mesh.position.y = anim.baseY + Math.abs(Math.sin(time * 8.0)) * 0.08*(anim.furnitureScale||1);
                        anim.light.intensity = anim.baseIntensity + flicker * 1.8;
                    } else if (anim.type === 'strategyCrystals') {
                        for (let c = 0; c < anim.items.length; c++) {
                            const item = anim.items[c];
                            const orbAng = time * 1.4 + item.offset;
                            item.mesh.position.x = anim.centerX + Math.cos(orbAng) * 1.1*(anim.furnitureScale||1);
                            item.mesh.position.z = anim.centerZ + Math.sin(orbAng) * 0.7*(anim.furnitureScale||1);
                            item.mesh.position.y = anim.baseY + Math.sin(time * 3.0 + item.offset) * 0.15;
                            item.mesh.rotation.y += 0.04;
                            item.mesh.rotation.x += 0.02;
                        }
                    } else if (anim.type === 'sarcoRune') {
                        anim.mesh.rotation.z += 0.02;
                    } else if (anim.type === 'portalRing') {
                        anim.ring.rotation.z += 0.025;
                        anim.crystal.rotation.y += 0.035;
                        anim.crystal.rotation.x += 0.02;
                        anim.crystal.position.y = 2.4 + Math.sin(time * 2.8) * 0.18;
                    } else if (anim.type === 'chainSway') {
                        anim.mesh.rotation.z = Math.sin(time * 1.8 + anim.offset) * 0.08;
                        anim.mesh.rotation.x = Math.cos(time * 1.4 + anim.offset) * 0.06;
                    } else if (anim.type === 'torchesGroup') {
                        for (let t = 0; t < anim.torches.length; t++) {
                            const torch = anim.torches[t];
                            const flicker = Math.sin(time * 10.0 + torch.offset) * 0.12 + Math.cos(time * 18.0 + torch.offset) * 0.08;
                            torch.mesh.scale.set(1.0 + flicker, 1.0 + flicker * 1.4, 1.0 + flicker);
                            torch.mesh.position.y = anim.baseY + Math.sin(time * 6.0 + torch.offset) * 0.04;
                            torch.light.intensity = 1.8 + flicker * 0.9;
                        }
                    } else if (anim.type === 'bannersWave') {
                        for (let b = 0; b < anim.banners.length; b++) {
                            const bnr = anim.banners[b];
                            bnr.mesh.rotation.y += Math.sin(time * 2.8 + bnr.offset) * 0.005;
                            bnr.mesh.rotation.z = Math.sin(time * 2.2 + bnr.offset) * 0.06;
                        }
                    } else if (anim.type === 'floatingBook') {
                        anim.mesh.position.y = anim.baseY + Math.sin(time * 2.4) * 0.14*(anim.furnitureScale||1);
                        anim.mesh.rotation.y += 0.015;
                    } else if (anim.type === 'astralCore') {
                        anim.relic.rotation.x += 0.025;
                        anim.relic.rotation.y += 0.035;
                        anim.relic.position.y = anim.baseY + Math.sin(time * 2.8) * 0.18;
                        anim.ring.rotation.z += 0.04;
                        anim.ring.rotation.x = 0.6 + Math.sin(time * 2.0) * 0.15;
                        anim.light.intensity = 3.6 + Math.sin(time * 3.5) * 1.2;
                    }
                }
            }

            if (gameState.isPlaying && !gameState.inDialogue && !document.querySelector('.modal-overlay.active')) {
                window.heroMotion?.look(safeDt);
                let inputX = 0;
                let inputZ = 0;

                if (keys.forward) inputZ -= 1;
                if (keys.backward) inputZ += 1;
                if (keys.left) inputX -= 1;
                if (keys.right) inputX += 1;

                const isMoving = (inputX !== 0 || inputZ !== 0);

                // Handle speed buff
                if (speedBuffTimer > 0) speedBuffTimer -= delta;
                const buffMultiplier=((speedBuffTimer>0)?1.4:1.0)*(window.evilCavern?.speedMultiplier||1)*(window.romanArena?.tournament?.movementMultiplier||1);
                playerSurvival.update(safeDt,window.riverBoat?.aboard?false:isMoving);
                const currentSpeed = ((window.snowQueen?.frozen||window.candyRealm?.hypnotized)?0:1) * (window.crystalWings?.flying?crystalWings.speed:playerSurvival.speed) * buffMultiplier;

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

                // Animate rotating magic aura ring beneath feet
                if (magicAuraRing) {
                    magicAuraRing.rotation.z += safeDt*1.5;
                    magicAuraRing.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.05);
                }

                // Animate floating crown if active
                if (crownGroup && crownGroup.visible) {
                    crownGroup.rotation.y += safeDt*1.8;
                    crownGroup.position.y = 2.2 + Math.sin(time * 3.0) * 0.08;
                }

                // Update fading footstep sparkle particles
                footstepParticles.forEach(p => {
                    if (p.mesh.visible) {
                        p.life += delta;
                        p.mesh.scale.multiplyScalar(1.0 + 0.8 * delta);
                        p.mesh.material.opacity = Math.max(0, 0.85 * (1.0 - p.life / p.maxLife));
                        if (p.life >= p.maxLife) p.mesh.visible = false;
                    }
                });

                // Highway glowing crystals are rendered with high-performance GPU instancing

                const motion=heroMotion.step(inputX,inputZ,currentSpeed,safeDt);
                if(motion.moving&&!playerSurvival.swimming&&isGrounded){walkCycle+=motion.speed*safeDt*(keys.shift?18:11.5);if(Math.abs(Math.sin(walkCycle))>.97)emitFootstepSparkle(playerGroup.position.x,playerGroup.position.y,playerGroup.position.z);}
                if(window.forestGuardian?.rooted){keys.jump=false;keys.swimUp=false;}
                updatePlayerVertical(safeDt);
                window.lakeMonsters?.update(safeDt);
                window.forestGuardian?.update(safeDt);
                window.forestWildlife?.update(safeDt);
                window.monsterSkills?.update(safeDt);
                window.bachKhuyet?.update(safeDt);
                window.riverRealm?.update(safeDt);
                window.evilCavern?.update(safeDt);
                window.caveTreasury?.update();window.rageArmor?.update();window.worldWeather?.update(safeDt);window.antarcticRealm?.winterStructure?.update(safeDt,performance.now()*.001);
                window.volcanicValley?.update(safeDt);
                window.desertRealm?.update(safeDt);
                window.romanArena?.update?.(safeDt);window.creatureRefresh?.update(safeDt);
                window.mangroveRealm?.update(safeDt);
                window.realmTransitUpdate?.update(safeDt);
                window.moonRailway?.update(safeDt);
                window.riverBoat?.update(safeDt);
                window.fieldGuide?.update(safeDt);
                if(isAttacking){heroAttackElapsed+=Math.min(delta,.1);if(heroAttackElapsed>=.5)isAttacking=false;}
                if(activeLimbs)updateHeroAnimation(activeLimbs,{dt:Math.min(delta,.1),time,moving:motion.moving,speed:motion.speed,turn:motion.turn,moveForward:motion.forward,strafe:motion.strafe,flashlight:Boolean(window.solarFlashlight?.equipped),sprint:playerSurvival.sprinting||Boolean(window.crystalWings?.flying&&keys.shift),swimming:playerSurvival.swimming,diving:playerSurvival.underwater,grounded:isGrounded,velocity:jumpVelocityY,sitting:isSitting,attacking:isAttacking,attackProgress:heroAttackElapsed/.5,vertical:Number(keys.swimUp)-Number(keys.dive),ropeRiding:Boolean(window.explorationUpdate?.climbing),flying:Boolean(window.crystalWings?.flying)});

                checkInteractables();
                if (frameCount % (currentProfileKey==='low'?20:8) === 0) updateMinimap(playerGroup.position.x, playerGroup.position.z, playerGroup.rotation.y);

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
                });

                // Third-person Orbit Camera with Intelligent Interior Clamping (Prevents wall/ceiling clipping, supports balconies)
                const onBalconyFl2 = (playerGroup.position.x >= -119.0 && playerGroup.position.x <= -101.0 &&
                                      playerGroup.position.z >= 87.5 && playerGroup.position.z <= 95.0 && playerGroup.position.y >= 11.5);
                const onBalconyFl3 = (playerGroup.position.x >= -117.0 && playerGroup.position.x <= -103.0 &&
                                      playerGroup.position.z >= 92.5 && playerGroup.position.z <= 99.5 && playerGroup.position.y >= 18.5);
                const inCastle = window.castlePhysics?.active !== false && ((playerGroup.position.x >= -133.0 && playerGroup.position.x <= -87.0 &&
                                  playerGroup.position.z >= 95.0 && playerGroup.position.z <= 145.0) || onBalconyFl2 || onBalconyFl3);

                let effectiveDist = heroMotion.state.distance;
                let effectivePitch = Math.max(0.12,Math.min(heroMotion.state.pitch,0.95));
                if (inCastle) {
                    effectiveDist = Math.min(heroMotion.state.distance, 2.2);
                    // Keep the orbit above the floor; mouse aim remains free
                    // to look up/down independently of this safe camera offset.
                    effectivePitch = Math.max(0.12, Math.min(heroMotion.state.pitch, 0.6));
                }

                let targetCamX = playerGroup.position.x + Math.sin(heroMotion.state.yaw) * Math.cos(effectivePitch) * effectiveDist;
                let targetCamY = playerGroup.position.y + PLAYER_HEIGHT * .65 + Math.sin(effectivePitch) * effectiveDist;
                let targetCamZ = playerGroup.position.z + Math.cos(heroMotion.state.yaw) * Math.cos(effectivePitch) * effectiveDist;

                if (inCastle) {
                    // Confine camera within interior walls (Outer walls at X=[-131, -89], Z=[94, 143])
                    targetCamX = Math.max(-130.0, Math.min(-90.0, targetCamX));
                    if (onBalconyFl2 || onBalconyFl3) {
                        targetCamZ = Math.max(86.0, Math.min(142.0, targetCamZ));
                    } else {
                        targetCamZ = Math.max(95.5, Math.min(142.0, targetCamZ));
                    }

                    // Confine camera under each floor's ceiling:
                    if (inSecretCellar(playerGroup.position.x, playerGroup.position.z) && playerGroup.position.y < 0.8) {
                        targetCamY = Math.max(-4.7, Math.min(0.4, targetCamY));
                    } else if (playerGroup.position.y < 5.0) {
                        targetCamY = Math.max(1.3, Math.min(5.3, targetCamY)); // Basement ceiling is at 5.8m
                    } else if (playerGroup.position.y < 12.0) {
                        targetCamY = Math.max(6.3, Math.min(12.2, targetCamY)); // Floor 1 ceiling is at 12.8m
                    } else if (playerGroup.position.y < 19.0) {
                        targetCamY = Math.max(13.3, Math.min(19.2, targetCamY)); // Floor 2 ceiling is at 19.8m
                    } else {
                        targetCamY = Math.max(20.3, Math.min(27.0, targetCamY)); // Attic roof
                    }
                }

                const inArena=window.romanArena && romanArena.region(playerGroup.position.x,playerGroup.position.z).r<39;
                let desiredCamera = new THREE.Vector3(targetCamX, targetCamY, targetCamZ);
                if (inCastle || inArena || window.evilCavern?.inside()) {
                    desiredCamera = clipCastleCamera(playerGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0)), desiredCamera);
                }
                if(window.worldSurface?.cameraNeedsReset(playerGroup.position))camera.position.copy(desiredCamera);
                else camera.position.lerp(desiredCamera, 1 - Math.exp(-12 * safeDt));
                if (inCastle || inArena || window.evilCavern?.inside()) {
                    camera.position.copy(clipCastleCamera(playerGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0)), camera.position));
                }
                if(!inCastle)camera.position.copy(window.mapVisualRepair?.clipCamera(playerGroup.position.clone().add(new THREE.Vector3(0,.45,0)),camera.position)||camera.position);
                camera.lookAt(camera.position.clone().add(castleLookDirection(heroMotion.state.yaw,heroMotion.state.pitch)));
            } else if (!gameState.isPlaying) {
                // Atmospheric cinematic camera slow orbit around the moonlit ruins for Home Screen
                const orbitAngle = time * 0.08;
                camera.position.set(Math.sin(orbitAngle) * 22, 11 + Math.sin(time * 0.15) * 2, Math.cos(orbitAngle) * 22);
                camera.lookAt(0, 2.5, 0);
            }

            window.moonRailway?.updateCamera();
            if(document.getElementById('modal-terminal-fleet')?.classList.contains('active'))window.moonRailway?.update(safeDt);
            window.explorationUpdate?.updateCamera();
            window.playerExperience?.update(Math.min(delta,.1));
            window.backpack?.update(Math.min(delta,.1));
            window.monsterCamps?.update(Math.min(delta,.1));
            window.foodPickups?.update(Math.min(delta,.1));
            window.aquaticEcology?.update(Math.min(delta,.1));window.polarEcology?.update(Math.min(delta,.1));window.snowCrystals?.update(Math.min(delta,.1));
            window.playerLife?.update(Math.min(delta,.1));window.snowQueen?.update(Math.min(delta,.1));window.santaGifts?.update(Math.min(delta,.1));window.candyRealm?.update(Math.min(delta,.1));window.westernHighlands?.update(Math.min(delta,.1));window.candyProvisions?.update(Math.min(delta,.1));window.realmScenery?.update();
            window.pyramidInterior?.update(Math.min(delta,.1));
            window.crystalWings?.update(Math.min(delta,.1));
            window.playerSurvival?.environment();
            window.evilCavern?.environment();
            window.moonveilPalace?.environment();
            window.livingWorld?.update(Math.min(delta,.1));
            window.treeWood?.update(Math.min(delta,.1));
            window.technologyBase?.update?.(Math.min(delta,.1));
            window.templeSupplies?.update(Math.min(delta,.1));
            window.templeSupplies?.environment();
            window.caveTreasury?.environment();
            window.solarFlashlight?.update(Math.min(delta,.1));
            window.antarcticRealm?.environment();window.candyRealm?.environment();window.worldWeather?.camera();window.graphicsQuality?.update(Math.min(delta,.1));
            window.actorAnimation?.update(Math.min(delta,.1));
            window.heroMotion?.syncWeapons();
            window.caveAccess?.update();window.undergroundNetwork?.update(Math.min(delta,.1));window.undergroundNetwork?.environment();
            if(gameState.isPlaying&&window.undergroundNetwork)camera.position.copy(undergroundNetwork.clipView(playerGroup.position,camera.position));
            window.worldWeather?.environment();
            renderer.render(scene, camera);
        }

