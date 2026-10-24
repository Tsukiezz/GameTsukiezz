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

    const report=await evaluate(`(()=>{
      const results=[],check=(name,ok)=>results.push({name,ok});
      for(const [hero,model] of [['hamster',hamsterVisualGroup],['rabbit',rabbitVisualGroup],['dragon_knight',dragonVisualGroup],['kingkong',kingkongVisualGroup]]){
        for(const fps of [15,30,60,144]){
          resetHeroAnimation(model);
          const l=model.limbs,base=l.body.position.y;
          const tick=(state)=>{for(let i=0;i<fps;i++)updateHeroAnimation(l,{dt:1/fps,time:i/fps,moving:false,sprint:false,grounded:true,velocity:0,sitting:false,attacking:false,attackProgress:0,hero,...state});};
          tick({moving:true});check(hero+' walk '+fps,Math.abs(l.leftLeg.rotation.x)>.08);
          tick({moving:true,sprint:true});check(hero+' run '+fps,Math.abs(l.leftLeg.rotation.x)>.08);
          tick({grounded:false,velocity:3});const ascent=l.leftLeg.rotation.x;
          tick({grounded:false,velocity:-3});check(hero+' ascent differs from fall '+fps,Math.abs(l.leftLeg.rotation.x-ascent)>.2);
          tick({sitting:true});check(hero+' sitting '+fps,l.body.position.y<base-.12&&l.leftLeg.rotation.x<-.8);
          tick({});check(hero+' stands again '+fps,Math.abs(l.body.position.y-base)<.03&&Math.abs(l.leftLeg.rotation.x)<.02);
          tick({attacking:true,attackProgress:.5});check(hero+' attack pose '+fps,Math.max(Math.abs(l.rightArm.rotation.y),Math.abs(l.leftArm.rotation.y))>.15);
          tick({});check(hero+' attack recovers '+fps,Math.abs(l.rightArm.rotation.y-(hero==='kingkong'?-.08:0))<.02);
        }
      }
      const dragon=document.querySelectorAll('#card-hero-dragon_knight .stat-row');
      check('Dragon has four matching stat rows',dragon.length===4);
      check('Fantasy portrait used',document.querySelector('#card-hero-dragon_knight img').src.includes('portrait-art.png'));
      enterGame();selectHero('rabbit');triggerAttack();returnToHome();check('Returning home cancels attack',!isAttacking);
      return results;
    })()`);
    console.log(report.filter(r=>!r.ok));console.log(report.filter(r=>r.ok).length+'/'+report.length+' animation checks');assert(report.every(r=>r.ok));assert.equal(errors.length,0);
    await evaluate("document.getElementById('btn-open-heroes').click()");await pause(400);const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'heroes-fantasy-art-stats.png'),Buffer.from(shot.data,'base64'));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
