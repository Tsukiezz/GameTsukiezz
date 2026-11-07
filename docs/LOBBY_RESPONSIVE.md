# Sảnh trên màn hình nhỏ — 04/11/2026

Sau màn hình tải 0–100%, cả EXE và web mở sảnh chính. Bấm **CHƠI** mới
ẩn sảnh, hiện HUD và kích hoạt điều khiển gameplay. Các URL kiểm thử có
tham số đi thẳng tới một vùng cụ thể vẫn giữ chức năng phục vụ kiểm thử.

`demo/features/lobby/lobby.css` giữ nội dung trung tâm không co chiều cao,
giới hạn logo theo chiều ngang, cho chữ ở thanh trên/chân trang xuống dòng
và cho cuộn khi cửa sổ quá thấp. Ở chiều cao tối đa 650 px, menu chuyển
thành hai cột, thu gọn logo và ẩn đoạn giới thiệu. Skin/Cài đặt có vùng cuộn
và nút đóng nằm trong khung nhìn.

Kiểm tra nhanh bố cục thật (không dựng thế giới 3D):

```powershell
node tools/tests/verify_lobby_responsive.js
```

32 kiểm tra đạt ở 1366×768, 1280×600, 1024×576 (125%), 800×450 (150%),
640×360, 375×667, 320×480 và 320×256. Kiểm tra tràn ngang, chồng khối,
khả năng cuộn tới từng nút và khung Skin/Cài đặt. Ảnh và báo cáo nằm trong
`.runtime/lobby-responsive/`.

Kiểm tra EXE độc lập và luồng sảnh → CHƠI trên WebView2:

```powershell
node tools/desktop/verify_native.js
```

Runner dùng EXE/hồ sơ thử riêng trong `.runtime/native-desktop/checks/`,
không chỉnh bản lưu người chơi tại cổng 8883.

Lượt EXE thực tế đã đạt 32 kiểm tra bố cục với đủ 5 nút sảnh tạo lúc chạy,
vào sảnh sau tải, bấm CHƠI, ghi save và 88 kiểm tra gameplay/kho đồ.
353 kiểm tra nguồn/tài nguyên và 23 kiểm tra đóng gói/Windows cũng đạt.
Kiểm tra cửa sổ riêng bằng `node tools/desktop/verify_native_window.cjs`
xác nhận bật/tắt toàn màn hình và phục hồi kích thước đúng. Runner tổng
đã tăng thời gian chờ đo F11 từ 200 lên 700 ms để chờ Windows cập nhật.
Không coi lượt runner tổng bị kẹt ở bước mở lại là một lượt đạt toàn bộ;
các kết quả nêu trên là những bước đã kiểm tra thành công riêng biệt.
