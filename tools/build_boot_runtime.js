/* Build global state + a cooperative initializer without changing gameplay scope.
   The parser ships with Node; it is a build-time tool, never shipped to the game. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'demo');
const moduleBox={exports:{}};new Function('exports','module',process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(moduleBox.exports,moduleBox);
const parse=s=>moduleBox.exports.parse(s,{ecmaVersion:'latest',sourceType:'script'});
const sourcePath=path.join(__dirname,'runtime-source.js');
if(!fs.existsSync(sourcePath))fs.copyFileSync(path.join(web,'core/runtime.js'),sourcePath);
const source=fs.readFileSync(sourcePath,'utf8'),ast=parse(source),names=[],functions=[],steps=[];
const installers=new Set(ast.body.filter(n=>n.type==='ExpressionStatement'&&n.expression.type==='CallExpression'&&n.expression.callee.type==='Identifier'&&/^install/.test(n.expression.callee.name)).map(n=>n.expression.callee.name));
function splice(s,edits){return edits.sort((a,b)=>b.at-a.at||b.order-a.order).reduce((s,e)=>s.slice(0,e.at)+e.text+s.slice(e.at),s);}
function visit(node,fn,parent=null){if(!node||typeof node!=='object')return;fn(node,parent);for(const value of Object.values(node)){if(Array.isArray(value)){for(const child of value)if(child?.type)visit(child,fn,node);}else if(value?.type)visit(value,fn,node);}}
function cooperate(s,node,offset=0){
 const edits=[];
 function walk(n){
  if(!n?.type)return;
  if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression','ClassDeclaration','ClassExpression'].includes(n.type)&&n!==node)return;
  if(['ForStatement','ForOfStatement','ForInStatement','WhileStatement','DoWhileStatement'].includes(n.type)){
   const body=n.body,code='if(window.gameBoot.shouldYield())await window.gameBoot.yield();';
   if(body.type==='BlockStatement')edits.push({at:body.start+1-offset,text:code,order:0});
   else{edits.push({at:body.start-offset,text:'{'+code,order:0},{at:body.end-offset,text:'}',order:1});}
  }
  for(const value of Object.values(n)){if(Array.isArray(value)){for(const child of value)if(child?.type)walk(child);}else if(value?.type)walk(value);}
 }
 walk(node);return splice(s,edits);
}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.js')?[path.join(dir,e.name)]:[]);}
let converted=0;
for(const file of files(path.join(web,'features'))){
 if(file.includes(path.sep+'data'+path.sep))continue;
 let text=fs.readFileSync(file,'utf8'),tree=parse(text),edits=[];
 for(const node of tree.body){if(node.type!=='FunctionDeclaration'||!installers.has(node.id?.name)||node.async)continue;
  const original=text.slice(node.start,node.end),body=cooperate(original,node,node.start);
  const changed='/* Cooperative initializer: keep gameplay callbacks synchronous. */\nasync '+body;
  edits.push({at:node.start,text:changed,end:node.end});converted++;
 }
 for(const e of edits.sort((a,b)=>b.at-a.at))text=text.slice(0,e.at)+e.text+text.slice(e.end);
 if(edits.length){parse(text);fs.writeFileSync(file,text);}
}
for(const node of ast.body){
 if(node.type==='FunctionDeclaration'){functions.push(source.slice(node.start,node.end));continue;}
 if(node.type==='ExpressionStatement'&&node.expression.type==='CallExpression'&&node.expression.callee.name==='animate')continue;
 let code=source.slice(node.start,node.end),label='Chuẩn bị thế giới',weight=1;
 if(node.type==='VariableDeclaration'){
  code=node.declarations.map(d=>{assert.equal(d.id.type,'Identifier','Global binding must have a stable name');names.push(d.id.name);return d.init?d.id.name+' = '+source.slice(d.init.start,d.init.end)+';':'';}).join('\n');
 }else code=cooperate(code,node,node.start);
 if(node.type==='ExpressionStatement'&&node.expression.type==='CallExpression'){
  const call=node.expression,name=call.callee.type==='Identifier'?call.callee.name:call.callee.property?.name;
  if(installers.has(name)){code='await '+code;weight=8;label=/Railway|Station|Trails/.test(name)?'Dựng đường đi và mạng đường sắt':/River|Aquatic|Lake|Mangrove/.test(name)?'Dựng sông hồ và hệ sinh thái':/World|Terrain|Surface|Realm|Highland/.test(name)?'Dựng địa hình và các vùng đất':/Creature|Forest|Polar|Wildlife|Monster|SnowQueen|Actor/.test(name)?'Chuẩn bị sinh vật và hoạt ảnh':/Backpack|Inventory|Gift|Supplies|Wings|Flashlight|Wood|Provisions/.test(name)?'Chuẩn bị vật phẩm và kho đồ':/HUD|Shortcuts|Guide|Library/.test(name)?'Chuẩn bị giao diện hành trình':'Chuẩn bị khu vực khám phá';}
 }
 if(/^await installMoonRailway\(/.test(code))weight=900;
 else if(/^await installLunarSurfaceFinish\(/.test(code))weight=25;
 else if(/^await installRealmTransitUpdate\(/.test(code))weight=65;
 else if(/^await installGraphicsQuality\(/.test(code))weight=35;
 steps.push({code,label,weight});
}
const total=steps.reduce((n,s)=>n+s.weight,0);let done=0;
const state='/* Generated by tools/build_boot_runtime.js from tools/runtime-source.js. */\nlet '+names.join(',\n    ')+';\n\n'+functions.join('\n\n')+'\n';
const initialization='/* Generated cooperative initialization; global bindings remain in runtime-state.js. */\nwindow.gameBoot.initialization=window.gameBoot.initialize(async function initializeGame(){\n'+steps.map(s=>{const begin=done;done+=s.weight;return `await window.gameBoot.checkpoint(${begin},${total},${JSON.stringify(s.label)},${s.weight});\n${s.code}\n`;}).join('\n')+`await window.gameBoot.checkpoint(${total},${total},'Hoàn tất thế giới');\n});\n`;
parse(state);parse(initialization);fs.writeFileSync(path.join(web,'core/runtime-state.js'),state);fs.writeFileSync(path.join(web,'core/runtime.js'),initialization);
const page=path.join(web,'index.html');let html=fs.readFileSync(page,'utf8');const manifestPath=path.join(web,'core/boot-manifest.json');
if(!fs.existsSync(manifestPath)){
 const scripts=[...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map(m=>m[1]);
 const index=scripts.findIndex(s=>s.split('?')[0]==='core/runtime.js');assert(index>=0);scripts.splice(index,0,'core/runtime-state.js');
 fs.writeFileSync(manifestPath,JSON.stringify({version:1,scripts},null,2)+'\n');
 html=html.replace(/^[ \t]*<script\s+src="([^"]+)"[^>]*><\/script>\r?\n/gm,'');
 html=html.replace('</head>','    <link rel="preload" as="image" href="features/lobby/assets/background.jpg">\n    <link rel="stylesheet" href="core/game-boot.css">\n    <script src="core/game-boot.js" defer data-boot-manifest="core/boot-manifest.json"></script>\n</head>');
 html=html.replace('<body>','<body class="game-loading">\n    <section id="game-loading" aria-label="Đang tải Tsuventure" aria-busy="true">\n        <div class="boot-scenery" aria-hidden="true"></div><div class="boot-shade" aria-hidden="true"></div>\n        <div class="boot-content"><img class="boot-logo" src="features/lobby/assets/tsuventure-logo-v2.png" alt="Tsuventure"><p class="boot-eyebrow">ECHOES OF THE MOONLIT REALM</p>\n        <div class="boot-progress-head"><span id="boot-stage">Chuẩn bị hành trình</span><strong id="boot-percent">0%</strong></div>\n        <div id="boot-progress" class="boot-progress" role="progressbar" aria-label="Tiến độ tải game" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="boot-fill"></i></div>\n        <p class="boot-caption">Vương quốc ánh trăng đang thức giấc…</p><button id="boot-retry" type="button" hidden>Tải lại game</button></div>\n    </section>');
 // Google Fonts are decorative; they must not block the local loading screen.
 html=html.replace(/(<link href="https:\/\/fonts.googleapis.com\/[^>]+)rel="stylesheet">/g,'$1rel="stylesheet" media="print" onload="this.media=\'all\'">');
 fs.writeFileSync(page,html);
}
console.log(JSON.stringify({globalBindings:names.length,globalFunctions:functions.length,initializationSteps:steps.length,cooperativeInstallers:converted}));
