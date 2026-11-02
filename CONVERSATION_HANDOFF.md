# GameTsukiezz — Bàn giao cuộc trò chuyện

## Mới nhất — EXE Windows và phát hành GitHub (02/11/2026)

- **`Tsuventure.exe`** tại gốc dự án, khoảng **27,7 MiB**, có logo và nhúng đầy đủ 162 file runtime. Đã tạo biểu tượng **Tsuventure** trên Desktop trỏ tới EXE và mở thử. Không cần Python/Blender trên máy chơi. Launcher dùng Chrome/Edge đang có, mở cửa sổ app; máy chủ chỉ nghe loopback.
- Có `demo/index.html` cạnh EXE: dùng ngay thư mục dự án, sửa game rồi đóng/mở lại để cập nhật. Chép riêng EXE: tự giải nén dữ liệu nhúng theo Build ID vào `%LOCALAPPDATA%\Tsuventure\Bundles`. Phiên bản portable cập nhật bằng EXE mới. Cổng mặc định **8883**, dùng chung origin/hồ sơ trình duyệt để giữ save. Máy chủ đang chạy từ Python được dùng lại; bản EXE cũ được bàn giao qua sự kiện local khi mở bản mới.
- Nguồn `tools/desktop/Launcher.cs`, dựng bằng `python tools/desktop/build_exe.py`; dùng compiler .NET Framework có sẵn và Pillow để chuyển icon, không tải bộ runtime lớn. Dựng ra file khoảng 29 MB với dữ liệu game; manifest, Build ID và SHA-256: `docs/desktop-build.json`. Hướng dẫn: `docs/DESKTOP_EXE.md`. Thoát máy chủ EXE qua logo khay hệ thống → **Thoát Tsuventure**.
- Đưa **Three.js r128** vào `demo/vendor/three-r128.min.js` cùng giấy phép MIT từ upstream, thay link CDN ở HTML. Bộ máy 3D hoạt động bằng file local; Google Fonts có thể dùng font dự phòng khi ngoại tuyến. Không đổi map/model/AI/chỉ số, không mất bản sửa chân sinh vật.
- Kiểm thử **chính EXE chép riêng**: **15/15** mục (toàn bộ tài nguyên nhúng khớp SHA-256, HEAD, MIME, range video/audio, cache, đường dẫn, trùng phiên và bàn giao chế độ project). Game 3D từ cổng EXE **8897** qua **99/99** kiểm tra sinh vật và **7/7** điều khiển thật. Hồ sơ kiểm thử tách biệt, không sửa save chơi tại 8883. Báo cáo giữ ở `demo/verification/desktop/`, `final-checks.json` đạt.
- Dọn **250 file tạm/trùng, 112,69 MiB** sau khi đóng máy chủ kiểm thử. Manifest đường dẫn/lý do/hash: `docs/desktop-cleanup-20261102.json`; script `tools/desktop/cleanup_build.py` chỉ dọn build/cache/report trùng. Giữ EXE chính, toàn bộ runtime, nguồn Blender, công cụ dựng, bằng chứng kiểm thử cuối, backup và log server chơi.
- Đã push lên **https://github.com/Tsukiezz/GameTsukiezz**, nhánh **`update/desktop-launcher-2026-11-02`**, giữ nguyên `main`. Commit bản game/EXE **`2001d70`** bao gồm các cập nhật map/game trước đó chưa commit và launcher; các commit tài liệu sau đó ghi kết quả phát hành. Không force push. Git LFS đã tải đủ 33 đối tượng mới khoảng 75 MB.
- Đã phát hành GitHub prerelease **`desktop-2026.11.02`**: **https://github.com/Tsukiezz/GameTsukiezz/releases/tag/desktop-2026.11.02**. Tải trực tiếp: **https://github.com/Tsukiezz/GameTsukiezz/releases/download/desktop-2026.11.02/Tsuventure.exe**. File 29.024.256 byte; SHA-256 local và GitHub trùng **`105c904e6f134fe4d46a1b93191f9740ecdc5e5efdb16299b69ac2f80879e3d7`**. Metadata phát hành: `docs/desktop-release.json`.

### Chơi ngày mai

Bấm **Tsuventure** trên Desktop hoặc mở **`Tsuventure.exe`** trong repository. Dữ liệu source nằm ở `demo/`. Nếu cần dùng Python để phát triển, vẫn chạy `python tools/serve_game.py --port 8883`. Các phím và save giữ nguyên. Khi build lại: `python tools/refresh_web_assets.py` rồi `python tools/desktop/build_exe.py`. Kiểm tra EXE: `python tools/desktop/verify_exe.py --keep-server`, chạy suite browser ở `GAME_URL=http://127.0.0.1:8897/?arena=1`.

## Sửa khẩn cấp — Sinh vật lật chân lên trời (31/10/2026)

- Đã tái hiện lỗi trên chuyển động AI thật của 9 loài. Căn nguyên ở `creatures/creature-art.js`: đổi hướng bằng yaw π trên từng khớp. Three.js r128 phân rã quaternion khi clone thành Euler X/Z = −π; hoạt ảnh ghi lại riêng X làm trục Z còn −π, khiến chân lật lên. Ảnh thư viện tĩnh không bộc lộ lỗi này.
- Sửa tại factory dùng chung: bake hướng quay vào vertex/normal và vị trí khớp; cache riêng cho hai hướng. Các pivot bắt đầu ở rotation identity, không còn quay π trên khớp động. Giữ chiều cao, hướng đầu, AI, chỉ số, model Blender, map, sông và ray.
- Bộ hồi quy `tools/tests/creature_upright.browser.js` thử đủ 49 model, hai hướng, clone ba thế hệ, nhiều chu kỳ bước chân và di chuyển AI thật. Bản cũ tái hiện 32 rig lỗi cùng 34 chân đảo ở 9 loài đang đi. Sau sửa, lần khởi động mới qua **99/99 kiểm tra**, 9 loài di chuyển thật không có chân đảo và không có lỗi JS. Báo cáo trước/sau: `demo/verification/creature-upright/`. Backup: `.runtime/creature-upright-before.zip`.
- Đã đổi cache key của web; tải game bằng **Ctrl + F5** tại **http://127.0.0.1:8883/** để nhận bản sửa. Không xóa save hay huân chương.

## Mới nhất — Năm cấp đấu trường, huân chương và sinh vật riêng biệt (31/10/2026)

- `demo/features/arena/arena-tournament.js` thay AI Cự Thú đơn lẻ; giữ nguyên vị trí/kích thước đấu trường, đường ga, nền, hệ thống sông và ray. `arena-relocation.js` giữ bố trí/cổ vũ và gọi tournament. Chỉ có một đối thủ tại một thời điểm, trong cùng hầm phía tây; phải hạ cấp hiện tại mới xuất hiện cấp sau. Cổng hầm đóng lại ở cấp mới, **E** mở để giao chiến; lối chiến binh giữ mở.
- Thứ tự: **LV1 Cự Thú 2.400 HP** giậm đất; **LV2 Ngựa Hắc Ám 5.000 HP** húc theo hướng đã báo, làm chậm 55% trong 4 giây; **LV3 Spinosaurus 8.000 HP** cắn gây chảy máu 6 HP/s trong 6 giây; **LV4 T-rex 10.000 HP** gầm tăng 100% sát thương và 70% tốc độ trong 10 giây; **MAX Zeus 20.000 HP** chém 130 sát thương vùng 14 m, tạo 7 vùng sét có cảnh báo, hồi 2.000 HP mỗi 120 giây giao chiến. Giáp vẫn bảo hộ. Hiệu ứng dừng khi mở UI, xóa khi chết/đi xa/lên tàu. Hành khách tàu không bị tấn công.
- Mỗi cấp trao **Huân Chương tương ứng, duy nhất 1/1** trong phần Vật phẩm của balo, có ảnh và chi tiết. Không có nút trang bị hay chỉ số giả: **năng lực riêng chờ người dùng cập nhật**. Lưu nguyên tử tiến độ và máu hiện tại vào `tsuventure_arena_tournament_v1`; chống trao lại sau chết/tải lại. Tải lại cấp chưa thắng sẽ đưa đúng đối thủ về hầm với lượng máu đã lưu. Đã kiểm tra đủ 5 huân chương qua lần đóng/mở lại Chrome cùng hồ sơ.
- Đã xuất **49 model Blender**, nguồn `Assets/Art/Blender/Creatures/LunarCreatureStudio.blend`; game dùng `creatures/data/creature-studio.js` phiên bản 2. `tools/creature_design_v2.py` được builder chính nạp để tạo đặc trưng từng loài. Thêm 4 đối thủ mới; sửa cá thành dáng thân thon, đuôi voan, cá thiên thần, cá đĩa, cá băng dài, cá râu; cua mặt trăng có càng lớn/gai, tôm kính có càng dài/mõm gai, ốc băng có vỏ nhọn. Chó tai rủ, mèo tai nhọn/ria, dê râu/sừng quặp, trâu sừng ngang, bò u vai, thỏ chân sau to và các chi tiết riêng khác.
- Các mẫu còn cũ đã được thay bằng mesh Blender: khỉ, rùa, rắn hổ mang, nhện độc, Sói Tốc Độ, Hổ Răng Kiếm, Giun Đá, Chiến Binh Bị Nguyền, sinh linh cây, kỳ lân và tuần lộc. `creature-refresh.js` giữ root AI/collider/chỉ số, thay thân và hoạt ảnh bộ chân. Cá sông cũ và sinh vật đầm lầy dùng mesh instancing mới. Các boss đã có nguồn Blender chi tiết từ trước được giữ lại.
- Thư viện bổ sung 5 cấp, HP/kỹ năng/huân chương và chụp model thật. Bỏ `river_seagrass_*`, `river_kelp`, `swamp_lotus`, `swamp_lotusFlower` khỏi danh sách và nhật ký hợp lệ; **không xóa thực vật trong thế giới**. Phần mềm vẫn dùng model riêng cho từng loại trong game và ảnh xem trước.
- Kiểm tra: chuỗi chiến đấu **78 mục**, lưu qua khởi động lại **2**, đo tốc độ T-rex thật **2** (6,8 m so với 4 m cùng 0,5 giây), đường ray **248**, đường ga đấu trường **2** (357 bước), tương tác E/đu dây **27**, điều khiển thật **7**, thư viện **62** (61 ảnh sinh vật/quái và kiểm tra bỏ thực vật) đều đạt. Nguồn Blender 49 collection qua 5 kiểm tra; 137 tài nguyên web trả HTTP 200, cú pháp JS/Python đã kiểm tra. Kết quả/ảnh: `demo/verification/arena-levels/`; xem `final-checks.json`. Tất cả chạy trên hồ sơ Chrome cô lập, không cấp huân chương vào hồ sơ chơi của người dùng.
- Backup trước thay đổi: `.runtime/arena-levels-before-20261031.zip`. Không reset/clean Git hay thay bản đồ. Chi tiết cấu trúc và công thức: `docs/ARENA_TOURNAMENT.md`. Chưa commit/push/deploy.

### Chạy và kiểm tra tiếp

Chạy `python tools/serve_game.py --port 8883` nếu server chưa chạy; mở **http://127.0.0.1:8883/?arena=1**. **G** tới đấu trường, đi vào từ cửa chiến binh; **E** mở cổng hầm, đánh theo điều khiển hiện tại. **B** thư viện, **I** balo, **M** bản đồ. Nên mang giáp và vũ khí đặc biệt cho cấp cao.

Sau sửa asset: `python tools/refresh_web_assets.py`. Kiểm tra trên profile mới: đặt `GAME_VERIFY_SCRIPT=arena_levels.browser.js`, `GAME_VERIFY_OUTPUT=demo/verification/arena-levels`, `GAME_VERIFY_KEEP_OPEN=1`, chạy `node tools/tests/verify_railway_service.js`. Test đi qua đủ 5 cấp nên chỉ dùng Chrome kiểm thử. Dùng `arena_persistence.browser.js` cùng `GAME_VERIFY_PROFILE` của hồ sơ kiểm thử đã hoàn thành để xác minh lưu tiến độ. Metadata profile/port nằm ở `.runtime/void-debug.json` khi runner giữ Chrome mở. Builder Blender: `E:/blender.exe -b --python tools/build_creature_studio.py`; ảnh riêng đối thủ: `tools/render_creature_review.py`; kiểm tra nguồn: `tools/verify_creature_arena_blender.py`.

## Mới nhất — Sinh vật Blender và đấu trường La Mã (31/10/2026)

- Dùng **Blender 5.2.1** tại `E:/blender.exe` dựng **34 model**: động vật rừng/toàn map/Nam Cực, cá, tôm/cua/ốc, quái bãi và cư dân. Nguồn: `Assets/Art/Blender/Creatures/LunarCreatureStudio.blend`; builder: `tools/build_creature_studio.py`; dữ liệu: `demo/features/creatures/data/creature-studio.js`; factory dùng chung: `creature-art.js`. Game và ảnh thư viện dùng cùng model; đã cân ánh sáng portrait. Giữ chỉ số và phần thưởng quái cũ.
- Đấu trường chuyển tới **X=-1520, Z=-1420**, lớn **2,5 lần**, san trên mesh đất thật với vùng chuyển tiếp tránh sông. `arena-relocation.js` di chuyển hình, va chạm, tương tác và landmark cùng nhau. Chỉ có **một hầm thú phía tây 75×75 m, cao 23,75 m**; hành lang chiến binh phía đông mở sẵn. Hàng trăm cư dân cổ vũ, giới hạn theo đồ họa. Cự Thú 2.400 HP được nhốt, mở cửa mới ra; có cảnh báo đòn, chiến đấu và phần thưởng. Cầu thang 200 bậc; bỏ lớp cát trùng gây nhấp nháy. Bay phía trên mái không bị tường vô hình chặn.
- **Ga Đấu Trường** chuyển theo, cách tâm khoảng 256 m, có đường bộ tới cửa chiến binh; cả sáu tàu phục vụ. Giữ mạng ray, điều phối và sông. Nền đấu trường/đường ga không mọc cây ngẫu nhiên. Nguồn Blender đúng hình học game: `Assets/Art/Blender/Environments/GrandRomanArenaCurrent.blend`, texture đóng gói. Export bằng `tools/tests/export_current_arena.browser.js`, dựng bằng `tools/build_current_arena_blender.py`; xem `docs/ROMAN_ARENA.md`.
- Đã phục hồi đường lên đỉnh làng 8 bị cache cũ không khớp. Đủ **69 đường**, đi thử **110.772 bước** hai chiều không kẹt/rơi, bake lại `world/data/highland-walking-routes.js`. Ngưỡng cache trong `highland-trails.js` giữ **0,2 m**, không giữ ngưỡng nới tạm. Khởi động mới xác nhận dùng cache thành công.
- Kiểm tra: **28** sinh vật/đấu trường, **248** đường ray, **47** di chuyển ga (10.072 bước), **2** đường ga mới (357 bước), **26** tương tác E/đu dây, **7** điều khiển thật, **5** nguồn Blender đều đạt. Test E phân biệt tương tác trang trí với rương hữu ích đã nhận để chạy lại sau suite khác. Báo cáo/ảnh: `demo/verification/creature-arena/`. Báo cáo đường dài ở `demo/verification/terrain-traversal/report.json` ghi cache cũ chưa khớp trước khi bake; xác nhận cache mới nằm trong suite đường ray sau khởi động mới.
- Đã dọn **432 file, 460,08 MiB**: báo cáo/dữ liệu xuất tạm, cache, FBX Unity không được browser dùng và cảnh/công cụ đấu trường đã thay thế. Manifest đường dẫn, lý do, byte, SHA-256 và kết quả xóa: `docs/cleanup-creature-arena-20261031.json`. Sau dọn, **134 tài nguyên web** vẫn trả HTTP 200; hai nguồn Blender hiện tại còn đủ. Giữ runtime/assets, builders/tests, log server và bản phục hồi `.runtime/arena-creatures-rollback-20261031.zip`. Không reset/clean Git; các thay đổi cũ được giữ. Chưa commit/push/deploy.

### Chạy game ngày mai

Tại gốc dự án, chạy **`python tools/serve_game.py --port 8883`**, mở **http://127.0.0.1:8883/**. Nếu server đã chạy thì dùng lại. Mở **http://127.0.0.1:8883/?arena=1** tới lối chiến binh hoặc **G → Đấu Trường La Mã**. **E** mở cổng thú; chiến đấu theo điều khiển hiện tại. **B** thư viện, **M** bản đồ, **P** skin; chuột phải khóa chuột, **Esc** trả con trỏ. E đu dây cổ thụ/C ngồi ghế/E xuống ga kế tiếp được giữ.

Sau sửa JS/CSS: `python tools/refresh_web_assets.py`, tải lại trang. Kiểm tra: đặt `GAME_VERIFY_SCRIPT=creature_arena.browser.js`, `GAME_VERIFY_OUTPUT=demo/verification/creature-arena`, chạy `node tools/tests/verify_railway_service.js`. Dùng `GAME_VERIFY_KEEP_OPEN=1` giữ Chrome cô lập và chạy thêm script qua `inspect_void_runtime.js`. Kết quả chốt: `demo/verification/creature-arena/final-checks.json`.

## Mới nhất — Bỏ tương tác E rỗng và đu dây cổ thụ (31/10/2026)

