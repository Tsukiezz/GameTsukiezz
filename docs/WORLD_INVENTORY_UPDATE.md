# Cập nhật 03/11/2026

## Cách dùng

- Đóng/mở lại `Tsuventure.exe` để tải bản mới.
- Trong game, nhấn **1** để đổi góc nhìn thứ nhất / thứ ba. Có nút
  **1 · Góc nhìn** trên thanh công cụ. Nhập số trong ô văn bản hoặc mở bảng
  sẽ không đổi camera. Góc nhìn riêng trên tàu vẫn do hệ thống tàu điều khiển.
- Mở **Cài đặt → CODE**, nhập **Tsukiezz**. Bản quà mới nâng mỗi loại vật phẩm
  hiện có lên ít nhất **9999**, gồm vật liệu, đồ ăn, thuốc, trang bị, cổ vật,
  bản đồ, hạt đậu, mảnh hư không và năm loại huân chương.
- Người từng nhận mã cũ có thể nhận thêm bản quà đầy đủ một lần. Không hạ
  số lượng nếu người chơi đang có hơn 9999. Sau khi dùng vật phẩm, tải lại
  game giữ số lượng đã dùng; không tự cấp lại vô hạn.
- Cánh Pha Lê nay nằm trong rương cạnh Đền Trung Tâm. Quyền sở hữu/trang bị
  đã lưu trước đó vẫn dùng được.

## Nội dung

Lâu đài hoàng gia được bỏ khỏi cảnh, va chạm, cầu dốc, các tầng/hầm, điểm
dịch chuyển, mục NPC và vùng bảo hộ công trình. Ga cũ được đổi tên thành
Đồng Nguyệt Quang, giữ mạng ray. Chỉ số nhật ký các địa điểm khác được giữ
ổn định; mục lâu đài cũ được đánh dấu nghỉ dùng và ẩn khỏi thư viện.
Các bản thiết kế Blender cũ được giữ làm nguồn, không được dựng trong game.

15 mục kho từng dùng emoji/ký hiệu nay có ảnh 3D phong cách hoạt họa xuất
bằng Blender: gỗ, khoáng sản, xu, thịt, uranium, sắt, cao su, silicon,
bánh quy, đèn pin, cổ vật, bản đồ, hạt đậu, thuyền và hợp kim thu hồi.
Ảnh nền trong suốt 256 × 256; chi tiết vật phẩm có hiệu ứng nổi nhẹ.
Nguồn sửa được: `Assets/Art/Blender/Inventory/InventoryItemStudio.blend`;
script tái dựng: `tools/build_inventory_icons.py`.

Huân chương tặng từ CODE có số lượng riêng trong kho, không tự hoàn thành
năm trận đấu trường. Mảnh hư không tặng cũng không sửa nhật ký vị trí nhặt
chín mảnh ngoài thế giới. Các vật phẩm có sẵn cơ chế sử dụng vẫn dùng cơ chế cũ.

## Kiểm tra

- `tools/tests/verify_world_inventory_sources.py`: cú pháp các file sửa,
  tài nguyên HTML/cache key, nguồn Blender và 15 PNG có alpha.
- `tools/tests/verify_world_inventory_update.js`: Chrome/hồ sơ riêng,
  khởi tạo toàn bộ game, khu đất lâu đài cũ, camera/phím/nút/UI, nâng cấp
  mã đã nhận, số lượng kho thật, ảnh vật phẩm, đổi skin và lưu/tải lại.
- `tools/desktop/verify_exe.py`: gói EXE độc lập và mã băm tài nguyên.

Bản sao trước sửa: `.runtime/world-inventory-update/source-before.zip`,
`Tsuventure.before.exe`, `desktop-build.before.json` trong cùng thư mục.
Báo cáo kiểm tra nằm tại `.runtime/world-inventory-update/`.

Kết quả: 339 kiểm tra nguồn/tài nguyên đạt; 83 kiểm tra trong Chrome đạt,
33 mục kho đều có ảnh, trong đó 15 ảnh mới từ Blender. Kiểm tra tải lại
giữ sắt ở 9994 sau khi dùng 5, giữ các số lượng còn lại và tiến trình đấu
trường. Không ghi nhận lỗi JavaScript hoặc lỗi tải tài nguyên. Blender mở
lại nguồn thành công, xác nhận 15 nhóm mẫu có track hoạt ảnh.
EXE cuối đạt 17/17 kiểm tra, bao gồm đối chiếu đủ 203 tài nguyên đóng gói.
