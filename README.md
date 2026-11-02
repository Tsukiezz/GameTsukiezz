# GameTsukiezz — bản đồ hiện tại

Game phiêu lưu 3D chạy trên trình duyệt bằng Three.js. Đọc [bàn giao](CONVERSATION_HANDOFF.md) để tiếp tục công việc.

**Chơi bằng một lần bấm trên Windows:** mở **[Tsuventure.exe](Tsuventure.exe)** ở thư mục gốc. EXE có logo và dữ liệu game đi kèm, không cần Python/Blender. Đặt cạnh `demo/` để luôn mở bản dự án mới nhất, hoặc chép riêng EXE để chơi bản đã đóng gói. Hướng dẫn cập nhật và dựng lại: [DESKTOP_EXE.md](docs/DESKTOP_EXE.md).

**Đấu trường 5 cấp:** lần lượt gặp Cự Thú (2.400 HP), Ngựa Hắc Ám (5.000), Spinosaurus (8.000), T-rex (10.000) và Thần Zeus (20.000). Hạ đối thủ mới mở cấp tiếp theo và nhận Huân Chương 1–5 trong balo. Tiến độ tự lưu; năng lực huân chương chờ cập nhật. **G → Đấu Trường La Mã**, vào lối chiến binh, **E** mở cổng hầm thú. Xem vòng báo đòn để né húc, cắn, gầm và kiếm sét. Thư viện có model Blender cập nhật, bỏ rong/rêu khỏi danh sách; cây thủy sinh vẫn còn trong sông.

**Sinh vật & đấu trường (31/10):** 34 mẫu sinh vật được dựng lại bằng Blender, dùng chung trong thế giới và thư viện. Đấu trường La Mã chuyển ra phía tây bắc, lớn gấp **2,5 lần**, có một hầm thú lớn, lối chiến binh mở và khán giả cổ vũ. Mở **http://127.0.0.1:8883/?arena=1** hoặc **G → Đấu Trường La Mã**; ga mới có đường bộ tới cửa chiến binh. Bay cao hơn mái có thể đi qua đấu trường. Nguồn chỉnh sửa: `Assets/Art/Blender/Creatures/LunarCreatureStudio.blend` và `Assets/Art/Blender/Environments/GrandRomanArenaCurrent.blend`.

**Phím E & đu dây:** đã bỏ các điểm chỉ xem mô tả, chào hỏi NPC và báo thưởng giả; E giữ cho hành động có tác dụng. Khám phá cổ thụ, tới **vòng bám ở chân dây**, nhấn **E một lần** để bám dây lên ngọn lấy Hạt đậu thần. Tại đầu dây trên đỉnh, E để xuống lại. Nhân vật có tư thế bám dây, được kéo liên tục và đáp lên sàn; có thể xoay camera/ngắm cảnh, mở balo để tạm dừng hành trình. Cư dân/NPC vẫn hiện diện và được ghi vào thư viện khi tới gần.

**Khám phá mới (31/10):** Kim tự tháp chuyển tới sa mạc riêng ở phía đông bắc (X=1500, Z=−1400); Ga Kim Tự Tháp chuyển theo, các ga khác vẫn được giữ lại. Lăn chuột vào sát nhân vật để chuyển sang **góc nhìn thứ nhất**, lăn ra để trở lại góc nhìn thứ ba. Trên tàu, các bảng thông báo được ẩn: đi tới ghế rồi **C** ngồi/đứng, **E** đăng ký xuống tại ga tiếp theo. Trong hang, đi theo cầu thang có đèn; **E** mở cửa phòng kho báu, nhận **bản đồ lối ra** trong balo và **K** xem đường về. Khám phá cổ thụ để thấy dây leo; **E** leo lên lấy **Hạt đậu thần**, dùng dây trên đỉnh để xuống lại. Cành, rễ và lá có va chạm thật.

