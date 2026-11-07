# Tsuventure trên Windows — cửa sổ ứng dụng riêng

Mở **`Tsuventure.exe`** ở gốc dự án hoặc biểu tượng Tsuventure trên Desktop. Bản từ **03/11/2026** hiển thị game trong cửa sổ Windows của Tsuventure, không mở Chrome, Edge hay trình duyệt mặc định, không cần tài khoản Google. **F11** bật/tắt toàn màn hình; đóng cửa sổ game sẽ thoát cả máy chủ của phiên đó.

Game tiếp tục dùng Three.js/WebGL trong **Microsoft WebView2 Runtime** nhúng. Đây là bộ hiển thị ứng dụng, không phải tab trình duyệt và không phải việc chuyển dự án sang Unity/Unreal. Máy này đã có WebView2 Runtime. Máy khác cần Windows, .NET Framework **4.6.2+** và Microsoft WebView2 Runtime; nếu thiếu, ứng dụng báo rõ, không tự mở Chrome hoặc âm thầm cài phần mềm.

## Offline và tài nguyên

- EXE chứa bản đồ, Three.js, model, ảnh, âm thanh, thư viện WebView2 .NET và loader x86/x64. Không cần Python/Blender để chơi.
- Đã bỏ Google Fonts và preconnect tới Google; dùng font dự phòng của Windows. Trong cửa sổ ứng dụng, request nội dung chỉ được đi tới máy chủ game loopback, chặn trang ngoài và cửa sổ bật lên.
- Đặt EXE cạnh `demo/`: chạy dữ liệu dự án hiện tại. Chép riêng EXE: tự giải nén bundle đi kèm vào `%LOCALAPPDATA%\Tsuventure\Bundles\<bundle>`.
- Máy chủ nội bộ `127.0.0.1:8883` chỉ phục vụ game trên máy, không cần Internet và không hiển thị thanh địa chỉ. WebView2 Runtime có cơ chế cập nhật riêng của Microsoft; không dùng Google để chơi.
- Dữ liệu dựng cảnh vẫn cần thời gian tải. Cửa sổ giữ màn hình chờ 0–100% và chỉ cho điều khiển sau khung hình sẵn sàng.
- Tải xong vào sảnh chính; bấm **CHƠI** để vào thế giới. Sảnh thu gọn thành menu hai cột khi cửa sổ thấp, tự cuộn khi thiếu chỗ và giữ logo/nút bấm trong chiều ngang màn hình.

## Bản lưu riêng

Hồ sơ hiển thị: `%LOCALAPPDATA%\Tsuventure\PlayerData`.

Bản lưu JSON: `%LOCALAPPDATA%\Tsuventure\Saves\progress.json`; bản trước nằm cạnh đó với đuôi `.previous`. Game vẫn giữ localStorage riêng trong hồ sơ ứng dụng; các thay đổi được đồng bộ vào JSON có giảm tần suất ghi, và lấy snapshot lần cuối khi đóng cửa sổ.

Lần đầu dùng bản mới, nếu chưa có bản lưu native, launcher đọc **chỉ các khóa `tsuventure_*` / `tsukiezz_*` của origin `http://127.0.0.1:8883`** trong dữ liệu localStorage cũ của Chrome/Edge. Không mở trình duyệt, không đổi profile cũ, không lấy cookie/mật khẩu/dữ liệu website khác. Bộ đọc hỗ trợ WAL phân mảnh, SST và Snappy, theo sequence và bản ghi xóa. Đã kiểm tra đọc được 26 khóa game trên máy hiện tại. Không trộn tiến trình giữa các profile khác nhau.

Thanh menu **Bản lưu → Xuất bản lưu / Nhập bản lưu** cho phép chuyển sang máy khác hoặc phục hồi. Nhập cần xác nhận, sao lưu tiến trình hiện tại, rồi tải lại game; không tự áp lại bản nhập ở mỗi lần reload. Không dùng chung profile WebView2 với profile trình duyệt.

## Cập nhật

EXE chạy bản sao host theo SHA-256 trong `%LOCALAPPDATA%\Tsuventure\Launcher\<SHA>`, giúp file ở Desktop thay thế được khi game đang chạy. Mở lại cùng phiên sẽ đưa cửa sổ hiện tại lên trước; đổi bản dựng sẽ bàn giao server cũ sang bản mới. Nhận diện taskbar và lệnh mở lại trỏ tới launcher gốc.

EXE chép riêng cần thay bằng EXE mới để cập nhật. Không có cơ chế tự tải bản mới từ GitHub. Các release cũ trên GitHub vẫn có thể là launcher dùng trình duyệt; bản native hiện tại là file EXE ở dự án này cho tới khi được phát hành riêng.

## Dựng lại và kiểm thử

```powershell
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
python tools/desktop/verify_exe.py
python tools/desktop/verify_native_storage.py
node tools/desktop/verify_native.js
```

Build cần Python/Pillow, compiler .NET Framework và SDK WebView2 chính thức. `ensure_webview2.py` tải SDK tại build nếu thiếu, kiểm tra phiên bản/SHA-256 đã ghim trong `webview2-dependency.json`. Người chơi không cần tải SDK. Giấy phép tại `docs/third-party/`, đồng thời nhúng trong EXE. Các DLL của host được kiểm tra hash và giải nén vào `%LOCALAPPDATA%\Tsuventure\Native\<launcherId>`.

Kiểm thử native dùng EXE chép riêng, cổng 8896, hồ sơ và bản lưu trong `.runtime/native-desktop/checks/`. Cổng debug chỉ bật khi truyền riêng `--test-debug-port`; bản mở bình thường không bật DevTools/debug port. Kiểm thử server/đóng gói dùng cổng 8897. Không thay save người chơi tại 8883. Log lỗi native ở `%LOCALAPPDATA%\Tsuventure\native.log`.
