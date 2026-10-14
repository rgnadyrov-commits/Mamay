/* Живой фон: облако частиц на WebGL, которое перетекает из фигуры в фигуру —
   «орда» → знак MAMAY → свечи → волны → сеть бирж. Без библиотек.
   Использование: MamayParticles(canvas, { shapes: ["galaxy","logo",...], count, hold, logo }) */
(function () {
  "use strict";
  var TAU = Math.PI * 2;
  var rnd = Math.random;
  var gauss = function () { return (rnd() + rnd() + rnd() - 1.5) / 1.5; };

  /* ---------- фигуры: N точек в кубе примерно [-1.2, 1.2] ---------- */
  function galaxy(n) {
    var p = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var arm = i % 3, r = Math.pow(rnd(), 0.6) * 1.35, a = arm * TAU / 3 + r * 3.4 + gauss() * 0.35;
      var gx = Math.cos(a) * r * 1.15, gz = Math.sin(a) * r, gy = gauss() * 0.1 * (1.4 - r), tl = 1.05;   // диск наклонён к зрителю
      p[i * 3] = gx; p[i * 3 + 1] = gy * Math.cos(tl) - gz * Math.sin(tl); p[i * 3 + 2] = gy * Math.sin(tl) + gz * Math.cos(tl);
    }
    return p;
  }

  function fromMask(n, mask, w, h, depth) {
    var pts = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (mask[y * w + x]) pts.push(x, y);
    var p = new Float32Array(n * 3), m = pts.length / 2, s = 2.3 / Math.max(w, h);
    for (var i = 0; i < n; i++) {
      var k = (rnd() * m | 0) * 2;
      p[i * 3] = (pts[k] - w / 2 + rnd()) * s; p[i * 3 + 1] = -(pts[k + 1] - h / 2 + rnd()) * s; p[i * 3 + 2] = gauss() * depth;
    }
    return p;
  }

  function logoShape(n, img) {
    var W = 160, H = 160, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d"), data = null;
    try {
      if (img && img.naturalWidth) {
        var sc = Math.min(W / img.naturalWidth, H / img.naturalHeight) * 0.92;
        var w = img.naturalWidth * sc, h = img.naturalHeight * sc;
        x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        data = x.getImageData(0, 0, W, H).data;
      }
    } catch (e) { data = null; }                 // открыт с диска: картинку читать нельзя — рисуем букву
    if (!data) {
      x.clearRect(0, 0, W, H); x.fillStyle = "#fff"; x.font = "900 150px Montserrat, Arial, sans-serif";
      x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("M", W / 2, H / 2 + 6);
      data = x.getImageData(0, 0, W, H).data;
    }
    var mask = new Uint8Array(W * H);
    for (var i = 0; i < W * H; i++) mask[i] = data[i * 4 + 3] > 120 ? 1 : 0;
    return fromMask(n, mask, W, H, 0.07);
  }

  function candles(n) {
    var p = new Float32Array(n * 3), C = 26, price = -0.55, list = [];
    for (var c = 0; c < C; c++) {
      var o = price, ch = (rnd() - 0.32) * 0.2, cl = o + ch, hi = Math.max(o, cl) + rnd() * 0.08, lo = Math.min(o, cl) - rnd() * 0.08;
      list.push([o, cl, hi, lo]); price = cl;
    }
    for (var i = 0; i < n; i++) {
      var k = i % C, d = list[k], xc = -1.25 + (k + 0.5) * (2.5 / C), z = gauss() * 0.06;
      if (rnd() < 0.82) {                        // тело свечи
        var b0 = Math.min(d[0], d[1]), b1 = Math.max(d[0], d[1]) + 0.012;
        p[i * 3] = xc + (rnd() - 0.5) * 0.06; p[i * 3 + 1] = b0 + rnd() * (b1 - b0);
      } else {                                   // тень
        p[i * 3] = xc + (rnd() - 0.5) * 0.008; p[i * 3 + 1] = d[3] + rnd() * (d[2] - d[3]);
      }
      p[i * 3 + 2] = z;
    }
    return p;
  }

  function waves(n) {
    // импульс 0-1-2-3-4-5 и коррекция a-b-c
    var V = [[-1.3, -0.7], [-0.9, -0.15], [-0.65, -0.45], [-0.05, 0.6], [0.25, 0.3], [0.6, 0.85], [0.85, 0.35], [1.0, 0.6], [1.3, 0.05]];
    var segs = [], L = 0;
    for (var s = 0; s < V.length - 1; s++) { var dx = V[s + 1][0] - V[s][0], dy = V[s + 1][1] - V[s][1], l = Math.hypot(dx, dy); segs.push(l); L += l; }
    var p = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var t = rnd() * L, j = 0;
      while (t > segs[j] && j < segs.length - 1) { t -= segs[j]; j++; }
      var u = t / segs[j], x0 = V[j][0] + (V[j + 1][0] - V[j][0]) * u, y0 = V[j][1] + (V[j + 1][1] - V[j][1]) * u;
      var a = rnd() * TAU, r = 0.035 * Math.sqrt(rnd());
      if (rnd() < 0.08) { r = 0.06 + rnd() * 0.05; }            // свечение узлов
      p[i * 3] = x0 + Math.cos(a) * r * 0.4; p[i * 3 + 1] = y0 + Math.sin(a) * r; p[i * 3 + 2] = Math.cos(a * 1.7) * r;
    }
    return p;
  }

  function network(n) {
    // шесть бирж на кольце и дуги переводов между ними
    var K = 6, R = 1.05, nodes = [];
    for (var k = 0; k < K; k++) { var a = k * TAU / K + 0.3; nodes.push([Math.cos(a) * R, Math.sin(a) * R * 0.55, Math.sin(a) * R * 0.6]); }
    var pairs = [];
    for (var i = 0; i < K; i++) for (var j = i + 1; j < K; j++) pairs.push([i, j]);
    var p = new Float32Array(n * 3);
    for (var q = 0; q < n; q++) {
      if (rnd() < 0.4) {                         // биржи — плотные сферы
        var nd = nodes[q % K], th = rnd() * TAU, ph = Math.acos(2 * rnd() - 1), rr = 0.11 * Math.cbrt(rnd());
        p[q * 3] = nd[0] + rr * Math.sin(ph) * Math.cos(th); p[q * 3 + 1] = nd[1] + rr * Math.cos(ph); p[q * 3 + 2] = nd[2] + rr * Math.sin(ph) * Math.sin(th);
      } else {                                   // дуги между ними
        var pr = pairs[q % pairs.length], A = nodes[pr[0]], B = nodes[pr[1]], t = rnd(), lift = 0.45;
        var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 + lift, mz = (A[2] + B[2]) / 2, u = 1 - t;
        p[q * 3] = u * u * A[0] + 2 * u * t * mx + t * t * B[0] + gauss() * 0.01;
        p[q * 3 + 1] = u * u * A[1] + 2 * u * t * my + t * t * B[1] + gauss() * 0.01;
        p[q * 3 + 2] = u * u * A[2] + 2 * u * t * mz + t * t * B[2] + gauss() * 0.01;
      }
    }
    return p;
  }

  var MAKERS = { galaxy: galaxy, logo: null, candles: candles, waves: waves, network: network };

  /* ---------- WebGL ---------- */
  var VS = [
    "attribute vec3 a; attribute vec3 b; attribute vec2 r;",
    "uniform float m, tm, yaw, pitch, aspect, size, zoom, field; uniform vec2 shift, mouse;",
    "varying float vc; varying float va;",
    "void main(){",
    "  float k = clamp(m * 1.45 - r.x * 0.45, 0.0, 1.0); k = k * k * (3.0 - 2.0 * k);",
    "  vec3 p = mix(a, b, k);",
    "  float burst = sin(3.14159 * k);",
    "  p += burst * 0.32 * vec3(sin(r.x * 91.0), cos(r.y * 57.0), sin(r.x * 37.0 + r.y * 13.0));",
    "  p += 0.012 * vec3(sin(tm * 1.3 + r.x * 40.0), cos(tm * 1.1 + r.y * 33.0), sin(tm * 0.9 + r.y * 21.0));",
    "  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);",
    "  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);",
    "  p = vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);",
    "  float z = p.z + 3.2;",
    "  gl_Position = vec4((p.x * zoom / z) / aspect + shift.x, p.y * zoom / z + shift.y, 0.0, 1.0);",
    "  float tw = 0.65 + 0.35 * sin(tm * 2.0 + r.y * 60.0);",
    "  gl_PointSize = size * tw * (3.2 / z) * (1.0 + burst * 0.6);",
    "  vc = r.y; va = (0.55 + 0.45 * tw) * clamp(1.6 - z * 0.25, 0.35, 1.0);",
    // звёздное поле на всю ширину: медленно плывёт и в фигуры не собирается
    "  if (r.x < field) {",
    "    float d = fract(r.x * 53.0);",
    "    float fx = fract(r.y * 1.7 + tm * 0.006 * (0.4 + d)) * 2.2 - 1.1;",
    "    float fy = (fract(r.x * 37.0 + r.y * 3.0) * 2.0 - 1.0) * 1.05 + 0.02 * sin(tm * 0.4 + r.y * 20.0);",
    "    gl_Position = vec4(fx + mouse.x * 0.02 * d, fy - mouse.y * 0.02 * d, 0.0, 1.0);",
    "    gl_PointSize = size * (0.45 + d * 0.7) * tw;",
    "    va = (0.25 + 0.45 * d) * tw;",
    "  }",
    "}"].join("\n");
  var FS = [
    "precision mediump float; varying float vc; varying float va; uniform float alpha;",
    "void main(){",
    "  vec2 d = gl_PointCoord - 0.5; float l = dot(d, d);",
    "  if (l > 0.25) discard;",
    "  float g = exp(-l * 14.0);",
    "  vec3 gold = vec3(0.91, 0.76, 0.42), teal = vec3(0.13, 0.83, 0.77), white = vec3(1.0, 0.96, 0.86);",
    "  vec3 c = vc < 0.62 ? gold : (vc < 0.93 ? teal : white);",
    "  float k = g * va * alpha;",
    "  gl_FragColor = vec4(c * k, k);",
    "}"].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  window.MamayParticles = function (canvas, opt) {
    opt = opt || {};
    var gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return null;
    var small = Math.min(innerWidth, innerHeight) < 700 || (navigator.hardwareConcurrency || 4) <= 2;
    var N = opt.count || (small ? 7000 : 20000);
    var shapes = opt.shapes || ["galaxy", "logo", "candles", "waves", "network"];
    var hold = opt.hold || 5200, morph = opt.morph || 2600;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var pr = gl.createProgram();
    gl.attachShader(pr, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var U = {}; ["m", "tm", "yaw", "pitch", "aspect", "size", "zoom", "shift", "alpha", "field", "mouse"].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });

    var rr = new Float32Array(N * 2);
    for (var i = 0; i < N * 2; i++) rr[i] = rnd();
    var bufA = gl.createBuffer(), bufB = gl.createBuffer(), bufR = gl.createBuffer();
    var attr = function (name, buf, size) { var loc = gl.getAttribLocation(pr, name); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR); gl.bufferData(gl.ARRAY_BUFFER, rr, gl.STATIC_DRAW);
    attr("r", bufR, 2);

    var cache = {};
    var make = function (name) {
      if (cache[name]) return cache[name];
      var f = name === "logo" ? function (n) { return logoShape(n, opt.logoImg); } : MAKERS[name];
      return (cache[name] = f(N));
    };
    var idx = 0, from = make(shapes[0]), to = make(shapes[shapes.length > 1 ? 1 : 0]);
    var upload = function () {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufA); gl.bufferData(gl.ARRAY_BUFFER, from, gl.DYNAMIC_DRAW); attr("a", bufA, 3);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufB); gl.bufferData(gl.ARRAY_BUFFER, to, gl.DYNAMIC_DRAW); attr("b", bufB, 3);
    };
    upload();
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);

    var dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.6);
    var W = 0, H = 0;
    var resize = function () {
      var b = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(b.width * dpr)); H = Math.max(1, Math.round(b.height * dpr));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.viewport(0, 0, W, H);
    };
    resize();
    window.addEventListener("resize", resize);

    var mx = 0, my = 0, tx = 0, ty = 0;
    if (opt.mouse !== false) window.addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });

    var visible = true, phaseStart = performance.now(), running = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(canvas);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) loop(); });

    var draw = function (now) {
      var el = now - phaseStart, m = 0;
      if (shapes.length > 1) {
        if (el > hold) m = Math.min(1, (el - hold) / morph);
        if (el > hold + morph) {                 // фигура собрана — следующая
          idx = (idx + 1) % shapes.length; from = to; to = make(shapes[(idx + 1) % shapes.length]); upload();
          phaseStart = now; m = 0;
        }
      }
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      var t = now / 1000;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.m, m); gl.uniform1f(U.tm, t);
      gl.uniform1f(U.yaw, (opt.spin === false ? 0 : Math.sin(t * 0.18) * 0.55) + mx * 0.6);
      gl.uniform1f(U.pitch, -0.12 + my * 0.35 + Math.sin(t * 0.13) * 0.06);
      gl.uniform1f(U.aspect, W / H);
      gl.uniform1f(U.size, (opt.size || 3.4) * dpr);
      var wide = opt.side && W / dpr >= 1100;      // на широком экране фигура справа от текста
      gl.uniform1f(U.zoom, opt.zoom || (wide ? 1.3 * W / H : W / H < 1 ? 2.1 : 2.45));      // фигура по высоте экрана, за текстом      // справа фигура занимает правую половину
      gl.uniform2f(U.shift, wide ? 0.5 : (opt.shiftX || 0), wide ? 0.04 : (opt.shiftY || 0));
      gl.uniform1f(U.field, opt.field == null ? 0.3 : opt.field);
      gl.uniform2f(U.mouse, mx, my);
      gl.uniform1f(U.alpha, (opt.alpha || 0.85) * (opt.side && !wide ? 0.55 : 1));
      gl.drawArrays(gl.POINTS, 0, N);
    };
    var loop = function () {
      if (running) return;
      running = true;
      (function f(now) {
        if (!visible || document.hidden || reduce) { running = false; return; }
        draw(now);
        requestAnimationFrame(f);
      })(performance.now());
    };
    if (reduce) { to = from; draw(performance.now()); } else loop();
    return { stop: function () { visible = false; } };
  };
})();
