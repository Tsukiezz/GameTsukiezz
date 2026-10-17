import bpy
import math
import random
import os

print("=== BẮT ĐẦU MỞ RỘNG BẢN ĐỒ MẶT TRĂNG: THÊM LÂU ĐÀI HOÀNG GIA & ĐẠI CỔ THỤ THẦN THOẠI ===")

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
mat_castle_roof = create_mat("Mat_Castle_Roof", (0.15, 0.12, 0.30, 1.0), roughness=0.35, metallic=0.25)
mat_ruin_stone = create_mat("Mat_Ruin_Stone", (0.20, 0.24, 0.34, 1.0), roughness=0.72, metallic=0.15)

# Cổ ngữ & Tinh thể phát quang
mat_rune_gold = create_mat("Mat_Rune_Gold", (1.0, 0.85, 0.25, 1.0), roughness=0.2, metallic=0.85, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=5.5)
mat_cyan_crystal = create_mat("Mat_Cyan_Crystal", (0.05, 0.95, 0.85, 1.0), roughness=0.12, metallic=0.15, emissive=(0.0, 0.98, 0.85, 1.0), emit_strength=6.0)
mat_purple_crystal = create_mat("Mat_Purple_Crystal", (0.55, 0.15, 0.88, 1.0), roughness=0.15, metallic=0.15, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=5.5)
mat_portal_vortex = create_mat("Mat_Portal_Vortex", (0.25, 0.08, 0.45, 1.0), roughness=0.1, emissive=(0.55, 0.18, 0.90, 1.0), emit_strength=7.0)
mat_starlight_pool = create_mat("Mat_Starlight_Pool", (0.02, 0.40, 0.50, 1.0), roughness=0.04, metallic=0.1, emissive=(0.0, 0.70, 0.65, 1.0), emit_strength=2.5)

# Cửa sổ lâu đài phát sáng (Castle Windows)
mat_window_gold = create_mat("Mat_Window_Gold", (1.0, 0.9, 0.4, 1.0), roughness=0.2, emissive=(1.0, 0.85, 0.35, 1.0), emit_strength=8.0)
mat_window_cyan = create_mat("Mat_Window_Cyan", (0.3, 0.95, 1.0, 1.0), roughness=0.2, emissive=(0.2, 0.95, 1.0, 1.0), emit_strength=7.5)

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
# 2. ĐỊA HÌNH MẶT TRĂNG MỞ RỘNG (EXPANDED 120x120m LUNAR TERRAIN)
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=96, y_subdivisions=96, size=130, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "Terrain_Expanded_Lunar_Realm"

mesh = terrain.data
random.seed(55)
for v in mesh.vertices:
    x, y = v.co.x, v.co.y
    dist_center = math.sqrt(x*x + y*y)
    
    # 1. Thung lũng trung tâm chứa Đền Thánh
    z_center = -0.8 * math.exp(- (dist_center / 16.0)**2)
    
    # 2. Cao nguyên vách núi Tây Bắc nâng cao để xây Lâu Đài (Castle Plateau)
    dist_castle = math.sqrt((x + 26)**2 + (y - 30)**2)
    z_castle_plateau = 8.5 * math.exp(- (dist_castle / 24.0)**2)
    
    # 3. Gò đồi phía Đông nâng đỡ gốc Đại Cổ Thụ (World Tree Hill)
    dist_tree = math.sqrt((x - 28)**2 + (y + 5)**2)
    z_tree_hill = 4.2 * math.exp(- (dist_tree / 20.0)**2)
    
    # 4. Các dãy núi viền xung quanh bản đồ
    rim_mountains = 3.5 * math.sin(x * 0.08) * math.cos(y * 0.08)
    
    # 5. Các miệng hố va chạm va quẹt tự nhiên
    crater1 = -2.2 * math.exp(- (((x - 18)**2 + (y - 20)**2) / 25.0))
    crater2 = -2.5 * math.exp(- (((x + 25)**2 + (y + 22)**2) / 30.0))
    crater3 = -1.8 * math.exp(- (((x - 8)**2 + (y + 35)**2) / 28.0))
    
    noise = (random.random() - 0.5) * 0.35
    v.co.z = z_center + z_castle_plateau + z_tree_hill + rim_mountains + crater1 + crater2 + crater3 + noise

