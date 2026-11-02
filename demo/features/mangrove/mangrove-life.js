/* Animated populations built from the same Blender meshes as the native source. */
function installMangroveLife({data,group,geometry,mats,ground,waterY}){
    const batches=[],populations={},dummy=new THREE.Object3D();let time=0;
    for(const [kind,count] of [['fish',360],['turtle',16],['crab',36],['lotus',180],['lotusFlower',36]]){
        const actors=[];
        for(let i=0;i<count;i++){
            const a=i*2.399963,r=kind.startsWith('lotus')?.36+((i*37)%100)/100*.49:Math.sqrt((i+.5)/count)*.74;
            const x=70+Math.cos(a)*205*r,z=-825+Math.sin(a)*109*r;
            if(Math.abs(x-70)<18&&z<-855)continue;
            actors.push({x,z,phase:i*1.73,depth:3+(i%12)*2.3,scale:kind==='lotus'?.8+(i%7)*.25:kind==='fish'?.6+(i%5)*.15:1,position:new THREE.Vector3()});
        }
        populations[kind]=actors;
        if(['fish','turtle','crab'].includes(kind)){
            const asset={fish:'fish_5',turtle:'turtle',crab:'river_crab'}[kind],g=creatureArt.merged(asset);if(kind==='fish')g.scale(.35,.35,.35);
            const mesh=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({vertexColors:true,color:0x888888,roughness:.8}),actors.length);mesh.name='MangroveBlender_'+kind;mesh.frustumCulled=false;group.add(mesh);batches.push({kind,actors,mesh});continue;
        }
        for(const p of data.models[kind]){
            const mesh=new THREE.InstancedMesh(geometry(p),mats[p.material],actors.length);mesh.name='MangroveLiving_'+kind+'_'+p.material;mesh.frustumCulled=false;group.add(mesh);batches.push({kind,actors,mesh});
        }
    }
    function update(dt){time+=Math.max(0,Math.min(.1,dt));
        for(const {kind,actors,mesh} of batches){actors.forEach((a,i)=>{
            const stationary=kind.startsWith('lotus'),speed=kind==='fish'?.65:kind==='turtle'?.2:.12,angle=time*speed+a.phase;
            const x=a.x+(stationary?0:Math.cos(angle)*(kind==='fish'?5:2)),z=a.z+(stationary?0:Math.sin(angle)*(kind==='fish'?5:2));
            const y=stationary?waterY+.045+Math.sin(time+a.phase)*.025:kind==='crab'?ground(x,z)+.3:kind==='turtle'?Math.max(ground(x,z)+1,waterY-2-(1+Math.sin(time*.13+a.phase))*7):Math.max(ground(x,z)+1.4,waterY-a.depth+Math.sin(angle)*.5);
            a.position.set(x,y,z);dummy.position.copy(a.position);dummy.rotation.set(stationary?Math.sin(time+a.phase)*.012:0,stationary?a.phase:-angle,0);dummy.scale.setScalar(a.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
        });mesh.instanceMatrix.needsUpdate=true;}
    }
    function preview(kind){
        const asset={fish:'fish_5',turtle:'turtle',crab:'river_crab'}[kind];if(asset)return creatureArt.create(asset).root;
        if(!data.models[kind])return null;
        const model=new THREE.Group();
        for(const piece of data.models[kind])model.add(new THREE.Mesh(geometry(piece),mats[piece.material]));
        return model;
    }
    update(0);return {populations,batches,update,preview,get time(){return time;}};
}
