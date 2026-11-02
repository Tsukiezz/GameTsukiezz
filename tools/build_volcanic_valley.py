"""Blender-authored War Dragon and hidden lava sword, exported as runtime meshes."""
import bpy, math, json
from mathutils import Vector, Matrix
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
name='VolcanicValleyAssets';old=bpy.data.collections.get(name)
if old:
    bpy.data.batch_remove(ids=list(old.objects));bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
palette={'scale':(.065,.045,.055),'armor':(.19,.105,.08),'wing':(.26,.035,.025),'horn':(.43,.34,.25),'lava':(1,.19,.015),'eye':(1,.67,.025),'metal':(.16,.12,.13),'gold':(.62,.31,.055)}
materials={};parts={'dragon':[],'sword':[]};kind='dragon';joint='body'
for key,rgb in palette.items():
    mat=bpy.data.materials.new('Volcano_'+key);mat.use_nodes=True
    node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');node.inputs['Base Color'].default_value=(*rgb,1);node.inputs['Roughness'].default_value=.55;materials[key]=mat
def take(label,material):
    o=bpy.context.object;o.name='WarDragon_'+label if kind=='dragon' else 'LavaSword_'+label
    for c in list(o.users_collection):c.objects.unlink(o)
    collection.objects.link(o);o.data.materials.append(materials[material]);o['kind']=kind;o['joint']=joint;return o
def orb(label,p,s,mat='scale'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=p);o=take(label,mat);o.scale=s;return o
def spike(label,a,b,r,mat='horn'):
    delta=Vector(b)-Vector(a);bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=r,radius2=.015,depth=delta.length,location=(Vector(a)+Vector(b))/2);o=take(label,mat);o.rotation_mode='QUATERNION';o.rotation_quaternion=delta.to_track_quat('Z','Y');return o
def box(label,p,s,mat):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=take(label,mat);o.scale=s;return o
orb('Torso',(0,4,0),(2.2,2.5,4.2));orb('Chest',(0,4,-2.8),(1.8,2.7,2.5),'armor')
for i in range(10):
    z=-3.5+i*.8;spike('DorsalSpine',(0,6.1,z),(0,8.1-i*.1,z+.45),.5)
    for side in [-1,1]:orb('Scute',(side*1.9,4.8,z),(.42,.7,.55),'armor')
joint='head';orb('Neck',(0,5.9,-4.3),(1.25,2,1.5));orb('Skull',(0,7,-6.4),(1.6,1.2,2));orb('UpperJaw',(0,6.65,-8),(1.2,.6,1.5),'armor');orb('LowerJaw',(0,5.9,-7.5),(1,.35,1.8))
for side in [-1,1]:
    orb('Eye',(side*1.36,7.35,-7.1),(.18,.17,.42),'eye');spike('Brow',(side*.8,7.8,-7.2),(side*1.8,7.65,-7.8),.38,'armor')
    spike('CrownHorn',(side*1.1,7.7,-5.8),(side*2.7,10.5,-4.4),.52)
    spike('CheekHorn',(side*1.3,6.9,-5.5),(side*2.8,7.7,-4.6),.36)
    for i in range(7):spike('Fang',(side*.93,6.5,-8.6+i*.38),(side*.91,5.92,-8.6+i*.38),.12)
    orb('Nostril',(side*.48,7,-8.8),(.16,.1,.17),'lava')
for side in [-1,1]:
    for front in [True,False]:
        joint=('front' if front else 'rear')+str(side);z=-2.4 if front else 2.5
        orb('Thigh',(side*2.1,2.8,z),(.85,1.7,1));orb('Shin',(side*2.6,1.3,z-.45),(.5,1.3,.6),'armor');orb('Foot',(side*2.7,.45,z-1),(.8,.4,1.3))
        for j in range(3):spike('Claw',(side*2.7+(j-1)*.43,.4,z-1.8),(side*2.7+(j-1)*.43,.15,z-2.65),.18)
    joint='wing'+str(side)
    points=[(side*1.5,5,-1),(side*5.3,9,-2.3),(side*12,8,2),(side*8.3,4.8,4.9),(side*4.5,3.5,3.7),(side*2,4,2.5)]
    mesh=bpy.data.meshes.new('WingMembrane');mesh.from_pydata(points,[],[(0,1,2),(0,2,3),(0,3,4),(0,4,5)]);o=bpy.data.objects.new('Membrane',mesh);collection.objects.link(o);bpy.context.view_layer.objects.active=o;take('Membrane','wing')
    for i in range(1,5):spike('WingFinger',points[0],points[i],.25,'armor')
    spike('WingTalon',points[1],(side*6.3,10.4,-3.3),.3)
joint='tail'
for i in range(10):
    p=(math.sin(i*.3)*i*.25,3-i*.17,3.5+i*.9);orb('TailSegment',p,(max(.18,1-i*.085),max(.18,.85-i*.065),.7))
    spike('TailSpine',p,(p[0],p[1]+1,p[2]+.4),max(.1,.3-i*.02))
kind='sword';joint='body'
box('Blade',(0,1.5,0),(.36,2.5,.12),'metal');box('MoltenCore',(0,1.5,-.07),(.12,2.45,.035),'lava');spike('Point',(-.01,2.6,0),(0,3.1,0),.2,'lava');box('Crossguard',(0,.2,0),(1.1,.18,.26),'gold');box('Grip',(0,-.25,0),(.18,.75,.18),'metal');orb('Pommel',(0,-.7,0),(.2,.2,.2),'lava')
bpy.context.view_layer.update()
for o in collection.objects:
    mesh=o.data;mesh.calc_loop_triangles();parts[o['kind']].append({'name':o.name,'joint':o['joint'],'material':next(k for k,m in materials.items() if mesh.materials[0]==m),'vertices':[[round(v,5) for v in o.matrix_world@p.co] for p in mesh.vertices],'indices':[i for t in mesh.loop_triangles for i in t.vertices]})
out=ROOT/'demo/features/volcano/data/volcanic-assets.js';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('const VOLCANIC_ASSETS='+json.dumps({'source':'Blender','materials':palette,'models':parts},separators=(',',':'))+';\n',encoding='utf-8')
# Game uses Y-up; save the Blender source upright in its native Z-up space.
for o in collection.objects:o.matrix_world=Matrix.Rotation(math.pi/2,4,'X')@o.matrix_world
dest=ROOT/'Assets/Art/Blender/Environments/VolcanicValley.blend';dest.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(dest));print({k:len(v) for k,v in parts.items()})
