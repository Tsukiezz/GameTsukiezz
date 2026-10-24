# Sông, thác núi và suối nóng Nguyệt Tuyền

Mở **Địa điểm → Thác Núi Nguyệt Tuyền**, **Suối nước nóng**, hoặc **Sông & cầu gỗ**. Link vào thẳng: `http://127.0.0.1:8765/?river=spring` và `?river=base`. Đường leo bộ nằm ở sườn tây thác, bắt đầu gần `(-945, 797)` và kết thúc trên bờ tây suối nóng. Cánh pha lê vẫn sử dụng được; sói có thể làm choáng và ngắt bay nếu cắn trúng.

Nguồn nước ở suối nóng cao 236 m, trên một khối núi ở góc tây nam. Thác hai tầng đổ xuống nguồn sông cao 1,2 m, chênh cao 234,8 m. Tám tuyến nước uốn quanh thế giới: tuyến phía tây, vòng phía nam/đông/bắc, cùng sáu tuyến nhánh/hợp lưu. Hai cửa sông đổ vào Hồ Thủy Ngân. Toàn bộ sông phía dưới có mặt nước nằm ngang ở cao độ 1,2 m, bằng mặt Hồ Thủy Ngân. Lòng sông được đào lõm xuống khoảng 4–6 m dưới mặt nước, bờ chuyển tiếp vào nền đất cũ thay vì nâng thành dải nổi. Suối nóng trên đỉnh vẫn ở cao độ riêng và nối xuống sông bằng thác.

Có 24 cầu gỗ với sàn liên tục, hai đường lên bờ và lan can. Cầu có thể đi bộ, chạy và nhảy; người bơi có thể đi bên dưới. Sông và suối dùng cùng cơ chế bơi/lặn, thể lực và oxy của hồ. Khi hết oxy, người chơi được đưa về bờ gần cầu; ở suối nóng thì trở lại bờ suối. Mặt nước có chuyển động, bọt thác và hơi nước; cây thủy sinh lắc theo nước.

Hệ sinh thái gồm 420 vị trí cá thuộc ba kiểu, 820 cụm tảo bẹ/cây thủy sinh/san hô, và 18 vị trí khỉ đít đỏ quanh suối. Cá bơi và khỉ đi lại; chỉ cập nhật các đàn gần người chơi, tối đa 10 khỉ hiển thị cùng lúc, để giảm tải đồ họa.

Núi suối nóng có sườn núi dạng nón phủ cỏ và rêu, rừng anh đào, cây lá kim, hoa dại, dương xỉ và bụi cây. Thân cây có va chạm; cây lớn tránh hành lang đường mòn. Cánh anh đào rơi quanh tán cây. Đường mòn chạy theo đường đồng mức với nhiều khúc ngoặt từ chân núi lên đỉnh. Vật lý chặn đi hoặc nhảy để leo tắt sườn dốc; bờ suối, đỉnh núi bằng phẳng và lối đi vẫn di chuyển tự do. Cánh pha lê vẫn cho phép bay nếu đã trang bị.

Sói Tốc Độ tuần tra theo tuyến liên tục từ chân núi, qua đường mòn đến vành suối nóng rồi trở xuống. Sói có thể phát hiện và đuổi người chơi trong toàn vùng núi, kiểm tra tầm nhìn qua địa hình và đi theo lối mòn khi hai bên ở khác khúc đường. Sói tránh nước sâu, thân cây và dốc không thể đi, không dịch chuyển xuyên vách. Sói Tốc Độ có 2.400 máu, đuổi 8,8 m/s và vồ 16 m/s. Đòn thường cắn 16 sát thương. Kỹ năng riêng: báo trước 0,9 giây, lao đến vị trí đã nhắm, cắn 36 sát thương và gây choáng 1,4 giây, hồi chiêu 10 giây. Có thể né khỏi vùng mục tiêu. Giáp và giảm sát thương của nhân vật vẫn có tác dụng. Choáng tự hết; đi lại, nhảy, đánh và bật bay bị chặn trong khoảng đó. Dịch chuyển/về trang chủ xóa hiệu ứng. Người chơi có thể đánh hạ sói bằng đòn đánh thường của nhân vật.

Blender: `Assets/Art/Blender/Environments/ThermalRiverRealm.blend`. Bộ dựng: `tools/build_river_realm.py`; cây và hoa: `tools/river_mountain_ecology.py`. Hiển thị cây dùng các lưới dùng chung trong `demo/features/river/mountain-life.js` để giảm số lệnh vẽ. Chỉ collection `ThermalRiverRealm` được thay khi dựng lại. Dữ liệu xuất gồm các đỉnh/tam giác địa hình, nước, cầu và mô hình sinh vật ở `demo/features/river/data/thermal-river.js`. Vật lý nội suy đúng tam giác hiển thị, không dùng một mặt sàn phẳng che dòng sông. Các công trình cũ, khu rừng và Núi Bạch Khuyết được tránh khi bố trí tuyến chính; độ sâu của Hồ Thủy Ngân được giữ lại.

Kiểm tra: server `demo` cổng 8765, chạy `node tools/tests/verify_thermal_river.js`; báo cáo và ảnh trong `demo/verification`. Hồi quy hồ: `verify_lake_monsters.js`; trang bị bay: `verify_crystal_wings.js`.


Kiểm tra núi xanh và vật lý: "node tools/tests/verify_living_mountain.js"; mô phỏng sói tuần tra 10 phút trong game, kiểm tra nhảy leo tắt và đi hết đường mòn.
