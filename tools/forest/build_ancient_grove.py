"""Blender authoring -> shared mesh prototypes + instanced woodland for the game.

Run: E:\blender.exe --background --python tools/forest/build_ancient_grove.py
Only the generated AncientGrove collection is replaced in a live scene.
"""
import bpy, math, random, json, hashlib, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
rng=random.Random(731209)
name='AncientGrove'
old=bpy.data.collections.get(name)
if old:
    for o in list(old.all_objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
colors={'bark':(.19,.105,.13),'silver':(.55,.66,.64),'pine':(.045,.15,.14),
        'jade':(.08,.34,.25),'moon':(.17,.46,.43),'fern':(.16,.34,.17),
        'moss':(.24,.42,.22),'gold':(.62,.43,.13),'glow':(.12,.66,.64),
        'rock':(.17,.22,.25),'mushroom':(.30,.19,.41)}
materials={}
for key,color in colors.items():
    mat=bpy.data.materials.new('Grove_'+key);mat.diffuse_color=(*color,1);mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=.88
    if key=='glow':
        shader.inputs['Emission Color'].default_value=(*color,1);shader.inputs['Emission Strength'].default_value=.6
    materials[key]=mat
prototypes={};buffers={}
def begin():buffers.clear()
def meshpart(mat,verts,faces):
    b=buffers.setdefault(mat,{'vertices':[],'indices':[]});offset=len(b['vertices']);b['vertices']+=verts
    for face in faces:
        for i in range(1,len(face)-1):b['indices'] += [offset+face[0],offset+face[i],offset+face[i+1]]
def tube(points,radii,mat='bark',segments=9):
    from mathutils import Vector
    verts=[]
    for i,p in enumerate(points):
        tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])
        tangent.normalize();axis=tangent.cross(Vector((0,0,1)))
        if axis.length<.01:axis=tangent.cross(Vector((1,0,0)))
        axis.normalize();other=tangent.cross(axis).normalized()
        for j in range(segments):
            angle=j*math.tau/segments;v=Vector(p)+radii[i]*(axis*math.cos(angle)+other*math.sin(angle));verts.append(list(v))
    faces=[]
    for i in range(len(points)-1):
        for j in range(segments):
            a=i*segments+j;b=i*segments+(j+1)%segments;faces.append([a,b,b+segments,a+segments])
    faces += [list(reversed(range(segments))),list(range((len(points)-1)*segments,len(points)*segments))]
    meshpart(mat,verts,faces)
def crown(center,size,mat='jade',seed=0):
    randomizer=random.Random(seed);verts=[];rows=7;columns=12
    for i in range(rows+1):
        theta=math.pi*i/rows
        for j in range(columns):
            a=j*math.tau/columns;noise=1+randomizer.uniform(-.14,.14)
            verts.append([center[0]+math.sin(theta)*math.cos(a)*size[0]*noise,
                          center[1]+math.cos(theta)*size[1]*noise,
                          center[2]+math.sin(theta)*math.sin(a)*size[2]*noise])
    faces=[]
    for i in range(rows):
        for j in range(columns):a=i*columns+j;b=i*columns+(j+1)%columns;faces.append([a,b,b+columns,a+columns])
    meshpart(mat,verts,faces)
def finish(key):
    prototypes[key]=[]
    for mat,b in buffers.items():
        prototypes[key].append(dict(material=mat,**b))
        mesh=bpy.data.meshes.new(key+'_'+mat)
        vs=[(x,-z,y) for x,y,z in b['vertices']];ids=b['indices']
        mesh.from_pydata(vs,[],[ids[i:i+3] for i in range(0,len(ids),3)]);mesh.update()
        obj=bpy.data.objects.new(key+'_'+mat,mesh);collection.objects.link(obj);mesh.materials.append(materials[mat])
        obj.hide_render=True;obj.hide_set(True)
        obj['prototype']=key

