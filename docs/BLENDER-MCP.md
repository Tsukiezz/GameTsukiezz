# Blender MCP trên máy này

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