smooth(terrain)
subsurf(terrain, 1)
terrain.data.materials.append(mat_moon_rock)

# Con đường đá cổ lát dẫn vào đền thờ và vươn tới lâu đài
for path_i in range(16):
    py = -28.0 + path_i * 1.8
    px = math.sin(path_i * 0.25) * 0.6
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, -0.15))
    tile = bpy.context.active_object
    tile.name = f"Path_Main_{path_i}"
    tile.scale = (2.4, 1.4, 0.2)
    smooth(tile)
    tile.data.materials.append(mat_path_stone)

# Trụ đèn đá thắp sáng ánh trăng hai bên đường
for l_idx, (lx, ly) in enumerate([(-2.2, -24.0), (2.2, -24.0), (-2.4, -16.0), (2.4, -16.0), (-2.5, -8.0), (2.5, -8.0)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=2.0, location=(lx, ly, 0.8), vertices=12)
    post = bpy.context.active_object
    post.name = f"Lantern_Post_{l_idx}"
    smooth(post)
    post.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.28, location=(lx, ly, 1.9))
    lamp = bpy.context.active_object
    lamp.name = f"Lantern_Gem_{l_idx}"
    smooth(lamp)
    lamp.data.materials.append(mat_cyan_crystal)
    
    bpy.ops.object.light_add(type='POINT', location=(lx, ly, 1.9))
    lamp_lt = bpy.context.active_object
    lamp_lt.name = f"Light_Lantern_{l_idx}"
    lamp_lt.data.energy = 30.0
    lamp_lt.data.color = (0.0, 0.95, 0.85)

# Hồ tinh thể ánh trăng (Starlight Crater Pool)
bpy.ops.mesh.primitive_cylinder_add(radius=7.5, depth=0.4, location=(18, 16, -0.6), vertices=32)
pool = bpy.context.active_object
pool.name = "Starlight_Pool"
smooth(pool)
pool.data.materials.append(mat_starlight_pool)

bpy.ops.mesh.primitive_torus_add(major_radius=7.5, minor_radius=0.5, location=(18, 16, -0.4), major_segments=32, minor_segments=16)
pool_rim = bpy.context.active_object
pool_rim.name = "Pool_Rim_Rocks"
smooth(pool_rim)
pool_rim.data.materials.append(mat_moon_rock)

# -----------------------------------------------------------------------------
# 3. LÂU ĐÀI ÁNH TRĂNG HOÀNG GIA (THE GRAND LUNAR CASTLE OF TSUKIEZZ)
# Tọa lạc kiêu hãnh trên cao nguyên vách đá Tây Bắc
# -----------------------------------------------------------------------------
castle_cx, castle_cy, castle_cz = -26.0, 30.0, 8.5

# Bệ đá móng thành lũy (Castle Foundation Dais)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(castle_cx, castle_cy, castle_cz + 1.0))
castle_base = bpy.context.active_object
castle_base.name = "Castle_Foundation_Base"
castle_base.scale = (24.0, 22.0, 2.5)
smooth(castle_base)
castle_base.data.materials.append(mat_castle_stone)

# Tòa tháp trung tâm chính điện (Main Royal Keep)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(castle_cx, castle_cy + 2.0, castle_cz + 9.5))
keep_body = bpy.context.active_object
keep_body.name = "Castle_Main_Keep"
keep_body.scale = (10.0, 9.0, 15.0)
smooth(keep_body)
keep_body.data.materials.append(mat_castle_stone)

# Mái chóp chính điện hình kim tự tháp Gothic
bpy.ops.mesh.primitive_cone_add(radius1=7.0, depth=8.0, location=(castle_cx, castle_cy + 2.0, castle_cz + 21.0), vertices=4)
keep_roof = bpy.context.active_object
keep_roof.name = "Castle_Main_Roof"
keep_roof.rotation_euler = (0, 0, 0.785)
smooth(keep_roof)
keep_roof.data.materials.append(mat_castle_roof)

# Chóp tháp vương miện ánh trăng (Crown Spire)
bpy.ops.mesh.primitive_cone_add(radius1=1.2, depth=4.5, location=(castle_cx, castle_cy + 2.0, castle_cz + 27.0), vertices=8)
keep_spire = bpy.context.active_object
keep_spire.name = "Castle_Crown_Spire"
smooth(keep_spire)
keep_spire.data.materials.append(mat_rune_gold)

