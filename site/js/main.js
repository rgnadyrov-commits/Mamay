(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- шапка ---------- */
  var nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  var onScroll = function () { nav.classList.toggle("stuck", window.scrollY > 24); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- появление блоков ---------- */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });
  /* первый экран показываем сразу, не дожидаясь прокрутки */
  setTimeout(function () { $$(".hero-in .reveal").forEach(function (el) { el.classList.add("in"); }); }, 60);

  /* ---------- калькулятор арбитража ---------- */
  var r = { cap: $("#r-cap"), spr: $("#r-spr"), fee: $("#r-fee"), fun: $("#r-fun") };
  if (r.cap) {
    var money = function (v) { return (v < 0 ? "−" : "") + "$" + Math.abs(Math.round(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
    var pct = function (v, sign) { var s = (v < 0 ? "−" : sign && v > 0 ? "+" : "") + Math.abs(v).toFixed(2) + "%"; return s; };
    var fill = function (el) { el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%"); };

    var calc = function () {
      var cap = +r.cap.value, spr = +r.spr.value, fee = +r.fee.value, fun = +r.fun.value;
      var slip = 0.08 * Math.sqrt(cap / 10000);            // проскальзывание по VWAP растёт с размером сделки
      var net = spr - fee - slip + fun;
      Object.keys(r).forEach(function (k) { fill(r[k]); });
      $("#v-cap").textContent = money(cap); $("#v-spr").textContent = pct(spr);
      $("#v-fee").textContent = pct(fee); $("#v-fun").textContent = pct(fun, true);

      $("#o-naive").textContent = pct(spr, true);
      var on = $("#o-net"); on.textContent = pct(net, true); on.className = "mono " + (net > 0 ? "pos" : "neg");
      $("#o-usd").textContent = money(cap * net / 100) + " за цикл";

      var steps = [
        { l: "Видимый спред", v: spr, t: "gain" }, { l: "Комиссии", v: -fee, t: "loss" },
        { l: "Проскаль-\nзывание", v: -slip, t: "loss" }, { l: "Funding", v: fun, t: fun >= 0 ? "gain" : "loss" }
      ];
      var run = 0, segs = [], lo = 0, hi = 0;
      steps.forEach(function (s) { var a = run; run += s.v; segs.push({ s: s, a: a, b: run }); lo = Math.min(lo, a, run); hi = Math.max(hi, a, run); });
      segs.push({ s: { l: "Итого", v: net, t: "tot" }, a: 0, b: net, tot: true });
      lo = Math.min(lo, net, 0); hi = Math.max(hi, net, 0);
      var span = (hi - lo) || 1;
      $("#wf").innerHTML = segs.map(function (g) {
        var a = Math.min(g.a, g.b), b = Math.max(g.a, g.b), bottom = (a - lo) / span * 86, h = Math.max(1.5, (b - a) / span * 86);
        var val = g.tot ? pct(net, true) : (g.s.v >= 0 ? "+" : "−") + Math.abs(g.s.v).toFixed(2);
        return '<div class="wf-c"><div class="wf-bar ' + g.s.t + '" style="bottom:' + bottom + '%;height:' + h + '%"><span class="wf-v">' + val + '</span></div><div class="wf-l">' + g.s.l.replace("\n", "<br>") + "</div></div>";
      }).join("");

      var v = $("#o-verdict");
      if (net >= 0.1) { v.className = "verdict ok"; v.innerHTML = "<b>Связка проходит фильтр.</b> После комиссий, проскальзывания по стакану и funding остаётся " + pct(net, true) + " (" + money(cap * net / 100) + "). Дальше её проверит риск-движок."; }
      else if (net > 0) { v.className = "verdict"; v.innerHTML = "<b>Едва выше нуля.</b> Запас прочности минимальный: MAMAY пометит такую связку низким приоритетом."; }
      else { v.className = "verdict bad"; v.innerHTML = "<b>Связка отбрасывается.</b> Обычный сканер показал бы " + pct(spr, true) + ", но после издержек остаётся " + pct(net, true) + ". Именно такие «спреды» съедают депозит."; }
    };
    Object.keys(r).forEach(function (k) { r[k].addEventListener("input", calc); });
    calc();
  }

  /* ---------- галерея реальных экранов ---------- */
  var SHOTS = [
    { src: "s-waves.webp", t: "MAMAY · Волны", h: "Волны одной кнопкой на любом графике и таймфрейме", p: "Нажимаете «Волны», и терминал сам размечает всю историю графика: подсчёт волн, варианты, цели и уровень, где сценарий отменяется. Работает для крипты, акций США и Мосбиржи. На снимке — BTC, 4 часа." },
    { src: "s-scenarios.webp", t: "MAMAY · Сценарии", h: "Карточка «Сценарии»: план сделки словами", p: "Что происходит на графике, где вход, стоп и цель, что делать «если…». «Принять сценарий» переносит план в торговую панель. Сценарий со стопом дальше 10 % от входа MAMAY не предлагает." },
    { src: "s-dom.webp", t: "MAMAY · Стакан и кластеры", h: "Кластеры, лента «пузырями» и стакан в долларах", p: "Кластеры по минутам с выделением крупных объёмов, крупные сделки ленты и глубокий стакан — по одной бирже или объединённо. Заявка кликом из стакана, стоп и цель сразу, безубыток с учётом комиссий." },
    { src: "s-us.webp", t: "MAMAY · Акции США", h: "Акции США: коридоры, премаркет и сценарии", p: "SPY: найденный коридор и два сценария — от нижней и от верхней границы. Подсветка премаркета и постмаркета, PM high / PM low, профиль объёма, паспорт тикера и новости." },
    { src: "s-prop.webp", t: "MAMAY · Проп-кабинет", h: "Проп-счёт: баланс, прибыль, комиссии и кривая капитала", p: "Сделки, позиции и баланс приходят из терминала фирмы сами. Комиссии до цента, дневной лимит и общая просадка — по правилам и дню фирмы. Пароль от платформы MAMAY не хранит." },
    { src: "s-academy.webp", t: "MAMAY · Обучение", h: "«Вселенная обучения» и наставник", p: "65 уроков в 11 направлениях на трёх уровнях, словарь урока и наставник справа: он отвечает через ваш ИИ и объясняет экран, который вы сейчас видите." },
    { src: "moex-flags.webp", t: "MAMAY · MOEX Флаги", h: "MOEX: флаги, пробои и поток заявок в реальном времени", p: "Скринер флагов по акциям Мосбиржи: состояние, прогноз, канал, VWAP. Под таблицей график с кластерами, лентой и глубоким стаканом по данным Алор." },
    { src: "scanner.webp", t: "MAMAY · Арбитраж", h: "Арбитраж и спот-перелив в одном окне", p: "Связки между биржами, фьючерс↔фьючерс и фьючерс↔спот. Фильтры по NET, спреду и APR, сортировки, детальный расчёт по клику." },
    { src: "transfers.webp", t: "MAMAY · Переводы", h: "Перегон средств между биржами в один клик", p: "Вывод монет и USDT/USDC с биржи на биржу, чек-лист белых списков и диагностика сетей. Терминал подбирает самую выгодную и быструю сеть." }
  ];
  var sImg = $("#shot-img");
  if (sImg) {
    var show = function (i) {
      var d = SHOTS[i]; sImg.classList.add("swap");
      setTimeout(function () { sImg.src = "assets/shots/" + d.src; sImg.alt = d.h; sImg.onload = function () { sImg.classList.remove("swap"); }; }, 180);
      $("#shot-title").textContent = d.t;
      $("#shot-cap").innerHTML = "<b></b><p></p>"; $("#shot-cap b").textContent = d.h; $("#shot-cap p").textContent = d.p;
      $$(".stab").forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); });
    };
    $$(".stab").forEach(function (b) { b.addEventListener("click", function () { show(+b.dataset.s); }); });
    show(0);
    var lb = $("#lightbox"), lbi = $("img", lb);
    $("#shot-zoom").addEventListener("click", function () { lbi.src = sImg.src; lb.hidden = false; });
    lb.addEventListener("click", function () { lb.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.hidden = true; });
  }

  /* ---------- форма заявки ---------- */
  var form = $("#form"), msg = $("#form-msg");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form), data = { name: (f.get("name") || "").trim(), contact: (f.get("contact") || "").trim(), role: f.get("role"), msg: (f.get("msg") || "").trim(), page: location.href, ts: new Date().toISOString() };
    var bad = false;
    ["name", "contact"].forEach(function (n) { var el = form.elements[n], ok = !!data[n]; el.classList.toggle("err", !ok); if (!ok) bad = true; });
    msg.className = "form-msg";
    if (bad) { msg.className = "form-msg bad"; msg.textContent = "Заполните имя и контакт, чтобы мы могли ответить."; return; }

    var cfg = window.MAMAY_CONFIG || {};
    var ok = function () { msg.textContent = "Спасибо! Заявка принята — мы свяжемся с вами в ближайшее время."; form.reset(); };
    var fail = function () { msg.className = "form-msg bad"; msg.textContent = "Не удалось отправить заявку. Попробуйте ещё раз чуть позже."; };

    if (cfg.formEndpoint) {
      msg.textContent = "Отправляем…";
      fetch(cfg.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (res) { res.ok ? ok() : fail(); }).catch(fail);
    } else if (cfg.contactEmail) {
      var body = "Имя: " + data.name + "\nКонтакт: " + data.contact + "\nЯ: " + data.role + "\nИнтересует: " + data.msg;
      location.href = "mailto:" + cfg.contactEmail + "?subject=" + encodeURIComponent("MAMAY: заявка на ранний доступ") + "&body=" + encodeURIComponent(body);
      ok();
    } else {
      console.warn("MAMAY: форма не подключена — заполните formEndpoint или contactEmail в js/config.js");
      msg.className = "form-msg bad"; msg.textContent = "Форма пока не подключена к приёму заявок.";
    }
  });
})();

