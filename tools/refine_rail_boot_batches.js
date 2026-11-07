const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../demo/features/railway/moon-railway.js'),box={exports:{}};
new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(box.exports,box);
const parse=s=>box.exports.parse(s,{ecmaVersion:'latest'});let source=fs.readFileSync(file,'utf8');
const cooperate='if(window.gameBoot.shouldYield())await window.gameBoot.yield();';
for(const [name,collection,pattern] of [['stations','stationPlans','[i,plan]'],['reversePlatforms','stations','s']]){
 const fn=parse(source).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='installMoonRailway');
 const declaration=fn.body.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));
 const init=declaration?.declarations[0].init;
 if(init?.callee?.property?.name!=='map')continue;
 const callback=init.arguments[0],result=callback.body.body.find(n=>n.type==='ReturnStatement');assert(result);
 const body=source.slice(callback.body.start+1,result.start)+name+'.push('+source.slice(result.argument.start,result.argument.end)+');'+source.slice(result.end,callback.body.end-1);
 const replacement='const '+name+'=[];for(const '+pattern+' of '+collection+(pattern.startsWith('[')?'.entries()':'')+'){'+cooperate+body+'}';
 source=source.slice(0,declaration.start)+replacement+source.slice(declaration.end);
}
source=source.replace('stations.forEach(station=>station.access=buildRailwayAccess(station,terrainHeight,obstacleSurvey,materials,group));','for(const station of stations){'+cooperate+'station.access=buildRailwayAccess(station,terrainHeight,obstacleSurvey,materials,group);}')
if(!source.includes('window.gameBoot.taskProgress(')){
 const fn=parse(source).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='installMoonRailway');
 const statements=fn.body.body.filter(n=>n.type!=='FunctionDeclaration');
 for(let i=statements.length-1;i>=0;i--){const n=statements[i];source=source.slice(0,n.start)+`window.gameBoot.taskProgress(${i},${statements.length});\n`+source.slice(n.start);}
}
parse(source);fs.writeFileSync(file,source);console.log('Rail station loops now yield; internal rail progress reports real completed batches');
