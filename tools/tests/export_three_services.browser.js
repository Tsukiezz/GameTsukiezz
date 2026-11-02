(()=>{
    const r=moonRailway,surfaces=[ground,window.terrainContinuity?.terrain,window.technologyBase?.terrain,window.desertRealm?.terrain,window.desertRealm?.walkingPath,window.riverRealm?.terrain,window.bachKhuyet?.terrain,window.volcanicValley?.terrain,window.mangroveRealm?.terrain,window.ancientGrove?.group.getObjectByName('GroveForestFloor'),r.earthBed].filter(Boolean);
    scene.updateMatrixWorld(true);
    function captureRoots(roots){const out=[];for(const root of roots.filter(Boolean)){root.updateWorldMatrix(true,true);root.traverse(mesh=>{if(!mesh.isMesh||mesh===window.technologyBase?.terrain||mesh.material?.map||mesh.material?.transparent)return;const g=mesh.geometry,p=g.attributes.position,vertices=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);vertices.push(v.x,v.y,v.z);}out.push({name:mesh.name||root.name,group:root.name,vertices,indices:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),color:mesh.material.color?.toArray()||[.4,.4,.4],colors:g.attributes.color?Array.from(g.attributes.color.array):null});});}return out;}
    const boat=window.riverBoat?.group.clone(true);if(boat){boat.position.copy(technologyBase.center).add(new THREE.Vector3(0,1,12));boat.rotation.set(0,0,0);}
    return {
        services:r.trains.map(t=>({id:t.id,name:t.name,color:t.color,bounds:t.bounds})),
        paths:r.networkPaths.map(path=>path.points.map(p=>p.toArray())),
        bridgeSections:r.renderedBridgeSections.map(p=>({pathIndex:p.pathIndex,position:p.position.toArray(),yaw:p.yaw,pitch:p.pitch,widthScale:p.widthScale,guards:p.guards})),
        junctionDeckCells:[...r.junctionDeckCells.values()].map(p=>p.toArray()),
        junctions:r.junctions.map(j=>({id:j.id,center:j.center.toArray(),radius:j.radius})),
        pillars:r.pillars.map(p=>({position:p.position.toArray(),height:p.userData.height})),
        stations:r.stations.map(s=>({name:s.name,lineId:s.lineId,grounded:s.grounded,position:s.model.position.toArray(),yaw:s.yaw,access:{position:s.access.root.position.toArray(),surfaces:s.access.surfaces,solids:s.access.solids,rampVertices:s.access.rampVertices,rampIndices:s.access.rampIndices},slabTop:s.slabTop})),
        materials:RAILWAY_ASSETS.materials,
        pyramidLevels:window.desertRealm?.floors?.levels.map(l=>({level:l.level,cells:l.n*l.n,height:l.base})),
        mercuryShorePosts:window.mercuryLake?.shorePosts||[],
        technologyGeometry:captureRoots([window.technologyBase?.group,boat]),
        wildlifeGeometry:captureRoots(window.livingWorld?.actors.filter(a=>['elephant','chicken','buffalo'].includes(a.kind)).map(a=>a.group)||[]),
        desertGeometry:(()=>{const out=[];window.desertRealm?.group.traverse(mesh=>{if(!mesh.isMesh||mesh===desertRealm.terrain||mesh===desertRealm.walkingPath||mesh.material?.transparent||mesh.material?.map)return;const g=mesh.geometry,p=g.attributes.position,vertices=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);vertices.push(v.x,v.y,v.z);}let parent=mesh;while(parent.parent&&parent.parent!==desertRealm.group)parent=parent.parent;out.push({name:mesh.name||parent.name||'DesertPart',group:parent.name,vertices,indices:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),color:mesh.material.color?.toArray()||[.4,.3,.2],colors:g.attributes.color?Array.from(g.attributes.color.array):null});});return out;})(),
        groundSurfaces:surfaces.map(mesh=>{const g=mesh.geometry,p=g.attributes.position,vertices=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);vertices.push(v.x,v.y,v.z);}return {name:mesh.name||'LunarGround',vertices,indices:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),color:mesh===r.earthBed?[.41,.45,.50]:[.20,.26,.31]};}),
        trains:r.trains.map(t=>({id:t.id,color:new THREE.Color(t.color).toArray(),trim:new THREE.Color(t.id==='yellow'?'#287bc2':'#edc65c').toArray(),roof:new THREE.Color(t.id==='blue'?'#103e67':t.id==='yellow'?'#8b641a':'#283944').toArray(),vehicles:t.vehicles.map(v=>({position:v.position.toArray(),yaw:v.rotation.y,pitch:v.rotation.x}))}))
    };
})()
