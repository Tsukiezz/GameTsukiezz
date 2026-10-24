"""Author the articulated bark guardian in Blender and export shared game meshes."""
import bpy,math,json,random,re,hashlib
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
name='ForestGuardian';old=bpy.data.collections.get(name)
if old:
    for o in list(old.all_objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
palette={'nessSkin':(.17,.30,.25),'crocSkin':(.23,.25,.34),'plate':(.10,.14,.20),
         'belly':(.31,.29,.25),'bone':(.65,.62,.45),'mouth':(.10,.015,.045),
         'gum':(.29,.045,.07),'eye':(1,.32,.025),'pupil':(.008,.008,.012),
         'cosmic':(.48,.13,.72),'rune':(.12,.55,.53),'bark':(.23,.13,.075),'wood':(.48,.31,.14),'leaf':(.085,.28,.12),'moss':(.28,.42,.15)}
materials={}
for key,rgb in palette.items():
    mat=bpy.data.materials.new('ForestGuardian_'+key);mat.diffuse_color=(*rgb,1);mat.use_nodes=True
    bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=.7
    if key in ['eye','cosmic','rune']:bsdf.inputs['Emission Color'].default_value=(*rgb,1);bsdf.inputs['Emission Strength'].default_value=.8
    materials[key]=mat
buffers={};joint='body'
def meshpart(material,vertices,faces):
    b=buffers.setdefault((joint,material),{'vertices':[],'indices':[]});offset=len(b['vertices']);b['vertices']+=vertices
    for face in faces:
        for i in range(1,len(face)-1):b['indices'] += [offset+face[0],offset+face[i],offset+face[i+1]]
def ellipsoid(center,size,material,segments=14,rows=9):
    vertices=[]
    for i in range(rows+1):
        theta=math.pi*i/rows
        for j in range(segments):
            a=j*math.tau/segments
            vertices.append([center[0]+math.sin(theta)*math.cos(a)*size[0],center[1]+math.cos(theta)*size[1],center[2]+math.sin(theta)*math.sin(a)*size[2]])
    faces=[]
    for i in range(rows):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append([a,b,b+segments,a+segments])
    meshpart(material,vertices,faces)
def tube(points,radii,material,segments=10):
    vertices=[]
    for i,p in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])).normalized()
        axis=tangent.cross(Vector((0,1,0)))
        if axis.length<.01:axis=tangent.cross(Vector((1,0,0)))
        axis.normalize();other=tangent.cross(axis).normalized()
        for j in range(segments):
            a=j*math.tau/segments;vertices.append(list(Vector(p)+radii[i]*(axis*math.cos(a)+other*math.sin(a))))
    faces=[]
    for i in range(len(points)-1):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append([a,b,b+segments,a+segments])
    faces += [list(reversed(range(segments))),list(range((len(points)-1)*segments,len(points)*segments))]
    meshpart(material,vertices,faces)
def spike(base,tip,radius,material='bone'):tube([base,tip],[radius,.025],material,7)
def plate(center,size,material='plate'):ellipsoid(center,size,material,10,5)

# A rooted bark giant: split trunk legs, long knotted arms, carved face,
# branching antlers and mossy foliage. Same articulated meshes in the game.
joints={key:dict(parent=None,pivot=pivot) for key,pivot in {
    'body':[0,0,0],'leftArm':[-1.8,7.3,0],'rightArm':[1.8,7.3,0],
    'head':[0,9,0],'leftLeg':[-.8,2.2,0],'rightLeg':[.8,2.2,0]}.items()}
joint='body'
tube([[0,2,0],[0,4,0],[.15,6,0],[0,9,0]],[1.3,1.65,1.5,.95],'bark',14)
for i in range(15):
    a=i*math.tau/15
    tube([[math.cos(a)*1.4,2.4,math.sin(a)*1.4],[math.cos(a)*1.65,5,math.sin(a)*1.65],[math.cos(a)*1.1,8.6,math.sin(a)*1.1]],[.14,.19,.08],'wood',5)
ellipsoid([0,6.1,1.42],[.4,.7,.14],'rune',12,7)
for side,label in [(-1,'leftLeg'),(1,'rightLeg')]:
    joint=label
    tube([[side*.8,3,0],[side*1.25,1.2,.25],[side*1.5,.25,.7]],[.8,.65,.5],'bark')
    for j in range(4):tube([[side*1.5,.3,.6],[side*(1.5+j*.25),.06,1.7+j*.35]],[.28,.035],'wood',6)
