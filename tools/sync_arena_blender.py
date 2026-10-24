"""Import the exact browser arena parts into the connected Blender scene.

Run through Blender MCP after verify_arena.js writes .runtime/arena-scene.json.
Only this tool's collection is replaced; other user objects are preserved.
"""
from pathlib import Path
import base64
import json
import bpy

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'.runtime/arena-scene.json').read_text(encoding='utf-8'))
name = 'RomanArenaAndMoon'
old = bpy.data.collections.get(name)
if old:
    for obj in list(old.all_objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(old)
collection = bpy.data.collections.new(name)
bpy.context.scene.collection.children.link(collection)
groups = {}
for key in ['ArenaFloor','Cavea','Arcades','VIP','TicketCourtyard','MoonSafety']:
    child = bpy.data.collections.new('Arena_'+key)
    collection.children.link(child)
    groups[key] = child

texture_dir = ROOT/'Assets/Art/Textures/ArenaGenerated'
texture_dir.mkdir(parents=True,exist_ok=True)
materials = {}
root=bpy.data.objects.new('RomanArenaRoot',None);collection.objects.link(root)
root.location=(115,-110,0);bpy.context.view_layer.update()
root['arena_floor']=.35;root['podium_floor']=2.45;root['upper_floor']=12.35;root['vip_floor']=12.35
root['warrior_tunnels']=2;root['raised_by']=0.0;root['seating_rows']=18
for key, spec in data['materials'].items():
    mat = bpy.data.materials.new('RomanArena_'+key)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*spec['color'], 1)
    shader.inputs['Roughness'].default_value = spec['roughness']
    if spec.get('image'):
        path = texture_dir/(key+'.png')
        path.write_bytes(base64.b64decode(spec['image'].split(',',1)[1]))
        image = bpy.data.images.load(str(path),check_existing=True)
        node = mat.node_tree.nodes.new('ShaderNodeTexImage');node.image = image
        mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
        image.pack()
    materials[key] = mat

for index, part in enumerate(data['parts']):
    vertices = [tuple(part['positions'][i:i+3]) for i in range(0,len(part['positions']),3)]
    vertices = [(x,-z,y) for x,y,z in vertices]
    faces = [tuple(part['indices'][i:i+3]) for i in range(0,len(part['indices']),3)]
    mesh = bpy.data.meshes.new(part['name'])
    mesh.from_pydata(vertices,[],faces);mesh.update()
    if part.get('uv'):
        layer = mesh.uv_layers.new(name='UVMap')
        for loop in mesh.loops:
            i=loop.vertex_index*2;layer.data[loop.index].uv=part['uv'][i:i+2]
    obj = bpy.data.objects.new(part['name'],mesh)
    obj.data.materials.append(materials[part['material']])
    obj['arena_part_id'] = index
    obj['game_coordinate_system'] = 'Y up; Blender (x,-z,y)'
    groups[part['category']].objects.link(obj)
    if part['category']!='MoonSafety':
        obj.parent=root;obj.matrix_parent_inverse=root.matrix_world.inverted()
    if part['category']=='MoonSafety':
        obj['collision_top']=-12.;obj['collision_bottom']=-18.
        obj['collision_size']=560.;obj.hide_set(True)

path = ROOT/'Assets/Art/Blender/Environments/RomanArenaAndMoon.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(path))
print('ARENA_BLENDER_SYNC',len(data['parts']),'editable parts;',path)
