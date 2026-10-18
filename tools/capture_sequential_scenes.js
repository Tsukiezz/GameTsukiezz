const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-seq-final-'));
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9270',
        `--user-data-dir=${tmpDir}`,
        '--disable-gpu',
        '--window-size=1440,860',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2500));

    const wsUrl = await new Promise((resolve) => {
        http.get('http://localhost:9270/json', (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const tabs = JSON.parse(data);
                const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
                resolve(target.webSocketDebuggerUrl);
            });
        });
    });

    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function call(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = msgId++;
            const handler = (evt) => {
                const res = JSON.parse(evt.data);
                if (res.id === id) {
                    ws.removeEventListener('message', handler);
                    if (res.error) reject(res.error);
                    else resolve(res.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    await call('Runtime.enable');
    await call('Page.enable');

    // 1. Enter game
    await call('Runtime.evaluate', {
        expression: `(() => {
            enterGame();
            document.getElementById('game-hud').classList.add('active');
        })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // SCENE 1: Hầm Trú Ẩn Bí Mật (Secret Shelter Bunker & War Room)
    // Player facing West towards Fireplace, camera behind looking West
    console.log("Setting up Scene 1: Secret Shelter");
    await call('Runtime.evaluate', {
        expression: `(() => {
            playerGroup.position.set(-116, 1.0, 114);
            currentGroundY = 1.0;
            playerGroup.rotation.y = -Math.PI / 2;
            
            camYaw = Math.PI / 2;
            camPitch = 0.22;
            camDistance = 2.2;
            camera.position.set(-113.8, 1.9, 114);
            camera.lookAt(-122, 1.5, 114);
            return 'Shelter ready';
        })()`
    });
    await new Promise(r => setTimeout(r, 1500));
    const shot1 = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'demo', 'castle_secret_shelter.png'), Buffer.from(shot1.data, 'base64'));
    console.log("Saved castle_secret_shelter.png");

    // SCENE 3: Thánh Điện Ngai Vàng Tầng 2 (Moon Throne Room)
    // Looking directly at Moon Throne with crescent moons
    console.log("Setting up Scene 3: Moon Throne Room");
    await call('Runtime.evaluate', {
        expression: `(() => {
            playerGroup.position.set(-110, 13.0, 133);
            currentGroundY = 13.0;
            playerGroup.rotation.y = 0;
            
            camYaw = Math.PI;
            camPitch = 0.26;
            camDistance = 2.2;
            camera.position.set(-110, 13.9, 130.8);
            camera.lookAt(-110, 15.2, 138);
            return 'Throne Room ready';
        })()`
    });
    await new Promise(r => setTimeout(r, 1500));
    const shot3 = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'demo', 'castle_throne_room.png'), Buffer.from(shot3.data, 'base64'));
    console.log("Saved castle_throne_room.png");

    chrome.kill();
    process.exit(0);
}

main().catch(err => {
    console.error("Error in capture:", err);
    process.exit(1);
});
