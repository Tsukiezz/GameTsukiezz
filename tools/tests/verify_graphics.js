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
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 30000);
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
    const report = await evaluate(`(() => {
        enterGame();
        setGraphicsProfile('potato');
        renderer.render(scene,camera);
        const light = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
        const checks = [];
        function check(name, ok) { checks.push({name,ok}); }
        const points=[]; const flora=[];
        scene.traverse(o=>{if(o.isPointLight) points.push(o); if(o.userData.optionalFlora) flora.push(o);});
        check('All point lights disabled', points.length>0 && points.every(o=>!o.visible));
        check('Optional flora hidden', flora.length>0 && flora.every(o=>!o.visible));
        check('Shadows disabled', !renderer.shadowMap.enabled);
        check('Render resolution capped', canvas.width<=960 && canvas.height<=540);
        check('Selection persisted', localStorage.getItem('tsukiezz_graphics_profile')==='potato');
        check('Vietnamese label', document.getElementById('current-profile-label').textContent.includes('C\u1ef1c M\u01b0\u1ee3t'));
        setGraphicsProfile('ultra');
        renderer.render(scene,camera);
        const ultra = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
        check('Ultra restores shadows and flora', renderer.shadowMap.enabled && flora.every(o=>o.visible));
        check('Lightweight reduces draw calls', light.calls < ultra.calls);
        setGraphicsProfile('potato');
        adaptiveRatio=0.35; applyRenderResolution();
        check('Adaptive lower resolution applies', renderer.getPixelRatio()<=0.35);
        window.dispatchEvent(new Event('resize'));
        check('Resize preserves lower resolution', renderer.getPixelRatio()<=0.35);
        setGraphicsProfile('potato');
        return {checks,light,ultra};
    })()`);
    console.log(JSON.stringify(report,null,2));
    assert(report.checks.every(c=>c.ok),'All graphics checks pass');
    await cdp('Page.reload');
    await pause(8000);
    assert(await evaluate("currentProfileKey === 'potato'"),'Profile survives reload');
    assert.equal(errors.length,0,'No browser runtime errors');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
