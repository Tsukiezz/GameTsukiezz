"""Author reusable lunar cottages, chibi residents and suspension towers in Blender.
Export their real triangulated meshes to the current Three.js game.
"""
import bpy
import json
import math
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
scene = bpy.data.scenes.new('LunarVillageAndSuspensionDesign')
bpy.context.window.scene = scene
roles = {
    'plaster': '#d7ccb6', 'stone': '#87999a', 'timber': '#71584e',
    'roof': '#466e7b', 'roof_light': '#74949d', 'gold': '#c0a16b',
    'glass': '#b8d8d0', 'dark': '#263c4a', 'cream': '#eadac4',
    'suit': '#6c92a2', 'scarf': '#b28299', 'cheek': '#c99293',
    'steel': '#627984', 'cable': '#b5afa0', 'lamp': '#ecd19b',
}
materials = {}
for name, value in roles.items():
    rgb = tuple(int(value[i:i + 2], 16) / 255 for i in (1, 3, 5))
    mat = bpy.data.materials.new('LunarCraft_' + name)
    mat.diffuse_color = (*rgb, 1)
    materials[name] = mat

models = {}
current = None

def finish(obj, name, material):
    obj.name = current + '_' + name
    obj.data.materials.append(materials[material])
    obj['game_model'] = current
    obj['game_role'] = material
    models.setdefault(current, []).append(obj)
    return obj

def point(p):
    return (p[0], -p[2], p[1])

def box(name, p, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=point(p))
    obj = bpy.context.object
    obj.scale = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Soft crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(obj, name, mat)

def sphere(name, p, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=1, location=point(p))
    obj = bpy.context.object
    obj.scale = (scale[0], scale[2], scale[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat)

def beam(name, a, b, radius, mat):
    a, b = Vector(point(a)), Vector(point(b))
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=radius, depth=(b-a).length, location=(a+b)/2)
    obj = bpy.context.object
    obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    return finish(obj, name, mat)

def ring(name, p, radius, tube, mat):
    bpy.ops.mesh.primitive_torus_add(major_segments=24, minor_segments=6, location=point(p), major_radius=radius, minor_radius=tube)
    obj = bpy.context.object
    obj.rotation_euler.x = math.pi/2
    return finish(obj, name, mat)

current = 'cottage'
box('StoneSill', (0, .11, 0), (8, .22, 6), 'stone', .08)
box('BackWall', (0, 1.9, -2.88), (7.8, 3.6, .24), 'plaster', .06)
for side in (-1, 1):
    box('SideWall', (side*3.88, 1.9, 0), (.24, 3.6, 6), 'plaster', .05)
    box('EntryWall', (side*2.48, 1.9, 2.88), (2.86, 3.6, .24), 'plaster', .05)
    box('DoorFrame', (side*1.05, 1.4, 3.05), (.16, 2.8, .23), 'timber', .035)
    for z in (-2.85, 2.85):
        box('CornerFrame', (side*3.9, 1.9, z), (.18, 3.8, .2), 'timber', .03)
    box('FrontWindowGlass', (side*2.55, 2.2, 3.02), (1.1, 1.2, .07), 'glass', .16)
    ring('RoundWindowRim', (side*2.55, 2.2, 3.1), .65, .09, 'timber')
    box('WindowMullion', (side*2.55, 2.2, 3.18), (.065, 1.1, .08), 'gold')
    box('WindowSill', (side*2.55, 1.5, 3.2), (1.5, .16, .45), 'stone', .06)
box('DoorLintel', (0, 3.25, 2.95), (2.1, .9, .3), 'plaster', .05)
box('DoorArchBeam', (0, 2.85, 3.1), (2.3, .18, .3), 'timber', .04)
box('RoofCeiling', (0, 3.78, 0), (8.5, .22, 6.5), 'timber', .05)
# Layered, gently curved roof strips rather than a single primitive cone.
for side in (-1, 1):
    for i in range(7):
        x0, x1 = i*4.6/7, (i+1)*4.6/7
        y0, y1 = 6.1-2.0*(x0/4.6)**.78, 6.1-2.0*(x1/4.6)**.78
        vertices = [(side*x0, y0, -3.65), (side*x1, y1, -3.65), (side*x1, y1, 3.65), (side*x0, y0, 3.65)]
        mesh = bpy.data.meshes.new('CurvedRoofTile')
        mesh.from_pydata([point(p) for p in vertices], [], [(0,1,2,3)])
        obj = bpy.data.objects.new('RoofTile', mesh)
        scene.collection.objects.link(obj)
        finish(obj, 'RoofTile', 'roof_light' if i%3 == 0 else 'roof')
        for z in (-3.64, 3.64):
            beam('RoofEdge', (side*x0,y0+.02,z), (side*x1,y1+.02,z), .065, 'gold')
    beam('GableBrace', (0,5.85,3.04), (side*3.7,3.9,3.04), .08, 'timber')
beam('RoofRidge', (0,6.14,-3.75), (0,6.14,3.75), .12, 'gold')
ring('MoonGable', (0,4.72,3.1), .45, .1, 'gold')
box('Chimney', (-2.4,5.8,-1.6), (.65,2,.7), 'stone', .06)
box('ChimneyCap', (-2.4,6.85,-1.6), (.9,.18,.95), 'timber', .05)
box('BedFrame', (-2.1,.55,-1), (1.35,.6,2.25), 'timber', .06)
box('BedCover', (-2.1,.91,-.85), (1.3,.2,1.8), 'scarf', .07)
box('Pillow', (-2.1,1.04,-1.75), (1.05,.16,.4), 'cream', .06)
box('Table', (2,.85,-.7), (1.5,.16,1.4), 'timber', .06)
for x in (1.45,2.55):
    for z in (-1.2,-.2): box('TableLeg', (x,.46,z), (.12,.75,.12), 'timber')
