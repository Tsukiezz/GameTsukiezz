import bpy
import math
import os

print("=== BẮT ĐẦU TẠO CHIẾN BINH CHUỘT HAMSTER (PHIÊN BẢN REMAKE) TRONG BLENDER ===")

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper tạo vật liệu Principled BSDF
def create_mat(name, base_color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_fur = create_mat("Hamster_Fur", (0.92, 0.52, 0.16, 1.0), roughness=0.85)
mat_fur_light = create_mat("Hamster_Belly", (0.98, 0.95, 0.90, 1.0), roughness=0.9)
mat_pink = create_mat("Hamster_Pink", (0.96, 0.55, 0.60, 1.0), roughness=0.6)
mat_eyes = create_mat("Hamster_Eyes", (0.02, 0.02, 0.02, 1.0), roughness=0.1)

mat_steel = create_mat("Armor_Steel", (0.65, 0.70, 0.78, 1.0), roughness=0.35, metallic=0.92)
mat_steel_dark = create_mat("Armor_SteelDark", (0.35, 0.38, 0.45, 1.0), roughness=0.45, metallic=0.85)
mat_leather = create_mat("Armor_Leather", (0.38, 0.22, 0.12, 1.0), roughness=0.75)
mat_cape = create_mat("Hero_CapeRed", (0.85, 0.04, 0.12, 1.0), roughness=0.7)
mat_wood = create_mat("Shield_Wood", (0.48, 0.26, 0.12, 1.0), roughness=0.7)

mat_rock = create_mat("Mossy_Rock", (0.32, 0.38, 0.30, 1.0), roughness=0.9)
mat_shroom_cap = create_mat("Shroom_Cap", (0.88, 0.05, 0.14, 1.0), roughness=0.35)
mat_shroom_stem = create_mat("Shroom_Stem", (0.96, 0.93, 0.86, 1.0), roughness=0.8)

# 1. Thân & Bụng
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.7, location=(0, 0, 0.85))
body = bpy.context.active_object
body.name = "Hamster_Body"
body.scale = (1.05, 0.95, 1.15)
body.data.materials.append(mat_fur)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.55, location=(0, -0.32, 0.8))
belly = bpy.context.active_object
belly.name = "Hamster_Belly"
belly.scale = (0.85, 0.5, 0.95)
belly.data.materials.append(mat_fur_light)

# 2. Đầu, Má & Mắt
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.62, location=(0, 0, 1.6))
head = bpy.context.active_object
head.name = "Hamster_Head"
head.data.materials.append(mat_fur)

for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(side * 0.38, -0.35, 1.5))
    chk = bpy.context.active_object
    chk.name = f"Cheek_{side}"
    chk.data.materials.append(mat_fur)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(side * 0.32, -0.5, 1.68))
    eye = bpy.context.active_object
    eye.name = f"Eye_{side}"
    eye.data.materials.append(mat_eyes)

# Mũi hồng
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(0, -0.58, 1.58))
nose = bpy.context.active_object
nose.name = "Hamster_Nose"
nose.data.materials.append(mat_pink)

# Tai tròn peeking
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(side * 0.45, 0.05, 2.05))
    ear = bpy.context.active_object
    ear.name = f"Ear_{side}"
    ear.scale = (0.9, 0.4, 1.1)
    ear.rotation_euler = (0, side * 0.3, 0)
    ear.data.materials.append(mat_fur)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(side * 0.44, -0.02, 2.05))
    ear_in = bpy.context.active_object
    ear_in.name = f"Ear_Inner_{side}"
    ear_in.scale = (0.8, 0.3, 1.0)
    ear_in.rotation_euler = (0, side * 0.3, 0)
    ear_in.data.materials.append(mat_pink)

# 3. Mũ Giáp Hiệp Sĩ (Knight Helmet with Spike & Brow)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.58, location=(0, 0, 1.95))
helm = bpy.context.active_object
helm.name = "Knight_Helmet_Dome"
helm.scale = (1.02, 1.0, 0.72)
helm.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=0.16, location=(0, 0, 1.9))
brow = bpy.context.active_object
brow.name = "Helmet_Brow"
brow.data.materials.append(mat_steel_dark)

bpy.ops.mesh.primitive_cube_add(size=0.15, location=(0, -0.58, 1.75))
ng = bpy.context.active_object
ng.name = "Helmet_NoseGuard"
ng.scale = (0.5, 0.4, 1.5)
ng.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_cone_add(radius1=0.1, depth=0.35, location=(0, 0, 2.4))
spike = bpy.context.active_object
spike.name = "Helmet_Spike"
spike.data.materials.append(mat_steel)

