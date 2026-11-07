"""Reopen the saved source: material node names may be Vietnamese."""
from pathlib import Path
import bpy,json
root=Path(__file__).resolve().parents[1];checks=[]
def check(name,ok):checks.append({'name':name,'ok':bool(ok)})
collection=bpy.data.collections.get('TSU07_RuinedLunarExplorer');check('Editable asset collection exists',collection is not None)
check('Authored objects retained',len(collection.objects)>=144)
for name in ['ivory','teal','gold','burnt','lamp']:
 material=bpy.data.materials[name];outputs=[n for n in material.node_tree.nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output];bsdfs=[n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'];check('Correct active colored material: '+name,len(outputs)==1 and len(bsdfs)==1 and len(material.node_tree.links)==1)
check('Main shell and exposed ribs retained',any(o.name.startswith('Ivory pressure hull') for o in collection.objects) and sum(o.name.startswith('Broken longitudinal rib') for o in collection.objects)==9)
check('Three engine bells retained',sum(o.name.startswith('Flared engine bell') for o in collection.objects)==3)
check('Registration remains editable text',bpy.data.objects['TSU-07 registration'].type=='FONT')
check('Studio excluded from the exported collection',bpy.data.objects['Rocket presentation camera'].name not in collection.objects)
out=root/'.runtime/technology-rocket/blender-checks.json';out.write_text(json.dumps({'checks':checks},indent=2),encoding='utf8');print('REOPENED_ROCKET',len(checks),'checks, failures',sum(not c['ok'] for c in checks));assert all(c['ok'] for c in checks)
