# Hang Tà Thần

Chọn **Địa điểm → Hang Tà Thần** hoặc mở `http://127.0.0.1:8765/?cavern=1`.
Hai cận vệ đứng hai bên cửa ở gần `(125, -102)`. Nhấn **E** để nghe cảnh báo.
Đi về phía vòm đá và theo 184 bậc xuống hang. Cùng đường đó dẫn trở ra mặt đất.

Mê cung đá mặt trăng rộng 210 × 210 m, gồm 441 ô thông nhau, nhiều ngõ cụt và
đường vòng. Sàn nằm ở cao độ -44 m; toàn bộ trần mê cung ở dưới mặt đất.
Tường, trần, cột và rương đều có va chạm. Mặt đất phía trên vẫn đi lại bình thường.
Phòng Kim Cương rộng 30 × 30 m nằm ở tâm, có cột, các cụm kim cương và rương
niêm phong. Rương chưa cấp vật phẩm hoặc tiền, chờ nội dung kho báu tiếp theo.

Hang **không có nguồn sáng**. Khi xuống sâu, lớp render riêng loại ánh trăng,
đèn nhân vật và hiệu ứng sáng của thế giới; bản đồ ngoài trời được ẩn.
Cảnh báo kỹ năng qua chữ và âm thanh vẫn hoạt động. Khi ra khỏi hang, camera,
ánh sáng thế giới và bản đồ được phục hồi. Cánh pha lê tự ngừng bay khi vào hang.

| Quái vật | Máu | Đòn thường | Kỹ năng riêng |
| --- | ---: | --- | --- |
| Giun Đá Khổng Lồ | 5200 | Cắn 18 sát thương khi lộ ra | **Địa Chấn Trồi Lên**: đá rung 1,8 giây tại vị trí đã nhắm; 46 sát thương trong bán kính 4,2 m và đẩy lùi. Giun lộ ra 4 giây rồi chui xuống, hồi chiêu 12 giây. |
| Chiến Binh Bị Nguyền Rủa | 1800 mỗi cá thể | Chém 14 sát thương, chuẩn bị 0,65 giây | **Ấn Xích Hồn**: niệm 1,25 giây, bắn ấn gây 28 sát thương và làm chậm 50% trong 4 giây; hồi chiêu 11 giây. Vách đá chặn được phép. |

Giun tuần tra ngẫu nhiên dưới đá, hoàn toàn ẩn và không nhận sát thương khi
đang đào. Chỉ đánh được khi nó trồi lên. Bốn chiến binh tuần tra các hành lang,
tìm đường theo các lối mở để truy đuổi; không xuyên tường. Hạ quái cập nhật
thư viện; hai loại quái và cận vệ có ảnh mô hình thật trong thư viện **B**.
Khi gục ngã, người chơi được đưa về cạnh hai cận vệ và xóa hiệu ứng làm chậm.

Nguồn Blender: `Assets/Art/Blender/Environments/EvilGodCavern.blend`.
Bộ dựng: `tools/build_evil_cavern.py`. Dữ liệu xuất:
`demo/features/cavern/data/evil-cavern.js`. Hành vi, vật lý và bóng tối:
`demo/features/cavern/evil-cavern.js`.

Kiểm tra: `node tools/tests/verify_evil_cavern.js`. Báo cáo và ảnh trong
`demo/verification/`. Ảnh `evil-cavern-diagnostic-cutaway.png` là bản kiểm tra
cắt mái có ánh sáng studio riêng; game thực tế vẫn tối hoàn toàn.
