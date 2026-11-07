/* The castle is retired; retain the shared camera-occluder registry for other areas. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installRemovedCastle(){
    const group=new THREE.Group();group.name='SharedWorldOccluderRegistry';
    window.castlePhysics={active:false,group,cameraObstacles:[],flights:[],ceilings:[]};
    crownGroup.visible=false;
}