**Skin & dân cư:** mục **P → Skin** thay cho Nhân vật; năm ngoại hình có mô tả riêng, dùng chung máu, giáp, tốc độ, tầm đánh, nhịp đánh và sát thương. Trang bị quyết định sức mạnh. Cửa chính và cửa căn hộ Hư Không mở/đóng bằng **E**; bảo vệ đứng ở cả tám tòa. Nhà máy Tuyết có cổng hai cánh tự mở, giá hàng, xe đẩy, bảng điều khiển và khu điều phối. Vương quốc bánh kẹo có cư dân bánh gừng/kẹo dẻo; các dòng sông có sáu loài tôm, cua, ốc bám đáy. **B** xem mô tả và ảnh 3D của các NPC/sinh vật mới.

Đấu trường Nữ Chúa Tuyết có nền đất liền dưới sàn, chuyển tiếp với địa hình quanh sân; điểm đến ở bờ khô trước cổng. Bãi quái kiểm tra toàn bộ khuôn viên công trình và khoảng trống quanh bãi, kể cả sân, mái, ga, làng và căn cứ; dữ liệu hồi sinh/chiến lợi phẩm được giữ khi dời bãi cũ.

**Cập nhật Hư Không & Tuyết:** 8 chung cư × 30 tầng × 10 phòng, thang máy chọn tầng, 9 mảnh hư không duy nhất và ga mới hai chiều. **G → Chung Cư Hư Không**, **E** gọi thang / chọn tầng / nhặt mảnh. Kho **I** có hai nhóm **Vật phẩm / Trang bị**, mỗi hàng 5 ô; chọn ô để xem chi tiết. Nhà máy Tuyết có 3 tầng, 12 dây chuyền, 24 công nhân và vệ binh ở cổng; Nữ Chúa Tuyết có đấu trường băng mới. Xem [hướng dẫn bản cập nhật](docs/VOID_AND_WINTER_UPDATE.md).

**Giáp cuồng nộ:** 50 sắt + 20 uranium + 1 thiên thạch Nakat ở rương kho báu Hang Tà Thần → 500 giáp; chịu đòn kẻ địch tăng 30% sát thương trong 30 giây. **K** trong hang mở bản đồ trực tiếp chỉ lối ra. Thời tiết có mưa thủy tinh, thiên thạch với vòng cảnh báo và sao chổi; mái che và giáp bảo hộ giúp tránh tác động.

Đường ray sát đất dùng nền liên tục thấp, đã bỏ các khối đá kê rời nhô lên. Đoạn cần đi cao dùng mặt cầu và trụ đỡ hở bên dưới. Khi hạ ga, kiểm tra cả chiều xuôi và chiều ngược, giữ khoảng hở với cây/công trình theo bề rộng đoàn tàu.

Lối lên ga chênh dưới **5 m** dùng thang bộ có tay vịn; từ **5 m** dùng thang máy **hai điểm dừng**. Các ga khó đổi chiều có cầu bộ hành và thang máy nối sân chờ xuôi/ngược. **E** gọi thang ở cửa; bước vào cabin rồi **E** để đi đến điểm còn lại. Chân thang được chọn trên bờ khô, có mái che, đèn và bậc nối với mặt đất.

Map hiện tại rộng **6,72 × 6,72 km**, mạng ray hai chiều song song với **70 điểm ga có hai khu chờ đối diện** (giữ 69 ga cũ và thêm ga Hư Không), 64 cầu treo đi bộ có tháp, cáp, dây đứng và lan can.
Địa hình có nền riêng cho từng vùng: mặt trăng ở khu cũ, xanh tươi tại Nguyệt Tuyền, **đá đỏ và cỏ cây ở dãy núi phía tây**, tuyết trắng ở phía nam. Vùng tuyết có chim cánh cụt và gấu trắng.
Sông có lòng dẫn lõm và bờ đất cao hai bên, bề rộng thay đổi theo nhánh. Đáy và bờ thấp là **cát phù sa có vân cát**, không dùng họa tiết hố mặt trăng.
Nước có màu theo độ sâu và gợn chuyển động theo dòng; bờ có lau sậy, đá nhỏ. Mặt nước bám đúng bờ địa hình; bơi và thuyền dùng cùng dữ liệu.
Hai phía ga giữ cùng tên cũ, có biển **Chiều xuôi / Chiều ngược**. Đứng phía nào rồi nhấn Chờ tàu sẽ gọi đúng chiều đó.
Nhà máy Tuyết có pha lê trên giá nguyên liệu: **E** lấy 2 viên, mỗi cụm hồi sau 5 phút.
Mở **Địa điểm → Nam Cực / Nhà máy Tuyết / Thác Băng / Nữ Chúa Tuyết** để khám phá vùng mới.
Ông già Noel cưỡi tuần lộc bay trên trời và thả hòm có khói đỏ; nhấn E mở khi hòm đáp đất.
Mỗi hòm Noel chứa **đúng 2 loại vật phẩm khác nhau, mỗi loại ngẫu nhiên 1–5 món**. Quà hiếm có **Động cơ vĩnh cửu (2% mỗi hòm)**, nằm trong hai loại đó. Hòm cũ chưa mở cũng áp dụng nội dung mới.
Rơi cao gây mất máu; khi chết quay lại điểm xuất phát.

