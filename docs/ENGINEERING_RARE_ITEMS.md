# Bàn kỹ thuật và bộ sưu tập hiếm

Cập nhật ngày 05/11/2026 theo ảnh tham chiếu của người chơi.

- Bàn chế tạo nằm sát góc tây bắc Trụ Sở Công Nghệ. Ba cụm bàn gồm tủ máy/màn hình trung tâm, bảng dụng cụ và khay linh kiện bên trái, CAD/máy in nhỏ bên phải. Màn hình được vẽ cục bộ, không cần mạng. Nhấn **E** phía trước bàn để mở tám công thức hiện có. Bàn sửa chữa vẫn ở góc đối diện.
- Nguồn chỉnh sửa: `Assets/Art/Blender/Inventory/SurvivalTreasuryStudio.blend`, model `engineering_workstation`. Dựng/xuất bằng `tools/build_survival_items.py`; mesh được gộp theo vật liệu trước khi vào game. Không xuất hàng trăm object riêng vào vòng render.
- Kiếm Rừng Sâu được dựng lại trong Blender: lưỡi bạc hình lá có sống và cạnh sắc, khảm xanh, đường gân vàng, chắn tay cành cây, ngọc ở chuôi. Cùng một model dùng cho hình kho đồ và trang bị trên tay. Công thức, hút máu 10%, độ bền và sát thương giữ nguyên.
- Balo có mục **Vật phẩm hiếm** riêng, giữ lưới năm ô ngang và chi tiết bên cạnh. Chín món: Nakat, Trái Tim Rừng Rậm, Dung Nham Thiên Hà, Hỏa Thạch Vĩnh Cửu, Động Cơ Vĩnh Cửu, Giáp Samurai, Giáp Cuồng Nộ, Kiếm Rừng Sâu và Kiếm Dung Nham. Khung vàng/tím, góc viền và nhãn chữ phân biệt đồ hiếm; công thức và bàn sửa sử dụng cùng dấu hiệu. Hàng, nút dùng/trang bị và nơi lưu cũ vẫn được dùng, không tạo bản sao đồ.
- Phân loại hiếm không thay đổi số lượng hoặc quy tắc duy nhất của vật phẩm. Trái Tim Rừng Rậm/Nakat vẫn tối đa một. Biểu tượng Dung Nham Thiên Hà đã sửa để không bị nhận nhầm thành kiếm dung nham.
- Giáp Samurai tăng giới hạn giáp lên **500**, giảm 80% sát thương rơi, độ bền 3500. Giáp sắt vẫn 200; giáp cuồng nộ vẫn 500. Việc chuyển trang bị không tự sửa đầy độ bền.

Kiểm tra bổ sung: `tools/tests/workbench_rare.browser.js`, được ghép trong `tools/tests/build_progression_suite.cjs`. Báo cáo và ảnh ở `.runtime/workbench-rare-update/`; bản sao trước khi sửa ở `before.zip` trong cùng thư mục.

Chạy: mở `Tsuventure.exe` ở gốc dự án, đợi tải tới 100% rồi chọn **CHƠI**. Địa điểm → Trụ Sở Công Nghệ để xem bàn; **I** hoặc nút Balo để xem mục đồ hiếm.
