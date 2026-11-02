"""Blender railway authoring. Own scene only; export reusable game meshes."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
scene=bpy.data.scenes.get('MoonRailway') or bpy.data.scenes.new('MoonRailway')
bpy.context.window.scene=scene
for o in list(scene.objects): bpy.data.objects.remove(o,do_unlink=True)
colors={'steel':(.19,.25,.3),'gold':(.85,.58,.19),'red':(.38,.06,.09),'wood':(.23,.13,.08),'glass':(.2,.65,.8),'roof':(.08,.16,.2),'stone':(.42,.45,.48),'lamp':(1,.85,.4),'ivory':(.78,.73,.59),'teal':(.035,.22,.24),'leaf':(.12,.32,.19),'flower':(.58,.25,.58),'tin':(.68,.73,.78),'uniform':(.08,.14,.3),'skin':(.85,.65,.45),'black':(.025,.03,.04)}
mats={}
for k,c in colors.items():
 m=bpy.data.materials.new('Rail_'+k);m.diffuse_color=(*c,1);mats[k]=m
models={};current=[]
def box(name,p,s,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);current.append(o);return o
def cylinder(name,p,r,depth,mat,axis='x'):
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=depth,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name
 if axis=='x':o.rotation_euler[1]=math.pi/2
 elif axis=='z':o.rotation_euler[0]=math.pi/2
 o.data.materials.append(mats[mat]);current.append(o);return o
def finish(kind):
 bpy.context.view_layer.update();pieces=[]
 for o in current:
  vs=[o.matrix_world@v.co for v in o.data.vertices];o.data.calc_loop_triangles();pieces.append({'material':next(k for k,m in mats.items() if m==o.data.materials[0]),'vertices':[[round(v.x,5),round(v.z,5),round(-v.y,5)] for v in vs],'indices':[i for t in o.data.loop_triangles for i in t.vertices],'name':o.name})
 models[kind]=pieces
 for o in current:o.hide_render=True;o.hide_set(True)
 current.clear()
for kind in ['engine','coach']:
 box(kind+'_chassis',(0,1.4,0),(4.4,.6,13),'steel')
 for z in [-4,4]:
  cylinder('Axle',(0,1,z),.18,4.8,'steel')
  for x in [-2.15,2.15]:
   cylinder('Wheel',(x,1,z),1, .38,'steel');cylinder('WheelHub',(x*1.02,1,z),.46,.4,'gold')
 if kind=='engine':
  cylinder('SteamBoiler',(0,3.2,1.6),1.7,7.8,'red','z');cylinder('BoilerFace',(0,3.2,5.55),1.5,.22,'gold','z')
  box('CabFloor',(0,1.8,-4),(4.3,.2,3.8),'wood');box('CabBack',(0,3.4,-5.85),(4.3,3.2,.18),'red');
  for x in [-2.05,2.05]:box('CabSide',(x,2.5,-4),(.18,1.2,3.8),'red')
  box('CabRoof',(0,5.9,-4),(5,.35,4.5),'roof')
  cylinder('Chimney',(0,5.4,3.7),.55,2.3,'steel','y');cylinder('ChimneyLip',(0,6.5,3.7),.82,.35,'gold','y')
  for x in [-2.17,2.17]:box('CabWindow',(x,4.4,-3.8),(.1,1.5,2),'glass')
  cylinder('Headlamp',(0,3.5,5.8),.42,.25,'lamp','z');box('Cowcatcher',(0,1,6.6),(4.6,.55,1.2),'gold')
 else:
  box('PassengerFloor',(0,1.8,0),(4.2,.2,12),'wood');box('CoachRoof',(0,5.65,0),(4.8,.35,12.8),'roof')
  for x in [-2.05,2.05]:
   box('LowerWall',(x,2.5,0),(.16,1.2,12),'red')
   box('UpperWall',(x,5.25,0),(.16,.5,12),'red')
   for z in [-5.9,-3.2,-.8,1.6,4,5.9]:box('WindowPillar',(x,4,z),(.18,2.2,.14),'gold')
   for z in [-4.6,-2,.4,2.8,4.9]:box('PassengerWindow',(x,4,z),(.04,1.8,1.8),'glass')
   box('GoldStripe',(x,3,0),(.2,.12,11.8),'gold')
  for z in [-5.95,5.95]:
   for x in [-1.5,1.5]:box('EndWall',(x,3.5,z),(1.1,3.2,.16),'red')
   box('DoorLintel',(0,5.2,z),(2,.5,.16),'gold')
  for x in [-1.25,1.25]:
   for z in [-4,-1,2,4.5]:
    box('SeatCushion',(x,2.4,z),(1.1,.3,1.5),'uniform');box('SeatBack',(x,3,z-.65),(1.1,1.3,.2),'red')
  box('AisleCarpet',(0,1.92,0),(.95,.02,11.6),'red')
  for z in [-4,0,4]:box('InteriorLamp',(0,5.35,z),(.7,.12,.7),'lamp')
 for z in [-7,7]:box('Coupler',(0,1.4,z),(.6,.35,1.4),'steel')
 finish(kind)
box('Sleeper',(0,-.28,0),(6,.35,.55),'wood')
for x in [-2.15,2.15]:box('Rail',(x,0,0),(.18,.32,2.05),'steel')
finish('track')
box('BallastBed',(0,-.43,0),(6.5,.45,2.1),'stone');finish('ballast')
box('BridgeDeck',(0,-.7,0),(7,.8,8),'stone')
for x in [-3.3,3.3]:
 box('BridgeGuard',(x,1.1,0),(.2,.2,8),'gold')
 for z in [-4,0,4]:box('BridgePost',(x,.4,z),(.2,1.6,.2),'steel')
finish('bridge')
# Moonlit stations: long sheltered platform, ticket hall and a clock tower.
box('Platform',(9,.3,0),(12,1,80),'stone')
box('PlatformIvoryEdge',(3.1,.72,0),(.24,.16,80),'ivory')
box('SafetyStripe',(3.55,.82,0),(.18,.025,78),'gold')
for z in range(-36,37,4):box('PavingInlay',(9,.815,z),(10,.025,.06),'ivory')
for z in [-34,-22,-10,2,14,26,38]:
 box('CanopyFoot',(13,.98,z),(.8,.3,.8),'ivory')
 box('CanopyColumn',(13,3.7,z),(.25,5.4,.25),'teal')
 box('ColumnCapital',(13,6.2,z),(.65,.28,.65),'gold')
 box('CanopyCrossBeam',(8.8,6.4,z),(10,.22,.24),'teal')
 for x in [5,12]:
  cylinder('LanternStem',(x,5.8,z),.055,.8,'gold','y')
  box('LanternGlass',(x,5.35,z),(.45,.6,.45),'lamp')
  box('LanternCap',(x,5.72,z),(.58,.12,.58),'teal')
box('CanopyRoof',(8.7,6.75,0),(12,.3,82),'teal')
for x in [2.6,14.8]:box('CanopyCornice',(x,6.55,0),(.2,.3,82),'gold')
box('CanopyRidge',(8.7,7.0,0),(2,.2,82),'teal')
# Hall is behind the platform, leaving the boarding edge and aisle clear.
box('TicketHallFloor',(22,.55,-6),(12,.5,22),'ivory')
box('HallBack',(27.9,4.3,-6),(.25,8,22),'ivory')
for z in [-16.9,4.9]:box('HallEnd',(22,4.3,z),(12,8,.25),'ivory')
for z in [-15,-10,-5,0,4]:
 box('HallFrontPillar',(16,4.3,z),(.4,8,.4),'teal')
 if z!=-5:box('TicketHallWindow',(15.98,4,z+1.6),(.06,3.5,2.5),'glass')
box('TicketCounter',(16,2,-5),(.6,1.1,3),'wood')
box('HallLintel',(16,7.6,-6),(.5,1,22),'ivory')
box('HallRoof',(22,8.6,-6),(14,.65,24),'teal')
for x in [15,29]:box('HallGoldFascia',(x,8.25,-6),(.18,.28,24),'gold')
# Freestanding tower clock faces the platform and locomotive.
box('ClockTowerBase',(22,1.2,24),(7,2.4,7),'ivory')
box('ClockTower',(22,7.7,24),(5.2,11,5.2),'ivory')
for y in [3,10.5,13.2]:box('ClockTowerCornice',(22,y,24),(6,.35,6),'gold')
box('ClockTowerCrown',(22,13.7,24),(6.3,.7,6.3),'teal')
cylinder('ClockFace',(19.32,11.5,24),1.65,.12,'ivory','x')
for j in range(12):
 a=j*math.tau/12
 box('ClockHourMark',(19.22,11.5+math.cos(a)*1.37,24+math.sin(a)*1.37),(.08,.16,.1),'gold')
box('ClockMinuteHand',(19.16,12,24),(.1,1.05,.09),'black')
box('ClockHourHand',(19.1,11.5,24.38),(.12,.1,.8),'black')
cylinder('ClockTowerSpire',(22,15,24),.28,2,'gold','y')
for z in [-29,-16,8,21,32]:
 box('BenchSeat',(10,1.6,z),(1.6,.23,3.4),'wood');box('BenchBack',(10.65,2.15,z),(.18,1.1,3.4),'wood')
 for dz in [-1.3,1.3]:box('BenchLeg',(10,1.15,z+dz),(1.4,.7,.13),'teal')
for x,z in [(6,-37),(13,-37),(13,37),(22,-22),(29,14),(29,32)]:
 box('Planter',(x,1,z),(1.6,.45,1.6),'ivory');cylinder('Topiary',(x,1.8,z),.65,1.2,'leaf','y')
 for dz in [-.3,.3]:box('Flowers',(x,1.55,z+dz),(.6,.22,.22),'flower')
# A broad staircase reaches the public forecourt behind the platform.
for x,y in [(15.4,.55),(16.4,.3),(17.4,.05)]:box('PlatformStep',(x,y-.2,12),(1.1,.4,9),'stone')
box('StationNameFrame',(3.3,4.55,0),(.2,1.6,15),'teal')
for z in [-7.6,7.6]:box('SignGoldTrim',(3.1,4.55,z),(.22,1.8,.12),'gold')
finish('station')
# Royal tin soldier driver, an NPC rather than a playable hero.
box('TinBootL',(-.24,.18,0),(.35,.35,.6),'black');box('TinBootR',(.24,.18,0),(.35,.35,.6),'black')
for x in [-.24,.24]:box('TinLeg',(x,.65,0),(.28,.7,.3),'uniform')
box('RoyalJacket',(0,1.25,0),(.95,.75,.45),'red');box('Belt',(0,.98,.01),(1,.13,.49),'black');box('Buckle',(0,.98,.27),(.18,.14,.05),'gold')
for x in [-.38,.38]:box('Epaulette',(x,1.63,0),(.35,.12,.58),'gold')
for y in [1.15,1.38,1.55]:box('JacketButton',(0,y,.25),(.08,.08,.06),'gold')
for x in [-.64,.64]:
 box('TinArm',(x,1.22,.12),(.25,.7,.3),'red');box('TinHand',(x,.88,.18),(.25,.22,.3),'tin')
box('TinHead',(0,1.98,0),(.56,.6,.5),'skin');box('TinHat',(0,2.5,0),(.68,.55,.62),'black');box('HatBand',(0,2.29,.02),(.72,.12,.65),'gold');box('RoyalBadge',(0,2.53,.33),(.22,.28,.05),'gold')
for x in [-.14,.14]:box('Eye',(x,2.03,.26),(.06,.06,.03),'black')
box('Moustache',(0,1.86,.27),(.32,.055,.035),'black');finish('driver')
# Full authoring overview: linked template meshes, no existing scene is overwritten.
# Nine connected district loops share physical rails and junctions across the map.
xs=[-900,-550,250,900];zs=[-900,-250,350,900]
nodes={f'{x}_{z}':[x,0,z] for x in xs for z in zs}
faces=[]
for x in range(3):
 for z in range(3):faces.append([f'{xs[x]}_{zs[z]}',f'{xs[x+1]}_{zs[z]}',f'{xs[x+1]}_{zs[z+1]}',f'{xs[x]}_{zs[z+1]}'])
edges={}
for face in faces:
 for i in range(4):
  a,b=face[i],face[(i+1)%4];key='|'.join(sorted([a,b]));edges[key]={'a':a,'b':b}
# A deterministic directed Euler patrol visits every district without a dead-end.
import random
best=None;best_score=999
for attempt in range(30000):
 rng=random.Random(261025+attempt);adj={k:[] for k in nodes}
 for face in faces:
  for i in range(4):adj[face[i]].append(face[(i+1)%4])
 for items in adj.values():rng.shuffle(items)
 stack=[faces[0][0]];walk=[]
 while stack:
  if adj[stack[-1]]:stack.append(adj[stack[-1]].pop())
  else:walk.append(stack.pop())
 walk=list(reversed(walk))[:-1];score=sum(walk[i-1]==walk[(i+1)%len(walk)] for i in range(len(walk)))
 if score<best_score:best_score=score;best=walk
 if score==0:break
if best_score:raise RuntimeError('Rail patrol must not reverse through a junction')
route=[nodes[k] for k in best]
station_specs=[{'name':name,'position':p} for name,p in [
 ('Ga Nguyệt Bắc',[-850,0,-900]),('Ga Bình Minh',[850,0,-900]),('Ga Sao Nam',[850,0,900]),('Ga Hoàng Hôn',[-850,0,900]),
 ('Ga Bến Sông',[-550,0,-250]),('Ga Rừng Trăng',[-550,0,350]),('Ga Quảng Trường',[250,0,350]),('Ga Phế Tích',[250,0,-550]),('Ga Bắc Thành',[0,0,-900]),('Ga Vườn Sao',[0,0,900])]]
network={'nodes':nodes,'edges':list(edges.values()),'patrol':best,'stations':station_specs,'junctions':[k for k in nodes if sum(k in [e['a'],e['b']] for e in edges.values())>2]}

assembled={}
def instance(kind,p,yaw=0):
 for piece in models[kind]:
  vertices,faces=assembled.setdefault(piece['material'],([],[]));offset=len(vertices);cs,sn=math.cos(yaw),math.sin(yaw)
  for x,y,z in piece['vertices']:vertices.append((p[0]+cs*x+sn*z,-(p[2]-sn*x+cs*z),p[1]+y))
  ids=piece['indices'];faces.extend(tuple(offset+ids[j+k] for k in range(3)) for j in range(0,len(ids),3))
for i in range(len(route)):
 a=Vector(route[i]);b=Vector(route[(i+1)%len(route)]);d=b-a;n=math.ceil(d.length/2)
 for j in range(n):
  position=a+d*j/n;yaw=math.atan2(d.x,d.z);instance('track',position,yaw)
  instance('ballast',position,yaw)
for k in range(4):instance('engine' if k==0 else 'coach',[-850,0,-900-k*15])
for spec in station_specs:instance('station',spec['position'])
instance('driver',[-850,1.9,-904])
for mat,(vs,fs) in assembled.items():
 mesh=bpy.data.meshes.new('Railway_'+mat);mesh.from_pydata(vs,[],fs);mesh.materials.append(mats[mat]);o=bpy.data.objects.new('Railway_'+mat,mesh);scene.collection.objects.link(o)
world=bpy.data.worlds.new('RailwayWorld');world.color=(.15,.15,.15);scene.world=world
out=ROOT/'demo/features/railway/data/railway-assets.js';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('const RAILWAY_ASSETS='+json.dumps(dict(source='Blender',models=models,materials=colors,route=route,network=network),separators=(',',':'))+';\n',encoding='utf-8')
dest=ROOT/'Assets/Art/Blender/Environments/MoonRailway.blend';bpy.ops.wm.save_as_mainfile(filepath=str(dest),copy=True)
print('RAILWAY_EXPORTED',len(scene.objects),str(out))
