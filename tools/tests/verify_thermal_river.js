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
    '--headless=new', '--remote-debugging-port=9401', `--user-data-dir=${profile}`,
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
        try { tabs = await (await fetch('http://127.0.0.1:9401/json')).json(); break; } catch { await pause(250); }
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
        ready = await evaluate('Boolean(window.riverRealm && typeof playerGroup !== "undefined" && playerGroup)');
        if (ready) break;
        await pause(300);
    }
    if(!ready)console.error('Startup errors',errors,await evaluate('({player:typeof playerGroup,castle:!!window.castlePhysics,monsters:!!window.lakeMonsters})'));
    assert(ready, 'Scene must initialize with castle and player');

    const report=await evaluate(fs.readFileSync(path.join(__dirname,'thermal_river_checks.js'),'utf8'));
    console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'thermal-river-report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
    await evaluate("riverRealm.travel('spring');gameState.inDialogue=true;setGraphicsProfile('balanced');scene.fog.density=.0003;camera.far=2200;camera.updateProjectionMatrix();renderer.setPixelRatio(1);camera.position.set(-460,330,380);camera.lookAt(-730,135,620);riverRealm.update(0);renderer.render(scene,camera);");
    let shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'thermal-waterfall-overview.png'),Buffer.from(shot.data,'base64'));
    await evaluate("camera.position.set(-810,249,705);camera.lookAt(-765,234,655);riverRealm.update(0);renderer.render(scene,camera);");shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'summit-hot-spring.png'),Buffer.from(shot.data,'base64'));
    await evaluate("{const b=riverRealm.data.bridges[10];camera.position.set(b.x+35,b.top+24,b.z+30);camera.lookAt(b.x,b.top,b.z);}riverRealm.update(0);renderer.render(scene,camera);");shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'thermal-river-bridge.png'),Buffer.from(shot.data,'base64'));
    await evaluate("gameState.inDialogue=false;riverRealm.travel('spring');camera.position.set(-765,233,660);camera.lookAt(-740,233,660);playerSurvival.environment();gameState.inDialogue=true;riverRealm.update(0);renderer.render(scene,camera);");shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'hot-spring-underwater.png'),Buffer.from(shot.data,'base64'));
    assert(await evaluate('renderer.info.programs.every(p=>p.diagnostics?.runnable!==false)'));assert.deepEqual(errors,[]);assert(report.results.every(r=>r.ok));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