**Địa điểm → Vương Quốc Bánh Kẹo**: lâu đài bánh gừng, tháp kem, cây kẹo bông, sân bánh quy và Chúa Sâu Răng hình kẹo mút **10.000 HP**. Né vòng tím trong 1,8 giây để tránh thôi miên 2,5 giây. Có **Ga Vương Quốc Bánh Kẹo** cho cả hai chiều tàu.
Núi/thác Nguyệt Tuyền khôi phục màu xanh của địa hình cũ. Hồ Thủy Ngân có hàng rào giáo nhọn và thanh sắt nối, chừa lối vào và hành lang sông/ray.
Các ga cao có cầu thang đổi vế, chiếu nghỉ, tay vịn, đèn, giằng và trụ đỡ; ray tại khu dừng được san ngang cho cả đoàn tàu ở hai chiều.
Bầu trời có tinh vân, sao và tám hành tinh Hệ Mặt Trời, hiện ở cả ba mức đồ họa.

Vương Quốc Bánh Kẹo có **tường thành bánh quy bao quanh, bốn cổng, tháp góc, lối lên thành**, chợ bánh, đèn đường, ghế và lò nướng. Toàn bộ đất bên trong thành là bánh xốp/chocolate, không còn nền mặt trăng.
Có **137 vị trí mảnh bánh quy**: đến gần nhấn **E** nhặt, mở **I → Vật phẩm → Mảnh bánh quy → Ăn**, hồi **20 độ no/mảnh**. Bánh nhặt và số lượng trong balo được lưu; điểm nhặt hồi sau 10 phút.
Phía trái map là **hai sống núi dài chạy dọc sông**, cao thấp khác nhau, có **23 làng, 114 cư dân**. Nhà có cửa vào, giường/bàn, sân làng, quầy hàng, vườn, giếng; từng làng có lò rèn/kho/cối xay. Đến gần cư dân nhấn **E** chào hỏi.
Mở **Địa điểm → Làng Trăng Khuyết Tây** để ghé làng đầu tiên. Danh sách có lối tắt tới ba làng đại diện ở đầu, giữa và cuối dãy núi. Tất cả làng có dấu trên bản đồ **M**.
Núi phía bắc dùng đá đỏ có lớp vân đá, cỏ, cây và đá tảng; phần phía nam chuyển sang tuyết trắng và cây phủ tuyết. Khoảng **92% ray phía núi bám nền đường đất thật**; cầu treo đường sắt chỉ dùng khi vượt sông/khe/đèo. Giữ 46 tên ga cũ, bổ sung để **mỗi làng có một ga riêng**, kèm đường đi và biển chỉ dẫn.
Nhà và cư dân mới được **thiết kế trong Blender rồi xuất thành mesh cho game**: mái cong nhiều lớp, cửa sổ tròn, chi tiết mặt trăng, nội thất; cư dân chibi có ba kiểu nghề. Bầu cảnh đá đỏ/tuyết và nền bánh kẹo vẫn giữ riêng.

