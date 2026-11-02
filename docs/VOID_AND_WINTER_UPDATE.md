# Chung Cư Hư Không và bản cập nhật Tuyết

Chạy từ thư mục gốc dự án:

```powershell
python tools/serve_game.py --port 8883
```

Mở http://127.0.0.1:8883/ rồi Ctrl+F5. Nếu máy chủ 8883 đang chạy thì dùng lại.

## Chung cư và ga tàu

Trong **G → Địa điểm → Chung Cư Hư Không**, có 8 tòa, mỗi tòa 30 tầng và mỗi tầng 10 căn hộ: tổng cộng **2.400 phòng**. Mỗi phòng có giường, chăn/gối, sofa, thảm, bàn, ghế, tủ sách, bếp, tủ lạnh, lavabo, gương và khu tắm. Cửa phòng mở sẵn; vách, sàn, trần và đồ lớn có va chạm. Nội thất dùng các module đã vẽ trong Blender, tải theo tầng người chơi đang ở. Mặt tiền được vẽ theo lô để hạn chế số lệnh vẽ.

Lối chính nằm ở đầu hành lang mỗi tòa. Thang máy ở đầu đối diện: **E** ở sảnh để gọi thang đến tầng hiện tại, bước vào cabin rồi **E** mở bảng 30 tầng. Chọn tầng bằng chuột hoặc Tab/Enter; Esc đóng bảng. Cabin đưa nhân vật theo sàn, chặn bước/nhảy ra trong chuyến đi và không tính sát thương rơi. Thang này phục vụ 30 tầng chung cư; quy tắc thang máy hai điểm dừng của ga tàu vẫn giữ nguyên.

**9 mảnh hư không** được phân bố ngẫu nhiên vào 9 phòng khác nhau. Hạt giống và các mảnh đã nhặt được lưu trên thiết bị; tải lại không đổi vị trí hoặc hồi mảnh. Đến gần và nhấn **E** để nhặt. Đủ 9 mảnh vẫn giữ nguyên cả bộ, chờ công thức/vật phẩm ghép được bổ sung sau theo yêu cầu.

**Ga Chung Cư Hư Không** là điểm dừng bổ sung trên mạng ray đang có, phục vụ cả hai chiều và giữ sáu đoàn tàu. Không tạo đường tàu đâm xuyên qua các tòa nhà. Khu đất được khảo sát khô, đủ rộng và tránh công trình/đường ray trước khi xây; cây, bãi quái và hòm Noel ngẫu nhiên tránh phần đất dành cho chung cư.

## Kho đồ và trang bị

**I** mở kho, với đúng hai nhóm **Vật phẩm / Trang bị**. Mỗi nhóm có **5 ô ngang**, có tìm kiếm. Chọn ô để xem mô tả, số lượng và nút sử dụng/trang bị ở bảng chi tiết. Các nút cũ được giữ nguyên để dùng chung số lượng, điều kiện sử dụng và dữ liệu lưu.

Động cơ vĩnh cửu, kiếm dung nham, pha lê tuyết, giáp sắt, đồ lặn và giáp cuồng nộ có ảnh PNG được render từ model Blender. “Đồ bơi” được áp dụng cho bộ đồ lặn hiện có, giữ khả năng không mất oxy dưới nước.

## Nhà máy và Nữ Chúa Tuyết

Nhà máy được xây lại trên vị trí cũ: cổng nghi lễ, hai vệ binh Noel, ba tầng xưởng, cầu thang chuyển tầng, 12 dây chuyền và 24 NPC công nhân. Có máy quét, con lăn, băng chuyền quà chuyển động, khu đóng hộp, giá nguyên liệu, cột chịu lực, cửa kính, mái tuyết và ống khói. Pha lê tuyết được đặt lại trên giá trong xưởng, giữ cách lấy và thời gian hồi cũ.

Địa bàn hình hộp cũ của Nữ Chúa Tuyết được thay bằng đấu trường băng có các vòng hoa văn, trụ tinh thể, lối vào và ngai Blender. Boss giữ hành vi nấp trong tuyết, phát hiện người chơi rồi xuất hiện/tấn công. Nền được đồng bộ trước khi hệ ray và vật lý lập chỉ mục để tránh tuyết xuyên sàn.

