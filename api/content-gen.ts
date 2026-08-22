// ИИ-машина контента v4: RSS → (LLM || шаблон) → фирменная обложка → таблица
const HOOK = process.env.SHEET_HOOK_URL || "";
const BASE = "https://www.vortex-studio.ru";
const COVERS = [1, 2, 3, 4, 5, 6].map((n) => `${BASE}/covers/cover${n}.png`);

const SERVICES = [
  {
    name: "Лендинг",
    price: "15 000 ₽",
    perks: "До 7 секций, адаптив, SEO-базис, форма заявки",
  },
  {
    name: "Одностраничник",
    price: "25 000 ₽",
    perks: "До 12 секций, анимации, CRM, A/B-тест",
  },
  {
    name: "Корпоративный сайт",
    price: "60 000 ₽",
    perks: "До 20 страниц, CMS, мультиязычность",
  },
  {
    name: "Портал",
    price: "от 150 000 ₽",
    perks: "Личный кабинет, API, роли, DevOps",
  },
  {
    name: "Telegram-бот",
    price: "35 000 ₽",
    perks: "Приём заказов, автоответы, рассылки, оплата",
  },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

async function rssTitles(url: string, n: number): Promise<string[]> {
  try {
    const r = await fetch(url);
    const xml = await r.text();
    const out: string[] = [];
    const re =
      /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g;
    let m;
    while ((m = re.exec(xml)) && out.length < n) out.push(m[1].trim());
    return out;
  } catch {
    return [];
  }
}

async function llm(prompt: string): Promise<string> {
  try {
    const g = await fetch(
      "https://text.pollinations.ai/" + encodeURIComponent(prompt),
    );
    if (g.ok) {
      const t = (await g.text()).trim();
      if (t.length > 80) return t;
    }
  } catch {}
  try {
    const p = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "openai",
      }),
    });
    if (p.ok) {
      const t = (await p.text()).trim();
      if (t.length > 80) return t;
    }
  } catch {}
  return "";
}

export default async function handler(req: any, res: any) {
  const now = new Date();
  const seed = now.getDate();
  const day = now.getDay();
  let type = "news";
  if (day === 2 || day === 4) type = "service";
  if (day === 6) type = "brief";

  const titles = [
    ...(await rssTitles("https://habr.com/ru/rss/news/", 6)),
    ...(await rssTitles("https://vc.ru/rss", 6)),
  ];

  let text = "";
  let image = pick(COVERS, seed);

  if (type === "brief") {
    text = `Хочешь сайт, который продаёт? Заполни бриф за 5 минут — соберём дизайн под твою задачу с первого раза: ${BASE}/brief.html Фикс-цены без скрытых платежей. Лендинг от 15 000 ₽.`;
    image = COVERS[2];
  } else if (type === "service") {
    const s = pick(SERVICES, seed);
    const gen = await llm(
      `Ты — стильный SMM-щик веб-студии VORTEX.studio. Напиши продающий пост для VK про услугу «${s.name}» за ${s.price}. Выгоды: ${s.perks}. Тон живой, без хэштегов, 4-5 предложений, в конце CTA: бриф на vortex-studio.ru за 5 минут. Верни ТОЛЬКО текст поста.`,
    );
    text =
      gen && gen.length > 80
        ? gen
        : `${s.name} за ${s.price} — фикс-цена без скрытых платежей. ${s.perks}. Запуск от 7 дней. Бриф за 5 минут: ${BASE}/brief.html`;
    image = pick(COVERS, seed + 1);
  } else {
    if (titles.length) {
      const head = pick(titles, seed);
      const gen = await llm(
        `Ты — стильный SMM-щик веб-студии VORTEX.studio. Новость: «${head}». Напиши пост для VK в стиле ньюсджекинга: 1-2 предложения суть новости, затем вывод для владельцев сайтов, затем как VORTEX.studio это решает, мягкий CTA на vortex-studio.ru. Без хэштегов, 4-6 предложений. Верни ТОЛЬКО текст поста.`,
      );
      text =
        gen && gen.length > 80
          ? gen
          : `📰 ${head}\n\nСвежая повестка в IT — а мы о главном: сайт должен приводить клиентов, а не просто быть. Пока конкуренты читают новости, наши клиенты получают заявки: лендинг от 15 000 ₽, фикс-цена, запуск от 7 дней. Бриф за 5 минут: ${BASE}/brief.html`;
      image = pick(COVERS, seed);
    } else {
      const s = pick(SERVICES, seed);
      text = `${s.name} за ${s.price} — фикс-цена без скрытых платежей. ${s.perks}. Запуск от 7 дней. Бриф за 5 минут: ${BASE}/brief.html`;
      image = pick(COVERS, seed + 1);
      type = "service";
    }
  }

  if (HOOK) {
    await fetch(HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "content",
        type,
        text: text.slice(0, 2000),
        image,
      }),
    });
  }

  res.json({ ok: true, type, text, image, rss: titles.length });
}
