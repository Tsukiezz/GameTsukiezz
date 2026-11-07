"""Blender sources, renderable game meshes and transparent inventory portraits."""
from pathlib import Path
import bpy, math, json
from mathutils import Vector, Matrix
R=Path(__file__).resolve().parents[1];OUT=R/'demo/features/inventory/assets/progression';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=R/'Assets/Art/Blender/Inventory/SurvivalTreasuryStudio.blend';SOURCE.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='BLENDER_WORKBENCH';scene.render.resolution_x=scene.render.resolution_y=320;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
shade=scene.display.shading;shade.light='STUDIO';shade.color_type='MATERIAL';shade.show_shadows=True;shade.show_cavity=True;shade.cavity_type='BOTH';shade.show_object_outline=True;shade.object_outline_color=(.035,.055,.075)
colors={'wood':'6d432c','grain':'b17a43','dark':'202b3c','iron':'a5b8c9','edge':'e0f5ed','gold':'d2aa4e','red':'9c303d','black':'18232c','green':'286e49','mint':'72e4b6','blue':'68bade','ice':'b4edf5','purple':'805bc9','lava':'f18632','orange':'e1a644','cream':'f4dca9','chocolate':'603829','pink':'dc92b3','stone':'69717e'};mats={}
for name,h in colors.items():
 c=tuple(int(h[i:i+2],16)/255 for i in (0,2,4));m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;m.node_tree.nodes.clear();bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Roughness'].default_value=.45;bs.inputs['Metallic'].default_value=.6 if name in ['iron','gold','edge'] else .05;o=m.node_tree.nodes.new('ShaderNodeOutputMaterial');o.is_active_output=True;m.node_tree.links.new(bs.outputs['BSDF'],o.inputs['Surface']);mats[name]=m
models={};current=None;mount='body'
def finish(o,name,color,loc=(0,0,0),scale=(1,1,1),rot=(0,0,0)):
 o.name=current.name+'_'+name;o.parent=current;o.location=loc;o.scale=scale;o.rotation_euler=rot;o.data.materials.append(mats[color]);o['mount']='lid' if current.name.startswith('chest_') and (name in ['arched lid','lid band'] or loc[2]>1.18) else mount;return o
def box(name,col,p,size,rot=(0,0,0),bevel=.035):
 bpy.ops.mesh.primitive_cube_add(size=1);o=finish(bpy.context.object,name,col,p,size,rot)
 if bevel:b=o.modifiers.new('Crafted bevel','BEVEL');b.width=bevel;b.segments=2;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def ball(name,col,p,size=(1,1,1),ico=False):
 if ico:bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1)
 else:bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1)
 return finish(bpy.context.object,name,col,p,size)
def cylinder(name,col,p,r,d,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=d);return finish(bpy.context.object,name,col,p,rot=rot)
def cone(name,col,p,r,d,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=r,radius2=0,depth=d);return finish(bpy.context.object,name,col,p,rot=rot)
def ring(name,col,p,r,t,rot=(0,0,0)):
 bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=20,minor_segments=6);return finish(bpy.context.object,name,col,p,rot=rot)
def wire(name,col,points,r=.035):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=1;s=c.splines.new('POLY');s.points.add(len(points)-1)
 for q,p in zip(s.points,points):q.co=(*p,1)
 o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);return finish(o,name,col)
def blade(name,col,length=1.85,width=.2):
 v=[(0,0,length),(-width,-.04,.5),(width,-.04,.5),(-width,.04,.5),(width,.04,.5),(0,-.08,1.05),(0,.08,1.05)];f=[(0,1,5),(0,5,2),(1,2,5),(0,6,3),(0,4,6),(3,6,4),(1,3,4,2),(0,3,1),(0,2,4)];m=bpy.data.meshes.new(name);m.from_pydata(v,[],f);m.update();o=bpy.data.objects.new(name,m);scene.collection.objects.link(o);return finish(o,name,col)
def new(kind):
 global current,mount
 current=bpy.data.objects.new(kind,None);scene.collection.objects.link(current);models[kind]=current;mount='body'
new('forest_heart')
# Crystalline heart embraced by living bark, roots and asymmetric foliage.
outline=[]
for i in range(64):
 t=math.tau*i/64;x=16*math.sin(t)**3/22;z=(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))/22+1.05;outline.append((x,z))
