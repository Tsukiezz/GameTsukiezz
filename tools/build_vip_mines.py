"""Build the VIP lounge, quarry portal and four mineral models in Blender."""
import json
import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Assets/Art/Blender/Environments/TsukiezzVIPAndMines.blend'
OUTPUT = ROOT / 'demo/features/world/data/vip-mines.js'
PREVIEWS = ROOT / '.runtime/vip-mines'
PREVIEWS.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
palette = {
    'walnut': '674230', 'cream': 'd6c3a1', 'midnight': '293747', 'velvet': '216461',
    'brass': 'd4a75d', 'plum': '643c50', 'glass': '70a4ab', 'lit': 'ffe1a0',
    'mint': '94ede2', 'leaf': '698c49', 'bread': 'd99549', 'crumb': 'ffe3a1',
    'tomato': 'c45b51', 'coffee': '634130', 'stone': '4e5c61', 'slate': '657475',
    'sand': '8e7c63', 'gold': 'e3aa42', 'goldPale': 'f5d681', 'goldDark': 'a46b37',
    'diamond': 'a6edec', 'diamondDeep': '459da9', 'diamondLight': 'defbfb',
    'violet': '9576ca', 'violetDark': '594c9e', 'violetLight': 'c9b7f6',
    'terrazzo': '707a82', 'copper': 'b46a53', 'nightBlue': '243552', 'frost': 'd6e2c9', 'frostDeep': '99b7a6', 'frostLight': 'f3f1da',
    'quarryShale': '353c41', 'quarrySlate': '485157', 'quarryRidge': '535b60',
    'quarryOchre': '5d5649', 'quarryMoss': '4c574e', 'quarryShadow': '2a3237', 'quarryLamp': 'ffb252',
}
materials = {}
for name, value in palette.items():
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*[int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)], 1)
    materials[name] = material

models = {}
solids = []
surfaces = []
floor = 29.2


def mesh(name, vertices, faces, keys):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(x + offset, -z, y) for x, y, z in vertices], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    for key in dict.fromkeys(keys):
        data.materials.append(materials[key])
    indices = {material.name: i for i, material in enumerate(data.materials)}
    for polygon, key in zip(data.polygons, keys):
        polygon.material_index = indices[key]
    return obj


def box(name, x, y, z, w, h, d, material, solid=False, walk=False):
    vertices = [(x+a*w/2, y+b*h/2, z+c*d/2) for b in (-1,1) for c in (-1,1) for a in (-1,1)]
    faces = [(0,2,3,1), (4,5,7,6), (0,1,5,4), (2,6,7,3), (0,4,6,2), (1,3,7,5)]
    mesh(name, vertices, faces, [material]*6)
    bounds = dict(name=name, minX=x-w/2, maxX=x+w/2, minY=y-h/2, maxY=y+h/2, minZ=z-d/2, maxZ=z+d/2)
    if solid:
        solids.append(bounds)
    if walk:
        surfaces.append(bounds)


def faceted(name, position, rings, keys, sides=6, angle=0, lean=(0,0)):
    x,y,z = position
    vertices = [(x+dx+radius*math.cos(angle+i*math.tau/sides), y+height,
                 z+dz+radius*math.sin(angle+i*math.tau/sides))
                for height,radius,dx,dz in [(a,b,lean[0]*a,lean[1]*a) for a,b in rings]
                for i in range(sides)]
    faces = [tuple(range(sides-1,-1,-1))]
    colors = [keys[0]]
    for j in range(len(rings)-1):
        for i in range(sides):
            a = j*sides+i
            b = j*sides+(i+1)%sides
            faces.extend([(a,a+sides,b+sides),(a,b+sides,b)])
            colors.extend([keys[(i+j)%len(keys)], keys[(i+j+1)%len(keys)]])
    faces.append(tuple(range((len(rings)-1)*sides,len(rings)*sides)))
    colors.append(keys[-1])
    mesh(name, vertices, faces, colors)


def ellipsoid(name, x,y,z, rx,ry,rz, material):
    vertices = [(x+rx*math.sin(math.pi*j/7)*math.cos(math.tau*i/12),
                 y+ry*math.cos(math.pi*j/7),z+rz*math.sin(math.pi*j/7)*math.sin(math.tau*i/12))
                for j in range(8) for i in range(12)]
    faces = [(j*12+i,j*12+(i+1)%12,(j+1)*12+(i+1)%12,(j+1)*12+i) for j in range(7) for i in range(12)]
    mesh(name,vertices,faces,[material]*len(faces))


