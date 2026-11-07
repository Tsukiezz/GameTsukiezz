"""Blender staff puppets, crescent chandeliers and real screen enclosures."""
from pathlib import Path
import bpy,json,math
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];AREA=ROOT/'.runtime/terminal-life';AREA.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'Assets/Art/Blender/Environments/TsukiezzTerminalLife.blend';OUT=ROOT/'demo/features/railway/data/terminal-life.js'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;asset=bpy.data.collections.new('Tsukiezz terminal - staff and fixtures');scene.collection.children.link(asset)
palette={'navy':'253f60','teal':'246675','gold':'cfad61','ivory':'e1d9c7','fur':'d4d1c7','muzzle':'f3e7cc','pink':'d68e9a','dark':'182b39','eye':'142036','white':'dce9ec','orange':'d98a3b','steel':'758b99','cyan':'63d7e4','warm':'edce8c','screen':'18313e','boot':'303a4b'}
materials={}
for key,col in palette.items():
 m=bpy.data.materials.new(key);m.diffuse_color=(*[int(col[i:i+2],16)/255 for i in (0,2,4)],1);materials[key]=m
model='decor';part='body';origin=Vector((0,0,0));pose=(0,0,0,0)
pivots={'clerk':{'body':[0,0,0],'head':[0,2.03,0],'leftArm':[-.48,1.63,0],'rightArm':[.48,1.63,0],'leftLeg':[-.22,.75,0],'rightLeg':[.22,.75,0]},'engineer':{'body':[0,0,0],'head':[0,2.03,0],'leftArm':[-.48,1.63,0],'rightArm':[.48,1.63,0],'leftLeg':[-.22,.75,0],'rightLeg':[.22,.75,0]},'bot':{'body':[0,0,0],'head':[0,1.46,0],'leftArm':[-.47,1.12,0],'rightArm':[.47,1.12,0],'leftLeg':[-.23,.44,0],'rightLeg':[.23,.44,0]}}
def vertex(p):
 x,y,z=p;cx,cy,cz,yaw=pose;cs=math.cos(yaw);sn=math.sin(yaw)
 return (origin.x+cx+x*cs+z*sn,-origin.z-cz+x*sn-z*cs,origin.y+cy+y)
def mesh(name,verts,faces,mat,smooth=False):
 g=bpy.data.meshes.new(name);g.from_pydata([vertex(p) for p in verts],[],faces);g.update();o=bpy.data.objects.new(name,g);asset.objects.link(o);g.materials.append(materials[mat]);o['model']=model;o['part']=part
 for p in g.polygons:p.use_smooth=smooth
 return o
def box(name,p,size,mat):
 x,y,z=p;w,h,d=size;v=[(x+a*w/2,y+b*h/2,z+c*d/2) for b in [-1,1] for c in [-1,1] for a in [-1,1]]
 return mesh(name,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],mat)
def ellipsoid(name,p,size,mat,seg=12,rings=8):
 x,y,z=p;rx,ry,rz=size;v=[(x+rx*math.sin(math.pi*j/rings)*math.cos(math.tau*i/seg),y+ry*math.cos(math.pi*j/rings),z+rz*math.sin(math.pi*j/rings)*math.sin(math.tau*i/seg)) for j in range(rings+1) for i in range(seg)]
 f=[(j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i) for j in range(rings) for i in range(seg)]
 return mesh(name,v,f,mat,True)