# Viên ngọc Nguyệt Tinh trên đỉnh tháp cao nhất
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.9, location=(castle_cx, castle_cy + 2.0, castle_cz + 29.5))
keep_gem = bpy.context.active_object
keep_gem.name = "Castle_Peak_Gem"
smooth(keep_gem)
keep_gem.data.materials.append(mat_cyan_crystal)

bpy.ops.object.light_add(type='POINT', location=(castle_cx, castle_cy + 2.0, castle_cz + 30.0))
keep_light = bpy.context.active_object
keep_light.name = "Light_Castle_Peak"
keep_light.data.energy = 160.0
keep_light.data.color = (0.0, 0.98, 0.85)

# 4 Tháp góc thành lũy (4 Corner Spire Towers)
corner_towers = [
    (castle_cx - 10.0, castle_cy - 8.0),
    (castle_cx + 10.0, castle_cy - 8.0),
    (castle_cx - 10.0, castle_cy + 9.0),
    (castle_cx + 10.0, castle_cy + 9.0)
]
for t_idx, (tx, ty) in enumerate(corner_towers):
    # Thân tháp tròn
    t_h = 16.0
    bpy.ops.mesh.primitive_cylinder_add(radius=2.6, depth=t_h, location=(tx, ty, castle_cz + t_h / 2 + 1.0), vertices=24)
    tower = bpy.context.active_object
    tower.name = f"Castle_Corner_Tower_{t_idx}"
    smooth(tower)
    tower.data.materials.append(mat_castle_stone)
    
    # Vành ban công tháp (Tower Battlement Balcony)
    bpy.ops.mesh.primitive_cylinder_add(radius=3.1, depth=0.8, location=(tx, ty, castle_cz + t_h + 1.0), vertices=24)
    balcony = bpy.context.active_object
    balcony.name = f"Tower_Balcony_{t_idx}"
    smooth(balcony)
    balcony.data.materials.append(mat_ruin_stone)
    
    # Mái chóp tháp nhọn Gothic màu tím thẫm (Conical Spire Roof)
    bpy.ops.mesh.primitive_cone_add(radius1=3.0, depth=6.5, location=(tx, ty, castle_cz + t_h + 4.5), vertices=24)
    roof = bpy.context.active_object
    roof.name = f"Tower_Roof_{t_idx}"
    smooth(roof)
    roof.data.materials.append(mat_castle_roof)
    
    # Đỉnh tháp mạ vàng & ngọc phát sáng
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.45, location=(tx, ty, castle_cz + t_h + 8.0))
    gem = bpy.context.active_object
    gem.name = f"Tower_Gem_{t_idx}"
    smooth(gem)
    gem.data.materials.append(mat_cyan_crystal if t_idx % 2 == 0 else mat_purple_crystal)

# Tường thành bao quanh (Castle Curtain Walls with Crenellations)
wall_data = [
    (castle_cx, castle_cy - 8.0, 18.0, 1.8, 8.0, 0),         # Mặt trước
    (castle_cx, castle_cy + 9.0, 18.0, 1.8, 8.0, 0),         # Mặt sau
    (castle_cx - 10.0, castle_cy + 0.5, 1.8, 16.0, 8.0, 0),   # Tường trái
    (castle_cx + 10.0, castle_cy + 0.5, 1.8, 16.0, 8.0, 0)    # Tường phải
]
for w_idx, (wx, wy, wsx, wsy, wsz, wrot) in enumerate(wall_data):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx, wy, castle_cz + wsz / 2 + 1.0))
    wall = bpy.context.active_object
    wall.name = f"Castle_Wall_{w_idx}"
    wall.scale = (wsx, wsy, wsz)
    smooth(wall)
    wall.data.materials.append(mat_castle_stone)

# Cổng vòm Lâu đài (Castle Grand Arched Gate)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(castle_cx, castle_cy - 8.5, castle_cz + 3.8))
c_gate = bpy.context.active_object
c_gate.name = "Castle_Gatehouse"
c_gate.scale = (5.5, 2.5, 7.0)
smooth(c_gate)
c_gate.data.materials.append(mat_ruin_stone)

