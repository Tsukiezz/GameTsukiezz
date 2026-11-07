# Tsuventure: khởi động EXE với màn hình chờ

EXE mở màn hình chờ 0–100% trên bối cảnh Nguyệt Quang và logo sẵn có của
game. Khi tải xong và render được khung cảnh đầu tiên, hiển thị 100%, đóng
màn hình chờ rồi vào **sảnh chính**, cả trong EXE và trình duyệt. Chỉ khi
người chơi bấm **CHƠI** mới bắt đầu gameplay.

Tiến độ tăng theo phần việc hoàn thành: danh sách script, dựng thế giới,
hình ảnh và các nhóm shader. Không dùng bộ đếm thời gian để giả lập việc
tải xong. Nếu tài nguyên lỗi, dừng dưới 100% và hiện nút **Tải lại game**.
Khoảng dừng ngắn ở 100% chỉ để người chơi đọc được trạng thái sẵn sàng.

## Tải có chia đợt

- `demo/core/game-boot.js` điều phối danh sách `boot-manifest.json`, theo dõi
  ảnh/texture, quản lý tiến độ, lỗi và khung hình đầu tiên.
- `runtime-state.js` giữ các biến và hàm ở phạm vi dùng chung. `runtime.js`
  chạy các bước khởi tạo theo đúng thứ tự cũ, chờ các installer hoàn thành.
- Các vòng dựng bản đồ/đường sắt và chọn vị trí ga nhường luồng giao diện
  theo ngân sách thời gian. Truy vấn độ cao, va chạm và callback chơi vẫn
  đồng bộ; chỉ hàm xây dựng một lần được chuyển sang bất đồng bộ.
- Shader được chuẩn bị theo nhóm vật thể đang hiển thị, với cùng ánh sáng
  và thuộc tính cảnh. Không dựng lại toàn bộ vùng đang ẩn chỉ để làm nóng
  GPU. Áp dụng mức đồ họa đã chọn cho cả đèn được thêm ở giai đoạn sau.
- Video sảnh được tạm dừng trong khi tải, giảm công việc nền không cần thiết.
- Chặn điều khiển game trong lúc thế giới đang được khởi tạo dở.

Nguồn khởi tạo có thể chỉnh là `tools/runtime-source.js`. Sau khi sửa:

```powershell
node tools/build_boot_runtime.js
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
```

Các công cụ `make_boot_helpers_cooperative.js`, `refine_rail_boot_batches.js`
và `refine_station_planning_batches.js` ghi lại việc tách các vòng xây dựng
đường sắt. Chạy lại được mà không thêm trùng điểm nhường luồng.

## Biểu tượng Windows

`tools/desktop/WindowBranding.cs` đặt AppUserModelID riêng cho đúng cửa sổ
game mới mở, nguồn icon từ EXE, tên Tsuventure và lệnh mở lại. Không đổi
nhận diện các cửa sổ trình duyệt khác và không tự ghim taskbar. Các thuộc
tính relaunch được đặt trước AppUserModelID theo [hướng dẫn Windows Shell](https://learn.microsoft.com/en-us/windows/win32/shell/appids).

Launcher yêu cầu Chromium tắt hộp thoại hang-monitor qua tham số
`--disable-hang-monitor`; đây là [tham số của Chromium](https://chromium.googlesource.com/chromium/chromium/+/HEAD/content/public/common/content_switches.cc).
Phần chia tải vẫn cần thiết khi trình duyệt dùng lại tiến trình đang chạy.
Không thay hồ sơ trình duyệt, origin localhost, định dạng save hay dữ liệu
chơi. Tên/icon trên khay hệ thống vẫn được giữ.

EXE được biên dịch vào file tạm rồi thay file đích; nếu Windows đang giữ
ảnh thực thi, giữ bản cũ bằng một tên sao lưu trước khi đặt bản mới. Không
dừng tiến trình game đang chơi chỉ để dựng bản cập nhật.

## Kiểm tra

- `tools/tests/verify_boot_loading.js`: 0–100% đơn điệu theo việc thật, có
  khung hình trong khi tải, vào sảnh rồi bấm CHƠI, retry khi thiếu tài nguyên, các
  thao tác kho/camera/thế giới/đường sắt và lưu/tải lại.
- `tools/tests/verify_world_inventory_sources.py`: 351 kiểm tra nguồn,
  manifest/cache key, cú pháp và hình vật phẩm.
- `tools/desktop/verify_exe.py`: gói EXE độc lập, tài nguyên, bàn giao server
  và sáu kiểm tra nhận diện cửa sổ/logo Windows.

Kết quả cuối: **16 kiểm tra tải**, **88 kiểm tra gameplay/đường sắt/kho**,
**351 kiểm tra nguồn/tài nguyên** và **23 kiểm tra EXE/Windows** đều đạt.
Save sau khi dùng vật liệu vẫn đúng khi tải lại; lỗi thiếu script hiện Retry
dưới 100%; không ghi nhận lỗi JavaScript/tài nguyên trong lượt tải thành công.

Báo cáo và ảnh: `.runtime/boot-loading/checks/`. Lần kiểm tra cuối trên máy
này ghi nhận 13.693 lần nhường luồng, 13.671 khung hình trong quá trình tải,
độ trễ heartbeat lớn nhất khoảng 2 giây, giảm từ khoảng 25 giây ở bản đo
trước khi chia bước khảo sát ga. Đây là số đo môi trường kiểm thử, không
phải cam kết thời gian tải hoặc FPS trên mọi máy.

Bản sao trước thay đổi: `.runtime/boot-loading/source-before.zip`,
`Tsuventure.before.exe` và `desktop-build.before.json`.
