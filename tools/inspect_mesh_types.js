const { spawn } = require('child_process');
const http = require('http');

async function inspect() {
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
                                const counts = {};
                                window.scene.traverse(obj => {
                                    if (obj.isMesh) {
                                        const geo = obj.geometry ? obj.geometry.type : 'Unknown';
                                        counts[geo] = (counts[geo] || 0) + 1;
                                    }
                                });
                                return JSON.stringify(counts);
                            })()`,
                            returnByValue: true
                        }
                    }));
                }, 1500);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 2 && msg.result && msg.result.result) {
                    console.log("Mesh geometry types count:", JSON.parse(msg.result.result.value));
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}

inspect().catch(console.error);
