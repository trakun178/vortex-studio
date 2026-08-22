import { useState, useEffect, useRef } from "react";

// Бэкенд (Google Apps Script): заявки, чат, брифы
const API_HOOK =
  "https://script.google.com/macros/s/AKfycby4DzKTWZIwHI5SwRGBUtBhlP1reXwr6dzKYAzoMsk3vl4IueLFExNMyYImAfkiS0R5/exec";

// ── Data ───────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Услуги", "Портфолио", "Тарифы", "Контакты"];

const PRICING: {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  featured: boolean;
  tag?: string;
}[] = [
  {
    name: "Лендинг",
    price: "15 000",
    period: "разово",
    desc: "Одностраничный продающий сайт для запуска продукта или услуги.",
    features: [
      "До 7 секций",
      "Адаптивная верстка",
      "SEO-базис",
      "Форма заявки",
      "2 правки",
    ],
    featured: false,
  },
  {
    name: "Одностраничник",
    price: "25 000",
    period: "разово",
    desc: "Расширенный лендинг с анимацией и интеграцией CRM.",
    features: [
      "До 12 секций",
      "Анимация на scroll",
      "CRM-интеграция",
      "A/B-тест",
      "5 правок",
    ],
    featured: false,
  },
  {
    name: "Корпоративный",
    price: "60 000",
    period: "разово",
    desc: "Полноценный корпоративный сайт с CMS и мультиязычностью.",
    features: [
      "До 20 страниц",
      "CMS-панель",
      "Мультиязычность",
      "Поиск по сайту",
      "Безлимит правок",
    ],
    featured: true,
  },
  {
    name: "Портал",
    price: "от 150 000",
    period: "разово",
    desc: "Веб-приложение с личным кабинетом, API и масштабируемой архитектурой.",
    features: [
      "Личный кабинет",
      "REST API",
      "Роли и права",
      "Уведомления",
      "DevOps CI/CD",
    ],
    featured: false,
  },
  {
    name: "Telegram-бот",
    price: "35 000",
    period: "разово",
    desc: "Умный бот для бизнеса: приём заказов, автоответы, рассылки и платежи.",
    features: [
      "Приём заказов",
      "Автоответы / FAQ",
      "Рассылка контента",
      "Интеграция CRM",
      "Оплата в чате",
    ],
    featured: false,
    tag: "TG",
  },
];

const SUBSCRIPTIONS = [
  {
    name: "База",
    price: "10 000",
    color: "#4a6070",
    perks: ["1 задача в месяц", "Техподдержка 8/5", "Хостинг включён"],
  },
  {
    name: "Контент",
    price: "20 000",
    color: "#39ff6e",
    perks: [
      "5 задач в месяц",
      "Техподдержка 24/7",
      "Хостинг + SSL",
      "Аналитика",
    ],
  },
  {
    name: "Про",
    price: "59 900",
    color: "#7c6cfa",
    perks: [
      "Безлимит задач",
      "Выделенный PM",
      "Серверы в РФ",
      "AI-оптимизация",
    ],
  },
];

const PORTFOLIO = [
  {
    title: "Шабашка DNR",
    category: "Портал · объявления, парсинг, админка",
    year: "2026",
    img: "/img/shabashka.png",
    link: "https://shabashka.sofoniya.ru",
  },
  {
    title: "MedCore",
    category: "Медицина / Корп. сайт",
    year: "2024",
    img: "https://images.unsplash.com/photo-1520583457224-aee11bad5112?w=600&h=400&fit=crop&auto=format",
  },
  {
    title: "LoftStudio",
    category: "Дизайн / Лендинг",
    year: "2025",
    img: "https://images.unsplash.com/photo-1735948055457-8d816fb80a87?w=600&h=400&fit=crop&auto=format",
  },
  {
    title: "TradePulse",
    category: "Биржа / SaaS",
    year: "2025",
    img: "https://images.unsplash.com/photo-1650661926447-9efb2610f64c?w=600&h=400&fit=crop&auto=format",
  },
  {
    title: "AgroNet",
    category: "АПК / Корп. сайт",
    year: "2025",
    img: "https://images.unsplash.com/photo-1621111848501-8d3634f82336?w=600&h=400&fit=crop&auto=format",
  },
  {
    title: "NovaTech",
    category: "IT / Портал",
    year: "2026",
    img: "https://images.unsplash.com/photo-1615803697515-3cb782c2a65a?w=600&h=400&fit=crop&auto=format",
  },
];

