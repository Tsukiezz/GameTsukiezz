/* The geometry here is exported from Blender, shared by world and library. */
const lunarGeometryCache=new Map(),lunarResidentCache=new Map();
function lunarAssetParts(kind){
    if(lunarGeometryCache.has(kind))return lunarGeometryCache.get(kind);
    const list=LUNAR_VILLAGE_ASSETS.models[kind].map(p=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p.vertices.flat(),3));geometry.setIndex(p.indices);geometry.computeVertexNormals();return {...p,geometry};});lunarGeometryCache.set(kind,list);return list;
}
function stampLunarModel(bins,kind,matrix,overrides={},prefix=kind){for(const p of lunarAssetParts(kind)){const color=overrides[p.role]||LUNAR_VILLAGE_ASSETS.materials[p.role];bins.add(p.geometry,matrix,color,prefix+'_'+p.role);}}
function createLunarResident(index){
    const role=index%3,key=index%12;if(lunarResidentCache.has(key))return lunarResidentCache.get(key).clone(true);
    const positions=[],colors=[],suit=['#688a9c','#927f9e','#779887','#ad9476'][index%4];for(const p of lunarAssetParts('resident_'+role)){const g=p.geometry.toNonIndexed(),n=g.attributes.normal,color=new THREE.Color(p.role==='suit'?suit:LUNAR_VILLAGE_ASSETS.materials[p.role]);positions.push(...g.attributes.position.array);for(let i=0;i<n.count;i++){const light=.65+.3*Math.max(0,n.getY(i))+.05*Math.max(0,n.getZ(i));colors.push(color.r*light,color.g*light,color.b*light);}g.dispose();}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const root=new THREE.Group();root.name='BlenderLunarResident';root.userData.railwayIgnore=true;root.userData.blenderAuthored=true;root.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false,side:THREE.DoubleSide})));root.scale.setScalar(.52);lunarResidentCache.set(key,root);return root.clone(true);
}

/* Adapt the Blender tower's proportions to each real, walkable span. */
function finishSuspensionBridge(root,rows,side,center,railway=false){
    const bins=makeDesertMeshBins(root),width=railway?12:6,detail={suspension:true,width,towers:[],hangers:[],anchors:[],blenderSource:'LunarVillageAndSuspensionDesign'},count=rows.length;
    const cumulative=[0];for(let i=1;i<count;i++)cumulative.push(cumulative.at(-1)+rows[i].p.distanceTo(rows[i-1].p));const length=cumulative.at(-1),a=rows[0].p,b=rows.at(-1).p,forward=b.clone().sub(a);forward.y=0;forward.normalize();const yaw=Math.atan2(forward.x,forward.z),rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),scaleX=width/6;
    function add(name,g,matrix,color){bins.add(g,matrix,color,name);}
    function tube(name,points,r,color){add(name,new THREE.TubeGeometry((points.length===2?new THREE.LineCurve3(points[0],points[1]):new THREE.CatmullRomCurve3(points)),Math.max(16,points.length*2),r,6,false),new THREE.Matrix4(),color);}
    const i0=Math.max(1,Math.floor(count*.2)),i1=Math.min(count-2,Math.floor(count*.8));
    for(const index of [i0,i1]){const p=rows[index].p.clone(),matrix=new THREE.Matrix4().compose(p,rotation,new THREE.Vector3(scaleX,1,1));stampLunarModel(bins,'suspension_tower',matrix,{},'BlenderSuspensionTower');detail.towers.push({position:p.clone(),height:18,index});for(const sign of [-1,1]){const q=p.clone().addScaledVector(side,sign*4.6*scaleX);const ground=window.worldSurface?.height(q.x,q.z)??moonRailway.terrainHeight(q.x,q.z),h=Math.max(0,p.y-ground);if(h>.2){const matrix=new THREE.Matrix4().compose(new THREE.Vector3(q.x,ground+h/2,q.z),rotation,new THREE.Vector3(1,1,1));add('SuspensionTowerFoundation',new THREE.BoxGeometry(1.6*scaleX*Math.min(2.5,1+h/50),h,2.1*Math.min(2.5,1+h/50)),matrix,'#7e8b92');addCylinderCollider(q.x,q.z,scaleX,ground,p.y,false);colliders.at(-1).name='suspension-tower-foundation';}addCylinderCollider(q.x,q.z,.7,p.y,p.y+17,false);colliders.at(-1).name='suspension-tower';}}
    for(const sign of [-1,1]){
        const cable=[];for(let i=0;i<count;i++){const p=rows[i].p.clone().addScaledVector(side,sign*(width/2+.35));let h;if(i<i0)h=THREE.MathUtils.lerp(2.2,17,(i/Math.max(1,i0)));else if(i>i1)h=THREE.MathUtils.lerp(17,2.2,(i-i1)/Math.max(1,count-1-i1));else{const t=(i-i0)/(i1-i0);h=5.3+11.7*(2*t-1)**2;}p.y+=h;cable.push(p);}tube('SuspensionMainCable',cable,railway?.2:.11,'#b8ad93');
        const handrail=[];for(let i=0;i<count;i++){const p=rows[i].p.clone().addScaledVector(side,sign*(width/2+.1));p.y+=railway?1.65:1.2;handrail.push(p);}tube('SuspensionHandrail',handrail,.085,'#b9b197');
        for(let i=2;i<count-2;i+=Math.max(2,Math.round(count/40))){const p=handrail[i],q=cable[i];tube('SuspensionVerticalHanger',[p,q],railway?.065:.035,'#7f949c');detail.hangers.push({a:p.clone(),b:q.clone()});}
        for(let i=1;i<count;i++){const pa=handrail[i-1],pb=handrail[i],mid=pa.clone().lerp(pb,.5),d=pa.distanceTo(pb),angle=Math.atan2(pb.x-pa.x,pb.z-pa.z),cs=Math.abs(Math.cos(angle)),sn=Math.abs(Math.sin(angle));colliders.push({type:'orientedBox',x:mid.x,z:mid.z,width:.18,depth:d+.04,angle,minX:mid.x-(.18*cs+d*sn)/2,maxX:mid.x+(.18*cs+d*sn)/2,minZ:mid.z-(.18*sn+d*cs)/2,maxZ:mid.z+(.18*sn+d*cs)/2,minY:Math.min(pa.y,pb.y)-1.2,maxY:Math.max(pa.y,pb.y)+.12,isStandable:false,name:'suspension-safety-rail'});}
        for(const index of [0,count-1]){const p=rows[index].p.clone().addScaledVector(side,sign*(width/2+.7));stampLunarModel(bins,'suspension_anchor',new THREE.Matrix4().compose(p,rotation,new THREE.Vector3(1,1,1)),{},'BlenderCableAnchor');detail.anchors.push(p);}
        const edge=rows.map(r=>r.p.clone().addScaledVector(side,sign*(width/2-.12)).add(new THREE.Vector3(0,-.3,0)));tube('SuspensionDeckGirder',edge,.23,'#596f7c');
    }
    // Cross members and a plank rhythm make the deck readable at ground level.
    for(let i=0;i<count;i+=4){const p=rows[i].p.clone();p.y-=.13;add('SuspensionDeckCrossbeam',new THREE.BoxGeometry(width,.2,.22),new THREE.Matrix4().compose(p,rotation,new THREE.Vector3(1,1,1)),'#8b7d68');}
    bins.finish();root.userData.blenderAuthored=true;return detail;
}
