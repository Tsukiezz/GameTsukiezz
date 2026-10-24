"""Blender terrain (4x each axis) and the new monumental Mercury Lake."""
import bpy, math, random, json, hashlib, re
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
collection_name='ExpandedRealmAndMercuryLake'
old=bpy.data.collections.get(collection_name)
if old:
    for obj in list(old.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(collection_name);bpy.context.scene.collection.children.link(collection)
SIZE=2240;BOUND=992;NX=256;STEP=SIZE/NX;CX,CZ=-370,-430
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
def terrain_height(x,z):
    r=math.hypot(x,z)
    base=max(0,math.sin(x*(.03 if r>175 else .015))*math.cos(z*(.03 if r>175 else .015))*(3.8 if r>175 else .12))
    expansion=smooth((r-300)/300)
    base=max(0,base+expansion*(10+math.sin(x*.007)*math.cos(z*.009)*14+math.sin(z*.019+x*.012)*5))
    lake=math.hypot((x-CX)/150,(z-CZ)/125)
    if lake<.86:return -72
    if lake<1:return -72+77.4*smooth((lake-.86)/.14)
    if lake<1.12:return 5.4
    if lake<1.4:return 5.4+(base-5.4)*smooth((lake-1.12)/.28)
    return base
palette={'obsidian':(.07,.095,.12),'stone':(.21,.25,.29),'silver':(.53,.64,.70),
         'rune':(.19,.38,.47),'ember':(.45,.055,.12),'terrain':(.15,.18,.22)}
materials={}
for key,color in palette.items():
    mat=bpy.data.materials.new('Mercury_'+key);mat.diffuse_color=(*color,1);mat.use_nodes=True
    bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(*color,1)
    bsdf.inputs['Roughness'].default_value=.8
    if key in ['rune','ember']:bsdf.inputs['Emission Color'].default_value=(*color,1);bsdf.inputs['Emission Strength'].default_value=.5
    materials[key]=mat
parts=[];collision=[];randomizer=random.Random(82041)
def part(name,vertices,indices,material):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([(x+CX,-z-CZ,y) for x,y,z in vertices],[],[indices[i:i+3] for i in range(0,len(indices),3)]);mesh.update()
    obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);mesh.materials.append(materials[material])
    parts.append(dict(name=name,vertices=vertices,indices=indices,material=material))