# 4. Giáp Vảy & Thắt Lưng
bpy.ops.mesh.primitive_cylinder_add(radius=0.72, depth=0.55, location=(0, 0, 0.95))
armor = bpy.context.active_object
armor.name = "Scale_Armor"
armor.data.materials.append(mat_steel_dark)

bpy.ops.mesh.primitive_torus_add(major_radius=0.73, minor_radius=0.04, location=(0, 0, 0.8))
belt = bpy.context.active_object
belt.name = "Leather_Belt"
belt.data.materials.append(mat_leather)

# 5. Áo Choàng Đỏ (Hero Cape)
bpy.ops.mesh.primitive_plane_add(size=1.2, location=(0, 0.45, 1.1))
cape = bpy.context.active_object
cape.name = "Crimson_Cape"
cape.scale = (0.9, 1.4, 1.0)
cape.rotation_euler = (0.35, 0, 0)
cape.data.materials.append(mat_cape)

bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.06, location=(0, -0.4, 1.25))
clasp = bpy.context.active_object
clasp.name = "Cape_Clasp"
clasp.rotation_euler = (1.57, 0, 0)
clasp.data.materials.append(mat_steel)

# 6. Kiếm Thép Cận Chiến (Sword)
bpy.ops.mesh.primitive_cube_add(size=0.1, location=(0.85, -0.3, 1.1))
sword = bpy.context.active_object
sword.name = "Steel_Sword"
sword.scale = (0.3, 0.8, 8.5)
sword.rotation_euler = (0.2, 0.3, -0.2)
sword.data.materials.append(mat_steel)

# 7. Khiên Tròn Gỗ Viền Sắt (Round Wooden Buckler Shield)
bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=0.08, location=(-0.85, -0.2, 1.0))
shield = bpy.context.active_object
shield.name = "Wooden_Buckler_Shield"
shield.rotation_euler = (0, 1.57, 0)
shield.data.materials.append(mat_wood)

bpy.ops.mesh.primitive_torus_add(major_radius=0.5, minor_radius=0.04, location=(-0.85, -0.2, 1.0))
sh_rim = bpy.context.active_object
sh_rim.name = "Shield_Steel_Rim"
sh_rim.rotation_euler = (0, 1.57, 0)
sh_rim.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(-0.9, -0.2, 1.0))
sh_boss = bpy.context.active_object
sh_boss.name = "Shield_Center_Boss"
sh_boss.scale = (0.5, 1.0, 1.0)
sh_boss.data.materials.append(mat_steel)

# 8. Bàn chân & Chân
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(side * 0.35, -0.15, 0.15))
    foot = bpy.context.active_object
    foot.name = f"Foot_{side}"
    foot.scale = (0.9, 1.5, 0.5)
    foot.data.materials.append(mat_pink)

# 9. Tảng Đá Rêu & Cây Nấm Đỏ
bpy.ops.mesh.primitive_cylinder_add(radius=1.4, depth=0.4, location=(0, 0, -0.05))
rock = bpy.context.active_object
rock.name = "Mossy_Rock_Pedestal"
rock.data.materials.append(mat_rock)

mush_pos = [(-1.1, -0.8, 0.15, 0.6), (-1.3, -0.4, 0.15, 0.45), (1.1, -0.7, 0.15, 0.55), (1.2, 0.6, 0.15, 0.5)]
for i, (mx, my, mz, sc) in enumerate(mush_pos):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08 * sc, depth=0.5 * sc, location=(mx, my, mz + 0.2 * sc))
    stem = bpy.context.active_object
    stem.name = f"Mushroom_Stem_{i}"
    stem.data.materials.append(mat_shroom_stem)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35 * sc, location=(mx, my, mz + 0.45 * sc))
    cap = bpy.context.active_object
    cap.name = f"Mushroom_Cap_{i}"
    cap.scale = (1.0, 1.0, 0.65)
    cap.data.materials.append(mat_shroom_cap)

# Tạo ánh sáng & camera xem thử
bpy.ops.object.light_add(type='SUN', location=(4, -4, 8))
sun = bpy.context.active_object
sun.data.energy = 3.5

bpy.ops.object.light_add(type='POINT', location=(-3, -3, 3))
point_light = bpy.context.active_object
point_light.data.energy = 50.0

# Lưu file .blend và xuất .fbx
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Characters"
os.makedirs(output_dir, exist_ok=True)

blend_path = os.path.join(output_dir, "HamsterWarrior.blend")
fbx_path = os.path.join(output_dir, "HamsterWarrior.fbx")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)

print(f"✅ ĐÃ HOÀN TẤT VÀ LƯU THÀNH CÔNG:")
print(f"  - Blend: {blend_path}")
print(f"  - FBX: {fbx_path}")
