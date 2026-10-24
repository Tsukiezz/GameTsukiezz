# Công cụ dự án

- `build_castle_extension.py`: tạo nguồn lâu đài trong Blender và xuất cùng hình học sang `demo/features/castle/data/castle-extension.js`.
- `sync_arena_blender.py`: đưa các phần đấu trường và lớp đất chặn rơi từ bản game vào Blender; hướng dẫn tại `docs/ROMAN_ARENA.md`.
- `castle_rooms.py`, `castle_furnishings.py`, `castle_safety.py`, `castle_redesign.py`, `castle_compact.py`, `castle_themes.py`: các phần của bộ tạo lâu đài; chạy qua builder, không chạy riêng.
- `tests/`: kiểm thử trình duyệt đang được duy trì; chạy lần lượt vì dùng chung cổng Chrome.
- `start-blender-mcp.ps1`, `enable_blender_mcp.py`, `verify_blender_mcp.py`, `ai_blender_*.py`: kết nối Blender.
- Các script tạo nhân vật, bản đồ và xuất Unity vẫn được giữ để tái tạo tài sản gốc.

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
Không xóa file `.blend`, `.fbx`, cảnh Unity hoặc tài sản gốc còn khả năng sử dụng.

## Character and media tools

- `characters/build_dragon_knight.py`: current Blender dragon authoring source.
- `media/record_lobby.js`: lobby WebM generator.
- `tests/verify_dragon_knight.js`: three-hero gameplay checks and portrait export.
- `tests/verify_lobby.js`: lobby video, bilingual settings and persistence checks.

See `docs/DRAGON_KNIGHT.md` for asset locations and cleanup details.

- `castle_room_details.py`: per-room wall art, sconces and collision-safe functional furnishings (called by castle builder).
- `tests/verify_castle_decor.js`: wall art bounds, room content, and live direction reversal.

- `castle_furniture_scale.py`: hero-scale furniture and dense per-room placement, run by the castle builder.
- `build_ancient_grove.py`: Blender scene and shared geometry for the hidden elder and four forest biomes.
- `build_expanded_realm.py`: fourfold terrain dimensions and the monumental Mercury Lake in Blender.
- `build_lake_monsters.py`: articulated Loch Ness (10000 HP) and space crocodile (7000 HP) Blender assets.
- `tests/verify_lake_monsters.js`: pursuit, bridge safety, telegraphed damage, hero attacks and recovery.
- `tests/verify_expanded_realm.js`: expanded bounds, road removal, lake paths, liquid and colliders.
- `tests/verify_ancient_grove.js`: compatibility entry point for the expanded forest and guardian suite.
- `castle_gate_guards.py`: two Blender-authored gate NPCs, animated by features/castle/castle-upgrade.js.
- `tests/verify_castle_update.js`: under-bridge traversal, foundation, gate guards, vitals and saved settings.
- `tests/verify_furniture_scale.js`: character-relative dimensions, room population and collision metadata.
- `tests/verify_survival_library.js`: stamina, all-hero diving, oxygen, water-only bosses, mutant grass and persistent encounters.

- `build_forest_guardian.py`: Blender bark giant with six pivots and 7000 HP.
- `tests/verify_primordial_forest.js`: titanium perimeter, one entrance, natural traversal, disguise/combat and real library model renders.

- `refresh_web_assets.py`: refresh cache keys after changing web assets.
- `tests/verify_wildlife_backpack.js`: streamed animals, roaming, pickup, persisted inventory and exact chocolate buff expiry.

- `characters/build_kingkong.py`: Blender boxing guardian and shared rig data.
- `tests/verify_kingkong.js`: boxing, guardian mitigation, selection and responsive bilingual UI.
