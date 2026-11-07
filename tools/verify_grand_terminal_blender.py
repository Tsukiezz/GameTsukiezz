"""Verify the actual editable scene, deck shafts and reserve liveries in Blender."""
from pathlib import Path
import bpy,json
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Environments/GrandLunarTerminal.blend'))
scene=bpy.context.scene;deps=bpy.context.evaluated_depsgraph_get()
architecture=bpy.data.collections.get('Grand Lunar Terminal - editable architecture')
preview=bpy.data.collections.get('Reserve trains - six liveries - not exported twice')
check('Editable architecture and separate reference fleet',architecture and len(architecture.objects)>2800 and preview and len(preview.objects)>100)
for name in ['Orange','Pink','White','Gray','Brown','Beige']:
 check('Complete reserve train and paint '+name,bpy.data.materials.get('Reserve '+name) and all(any(o.name.startswith(name+(' locomotive' if i==0 else ' coach '+str(i))) for o in preview.objects) for i in range(4)))
for x in [-18,18]:
 for z in [-74,74]:
  hit,p,*_=scene.ray_cast(deps,Vector((x,-z,18.5)),Vector((0,0,-1)))
  check('Open elevator shaft '+str((x,z)),hit and p.z<.2,tuple(p))
hit,p,*_=scene.ray_cast(deps,Vector((35,-5,18.5)),Vector((0,0,-1)))
check('Upper public floor is actually level at eighteen metres',hit and abs(p.z-18)<.001,tuple(p))
hit,p,*_=scene.ray_cast(deps,Vector((35,-5,14)),Vector((0,0,1)))
check('Structural deck seals the ground hall ceiling',hit and 16.8<p.z<18,tuple(p))
check('Forty-nine independent load-bearing piers',sum(o.name.startswith('Load-bearing pier') for o in architecture.objects)==49)
raw=(ROOT/'demo/features/railway/data/grand-terminal.js').read_text(encoding='utf8');data=json.JSONDecoder().raw_decode(raw[raw.index('=')+1:])[0]
check('Runtime geometry stays merged into ten material groups',len(data['parts'])==10 and 60000<data['triangles']<80000)
check('Both directions have three independent reserve berths',data['reserveTracks']==[-66,-48,-30,30,48,66])
report={'checks':checks,'failures':[c for c in checks if not c['ok']]};(ROOT/'.runtime/grand-terminal/blender-checks.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'checks':len(checks),'failures':report['failures']}),flush=True)
assert not report['failures']
