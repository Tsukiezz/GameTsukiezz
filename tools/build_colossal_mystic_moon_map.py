import bpy
import math
import random
import os
import mathutils

print("=== BẮT ĐẦU TẠO BẢN ĐỒ MẶT TRĂNG SIÊU KHỔNG LỒ (GẤP 4 LẦN, LÂU ĐÀI ĐẦY ĐỦ NỘI THẤT & HANG ĐỘNG) ===")

# Reset hoàn toàn Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# -----------------------------------------------------------------------------
# 1. HỆ THỐNG VẬT LIỆU (MATERIALS)
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

# Địa hình & Đá cổ
mat_moon_rock = create_mat("Mat_Moon_Rock", (0.07, 0.09, 0.14, 1.0), roughness=0.88, metallic=0.05)
mat_path_stone = create_mat("Mat_Path_Stone", (0.16, 0.20, 0.30, 1.0), roughness=0.75, metallic=0.1)
mat_castle_stone = create_mat("Mat_Castle_Stone", (0.22, 0.26, 0.36, 1.0), roughness=0.68, metallic=0.15)
mat_castle_dark_stone = create_mat("Mat_Castle_Dark_Stone", (0.14, 0.16, 0.24, 1.0), roughness=0.75, metallic=0.12)
mat_castle_roof = create_mat("Mat_Castle_Roof", (0.15, 0.10, 0.28, 1.0), roughness=0.35, metallic=0.25)
mat_ruin_stone = create_mat("Mat_Ruin_Stone", (0.20, 0.24, 0.34, 1.0), roughness=0.72, metallic=0.15)

# Nội thất Lâu Đài
mat_interior_marble = create_mat("Mat_Interior_Marble", (0.18, 0.20, 0.28, 1.0), roughness=0.25, metallic=0.1)
mat_royal_carpet = create_mat("Mat_Royal_Carpet", (0.75, 0.05, 0.12, 1.0), roughness=0.85)
mat_gold_trim = create_mat("Mat_Gold_Trim", (1.0, 0.84, 0.25, 1.0), roughness=0.2, metallic=0.9, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=4.5)
mat_rune_gold = create_mat("Mat_Rune_Gold", (1.0, 0.85, 0.25, 1.0), roughness=0.15, metallic=0.9, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=5.0)
mat_throne_velvet = create_mat("Mat_Throne_Velvet", (0.50, 0.08, 0.65, 1.0), roughness=0.8)
mat_chandelier_iron = create_mat("Mat_Chandelier_Iron", (0.12, 0.12, 0.15, 1.0), roughness=0.5, metallic=0.8)
mat_candle_flame = create_mat("Mat_Candle_Flame", (1.0, 0.75, 0.3, 1.0), roughness=0.1, emissive=(1.0, 0.75, 0.25, 1.0), emit_strength=8.0)
mat_quest_table = create_mat("Mat_Quest_Table", (0.35, 0.20, 0.10, 1.0), roughness=0.7)

# Cửa sổ lâu đài
mat_window_gold = create_mat("Mat_Window_Gold", (1.0, 0.9, 0.4, 1.0), roughness=0.2, emissive=(1.0, 0.85, 0.35, 1.0), emit_strength=8.0)
mat_window_cyan = create_mat("Mat_Window_Cyan", (0.3, 0.95, 1.0, 1.0), roughness=0.2, emissive=(0.2, 0.95, 1.0, 1.0), emit_strength=7.5)

# Tinh thể & Cổng dịch chuyển
mat_cyan_crystal = create_mat("Mat_Cyan_Crystal", (0.05, 0.95, 0.85, 1.0), roughness=0.12, metallic=0.15, emissive=(0.0, 0.98, 0.85, 1.0), emit_strength=6.0)
mat_purple_crystal = create_mat("Mat_Purple_Crystal", (0.55, 0.15, 0.88, 1.0), roughness=0.15, metallic=0.15, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=5.5)
mat_portal_vortex = create_mat("Mat_Portal_Vortex", (0.25, 0.08, 0.45, 1.0), roughness=0.1, emissive=(0.55, 0.18, 0.90, 1.0), emit_strength=7.0)
mat_starlight_pool = create_mat("Mat_Starlight_Pool", (0.02, 0.40, 0.50, 1.0), roughness=0.04, metallic=0.1, emissive=(0.0, 0.70, 0.65, 1.0), emit_strength=2.5)

# Hang Động
mat_cave_rock = create_mat("Mat_Cave_Rock", (0.08, 0.09, 0.12, 1.0), roughness=0.92)
mat_chest_wood = create_mat("Mat_Chest_Wood", (0.38, 0.22, 0.10, 1.0), roughness=0.75)
mat_chest_gold = create_mat("Mat_Chest_Gold", (0.95, 0.80, 0.20, 1.0), roughness=0.25, metallic=0.9)

# Đại Cổ Thụ & Nấm phát quang
mat_giant_tree_bark = create_mat("Mat_Giant_Tree_Bark", (0.12, 0.09, 0.15, 1.0), roughness=0.85)
mat_giant_tree_leaves = create_mat("Mat_Giant_Tree_Leaves", (0.05, 0.65, 0.75, 1.0), roughness=0.35, emissive=(0.08, 0.85, 0.95, 1.0), emit_strength=4.5)
mat_tree_tendrils = create_mat("Mat_Tree_Tendrils", (0.55, 0.15, 0.85, 1.0), roughness=0.4, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=4.0)
mat_shroom_cap_purple = create_mat("Mat_Shroom_Cap_Purple", (0.40, 0.10, 0.65, 1.0), roughness=0.35, emissive=(0.55, 0.15, 0.85, 1.0), emit_strength=3.5)
mat_shroom_cap_cyan = create_mat("Mat_Shroom_Cap_Cyan", (0.05, 0.70, 0.65, 1.0), roughness=0.35, emissive=(0.0, 0.90, 0.80, 1.0), emit_strength=4.0)
mat_shroom_stem = create_mat("Mat_Shroom_Stem", (0.92, 0.92, 0.88, 1.0), roughness=0.75)
mat_shroom_dots = create_mat("Mat_Shroom_Dots", (0.3, 1.0, 0.9, 1.0), roughness=0.2, emissive=(0.2, 1.0, 0.9, 1.0), emit_strength=6.0)

# Vầng trăng thiên hà
mat_celestial_moon = create_mat("Mat_Celestial_Moon", (0.94, 0.97, 1.0, 1.0), roughness=0.15, emissive=(0.92, 0.97, 1.0, 1.0), emit_strength=3.5)

