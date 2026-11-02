# Đèn Pin Mặt Trời

Đèn nằm trên bệ đá phía đông nam Đền Trung Tâm, tọa độ x=4.5, z=8.
Đến gần, nhấn **E** để nhặt; mở **I / Balo**, chọn **Trang bị**.
Đèn tự bật khi trang bị. Nhấn **L** hoặc nút đèn trên màn hình cảm ứng để bật/tắt.
Giữ chuột phải và xoay camera để soi vách đá, trần, sàn và các góc rẽ.
Lõi mặt trời không hết pin. Quyền sở hữu, trang bị và trạng thái bật được lưu trên thiết bị.

Hang vẫn tối khi tắt đèn. Đèn dùng spotlight 40m, bóng đổ qua vách đá,
vân đá có UV theo kích thước thực và bump map. Camera bị chặn bởi vách hang.
Khi bật đèn trong hang, bóng của đèn được giữ cả ở cấu hình thấp;
khi tắt hoặc ra ngoài, thiết lập bóng trở về cấu hình đồ họa đã chọn.

Nguồn Blender: `Assets/Art/Blender/Equipment/SolarFlashlight.blend`.
Tái xuất mesh với `tools/build_solar_flashlight.py` trong Blender.
Game sử dụng trực tiếp `demo/features/inventory/data/solar-flashlight.js` được xuất từ nguồn này.

Kiểm tra: `node tools/tests/verify_solar_flashlight.js` và
`node tools/tests/verify_evil_cavern.js` khi server demo đang chạy ở cổng 8765.
