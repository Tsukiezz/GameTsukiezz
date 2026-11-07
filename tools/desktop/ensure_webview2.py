"""Build-time SDK only. Official NuGet package, pinned version and SHA-256."""
from pathlib import Path
import hashlib,json,urllib.request,zipfile

def ensure(root):
    spec=json.loads((root/'tools/desktop/webview2-dependency.json').read_text(encoding='utf8'))
    cache=root/'.runtime/native-desktop';cache.mkdir(parents=True,exist_ok=True)
    package=cache/'webview2.nupkg'
    if not package.exists() or hashlib.sha256(package.read_bytes()).hexdigest()!=spec['packageSHA256']:
        data=urllib.request.urlopen(spec['url'],timeout=60).read()
        if hashlib.sha256(data).hexdigest()!=spec['packageSHA256']:raise ValueError('WebView2 SDK hash mismatch')
        package.write_bytes(data)
    names=['lib/net462/Microsoft.Web.WebView2.Core.dll','lib/net462/Microsoft.Web.WebView2.WinForms.dll','runtimes/win-x64/native/WebView2Loader.dll','runtimes/win-x86/native/WebView2Loader.dll','LICENSE.txt','NOTICE.txt']
    with zipfile.ZipFile(package) as archive:
        for name in names:archive.extract(name,cache/'sdk')
    return cache/'sdk'

if __name__=='__main__':print(ensure(Path(__file__).resolve().parents[2]))
