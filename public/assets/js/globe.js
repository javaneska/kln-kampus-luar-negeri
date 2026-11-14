/* KLN: globe hero (D3 geo orthographic di canvas). Parameter ada di CONFIG. */
(function () {
  'use strict';

  /* ---------------- PARAMETER YANG MUDAH DIUBAH ---------------- */
  var CONFIG = {
    cycleSeconds: 40,        // durasi satu siklus penuh (disarankan 30 sampai 40)
    home: [117, 3],          // [bujur, lintang] pusat tampilan saat globe "pulang" ke Indonesia
    origin: { lon: 106.8, lat: -6.2, id: 'Indonesia', en: 'Indonesia' },   // Jakarta
    follow: 0.78,            // 0 sampai 1: seberapa jauh globe berputar mengikuti pesawat
    driftDeg: 5,             // ayunan pelan globe (derajat bujur) selama satu siklus
    flightBase: 2.4,         // detik: durasi dasar tiap penerbangan
    flightPerRad: 1.9,       // detik tambahan per radian jarak (rute jauh terbang lebih lama)
    holdSeconds: 1.0,        // jeda di tujuan sebelum globe mulai kembali
    returnSeconds: 2.2,      // lama globe kembali ke Indonesia
    labelSeconds: 2.0,       // lama label negara terlihat
    trailFadeSeconds: 1.6,   // lama jejak memudar setelah pesawat tiba
    trailLengthRad: 0.9,     // panjang jejak yang terlihat di belakang pesawat (radian)
    altitude: 0.07,          // tinggi lengkung terbang, sebagai bagian dari jari-jari globe
    planeSize: 0.052,        // ukuran pesawat, sebagai bagian dari jari-jari globe
    graticuleStep: 20,       // jarak garis lintang dan bujur (derajat)
    maxDpr: 2,               // batas devicePixelRatio
    reducedRoute: 0,         // indeks rute yang ditampilkan pada mode statis (reduced motion)
    // start = detik mulai pada garis waktu 40 detik. Paling banyak dua pesawat aktif bersamaan.
    routes: [
      { id: 'Australia',       en: 'Australia',      lon: 151.2,  lat: -33.9, start: 0.4 },
      { id: 'Singapura',       en: 'Singapore',      lon: 103.8,  lat: 1.35,  start: 2.6 },
      { id: 'China',           en: 'China',          lon: 116.4,  lat: 39.9,  start: 5.6 },
      { id: 'Jepang',          en: 'Japan',          lon: 139.7,  lat: 35.7,  start: 7.8 },
      { id: 'Korea',           en: 'Korea',          lon: 127.0,  lat: 37.6,  start: 10.4 },
      { id: 'Timur Tengah',    en: 'Middle East',    lon: 55.3,   lat: 25.2,  start: 14.2 },
      { id: 'Inggris',         en: 'United Kingdom', lon: -0.13,  lat: 51.5,  start: 16.4 },
      { id: 'Eropa',           en: 'Europe',         lon: 9.2,    lat: 45.5,  start: 19.0 },
      { id: 'Kanada',          en: 'Canada',         lon: -79.4,  lat: 43.7,  start: 26.4 },
      { id: 'Amerika Serikat', en: 'United States',  lon: -118.2, lat: 34.1,  start: 28.6 }
    ],
    aria: {
      id: 'Ilustrasi globe berputar: pesawat kertas terbang dari Indonesia ke berbagai belahan dunia.',
      en: 'Illustration of a rotating globe: paper planes flying from Indonesia to places around the world.'
    },
    toggle: {
      id: { pause: 'Jeda animasi', play: 'Putar animasi' },
      en: { pause: 'Pause animation', play: 'Play animation' }
    }
  };
  var TIMELINE = 40; // satuan garis waktu internal; cycleSeconds menskalakan semuanya

  /* ---------------- Persiapan ---------------- */
  var wrap = document.getElementById('kglobe');
  var canvas = document.getElementById('globe-canvas');
  var fallback = document.getElementById('globe-fallback');
  var toggle = document.getElementById('globe-toggle');
  if (!wrap || !canvas) return;

  var ctx = null, land = null;
  try {
    ctx = canvas.getContext('2d');
    var topo = window.KLN_LAND;
    land = topojson.feature(topo, topo.objects.land);
    if (!ctx || !window.d3 || !d3.geoOrthographic) throw new Error('canvas atau d3 tidak tersedia');
  } catch (e) {
    return; // SVG statis tetap tampil
  }

  var RAD = Math.PI / 180;
  var proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
  var path = d3.geoPath(proj, ctx);
  var graticule = d3.geoGraticule().step([CONFIG.graticuleStep, CONFIG.graticuleStep])();
  var originLL = [CONFIG.origin.lon, CONFIG.origin.lat];

  function vec(ll) { var l = ll[0] * RAD, p = ll[1] * RAD, c = Math.cos(p); return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)]; }
  function lonlat(v) { var n = Math.hypot(v[0], v[1], v[2]) || 1; return [Math.atan2(v[1], v[0]) / RAD, Math.asin(v[2] / n) / RAD]; }
  function smooth(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  var homeV = vec(CONFIG.home);

  var routes = CONFIG.routes.map(function (r) {
    var dest = [r.lon, r.lat], dist = d3.geoDistance(originLL, dest);
    var n = Math.max(10, Math.round(dist / 0.03)), interp = d3.geoInterpolate(originLL, dest), pts = [];
    for (var k = 0; k <= n; k++) pts.push(interp(k / n));
    return { cfg: r, dest: dest, dist: dist, n: n, pts: pts, interp: interp, dur: CONFIG.flightBase + CONFIG.flightPerRad * dist };
  });

  /* ---------------- Warna dari token ---------------- */
  var C = {};
  function readColors() {
    var cs = getComputedStyle(wrap);
    ['sea', 'rim', 'grat', 'land', 'land-tint', 'land-edge', 'trail', 'origin', 'arrive', 'dest', 'plane', 'plane-fold', 'plane-edge', 'shadow', 'label-bg', 'label-line', 'label-ink']
      .forEach(function (k) { C[k] = cs.getPropertyValue('--g-' + k).trim() || '#888'; });
    C.font = cs.getPropertyValue('--sans').trim() || 'system-ui, sans-serif';
  }
  function lang() { return (document.documentElement.lang || 'id').toLowerCase().indexOf('en') === 0 ? 'en' : 'id'; }

  /* ---------------- Ukuran ---------------- */
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  function resize() {
    var b = wrap.getBoundingClientRect();
    W = Math.max(1, b.width); H = Math.max(1, b.height);
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    R = Math.min(W / 2 - 2, H * 0.54);       // di layar sempit globe sedikit terpotong di bawah
    cx = W / 2; cy = Math.max(H / 2, R + 2);
    proj.translate([cx, cy]).scale(R);
  }

  /* ---------------- Keadaan tiap rute pada waktu t ---------------- */
  function stateAt(r, t) {
    var lt = (((t - r.cfg.start) % TIMELINE) + TIMELINE) % TIMELINE, d = r.dur;
    var s = { flying: lt < d, p: lt < d ? easeInOut(lt / d) : 1, since: lt - d, env: 0 };
    if (lt < d * 0.35) s.env = smooth(lt / (d * 0.35));
    else if (lt < d + CONFIG.holdSeconds) s.env = 1;
    else s.env = 1 - smooth((lt - d - CONFIG.holdSeconds) / CONFIG.returnSeconds);
    return s;
  }

  /* Pusat tampilan: campuran halus antara Indonesia dan posisi pesawat yang aktif */
  function cameraAt(t, states) {
    var sx = 0, sy = 0, sz = 0, keep = 1;
    for (var i = 0; i < routes.length; i++) {
      var e = states[i].env; if (e <= 0) continue;
      var v = vec(routes[i].interp(states[i].p));
      sx += v[0] * e; sy += v[1] * e; sz += v[2] * e; keep *= (1 - e);
    }
    var a = CONFIG.follow * (1 - keep), n = Math.hypot(sx, sy, sz);
    var c = n > 1e-6
      ? lonlat([homeV[0] * (1 - a) + sx / n * a, homeV[1] * (1 - a) + sy / n * a, homeV[2] * (1 - a) + sz / n * a])
      : CONFIG.home.slice();
    c[0] += CONFIG.driftDeg * Math.sin(2 * Math.PI * t / TIMELINE);
    return c;
  }

  /* ---------------- Menggambar ---------------- */
  var center = CONFIG.home;
  function visible(ll) { return d3.geoDistance(ll, center) < Math.PI / 2 - 0.03; }

  function drawGlobe() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fillStyle = C.sea; ctx.fill();
    ctx.beginPath(); path(graticule); ctx.strokeStyle = C.grat; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.beginPath(); path(land);
    ctx.fillStyle = C.land; ctx.fill();
    ctx.globalAlpha = 0.16; ctx.fillStyle = C['land-tint']; ctx.fill();
    ctx.globalAlpha = 0.45; ctx.strokeStyle = C['land-edge']; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.strokeStyle = C.rim; ctx.lineWidth = 1; ctx.stroke();
  }

  function drawTrail(r, p, alpha) {
    if (alpha <= 0) return;
    ctx.strokeStyle = C.trail; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
    var head = p * r.n;
    for (var k = 0; k < r.n && k + 1 <= head + 0.5; k++) {
      if (k % 3 === 2) continue;                               // pola putus-putus: dua ruas, satu celah
      var behind = (head - k) / r.n * r.dist;                  // jarak di belakang pesawat (radian)
      var a = alpha * Math.max(0, 1 - behind / CONFIG.trailLengthRad);
      if (a <= 0.02 || !visible(r.pts[k]) || !visible(r.pts[k + 1])) continue;
      var p0 = proj(r.pts[k]), p1 = proj(r.pts[k + 1]);
      ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function planeShape(x, y, ang, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  }
  function drawPlane(r, p, alpha) {
    var ll = r.interp(p); if (!visible(ll) || alpha <= 0) return;
    var g = proj(ll), q = p < 0.985 ? proj(r.interp(p + 0.015)) : proj(r.interp(p - 0.015));
    var ang = Math.atan2(q[1] - g[1], q[0] - g[0]); if (p >= 0.985) ang += Math.PI;
    var lift = Math.sin(Math.PI * p), k = 1 + CONFIG.altitude * lift;
    var x = cx + (g[0] - cx) * k, y = cy + (g[1] - cy) * k - R * CONFIG.altitude * 0.5 * lift;
    var s = Math.max(10, R * CONFIG.planeSize) * (1 + 0.22 * lift);
    // bayangan lembut di permukaan globe: dua lapis siluet
    [[1.25, 0.07], [0.95, 0.13]].forEach(function (b) {
      planeShape(g[0], g[1] + 1, ang, s * b[0] * 0.8);
      ctx.globalAlpha = alpha * b[1] * (0.6 + 0.4 * lift); ctx.fillStyle = C.shadow;
      ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-1, -0.62); ctx.lineTo(-0.55, 0); ctx.lineTo(-1, 0.62); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    planeShape(x, y, ang, s);
    ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.lineWidth = 1.1 / s; ctx.strokeStyle = C['plane-edge'];
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-1, -0.62); ctx.lineTo(-0.55, 0); ctx.closePath(); ctx.fillStyle = C.plane; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-0.55, 0); ctx.lineTo(-1, 0.62); ctx.closePath(); ctx.fillStyle = C['plane-fold']; ctx.fill(); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function drawLabel(text, x, y, alpha, below) {
    if (alpha <= 0) return;
    ctx.font = '600 12px ' + C.font;
    var w = Math.ceil(ctx.measureText(text).width) + 16, h = 24;
    var lx = Math.min(Math.max(x - w / 2, 4), W - w - 4), ly = below ? y + 12 : y - 12 - h;
    ly = Math.min(Math.max(ly, 4), H - h - 4);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(lx, ly, w, h, 12); else ctx.rect(lx, ly, w, h);
    ctx.fillStyle = C['label-bg']; ctx.fill(); ctx.strokeStyle = C['label-line']; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C['label-ink']; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(text, lx + w / 2, ly + h / 2 + 0.5);
    ctx.globalAlpha = 1;
  }

  function drawDot(pt, r, fill, alpha) {
    ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(pt[0], pt[1], r, 0, 2 * Math.PI);
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.sea; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
  }

  function drawOrigin(pulse) {
    if (!visible(originLL)) return;
    var o = proj(originLL);
    if (pulse >= 0) {
      ctx.globalAlpha = 0.55 * (1 - pulse); ctx.beginPath(); ctx.arc(o[0], o[1], 6 + 14 * pulse, 0, 2 * Math.PI);
      ctx.strokeStyle = C.origin; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
    }
    drawDot(o, 5.5, C.origin, 1);
    drawLabel(CONFIG.origin[lang()], o[0], o[1], 1, pulse >= 0);   // mode statis: label di atas agar tidak menutupi rute
  }

  function drawArrival(r, since) {
    if (!visible(r.dest)) return;
    var d = proj(r.dest), total = CONFIG.labelSeconds + 0.5;
    if (since < 0 || since > total) return;
    var fade = since < 0.25 ? since / 0.25 : since > CONFIG.labelSeconds ? 1 - (since - CONFIG.labelSeconds) / 0.5 : 1;
    if (since < 1.1) {                                         // denyut singkat saat tiba
      var u = since / 1.1;
      ctx.globalAlpha = 0.4 * (1 - u); ctx.beginPath(); ctx.arc(d[0], d[1], 5 + 20 * u, 0, 2 * Math.PI); ctx.fillStyle = C.arrive; ctx.fill();
      ctx.globalAlpha = 0.95 * (1 - u); ctx.strokeStyle = C.arrive; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
    }
    drawDot(d, 4.5, C.dest, fade);
    drawLabel(r.cfg[lang()], d[0], d[1], fade, false);
  }

  /* Satu frame animasi pada waktu t (0 sampai TIMELINE) */
  function drawAnimated(t, wall) {
    var states = routes.map(function (r) { return stateAt(r, t); });
    center = cameraAt(t, states);
    proj.rotate([-center[0], -center[1]]);
    drawGlobe();
    var i, s, r;
    for (i = 0; i < routes.length; i++) {
      s = states[i]; r = routes[i];
      if (s.flying) drawTrail(r, s.p, 0.9);
      else if (s.since < CONFIG.trailFadeSeconds) drawTrail(r, 1, 0.9 * (1 - s.since / CONFIG.trailFadeSeconds));
    }
    drawOrigin((wall % 2.4) / 2.4);
    for (i = 0; i < routes.length; i++) if (!states[i].flying) drawArrival(routes[i], states[i].since);
    for (i = 0; i < routes.length; i++) {
      s = states[i]; r = routes[i];
      if (s.flying) drawPlane(r, s.p, Math.min(1, s.p / 0.06));
      else if (s.since < 0.35) drawPlane(r, 1, 1 - s.since / 0.35);
    }
  }

  /* Mode statis untuk prefers-reduced-motion: satu rute, satu label, tanpa rotasi */
  function drawStatic() {
    var r = routes[CONFIG.reducedRoute] || routes[0];
    center = CONFIG.home.slice();
    proj.rotate([-center[0], -center[1]]);
    drawGlobe();
    var keep = CONFIG.trailLengthRad; CONFIG.trailLengthRad = 1e9; drawTrail(r, 0.7, 0.9); CONFIG.trailLengthRad = keep;
    drawOrigin(-1);
    var d = proj(r.dest); drawDot(d, 4.5, C.dest, 1); drawLabel(r.cfg[lang()], d[0], d[1], 1, true);
    drawPlane(r, 0.7, 1);
  }

  /* ---------------- Pengendali: rAF, visibilitas, reduced motion ---------------- */
  var mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var inView = true, userPaused = false, raf = 0, last = 0, clock = 0, failed = false;

  function fail() {                                            // bila ada galat saat menggambar, kembali ke SVG statis
    failed = true; cancelAnimationFrame(raf); raf = 0;
    canvas.hidden = true; toggle.hidden = true; fallback.removeAttribute('hidden');
  }
  function render() {
    if (failed) return;
    try {
      if (mqReduce.matches) drawStatic();
      else drawAnimated((clock * TIMELINE / CONFIG.cycleSeconds) % TIMELINE, clock);
    } catch (e) { fail(); }
  }
  function frame(ts) {
    raf = 0;
    if (last) clock += Math.min(0.1, (ts - last) / 1000);     // batasi lompatan waktu setelah jeda
    last = ts;
    render();
    schedule();
  }
  function shouldRun() { return !failed && inView && !document.hidden && !userPaused && !mqReduce.matches; }
  function schedule() {
    if (shouldRun()) { if (!raf) raf = requestAnimationFrame(frame); }
    else { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }
  }
  function refresh() { readColors(); syncText(); render(); schedule(); }

  function syncText() {
    var L = lang();
    canvas.setAttribute('aria-label', CONFIG.aria[L]);
    toggle.setAttribute('aria-label', CONFIG.toggle[L][userPaused ? 'play' : 'pause']);
    toggle.setAttribute('aria-pressed', String(userPaused));
    document.getElementById('ico-pause').toggleAttribute('hidden', userPaused);
    document.getElementById('ico-play').toggleAttribute('hidden', !userPaused);
    toggle.hidden = failed || mqReduce.matches;
  }

  toggle.addEventListener('click', function () { userPaused = !userPaused; syncText(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.05 }).observe(wrap);
  }
  if ('ResizeObserver' in window) new ResizeObserver(function () { resize(); render(); }).observe(wrap);
  else window.addEventListener('resize', function () { resize(); render(); });
  // Sakelar ID/EN dan tema mengubah atribut pada <html>; komponen cukup mengamatinya.
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme', 'class'] });
  if (window.matchMedia) {
    var mqDark = matchMedia('(prefers-color-scheme: dark)');
    [mqDark, mqReduce].forEach(function (m) { if (m.addEventListener) m.addEventListener('change', refresh); else if (m.addListener) m.addListener(refresh); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);

  resize(); readColors();
  canvas.hidden = false; fallback.setAttribute('hidden', '');
  syncText(); render(); schedule();
})();
