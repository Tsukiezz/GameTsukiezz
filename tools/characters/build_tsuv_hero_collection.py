"""Build the editable Tsuventure cast and bake bone-local game geometry in Blender."""
from collections import defaultdict
import json
from math import cos, pi, sin
from pathlib import Path
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
PALETTE = {
    'ink': '181B32', 'carbon': '28243C', 'violet': '5F4686', 'lavender': 'A884D3',
    'silver': 'D5DFEC', 'ivory': 'F1DEBB', 'gold': 'E5AE54', 'bronze': '865030',
    'clay': 'AD442E', 'rust': '622C2A', 'amber': 'FFAE4C', 'red': 'B72946',
    'burgundy': '631B35', 'fur': '8F4C39', 'skin': 'A15E48', 'peach': 'DB9875',
    'jade': '218676', 'darkjade': '144D50', 'mint': '79D8AB', 'teal': '148B9E',
    'aqua': '64E5F1', 'blue': '3159A7', 'abyss': '1C345B', 'pearl': 'F9C9D9',
    'emerald': '2BA954', 'leaf': '8DE775', 'wood': '583C3A', 'steel': '677C95',
    'lightsteel': 'A5BAD0', 'glass': '426D8B', 'sand': 'C7A16E'
}
METAL = {'gold', 'bronze', 'steel', 'lightsteel', 'silver'}
GLOW = {'aqua', 'amber', 'lavender', 'leaf'}
RIG = {
    'root': (None, (0, 0, 0)), 'body': ('root', (0, 1.07, 0)),
    'head': ('body', (0, 2.09, 0)), 'cape': ('body', (0, 1.99, -.30)),
    'tail': ('body', (0, 1.05, -.28)),
}
for side, sign in [('L', -1), ('R', 1)]:
    RIG.update({
        f'arm_{side}': ('body', (.58*sign, 1.83, 0)),
        f'forearm_{side}': (f'arm_{side}', (.76*sign, 1.43, .05)),
        f'hand_{side}': (f'forearm_{side}', (.84*sign, 1.14, .15)),
        f'leg_{side}': ('root', (.29*sign, 1.05, 0)),
        f'shin_{side}': (f'leg_{side}', (.32*sign, .58, 0)),
        f'foot_{side}': (f'shin_{side}', (.32*sign, .17, 0)),
        f'wing_{side}': ('body', (.24*sign, 1.74, -.41)),
    })

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
materials = {}
for key, color in PALETTE.items():
    mat = bpy.data.materials.new(key)
    mat.use_nodes = True
    rgb = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
    linear = tuple(c/12.92 if c < .04045 else ((c+.055)/1.055)**2.4 for c in rgb)
    mat.diffuse_color = (*linear, 1)
    shader = next((node for node in mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED'), None)
    if shader is None:
        shader = mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        output = next((node for node in mat.node_tree.nodes if node.type == 'OUTPUT_MATERIAL'), None)
        if output is None:
            output = mat.node_tree.nodes.new('ShaderNodeOutputMaterial')
        mat.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    shader.inputs['Base Color'].default_value = mat.diffuse_color
    shader.inputs['Roughness'].default_value = .34 if key in METAL else .55
    shader.inputs['Metallic'].default_value = .59 if key in METAL else .05
    if key in GLOW:
        shader.inputs['Emission Color'].default_value = mat.diffuse_color
        shader.inputs['Emission Strength'].default_value = .65
    materials[key] = mat

models = {}
offset = 0
collection = None
bone_objects = {}
model_name = ''


def xyz(point):
    x, y, z = point
    return Vector((x+offset, -z, y))


def begin(name, x, rig=True):
    global offset, collection, bone_objects, model_name
    offset, model_name = x, name
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    models[name] = []
    bone_objects = {}
    if rig:
        for bone, (parent, position) in RIG.items():
            node = bpy.data.objects.new(bone, None)
            collection.objects.link(node)
            node.empty_display_size = .08
            if parent:
                node.parent = bone_objects[parent]
                position = tuple(a-b for a, b in zip(position, RIG[parent][1]))
                node.location = (position[0], -position[2], position[1])
            else:
                node.location = xyz(position)
            bone_objects[bone] = node
        bpy.context.view_layer.update()


def record(obj, name, material, bone):
    obj.name = name
    obj.data.materials.append(materials[material])
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)
    parent = 'hand_R' if bone == 'weapon' else bone
    if parent in bone_objects:
        obj.parent = bone_objects[parent]
        obj.matrix_parent_inverse = obj.parent.matrix_world.inverted()
    models[model_name].append((obj, material, bone))
    return obj


def ell(name, center, scale, mat, bone='body', tilt=0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, location=xyz(center))
    obj = bpy.context.object
    obj.scale = (scale[0], scale[2], scale[1])
    obj.rotation_euler.y = tilt
    for face in obj.data.polygons:
        face.use_smooth = True
    return record(obj, name, mat, bone)


def block(name, center, size, mat, bone='body', bevel=.05, tilt=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz(center))
    obj = bpy.context.object
    obj.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler.y = tilt
    if bevel:
        modifier = obj.modifiers.new('Rounded edges', 'BEVEL')
        modifier.width, modifier.segments = bevel, 2
        modifier = obj.modifiers.new('Face-weighted normals', 'WEIGHTED_NORMAL')
        modifier.keep_sharp = True
    return record(obj, name, mat, bone)


def tube(name, points, radii, mat, bone='body', sides=8):
    vertices, faces = [], []
    for i, p in enumerate(points):
        direction = (xyz(points[min(i+1, len(points)-1)])-xyz(points[max(0, i-1)])).normalized()
        right = direction.cross(Vector((0, 1, 0)))
        if right.length < .01:
            right = direction.cross(Vector((1, 0, 0)))
        right.normalize()
        other = direction.cross(right)
        for k in range(sides):
            angle = k*2*pi/sides
            vertices.append(xyz(p) + radii[i]*(right*cos(angle)+other*sin(angle)))
    for i in range(len(points)-1):
        for k in range(sides):
            j = i*sides+k
            nxt = i*sides+(k+1)%sides
            faces.append((j, nxt, nxt+sides, j+sides))
    faces.extend((tuple(reversed(range(sides))), tuple(range(len(vertices)-sides, len(vertices)))))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    for face in mesh.polygons:
        face.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    return record(obj, name, mat, bone)


def plate(name, outline, mat, bone='body', thickness=.05):
    if sum(x*v-u*y for (x,y,_),(u,v,_) in zip(outline,outline[1:]+outline[:1])) < 0:
        outline = list(reversed(outline))
    points = [xyz((x, y, z+d)) for d in (-thickness/2, thickness/2) for x, y, z in outline]
    n = len(outline)
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces.extend((i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    obj = bpy.data.objects.new(name, mesh)
    bevel = obj.modifiers.new('Polished rim', 'BEVEL')
    bevel.width = min(.025, thickness*.32)
    bevel.segments = 2
    return record(obj, name, mat, bone)


def ring(name, x, y, z, rx, ry, width, mat, bone='body'):
    points = [(x+rx*cos(i*pi/12), y+ry*sin(i*pi/12), z) for i in range(25)]
    return tube(name, points, [width]*len(points), mat, bone)


def eyes(y, z, left, right, x=.225):
    for side, color in [(-1, left), (1, right)]:
        ell('Eye socket', (x*side, y, z), (.143, .137, .058), 'ink', 'head', side*.14)
        ell('Luminous iris', (x*side, y, z+.052), (.078, .092, .024), color, 'head')
        ell('Pupil', (x*side, y, z+.074), (.033, .065, .011), 'ink', 'head')
        ell('Catchlight', (x*side-.026, y+.037, z+.085), (.023, .027, .011), 'silver', 'head')


def clothes(fabric, boot, cuff, hand, broad=1, plated=False):
    ell('Torso', (0, 1.52, -.01), (.58*broad, .65, .365), fabric)
    ell('Pelvis', (0, 1.02, -.015), (.48, .24, .32), fabric)
    ell('Utility belt', (0, 1.19, 0), (.543*broad, .101, .376), cuff)
    block('Belt clasp', (0, 1.18, .379), (.26, .19, .076), cuff)
    for side, s in [('L', -1), ('R', 1)]:
        for name, point, size, material, joint in [
            ('Shoulder', (.61, 1.83, 0), (.255*broad, .22, .26), cuff, 'arm'),
            ('Sleeve', (.69, 1.63, .024), (.185*broad, .29, .185), fabric, 'arm'),
            ('Bracer', (.797, 1.31, .09), (.173*broad, .23, .173), cuff, 'forearm'),
            ('Glove', (.846, 1.15, .159), (.135, .158, .148), hand, 'hand'),
            ('Thigh', (.31, .83, -.012), (.23, .325, .231), fabric, 'leg'),
            ('Greave', (.325, .39, .02), (.175, .255, .181), boot, 'shin'),
            ('Foot', (.329, .133, .093), (.198, .132, .269), boot, 'foot'),
        ]:
            x, y, z = point
            ell(name, (s*x, y, z), size, material, f'{joint}_{side}')
        if plated:
            block('Knee guard', (.32*s, .53, .162), (.29, .22, .13), cuff, f'shin_{side}')
            block('Sole', (.33*s, .049, .091), (.36, .095, .48), 'ink', f'foot_{side}', .037)


def layered_cuirass(base, rim):
    for i in range(4):
        y = 1.78-.14*i
        for side in [-1, 1]:
            x = side*(.265-.014*i)
            block('Lamellar edging', (x, y, .306), (.50-.043*i, .146, .109), rim, bevel=.029, tilt=side*.13)
            block('Lamellar inset', (x, y+.01, .365), (.405-.035*i, .087, .036), base, bevel=.018, tilt=side*.13)
    ring('Medallion rim', 0, 1.64, .407, .111, .122, .025, rim)
    ell('Medallion gem', (0, 1.64, .418), (.09, .105, .04), 'aqua')


def cloak(mat, trim, long=False):
    length = .52 if long else 1.22
    outline = [(-.48, 1.99, -.31), (.48, 1.99, -.31), (.63, length+.11, -.63),
               (.32, length, -.70), (0, length+.07, -.73), (-.62, length, -.63)]
    plate('Tailored cloak', outline, mat, 'cape', .034)
    for i in [0, 1]:
        end = outline[-1 if i == 0 else 2]
        tube('Cloak piping', [outline[i], end], [.019, .018], trim, 'cape')


def horn(s, color='ivory'):
    tube('Swept horn', [(s*.37, 2.87, -.02), (s*.48, 3.09, -.07),
                       (s*.55, 3.27, -.15), (s*.49, 3.39, -.20)],
         [.124, .094, .052, .005], color, 'head')
    tube('Horn collar', [(s*.37, 2.88, -.023), (s*.40, 2.95, -.036)],
         [.130, .116], 'gold', 'head')


def grip(x=.84, y=1.14, z=.19):
    return x, y, z


def pole(mat, long=.84, fork=False):
    x, y, z = grip()
    tube('Staff shaft', [(x, y-.91, z), (x, y+long, z)], [.044, .044], mat, 'weapon')
    for h in [-.87, -.61, .21, long-.04]:
        tube('Staff band', [(x, y+h, z), (x, y+h+.1, z)], [.062, .062], 'gold', 'weapon')
    if fork:
        for s in [-1, 0, 1]:
            tube('Coral trident', [(x, y+long-.1, z), (x+s*.20, y+long+.14, z),
                                  (x+s*.24, y+long+.35-abs(s)*.055, z)],
                 [.054, .047, .006], 'gold', 'weapon')
        ell('Trident pearl', (x, y+long+.08, z+.03), (.081, .105, .058), 'aqua', 'weapon')


begin('space_moon_ninja', -6)
clothes('carbon', 'ink', 'silver', 'ink', plated=True)
layered_cuirass('violet', 'silver')
ell('Panda head', (0, 2.54, -.005), (.631, .555, .505), 'silver', 'head')
for side in [-1, 1]:
    ell('Rounded panda ear', (side*.47, 2.958, -.045), (.219, .232, .144), 'ink', 'head')
    ell('Ear lining', (side*.48, 2.974, .075), (.129, .143, .044), 'violet', 'head')
    ell('Panda eye marking', (side*.264, 2.57, .428), (.223, .183, .091), 'ink', 'head', side*.25)
eyes(2.58, .492, 'aqua', 'lavender', .246)
ell('Ninja mask', (0, 2.343, .298), (.532, .205, .254), 'carbon', 'head')
for y in [2.30, 2.38]:
    tube('Mask seam', [(-.35, y, .477), (0, y-.035, .551), (.35, y, .477)], [.012]*3, 'violet', 'head')
block('Moon headband plate', (0, 2.851, .429), (.71, .139, .092), 'violet', 'head')
tube('Crescent insignia', [(.035+.065*cos(i*pi/12+1), 2.85+.060*sin(i*pi/12+1), .49)
                          for i in range(17)], [.017]*17, 'aqua', 'head')
ell('Teal scarf collar', (0, 2.078, -.015), (.441, .12, .367), 'teal')
for i in [-1, 1]:
    plate('Split scarf tail', [(-.13+i*.10, 2.04, -.31), (.11+i*.12, 2.04, -.36),
                              (.48+i*.23, 1.33, -.64), (.29+i*.20, 1.43, -.61)], 'teal', 'cape', .032)
x, y, z = grip()
tube('Moon blade grip', [(x, y-.23, z), (x, y+.20, z)], [.06, .05], 'violet', 'weapon')
plate('Crescent blade', [(x-.12,y+.16,z),(x-.14,y+.63,z),(x+.09,y+1.03,z),
                         (x+.24,y+1.07,z),(x+.15,y+.79,z),(x+.05,y+.55,z),
                         (x+.09,y+.25,z)], 'silver', 'weapon')
tube('Crescent edge', [(x-.12,y+.17,z+.024),(x-.14,y+.62,z+.024),(x+.09,y+1.03,z+.024)],
     [.015,.021,.008], 'aqua','weapon')

begin('mars_robot', -3)
clothes('rust', 'clay', 'ivory', 'carbon', 1.1, True)
block('Pressure chest', (0, 1.61, .018), (1.10, .77, .73), 'clay', bevel=.165)
block('Ivory chest fascia', (0, 1.60, .37), (.90, .54, .135), 'ivory', bevel=.085)
ring('Reactor collar', 0, 1.60, .46, .181, .181, .041, 'steel')
ell('Amber reactor', (0, 1.60, .47), (.156,.156,.075), 'amber')
block('Excursion backpack', (0, 1.61, -.431), (.86,.76,.41), 'rust', bevel=.105)
for s, side in [(-1, 'L'), (1, 'R')]:
    block('Shoulder shell', (.61*s, 1.91, 0), (.46,.34,.49), 'clay', f'arm_{side}', .093)
    block('Ivory wrist shell', (.78*s, 1.32, .10), (.31,.29,.38), 'ivory', f'forearm_{side}', .058)
    block('Thruster vents', (.34*s, 1.59, -.658), (.13,.32,.06), 'amber')
    ell('Rotary ear hub', (.56*s, 2.55, -.015), (.11,.24,.24), 'steel', 'head')
block('Rounded exploration helmet', (0,2.58,0), (1.13,.99,.90), 'clay', 'head', .19)
block('Ivory face rim', (0,2.53,.401), (1.01,.66,.24), 'ivory', 'head', .126)
block('Black visor', (0,2.56,.514), (.81,.43,.105), 'ink', 'head', .087)
for s in [-1, 1]:
    block('Amber optic', (.20*s,2.56,.572), (.184,.148,.031), 'amber', 'head', .035)
    block('Optic highlight', (.20*s,2.589,.591), (.087,.031,.014), 'ivory', 'head', .009)
tube('Radio antenna', [(.40,2.96,-.095),(.49,3.21,-.12),(.49,3.33,-.16)], [.057,.034,.027], 'steel','head')
ell('Antenna beacon', (.49,3.34,-.16), (.070,.070,.070), 'amber','head')

begin('millennium_dragon', 0)
clothes('darkjade', 'jade', 'bronze', 'jade', 1.08, True)
layered_cuirass('bronze', 'gold')
ell('Dragon cranium', (0,2.57,0), (.56,.49,.46), 'jade','head')
ell('Dragon muzzle', (0,2.41,.38), (.418,.232,.353), 'jade','head')
ell('Ivory lower jaw', (0,2.30,.43), (.345,.125,.272), 'ivory','head')
eyes(2.62,.428,'amber','amber')
for s in [-1,1]:
    horn(s)
    ell('Dragon nostril', (.23*s,2.48,.689), (.068,.036,.026), 'darkjade','head')
    tube('Whisker', [(.32*s,2.43,.54),(.53*s,2.36,.64),(.68*s,2.47,.63),
                     (.73*s,2.58,.54)], [.034,.024,.017,.005], 'gold','head')
    tube('Ivory fang', [(.26*s,2.38,.61),(.27*s,2.26,.59)], [.049,.005], 'ivory','head')
    bone = 'wing_L' if s == -1 else 'wing_R'
    a=(s*.24,1.74,-.41); b=(s*.88,2.48,-.51); c=(s*1.46,2.64,-.67)
    d=(s*1.18,1.94,-.61); e=(s*1.34,1.42,-.53); f=(s*.66,1.49,-.42)
    plate('Dragon wing membrane',[a,b,c,d,e,f], 'teal',bone,.033)
    for end in [c,d,e,f]:
        tube('Membrane ribs',[a,b,end],[.067,.045,.008],'darkjade',bone)
tube('Segmented dragon tail', [(0,1.05,-.28),(0,.73,-.66),(.17,.51,-1.0),(.46,.52,-1.25),
                              (.67,.69,-1.44)], [.20,.16,.12,.075,.014], 'jade','tail')
for i in range(4):
    tube('Dorsal spur', [(i*.12,.84-i*.047,-.61-i*.18),(i*.12,.99-i*.028,-.67-i*.18)],
         [.072,.004],'gold','tail')
ell('Buckler', (-.91,1.34,.268), (.29,.32,.082),'bronze','forearm_L')
ring('Buckler rim', -.91,1.34,.343,.273,.304,.026,'gold','forearm_L')
ell('Buckler boss',(-.91,1.34,.371),(.102,.119,.065),'mint','forearm_L')
x,y,z = grip()
tube('Dragon sword grip',[(x,y-.23,z),(x,y+.24,z)],[.051,.051],'bronze','weapon')
plate('Jade dragon blade',[(x-.10,y+.24,z),(x-.16,y+.97,z),(x,y+1.26,z),(x+.14,y+.97,z),
                           (x+.10,y+.24,z)],'mint','weapon')

begin('monkey_king', 3)
clothes('burgundy', 'rust', 'gold', 'fur', .97, True)
layered_cuirass('red', 'gold')
cloak('red','gold',True)
ell('Monkey head', (0,2.54,-.01), (.59,.51,.45),'fur','head')
ell('Warm face mask', (0,2.51,.335), (.466,.332,.176),'peach','head')
ell('Monkey muzzle', (0,2.35,.444), (.322,.146,.150),'peach','head')
eyes(2.59,.471,'amber','amber')
ell('Nose', (0,2.465,.585),(.090,.044,.033),'rust','head')
tube('Grin', [(-.165,2.345,.549),(0,2.316,.592),(.148,2.355,.555)], [.014]*3,'rust','head')
for s in [-1,1]:
    ell('Monkey ear', (s*.548,2.55,-.01),(.159,.215,.119),'fur','head')
    ell('Ear lining', (s*.60,2.55,.081),(.090,.143,.04),'peach','head')
    tube('Golden crown band', [(0,2.86,.405),(s*.25,2.89,.382),(s*.49,2.84,.23)],
         [.048,.044,.038],'gold','head')
    points=[(s*.27,2.90,-.01),(s*.32,3.19,-.09),(s*.53,3.49,-.17),(s*.80,3.59,-.20)]
    tube('Pheasant feather stem',points,[.042,.037,.025,.004],'gold','head')
    plate('Crimson pheasant feather',[points[0],(s*.21,3.20,-.10),(s*.34,3.44,-.14),points[3],
                                    (s*.61,3.36,-.17),points[1]],'red','head',.027)
ell('Crown ruby',(0,2.886,.465),(.10,.116,.043),'red','head')
tube('Curled monkey tail',[(0,1.08,-.24),(.11,.91,-.60),(.38,1.04,-.97),
                          (.57,1.34,-1.05),(.48,1.55,-1.11),(.28,1.48,-1.12)],
     [.119,.113,.100,.077,.057,.024],'fur','tail')
pole('red',1.04)

begin('ocean_queen', 6)
clothes('abyss','blue','pearl','skin',.93,True)
ell('Nacre bodice',(0,1.62,.103),(.515,.475,.300),'teal')
cloak('blue','pearl',True)
ell('Queen face',(0,2.53,.10),(.483,.501,.408),'skin','head')
ell('Ocean hair volume',(0,2.64,-.163),(.567,.576,.432),'abyss','head')
eyes(2.56,.477,'aqua','aqua',.193)
ell('Queen nose',(0,2.458,.513),(.078,.108,.073),'skin','head')
ell('Queen lips',(0,2.338,.487),(.105,.033,.025),'burgundy','head')
for s in [-1,1]:
    for i in range(4):
        tube('Sculpted ocean curl',[(s*(.04+.07*i),3.00-i*.04,.20-i*.081),
                                   (s*(.40+.034*i),2.93-i*.09,.248-i*.102),
                                   (s*(.54+.023*i),2.68-i*.089,.19-i*.094),
                                   (s*(.43+.037*i),2.36-i*.07,.10-i*.11),
                                   (s*(.50+.043*i),2.04-i*.06,-.09-i*.11)],
             [.145,.137,.127,.102,.022],['blue','teal','blue','abyss'][i],'head',10)
    ell('Pearl earring',(s*.436,2.367,.294),(.054,.091,.045),'pearl','head')
    tube('Coral tiara',[(0,2.843,.457),(s*.16,2.926,.445),(s*.33,2.87,.383),(s*.47,2.948,.281)],
         [.032,.041,.027,.009],'gold','head')
    for i in range(3):
        side='L' if s==-1 else 'R'
        ell('Nacre pauldron',(s*(.54+i*.085),1.95-i*.063,.028),(.16,.12,.24),'pearl',f'arm_{side}',s*.31)
    plate('Tailored skirt panel',[(0,1.15,.29),(s*.39,1.14,.20),(s*.53,.68,.13),
                                 (s*.27,.62,.34),(s*.12,.84,.39)],'teal','body',.036)
ell('Tiara pearl',(0,2.958,.451),(.085,.108,.045),'pearl','head')
ring('Pearl collar',0,1.91,.352,.16,.108,.026,'gold')
pole('bronze',.87,True)


def armor(style, x, main, rim, textile, gem):
    begin(style,x)
    brow=[(-.48,2.79,.37),(-.41,2.99,.34),(-.19,3.08,.39),(0,3.13,.42),
          (.19,3.08,.39),(.41,2.99,.34),(.48,2.79,.37),(.25,2.86,.50),
          (0,2.78,.54),(-.25,2.86,.50)]
    plate('Open-face helmet crest',brow,main,'head',.083)
    tube('Helmet edging',brow+[brow[0]],[.021]*(len(brow)+1),rim,'head')
    ell('Helmet seal',(0,2.96,.51),(.083,.081,.041),gem,'head')
    for s in [-1,1]:
        tube('Helmet temple guard',[(s*.46,2.95,.35),(s*.54,2.75,.29),(s*.49,2.56,.33)],
             [.067,.065,.028],main,'head')
        if style=='samurai':
            tube('Kabuto crescent',[(0,2.96,.57),(s*.22,3.03,.53),(s*.38,3.23,.44)],
                 [.046,.056,.008],rim,'head')
        if style=='rage':
            tube('Obsidian helmet horn',[(s*.31,2.99,.30),(s*.47,3.17,.25),(s*.47,3.29,.18)],
                 [.080,.065,.008],rim,'head')
    shape=[(-.55,1.86,.36),(-.30,1.99,.36),(.30,1.99,.36),(.55,1.86,.36),
           (.48,1.56,.40),(.32,1.35,.414),(0,1.25,.442),(-.32,1.35,.414),(-.48,1.56,.40)]
    plate('Forged breastplate',shape,main,thickness=.105)
    tube('Breastplate edge',shape+[shape[0]],[.024]*(len(shape)+1),rim)
    plate('Raised center crest',[(-.24,1.76,.461),(0,1.91,.47),(.24,1.76,.461),
                                (0,1.42,.48)],rim,thickness=.07)
    ell('Inset seal',(0,1.70,.522),(.119,.145,.04),gem)
    for s,side in [(-1,'L'),(1,'R')]:
        for i in range(3):
            ell('Articulated shoulder lame',(s*(.65+i*.072),2.02-i*.105,-.006),
                (.291-i*.028,.126,.30-i*.025),rim if i==0 else main,f'arm_{side}',s*.15)
        ell('Forged wrist cuff',(.807*s,1.30,.103),(.190,.199,.196),main,f'forearm_{side}')
        block('Wrist facing',(.812*s,1.29,.271),(.22,.251,.071),rim,f'forearm_{side}',.029)
        block('Greave facing',(.327*s,.371,.197),(.232,.389,.094),main,f'shin_{side}',.035)
        for i in range(2):
            block('Tasset',((.30+i*.032)*s,1.01-i*.129,.261),(.37,.142,.099),
                  main if i==0 else textile,f'leg_{side}',.032)
    if style=='samurai':
        for s in [-1,1]:
            tube('Kabuto-style crest',[(s*.30,1.93,.43),(s*.45,2.05,.40),(s*.50,2.17,.33)],
                 [.053,.041,.006],'gold')
            for i in range(3):
                tube('Silk lacing',[(s*(.09+.12*i),1.83,.517),(s*(.11+.12*i),1.62,.511)],
                     [.018,.016],'red')
    if style=='rage':
        for s,side in [(-1,'L'),(1,'R')]:
            for i in range(3):
                tube('Volcanic pauldron spike',[(s*(.56+i*.08),2.06-i*.035,-.12+i*.13),
                                               (s*(.68+i*.12),2.29-i*.061,-.13+i*.14)],
                     [.097,.007],'bronze',f'arm_{side}')
        tube('Molten fracture',[(-.33,1.80,.47),(-.16,1.67,.51),(-.09,1.70,.54),
                                (0,1.46,.48),(.20,1.64,.47)],[.021]*5,'amber')


armor('iron', -4.5, 'steel','lightsteel','ink','aqua')
armor('samurai', -1.5, 'red','gold','burgundy','amber')
armor('rage', 1.5, 'carbon','bronze','rust','amber')
begin('diving',4.5)
ell('Streamlined dive harness',(0,1.58,.045),(.626,.574,.436),'abyss')
block('Dive control display',(0,1.61,.455),(.398,.250,.10),'steel',bevel=.064)
block('Depth display',(0,1.64,.513),(.260,.122,.032),'aqua',bevel=.023)
for s,side in [(-1,'L'),(1,'R')]:
    ell('Oxygen cylinder',(.254*s,1.63,-.557),(.159,.546,.17),'gold')
    for h in [1.31,1.89]:
        ell('Tank retainer',(.254*s,h,-.557),(.169,.054,.179),'steel')
    tube('Pressure hose',[(.25*s,2.11,-.55),(.50*s,2.22,-.40),(.55*s,2.21,.07),
                         (.24*s,2.12,.368)],[.048,.042,.042,.036],'ink')
    ell('Neoprene cuff',(.807*s,1.30,.108),(.192,.211,.197),'teal',f'forearm_{side}')
    plate('Swimming fin',[(.33*s,.102,-.02),(.55*s,.061,.39),(.40*s,.071,.62),
                          (.19*s,.071,.59),(.15*s,.085,.33)],'blue',f'foot_{side}',.029)
ell('Mask face gasket',(0,2.57,.510),(.505,.262,.110),'ink','head')
ell('Aquamarine lens',(0,2.57,.576),(.461,.220,.084),'glass','head')
for s in [-1,1]:
    tube('Lens surround',[(s*.45,2.58,.603),(s*.37,2.73,.636),(0,2.76,.653),
                          (s*.37,2.42,.636),(s*.45,2.58,.603)],[.024]*5,'lightsteel','head')
ell('Oxygen regulator',(0,2.278,.560),(.188,.136,.106),'steel','head')
ell('Regulator indicator',(0,2.278,.666),(.082,.060,.030),'aqua','head')

begin('crystal_wings',0)
for s,side in [(-1,'L'),(1,'R')]:
    bone=f'wing_{side}'
    base=(s*.24,1.74,-.43)
    ell('Wing socket',base,(.138,.156,.105),'gold',bone)
    for i,(reach, rise) in enumerate([(1.78,.85),(1.92,.42),(1.82,.01),(1.56,-.42),(1.18,-.72)]):
        node=(s*(.63+.037*i),1.77+.080*(2-i),-.58-.019*i)
        tip=(s*reach,1.74+rise,-.69-.047*i)
        near=(s*(reach*.76),tip[1]-.105,tip[2]-.014)
        high=(s*(reach*.70),tip[1]+.071,tip[2]+.042)
        plate('Cut crystal feather',[node,high,tip,near],['aqua','blue','lavender','blue','aqua'][i],bone,.057)
        tube('Crystal silver ridge',[node,(s*(reach*.74),tip[1]-.021,tip[2]+.052),tip],
             [.027,.022,.006],'silver',bone)
        tube('Filigree frame',[base,node,high],[.060,.044,.008],'gold',bone)
    ell('Hinge gemstone',(s*.29,1.76,-.524),(.080,.103,.050),'aqua',bone)

begin('forest_sword',0,False)
tube('Rootwood grip',[(0,-.04,0),(0,.25,0),(0,.54,0)],[.078,.073,.083],'wood','root')
for i in range(6):
    ring('Bronze grip binding',0,.08+i*.061,0,.078,.025,.014,'bronze','root')
for s in [-1,1]:
    tube('Antler quillon',[(0,.54,0),(s*.23,.58,.01),(s*.35,.75,.01),
                          (s*.30,.86,0)],[.09,.079,.048,.007],'gold','root')
    tube('Quillon vine',[(s*.05,.58,.056),(s*.18,.52,.053),(s*.29,.64,.053),
                        (s*.38,.71,.01)],[.044,.037,.024,.005],'emerald','root')
ell('Emerald pommel',(0,-.052,0),(.11,.103,.097),'emerald','root')
plate('Tempered emerald leaf',[(0,.55,0),(-.20,.75,0),(-.19,1.05,0),(-.25,1.41,0),
                              (-.14,1.78,0),(.015,2.26,0),(.16,1.78,0),(.245,1.42,0),
                              (.19,1.07,0),(.18,.78,0)],'emerald','root',.10)
for z in [-.066,.066]:
    tube('Raised living fuller',[(0,.57,z),(0,1.13,z),(0,1.64,z),(.015,2.21,z)],
         [.054,.036,.022,.004],'mint','root')
    for y in [.90,1.19,1.48,1.71]:
        for s in [-1,1]:
            tube('Luminous leaf vein',[(0,y,z),(s*.096,y+.068,z),(s*.155,y+.14,z)],
                 [.013,.011,.004],'leaf','root')
ell('Forest heart gem',(0,.65,.102),(.110,.124,.065),'leaf','root')


def export():
    output = {}
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for name, parts in models.items():
        grouped = defaultdict(lambda: [[], [], [], {}])
        for obj, material, bone in parts:
            evaluated = obj.evaluated_get(depsgraph)
            mesh = evaluated.to_mesh()
            mesh.calc_loop_triangles()
            normal_matrix = evaluated.matrix_world.to_3x3().inverted().transposed()
            origin = Vector(RIG['hand_R' if bone=='weapon' else bone][1])
            shift = evaluated.matrix_world.translation
            # The empty root stores each preview placement outside the model coordinates.
            parent = obj
            while parent.parent:
                parent = parent.parent
            if parent.type == 'EMPTY':
                shift = parent.matrix_world.translation
            else:
                shift = Vector((0,0,0))
            vertices, normals, indices, cache = grouped[(bone,material)]
            corner_normals = mesh.corner_normals
            for tri in mesh.loop_triangles:
                for vertex, loop in zip(tri.vertices,tri.loops):
                    pos = evaluated.matrix_world @ mesh.vertices[vertex].co - shift
                    normal = (normal_matrix @ corner_normals[loop].vector).normalized()
                    p = (pos.x-origin.x,pos.z-origin.y,-pos.y-origin.z)
                    n = (normal.x,normal.z,-normal.y)
                    key = tuple(round(v,4) for v in (*p,*n))
                    index = cache.get(key)
                    if index is None:
                        index = len(vertices)//3
                        cache[key] = index
                        vertices.extend(key[:3])
                        normals.extend(key[3:])
                    indices.append(index)
            evaluated.to_mesh_clear()
        output[name] = [[bone,material,v,n,i] for (bone,material),(v,n,i,_) in grouped.items()]
    data = {'rig': RIG, 'colors': PALETTE, 'metal': sorted(METAL), 'glow': sorted(GLOW), 'models': output}
    target = ROOT/'demo/features/characters/hero-collection-data.js'
    target.write_text('// Generated with Blender by tools/characters/build_tsuv_hero_collection.py.\nconst HERO_COLLECTION = '+json.dumps(data,separators=(',', ':'))+';\n', encoding='utf-8')


def preview():
    scene = bpy.context.scene
    scene.world.color = (.20,.20,.20)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 20
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1560
    scene.render.resolution_y = 500
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'AgX'
    bpy.ops.object.camera_add(location=(.9,-15,5.6))
    camera = bpy.context.object
    camera.rotation_euler = (Vector((0,0,1.63))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 15.5
    scene.camera = camera
    for location, power, size, color in [
        ((-4,-7,8),1200,8,(1,.84,.67)),((6,-4,6),950,7,(.52,.79,1)),
        ((0,5,7),1500,8,(.42,.69,1))
    ]:
        bpy.ops.object.light_add(type='AREA',location=location)
        light = bpy.context.object
        light.rotation_euler = (Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
        light.data.energy,light.data.shape,light.data.size,light.data.color=power,'DISK',size,color
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.name='Preview floor'
    bpy.context.object.data.materials.append(materials['abyss'])
    for name in ('iron','samurai','rage','diving','crystal_wings','forest_sword'):
        bpy.data.collections[name].hide_render = True
        bpy.data.collections[name].hide_viewport = True
    destination=ROOT/'Assets/Art/Blender/Characters/TsuventureHeroCollection.blend'
    destination.parent.mkdir(parents=True,exist_ok=True)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(destination),compress=True)
    if '--render' in sys.argv:
        target=ROOT/'.runtime/hero-collection'
        target.mkdir(parents=True,exist_ok=True)
        scene.render.filepath=str(target/'cast.png')
        bpy.ops.render.render(write_still=True)
    if '--icons' in sys.argv:
        paths = {
            'iron':'iron_armor.png', 'samurai':'progression/samurai_armor.png',
            'rage':'rage_armor.png', 'diving':'diving_suit.png',
            'crystal_wings':'crystal_wings.png', 'forest_sword':'progression/forest_sword.png'
        }
        items = ROOT/'demo/features/inventory/assets'
        staged = ROOT/'.runtime/hero-collection/icons'
        staged.mkdir(parents=True,exist_ok=True)
        scene.render.resolution_x = scene.render.resolution_y = 320
        scene.render.film_transparent = True
        scene.cycles.samples = 16
        bpy.data.objects['Preview floor'].hide_render = True
        for name in models:
            bpy.data.collections[name].hide_render = True
        for name, filename in paths.items():
            source = bpy.data.collections[name]
            source.hide_render = source.hide_viewport = False
            bpy.context.view_layer.update()
            center_x = {'iron':-4.5,'samurai':-1.5,'rage':1.5,'diving':4.5}.get(name,0)
            center_y = {'crystal_wings':1.74,'forest_sword':1.10,'diving':1.41}.get(name,1.75)
            center = Vector((center_x,0,center_y))
            direction = (.75,5.2,1.15) if name=='crystal_wings' else (2.5,-5,1.0)
            camera.location = center+Vector(direction)
            camera.rotation_euler = (center-camera.location).to_track_quat('-Z','Y').to_euler()
            camera.data.ortho_scale = 4.65 if name=='crystal_wings' else 2.86 if name=='forest_sword' else 3.50
            image = staged/(name+'.png')
            scene.render.filepath = str(image)
            bpy.ops.render.render(write_still=True)
            image.replace(items/filename)
            source.hide_render = source.hide_viewport = True


export()
preview()
