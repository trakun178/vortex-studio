import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: any, res: any) {
  const msg = req.body?.message;

  if (msg?.reply_to_message && msg.text) {
    const origId = msg.reply_to_message.message_id;
    const { data } = await supabase
      .from("chat_threads")
      .select("visitor_id")
      .eq("tg_message_id", origId)
      .maybeSingle();

    if (data) {
      await supabase.from("chat_messages").insert({
        visitor_id: data.visitor_id,
        sender: "owner",
        text: msg.text,
      });

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: "✅ Ответ доставлен в чат на сайте",
          }),
        },
      ).catch(() => {});
    }
  }

  return res.status(200).json({ ok: true });
}
