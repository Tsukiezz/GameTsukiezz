const{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const url=process.env.GAME_URL||'http://127.0.0.1:8899/?desktop=1',out=path.resolve('.runtime/boot-loading/checks'),port=9762;
fs.mkdirSync(out,{recursive:true});const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tsu-loading-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--enable-webgl','--disable-hang-monitor','--window-size=1440,1000','about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),errors=[],network=[],samples=[],checks=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
const check=(ok,name,detail)=>{checks.push({ok:!!ok,name,detail});if(!ok)throw Error(name+': '+JSON.stringify(detail));};
function cdp(method,params={}){return new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('Timeout '+method));},240000);pending.set(n,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));return r.result.value;}
async function snapshot(name){const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(shot.data,'base64'));}
async function main(){
 let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();break;}catch{await pause(200);}}assert(tabs);ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.url.startsWith(new URL(url).origin)&&m.params.response.status>=400&&!m.params.response.url.endsWith('/favicon.ico'))network.push(m.params.response.url);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.hostname==='127.0.0.1'&&!localStorage.getItem('tsu_test_seed')){localStorage.setItem('tsu_test_seed','true');localStorage.setItem('tsuventure_gift_code_v1',JSON.stringify({claimed:true,unique:{wings:1,flashlight:1,ancientFragment:1}}));}`});
 await cdp('Page.navigate',{url});console.log('Loading EXE-mode game');let tookShot=false,ready=false;
 for(let i=0;i<1800;i++){
  if(errors.length)throw Error(errors.join('\n'));
  const s=await evaluate(`window.gameBoot?({percent:gameBoot.state.percent,ready:gameBoot.ready,failed:gameBoot.state.failed,stage:document.getElementById('boot-stage').textContent,visible:!document.getElementById('game-loading').hidden,frames:gameBoot.state.frames}):null`);
  if(s){samples.push({...s,at:Date.now()});if(s.failed)throw Error(JSON.stringify(await evaluate('gameBoot.state')));if(!tookShot&&s.percent>=1&&s.percent<96){await snapshot('loading');tookShot=true;}if(s.ready){ready=true;break;}}
  await pause(150);
 }
 check(ready,'Loader completes');await pause(800);
 const state=await evaluate(`({boot:gameBoot.state,playing:gameState.isPlaying,hidden:document.getElementById('game-loading').hidden,bodyLoading:document.body.classList.contains('game-loading'),frames:gameBoot.state.frames,actor:!!window.actorAnimation,trains:moonRailway.trains.length,background:getComputedStyle(document.querySelector('.boot-scenery')).backgroundImage,logo:document.querySelector('.boot-logo').naturalWidth,view:!!document.getElementById('btn-toggle-view')})`);
 fs.writeFileSync(path.join(out,'timing.json'),JSON.stringify({state,samples,errors,network},null,2));
 check(state.boot.history[0].percent===0,'Progress begins at 0');check(state.boot.history.at(-1).percent===100,'Progress completes at 100');
 check(state.boot.history.every((p,i,a)=>!i||p.percent>=a[i-1].percent),'Progress never goes backward');
 check(state.boot.history.length>=30,'Progress reflects multiple actual completed stages',state.boot.history.length);
 check(state.boot.yields>100&&state.frames>20,'Browser paints during initialization',{yields:state.boot.yields,frames:state.frames});
 check(state.boot.maxHeartbeatDelay<5000,'No multi-second renderer freeze during startup',state.boot.maxHeartbeatDelay);
 check(!state.playing&&state.hidden&&!state.bodyLoading,'EXE mode opens the lobby after loading');
 check(await evaluate("!document.getElementById('home-screen').classList.contains('hidden')&&!document.getElementById('game-hud').classList.contains('active')"),'Lobby is visible and gameplay HUD stays hidden');
 await evaluate("document.getElementById('btn-play-game').click()");
 check(await evaluate("gameState.isPlaying&&document.getElementById('home-screen').classList.contains('hidden')"),'Play button enters gameplay');
 check(state.actor&&state.trains===6&&state.view,'World, animation, trains and view controls initialize');
 check(state.background.includes('features/lobby/assets/background.jpg')&&state.logo>0,'Loader uses original game scenery and logo');
 check(errors.length===0&&network.length===0,'No runtime or asset errors',{errors,network});
 console.log(JSON.stringify({checks:checks.length,readyMs:state.boot.readyAt,yields:state.boot.yields,frames:state.frames,maxHeartbeatDelay:state.boot.maxHeartbeatDelay,slowestSteps:[...state.boot.steps].sort((a,b)=>b.ms-a.ms).slice(0,8)}));
 await snapshot('ready');
 const gameplay=await evaluate(fs.readFileSync(path.join(__dirname,'world_inventory_update.browser.js'),'utf8'));
 check(gameplay.checks.every(c=>c.ok),'All existing world, view, inventory and gift workflows pass',gameplay.checks.length);
 fs.writeFileSync(path.join(out,'gameplay-report.json'),JSON.stringify(gameplay,null,2));console.log(gameplay.checks.length+' gameplay regression checks passed');
 await cdp('Page.reload',{ignoreCache:true});let restoredReady=false;
 for(let i=0;i<1800;i++){if(errors.length)throw Error(errors.join('\n'));const b=await evaluate('window.gameBoot?({ready:gameBoot.ready,failed:gameBoot.state.failed}):null');if(b?.failed)throw Error('Reload startup failed');if(b?.ready){restoredReady=true;break;}await pause(150);}
 check(restoredReady,'Saved game loads through the new startup flow');
 const restored=await evaluate(`({iron:monsterCamps.stock.iron,wood:riverBoat.stock.wood,claimed:giftCode.claimed,bean:explorationUpdate.beanOwned,map:explorationUpdate.mapOwned,unique:giftCode.unique})`);
 check(restored.iron===9994&&restored.wood===9999&&restored.claimed&&restored.bean&&restored.map&&Object.values(restored.unique).every(n=>n===9999),'Save and spent resources survive cooperative reload',restored);
 fs.writeFileSync(path.join(out,'persistence.json'),JSON.stringify(restored,null,2));
 // A real unavailable startup script must show Retry, never a false 100%.
 await cdp('Network.setBlockedURLs',{urls:['*features/characters/combat-balance.js*']});await cdp('Page.reload',{ignoreCache:true});
 let failed=false;for(let i=0;i<100;i++){failed=await evaluate('Boolean(window.gameBoot?.state.failed)');if(failed)break;await pause(100);}
 check(failed,'Failed startup stops loading');const failure=await evaluate(`({percent:gameBoot.state.percent,retry:!document.getElementById('boot-retry').hidden,visible:!document.getElementById('game-loading').hidden})`);
 check(failure.percent<100&&failure.retry&&failure.visible,'Failure offers Retry below 100 percent',failure);await snapshot('retry');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,gameplayChecks:gameplay.checks.length,state,samples,errors,network},null,2));console.log(checks.length+' boot checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
