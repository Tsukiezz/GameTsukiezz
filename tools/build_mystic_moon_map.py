import bpy
import math
import random
import os

print("=== BẮT ĐẦU TẠO BẢN ĐỒ MẶT TRĂNG HUYỀN BÍ (MYSTIC MOON REALM) ĐỈNH CAO TRONG BLENDER ===")

# Reset hoàn toàn Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# -----------------------------------------------------------------------------
# 1. HỆ THỐNG VẬT LIỆU HUYỀN BÍ (MYSTICAL SHADERS & EMISSIVE MATERIALS)
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

# Bề mặt mặt trăng & đá cổ
mat_moon_rock = create_mat("Mat_Moon_Rock", (0.07, 0.09, 0.15, 1.0), roughness=0.88, metallic=0.05)
mat_path_stone = create_mat("Mat_Path_Stone", (0.18, 0.22, 0.32, 1.0), roughness=0.75, metallic=0.1)
mat_ruin_stone = create_mat("Mat_Ruin_Stone", (0.24, 0.27, 0.38, 1.0), roughness=0.70, metallic=0.15)
mat_rune_gold = create_mat("Mat_Rune_Gold", (1.0, 0.84, 0.25, 1.0), roughness=0.2, metallic=0.85, emissive=(1.0, 0.85, 0.30, 1.0), emit_strength=5.5)

# Tinh thể phát quang & Cổng dịch chuyển
mat_cyan_crystal = create_mat("Mat_Cyan_Crystal", (0.05, 0.95, 0.85, 1.0), roughness=0.12, metallic=0.15, emissive=(0.0, 0.98, 0.85, 1.0), emit_strength=6.0)
mat_purple_crystal = create_mat("Mat_Purple_Crystal", (0.55, 0.15, 0.88, 1.0), roughness=0.15, metallic=0.15, emissive=(0.65, 0.20, 0.95, 1.0), emit_strength=5.5)
mat_portal_vortex = create_mat("Mat_Portal_Vortex", (0.25, 0.08, 0.45, 1.0), roughness=0.1, emissive=(0.55, 0.18, 0.90, 1.0), emit_strength=7.0)
mat_starlight_pool = create_mat("Mat_Starlight_Pool", (0.02, 0.40, 0.50, 1.0), roughness=0.04, metallic=0.1, emissive=(0.0, 0.70, 0.65, 1.0), emit_strength=2.5)

# Sinh vật thực vật phát quang (Bioluminescent Flora)
mat_shroom_cap_purple = create_mat("Mat_Shroom_Cap_Purple", (0.40, 0.10, 0.65, 1.0), roughness=0.35, emissive=(0.55, 0.15, 0.85, 1.0), emit_strength=3.5)
mat_shroom_cap_cyan = create_mat("Mat_Shroom_Cap_Cyan", (0.05, 0.70, 0.65, 1.0), roughness=0.35, emissive=(0.0, 0.90, 0.80, 1.0), emit_strength=4.0)
mat_shroom_stem = create_mat("Mat_Shroom_Stem", (0.92, 0.92, 0.88, 1.0), roughness=0.75)
mat_shroom_dots = create_mat("Mat_Shroom_Dots", (0.3, 1.0, 0.9, 1.0), roughness=0.2, emissive=(0.2, 1.0, 0.9, 1.0), emit_strength=6.0)

# Cây Ánh Trăng Thần Thoại
mat_tree_trunk = create_mat("Mat_Tree_Trunk", (0.12, 0.10, 0.16, 1.0), roughness=0.85)
mat_tree_foliage = create_mat("Mat_Tree_Foliage", (0.10, 0.60, 0.75, 1.0), roughness=0.35, emissive=(0.10, 0.85, 0.95, 1.0), emit_strength=4.5)

# Vầng trăng khổng lồ và tinh tú
mat_celestial_moon = create_mat("Mat_Celestial_Moon", (0.94, 0.97, 1.0, 1.0), roughness=0.15, emissive=(0.92, 0.97, 1.0, 1.0), emit_strength=3.5)