def rod(name,a,b,r,mat,n=8):
 a=Vector(a);b=Vector(b);q=(b-a).to_track_quat('Z','Y');v=[p+q@Vector((r*math.cos(i*math.tau/n),r*math.sin(i*math.tau/n),0)) for p in [a,b] for i in range(n)]
 return mesh(name,v,[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat,True)
def loop(name,center,r,mat,plane='xz',start=0,end=math.tau,thick=.08):
 pts=[(center[0]+r*math.cos(start+(end-start)*i/40),center[1]+(r*math.sin(start+(end-start)*i/40) if plane=='xy' else 0),center[2]+(r*math.sin(start+(end-start)*i/40) if plane=='xz' else 0)) for i in range(41)]
 for a,b in zip(pts,pts[1:]):rod(name,a,b,thick,mat)

for k in ['clerk','engineer']:
 model=k;origin=Vector((-110+10*['clerk','engineer'].index(k),.07,-114));pose=(0,0,0,0);part='body'
 jacket='navy' if k=='clerk' else 'orange'
 ellipsoid('Tail',(0,.95,-.32),(.26,.24,.24),'fur')
 ellipsoid('Uniform torso',(0,1.27,0),(.48,.55,.32),jacket)
 box('Uniform trousers',(0,.88,0),(.69,.36,.45),'navy')
 box('Ivory shirt',(0,1.54,.3),(.32,.5,.035),'ivory');box('Gold tie',(0,1.51,.33),(.09,.34,.04),'gold')
 for side in [-1,1]:
  rod('Uniform lapel',(side*.18,1.73,.33),(side*.08,1.32,.35),.055,'teal')
  box('Epaulette',(side*.4,1.7,0),(.22,.07,.4),'gold')
 for y in [1.04,1.22,1.4]:ellipsoid('Uniform brass button',(.13,y,.32),(.035,.035,.025),'gold',8,4)
 box('Name badge',(-.25,1.53,.32),(.15,.1,.035),'gold')
 box('Belt',(0,.88,0),(.8,.12,.5),'boot');box('Buckle',(0,.88,.27),(.17,.13,.045),'gold')
 if k=='engineer':
  for x in [-.31,.31]:box('Reflective jacket stripe',(x,1.35,.3),(.07,.62,.035),'warm')
  box('Tool pouch',(.47,.84,0),(.24,.32,.3),'boot');rod('Spanner handle',(.5,.93,.15),(.5,1.17,.15),.04,'steel')
 part='head'
 ellipsoid('Rabbit head',(0,2.03,.035),(.48,.46,.4),'fur',16,10)
 for side in [-1,1]:
  ellipsoid('Upright rabbit ear',(side*.24,2.67,-.045),(.13,.53,.14),'fur')
  ellipsoid('Pink inner ear',(side*.24,2.68,.078),(.07,.38,.027),'pink')
  ellipsoid('Eye white',(side*.185,2.11,.365),(.105,.13,.045),'white')
  ellipsoid('Friendly eye',(side*.185,2.105,.405),(.059,.086,.028),'eye')
  ellipsoid('Eye glint',(side*.165,2.14,.433),(.018,.025,.012),'white',8,6)
  ellipsoid('Blushed cheek',(side*.325,1.96,.33),(.087,.048,.025),'pink')
  ellipsoid('Rounded muzzle',(side*.108,1.95,.39),(.143,.105,.085),'muzzle')
 ellipsoid('Rabbit nose',(0,2.0,.49),(.07,.047,.032),'pink');rod('Smile',(-.055,1.88,.45),(.055,1.88,.45),.015,'eye')
 ellipsoid('Conductor cap',(0,2.39,0),(.51,.15,.39),jacket)
 box('Cap band',(0,2.33,.03),(.87,.09,.57),'gold');box('Cap visor',(0,2.32,.36),(.65,.055,.35),'boot')
 ellipsoid('Moon badge',(0,2.42,.38),(.075,.08,.03),'gold',10,6)
 for side,limb in [(-1,'leftArm'),(1,'rightArm')]:
  part=limb;ellipsoid('Uniform sleeve',(side*.57,1.36,0),(.17,.35,.19),jacket)
  box('Gold cuff',(side*.57,1.09,.015),(.3,.08,.32),'gold');ellipsoid('Paw',(side*.57,.99,.045),(.17,.16,.18),'fur')
 for side,limb in [(-1,'leftLeg'),(1,'rightLeg')]:
  part=limb;ellipsoid('Trouser leg',(side*.22,.52,0),(.19,.29,.21),'navy');ellipsoid('Polished shoe',(side*.22,.16,.14),(.23,.16,.36),'boot');box('Shoe sole',(side*.22,.05,.15),(.42,.07,.58),'dark')

model='bot';origin=Vector((-90,.07,-114));part='body'
ellipsoid('Service robot body',(0,.9,0),(.46,.5,.34),'teal',16,10)
box('Robot waist',(0,.5,0),(.57,.2,.4),'steel');box('Robot chest badge',(0,1.01,.33),(.38,.22,.04),'gold');ellipsoid('Robot heart diode',(0,1.01,.36),(.07,.07,.025),'cyan')
part='head';ellipsoid('Robot head',(0,1.5,0),(.48,.33,.34),'ivory',16,10);box('Robot face',(0,1.53,.31),(.67,.34,.055),'dark')
for side in [-1,1]:ellipsoid('Digital eye',(side*.18,1.57,.35),(.075,.08,.028),'cyan')
box('Digital smile',(0,1.43,.35),(.14,.025,.025),'cyan');rod('Antenna',(0,1.82,0),(0,2.06,0),.035,'gold');ellipsoid('Antenna beacon',(0,2.1,0),(.09,.1,.09),'warm')
for side,limb in [(-1,'leftArm'),(1,'rightArm')]:
 part=limb;ellipsoid('Shoulder bearing',(side*.47,1.1,0),(.14,.14,.14),'steel');rod('Robot forearm',(side*.5,1.05,0),(side*.58,.69,.07),.085,'ivory');ellipsoid('Robot gripper',(side*.59,.64,.09),(.12,.12,.13),'gold')
for side,limb in [(-1,'leftLeg'),(1,'rightLeg')]:
 part=limb;rod('Robot leg',(side*.23,.45,0),(side*.23,.19,.05),.09,'steel');ellipsoid('Robot padded foot',(side*.23,.12,.13),(.23,.12,.3),'boot')

model='decor';part='body';origin=Vector((0,0,0));pose=(0,0,0,0)
for x in [-40,40]:
 for z in [-28,28]:
  rod('Chandelier suspension',(x,16.6,z),(x,13.0,z),.1,'gold');loop('Crescent chandelier outer',(x,11.9,z),3.6,'gold',thick=.12);loop('Chandelier luminous band',(x,11.83,z),3.4,'warm',thick=.065)
  for i in range(12):
   a=i*math.tau/12;xx=x+3.5*math.cos(a);zz=z+3.5*math.sin(a);rod('Chandelier cable',(x,14,z),(xx,11.9,zz),.04,'gold');ellipsoid('Pendant crystal',(xx,11.35,zz),(.12,.4,.12),'cyan',8,6)
  loop('Suspended moon crescent',(x,12.8,z),1.15,'gold','xy',-.6,4.5,.16);ellipsoid('Chandelier core',(x,11.9,z),(.42,.42,.42),'warm')
for x in [-54,-28,28,54]:
 for z in [-56,0,56]:
  box('Pier uplight housing',(x,6.7,z),( .24,3.0,.42),'gold');box('Pier warm light',(x,6.7,z+.23),(.14,2.8,.045),'warm')
for x in [-43,-6,6,43]:
 for z in range(-68,69,8):box('Aisle recessed guide light',(x,.086,z),(.09,.018,5.8),'warm' if abs(x)==43 else 'cyan')
for z in [-92,92]:
 for center,span,rise in [(0,25,17),(-55,28,12),(55,28,12)]:
  pts=[(center+span*math.cos(i*math.pi/48),30+rise*math.sin(i*math.pi/48),z) for i in range(49)]
  for a,b in zip(pts,pts[1:]):rod('Illuminated roof arch',a,b,.095,'cyan')
screens=[]
def screen(name,x,y,z,w,h,yaw,kind,ceiling):
 global pose
 pose=(x,y,z,yaw);box(name+' chassis',(0,0,0),(w+.65,h+.6,.48),'dark')
 for side in [-1,1]:
  box(name+' vertical bezel',(side*(w/2+.13),0,.28),(.2,h+.42,.12),'gold')
  box(name+' horizontal bezel',(0,side*(h/2+.13),.28),(w+.45,.2,.12),'gold')
 box(name+' status light',(0,-h/2-.19,.36),(w*.6,.035,.045),'cyan')
 for xx in [-w*.32,w*.32]:rod(name+' hanger',(xx,h/2+.3,0),(xx,ceiling-y,0),.065,'steel')
 if name.startswith('Entrance'):
  for xx in [-w*.32,w*.32]:rod('Entrance cantilever',(xx,ceiling-y,0),(xx,ceiling-y,-3.5),.12,'gold')
 screens.append({'name':name,'position':[x+.322*math.sin(yaw),y,z+.322*math.cos(yaw)],'yaw':yaw,'width':w,'height':h,'kind':kind})
for side in [-1,1]:
 for z in [-42,42]:screen('Lunar TV',side*61.4,5.6,z,8.6,4.8,-side*math.pi/2,'space',8.5)
 for z in [-67,67]:screen('Hall departures',side*38,10,z,14,5.7,math.pi if z>0 else 0,'departures',16.92)
 for z in [-52,52]:screen('Platform departures',side*23.5,23.6,z,8.4,3.8,-side*math.pi/2,'departures',35.8)
for z in [-98,98]:screen('Entrance departures',0,9.6,z,20,5.5,math.pi if z<0 else 0,'departures',16.92)
pose=(0,0,0,0)

# Export vertex colors, with separate, correctly oriented pivot groups for motion.
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();bins={}
for obj in asset.objects:
 model=obj['model'];part=obj['part'];base=Vector((0,0,0)) if model=='decor' else Vector((-110+10*['clerk','engineer','bot'].index(model),.07,-114));pivot=Vector(pivots[model][part]) if model!='decor' else Vector((0,0,0));ev=obj.evaluated_get(deps);g=ev.to_mesh();g.calc_loop_triangles()
 for tri in g.loop_triangles:
  key=obj.data.materials[tri.material_index].name;glow=model=='decor' and key in ['cyan','warm'];dest=bins.setdefault((model,part,glow),{'positions':[],'normals':[],'colors':[],'indices':[],'lookup':{}});color=[int(palette[key][i:i+2],16)/255 for i in (0,2,4)]
  for li in tri.loops:
   v=g.vertices[g.loops[li].vertex_index].co;n=g.corner_normals[li].vector;p=Vector((v.x,v.z,-v.y))-base-pivot;packed=tuple(round(float(x),5) for x in (*p,n.x,n.z,-n.y,*color))
   if packed not in dest['lookup']:dest['lookup'][packed]=len(dest['positions'])//3;dest['positions'].extend(packed[:3]);dest['normals'].extend(packed[3:6]);dest['colors'].extend(packed[6:])
   dest['indices'].append(dest['lookup'][packed])
 ev.to_mesh_clear()
parts=[]
for (model,part,glow),d in bins.items():
 del d['lookup'];parts.append({'model':model,'pivot':part,'glow':glow,**d})
data={'version':1,'source':'Assets/Art/Blender/Environments/TsukiezzTerminalLife.blend','pivots':pivots,'parts':parts,'screens':screens,'sourceObjects':len(asset.objects),'triangles':sum(len(p['indices'])//3 for p in parts)}
OUT.write_text('window.TERMINAL_LIFE_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(AREA/'art-report.json').write_text(json.dumps({k:v for k,v in data.items() if k!='parts'},indent=2),encoding='utf8')
# Append the original station only as editing context; do not duplicate its export.
with bpy.data.libraries.load(str(ROOT/'Assets/Art/Blender/Environments/GrandLunarTerminal.blend'),link=False) as (src,dst):dst.collections=['Grand Lunar Terminal - editable architecture']
for col in dst.collections:
 if col:scene.collection.children.link(col)
bpy.ops.object.camera_add(location=(190,230,120));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,17))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=290;scene.camera=cam
scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.filepath=str(AREA/'blender-overview.png');bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));bpy.ops.render.render(write_still=True)
cam.location=(-100,102,6);cam.rotation_euler=(Vector((-100,114,1.6))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=25;scene.render.filepath=str(AREA/'blender-staff.png');bpy.ops.render.render(write_still=True)
print('TERMINAL_LIFE_READY',data['sourceObjects'],data['triangles'],len(screens),flush=True)
