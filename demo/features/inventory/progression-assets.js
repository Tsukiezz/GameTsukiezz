/* Blender-authored item and themed chest geometry shared by all instances. */
const treasuryGeometry=new Map(),treasuryMaterials=new Map();
function createTreasuryModel(kind,mount=null){
 const design=SURVIVAL_ITEM_DATA.models[kind];if(!design)throw Error('Missing authored item '+kind);const root=new THREE.Group();root.name='Blender_'+kind;root.userData.source=SURVIVAL_ITEM_DATA.source;const lid=new THREE.Group();lid.name='TreasureLid';lid.position.set(0,.99,-.68);let hasLid=false;
 for(const [i,p]of design.parts.entries()){if(mount&&p.mount!==mount)continue;const key=kind+':'+i;let g=treasuryGeometry.get(key);if(!g){g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(p.normals,3));g.setIndex(p.indices);g.computeBoundingSphere();treasuryGeometry.set(key,g);}let m=treasuryMaterials.get(p.material);if(!m){m=new THREE.MeshStandardMaterial({color:parseInt(p.color,16),roughness:.52,metalness:['gold','iron','edge'].includes(p.material)?.55:.08});treasuryMaterials.set(p.material,m);}const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;if(p.mount==='lid'){mesh.position.copy(lid.position).negate();lid.add(mesh);hasLid=true;}else root.add(mesh);}
 if(hasLid){root.add(lid);root.userData.lid=lid;}return root;
}
window.treasuryAssets={create:createTreasuryModel,geometry:treasuryGeometry,materials:treasuryMaterials,source:()=>SURVIVAL_ITEM_DATA.source};
