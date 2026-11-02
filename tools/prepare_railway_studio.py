"""Prepare an editable railway studio without replacing the map authoring scene."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'demo/features/railway/data/railway-assets.js';source=p.read_text(encoding='utf-8');data=json.loads(source[source.index('{'):source.rindex('}')+1])
name='RailwayInteriorStudio';scene=bpy.data.scenes.get(name)
if scene:
 for obj in list(scene.objects):bpy.data.objects.remove(obj,do_unlink=True)
 for col in list(scene.collection.children):bpy.data.collections.remove(col)
else:scene=bpy.data.scenes.new(name)
bpy.context.window.scene=scene
materials={}
for key,rgb in data['materials'].items():
 mat=bpy.data.materials.get('StudioRail_'+key) or bpy.data.materials.new('StudioRail_'+key);mat.use_nodes=True;mat.diffuse_color=(*rgb,1);bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=.55
 if key=='lamp':bsdf.inputs['Emission Color'].default_value=(*rgb,1);bsdf.inputs['Emission Strength'].default_value=1.5
 if key=='glass':bsdf.inputs['Alpha'].default_value=.18;mat.diffuse_color=(*rgb,.18);mat.surface_render_method='DITHERED'
 materials[key]=mat
meshes={}
for kind,pieces in data['models'].items():
 for i,piece in enumerate(pieces):
  mesh=bpy.data.meshes.new('Editable_'+kind+'_'+piece['name']);ids=piece['indices'];mesh.from_pydata([(x,-z,y) for x,y,z in piece['vertices']],[],[ids[j:j+3] for j in range(0,len(ids),3)]);mesh.materials.append(materials[piece['material']]);meshes[kind,i]=mesh

def collection(name):
 old=bpy.data.collections.get(name)
 if old and old.users==0:bpy.data.collections.remove(old)
 col=bpy.data.collections.new(name);scene.collection.children.link(col);return col

def add(kind,label,origin,editable=True):
 col=collection(label)
 for i,piece in enumerate(data['models'][kind]):
  obj=bpy.data.objects.new(label+'__'+piece['name'],meshes[kind,i]);col.objects.link(obj);obj.location=(origin[0],-origin[2],origin[1]);obj['railway_kind']=kind;obj['railway_part']=piece['name'];obj['railway_material']=piece['material'];obj['railway_origin']=origin;obj['railway_export']=editable
 return col
add('engine','01_Locomotive',[0,0,0]);add('driver','02_Royal_Tin_Driver',[0,1.9,-4])
for i in range(1,4):add('coach',f'0{i+2}_Coach_{i:02d}',[0,0,-15*i],i==1)
add('station','06_Editable_Station',[0,-.7,0]);decor=collection('07_Studio_Lights_Cameras')
def box(name,p,size,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));obj=bpy.context.object;obj.name=name;obj.scale=(size[0],size[2],size[1]);obj.data.materials.append(materials[mat]);return obj
for i in [1,2]:
 z=-15*i-7.5;box(f'Gangway_{i}_WalkableDeck',(0,1.85,z),(1.5,.14,3),'steel')
 for side in [-1,1]:box(f'Gangway_{i}_Guardrail',(side*.72,2.47,z),(.08,1.15,3),'gold')
box('Studio_Ground',(5,-.13,-16),(92,.2,92),'stone')
def camera(name,eye,target,lens=32):
 cam=bpy.data.cameras.new(name);cam.lens=lens;cam.clip_start=.03;cam.clip_end=4000;obj=bpy.data.objects.new(name,cam);decor.objects.link(obj);obj.location=(eye[0],-eye[2],eye[1]);look=Vector((target[0],-target[2],target[1]));obj.rotation_euler=(look-obj.location).to_track_quat('-Z','Y').to_euler();return obj
scene.camera=camera('Exterior_Design_View',[38,25,-18],[0,3,-18],30)
camera('Interior_Walk_View',[0,3.35,-15],[0,3.35,-10],24)
camera('Interior_Window_Seat',[1.25,3.65,-16],[12,3.65,-16],28)
world=bpy.data.worlds.get('RailwayStudioWorld') or bpy.data.worlds.new('RailwayStudioWorld');world.use_nodes=True;next(n for n in world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.18,.23,.3,1);next(n for n in world.node_tree.nodes if n.type=='BACKGROUND').inputs[1].default_value=.45;scene.world=world
for name,kind,power,position in [('StudioSun','SUN',2.5,(5,-10,20)),('StudioFill','AREA',1800,(-8,5,12))]:
 light=bpy.data.lights.new(name,kind);light.energy=power
 if kind=='AREA':light.shape='DISK';light.size=14
 obj=bpy.data.objects.new(name,light);decor.objects.link(obj);obj.location=position;obj.rotation_euler=(.4,-.4,-.4)
scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene['editing_guide']='Edit Coach_01 to update shared coach geometry. Cameras: Exterior, Interior_Walk, Interior_Window_Seat. Export with tools/export_railway_studio.py.'
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.clip_end=4000
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Environments/MoonRailway.blend'))
print(json.dumps({'scene':scene.name,'objects':len(scene.objects),'camera':scene.camera.name,'editableModels':['engine','coach','driver','station']}))
