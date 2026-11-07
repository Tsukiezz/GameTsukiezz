// Quick native shell check independent of world construction.
const fs=require('fs'),path=require('path');
let source=fs.readFileSync(path.join(__dirname,'verify_native.js'),'utf8');
source=source.slice(0,source.indexOf('(async()=>{try{'));
source+=`(async()=>{try{
 await start();
 const before=await cdp('Browser.getWindowForTarget');
 await evaluate("chrome.webview.postMessage({type:'fullscreen'})");await pause(700);
 const full=await cdp('Browser.getWindowForTarget');
 await evaluate("chrome.webview.postMessage({type:'fullscreen'})");await pause(700);
 const normal=await cdp('Browser.getWindowForTarget');
 const report={before:before.bounds,full:full.bounds,normal:normal.bounds};
 fs.writeFileSync(path.join(area,'window-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 assert(before.bounds.width!==full.bounds.width||before.bounds.height!==full.bounds.height);
 assert(Math.abs(normal.bounds.width-before.bounds.width)<3&&Math.abs(normal.bounds.height-before.bounds.height)<3);
 }finally{await close();}})().catch(e=>{console.error(e);process.exitCode=1});`;
new Function('require','__dirname',source)(require,__dirname);
