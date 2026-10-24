import argparse
import sys
import os
import subprocess
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ai_blender_bridge import BlenderAIBridge

BLENDER_EXE = os.environ.get("BLENDER_EXE", r"D:\blender.exe")
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Assets", "Art", "Models"))

def run_headless_script(python_code):
    """Chạy script Python trong Blender chế độ ngầm (Headless)"""
    temp_script = os.path.join(os.path.dirname(__file__), "_temp_ai_script.py")
    with open(temp_script, "w", encoding="utf-8") as f:
        f.write(python_code)

    cmd = [BLENDER_EXE, "-b", "--python", temp_script]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if os.path.exists(temp_script):
            os.remove(temp_script)
        return {"status": "success", "stdout": res.stdout, "stderr": res.stderr}
    except Exception as e:
        if os.path.exists(temp_script):
            os.remove(temp_script)
        return {"status": "error", "message": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Tsukiezz AI Blender Controller")
    parser.add_argument("--status", action="store_true", help="Kiểm tra trạng thái kết nối Blender")
    parser.add_argument("--exec", type=str, help="Thực thi đoạn mã Python trong Blender (qua Live Socket nếu có, hoặc Headless)")
    parser.add_argument("--info", action="store_true", help="Lấy thông tin Scene hiện tại từ Blender GUI")
    args = parser.parse_args()

    bridge = BlenderAIBridge()
    ping_res = bridge.ping()

    if args.status:
        print("=== TRẠNG THÁI KẾT NỐI BLENDER ===")
        print(f"Đường dẫn Blender: {BLENDER_EXE} (Tồn tại: {os.path.exists(BLENDER_EXE)})")
        if ping_res.get("status") == "success":
            print("🟢 Blender Live Server (Port 9876): ĐANG KẾT NỐI TRỰC TIẾP!")
        else:
            print("🟡 Blender Live Server (Port 9876): Chưa bật.")
            print("   -> Bạn có thể mở Blender, nhấn 'N' -> Tab 'MCP for Blender' -> Bấm 'Connect to Claude' để điều khiển trực tiếp trên màn hình.")
            print("   -> Hoặc AI sẽ tự động chạy Blender ngầm (Headless) khi bạn yêu cầu tạo model.")
        return

    if args.info:
        if ping_res.get("status") == "success":
            info = bridge.get_scene_info()
            print(json.dumps(info, indent=2, ensure_ascii=False))
        else:
            print("Cần mở Blender và bấm 'Connect to Claude' để xem thông tin Scene trực tiếp.")
        return

    if args.exec:
        code = args.exec
        if ping_res.get("status") == "success":
            print("🚀 Đang gửi lệnh tới Blender GUI (Live)...")
            res = bridge.execute_code(code)
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print("⚙️ Blender GUI chưa kết nối, đang thực thi ngầm qua Blender Headless...")
            res = run_headless_script(code)
            print(res.get("stdout", ""))
            if res.get("status") == "error":
                print("Lỗi:", res.get("message"))

if __name__ == "__main__":
    main()
