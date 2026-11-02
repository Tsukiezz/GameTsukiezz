# Công cụ dự án

**Lòng sông/phù sa (28/10):** `tests/verify_lunar_rivers.js` kiểm thêm mọi tam giác ướt có đáy cát, bờ cao hơn nước,
thuộc tính độ sâu/hướng dòng, cụm lau sậy/đá. Ảnh kiểm tra vùng người dùng báo lỗi ở
`demo/verification/lunar-rivers/river-banks-alluvium.png` và `riverbed-sand.png`.

**Nền mặt trăng và sông mở rộng (28/10):** `tests/verify_lunar_rivers.js` kiểm mép nước bám tam giác nền,
truy vấn nước dùng cho thuyền/bơi, chất liệu/UV/tuyết, cây được đặt trên đất, cầu có vòm và lan can,
hai nhà ga đối diện giữ tên cũ, tự chọn chiều tàu theo sân và chuyển vật phẩm duy nhất 9999 → 1 qua tải lại.
Ảnh/báo cáo ở `demo/verification/lunar-rivers/`. Đọc mục mới nhất trong `CONVERSATION_HANDOFF.md` trước các báo cáo cũ.

**Hai chiều tàu và sinh tồn (28/10):** `tests/verify_realm_transit.js` rà soát hai mặt ray, độ cao qua nước,
chướng ngại vật, sáu đoàn tàu, sân ga hai chiều, cầu đi bộ, Nữ Chúa Tuyết, chế tạo/trang bị, đồ lặn,
đói mất máu, sát thương rơi sau bay, đòn tấn công người chơi trên không, bản đồ M và lưu dữ liệu.
Chạy với máy chủ cổng 8883. Báo cáo/ảnh: `demo/verification/realm-transit/`. Bộ kiểm tra bản đồ hiện tại đã đổi số tàu thành 6.

**Bản sinh thái/đồ họa hiện tại (27/10):** `tests/verify_world_ecology.js` kiểm tra ba profile,
cá/rong, nền bắc/nam, động vật tuyết, pha lê E/cooldown/persistence, 108 bãi và 44 ga.
`tests/measure_game_performance.js` đo 5 giây trên GPU thật; `PERF_X`, `PERF_Z` chọn vị trí,
`PERF_NAME` chọn tên báo cáo. Mặc định là vùng xưởng Tuyết. Kết quả ở `demo/verification/world-ecology/`.
`update_polar_world_blender.py` và `update_camp_economy_blender.py` nhận thư mục export qua `GAME_VERIFY_OUTPUT`;
chỉ chạy sau khi sao lưu file hiện tại. `verify_world_ecology_blender.py` kiểm tra và chụp tổng thể, không lưu file.
Các con số 15 ga/36 bãi ở hướng dẫn cũ bên dưới là lịch sử.

**Thư viện sinh vật (28/10):** `tests/verify_complete_library.js` rà soát 123 mục, ảnh xem trước của 61 sinh vật,
tìm kiếm tiếng Việt/Anh, trạng thái gặp/đánh bại, lưu qua tải lại, phím tắt B và bố cục di động.
Ảnh/báo cáo: `demo/verification/complete-library/`. Nếu bộ chạy không mở được Chrome headless, kiểm tra HTTP game và chạy lại khi Chrome được phép khởi động.

**Map mở rộng/Nam Cực (27/10):** `tests/verify_polar_expansion.js` kiểm tra mép nền, sông, thuyền, nhà máy,
boss đóng băng, rơi/hồi sinh, Noel bay và hòm khói đỏ có lưu dữ liệu. Báo cáo: `demo/verification/polar-expansion/`.
Đặt `POLAR_AUDIT=1` để kiểm tra ray dày và xuất thiết kế; `POLAR_DEATH_AUDIT=1` để kiểm tra hai đường sát thương cũ.
`update_polar_world_blender.py` cập nhật chính file Blender hiện tại từ `blender-design.json` sau khi sao lưu.
Đọc mục mới nhất trong `CONVERSATION_HANDOFF.md` trước các lệnh/báo cáo lịch sử bên dưới.

