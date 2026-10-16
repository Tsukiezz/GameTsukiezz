import socket
import json
import time
import sys

# Đảm bảo mã hóa UTF-8 trên Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 9876

class BlenderAIBridge:
    def __init__(self, host=DEFAULT_HOST, port=DEFAULT_PORT):
        self.host = host
        self.port = port

    def send_command(self, cmd_type, params=None, timeout=10):
        """Gửi lệnh JSON tới socket server BlenderMCP trong Blender"""
        payload = {
            "type": cmd_type,
            "params": params or {}
        }
        data_bytes = json.dumps(payload).encode("utf-8")

        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(timeout)
                s.connect((self.host, self.port))
                s.sendall(data_bytes)

                # Nhận phản hồi từ Blender
                chunks = []
                while True:
                    try:
                        chunk = s.recv(4096)
                        if not chunk:
                            break
                        chunks.append(chunk)
                        # Thử decode xem đã đủ JSON chưa
                        full_data = b"".join(chunks).decode("utf-8")
                        try:
                            return json.loads(full_data)
                        except json.JSONDecodeError:
                            continue
                    except socket.timeout:
                        break

                if chunks:
                    return json.loads(b"".join(chunks).decode("utf-8"))
                return {"status": "error", "message": "No response from Blender"}
        except ConnectionRefusedError:
            return {
                "status": "error",
                "message": (
                    f"Không thể kết nối tới Blender (Cổng {self.port}).\n"
                    "👉 HÃY MỞ BLENDER và bật kết nối:\n"
                    "  1. Nhấn phím 'N' trong khung nhìn 3D (3D Viewport) để mở thanh Sidebar bên phải.\n"
                    "  2. Nhấp vào tab 'MCP for Blender'.\n"
                    "  3. Nhấn nút 'Connect to Claude' (hoặc Start Server) màu xanh."
                )
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def ping(self):
        """Kiểm tra kết nối tới Blender"""
        return self.send_command("ping")

    def get_scene_info(self):
        """Lấy thông tin các vật thể hiện có trong Scene của Blender"""
        return self.send_command("get_scene_info")

    def execute_code(self, python_code):
        """Yêu cầu Blender thực thi đoạn mã Python bất kỳ theo lệnh của AI"""
        return self.send_command("execute_code", {"code": python_code})

if __name__ == "__main__":
    bridge = BlenderAIBridge()
    print("=== Đang kiểm tra kết nối tới Blender (Port 9876)... ===")
    res = bridge.ping()
    print(json.dumps(res, indent=2, ensure_ascii=False))
