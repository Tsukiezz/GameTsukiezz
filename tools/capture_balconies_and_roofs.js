const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-balconies-'));
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9290',
        `--user-data-dir=${tmpDir}`,
        '--disable-gpu',
        '--window-size=1440,860',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2500));

    const wsUrl = await new Promise((resolve) => {
        http.get('http://localhost:9290/json', (res) => {
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

    // Enter game
    await call('Runtime.evaluate', {
        expression: `(() => {
            enterGame();
            document.getElementById('game-hud').classList.add('active');
        })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // SCENE 1: Toàn Cảnh Lâu Đài Với Ban Công & Mái Che (Exterior View from Grand Bridge Ramp)
    console.log("Setting up Scene 1: Castle Exterior with Roofs & Canopies");
    await call('Runtime.evaluate', {
        expression: `(() => {
            playerGroup.position.set(-110, 4.2, 76);
            currentGroundY = 4.2;
            playerGroup.rotation.y = 0;
            
            camYaw = Math.PI;
            camPitch = 0.28;
            camDistance = 4.5;
            camera.position.set(-110, 6.2, 68);
            camera.lookAt(-110, 18.0, 115);
            return 'Exterior ready';
        })()`
    });
    await new Promise(r => setTimeout(r, 1600));
    const shot1 = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'demo', 'castle_exterior_balconies_roof.png'), Buffer.from(shot1.data, 'base64'));
    console.log("Saved castle_exterior_balconies_roof.png");

    // SCENE 2: Đứng Trên Ban Công Hoàng Gia Tầng 2 Dưới Mái Che (Floor 2 Royal Balcony)
    console.log("Setting up Scene 2: Standing on Floor 2 Royal Balcony");
    await call('Runtime.evaluate', {
        expression: `(() => {
            playerGroup.position.set(-110, 13.0, 91.5);
            currentGroundY = 13.0;
            playerGroup.rotation.y = Math.PI; // Looking South out towards bridge ramp and realm
            
            camYaw = 0; // Camera behind looking South over realm
            camPitch = 0.18;
            camDistance = 2.4;
            camera.position.set(-110, 14.1, 94.5);
            camera.lookAt(-110, 13.4, 75);
            return 'Balcony 2 ready';
        })()`
    });
    await new Promise(r => setTimeout(r, 1600));
    const shot2 = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'demo', 'castle_balcony_floor2.png'), Buffer.from(shot2.data, 'base64'));
    console.log("Saved castle_balcony_floor2.png");

    // SCENE 3: Đứng Trên Ban Công Vọng Cảnh Gác Mái Tầng 3 (Floor 3 Attic Balcony & Celestial Canopy)
    console.log("Setting up Scene 3: Standing on Floor 3 Attic Balcony");
    await call('Runtime.evaluate', {
        expression: `(() => {
            playerGroup.position.set(-110, 20.0, 96.0);
            currentGroundY = 20.0;
            playerGroup.rotation.y = Math.PI; // Looking South towards horizon
            
            camYaw = 0;
            camPitch = 0.20;
            camDistance = 2.4;
            camera.position.set(-110, 21.2, 99.0);
            camera.lookAt(-110, 19.5, 70);
            return 'Balcony 3 ready';
        })()`
    });
    await new Promise(r => setTimeout(r, 1600));
    const shot3 = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'demo', 'castle_balcony_attic.png'), Buffer.from(shot3.data, 'base64'));
    console.log("Saved castle_balcony_attic.png");

    chrome.kill();
    process.exit(0);
}

main().catch(err => {
    console.error("Error in capture:", err);
    process.exit(1);
});
