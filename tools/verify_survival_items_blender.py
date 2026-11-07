from pathlib import Path
import bpy,json,math
R=Path(__file__).resolve().parents[1];source='Assets/Art/Blender/Inventory/SurvivalTreasuryStudio.blend';bpy.ops.wm.open_mainfile(filepath=str(R/source));bpy.context.view_layer.update()
text=(R/'demo/features/inventory/data/survival-items.js').read_text(encoding='utf8');data=json.JSONDecoder().raw_decode(text[text.index('{'):])[0];checks=[]
def check(name,ok):checks.append({'name':name,'ok':bool(ok)})
check('Saved Blender studio reopens with eighteen models',len(data['models'])==18 and all(bpy.data.objects.get(k) for k in data['models']))
for kind,model in data['models'].items():
 root=bpy.data.objects[kind];check('Editable geometry '+kind,len(root.children)>3)
 for part in model['parts']:
  check('Finite authored positions and normals '+kind+':'+part['material'],all(math.isfinite(v) for v in part['positions']+part['normals']) and len(part['normals'])==len(part['positions']) and len(part['indices'])%3==0)
 if kind.startswith('chest_'):check('Opening lid is separate '+kind,any(p['mount']=='lid' for p in model['parts']))
check('Samurai has head, body and both shoulder mounts',{p['mount'] for p in data['models']['samurai_armor']['parts']}=={'head','body','arm_L','arm_R'})
check('All game thumbnails exist',all((R/'demo/features/inventory/assets/progression'/ (k+'.png')).is_file() for k in data['models']))
out=R/'.runtime/progression-update/blender-report.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps({'checks':checks,'source':source,'triangles':sum(m['triangles'] for m in data['models'].values())},indent=2),encoding='utf8');print('BLENDER_CHECKS',len(checks),'FAILURES',sum(not c['ok'] for c in checks),flush=True);assert all(c['ok'] for c in checks)