- `isUsefulInteraction()` trong `world/exploration-update.js` lọc các điểm chỉ mô tả/chào hỏi và phần thưởng chưa tồn tại: xem kiếm trưng bày, làm quen kỳ lân, cổ vật mật thất, hồ thủy ngân, mô tả đấu trường, cận vệ hang, phong ấn kho báu kim tự tháp, lời chào dân làng, buff E cũ của cây và các mô tả hầm/ban công/gác mái. Profile kiểm thử mới có **17 điểm bị loại**. Mesh công trình, NPC và nội thất vẫn được giữ; không xóa bản đồ hay vật phẩm.
- Bộ chọn E, bộ xử lý hành động và beacon cùng dùng bộ lọc; bỏ cả đích khỏi `interactables` sau khi khởi tạo. Không chỉ giấu dòng nhắc. Rương cánh/đèn pin đã sở hữu, vé VIP đã nhận, cổng VIP đã mở, kho báu hang đã nhận kèm bản đồ và ngai vàng đã hiện vương miện không tiếp tục hiện E vô ích. NPC nhiệm vụ trung tâm vẫn dùng được lần đầu để hoàn thành bước nhiệm vụ.
- `world-residents.js` bỏ listener E chào hỏi vốn chặn các thao tác cửa/thang máy gần NPC; `talk()` trả false để giữ tương thích API. Cư dân/vệ binh vẫn đi lại, làm việc và tự ghi nhận vào thư viện. Thư viện không còn hướng dẫn E trò chuyện cho các NPC này. Tương tác nhặt đồ, khai thác gỗ, chế tạo, cửa/cổng, thang máy, cầu thang, kho báu, bản đồ, thuyền và tàu lửa được giữ.
- **Đu dây:** sau khi phát hiện cổ thụ, tới vòng bám dưới chân dây rồi **E một lần**. Điểm bám được tìm ở nền trống quanh gốc để tránh rễ/collider. `explorationUpdate.nearby()` ưu tiên đúng dây/rương cây trước các mục khác; loại tương tác `tree` cũ bán kính lớn nên nó không che mất thao tác lên dây nữa.
- Nhân vật đi theo chiều dài đường dây khoảng 10 giây, có vòng trượt/dây treo, thân ở cạnh dây thay vì bị dây che. `hero-animation.js` thêm tư thế `ropeRiding` chung cho cả năm skin. Chuyển sang lệch bên được làm từ từ; camera vẫn xoay/thu phóng bình thường. WASD, nhảy, C và F khóa khi đang bám; mở balo/modal tạm dừng hành trình an toàn. Phát hiện dịch chuyển/respawn sẽ hủy bám thay vì kéo nhân vật trở lại dây.
- Đáp đúng sàn trên ngọn, nhận **Hạt đậu thần** duy nhất; tới đầu dây trên đỉnh rồi E để xuống chân cây. Giữ save vật phẩm và hệ thống va chạm cành/rễ/lá từ lượt trước. Hành trình không gây sát thương rơi.
- **Kiểm thử:** 27/27 kiểm tra E/đu dây, gồm tư thế cả năm skin và vật phẩm duy nhất; 8/8 đầu vào Chrome thật (E lên/xuống, khóa W/C/F, balo và tạm dừng); kiểm tra lại 38/38 khám phá và 248/248 đường sắt. Không có lỗi runtime khi nạp bản thử. Báo cáo/ảnh: `demo/verification/meaningful-interactions/`; script chính `tools/tests/meaningful_interactions.browser.js`, đầu vào thật `tools/tests/verify_vine_controls.js`.
- Bản sao trước sửa: `.runtime/meaningful-interactions-before/`. Cách chạy vẫn là `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Tải lại trang để nhận mã mới; **G → Rừng Nguyên Sinh**, tìm cây lớn và vòng bám dưới chân dây. Sau khi sửa asset, chạy `python tools/refresh_web_assets.py`.

## Mới nhất — Sa mạc, camera, toa tàu, hang và cổ thụ (31/10/2026)

- **Kim tự tháp:** chuyển cả công trình, 13 tầng mê cung, tương tác, Nhân Sư và đường tới ga sang **X=1500, Z=−1400**, nền khoảng **Y=11,329**. Bỏ khởi tạo sa mạc ở vị trí cũ; vùng đó trở về nền mặt trăng. Mặt đất dùng thuộc tính `biomeSand` trong vật liệu chung, có vân cát và sắc ấm; không phủ cát lên lòng sông/bờ nước. Khởi tạo `installDesertRealm()` sau `installSouthernExpansion()` để lấy đúng nền mở rộng. `terrain-continuity.js` và bộ lấy mẫu nền cũ chấp nhận sa mạc chưa được khởi tạo.
- **Ga mới:** chỉ có một **Ga Kim Tự Tháp**, gần **(1495, −1673)**; sáu đoàn tàu vẫn phục vụ cả hai chiều. Bộ lập ga không được tự bỏ Ga Hang Tà Thần/Ga Đấu Trường khi thay địa hình; hai ga này có tìm kiếm vị trí an toàn rộng hơn. Giữ đủ **70 ga**, gồm ga Hư Không. Thứ tự ga được sắp theo vị trí thực trên ray nên thay đổi khi dời công trình. Hai tuyến hình học dùng chung được dựng lại theo vùng sa mạc mới; không tái tạo fixture cũ để che lỗi. Kiểm tra đường sắt vẫn kiểm độ dốc, khoảng hở sông/đất, chướng ngại, cầu/trụ, tín hiệu và sáu đoàn tàu.
- **Camera:** lăn chuột vào tới khoảng cách ≤0,65 chuyển góc nhìn thứ nhất, camera ở tầm mắt, ẩn model bản thân và dùng near plane 0,045. Lăn ra khôi phục ngoại hình/góc nhìn thứ ba. Trên tàu vẫn giữ góc nhìn trong toa và chức năng thu/phóng ngắm cảnh.
- **Trên tàu:** CSS `aboard-sightseeing` ẩn bảng tàu, gợi ý, thông báo vật phẩm/chiến đấu/thời tiết và thanh phím dưới màn hình. **C chọn ghế vật lý gần nhất trong 1,65 m**, không dịch chuyển tới ghế ở xa. C lần nữa đứng lên. **E** đăng ký xuống ga kế tiếp, tự xuống khi tới ga; giữ bất tử trên tàu. Các modal chủ động mở bằng phím tắt vẫn hoạt động.
- **Hang Tà Thần:** `prepareEvilCavernAccess()` mở hành lang vòng ngoài phòng kho báu và gỡ đúng mesh/collider tương ứng trước khi dựng hang. Phòng cuối chỉ có một cửa **E**; tất cả **441 ô mê cung** vẫn liên thông. Cắt lại tam giác nền tại miệng hang sau các bộ sửa địa hình, trước khi chia render chunks; thêm đèn dẫn xuống cầu thang. Bịt dải trống giữa đỉnh tường mê cung và trần phòng cuối; giới hạn bay bám đúng trần, không thoát xuyên lên mặt đất.
- **Bản đồ lối ra:** nhận cùng kho báu Nakat; là vật phẩm riêng trong balo, **K** mở bản đồ trực tiếp và đường BFS về cầu thang khi ở trong hang. Lưu `tsuventure_cave_map_v1`. Save đã nhận Nakat trước cập nhật được cấp bản đồ khi tải; không cấp thêm Nakat.
- **Cổ thụ:** phát hiện cây sẽ hiện dây leo; E ở chân dây để leo lên trong khoảng 10 giây, E tại đầu dây trên đỉnh để xuống. Có sàn nghỉ/rương trên ngọn. **Hạt đậu thần** là vật phẩm hiếm duy nhất, lưu `tsuventure_magic_bean_v1`; chức năng sử dụng cập nhật sau. Va chạm bám **11.282 tam giác** của model Blender hiện tại, chia ô không gian 8 m; chặn di chuyển ngang/lên và hỗ trợ đứng/đáp trên cành, tán lá. Không chỉ dùng hình trụ thân cây.
- **Tương thích đường đi:** đã đi thử **110.772 điểm**, toàn bộ 69 đường làng hai chiều. Dịch hai nút đường lên đỉnh làng 11 khoảng 2 m để tránh chậu cây cạnh ga; bake lại `highland-walking-routes.js`. Giữ logic khảo sát đường cũ, không giữ thay đổi ngưỡng cache thử nghiệm. Khi một sảnh thang máy được dời sang bờ khô, nếu chênh cao thực còn dưới 5 m thì dùng thang bộ; tránh hai tầng thang máy chồng gần nhau và lan can cắt lối vào.
- **Mã chính:** `demo/features/world/exploration-update.js` / `.css`, các module desert, railway, cavern và inventory hiện có. Khởi tạo exploration sau terrain traversal, trước graphics quality. Dùng lại model Blender hiện có; lượt này không có connector Blender và không thay file `.blend`.
- **Kiểm thử:** `tools/tests/exploration_update.browser.js`, `verify_exploration_controls.js`, `railway_service.browser.js`, `station_mobility.browser.js`; báo cáo/ảnh tại `demo/verification/exploration-final/`. Kiểm thử Chrome dùng profile riêng, không sửa save của người chơi. Bản sao các file trước sửa nằm trong `.runtime/exploration-update-before/`.
- **Kết quả bản cuối:** 38/38 kiểm tra khám phá; 248/248 kiểm tra đường sắt; 41/41 kiểm tra tiếp cận ga, đi thử 9.140 điểm; 7/7 kiểm tra đầu vào Chrome thật (lăn chuột, C, E). Không có lỗi runtime trong lần nạp bản cuối. Kiểm tra cú pháp cả script nội tuyến và 14 file JS thay đổi đều đạt. Báo cáo riêng: `report.json`, `railway-regression.json`, `station-mobility.json`, `native-controls.json`. Bản đồ đã chạy tại cổng 8883; nếu server còn sống thì không cần chạy thêm instance.

### Chạy game ngày mai

Tại thư mục gốc dự án, chạy `python tools/serve_game.py --port 8883`, rồi mở **http://127.0.0.1:8883/**. Dùng **http://127.0.0.1:8883/?desert=1** tới sa mạc mới hoặc **http://127.0.0.1:8883/?cavern=1** tới cửa hang. **G → Rừng Nguyên Sinh** tới khu cổ thụ. Nếu cổng 8883 đã chạy thì dùng lại server hiện tại. Sau khi sửa JS/CSS, chạy `python tools/refresh_web_assets.py` trước khi tải lại trang.

Để kiểm tra tự động: đặt `GAME_VERIFY_SCRIPT=exploration_update.browser.js`, `GAME_VERIFY_OUTPUT=demo/verification/exploration-final`, rồi chạy `node tools/tests/verify_railway_service.js`. Kiểm tra đầu vào thật bằng `node tools/tests/verify_exploration_controls.js` khi Chrome kiểm thử được giữ mở (`GAME_VERIFY_KEEP_OPEN=1`). Không chạy `git reset`, `git clean` hoặc xóa asset: dự án có nhiều thay đổi cũ chưa commit đã được giữ nguyên.

## Mới nhất — Skin, cửa, dân cư và bãi quái tránh công trình (30/10/2026)

- **P / nút Skin** thay mục Nhân vật trong sảnh và HUD. Năm model cũ trở thành năm ngoại hình với phần mô tả trang phục/chi tiết. Bỏ bảng chỉ số và mô tả kỹ năng riêng. Giữ ID nội bộ `modal-heroes`, `selectHero()` và rig để tương thích UI/animation; không còn lựa chọn lớp chiến đấu khác nhau.
- Logic thật đã đổi: đòn thường của cả năm skin gửi cùng kiểu chiến đấu `hamster` tới 12 bộ nhận đòn; nhịp đánh đều **0,5 giây**; bỏ nhân tốc độ Ninja, chí mạng/Ảnh Bộ riêng và giảm sát thương 20% của Kong. **F** dùng cánh theo trang bị cho mọi skin. Máu, giáp, thể lực, oxy và trang bị đang có giữ nguyên khi đổi skin. Kiếm dung nham/Giáp cuồng nộ vẫn có tác dụng vì đây là trang bị, không phải skin.
- **Đấu trường Tuyết:** đắp/sửa chính mesh đất dùng chung trước khi lập chỉ mục ray và vật lý. Sàn đấu hình tròn bán kính **68 m**, dày 0,5 m, nằm ăn vào đất dưới sân; bỏ các góc sàn vuông vươn ra sườn dốc. Địa hình nối ra nền gốc bằng dải chuyển tiếp. Dốc vào sân được lấy mẫu tam giác theo nền thật; đoạn đi kết thúc ở bờ khô, không dẫn xuống sông phía trước. Điểm G → Nữ Chúa Tuyết là **arena.z + 78**. Boss giữ vị trí và AI cũ.
- **Nhà máy Tuyết:** thêm hai cánh cổng kim loại có song, chóp vàng, va chạm thật và tự mở khi người ở cùng cao độ tới gần; đóng lại khi lối vào đã trống. Collider cổng dùng vùng quét cố định, cập nhật góc/vị trí mà không xây lại toàn bộ lưới va chạm mỗi frame. Bổ sung giá hàng có đợt/nguyên liệu, xe đẩy và bánh xe, cuộn giấy gói, bàn điều khiển, ghế/bàn/máy tính và phòng điều phối tầng trên. Giữ ba tầng và dây chuyền/NPC/pha lê hiện có.
- **Cửa chung cư:** thêm `void/apartment-doors.js`. Cửa chính hai cánh trượt ở cả tám tòa; đủ **2.400 cửa căn hộ** theo floor streaming. **E** mở/đóng, cánh quay vào phòng, có va chạm theo góc và kiểm tra vị trí trước khi đóng để tránh kẹp người. Trạng thái mở lưu bằng `tsuventure_apartment_doors_v1`. Mặc định cửa đóng; vào nhà cần mở cửa chính và cửa phòng. Thang máy vẫn dùng E như trước.
- **Dân cư:** thêm 22 NPC bánh kẹo (11 bánh gừng, 11 kẹo dẻo), đi dạo trong vương quốc, E trò chuyện; 16 bảo vệ tím/vàng (hai người ở mỗi tòa Hư Không). Vệ binh/thợ Noel hiện có được đăng ký để trò chuyện/thư viện, không sinh thêm bản trùng. NPC hiền lành, không thuộc danh sách mục tiêu quái.
- **Sinh vật sông:** hai loài tôm, hai loài cua, hai loài ốc có thân/đốt/râu/càng/chân/vỏ xoắn. Dùng toàn bộ dữ liệu habitat sông cũ và mở rộng, đặt theo `riverBoat.waterAt().bottom`, kiểm tra nước lại khi di chuyển. Vẽ bằng sáu InstancedMesh, tải quanh người chơi; giới hạn theo Mượt/Trung Bình/Cao, không tạo hàng nghìn Object3D hoạt động khắp map.
- **Thư viện:** thêm 11 mục (5 nhóm NPC và 6 loài đáy sông), đủ tên, mô tả, ảnh 3D thật từ model dùng trong thế giới. Ghi nhận gặp theo khoảng cách; sinh vật dưới đáy cần quan sát dưới nước. Tổng hiện tại **186 mục**. Không xóa ghi nhận khám phá cũ.
- **Bãi quái:** thêm `world/construction-zones.js`, kiểm tra mặt bằng hai chiều gồm cả sân/trong nhà/mái thay vì chỉ kiểm tra va chạm ở độ cao nền. Bao gồm lâu đài, đền, đấu trường, công nghệ, kim tự tháp, khu bánh kẹo, nhà máy/sân băng, chung cư, làng, ga và cầu đi bộ. Bãi cần vùng trống 18 m, từng vị trí quái và đường đuổi cũng tránh công trình. Sau khi xây xong các công trình/đường nối, `constructionZones.refresh()` và `monsterCamps.revalidate()` dời bãi lỗi; giữ ID, máu, chiến lợi phẩm, trạng thái đã nhận và đồng hồ 30 phút. Rà soát hiện có **274/274 bãi hoạt động** ngoài khuôn viên công trình.

### Kiểm tra và chạy

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/**, Ctrl+F5 để lấy bản mới. Nếu server đang chạy thì dùng lại, không mở trùng cổng. **P** Skin · **E** cửa/thang máy/trò chuyện · **B** thư viện · **G** địa điểm.

```powershell
$env:GAME_VERIFY_COMMUNITY='1'
$env:GAME_VERIFY_VOID='1'
$env:GAME_VERIFY_OUTPUT='demo/verification/skin-community-final-regression'
node tools/tests/verify_railway_service.js
```

`tools/tests/skin_community.browser.js` đã đạt **25/25**, gồm đổi skin không thay vitals/phòng thủ, 60 lần gửi đòn giống nhau, cửa đóng chặn/mở bằng E/đi qua/lưu, cổng nhà máy hai trạng thái, đủ cư dân/bảo vệ, bãi tránh công trình, sinh vật bám đáy và ảnh thư viện, toàn bộ mép sàn sân tròn có đất đỡ và đi vào/ra sân trên nền thật. Báo cáo/ảnh tại `demo/verification/skin-community-final/`.

Đã chạy hồi quy: **42/42** tính năng Hư Không/trang bị/thời tiết, **250/250** tàu và ga; **19/19** đi bộ cũ với **110.766 điểm**, **36/36** thang máy/cầu đổi chiều với **5.266 điểm**; chuột khóa native và **I/B/M/O/P/Esc** đạt. Bài kiểm tra Hư Không đã mở cửa bằng API trước khi kiểm tra đường vào phòng và cập nhật cổng khi đi qua, phù hợp cơ chế cửa mới. Đợt này không đo FPS chơi bình thường.

Lượt nghiệm thu cuối tại `demo/verification/skin-community-final-regression/` đạt lại **25 + 42 + 250** mục, gồm **8.290 điểm đi bộ mới**, không lỗi JavaScript và phím/chuột native đạt. Báo cáo cộng đồng cập nhật ở `demo/verification/skin-community/report.json`; ảnh sân chạm đất, dân cư, bảo vệ, sáu loài đáy sông và giao diện Skin ở `demo/verification/skin-community-final/`. Thư viện có **19 quái, 44 sinh vật, 11 nhóm NPC và 112 địa điểm**, tổng 186 mục.

File chính: `characters/hero-stat-sync.js`, `characters/kingkong/kingkong.js`, `characters/ninja-yinyang/abilities.js`, `world/construction-zones.js`, `world/world-residents.js`, `world/monster-camps.js`, `world/antarctic-realm.js`, `void/apartment-doors.js`, `void/void-district.js`, `void/winter-architecture.js`, thư viện/HUD và điểm nạp trong `demo/index.html`. Bản sao trước sửa: `.runtime/skins-community-before/`. Không sửa `cavern-surfaces.js`, không reset repo. Dùng `python tools/refresh_web_assets.py` sau thay JS/CSS.

Lưu ý tiếp tục: các kiểm tra lịch sử yêu cầu Ninja nhanh/chí mạng/Ảnh Bộ hoặc Kong giảm sát thương đã bị yêu cầu Skin mới thay thế. Không bật lại những lợi thế đó khi chỉnh model. Khi thêm công trình mới, cập nhật vùng cấm bãi quái và chạy lại revalidate trước khi cho chơi. Công thức vật phẩm từ chín mảnh hư không vẫn chờ người dùng, không tự thêm.

## Mới nhất — Chung Cư Hư Không, nhà máy Tuyết, kho đồ và thời tiết (30/10/2026)

### Phần đã triển khai

- **Chung Cư Hư Không:** tám tòa trên khu đất khô rộng, mỗi tòa **30 tầng × 10 phòng = 2.400 phòng**. Vị trí khoảng **X 955 / Z −2670**. Phòng có module nội thất Blender: giường/chăn/gối, sofa, thảm, bàn/ghế, tủ sách, bếp, tủ lạnh và phòng tắm. Có cửa đi thật, vách/sàn/trần và va chạm đồ lớn. Nội thất tải theo tầng đang ở; mặt tiền dùng instancing, các module chia sẻ geometry/material. Chuyển tầng dọn mesh riêng của tầng trước.
- **Thang máy 30 tầng:** E gọi tại sảnh; bước vào cabin rồi E mở bảng tầng. Cửa trượt, cabin tăng/giảm tốc, khóa bước/nhảy khi đi và đưa nhân vật theo đúng sàn; không bị đưa lên mái hoặc tính sát thương rơi. Đây là thang trong chung cư; các thang ga tàu vẫn giữ hai điểm dừng như đợt trước.
- **9 mảnh hư không:** chọn ngẫu nhiên chín phòng khác nhau từ 2.400 phòng. Seed và ID đã nhặt lưu độc lập trên thiết bị; tải lại không đổi chỗ/nhặt lại. E ở gần để lấy. Đủ chín mảnh vẫn giữ bộ trong kho, **chưa ghép vật phẩm vì người dùng sẽ cập nhật vật phẩm sau**.
- Thêm **Ga Chung Cư Hư Không** vào mạng ray hiện tại: **70 ga**, giữ toàn bộ 69 tên ga cũ và sáu đoàn tàu. Không thay mạng dày đặc thành vòng rìa. Có hai đường bộ nối hai chiều ga vào khu chung cư, vượt nước có mặt cầu, tay vịn và trụ hở. Khi giải quyết mặt sàn chồng nhau phải chọn mặt đỡ cao nhất hợp lệ, tránh lối cầu bị lớp mép sân thấp kéo người xuống nước. Sân ga ngược thấp không có `access` riêng thì dùng đầu đường dốc đi bộ hiện có làm điểm nối.
- **Kho I:** hai nhóm **Vật phẩm / Trang bị**, **5 ô ngang**, tìm kiếm; chọn ô xem chi tiết và dùng nút thật của vật phẩm. `inventory-workspace.js` nâng cấp giao diện sau khi các vật phẩm/trang bị đã khởi tạo, giữ `inventoryLayout.grid` làm nơi nhận row cũ và `inventoryLayout.render()` làm API tương thích. Không sao chép nút hoặc tách số lượng sang một kho mới.
- **Ảnh vật phẩm:** Blender render PNG 256×256 có alpha cho động cơ vĩnh cửu, kiếm dung nham, pha lê tuyết, giáp sắt, đồ lặn, giáp cuồng nộ, mảnh hư không và Nakat. “Đồ bơi” trong yêu cầu được áp dụng cho bộ đồ lặn hiện có.
- **Nhà máy Tuyết:** giữ vị trí, xây lại thành ba tầng, cổng có hai vệ binh Noel, 12 dây chuyền và 24 công nhân. Có băng chuyền quà chạy, máy quét, bàn đóng hộp, giá hàng, khung chịu lực, kính, mái tuyết và ống khói. Cầu thang chuyển tầng có mặt đỡ và tay vịn; chiếu nghỉ đặt ngoài đầu chuyến thang để không cắt ngang hai bậc cuối. Pha lê chuyển lên giá nguyên liệu, điểm tương tác ở tầm lấy được; giữ lượng lấy/thời gian hồi cũ.
- **Nữ Chúa Tuyết:** bỏ kiến trúc sân hình hộp cũ; thay bằng đấu trường băng, trụ tinh thể, cổng, hoa văn bông tuyết hoàng gia và ngai Blender. Giữ boss ẩn trong tuyết và AI hiện có. Hạ lớp đất khô bên dưới sàn trước khi lập chỉ mục ray/vật lý; không đổ nền vào lòng sông. Sàn băng có lớp trang trí riêng để không tranh độ sâu với nền tuyết.
- **Kho báu Hang Tà Thần:** có đèn riêng trong phòng, model Nakat, bàn bản đồ trực tiếp. E ở rương nhận đúng **1 Nakat một lần**; E tại thiết bị mở bản đồ; **K** mở lại trong hang. Bản đồ dùng đồ thị hành lang thật, đánh dấu người chơi và đường ngắn nhất tới cầu thang ra ngoài. Không thay nội dung mê cung/giun/cận vệ cũ.
- **Giáp cuồng nộ:** công thức **50 sắt + 20 uranium + 1 Nakat**, dùng kho tài nguyên chung và lưu trang bị cũ. **500 giáp**; khi chịu đòn từ kẻ địch, **+30% sát thương trong 30 giây**, được làm mới khi nhận đòn tiếp theo; tháo giáp thì mất hiệu ứng. Sát thương môi trường không kích hoạt. Giáp sắt và giáp cuồng nộ loại trừ nhau; đồ lặn vẫn hoạt động. Có model Blender gắn trên bộ áo thích ứng kích thước nhân vật và đồng hồ HUD.
- **Thời tiết không chồng nhau:** mỗi 120 giây chơi kiểm tra xác suất **15%** bắt đầu một sự kiện. Mưa thủy tinh **180 giây**, gây sát thương khi ngoài trời và không có giáp bảo hộ; thiên thạch **180 giây**, vòng đỏ cảnh báo 4 giây, né được, gây một đợt sát thương/rung khi va chạm, giáp giảm và hấp thụ; sao chổi **360 giây**, chỉ làm đẹp. Mái che/hang che chắn. Đồng hồ dừng trong sảnh/hội thoại/bảng thao tác; hết hạn dọn hiệu ứng. Bất tử trên tàu vẫn được ưu tiên.

### Blender và file chính

- Nguồn: `Assets/Art/Blender/Environments/VoidAndWinterStudio.blend`, có scene studio module và scene **VoidApartments8Towers** lắp tám tòa, đủ 30 tầng/tòa, nội thất tầng mẫu. Không ghi đè model công trình cũ.
- Builder: `tools/build_void_update.py`; Blender executable hiện tại **E:\blender.exe**. Đã chạy Blender thật ở chế độ nền, xuất 18 model module và 8 ảnh. Không dùng cầu nối GUI đang tắt để tuyên bố đã kết nối live.
- Mesh xuất: `demo/features/void/data/void-assets.js`; model/kiến trúc/logic tại `demo/features/void/`. Các điểm tích hợp: `demo/index.html`, `railway/moon-railway.js`, `world/antarctic-realm.js`, `world/realm-transit-update.js`, `world/terrain-traversal.js`, `survival/player-life.js`, `characters/combat-balance.js`, `characters/player-experience.js` và các bộ phân bố cây/quà/quái.
- Giao diện: `inventory/inventory-workspace.js`, `void/void-update.css`. Giữ `inventory-layout.js` cũ làm lớp tương thích.
- Hướng dẫn chi tiết: **docs/VOID_AND_WINTER_UPDATE.md**. Bản sao trước sửa trong `.runtime/void-update-before/`; không hoàn tác toàn bộ repo vì có nhiều thay đổi sẵn từ trước. **Không sửa `cavern-surfaces.js`** chỉ vì file đang mở trong IDE.

### Chạy và kiểm tra

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/**, Ctrl+F5. Nếu server cổng 8883 đang chạy thì dùng lại, không mở trùng. **G → Chung Cư Hư Không / Nhà máy Tuyết / Nữ Chúa Tuyết**, **I** kho, **E** tương tác/thang máy, **K** bản đồ hang, Esc hiện chuột/đóng bảng.

```powershell
& 'E:\blender.exe' -b --python tools/build_void_update.py
python tools/refresh_web_assets.py
$env:GAME_VERIFY_VOID='1'
$env:GAME_VERIFY_OUTPUT='demo/verification/void-update-regression'
node tools/tests/verify_railway_service.js
```

**Đã đạt:** **42/42** kiểm tra phần mới, đi bộ **8.290 điểm** ở cả hai đường nối ga, tám cửa tòa và hai cầu thang xưởng theo hai chiều; kiểm tra cửa/sàn đủ **2.400 phòng**, cabin lên tầng 30 rồi về, nhặt chín mảnh không trùng, Nakat một lần, trừ đúng nguyên liệu, giáp/buff/hết hạn, mưa/sao chổi/né thiên thạch/che chắn. **250/250** kiểm tra hệ tàu, giữ **9.677 điểm cong** nguyên hash và sáu đoàn tàu; khóa chuột native và phím **I/B/M/O/P/Esc** đạt. Không lỗi JavaScript trong báo cáo cuối.

Đã chạy riêng hồi quy đường cũ: **19/19**, **69 đường / 138 lượt / 110.766 điểm** không kẹt/rơi; thang máy/cầu đổi chiều cũ **36/36**, **5.266 điểm** đi bộ. Cache đường làng vẫn khớp, **không cần bake lại**. Không đo FPS chơi bình thường, không hứa 60 FPS.

Báo cáo: `demo/verification/void-update/features-report.json`, `railway_service-report.json`, `terrain_traversal-report.json`, `station_mobility-report.json`; hồi quy tàu/native tại `demo/verification/void-update-regression/`. Ảnh phần mới tại `demo/verification/void-update/` và `demo/verification/void-art-review/`. Các thư mục này sinh tự động và được Git bỏ qua.

Ảnh và kiểm tra ngoại hình cuối: `demo/verification/void-art-review/`, **4/4 mục đạt**. Phần ngực/vai lấy từ model Blender, khớp kích thước thân và kết hợp lớp áo theo từng bộ phận để tay/chân tiếp tục theo animation; không gắn cả một nhân vật giáp thứ hai lên người chơi.

**Chờ người dùng:** chỉ công thức/vật phẩm cuối ghép từ 9 mảnh hư không, đúng yêu cầu “sẽ cập nhật sau”. Không tự bịa vật phẩm hoặc tiêu thụ bộ mảnh trong đợt này.

## Mới nhất — thang máy trên bờ khô và cầu đổi chiều tại ga khó đi (30/10/2026)

Yêu cầu: chênh dưới 5 m dùng thang bộ có đường dẫn đẹp và tay vịn; từ 5 m dùng thang máy chỉ phục vụ mặt đất và sân ga. Ga xuôi/ngược khó đi lại phải có đường nối thuận tiện, đặc biệt Nguyệt Quế Đông. Chân thang máy bị ngập phải dời sang bờ khô và cải thiện hình thức thang.

- Thêm `demo/features/railway/station-mobility.js`. `buildRailwayAccess()` giữ ga sát nền, giữ/cải thiện thang bộ ngắn và chuyển lối chênh từ **5 m** sang thang máy. Xử lý cả cầu thang đi xuống dốc, không coi độ cao âm là cầu thang phẳng.
- **20 thang máy, mỗi thang đúng 2 điểm dừng**: 8 lối mặt đất ↔ sân ga và 12 thang sân ga ↔ cầu bộ hành cho 6 khu đổi chiều. Thang nối cầu là thang riêng; không thêm điểm dừng thứ ba vào thang chính.
- Có cầu đổi chiều tại **Ga Viễn Du 4, Ga Làng Nguyệt Quế Đông, Ga Làng Sương Lam Đông, Ga Làng Thạch Nguyệt Tây, Ga Làng Vân Đỉnh Tây và Ga Hồ Băng**. Ga thấp cơ bản không bị thêm cầu/tháp thừa. Cầu ở cao hơn hai đoàn tàu ít nhất 8,5 m; chọn đầu ga tránh đường làng, dốc vào ga và đất nhô cao.
- Chân thang chọn bờ khô theo mặt đất và mặt nước, tránh vật cản; nếu vị trí cầu thang cũ bị ngập thì tìm chỗ khô khác và nối lại hành lang vào sân ga. Ga Nguyệt Quế Đông đã chuyển chân thang ngược khỏi vùng nước; có bậc nối ngắn vào sảnh.
- Cabin kính, sàn gỗ, khung thép xanh, nẹp vàng, mái che, đèn, biển tầng và cửa trượt. Khung cao có giằng; hành lang dài có cột nhỏ bên dưới, không đắp tường đá. Thang bộ có tay vịn chắc hai bên; chỗ giao với đường làng ở mặt đất để thoáng, tránh rào ngang đường cũ.
- **E** ở cửa: gọi thang. Khi thang đến: đi vào cabin rồi **E** để đi đến điểm dừng còn lại. Cửa tầng đóng khi cabin đi vắng; cabin tăng/giảm tốc, đưa nhân vật theo sàn thật. Trong chuyến đi khóa bước ra/nhảy, cập nhật sàn và xóa trạng thái rơi. Thang máy được ưu tiên trước thao tác lên tàu khi đứng sát nút gọi. Có nút bấm nếu đang hiện chuột.
- Vật lý đi bộ, va chạm, trọng lực, chế độ đồ họa và trợ giúp phím đã tích hợp hệ thống mới. Không thay đổi mạng ray, cao độ tàu, sáu đoàn tàu, vé, tên ga hoặc nội dung hang động.

### Kiểm tra và chạy lại

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/**, **Ctrl+F5** để tải bản mới. Nếu server cổng 8883 đang chạy thì dùng luôn, không mở bản thứ hai.

```powershell
$env:GAME_VERIFY_WALKING='1'
$env:GAME_VERIFY_MOBILITY='1'
node tools/tests/verify_railway_service.js
```

`station_mobility.browser.js` kiểm tra ngưỡng 5 m, hai điểm dừng, nền khô, gọi ở trên cao, đi cabin hai chiều không mất máu, cửa chắn, các thang còn lại và đi bộ qua mọi cầu nối/thang ngắn. `GAME_VERIFY_WALKING` kiểm tra toàn bộ lối làng cũ; không bỏ qua lỗi đường bị chặn chỉ vì hệ thang máy riêng đã đạt. Dữ liệu đường làng cũ vẫn được giữ và kiểm tra từ cache.

**Kết quả bản cuối:** 19/19 kiểm tra đi bộ, đủ **69 đường / 138 lượt lên xuống / 110.766 điểm**, không kẹt hoặc lỗi rơi; **36/36** kiểm tra thang máy/cầu đổi chiều, gồm **5.266 điểm** đi bộ mới; **249/249** kiểm tra tàu và ga. Không lỗi JavaScript. Chuột khóa native và phím I/B/M/O/P/Esc đã kiểm tra lại thành công. Không đo FPS chơi bình thường trong đợt này.

Báo cáo: `demo/verification/station-mobility-regression/report.json`, `station-mobility-final/report.json` và `terrain-traversal/report.json`. Ảnh Nguyệt Quế Đông (cầu đổi chiều và chân thang trên bờ) ở `demo/verification/station-mobility-final/`. Các báo cáo và ảnh là dữ liệu sinh tự động được Git bỏ qua. Dùng `python tools/refresh_web_assets.py` sau khi sửa JS/CSS rồi Ctrl+F5. Không cần xuất lại đường làng trong đợt này: cache vẫn khớp và đã đi thử đầy đủ.

## Đợt trước — bỏ khối đá nhô, nền ga hai chiều và cầu có trụ (29/10/2026)

Yêu cầu hiện tại: hạ những nhịp ray nâng thừa; đoạn cần đi cao phải có trụ đỡ và khoảng trống bên dưới; bỏ đá kê màu be nhô lên dọc ray. Kiểm tra cả sân ga chiều xuôi và chiều ngược, đặc biệt Ga Phế Tích trong ảnh người dùng. Giữ sáu đoàn tàu, mạng ray dày, 69 tên ga và những khúc cua cao có sẵn.

- `demo/features/railway/moon-railway.js`: phân loại cầu bằng khoảng hở cuối cùng với nền thật, không dựa vào nhãn `ground` cũ. Bỏ batch `ballast` gồm các hộp đá kê rời. Nền đường liên tục chỉ được đắp thấp; ray cao có mặt cầu và trụ. Lan can chỉ cần ở nhịp cao, tránh rào ngang lối đi ở nhịp sát đất.
- `station-grounding.js`: hạ đường thẳng theo nền gốc rồi nối dốc với các điểm cong giữ nguyên; kiểm tra khoảng hở trên toàn bề rộng qua nước và kiểm tra lại vật cản sau khi san phẳng ga/nối dốc. Bao kiểm tra công trình khớp bề rộng đoàn tàu. Nền ga ở vùng bằng mở rộng sang cả sân chờ đối diện, đủ dài cho đoạn ray phẳng tại ga. Báo cáo `stationGrounding.stations[].approaches` có cao độ/khoảng hở của cả hai chiều.
- `highland-railway.js`: các nhịp sát nền không dựng thêm bộ tháp/cáp cầu treo. Cầu cao vẫn có chi tiết cầu; trụ đỡ ray không dùng tường đá kín.
- Sau khi cân nền, khớp lại ray với nền đã dựng thay vì giữ mức cao tính từ đồi nhỏ cũ. Ga Phế Tích chiều ngược từ chênh hơn **18 m** xuống còn **0,045 m** ở điểm lên tàu. Sân ga nào vẫn cần cao có thêm các trụ nhỏ, hở dưới sàn; không kéo khối móng thành tường xuống đất.
- Các thay đổi trước về hành khách bất tử, xuống ga kế tiếp, ngắm cảnh, vé và phím tắt tiếp tục được giữ.

### Chạy game

Tại thư mục dự án: `python tools/serve_game.py --port 8883`, rồi mở **http://127.0.0.1:8883/** và **Ctrl+F5** sau khi cập nhật. Không chạy thêm một server trên cùng cổng nếu server cũ đang hoạt động.

### Kiểm tra tiếp sau đợt sửa này

`node tools/tests/verify_railway_service.js` kiểm tra sáu tàu, cao độ/vật cản/mép sông, trụ cầu, không còn đá kê rời và Ga Phế Tích hai chiều; có ảnh ga và dưới gầm cầu. Đặt `$env:GAME_VERIFY_WALKING='1'` để kiểm tra thêm toàn bộ lối đi bộ trong cùng lượt tải game. Báo cáo đi bộ được lưu ở `demo/verification/terrain-traversal/report.json`. Nếu chỉ còn dữ liệu đường lưu sẵn cũ, chỉ xuất lại bằng `python tools/bake_highland_routes.py --accept-cache-miss` sau khi toàn bộ kiểm tra va chạm/rơi đạt.

### Kết quả đợt này

- **249/249 mục đạt** trong `demo/verification/railway-supports-final-pass/report.json`, không lỗi JavaScript: sáu tàu, vé, bất tử, đi/chọn ghế, ga kế tiếp, camera, tên ga, toàn bộ điểm cong giữ nguyên, vật cản và khoảng hở nước.
- Đi bộ đã đạt đủ các kiểm tra vật lý ở **69 đường / 138 lượt lên xuống / 110.766 điểm**, không kẹt và không mất máu do rơi. Lúc đó chỉ còn mục cache cũ báo không đạt; đã xuất lại **69** bộ đường bằng `bake_highland_routes.py --accept-cache-miss`. Lượt 249 mục cuối xác nhận **`highlandTrails.fromCache === true`**.
- Khoảng hở qua nước thấp nhất **6,5 m**, độ dốc ray lớn nhất **0,32**. Nền đắp đường riêng cao tối đa khoảng **1,015 m**, bao gồm lớp chống chớp 0,015 m. Có **1.903 trụ** cho ray/sàn ga; không còn batch hộp đá kê rời. Chênh điểm tham chiếu ray–đất nhỏ nhất −0,0204 m ở đường ghép, nằm trong độ dày đầu ray.
- Chuột khóa native, các phím I/B/M/O/P và Esc đã đạt trong lượt có ảnh. Ảnh cầu hở có trụ nằm ở `demo/verification/railway-supports-verified/open-piers.png`; ảnh ga cuối ở `demo/verification/railway-supports-views/`. Các thư mục báo cáo/ảnh được Git bỏ qua. Chưa đo FPS chơi bình thường; FPS khi dừng thời gian chụp ảnh không phải phép đo hiệu năng.
- Server đã được khởi động lại ở cổng **8883**. Nếu cửa sổ chơi đang giữ bản cũ, dùng **Ctrl+F5**. Driver kiểm tra nay báo lỗi sớm nếu server chưa bật, thay vì chờ trang trắng.

## Đợt trước — an toàn hành khách, ga sát đất và điều khiển tàu (29/10/2026)

Đã xử lý yêu cầu mới: bất tử trên tàu, xuống ở ga kế tiếp, rà soát ga trên cao, nguyên nhân chết, góc ngắm cảnh và phím tắt. Giữ nguyên sáu đoàn tàu, hai chiều ray, 69 tên ga, mô hình Blender, làng/cư dân, các vùng bản đồ và cơ chế đi trong toa/chọn ghế. Không hoàn tác các thay đổi có sẵn trong dự án.

### Những phần đã hoàn thành

- **Bất tử khi lên tàu:** `player-life.js` chặn giảm máu/giáp ở trạng thái dùng chung, bao gồm những quái cũ ghi trực tiếp vào `gameState`. Khi lên tàu, hủy đạn đang nhắm người chơi, chảy máu, độc, hóa đá, đóng băng, thôi miên và trạng thái bắt giữ. Các bộ AI không chọn/tấn công hành khách; quái thường, boss, sát thương môi trường và rơi không làm chết người đang trên tàu. Khi xuống tàu, nhận sát thương trở lại. Tháo giáp vẫn cập nhật đúng giới hạn chỉ số.
- **Xuống ở ga kế tiếp:** bỏ danh sách chọn ga xuống. Nút **Xuống ở ga kế tiếp**, **E** hoặc **R** trên tàu lấy ga kế tiếp từ thứ tự dừng thực tế của đúng đoàn tàu, bao gồm chiều ngược. Có thể yêu cầu ngay khi tàu còn đỗ. Tàu dừng theo yêu cầu và tự đưa người chơi xuống đúng sân ga của chiều đó. Yêu cầu không đổi ga liên tục và không thu thêm vé. API `toggleRide()` vẫn hỗ trợ việc rời tàu đang đỗ cho cơ chế tự xuống và công cụ kiểm tra.
- **Rà soát toàn bộ 69 ga:** thêm `railway/station-grounding.js`, khảo sát địa hình gốc trước khi đắp nền. Hạ độ cao **21 ga** cùng đoạn tiếp cận; giữ sân dừng bằng phẳng cho cả đoàn, giới hạn độ dốc ray **0,32**. **44 ga đất tương đối bằng** có nền nối địa hình và lối vào thấp; **66/69 ga** có sân bám nền theo kiểm tra. Những vị trí gần cua cao chỉ cần nền thấp thì dùng nền đất/lối dốc thay cầu thang trên không. Còn lối cao ở **Ga Viễn Du 4**, **Ga Hồ Băng** do đoạn nối địa hình/cua cao, và lối theo sườn ở **Ga Làng Sương Lam Đông**. Không hạ các khúc cua cao: đã đối chiếu đủ **9.677 điểm cong**, tọa độ và độ cao giữ nguyên từng điểm.
- **Nền đường ray:** không dùng nền đắp của nhánh ray cao lấp nhánh thấp gần đó. Khôi phục phần nền bị nâng thừa rồi nối nền theo ray thấp; xử lý nội suy tam giác ở đoạn thẳng để ray không chui vào đất. Khoảng hở ray–đất đo được tối thiểu **0,1196 m**, ray–mặt sông tối thiểu **6,5 m**. Vẫn né các công trình cũ; giữ hệ cầu qua sông/đèo và tín hiệu an toàn.
- **Nguyên nhân tử vong:** bảng giữa màn hình ghi nguồn gây chết rồi hồi sinh ở điểm xuất phát. Bao gồm tên đoàn tàu, độ cao rơi, đói, thiếu oxy, độc, dung nham, quái/boss và chảy máu. Bảng độc lập với thông báo vật phẩm; **Enter** đóng, hoặc tự ẩn sau 7 giây.
- **Ngắm cảnh:** **V** chuyển trong toa / cửa sổ trái / cửa sổ phải. **Z/X** hoặc lăn chuột thay góc nhìn trong giới hạn 30–95°; về lại góc nhìn ngoài thế giới sau khi xuống. Nhân vật vẫn nằm trong toa và có thể đi/chọn ghế. Bản đồ nhỏ phóng gần quanh người trên tàu; **M** mở bản đồ lớn ở vị trí tàu với mức phóng 4×.
- **Phím tắt:** `hud/game-shortcuts.js` quản lý **G** địa điểm, **P** nhân vật, **I** balo, **B** thư viện, **M** bản đồ, **O** cài đặt, **H / ?** trợ giúp, **Home** về sảnh. Mở bảng sẽ hiện chuột và dừng phím di chuyển. **Esc** đóng bảng/hiện chuột; trong bảng dùng **Tab / Shift+Tab / Enter**. Ở ga: **R** gọi, **T** đổi tuyến, **E** lên. Trên tàu: **E/R** xuống ga kế tiếp, **WASD** đi lại, **C** ngồi/đứng, **1–8** chọn ghế, **N** đổi ghế, **V** góc nhìn, **Z/X** zoom. Bản đồ: **+/−**, mũi tên, **0** về người chơi, **9** toàn map. Khi gõ mã/tìm kiếm, các phím chữ không kích hoạt chức năng ngoài bảng.

### Kiểm tra đã chạy

- `node tools/tests/verify_railway_service.js`: **243 mục đạt**, cả sáu đoàn tàu; bất tử trước ghi trực tiếp/độc/boss, trạng thái khống chế, vé, đi/chọn ghế, yêu cầu ngay lúc đỗ, ga kế tiếp hai chiều, tự xuống, camera, nguyên nhân chết, ga/ray/nền/công trình. Mốc đối chiếu cong được lưu bằng số điểm và hash byte trong `tools/tests/fixtures/railway-station-baseline.json`; bài kiểm tra không cần báo cáo tạm cũ.
- Trong cùng lượt kiểm tra, **chuột khóa native của Chrome và các phím I/B/M/O/P đã đạt**, mỗi bảng mở và hiện con trỏ, Esc đóng. Đã xem bốn ảnh ga đất, ga núi và hai góc cửa sổ. Báo cáo/ảnh nằm ở `demo/verification/railway-service/` (thư mục sinh tự động, được Git bỏ qua).
- `node tools/tests/verify_realm_transit.js`: **1.516 mục đạt**, khoảng hở qua nước 6,5 m, né công trình, độ dốc, tín hiệu, cả sáu tàu, chế tạo/sinh tồn; lưu trang bị, đói và ăn sau tải lại đạt. `node tools/tests/verify_compact.js`: **71/71 mục đạt** cho map/lâu đài.
- Kiểm tra đi bộ sau đổi nền: đủ **69 lối, 138 lượt lên/xuống, 108.710 điểm**, không có chỗ kẹt, lỗi rơi hoặc mất máu. Lúc đó chỉ còn kiểm tra dữ liệu lưu sẵn báo cache cũ; đã xuất lại bằng `python tools/bake_highland_routes.py --accept-cache-miss`. Lượt dịch vụ tàu cuối xác nhận `highlandTrails.fromCache === true`, đủ bộ đường hiện tại. Tùy chọn này chỉ chấp nhận lỗi cache khi toàn bộ kiểm tra đi bộ đã đạt; không bỏ qua lỗi vật lý.
- Các lượt đạt không có lỗi JavaScript/shader. Ảnh được chụp khi dừng thời gian để kiểm tra hình học, **FPS trong ảnh không phải đo hiệu năng thực tế**. Chưa đo lại FPS chơi bình thường sau đợt này.

### Chạy tiếp ngày mai

Từ thư mục dự án mở PowerShell:

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/** và **Ctrl+F5**. Nếu máy chủ đang chạy thì dùng lại, không mở máy chủ trùng cổng. Giữ cửa sổ Python chạy khi chơi; Ctrl+C để dừng. Không cần Unity/Blender để chơi.

Để kiểm tra nhanh ga: vào **Địa điểm → Ga Nguyệt Bắc / Ga Lâu Đài / Ga Kim Tự Tháp**. Cần **1 xu vàng** để lên tàu; dọn bãi quái nhận xu hoặc dùng CODE theo README. Nhấn chuột phải một lần để nhìn quanh, **E** lên tàu, **V** ngắm cảnh, **E/R** đăng ký xuống ga kế tiếp. Kiểm tra cả sân chiều xuôi và chiều ngược.

Các file chính cho đợt này: `railway/station-grounding.js`, `railway/moon-railway.js`, `survival/player-life.js`, `hud/game-shortcuts.js`, các bộ AI nhận trạng thái hành khách, `world/realm-transit-update.js`, `world/highland-trails.js` và dữ liệu đường đã lưu. Các file nằm dưới `demo/features/`; `demo/index.html` nạp chúng. README đã cập nhật điều khiển và lệnh kiểm tra. Sau sửa JS/CSS chạy `python tools/refresh_web_assets.py`, sau đó Ctrl+F5.

Lưu ý công cụ: lượt kiểm tra pointer lock phải mở Chrome **trực tiếp vào URL game** và đưa trang lên trước. Cách mở `about:blank` rồi điều hướng qua CDP đã gây `WrongDocumentError` cho pointer lock trong môi trường này; không sửa logic game để né lỗi công cụ đó. Bản kiểm tra cuối đã dùng cách mở trực tiếp và đạt.

## Mới nhất — chặn leo vách và đường bộ lên núi (28/10/2026)

Đã xử lý yêu cầu vật lý khi đi trên/dưới đồi và thêm lối lên núi, đặc biệt là đường từ ga xuống làng. Không thay tuyến tàu, tên ga, mô hình làng/cư dân Blender hoặc các vùng bản đồ đã hoàn thành.

- **Vật lý toàn map:** `terrain-traversal.js` giới hạn sườn đất tự nhiên **35°**, tự bước lên tối đa **30 cm**. Không thể lợi dụng các lát chuyển động 8 cm để đi lên vách đứng, hoặc nhảy liên tục để leo vách. Khi đứng/đáp trên sườn quá dốc sẽ trượt xuống; không đẩy chân xuyên vách rồi để cơ chế cứu rơi đưa lên đỉnh. Bay, thuyền, bơi và các sàn công trình có xử lý riêng. Cầu thang lâu đài giữ bộ xử lý từng bậc/chiếu nghỉ để chạy đúng cả ở 15 FPS.
- **69 lối bộ có hình học và mặt đỡ thật:** `highland-trails.js`, gồm **23 lối làng–sân ga, 23 lối lên đỉnh và 23 lối xuống chân đồi**. Đường rộng 1,8 m; đoạn dốc có bậc đá, tay vịn, mũi bậc và móng thấp. Bậc thường 14 cm, tối đa 28 cm trong bản hiện tại. Các đoạn trên tháp ga dùng kết cấu ga hiện hữu, không đổ một khối móng lấp cầu thang bên dưới. Mặt bậc ghép kín tại cua; các ngã rẽ được nối độ cao để tránh bước hụt. Lối ga đi đến sàn chờ qua cả hệ cầu thang/hành lang, không dừng ở một đường vẽ trên đất.
- **Ga có lối dốc cũ không đi được:** `buildRailwayAccess` đo độ dốc lối vào; khi dốc vượt giới hạn thì thay bằng cầu thang đổi vế. Đã bắt trường hợp một ga tăng hơn 100 m chỉ trong khoảng 34 m chiều ngang. Lối bộ né gầm chiếu nghỉ không đủ khoảng trống cho người chơi. Cua đường xuống chân đồi được hạn chế đổi hướng quá gắt, tránh hai vế bậc chồng lên nhau và gây sát thương rơi giả.
- **Đường ngang qua ray:** mặt lát thấp hơn ray, không dựng tay vịn chắn hành lang tàu. Giữ sáu đoàn tàu, hai chiều, 69 ga và quy tắc vé/dừng trước đó. Tàu vẫn gây chết khi đâm người chơi.
- **Cây tránh đường:** tạo đường bộ sau `installWorldSurfaceSync`/cầu treo đường sắt và **trước** `installWesternNature`/`installLivingWorld`. Hai bộ sinh cây dùng `highlandTrails.corridorAt` để không mọc cây ngẫu nhiên chắn lối. Không gọi lại `connectVillageStations()` trong trình tự khởi tạo: đó là đường vẽ cũ; lối hiện tại do `installHighlandTrails()` quản lý.
- **Dữ liệu lưu sẵn:** `demo/features/world/data/highland-walking-routes.js`, bản dữ liệu 6, chứa đường, cao độ/mặt bậc/móng và dấu kiểm tra địa hình. Game dùng bản này để tránh chạy tìm đường và tính lại các giao điểm mỗi lần mở. Có kiểm tra vị trí làng/ga và dấu dữ liệu độ cao; thay địa hình thì khảo sát/xuất lại. `graphics-quality.js` chia mặt đường/móng thành vùng 128 m và giới hạn tầm vẽ. Dò sàn ga lọc các ga xa trước khi tính mặt dốc, tránh quét toàn bộ 69 ga trong mỗi bước di chuyển.

**Kiểm tra đã đạt:**

- `node tools/tests/verify_terrain_traversal.js`: **19 mục đạt**, đi **138 lượt**, cả hai chiều của toàn bộ 69 lối, **108.710 đích bước** bằng hàm va chạm/độ cao thật, không kẹt hoặc mất máu trên cầu thang. Kiểm tra leo/nhảy vách và trượt ở núi tây, vùng băng và map cũ; kiểm tra mặt đường ngang ray, cây tránh đường và dữ liệu lưu sẵn. Báo cáo/ảnh: `demo/verification/terrain-traversal/`. Đã kiểm tra lại bản lưu sẵn thành công với `fromCache: true`.
- `node tools/tests/verify_compact.js` với biến `$env:GAME_URL='http://127.0.0.1:8883/'`: **71/71 mục đạt**, gồm cầu thang lâu đài/mật thất lên xuống ở 15/30/60/144 FPS, tốc độ thường/chạy nhanh, cửa phòng và hành lang. Tăng thời gian chờ kiểm tra vì bản đồ hiện tại lớn hơn bộ kiểm tra cũ. Báo cáo: `demo/verification/compact-report.json`.
- `node tools/tests/verify_realm_transit.js`: **1.516 mục đạt**, **22.445 mẫu ray qua nước**, hở tối thiểu **6,5 m**; vẫn 69 ga/64 cầu đi bộ. Lưu trang bị, đói và ăn hồi phục qua tải lại đạt. Không ghi nhận lỗi JavaScript/shader trong các lượt thành công.

Ảnh kiểm tra được chụp khi tạm dừng thời gian trình duyệt; FPS trong ảnh không phải số đo hiệu năng. Bộ kiểm tra đi bộ dùng máu cao trong hồ sơ Chrome riêng để ghi lỗi rơi mà không làm gián đoạn cả hành trình; đó không phải thông số máu mặc định của game.

**Chạy và tái tạo dữ liệu** từ thư mục dự án:

```powershell
python tools/serve_game.py --port 8883
```

Mở **http://127.0.0.1:8883/**, **Ctrl+F5** để tải mã mới. **Địa điểm → Làng Trăng Khuyết Tây** để xem lối làng/ga; đi theo đường đá và tay vịn lên núi hoặc xuống chân đồi. Nếu cổng đã chạy thì dùng lại, không mở máy chủ trùng.

Sau khi sửa địa hình/ga hoặc thuật toán đường bộ:

```powershell
node tools/tests/verify_terrain_traversal.js
python tools/bake_highland_routes.py
python tools/refresh_web_assets.py
$env:GAME_URL = 'http://127.0.0.1:8883/'
node tools/tests/verify_compact.js
```

`bake_highland_routes.py` chỉ ghi dữ liệu khi các kiểm tra đạt và đủ cả ba nhóm 23 lối. Muốn chủ động khảo sát lại toàn bộ, dùng `GAME_URL` có `?technology=1&surveyTrails=1` khi chạy kiểm tra, sau đó bỏ biến này để kiểm tra lại bản đã lưu. Bộ kiểm tra/Blender là công cụ phát triển; chơi game chỉ cần máy chủ Python. README đã cập nhật vật lý và nguồn đường bộ.

## Mới nhất — làng Blender, ga từng làng và cầu treo (28/10/2026)

Đã thực hiện yêu cầu thêm ảnh gấu trắng, thiết kế lại làng/cư dân bằng Blender, ray bám đất trên núi, tăng ga và bãi quái, thay cầu bằng cầu treo. Giữ các thay đổi bánh kẹo/đá đỏ/tuyết và các hệ thống chơi hiện có; các số liệu dưới đây thay thế số liệu cũ trong các mục lịch sử.

- **Ảnh gấu trắng trong thư viện:** ID thực tế là `polar_polar_bear`, không phải chỉ `polar_bear`. `library-previews.js` nay nhận cả hai; gấu có màu đổ bóng theo hướng để ảnh đọc rõ hình khối. Đã mở đúng thẻ sinh vật trong thư viện để kiểm tra ảnh.
- **Tài sản Blender dùng thật trong game:** `tools/build_lunar_village_assets.py` tạo nhà mái cong nhiều lớp, cửa sổ tròn, biểu tượng trăng, cửa vào/nội thất và ba mẫu cư dân chibi (thợ đá, người làm vườn, người bán tinh thể), cùng tháp/neo cầu treo. Nguồn chỉnh sửa: `Assets/Art/Blender/Environments/LunarVillageAndSuspensionDesign.blend`; xuất hình học/màu sang `demo/features/world/data/lunar-village-assets.js`, được `lunar-village-art.js` ghép vào game. Nhà dùng các nhóm hình học gộp; cư dân dùng mesh gộp và mẫu dùng chung. Giữ **23 làng, 114 cư dân**, tương tác E, nội thất và va chạm nhà. Đã mở lại file Blender nền thành công, scene có 166 đối tượng. Không dùng kết nối GUI/socket trong phiên này.
- **Đường ray qua làng:** `highland-railway.js` mở rộng tuyến lên hai dải núi phía tây, nối vào mạng ray hiện tại. Mỗi làng có **một ga riêng**, đường mòn theo địa hình và biển chỉ dẫn. Tổng **69 ga**, giữ đủ **46 tên ga cũ**; mọi ga đều được cả sáu đoàn tàu phục vụ. Điểm ga mới cách tâm làng dưới 300 m trong lượt rà soát.
- **Ray nằm trên đất núi:** san/đắp chính buffer địa hình và cập nhật chỉ mục va chạm, không chỉ che bằng mặt phẳng nổi. Khoảng **92,38% mẫu ray phía núi** đi trên nền đường đất thật; cầu chỉ phân loại cho đoạn vượt nước hoặc khe/đèo núi. Bảo vệ bậc nền nhà, lòng sông và bờ thấp; hai chiều ray và sân ga được cân bằng độ cao. Giữ cơ chế gọi tàu/dừng một phút, thu một xu, đi trong toa và chọn ghế.
- **Cầu treo:** **64 cầu đi bộ qua sông** và **20 nhịp cầu đường sắt vùng núi** có tháp, neo, cáp võng, dây đứng, dầm và lan can. Móng nối xuống địa hình thật; sàn có mặt đi bộ và lan can có va chạm. Chọn bờ có chênh cao phù hợp để tránh đầu cầu lệch quá lớn. Hình học tháp/neo được xuất từ Blender; cáp và sàn được lắp theo từng nhịp trong game.
- **Bãi quái toàn map:** giữ nguyên ID/trạng thái các bãi cũ, thêm các bãi theo lưới toàn map và dải làng núi. Hiện có **274 bãi / 3.425 quái**, trong đó **21 bãi trên núi cao**. Bãi tránh lõi làng, ga, công trình, sông và khu boss. Vẫn 10–15 con/bãi, dọn sạch nhận một xu + vật phẩm ngẫu nhiên, hồi sau 30 phút. Quái bám độ cao địa hình; gộp và dùng chung mesh, chỉ cập nhật chuyển động những cụm gần người chơi.

**Lỗi bắt được và đã sửa khi kiểm tra:** một đoạn nối 70 m quá ngắn so với hai đầu cua bán kính 64 m làm hai chiều ray áp sát nhau. Đã bỏ nút thừa và kiểm tra lại khoảng cách hai chiều trên toàn tuyến; không hạ điều kiện kiểm tra. Cũng thay đường cáp hai điểm bằng `LineCurve3` để tương thích Three.js r128.

**Kiểm tra bản cuối:**

- `node tools/tests/verify_highland_transit.js`: **1.783 mục đạt**, kiểm tra ảnh gấu trên thẻ thật, mẫu Blender trong làng, 23 ga riêng/đường dẫn/tất cả đoàn tàu, ray tránh nhà và cầu đúng loại, nền nhà, bãi quái trên núi, thưởng và hồi bãi. Báo cáo/ảnh: `demo/verification/highland-transit/`.
- `node tools/tests/verify_realm_transit.js`: **1.516 mục đạt**, **22.445 mẫu ray qua nước**, khoảng hở tối thiểu **6,5 m**; kiểm tra khoảng cách tàu, di chuyển cả sáu đoàn, lên/xuống/đi/chọn ghế ở chiều ngược, chế tạo, oxy, sát thương rơi, đói và lưu qua tải lại. Báo cáo: `demo/verification/realm-transit/transit-report.json`, `persistence.json`.
- Hai lượt không ghi nhận lỗi JavaScript/shader. Đã xem ảnh làng, cư dân, gấu và cầu; số FPS trong ảnh chụp khi tạm dừng thời gian trình duyệt không phải phép đo hiệu năng. Chưa đo lại FPS trên máy người dùng sau đợt mở rộng này.

**Tạo lại tài sản Blender và chạy game** từ thư mục dự án:

```powershell
& E:/blender.exe --background --python tools/build_lunar_village_assets.py
python tools/refresh_web_assets.py
python tools/serve_game.py --port 8883
```

Chỉ cần lệnh máy chủ để chơi; không cần tạo lại Blender mỗi lần. Mở **http://127.0.0.1:8883/** và **Ctrl+F5** nếu trình duyệt đang giữ bản cũ. **Địa điểm → Làng Trăng Khuyết Tây** để xem làng; danh sách ga có **Ga + tên từng làng**, chọn chiều và Chờ tàu để gọi. **B → Sinh vật → Gấu trắng** xem ảnh. Giữ máy chủ mở; nếu cổng 8883 đang phục vụ game thì dùng lại.

File `WesternRedHighlandsAndCandyFortress.blend` bên dưới là snapshot của phiên trước, không chứa mẫu làng mới nhất. Mẫu mới nằm trong `LunarVillageAndSuspensionDesign.blend`; game đọc bản xuất JS. Lệnh builder tái tạo từ Python rồi xuất, nên sửa thủ công file Blender không tự đồng bộ vào game. README đã cập nhật nguồn tài sản, cách chạy và số lượng hiện tại.

## Mới nhất — thành bánh kẹo và dãy núi đá đỏ phía tây (28/10/2026)

**Yêu cầu bổ sung mới nhất được ưu tiên:** bên trong thành chỉ dùng nền bánh kẹo; dãy núi/làng dùng đá đỏ và cỏ cây; phần phía nam thuộc vùng tuyết có nền tuyết trắng rõ ràng. Không phủ nền mặt trăng lên ba vùng này.

- **Thành bánh kẹo:** thêm tường bánh quy bao quanh, bốn cổng mở có va chạm thật, tháp góc, răng thành, hành lang trên thành và cầu thang bậc tối đa 15 cm. Có chợ bánh, mái bạt, quầy macaron, ghế, đèn đường, lò nướng và bồn hoa. `candy-fortress.js` ghép vào `candy-kingdom.js` trước khi khảo sát đường ray.
- **Nền trong thành:** nền bánh xốp riêng có ô/vân bánh, sân chocolate và đường kem. San nền theo hình chữ nhật thành, hạ lớp nền cũ bên dưới để không lộ hố mặt trăng. `CandyGardenTerrain` được loại khỏi shader mặt trăng; cây/cỏ tự nhiên, bãi quái thường và thịt đùi không sinh trong vùng thành để giữ chủ đề bánh kẹo.
- **Bánh quy ăn được:** `candy-provisions.js`, **137 điểm** trong thành; E nhặt 1–3 mảnh, I → Vật phẩm → Mảnh bánh quy → Ăn để hồi **20 độ no**. Số lượng và điểm đã nhặt lưu riêng ở `tsuventure_candy_cookies_v1`; hồi sau 10 phút, không nhận lặp. Tích hợp thông báo giữa màn hình, tìm/lọc kho đồ, CODE cho lượt nhận mới. Dùng API `monsterCamps.nourish(amount)` để hồi độ no thật, không giả số trên UI.
- **Hai sống núi phía tây:** `createWesternHighlandProfile` trong `western-highlands.js`, gọi từ `southern-expansion.js` trước khi sinh mặt đất/nước. Dải khoảng X −3360…−2470, Z −3340…3340; hai sống núi chạy song song hành lang sông, cao thấp khác nhau, mẫu sống núi phía tây khoảng **68–232 m**. Kênh sông được khoét sau khi thêm núi, vẫn dùng tam giác nền thật để sinh nước/bơi/thuyền, không đặt núi nổi lên một mặt phẳng cũ.
- **23 làng, 114 cư dân:** bậc đất khô đủ rộng cho toàn móng nhà; nhà có cửa mở, giường, bàn, đèn; sân, giếng, quầy tinh thạch, ghế, vườn, cây, đá và các điểm nghề như lò rèn/kho/cối xay. Cư dân đi lại và nhấn E chào hỏi; thêm thư viện/ảnh xem trước. Danh sách Địa điểm có ba lối tắt; tất cả làng hiện trên bản đồ M. Nhà/đường mòn bám đúng mặt đất; camera có kiểm tra mái/tường nhà làng.
- **Đá đỏ, cỏ cây và tuyết:** shader `lunar-surface-finish.js` có mặt nạ `biomeRed` và texture đá đỏ phân lớp riêng, không nhuộm đỏ họa tiết hố mặt trăng. Giữ phù sa ở đáy sông. Phía nam chuyển sang tuyết trắng kể cả sống núi sát biên trái; mái nhà/cây/đá vùng này có màu tuyết. `installWesternNature` sinh cỏ, cây lá rộng/thông và đá sau khi chốt đường ray, tránh nhà/ga/sông. Cụm được giới hạn theo khoảng cách; cờ `spatialBoundsReady` tránh tính lại sai bounding box instancing. Cư dân dùng ba mesh gộp và mẫu dùng chung để giảm draw call.
- **Tàu trên núi:** núi và làng được dựng trước khảo sát ray; ray được tính lại độ cao, độ dốc, đường tránh và cầu đỡ. Trụ cầu cao phía tây được làm dày hơn. Giữ **46 tên ga cũ**, gồm Ga Viễn Du 4: mở rộng vùng tìm chỗ khô an toàn cho các ga phía tây; không bỏ tên khi vị trí cũ gặp sườn núi. Giữ sáu đoàn tàu/hai chiều và dừng theo yêu cầu.

Kiểm tra **`node tools/tests/verify_western_highlands.js` đạt 6.241 mục**: biên sông không nổi, móng nhà khớp nền, camera mái nhà, dân cư/tương tác, cổng và va chạm tường, đi lên thành không nhảy, nhặt/ăn bánh quy/chống nhận lặp/lưu qua tải lại, phân vùng bánh kẹo/đá đỏ/tuyết, cỏ cây và vùng cắt cảnh, tàu tránh nhà và vượt sông. Ảnh/báo cáo: `demo/verification/western-highlands/` (`fortress`, `market`, `village`, `highlands`, `ridge`, `snow`, `report.json`, `persistence.json`). Không có lỗi JS/shader trong lượt kiểm tra. Số FPS trong ảnh chụp lúc thời gian trình duyệt bị tạm dừng không phải số đo hiệu năng.

Hồi quy **`verify_realm_transit.js`: 1.493 mục**, **34.048 mẫu ray qua nước**, độ hở tối thiểu **6,5 m**, 46 ga/64 cầu đi bộ; kiểm tra lưu trang bị/đói/thức ăn qua tải lại đạt. Các chỉnh sửa của phiên trước được giữ lại.

**Blender:** `Assets/Art/Blender/Environments/WesternRedHighlandsAndCandyFortress.blend` là snapshot mới của địa hình phía tây, nhà/cư dân/cỏ cây và thành bánh kẹo, kèm đường dẫn ray. File có 2.284 mesh; màu bake đơn giản, không thay thế toàn bộ shader/logic game. Không tự đồng bộ ngược khi chỉnh Blender. Tạo lại bằng:

```powershell
node tools/tests/verify_western_highlands.js
& E:/blender.exe --background --python tools/build_candy_studio.py -- --input demo/verification/western-highlands/blender-design.json --output Assets/Art/Blender/Environments/WesternRedHighlandsAndCandyFortress.blend --scene WesternRedHighlandsAndCandyFortress
```

**Chạy game:** `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Sau sửa nguồn chạy `python tools/refresh_web_assets.py`, Ctrl+F5. Địa điểm → **Vương Quốc Bánh Kẹo** hoặc **Làng Trăng Khuyết Tây** để kiểm tra nhanh. README đã cập nhật đầy đủ.

