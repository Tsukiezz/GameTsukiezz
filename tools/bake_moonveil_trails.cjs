/* Incrementally rebuild the one missing lookout using the game's own builder. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
console.log('Preparing walking profile bake');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.runtime/moonveil/checks'),target=path.join(root,'demo/features/world/data/highland-walking-routes.js'),box={window:{}};
vm.runInNewContext(fs.readFileSync(target,'utf8'),box);const old=box.window.HIGHLAND_WALKING_ROUTES,data=JSON.parse(fs.readFileSync(path.join(out,'trails-candidate.json'),'utf8'));
console.log('Loaded',old.routes.length,'cached and',data.routes.length,'new routes');
const key=r=>r.kind+':'+r.village,keys=new Set(data.routes.map(key));const missing=old.routes.filter(r=>!keys.has(key(r)));for(const r of missing)data.routes.push({...r,rebuild:true});assert.equal(data.routes.length,69);
(async()=>{const pages=await(await fetch('http://127.0.0.1:9773/json')).json(),ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);let id=0;const pending=new Map();await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}};
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));return r.result.value;};
try{
 console.log('Connected; replacing isolated walking geometry');
 await evaluate(`(()=>{const removed=new Set();for(const child of [...scene.children])if(child.name==='HighlandWalkingRoutes'){child.traverse(o=>{removed.add(o);o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});scene.remove(child);}for(let i=graphicsQuality.entries.length-1;i>=0;i--)if(removed.has(graphicsQuality.entries[i].mesh))graphicsQuality.entries.splice(i,1);window.highlandTrails=null;for(const v of westernHighlands.villages){v.stationWalkingRoute=v.summitWalkingRoute=v.foothillWalkingRoute=null;}window.HIGHLAND_WALKING_ROUTES=${JSON.stringify(data)};})()`);
 let source=fs.readFileSync(path.join(root,'demo/features/world/highland-trails.js'),'utf8');
 console.log('Rebuilding the missing route');
 // Force the missing row through the normal survey/fallback path for this bake.
 source=source.replace('function cached(kind,village){','function cached(kind,village){if(HIGHLAND_WALKING_ROUTES.routes.some(r=>r.kind===kind&&r.village===village.plan.id&&r.rebuild))return null;');
 await evaluate(source+'\ninstallHighlandTrails()');
 const status=await evaluate('({routes:highlandTrails.routes.length,failures:highlandTrails.failures,fallbacks:highlandTrails.routes.filter(r=>r.reusedSurveyNodes).map(r=>({kind:r.kind,village:r.village}))})');console.log(status);assert.equal(status.routes,69);assert.equal(status.failures.length,0);
 const length=await evaluate("window.moonveilTrailPack=JSON.stringify(highlandTrails.export(),(k,v)=>typeof v==='number'?Math.round(v*1e4)/1e4:v);moonveilTrailPack.length");let packed='';for(let i=0;i<length;i+=200000)packed+=await evaluate(`moonveilTrailPack.slice(${i},${i+200000})`);
 const final=JSON.parse(packed);assert(final.routes.every(r=>r.floors.length===r.tops.length&&r.floors.length===r.profile.slice(1).filter((p,i)=>Math.hypot(p[0]-r.profile[i][0],p[2]-r.profile[i][2])>=.01).length));
 const backup=path.join(root,'.runtime/moonveil/highland-walking-routes.before.js');if(!fs.existsSync(backup))fs.copyFileSync(target,backup);fs.writeFileSync(target,'window.HIGHLAND_WALKING_ROUTES='+packed+';\n');fs.writeFileSync(path.join(out,'walking-bake-report.json'),JSON.stringify({...status,bytes:packed.length,terrainHash:final.terrainHash},null,2));console.log('Saved',packed.length,'bytes of validated walking profiles');
}finally{ws.close()}})().catch(e=>{console.error(e);process.exitCode=1});
