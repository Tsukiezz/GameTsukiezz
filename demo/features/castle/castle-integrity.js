/* Repair complete exhibit assemblies before meshes and colliders are built. */
function prepareCastleIntegrity(data){
    let fingerprint=2166136261;for(const c of JSON.stringify(data.parts.map(p=>[p.name,p.position,p.size])))fingerprint=Math.imul(fingerprint^c.charCodeAt(0),16777619);
    const volumes=data.parts.filter(p=>/^(armory-display-volume|dragon-table-base-volume)$/.test(p.name)),report={relocated:[],sealed:[],raySamples:0};
    const groups=volumes.map(v=>({v,parts:[]}));
    for(const p of data.parts){if(!/^(armor-|armory-|dragon-)/.test(p.name))continue;const dragon=p.name.startsWith('dragon-'),options=groups.filter(g=>g.v.name.startsWith(dragon?'dragon-':'armory-')&&Math.abs(g.v.position[1]-p.position[1])<3);const nearest=options.sort((a,b)=>a.v.position.reduce((s,x,i)=>s+(x-p.position[i])**2,0)-b.v.position.reduce((s,x,i)=>s+(x-p.position[i])**2,0))[0];nearest?.parts.push(p);}
    const partitions=data.parts.filter(p=>p.name==='room-wall');
    const intersects=(a,b)=>a.position.every((v,i)=>Math.min(v+a.size[i]/2,b.position[i]+b.size[i]/2)-Math.max(v-a.size[i]/2,b.position[i]-b.size[i]/2)>.025);
    for(const g of groups){if(!g.parts.some(p=>partitions.some(w=>intersects(p,w))))continue;const floor=g.v.position[1]-g.v.size[1]/2,room=data.rooms.filter(r=>!r.corridor&&Math.abs(r.floor-floor)<.3).sort((a,b)=>Math.hypot((a.minX+a.maxX)/2-g.v.position[0],(a.minZ+a.maxZ)/2-g.v.position[2])-Math.hypot((b.minX+b.maxX)/2-g.v.position[0],(b.minZ+b.maxZ)/2-g.v.position[2]))[0];if(!room)continue;const minX=Math.min(...g.parts.map(p=>p.position[0]-p.size[0]/2)),maxX=Math.max(...g.parts.map(p=>p.position[0]+p.size[0]/2)),minZ=Math.min(...g.parts.map(p=>p.position[2]-p.size[2]/2)),maxZ=Math.max(...g.parts.map(p=>p.position[2]+p.size[2]/2));const dx=Math.max(0,room.minX+.55-minX)+Math.min(0,room.maxX-.55-maxX),dz=Math.max(0,room.minZ+.55-minZ)+Math.min(0,room.maxZ-.55-maxZ);for(const p of g.parts){p.position[0]+=dx;p.position[2]+=dz;}report.relocated.push({name:g.v.blenderObject,room:room.name,parts:g.parts.length,dx,dz});}
    report.adjustedPassages=[];
    for(const p of data.parts.filter(p=>p.name==='room-maze-baffle'))for(const r of data.rooms){if(!r.door||r.door.axis!=='x'||Math.abs(p.position[1]-p.size[1]/2-r.floor)>.1||Math.abs(p.position[2]-r.door.z)>r.door.width/2+p.size[2]/2+.2)continue;const lo=p.position[0]-p.size[0]/2,hi=p.position[0]+p.size[0]/2,x=r.door.x;if(x>0&&lo<x-.85&&hi>x-.85&&hi<x+.4){p.size[0]=x-.85-lo;p.position[0]=(lo+x-.85)/2;report.adjustedPassages.push({room:r.name,floor:r.floor});}else if(x<0&&hi>x+.85&&lo<x+.85&&lo>x-.4){p.size[0]=hi-x-.85;p.position[0]=(hi+x+.85)/2;report.adjustedPassages.push({room:r.name,floor:r.floor});}}
    window.castleIntegrity={report,intersects,fingerprint:fingerprint>>>0};
}
function sealCastleIntegrity(){
    const cg=castlePhysics.group,report=castleIntegrity.report,meshes=[];
    const texture=cg.getObjectByName('room-wall-batch')?.material?.map?.clone();if(texture){texture.repeat.set(1,1);texture.needsUpdate=true;}
    const material=new THREE.MeshStandardMaterial({color:0x263449,roughness:.95,side:THREE.DoubleSide,map:texture||null});
    function patch(position,size){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);mesh.name='CastleEnvelopeSeal';cg.add(mesh);meshes.push(mesh);addBoxCollider(position[0]-110,position[2]+120,size[0],size[2],position[1]-size[1]/2,position[1]+size[1]/2,false);colliders.at(-1).name=mesh.name;report.sealed.push({position,size});}
    // Continuous skins replace sampled square patches. Room entrances face the
    // central corridor; only the three exterior faces of each wing are sealed.
    for(const floor of [1,6,9.5,13,20])for(const side of [-1,1]){
        const rooms=CASTLE_EXTENSION.rooms.filter(r=>r.floor===floor&&!r.corridor&&Math.sign(r.minX)===side);if(!rooms.length)continue;
        const minX=Math.min(...rooms.map(r=>r.minX)),maxX=Math.max(...rooms.map(r=>r.maxX)),minZ=Math.min(...rooms.map(r=>r.minZ)),maxZ=Math.max(...rooms.map(r=>r.maxZ)),top=({1:5.6,6:9.2,9.5:12.7,13:19.6,20:27.7})[floor],y=(floor+top)/2,height=top-floor+.08;
        patch([side<0?minX-.35:maxX+.35,y,(minZ+maxZ)/2],[.3,height,maxZ-minZ+1.1]);
        for(const edge of [minZ-.35,maxZ+.35])patch([(minX+maxX)/2,y,edge],[maxX-minX+1.1,height,.3]);
    }
    patch([0,27.9,1],[40.2,.4,42.2]);
    const positions=[],uvs=[];for(const mesh of meshes){mesh.updateMatrix();const g=mesh.geometry.toNonIndexed();g.applyMatrix4(mesh.matrix);const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));uvs.push((ny>.6?p.getX(i):nx>nz?p.getZ(i):p.getX(i))*.2,(ny>.6?p.getZ(i):p.getY(i))*.2);}cg.remove(mesh);g.dispose();mesh.geometry.dispose();}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();const batch=new THREE.Mesh(geometry,material);batch.name='CastleEnvelopeSeals';cg.add(batch);castlePhysics.cameraObstacles.push(batch);report.mode='continuous exterior skins';castleIntegrity.meshes=[batch];rebuildCollisionGrid();
}
