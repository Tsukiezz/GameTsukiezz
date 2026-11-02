"""Blender authoring source for a cute playable boxing gorilla guardian."""
import bpy, math, json, bmesh, hashlib, re
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
cube=bpy.data.objects.get('Cube')
if cube and tuple(round(v,2) for v in cube.dimensions)==(2.,2.,2.):
    cube.hide_set(True);cube.hide_render=True
studio=bpy.data.scenes.get('NinjaYinYangStudio') or bpy.data.scenes.new('NinjaYinYangStudio')
bpy.context.window.scene=studio
TAU=math.pi*2
colors={'mint':'69c8aa','cream':'ffdf9b','rose':'ed9eaf','blue':'375f87','pearl':'e4e5f3','silver':'a7c4dc','gold':'d9af4a','aqua':'37d8dc',
        'violet':'7948bd','obsidian':'211c30','red':'8f263d','ember':'f36b31',
        'bone':'d9bd8a','white':'e2e5e8','black':'202734','steel':'92acbf','crimson':'9d254b','fur':'654432','furLight':'8a5d3f','tan':'cf9e73','glove':'a92d45'}
materials={}
for key,color in colors.items():
    mat=bpy.data.materials.new('Hero_'+key);mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    rgb=tuple(int(color[i:i+2],16)/255 for i in [0,2,4])
    linear=tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)
    shader.inputs['Base Color'].default_value=(*linear,1)
    shader.inputs['Metallic'].default_value=.55 if key in ['gold','silver','steel'] else .08
    shader.inputs['Roughness'].default_value=.38 if key in ['gold','silver','steel'] else .65
    materials[key]=mat
