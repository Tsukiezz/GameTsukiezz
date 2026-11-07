"""Editable Blender crash-site rocket, selectively exported for the existing HQ."""
from pathlib import Path
import bpy, math, json
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'Assets/Art/Blender/Props/RuinedTechnologyRocket.blend'
OUT=ROOT/'demo/features/technology/data/ruined-rocket.js'
REPORT=ROOT/'.runtime/technology-rocket';REPORT.mkdir(parents=True,exist_ok=True)
SOURCE.parent.mkdir(parents=True,exist_ok=True);OUT.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
asset=bpy.data.collections.new('TSU07_RuinedLunarExplorer');scene.collection.children.link(asset)
root=bpy.data.objects.new('TSU07_Root',None);asset.objects.link(root)
root['purpose']='Damaged decorative lunar exploration rocket at the technology headquarters'
palette={
 'ivory':('d6ddd9',.12,.68),'teal':('245e70',.32,.54),'steel':('687d8c',.65,.44),
 'dark':('233541',.45,.65),'gold':('bb9458',.55,.5),'burnt':('363230',.1,.95),
 'rust':('83553c',.35,.88),'glass':('427f91',.6,.24),'gasket':('171e25',.0,.85),
 'copper':('b18055',.55,.5),'lamp':('77caca',.1,.45),'ground':('45494a',.0,1.)}
materials={}
for name,(color,metal,rough) in palette.items():
 m=bpy.data.materials.new(name);rgb=tuple(int(color[i:i+2],16)/255 for i in (0,2,4));m.diffuse_color=(*rgb,1);m.use_nodes=True
 # Node names are localized on this Blender installation; never look them up by English name.
 m.node_tree.nodes.clear();bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');output=m.node_tree.nodes.new('ShaderNodeOutputMaterial');output.is_active_output=True;m.node_tree.links.new(bs.outputs['BSDF'],output.inputs['Surface']);bs.inputs['Base Color'].default_value=(*rgb,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if name=='lamp':bs.inputs['Emission Color'].default_value=(*rgb,1);bs.inputs['Emission Strength'].default_value=.35
 materials[name]=m

def finish(obj,name,material,smooth=False,bevel=0):
 obj.name=name
 for c in list(obj.users_collection):c.objects.unlink(obj)
 asset.objects.link(obj);obj.parent=root;obj.data.materials.append(materials[material])
 if obj.type=='MESH':
  for p in obj.data.polygons:p.use_smooth=smooth
 if bevel:
  mod=obj.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=2
 return obj
def box(name,p,size,mat='steel',rot=(0,0,0),bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.scale=size;o.rotation_euler=rot
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,mat,False,bevel)
def sphere(name,p,size,mat='steel'):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=p);o=bpy.context.object;o.scale=size;return finish(o,name,mat,True)
def cylinder(name,p,r,depth,mat='steel',rot=(0,math.pi/2,0),r2=None,vertices=24):
 bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r,radius2=r if r2 is None else r2,depth=depth,location=p,rotation=rot)
 return finish(bpy.context.object,name,mat,True,.025)
def curve(name,points,thickness,mat='copper',poly=False):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=thickness;data.bevel_resolution=1;data.resolution_u=4
 s=data.splines.new('POLY' if poly else 'BEZIER')
 if poly:
  s.points.add(len(points)-1)
  for b,p in zip(s.points,points):b.co=(*p,1)
 else:
  s.bezier_points.add(len(points)-1)
  for b,p in zip(s.bezier_points,points):b.co=p;b.handle_left_type=b.handle_right_type='AUTO'
 obj=bpy.data.objects.new(name,data);asset.objects.link(obj);obj.parent=root;data.materials.append(materials[mat]);return obj
def ring(name,x,r,mat='steel',thickness=.09,center=(0,3.2)):
 points=[(x,center[0]+r*math.cos(i*math.tau/40),center[1]+r*math.sin(i*math.tau/40)) for i in range(41)]
 return curve(name,points,thickness,mat,True)
def mesh(name,verts,faces,mat='ivory',smooth=False):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);asset.objects.link(o);o.parent=root;data.materials.append(materials[mat])
 for p in data.polygons:p.use_smooth=smooth
 return o
