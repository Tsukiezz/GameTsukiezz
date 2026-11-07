"""Editable lunar terminus: vast public hall below two through tracks and six sidings."""
from pathlib import Path
import bpy, math, json
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'demo/features/railway/data/grand-terminal.js'
SOURCE=ROOT/'Assets/Art/Blender/Environments/GrandLunarTerminal.blend'
AREA=ROOT/'.runtime/grand-terminal';AREA.mkdir(parents=True,exist_ok=True)
OUT.parent.mkdir(parents=True,exist_ok=True);SOURCE.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
asset=bpy.data.collections.new('Grand Lunar Terminal - editable architecture');scene.collection.children.link(asset)
palette={'stone':('9daeb5',.12,.82),'ivory':('c8d6d6',.18,.64),'teal':('214956',.55,.48),'steel':('435c6b',.68,.48),'gold':('b69c64',.65,.5),'dark':('182b39',.3,.68),'glass':('518e9b',.5,.35),'lamp':('a8e3e8',.18,.5),'wood':('604d52',.1,.9),'blue':('327d9b',.3,.6)}
mats={}
for name,(color,metal,rough) in palette.items():
 m=bpy.data.materials.new(name);m.diffuse_color=(*[int(color[i:i+2],16)/255 for i in (0,2,4)],1);m.use_nodes=True
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough;mats[name]=m
 if name=='lamp':bs.inputs['Emission Color'].default_value=m.diffuse_color;bs.inputs['Emission Strength'].default_value=1.2
solids=[];surfaces=[]
def finish(o,name,mat):
 o.name=name
 for c in list(o.users_collection):c.objects.unlink(o)
 asset.objects.link(o);o.data.materials.append(mats[mat]);return o
def box(name,x,y,z,w,h,d,mat='stone',solid=False,walk=False):
 # Helpers use the game's Y-up coordinates; Blender coordinates are x,-z,y.
 vertices=[(x+sx*w/2,-z+sz*d/2,y+sy*h/2) for sy in [-1,1] for sz in [-1,1] for sx in [-1,1]]
 me=bpy.data.meshes.new(name);me.from_pydata(vertices,[],[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]);me.update();o=bpy.data.objects.new(name,me);asset.objects.link(o);o.data.materials.append(mats[mat])
 b={'name':name,'minX':x-w/2,'maxX':x+w/2,'minY':y-h/2,'maxY':y+h/2,'minZ':z-d/2,'maxZ':z+d/2}
 if solid:solids.append(b)
 if walk:surfaces.append(b)
 return o
def rod(name,a,b,r=.12,mat='gold',vertices=8):
 a=Vector((a[0],-a[2],a[1]));b=Vector((b[0],-b[2],b[1]));v=b-a
 rot=v.to_track_quat('Z','Y');vs=[p+rot@Vector((r*math.cos(i*math.tau/vertices),r*math.sin(i*math.tau/vertices),0)) for p in [a,b] for i in range(vertices)]
 faces=[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]+[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],faces);me.update();o=bpy.data.objects.new(name,me);asset.objects.link(o);o.data.materials.append(mats[mat]);return o
def arch(name,x,y,z,rise,span,mat='teal',thick=.22):
 pts=[(x+span*math.cos(math.pi*i/28),y+rise*math.sin(math.pi*i/28),z) for i in range(29)]
 for a,b in zip(pts,pts[1:]):rod(name,a,b,thick,mat)
def text(name,body,x,y,z,size=1,mat='gold'):
 data=bpy.data.curves.new(name,'FONT');data.body=body;data.align_x='CENTER';data.size=size;data.extrude=.015;o=bpy.data.objects.new(name,data);o.location=(x,-z,y);o.rotation_euler=(math.pi/2,0,0);asset.objects.link(o);data.materials.append(mats[mat])
def guard(name,x,y,z,w,d):
 box(name+' barrier',x,y+.72,z,w,1.44,d,'teal',True)
 box(name+' cap',x,y+1.46,z,w+.04,.12,d+.04,'gold')

