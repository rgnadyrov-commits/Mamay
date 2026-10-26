// Инвестиционное предложение MAMAY: вкладки продукта, живая демонстрация сообщества, бюджет и калькулятор экономики.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (v, d = 0) => Math.round(v).toLocaleString("ru-RU", { maximumFractionDigits: d });
const mln = (v) => (v / 1e6).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = (v) => (Math.abs(v) >= 1e6 ? `$${mln(v)} млн` : `$${fmt(v)}`);

// ── живые кадры: снимки сменяют друг друга; нажатие — во весь экран ──
$$(".shot").forEach((f) => {
  const imgs = $$("img", f);
  // кадры идут по порядку; при открытии вкладки — снова с первого
  const show = (i) => { imgs.forEach((im, j) => im.classList.toggle("on", j === i)); f.dataset.k = i; };
  f.restart = () => { clearInterval(f.tm); show(0); if (imgs.length > 1) f.tm = setInterval(() => show((+f.dataset.k + 1) % imgs.length), 6000); };
  f.restart();
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
    const sh = $(".shot", p); if (on && sh && sh.restart) sh.restart();
    const v = $("video", p);
    if (v) { if (on) v.play().catch(() => {}); else v.pause(); }
  });
}));
document.addEventListener("click", (e) => { if (e.target.closest(".nav-links a")) document.body.classList.remove("menu-open"); });

// ── сообщество: свечи, общий график, лента ──
  /* Настоящие часовые свечи BTCUSDT (Bybit, 19–21 сентября 2026): полтора дня в коридоре,
   затем пробой максимума 82 080 на объёме в девять раз выше обычного. [время, o, h, l, c, объём BTC] */
