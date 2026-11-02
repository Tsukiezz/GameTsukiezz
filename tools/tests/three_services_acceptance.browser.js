(()=>{
    enterGame();setGraphicsProfile('low');monsterCamps.add('goldCoin',3); // Fixture: each boarding now requires a paid fare.
    const r=moonRailway,checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
    check(r.trains.length===3,'Exactly three independently running services');
    check(new Set(r.trains.map(t=>t.color)).size===3,'Three distinct liveries');
    const interior=r.points.filter(p=>Math.abs(p.x)<800&&Math.abs(p.z)<800).length/r.points.length;
    const crossMap=r.networkPaths.filter(path=>path.points.some(p=>p.x<0)&&path.points.some(p=>p.x>0)).length;
    check(r.services[0].length>14000&&interior>.35&&crossMap>=6,'Dense winding route reaches map interior');

    for(const t of r.trains){
        check(t.vehicles.length===4,t.id+' locomotive and original three coaches');
        check(t.driver.name.startsWith('RoyalTinSoldierDriver'),t.id+' NPC driver');
        check(t.points===r.services[0].points,t.id+' shares the same physical track');
        let maxJump=0;
        for(let d=0;d<t.length;d+=2){const a=r.vehiclePose(d-.001,t),b=r.vehiclePose(d+.001,t);maxJump=Math.max(maxJump,Math.abs(Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw))));}
        check(maxJump<.005,t.id+' continuous bogie orientation');
    }
    const stationWalks=[];
    for(let i=0;i<r.stations.length;i++){
        const s=r.stations[i],gap=s.platform.y-r.terrainHeight(s.platform.x,s.platform.z);
        check(!s.grounded||gap>=-.01&&gap<.35,'Ground-level station '+i);if(!s.grounded)check(s.access.surfaces.length>0,'Elevated station has real stairs '+i);
        playerGroup.position.copy(s.access.entrance);currentGroundY=playerGroup.position.y;isGrounded=true;jumpY=0;jumpVelocityY=0;heroMotion.reset();
        let maxError=0;
        for(const target of [...s.access.waypoints,...s.access.waypoints.toReversed()]){
            const delta=target.clone().sub(playerGroup.position),steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.08));
            for(let k=0;k<steps;k++){movePlayerWithCollisions(delta.x/steps,delta.z/steps);updatePlayerVertical(1/60);}
            const error=Math.max(Math.hypot(playerGroup.position.x-target.x,playerGroup.position.z-target.z),Math.abs(playerGroup.position.y-target.y));maxError=Math.max(maxError,error);
            check(error<.31,'Walk without jumping at station '+i+' '+JSON.stringify({error,target:target.toArray(),actual:playerGroup.position.toArray()}));
        }
        stationWalks.push({name:s.name,line:s.lineId,gap,maxError});
    }
    // A request affects only its own service. Place it just before the actual
    // stop to test arrival and the full dwell without skipping game logic.
    check(r.stations.filter(s=>s.grounded).length>=7,'At least seven of ten stations remain on ground');
    const requests=[];
    for(const t of r.trains){
        const stop=t.stops[0],index=stop.station;r.travel(index);t.distance=(stop.distance-1+t.length)%t.length;t.nextStop=0;t.state='moving';t.requests.clear();t.speed=2;let offset=1;for(const other of r.trains)if(other!==t){other.distance=(t.distance+offset++*t.length/3)%t.length;other.state='moving';other.requests.clear();}
        check(r.requestStop(index),t.id+' station request accepted');
        const before=r.trains.filter(v=>v!==t).map(v=>v.distance);
        for(let n=0;n<100&&t.state!=='stopped';n++)r.update(.1);
        check(t.state==='stopped'&&t.stationIndex===index,t.id+' requested arrival');
        check(r.toggleRide()&&r.aboard,t.id+' board inside coach');
        const walk=steps=>{for(let n=0;n<Math.abs(steps);n++){const car=t.vehicles[r.passenger.coach],delta=new THREE.Vector3(0,0,Math.sign(steps)*.08).applyQuaternion(car.getWorldQuaternion(new THREE.Quaternion()));movePlayerWithCollisions(delta.x,delta.z);updatePlayerVertical(1/60);}};
        walk(-400);check(r.passenger.coach===3,t.id+' walk through both gangways');
        walk(600);check(r.passenger.coach===1,t.id+' walk back to first coach');
        for(let coach=1;coach<=3;coach++){
            r.passenger.coach=coach;r.passenger.z=0;r.passenger.x=0;r.standPassenger();
            check(r.chooseSeat(2)&&r.passenger.seat===2,t.id+' seat in coach '+coach);r.updateCamera();
            const local=t.vehicles[coach].worldToLocal(camera.position.clone());check(local.y>2&&local.y<4.2,t.id+' camera inside coach '+coach);r.standPassenger();
        }
        const destination=r.stations.findIndex((s,i)=>i!==index);check(r.requestStop(destination),t.id+' may request any station on common track');t.requests.delete(destination);
        const remaining=t.remaining;r.update(remaining-.1);check(t.state==='stopped'&&t.remaining>.09,t.id+' waits full minute');
        check(r.toggleRide()&&!r.aboard,t.id+' exits onto platform');r.update(.2);check(t.state==='moving',t.id+' departs after minute');
        check(r.trains.filter(v=>v!==t).every((v,j)=>v.distance!==before[j]),t.id+' other services continue independently');
        // With no request, even the next station is passed without stopping.
        const next=t.stops[t.nextStop];t.distance=(next.distance-.1+t.length)%t.length;t.speed=2;t.requests.clear();r.update(1);check(t.state==='moving',t.id+' passes unrequested stop');
        requests.push({line:t.id,dwell:60,coaches:3});
    }
    const leader=r.trains[0],follower=r.trains[1],third=r.trains[2];
    leader.distance=leader.stops[0].distance;leader.state='stopped';leader.remaining=300;leader.speed=0;
    follower.distance=(leader.distance-150+leader.length)%leader.length;follower.state='moving';follower.speed=30;follower.requests.clear();
    third.distance=(leader.distance+leader.length/3)%leader.length;third.state='moving';third.requests.clear();
    let snapshots=0,minGap=Infinity;
    for(let n=0;n<100;n++){r.update(1);for(const t of r.trains){const gap=r.trafficGap(t);minGap=Math.min(minGap,gap);check(gap>=r.minimumHeadway-.001,'Signal headway while leader occupies station');}scene.updateMatrixWorld(true);const boxes=r.trains.map(t=>t.vehicles.map(v=>new THREE.Box3().setFromObject(v)));for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)for(const a of boxes[i])for(const b of boxes[j])check(!a.intersectsBox(b),'Live train separation');snapshots++;}
    check(follower.waitingForSignal,'Follower waits for occupied block');leader.remaining=.1;const held=follower.distance;r.update(20);check((follower.distance-held+follower.length)%follower.length>.1,'Follower resumes after signal clears');
    const geometryFailures=[];
    const flat=r.trains.map(t=>{let count=0,low=0;for(const p of t.points){const floor=r.terrainHeight(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z);if(water===null&&r.terrainHeight.maxOverRect(p.x,p.z,8)-floor<.4&&floor-Math.min(r.terrainHeight(p.x-8,p.z),r.terrainHeight(p.x+8,p.z),r.terrainHeight(p.x,p.z-8),r.terrainHeight(p.x,p.z+8))<.4){count++;if(p.y-floor<.8)low++;}if(r.isBridge(p))check(p.terrainMode==='river'||p.terrainMode==='mountain','Elevated only for rivers or rugged approaches');}if(low/count<=.85)geometryFailures.push(t.id+' flat terrain remains low '+low+'/'+count);return {line:t.id,count,low,ratio:low/count};});
    const closeTracks=[],nearby=new Map(),route=r.services[0];
    for(let i=0;i<route.points.length;i++){const p=route.points[i],gx=Math.floor(p.x/24),gz=Math.floor(p.z/24);for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)for(const j of nearby.get((gx+x)+','+(gz+z))||[]){const arc=Math.abs(route.distances[i]-route.distances[j]);if(Math.min(arc,route.length-arc)>120&&p.distanceTo(route.points[j])<22&&closeTracks.length<8)closeTracks.push({a:i,b:j,distance:p.distanceTo(route.points[j]),position:p.toArray()});}const key=gx+','+gz;if(!nearby.has(key))nearby.set(key,[]);nearby.get(key).push(i);}
    if(closeTracks.length)geometryFailures.push('Nonadjacent track corridors remain separate '+JSON.stringify(closeTracks));
    const obstacleHits=[],tightPaths=[];
    for(const path of r.networkPaths){let maxTurn=0,worst=0;for(let i=1;i<path.points.length-1;i++){const a=path.points[i].clone().sub(path.points[i-1]),b=path.points[i+1].clone().sub(path.points[i]);a.y=b.y=0;a.normalize();b.normalize();const turn=Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));if(turn>maxTurn){maxTurn=turn;worst=i;}}if(maxTurn>.2)tightPaths.push({id:path.id,line:path.lineId,maxTurn,worst,points:path.points.slice(Math.max(0,worst-5),worst+6).map(p=>p.toArray()),a:path.a.toArray(),b:path.b.toArray()});}
    for(const t of r.trains)for(let d=0;d<t.length;d+=4){const p=r.vehiclePose(d,t).position;if(r.obstacleSurvey.top(p.x,p.z,4,p.y+6.5,p.y+.3)>p.y+.3&&obstacleHits.length<12)obstacleHits.push({line:t.id,d,position:p.toArray(),sources:r.obstacleSurvey.boxes.filter(b=>b.min.y<p.y+6.5&&b.max.y>p.y+.3&&b.min.x<p.x+4&&b.max.x>p.x-4&&b.min.z<p.z+4&&b.max.z>p.z-4).map(b=>b.source)});}
    if(obstacleHits.length)geometryFailures.push('Whole shared route clears existing surveyed obstacles '+JSON.stringify(obstacleHits));
    if(tightPaths.length)geometryFailures.push('No abrupt horizontal turn between sampled rail sections '+JSON.stringify(tightPaths));
    // Avoid writing thousands of repeated per-point labels into the report.
    return {geometryFailures,assertions:checks.length,interior,crossMap,minimumHeadway:r.minimumHeadway,minGap,stationWalks,requests,flat,snapshots,vehicles:r.allVehicles.length,obstacleHits,tightPaths};
})()
