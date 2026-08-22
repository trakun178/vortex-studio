export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  let body: any = req.body;
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object") body = {};

  const { title, text, prompt } = body;
  const tg = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/`;
  const chat = process.env.TELEGRAM_CHAT_ID;

  const send = (t: string) =>
    fetch(tg + "sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: t.slice(0, 4096) }),
    });

  await send(`📋 Новый бриф: ${title}\n\n${text}`);
  if (prompt) await send(`🎨 Промт для Figma:\n${prompt}`);

  res.json({ ok: true });
}