# Structural grid: actual open piers and girders, never a terrain retaining wall.
box('Ground hall slab',0,-.28,0,168,.56,198,'dark',False,True)
box('Polished public floor',0,.035,0,164,.07,194,'stone',False,True)
xs=[-84,-21.1,-14.9,14.9,21.1,84];zs=[-95,-77.1,-70.9,70.9,77.1,95]
for i in range(len(xs)-1):
 for j in range(len(zs)-1):
  x=(xs[i]+xs[i+1])/2;z=(zs[j]+zs[j+1])/2;w=xs[i+1]-xs[i];d=zs[j+1]-zs[j]
  if i in [1,3] and j in [1,3]:continue
  box('Elevated railway structural deck',x,17.43,z,w,1.0,d,'teal',True,True)
  box('Railway level floor',x,17.965,z,w,.07,d,'ivory',False,True)
for x in [-77,-55,-29,0,29,55,77]:
 for z in [-84,-56,-28,0,28,56,84]:
  box('Pier foundation',x,.22,z,3.6,.44,3.6,'dark')
  box('Load-bearing pier',x,8.5,z,1.7,16.5,1.7,'stone',True)
  box('Pier teal shaft',x,8.6,z,1.88,14.5,1.88,'teal',True)
  box('Pier capital',x,16.25,z,4,1.4,3.6,'ivory')
  for s in [-1,1]:rod('Pier corbel',(x+s*.8,14.5,z),(x+s*3,16.7,z),.25,'gold')
for z in [-84,-56,-28,0,28,56,84]:
 box('Transverse railway girder',0,16.55,z,164,.7,1.2,'steel')
 for x in [-66,-42,-15,15,42,66]:
  rod('Cross bracing',(x-8,14.9,z),(x+8,16.75,z),.16,'steel')
for x in [-77,-55,-29,0,29,55,77]:box('Longitudinal girder',x,16.6,0,1.0,.7,188,'steel')

# Palace-like exterior: tall open arcade and glazed side clerestories.
for side in [-1,1]:
 x=side*83
 for z in range(-84,85,28):
  box('Facade buttress',x,15.2,z,2.8,30.4,3.0,'stone',True)
  box('Buttress gold band',x,17.2,z,3.0,.45,3.15,'gold')
  box('Buttress crown',x,30.4,z,3.8,.75,3.8,'ivory')
 for z in range(-70,85,28):
  box('Ground arcade lintel',x,13.6,z,1.6,2,25,'ivory',True)
  box('Upper clerestory sill',x,21,z,1.4,5.8,25,'stone',True)
  for dz in [-8,0,8]:
   box('Glazed moon window',x,27,z+dz,.2,5.5,6.5,'glass',True)
   box('Window gold mullion',x+side*.13,27,z+dz,.24,5.7,.17,'gold')
 # Ground side entrances remain open across all arcades.
 for z in [-94,94]:
  box('Outer clock tower',side*76,19,z,12,38,13,'stone',True)
  box('Tower recessed face',side*76,25,z+(.01 if z>0 else -.01),10,14,13.1,'teal')
  box('Tower cornice',side*76,37,z,16,1,15,'gold')
  bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=11,radius2=0,depth=8,location=(side*76,-z,42),rotation=(0,0,math.pi/4));finish(bpy.context.object,'Tower pyramidal cap','teal')
  rod('Tower spire',(side*76,45.5,z),(side*76,50,z),.22,'gold')
  for i in range(12):
   a=i*math.tau/12
   box('Clock hour',side*76+2.4*math.sin(a),32+2.4*math.cos(a),z+(-6.6 if z<0 else 6.6),.22,.45,.15,'gold')
  rod('Clock long hand',(side*76,32,z+(-6.7 if z<0 else 6.7)),(side*76+1.6,33.5,z+(-6.7 if z<0 else 6.7)),.09,'gold')
  rod('Clock short hand',(side*76,32,z+(-6.7 if z<0 else 6.7)),(side*76-.9,33.2,z+(-6.7 if z<0 else 6.7)),.12,'gold')

# Barrel vaults leave both main track portals completely unobstructed.
for center,span,rise in [(0,25,17),(-55,28,12),(55,28,12)]:
 for z in range(-91,92,14):arch('Vault rib',center,30,z,rise,span,'gold',.23)
 for i in range(14):
  a0=math.pi*i/14;a1=math.pi*(i+1)/14
  verts=[(center+span*math.cos(a),-z,30+rise*math.sin(a)) for z in [-91,91] for a in [a0,a1]]
  me=bpy.data.meshes.new('Vault panel');me.from_pydata(verts,[],[(0,1,3,2)]);me.update();o=bpy.data.objects.new('Glazed vault panel',me);asset.objects.link(o);o.data.materials.append(mats['glass' if i%3 else 'teal'])
 for i in range(1,8):
  a=math.pi*i/8;rod('Vault longitudinal purlin',(center+span*math.cos(a),30+rise*math.sin(a),-93),(center+span*math.cos(a),30+rise*math.sin(a),93),.18,'steel')
 for z in [-91,91]:
  box('Portal cornice',center,30,z,span*2+1,.6,1.2,'ivory')
  for sx in [-1,1]:
   shoulder=center+sx*span
   post=math.copysign(22,shoulder) if abs(shoulder)<29 else shoulder
   if center==0 or abs(shoulder)>=29:box('Vault portal support',post,24,z,1.1,12,1.1,'teal',True)
   if post!=shoulder:rod('Vault portal brace',(post,27,z),(shoulder,30,z),.33,'steel')

