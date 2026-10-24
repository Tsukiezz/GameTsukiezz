(() => {
    enterGame();setGraphicsProfile('potato');
    const results=[];const check=(name,ok,detail={})=>results.push({name,ok:Boolean(ok),detail});
    check('Blender revision 6 loaded',CASTLE_EXTENSION.version===6);
    const hidden=CASTLE_EXTENSION.hiddenStairs;
    check('Each outgoing staircase hides in a different room',hidden.length===4 && new Set(hidden.map(p=>p.room)).size===4);
    check('Four requested room themes exported',['ancient-library','armor-museum','royal-bedroom','gold-vault','ballroom'].every(kind=>CASTLE_EXTENSION.themes.some(t=>t.kind===kind)));
    check('Each floor has a winding corridor',CASTLE_EXTENSION.parts.filter(p=>p.name==='room-maze-baffle').length===10);
    const screenIssues=[];
    for(const s of hidden){
        const room=CASTLE_EXTENSION.rooms.find(r=>r.floor===s.floor&&r.name===s.room);
        const plan=CASTLE_EXTENSION.compactStairs.find(p=>p.name===s.stair);
        const screen=CASTLE_EXTENSION.parts.find(p=>p.name==='room-secret-screen'&&Math.abs(p.position[1]-s.floor-({1:4.55,6:3.05,9.5:3.05,13:6.55}[s.floor])/2)<.01);
        if(!screen||!room.hiddenStair||Math.sign(plan.x)!==Math.sign(room.door.x))screenIssues.push(s);
        if(screen && !checkCollision(screen.position[0]-110,screen.position[2]+120,s.floor))screenIssues.push({reason:'non-solid screen',s});
    }
    check('Concealment screens are solid and belong to stair rooms',!screenIssues.length,{screenIssues});
    function place(x,y,z){playerGroup.position.set(x,y,z);currentGroundY=y;isGrounded=true;jumpY=0;jumpVelocityY=0;castleSafeAnchor=null;keys.jump=false;}
    function walk(x,z,speed=4.8,fps=60){
        for(let frame=0;frame<4000;frame++){
            const dx=x-playerGroup.position.x,dz=z-playerGroup.position.z,d=Math.hypot(dx,dz);
            if(d<.01)return true;
            const step=Math.min(d,speed/fps),before=playerGroup.position.clone();
            movePlayerWithCollisions(dx/d*step,dz/d*step);updatePlayerVertical(1/fps);
            if(before.distanceTo(playerGroup.position)<1e-7)return false;
        }return false;
    }
    secretHatch.open=true;secretHatch.mesh.visible=false;secretHatch.collider.disabled=true;
    for(const plan of CASTLE_EXTENSION.compactStairs){
        const [a,b]=plan.flights,landingZ=plan.z+plan.depth-.6;
        check(plan.name+' compact footprint',plan.width*plan.depth<30,{area:plan.width*plan.depth,width:plan.width,depth:plan.depth});
        for(const fps of [15,30,60,144])for(const speed of [4.8,8]){
            place(a.x-110,plan.bottom,plan.z+119.4);
            let ok=walk(a.x-110,landingZ+120,speed,fps)&&walk(b.x-110,landingZ+120,speed,fps)&&walk(b.x-110,plan.z+119.4,speed,fps);
            const up=playerGroup.position.toArray();ok=ok&&Math.abs(up[1]-plan.top)<.05;
            ok=ok&&walk(b.x-110,landingZ+120,speed,fps)&&walk(a.x-110,landingZ+120,speed,fps)&&walk(a.x-110,plan.z+119.4,speed,fps);
            check(plan.name+' full U stair up/down '+fps+'fps '+speed+'m/s',ok&&Math.abs(playerGroup.position.y-plan.bottom)<.05,{up,down:playerGroup.position.toArray()});
        }
    }
    // Room borders are sampled with the real player collision radius. Exactly
    // one gap must be present; the corridor is not counted as a room.
    prisonState.open=true;for(let i=0;i<150;i++)updateCastleGate(1/60);
    const doorIssues=[],blockedDoors=[];
    for(const room of CASTLE_EXTENSION.rooms.filter(r=>!r.corridor)){
        const gaps=[];
        for(const [axis,constant,start,end] of [['x',room.minX,room.minZ,room.maxZ],['x',room.maxX,room.minZ,room.maxZ],['z',room.minZ,room.minX,room.maxX],['z',room.maxZ,room.minX,room.maxX]]){
            let open=false;
            for(let p=start+.4;p<end-.35;p+=.12){
                const x=(axis==='x'?constant:p)-110,z=(axis==='x'?p:constant)+120;
                const pass=!checkCollision(x,z,room.floor);
                if(pass&&!open)gaps.push({axis,constant,p});open=pass;
            }
        }
        if(gaps.length!==1)doorIssues.push({name:room.name,floor:room.floor,gaps});
        const door=room.door;
        if(checkCollision(door.x-110,door.z+120,room.floor))blockedDoors.push({name:room.name,door});
    }
    check('Every room has exactly one physical doorway',!doorIssues.length,{doorIssues});
    check('Every doorway is passable',!blockedDoors.length,{blockedDoors});
    const blockedAprons=[];
    for(const c of CASTLE_EXTENSION.doorClearances){
        for(const p of CASTLE_EXTENSION.parts){
            if(!p.furniture || !p.solid)continue;
            const [x,y,z]=p.position,[w,h,d]=p.size;
            if(y-h/2>c.floor+.7 || y+h/2<c.floor+.05)continue;
            if(x-w/2<c.maxX&&x+w/2>c.minX&&z-d/2<c.maxZ&&z+d/2>c.minZ)blockedAprons.push({room:c.room,part:p.name});
        }
    }
    check('No furniture crosses reserved door approaches',!blockedAprons.length,{blockedAprons});
    const unreachable=[];
    for(const floor of [-5,1,6,9.5,13,20]){
        // Start in the main corridor/gallery. Reach every room through the
        // collision graph, then walk the recovered path with actual physics.
        const start=floor===-5?[-120,130]:[-110,105],cells=new Set();
        const bounds=floor===-5?[-124.5,-113.5,114.5,137.5]:[-129,-91,96,141];
        for(let x=bounds[0];x<=bounds[1];x+=.5)for(let z=bounds[2];z<=bounds[3];z+=.5)
            if(!checkCollision(x,z,floor)&&Math.abs(getGroundElevation(x,z,floor)-floor)<.1)cells.add(x+','+z);
        const queue=[start],seen=new Set([start.join(',')]),parent=new Map();
        for(let i=0;i<queue.length;i++){
            const [x,z]=queue[i];for(const [dx,dz]of[[.5,0],[-.5,0],[0,.5],[0,-.5]]){
                const key=(x+dx)+','+(z+dz);
                if(cells.has(key)&&!seen.has(key)&&!checkCollision(x+dx/2,z+dz/2,floor)){seen.add(key);queue.push([x+dx,z+dz]);parent.set(key,x+','+z);}
            }
        }
        for(const room of CASTLE_EXTENSION.rooms.filter(r=>r.floor===floor&&!r.corridor)){
            const destination=queue.find(([x,z])=>x+110>room.minX+.7&&x+110<room.maxX-.7&&z-120>room.minZ+.7&&z-120<room.maxZ-.7);
            if(!destination){unreachable.push({floor,name:room.name,reason:'no route'});continue;}
            const route=[];let key=destination.join(',');while(key!==start.join(',')){route.push(key.split(',').map(Number));key=parent.get(key);}
            place(start[0],floor,start[1]);
            for(const [x,z]of route.reverse())if(!walk(x,z)){unreachable.push({floor,name:room.name,reason:'walk blocked',position:playerGroup.position.toArray()});break;}
        }
        for(const plan of CASTLE_EXTENSION.compactStairs.filter(p=>p.bottom===floor||p.top===floor)){
            const flight=plan.flights[plan.bottom===floor?0:1];
            const target=[flight.x-110,plan.z+119.4];
            const destination=queue.find(([x,z])=>Math.hypot(x-target[0],z-target[1])<.36);
            let ok=!!destination;
            if(destination){
                const route=[];let key=destination.join(',');
                while(key!==start.join(',')){route.push(key.split(',').map(Number));key=parent.get(key);}
                place(start[0],floor,start[1]);
                for(const [x,z]of route.reverse())if(!walk(x,z)){ok=false;break;}
                ok=ok&&walk(...target);
            }
            check(plan.name+' hidden entrance reachable on floor '+floor,ok,{target,position:playerGroup.position.toArray()});
        }
    }
    check('All one-door rooms reachable by actual walking',!unreachable.length,{unreachable});
    const g=prisonState.gate;
    prisonState.open=false;for(let i=0;i<150;i++)updateCastleGate(1/60);
    check('Prison gate starts solid when closed',checkCollision(g.x-110,g.z+120,-5));
    place(-119.05,-5,130.2);checkInteractables();
    check('Control pedestal offers the prison button',nearbyItem?.type==='prison_control',{type:nearbyItem?.type});
    handleInteraction();for(let i=0;i<150;i++)updateCastleGate(1/60);
    check('Pressing control opens the barred entrance',prisonState.open&&!checkCollision(g.x-110,g.z+120,-5));
    place(g.x-111,-5,133);check('Player can enter the prison',walk(-115,133),{position:playerGroup.position.toArray()});
    prisonState.open=false;for(let i=0;i<150;i++)updateCastleGate(1/60);
    place(-114.1,-5,133);checkInteractables();handleInteraction();for(let i=0;i<150;i++)updateCastleGate(1/60);
    check('Emergency button releases a player locked inside',prisonState.open&&!checkCollision(g.x-110,133,-5));
    prisonState.open=true;place(g.x-110,-5,133);interactCastleUpgrade(interactables.find(p=>p.type==='prison_control'));
    check('Closing interlock protects a player in the doorway',prisonState.open);
    check('Additional deepest-level rooms exported',CASTLE_EXTENSION.rooms.filter(r=>r.floor===-5&&!r.corridor).length===3);
    return {results};
})()
