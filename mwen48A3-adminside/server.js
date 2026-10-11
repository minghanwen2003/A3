import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const port = Number(process.env.PORT || 5501);
const applicationPrefix = '/admin';

function localPath(url) {
  const requested = decodeURIComponent((url || '/').split('?')[0]);
  if (requested === applicationPrefix || requested.startsWith(`${applicationPrefix}/`)) {
    return requested.slice(applicationPrefix.length) || '/';
  }
  return requested;
}

http.createServer((req, res) => {
  const requested = localPath(req.url);
  const file = path.join(root, requested === '/' ? 'index.html' : requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Admin site listening on http://localhost:${port}`));