def select_model(name, x=0):
    global collection, offset
    offset = x
    collection = bpy.data.collections.new(name)
    scene.collection.children.link(collection)
    models[name] = (collection, x)


select_model('vip')
xs = [-22,-21.1,-14.9,14.9,21.1,22]
zs = [-86,-77.1,-70.9,70.9,77.1,86]
for i,(x1,x2) in enumerate(zip(xs,xs[1:])):
    for j,(z1,z2) in enumerate(zip(zs,zs[1:])):
        if i in (1,3) and j in (1,3):
            continue
        box('VIP floor slab',(x1+x2)/2,floor-.38,(z1+z2)/2,x2-x1,.76,z2-z1,'terrazzo',True,True)
for x in (-21.85,21.85):
    box('Balcony guard',x,floor+.63,0,.18,1.26,172,'glass',True)
    box('Brass handrail',x,floor+1.3,0,.25,.12,172,'brass')
    box('Warm balcony ribbon',x,floor-.24,0,.21,.09,172,'lit')
    for z in range(-80,81,8):
        box('Balcony post',x,floor+.64,z,.22,1.28,.18,'midnight')
for z in (-85.9,85.9):
    box('End guard',0,floor+.63,z,44,1.26,.18,'glass',True)
    box('Brass handrail',0,floor+1.3,z,44,.12,.26,'brass')
for x in (-18,18):
    for z in (-74,74):
        for dx in (-3.22,3.22):
            box('Lift side guard',x+dx,floor+.6,z,.18,1.2,6.35,'glass',True)
        box('Lift rear guard',x,floor+.6,z-3.22,6.4,1.2,.18,'glass',True)
for z in (-60,-25,12,45,68):
    box('Recessed ceiling lantern',0,floor+6.5,z,12,.16,1.6,'brass')
    box('Diffuser panel',0,floor+6.36,z,11.5,.12,1.3,'lit')
    for x in (-4.5,4.5):
        box('Lantern suspension',x,floor+9.0,z,.07,5,.07,'brass')
for z in range(-60,68,8):
    for x in (-2.8,2.8):
        box('Brass floor inlay',x,floor+.016,z,.085,.03,6,'brass')

for x,z,accent in [(-15,-36,'velvet'),(15,-36,'plum'),(-15,11,'velvet')]:
    box('Decorated back wall',x,floor+2.15,z-3.85,9.6,4.3,.28,'walnut',True)
    box('Counter canopy',x,floor+3.94,z-.8,9.8,.23,6.1,'midnight')
    box('Warm counter soffit',x,floor+3.81,z+1.98,9.4,.04,.13,'lit')
    for dx in (-4.65,4.65):
        box('Counter pilaster',x+dx,floor+1.95,z-3.5,.32,3.9,.5,'brass',True)
        box('Decorative wall lattice',x+dx*.64,floor+2.92,z-3.61,2.6,.84,.19,accent)
    box('Service counter',x,floor+.73,z,7,1.46,3.1,accent,True)
    box('Cream counter top',x,floor+1.53,z,7.4,.2,3.35,'cream')
    box('Illuminated counter toe',x,floor+.14,z+1.57,6.6,.075,.065,'lit')
    for a in range(13):
        box('Fluted walnut counter',x-3+a*.5,floor+.77,z+1.59,.075,1.05,.12,'walnut')
    box('Shelving',x,floor+2.33,z-3,7,.18,1.1,'walnut')
    box('Shelf brass edge',x,floor+2.45,z-2.45,7,.04,.05,'brass')
    box('Till',x+2.4,floor+1.83,z+.42,.7,.38,.63,'midnight')
    box('Till display',x+2.4,floor+2.02,z+.76,.49,.2,.05,'mint')
    for j in range(5):
        faceted('Paper cup',(x-2.3+j*.58,floor+1.64,z-.45),[(0,.13),(.36,.18)],['cream','walnut'],10)
        faceted('Shelf canister',(x-2.5+j,floor+2.44,z-3),[(0,.2),(.55,.2),(.61,.17)],['coffee','brass'],9)

box('Coffee machine',-15,floor+2.06,-36.75,1.75,.87,.78,'midnight')
box('Espresso control strip',-15,floor+2.22,-36.3,1.44,.19,.09,'brass')
for x in (-16.25,-15.5,-14.75):
    faceted('Burger bun',(x+30,floor+1.63,-35.5),[(0,.23),(.08,.29),(.18,.29),(.3,.13)],['bread','crumb'],12)