def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def subsurf(obj, lv=1):
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = lv
    m.render_levels = lv

# -----------------------------------------------------------------------------
# 2. ĐỊA HÌNH MẶT TRĂNG SIÊU KHỔNG LỒ (260m x 260m - GẤP 4 LẦN DIỆN TÍCH)
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=128, y_subdivisions=128, size=260, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "Terrain_Colossal_Lunar_World"

mesh = terrain.data
random.seed(77)
for v in mesh.vertices:
    x, y = v.co.x, v.co.y
    dist_center = math.sqrt(x*x + y*y)
    
    # 1. Thung lũng trung tâm (Central Sanctuary)
    z_center = -1.0 * math.exp(- (dist_center / 22.0)**2)
    
    # 2. Cao nguyên vách đá Tây Bắc khổng lồ để đặt Lâu Đài (Castle Mountain)
    dist_castle = math.sqrt((x + 48)**2 + (y - 55)**2)
    z_castle = 14.5 * math.exp(- (dist_castle / 42.0)**2)
    
    # 3. Núi đá Hang Động Đông Nam (Cave Mountain Ridge)
    dist_cave = math.sqrt((x - 55)**2 + (y + 45)**2)
    z_cave = 12.0 * math.exp(- (dist_cave / 35.0)**2)
    
    # 4. Gò đồi Đại Cổ Thụ Thế Giới phía Đông Bắc (World Tree Plateau)
    dist_tree = math.sqrt((x - 65)**2 + (y - 25)**2)
    z_tree = 8.5 * math.exp(- (dist_tree / 32.0)**2)
    
    # 5. Dãy núi cao bao quanh ranh giới thế giới
    rim_mountains = 5.5 * math.sin(x * 0.04) * math.cos(y * 0.04)
    
    # 6. Các miệng hố va chạm mặt trăng
    crater1 = -3.2 * math.exp(- (((x - 30)**2 + (y - 45)**2) / 35.0))
    crater2 = -3.8 * math.exp(- (((x + 45)**2 + (y + 35)**2) / 45.0))
    crater3 = -2.5 * math.exp(- (((x - 15)**2 + (y + 65)**2) / 40.0))
    
    noise = (random.random() - 0.5) * 0.45
    v.co.z = z_center + z_castle + z_cave + z_tree + rim_mountains + crater1 + crater2 + crater3 + noise

smooth(terrain)
subsurf(terrain, 1)
terrain.data.materials.append(mat_moon_rock)

# Mạng lưới đường đá cổ nối các khu vực (Ancient Road Network)
# Đường chính từ Cổng phía Nam vào Thánh Địa
for path_i in range(24):
    py = -55.0 + path_i * 2.2
    px = math.sin(path_i * 0.22) * 0.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, -0.15))
    tile = bpy.context.active_object
    tile.scale = (3.2, 1.8, 0.25)
    smooth(tile)
    tile.data.materials.append(mat_path_stone)

# Trụ đèn đá dọc con đường chính
for l_idx, (lx, ly) in enumerate([(-3.0, -45.0), (3.0, -45.0), (-3.2, -30.0), (3.2, -30.0), (-3.5, -15.0), (3.5, -15.0)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=2.4, location=(lx, ly, 1.0), vertices=12)
    post = bpy.context.active_object
    smooth(post)
    post.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.35, location=(lx, ly, 2.2))
    lamp = bpy.context.active_object
    smooth(lamp)
    lamp.data.materials.append(mat_cyan_crystal)
    
    bpy.ops.object.light_add(type='POINT', location=(lx, ly, 2.3))
    lamp_lt = bpy.context.active_object
    lamp_lt.data.energy = 45.0
    lamp_lt.data.color = (0.0, 0.95, 0.85)

# Hồ tinh thể ánh trăng lớn (Grand Starlight Crater Pool)
bpy.ops.mesh.primitive_cylinder_add(radius=12.0, depth=0.5, location=(25, 30, -0.6), vertices=48)
pool = bpy.context.active_object
smooth(pool)
pool.data.materials.append(mat_starlight_pool)

bpy.ops.mesh.primitive_torus_add(major_radius=12.0, minor_radius=0.7, location=(25, 30, -0.4), major_segments=48, minor_segments=16)
pool_rim = bpy.context.active_object
smooth(pool_rim)
pool_rim.data.materials.append(mat_moon_rock)

# -----------------------------------------------------------------------------
# 3. ĐẠI LÂU ĐÀI ÁNH TRĂNG SIÊU KHỔNG LỒ VÀ NỘI THẤT BÊN TRONG
# Người chơi có thể đi qua cầu, bước qua cổng vòm và vào trong Đại Điện Ngai Vàng!
# -----------------------------------------------------------------------------
c_x, c_y, c_z = -48.0, 55.0, 14.5

# Bệ móng thành lũy (Colossal Castle Foundation)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, c_z + 1.5))
castle_base = bpy.context.active_object
castle_base.scale = (44.0, 48.0, 3.5)
smooth(castle_base)
castle_base.data.materials.append(mat_castle_stone)

# 4 Tháp góc khổng lồ (4 Colossal Corner Towers)
towers_data = [
    (c_x - 18.0, c_y - 20.0),
    (c_x + 18.0, c_y - 20.0),
    (c_x - 18.0, c_y + 20.0),
    (c_x + 18.0, c_y + 20.0)
]
for t_i, (tx, ty) in enumerate(towers_data):
    t_height = 28.0
    bpy.ops.mesh.primitive_cylinder_add(radius=4.2, depth=t_height, location=(tx, ty, c_z + t_height / 2 + 1.5), vertices=32)
    tower = bpy.context.active_object
    smooth(tower)
    tower.data.materials.append(mat_castle_stone)
    
    # Ban công quan sát
    bpy.ops.mesh.primitive_cylinder_add(radius=4.8, depth=1.2, location=(tx, ty, c_z + t_height + 1.5), vertices=32)
    balcony = bpy.context.active_object
    smooth(balcony)
    balcony.data.materials.append(mat_ruin_stone)
    
    # Mái chóp tháp Gothic
    bpy.ops.mesh.primitive_cone_add(radius1=4.6, depth=10.0, location=(tx, ty, c_z + t_height + 6.5), vertices=32)
    roof = bpy.context.active_object
    smooth(roof)
    roof.data.materials.append(mat_castle_roof)
    
    # Ngọc vương miện trên đỉnh tháp
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.8, location=(tx, ty, c_z + t_height + 12.0))
    gem = bpy.context.active_object
    smooth(gem)
    gem.data.materials.append(mat_cyan_crystal if t_i % 2 == 0 else mat_purple_crystal)

