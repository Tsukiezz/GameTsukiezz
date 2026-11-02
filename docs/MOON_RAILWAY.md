# Đường sắt Nguyệt Hành

## Mạng ray chung dày, uốn lượn — 26/10/2026

Đặc tả hiện tại: ba tuyến **Đỏ, Xanh, Vàng** dùng chung đường ray; mỗi đoàn có một đầu
máy và ba toa. Tuyến chung uốn qua tám dải ngang và đi sâu vào các khu trong map,
khoảng **15,8 km**, thay cho bản chỉ chạy quanh rìa. Khoảng 59,5% điểm hành trình nằm
trong vùng nội địa. Tại ga có thể chọn chuyến gần nhất hoặc chọn màu tuyến muốn đón.

Tàu cùng chiều, giữ khoảng cách dọc tuyến tối thiểu 100 m, giảm tốc và chờ khi phía
trước bị chiếm; trước mỗi bước tiến còn kiểm tra khoảng cách không gian giữa cả bốn
phương tiện của mỗi đoàn. Không có yêu cầu thì tàu đi qua ga; có yêu cầu thì dừng 60 giây.
Giữ đi lại giữa ba toa, chọn ghế, camera trong toa và NPC lính chì hoàng gia.

Cả 10 ga hiện sát đất, có lối dốc thấp để đi bộ. Ray vùng bằng đặt trên nền đất đắp
liên tục; chỉ có cầu ở sông, địa hình hiểm trở và vùng tiếp cận cần thiết. Các cua lấy
mẫu đều theo chiều dài, tư thế xe tính bằng hai bogie, tốc độ giảm theo độ cong.

Các kiểm tra hiện hành và báo cáo nằm ở `demo/verification/dense-shared-services/`:

- `verify_three_rail_services.js`: bố trí xuyên map, ga, toa, ghế, thời gian dừng,
  khoảng cách tàu, hành lang không chồng, vật cản và độ liên tục chuyển động.
- `verify_three_rail_services.js --ui-only`: bộ chọn ba tuyến, nút Chờ tàu và mobile.
- `verify_railway_vehicle_clearance.js`: thân xe với lan can cầu render thật.
- `verify_surface_ninja.js`: mặt nền, cây cỏ, sinh vật, camera và ninja.

Đặt `GAME_URL=http://127.0.0.1:8883/?railway=1&version=dense-shared` và
`GAME_VERIFY_OUTPUT` trỏ tới thư mục báo cáo trên trước khi chạy các bộ hồi quy cũ.

Blender đang dùng `Assets/Art/Blender/Environments/DenseSharedRailServicesWorkspace.blend`,
scene `DenseSharedRailServices`; các scene cũ vẫn được giữ. File nguồn sinh riêng:
`DenseSharedRailServices.blend`. Dựng lại từ khảo sát đã kiểm tra bằng:

```powershell
& E:/blender.exe --background --factory-startup --python tools/export_railway_engineering.py -- --source demo/verification/dense-shared-services/engineering.json --scene DenseSharedRailServices --prefix Dense_ --output Assets/Art/Blender/Environments/DenseSharedRailServices.blend
```

`tools/review_dense_shared_railway.py` append scene vào Blender qua cầu nối rồi lưu
Workspace riêng. Script từ chối ghi đè Workspace có sẵn nếu file đó chưa phải file
đang mở; kiểm tra chỉnh sửa tay trước khi thay thế. Các mô tả thiết kế cũ bên dưới
là lịch sử và có những giả định đã bị thay thế bởi mục này.

## Bản rà soát nút giao và vật cản mới nhất

- Các nhánh có dải quy hoạch riêng và giữ khoảng cách với nhánh dựng trước. Vùng nút giao
  có cao độ chung và một nền chung, không lặp sàn cầu/lan can theo từng đường rẽ.
- Khảo sát cả mesh kiến trúc lớn đã gộp theo vật liệu bằng cách tách thành phần hình học;
  kiểm tra lại toàn cảnh sau sinh cây. Chừa 16 m cho gốc cây để tán cây không phủ vào ray.
- Lấy cực đại trên tam giác địa hình thật dưới toàn thân tàu; kiểm tra cả bánh tàu nghiêng.
  Trụ cầu được xét toàn chiều cao, tránh xuyên công trình bên dưới.
- Cầu rộng 12,6 m để đầu máy/toa không chạm lan can ở cua, có sàn đi bộ khớp và chặn mép.
  Lan can được chừa ở đoạn ga để không chắn lối lên tàu.
- Chạy `verify_railway_vehicle_clearance.js` để kiểm tra mô hình tàu với lan can render thật,
  `verify_railway_junctions.js` để kiểm tra giao cắt, cây sau tải lại và khả năng đi cầu/thang.
  Runner junction ghi vào `demo/verification/railway-junctions/` khi không đặt biến output.

Nguồn làm việc Blender mới: **`RailwayJunctionsWorkspace.blend`**, scene
`RailwayJunctionsReviewed`. Giữ nguyên các scene/file cũ. Bản sinh tự động là
`RailwayJunctionsReviewed.blend`; exporter không sửa Workspace. Bản sinh dùng vị trí,
pitch, chiều rộng và khoảng chừa lan can lấy từ instance cầu thực tế của game.
Các hướng dẫn `RailwayCivilEngineering` bên dưới là bản xem ở lượt trước.