def hull(name,stations,mat='ivory',broken=False,center=3.2):
 n=40;verts=[]
 for j,(x,r) in enumerate(stations):
  for i in range(n):
   a=i*math.tau/n;damage=(.28*math.sin(i*2.1)+.22*math.cos(i*4.3)) if broken and j==len(stations)-1 else 0
   verts.append((x+damage,r*math.cos(a),center+r*math.sin(a)))
 faces=[]
 for j in range(len(stations)-1):
  for i in range(n):
   if broken and j>=len(stations)-2 and 8<=i<=14:continue
   k=(i+1)%n;faces.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
 o=mesh(name,verts,faces,mat,True);solid=o.modifiers.new('Hull wall thickness','SOLIDIFY');solid.thickness=.085;return o

# Main fuselage: curved shoulder, broken open end and a darker visible inner skin.
hull('Ivory pressure hull',[(-8.6,1.9),(-8.1,2.25),(-6.8,2.4),(-2,2.4),(1.8,2.35),(3.65,2.3),(5.0,2.2)],broken=True)
hull('Interior of torn hull',[(1.6,2.1),(3.65,2.1),(4.8,2.05)],'dark',True)
for x in [-7.9,-6.6,-1.4,1.2,3.7]:ring('Structural hoop',x,2.42,'steel',.065)
hull('Royal teal livery',[(-6.2,2.417),(-3.6,2.417)],'teal')
for x in [-6.22,-3.58]:ring('Gold livery edging',x,2.43,'gold',.055)
for x0,x1,a0,a1 in [(2.6,4.3,2.8,3.7),(-8.0,-6.8,2.6,3.5)]:
 verts=[]
 for x in [x0,x1]:
  for i in range(9):
   a=a0+(a1-a0)*i/8;r=(2.38 if x>0 else 2.3)+.045;verts.append((x+.08*math.sin(i*2.2),r*math.cos(a),3.2+r*math.sin(a)))
 mesh('Heat-scoured hull skin',verts,[(i,i+1,i+10,i+9) for i in range(8)],'burnt',True)
for x in [-7.6,-6.8,-2.7,-1.9,.5,1.3,3.0]:
 for a in [-2.35,-.8,.2,1.1]:
  y,z=2.415*math.cos(a),3.2+2.415*math.sin(a)
  sphere('Inset hull rivet',(x,y,z),(.055,.065,.065),'gold' if x< -3 else 'steel')

# Fractured ribs and power conduits visible through the split nose junction.
for i in range(9):
 a=i*math.tau/9;y,z=1.85*math.cos(a),3.2+1.85*math.sin(a)
 curve('Broken longitudinal rib',[(2.9,y,z),(4.5,y,z),(5.5+.15*math.sin(i),y*.9,z-.28)],.09,'rust' if i%3==0 else 'steel')
for i in range(6):
 y=-1.45+i*.4
 curve('Torn wiring harness',[(3.1,y,3.15),(4.6,y,3.0),(5.8,y-.25,1.65),(6.5,y+.1,2.0)],.045,'copper' if i%2 else 'gasket')
cylinder('Exposed reactor bulkhead',(2.2,0,3.2),1.8,.12,'dark')
for a in [i*math.tau/6 for i in range(6)]:cylinder('Bulkhead connector',(2.35,1.2*math.cos(a),3.2+1.2*math.sin(a)),.22,.3,'gold',vertices=12)

# Detached, dented command nose with a small glazed cockpit and cracks.
nose=hull('Detached command nose',[(6.75,2.05),(7.3,2.05),(8.8,1.7),(10.2,1.15),(11.8,.48),(12.7,.07)],'ivory',center=2.65)
ring('Separated nose lip',6.76,2.06,'rust',.12,(0,2.65))
sphere('Cockpit metal rim',(8.7,-1.5,3.65),(1.18,.21,.7),'dark')
sphere('Dark cyan cockpit glazing',(8.7,-1.67,3.67),(1.02,.085,.55),'glass')
curve('Crack in cockpit',[(8.2,-1.759,3.95),(8.55,-1.765,3.65),(8.35,-1.762,3.44)],.023,'steel')
curve('Branch of cockpit crack',[(8.55,-1.765,3.65),(8.96,-1.75,3.83)],.018,'steel')
for x in [7.1,7.5]:ring('Nose collar',x,2.06,'teal',.07,(0,2.65))
sphere('Scorched nose patch',(10.4,-.85,2.83),(.7,.06,.35),'burnt')
box('Nose resting chock',(7.6,0,.28),(1.4,3.6,.5),'dark')

