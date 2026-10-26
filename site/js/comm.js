/* ==========================================================
   MAMAY — живые снимки (лента под баннером), увеличение снимков разделов
   и интерактивное демо «Сообщества» (без сервера: всё нарисовано на месте).
   ========================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- просмотр во весь экран (общий lightbox из index.html) ---------- */
  var lb = $("#lightbox"), lbi = lb && $("img", lb);
  var zoom = function (img) { if (!lb || !img) return; lbi.src = img.currentSrc || img.src; lbi.alt = img.alt; lb.hidden = false; };
  $$("[data-zoom]").forEach(function (b) { b.addEventListener("click", function () { zoom($("img", b)); }); });

  /* ---------- лента снимков: кадры сменяют друг друга ---------- */
  var reel = $("#reel");
  if (reel) {
    var imgs = $$("img", reel), cap = $("#reel-cap"), k = 0;
    var go = function (i) {
      imgs[k].classList.remove("on"); k = (i + imgs.length) % imgs.length; imgs[k].classList.add("on");
      if (cap) cap.textContent = imgs[k].dataset.cap || imgs[k].alt;
    };
    if (!reduce && imgs.length > 1) setInterval(function () { if (!document.hidden) go(k + 1); }, 6500);
    reel.addEventListener("click", function () { zoom(imgs[k]); });
  }

  /* ---------- сообщество: свечи, общий график, лента сообщений ---------- */
  var comm = $("#comm");
  if (!comm) return;
  var candles = (function () {
    var p = 100, out = [];
    for (var i = 0; i < 34; i++) {
      var o = p; p += Math.sin(i / 3) * 2.2 + (i > 20 ? 1.4 : -0.4) + (Math.random() - 0.5) * 2;
      out.push({ o: o, c: p, h: Math.max(o, p) + Math.random() * 2, l: Math.min(o, p) - Math.random() * 2 });
    }
    return out;
  })();
  var lo = Math.min.apply(null, candles.map(function (c) { return c.l; }));
  var hi = Math.max.apply(null, candles.map(function (c) { return c.h; }));
  var Y = function (v) { return 160 - ((v - lo) / (hi - lo)) * 150; };
  var drawCandles = function (svg) {
    svg.innerHTML = candles.map(function (c, i) {
      var x = 8 + i * 8.4, col = c.c >= c.o ? "#22d3a0" : "#ef5b5b";
      return '<line x1="' + x + '" x2="' + x + '" y1="' + Y(c.h) + '" y2="' + Y(c.l) + '" stroke="' + col + '"/>' +
        '<rect x="' + (x - 2.6) + '" y="' + Y(Math.max(c.o, c.c)) + '" width="5.2" height="' + Math.max(1, Math.abs(Y(c.o) - Y(c.c))) + '" fill="' + col + '"/>';
    }).join("");
  };
  var leader = $("#leader"), viewer = $("#viewer");
  drawCandles(leader); drawCandles(viewer);
  var lvl = candles[18].h;
  var level = function (svg, color, anim) {
    var old = $("#" + svg.id + "-lvl"); if (old) old.remove();
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = svg.id + "-lvl";
    g.innerHTML = '<line x1="0" x2="300" y1="' + Y(lvl) + '" y2="' + Y(lvl) + '" stroke="' + color + '" stroke-width="1.6" stroke-dasharray="' + (anim ? "300" : "5 4") + '"' + (anim ? ' stroke-dashoffset="300"' : "") + '>' +
      (anim ? '<animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.9s" fill="freeze"/>' : "") + '</line>' +
      '<text x="296" y="' + (Y(lvl) - 4) + '" fill="' + color + '" font-size="10" text-anchor="end">пробой ' + lvl.toFixed(1) + '</text>';
    svg.appendChild(g);
  };

  var feed = $("#feed"), timers = [];
  var post = function (who, text, card, delay) {
    timers.push(setTimeout(function () {
      var d = document.createElement("div"); d.className = "msg";
      var t = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      d.innerHTML = "<b>" + who + '</b><span class="t">' + t + "</span><div>" + text + "</div>" + (card || "");
      feed.appendChild(d); feed.scrollTop = feed.scrollHeight;
    }, delay || 0));
  };
  var ROOMS = [
    function () {
      post("Лидер · Алексей", "Доброе утро! BTC подходит к хаю паузы — смотрим вместе на общем графике →");
      post("Марина", "Вижу уровень у себя. Сценарий есть?", "", 900);
      post("Лидер · Алексей", "Вот он:", '<div class="card">▲ BTC · вход на пробое ' + lvl.toFixed(1) + ' · стоп под свечу пробоя · цель +3R<br><button class="btn btn-ghost btn-xs" type="button">Открыть в моём MAMAY</button></div>', 1800);
      post("Новичок_Илья", "@Наставник почему стоп именно там?", "", 2900);
      post("Наставник (ИИ)", "Стоп под тенью свечи пробоя: если пробой ложный, цена вернётся туда первой. Урок «Вход на пробой» — 6 минут.", "", 3900);
    },
    function () { post("Сергей", "Мой разбор вчерашней сделки:", '<div class="card short">▼ ETH шорт · −0,8R · закрыт по стопу<br>стоп был внутри шума — переставил бы выше</div>'); },
    function () { post("Голосовая комната", "🔊 Идёт разбор: Алексей показывает экран (режим стримера — баланс скрыт), 5 слушателей. <button class=\"btn btn-ghost btn-xs\" type=\"button\">Подключиться</button>"); },
    function () { post("Закрытая комната", "🔒 Комната лидера — только для участников его сообщества."); }
  ];
  $$(".room", comm).forEach(function (b) {
    b.addEventListener("click", function () {
      timers.forEach(clearTimeout); timers = [];
      $$(".room", comm).forEach(function (x) { x.classList.toggle("on", x === b); });
      feed.innerHTML = ""; ROOMS[+b.dataset.r]();
      $("#say").placeholder = "Сообщение в " + b.textContent.replace(/\d+$/, "").trim();
    });
  });
  $("#send").addEventListener("click", function () {
    var v = $("#say").value.trim(); if (!v) return;
    post("Вы", v.replace(/&/g, "&amp;").replace(/</g, "&lt;")); $("#say").value = "";
  });
  $("#say").addEventListener("keydown", function (e) { if (e.key === "Enter") $("#send").click(); });
  $("#draw").addEventListener("click", function () { level(leader, "#e8c26a", !reduce); setTimeout(function () { level(viewer, "#e8c26a", !reduce); }, 350); });
  $("#take").addEventListener("click", function () { level(viewer, "#22d3c5", false); post("Вы", "Забрал разметку ведущего на свой график — она сохранена в моём MAMAY."); });
  $("#streamer").addEventListener("change", function (e) { $("#balL").classList.toggle("hidden", e.target.checked); });
  $("#balL").classList.add("hidden");

  var started = false, start = function () { if (started) return; started = true; ROOMS[0](); setTimeout(function () { $("#draw").click(); }, 1200); };
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); start(); } }, { threshold: 0.3 }).observe(comm);
  else start();
})();