## Mới nhất — bánh kẹo, ga cao, quà Noel và bầu trời (28/10/2026)

- **Quà Noel đổi quy tắc:** mỗi hòm chứa đúng hai loại khác nhau, số lượng độc lập 1–5 cho mỗi loại. Giữ toàn bộ nguồn nguyên liệu hiện có và 2% hòm có động cơ vĩnh cửu; động cơ nằm trong hai loại, không là món thứ ba. Hòm chưa mở của dữ liệu cũ được chuyển một lần bằng `lootVersion:2`, không đổi vị trí/hạn dùng. `santa-gifts.js`.
- **Nguyệt Tuyền xanh trở lại:** `lunar-surface-finish.js` có mặt nạ xanh quanh núi/thác (tâm −760, 650); dùng màu địa hình gốc của `THERMAL_RIVER_DATA` thay lớp phủ mặt trăng tại đây. Giữ đáy sông phù sa, nước, cây và đường mòn. Khu khác vẫn mặt trăng/tuyết như bản trước.
- **Hồ Thủy Ngân:** `realm-scenery.js` thay cọc thưa bằng vòng hàng rào giáo sắt cao khoảng 6 m, gai xiên, đầu lâu trang trí, hai thanh nối và chân đá đặt theo nền thật. Có va chạm; chừa cổng vào, đường sông và hành lang ray để không chắn giao thông. Cọc cũ bị ẩn/vô hiệu hóa va chạm, không xếp lớp lên nhau.
- **Ga cao và tàu nằm ngang:** san đoạn dừng dài hơn toàn bộ đoàn tàu trên cả ray xuôi và ngược, sau khi hoàn tất kiểm tra vật cản. Chỉ nâng cao độ, không hạ ray xuống nước/vật cản; lan độ dốc tiếp cận tối đa 20%. Đoạn bị nâng khỏi đất có sàn cầu/trụ. Ga vẫn chỉ xoay theo hướng ngang, không nghiêng theo đường dốc. Cầu thang có bậc 15 cm, chiếu nghỉ, tay vịn liên tục, trụ, giằng, nẹp bậc và đèn. Các sân chiều ngược cao cũng có cầu thang thật và mặt đi bộ nối vào ga. Giữ mọi tên ga cũ.
- **Vương Quốc Bánh Kẹo**: vùng đất khô được khảo sát trước lúc dựng đường sắt, tâm hiện tại **X 1720, Z −2000, Y 8,15**. Có nền chuyển tiếp thật, sân chocolate/bánh quy, lâu đài bánh gừng với sảnh đi vào được, ngai, bàn tiệc, tháp kem, nhà bánh, cửa sổ bánh quy, cây kẹo bông, cổng gậy kẹo và đài macaron. Va chạm công trình được đưa vào khảo sát ray; không dựng đè lên sông. Cỏ cũ bị dọn khỏi sân. Đi qua **Địa điểm → Vương Quốc Bánh Kẹo**; có **Ga Vương Quốc Bánh Kẹo** hai chiều, nâng tổng lên **46 điểm ga**.
- **Chúa Sâu Răng**: quái kẹo mút 10.000 HP, truy đuổi trong sân, vòng tím báo phép trước 1,8 giây; trúng bị thôi miên 2,5 giây +24 sát thương, có thể né khỏi vòng. Điều khiển/đánh/lướt bị chặn trong thôi miên; hồi sinh nhân vật hủy trạng thái. Đánh bại nhận 1 xu +3 chocolate; quái hồi sau 30 phút trong phiên chơi. Đã ghép vào đòn đánh nhân vật, đòn nhắm lên trời, thư viện và ảnh xem trước. `candy-kingdom.js`.
- **Bầu trời vũ trụ:** tinh vân và đủ tám hành tinh; Trái Đất có lục địa/mây, Sao Mộc có dải và vết đỏ, Sao Thổ có vành. Bầu trời đi theo camera, tự co theo giới hạn nhìn của từng mức Mượt/Trung Bình/Cao để không bị cắt mất trên máy yếu. Không tăng tầm vẽ địa hình vì bầu trời.

