// Инвестиционное предложение MAMAY: вкладки продукта, живая демонстрация сообщества, бюджет и калькулятор экономики.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (v, d = 0) => Math.round(v).toLocaleString("ru-RU", { maximumFractionDigits: d });
const mln = (v) => (v / 1e6).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = (v) => (Math.abs(v) >= 1e6 ? `$${mln(v)} млн` : `$${fmt(v)}`);

// ── живые кадры: снимки сменяют друг друга; нажатие — во весь экран ──
$$(".shot").forEach((f) => {
  const imgs = $$("img", f);
  if (imgs.length > 1) { let k = 0; setInterval(() => { imgs[k].classList.remove("on"); k = (k + 1) % imgs.length; imgs[k].classList.add("on"); }, 6000); }
  f.addEventListener("click", () => { const on = $("img.on", f) || imgs[0]; const lb = $("#lb"); $("img", lb).src = on.src; $("img", lb).alt = on.alt; lb.hidden = false; });
});
$("#lb").addEventListener("click", (e) => { if (e.target.tagName !== "IMG") $("#lb").hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#lb").hidden = true; });
// ── калькулятор: ползунки — по кнопке, чтобы на телефоне палец не сбивал их при прокрутке ──
$("#manual").addEventListener("click", () => { const c = $("#ctrls"); c.hidden = !c.hidden; $("#manual").setAttribute("aria-expanded", String(!c.hidden)); $("#manual").textContent = c.hidden ? "Настроить вручную" : "Скрыть ползунки"; });

// ── вкладки продукта ──
$$("#ptabs button").forEach((b) => b.addEventListener("click", () => {
  $$("#ptabs button").forEach((x) => x.classList.toggle("on", x === b));
  $$("#ppanes .pane").forEach((p, i) => {
    const on = i === +b.dataset.t;
    p.classList.toggle("on", on);
    const v = $("video", p);
    if (v) { if (on) v.play().catch(() => {}); else v.pause(); }
  });
}));
document.addEventListener("click", (e) => { if (e.target.closest(".nav-links a")) document.body.classList.remove("menu-open"); });

// ── сообщество: свечи, общий график, лента ──
const candles = (() => { let p = 100; return Array.from({ length: 34 }, (_, i) => { const o = p; p += Math.sin(i / 3) * 2.2 + (i > 20 ? 1.4 : -0.4) + (Math.random() - 0.5) * 2; return { o, c: p, h: Math.max(o, p) + Math.random() * 2, l: Math.min(o, p) - Math.random() * 2 }; }); })();
const lo = Math.min(...candles.map((c) => c.l)), hi = Math.max(...candles.map((c) => c.h));
const Y = (v) => 160 - ((v - lo) / (hi - lo)) * 150;
function drawCandles(svg) {
  svg.innerHTML = candles.map((c, i) => { const x = 8 + i * 8.4, up = c.c >= c.o, col = up ? "#3ccf91" : "#f06a5f";
    return `<line x1="${x}" x2="${x}" y1="${Y(c.h)}" y2="${Y(c.l)}" stroke="${col}"/><rect x="${x - 2.6}" y="${Y(Math.max(c.o, c.c))}" width="5.2" height="${Math.max(1, Math.abs(Y(c.o) - Y(c.c)))}" fill="${col}"/>`; }).join("");
}
const leader = $("#leader"), viewer = $("#viewer");
drawCandles(leader); drawCandles(viewer);
const lvl = candles[18].h;
function level(svg, color, anim) {
  const id = svg.id + "-lvl"; $("#" + id)?.remove();
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = id;
  g.innerHTML = `<line x1="0" x2="300" y1="${Y(lvl)}" y2="${Y(lvl)}" stroke="${color}" stroke-width="1.6" stroke-dasharray="${anim ? "300" : "5 4"}" ${anim ? 'stroke-dashoffset="300"' : ""}><animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.9s" fill="freeze"/></line><text x="296" y="${Y(lvl) - 4}" fill="${color}" font-size="10" text-anchor="end">пробой ${lvl.toFixed(1)}</text>`;
  svg.appendChild(g);
}
const feed = $("#feed");
function post(who, text, card, delay = 0) {
  setTimeout(() => {
    const d = document.createElement("div"); d.className = "msg";
    const t = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    d.innerHTML = `<b>${who}</b><span class="t">${t}</span><div>${text}</div>${card || ""}`;
    feed.appendChild(d); feed.scrollTop = feed.scrollHeight;
  }, delay);
}
const ROOMS = [
  () => { post("Лидер · Алексей", "Доброе утро! BTC подходит к хаю паузы — смотрим вместе на общем графике →");
    post("Марина", "Вижу уровень у себя. Сценарий есть?", "", 900);
    post("Лидер · Алексей", "Вот он:", `<div class="card">▲ BTC · вход на пробое ${lvl.toFixed(1)} · стоп под свечу пробоя · цель +3R<br><button class="btn sm">Открыть в моём MAMAY</button></div>`, 1800);
    post("Новичок_Илья", "@Наставник почему стоп именно там?", "", 2900);
    post("Наставник (ИИ)", "Стоп под тенью свечи пробоя: если пробой ложный, цена вернётся туда первой. Урок «Вход на пробой» — 6 минут.", "", 3900); },
  () => { post("Сергей", "Мой разбор вчерашней сделки:", `<div class="card short">▼ ETH шорт · −0,8R · закрыт по стопу<br>стоп был внутри шума — переставил бы выше</div>`); },
  () => { post("Голосовая комната", "🔊 Идёт разбор: Алексей показывает экран (режим стримера — баланс скрыт), 5 слушателей. <button class='btn sm'>Подключиться</button>"); },
  () => { post("Закрытая комната", "🔒 Доступ — для участников с подпиской лидера. Лидер получает доход, MAMAY — процент, участники — подписку MAMAY."); },
];
$$(".room").forEach((b) => b.addEventListener("click", () => {
  $$(".room").forEach((x) => x.classList.toggle("on", x === b)); feed.innerHTML = ""; ROOMS[+b.dataset.r]();
  $("#say").placeholder = "Сообщение в " + b.textContent.replace(/\d+$/, "").trim();
}));
$("#send").addEventListener("click", () => { const v = $("#say").value.trim(); if (!v) return; post("Вы", v.replace(/</g, "&lt;")); $("#say").value = ""; });
$("#say").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#send").click(); });
$("#draw").addEventListener("click", () => { level(leader, "#e8c366", true); setTimeout(() => level(viewer, "#e8c366", true), 350); });
$("#take").addEventListener("click", () => { level(viewer, "#6fd3ff", false); post("Вы", "Забрал разметку ведущего на свой график — сохранена в моём MAMAY."); });
$("#streamer").addEventListener("change", (e) => $("#balL").classList.toggle("hidden", e.target.checked));
$("#balL").classList.add("hidden");
let commStarted = false;
new IntersectionObserver((es) => { if (es[0].isIntersecting && !commStarted) { commStarted = true; ROOMS[0](); setTimeout(() => $("#draw").click(), 1200); } }, { threshold: 0.3 }).observe($("#comm"));

// ── бюджет первого года (₽) ──
const BUD = [
  { k: "pc", name: "Рабочая станция для разработки и видео", once: 280000, hint: "разово" },
  { k: "srv", name: "Серверы: Пульт, расчёты и учётные записи, сервер общения", mo: 14000, hint: "в месяц, Timeweb и зарубежный хостинг" },
  { k: "ai", name: "ИИ: разработка (Claude) и сервисы продукта", mo: 30000, hint: "в месяц" },
  { k: "data", name: "Данные: Мосбиржа (вендорский договор) и акции США", mo: 87500, from: 6, hint: "в месяц, с 6-го месяца" },
  { k: "content", name: "Производство контента: YouTube, Telegram, ВК, TikTok", mo: 60000, hint: "в месяц" },
  { k: "ads", name: "Реклама: Telegram Ads, посевы, блогеры", mo: 120000, from: 2, hint: "в месяц, со 2-го месяца" },
  { k: "legal", name: "Юрист, ООО, оферта, товарный знак, реестр ОРИ", once: 200000, hint: "разово" },
  { k: "acc", name: "Бухгалтерия и платёжный сервис", mo: 15000, hint: "в месяц" },
  { k: "staff", name: "Помощник: поддержка и модерация сообщества", mo: 60000, from: 4, hint: "в месяц, с 4-го месяца" },
];
const months = (b) => 12 - (b.from ? b.from - 1 : 0);
const rate = () => Math.max(1, +$("#rate").value || 85);
function budgetYear() { const sub = BUD.reduce((s, b) => s + (b.once || 0) + (b.mo || 0) * months(b), 0); return { sub, reserve: sub * 0.1, total: sub * 1.1 }; }
function renderBudget() {
  const r = rate(), y = budgetYear();
  $("#bud").innerHTML = `<tr><th>Статья</th><th class="n">Сумма, ₽</th><th class="n">За год, ₽</th></tr>` + BUD.map((b, i) =>
    `<tr><td>${b.name}<span class="hint">${b.hint}</span></td><td class="n"><input data-i="${i}" type="number" step="1000" value="${b.once ?? b.mo}"></td><td class="n">${fmt((b.once || 0) + (b.mo || 0) * months(b))}</td></tr>`).join("")
    + `<tr><td>Резерв 10 %</td><td></td><td class="n">${fmt(y.reserve)}</td></tr>`;
  $("#budTotal").innerHTML = `<span class="muted">Нужно на первый год</span><b>${mln(y.total)} млн ₽</b><span>≈ ${usd(y.total / r)}</span>`;
  const max = Math.max(...BUD.map((b) => (b.once || 0) + (b.mo || 0) * months(b)));
  $("#budBars").innerHTML = BUD.map((b) => { const v = (b.once || 0) + (b.mo || 0) * months(b); return `<div>${b.name.split(":")[0]} — ${fmt(v / 1000)} тыс. ₽<i style="width:${(v / max) * 100}%"></i></div>`; }).join("");
  $("#askLine").textContent = `≈ ${mln(y.total)} млн ₽ (≈ ${usd(y.total / r)})`;
  $$("#bud input").forEach((inp) => inp.addEventListener("change", () => { const b = BUD[+inp.dataset.i]; const v = Math.max(0, +inp.value || 0); if (b.once != null) b.once = v; else b.mo = v; renderBudget(); calc(); }));
}
$("#rate").addEventListener("change", () => { renderBudget(); calc(); });

// ── калькулятор: 36 месяцев ──
const CTL = [
  ["Платящие пользователи", null],
  ["p12", "через 12 месяцев", 50, 3000, 10], ["p24", "через 24 месяца", 100, 10000, 50], ["p36", "через 36 месяцев", 200, 20000, 100],
  ["Цены и доли", null],
  ["dev", "доля тарифа «Разработчик» $99, %", 0, 50, 1], ["early", "доля ранней цены $29, %", 0, 100, 5],
  ["Другие доходы", null],
  ["free", "бесплатных на одного платящего", 2, 20, 1], ["ref", "торгуют по нашей ссылке биржи, %", 0, 40, 1], ["refUsd", "доход с такого трейдера, $ в месяц", 0, 30, 1],
  ["prop", "покупают челлендж в месяц, % активных", 0, 10, 0.5], ["leaders", "лидеров сообществ через 36 мес.", 0, 300, 5],
  ["Оценка", null], ["mult", "оценка проекта, × годовой выручки", 1, 10, 0.5],
];
const SCEN = {
  careful: { p12: 150, p24: 600, p36: 1200, dev: 5, early: 40, free: 6, ref: 8, refUsd: 6, prop: 1, leaders: 15, mult: 3 },
  base: { p12: 400, p24: 1500, p36: 3000, dev: 10, early: 30, free: 8, ref: 12, refUsd: 8, prop: 2, leaders: 40, mult: 4 },
  bold: { p12: 900, p24: 3500, p36: 7000, dev: 15, early: 20, free: 10, ref: 15, refUsd: 10, prop: 3, leaders: 100, mult: 5 },
};
let S = { ...SCEN.base };
function renderCtrls() {
  $("#ctrls").innerHTML = CTL.map((c) => c[1] === null ? `<div class="ctl-h">${c[0]}</div>`
    : `<div class="ctl"><label for="c-${c[0]}">${c[1]} <b id="v-${c[0]}">${fmt(S[c[0]], 1)}</b></label><input id="c-${c[0]}" type="range" min="${c[2]}" max="${c[3]}" step="${c[4]}" value="${S[c[0]]}"></div>`).join("");
  CTL.filter((c) => c[1] !== null).forEach((c) => $("#c-" + c[0]).addEventListener("input", (e) => { S[c[0]] = +e.target.value; $("#v-" + c[0]).textContent = fmt(S[c[0]], 1); $$("#scen button").forEach((b) => b.classList.remove("on")); calc(); }));
}
$$("#scen button").forEach((b) => b.addEventListener("click", () => { S = { ...SCEN[b.dataset.s] }; $$("#scen button").forEach((x) => x.classList.toggle("on", x === b)); renderCtrls(); calc(); }));

function model() {
  // платящие: старт с 5 (бета), к 6-му месяцу — пятая часть цели года, дальше — к целям 12 / 24 / 36 месяцев
  const r = rate(), pts = [[0, 5], [6, Math.max(6, S.p12 * 0.2)], [12, S.p12], [24, Math.max(S.p24, S.p12)], [36, Math.max(S.p36, S.p24, S.p12)]];
  const users = (m) => { const k = pts.findIndex((p, i) => i > 0 && m <= p[0]) - 1; const [a, ua] = pts[k], [b, ub] = pts[k + 1]; return ua * Math.pow(ub / ua, (m - a) / (b - a)); };
  const arpu = (S.dev / 100) * 99 + (1 - S.dev / 100) * ((S.early / 100) * 29 + (1 - S.early / 100) * 49);
  const rows = [];
  let cash = 0;
  for (let m = 1; m <= 36; m++) {
    const n = users(m), active = n * (1 + S.free);
    const subs = n * arpu, refs = active * (S.ref / 100) * S.refUsd, prop = active * (S.prop / 100) * 120 * 0.12;
    const lead = S.leaders * Math.min(1, Math.max(0, (m - 6) / 30)) * 40 * 25 * 0.2;   // лидеры — с запуска сообщества (7-й месяц)
    const rev = subs + refs + prop + lead;
    // расходы: бюджет первого года по месяцам; дальше — те же месячные статьи + рост вместе с пользователями
    const mm = Math.min(m, 12);
    let cost = BUD.reduce((s, b) => s + (b.mo && (!b.from || mm >= b.from) ? b.mo : 0) + (b.once && m === 1 ? b.once : 0), 0) / r;
    cost += n * 0.6 + Math.floor(n / 1500) * 60000 / r + subs * 0.06;
    cash += rev - cost;
    rows.push({ m, n, rev, cost, cash });
  }
  return rows;
}
function calc() {
  const R = model(), r = rate();
  const be = R.find((x) => x.rev >= x.cost && x.m > 1), need = -Math.min(0, ...R.map((x) => x.cash));
  const yr = (k) => R.slice((k - 1) * 12, k * 12).reduce((s, x) => s + x.rev, 0);
  const arr = R[35].rev * 12;
  $("#kpis").innerHTML = [
    [usd(R[11].rev), "выручка в месяц через год"], [usd(R[35].rev), "выручка в месяц через 3 года"], [be ? `${be.m}-й месяц` : "позже 36 мес.", "выход в плюс по месяцу"],
    [usd(need), `наибольший минус по деньгам (≈ ${mln(need * r)} млн ₽)`], [usd(yr(3)), "выручка за 3-й год"], [usd(arr * S.mult), `ориентир оценки: ${S.mult}× годовой выручки`],
  ].map(([b, s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join("");
  $("#yrs").innerHTML = `<tr><th></th><th>Год 1</th><th>Год 2</th><th>Год 3</th></tr>`
    + `<tr><td>Платящих на конец года</td>${[11, 23, 35].map((i) => `<td>${fmt(R[i].n)}</td>`).join("")}</tr>`
    + `<tr><td>Выручка</td>${[1, 2, 3].map((k) => `<td>${usd(yr(k))}</td>`).join("")}</tr>`
    + `<tr><td>Расходы</td>${[1, 2, 3].map((k) => `<td>${usd(R.slice((k - 1) * 12, k * 12).reduce((s, x) => s + x.cost, 0))}</td>`).join("")}</tr>`
    + `<tr><td>Деньги на конец года</td>${[11, 23, 35].map((i) => `<td>${usd(R[i].cash)}</td>`).join("")}</tr>`;
  // график
  const W = 760, H = 320, L = 58, B = 290, T = 14;
  const vmax = Math.max(...R.map((x) => Math.max(x.rev, x.cost))), vmin = 0;
  const X = (m) => L + ((m - 1) / 35) * (W - L - 12), Yv = (v) => B - ((v - vmin) / (vmax - vmin || 1)) * (B - T);
  const line = (k, col, dash) => `<polyline fill="none" stroke="${col}" stroke-width="2.2" ${dash ? 'stroke-dasharray="5 4"' : ""} points="${R.map((x) => `${X(x.m)},${Yv(x[k])}`).join(" ")}"/>`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => vmin + (vmax - vmin) * f);
  $("#chart").innerHTML = ticks.map((t) => `<line x1="${L}" x2="${W - 10}" y1="${Yv(t)}" y2="${Yv(t)}" stroke="#262d3b"/><text x="${L - 6}" y="${Yv(t) + 4}" text-anchor="end">${usd(t)}</text>`).join("")
    + `<line x1="${L}" x2="${W - 10}" y1="${Yv(0)}" y2="${Yv(0)}" stroke="#9aa1ad"/>`
    + [1, 12, 24, 36].map((m) => `<text x="${X(m)}" y="${H - 8}" text-anchor="middle">${m} мес.</text>`).join("")
    + line("cost", "#ff9f43", true) + line("rev", "#e8c366")
    + (be ? `<circle cx="${X(be.m)}" cy="${Yv(be.rev)}" r="5" fill="#e8c366"/><text x="${X(be.m) + 8}" y="${Yv(be.rev) - 8}" fill="#e8c366">в плюс</text>` : "");
}
renderBudget(); renderCtrls(); calc();