# Cánh cổng ánh sáng vàng
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(castle_cx, castle_cy - 9.0, castle_cz + 2.8))
gate_door = bpy.context.active_object
gate_door.name = "Castle_Gate_Door"
gate_door.scale = (3.2, 0.4, 4.8)
smooth(gate_door)
gate_door.data.materials.append(mat_rune_gold)

# Cầu đá vòm bắc qua thung lũng dẫn từ trung tâm lên cổng lâu đài (Grand Viaduct Bridge)
bridge_start = (castle_cx, castle_cy - 9.5, castle_cz + 1.0)
bridge_end = (-8.0, 5.0, 0.5)
bridge_len = math.sqrt((bridge_start[0] - bridge_end[0])**2 + (bridge_start[1] - bridge_end[1])**2)
bridge_mid = ((bridge_start[0] + bridge_end[0]) / 2, (bridge_start[1] + bridge_end[1]) / 2, (bridge_start[2] + bridge_end[2]) / 2)
bridge_angle = math.atan2(bridge_end[1] - bridge_start[1], bridge_end[0] - bridge_start[0])

bpy.ops.mesh.primitive_cube_add(size=1.0, location=bridge_mid)
bridge = bpy.context.active_object
bridge.name = "Castle_Grand_Viaduct"
bridge.scale = (bridge_len, 3.2, 1.2)
bridge.rotation_euler = (0, -0.18, bridge_angle)
smooth(bridge)
bridge.data.materials.append(mat_ruin_stone)

# Các trụ cầu vòm chống đỡ cây cầu đá
for b_pillar_i in range(3):
    t_ratio = 0.25 + b_pillar_i * 0.25
    bpx = bridge_start[0] + (bridge_end[0] - bridge_start[0]) * t_ratio
    bpy_pos = bridge_start[1] + (bridge_end[1] - bridge_start[1]) * t_ratio
    bpz_top = bridge_start[2] + (bridge_end[2] - bridge_start[2]) * t_ratio
    
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=bpz_top + 1.0, location=(bpx, bpy_pos, (bpz_top + 1.0) / 2), vertices=16)
    b_col = bpy.context.active_object
    b_col.name = f"Bridge_Pillar_{b_pillar_i}"
    smooth(b_col)
    b_col.data.materials.append(mat_castle_stone)

# Cửa sổ phát sáng lung linh khắp lâu đài (Emissive Castle Windows)
window_positions = [
    (castle_cx - 2.5, castle_cy - 3.0, castle_cz + 10.0),
    (castle_cx + 2.5, castle_cy - 3.0, castle_cz + 10.0),
    (castle_cx - 2.5, castle_cy - 3.0, castle_cz + 15.0),
    (castle_cx + 2.5, castle_cy - 3.0, castle_cz + 15.0),
    (castle_cx, castle_cy - 3.0, castle_cz + 18.0)
]
for win_i, (wx, wy, wz) in enumerate(window_positions):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx, wy, wz))
    win = bpy.context.active_object
    win.name = f"Castle_Window_{win_i}"
    win.scale = (0.8, 0.2, 1.8)
    smooth(win)
    win.data.materials.append(mat_window_gold if win_i % 2 == 0 else mat_window_cyan)

# -----------------------------------------------------------------------------
# 4. ĐẠI CỔ THỤ ÁNH TRĂNG THẦN THOẠI (THE COLOSSAL WORLD MOON TREE)
# Tọa lạc hùng tráng tại cánh đồi phía Đông
# -----------------------------------------------------------------------------
tree_cx, tree_cy, tree_cz = 28.0, 2.0, 4.0

# Gốc cây đại thụ khổng lồ thân xoắn vặn (Colossal Trunk)
bpy.ops.mesh.primitive_cylinder_add(radius=3.8, depth=18.0, location=(tree_cx, tree_cy, tree_cz + 9.0), vertices=32)
giant_trunk = bpy.context.active_object
giant_trunk.name = "World_Tree_Main_Trunk"
giant_trunk.scale = (1.0, 0.88, 1.0)
giant_trunk.rotation_euler = (0.08, -0.06, 0.35)
smooth(giant_trunk)
giant_trunk.data.materials.append(mat_giant_tree_bark)

