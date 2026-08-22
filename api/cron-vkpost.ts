// api/cron-vkpost.ts — пост дня из очереди + одобренный AI-контент с обложкой
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = "",
    row: string[] = [],
    inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (ch !== "\r") cur += ch;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function normDate(s: string) {
  const t = (s || "").trim();
  const m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return t;
}

async function uploadImageToVk(url: string): Promise<string> {
  const gid = String(process.env.VK_GROUP_ID).replace("-", "");
  const su = await (
    await fetch(
      `https://api.vk.com/method/photos.getWallUploadServer?access_token=${process.env.VK_GROUP_TOKEN}&v=5.131&group_id=${gid}`,
    )
  ).json();
  if (su.error) throw new Error("getServer: " + su.error.error_msg);
  const uploadUrl = su.response?.upload_url;
  if (!uploadUrl) throw new Error("no upload_url");

  const img = await fetch(url);
  if (!img.ok) throw new Error("img fetch " + img.status);
  const ctype = (img.headers.get("content-type") || "image/jpeg").split(";")[0];
  const ext = ctype.includes("png")
    ? "png"
    : ctype.includes("webp")
      ? "webp"
      : "jpg";
  const buf = await img.arrayBuffer();
  const fd = new FormData();
  fd.append("photo", new Blob([buf], { type: ctype }), "cover." + ext);

  const up = await (
    await fetch(uploadUrl, { method: "POST", body: fd })
  ).json();
  if (up.error) throw new Error("upload: " + JSON.stringify(up.error));
  if (!up.photo) throw new Error("upload: " + JSON.stringify(up).slice(0, 200));

  const sv = await (
    await fetch(
      `https://api.vk.com/method/photos.saveWallPhoto?access_token=${process.env.VK_GROUP_TOKEN}&v=5.131&photo=${encodeURIComponent(up.photo)}&server=${up.server}&hash=${up.hash}`,
    )
  ).json();
  if (sv.error) throw new Error("save: " + sv.error.error_msg);
  const p = sv.response?.[0];
  if (!p) throw new Error("save: empty");
  return `photo${p.owner_id}_${p.id}`;
}

async function postApprovedContent(): Promise<any> {
  const hook = process.env.SHEET_HOOK_URL || "";
  if (!hook) return { skipped: "no hook" };
  let list: any;
  try {
    list = await (await fetch(hook)).json();
  } catch (e: any) {
    return { error: "hook: " + e.message };
  }
  const approved = (list.rows || []).filter(
    (r: any) => String(r.status).trim().toLowerCase() === "ok",
  );
  if (!approved.length) return { approved: 0 };
  const r = approved[0];
  let attachment = "";
  let uploadErr = "";
  if (r.image) {
    try {
      attachment = await uploadImageToVk(String(r.image));
    } catch (e: any) {
      uploadErr = e.message;
    }
  }
  const params = new URLSearchParams({
    access_token: process.env.VK_GROUP_TOKEN!,
    v: "5.131",
    owner_id: process.env.VK_GROUP_ID!,
    message: String(r.text || "").slice(0, 4096),
    from_group: "1",
  });
  if (attachment) params.set("attachment", attachment);
  const vk = await (
    await fetch(`https://api.vk.com/method/wall.post?${params}`)
  ).json();
  await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mark", row: r.row, status: "posted" }),
  });
  return { approved: approved.length, posted: true, attachment, uploadErr, vk };
}

export default async function handler(req: any, res: any) {
  const okAuth =
    req.headers.authorization === `Bearer ${process.env.CRON_SECRET}` ||
    req.query.key === process.env.CRON_SECRET;
  if (!okAuth) return res.status(401).json({ error: "unauthorized" });

  // AI-контент: постим одну одобренную строку (status=ok) с обложкой
  const content = await postApprovedContent().catch((e: any) => ({
    error: e.message,
  }));

  try {
    const raw = await (await fetch(process.env.VK_QUEUE_CSV_URL!)).text();
    const csv = raw.replace(/^\uFEFF/, "");
    const rows = parseCsv(csv);
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const di = head.indexOf("date");
    const ti = head.indexOf("text");
    const li = head.indexOf("link");

    // ДИАГНОСТИКА: ?key=…&debug=1 — что сервер видит в таблице
    if (req.query.debug) {
      return res.json({
        serverToday: new Date().toLocaleDateString("sv-SE"),
        head,
        firstRows: rows
          .slice(1, 4)
          .map((r) => ({ date: r[di], text: (r[ti] || "").slice(0, 30) })),
        content,
      });
    }

    const today =
      (req.query.date as string) || new Date().toLocaleDateString("sv-SE");
    const row = rows.slice(1).find((r) => normDate(r[di]) === today);
    if (!row)
      return res.json({
        ok: true,
        posted: false,
        reason: "нет поста на сегодня",
        today,
        content,
      });

    let message = (row[ti] || "").trim();
    if (li >= 0 && row[li]?.trim()) message += `\n\n${row[li].trim()}`;
    const params = new URLSearchParams({
      access_token: process.env.VK_GROUP_TOKEN!,
      v: "5.131",
      owner_id: process.env.VK_GROUP_ID!,
      message,
      from_group: "1",
    });
    const vk = await (
      await fetch(`https://api.vk.com/method/wall.post?${params}`)
    ).json();
    return res.json({ ok: true, posted: true, vk, content });
  } catch (e: any) {
    return res.status(500).json({ error: e.message, content });
  }
}
