"""Build one portable Windows EXE using the installed .NET Framework compiler.

Only the playable demo is embedded, never Blender sources, Git, saves or reports.
"""
from pathlib import Path
import hashlib,json,subprocess,zipfile,time,os
from PIL import Image
from ensure_webview2 import ensure

ROOT=Path(__file__).resolve().parents[2]
BUILD=ROOT/'.runtime/desktop-build';BUILD.mkdir(parents=True,exist_ok=True)
sdk=ensure(ROOT)
runtime=ROOT/'demo';files=sorted(p for p in runtime.rglob('*') if p.is_file() and 'verification' not in p.relative_to(runtime).parts)
assert (runtime/'vendor/three-r128.min.js').is_file(),'Vendor Three.js before building the offline EXE.'
manifest={str(p.relative_to(runtime)).replace('\\','/'):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files}
bundle_id=hashlib.sha256(json.dumps(manifest,sort_keys=True).encode()).hexdigest()[:24]
archive=BUILD/'game.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for file in files:
        info=zipfile.ZipInfo(str(file.relative_to(runtime)).replace('\\','/'),date_time=(2026,11,2,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,file.read_bytes())
icon=BUILD/'tsuventure.ico'
Image.open(runtime/'features/lobby/assets/app/icon-512.png').convert('RGBA').save(icon,format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
assembly=BUILD/'BuildInfo.cs'
launcher_sources=sorted((ROOT/'tools/desktop').glob('*.cs'))
launcher_id=hashlib.sha256(b''.join(p.read_bytes() for p in launcher_sources)+(ROOT/'tools/desktop/webview2-dependency.json').read_bytes()).hexdigest()[:24]
assembly.write_text('using System.Reflection;\n[assembly:AssemblyTitle("Tsuventure")]\n[assembly:AssemblyProduct("Tsuventure")]\n[assembly:AssemblyVersion("2026.11.3.1")]\n[assembly:AssemblyFileVersion("2026.11.3.1")]\nnamespace TsuventureDesktop { internal static class BuildInfo { public const string BundleId="'+bundle_id+'"; public const string LauncherId="'+launcher_id+'"; }}\n',encoding='utf8')
compiler=Path('C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe');assert compiler.is_file()
output=ROOT/'Tsuventure.exe'
compiled=BUILD/'Tsuventure.new.exe'
command=[str(compiler),'/nologo','/target:winexe','/platform:anycpu','/optimize+','/utf8output','/out:'+str(compiled),'/win32icon:'+str(icon),'/resource:'+str(archive)+',Tsuventure.Game.zip','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.IO.Compression.dll','/reference:System.IO.Compression.FileSystem.dll',*[str(p) for p in launcher_sources],str(assembly)]
command+=['/reference:System.Web.Extensions.dll']
for name in ['Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll']:
    path=sdk/'lib/net462'/name
    command+=['/reference:'+str(path),'/resource:'+str(path)+',Tsuventure.Native.'+name]
for arch in ['x64','x86']:
    command+=['/resource:'+str(sdk/f'runtimes/win-{arch}/native/WebView2Loader.dll')+',Tsuventure.Native.WebView2Loader.'+arch+'.dll']
for name in ['LICENSE.txt','NOTICE.txt']:command+=['/resource:'+str(sdk/name)+',Tsuventure.Native.'+name]
subprocess.run(command,check=True,cwd=ROOT)
try:
    os.replace(compiled,output)
except OSError:
    # Windows permits renaming a mapped executable even when in-place writes fail.
    backup=BUILD/('Tsuventure.previous-'+str(time.time_ns())+'.exe')
    assert output.resolve().is_relative_to(ROOT.resolve()) and backup.resolve().is_relative_to(BUILD.resolve())
    output.rename(backup)
    try:
        compiled.rename(output)
    except OSError:
        backup.rename(output)
        raise
report={'bundle':bundle_id,'files':len(files),'runtimeBytes':sum(v['bytes'] for v in manifest.values()),'exeBytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'manifest':manifest}
(ROOT/'docs/desktop-build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='manifest'}))
