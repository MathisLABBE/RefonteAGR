"""Petit serveur local : reçoit des fichiers (POST /save?name=...) et les
enregistre dans le dossier d'images de la maquette."""
import http.server, os, re, sys, urllib.parse

OUT = os.path.abspath(sys.argv[1])
os.makedirs(OUT, exist_ok=True)


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = (q.get('name') or [''])[0]
        if not re.fullmatch(r'[a-z0-9-]+\.(svg|webp|jpg|png)', name):
            self.send_response(400); self._cors(); self.end_headers(); return
        data = self.rfile.read(int(self.headers.get('Content-Length') or 0))
        with open(os.path.join(OUT, name), 'wb') as f:
            f.write(data)
        self.send_response(200); self._cors(); self.end_headers()
        self.wfile.write(str(len(data)).encode())


http.server.ThreadingHTTPServer(('127.0.0.1', 8768), H).serve_forever()