vs=[(0,-.3,1.12),(0,.25,1.12)]+[(x,0,z) for x,z in outline];fs=[]
for i in range(64):j=2+i;k=2+(i+1)%64;fs.extend([(0,k,j),(1,j,k)])
me=bpy.data.meshes.new('Emerald heart facets');me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new('Emerald heart facets',me);scene.collection.objects.link(ob);finish(ob,'living emerald heart','green')
for side in [-1,1]:
 wire('ancient root embrace','wood',[(0,0,.2),(side*.43,.03,.45),(side*.73,.04,1.08),(side*.63,.05,1.56)],.065)
 wire('golden sap vein','gold',[(0,-.31,.45),(side*.15,-.31,.9),(side*.36,-.2,1.28)],.018)
 for i in range(3):
  leaf=ball('living leaf','mint' if i==2 else 'green',(side*(.65-i*.06),0,1.38+i*.16),(.11,.055,.25),True);leaf.rotation_euler.y=side*(.7-i*.35)
ball('heart seed light','mint',(0,-.32,1.12),(.16,.065,.24),True)
new('cave_bat')
ball('furry body','dark',(0,0,.5),(.2,.15,.35));ball('head','black',(0,-.02,.83),(.22,.17,.2))
for side in [-1,1]:
 cone('pointed ear','dark',(side*.15,0,1.09),.12,.36,(0,side*.2,0));ball('eye','orange',(side*.09,-.17,.86),(.035,.025,.04));cone('fang','edge',(side*.065,-.17,.69),.024,.1,(math.pi,0,0))
 mount='wing_L' if side<0 else 'wing_R'
 points=[(side*.14,0,.63),(side*.55,.04,1.04),(side*1.03,.08,.93),(side*.87,-.015,.49),(side*.65,-.025,.64),(side*.48,-.025,.33),(side*.31,-.025,.48),(side*.14,0,.31)]
 me=bpy.data.meshes.new('Scalloped wing membrane');me.from_pydata(points,[],[(0,i,i+1) for i in range(1,len(points)-1)]);me.update();o=bpy.data.objects.new('Wing membrane',me);scene.collection.objects.link(o);finish(o,'scalloped wing membrane','purple')
 wire('wing leading bone','dark',points[:3],.025)
 for i in [3,5,7]:wire('wing finger','dark',[points[1],points[i]],.014)
mount='body'
new('cordyceps')
ball('moss bed','green',(0,0,.2),(.73,.5,.18));ball('root bark','wood',(0,0,.25),(.61,.37,.22),True)
for i in range(11):
 a=i*2.4;x=math.cos(a)*(.12+i*.038);y=math.sin(a)*(.1+i*.023);h=.8+(i%4)*.19;wire('curved fruit stem','orange',[(x,y,.3),(x*.9,y-.08,.6),(x+.07*math.sin(i),y,h),(x+.12*math.sin(i),y,h+.1)],.05);ball('fruiting tip','lava',(x+.12*math.sin(i),y,h+.1),(.075,.075,.13));
for i in range(5):ball('spore','cream',(.25*math.cos(i*2.1),-.08,1.45+i*.055),(.025,.025,.025))
new('galactic_lava')
ball('molten cosmic core','purple',(0,0,.9),(.65,.62,.72),True);ball('blue rift','blue',(0,-.36,.92),(.38,.2,.45),True)
for i in range(9):
 a=i*2.4;ball('fractured obsidian','black',(.58*math.cos(a),.53*math.sin(a),.6+(i%3)*.27),(.37,.29,.35),True)
