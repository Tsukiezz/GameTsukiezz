# Blender MCP trên máy này

## Cấu hình đã kiểm tra ngày 25/10/2026

- Blender đang dùng: **`E:\blender.exe`**, kết nối trực tiếp qua **127.0.0.1:9876**.
- Scene hiện tại `RailwayJunctionsReviewed`, 361 object và 83 collection.
  File làm việc: `Assets/Art/Blender/Environments/RailwayJunctionsWorkspace.blend`.
  Giữ nguyên `RailwayCivilEngineering` trong workspace và file nguồn cũ trên đĩa.
  Studio nội thất trong `MoonRailway.blend` được giữ nguyên.
- `python tools/ai_blender_cli.py --status` / `--info` kiểm tra bằng `get_scene_info`;
  không dùng `ping` để kết luận trạng thái vì add-on cài trên máy không hỗ trợ ổn định lệnh đó.
- `tools/review_railway_engineering.py` được chạy bên trong Blender để chọn nút giao,
  đối chiếu tọa độ với game và lưu báo cáo trong `demo/verification/railway-junctions/`.
- File xuất chia riêng `Reviewed_Track_*`, `Reviewed_Junction_*`, `Reviewed_Station_*`, `Reviewed_Bridge_Piers`, có camera
  `Junction_Review`. Chỉnh một nhóm bằng Empty cha trong Outliner. Đây là nguồn xem/chỉnh
  thiết kế; thay đổi trong Blender chưa tự xuất ngược vào bộ tìm đường runtime.

Mở file trên máy hiện tại mà không cần chạy script PowerShell:

```powershell
$blend = (Resolve-Path 'Assets/Art/Blender/Environments/RailwayJunctionsWorkspace.blend').Path
Start-Process -FilePath 'E:\blender.exe' -ArgumentList ('"' + $blend + '"') -WindowStyle Normal
python tools/ai_blender_cli.py --status
```

`start-blender-mcp.ps1` đã hỗ trợ tự tìm E:/D: hoặc `-BlenderExecutable`; nếu Windows
chặn chạy script, dùng lệnh `Start-Process` phía trên. Không cần đổi chính sách Windows.

`export_railway_engineering.py` dựng `RailwayJunctionsReviewed.blend` từ báo cáo mới nhất,
không sửa Workspace của người thiết kế. Khi append scene, lưu sang Workspace riêng
thay vì ghi đè chính file Blender vừa được dùng làm thư viện.

## Thông tin máy cũ — giữ để tham khảo

Đã cài MCP for Blender 2.2.2 và bật add-on trong Blender 5.2.1 LTS.

- Blender: `D:\blender.exe`.
- Máy chủ MCP: `.runtime/blender-mcp/venv/Scripts/mcp-for-blender.exe` tại gốc workspace Tsukiezz.
- Codex: server `blender` trong `C:\Users\msi\.codex\config.toml`, trạng thái enabled.
- Kết nối Blender cục bộ: `127.0.0.1:9876`. Add-on tự khởi động khi mở Blender.
- Đã đặt UTF-8 và `DISABLE_TELEMETRY=true` cho server MCP.

Khởi động lại Codex sau lần cài đầu để phiên mới nạp công cụ Blender.
Mở Blender, mở file `.blend` muốn làm việc rồi yêu cầu Codex đọc cảnh/chỉnh mô hình.
Nếu mất kết nối: trong khung 3D nhấn N, mở tab MCP for Blender và bật server.

Mở Blender từ PowerShell ở thư mục dự án:

```powershell
.\tools\start-blender-mcp.ps1
# Hoặc chỉ định một file:
.\tools\start-blender-mcp.ps1 -BlendFile '.\Assets\Art\Blender\Environments\CastleExtension.blend'
```

Kiểm tra lại giao thức MCP, chỉ đọc cảnh:

```powershell
# Chạy từ gốc workspace Tsukiezz khi Blender đang mở:
.\.runtime\blender-mcp\venv\Scripts\python.exe -X utf8 projects\GameTsukiezz\tools\verify_blender_mcp.py
```

Kiểm tra đã đạt: MCP initialize, liệt kê 9 công cụ, đọc cảnh Cube/Camera/Light,
đọc phiên bản add-on khớp protocol 14. Báo cáo cục bộ:
`.runtime/blender-mcp/connection-report.json`. Chưa chỉnh sửa hoặc lưu mô hình game.

Nguồn: https://github.com/ahujasid/mcp-for-blender và
https://learn.chatgpt.com/docs/extend/mcp?surface=cli