# Tường thành bên ngoài (Curtain Walls)
# Tường trái, tường phải, tường sau
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 18.0, c_y, c_z + 8.0))
w_left = bpy.context.active_object
w_left.scale = (2.5, 38.0, 14.0)
smooth(w_left)
w_left.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 18.0, c_y, c_z + 8.0))
w_right = bpy.context.active_object
w_right.scale = (2.5, 38.0, 14.0)
smooth(w_right)
w_right.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 20.0, c_z + 8.0))
w_back = bpy.context.active_object
w_back.scale = (36.0, 2.5, 14.0)
smooth(w_back)
w_back.data.materials.append(mat_castle_stone)

# MẶT TRƯỚC VÀ CỔNG VÒM RỘNG MỞ ĐỂ BƯỚC VÀO TRONG (Walk-in Gatehouse)
# Tường mặt trước có chừa cửa vòm ở giữa
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x - 12.0, c_y - 20.0, c_z + 8.0))
w_f1 = bpy.context.active_object
w_f1.scale = (12.0, 2.5, 14.0)
smooth(w_f1)
w_f1.data.materials.append(mat_castle_stone)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + 12.0, c_y - 20.0, c_z + 8.0))
w_f2 = bpy.context.active_object
w_f2.scale = (12.0, 2.5, 14.0)
smooth(w_f2)
w_f2.data.materials.append(mat_castle_stone)

# Vòm cổng trên cao
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 20.0, c_z + 12.5))
w_arch = bpy.context.active_object
w_arch.scale = (12.0, 2.6, 5.0)
smooth(w_arch)
w_arch.data.materials.append(mat_castle_stone)

# --- NỘI THẤT ĐẠI ĐIỆN NGAI VÀNG (GRAND THRONE HALL INTERIOR) ---
hall_z = c_z + 3.2

# 1. Sàn đại điện lát đá cẩm thạch huyền bí (Marble Floor)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y, hall_z))
hall_floor = bpy.context.active_object
hall_floor.name = "Throne_Hall_Floor"
hall_floor.scale = (32.0, 36.0, 0.4)
smooth(hall_floor)
hall_floor.data.materials.append(mat_interior_marble)

# 2. Thảm đỏ hoàng gia trải dài từ cổng vòm đến chân ngai vàng (Royal Red Carpet)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y - 2.0, hall_z + 0.25))
carpet = bpy.context.active_object
carpet.name = "Royal_Red_Carpet"
carpet.scale = (5.5, 32.0, 0.1)
smooth(carpet)
carpet.data.materials.append(mat_royal_carpet)

# Đường viền chỉ vàng thảm đỏ
for side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x + side * 2.8, c_y - 2.0, hall_z + 0.28))
    gold_border = bpy.context.active_object
    gold_border.scale = (0.2, 32.0, 0.08)
    smooth(gold_border)
    gold_border.data.materials.append(mat_gold_trim)

# 3. Hai hàng cột đá cẩm thạch tráng lệ dọc theo đại sảnh (8 Colonnade Pillars)
for c_side in [-1, 1]:
    for col_i in range(4):
        col_y = c_y - 14.0 + col_i * 8.5
        col_x = c_x + c_side * 6.5
        
        # Thân cột đá
        bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=11.0, location=(col_x, col_y, hall_z + 5.5), vertices=24)
        pillar = bpy.context.active_object
        pillar.name = f"Throne_Pillar_{c_side}_{col_i}"
        smooth(pillar)
        pillar.data.materials.append(mat_castle_stone)
        
        # Đai vàng cổ ngữ trên cột
        bpy.ops.mesh.primitive_torus_add(major_radius=0.95, minor_radius=0.08, location=(col_x, col_y, hall_z + 8.5), major_segments=24, minor_segments=12)
        p_ring = bpy.context.active_object
        smooth(p_ring)
        p_ring.data.materials.append(mat_gold_trim)
        
        # Đuốc lửa ma thuật gắn trên cột chiếu sáng đại điện
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.25, location=(col_x - c_side * 0.8, col_y, hall_z + 6.0))
        torch = bpy.context.active_object
        smooth(torch)
        torch.data.materials.append(mat_candle_flame)
        
        bpy.ops.object.light_add(type='POINT', location=(col_x - c_side * 0.8, col_y, hall_z + 6.2))
        torch_lt = bpy.context.active_object
        torch_lt.data.energy = 40.0
        torch_lt.data.color = (1.0, 0.82, 0.45)

# 4. Bệ Ngai Vàng đa tầng uy nghiêm ở cuối đại điện (The Royal Dais)
dais_z = hall_z + 0.6
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 14.0, dais_z))
throne_dais = bpy.context.active_object
throne_dais.name = "Throne_Royal_Dais"
throne_dais.scale = (11.0, 7.0, 1.2)
smooth(throne_dais)
throne_dais.data.materials.append(mat_ruin_stone)

# 5. NGAI VÀNG ÁNH TRĂNG TSUKIEZZ (THE LUNAR THRONE)
throne_z = dais_z + 1.2
# Đệm ngồi nhung tím
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 15.0, throne_z))
t_seat = bpy.context.active_object
t_seat.name = "Throne_Seat"
t_seat.scale = (2.4, 2.0, 0.8)
smooth(t_seat)
t_seat.data.materials.append(mat_throne_velvet)

# Lưng ngai vàng cao vút mạ vàng với biểu tượng trăng lưỡi liềm
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(c_x, c_y + 15.8, throne_z + 2.2))
t_back = bpy.context.active_object
t_back.name = "Throne_Backrest"
t_back.scale = (2.2, 0.4, 3.8)
smooth(t_back)
t_back.data.materials.append(mat_gold_trim)

# Biểu tượng Vầng trăng phát sáng trên đỉnh ngai
bpy.ops.mesh.primitive_torus_add(major_radius=0.7, minor_radius=0.15, location=(c_x, c_y + 15.6, throne_z + 4.2), major_segments=24, minor_segments=12)
t_crest = bpy.context.active_object
t_crest.rotation_euler = (1.5708, 0, 0)
smooth(t_crest)
t_crest.data.materials.append(mat_cyan_crystal)

# Đèn chiếu sáng uy nghi trên ngai vàng
bpy.ops.object.light_add(type='POINT', location=(c_x, c_y + 14.5, throne_z + 4.0))
throne_light = bpy.context.active_object
throne_light.name = "Throne_Majestic_Light"
throne_light.data.energy = 160.0
throne_light.data.color = (1.0, 0.92, 0.70)

