const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function captureCastleShowcase() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-castle-perfect-'));
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9250',
        `--user-data-dir=${tmpDir}`,
        '--disable-gpu',
        '--window-size=1440,860',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2500));

    http.get('http://localhost:9250/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
                ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));

                // SCENE 1: Hầm Trú Ẩn Bí Mật (Secret Shelter Bunker & War Room)
                // Looking West towards Fireplace, War Table with orbiting crystals, and Bunk Bed
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 3,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                enterGame();
                                document.getElementById('game-hud').classList.add('active');
                                
                                playerGroup.position.set(-114, 1.0, 115);
                                currentGroundY = 1.0;
                                playerGroup.rotation.y = -Math.PI / 2;
                                
                                camYaw = Math.PI / 2;
                                camPitch = 0.22;
                                camDistance = 2.2;
                                camera.position.set(-111.8, 2.0, 115);
                                camera.lookAt(-120, 1.6, 115);
                                return 'Positioned in Secret Shelter';
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 1500);

                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 10, method: "Page.captureScreenshot", params: { format: "png" } }));
                }, 3500);

                // SCENE 2: Đại Điện Hoàng Gia Tầng 1 (Grand Hall Nave, Banners, Torches, Banquet Table)
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 4,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                playerGroup.position.set(-110, 6.0, 105);
                                currentGroundY = 6.0;
                                playerGroup.rotation.y = 0;
                                
                                camYaw = Math.PI;
                                camPitch = 0.20;
                                camDistance = 2.3;
                                camera.position.set(-110, 7.0, 102.5);
                                camera.lookAt(-110, 6.8, 118);
                                return 'Positioned in Grand Hall';
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 4500);

                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 20, method: "Page.captureScreenshot", params: { format: "png" } }));
                }, 6500);

                // SCENE 3: Thánh Điện Ngai Vàng Tầng 2 (Looking directly at Moon Throne)
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 5,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                playerGroup.position.set(-110, 13.0, 128);
                                currentGroundY = 13.0;
                                playerGroup.rotation.y = 0;
                                
                                camYaw = Math.PI;
                                camPitch = 0.22;
                                camDistance = 2.4;
                                camera.position.set(-110, 14.1, 125.5);
                                camera.lookAt(-110, 14.6, 137);
                                return 'Positioned in Throne Room';
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 7500);

                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 30, method: "Page.captureScreenshot", params: { format: "png" } }));
                }, 9500);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 10 && msg.result && msg.result.data) {
                    const buf = Buffer.from(msg.result.data, 'base64');
                    const file = path.join(__dirname, '..', 'demo', 'castle_secret_shelter.png');
                    fs.writeFileSync(file, buf);
                    console.log(`Saved screenshot 1 to ${file}`);
                }
                if (msg.id === 20 && msg.result && msg.result.data) {
                    const buf = Buffer.from(msg.result.data, 'base64');
                    const file = path.join(__dirname, '..', 'demo', 'castle_hall_banners.png');
                    fs.writeFileSync(file, buf);
                    console.log(`Saved screenshot 2 to ${file}`);
                }
                if (msg.id === 30 && msg.result && msg.result.data) {
                    const buf = Buffer.from(msg.result.data, 'base64');
                    const file = path.join(__dirname, '..', 'demo', 'castle_throne_room.png');
                    fs.writeFileSync(file, buf);
                    console.log(`Saved screenshot 3 to ${file}`);
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}

captureCastleShowcase();
