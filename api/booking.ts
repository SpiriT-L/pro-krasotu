type BookingPayload = {
  name?: unknown;
  phone?: unknown;
  master?: unknown;
  service?: unknown;
};

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

const escapeTelegram = (value: string) => value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] || character);

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Метод не поддерживается' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    response.status(503).json({ error: 'Telegram не настроен' });
    return;
  }

  const payload = request.body as BookingPayload;
  const name = String(payload?.name || '').trim();
  const phone = String(payload?.phone || '').trim();
  const master = String(payload?.master || '').trim();
  const service = String(payload?.service || '').trim();

  if (!name || !phone || (!master && !service)) {
    response.status(400).json({ error: 'Заполните обязательные поля' });
    return;
  }

  const message = [
    '<b>Новая заявка с сайта</b>',
    `Имя: ${escapeTelegram(name)}`,
    `Телефон: ${escapeTelegram(phone)}`,
    master && `Мастер: ${escapeTelegram(master)}`,
    service && `Услуга: ${escapeTelegram(service)}`,
  ].filter(Boolean).join('\n');

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });

  if (!telegramResponse.ok) {
    console.error('Telegram rejected booking:', telegramResponse.status);
    response.status(502).json({ error: 'Не удалось передать заявку' });
    return;
  }

  response.status(201).json({ ok: true });
}
