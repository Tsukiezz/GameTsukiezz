/* Consistent lunar regolith and spatially batched mutant grass over the realm. */
function installLunarBiome(){
    let seed=940713;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#73767d';ctx.fillRect(0,0,512,512);
    for(let i=0;i<23000;i++){
        const shade=80+Math.floor(random()*85);ctx.fillStyle=`rgba(${shade},${shade+1},${shade+5},.24)`;ctx.fillRect(random()*512,random()*512,1+random()*2,1+random()*2);
    }
    for(let i=0;i<62;i++){
        const x=random()*512,y=random()*512,r=3+random()*23,g=ctx.createRadialGradient(x-r*.18,y-r*.2,r*.1,x,y,r);
        g.addColorStop(0,'#51555c');g.addColorStop(.68,'#656972');g.addColorStop(.85,'#92959c');g.addColorStop(1,'#74777e');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    moonTexture.image=canvas;moonTexture.needsUpdate=true;groundMat.color.setHex(0xa4a6ac);groundMat.roughness=.98;groundMat.metalness=.02;groundMat.emissive.setHex(0x000000);
    const vertices=[],indices=[],colors=[];
    for(let blade=0;blade<3;blade++){
        const a=blade*Math.PI/3,w=.045,offset=vertices.length/3;
        for(const [x,y,z] of [[-w,0,0],[w,0,0],[-w*.65,.32,.04],[w*.65,.32,.04],[0,.65,.13]]){
            vertices.push(x*Math.cos(a)+z*Math.sin(a),y,-x*Math.sin(a)+z*Math.cos(a));const v=y/.65;colors.push(.2+v*.5,.23+v*.67,.27+v*.5);
        }
        indices.push(offset,offset+2,offset+1,offset+1,offset+2,offset+3,offset+2,offset+4,offset+3);
    }
    const baseGeometry=new THREE.BufferGeometry();baseGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));baseGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));baseGeometry.setIndex(indices);baseGeometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({color:0xaac8bc,vertexColors:true,roughness:.95,side:THREE.DoubleSide,emissive:0x18312c,emissiveIntensity:.15});
    const bins=new Map(),placements=[],extent=EXPANDED_REALM_DATA.bound-18;
    function allowed(x,z){
        if(window.riverRealm?.waterAt(x,z)||window.riverRealm?.mountainContains(x,z))return false;
        if(window.bachKhuyet?.contains(x,z))return false;
        if(Math.abs(x)>extent||Math.abs(z)>extent||Math.hypot(x,z)<24)return false;
        if(x>-142&&x< -78&&z>85&&z<153)return false;
        if(x> -117&&x< -103&&z>38&&z<98)return false;
        if(Math.hypot((x-115)/1.15,(z-110)/.9)<62)return false;
        if(Math.hypot((x-mercuryLake.data.x)/mercuryLake.data.rx,(z-mercuryLake.data.z)/mercuryLake.data.rz)<1.45)return false;
        if(landmarksData.some(l=>l.id!=='ancient_tree'&&Math.hypot(x-l.x,z-l.z)<30))return false;
        if(Math.hypot(x-202,z+206)<23)return false;
        return true;
    }
    for(let patch=0;patch<230;patch++){
        const cx=(random()*2-1)*extent,cz=(random()*2-1)*extent;
        for(let i=0;i<48;i++){
            const angle=random()*Math.PI*2,r=Math.sqrt(random())*29,x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r;
            if(!allowed(x,z))continue;
            const y=window.riverRealm?.ground(x,z)??window.ancientGrove?.ground(x,z)??realmTerrainHeight(x,z),tier=i%5===0?'base':'detail';
            const item={x,y,z,angle:random()*Math.PI*2,scale:.45+random()*.7,color:[0x85b59d,0xa894bd,0xa6b48b][patch%3]};placements.push(item);
            const key=Math.floor(x/96)+','+Math.floor(z/96)+','+tier;if(!bins.has(key))bins.set(key,{tier,items:[]});bins.get(key).items.push(item);
        }
    }
    const group=new THREE.Group();group.name='WorldMutantGrass';const dummy=new THREE.Object3D(),color=new THREE.Color();let baseCount=0;
    for(const {tier,items} of bins.values()){
        const geometry=baseGeometry.clone(),mesh=new THREE.InstancedMesh(geometry,material,items.length),bounds=new THREE.Box3();mesh.name='LunarGrass_'+tier;mesh.userData.optionalFlora=tier==='detail';mesh.visible=tier==='base'||currentProfileKey!=='potato';
        items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.setHex(p.color));bounds.expandByPoint(new THREE.Vector3(p.x-1,p.y,p.z-1));bounds.expandByPoint(new THREE.Vector3(p.x+1,p.y+1,p.z+1));});
        geometry.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());group.add(mesh);if(tier==='base')baseCount+=items.length;
    }
    scene.add(group);window.lunarBiome={group,placements,baseCount,texture:moonTexture};
}
