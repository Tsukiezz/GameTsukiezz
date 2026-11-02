"""Blender source of the Void district, festive workshop, ice arena and equipment.
Exports reusable triangulated models and renders the actual item models as icons.
Run: E:\\blender.exe -b --python tools/build_void_update.py
"""
import bpy, json, math, os
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
scene=bpy.data.scenes.new('VoidAndWinterStudio')
bpy.context.window.scene=scene
palette={'stone':'#344257','plaster':'#77869b','trim':'#b6a47d','void':'#624995','glass':'#386b88','glow':'#90d5d8','wood':'#745346','linen':'#b8b0c2','dark':'#182838','red':'#9c364e','green':'#377a6b','ice':'#8fcbdc','snow':'#d3e7e9','iron':'#889fb4','lava':'#ee723f','gold':'#d6af60','rage':'#573953'}
mats={}
for name,value in palette.items():
    m=bpy.data.materials.new(name);m.diffuse_color=tuple(int(value[i:i+2],16)/255 for i in (1,3,5))+(1,);m.use_nodes=True
    bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs is None:
        bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');output=m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(bs.outputs['BSDF'],output.inputs['Surface'])
    bs.inputs['Base Color'].default_value=tuple(c**2.2 for c in m.diffuse_color[:3])+(1,);bs.inputs['Roughness'].default_value=.48
    if name in ('iron','gold','trim','rage'):bs.inputs['Metallic'].default_value=.6
    mats[name]=m
models={};current=''
def finish(o,name,mat):
    o.name=current+'_'+name;o.data.materials.append(mats[mat]);o['role']=mat;o['model']=current;models.setdefault(current,[]).append(o);return o
def point(p):return p[0],-p[2],p[1]
def box(n,p,s,m,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=point(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,n,m)
def sphere(n,p,s,m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=point(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,n,m)
def beam(n,a,b,r,m):
    a,b=Vector(point(a)),Vector(point(b));bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=r,depth=(b-a).length,location=(a+b)/2);o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return finish(o,n,m)
def crystal(n,p,r,h,m):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=point(p));o=bpy.context.object;o.scale=(r,r,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,n,m)
def ring(n,p,r,t,m):
    bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=6,location=point(p),major_radius=r,minor_radius=t);o=bpy.context.object;o.rotation_euler.x=math.pi/2;return finish(o,n,m)