# Colored lane furniture, tiled borders, benches and ticket/service desks.
for x in [-75,-57,-39,-18,0,18,39,57,75]:
 for z in range(-80,81,8):
  if abs(x)==18 and abs(abs(z)-74)<6:continue
  box('Upper floor tile inlay',x,18.012,z,.13,.018,5.5,'teal')
for x in [-21,21]:
 for z in [-48,-24,0,24,48]:
  box('Platform bench',x,18.6,z,1.1,1.0,5,'wood',True)
  box('Platform bench back',x+(-.5 if x<0 else .5),19.0,z,.14,.9,5,'teal',True)
 for z in [-62,-35,0,35,62]:
  box('Platform lamp post',x,22,z,.25,8,.25,'teal',True)
  box('Platform lamp housing',x,25.8,z,3,.25,1.2,'gold')
  box('Platform lamp lens',x,25.62,z,2.7,.08,1,'lamp')
for side in [-1,1]:
 # Decorated peripheral mezzanines, with lift landings open at -74 and +74.
 box('Hall side balcony',side*70,8.8,0,16,.45,166,'teal',True,True)
 for z in [-60,-36,-12,12,36,60]:
  guard('Balcony balustrade',side*61.8,9.025,z,.18,20)
 for z in [-50,-20,20,50]:
  for x in [side*36,side*50]:
   box('Waiting lounge bench seat',x,.7,z,7,.45,1.6,'wood',True)
   box('Waiting lounge bench back',x,1.4,z+.74,7,1.4,.16,'teal',True)
   for dx in [-2.9,2.9]:box('Bench cast foot',x+dx,.25,z,.3,.5,1.4,'steel')
 for z in [-60,0,60]:
  box('Waiting hall information plinth',side*12,2.1,z,5.5,4.2,.6,'dark',True)
  box('Departure display',side*12,2.6,z+.32,4.9,2.6,.04,'blue')
  for y in [1.7,2.2,2.7,3.2]:box('Display arrival row',side*12,y,z+.35,4.2,.06,.02,'lamp')
 for i in range(5):
  x=side*(31+i*7)
  box('Ticket desk',x,1.2,76,5.5,2.4,3.6,'teal',True)
  box('Ticket desk top',x,2.5,76,5.8,.2,3.9,'stone')
  box('Ticket terminal',x,3.05,76,1.6,.9,.12,'blue',True)
 for z in [-68,-40,-12,16,44,68]:
  box('Hall hanging light',side*40,14.7,z,13,.3,1,'gold')
  box('Hall luminaire',side*40,14.5,z,12.4,.08,.7,'lamp')
 for z in [-86,86]:
  box('Station direction board',side*36,6.5,z,34,3,.45,'teal',True)
  text('Hall signage','BEN XE LUA TSUKIEZZ',side*36,6,z+(.25 if z>0 else -.25),1.5)

# Reserve rails: three independent berths on each side, 18m apart.
for side in [-1,1]:
 for lane,x in enumerate([30,48,66]):
  x*=side
  box('Reserve ballast bed',x,18.07,0,6,.14,172,'dark')
  for z in range(-84,85,2):box('Reserve track sleeper',x,18.18,z,5.5,.16,.45,'wood')
  for sx in [-1,1]:box('Reserve steel rail',x+sx*2.15,18.34,0,.17,.22,174,'steel')
  box('Reserve berth sign',x,27.3,-82,9,2,.3,'teal')
  text('Reserve identifier',('F' if side>0 else 'R')+str(lane+1),x,26.8,-82.2,1.25)