box('Rug', (0,.23,0), (2.4,.025,3), 'scarf')
sphere('DoorLantern', (0,3.35,3.5), (.18,.3,.18), 'lamp')

for role in range(3):
    current = 'resident_' + str(role)
    sphere('SuitBody', (0,.69,0), (.33,.4,.24), 'suit')
    sphere('Head', (0,1.3,.025), (.39,.36,.34), 'cream')
    sphere('Hood', (0,1.4,-.1), (.43,.38,.3), 'suit')
    for side in (-1,1):
        sphere('Eye', (side*.14,1.34,.334), (.067,.086,.036), 'dark')
        sphere('EyeGlint', (side*.14-.018,1.37,.368), (.021,.026,.009), 'cream')
        sphere('Cheek', (side*.25,1.22,.319), (.064,.032,.018), 'cheek')
        sphere('Mitten', (side*.41,.66,.05), (.12,.16,.12), 'scarf')
        sphere('Boot', (side*.19,.13,.08), (.16,.14,.23), 'dark')
        beam('Arm', (side*.29,.9,0), (side*.41,.68,.05), .11, 'suit')
        beam('Leg', (side*.17,.5,0), (side*.19,.2,.04), .1, 'suit')
    ring('ScarfCollar', (0,1.02,0), .31, .075, 'scarf').rotation_euler.x = 0
    box('ScarfTail', (.26,.75,-.25), (.18,.4,.08), 'scarf', .03)
    sphere('MoonPin', (.17,1.65,.17), (.1,.1,.04), 'gold')
    if role == 0:
        beam('MasonPickHandle', (.47,.35,.13), (.47,1.1,.13), .035, 'timber')
        beam('MasonPickHead', (.24,1.04,.13), (.7,1.1,.13), .06, 'steel')
    elif role == 1:
        sphere('GardenWateringCan', (.5,.48,.2), (.2,.2,.16), 'roof_light')
        beam('WateringSpout', (.58,.54,.2), (.84,.7,.2), .045, 'gold')
    else:
        sphere('MerchantSatchel', (-.32,.58,-.14), (.18,.23,.13), 'timber')
        sphere('Crystal', (.46,.79,.15), (.1,.18,.1), 'glass')

current = 'suspension_tower'
for side in (-1,1):
    box('TowerFoot', (side*4.6,.4,0), (2.2,.8,3), 'stone', .16)
    box('TowerLeg', (side*4.6,8.5,0), (1.05,16.5,1.4), 'stone', .12)
    box('TowerInlay', (side*4.6,8.3,.74), (.3,14,.08), 'gold')
    box('TowerCrown', (side*4.6,17,0), (1.7,1,2), 'roof', .12)
    sphere('TowerLamp', (side*4.6,18,0), (.35,.55,.35), 'lamp')
box('TowerLintel', (0,16.4,0), (10.3,.9,1.4), 'roof', .15)
beam('TowerBraceL', (-4,13,0), (-1,16,0), .18, 'gold')
beam('TowerBraceR', (4,13,0), (1,16,0), .18, 'gold')
current = 'suspension_anchor'
box('AnchorFoot', (0,.35,0), (2,.7,3), 'stone', .15)
box('AnchorBlock', (0,1.25,0), (1.3,1.5,2.3), 'roof', .12)
beam('AnchorBolt', (0,1.9,-.7), (0,1.9,.7), .13, 'gold')

scene.view_layers[0].update()
export = {'source':'Blender authored lunar village and suspension components','models':{},'materials':roles}
for model, objects in models.items():
    pieces = []
    for obj in objects:
        obj.data.calc_loop_triangles()
        vertices=[]
        for v in obj.data.vertices:
            w = obj.matrix_world @ v.co
            vertices.append([round(w.x,5),round(w.z,5),round(-w.y,5)])
        pieces.append({'name':obj.name,'role':obj['game_role'],'vertices':vertices,'indices':[i for tri in obj.data.loop_triangles for i in tri.vertices]})
    export['models'][model] = pieces
path=ROOT/'demo/features/world/data/lunar-village-assets.js'
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text('const LUNAR_VILLAGE_ASSETS='+json.dumps(export,separators=(',',':'))+';\n',encoding='utf-8')
# Keep an orderly, editable studio view; exported models above remain local.
for index, (name, objects) in enumerate(models.items()):
    offset = {'cottage':0,'resident_0':12,'resident_1':18,'resident_2':24,'suspension_tower':38,'suspension_anchor':49}[name]
    display_scale = 3 if name.startswith('resident_') else 1
    for obj in objects:
        obj.location *= display_scale
        obj.scale *= display_scale
        obj.location.x += offset
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.shading.color_type = 'MATERIAL'
        area.spaces.active.region_3d.view_location = (20, 0, 6)
        area.spaces.active.region_3d.view_distance = 54
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Environments/LunarVillageAndSuspensionDesign.blend'))
print('LUNAR_MODELS_EXPORTED', {k:len(v) for k,v in export['models'].items()})
