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
        prisonState.open=true;for(let i=0;i<150;i++)updateCastleGate(1/60);
        const floors=[['crypt',-5,-120,130,-124.5,-113.5,114.5,137.5],['basement',1,-126,113,-128,-92,100,140],['hall',6,-110,105,-128,-92,96,140],['reception',9.5,-110,132,-128,-92,96,140],['royal',13,-110,132,-128,-92,96,140],['attic',20,-110,114,-128,-92,100,140]];
        const levels=[];
        for(const [name,y,sx,sz,x0,x1,z0,z1] of floors) {
            const map=grid(y,x0,x1,z0,z1,sx,sz);
            const plans=CASTLE_EXTENSION.rooms.filter(r=>r.floor===y);
            const inaccessible=[],blockedRoutes=[];
            for(const room of plans) {
                const points=[...map.seen].map(key=>key.split(',').map(Number)).filter(([x,z])=>x+110>room.minX+.3 && x+110<room.maxX-.3 && z-120>room.minZ+.3 && z-120<room.maxZ-.3);
                if(!points.length) inaccessible.push(room.name);
                else if(!walkRoute(map,...points[Math.floor(points.length/2)])) blockedRoutes.push(room.name);
            }
            check(name+' rooms reachable',inaccessible.length===0,{inaccessible});
            check(name+' actual walking through doors',blockedRoutes.length===0,{blockedRoutes,movementFailures});
            levels.push({name,total:map.total,reachable:map.reachable,unreachable:map.unreachable});
        }
        check('Functional rooms coexist with winding corridors',CASTLE_EXTENSION.roomWalls>80 && CASTLE_EXTENSION.rooms.length>=40 && CASTLE_EXTENSION.rooms.length<=55,{walls:CASTLE_EXTENSION.roomWalls,zones:CASTLE_EXTENSION.rooms.length});
        check('Walls batched for weak GPUs',castlePhysics.group.children.filter(m=>m.name==='room-wall-batch').length<=18);
        return {results,levels};
    })()`);
    await evaluate("playerGroup.position.set(-110,6,105);currentGroundY=6;isGrounded=true;jumpY=0;camPitch=0;isRightMouseDown=true;window.dispatchEvent(new MouseEvent('mousemove',{movementY:-600,movementX:0}));");
    await pause(800);
    const up=await evaluate('({pitch:camPitch,direction:camera.getWorldDirection(new THREE.Vector3()).y})');
    await evaluate("window.dispatchEvent(new MouseEvent('mousemove',{movementY:1200,movementX:0}));");
    await pause(800);
    const down=await evaluate('({pitch:camPitch,direction:camera.getWorldDirection(new THREE.Vector3()).y})');
    await evaluate('isRightMouseDown=false;camPitch=.25;');
    report.results.push({name:'Mouse looks upward inside a room',ok:up.pitch<-1 && up.direction>.8,detail:up});
    report.results.push({name:'Mouse looks downward inside a room',ok:down.pitch>1 && down.direction<-.8,detail:down});
    console.log(JSON.stringify(report,null,2));
    for(const [name,x,y,z,yaw] of [
        ['maze-great-hall',-110,6,104,Math.PI],
        ['maze-reception',-100,9.5,132,0],
        ['maze-royal-room',-119,13,112,Math.PI/2],
        ['maze-attic',-110,20,114,Math.PI]
    ]) {
        await evaluate(`playerGroup.position.set(${x},${y},${z});currentGroundY=${y};isGrounded=true;jumpY=0;jumpVelocityY=0;camYaw=${yaw};camPitch=.12;camDistance=3;`);
        await pause(1500);
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    fs.writeFileSync(path.join(output,'rooms-report.json'),JSON.stringify(report,null,2));
    assert(report.results.every(r=>r.ok),'All room and camera checks pass');
    assert.equal(errors.length,0,'No runtime errors');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();chrome.kill();});
