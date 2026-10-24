"""Run with Blender --background --python tools/build_castle_extension.py.

Author the secret cellar and gate in Blender, then export the exact same box
dimensions to the lightweight browser scene. Coordinates are castle-local Y-up.
"""
from pathlib import Path
import json
import bpy

ROOT = Path(__file__).resolve().parents[1]
# This builder owns its generated scene. Include hidden collision volumes and
# old empty collections so repeated exports do not accumulate hidden copies.
bpy.data.batch_remove(tuple(bpy.data.objects))
for collection in list(bpy.data.collections):
    bpy.data.collections.remove(collection)
parts = []
palette = {'stone': (0.13, 0.19, 0.27), 'gold': (0.65, 0.48, 0.16),
           'glow': (0.05, 0.85, 0.75), 'wood': (0.15, 0.08, 0.04),
           'steel': (0.48, 0.58, 0.70), 'red': (0.35, 0.025, 0.045),
           'dark': (0.025, 0.035, 0.055)}
materials = {}
for key, color in palette.items():
    mat = bpy.data.materials.new('Castle_' + key)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = 0.8
    materials[key] = mat

def box(name, x, y, z, w, h, d, material='stone', surface=False, solid=True):
    # Direct mesh creation avoids thousands of context/selection operations
    # when rebuilding a furnished castle in background Blender.
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([(sx*w/2,sy*d/2,sz*h/2) for sx,sy,sz in
        [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]],[],
        [(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)])
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location=(x,-z,y)
    bpy.context.view_layer.objects.active=obj
    obj.data.materials.append(materials[material])
    parts.append(dict(name=name, position=[x,y,z], size=[w,h,d],
                      material=material, surface=surface, solid=solid,blenderObject=obj.name))