# Ten comfortable studios per floor: modules contain kitchen, sleeping/living,
# work area and an enclosed bathroom. Walls and doors are authored by runtime.
for variant in range(3):
    current='room_'+str(variant)
    box('Rug',(0,.025,1),(3.8,.03,3.8),'void' if variant%2 else 'green',0)
    box('BedBase',(-2.1,.32,-2.1),(2,.6,3.2),'wood');box('Mattress',(-2.1,.72,-2.1),(1.9,.25,3.1),'snow',.1)
    box('Quilt',(-2.1,.9,-1.65),(1.92,.15,2.1),'linen' if variant!=1 else 'green',.08);box('Pillow',(-2.1,1,-3.1),(1.5,.22,.6),'snow',.12)
    box('Headboard',(-2.1,.9,-3.7),(2.15,1.6,.2),'wood');box('Nightstand',(-.55,.38,-3.1),(.7,.75,.7),'wood')
    sphere('BedLamp',(-.55,1.12,-3.1),(.25,.35,.25),'trim')
    box('Sofa',(2.25,.5,1.5),(1.3,1,2.4),'void',.16);box('SofaBack',(2.9,1,1.5),(.25,1.2,2.5),'linen',.1)
    box('CoffeeTable',(.4,.48,1.4),(1.4,.15,1.4),'wood');forlegs=[(-.45,-.45),(.45,-.45),(-.45,.45),(.45,.45)]
    for x,z in forlegs:box('TableLeg',(.4+x,.22,1.4+z),(.1,.45,.1),'trim')
    box('Desk',(-2.4,.9,2.5),(2.6,.15,1),'wood');box('DeskDrawer',(-3.3,.5,2.5),(.65,.85,.9),'plaster');box('Chair',(-2.4,.5,1.4),(.7,1,.65),'linen')
    box('BookShelf',(-3.65,1.25,.2),(.35,2.5,1.8),'wood')
    for j in range(8):box('Book',(-3.4,.7+(j//4)*.9,-.35+(j%4)*.3),(.2,.55,.2),['red','green','trim'][j%3],.01)
    box('Kitchen',(2.5,.5,-3.6),(2.5,1,1),'plaster');box('Counter',(2.5,1.05,-3.6),(2.65,.12,1.1),'stone');box('Sink',(2.7,1.13,-3.6),(.8,.06,.65),'iron')
    beam('Tap',(2.7,1.1,-3.9),(2.7,1.5,-3.9),.04,'iron');box('Fridge',(3.8,1.15,-2.1),(1.1,2.3,1.15),'iron')
    for k in range(2):ring('Hob',(1.7+k*.5,1.13,-3.6),.19,.035,'dark').rotation_euler.x=0
    box('BathroomBack',(2.4,1.4,3.6),(2.9,2.8,.12),'ice');box('BathroomSide',(1,1.4,2.8),(.12,2.8,1.7),'plaster')
    sphere('Basin',(2.9,.9,3),(.5,.15,.4),'snow');box('BasinStand',(2.9,.45,3),(.5,.9,.4),'plaster');box('Mirror',(2.9,1.7,3.48),(.9,.9,.07),'glass')
    sphere('WC',(1.8,.4,3),(.35,.4,.48),'snow');box('ShowerTray',(2.5,.06,2),(1.9,.12,.9),'snow')
    box('ArtFrame',(0,2.1,-3.92),(1.4,1,.07),'trim');box('Art',(0,2.1,-3.86),(1.2,.8,.03),'void')

current='facade_bay'
box('Spandrel',(0,.6,0),(9.8,1.2,.4),'stone');box('Window',(0,2.5,0),(8.6,2.5,.22),'glass')
for x in [-4.6,0,4.6]:box('Mullion',(x,2.5,.15),(.14,2.8,.28),'trim')
box('Cornice',(0,4.4,0),(10,.2,.8),'trim');box('Sill',(0,1.3,.2),(9,.18,.7),'plaster')
current='entry_portal'
for s in [-1,1]:box('FlutedPillar',(s*3.2,3.1,0),(.8,6.2,1.5),'stone');box('Inlay',(s*3.2,3.2,.8),(.14,4.8,.08),'trim')
box('Crown',(0,6.2,0),(8,.8,2),'stone');ring('VoidSeal',(0,6.4,1.1),.7,.1,'trim');crystal('SealCore',(0,6.4,1.1),.34,.48,'void')
current='factory_line'
box('MachineBase',(0,.5,0),(5,1,20),'dark');box('Belt',(0,1.1,0),(4.5,.2,20),'stone')
for z in range(-9,10,2):beam('Roller',(-2.3,1.2,z),(2.3,1.2,z),.16,'iron')
for s in [-1,1]:
    for z in [-6,6]:box('Leg',(s*2,.5,z),(.3,1,.3),'iron');box('ScannerPost',(s*2.5,2.8,z),(.35,3.4,.4),'green')
    box('MachineSide',(s*2.8,1.5,0),(.6,1.4,4),'red')
for z in [-6,6]:box('Scanner',(0,4.5,z),(5.6,.6,1.2),'red');box('Status',(0,4.1,z),(3.5,.1,.5),'glow')
current='gift'
box('Parcel',(0,.6,0),(1.4,1.2,1.4),'red',.08);box('Lid',(0,1.22,0),(1.55,.15,1.55),'green');box('RibbonX',(0,.65,.72),(.2,1.3,.04),'gold');box('RibbonZ',(.72,.65,0),(.04,1.3,.2),'gold')
for s in [-1,1]:ring('Bow',(s*.25,1.4,0),.28,.07,'gold')
for role in ['elf','guard']:
    current=role;body='green' if role=='elf' else 'red'
    sphere('Coat',(0,.9,0),(.38,.5,.28),body);sphere('Head',(0,1.6,.03),(.34,.35,.3),'linen')
    for s in [-1,1]:
        sphere('Boot',(s*.2,.2,.1),(.17,.2,.24),'dark');beam('Arm',(s*.3,1.1,0),(s*.48,.7,.1),.12,body);sphere('Mitten',(s*.48,.7,.1),(.13,.14,.12),'snow');sphere('Eye',(s*.12,1.63,.32),(.045,.065,.03),'dark')
    box('Belt',(0,.76,.05),(.78,.13,.52),'dark');box('Buckle',(0,.76,.33),(.18,.18,.05),'gold')
    bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=.38,radius2=.05,depth=.65,location=point((0,2.06,0)));finish(bpy.context.object,'Hat',body);sphere('Pom',(0,2.42,0),(.14,.14,.14),'snow')
    if role=='guard':beam('CandyPike',(.63,.1,0),(.63,2.9,0),.055,'trim');crystal('PikeHead',(.63,3,0),.15,.4,'ice')
current='ice_throne'
box('Dais',(0,.25,0),(10,.5,8),'ice',.15);box('Seat',(0,1.8,0),(4,3.1,3),'stone',.15);box('Velvet',(0,3.4,0),(3.7,.2,2.8),'void')
box('Back',(0,4.5,-1.5),(4,7,1),'ice',.15)
for i in range(7):crystal('CrownSpire',(-3+i,5+2*(1-abs(i-3)/3),-1.7),.5,2.6,'ice')
for s in [-1,1]:box('Arm',(s*2.4,3.2,0),(.8,1,4),'ice');sphere('Orb',(s*2.4,4,1.1),(.4,.4,.4),'glow')

current='engine'
sphere('Core',(0,1.2,0),(.55,.55,.55),'glow')
for i in range(3):o=ring('Gyroscope',(0,1.2,0),.9+i*.15,.09,'gold' if i%2 else 'iron');o.rotation_euler.y=i*math.pi/3;o.rotation_euler.z=i*.7
box('Pedestal',(0,.2,0),(1.4,.4,1.4),'dark');for_dummy=0
for s in [-1,1]:beam('Support',(s*.6,.3,0),(s*.75,1.2,0),.09,'gold')
current='snow_crystal'
for i in range(5):crystal('FrostShard',((i-2)*.32,.5+(.6 if i==2 else 0),0),.3,1.15 if i==2 else .7,'ice')
for i in range(6):a=i*math.pi/3;beam('SnowflakeRay',(0,1.2,.35),(.9*math.sin(a),1.2+.9*math.cos(a),.35),.04,'snow')
current='lava_sword'
box('Grip',(0,.3,0),(.22,1,.22),'dark');box('Guard',(0,.83,0),(1.3,.22,.35),'gold')
crystal('ObsidianBlade',(0,2,0),.34,1.3,'stone');crystal('MoltenEdge',(0,2.1,.15),.17,1.25,'lava');sphere('Pommel',(0,-.25,0),(.25,.25,.25),'rage')
for kind in ['iron_armor','diving_suit','rage_armor']:
    current=kind;main='iron' if kind=='iron_armor' else 'green' if kind=='diving_suit' else 'rage'
    sphere('Torso',(0,1.1,0),(.52,.55,.31),main);box('ChestPlate',(0,1.2,.28),(.8,.7,.15),main,.12);crystal('BreastSeal',(0,1.25,.39),.16,.22,'gold' if kind!='rage_armor' else 'lava')
    sphere('Helmet',(0,1.95,0),(.49,.48,.42),main);sphere('Visor',(0,1.98,.35),(.36,.22,.12),'glass');ring('HelmetRim',(0,1.98,.38),.34,.045,'gold')
    for s in [-1,1]:
        sphere('Pauldron',(s*.6,1.45,0),(.25,.25,.3),main);beam('Vambrace',(s*.62,1.25,0),(s*.65,.7,0),.17,main);beam('Greave',(s*.25,.65,0),(s*.25,.2,.04),.19,main);sphere('Boot',(s*.25,.13,.14),(.23,.18,.34),'dark')
        if kind=='diving_suit':beam('AirTank',(s*.22,.75,-.4),(s*.22,1.5,-.4),.17,'gold')
        if kind=='rage_armor':crystal('ShoulderMeteor',(s*.62,1.68,0),.16,.4,'lava')
current='void_fragment';crystal('Shard',(0,.8,0),.5,.8,'void');ring('Orbit',(0,.8,0),.85,.04,'gold')
current='nakat';crystal('Meteorite',(0,.7,0),.65,.65,'rage')
for i in range(6):crystal('NakatVein',(.42*math.sin(i),.5+i*.09,.45*math.cos(i)),.12,.23,'lava')

scene.view_layers[0].update();export={'source':'VoidAndWinterStudio.blend','materials':palette,'models':{}}
for name,objects in models.items():
    parts=[]
    for o in objects:
        o.data.calc_loop_triangles();vertices=[]
        for v in o.data.vertices:
            p=o.matrix_world@v.co;vertices.append([round(p.x,5),round(p.z,5),round(-p.y,5)])
        parts.append({'name':o.name,'role':o['role'],'vertices':vertices,'indices':[i for tri in o.data.loop_triangles for i in tri.vertices]})
    export['models'][name]=parts
out=ROOT/'demo/features/void/data';out.mkdir(parents=True,exist_ok=True)
(out/'void-assets.js').write_text('const VOID_ASSETS='+json.dumps(export,separators=(',',':'))+';\n',encoding='utf-8')

# Render icons from exactly the authored meshes; no placeholder emoji art.
scene.render.engine='BLENDER_EEVEE';scene.view_settings.view_transform='Standard';scene.view_settings.exposure=-.3;scene.render.resolution_x=scene.render.resolution_y=256;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.world=bpy.data.worlds.new('StudioAmbient');scene.world.use_nodes=True;bg=next((n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND'),None) or scene.world.node_tree.nodes.new('ShaderNodeBackground');bg.inputs[0].default_value=(.35,.42,.55,1);bg.inputs[1].default_value=.6;wo=next((n for n in scene.world.node_tree.nodes if n.type=='OUTPUT_WORLD'),None) or scene.world.node_tree.nodes.new('ShaderNodeOutputWorld');scene.world.node_tree.links.new(bg.outputs[0],wo.inputs['Surface'])
bpy.ops.object.camera_add(location=(4,-6,3.7));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.2))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.4;scene.camera=cam
for p,power,size in [((3,-4,6),1000,5),((-3,-1,3),700,4),((0,4,5),1200,3)]:
    bpy.ops.object.light_add(type='AREA',location=p);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
icons=ROOT/'demo/features/inventory/assets';icons.mkdir(parents=True,exist_ok=True)
for name in ['engine','snow_crystal','lava_sword','iron_armor','diving_suit','rage_armor','void_fragment','nakat']:
    for key,objects in models.items():
        for o in objects:o.hide_render=key!=name
    if os.environ.get('VOID_SKIP_ICONS')!='1':
        scene.render.filepath=str(icons/(name+'.png'));bpy.ops.render.render(write_still=True)
# Arrange editable source studio after exporting local meshes.
for i,(name,objects) in enumerate(models.items()):
    for o in objects:o.hide_render=False;o.location.x+=(i%5)*22;o.location.y+=(i//5)*24
# A second editable scene assembles all eight towers, using linked floor bands
# and furnished ground-floor apartments. The original studio keeps every module.
city=bpy.data.scenes.new('VoidApartments8Towers');bpy.context.window.scene=city;city.world=scene.world
def merged(name,specs):
    vertices=[];faces=[];roles=[];indices=[]
    for model,px,py,pz,angle in specs:
        for part in export['models'][model]:
            role=part['role']
            if role not in roles:roles.append(role)
            offset=len(vertices);cs,sn=math.cos(angle),math.sin(angle)
            for x,y,z in part['vertices']:vertices.append(point((px+x*cs+z*sn,py+y,pz-x*sn+z*cs)))
            for i in range(0,len(part['indices']),3):faces.append(tuple(offset+j for j in part['indices'][i:i+3]));indices.append(roles.index(role))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces)
    for role in roles:mesh.materials.append(mats[role])
    for face,index in zip(mesh.polygons,indices):face.material_index=index
    return mesh
band=merged('LinkedApartmentFacadeBand',[('facade_bay',(j-2)*10,0,side*14.8,math.pi if side<0 else 0) for side in [-1,1] for j in range(5)])
room_meshes={i:merged('LinkedFurnishedRoom'+str(i),[('room_'+str(i),0,0,0,0)]) for i in range(3)}
def instance(name,mesh,p,angle=0):
    obj=bpy.data.objects.new(name,mesh);city.collection.objects.link(obj);obj.location=point(p);obj.rotation_euler.z=-angle;return obj
def cube_preview(name,p,size,material):
    bpy.ops.mesh.primitive_cube_add(size=1,location=point(p));o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);o.data.materials.append(mats[material]);return o
cube_preview('DistrictPlaza',(0,-.14,0),(310,.28,170),'stone')
for t in range(8):
    x=(t%4-1.5)*72;z=(t//4-.5)*88
    for f in range(30):
        o=instance('Tower%02d_Floor%02d_Facade'%(t+1,f+1),band,(x,f*4.5,z));o['rooms']=10
        cube_preview('Tower%02d_Floor%02d_Slab'%(t+1,f+1),(x-1.75,f*4.5-.12,z),(52.5,.24,30),'stone')
    for side in [-1,1]:
        for zz in [-9,9]:cube_preview('TowerEndWall',(x+side*27.8,67.5,z+zz),(.4,135,12),'stone')
    cube_preview('Crown',(x,135,z),(58,.5,32),'void')
    for r in range(10):instance('Tower%02d_Apartment01%02d'%(t+1,r+1),room_meshes[(t+r)%3],(x+(r%5-2)*10,0,z+(-9 if r<5 else 9)),math.pi if r<5 else 0)
city['tower_count']=8;city['floors_per_tower']=30;city['apartments_per_floor']=10;city['total_apartments']=2400;city['runtime_interior_streaming']='The three authored room modules furnish every floor in the game.'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL';area.spaces.active.region_3d.view_location=(0,0,55);area.spaces.active.region_3d.view_distance=440
blend=ROOT/'Assets/Art/Blender/Environments/VoidAndWinterStudio.blend';bpy.ops.wm.save_as_mainfile(filepath=str(blend))
print('VOID_UPDATE_EXPORTED',len(models),'models, eight icons',blend)
