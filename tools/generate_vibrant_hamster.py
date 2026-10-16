import bpy
import math
import os

output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Models"
os.makedirs(output_dir, exist_ok=True)

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper tạo Material với cả Shader Node và Viewport Display Color (Solid Viewport)
def create_vibrant_material(name, base_color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    
    # Thiết lập màu hiển thị trong chế độ Solid (Viewport Display)
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

# BẢNG MÀU SINH ĐỘNG (VIBRANT COLOR PALETTE)
mat_fur_main    = create_vibrant_material("Mat_Fur_GoldenAmber",   (0.97, 0.52, 0.05, 1.0), roughness=0.8) # Vàng cam hổ phách
mat_fur_dark    = create_vibrant_material("Mat_Fur_DarkChestnut",  (0.38, 0.18, 0.10, 1.0), roughness=0.8) # Nâu sẫm vành tai
mat_belly       = create_vibrant_material("Mat_Fur_SnowCream",     (0.98, 0.96, 0.92, 1.0), roughness=0.8) # Bụng trắng kem
mat_blush       = create_vibrant_material("Mat_Cheek_BlushPink",   (1.00, 0.45, 0.58, 1.0), roughness=0.7) # Má hồng phúng phính
mat_nose_pink   = create_vibrant_material("Mat_Nose_SoftPink",     (0.95, 0.58, 0.68, 1.0), roughness=0.5) # Mũi hồng ngọt ngào
mat_eye_black   = create_vibrant_material("Mat_Eye_DeepBlack",     (0.02, 0.02, 0.02, 1.0), roughness=0.1) # Mắt đen láy bóng
mat_eye_iris    = create_vibrant_material("Mat_Eye_SapphireBlue",  (0.10, 0.35, 0.85, 1.0), roughness=0.2) # Tròng xanh sapphire
mat_steel       = create_vibrant_material("Mat_Armor_TitaniumSteel",(0.78, 0.82, 0.88, 1.0), metallic=0.92, roughness=0.25) # Giáp thép bạc
mat_gold        = create_vibrant_material("Mat_Armor_RoyalGold",   (1.00, 0.82, 0.15, 1.0), metallic=0.95, roughness=0.20) # Vàng ròng hoàng gia
mat_ruby        = create_vibrant_material("Mat_Gem_RoyalRuby",     (0.92, 0.12, 0.22, 1.0), roughness=0.15, emission_color=(1.0, 0.1, 0.2, 1.0), emission_strength=1.5) # Ngọc ruby đỏ
mat_cape        = create_vibrant_material("Mat_Cape_CrimsonRed",   (0.85, 0.08, 0.15, 1.0), roughness=0.65) # Áo choàng đỏ nhung
mat_shield_face = create_vibrant_material("Mat_Shield_CobaltBlue", (0.08, 0.15, 0.32, 1.0), metallic=0.7, roughness=0.3) # Mặt khiên xanh cobalt
mat_moon_glow   = create_vibrant_material("Mat_Moon_CyanGlow",     (0.00, 0.95, 0.85, 1.0), emission_color=(0.1, 0.98, 0.9, 1.0), emission_strength=5.0) # Vầng trăng phát sáng neon
mat_leather     = create_vibrant_material("Mat_Leather_Brown",     (0.45, 0.25, 0.12, 1.0), roughness=0.75) # Dây da thắt lưng
mat_pedestal    = create_vibrant_material("Mat_Ancient_Pedestal",   (0.30, 0.34, 0.38, 1.0), roughness=0.9) # Bệ đá cổ

# ROOT OBJECT
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
root = bpy.context.active_object
root.name = "Hamster_Warrior"

# 1. BỆ ĐÁ CỔ DƯỚI CHÂN (Ancient Pedestal)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.6, depth=0.2, location=(0, 0, 0.1))
pedestal = bpy.context.active_object
pedestal.name = "Pedestal"
pedestal.data.materials.append(mat_pedestal)
pedestal.parent = root

# 2. THÂN HÌNH BÉO TRÒN (Chubby Body)
bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.95, location=(0, 0, 1.05))
body = bpy.context.active_object
body.name = "Hamster_Body"
body.scale = (1.05, 0.95, 1.15)
bpy.ops.object.shade_smooth()
body.data.materials.append(mat_fur_main)
body.parent = root

# Bụng trắng kem tuyết
bpy.ops.mesh.primitive_uv_sphere_add(segments=22, ring_count=16, radius=0.72, location=(0, -0.42, 1.0))
belly = bpy.context.active_object
belly.name = "Hamster_Belly"
belly.scale = (0.85, 0.5, 0.95)
bpy.ops.object.shade_smooth()
belly.data.materials.append(mat_belly)
belly.parent = root

