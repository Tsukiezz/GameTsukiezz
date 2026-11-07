# Kho báu, trang bị và bàn sửa chữa

Nguồn Blender: `Assets/Art/Blender/Inventory/SurvivalTreasuryStudio.blend`. Builder: `tools/build_survival_items.py`. Có 18 mẫu (7 vật phẩm/kiếm/giáp, 9 loại rương, một cụm bàn kỹ thuật và dơi), xuất mesh Three.js Y-up tại `demo/features/inventory/data/survival-items.js` và ảnh PNG trong `assets/progression/`. Rương có bộ phận nắp riêng để mở được. Giáp có thân, mũ, hai vai riêng để gắn vào bộ xương nhân vật.

## Công thức và phần thưởng

| Món | Nguồn / công thức | Hiệu quả |
| --- | --- | --- |
| Đông Trùng Hạ Thảo | Có thể rơi khi dọn bãi quái hoặc mở quà Noel | Ăn đầy độ no, giữ 100/100 trong 5 phút theo đồng hồ thực; lưu thời điểm hết tác dụng |
| Dung Nham Thiên Hà | Rương tại vị trí kho báu cũ của Thung Lũng Núi Lửa | Nguyên liệu kiếm dung nham; thay phần thưởng kiếm hoàn chỉnh, giữ kiếm người chơi đã sở hữu |
| Thanh Gươm Dung Nham | 1 Dung Nham Thiên Hà + 120 sắt | Sát thương đặc biệt; đòn trúng thứ hai trong cặp liên tiếp +10% |
| Hỏa Thạch Vĩnh Cửu | Rương trên bờ khô cạnh cuối đường lên đỉnh thác Nguyệt Tuyền | Nguyên liệu giáp samurai |
| Giáp Samurai | 1 Hỏa Thạch Vĩnh Cửu + 40 silicon + 20 sắt | 500 giáp; giảm 80% sát thương rơi; model Blender bao phủ nhân vật và theo chuyển động |
| Thanh Kiếm Sắt | 40 sắt | 80 sát thương cơ bản |
| Thanh Kiếm Rừng Sâu | 1 Trái Tim Rừng Rậm + 100 sắt | Sát thương bằng kiếm dung nham; hồi 10% HP thực tế quái mất, không hồi khi chém hụt hoặc từ phần overkill |

Nhấn E trước rương để lấy thưởng. Kho báu đặc biệt và rương thường đều lưu trạng thái đã lấy, không nhân đôi khi mở lại EXE. Bãi quái vẫn hồi theo chu kỳ 30 phút cũ; quà Noel vẫn có đúng hai loại đồ, mỗi loại 1–5. Trái Tim Rừng Rậm và Nakat vẫn tối đa 1 trong kho, kể cả mã quà; các nguyên liệu khác dùng kho stack có sẵn.

## Độ bền và sửa

- Giáp sắt / kiếm sắt: **1000**. Khi về 0, hủy món đang dùng, bỏ trang bị; có thể chế tạo lại.
- Giáp cuồng nộ, giáp samurai, kiếm rừng và kiếm dung nham: **3500**. Khi về 0, giữ món trong kho với trạng thái **Giáp hỏng / Kiếm hỏng**, không trang bị được cho tới khi sửa.
- Giáp mòn theo lượng đòn nhận; giáp samurai cũng mòn khi bảo vệ khỏi rơi. Kiếm mòn theo sát thương thực tế đã gây: tối thiểu 1, làm tròn lên 10% sát thương mỗi lần trúng. Chém hụt không làm mòn kiếm.
- Bàn sửa ở góc đông bắc Trụ Sở Công Nghệ, đối diện bàn chế tạo. Tới gần và nhấn **E**. Chọn mức sửa 10–100%. Mỗi 10% độ bền tối đa giá **10 sắt + 1 xu** (350 bền với đồ đặc biệt). Chỉ phục hồi phần còn thiếu; dưới 10% vẫn tính một lượt. Hỏng hoàn toàn: **100 sắt + 10 xu**.
- Không sửa khi thiếu nguyên liệu, đứng xa bàn hoặc món đã đầy bền. Không thu phí lặp lại. Sửa xong có thể trang bị lại trong balo. Độ bền không tự đầy lại khi tắt/mở EXE.

## Rương và vị trí

Chín kiểu Blender: thường bằng gỗ, hoàng gia, hang tà thần, núi lửa, băng, rừng, bánh kẹo, kim tự tháp, hư không. Các phần thưởng cũ (cánh, đèn pin, Nakat, hạt đậu thần, mảnh hư không trong phòng) giữ cơ chế nhận cũ và có rương theo chủ đề. Có thêm **41 rương tiếp tế** tại công trình và làng; vị trí được kiểm tra đất khô, độ dốc, va chạm, khoảng trống đường ray và lối đi lâu đài.

Rương tiếp tế chỉ có hai loại đồ thường, số lượng 1–5: gỗ, sắt, thịt đùi, cao su, silicon, chocolate, thuốc tiên, băng gạc, uranium. Không có động cơ, cổ vật, mảnh hư không, các tim/thiên thạch hay nguyên liệu kho báu mới. Nội dung theo ID ổn định để không đổi thưởng khi tải lại.

## Chạy và kiểm tra

Mở `Tsuventure.exe` ở gốc dự án. Chờ tải 100%, bấm CHƠI. **Địa điểm → Trụ Sở Công Nghệ**: vào sảnh, bàn góc trái để chế tạo; bàn góc phải để sửa.

```powershell
& 'E:/blender.exe' -b --python tools/build_survival_items.py
& 'E:/blender.exe' -b --python tools/verify_survival_items_blender.py
python tools/build_interface_locales.py
python tools/refresh_web_assets.py
python tools/desktop/build_exe.py
python tools/desktop/verify_exe.py
node tools/tests/build_progression_suite.cjs
$env:NATIVE_VERIFY_HIDE='1'
$env:NATIVE_VERIFY_SCRIPT='.runtime/progression-update/combined.browser.js'
$env:NATIVE_VERIFY_OUTPUT='.runtime/progression-update/game'
$env:NATIVE_VERIFY_SEED_FILE='.runtime/workshop-update/seed.json'
node tools/desktop/verify_native.js
```

Kiểm thử dùng profile/save riêng ở cổng 8896; kiểm tra đóng/mở lại EXE, UI nhiều kích thước, các skin, công thức, đồ hỏng/sửa, thức ăn, rương, các sửa map trước đó. Không đổi bản lưu người chơi. Báo cáo/ảnh ở `.runtime/progression-update/`; bản sao trước sửa ở `before.zip`. Chi tiết kết quả và bundle cuối tại `CONVERSATION_HANDOFF.md`.
