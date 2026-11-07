/* One rendered terrain surface for ecology, ground movement and outdoor camera. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installWorldSurfaceSync(){
    const rail=window.moonRailway,height=(x,z)=>Math.max(rail.terrainHeight(x,z),rail.roadHeight?.(x,z)??-Infinity);
    const modifiedAt=(x,z)=>Boolean(window.moonveilPalace?.affects(x,z))||Boolean(window.terrainContinuity?.affects(x,z))||Boolean(window.technologyBase?.contains(x,z))||Number.isFinite(rail.roadHeight?.(x,z))||rail.stationPlans.some(plan=>{if(!plan.grounded)return false;const q=new THREE.Vector3(x-plan.center.x,0,z-plan.center.z).applyAxisAngle(new THREE.Vector3(0,1,0),-plan.yaw);return Math.abs(q.x-14)<48&&Math.abs(q.z)<78;});
    const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion();
    const anchored=[],changes=new Map();
    scene.updateMatrixWorld(true);
    scene.traverse(mesh=>{
        if(!mesh.isInstancedMesh||! /^(Grove_|MoonwellFlora_|BachKhuyet_|LegacyFlora_)/.test(mesh.name))return;
        let maxShift=0;
        for(let i=0;i<mesh.count;i++){
            mesh.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);
            const oldY=position.y,legacy=mesh.name.startsWith('LegacyFlora_'),target=height(position.x,position.z)+(legacy?oldY:0),clear=Boolean(window.moonveilPalace?.affects(position.x,position.z))||rail.infrastructureAt(position.x,position.z)||Boolean(window.candyRealm?.contains(position.x,position.z))||Boolean(window.technologyBase?.contains(position.x,position.z))||Boolean(window.desertRealm?.contains(position.x,position.z)&&!desertRealm.protectedAt(position.x,position.z));
            position.y=target;if(clear)scale.setScalar(0);
            matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);
            maxShift=Math.max(maxShift,Math.abs(target-oldY));
            const key=position.x.toFixed(2)+','+position.z.toFixed(2);
            if(!legacy)changes.set(key,{delta:target-oldY,clear});
            anchored.push({mesh,index:i,x:position.x,z:position.z,y:target,cleared:clear,offset:legacy?oldY:0});
        }
        mesh.instanceMatrix.needsUpdate=true;
        if(mesh.geometry.boundingSphere)mesh.geometry.boundingSphere.radius+=maxShift;
    });
    for(const c of colliders){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
        if(!/^(grove-|bach-khuyet-rock|moonwell)/.test(c.name||'')||!Number.isFinite(c.x))continue;
        const shift=changes.get(c.x.toFixed(2)+','+c.z.toFixed(2));if(!shift)continue;
        c.minY+=shift.delta;c.maxY+=shift.delta;if(shift.clear)c.disabled=true;
    }
    let lastPlayer=null;
    function cameraNeedsReset(p){const reset=!lastPlayer||lastPlayer.distanceTo(p)>12;lastPlayer=p.clone();return reset;}
    function resetCamera(){lastPlayer=null;camera.near=.1;camera.updateProjectionMatrix();}
    const ray=new THREE.Raycaster();
    function clipCamera(origin,desired){if(window.undergroundNetwork?.inside(origin))return undergroundNetwork.clipCamera(origin,desired);
        if(window.evilCavern?.inside(origin))return desired;
        let result=window.grandTerminal?.clipCamera(origin,desired)??desired.clone();
        const delta=desired.clone().sub(origin),length=delta.length();if(length<.001)return result;
        // Static station walls and moving train bodies are real camera blockers.
        const blockers=window.desertRealm?.contains(origin.x,origin.z)?[...desertRealm.cameraObstacles]:[];
        if(window.antarcticRealm&&Math.hypot(origin.x+700,origin.z-2200)<200)blockers.push(...antarcticRealm.cameraObstacles);
        if(window.candyRealm?.contains(origin.x,origin.z))blockers.push(candyRealm.group);
        for(const village of window.westernHighlands?.villages||[])if(village.center.distanceTo(origin)<80)blockers.push(village.root);
        if(window.technologyBase?.center.distanceTo(origin)<160)blockers.push(technologyBase.group);
        for(const station of rail.stations)if(!station.grandTerminal&&station.model.position.distanceTo(origin)<180)blockers.push(station.model,station.access.root,station.foundation);
        if(window.moonveilPalace&&Math.hypot(origin.x-moonveilPalace.center.x,origin.z-moonveilPalace.center.z)<230)blockers.push(moonveilPalace.group);
        for(const vehicle of (rail.allVehicles||rail.vehicles))if(vehicle.position.distanceTo(origin)<65)blockers.push(vehicle);
        blockers.forEach(root=>root.updateWorldMatrix(true,true));
        ray.set(origin,delta.clone().normalize());ray.near=.12;ray.far=length;
        const hit=ray.intersectObjects(blockers,true).find(h=>h.object.material?.transparent!==true);
        if(hit)result.copy(origin).addScaledVector(delta,Math.max(.05,hit.distance-.13)/length);
        const travel=result.clone().sub(origin),steps=Math.max(2,Math.ceil(travel.length()/.15));let previous=origin.clone();
        for(let i=1;i<=steps;i++){
            const q=origin.clone().addScaledVector(travel,i/steps);
            if(q.y<height(q.x,q.z)+.12){let lo=(i-1)/steps,hi=i/steps;for(let j=0;j<12;j++){const t=(lo+hi)/2,test=origin.clone().addScaledVector(travel,t);if(test.y<height(test.x,test.z)+.12)hi=t;else lo=t;}return origin.clone().addScaledVector(travel,lo);}
            previous=q;
        }
        return result;
    }
    window.worldSurface={height,modifiedAt,anchored,clipCamera,cameraNeedsReset,resetCamera};
    window.mapVisualRepair.surface=height;
    window.mapVisualRepair.clipCamera=clipCamera;
    // Skirts and the copied obsidian shore were authored before station grading.
    // Rebuild their visible edges so they cannot remain suspended above the map.
    window.mapVisualRepair.refreshSeams();
    const shore=mercuryLake.group.getObjectByName('MercuryObsidianShore');
    if(shore){
        shore.updateWorldMatrix(true,false);const inverse=shore.matrixWorld.clone().invert(),vertices=shore.geometry.attributes.position;
        for(let i=0;i<vertices.count;i++){if(window.gameBoot.shouldYield())await window.gameBoot.yield();
            const p=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(shore.matrixWorld);
            p.y=height(p.x,p.z)+.025;p.applyMatrix4(inverse);vertices.setXYZ(i,p.x,p.y,p.z);
        }
        vertices.needsUpdate=true;shore.geometry.computeVertexNormals();shore.geometry.computeBoundingSphere();
    }
    rebuildCollisionGrid();
}