def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def subsurf(obj, lv=1):
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = lv
    m.render_levels = lv

# -----------------------------------------------------------------------------
# 2. ĐỊA HÌNH MẶT TRĂNG (CRATERED LUNAR TERRAIN & CRAGS)
# -----------------------------------------------------------------------------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=64, y_subdivisions=64, size=65, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "Terrain_Lunar_Surface"

mesh = terrain.data
random.seed(42)
for v in mesh.vertices:
    x, y = v.co.x, v.co.y
    dist_center = math.sqrt(x*x + y*y)
    
    # Lòng chảo trũng nhẹ ở trung tâm dành cho Đền Thần
    z_base = -0.8 * math.exp(- (dist_center / 12.0)**2)
    
    # Đường đồi dốc tự nhiên bao quanh
    rim = 2.2 * math.sin(x * 0.12) * math.cos(y * 0.12)
    
    # Các miệng hố va chạm tự nhiên
    crater1 = -1.4 * math.exp(- (((x - 14)**2 + (y - 12)**2) / 20.0))
    crater2 = -1.6 * math.exp(- (((x + 16)**2 + (y - 8)**2) / 24.0))
    crater3 = -1.5 * math.exp(- (((x - 10)**2 + (y + 18)**2) / 25.0))
    
    v.co.z = z_base + rim + crater1 + crater2 + crater3 + (random.random() - 0.5) * 0.3

smooth(terrain)
subsurf(terrain, 1)
terrain.data.materials.append(mat_moon_rock)

# Con đường đá cổ lát dẫn vào đền thờ (Ancient Paved Pathway)
for path_i in range(12):
    py = -22.0 + path_i * 1.5
    px = math.sin(path_i * 0.3) * 0.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, -0.15))
    stone_tile = bpy.context.active_object
    stone_tile.name = f"Path_Stone_{path_i}"
    stone_tile.scale = (2.2, 1.2, 0.18)
    smooth(stone_tile)
    stone_tile.data.materials.append(mat_path_stone)

# Trụ đèn đá thắp sáng ánh trăng hai bên đường (Lantern Posts)
for l_idx, (lx, ly) in enumerate([(-1.8, -18.0), (1.8, -18.0), (-2.0, -12.0), (2.0, -12.0), (-2.2, -6.0), (2.2, -6.0)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=1.8, location=(lx, ly, 0.8), vertices=12)
    post = bpy.context.active_object
    post.name = f"Lantern_Post_{l_idx}"
    smooth(post)
    post.data.materials.append(mat_ruin_stone)
    
    # Đèn ngọc phát sáng trên đỉnh cột
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.25, location=(lx, ly, 1.8))
    lamp = bpy.context.active_object
    lamp.name = f"Lantern_Gem_{l_idx}"
    smooth(lamp)
    lamp.data.materials.append(mat_cyan_crystal)
    
    # Nguồn sáng cục bộ
    bpy.ops.object.light_add(type='POINT', location=(lx, ly, 1.8))
    lamp_lt = bpy.context.active_object
    lamp_lt.name = f"Light_Lantern_{l_idx}"
    lamp_lt.data.energy = 25.0
    lamp_lt.data.color = (0.0, 0.95, 0.85)

# Hồ tinh thể ánh trăng (Starlight Crater Pool) ở phía đông
bpy.ops.mesh.primitive_cylinder_add(radius=6.0, depth=0.35, location=(14, 8, -0.5), vertices=32)
pool = bpy.context.active_object
pool.name = "Starlight_Pool"
smooth(pool)
pool.data.materials.append(mat_starlight_pool)

# Vành đá quanh hồ
bpy.ops.mesh.primitive_torus_add(major_radius=6.0, minor_radius=0.45, location=(14, 8, -0.35), major_segments=32, minor_segments=16)
pool_rim = bpy.context.active_object
pool_rim.name = "Pool_Rim_Rocks"
smooth(pool_rim)
pool_rim.data.materials.append(mat_moon_rock)

