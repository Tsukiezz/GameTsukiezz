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
        function check(name,ok,detail={}) { results.push({name,ok,detail}); }
        function grid(y,x0,x1,z0,z1,sx,sz) {
            const cells=new Set();
            for(let x=x0;x<=x1;x+=.5) for(let z=z0;z<=z1;z+=.5)
                if(!checkCollision(x,z,y) && Math.abs(getGroundElevation(x,z,y)-y)<.1) cells.add(x+','+z);
            const start=sx+','+sz, seen=new Set([start]), queue=[[sx,sz]],parents=new Map();
            for(let n=0;n<queue.length;n++) {
                const [x,z]=queue[n];
                for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]) {
                    const key=(x+dx)+','+(z+dz);
                    if(cells.has(key) && !seen.has(key) && !checkCollision(x+dx/2,z+dz/2,y)) {
                        seen.add(key);parents.set(key,x+','+z);queue.push([x+dx,z+dz]);
                    }
                }
            }
            const unreachable=[...cells].filter(k=>!seen.has(k));
            return {total:cells.size,reachable:seen.size,unreachable:unreachable.slice(0,30),seen,parents,start,y};
        }
        const movementFailures=[];
        function walkRoute(grid,x,z) {
            let key=x+','+z;
            if(!grid.seen.has(key)) return false;
            const path=[];
            while(key!==grid.start) {path.push(key.split(',').map(Number));key=grid.parents.get(key);}
            const start=grid.start.split(',').map(Number);
            playerGroup.position.set(start[0],grid.y,start[1]);
            currentGroundY=grid.y;isGrounded=true;jumpY=0;jumpVelocityY=0;
            for(const [px,pz] of path.reverse()) {
                movePlayerWithCollisions(px-playerGroup.position.x,pz-playerGroup.position.z);
                updatePlayerVertical(1/60);
                if(Math.hypot(playerGroup.position.x-px,playerGroup.position.z-pz)>.01 || Math.abs(playerGroup.position.y-grid.y)>.1) {
                    movementFailures.push({target:[x,z],waypoint:[px,pz],position:playerGroup.position.toArray()});return false;
                }
            }
            return true;
        }
        const levels=[];
        for(const [name,y,sx,sz] of [['hall',6,-110,105],['reception',9.5,-100,132],['royal',13,-110,132],['attic',20,-110,114]]) {
            // Include the front corridor: side rooms connect around the stair
            // opening through z=96..100, inside the actual castle footprint.
            const map=grid(y,-128,-92,y===20?100:96,140,sx,sz);
            const targets=[[sx,sz],[-125,120],[-95,105],[-110,110],[-110,135]].filter(p=>map.seen.has(p.join(',')));
            const walked=targets.map(p=>walkRoute(map,...p)).every(Boolean);
            check(name+' walk routes around furnishings',walked,{movementFailures});
            const ratio=map.reachable/map.total;
            check(name+' floor stays connected',ratio>.98,{total:map.total,reachable:map.reachable,unreachable:map.unreachable});
            check(name+' has furnishings',CASTLE_EXTENSION.furnishings.filter(f=>f.floor===y).length>=8);
            levels.push({name,total:map.total,reachable:map.reachable});
        }
        let recoveries=0, landings=0;
        const furniture=colliders.filter(c=>c.furniture && c.name==='furniture-volume');
        for(const c of furniture) {
            const floor=c.minY;
            playerGroup.position.set((c.minX+c.maxX)/2,floor,(c.minZ+c.maxZ)/2);
            currentGroundY=floor;isGrounded=true;jumpY=0;jumpVelocityY=0;
            if(recoverFromFurniture() && !checkCollision(playerGroup.position.x,playerGroup.position.z,playerGroup.position.y) && Math.abs(playerGroup.position.y-floor)<.31) recoveries++;
            playerGroup.position.set((c.minX+c.maxX)/2,c.maxY+1,(c.minZ+c.maxZ)/2);
            currentGroundY=playerGroup.position.y;isGrounded=false;jumpY=0;jumpVelocityY=-2;
            for(let i=0;i<180 && !isGrounded;i++) updatePlayerVertical(1/60);
            if(isGrounded && playerGroup.position.y>=c.maxY-.001) landings++;
        }
        check('Every new furniture footprint can be escaped',recoveries===furniture.length,{recoveries,total:furniture.length});
        check('Falling onto furniture never sinks inside',landings===furniture.length,{landings,total:furniture.length});
        return {results,levels,assemblies:CASTLE_EXTENSION.furnishings.length};
    })()`);
    console.log(JSON.stringify(report,null,2));
    for(const [name,x,y,z,yaw] of [
        ['furnished-great-hall',-110,6,104,Math.PI],
        ['furnished-reception',-110,9.5,106,Math.PI],
        ['furnished-state-bedroom',-119,13,112,Math.PI/2],
        ['furnished-attic-study',-110,20,129,Math.PI]
    ]) {
        await evaluate(`playerGroup.position.set(${x},${y},${z});currentGroundY=${y};isGrounded=true;jumpY=0;jumpVelocityY=0;camYaw=${yaw};camPitch=.12;camDistance=3;`);
        await pause(1800);
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    fs.writeFileSync(path.join(output,'interiors-report.json'),JSON.stringify(report,null,2));
    assert(report.results.every(r=>r.ok),'All interiors checks pass');
    assert.equal(errors.length,0,'No runtime errors');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
