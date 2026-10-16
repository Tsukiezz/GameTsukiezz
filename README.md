# 🌙 Game Tsukiezz: Echoes of the Moonlit Realm

[![C# & Assets Validation](https://github.com/Tsukiezz/GameTsukiezz/actions/workflows/csharp-lint-and-validate.yml/badge.svg)](https://github.com/Tsukiezz/GameTsukiezz/actions/workflows/csharp-lint-and-validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Unity](https://img.shields.io/badge/Unity-2022.3%20LTS-black.svg?logo=unity)](https://unity.com/)

> **Repository:** [https://github.com/Tsukiezz/GameTsukiezz](https://github.com/Tsukiezz/GameTsukiezz)  
> **Thể loại:** Phiêu lưu khám phá & Giải đố cốt truyện (Story-driven Adventure / Narrative Puzzle)  
> **Engine:** Unity (2022.3 LTS hoặc mới hơn)  
> **Ngôn ngữ:** C#  

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

## 📁 2. Cấu Trúc Dự Án Unity C#

```
GameTsukiezz/
├── Assets/
│   ├── Audio/               # Nhạc nền, âm thanh bước chân, tiếng gõ chữ
│   ├── Materials/           # Vật liệu hiển thị
│   ├── Prefabs/             # Prefab Player, NPC, Cổng khóa, Hộp thoại
│   ├── Scenes/              # Scene màn chơi chính (MainLevel.unity)
│   ├── ScriptableObjects/   # Dữ liệu hội thoại, nhiệm vụ, vật phẩm
│   ├── Scripts/
│   │   ├── Core/            # GameManager (Quản lý trạng thái, Cờ cốt truyện)
│   │   ├── Dialogue/        # Hệ thống hội thoại, Typewriter, Lựa chọn câu trả lời
│   │   ├── Interaction/     # Nhặt đồ, Mở cửa phong ấn, Dò tìm tương tác phím [E]
│   │   ├── Inventory/       # Quản lý túi đồ và cổ vật
│   │   ├── Player/          # Di chuyển mượt mà, hướng nhìn, điều khiển
│   │   ├── Quests/          # Quản lý nhiệm vụ và tiến độ
│   │   └── UI/              # Giao diện HUD, thông báo nhặt đồ, nhắc phím
│   └── Sprites/             # Hình ảnh nhân vật, bản đồ, icon vật phẩm
├── Packages/
│   └── manifest.json        # Cấu hình các gói Unity (UI, TextMeshPro, Input System)
└── ProjectSettings/         # Thiết lập dự án Unity
```

---

## 🚀 3. Hướng Dẫn Mở & Chạy Game Bằng Unity

### Bước 1: Cài đặt Unity Hub & Unity Editor
1. Tải và cài đặt **Unity Hub** từ trang chủ chính thức: [unity.com/download](https://unity.com/download).
2. Mở Unity Hub, vào mục **Installs** -> chọn **Install Editor** (Khuyên dùng bản **2022.3 LTS** hoặc **Unity 6 LTS**).

### Bước 2: Mở Dự Án Tsukiezz
1. Trong Unity Hub, vào tab **Projects**.
2. Nhấn nút **Add** (hoặc **Add project from disk**).
3. Duyệt đến thư mục dự án:
   ```
   c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz
   ```
4. Chọn phiên bản Unity đã cài và nhấn để mở.

### Bước 3: Tạo Scene Mẫu & Chạy Thử
1. Trong cửa sổ **Project**, vào `Assets/Scenes/`.
2. Tạo Scene mới (Chuột phải -> `Create` -> `Scene`, đặt tên là `MainAdventure`).
3. Tạo đối tượng trong Scene:
   - **Player:** Tạo GameObject 2D/3D, thêm component `PlayerController`, `PlayerInteraction`, `Rigidbody2D` và `CircleCollider2D`.
   - **GameManager & Managers:** Tạo GameObject trống đặt tên `GameManagers`, thêm `GameManager`, `DialogueManager`, `QuestManager`, `InventoryManager`.
   - **UI Canvas:** Tạo Canvas, thêm `AdventureHUD` để hiển thị nhắc nhở phím `[E]` và khung đối thoại.
4. Nhấn nút **▶ Play** trên thanh công cụ Unity để trải nghiệm!
