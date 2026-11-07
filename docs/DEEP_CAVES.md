# Hang mỏ liên vùng và sửa chuyển động

Cập nhật 06/11/2026.

## Chơi và vào hang

Mở `Tsuventure.exe`, đợi tải xong rồi CHƠI. Chọn **Địa điểm → Hang Mỏ Liên Vùng** hoặc tìm biểu tượng mỏ trên bản đồ M. Đi bộ theo dốc đá cuộn xuống, đi qua đường nối để vào mạng hang. **Không nhấn E để xuống hoặc lên, không chuyển vị trí.** Có thể đi tới cửa khác và đi bộ trở lên mặt đất.


**I → Vật phẩm hiếm → Đèn Pin Mặt Trời → Trang bị**, sau đó **L** bật/tắt. Thuốc Tiên Minh Quang trong mục Vật phẩm cho nhìn trong bóng tối **180 giây**, không cộng dồn thời gian. Ánh sáng nhìn đêm riêng của hang tắt khi hết hiệu lực. Đèn pin vẫn dùng độc lập; phần lớn hang tối nếu không có hiệu ứng hoặc nguồn sáng, một số nhánh có đuốc. Dơi là sinh vật cảnh quan hiền, được ghi nhận khi đến gần; mở thư viện B để xem ảnh model thật.

## Cấu trúc và vật lý

- 81 nút giao trải hơn 5 km, 102 đoạn nối chính uốn lượn, thêm 36 nhánh cụt. Mặt bằng hợp nhất gồm 10.974 ô đá nối liền, có nhiều đường vòng và điểm giao; không tạo các ống kín chắn ngang nhau ở giao lộ.
- Nền đá thay đổi khoảng y = −148 đến −130 m; trần thay đổi theo nền và có chỗ cao/thấp khác nhau. Nằm dưới cả sông, hồ và mê cung Hang Tà Thần. Không chỉnh lưới nước, đường ray hay địa hình phía trên để đào hệ hang.
- Lối rộng khoảng 20–60 m, tùy điểm uốn và ngã rẽ. Sàn có dốc, gò và hõm; vách đá uốn theo mặt bằng và phình/lõm theo chiều cao; mặt sàn, vách và trần đều có hình học. Chặn di chuyển qua đất ngoài đường đã đào và chặn bay xuyên trần. Camera được chặn trong lòng hang.
- Thêm đá nhô và nhũ đá ở rìa lối; vật cản đá có va chạm, không đặt lên vùng tới cửa mỏ. Sàn dùng nội suy tam giác 5m đúng với mesh, không dùng một mặt phẳng vô hình.
- Vách dựng từ biên chung của mạng ô; các ngã rẽ mở liền. Mặt đất an toàn và cơ chế hồi vị trí cũ được bỏ qua khi ở đúng tầng hang. Nước phía trên không làm nhân vật bơi, mất oxy hay bị đẩy lên mặt đất.
- Tách layer 3 khỏi bầu trời và ánh sáng mặt đất. Chỉ đèn pin cùng tối đa hai đuốc gần người chơi chiếu sáng. Chia đá thành cụm và ẩn cụm xa theo mức đồ họa; dơi dùng nhóm giới hạn 24 con gần người chơi.

## Khoáng vật và rương

Quặng vàng, kim cương, Krystal và Băng phiến có hàng riêng trong balo. Nhấn E ở cụm quặng để khai thác. Rương có tài nguyên thường ngẫu nhiên, xu vàng và khoáng vật. Quặng/rương lấy một lần, lưu độc lập trong `tsuventure_deep_caves_v1`; không đổi kho báu hoặc tiến độ mê cung cũ. CODE revision 5 bổ sung khoáng vật hang, giữ quy tắc duy nhất của đồ cũ.

## Các sửa khác trong cùng đợt

- Đèn pin mặt trời, cánh pha lê và mảnh vỡ cổ đại chuyển sang mục **Vật phẩm hiếm**; tổng 12 món trong nhóm này.
- Trái tim rừng dựng lại Blender thành lõi ngọc có rễ ôm và lá. Dơi có tai nhọn, màng cánh khía và hai phần cánh riêng để vỗ. Studio hiện 18 model; giữ art quái đã được duyệt.
- Năm quái đấu trường tăng kích thước, không tăng HP. Di chuyển có gia tốc, giảm tốc, xoay hướng mềm và thử hướng vòng quanh vật cản kiến trúc. Nhịp chân theo quãng đường thực, có pha chuẩn bị/đánh/hồi đòn; không tiếp tục bước chân khi đứng kẹt.
- Bàn sửa cho chọn 10–100%. Mỗi 10% của độ bền tối đa giá **10 sắt + 1 xu**. Với đồ đặc biệt bền 3500, 10% là 350; sửa hỏng hoàn toàn giá 100 sắt + 10 xu. Chỉ phục hồi phần còn thiếu; dưới 10% vẫn tính một lượt. Đồ sắt đã bị hủy không sửa lại được.
- Cầu thang/đường mòn Tây Nguyệt Sơn giữ 69 tuyến, bổ sung cột dày và ba thanh chắn, có va chạm ở mép. Giữ khoảng mở tại giao đường và chỗ qua ray. Không cho phép leo tắt vách núi trống.
- Hai lính lâu đài được chuyển vào phía trong hai lan can cầu, ở vị trí x = ±3,4 m, z = 71 m theo gốc lâu đài; không còn đứng sau lan can đá.

Đường dốc có bề ngang đi bộ 4,5m, mái vòm và các đoạn quanh co. Cửa được khoét nhỏ vào lớp nền bằng mặt nạ vật liệu; cổ miệng mỏ có vách đá nối kín tới địa hình. Tầng hang được đặt sâu khoảng140m để các dốc đi bộ có chiều dài hợp lý, vẫn cách xa mê cung cũ ở−44m và đáy sông. Kho báu dùng lưới ID cũ28m nên giữ470cụm quặng/186rương và các trạng thái đã lấy, dù phần lối đi thu hẹp xuống lưới20m.

Nguồn chính: `demo/features/cavern/cave-walkin.js`, `demo/features/cavern/underground-network.js`, `tools/build_survival_items.py`, `demo/features/arena/arena-tournament.js`, `demo/features/world/highland-trails.js`. Test: `tools/tests/deep_caves.browser.js`, ghép vào suite progression. Báo cáo/ảnh: `.runtime/cave-world-update/`. Backup: `before.zip` trong cùng thư mục.
