// Evaluated inside the real game tab by verify_redesign.js.
(() => {
    enterGame();setGraphicsProfile('potato');
    const results=[];
    const check=(name,ok,detail={})=>results.push({name,ok:Boolean(ok),detail});
    function place(x,y,z) {
        playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;
        jumpVelocityY=0;jumpY=0;castleSafeAnchor=null;keys.jump=false;
    }
    castleGate.open=true;for(let i=0;i<180;i++)updateCastleGate(1/60);
    // Jump repeatedly while running both uphill and downhill, including gate
    // threshold and both edges of the physical walking lane.
    let jumpTrials=0;const falls=[];
    for(const fps of [15,30,60,144]) for(const speed of [4.8,8,12])
        for(const offset of [-2.8,0,2.8]) for(const direction of [-1,1]) {
            const dt=Math.min(1/fps,.05),start=direction===1?42:94.8,end=direction===1?95.5:42;
            place(-110+offset,getGroundElevation(-110+offset,start,6),start);
            let jumped=0,arrived=false;
            for(let frame=0;frame<Math.ceil(70/speed/dt)+100;frame++) {
                if(isGrounded){keys.jump=true;jumped++;}
                const remaining=(end-playerGroup.position.z)*direction;
                if(remaining<=.01){arrived=true;break;}
                movePlayerWithCollisions(0,direction*Math.min(speed*dt,remaining));
                updatePlayerVertical(dt);
                const z=playerGroup.position.z;
                const ramp=.35+(Math.min(95,z)-41.5)/53.5*5.65;
                if(z>=41.5 && z<=95 && playerGroup.position.y<ramp-.06) {
                    falls.push({fps,speed,offset,direction,z,y:playerGroup.position.y,ramp});break;
                }
            }
            check('Running jumps '+fps+'fps '+speed+'m/s x'+offset+' direction'+direction,
                arrived && jumped>2,{arrived,jumped,position:playerGroup.position.toArray()});jumpTrials++;
        }
    check('No running jump penetrates bridge deck',falls.length===0,{falls,jumpTrials});
    // Verify the broad-phase index against the original exhaustive algorithm.
    const savedGrid=collisionGrid;const mismatches=[];let localTotal=0;
    for(const y of [-5,1,6,9.5,13,20]) for(let x=-128;x<-92;x+=1.7)for(let z=100;z<140;z+=1.9) {
        const fast=checkCollision(x,z,y),ground=getGroundElevation(x,z,y);
        localTotal+=nearbyColliders(x,z).size;
        collisionGrid=null;
        const slow=checkCollision(x,z,y),fullGround=getGroundElevation(x,z,y);
        collisionGrid=savedGrid;
        if(fast!==slow || Math.abs(ground-fullGround)>.00001)mismatches.push({x,y,z,fast,slow,ground,fullGround});
    }
    check('Spatial index preserves every sampled collision and support',!mismatches.length,{mismatches:mismatches.slice(0,10)});
    check('Basement queries inspect a fraction of total obstacles',localTotal/(6*22*22)<colliders.length*.4,
        {totalColliders:colliders.length,averageCandidates:Math.round(localTotal/(6*22*22))});
    const parts=CASTLE_EXTENSION.parts;
    check('Blender-authored current scene revision',CASTLE_EXTENSION.version>=4);
    check('Gate tunnel removed',!parts.some(p=>['gate-throat-wall','gate-upper-closure'].includes(p.name)));
    check('Visible portal and crest exported',parts.some(p=>p.name==='portal-arch-stone') && parts.some(p=>p.name==='gate-moon-emblem'));
    const clear=[];
    for(let x=-114;x<-106;x+=.1)if(!checkCollision(x,94,6))clear.push(x);
    check('Opened gate has broad single passage',clear.length>=60,{width:clear.length*.1});
    castleGate.open=false;for(let i=0;i<180;i++)updateCastleGate(1/60);
    check('Closed gate blocks passage',checkCollision(-110,94,6));
    check('Attic stair has a dedicated compact stair room',CASTLE_EXTENSION.compactStairs?.some(p=>p.top===20));
    check('Unicorn modeled and present in game',lunarUnicorn?.group.userData.sourceMeshCount>50 && parts.some(p=>p.name==='unicorn-horn'));
    check('Unicorn detail batches stay below ten draw calls',lunarUnicorn.group.children.length<10,{drawCalls:lunarUnicorn.group.children.length});
    check('Unicorn encounter can be interacted with',interactables.some(p=>p.type==='lunar_unicorn'));
    place(-110,6,102);interactCastleUpgrade(interactables.find(p=>p.type==='lunar_unicorn'));
    check('Unicorn responds to greeting',lunarUnicorn.time>0);
    check('White coat and magic mane materials',lunarUnicorn.group.children.some(p=>p.material.color.getHex()===0xe5ebfa));
    // Every redesigned room needs a usable route from its floor's stair landing.
    const unreachableRooms=[];const islands=[];
    secretHatch.open=true;secretHatch.mesh.visible=false;secretHatch.collider.disabled=true;
    prisonState.open=true;for(let i=0;i<150;i++)updateCastleGate(1/60);
    const floors=[[-5,-120,130,-124.5,-113.5,114.5,137.5],
        [1,-126,113,-128,-92,100,140],[6,-110,105,-128,-92,96,140],
        [9.5,-100,132,-128,-92,96,140],[13,-110,132,-128,-92,96,140],
        [20,-110,114,-128,-92,100,140]];
    for(const [y,sx,sz,x0,x1,z0,z1] of floors) {
        const cells=new Set();
        for(let x=x0;x<=x1;x+=.5)for(let z=z0;z<=z1;z+=.5)
            if(!checkCollision(x,z,y) && Math.abs(getGroundElevation(x,z,y)-y)<.1)cells.add(x+','+z);
        const queue=[[sx,sz]],seen=new Set([sx+','+sz]);
        for(let i=0;i<queue.length;i++) {
            const [x,z]=queue[i];
            for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]) {
                const k=(x+dx)+','+(z+dz);
                if(cells.has(k) && !seen.has(k) && !checkCollision(x+dx/2,z+dz/2,y)) {seen.add(k);queue.push([x+dx,z+dz]);}
            }
        }
        for(const room of CASTLE_EXTENSION.rooms.filter(r=>r.floor===y)) {
            if(!queue.some(([x,z])=>x+110>room.minX+.3 && x+110<room.maxX-.3 && z-120>room.minZ+.3 && z-120<room.maxZ-.3))
                unreachableRooms.push({y,name:room.name});
        }
        if(y<=1) {
            const stranded=[...cells].filter(k=>!seen.has(k));
            if(stranded.length)islands.push({y,count:stranded.length,points:stranded.slice(0,20)});
        }
    }
    check('All functional rooms connect to their landing',!unreachableRooms.length,{unreachableRooms});
    check('Basement and crypt have no isolated walkable corners',!islands.length,{islands});
    return {results};
})()
