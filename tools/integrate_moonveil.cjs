// Explicit, idempotent integration edits to existing world systems.
const fs=require('fs');
function edit(file,a,b){let s=fs.readFileSync(file,'utf8');if(s.includes(b))return;if(!s.includes(a))throw Error('Missing anchor in '+file+': '+a.slice(0,100));fs.writeFileSync(file,s.replace(a,b));}
edit('demo/features/survival/player-survival.js','function inLakeColumn(x,z){return ','function inLakeColumn(x,z){return Boolean(window.moonveilPalace?.waterAt(x,z))||');
edit('demo/features/survival/player-survival.js','function surfaceAt(x,z){return ','function surfaceAt(x,z){return window.moonveilPalace?.waterAt(x,z)?.y??');
edit('demo/features/survival/player-survival.js','function bottomAt(x,z){return ','function bottomAt(x,z){if(window.moonveilPalace?.affects(x,z))return window.worldSurface?.height(x,z)??moonveilPalace.designed(x,z);return ');
edit('demo/features/world/surface-sync.js','const ray=new THREE.Raycaster();','const ray=new THREE.Raycaster();');
edit('demo/features/world/surface-sync.js','for(const vehicle of (rail.allVehicles||rail.vehicles))','if(window.moonveilPalace?.inside(origin.x,origin.z))blockers.push(...moonveilPalace.cameraObstacles);\n        for(const vehicle of (rail.allVehicles||rail.vehicles))');
edit('demo/features/railway/moon-railway.js','const terrainMeshes=[','const terrainMeshes=[window.moonveilPalace?.terrain,');
edit('demo/features/world/construction-zones.js','function contains(x,z,r=0){','function contains(x,z,r=0){if(window.moonveilPalace?.affects(x,z))return true;');
edit('demo/features/world/surface-sync.js','const modifiedAt=(x,z)=>','const modifiedAt=(x,z)=>Boolean(window.moonveilPalace?.affects(x,z))||');
edit('demo/features/technology/river-boat.js','const waterAt=(x,z)=>','const waterAt=(x,z)=>window.moonveilPalace?.waterAt(x,z)??');
edit('demo/features/railway/railway-clearance.js','const c=1+Math.pow(','const c=(window.moonveilPalace?.railReserved(p.x,p.z)?1000000:0)+1+Math.pow(');
edit('demo/features/railway/railway-clearance.js','const next=z*n+x,q=decode(next);','const next=z*n+x,q=decode(next);if(window.moonveilPalace?.railReserved(q.x,q.z)&&next!==goal&&id!==start)continue;');
edit('demo/features/railway/railway-clearance.js','const p=u.clone().lerp(v,i/count);','const p=u.clone().lerp(v,i/count);if(window.moonveilPalace?.railReserved(p.x,p.z))return false;');
edit('demo/features/world/terrain-traversal.js','if(inCastleEnvelope(x,z)||','if(Number.isFinite(window.moonveilPalace?.support(x,z,y)))return true;\n        if(inCastleEnvelope(x,z)||');
const manifest='demo/core/boot-manifest.json',m=JSON.parse(fs.readFileSync(manifest));
for(const script of ['features/castle/data/moonveil-palace.js','features/castle/moonveil-palace.js'])if(!m.scripts.some(s=>s.split('?')[0]===script))m.scripts.splice(m.scripts.findIndex(s=>s.startsWith('core/runtime-state.js')),0,script);
fs.writeFileSync(manifest,JSON.stringify(m,null,2)+'\n');
