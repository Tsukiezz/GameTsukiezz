(()=>{
 const meshes=[],world=worldExpansion.terrain;scene.updateMatrixWorld(true);
 const roots=[world,westernHighlands.group,westernHighlands.nature.group,candyRealm.group];
 for(const root of roots)root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,c=g.attributes.color,ix=g.index,positions=[],colors=[],v=new THREE.Vector3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4(),tint=new THREE.Color(),factor=new THREE.Color();
   const count=m.isInstancedMesh?m.count:1;
   for(let k=0;k<count;k++){matrix.copy(m.matrixWorld);factor.copy(m.material.color||new THREE.Color(.7,.7,.7));if(m.isInstancedMesh){m.getMatrixAt(k,instance);matrix.multiply(instance);if(m.instanceColor){m.getColorAt(k,tint);factor.multiply(tint);}}
     for(let n=0;n<(ix?.count??p.count);n+=3){const ids=[0,1,2].map(j=>ix?ix.getX(n+j):n+j);if(m===world&&ids.every(id=>p.getX(id)>-2440))continue;for(const id of ids){v.fromBufferAttribute(p,id).applyMatrix4(matrix);positions.push(v.x,-v.z,v.y);if(m===world){const snow=g.attributes.biomeSnow.getX(id),sand=g.attributes.riverSediment.getX(id);colors.push(...(sand>.6?[.65,.54,.38]:snow>.5?[.78,.87,.9]:[.57,.22,.14]));}else{colors.push((c?c.getX(id):1)*factor.r,(c?c.getY(id):1)*factor.g,(c?c.getZ(id):1)*factor.b);}}}
   }if(positions.length)meshes.push({name:m.name||root.name,positions,colors,indices:null});
 });
 const railways=[];for(const service of moonRailway.services){let current=[];for(const p of service.points){if(p.x<-2440)current.push([p.x,-p.z,p.y]);else if(current.length){if(current.length>1)railways.push(current);current=[];}}if(current.length>1)railways.push(current);}
 return {center:[-3000,90,0],meshes,railways};
})()
