const { spawn } = require('child_process');
const http = require('http');

async function checkErrors() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    http.get('http://localhost:9222/json', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const tabs = JSON.parse(data);
            const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

            ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
                ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
                ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url: "http://localhost:8080/" } }));
                setTimeout(() => {
                    chrome.kill();
                    process.exit(0);
                }, 3500);
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.method === "Runtime.exceptionThrown") {
                    console.error("PAGE EXCEPTION:", JSON.stringify(msg.params.exceptionDetails));
                }
                if (msg.method === "Runtime.consoleAPICalled") {
                    console.log("CONSOLE LOG:", msg.params.type, JSON.stringify(msg.params.args));
                }
            };
        });
    });
}

checkErrors().catch(console.error);