# Bộ rễ đại thụ khổng lồ bò ngoằn ngoèo bám chặt vào vách đá (Gnarled Ancient Roots)
root_directions = [
    (-5.5, -4.5, 0.5, 1.4, 12.0, (0.45, -0.5, 0.6)),
    (5.0, -5.0, 0.5, 1.3, 11.0, (-0.4, 0.5, -0.7)),
    (-6.0, 4.0, 0.5, 1.5, 13.0, (0.5, 0.4, 1.2)),
    (4.5, 5.5, 0.5, 1.2, 10.0, (-0.3, -0.4, -1.1)),
    (-8.5, 0.0, 0.2, 1.6, 14.0, (0.2, -0.6, 1.57)),
    (7.5, 1.0, 0.2, 1.4, 12.0, (-0.2, 0.5, -1.57))
]
for r_idx, (rx_off, ry_off, rz_off, r_rad, r_len, r_rot) in enumerate(root_directions):
    bpy.ops.mesh.primitive_cylinder_add(radius=r_rad, depth=r_len, location=(tree_cx + rx_off, tree_cy + ry_off, tree_cz + rz_off), vertices=20)
    root = bpy.context.active_object
    root.name = f"World_Tree_Root_{r_idx}"
    root.rotation_euler = r_rot
    smooth(root)
    root.data.materials.append(mat_giant_tree_bark)

# Các cành đại thụ vươn dài che chở cả thung lũng (Sprawling Giant Limbs)
limb_directions = [
    (-7.5, -3.5, 16.5, 1.8, 14.0, (0.45, -0.65, 0.8)),
    (8.0, -2.5, 16.0, 1.7, 13.0, (-0.4, 0.6, -0.7)),
    (-4.0, 8.0, 17.5, 1.9, 15.0, (0.6, 0.35, 1.3)),
    (6.5, 6.5, 16.8, 1.6, 12.5, (-0.35, -0.5, -1.0)),
    (0.0, 0.0, 21.0, 2.2, 10.0, (0.1, 0.1, 0.0))
]
for l_idx, (lx_off, ly_off, lz_off, l_rad, l_len, l_rot) in enumerate(limb_directions):
    bpy.ops.mesh.primitive_cylinder_add(radius=l_rad, depth=l_len, location=(tree_cx + lx_off, tree_cy + ly_off, tree_cz + lz_off), vertices=20)
    limb = bpy.context.active_object
    limb.name = f"World_Tree_Limb_{l_idx}"
    limb.rotation_euler = l_rot
    smooth(limb)
    limb.data.materials.append(mat_giant_tree_bark)

# Tán lá đại thụ phát quang rực rỡ như mây ngũ sắc (Colossal Luminescent Canopy Clouds)
canopy_clouds = [
    (tree_cx, tree_cy, tree_cz + 26.0, 9.5, 9.0, 5.5),
    (tree_cx - 10.0, tree_cy - 5.0, tree_cz + 22.0, 7.5, 7.0, 4.5),
    (tree_cx + 10.5, tree_cy - 4.0, tree_cz + 21.5, 7.0, 7.0, 4.2),
    (tree_cx - 6.0, tree_cy + 10.0, tree_cz + 23.5, 8.0, 7.5, 4.8),
    (tree_cx + 8.5, tree_cy + 9.0, tree_cz + 22.5, 7.2, 6.8, 4.2)
]
for c_idx, (cx, cy, cz, csx, csy, csz) in enumerate(canopy_clouds):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(cx, cy, cz), segments=32, ring_count=24)
    canopy = bpy.context.active_object
    canopy.name = f"World_Tree_Canopy_{c_idx}"
    canopy.scale = (csx, csy, csz)
    smooth(canopy)
    subsurf(canopy, 1)
    canopy.data.materials.append(mat_giant_tree_leaves)

# Dây leo ánh sao rủ xuống từ tán cây (Hanging Starlight Tendrils)
for tend_i in range(8):
    t_ang = tend_i * (math.pi / 4.0)
    tx = tree_cx + math.cos(t_ang) * 7.5
    ty = tree_cy + math.sin(t_ang) * 7.5
    tz = tree_cz + 15.0
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=9.0, location=(tx, ty, tz), vertices=12)
    tendril = bpy.context.active_object
    tendril.name = f"Tree_Tendril_{tend_i}"
    smooth(tendril)
    tendril.data.materials.append(mat_tree_tendrils)
    
    # Hạt ngọc ánh sao ở đuôi dây leo
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.35, location=(tx, ty, tz - 4.5))
    tend_gem = bpy.context.active_object
    smooth(tend_gem)
    tend_gem.data.materials.append(mat_cyan_crystal)

