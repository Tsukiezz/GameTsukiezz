(()=>{
    enterGame();setGraphicsProfile('low');const m=mangroveRealm,results=[];
    const check=(name,ok,detail)=>{results.push({name,ok,detail});if(!ok)throw Error(name+' '+JSON.stringify(detail));};
    function place(x,z,y){playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpY=0;jumpVelocityY=0;resetGameplayInput();heroMotion.reset();}
    const tick=n=>{for(let i=0;i<n*60;i++)m.update(1/60);};
    check('Blender authored meshes and giant forest loaded',m.data.source==='Blender'&&m.data.trees.length>=60&&m.crocodile.maxHealth===10000);
    check('Brackish water is opaque',!m.water.material.transparent);
    check('Deep basin exists below water',m.ground(135,-815)<-5&&playerSurvival.surfaceAt(135,-815)===1.2);
    check('Basin connects directly to northern river',Boolean(riverRealm.waterAt(50,-720))&&Boolean(m.waterAt(50,-730)));
    const ray=new THREE.Raycaster();let error=0;
    for(const [x,z] of [[135,-815],[-80,-820],[180,-880],[50,-730],[280,-800]]){ray.set(new THREE.Vector3(x,120,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(m.terrain)[0];check('Terrain raycast exists '+x+','+z,Boolean(hit));error=Math.max(error,Math.abs(hit.point.y-m.ground(x,z)));}
    check('Rendered bed equals collision height',error<.001,error);
    // No old solid sheet crossing the basin water.
    for(const mesh of [ground,riverRealm.terrain].filter(Boolean)){ray.set(new THREE.Vector3(135,120,-815),new THREE.Vector3(0,-1,0));check('Old terrain excavated '+mesh.name,ray.intersectObject(mesh).every(h=>h.point.y<-10));}
    m.travel();check('Travel arrives on safe bank',!checkCollision(playerGroup.position.x,playerGroup.position.z,playerGroup.position.y));
    check('Deep basin exceeds 35 metres',m.ground(135,-815)<-35);
    check('No dry bridge across the basin',[-750,-780,-810,-840].every(z=>!Number.isFinite(m.support(70,z,3))&&getGroundElevation(70,z,3)<-20));
    place(70,-730,.7);for(let i=0;i<1500;i++){movePlayerWithCollisions(0,-.1);updatePlayerVertical(1/60);}
    check('Swimming reaches the sanctuary landing',playerGroup.position.z<-877&&playerGroup.position.y>2.7,{p:playerGroup.position.toArray()});
    check('Swimmer can leave the water onto the sanctuary',!playerSurvival.inWater(playerGroup.position));
    check('Blender aquatic life is populated',m.life.populations.fish.length>=300&&m.life.populations.turtle.length>=10&&m.life.populations.crab.length>=20);
    check('Lotus leaves float without making a walkable bridge',m.life.populations.lotus.length>=150&&m.life.populations.lotus.every(a=>Math.abs(a.position.y-1.245)<.03));
    const fishBefore=m.life.populations.fish[0].position.clone();m.life.update(1);check('Fish actually swim',fishBefore.distanceTo(m.life.populations.fish[0].position)>.01);
    place(70,-665,m.data.entry[1]);let low=0,high=-100;for(let i=0;i<2400;i++){m.update(1/60);low=Math.min(low,m.crocodile.group.position.y);high=Math.max(high,m.crocodile.group.position.y);}
    check('Crocodile dives deeply and resurfaces',low<-20&&high>-8,{low,high});
    const t=m.data.trees[0];check('Tree trunk has a real collider',m.blocked(t.x,t.z,t.y+3));
    for(const hero of ['hamster','rabbit','dragon_knight','kingkong']){applyHeroSelection(hero);place(135,-815,-1);playerSurvival.refresh();check('Swamp swimming works for '+hero,playerSurvival.swimming&&playerSurvival.inLakeColumn(135,-815));}applyHeroSelection('hamster');
    place(135,-815,-5);playerSurvival.refresh();check('Diving uses the deep basin',playerSurvival.underwater);
    camera.position.set(135,-2,-815);playerSurvival.environment();check('Underwater saltwater has murky fog',scene.fog.density===.09);
    m.pause();m.crocodile.group.position.set(135,-.6,-815);m.crocodile.cooldown=0;place(135,-800,-.5);check('Crocodile telegraphs before biting',m.startBite()&&m.marker.visible);
    const before=gameState.health+gameState.armor;tick(.7);check('Warning does not deal instant damage',gameState.health+gameState.armor===before);
    place(70,-800,2.8);tick(1.6);check('Dodge and dry deck avoid the lunge',gameState.health+gameState.armor===before);
    m.pause();m.crocodile.group.position.set(135,-.6,-815);m.crocodile.cooldown=0;place(135,-800,-.5);m.startBite();tick(1.5);check('Locked lunge damages a swimmer',gameState.health+gameState.armor<before);
    m.pause();m.crocodile.group.position.set(135,-.6,-815);m.crocodile.group.rotation.y=0;place(135,-808,-.5);const hp=m.crocodile.health;m.beginPlayerAttack('hamster');tick(.3);check('Player attacks damage crocodile in range',m.crocodile.health<hp);
    place(70,-700,3);const far=m.crocodile.health;m.beginPlayerAttack('hamster');tick(.3);check('Remote player attacks cannot damage crocodile',m.crocodile.health===far);
    m.pause();place(70,-800,2.8);check('Fragment cannot be collected remotely',m.interact(m.item)&&!m.owned);
    place(70,-882.8,2.8);checkInteractables();check('Actual E interaction detects relic',nearbyItem===m.item);handleInteraction();check('Fragment added to inventory',m.owned&&m.item.collected&&!m.relic.visible&&!m.row.hidden);
    m.interact(m.item);check('Fragment cannot be duplicated',JSON.parse(localStorage.getItem('tsuventure_mangrove_v1')).ancientFragment===true&&m.row.querySelector('strong').textContent.includes('1'));
    check('Fragment has no premature consume action',m.row.querySelectorAll('button').length===0);
    place(135,-815,-1);m.hit(100000);check('Defeated boss and discovery saved',m.defeated&&m.crocodile.health===0&&JSON.parse(localStorage.getItem('tsuventure_mangrove_v1')).crocodileDefeated);
    check('Library contains the crocodile',fieldGuide.catalog.some(c=>c.id==='swamp_crocodile'));
    m.travel();return {results};
})()
