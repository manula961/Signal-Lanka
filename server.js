const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.get('/health', (_req, res) => res.json({ ok: true, project: 'evolution-of-communication' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Evolution of Communication running on http://localhost:${PORT}`));
