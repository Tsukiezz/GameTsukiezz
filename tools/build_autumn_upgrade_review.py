"""Create a new Blender review from the exact tested river, rail and maze meshes."""
import argparse
import json
import runpy
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'demo/verification/autumn-upgrade/engineering.json'
output=ROOT/'Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend'
if output.exists():
    raise RuntimeError('Inspect existing YinYangPyramid13Floors.blend before replacing it.')
bpy.app.driver_namespace['railway_export_arguments']=argparse.Namespace(source=source,scene='YinYangPyramid13Floors',prefix='AdventureRail_',output=output)
runpy.run_path(str(ROOT/'tools/export_railway_engineering.py'),run_name='__main__')
scene=bpy.data.scenes['YinYangPyramid13Floors']
data=json.loads(source.read_text(encoding='utf8'))
collections={}
for i,part in enumerate(data['desertGeometry']+data['technologyGeometry']+data['wildlifeGeometry']):
    name=part['group'] or 'DesertDetails'
    if name not in collections:
        collection=bpy.data.collections.new('Labyrinth_'+name)
        scene.collection.children.link(collection)
        collections[name]=collection
    v=part['vertices'];vertices=[(v[n],-v[n+2],v[n+1]) for n in range(0,len(v),3)]
    faces=[part['indices'][n:n+3] for n in range(0,len(part['indices']),3)]
    mesh=bpy.data.meshes.new('LabyrinthMesh_'+str(i));mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(part['name'],mesh);collections[name].objects.link(obj)
    mat=bpy.data.materials.new('LabyrinthMaterial_'+str(i));mat.diffuse_color=(*part['color'],1);mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*part['color'],1);shader.inputs['Roughness'].default_value=1
    colors=part.get('colors')
    if colors:
        attribute=mesh.color_attributes.new(name='DesertColor',type='FLOAT_COLOR',domain='CORNER')
        for loop in mesh.loops:
            k=loop.vertex_index*3;attribute.data[loop.index].color=(*colors[k:k+3],1)
        node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='DesertColor';mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
        mat.diffuse_color=(*[sum(colors[k::3])/len(vertices) for k in range(3)],1)
    mesh.materials.append(mat)
scene['craft_recipe']='10 wood harvested from trees with E';scene['pyramid_levels']=13;scene['boat_cruise_speed']=12;scene['boat_sprint_speed']=18;scene['new_wildlife']='elephant, chicken, buffalo';scene['headquarters']='near royal castle (-225, 20)'
scene['location']='Retired space station, altar and observatory removed; river-safe technology headquarters and craftable boat'
bpy.context.window.scene=scene
from mathutils import Vector
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            view=area.spaces.active;view.clip_start=.5;view.clip_end=6000;view.shading.color_type='MATERIAL'
            view.region_3d.view_location=Vector((-540,-30,55));view.region_3d.view_rotation=Vector((-300,400,-250)).to_track_quat('-Z','Y');view.region_3d.view_distance=520
assert data['desertGeometry']
assert not any(obj.library for obj in scene.objects)
shoreMaterial=bpy.data.materials.new('GroundedShoreObsidian');shoreMaterial.diffuse_color=(.07,.08,.09,1)
for i,p in enumerate(data.get('mercuryShorePosts',[])):
    bpy.ops.mesh.primitive_cone_add(vertices=5,radius1=.55,radius2=0,depth=1.7,location=(p['x'],-p['z'],p['y']+.85))
    bpy.context.object.name='GroundedMercuryShorePost_'+str(i);bpy.context.object.data.materials.append(shoreMaterial)
for obj in scene.objects:
    if obj.name.startswith(('Pyramid_sandstone','Pyramid_gold')):obj.hide_set(True)
scene['cutaway_review']='Outer shell hidden in viewport for thirteen-level maze inspection'
image=bpy.data.images.load(str(ROOT/'demo/features/characters/ninja-yinyang/portrait-art-v2.png'));image.pack()
scene['ninja_portrait']='Packed image: portrait-art-v2.png'
bpy.ops.wm.save_as_mainfile(filepath=str(output))
report=dict(scene=scene.name,workspace=str(output),objects=len(scene.objects),desertParts=len(data['desertGeometry']),technologyParts=len(data['technologyGeometry']),wildlifeParts=len(data['wildlifeGeometry']),localObjects=True)
(ROOT/'demo/verification/autumn-upgrade/blender-review.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report))