# The giant has a crooked trunk, buttress roots and large spreading branches.
begin()
trunk=[[math.sin(y*.045)*2,y,math.sin(y*.065)*1.7] for y in range(0,89,8)]
tube(trunk,[6.2,5.1,4.4,3.9,3.4,3,2.6,2.2,1.8,1.4,1.1, .65][:len(trunk)],segments=14)
for i in range(12):
    a=i*math.tau/12;length=10+rng.random()*5
    tube([[math.cos(a)*length,.05,math.sin(a)*length],
          [math.cos(a)*7,1,math.sin(a)*7],[math.cos(a)*3,4,math.sin(a)*3]], [.08,1.1,2.1],segments=8)
for i in range(11):
    a=i*2.399;start=37+i*4;reach=21+(i%3)*4
    end=[math.cos(a)*reach,start+17,math.sin(a)*reach]
    tube([[0,start,0],[math.cos(a)*reach*.45,start+4,math.sin(a)*reach*.45],end], [2.2-i*.1,1.3,.25])
    for j in range(3):
        c=[end[0]+math.cos(a+j*1.7)*8,end[1]+j*3,end[2]+math.sin(a+j*1.7)*8]
        crown(c,[10.5,7.5,10],['jade','moon','jade'][j],i*31+j)
    # Hanging roots and a few quiet moonlit buds, rather than a glowing solid canopy.
    for j in range(2):
        x=end[0]+j*3;z=end[2];bottom=end[1]-13-j*4
        tube([[x,end[1],z],[x+1,bottom,z+.5]], [.1,.025],'moss',5)
        crown([x+1,bottom,z+.5],[.22,.45,.22],'glow',i+j)
crown([0,96,0],[17,14,16],'jade',102)
for i in range(7):
    a=i*.8;tube([[math.cos(a)*5.8,2+i,math.sin(a)*5.8],[math.cos(a+.08)*5.5,3+i,math.sin(a+.08)*5.5]],[.055,.055],'glow',5)
finish('elder')

# Four distinct tree silhouettes; the forest stays visible on Minimal settings.
for kind in ['birch','pine','willow','fern']:
    begin();bark='silver' if kind=='birch' else 'bark'
    tube([[0,0,0],[.1,5,0],[-.35,11,.2],[.1,17,0]],[.48,.35,.22,.04],bark)
    if kind=='pine':
        for i in range(5):
            y=5+i*2.7;r=5.4-i*.85
            tube([[0,y,0],[0,y+5,0]],[r,0],'pine',11)
    elif kind=='willow':
        for i in range(7):
            a=i*math.tau/7;x=math.cos(a)*4;z=math.sin(a)*4
            tube([[0,10,0],[x,15,z]],[.35,.07],bark,6)
            crown([x,14,z],[4.3,3.4,4.3],'moon',i)
            for j in range(2):tube([[x+j,14,z],[x+j+.4,7,z+.3]],[.23,.025],'jade',5)
    else:
        for i in range(4):
            a=i*2.399;y=9+i*2.5
            crown([math.cos(a)*2,y,math.sin(a)*2],[3.6,3.9,3.6],'moon' if kind=='birch' else 'fern',i+10)
    finish(kind)
# Extra silhouettes fill the whole woodland instead of only four biome clusters.
for kind in ['oak','acacia','redwood','bamboo','cherry']:
    begin()
    if kind=='bamboo':
        for j in range(5):
            x=math.sin(j*2.4)*.65;z=math.cos(j*2.4)*.65;h=12+j
            tube([[x,0,z],[x+.3,h,z]],[.14,.1],'moss',7)
            for y in range(2,h,2):tube([[x,y,z],[x,y+.09,z]],[.18,.18],'silver',7)
            for side in [-1,1]:
                tube([[x,h-3,z],[x+side*3,h-1,z]],[.12,.01],'jade',5)
                crown([x+side*2,h-1,z],[1.8,.45,1.3],'jade',j)
    else:
        tube([[0,0,0],[.2,8,0],[0,18,0]],[.6,.42,.08],'bark',9)
        if kind=='redwood':
            for j in range(6):tube([[0,7+j*2,0],[0,12+j*2,0]],[5-j*.65,.03],'pine',10)
        else:
            for j in range(5):
                a=j*2.399;x=math.cos(a)*4;z=math.sin(a)*4;y=12+(j%3)*2
                tube([[0,8,0],[x,y,z]],[.35,.06],'bark',7)
                crown([x,y+1,z],[5.2,1.6 if kind=='acacia' else 3.8,5.2],'mushroom' if kind=='cherry' else 'jade',j+31)
    finish(kind)
