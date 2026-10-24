// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/?river=spring';
const output = path.resolve(__dirname, '../../demo/verification');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=9411', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--enable-webgl',
    '--window-size=1280,800', url
], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(r => setTimeout(r, ms));
let ws, sequence = 0;
const pending = new Map(), errors = [];
async function cdp(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 60000);
        pending.set(id, { resolve: v => { clearTimeout(timeout); resolve(v); }, reject });
        ws.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function main() {
    fs.mkdirSync(output, { recursive: true });
    let tabs;
    for (let i = 0; i < 80; i++) {
        try { tabs = await (await fetch('http://127.0.0.1:9411/json')).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.fieldGuide && window.libraryPreviews && window.monsterSkills)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({url:location.href,body:document.body.innerText.slice(0,300),scripts:document.scripts.length})'));
    assert(ready, 'Scene must initialize with castle and player');


    const result=await evaluate(`(async()=>{
        const checks=[];function check(ok,name){if(!ok)throw Error(name);checks.push(name);}
        const ids=['space_sabertooth','speed_wolf','forest_sapling','red_rumped_monkey','river_fish_0','river_fish_1','river_fish_2','river_kelp','thermal_coral'];
        check(ids.every(id=>fieldGuide.catalog.some(c=>c.id===id)),'Nine new creature entries registered');
        check(fieldGuide.catalog.filter(c=>c.landmark).length===landmarksData.length,'All locations registered after world initialization');
        check(!fieldGuide.records.space_sabertooth,'Distant tiger remains undiscovered');
        for(const id of ids){const png=libraryPreviews.get(id);check(png?.startsWith('data:image/png;base64,')&&png.length>3000,'Actual mesh portrait: '+id);check(libraryPreviews.get(id)===png,'Preview cached: '+id);}
        for(const lm of ['bach_khuyet','thermal_waterfall','thermal_spring']){const entry=fieldGuide.catalog.find(c=>c.landmark?.id===lm);check(libraryPreviews.get(entry.id)?.length>10000,'Location preview: '+lm);}
        check(fieldGuide.catalog.find(c=>c.id==='ness').detail().includes('78'),'Original energy skill documented');
        riverRealm.travel('spring');riverRealm.update(0);
        const monkey=riverRealm.monkeys.find(m=>m.group.visible);check(!!monkey,'Visible monkey available');
        playerGroup.position.copy(monkey.group.position).add(new THREE.Vector3(0,0,4));camera.position.copy(monkey.group.position).add(new THREE.Vector3(0,2,6));camera.lookAt(monkey.group.position.clone().add(new THREE.Vector3(0,.6,0)));camera.updateMatrixWorld(true);fieldGuide.update(.5);
        check(!!fieldGuide.records.red_rumped_monkey,'Seeing a nearby monkey unlocks it');
        bachKhuyet.hit(99999);check(fieldGuide.records.space_sabertooth?.defeated,'Tiger defeat recorded');
        riverRealm.hitWolf(99999);check(fieldGuide.records.speed_wolf?.defeated,'Wolf defeat recorded');
        fieldGuide.open();check(document.querySelector('[data-entry="space_sabertooth"] img'),'Unlocked monster has a preview in the library');
        check(document.querySelector('[data-entry="space_sabertooth"]').textContent.includes('3600'),'Monster combat details shown');
        const input=document.getElementById('field-guide-search');input.value='ho rang kiem';input.dispatchEvent(new Event('input'));check(document.querySelectorAll('.field-guide-entry').length===1,'Accent-insensitive Vietnamese search');
        input.value='';input.dispatchEvent(new Event('input'));
        const persisted=JSON.parse(localStorage.getItem('tsuventure_field_guide_v1'));check(persisted.speed_wolf.defeated&&persisted.red_rumped_monkey,'Encounter and defeat saved');
        return checks;
    })()`);
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(300);
    assert(await evaluate("document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('.field-guide-card').getBoundingClientRect().right<=innerWidth+1"),'Mobile library fits screen');
    const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'creature-library-mobile.png'),Buffer.from(shot.data,'base64'));
    await evaluate("closeModal('modal-field-guide');openModal('modal-settings');const select=document.getElementById('setting-language');select.value='en';select.dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();fieldGuide.open();");
    assert(await evaluate("document.querySelector('[data-entry=space_sabertooth] h3').textContent==='Space sabertooth'"),'New entries follow saved language');
    await evaluate("document.querySelector('.field-guide-close').click()");
    assert(await evaluate('document.activeElement===renderer.domElement'),'Closing book restores game focus');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'b',code:'KeyB'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'b',code:'KeyB'});
    assert(await evaluate("document.getElementById('modal-field-guide').classList.contains('active')"),'B opens library');
    await cdp('Page.reload',{ignoreCache:true});await pause(500);
    for(let i=0;i<100;i++){if(await evaluate('document.readyState===\"complete\" && Boolean(window.fieldGuide)'))break;await pause(300);}
    assert(await evaluate('fieldGuide.records.space_sabertooth?.defeated && fieldGuide.records.speed_wolf?.defeated && !!fieldGuide.records.red_rumped_monkey'),'Records survive full reload');
    assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:result.length+6,checks:result},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
