"""Editable Blender equipment source and lightweight browser mesh export."""
import bpy, json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
collection=bpy.data.collections.get('SolarFlashlight')
if collection:
    bpy.data.batch_remove(ids=list(collection.objects))
    bpy.data.collections.remove(collection)
collection=bpy.data.collections.new('SolarFlashlight');bpy.context.scene.collection.children.link(collection)
colors={'body':(.08,.13,.19),'gold':(.72,.43,.12),'panel':(.035,.12,.31),'lens':(.95,.87,.65)}
mats={}
for name,rgb in colors.items():
    m=bpy.data.materials.new('Solar_'+name);m.use_nodes=True
    node=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');node.inputs['Base Color'].default_value=(*rgb,1);node.inputs['Roughness'].default_value=.3
    mats[name]=m
def take(name,mat):
    o=bpy.context.object;o.name=name
    for c in list(o.users_collection):c.objects.unlink(o)
    collection.objects.link(o);o.data.materials.append(mats[mat]);return o
for name,radius,length,z,mat in [('Grip',.082,.42,0,'body'),('Reflector',.13,.11,-.25,'gold'),('Tail',.09,.05,.23,'gold'),('Lens',.108,.006,-.309,'lens')]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=radius,depth=length,location=(0,0,z));take(name,mat)
def box(name,loc,size,mat):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=take(name,mat);o.scale=size
box('SolarPanel',(0,.09,0),(.13,.025,.3),'panel')
for i in range(5):box('SolarCellDivider',(0,.104,-.12+i*.06),(.125,.002,.006),'gold')
for i in range(9):
    bpy.ops.mesh.primitive_torus_add(major_radius=.083,minor_radius=.006,major_segments=24,minor_segments=6,location=(0,0,-.16+i*.04));take('GripRib','body')
for z in [-.31,-.22,-.18,.19,.255]:
    bpy.ops.mesh.primitive_torus_add(major_radius=.112 if z<-.2 else .086,minor_radius=.008,major_segments=32,minor_segments=6,location=(0,0,z));take('MachinedRim','gold')
for i in range(8):
    a=i*math.tau/8
    box('CoolingFin',(math.cos(a)*.106,math.sin(a)*.106,-.244),(.024,.024,.083),'body')
box('SwitchHousing',(.09,.005,.12),(.035,.07,.09),'gold')
box('PowerSwitch',(.111,.005,.12),(.012,.04,.048),'panel')
box('BeltClip',(0,-.103,.055),(.055,.018,.26),'gold')
for x in [-.07,.07]:box('PanelFrame',(x,.103,0),(.008,.02,.32),'gold')
for z in [-.16,.16]:box('PanelFrame',(0,.103,z),(.145,.02,.008),'gold')
bpy.context.view_layer.update()
parts=[]
for o in collection.objects:
    mesh=o.data;mesh.calc_loop_triangles()
    parts.append({'name':o.name,'material':next(k for k,m in mats.items() if o.data.materials[0]==m),'vertices':[[round(v,6) for v in o.matrix_world@p.co] for p in mesh.vertices],'indices':[i for tri in mesh.loop_triangles for i in tri.vertices]})
out=ROOT/'demo/features/inventory/data/solar-flashlight.js';out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('const SOLAR_FLASHLIGHT_DATA='+json.dumps({'source':'Blender','materials':colors,'parts':parts},separators=(',',':'))+';\n',encoding='utf-8')
dest=ROOT/'Assets/Art/Blender/Equipment/SolarFlashlight.blend';dest.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(dest));print(json.dumps({'parts':len(parts),'file':str(dest)}))
