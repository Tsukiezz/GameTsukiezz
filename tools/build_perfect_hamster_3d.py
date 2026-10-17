import bpy
import math
import os

print("=== TẠO MÔ HÌNH 3D CHIẾN BINH CHUỘT HAMSTER ĐỈNH CAO THEO ĐÚNG HÌNH MẪU ===")

bpy.ops.wm.read_factory_settings(use_empty=True)

# -----------------------------------------------------------------------------
# 1. VẬT LIỆU
# -----------------------------------------------------------------------------
def make_mat(name, color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_fur_tan = make_mat("Fur_GoldenTan", (0.88, 0.52, 0.20, 1.0), roughness=0.7)
mat_fur_white = make_mat("Fur_CreamWhite", (0.97, 0.95, 0.90, 1.0), roughness=0.75)
mat_pink = make_mat("Skin_Pink", (0.96, 0.60, 0.65, 1.0), roughness=0.5)

mat_eye_black = make_mat("Eye_GlossBlack", (0.01, 0.01, 0.01, 1.0), roughness=0.04)
mat_twinkle = make_mat("Eye_TwinkleWhite", (1.0, 1.0, 1.0, 1.0), roughness=0.1)

mat_steel = make_mat("Armor_Steel", (0.68, 0.72, 0.80, 1.0), roughness=0.25, metallic=0.95)
mat_steel_dark = make_mat("Armor_SteelDark", (0.35, 0.38, 0.44, 1.0), roughness=0.40, metallic=0.90)
mat_leather = make_mat("Leather_Brown", (0.38, 0.20, 0.10, 1.0), roughness=0.75)
mat_leather_dark = make_mat("Leather_Dark", (0.22, 0.12, 0.06, 1.0), roughness=0.80)
mat_cape = make_mat("Cape_CrimsonRed", (0.85, 0.04, 0.08, 1.0), roughness=0.60)
mat_wood = make_mat("Shield_WoodPlanks", (0.50, 0.28, 0.14, 1.0), roughness=0.65)

mat_rock = make_mat("Pedestal_Rock", (0.32, 0.38, 0.28, 1.0), roughness=0.9)
mat_moss = make_mat("Pedestal_Moss", (0.24, 0.45, 0.18, 1.0), roughness=0.85)
mat_shroom_red = make_mat("Shroom_Red", (0.88, 0.05, 0.10, 1.0), roughness=0.35)
mat_shroom_stem = make_mat("Shroom_Stem", (0.96, 0.94, 0.88, 1.0), roughness=0.8)
mat_shroom_dot = make_mat("Shroom_Dot", (1.0, 1.0, 1.0, 1.0), roughness=0.4)

def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def subsurf(obj, lv=1):
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = lv
    m.render_levels = lv

# -----------------------------------------------------------------------------
# 2. CƠ THỂ CHUỘT HAMSTER (CHUBBY & CUTE)
# -----------------------------------------------------------------------------
# Thân chính (Body)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.65, location=(0, 0, 0.70), segments=32, ring_count=24)
body = bpy.context.active_object
body.name = "Hamster_Body"
body.scale = (1.05, 0.85, 1.15)
smooth(body)
subsurf(body, 1)
body.data.materials.append(mat_fur_tan)

# Bụng trắng tròn nhô rõ ra phía trước (White Belly)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.58, location=(0, -0.18, 0.68), segments=32, ring_count=24)
belly = bpy.context.active_object
belly.name = "Hamster_Belly"
belly.scale = (0.86, 0.75, 0.95)
smooth(belly)
subsurf(belly, 1)
belly.data.materials.append(mat_fur_white)

# Đầu chú chuột (Head)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.50, location=(0, 0, 1.22), segments=32, ring_count=24)
head = bpy.context.active_object
head.name = "Hamster_Head"
head.scale = (1.05, 0.90, 0.95)
smooth(head)
subsurf(head, 1)
head.data.materials.append(mat_fur_tan)

# Má phúng phính (Cheeks)
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(side * 0.32, -0.16, 1.14), segments=20, ring_count=14)
    chk = bpy.context.active_object
    chk.name = f"Cheek_{side}"
    chk.scale = (1.0, 0.85, 0.85)
    smooth(chk)
    subsurf(chk, 1)
    chk.data.materials.append(mat_fur_tan)