# Cluster of three real engine bells, throat liners, cooling rings and pipework.
cylinder('Scorched aft thrust bulkhead',(-8.8,0,3.2),2.15,.7,'burnt')
for j,a in enumerate([math.pi/2,math.pi/2+math.tau/3,math.pi/2+2*math.tau/3]):
 y,z=1.17*math.cos(a),3.2+1.17*math.sin(a)
 cylinder('Engine throat',(-9.45,y,z),.55,1.2,'copper')
 hull('Flared engine bell '+str(j),[(-9.5,.5),(-10.1,.72),(-11.25,1.02)],'dark',center=0).location=(0,y,z)
 ring('Bell outer rolled lip',-11.25,1.02,'steel',.08,(y,z))
 cylinder('Engine recessed interior',(-10.35,y,z),.56,.09,'burnt')
 for k in range(5):ring('Engine cooling ring',-9.35-k*.17,.57,'gold' if k==1 else 'steel',.035,(y,z))
 curve('Engine feed line',[(-7.8,y,z+1),(-8.6,y,z+1.15),(-9.55,y,z+.6)],.08,'copper')
for side in [-1,1]:
 # Bent swept stabilizer, fully solid with a rolled steel edge.
 verts=[(-6.8,side*1.8,2.0),(-9.9,side*3.85,.8),(-11.9,side*3.2,.65),(-10,side*1.8,2.0)]
 o=mesh('Bent stabilizer',verts,[(0,1,2,3)],'teal');mod=o.modifiers.new('Thick fin','SOLIDIFY');mod.thickness=.18
 curve('Stabilizer metal leading edge',verts[:3],.085,'steel')
box('Buckled dorsal fin',(-7.8,0,5.65),(3.8,.22,1.5),'teal',(0,.18,0),.08)

# Repair cradle anchors the rocket to the courtyard rather than floating.
for x in [-5.9,.1]:
 box('Repair cradle foot',(x,0,.15),(1.7,5.9,.3),'dark')
 for side in [-1,1]:
  box('Cradle riser',(x,side*2,.53),(.7,.7,.8),'steel')
  box('Hazard painted shoe',(x,side*2.9,.33),(1.65,.35,.36),'gold')
 curve('Curved cradle saddle',[(x,2.45*math.cos(a),3.2+2.45*math.sin(a)) for a in [math.pi+i*math.pi/24 for i in range(25)]],.2,'dark')
for side in [-1,1]:
 curve('Hull service conduit',[(-7.6,side*2.1,4.45),(-4.8,side*2.12,4.42),(-1.0,side*2.12,4.38),(1.4,side*2.03,4.32)],.06,'copper')
box('Open service bay frame',(-.1,-2.4,3.3),(2.6,.16,1.45),'dark')
for x in [-.9,-.4,.1,.6]:
 box('Electronics cassette',(x,-2.52,3.3),(.32,.16,.9),'steel')
 box('Small status diode',(x,-2.62,3.52),(.16,.035,.08),'lamp',bevel=.01)
box('Hinged hatch hanging open',(1.4,-2.8,2.75),(1.8,.12,1.2),'ivory',(.2,0,.4),.08)
for i,(x,y,r) in enumerate([(-3.1,-3.6,.12),(3.7,3.5,-.2),(9.9,-3.1,.2)]):
 box('Fallen hull panel '+str(i),(x,y,.2),(1.7,1.0,.16),'ivory' if i!=1 else 'teal',(0,r,.3*i),.05)
 box('Soot on fallen panel '+str(i),(x,y,.31),(.8,.45,.035),'burnt',(0,0,.3*i),.02)

# Readable registration plate and crescent badge; no external image dependency.
box('Registration plate',(-4.9,-2.41,3.05),(2.15,.055,.72),'teal',bevel=.035)
bpy.ops.object.text_add(location=(-4.9,-2.46,2.86),rotation=(math.pi/2,0,0));label=bpy.context.object;label.data.body='TSU-07';label.data.align_x='CENTER';label.data.size=.48;label.data.extrude=.006;finish(label,'TSU-07 registration','ivory')
sphere('Crescent badge',(-4.9,-2.43,4.05),(.35,.065,.35),'gold');sphere('Crescent inset',(-4.74,-2.49,4.15),(.29,.04,.29),'teal')
# Flat rubble pad masks no terrain seams and never changes the existing ground.
bpy.ops.mesh.primitive_circle_add(vertices=40,radius=1,fill_type='NGON',location=(-1,0,.025));pad=bpy.context.object;pad.scale=(13.1,4.55,1);finish(pad,'Courtyard scorch mark','ground')

