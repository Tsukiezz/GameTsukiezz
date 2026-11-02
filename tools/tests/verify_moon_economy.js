// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/moon-economy');
const debugPort = 9500 + Math.floor(Math.random()*1500);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--enable-webgl',
    '--window-size=1280,800', url
], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(r => setTimeout(r, ms));
let ws, sequence = 0;
const pending = new Map(), errors = [];
async function cdp(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, method==='Browser.close'?2000:240000);
        pending.set(id, { resolve: v => { clearTimeout(timeout); resolve(v); }, reject:e=>{clearTimeout(timeout);reject(e);} });
        ws.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function main(){
    fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<80;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs,'Chrome starts');const tab=tabs.find(t=>t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.url.startsWith(new URL(url).origin)&&m.params.response.status>=400&&!m.params.response.url.endsWith('/favicon.ico'))errors.push(m.params.response.url);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');await cdp('Network.enable');for(let i=0;i<150;i++){if(await evaluate('Boolean(window.lobbyMusic&&window.giftCode&&window.fieldGuide)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
    if(process.env.EXPORT_CAMPS_ONLY){const design=await evaluate(fs.readFileSync(path.join(__dirname,'export_camp_economy.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'blender-camps.json'),JSON.stringify(design));assert.deepEqual(errors,[]);console.log(JSON.stringify({camps:design.camps,enemies:design.placements.length,foodSpots:design.foodSpots}));return;}
    const initial=await evaluate('({paused:lobbyMusic.audio.paused,src:lobbyMusic.audio.src,logo:document.querySelector(".brand-logo").src})');assert(initial.paused);assert(initial.src.endsWith('.mp3'));assert(initial.logo.includes('logo-v2.png'));
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:25,y:25,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:25,y:25,button:'left',clickCount:1});
    let playing=false;for(let i=0;i<30;i++){playing=await evaluate('!lobbyMusic.audio.paused&&lobbyMusic.audio.readyState>=2');if(playing)break;await pause(200);}assert(playing,'Supplied MP3 plays after real user gesture');
    await evaluate('openModal("modal-settings");document.getElementById("slider-bgm").value="23";document.getElementById("slider-bgm").dispatchEvent(new Event("input",{bubbles:true}));');assert.equal(await evaluate('lobbyMusic.audio.volume'),.23);
    await evaluate('document.getElementById("setting-bgm-enabled").checked=false;document.getElementById("setting-bgm-enabled").dispatchEvent(new Event("change"));');assert(await evaluate('lobbyMusic.audio.paused'),'Music off pauses playback');await evaluate('document.getElementById("setting-bgm-enabled").checked=true;document.getElementById("setting-bgm-enabled").dispatchEvent(new Event("change"));closeModal("modal-settings");');
    await pause(400);const lobbyShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'lobby.png'),Buffer.from(lobbyShot.data,'base64'));
    const report=await evaluate(fs.readFileSync(path.join(__dirname,'moon_economy.browser.js'),'utf8'));assert(await evaluate('lobbyMusic.audio.paused'),'Music stops inside game');fs.writeFileSync(path.join(output,'economy-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,camps:report.camps,enemies:report.enemies,foodSpots:report.foodSpots,errors}));
    await evaluate('openModal("modal-settings");document.querySelector("#modal-settings .modal-card").scrollTop=0;');await pause(400);const settingsShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'settings.png'),Buffer.from(settingsShot.data,'base64'));
    await cdp('Page.reload',{ignoreCache:true});let ready=false;for(let i=0;i<150;i++){ready=await evaluate('Boolean(window.giftCode&&window.lobbyMusic&&window.fieldGuide)');if(ready)break;await pause(300);}assert(ready,'Reload');const restored=await evaluate(`({claimed:giftCode.claimed,uniques:[crystalWings,solarFlashlight,volcanicValley,riverBoat,mangroveRealm].map(a=>a.owned),coins:monsterCamps.stock.goldCoin,music:tsuventureSettings.audio.bgm,camp:monsterCamps.camps.find(c=>c.id===${JSON.stringify(report.persist.camp)}).respawnAt})`);assert(restored.claimed&&restored.uniques.every(Boolean));assert.equal(restored.coins,report.persist.coins);assert.equal(restored.music,23);assert.equal(restored.camp,report.persist.respawnAt);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