# 6. BÀN HỘI NGHỊ CHIẾN LƯỢC & NHIỆM VỤ (QUEST & WAR COUNCIL TABLE)
bpy.ops.mesh.primitive_cylinder_add(radius=2.2, depth=0.8, location=(c_x, c_y - 2.0, hall_z + 0.9), vertices=24)
q_table = bpy.context.active_object
q_table.name = "Quest_Council_Table"
smooth(q_table)
q_table.data.materials.append(mat_quest_table)

# Bản đồ cổ & Viên ngọc nhiệm vụ phát sáng trên bàn
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.45, location=(c_x, c_y - 2.0, hall_z + 1.6))
q_orb = bpy.context.active_object
q_orb.name = "Quest_Artifact_Orb"
smooth(q_orb)
q_orb.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y - 2.0, hall_z + 2.0))
q_light = bpy.context.active_object
q_light.data.energy = 60.0
q_light.data.color = (0.0, 0.95, 0.85)

# 7. Đèn chùm khổng lồ treo từ trần đại điện (Grand Hanging Chandelier)
bpy.ops.mesh.primitive_torus_add(major_radius=2.8, minor_radius=0.18, location=(c_x, c_y, hall_z + 10.0), major_segments=32, minor_segments=12)
chandelier = bpy.context.active_object
chandelier.name = "Grand_Hall_Chandelier"
smooth(chandelier)
chandelier.data.materials.append(mat_chandelier_iron)

# Nến trên đèn chùm
for ch_i in range(8):
    ch_ang = ch_i * (math.pi / 4.0)
    cx_pos = c_x + math.cos(ch_ang) * 2.8
    cy_pos = c_y + math.sin(ch_ang) * 2.8
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.4, location=(cx_pos, cy_pos, hall_z + 10.4), vertices=8)
    candle = bpy.context.active_object
    candle.data.materials.append(mat_candle_flame)

bpy.ops.object.light_add(type='POINT', location=(c_x, c_y, hall_z + 9.5))
ch_light = bpy.context.active_object
ch_light.data.energy = 180.0
ch_light.data.color = (1.0, 0.90, 0.65)

# 8. Cầu cạn vĩ đại bắc qua vực thẳm dẫn từ Đền Thờ lên thẳng Cổng Lâu Đài
bridge_s = (c_x, c_y - 21.0, hall_z - 0.2)
bridge_e = (-12.0, 8.0, 0.5)
b_len = math.sqrt((bridge_s[0] - bridge_e[0])**2 + (bridge_s[1] - bridge_e[1])**2)
b_mid = ((bridge_s[0] + bridge_e[0]) / 2, (bridge_s[1] + bridge_e[1]) / 2, (bridge_s[2] + bridge_e[2]) / 2)
b_ang = math.atan2(bridge_e[1] - bridge_s[1], bridge_e[0] - bridge_s[0])

bpy.ops.mesh.primitive_cube_add(size=1.0, location=b_mid)
bridge = bpy.context.active_object
bridge.name = "Castle_Grand_Viaduct"
bridge.scale = (b_len, 4.2, 1.4)
bridge.rotation_euler = (0, -0.22, b_ang)
smooth(bridge)
bridge.data.materials.append(mat_ruin_stone)

# Trụ cầu chống đỡ
for bp_i in range(4):
    ratio = 0.2 + bp_i * 0.22
    bpx = bridge_s[0] + (bridge_e[0] - bridge_s[0]) * ratio
    bpy_pos = bridge_s[1] + (bridge_e[1] - bridge_s[1]) * ratio
    bpz_top = bridge_s[2] + (bridge_e[2] - bridge_s[2]) * ratio
    
    bpy.ops.mesh.primitive_cylinder_add(radius=1.6, depth=bpz_top + 1.5, location=(bpx, bpy_pos, (bpz_top + 1.5) / 2), vertices=16)
    b_col = bpy.context.active_object
    smooth(b_col)
    b_col.data.materials.append(mat_castle_stone)

# -----------------------------------------------------------------------------
# 4. HỆ THỐNG HANG ĐỘNG NGUYỆT TINH (CRYSTAL CAVERN & QUEST CAVE)
# Nằm tại dãy núi đá Đông Nam, có cửa hang vòm đá, nhũ đá, măng đá, hồ ngầm và rương kho báu!
# -----------------------------------------------------------------------------
cave_x, cave_y, cave_z = 55.0, -45.0, 11.5

# 1. Cửa vòm đá tự nhiên hùng vĩ tại lối vào hang (Grand Natural Cave Arches)
bpy.ops.mesh.primitive_torus_add(major_radius=6.5, minor_radius=2.2, location=(cave_x, cave_y, cave_z + 4.5), major_segments=28, minor_segments=16)
cave_arch = bpy.context.active_object
cave_arch.name = "Cave_Entrance_Arch"
cave_arch.rotation_euler = (1.5708, 0, 0.785)
smooth(cave_arch)
cave_arch.data.materials.append(mat_cave_rock)

# Vòm đá phụ thứ 2 tạo thành đường hầm dẫn sâu vào lòng đất
bpy.ops.mesh.primitive_torus_add(major_radius=6.0, minor_radius=2.0, location=(cave_x + 4.0, cave_y - 4.0, cave_z + 4.8), major_segments=28, minor_segments=16)
cave_arch2 = bpy.context.active_object
cave_arch2.name = "Cave_Inner_Arch"
cave_arch2.rotation_euler = (1.5708, 0, 0.785)
smooth(cave_arch2)
cave_arch2.data.materials.append(mat_cave_rock)

# 2. Vách đá tự nhiên bao quanh lòng hang (Cavern Rocky Walls - North, East, South)
wall_points = [
    (cave_x + 2.0, cave_y - 14.0, (14.0, 3.5, 9.0), 0.2),
    (cave_x + 9.0, cave_y - 16.0, (12.0, 3.5, 9.5), -0.3),
    (cave_x + 15.0, cave_y - 12.0, (3.5, 14.0, 10.0), 0.5),
    (cave_x + 16.0, cave_y - 4.0, (3.5, 12.0, 9.5), -0.4),
    (cave_x + 11.0, cave_y + 2.0, (12.0, 3.5, 8.5), 0.1)
]
for w_i, (wx, wy, wscale, wrot) in enumerate(wall_points):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx, wy, cave_z + wscale[2] / 2))
    c_wall = bpy.context.active_object
    c_wall.name = f"Cavern_Wall_{w_i}"
    c_wall.scale = wscale
    c_wall.rotation_euler = (0, 0, wrot)
    smooth(c_wall)
    c_wall.data.materials.append(mat_cave_rock)

