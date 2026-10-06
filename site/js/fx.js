/* Анимации и интерактив: подсветка за курсором, 3D-наклон, магнитные кнопки, счётчики, каскадное появление. */
(function () {
  "use strict";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- полоса прогресса прокрутки ---------- */
  var bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);
  var onScroll = function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- счётчики ---------- */
  $$("[data-count]").forEach(function (el) {
    var to = +el.dataset.count, plus = el.dataset.plus ? "+" : "", started = false;
    var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = fmt(to) + plus; return; }
    el.textContent = "0";
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting || started) return;
      started = true; ob.disconnect();
      var t0 = performance.now(), dur = 1500;
      (function f(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(to * e) + (k === 1 ? plus : "");
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }, { threshold: 0.6 }).observe(el);
  });

  /* ---------- каскадное появление ---------- */
  $$(".bento,.mk-grid,.steps,.dif-grid,.flow,.feat-grid").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { if (c.classList.contains("reveal")) c.style.transitionDelay = (i % 6) * 0.09 + "s"; });
  });
  var stag = $$(".safe-list li,.pipe li,.road li,.inv-stats > div,.legend span");
  stag.forEach(function (el, i) { el.classList.add("stag"); el.style.setProperty("--i", i % 6); });
  if ("IntersectionObserver" in window && !reduce) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); sio.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -4% 0px" });
    stag.forEach(function (el) { sio.observe(el); });
  } else stag.forEach(function (el) { el.classList.add("in"); });

  if (!fine || reduce) return;   // дальше — только для мыши

  /* ---------- свечение под курсором на карточках ---------- */
  var cards = $$(".bt,.mk,.glass,.step,.dif,.safe-list li,.flow-step,.pipe li,.shot-cap,.calc,.cmp-wrap,.cta-card,.invest,.stab");
  cards.forEach(function (c) {
    c.classList.add("spot");
    var g = document.createElement("i"); g.className = "spot-glow"; g.setAttribute("aria-hidden", "true");
    var r = document.createElement("i"); r.className = "spot-ring"; r.setAttribute("aria-hidden", "true");
    c.appendChild(g); c.appendChild(r);
    c.addEventListener("pointermove", function (e) {
      var b = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - b.left) + "px");
      c.style.setProperty("--my", (e.clientY - b.top) + "px");
    });
  });

  /* ---------- большое свечение, которое плавно идёт за курсором ---------- */
  var glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);
  var tx = innerWidth / 2, ty = innerHeight / 3, cx = tx, cy = ty, seen = false;
  window.addEventListener("pointermove", function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen = true; glow.classList.add("on"); cx = tx; cy = ty; }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { glow.classList.remove("on"); seen = false; });
  (function loop() {
    cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
    glow.style.transform = "translate3d(" + (cx - 320) + "px," + (cy - 320) + "px,0)";
    requestAnimationFrame(loop);
  })();

  /* ---------- 3D-наклон карточек рынков ---------- */
  $$(".mk").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      c.classList.add("tilting");
      c.style.transform = "perspective(900px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-8px)";
    });
    c.addEventListener("pointerleave", function () { c.classList.remove("tilting"); c.style.transform = ""; });
  });

  /* ---------- главный экран: параллакс и наклон терминала ---------- */
  var hero = document.querySelector(".hero"), shot = document.querySelector(".hero-shot .frame");
  if (hero) hero.addEventListener("pointermove", function (e) {
    var b = hero.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    hero.style.setProperty("--px", (x * 34).toFixed(1) + "px");
    hero.style.setProperty("--py", (y * 22).toFixed(1) + "px");
  });
  if (shot) {
    var area = shot.parentNode;
    area.addEventListener("pointermove", function (e) {
      var b = shot.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      shot.classList.add("live-tilt");
      shot.style.transform = "rotateX(" + (3 - y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
    });
    area.addEventListener("pointerleave", function () { shot.classList.remove("live-tilt"); shot.style.transform = ""; });
  }

  /* ---------- магнитные кнопки ---------- */
  $$(".btn-lg,.nav-cta").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
})();
