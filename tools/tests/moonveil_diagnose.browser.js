(()=>{
 if(!window.moonveilPalace)return {loading:window.gameBoot?.state.percent};
 scene.updateMatrixWorld(true);const center=moonveilPalace.center,origin=center.clone().add(new THREE.Vector3(170,162,290)),target=center.clone().add(new THREE.Vector3(0,20,0)),ray=new THREE.Raycaster(origin,target.clone().sub(origin).normalize(),.1,700);
 ray.camera=camera;const candidates=[];scene.traverseVisible(o=>{if(o.isMesh&&o.material)candidates.push(o)});
 const hits=ray.intersectObjects(candidates,false).slice(0,12).map(h=>({name:h.object.name,parent:h.object.parent?.name,instance:h.instanceId,point:h.point.toArray(),distance:h.distance}));
 const bounds=[];scene.traverse(o=>{if(!o.isMesh||!o.visible||o.isInstancedMesh||o.geometry.attributes.position.count>300000)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(b.max.x<250||b.min.x>750||b.max.z<230||b.min.z>760)return;if(b.max.y>110)bounds.push({name:o.name,parent:o.parent?.name,min:b.min.toArray(),max:b.max.toArray()});});
 return {progress:gameBoot.state.percent,hits,bounds,terrain:[...[320,400,490,580,660].map(x=>[x,450,window.worldSurface?.height(x,450)??moonveilPalace.designed(x,450)]),...[550,650,740].map(z=>[660,z,window.worldSurface?.height(660,z)??moonveilPalace.designed(660,z)])]};
})()