for i in range(5):
    x=-17+i*.76
    ellipsoid('Vietnamese baguette crust',x,floor+1.8,11.55,.27,.17,.64,'bread')
    for j in range(3):
        box('Baguette scoring',x,floor+1.94,11.3+j*.22,.3,.034,.045,'crumb')
    box('Baguette greens',x,floor+1.79,11.12,.48,.035,.33,'leaf')
    box('Baguette filling',x,floor+1.77,11.12,.44,.035,.3,'tomato')

for x,z in [(-6,-46),(6,-46),(-7,-20),(7,-20),(-6,28),(6,28)]:
    faceted('Bistro table foot',(x,floor,z),[(0,.61),(.1,.52),(.98,.16),(1.05,.16)],['brass'],12)
    faceted('Bistro table',(x,floor+1.06,z),[(0,.96),(.16,.96)],['walnut','cream'],16)
    box('Table collision',x,floor+.65,z,1.85,1.3,1.85,'walnut',True)
    for dz in (-1.65,1.65):
        box('Velvet chair',x,floor+.47,z+dz,1.04,.28,.95,'velvet',True)
        box('Chair base',x,floor+.19,z+dz,.78,.38,.72,'midnight')
        box('Chair back',x,floor+.99,z+dz+math.copysign(.4,dz),1,.9,.17,'velvet',True)

for index,z in enumerate((8,15,22,29)):
    claw=index>=2
    accent='plum' if claw else 'velvet'
    box('Arcade cabinet base',15,floor+.65,z,3.2,1.3,3.1,accent,True)
    box('Arcade marquee',15,floor+3.44,z,3.24,.39,3.2,'brass')
    box('Marquee light',13.36,floor+3.45,z,.04,.18,2.93,'lit')
    box('Arcade mirrored back',16.54,floor+2.2,z,.12,2,3,'nightBlue',True)
    for xx in (13.47,16.53):
        for dz in (-1.48,1.48):
            box('Arcade frame column',xx,floor+2.27,z+dz,.15,2,.15,'brass',True)
    box('Arcade sill',13.46,floor+1.52,z,.12,.14,2.93,'mint')
    box('Arcade control panel',13.12,floor+1.13,z,.56,.22,2.87,'midnight',True)
    for dz in (-.45,.45):
        faceted('Arcade control',(13.03,floor+1.25,z+dz),[(0,.11),(.085,.11)],['tomato' if claw else 'mint'],9)
    if claw:
        box('Prize conveyor',14.94,floor+1.33,z,2.91,.08,2.87,'coffee')
        box('Claw shuttle rail',15,floor+3.13,z,2.9,.11,.15,'copper')
        box('Claw shuttle',15,floor+2.99,z,.34,.31,.37,'midnight')
        for dx in (-.19,.19):
            box('Claw jaw',15+dx,floor+2.71,z,.14,.28,.15,'brass')
    else:
        box('Coin pusher tray',15,floor+1.49,z,2.98,.12,2.82,'copper')
        for row in range(7):
            for col in range(7):
                faceted('Brass prize coin',(13.76+row*.4,floor+1.56,z-1.14+col*.37),[(0,.14),(.045,.14)],['gold','brass'],9)
for x in (-13,-8,8,13):
    for z in (47,57):
        box('Massage zone brass plinth',x,floor+.045,z,2.66,.08,3.05,'brass')
        box('Massage chair base',x,floor+.25,z,2.05,.5,2.2,'midnight',True)
        box('Massage privacy panel',x,floor+1.4,z-1.2,2.44,2.8,.18,'walnut',True)
        box('Massage amber light',x,floor+2.75,z-1.05,2.27,.10,.09,'lit')
        box('Recliner seat',x,floor+.65,z,1.6,.37,1.85,'velvet',True)
        box('Recliner back',x,floor+1.48,z-.7,1.56,1.48,.43,'velvet',True)
        box('Headrest',x,floor+2.19,z-.52,1.1,.39,.35,'cream')
        for dx in (-.92,.92):
            box('Recliner arm',x+dx,floor+.95,z,.24,.37,1.73,'walnut',True)
        box('Recliner status',x+.91,floor+1.155,z+.49,.13,.04,.28,'mint')
