"""Editable Blender twin of the faceted in-game crystal flight equipment."""
import bpy,bmesh,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
name='CrystalFlightEquipment';old=bpy.data.collections.get(name)
if old:
    for obj in list(old.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
materials={}
for key,color in {'crystal':'92d5ef','violet':'af9de4','silver':'c9dfeb'}.items():
    rgb=[int(color[i:i+2],16)/255 for i in (0,2,4)];linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    mat=bpy.data.materials.new('CrystalWings_'+key);mat.use_nodes=True;mat.diffuse_color=(*linear,1)
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');shader.inputs['Base Color'].default_value=(*linear,1);shader.inputs['Roughness'].default_value=.22 if key!='silver' else .35;shader.inputs['Metallic'].default_value=.25 if key!='silver' else .65
    if key!='silver':shader.inputs['Emission Color'].default_value=(*[v*.2 for v in linear],1);shader.inputs['Emission Strength'].default_value=.4
    materials[key]=mat
root=bpy.data.objects.new('CrystalWings_Equipment',None);collection.objects.link(root);root.scale=(.2,)*3
def part(label,vs,faces,material,parent):
    mesh=bpy.data.meshes.new(label);mesh.from_pydata([(x,-z,y) for x,y,z in vs],[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new(label,mesh);collection.objects.link(obj);mesh.materials.append(materials[material]);obj.parent=parent;return obj
octa=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
faces=[(0,2,4),(2,1,4),(1,3,4),(3,0,4),(2,0,5),(1,2,5),(3,1,5),(0,3,5)]
for side in [-1,1]:
    joint=bpy.data.objects.new('CrystalWing_Left' if side<0 else 'CrystalWing_Right',None);collection.objects.link(joint);joint.parent=root;joint.location.x=side*.55
    for i in range(6):
        start=Vector((side*.12,.25-i*.15,0));end=Vector((side*(4.5-i*.46),2.5-i*.8,-.3-i*.06));delta=end-start;q=Vector((0,1,0)).rotation_difference(delta.normalized());center=start+delta*.53
        vs=[list(center+q@Vector((x*.32,y*delta.length*.65,z*.15))) for x,y,z in octa]
        part('FlightFeather_'+str(side)+'_'+str(i),vs,faces,'crystal' if i%2 else 'violet',joint)
    vs=[];ids=[];angle=-side*1.08
    for y,r in [(-1.9,.14),(1.9,.1)]:
        for i in range(6):
            x=r*math.cos(i*math.tau/6);z=r*math.sin(i*math.tau/6);vs.append([x*math.cos(angle)-y*math.sin(angle)+side*1.7,x*math.sin(angle)+y*math.cos(angle)+.8,z+.03])
    for i in range(6):j=(i+1)%6;ids.append((i,j,j+6,i+6))
    ids.extend([tuple(range(5,-1,-1)),tuple(range(6,12))]);part('WingSpar_'+str(side),vs,ids,'silver',joint)
part('CrystalWings_BackClasp',[(x*.48,y*.48+.3,z*.48+.12) for x,y,z in octa],faces,'crystal',root)
asset_scene=bpy.data.scenes.get('CrystalWingsAsset') or bpy.data.scenes.new('CrystalWingsAsset')
if collection.name not in asset_scene.collection.children:asset_scene.collection.children.link(collection)
path=ROOT/'Assets/Art/Blender/Equipment/CrystalWings.blend';path.parent.mkdir(parents=True,exist_ok=True)
if bpy.context.window:bpy.context.window.scene=asset_scene
bpy.ops.wm.save_as_mainfile(filepath=str(path),copy=True)
print('Saved editable crystal wings:',path,'objects:',len(collection.objects))
