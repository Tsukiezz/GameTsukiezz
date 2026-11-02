# Dọn sau cập nhật sinh vật và đấu trường — 31/10/2026

Đã xóa **432 file, 460,08 MiB** và dọn thư mục rỗng. Kiểm tra sau dọn: 134 tài nguyên web trả HTTP 200; các nguồn Blender hiện tại còn đủ.

Đã rà soát runtime trước khi lập danh sách xóa bản FBX Unity cũ, cảnh/công cụ đấu trường bị thay thế, báo cáo cũ, dữ liệu xuất tạm và cache. Nguồn Blender hiện tại, mesh JS, texture, builders/tests và log server được giữ. Bản phục hồi: `.runtime/arena-creatures-rollback-20261031.zip`.

Manifest `docs/cleanup-creature-arena-20261031.json` ghi từng đường dẫn, lý do, byte, SHA-256, cờ `applied` và danh sách `removed`. Script `tools/cleanup_creature_arena.py` kiểm tra đường dẫn trong dự án và hash trước khi xóa; chỉ áp dụng sau `demo/verification/creature-arena/final-checks.json` đạt. Không dùng `git clean`, không sửa Git metadata. Lịch sử dọn trước đó: `PROJECT_CLEANUP.md`.
