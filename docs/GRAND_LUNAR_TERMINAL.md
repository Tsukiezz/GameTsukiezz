# Bến Xe Lửa Tsukiezz

Nhà ga lớn được dựng bằng Blender tại hành lang phía bắc, nâng cấp ga trước đây mang tên **Ga Viễn Du 18**, nay đổi thành **Bến Xe Lửa Tsukiezz**. Vị trí, mã ga và số lượng 69 điểm dừng được giữ nguyên. Vị trí tâm khoảng **X −1576.27, Z −2975**, nền sảnh Y 10.83 m.

## Chơi bản mới

1. Đóng cửa sổ game cũ, mở **Tsuventure.exe** ở thư mục gốc dự án.
2. Chờ tải 100%, chọn **CHƠI**.
3. Vào **Địa điểm → Bến Xe Lửa Tsukiezz · Tầng trệt**. Có thêm hai mục **Bến Xe Lửa Tsukiezz · Ga chiều xuôi / Ga chiều ngược**.
4. Đi vào một trong bốn cabin thang máy và nhấn **E** để lên tầng sân ga. Mỗi thang chỉ có hai điểm dừng: sảnh và tầng tàu. Hai chiều có thể đổi qua sảnh ở dưới.
5. Trên sân ga: **R** chờ tàu, **T** đổi tuyến, **E** lên tàu đang dừng (1 xu vàng). Trên tàu giữ cách chơi cũ: WASD đi lại, tới ghế nhấn **C**, **E** yêu cầu xuống ở ga tiếp theo. **M** mở bản đồ.

Sáu đoàn cam, hồng, trắng, xám, nâu và be là **tàu dự bị đỗ trong bến**. Cam/hồng/trắng thuộc chiều xuôi; xám/nâu/be thuộc chiều ngược. Mỗi đoàn có một đầu máy và ba toa. Chúng không tham gia bộ điều phối sáu đoàn đang chạy, không tự xuất phát hoặc bán vé riêng.

## Thiết kế và tích hợp

- Công trình rộng 168 m, dài 198 m; khoảng 33.264 m² mặt bằng. Sảnh chờ ở dưới; sân ga ở tầng 18 m trên nền sảnh. Mái vòm, bốn tháp đồng hồ, quầy vé, bảng thông tin, ghế, hành lang, lan can, 49 cụm cột và dầm giằng chịu lực.
- Hai ray chính chạy liên tục qua giữa nhà ga, tâm hai ray ở X cục bộ ±9 m. Hai sân ga đón khách ở X ±18 m. Sáu đường đỗ riêng ở X ±30/48/66 m, khoảng cách đủ cho thân tàu.
- Bộ khảo sát chọn đoạn khô, ít dốc, tránh công trình và các ga trên cùng hành lang. Có thể nắn song song cả hai ray theo đường cong bậc năm; vùng giữa dài 250 m bằng phẳng, hai đầu hạ dần trong phạm vi 650 m tính từ tâm. Bản hiện tại dịch nhẹ 24 m để đặt ga trên đất khô. Sông và lòng sông được giữ nguyên vì không cần sửa dòng chảy.
- Ray được cập nhật trước khi tính khoảng cách, tư thế, tốc độ và dựng mesh; không đặt một đường ray trang trí tách rời luồng tàu.
- Sàn có bốn giếng thang thật; collision không bịt kín cabin. Nền có bệ tiếp đất và các lối vào dốc nhẹ. Sàn/trần, cột, tường, đồ đạc và thân tàu dự bị có va chạm; mái vòm chặn xuyên khi bay. Camera tránh cấu trúc.
- Mô hình ga nhỏ cũ được ẩn và loại khỏi collision, camera và danh sách bật/tắt theo đồ họa. Ga mới được giữ khỏi quái và cửa hang bằng vùng bảo lưu công trình.
- Kiến trúc có 2.876 đối tượng nguồn, 64.648 tam giác, gộp còn 10 nhóm vật liệu. Tàu dự bị dùng hình học Blender cũ và được gộp theo vật liệu từng đoàn; không thêm 24 bộ hoạt ảnh. Công trình ẩn ở xa, chỉ có hai đèn bổ sung không đổ bóng. Không cam kết 60 FPS trên mọi máy.

## Nguồn để tiếp tục chỉnh sửa

- `Assets/Art/Blender/Environments/GrandLunarTerminal.blend`: cảnh Blender có kiến trúc và sáu tàu tham chiếu đúng màu. Collection tàu tham chiếu không bị xuất trùng vào game.
- `tools/build_grand_terminal.py`: dựng lại và xuất nguồn.
- `demo/features/railway/data/grand-terminal.js`: hình học gộp, vật liệu và hộp collision.
- `demo/features/railway/grand-terminal.js`: khảo sát, nắn ray, ga, thang máy, tàu đỗ, camera và vật lý.
- Các hook nhỏ ở `moon-railway.js`, `station-mobility.js`, `realm-transit-update.js`, `surface-sync.js`, `construction-zones.js`, `lunar-surface-finish.js`, `graphics-quality.js`, boot manifest và core runtime. Bản nguồn initializer `tools/runtime-source.js` cũng được cập nhật.

## Tạo lại và kiểm thử

```powershell
E:/blender.exe -b --python tools/build_grand_terminal.py
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
node tools/tests/build_progression_suite.cjs
$env:NATIVE_VERIFY_HIDE='1'
$env:NATIVE_VERIFY_SCRIPT='.runtime/progression-update/combined.browser.js'
$env:NATIVE_VERIFY_OUTPUT='.runtime/grand-terminal/final'
$env:NATIVE_VERIFY_SEED_FILE='.runtime/workshop-update/seed.json'
$env:NATIVE_VERIFY_PORT='18917'
$env:NATIVE_VERIFY_DEBUG_PORT='19477'
node tools/desktop/verify_native.js
python tools/desktop/verify_exe.py
```