for i in range(3):ring('stellar orbit','gold' if i==0 else 'lava',(0,0,.9),.76+i*.03,.025,(.5+i*.7,.3,i*.65))
cone('flame tongue','lava',(.08,0,1.75),.18,.65,(0,-.18,0));cone('violet flame','purple',(-.2,.06,1.6),.12,.5,(0,.4,0))
new('eternal_ember')
ball('fire stone','lava',(0,0,.86),(.45,.4,.73),True);ball('inner sun','cream',(0,-.31,.88),(.22,.12,.38),True)
for i in range(3):ring('eternal binding','gold',(0,0,.65+i*.18),.55,.035,(i*.55,.25,i*.7))
for s in [-1,1]:cone('upward flame','orange',(s*.25,0,1.35),.18,.8,(0,s*.32,0));box('basalt claw','dark',(s*.47,0,.38),(.2,.5,.65),(0,s*.35,0))
for kind in ['iron_sword','forest_sword']:
 new(kind)
 if kind=='iron_sword':blade('forged blade','iron',1.9,.17)
 else:
  # A tapered, faceted silver leaf: a real metal edge, not a broad green cone.
  sections=[(.52,.15),(.69,.26),(.94,.23),(1.04,.29),(1.18,.225),(1.65,.135),(2.22,0)]
  vertices=[];faces=[]
  for z,w in sections:vertices.extend([(-w,0,z),(0,-.075,z),(w,0,z),(0,.075,z)])
  for i in range(len(sections)-1):
   for j in range(4):a=i*4+j;b=i*4+(j+1)%4;faces.append((a,b,b+4,a+4))
  faces.extend([(3,2,1,0),(24,25,26,27)])
  mesh=bpy.data.meshes.new('Silver leaf blade');mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new('Silver leaf blade',mesh);scene.collection.objects.link(o);finish(o,'silver leaf blade','edge')
  blade('emerald inlaid fuller','green',2.05,.115)
  for side in [-1,1]:
   wire('golden root inlay','gold',[(0,-.082,.65),(side*.07,-.085,.95),(side*.04,-.073,1.3),(0,-.06,1.83)],.009)
   wire('forged branch guard','gold',[(0,0,.49),(side*.2,0,.47),(side*.36,0,.6),(side*.39,0,.75)],.045)
   leaf=ball('carved guard leaf','green',(side*.3,0,.64),(.1,.055,.23),True);leaf.rotation_euler.y=side*.65
  ball('heart socket','gold',(0,-.055,.54),(.15,.085,.18),True);ball('cut emerald heart','mint',(0,-.135,.56),(.105,.055,.13),True)
 cylinder('wrapped hilt','wood',(0,0,.25),.075,.42);ball('pommel','iron' if kind=='iron_sword' else 'gold',(0,0,.015),(.11,.1,.12))
 if kind=='iron_sword':box('guard','iron',(0,0,.48),(.62,.13,.11))
 for i in range(6):ring('hilt binding','dark' if kind=='iron_sword' else 'gold',(0,0,.1+i*.055),.077,.009)
new('samurai_armor')
box('undercoat','black',(0,0,1.22),(1.02,.48,1.05))
for z in [.85,1.03,1.21,1.39,1.57]:
 for s in [-1,1]:box('lacquered cuirass lame','red',(s*.26,-.05,z),(.51,.58,.16));box('gilt rivet','gold',(s*.43,-.36,z),(.05,.025,.06))
for s in [-1,1]:
 for i in range(3):box('skirt kusazuri','red',(s*(.3+i*.025),-.02,.62-i*.16),(.52,.57,.15),(0,s*.07,0))
mount='head';ball('kabuto helmet','black',(0,0,2.05),(.64,.53,.53));box('helmet brow','red',(0,-.45,2.04),(1.15,.17,.17));box('menpo mask','red',(0,-.39,1.8),(.7,.17,.35));box('mask mouth','black',(0,-.5,1.76),(.39,.04,.07))
for s in [-1,1]:
 wire('crescent crest','gold',[(s*.14,-.4,2.3),(s*.39,-.38,2.49),(s*.5,-.3,2.8),(s*.28,-.25,2.69)],.065)
 for i in range(3):box('neck guard','red',(s*.54,.02,1.94-i*.13),(.23,.67,.13),(0,s*.2,0))
for s,side in [(-1,'arm_L'),(1,'arm_R')]:
 mount=side
 for i in range(4):box('sode shoulder lames','red',(s*.84,0,1.53-i*.15),(.42,.65,.13),(0,s*.15,0));box('sode gold fastening','gold',(s*1.02,-.33,1.53-i*.15),(.04,.03,.065))
