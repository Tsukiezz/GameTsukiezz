"""Build one portable Windows EXE using the installed .NET Framework compiler.

Only the playable demo is embedded, never Blender sources, Git, saves or reports.
"""
from pathlib import Path
import hashlib,json,subprocess,zipfile
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
BUILD=ROOT/'.runtime/desktop-build';BUILD.mkdir(parents=True,exist_ok=True)
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
assembly.write_text('using System.Reflection;\n[assembly:AssemblyTitle("Tsuventure")]\n[assembly:AssemblyProduct("Tsuventure")]\n[assembly:AssemblyVersion("2026.11.2.0")]\n[assembly:AssemblyFileVersion("2026.11.2.0")]\nnamespace TsuventureDesktop { internal static class BuildInfo { public const string BundleId="'+bundle_id+'"; }}\n',encoding='utf8')
compiler=Path('C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe');assert compiler.is_file()
output=ROOT/'Tsuventure.exe'
command=[str(compiler),'/nologo','/target:winexe','/platform:anycpu','/optimize+','/utf8output','/out:'+str(output),'/win32icon:'+str(icon),'/resource:'+str(archive)+',Tsuventure.Game.zip','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.IO.Compression.dll','/reference:System.IO.Compression.FileSystem.dll',str(ROOT/'tools/desktop/Launcher.cs'),str(assembly)]
subprocess.run(command,check=True,cwd=ROOT)
report={'bundle':bundle_id,'files':len(files),'runtimeBytes':sum(v['bytes'] for v in manifest.values()),'exeBytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'manifest':manifest}
(ROOT/'docs/desktop-build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='manifest'}))
