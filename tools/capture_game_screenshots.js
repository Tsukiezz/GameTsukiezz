const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function captureProper() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-prof-'));
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9223',
        `--user-data-dir=${tmpDir}`,
        '--disable-gpu',
        '--window-size=1440,860',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2500));

    http.get('http://localhost:9223/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
                ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));

                // Enter Game and position camera
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 3,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                enterGame();
                                document.getElementById('game-hud').classList.add('active');
                                
                                // Position player on Castle Bridge Ramp
                                playerGroup.position.set(-110, 3.25, 68.0);
                                currentGroundY = 3.25;
                                playerGroup.rotation.y = 0;
                                camYaw = Math.PI - 0.2;
                                camPitch = 0.35;
                                camDistance = 3.8;
                                return 'Positioned on Castle Bridge';
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 1500);

                // Wait 2.5s for render & FPS text update and take screenshot of Castle Bridge Ramp
                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 10, method: "Page.captureScreenshot", params: { format: "png" } }));
                }, 4000);

                // Move to Crystal Road near Central Plaza
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 4,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                playerGroup.position.set(-45, 0.35, 17.5);
                                currentGroundY = 0.35;
                                camYaw = -1.1;
                                camPitch = 0.32;
                                camDistance = 3.6;
                                return 'Positioned on Crystal Road';
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 5000);

                // Wait 2s and take screenshot of Crystal Highway
                setTimeout(() => {
                    ws.send(JSON.stringify({ id: 20, method: "Page.captureScreenshot", params: { format: "png" } }));
                }, 7000);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 3 && msg.result) {
                    console.log("Enter game eval result:", JSON.stringify(msg.result));
                }
                if (msg.id === 10 && msg.result && msg.result.data) {
                    const buf = Buffer.from(msg.result.data, 'base64');
                    const file = path.join(__dirname, '..', 'demo', 'verified_castle_bridge.png');
                    fs.writeFileSync(file, buf);
                    console.log(`Saved fresh screenshot 1 to ${file}`);
                }
                if (msg.id === 20 && msg.result && msg.result.data) {
                    const buf = Buffer.from(msg.result.data, 'base64');
                    const file = path.join(__dirname, '..', 'demo', 'verified_crystal_road.png');
                    fs.writeFileSync(file, buf);
                    console.log(`Saved fresh screenshot 2 to ${file}`);
                    setTimeout(() => {
                        chrome.kill();
                        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(e) {}
                        process.exit(0);
                    }, 500);
                }
            };
        });
    });
}

captureProper().catch(console.error);
