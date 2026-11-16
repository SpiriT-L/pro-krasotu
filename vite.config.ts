import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// @ts-expect-error Vite loads this config in a Node runtime; the app does not need Node types.
import { promises as fs } from 'node:fs';
// @ts-expect-error Vite loads this config in a Node runtime; the app does not need Node types.
import path from 'node:path';

const commentsPath = path.resolve('src/data/comments.json');
const escapeTelegram = (value: string) => value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] || character);

type MiddlewareRequest = {
  method?: string;
  url?: string;
  on: (event: 'data' | 'end', listener: (chunk?: unknown) => void) => void;
};

type MiddlewareResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type MiddlewareNext = () => void;
type Middleware = (request: MiddlewareRequest, response: MiddlewareResponse, next: MiddlewareNext) => void;
type DevServer = { middlewares: { use: (handler: Middleware) => void } };
type JsonObject = Record<string, unknown>;

function commentsApi() {
  return {
    name: 'comments-api',
    configureServer(server: DevServer) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api/comments')) { next(); return; }
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        try {
          const comments = JSON.parse(await fs.readFile(commentsPath, 'utf8'));
          if (request.method === 'GET') { response.statusCode = 200; response.end(JSON.stringify(comments)); return; }
          if (request.method === 'POST') {
            let raw = '';
            request.on('data', (chunk: unknown) => { raw += String(chunk); });
            request.on('end', async () => {
              try {
                const payload = JSON.parse(raw) as JsonObject;
                if (!payload.name || !payload.email || !payload.text || !payload.rating) { response.statusCode = 400; response.end(JSON.stringify({ error: 'Заполните все поля' })); return; }
                const comment = { id: `comment-${Date.now()}`, name: String(payload.name).trim(), email: String(payload.email).trim(), text: String(payload.text).trim(), rating: Number(payload.rating), createdAt: new Date().toISOString() };
                await fs.writeFile(commentsPath, `${JSON.stringify([comment, ...comments], null, 2)}\n`, 'utf8');
                response.statusCode = 201; response.end(JSON.stringify(comment));
              } catch { response.statusCode = 400; response.end(JSON.stringify({ error: 'Некорректные данные' })); }
            });
            return;
          }
        } catch { response.statusCode = 500; response.end(JSON.stringify({ error: 'Не удалось прочитать comments.json' })); }
      });
    },
  };
}

function bookingApi(telegramToken: string, telegramChatId: string) {
  return {
    name: 'booking-api',
    configureServer(server: DevServer) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url !== '/api/booking' || request.method !== 'POST') { next(); return; }
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        try {
          let raw = '';
          request.on('data', (chunk: unknown) => { raw += String(chunk); });
          request.on('end', async () => {
            try {
              const payload = JSON.parse(raw) as JsonObject;
              const name = String(payload.name || '').trim();
              const phone = String(payload.phone || '').trim();
              const master = String(payload.master || '').trim();
              const service = String(payload.service || '').trim();
              if (!telegramToken || !telegramChatId) { response.statusCode = 503; response.end(JSON.stringify({ error: 'Telegram не настроен' })); return; }
              if (!name || !phone || (!master && !service)) { response.statusCode = 400; response.end(JSON.stringify({ error: 'Заполните обязательные поля' })); return; }
              const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: telegramChatId, text: `<b>Новая заявка с сайта</b>\nИмя: ${escapeTelegram(name)}\nТелефон: ${escapeTelegram(phone)}\n${master ? `Мастер: ${escapeTelegram(master)}\n` : ''}${service ? `Услуга: ${escapeTelegram(service)}` : ''}`, parse_mode: 'HTML' }) });
              if (!telegramResponse.ok) { response.statusCode = 502; response.end(JSON.stringify({ error: 'Telegram отклонил заявку' })); return; }
              response.statusCode = 201; response.end(JSON.stringify({ ok: true }));
            } catch { response.statusCode = 400; response.end(JSON.stringify({ error: 'Некорректные данные' })); }
          });
        } catch { response.statusCode = 500; response.end(JSON.stringify({ error: 'Ошибка сервера' })); }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), commentsApi(), bookingApi(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID)],
  };
});