# Mảng trắng cằm & mõm (White Muzzle)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(0, -0.22, 1.12), segments=24, ring_count=16)
muzzle = bpy.context.active_object
muzzle.name = "Muzzle_White"
muzzle.scale = (0.85, 0.85, 0.70)
smooth(muzzle)
subsurf(muzzle, 1)
muzzle.data.materials.append(mat_fur_white)

# Mũi hồng nhỏ xinh (Pink Nose)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.055, location=(0, -0.50, 1.18), segments=16, ring_count=12)
nose = bpy.context.active_object
nose.name = "Nose_Pink"
nose.scale = (1.1, 0.8, 0.9)
smooth(nose)
nose.data.materials.append(mat_pink)

# Miệng chúm chím quyết tâm (Determined Mouth)
for m_side in [-1, 1]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.065, location=(m_side * 0.026, -0.49, 1.12))
    mw = bpy.context.active_object
    mw.name = f"Mouth_{m_side}"
    mw.rotation_euler = (0, 0, m_side * 0.45)
    smooth(mw)
    mw.data.materials.append(mat_leather)

# Đôi mắt Anime to tròn lấp lánh (Sparkling Anime Eyes)
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(side * 0.20, -0.42, 1.26), segments=24, ring_count=18)
    eye = bpy.context.active_object
    eye.name = f"Eye_{side}"
    eye.scale = (0.9, 0.55, 1.05)
    smooth(eye)
    eye.data.materials.append(mat_eye_black)

    # Điểm sáng lớn
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.032, location=(side * 0.18 + 0.01, -0.47, 1.30), segments=12, ring_count=8)
    tw1 = bpy.context.active_object
    tw1.name = f"Twinkle1_{side}"
    smooth(tw1)
    tw1.data.materials.append(mat_twinkle)

    # Điểm sáng nhỏ
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, location=(side * 0.21 - 0.01, -0.46, 1.23), segments=12, ring_count=8)
    tw2 = bpy.context.active_object
    tw2.name = f"Twinkle2_{side}"
    smooth(tw2)
    tw2.data.materials.append(mat_twinkle)

# Ria mép (Whiskers)
for side in [-1, 1]:
    for w_i, w_rot in enumerate([-0.12, 0.0, 0.12]):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.25, location=(side * 0.36, -0.32, 1.14 + w_i * 0.03))
        whisk = bpy.context.active_object
        whisk.name = f"Whisker_{side}_{w_i}"
        whisk.rotation_euler = (0, 1.57 * side, w_rot)
        smooth(whisk)
        whisk.data.materials.append(mat_steel_dark)

# Đôi tai tròn xoe vểnh ra hai bên mũ (Round Hamster Ears)
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.20, location=(side * 0.42, 0.02, 1.54), segments=24, ring_count=18)
    ear_o = bpy.context.active_object
    ear_o.name = f"Ear_Outer_{side}"
    ear_o.scale = (0.9, 0.35, 1.1)
    ear_o.rotation_euler = (0.1, side * 0.35, -side * 0.12)
    smooth(ear_o)
    subsurf(ear_o, 1)
    ear_o.data.materials.append(mat_fur_tan)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, location=(side * 0.40, -0.03, 1.54), segments=20, ring_count=14)
    ear_i = bpy.context.active_object
    ear_i.name = f"Ear_Inner_{side}"
    ear_i.scale = (0.85, 0.25, 1.0)
    ear_i.rotation_euler = (0.1, side * 0.35, -side * 0.12)
    smooth(ear_i)
    subsurf(ear_i, 1)
    ear_i.data.materials.append(mat_pink)

# Bàn chân nhỏ hồng (Feet)
for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, location=(side * 0.25, -0.16, 0.09), segments=20, ring_count=14)
    foot = bpy.context.active_object
    foot.name = f"Foot_{side}"
    foot.scale = (0.85, 1.5, 0.40)
    smooth(foot)
    subsurf(foot, 1)
    foot.data.materials.append(mat_pink)

