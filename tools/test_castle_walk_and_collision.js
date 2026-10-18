const { spawn } = require('child_process');
const http = require('http');

async function testCastleMore() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9280',
        '--disable-gpu',
        '--window-size=1280,720',
        'http://localhost:8080/'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    http.get('http://localhost:9280/json', (res) => {
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
                        const results = [
                            { name: 'Mesa Base Left Cliff (Y=0.5m)', pos: [-135, 110, 0.5], col: checkCollision(-135, 110, 0.5) },
                            { name: 'Mesa Base Right Cliff (Y=0.5m)', pos: [-85, 135, 0.5], col: checkCollision(-85, 135, 0.5) },
                            { name: 'Dungeon North Wall (Y=1.0m)', pos: [-110, 141, 1.0], col: checkCollision(-110, 141, 1.0) },
                            { name: 'Dungeon South Boundary (Y=1.0m)', pos: [-110, 99, 1.0], col: checkCollision(-110, 99, 1.0) },
                            { name: 'Floor 2 Atrium Gap', pos: [-110, 118.5, 13.0], elev: getGroundElevation(-110, 118.5, 13.0), col: checkCollision(-110, 118.5, 13.0) },
                            { name: 'Floor 2 Bookshelves (Y=13.0m)', pos: [-91.8, 113.5, 13.0], col: checkCollision(-91.8, 113.5, 13.0) },
                            { name: 'Floor 2 Balcony Floor (Y=13.0m)', pos: [-110, 91.5, 13.0], elev: getGroundElevation(-110, 91.5, 13.0) },
                            { name: 'Floor 2 Balcony Front Rail (Y=13.5m)', pos: [-110, 88.9, 13.5], col: checkCollision(-110, 88.9, 13.5) },
                            { name: 'Floor 2 Balcony Left Rail (Y=13.5m)', pos: [-117.9, 91.4, 13.5], col: checkCollision(-117.9, 91.4, 13.5) },
                            { name: 'Floor 3 Attic Balcony Floor (Y=20.0m)', pos: [-110, 96.2, 20.0], elev: getGroundElevation(-110, 96.2, 20.0) },
                            { name: 'Floor 3 Attic Balcony Front Rail (Y=20.5m)', pos: [-110, 93.0, 20.5], col: checkCollision(-110, 93.0, 20.5) },
                            { name: 'Floor 3 Attic Balcony Left Rail (Y=20.5m)', pos: [-115.8, 96.2, 20.5], col: checkCollision(-115.8, 96.2, 20.5) },
                            { name: 'Throne Back Wall (Y=15.5m)', pos: [-110, 139.4, 15.5], col: checkCollision(-110, 139.4, 15.5) },
                            { name: 'Shelter Fireplace Wall (Y=1.5m)', pos: [-128, 114, 1.5], col: checkCollision(-128, 114, 1.5) },
                            { name: 'Shelter Bed Standable (Y=1.85m)', pos: [-118, 104, 1.85], elev: getGroundElevation(-118, 104, 1.85) }
                        ];
                        return JSON.stringify(results);
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
                    if (msg.result.exceptionDetails) {
                        console.error('JS EVAL EXCEPTION:', JSON.stringify(msg.result.exceptionDetails, null, 2));
                    } else {
                        console.log('Detailed Collision Results:', JSON.stringify(JSON.parse(msg.result.result.value), null, 2));
                    }
                    chrome.kill();
                    process.exit(0);
                }
            };
        });
    });
}
testCastleMore();
