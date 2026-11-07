# Tên lửa TSU-07 tại Trụ Sở Công Nghệ — 03/11/2026

Tên lửa trang trí cũ được thay bằng model Blender **TSU-07 — tàu thám hiểm mặt trăng bị hư hỏng**. Giữ vai trò xác tàu trang trí, không thêm tương tác E hoặc khả năng bay giả.

Model có vỏ trắng–xanh và viền kim loại vàng, đăng ký TSU-07, vết cháy, mũi tách rời, khoang vỡ lộ sườn và dây dẫn, ba động cơ có miệng loe/vòng làm mát, cánh cong, cửa kỹ thuật, giá đỡ và mảnh vỏ rơi. Đèn trạng thái nhỏ dùng emissive nhẹ; không thêm nguồn sáng động.

- Nguồn sửa: `Assets/Art/Blender/Props/RuinedTechnologyRocket.blend`.
- Builder: `tools/build_technology_rocket.py`.
- Runtime: `demo/features/technology/data/ruined-rocket.js`, nạp trước `technology-base.js` qua boot manifest.
- **143 thành phần Blender**, xuất gộp thành **12 mesh theo vật liệu**, **37.622 tam giác**. Geometry và normal được bake từ bevel, thành vỏ và ống dẫn; không phụ thuộc texture ngoài.
- Blender dùng Z-up, export sang Three.js Y-up bằng `(x,z,-y)`.
- Root game tại `(technologyBase.center.x + 17, level + 0.04, center.z + 59)`, nằm trên sân hiện có. Di chuyển sang bên phải để chừa hành lang chính vào cửa trạm. Không thay nền, sông hoặc mạng ray.
- Thay khối chặn cũ rộng 25 m bằng **8 collider thành phần** cho thân, động cơ, mũi, giá đỡ và cánh. Camera va chạm với mesh thật, không coi mảng cháy trên sân là tường.

## Dựng và chạy

```powershell
E:/blender.exe -b --python tools/build_technology_rocket.py
E:/blender.exe -b Assets/Art/Blender/Props/RuinedTechnologyRocket.blend --python tools/verify_technology_rocket_blender.py
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
$env:NATIVE_VERIFY_SCRIPT='tools/tests/technology_rocket.browser.js'
$env:NATIVE_VERIFY_OUTPUT='.runtime/technology-rocket/game'
node tools/desktop/verify_native.js
```

Mở lại `Tsuventure.exe`, chọn **Địa điểm → Trụ Sở Công Nghệ**. Cửa sổ game vẫn là ứng dụng WebView2 riêng, không mở Chrome. Blueprint và công thức chế tạo giữ nguyên.

Ảnh Blender, báo cáo nguồn và ảnh trong game ở `.runtime/technology-rocket/`. Collection `PreviewStudio_not_exported` chỉ để trình bày trong Blender, không đưa sàn studio/đèn/camera vào game. Blender trên máy dùng tên node tiếng Việt; builder tạo shader theo node type để vật liệu vẫn đúng màu. Bản sao trước sửa: `.runtime/technology-rocket/before.zip`.
