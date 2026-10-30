'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 8080);
const types = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8', '.cjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2',
  '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml; charset=utf-8', '.pdf':'application/pdf'
};
const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, {'Allow':'GET, HEAD'}); return res.end('Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  const target = path.resolve(root, '.' + pathname);
  if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(target, (statErr, stat) => {
    if (statErr || !stat.isFile()) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'X-Content-Type-Options':'nosniff',
      'Cache-Control':'no-store'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`Davonium V56 preview: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
