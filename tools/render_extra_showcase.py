import bpy
import math
import os

blend_path = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments\MysticMoonMap.blend"
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments"

bpy.ops.wm.open_mainfile(filepath=blend_path)

c_x, c_y, c_z = -48.0, 55.0, 14.5
hall_z = c_z + 3.2

# 1. RENDER GÓC NHÌN NỘI THẤT LÂU ĐÀI (WALK-IN THRONE ROOM VIEW)
bpy.ops.object.camera_add(location=(c_x, c_y - 17.5, hall_z + 2.4))
cam_castle = bpy.context.active_object
cam_castle.name = "Cam_Castle_Interior"
cam_castle.rotation_euler = (math.radians(85.0), 0.0, 0.0) # Nhìn dọc theo thảm đỏ tới ngai vàng
cam_castle.data.lens = 24.0
bpy.context.scene.camera = cam_castle
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

castle_preview = os.path.join(output_dir, "MysticMoonMap_CastleInterior_Preview.png")
bpy.context.scene.render.filepath = castle_preview
bpy.ops.render.render(write_still=True)
print(f"📸 Rendered Castle Interior: {castle_preview}")

# 2. RENDER GÓC NHÌN HANG ĐỘNG NGUYỆT TINH (CRYSTAL CAVERN INTERIOR VIEW)
cave_x, cave_y, cave_z = 55.0, -45.0, 4.0
bpy.ops.object.camera_add(location=(cave_x - 1.0, cave_y + 1.0, cave_z + 4.0))
cam_cave = bpy.context.active_object
cam_cave.name = "Cam_Cave_Interior"
# Hướng nhìn về phía hồ nước ngầm và rương báu (cave_x + 8.0, cave_y - 8.0)
dx = 8.0 - (-1.0)
dy = -8.0 - 1.0
angle_z = math.atan2(dx, -dy)
cam_cave.rotation_euler = (math.radians(78.0), 0.0, math.radians(40.0))
cam_cave.data.lens = 22.0
bpy.context.scene.camera = cam_cave

cave_preview = os.path.join(output_dir, "MysticMoonMap_Cave_Preview.png")
bpy.context.scene.render.filepath = cave_preview
bpy.ops.render.render(write_still=True)
print(f"📸 Rendered Cave Interior: {cave_preview}")

# Lưu lại các camera này vào file blend
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("✅ Saved all cameras to blend file!")
