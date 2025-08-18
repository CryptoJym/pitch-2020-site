import { createServer } from 'http';
import sirv from 'sirv';
import { parse, fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { resolve as pathResolve, dirname } from 'node:path';

const isDev = true;
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = pathResolve(__dirname);
const serve = sirv(rootDir, { dev: isDev, etag: true, setHeaders });

function setHeaders(res, pathname) {
  if (pathname.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
  } else if (pathname.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
  } else if (pathname.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url);

  if (pathname === '/' || pathname === '/index.html') {
    return serve(req, res);
  }

  if (pathname === '/content/content.html') {
    try {
      const filePath = pathResolve(rootDir, 'content/content.html');
      const html = await readFile(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(html);
    } catch (e) {
      res.statusCode = 404;
      res.end('Content not found');
    }
    return;
  }

  return serve(req, res);
});

const port = process.env.PORT || 5173;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