# -----------------------------------------------------------------------------
# 3. TRANG BỊ HIỆP SĨ: MŨ SẮT, GIÁP VẢY, ÁO CHOÀNG ĐỎ
# -----------------------------------------------------------------------------
# Mũ sắt ôm đỉnh đầu (Helmet Skullcap)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.48, location=(0, 0.02, 1.38), segments=32, ring_count=24)
helm = bpy.context.active_object
helm.name = "Knight_Helmet_Dome"
helm.scale = (1.04, 0.96, 0.70)
smooth(helm)
subsurf(helm, 1)
helm.data.materials.append(mat_steel)

# Vành trán mũ sắt (Brow Band)
bpy.ops.mesh.primitive_cylinder_add(radius=0.49, depth=0.06, location=(0, 0.02, 1.38), vertices=32)
brow = bpy.context.active_object
brow.name = "Helmet_Brow_Band"
brow.scale = (1.04, 0.96, 1.0)
smooth(brow)
brow.data.materials.append(mat_steel_dark)

# Sống mũi nhọn chữ V giữa trán (Nasal V-Point)
bpy.ops.mesh.primitive_cone_add(radius1=0.05, depth=0.08, location=(0, -0.45, 1.34), vertices=16)
nasal = bpy.context.active_object
nasal.name = "Helmet_Nasal_Point"
nasal.rotation_euler = (3.14, 0, 0)
smooth(nasal)
nasal.data.materials.append(mat_steel)

# Chóp nhọn mũ sắt (Spike)
bpy.ops.mesh.primitive_cone_add(radius1=0.075, depth=0.28, location=(0, 0.02, 1.76), vertices=20)
spike = bpy.context.active_object
spike.name = "Helmet_Spike"
smooth(spike)
spike.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_cylinder_add(radius=0.10, depth=0.05, location=(0, 0.02, 1.64), vertices=20)
spike_b = bpy.context.active_object
spike_b.name = "Helmet_Spike_Base"
smooth(spike_b)
spike_b.data.materials.append(mat_steel_dark)

# Đinh tán trên vành trán
for r_a in [-0.55, -0.28, 0.28, 0.55]:
    rx = math.sin(r_a) * 0.49
    ry = -math.cos(r_a) * 0.49 + 0.02
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, location=(rx, ry, 1.38), segments=12, ring_count=8)
    riv = bpy.context.active_object
    riv.name = f"Rivet_{r_a}"
    smooth(riv)
    riv.data.materials.append(mat_steel)

# Giáp vảy cá trước bụng (Scale Armor Plates) đặt nổi lên mặt bụng
scale_layers = [
    # (z, count, y_pos, scale_radius)
    (0.85, 3, -0.56, 0.08),
    (0.74, 4, -0.59, 0.085),
    (0.63, 3, -0.57, 0.085)
]
for r_idx, (sz_z, count, y_off, s_rad) in enumerate(scale_layers):
    span = 0.38
    st_x = -span / 2
    step = span / max(1, count - 1)
    for s_i in range(count):
        sx = st_x + s_i * step
        bpy.ops.mesh.primitive_cone_add(radius1=s_rad, depth=s_rad * 1.6, location=(sx, y_off, sz_z), vertices=16)
        sc_obj = bpy.context.active_object
        sc_obj.name = f"Scale_{r_idx}_{s_i}"
        sc_obj.scale = (1.0, 0.35, 1.0)
        sc_obj.rotation_euler = (-0.35, 0, 3.14)
        smooth(sc_obj)
        sc_obj.data.materials.append(mat_steel if (s_i + r_idx) % 2 == 0 else mat_leather)

# Thắt lưng da & khóa vuông
bpy.ops.mesh.primitive_torus_add(major_radius=0.56, minor_radius=0.035, location=(0, 0, 0.52), major_segments=32, minor_segments=16)
belt = bpy.context.active_object
belt.name = "Waist_Belt"
belt.scale = (1.05, 0.94, 1.0)
smooth(belt)
belt.data.materials.append(mat_leather)

bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0, -0.55, 0.52))
buckle = bpy.context.active_object
buckle.name = "Belt_Buckle"
buckle.scale = (1.0, 0.25, 0.75)
smooth(buckle)
buckle.data.materials.append(mat_steel)

# Dây đai da giữ giáp
for side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=0.055, location=(side * 0.20, -0.42, 0.78))
    strap = bpy.context.active_object
    strap.name = f"Strap_{side}"
    strap.scale = (0.5, 0.3, 3.6)
    strap.rotation_euler = (0.35, side * 0.40, 0)
    smooth(strap)
    strap.data.materials.append(mat_leather)

# Áo choàng đỏ anh hùng (Crimson Cape)
# Cổ áo choàng đỏ quàng qua vai thấy rõ ở mặt trước
bpy.ops.mesh.primitive_torus_add(major_radius=0.52, minor_radius=0.08, location=(0, 0, 0.98), major_segments=32, minor_segments=16)
cape_col = bpy.context.active_object
cape_col.name = "Cape_Collar"
cape_col.scale = (1.06, 0.92, 0.75)
smooth(cape_col)
cape_col.data.materials.append(mat_cape)

# Khóa cài áo choàng ở ngực
bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.03, location=(0, -0.48, 0.98))
brooch = bpy.context.active_object
brooch.name = "Cape_Brooch"
brooch.rotation_euler = (1.57, 0, 0)
smooth(brooch)
brooch.data.materials.append(mat_steel)

# Tà áo choàng đỏ xòe rộng sau lưng nhô ra hai bên thân
bpy.ops.mesh.primitive_grid_add(x_subdivisions=8, y_subdivisions=8, size=1.5, location=(0, 0.35, 0.65))
cape_back = bpy.context.active_object
cape_back.name = "Cape_Back"
cape_back.scale = (1.15, 1.35, 1.0)
cape_back.rotation_euler = (0.45, 0, 0)
smooth(cape_back)
sol = cape_back.modifiers.new("CapeSolidify", 'SOLIDIFY')
sol.thickness = 0.03
subsurf(cape_back, 1)
cape_back.data.materials.append(mat_cape)

# -----------------------------------------------------------------------------
# 4. TAY, KIẾM THÉP & KHIÊN TRÒN (HƯỚNG RÕ VỀ PHÍA TRƯỚC)
# -----------------------------------------------------------------------------
# TAY PHẢI CẦM KIẾM
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13, location=(0.56, -0.10, 0.75), segments=20, ring_count=14)
r_arm = bpy.context.active_object
r_arm.name = "Arm_Right"
r_arm.scale = (0.9, 1.2, 0.9)
smooth(r_arm)
r_arm.data.materials.append(mat_fur_tan)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(0.62, -0.25, 0.78), segments=16, ring_count=12)
r_paw = bpy.context.active_object
r_paw.name = "Paw_Right"
smooth(r_paw)
r_paw.data.materials.append(mat_pink)

# Kiếm thép hiệp sĩ
bpy.ops.mesh.primitive_cube_add(size=0.07, location=(0.64, -0.28, 1.25))
sword_b = bpy.context.active_object
sword_b.name = "Sword_Blade"
sword_b.scale = (0.28, 0.75, 8.5)
sword_b.rotation_euler = (0.18, 0.25, -0.15)
smooth(sword_b)
sword_b.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_cone_add(radius1=0.05, depth=0.20, location=(0.57, -0.34, 1.67), vertices=16)
sword_t = bpy.context.active_object
sword_t.name = "Sword_Tip"
sword_t.scale = (0.45, 1.0, 1.0)
sword_t.rotation_euler = (0.18, 0.25, -0.15)
smooth(sword_t)
sword_t.data.materials.append(mat_steel)

bpy.ops.mesh.primitive_cube_add(size=0.09, location=(0.65, -0.26, 0.88))
sword_g = bpy.context.active_object
sword_g.name = "Sword_Crossguard"
sword_g.scale = (2.2, 0.55, 0.45)
sword_g.rotation_euler = (0.18, 0.25, -0.15)
smooth(sword_g)
sword_g.data.materials.append(mat_steel_dark)