# Sọc lông sống lưng màu sẫm
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.55, location=(0, 0.52, 1.1))
back_stripe = bpy.context.active_object
back_stripe.name = "Back_Stripe"
back_stripe.scale = (0.35, 0.6, 1.1)
bpy.ops.object.shade_smooth()
back_stripe.data.materials.append(mat_fur_dark)
back_stripe.parent = root

# 3. ĐẦU (Head)
bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.8, location=(0, -0.1, 2.0))
head = bpy.context.active_object
head.name = "Hamster_Head"
head.scale = (1.1, 1.0, 0.95)
bpy.ops.object.shade_smooth()
head.data.materials.append(mat_fur_main)
head.parent = root

# Đôi má phúng phính phớt hồng rực rỡ (Chubby Rosy Cheeks)
for side, x in [("Left", -0.46), ("Right", 0.46)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.42, location=(x, -0.52, 1.85))
    cheek = bpy.context.active_object
    cheek.name = f"Cheek_{side}"
    cheek.scale = (1.0, 0.82, 0.85)
    bpy.ops.object.shade_smooth()
    cheek.data.materials.append(mat_blush)
    cheek.parent = root

# Mõm trắng và Mũi hồng
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.3, location=(0, -0.74, 1.95))
snout = bpy.context.active_object
snout.name = "Hamster_Snout"
snout.scale = (0.85, 0.65, 0.65)
bpy.ops.object.shade_smooth()
snout.data.materials.append(mat_belly)
snout.parent = root

bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.09, location=(0, -0.92, 2.02))
nose = bpy.context.active_object
nose.name = "Hamster_Nose"
nose.scale = (1.2, 0.8, 0.8)
bpy.ops.object.shade_smooth()
nose.data.materials.append(mat_nose_pink)
nose.parent = root

# Đôi mắt to tròn Sapphire với điểm bắt sáng (Eyes)
for side, x in [("Left", -0.38), ("Right", 0.38)]:
    # Tròng đen
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.14, location=(x, -0.70, 2.15))
    eye = bpy.context.active_object
    eye.name = f"Eye_{side}"
    eye.scale = (1.0, 0.8, 1.1)
    bpy.ops.object.shade_smooth()
    eye.data.materials.append(mat_eye_black)
    eye.parent = root
    
    # Vòng mắt xanh Sapphire long lanh
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.11, depth=0.03, location=(x, -0.76, 2.15))
    iris = bpy.context.active_object
    iris.name = f"Iris_{side}"
    iris.rotation_euler = (math.pi/2, 0, 0)
    iris.data.materials.append(mat_eye_iris)
    iris.parent = root

    # Điểm phản chiếu ánh sáng 1 (Catchlight to)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.04, location=(x + (0.04 if side=="Left" else -0.04), -0.79, 2.22))
    hl1 = bpy.context.active_object
    hl1.name = f"Highlight_Big_{side}"
    hl1.data.materials.append(mat_belly)
    hl1.parent = root

    # Điểm phản chiếu ánh sáng 2 (Catchlight nhỏ)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.02, location=(x - (0.02 if side=="Left" else -0.02), -0.78, 2.11))
    hl2 = bpy.context.active_object
    hl2.name = f"Highlight_Small_{side}"
    hl2.data.materials.append(mat_belly)
    hl2.parent = root

# ĐÔI TAI TRÒN VÀNH NÂU SẪM (Ears with dark tips)
for side, x, rot in [("Left", -0.58, 0.32), ("Right", 0.58, -0.32)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.32, location=(x, -0.05, 2.75))
    ear = bpy.context.active_object
    ear.name = f"Ear_{side}"
    ear.rotation_euler = (0, rot, 0)
    ear.scale = (0.8, 0.35, 0.9)
    bpy.ops.object.shade_smooth()
    ear.data.materials.append(mat_fur_dark)
    ear.parent = root

    # Lòng tai hồng đào
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.22, location=(x, -0.13, 2.75))
    inner = bpy.context.active_object
    inner.name = f"Ear_Inner_{side}"
    inner.rotation_euler = (0, rot, 0)
    inner.scale = (0.7, 0.25, 0.8)
    bpy.ops.object.shade_smooth()
    inner.data.materials.append(mat_blush)
    inner.parent = root

# 4. MŨ GIÁP HIỆP SĨ HOÀNG GIA (Royal Knight Helmet)
# Viền vàng mũ
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.76, depth=0.25, location=(0, -0.05, 2.52))
helm_rim = bpy.context.active_object
helm_rim.name = "Helmet_Rim"
helm_rim.scale = (1.05, 1.05, 0.6)
helm_rim.data.materials.append(mat_gold)
helm_rim.parent = root

# Vòm mũ thép bạc
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.73, location=(0, -0.05, 2.60))
helm_dome = bpy.context.active_object
helm_dome.name = "Helmet_Dome"
helm_dome.scale = (1.0, 0.95, 0.68)
bpy.ops.object.shade_smooth()
helm_dome.data.materials.append(mat_steel)
helm_dome.parent = root