# Mái vòm trần hang che chở phía trên (Cavern Vaulted Ceiling)
bpy.ops.mesh.primitive_cylinder_add(radius=10.5, depth=3.0, location=(cave_x + 9.0, cave_y - 8.0, cave_z + 12.0), vertices=24)
cave_roof = bpy.context.active_object
cave_roof.name = "Cavern_Ceiling_Plate"
cave_roof.rotation_euler = (0.2, 0.1, 0.785)
smooth(cave_roof)
cave_roof.data.materials.append(mat_cave_rock)

# Ánh sáng huyền ảo bao trùm toàn bộ không gian hang động
bpy.ops.object.light_add(type='POINT', location=(cave_x + 8.0, cave_y - 8.0, cave_z + 8.0))
cavern_ambient = bpy.context.active_object
cavern_ambient.name = "Cavern_Ambient_Light"
cavern_ambient.data.energy = 650.0
cavern_ambient.data.color = (0.35, 0.85, 1.0)

# 3. Hồ nước ngầm phát quang trong hang (Underground Starlight Cave Pool)
bpy.ops.mesh.primitive_cylinder_add(radius=6.8, depth=0.4, location=(cave_x + 8.0, cave_y - 8.0, cave_z + 0.2), vertices=32)
cave_pool = bpy.context.active_object
cave_pool.name = "Cavern_Moon_Pool"
smooth(cave_pool)
cave_pool.data.materials.append(mat_starlight_pool)

# Viền đá ngọc quanh hồ nước ngầm
bpy.ops.mesh.primitive_torus_add(major_radius=6.8, minor_radius=0.45, location=(cave_x + 8.0, cave_y - 8.0, cave_z + 0.35), major_segments=32, minor_segments=12)
pool_edge = bpy.context.active_object
smooth(pool_edge)
pool_edge.data.materials.append(mat_ruin_stone)

# 4. Nhũ đá rủ từ trần hang (Stalactites)
stalactite_locs = [
    (cave_x + 5.0, cave_y - 5.0, cave_z + 11.0, 0.55, 4.5),
    (cave_x + 9.0, cave_y - 6.0, cave_z + 11.5, 0.65, 5.2),
    (cave_x + 6.0, cave_y - 11.0, cave_z + 11.0, 0.50, 4.0),
    (cave_x + 11.0, cave_y - 10.0, cave_z + 11.8, 0.75, 5.8),
    (cave_x + 3.0, cave_y - 4.0, cave_z + 8.5, 0.45, 3.5),
    (cave_x + 7.5, cave_y - 9.0, cave_z + 11.2, 0.60, 4.8)
]
for st_i, (sx, sy, sz, s_rad, s_len) in enumerate(stalactite_locs):
    bpy.ops.mesh.primitive_cone_add(radius1=s_rad, depth=s_len, location=(sx, sy, sz - s_len / 2), vertices=12)
    stalactite = bpy.context.active_object
    stalactite.name = f"Stalactite_{st_i}"
    stalactite.rotation_euler = (3.14159, 0, 0)
    smooth(stalactite)
    stalactite.data.materials.append(mat_cave_rock)

# 5. Măng đá mọc trồi lên từ nền hang (Stalagmites)
stalagmite_locs = [
    (cave_x + 3.5, cave_y - 3.5, cave_z + 0.5, 0.65, 3.8),
    (cave_x + 13.5, cave_y - 5.0, cave_z + 0.5, 0.75, 4.2),
    (cave_x + 3.0, cave_y - 12.0, cave_z + 0.5, 0.55, 3.2),
    (cave_x + 14.0, cave_y - 12.0, cave_z + 0.5, 0.70, 4.0)
]
for sm_i, (mx, my, mz, m_rad, m_len) in enumerate(stalagmite_locs):
    bpy.ops.mesh.primitive_cone_add(radius1=m_rad, depth=m_len, location=(mx, my, mz + m_len / 2), vertices=12)
    stalagmite = bpy.context.active_object
    stalagmite.name = f"Stalagmite_{sm_i}"
    smooth(stalagmite)
    stalagmite.data.materials.append(mat_cave_rock)

# 6. RƯƠNG BÁU NHIỆM VỤ THƯỢNG CỔ GIẤU KÍN TRONG HANG (ANCIENT QUEST CHEST)
chest_x, chest_y, chest_z = cave_x + 8.0, cave_y - 12.0, cave_z + 0.6
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(chest_x, chest_y, chest_z + 0.4))
chest_base = bpy.context.active_object
chest_base.name = "Quest_Chest_Base"
chest_base.scale = (2.2, 1.4, 1.0)
smooth(chest_base)
chest_base.data.materials.append(mat_chest_wood)

# Nắp rương hình bán trụ mạ vàng
bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=2.2, location=(chest_x, chest_y, chest_z + 0.9), vertices=20)
chest_lid = bpy.context.active_object
chest_lid.name = "Quest_Chest_Lid"
chest_lid.rotation_euler = (0, 1.5708, 0)
smooth(chest_lid)
chest_lid.data.materials.append(mat_chest_gold)

# Tia sáng hoàng kim nhiệm vụ tỏa ra từ rương báu
bpy.ops.object.light_add(type='POINT', location=(chest_x, chest_y, chest_z + 2.0))
chest_light = bpy.context.active_object
chest_light.data.energy = 220.0
chest_light.data.color = (1.0, 0.88, 0.35)

# Cụm tinh thể phát quang tím & xanh ngọc huyền ảo bên trong hang
for cg_i, (cgx, cgy, c_mat, c_col) in enumerate([
    (cave_x + 3.0, cave_y - 7.0, mat_purple_crystal, (0.65, 0.20, 0.95)),
    (cave_x + 13.0, cave_y - 8.0, mat_cyan_crystal, (0.1, 0.95, 0.85)),
    (cave_x + 8.0, cave_y - 14.5, mat_purple_crystal, (0.75, 0.25, 1.0))
]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=3.6, location=(cgx, cgy, cave_z + 1.8), vertices=6)
    c_gem = bpy.context.active_object
    c_gem.rotation_euler = (0.25, -0.3, 0.5 * cg_i)
    smooth(c_gem)
    c_gem.data.materials.append(c_mat)
    
    bpy.ops.object.light_add(type='POINT', location=(cgx, cgy, cave_z + 2.5))
    cg_lt = bpy.context.active_object
    cg_lt.data.energy = 140.0
    cg_lt.data.color = c_col