bpy.context.view_layer.update()
# Export evaluated bevels, wall thickness and curve tubing, grouped by material.
deps=bpy.context.evaluated_depsgraph_get();bins={};component_count=0
for obj in asset.objects:
 if obj.type not in ('MESH','CURVE','FONT'):continue
 evaluated=obj.evaluated_get(deps);geometry=evaluated.to_mesh();geometry.calc_loop_triangles();matrix=obj.matrix_world;normal_matrix=matrix.to_3x3().inverted().transposed();component_count+=1
 for tri in geometry.loop_triangles:
  material=obj.data.materials[min(tri.material_index,len(obj.data.materials)-1)].name
  dest=bins.setdefault(material,{'positions':[],'normals':[],'indices':[],'lookup':{}})
  for li in tri.loops:
   vertex=geometry.loops[li].vertex_index;p=matrix@geometry.vertices[vertex].co
   normal=(normal_matrix@geometry.corner_normals[li].vector).normalized();point=tuple(round(v,5) for v in (p.x,p.z,-p.y));nrm=tuple(round(v,5) for v in (normal.x,normal.z,-normal.y));key=point+nrm
   if key not in dest['lookup']:
    dest['lookup'][key]=len(dest['positions'])//3;dest['positions'].extend(point);dest['normals'].extend(nrm)
   dest['indices'].append(dest['lookup'][key])
 evaluated.to_mesh_clear()
parts=[]
for material,d in bins.items():
 del d['lookup'];color,metal,rough=palette[material];parts.append({'material':material,'color':'#'+color,'metalness':metal,'roughness':rough,'emissive':material=='lamp',**d})
coords=[part['positions'] for part in parts];bounds={'min':[min(min(p[i::3]) for p in coords) for i in range(3)],'max':[max(max(p[i::3]) for p in coords) for i in range(3)]}
# Conservative component colliders, leaving the main entrance and split hull gap open.
collisions=[{'name':'pressure-hull','x':-1.8,'z':0,'width':14.8,'depth':4.8,'minY':.75,'maxY':5.6},
 {'name':'aft-engines','x':-10.25,'z':0,'width':3.0,'depth':4.2,'minY':.85,'maxY':5.15},
 {'name':'detached-nose','x':9.0,'z':0,'width':4.8,'depth':3.4,'minY':.45,'maxY':4.75},
 {'name':'nose-tip','x':11.8,'z':0,'width':2.0,'depth':1.5,'minY':1.65,'maxY':3.45}]
for x in [-5.9,.1]:collisions.append({'name':'cradle','x':x,'z':0,'width':1.7,'depth':5.9,'minY':0,'maxY':1.3})
for side in [-1,1]:collisions.append({'name':'bent-fin','x':-9.4,'z':side*2.9,'width':3.6,'depth':1.3,'minY':.6,'maxY':1.6})
data={'version':1,'source':'Assets/Art/Blender/Props/RuinedTechnologyRocket.blend','design':'TSU-07 ruined lunar explorer','coordinateSystem':'Y-up, metres','triangles':sum(len(p['indices'])//3 for p in parts),'sourceObjects':component_count,'bounds':bounds,'parts':parts,'colliders':collisions}
OUT.write_text('window.TECHNOLOGY_ROCKET_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(REPORT/'mesh-report.json').write_text(json.dumps({k:v for k,v in data.items() if k not in ('parts','colliders')},indent=2),encoding='utf8')

# Editable authoring scene and an independently lit preview (not exported).
studio=bpy.data.collections.new('PreviewStudio_not_exported');scene.collection.children.link(studio)
def studio_obj(obj):
 for c in list(obj.users_collection):c.objects.unlink(obj)
 studio.objects.link(obj);return obj
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.02));floor=studio_obj(bpy.context.object);floor.name='Preview ground';floor.data.materials.append(materials['dark'])
bpy.ops.object.camera_add(location=(23,-30,21));camera=studio_obj(bpy.context.object);camera.name='Rocket presentation camera';camera.rotation_euler=(Vector((0,0,2.3))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=34;scene.camera=camera
for pos,energy,size in [((1,-12,23),2100,14),((-13,8,12),2600,12),((15,9,8),1800,10)]:
 bpy.ops.object.light_add(type='AREA',location=pos);light=studio_obj(bpy.context.object);light.data.energy=energy;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,2))-light.location).to_track_quat('-Z','Y').to_euler()
scene.world.color=(.25,.3,.36);scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(REPORT/'blender-preview.png')
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));bpy.ops.render.render(write_still=True)
print('TECHNOLOGY_ROCKET_READY',data['triangles'],'triangles',len(parts),'draw groups',component_count,'authored objects',flush=True)
