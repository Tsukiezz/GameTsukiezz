// Browser regression: real scene, shared movement function, no copied physics.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.GAME_URL || 'http://127.0.0.1:8765/';
const output = path.resolve(__dirname, '../../demo/verification');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tsukiezz-castle-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=9384', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9384/json')).json(); break; } catch { await pause(250); }
    }
    assert(tabs, 'Chrome debugger must start');
    const tab = tabs.find(t => t.url.startsWith(url));
    assert(tab, 'Game tab must open');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
        if (pending.has(message.id)) {
            const task = pending.get(message.id); pending.delete(message.id);
            message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
        }
    };
    await cdp('Runtime.enable');
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate('Boolean(window.castlePhysics && typeof playerGroup !== "undefined" && playerGroup)');
        if (ready) break;
        await pause(300);
    }
    assert(ready, 'Scene must initialize with castle and player');

    await pause(1500);
    console.log(await evaluate(`({title:document.title,error:document.querySelector('video').error?.message,ready:document.querySelector('video').readyState,duration:document.querySelector('video').duration,settings:typeof tsuventureSettings})`));
    await evaluate(`document.getElementById('setting-language').value='en';document.getElementById('setting-language').dispatchEvent(new Event('change'));document.getElementById('slider-bgm').value=37;document.getElementById('slider-bgm').dispatchEvent(new Event('input'));document.getElementById('btn-save-settings').click();`);await pause(200);
    assert.equal(await evaluate('document.documentElement.lang'),'en');
    assert.equal(await evaluate('document.querySelector("#btn-play-game span").textContent'),'PLAY');
    await cdp('Page.reload',{ignoreCache:true});await pause(2500);
    assert.equal(await evaluate('document.documentElement.lang'),'en');assert.equal(await evaluate('document.getElementById("slider-bgm").value'),'37');
    await evaluate("document.getElementById('btn-open-settings').click()");await pause(150);
    const settingsShot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'tsuventure-settings-en.png'),Buffer.from(settingsShot.data,'base64'));
    await evaluate("closeModal('modal-settings')");
    const frames=[];
    for(const time of [2,8]){
        await evaluate('document.querySelector("video").play()');await pause(900);await evaluate('document.querySelector("video").pause()');
        const data=await evaluate(`(()=>{const v=document.querySelector('video'),c=document.createElement('canvas');c.width=640;c.height=360;c.getContext('2d').drawImage(v,0,0,640,360);return c.toDataURL('image/png');})()`);frames.push(data);
        fs.writeFileSync(path.join(output,'lobby-video-'+time+'.png'),Buffer.from(data.split(',')[1],'base64'));
    }
    console.log('Video state',await evaluate('({time:document.querySelector("video").currentTime,frames:document.querySelector("video").getVideoPlaybackQuality().totalVideoFrames})'));console.log('Frames differ',frames[0]!==frames[1]);assert(frames[0]!==frames[1],'Video contains motion');
    await evaluate(`document.getElementById('setting-language').value='vi';document.getElementById('setting-language').dispatchEvent(new Event('change'));document.getElementById('btn-save-settings').click();document.getElementById('btn-play-game').click();`);await pause(200);
    assert.equal(await evaluate('document.querySelector("video").paused'),true);
    await evaluate('returnToHome()');await pause(500);
    console.log('Errors',errors);assert.equal(errors.length,0);
    console.log('Video motion, language switching, persistence and pause behavior verified');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
