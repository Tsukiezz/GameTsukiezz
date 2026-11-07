const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../demo/features/railway/moon-railway.js'),box={exports:{}};
new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(box.exports,box);
const parse=s=>box.exports.parse(s,{ecmaVersion:'latest'});
function children(n){return Object.values(n).flatMap(v=>Array.isArray(v)?v.filter(x=>x?.type):v?.type?[v]:[]);}
let source=fs.readFileSync(file,'utf8');
if(!source.includes('async function bootPlanStation(')){
 const root=parse(source).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='installMoonRailway');
 const declaration=root.body.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='stationPlans'));
 let callback;
 function find(n){if(n.type==='CallExpression'&&n.callee?.property?.name==='map'&&n.callee.object.name==='stationSpecs')callback=n.arguments[0];for(const c of children(n))find(c);}find(declaration);assert(callback);
 let helper='async function bootPlanStation(spec)'+source.slice(callback.body.start,callback.body.end);
 const fn=parse(helper).body[0],edits=[];
 function walk(n){
  if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type)&&n!==fn)return;
  if(['ForStatement','ForOfStatement','ForInStatement','WhileStatement','DoWhileStatement'].includes(n.type)){
   const b=n.body,code='if(window.gameBoot.shouldYield())await window.gameBoot.yield();';
   if(b.type==='BlockStatement')edits.push({at:b.start+1,text:code});else edits.push({at:b.start,text:'{'+code},{at:b.end,text:'}'});
  }
  for(const c of children(n))walk(c);
 }walk(fn);
 for(const e of edits.sort((a,b)=>b.at-a.at))helper=helper.slice(0,e.at)+e.text+helper.slice(e.at);
 const replacement='const stationPlans=[];\n'+helper+'\nfor(const spec of stationSpecs){if(window.gameBoot.shouldYield())await window.gameBoot.yield();const plan=await bootPlanStation(spec);if(plan)stationPlans.push(plan);}\nstationPlans.sort((a,b)=>a.index-b.index);';
 source=source.slice(0,declaration.start)+replacement+source.slice(declaration.end);
 parse(source);fs.writeFileSync(file,source);
}
console.log('Station site planning now yields inside candidate and terrain sampling loops');