for x in (-19,19):
    for z in (-58,-5,37,65):
        faceted('Planter',(x,floor,z),[(0,.58),(1.05,.78)],['midnight','brass'],10)
        for i in range(6):
            angle=i*math.tau/6
            ellipsoid('Plant leaf',x+math.cos(angle)*.4,floor+1.28+(i%3)*.27,z+math.sin(angle)*.39,.25,.45,.2,'leaf')

for i,kind in enumerate(('goldOre','diamond','krystal','mothball')):
    select_model(kind,100+i*5)
    faceted('Fractured host rock',(0,-.09,0),[(0,1.07),(.25,1.12),(.56,.78),(.65,.45)],['stone','slate','sand'],7,.31)
    if kind == 'goldOre':
        for j,(x,z,scale) in enumerate([(-.51,.32,.44),(.18,.12,.57),(.6,-.15,.35),(-.2,-.5,.34),(.39,.58,.2)]):
            faceted('Gold nugget',(x,.29,z),[(0,scale*.56),(.22,scale),(.45,scale*.78),(.54,scale*.35)],['goldDark','gold','goldPale'],5,j*.37,(.12,-.15))
    elif kind == 'diamond':
        for j,(x,z,r,h) in enumerate([(0,0,.43,1.37),(-.47,.21,.28,.92),(.49,-.26,.23,.82)]):
            faceted('Diamond brilliant',(x,.31,z),[(0,r*.3),(h*.43,r),(h*.68,r*.84),(h,r*.36)],['diamondDeep','diamond','diamondLight'],6,j*.45,(.17*(-1)**j,-.06))
    elif kind == 'krystal':
        for j,(x,z,r,h) in enumerate([(-.34,.24,.25,1.31),(.25,.09,.34,1.84),(.58,-.25,.22,1.16),(-.45,-.37,.2,1.02)]):
            faceted('Violet crystal',(x,.31,z),[(0,r*.9),(h*.73,r),(h*.86,r*.76),(h,.025)],['violetDark','violet','violetLight'],6,j*.5,((x+.12)*.5,z*.6))
    else:
        for j,(x,z,r) in enumerate([(-.55,.28,.3),(-.12,-.2,.43),(.48,.34,.31),(.47,-.34,.25),(-.1,.55,.24)]):
            faceted('Pale frost rosette',(x,.39,z),[(0,r*.7),(.23,r),(.43,r*.81),(.51,r*.39)],['frostDeep','frost','frostLight'],8,j*.23,(.18,-.1))

select_model('quarryPortal',127)
noise = random.Random(817)
rock_tones = ['quarryShale','quarryShale','quarrySlate','quarrySlate','quarryRidge','quarryOchre','quarryMoss']
profile = [(-1,0),(-.96,.22),(-.88,.41),(-.71,.65),(-.54,.86),(-.27,.96),
           (0,1),(.22,.89),(.42,.91),(.62,.69),(.82,.45),(.94,.21),(1,0)]
sections = [(.14,6.2,6.1,-.1),(-2.35,7.3,7.0,-.38),(-5.6,7.9,7.6,.46),
            (-9.1,8.25,8.45,.82),(-13,7.85,7.45,.31),(-17.2,7.3,6.15,-.4),
            (-21.2,5.5,4.1,-.72),(-24.5,3.8,2.25,-.26),(-27,1.25,-.35,.1)]
entrance = [(-2.15,-1.45),(-2.12,.5),(-2.09,1.15),(-1.96,2.55),(-1.46,3.46),
            (-.86,4.09),(0,4.62),(.9,4.1),(1.51,3.48),(1.96,2.54),(2.1,1.16),
            (2.13,.5),(2.16,-1.45)]
ring_size = len(profile)
rings = []
for j, (z, width, height, shift) in enumerate(sections):
    ring = []
    for i, (x, level) in enumerate(profile):
        edge = i in (0, ring_size-1)
        xx = x*width+shift+(0 if edge else noise.uniform(-.31,.31))
        yy = -1.45 if edge else height*level+noise.uniform(-.44,.44)
        zz = z+noise.uniform(-.42,.42)
        ring.append((xx,yy,zz))
    rings.append(ring)
vertices = [v for ring in rings for v in ring]
faces = []
colors = []
for j in range(len(rings)-1):
    for i in range(ring_size-1):
        a=j*ring_size+i
        faces.extend([(a,a+1,a+ring_size),(a+1,a+ring_size+1,a+ring_size)])
        colors.extend(noise.choices(rock_tones,k=2))