# Đèn hào quang tỏa sáng từ tán cây cổ thụ
bpy.ops.object.light_add(type='POINT', location=(tree_cx, tree_cy, tree_cz + 22.0))
tree_glow = bpy.context.active_object
tree_glow.name = "Light_World_Tree_Glow"
tree_glow.data.energy = 450.0
tree_glow.data.color = (0.1, 0.95, 0.90)

# -----------------------------------------------------------------------------
# 5. THÁNH ĐỊA MẶT TRĂNG TRUNG TÂM (THE CENTRAL MOON SHRINE)
# -----------------------------------------------------------------------------
shrine_x, shrine_y, shrine_z = 0.0, 0.0, -0.2

bpy.ops.mesh.primitive_cylinder_add(radius=7.5, depth=0.4, location=(shrine_x, shrine_y, shrine_z + 0.2), vertices=48)
dais_1 = bpy.context.active_object
dais_1.name = "Shrine_Dais_Tier1"
smooth(dais_1)
dais_1.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=5.5, depth=0.4, location=(shrine_x, shrine_y, shrine_z + 0.6), vertices=48)
dais_2 = bpy.context.active_object
dais_2.name = "Shrine_Dais_Tier2"
smooth(dais_2)
dais_2.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_cylinder_add(radius=3.5, depth=0.3, location=(shrine_x, shrine_y, shrine_z + 0.95), vertices=36)
dais_3 = bpy.context.active_object
dais_3.name = "Shrine_Dais_Tier3"
smooth(dais_3)
dais_3.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_torus_add(major_radius=3.4, minor_radius=0.09, location=(shrine_x, shrine_y, shrine_z + 1.12), major_segments=48, minor_segments=16)
gold_rune_ring = bpy.context.active_object
gold_rune_ring.name = "Shrine_Rune_Ring"
smooth(gold_rune_ring)
gold_rune_ring.data.materials.append(mat_rune_gold)

pillar_radius = 5.2
for p_idx in range(6):
    angle = p_idx * (math.pi / 3.0)
    px = shrine_x + math.cos(angle) * pillar_radius
    py = shrine_y + math.sin(angle) * pillar_radius
    pz = shrine_z + 0.6
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.3))
    base = bpy.context.active_object
    base.scale = (1.2, 1.2, 0.6)
    smooth(base)
    base.data.materials.append(mat_ruin_stone)
    
    pillar_height = 4.8 + (p_idx % 2) * 0.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.6 + pillar_height / 2))
    pillar = bpy.context.active_object
    pillar.scale = (0.75, 0.75, pillar_height)
    smooth(pillar)
    pillar.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px * 0.94, py * 0.94, pz + 0.6 + pillar_height / 2))
    rune_inset = bpy.context.active_object
    rune_inset.scale = (0.18, 0.08, pillar_height * 0.7)
    rune_inset.rotation_euler = (0, 0, angle + 1.57)
    smooth(rune_inset)
    rune_inset.data.materials.append(mat_cyan_crystal)

# Viên đá Mặt trăng bay lơ lửng
core_z = shrine_z + 2.8
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.25, location=(shrine_x, shrine_y, core_z))
moonstone = bpy.context.active_object
moonstone.name = "Floating_Moonstone_Core"
moonstone.scale = (0.85, 0.85, 1.6)
smooth(moonstone)
moonstone.data.materials.append(mat_cyan_crystal)

bpy.ops.mesh.primitive_torus_add(major_radius=1.8, minor_radius=0.07, location=(shrine_x, shrine_y, core_z), major_segments=32, minor_segments=16)
energy_ring = bpy.context.active_object
energy_ring.rotation_euler = (0.45, 0.35, 0)
smooth(energy_ring)
energy_ring.data.materials.append(mat_rune_gold)

bpy.ops.object.light_add(type='POINT', location=(shrine_x, shrine_y, core_z))
moonstone_light = bpy.context.active_object
moonstone_light.data.energy = 260.0
moonstone_light.data.color = (0.0, 0.98, 0.85)