old=bpy.data.collections.get('YinYangNinjaAssets')
if old:
    for obj in list(old.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
main=bpy.data.collections.new('YinYangNinjaAssets');bpy.context.scene.collection.children.link(main)
heroes={};current=None;collection=None;bone='body';roots={}

def hero(key,pivots,offset):
    global current,collection,bone
    collection=bpy.data.collections.new('Hero_'+key);main.children.link(collection)
    root=bpy.data.objects.new(key+'_Root',None);collection.objects.link(root);root.location.x=offset
    roots[key]=root;nodes={}
    for name,pivot in pivots.items():
        node=bpy.data.objects.new(key+'_'+name,None);collection.objects.link(node);node.parent=root
        node.location=(pivot[0],-pivot[2],pivot[1]);nodes[name]=node
    current=dict(parts=[],pivots=pivots,nodes=nodes,key=key);heroes[key]=current;bone='body'

def geometry(name,vertices,faces,material):
    pivot=current['pivots'][bone]
    relative=[(x-pivot[0],-(z-pivot[2]),y-pivot[1]) for x,y,z in vertices]
    data=bpy.data.meshes.new(name);data.from_pydata(relative,[],faces);data.update()
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(data);bm.free()
    obj=bpy.data.objects.new(current['key']+'_'+name,data);collection.objects.link(obj)
    obj.parent=current['nodes'][bone];obj.data.materials.append(materials[material])
    data.calc_loop_triangles()
    current['parts'].append(dict(name=name,bone=bone,material=material,
        vertices=[[v.co.x,v.co.z,-v.co.y] for v in data.vertices],
        indices=[i for t in data.loop_triangles for i in t.vertices]))
    return obj

def sphere(name,x,y,z,w,h,d,mat):
    vertices=[];n=12;m=8
    for j in range(m+1):
        a=math.pi*j/m
        for i in range(n):
            b=TAU*i/n;vertices.append((x+math.sin(a)*math.cos(b)*w/2,y+math.cos(a)*h/2,z+math.sin(a)*math.sin(b)*d/2))
    faces=[]
    for j in range(m):
        for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    obj=geometry(name,vertices,faces,mat)
    for p in obj.data.polygons:p.use_smooth=True
    return obj

def box(name,x,y,z,w,h,d,mat):
    v=[(x+sx*w/2,y+sy*h/2,z+sz*d/2) for sx,sy,sz in
       [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
    return geometry(name,v,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],mat)

def rod(name,a,b,r0,r1,mat,n=10):
    a=Vector(a);b=Vector(b);direction=(b-a).normalized()
    u=direction.cross(Vector((0,1,0)))
    if u.length<.01:u=direction.cross(Vector((1,0,0)))
    u.normalize();v=direction.cross(u).normalized()
    vertices=[tuple(center+(u*math.cos(TAU*i/n)+v*math.sin(TAU*i/n))*radius) for center,radius in [(a,r0),(b,r1)] for i in range(n)]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    return geometry(name,vertices,faces,mat)

def disk(name,x,y,z,r,mat,start=0,end=TAU):
    vertices=[(x,y,z)]+[(x+math.cos(start+(end-start)*i/32)*r,y+math.sin(start+(end-start)*i/32)*r,z) for i in range(33)]
    return geometry(name,vertices,[(0,i+1,i+2) for i in range(32)],mat)

hero('ninja_yinyang',{'body':[0,.5,0],'head':[0,1.65,.03],'arm_L':[-.52,1.15,0],'arm_R':[.52,1.15,0],'leg_L':[-.24,.4,0],'leg_R':[.24,.4,0],'cape':[0,1.35,-.35]},0)
sphere('soft-ninja-tunic',0,.95,0,.98,1.0,.76,'obsidian')
box('ivory-half-vest',-.18,1.05,.36,.34,.66,.12,'white')
box('midnight-half-vest',.18,1.05,.36,.34,.66,.12,'black')
rod('teal-belt',(-.47,.72,.31),(.47,.72,.31),.065,.065,'aqua')
disk('yin-yang-dark',0,1.1,.46,.18,'black')
disk('yin-yang-light',0,1.1,.465,.18,'white',-math.pi/2,math.pi/2)
disk('yin-yang-swish-light',0,1.19,.47,.09,'white');disk('yin-yang-swish-dark',0,1.01,.475,.09,'black')
disk('yin-yang-dot-dark',0,1.19,.48,.027,'black');disk('yin-yang-dot-light',0,1.01,.48,.027,'white')
bone='head'
sphere('round-panda-hood',0,1.74,0,1.65,1.48,1.3,'obsidian')
sphere('ivory-face',0,1.74,.49,1.28,.9,.36,'white')
sphere('soft-lower-mask',0,1.47,.63,1.16,.39,.19,'black')
for side in [-1,1]:
 sphere('rounded-panda-ear',side*.61,2.28,.0,.43,.43,.31,'black')
 sphere('inner-ear',side*.61,2.3,.16,.23,.23,.06,'rose')
 sphere('eye-mask',side*.3,1.79,.67,.41,.32,.08,'black')
 sphere('big-friendly-eye',side*.3,1.8,.72,.20,.23,.07,'aqua' if side<0 else 'violet')
 sphere('eye-glint',side*.3-.035,1.85,.762,.07,.07,.025,'white')
 sphere('blush',side*.48,1.61,.686,.16,.07,.025,'rose')
box('white-headband',0,2.04,.59,1.25,.13,.13,'white')
disk('forehead-moon',0,2.05,.67,.105,'black');disk('forehead-light',0,2.05,.676,.105,'white',-math.pi/2,math.pi/2)
bone='cape'
rod('short-purple-scarf',(-.1,1.37,-.32),(-.4,1.02,-.88),.16,.08,'violet')
rod('short-teal-scarf',(.1,1.37,-.32),(.42,1.12,-.91),.14,.065,'aqua')
for side,letter in [(-1,'L'),(1,'R')]:
 bone='arm_'+letter
 sphere('short-sleeve',side*.53,1.12,0,.39,.48,.4,'white' if side<0 else 'black')
 rod('forearm',(side*.55,1.04,.05),(side*.66,.78,.23),.14,.12,'obsidian')
 sphere('mitt-glove',side*.66,.79,.26,.31,.3,.29,'black')
 rod('dagger-grip',(side*.66,.78,.29),(side*.68,.99,.35),.055,.05,'violet')
 rod('dagger-guard',(side*.53,1,.35),(side*.83,1,.35),.035,.035,'gold')
 geometry('dagger-blade',[(side*.62,1.02,.35),(side*.75,1.02,.35),(side*.71,1.48,.46),(side*.67,1.04,.41)],[(0,1,2),(0,2,3),(1,3,2),(0,3,1)],'silver')
 rod('dagger-teal-edge',(side*.62,1.02,.36),(side*.71,1.48,.47),.015,.004,'aqua')
 bone='leg_'+letter
 sphere('short-leg',side*.24,.36,0,.34,.53,.36,'obsidian')
 sphere('soft-sneaker',side*.24,.12,.12,.43,.25,.55,'white' if side<0 else 'black')
 box('sneaker-trim',side*.24,.05,.17,.43,.07,.38,'aqua')
payload=dict(source='Blender',colors=colors,parts=current['parts'],pivots=current['pivots'])
out=ROOT/'demo/features/characters/ninja-yinyang';out.mkdir(parents=True,exist_ok=True)
(out/'model.js').write_text('const NINJA_YINYANG='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf-8')
world=bpy.data.worlds.new('NinjaStudioWorld');world.use_nodes=True;bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.035,.065,.1,1);bg.inputs[1].default_value=.55;studio.world=world
light=bpy.data.lights.new('NinjaKey','AREA');light.energy=550;light.size=5;o=bpy.data.objects.new('NinjaKey',light);studio.collection.objects.link(o);o.location=(3,-4,5);o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
fill=bpy.data.lights.new('NinjaRim','AREA');fill.energy=450;fill.color=(.36,.72,1);fill.size=4;o=bpy.data.objects.new('NinjaRim',fill);studio.collection.objects.link(o);o.location=(-3,2,4);o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('NinjaPortrait');cam.type='ORTHO';cam.ortho_scale=3.05;eye=bpy.data.objects.new('NinjaPortrait',cam);studio.collection.objects.link(eye);eye.location=(3.4,-6,3.1);eye.rotation_euler=(Vector((0,0,1.2))-eye.location).to_track_quat('-Z','Y').to_euler();studio.camera=eye
studio.render.engine='BLENDER_EEVEE';studio.render.resolution_x=512;studio.render.resolution_y=512;studio.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Characters/NinjaYinYang.blend'),copy=True)
studio.render.filepath=str(out/'portrait.png');bpy.ops.render.render(write_still=True)
print('NINJA_EXPORTED',len(current['parts']))
