"""Refresh only current camp collection, with linked meshes for dense populations."""
import json
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1]
target=ROOT/'Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend'
assert Path(bpy.data.filepath).resolve()==target.resolve()
scene=bpy.data.scenes['YinYangPyramid13Floors'];bpy.context.window.scene=scene
import os
evidence=ROOT/os.environ.get('GAME_VERIFY_OUTPUT','demo/verification/moon-economy')
data=json.loads((evidence/'blender-camps.json').read_text(encoding='utf-8'))
collection=bpy.data.collections.get('RealmDesign_Camps')
if collection:
    for obj in list(collection.objects):
        mesh=obj.data if obj.type=='MESH' else None
        bpy.data.objects.remove(obj,do_unlink=True)
        if mesh and not mesh.users:bpy.data.meshes.remove(mesh)
else:
    collection=bpy.data.collections.new('RealmDesign_Camps');scene.collection.children.link(collection)
def build_mesh(name,parts):
    vertices=[];faces=[];materials=[];face_materials=[]
    for part in parts:
        offset=len(vertices);v=part['vertices'];vertices.extend((v[i],-v[i+2],v[i+1]) for i in range(0,len(v),3))
        newfaces=[tuple(offset+j for j in part['indices'][i:i+3]) for i in range(0,len(part['indices']),3)]
        faces.extend(newfaces);face_materials.extend([len(materials)]*len(newfaces))
        mat=bpy.data.materials.new(name+'_mat');mat.diffuse_color=(*part['color'],1);materials.append(mat)
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    for mat in materials:mesh.materials.append(mat)
    for poly,index in zip(mesh.polygons,face_materials):poly.material_index=index
    return mesh
templates={kind:build_mesh('CampSpecies_'+kind,parts) for kind,parts in data['templates'].items()}
for i,p in enumerate(data['placements']):
    obj=bpy.data.objects.new('CampMonster_'+p['kind']+'_'+str(i),templates[p['kind']]);x,y,z=p['position'];obj.location=(x,-z,y);collection.objects.link(obj)
for i,p in enumerate(data['decorations']):
    obj=bpy.data.objects.new('CampSite_'+str(i),build_mesh('CampSiteMesh_'+str(i),p['parts']));x,y,z=p['position'];obj.location=(x,-z,y);collection.objects.link(obj)
scene['monster_camp_count']=data['camps'];scene['camp_population']='10-15 enemies per camp';scene['camp_respawn_minutes']=30;scene['camp_rewards']=data['reward'];scene['rail_fare_gold_coins']=1;scene['food_pickup_spots']=data['foodSpots']
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(target))
report={'file':str(target),'objects':len(scene.objects),'camps':data['camps'],'enemies':len(data['placements']),'foodSpots':data['foodSpots']}
(evidence/'blender-camps-update.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
