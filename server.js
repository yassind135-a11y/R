/* خادم معاينة محلي بسيط بدون أي اعتماديات — لأغراض التطوير فقط.
   يمرّر وسائط --port / --host القادمة من سطر الأوامر. */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

/* قراءة وسيط من سطر الأوامر بصيغة --name value أو --name=value */
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(name + '='));
  if (eq) return eq.split('=')[1];
  return fallback;
}

const port = Number(arg('--port', arg('-p', process.env.PORT || 7100)));
const host = arg('--host', process.env.HOST || '127.0.0.1');
const root = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json; charset=utf-8',
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    });
  })
  .listen(port, host, () => {
    console.log(`Apology Garden running at http://${host}:${port}/`);
  });
