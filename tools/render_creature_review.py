"""Reframe the editable Blender studio and render the five tournament silhouettes."""
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'Assets/Art/Blender/Creatures/LunarCreatureStudio.blend'
bpy.ops.wm.open_mainfile(filepath=str(source));scene=bpy.context.scene;scene.camera.data.ortho_scale=50
bpy.ops.wm.save_as_mainfile(filepath=str(source));scene.render.filepath=str(ROOT/'demo/verification/creature-arena/creature-studio.png');bpy.ops.render.render(write_still=True)
for o in bpy.data.objects:o.hide_render=True
for i,kind in enumerate(['arena_beast','dark_horse','spinosaurus','trex','zeus']):
    collection=bpy.data.collections['Creature_'+kind];objects=list(collection.objects);points=[o.matrix_world@v.co for o in objects for v in o.data.vertices];low=Vector(tuple(min(p[k] for p in points) for k in range(3)));high=Vector(tuple(max(p[k] for p in points) for k in range(3)));center=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z));scale=4/max(high-low);offset=Vector(((i-2)*5.4,0,0))
    for o in objects:o.hide_render=False;o.location=(o.location-center)*scale+offset;o.scale*=scale
    bpy.ops.object.text_add(location=offset+Vector((-1.9,-2.7,.01)));o=bpy.context.object;o.data.body=['LV1 - Arena Beast','LV2 - Dark Horse','LV3 - Spinosaurus','LV4 - T-rex','MAX - Zeus'][i];o.data.size=.25
bpy.ops.mesh.primitive_plane_add(size=70,location=(0,0,-.04));floor=bpy.context.object;floor.data.materials.append(bpy.data.materials['Creature_2b3a48'])
for position in [(0,-8,14),(-10,0,12)]:
    bpy.ops.object.light_add(type='AREA',location=position);light=bpy.context.object;light.data.energy=2500;light.data.size=14;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,-20,18));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=30;scene.camera=camera;scene.render.resolution_x=1800;scene.render.resolution_y=850;scene.cycles.samples=24
out=ROOT/'demo/verification/arena-levels';out.mkdir(parents=True,exist_ok=True);scene.render.filepath=str(out/'opponents-blender.png');bpy.ops.render.render(write_still=True)
