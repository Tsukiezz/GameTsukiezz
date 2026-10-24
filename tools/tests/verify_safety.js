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
    const report=await evaluate(`(() => {
        enterGame();
        const results=[];
        function check(name,ok,detail={}) {results.push({name,ok,detail});}
        let sampled=0,holes=[];
        for(const y of [6,9.5,13,20]) {
            for(let x=-129.25;x<=-90.75;x+=.25) for(let z=101;z<=140;z+=.5) {
                if(checkCollision(x,z,y) || onCastleTransition(x,z,y)) continue;
                sampled++;
                if(getGroundElevation(x,z,y)<y-.03) holes.push({x,y,z});
            }
        }
        check('No unsupported floor cells outside stair transitions',holes.length===0,{sampled,holes:holes.slice(0,30)});
        const walls=CASTLE_EXTENSION.parts.filter(p=>p.name==='room-wall');
        const ray=new THREE.Raycaster();ray.far=2;
        scene.updateMatrixWorld(true);
        const wallMeshes=castlePhysics.cameraObstacles.filter(m=>m.name==='room-wall-batch');
        let sealed=0;
        for(const p of walls) {
            const [x,y,z]=p.position,[w,h,d]=p.size;
            const normal=w<d?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1);
            const center=new THREE.Vector3(x-110,y,z+120);
            let both=true;
            for(const side of [-1,1]) {
                ray.set(center.clone().addScaledVector(normal,side*.8),normal.clone().multiplyScalar(-side));
                if(!ray.intersectObjects(wallMeshes,false).length) both=false;
            }
            if(both) sealed++;
        }
        check('Partition walls occlude from both sides',sealed===walls.length,{sealed,total:walls.length});
        check('Opaque wall materials',wallMeshes.every(m=>!m.material.transparent && m.material.opacity===1));
        castleGate.open=true;for(let i=0;i<120;i++) updateCastleGate(1/60);
        let openings=0,inGap=false,clear=[];
        for(let x=-115;x<=-105;x+=.1) {
            const pass=!checkCollision(x,94,6);
            if(pass && !inGap) openings++;
            inGap=pass;
            if(pass) clear.push(x);
        }
        check('Open gate has exactly one broad central passage',openings===1 && clear.every(x=>Math.abs(x+110)<3.5),{openings,clearWidth:clear.length*.1});
        check('No bypass outside gate frame',[-114,-113.8,-106.2,-106].every(x=>checkCollision(x,94,6)));
        castleGate.open=false;for(let i=0;i<120;i++) updateCastleGate(1/60);
        check('Closed gate blocks the only passage',checkCollision(-110,94,6));
        playerGroup.position.set(-110,13,116);currentGroundY=13;isGrounded=true;jumpVelocityY=0;castleSafeAnchor=null;
        updatePlayerVertical(1/60);
        check('Valid floor records a recovery anchor',castleSafeAnchor && castleSafeAnchor.y===13);
        playerGroup.position.set(-109.5,11,116);isGrounded=false;jumpVelocityY=-3;
        updatePlayerVertical(1/60);
        check('Invalid fall recovers on the last reachable floor',isGrounded && playerGroup.position.y===13 && !checkCollision(playerGroup.position.x,playerGroup.position.z,13),{position:playerGroup.position.toArray()});
        return {results};
    })()`);
    console.log(JSON.stringify(report,null,2));
    for(const [name,x,y,z,yaw] of [
        ['sealed-corridor',-110,6,104,Math.PI],
        ['sealed-stairwell',-122,1,135,0],
        ['single-gate-passage',-110,5.6,91,Math.PI]
    ]) {
        await evaluate(`playerGroup.position.set(${x},${y},${z});currentGroundY=${y};isGrounded=true;jumpY=0;jumpVelocityY=0;castleSafeAnchor=null;camYaw=${yaw};camPitch=.2;camDistance=3;`);
        await pause(1500);
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    fs.writeFileSync(path.join(output,'safety-report.json'),JSON.stringify(report,null,2));
    assert(report.results.every(r=>r.ok),'All floor/wall/gate safety checks pass');
    assert.equal(errors.length,0,'No runtime errors');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
