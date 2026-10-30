'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 4178);
const types = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf',
  '.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'
};
http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname); }
  catch (_) { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); return res.end('Forbidden'); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
    else if (fs.existsSync(path.join(file,'index.html'))) file = path.join(file,'index.html');
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404,{'Content-Type':'text/plain'}); return res.end('Not found'); }
  const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>process.stdout.write(`Davonium V58 preview: http://127.0.0.1:${port}/\n`));
