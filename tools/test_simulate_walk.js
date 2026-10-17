const { spawn } = require('child_process');
const http = require('http');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    http.get('http://localhost:9222/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
                ws.send(JSON.stringify({
                    id: 2,
                    method: "Runtime.evaluate",
                    params: {
                        expression: `(() => {
                            enterGame();
                            // Place at castle bridge start
                            playerGroup.position.set(-110, 0.35, 41.5);
                            currentGroundY = 0.35;
                            camYaw = Math.PI; // Moves +Z
                            keys.forward = true;

                            // Simulate 280 animation frames of movement (55 meters walking up ramp into castle)
                            const checkpoints = [];
                            const delta = 0.033;
                            for (let frame = 1; frame <= 280; frame++) {
                                const forwardX = -Math.sin(camYaw);
                                const forwardZ = -Math.cos(camYaw);
                                const moveDir = new THREE.Vector3(-forwardX * (-1), 0, -forwardZ * (-1)).normalize();
                                const currentSpeed = 6.0;
                                const stepX = moveDir.x * currentSpeed * delta;
                                const stepZ = moveDir.z * currentSpeed * delta;

                                const colZ = checkCollision(playerGroup.position.x, playerGroup.position.z + stepZ, playerGroup.position.y, 0.20);
                                if (!colZ) {
                                    playerGroup.position.z += stepZ;
                                }

                                const targetGroundY = getGroundElevation(playerGroup.position.x, playerGroup.position.z, playerGroup.position.y);
                                const safeDt = Math.min(delta, 0.05);
                                const groundDamp = 1.0 - Math.exp(-24.0 * safeDt);
                                currentGroundY += (targetGroundY - currentGroundY) * groundDamp;
                                playerGroup.position.y = currentGroundY;

                                if (frame % 20 === 0 || frame === 280) {
                                    checkpoints.push({
                                        frame,
                                        z: playerGroup.position.z.toFixed(2),
                                        y: playerGroup.position.y.toFixed(2),
                                        targetGroundY: targetGroundY.toFixed(2),
                                        colZ
                                    });
                                }
                            }
                            return checkpoints;
                        })()`,
                        returnByValue: true
                    }
                }));
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 2 && msg.result && msg.result.result) {
                    console.log("Full Castle Bridge Ramp walk checkpoints (from z = 41.5 to Floor 1):");
                    console.table(msg.result.result.value);
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}

run().catch(console.error);
