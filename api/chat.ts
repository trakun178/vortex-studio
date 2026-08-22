import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: any, res: any) {
  // ── GET: история диалога для виджета ──
  if (req.method === "GET") {
    const visitor = req.query.visitor as string;
    if (!visitor) return res.status(400).json({ error: "no visitor" });
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, sender, text, created_at")
      .eq("visitor_id", visitor)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ messages: data || [] });
  }

  // ── POST: сообщение посетителя ──
  if (req.method === "POST") {
    const { visitor_id, message, contact } = req.body || {};
    if (!visitor_id || !message)
      return res.status(400).json({ error: "bad request" });

    const { error } = await supabase
      .from("chat_messages")
      .insert({ visitor_id, sender: "visitor", text: message });
    if (error) return res.status(500).json({ error: error.message });

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const text =
        `💬 ЧАТ НА САЙТЕ\nСообщение: ${message}\n` +
        `Контакт: ${contact || "не указан"}\n\n` +
        `↩️ Ответь НА ЭТО сообщение — ответ появится в чате на сайте.`;
      try {
        const r = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text,
            }),
          },
        );
        const d = await r.json();
        if (d.ok && d.result?.message_id) {
          await supabase
            .from("chat_threads")
            .insert({ tg_message_id: d.result.message_id, visitor_id });
        }
      } catch {}
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
