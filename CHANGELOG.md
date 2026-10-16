# 📜 Changelog - Game Tsukiezz

Mọi cập nhật đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này.

## [v0.1.0] - 2026-10-16

### 🎉 Khởi tạo dự án
- Chuyển đổi toàn bộ dự án sang Unity C#.
- Thiết lập kiến trúc mã nguồn C# phiêu lưu cốt truyện:
  - `GameManager`: Quản lý GameState và cờ cốt truyện phân nhánh (`StoryFlags`).
  - `DialogueManager` & `DialogueNode`: Hệ thống hội thoại gõ chữ Typewriter, rẽ nhánh với các lựa chọn (`DialogueChoice`).
  - `PlayerController` & `PlayerInteraction`: Di chuyển và tự động phát hiện đối tượng tương tác phím `[E]`.
  - `QuestManager` & `QuestData`: Hệ thống nhiệm vụ cốt truyện.
  - `InventoryManager` & `ItemData`: Quản lý túi đồ và cổ vật mở khóa.
  - `LockedDoor` & `PickupItem`: Cơ chế giải đố môi trường và thu thập vật phẩm.
  - `AdventureHUD`: HUD hiển thị phím bấm và thông báo.
- Thiết lập môi trường quản lý GitHub chuyên nghiệp:
  - Cấu hình `.gitignore` chuẩn Unity loại bỏ hoàn toàn file tạm.
  - Cấu hình `.gitattributes` hỗ trợ Unity YAML merge driver và Git LFS.
  - GitHub Actions CI workflow kiểm tra tính toàn vẹn và C# scripts.
  - Mẫu Issue Template (Báo lỗi, Đề xuất cốt truyện) và Pull Request Template.
  - Hướng dẫn đóng góp `CONTRIBUTING.md`.
