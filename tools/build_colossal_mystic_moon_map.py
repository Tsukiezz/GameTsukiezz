import bpy
import math
import random
import os
import shutil
import mathutils

print("=== BẮT ĐẦU TẠO BẢN ĐỒ MẶT TRĂNG SIÊU KHỔNG LỒ 520M (ĐẤU TRƯỜNG LA MÃ, TRẠM VŨ TRỤ, TẾ ĐÀN THỦY NGÂN & CỎ BIẾN DỊ) ===")

# Reset hoàn toàn Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# -----------------------------------------------------------------------------
# 1. HỆ THỐNG VẬT LIỆU CAO CẤP (PBR, METALLIC, EMISSION & SCI-FI SHADERS)
# -----------------------------------------------------------------------------
def create_mat(name, color, roughness=0.5, metallic=0.0, emissive=None, emit_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if emissive:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emissive
                if 'Emission Strength' in bsdf.inputs:
                    bsdf.inputs['Emission Strength'].default_value = emit_strength
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = emissive
                if 'Emission Strength' in bsdf.inputs:
                    bsdf.inputs['Emission Strength'].default_value = emit_strength
    return mat

def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def subsurf(obj, lv=1):
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = lv
    m.render_levels = lv

# --- Địa hình & Đá cổ ---
mat_moon_rock = create_mat("Mat_Moon_Rock", (0.07, 0.09, 0.14, 1.0), roughness=0.88, metallic=0.05)
mat_path_stone = create_mat("Mat_Path_Stone", (0.18, 0.22, 0.32, 1.0), roughness=0.72, metallic=0.1)
mat_castle_stone = create_mat("Mat_Castle_Stone", (0.22, 0.26, 0.36, 1.0), roughness=0.68, metallic=0.15)
mat_castle_dark_stone = create_mat("Mat_Castle_Dark_Stone", (0.13, 0.15, 0.22, 1.0), roughness=0.75, metallic=0.12)
mat_castle_roof = create_mat("Mat_Castle_Roof", (0.16, 0.10, 0.28, 1.0), roughness=0.35, metallic=0.25)
mat_ruin_stone = create_mat("Mat_Ruin_Stone", (0.20, 0.24, 0.34, 1.0), roughness=0.72, metallic=0.15)
mat_cave_rock = create_mat("Mat_Cave_Rock", (0.08, 0.09, 0.13, 1.0), roughness=0.92)

# --- Đấu trường La Mã Cổ ---
mat_colosseum_stone = create_mat("Mat_Colosseum_Stone", (0.24, 0.25, 0.30, 1.0), roughness=0.82, metallic=0.1)
mat_colosseum_sand = create_mat("Mat_Colosseum_Sand", (0.17, 0.19, 0.26, 1.0), roughness=0.95, metallic=0.02)
mat_ancient_iron = create_mat("Mat_Ancient_Iron", (0.12, 0.12, 0.14, 1.0), roughness=0.55, metallic=0.85)

# --- Hồ Nước Thủy Ngân & Tế Đàn 2 Tầng ---
# Thủy ngân lỏng: Metallic 1.0, Roughness siêu thấp 0.03, phản chiếu bóng gương ánh bạc
mat_mercury_liquid = create_mat("Mat_Mercury_Liquid", (0.85, 0.88, 0.94, 1.0), roughness=0.03, metallic=1.0, emissive=(0.20, 0.28, 0.40, 1.0), emit_strength=1.8)
mat_altar_dark_stone = create_mat("Mat_Altar_Dark_Stone", (0.08, 0.08, 0.12, 1.0), roughness=0.65, metallic=0.25)
mat_altar_blood_rune = create_mat("Mat_Altar_Blood_Rune", (0.95, 0.08, 0.22, 1.0), roughness=0.15, emissive=(1.0, 0.05, 0.20, 1.0), emit_strength=8.5)
mat_altar_flame = create_mat("Mat_Altar_Flame", (0.85, 0.15, 0.65, 1.0), roughness=0.1, emissive=(0.95, 0.10, 0.70, 1.0), emit_strength=9.0)

# --- Trạm Vũ Trụ Công Nghệ Tối Tân (Sci-Fi Outpost) ---
mat_scifi_hull_white = create_mat("Mat_SciFi_Hull_White", (0.88, 0.90, 0.95, 1.0), roughness=0.28, metallic=0.75)
mat_scifi_hull_dark = create_mat("Mat_SciFi_Hull_Dark", (0.12, 0.14, 0.18, 1.0), roughness=0.35, metallic=0.88)
mat_scifi_solar = create_mat("Mat_SciFi_Solar", (0.02, 0.12, 0.40, 1.0), roughness=0.10, metallic=0.92, emissive=(0.05, 0.35, 0.95, 1.0), emit_strength=4.5)
mat_scifi_hazard = create_mat("Mat_SciFi_Hazard", (0.95, 0.80, 0.10, 1.0), roughness=0.30, metallic=0.3, emissive=(1.0, 0.85, 0.15, 1.0), emit_strength=5.0)
mat_scifi_neon_cyan = create_mat("Mat_SciFi_Neon_Cyan", (0.0, 0.95, 1.0, 1.0), roughness=0.05, emissive=(0.0, 0.98, 1.0, 1.0), emit_strength=10.0)
mat_scifi_glass = create_mat("Mat_SciFi_Glass", (0.35, 0.90, 1.0, 1.0), roughness=0.08, metallic=0.2, emissive=(0.2, 0.85, 1.0, 1.0), emit_strength=4.0)

# --- Cỏ Biến Dị (Mutant Alien Flora) ---
mat_mutant_grass_cyan = create_mat("Mat_Mutant_Grass_Cyan", (0.05, 0.95, 0.80, 1.0), roughness=0.35, emissive=(0.05, 0.95, 0.80, 1.0), emit_strength=5.0)
mat_mutant_grass_magenta = create_mat("Mat_Mutant_Grass_Magenta", (0.95, 0.15, 0.70, 1.0), roughness=0.35, emissive=(0.95, 0.15, 0.70, 1.0), emit_strength=5.0)
mat_mutant_grass_toxic = create_mat("Mat_Mutant_Grass_Toxic", (0.45, 0.98, 0.15, 1.0), roughness=0.35, emissive=(0.45, 0.98, 0.15, 1.0), emit_strength=5.0)

# --- Nội thất Lâu Đài & Trang sức Hoàng Gia ---
mat_interior_marble = create_mat("Mat_Interior_Marble", (0.18, 0.20, 0.28, 1.0), roughness=0.25, metallic=0.1)
mat_royal_carpet = create_mat("Mat_Royal_Carpet", (0.75, 0.05, 0.12, 1.0), roughness=0.85)
mat_gold_trim = create_mat("Mat_Gold_Trim", (1.0, 0.84, 0.25, 1.0), roughness=0.2, metallic=0.9, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=4.5)
mat_rune_gold = create_mat("Mat_Rune_Gold", (1.0, 0.85, 0.25, 1.0), roughness=0.15, metallic=0.9, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=5.0)
mat_throne_velvet = create_mat("Mat_Throne_Velvet", (0.50, 0.08, 0.65, 1.0), roughness=0.8)
mat_chandelier_iron = create_mat("Mat_Chandelier_Iron", (0.12, 0.12, 0.15, 1.0), roughness=0.5, metallic=0.8)
mat_candle_flame = create_mat("Mat_Candle_Flame", (1.0, 0.75, 0.3, 1.0), roughness=0.1, emissive=(1.0, 0.75, 0.25, 1.0), emit_strength=8.0)
mat_quest_table = create_mat("Mat_Quest_Table", (0.35, 0.20, 0.10, 1.0), roughness=0.7)
mat_chest_wood = create_mat("Mat_Chest_Wood", (0.38, 0.22, 0.10, 1.0), roughness=0.75)
mat_chest_gold = create_mat("Mat_Chest_Gold", (0.95, 0.80, 0.20, 1.0), roughness=0.25, metallic=0.9)

# --- Phép thuật & Tinh thể ---
mat_cyan_crystal = create_mat("Mat_Cyan_Crystal", (0.05, 0.95, 0.85, 1.0), roughness=0.12, metallic=0.15, emissive=(0.0, 0.98, 0.85, 1.0), emit_strength=6.0)
mat_purple_crystal = create_mat("Mat_Purple_Crystal", (0.55, 0.15, 0.88, 1.0), roughness=0.15, metallic=0.15, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=5.5)
mat_portal_vortex = create_mat("Mat_Portal_Vortex", (0.25, 0.08, 0.45, 1.0), roughness=0.1, emissive=(0.55, 0.18, 0.90, 1.0), emit_strength=7.0)
mat_starlight_pool = create_mat("Mat_Starlight_Pool", (0.02, 0.40, 0.50, 1.0), roughness=0.04, metallic=0.1, emissive=(0.0, 0.70, 0.65, 1.0), emit_strength=2.5)
mat_mana_liquid = create_mat("Mat_Mana_Liquid", (0.05, 0.88, 0.95, 1.0), roughness=0.03, emissive=(0.1, 0.95, 0.98, 1.0), emit_strength=4.5)

# --- Đài Thiên Văn, Lò Rèn & Sinh thái nấm ---
mat_brass_metal = create_mat("Mat_Brass_Metal", (0.85, 0.65, 0.22, 1.0), roughness=0.25, metallic=0.9)
mat_telescope_lens = create_mat("Mat_Telescope_Lens", (0.3, 0.95, 1.0, 1.0), roughness=0.05, emissive=(0.2, 0.95, 1.0, 1.0), emit_strength=6.0)
mat_anvil_iron = create_mat("Mat_Anvil_Iron", (0.12, 0.12, 0.14, 1.0), roughness=0.35, metallic=0.92)
mat_forge_ember = create_mat("Mat_Forge_Ember", (1.0, 0.45, 0.15, 1.0), roughness=0.1, emissive=(1.0, 0.50, 0.12, 1.0), emit_strength=9.5)
mat_waystone_rune = create_mat("Mat_Waystone_Rune", (0.2, 0.85, 1.0, 1.0), roughness=0.1, emissive=(0.15, 0.90, 1.0, 1.0), emit_strength=6.5)
mat_lore_monolith = create_mat("Mat_Lore_Monolith", (0.12, 0.14, 0.20, 1.0), roughness=0.65, metallic=0.2, emissive=(0.1, 0.8, 0.9, 1.0), emit_strength=2.0)
mat_giant_tree_bark = create_mat("Mat_Giant_Tree_Bark", (0.12, 0.09, 0.15, 1.0), roughness=0.85)
mat_giant_tree_leaves = create_mat("Mat_Giant_Tree_Leaves", (0.05, 0.65, 0.75, 1.0), roughness=0.35, emissive=(0.08, 0.85, 0.95, 1.0), emit_strength=4.5)
mat_tree_tendrils = create_mat("Mat_Tree_Tendrils", (0.55, 0.15, 0.85, 1.0), roughness=0.4, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=4.0)
mat_shroom_stem = create_mat("Mat_Shroom_Stem", (0.92, 0.92, 0.88, 1.0), roughness=0.75)
mat_shroom_cap_purple = create_mat("Mat_Shroom_Cap_Purple", (0.40, 0.10, 0.65, 1.0), roughness=0.35, emissive=(0.55, 0.15, 0.85, 1.0), emit_strength=3.5)
mat_shroom_cap_cyan = create_mat("Mat_Shroom_Cap_Cyan", (0.05, 0.70, 0.65, 1.0), roughness=0.35, emissive=(0.0, 0.90, 0.80, 1.0), emit_strength=4.0)
mat_shroom_cap_amber = create_mat("Mat_Shroom_Cap_Amber", (0.95, 0.65, 0.15, 1.0), roughness=0.35, emissive=(1.0, 0.70, 0.20, 1.0), emit_strength=4.5)
mat_celestial_moon = create_mat("Mat_Celestial_Moon", (0.94, 0.97, 1.0, 1.0), roughness=0.15, emissive=(0.92, 0.97, 1.0, 1.0), emit_strength=3.5)

# -----------------------------------------------------------------------------
# 2. ĐỊA HÌNH TOÀN NĂNG 520m x 520m (GẤP 2 LẦN KÍCH THƯỚC TRƯỚC, GẤP 4 LẦN DIỆN TÍCH)
# -----------------------------------------------------------------------------
MAP_SIZE = 520.0

def get_terrain_z(x, y):
    """
    Hàm tính độ cao Z chuẩn xác của thế giới mở 520m x 520m.
    Tất cả các đại phân khu (Lâu đài, Đấu trường, Trạm vũ trụ, Hồ thủy ngân, Hang động, v.v.)
    đều có nền móng bằng phẳng tuyệt đối và cắm rễ vào mặt đất.
    """
    # 1. Thung lũng trung tâm (Central Sanctuary) quanh (0, 0)
    d_center = math.sqrt(x*x + y*y)
    z_center = -1.2 * math.exp(- (d_center / 38.0)**2)

    # 2. Cao nguyên Lâu Đài Hoàng Gia Tây Bắc: (-110, 120), độ cao 22m, bán kính phẳng 38m
    d_castle = math.sqrt((x + 110.0)**2 + (y - 120.0)**2)
    if d_castle <= 38.0:
        z_castle = 22.0
    else:
        z_castle = 22.0 * math.exp(- ((d_castle - 38.0) / 26.0)**2)

    # 3. Cao nguyên Đấu Trường La Mã Đông Bắc: (115, 110), độ cao 12m, bán kính phẳng 34m
    d_colo = math.sqrt((x - 115.0)**2 + (y - 110.0)**2)
    if d_colo <= 34.0:
        z_colo = 12.0
    else:
        z_colo = 12.0 * math.exp(- ((d_colo - 34.0) / 22.0)**2)

    # 4. Cao nguyên Trạm Vũ Trụ Công Nghệ Tây: (-145, -35), độ cao 16m, bán kính phẳng 38m
    d_station = math.sqrt((x + 145.0)**2 + (y + 35.0)**2)
    if d_station <= 38.0:
        z_station = 16.0
    else:
        z_station = 16.0 * math.exp(- ((d_station - 38.0) / 24.0)**2)

    # 5. Thung lũng Lòng Chảo Hồ Nước Thủy Ngân & Tế Đàn: (-45, -115), lòng hồ phẳng tại z=2.8m
    d_altar = math.sqrt((x + 45.0)**2 + (y + 115.0)**2)
    if d_altar <= 26.0:
        z_altar = 2.8
    elif d_altar <= 44.0:
        # Vành hố miệng núi lửa bao quanh hồ thủy ngân
        z_altar = 2.8 + 6.5 * math.sin(((d_altar - 26.0) / 18.0) * math.pi)
    else:
        z_altar = 2.8 * math.exp(- ((d_altar - 44.0) / 30.0)**2)

    # 6. Dãy Núi Hang Động Nguyệt Tinh Đông Nam: (125, -110), độ cao 16m, thềm phẳng 26m
    d_cave = math.sqrt((x - 125.0)**2 + (y + 110.0)**2)
    if d_cave <= 26.0:
        z_cave = 16.0
    else:
        z_cave = 16.0 * math.exp(- ((d_cave - 26.0) / 28.0)**2)

    # 7. Gò đồi Đại Cổ Thụ Thế Giới Đông: (145, 30), độ cao 14m, bán kính phẳng 28m
    d_tree = math.sqrt((x - 145.0)**2 + (y - 30.0)**2)
    if d_tree <= 28.0:
        z_tree = 14.0
    else:
        z_tree = 14.0 * math.exp(- ((d_tree - 28.0) / 26.0)**2)

    # 8. Cao nguyên Đài Thiên Văn Tinh Tú Tây Nam: (-120, -125), độ cao 18m, bán kính phẳng 22m
    d_obs = math.sqrt((x + 120.0)**2 + (y + 125.0)**2)
    if d_obs <= 22.0:
        z_obs = 18.0
    else:
        z_obs = 18.0 * math.exp(- ((d_obs - 22.0) / 24.0)**2)

    # 9. Dãy núi bao bọc ranh giới ngoài cùng của thế giới 520m
    rim = 6.0 * math.sin(x * 0.018) * math.cos(y * 0.018)

    # Nếu nằm trong các khu vực kiến trúc trọng điểm, giữ mặt bằng phẳng tuyệt đối
    if d_castle <= 38.0:
        return 22.0
    if d_colo <= 34.0:
        return 12.0
    if d_station <= 38.0:
        return 16.0
    if d_altar <= 26.0:
        return 2.8
    if d_cave <= 26.0:
        return 16.0
    if d_tree <= 28.0:
        return 14.0
    if d_obs <= 22.0:
        return 18.0

    return z_center + z_castle + z_colo + z_station + z_altar + z_cave + z_tree + z_obs + rim

# Tạo lưới địa hình thực tế 520m x 520m
bpy.ops.mesh.primitive_grid_add(x_subdivisions=200, y_subdivisions=200, size=MAP_SIZE, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "Terrain_Colossal_Lunar_World_520M"
mesh = terrain.data
random.seed(101)
for v in mesh.vertices:
    base_z = get_terrain_z(v.co.x, v.co.y)
    # Thêm độ gồ ghề vi mô nhẹ cho các vùng hoang dã
    d_c = math.sqrt((v.co.x + 110.0)**2 + (v.co.y - 120.0)**2)
    d_co = math.sqrt((v.co.x - 115.0)**2 + (v.co.y - 110.0)**2)
    d_st = math.sqrt((v.co.x + 145.0)**2 + (v.co.y + 35.0)**2)
    d_al = math.sqrt((v.co.x + 45.0)**2 + (v.co.y + 115.0)**2)
    d_cv = math.sqrt((v.co.x - 125.0)**2 + (v.co.y + 110.0)**2)
    d_tr = math.sqrt((v.co.x - 145.0)**2 + (v.co.y - 30.0)**2)
    d_ob = math.sqrt((v.co.x + 120.0)**2 + (v.co.y + 125.0)**2)
    if d_c > 38.0 and d_co > 34.0 and d_st > 38.0 and d_al > 26.0 and d_cv > 26.0 and d_tr > 28.0 and d_ob > 22.0:
        noise = (random.random() - 0.5) * 0.40
    else:
        noise = 0.0
    v.co.z = base_z + noise

smooth(terrain)
subsurf(terrain, 1)
terrain.data.materials.append(mat_moon_rock)

# -----------------------------------------------------------------------------
# 3. ĐẤU TRƯỜNG LA MÃ BỊ BỎ HOANG (ABANDONED ROMAN COLOSSEUM - ĐÔNG BẮC)
# Tọa độ: (115, 110, 12.0)
# -----------------------------------------------------------------------------
colo_x, colo_y, colo_z = 115.0, 110.0, 12.0

# 1. Nền sỏi cát đấu trường trung tâm (Gladiator Arena Combat Floor)
bpy.ops.mesh.primitive_cylinder_add(radius=26.0, depth=0.4, location=(colo_x, colo_y, colo_z + 0.2), vertices=48)
colo_floor = bpy.context.active_object
colo_floor.name = "Colosseum_Arena_Floor"
smooth(colo_floor)
colo_floor.data.materials.append(mat_colosseum_sand)

# 2. Bậc thang khán đài đồng tâm (Tiered Stone Spectator Benches)
for tier_i, (t_rad, t_h, t_dep) in enumerate([(27.5, 1.2, 1.0), (30.0, 2.4, 1.2), (32.5, 3.6, 1.2)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=t_rad, depth=t_dep, location=(colo_x, colo_y, colo_z + t_h / 2), vertices=48)
    bench = bpy.context.active_object
    smooth(bench)
    bench.data.materials.append(mat_colosseum_stone)

# 3. 24 Cột vòm La Mã bao quanh đấu trường (Arcade Arches with Ruined Tops)
random.seed(12)
for arch_i in range(24):
    a_ang = arch_i * (2 * math.pi / 24)
    ax = colo_x + math.cos(a_ang) * 34.0
    ay = colo_y + math.sin(a_ang) * 34.0
    # Một số đoạn bị sụp đổ theo thời gian
    is_broken = arch_i in [3, 4, 11, 12, 18, 19]
    col_h = 5.0 if is_broken else 10.5

    bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=col_h, location=(ax, ay, colo_z + col_h / 2), vertices=16)
    arch_col = bpy.context.active_object
    smooth(arch_col)
    arch_col.data.materials.append(mat_colosseum_stone)

    if not is_broken:
        # Vòm cuốn đá phía trên
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(ax, ay, colo_z + col_h + 0.6))
        entab = bpy.context.active_object
        entab.scale = (4.5, 1.8, 1.2)
        entab.rotation_euler = (0, 0, a_ang + 1.5708)
        smooth(entab)
        entab.data.materials.append(mat_colosseum_stone)

# 4. Cổng đấu sĩ bằng sắt gỉ sét (Gladiator Iron Portcullis Gates)
for g_dir in [-1, 1]:
    gx = colo_x + g_dir * 26.5
    gy = colo_y
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(gx, gy, colo_z + 2.5))
    gate = bpy.context.active_object
    gate.scale = (1.5, 4.0, 5.0)
    smooth(gate)
    gate.data.materials.append(mat_ancient_iron)

