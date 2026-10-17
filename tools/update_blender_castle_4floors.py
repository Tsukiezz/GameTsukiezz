import re
import sys

def main():
    script_path = r'tools/build_colossal_mystic_moon_map.py'
    with open(script_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Add materials if missing
    mat_marker = 'mat_chandelier_iron = create_mat("Mat_Chandelier_Iron", (0.10, 0.12, 0.18, 1.0), roughness=0.4, metallic=0.9)'
    new_mats = '''mat_chandelier_iron = create_mat("Mat_Chandelier_Iron", (0.10, 0.12, 0.18, 1.0), roughness=0.4, metallic=0.9)
mat_attic_timber = create_mat("Mat_Attic_Timber", (0.18, 0.11, 0.08, 1.0), roughness=0.85, metallic=0.0)
mat_iron_bars = create_mat("Mat_Iron_Bars", (0.18, 0.22, 0.28, 1.0), roughness=0.4, metallic=0.85)
mat_stained_glass = create_mat("Mat_Stained_Glass", (0.0, 0.95, 0.85, 1.0), roughness=0.1, metallic=0.1, emissive=(0.0, 0.8, 0.7, 1.0), emit_strength=3.0)'''

    if mat_marker in code and 'Mat_Attic_Timber' not in code:
        code = code.replace(mat_marker, new_mats)
        print("Added new castle materials.")

    # Locate section 6: ĐẠI LÂU ĐÀI HOÀNG GIA
    castle_start = '# 6. ĐẠI LÂU ĐÀI HOÀNG GIA (WALK-IN CITADEL MESA - TÂY BẮC)'
    bridge_end = 'parapet.data.materials.append(mat_castle_stone)'
    
    start_idx = code.find(castle_start)
    end_idx = code.find(bridge_end, start_idx) + len(bridge_end)

    if start_idx == -1 or end_idx == -1:
        print("Error: Could not find castle section in script.")
        return

    new_castle_code = '''# 6. ĐẠI LÂU ĐÀI HOÀNG GIA 4 TẦNG CHI TIẾT (WALK-IN CITADEL MESA - TÂY BẮC)
# Gồm 4 tầng:
# - Tầng Hầm (Dungeon Vault / Sarcophagus & Secret Treasury) [z = c_z + 1.0]
# - Tầng 1 (Đại Điện Hoàng Gia / Bàn Tiệc & Giáp Trụ Kỵ Sĩ) [z = c_z + 6.0]
# - Tầng 2 (Thánh Điện Ngai Vàng Mặt Trăng & Thư Viện Hoàng Gia) [z = c_z + 13.5]
# - Tầng 3 (Gác Mái Bí Mật / Astral Core & Khung Gỗ Gothic) [z = c_z + 21.0]
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

# 4 Tháp góc khổng lồ cao 44m
towers_data = [
    (c_x - 21.0, c_y - 23.0),
    (c_x + 21.0, c_y - 23.0),
    (c_x - 21.0, c_y + 23.0),
    (c_x + 21.0, c_y + 23.0)
]
for t_i, (tx, ty) in enumerate(towers_data):
    t_height = 40.0
    bpy.ops.mesh.primitive_cylinder_add(radius=4.8, depth=t_height, location=(tx, ty, c_z + t_height / 2 + 2.0), vertices=32)
    tower = bpy.context.active_object
    smooth(tower)
    tower.data.materials.append(mat_castle_stone)

    bpy.ops.mesh.primitive_cylinder_add(radius=5.5, depth=1.8, location=(tx, ty, c_z + t_height + 2.0), vertices=32)
    balcony = bpy.context.active_object
    smooth(balcony)
    balcony.data.materials.append(mat_gold_trim)

    bpy.ops.mesh.primitive_cone_add(radius1=5.4, depth=14.0, location=(tx, ty, c_z + t_height + 9.0), vertices=32)
    roof = bpy.context.active_object
    smooth(roof)
    roof.data.materials.append(mat_castle_roof)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.2, location=(tx, ty, c_z + t_height + 16.5))
    gem = bpy.context.active_object
    smooth(gem)
    gem.data.materials.append(mat_cyan_crystal if t_i % 2 == 0 else mat_purple_crystal)

    bpy.ops.object.light_add(type='POINT', location=(tx, ty, c_z + t_height + 17.0))
    sp_lt = bpy.context.active_object
    sp_lt.data.energy = 80.0
    sp_lt.data.color = (0.0, 0.95, 0.85) if t_i % 2 == 0 else (0.65, 0.35, 0.95)

# Tường thành bao quanh 4 tầng (Cao 26m)
for w_info in [
    (c_x - 21.0, c_y, (2.8, 44.0, 26.0)),
    (c_x + 21.0, c_y, (2.8, 44.0, 26.0)),
    (c_x, c_y + 23.0, (42.0, 2.8, 26.0)),
    (c_x - 14.0, c_y - 23.0, (14.0, 2.8, 26.0)),
    (c_x + 14.0, c_y - 23.0, (14.0, 2.8, 26.0)),
    (c_x, c_y - 23.0, (14.0, 3.0, 10.0))
]:
    w_pos_z = c_z + 15.0 if w_info[2][2] > 12.0 else c_z + 23.0
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(w_info[0], w_info[1], w_pos_z))
    w_obj = bpy.context.active_object
    w_obj.scale = w_info[2]
    smooth(w_obj)
    w_obj.data.materials.append(mat_castle_stone)

# =============================================================================
# LEVEL 0: TẦNG HẦM (BASEMENT DUNGEON, CRYPT & ROYAL TREASURY - z = c_z + 1.0)
# =============================================================================
dungeon_z = c_z + 1.0

# Sàn đá hầm ngục
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, dungeon_z))
dungeon_floor = bpy.context.active_object
dungeon_floor.name = "Castle_Dungeon_Floor"
dungeon_floor.scale = (38.0, 42.0, 0.4)
smooth(dungeon_floor)
dungeon_floor.data.materials.append(mat_castle_dark_stone)

# Trần đá hầm ngục (ngăn cách với Tầng 1)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, dungeon_z + 4.8))
dungeon_ceiling = bpy.context.active_object
dungeon_ceiling.scale = (38.0, 42.0, 0.4)
smooth(dungeon_ceiling)
dungeon_ceiling.data.materials.append(mat_castle_dark_stone)

# 3 Phòng giam sắt (Iron Prison Cells) phía Tây
for cell in range(3):
    cell_y = c_y - 10.0 + cell * 10.0
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 16.0, cell_y, dungeon_z + 2.4))
    cell_wall = bpy.context.active_object
    cell_wall.scale = (6.0, 0.4, 4.8)
    smooth(cell_wall)
    cell_wall.data.materials.append(mat_castle_stone)

    # Song sắt nhà giam
    for b in range(6):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=4.6, location=(c_x - 13.0, cell_y - 4.2 + b * 0.85, dungeon_z + 2.4), vertices=12)
        bar = bpy.context.active_object
        bar.data.materials.append(mat_iron_bars)

# Quan tài Hiệp sĩ Mặt Trăng Cổ Đại (Ancient Moon Sarcophagus) giữa hầm
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, dungeon_z + 0.8))
sarco = bpy.context.active_object
sarco.scale = (4.4, 2.4, 1.4)
smooth(sarco)
sarco.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_torus_add(major_radius=0.8, minor_radius=0.12, location=(c_x, c_y, dungeon_z + 1.6), major_segments=24, minor_segments=12)
sarco_rune = bpy.context.active_object
smooth(sarco_rune)
sarco_rune.data.materials.append(mat_purple_crystal)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y, dungeon_z + 2.2))
sarco_lt = bpy.context.active_object
sarco_lt.data.energy = 75.0
sarco_lt.data.color = (0.65, 0.35, 0.95)

# Kho báu Hoàng Gia bí mật (Secret Treasury Alcove) phía Đông
for ch in range(3):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 15.0, c_y + 6.0 + ch * 3.2, dungeon_z + 0.6))
    t_chest = bpy.context.active_object
    t_chest.scale = (1.6, 1.2, 1.0)
    smooth(t_chest)
    t_chest.data.materials.append(mat_gold_trim)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.35, location=(c_x + 15.0, c_y + 6.0 + ch * 3.2, dungeon_z + 1.3))
    t_gem = bpy.context.active_object
    smooth(t_gem)
    t_gem.data.materials.append(mat_cyan_crystal)

# Cầu thang đá nối từ Tầng 1 xuống Hầm ngục (Tây Bắc)
for s in range(10):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 16.0, c_y - 22.0 + s * 1.2, dungeon_z + 4.8 - s * 0.48))
    d_step = bpy.context.active_object
    d_step.scale = (3.6, 1.3, 0.5)
    smooth(d_step)
    d_step.data.materials.append(mat_castle_stone)

# =============================================================================
# LEVEL 1: TẦNG 1 (ĐẠI ĐIỆN HOÀNG GIA & BÀN TIỆC KỴ SĨ - z = c_z + 6.0)
# =============================================================================
hall_z = c_z + 6.0

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, hall_z))
hall_floor = bpy.context.active_object
hall_floor.name = "Throne_Hall_Floor"
hall_floor.scale = (38.0, 42.0, 0.4)
smooth(hall_floor)
hall_floor.data.materials.append(mat_interior_marble)

# Thảm nhung đỏ hoàng gia dài 34m
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 3.0, hall_z + 0.25))
carpet = bpy.context.active_object
carpet.name = "Royal_Red_Carpet"
carpet.scale = (5.5, 34.0, 0.1)
smooth(carpet)
carpet.data.materials.append(mat_royal_carpet)

# 6 Cột trụ đá cẩm thạch La Mã có đuốc vàng
for col_side in [-1, 1]:
    for col_i in range(3):
        col_y = c_y - 14.0 + col_i * 12.0
        col_x = c_x + col_side * 8.0
        bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=7.0, location=(col_x, col_y, hall_z + 3.5), vertices=24)
        pillar = bpy.context.active_object
        smooth(pillar)
        pillar.data.materials.append(mat_castle_stone)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(col_x, col_y, hall_z + 7.2))
        cap = bpy.context.active_object
        cap.scale = (2.4, 2.4, 0.6)
        smooth(cap)
        cap.data.materials.append(mat_gold_trim)

        bpy.ops.object.light_add(type='POINT', location=(col_x - col_side * 1.0, col_y, hall_z + 4.5))
        t_lt = bpy.context.active_object
        t_lt.data.energy = 60.0
        t_lt.data.color = (1.0, 0.85, 0.50)

# Bàn Tiệc Hoàng Gia (Royal Banquet Table) phía Tây
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 12.0, c_y - 5.0, hall_z + 0.6))
banquet_tab = bpy.context.active_object
banquet_tab.scale = (3.2, 14.0, 1.1)
smooth(banquet_tab)
banquet_tab.data.materials.append(mat_chest_wood)

for ch_i in range(5):
    for ch_s in [-2.0, 2.0]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 12.0 + ch_s, c_y - 10.0 + ch_i * 2.5, hall_z + 0.9))
        chair = bpy.context.active_object
        chair.scale = (0.8, 0.8, 1.8)
        smooth(chair)
        chair.data.materials.append(mat_chest_wood)

# Bệ Giáp Trụ Kỵ Sĩ (Knights' Armory Display) phía Đông
for a_i in range(2):
    arm_y = c_y - 9.0 + a_i * 8.0
    arm_x = c_x + 12.0
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=0.8, location=(arm_x, arm_y, hall_z + 0.4), vertices=16)
    ped = bpy.context.active_object
    smooth(ped)
    ped.data.materials.append(mat_ruin_stone)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.4, depth=2.4, location=(arm_x, arm_y, hall_z + 2.0), vertices=16)
    armor_mesh = bpy.context.active_object
    smooth(armor_mesh)
    armor_mesh.data.materials.append(mat_ancient_iron)

# Cầu Thang Đôi Đại Điện (Imperial Double Staircase) dẫn lên Tầng 2
for s in range(7):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 5.0 + s * 1.0, hall_z + 0.25 + s * 0.5))
    st = bpy.context.active_object
    st.scale = (7.0, 1.2, 0.5)
    smooth(st)
    st.data.materials.append(mat_castle_stone)

for wing_side in [-1, 1]:
    for s in range(7):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + wing_side * 13.0, c_y + 11.0 + s * 1.0, hall_z + 3.75 + s * 0.5))
        st_wing = bpy.context.active_object
        st_wing.scale = (4.5, 1.2, 0.5)
        smooth(st_wing)
        st_wing.data.materials.append(mat_castle_stone)

# =============================================================================
# LEVEL 2: TẦNG 2 (THÁNH ĐIỆN NGAI VÀNG & THƯ VIỆN - z = c_z + 13.5)
# =============================================================================
floor2_z = c_z + 13.5

# Sàn tầng 2 với giếng trời nhìn xuống Tầng 1 (Mezzanine Balcony)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 16.0, floor2_z))
f2_north = bpy.context.active_object
f2_north.scale = (38.0, 12.0, 0.4)
smooth(f2_north)
f2_north.data.materials.append(mat_interior_marble)

for side_x in [-14.0, 14.0]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + side_x, c_y - 1.5, floor2_z))
    f2_side = bpy.context.active_object
    f2_side.scale = (10.0, 27.0, 0.4)
    smooth(f2_side)
    f2_side.data.materials.append(mat_interior_marble)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 16.0, floor2_z))
f2_south = bpy.context.active_object
f2_south.scale = (38.0, 5.0, 0.4)
smooth(f2_south)
f2_south.data.materials.append(mat_interior_marble)

# Lan can vàng viền quanh giếng trời
for r_side in [-9.2, 9.2]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + r_side, c_y - 1.5, floor2_z + 0.6))
    rail = bpy.context.active_object
    rail.scale = (0.4, 26.0, 1.2)
    smooth(rail)
    rail.data.materials.append(mat_gold_trim)

# NGAI VÀNG MẶT TRĂNG TSUKIEZZ (MOON THRONE) TRÊN BỆ ĐÁ
dais_z = floor2_z + 0.6
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 18.0, dais_z))
throne_dais = bpy.context.active_object
throne_dais.scale = (10.0, 7.0, 1.2)
smooth(throne_dais)
throne_dais.data.materials.append(mat_ruin_stone)

throne_z = dais_z + 1.2
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 18.5, throne_z))
t_seat = bpy.context.active_object
t_seat.scale = (3.2, 2.2, 1.4)
smooth(t_seat)
t_seat.data.materials.append(mat_throne_velvet)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 19.4, throne_z + 2.3))
t_back = bpy.context.active_object
t_back.scale = (3.0, 0.6, 4.6)
smooth(t_back)
t_back.data.materials.append(mat_gold_trim)

# 2 Trăng Lưỡi Liềm Khổng Lồ hai bên ngai
for m_side in [-1.8, 1.8]:
    bpy.ops.mesh.primitive_torus_add(major_radius=1.6, minor_radius=0.22, location=(c_x + m_side, c_y + 19.0, throne_z + 2.8), major_segments=24, minor_segments=12)
    crescent = bpy.context.active_object
    crescent.rotation_euler = (0, 0, -0.4 if m_side > 0 else 0.4)
    smooth(crescent)
    crescent.data.materials.append(mat_gold_trim)

# Cửa sổ hoa hồng Gothic kính màu rực rỡ (Stained Glass Rose Window)
bpy.ops.mesh.primitive_torus_add(major_radius=3.8, minor_radius=0.35, location=(c_x, c_y + 22.8, floor2_z + 5.0), major_segments=32, minor_segments=16)
rose_frame = bpy.context.active_object
rose_frame.rotation_euler = (1.5708, 0, 0)
smooth(rose_frame)
rose_frame.data.materials.append(mat_gold_trim)

bpy.ops.mesh.primitive_cylinder_add(radius=3.6, depth=0.1, location=(c_x, c_y + 22.7, floor2_z + 5.0), vertices=32)
rose_glass = bpy.context.active_object
rose_glass.rotation_euler = (1.5708, 0, 0)
smooth(rose_glass)
rose_glass.data.materials.append(mat_stained_glass)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y + 18.0, floor2_z + 4.5))
throne_light = bpy.context.active_object
throne_light.data.energy = 220.0
throne_light.data.color = (1.0, 0.92, 0.70)

# Thư viện Hoàng Gia (East Wing: x = c_x + 14)
for b_i in range(3):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 18.5, c_y - 11.0 + b_i * 6.5, floor2_z + 2.6))
    bookshelf = bpy.context.active_object
    bookshelf.scale = (0.8, 5.0, 5.2)
    smooth(bookshelf)
    bookshelf.data.materials.append(mat_chest_wood)

# Bàn học giả & Sách phép lơ lửng
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 13.5, c_y - 4.0, floor2_z + 0.6))
study_desk = bpy.context.active_object
study_desk.scale = (2.4, 1.6, 1.1)
smooth(study_desk)
study_desk.data.materials.append(mat_chest_wood)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 13.5, c_y - 4.0, floor2_z + 1.6))
float_book = bpy.context.active_object
float_book.scale = (0.6, 0.8, 0.15)
float_book.rotation_euler = (0, 0, 0.4)
smooth(float_book)
float_book.data.materials.append(mat_throne_velvet)

# Cầu thang bí mật lên Gác Mái (sau giá sách)
for s in range(12):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 16.0, c_y + 2.0 + s * 0.9, floor2_z + 0.25 + s * 0.58))
    attic_step = bpy.context.active_object
    attic_step.scale = (3.2, 1.0, 0.5)
    smooth(attic_step)
    attic_step.data.materials.append(mat_castle_stone)

# 2 Đèn chùm hoàng gia
for ch_y in [c_y - 6.0, c_y + 6.0]:
    bpy.ops.mesh.primitive_torus_add(major_radius=2.6, minor_radius=0.18, location=(c_x, ch_y, floor2_z + 4.5), major_segments=24, minor_segments=8)
    chandelier = bpy.context.active_object
    smooth(chandelier)
    chandelier.data.materials.append(mat_chandelier_iron)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.6, location=(c_x, ch_y, floor2_z + 4.5))
    ch_glow = bpy.context.active_object
    smooth(ch_glow)
    ch_glow.data.materials.append(mat_candle_flame)

    bpy.ops.object.light_add(type='POINT', location=(c_x, ch_y, floor2_z + 3.8))
    ch_lt = bpy.context.active_object
    ch_lt.data.energy = 140.0
    ch_lt.data.color = (1.0, 0.85, 0.45)

# =============================================================================
# LEVEL 3: TẦNG 3 - GÁC MÁI BÍ MẬT & ASTRAL SANCTUM (z = c_z + 21.0)
# =============================================================================
attic_z = c_z + 21.0

# Sàn gỗ gác mái
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, attic_z))
attic_floor = bpy.context.active_object
attic_floor.name = "Castle_Secret_Attic_Floor"
attic_floor.scale = (36.0, 40.0, 0.4)
smooth(attic_floor)
attic_floor.data.materials.append(mat_attic_timber)

# Khung giàn xà gỗ Gothic A-Frame
for r in range(5):
    r_y = c_y - 16.0 + r * 8.0
    for side_r in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + side_r * 9.0, r_y, attic_z + 7.0))
        rafter = bpy.context.active_object
        rafter.scale = (0.4, 0.5, 16.0)
        rafter.rotation_euler = (0, -0.55 if side_r < 0 else 0.55, 0)
        smooth(rafter)
        rafter.data.materials.append(mat_attic_timber)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, r_y, attic_z + 6.0))
    tie_beam = bpy.context.active_object
    tie_beam.scale = (19.0, 0.5, 0.5)
    smooth(tie_beam)
    tie_beam.data.materials.append(mat_attic_timber)

# Mái chóp nhọn Gothic trung tâm
bpy.ops.mesh.primitive_cone_add(radius1=18.0, depth=22.0, location=(c_x, c_y, attic_z + 11.0), vertices=4)
spire_cone = bpy.context.active_object
spire_cone.rotation_euler = (0, 0, 0.7854)
smooth(spire_cone)
spire_cone.data.materials.append(mat_castle_roof)

# Cửa sổ kính ngắm sao Starlight Skylight Oculum
bpy.ops.mesh.primitive_torus_add(major_radius=2.8, minor_radius=0.25, location=(c_x, c_y, attic_z + 6.5), major_segments=24, minor_segments=12)
skylight_rim = bpy.context.active_object
smooth(skylight_rim)
skylight_rim.data.materials.append(mat_gold_trim)

bpy.ops.mesh.primitive_cylinder_add(radius=2.6, depth=0.1, location=(c_x, c_y, attic_z + 6.5), vertices=24)
skylight_glass = bpy.context.active_object
smooth(skylight_glass)
skylight_glass.data.materials.append(mat_cyan_crystal)

# Trái Tim Nguyệt Tộc & Sách Phép Huyền Thuật Lơ Lửng (Astral Core)
bpy.ops.mesh.primitive_cylinder_add(radius=3.0, depth=0.9, location=(c_x, c_y, attic_z + 0.45), vertices=16)
core_altar = bpy.context.active_object
smooth(core_altar)
core_altar.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.85, location=(c_x, c_y, attic_z + 2.2))
astral_core = bpy.context.active_object
smooth(astral_core)
astral_core.data.materials.append(mat_purple_crystal)

bpy.ops.mesh.primitive_torus_add(major_radius=1.5, minor_radius=0.1, location=(c_x, c_y, attic_z + 2.2), major_segments=24, minor_segments=12)
astral_ring = bpy.context.active_object
astral_ring.rotation_euler = (0.6, 0.2, 0)
smooth(astral_ring)
astral_ring.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y, attic_z + 2.5))
core_lt = bpy.context.active_object
core_lt.data.energy = 180.0
core_lt.data.color = (0.65, 0.35, 0.95)

# Rương báu bí mật Gác mái (Secret Attic Chest)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 12.0, c_y + 8.0, attic_z + 0.6))
attic_chest = bpy.context.active_object
attic_chest.scale = (2.0, 1.4, 1.2)
smooth(attic_chest)
attic_chest.data.materials.append(mat_gold_trim)

# Ban công bí mật đỉnh tháp (Spire Overlook Balcony) nhìn toàn cảnh 520m
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 22.0, attic_z - 0.2))
spire_balcony = bpy.context.active_object
spire_balcony.scale = (10.0, 6.0, 0.8)
smooth(spire_balcony)
spire_balcony.data.materials.append(mat_castle_stone)

# Cầu cạn đá vững chãi nối từ trung tâm lên cổng lâu đài Tầng 1
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
    parapet.data.materials.append(mat_castle_stone)'''

    code = code[:start_idx] + new_castle_code + code[end_idx:]

    # Update camera 5 to frame the magnificent multi-floor Castle Interior
    cam_pattern = re.compile(r'# 5\. Camera Nội Thất Lâu Đài Ngai Vàng \(Throne Room View\).*?cam_castle\.data\.lens = 24\.0', re.DOTALL)
    new_cam = '''# 5. Camera Nội Thất Lâu Đài 4 Tầng (Multi-tier Castle View)
cam_castle = bpy.context.active_object
cam_castle.name = "Throne_Hall_WalkIn_Camera"
cam_castle.location = (c_x - 11.0, c_y - 12.0, c_z + 18.5)
throne_target = mathutils.Vector((c_x, c_y + 14.0, c_z + 16.0))
cam_castle.rotation_euler = (throne_target - cam_castle.location).to_track_quat('-Z', 'Y').to_euler()
cam_castle.data.lens = 20.0'''

    if cam_pattern.search(code):
        code = cam_pattern.sub(new_cam, code, count=1)
        print("Updated castle camera angle.")

    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(code)

    print("Finished updating tools/build_colossal_mystic_moon_map.py!")

if __name__ == '__main__':
    main()