Nguồn mô hình Blender: `tools/build_moon_railway.py` và
`Assets/Art/Blender/Environments/MoonRailway.blend`.
Một đầu máy, ba toa khách có nội thất, NPC Lính Chì Hoàng Gia lái tàu.
Mạng lưới 24 nhánh, 12 nút giao và 10 ga có mái che dài, phòng vé, tháp đồng hồ,
đèn vàng, ghế và bồn cây. Tàu thực sự đi qua các nhánh; các đoạn ray dùng chung
chỉ được dựng một lần và ga nhận yêu cầu ở các lượt tàu đi qua cùng đoạn ray.

## Cách đi tàu

- Đến một ga hoặc dùng Địa điểm, nhấn **Chờ tàu**. Tới ga không tự gọi tàu.
- Tàu chạy qua ga không có yêu cầu; chỉ ga được gọi mới dừng 60 giây.
- Khi tàu đến, nhấn E hoặc **Lên tàu** để vào toa.
- Trong toa, chọn ga và nhấn **Yêu cầu dừng để xuống**; tàu bỏ qua ga trung gian không được gọi.
- Khi dừng, nhấn E hoặc **Xuống tàu**. Giữ chuột phải để nhìn quanh.
- Trong toa, dùng **WASD** để đi lại. Đi qua cửa cuối toa và cầu nối để sang toa kế tiếp.
- Mỗi toa có tám ghế: chọn ghế trong danh sách rồi nhấn **Ngồi ghế đã chọn**, hoặc C.
- Nhấn **Đứng dậy**, C hoặc di chuyển để trở lại lối đi. Ghế và thành toa chặn đi xuyên;
  cầu nối có sàn và lan can, nhân vật được giữ theo toa khi tàu chạy hoặc rẽ.

## Chỉnh trong Blender

Blender đang dùng tại `E:\blender.exe`; kết nối local qua `127.0.0.1:9876`.
Trong file `MoonRailway.blend`, scene `MoonRailway` chứa mạng ray và scene
`RailwayInteriorStudio` chứa đầu máy, ba toa, NPC và một ga mẫu với các nhóm có tên rõ ràng.
Hai toa sau dùng chung dữ liệu lưới với `Coach_01` để xem thay đổi khi chỉnh ghế, cửa và nội thất.
Camera có `Exterior_Design_View`, `Interior_Walk_View` và `Interior_Window_Seat`.

Chạy `tools/prepare_railway_studio.py` bên trong Blender để dựng lại studio từ dữ liệu game.
Chạy `tools/export_railway_studio.py` trong Blender để xuất các bộ phận được gắn nhãn
chỉnh sửa trở lại game; sau đó chạy `python tools/refresh_web_assets.py` và tải lại trình duyệt.
Đã kiểm tra xuất lại đầu máy, toa, nhà ga và NPC không lệch tọa độ đỉnh.

## Nền và va chạm

Tuyến nằm trong ranh giới đi lại của map. Cao độ lấy từ tam giác địa hình thật.
Các ga luôn đứng thẳng, tách khỏi độ nghiêng của toa trên dốc.
Từ bản sửa ngày 25/10, giữ nguyên địa hình thay vì san nền quanh ga.
`railway-clearance.js` khảo sát hình học cũ, tìm đường qua vùng thấp để né núi/công trình,
dời nút giao bị chắn, rồi giải cao độ có độ dốc tối đa khoảng 6% trên toàn mạng.
Khoảng kiểm tra bao cả toa trên đường cong và gầm cầu; mô hình ở trên trời được xét
theo khoảng cao thực tế, để tàu có thể đi bên dưới khi đủ chỗ.

Đoạn trên đất thấp giữ ray gần nền; đoạn cần nâng có sàn cầu, lan can và trụ đỡ,
tránh đặt trụ vào công trình cũ. Qua sông nâng cầu ít nhất 6 m trên mặt nước.
Núi dùng đường vòng hoặc cầu vượt, chưa xây hầm mới. Ga trên cao có cầu thang
đổi chiều, bậc không quá 15 cm, chiếu nghỉ và hành lang ngoài cầu thang.
Hình học bậc thang và dữ liệu mặt sàn vật lý được tạo từ cùng kích thước.
Nhân vật dưới cầu/ga không bị kéo lên sàn trên cao.

Để xem tuyến đã khảo sát trong Blender, chạy kiểm thử clearance rồi:
`E:\blender.exe --background --factory-startup --python tools/export_railway_engineering.py`.
File riêng `Assets/Art/Blender/Environments/RailwayCivilEngineering.blend` là bản xem thiết kế;
không tự cập nhật studio nội thất và không xuất chỉnh sửa ngược vào runtime.

## Chạy và kiểm tra

`python tools/serve_game.py --port 8883`, mở `http://127.0.0.1:8883/?railway=1`.
Server có hàng đợi đủ lớn cho tài nguyên song song.
`node tools/tests/verify_railway.js`, có thể đặt GAME_URL và GAME_VERIFY_OUTPUT.
`node tools/tests/verify_railway_clearance.js` kiểm tra cao độ, khoảng trống quanh tàu,
độ dốc, chân thang chạm đất, lên/xuống cầu thang ở mười ga và xuất khảo sát cho Blender.
Vị trí ga còn được kiểm tra để tránh nhánh ray khác xuyên sân ga và giếng thang.
Báo cáo mặc định của runner này nằm trong `demo/verification/railway-clearance/`.
`verify_railway.js` kiểm thử đi bộ trong ga, sàn render,
trọng lực, chạy qua ga không gọi, dừng theo yêu cầu 60 giây, lên/xuống và chọn ga xuống.
`node tools/tests/verify_railway_network.js` kiểm tra mạng nhánh, chuyển ba toa,
chọn/đổi ghế, đứng dậy, giới hạn thành toa và sàn di chuyển cùng tàu.