## Nakat và Giáp cuồng nộ

Phòng kho báu **Hang Tà Thần** có ánh sáng riêng, thiên thạch **Nakat** và thiết bị bản đồ. **E** tại rương nhận Nakat duy nhất một lần. **E** ở thiết bị cạnh rương mở bản đồ; **K** mở lại khi ở trong hang. Bản đồ vẽ vị trí thật, các hành lang và đường đi ngắn nhất tới cầu thang ra ngoài.

Tại bàn chế tạo ở Trụ Sở Công Nghệ: **50 sắt + 20 uranium + 1 Nakat → Giáp cuồng nộ**. Giáp tăng giới hạn lên **500**. Khi chịu sát thương có nguồn từ kẻ địch, tăng **30% sát thương đòn đánh trong 30 giây**; đòn tiếp theo từ kẻ địch làm mới thời gian. Sát thương môi trường không kích hoạt. Có đồng hồ hiệu lực trên HUD; tháo giáp mất hiệu ứng. Giáp sắt và giáp cuồng nộ không mặc chồng; đồ lặn vẫn giữ chức năng riêng.

## Thời tiết

Mỗi **120 giây chơi**, khi chưa có sự kiện, hệ thống kiểm tra với xác suất **15%** để bắt đầu một trong ba thời tiết. Không chồng nhiều thời tiết. Thời gian dừng khi ở sảnh, hội thoại hoặc bảng thao tác.

- **Mưa thủy tinh:** 180 giây. Gây sát thương theo giây nếu ở ngoài và không mặc giáp bảo hộ còn giáp. Mái nhà/công trình và hang che chắn được.
- **Thiên thạch:** 180 giây. Có vòng đỏ cảnh báo 4 giây để né trước từng va chạm. Va chạm gây một đợt sát thương lớn, có rung camera; giáp bảo hộ giảm tác động và dùng giáp hấp thụ. Bỏ chạy khỏi vòng hoặc vào nơi có mái che để tránh.
- **Sao chổi:** 360 giây, chỉ tạo cảnh tượng trên trời, không gây sát thương.

Sự kiện tự dọn hiệu ứng và trở lại trạng thái thường khi hết giờ. Hành khách vẫn được bảo vệ theo cơ chế bất tử trên tàu hiện có.

## File nguồn và xuất lại Blender

- `tools/build_void_update.py`: dựng studio, xuất module mesh và render 8 ảnh vật phẩm.
- `Assets/Art/Blender/Environments/VoidAndWinterStudio.blend`: nguồn Blender chỉnh sửa được, gồm scene studio các module và scene `VoidApartments8Towers` lắp đủ tám tòa với 30 tầng/tòa, có căn hộ mẫu đầy nội thất.
- `demo/features/void/data/void-assets.js`: mesh xuất từ Blender, không phải model giả hoặc placeholder.
- `demo/features/void/`: kiến trúc, chung cư/thang máy, kho báu, giáp, thời tiết và CSS.
- `demo/features/inventory/inventory-workspace.js`: lưới và bảng chi tiết kho.

```powershell
& 'E:\blender.exe' -b --python tools/build_void_update.py
python tools/refresh_web_assets.py
```

Blender chạy nền bằng executable cài trên máy. Không cần bật Blender khi chơi. Không ghi đè model của các công trình cũ; bản sao các file tích hợp trước đợt sửa nằm trong `.runtime/void-update-before/`.

## Kiểm tra lại

```powershell
$env:GAME_VERIFY_VOID='1'
$env:GAME_VERIFY_OUTPUT='demo/verification/void-update-regression'
node tools/tests/verify_railway_service.js
```

Chạy kiểm tra tính năng mới, rồi hồi quy tàu và thao tác phím/chuột thật. Kết quả tính năng và ảnh nằm trong `demo/verification/void-update/`; báo cáo tàu và chuột ở thư mục đặt trong `GAME_VERIFY_OUTPUT`. `GAME_VERIFY_WALKING=1` và `GAME_VERIFY_MOBILITY=1` thêm hai bộ kiểm tra đường làng/thang máy cũ. Các báo cáo là dữ liệu sinh tự động, không cần đóng gói để chơi.