**Nhạc và kinh tế game (27/10):** `tests/verify_moon_economy.js` kiểm tra nhạc MP3 thật, 36 bãi/450 quái,
quà dọn bãi, vé tàu, thịt đùi, giảm sát thương, mã CODE và persistence; báo cáo tại `demo/verification/moon-economy/`.
`tests/export_camp_economy.browser.js` xuất mẫu/đặt quái; `update_camp_economy_blender.py` đồng bộ vào collection
`RealmDesign_Camps` trong file Blender hiện tại, giữ các collection khác. Sao lưu trước khi chạy.

**Nội thất và bãi quái (27/10):** `tests/verify_realm_update.js` kiểm tra trang trí 13 tầng, lâu đài, chiến đấu,
chiến lợi phẩm, độ no, hồi bãi và lưu dữ liệu; xuất bản thiết kế ở `demo/verification/realm-interiors/`.
`update_current_realm_blender.py` cập nhật các phần đã sửa vào chính file Blender hiện tại sau khi sao lưu.
Đọc mục mới nhất trong `CONVERSATION_HANDOFF.md` để chạy bộ kiểm tra đi bộ và rà soát vỏ lâu đài.

**Hiện tại (27/10/2026):** chỉ duy trì game trình duyệt trong `demo/`. Bộ khung Unity và các exporter cảnh ghép cũ đã được dọn.
Chạy `python tools/serve_game.py --port 8883`. Kiểm tra bản mới bằng `node tools/tests/verify_autumn_upgrade.js`
và `node tools/tests/verify_three_rail_services.js`. Dữ liệu kiểm tra mới nhất nằm tại `demo/verification/autumn-upgrade/`.
Bản Blender kiểm tra hiện tại là `Assets/Art/Blender/Environments/YinYangPyramid13Floors.blend`;
`build_autumn_upgrade_review.py` và `export_railway_engineering.py` tạo bản này từ dữ liệu game, không ghi đè file có sẵn.

- `build_castle_extension.py`: tạo nguồn lâu đài trong Blender và xuất cùng hình học sang `demo/features/castle/data/castle-extension.js`.
- `build_creature_studio.py`: dựng 34 sinh vật Blender và xuất mesh dùng chung cho game/thư viện.
- `tests/export_current_arena.browser.js` và `build_current_arena_blender.py`: xuất chính đấu trường hiện tại cùng texture vào Blender; xem `docs/ROMAN_ARENA.md`.
- `tests/creature_arena.browser.js`, `tests/arena_station_walk.browser.js`, `verify_creature_arena_blender.py`: kiểm tra model, đấu trường, bay cao, đường đi từ ga và nguồn Blender.
- `castle_rooms.py`, `castle_furnishings.py`, `castle_safety.py`, `castle_redesign.py`, `castle_compact.py`, `castle_themes.py`: các phần của bộ tạo lâu đài; chạy qua builder, không chạy riêng.
- `tests/`: kiểm thử trình duyệt đang được duy trì; chạy lần lượt vì dùng chung cổng Chrome.
- `start-blender-mcp.ps1`, `enable_blender_mcp.py`, `verify_blender_mcp.py`, `ai_blender_*.py`: kết nối Blender.
- Các script tạo nhân vật và từng vùng bản đồ vẫn được giữ để chỉnh sửa tài sản đang dùng.

## Chạy game và kiểm tra

