import math
import os
import sys

# Ensure UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ai_blender_bridge import BlenderAIBridge

HAMSTER_CODE = '''import bpy
import math
import os

# 1. Xóa Cube mặc định nếu có trong Scene
if "Cube" in bpy.data.objects:
    bpy.data.objects.remove(bpy.data.objects["Cube"], do_unlink=True)

# Helper tạo material Principled BSDF
def get_or_create_mat(name, color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if emission and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

mat_fur = get_or_create_mat("Mat_Hamster_Fur", (0.85, 0.55, 0.22, 1.0), roughness=0.85)
mat_belly = get_or_create_mat("Mat_Hamster_Belly", (0.96, 0.93, 0.88, 1.0), roughness=0.85)
mat_pink = get_or_create_mat("Mat_Hamster_Pink", (0.95, 0.65, 0.72, 1.0), roughness=0.6)
mat_eye = get_or_create_mat("Mat_Hamster_Eyes", (0.02, 0.02, 0.02, 1.0), roughness=0.1)
mat_metal = get_or_create_mat("Mat_Warrior_Steel", (0.75, 0.78, 0.82, 1.0), metallic=0.9, roughness=0.3)
mat_gold = get_or_create_mat("Mat_Warrior_Gold", (1.0, 0.8, 0.15, 1.0), metallic=0.92, roughness=0.25)
mat_cape = get_or_create_mat("Mat_Warrior_Cape", (0.8, 0.1, 0.15, 1.0), roughness=0.7)
mat_rune = get_or_create_mat("Mat_Moon_Rune", (0.2, 0.9, 1.0, 1.0), emission=(0.25, 0.92, 1.0, 1.0), emission_strength=4.0)

# Tạo Empty Root
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
root = bpy.context.active_object
root.name = "Hamster_Warrior"

# THÂN BỤNG TRÒN (Body)
bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18, radius=0.9, location=(0, 0, 1.0))
body = bpy.context.active_object
body.name = "Hamster_Body"
body.scale = (1.05, 0.95, 1.15)
bpy.ops.object.shade_smooth()
body.data.materials.append(mat_fur)
body.parent = root

# BỤNG TRẮNG KEM (Belly patch)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.7, location=(0, -0.4, 0.95))
belly = bpy.context.active_object
belly.name = "Hamster_Belly"
belly.scale = (0.85, 0.5, 0.95)
bpy.ops.object.shade_smooth()
belly.data.materials.append(mat_belly)
belly.parent = root

# ĐẦU TRÒN (Head)
bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18, radius=0.78, location=(0, -0.1, 1.95))
head = bpy.context.active_object
head.name = "Hamster_Head"
head.scale = (1.1, 1.0, 0.95)
bpy.ops.object.shade_smooth()
head.data.materials.append(mat_fur)
head.parent = root

# ĐÔI MÁ PHÚNG PHÍNH (Puffy Cheeks)
for side, x in [("Left", -0.45), ("Right", 0.45)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.4, location=(x, -0.5, 1.8))
    chk = bpy.context.active_object
    chk.name = f"Cheek_{side}"
    chk.scale = (1.0, 0.8, 0.85)
    bpy.ops.object.shade_smooth()
    chk.data.materials.append(mat_belly)
    chk.parent = root

# MÕM TRẮNG & MŨI HỒNG (Snout & Nose)
bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=12, radius=0.28, location=(0, -0.72, 1.9))
snout = bpy.context.active_object
snout.name = "Hamster_Snout"
snout.scale = (0.85, 0.65, 0.65)
bpy.ops.object.shade_smooth()
snout.data.materials.append(mat_belly)
snout.parent = root

bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.08, location=(0, -0.88, 1.98))
nose = bpy.context.active_object
nose.name = "Hamster_Nose"
nose.scale = (1.2, 0.8, 0.8)
bpy.ops.object.shade_smooth()
nose.data.materials.append(mat_pink)
nose.parent = root

# ĐÔI MẮT ĐEN LONG LANH (Eyes)
for side, x in [("Left", -0.36), ("Right", 0.36)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.12, location=(x, -0.68, 2.1))
    eye = bpy.context.active_object
    eye.name = f"Eye_{side}"
    eye.scale = (1.0, 0.8, 1.1)
    bpy.ops.object.shade_smooth()
    eye.data.materials.append(mat_eye)
    eye.parent = root

    # Điểm phản chiếu ánh sáng trong mắt (Specular eye highlight)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.035, location=(x + (0.03 if side=="Left" else -0.03), -0.76, 2.16))
    hl = bpy.context.active_object
    hl.name = f"Eye_Highlight_{side}"
    hl.data.materials.append(mat_belly)
    hl.parent = root

# ĐÔI TAI TRÒN HAMSTER (Round Ears)
for side, x, rot in [("Left", -0.55, 0.3), ("Right", 0.55, -0.3)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.3, location=(x, -0.05, 2.7))
    ear = bpy.context.active_object
    ear.name = f"Ear_{side}"
    ear.rotation_euler = (0, rot, 0)
    ear.scale = (0.8, 0.35, 0.9)
    bpy.ops.object.shade_smooth()
    ear.data.materials.append(mat_fur)
    ear.parent = root

    # Vành tai trong màu hồng
    bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.2, location=(x, -0.12, 2.7))
    inner = bpy.context.active_object
    inner.name = f"Ear_Inner_{side}"
    inner.rotation_euler = (0, rot, 0)
    inner.scale = (0.7, 0.25, 0.8)
    bpy.ops.object.shade_smooth()
    inner.data.materials.append(mat_pink)
    inner.parent = root

# MŨ GIÁP HIỆP SĨ CHIẾN BINH (Warrior Helmet)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.74, depth=0.3, location=(0, -0.05, 2.48))
helm_rim = bpy.context.active_object
helm_rim.name = "Helmet_Rim"
helm_rim.scale = (1.05, 1.05, 0.6)
helm_rim.data.materials.append(mat_gold)
helm_rim.parent = root

bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.7, location=(0, -0.05, 2.55))
helm_top = bpy.context.active_object
helm_top.name = "Helmet_Dome"
helm_top.scale = (1.0, 0.95, 0.65)
bpy.ops.object.shade_smooth()
helm_top.data.materials.append(mat_metal)
helm_top.parent = root

# Chỏm lông mũ hiệp sĩ màu đỏ anh hùng (Helmet Plume)
bpy.ops.mesh.primitive_cube_add(size=0.3, location=(0, 0.15, 2.95))
plume = bpy.context.active_object
plume.name = "Helmet_Plume"
plume.scale = (0.3, 1.4, 0.7)
plume.rotation_euler = (-0.35, 0, 0)
bpy.ops.object.shade_smooth()
plume.data.materials.append(mat_cape)
plume.parent = root

# GIÁP NGỰC KIM LOẠI (Chestplate Armor)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.9, depth=0.6, location=(0, -0.05, 1.08))
chestplate = bpy.context.active_object
chestplate.name = "Warrior_Chestplate"
chestplate.scale = (1.03, 0.93, 0.9)
bpy.ops.object.shade_smooth()
chestplate.data.materials.append(mat_metal)
chestplate.parent = root

# Huy hiệu vàng hoàng gia trên ngực (Golden Emblem)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.25, depth=0.1, location=(0, -0.92, 1.15))
emblem = bpy.context.active_object
emblem.name = "Chest_Emblem"
emblem.rotation_euler = (math.pi/2, 0, 0)
emblem.data.materials.append(mat_gold)
emblem.parent = root

# ĐÔI ỦNG CHIẾN BINH (Iron Boots / Feet)
for side, x in [("Left", -0.45), ("Right", 0.45)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.3, location=(x, -0.15, 0.2))
    foot = bpy.context.active_object
    foot.name = f"Foot_{side}"
    foot.scale = (0.85, 1.45, 0.6)
    bpy.ops.object.shade_smooth()
    foot.data.materials.append(mat_metal)
    foot.parent = root

# ĐUÔI TRÒN NHỎ CỤT (Cute Tail)
bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.18, location=(0, 0.88, 0.65))
tail = bpy.context.active_object
tail.name = "Hamster_Tail"
bpy.ops.object.shade_smooth()
tail.data.materials.append(mat_belly)
tail.parent = root

# ÁO CHOÀNG HIỆP SĨ ĐỎ (Red Heroic Cape)
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0.68, 1.25))
cape = bpy.context.active_object
cape.name = "Warrior_Cape"
cape.scale = (0.95, 1.6, 1.0)
cape.rotation_euler = (1.25, 0, 0)
bpy.ops.object.shade_smooth()
cape.data.materials.append(mat_cape)
cape.parent = root

# TAY PHẢI VÀ THANH KIẾM HIỆP SĨ (Right Arm & Sword)
bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.24, location=(0.95, -0.2, 1.15))
arm_r = bpy.context.active_object
arm_r.name = "Arm_Right"
arm_r.scale = (1.2, 0.8, 0.8)
arm_r.data.materials.append(mat_metal)
arm_r.parent = root

# Cán kiếm
bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.6, location=(1.18, -0.3, 1.15))
hilt = bpy.context.active_object
hilt.name = "Sword_Hilt"
hilt.data.materials.append(mat_gold)
hilt.parent = root

# Chắn tay kiếm
bpy.ops.mesh.primitive_cube_add(size=0.2, location=(1.18, -0.3, 1.42))
guard = bpy.context.active_object
guard.name = "Sword_Guard"
guard.scale = (0.45, 1.6, 0.3)
guard.data.materials.append(mat_gold)
guard.parent = root

# Lưỡi kiếm bạc
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(1.18, -0.3, 2.15))
blade = bpy.context.active_object
blade.name = "Sword_Blade"
blade.scale = (0.05, 0.16, 1.2)
bpy.ops.object.shade_smooth()
blade.data.materials.append(mat_metal)
blade.parent = root

# TAY TRÁI VÀ KHIÊN NGUYỆT TINH (Left Arm & Moon Shield)
bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.24, location=(-0.95, -0.2, 1.15))
arm_l = bpy.context.active_object
arm_l.name = "Arm_Left"
arm_l.scale = (1.2, 0.8, 0.8)
arm_l.data.materials.append(mat_metal)
arm_l.parent = root

# Mặt khiên
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.58, depth=0.1, location=(-1.18, -0.4, 1.15))
shield = bpy.context.active_object
shield.name = "Warrior_Shield"
shield.rotation_euler = (0, math.pi/2, 0)
shield.data.materials.append(mat_metal)
shield.parent = root

# Vành khiên vàng
bpy.ops.mesh.primitive_torus_add(major_radius=0.58, minor_radius=0.045, location=(-1.23, -0.4, 1.15))
rim = bpy.context.active_object
rim.name = "Shield_Rim"
rim.rotation_euler = (0, math.pi/2, 0)
rim.data.materials.append(mat_gold)
rim.parent = root

# Biểu tượng Vầng Trăng Khuyết Tsukiezz phát sáng xanh ngọc trên khiên
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.24, depth=0.09, location=(-1.25, -0.4, 1.15))
emblem_moon = bpy.context.active_object
emblem_moon.name = "Shield_Moon_Emblem"
emblem_moon.rotation_euler = (0, math.pi/2, 0)
emblem_moon.data.materials.append(mat_rune)
emblem_moon.parent = root

# Bật chế độ Material Preview trên 3D Viewport
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'MATERIAL'

# Tự động xuất file ra thư mục GameTsukiezz Unity
output_dir = r"c:\\Users\\Admin\\OneDrive\\Máy tính\\Desktop\\CODE\\Tsukiezz\\projects\\GameTsukiezz\\Assets\\Art\\Models"
os.makedirs(output_dir, exist_ok=True)
blend_save = os.path.join(output_dir, "HamsterWarrior.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_save)

fbx_save = os.path.join(output_dir, "HamsterWarrior.fbx")
try:
    bpy.ops.export_scene.fbx(filepath=fbx_save, use_selection=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    print("FBX exported successfully to:", fbx_save)
except Exception as e:
    print("FBX Warning:", e)

print("HAMSTER_WARRIOR_LIVE_GENERATION_SUCCESSFUL")
'''

def main():
    bridge = BlenderAIBridge()
    print("🚀 Đang gửi lệnh tạo 'Chiến Binh Chuột Hamster' vào Blender đang mở...")
    res = bridge.execute_code(HAMSTER_CODE)
    import json
    print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
