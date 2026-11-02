// Current-map smoke: load real runtime and every local asset after cleanup.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8883/?antarctic=1';
const output = process.env.GAME_VERIFY_OUTPUT ? path.resolve(process.env.GAME_VERIFY_OUTPUT) : path.resolve(__dirname,'../../demo/verification/complete-library');
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
 fs.mkdirSync(output,{recursive:true});let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch(`http://127.0.0.1:${debugPort}/json`)).json();break;}catch{await pause(250);}}assert(tabs);const tab=tabs.find(t=>t.url.startsWith(url));ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};await cdp('Runtime.enable');for(let i=0;i<220;i++){if(await evaluate('Boolean(window.fieldGuide&&window.graphicsQuality)'))break;if(errors.length)throw Error(errors.join('\n'));await pause(300);}
 const report=await evaluate(fs.readFileSync(path.join(__dirname,'complete_library.browser.js'),'utf8'));fs.writeFileSync(path.join(output,'library-report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.checks.length,counts:report.counts,portraits:report.portraits.length}));
 for(const [name,expr] of [['monsters',"document.getElementById('field-guide-search').value='';document.getElementById('field-guide-search').dispatchEvent(new Event('input'));"],['snow-queen',"document.getElementById('field-guide-search').value='nu chua tuyet';document.getElementById('field-guide-search').dispatchEvent(new Event('input'));"],['penguin-mobile',"document.querySelector('.field-guide-tabs [data-category=wildlife]').click();document.getElementById('field-guide-search').value='chim canh cut';document.getElementById('field-guide-search').dispatchEvent(new Event('input'));"]]){if(name.endsWith('mobile'))await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate(expr);await pause(250);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));}
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Mobile library fits');
 await evaluate("closeModal('modal-field-guide');openModal('modal-settings');const select=document.getElementById('setting-language');select.value='en';select.dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();fieldGuide.open();document.querySelector('.field-guide-tabs [data-category=monsters]').click();const input=document.getElementById('field-guide-search');input.value='snow queen';input.dispatchEvent(new Event('input'));");assert.equal(await evaluate('document.querySelector("[data-entry=snow_queen] h3").textContent'),'Snow Queen');await evaluate('document.querySelector(".field-guide-close").click()');assert(await evaluate('document.activeElement===renderer.domElement'));await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'b',code:'KeyB'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'b',code:'KeyB'});assert(await evaluate('document.getElementById("modal-field-guide").classList.contains("active")'));
 await cdp('Page.reload',{ignoreCache:true});let restored;for(let i=0;i<220;i++){if(await evaluate('Boolean(window.fieldGuide&&window.graphicsQuality)')){restored=await evaluate('({records:fieldGuide.records,language:tsuventureSettings.language,catalog:fieldGuide.catalog.length})');break;}await pause(300);}assert(restored);for(const [id,value] of Object.entries(report.records)){assert(restored.records[id],id+' saved');assert.equal(restored.records[id].defeated,value.defeated);}assert.equal(restored.language,'en');assert.equal(restored.catalog,report.catalog);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'persistence.json'),JSON.stringify({restored,errors},null,2));console.log('All encounters, victories and language survived reload');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(ws?.readyState===1)await cdp('Browser.close').catch(()=>{});ws?.close();chrome.kill();});