**Đi bộ và leo núi:** sườn đất dốc hơn **35°** không thể đi hoặc nhảy liên tục để leo thẳng lên. Nhân vật trượt xuống khi đứng trên vách quá dốc; bước lên vật cao tối đa **30 cm**. Bay và bơi vẫn có cơ chế riêng.
Có **69 lối đi bộ có mặt đi thật**: 23 lối nối làng với sân ga, 23 lối lên đỉnh và 23 lối xuống chân đồi. Đoạn dốc dùng bậc đá, tay vịn và móng đỡ; bậc thường 14 cm, không quá 28 cm trong bản hiện tại. Các lối ga quá dốc được thay bằng cầu thang đổi vế. Cây ngẫu nhiên tránh hành lang đường đi.

Ấn **B** để mở thư viện quái vật, sinh vật, NPC, địa điểm và ga hiện tại. Tên, mô tả và kỹ năng luôn xem được; trạng thái đã gặp/đánh bại lưu riêng. Cư dân bánh kẹo, bảo vệ Hư Không, vệ binh/thợ Noel và sáu loài tôm/cua/ốc đã được thêm cùng ảnh xem trước 3D.

## Chạy game

Từ thư mục dự án, mở PowerShell:

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/**. Giữ cửa sổ máy chủ đang chạy; Ctrl+C để dừng.
Nếu game đã chạy trên cổng này, chỉ cần mở địa chỉ. Không cần Unity hoặc Blender để chơi.

WASD di chuyển, Space nhảy, E tương tác, I mở balo. Các nút **Địa điểm**, **Nhân vật** và **?** có trong game.
Nhấn chuột phải một lần để khóa chuột và nhìn quanh; Esc hiện con trỏ. Mở bản đồ/menu sẽ hiện con trỏ để thao tác.
Phím tắt khi đang ẩn chuột: **G** địa điểm, **P** nhân vật, **I** balo, **B** thư viện, **M** bản đồ, **O** cài đặt, **H** trợ giúp, **Home** về sảnh. Trong bảng dùng **Tab / Shift+Tab / Enter**, **Esc** đóng.
Ở ga dùng **R** gọi tàu, **T** đổi tuyến, **E** lên tàu. Trên tàu, **E / R** hoặc nút **Xuống ở ga kế tiếp** yêu cầu dừng và tự đưa bạn xuống đúng sân ga kế tiếp theo chiều đang chạy; không có danh sách chọn ga xuống. Có thể yêu cầu ngay khi tàu còn đỗ.
Hành khách trên tàu **bất tử**, không bị quái vật tấn công, hóa đá, đóng băng, thôi miên hay chảy máu; bảo vệ kết thúc khi xuống tàu. Vẫn dùng **WASD** đi trong ba toa, **C** ngồi/đứng, **1–8** chọn ghế, **N** đổi ghế.
Ngắm cảnh trên tàu: **V** chuyển góc trong toa / cửa sổ trái / cửa sổ phải; **Z / X** hoặc lăn chuột thu/phóng. Bản đồ nhỏ tự phóng gần và bám hành khách; **M** mở bản đồ lớn quanh vị trí tàu, **+/−** thu/phóng, phím mũi tên di chuyển, **0** về vị trí bạn, **9** xem toàn map.
Ga trên đất bằng dùng nền nối địa hình và lối vào thấp; chỉ giữ lối lên cao khi địa hình, vật cản hoặc đoạn cua cao đòi hỏi. Các khúc cua trên cao giữ nguyên vị trí và độ cao.
Đến gần cây nhấn E lấy gỗ; dùng **10 gỗ** chế tạo thuyền tại Trụ Sở Công Nghệ.
Thuyền chạy trên sông, hồ thủy ngân và đầm lầy; Shift tăng tốc.
Tại bàn công nghệ nhấn **E**: **50 sắt → Giáp sắt (200 giáp)**; **20 cao su +10 silicon → Đồ lặn (không mất oxy khi lặn)**.
Không mặc đồ lặn: bơi 0,45 m/s, mất 14 oxy/giây dưới nước. Mặc đồ lặn: bơi 3,8 m/s (Shift 5,2), không mất oxy.
Giáp/đồ lặn phủ lên nhân vật khi trang bị trong balo. Thể lực chỉ tiêu hao khi chạy nhanh trên đất.
Tàu đang chạy đâm trúng sẽ chết ngay và hồi sinh tại điểm xuất phát. Nhận vật phẩm mới sẽ hiện thông báo giữa màn hình.
Khi chết, bảng giữa màn hình ghi **nguyên nhân tử vong** (quái, tàu, rơi, đói, thiếu oxy, độc, dung nham…). **Enter** đóng bảng.
Biểu tượng ứng dụng vuông có các kích thước 32–1024 px; manifest dùng bản 192/512 px.
Cao su và silicon có từ hòm ông già Noel và bãi quái. Trang bị/tháo trong balo; đồ chế tạo được lưu qua tải lại.
Quái xuất hiện thành **274 bãi/3.425 con** khắp map, có **21 bãi ở vùng núi cao**, mỗi bãi 10–15 con. Bãi tránh làng, ga và công trình. Dọn hết bãi nhận 1 xu vàng và 1 vật phẩm ngẫu nhiên;
nhấn E nhặt quà. Bãi hồi sau 30 phút. Mỗi lần lên tàu tốn 1 xu.
Theo dõi thanh **Độ no**, ăn thịt đùi trong balo để hồi 40 độ no. Kim tự tháp có mê cung 13 tầng, đuốc và nội thất.
Độ no về 0 sẽ mất **3 máu mỗi 2 giây**; ăn để ngừng mất máu. Rơi tự do gây sát thương theo độ cao lần ngừng bay gần nhất.
Ấn **M** mở bản đồ lớn: phóng to, kéo, xem tọa độ và nhấn đánh dấu vị trí. M/Esc đóng bản đồ.
Thịt đùi có ở nhiều nơi, nhất là công trình: E nhặt 2 miếng. Trong **Cài đặt**, bật/tắt và chỉnh âm lượng nhạc sảnh.
Cuộn xuống mục **CODE**, nhập `Tsukiezz` để nhận 9999 mỗi vật phẩm và toàn bộ trang bị hiện có (một lần trên trình duyệt).
**Đèn pin, cánh pha lê và mảnh vỡ cổ đại là vật phẩm duy nhất: tối đa 1 món mỗi loại**, kể cả khi dùng CODE. Dữ liệu CODE cũ ghi 9999 cho ba món này tự chuyển về 1 và giữ quyền sở hữu.

**Cài đặt → Đồ họa:** Mượt cho máy yếu, Trung Bình cho cảnh quan, Cao cho bóng mềm/ánh sáng và tầm nhìn xa.
Mượt là mặc định. Số đo **49–59 FPS trên GT 710** thuộc bản trước các đợt bổ sung gần đây; cần đo lại hiệu năng bản hiện tại.
Sáu đoàn tàu tăng tốc tối đa 84 m/s, tự giảm tốc theo cua và tín hiệu: đỏ/xanh dương/vàng chạy chiều cũ,
tím/xanh lá/đen chạy trên ray chiều ngược. Đến ga chọn tuyến và nhấn Chờ tàu để yêu cầu dừng; mỗi đoàn có 3 toa.
Nữ Chúa Tuyết ẩn trong tuyết tại lãnh địa riêng, xuất hiện khi phát hiện người chơi. Quái có thể nhắm bắn người chơi đang bay.

## File nào là bản hiện tại?

- **`demo/index.html`**: điểm vào game, ghép các mô-đun của cùng bản đồ.
- **`demo/features/`**: địa hình, công trình, nhân vật, sinh vật, ray, kho đồ, dữ liệu và hình ảnh game đang dùng.
- **`demo/features/world/terrain-traversal.js`**, **`highland-trails.js`** và **`data/highland-walking-routes.js`**: giới hạn leo dốc, hình học/va chạm đường bộ trên núi và dữ liệu đường đã khảo sát. Game dùng dữ liệu lưu sẵn; khi sửa địa hình cần kiểm tra và xuất lại bằng các lệnh bên dưới.
- **`Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`**: bản Blender kiểm tra ghép mới nhất, gồm ray,
  mê cung 13 tầng và trụ sở công nghệ. Đây chưa phải bản sao đầy đủ mọi chi tiết trong game.
- Các `.blend` từng vùng/nhân vật trong **`Assets/Art/Blender/`**: nguồn chỉnh sửa các thành phần của map hiện tại.
- **`Assets/Art/Blender/Environments/CandyKingdomCurrent.blend`**: bản vùng bánh kẹo, ga hai chiều và hàng rào mới, xuất từ hình học thực tế của game để chỉnh sửa trong Blender.
- **`Assets/Art/Blender/Environments/WesternRedHighlandsAndCandyFortress.blend`**: snapshot cập nhật dãy núi đá đỏ, làng/cư dân/cỏ cây, thành bánh kẹo và đường dẫn ray phía tây. Bản này chứa thành bánh kẹo mới hơn snapshot CandyKingdomCurrent.
- **`Assets/Art/Blender/Environments/LunarVillageAndSuspensionDesign.blend`**: nguồn thiết kế mới của nhà, ba kiểu cư dân và cấu kiện cầu treo, đang được dùng trực tiếp trong game qua `demo/features/world/data/lunar-village-assets.js`. Tạo/xuất lại bằng `& E:/blender.exe --background --python tools/build_lunar_village_assets.py`.
- **`tools/`**: máy chủ, kết nối Blender, bộ tạo tài sản và kiểm tra game.

Không có một file `.blend` duy nhất chứa đầy đủ map đang chơi. Các mô-đun và nguồn từng vùng đều thuộc cùng map hiện tại.
Bộ khung Unity chưa dùng và các bản Blender ghép cũ đã được dọn; xem [báo cáo dọn dự án](docs/PROJECT_CLEANUP.md).

## Kiểm tra và chỉnh sửa

```powershell
node tools/tests/verify_railway_service.js
node tools/tests/verify_player_experience.js
node tools/tests/verify_candy_kingdom.js
node tools/tests/verify_western_highlands.js
node tools/tests/verify_highland_transit.js
node tools/tests/verify_terrain_traversal.js
node tools/tests/verify_current_map.js
node tools/tests/verify_autumn_upgrade.js
node tools/tests/verify_realm_update.js
node tools/tests/verify_moon_economy.js
node tools/tests/verify_polar_expansion.js
node tools/tests/verify_world_ecology.js
node tools/tests/verify_complete_library.js
node tools/tests/verify_realm_transit.js
node tools/tests/verify_lunar_rivers.js
$env:GAME_VERIFY_OUTPUT = 'demo/verification/autumn-upgrade'
node tools/tests/verify_three_rail_services.js
```

Sau khi sửa JS/CSS, chạy `python tools/refresh_web_assets.py` rồi tải lại trang.

Sau khi đổi địa hình hoặc ga vùng núi, chạy `node tools/tests/verify_terrain_traversal.js`, rồi `python tools/bake_highland_routes.py` khi kiểm tra đạt. Chạy lại `python tools/refresh_web_assets.py` và Ctrl+F5. Mã kiểm tra địa hình giúp game nhận ra khi dữ liệu đường bộ cần khảo sát lại.
Nếu bộ đường mới đã đi thử đủ hơn 100.000 điểm, không có lỗi va chạm/rơi và chỉ còn mục `Normal startup uses baked walking surfaces` báo dữ liệu cũ, dùng `python tools/bake_highland_routes.py --accept-cache-miss`. Lệnh này vẫn từ chối các lỗi vật lý; sau đó kiểm tra lại bộ dữ liệu đã lưu. Không dùng tùy chọn này để bỏ qua đường đi lỗi.
`verify_railway_service.js` kiểm tra bất tử, nguyên nhân chết, ga kế tiếp ở sáu đoàn tàu, đi/chọn ghế, cửa sổ/thu phóng, phím tắt và độ cao ga/ray. Mốc kiểm tra đường cong được lưu gọn trong `tools/tests/fixtures/railway-station-baseline.json`; không phụ thuộc ảnh/báo cáo tạm trong `demo/verification/`.

[Cấu trúc mã](docs/PROJECT_LAYOUT.md) · [Công cụ](tools/README.md) · [Blender](docs/BLENDER-MCP.md)

Các ghi chép thiết kế cũ trong tài liệu tính năng là lịch sử phát triển; trạng thái và cách chạy hiện tại nằm trong README này và CONVERSATION_HANDOFF.md.
