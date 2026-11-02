# Rừng Ngập Mặn — Phế Tích Triều Mặn

Mở `http://127.0.0.1:8765/?mangrove=1` hoặc **Địa điểm → Rừng Ngập Mặn**.
Vùng hồ nối trực tiếp nhánh sông phía bắc, tâm tại (70, -825), rộng khoảng
460 × 250 m. Nước mặn màu ô liu đục che đáy, có sương dày khi lặn.

Đi từ bờ qua dốc gỗ ngắn rồi bơi qua hồ tới phế tích cột đá. Cầu xuyên hồ đã bỏ;
chỉ có lối lên ngắn ở mép phế tích. Thuyền dành cho lần phát triển tương lai.
Cây đước cao khoảng 40–85 m với rễ chống, rễ phụ và tán nhiều tầng.
Thân cây, rễ và cột đá chặn di chuyển. Lòng hồ sâu khoảng 35–45 m,
dùng đúng các tam giác Blender cho cả hình ảnh và độ cao vật lý.

## Cá Sấu Đầm Lầy

- Mô hình Blender dài khoảng 34 m, có giáp vảy, mắt vàng, nanh, bốn chân,
  đuôi và hàm dưới chuyển động độc lập.
- **10.000 HP**, ngụp lặn theo chu kỳ xuống gần 30 m, nổi lên và truy đuổi
  người đang bơi ở cả mặt nước lẫn dưới sâu.
- Vòng cam báo trước 1,15 giây; lao ngoạm gây 48 sát thương qua cơ chế
  giáp và giảm sát thương hiện có của nhân vật. Né vòng cam hoặc lên phế tích.
- Chuột trái/J để đánh trong tầm, có thể dùng phép của thỏ.
- Trạng thái đánh bại lưu trên trình duyệt; thư viện ghi nhận gặp/đánh bại
  và có ảnh render từ mô hình thật.

## Kho báu

Hồ có hơn 300 cá bơi, rùa lặn, cua dưới đáy và các cụm lá sen/hoa nổi.
Lá sen là cảnh quan, không phải mặt sàn để chạy qua hồ.

Thư viện (B) có năm mục sinh vật đầm lầy: cá, rùa, cua, lá sen và hoa sen.
Đến gần và nhìn thấy chúng để mở khóa mô tả cùng ảnh render từ mô hình Blender.
Cá, rùa và cua chìm dưới mặt nước đục chỉ được ghi nhận khi người chơi lặn.
Các mục đã gặp được lưu cùng tiến độ thư viện; hỗ trợ tiếng Việt và tiếng Anh.
Kiểm tra bằng `node tools/tests/verify_swamp_library.js` khi server local đang bật.

Rương giữa phế tích chứa **Mảnh Vỡ Cổ Đại**. Đến gần, nhấn **E**,
sau đó **I** để thấy trong balo. Vật phẩm lưu vĩnh viễn trên trình duyệt,
không nhặt trùng và chưa có hành động sử dụng/tiêu hao; dành cho hành trình sau.
Không thay đổi phần thưởng chưa xác định của rương Hang Tà Thần.

## Nguồn và tái dựng

- `Assets/Art/Blender/Environments/MangroveRealm.blend`: toàn cảnh riêng;
  giữ các cảnh có sẵn khi chạy builder trong Blender đang mở.
- `Assets/Art/Blender/Characters/SwampCrocodile.blend`: cá sấu riêng để chỉnh tiếp.
- `tools/build_mangrove_realm.py`: dựng cây, rễ, phế tích, cá sấu, cổ vật,
  lòng hồ và xuất cùng dữ liệu lưới cho game; chỉ quản lý scene/collection mangrove.
- `demo/features/mangrove/data/mangrove-assets.js`: bản xuất Blender.
- `demo/features/mangrove/mangrove-realm.js`: instancing cây, nước đục,
  cầu/dốc đi bộ, va chạm, chiến đấu, kho báu và lưu dữ liệu.

Sau khi xuất tài nguyên chạy `python tools/refresh_web_assets.py`.
Chạy `node tools/tests/verify_mangrove.js` khi server local đang bật.
Runner tạo profile Chrome tạm riêng, không chỉnh tiến độ trình duyệt người dùng;
báo cáo/ảnh mặc định tại `%TEMP%/tsuventure-mangrove-verification`.

Dữ liệu lưu riêng tại khóa `tsuventure_mangrove_v1`. Cùng quy tắc với các vật phẩm
khác: thay trình duyệt, địa chỉ host hoặc xóa localStorage sẽ không giữ tiến độ.