# -----------------------------------------------------------------------------
# 6. CỔNG DỊCH CHUYỂN ÁNH TRĂNG (LUNAR RIFT PORTAL GATE)
# Tọa lạc ở thung lũng phía Bắc
# -----------------------------------------------------------------------------
portal_x, portal_y, portal_z = 3.0, 24.0, 0.5

for p_side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x + p_side * 3.8, portal_y, portal_z + 3.2))
    p_post = bpy.context.active_object
    p_post.scale = (1.4, 1.4, 6.4)
    smooth(p_post)
    p_post.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.7, location=(portal_x + p_side * 3.8, portal_y, portal_z + 6.8))
    p_gem = bpy.context.active_object
    p_gem.scale = (0.7, 0.7, 1.2)
    smooth(p_gem)
    p_gem.data.materials.append(mat_purple_crystal)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x, portal_y, portal_z + 6.5))
p_arch = bpy.context.active_object
p_arch.scale = (9.0, 1.6, 1.2)
smooth(p_arch)
p_arch.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_plane_add(size=1.0, location=(portal_x, portal_y, portal_z + 3.2))
p_vortex = bpy.context.active_object
p_vortex.scale = (6.0, 6.0, 1.0)
p_vortex.rotation_euler = (1.5708, 0, 0)
smooth(p_vortex)
p_vortex.data.materials.append(mat_portal_vortex)

bpy.ops.object.light_add(type='POINT', location=(portal_x, portal_y - 0.5, portal_z + 3.5))
portal_light = bpy.context.active_object
portal_light.data.energy = 260.0
portal_light.data.color = (0.75, 0.25, 0.95)

# -----------------------------------------------------------------------------
# 7. KHU RỪNG NẤM PHÁT QUANG & TINH THỂ NGUYỆT THẠCH
# -----------------------------------------------------------------------------
# Rừng nấm khổng lồ
giant_mushrooms = [
    (-14.0, -10.0, 0.2, 1.4, "cyan"),
    (-18.0, -15.0, 0.5, 1.6, "purple"),
    (-10.5, -18.5, 0.1, 1.1, "cyan"),
    (-22.0, -6.0, 0.3, 1.3, "purple"),
    (-16.0, 6.0, 0.4, 1.5, "cyan"),
    (14.0, -15.0, 0.3, 1.4, "cyan")
]
for m_idx, (mx, my, mz, sc, m_type) in enumerate(giant_mushrooms):
    stem_h = 4.0 * sc
    cap_r = 2.5 * sc
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.4 * sc, depth=stem_h, location=(mx, my, mz + stem_h / 2), vertices=24)
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
    
    for d_i in range(8):
        ang = d_i * (math.pi / 4.0) + random.uniform(-0.1, 0.1)
        dist = cap_r * random.uniform(0.4, 0.8)
        dx = mx + math.cos(ang) * dist
        dy = my + math.sin(ang) * dist
        dz = mz + stem_h + math.sqrt(max(0.1, cap_r**2 - dist**2)) * 0.65
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18 * sc, location=(dx, dy, dz), segments=12, ring_count=8)
        dot = bpy.context.active_object
        smooth(dot)
        dot.data.materials.append(mat_shroom_dots)
        
    bpy.ops.object.light_add(type='POINT', location=(mx, my, mz + stem_h - 0.4 * sc))
    m_light = bpy.context.active_object
    m_light.data.energy = 55.0 * sc
    m_light.data.color = (0.0, 0.95, 0.85) if m_type == "cyan" else (0.75, 0.20, 0.90)

# Cụm tinh thể thạch anh
crystal_clusters = [
    (8.0, -3.5, 0.0),
    (12.0, 5.0, 0.0),
    (-8.0, 10.0, 0.0),
    (-6.0, -12.0, 0.0),
    (6.0, -12.0, 0.0),
    (-22.0, 14.0, 3.0),
    (20.0, -8.0, 1.0)
]
for c_idx, (cx, cy, cz) in enumerate(crystal_clusters):
    for s_idx in range(5):
        s_h = random.uniform(2.2, 4.5)
        s_r = random.uniform(0.3, 0.5)
        s_tilt_x = random.uniform(-0.30, 0.30)
        s_tilt_y = random.uniform(-0.30, 0.30)
        sx = cx + random.uniform(-0.6, 0.6)
        sy = cy + random.uniform(-0.6, 0.6)
        
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
# 8. VẦNG TRĂNG KHỔNG LỒ & BẦU TRỜI ĐẦY SAO (CELESTIAL HORIZON MOON)
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_uv_sphere_add(radius=28.0, location=(0.0, 65.0, 30.0), segments=48, ring_count=32)
celestial_moon = bpy.context.active_object
celestial_moon.name = "Celestial_Gigantic_Moon"
smooth(celestial_moon)
celestial_moon.data.materials.append(mat_celestial_moon)

