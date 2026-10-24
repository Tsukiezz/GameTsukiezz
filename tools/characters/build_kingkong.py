"""Blender authoring source for a cute playable boxing gorilla guardian."""
import bpy, math, json, bmesh, hashlib, re
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
cube=bpy.data.objects.get('Cube')
if cube and tuple(round(v,2) for v in cube.dimensions)==(2.,2.,2.):
    cube.hide_set(True);cube.hide_render=True
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
old=bpy.data.collections.get('CuteKongGuardian')
if old:
    for obj in list(old.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
main=bpy.data.collections.new('CuteKongGuardian');bpy.context.scene.collection.children.link(main)
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

hero('kingkong',{'body':[0,.45,0],'head':[0,2.05,.08],
 'arm_L':[-.7,1.55,0],'arm_R':[.7,1.55,0],
 'leg_L':[-.34,.45,0],'leg_R':[.34,.45,0]},0)
sphere('round-torso',0,1.15,0,1.45,1.5,1.02,'fur')
sphere('chest-guard',0,1.39,.43,1.11,.69,.28,'blue')
for side in [-1,1]:
 rod('gold-armor-trim',(side*.48,1.64,.49),(side*.35,1.13,.56),.035,.035,'gold')
 sphere('side-fur',side*.63,1.02,0,.22,.6,.65,'furLight')
box('belt',0,.71,.05,1.17,.16,.93,'blue');box('gold-buckle',0,.71,.54,.25,.19,.06,'gold')
disk('moon-medal',0,1.41,.61,.18,'gold');disk('crescent-inlay',.06,1.46,.62,.14,'blue')
bone='head'
sphere('large-gorilla-head',0,2.08,.08,1.52,1.37,1.22,'fur')
for side in [-1,1]:
 sphere('ear',side*.76,2.11,.04,.31,.4,.27,'furLight');sphere('inner-ear',side*.78,2.12,.17,.17,.26,.065,'tan')
 sphere('face-patch',side*.28,2.19,.57,.65,.65,.2,'tan')
 sphere('big-eye',side*.3,2.27,.69,.31,.36,.12,'black')
 sphere('eye-iris',side*.3,2.27,.756,.17,.23,.035,'furLight')
 sphere('eye-pupil',side*.3,2.27,.78,.12,.19,.025,'black')
 sphere('eye-highlight',side*.27,2.33,.8,.075,.085,.025,'white')
 sphere('soft-brow',side*.3,2.5,.62,.42,.1,.13,'furLight')
sphere('rounded-muzzle',0,1.92,.65,.91,.58,.39,'tan')
sphere('nose',0,2.07,.82,.4,.2,.19,'furLight')
for side in [-1,1]:sphere('nostril',side*.105,2.08,.914,.07,.055,.035,'black')
rod('smile-left',(-.28,1.85,.82),(0,1.79,.86),.018,.018,'fur')
rod('smile-right',(0,1.79,.86),(.28,1.85,.82),.018,.018,'fur')
for i in range(3):rod('hair-tuft',((i-1)*.16,2.65,.02),((i-1)*.2,2.96-abs(i-1)*.12,-.02),.13,.012,'furLight',7)
for side,letter in [(-1,'L'),(1,'R')]:
 bone='arm_'+letter
 sphere('shoulder',side*.7,1.55,0,.57,.64,.58,'fur')
 sphere('shoulder-plate',side*.72,1.67,.04,.6,.29,.57,'blue')
 rod('shoulder-trim',(side*.48,1.75,.3),(side*.95,1.67,.25),.03,.03,'gold')
 rod('upper-arm',(side*.73,1.48,.04),(side*.94,1.08,.13),.24,.22,'fur')
 rod('bent-forearm',(side*.94,1.08,.13),(side*.82,1.43,.5),.22,.21,'furLight')
 sphere('boxing-glove',side*.82,1.53,.64,.64,.65,.65,'glove')
 sphere('glove-thumb',side*.59,1.41,.57,.25,.3,.31,'glove')
 sphere('padded-cuff',side*.84,1.26,.4,.47,.2,.43,'blue')
 rod('cuff-trim',(side*.65,1.23,.6),(side*1.02,1.23,.6),.025,.025,'gold')
 rod('glove-seam',(side*.66,1.7,.88),(side*.98,1.7,.88),.012,.012,'rose')
 bone='leg_'+letter
 sphere('short-leg',side*.34,.43,.01,.48,.64,.53,'fur')
 sphere('boot',side*.34,.18,.16,.55,.3,.7,'blue')
 for i in [-1,0,1]:sphere('toe',side*.34+i*.13,.12,.46,.12,.1,.12,'tan')
payload=dict(source='Blender',colors=colors,parts=current['parts'],pivots=current['pivots'])
out=ROOT/'demo/features/characters/kingkong';out.mkdir(parents=True,exist_ok=True)
(out/'model.js').write_text('window.KINGKONG = '+json.dumps(payload)+';\n',encoding='utf8')
path=ROOT/'Assets/Art/Blender/Characters/KingKongGuardian.blend';bpy.data.libraries.write(str(path),{main})
print('KINGKONG_EXPORTED',len(current['parts']),path)