# 5. Các khối cột La Mã gãy đổ nằm rải rác trên sàn cát (Fallen Column Drums)
for fallen_i, (fx_o, fy_o, f_rot) in enumerate([
    (6.0, 8.0, 0.4), (-8.0, -5.0, 1.2), (12.0, -10.0, -0.7), (-14.0, 7.0, 2.1)
]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=4.2, location=(colo_x + fx_o, colo_y + fy_o, colo_z + 0.9), vertices=16)
    fallen = bpy.context.active_object
    fallen.rotation_euler = (1.5708, 0, f_rot)
    smooth(fallen)
    fallen.data.materials.append(mat_colosseum_stone)

# 6. Bệ thách đấu Anh Hùng ở trung tâm Đấu Trường (Hero Duel Pedestal - TƯƠNG TÁC)
bpy.ops.mesh.primitive_cylinder_add(radius=3.2, depth=0.8, location=(colo_x, colo_y, colo_z + 0.4), vertices=24)
duel_pedestal = bpy.context.active_object
duel_pedestal.name = "Gladiator_Duel_Altar_Interactable"
smooth(duel_pedestal)
duel_pedestal.data.materials.append(mat_ruin_stone)

# Thanh kiếm đấu sĩ khổng lồ cắm trên bệ tỏa hào quang chiến binh
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(colo_x, colo_y, colo_z + 3.2))
hero_blade = bpy.context.active_object
hero_blade.scale = (0.2, 0.5, 4.8)
hero_blade.rotation_euler = (0, 0.1, 0)
smooth(hero_blade)
hero_blade.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(colo_x, colo_y, colo_z + 3.8))
hero_lt = bpy.context.active_object
hero_lt.data.energy = 220.0
hero_lt.data.color = (0.0, 0.95, 0.85)

