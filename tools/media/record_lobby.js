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

    const size=await evaluate(`(async()=>{
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
      const ctx=canvas.getContext('2d'),art=new Image();art.src='features/lobby/assets/background.jpg';await art.decode();
      const start=performance.now();
      function draw(){
        const t=(performance.now()-start)/12000*Math.PI*2,scale=Math.max(1280/art.width,720/art.height)*(1.055+.012*Math.cos(t));
        const w=art.width*scale,h=art.height*scale;
        ctx.drawImage(art,(1280-w)/2+10*Math.sin(t),(720-h)/2+6*Math.cos(t),w,h);
        for(let i=0;i<26;i++){
          const phase=t+i*2.399,x=640+520*Math.sin(i*13.7)+8*Math.sin(phase),y=360+310*Math.sin(i*7.3)+13*Math.cos(phase);
          ctx.globalAlpha=.15+.35*(.5+.5*Math.sin(phase));ctx.fillStyle=i%3?'#92ece5':'#efd7a2';ctx.beginPath();ctx.arc(x,y,i%4===0?2:1,0,Math.PI*2);ctx.fill();
        }ctx.globalAlpha=1;
      }
      draw();const timer=setInterval(draw,50);
      const stream=canvas.captureStream(20),chunks=[];
      const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2000000});
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();await new Promise(r=>setTimeout(r,12000));recorder.stop();await done;
      clearInterval(timer);stream.getTracks().forEach(t=>t.stop());
      const blob=new Blob(chunks,{type:'video/webm'});window.recordedLobby=await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.readAsDataURL(blob)});return window.recordedLobby.length;
    })()`);
    const chunks=[];for(let i=0;i<size;i+=250000)chunks.push(await evaluate('window.recordedLobby.slice('+i+','+(i+250000)+')'));
    const target=path.resolve(__dirname,'../../demo/media');fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'tsuventure-lobby.webm'),Buffer.from(chunks.join(''),'base64'));console.log('Lobby footage saved',size);
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