for side,label in [(-1,'leftArm'),(1,'rightArm')]:
    joint=label
    tube([[side*1.4,7.5,0],[side*3.2,6.5,0],[side*4.3,4.8,.5],[side*4.6,3.3,1]],[.85,.7,.5,.38],'bark')
    ellipsoid([side*3.1,6.5,0],[.85,.85,.7],'wood',10,6)
    for j in range(4):
        tube([[side*4.6,3.5,1],[side*(4.3+j*.3),2.6,1.2],[side*(4.4+j*.36),2,1.6]],[.18,.14,.025],'bark',6)
    for i in range(3):
        tube([[side*2,7.3,0],[side*(3+i*.7),9+i*.7,-.2]],[.3,.015],'wood',7)
        ellipsoid([side*(2.8+i*.7),8.8+i*.7,-.2],[.9,.5,.8],'moss',10,5)
joint='head'
ellipsoid([0,10,0],[1.3,1.8,1],'bark',14,9)
for side in [-1,1]:
    ellipsoid([side*.52,10.25,.91],[.38,.19,.13],'eye',12,6)
    tube([[side*.15,10.65,.96],[side*.85,10.75,.84]],[.21,.19],'wood',7)
    tube([[side*.85,11.1,0],[side*1.9,12.8,-.1],[side*2.5,15,-.3]],[.5,.3,.035],'bark')
    for j in range(3):
        y=12+j*.8
        spike([side*(1.7+j*.25),y,0],[side*(3+j*.7),y+1.1,-.1],.23,'wood')
        ellipsoid([side*(2+j*.5),y+.8,-.6],[1.4,.75,1.5],'leaf',12,6)
tube([[0,10,.98],[0,9.5,1.35]],[.27,.08],'wood',7)
tube([[-.65,9.25,.85],[0,9.05,1],[.65,9.25,.85]],[.13,.16,.13],'pupil',7)
for i in range(8):
    x=(i-3.5)*.16;tube([[x,9,.9],[x*.8,7.8-abs(x)*.3,1.1]],[.1,.015],'moss',5)
ellipsoid([0,13.9,-.6],[2.4,1.8,2],'leaf',14,8)

rig=bpy.data.objects.new('ForestGuardian_Rig',None);collection.objects.link(rig);rig['maxHealth']=7000
bones={}
for key,definition in joints.items():
    bone=bpy.data.objects.new('ForestGuardian_'+key,None);collection.objects.link(bone);bone.parent=rig
    x,y,z=definition['pivot'];bone.location=(x,-z,y);bones[key]=bone
pieces=[]
for (bone,material),buffer in buffers.items():
    pieces.append(dict(joint=bone,material=material,**buffer));px,py,pz=joints[bone]['pivot']
    mesh=bpy.data.meshes.new(bone+'_'+material);ids=buffer['indices']
    mesh.from_pydata([(x-px,-z+pz,y-py) for x,y,z in buffer['vertices']],[],[ids[i:i+3] for i in range(0,len(ids),3)]);mesh.materials.append(materials[material]);mesh.update()
    obj=bpy.data.objects.new('Guardian_'+bone+'_'+material,mesh);collection.objects.link(obj);obj.parent=bones[bone]
# A Blender animation demonstrates the guardian waking and swinging its branches.
for frame,angle in [(1,0),(40,-.8),(65,.7),(95,0)]:
    bones['rightArm'].rotation_euler.x=angle;bones['rightArm'].keyframe_insert('rotation_euler',frame=frame)
bpy.context.scene.frame_set(1)
for obj in bpy.context.scene.objects:
    if obj.name not in collection.objects:obj.hide_render=True;obj.hide_set(True)
camera_data=bpy.data.cameras.new('GuardianReviewCamera');camera=bpy.data.objects.new('GuardianReviewCamera',camera_data);collection.objects.link(camera)
camera.location=(22,-32,17);camera.rotation_euler=(Vector((0,0,8))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=48;bpy.context.scene.camera=camera
light_data=bpy.data.lights.new('GuardianReviewSun','SUN');light_data.energy=2.5;light=bpy.data.objects.new('GuardianReviewSun',light_data);collection.objects.link(light);light.rotation_euler=(.3,-.4,-.5)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Forest/ForestGuardian.blend'))
data=dict(source='Blender',id='forest_guardian',name='Thần Rừng',maxHealth=7000,spawn=[340,-150],joints=joints,materials=palette,pieces=pieces)
(ROOT/'demo/features/forest/data/forest-guardian.js').write_text('window.FOREST_GUARDIAN_DATA='+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf-8')
print('FOREST_GUARDIAN_EXPORTED',len(pieces),'pieces; 7000 HP')
