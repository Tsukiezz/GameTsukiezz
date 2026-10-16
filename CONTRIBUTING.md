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

## ⚠️ 3. Nguyên Tắc Làm Việc Với Unity & Git

1. **Luôn giữ file `.meta` song hành:** Mỗi khi thêm asset (ảnh, script, prefab), Unity tạo ra một file `.meta` tương ứng. **Bắt buộc commit kèm file `.meta`** để Unity không làm hỏng GUID của asset.
2. **Hạn chế sửa chung một Scene:** Scene trong Unity dễ bị xung đột (conflict) khi merge. Hãy phân chia màn chơi thành các **Prefab**, mỗi người chỉnh sửa Prefab riêng của mình.
3. **Không bao giờ commit thư mục `Library/` hay `Temp/`:** Đảm bảo `.gitignore` luôn hoạt động chính xác.
4. **Sử dụng Git LFS:** Với các file đồ họa dung lượng lớn (PSD, FBX, WAV), hãy để Git LFS quản lý để tránh vượt hạn ngạch của GitHub.
