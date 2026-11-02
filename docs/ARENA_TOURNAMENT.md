# Đấu trường năm cấp

| Cấp | Đối thủ | HP | Kỹ năng | Thành tích |
|---|---|---:|---|---|
| 1 | Cự Thú Đấu Trường | 2.400 | Giậm đất | Huân Chương 1 |
| 2 | Ngựa Hắc Ám | 5.000 | Húc, làm chậm 55% trong 4 giây | Huân Chương 2 |
| 3 | Spinosaurus | 8.000 | Cắn, chảy máu 6 HP/s trong 6 giây | Huân Chương 3 |
| 4 | T-rex | 10.000 | Gầm: sát thương ×2, tốc độ ×1,7 trong 10 giây | Huân Chương 4 |
| MAX | Thần Zeus | 20.000 | Chém rộng 14 m, 7 vùng sét, hồi 10% HP tối đa mỗi 120 giây giao chiến | Huân Chương 5 |

Đối thủ sau vào hầm sau khi đối thủ trước chết. Chỉ có một đối thủ hiện hành. Mở cổng bằng E để bắt đầu; có báo trước đòn húc, cắn và phép. Đối thủ giữ trong sàn đấu, không đuổi xuyên công trình hay vào sông/ray. Nhân vật bay trong phạm vi kỹ năng vẫn có thể trúng đòn; bay trên mái vẫn đi qua công trình bình thường.

Huân chương là vật phẩm duy nhất trong balo, có chi tiết và ảnh. Chưa có năng lực vì người dùng sẽ cập nhật sau. `tsuventure_arena_tournament_v1` lưu số cấp hoàn thành và HP hiện tại, kiểm tra kiểu/giới hạn khi đọc; ghi ngay khi nhận sát thương hoặc thắng, cập nhật định kỳ khi giao chiến. Thành tích được suy ra từ cấp đã hoàn thành để không lệch kho đồ hay nhân đôi phần thưởng.

`arena-tournament.js` quản lý tiến độ, AI, hiệu ứng, HUD và hàng vật phẩm; `arena-relocation.js` quản lý nền/công trình, đường ga và khán giả. Dữ liệu Blender chung nằm ở `creatures/data/creature-studio.js`. Builder `tools/build_creature_studio.py` nạp `tools/creature_design_v2.py`; nguồn chỉnh sửa là `Assets/Art/Blender/Creatures/LunarCreatureStudio.blend`. `creature-refresh.js` thay thân các actor cũ, giữ root và va chạm để tránh sửa AI/địa hình ngoài phạm vi.

`arena_levels.browser.js` kiểm tra chuỗi thắng và kỹ năng trên profile cô lập; `arena_speed.browser.js` đo di chuyển thật bằng cùng AI; `arena_persistence.browser.js` kiểm tra khi mở lại cùng profile. Bộ kiểm tra lưu file trong `demo/verification/arena-levels/`. Không chạy test chiến thắng trong hồ sơ chơi của người dùng.
