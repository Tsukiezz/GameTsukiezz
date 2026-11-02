# Tsuventure trên Windows

Bấm **`Tsuventure.exe`** ở thư mục gốc để chơi. File có logo game và chứa sẵn bản đồ, âm thanh, model, hình ảnh cùng Three.js r128. Không cần cài Python hoặc Blender để chơi. Máy cần Windows có .NET Framework 4.5+ và Chrome/Edge; nếu không tìm thấy hai trình duyệt này, chương trình mở trình duyệt mặc định.

- Đặt EXE cạnh `demo/`: mở trực tiếp bản đồ hiện tại. Sửa dự án rồi đóng/mở game để thấy cập nhật.
- Chép riêng EXE sang nơi khác: chương trình tự giải nén bản game đi kèm vào `%LOCALAPPDATA%\Tsuventure\Bundles\<mã bản dựng>`. Để cập nhật bản này, tải EXE mới rồi mở lại. Không tự tải mã từ Internet.
- Game mở tại `http://127.0.0.1:8883/` trong cửa sổ riêng, giữ cùng địa chỉ và hồ sơ trình duyệt để tiếp tục dùng save đang có. Nếu đổi Chrome sang Edge thì dữ liệu lưu thuộc hồ sơ trình duyệt tương ứng.
- Khi máy chủ đã chạy từ dự án, EXE dùng lại phiên đó. Nếu bản EXE cũ đang chạy nền, mở bản mới sẽ bàn giao máy chủ sang dữ liệu mới.
- Để tắt máy chủ do EXE khởi động: nhấp phải logo Tsuventure ở khay hệ thống → **Thoát Tsuventure**. Đóng cửa sổ game vẫn giữ máy chủ nhẹ ở nền để mở lại nhanh.

File chưa ký số. Nguồn build được cung cấp trong repository để có thể tự dựng lại. Font giao diện dùng bản dự phòng nếu Google Fonts không truy cập được; bộ máy 3D và dữ liệu chơi đã có sẵn trong EXE.

## Dựng lại

Tại gốc repository:

```powershell
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
```

Máy dựng cần Python với Pillow và compiler .NET Framework tại `C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe`. Dữ liệu đóng gói chỉ lấy `demo/`, loại `demo/verification/`; không đưa `.git`, source Blender, báo cáo hay save cá nhân vào EXE. Build ID, SHA-256 và danh sách tài nguyên nằm ở `docs/desktop-build.json`.

Kiểm tra bằng `python tools/desktop/verify_exe.py --keep-server`. Lệnh dùng EXE chép riêng, cổng 8897 và cache kiểm thử trong `.runtime/desktop-test`, không thay save ở cổng chơi 8883. Sau đó có thể chạy các suite trình duyệt với `GAME_URL=http://127.0.0.1:8897/?arena=1`.

Launcher C# dùng máy chủ TCP trên loopback, hỗ trợ GET/HEAD, MIME, seek video/audio qua byte range và kiểm tra đường dẫn sau khi giải quyết liên kết thật của Windows/OneDrive. Các request ghi hoặc đường dẫn ra ngoài thư mục game bị chặn. Không cần quyền quản trị để mở cổng loopback 8883.
