"""Export explicitly tagged primary railway studio objects into web model data."""
import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'demo/features/railway/data/railway-assets.js';s=p.read_text(encoding='utf-8');data=json.loads(s[s.index('{'):s.rindex('}')+1]);scene=bpy.data.scenes.get('RailwayInteriorStudio')
if not scene:raise RuntimeError('Prepare RailwayInteriorStudio first')
scene.view_layers[0].update();models={}
for obj in scene.objects:
 if obj.type!='MESH' or not obj.get('railway_export'):continue
 kind=obj['railway_kind'];origin=obj['railway_origin'];vertices=[]
 for v in obj.data.vertices:
  w=obj.matrix_world@v.co;vertices.append([round(w.x-origin[0],5),round(w.z-origin[1],5),round(-w.y-origin[2],5)])
 obj.data.calc_loop_triangles();models.setdefault(kind,[]).append({'name':obj['railway_part'],'material':obj['railway_material'],'vertices':vertices,'indices':[i for t in obj.data.loop_triangles for i in t.vertices]})
for kind in ['engine','coach','driver','station']:
 if not models.get(kind):raise RuntimeError('Missing editable kind: '+kind)
 data['models'][kind]=models[kind]
for key in data['materials']:
 mat=bpy.data.materials.get('StudioRail_'+key)
 if mat and mat.use_nodes:
  bsdf=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if bsdf:data['materials'][key]=list(bsdf.inputs['Base Color'].default_value)[:3]
output=Path(globals().get('EXPORT_DESTINATION',p))
output.write_text('const RAILWAY_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8');print('RAILWAY_STUDIO_EXPORTED',list(models))