for kind in ['basic','castle','cavern','volcanic','ice','forest','candy','desert','void']:
 new('chest_'+kind);base={'basic':'wood','castle':'stone','cavern':'dark','volcanic':'black','ice':'blue','forest':'wood','candy':'chocolate','desert':'gold','void':'dark'}[kind];trim='iron' if kind=='basic' else 'gold';box('treasure body',base,(0,0,.52),(2.2,1.32,.9),bevel=.06)
 if kind in ['basic','forest','candy']:
  for x in [-.8,-.4,0,.4,.8]:box('front panel grain','grain' if kind!='candy' else 'cream',(x,-.675,.55),(.025,.025,.7))
 # An arched lid with ribs, hinges, corner feet and a real frontal lock.
 v=[];f=[]
 for i in range(13):
  a=i*math.pi/12
  for x in [-1.12,1.12]:v.append((x,.68*math.cos(a),.99+.38*math.sin(a)))
  if i<12:k=i*2;f.append((k,k+1,k+3,k+2))
 for side in [0,1]:
  k=len(v);v.append(([-1.12,1.12][side],0,.99))
  for i in range(12):f.append((k,i*2+side,(i+1)*2+side) if side else (k,(i+1)*2+side,i*2+side))
 me=bpy.data.meshes.new('arched lid');me.from_pydata(v,[],f);me.update();ob=bpy.data.objects.new('arched lid',me);scene.collection.objects.link(ob);finish(ob,'arched lid',base)
 for x in [-.78,.78]:wire('lid band',trim,[(x,.7*math.cos(i*math.pi/20),1+.39*math.sin(i*math.pi/20)) for i in range(21)],.047);box('front band',trim,(x,-.69,.55),(.11,.06,.8))
 for x in [-.95,.95]:
  for y in [-.51,.51]:box('corner foot',trim,(x,y,.09),(.25,.28,.18));ball('corner rivet',trim,(x,-.7,.55),(.04,.025,.04))
 box('lock plate',trim,(0,-.72,.79),(.34,.09,.4));ball('keyhole','black',(0,-.78,.78),(.045,.018,.07))
 if kind=='castle':
  for x in [-.7,0,.7]:cone('gothic crown finial','gold',(x,0,1.55),.11,.37)
  ring('moon heraldry','blue',(0,-.8,.9),.18,.045,(math.pi/2,0,0));box('heraldic shield','dark',(0,-.75,.59),(.6,.06,.4))
 elif kind=='cavern':
  ball('cursed eye','purple',(0,-.83,.95),(.22,.06,.16));box('vertical pupil','black',(0,-.89,.95),(.035,.02,.2))
  for x in [-.6,-.3,.3,.6]:cone('stone fangs','edge',(x,-.68,1.05),.07,.26,(math.pi,0,0))
 elif kind=='volcanic':
  for i in range(7):cone('obsidian spine','black',(-.9+i*.3,.12,1.38),.15,.35+(i%2)*.2,(0,(i-3)*.1,0))
  for x in [-.55,.55]:wire('lava crack','lava',[(x,-.72,.15),(x+.1,-.73,.5),(x-.1,-.73,.8),(x+.1,-.7,1.1)],.025)
 elif kind=='ice':
  for x in [-.95,.95]:ball('glacier corner','ice',(x,0,1.08),(.22,.29,.5),True)
  for i in range(5):wire('snowflake spokes','ice',[(0,-.81,.8),(.24*math.sin(i*math.tau/5),-.81,.8+.24*math.cos(i*math.tau/5))],.024)
 elif kind=='forest':
  for s in [-1,1]:wire('living roots','green',[(s*1.05,.3,.05),(s*1.19,-.3,.38),(s*.7,-.72,.54),(s*.4,-.74,1.15)],.055);cone('sprouting leaf','green',(s*.58,0,1.51),.16,.53,(0,s*.8,0))
 elif kind=='candy':
  for x in [-.7,0,.7]:cylinder('biscuit medallion','cream',(x,-.75,.55),.21,.08,(math.pi/2,0,0));ball('chocolate chip','chocolate',(x,-.81,.6),(.055,.03,.045))
  for s in [-1,1]:wire('striped candy handle','pink',[(s*1.05,.1,1.16),(s*1.05,.1,1.55),(s*.7,.1,1.65)],.075)
 elif kind=='desert':
  for i in range(4):box('pyramid lid step','gold',(0,0,1.37+i*.11),(1.1-i*.22,.9-i*.18,.11),bevel=.015)
  ball('lapis seal','blue',(0,-.83,.78),(.18,.05,.27),True)
 elif kind=='void':
  for s in [-1,1]:box('containment rail','iron',(s*.95,0,.72),(.16,1.5,1.1));box('blue status strip','blue',(s*.5,-.73,.5),(.42,.03,.08))
  ball('hex void lock','purple',(0,-.82,.83),(.21,.07,.21),True);ring('containment coil','blue',(0,0,1.4),.43,.028)

