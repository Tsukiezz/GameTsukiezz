/* Blender-authored woodland, shared terrain and discovery. No per-tree draw calls. */
function installAncientGrove(){
    const data=window.ANCIENT_GROVE_DATA;if(!data)return;
    const group=new THREE.Group();group.name='AncientMoonGrove';scene.add(group);
    const t=data.terrain,positions=[],indices=[],colors=[],uvs=[];
    const at=(i,j)=>t.heights[j*(t.nx+1)+i];
    function cell(x,z){
        const u=(x-t.x0)/t.step,v=(z-t.z0)/t.step,i=Math.floor(u),j=Math.floor(v);
        return i>=0&&j>=0&&i<t.nx&&j<t.nz&&t.cells[j*t.nx+i]?{i,j,fx:u-i,fz:v-j}:null;
    }
    function ground(x,z){
        const c=cell(x,z);if(!c)return null;
        const {i,j,fx,fz}=c,a=at(i,j),b=at(i+1,j),d=at(i,j+1),e=at(i+1,j+1);
        return fx+fz<=1?a+(b-a)*fx+(d-a)*fz:e+(d-e)*(1-fx)+(b-e)*(1-fz);
    }
    for(let j=0;j<=t.nz;j++)for(let i=0;i<=t.nx;i++){
        const x=t.x0+i*t.step,z=t.z0+j*t.step;positions.push(x,at(i,j),z);
        const f=(Math.sin(x*.18)*Math.cos(z*.14)+1)*.5;
        colors.push(.9+f*.1,.9+f*.1,.92+f*.08);uvs.push((x+EXPANDED_REALM_DATA.size/2)/EXPANDED_REALM_DATA.size,(EXPANDED_REALM_DATA.size/2-z)/EXPANDED_REALM_DATA.size);
    }
    for(let j=0;j<t.nz;j++)for(let i=0;i<t.nx;i++)if(t.cells[j*t.nx+i]){
        const a=j*(t.nx+1)+i,b=a+1,c=a+t.nx+1,d=c+1;indices.push(a,c,b,b,c,d);
    }
    const floorGeo=new THREE.BufferGeometry();floorGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    floorGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));floorGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));floorGeo.setIndex(indices);floorGeo.computeVertexNormals();
    const floor=new THREE.Mesh(floorGeo,new THREE.MeshStandardMaterial({vertexColors:true,map:moonTexture,color:0xa4a6ac,roughness:1}));floor.name='GroveForestFloor';floor.receiveShadow=true;group.add(floor);
    // Remove only original terrain triangles entirely covered by our physical terrain.
    const original=groundGeo.index,verts=groundGeo.attributes.position,kept=[];
    for(let i=0;i<original.count;i+=3){
        const ids=[original.getX(i),original.getX(i+1),original.getX(i+2)];
        if(ids.every(v=>cell(verts.getX(v),-verts.getY(v))))continue;
        kept.push(...ids);
    }
    groundGeo.setIndex(kept);
    const materials={};
    for(const [key,rgb] of Object.entries(data.materials)){
        const color=new THREE.Color(...rgb);
        materials[key]=new THREE.MeshStandardMaterial({color,roughness:.9,
            ...(key==='glow'?{emissive:color,emissiveIntensity:.6}:{})});
    }
    const dummy=new THREE.Object3D(),batches=[],geometryCache=new Map();
    function sharedGeometry(kind,part,low){
        const key=kind+':'+part.material+':'+low;if(geometryCache.has(key))return geometryCache.get(key);
        const source=low?(data.lowPrototypes?.[kind]?.find(p=>p.material===part.material)||part):part;
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(source.vertices.flat(),3));geo.setIndex(source.indices);geo.computeVertexNormals();geometryCache.set(key,geo);return geo;
    }
    function batchGeometry(source){const geo=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(source.attributes))geo.setAttribute(name,attribute);geo.setIndex(source.index);return geo;}
    // Spatial batches let frustum culling discard distant forest quadrants.
    const buckets=new Map();
    for(const item of data.instances){
        const key=item.kind+':'+Math.floor(item.x/96)+':'+Math.floor(item.z/96);
        if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(item);
        if(item.radius){
            addCylinderCollider(item.x,item.z,item.radius,item.y-.2,item.y+(item.kind==='elder'?85:item.kind==='rock'?3.6*item.scale:18*item.scale));
            Object.assign(colliders.at(-1),{name:'grove-'+item.kind});
        }
    }
    for(const items of buckets.values())for(const part of data.prototypes[items[0].kind]){
        const high=batchGeometry(sharedGeometry(items[0].kind,part,false)),low=batchGeometry(sharedGeometry(items[0].kind,part,true));
        const mesh=new THREE.InstancedMesh(high,materials[part.material],items.length);mesh.groveHigh=high;mesh.groveLow=low;
        mesh.name='Grove_'+items[0].kind;mesh.userData.grove=true;
        mesh.userData.optionalFlora=items[0].kind==='mushroom';
        for(let i=0;i<items.length;i++){
            const p=items[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.yaw,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
        }
        // Three r128 culls instances by the prototype sphere, not their world bounds.
        // Keep a world-space bounding sphere covering each small spatial batch.
        const bounds=new THREE.Box3();for(const p of items){const r=p.kind==='elder'?43:9*p.scale;bounds.expandByPoint(new THREE.Vector3(p.x-r,p.y,p.z-r));bounds.expandByPoint(new THREE.Vector3(p.x+r,p.y+(p.kind==='elder'?115:25*p.scale),p.z+r));}
        high.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());low.boundingSphere=high.boundingSphere;
        group.add(mesh);batches.push(mesh);
    }
    // Root collisions follow the twelve raised buttresses, leaving gaps between them.
    for(let i=0;i<12;i++){
        const a=i*Math.PI*2/12;addCylinderCollider(202+Math.cos(a)*7,-206+Math.sin(a)*7,1.1,.04,2.14,true);
        Object.assign(colliders.at(-1),{name:'grove-root',stepHeight:.2});
    }
    // Blender-authored titanium panels: one entrance, no trail geometry.
    for(const part of data.prototypes.titanium_fence||[]){
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(part.vertices.flat(),3));geo.setIndex(part.indices);geo.computeVertexNormals();
        const mesh=new THREE.Mesh(geo,materials[part.material]);mesh.name='PrimordialTitaniumFence';group.add(mesh);
    }
    for(const c of data.fence||[]){addBoxCollider(c.x,c.z,c.w,c.d,c.minY,c.maxY,false);colliders.at(-1).name='primordial-titanium-fence';}
    // Gate lintel clears the opening well above a jumping player.
    addBoxCollider(290,40,10.2,1.2,9.6,10.8,false);colliders.at(-1).name='primordial-gate-lintel';
    let discovered=false;const key='tsuventure_ancient_grove_discovered_v1';try{discovered=localStorage.getItem(key)==='true';}catch{}
    const landmark=landmarksData.find(l=>l.id==='ancient_tree');landmark.hidden=false;
    const item={id:'ancient_tree',pos:new THREE.Vector3(202,.04,-206),radius:18,prompt:'Hấp thụ linh lực Đại Cổ Thụ Nguyệt Tộc',type:'tree'};
    interactables.push(item);
    function refreshButton(){
        const button=document.getElementById('btn-travel-grove');if(button)button.textContent='🌲 Rừng Nguyên Sinh';
    }
    function update(x,z){
        if(!discovered&&Math.hypot(x-202,z+206)<data.discoveryRadius){
            discovered=true;landmark.hidden=false;try{localStorage.setItem(key,'true');}catch{}
            refreshButton();showNotification('🌳 Đã khám phá cây cổ thụ trong Rừng Nguyên Sinh!');
        }
    }
    window.ancientGrove={group,batches,ground,contains:(x,z)=>Boolean(cell(x,z)),get discovered(){return discovered;},update,refreshButton,setDetailProfile(key){for(const mesh of batches)mesh.geometry=key==='potato'?mesh.groveLow:mesh.groveHigh;},
        travel(){fastTravelTo(290,48,'Rừng Nguyên Sinh');},
        biomeAt(x,z){return cell(x,z)?'Rừng Nguyên Sinh':null;}};
    refreshButton();rebuildCollisionGrid();
}