bpy.ops.mesh.primitive_torus_add(major_radius=30.0, minor_radius=1.2, location=(0.0, 65.0, 30.0), major_segments=48, minor_segments=16)
corona = bpy.context.active_object
corona.name = "Moon_Corona_Halo"
smooth(corona)
corona.data.materials.append(mat_cyan_crystal)

# Dải sao tinh tú lung linh
for star_idx in range(90):
    st_x = random.uniform(-65, 65)
    st_y = random.uniform(20, 75)
    st_z = random.uniform(10, 55)
    st_sz = random.uniform(0.2, 0.6)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=st_sz, location=(st_x, st_y, st_z), segments=8, ring_count=6)
    star = bpy.context.active_object
    smooth(star)
    star.data.materials.append(mat_rune_gold if star_idx % 3 == 0 else mat_celestial_moon)

# -----------------------------------------------------------------------------
# 9. HỆ THỐNG ÁNH SÁNG & GÓC MÁY QUANH CẢNH ĐIỆN ẢNH (CINEMATIC LIGHTING & CAMERA)
# -----------------------------------------------------------------------------
bpy.ops.object.light_add(type='SUN', location=(15.0, 35.0, 45.0))
moon_sun = bpy.context.active_object
moon_sun.name = "Sun_Moonlight"
moon_sun.data.energy = 4.8
moon_sun.data.color = (0.75, 0.88, 1.0)
moon_sun.rotation_euler = (0.65, -0.35, 2.5)

bpy.ops.object.light_add(type='POINT', location=(0.0, 5.0, 22.0))
ambient_light = bpy.context.active_object
ambient_light.name = "Ambient_Sky_Light"
ambient_light.data.energy = 280.0
ambient_light.data.color = (0.45, 0.65, 0.85)

# Bầu trời đêm sâu thẳm
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("Mystic_Moon_World")
    bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.025, 0.04, 0.08, 1.0)
    bg_node.inputs['Strength'].default_value = 1.0

# GÓC MÁY ĐIỆN ẢNH SIÊU ĐẸP (TOÀN CẢNH: LÂU ĐÀI, ĐẠI CỔ THỤ, ĐỀN THỜ & VẦNG TRĂNG)
# Đặt camera ở trên cao phía Nam, nhìn bao quát toàn bộ vương quốc
bpy.ops.object.camera_add(location=(0.0, -38.0, 18.5))
cam = bpy.context.active_object
cam.name = "Grand_Panoramic_Camera"
cam.rotation_euler = (1.26, 0.0, 0.0)
cam.data.lens = 24 # Góc siêu rộng 24mm bao trọn cả Lâu Đài bên trái, Đại Cổ Thụ bên phải và Vầng trăng khổng lồ ở giữa
bpy.context.scene.camera = cam

bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

# -----------------------------------------------------------------------------
# 10. XUẤT FILE BLEND, FBX VÀ RENDER ẢNH
# -----------------------------------------------------------------------------
output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Blender\Environments"
os.makedirs(output_dir, exist_ok=True)

blend_path = os.path.join(output_dir, "MysticMoonMap.blend")
fbx_path = os.path.join(output_dir, "MysticMoonMap.fbx")
render_path = os.path.join(output_dir, "MysticMoonMap_Preview.png")

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)

bpy.context.scene.render.filepath = render_path
try:
    bpy.ops.render.render(write_still=True)
    print(f"📸 ĐÃ RENDER ẢNH TOÀN CẢNH LÂU ĐÀI & ĐẠI CỔ THỤ: {render_path}")
except Exception as e:
    print(f"⚠️ Lỗi render: {e}")

print(f"✅ HOÀN TẤT VÀ LƯU THÀNH CÔNG:")
print(f"  - Blend: {blend_path}")
print(f"  - FBX: {fbx_path}")
print(f"  - Preview: {render_path}")