Kiểm tra mới: `node tools/tests/verify_candy_kingdom.js` đạt **8.091 mục**, báo cáo/ảnh tại `demo/verification/candy-kingdom/`. Bao gồm 2.000 lượt quà ngẫu nhiên, mở hòm thật và chống nhận lặp, ga/tàu nằm ngang ở cả 46 điểm, đi bộ lên/xuống cầu thang cao cả hai chiều, neo chân rào, tám hành tinh trong tầm vẽ ba mức, phép thôi miên trúng/né/hết hiệu lực và đòn đánh thật của cả năm nhân vật. Không ghi nhận lỗi JS/shader. Hồi quy `verify_realm_transit.js` đạt **1.487 mục, 21.204 mẫu ray qua nước, hở tối thiểu 6,5 m**, hoàn tất lưu trang bị/đói/thức ăn. Giữ đủ mọi tên ga trong snapshot cũ. Ảnh rà soát chụp khi tạm dừng thời gian trình duyệt; số FPS hiện trong ảnh lúc đó không phải số đo hiệu năng.

Lỗi đã bắt và sửa khi rà soát: chuyển chân cầu thang cao khỏi lòng sông bằng khảo sát nhiều vị trí đất khô; bỏ phụ thuộc vào lớp nền ray đắp che sông. Mép nền sân bánh kẹo dùng cùng vật liệu mặt trăng để không thành một vòng màu xanh như nước dưới ánh sáng xanh của cảnh.

Sân bánh kẹo có mặt đi bộ khớp mặt gạch; cửa sảnh có bậc kem 23 cm nối từ sân lên sàn phòng. Đã kiểm tra di chuyển thật vào sảnh không cần nhảy. Vật liệu nền không áp độ lệch sâu lên sân bánh kẹo để tránh che mất lớp lát bánh quy phía trên.

Ghi chú xác minh: lượt riêng `verify_lunar_rivers.js` trong phiên này hết thời gian chờ `Runtime.evaluate` lúc khởi tạo, không tạo báo cáo mới; báo cáo 322 mục bên dưới là lịch sử. Sau đó bản cuối tải được và chạy lại đủ **8.091 kiểm tra tính năng + ảnh/shader** bằng `verify_candy_kingdom.js` thành công. Bộ giao thông kiểm tra cả hai đường ray, vật cản và độ hở sông đã đạt như ghi trên.

Nguồn Blender chỉnh sửa: `Assets/Art/Blender/Environments/CandyKingdomCurrent.blend` — snapshot vùng bánh kẹo, hai phía ga và hàng rào từ hình học trong game; không thay thế file map tổng. Tạo bằng `node tools/tests/verify_candy_kingdom.js` rồi `E:/blender.exe --background --python tools/build_candy_studio.py`. Kết nối socket GUI hiện không hoạt động, nên đã dùng Blender nền để lưu file riêng; không đụng cảnh đang mở của người dùng. Chỉnh file Blender không tự cập nhật ngược vào game.

Chạy game từ thư mục dự án: **`python tools/serve_game.py --port 8883`**, mở **http://127.0.0.1:8883/**. Sau sửa nguồn: `python tools/refresh_web_assets.py`, Ctrl+F5 để tải bản mới. README đã cập nhật cách tìm khu mới và quy tắc quà Noel.

## Mới nhất — biểu tượng vuông, trang bị, sinh tồn và chuột (28/10/2026)

Mục này cập nhật hành vi cũ của đồ lặn và thể lực; giữ nguyên bản đồ/sông/ga đã hoàn thành.

- **Logo app vuông**: tài sản mới trong `demo/features/lobby/assets/app/` (PNG 32/180/192/512/1024 và ICO). `demo/manifest.webmanifest` khai báo standalone và icon 192/512; HTML có favicon, Apple touch icon và theme. Logo chữ ngang của sảnh vẫn dùng cho bố cục sảnh.
- **Ngoại hình trang bị**: `demo/features/characters/player-experience.js` tạo lớp giáp/đồ lặn phủ các bộ phận nhân vật, gắn theo xương đang chuyển động; mũ kính, huy hiệu, bình khí và ống dẫn. Có chế độ mặc cả hai. Áp dụng cho cả năm nhân vật, tháo đồ trả lại ngoại hình gốc, đổi nhân vật/tải lại giữ trang bị.
- **Đồ lặn**: oxy không giảm khi ở dưới nước. Không mặc: bơi 0,45 m/s và mất 14 oxy/giây; mặc: 3,8 m/s, Shift 5,2 m/s, có thể lặn chủ động. Hết oxy vẫn dùng cơ chế mất máu/hồi sinh chung.
- **Thể lực chỉ dùng cho chạy nhanh trên đất**: bỏ chi phí tấn công, nhảy và lướt ninja; bơi/bay không hao thể lực. Bỏ cả hao thể lực do đói thấp; đói 0 vẫn mất máu như trước.
- **Nhận vật phẩm**: bảng thông báo giữa màn hình nhận thay đổi thật của các kho/tài nguyên/trang bị, có tên và số lượng, gom phần thưởng nhiều món. Không báo lại đồ đã có khi tải trang hoặc nhận lặp vật phẩm duy nhất.
- **Tàu đâm**: kiểm tra đường quét của đầu máy/toa cả sáu đoàn; va chạm tàu chạy giết ngay qua giáp rồi hồi sinh điểm xuất phát. Bỏ qua người đang ở trong tàu, tàu đỗ và người đi bên dưới cầu cao.
- **Chuột**: nhấn phải một lần để dùng Pointer Lock thật, thả nút vẫn xoay camera và ẩn con trỏ. Mở menu/bản đồ/đối thoại hiện con trỏ; Esc thoát khóa. Di chuyển chuột trong giao diện không quay camera.
- **Ổn định hình ảnh**: MSAA/highp, lọc texture nền, ưu tiên độ sâu riêng cho lớp nền vá/nền gốc/nước, giữ nguyên shader phù sa/tuyết. Ẩn cảnh vật theo khoảng cách có vùng đệm 32 m; thay đổi độ phân giải tự động ít thường xuyên hơn. Camera dò va chạm tinh chỉnh nhị phân thay bước nhảy 0,15 m. Chưa khẳng định FPS hay loại bỏ mọi giật hình trên phần cứng người dùng.

Kiểm tra mới: `node tools/tests/verify_player_experience.js`, báo cáo/10 ảnh trang bị trong `demo/verification/player-experience/`. 95 kiểm tra luật chơi đạt; đã kiểm tra Pointer Lock bằng sự kiện chuột thật qua Chrome, bản đồ và Esc, khôi phục trang bị sau tải lại không báo nhận lại đồ. Hồi quy `verify_realm_transit.js` đạt 1.487 mục (21.202 mẫu ray qua nước), `verify_lunar_rivers.js` đạt 322 mục; cả hai hoàn tất kiểm tra lưu dữ liệu, không ghi nhận lỗi JavaScript/shader.

