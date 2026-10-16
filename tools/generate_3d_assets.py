import bpy
import os
import math

output_dir = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Models"
os.makedirs(output_dir, exist_ok=True)

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_material(name, base_color, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        if emission_color and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

# 1. MOONSTONE ARTIFACT (Viên Nguyệt Tinh Cổ Vật)
reset_scene()
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=1.0, depth=0.3, location=(0, 0, 1.0))
cylinder = bpy.context.active_object
cylinder.name = "Moonstone_Base"

# Tạo hình vầng trăng khuyết hoặc tinh thể
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.8, location=(0, 0, 1.0))
gem = bpy.context.active_object
gem.name = "Moonstone_Gem"
gem.scale = (0.5, 0.8, 1.4)

mat_moon = create_material("Mat_Moonstone", (0.2, 0.7, 0.9, 1.0), emission_color=(0.3, 0.85, 1.0, 1.0), emission_strength=2.5)
gem.data.materials.append(mat_moon)

blend_path = os.path.join(output_dir, "MoonstoneArtifact.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

fbx_path = os.path.join(output_dir, "MoonstoneArtifact.fbx")
try:
    bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    print("Exported:", fbx_path)
except Exception as e:
    print("FBX Export error:", e)

# 2. ANCIENT MONOLITH / WHISPER STONE (Bia Đá Cổ)
reset_scene()
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.5))
stone = bpy.context.active_object
stone.name = "Ancient_Monolith"
stone.scale = (0.8, 0.5, 3.0)

mat_stone = create_material("Mat_AncientStone", (0.25, 0.28, 0.32, 1.0))
stone.data.materials.append(mat_stone)

blend_stone = os.path.join(output_dir, "AncientMonolith.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_stone)

fbx_stone = os.path.join(output_dir, "AncientMonolith.fbx")
try:
    bpy.ops.export_scene.fbx(filepath=fbx_stone, use_selection=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    print("Exported:", fbx_stone)
except Exception as e:
    print("FBX Export error:", e)

# 3. ANCIENT KEY (Chìa Khóa Cổ Tsukiezz)
reset_scene()
bpy.ops.mesh.primitive_torus_add(major_radius=0.4, minor_radius=0.1, location=(0, 0, 0.8))
ring = bpy.context.active_object
ring.name = "Key_Ring"

bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=1.2, location=(0, 0, 0.0))
shaft = bpy.context.active_object
shaft.name = "Key_Shaft"

mat_key = create_material("Mat_AncientKey", (0.75, 0.6, 0.2, 1.0))
ring.data.materials.append(mat_key)
shaft.data.materials.append(mat_key)

blend_key = os.path.join(output_dir, "AncientKey.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_key)

fbx_key = os.path.join(output_dir, "AncientKey.fbx")
try:
    bpy.ops.export_scene.fbx(filepath=fbx_key, use_selection=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    print("Exported:", fbx_key)
except Exception as e:
    print("FBX Export error:", e)

# 4. TEMPLE GATE / ARCH (Cổng Đền Phong Ấn)
reset_scene()
# Cột trái
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.5, 0, 2.0))
pillar_l = bpy.context.active_object
pillar_l.name = "Pillar_Left"
pillar_l.scale = (0.6, 0.6, 4.0)

# Cột phải
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(1.5, 0, 2.0))
pillar_r = bpy.context.active_object
pillar_r.name = "Pillar_Right"
pillar_r.scale = (0.6, 0.6, 4.0)

# Xà ngang vòm
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 4.2))
lintel = bpy.context.active_object
lintel.name = "Gate_Lintel"
lintel.scale = (4.0, 0.8, 0.6)

mat_gate = create_material("Mat_TempleGate", (0.3, 0.32, 0.36, 1.0))
pillar_l.data.materials.append(mat_gate)
pillar_r.data.materials.append(mat_gate)
lintel.data.materials.append(mat_gate)

blend_gate = os.path.join(output_dir, "TempleGate.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_gate)

fbx_gate = os.path.join(output_dir, "TempleGate.fbx")
try:
    bpy.ops.export_scene.fbx(filepath=fbx_gate, use_selection=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y')
    print("Exported:", fbx_gate)
except Exception as e:
    print("FBX Export error:", e)

print("ALL_MODELS_GENERATED_SUCCESSFULLY")
