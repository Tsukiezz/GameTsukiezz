"""Read-only authoring audit and a temporary top-view render; does not save map."""
import json
from pathlib import Path
import bpy
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
out=root/'demo/verification/world-ecology'
scene=bpy.context.scene
terrain=bpy.data.objects['SouthernContinuousTerrain']
earth=snow=0
for p in terrain.data.polygons:
    z=sum(-terrain.data.vertices[v].co.y for v in p.vertices)/len(p.vertices)
    assert p.material_index==(1 if z>=1450 else 0)
    if z>=1450:snow+=1
    else:earth+=1
wildlife=list(bpy.data.collections['PolarCurrent_Wildlife'].objects)
assert len(wildlife)==100
assert scene['current_station_count']==44
assert scene['monster_camp_count']==108
report={'connected':True,'file':bpy.data.filepath,'objects':len(scene.objects),'stations':44,'camps':108,'wildlife':len(wildlife),'earthFaces':earth,'snowFaces':snow}
(out/'blender-live-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
camera=bpy.data.objects.new('TemporaryEcologyReview',bpy.data.cameras.new('TemporaryEcologyReview'))
scene.collection.objects.link(camera)
camera.location=(0,0,11000);camera.rotation_euler=(0,0,0);camera.data.type='ORTHO';camera.data.ortho_scale=7400;camera.data.clip_end=20000
previous_camera=scene.camera;previous_engine=scene.render.engine
scene.camera=camera;scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True
scene.render.resolution_x=1100;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.filepath=str(out/'blender-map.png');bpy.ops.render.render(write_still=True)
scene.camera=previous_camera;scene.render.engine=previous_engine;bpy.data.objects.remove(camera,do_unlink=True)
print(json.dumps(report))
