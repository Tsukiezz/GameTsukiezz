"""Exercise the actual portable EXE, embedded files and server handover."""
from pathlib import Path
import argparse,concurrent.futures,ctypes,hashlib,json,shutil,socket,subprocess,time,urllib.request,urllib.error
ROOT=Path(__file__).resolve().parents[2];area=ROOT/'.runtime/desktop-test';area.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--keep-server',action='store_true');args=parser.parse_args()
exe=area/'Tsuventure.exe';shutil.copyfile(ROOT/'Tsuventure.exe',exe);port=8897;base=f'http://127.0.0.1:{port}/';checks=[];processes=[]
http=urllib.request.build_opener(urllib.request.ProxyHandler({}))
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
def request(path='',method='GET',headers=None):
    try:r=http.open(urllib.request.Request(base+path,method=method,headers=headers or {}),timeout=20)
    except urllib.error.HTTPError as e:r=e
    with r:return r.status,dict(r.headers),r.read()
def start(*extra):
    p=subprocess.Popen([str(exe),'--headless','--port',str(port),'--timeout','900','--cache-dir',str(area/'cache'),*extra],cwd=area,creationflags=subprocess.CREATE_NO_WINDOW);processes.append(p);return p
def wait(mode):
    for _ in range(200):
        try:
            code,_,data=request('__tsuventure/status');state=json.loads(data)
            if code==200 and state['mode']==mode:return state
        except (OSError,ValueError):pass
        time.sleep(.1)
    raise RuntimeError('EXE server failed to start: '+mode)
def stop():
    kernel=ctypes.WinDLL('kernel32',use_last_error=True);kernel.OpenEventW.restype=ctypes.c_void_p;kernel.OpenEventW.argtypes=[ctypes.c_uint32,ctypes.c_bool,ctypes.c_wchar_p];kernel.SetEvent.argtypes=[ctypes.c_void_p];kernel.CloseHandle.argtypes=[ctypes.c_void_p]
    h=kernel.OpenEventW(2,False,'Local\\Tsuventure.Restart.'+str(port))
    if h:kernel.SetEvent(h);kernel.CloseHandle(h)
try:
    branding=area/'window-branding.json'
    probe=subprocess.run([str(exe),'--headless','--verify-branding',str(branding)],cwd=area,creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
    check('Native taskbar verification exits successfully',probe.returncode==0)
    brand=json.loads(branding.read_text(encoding='utf8'))
    for name in ['appId','iconResource','displayName','relaunchCommand','windowIcon']:
        check('Taskbar/window identity: '+name,brand.get(name) is True)
    p=start();state=wait('embedded');check('Standalone EXE extracts and serves its embedded game without Python',p.poll() is None and state['mode']=='embedded',state)
    manifest=json.loads((ROOT/'docs/desktop-build.json').read_text(encoding='utf8'))['manifest']
    def probe(item):
        path,spec=item;code,headers,data=request(path);return path,code==200 and hashlib.sha256(data).hexdigest()==spec['sha256']
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(probe,manifest.items()))
    check('Every embedded runtime file matches the tested project',all(ok for _,ok in results),{'files':len(results),'failed':[f for f,ok in results if not ok]})
    code,headers,body=request('index.html',method='HEAD');check('HEAD returns size and no body',code==200 and not body and int(headers['Content-Length'])==manifest['index.html']['bytes'])
    media='features/lobby/assets/tsuventure-lobby.webm';original=(ROOT/'demo'/media).read_bytes()
    code,headers,data=request(media,headers={'Range':'bytes=12-47'});check('Video byte-range seeking returns exact content',code==206 and data==original[12:48] and headers.get('Content-Range')==f'bytes 12-47/{len(original)}')
    code,_,data=request(media,headers={'Range':'bytes=-16'});check('Suffix byte ranges work',code==206 and data==original[-16:])
    check('Invalid ranges return 416',request(media,headers={'Range':'bytes=999999999999-'})[0]==416)
    check('Cache validation permits later project updates','no-store' in request('index.html')[1].get('Cache-Control',''))
    url1=json.loads(request('__tsuventure/launch')[2])['url'];url2=json.loads(request('__tsuventure/launch')[2])['url']
    check('Every open gets a fresh document URL without changing save origin',url1!=url2 and url1.startswith(base+'?desktop=1&launch=') and url2.startswith(base+'?desktop=1&launch='))
    check('Fresh launch renders current entry page',request(url1[len(base):])[2]==(ROOT/'demo/index.html').read_bytes())
    check('Three.js is included locally',request('vendor/three-r128.min.js')[0]==200)
    check('Non-game files are inaccessible',request('..%2fprivate.txt')[0]==403 and request('..%5cprivate.txt')[0]==403)
    check('Foreign hosts and write requests are rejected',request('',headers={'Host':'foreign.invalid'})[0]==403 and request('',method='POST')[0]==405)
    check('Missing assets return 404',request('missing-game-resource.xyz')[0]==404)
    duplicate=start();check('Double-click reuses existing server',duplicate.wait(timeout=10)==0 and p.poll() is None)
    replacement=start('--root',str(ROOT/'demo'));wait('project');p.wait(timeout=10);check('Launcher switches safely from embedded game to current project',p.returncode==0 and replacement.poll() is None)
    check('Project mode serves the current updated source',request('features/creatures/creature-art.js')[2]==(ROOT/'demo/features/creatures/creature-art.js').read_bytes())
    stop();replacement.wait(timeout=10);p=start();state=wait('embedded')
    check('Portable game restarts after clean shutdown',p.poll() is None)
    report={'checks':checks,'pid':p.pid,'port':port,'bundle':state['bundle']};target=ROOT/'demo/verification/desktop';target.mkdir(parents=True,exist_ok=True);(target/'exe-report.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps({'checks':len(checks),'failures':[c for c in checks if not c['ok']],'pid':p.pid,'port':port}));assert all(c['ok'] for c in checks)
    if args.keep_server:(ROOT/'.runtime/desktop-test-server.json').write_text(json.dumps({'pid':p.pid,'port':port}),encoding='utf8')
finally:
    if not args.keep_server or not all(c['ok'] for c in checks):
        stop()
        for p in processes:
            if p.poll() is None:
                try:p.wait(timeout=10)
                except subprocess.TimeoutExpired:p.terminate()