Kiểm thử native sử dụng profile và save riêng trong `.runtime`, không thay bản lưu người chơi ở `%LOCALAPPDATA%\Tsuventure\Saves\progress.json`. Mỗi lần chạy lại nên chọn cặp cổng thử chưa bị một WebView2 thử cũ giữ.

Bằng chứng: `.runtime/grand-terminal/final/`, `.runtime/grand-terminal/art-report.json`, `.runtime/grand-terminal/before.zip`, báo cáo đóng gói `demo/verification/desktop/exe-report.json`. Báo cáo dọn bản dựng thử: `docs/grand-terminal-cleanup.json`.

## Kết quả bàn giao

- Hồi quy native385/385; bản EXE giao cuối76/76 kiểm tra riêng; Blender16/16; hình học hang34/34; đóng gói23/23. Không lỗi JavaScript.
- Đã bỏ thêm bốn dải inlay trang trí qua giếng thang sau lượt hồi quy, rồi kiểm chứng lại hình học Blender và bản EXE giao cuối.
- Bundle `668073cb43e6ad5a9b157c49`;247 tài nguyên runtime; SHA-256 `e65fa04ad424b588e5f09fe52105a5f4f8d667e3bf3f622412d3d736cddc8c7e`.
- Dọn50mục tạo lại được trong `.runtime`, tổng9.489.253.018bytes; giữ báo cáo, ảnh, mã nguồn, Blender, SDK và save thật. Chi tiết trong `grand-terminal-cleanup.json`.

## Đèn, nhân viên và TV — 06/11/2026

- Tên chính thức là **Bến Xe Lửa Tsukiezz**. Biển mặt tiền, tên điểm dừng, bản đồ, menu Địa điểm, bảng tàu và thang máy đều dùng tên này. Vẫn dùng mã ga và vị trí cũ; không thêm ga hoặc đổi hành trình.
- Có **14 nhân viên trung lập**: hai hướng dẫn viên tại cửa, bốn nhân viên quầy vé, bốn hướng dẫn sân ga, hai kỹ thuật viên và hai rô-bốt phục vụ. Mẫu nhân vật Blender có đồng phục, thẻ tên, mũ và sáu khớp cử động. Nhân viên nhìn/chào người chơi khi đến gần, làm việc tại quầy hoặc đi tuần trong lối trống. Họ có vùng va chạm; không thêm tương tác E hoặc phần thưởng không liên quan. Việc lên tàu vẫn dùng E và một xu như trước.
- **14 TV hai mặt**, dùng chung hai texture để giảm chi phí. Mười màn hình giờ tàu cập nhật trạng thái sáu đoàn mỗi giây, hiển thị dừng đón khách, đếm ngược khi đang dừng và yêu cầu dừng. Thời gian đến khi tàu đang chạy là ước tính theo khoảng cách, tốc độ hành trình và thời gian đang dừng. Bốn TV còn lại chiếu kênh vũ trụ hoạt họa. Chú thích TV hỗ trợ Việt/Anh/Pháp/Tây Ban Nha; tên thương hiệu giữ nguyên.
- Đèn chùm trăng lưỡi liềm, tinh thể treo, đèn hắt trên cột, vệt đèn dẫn hướng, viền mái vòm và hai đèn ấm bổ sung không đổ bóng. Không thêm hiệu ứng nhấp nháy mạnh. Khung TV có thanh treo, va chạm và chặn camera.
- Vật liệu nhân viên dùng màu đỉnh, sáu phần chuyển động gần người chơi, một mesh gộp khi xa trên78m, ẩn trên240m. TV hoạt họa cập nhật8FPS ở mức Mượt,15FPS ở các mức khác; không nhân bản texture cho từng màn hình. Không thay cài đặt đồ họa toàn bản đồ.
- Nguồn mới: `Assets/Art/Blender/Environments/TsukiezzTerminalLife.blend`, `tools/build_terminal_life.py`, `demo/features/railway/data/terminal-life.js`, `demo/features/railway/terminal-life.js`. Nguồn studio có3mẫu nhân viên, đèn và vỏ TV:1.205đối tượng,45.572tam giác duy nhất; kiến trúc chính sau đổi chữ là66.808tam giác.
- Kiểm tra mô hình bằng `E:/blender.exe -b --python tools/verify_terminal_life_blender.py`; cảnh chính bằng `tools/verify_grand_terminal_blender.py`. Kiểm thử native `tools/tests/terminal_life.browser.js` đã ghép vào `tools/tests/build_progression_suite.cjs`.
- Bằng chứng và snapshot trước sửa trong `.runtime/terminal-life/`. Cách chơi: đóng EXE cũ, mở `Tsuventure.exe` → CHƠI → Địa điểm → **Bến Xe Lửa Tsukiezz · Tầng trệt**.

Bản cuối đợt nhân viên/TV: **401/401 native,31/31 Blender,23/23 đóng gói**;0 lỗi JavaScript. Bundle `530720aaee8074bd3a388803`,SHA-256 `2b0d762f4c44678439e4f6a58f0f5efac1b649309decf971fcd679e427af7860`. Bằng chứng `.runtime/terminal-life/final-checks.json`; ảnh `final/tsukiezz-entrance.png`, `tsukiezz-living-hall.png`, `tsukiezz-staff.png`, `tsukiezz-television.png`.
