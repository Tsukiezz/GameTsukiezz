"""Validate shipped entry assets, changed JS, and Blender inventory icon exports."""
from pathlib import Path
import json,re,hashlib,subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];WEB=ROOT/'demo';checks=[]
def check(ok,name,detail=None):
 checks.append({'ok':bool(ok),'name':name,'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
page=(WEB/'index.html').read_text(encoding='utf8');assets=[]
for url in re.findall(r'''(?:src|href)=["']([^"']+)''',page):
 if url.startswith(('https:','http:','//','data:','#')) or '${' in url:continue
 target=WEB/url.split('?')[0];check(target.is_file(),'Entry asset '+url)
 if '?v=' in url:check(hashlib.sha256(target.read_bytes()).hexdigest()[:12]==url.split('?v=')[1],'Cache key '+url)
 assets.append(url)
boot_manifest=WEB/'core/boot-manifest.json'
if boot_manifest.is_file():
 manifest_data=json.loads(boot_manifest.read_text(encoding='utf8'))
 for url in manifest_data['scripts']:
  target=WEB/url.split('?')[0];check(target.is_file(),'Boot manifest asset '+url)
  check(hashlib.sha256(target.read_bytes()).hexdigest()[:12]==url.split('?v=')[1],'Boot manifest cache key '+url)
  assets.append(url)
 for rel in ['core/game-boot.js','core/runtime-state.js']:
  result=subprocess.run(['node','--check',str(WEB/rel)],capture_output=True,text=True);check(result.returncode==0,'Boot syntax '+rel,result.stderr or None)
for rel in ['core/runtime.js','core/game-loop.js','features/world/removed-castle.js','features/castle/castle-upgrade.js','features/hud/game-hud.js','features/hud/game-shortcuts.js','features/world/exploration-update.js','features/inventory/gift-code.js','features/inventory/inventory-workspace.js','features/inventory/solar-flashlight.js','features/inventory/tree-wood.js','features/inventory/crystal-wings.js','features/inventory/food-pickups.js','features/inventory/backpack.js','features/mountain/bach-khuyet.js','features/library/field-guide.js','features/world/construction-zones.js','features/railway/railway-clearance.js']:
 result=subprocess.run(['node','--check',str(WEB/rel)],capture_output=True,text=True);check(result.returncode==0,'JavaScript syntax '+rel,result.stderr or None)
folder=WEB/'features/inventory/assets/blender';manifest=json.loads((folder/'manifest.json').read_text(encoding='utf8'))
check((ROOT/manifest['source']).read_bytes().startswith((b'BLENDER',b'\x28\xb5\x2f\xfd')),'Editable Blender studio exists (plain or Blender Zstandard format)')
for kind in manifest['icons']:
 with Image.open(folder/(kind+'.png')) as image:
  check(image.size==(256,256) and image.mode=='RGBA','Transparent Blender icon '+kind)
  alpha=image.getchannel('A');check(alpha.getextrema()==(0,255) and alpha.getbbox() is not None,'Icon has visible item and transparent background '+kind)
out=ROOT/'.runtime/world-inventory-update/source-checks.json';out.parent.mkdir(exist_ok=True,parents=True);out.write_text(json.dumps({'checks':checks,'assets':len(assets),'icons':len(manifest['icons'])},indent=2),encoding='utf8')
print(json.dumps({'checks':len(checks),'failures':0,'entryAssets':len(assets),'icons':len(manifest['icons'])}))