# Vách đá biên giới hùng vĩ (Boundary Crags)
boundary_cliffs = [
    (-26, 0, 5.0, 4.0, 12.0, 7.0),
    (26, 2, 4.5, 3.5, 11.0, 6.5),
    (0, 28, 5.5, 14.0, 4.0, 8.0),
    (-20, 20, 6.0, 7.0, 7.0, 8.5),
    (20, -20, 4.5, 8.0, 6.0, 7.0)
]
for idx, (cx, cy, cz, sx, sy, sz) in enumerate(boundary_cliffs):
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(cx, cy, cz))
    cliff = bpy.context.active_object
    cliff.name = f"Cliff_Boundary_{idx}"
    cliff.scale = (sx, sy, sz)
    cliff.rotation_euler = (random.uniform(-0.15, 0.15), random.uniform(-0.15, 0.15), random.uniform(0, 3.14))
    smooth(cliff)
    subsurf(cliff, 1)
    cliff.data.materials.append(mat_moon_rock)

# -----------------------------------------------------------------------------
# 3. THÁNH ĐỊA MẶT TRĂNG (THE MOON SHRINE / SANCTUARY OF TSUKIEZZ)
# -----------------------------------------------------------------------------
shrine_x, shrine_y, shrine_z = 0.0, 0.0, -0.2

# Tầng 1
bpy.ops.mesh.primitive_cylinder_add(radius=7.5, depth=0.4, location=(shrine_x, shrine_y, shrine_z + 0.2), vertices=48)
dais_1 = bpy.context.active_object
dais_1.name = "Shrine_Dais_Tier1"
smooth(dais_1)
dais_1.data.materials.append(mat_ruin_stone)

# Tầng 2
bpy.ops.mesh.primitive_cylinder_add(radius=5.5, depth=0.4, location=(shrine_x, shrine_y, shrine_z + 0.6), vertices=48)
dais_2 = bpy.context.active_object
dais_2.name = "Shrine_Dais_Tier2"
smooth(dais_2)
dais_2.data.materials.append(mat_ruin_stone)

# Tầng 3 (Tâm điện)
bpy.ops.mesh.primitive_cylinder_add(radius=3.5, depth=0.3, location=(shrine_x, shrine_y, shrine_z + 0.95), vertices=36)
dais_3 = bpy.context.active_object
dais_3.name = "Shrine_Dais_Tier3"
smooth(dais_3)
dais_3.data.materials.append(mat_ruin_stone)

# Vòng tròn cổ ngữ ánh vàng phát quang
bpy.ops.mesh.primitive_torus_add(major_radius=3.4, minor_radius=0.09, location=(shrine_x, shrine_y, shrine_z + 1.12), major_segments=48, minor_segments=16)
gold_rune_ring = bpy.context.active_object
gold_rune_ring.name = "Shrine_Rune_Ring"
smooth(gold_rune_ring)
gold_rune_ring.data.materials.append(mat_rune_gold)

# 6 Trụ đá cổ ngữ bao quanh đền (Hexagonal Rune Pillars)
pillar_radius = 5.2
for p_idx in range(6):
    angle = p_idx * (math.pi / 3.0)
    px = shrine_x + math.cos(angle) * pillar_radius
    py = shrine_y + math.sin(angle) * pillar_radius
    pz = shrine_z + 0.6
    
    # Chân cột
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.3))
    base = bpy.context.active_object
    base.name = f"Pillar_Base_{p_idx}"
    base.scale = (1.2, 1.2, 0.6)
    smooth(base)
    base.data.materials.append(mat_ruin_stone)
    
    # Thân cột
    pillar_height = 4.5 + (p_idx % 2) * 0.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, pz + 0.6 + pillar_height / 2))
    pillar = bpy.context.active_object
    pillar.name = f"Rune_Pillar_{p_idx}"
    pillar.scale = (0.75, 0.75, pillar_height)
    smooth(pillar)
    pillar.data.materials.append(mat_ruin_stone)
    
    # Rãnh cổ ngữ phát sáng
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px * 0.94, py * 0.94, pz + 0.6 + pillar_height / 2))
    rune_inset = bpy.context.active_object
    rune_inset.name = f"Rune_Glow_{p_idx}"
    rune_inset.scale = (0.18, 0.08, pillar_height * 0.7)
    rune_inset.rotation_euler = (0, 0, angle + 1.57)
    smooth(rune_inset)
    rune_inset.data.materials.append(mat_cyan_crystal)

