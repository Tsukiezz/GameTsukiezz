# Dọn dự án — 27/10/2026

Theo yêu cầu chỉ giữ bản đồ hiện tại, đã xóa khỏi dự án **176 file, 378,10 MiB**.

## Đã kiểm tra và xóa

- 12 cảnh Blender ghép cũ về các phiên bản ray, sa mạc và trụ sở; giữ cảnh kiểm tra mới nhất `YinYangPyramid13Floors.blend`.
- Các backup `.blend1`, Python bytecode, ảnh và báo cáo kiểm tra đã được thay thế.
- Công cụ xuất cảnh cũ, chẩn đoán dùng một lần và bộ kiểm tra mê cung một tầng/công thức thuyền cũ.
- Bộ khung Unity chưa được bản game trình duyệt sử dụng: `Assets/Scripts/`, `Assets/Art/Models/`, `Packages/`, `ProjectSettings/`,
  công cụ xuất riêng sang Unity và workflow kiểm tra bộ khung này. Các thư mục placeholder rỗng cũng được dọn.

Danh sách chính xác, lý do và SHA-256 từng file ở [current-map-cleanup.json](current-map-cleanup.json).

## Giữ lại

- `demo/index.html` và toàn bộ `demo/features/`: **90 file runtime giữ nguyên SHA-256** trước/sau khi dọn.
- Các nguồn Blender, dữ liệu xuất, hình ảnh và bộ tạo từng vùng/nhân vật/vật phẩm của cùng map đang chơi.
  Các file này không phải các phiên bản map thay thế.
- Cảnh kiểm tra mới nhất `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`.
  Cảnh này chưa bao gồm mọi chi tiết của game; bản chơi chính vẫn ghép từ các mô-đun trong `demo/`.
- Công cụ kết nối Blender, máy chủ, bộ kiểm tra đang dùng, `.git`, giấy phép và file bàn giao.
- Báo cáo mới nhất trong `demo/verification/autumn-upgrade/`.

## Khôi phục khi cần

Trước khi xóa, mọi file đều được sao chép ra ngoài dự án và đối chiếu SHA-256:

`%TEMP%/GameTsukiezz-current-map-20261027-151414-c669ea/`

`restore-manifest.json` trong thư mục đó ghi vị trí cũ và checksum. Chỉ cần sao chép file cần khôi phục về đúng đường dẫn tương đối.
Các tài liệu được viết lại cũng có bản trước chỉnh sửa trong `before-document-update/`.
Windows có thể dọn thư mục tạm; đây không phải nơi lưu trữ lâu dài.

## Xác minh

`node tools/tests/verify_current_map.js` kiểm tra HTTP của mọi file runtime, tải lại game thật trong Chrome,
theo dõi lỗi JavaScript/tài nguyên và xác nhận 13 tầng, ba đoàn tàu, cây lấy gỗ và art ninja hiện tại.
Kết quả ghi tại `demo/verification/autumn-upgrade/cleanup-smoke.json`.
Không thay đổi gameplay trong lần dọn này.
