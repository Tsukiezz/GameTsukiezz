"""Build the new desert monument in a separate Blender scene and export game meshes."""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
scene = bpy.data.scenes.new('DesertOfTheWiseSphinx')
bpy.context.window.scene = scene
palette = {'sandstone': '#c99855', 'limestone': '#efcf8d', 'gold': '#e9b842', 'blue': '#205e79', 'shadow': '#66432c', 'eye': '#58edd2'}
materials = {}
for name, color in palette.items():
    m = bpy.data.materials.new('Desert_' + name)
    rgb = tuple(int(color[i:i+2], 16)/255 for i in (1, 3, 5))
    m.diffuse_color = (*rgb, 1)
    materials[name] = m
parts = []
def part(name, kind, p, size, material='sandstone', owner='pyramid', solid=True):
    if kind == 'sphere':
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8)
    elif kind == 'cone':
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1, depth=2, rotation=(0,0,math.pi/4))
    else:
        bpy.ops.mesh.primitive_cube_add(size=2)
    obj = bpy.context.object
    obj.name = name
    obj['desert_owner'] = owner
    obj.location = (p[0], -p[2], p[1])
    obj.scale = (size[0]/2, size[2]/2, size[1]/2)
    obj.data.materials.append(materials[material])
    bpy.context.view_layer.update()
    obj.data.calc_loop_triangles()
    vertices = []
    for v in obj.data.vertices:
        q = obj.matrix_world @ v.co
        vertices.append([round(q.x,5), round(q.z,5), round(-q.y,5)])
    parts.append(dict(name=name, owner=owner, material=material, solid=solid,
                      vertices=vertices, indices=[i for t in obj.data.loop_triangles for i in t.vertices]))
    return obj

# 200 m base, 170 m tall; low southern courses have a real opening.
for level in range(34):
    half = 100 - level * 2.85
    y = level * 5 + 2.5
    for side in [-1, 1]:
        part(f'Course_{level}_side_{side}', 'box', [side*(half-2),y,0], [4,4.94,2*half])
    part(f'Course_{level}_north','box',[0,y,-half+2],[2*half-8,4.94,4])
    if level < 3:
        for side in [-1,1]:
            width=half-12
            part(f'EntranceCourse_{level}_{side}','box',[side*(12+width/2),y,half-2],[width,4.94,4])
    else:
        part(f'Course_{level}_south','box',[0,y,half-2],[2*half-8,4.94,4])
part('GoldenSummit','cone',[0,174,0],[12,12,12],'gold',solid=False)
# Walkable hall: the same walls are used for rendering, collision and camera clipping.
for side in [-1,1]:
    part(f'PassageWall_{side}','box',[side*9,5,62],[2,10,76],'limestone')
    part(f'ChamberWall_{side}','box',[side*25,6,0],[2,12,52],'limestone')
    part(f'ChamberDoor_{side}','box',[side*17,5,25],[14,10,2],'limestone')
part('ChamberBack','box',[0,6,-25],[48,12,2],'limestone')
part('PassageCeiling','box',[0,10.5,62],[20,1,76],'shadow')
part('ChamberCeiling','box',[0,12.5,0],[52,1,52],'shadow')
for z in [32,48,64,80,96]:
    for side in [-1,1]:
        part(f'PortalPillar_{z}_{side}','box',[side*7.5,4,z],[.7,8,1],'gold')
    part(f'PortalLintel_{z}','box',[0,8.5,z],[16,1,1],'gold')
part('TreasureSeal','box',[0,.1,-10],[18,.2,12],'blue',solid=False)
for x in [-17,17]:
    for z in [-17,17]:
        part(f'ChamberColumn_{x}_{z}','box',[x,6,z],[2,12,2],'limestone')

# Reposed lion body, royal human face, nemes and ceremonial beard.
part('LionBody','sphere',[0,13,0],[29,25,55],owner='sphinx')
for side in [-1,1]:
    part(f'Haunch_{side}','sphere',[side*11,10,-16],[16,20,22],owner='sphinx')
    part(f'Foreleg_{side}','box',[side*10,4,28],[11,8,32],owner='sphinx')
    part(f'Paw_{side}','sphere',[side*10,4,44],[13,8,13],owner='sphinx')
    for toe in [-1,0,1]:
        part(f'Toe_{side}_{toe}','sphere',[side*10+toe*3.2,3,48],[2.6,4,6],'limestone','sphinx')
part('RoyalChest','sphere',[0,19,18],[24,31,23],'limestone','sphinx')
part('NemesCrown','sphere',[0,37,19],[29,30,19],'blue','sphinx')
part('WiseHumanFace','sphere',[0,36,25],[16,22,12],'limestone','sphinx')
for side in [-1,1]:
    part(f'NemesWing_{side}','box',[side*11,29,23],[6,23,7],'blue','sphinx')
    for y in range(20,42,3):
        part(f'NemesGold_{side}_{y}','box',[side*11,y,26.6],[6.2,.7,.25],'gold','sphinx',False)
    part(f'Brow_{side}','box',[side*4,40,30],[6,1.2,1.8],'shadow','sphinx',False)
    part(f'Eye_{side}','sphere',[side*4,38.5,30.7],[3.5,1.6,1.2],'eye','sphinx',False)
part('Nose','box',[0,36,31],[2.8,5,3],'limestone','sphinx')
part('SereneMouth','box',[0,31.5,30.5],[7,.7,1],'shadow','sphinx',False)
part('CeremonialBeard','box',[0,26,29],[3,9,3],'gold','sphinx')
part('RoyalDiadem','box',[0,46,29],[17,2,2],'gold','sphinx')
part('Cobra','sphere',[0,49,29],[2.4,7,2.4],'gold','sphinx')

output = ROOT/'demo/features/desert/data/desert-assets.js'
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text('const DESERT_ASSETS='+json.dumps(dict(materials=palette,parts=parts),separators=(',',':'))+';\n',encoding='utf8')
scene['game_pyramid_center'] = [-690,100]
scene['sphinx_max_health'] = 12000
# Stage the Blender scene at its actual game coordinates; exported vertices above
# remain local to each model so the game can use its own collision transforms.
for obj in scene.objects:
    if obj.get('desert_owner'):
        x,y,z = (-750,2,260) if obj['desert_owner']=='sphinx' else (-690,2,100)
        obj.location += Vector((x,-z,y))
bpy.ops.mesh.primitive_plane_add(size=2,location=(-690,-110,1.98))
stage=bpy.context.object;stage.name='DesertPlanningGround';stage.scale=(190,290,1);stage.data.materials.append(materials['sandstone'])
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_location=Vector((-690,-100,75))
            area.spaces.active.region_3d.view_distance=430
            area.spaces.active.clip_end=6000
path = ROOT/'Assets/Art/Blender/Environments/DesertOfTheWiseSphinx.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(path),copy=True)
print('DESERT_EXPORT',len(parts),str(path))
