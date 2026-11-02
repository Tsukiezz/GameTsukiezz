# 🛠️ Quy Trình Đóng Góp Cho Dự Án Game Tsukiezz

Cảm ơn bạn đã tham gia đóng góp cho dự án **Tsukiezz: Echoes of the Moonlit Realm**! Dưới đây là các hướng dẫn giúp quy trình làm việc trên GitHub đồng bộ và hiệu quả.

---

## 🌳 1. Chiến Lược Nhánh (Branching Strategy)

Chúng tôi áp dụng mô hình Git Flow rút gọn:

* **`main`**: Nhánh ổn định, chứa các phiên bản có thể chạy mượt mà (Production/Playable Demo).
* **`develop`**: Nhánh tích hợp chính để ghép nối các tính năng trước khi đóng gói bản phát hành.
* **`feature/<ten-tinh-nang>`**: Tạo từ `develop` để phát triển cơ chế mới (ví dụ: `feature/moon-phase-puzzle`).
* **`fix/<ten-loi>`**: Tạo để sửa lỗi phát sinh.

---

## 📌 2. Quy Ước Commit (Conventional Commits)

Để lịch sử git rõ ràng và dễ theo dõi, vui lòng viết commit message theo cấu trúc:

```
<type>: <mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>
```

Các `<type>` được khuyến nghị:
* `feat`: Thêm tính năng, cơ chế gameplay mới.
* `story`: Thêm đoạn hội thoại, nhiệm vụ, NPC hoặc cốt truyện mới.
* `fix`: Sửa lỗi logic, hiển thị, va chạm.
* `art`: Thêm ảnh sprite, model, animation, hiệu ứng ánh sáng.
* `audio`: Thêm nhạc nền BGM, âm thanh SFX.
* `refactor`: Tối ưu hoặc cấu trúc lại mã nguồn C# mà không đổi logic.
* `docs`: Cập nhật tài liệu, README.

---

## 3. Nguyên tắc làm việc với game trình duyệt và Blender

1. **Bản chơi chính ở `demo/`:** sửa các mô-đun trong `demo/features/`, giữ đồng bộ hình học, va chạm và địa hình. Bộ khung Unity cũ đã được dọn.
2. **Kiểm tra nguồn Blender trước khi ghi đè:** các nguồn từng vùng cùng thuộc map hiện tại; bản ghép mới nhất được ghi trong README.
3. **Không commit cache hoặc báo cáo sinh tự động:** chạy `python tools/refresh_web_assets.py` sau khi sửa JS/CSS và kiểm tra bằng `node tools/tests/verify_current_map.js`.
4. **Sử dụng Git LFS:** Với các file đồ họa dung lượng lớn (PSD, FBX, WAV), hãy để Git LFS quản lý để tránh vượt hạn ngạch của GitHub.