# Reference-led engineering wall: two side benches and a central server console.
new('engineering_workstation')
for x in [-7.8,-3,3,7.8]:box('steel upright','dark',(x,.48,2.65),(.15,.2,5.3))
for x in [-5.4,5.4]:
 box('stainless worktop','iron',(x,-.18,1.85),(4.65,2.1,.17));box('lower shelf','dark',(x,-.02,.35),(4.7,1.85,.15));box('toolboard frame','iron',(x,.67,3.2),(4.75,.16,2.5));box('perforated backboard','stone',(x,.56,3.2),(4.5,.08,2.28))
 for dx in [-2.12,2.12]:box('bench leg','dark',(x+dx,-.06,.95),(.18,1.75,1.8))
 box('task light housing','dark',(x,-.13,4.62),(4.95,.48,.19));box('white task diffuser','edge',(x,-.34,4.57),(4.65,.09,.075))
 for ix in range(16):
  for iz in range(7):box('pegboard perforation','black',(x-2.05+ix*.27,.507,2.2+iz*.31),(.035,.012,.035),bevel=0)
 for dx,col in [(-1.35,'dark'),(0,'green'),(1.35,'gold')]:
  box('equipment case',col,(x+dx,-.05,.62),(1.12,1.2,.4));box('case handle','iron',(x+dx,-.68,.64),(.32,.07,.1))
 for dx in [-1.5,-.5,.5,1.5]:box('component bin','black',(x+dx,.12,1.24),(.86,1.23,.42));box('bin lip','iron',(x+dx,-.52,1.1),(.9,.05,.14))
box('central console plinth','dark',(0,.1,.26),(5.8,1.8,.35));box('main display surround','black',(0,.3,3.55),(5.85,.35,3.35));box('main display glass','dark',(0,.105,3.55),(5.42,.045,2.94))
for x in [-2,0,2]:
 box('server rack','dark',(x,.12,1.05),(1.85,1.65,1.42))
 for z in [.65,.98,1.31]:
  box('rack drawer','black',(x,-.74,z),(1.66,.12,.26));box('server label','iron',(x-.5,-.82,z),(.38,.02,.07))
  for dx in [.34,.5,.66]:box('status diode','mint',(x+dx,-.82,z),(.055,.035,.055),bevel=0)
for x in [-3.05,3.05]:box('display protection rail','iron',(x,.22,3.4),(.13,.5,3.7))
box('console canopy','dark',(0,.18,5.55),(6.5,.72,.24));box('canopy task diffuser','edge',(0,-.2,5.49),(6.1,.09,.09))
for x in [-2.65,2.65]:wire('overhead conduit','iron',[(x,.65,4.9),(x,.66,5.6),(x,.66,5.9),(x*.8,.66,6.05)],.055)
# Left: storage bins, pliers, wrenches and suspended cable reels.
for z in [2.2,2.6,3,3.4,3.8]:
 for x in [-7.18,-6.66]:box('small parts tray','dark',(x,.35,z),(.46,.35,.21))
for x in [-5.8,-5.25,-4.7]:
 wire('pliers steel jaw','iron',[(x-.1,.36,3.78),(x,.36,3.52),(x+.13,.36,3.8)],.035)
 for s in [-1,1]:wire('pliers red grip','red',[(x,.36,3.5),(x+s*.11,.35,3.18),(x+s*.13,.35,3.02)],.045)
for x in [-4.15,-3.63]:
 for z in [2.75,3.35,3.95]:ring('cable reel','iron',(x,.36,z),.16,.04,(math.pi/2,0,0))