bpy.ops.mesh.primitive_cylinder_add(radius=0.026, depth=0.18, location=(0.67, -0.24, 0.78), vertices=16)
sword_h = bpy.context.active_object
sword_h.name = "Sword_Grip"
sword_h.rotation_euler = (0.18, 0.25, -0.15)
smooth(sword_h)
sword_h.data.materials.append(mat_leather)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045, location=(0.69, -0.22, 0.68), segments=16, ring_count=12)
sword_p = bpy.context.active_object
sword_p.name = "Sword_Pommel"
smooth(sword_p)
sword_p.data.materials.append(mat_steel)

# TAY TRÁI ĐEO KHIÊN TRÒN (Left Hand holding Shield)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13, location=(-0.56, -0.10, 0.75), segments=20, ring_count=14)
l_arm = bpy.context.active_object
l_arm.name = "Arm_Left"
l_arm.scale = (0.9, 1.2, 0.9)
smooth(l_arm)
l_arm.data.materials.append(mat_fur_tan)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(-0.60, -0.20, 0.76), segments=16, ring_count=12)
l_paw = bpy.context.active_object
l_paw.name = "Paw_Left"
smooth(l_paw)
l_paw.data.materials.append(mat_pink)

# Khiên tròn gỗ viền sắt quay góc 3/4 về phía trước
bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.055, location=(-0.66, -0.22, 0.76), vertices=32)
sh_wood = bpy.context.active_object
sh_wood.name = "Shield_Wood_Disk"
sh_wood.rotation_euler = (0.15, 1.25, -0.35)
smooth(sh_wood)
sh_wood.data.materials.append(mat_wood)

bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.030, location=(-0.66, -0.22, 0.76), major_segments=32, minor_segments=16)
sh_rim = bpy.context.active_object
sh_rim.name = "Shield_Steel_Rim"
sh_rim.rotation_euler = (0.15, 1.25, -0.35)
smooth(sh_rim)
sh_rim.data.materials.append(mat_steel)

# Đinh tán trên viền khiên
for sr_i in range(8):
    sr_a = sr_i * (math.pi / 4)
    srx = -0.66 - math.cos(sr_a) * 0.12
    sry = -0.22 - math.sin(sr_a) * 0.38
    srz = 0.76 + math.cos(sr_a) * 0.38
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, location=(srx, sry, srz), segments=12, ring_count=8)
    sr_v = bpy.context.active_object
    sr_v.name = f"Shield_Rivet_{sr_i}"
    smooth(sr_v)
    sr_v.data.materials.append(mat_steel_dark)

# Tâm sắt lồi của khiên
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(-0.72, -0.28, 0.76), segments=20, ring_count=14)
sh_boss = bpy.context.active_object
sh_boss.name = "Shield_Center_Boss"
sh_boss.scale = (0.5, 1.0, 1.0)
sh_boss.rotation_euler = (0.15, 1.25, -0.35)
smooth(sh_boss)
sh_boss.data.materials.append(mat_steel)

# -----------------------------------------------------------------------------
# 5. BỆ ĐÁ RÊU PHONG & NHỮNG CÂY NẤM ĐỎ CHẤM BI TRẮNG
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_cylinder_add(radius=1.35, depth=0.28, location=(0, -0.05, -0.05), vertices=32)
rock = bpy.context.active_object
rock.name = "Pedestal_Rock"
rock.scale = (1.1, 1.0, 1.0)
smooth(rock)
subsurf(rock, 1)
rock.data.materials.append(mat_rock)

bpy.ops.mesh.primitive_cylinder_add(radius=1.28, depth=0.04, location=(0, -0.05, 0.08), vertices=32)
moss = bpy.context.active_object
moss.name = "Pedestal_Moss_Top"
smooth(moss)
moss.data.materials.append(mat_moss)

