"""Update affected geometry in the sole current review; caller must back up first."""
import base64
import json
import tempfile
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parents[1]
target=ROOT/'Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend'
assert Path(bpy.data.filepath).resolve()==target.resolve(), 'Open the current review file first'
source=ROOT/'demo/verification/realm-interiors/blender-design.json'
data=json.loads(source.read_text(encoding='utf-8'))
scene=bpy.data.scenes['YinYangPyramid13Floors'];bpy.context.window.scene=scene
# Replace only the affected pyramid geometry and previous revision collections.
for collection in list(bpy.data.collections):
    if collection.name in ('Labyrinth_GreatDesertPyramid','Labyrinth_DesertPart') or collection.name.startswith('RealmDesign_'):
        for obj in list(collection.objects):
            mesh=obj.data if obj.type=='MESH' else None
            bpy.data.objects.remove(obj,do_unlink=True)
            if mesh and mesh.users==0:bpy.data.meshes.remove(mesh)
        bpy.data.collections.remove(collection)
for material in list(bpy.data.materials):
    if material.name.startswith('RealmMaterial_') and material.users==0:bpy.data.materials.remove(material)
for image in list(bpy.data.images):
    if image.name.startswith('CurrentMasonry_') and image.users==0:bpy.data.images.remove(image)
collections={}
for category in ['Pyramid','Castle','Camps']:
    collection=bpy.data.collections.new('RealmDesign_'+category);scene.collection.children.link(collection);collections[category]=collection
images={}
for key,url in data['textures'].items():
    with tempfile.NamedTemporaryFile(suffix='.png',delete=False) as f:
        path=Path(f.name);f.write(base64.b64decode(url.split(',',1)[1]))
    image=bpy.data.images.load(str(path));image.name='CurrentMasonry_'+key;image.pack();images[key]=image;path.unlink()
mats={}
for key,spec in data['materials'].items():
    mat=bpy.data.materials.new('RealmMaterial_'+key);mat.diffuse_color=(*spec['color'],1);mat.use_nodes=True
    shader=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) or mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled');shader.name='Principled BSDF'
    output=next((n for n in mat.node_tree.nodes if n.type=='OUTPUT_MATERIAL'),None) or mat.node_tree.nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface'])
    shader.inputs['Base Color'].default_value=(*spec['color'],1);shader.inputs['Roughness'].default_value=spec['roughness']
    if spec['map']:
        node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=images[spec['map']];node.extension='REPEAT';mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
    if shader.inputs.get('Emission Color'):
        shader.inputs['Emission Color'].default_value=(*spec['emissive'],1);shader.inputs['Emission Strength'].default_value=spec['emissiveIntensity']
    mats[key]=mat
for index,part in enumerate(data['meshes']):
    v=part['vertices'];vertices=[(v[i],-v[i+2],v[i+1]) for i in range(0,len(v),3)];faces=[part['indices'][i:i+3] for i in range(0,len(part['indices']),3)]
    mesh=bpy.data.meshes.new('RealmMesh_'+str(index));mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(part['name'],mesh);collections[part['category']].objects.link(obj);mesh.materials.append(mats[part['material']])
    if part['uv']:
        layer=mesh.uv_layers.new(name='UVMap');uv=part['uv']
        for loop in mesh.loops:layer.data[loop.index].uv=(uv[loop.vertex_index*2],uv[loop.vertex_index*2+1])
    if part['colors']:
        colors=part['colors'];attr=mesh.color_attributes.new(name='RuntimeColor',type='FLOAT_COLOR',domain='CORNER')
        for loop in mesh.loops:attr.data[loop.index].color=(*colors[loop.vertex_index*3:loop.vertex_index*3+3],1)
        # Keep packed masonry textures; use vertex colours on untextured batches.
        if not data['materials'][part['material']]['map']:
            mat=mesh.materials[0].copy();mesh.materials[0]=mat;node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='RuntimeColor';mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    if part['category']=='Pyramid' and ('Pyramid_sandstone' in part['name'] or 'Pyramid_gold' in part['name']):obj.hide_set(True)
scene['interior_revision']='306 torches, masonry reliefs, burial coffers; castle seams and complete exhibit relocation'
scene['monster_camps']=json.dumps(data['camps']);scene['camp_respawn_minutes']=30;scene['castle_seams']=len(data['castleAudit']['sealed'])
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(target))
report={'file':str(target),'objects':len(scene.objects),'updatedMeshes':len(data['meshes']),'packedTextures':len(images),'torches':len(data['torches']),'camps':len(data['camps'])}
(source.parent/'blender-update.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