# 7. CHI TIẾT NÂNG CAO ĐẤU TRƯỜNG: ĐUỐC LỬA ĐẤU SĨ, GIÁ VŨ KHÍ & TƯỢNG LA MÃ ĐỔ NÁT
for t_i in range(8):
    t_ang = t_i * (2 * math.pi / 8) + 0.3
    tx = colo_x + math.cos(t_ang) * 29.5
    ty = colo_y + math.sin(t_ang) * 29.5
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=2.8, location=(tx, ty, colo_z + 3.8), vertices=8)
    b_pillar = bpy.context.active_object
    smooth(b_pillar)
    b_pillar.data.materials.append(mat_colosseum_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.4, location=(tx, ty, colo_z + 5.4))
    b_fire = bpy.context.active_object
    smooth(b_fire)
    b_fire.data.materials.append(mat_altar_flame)

# 2 Giá vũ khí đấu sĩ đặt ở 2 bên cổng
for w_side in [-1, 1]:
    wx = colo_x + w_side * 24.0
    wy = colo_y + 4.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx, wy, colo_z + 1.2))
    w_rack = bpy.context.active_object
    w_rack.scale = (0.5, 3.2, 2.2)
    smooth(w_rack)
    w_rack.data.materials.append(mat_chest_wood)
    
    for s_i in [-1.0, 0.0, 1.0]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=3.0, location=(wx, wy + s_i * 0.8, colo_z + 1.8), vertices=6)
        spear = bpy.context.active_object
        spear.rotation_euler = (0, 0.15 * w_side, 0)
        smooth(spear)
        spear.data.materials.append(mat_ancient_iron)

# Tượng La Mã đổ nát trên sàn cát
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.4, location=(colo_x + 9.5, colo_y - 8.5, colo_z + 1.1), segments=16, ring_count=12)
statue_head = bpy.context.active_object
statue_head.rotation_euler = (0.6, 0.4, 1.2)
smooth(statue_head)
statue_head.data.materials.append(mat_colosseum_stone)

# -----------------------------------------------------------------------------
# 4. HỒ NƯỚC THỦY NGÂN & TRỤ TẾ ĐÀN 2 TẦNG (MERCURY LAKE & 2-TIER RITUAL ALTAR)
# Tọa độ: (-45, -115, 2.8)
# -----------------------------------------------------------------------------
altar_x, altar_y, altar_z = -45.0, -115.0, 2.8

# 1. Hồ Nước Thủy Ngân bóng gương lấp lánh (Liquid Mercury Pool)
bpy.ops.mesh.primitive_cylinder_add(radius=25.0, depth=0.5, location=(altar_x, altar_y, altar_z + 0.8), vertices=48)
mercury_pool = bpy.context.active_object
mercury_pool.name = "Liquid_Mercury_Lake"
smooth(mercury_pool)
mercury_pool.data.materials.append(mat_mercury_liquid)

# Viền đá hắc diện thạch bao quanh hồ thủy ngân
bpy.ops.mesh.primitive_torus_add(major_radius=25.0, minor_radius=1.2, location=(altar_x, altar_y, altar_z + 1.0), major_segments=48, minor_segments=16)
mercury_rim = bpy.context.active_object
smooth(mercury_rim)
mercury_rim.data.materials.append(mat_altar_dark_stone)

# 2. Cầu đá bước qua hồ thủy ngân dẫn vào tế đàn (Stepping Stone Piers)
for step_i in range(7):
    step_y = altar_y - 24.0 + step_i * 3.4
    bpy.ops.mesh.primitive_cylinder_add(radius=1.6, depth=1.2, location=(altar_x, step_y, altar_z + 0.9), vertices=16)
    step_stone = bpy.context.active_object
    smooth(step_stone)
    step_stone.data.materials.append(mat_altar_dark_stone)

# 3. TẾ ĐÀN TẦNG 1: Bệ đá hắc diện thạch khắc cổ ngữ đỏ máu
bpy.ops.mesh.primitive_cylinder_add(radius=8.5, depth=1.4, location=(altar_x, altar_y, altar_z + 1.5), vertices=32)
altar_t1 = bpy.context.active_object
altar_t1.name = "Altar_Tier1_Base"
smooth(altar_t1)
altar_t1.data.materials.append(mat_altar_dark_stone)

# Vòng cổ ngữ huyết sắc phát quang trên tầng 1
bpy.ops.mesh.primitive_torus_add(major_radius=8.2, minor_radius=0.15, location=(altar_x, altar_y, altar_z + 2.25), major_segments=40, minor_segments=12)
blood_rune_ring1 = bpy.context.active_object
smooth(blood_rune_ring1)
blood_rune_ring1.data.materials.append(mat_altar_blood_rune)