**Chạy game:** từ thư mục này chạy `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Giữ cửa sổ máy chủ mở. Sau sửa nguồn chạy `python tools/refresh_web_assets.py`, tải lại trang (Ctrl+F5 nếu còn cache). Không cần Blender để chơi. Icon mới có hiệu lực khi cài ứng dụng; shortcut đã cài có thể cần cài lại để hệ điều hành cập nhật biểu tượng.

## Mới nhất — lòng sông có bờ đất và đáy cát phù sa (28/10/2026)

**Mục này thay thế cách phủ nền mặt trăng xuống đáy sông ở các mục trước.** Người dùng phản ánh nước giống bãi nước và không có bờ rõ; ảnh tại khoảng X 2841, Z −733 cho thấy các hố mặt trăng còn hiện dưới mặt sông.

- Đã sửa tiết diện tất cả nhánh sông mở rộng: lòng dẫn lõm, bờ thấp, gờ đất cao và dốc chuyển về mặt đất bên ngoài. Bề rộng thiết kế thay đổi theo nhánh và dọc nhánh, không còn một bề rộng cố định 68 m cho mọi đoạn. Hợp lưu chọn khoảng cách tới mép kênh gần nhất để các lòng dẫn nhập vào nhau.
- Thêm vật liệu **cát phù sa có hạt/vân cát** cho đáy và bờ thấp của sông mới lẫn sông cũ. Áp trên chính lưới địa hình vật lý, không đặt một lớp mặt phẳng cát nổi. Bắt buộc toàn bộ đỉnh của tam giác ướt dùng cát, nên họa tiết hố mặt trăng không lọt vào đáy sông. Đất bên ngoài sông giữ nền mặt trăng; khu Nam Cực giữ tuyết.
- Nước phân sắc theo độ sâu, trong hơn ở mép và đậm hơn ở giữa; có gợn chạy theo hướng từng đoạn sông ở cả ba mức đồ họa. Không dịch chuyển các đỉnh bờ nước khi tạo gợn. Giữ chung tam giác nước cho bơi/thuyền và tiếp tục kiểm tra mép nước chạm đất.
- Bổ sung lau sậy và đá nhỏ dọc bờ sông: lượt kiểm có **2.928 cụm**, gốc đặt theo mặt đất thật. Gom InstancedMesh theo ô và ẩn theo khoảng cách để giảm tải máy yếu.
- `verify_lunar_rivers.js` hiện kiểm thêm lớp phù sa trên toàn bộ tam giác ướt, cao độ bờ và dữ liệu độ sâu/hướng dòng, đồng thời chụp đúng khu vực phản ánh. Lượt kiểm mới **322 bước đạt**, **32.385 tam giác lòng sông** có cát và không lộ hố mặt trăng; **455 mẫu bờ** đều cao hơn mặt nước tối thiểu 2,5 m. Không ghi nhận lỗi JavaScript/shader trong lượt kiểm.

Ảnh mới: `demo/verification/lunar-rivers/river-banks-alluvium.png` và `riverbed-sand.png`. Chạy `node tools/tests/verify_lunar_rivers.js`; kiểm tra hồi quy giao thông/sinh tồn bằng `node tools/tests/verify_realm_transit.js`. Lượt hồi quy sau thay đổi tiết diện sông đạt **1.487 bước, 21.202 mẫu kiểm mặt ray qua nước, 0 lỗi JS**, giữ khoảng hở mặt ray qua nước tối thiểu 6,5 m; kiểm tra lưu trang bị/đói/thức ăn qua tải lại cũng đạt.

Nguồn chính: `demo/features/world/southern-expansion.js` (tiết diện, hợp lưu, thuộc tính nước), `lunar-surface-finish.js` (đáy/bờ phù sa, lau sậy/đá), `graphics-quality.js` (độ sâu, gợn dòng chảy, culling). Cách chạy game: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Sau sửa nguồn chạy `python tools/refresh_web_assets.py` rồi tải lại trang.

## Mới nhất — sửa sông/nền mở rộng, ga đối diện và vật phẩm duy nhất (28/10/2026)

**Ưu tiên mục này. Những số 44 ga, đất bắc nâu và dải nước hình chữ nhật trong các mục dưới là lịch sử.**

- Đã xác định lỗi hình học: lòng sông đào rộng nhưng mặt nước cũ chỉ là dải hẹp, để lại mép nước cao hơn phần lòng sông không được phủ. Thay toàn bộ mặt nước mở rộng bằng các đa giác cắt từ chính tam giác địa hình tại cao độ nước. Nhánh giao nhau cùng dùng một mặt nước, không xếp chồng các dải. Hồ băng cũng dùng cơ chế này. Dùng tập tam giác ướt chung cho hiển thị, bơi, oxy và thuyền; cao độ lấy trực tiếp buffer địa hình hiện tại, không dùng bản sao cao độ cũ. Dựng lại nước sau khi san nền ga.
- Sửa truy vấn tại cạnh ô nối map cũ–mới, giữ kênh tiếp nối sông cũ và không vẽ nước trùng lên phần thượng lưu cũ. Lượt kiểm tra mới kiểm **37.662 điểm bờ**, sai khác lớn nhất với nền khoảng **3,34e−13 m**; **15.867 mẫu nước sâu** đều khớp truy vấn bơi/thuyền.
- `lunar-surface-finish.js` áp cùng chất liệu/vết hố mặt trăng và UV theo tọa độ thế giới cho nền cũ, mới, vùng kim tự tháp, lớp vá mép nền, đáy/bờ sông, rừng và đầm lầy. Chỉ mặt đất trong vùng tuyết dùng lớp tuyết. Không đổi màu công trình hoặc mặt nước. Cỏ, cây sinh theo mặt nền thật; lượt kiểm có **2.601 cây ở vùng mở rộng**, được gom và ẩn theo khoảng cách.
- **45 điểm ga**, mỗi điểm có hai khu chờ đối diện: phía ngược có nền đỡ đầy đủ, mái, quầy vé, ghế, cột, đèn và biển cùng tên cũ, thêm nhãn chiều xuôi/ngược. Giữ toàn bộ 44 tên trong bản thiết kế trước và có thêm Ga Hang Tà Thần. Mở rộng vùng tìm vị trí khô cho Ga Rừng Cổ và Ga Băng Nguyệt 5 để không bỏ mất tên khi sửa bờ sông. Khi chọn “Chuyến gần nhất”, đứng bên sân nào sẽ gọi tàu của chiều đó; vẫn có thể chọn tuyến bằng danh sách.
- **64 cầu đi bộ** được làm lại: mặt cầu rộng 6 m, hai vòm đỡ, dầm biên, trụ xây có va chạm, lan can liên tục có vật lý và cột đèn hai đầu. Kiểm tra tâm cầu nằm trên dòng nước thật, giữ khoảng trống giữa sông cho thuyền. Nền dốc ở hai đầu dùng cùng hình học cho hiển thị và đi bộ; giữ cơ chế ẩn cầu/ga theo mức đồ họa.
- **Đèn pin, cánh pha lê, mảnh vỡ cổ đại là duy nhất**, số lượng 1/1. Sửa cả phần CODE, hiển thị trong balo và dữ liệu quà cũ 9999 → 1; giữ quyền sở hữu, nhận lặp không tạo thêm bản sao. Cập nhật nhãn khi mở balo sau khi nhặt tự nhiên.

Kiểm tra: `node tools/tests/verify_lunar_rivers.js`. Báo cáo/ảnh ở `demo/verification/lunar-rivers/` (`lunar-rivers-report.json`, `paired-stations.png`, `river-bridge.png`, `singleton-persistence.json`). Lượt kiểm mới **318 bước đạt, 0 lỗi JS**, bao gồm chuyển dữ liệu vật phẩm cũ qua tải lại. Đã xem ảnh trong game để rà soát nền hố mặt trăng, ga và cầu. Kiểm tra hồi quy `node tools/tests/verify_realm_transit.js` cũng đạt **1.485 bước, 32.189 mẫu kiểm mặt ray qua nước, 0 lỗi JS**; lên/xuống, đi lại/chọn ghế, chế tạo, đói và lưu dữ liệu tiếp tục hoạt động. Mặt nạ tuyết chỉ ở Nam Cực phía nam; nền núi/rừng cũ phía bắc/trung tâm cũng dùng nền mặt trăng.

Chạy: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Sau sửa nguồn: `python tools/refresh_web_assets.py`, tải lại trang. Nguồn chính thêm/sửa: `demo/features/world/southern-expansion.js`, `lunar-surface-finish.js`, `realm-transit-update.js`, `living-world.js`, `demo/features/railway/moon-railway.js`, `demo/features/inventory/gift-code.js`.

## Mới nhất — hai chiều đường sắt, sinh tồn và trụ sở công nghệ (28/10/2026)

- **Sáu đoàn tàu, hai đường ray song song:** đỏ/xanh dương/vàng trên chiều cũ; tím/xanh lá/đen trên chiều về. Mỗi đoàn vẫn đầu máy +3 toa. Ray mới chạy cùng mạng quanh co xuyên map, cách tim ray cũ 18 m; có nắn cục bộ trong khoảng 16–50 m để tránh chướng ngại vật. Tín hiệu giữ khoảng cách riêng từng chiều và kiểm tra khoảng trống giữa các đoàn. 44 ga hiện có thêm sân chiều về và lối đi dốc; vẫn gọi tàu, dừng 60 giây, vé 1 xu, đi lại/chọn ghế trong toa.
- **Sửa ray qua nước:** khảo sát cả bề rộng cầu và mép sông được vẽ. Mặt ray qua nước cao hơn mặt nước ít nhất 6,5 m, có mặt cầu và trụ; tiếp tục kiểm tra thân tàu sau khi lan truyền độ dốc. Ray chiều về được nắn tránh vật thể trước khi dùng cầu vượt tại chỗ còn buộc phải vượt cao.
- **64 cầu đi bộ mới** qua mạng sông mở rộng, có mặt đi bộ vật lý và lối dẫn hai đầu. Cầu đi bộ và sân ga chiều về được ẩn theo khoảng cách của mức đồ họa.
- **Độ no 0/100:** mất 3 máu mỗi 2 giây khi chơi; không trừ vào giáp, dừng khi ăn hoặc mở menu. Chết dùng hệ hồi sinh chung ở điểm bắt đầu và hồi tối thiểu 40 độ no.
- Đất vàng/nâu sa mạc và vùng mở rộng phía bắc đổi thành màu nền mặt trăng xám; giữ kim tự tháp và nền tuyết ở phía nam.
- **Nữ Chúa Tuyết** có lãnh địa/sân tuyết riêng trên đất khô, tường, tháp, ngai và lối vào. Vị trí hiện tại khoảng **X −2514, Z 2166, Y 13,28 m**. Ẩn trong ụ tuyết, phát hiện trong 62 m rồi xuất hiện sau 1,2 giây; trở về ẩn khi người chơi rời quá 115 m. Không đi khỏi sân xuống sông.
- **Trụ sở công nghệ:** thêm giàn chế tạo giáp và máy quét đồ lặn, cùng hai công thức tại bàn E. Giáp sắt cần **50 sắt**, chế tạo/trang bị đặt giáp và giới hạn giáp lên **200**; có tháo/trang bị trong balo. Đồ lặn cần **20 cao su +10 silicon**, khi trang bị tiêu hao oxy 0,5/s thay vì 4/s. Cao su/silicon có trong hòm Noel và phần thưởng ngẫu nhiên dọn bãi quái. Trang bị và nguyên liệu lưu qua tải lại; CODE cũng cấp trang bị mới.
- **M mở bản đồ lớn:** tọa độ X/Z/cao độ, vị trí người chơi, sông, ray, ga, công trình; nút/chuột cuộn phóng to, kéo bản đồ, nhấn đánh dấu vị trí và khoảng cách. M/Esc đóng. Có nút trên HUD cho màn hình cảm ứng.
- Hiệu ứng va chạm/đòn đánh dùng chung, cảnh báo kỹ năng quái và vệt chém/tàn lửa của kiếm dung nham. Quái có đòn nhắm lên trời, báo trước 0,75 giây rồi bắn vào vị trí đã nhắm để người chơi né; tầm bắn theo loại, không xuyên công trình. Giới hạn số đạn/hạt hiệu ứng đang hoạt động.
- **Sát thương rơi:** đặt lại mốc rơi khi bắt đầu bay, đang điều khiển bay và lúc ngừng bay. Rơi tự do tính từ độ cao ngừng bay gần nhất xuống điểm tiếp đất, không giữ lại đỉnh trước lần hạ có điều khiển.

Chạy game: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**. Sau sửa JS/CSS: `python tools/refresh_web_assets.py` rồi tải lại trang.

Kiểm tra thay đổi này: `node tools/tests/verify_realm_transit.js`; ảnh/báo cáo ở `demo/verification/realm-transit/`. Kết quả: **1.486 kiểm tra đạt, 34.148 mẫu cầu qua nước, 0 lỗi JS**; khoảng cách nhỏ nhất giữa hai tim ray đo được **16,31 m**. Đã kiểm tra lên/xuống, đi lại và chọn ghế trên cả ba tàu chiều về; chế tạo, lưu trang bị, oxy đồ lặn, đói mất máu/ăn ngừng mất máu, sát thương rơi và đạn quái trúng người đang bay. Ảnh bản đồ lớn đã được xem lại để sửa độ rõ và tỷ lệ hiển thị. Khi tải lại với giáp sắt đang trang bị, phiên chơi mới khởi tạo đầy 200 giáp; tháo/trang bị trong cùng phiên không hồi giáp miễn phí.

Nguồn chính: `features/world/realm-transit-update.js`, `railway/moon-railway.js`, `railway/railway-clearance.js`, `world/antarctic-realm.js`, `world/snow-queen.js`, `world/monster-camps.js`, `survival/player-life.js`, `inventory/crystal-wings.js`, `survival/player-survival.js`. Các đường dẫn tính từ `demo/`. Không chạy lại các builder cũ để tránh mất mạng ray/sân ga hiện tại.

## Mới nhất — thư viện đầy đủ sinh vật và quái vật (28/10/2026)

Ấn **B** hoặc mở **Nhân vật → Thư viện hành trình** để xem toàn bộ danh mục, kể cả sinh vật chưa gặp. Mỗi mục hiển thị tên, mô tả, kỹ năng/chỉ số và trạng thái gặp/đánh bại riêng; tìm kiếm không phân biệt dấu, trạng thái được lưu qua tải lại. Danh mục hiện có **123 mục**: 18 quái vật, 38 sinh vật, 5 NPC và 62 địa điểm. Cả **61 mục có hình sinh vật** đều dựng ảnh xem trước từ mô hình Three.js trong game; địa điểm giữ ảnh phong cảnh riêng. Có cá/rong, động vật Nam Cực, bãi quái, boss, sinh vật đầm lầy, NPC Santa và tuần lộc.

Đã có báo cáo trình duyệt **261 kiểm tra đạt, 61 ảnh xem trước, 0 lỗi JS**, bao gồm trạng thái khám phá/đánh bại và ngôn ngữ được giữ qua tải lại. Ở lượt tiếp tục ngày 28/10, máy chủ cục bộ trả HTTP 200 và hai file JS qua `node --check`; việc chạy lại Chrome headless chưa được vì tiến trình Chrome không mở cổng điều khiển trong môi trường hiện tại. Ảnh/báo cáo gần nhất: `demo/verification/complete-library/`.

Kiểm tra lại khi Chrome headless hoạt động: `node tools/tests/verify_complete_library.js`. Mô hình chim cánh cụt đã được chỉnh màu sáng và làm phần bụng dễ nhận ra hơn; logic ghi nhận gặp/đánh bại giữ nguyên. Ảnh trong báo cáo là từ lần chạy trước thay đổi màu/mặt trước này.

## Mới nhất — sinh thái sông, ba mức đồ họa, 44 ga và sinh vật Nam Cực (28/10/2026)

**Đọc mục này trước. Các con số 15 ga/36 bãi ở các mục cũ bên dưới là lịch sử. Không làm lại những phần đã hoàn thành.**

- Giữ map 6.720 × 6.720 m, mạng ray dày xuyên nội địa, ba đoàn đỏ/xanh/vàng dùng chung ray, mỗi đoàn đầu máy +3 toa.
  Hiện có **44 ga, đều sát mặt đất**, thêm ga gần công trình và các hành lang xa. Ga bổ sung chỉ được nhận nếu khảo sát
  tìm được đất khô, đoạn thẳng, tránh công trình/ray khác và đủ khoảng cách với ga có sẵn; không ép đặt ga trên cao.
  Tốc độ hành trình tối đa **84 m/s** (trước 42), tăng tốc 5 m/s²; vẫn tự giảm tốc theo cua, tín hiệu và ga được gọi.
  Giữ gọi tàu, dừng 60 giây khi được yêu cầu, vé 1 xu, đi lại/chọn ghế trong toa. Chiều dài 3D hiện **109,59 km**.
- **17.029 điểm sinh cảnh** trên sông cũ và mới, khắp bốn góc map. Sáu kiểu cá bạc/vàng/lam/hồng/băng/lục,
  bơi dưới mặt nước thật; bốn kiểu rong/cỏ nước mọc từ đáy, lá thuôn và đung đưa.
  Chỉ vẽ sinh vật gần người chơi: Mượt tối đa 72 cá/90 rong trong 90 m, Trung Bình 260/460 trong 200 m,
  Cao 600/1.000 trong 350 m. Đây là số lượng trong bộ đệm hiển thị, không tạo hàng chục nghìn mesh hoạt động cùng lúc.
- Đúng **ba mức đồ họa: Mượt / Trung Bình / Cao**. Mặc định Mượt; cấu hình `potato` cũ tự chuyển thành `low`.
  Mượt tắt bóng/đèn phụ/cây trang trí tùy chọn, tầm nhìn 280 m, độ phân giải tự điều chỉnh; Trung Bình 900 m,
  nước có gợn, nhiều sinh vật/cảnh quan hơn; Cao 2.200 m, bóng mềm 2.048, ánh sáng và tone mapping ACES.
  Giữ bảng màu hiện có (LinearEncoding), tránh làm đất/tuyết/sinh vật bị bạc màu do đổi gamma toàn cảnh.
  Chia nền/đất đắp ray thành ô 192 m, trụ cầu thành ô 256 m; sửa bounding của InstancedMesh r128 để thực sự culling.
  Không dùng các mesh `renderOnly` làm physics hoặc xuất trùng sang Blender. Giao diện tiếng Việt không dịch lại cả DOM mỗi frame.
- **Đo trên GT 710, Chrome headless, mẫu 5 giây sau làm nóng:** khu xưởng Tuyết từ **6,54 lên 59,39 FPS**,
  draw calls 3.667 →47, tam giác 5,79 triệu →44.128. Khu lâu đài đo **48,98 FPS**, 489 draw calls.
  Sau khi sửa thêm các mô-đun còn kiểm tra tên profile cũ và giảm bán kính cảnh quan Mượt, mẫu lâu đài mới
  đạt **54,12 FPS**, 424 draw calls (`performance-castle-final.json`); cây/cảnh quan cũ có ngẫu nhiên giữa các lần mở.
  **Chưa đạt/không cam kết 60 FPS ở mọi vị trí hoặc mọi độ phân giải.** Nếu tiếp tục tối ưu, ưu tiên khu lâu đài;
  giữ va chạm/gameplay và đo lại trên máy thật. Không dùng ảnh chụp tĩnh mức Cao để suy ra FPS mức Mượt.
- Phần đất mở rộng **phía bắc là đất nâu trống**, giữ sông/ray; chuyển dần sang tuyết ở z=1.450–1.750,
  tuyết ở phía nam. Giữ vùng trung tâm/công trình cũ và cao độ mặt đất, không đổi đường vật lý để sửa màu.
  Blender Solid viewport đã chia material đất/tuyết theo mặt để không còn phủ trắng toàn map như ảnh người dùng.
- **75 chim cánh cụt, 25 gấu trắng** có di chuyển nhẹ ở các đàn trên đất tuyết; tránh nước, ray, xưởng và đấu trường boss.
  Hiện là sinh vật cảnh quan, không có loot/chiến đấu riêng. Gộp hình học mỗi con để giảm draw calls.
- **8 cụm pha lê tuyết** trên bàn bên trong nhà máy Tuyết: tới gần nhấn **E** nhận 2 viên; mỗi cụm hồi sau 5 phút.
  Có mục nguyên liệu trong balo, lưu số lượng và thời gian hồi qua tải lại. CODE Tsukiezz mới nhập cũng cấp pha lê.
- **108 bãi / 1.350 quái**, giữ ID/quy tắc lưu của 36 bãi cũ, thêm bãi ở các vùng mở rộng.
  Mỗi bãi 10–15 con, tránh nước/ray/công trình, giữ thưởng 1 xu +1 vật phẩm và hồi 30 phút.

### Chạy và kiểm tra bản hiện tại

```powershell
python tools/serve_game.py --port 8883
# Mở http://127.0.0.1:8883/ ; giữ máy chủ chạy. Không cần Blender để chơi.
node tools/tests/verify_world_ecology.js
$env:PERF_NAME='performance-check.json'
node tools/tests/measure_game_performance.js
```

- Mở **Cài đặt → Mượt** trên máy yếu. **Địa điểm → Nhà máy Tuyết / Nam Cực** để thử vùng mới.
  Pha lê ở các bàn dọc hai bên xưởng; chim cánh cụt quanh (1800,2700), gấu trắng quanh (-1100,1750).
- Bộ kiểm tra mới: **59.795 xác nhận**, gồm màu nền bắc/nam, profile, cá thật dưới nước/rong bám đáy,
  vị trí động vật/bãi quái/44 ga, tăng tốc, nhấn E lấy pha lê, không nhặt lặp và tải lại giữ kho/cooldown/đồ họa.
  `demo/verification/world-ecology/{ecology-report,persistence,rail-audit}.json`;
  khảo sát ray không phát hiện cua gắt/giao cắt chồng/chướng ngại, khoảng cách tàu nhỏ nhất 100 m.
  Các file `performance-*.json` ghi các bước đo, `performance-optimized.json` là mẫu 59,39 FPS,
  `performance-castle.json` là mẫu 48,98 FPS, `performance-castle-final.json` là mẫu 54,12 FPS sau sửa cuối. Ảnh game cùng thư mục.
- Nguồn mới: `world/{graphics-quality,aquatic-ecology,polar-ecology}.js`, `inventory/snow-crystals.js`.
  Hook trong index, railway-clearance/moon-railway, monster-camps, gift-code, ancient-grove, lobby-settings,
  mountain-life, lunar-biome, living-world, volcanic-valley. Giữ culling riêng của cá cũ/sinh vật đầm lầy đang chuyển động.
  Sau sửa JS/CSS chạy `python tools/refresh_web_assets.py`, rồi tải lại trang.
- Blender đã kết nối loopback **127.0.0.1:9876** và đồng bộ **chính file hiện tại**
  `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`, scene cùng tên, **5.362 object**.
  Có nền đất/tuyết, 44 ga, 100 sinh vật vùng tuyết, pha lê và 108 bãi. Cá/rong là hệ thống stream trong game;
  bản Blender không nhân toàn bộ cá đang bơi. Giữ các nguồn lâu đài/kim tự tháp và collection khác.
  Sao lưu trước sửa ở ngoài dự án, đã đối chiếu SHA256: `world-ecology/blender-backup.json`.
  `blender-live-audit.json` xác nhận kết nối, số lượng, material nền; `blender-map.png` là ảnh tổng thể.
  Hai updater đọc thư mục qua biến `GAME_VERIFY_OUTPUT`; `verify_world_ecology_blender.py` chỉ kiểm tra/chụp, không lưu map.
  Dữ liệu export trong `world-ecology/blender-{design,camps}.json`. Không chạy updater bằng dữ liệu cũ nếu không chủ ý.

### Việc còn có thể cải thiện

- Mục tiêu 60 FPS ổn định trên máy cực yếu **còn phụ thuộc khu vực**; lâu đài đo khoảng 49–54 FPS qua các lần tối ưu.
  Chưa có phép đo chơi liên tục lâu dài/fullscreen trên máy người dùng. Không tự nâng mặc định khỏi Mượt.
- Không thay đổi art/công trình cũ hoặc làm lại mạng ray khi tiếp tục. Kiểm tra file hiện có trước mọi thao tác.

## Mới nhất — map 6,72 km, Nam Cực, ray/sông dày và Noel bay (27/10/2026)

**Ưu tiên mục này. Yêu cầu bổ sung cuối cùng: ray và sông phải dày, phức tạp trong nội địa; ông già Noel cưỡi tuần lộc trên trời.**

- Giữ vùng trung tâm cũ, mở **chiều rộng và chiều dài từ 2.240 m lên 6.720 m** (mỗi chiều ×3; diện tích ×9).
  Biên đi được ±3.328 m. Dữ liệu nguồn trung tâm vẫn giữ `EXPANDED_REALM_DATA.size=2240` để không làm sai UV/heightmap cũ;
  kích thước hiện tại nằm ở `worldExpansion.size=6720`, `mapSpan=6720`. Nền mới dùng tam giác chung cho hiển thị và physics.
- Mạng ray **109,57 km**, **54.502 điểm**, đi xuyên nội địa ở cả bốn hướng, nhiều hành lang song song và cua rộng;
  giữ ba đoàn đỏ/xanh/vàng chung một hành trình, mỗi đoàn đầu máy +3 toa. **15 ga đều ở mặt đất**.
  Thêm ga Nam Cực, Nhà Máy Tuyết, Hồ Băng, Viễn Bắc; phí 1 xu/lượt và gọi tàu vẫn hoạt động.
  Ray/cầu chia ô hiển thị 512 m để frustum culling hoạt động trên map lớn.
- Sông mở rộng dài khoảng **104,46 km**, **4.359 đoạn**, nhiều nhánh uốn lượn nối ngang/dọc và các ngã sông,
  nối sông cũ tại cửa phía nam, cùng cao độ nước **1,2 m**. Đã cắt nền thật tại phần nối, tránh lớp đất chặn thuyền.
  Thuyền, bơi/lặn, kiểm tra độ sâu và cầu đường sắt nhận hệ thống nước mới. Minimap hiển thị cả ray, nhánh sông và quà.
- **Nam Cực** trải trên phần phía nam mới, rộng hơn 5 km theo chiều ngang, có thềm tuyết, dãy băng,
  hồ băng **(1100,2600)** nối sông và thác băng cao khoảng 90 m. Sương riêng dịu để tuyết không bị ánh sáng neon vùng cũ làm lóa xanh.
- **Nhà máy Tuyết** tại **(-700,2200)**: mái dốc, tháp, ống khói, cổng kẹo, biển xưởng Noel,
  cửa vào đi bộ, sàn/trần/tường thật, bàn làm đồ chơi trang trí, băng chuyền và bàn làm việc của ông già Noel.
  Vào **Địa điểm → Nhà máy Tuyết** hoặc đi từ ga cùng tên. Các nút Nam Cực/Thác Băng/Nữ Chúa Tuyết cũng đã có.
- **Nữ Chúa Tuyết** ở vùng riêng **(-2200,2250)**, xa nhà máy hơn 1 km: **16.000 HP**, di chuyển/đánh cận chiến,
  báo vòng băng **1,6 giây**, trúng sẽ nhận sát thương và bị **đóng băng 3 giây**, hồi chiêu 8 giây.
  Chặn di chuyển/nhảy/Ảnh Bộ khi đóng băng, tự hết hạn, dịch chuyển/hồi sinh giải băng. Cả 5 hero đánh được boss.
- **Ông già Noel cưỡi xe kéo 4 tuần lộc BAY TRÊN TRỜI**, giữ cao tối thiểu khoảng 150 m trên nền;
  hành trình đi qua vùng trung tâm lẫn các vùng ngoài. Thả hòm đầu tiên sau khoảng 15 giây chơi, rồi khoảng 2 phút/lần.
  Hòm rơi thật xuống vị trí đất đi được; chỉ đáp đất mới cho nhấn E mở và phát khói đỏ cao khoảng 44 m.
  Tối đa 8 hòm, tồn tại 30 phút. Quà gồm nhiều thức ăn/tài nguyên/vật phẩm; **2%** có **Động cơ vĩnh cửu** (nguyên liệu hiếm để dùng sau).
  Lưu vị trí/trạng thái/nội dung hòm và số động cơ; tải lại không nhận lại hòm đã mở. Mã `Tsukiezz` mới nhập cũng cấp động cơ.
- **Sát thương rơi:** rơi ≤4 m an toàn; cao hơn mất **11 máu mỗi mét vượt 4 m**, bỏ qua giáp.
  Đếm từ đỉnh quỹ đạo thật; nhảy thường, dịch chuyển, bơi, cánh và đi tàu/thuyền không tạo sát thương rơi giả.
  **Mọi cái chết trở lại điểm xuất phát gốc (0,10), hồi máu/giáp/thể lực/oxy**; giữ kho đồ.
  Các cơ chế hồi về bờ/hang cũ đã nối về cùng hệ thống hồi sinh. Điểm cứu người do lỗi lọt nền vẫn giữ.

### Nguồn, kiểm tra và bản thiết kế hiện tại

- Nguồn mới dưới `demo/features/`: `world/{southern-expansion,antarctic-realm,snow-queen,santa-gifts}.js`,
  `survival/player-life.js`. Các hook ở index, player-survival, castle vertical physics, HUD,
  ninja abilities, boat, gift-code, railway-clearance và moon-railway.
- Kiểm tra: **`node tools/tests/verify_polar_expansion.js`**. Kết quả tại **`demo/verification/polar-expansion/`**.
  **1.550 xác nhận**, trong đó 1.516 điểm nền, thêm mép nối cũ/mới, độ sâu sông, thuyền trên hồ,
  đi bộ vào xưởng, trần, đóng băng/hết băng, rơi an toàn/rơi đau/rơi chết, hồi sinh, Noel bay,
  rơi hòm/khói đỏ/nhặt bằng E/tỉ lệ hiếm/không nhặt lặp. Tải lại thật giữ động cơ và hòm chưa mở.
- Kiểm tra ray: `$env:POLAR_AUDIT='1'; node tools/tests/verify_polar_expansion.js`.
  `rail-audit.json` của bản **109,57 km**: không phát hiện giao cắt chồng, cua gắt hoặc chướng ngại trong khảo sát;
  3 tàu giữ ít nhất **100 m**, cả 15 ga dưới đất. Bỏ biến `POLAR_AUDIT` trước khi chạy bộ tổng hợp.
- Ảnh đã kiểm tra ở `snow-factory.png`, `ice-waterfall.png`, `snow-queen.png`, `flying-santa.png`, `red-smoke.png`.
  `polar-report.json`, `persistence.json` và `rail-audit.json` là bằng chứng của bản mới; các log lần đầu là lịch sử tìm/sửa lỗi.
- Rà soát bổ sung phát hiện hai đường hồi sinh cũ ở `monster-skills.landDamage` và đòn cắn sói sông;
  đã sửa và chạy riêng hai tình huống sát thương thật, đều trở lại điểm gốc. Báo cáo **`death-audit.json`**.
  Hòm Noel tránh cả mái nhà máy Tuyết và trụ sở công nghệ, không thả xuyên mái xuống phòng.
- Vẫn **một file Blender kiểm tra hiện tại**: `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`,
  scene cùng tên, **3.831 object**, đã thay nền/ray/ga cũ bằng bản mở rộng, thêm Nam Cực và xe tuần lộc bay.
  Giữ nguồn lâu đài, kim tự tháp, sinh vật và các collection không liên quan. Bản sao trước sửa nằm ngoài dự án,
  đường dẫn ghi ở `blender-backup.json`. `update_polar_world_blender.py` đọc `blender-design.json` để cập nhật;
  lưu ý các thanh ray là curve giữ mọi điểm runtime, tà vẹt là preview nhẹ, file này chưa phải mọi chi tiết của game.
  Đã mở và xác nhận kết nối Blender **127.0.0.1:9876**, scene hiện tại báo kích thước 6720 và 15 ga.
- **Chạy:** `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**.
  Vào nhanh Nam Cực: **http://127.0.0.1:8883/?antarctic=1**. Tải lại trang để nhận phiên bản mới.

## Mới nhất — nhạc sảnh, logo, bãi quái đông và vé tàu (27/10/2026)

**Mục này thay thế số lượng bãi quái, cách rơi vật phẩm và sát thương trong các ghi chép trước.**

- Nhạc sảnh dùng đúng file người dùng gửi **The_Pale_Lunar_Tide.mp3**, đã sao chép vào
  `demo/features/lobby/assets/audio/the-pale-lunar-tide.mp3`. Phát lặp khi ở sảnh sau lần nhấn/chạm/phím đầu tiên;
  dừng khi vào game hoặc chuyển sang tab khác. Trình duyệt cần thao tác đầu tiên để cho phép phát âm thanh.
- **Cài đặt → Nhạc nền** có checkbox **Bật nhạc sảnh**, thanh âm lượng và phần trăm.
  Nhạc bật/tắt và âm lượng được áp dụng/lưu ngay, không cần nhấn Lưu. Các cài đặt khác giữ cơ chế lưu hiện có.
  Nút tắt âm tổng vẫn có tác dụng. Không còn phát nhạc tổng hợp chồng lên MP3.
- Logo mới dạng ngang trong suốt: **`demo/features/lobby/assets/tsuventure-logo-v2.png`**, vầng trăng, lâu đài,
  nét lá và ray, chữ vàng dễ đọc. Đã thay ở sảnh và favicon; bố cục co giãn theo màn hình.
- Có **36 bãi, tổng 450 quái**, mỗi bãi **10–15 con**, đủ bốn loài. Các bãi tránh công trình, nước và ray;
  chỉ tối đa 4 quái/bãi đuổi đánh cùng lúc, phần còn lại tuần tra. Ẩn quái/đồ trang trí ở xa.
- **Hạ hết bãi:** tự cộng **đúng 1 xu vàng, bảo đảm 100%**, đồng thời xuất hiện **1 rương chứa 1 vật phẩm ngẫu nhiên**
  trong thuốc tiên/chocolate/uranium/gỗ/thịt đùi/sắt. Nhấn E nhặt rương. Không còn rơi đồ riêng cho mỗi con.
  Lưu loại quà đã chọn, trạng thái nhặt, số xu và hạn hồi **30 phút**; tải lại không nhận xu hoặc quà lần nữa.
  Save bãi được nâng version 2; giữ kho/hunger cũ, khởi tạo lại bố trí quái cũ vì đã tăng số con và chuyển vị trí.
- **Mỗi lần lên tàu tốn 1 xu**, chỉ trừ sau khi đúng ga và tàu dừng; không đủ xu sẽ có thông báo.
  Xu đã trả cho cả lượt ở trên tàu; đi trong toa, chọn chỗ ngồi và xuống tàu không mất thêm.
- Có **368 điểm thịt đùi**, gồm trong nhiều phòng lâu đài và gần công trình, cùng các điểm ngoài map.
  Nhấn **E nhận 2 thịt đùi**, điểm nhặt hồi sau **10 phút**, lưu trạng thái. Dùng chung kho thịt và thanh độ no.
  Chỉ hiển thị tối đa 36 vật phẩm gần người chơi để tránh tạo hàng trăm tương tác mỗi frame.
- Tất cả nguồn sát thương lên quái dùng **`heroOutgoingDamage`**: đòn thường còn **22%** (giảm 78%).
  Áp dụng cho cả 5 hero, boss, quái mê cung và minion. Ninja thường **25**, chí mạng **42** thay cho 112/190.
  **Gươm Dung Nham** khi trang bị giữ sát thương vượt trội: tối thiểu **240**, đòn riêng trên rồng vẫn **600**.
  Không thay đổi sát thương quái đánh người chơi. Chỉ số mô tả ninja hiển thị theo sát thương mới.
- **Cài đặt → cuộn xuống CODE → nhập chính xác `Tsukiezz` → Nhận quà**:
  nhận **9999** mỗi loại vật phẩm hiện có: chocolate, thuốc tiên, băng gạc, gỗ, hợp kim, uranium, sắt, thịt đùi,
  xu vàng, vàng nguyệt, tinh thể không gian; mở khóa cánh pha lê, đèn pin mặt trời, gươm dung nham, thuyền,
  mảnh vỡ cổ đại. Trang bị/cổ vật có số lượng quà 9999, dùng chung chức năng trang bị và dữ liệu sở hữu thật.
  **Mỗi mã nhận một lần trên trình duyệt này**, có lưu để không cộng lặp sau tải lại. Không tự trang bị đồ nhận được.
  Kho báu chưa phát hành và các công thức tương lai vẫn chưa được tạo.

### Mã nguồn và xác minh mới nhất

- Nguồn mới: `features/characters/combat-balance.js`, `features/lobby/lobby-music.js`,
  `features/inventory/{food-pickups,gift-code}.js` (đều dưới `demo/`). Các module vật phẩm có API grant/add
  để mã quà dùng đúng kho hiện tại. Không tạo kho consumable thứ hai.
- Chạy `node tools/tests/verify_moon_economy.js` để kiểm tra bản mới. Báo cáo ở **`demo/verification/moon-economy/`**:
  **42 kiểm tra gameplay**, kèm phát/giải mã MP3 qua thao tác chuột thật, âm lượng 23%, bật/tắt,
  dừng nhạc trong game, kiểm tra logo và tải lại thật. `economy-report.json`, `persistence.json`, `lobby.png`, `settings.png`.
  Đã kiểm tra 5 hero và các boss dùng sát thương giảm; gươm đặc biệt mạnh hơn; quà, xu và mã không nhận lặp.
  Không có lỗi JavaScript/tài nguyên trong lượt đạt.
