"""Relais de test : affiche www.agr-tt.fr via localhost en injectant l'extension
(CSS en tête de <head>, comme le fait Chrome, puis le script de contenu)."""
import http.server, os, re, sys, urllib.request, urllib.error

EXT = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766
UPSTREAM = 'https://www.agr-tt.fr'

SHIM = b"""
(function(){
  var KEY='agrx-test-store', ch=new BroadcastChannel('agrx-test'), ls=[];
  function load(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}} }
  ch.onmessage=function(e){ ls.forEach(function(l){ l(e.data,'sync') }) };
  window.chrome=window.chrome||{};
  chrome.storage={ sync:{
    get:function(d,cb){ var v=Object.assign({},d,load()); setTimeout(function(){cb(v)},0) },
    set:function(p){ var v=Object.assign(load(),p); localStorage.setItem(KEY,JSON.stringify(v));
      var c={}; for(var k in p) c[k]={newValue:p[k]}; ch.postMessage(c); ls.forEach(function(l){ l(c,'sync') }); }
  }, onChanged:{ addListener:function(l){ ls.push(l) } } };
})();
"""

INJECT = (b'<link rel="stylesheet" href="/__agrx/styles/theme.css">'
          b'<link rel="stylesheet" href="/__agrx/styles/site.css">'
          b'<script src="/__agrx/shim.js"></script>'
          b'<script src="/__agrx/scripts/sitemap.js"></script>'
          b'<script src="/__agrx/scripts/content.js"></script>')


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _local(self):
        rel = self.path.split('?')[0][len('/__agrx/'):]
        if rel == 'shim.js':
            body, ctype = SHIM, 'text/javascript'
        else:
            p = os.path.normpath(os.path.join(EXT, rel))
            if not p.startswith(os.path.normpath(EXT)) or not os.path.isfile(p):
                self.send_error(404); return
            body = open(p, 'rb').read()
            ctype = {'.css': 'text/css', '.html': 'text/html', '.png': 'image/png'}.get(os.path.splitext(p)[1], 'text/javascript')
            if p.endswith('popup.html'):
                body = body.replace(b'<script src="popup.js">', b'<script src="/__agrx/shim.js"></script><script src="popup.js">')
        self.send_response(200)
        self.send_header('Content-Type', ctype + '; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy(self, method):
        if self.path.startswith('/__agrx/'):
            return self._local()
        data = None
        if method == 'POST':
            data = self.rfile.read(int(self.headers.get('Content-Length') or 0))
        req = urllib.request.Request(UPSTREAM + self.path, data=data, method=method)
        for h in ('Content-Type', 'Cookie', 'User-Agent', 'Accept', 'Accept-Language'):
            if self.headers.get(h):
                req.add_header(h, self.headers[h])
        req.add_header('Accept-Encoding', 'identity')
        try:
            resp = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as e:
            resp = e
        body = resp.read()
        ctype = resp.headers.get('Content-Type', '')
        if 'text/html' in ctype:
            body = re.sub(rb'(<head[^>]*>)', lambda m: m.group(1) + INJECT, body, count=1, flags=re.I)
            body = body.replace(b'https://www.agr-tt.fr/agrtt68/index.php', b'/agrtt68/index.php')
        self.send_response(resp.status if hasattr(resp, 'status') else resp.code)
        for k, v in resp.headers.items():
            if k.lower() in ('content-type', 'set-cookie', 'location'):
                if k.lower() == 'location':
                    v = v.replace(UPSTREAM, '')
                self.send_header(k, v)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._proxy('GET')

    def do_POST(self):
        self._proxy('POST')


http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