def box(name,x,y,z,w,h,d,material='stone',solid=True,standable=False):
    vertices=[[x+sx*w/2,y+sy*h/2,z+sz*d/2] for sx,sy,sz in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
    faces=[(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)]
    ids=[]
    for a,b,c,dv in faces:ids.extend([a,b,c,a,c,dv])
    part(name,vertices,ids,material)
    if solid:collision.append(dict(type='box',x=x,z=z,width=w,depth=d,minY=y-h/2,maxY=y+h/2,standable=standable,name=name))
def pillar(name,x,z,height,radius,material='obsidian',base=4,segments=9):
    vertices=[];rng=random.Random(len(parts)+31)
    cliff=name in ['lake-basalt-cliff','lake-outer-spire']
    profile=[1.12,1.04,.85,.65,.08] if cliff else [1,.87,.74,.61,.48]
    bends=[(rng.uniform(-.25,.25)*radius*i,rng.uniform(-.2,.2)*radius*i) for i in range(5)] if cliff else [(i*.5,0) for i in range(5)]
    for level in range(5):
        y=base+height*level/4;scale=profile[level]
        for j in range(segments):
            a=j*math.tau/segments;variation=1+rng.uniform(-.15,.15)
            yy=y+(rng.uniform(-.07,.07)*height if cliff and level>0 else 0)
            vertices.append([x+math.cos(a)*radius*scale*variation+bends[level][0],yy,z+math.sin(a)*radius*scale*variation+bends[level][1]])
    ids=[]
    for level in range(4):
        for j in range(segments):
            a=level*segments+j;b=level*segments+(j+1)%segments;ids.extend([a,b,b+segments,a,b+segments,a+segments])
    for j in range(1,segments-1):ids.extend([4*segments,4*segments+j,4*segments+j+1])
    part(name,vertices,ids,material)
    collision.append(dict(type='cylinder',x=x,z=z,radius=radius*(1.3 if cliff else 1.13)+2,minY=base,maxY=base+height,name=name))

# Asymmetrical broken basalt walls tower over an elliptical silver basin.
for i in range(62):
    angle=i*math.tau/62
    if math.sin(angle)>.85:continue  # a broad north-facing approach stays open
    x=math.cos(angle)*randomizer.uniform(158,170);z=math.sin(angle)*randomizer.uniform(133,145)
    h=randomizer.uniform(34,96)+(22 if math.sin(angle)<-.3 else 0)
    pillar('lake-basalt-cliff',x,z,h,randomizer.uniform(13,21),base=terrain_height(CX+x,CZ+z)-1)
    if i%4==0:pillar('lake-outer-spire',x*1.13,z*1.13,h*.75,4,base=terrain_height(CX+x*1.13,CZ+z*1.13)-1)

# A restrained stone causeway; no crystal road material or luminous curb.
box('lake-causeway',0,4.8,75,7,1.2,150,standable=True)
box('lake-watch-platform',0,4.8,154,25,1.2,16,standable=True)
box('lake-sanctum',0,4.7,0,30,1.4,30,standable=True)
for z in range(4,147,5):
    for side in [-1,1]:
        box('lake-bridge-post',side*3.4,5.75,z,.22,.7,.25)
        box('lake-bridge-rail',side*3.4,6.05,z,.13,.12,5.1)
for z in [25,60,95,130]:
    for side in [-1,1]:pillar('lake-bridge-pier',side*2.4,z,77,.65,'stone',base=-72)
for z in [12,32,52,72,92,112,132]:
    for side in [-1,1]:
        box('lake-cold-brazier',side*3.3,6.5,z,.4,.24,.4,'rune',solid=False)
# A broken, ominous shrine: two enormous gate pillars and a fractured arch.
for side in [-1,1]:
    pillar('lake-watcher-pillar',side*21,-20,137,3.5,'stone',base=-72)
    box('lake-watcher-eye',side*21,48,-15.6,1.1,.32,.2,'ember',solid=False)
    for level in [15,28,41]:box('lake-ancient-inscription',side*21,level,-15.8,.24,4,.12,'rune',solid=False)
for side in [-1,1]:
    for i in range(5):
        x=side*(21-i*2.6);y=63+i*1.45
        box('lake-broken-arch',x,y,-20,3.4,3.5,4,'stone',solid=False)
box('lake-relic-plinth',0,6.1,-8,3.3,1.4,3.3,'obsidian',standable=True)
box('lake-relic-moonstone',0,7.2,-8,.8,.9,.8,'silver',solid=False)
for i in range(18):
    a=i*2.399;x=math.cos(a)*randomizer.uniform(50,120);z=math.sin(a)*randomizer.uniform(45,105)
    if abs(x)<15:continue
    pillar('lake-drowned-obelisk',x,z,randomizer.uniform(76,92),randomizer.uniform(.8,1.7),'stone',base=-72)

# The approach ramp meets the terrain at its north end.
ramp=dict(x=0,z0=162,z1=192,width=12,bottom=5.4,top=terrain_height(CX,CZ+192))
w=ramp['width']/2
part('lake-approach-ramp',[[-w,5.4,162],[w,5.4,162],[-w,ramp['top'],192],[w,ramp['top'],192]],[0,2,1,1,2,3],'stone')
heights=[round(terrain_height(-SIZE/2+i*STEP,-SIZE/2+j*STEP),5) for j in range(NX+1) for i in range(NX+1)]
verts=[(-SIZE/2+i*STEP,SIZE/2-j*STEP,heights[j*(NX+1)+i]) for j in range(NX+1) for i in range(NX+1)]
faces=[]
for j in range(NX):
    for i in range(NX):a=j*(NX+1)+i;faces.extend([(a,a+NX+1,a+1),(a+1,a+NX+1,a+NX+2)])
mesh=bpy.data.meshes.new('ExpandedLunarTerrain');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('ExpandedLunarTerrain',mesh);collection.objects.link(obj);mesh.materials.append(materials['terrain'])
# Preview water in Blender; the browser adds a lightweight animated surface.
water=bpy.data.materials.new('LakeLiquidMercury');water.diffuse_color=(.55,.67,.76,1);water.use_nodes=True
bsdf=next(n for n in water.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Metallic'].default_value=1;bsdf.inputs['Roughness'].default_value=.14
v=[(CX, -CZ,1.2)]+[(CX+math.cos(i*math.tau/128)*148,-CZ-math.sin(i*math.tau/128)*123,1.2) for i in range(128)]
mesh=bpy.data.meshes.new('MercurySurface');mesh.from_pydata(v,[],[(0,i+1,(i+1)%128+1) for i in range(128)]);mesh.update()
obj=bpy.data.objects.new('MercurySurface',mesh);collection.objects.link(obj);mesh.materials.append(water)
camera_data=bpy.data.cameras.new('MercuryLakeOverview');camera=bpy.data.objects.new('MercuryLakeOverview',camera_data);collection.objects.link(camera)
camera.location=(CX+215,-CZ-225,150);camera.rotation_euler=(Vector((CX,-CZ,23))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=25;bpy.context.scene.camera=camera
sun_data=bpy.data.lights.new('MercuryMoonlight','SUN');sun_data.energy=2;sun=bpy.data.objects.new('MercuryMoonlight',sun_data);collection.objects.link(sun);sun.rotation_euler=(.4,-.5,.2)
bpy.context.scene.unit_settings.system='METRIC'
data=dict(version=1,source='Blender',size=SIZE,bound=BOUND,mapSpan=2080,segments=NX,heights=heights,
          lake=dict(x=CX,z=CZ,rx=150,rz=125,waterY=1.2,depthFloor=-72,parts=parts,colliders=collision,materials=palette,ramp=ramp))
out=ROOT/'demo/features/world/data/expanded-realm.js';out.write_text('window.EXPANDED_REALM_DATA='+json.dumps(data)+';\n',encoding='utf-8')
blend=ROOT/'Assets/Art/Blender/Environments/ExpandedRealmAndMercuryLake.blend';bpy.ops.wm.save_as_mainfile(filepath=str(blend))
page=ROOT/'demo/index.html';html=page.read_text(encoding='utf-8')
for asset in ['features/world/data/expanded-realm.js','features/world/expanded-realm.js']:
    digest=hashlib.sha256((ROOT/'demo'/asset).read_bytes()).hexdigest()[:12]
    html=re.sub(r'src="'+re.escape(asset)+r'(?:\?[^"\s]*)?"','src="'+asset+'?v='+digest+'"',html)
page.write_text(html,encoding='utf-8')
print('EXPANDED_REALM_EXPORTED',SIZE,BOUND,'lake meshes',len(parts),'colliders',len(collision))
