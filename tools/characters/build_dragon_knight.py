"""Blender MCP authoring source for three playable, articulated fantasy heroes."""
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
        'bone':'d9bd8a','white':'e2e5e8','black':'202734','steel':'92acbf','crimson':'9d254b'}
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
old=bpy.data.collections.get('CuteDragonKnight')
if old:
    for obj in list(old.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
main=bpy.data.collections.new('CuteDragonKnight');bpy.context.scene.collection.children.link(main)
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


hero('dragon_knight',{'body':[0,.45,0],'head':[0,1.85,.12],
 'arm_L':[-.67,1.35,0],'arm_R':[.67,1.35,0],
 'leg_L':[-.34,.45,0],'leg_R':[.34,.45,0],
 'wing_L':[-.45,1.45,-.38],'wing_R':[.45,1.45,-.38],'tail':[0,.9,-.4]},0)
sphere('round-body',0,1.15,0,1.3,1.5,1.03,'mint')
sphere('cream-belly',0,1.05,.47,.86,.98,.18,'cream')
for y in [.78,1,1.22]:rod('belly-scale',(-.3,y,.57),(.3,y,.57),.015,.015,'gold')
# Small blue breastplate leaves the cream tummy visible.
sphere('chest-armor',0,1.55,.4,1.02,.35,.28,'blue')
rod('armor-rim',(-.45,1.44,.51),(.45,1.44,.51),.035,.035,'gold')
bone='head'
sphere('big-round-head',0,2.04,.12,1.52,1.25,1.19,'mint')
sphere('friendly-muzzle',0,1.85,.68,1.1,.55,.5,'mint')
for side in [-1,1]:
 sphere('eye-white',side*.38,2.18,.62,.36,.43,.15,'white')
 sphere('eye',side*.38,2.18,.71,.22,.3,.09,'black')
 sphere('eye-sparkle',side*.34,2.25,.76,.075,.09,.025,'white')
 sphere('pink-cheek',side*.55,1.92,.68,.21,.13,.07,'rose')
 sphere('nostril',side*.23,1.92,.93,.07,.055,.025,'blue')
 rod('soft-horn',(side*.49,2.48,-.05),(side*.58,2.87,-.12),.13,.025,'cream')
 sphere('ear-fin',side*.76,2.1,-.05,.3,.45,.15,'mint')
# A simple curved smile, with no exposed fangs.
for i in range(7):
 x=-.29+i*.083;sphere('smile',x,1.7+.28*x*x,.9,.085,.028,.025,'blue')
sphere('helmet-cap',0,2.52,-.1,1.08,.22,.76,'blue')
rod('helmet-trim',(-.48,2.48,.25),(.48,2.48,.25),.04,.04,'gold')
rod('helmet-crest',(0,2.6,-.1),(0,2.78,-.1),.11,.05,'gold')
for side,letter in [(-1,'L'),(1,'R')]:
 bone='arm_'+letter
 sphere('arm',side*.72,1.16,.08,.38,.67,.43,'mint')
 sphere('shoulder-plate',side*.7,1.48,0,.53,.3,.5,'blue')
 sphere('hand',side*.73,.91,.17,.4,.35,.42,'mint')
 bone='leg_'+letter
 sphere('leg',side*.34,.45,.02,.47,.65,.55,'mint')
 sphere('boot',side*.34,.17,.15,.54,.32,.7,'blue')
 for j in [-1,0,1]:sphere('rounded-toe',side*.34+j*.13,.15,.47,.12,.1,.14,'cream')
 bone='wing_'+letter
 points=[(side*.44,1.55,-.4),(side*.94,2.02,-.55),(side*1.25,1.65,-.65),(side*.93,1.45,-.62),(side*.74,1.17,-.51)]
 geometry('small-wing',points,[(0,1,2),(0,2,3),(0,3,4)],'blue')
 for i in [1,2,4]:rod('wing-edge',points[0],points[i],.045,.02,'mint')
bone='tail'
rod('tail-root',(0,.85,-.4),(.18,.62,-.92),.25,.17,'mint')
rod('curled-tail',(.18,.62,-.92),(.43,.8,-1.14),.17,.06,'mint')
sphere('tail-tip',.43,.8,-1.14,.25,.26,.23,'cream')
bone='arm_R'
rod('sword-grip',(.79,.95,.25),(.79,1.22,.25),.055,.055,'blue')
box('sword-guard',.79,1.24,.25,.38,.08,.12,'gold')
rod('short-moonblade',(.79,1.29,.25),(.79,2.04,.25),.11,.025,'silver',4)
bone='arm_L'
sphere('round-shield',-.87,1.05,.4,.55,.67,.16,'blue')
sphere('shield-boss',-.87,1.05,.51,.22,.25,.07,'gold')
payload=dict(colors=colors,parts=current['parts'],pivots=current['pivots'])
out=ROOT/'demo/features/characters/dragon-knight';out.mkdir(parents=True,exist_ok=True)
(out/'model.js').write_text('window.DRAGON_KNIGHT = '+json.dumps(payload)+';\n',encoding='utf8')
path=ROOT/'Assets/Art/Blender/Characters/DragonKnight.blend'
bpy.data.libraries.write(str(path),{main})
print('CUTE_DRAGON_EXPORTED',len(current['parts']),path)
