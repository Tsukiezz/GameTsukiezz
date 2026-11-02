"""Check current arena/creature JS syntax and every local entry-page asset."""
from pathlib import Path
import concurrent.futures,json,re,subprocess,urllib.request
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'demo/verification/arena-levels';out.mkdir(parents=True,exist_ok=True)
files=['demo/features/arena/arena-tournament.js','demo/features/arena/arena-relocation.js','demo/features/creatures/creature-refresh.js','demo/features/world/monster-skills.js','demo/features/mangrove/mangrove-life.js','demo/features/library/library-previews.js','demo/features/library/field-guide.js','demo/features/creatures/data/creature-studio.js','tools/tests/arena_levels.browser.js','tools/tests/arena_speed.browser.js','tools/tests/review_creature_library.browser.js','tools/tests/inspect_void_runtime.js']
checks=[]
for file in files:
    result=subprocess.run(['node','--check',str(ROOT/file)],capture_output=True,text=True)
    checks.append({'name':file,'ok':result.returncode==0,'detail':result.stderr if result.returncode else None})
html=(ROOT/'demo/index.html').read_text(encoding='utf8');urls=sorted(set(re.findall(r'(?:src|href)=["\']([^"\']+)',html)))
urls=[url for url in urls if not url.startswith(('http','data:','#','javascript:')) and '${' not in url and not url.startswith("'+")]
def fetch(url):
    try:
        with urllib.request.urlopen('http://127.0.0.1:8883/'+url,timeout=15) as response:return {'url':url,'ok':response.status==200}
    except Exception as error:return {'url':url,'ok':False,'detail':str(error)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:assets=list(executor.map(fetch,urls))
checks.append({'name':'All linked local web assets served','ok':all(a['ok'] for a in assets),'count':len(assets)})
(out/'source-assets.json').write_text(json.dumps({'checks':checks,'assets':assets},indent=2),encoding='utf8')
print(json.dumps({'checks':len(checks),'assets':len(assets),'failures':[c for c in checks if not c['ok']]}));assert all(c['ok'] for c in checks)
