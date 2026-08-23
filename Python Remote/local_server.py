import socket
import threading
import struct
import io
import time
import mss
from PIL import Image
import pyautogui

pyautogui.PAUSE = 0
pyautogui.FAILSAFE = False

HOST = '0.0.0.0'
PORT = 5000
VNC_PASSWORD = "test123"

def handle_viewer(conn, addr):
    print(f"[+] Connected by {addr}")
    try:
        auth_data = conn.recv(1024).decode('utf-8').strip()
        if auth_data != VNC_PASSWORD:
            conn.sendall(b"AUTH_FAILED")
            conn.close()
            return
        
        conn.sendall(b"AUTH_OK")

        stop_event = threading.Event()
        stream_thread = threading.Thread(target=stream_screen, args=(conn, stop_event))
        stream_thread.daemon = True
        stream_thread.start()

        while True:
            data = conn.recv(1024)
            if not data:
                break
            cmd = data.decode('utf-8').strip()
            process_input(cmd)

    except Exception as e:
        print(f"[-] Session error: {e}")
    finally:
        stop_event.set()
        conn.close()
        print(f"[-] Disconnected: {addr}")

def stream_screen(conn, stop_event):
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        while not stop_event.is_set():
            try:
                sct_img = sct.grab(monitor)
                img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
                
                buffer = io.BytesIO()
                img.save(buffer, format="JPEG", quality=45)
                frame_bytes = buffer.getvalue()

                header = struct.pack(">I", len(frame_bytes))
                conn.sendall(header + frame_bytes)

                time.sleep(0.04)
            except Exception:
                break

def process_input(cmd):
    try:
        parts = cmd.split(":")
        action = parts[0]

        if action == "MOVE":
            pyautogui.moveTo(int(parts[1]), int(parts[2]))

        elif action == "CLICK":
            pyautogui.click(button=parts[1])

        # Handle Key Combinations (e.g. HOTKEY:ctrl:c or HOTKEY:ctrl:v)
        elif action == "HOTKEY":
            modifier = parts[1]  # 'ctrl', 'alt', or 'shift'
            key = parts[2].lower()
            pyautogui.hotkey(modifier, key)

        # Handle Single Special Keys & Typing
        elif action == "KEY":
            key_name = parts[1]
            key_map = {
                "Return": "enter", "Enter": "enter", "BackSpace": "backspace",
                "Tab": "tab", "Space": "space", "Escape": "esc", "Delete": "delete",
                "Up": "up", "Down": "down", "Left": "left", "Right": "right"
            }
            if key_name in key_map:
                pyautogui.press(key_map[key_name])
            elif len(key_name) == 1:
                pyautogui.write(key_name)
    except Exception:
        pass

def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(5)
    print(f"[*] Server active on port {PORT}...")

    while True:
        conn, addr = server.accept()
        t = threading.Thread(target=handle_viewer, args=(conn, addr))
        t.daemon = True
        t.start()

if __name__ == "__main__":
    start_server()