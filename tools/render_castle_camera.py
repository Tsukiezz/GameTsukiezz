import bpy
import mathutils
import os

blend_path = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments\MysticMoonMap.blend"
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments"
desktop_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\Blender"

c_x, c_y, c_z = -110.0, 120.0, 22.0
hall_z = c_z + 6.0
floor2_z = c_z + 13.5

# Position camera inside Grand Hall / Mezzanine looking towards Moon Throne
cam = bpy.data.objects.get("Throne_Hall_WalkIn_Camera")
if not cam:
    bpy.ops.object.camera_add(location=(c_x, c_y - 14.0, hall_z + 3.0))
    cam = bpy.context.active_object
    cam.name = "Throne_Hall_WalkIn_Camera"

# Safe interior vantage point looking up from Floor 1 red carpet towards the grand double staircase and the glowing Moon Throne
cam.location = (c_x, c_y - 15.0, hall_z + 2.5)
target = mathutils.Vector((c_x, c_y + 16.0, floor2_z + 3.0))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 20.0

bpy.context.scene.camera = cam
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

render_castle = os.path.join(output_dir, "MysticMoonMap_CastleInterior_Preview.png")
bpy.context.scene.render.filepath = render_castle
print("Rendering Castle Interior...")
bpy.ops.render.render(write_still=True)
print(f"Saved: {render_castle}")

# Also check Cave Camera
cam_cave = bpy.data.objects.get("Crystal_Cavern_WalkIn_Camera")
if cam_cave:
    bpy.context.scene.camera = cam_cave
    render_cave = os.path.join(output_dir, "MysticMoonMap_Cave_Preview.png")
    bpy.context.scene.render.filepath = render_cave
    print("Rendering Cave...")
    bpy.ops.render.render(write_still=True)
    print(f"Saved: {render_cave}")

# Save blend and sync
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
import shutil
for f in ["MysticMoonMap_CastleInterior_Preview.png", "MysticMoonMap_Cave_Preview.png", "MysticMoonMap.blend"]:
    src = os.path.join(output_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(desktop_dir, f))
print("All renders and sync complete!")