# -----------------------------------------------------------------------------
# 5. ĐẠI CỔ THỤ THẾ GIỚI SIÊU KHỔNG LỒ (THE COLOSSAL WORLD TREE - CAO 35 MÉT)
# -----------------------------------------------------------------------------
tree_x, tree_y, tree_z = 65.0, 25.0, 8.5

# Thân đại thụ cổ kính đường kính gần 10 mét
bpy.ops.mesh.primitive_cylinder_add(radius=4.8, depth=22.0, location=(tree_x, tree_y, tree_z + 11.0), vertices=32)
giant_trunk = bpy.context.active_object
giant_trunk.name = "World_Tree_Colossal_Trunk"
giant_trunk.scale = (1.0, 0.88, 1.0)
giant_trunk.rotation_euler = (0.08, -0.06, 0.35)
smooth(giant_trunk)
giant_trunk.data.materials.append(mat_giant_tree_bark)

# Bộ rễ đại thụ khổng lồ bò ngoằn ngoèo bám chặt vào vách đá
root_dirs = [
    (-7.5, -6.5, 0.5, 1.8, 15.0, (0.45, -0.5, 0.6)),
    (6.5, -7.0, 0.5, 1.6, 14.0, (-0.4, 0.5, -0.7)),
    (-8.0, 6.0, 0.5, 1.9, 16.0, (0.5, 0.4, 1.2)),
    (6.0, 7.5, 0.5, 1.5, 13.0, (-0.3, -0.4, -1.1)),
    (-10.5, 0.0, 0.2, 2.0, 18.0, (0.2, -0.6, 1.57)),
    (9.5, 1.0, 0.2, 1.7, 15.0, (-0.2, 0.5, -1.57))
]
for r_i, (rx_o, ry_o, rz_o, r_rad, r_len, r_rot) in enumerate(root_dirs):
    bpy.ops.mesh.primitive_cylinder_add(radius=r_rad, depth=r_len, location=(tree_x + rx_o, tree_y + ry_o, tree_z + rz_o), vertices=20)
    root = bpy.context.active_object
    root.rotation_euler = r_rot
    smooth(root)
    root.data.materials.append(mat_giant_tree_bark)

# Tán lá đại thụ phát quang rực rỡ cao tới 35 mét
canopy_list = [
    (tree_x, tree_y, tree_z + 32.0, 12.5, 12.0, 7.0),
    (tree_x - 12.0, tree_y - 6.0, tree_z + 27.0, 9.5, 9.0, 5.5),
    (tree_x + 12.5, tree_y - 5.0, tree_z + 26.5, 9.0, 9.0, 5.2),
    (tree_x - 8.0, tree_y + 12.0, tree_z + 28.5, 10.0, 9.5, 6.0),
    (tree_x + 10.5, tree_y + 11.0, tree_z + 27.5, 9.2, 8.8, 5.2)
]
for c_i, (cx, cy, cz, csx, csy, csz) in enumerate(canopy_list):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(cx, cy, cz), segments=32, ring_count=24)
    canopy = bpy.context.active_object
    canopy.scale = (csx, csy, csz)
    smooth(canopy)
    subsurf(canopy, 1)
    canopy.data.materials.append(mat_giant_tree_leaves)

# Dây leo ánh sao rủ xuống
for tend_i in range(10):
    t_ang = tend_i * (math.pi / 5.0)
    tx = tree_x + math.cos(t_ang) * 9.5
    ty = tree_y + math.sin(t_ang) * 9.5
    tz = tree_z + 18.0
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=12.0, location=(tx, ty, tz), vertices=12)
    tendril = bpy.context.active_object
    smooth(tendril)
    tendril.data.materials.append(mat_tree_tendrils)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.45, location=(tx, ty, tz - 6.0))
    tend_gem = bpy.context.active_object
    smooth(tend_gem)
    tend_gem.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(tree_x, tree_y, tree_z + 28.0))
tree_glow = bpy.context.active_object
tree_glow.data.energy = 550.0
tree_glow.data.color = (0.1, 0.95, 0.90)

# -----------------------------------------------------------------------------
# 6. THÁNH ĐỊA MẶT TRĂNG TRUNG TÂM (CENTRAL MOON SHRINE)
# -----------------------------------------------------------------------------
shrine_x, shrine_y, shrine_z = 0.0, 0.0, -0.2

bpy.ops.mesh.primitive_cylinder_add(radius=8.5, depth=0.45, location=(shrine_x, shrine_y, shrine_z + 0.2), vertices=48)
dais_1 = bpy.context.active_object
smooth(dais_1)
dais_1.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=6.2, depth=0.45, location=(shrine_x, shrine_y, shrine_z + 0.65), vertices=48)
dais_2 = bpy.context.active_object
smooth(dais_2)
dais_2.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=4.0, depth=0.35, location=(shrine_x, shrine_y, shrine_z + 1.05), vertices=36)
dais_3 = bpy.context.active_object
smooth(dais_3)
dais_3.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_torus_add(major_radius=3.9, minor_radius=0.10, location=(shrine_x, shrine_y, shrine_z + 1.25), major_segments=48, minor_segments=16)
gold_rune_ring = bpy.context.active_object
smooth(gold_rune_ring)
gold_rune_ring.data.materials.append(mat_rune_gold)

pillar_radius = 5.8
for p_idx in range(6):
    angle = p_idx * (math.pi / 3.0)
    px = shrine_x + math.cos(angle) * pillar_radius
    py = shrine_y + math.sin(angle) * pillar_radius
    pz = shrine_z + 0.7
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.35))
    base = bpy.context.active_object
    base.scale = (1.4, 1.4, 0.7)
    smooth(base)
    base.data.materials.append(mat_ruin_stone)
    
    p_height = 5.2 + (p_idx % 2) * 1.0
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.7 + p_height / 2))
    pillar = bpy.context.active_object
    pillar.scale = (0.85, 0.85, p_height)
    smooth(pillar)
    pillar.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px * 0.94, py * 0.94, pz + 0.7 + p_height / 2))
    rune_inset = bpy.context.active_object
    rune_inset.scale = (0.2, 0.08, p_height * 0.7)
    rune_inset.rotation_euler = (0, 0, angle + 1.57)
    smooth(rune_inset)
    rune_inset.data.materials.append(mat_cyan_crystal)

# Viên đá Mặt trăng bay lơ lửng
core_z = shrine_z + 3.2
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.4, location=(shrine_x, shrine_y, core_z))
moonstone = bpy.context.active_object
moonstone.scale = (0.85, 0.85, 1.7)
smooth(moonstone)
moonstone.data.materials.append(mat_cyan_crystal)