rim = len(vertices)
vertices.extend((x,y,.19+noise.uniform(-.12,.22)) for x,y in entrance)
for i in range(ring_size-1):
    faces.extend([(i,rim+i,rim+i+1),(i,rim+i+1,i+1)])
    colors.extend(noise.choices(rock_tones,k=2))
mesh('Continuous cliff canopy with carved opening',vertices,faces,colors)

select_model('quarryDetails',127)
vertices = [(x,y,.44) for x,y in entrance]
vertices.extend((x*1.25,y*1.12+.14,.57+noise.uniform(-.15,.17)) for x,y in entrance)
faces = [(i,i+1,i+1+ring_size,i+ring_size) for i in range(ring_size-1)]
mesh('Layered exposed edge of the rock',vertices,faces,['quarryShadow','quarrySlate','quarryShale']*4)
for x,y,z,r,h,angle in [(-4.58,-.72,1.14,1.5,2.05,.3),(4.73,-.67,.84,1.48,2.5,-.36),
                        (-6.38,-.64,-.78,1.1,1.34,.7),(5.77,-.54,-1.35,1.32,2.85,-.22),
                        (-3.51,-.35,1.91,.58,.75,.4),(3.48,-.34,1.77,.6,.89,1.1)]:
    faceted('Fractured buttress slab',(x,y,z),[(0,r*.85),(h*.42,r),(h*.83,r*.72),(h,r*.42)],
            ['quarryShale','quarrySlate','quarryRidge','quarryOchre'],7,angle,(x*.035,-.11))
for side in (-1,1):
    x=side*2.51
    box('Lantern bracket',x,2.3,.63,.49,.1,.55,'walnut')
    box('Amber lantern core',x,2.02,.83,.27,.48,.25,'quarryLamp')
    box('Lantern top',x,2.31,.83,.42,.13,.41,'brass')
    box('Lantern base',x,1.75,.83,.36,.13,.36,'brass')
    for dx in (-.18,.18):
        for dz in (-.16,.16):
            box('Lantern cage rail',x+dx,2.02,.83+dz,.049,.51,.049,'walnut')
box('Dark wood quarry plaque mounting',0,4.89,.68,3.4,.78,.27,'walnut')

bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get()
exports={}
for name,(objects,origin) in models.items():
    bins={}
    for obj in objects.objects:
        evaluated=obj.evaluated_get(deps)
        data=evaluated.to_mesh()
        data.calc_loop_triangles()
        for triangle in data.loop_triangles:
            color=data.materials[triangle.material_index].diffuse_color[:3]
            glow=data.materials[triangle.material_index].name in ('mint','lit','quarryLamp')
            out=bins.setdefault(glow,dict(glow=glow,positions=[],normals=[],colors=[]))
            for loop in triangle.loops:
                v=data.vertices[data.loops[loop].vertex_index].co
                n=data.corner_normals[loop].vector
                out['positions'].extend(round(float(a),4) for a in (v.x-origin,v.z,-v.y))
                out['normals'].extend(round(float(a),4) for a in (n.x,n.z,-n.y))
                out['colors'].extend(round(float(a),4) for a in color)
        evaluated.to_mesh_clear()
    exports[name]=list(bins.values())
data=dict(source=str(SOURCE.relative_to(ROOT)).replace('\\','/'),floor=floor,models=exports,solids=solids,surfaces=surfaces)
OUTPUT.write_text('window.VIP_MINE_ART='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')

def camera_at(location,target,scale):
    camera.location=location
    camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=scale

bpy.ops.object.camera_add()
camera=bpy.context.object
camera.data.type='ORTHO'
scene.camera=camera
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.color_type='MATERIAL'
scene.display.shading.show_cavity=True
scene.display.shading.show_shadows=True
scene.render.resolution_x=1440
scene.render.resolution_y=920
scene.render.resolution_percentage=100
camera_at((91,129,119),(0,0,29),194)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
scene.render.filepath=str(PREVIEWS/'vip-blender.png')
bpy.ops.render.render(write_still=True)
camera_at((107.5,-22,12),(107.5,0,.5),21)
scene.render.filepath=str(PREVIEWS/'ores-blender.png')
bpy.ops.render.render(write_still=True)
camera_at((143,-17,12),(127,7,2.3),37)
scene.render.filepath=str(PREVIEWS/'quarry-blender.png')
bpy.ops.render.render(write_still=True)
print('VIP_MINE_ART_READY', {k:sum(len(p['positions'])//9 for p in v) for k,v in exports.items()},flush=True)
