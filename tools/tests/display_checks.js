(() => {
 enterGame();setGraphicsProfile('potato');
 const cg=castlePhysics.group;scene.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();const results=[];
 const check=(name,ok,detail={})=>results.push({name,ok:!!ok,detail});
 const samples=[['south',-124,100,0,-1],['north',-110,140,0,1],
                ['west',-128,120,-1,0],['east',-92,120,1,0]];
 for(const [name,x,z,dx,dz] of samples){
  ray.set(new THREE.Vector3(x,1.05,z),new THREE.Vector3(dx,0,dz));ray.far=2;
  const hits=ray.intersectObjects(castlePhysics.cameraObstacles,false);
  check(name+' visible wall meets floor edge',hits.length&&Math.abs(hits[0].distance-.4)<.005,{distance:hits[0]?.distance});
  check(name+' wall matches collision boundary',checkCollision(x+dx*.45,z+dz*.45,1));
  const origin=new THREE.Vector3(x,1.45,z),desired=origin.clone().add(new THREE.Vector3(dx*3,.2,dz*3));
  const clipped=clipCastleCamera(origin,desired);
  check(name+' camera stays clear of wall',clipped.distanceTo(origin)<.3&&!checkCollision(clipped.x,clipped.z,1.45));
 }
 check('Opaque liners remain batched',!cg.children.some(o=>o.name==='room-basement-lining'));
 return {results};
})()