# VIÊN ĐÁ MẶT TRĂNG THƯỢNG CỔ BAY LƠ LỬNG (Hovering Moonstone Core)
core_z = shrine_z + 2.6
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.2, location=(shrine_x, shrine_y, core_z))
moonstone = bpy.context.active_object
moonstone.name = "Floating_Moonstone_Core"
moonstone.scale = (0.85, 0.85, 1.6)
smooth(moonstone)
moonstone.data.materials.append(mat_cyan_crystal)

# Vành hạt năng lượng quay quanh viên đá
bpy.ops.mesh.primitive_torus_add(major_radius=1.8, minor_radius=0.07, location=(shrine_x, shrine_y, core_z), major_segments=32, minor_segments=16)
energy_ring = bpy.context.active_object
energy_ring.name = "Moonstone_Orbit_Ring"
energy_ring.rotation_euler = (0.45, 0.35, 0)
smooth(energy_ring)
energy_ring.data.materials.append(mat_rune_gold)

# Đèn phát sáng rực rỡ tại tâm đền thờ
bpy.ops.object.light_add(type='POINT', location=(shrine_x, shrine_y, core_z))
moonstone_light = bpy.context.active_object
moonstone_light.name = "Light_Moonstone_Core"
moonstone_light.data.energy = 220.0
moonstone_light.data.color = (0.0, 0.98, 0.85)

# -----------------------------------------------------------------------------
# 4. CỔNG DỊCH CHUYỂN ÁNH TRĂNG (LUNAR RIFT PORTAL GATE)
# -----------------------------------------------------------------------------
portal_x, portal_y, portal_z = 0.0, 16.0, 0.2

for p_side in [-1, 1]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x + p_side * 3.8, portal_y, portal_z + 3.2))
    p_post = bpy.context.active_object
    p_post.name = f"Portal_Post_{p_side}"
    p_post.scale = (1.4, 1.4, 6.4)
    smooth(p_post)
    p_post.data.materials.append(mat_ruin_stone)
    
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.7, location=(portal_x + p_side * 3.8, portal_y, portal_z + 6.8))
    p_gem = bpy.context.active_object
    p_gem.name = f"Portal_Gem_{p_side}"
    p_gem.scale = (0.7, 0.7, 1.2)
    smooth(p_gem)
    p_gem.data.materials.append(mat_purple_crystal)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(portal_x, portal_y, portal_z + 6.5))
p_arch = bpy.context.active_object
p_arch.name = "Portal_Lintel_Arch"
p_arch.scale = (9.0, 1.6, 1.2)
smooth(p_arch)
p_arch.data.materials.append(mat_ruin_stone)

bpy.ops.mesh.primitive_plane_add(size=1.0, location=(portal_x, portal_y, portal_z + 3.2))
p_vortex = bpy.context.active_object
p_vortex.name = "Portal_Vortex_Energy"
p_vortex.scale = (6.0, 6.0, 1.0)
p_vortex.rotation_euler = (1.5708, 0, 0)
smooth(p_vortex)
p_vortex.data.materials.append(mat_portal_vortex)

