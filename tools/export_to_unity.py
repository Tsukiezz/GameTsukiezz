import bpy
import os

# Đường dẫn tự động tới thư mục Models của Game Tsukiezz
PROJECT_MODELS_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\Assets\Art\Models"

def export_active_to_unity():
    """
    Xuất vật thể đang chọn trong Blender sang Unity với chuẩn:
    - Trục: -Z Forward, Y Up (Chuẩn của Unity)
    - Tỷ lệ (Scale): 1.0 (Apply Transform)
    """
    if not os.path.exists(PROJECT_MODELS_PATH):
        os.makedirs(PROJECT_MODELS_PATH, exist_ok=True)

    active_obj = bpy.context.active_object
    if not active_obj:
        print("[LỖI] Vui lòng chọn ít nhất một vật thể trong 3D Viewport để xuất.")
        return

    obj_name = active_obj.name.replace(" ", "_")
    output_file = os.path.join(PROJECT_MODELS_PATH, f"{obj_name}.fbx")

    # Áp dụng Transform (Location, Rotation, Scale)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    # Xuất file FBX
    bpy.ops.export_scene.fbx(
        filepath=output_file,
        use_selection=True,
        apply_scale_options='FBX_SCALE_ALL',
        axis_forward='-Z',
        axis_up='Y',
        bake_anim=False
    )

    print(f"✅ ĐÃ XUẤT THÀNH CÔNG: {output_file}")
    
    # Hiển thị thông báo trên màn hình Blender nếu đang ở chế độ giao diện
    def draw(self, context):
        self.layout.label(text=f"Đã xuất '{obj_name}.fbx' sang Unity!")
    
    try:
        bpy.context.window_manager.popup_menu(draw, title="Tsukiezz Unity Exporter", icon='CHECKMARK')
    except Exception:
        pass

if __name__ == "__main__":
    export_active_to_unity()
