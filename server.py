from http.server import HTTPServer, BaseHTTPRequestHandler

class S(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(length)
        with open('dump.json', 'wb') as f:
            f.write(post_data)
        self.send_response(200)
        self.end_headers()
        print('DUMPED')

HTTPServer(('localhost', 9999), S).serve_forever()
