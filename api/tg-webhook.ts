// api/tg-webhook.ts — прокси: Telegram получает мгновенный 200,
// апдейт улетает в Apps Script (тот сам не умеет отвечать TG без редиректа)
const APPS_EXEC =
  "https://script.google.com/macros/s/AKfycbxEJymh4AhHWhrp9AhvZuXqt-AikkntLYdmxqleBQ9XwwU-00A7hTqOMTLFFapEGqcc/exec";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(200).json({ ok: true });
  try {
    const body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    await fetch(APPS_EXEC, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
  } catch (e) {}
  return res.status(200).json({ ok: true });
}