# Nấm đỏ chấm bi trắng
shrooms = [
    (-1.05, -0.70, 0.10, 0.60),
    (-1.20, -0.30, 0.10, 0.45),
    (-0.75, -0.98, 0.10, 0.40),
    (1.00, -0.60, 0.10, 0.55),
    (1.18, -0.20, 0.10, 0.45),
    (0.90, 0.70, 0.10, 0.50)
]
for m_i, (mx, my, mz, sc) in enumerate(shrooms):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.065 * sc, depth=0.45 * sc, location=(mx, my, mz + 0.18 * sc), vertices=16)
    stem = bpy.context.active_object
    stem.name = f"Shroom_Stem_{m_i}"
    stem.rotation_euler = (0.08, -0.05, 0)
    smooth(stem)
    stem.data.materials.append(mat_shroom_stem)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32 * sc, location=(mx, my, mz + 0.38 * sc), segments=20, ring_count=14)
    cap = bpy.context.active_object
    cap.name = f"Shroom_Cap_{m_i}"
    cap.scale = (1.0, 1.0, 0.68)
    smooth(cap)
    subsurf(cap, 1)
    cap.data.materials.append(mat_shroom_red)

    for dot_i, (d_ang, d_el) in enumerate([(0, 0.22), (1.2, 0.20), (2.4, 0.22), (3.6, 0.19), (4.8, 0.21), (0.6, 0.30)]):
        dx = mx + math.cos(d_ang) * 0.21 * sc
        dy = my + math.sin(d_ang) * 0.21 * sc
        dz = mz + (0.38 + d_el) * sc
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045 * sc, location=(dx, dy, dz), segments=10, ring_count=8)
        dot = bpy.context.active_object
        dot.name = f"Shroom_Dot_{m_i}_{dot_i}"
        smooth(dot)
        dot.data.materials.append(mat_shroom_dot)

# -----------------------------------------------------------------------------
# 6. CAMERA VÀ ÁNH SÁNG
# -----------------------------------------------------------------------------
bpy.ops.object.light_add(type='SUN', location=(3.0, -4.0, 5.0))
sun = bpy.context.active_object
sun.name = "Key_Sun"
sun.data.energy = 4.5
sun.data.color = (1.0, 0.96, 0.90)
sun.rotation_euler = (0.75, 0.35, -0.50)

bpy.ops.object.light_add(type='POINT', location=(-2.5, -3.0, 1.8))
fill = bpy.context.active_object
fill.name = "Fill_Light"
fill.data.energy = 50.0
fill.data.color = (0.85, 0.95, 1.0)

bpy.ops.object.light_add(type='POINT', location=(0.0, 2.8, 2.5))
rim = bpy.context.active_object
rim.name = "Rim_Light"
rim.data.energy = 70.0
rim.data.color = (1.0, 0.90, 0.75)

# Camera góc nhìn trực diện chính diện thấy toàn thân và bệ đá
bpy.ops.object.camera_add(location=(0, -3.5, 0.95))
cam = bpy.context.active_object
cam.name = "Hero_Camera"
cam.rotation_euler = (1.5708, 0, 0)
cam.data.lens = 45
bpy.context.scene.camera = cam

# Nền rừng xanh mượt mà
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("Enchanted_Forest_World")
    bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.18, 0.28, 0.20, 1.0)
    bg_node.inputs['Strength'].default_value = 1.0

bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 960

# -----------------------------------------------------------------------------
# 7. XUẤT FILE .BLEND, .FBX & RENDER ẢNH THỰC TẾ
# -----------------------------------------------------------------------------
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Characters"
os.makedirs(output_dir, exist_ok=True)

blend_path = os.path.join(output_dir, "HamsterWarrior.blend")
fbx_path = os.path.join(output_dir, "HamsterWarrior.fbx")
render_path = os.path.join(output_dir, "HamsterWarrior_3D_Preview.png")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)

bpy.context.scene.render.filepath = render_path
try:
    bpy.ops.render.render(write_still=True)
    print(f"📸 ĐÃ RENDER ẢNH 3D XEM TRƯỚC: {render_path}")
except Exception as e:
    print(f"⚠️ Render error: {e}")

print(f"✅ ĐÃ TẠO XONG VÀ LƯU THÀNH CÔNG VÀO BLENDER:")
print(f"  - Tệp Blend: {blend_path}")
print(f"  - Tệp FBX: {fbx_path}")
