/* Construction-only helpers. Never make height queries or gameplay callbacks async. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'demo'),box={exports:{}};
new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(box.exports,box);
const parse=s=>box.exports.parse(s,{ecmaVersion:'latest'});
const globalNames=new Set(['surveyRailwayObstacles','resolveRailwayClearance','levelRailwayStationApproaches','classifyHighlandRails','gradeHighlandRailTerrain','groundUnneededStations','planVoidDistrict']);
const localNames={'railway/moon-railway.js':new Set(['rebuildTerrainIndex']),'railway/station-grounding.js':new Set(['restore','clearOverhead']),'world/graphics-quality.js':new Set(['split'])};
const fnType=n=>['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type);
function children(node){return Object.values(node).flatMap(v=>Array.isArray(v)?v.filter(x=>x?.type):v?.type?[v]:[]);}
function apply(s,edits){return edits.sort((a,b)=>b.at-a.at||b.order-a.order).reduce((text,e)=>text.slice(0,e.at)+e.text+text.slice(e.at+(e.remove||0)),s);}
function owned(node,fn){fn(node);for(const child of children(node))if(!fnType(child))owned(child,fn);}
const plans=[],calls=new Set([...globalNames,'rebuildTerrainIndex','split','clearOverhead','refreshTerrain']);
for(const relative of ['railway/moon-railway.js','railway/railway-clearance.js','railway/station-grounding.js','railway/highland-railway.js','world/graphics-quality.js','void/void-art.js']){
 const file=path.join(web,'features',relative);let source=fs.readFileSync(file,'utf8');
 if(relative==='railway/moon-railway.js')source=source.replace('()=>{rebuildTerrainIndex();return terrainHeight;}','async()=>{await rebuildTerrainIndex();return terrainHeight;}');
 let tree=parse(source);
 if(relative==='railway/railway-clearance.js'&&!source.includes('bootSurveyMeshes')){
  const survey=tree.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='surveyRailwayObstacles');
  const statement=survey.body.body.find(n=>n.type==='ExpressionStatement'&&n.expression.callee?.object?.name==='scene'&&n.expression.callee?.property?.name==='traverse');
  const callback=statement.expression.arguments[0],body=source.slice(callback.body.start+1,callback.body.end-1),edits=[];
  owned(callback.body,n=>{if(n.type==='ReturnStatement'){assert(!n.argument);edits.push({at:n.start-callback.body.start-1,text:'continue surveyMesh;',remove:n.end-n.start,order:0});}});
  const replacement='const bootSurveyMeshes=[];scene.traverse(mesh=>bootSurveyMeshes.push(mesh));surveyMesh: for(const mesh of bootSurveyMeshes){'+apply(body,edits)+'}';
  source=source.slice(0,statement.start)+replacement+source.slice(statement.end);tree=parse(source);
 }
 const selected=new Set(),edits=[];
 function select(n){if(n.type==='FunctionDeclaration'&&(globalNames.has(n.id.name)||localNames[relative]?.has(n.id.name)))selected.add(n);for(const c of children(n))select(c);}select(tree);
 for(const fn of selected){if(fn.async)continue;edits.push({at:fn.start,text:'async ',order:0});owned(fn.body,n=>{
  if(['ForStatement','ForOfStatement','ForInStatement','WhileStatement','DoWhileStatement'].includes(n.type)){
   const b=n.body,code='if(window.gameBoot.shouldYield())await window.gameBoot.yield();';
   if(b.type==='BlockStatement')edits.push({at:b.start+1,text:code,order:0});else edits.push({at:b.start,text:'{'+code,order:0},{at:b.end,text:'}',order:1});
  }
 });}
 function awaitCalls(n,owner=null,parent=null){
  if(fnType(n))owner=n;
  if(n.type==='CallExpression'){
   const name=n.callee.type==='Identifier'?n.callee.name:null;
   const restore=n.callee.type==='MemberExpression'&&n.callee.object.name==='native'&&n.callee.property.name==='restore';
   const needs=restore||globalNames.has(name)||(localNames[relative]?.has(name))||name==='refreshTerrain';
   if(needs&&parent?.type!=='AwaitExpression'){
    assert(owner&&(owner.async||selected.has(owner)),relative+': synchronous caller '+(owner?.id?.name||owner?.type)+' -> '+name);
    edits.push({at:n.start,text:'await ',order:0});
   }
  }
  for(const c of children(n))awaitCalls(c,owner,n);
 }awaitCalls(tree);
 const output=apply(source,edits);parse(output);plans.push({file,output,count:edits.length});
}
for(const p of plans)fs.writeFileSync(p.file,p.output);
console.log(JSON.stringify(plans.map(p=>({file:path.relative(web,p.file),edits:p.count}))));
