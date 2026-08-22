import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

  if (body.type === "confirmation") {
    return res.status(200).send(process.env.VK_CONFIRMATION_STRING);
  }
  if (body.type !== "wall_post_new") {
    return res.status(200).send("ok");
  }

  const post = body.object || {};
  const postId = `${post.owner_id}_${post.id}`;

  try {
    const { data } = await supabase
      .from("crosspost_log")
      .select("id")
      .eq("id", postId)
      .maybeSingle();
    if (data) return res.status(200).send("ok"); // дубль — пропускаем

    const text = (post.text || "").slice(0, 1024);
    const photo = (post.attachments || []).find((a: any) => a.type === "photo");
    const photoUrl = photo?.photo?.sizes?.slice(-1)[0]?.url;

    const tg = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/`;
    let tgRes: any = null;
    if (photoUrl) {
      tgRes = await (
        await fetch(tg + "sendPhoto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TG_CHANNEL_ID,
            photo: photoUrl,
            caption: text,
          }),
        })
      ).json();
    } else if (text) {
      tgRes = await (
        await fetch(tg + "sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TG_CHANNEL_ID, text }),
        })
      ).json();
    }

    await supabase.from("crosspost_log").insert({ id: postId });

    if (req.query.debug) return res.json({ posted: true, postId, tg: tgRes });
    return res.status(200).send("ok");
  } catch (e: any) {
    console.error("crosspost error", e);
    if (req.query.debug) return res.status(500).json({ error: e.message });
    return res.status(200).send("ok");
  }
}