var BTC = [[1789790400,81094.0,81200.0,80888.9,80989.2,1075],[1789794000,80989.2,81120.0,80974.0,81013.7,731],[1789797600,81013.7,81075.0,80890.0,81023.6,701],[1789801200,81023.6,81225.4,81000.6,81087.4,1129],[1789804800,81087.4,81392.1,81040.0,81291.6,1391],[1789808400,81291.6,81499.0,81214.6,81295.8,1218],[1789812000,81295.8,81309.5,81181.4,81204.6,1063],[1789815600,81204.6,81356.7,81180.6,81281.1,820],[1789819200,81281.1,81345.0,81190.0,81310.4,813],[1789822800,81310.4,81328.9,81140.6,81313.5,855],[1789826400,81313.5,81618.9,81296.2,81540.0,1891],[1789830000,81540.0,81954.6,81528.0,81610.9,3097],[1789833600,81610.9,81872.3,81431.7,81795.4,1890],[1789837200,81795.4,81823.6,81393.2,81420.0,1790],[1789840800,81420.0,81505.3,81280.0,81391.3,1405],[1789844400,81391.3,81425.7,81264.0,81324.2,650],[1789848000,81324.2,81398.8,81035.0,81123.4,973],[1789851600,81123.4,81198.1,80861.1,81066.8,1924],[1789855200,81066.8,81242.1,80932.9,81224.9,822],[1789858800,81224.9,81340.0,81182.9,81234.9,746],[1789862400,81234.9,81311.3,81163.9,81255.1,626],[1789866000,81255.1,81274.9,80990.0,81079.8,910],[1789869600,81079.8,81149.9,80227.0,80301.2,4391],[1789873200,80301.2,80500.0,80092.3,80460.9,2500],[1789876800,80460.9,80500.0,80280.0,80405.4,1185],[1789880400,80405.4,80640.5,80380.0,80455.4,1101],[1789884000,80455.4,80584.3,80175.2,80276.7,1429],[1789887600,80276.7,80410.6,80243.8,80274.5,892],[1789891200,80274.5,80424.0,80125.8,80228.3,1285],[1789894800,80228.3,80558.2,80218.4,80431.1,1211],[1789898400,80431.1,80489.0,80281.7,80288.5,913],[1789902000,80288.5,80493.6,80244.7,80443.0,1057],[1789905600,80443.0,80500.0,80285.1,80450.7,834],[1789909200,80450.7,80623.6,80386.1,80527.0,1086],[1789912800,80527.0,80750.7,80377.1,80641.8,1639],[1789916400,80641.8,80940.8,80623.4,80870.9,1992],[1789920000,80870.9,81479.4,80760.9,81310.0,3894],[1789923600,81310.0,81438.9,81030.0,81123.8,1856],[1789927200,81123.8,81290.0,80976.3,81008.1,1153],[1789930800,81008.1,81290.0,81008.1,81153.5,1017],[1789934400,81153.5,81199.9,81041.0,81063.3,869],[1789938000,81063.3,81063.3,80550.0,80908.9,2786],[1789941600,80908.9,81274.0,80730.2,81182.8,1601],[1789945200,81182.8,81313.7,81081.4,81141.1,1290],[1789948800,81141.1,81822.9,81136.7,81569.5,4159],[1789952400,81569.5,82080.0,80820.0,80964.2,5578],[1789956000,80964.2,81476.3,80914.0,81282.0,2564],[1789959600,81282.0,81549.0,81200.0,81398.6,1006],[1789963200,81398.6,81487.6,81188.2,81365.4,1261],[1789966800,81365.4,81765.2,81265.0,81523.6,1646],[1789970400,81523.6,81855.0,81353.0,81612.3,1964],[1789974000,81612.3,81711.5,81437.9,81704.8,1874],[1789977600,81704.8,84303.0,81699.2,83724.2,17808],[1789981200,83724.2,85349.9,83670.0,84627.6,13785],[1789984800,84627.6,84799.5,84106.0,84403.9,4031],[1789988400,84403.9,84894.0,84361.7,84858.8,2950],[1789992000,84858.8,85466.9,84790.0,85280.0,6642],[1789995600,85280.0,85828.9,84736.7,85428.6,9132]];
var BOX0 = 16, BRK = 52, LVL = 82080, BOXLO = 80092.3;
var CW = 360, CH = 216, PR = 318, PT = 8, PB = 150, VT = 160, VB = 188;
var pMin = 79800, pMax = 86200, vMax = 17808;
var step = (PR - 6) / (BTC.length + 2);
var X = function (i) { return 4 + step * (i + 0.5); };
var P = function (v) { return PT + (pMax - v) / (pMax - pMin) * (PB - PT); };
var sp = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
var MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
var tag = function (y, fill, txt, ink) {
  return '<rect x="' + (PR + 1) + '" y="' + (y - 7) + '" width="' + (CW - PR - 1) + '" height="14" rx="2" fill="' + fill + '"/>' +
    '<text x="' + (PR + 5) + '" y="' + (y + 3.5) + '" class="ax" style="fill:' + ink + '">' + txt + "</text>";
};
var drawChart = function (svg) {
  svg.setAttribute("viewBox", "0 0 " + CW + " " + CH);
var g = "", k, i;
  for (k = 80000; k <= 86000; k += 1000) {
    g += '<line x1="0" x2="' + PR + '" y1="' + P(k) + '" y2="' + P(k) + '" class="gr"/>' +
      '<text x="' + (PR + 5) + '" y="' + (P(k) + 3) + '" class="ax">' + sp(k) + "</text>";
  }
  for (i = 0; i < BTC.length; i++) {
  var d = new Date((BTC[i][0] + 3 * 3600) * 1000), hh = d.getUTCHours();   // время МСК
    if (hh === 0 || hh === 12) {
      g += '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="' + PT + '" y2="' + VB + '" class="gr"/>' +
        '<text x="' + X(i) + '" y="' + (CH - 10) + '" class="ax" text-anchor="middle">' + (hh === 0 ? d.getUTCDate() + " " + MON[d.getUTCMonth()] : "12:00") + "</text>";
    }
  }
  g += '<line x1="' + PR + '" x2="' + PR + '" y1="0" y2="' + CH + '" class="gr"/><line x1="0" x2="' + PR + '" y1="' + (VB + 2) + '" y2="' + (VB + 2) + '" class="gr"/>';
var bw = Math.max(1.2, step * 0.64);
  BTC.forEach(function (c, i) {
  var up = c[4] >= c[1], col = up ? "#22d3a0" : "#ef5b5b", x = X(i);
  var top = P(Math.max(c[1], c[4])), h = Math.max(0.8, Math.abs(P(c[1]) - P(c[4])));
  var vh = (c[5] / vMax) * (VB - VT);
    g += '<rect x="' + (x - bw / 2) + '" y="' + (VB - vh) + '" width="' + bw + '" height="' + vh + '" fill="' + col + '" opacity=".38"/>' +
      '<line x1="' + x + '" x2="' + x + '" y1="' + P(c[2]) + '" y2="' + P(c[3]) + '" stroke="' + col + '" stroke-width=".8"/>' +
      '<rect x="' + (x - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + h + '" fill="' + col + '"/>';
  });
var last = BTC[BTC.length - 1];
  g += '<line x1="0" x2="' + PR + '" y1="' + P(last[4]) + '" y2="' + P(last[4]) + '" stroke="#22d3a0" stroke-width=".6" stroke-dasharray="2 2"/>' +
    tag(P(last[4]), "#22d3a0", sp(last[4]), "#04120c");
  svg.innerHTML = g;
};
var markup = function (svg, color, anim, dashed) {
var old = svg.querySelector(".mkup"); if (old) old.remove();
var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "mkup");
var x0 = X(BOX0) - step / 2, x1 = X(BRK) - step / 2, y = P(LVL), len = PR - x0;
  g.innerHTML = '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + (P(BOXLO) - y) + '" fill="' + color + '" fill-opacity=".07" stroke="' + color + '" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="3 2"/>' +
    '<line x1="' + x0 + '" x2="' + PR + '" y1="' + y + '" y2="' + y + '" stroke="' + color + '" stroke-width="1.2" stroke-dasharray="' + (anim ? len : dashed ? "4 3" : "none") + '"' + (anim ? ' stroke-dashoffset="' + len + '"' : "") + ">" +
    (anim ? '<animate attributeName="stroke-dashoffset" from="' + len + '" to="0" dur="0.9s" fill="freeze"/>' : "") + "</line>" +
    '<text x="' + (x0 + 3) + '" y="' + (y - 4) + '" class="ax" style="fill:' + color + '">коридор 36 ч · пробой</text>' +
    tag(y, color, sp(LVL), "#1a1203");
  svg.appendChild(g);
};
const leader = $("#leader"), viewer = $("#viewer");
drawChart(leader); drawChart(viewer);
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
  () => { post("Лидер · Алексей", "BTC вышел из коридора, где стоял полтора суток: максимум 82 080 пробит на объёме в девять раз выше обычного. Смотрим вместе на общем графике →");
    post("Марина", "Вижу уровень у себя. Как действуем?", "", 900);
    post("Лидер · Алексей", "Вот он:", `<div class="card">▲ BTC · сценарий пробоя 82 080 · вход, стоп и цель — в карточке<br><button class="btn sm">Открыть в моём MAMAY</button></div>`, 1800);
    post("Новичок_Илья", "@Наставник а почему так важен объём?", "", 2900);
    post("Наставник (ИИ)", "На свече пробоя объём в разы выше обычного: в движении участвует много денег, а не пара случайных сделок. Про уровни и пробои есть урок во «Вселенной обучения».", "", 3900); },
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
$("#draw").addEventListener("click", () => { markup(leader, "#e8c26a", true); setTimeout(() => markup(viewer, "#e8c26a", true), 350); });
$("#take").addEventListener("click", () => { markup(viewer, "#6fd3ff", false, true); post("Вы", "Забрал разметку ведущего на свой график — сохранена в моём MAMAY."); });
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
