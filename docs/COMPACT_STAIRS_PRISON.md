# Thang quay đầu và khu nhà tù — bản 5

Năm bộ cầu thang nối các cao độ -5, 1, 6, 9.5, 13 và 20m. Mỗi bộ gồm hai vế
quay 180 độ và một chiếu nghỉ; vế rộng 1.65–1.7m, bậc cao khoảng 17–18cm.
Diện tích thân thang khoảng 15–25.4m², thay cho đại thang nhiều nhánh chiếm sảnh.
Buồng thang chính nằm ở góc tây bắc. Khoảng trống sàn chỉ chừa trên vế đi lên
cuối; nửa thang thấp được che bằng sàn tầng trên, có lan can quanh miệng thang.

Các phòng bên mở duy nhất một cửa ra hành lang, không có cửa nối tắt giữa hai
phòng kề nhau. Có 33 phòng và 7 vùng hành lang/sảnh điều khiển. Cửa rộng 2.2m,
trừ song sắt nhà tù 1.6m. Tường ngăn vươn tới mặt trong tường ngoài để không
thể đi vòng qua đầu tường. Mỗi cửa có vùng tiếp cận riêng; cả bộ đồ nội thất
(hình học và va chạm) được chuyển cùng nhau nếu xâm lấn vùng này.

Tầng -5m có nhà tù Nguyệt Thạch, phòng cai ngục và phòng lưu giữ. Song sắt trượt
sang bên khi nhấn E tại nút trên bệ đá ngoài cửa. Nhấn lại để khóa; không cho
đóng khi người chơi đang ở ngưỡng cửa. Nút khẩn cấp phía trong luôn mở được cửa.
Trong thanh tham quan, chọn **Nhà Tù** để tới gần nút điều khiển.

Nguồn: `tools/castle_rooms.py`, `tools/castle_compact.py`,
`Assets/Art/Blender/Environments/CastleExtension.blend`.
Game sử dụng cùng dữ liệu xuất tại `demo/features/castle/data/castle-extension.js`.

Chạy kiểm thử từ gốc dự án khi máy chủ demo 8765 đang chạy:

```powershell
node tools/tests/verify_compact.js
node tools/tests/verify_redesign.js
node tools/tests/verify_rooms.js
node tools/tests/verify_interiors.js
node tools/tests/verify_safety.js
node tools/tests/verify_graphics.js
```

Bộ compact kiểm tra lên/xuống toàn bộ thang ở bốn mức FPS, hai tốc độ; đếm
khoảng mở thực trên bốn cạnh mỗi phòng, thử lối đi đến từng phòng bằng hàm
di chuyển game, kiểm tra vùng cửa và chu trình mở/khóa/mở khẩn cấp nhà tù.
Hai lệnh cũ `verify_castle.js` và `verify_basement.js` được giữ làm điểm vào
tương thích, chuyển tới bộ compact thay cho tọa độ đại thang của bản 4.

Kết quả: 57/57 kiểm tra compact/nhà tù đạt; 88 kiểm tra cầu nhảy/thiết kế,
16 phòng/camera, 14 nội thất, 8 an toàn sàn/cửa và 10 đồ họa cũng đạt.
Ảnh và báo cáo JSON được sinh tại `demo/verification/`.
