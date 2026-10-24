# Núi Bạch Khuyết và kỹ năng quái vật

Vào **Địa điểm → Núi Bạch Khuyết**, hoặc mở `http://127.0.0.1:8765/?mountain=1` khi server đang chạy. Núi ở phía đông nam bản đồ, tâm `(610, 610)`, rộng 600 m; đỉnh chính cao 202 m. Đường đất xoắn và cọc tinh thể dẫn từ chân núi lên cổng đá trên đỉnh. Các đỉnh phụ, đá, cỏ và quặng nằm ngoài lòng đường. Nhấn **E** bên quặng để thu thập, **I** xem lượng vàng nguyệt và tinh thể trong balo. Khoáng sản được lưu trên trình duyệt, mỗi điểm chỉ thu thập một lần.

Kỹ năng đặc biệt có cảnh báo và hồi chiêu riêng, giữ nguyên đòn đánh thường:

| Quái vật | Kỹ năng | Sát thương gốc | Thời gian |
| --- | --- | --- | --- |
| Loch Ness | Bắn cầu năng lượng theo vị trí đã nhắm; có thể né | 78 | Niệm 1,4 giây; hồi 12 giây |
| Cá sấu không gian | Ngoạm giữ rồi nhả về vị trí trước khi bị ngoạm | 68, một lần | Báo trước 1,4 giây; giữ 1,3 giây; hồi 12 giây |
| Thần Rừng | Gọi tối đa 4 sinh linh cây mọc từ đất, đuổi và đánh người chơi | 12 mỗi đòn sinh linh | Trồi lên 1,4 giây; tồn tại tối đa 17 giây; hồi 16 giây |
| Hổ răng kiếm không gian | Cắn xé gây chảy máu | 40 và 4 máu mỗi giây trong 8 giây | Báo trước 1,25 giây; hồi 13 giây |

Sát thương chịu điều chỉnh theo nhân vật; giáp hấp thụ đòn trực tiếp, chảy máu trừ máu. Hổ có 3.600 máu, đánh thường 18 sát thương và di chuyển giữa nhiều khu vực núi. Sinh linh cây có 190 máu và có thể bị đánh hạ. Cầu hồ vẫn an toàn. Mở menu, về trang chủ hoặc dịch chuyển sẽ hủy giữ người và các hiệu ứng đặc biệt để tránh kẹt nhân vật.

Nguồn Blender: `Assets/Art/Blender/Environments/BachKhuyet.blend`. Bộ dựng: `tools/build_bach_khuyet.py`, chạy trong Blender qua MCP. Chỉ thay collection `BachKhuyet`, giữ các collection khác. Mesh địa hình, màu đỉnh, mẫu trang trí, đường mòn và các khớp hổ được xuất sang `demo/features/mountain/data/bach-khuyet.js`. Game và Blender sử dụng cùng các tam giác; nội suy độ cao dùng đúng đường chéo của mesh.

Kiểm tra trình duyệt: chạy server trong `demo` trên cổng 8765, sau đó `node tools/tests/verify_mountain_skills.js`. Báo cáo và ảnh ở `demo/verification/`. Hồi quy hồ: `node tools/tests/verify_lake_monsters.js`.
