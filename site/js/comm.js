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
  var leader = $("#leader"), viewer = $("#viewer");
  drawChart(leader); drawChart(viewer);

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
      post("Лидер · Алексей", "BTC вышел из коридора, где стоял полтора суток: максимум 82 080 пробит на объёме в девять раз выше обычного. Смотрим вместе на общем графике →");
      post("Марина", "Вижу уровень у себя. Как действуем?", "", 900);
      post("Лидер · Алексей", "Вот он:", '<div class="card">▲ BTC · сценарий пробоя 82 080 · вход, стоп и цель — в карточке<br><button class="btn btn-ghost btn-xs" type="button">Открыть в моём MAMAY</button></div>', 1800);
      post("Новичок_Илья", "@Наставник а почему так важен объём?", "", 2900);
      post("Наставник (ИИ)", "На свече пробоя объём в разы выше обычного: в движении участвует много денег, а не пара случайных сделок. Про уровни и пробои есть урок во «Вселенной обучения».", "", 3900);
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
  $("#draw").addEventListener("click", function () { markup(leader, "#e8c26a", !reduce); setTimeout(function () { markup(viewer, "#e8c26a", !reduce); }, 350); });
  $("#take").addEventListener("click", function () { markup(viewer, "#22d3c5", false, true); post("Вы", "Забрал разметку ведущего на свой график — она сохранена в моём MAMAY."); });
  $("#streamer").addEventListener("change", function (e) { $("#balL").classList.toggle("hidden", e.target.checked); });
  $("#balL").classList.add("hidden");

  var started = false, start = function () { if (started) return; started = true; ROOMS[0](); setTimeout(function () { $("#draw").click(); }, 1200); };
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); start(); } }, { threshold: 0.3 }).observe(comm);
  else start();
})();
