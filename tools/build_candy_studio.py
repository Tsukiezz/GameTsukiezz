"""Create an editable Blender snapshot of the verified current kingdom and station.
Run the browser verifier first; this never opens or overwrites the user's working scene.
"""
import json
import argparse
import sys
from pathlib import Path
import bpy

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--input', default='demo/verification/candy-kingdom/blender-design.json')
parser.add_argument('--output', default='Assets/Art/Blender/Environments/CandyKingdomCurrent.blend')
parser.add_argument('--scene', default='CandyKingdomCurrent')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
data = json.loads((root / args.input).read_text(encoding='utf-8'))
scene = bpy.data.scenes.new(args.scene)
bpy.context.window.scene = scene
material = bpy.data.materials.new('GameVertexColors')
material.use_nodes = True
bsdf = next((node for node in material.node_tree.nodes if node.type == 'BSDF_PRINCIPLED'), None)
if bsdf is None:
    bsdf = material.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
output_node = next((node for node in material.node_tree.nodes if node.type == 'OUTPUT_MATERIAL'), None)
if output_node is None:
    output_node = material.node_tree.nodes.new('ShaderNodeOutputMaterial')
material.node_tree.links.new(bsdf.outputs['BSDF'], output_node.inputs['Surface'])
vertex = material.node_tree.nodes.new('ShaderNodeVertexColor')
vertex.layer_name = 'GameColor'
material.node_tree.links.new(vertex.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = .7
count = 0
for item in data['meshes']:
    values = item['positions']
    vertices = [tuple(values[i:i + 3]) for i in range(0, len(values), 3)]
    indices = item['indices'] or list(range(len(vertices)))
    faces = [tuple(indices[i:i + 3]) for i in range(0, len(indices), 3)]
    mesh = bpy.data.meshes.new(item['name'])
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    colors = mesh.color_attributes.new(name='GameColor', type='FLOAT_COLOR', domain='POINT')
    rgba = []
    rgb = item['colors']
    for i in range(0, len(rgb), 3):
        rgba.extend((*rgb[i:i + 3], 1))
    colors.data.foreach_set('color', rgba)
    obj = bpy.data.objects.new(item['name'], mesh)
    obj.data.materials.append(material)
    scene.collection.objects.link(obj)
    count += 1
scene.world = bpy.data.worlds.new('CandyStudioWorld')
scene.world.color = (.15, .18, .22)
cx, cy, cz = data['center']
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_location = (cx, -cz, cy + 12)
        area.spaces.active.region_3d.view_distance = 280
        area.spaces.active.shading.type = 'MATERIAL'
for route in data.get('railways', []):
    curve = bpy.data.curves.new('WesternRailRouteGuide', type='CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = .3
    curve.bevel_resolution = 1
    spline = curve.splines.new('POLY')
    spline.points.add(len(route) - 1)
    for point, value in zip(spline.points, route):
        point.co = (*value, 1)
    scene.collection.objects.link(bpy.data.objects.new(curve.name, curve))
output = root / args.output
bpy.ops.wm.save_as_mainfile(filepath=str(output))
print('CANDY_STUDIO_SAVED', output, 'meshes', count)