/* цены и канал из js/config.js */
(function () {
  var cfg = window.MAMAY_CONFIG || {};
  var q = function (sel) { return document.querySelector(sel); };
  if (cfg.pricePro) {
    var b = q('[data-price="pro"]'), n = q('[data-price-note="pro"]');
    if (b) b.textContent = cfg.pricePro;
    if (n) n.textContent = cfg.priceProNote || "в месяц";
    var f = q("[data-price-faq]");
    if (f) f.textContent = "Pro стоит " + cfg.pricePro + " " + (cfg.priceProNote || "в месяц") + (cfg.priceEarly ? "; участникам раннего доступа — " + cfg.priceEarly + ", пока подписка не прерывается" : "") + "." + (cfg.priceDev ? " Тариф «Разработчик» со своим ИИ-агентом — " + cfg.priceDev + " в месяц, откроется вместе с первой версией агента." : "") + " Участники раннего доступа получают Pro на 14 дней бесплатно. Годовая подписка — два месяца в подарок: Pro $490, «Разработчик» $990 в год.";
    var d = q('[data-price="dev"]'); if (d && cfg.priceDev) d.textContent = cfg.priceDev;
  }
  if (cfg.priceEarly) { var e = q("[data-price-early]"); if (e) e.textContent = "Ранняя цена " + cfg.priceEarly + ", пока подписка не прерывается"; }
  if (cfg.telegram) {
    var nav = q(".foot-nav");
    if (nav) { var a = document.createElement("a"); a.href = cfg.telegram; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Канал в Telegram"; nav.appendChild(a); }
  }
})();