for z in [-95,95]:
 # The six berths have rear arrivals as well as front departures.
 guard('Upper end balustrade',0,18,z,8,.2)
 for side in [-1,1]:
  for a,b in [(14,25.7),(34.3,43.7),(52.3,61.7),(70.3,84)]:
   guard('Upper end balustrade',(a+b)/2*side,18,z,b-a,.2)

bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();bins={}
for obj in asset.objects:
 if obj.type not in ('MESH','CURVE','FONT'):continue
 ev=obj.evaluated_get(deps);g=ev.to_mesh();g.calc_loop_triangles();m=obj.matrix_world;nmat=m.to_3x3().inverted().transposed()
 for tri in g.loop_triangles:
  key=obj.data.materials[tri.material_index].name;d=bins.setdefault(key,{'positions':[],'normals':[],'indices':[],'lookup':{}})
  for li in tri.loops:
   p=m@g.vertices[g.loops[li].vertex_index].co;n=(nmat@g.corner_normals[li].vector).normalized();v=tuple(round(x,4) for x in (p.x,p.z,-p.y,n.x,n.z,-n.y))
   if v not in d['lookup']:d['lookup'][v]=len(d['positions'])//3;d['positions'].extend(v[:3]);d['normals'].extend(v[3:])
   d['indices'].append(d['lookup'][v])
 ev.to_mesh_clear()
parts=[]
for mat,d in bins.items():
 del d['lookup'];parts.append({'material':mat,**d})
data={'version':1,'source':'Assets/Art/Blender/Environments/GrandLunarTerminal.blend','palette':{k:{'color':'#'+v[0],'metalness':v[1],'roughness':v[2]} for k,v in palette.items()},'parts':parts,'solids':solids,'surfaces':surfaces,'width':168,'length':198,'deckY':18,'reserveTracks':[-66,-48,-30,30,48,66],'sourceObjects':len(asset.objects),'triangles':sum(len(p['indices'])//3 for p in parts)}
OUT.write_text('window.GRAND_TERMINAL_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(AREA/'art-report.json').write_text(json.dumps({k:v for k,v in data.items() if k not in ('parts','solids','surfaces')},indent=2),encoding='utf8')
# Include the actual Blender-authored railway vehicles in the editable scene.
# Runtime keeps these separate, shares their geometries and dispatches only the
# six existing service trains. This preview collection is never exported twice.
preview=bpy.data.collections.new('Reserve trains - six liveries - not exported twice');scene.collection.children.link(preview)
raw=(ROOT/'demo/features/railway/data/railway-assets.js').read_text(encoding='utf8');rail=json.JSONDecoder().raw_decode(raw[raw.index('=')+1:])[0]
rail_mats={}
for key,rgb in rail['materials'].items():
 m=bpy.data.materials.new('Rail_'+key);m.diffuse_color=(*rgb[:3],1);rail_mats[key]=m
for name,color,x,direction in [('Orange','ed903a',30,1),('Pink','d878a9',48,1),('White','e2e8e5',66,1),('Gray','858e9b',-30,-1),('Brown','84563e',-48,-1),('Beige','c5b48d',-66,-1)]:
 paint=bpy.data.materials.new('Reserve '+name);paint.diffuse_color=(*[int(color[i:i+2],16)/255 for i in (0,2,4)],1)
 for coach in range(4):
  bins={}
  for piece in rail['models']['coach' if coach else 'engine']:
   key=piece['material'];b=bins.setdefault(key,{'v':[],'f':[]});offset=len(b['v'])
   b['v'].extend((x+direction*p[0],-direction*(p[2]+30-coach*15),18.24+p[1]) for p in piece['vertices']);indices=piece['indices'];b['f'].extend(tuple(offset+j for j in indices[i:i+3]) for i in range(0,len(indices),3))
  for key,b in bins.items():
   me=bpy.data.meshes.new(name+' vehicle');me.from_pydata(b['v'],[],b['f']);me.update();obj=bpy.data.objects.new(name+(' locomotive' if not coach else ' coach '+str(coach)),me);preview.objects.link(obj);me.materials.append(paint if key=='red' else rail_mats[key])
# An editable overview camera; preview uses Workbench for fast reproducible review.
bpy.ops.object.camera_add(location=(220,260,175));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,18))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=310;scene.camera=cam
scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True
scene.render.resolution_x=1500;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.filepath=str(AREA/'blender-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));bpy.ops.render.render(write_still=True)
print('GRAND_TERMINAL_READY',data['sourceObjects'],data['triangles'],len(parts),flush=True)