bpy.ops.object.light_add(type='POINT', location=(portal_x, portal_y - 0.5, portal_z + 3.5))
portal_light = bpy.context.active_object
portal_light.name = "Light_Portal_Purple"
portal_light.data.energy = 240.0
portal_light.data.color = (0.75, 0.25, 0.95)

# -----------------------------------------------------------------------------
# 5. KHU RỪNG NẤM PHÁT QUANG (BỐ TRÍ PHÍA TÂY BẮC & TÂY ĐỂ ĐẸP KHUNG HÌNH)
# -----------------------------------------------------------------------------
# Bố trí các cây nấm lùi về phía cánh trái (x < -8) để không chắn tầm nhìn trung tâm
giant_mushrooms = [
    (-14.0, -8.0, 0.2, 1.4, "cyan"),
    (-18.0, -12.0, 0.5, 1.6, "purple"),
    (-12.5, -16.5, 0.1, 1.1, "cyan"),
    (-19.0, -4.0, 0.3, 1.2, "purple"),
    (-15.0, 4.0, 0.4, 1.5, "cyan")
]

for m_idx, (mx, my, mz, sc, m_type) in enumerate(giant_mushrooms):
    stem_h = 3.8 * sc
    cap_r = 2.4 * sc
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.4 * sc, depth=stem_h, location=(mx, my, mz + stem_h / 2), vertices=24)
    m_stem = bpy.context.active_object
    m_stem.name = f"Giant_Mushroom_Stem_{m_idx}"
    m_stem.rotation_euler = (random.uniform(-0.08, 0.08), random.uniform(-0.08, 0.08), 0)
    smooth(m_stem)
    m_stem.data.materials.append(mat_shroom_stem)
    
    cap_mat = mat_shroom_cap_cyan if m_type == "cyan" else mat_shroom_cap_purple
    bpy.ops.mesh.primitive_uv_sphere_add(radius=cap_r, location=(mx, my, mz + stem_h), segments=32, ring_count=20)
    m_cap = bpy.context.active_object
    m_cap.name = f"Giant_Mushroom_Cap_{m_idx}"
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
        dot.name = f"Giant_Mushroom_Dot_{m_idx}_{d_i}"
        smooth(dot)
        dot.data.materials.append(mat_shroom_dots)
        
    bpy.ops.object.light_add(type='POINT', location=(mx, my, mz + stem_h - 0.4 * sc))
    m_light = bpy.context.active_object
    m_light.name = f"Light_Mushroom_{m_idx}"
    m_light.data.energy = 55.0 * sc
    m_light.data.color = (0.0, 0.95, 0.85) if m_type == "cyan" else (0.75, 0.20, 0.90)

# Khóm nấm đỏ đốm trắng dưới đất
for r_idx, (rx, ry) in enumerate([(-7.5, -8.5), (-6.8, -10.2), (7.5, -8.5), (6.8, -10.2), (-8.0, 4.0), (8.0, 4.0)]):
    r_sc = random.uniform(0.45, 0.75)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08 * r_sc, depth=0.5 * r_sc, location=(rx, ry, 0.25 * r_sc), vertices=12)
    r_stem = bpy.context.active_object
    smooth(r_stem)
    r_stem.data.materials.append(mat_shroom_stem)
    
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35 * r_sc, location=(rx, ry, 0.5 * r_sc), segments=16, ring_count=12)
    r_cap = bpy.context.active_object
    r_cap.scale = (1.0, 1.0, 0.7)
    smooth(r_cap)
    r_cap.data.materials.append(mat_shroom_cap_purple)

# -----------------------------------------------------------------------------
# 6. CÂY ĐẠI CỔ THỤ ÁNH TRĂNG (THE LUMINESCENT MOON TREE - PHÍA ĐÔNG CÁNH PHẢI)
# -----------------------------------------------------------------------------
tree_x, tree_y, tree_z = 16.0, -8.0, 0.2

bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=7.5, location=(tree_x, tree_y, tree_z + 3.75), vertices=24)
tree_trunk = bpy.context.active_object
tree_trunk.name = "Moon_Tree_Trunk"
tree_trunk.scale = (1.0, 0.85, 1.0)
tree_trunk.rotation_euler = (0.10, -0.08, 0.4)
smooth(tree_trunk)
tree_trunk.data.materials.append(mat_tree_trunk)

branches = [
    (tree_x - 2.5, tree_y - 1.5, tree_z + 6.8, 0.6, 4.0, (0.4, -0.5, 0.8)),
    (tree_x + 2.8, tree_y - 1.0, tree_z + 6.5, 0.55, 3.8, (-0.3, 0.6, -0.7)),
    (tree_x + 0.5, tree_y + 2.8, tree_z + 7.0, 0.6, 4.2, (0.6, 0.2, 1.2))
]
for b_idx, (bx, by, bz, br_rad, br_len, br_rot) in enumerate(branches):
    bpy.ops.mesh.primitive_cylinder_add(radius=br_rad, depth=br_len, location=(bx, by, bz), vertices=16)
    branch = bpy.context.active_object
    branch.name = f"Moon_Tree_Branch_{b_idx}"
    branch.rotation_euler = br_rot
    smooth(branch)
    branch.data.materials.append(mat_tree_trunk)

foliage_clouds = [
    (tree_x, tree_y, tree_z + 8.5, 4.0, 3.6, 2.4),
    (tree_x - 3.2, tree_y - 2.0, tree_z + 7.8, 2.8, 2.8, 1.9),
    (tree_x + 3.5, tree_y - 1.2, tree_z + 7.5, 2.6, 2.6, 1.8),
    (tree_x + 0.8, tree_y + 3.5, tree_z + 8.0, 3.0, 3.0, 2.0)
]
for f_idx, (fx, fy, fz, fsx, fsy, fsz) in enumerate(foliage_clouds):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(fx, fy, fz), segments=24, ring_count=18)
    foliage = bpy.context.active_object
    foliage.name = f"Moon_Tree_Foliage_{f_idx}"
    foliage.scale = (fsx, fsy, fsz)
    smooth(foliage)
    subsurf(foliage, 1)
    foliage.data.materials.append(mat_tree_foliage)

bpy.ops.object.light_add(type='POINT', location=(tree_x, tree_y, tree_z + 7.5))
tree_light = bpy.context.active_object
tree_light.name = "Light_Moon_Tree"
tree_light.data.energy = 160.0
tree_light.data.color = (0.2, 0.85, 0.95)

# -----------------------------------------------------------------------------
# 7. BÃI TINH THỂ NGUYỆT THẠCH (MOONSTONE CRYSTAL SPIRE CLUSTERS)
# -----------------------------------------------------------------------------
crystal_clusters = [
    (8.0, -2.5, 0.0),
    (11.0, 4.0, 0.0),
    (-8.0, 8.0, 0.0),
    (-5.0, -10.0, 0.0),
    (5.0, -10.0, 0.0)
]
for c_idx, (cx, cy, cz) in enumerate(crystal_clusters):
    for s_idx in range(5):
        s_h = random.uniform(2.0, 4.0)
        s_r = random.uniform(0.28, 0.48)
        s_tilt_x = random.uniform(-0.30, 0.30)
        s_tilt_y = random.uniform(-0.30, 0.30)
        sx = cx + random.uniform(-0.6, 0.6)
        sy = cy + random.uniform(-0.6, 0.6)
        
        bpy.ops.mesh.primitive_cylinder_add(radius=s_r, depth=s_h, location=(sx, sy, cz + s_h / 2), vertices=6)
        spire = bpy.context.active_object
        spire.name = f"Crystal_Spire_{c_idx}_{s_idx}"
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
# Vầng trăng huyền bí khổng lồ lơ lửng ngay chính diện phía sau Cổng Thần Điện
bpy.ops.mesh.primitive_uv_sphere_add(radius=20.0, location=(0.0, 45.0, 18.0), segments=48, ring_count=32)
celestial_moon = bpy.context.active_object
celestial_moon.name = "Celestial_Gigantic_Moon"
smooth(celestial_moon)
celestial_moon.data.materials.append(mat_celestial_moon)