# 4 Cột đá thần bí nâng đỡ Tầng 2
for p_idx in range(4):
    p_ang = p_idx * (math.pi / 2.0)
    cpx = altar_x + math.cos(p_ang) * 4.8
    cpy = altar_y + math.sin(p_ang) * 4.8
    bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=4.2, location=(cpx, cpy, altar_z + 4.2), vertices=16)
    c_pillar = bpy.context.active_object
    smooth(c_pillar)
    c_pillar.data.materials.append(mat_altar_dark_stone)

    # Đuốc tế lửa tím bùng cháy trên mỗi cột
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.4, location=(cpx, cpy, altar_z + 6.5))
    flame = bpy.context.active_object
    smooth(flame)
    flame.data.materials.append(mat_altar_flame)

    bpy.ops.object.light_add(type='POINT', location=(cpx, cpy, altar_z + 6.8))
    flame_lt = bpy.context.active_object
    flame_lt.data.energy = 80.0
    flame_lt.data.color = (0.95, 0.10, 0.70)

# 4. TẾ ĐÀN TẦNG 2: Điện tế lễ trên cao (Upper Sacrificial Sanctum)
bpy.ops.mesh.primitive_cylinder_add(radius=5.2, depth=0.8, location=(altar_x, altar_y, altar_z + 6.4), vertices=24)
altar_t2 = bpy.context.active_object
altar_t2.name = "Altar_Tier2_Sanctum"
smooth(altar_t2)
altar_t2.data.materials.append(mat_altar_dark_stone)

bpy.ops.mesh.primitive_torus_add(major_radius=4.9, minor_radius=0.12, location=(altar_x, altar_y, altar_z + 6.85), major_segments=32, minor_segments=12)
blood_rune_ring2 = bpy.context.active_object
smooth(blood_rune_ring2)
blood_rune_ring2.data.materials.append(mat_altar_blood_rune)

# 5. TRỤ TẾ ĐÀN THẦN BÍ & TRÁI TIM HƯ KHÔNG LƠ LỬNG (SACRIFICIAL PILLAR - TƯƠNG TÁC)
bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=2.2, location=(altar_x, altar_y, altar_z + 7.8), vertices=16)
sacrificial_pillar = bpy.context.active_object
sacrificial_pillar.name = "Sacrificial_Pillar_Interactable"
smooth(sacrificial_pillar)
sacrificial_pillar.data.materials.append(mat_altar_dark_stone)

# Trái tim hư không phát sáng đỏ thẫm lơ lửng trên trụ tế
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.8, location=(altar_x, altar_y, altar_z + 9.6))
void_heart = bpy.context.active_object
void_heart.name = "Void_Heart_Relic"
smooth(void_heart)
void_heart.data.materials.append(mat_altar_blood_rune)

bpy.ops.object.light_add(type='POINT', location=(altar_x, altar_y, altar_z + 9.8))
altar_core_lt = bpy.context.active_object
altar_core_lt.data.energy = 280.0
altar_core_lt.data.color = (1.0, 0.05, 0.25)

# 6. CHI TIẾT NÂNG CAO TẾ ĐÀN: BẬC THANG CỔ & TINH THỂ PHÙ VĂN HUYẾT SẮC BAY LƠ LỬNG
# Cầu thang đá nối từ Tầng 1 lên Tầng 2
for st_i in range(5):
    st_z = altar_z + 2.4 + st_i * 0.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(altar_x - 5.5 + st_i * 0.9, altar_y, st_z))
    st_step = bpy.context.active_object
    st_step.scale = (1.2, 2.4, 0.4)
    smooth(st_step)
    st_step.data.materials.append(mat_altar_dark_stone)

# 6 Mảnh tinh thể phù văn huyết sắc bay lơ lửng xoay quanh Trái Tim Hư Không
for r_i in range(6):
    r_ang = r_i * (2 * math.pi / 6)
    rx = altar_x + math.cos(r_ang) * 2.5
    ry = altar_y + math.sin(r_ang) * 2.5
    bpy.ops.mesh.primitive_cone_add(radius1=0.25, depth=1.1, location=(rx, ry, altar_z + 9.6), vertices=4)
    rune_shard = bpy.context.active_object
    rune_shard.rotation_euler = (0.4, r_ang, 0.2)
    smooth(rune_shard)
    rune_shard.data.materials.append(mat_altar_blood_rune)

# -----------------------------------------------------------------------------
# 5. TRẠM VŨ TRỤ CÔNG NGHỆ TỐI TÂN (ADVANCED SCI-FI SPACE STATION - TÂY)
# Tọa độ: (-145, -35, 16.0)
# -----------------------------------------------------------------------------
st_x, st_y, st_z = -145.0, -35.0, 16.0

# 1. Bãi đáp tàu vũ trụ đa giác (High-Tech Landing Pad)
bpy.ops.mesh.primitive_cylinder_add(radius=18.0, depth=1.0, location=(st_x, st_y, st_z + 0.5), vertices=8)
landing_pad = bpy.context.active_object
landing_pad.name = "Space_Station_Landing_Pad"
smooth(landing_pad)
landing_pad.data.materials.append(mat_scifi_hull_dark)

# Vành sơn cảnh báo Hazard dạ quang
bpy.ops.mesh.primitive_torus_add(major_radius=17.5, minor_radius=0.35, location=(st_x, st_y, st_z + 1.05), major_segments=32, minor_segments=8)
hazard_ring = bpy.context.active_object
smooth(hazard_ring)
hazard_ring.data.materials.append(mat_scifi_hazard)

# Đèn tín hiệu đường băng bãi đáp
for b_i in range(8):
    b_ang = b_i * (2 * math.pi / 8)
    bx = st_x + math.cos(b_ang) * 16.5
    by = st_y + math.sin(b_ang) * 16.5
    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.6, location=(bx, by, st_z + 1.3), vertices=8)
    beacon = bpy.context.active_object
    smooth(beacon)
    beacon.data.materials.append(mat_scifi_neon_cyan)

# 2. Khối khoang chỉ huy trung tâm (Command Habitation Module)
hub_x, hub_y, hub_z = st_x - 12.0, st_y + 12.0, st_z + 1.0
bpy.ops.mesh.primitive_cylinder_add(radius=9.0, depth=6.5, location=(hub_x, hub_y, hub_z + 3.25), vertices=8)
command_hub = bpy.context.active_object
command_hub.name = "Station_Command_Module_Interactable"
smooth(command_hub)
command_hub.data.materials.append(mat_scifi_hull_white)

# Vòm kính quan sát không gian (Sci-Fi Observation Dome)
bpy.ops.mesh.primitive_uv_sphere_add(radius=5.5, location=(hub_x, hub_y, hub_z + 6.5), segments=24, ring_count=16)
obs_dome = bpy.context.active_object
obs_dome.scale = (1.0, 1.0, 0.6)
smooth(obs_dome)
obs_dome.data.materials.append(mat_scifi_glass)

# Đai đèn neon xanh công nghệ cao quanh module
bpy.ops.mesh.primitive_torus_add(major_radius=9.2, minor_radius=0.15, location=(hub_x, hub_y, hub_z + 3.2), major_segments=32, minor_segments=12)
neon_ring = bpy.context.active_object
smooth(neon_ring)
neon_ring.data.materials.append(mat_scifi_neon_cyan)

# 3. Hai cánh tấm pin năng lượng mặt trời lượng tử (Quantum Solar Array Wings)
for s_side in [-1, 1]:
    panel_x = hub_x + s_side * 18.0
    panel_y = hub_y
    # Khung đỡ cánh pin
    bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=10.0, location=(hub_x + s_side * 13.0, hub_y, hub_z + 4.0), vertices=8)
    strut = bpy.context.active_object
    strut.rotation_euler = (0, 1.5708, 0)
    smooth(strut)
    strut.data.materials.append(mat_scifi_hull_dark)

    # Tấm pin xanh lượng tử
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(panel_x, panel_y, hub_z + 4.0))
    solar_wing = bpy.context.active_object
    solar_wing.scale = (10.0, 6.0, 0.25)
    solar_wing.rotation_euler = (0.45, 0, 0)
    smooth(solar_wing)
    solar_wing.data.materials.append(mat_scifi_solar)

# 4. Ăng-ten chảo Radar liên lạc vũ trụ sâu (Deep Space Communications Radar Dish)
dish_x, dish_y, dish_z = hub_x + 8.0, hub_y + 14.0, hub_z
bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=3.5, location=(dish_x, dish_y, dish_z + 1.75), vertices=12)
dish_mast = bpy.context.active_object
smooth(dish_mast)
dish_mast.data.materials.append(mat_scifi_hull_dark)

bpy.ops.mesh.primitive_uv_sphere_add(radius=4.5, location=(dish_x, dish_y, dish_z + 5.0), segments=24, ring_count=16)
radar_dish = bpy.context.active_object
radar_dish.scale = (1.0, 0.45, 1.0)
radar_dish.rotation_euler = (0.6, 0.2, 0.8)
smooth(radar_dish)
radar_dish.data.materials.append(mat_scifi_hull_white)

# Kim thu phát sóng radar
bpy.ops.mesh.primitive_cone_add(radius1=0.2, depth=2.5, location=(dish_x + 0.8, dish_y - 0.8, dish_z + 6.2), vertices=8)
antenna_needle = bpy.context.active_object
antenna_needle.rotation_euler = (0.6, 0.2, 0.8)
smooth(antenna_needle)
antenna_needle.data.materials.append(mat_scifi_neon_cyan)

