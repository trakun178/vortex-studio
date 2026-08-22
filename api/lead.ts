// api/lead.ts — форма -> Resend (почта) + Telegram (опционально)

export default async function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { name, company, email, phone, message, budget, website } =
    req.body || {};

  // Honeypot: боты заполняют, люди — нет
  if (website) return res.status(200).json({ ok: true });
  if (!name || !email)
    return res.status(400).json({ error: "Имя и email обязательны" });

  // ── 2. Уведомление в Telegram (если указаны токены) ──
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text =
      `🟢 ЗАЯВКА С САЙТА\n` +
      `Имя: ${name}\nEmail: ${email}\nТел: ${phone || "—"}\n` +
      `Услуга: ${budget || "—"}\nЗадача: ${message || "—"}`;
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      },
    ).catch(() => {}); // если TG упал — письмо всё равно ушло
  }

  // ── 1. Письмо на твою почту через Resend ──
  const html = `
    <h2>🟢 Новая заявка с сайта VORTEX.studio</h2>
    <p><b>Имя:</b> ${esc(name)}</p>
    <p><b>Компания:</b> ${esc(company || "—")}</p>
    <p><b>Email:</b> ${esc(email)}</p>
    <p><b>Телефон:</b> ${esc(phone || "—")}</p>
    <p><b>Услуга:</b> ${esc(budget || "не указана")}</p>
    <p><b>Задача:</b><br>${esc(message || "—")}</p>
  `;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "VORTEX.studio <onboarding@resend.dev>",
      to: [process.env.LEAD_EMAIL_TO],
      subject: `🟢 Заявка: ${name} · ${budget || "Услуга не указана"}`,
      html,
    }),
  });

  if (!r.ok) {
    console.error("Resend error:", await r.json());
    return res.status(500).json({ error: "Не удалось отправить заявку" });
  }

  return res.status(200).json({ ok: true });
}

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
