import sys
import socket
import struct
import threading
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QLineEdit, QPushButton, QLabel, QMessageBox)
from PyQt6.QtGui import QImage, QPixmap
from PyQt6.QtCore import pyqtSignal, QObject, Qt

class FrameReceiver(QObject):
    frame_received = pyqtSignal(bytes)
    connection_lost = pyqtSignal()

    def __init__(self, sock):
        super().__init__()
        self.sock = sock
        self.running = True

    def start_listening(self):
        def run():
            while self.running:
                try:
                    header = self.sock.recv(4)
                    if not header:
                        break
                    frame_len = struct.unpack(">I", header)[0]

                    frame_data = bytearray()
                    while len(frame_data) < frame_len:
                        packet = self.sock.recv(min(frame_len - len(frame_data), 4096))
                        if not packet:
                            break
                        frame_data.extend(packet)

                    if len(frame_data) == frame_len:
                        self.frame_received.emit(bytes(frame_data))
                except Exception:
                    break
            self.connection_lost.emit()

        threading.Thread(target=run, daemon=True).start()

class VNCDisplayWindow(QMainWindow):
    def __init__(self, target_ip, port, password):
        super().__init__()
        self.target_ip = target_ip
        self.port = port
        self.password = password
        self.sock = None
        self.remote_res = (1920, 1080)

        self.init_ui()
        self.connect_to_server()

    def init_ui(self):
        self.setWindowTitle(f"Remote Viewer - {self.target_ip}:{self.port}")
        self.resize(1280, 720)

        self.display_label = QLabel("Connecting...", self)
        self.display_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.display_label.setStyleSheet("background-color: black;")
        self.setCentralWidget(self.display_label)

        self.display_label.setMouseTracking(True)
        self.display_label.mouseMoveEvent = self.on_mouse_move
        self.display_label.mousePressEvent = self.on_mouse_click

    def keyPressEvent(self, event):
        if not self.sock:
            return

        modifiers = event.modifiers()
        key = event.key()
        text = event.text()

        # Catch Ctrl combinations (Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+Z, etc.)
        if modifiers & Qt.KeyboardModifier.ControlModifier:
            if key == Qt.Key.Key_C:
                self.send_event("HOTKEY:ctrl:c")
                return
            elif key == Qt.Key.Key_V:
                self.send_event("HOTKEY:ctrl:v")
                return
            elif key == Qt.Key.Key_A:
                self.send_event("HOTKEY:ctrl:a")
                return
            elif key == Qt.Key.Key_Z:
                self.send_event("HOTKEY:ctrl:z")
                return
            elif key == Qt.Key.Key_X:
                self.send_event("HOTKEY:ctrl:x")
                return
            elif text:
                self.send_event(f"HOTKEY:ctrl:{text}")
                return

        # Catch Alt combinations
        if modifiers & Qt.KeyboardModifier.AltModifier and text:
            self.send_event(f"HOTKEY:alt:{text}")
            return

        # Handle Special Keys
        key_map_qt = {
            Qt.Key.Key_Return: "Return", Qt.Key.Key_Enter: "Return",
            Qt.Key.Key_Backspace: "BackSpace", Qt.Key.Key_Tab: "Tab",
            Qt.Key.Key_Space: "Space", Qt.Key.Key_Escape: "Escape",
            Qt.Key.Key_Delete: "Delete", Qt.Key.Key_Up: "Up",
            Qt.Key.Key_Down: "Down", Qt.Key.Key_Left: "Left",
            Qt.Key.Key_Right: "Right"
        }

        if key in key_map_qt:
            self.send_event(f"KEY:{key_map_qt[key]}")
        elif text:
            self.send_event(f"KEY:{text}")

    def connect_to_server(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.connect((self.target_ip, int(self.port)))
            self.sock.sendall(self.password.encode('utf-8'))
            
            response = self.sock.recv(1024).decode('utf-8')
            if response != "AUTH_OK":
                QMessageBox.critical(self, "Auth Failed", "Incorrect password.")
                self.close()
                return

            self.receiver = FrameReceiver(self.sock)
            self.receiver.frame_received.connect(self.update_display)
            self.receiver.connection_lost.connect(self.on_disconnect)
            self.receiver.start_listening()

        except Exception as e:
            QMessageBox.critical(self, "Connection Error", str(e))
            self.close()

    def update_display(self, frame_bytes):
        image = QImage.fromData(frame_bytes)
        if not image.isNull():
            self.remote_res = (image.width(), image.height())
            pixmap = QPixmap.fromImage(image)
            self.display_label.setPixmap(
                pixmap.scaled(self.display_label.size(), 
                              Qt.AspectRatioMode.KeepAspectRatio, 
                              Qt.TransformationMode.SmoothTransformation)
            )

    def on_mouse_move(self, event):
        if not self.sock or not self.display_label.pixmap():
            return
        scaled_pos = self.translate_coordinates(event.position().x(), event.position().y())
        if scaled_pos:
            self.send_event(f"MOVE:{scaled_pos[0]}:{scaled_pos[1]}")

    def on_mouse_click(self, event):
        if not self.sock:
            return
        btn = "right" if event.button() == Qt.MouseButton.RightButton else "left"
        self.send_event(f"CLICK:{btn}")

    def translate_coordinates(self, mouse_x, mouse_y):
        pixmap = self.display_label.pixmap()
        if not pixmap:
            return None

        lbl_w, lbl_h = self.display_label.width(), self.display_label.height()
        pix_w, pix_h = pixmap.width(), pixmap.height()

        offset_x = (lbl_w - pix_w) / 2
        offset_y = (lbl_h - pix_h) / 2

        if offset_x <= mouse_x <= offset_x + pix_w and offset_y <= mouse_y <= offset_y + pix_h:
            norm_x = (mouse_x - offset_x) / pix_w
            norm_y = (mouse_y - offset_y) / pix_h
            return int(norm_x * self.remote_res[0]), int(norm_y * self.remote_res[1])
        return None

    def send_event(self, cmd):
        try:
            self.sock.sendall(cmd.encode('utf-8'))
        except Exception:
            pass

    def on_disconnect(self):
        self.display_label.setText("Connection Lost.")

class ConnectionManager(QWidget):
    def __init__(self):
        super().__init__()
        self.sessions = []
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Remote Control Center")
        self.setFixedSize(350, 200)

        layout = QVBoxLayout()
        self.ip_input = QLineEdit()
        self.ip_input.setPlaceholderText("IP (e.g., 127.0.0.1)")
        layout.addWidget(self.ip_input)

        self.port_input = QLineEdit("5000")
        layout.addWidget(self.port_input)

        self.pass_input = QLineEdit("test123")
        self.pass_input.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addWidget(self.pass_input)

        btn = QPushButton("Connect")
        btn.clicked.connect(self.connect)
        layout.addWidget(btn)

        self.setLayout(layout)

    def connect(self):
        ip = self.ip_input.text().strip()
        port = self.port_input.text().strip()
        pwd = self.pass_input.text().strip()

        if ip and pwd:
            win = VNCDisplayWindow(ip, port, pwd)
            win.show()
            self.sessions.append(win)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    mgr = ConnectionManager()
    mgr.show()
    sys.exit(app.exec())