for x in [-6.6,-4.6]:ring('coiled service cable','black',(x,-.25,1.96),.31,.035)
# Right: CAD terminal, keyboard, electronics trays and a framed 3D printer.
box('secondary monitor','black',(4.45,.13,2.95),(2.18,.22,1.46));box('monitor stand','iron',(4.45,.22,2.18),(.15,.25,.5));box('keyboard','dark',(4.45,-.55,1.99),(1.65,.56,.1))
for i in range(10):box('keyboard keys','iron',(3.75+i*.15,-.55,2.05),(.09,.34,.035),bevel=0)
for x in [6.3,7.5]:
 for y in [-.55,.62]:box('printer column','dark',(x,y,2.75),(.1,.1,1.62))
box('printer roof','black',(6.9,.03,3.6),(1.48,1.42,.14));box('printer build plate','iron',(6.9,.03,2.12),(1.35,1.3,.12));box('printer carriage rail','iron',(6.9,.04,3.18),(1.4,.1,.1));box('extruder head','red',(6.9,.04,3.04),(.26,.24,.25));cone('nozzle','gold',(6.9,.04,2.85),.06,.16,(math.pi,0,0));ball('printed specimen','red',(6.9,.04,2.4),(.16,.14,.25),True)
for x in [3.7,4.6,5.45]:box('electronics module','blue',(x,-.15,2.02),(.5,.5,.15))

# Bake local authored meshes into a compact Three.js Y-up material/mount layout.
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();export={};metadata={}
for kind,root in models.items():
 bins={};triangles=0
 for o in root.children:
  if o.type not in ['MESH','CURVE']:continue
  e=o.evaluated_get(deps);me=e.to_mesh();me.calc_loop_triangles();matrix=root.matrix_world.inverted()@o.matrix_world;normal=matrix.to_3x3().inverted().transposed();key=(o.data.materials[0].name,o.get('mount','body'));b=bins.setdefault(key,{'positions':[],'normals':[],'indices':[]})
  # Export triangle corners to preserve bevel and smooth normals correctly.
  for tri in me.loop_triangles:
   for li in tri.loops:
    v=me.vertices[me.loops[li].vertex_index];p=matrix@v.co;n=(normal@me.corner_normals[li].vector).normalized();b['indices'].append(len(b['positions'])//3);b['positions'].extend(round(q,5) for q in (p.x,p.z,-p.y));b['normals'].extend(round(q,5) for q in (n.x,n.z,-n.y))
   triangles+=1
  e.to_mesh_clear()
 parts=[{'material':k[0],'color':colors[k[0]],'mount':k[1],**b} for k,b in bins.items()];export[kind]={'parts':parts,'triangles':triangles};metadata[kind]={'objects':len(root.children),'triangles':triangles}
target=R/'demo/features/inventory/data/survival-items.js';target.parent.mkdir(parents=True,exist_ok=True);target.write_text('window.SURVIVAL_ITEM_DATA='+json.dumps({'source':str(SOURCE.relative_to(R)).replace('\\','/'),'models':export},separators=(',',':'))+';\n',encoding='utf8')
bpy.ops.object.camera_add(location=(3.5,-5,3.1));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=3.5;scene.camera=camera
for kind,root in models.items():
 for other in models.values():
  for o in other.children:o.hide_render=other!=root
 if kind=='engineering_workstation':
  camera.location=(10,-20,10);camera.rotation_euler=(Vector((0,0,2.8))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=19
 scene.render.filepath=str(OUT/(kind+'.png'));bpy.ops.render.render(write_still=True);print('RENDERED',kind,flush=True)
for i,root in enumerate(models.values()):
 for o in root.children:o.hide_render=False
 root.location=((i%5)*3.5,(i//5)*3.8,0)
camera.location=(11,-13,19);camera.rotation_euler=(Vector((7,4,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=22
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));(OUT/'manifest.json').write_text(json.dumps({'source':str(SOURCE.relative_to(R)).replace('\\','/'),'blender':bpy.app.version_string,'models':metadata},indent=2),encoding='utf8');print('SURVIVAL_STUDIO_COMPLETE',len(models),flush=True)
