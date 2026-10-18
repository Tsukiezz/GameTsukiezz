const { spawn } = require('child_process');
const http = require('http');

async function measure() {
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
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 2,
                        method: "Runtime.evaluate",
                        params: {
                            expression: `(() => {
                                let totalMeshes = 0;
                                let totalLights = 0;
                                let instancedCount = 0;
                                window.scene.traverse(obj => {
                                    if (obj.isMesh) totalMeshes++;
                                    if (obj.isInstancedMesh) instancedCount++;
                                    if (obj.isLight) totalLights++;
                                });
                                return JSON.stringify({
                                    drawCalls: window.renderer.info.render.calls,
                                    triangles: window.renderer.info.render.triangles,
                                    geometries: window.renderer.info.memory.geometries,
                                    textures: window.renderer.info.memory.textures,
                                    pixelRatio: window.renderer.getPixelRatio(),
                                    totalMeshes,
                                    instancedCount,
                                    totalLights,
                                    activeDynamicLights: window.dynamicLights ? window.dynamicLights.filter(d => d.light.visible).length : 0
                                });
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 2000);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 2) {
                    console.log("Evaluation response:", JSON.stringify(msg));
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}

measure().catch(console.error);