Từ gốc dự án:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory demo
# Trong cửa sổ khác:
node tools/tests/verify_compact.js
node tools/tests/verify_maze.js
node tools/tests/verify_display.js
node tools/tests/verify_arena.js
node tools/tests/verify_heroes.js
node tools/tests/verify_hud.js
node tools/tests/verify_redesign.js
node tools/tests/verify_rooms.js
node tools/tests/verify_interiors.js
node tools/tests/verify_safety.js
node tools/tests/verify_graphics.js
```

Ảnh và báo cáo kiểm thử được sinh tại `demo/verification/`, không phải tài sản phát hành.
Hướng dẫn kết nối nằm tại `docs/BLENDER-MCP.md`; ghi chú kiểm thử nằm tại `docs/verification/`.

Đã xóa 13 script vá HTML/kiểm thử cũ không có nơi gọi và đã được thay bằng nguồn hiện tại.
Giữ nguồn `.blend` và dữ liệu mesh JS của game hiện tại; các bản FBX Unity cũ và cảnh đã bị thay thế được rà soát theo `docs/PROJECT_CLEANUP.md`.

## Character and media tools

- `desktop/build_exe.py`: tạo `Tsuventure.exe` chứa bản chơi, icon và máy chủ loopback; không cần Python trên máy chơi.
- `desktop/Launcher.cs`: launcher Windows, cửa sổ Chrome/Edge, byte range video và bàn giao phiên game.
- `desktop/verify_exe.py`: kiểm tra bản EXE chép riêng, dữ liệu nhúng và chế độ dự án.

- `characters/build_dragon_knight.py`: current Blender dragon authoring source.
- `media/record_lobby.js`: lobby WebM generator.
- `tests/verify_dragon_knight.js`: three-hero gameplay checks and portrait export.
- `tests/verify_lobby.js`: lobby video, bilingual settings and persistence checks.

See `docs/DRAGON_KNIGHT.md` for asset locations and cleanup details.

- `castle_room_details.py`: per-room wall art, sconces and collision-safe functional furnishings (called by castle builder).
- `tests/verify_castle_decor.js`: wall art bounds, room content, and live direction reversal.

- `castle_furniture_scale.py`: hero-scale furniture and dense per-room placement, run by the castle builder.
- `forest/build_ancient_grove.py`: Blender scene and shared geometry for the hidden elder and four forest biomes.
- `build_expanded_realm.py`: fourfold terrain dimensions and the monumental Mercury Lake in Blender.
- `build_lake_monsters.py`: articulated Loch Ness (10000 HP) and space crocodile (7000 HP) Blender assets.
- `tests/verify_lake_monsters.js`: pursuit, bridge safety, telegraphed damage, hero attacks and recovery.
- `tests/verify_expanded_realm.js`: expanded bounds, road removal, lake paths, liquid and colliders.
- `tests/verify_ancient_grove.js`: compatibility entry point for the expanded forest and guardian suite.
- `castle_gate_guards.py`: two Blender-authored gate NPCs, animated by features/castle/castle-upgrade.js.
- `tests/verify_castle_update.js`: under-bridge traversal, foundation, gate guards, vitals and saved settings.
- `tests/verify_furniture_scale.js`: character-relative dimensions, room population and collision metadata.
- `tests/verify_survival_library.js`: stamina, all-hero diving, oxygen, water-only bosses, mutant grass and persistent encounters.

- `forest/build_forest_guardian.py`: Blender bark giant with six pivots and 7000 HP.
- `tests/verify_primordial_forest.js`: titanium perimeter, one entrance, natural traversal, disguise/combat and real library model renders.

- `refresh_web_assets.py`: refresh cache keys after changing web assets.
- `tests/verify_wildlife_backpack.js`: streamed animals, roaming, pickup, persisted inventory and exact chocolate buff expiry.

- `characters/build_kingkong.py`: Blender boxing guardian and shared rig data.
- `tests/verify_kingkong.js`: boxing, guardian mitigation, selection and responsive bilingual UI.

Current volcanic terrain and cleanup: `docs/LIVING_WORLD_VOLCANO.md` and `docs/PROJECT_CLEANUP.md`.
The raised terrain profile is in `demo/features/volcano/volcanic-valley.js`; its War Dragon and sword source is `build_volcanic_valley.py`.

- `tests/verify_pending_features.js`: hand sockets, smooth motion, actual touch look, bounded dragon flight, temple supplies, healing, timed vision and persistence. Outputs go to the OS temp folder by default.

- `build_mangrove_realm.py`: Blender giant mangroves, drowned sanctuary, swamp crocodile, ancient fragment and shared basin triangles.
- `tests/verify_mangrove.js`: river connection, real traversal, terrain raycasts, swimming, telegraphed combat, relic pickup, mobile and persistence. Outputs go to the OS temp folder.
