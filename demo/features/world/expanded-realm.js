/* Blender terrain and monumental Mercury Lake; one shared height field. */
function realmTerrainHeight(x,z){
    const d=window.EXPANDED_REALM_DATA;if(!d)return 0;
    const u=Math.max(0,Math.min(d.segments-.000001,(x+d.size/2)/d.size*d.segments));
    const v=Math.max(0,Math.min(d.segments-.000001,(z+d.size/2)/d.size*d.segments));
    const i=Math.floor(u),j=Math.floor(v),fx=u-i,fz=v-j,n=d.segments+1;
    const a=d.heights[j*n+i],b=d.heights[j*n+i+1],c=d.heights[(j+1)*n+i],e=d.heights[(j+1)*n+i+1];
    return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:e+(c-e)*(1-fx)+(b-e)*(1-fz);
}
function installMercuryLake(){
    const data=EXPANDED_REALM_DATA.lake,group=new THREE.Group();group.name='MonumentalMercuryLake';group.position.set(data.x,0,data.z);scene.add(group);
    const material={};for(const [key,rgb] of Object.entries(data.materials)){
        const color=new THREE.Color(...rgb);
        material[key]=['rune','ember'].includes(key)?new THREE.MeshBasicMaterial({color}):new THREE.MeshStandardMaterial({color,roughness:.88,metalness:key==='silver'?.65:.15});
    }
    const bins=new Map();
    for(const part of data.parts){
        if(/lake-basalt-cliff|lake-outer-spire/.test(part.name))continue;
        if(!bins.has(part.material))bins.set(part.material,{vertices:[],indices:[]});
        const b=bins.get(part.material),offset=b.vertices.length/3;b.vertices.push(...part.vertices.flat());b.indices.push(...part.indices.map(i=>i+offset));
    }
    for(const [key,b] of bins){
        const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.vertices,3));geometry.setIndex(b.indices);geometry.computeVertexNormals();
        const mesh=new THREE.Mesh(geometry,material[key]);mesh.name='MercuryArchitecture_'+key;mesh.receiveShadow=true;group.add(mesh);
    }
    for(const c of data.colliders){
        if(/lake-basalt-cliff|lake-outer-spire/.test(c.name))continue;
        if(c.type==='box')addBoxCollider(data.x+c.x,data.z+c.z,c.width,c.depth,c.minY,c.maxY,Boolean(c.standable));
        else addCylinderCollider(data.x+c.x,data.z+c.z,c.radius,c.minY,c.maxY,false);
        Object.assign(colliders.at(-1),{name:c.name,stepHeight:MAX_STEP_HEIGHT});
    }
    // Obsidian banks reuse the exact terrain triangles, so the dark shore
    // cannot create a different walking surface or a floating decorative floor.
    const shoreVertices=[],groundPositions=groundGeo.attributes.position,groundIndex=groundGeo.index;
    for(let i=0;i<groundIndex.count;i+=3){
        const ids=[groundIndex.getX(i),groundIndex.getX(i+1),groundIndex.getX(i+2)];
        const x=ids.reduce((sum,id)=>sum+groundPositions.getX(id),0)/3-data.x;
        const z=ids.reduce((sum,id)=>sum-groundPositions.getY(id),0)/3-data.z;
        const radius=Math.hypot(x/data.rx,z/data.rz);if(radius<.9||radius>1.43)continue;
        for(const id of ids)shoreVertices.push(groundPositions.getX(id)-data.x,groundPositions.getZ(id)+.025,-groundPositions.getY(id)-data.z);
    }
    const shoreGeometry=new THREE.BufferGeometry();shoreGeometry.setAttribute('position',new THREE.Float32BufferAttribute(shoreVertices,3));shoreGeometry.computeVertexNormals();
    const shoreMat=material.obsidian.clone();shoreMat.polygonOffset=true;shoreMat.polygonOffsetFactor=-1;shoreMat.polygonOffsetUnits=-2;
    const shore=new THREE.Mesh(shoreGeometry,shoreMat);shore.name='MercuryObsidianShore';group.add(shore);
    const waterUniforms={time:{value:0},fogColor:{value:scene.fog.color},fogDensity:{value:scene.fog.density}};
    const waterMaterial=new THREE.ShaderMaterial({uniforms:waterUniforms,side:THREE.DoubleSide,
        vertexShader:`varying vec3 worldPos;varying vec3 eyeVector;
            void main(){vec4 p=modelMatrix*vec4(position,1.);worldPos=p.xyz;eyeVector=cameraPosition-p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
        fragmentShader:`uniform float time;uniform vec3 fogColor;uniform float fogDensity;varying vec3 worldPos;varying vec3 eyeVector;
            void main(){vec2 p=worldPos.xz-vec2(-370.,-430.);float t=time*.16;
                float a=sin(p.x*.16+sin(p.y*.11+t)*2.8+t),b=sin(p.y*.24-p.x*.08-t*1.3);
                vec3 normal=normalize(vec3(a*.085,1.,b*.075));vec3 eye=normalize(eyeVector);
                float fresnel=pow(1.-max(dot(eye,normal),0.),3.);
                vec2 q=p*.035+vec2(sin(p.y*.03+t),cos(p.x*.027-t))*2.;
                float flow=(sin(q.x+cos(q.y*1.7)*2.)+sin(q.y+sin(q.x*1.3)*1.5))*.5;
                float silver=pow(1.-abs(sin(flow*3.2+t*.15)),18.);float veins=pow(max(0.,flow),9.);
                vec3 color=mix(vec3(.025,.045,.07),vec3(.23,.34,.43),.5+.5*flow);
                color+=silver*vec3(.52,.60,.65)+veins*vec3(.14,.22,.25);
                color=mix(color,vec3(.38,.46,.54),fresnel*.7);
                float moon=pow(max(0.,dot(reflect(-eye,normal),normalize(vec3(-.4,.8,.25)))),60.);
                color+=moon*vec3(.8,.86,.9);
                float fog=1.-exp(-fogDensity*fogDensity*dot(eyeVector,eyeVector));
                gl_FragColor=vec4(mix(color,fogColor,fog),1.);
            }`});
    const water=new THREE.Mesh(new THREE.CircleGeometry(1,128),waterMaterial);water.name='LivingLiquidMercury';water.rotation.x=-Math.PI/2;water.scale.set(148,123,1);water.position.y=data.waterY;group.add(water);
    const mistMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:waterUniforms.time},
        vertexShader:`varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`uniform float time;varying vec2 p;void main(){float r=length((p-.5)*2.);float v=sin(p.x*28.+time*.07+sin(p.y*19.))*sin(p.y*22.-time*.05);float a=(1.-smoothstep(.3,1.,r))*(.04+max(0.,v)*.1);gl_FragColor=vec4(.38,.48,.55,a);}`});
    for(let i=0;i<3;i++){
        const mist=new THREE.Mesh(new THREE.PlaneGeometry(235,185),mistMaterial);mist.rotation.x=-Math.PI/2;mist.position.set(i*8-8,3+i*2,-8+i*12);mist.userData.optionalFlora=true;group.add(mist);
    }
    for(const side of [-1,1]){
        const light=new THREE.PointLight(0x6699bb,1.5,30);light.position.set(side*10,9,0);group.add(light);registerDynamicLight(light,85);
    }
    const r=data.ramp;
    function support(x,z,py){
        const lx=x-data.x,lz=z-data.z;let floor=-Infinity;
        // Characters wade just beneath the liquid surface and can leave by the
        // graded banks; the lake has no unrecoverable pit or invisible barrier.
        // Fluid movement and buoyancy belong to features/survival/player-survival.js, not a
        // standable surface that would block the player from diving.
        if(Math.abs(lx)<=r.width/2 && lz>=r.z0 && lz<=r.z1){
            const y=r.bottom+(r.top-r.bottom)*(lz-r.z0)/(r.z1-r.z0);
            if(py>=y-MAX_STEP_HEIGHT-.01)floor=Math.max(floor,y);
        }
        return floor;
    }
    interactables.push({id:'mercury_lake',type:'mercury_lake',pos:new THREE.Vector3(data.x,5.4,data.z+154),radius:12,prompt:'Ngắm Hồ Thủy Ngân Vực Tĩnh Lặng'});
    interactables.push({id:'mercury_shrine',type:'mercury_lake',pos:new THREE.Vector3(data.x,5.4,data.z-8),radius:11,prompt:'Chạm vào di tích giữa Hồ Thủy Ngân'});
    const shorePosts=[];
    function finishShore(){
        if(shorePosts.length)return;const points=[];
        for(let i=0;i<48;i++){const a=i*Math.PI/24,x=data.x+Math.sin(a)*data.rx*1.13,z=data.z+Math.cos(a)*data.rz*1.17;if(z>data.z+80&&Math.abs(x-data.x)<85||playerSurvival.surfaceAt(x,z)!==null||moonRailway.infrastructureAt(x,z))continue;const y=worldSurface.height(x,z);if(Math.hypot(worldSurface.height(x+1,z)-worldSurface.height(x-1,z),worldSurface.height(x,z+1)-worldSurface.height(x,z-1))>1.1)continue;points.push({x,y,z});}
        const mesh=new THREE.InstancedMesh(new THREE.ConeGeometry(.55,1.7,5),material.obsidian,points.length),o=new THREE.Object3D();mesh.name='MercuryGroundedShorePosts';mesh.frustumCulled=false;
        for(const [i,p] of points.entries()){o.position.set(p.x-data.x,p.y+.85,p.z-data.z);o.rotation.y=i*.7;o.updateMatrix();mesh.setMatrixAt(i,o.matrix);shorePosts.push(p);addCylinderCollider(p.x,p.z,.42,p.y,p.y+1.7,false);colliders.at(-1).name='mercury-shore-post';}group.add(mesh);mesh.computeBoundingSphere?.();
        const pos=shore.geometry.attributes.position,v=[];for(let i=0;i<pos.count;i+=3){const x=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3+data.x,z=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3+data.z;if(riverRealm.waterAt(x,z))continue;for(let j=0;j<3;j++)v.push(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j));}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();shore.geometry.dispose();shore.geometry=g;
    }
    window.mercuryLake={data,group,water,support,shorePosts,finishShore,travel(){fastTravelTo(data.x,data.z+154,'Hồ Thủy Ngân — Vực Tĩnh Lặng',5.4);},
        update(time){waterUniforms.time.value=time;waterUniforms.fogDensity.value=scene.fog.density;}};
}
