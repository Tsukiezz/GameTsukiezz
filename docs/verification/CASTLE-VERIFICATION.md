# Kiểm tra lâu đài trong bản demo trình duyệt

## Cổng, mật thất và chuyển động rơi

- `demo/features/castle/castle-upgrade.js` dùng dữ liệu xuất từ Blender tại
  `demo/features/castle/data/castle-extension.js`; file nguồn là
  `Assets/Art/Blender/Environments/CastleExtension.blend`.
- Tạo lại phần mở rộng từ thư mục dự án:
  `D:\blender.exe --background --python tools/build_castle_extension.py`.
  Script tạo scene riêng, không sửa file MysticMoonMap.blend hiện có.
- Cổng chính đóng mặc định. Đến gần nhấn E để mở/đóng hai cánh trượt;
  cổng có va chạm theo vị trí thực và không đóng khi người chơi đứng ở ngưỡng.
- Chọn **Cửa Hầm Bí Mật** trên thanh tham quan để tới cửa gỗ trong hầm cũ.
  Nhấn E, đi xuống cầu thang để tới mật thất ở cao độ -5m. Lối cầu thang
  được cắt khỏi móng và địa hình thật, không dùng dịch chuyển.
- Lan can giếng trời, ban công và cầu thang được hạ xuống khoảng 0.42m,
  thấp hơn nhân vật (0.65m); bỏ các khối va chạm cao vô hình ở cầu dẫn.
- `updatePlayerVertical` là hàm dùng chung cho game và kiểm thử. Bước hụt
  bắt đầu rơi từ độ cao hiện tại, vận tốc tăng theo trọng lực và hạ cánh trên
  sàn; hỗ trợ hầm âm, nhảy và va chạm trần.
- Kiểm tra hiện có 161 tình huống, gồm cầu thang ở 15/30/60/144 FPS,
  E mở cổng/cửa hầm, rơi xuống tầng dưới và không xuyên sàn khi rơi nhanh.
  Ảnh mới nằm trong `demo/verification/`, có `secret-crypt.png` và `castle-gate.png`.
- Tường dùng mặt kín liên tục với vân gạch, bỏ các viên đá nổi rời và vệt vân
  cẩm thạch giống vết nứt. Ảnh `mezzanine-brick-wall.png` chụp tầng hai.
- Cổng là hai tấm đặc có khung vàng, phù điêu và chốt tay nắm ở cả hai mặt;
  các tấm chồng mép để che kín đường ghép giữa và hai bên khung đá. Kiểm tra
  raycast ở 35 vị trí trên cổng xác nhận không có khe nhìn xuyên. Họa tiết
  được gộp theo vật liệu, tổng cộng tám draw call cho cổng.
- Khoảng thông tầng ở tầng 2 đã được lấp bằng sàn thật tại cao độ 13m,
  bổ sung khoảng 485m². Bỏ bốn lan can giếng trời cũ và va chạm của chúng.
  Phần trên các cầu thang được che sàn tới mức còn đủ khoảng thoáng đầu;
  chỉ giữ hai lỗ nhỏ cho các bậc trên cùng, có lan can bảo vệ ba mặt.
  Kiểm tra 1.610 vị trí trên vùng trung tâm cũ, đi ngang/dọc qua sàn mới và
  đi cầu thang ở nhiều FPS. Ảnh: `extended-upper-floor.png`.
- Ảnh người dùng tại (-100,132) thực tế đứng ở chiếu nghỉ cao 9.5m.
  Blender tạo thêm một mặt sàn liên tục tại đúng cao độ này tới các tường,
  chỉ chừa khoảng cần cho những bậc cuối của thang trung tâm. Sàn chiếu nghỉ
  cũ được thay thế, có kiểm tra đi ngang, đi dọc và 1.050 điểm đỡ trên vùng
  sàn mới. Nút **Xem Sàn Mới** đưa tới đúng vị trí này. Ảnh đối chiếu:
  `reported-floor-gap.png`, `full-intermediate-floor.png`.
- Script Blender cập nhật mã phiên bản theo nội dung cho hai file JavaScript
  ngoài để trình duyệt tải đúng dữ liệu hình học sau mỗi lần dựng lại.

Đã dọn 3 file bytecode Python và 10 ảnh chụp cũ ở gốc `demo/` (khoảng 3 MB).
Tài nguyên Unity/Blender, ảnh dùng trong giao diện và công cụ tạo map được giữ lại.
Cache Python và ảnh kiểm tra sinh tự động được thêm vào `.gitignore`.

Blender đã chạy nền để tạo dữ liệu; kết nối trực tiếp qua addon MCP chưa hoạt động
trong lần kiểm tra này. Các thay đổi gameplay áp dụng cho bản web, không phải Unity.

Chạy từ thư mục dự án:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory demo
```

Ở cửa sổ khác:

```powershell
node tools/tests/verify_castle.js
```

Yêu cầu Node.js có WebSocket toàn cục và Google Chrome tại đường dẫn mặc định
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Có thể đặt `GAME_URL`
nếu dùng cổng khác. Script dùng hồ sơ Chrome tạm riêng, không dùng hồ sơ cá nhân.

Kết quả hiện tại: **124/124 kiểm tra đạt**, không có ngoại lệ JavaScript được
ghi nhận. Báo cáo nằm tại `demo/verification/castle-report.json`; ảnh thực tế
của đại cầu thang, thang gác mái, thang hầm và cầu dẫn nằm cùng thư mục.

Phạm vi kiểm tra:

- Lên/xuống sáu nhánh thang: hầm, nhánh giữa, hai cánh, gác mái, bệ ngai vàng.
  Mỗi nhánh được kiểm tra ở 15/30/60/144 FPS và 3/6/12 m/s bằng hàm di chuyển
  mà vòng lặp game sử dụng, không sao chép thuật toán va chạm vào bài kiểm tra.
- Đường liên thông từ cầu dẫn tới đại điện, hai cánh lên tầng ngai vàng,
  hành lang tới gác mái, phòng trung tâm gác mái, hầm trú ẩn và hai ban công.
- Tường tại bốn tầng, vách ngăn, song sắt, lan can, tay vịn liên tục và bước
  di chuyển dài nhằm phát hiện xuyên tường khi chạy nhanh.
- Chiều cao hiển thị của cả 96 bậc khớp với mặt đứng vật lý; nhảy gặp trần,
  khoảng mở giếng thang, bốn điểm dịch chuyển và camera gặp tường/sàn.

Sàn và bậc thang mới dùng cùng `floorPlate` để tạo hình và mặt đứng, với
bậc cao tối đa 0.30m. Khoảng mở tầng trên được chia thành các tấm sàn thật;
không dùng ngưỡng độ cao nhân vật để tự chuyển lên tầng khác. Chi tiết đá xây
dùng InstancedMesh; họa tiết đá/cẩm thạch được tạo cục bộ bằng canvas.

Đây là kiểm thử bản `demo/index.html`, không phải kiểm thử project Unity.
Các bài kiểm tra không bao quát mọi vị trí trong thế giới hoặc mọi GPU.