// ── Components ───────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{ fontFamily: "var(--font-display)" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e2d3d] bg-[#080b0f]/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-[#39ff6e] flex items-center justify-center">
            <span className="text-[#080b0f] text-xs font-black leading-none">
              AI
            </span>
          </div>
          <span className="text-[#e8eef4] font-bold text-lg tracking-tight">
            VORTEX<span className="text-[#39ff6e]">.studio</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm text-[#7a9ab0] hover:text-[#39ff6e] transition-colors duration-200 tracking-wide"
            >
              {l}
            </a>
          ))}
        </nav>

        <a
          href="#контакты"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#080b0f] bg-[#39ff6e] rounded hover:bg-[#5aff8a] transition-colors duration-200"
        >
          Заказать сайт
        </a>

        <button
          className="md:hidden text-[#7a9ab0] hover:text-[#e8eef4]"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <>
                <line
                  x1="4"
                  y1="4"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="4"
                  x2="4"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <line
                  x1="3"
                  y1="6"
                  x2="19"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="11"
                  x2="19"
                  y2="11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="16"
                  x2="19"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#1e2d3d] bg-[#0e1318] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-[#7a9ab0] hover:text-[#39ff6e] text-sm transition-colors"
            >
              {l}
            </a>
          ))}
          <a
            href="#контакты"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#080b0f] bg-[#39ff6e] rounded"
          >
            Заказать сайт
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      id="услуги"
      className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden grid-bg"
    >
      {/* Neon radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "55%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #39ff6e18 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "5%",
          left: "15%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, #7c6cfa10 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#39ff6e30] bg-[#39ff6e08]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff6e] animate-pulse" />
                <span className="text-[#39ff6e] text-xs tracking-widest uppercase">
                  AI-powered веб-студия
                </span>
              </div>
              {[
                { label: "Сайты", color: "#39ff6e" },
                { label: "Порталы", color: "#7c6cfa" },
                { label: "TG-боты", color: "#229ed9" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: badge.color,
                    background: badge.color + "15",
                    border: `1px solid ${badge.color}30`,
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            <h1
              className="neon-glow text-5xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-[#e8eef4] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Сайты, которые
              <br />
              <span className="text-[#39ff6e]">продают</span>
              <br />
              сами.
            </h1>

            <p className="text-[#7a9ab0] text-lg leading-relaxed max-w-md mb-10">
              Разрабатываем корпоративные сайты, порталы и лендинги с помощью
              генеративного ИИ. Быстро, точно, без лишних итераций.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#контакты"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#39ff6e] text-[#080b0f] font-bold rounded hover:bg-[#5aff8a] transition-all duration-200 hover:shadow-[0_0_30px_#39ff6e40]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Обсудить проект
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="#портфолио"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#1e2d3d] text-[#7a9ab0] font-semibold rounded hover:border-[#39ff6e40] hover:text-[#e8eef4] transition-all duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Смотреть работы
              </a>
            </div>
          </div>

          {/* Right — terminal card */}
          <div className="relative">
            <div className="rounded-xl border border-[#1e2d3d] bg-[#0e1318] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d3d] bg-[#141c24">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span
                  className="ml-3 text-[#4a6070] text-xs"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  vortex — генерация проекта
                </span>
              </div>
              <div
                className="p-6"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                <p className="text-[#4a6070]">
                  $ vortex init --type=corporate --ai=on
                </p>
                <p className="text-[#39ff6e]">✔ Анализ брифа завершён</p>
                <p className="text-[#39ff6e]">✔ Архитектура сгенерирована</p>
                <p className="text-[#39ff6e]">✔ Дизайн-система применена</p>
                <p className="text-[#39ff6e]">✔ SEO-структура оптимизирована</p>
                <p className="text-[#7a9ab0]">→ Деплой на сервер...</p>
                <p className="text-[#e8eef4] mt-2">
                  🟢 Сайт готов:{" "}
                  <span className="text-[#39ff6e]">https://yoursite.ru</span>
                </p>
                <p className="text-[#4a6070] mt-2">
                  Время: 14 дней · Бюджет: в рамках
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { v: "от 3 дн", l: "запуск лендинга" },
                { v: "AI-first", l: "скорость и точность" },
                { v: "24/7", l: "поддержка по подписке" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg border border-[#1e2d3d] bg-[#0e1318] p-4 text-center"
                >
                  <p
                    className="text-2xl font-black text-[#39ff6e]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.v}
                  </p>
                  <p className="text-[#4a6070] text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function Pricing() {
  const [items, setItems] = useState(PRICING);

  useEffect(() => {
    fetch("/prices.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setItems(
          data.map((d: any) => ({
            name: d.label,
            price: String(d.price).replace(/₽/g, "").trim(),
            period: "разово",
            desc: d.desc,
            features: d.features,
            featured: d.badge === "ПОПУЛЯРНЫЙ",
            tag: d.badge === "TELEGRAM" ? "TG" : "",
          })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <section id="тарифы" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionLabel>Стоимость</SectionLabel>
        <h2
          className="text-4xl md:text-5xl font-black text-[#e8eef4] mb-4 mt-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Прозрачные цены
        </h2>
        <p className="text-[#7a9ab0] text-lg mb-14 max-w-xl">
          Фиксированная стоимость без скрытых платежей. Выбирайте формат под
          задачу.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {items.map((p) => (
            <div
              key={p.name}
              className={`card-glow relative rounded-xl border bg-[#0e1318] p-6 flex flex-col transition-all duration-300 ${
                p.featured
                  ? "border-[#39ff6e50] bg-[#0e1a10]"
                  : p.tag === "TG"
                    ? "border-[#229ed950] hover:border-[#229ed980]"
                    : "border-[#1e2d3d] hover:border-[#2e4050]"
              }`}
            >
              {p.tag === "TG" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs font-bold tracking-wide flex items-center gap-1.5"
                    style={{
                      background: "#229ed9",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                    </svg>
                    TELEGRAM
                  </span>
                </div>
              )}
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="px-3 py-1 rounded-full bg-[#39ff6e] text-[#080b0f] text-xs font-bold tracking-wide"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ПОПУЛЯРНЫЙ
                  </span>
                </div>
              )}
              <p
                className="text-xs font-semibold text-[#4a6070] tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {p.name}
              </p>
              <div className="mb-4">
                <span
                  className="text-3xl font-black"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: p.featured
                      ? "#39ff6e"
                      : p.tag === "TG"
                        ? "#229ed9"
                        : "#e8eef4",
                  }}
                >
                  {p.price} ₽
                </span>
                <span className="text-[#4a6070] text-sm ml-1">
                  / {p.period}
                </span>
              </div>
              <p className="text-[#7a9ab0] text-sm leading-relaxed mb-6">
                {p.desc}
              </p>
              <ul className="flex-1 space-y-2.5 mb-8">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[#b0c8d8]"
                  >
                    <svg
                      className="mt-0.5 shrink-0"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="#39ff6e"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4.5 7l2 2 3-3"
                        stroke="#39ff6e"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`/brief.html?service=${p.name === "Лендинг" ? "landing" : p.name === "Одностраничник" ? "onepage" : p.name === "Корпоративный" ? "corporate" : p.name === "Портал" ? "portal" : "bot"}`}
                target="_blank"
                className={`block text-center py-2.5 rounded text-sm font-semibold transition-all duration-200 ${
                  p.featured
                    ? "bg-[#39ff6e] text-[#080b0f] hover:bg-[#5aff8a] hover:shadow-[0_0_20px_#39ff6e40]"
                    : p.tag === "TG"
                      ? "bg-[#229ed9] text-white hover:bg-[#3ab8f0] hover:shadow-[0_0_20px_#229ed940]"
                      : "border border-[#1e2d3d] text-[#7a9ab0] hover:border-[#39ff6e40] hover:text-[#e8eef4]"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                Выбрать
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Subscriptions() {
  const [active, setActive] = useState("Контент"); // ← дефолт «Контент»

  return (
    <section className="py-20 bg-[#0a0e14] border-y border-[#1e2d3d]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>Подписки</SectionLabel>
            <h2
              className="text-4xl md:text-5xl font-black text-[#e8eef4] mt-3 mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Сопровождение
              <br />
              <span className="text-[#39ff6e]">и поддержка</span>
            </h2>
            <p className="text-[#7a9ab0] leading-relaxed max-w-md">
              Мы не исчезаем после сдачи сайта. Выберите формат постоянной
              поддержки — от базового мониторинга до выделенной команды.
            </p>

            <div className="mt-10 space-y-3">
              {SUBSCRIPTIONS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setActive(s.name)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border text-left transition-all duration-200 ${
                    active === s.name
                      ? "border-[#39ff6e50] bg-[#0e1a10]"
                      : "border-[#1e2d3d] bg-[#0e1318] hover:border-[#2e4050]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: s.color }}
                    />
                    <span
                      className="font-bold text-[#e8eef4]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {s.name}
                    </span>
                  </div>
                  <span
                    className="font-black text-lg"
                    style={{
                      color: active === s.name ? s.color : "#4a6070",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {s.price} ₽/мес
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {SUBSCRIPTIONS.filter((s) => s.name === active).map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-[#1e2d3d] bg-[#0e1318] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: s.color }}
                />
                <h3
                  className="text-xl font-black text-[#e8eef4]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Тариф «{s.name}»
                </h3>
              </div>
              <ul className="space-y-4">
                {s.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{
                        background: s.color + "20",
                        border: `1px solid ${s.color}40`,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke={s.color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[#b0c8d8] text-sm">{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-[#1e2d3d]">
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: s.color, fontFamily: "var(--font-display)" }}
                >
                  {s.price} ₽
                  <span className="text-base text-[#4a6070] font-normal ml-1">
                    / месяц
                  </span>
                </p>
                <a
                  href="#контакты"
                  className="mt-4 inline-flex w-full items-center justify-center py-3 rounded font-bold text-sm transition-all duration-200"
                  style={{
                    background: s.color,
                    color: "#080b0f",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Подключить
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="портфолио" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <SectionLabel>Работы</SectionLabel>
            <h2
              className="text-4xl md:text-5xl font-black text-[#e8eef4] mt-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Портфолио
            </h2>
          </div>
          <p className="text-[#7a9ab0] max-w-sm text-sm leading-relaxed">
            Каждый проект — уникальное решение под задачи бизнеса. Никаких
            шаблонов — только проектирование с нуля.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PORTFOLIO.map((item, i) => (
            <div
              key={item.title}
              className="group relative rounded-xl overflow-hidden border border-[#1e2d3d] bg-[#141c24] cursor-pointer transition-all duration-300 hover:border-[#39ff6e30]"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                (item as any).link && window.open((item as any).link, "_blank")
              }
            >
              <div className="relative h-52 overflow-hidden bg-[#141c24]">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b0f] via-[#080b0f20] to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`text-lg font-black transition-colors duration-200 ${hovered === i ? "text-[#39ff6e]" : "text-[#e8eef4]"}`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[#4a6070] text-xs mt-0.5">
                      {item.category}
                    </p>
                  </div>
                  <span
                    className="text-[#4a6070] text-xs mt-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    budget: "",
    website: "",
  });
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const r = await fetch(API_HOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ kind: "lead", ...form }),
      });
      if (!r.ok) throw new Error("send error");
      setSent(true);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="контакты"
      className="py-28 bg-[#0a0e14] border-t border-[#1e2d3d]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <SectionLabel>Контакты</SectionLabel>
            <h2
              className="text-4xl md:text-5xl font-black text-[#e8eef4] mt-3 mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Расскажите
              <br />о проекте
            </h2>
            <p className="text-[#7a9ab0] leading-relaxed mb-12 max-w-sm">
              Оставьте заявку — свяжусь с вами в течение 2 часов в рабочее
              время. Первая консультация бесплатна.
            </p>

            {/* Контакты-кнопки */}
            <div className="space-y-4">
              {[
                {
                  icon: "✉",
                  label: "Написать на почту",
                  href: "mailto:trakun178@yandex.ru",
                },
                {
                  icon: "📱",
                  label: "Написать в Telegram",
                  href: "https://t.me/vortexstudio_ru?direct",
                },
                {
                  icon: "🔷",
                  label: "Написать в Max",
                  href: "https://max.ru/u/f9LHodD0cOKUJTvGxfrJcDoyiK7s_9Qrrp3b3UJDGebY4S61qB2zsyn38KE",
                },
              ].map((c) =>
                c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group w-fit"
                  >
                    <div className="w-10 h-10 rounded-lg border border-[#1e2d3d] bg-[#0e1318] flex items-center justify-center text-base group-hover:border-[#39ff6e40] transition-colors">
                      {c.icon}
                    </div>
                    <p className="text-[#e8eef4] text-sm font-medium group-hover:text-[#39ff6e] transition-colors">
                      {c.label}
                    </p>
                  </a>
                ) : (
                  <div
                    key={c.label}
                    className="flex items-center gap-4 opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg border border-[#1e2d3d] bg-[#0e1318] flex items-center justify-center text-base">
                      {c.icon}
                    </div>
                    <p className="text-[#e8eef4] text-sm font-medium">
                      {c.label}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#1e2d3d] bg-[#0e1318] p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#39ff6e20] border border-[#39ff6e40] flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M6 14l6 6 10-10"
                      stroke="#39ff6e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-black text-[#39ff6e] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Заявка отправлена!
                </h3>
                <p className="text-[#7a9ab0] text-sm">
                  Мы свяжемся с вами в течение 2 часов.
                </p>
                <button
                  className="mt-8 text-sm text-[#4a6070] underline underline-offset-4 hover:text-[#7a9ab0]"
                  onClick={() => {
                    setSent(false);
                    setForm({
                      name: "",
                      company: "",
                      email: "",
                      phone: "",
                      message: "",
                      budget: "",
                      website: "",
                    });
                  }}
                >
                  Отправить ещё
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot-ловушка для ботов */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Имя"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Иван Петров"
                    required
                  />
                  <Field
                    label="Компания"
                    value={form.company}
                    onChange={(v) => setForm({ ...form, company: v })}
                    placeholder="ООО «Пример»"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    placeholder="ivan@company.ru"
                    required
                  />
                  <Field
                    label="Телефон"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-[#4a6070] mb-1.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Услуга
                  </label>
                  <select
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                    className="w-full bg-[#141c24] border border-[#1e2d3d] rounded-lg px-4 py-3 text-sm text-[#e8eef4] focus:outline-none focus:border-[#39ff6e50] transition-colors"
                  >
                    <option value="">Не определился</option>
                    <option>Лендинг — 15 000 ₽</option>
                    <option>Одностраничник — 25 000 ₽</option>
                    <option>Корпоративный — 60 000 ₽</option>
                    <option>Портал — от 150 000 ₽</option>
                    <option>Telegram-бот — 35 000 ₽</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs text-[#4a6070] mb-1.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Описание задачи
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Расскажите о вашем проекте, целях, сроках..."
                    rows={4}
                    className="w-full bg-[#141c24] border border-[#1e2d3d] rounded-lg px-4 py-3 text-sm text-[#e8eef4] placeholder:text-[#2e4050] focus:outline-none focus:border-[#39ff6e50] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3.5 bg-[#39ff6e] text-[#080b0f] font-black rounded-lg hover:bg-[#5aff8a] hover:shadow-[0_0_30px_#39ff6e30] transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {status === "sending" ? "Отправка..." : "Отправить заявку →"}
                </button>
                {status === "error" && (
                  <p className="text-center text-xs text-[#ff5f56]">
                    Не получилось отправить. Напишите нам в{" "}
                    <a
                      href="https://t.me/vortexstudio_ru?direct"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-[#7a9ab0]"
                    >
                      Telegram
                    </a>
                  </p>
                )}
                <p className="text-center text-xs text-[#4a6070]">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <a
                    href="/privacy.html"
                    className="underline underline-offset-2 hover:text-[#7a9ab0]"
                  >
                    политикой конфиденциальности
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-xs text-[#4a6070] mb-1.5"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
        {required && <span className="text-[#39ff6e] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#141c24] border border-[#1e2d3d] rounded-lg px-4 py-3 text-sm text-[#e8eef4] placeholder:text-[#2e4050] focus:outline-none focus:border-[#39ff6e50] transition-colors"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1e2d3d] bg-[#080b0f] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-sm bg-[#39ff6e] flex items-center justify-center">
                <span className="text-[#080b0f] text-xs font-black leading-none">
                  AI
                </span>
              </div>
              <span
                className="text-[#e8eef4] font-bold text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                VORTEX<span className="text-[#39ff6e]">.studio</span>
              </span>
            </div>
            <p className="text-[#4a6070] text-sm leading-relaxed max-w-xs">
              AI-powered веб-студия. Разрабатываем сайты, порталы и сервисы для
              амбициозных компаний России.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { s: "TG", href: "https://t.me/vortexstudio_ru?direct" },
                { s: "VK", href: "https://vk.ru/vortex_studio_ru" },
                { s: "MAX", href: "https://max.ru/channel_vorte_studio" },
              ].map((x) =>
                x.href ? (
                  <a
                    key={x.s}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded border border-[#1e2d3d] text-[#4a6070] hover:border-[#39ff6e40] hover:text-[#39ff6e] text-xs flex items-center justify-center transition-all duration-200"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {x.s}
                  </a>
                ) : (
                  <span
                    key={x.s}
                    className="w-8 h-8 rounded border border-[#1e2d3d] text-[#4a6070] text-xs flex items-center justify-center"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {x.s}
                  </span>
                ),
              )}
            </div>
          </div>

          <div>
            <p
              className="text-xs text-[#4a6070] mb-4 tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              УСЛУГИ
            </p>
            <ul className="space-y-2.5">
              {[
                "Лендинг",
                "Одностраничник",
                "Корпоративный",
                "Портал",
                "Подписка",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#тарифы"
                    className="text-sm text-[#7a9ab0] hover:text-[#39ff6e] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-xs text-[#4a6070] mb-4 tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              КОМПАНИЯ
            </p>
            <ul className="space-y-2.5">
              {[
                { l: "О студии", href: "" },
                { l: "Команда", href: "" },
                { l: "Портфолио", href: "#портфолио" },
                { l: "Блог", href: "" },
                { l: "Вакансии", href: "" },
              ].map((x) => (
                <li key={x.l}>
                  {x.href ? (
                    <a
                      href={x.href}
                      className="text-sm text-[#7a9ab0] hover:text-[#39ff6e] transition-colors"
                    >
                      {x.l}
                    </a>
                  ) : (
                    <span className="text-sm text-[#4a6070]">{x.l}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e2d3d] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-[#4a6070] text-xs"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            © 2026 VORTEX.studio — все права защищены
          </p>
          <div className="flex gap-6">
            <a
              href="/privacy.html"
              className="text-[#4a6070] hover:text-[#7a9ab0] text-xs transition-colors"
            >
              Политика конфиденциальности
            </a>
            <span className="text-[#4a6070] text-xs">Оферта — скоро</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[#39ff6e] text-xs tracking-widest uppercase"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className="w-4 h-px bg-[#39ff6e]" />
      {children}
    </div>
  );
}

function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [spin, setSpin] = useState(false);
  const [msg, setMsg] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [messages, setMessages] = useState<
    { id: number; sender: string; text: string }[]
  >([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const hasVisitorMsg = messages.some((m) => m.sender === "visitor");

  function getVisitor() {
    let v = localStorage.getItem("vortex_visitor");
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("vortex_visitor", v);
    }
    return v;
  }

  // Раз в 30 секунд быстрый оборот — пока всё закрыто
  useEffect(() => {
    if (open || chatOpen) return;
    const id = setInterval(() => {
      setSpin(true);
      setTimeout(() => setSpin(false), 800);
    }, 30000);
    return () => clearInterval(id);
  }, [open, chatOpen]);

  // Опрос диалога каждые 5 секунд, пока открыт чат
  useEffect(() => {
    if (!chatOpen) return;
    const load = async () => {
      try {
        const r = await fetch(
          `${API_HOOK}?action=chat&visitor=${getVisitor()}`,
        );
        const d = await r.json();
        if (d.messages) setMessages(d.messages);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [chatOpen]);

  // Автопрокрутка ленты вниз
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setState("sending");
    try {
      const r = await fetch(API_HOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          kind: "chat",
          visitor_id: getVisitor(),
          message: msg,
          contact,
        }),
      });
      if (!r.ok) throw new Error("chat error");
      setMsg("");
      setContact("");
      setState("idle");
      const rr = await fetch(`${API_HOOK}?action=chat&visitor=${getVisitor()}`);
      const dd = await rr.json();
      if (dd.messages) setMessages(dd.messages);
    } catch {
      setState("error");
    }
  };

  const show = "opacity-100 translate-y-0";
  const hide = "opacity-0 translate-y-3 pointer-events-none";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0e1318] sm:static sm:z-auto sm:w-80 sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100dvh-5rem)] sm:rounded-xl sm:border sm:border-[#1e2d3d] sm:shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-[#141c24] border-b border-[#1e2d3d] shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39ff6e] animate-pulse" />
              <div>
                <p
                  className="text-sm font-bold text-[#e8eef4]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Чат со студией
                </p>
                <p
                  className="text-[11px] text-[#39ff6e]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  онлайн · живой диалог
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              aria-label="Закрыть чат"
              className="text-[#4a6070] hover:text-[#e8eef4]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line
                  x1="4"
                  y1="4"
                  x2="12"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="4"
                  x2="4"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-3 flex flex-col min-h-0 flex-1">
            <div
              ref={boxRef}
              className="rounded-lg border border-[#1e2d3d] bg-[#0a0e14] p-3 overflow-y-auto space-y-3 flex-1 min-h-0  break-words [overflow-wrap:anywhere]"
            >
              <div>
                <p
                  className="text-[10px] text-[#4a6070] mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  VORTEX · Дмитрий
                </p>
                <p className="text-sm text-[#b0c8d8]">
                  Привет! Я Дмитрий. Пиши прямо сюда — отвечаю в реальном
                  времени.
                </p>
              </div>
              {messages.map((m) => (
                <div key={m.id}>
                  <p
                    className="text-[10px] mb-0.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: m.sender === "visitor" ? "#39ff6e" : "#4a6070",
                    }}
                  >
                    {m.sender === "visitor" ? "Вы" : "VORTEX · Дмитрий"}
                  </p>
                  <p
                    className={`text-sm ${m.sender === "visitor" ? "text-[#e8eef4]" : "text-[#b0c8d8]"}`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            {state === "error" && (
              <div className="rounded-lg bg-[#1a0e0e] border border-[#ff5f5640] px-3 py-2 text-sm text-[#ff5f56] shrink-0">
                Не отправилось. Попробуй ещё раз или позвони — кружки связи на
                сайте.
              </div>
            )}

            <form onSubmit={send} className="space-y-2 shrink-0">
              {!hasVisitorMsg && (
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Твой Telegram или телефон (для связи)"
                  className="w-full bg-[#141c24] border border-[#1e2d3d] rounded-lg px-3 py-2 text-sm text-[#e8eef4] placeholder:text-[#2e4050] focus:outline-none focus:border-[#39ff6e50] transition-colors"
                />
              )}
              <div className="flex gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onFocus={(e) =>
                    setTimeout(
                      () =>
                        e.currentTarget.scrollIntoView({ block: "nearest" }),
                      300,
                    )
                  }
                  placeholder="Сообщение..."
                  className="flex-1 bg-[#141c24] border border-[#1e2d3d] rounded-lg px-3 py-2 text-sm text-[#e8eef4] placeholder:text-[#2e4050] focus:outline-none focus:border-[#39ff6e50] transition-colors"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="px-4 rounded-lg bg-[#39ff6e] text-[#080b0f] font-bold text-sm hover:bg-[#5aff8a] transition-colors disabled:opacity-60"
                >
                  {state === "sending" ? "..." : "→"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!chatOpen && (
        <>
          <button
            onClick={() => {
              setOpen(false);
              setChatOpen(true);
            }}
            className={`flex items-center gap-2 transition-all duration-300 ${open ? show : hide}`}
          >
            <span
              className="hidden sm:block px-2.5 py-1 rounded-full border border-[#1e2d3d] bg-[#0e1318]/95 text-[11px] text-[#b0c8d8]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Чат на сайте
            </span>
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center border bg-[#0e1318] shadow-lg hover:shadow-[0_0_20px_#39ff6e50] transition-all duration-200"
              style={{ color: "#39ff6e", borderColor: "#39ff6e60" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12c0 4.4-4 8-9 8-1 0-2-.1-2.9-.4L4 21l1.6-3.1C4.6 16.6 4 14.4 4 12c0-4.4 4-8 9-8s8 3.6 8 8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <a
            href="https://t.me/vortexstudio_ru?direct"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 transition-all duration-300 ${open ? show : hide}`}
          >
            <span
              className="hidden sm:block px-2.5 py-1 rounded-full border border-[#1e2d3d] bg-[#0e1318]/95 text-[11px] text-[#b0c8d8]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Написать в Telegram
            </span>
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center border bg-[#0e1318] shadow-lg hover:shadow-[0_0_20px_#229ed950] transition-all duration-200"
              style={{ color: "#229ed9", borderColor: "#229ed960" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.9 8.2-2 9.3c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.4-.1l-6.9 4.3-3-.9c-.6-.2-.6-.6.1-.9l11.6-4.5c.5-.2 1 .1.9.9z" />
              </svg>
            </span>
          </a>

          <a
            href="https://vk.ru/im?sel=-232319212"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 transition-all duration-300 ${open ? show : hide}`}
          >
            <span
              className="hidden sm:block px-2.5 py-1 rounded-full border border-[#1e2d3d] bg-[#0e1318]/95 text-[11px] text-[#b0c8d8]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Написать в VK
            </span>
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center border bg-[#0e1318] shadow-lg hover:shadow-[0_0_20px_#0077ff50] transition-all duration-200"
              style={{ color: "#0077ff", borderColor: "#0077ff60" }}
            >
              <span className="text-[11px] font-black">VK</span>
            </span>
          </a>

          <a
            href="tel:+79490983532"
            className={`flex items-center gap-2 transition-all duration-300 ${open ? show : hide}`}
          >
            <span
              className="hidden sm:block px-2.5 py-1 rounded-full border border-[#1e2d3d] bg-[#0e1318]/95 text-[11px] text-[#b0c8d8]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Позвонить
            </span>
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center border bg-[#0e1318] shadow-lg hover:shadow-[0_0_20px_#7c6cfa50] transition-all duration-200"
              style={{ color: "#7c6cfa", borderColor: "#7c6cfa60" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.6 10.8c1.4 2.7 3.9 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
              </svg>
            </span>
          </a>

          <div className="relative">
            {!open && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#39ff6e] opacity-30 animate-ping" />
            )}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Способы связи"
              className={`${spin ? "fab-spin " : ""}relative w-14 h-14 rounded-full bg-[#39ff6e] text-[#080b0f] flex items-center justify-center shadow-[0_0_25px_#39ff6e50] hover:shadow-[0_0_40px_#39ff6e90] hover:scale-110 hover:bg-[#5aff8a] transition-all duration-300`}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <line
                    x1="5"
                    y1="5"
                    x2="15"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="15"
                    y1="5"
                    x2="5"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12c0 4.4-4 8-9 8-1 0-2-.1-2.9-.4L4 21l1.6-3.1C4.6 16.6 4 14.4 4 12c0-4.4 4-8 9-8s8 3.6 8 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="bg-[#080b0f] min-h-screen">
      <Nav />
      <Hero />
      <Pricing />
      <Subscriptions />
      <Portfolio />
      <Contact />
      <Footer />
      <FloatingContact />
    </div>
  );
}
