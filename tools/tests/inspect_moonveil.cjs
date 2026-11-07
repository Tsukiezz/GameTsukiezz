const fs=require('fs'),path=require('path');
const pending=new Map();let id=0;
(async()=>{const pages=await(await fetch('http://127.0.0.1:9773/json')).json(),ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}};
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
try{const expression=fs.readFileSync(process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'moonveil_diagnose.browser.js'),'utf8');const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});console.log(JSON.stringify(result.result?.value||result.exceptionDetails,null,2));}finally{ws.close()}})().catch(console.error);