# Vành nhật hoa ánh trăng (Lunar Corona Halo)
bpy.ops.mesh.primitive_torus_add(major_radius=21.5, minor_radius=0.9, location=(0.0, 45.0, 18.0), major_segments=48, minor_segments=16)
corona = bpy.context.active_object
corona.name = "Moon_Corona_Halo"
smooth(corona)
corona.data.materials.append(mat_cyan_crystal)

# Các vì tinh tú lấp lánh trên nền trời
for star_idx in range(70):
    st_x = random.uniform(-45, 45)
    st_y = random.uniform(15, 50)
    st_z = random.uniform(8, 38)
    st_sz = random.uniform(0.18, 0.45)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=st_sz, location=(st_x, st_y, st_z), segments=8, ring_count=6)
    star = bpy.context.active_object
    star.name = f"Star_{star_idx}"
    smooth(star)
    star.data.materials.append(mat_rune_gold if star_idx % 3 == 0 else mat_celestial_moon)

# -----------------------------------------------------------------------------
# 9. HỆ THỐNG ÁNH SÁNG & GÓC MÁY QUANH CẢNH ĐIỆN ẢNH (CINEMATIC LIGHTING & CAMERA)
# -----------------------------------------------------------------------------
# Đèn mặt trời ánh trăng
bpy.ops.object.light_add(type='SUN', location=(10.0, 25.0, 30.0))
moon_sun = bpy.context.active_object
moon_sun.name = "Sun_Moonlight"
moon_sun.data.energy = 4.5
moon_sun.data.color = (0.75, 0.88, 1.0)
moon_sun.rotation_euler = (0.65, -0.35, 2.5)

# Đèn môi trường
bpy.ops.object.light_add(type='POINT', location=(0.0, 0.0, 14.0))
ambient_light = bpy.context.active_object
ambient_light.name = "Ambient_Sky_Light"
ambient_light.data.energy = 180.0
ambient_light.data.color = (0.45, 0.65, 0.85)

# Bầu trời đêm sâu thẳm
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("Mystic_Moon_World")
    bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.03, 0.05, 0.10, 1.0)
    bg_node.inputs['Strength'].default_value = 1.0

# GÓC MÁY ĐIỆN ẢNH HOÀN HẢO (CHÍNH DIỆN NGẮM TRỌN THÁNH ĐỊA, RỪNG NẤM, CÂY CỔ THỤ VÀ VẦNG TRĂNG)
# Đặt camera trên cao ở đầu lối vào chính, ngắm thẳng về phía Đền thờ và Vầng trăng
bpy.ops.object.camera_add(location=(0.0, -25.0, 11.5))
cam = bpy.context.active_object
cam.name = "Cinematic_Realm_Camera"
cam.rotation_euler = (1.28, 0.0, 0.0) # Nhìn hơi chếch xuống thung lũng đền thờ và bao trọn vầng trăng
cam.data.lens = 28 # Góc siêu rộng 28mm
bpy.context.scene.camera = cam

# Render Full HD 1920x1080
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

# -----------------------------------------------------------------------------
# 10. LƯU TỆP BLEND, FBX VÀO FOLDER ĐỒ HỌA & RENDER ẢNH XEM TRƯỚC
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
    print(f"📸 ĐÃ RENDER ẢNH BẢN ĐỒ MẶT TRĂNG: {render_path}")
except Exception as e:
    print(f"⚠️ Lỗi render: {e}")

print(f"✅ HOÀN TẤT VÀ LƯU THÀNH CÔNG VÀO THƯ MỤC ENVIRONMENTS:")
print(f"  - Blend: {blend_path}")
print(f"  - FBX: {fbx_path}")
print(f"  - Preview: {render_path}")