# Viên ngọc Ruby đỏ rực giữa trán
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.10, location=(0, -0.80, 2.56))
ruby = bpy.context.active_object
ruby.name = "Helmet_Ruby_Gem"
ruby.data.materials.append(mat_ruby)
ruby.parent = root

# Chỏm lông mũ đỏ rực anh hùng (Plume)
bpy.ops.mesh.primitive_cube_add(size=0.35, location=(0, 0.18, 3.05))
plume = bpy.context.active_object
plume.name = "Helmet_Plume"
plume.scale = (0.28, 1.45, 0.75)
plume.rotation_euler = (-0.35, 0, 0)
bpy.ops.object.shade_smooth()
plume.data.materials.append(mat_cape)
plume.parent = root

# 5. GIÁP NGỰC HOÀNG GIA (Royal Chestplate Armor)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.92, depth=0.62, location=(0, -0.05, 1.10))
chestplate = bpy.context.active_object
chestplate.name = "Warrior_Chestplate"
chestplate.scale = (1.03, 0.93, 0.9)
bpy.ops.object.shade_smooth()
chestplate.data.materials.append(mat_steel)
chestplate.parent = root

# Viền đai da nâu quanh bụng
bpy.ops.mesh.primitive_torus_add(major_radius=0.95, minor_radius=0.06, location=(0, -0.05, 0.85))
belt = bpy.context.active_object
belt.name = "Leather_Belt"
belt.data.materials.append(mat_leather)
belt.parent = root

# Huy hiệu vàng hoàng gia trên ngực
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.28, depth=0.1, location=(0, -0.94, 1.18))
emblem = bpy.context.active_object
emblem.name = "Chest_Gold_Emblem"
emblem.rotation_euler = (math.pi/2, 0, 0)
emblem.data.materials.append(mat_gold)
emblem.parent = root

# Viên ngọc xanh biển đính giữa ngực
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.10, location=(0, -1.02, 1.18))
chest_gem = bpy.context.active_object
chest_gem.name = "Chest_Sapphire"
chest_gem.data.materials.append(mat_eye_iris)
chest_gem.parent = root

# 6. ĐÔI ỦNG SẮT CHIẾN BINH (Iron Boots with Gold Buckles)
for side, x in [("Left", -0.48), ("Right", 0.48)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.32, location=(x, -0.15, 0.25))
    foot = bpy.context.active_object
    foot.name = f"Foot_{side}"
    foot.scale = (0.85, 1.45, 0.6)
    bpy.ops.object.shade_smooth()
    foot.data.materials.append(mat_steel)
    foot.parent = root

    # Khóa vàng trên giày
    bpy.ops.mesh.primitive_cube_add(size=0.12, location=(x, -0.55, 0.32))
    buckle = bpy.context.active_object
    buckle.name = f"Boot_Buckle_{side}"
    buckle.scale = (1.2, 0.3, 0.8)
    buckle.data.materials.append(mat_gold)
    buckle.parent = root

# Đuôi tròn nhỏ
bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.2, location=(0, 0.90, 0.68))
tail = bpy.context.active_object
tail.name = "Hamster_Tail"
bpy.ops.object.shade_smooth()
tail.data.materials.append(mat_belly)
tail.parent = root

# 7. ÁO CHOÀNG NHUNG ĐỎ VIỀN VÀNG (Crimson Cape with Gold Trim)
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0.72, 1.30))
cape = bpy.context.active_object
cape.name = "Warrior_Cape"
cape.scale = (0.98, 1.65, 1.0)
cape.rotation_euler = (1.25, 0, 0)
bpy.ops.object.shade_smooth()
cape.data.materials.append(mat_cape)
cape.parent = root

# 8. TAY PHẢI CẦM THANH KIẾM HIỆP SĨ (Right Arm & Blade)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.25, location=(0.98, -0.22, 1.18))
arm_r = bpy.context.active_object
arm_r.name = "Arm_Right"
arm_r.scale = (1.2, 0.8, 0.8)
arm_r.data.materials.append(mat_steel)
arm_r.parent = root

# Cán kiếm mạ vàng
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.65, location=(1.22, -0.32, 1.18))
hilt = bpy.context.active_object
hilt.name = "Sword_Hilt"
hilt.data.materials.append(mat_gold)
hilt.parent = root

# Đốc kiếm gắn ngọc Ruby
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.08, location=(1.22, -0.32, 0.82))
pommel = bpy.context.active_object
pommel.name = "Sword_Pommel_Gem"
pommel.data.materials.append(mat_ruby)
pommel.parent = root

