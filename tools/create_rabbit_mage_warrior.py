import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ai_blender_bridge import BlenderAIBridge

RABBIT_MAGE_CODE = r'''import bpy
import math
import os

# 1. DỌN DẸP SCENE
# Xóa các mesh cũ nhưng giữ lại camera/light nếu có
for obj in list(bpy.data.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)
    elif obj.type == 'EMPTY' and "Warrior" in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# 2. HELPER TẠO VẬT LIỆU SINH ĐỘNG (HỖ TRỢ CẢ SOLID MODE VÀ SHADER NODES)
def create_vibrant_material(name, base_color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    
    # Thiết lập màu hiển thị trong Solid Viewport
    mat.diffuse_color = base_color
    if emission_color:
        mat.diffuse_color = emission_color

    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if emission_color and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

# BẢNG MÀU PHÙ THỦY CHIẾN BINH (MYSTIC BATTLE MAGE PALETTE)
mat_white_fur   = create_vibrant_material("Mat_Bunny_SnowFur",      (0.96, 0.97, 0.99, 1.0), roughness=0.85) # Lông trắng tuyết ánh trăng
mat_inner_ear   = create_vibrant_material("Mat_Bunny_EarPink",      (1.00, 0.70, 0.78, 1.0), roughness=0.60) # Tai trong hồng phấn
mat_blush       = create_vibrant_material("Mat_Bunny_Blush",        (1.00, 0.52, 0.65, 1.0), roughness=0.70) # Má hồng phúng phính
mat_eye_purple  = create_vibrant_material("Mat_Bunny_AmethystEye",  (0.55, 0.15, 0.88, 1.0), roughness=0.15) # Mắt tím thạch anh
mat_eye_black   = create_vibrant_material("Mat_Bunny_PupilBlack",   (0.02, 0.02, 0.02, 1.0), roughness=0.10) # Tròng đen
mat_robe_purple = create_vibrant_material("Mat_Mage_RoyalPurple",   (0.22, 0.08, 0.45, 1.0), roughness=0.60) # Áo choàng tím hoàng gia
mat_robe_gold   = create_vibrant_material("Mat_Mage_GoldTrim",      (1.00, 0.82, 0.15, 1.0), metallic=0.95, roughness=0.20) # Viền vàng ròng
mat_armor_silver= create_vibrant_material("Mat_Mage_SilverPlate",   (0.80, 0.84, 0.90, 1.0), metallic=0.90, roughness=0.25) # Giáp bạc hộ tâm
mat_magic_glow  = create_vibrant_material("Mat_Magic_PurpleNeon",   (0.78, 0.25, 1.00, 1.0), emission_color=(0.88, 0.35, 1.0, 1.0), emission_strength=5.0) # Phép thuật tím neon
mat_cyan_glow   = create_vibrant_material("Mat_Moon_CyanGlow",      (0.00, 0.95, 0.85, 1.0), emission_color=(0.10, 0.98, 0.90, 1.0), emission_strength=4.5) # Ngọc nguyệt thạch xanh
mat_staff_wood  = create_vibrant_material("Mat_Staff_ElderWood",    (0.35, 0.18, 0.08, 1.0), roughness=0.80) # Gỗ trượng cổ thụ
mat_grimoire    = create_vibrant_material("Mat_Grimoire_Leather",   (0.30, 0.05, 0.38, 1.0), roughness=0.55) # Bìa sách da tím
mat_pages       = create_vibrant_material("Mat_Grimoire_Pages",     (0.92, 0.88, 0.78, 1.0), roughness=0.90) # Giấy sách cổ xưa

# ROOT EMPTY
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
root = bpy.context.active_object
root.name = "Rabbit_Mage_Warrior"

# 1. BỆ ĐÁ MA THUẬT (Magic Pedestal with Runes)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.6, depth=0.18, location=(0, 0, 0.09))
pedestal = bpy.context.active_object
pedestal.name = "Magic_Pedestal"
pedestal.data.materials.append(mat_armor_silver)
pedestal.parent = root

bpy.ops.mesh.primitive_torus_add(major_radius=1.55, minor_radius=0.05, location=(0, 0, 0.18))
ped_ring = bpy.context.active_object
ped_ring.name = "Pedestal_Magic_Ring"
ped_ring.data.materials.append(mat_magic_glow)
ped_ring.parent = root

# 2. THÂN HÌNH CHÚ THỎ (Bunny Body)
bpy.ops.mesh.primitive_uv_sphere_add(segments=26, ring_count=18, radius=0.85, location=(0, 0, 1.15))
body = bpy.context.active_object
body.name = "Rabbit_Body"
body.scale = (0.95, 0.90, 1.25)
bpy.ops.object.shade_smooth()
body.data.materials.append(mat_white_fur)
body.parent = root

# Đuôi tròn xoe cục bông (Fluffy Cotton Tail)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.25, location=(0, 0.82, 0.75))
tail = bpy.context.active_object
tail.name = "Rabbit_Tail"
bpy.ops.object.shade_smooth()
tail.data.materials.append(mat_white_fur)
tail.parent = root

# 3. ÁO CHOÀNG PHÙ THỦY HOÀNG GIA (Mage Robe)
# Vạt áo choàng xòe rộng
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.95, depth=0.95, location=(0, 0, 1.05))
robe = bpy.context.active_object
robe.name = "Mage_Robe"
robe.scale = (1.05, 0.95, 1.0)
bpy.ops.object.shade_smooth()
robe.data.materials.append(mat_robe_purple)
robe.parent = root

# Đai lưng vàng thắt ngọc ma thuật
bpy.ops.mesh.primitive_torus_add(major_radius=0.98, minor_radius=0.06, location=(0, 0, 0.95))
belt = bpy.context.active_object
belt.name = "Robe_Gold_Belt"
belt.data.materials.append(mat_robe_gold)
belt.parent = root

# Giáp hộ tâm ma thuật bằng bạc trên ngực (Arcane Chestplate)
bpy.ops.mesh.primitive_cylinder_add(vertices=18, radius=0.65, depth=0.25, location=(0, -0.45, 1.35))
chest_armor = bpy.context.active_object
chest_armor.name = "Mage_Chest_Armor"
chest_armor.rotation_euler = (math.pi/2, 0, 0)
chest_armor.data.materials.append(mat_armor_silver)
chest_armor.parent = root

# Viên ngọc Nguyệt Tinh phát sáng trên ngực
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.14, location=(0, -0.60, 1.35))
heart_gem = bpy.context.active_object
heart_gem.name = "Heart_Moon_Gem"
heart_gem.data.materials.append(mat_cyan_glow)
heart_gem.parent = root

# 4. ĐẦU CHÚ THỎ (Bunny Head)
bpy.ops.mesh.primitive_uv_sphere_add(segments=26, ring_count=18, radius=0.75, location=(0, -0.05, 2.2))
head = bpy.context.active_object
head.name = "Rabbit_Head"
head.scale = (1.05, 0.98, 1.0)
bpy.ops.object.shade_smooth()
head.data.materials.append(mat_white_fur)
head.parent = root

# Má hồng phúng phính (Rosy Cheeks)
for side, x in [("Left", -0.42), ("Right", 0.42)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.35, location=(x, -0.45, 2.05))
    chk = bpy.context.active_object
    chk.name = f"Rabbit_Cheek_{side}"
    chk.scale = (1.0, 0.75, 0.8)
    bpy.ops.object.shade_smooth()
    chk.data.materials.append(mat_blush)
    chk.parent = root

# Mõm thỏ & Mũi hồng
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.24, location=(0, -0.65, 2.12))
snout = bpy.context.active_object
snout.name = "Rabbit_Snout"
snout.scale = (0.85, 0.6, 0.6)
bpy.ops.object.shade_smooth()
snout.data.materials.append(mat_white_fur)
snout.parent = root

bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.07, location=(0, -0.80, 2.20))
nose = bpy.context.active_object
nose.name = "Rabbit_Nose"
nose.scale = (1.1, 0.8, 0.8)
bpy.ops.object.shade_smooth()
nose.data.materials.append(mat_inner_ear)
nose.parent = root

# ĐÔI MẮT TÍM THẠCH ANH HUYỀN BÍ (Amethyst Eyes)
for side, x in [("Left", -0.32), ("Right", 0.32)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.13, location=(x, -0.60, 2.32))
    eye = bpy.context.active_object
    eye.name = f"Rabbit_Eye_{side}"
    eye.scale = (1.0, 0.8, 1.15)
    bpy.ops.object.shade_smooth()
    eye.data.materials.append(mat_eye_purple)
    eye.parent = root

    # Điểm phản chiếu ánh sáng catchlight
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.04, location=(x + (0.035 if side=="Left" else -0.035), -0.69, 2.40))
    hl = bpy.context.active_object
    hl.name = f"Rabbit_Highlight_{side}"
    hl.data.materials.append(mat_white_fur)
    hl.parent = root

# 5. ĐÔI TAI THỎ DÀI KIÊU HÃNH (Long Majestic Bunny Ears)
for side, x, rot in [("Left", -0.36, 0.12), ("Right", 0.36, -0.12)]:
    # Tai ngoài trắng
    bpy.ops.mesh.primitive_cylinder_add(vertices=18, radius=0.18, depth=1.6, location=(x, 0.05, 3.65))
    ear = bpy.context.active_object
    ear.name = f"Rabbit_Ear_{side}"
    ear.rotation_euler = (-0.1, rot, 0)
    ear.scale = (0.75, 0.35, 1.0)
    bpy.ops.object.shade_smooth()
    ear.data.materials.append(mat_white_fur)
    ear.parent = root

    # Lòng tai hồng phấn
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.12, depth=1.35, location=(x, -0.02, 3.65))
    inner = bpy.context.active_object
    inner.name = f"Rabbit_InnerEar_{side}"
    inner.rotation_euler = (-0.1, rot, 0)
    inner.scale = (0.65, 0.22, 1.0)
    bpy.ops.object.shade_smooth()
    inner.data.materials.append(mat_inner_ear)
    inner.parent = root

# 6. MŨ PHÙ THỦY CHÓP NHỌN (Wizard Mage Hat with Ear Holes)
# Vành mũ rộng uốn lượn viền vàng
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.05, depth=0.10, location=(0, -0.02, 2.75))
hat_brim = bpy.context.active_object
hat_brim.name = "Mage_Hat_Brim"
hat_brim.data.materials.append(mat_robe_purple)
hat_brim.parent = root

bpy.ops.mesh.primitive_torus_add(major_radius=1.05, minor_radius=0.04, location=(0, -0.02, 2.75))
hat_rim_gold = bpy.context.active_object
hat_rim_gold.name = "Mage_Hat_GoldRim"
hat_rim_gold.data.materials.append(mat_robe_gold)
hat_rim_gold.parent = root

# Thân nón phù thủy hình nón nhọn
bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.75, depth=1.3, location=(0, 0.05, 3.35))
hat_cone = bpy.context.active_object
hat_cone.name = "Mage_Hat_Cone"
hat_cone.rotation_euler = (0.15, 0, 0) # Hơi nghiêng nhẹ về sau điệu nghệ
bpy.ops.object.shade_smooth()
hat_cone.data.materials.append(mat_robe_purple)
hat_cone.parent = root

# Ngôi sao / Vầng trăng vàng phát sáng trên chóp mũ
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.12, location=(0, 0.22, 4.05))
hat_star = bpy.context.active_object
hat_star.name = "Hat_Star_Glow"
hat_star.data.materials.append(mat_robe_gold)
hat_star.parent = root

# 7. ĐÔI CHÂN & ỦNG PHÙ THỦY (Boots)
for side, x in [("Left", -0.40), ("Right", 0.40)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.22, depth=0.55, location=(x, -0.05, 0.35))
    boot = bpy.context.active_object
    boot.name = f"Mage_Boot_{side}"
    boot.data.materials.append(mat_robe_purple)
    boot.parent = root

    bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.25, location=(x, -0.22, 0.20))
    toe = bpy.context.active_object
    toe.name = f"Mage_Boot_Toe_{side}"
    toe.scale = (0.85, 1.4, 0.55)
    bpy.ops.object.shade_smooth()
    toe.data.materials.append(mat_robe_gold)
    toe.parent = root

# 8. TAY PHẢI VÀ QUYỀN TRƯỢNG NGUYỆT THẦN (Moon Magic Staff)
# Cánh tay
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.14, depth=0.7, location=(0.85, -0.2, 1.25))
arm_r = bpy.context.active_object
arm_r.name = "Mage_Arm_Right"
arm_r.rotation_euler = (0.3, 0.2, -0.4)
arm_r.data.materials.append(mat_white_fur)
arm_r.parent = root

# Thân gậy gỗ cổ thụ
bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=2.4, location=(1.15, -0.35, 1.45))
staff_body = bpy.context.active_object
staff_body.name = "Staff_Body"
staff_body.data.materials.append(mat_staff_wood)
staff_body.parent = root

# Vầng trăng vàng trên đầu gậy (Moon Crescent Head)
bpy.ops.mesh.primitive_torus_add(major_radius=0.38, minor_radius=0.06, location=(1.15, -0.35, 2.75))
staff_moon = bpy.context.active_object
staff_moon.name = "Staff_Moon_Crescent"
staff_moon.rotation_euler = (0, math.pi/2, 0)
staff_moon.data.materials.append(mat_robe_gold)
staff_moon.parent = root

# Quả Cầu Ma Thuật Tím Phát Sáng (Glowing Arcane Orb)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.22, location=(1.15, -0.35, 2.75))
magic_orb = bpy.context.active_object
magic_orb.name = "Staff_Magic_Orb"
magic_orb.data.materials.append(mat_magic_glow)
magic_orb.parent = root

# 9. TAY TRÁI VÀ SÁCH PHÉP THUẬT CỔ TSUKIEZZ (Ancient Grimoire)
# Cánh tay trái đưa ra đỡ sách
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.14, depth=0.7, location=(-0.85, -0.2, 1.25))
arm_l = bpy.context.active_object
arm_l.name = "Mage_Arm_Left"
arm_l.rotation_euler = (0.3, -0.2, 0.4)
arm_l.data.materials.append(mat_white_fur)
arm_l.parent = root

# Bìa sách da tím
bpy.ops.mesh.primitive_cube_add(size=0.6, location=(-1.15, -0.38, 1.40))
book = bpy.context.active_object
book.name = "Grimoire_Cover"
book.scale = (0.2, 1.2, 0.9)
book.rotation_euler = (0.2, 0.3, -0.4)
book.data.materials.append(mat_grimoire)
book.parent = root

# Trang sách cổ
bpy.ops.mesh.primitive_cube_add(size=0.55, location=(-1.15, -0.38, 1.40))
pages = bpy.context.active_object
pages.name = "Grimoire_Pages"
pages.scale = (0.16, 1.15, 0.85)
pages.rotation_euler = (0.2, 0.3, -0.4)
pages.data.materials.append(mat_pages)
pages.parent = root

# Biểu tượng Cổ Tự Vàng trên bìa sách
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.15, depth=0.04, location=(-1.24, -0.38, 1.40))
rune_sym = bpy.context.active_object
rune_sym.name = "Grimoire_Rune"
rune_sym.rotation_euler = (0, math.pi/2, 0)
rune_sym.data.materials.append(mat_cyan_glow)
rune_sym.parent = root

# 10. HỆ THỐNG ĐÈN STUDIO MYSTIC 3D
for obj in bpy.data.objects:
    if obj.type == 'LIGHT':
        bpy.data.objects.remove(obj, do_unlink=True)

# Key Light tím hồng ma thuật
bpy.ops.object.light_add(type='POINT', location=(3.5, -4.0, 4.5))
l1 = bpy.context.active_object
l1.name = "Mystic_Key_Light"
l1.data.energy = 550
l1.data.color = (0.9, 0.5, 1.0)

# Fill Light xanh ngọc dịu dàng
bpy.ops.object.light_add(type='POINT', location=(-4.0, -3.0, 3.5))
l2 = bpy.context.active_object
l2.name = "Moon_Fill_Light"
l2.data.energy = 300
l2.data.color = (0.2, 0.9, 1.0)

# Rim Light vàng hoàng gia từ sau
bpy.ops.object.light_add(type='POINT', location=(0.0, 4.0, 4.5))
l3 = bpy.context.active_object
l3.name = "Gold_Rim_Light"
l3.data.energy = 450
l3.data.color = (1.0, 0.85, 0.4)

# Chỉnh Camera View góc đẹp
if "Camera" in bpy.data.objects:
    cam = bpy.data.objects["Camera"]
    cam.location = (0.0, -5.5, 2.5)
    cam.rotation_euler = (math.radians(76), 0, 0)

# Đảm bảo hiển thị Material Shading cho Viewport
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'MATERIAL'
                    space.shading.color_type = 'MATERIAL'

# 11. XUẤT RA THƯ MỤC BLENDER RIÊNG ĐÃ ĐƯỢC QUẢN LÝ
char_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Characters"
os.makedirs(char_dir, exist_ok=True)

blend_file = os.path.join(char_dir, "RabbitMageWarrior.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_file)

fbx_file = os.path.join(char_dir, "RabbitMageWarrior.fbx")
try:
    bpy.ops.export_scene.fbx(
        filepath=fbx_file,
        use_selection=False,
        apply_scale_options='FBX_SCALE_ALL',
        axis_forward='-Z',
        axis_up='Y'
    )
    print("RABBIT_MAGE_FBX_EXPORTED:", fbx_file)
except Exception as e:
    print("FBX Export error:", e)

# Lưu thêm một bản vào Assets/Art/Models/ để Unity dùng ngay
models_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Models"
os.makedirs(models_dir, exist_ok=True)
try:
    import shutil
    shutil.copy2(blend_file, os.path.join(models_dir, "RabbitMageWarrior.blend"))
    shutil.copy2(fbx_file, os.path.join(models_dir, "RabbitMageWarrior.fbx"))
except Exception as e:
    pass

print("RABBIT_MAGE_WARRIOR_CREATED_SUCCESSFULLY")
'''

def main():
    bridge = BlenderAIBridge()
    print("🚀 Đang gửi lệnh tạo 'Thỏ Phù Thủy Chiến Binh' vào Blender...")
    res = bridge.execute_code(RABBIT_MAGE_CODE)
    import json
    print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
