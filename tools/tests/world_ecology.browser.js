(()=>{
 const checks=[],check=(name,ok,detail)=>{checks.push({name,ok,detail});if(!ok)throw Error(name+' '+JSON.stringify(detail));};
 enterGame();setGraphicsProfile('low');gameState.inDialogue=false;
 check('Exactly three graphics profiles',Object.keys(graphicsProfiles).join(',')==='low,balanced,ultra');
 check('Vietnamese graphics labels',Object.values(graphicsProfiles).map(p=>p.name).join('|')==='Mượt|Trung Bình|Cao');
 check('Weak profile limits distance and shadows',camera.far<=300&&!renderer.shadowMap.enabled&&aquaticEcology.limits.low.fish<=72);
 setGraphicsProfile('ultra');check('High enables shadow maps and long view',renderer.shadowMap.enabled&&camera.far>=2000&&renderer.toneMapping===THREE.ACESFilmicToneMapping);
 setGraphicsProfile('balanced');check('Medium retains detailed water',worldExpansion.water.material===worldExpansion.waterMaterial&&camera.far>=800);
 setGraphicsProfile('potato');check('Legacy graphics setting migrates',currentProfileKey==='low'&&graphicsQuality.key==='low');
 const pos=worldExpansion.terrain.geometry.attributes.position,col=worldExpansion.terrain.geometry.attributes.color;let north=0,south=0;
 for(let i=0;i<pos.count;i++){if(pos.getZ(i)<-1300){check('Northern earth '+i,col.getX(i)>col.getZ(i)*1.3);north++;}if(pos.getZ(i)>1900){check('Southern snow '+i,col.getZ(i)>col.getX(i));south++;}}
 check('Terrain samples cover both regions',north>100&&south>100,{north,south});
 const a=aquaticEcology;check('Six river fish species',a.types.length===6);check('River-wide habitats',a.habitats.length>10000,a.habitats.length);
 for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])check('Fish habitats quadrant '+sx+','+sz,a.habitats.some(h=>h.x*sx>1500&&h.z*sz>1500));
 const h=a.habitats.find(h=>h.z<-2000&&Math.abs(h.x)>1500);fastTravelTo(h.x,h.z,'River ecology');a.update(1);
 check('Nearby fish and weeds streamed',a.visibleFish>0&&a.visibleWeeds>0&&a.visibleFish<=72&&a.visibleWeeds<=90,{fish:a.visibleFish,weeds:a.visibleWeeds});
 const matrix=new THREE.Matrix4(),p=new THREE.Vector3();let fishChecked=0,weedChecked=0;
 for(const pool of a.pools)for(let i=0;i<pool.body.count;i++){pool.body.getMatrixAt(i,matrix);p.setFromMatrixPosition(matrix);const w=riverBoat.waterAt(p.x,p.z);check('Fish underwater '+fishChecked,!!w&&p.y>w.bottom&&p.y<w.y);fishChecked++;}
 for(const mesh of a.grasses)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);p.setFromMatrixPosition(matrix);const w=riverBoat.waterAt(p.x,p.z);check('Weeds rooted in riverbed '+weedChecked,!!w&&Math.abs(p.y-w.bottom-.03)<.01);weedChecked++;}
 check('Polar wildlife population',polarEcology.actors.length>=80,polarEcology.actors.length);
 check('Both penguins and bears',polarEcology.actors.some(a=>a.kind==='penguin')&&polarEcology.actors.some(a=>a.kind==='polar_bear'));
 for(const actor of polarEcology.actors)check('Safe polar home '+actor.phase,polarEcology.safe(actor.home.x,actor.home.z));
 check('Expanded monster camps',monsterCamps.camps.length>=95,monsterCamps.camps.length);check('Camps beyond old map',monsterCamps.camps.filter(c=>Math.max(Math.abs(c.center.x),Math.abs(c.center.z))>1120).length>=55);
 for(const c of monsterCamps.camps){check('Camp size '+c.id,c.actors.length>=10&&c.actors.length<=15);check('Camp safe ground '+c.id,monsterCamps.safe(c.center.x,c.center.z));}
 const r=moonRailway;check('Many additional stations',r.stations.length>=30,r.stations.length);check('Ground level stations',r.stations.every(s=>s.grounded));check('Three shared trains each three coaches',r.trains.length===3&&r.trains.every(t=>t.vehicles.length===4));check('Faster cruise speed',r.cruiseSpeed===84);
 check('Stations near architecture',r.stations.filter(s=>/Lâu Đài|Công Nghệ|Rừng Cổ|Nhà Máy|Thủy Ngân|Tà Thần|Đấu Trường/.test(s.name)).length>=4);
 check('Eight factory crystal clusters',snowCrystals.nodes.length===8);const node=snowCrystals.nodes[0],before=snowCrystals.count;fastTravelTo(node.item.pos.x,node.item.pos.z-3.2,'Factory crystals',antarcticRealm.factory.y);checkInteractables();
 renderer.domElement.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}));check('Actual E harvest grants two crystals',snowCrystals.count===before+2&&node.item.collected,{before,after:snowCrystals.count,p:playerGroup.position.toArray(),node:node.item.pos.toArray()});
 snowCrystals.interact(node.item);check('Crystal cooldown prevents duplicate',snowCrystals.count===before+2);
 setGraphicsProfile('balanced');
 return {checks,habitats:a.habitats.length,fishSpecies:a.types.map(t=>t.name),fishChecked,weedChecked,animals:polarEcology.actors.reduce((n,a)=>(n[a.kind]=(n[a.kind]||0)+1,n),{}),camps:monsterCamps.camps.length,enemies:monsterCamps.actors.length,stations:r.stations.length,cruise:r.cruiseSpeed,crystals:snowCrystals.count,crystalId:node.item.id,graphics:currentProfileKey};
})()
