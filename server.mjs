import { createServer } from 'node:http';
import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const commentsPath = path.join(root, 'src', 'data', 'comments.json');
const distPath = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const readComments = async () => { try { return JSON.parse(await fs.readFile(commentsPath, 'utf8')); } catch { return []; } };
const send = (response, status, body, type = 'application/json; charset=utf-8') => { response.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }); response.end(body); };
const readBody = (request) => new Promise((resolve, reject) => { let raw = ''; request.on('data', (chunk) => { raw += chunk; if (raw.length > 20_000) reject(new Error('payload-too-large')); }); request.on('end', () => resolve(raw)); request.on('error', reject); });
const escapeTelegram = (value) => String(value).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') { send(response, 204, ''); return; }
  if (request.url === '/api/comments' && request.method === 'GET') { send(response, 200, JSON.stringify(await readComments())); return; }
  if (request.url === '/api/comments' && request.method === 'POST') {
    let raw = ''; request.on('data', (chunk) => { raw += chunk; }); request.on('end', async () => { try { const payload = JSON.parse(raw); if (!payload.name || !payload.email || !payload.text || !payload.rating) { send(response, 400, JSON.stringify({ error: 'Заполните все поля' })); return; } const comment = { id: `comment-${Date.now()}`, name: String(payload.name).trim(), email: String(payload.email).trim(), text: String(payload.text).trim(), rating: Number(payload.rating), createdAt: new Date().toISOString() }; const comments = [comment, ...(await readComments())]; await fs.writeFile(commentsPath, `${JSON.stringify(comments, null, 2)}\n`, 'utf8'); send(response, 201, JSON.stringify(comment)); } catch { send(response, 400, JSON.stringify({ error: 'Некорректные данные' })); } }); return;
  }
  if (request.url === '/api/booking' && request.method === 'POST') {
    try {
      if (!telegramToken || !telegramChatId) { send(response, 503, JSON.stringify({ error: 'Сервис заявок не настроен' })); return; }
      const payload = JSON.parse(await readBody(request));
      const name = String(payload.name || '').trim();
      const phone = String(payload.phone || '').trim();
      const master = String(payload.master || '').trim();
      const service = String(payload.service || '').trim();
      if (!name || !phone || (!master && !service)) { send(response, 400, JSON.stringify({ error: 'Заполните обязательные поля' })); return; }
      const text = ['<b>Новая заявка с сайта</b>', `Имя: ${escapeTelegram(name)}`, `Телефон: ${escapeTelegram(phone)}`, master && `Мастер: ${escapeTelegram(master)}`, service && `Услуга: ${escapeTelegram(service)}`].filter(Boolean).join('\n');
      const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: 'HTML' }) });
      if (!telegramResponse.ok) { console.error('Telegram rejected booking:', telegramResponse.status); send(response, 502, JSON.stringify({ error: 'Не удалось передать заявку' })); return; }
      send(response, 201, JSON.stringify({ ok: true }));
    } catch { send(response, 400, JSON.stringify({ error: 'Некорректные данные' })); }
    return;
  }
  const filePath = path.join(distPath, request.url === '/' ? 'index.html' : request.url.split('?')[0]);
  if (!existsSync(filePath)) { send(response, 404, 'Not found', 'text/plain; charset=utf-8'); return; }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' }); response.end(await fs.readFile(filePath));
}).listen(port, '0.0.0.0', () => console.log(`ПРО красоту: http://localhost:${port}`));
