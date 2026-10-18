const { spawn } = require('child_process');
const http = require('http');

async function testPointerLock() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9300',
        '--disable-gpu',
        '--window-size=1280,720',
        'http://localhost:8080/'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    http.get('http://localhost:9300/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
                setTimeout(() => {
                    const expr = `(() => {
                        enterGame();
                        
                        // Simulate right-click mousedown
                        const downEvt = new MouseEvent('mousedown', { button: 2, clientX: 500, clientY: 300 });
                        window.dispatchEvent(downEvt);
                        
                        // Simulate mousemove with movement delta
                        const moveEvt = new MouseEvent('mousemove', {
                            movementX: 50,
                            movementY: -20,
                            clientX: 550,
                            clientY: 280
                        });
                        window.dispatchEvent(moveEvt);

                        const yawAfterMove = camYaw;
                        const rotYAfterMove = playerGroup.rotation.y;

                        // Simulate mouseup
                        const upEvt = new MouseEvent('mouseup', { button: 2 });
                        window.dispatchEvent(upEvt);

                        return JSON.stringify({
                            isRightMouseDown,
                            yawAfterMove,
                            rotYAfterMove,
                            equal: Math.abs(yawAfterMove - rotYAfterMove) < 0.001
                        });
                    })()`;

                    ws.send(JSON.stringify({
                        id: 2,
                        method: 'Runtime.evaluate',
                        params: { expression: expr, returnByValue: true }
                    }));
                }, 1000);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id === 2) {
                    console.log('Pointer Lock Test Result:', msg.result.result.value);
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}

testPointerLock();
