# Đôi Cánh Pha Lê

Rương cánh nằm trong **phòng lưu giữ ở tầng hầm sâu nhất của lâu đài**, sàn `y=-5`. Đi qua cửa phòng phía đông hành lang nhà tù; vị trí rương khoảng `(-114.5, -5, 125.7)`. Rương được đặt trong một khoảng trống kiểm tra bằng va chạm thực, không chắn cửa phòng. Đứng gần, nhấn **E** để nhận vật phẩm một lần.

Mở **I → Đôi Cánh Pha Lê → Trang bị**. Cánh hiện trên lưng mọi nhân vật hiện có. Nhấn **F** bật/tắt bay, **WASD** di chuyển, giữ **Space** lên cao, **Q/Ctrl** hạ xuống, **Shift** bay nhanh. Không giữ phím độ cao thì nhân vật lơ lửng. Điện thoại có nút cánh riêng và dùng hai nút mũi tên lên/xuống đang có. Cánh cho tốc độ bay 10 m/s, bay nhanh 18 m/s, giới hạn cao độ tuyệt đối 500 m.

Nhấn **Tháo cánh** trong balo để cất trang bị; trọng lực trở lại khi ngừng bay hoặc tháo cánh. Không có sát thương rơi trong cơ chế hiện tại. Menu tạm dừng chuyển động; dịch chuyển, về trang chủ và bị quái vật ngoạm sẽ kết thúc trạng thái bay. Va chạm ngang dùng các bước di chuyển nhỏ; lên/xuống kiểm tra quét qua các mặt trần/sàn và giữ giới hạn bản đồ.

Quyền sở hữu và trạng thái trang bị lưu riêng tại `tsuventure_crystal_wings_v1` trong localStorage. Không thay đổi chocolate hoặc dữ liệu quặng. Tải lại game vẫn mặc cánh đã trang bị, nhưng không tự bật bay.

Mẫu Blender có thể chỉnh sửa: `Assets/Art/Blender/Equipment/CrystalWings.blend`, được tạo bởi `tools/build_crystal_wings.py`. Game dùng cùng cấu trúc 12 phiến tinh thể, hai trục cánh, gọng và khóa lưng trong `demo/features/inventory/crystal-wings.js`. Vật phẩm có biểu tượng SVG riêng, không dùng dịch vụ bên ngoài.

Chạy server `demo` trên cổng 8765 và `node tools/tests/verify_crystal_wings.js`. Kiểm tra bao gồm đi từ cửa đến rương, tương tác thật, trang bị, bay, va chạm, các nhân vật, cảm ứng và tải lại trang. Báo cáo và ảnh ở `demo/verification`.