bpy.ops.mesh.primitive_torus_add(major_radius=2.0, minor_radius=0.08, location=(shrine_x, shrine_y, core_z), major_segments=32, minor_segments=16)
energy_ring = bpy.context.active_object
energy_ring.rotation_euler = (0.45, 0.35, 0)
smooth(energy_ring)
energy_ring.data.materials.append(mat_rune_gold)

bpy.ops.object.light_add(type='POINT', location=(shrine_x, shrine_y, core_z))
moonstone_light = bpy.context.active_object
moonstone_light.data.energy = 320.0
moonstone_light.data.color = (0.0, 0.98, 0.85)

# -----------------------------------------------------------------------------
# 7. CỔNG DỊCH CHUYỂN ÁNH TRĂNG (LUNAR RIFT PORTAL GATE)
# -----------------------------------------------------------------------------
portal_x, portal_y, portal_z = 8.0, 38.0, 1.0

for p_side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x + p_side * 4.5, portal_y, portal_z + 4.0))
    p_post = bpy.context.active_object
    p_post.scale = (1.6, 1.6, 8.0)
    smooth(p_post)
    p_post.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.9, location=(portal_x + p_side * 4.5, portal_y, portal_z + 8.5))
    p_gem = bpy.context.active_object
    smooth(p_gem)
    p_gem.data.materials.append(mat_purple_crystal)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x, portal_y, portal_z + 8.0))
p_arch = bpy.context.active_object
p_arch.scale = (10.5, 1.8, 1.5)
smooth(p_arch)
p_arch.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_plane_add(size=1.0, location=(portal_x, portal_y, portal_z + 4.0))
p_vortex = bpy.context.active_object
p_vortex.scale = (7.5, 7.5, 1.0)
p_vortex.rotation_euler = (1.5708, 0, 0)
smooth(p_vortex)
p_vortex.data.materials.append(mat_portal_vortex)

bpy.ops.object.light_add(type='POINT', location=(portal_x, portal_y - 0.5, portal_z + 4.5))
portal_light = bpy.context.active_object
portal_light.data.energy = 300.0
portal_light.data.color = (0.75, 0.25, 0.95)

# -----------------------------------------------------------------------------
# 8. RỪNG NẤM PHÁT QUANG VÀ CÁC MỎ TINH THỂ THẠCH ANH
# -----------------------------------------------------------------------------
mushrooms_expanded = [
    (-25.0, -15.0, 0.2, 1.6, "cyan"),
    (-32.0, -25.0, 0.5, 1.8, "purple"),
    (-18.0, -32.0, 0.1, 1.3, "cyan"),
    (-38.0, -8.0, 0.3, 1.5, "purple"),
    (-28.0, 10.0, 0.4, 1.7, "cyan"),
    (25.0, -22.0, 0.3, 1.5, "cyan"),
    (38.0, -32.0, 0.5, 1.8, "purple")
]
for m_idx, (mx, my, mz, sc, m_type) in enumerate(mushrooms_expanded):
    stem_h = 4.5 * sc
    cap_r = 2.8 * sc
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45 * sc, depth=stem_h, location=(mx, my, mz + stem_h / 2), vertices=24)
    m_stem = bpy.context.active_object
    smooth(m_stem)
    m_stem.data.materials.append(mat_shroom_stem)
    
    cap_mat = mat_shroom_cap_cyan if m_type == "cyan" else mat_shroom_cap_purple
    bpy.ops.mesh.primitive_uv_sphere_add(radius=cap_r, location=(mx, my, mz + stem_h), segments=32, ring_count=20)
    m_cap = bpy.context.active_object
    m_cap.scale = (1.0, 1.0, 0.65)
    smooth(m_cap)
    subsurf(m_cap, 1)
    m_cap.data.materials.append(cap_mat)
    
    bpy.ops.object.light_add(type='POINT', location=(mx, my, mz + stem_h - 0.4 * sc))
    m_light = bpy.context.active_object
    m_light.data.energy = 65.0 * sc
    m_light.data.color = (0.0, 0.95, 0.85) if m_type == "cyan" else (0.75, 0.20, 0.90)

# Cụm tinh thể thạch anh
crystal_fields = [
    (10.0, -5.0, 0.0),
    (16.0, 8.0, 0.0),
    (-12.0, 15.0, 0.0),
    (-8.0, -18.0, 0.0),
    (8.0, -18.0, 0.0),
    (-35.0, 25.0, 5.0),
    (30.0, -12.0, 1.5),
    (48.0, -35.0, 2.5)
]
for c_idx, (cx, cy, cz) in enumerate(crystal_fields):
    for s_idx in range(6):
        s_h = random.uniform(2.5, 5.5)
        s_r = random.uniform(0.35, 0.6)
        s_tilt_x = random.uniform(-0.30, 0.30)
        s_tilt_y = random.uniform(-0.30, 0.30)
        sx = cx + random.uniform(-0.8, 0.8)
        sy = cy + random.uniform(-0.8, 0.8)
        
        bpy.ops.mesh.primitive_cylinder_add(radius=s_r, depth=s_h, location=(sx, sy, cz + s_h / 2), vertices=6)
        spire = bpy.context.active_object
        spire.rotation_euler = (s_tilt_x, s_tilt_y, random.uniform(0, 3.14))
        smooth(spire)
        
        c_mat = mat_cyan_crystal if (c_idx + s_idx) % 2 == 0 else mat_purple_crystal
        spire.data.materials.append(c_mat)
        
        bpy.ops.mesh.primitive_cone_add(radius1=s_r, depth=s_r * 2.2, location=(sx, sy, cz + s_h), vertices=6)
        c_tip = bpy.context.active_object
        c_tip.rotation_euler = (s_tilt_x, s_tilt_y, random.uniform(0, 3.14))
        smooth(c_tip)
        c_tip.data.materials.append(c_mat)

# -----------------------------------------------------------------------------
# 9. VẦNG TRĂNG KHỔNG LỒ & BẦU TRỜI ĐẦY SAO (CELESTIAL MOON)
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_uv_sphere_add(radius=42.0, location=(0.0, 115.0, 48.0), segments=48, ring_count=32)
celestial_moon = bpy.context.active_object
celestial_moon.name = "Celestial_Gigantic_Moon"
smooth(celestial_moon)
celestial_moon.data.materials.append(mat_celestial_moon)

bpy.ops.mesh.primitive_torus_add(major_radius=45.0, minor_radius=1.8, location=(0.0, 115.0, 48.0), major_segments=48, minor_segments=16)
corona = bpy.context.active_object
corona.name = "Moon_Corona_Halo"
smooth(corona)
corona.data.materials.append(mat_cyan_crystal)

