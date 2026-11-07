# Hồ Nguyệt Ảnh, va chạm và lối vào ga

## Nước và sinh thái

`moonveil-palace.js` khoét lòng hồ xuống khoảng -22 m, mặt nước giữ ở y=1.2. Bờ dốc chuyển tiếp vào đảo và nền hiện tại; đáy kênh nối dần về đáy sông cũ. Thuyền, lặn và va chạm dùng địa hình đã khoét.

Hồ dùng cùng shader và đồng hồ gợn nước với `thermal-river.js`. Gợn tính bằng tọa độ thế giới. Hai lớp có mặt nạ bổ sung nhau để tránh vẽ chồng nước trong chỗ nối; màu bờ của sông giảm dần trước cửa hồ. Nước hồ được cắt theo bờ địa hình thay vì các ô vuông nguyên khối.

`aquatic-ecology.js` thêm các đàn thuộc sáu loài cá đã có trong thư viện quanh hồ. Dùng lại các pool render và giới hạn của từng mức đồ họa. Cá phân bố ở nhiều độ sâu, trên đáy và dưới mặt nước.

## Va chạm lâu đài

Mái, đá xây, khung, kính và sắt từ dữ liệu Blender được lập chỉ mục tam giác theo ô không gian. Kiểm tra ngang cắt tam giác theo chiều cao nhân vật, giữ cửa đi thực sự thông thoáng. Bậc thấp trong giới hạn bước chân vẫn đi được.

Giới hạn bay lên và hạ xuống lấy giao điểm với mặt thật, kể cả mái nghiêng. Bộ giải chuyển động gọi va chạm Nguyệt Ảnh cho cả hai chiều dọc. Những collider và cơ chế cổng có sẵn tiếp tục hoạt động.

## Thời tiết

Sự kiện sao chổi thêm một vòm sáng với các dải hồng, trắng và xanh lá chuyển động chậm. Hiệu ứng chỉ nằm trên trời, không gây sát thương, hòa vào/ra trong 5 giây và tắt hoàn toàn sau sự kiện. Giữ xác suất 15%, thời lượng sao chổi 6 phút và bầu trời/hành tinh nền.

## Ga tàu

- Nền gần ngang sân ga: dùng lối vào trực tiếp trên nền thật, không tạo đường dốc dài, cầu thang rời hoặc khung tay vịn thấp.
- Bỏ hai dải đường dẫn tự sinh ở ga chiều ngược.
- Hạ ga và đoạn tiếp cận an toàn; chỉ giữ neo cao ở đoạn có sông, địa hình gồ ghề, chướng ngại hoặc khúc cua núi phía tây. Tốc độ thay đổi độ cao vẫn qua bộ giải độ dốc và khoảng trống cho tàu.
- Ga thật sự cao tiếp tục dùng thang/cầu chuyển chiều hiện có. Đường mòn làng tận dụng khảo sát cũ và nối ngắn tới cửa ga thay đổi; cache đo địa hình có giới hạn bộ nhớ.

## Kiểm tra

`tools/tests/realm_repairs.browser.js` kiểm tra nước, độ sâu thật, cá, va chạm mái/tường, đi cầu thang, bay, sao chổi, mọi lối vào ga, độ dốc ray và đường mòn làng. Có thể kết hợp với `moonveil.browser.js` và chạy qua `tools/desktop/verify_native.js` bằng `NATIVE_VERIFY_SCRIPT`, `NATIVE_VERIFY_OUTPUT`. `NATIVE_VERIFY_HIDE=1` ẩn cửa sổ thử; dùng hồ sơ và bản lưu riêng.

Bản sao trước sửa: `.runtime/realm-repairs/before.zip`. Báo cáo/ảnh thực tế: `.runtime/realm-repairs/game/`. Cần xem kết quả cuối trong `CONVERSATION_HANDOFF.md` trước khi coi EXE là bản đã kiểm tra.
