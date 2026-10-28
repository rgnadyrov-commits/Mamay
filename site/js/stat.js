/* Аналитика сайта MAMAY — свой счётчик (сервер «Пульта»), без cookie и без сторонних сервисов.
   Что собираем: откуда пришли, устройство, сколько времени страница была на экране, как далеко прокрутили,
   какие разделы увидели, по каким кнопкам нажали, начали ли заявку, скорость сайта (Core Web Vitals).
   Чего НЕ собираем: адрес, имя, текст формы, постоянный номер посетителя.
   Отчёт — в Пульте, вкладка «Сайт». Свои события: window.mmStat("lead") и т. п. */
(function () {
  "use strict";
  var API = "https://api.mamaytrading.com/v1/a";
  var ua = navigator.userAgent || "";
  if (!/(^|\.)mamaytrading\.com$/.test(location.hostname)) return;   // локальные просмотры не считаем
  if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse/i.test(ua)) return;
  // Chrome может загрузить страницу заранее, пока человек набирает адрес; считаем, только когда её действительно открыли
  if (document.prerendering) document.addEventListener("prerenderingchange", start, { once: true }); else start();

  function start() {

  var ss = null, ls = null;
  try { ss = window.sessionStorage; ls = window.localStorage; } catch (e) {}
  var rnd = function () { return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 20); };
  var sid = (ss && ss.getItem("mm_s")) || rnd();
  try { ss && ss.setItem("mm_s", sid); } catch (e) {}

  // «вернулся» — только отметка дня первого визита в этом браузере, без номера
  var today = Math.floor(Date.now() / 864e5), first = null;
  try { first = ls && ls.getItem("mm_v"); if (!first && ls) ls.setItem("mm_v", String(today)); } catch (e) {}

  var send = function (body, beacon) {
    var data = JSON.stringify(body);
    try {
      if (beacon && navigator.sendBeacon && navigator.sendBeacon(API, new Blob([data], { type: "text/plain" }))) return;
      fetch(API, { method: "POST", body: data, headers: { "Content-Type": "text/plain" }, keepalive: true, mode: "cors", credentials: "omit" }).catch(function () {});
    } catch (e) {}
  };

  /* ---------- начало визита ---------- */
  var q = new URLSearchParams(location.search), utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
  var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  send({
    t: "s", sid: sid, p: location.pathname + location.hash, ref: document.referrer, utm: utm, r: q.get("r") || "",
    ads: !!(q.get("yclid") || q.get("gclid") || /^(cpc|ppc|paid)$/i.test(q.get("utm_medium") || "")),
    w: screen.width, lang: navigator.language || "", tz: tz, ret: !!first, fd: first ? today - (+first) : 0
  });

  /* ---------- время на экране и прокрутка ---------- */
  var engaged = 0, since = null, maxScroll = 0, queue = [], vitals = {}, started = Date.now();
  // «на экране»: вкладка видна и (окно в фокусе или человек что-то делал последние 30 секунд)
  var lastAct = Date.now(), lastSc = -1;
  var active = function () { return document.visibilityState === "visible" && (document.hasFocus() || Date.now() - lastAct < 30000); };
  var tick = function () { var n = Date.now(); if (since !== null) engaged += n - since; since = active() ? n : null; };
  ["pointerdown", "keydown", "touchstart", "wheel", "mousemove", "scroll"].forEach(function (e) {
    window.addEventListener(e, function () { lastAct = Date.now(); if (since === null) tick(); }, { passive: true, capture: true });
  });
  var scroll = function () {
    var h = document.documentElement, max = h.scrollHeight - window.innerHeight;
    var y = window.scrollY || window.pageYOffset || h.scrollTop || document.body.scrollTop || 0;
    var p = max > 0 ? Math.round(y / max * 100) : 100;
    if (p > maxScroll) maxScroll = Math.min(100, p);
  };
  window.addEventListener("scroll", scroll, { passive: true });
  ["focus", "blur"].forEach(function (e) { window.addEventListener(e, tick); });
  document.addEventListener("visibilitychange", function () { tick(); if (document.visibilityState === "hidden") flush(true); });
  window.addEventListener("pagehide", function () { flush(true); });
  tick();

  var ev = function (kind, name) { queue.push([kind, String(name || "").slice(0, 120)]); };
  window.mmStat = function (kind, name) { ev(kind, name); flush(false); };

  var flush = function (beacon) {
    tick(); scroll();
    var body = { t: "p", sid: sid, e: engaged, sc: maxScroll, ev: queue.splice(0, 40) }, vs = "";
    for (var k in vitals) { body[k] = vitals[k]; vs += k + vitals[k]; }
    engaged = 0;
    // нечего нового — не шлём (при закрытии страницы — шлём всегда)
    if (!body.e && !body.ev.length && body.sc === lastSc && vs === lastVs && !beacon) return;
    lastSc = body.sc; lastVs = vs;
    send(body, beacon);
  };
  var lastVs = "";
  setTimeout(function () { if (document.visibilityState === "visible") flush(false); }, 5000);   // короткие визиты тоже видны
  // пульс раз в 15 секунд, пока страница на экране (первые 30 минут визита)
  var beat = setInterval(function () {
    if (Date.now() - started > 30 * 60 * 1000) { clearInterval(beat); return; }
    if (document.visibilityState === "visible") flush(false);
  }, 15000);

  /* ---------- какие разделы увидели ---------- */
  if ("IntersectionObserver" in window) {
    var seen = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen[e.target.id]) { seen[e.target.id] = 1; ev("sec", e.target.id); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll("section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- нажатия ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a,button,[data-a],.stab,summary");
    if (!el) return;
    var name = el.getAttribute("data-a");
    if (!name && el.dataset && el.dataset.plan) name = "plan:" + el.dataset.plan;
    if (!name && el.tagName === "SUMMARY") name = "faq:" + (el.textContent || "").trim().slice(0, 60);
    if (!name && el.classList.contains("stab")) name = "shot:" + (el.textContent || "").trim().slice(0, 40);
    var href = el.getAttribute("href") || "";
    if (!name && /^https?:/i.test(href)) { try { var u = new URL(href); if (!/mamaytrading\.com$/.test(u.hostname)) name = "out:" + u.hostname; } catch (x) {} }
    if (!name && /^mailto:/i.test(href)) name = "mail";
    if (!name && href.charAt(0) === "#") name = "nav:" + href.slice(1);
    if (!name) name = "btn:" + (el.textContent || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 40);
    // где нажали: раздел страницы, главный экран, меню или плавающая кнопка — видно, какой призыв работает
    var where = el.closest(".nav") ? "меню" : el.closest(".hero") ? "главный экран" : el.closest("#pfab, #psheet") ? "плавающие тарифы" : (el.closest("section[id]") || {}).id;
    ev("click", name + (where && name.indexOf("(меню)") < 0 ? " @" + where : ""));
    if (name.indexOf("out:") === 0 || name === "mail") flush(true);   // уходит со страницы — отправляем сразу
  }, true);

  /* ---------- заявка: начал заполнять ---------- */
  var form = document.getElementById("form");
  if (form) form.addEventListener("focusin", function once() { ev("form_start"); flush(false); form.removeEventListener("focusin", once); });

  /* ---------- ошибки страницы ---------- */
  var errs = 0;
  window.addEventListener("error", function (e) { if (errs++ < 3) ev("js_err", (e.message || "ошибка") + " @" + String(e.filename || "").split("/").pop() + ":" + (e.lineno || 0)); });

  /* ---------- скорость сайта: Core Web Vitals ---------- */
  try {
    var nav = performance.getEntriesByType("navigation")[0];
    if (nav) vitals.ttfb = Math.round(nav.responseStart);
    new PerformanceObserver(function (l) { var es = l.getEntries(); vitals.lcp = Math.round(es[es.length - 1].startTime); })
      .observe({ type: "largest-contentful-paint", buffered: true });
    var cls = 0;
    new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { if (!x.hadRecentInput) cls += x.value; }); vitals.cls = Math.round(cls * 1000) / 1000; })
      .observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (x) { if (x.interactionId && (!vitals.inp || x.duration > vitals.inp)) vitals.inp = Math.round(x.duration); });
    }).observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch (e) {}
  }
})();