# Tinh tú lấp lánh
for star_idx in range(120):
    st_x = random.uniform(-110, 110)
    st_y = random.uniform(30, 130)
    st_z = random.uniform(15, 80)
    st_sz = random.uniform(0.25, 0.75)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=st_sz, location=(st_x, st_y, st_z), segments=8, ring_count=6)
    star = bpy.context.active_object
    smooth(star)
    star.data.materials.append(mat_rune_gold if star_idx % 3 == 0 else mat_celestial_moon)

# -----------------------------------------------------------------------------
# 10. HỆ THỐNG ÁNH SÁNG & GÓC MÁY QUANH CẢNH TOÀN NĂNG (CINEMATIC CAMERA)
# -----------------------------------------------------------------------------
bpy.ops.object.light_add(type='SUN', location=(25.0, 50.0, 65.0))
moon_sun = bpy.context.active_object
moon_sun.name = "Sun_Moonlight"
moon_sun.data.energy = 5.2
moon_sun.data.color = (0.75, 0.88, 1.0)
moon_sun.rotation_euler = (0.65, -0.35, 2.5)

bpy.ops.object.light_add(type='POINT', location=(0.0, 10.0, 35.0))
ambient_light = bpy.context.active_object
ambient_light.name = "Ambient_Sky_Light"
ambient_light.data.energy = 420.0
ambient_light.data.color = (0.45, 0.65, 0.85)

world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("Mystic_Moon_World")
    bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.02, 0.035, 0.07, 1.0)
    bg_node.inputs['Strength'].default_value = 1.0

# Camera toàn cảnh góc siêu rộng bao quát Lâu đài nội thất, Hang động, Đại Cổ Thụ và Đền Thần
bpy.ops.object.camera_add(location=(0.0, -68.0, 32.0))
cam = bpy.context.active_object
cam.name = "Grand_Kingdom_Camera"
cam.rotation_euler = (1.25, 0.0, 0.0)
cam.data.lens = 22 # Góc cực rộng 22mm bao trọn vương quốc 260m
bpy.context.scene.camera = cam

bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

# Camera Nội thất Đại Điện Ngai Vàng Lâu Đài (Walk-in Throne Hall View)
bpy.ops.object.camera_add(location=(c_x, c_y - 17.5, hall_z + 2.4))
cam_castle = bpy.context.active_object
cam_castle.name = "Throne_Hall_WalkIn_Camera"
cam_castle.rotation_euler = (math.radians(85.0), 0.0, 0.0)
cam_castle.data.lens = 24.0

# Camera Lòng Hang Động Nguyệt Tinh (Crystal Cavern Interior View)
bpy.ops.object.camera_add(location=(cave_x - 0.5, cave_y + 0.5, cave_z + 3.2))
cam_cave = bpy.context.active_object
cam_cave.name = "Crystal_Cavern_WalkIn_Camera"
cave_target = mathutils.Vector((cave_x + 8.0, cave_y - 8.0, cave_z + 2.0))
cam_cave.rotation_euler = (cave_target - cam_cave.location).to_track_quat('-Z', 'Y').to_euler()
cam_cave.data.lens = 22.0

# -----------------------------------------------------------------------------
# 11. XUẤT FILE BLEND, FBX VÀ RENDER ẢNH
# -----------------------------------------------------------------------------
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments"
os.makedirs(output_dir, exist_ok=True)

blend_path = os.path.join(output_dir, "MysticMoonMap.blend")
fbx_path = os.path.join(output_dir, "MysticMoonMap.fbx")
render_path = os.path.join(output_dir, "MysticMoonMap_Preview.png")
castle_render_path = os.path.join(output_dir, "MysticMoonMap_CastleInterior_Preview.png")
cave_render_path = os.path.join(output_dir, "MysticMoonMap_Cave_Preview.png")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)

# Render 1: Toàn cảnh vương quốc
bpy.context.scene.camera = cam
bpy.context.scene.render.filepath = render_path
try:
    bpy.ops.render.render(write_still=True)
    print(f"📸 ĐÃ RENDER TOÀN CẢNH BẢN ĐỒ: {render_path}")
except Exception as e:
    print(f"⚠️ Lỗi render toàn cảnh: {e}")

# Render 2: Cận cảnh nội thất Ngai Vàng Lâu Đài
bpy.context.scene.camera = cam_castle
bpy.context.scene.render.filepath = castle_render_path
try:
    bpy.ops.render.render(write_still=True)
    print(f"📸 ĐÃ RENDER NỘI THẤT LÂU ĐÀI: {castle_render_path}")
except Exception as e:
    print(f"⚠️ Lỗi render nội thất: {e}")

# Render 3: Cận cảnh lòng hang động Tinh Thể & Rương báu
bpy.context.scene.camera = cam_cave
bpy.context.scene.render.filepath = cave_render_path
try:
    bpy.ops.render.render(write_still=True)
    print(f"📸 ĐÃ RENDER LÒNG HANG ĐỘNG: {cave_render_path}")
except Exception as e:
    print(f"⚠️ Lỗi render hang động: {e}")

# Đặt camera mặc định về lại Toàn cảnh để khi mở Blender sẽ thấy toàn bộ map
bpy.context.scene.camera = cam
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Đồng bộ tự động sang thư mục cha và Desktop
import shutil
desktop_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\Blender"
os.makedirs(desktop_dir, exist_ok=True)
root_art_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender"

sync_files = [
    ("MysticMoonMap.blend", blend_path),
    ("MysticMoonMap.fbx", fbx_path),
    ("MysticMoonMap_Preview.png", render_path),
    ("MysticMoonMap_CastleInterior_Preview.png", castle_render_path),
    ("MysticMoonMap_Cave_Preview.png", cave_render_path)
]

for fname, src in sync_files:
    shutil.copy2(src, os.path.join(root_art_dir, fname))
    shutil.copy2(src, os.path.join(desktop_dir, fname))

shutil.copy2(blend_path, r"c:\Users\Admin\OneDrive\Máy tính\Desktop\MysticMoonMap_3D.blend")

print(f"✅ HOÀN TẤT VÀ LƯU THÀNH CÔNG VÀO BLENDER:")
print(f"  - Blend: {blend_path}")
print(f"  - FBX: {fbx_path}")
print(f"  - Preview Toàn cảnh: {render_path}")
print(f"  - Preview Nội thất Lâu đài: {castle_render_path}")
print(f"  - Preview Hang động: {cave_render_path}")
print(f"  - Đã sao chép sang Desktop: {desktop_dir}")
