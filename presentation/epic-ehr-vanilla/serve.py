"""Serve the vanilla Epic EHR frontend using the shared FastAPI backend.
Start the FastAPI backend on port 8000 first, then run this to serve
the vanilla HTML/CSS/JS on port 3000 with API proxying to the backend.
"""
import http.server
import socketserver
import urllib.request
import os

PORT = 3000
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")
BACKEND = "http://localhost:8000"


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            self.send_error(404)

    def _proxy(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length > 0 else None
            req = urllib.request.Request(
                f"{BACKEND}{self.path}",
                data=body,
                headers={"Content-Type": "application/json"} if body else {},
                method=self.command,
            )
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
        except Exception as e:
            self.send_error(502, str(e))

    def log_message(self, format, *args):
        pass  # Quiet logging


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
        print(f"Vanilla Epic EHR serving at http://localhost:{PORT}")
        print(f"Proxying /api/* to {BACKEND}")
        httpd.serve_forever()
