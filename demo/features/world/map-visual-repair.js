/* Seal exposed terrain tile boundaries and stop the orbit camera going underground. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installMapVisualRepair(){
    const repairs=[];
    // Cut the old coarse lunar skin at the new valley boundary. Lowering only
    // its vertices leaves large triangles visibly protruding through a ravine.
    function excavateValley(){
        const valley=window.volcanicValley;if(!valley)return;const b=valley.bounds,x0=b.x0,x1=x0+b.nx*b.step,z0=b.z0,z1=z0+b.nz*b.step,g=groundGeo,p=g.attributes.position,u=g.attributes.uv,index=g.index,vertices=[],uvs=[];
        const clip=(poly,axis,limit,greater)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length],ia=greater?a[axis]>=limit:a[axis]<=limit,ic=greater?c[axis]>=limit:c[axis]<=limit;if(ia)out.push(a);if(ia!==ic){const t=(limit-a[axis])/(c[axis]-a[axis]);out.push(a.map((n,j)=>n+(c[j]-n)*t));}}return out;};
        function emit(poly){for(let i=1;i<poly.length-1;i++)for(const a of [poly[0],poly[i],poly[i+1]]){vertices.push(a[0],-a[1],a[2]);uvs.push(a[3],a[4]);}}
        for(let i=0;i<(index?.count??p.count);i+=3){const poly=[];for(let j=0;j<3;j++){const k=index?index.getX(i+j):i+j,x=p.getX(k),z=-p.getY(k);let y=p.getZ(k);if(x>=x0&&x<=x1&&z>=z0&&z<=z1)y=(window.riverRealm?.ground(x,z)??realmTerrainHeight(x,z));poly.push([x,z,y,u.getX(k),u.getY(k)]);}
            if(Math.max(...poly.map(a=>a[0]))<=x0||Math.min(...poly.map(a=>a[0]))>=x1||Math.max(...poly.map(a=>a[1]))<=z0||Math.min(...poly.map(a=>a[1]))>=z1){emit(poly);continue;}
            let remaining=poly;for(const [axis,limit,greater] of [[0,x0,true],[0,x1,false],[1,z0,true],[1,z1,false]]){emit(clip(remaining,axis,limit,!greater));remaining=clip(remaining,axis,limit,greater);if(!remaining.length)break;}
        }
        const replacement=new THREE.BufferGeometry();replacement.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));replacement.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));replacement.computeVertexNormals();g.dispose();g.copy(replacement);repairs.push({name:'LunarSkinExcavation',sealedEdges:4});
    }
    excavateValley();
    function seal(terrain){if(!terrain)return;const g=terrain.geometry,p=g.attributes.position,index=g.index;if(!index)return;const edges=new Map();for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=Math.min(u,v)+':'+Math.max(u,v);const edge=edges.get(key);if(edge)edge.count++;else edges.set(key,{u,v,count:1});}}
        const vertices=[];let count=0;for(const {u,v,count:n} of edges.values()){if(n!==1)continue;const a=new THREE.Vector3().fromBufferAttribute(p,u),b=new THREE.Vector3().fromBufferAttribute(p,v),c=a.clone().add(new THREE.Vector3(0,-7,0)),d=b.clone().add(new THREE.Vector3(0,-7,0));vertices.push(...a.toArray(),...c.toArray(),...b.toArray(),...b.toArray(),...c.toArray(),...d.toArray());count++;}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const skirt=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x62636b,roughness:1,side:THREE.DoubleSide}));skirt.name=terrain.name+'_SealedEdges';terrain.parent.add(skirt);repairs.push({name:terrain.name,sealedEdges:count});
    }
    seal(window.bachKhuyet?.terrain);seal(window.riverRealm?.terrain);seal(window.volcanicValley?.terrain);seal(window.mangroveRealm?.terrain);
    const surface=(x,z)=>window.mangroveRealm?.ground(x,z)??window.volcanicValley?.ground(x,z)??window.riverRealm?.ground(x,z)??window.bachKhuyet?.ground(x,z)??window.ancientGrove?.ground(x,z)??realmTerrainHeight(x,z);
    function clipCamera(origin,desired){if(window.undergroundNetwork?.inside(origin))return undergroundNetwork.clipCamera(origin,desired);if(window.evilCavern?.inside(origin))return desired;const delta=desired.clone().sub(origin),n=Math.max(2,Math.ceil(delta.length()/.25));let previous=origin.clone();for(let i=1;i<=n;i++){const q=origin.clone().addScaledVector(delta,i/n);if(q.y<surface(q.x,q.z)+.15)return previous;previous=q;}return desired;}
    // Distant hidden ecology must never leak into cave camera layer 2.
    function refreshSeams(){
        for(const terrain of [window.bachKhuyet?.terrain,window.riverRealm?.terrain,window.volcanicValley?.terrain,window.mangroveRealm?.terrain,window.ancientGrove?.group.getObjectByName('GroveForestFloor')]){
            if(!terrain?.parent)continue;
            for(const old of [...terrain.parent.children])if(old.name===terrain.name+'_SealedEdges'){
                terrain.parent.remove(old);old.geometry.dispose();old.material.dispose();
            }
            seal(terrain);
        }
    }
    window.mapVisualRepair={repairs,surface,clipCamera,refreshSeams};
}
