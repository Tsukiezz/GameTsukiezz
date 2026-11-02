"""Update the existing sole review with polar terrain and current dense rails."""
import json
import math
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
target=ROOT/'Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend'
assert Path(bpy.data.filepath).resolve()==target.resolve()
import os
evidence=ROOT/os.environ.get('GAME_VERIFY_OUTPUT','demo/verification/polar-expansion')
data=json.loads((evidence/'blender-design.json').read_text(encoding='utf-8'))
scene=bpy.data.scenes['YinYangPyramid13Floors'];bpy.context.window.scene=scene
for collection in list(bpy.data.collections):
    # Old train models remain editable; old tracks, stations and terrain snapshots
    # are replaced by the actual current surveyed system.
    if collection.name.startswith('PolarCurrent_') or collection.name.startswith('AdventureRail_') and not any(k in collection.name for k in ['Locomotive','Coach']):
        for obj in list(collection.objects):
            mesh=obj.data if obj.type=='MESH' else None;bpy.data.objects.remove(obj,do_unlink=True)
            if mesh and not mesh.users:bpy.data.meshes.remove(mesh)
        bpy.data.collections.remove(collection)
collections={}
def collection(name):
    if name not in collections:
        c=bpy.data.collections.new('PolarCurrent_'+name);scene.collection.children.link(c);collections[name]=c
    return collections[name]
for i,p in enumerate(data['meshes']):
    v=p['vertices'];vertices=[(v[k],-v[k+2],v[k+1]) for k in range(0,len(v),3)];faces=[p['indices'][k:k+3] for k in range(0,len(p['indices']),3)]
    mesh=bpy.data.meshes.new('PolarGeometry_'+str(i));mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new(p['name'],mesh);collection(p['category']).objects.link(obj)
    mat=bpy.data.materials.new('PolarMaterial_'+str(i));mat.diffuse_color=(*p['color'],1);mesh.materials.append(mat)
    # Solid viewport uses material colours rather than shader vertex colours.
    # Separate face assignments make north earth and south snow readable there too.
    if p['name']=='SouthernContinuousTerrain':
        mat.diffuse_color=(.475,.4,.294,1)
        snow=bpy.data.materials.new('SouthernSnowViewport');snow.diffuse_color=(.753,.847,.867,1);mesh.materials.append(snow)
        for poly in mesh.polygons:
            if sum(-vertices[v][1] for v in poly.vertices)/len(poly.vertices)>=1450:poly.material_index=1
    if p['colors']:
        colors=p['colors'];a=mesh.color_attributes.new(name='RuntimeColour',type='FLOAT_COLOR',domain='CORNER')
        for loop in mesh.loops:a.data[loop.index].color=(*colors[loop.vertex_index*3:loop.vertex_index*3+3],1)
        mat.use_nodes=True;shader=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) or mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled');output=next((n for n in mat.node_tree.nodes if n.type=='OUTPUT_MATERIAL'),None) or mat.node_tree.nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface']);node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='RuntimeColour';mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
railMaterial=bpy.data.materials.new('PolarRailSteel');railMaterial.diffuse_color=(.21,.3,.36,1)
points=data['railPoints']
for side in [-1,1]:
    curve=bpy.data.curves.new('CurrentSharedRail_'+str(side),'CURVE');curve.dimensions='3D';curve.bevel_depth=.09;curve.bevel_resolution=0
    spline=curve.splines.new('POLY');spline.points.add(len(points)-1)
    for i,p in enumerate(points):
        a=points[(i-1)%len(points)];b=points[(i+1)%len(points)];dx=b[0]-a[0];dz=b[2]-a[2];length=max(.001,(dx*dx+dz*dz)**.5);spline.points[i].co=(p[0]+dz/length*1.15*side,-p[2]+dx/length*1.15*side,p[1]+.08,1)
    spline.use_cyclic_u=True;obj=bpy.data.objects.new('CurrentSharedRail_'+str(side),curve);curve.materials.append(railMaterial);collection('Railway').objects.link(obj)
def boxes_mesh(name,boxes,color):
    vertices=[];faces=[]
    for item in boxes:
        center,size=item[:2];angle=item[2] if len(item)>2 else 0;cs=math.cos(angle);sn=math.sin(angle)
        x,y,z=center;w,h,d=size;off=len(vertices);vertices.extend((x+sx*w/2*cs+sz*d/2*sn,-z+sx*w/2*sn-sz*d/2*cs,y+sy*h/2) for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)])
        faces.extend(tuple(off+j for j in face) for face in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new(name,mesh);collection('Railway').objects.link(obj);mat=bpy.data.materials.new(name+'Material');mat.diffuse_color=(*color,1);mesh.materials.append(mat)
# Sleepers are a lighter authoring preview; path curves retain every runtime point.
boxes_mesh('CurrentSleeperPreview',[(p[:3],(3.5,.16,.35),math.atan2(points[(i+1)%len(points)][0]-p[0],points[(i+1)%len(points)][2]-p[2])) for i,p in enumerate(points) if i%8==0],(.31,.25,.18))
boxes_mesh('CurrentBridgePierPreview',[(p['position'],(1.4,p['height'],1.4)) for p in data['pillars'] if p.get('height')],(.44,.52,.59))
deck_vertices=[];deck_faces=[]
for i in range(0,len(points)-4,4):
    a=points[i];b=points[i+4]
    if not (a[3] or b[3]):continue
    dx=b[0]-a[0];dz=b[2]-a[2];length=max(.001,(dx*dx+dz*dz)**.5);off=len(deck_vertices)
    for p,side in [(a,-1),(a,1),(b,-1),(b,1)]:deck_vertices.append((p[0]+dz/length*3.4*side,-p[2]+dx/length*3.4*side,p[1]-.25))
    deck_faces.append((off,off+1,off+3,off+2))
deck=bpy.data.meshes.new('CurrentBridgeDecks');deck.from_pydata(deck_vertices,[],deck_faces);deck.update();obj=bpy.data.objects.new('CurrentBridgeDecks',deck);collection('Railway').objects.link(obj);deck.materials.append(railMaterial)
scene['world_size_metres']=data['size'];scene['current_rail_length_metres']=data['railLength'];scene['current_river_segments']=data['rivers'];scene['current_station_count']=len(data['stations']);scene['santa']='Flying reindeer sleigh, random falling gifts, red smoke; rare perpetual engine 2%'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':area.spaces.active.clip_end=16000;area.spaces.active.region_3d.view_location=Vector((0,-1700,80));area.spaces.active.region_3d.view_distance=7000;area.spaces.active.shading.color_type='MATERIAL'
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(target))
report={'file':str(target),'objects':len(scene.objects),'worldSize':data['size'],'railLength':data['railLength'],'stations':len(data['stations']),'updatedMeshes':len(data['meshes'])}
(evidence/'blender-update.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
