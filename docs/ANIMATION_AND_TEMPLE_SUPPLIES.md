# Chuyển động, rồng bay và vật phẩm đền trung tâm

## Cách dùng

- Giữ chuột phải và kéo, hoặc kéo trên màn hình cảm ứng để nhìn quanh.
- Nhân vật tăng tốc, giảm tốc và quay theo cung ngắn nhất; đổi hướng không xoay giật tức thì.
- Kiếm dung nham đi theo tay phải khi vung. Đèn pin theo tay trái, hướng chiếu chuyển mềm theo góc nhìn.
- Thuốc tiên và băng gạc nằm trên **8 bệ**, tổng cộng **24 cụm** quanh sân đền trung tâm.
- **E** nhặt; **I / Balo → Sử dụng**. Mỗi cụm thuốc tiên có 3 chai, mỗi cụm băng gạc có 5 cuộn.
- Thuốc tiên giảm sương, làm sáng xung quanh trong **180 giây thực**, kể cả thời gian mở balo hoặc tắt game.
  Không cộng dồn thời hạn. Hiệu ứng, số lượng và thời hạn xuất hiện lại được lưu trên thiết bị.
- Băng gạc hồi **20 máu**, không vượt máu tối đa; không tiêu hao khi đã đầy máu, không hồi giáp.
- Vật phẩm ở đền xuất hiện lại sau **60 giây** kể từ khi nhặt.

## Rồng Chiến Tranh

Rồng vẫn có 20.000 HP, đòn cào, phun dung nham và cầu lửa.
Rồng có thể cất cánh, bay tuần tra, dừng để tấn công từ trên không và hạ cánh về vùng đất an toàn.
Đường bay và độ cao bị giới hạn bên trong lòng núi lửa, không truy đuổi người chơi ra ngoài map.
Những đòn phun từ trên không dùng hướng chiếu ba chiều, có thể trúng người ở dưới đất.
Khi bị đánh bại trên không, rồng rơi xuống và mất va chạm.

## Nguồn và kiểm tra

- `demo/features/characters/hero-motion.js`: vận tốc, quay người, góc nhìn, điểm cầm vật phẩm và lớp hiển thị trong hang.
- `demo/features/characters/hero-animation.js`: dáng đứng, đi, chạy, nhảy, bơi, ngồi và đánh có chuyển tiếp theo thời gian.
- `demo/features/inventory/temple-supplies.js`: đồ tiếp tế, balo, hồi máu, ánh sáng và thời hạn thực.
- `demo/features/volcano/dragon-flight.js`: cất/hạ cánh, đường bay giới hạn và đồng bộ va chạm.

Chạy `node tools/tests/verify_pending_features.js` để kiểm tra luồng thực,
ảnh render trong hang, cảm ứng, tải lại, đồ cầm tay và các đòn từ trên không.
`node tools/tests/verify_hero_animation.js` kiểm tra bốn nhân vật ở các bước thời gian tương ứng 15/30/60/144 FPS.
Các bộ kiểm tra này mặc định lưu ảnh/báo cáo trong thư mục tạm ngoài dự án;
có thể đặt `GAME_VERIFY_OUTPUT` để chọn nơi lưu khác.
