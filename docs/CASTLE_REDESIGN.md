# Lâu đài Nguyệt Quang — bản thiết kế 4

Cửa chính là hai cánh gỗ chạm vàng, phù hiệu mặt trăng bạc và đá phát sáng.
Khung vòm nằm trước hai cánh; đã bỏ đường hầm đá che mất mặt cửa. Nhấn E để mở;
hai cánh trượt ra sau trụ tường, để lại một lối rộng gần bảy mét.

Mỗi tầng có hành lang chính rộng 10m và hai dãy phòng chức năng, thay cho sơ đồ
mê cung ngẫu nhiên. Tổng cộng 49 vùng phòng/hành lang, tính cả bốn gian mật thất.
Bàn tiệc, giường, ghế và tủ được đặt theo vùng; bàn/giáp nguyên mẫu trùng với
nội thất Blender đã được gỡ bỏ. Thang gác mái nằm trong kho lưu trữ đông bắc,
được che bởi vách sách và lối vào lệch, vẫn đi lên/xuống theo bậc thật.

Các buồng giam có cửa kiểm tra; không còn ô sàn đi được bị nhốt sau song sắt.
Va chạm dùng lưới không gian 4m: chỉ xét các vật thể gần nhân vật, đồng thời luôn
xét cửa đang chuyển động. Kỳ lân cũng gộp chi tiết theo vật liệu để giảm lệnh vẽ.

Khi nhân vật vừa chạy vừa nhảy lên dốc, vị trí ngang mới có thể đưa mặt cầu lên
cao hơn vị trí bàn chân ở khung trước. Điều kiện tiếp đất mới cho phép khoảng
chênh trong giới hạn bước chân, tránh bỏ lỡ mặt cầu và rơi xuyên xuống dưới.

Kỳ lân **Nguyệt Quang** được dựng thủ công trong Blender: thân trắng ngọc,
bờm và đuôi xanh tím, sừng xoắn, móng vàng. Gặp nó bên phải sảnh vào lâu đài và
nhấn E để chào. Nguồn riêng: `Assets/Art/Blender/Characters/LunarUnicorn.blend`;
nguồn kiến trúc và nội thất: `Assets/Art/Blender/Environments/CastleExtension.blend`.

Bộ kiểm thử mới chạy nhảy cả hai chiều dốc ở 15/30/60/144 FPS, ba tốc độ và
ba vị trí ngang; so sánh chỉ mục va chạm với quét toàn bộ, rồi kiểm tra nối phòng,
góc hầm, cửa và kỳ lân. Những lượt này không chứng minh mọi máy đều đạt cùng FPS.

Phiên kiểm tra hoàn tất: 88 thiết kế/cầu nhảy, 162 lâu đài/vật lý, 16 phòng/camera,
14 nội thất, 12 tầng hầm, 8 an toàn sàn/cửa và 10 đồ họa đều đạt (310 tổng cộng).
Báo cáo JSON và ảnh thực tế nằm tại `demo/verification/`. Chỉ mục va chạm được
so sánh với cách quét toàn bộ trên cùng tập vị trí để phát hiện vật cản bị bỏ sót.

Thư mục được chia rõ: `demo/` chạy game, `Assets/` giữ nguồn 3D/Unity,
`tools/` tạo tài sản, `tools/tests/` kiểm thử, `docs/verification/` ghi chú.
