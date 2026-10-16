# 🌙 Game Tsukiezz: Echoes of the Moonlit Realm

[![C# & Assets Validation](https://github.com/Tsukiezz/GameTsukiezz/actions/workflows/csharp-lint-and-validate.yml/badge.svg)](https://github.com/Tsukiezz/GameTsukiezz/actions/workflows/csharp-lint-and-validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Unity](https://img.shields.io/badge/Unity-2022.3%20LTS-black.svg?logo=unity)](https://unity.com/)
[![Blender](https://img.shields.io/badge/Blender-5.2%20LTS-orange.svg?logo=blender)](https://www.blender.org/)

> **Repository:** [https://github.com/Tsukiezz/GameTsukiezz](https://github.com/Tsukiezz/GameTsukiezz)  
> **Thể loại:** Phiêu lưu khám phá & Giải đố cốt truyện (Story-driven Adventure / Narrative Puzzle)  
> **Engine:** Unity (2022.3 LTS hoặc mới hơn)  
> **3D Graphics:** Blender 5.2 LTS  
> **Ngôn ngữ:** C# & Python (Blender Automation)  

---

![Tsukiezz Concept Art](Assets/Art/Textures/tsukiezz_concept_art.jpg)

---

## 📖 1. Giới thiệu Cốt Truyện & Ý Tưởng Thiết Kế

### Bối cảnh (Lore)
Thế giới **Tsukiezz** từng là một vương quốc thịnh vượng dưới sự bảo hộ của **Nguyệt Tinh (The Moonstone)**. Một đêm định mệnh, vầng trăng bị chia tách thành ba mảnh vỡ ký ức, khiến toàn bộ vùng đất chìm vào giấc ngủ vĩnh hằng và dòng thời gian bị đóng băng.

### Nhân vật chính
Bạn thức tỉnh trong một khu rừng phế tích với một mảnh vỡ cổ vật phát sáng trên tay. Bạn không nhớ rõ mình là ai, nhưng các linh hồn còn vất vưởng tại Tsukiezz nhận ra bạn là "Người Canh Giữ Ký Ức" (The Chronicler).

### Cơ chế chơi cốt lõi (Core Gameplay Loop)
1. **Khám phá (Exploration):** Di chuyển tự do trong thế giới, mở khóa các khu vực bị phong ấn bằng chìa khóa hoặc giải đố môi trường.
2. **Đối thoại phân nhánh (Branching Narrative):** Gặp gỡ các NPC, đưa ra các câu trả lời tác động trực tiếp đến kết cục của câu chuyện (Có 3 cái kết: *Trăng Tàn*, *Trăng Rằm*, *Nhật Thực*).
3. **Nhiệm vụ & Sổ tay hành trình (Quests & Journal):** Thu thập manh mối, tìm các mảnh vỡ Nguyệt Tinh và ghi lại lịch sử bị lãng quên của Tsukiezz.
4. **Túi đồ (Inventory):** Sử dụng các cổ vật thu thập được để giải mã các bí ẩn trên bia đá hoặc mở cánh cổng thần điện.

---

## 🎨 2. Kết Nối Đồ Họa 3D Với Blender (3D Art Pipeline)

Dự án đã được tích hợp chặt chẽ với **Blender 5.2 LTS** (được cài đặt sẵn tại `E:\blender.exe`).

### 📦 Các Mô Hình 3D Đã Tạo Sẵn Trong `Assets/Art/Models/`:
| Tên Asset | Định Dạng | Vai Trò Trong Game |
| :--- | :--- | :--- |
| **MoonstoneArtifact** | `.blend` / `.fbx` | Mảnh vỡ Nguyệt Tinh phát sáng xanh ngọc neon (Vật phẩm cốt truyện chính) |
| **AncientMonolith** | `.blend` / `.fbx` | Bia đá cổ thì thầm (Whisper Stone) lưu giữ ký ức và manh mối giải đố |
| **TempleGate** | `.blend` / `.fbx` | Cổng đền thờ phong ấn cổ đại với các trụ đá và xà vòm |
| **AncientKey** | `.blend` / `.fbx` | Chiếc chìa khóa cổ bằng đá dùng mở cổng thần điện |

### 🔄 Cách 1: Lưu Trực Tiếp File `.blend` Vào Unity
Khi bạn tạo hoặc chỉnh sửa một model trong Blender, bạn chỉ cần chọn **File -> Save As...** và lưu thẳng file `.blend` vào thư mục:
```
Assets/Art/Models/
```
Unity sẽ tự động gọi Blender ở chế độ nền để biên dịch và cập nhật Mesh/Materials ngay lập tức vào Scene!

### ⚡ Cách 2: Xuất Nhanh 1-Click Với Tool `export_to_unity.py`
Trong thư mục `tools/`, chúng tôi cung cấp sẵn script [export_to_unity.py](file:///c:/Users/Admin/OneDrive/M%C3%A1y%20t%C3%ADnh/Desktop/CODE/Tsukiezz/projects/GameTsukiezz/tools/export_to_unity.py):
1. Trong Blender, chuyển sang tab **Scripting**.
2. Mở file `tools/export_to_unity.py`.
3. Chọn vật thể muốn xuất trong Viewport 3D và nhấn **Run Script**.
4. Script sẽ tự động:
   - Chuẩn hóa tỷ lệ Scale 1.0 (Apply Transform).
   - Xoay đúng trục chuẩn Unity (`-Z Forward`, `Y Up`).
   - Xuất file `.fbx` vào thẳng `Assets/Art/Models/` và hiện thông báo hoàn tất.

---

## 📁 3. Cấu Trúc Dự Án Unity C#

```
GameTsukiezz/
├── Assets/
│   ├── Art/
│   │   ├── Models/          # Model 3D (.blend và .fbx từ Blender)
│   │   ├── Textures/        # Textures và Concept Art
│   │   └── Materials/       # Vật liệu hiển thị
│   ├── Audio/               # Nhạc nền, âm thanh bước chân, tiếng gõ chữ
│   ├── Prefabs/             # Prefab Player, NPC, Cổng khóa, Hộp thoại
│   ├── Scenes/              # Scene màn chơi chính (MainLevel.unity)
│   ├── ScriptableObjects/   # Dữ liệu hội thoại, nhiệm vụ, vật phẩm
│   ├── Scripts/             # Toàn bộ mã nguồn C# (Core, Dialogue, Quests, UI...)
│   └── Sprites/             # Hình ảnh 2D, icon vật phẩm
├── Packages/                # Cấu hình các gói Unity (manifest.json)
├── ProjectSettings/         # Thiết lập dự án Unity
└── tools/
    ├── export_to_unity.py   # Script Blender xuất nhanh 1-Click sang Unity
    └── generate_3d_assets.py # Script tự động sinh các model 3D mẫu
```

---

## 🚀 4. Hướng Dẫn Mở & Chạy Game Bằng Unity

1. Mở **Unity Hub** -> nhấn **Add** -> chọn thư mục:
   ```
   c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz
   ```
2. Mở Scene trong `Assets/Scenes/`.
3. Kéo thả các model 3D trong `Assets/Art/Models/` (như `MoonstoneArtifact.fbx`, `AncientMonolith.fbx`) vào Scene.
4. Gắn component `InteractableBase` hoặc `PickupItem` để nhân vật có thể tương tác bằng phím **[E]**!
5. Nhấn nút **▶ Play** trên Unity để trải nghiệm!