begin()
for i in range(6):
    a=i*math.tau/6;tube([[0,0,0],[math.cos(a)*1.1,.8,math.sin(a)*1.1]],[.2,.03],'fern',5)
finish('bush')
begin();tube([[0,0,0],[0,.85,0]],[.1,.07],'silver',6);crown([0,.85,0],[.6,.2,.6],'mushroom',54);finish('mushroom')
begin();crown([0,.8,0],[2.3,1.8,2],'rock',80);finish('rock')

center=[202,-206]
trail=[]

realm=json.loads((ROOT/'demo/features/world/data/expanded-realm.js').read_text(encoding='utf-8').split('=',1)[1].strip().rstrip(';'))
def realm_height(x,z):
    n=realm['segments'];u=max(0,min(n-.000001,(x+realm['size']/2)/realm['size']*n));v=max(0,min(n-.000001,(z+realm['size']/2)/realm['size']*n))
    i=int(u);j=int(v);fx=u-i;fz=v-j;h=realm['heights'];a=h[j*(n+1)+i];b=h[j*(n+1)+i+1];c=h[(j+1)*(n+1)+i];e=h[(j+1)*(n+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else e+(c-e)*(1-fx)+(b-e)*(1-fz)
def height(x,z):
    wave=realm_height(x,z)
    radius=math.hypot(x-center[0],z-center[1]);blend=max(0,min(1,(radius-21)/12));blend=blend*blend*(3-2*blend)
    return wave*blend+.04
def contains(x,z):return 148<=x<=442 and -244<=z<=40
biomes=[dict(id='birch',name='Rừng Bạch Nguyệt',x=167,z=-15,radius=38),
        dict(id='pine',name='Rừng Thông U Ảnh',x=208,z=-80,radius=44),
        dict(id='fern',name='Rừng Dương Xỉ và Nấm',x=170,z=-149,radius=42),
        dict(id='willow',name='Rừng Liễu Nguyệt',x=208,z=-202,radius=39)]
instances=[dict(kind='elder',x=202,z=-206,y=height(202,-206),scale=1,yaw=0,radius=6.3)]
occupied=[]
for biome in biomes:
    count=0
    for attempt in range(5000):
        if count>=255:break
        a=rng.random()*math.tau;r=math.sqrt(rng.random())*biome['radius'];x=148+(biome['x']-148)*3+math.cos(a)*r*3;z=biome['z']+math.sin(a)*r
        if not contains(x,z) or math.hypot(x-202,z+206)<22 or math.hypot(x-340,z+150)<15 or x<155 or x>435 or z< -237 or z>33:continue
        if any(math.hypot(x-px,z-pz)<3.7 for px,pz in occupied):continue
        scale=rng.uniform(.72,1.5);occupied.append((x,z));count+=1
        instances.append(dict(kind=biome['id'],x=x,z=z,y=height(x,z),scale=scale,yaw=rng.random()*math.tau,radius=.5*scale))
    biome['trees']=count
# Uniform supplemental canopy stays inside the titanium walls.
extra_species=['oak','acacia','redwood','bamboo','cherry']
for iz,z0 in enumerate(range(-236,34,10)):
    for ix,x0 in enumerate(range(156,435,10)):
        x=x0+rng.uniform(-2,2);z=z0+rng.uniform(-2,2)
        if math.hypot(x-202,z+206)<22 or math.hypot(x-340,z+150)<15 or (abs(x-290)<7 and z>24):continue
        if any(math.hypot(x-px,z-pz)<3.7 for px,pz in occupied):continue
        scale=rng.uniform(.8,1.15);kind=extra_species[(ix+iz*3)%len(extra_species)];occupied.append((x,z))
        instances.append(dict(kind=kind,x=x,z=z,y=height(x,z),scale=scale,yaw=rng.random()*math.tau,radius=.5*scale))
for i in range(2400):
    x=rng.uniform(156,434);z=rng.uniform(-242,32)
    if not contains(x,z) or math.hypot(x-340,z+150)<3 or (abs(x-290)<5 and z>34) or math.hypot(x-202,z+206)<7:continue
    kind='bush' if i%3 else 'mushroom'
    instances.append(dict(kind=kind,x=x,z=z,y=height(x,z),scale=rng.uniform(.7,1.5),yaw=rng.random()*math.tau,radius=0))
# Rocky outcrops leave natural gaps and the entrance/guardian clearings open.
for i in range(96):
    x=156+rng.random()*278;z=-225+rng.random()*230
    if not contains(x,z) or math.hypot(x-340,z+150)<18 or (abs(x-290)<8 and z>22) or x<156 or x>434 or z< -236 or z>32 or math.hypot(x-202,z+206)<26:continue
    scale=rng.uniform(1.2,2.6)
    instances.append(dict(kind='rock',x=x,z=z,y=height(x,z)-.5,scale=scale,yaw=rng.random()*math.tau,radius=2.3*scale))

# Titanium enclosure: continuous perimeter with one eight-metre southern entrance.
colors['titanium']=(.35,.43,.49);colors['titaniumTrim']=(.65,.73,.77)
for key in ['titanium','titaniumTrim']:
    mat=bpy.data.materials.new('Grove_'+key);mat.use_nodes=True;mat.diffuse_color=(*colors[key],1)
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');shader.inputs['Base Color'].default_value=(*colors[key],1);shader.inputs['Metallic'].default_value=.85;shader.inputs['Roughness'].default_value=.32
    materials[key]=mat
begin();fence=[]
def box(x,y,z,w,h,d,mat):
    verts=[[x+sx*w/2,y+sy*h/2,z+sz*d/2] for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    meshpart(mat,verts,[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]])
for x1,z1,x2,z2 in [(148,-244,442,-244),(148,-244,148,40),(442,-244,442,40),(148,40,286,40),(294,40,442,40)]:
    length=math.hypot(x2-x1,z2-z1);count=math.ceil(length/8)
    for i in range(count):
        ax=x1+(x2-x1)*i/count;az=z1+(z2-z1)*i/count;bx=x1+(x2-x1)*(i+1)/count;bz=z1+(z2-z1)*(i+1)/count
        x=(ax+bx)/2;z=(az+bz)/2;low=min(height(ax,az),height(bx,bz),height(x,z))-.5;high=max(height(ax,az),height(bx,bz),height(x,z))+9
        w=abs(bx-ax)+.4;d=abs(bz-az)+.4
        fence.append(dict(x=x,z=z,w=w,d=d,minY=low,maxY=high))
        box(x,low+1.5,z,w,3,d,'titanium')
        for y in [low+3.1,high-.4]:box(x,y,z,w,.3,d+.15,'titaniumTrim')
        for j in range(5):
            t=j/4;box(ax+(bx-ax)*t,(low+high)/2,az+(bz-az)*t,.22,high-low,.22,'titaniumTrim')
        box(ax,(low+high)/2,az,.85,high-low+1,.85,'titanium')
# Gate pillars and lintel are architectural; only the clear opening is traversable.
for x in [285.5,294.5]:box(x,5,40,1.2,11,1.2,'titaniumTrim')
box(290,10.2,40,10.2,1.2,1.2,'titanium')
finish('titanium_fence')
for o in collection.objects:
    if o.get('prototype')=='titanium_fence':o.hide_render=False;o.hide_set(False)

# Shared mesh data in Blender: linked objects, not thousands of unique meshes.
sources={key:[o for o in collection.objects if o.get('prototype')==key] for key in prototypes}
low_prototypes={}
graph=bpy.context.evaluated_depsgraph_get()
for key,parts in prototypes.items():
    if key=='titanium_fence':continue
    low_prototypes[key]=[]
    for part in parts:
        obj=next(o for o in sources[key] if o.data.materials[0]==materials[part['material']])
        modifier=obj.modifiers.new('MinimalGameLOD','DECIMATE');modifier.ratio=.3
        graph.update();evaluated=obj.evaluated_get(graph);mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
        low_prototypes[key].append(dict(material=part['material'],vertices=[[round(v.co.x,5),round(v.co.z,5),round(-v.co.y,5)] for v in mesh.vertices],indices=[i for tri in mesh.loop_triangles for i in tri.vertices]))
        evaluated.to_mesh_clear();obj.modifiers.remove(modifier)
for item in instances:
    for source in sources[item['kind']]:
        o=bpy.data.objects.new('Grove_'+item['kind'],source.data);collection.objects.link(o)
        o.location=(item['x'],-item['z'],item['y']);o.scale=(item['scale'],)*3;o.rotation_euler.z=-item['yaw']
        o['grove_instance']=True
terrain=dict(x0=148,z0=-244,step=2,nx=147,nz=142)
terrain['heights']=[height(148+i*2,-244+j*2) for j in range(143) for i in range(148)]
terrain['cells']=[contains(149+i*2,-243+j*2) for j in range(142) for i in range(147)]
# Keep the Blender review scene grounded with the same terrain used for collisions.
vertices=[(148+i*2,244-j*2,terrain['heights'][j*148+i]) for j in range(143) for i in range(148)]
faces=[]
for j in range(142):
    for i in range(147):
        if not terrain['cells'][j*147+i]:continue
        a=j*148+i;faces.extend([(a,a+148,a+1),(a+1,a+148,a+149)])
mesh=bpy.data.meshes.new('GroveSharedTerrain');mesh.from_pydata(vertices,[],faces);mesh.update()
floor=bpy.data.objects.new('GroveForestFloor',mesh);collection.objects.link(floor);mesh.materials.append(materials['moss'])
from mathutils import Vector
camera_data=bpy.data.cameras.new('GroveOverviewCamera');camera=bpy.data.objects.new('GroveOverviewCamera',camera_data);collection.objects.link(camera)
camera.location=(289,107,88);camera.rotation_euler=(Vector((202,206,48))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=28
bpy.context.scene.camera=camera
sun_data=bpy.data.lights.new('GroveMoonlight','SUN');sun_data.energy=2;sun=bpy.data.objects.new('GroveMoonlight',sun_data);collection.objects.link(sun);sun.rotation_euler=(.4,-.5,-.4)
bpy.context.scene.unit_settings.system='METRIC'
data=dict(version=2,areaScale=3,bounds=dict(minX=148,maxX=442,minZ=-244,maxZ=40),gate=dict(x=290,z=40,width=8),fence=fence,source='Blender',center=center,trail=trail,biomes=biomes,materials=colors,
          prototypes=prototypes,lowPrototypes=low_prototypes,instances=instances,terrain=terrain,discoveryRadius=24)
out=ROOT/'demo/features/forest/data/ancient-grove.js';out.write_text('window.ANCIENT_GROVE_DATA='+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf-8')
blend=ROOT/'Assets/Art/Blender/Forest/AncientGrove.blend';bpy.ops.wm.save_as_mainfile(filepath=str(blend))
page=ROOT/'demo/index.html';html=page.read_text(encoding='utf-8')
for asset in ['features/forest/data/ancient-grove.js','features/forest/ancient-grove.js']:
    digest=hashlib.sha256((ROOT/'demo'/asset).read_bytes()).hexdigest()[:12]
    html=re.sub(r'src="'+re.escape(asset)+r'(?:\?[^"\s]*)?"','src="'+asset+'?v='+digest+'"',html)
page.write_text(html,encoding='utf-8')
print('ANCIENT_GROVE_EXPORTED',len(instances),'instances;',[(b['id'],b['trees']) for b in biomes])
