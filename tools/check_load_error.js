const { spawn } = require('child_process');
const http = require('http');

async function checkLoadError() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9231',
        '--disable-gpu',
        'http://localhost:8080/'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    http.get('http://localhost:9231/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const target = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
            const ws = new WebSocket(target.webSocketDebuggerUrl);
            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
                ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
                setTimeout(() => {
                    chrome.kill();
                    process.exit(0);
                }, 3000);
            };
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.method === "Runtime.exceptionThrown") {
                    console.error("LOAD EXCEPTION:", JSON.stringify(msg.params.exceptionDetails, null, 2));
                }
            };
        });
    });
}
checkLoadError();
