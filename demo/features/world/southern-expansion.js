/* A continuous 6.72 km world ring, connecting rivers and a broad Antarctic shelf. */
function installSouthernExpansion(){
    const group=new THREE.Group();group.name='SouthernExpandedWorld';scene.add(group);
    const size=6720,half=size/2,step=20,n=size/step,oldHalf=EXPANDED_REALM_DATA.size/2;
    const oldSurface=sampleDesertTerrain([ground,terrainContinuity.terrain,riverRealm.terrain,bachKhuyet.terrain,mangroveRealm.terrain,volcanicValley.terrain,window.desertRealm?.terrain].filter(Boolean));
    const connector=(x,z)=>z>760&&z<oldHalf+20&&Math.abs(x+257.071)<110;
    const contains=(x,z)=>Math.max(Math.abs(x),Math.abs(z))>=oldHalf-.001||connector(x,z);
    const antarctic=(x,z)=>z>1320&&Math.abs(x)<2780;
    const smooth=THREE.MathUtils.smoothstep;
    // The old channel ends at the old southern edge. Its exact water elevation
    // anchors all downstream channels, so boats do not hit a vertical water seam.
    const oldSegments=riverRealm.data.segments,ends=oldSegments.flatMap(s=>[s.a,s.b]),mouth=ends.reduce((a,b)=>b[2]>a[2]?b:a),waterY=mouth[1];
    const paths=[[[mouth[0],mouth[2]],[mouth[0],1160],[-1700,1330],[-1860,1720],[-1750,2120],[-1100,2500],[0,2720],[1100,2600],[1950,2200],[2330,1500],[2450,600],[2300,-400],[1900,-1500],[800,-2350],[-700,-2600],[-1900,-2200],[-2500,-1300],[-2500,-200],[-2200,650],[-1700,1330]],[[2330,1500],[2900,1100],[3040,100],[2900,-1100],[2100,-2100]], [[-1750,2120],[-2600,2400],[-3000,2900]],[[1100,2600],[1800,2950],[2700,3070]]];
    for(const z of [-2800,-2300,-1800,1500,1950,2450,2950])paths.push(Array.from({length:13},(_,i)=>[-3000+i*500,z+Math.sin(i*.9+z*.003)*65]));
    for(const x of [-2900,-2400,-1900,1900,2400,2900])paths.push(Array.from({length:13},(_,i)=>[x+Math.sin(i*.8+x*.003)*60,-3000+i*500]));
    const segments=[],cells=new Map(),wetTriangles=new Set(),cell=128;
    for(const [pathId,nodes] of paths.entries()){const curve=new THREE.CatmullRomCurve3(nodes.map(([x,z])=>new THREE.Vector3(x,waterY,z)),false,'centripetal'),count=Math.ceil(curve.getLength()/24),points=curve.getPoints(count);for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],s={a,b,pathId,width:22+4*Math.sin(pathId*1.7)+2*Math.sin(i*.18+pathId)};const id=segments.push(s)-1;for(let x=Math.floor((Math.min(a.x,b.x)-100)/cell);x<=Math.floor((Math.max(a.x,b.x)+100)/cell);x++)for(let z=Math.floor((Math.min(a.z,b.z)-100)/cell);z<=Math.floor((Math.max(a.z,b.z)+100)/cell);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(id);}}}
    function nearest(x,z){let best=null;for(const i of cells.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[]){const s=segments[i],dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=THREE.MathUtils.clamp(((x-s.a.x)*dx+(z-s.a.z)*dz)/(dx*dx+dz*dz),0,1),distance=Math.hypot(x-s.a.x-t*dx,z-s.a.z-t*dz);if(!best||distance-s.width<best.distance-best.width)best={...s,distance};}return best;}
    const lake={x:1100,z:2600,rx:320,rz:230,y:waterY};
    function waterAt(x,z){const sample=locateCell(x,z);if(!sample||!wetTriangles.has(sample.key)||Math.max(Math.abs(x),Math.abs(z))<oldHalf&&z<mouth[2]-.02)return null;const bottom=height(x,z);return Number.isFinite(bottom)&&bottom<waterY-.025?{y:waterY,bottom,kind:'southern-river'}:null;}
    function waterRegion(x,z){if(height(x,z)===null)return false;if(Math.max(Math.abs(x),Math.abs(z))<oldHalf&&z<mouth[2]-.02)return false;const hit=nearest(x,z);return Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)<1.4||Boolean(hit&&hit.distance<hit.width+78);}
    function baseHeight(x,z){const distance=Math.max(Math.abs(x),Math.abs(z))-oldHalf,blend=smooth(distance,0,150),edge=oldSurface(THREE.MathUtils.clamp(x,-oldHalf,oldHalf),THREE.MathUtils.clamp(z,-oldHalf,oldHalf)),polar=smooth(z,1280,1750),rolling=9+7*Math.sin(x*.0017)*Math.cos(z*.0013)+2*Math.sin((x+z)*.006),shelf=waterY+8+7*Math.sin(x*.001)*Math.cos(z*.0013),natural=Math.max(waterY+3,THREE.MathUtils.lerp(rolling,shelf,polar));let y=Math.max(Math.abs(x),Math.abs(z))<oldHalf?oldSurface(x,z):THREE.MathUtils.lerp(edge,natural,blend);
        return y;
    }
    const highlands=createWesternHighlandProfile(nearest,baseHeight);
    function raw(x,z){const blend=smooth(Math.max(Math.abs(x),Math.abs(z))-oldHalf,0,150);let y=highlands.shape(x,z,baseHeight(x,z));
        const hit=nearest(x,z),lakeDistance=(Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)-1)*250,riverDistance=hit?hit.distance-hit.width:10000,bank=Math.min(lakeDistance,riverDistance);
        if(bank<70&&(blend>0||connector(x,z))){const width=lakeDistance<riverDistance?30:(hit?.width??22),carved=bank<=0?THREE.MathUtils.lerp(waterY-5.5,waterY+.05,smooth(bank,-width*.6,0)):bank<12?THREE.MathUtils.lerp(waterY+.05,waterY+4.5,smooth(bank,0,12)):THREE.MathUtils.lerp(waterY+4.5,Math.max(y,waterY+4.5),smooth(bank,12,65));y=THREE.MathUtils.lerp(y,carved,connector(x,z)?smooth(z,mouth[2]+5,mouth[2]+70):1);}
        // Inland ice plateau: continuous 140m rise with a stream plunging into the lake.
        const plateau=(1-smooth(Math.abs(x-1100),180,470))*(1-smooth(Math.abs(z-3130),90,300));y+=plateau*145*smooth(bank,15,95);
        // Factory courtyard is a broad flat clearing outside both lake and queen arena.
        const factory=1-smooth(Math.max(Math.abs(x+700)/120,Math.abs(z-2200)/110),.75,1.2);y=THREE.MathUtils.lerp(y,waterY+15,factory);
        return y;
    }
    for(const mesh of [ground,terrainContinuity.terrain,riverRealm.terrain]){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,inverse=mesh.matrixWorld.clone().invert();for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);if(!connector(v.x,v.z))continue;v.y=Math.min(v.y,raw(v.x,v.z)-.04);v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();}
    const vertices=[],colors=[],indices=[],heights=[],visibleCells=new Set(),moon=new THREE.Color(0x656971),snow=new THREE.Color(0xc0d8dd);
    for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const x=-half+i*step,z=-half+j*step,y=raw(x,z),c=moon.clone().lerp(snow,smooth(z,1450,1750));vertices.push(x,y,z);heights.push(y);const shade=.94+.06*Math.sin(x*.02+z*.03);colors.push(c.r*shade,c.g*shade,c.b*shade);}
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=-half+(i+.5)*step,z=-half+(j+.5)*step;if(Math.abs(x)<oldHalf&&Math.abs(z)<oldHalf&&!connector(x,z))continue;const a=j*(n+1)+i;visibleCells.add(j*n+i);indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();const terrain=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}));terrain.name='SouthernContinuousTerrain';group.add(terrain);
    function locateCell(x,z){if(Math.abs(x)>half+.001||Math.abs(z)>half+.001)return null;const u=THREE.MathUtils.clamp((x+half)/step,0,n-.0000001),v=THREE.MathUtils.clamp((z+half)/step,0,n-.0000001);let i=Math.floor(u),j=Math.floor(v);if(!visibleCells.has(j*n+i)){const valid=[[i-1,j],[i,j-1],[i-1,j-1]].find(([a,b])=>a>=0&&b>=0&&visibleCells.has(b*n+a)&&u-a<=1.000001&&v-b<=1.000001);if(!valid)return null;[i,j]=valid;}const fx=THREE.MathUtils.clamp(u-i,0,1),fz=THREE.MathUtils.clamp(v-j,0,1);return {i,j,fx,fz,key:(j*n+i)*2+(fx+fz<=1?0:1)};}
    function height(x,z){const sample=locateCell(x,z);if(!sample)return null;const {i,j,fx,fz}=sample,a=j*(n+1)+i,p=geometry.attributes.position,A=p.getY(a),B=p.getY(a+1),C=p.getY(a+n+1),D=p.getY(a+n+2);return fx+fz<=1?A+(B-A)*fx+(C-A)*fz:D+(C-D)*(1-fx)+(B-D)*(1-fz);}
    const waterMaterial=new THREE.MeshStandardMaterial({color:0x397f78,roughness:.3,metalness:.12,transparent:true,opacity:.94,side:THREE.DoubleSide});
    const water=new THREE.Mesh(new THREE.BufferGeometry(),waterMaterial);water.name='SouthernConnectedWater';group.add(water);
    let waterBoundary=[];
    function rebuildWater(){
        const positions=[],indices=[],depths=[],flows=[],p=geometry.attributes.position,ix=geometry.index;waterBoundary=[];wetTriangles.clear();
        function clip(poly,value){const output=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=value(a),db=value(b);if(da<=0)output.push(a);if((da<=0)!==(db<=0))output.push(a.clone().lerp(b,da/(da-db)));}return output;}
        for(let i=0;i<ix.count;i+=3){let poly=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix.getX(i+k))),center=poly.reduce((v,q)=>v.add(q),new THREE.Vector3()).multiplyScalar(1/3);if(!waterRegion(center.x,center.z)&&!poly.some(v=>waterRegion(v.x,v.z)))continue;
            poly=clip(poly,v=>v.y-(waterY-.015));if(!poly.length)continue;
            if(Math.max(Math.abs(center.x),Math.abs(center.z))<oldHalf)poly=clip(poly,v=>mouth[2]-.02-v.z);
            if(poly.length<3)continue;const cell=locateCell(center.x,center.z);if(cell)wetTriangles.add(cell.key);for(const v of poly)if(Math.abs(v.y-(waterY-.015))<1e-5)waterBoundary.push(v.clone());
            const start=positions.length/3;for(const v of poly){positions.push(v.x,waterY,v.z);depths.push(Math.max(0,waterY-v.y));const hit=nearest(v.x,v.z),d=hit?hit.b.clone().sub(hit.a).normalize():new THREE.Vector3(1,0,0);flows.push(d.x,d.z);}for(let k=1;k<poly.length-1;k++)indices.push(start,start+k,start+k+1);
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('riverDepth',new THREE.Float32BufferAttribute(depths,1));g.setAttribute('riverFlow',new THREE.Float32BufferAttribute(flows,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();water.geometry.dispose();water.geometry=g;if(window.worldExpansion)worldExpansion.waterBoundary=waterBoundary;return waterBoundary.length;
    }
    rebuildWater();
    EXPANDED_REALM_DATA.bound=half-32;EXPANDED_REALM_DATA.mapSpan=size;
    window.worldExpansion={drawMinimap(ctx,cx,cy,scale){window.westernHighlands?.drawMinimap(ctx,cx,cy,scale);ctx.save();ctx.strokeStyle='#5e9fb7';ctx.lineWidth=1.3;ctx.beginPath();for(const s of segments){ctx.moveTo(cx+s.a.x*scale,cy+s.a.z*scale);ctx.lineTo(cx+s.b.x*scale,cy+s.b.z*scale);}ctx.stroke();ctx.fillStyle='#88c8df';ctx.beginPath();ctx.ellipse(cx+lake.x*scale,cy+lake.z*scale,lake.rx*scale,lake.rz*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();},highlands,group,terrain,water,waterMaterial,rebuildWater,waterBoundary,waterRegion,wetTriangles,locateCell,waterY,segments,paths,lake,size,half,step,contains,antarctic,height,raw,waterAt,nearest,oldHalf};
}
