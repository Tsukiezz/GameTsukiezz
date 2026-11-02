# Đấu trường La Mã hiện tại — 31/10/2026

Đấu trường nằm ở X=-1520, Z=-1420, nền đất khoảng 11,88 m. Toàn bộ kiến trúc, va chạm, cầu thang và điểm tương tác được phóng lớn đồng bộ 2,5 lần. Nền được san trên mesh địa hình thật, có vùng chuyển tiếp; không đổi cao độ nước hay lòng sông.

Phía tây chỉ có **một hầm thú** khoảng 75×75 m, cao 23,75 m và hành lang rộng tới cửa sắt. Thú được giữ sau song, chỉ ra khi mở cửa; có cảnh báo trước đòn đánh, máu và phần thưởng. Phía đông là hành lang chiến binh mở sẵn dẫn thẳng vào sàn cát. Khán giả dùng mẫu cư dân Blender, có chuyển động cổ vũ và giới hạn số lượng theo mức đồ họa. Cầu thang khán đài có 200 bậc nhỏ. Va chạm kiến trúc có giới hạn chiều cao; người đang bay phía trên mái không bị tường vô hình chặn.

Ga Đấu Trường đã chuyển theo công trình, cách tâm khoảng 256 m và có đường bộ đến cửa chiến binh. Cả sáu đoàn tàu phục vụ ga. Dùng **G → Đấu Trường La Mã**, hoặc mở **http://127.0.0.1:8883/?arena=1**.

Nguồn chính:

- `demo/features/arena/roman-arena.js`: kiến trúc.
- `arena-warrior-tunnels.js`: hai hành lang với vai trò riêng.
- `arena-relocation.js`: di chuyển, san nền, đường ga, khán giả và quái thú.
- `Assets/Art/Blender/Environments/GrandRomanArenaCurrent.blend`: mô hình chỉnh sửa, texture đóng gói.
- `Assets/Art/Blender/Creatures/LunarCreatureStudio.blend`: 34 mẫu sinh vật và cư dân.

Để cập nhật Blender từ hình học thực của game, giữ Chrome kiểm thử bằng `GAME_VERIFY_KEEP_OPEN=1`, chạy `node tools/tests/inspect_void_runtime.js tools/tests/export_current_arena.browser.js`, lấy trường `design` trong `.runtime/void-inspection.json` lưu thành `.runtime/arena-current-scene.json`, rồi chạy `E:/blender.exe -b --python tools/build_current_arena_blender.py`. Ảnh xem trước lưu tại `demo/verification/creature-arena/arena-blender.png`.

Kiểm tra trình duyệt: đặt `GAME_VERIFY_SCRIPT=creature_arena.browser.js`, `GAME_VERIFY_OUTPUT=demo/verification/creature-arena`, chạy `node tools/tests/verify_railway_service.js`. Dùng `arena_station_walk.browser.js` để đi thử từ ga tới cửa; `railway_service.browser.js` kiểm tra mạng ray hiện tại; `E:/blender.exe -b --python tools/verify_creature_arena_blender.py` kiểm tra hai nguồn Blender. Báo cáo hiện tại nằm trong `demo/verification/creature-arena/`.

Cảnh đấu trường và bộ kiểm tra tọa độ cũ đã được thay thế. Bản trước thay đổi được giữ trong một tệp phục hồi, không dùng để chạy game.
