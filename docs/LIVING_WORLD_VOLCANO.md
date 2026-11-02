# Thế giới sống và Thung Lũng Núi Lửa

Mở game ở `http://127.0.0.1:8765/`. Chọn **Địa điểm → Thung Lũng Núi Lửa**,
hoặc mở trực tiếp `http://127.0.0.1:8765/?volcano=1`.
Leo theo lối mòn tro vàng ở phía đông lên lòng núi lửa cao 72 m, qua lối đá hẹp tới đảo giữa dòng dung nham.
**E** để rút gươm; **I / Balo → Trang bị** để sử dụng.

- Rồng Chiến Tranh có **20.000 HP**, tuần tra quanh đảo; cào thường gây 24 sát thương.
- Phun dung nham có cảnh báo 1,8 giây, khóa hướng trước khi phun; né sang bên.
- Ba cầu lửa gây 42 sát thương mỗi lần trúng và áp dụng bỏng.
- Bỏng trừ trực tiếp 5 máu mỗi giây, kéo dài 6 giây; rời vùng nóng để tránh làm mới hiệu ứng.
- Chạm dòng dung nham ở độ cao mặt dung nham gây chết ngay, kể cả còn đầy giáp.
  Người chơi được hồi sinh tại lối vào, không bị kẹt dưới map.
- Khi người chơi ở trong thung lũng, mỗi 12 giây có **18% khả năng phun trào**.
  Có 3 giây cảnh báo, 5 giây phun trào, cột dung nham và các quả cầu nóng bắn ra từ miệng phun.
- Thanh Gươm Dung Nham gây 600 sát thương lên rồng trong tầm đánh. Quyền sở hữu và trang bị được lưu trên thiết bị.

Sinh thái mới gồm khoảng 7.500 cây/bụi/dương xỉ/hoa, phân bố ngẫu nhiên trên các vùng đất khô;
có cây lá rộng, thông, bụi, dương xỉ và ba màu hoa, bổ sung cho cỏ có sẵn.
144 sinh vật gồm bò tót, dê, nai, hươu, chó, mèo và bươm bướm được sinh ra mỗi lượt mở game.
Chúng đi lại trên mặt đất, tránh công trình, nước và núi lửa; những con xa người chơi được phân bố lại định kỳ.
Các loài mới và rồng xuất hiện trong thư viện khi gặp, với ảnh render từ chính mô hình trong game.

Đèn pin được dựng lại trong Blender với 39 chi tiết: vòng chống trượt, khung pin mặt trời,
tản nhiệt, nút nguồn, kẹp đai và vòng kim loại bảo vệ kính. Vẫn dùng **E → I → L**.

Nguồn Blender:

- `Assets/Art/Blender/Equipment/SolarFlashlight.blend`
- `Assets/Art/Blender/Environments/VolcanicValley.blend`
- Tái xuất bằng `tools/build_solar_flashlight.py` và `tools/build_volcanic_valley.py` trong Blender.

Nền thung lũng cao 72 m, mặt dung nham cao 66 m, vành núi cao tới khoảng 246 m. Vách dốc chặn việc đi thẳng lên núi; lối mòn có cọc chỉ dẫn hai bên. Địa hình núi lửa dùng cùng các tam giác cho hình ảnh và độ cao vật lý. Lớp mặt đất cũ được cắt
theo ranh giới vực, thay vì chỉ hạ đỉnh và để các tam giác xuyên qua. Các biên địa hình núi,
sông, núi lửa được đóng mép. Camera bị chặn trước mặt đất, kể cả dưới nước.
Cấu hình thấp giữ tầm nhìn địa hình để tránh công trình và núi bị cắt đột ngột.
Thực vật được gộp theo vùng và chỉ hiển thị trong khoảng cách phù hợp cấu hình.

Kiểm tra bằng `node tools/tests/verify_living_volcano.js`,
`node tools/tests/verify_solar_flashlight.js` và các bộ hồi quy hang, sông, thư viện.
Ảnh rà soát mười khu vực nằm trong `demo/verification/audit-*.png` (không đưa lên Git).
