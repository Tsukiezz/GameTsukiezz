# Lâu Đài Nguyệt Ảnh

Mô hình Gothic mới, dựng bằng Blender theo các ảnh tham khảo người dùng:
tháp nhọn mái xanh, mặt tiền kính màu vàng, tường thành có răng cưa, một
cầu đá vòm, cổng nâng và hai lính giáp trụ. Không bật lại lâu đài cũ ở
(-110,120).

Vị trí trung tâm: **(0, 8, 450)** ở vùng đồng bằng phía nam bản đồ ban đầu,
tách khỏi núi Bạch Khuyết. Sàn đá cao hơn nền đất bên dưới để tránh hiện
tượng hai bề mặt chồng nhau.
Vào game bằng nút CHƠI, mở **Địa điểm → Lâu Đài Nguyệt Ảnh** để tới đầu cầu.
Đi qua cầu, tới cổng và bấm **E**. Bấm E lần nữa để đóng; cổng không đóng
khi nhân vật đang đứng trong ngưỡng cửa.

Nội thất gồm đại sảnh/ngai vàng, thư viện, phòng ngủ hoàng gia, phòng khách,
phòng tắm, phòng ăn, phòng hội đồng, phòng nghiên cứu, phòng thay đồ, hành
lang, vườn hồng/đài phun nước và dãy phòng giam phía bắc. Hai cầu thang ở
hai bên cung điện nối tầng trệt với tầng trên; vào phòng trên qua chiếu
nghỉ phía bắc. Đi vòng hai bên cung điện để tới hành lang nhà tù.

Nguồn có thể sửa:

- `Assets/Art/Blender/Environments/MoonveilPalace.blend`
- `tools/build_moonlit_palace.py`: mô hình, vật liệu, nội thất, dữ liệu sàn/tường.
- `demo/features/castle/data/moonveil-palace.js`: mesh xuất từ Blender.
- `demo/features/castle/moonveil-palace.js`: hồ, địa hình, cổng, va chạm,
  sàn/cầu thang, camera, vùng giữ chỗ và điểm di chuyển.

Hồ bán kính 185 m dùng cùng mặt nước **y=1.2** với sông; đáy được khoét
thấp hơn mặt nước. Nhánh nối ở phía đông tới sông gần (264,378). Các mesh
địa hình nền được đồng bộ trước khi lập tuyến đường sắt. Hệ lập tuyến né
toàn bộ đảo/hồ, chuyển các nút đường gần hồ ra ngoài để dành chỗ cho góc
cua dài của đoàn tàu. Sáu đoàn tàu hiện có được giữ lại.

Sàn, cầu thang, cửa phòng và tường có dữ liệu vật lý riêng từ cùng bản dựng
Blender. Camera dùng chính mesh làm vật cản. Bơi, thuyền, bản đồ và vùng
cấm sinh quái biết tới hồ/lâu đài. Thay đổi này không xóa tiến trình cũ.

Các tháp có khối va chạm; cửa tầng trên nằm ở mặt tường bên cạnh tháp,
không đi xuyên thân tháp. Tháp nhọn chính bắt đầu trên mái, để đại sảnh
và ngai vàng bên dưới thông thoáng. Sương được giảm cục bộ quanh lâu đài
khi đang chơi; sương dưới nước vẫn giữ nguyên. Địa điểm mới được thêm cuối
danh sách để các mã `place_N` trong nhật ký cũ không đổi.

69 lối đi vùng núi được dựng sẵn theo mạng ray hiện tại. Tuyến lên điểm
ngắm cảnh của Làng Sương Lam Tây giữ mặt đường cũ đã kiểm tra khoảng
trống cho nhân vật, rồi cập nhật bậc/sàn theo địa hình hiện tại. Khi thay
tuyến ray trong tương lai, có thể xuất lại bằng cờ `--bake-trails` của bộ
kiểm tra; cờ `--verify-cache` xác nhận dùng được dữ liệu này khi mở mới.

Dựng lại trên máy hiện tại:

```powershell
& D:\blender.exe -b --python tools/build_moonlit_palace.py
node tools/build_boot_runtime.js
python tools/refresh_web_assets.py
node tools/tests/verify_moonveil.js
& 'C:\Users\msi\AppData\Local\Programs\Python\Python312\python.exe' tools/desktop/build_exe.py
```

`integrate_moonveil.cjs` ghi lại các móc tích hợp ban đầu; chúng đã có sẵn
trong mã. Không cần chạy lại khi chỉ sửa mô hình. Kiểm thử dùng cổng 8904,
profile Chrome riêng; không dùng bản lưu của người chơi. Báo cáo và ảnh
thực tế nằm trong `.runtime/moonveil/checks/`, ảnh Blender ở
`.runtime/moonveil/blender-exterior.png`.