bpy.ops.object.light_add(type='POINT', location=(hub_x, hub_y, hub_z + 8.0))
station_lt = bpy.context.active_object
station_lt.data.energy = 320.0
station_lt.data.color = (0.0, 0.95, 1.0)

# 5. CHI TIẾT NÂNG CAO TRẠM VŨ TRỤ: CỬA AIRLOCK, CONTAINER VŨ TRỤ & CÁP NĂNG LƯỢNG
# Cửa khoang Airlock áp suất cao
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(hub_x + 8.5, hub_y, hub_z + 2.2))
airlock_door = bpy.context.active_object
airlock_door.scale = (0.8, 3.2, 4.2)
smooth(airlock_door)
airlock_door.data.materials.append(mat_scifi_hull_dark)

bpy.ops.mesh.primitive_torus_add(major_radius=1.4, minor_radius=0.1, location=(hub_x + 8.8, hub_y, hub_z + 2.4), major_segments=16, minor_segments=8)
airlock_seal = bpy.context.active_object
airlock_seal.rotation_euler = (0, 1.5708, 0)
smooth(airlock_seal)
airlock_seal.data.materials.append(mat_scifi_neon_cyan)

# 4 Thùng container hàng công nghệ cao (Sci-Fi Cargo Containers) trên bãi đáp
for cr_i, (cx_o, cy_o, cr_rot) in enumerate([(4.0, 6.0, 0.2), (6.5, 4.0, -0.4), (-5.0, 8.0, 0.7), (8.0, -4.0, 1.1)]):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(st_x + cx_o, st_y + cy_o, st_z + 1.8))
    crate = bpy.context.active_object
    crate.scale = (2.4, 1.8, 1.6)
    crate.rotation_euler = (0, 0, cr_rot)
    smooth(crate)
    crate.data.materials.append(mat_scifi_hull_dark if cr_i % 2 == 0 else mat_scifi_hull_white)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(st_x + cx_o, st_y + cy_o, st_z + 2.65))
    crate_light = bpy.context.active_object
    crate_light.scale = (2.2, 0.2, 0.1)
    crate_light.rotation_euler = (0, 0, cr_rot)
    smooth(crate_light)
    crate_light.data.materials.append(mat_scifi_neon_cyan)

# Đường cáp dẫn năng lượng phát sáng kết nối vào trạm
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=14.0, location=(st_x - 6.0, st_y + 6.0, st_z + 1.1), vertices=8)
power_conduit = bpy.context.active_object
power_conduit.rotation_euler = (0, 1.5708, 0.785)
smooth(power_conduit)
power_conduit.data.materials.append(mat_scifi_neon_cyan)

# -----------------------------------------------------------------------------
# 6. ĐẠI LÂU ĐÀI HOÀNG GIA (WALK-IN CITADEL MESA - TÂY BẮC)
# Tọa độ: (-110, 120, 22.0)
# -----------------------------------------------------------------------------
c_x, c_y, c_z = -110.0, 120.0, 22.0

# Bệ móng đá dày 8m ăn sâu vào cao nguyên
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, c_z + 2.0))
castle_base = bpy.context.active_object
castle_base.name = "Castle_Solid_Foundation"
castle_base.scale = (52.0, 56.0, 8.0)
smooth(castle_base)
castle_base.data.materials.append(mat_castle_stone)

for bx_side in [-24.0, 24.0]:
    for by_side in [-26.0, 26.0]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + bx_side, c_y + by_side, c_z - 1.0))
        buttress = bpy.context.active_object
        buttress.scale = (9.0, 9.0, 14.0)
        smooth(buttress)
        buttress.data.materials.append(mat_castle_dark_stone)

# 4 Tháp góc khổng lồ cao 32m
towers_data = [
    (c_x - 21.0, c_y - 23.0),
    (c_x + 21.0, c_y - 23.0),
    (c_x - 21.0, c_y + 23.0),
    (c_x + 21.0, c_y + 23.0)
]
for t_i, (tx, ty) in enumerate(towers_data):
    t_height = 32.0
    bpy.ops.mesh.primitive_cylinder_add(radius=4.8, depth=t_height, location=(tx, ty, c_z + t_height / 2 + 2.0), vertices=32)
    tower = bpy.context.active_object
    smooth(tower)
    tower.data.materials.append(mat_castle_stone)

    bpy.ops.mesh.primitive_cylinder_add(radius=5.5, depth=1.5, location=(tx, ty, c_z + t_height + 2.0), vertices=32)
    balcony = bpy.context.active_object
    smooth(balcony)
    balcony.data.materials.append(mat_ruin_stone)

    bpy.ops.mesh.primitive_cone_add(radius1=5.2, depth=11.0, location=(tx, ty, c_z + t_height + 7.5), vertices=32)
    roof = bpy.context.active_object
    smooth(roof)
    roof.data.materials.append(mat_castle_roof)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0, location=(tx, ty, c_z + t_height + 13.5))
    gem = bpy.context.active_object
    smooth(gem)
    gem.data.materials.append(mat_cyan_crystal if t_i % 2 == 0 else mat_purple_crystal)

# Tường thành & Cổng vòm
for w_info in [
    (c_x - 21.0, c_y, (2.8, 44.0, 16.0)),
    (c_x + 21.0, c_y, (2.8, 44.0, 16.0)),
    (c_x, c_y + 23.0, (42.0, 2.8, 16.0)),
    (c_x - 14.0, c_y - 23.0, (14.0, 2.8, 16.0)),
    (c_x + 14.0, c_y - 23.0, (14.0, 2.8, 16.0)),
    (c_x, c_y - 23.0, (14.0, 3.0, 6.0))
]:
    w_pos_z = c_z + 9.0 if w_info[2][2] > 8.0 else c_z + 14.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(w_info[0], w_info[1], w_pos_z))
    w_obj = bpy.context.active_object
    w_obj.scale = w_info[2]
    smooth(w_obj)
    w_obj.data.materials.append(mat_castle_stone)

# --- Nội thất Đại Điện Ngai Vàng (Walk-in Throne Room) ---
hall_z = c_z + 5.5

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, hall_z))
hall_floor = bpy.context.active_object
hall_floor.name = "Throne_Hall_Floor"
hall_floor.scale = (38.0, 42.0, 0.4)
smooth(hall_floor)
hall_floor.data.materials.append(mat_interior_marble)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 2.0, hall_z + 0.25))
carpet = bpy.context.active_object
carpet.name = "Royal_Red_Carpet"
carpet.scale = (6.0, 36.0, 0.1)
smooth(carpet)
carpet.data.materials.append(mat_royal_carpet)

# 8 Cột trụ La Mã có đuốc
for c_side in [-1, 1]:
    for col_i in range(4):
        col_y = c_y - 16.0 + col_i * 9.5
        col_x = c_x + c_side * 7.5
        bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=12.0, location=(col_x, col_y, hall_z + 6.0), vertices=24)
        pillar = bpy.context.active_object
        smooth(pillar)
        pillar.data.materials.append(mat_castle_stone)

        bpy.ops.object.light_add(type='POINT', location=(col_x - c_side * 0.9, col_y, hall_z + 6.5))
        t_lt = bpy.context.active_object
        t_lt.data.energy = 55.0
        t_lt.data.color = (1.0, 0.84, 0.45)

# Bệ ngai vàng & NGAI VÀNG ÁNH TRĂNG TSUKIEZZ
dais_z = hall_z + 0.6
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 16.0, dais_z))
throne_dais = bpy.context.active_object
throne_dais.scale = (12.0, 8.0, 1.2)
smooth(throne_dais)
throne_dais.data.materials.append(mat_ruin_stone)

throne_z = dais_z + 1.2
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 17.0, throne_z))
t_seat = bpy.context.active_object
t_seat.scale = (2.6, 2.2, 0.8)
smooth(t_seat)
t_seat.data.materials.append(mat_throne_velvet)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 17.8, throne_z + 2.4))
t_back = bpy.context.active_object
t_back.scale = (2.4, 0.4, 4.2)
smooth(t_back)
t_back.data.materials.append(mat_gold_trim)

bpy.ops.mesh.primitive_torus_add(major_radius=0.8, minor_radius=0.18, location=(c_x, c_y + 17.6, throne_z + 4.6), major_segments=24, minor_segments=12)
t_crest = bpy.context.active_object
t_crest.rotation_euler = (1.5708, 0, 0)
smooth(t_crest)
t_crest.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y + 16.5, throne_z + 4.5))
throne_light = bpy.context.active_object
throne_light.data.energy = 200.0
throne_light.data.color = (1.0, 0.92, 0.70)

# Bàn hội nghị chiến lược & Kho vũ khí
bpy.ops.mesh.primitive_cylinder_add(radius=2.6, depth=0.8, location=(c_x, c_y - 2.0, hall_z + 0.9), vertices=24)
q_table = bpy.context.active_object
smooth(q_table)
q_table.data.materials.append(mat_quest_table)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.55, location=(c_x, c_y - 2.0, hall_z + 1.6))
q_orb = bpy.context.active_object
smooth(q_orb)
q_orb.data.materials.append(mat_cyan_crystal)

