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

### 📁 Thư Mục Đồ Họa 3D Chuẩn Hóa (`Assets/Art/Blender/`)
Toàn bộ mô hình 3D được phân loại khoa học vào thư mục đồ họa riêng:

```
Assets/Art/Blender/
├── Characters/                      # Nhân vật trò chơi
│   ├── HamsterWarrior.blend / .fbx  # Chú Chuột Hamster Chiến Binh (Hiệp Sĩ Kiếm & Khiên)
│   └── RabbitMageWarrior.blend / .fbx # Chú Thỏ Phù Thủy Chiến Binh (Quyền Trượng & Sách Phép)
└── Props/                           # Đồ vật & Môi trường phế tích
    ├── MoonstoneArtifact.blend / .fbx # Cổ vật Nguyệt Tinh phát sáng neon
    ├── AncientMonolith.blend / .fbx   # Bia Đá Thì Thầm khắc cổ tự
    ├── TempleGate.blend / .fbx        # Cổng Thần Điện Phong Ấn
    └── AncientKey.blend / .fbx        # Chìa Khóa Cổ Tsukiezz
```

### 🐰 Nhân Vật Mới: Thỏ Phù Thủy Chiến Binh (Rabbit Mage Warrior)
![Rabbit Mage Warrior](Assets/Art/Textures/rabbit_mage_warrior.jpg)
* **Chủng tộc & Hệ:** Thỏ Tộc Cổ Xưa (Moonlit Bunny), Hệ Phép Thuật Nguyệt Thần (Lunar Arcane).
* **Vũ khí:** Quyền Trượng Nguyệt Thạch (Moon Crescent Staff) ôm quả cầu ma thuật phát sáng tím neon & Cuốn Sách Phép Cổ Tsukiezz (Ancient Grimoire).
* **Trang bị:** Mũ phù thủy chóp nhọn khoét 2 khe cho đôi tai dài, áo choàng tím hoàng gia viền vàng ròng, giáp hộ tâm titan khảm ngọc Nguyệt Tinh xanh.

---

## 📁 3. Cấu Trúc Dự Án Unity C#

```
GameTsukiezz/
├── Assets/
│   ├── Art/
│   │   ├── Blender/         # THƯ MỤC ĐỒ HỌA 3D CHÍNH (Characters & Props)
│   │   │   ├── Characters/  # HamsterWarrior, RabbitMageWarrior
│   │   │   └── Props/       # AncientKey, AncientMonolith, MoonstoneArtifact, TempleGate
│   │   ├── Models/          # Đồng bộ cho Unity Prefabs
│   │   ├── Textures/        # Textures & Concept Artwork
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
    ├── ai_blender_bridge.py # Cầu nối socket thời gian thực với Blender (Port 9876)
    ├── ai_blender_cli.py    # Dòng lệnh điều khiển Blender tạo model theo lệnh
    ├── create_rabbit_mage_warrior.py # Script sinh nhân vật Thỏ Phù Thủy
    ├── create_hamster_warrior.py     # Script sinh Chiến Binh Hamster
    └── export_to_unity.py   # Script Blender xuất nhanh 1-Click sang Unity
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
