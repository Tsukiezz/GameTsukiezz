"""Check saved editable Blender assets, including packed arena textures."""
from pathlib import Path
import bpy,json
ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Creatures/LunarCreatureStudio.blend'))
collections=[c for c in bpy.data.collections if c.name.startswith('Creature_')];check('49 editable creature collections',len(collections)==49,len(collections));check('All source species contain mesh geometry',all(any(o.type=='MESH' and len(o.data.vertices)>20 for o in c.objects) for c in collections))
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Environments/GrandRomanArenaCurrent.blend'))
check('Grand arena retains scale and passage metadata',bpy.context.scene.get('arena_scale')==2.5 and bpy.context.scene.get('beast_pens')==1 and bpy.context.scene.get('warrior_entrances')==1)
images=[i for i in bpy.data.images if i.source=='FILE' and i.type!='RENDER_RESULT'];check('All architecture textures packed into blend',all(i.packed_file for i in images),[i.name for i in images]);check('Editable architecture and spectators saved',len(bpy.data.objects)>350,len(bpy.data.objects))
out=ROOT/'demo/verification/creature-arena/blender-checks.json';out.write_text(json.dumps({'checks':checks},indent=2),encoding='utf8');print(json.dumps({'checks':len(checks),'failed':[c for c in checks if not c['ok']]}));assert all(c['ok'] for c in checks)