for arm_side in [-1, 1]:
    arm_x = c_x + arm_side * 14.0
    arm_y = c_y + 7.0
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(arm_x, arm_y, hall_z + 1.6))
    rack = bpy.context.active_object
    rack.scale = (0.6, 4.6, 3.2)
    smooth(rack)
    rack.data.materials.append(mat_chest_wood)

# 2 Đèn chùm hoàng gia nguy nga lơ lửng trong đại điện
for ch_y in [c_y - 6.0, c_y + 6.0]:
    bpy.ops.mesh.primitive_torus_add(major_radius=2.6, minor_radius=0.18, location=(c_x, ch_y, hall_z + 10.5), major_segments=24, minor_segments=8)
    chandelier = bpy.context.active_object
    smooth(chandelier)
    chandelier.data.materials.append(mat_chandelier_iron)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.6, location=(c_x, ch_y, hall_z + 10.5))
    ch_glow = bpy.context.active_object
    smooth(ch_glow)
    ch_glow.data.materials.append(mat_candle_flame)
    
    bpy.ops.object.light_add(type='POINT', location=(c_x, ch_y, hall_z + 9.5))
    ch_lt = bpy.context.active_object
    ch_lt.data.energy = 150.0
    ch_lt.data.color = (1.0, 0.85, 0.45)

# Cổng sắt răng cưa khổng lồ (Spiked Portcullis Grill) tại lối vào
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 23.0, hall_z + 4.5))
portcullis = bpy.context.active_object
portcullis.scale = (11.0, 0.6, 7.5)
smooth(portcullis)
portcullis.data.materials.append(mat_ancient_iron)

# Cầu cạn đá vững chãi nối từ trung tâm lên cổng lâu đài
bridge_s = (c_x, c_y - 23.0, hall_z)
bridge_e = (-35.0, 25.0, get_terrain_z(-35.0, 25.0) + 0.5)
b_len = math.sqrt((bridge_s[0] - bridge_e[0])**2 + (bridge_s[1] - bridge_e[1])**2)
b_mid = ((bridge_s[0] + bridge_e[0]) / 2, (bridge_s[1] + bridge_e[1]) / 2, (bridge_s[2] + bridge_e[2]) / 2)
b_ang = math.atan2(bridge_e[1] - bridge_s[1], bridge_e[0] - bridge_s[0])
pitch = math.atan2(bridge_s[2] - bridge_e[2], b_len)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=b_mid)
bridge = bpy.context.active_object
bridge.scale = (b_len, 5.2, 2.0)
bridge.rotation_euler = (0, pitch, b_ang)
smooth(bridge)
bridge.data.materials.append(mat_castle_stone)

for p_side in [-1, 1]:
    perp_x = -math.sin(b_ang) * 2.6 * p_side
    perp_y = math.cos(b_ang) * 2.6 * p_side
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(b_mid[0] + perp_x, b_mid[1] + perp_y, b_mid[2] + 1.2))
    parapet = bpy.context.active_object
    parapet.scale = (b_len, 0.45, 1.3)
    parapet.rotation_euler = (0, pitch, b_ang)
    smooth(parapet)
    parapet.data.materials.append(mat_castle_stone)

# -----------------------------------------------------------------------------
# 7. CỎ BIẾN DỊ (MUTANT ALIEN FLORA) DỌC ĐƯỜNG & KHẮP BẢN ĐỒ 520M
# -----------------------------------------------------------------------------
def spawn_mutant_grass_clump(gx, gy, gz, scale=1.0):
    """Tạo cụm cỏ biến dị phát quang dạ quang gồm 6-9 lá cong sắc nhọn và chùm bào tử"""
    m_colors = [mat_mutant_grass_cyan, mat_mutant_grass_magenta, mat_mutant_grass_toxic]
    c_mat = random.choice(m_colors)
    num_blades = random.randint(6, 9)

    for b_idx in range(num_blades):
        b_ang = b_idx * (2 * math.pi / num_blades) + random.uniform(-0.2, 0.2)
        tilt = random.uniform(0.25, 0.55)
        h = random.uniform(1.2, 2.4) * scale
        rad = random.uniform(0.08, 0.16) * scale

        bx = gx + math.cos(b_ang) * 0.35 * scale
        by = gy + math.sin(b_ang) * 0.35 * scale

        bpy.ops.mesh.primitive_cone_add(radius1=rad, depth=h, location=(bx, by, gz + h / 2 - 0.1), vertices=4)
        blade = bpy.context.active_object
        blade.rotation_euler = (math.cos(b_ang) * tilt, math.sin(b_ang) * tilt, random.uniform(0, 3.14))
        smooth(blade)
        blade.data.materials.append(c_mat)

    # Chùm hạt bào tử phát sáng ở giữa bụi cỏ
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.25 * scale, location=(gx, gy, gz + 0.8 * scale))
    spore = bpy.context.active_object
    smooth(spore)
    spore.data.materials.append(mat_cyan_crystal if c_mat != mat_cyan_crystal else mat_purple_crystal)

# Rải 140 CỤM CỎ BIẾN DỊ DỌC CÁC TUYẾN ĐƯỜNG VÀ QUANH CÁC DANH THẮNG
random.seed(333)
# 1. Cỏ dọc tuyến đường đá chính
for p_step in range(60):
    # Dọc đường Nam - Bắc
    gy = -180.0 + p_step * 6.0
    for side in [-1, 1]:
        gx = math.sin(p_step * 0.2) * 2.0 + side * random.uniform(2.8, 6.5)
        gz = get_terrain_z(gx, gy)
        spawn_mutant_grass_clump(gx, gy, gz, scale=random.uniform(0.8, 1.4))

# 2. Cỏ biến dị quanh Hồ Nước Thủy Ngân & Đấu Trường La Mã
for i in range(40):
    ang = random.uniform(0, 2 * math.pi)
    dist = random.uniform(26.0, 38.0)
    # Quanh hồ thủy ngân
    mx = altar_x + math.cos(ang) * dist
    my = altar_y + math.sin(ang) * dist
    mz = get_terrain_z(mx, my)
    spawn_mutant_grass_clump(mx, my, mz, scale=random.uniform(0.9, 1.5))

    # Trong và ngoài Đấu Trường La Mã
    cx = colo_x + math.cos(ang) * (dist * 0.8)
    cy = colo_y + math.sin(ang) * (dist * 0.8)
    cz = get_terrain_z(cx, cy)
    spawn_mutant_grass_clump(cx, cy, cz, scale=random.uniform(0.7, 1.3))

# 3. Cỏ biến dị rải rác quanh Trạm Vũ Trụ và các hố va chạm
for i in range(40):
    rx = random.uniform(-220.0, 220.0)
    ry = random.uniform(-220.0, 220.0)
    # Loại trừ trong lòng lâu đài và trong bãi đáp
    if math.sqrt((rx - c_x)**2 + (ry - c_y)**2) < 28 or math.sqrt((rx - st_x)**2 + (ry - st_y)**2) < 16:
        continue
    rz = get_terrain_z(rx, ry)
    spawn_mutant_grass_clump(rx, ry, rz, scale=random.uniform(0.8, 1.6))

# -----------------------------------------------------------------------------
# 8. HANG ĐỘNG NGUYỆT TINH (CRYSTAL CAVERN - ĐÔNG NAM)
# Tọa độ: (125, -110, 16.0)
# -----------------------------------------------------------------------------
cave_x, cave_y, cave_z = 125.0, -110.0, 16.0

bpy.ops.mesh.primitive_torus_add(major_radius=7.0, minor_radius=2.4, location=(cave_x, cave_y, cave_z + 4.8), major_segments=28, minor_segments=16)
cave_arch = bpy.context.active_object
cave_arch.name = "Cave_Entrance_Arch"
cave_arch.rotation_euler = (1.5708, 0, 0.785)
smooth(cave_arch)
cave_arch.data.materials.append(mat_cave_rock)

bpy.ops.mesh.primitive_cylinder_add(radius=11.0, depth=3.2, location=(cave_x + 9.0, cave_y - 9.0, cave_z + 12.0), vertices=24)
cave_roof = bpy.context.active_object
cave_roof.rotation_euler = (0.2, 0.1, 0.785)
smooth(cave_roof)
cave_roof.data.materials.append(mat_cave_rock)

bpy.ops.object.light_add(type='POINT', location=(cave_x + 8.0, cave_y - 8.0, cave_z + 8.0))
cavern_ambient = bpy.context.active_object
cavern_ambient.data.energy = 650.0
cavern_ambient.data.color = (0.35, 0.85, 1.0)

bpy.ops.mesh.primitive_cylinder_add(radius=7.2, depth=0.4, location=(cave_x + 8.0, cave_y - 8.0, cave_z + 0.2), vertices=32)
cave_pool = bpy.context.active_object
smooth(cave_pool)
cave_pool.data.materials.append(mat_starlight_pool)