def sculpt(name,x,y,z,w,h,d,material='steel',kind='sphere'):
    if kind=='cone':
        bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=1,radius2=0,depth=2,location=(x,-z,y))
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=(x,-z,y))
    obj=bpy.context.object
    obj.name=name
    obj.dimensions=(w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.data.materials.append(materials[material])
    obj.data.calc_loop_triangles()
    parts.append(dict(name=name,position=[x,y,z],size=[w,h,d],material=material,
                      surface=False,solid=False,
                      blenderObject=obj.name,vertices=[[v.co.x,v.co.z,-v.co.y] for v in obj.data.vertices],
                      indices=[i for t in obj.data.loop_triangles for i in t.vertices]))

def knight(x,z,base=1):
    box('armory-plinth',x,base+.12,z,1.25,.24,1.1,'stone')
    box('armory-plinth-trim',x,base+.25,z,1.3,.05,1.15,'gold',solid=False)
    # One collision footprint for the whole exhibit, not one snag per detail.
    box('armory-display-volume',x,base+1.2,z,.95,2.4,.75,'dark',solid=False)
    parts[-1]['collisionOnly']=True
    parts[-1]['solid']=True
    bpy.context.object.hide_render=True
    bpy.context.object.hide_set(True)
    for side in [-1,1]:
        box('armor-boot',x+side*.2,base+.4,z-.08,.25,.22,.46,'steel',solid=False)
        sculpt('armor-greave',x+side*.2,base+.77,z,.23,.6,.26)
        sculpt('armor-kneecap',x+side*.2,base+1.05,z-.12,.28,.25,.15,'gold')
        sculpt('armor-pauldron',x+side*.48,base+1.65,z,.4,.33,.4)
        sculpt('armor-gauntlet',x+side*.51,base+1.22,z-.04,.2,.46,.23)
    sculpt('armor-breastplate',x,base+1.48,z,.78,.84,.46)
    box('armor-belt',x,base+1.11,z,.68,.1,.49,'gold',solid=False)
    sculpt('armor-helmet',x,base+2.08,z,.43,.48,.43)
    box('armor-visor',x,base+2.1,z-.222,.32,.055,.035,'dark',solid=False)
    box('armor-noseguard',x,base+2.02,z-.24,.045,.26,.04,'gold',solid=False)
    sculpt('armor-plume',x,base+2.43,z+.07,.18,.48,.24,'red')
    box('armor-tabard',x,base+1.36,z-.245,.35,.5,.025,'red',solid=False)
    box('armor-tabard-cross',x,base+1.39,z-.267,.23,.045,.025,'gold',solid=False)
    box('armor-tabard-cross',x,base+1.39,z-.267,.045,.3,.025,'gold',solid=False)

def dragon_sword_table(x,z,base=1):
    for dx in [-1.45,1.45]:
        for dz in [-.55,.55]:
            box('dragon-table-leg',x+dx,base+.45,z+dz,.18,.9,.18,'gold',solid=False)
    box('dragon-table-top',x,base+.95,z,3.5,.25,1.6,'wood')
    # Collision exactly covers the table; details remain visible but snag-free.
    box('dragon-table-base-volume',x,base+.45,z,3.5,.9,1.6,'dark',solid=False)
    parts[-1]['collisionOnly']=True
    parts[-1]['solid']=True
    bpy.context.object.hide_render=True
    bpy.context.object.hide_set(True)
    box('dragon-table-velvet',x,base+1.09,z,3.22,.035,1.35,'red',solid=False)
    box('dragon-sword-grip',x,base+1.4,z,.13,.6,.13,'dark',solid=False)
    for y in [1.2,1.35,1.5,1.65]:
        box('dragon-grip-ring',x,base+y,z,.17,.035,.17,'gold',solid=False)
    sculpt('dragon-pommel',x,base+1.12,z,.25,.25,.25,'glow')
    box('dragon-blade',x,base+2.5,z,.23,1.7,.09,'steel',solid=False)
    sculpt('dragon-blade-tip',x,base+3.53,z,.23,.4,.09,'steel','cone')
    box('dragon-blade-rune',x,base+2.55,z-.055,.04,1.45,.015,'glow',solid=False)
    for side in [-1,1]:
        # Layered wing silhouette and pointed scales form the dragon crossguard.
        sculpt('dragon-wing',x+side*.29,base+1.86,z,.62,.27,.24,'gold')
        for i in range(3):
            sculpt('dragon-wing-claw',x+side*(.22+i*.18),base+2.02+i*.06,z,
                   .12,.32,.12,'gold','cone')
    sculpt('dragon-head',x,base+1.86,z-.15,.3,.26,.32,'gold')
    for side in [-1,1]:
        sculpt('dragon-eye',x+side*.1,base+1.91,z-.302,.055,.055,.035,'glow')

# Museum-like armory zones against the walls, leaving the central circulation
# routes, cell entrances, secret hatch and staircase landings clear.
for x,z in [(14,-2),(14,5),(14,16),(-16,4),(-16,10),(-5.5,-18)]:
    knight(x,z)
dragon_sword_table(5,1)
for z in [10,16]:
    knight(-4.5,z,base=-5)
dragon_sword_table(-6,2,base=-5)
for x,z in [(16,-15),(-6,16)]:
    box('armory-cabinet',x,2,z,2,2,1,'wood')
    for y in [1.3,2,2.7]:
        box('armory-cabinet-shelf',x,y,z-.55,1.9,.1,.12,'gold',solid=False)
        for dx in [-.6,0,.6]:
            box('armory-book',x+dx,y+.2,z-.5,.2,.35,.18,'red',solid=False)
for x,z in [(12,-17),(12,19),(-7,-19)]:
    box('armory-chest',x,1.4,z,1.4,.8,.9,'wood')
    for dx in [-.5,.5]:
        box('armory-chest-band',x+dx,1.82,z,.1,.06,.95,'gold',solid=False)

# Fill the former atrium at the existing upper-floor height. Stair openings
# remain in the surrounding original floor plates, outside this rectangle.
# The reported narrow walkway is the 9.5m intermediate landing, not 13m.
# Expand that exact level to the walls, leaving only the headroom opening
# over the final steps of the central entrance stair.
box('landing-full-south',0,9.3,-8.95,38,.4,34.1,surface=True)
box('landing-full-north',0,9.3,16.45,38,.4,11.1,surface=True)
for side in [-1,1]:
    box('landing-full-side',side*11.35,9.3,9.5,15.3,.4,2.8,surface=True)
    box('landing-stair-guard',side*3.7,9.71,9.5,.12,.42,2.8,'gold')
box('landing-stair-end-guard',0,9.71,8.1,7.4,.42,.12,'gold')
box('mezzanine-infill', 0, 12.8, -1.75, 18, .4, 23.5, surface=True)
for side in [-1,1]:
    # Roof over the lower portion of each stair flight; only the final upper
    # steps need an opening for headroom. The rest becomes usable floor.
    box('mezzanine-stair-cover',side*13.1,12.8,13,5.2,.4,6,surface=True)
    for x in [side*10.5,side*15.7]:
        box('upper-stairwell-side-guard',x,13.21,17.35,.12,.42,2.7,'gold')
    box('upper-stairwell-end-guard',side*13.1,13.21,16,5.2,.42,.12,'gold')

# A genuine lower level: six metres below the existing shelter.
box('crypt-floor', -9, -5.25, 6, 12, .5, 24, surface=True)
box('crypt-west-wall', -15, -2, 6, .4, 6, 24)
box('crypt-east-wall', -3, -2, 6, .4, 6, 24)
box('crypt-south-wall', -9, -2, -6, 12, 6, .4)
box('crypt-north-wall', -9, -2, 18, 12, 6, .4)
for x in [-14.5, -3.5]:
    for z in [-4, 4, 12, 16]:
        box('crypt-pillar', x, -2, z, .45, 6, .6)
        box('crypt-rune', x + (.25 if x < -9 else -.25), -1.7, z,
            .04, .7, .3, 'glow', solid=False)
# 24 consistent 25cm steps; a full lower landing lies south of the first riser.
for i in range(24):
    top = -5 + (i+1)*.25
    box('crypt-tread-' + str(i), -12, top-.15, (i+.5)*14/24,
        3.6, .3, 14/24+.002, surface=True)
    for side in [-1,1]:
        box('crypt-rail-' + str(i), -12+side*1.92, top+.19, (i+.5)*14/24,
            .10, .38, 14/24+.002, 'gold')
box('crypt-reliquary', -6, -4.65, -2, 2, .7, 1.4, 'gold')
box('crypt-moonstone', -6, -4.05, -2, .55, .5, .55, 'glow', solid=False)
# Opaque paired doors. The panels overlap at the seam and the stone jambs,
# so a closed gate hides the interior even when viewed at an oblique angle.
for side in [-1, 1]:
    center = side*1.75
    box('gate-panel', center, 8.75, -26, 3.56, 5.5, .4, 'wood', solid=False)
    # Symmetric relief on both faces, kept shallow for the sliding wall pockets.
    for face in [-1,1]:
        z = -26 + face*.24
        for dx in [-1.55,1.55]:
            box('gate-border',center+dx,8.75,z,.13,5.28,.1,'gold',solid=False)
        for y in [6.17,8.75,11.33]:
            box('gate-border',center,y,z,3.2,.14,.1,'gold',solid=False)
        for y in [7.45,10.03]:
            box('gate-inset',center,y,z,2.7,2.08,.06,'stone',solid=False)
            box('gate-crest',center,y,z+face*.06,.75,1.03,.1,'gold',solid=False)
            box('gate-moonstone',center,y,z+face*.13,.22,.36,.08,'glow',solid=False)
        for dx in [-1.27,1.27]:
            for y in [6.5,8.4,9.1,11.0]:
                box('gate-stud',center+dx,y,z+face*.07,.08,.08,.08,'gold',solid=False)
        box('gate-handle',center-side*1.13,8.7,z+face*.14,.12,.5,.12,'gold',solid=False)

import runpy
furnishing_manifest = runpy.run_path(str(ROOT/'tools/castle_furnishings.py'),
                                   init_globals=globals())['furnishing_manifest']
runpy.run_path(str(ROOT/'tools/castle_safety.py'),init_globals=globals())
room_result = runpy.run_path(str(ROOT/'tools/castle_rooms.py'),init_globals=globals())
runpy.run_path(str(ROOT/'tools/castle_redesign.py'),init_globals=globals())
compact = runpy.run_path(str(ROOT/'tools/castle_compact.py'),init_globals=globals())
themed = runpy.run_path(str(ROOT/'tools/castle_themes.py'),init_globals=globals())
out = ROOT/'demo/data'
out.mkdir(exist_ok=True)
runpy.run_path(str(ROOT/'tools/castle_room_details.py'),init_globals={**globals(),'themes':themed['themes']})
runpy.run_path(str(ROOT/'tools/castle_furniture_scale.py'),init_globals={**globals(),'themes':themed['themes']})
runpy.run_path(str(ROOT/'tools/castle_gate_guards.py'),init_globals=globals())
payload = dict(version=6, source='Blender', parts=parts, furnishings=furnishing_manifest,
               rooms=room_result['rooms'],roomWalls=room_result['wall_count'],
               cellar=dict(minX=-15,maxX=-3,minZ=-6,maxZ=18,floor=-5),
               stairs=dict(x=-12,z0=0,z1=14,bottom=-5,top=1,count=24),
               compactStairs=compact['stair_plans'],doorClearances=room_result['door_clearances'],
               prison=compact['prison'],furnitureMoves=compact['furniture_moves'],
               hiddenStairs=compact['hidden_stairs'],themes=themed['themes'])
(out/'castle-extension.js').write_text('window.CASTLE_EXTENSION = '+json.dumps(payload)+';\n', encoding='utf-8')
# Change dependent asset URLs whenever rebuilding, so an already open browser
# cannot keep an earlier version of the geometry or the scene installer.
import hashlib
page = ROOT/'demo/index.html'
html = page.read_text(encoding='utf-8')
import re
for asset in ['features/castle/data/castle-extension.js', 'features/castle/castle-upgrade.js']:
    digest = hashlib.sha256((ROOT/'demo'/asset).read_bytes()).hexdigest()[:12]
    html = re.sub(r'src="'+re.escape(asset)+r'(?:\?[^"\s]*)?"',
                  'src="'+asset+'?v='+digest+'"',html)
page.write_text(html,encoding='utf-8')
blend = ROOT/'Assets/Art/Blender/Environments/CastleExtension.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
print('CASTLE_EXTENSION_EXPORTED', len(parts), str(blend))
