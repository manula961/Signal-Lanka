const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const eras = [
  { id: 1, slug: 'ancient', title: 'පුරාණ යුගය', englishTitle: 'Ancient Era', includes: ['oral and visual signals', 'inscriptions', 'ola manuscripts'] },
  { id: 2, slug: 'middle', title: 'මධ්‍ය යුගය', englishTitle: 'Middle Era', includes: ['printing', 'telegraph', 'telephone', 'radio'] },
  { id: 3, slug: 'modern', title: 'නූතන යුගය', englishTitle: 'Modern Era', includes: ['mobile', 'internet', 'cloud', 'AI'] }
];

const experience = {
  title: 'Signal Lanka — Communication Museum',
  version: '12.0.0',
  mode: 'interactive-museum-spa',
  languages: ['si', 'en'],
  features: [
    'three-era-story', 'interactive-simulations', 'bilingual-content', 'archive-photography',
    'interactive-signal-labs', 'responsive-layout', 'accessible-dialogs',
    'communication-time-machine', '60-second-challenge', 'keyboard-navigation'
  ],
  eras: eras.length
};

const timeline = [
  { era: 1, label: 'Ancient Era', transformation: 'Voice, gesture and visible signals evolve into durable inscriptions and manuscript records.' },
  { era: 2, label: 'Middle Era', transformation: 'Printing multiplies messages while telegraph, telephone and radio accelerate them across distance.' },
  { era: 3, label: 'Modern Era', transformation: 'Communication converges into mobile, internet and AI-powered software systems.' }
];

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
};

function writeHeaders(res, statusCode, headers = {}) {
  res.writeHead(statusCode, { ...securityHeaders, ...headers });
}

function sendJson(req, res, statusCode, value) {
  const body = JSON.stringify(value);
  writeHeaders(res, statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  if (req.method === 'HEAD') return res.end();
  res.end(body);
}

function sendText(req, res, statusCode, text) {
  const body = String(text);
  writeHeaders(res, statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  if (req.method === 'HEAD') return res.end();
  res.end(body);
}

function isInsidePublicDir(filePath) {
  const relative = path.relative(publicDir, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function serveFile(req, res, filePath, { spaFallback = false } = {}) {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      if (!spaFallback) return sendText(req, res, 404, 'Not Found');
      const fallback = path.join(publicDir, 'index.html');
      return fs.readFile(fallback, (fallbackErr, data) => {
        if (fallbackErr) return sendText(req, res, 500, 'Internal Server Error');
        writeHeaders(res, 200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': data.length,
          'Cache-Control': 'no-store, max-age=0'
        });
        if (req.method === 'HEAD') return res.end();
        res.end(data);
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    writeHeaders(res, 200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': ['.html', '.css', '.js'].includes(ext) ? 'no-store, max-age=0' : 'public, max-age=3600'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath)
      .on('error', () => {
        if (!res.headersSent) sendText(req, res, 500, 'Internal Server Error');
        else res.destroy();
      })
      .pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return sendJson(req, res, 405, { error: 'Method not allowed' });
  }

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  } catch {
    return sendJson(req, res, 400, { error: 'Bad request' });
  }

  if (url.pathname === '/api/health') return sendJson(req, res, 200, { ok: true, app: 'signal-lanka', version: experience.version, runtime: `Node ${process.version}`, timestamp: new Date().toISOString() });
  if (url.pathname === '/api/eras') return sendJson(req, res, 200, eras);
  if (url.pathname === '/api/experience') return sendJson(req, res, 200, experience);
  if (url.pathname === '/api/timeline') return sendJson(req, res, 200, timeline);

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return sendJson(req, res, 400, { error: 'Malformed URL encoding' });
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const normalizedPath = path.normalize(requestedPath).replace(/^([/\\]*\.\.[/\\])+/, '');
  const filePath = path.join(publicDir, normalizedPath);

  if (filePath !== publicDir && !isInsidePublicDir(filePath)) {
    return sendJson(req, res, 403, { error: 'Forbidden' });
  }

  const ext = path.extname(filePath).toLowerCase();
  const looksLikeAsset = Boolean(ext);
  serveFile(req, res, filePath, { spaFallback: !looksLikeAsset });
});

server.listen(PORT, HOST, () => {
  console.log(`Signal Lanka running at http://localhost:${PORT}`);
});