# Nhũ đá và măng đá
for st_i, (sx, sy, sz, s_rad, s_len) in enumerate([
    (cave_x + 5.0, cave_y - 5.0, cave_z + 11.0, 0.55, 4.5),
    (cave_x + 9.0, cave_y - 6.0, cave_z + 11.5, 0.65, 5.2),
    (cave_x + 6.0, cave_y - 11.0, cave_z + 11.0, 0.50, 4.0),
    (cave_x + 11.0, cave_y - 10.0, cave_z + 11.8, 0.75, 5.8)
]):
    bpy.ops.mesh.primitive_cone_add(radius1=s_rad, depth=s_len, location=(sx, sy, sz - s_len / 2), vertices=12)
    stalactite = bpy.context.active_object
    stalactite.rotation_euler = (3.14159, 0, 0)
    smooth(stalactite)
    stalactite.data.materials.append(mat_cave_rock)

# Rương báu & Bia đá truyền thuyết
chest_x, chest_y, chest_z = cave_x + 8.0, cave_y - 12.0, cave_z + 0.6
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(chest_x, chest_y, chest_z + 0.4))
chest_base = bpy.context.active_object
chest_base.scale = (2.2, 1.4, 1.0)
smooth(chest_base)
chest_base.data.materials.append(mat_chest_wood)

bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=2.2, location=(chest_x, chest_y, chest_z + 0.9), vertices=20)
chest_lid = bpy.context.active_object
chest_lid.rotation_euler = (0, 1.5708, 0)
smooth(chest_lid)
chest_lid.data.materials.append(mat_chest_gold)

bpy.ops.object.light_add(type='POINT', location=(chest_x, chest_y, chest_z + 2.0))
chest_light = bpy.context.active_object
chest_light.data.energy = 220.0
chest_light.data.color = (1.0, 0.88, 0.35)

mono_x, mono_y, mono_z = cave_x + 4.0, cave_y - 14.0, cave_z + 0.2
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mono_x, mono_y, mono_z + 1.8))
monolith = bpy.context.active_object
monolith.name = "Lore_Monolith_Interactable"
monolith.scale = (1.6, 0.5, 3.4)
monolith.rotation_euler = (0.05, -0.08, 0.4)
smooth(monolith)
monolith.data.materials.append(mat_lore_monolith)

# -----------------------------------------------------------------------------
# 9. ĐẠI CỔ THỤ THẾ GIỚI 45M & GIẾNG MA LỰC (WORLD TREE GROVE - ĐÔNG)
# Tọa độ: (145, 30, 14.0)
# -----------------------------------------------------------------------------
tree_x, tree_y, tree_z = 145.0, 30.0, 14.0

bpy.ops.mesh.primitive_cylinder_add(radius=6.0, depth=28.0, location=(tree_x, tree_y, tree_z + 14.0), vertices=32)
giant_trunk = bpy.context.active_object
giant_trunk.name = "World_Tree_Colossal_Trunk"
smooth(giant_trunk)
giant_trunk.data.materials.append(mat_giant_tree_bark)

# Tán lá đại thụ cao tới 45m
for c_idx, (cx_o, cy_o, cz_o, r_x, r_y, r_z, c_mat) in enumerate([
    (0.0, 0.0, 30.0, 14.0, 14.0, 7.0, mat_giant_tree_leaves),
    (-8.0, -6.0, 33.5, 11.0, 10.5, 6.0, mat_giant_tree_leaves),
    (8.5, 5.0, 34.0, 11.5, 11.0, 6.2, mat_giant_tree_leaves),
    (0.0, 0.0, 42.0, 9.0, 9.0, 5.0, mat_giant_tree_leaves)
]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(tree_x + cx_o, tree_y + cy_o, tree_z + cz_o), segments=24, ring_count=16)
    canopy = bpy.context.active_object
    canopy.scale = (r_x, r_y, r_z)
    smooth(canopy)
    canopy.data.materials.append(c_mat)

# Giếng Nước Ma Lực (Mana Well Spring)
well_x, well_y, well_z = tree_x - 16.0, tree_y + 12.0, get_terrain_z(tree_x - 16.0, tree_y + 12.0)
bpy.ops.mesh.primitive_cylinder_add(radius=3.4, depth=1.4, location=(well_x, well_y, well_z + 0.7), vertices=24)
well_rim = bpy.context.active_object
well_rim.name = "Mana_Well_Interactable"
smooth(well_rim)
well_rim.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=3.0, depth=0.3, location=(well_x, well_y, well_z + 1.2), vertices=24)
mana_water = bpy.context.active_object
smooth(mana_water)
mana_water.data.materials.append(mat_mana_liquid)

bpy.ops.object.light_add(type='POINT', location=(well_x, well_y, well_z + 2.2))
mana_lt = bpy.context.active_object
mana_lt.data.energy = 110.0
mana_lt.data.color = (0.1, 0.95, 0.98)

# -----------------------------------------------------------------------------
# 10. ĐÀI THIÊN VĂN TINH TÚ (ASTRAL OBSERVATORY - TÂY NAM)
# Tọa độ: (-120, -125, 18.0)
# -----------------------------------------------------------------------------
obs_x, obs_y, obs_z = -120.0, -125.0, 18.0

bpy.ops.mesh.primitive_cylinder_add(radius=10.0, depth=8.0, location=(obs_x, obs_y, obs_z + 4.0), vertices=32)
obs_tower = bpy.context.active_object
obs_tower.name = "Observatory_Tower"
smooth(obs_tower)
obs_tower.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=11.0, depth=1.2, location=(obs_x, obs_y, obs_z + 8.6), vertices=32)
obs_deck = bpy.context.active_object
smooth(obs_deck)
obs_deck.data.materials.append(mat_ruin_stone)

tel_x, tel_y, tel_z = obs_x, obs_y, obs_z + 9.2

for leg_i in range(3):
    l_ang = leg_i * (2 * math.pi / 3)
    lx = tel_x + math.cos(l_ang) * 1.2
    ly = tel_y + math.sin(l_ang) * 1.2
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=2.6, location=(lx, ly, tel_z + 1.3), vertices=8)
    leg = bpy.context.active_object
    leg.rotation_euler = (math.cos(l_ang) * 0.25, -math.sin(l_ang) * 0.25, 0)
    smooth(leg)
    leg.data.materials.append(mat_brass_metal)

bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=5.6, location=(tel_x + 1.3, tel_y + 1.3, tel_z + 4.0), vertices=16)
tel_tube = bpy.context.active_object
tel_tube.name = "Astral_Telescope_Interactable"
tel_tube.rotation_euler = (0.75, 0.0, 0.785)
smooth(tel_tube)
tel_tube.data.materials.append(mat_brass_metal)

bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=0.15, location=(tel_x + 2.9, tel_y + 2.9, tel_z + 5.6), vertices=16)
tel_lens = bpy.context.active_object
tel_lens.rotation_euler = (0.75, 0.0, 0.785)
smooth(tel_lens)
tel_lens.data.materials.append(mat_telescope_lens)

# -----------------------------------------------------------------------------
# 11. ĐỀN THẦN TRUNG TÂM & LÒ RÈN THẦN KHÍ
# -----------------------------------------------------------------------------
# Đền thờ trung tâm (0, 0)
shrine_x, shrine_y, shrine_z = 0.0, 0.0, get_terrain_z(0.0, 0.0)

for d_i, (d_rad, d_dep, d_off) in enumerate([(8.5, 0.6, 0.3), (6.5, 0.5, 0.8), (4.8, 0.45, 1.25)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=d_rad, depth=d_dep, location=(shrine_x, shrine_y, shrine_z + d_off), vertices=36)
    dais = bpy.context.active_object
    smooth(dais)
    dais.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_torus_add(major_radius=4.7, minor_radius=0.12, location=(shrine_x, shrine_y, shrine_z + 1.5), major_segments=48, minor_segments=16)
gold_rune_ring = bpy.context.active_object
smooth(gold_rune_ring)
gold_rune_ring.data.materials.append(mat_rune_gold)

# Cổng Dịch Chuyển Không Gian
portal_x, portal_y = 0.0, 20.0
portal_z = get_terrain_z(portal_x, portal_y)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x, portal_y, portal_z + 4.8))
vortex = bpy.context.active_object
vortex.scale = (8.0, 0.4, 7.5)
smooth(vortex)
vortex.data.materials.append(mat_portal_vortex)

bpy.ops.object.light_add(type='POINT', location=(portal_x, portal_y, portal_z + 5.0))
p_light = bpy.context.active_object
p_light.data.energy = 260.0
p_light.data.color = (0.65, 0.20, 0.95)

# Lò Rèn Thần Khí Ánh Trăng (55, -15)
forge_x, forge_y = 55.0, -15.0
forge_z = get_terrain_z(forge_x, forge_y)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(forge_x, forge_y, forge_z + 1.4))
forge_hearth = bpy.context.active_object
forge_hearth.name = "Lunar_Forge_Interactable"
forge_hearth.scale = (4.0, 4.0, 2.8)
smooth(forge_hearth)
forge_hearth.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=1.4, depth=0.3, location=(forge_x, forge_y - 0.9, forge_z + 2.0), vertices=16)
forge_fire = bpy.context.active_object
smooth(forge_fire)
forge_fire.data.materials.append(mat_forge_ember)

bpy.ops.object.light_add(type='POINT', location=(forge_x, forge_y - 0.9, forge_z + 2.8))
forge_lt = bpy.context.active_object
forge_lt.data.energy = 180.0
forge_lt.data.color = (1.0, 0.55, 0.15)

