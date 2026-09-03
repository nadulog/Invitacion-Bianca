const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const publicFiles = new Set([
  'index.html', 'styles.css', 'script.js',
  'assets/portada.png', 'assets/cuenta-regresiva.png', 'assets/cuenta-regresiva-limpia.png', 'assets/fecha.png',
  'assets/ubicacion.png', 'assets/dress-code.png', 'assets/musica.png', 'assets/regalos.png',
  'assets/bianca-01.jpeg', 'assets/bianca-02.jpeg', 'assets/bianca-03.jpeg',
  'assets/bianca-04.jpeg', 'assets/bianca-05.jpeg', 'assets/bianca-06.jpeg',
  'assets/bianca-despedida.jpeg',
  'assets/confirmacion.png', 'assets/modal-como-llegar.png', 'assets/modal-regalos.png',
  'assets/bloomdate-logo.svg', 'assets/wonderwall.mp3', 'assets/bianca-compartir.png',
  'assets/bianca-compartir-v2.jpg', 'assets/intro-bianca.png', 'assets/bianca-whatsapp.png'
]);

http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const relative = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  if (!publicFiles.has(relative)) {
    res.writeHead(404).end('No encontrado');
    return;
  }
  const file = path.resolve(root, relative);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('No encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT) || 8765, '0.0.0.0');