- Bộ kiểm tra ray được cấp 3 xu trong fixture để thử 3 lượt lên tàu; gameplay không cấp xu khởi đầu.
  Các báo cáo 12 bãi × 3 con ở phần lịch sử không còn là trạng thái hiện tại.
- Cập nhật **chính file Blender** `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`:
  **3.753 object**, giữ nội thất/lâu đài, thay collection bãi quái bằng 36 bãi/450 con với mesh dùng chung.
  Dữ liệu: `blender-camps.json`; công cụ: `tools/update_camp_economy_blender.py`;
  bản sao trước sửa được lưu ngoài dự án, đường dẫn trong `blender-backup.json` của báo cáo mới.
- Chạy game: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/** và tải lại trang.

## Mới nhất — nội thất kim tự tháp, lâu đài kín và bãi quái (27/10/2026)

- Kim tự tháp: đủ **13 tầng**, **306 đuốc**, **34 rương đá trang trí**, tượng canh lối vào, phù điêu và texture gạch khắc
  tạo bằng canvas. Vật trang trí đặt ở góc ngõ cụt, giữ thoáng đường đi và cầu thang. Chỉ dùng **6 đèn điểm tái sử dụng**
  gần người chơi. Ánh sáng toàn map dịu hơn; bên trong kim tự tháp tối và ấm hơn, ra ngoài tự khôi phục ánh sáng.
- Lâu đài: di chuyển cả hai cụm trưng bày giáp/kiếm rồng bị xuyên vách; chỉnh vách lấn cửa **Phòng bảo vật**.
  Dùng **31 phần tường/mái liền mạch** để đóng khe mép tầng, góc tường và mái. Lớp kín đặt sau các ô kính trang trí;
  giữ cổng, cửa phòng, cầu thang bí mật và cơ chế nhà tù. Mesh và collider cùng kích thước.
- Có **12 bãi quái, mỗi bãi 3 con**, chia đều chú lùn, rô bốt, sói và thỏ mặt trăng ác quỷ. Có tuần tra, đuổi đánh,
  tầm hoạt động giới hạn, sát thương và máu; nhận đòn từ cả 5 nhân vật. Các bãi tránh ray, nước, địa hình dốc và công trình.
- Hạ từng con sẽ rơi chiến lợi phẩm, đến gần nhấn **E** để nhặt. Các loại rơi: **thuốc tiên, chocolate, uranium, gỗ,
  thịt đùi, sắt**. Thuốc tiên/chocolate/gỗ cộng vào kho đang có, không tạo kho trùng. Uranium và sắt để chế tạo sau.
- **Hạ hết 3 con mới bắt đầu hồi bãi sau 30 phút**. Lưu cả quái đã chết, đồ đã nhặt và thời điểm hồi;
  tải lại game không hồi quái ngay, thời gian ngoài game vẫn được tính. Quái đã hạ trong bãi chưa dọn hết vẫn giữ trạng thái.
- HUD có **Độ no (0–100)**, giảm 1 điểm/15 giây khi đang chơi; tạm dừng trong menu/đối thoại.
  Dưới 20 độ no hồi thể lực chậm hơn. Mở **I → Vật phẩm → Thịt đùi → Ăn** hồi **40 độ no**, tiêu hao một thịt đùi.
  Có bảng máu quái và đồng hồ hồi bãi khi đứng gần bãi.

### Mã nguồn, kiểm tra và Blender

- Nguồn mới: `demo/features/desert/pyramid-interior.js`, `demo/features/castle/castle-integrity.js`,
  `demo/features/world/monster-camps.js`. Nối với vòng lặp/tấn công/tương tác ở `demo/index.html`, ninja abilities,
  backpack và temple-supplies; giao diện thêm trong `backpack.css`.
- Kiểm tra mới tại **`demo/verification/realm-interiors/`**:
  **52 xác nhận tính năng**, **71 kiểm tra đi bộ/lâu đài**, không có lỗi JavaScript/tài nguyên trong các lượt kiểm tra.
  Kiểm tra **19.488 điểm sàn**, **7.496 điểm mặt trước/sau**, **6.528 điểm mái**, **1.116 điểm tầng hầm**;
  không có khe hoặc cửa phòng bị chặn trong lưới dò. `persistence.json` xác nhận kho và thời điểm hồi bãi sau tải lại thật.
  Bộ đi bộ thử các phòng, cầu thang ở nhiều tốc độ/tần số cập nhật và các nút nhà tù, không chỉ kiểm tra tọa độ.
- Chạy kiểm tra tổng hợp: `node tools/tests/verify_realm_update.js`.
  Kiểm tra đi bộ: `$env:GAME_CHECK_SCRIPT='compact_checks.js'; node tools/tests/verify_realm_update.js`.
  Bỏ biến `GAME_CHECK_SCRIPT` trước khi chạy tổng hợp lại. `SKIP_SHOTS=1` chỉ bỏ chụp ảnh, vẫn kiểm tra và xuất dữ liệu.
- **Chỉ cập nhật file Blender hiện tại** `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`:
  **3.834 object**, có cả lâu đài đã sửa, nội thất kim tự tháp và bãi quái, **7 texture đóng gói**.
  Vẫn là cảnh kiểm tra ghép, chưa chứa mọi chi tiết của map runtime. Đã mở và kết nối cổng **9876**.
  `tools/update_current_realm_blender.py` cập nhật các collection liên quan từ `blender-design.json`;
  sao lưu file trước khi chạy. Bản trước sửa được lưu ngoài dự án, vị trí ở `blender-backup.json`.
- Hướng dẫn chạy game bên dưới vẫn áp dụng: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/**.
  Tải lại trang để nhận mã mới. Kho báu kim tự tháp và công thức dùng uranium/sắt vẫn chờ yêu cầu sau.

## Dọn dự án — chỉ giữ bản hiện tại (27/10/2026)

- Đã xóa **176 file, khoảng 378,10 MiB**: 12 cảnh Blender ghép cũ, backup `.blend1`, báo cáo/ảnh kiểm tra cũ,
  công cụ xuất cảnh cũ, bộ kiểm tra đã bị thay thế và bộ khung Unity không được game trình duyệt tải.
- **90 file runtime (`demo/index.html` và `demo/features/`) giữ nguyên SHA-256** sau khi dọn.
  Các file Blender từng vùng/nhân vật còn lại là nguồn chỉnh sửa của cùng map hiện tại, không phải các map thay thế.
- Bản game: `demo/index.html`; bản Blender kiểm tra mới nhất: `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`.
  Bản Blender này là cảnh kiểm tra ghép, chưa chứa mọi chi tiết của game; game vẫn ghép nhiều mô-đun trong `demo/features/`.
- Danh sách file đã xóa và checksum: `docs/current-map-cleanup.json`; giải thích: `docs/PROJECT_CLEANUP.md`.
  Bản khôi phục ngoài dự án: `%TEMP%/GameTsukiezz-current-map-20261027-151414-c669ea/`.
  Thư mục tạm có thể bị Windows dọn; đây không phải một bản game được giữ lại trong dự án.
- Chỉ giữ báo cáo mới nhất trong `demo/verification/autumn-upgrade/`. Các đường dẫn cảnh/báo cáo cũ ở ghi chép
  lịch sử bên dưới có thể đã được xóa; ưu tiên mục này và mục cập nhật 27/10.
- Kiểm tra sau dọn: `node tools/tests/verify_current_map.js` đạt; cả 90 tài nguyên tải HTTP 200, game khởi động đủ
  mê cung 13 tầng, ba đoàn tàu và hệ thống cây lấy gỗ; không có lỗi JavaScript/tài nguyên.
  Báo cáo: `demo/verification/autumn-upgrade/cleanup-smoke.json`.

## Cách chạy game — bản 27/10/2026: ninja mới, mê cung 13 tầng và thuyền

Bản chơi hiện tại dùng thư mục **`demo`** và máy chủ Python. Mở PowerShell, chạy:

```powershell
Set-Location -LiteralPath 'C:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz'
python tools/serve_game.py --port 8883
```

Giữ cửa sổ máy chủ đang chạy, rồi mở một trong các địa chỉ:

- **http://127.0.0.1:8883/** — trang chủ, chọn nhân vật rồi vào game.
- **http://127.0.0.1:8883/?technology=1** — vào ngay sân Trụ Sở Công Nghệ Hoàng Gia.
- **http://127.0.0.1:8883/?boat=1** — vào Bến Thuyền Thám Hiểm.
- **http://127.0.0.1:8883/?desert=1** — vào sa mạc và mê cung kim tự tháp.

Nếu cổng 8883 đang có máy chủ game chạy thì chỉ cần mở địa chỉ, không chạy thêm máy chủ.
Nhấn **Ctrl+C** trong cửa sổ máy chủ để dừng. Nếu máy dùng lệnh `py`, thay `python` bằng `py -3`.
Sau sửa JS/CSS chạy `python tools/refresh_web_assets.py`, rồi tải lại trang.

### Chế tạo và lái thuyền

1. Đứng gần cây ở các vùng trên map, nhấn **E** để lấy **2 gỗ/lượt**. Mỗi cây hồi sau 30 giây.
2. Khi có **10 gỗ**, chọn **Địa điểm → Trụ Sở Công Nghệ**, đi qua cửa chính vào đại sảnh.
3. Tới bàn chế tạo ở giữa đại sảnh, nhấn **E → Chế tạo thuyền**. Công thức hiện tại chỉ cần **10 gỗ**.
4. Chọn **Địa điểm → Bến Thuyền**, mở balo **I**, bấm **Thả thuyền gần bờ**.
5. Đến gần thuyền, nhấn **E** để ngồi lái. **W/S** tiến/lùi, **A/D** rẽ, **Shift** tăng tốc.
6. Lái sát bờ thoải, nhấn **E** hoặc nút **Lên bờ**. Đứng gần thuyền rồi mở balo để thu gọn.

Thuyền chạy trên **sông, hồ thủy ngân và hồ đầm lầy**, tốc độ thường **12 m/s**, giữ Shift tối đa **18 m/s**.
Thuyền kiểm tra cả thân để tránh đất cạn/vật cản; chỉ cho lên đất tại bờ có chỗ đứng an toàn.
Quyền sở hữu và vật liệu lưu trong trình duyệt (`tsuventure_engineering_v1`); tải lại game giữ thuyền đã chế tạo.
Dịch chuyển nhanh tự thu gọn thuyền. Gỗ lấy từ cây bằng E; kho vật liệu trụ sở không còn cấp miễn phí công thức cũ.

## Mới nhất — Ninja, mê cung 13 tầng, hồ, kho đồ và gỗ từ cây (27/10/2026)

**Mục này thay thế công thức thuyền, mê cung một tầng và hình ninja trong các ghi chép cũ.**

- Portrait ninja mới: `demo/features/characters/ninja-yinyang/portrait-art-v2.png`, tạo theo phong cách furry fantasy
  của các thẻ nhân vật hiện có, giữ gấu trúc đen/trắng, mắt xanh tím, hai đoản đao và biểu tượng âm dương.
  Thẻ ninja dùng cùng bốn nhóm Sức Mạnh/Phòng Thủ/Ma Thuật/Tốc Độ và hiện máu/giáp/thể lực nền như các nhân vật khác.
  `NINJA_COMBAT` là nguồn dùng chung cho chỉ số thật và phần mô tả: đòn thường 112, chí mạng 190, 6 thể lực/đòn,
  tốc độ +18%, thời gian đòn 0,32 s, Ảnh Bộ 20 thể lực và hồi 6 s. Các giá trị chiến đấu trước đó được giữ.
- Kim tự tháp hiện có **13 tầng, tổng cộng 1.101 ô**, các tầng thu nhỏ theo hình chóp, từ cao độ **2 m đến 168 m**.
  Mỗi tầng có mê cung riêng; giữa các tầng lớn là **cầu thang xoắn đi bộ thật**, hai tầng sát đỉnh dùng thang nhấn E.
  Có sàn, trần, va chạm, camera, rắn/nhện theo tầng và phòng phong ấn kho báu tại đỉnh.
  Lối quanh giếng thang được nối để mê cung không bị chia cắt; đã thử đi lên lẫn xuống và đi trong các tầng.
  Sàn, răng thang và tường được gộp mesh; tường/trần tách theo tầng để truy vấn camera nhanh hơn.
- Thuyền nhận cả nước hồ thủy ngân và hồ đầm lầy, tăng tốc 12/18 m/s, quay linh hoạt hơn;
  vẫn kiểm tra toàn thân và độ sâu khi di chuyển nhanh. Công thức mới **10 gỗ**, không trừ hợp kim.
  Giữ quyền sở hữu thuyền cũ và tồn kho đã lưu. `tree-wood.js` lập chỉ mục cây từ các nhóm mesh và cây sinh thái,
  chỉ tạo một tương tác cây gần nhất để tránh thêm hàng nghìn tương tác mỗi frame.
- Kho đồ có tìm kiếm không phân biệt dấu tiếng Việt, các nhóm **Tất cả/Vật phẩm/Trang bị/Di chuyển/Nguyên liệu**,
  thẻ gọn, đánh dấu trang bị và bố cục điện thoại. Giữ nguyên các nút dùng/trang bị và dữ liệu vật phẩm.
- Hàng gai/đá dựng cũ ở hồ thủy ngân không còn được tạo cùng collider trùng chồng.
  Thay bằng các trụ thấp thưa, đặt theo mặt đất thật, chừa lối vào, tránh nước và ray;
  lớp bờ có polygon offset và được cắt tại sông để tránh xung đột hình ảnh.
- Bàn chế tạo có tay máy, màn hình nghiêng, đèn trạng thái và bản vẽ thuyền dạng hologram;
  giao diện chế tạo được làm lại theo phong cách kỹ thuật. Hộp thoại ghi đúng yêu cầu lấy gỗ từ cây.
- Giữ ổn định nút ray `red_P12` tại vị trí đã khảo sát an toàn (-440, -400), có kiểm tra vật cản trước khi dùng,
  để việc bỏ các cụm gai cũ không đẩy tuyến vào khúc cua gắt khác.

### Nguồn và kiểm tra bản 27/10

- Nguồn mới: `features/desert/pyramid-floors.js`, `features/inventory/{tree-wood,inventory-layout}.js`,
  `features/characters/hero-stat-sync.js`. Các điểm nối ở `demo/index.html`, ninja abilities,
  `river-boat.js`, `technology-base.js`, `expanded-realm.js`, CSS balo và quy hoạch ray.
- **Kết quả mới: `demo/verification/autumn-upgrade/`**.
  `adventure-report.json`, `upgrade-final.log`: **228 xác nhận, không có lỗi JavaScript**, lấy gỗ bằng phím E thật, chế tạo bằng 10 gỗ, kiểm tra vùng chạy
  và tăng tốc thuyền, đi lên/xuống cầu thang xoắn, lên đỉnh bằng thang, đi thực trong mê cung, lọc kho đồ.
  `persistence.json` xác nhận khôi phục thuyền sau tải lại trang. `inventory-mobile.png` kiểm tra bố cục 390 px.
  `railway-final-2.log` và `acceptance.json` là kết quả kiểm tra ray mới; log trước đó phát hiện cua gắt và đã sửa.
  Ảnh kiểm tra giao diện ở `crafting.png`, `inventory.png`, `technology.png`.
- Chạy bộ cập nhật: `node tools/tests/verify_autumn_upgrade.js`.
  Chạy ray: đặt `GAME_VERIFY_OUTPUT` tới `demo/verification/autumn-upgrade`, rồi chạy
  `node tools/tests/verify_three_rail_services.js`.
- Kiểm tra ray đạt **13.856 xác nhận**, không có giao cắt hình học lỗi, vật cản hoặc đoạn cua quá gắt;
  cả 11 ga vẫn ở mặt đất, khoảng cách ba đoàn tàu tối thiểu 100 m trong bài kiểm tra.
- Bản Blender mới: **`Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`**, scene cùng tên, **2.248 object**,
  tạo riêng bằng `tools/build_autumn_upgrade_review.py`; các workspace trước vẫn giữ.
  Đã mở và xác nhận kết nối Blender trực tiếp tại `127.0.0.1:9876`. Vỏ kim tự tháp ẩn trong viewport để xem các tầng;
  có thể bật lại các object `Pyramid_sandstone` và `Pyramid_gold`. Việc ẩn này không ảnh hưởng game.
  Không commit, push hay triển khai. Phần thưởng kho báu tiếp tục chờ yêu cầu sau.

## Mới nhất — Gỡ công trình cũ, nối địa hình và trụ sở chế tạo (26/10/2026)

**Đọc phần này trước các ghi chép lịch sử bên dưới.**

- Đã gỡ trạm vũ trụ cũ, tế đàn hai tầng và đài thiên văn khỏi bản đồ, va chạm, tương tác, menu và mốc địa điểm.
  Menu điểm đến không còn phụ thuộc các chỉ số nút cũ; thư viện được cập nhật góc nhìn tương ứng.
- Trụ Sở Công Nghệ Hoàng Gia mới gần lâu đài, tâm **(-225, 20)**: đại sảnh, bốn bàn máy,
  bàn chế tạo trung tâm, hai kho vật liệu, tháp công nghệ, sân trước và tên lửa hỏng nặng để trang trí.
  Nền móng lấy độ cao toàn bộ khu đất, có đường thoải vào đại sảnh; tường/trần/đồ máy có va chạm và camera.
- Thuyền là vật phẩm chế tạo được và lái được, có kiểm tra độ sâu/toàn thân, lên bờ an toàn, thu gọn,
  lưu sở hữu, khôi phục sau tải lại. Không cần Blender hoặc Unity Editor để chạy bản web này.
- Sinh vật mới phân bố ngẫu nhiên trên đất khô: **8 voi, 24 gà, 12 trâu** mỗi phiên;
  có mô hình, chân chuyển động, tránh nước/công trình/ray và mục thư viện. Các loài cũ vẫn giữ.
- `terrain-continuity.js` khảo sát mép mesh thực của sa mạc, tuyết, đầm lầy, núi lửa;
  tạo dải nền chuyển tiếp và vá chỗ thiếu mặt. Bản kiểm tra có **311 đoạn cần nối, 1.049 ô chuyển tiếp**,
  bốn vị trí thiếu mặt phát hiện theo lưới; có bổ sung kiểm tra khe hẹp ngay mép tam giác.
  Dải chuyển tiếp được đưa vào cùng chỉ mục tam giác với ray, nền nhân vật và camera.
  Nếu nhân vật đã lọt dưới nền hơn 3 m, đưa lại đúng mặt đất hiển thị; giữ đường đi riêng cho hang, hầm và nước.
- Bộ sinh thái dùng nền mới; cây/cỏ được dọn khỏi nền trụ sở. Các hàm biome đồng ý với độ cao mặt hiển thị,
  không còn chọn nhầm một lớp nền thấp theo thứ tự vùng. Ba đoàn tàu chung mạng ray và các ga mặt đất tiếp tục được kiểm tra hồi quy.

### File, kiểm tra và Blender của bản trụ sở/thuyền

- Nguồn mới: `demo/features/world/terrain-continuity.js`,
  `demo/features/technology/technology-base.js`, `demo/features/technology/river-boat.js`.
- Điểm nối: `demo/index.html`, `features/world/{surface-sync,living-world,lunar-biome}.js`,
  `features/railway/moon-railway.js`, `features/castle/castle-upgrade.js`, HUD và thư viện.
- **Kết quả mới đặt ở `demo/verification/technology-adventure/`.**
  `adventure-report.json` / `adventure-final.log`: **92 kiểm tra đạt**, không lỗi trình duyệt;
  sai lệch nền di chuyển với bề mặt chuyển tiếp trong mẫu kiểm tra tối đa khoảng **4,1 cm**.
  Có kiểm tra chế tạo, trừ vật liệu, ngồi lái, di chuyển, lên bờ, chống chạy vào đất và chống rơi khỏi thuyền.
  `persistence.json`: khôi phục vật phẩm thành công sau lần **tải lại trang thật**.
  `surface-ninja-report.json` / `surface-regression.log`: **438 kiểm tra nền, cây cỏ, camera và nhân vật cũ đạt**.
  `acceptance.json` / `railway-final.log`: **13.835 kiểm tra ray đạt**, `geometryFailures: []`,
  giữ khoảng cách **100 m**, không vật cản hay cua gấp trong khảo sát.
  `technology.png` là ảnh kiểm tra căn cứ; `engineering.json` có hình học terrain, ray, căn cứ, thuyền và sinh vật mới.
- Blender: `Assets/Art/Blender/Environments/RoyalTechnologyRiverAdventureFinal.blend`,
  scene **RoyalTechnologyRiverAdventure**, **1.515 object local**.
  Công cụ: `tools/build_technology_adventure_review.py`; từ chối ghi đè file đã tồn tại.
  Không thay thế các workspace cũ.

Chạy kiểm tra tính năng: `node tools/tests/verify_technology_adventure.js`.
Chạy kiểm tra ray: đặt `GAME_VERIFY_OUTPUT` tới `demo/verification/technology-adventure`, rồi
`node tools/tests/verify_three_rail_services.js`.
Chạy kiểm tra nền/camera/nhân vật: `node tools/tests/verify_surface_ninja.js`
với `GAME_URL=http://127.0.0.1:8883/?technology=1` và cùng thư mục kết quả.
Các kiểm tra Chrome có thể cần quyền chạy ngoài sandbox. Chưa commit, push hoặc triển khai.

## Mới nhất — Đồng bộ sông/ray, Nhân Sư di chuyển và mê cung độc (26/10/2026)

**Mục này thay thế các vị trí và thiết kế nội thất sa mạc trong ghi chép cũ bên dưới.**

- Kim tự tháp đã dời sang đất khô tại **(-540, 30)**, vẫn đáy 200 m và cao 180 m.
  Vị trí cũ (-690, 100) lấn vào bờ sông khi mở rộng nội thất; không đưa công trình về vị trí đó.
  Nền cát lấy mẫu tam giác địa hình thật, loại vùng sông/bờ, núi và địa hình chuyên biệt;
  không san phẳng hoặc phủ mesh cát lên các vùng này. Lối đi bộ ngắt lớp lát tại ray và sông.
- Giảm màu đá/cát, bỏ đèn phủ sáng ngoài trời; chỉ có sáu đèn lửa nhỏ cường độ 0,22, tầm 10 m,
  bật theo khoảng cách trong mê cung. Đá được gộp theo vật liệu và có sắc độ theo mặt.
  Quái trong mê cung chỉ hiển thị khi ở gần người chơi bên trong; camera dùng mesh đã gộp và truy vấn va chạm theo lưới.
- **Nhân Sư 12.000 HP**, vị trí nhà **(-535, 280)**, tuần tra và truy đuổi trên đất khô, tốc độ đuổi 5,5 m/s.
  Có động tác chân, miệng tối/răng nanh và mắt đỏ; va chạm theo vị trí/hướng quay hiện tại.
  Vùng di chuyển kiểm tra toàn thân để tránh kim tự tháp, sông và đường ray; không đuổi vào mê cung hoặc lên tàu.
  Giữ hóa đá báo trước 2 giây, khóa 4 giây và 65 sát thương; địa chấn báo trước 1,25 giây, 90 sát thương.
- Nội thất hiện là **mê cung 11 × 11 (121 ô)**, có ngõ cụt và lối đúng dài **67 ô** tới phong ấn.
  Tường/trần thật chặn di chuyển, nhảy, camera, tầm nhìn và đòn đánh. Đường vào phía nam tại (-540, 130).
  **5 rắn hổ mang (360 HP)** và **6 nhện độc (220 HP)** tìm đường theo hành lang, không cắt xuyên tường.
  Cắn báo trước 0,65 giây. Rắn: 16 sát thương + độc 4 máu/giây trong 8 giây.
  Nhện: 10 sát thương + độc 3 máu/giây trong 6 giây. Độc có hiển thị, tự hết hạn, dừng khi mở hội thoại/menu;
  có hồi sinh nếu chết. Đánh thường/ninja hỗ trợ cả hai loài; thư viện có mô tả và ảnh mô hình.
  **Kho báu vẫn chưa có phần thưởng**, chờ yêu cầu tiếp theo.
- Ba đoàn Đỏ/Xanh/Vàng vẫn chung mạng dày, **khoảng 15,87 km**, **11 ga mặt đất**, khoảng cách 100 m.
  Hai nút gần công trình dùng khoảng khảo sát sát hình học hơn để tránh bị đẩy vào hồ;
  bố trí ga kiểm tra cả đường lên sân ga đến 72 m, loại vị trí có nước/vật cản ở lối tiếp cận.

### Kết quả và công cụ của bản mê cung

- **Chỉ dùng `demo/verification/desert-labyrinth/` để xác nhận bản mới.**
  `acceptance.json`: **13.835 kiểm tra**, `geometryFailures: []`, `obstacleHits: []`, `tightPaths: []`, 100 m giữ khoảng cách.
  `railway-regression-2.log` là bản đạt; log trước đó phát hiện một lối ga chạm nước và đã sửa.
- `desert-report.json` / `labyrinth-final.log`: **230 kiểm tra đạt**, không lỗi trình duyệt;
  đi từ ga tới cửa, đi hết lối mê cung bằng hệ thống di chuyển thật, Nhân Sư tuần tra/đuổi/hóa đá,
  rắn/nhện di chuyển trong hành lang, cắn gây độc, độc hết hạn, tường chặn hai phía đều đạt.
  `desert.png` / `interior.png` đã xem kiểm tra ánh sáng và hình học.
- Runtime: `demo/features/desert/desert-layout.js`, `desert-enemies.js`, `desert-realm.js`;
  các điểm nối trong `demo/index.html`, `surface-sync.js`, `moon-railway.js`, ninja và thư viện.
  Bản mã cũ trước mê cung được lưu ở `demo/verification/desert-pyramid/desert-realm-before-labyrinth.js`.
- Blender đang kết nối cục bộ 9876, mở **`Assets/Art/Blender/Environments/SphinxLabyrinthWorkspace.blend`**,
  scene **SphinxLabyrinthReview**, **654 object**, 241 phần sa mạc/mê cung/sinh vật, toàn bộ object local.
  Dữ liệu lấy từ mesh game thật trong `engineering.json`; công cụ `tools/build_desert_labyrinth_review.py`.
  Các workspace cũ vẫn giữ nguyên; công cụ từ chối ghi đè workspace mới nếu đã tồn tại.

Chạy: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/?desert=1**.
Kiểm tra mê cung: `node tools/tests/verify_desert.js` (mặc định chạy `desert_labyrinth.browser.js`).
Kiểm tra ray: đặt `GAME_VERIFY_OUTPUT` tới `demo/verification/desert-labyrinth`, chạy
`node tools/tests/verify_three_rail_services.js`. Sau sửa JS dùng `python tools/refresh_web_assets.py`.
Chưa commit, push hay triển khai.

## Bản mới nhất — Sa mạc, Kim Tự Tháp và Nhân Sư (26/10/2026)

Mục này bổ sung và cập nhật trạng thái mạng ray ở phần bên dưới. Không làm lại các tính năng đã đạt kiểm tra.

- Đã thêm sa mạc phía tây, kim tự tháp tại **(-690, 100)**, đáy **200 × 200 m**, cao **180 m**.
  Có cửa phía nam, hành lang, phòng kho báu, va chạm tường/trần và camera trong nhà.
  Kho báu **chưa có vật phẩm hoặc phần thưởng**, đúng yêu cầu sẽ cập nhật sau; hiện có biển và tương tác thông báo.
- Nhân Sư Anh Minh tại **(-750, 260)**, mô hình Blender cao khoảng 52,5 m, **12.000 HP**.
  Ánh nhìn báo trước 2 giây bằng vòng sáng, gây 65 sát thương và hóa đá 4 giây nếu không né.
  Hóa đá khóa di chuyển, tấn công, nhảy, bay và ảnh bộ; tự hết hạn. Địa chấn báo trước 1,25 giây,
  gây 90 sát thương. Tường kim tự tháp che chắn đòn phép; có chết, hồi sinh người chơi và trạng thái boss bị đánh bại.
  Đòn đánh thường và ninja đã kiểm tra thực tế; có mục Nhân Sư và ảnh mô hình trong thư viện.
- Thêm **Ga Kim Tự Tháp**, dùng chung ba đoàn Đỏ/Xanh/Vàng, vẫn 60 giây dừng khi có yêu cầu.
  **11/11 ga sát đất**, hành trình chung khoảng **15.757 m**, tám dải xuyên map, giữ khoảng cách 100 m.
  Ga nằm trên đoạn ray an toàn hiện hữu gần **(-114, 183)**; có đường lát dẫn tới cửa kim tự tháp,
  không phải sân ga đặt ngay chân công trình. Đã đi thử toàn bộ đường này bằng hệ thống di chuyển thật.
  Không chốt các phương án kéo ray qua núi suối nóng/cầu gỗ hoặc chuyển sang núi Bạch Khuyết.
  Các điểm quy hoạch của tuyến dày cũ được giữ, chỉ thêm ga và cập nhật nền ga/khảo sát công trình mới.
- Cây/cỏ không sinh trong sa mạc. Địa hình dùng mesh tam giác chung cho ray, nhân vật và camera.
  Đèn hành lang đã giảm để giữ chi tiết đá. Vào **Địa điểm → Sa Mạc & Kim Tự Tháp** hoặc dùng URL bên dưới.

### Kiểm tra và file hiện tại

- `demo/verification/desert-pyramid/acceptance.json`: **13.748 kiểm tra**, `geometryFailures: []`,
  `minGap: 100`, 12 phương tiện. **`railway-regression-5.log` là bản đạt**; log 1–4 là các thử nghiệm không dùng.
- `desert-report.json`, `desert-final.log`: đi từ ga vào/ra phòng kho báu; tường, trần, camera;
  né/hết hóa đá, khóa di chuyển/tấn công, dừng khi mở hội thoại, đánh thường/ninja và hạ boss đều đạt.
  `desert.png` và `interior.png` là ảnh kiểm tra game; `engineering.json` là dữ liệu xuất Blender bản hiện tại.
- Mô hình: `tools/build_desert_pyramid.py` → `demo/features/desert/data/desert-assets.js`
  và `Assets/Art/Blender/Environments/DesertOfTheWiseSphinx.blend`.
- Runtime chính: `demo/features/desert/desert-realm.js`. Các điểm nối ở `demo/index.html`,
  `railway/{moon-railway,railway-clearance}.js`, `world/{surface-sync,living-world,lunar-biome}.js`,
  thư viện, ninja, cánh pha lê và xử lý nhảy trong `castle-upgrade.js`.
- Workspace Blender mới: **`Assets/Art/Blender/Environments/DesertRailwayWorkspace.blend`**,
  scene **DesertRailwayReview**, **625 object**, gồm 212 phần công trình/quái vật và bản ray/ga/địa hình thật.
  Không có object liên kết ngoài. Các file Blender cũ không bị thay thế.
  `tools/review_desert_railway.py` tạo workspace và **từ chối ghi đè workspace đã tồn tại**.
  `demo/verification/desert-pyramid/blender-review.json` lưu kết quả kiểm tra.

Chạy game: `python tools/serve_game.py --port 8883`, mở **http://127.0.0.1:8883/?desert=1**.
Chạy kiểm tra sa mạc: `node tools/tests/verify_desert.js` (Chrome kiểm tra cục bộ có thể cần quyền chạy ngoài sandbox).
Sau sửa mã: `python tools/refresh_web_assets.py`. Khi đổi hình học ray, chạy lại bộ ba tuyến với
`GAME_VERIFY_OUTPUT` trỏ tới `demo/verification/desert-pyramid`.

Phần chủ ý chờ yêu cầu tiếp theo: **nội dung/phần thưởng kho báu**. Chưa commit, push hay triển khai.

## Yêu cầu đang áp dụng — 26/10/2026

**Đọc mục này trước các ghi chép lịch sử bên dưới.** Chủ dự án đã xác nhận:

- Có **ba đoàn tàu/tuyến Đỏ, Xanh, Vàng**, mỗi đoàn gồm đầu máy và **ba toa khách**.
  Không phải thêm ba toa vào một đoàn; cũng không phải ba mạng ray tách biệt.
- Ba đoàn dùng **chung đường ray**, nhưng mạng ray phải **dày, uốn lượn vào trong map**.
  Bản chỉ chạy quanh rìa map đã bị yêu cầu thay thế. Không quay lại thiết kế đó.
- Giữ ga và ray sát đất ở vùng bằng phẳng. Chỉ làm cầu và đoạn nâng cao tại sông,
  sườn núi hoặc địa hình hiểm trở; không nâng toàn bộ mạng lên trời.
- Giữ chức năng bấm **Chờ tàu** mới dừng, thời gian dừng **60 giây**, đi lại giữa ba toa,
  chọn ghế, camera trong toa, logo và NPC lính chì hoàng gia lái tàu.
- Tiếp tục dùng Blender hỗ trợ thiết kế; giữ nguyên các file/scene cũ đã làm.

### Thay đổi trong phiên hiện tại

- Mở rộng tuyến chung thành đường uốn lượn qua **tám dải ngang**, gồm nhiều đoạn xuyên
  nội địa và các cua nối rộng. Tổng hành trình hiện khoảng **15,8 km**, 32 phần hình học
  (16 đoạn nối giữa các điểm quy hoạch và 16 cua). Ba đoàn cùng chiều trên cùng hành trình;
  các đoạn song song không phải các tuyến tách khỏi nhau.
- Giữ khoảng cách dọc tuyến tối thiểu **100 m**, giảm tốc trước tàu đang dừng; có thêm
  kiểm tra không gian của cả đầu máy và ba toa trước khi tiến. Tàu chờ tín hiệu nếu đoạn
  trước bị chiếm. Mỗi đoàn có trạng thái, yêu cầu dừng và thời gian chờ riêng.
- Có bộ chọn **Chuyến gần nhất / Tuyến Đỏ / Tuyến Xanh / Tuyến Vàng** tại ga. Các ga
  thuộc mạng dùng chung; người đang trên tàu vẫn chọn được ga tiếp theo trên hành trình.
- Lấy mẫu đường cong đều theo chiều dài để tránh đoạn móc ngược do ô lưới quá ngắn;
  tính tư thế xe bằng hai điểm bogie trước/sau, nội suy hướng và giới hạn tốc độ theo cua.
- Định tuyến tránh hàng rào rừng và công trình có sẵn; chi phí địa hình dựa vào độ gồ ghề,
  không dùng độ cao tuyệt đối để ép tàu rời vùng đất bằng. Cao nguyên bằng trên núi không
  tự động biến thành cầu chỉ vì cao độ lớn.
- Nền đường là một mesh đất đắp liên tục, có cùng tam giác với mặt đi bộ, thay cho hàng
  nghìn hộp đá. Các ga mặt đất có đường dốc thấp; cầu thang chỉ dùng cho ga cần nâng cao.
- Bố trí ga xét toàn đoạn sân ga và vùng tiếp cận thay vì chỉ vài điểm rời rạc, tránh ga
  bằng phẳng bị kéo lên bởi một đỉnh dốc sát đầu sân. Lần khảo sát mới nhất có **10/10 ga
  mặt đất**. Cây, cỏ, sinh vật và camera tiếp tục dùng mặt nền thật qua `surface-sync.js`.

### Kiểm tra và hiện vật của bản mạng ray dày

- Bộ chính: `tools/tests/verify_three_rail_services.js`, phần kiểm tra trong
  `tools/tests/three_services_acceptance.browser.js`; dữ liệu xuất Blender tại
  `tools/tests/export_three_services.browser.js`.
- Thư mục kết quả mới: **`demo/verification/dense-shared-services/`**. Các thư mục
  `shared-services/`, `three-services/` và `railway-junctions/` là bản trước, không dùng
  chúng để khẳng định bản mạng ray dày đã đạt kiểm tra.
- Bộ hồi quy cần dùng sau khi chốt hình học: `verify_railway_vehicle_clearance.js`
  (lan can render thật) và `verify_surface_ninja.js` (nền, cây, sinh vật, camera, ninja).
- Các kiểm tra cũ giả định một tàu, 24 nhánh cũ, dốc tối đa 6% hoặc nút phẳng bán kính
  84 m không còn là đặc tả hiện tại; không chạy chúng rồi làm méo thiết kế mới để đạt số cũ.
- **Đã hoàn tất kiểm tra bản dày ngày 26/10/2026:** `acceptance.json` có 13.711 kiểm tra,
  `geometryFailures: []`, tám lượt băng ngang map, 59,5% điểm hành trình trong nội địa.
  Giữ khoảng cách tối thiểu 100 m trong thử chờ ga và 100 ảnh chụp trạng thái mô phỏng;
  không giao/chồng các hành lang độc lập, không có vật cản hoặc cua móc ngược trong khảo sát.
- Cả **10 ga mặt đất**, mặt sân ga cao hơn nền tại điểm đón khách khoảng 4–17 cm; đã đi
  lên/xuống bằng hệ thống di chuyển thật, không nhảy. Ba đoàn đều đã thử đi qua các toa,
  chọn ghế, camera trong toa, yêu cầu dừng, chờ đủ 60 giây và khởi hành lại.
- `guard-report.json`: **4.360 instance lan can**, **5.253 vị trí** đầu máy/toa, `hits: []`.
- `surface-ninja-report.json`: **350 kiểm tra đạt**, 17.029 điểm cây cũ được đồng bộ;
  cây/cỏ mới, chân sinh vật, camera và ninja vẫn hoạt động. `line-ui-report.json` xác nhận
  chọn cả ba tuyến bằng bộ chọn rồi bấm nút Chờ tàu thật, cùng bố cục mobile 390 px.
- `attempt10.log` là lần đạt bộ chính; các `attempt1–9` là chẩn đoán trong lúc sửa.
  Ảnh `station.png` cho thấy ga mặt đất và minimap mạng ray xuyên map; `blender.png`
  là thiết kế đang mở. Không dùng log thử thất bại làm kết quả đạt.
- Blender đang kết nối trực tiếp qua cổng 9876 và mở **`DenseSharedRailServicesWorkspace.blend`**,
  scene **`DenseSharedRailServices`**, **398 object**, 12 nhóm phương tiện. Giữ cả bốn scene
  trước đó; mesh mới là local, không phụ thuộc mesh liên kết ngoài. Bản nguồn sinh tự động
  là **`DenseSharedRailServices.blend`**, tách khỏi Workspace để không ghi đè chỉnh sửa tay.

Chạy lại (PowerShell; từng bộ lần lượt để tránh tranh GPU):

```powershell
$env:GAME_URL='http://127.0.0.1:8883/?railway=1&version=dense-shared'
$env:GAME_VERIFY_OUTPUT=(Resolve-Path demo/verification/dense-shared-services).Path
node tools/tests/verify_three_rail_services.js
node tools/tests/verify_three_rail_services.js --ui-only
node tools/tests/verify_railway_vehicle_clearance.js
node tools/tests/verify_surface_ninja.js
```

Nếu cần xuất lại Blender, dùng các tham số `--source`, `--scene`, `--prefix`, `--output`
như hướng dẫn trong `docs/MOON_RAILWAY.md`. Chỉnh Workspace không tự đồng bộ ngược vào
logic định tuyến JS. Không còn phần bắt buộc nào của yêu cầu hiện tại đang chờ thực hiện.

### Các file chính

`demo/features/railway/{moon-railway.js,railway-clearance.js}`, `demo/features/world/surface-sync.js`,
`tools/export_railway_engineering.py`, `tools/review_dense_shared_railway.py`.

Blender ở `E:\blender.exe`, cầu nối cục bộ `127.0.0.1:9876`. Công cụ
`tools/connect_railway_blender.py` bật addon cho phiên hiện tại, không đổi thiết lập lưu
toàn cục. Các scene cũ đã được giữ khi append bản mới. Lưu vào Workspace mới, không ghi
đè file nguồn thư viện đang được Blender sử dụng. Bản thiết kế trước đang có
`SharedRailServicesWorkspace.blend`; bản dày dùng tên `DenseSharedRailServicesWorkspace.blend`.

Game cục bộ: `http://127.0.0.1:8883/?railway=1&version=dense-shared`.
Khởi động lại nếu cần: `python tools/serve_game.py --port 8883`.
Sau sửa JS/CSS chạy `python tools/refresh_web_assets.py` để cập nhật khóa cache.
Chưa commit, push hoặc triển khai; giữ nguyên các thay đổi khác đang có trong working tree.

---

## Ghi chép các phiên trước — có chi tiết đã bị thay thế

Cập nhật: **đêm 25–26/10/2026**, giờ Việt Nam. Tài liệu này giúp chủ dự án hoặc trợ lý ở thiết bị khác tiếp tục công việc mà không cần đọc lại cuộc trò chuyện.

## Rà soát bổ sung nút giao và vật cản — đêm 25–26/10

Phần này mới hơn các kết quả ghi bên dưới.

- Đã xác định nguyên nhân ray chằng chịt: từng nhánh tự tìm đường mà không dành hành lang
  cho nhánh khác; các bộ sàn cầu/lan can cũng vẽ chồng tại nút giao.
- Mỗi nhánh hiện có dải quy hoạch riêng và giữ khoảng cách với nhánh đã dựng. Nút giao
  dùng cùng cao độ trong vùng chuyển hướng, dùng một nền chung; không lặp bộ sàn cầu
  và lan can của từng đường rẽ. Có 16 vùng nối/cua, gồm 12 nút phân nhánh của mạng gốc.
- Không bỏ qua mesh kiến trúc lớn nữa: tách thành phần theo chỉ số hình học để khảo sát
  đầy đủ cầu/kiến trúc ven sông, kiến trúc hồ và hàng rào rừng. Trụ cầu được xét toàn chiều
  cao để không xuyên mái/công trình ở dưới. Cây được đo theo đúng vị trí sau khi bám nền.
- Địa hình dưới tàu được lấy cực đại trên các tam giác thật trong toàn vùng thân tàu,
  thay cho chỉ đo một số điểm rời. Chừa 16 m cho gốc cây quanh ray để tán cây sinh thêm
  không phủ vào hành lang, kiểm tra cả các cụm cây ở xa đang bị ẩn để tối ưu render.
- Đã bắt thêm đầu máy chạm lan can cầu ở cua gấp bằng hình học render thật. Mặt cầu
  được nới rộng lên 12,6 m, lan can lùi ra ngoài; bỏ lan can chắn sân ga. Sàn đi bộ và
  va chạm lan can được sửa đồng bộ. Không thay nội thất, NPC hay chức năng chọn ghế.
- Bộ kiểm tra mới: `tools/tests/verify_railway_junctions.js` (giao cắt, cảnh sau sinh cây,
  địa hình/bánh tàu, ga/cầu thang và tải lại với cây ngẫu nhiên),
  `tools/tests/verify_railway_vehicle_clearance.js` (đầu máy/toa với lan can render thật).
- Blender đã kết nối trực tiếp ở **E:\blender.exe**, cổng **9876**. Đã kiểm tra tọa độ
  nền nút giao với game, sai lệch lớn nhất khoảng 0,0000061 m. Bản thiết kế có các collection
  riêng cho đoạn ray, nút giao, ga và trụ, cùng camera xem nút giao. Dùng Empty cha để
  chọn/di chuyển từng nhóm. File studio nội thất cũ không bị ghi đè.
- `ai_blender_cli.py` kiểm tra bằng `get_scene_info` thay vì lệnh `ping` không đáng tin;
  công cụ khởi động đã tự tìm E:/D: hoặc nhận `-BlenderExecutable`. Xem hướng dẫn mới
  ở `docs/BLENDER-MCP.md`; không cần đổi chính sách chạy script của Windows.

### Bản Blender đang làm việc

- Mở **`Assets/Art/Blender/Environments/RailwayJunctionsWorkspace.blend`** để tiếp tục.
  Scene đang xem: **`RailwayJunctionsReviewed`**, 361 object, 83 collection. Empty cha và
  collection có tiền tố `Reviewed_`, chia riêng từng đoạn ray, nút giao, ga và trụ cầu.
- Workspace giữ cả `RailwayCivilEngineering` và scene cũ đang mở; không xóa dữ liệu cũ.
  Các mesh trong scene mới là dữ liệu local, không phụ thuộc mesh liên kết ngoài.
- **`RailwayJunctionsReviewed.blend`** là bản sinh từ khảo sát, có mặt cầu rộng, lan can,
  khoảng trống tại ga và cao độ/pitch từ các instance cầu thật trong game.
  `export_railway_engineering.py` chỉ dựng lại file sinh này, **không ghi đè Workspace**.
- Không mở nguồn sinh rồi lưu đè lên chính file thư viện vừa append vào Blender.
  Lưu sang Workspace riêng; lỗi Blender không cho ghi đè thư viện đã được xử lý theo cách này.
- Chỉnh thủ công trong Workspace không tự xuất ngược vào bộ tìm đường runtime.
  Muốn cập nhật thiết kế từ game, chạy kiểm thử và xuất nguồn sinh mới, rồi append một scene
  mới vào workspace; giữ scene đang chỉnh. Studio nội thất trong `MoonRailway.blend` vẫn riêng.

### Kết quả rà soát bổ sung

- `verify_railway_junctions.js` đạt: **9.134 đoạn hình học**, không có cặp nhánh độc lập
  giao cắt/chạy quá sát ngoài vùng nút giao; các đường rẽ trong nút cùng cao độ.
  Kiểm tra cả cảnh sau khi đặt cây xuống đất, cây xa đang ẩn và **hai lần tải lại sinh cây mới**.
- Khảo sát khoảng 18,5 nghìn hộp từ map gốc và hơn 42 nghìn hộp trong cảnh đủ cây mới.
  Bánh tàu được kiểm tra theo vị trí/độ nghiêng thật trên toàn hành trình.
  Đi lên/xuống cả 10 cầu thang, đi trên phần cầu nới rộng và va chạm mép lan can đều đạt.
- `verify_railway_vehicle_clearance.js` đạt: **11.320 instance lan can/trụ lan can**,
  **8.882 vị trí lấy mẫu**, không chạm phần đầu máy hoặc toa. Bộ này đã từng bắt được
  Cowcatcher chạm lan can ở cua; hiện đã có assert để ngăn lỗi trở lại.
- Báo cáo/ảnh: `demo/verification/railway-junctions/` gồm `clearance-report.json`,
  `guard-report.json`, `engineering.json`, `blender-review.json`, `junction.png`.
  Chạy lại các bộ theo thứ tự, không chạy đồng thời nếu máy/GPU yếu.
- Vẫn giữ 24 nhánh logic, 12 nút phân nhánh, 10 ga; đường tuần tra hiện khoảng **26,6 km**.
  Những con số/ảnh nền ở các phần lịch sử bên dưới có thể thuộc tuyến cũ.
- Chưa commit, push hay triển khai remote. Không thay nội dung kho báu, không xây thêm thuyền.
- Sau bản cầu rộng/lan can cuối, đã chạy lại `verify_railway.js`,
  `verify_railway_network.js`, `verify_surface_ninja.js`: đều đạt, gồm nhập W/C thật,
  mobile, dừng theo yêu cầu 60 giây, camera và ninja. Cú pháp JS/Python và diff-check
  các file tracked liên quan cũng đạt. Blender vẫn đang kết nối, workspace đã lưu.

## Trạng thái mới nhất — mặt đất, Ninja và tuyến tránh vật cản

Phần này được ưu tiên khi có khác biệt với ghi chép lịch sử bên dưới. Giữ nguyên các thay đổi hiện có; không reset/clean hoặc chạy lại bộ dựng Blender để làm sạch dự án.

### Đã thực hiện

- Giữ lại logo Tsuventure, NPC Lính Chì Hoàng Gia, đầu máy + ba toa, đi lại giữa toa,
  chọn ghế bằng C, gọi tàu theo yêu cầu và dừng 60 giây. Không làm lại các tính năng này.
- `demo/features/world/surface-sync.js` thống nhất mặt đất theo tam giác render thật,
  đặt lại cây/cỏ vào nền, đồng bộ động vật và sửa mép địa hình/bờ hồ thủy ngân.
  Camera được chặn bởi đất, tường ga, sàn ga, cầu thang và thân tàu; dịch chuyển xa sẽ
  đặt lại camera. Không khẳng định camera của mọi khu vực đều đã được kiểm tra thủ công.
- Ninja Âm Dương đã là nhân vật chọn chơi được, phong cách chibi đen/trắng, hai đoản đao,
  vai trò sát thủ. Chọn qua **Nhân vật → Ninja Âm Dương**. F/nút **Ảnh Bộ** để lướt,
  tốn 20 thể lực, hồi 6 giây; combo ba đòn có đòn chí mạng.
  Nguồn: `tools/characters/build_ninja_yinyang.py`,
  `Assets/Art/Blender/Characters/NinjaYinYang.blend`,
  `demo/features/characters/ninja-yinyang/`.
- `demo/features/railway/railway-clearance.js` khảo sát hình học công trình và từng
  instance cây/đá trước khi đặt ray. Bộ tìm đường vòng tránh vùng núi cao và vật cản;
  nút giao bị chắn cũng được dời. Giữ mạng 24 nhánh/12 nút giao/10 ga, không trở lại vòng tròn cũ.
- Ray và tàu dùng chung đường chạy/cao độ. Kiểm tra cả bề rộng, đầu/đuôi toa và phần gầm cầu,
  không chỉ tim ray. Độ dốc tối đa khoảng 6%; những chỗ phải nâng có sàn cầu, lan can và trụ.
  Qua nước dành khoảng trống tối thiểu 6 m trên mặt nước. Chọn cách né núi/cầu vượt;
  **không có hầm xuyên núi mới** trong lần sửa này.
- Ga ưu tiên đoạn ray thẳng; vị trí buộc phải dùng đoạn cong được nắn ray với tiếp cận chuyển tiếp.
  Ga không chồng lên nhau, chừa vùng an toàn tránh nhánh ray khác xuyên gầm sân ga,
  có cầu thang đổi chiều, chiếu nghỉ và hành lang nối sân ga.
  Trụ cầu được vẽ bằng InstancedMesh. Không san lại địa hình để nâng/hạ ga nữa,
  tránh làm công trình cũ và cây bị treo. Một số ga nằm trên cao theo cao độ tuyến.

### File cần đọc khi tiếp tục

1. `docs/MOON_RAILWAY.md` và `demo/features/railway/railway-clearance.js`.
2. `demo/features/railway/moon-railway.js`: đường chạy, ga, vật lý cầu thang, hỗ trợ mặt sàn.
3. `demo/features/world/surface-sync.js`: nền sinh vật/cây và camera.
4. `demo/index.html`: thứ tự khởi tạo; đường sắt và surface-sync phải chạy trước LivingWorld/LunarBiome.

### Cách chạy và kiểm tra ngày mai

```powershell
python tools/serve_game.py --port 8883
# Mở http://127.0.0.1:8883/?railway=1
$env:GAME_URL = 'http://127.0.0.1:8883/?railway=1'
$env:GAME_VERIFY_OUTPUT = Join-Path (Get-Location) 'demo/verification/railway-clearance'
node tools/tests/verify_railway_clearance.js
node tools/tests/verify_railway.js
node tools/tests/verify_railway_network.js
node tools/tests/verify_surface_ninja.js
```

Chạy lần lượt. Mỗi runner chọn cổng Chrome kiểm thử riêng và đóng trình duyệt kiểm thử.
Chạy `python tools/refresh_web_assets.py` sau khi sửa tài nguyên web.
`demo/verification/` chứa kết quả cục bộ sinh tự động, không coi là dữ liệu được Git chuyển sang máy khác.

Kết quả cuối lượt 25/10, kiểm thử Chrome cục bộ:

- `verify_railway_clearance.js`: đạt. Khảo sát 10.699 hộp hình học; kiểm tra cao độ toàn tuyến,
  khoảng trống thân tàu với vật thể cũ và từng bộ phận của 10 ga, không chạm gầm móng ga.
  Độ dốc đo lớn nhất xấp xỉ 6%; chân thang khớp nền, đi lên **và xuống** cả 10 ga không nhảy.
- `verify_railway.js`: 156 kiểm tra đạt, gồm sàn ga, đi lại, không bị kéo từ dưới lên sàn,
  gọi tàu tại 10 ga, chỉ dừng theo yêu cầu, dừng 60 giây, lên/xuống và yêu cầu ga đích.
- `verify_railway_network.js`: 21 kiểm tra trong cảnh đạt, thêm nhập W/C thật và giao diện mobile.
  Mạng vẫn có 24 nhánh, 12 nút giao, 10 ga; hành trình hiện khoảng 30,9 km.
- `verify_surface_ninja.js`: 355 kiểm tra đạt trên bản cầu thang cuối, gồm raycast mặt đất
  độc lập, 17.029 instance cây/cỏ được xét, chân động vật, camera, chọn nhân vật và chiến đấu ninja.
- Cú pháp các JS vừa sửa và `git diff --check` ở các file tracked liên quan đạt.
  Đã dựng lại file Blender riêng từ `engineering.json` sau lần kiểm tra chân thang cuối.
  Ảnh kiểm tra: `demo/verification/railway-clearance/station.png`, `bridge.png`.

### Giới hạn và lưu ý bàn giao

- Chưa commit, push hoặc triển khai remote các sửa đổi mới. Nhiều file thay đổi/xóa đã tồn tại
  trước lượt này; đã kiểm tra trạng thái và giữ nguyên, không khôi phục hay xóa thêm chúng.
- Đường đi/cao độ cuối được tính theo map runtime. `MoonRailway.blend` và studio nội thất
  vẫn giữ nguồn cũ; không coi việc mở file đó là bằng chứng tuyến mới đã đồng bộ tự động.
- `tools/export_railway_engineering.py` tạo file Blender riêng từ khảo sát trình duyệt,
  không ghi đè `MoonRailway.blend`. Cần chạy lại kiểm thử clearance để có `engineering.json`
  rồi xuất lại khi thay đổi map. Đây là bản xem thiết kế, không phải trình xuất ngược vào runtime.
  Đã tạo `Assets/Art/Blender/Environments/RailwayCivilEngineering.blend` bằng Blender 5.2.1 LTS.
- Các vùng chưa được yêu cầu như nội dung rương phòng kim cương và thuyền đầm lầy vẫn giữ nguyên.
- Ngày mai ưu tiên chơi thử và ghi lại ga/địa điểm cụ thể nếu còn xuyên vật thể hoặc khó lên cầu,
  thay vì chạy lại builder hay làm lại ninja/nội thất đã có.

### Các lỗi cần tránh khi sửa tiếp

- Không chỉ đo cao độ ở tim ray: phải dự phòng gầm cầu, bề rộng và đầu/đuôi toa trên đường cong.
- Không nâng ray theo mọi vật trên trời: phân biệt khoảng cao của vật thể và dải cao thân tàu,
  đồng thời ưu tiên né chúng theo phương ngang để tránh kéo cả mạng ray lên quá cao.
- Không chọn ga ở nơi có nhánh khác lướt sát bên hông. Bộ kiểm tra hiện xét thân tàu
  với từng bộ phận mô hình ga và cả sàn móng; kiểm tra địa hình cũ thôi chưa đủ.
- Không đặt hành lang đỉnh thang phủ lên nhịp thang: cách đó lên được nhưng không đi xuống được.
  Hành lang hiện chạy ở ngoài giếng thang. Chân thang lấy độ cao ngay tại cửa vào,
  ưu tiên nền phẳng và tránh mép dốc/ranh giới map.
- Kết quả headless không phải cam kết FPS trên máy người chơi; vẫn cần chơi thử giao diện bình thường.

## Cập nhật đường sắt — 25/10/2026

- Đã thay vòng ray ngoài rìa bằng mạng 24 nhánh, 12 nút giao, 10 ga. Nguồn Blender:
  `tools/build_moon_railway.py`; runtime: `demo/features/railway/moon-railway.js`.
- Nhấn **Chờ tàu** tại ga để yêu cầu dừng 60 giây; ga không được gọi thì tàu chạy qua.
- Khi lên toa, WASD đi lại, đi qua cầu nối giữa ba toa. Chọn ghế rồi ngồi bằng nút hoặc C;
  C/Đứng dậy/di chuyển để trở lại lối đi. Trong toa vẫn chọn ga xuống và yêu cầu dừng được.
- Đã kiểm tra trên Chrome bằng `verify_railway_network.js`; `verify_railway.js` cũng kiểm tra
  đi bộ, nền và các lượt dừng ở cả 10 ga. Báo cáo trong `demo/verification/railway/`.
- Blender thực tế ở `E:\blender.exe`, không phải đường dẫn ổ D trong tài liệu cũ.
  Kết nối qua bridge local 9876. File `MoonRailway.blend` có scene `RailwayInteriorStudio`
  để chỉnh nội thất dễ hơn; camera ngoại thất, trong toa và ghế cửa sổ đã có sẵn.
- `prepare_railway_studio.py` tạo studio; `export_railway_studio.py` xuất mô hình về web.
  Đã kiểm tra xuất lại tọa độ đỉnh không thay đổi. Không chạy lại builder nếu cần giữ
  các chỉnh sửa thủ công chưa xuất từ studio; hãy xuất và lưu trước.
- Server nên dùng `python tools/serve_game.py --port 8883`, mở `/?railway=1`.
  Sau thay đổi tài nguyên chạy `python tools/refresh_web_assets.py`.

## 1. Đọc trước khi tiếp tục

- Dự án là **GameTsukiezz / Tsuventure / Echoes of the Moonlit Realm**. Các tên này xuất hiện trong mã nguồn và tài liệu.
- Bản đang chơi và chỉnh sửa trong cuộc trò chuyện là **web demo Three.js**, điểm vào `demo/index.html`. Kho mã cũng giữ dự án Unity; sửa C# không tự thay đổi bản web.
- Người dùng muốn thực hiện thay đổi hoàn chỉnh, chạy game để tự kiểm tra và ưu tiên dùng Blender cho mô hình 3D. Kiểm tra va chạm, khả năng đi lại và ảnh trong game, không chỉ kiểm tra cú pháp.
- Giữ nguyên công việc đang có trong thư mục. Không ghi đè hàng loạt hoặc xóa dữ liệu chỉ vì thấy tên lạ hay tưởng là bản trùng.
- Tài liệu này là bản chụp trạng thái, không bảo đảm mọi yêu cầu cũ đều đã hoàn thiện. Khi tiếp tục, đối chiếu mã và thử thực tế. Các kết quả kiểm thử bên dưới là kết quả trong phiên làm việc trước, không phải kiểm thử tự động trên máy mới.

## 2. Mang dự án sang máy khác và chạy

**Quan trọng:** file Markdown chỉ mang theo ngữ cảnh, không chứa mã game hay mô hình. Hãy chuyển **cả thư mục GameTsukiezz hiện tại** hoặc commit và đẩy đầy đủ thay đổi lên Git trước khi tải trên máy khác. Không mặc định bản trên Git đã có mọi sửa đổi mới nhất.

Kho mã: <https://github.com/Tsukiezz/GameTsukiezz>.

Trên máy mới, mở terminal tại gốc thư mục GameTsukiezz:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory demo
```

Mở <http://127.0.0.1:8765/>. Giữ terminal chạy; Ctrl+C để dừng. Bản demo không cần backend hay bước build npm. Python, trình duyệt có WebGL và đầy đủ tài nguyên là cần thiết; kiểm thử dùng thêm Node.js và Chrome. Khi dùng Git, cài Git LFS và chạy `git lfs pull` để lấy tài nguyên lớn thay vì chỉ có file con trỏ LFS.

Các địa chỉ kiểm tra nhanh:

| Khu vực | Địa chỉ |
| --- | --- |
| Lâu đài | <http://127.0.0.1:8765/?castle=6> |
| Đấu trường | <http://127.0.0.1:8765/?arena=1> |
| Núi Bạch Khuyết | <http://127.0.0.1:8765/?mountain=1> |
| Hang Tà Thần | <http://127.0.0.1:8765/?cavern=1> |
| Thung lũng dung nham | <http://127.0.0.1:8765/?volcano=1> |

Nếu thấy bản cũ, nhấn Ctrl+F5. Sau khi sửa tài nguyên web, chạy `python tools/refresh_web_assets.py` để cập nhật khóa cache.

Điều khiển chính: WASD di chuyển, Shift chạy, Space nhảy, C ngồi/đứng, giữ và kéo chuột phải để nhìn, chuột trái/J đánh, E tương tác, I balo, B thư viện. Trong game có menu Địa điểm và hướng dẫn cảm ứng.

### Dữ liệu người chơi

Vật phẩm và một số tiến độ được lưu bằng `localStorage` trong trình duyệt. Sao chép mã nguồn hoặc clone Git **không chuyển tiến độ**. Đổi trình duyệt hoặc đổi địa chỉ từ `127.0.0.1` sang `localhost` cũng tạo vùng lưu khác. Muốn giữ tiến độ phải xuất/nhập dữ liệu trình duyệt riêng; chưa xây dựng chức năng đồng bộ tài khoản trong phạm vi cuộc trò chuyện này.

## 3. Những yêu cầu đã trao đổi và trạng thái

### Lâu đài

- Người dùng đã xác nhận lâu đài **tạm xong** trước khi chuyển sang đấu trường.
- Yêu cầu: kiến trúc nhiều tầng và hầm; tường có va chạm; cửa dễ nhận ra; cầu thang gọn, đi được và giấu ở một phòng khác nhau mỗi tầng; bố trí như mê cung.
- Phòng có một cửa vào hành lang; đồ đạc không chắn cửa. Có thư viện cổ, bảo tàng giáp, phòng ngủ vua và kho vàng. Tầng hầm sâu có nhà tù và nút mở/khóa song sắt.
- Đã xử lý đường vào, điểm rơi và camera/hiển thị trong các lượt trước. Nếu sửa tiếp phải thử cả đi, chạy và nhảy qua mối nối.
- Tham khảo: [mê cung](docs/CASTLE_MAZE.md), [cầu thang và nhà tù](docs/COMPACT_STAIRS_PRISON.md), [an toàn](docs/CASTLE_SAFETY.md), [bố trí phòng](docs/CASTLE_ROOMS.md).

### Đấu trường La Mã bỏ hoang

- Sân chiến đấu phía dưới, khán đài phía trên, có khu VIP, vòm đá và chi tiết đổ nát.
- Người dùng từng rơi ra ngoài map; sàn, bậc và biên khu vực cần giữ va chạm liên tục.
- Có lớp mặt trăng an toàn dưới thế giới để giảm rơi vô hạn; không dùng lớp này thay cho sửa lỗ hở địa hình.
- Tham khảo: [ROMAN_ARENA.md](docs/ROMAN_ARENA.md).

### Nhân vật, quái vật và thư viện

- Đã yêu cầu và bổ sung các hình tượng Kì Lân Thần Kì, Rồng Quỷ Vương, Ninja Âm Dương; không nhầm toàn bộ mô hình/NPC với bốn nhân vật mà bộ kiểm thử animation đang kiểm tra.
- Bốn nhân vật trong bộ kiểm thử chuyển động hiện tại: hamster, rabbit, dragon_knight, kingkong.
- Loch Ness có cầu năng lượng sát thương lớn; cá sấu không gian ngoạm giữ rồi nhả; Thần Rừng triệu hồi sinh linh cây. Đây là kỹ năng riêng, vẫn giữ đòn thường.
- Núi Bạch Khuyết có hổ răng kiếm không gian di chuyển trong núi, cắn gây chảy máu; không chỉ đặt cố định để trưng bày.
- Quái vật và sinh vật được đưa vào thư viện, có ảnh mô hình và ghi nhận khám phá/đánh bại theo cơ chế từng loại.
- Tham khảo: [kỹ năng và núi](docs/BACH_KHUYET_AND_MONSTER_SKILLS.md), [hồ](docs/LAKE_MONSTERS.md), [thư viện](docs/SURVIVAL_LIBRARY.md).

### Núi, sông và hệ sinh thái

- Núi Bạch Khuyết có đỉnh lớn, đỉnh phụ, đường mòn, đá, cỏ và khoáng sản. Đi theo đường mòn thay vì đi thẳng lên vách đứng.
- Sông phân nhánh, nhiều cầu nhỏ, bắt nguồn từ thác/suối nước nóng và chảy về hồ thủy ngân. Mặt nước phẳng, lòng sông đào xuống dưới đất, không dựng thành dải nổi.
- Khu suối nước nóng là núi xanh có cây và anh đào, đường leo hợp lý, cá và thực vật thủy sinh; sói có thể đi trong vùng rộng hơn quanh núi. Sói có kỹ năng cắn gây choáng; có khỉ đít đỏ.
- Đã bổ sung thảm thực vật và sinh vật quanh map: bò tót, dê, nai, hươu, chó, mèo, bươm bướm. Số lượng sinh ngẫu nhiên có thể khác giữa các lượt chạy.
- Tham khảo: [sông và suối](docs/THERMAL_RIVER_REALM.md), [sinh vật](docs/BACKPACK_WILDLIFE.md), [bản đồ](docs/EXPANDED_REALM.md).

### Hang Tà Thần

- Thay nội dung hang Nguyệt Tinh cũ bằng hang ngầm mê cung đá mặt trăng, có hai cận vệ cửa hang.
- Mê cung 210 × 210 m, 441 ô; sàn ở -44 m. Tường/trần có va chạm, mặt đất bên trên vẫn đi được.
- Hang mặc định tối; chỉ dùng vật phẩm chiếu sáng khi khám phá. Giun đá khổng lồ tuần tra dưới đá, trồi lên gây địa chấn; chiến binh bị nguyền rủa có ấn gây sát thương và làm chậm.
- Giữa hang là phòng kim cương và rương niêm phong. **Nội dung phần thưởng của rương này còn chờ người dùng bổ sung**, không tự thêm tiền/vật phẩm.
- Tham khảo: [EVIL_GOD_CAVERN.md](docs/EVIL_GOD_CAVERN.md).

### Trang bị và vật phẩm

- Cánh pha lê ở rương dưới lâu đài, trang bị trong balo để bay; ngừng bay khi vào hang theo quy tắc hiện tại.
- Đèn pin mặt trời ở đền trung tâm; đã thiết kế lại trong Blender, cầm tay trái và chiếu theo hướng thực của đèn.
- Thuốc tiên giảm sương và làm sáng xung quanh trong **180 giây thực**; không cộng dồn thời hạn. Thời gian vẫn trôi khi mở menu hoặc thoát game.
- Băng gạc hồi **20 HP**, không quá máu tối đa, không hồi giáp, không tiêu hao khi đầy máu.
- Tiếp tế đền: 8 bệ, 24 cụm; mỗi cụm có 3 chai thuốc hoặc 5 băng gạc. E nhặt, I mở balo dùng; xuất hiện lại sau 60 giây.
- Gươm dung nham ở bệ giữa thung lũng, gây 600 sát thương lên Rồng Chiến Tranh theo cơ chế hiện tại; có giới hạn tầm đánh và tiêu hao thể lực.
- Tham khảo: [cánh](docs/CRYSTAL_WINGS.md), [đèn](docs/SOLAR_FLASHLIGHT.md), [tiếp tế và animation](docs/ANIMATION_AND_TEMPLE_SUPPLIES.md).

### Thung lũng dung nham — thay đổi gần nhất

- Địa hình nâng cao thành chướng ngại vật thật; đường leo phía đông có dấu chỉ dẫn. Vách dốc chặn leo trực tiếp.
- Rồng Chiến Tranh **20.000 HP**, có đòn thường, phun dung nham và ném cầu lửa. Có cất cánh, tuần tra trên không và hạ cánh; chỉ bay trong giới hạn lòng núi.
- Rơi vào dung nham gây chết ngay bất kể giáp rồi hồi sinh an toàn. Phun trào có xác suất, cảnh báo và sát thương đốt.
- Lượt chỉnh mới nhất: 5 đỉnh phụ, sườn rộng hơn, khe xói và màu đá phân tầng. Đỉnh mesh đo được khoảng **316,6 m**, sàn lòng núi 72 m, mặt dung nham 66 m.
- Con số đỉnh khoảng 246 m trong tài liệu dọn dẹp cũ là trạng thái **trước** lượt chỉnh này.
- Mã địa hình hiện tại: `demo/features/volcano/volcanic-valley.js`. Địa hình này được dựng trong mã web; không mặc định sửa mới nhất đã được đồng bộ vào file Blender. Rồng và kiếm dùng dữ liệu mô hình Blender.
- Tham khảo: [LIVING_WORLD_VOLCANO.md](docs/LIVING_WORLD_VOLCANO.md).

### Chuyển động và hiển thị

- Đã làm mềm tăng/giảm tốc, đổi hướng, góc nhìn và quay theo cung ngắn nhất. Di chuyển dùng khoảng dịch chuyển thật để điều khiển dáng đi, tránh bước tại chỗ khi bị tường chặn.
- Kiếm dung nham theo tay phải, đèn theo tay trái; ẩn vũ khí gốc khi cầm kiếm mới rồi phục hồi khi tháo. Cánh có chuyển tiếp gập/mở.
- Camera được chặn trên địa hình và xử lý riêng trong hang. Vá mối nối và cắt bỏ phần nền mặt trăng cũ bị chồng lên địa hình núi lửa.
- Người dùng từng thấy nhiều lỗi map, đã yêu cầu rà soát toàn map. Đã có kiểm tra ảnh nhiều khu vực; không khẳng định toàn bộ game không còn lỗi.

## 4. Bản đồ mã nguồn để sửa tiếp

| Đường dẫn | Vai trò |
| --- | --- |
| `demo/index.html` | Trang game, khởi tạo thế giới, vòng lặp, điều khiển và tích hợp tính năng |
| `demo/features/` | Mã web theo khu vực/tính năng |
| `demo/features/characters/hero-motion.js` | Vận tốc, quay, camera mượt và điểm cầm vật phẩm |
| `demo/features/characters/hero-animation.js` | Dáng đi, chạy, nhảy, ngồi, đánh và chuyển tiếp |
| `demo/features/inventory/temple-supplies.js` | Thuốc tiên, băng gạc, balo, ánh sáng và lưu thời hạn |
| `demo/features/volcano/volcanic-valley.js` | Mesh địa hình dùng chung cho hiển thị/độ cao, lava, boss, kiếm và phun trào |
| `demo/features/volcano/dragon-flight.js` | Cất/hạ cánh, giới hạn bay và va chạm rồng |
| `demo/features/world/map-visual-repair.js` | Cắt nền chồng, vá mép và sửa camera theo địa hình |
| `Assets/Art/Blender/` | Nguồn mô hình chỉnh sửa được: Characters, Environments, Equipment, Props |
| `tools/build_*.py` | Bộ dựng Blender và xuất dữ liệu cho từng tính năng |
| `tools/tests/` | Kiểm tra bằng trình duyệt thật |
| `docs/` | Tài liệu thiết kế và cách kiểm tra chi tiết |

Lưu ý khi sửa địa hình: dùng cùng tam giác/nội suy độ cao cho hình ảnh và vật lý. Giữ đường leo, cầu, vị trí kiếm và điểm hạ cánh an toàn; tránh đè lên nhánh sông hoặc vượt biên map. Không dùng một mặt phẳng va chạm không khớp bề mặt nhìn thấy.

## 5. Blender trên thiết bị khác

Máy cũ dùng Blender 5.2.1 LTS tại `D:\blender.exe`, MCP for Blender và kết nối cục bộ `127.0.0.1:9876`. Đây là cấu hình **của máy cũ**, không phải đường dẫn dùng được trên mọi máy.

- Cài Blender và add-on/MCP tương thích trên thiết bị mới; cấu hình kết nối của ứng dụng trợ lý phải được thiết lập riêng. Không sao chép mù quáng đường dẫn hay toàn bộ cấu hình cá nhân.
- `tools/start-blender-mcp.ps1` hiện ghi cố định `D:\blender.exe`; cần đổi theo vị trí cài mới trước khi dùng.
- Xem [BLENDER-MCP.md](docs/BLENDER-MCP.md), nhưng các đường dẫn `.runtime`, môi trường Python và trạng thái kết nối trong đó là thông tin cục bộ, cần kiểm tra lại.
- Đọc cảnh trước khi sửa; chỉ thay collection do tính năng quản lý. Không xóa cảnh người dùng đang làm.
- Khi sửa mô hình, phải xuất dữ liệu web tương ứng; chỉ lưu `.blend` không tự cập nhật mô hình trong trình duyệt.
- Với exporter tự viết, cập nhật view layer trước khi đọc `matrix_world`, ánh xạ vật liệu theo đúng đối tượng/material và kiểm tra chuyển trục Blender Z-up sang game Y-up. Tránh mất vật liệu do Blender tự thêm hậu tố `.001`.

## 6. Kiểm thử và kết quả đã có

Khởi động server trước. Các runner hiện dùng Chrome ở đường dẫn Windows; trên máy khác cần kiểm tra đường dẫn trong runner. Chạy từng bộ lần lượt để tránh tranh cổng CDP và quá tải GPU.

```powershell
# Lưu ảnh và báo cáo ngoài mã nguồn.
$env:GAME_VERIFY_OUTPUT = Join-Path $env:TEMP 'tsuventure-verification'
node tools/tests/verify_living_volcano.js
node tools/tests/verify_pending_features.js
node tools/tests/verify_hero_animation.js
```

Kết quả trong cuộc trò chuyện:

- Bộ núi lửa/thế giới: **42 kiểm tra đạt**, chụp ảnh 10 khu vực, kiểm tra giao diện mobile và tải lại. Đã chạy lại sau lần chỉnh địa hình cuối; đi hết đường leo sai lệch độ cao tối đa đo được 0, qua cầu và lấy kiếm được.
- Bộ tính năng còn dở: **53 kiểm tra đạt**, gồm rồng bay có giới hạn, đồ cầm tay, tiếp tế, hồi máu, thời hạn sáng, cảm ứng và lưu sau tải lại. Đã chạy trên địa hình mới.
- Bộ animation trước đó: **131 kiểm tra đạt**, bốn nhân vật với bước thời gian 15/30/60/144 FPS. Đây là kiểm tra hành vi theo bước thời gian, không phải cam kết FPS thực tế trên mọi thiết bị.
- Cú pháp JS và `git diff --check` đã đạt ở lượt chỉnh núi lửa. Ảnh/báo cáo được đặt trong thư mục tạm của máy cũ, không tự đi theo Git.

Nếu chỉnh vùng khác, xem runner tương ứng trong `tools/tests/` và [tools/README.md](tools/README.md). Không chạy lại mọi bộ cho một thay đổi tài liệu đơn thuần.

## 7. Dọn thư mục và Git

- Đã đưa 214 file và 5 gốc thư mục cache/sinh tự động ra khỏi dự án, khoảng 97,05 MiB. Bản khôi phục nằm trong `%TEMP%/GameTsukiezz-cleanup-20261024-152606/` trên **máy cũ**, kèm `restore-manifest.json`; không nằm trong kho Git, có thể bị hệ điều hành dọn. Xem [PROJECT_CLEANUP.md](docs/PROJECT_CLEANUP.md).
- Thao tác xóa hàng loạt trước đó bị hệ thống duyệt tự động từ chối; đã dùng phương án di chuyển có thể khôi phục. Không coi bản sao tạm là bản đã được phép xóa vĩnh viễn.
- Giữ Unity `Assets`, `Packages`, `ProjectSettings`, nguồn `.blend`, tài nguyên đang dùng và bộ kiểm thử hiện hành. File nguồn và bản xuất web có thể cùng cần thiết dù tên giống nhau.
- `.thumbnails/large` là cache ảnh xem trước; `.thumbnails/fail/blender` ghi nhận tạo preview thất bại. Không cần để chạy game; có thể tái tạo. Trong lượt kiểm tra gần nhất không còn thư mục này trong dự án, đã thêm `**/.thumbnails/` vào `.gitignore`. Tên cha bị lỗi mã hóa trong ảnh không đủ để kết luận có thể xóa toàn bộ thư mục cha nếu chưa kiểm tra nội dung.
- Trước đó có commit `8185cfef08d7edc056a93080a6925716de4dd594` được đẩy lên nhánh `update/tsuventure-living-mountain-2026-10-24`. Đây là mốc lịch sử, **không đại diện cho toàn bộ trạng thái mới nhất**. Lần đẩy trực tiếp main trước đó bị duyệt tự động từ chối; các sửa sau đó và file bàn giao này chưa được xác nhận đã đẩy lên remote.
- Khi chuyển máy bằng Git, kiểm tra `git status`, nhánh, diff và file chưa được theo dõi trước khi commit/push. Không tự reset/clean để làm sạch thư mục.

## 8. Điểm còn mở cho phiên tiếp theo

1. Người dùng tự chơi và phản hồi hình dáng núi lửa mới; tiếp tục chỉnh theo phản hồi thực tế.
2. Nội dung kho báu phòng kim cương trong Hang Tà Thần còn chờ yêu cầu.
3. Nếu cần chỉnh địa hình núi lửa mới trực tiếp trong Blender, đồng bộ hình dạng runtime sang nguồn Blender có chủ đích; hiện không xem hai bản là tự đồng bộ.
4. Khi cần dùng trên thiết bị khác, chuyển cả mã/tài nguyên mới nhất và cài lại công cụ cục bộ; tiến độ trình duyệt cần chuyển riêng.
5. Không có yêu cầu tính năng gameplay mới trong lượt tạo tài liệu này. Hãy hỏi/nhận yêu cầu tiếp theo thay vì tự thêm nội dung kho báu hoặc công bố đã đồng bộ Git.

## 9. Câu nhắc để bắt đầu ở thiết bị mới

> Hãy đọc CONVERSATION_HANDOFF.md trong dự án GameTsukiezz và các tài liệu liên quan trước khi sửa. Đây là bản web demo ở demo/index.html, chạy bằng Python HTTP server cổng 8765. Kiểm tra trạng thái file/Git và kết nối Blender trên máy hiện tại; giữ mọi thay đổi đang có. Tiếp tục theo yêu cầu mới của tôi, kiểm tra khả năng đi lại, va chạm và ảnh trong game khi sửa đồ họa.

## 10. Bổ sung Rừng Ngập Mặn — 24/10/2026

- Người dùng yêu cầu dựng bằng Blender khu ngập mặn khổng lồ nối sông,
  nước mặn đục, cây đước rễ lớn, Cá Sấu Đầm Lầy 10.000 HP và kho báu
  Mảnh Vỡ Cổ Đại lưu trong balo để dùng sau.
- Khu mới ở nhánh sông phía bắc, tâm (70, -825), hồ 460 × 250 m,
  có cổng đá, cầu gỗ, phế tích và cổ vật. Vào bằng `?mangrove=1`
  hoặc Địa điểm → Rừng Ngập Mặn.
- Nguồn Blender mới: `Environments/MangroveRealm.blend`,
  `Characters/SwampCrocodile.blend`, builder `tools/build_mangrove_realm.py`.
  Dữ liệu web và runtime ở `demo/features/mangrove/`.
- Cá sấu tuần tra/truy đuổi người bơi, báo trước khi lao cắn. Cầu gỗ an toàn.
  E nhặt mảnh vỡ, I xem trong balo. Không thêm cách tiêu hao vật phẩm.
  Không thay nội dung rương chưa xác định trong Hang Tà Thần.
- Tích hợp địa hình, camera, bơi/lặn/oxy, chiến đấu, thư viện, minimap,
  menu di chuyển và lưu trạng thái riêng. Xem `docs/MANGROVE_REALM.md`.
- Máy hiện tại có Blender tại `E:\blender.exe`; đường dẫn D: phía trên là máy cũ.
- Cập nhật tiếp: hồ sâu khoảng 35–45 m, bỏ cầu xuyên hồ; phải bơi tới
  lối lên ngắn ở phế tích. Thuyền chưa được triển khai, dành cho tương lai.
  Thêm cá, rùa, cua và lá sen/hoa nổi từ các mẫu lưới Blender;
  `mangrove-life.js` điều khiển quần thể chuyển động. Cá sấu ngụp lặn theo chu kỳ
  xuống gần 28 m và theo độ sâu của người chơi khi truy đuổi.
- Có thể chạy server bằng `python tools/serve_game.py` để nhận nhiều kết nối
  tải tài nguyên song song. Tiến độ người chơi cũ được giữ nguyên.
- Giữ nguyên các thay đổi có sẵn. Chưa commit, push hay triển khai remote.