# -----------------------------------------------------------------------------
# 12. BẦU TRỜ SIÊU THIÊN THỂ & HỆ THỐNG ÁNH SÁNG 520M
# -----------------------------------------------------------------------------
# Siêu Mặt Trăng 60m
bpy.ops.mesh.primitive_uv_sphere_add(radius=60.0, location=(0.0, 240.0, 110.0), segments=48, ring_count=32)
celestial_moon = bpy.context.active_object
celestial_moon.name = "Celestial_Super_Moon_520M"
smooth(celestial_moon)
celestial_moon.data.materials.append(mat_celestial_moon)

bpy.ops.mesh.primitive_torus_add(major_radius=85.0, minor_radius=2.5, location=(0.0, 240.0, 110.0), major_segments=64, minor_segments=16)
moon_ring = bpy.context.active_object
moon_ring.rotation_euler = (0.45, 0.2, 0)
smooth(moon_ring)
moon_ring.data.materials.append(mat_cyan_crystal)

# Ánh sáng toàn cục
bpy.ops.object.light_add(type='SUN', location=(50.0, 100.0, 130.0))
moon_sun = bpy.context.active_object
moon_sun.name = "Sun_Moonlight"
moon_sun.data.energy = 6.2
moon_sun.data.color = (0.78, 0.90, 1.0)
moon_sun.rotation_euler = (0.65, -0.35, 2.5)

bpy.ops.object.light_add(type='POINT', location=(0.0, 20.0, 60.0))
ambient_light = bpy.context.active_object
ambient_light.name = "Ambient_Sky_Light"
ambient_light.data.energy = 650.0
ambient_light.data.color = (0.48, 0.68, 0.88)

world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("Mystic_Moon_World")
    bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.015, 0.025, 0.055, 1.0)
    bg_node.inputs['Strength'].default_value = 1.0

# -----------------------------------------------------------------------------
# 13. HỆ THỐNG 6 GÓC CAMERA CINEMATIC TOÀN CẢNH (CINEMATIC CAMERAS)
# -----------------------------------------------------------------------------
# 1. Camera Toàn cảnh Vương Quốc Siêu Khổng Lồ 520m
bpy.ops.object.camera_add(location=(0.0, -170.0, 85.0))
cam_pan = bpy.context.active_object
cam_pan.name = "Grand_Kingdom_Camera"
shrine_target = mathutils.Vector((0.0, 15.0, 8.0))
cam_pan.rotation_euler = (shrine_target - cam_pan.location).to_track_quat('-Z', 'Y').to_euler()
cam_pan.data.lens = 20.0
bpy.context.scene.camera = cam_pan

bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

# 2. Camera Đấu Trường La Mã Bị Bỏ Hoang (Colosseum View)
bpy.ops.object.camera_add(location=(colo_x - 18.0, colo_y - 14.0, colo_z + 5.0))
cam_colo = bpy.context.active_object
cam_colo.name = "Colosseum_Camera"
colo_target = mathutils.Vector((colo_x + 2.0, colo_y + 2.0, colo_z + 2.2))
cam_colo.rotation_euler = (colo_target - cam_colo.location).to_track_quat('-Z', 'Y').to_euler()
cam_colo.data.lens = 20.0

# 3. Camera Tế Đàn 2 Tầng & Hồ Thủy Ngân (Altar & Mercury Lake View)
bpy.ops.object.camera_add(location=(altar_x - 16.0, altar_y - 22.0, altar_z + 10.0))
cam_altar = bpy.context.active_object
cam_altar.name = "Altar_Mercury_Camera"
altar_target = mathutils.Vector((altar_x, altar_y, altar_z + 6.0))
cam_altar.rotation_euler = (altar_target - cam_altar.location).to_track_quat('-Z', 'Y').to_euler()
cam_altar.data.lens = 22.0

# 4. Camera Trạm Vũ Trụ Công Nghệ Tối Tân (Space Station View)
bpy.ops.object.camera_add(location=(st_x + 22.0, st_y - 20.0, st_z + 14.0))
cam_station = bpy.context.active_object
cam_station.name = "Space_Station_Camera"
station_target = mathutils.Vector((hub_x, hub_y, hub_z + 4.0))
cam_station.rotation_euler = (station_target - cam_station.location).to_track_quat('-Z', 'Y').to_euler()
cam_station.data.lens = 24.0

# 5. Camera Nội Thất Lâu Đài Ngai Vàng (Throne Room View)
bpy.ops.object.camera_add(location=(c_x, c_y - 19.0, hall_z + 2.4))
cam_castle = bpy.context.active_object
cam_castle.name = "Throne_Hall_WalkIn_Camera"
throne_target = mathutils.Vector((c_x, c_y + 17.0, throne_z + 2.2))
cam_castle.rotation_euler = (throne_target - cam_castle.location).to_track_quat('-Z', 'Y').to_euler()
cam_castle.data.lens = 24.0

# 6. Camera Hang Động Nguyệt Tinh (Crystal Cavern View)
bpy.ops.object.camera_add(location=(cave_x - 2.5, cave_y + 2.5, cave_z + 3.8))
cam_cave = bpy.context.active_object
cam_cave.name = "Crystal_Cavern_WalkIn_Camera"
cave_target = mathutils.Vector((cave_x + 8.0, cave_y - 8.0, cave_z + 1.5))
cam_cave.rotation_euler = (cave_target - cam_cave.location).to_track_quat('-Z', 'Y').to_euler()
cam_cave.data.lens = 22.0

# -----------------------------------------------------------------------------
# 14. XUẤT FILE BLEND, FBX VÀ RENDER TẤT CẢ ẢNH PREVIEW
# -----------------------------------------------------------------------------
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments"
os.makedirs(output_dir, exist_ok=True)

blend_path = os.path.join(output_dir, "MysticMoonMap.blend")
fbx_path = os.path.join(output_dir, "MysticMoonMap.fbx")

render_pan = os.path.join(output_dir, "MysticMoonMap_Preview.png")
render_colo = os.path.join(output_dir, "MysticMoonMap_Colosseum_Preview.png")
render_altar = os.path.join(output_dir, "MysticMoonMap_AltarMercury_Preview.png")
render_station = os.path.join(output_dir, "MysticMoonMap_SpaceStation_Preview.png")
render_castle = os.path.join(output_dir, "MysticMoonMap_CastleInterior_Preview.png")
render_cave = os.path.join(output_dir, "MysticMoonMap_Cave_Preview.png")

# Đặt camera mặc định là Toàn Cảnh
bpy.context.scene.camera = cam_pan
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)

renders_list = [
    (cam_pan, render_pan, "TOÀN CẢNH BẢN ĐỒ 520M"),
    (cam_colo, render_colo, "ĐẤU TRƯỜNG LA MÃ BỎ HOANG"),
    (cam_altar, render_altar, "TRỤ TẾ ĐÀN 2 TẦNG & HỒ THỦY NGÂN"),
    (cam_station, render_station, "TRẠM VŨ TRỤ CÔNG NGHỆ TỐI TÂN"),
    (cam_castle, render_castle, "NỘI THẤT ĐẠI ĐIỆN NGAI VÀNG"),
    (cam_cave, render_cave, "HANG ĐỘNG NGUYỆT TINH")
]

for cam_obj, out_img, title in renders_list:
    bpy.context.scene.camera = cam_obj
    bpy.context.scene.render.filepath = out_img
    try:
        bpy.ops.render.render(write_still=True)
        print(f"📸 ĐÃ RENDER: {title} -> {out_img}")
    except Exception as e:
        print(f"⚠️ Lỗi render {title}: {e}")

# Đặt lại camera mặc định và lưu blend file
bpy.context.scene.camera = cam_pan
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Đồng bộ tự động sang thư mục cha và Desktop
desktop_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\Blender"
os.makedirs(desktop_dir, exist_ok=True)
root_art_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender"

sync_files = [
    ("MysticMoonMap.blend", blend_path),
    ("MysticMoonMap.fbx", fbx_path),
    ("MysticMoonMap_Preview.png", render_pan),
    ("MysticMoonMap_Colosseum_Preview.png", render_colo),
    ("MysticMoonMap_AltarMercury_Preview.png", render_altar),
    ("MysticMoonMap_SpaceStation_Preview.png", render_station),
    ("MysticMoonMap_CastleInterior_Preview.png", render_castle),
    ("MysticMoonMap_Cave_Preview.png", render_cave)
]

for fname, src in sync_files:
    shutil.copy2(src, os.path.join(root_art_dir, fname))
    shutil.copy2(src, os.path.join(desktop_dir, fname))

shutil.copy2(blend_path, r"c:\Users\Admin\OneDrive\Máy tính\Desktop\MysticMoonMap_3D.blend")

print(f"✅ HOÀN TẤT VÀ LƯU THÀNH CÔNG VÀO BLENDER:")
print(f"  - Blend: {blend_path}")
print(f"  - FBX: {fbx_path}")
print(f"  - Render Toàn cảnh 520m: {render_pan}")
print(f"  - Render Đấu trường La Mã: {render_colo}")
print(f"  - Render Tế đàn & Hồ Thủy ngân: {render_altar}")
print(f"  - Render Trạm Vũ trụ: {render_station}")
print(f"  - Render Nội thất Lâu đài: {render_castle}")
print(f"  - Render Hang động: {render_cave}")
print(f"  - Đã sao chép sang Desktop: {desktop_dir}")
