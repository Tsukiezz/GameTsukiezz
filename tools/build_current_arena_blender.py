"""Editable Blender scene from the exact, validated game geometry and textures."""
from pathlib import Path
import bpy,json,base64,re
from mathutils import Matrix,Vector
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'.runtime/arena-current-scene.json').read_text(encoding='utf8'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
C=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
materials=[]
for i,s in enumerate(data['materials']):
    m=bpy.data.materials.new(s['name']);m.diffuse_color=(*s['color'],1);m.use_nodes=True;nodes=m.node_tree.nodes;nodes.clear();p=nodes.new('ShaderNodeBsdfPrincipled');out=nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(p.outputs[0],out.inputs['Surface']);p.inputs['Roughness'].default_value=s['roughness'];p.inputs['Metallic'].default_value=s['metalness'];p.inputs['Base Color'].default_value=m.diffuse_color
    if s.get('vertexColors'):
        n=nodes.new('ShaderNodeAttribute');n.attribute_name='Color';m.node_tree.links.new(n.outputs['Color'],p.inputs['Base Color'])
    if s.get('png'):
        path=ROOT/'.runtime'/('arena-texture-'+str(i)+'.png');path.write_bytes(base64.b64decode(s['png'].split(',')[1]));image=bpy.data.images.load(str(path));image.pack();n=nodes.new('ShaderNodeTexImage');n.image=image;m.node_tree.links.new(n.outputs['Color'],p.inputs['Base Color'])
    materials.append(m)
for spec in data['meshes']:
    vertices=[(spec['p'][i],-spec['p'][i+2],spec['p'][i+1]) for i in range(0,len(spec['p']),3)];ids=spec['i'] or list(range(len(vertices)));faces=[ids[i:i+3] for i in range(0,len(ids),3)];mesh=bpy.data.meshes.new(spec['name']);mesh.from_pydata(vertices,[],faces);mesh.materials.append(materials[spec['material']]);mesh.update()
    if spec.get('uv'):
        uv=mesh.uv_layers.new(name='UVMap')
        for polygon in mesh.polygons:
            for loop in polygon.loop_indices:
                j=mesh.loops[loop].vertex_index;uv.data[loop].uv=spec['uv'][j*2:j*2+2]
    if spec.get('c'):
        colors=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
        for i,c in enumerate(colors.data):c.color=(*spec['c'][i*3:i*3+3],1)
    for i,values in enumerate(spec['matrices']):
        obj=bpy.data.objects.new(spec['name']+'_'+str(i),mesh);bpy.context.collection.objects.link(obj);G=Matrix(tuple(tuple(values[j*4+k] for j in range(4)) for k in range(4)));obj.matrix_world=C@G@C.inverted();obj.color=(*spec['tints'][i],1)
scene=bpy.context.scene;scene['arena_scale']=data['scale'];scene['beast_pens']=1;scene['warrior_entrances']=1;scene['source']='Current Three.js world, validated coordinates';center=C@Vector((*data['center'],1));target=Vector((center.x,center.y,data['floor']+12))
bpy.ops.mesh.primitive_plane_add(size=1100,location=(center.x,center.y,data['center'][1]-.08));floor=bpy.context.object;floor.name='GradedLunarFoundation';mat=bpy.data.materials.new('Lunar soil');mat.diffuse_color=(.25,.28,.32,1);floor.data.materials.append(mat)
for offset,power in [((70,-90,220),250000),((-180,110,150),200000)]:
    bpy.ops.object.light_add(type='AREA',location=target+Vector(offset));light=bpy.context.object;light.data.energy=power;light.data.size=180;light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=target+Vector((270,-330,240)));cam=bpy.context.object;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=520;cam.data.clip_end=4000;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=12;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
out=ROOT/'Assets/Art/Blender/Environments/GrandRomanArenaCurrent.blend';bpy.ops.wm.save_as_mainfile(filepath=str(out));scene.render.filepath=str(ROOT/'demo/verification/creature-arena/arena-blender.png');bpy.ops.render.render(write_still=True)
print(json.dumps({'blend':str(out),'mesh_sources':len(data['meshes']),'objects':len(bpy.data.objects),'scale':data['scale']}))