# Chắn tay kiếm
bpy.ops.mesh.primitive_cube_add(size=0.22, location=(1.22, -0.32, 1.48))
guard = bpy.context.active_object
guard.name = "Sword_Guard"
guard.scale = (0.45, 1.6, 0.3)
guard.data.materials.append(mat_gold)
guard.parent = root

# Lưỡi kiếm bạc khắc rãnh sáng
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(1.22, -0.32, 2.25))
blade = bpy.context.active_object
blade.name = "Sword_Blade"
blade.scale = (0.055, 0.17, 1.25)
bpy.ops.object.shade_smooth()
blade.data.materials.append(mat_steel)
blade.parent = root

# Cổ ngữ phát sáng trên kiếm
bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=1.6, location=(1.22, -0.32, 2.25))
rune_line = bpy.context.active_object
rune_line.name = "Sword_Rune_Glow"
rune_line.data.materials.append(mat_moon_glow)
rune_line.parent = root

# 9. TAY TRÁI MANG KHIÊN NGUYỆT TINH XANH COBALT (Left Arm & Moon Shield)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.25, location=(-0.98, -0.22, 1.18))
arm_l = bpy.context.active_object
arm_l.name = "Arm_Left"
arm_l.scale = (1.2, 0.8, 0.8)
arm_l.data.materials.append(mat_steel)
arm_l.parent = root

# Mặt khiên xanh cobalt
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.62, depth=0.12, location=(-1.22, -0.42, 1.18))
shield = bpy.context.active_object
shield.name = "Warrior_Shield"
shield.rotation_euler = (0, math.pi/2, 0)
shield.data.materials.append(mat_shield_face)
shield.parent = root

# Vành khiên vàng chạm nổi
bpy.ops.mesh.primitive_torus_add(major_radius=0.62, minor_radius=0.05, location=(-1.27, -0.42, 1.18))
rim = bpy.context.active_object
rim.name = "Shield_Gold_Rim"
rim.rotation_euler = (0, math.pi/2, 0)
rim.data.materials.append(mat_gold)
rim.parent = root

# Biểu tượng Vầng Trăng Khuyết Tsukiezz phát sáng rực rỡ (Cyan Moon Rune)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.26, depth=0.10, location=(-1.30, -0.42, 1.18))
emblem_moon = bpy.context.active_object
emblem_moon.name = "Shield_Moon_Emblem"
emblem_moon.rotation_euler = (0, math.pi/2, 0)
emblem_moon.data.materials.append(mat_moon_glow)
emblem_moon.parent = root

# 10. STUDIO LIGHTING HỆ THỐNG ÁNH SÁNG 3 ĐIỂM
# Xóa đèn cũ nếu có
for obj in bpy.data.objects:
    if obj.type == 'LIGHT':
        bpy.data.objects.remove(obj, do_unlink=True)

# Key Light (Ánh sáng chính vàng ấm)
bpy.ops.object.light_add(type='POINT', location=(3.5, -4.0, 4.5))
key_light = bpy.context.active_object
key_light.name = "Key_Light"
key_light.data.energy = 500
key_light.data.color = (1.0, 0.95, 0.85)

# Fill Light (Ánh sáng bù tím xanh huyền bí)
bpy.ops.object.light_add(type='POINT', location=(-4.0, -3.0, 3.5))
fill_light = bpy.context.active_object
fill_light.name = "Fill_Light"
fill_light.data.energy = 250
fill_light.data.color = (0.4, 0.6, 1.0)

# Rim Light (Đèn viền Neon làm nổi bật đường nét)
bpy.ops.object.light_add(type='POINT', location=(0.0, 4.0, 4.0))
rim_light = bpy.context.active_object
rim_light.name = "Rim_Light"
rim_light.data.energy = 400
rim_light.data.color = (0.2, 0.9, 1.0)

# Chỉnh Camera góc đẹp ngắm nhìn nhân vật
if "Camera" in bpy.data.objects:
    cam = bpy.data.objects["Camera"]
    cam.location = (0.0, -5.2, 2.2)
    cam.rotation_euler = (math.radians(78), 0, 0)

# Đảm bảo hiển thị Material Shading cho Viewport
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'MATERIAL'
                    space.shading.color_type = 'MATERIAL'

# LƯU FILE .BLEND VÀ XUẤT SANG UNITY .FBX
blend_save = os.path.join(output_dir, "HamsterWarrior.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_save)

fbx_save = os.path.join(output_dir, "HamsterWarrior.fbx")
try:
    bpy.ops.export_scene.fbx(
        filepath=fbx_save,
        use_selection=False,
        apply_scale_options='FBX_SCALE_ALL',
        axis_forward='-Z',
        axis_up='Y'
    )
    print("VIBRANT_FBX_EXPORTED:", fbx_save)
except Exception as e:
    print("FBX Export error:", e)

print("VIBRANT_HAMSTER_WARRIOR_COMPLETED_SUCCESSFULLY")
