/* KLN: perilaku bersama semua halaman (tema, menu, salin, progres gulir, animasi muncul). */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* Tema terang dan gelap */
  var themeBtn = $('#theme');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store.set('kln-theme', next);
  });

  /* Menu layar kecil */
  var bar = $('#bar'), menu = $('#menu');
  function closeMenu() { if (bar && menu) { bar.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } }
  if (menu) menu.addEventListener('click', function () { var o = bar.classList.toggle('open'); menu.setAttribute('aria-expanded', String(o)); });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* Ingat pilihan bahasa untuk kunjungan berikutnya */
  $$('.lang a').forEach(function (a) { a.addEventListener('click', function () { store.set('kln-lang', a.getAttribute('hreflang')); }); });

  /* Tombol salin: data-copy="teks" atau data-copy-from="id elemen" */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.copy'); if (!b) return;
    var src = b.getAttribute('data-copy-from') ? document.getElementById(b.getAttribute('data-copy-from')) : b.previousElementSibling;
    var txt = b.getAttribute('data-copy') || (src ? src.textContent : '');
    var label = b.getAttribute('data-label') || b.textContent; b.setAttribute('data-label', label);
    function done() { b.textContent = b.getAttribute('data-copied') || label; setTimeout(function () { b.textContent = label; }, 1500); }
    function select() { if (!src) return; var r = document.createRange(); r.selectNodeContents(src); var g = getSelection(); g.removeAllRanges(); g.addRange(r); }
    try { navigator.clipboard.writeText(txt).then(done, select); } catch (err) { select(); }
  });

  /* Garis progres gulir dan bayangan navbar */
  var prog = $('#progress'), tick = false;
  function onScroll() {
    tick = false;
    var max = root.scrollHeight - innerHeight, y = window.scrollY;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (bar) bar.classList.toggle('scrolled', y > 8);
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Animasi muncul saat bagian masuk layar (isi tetap terbaca tanpa JS) */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); } }); }, { threshold: 0.12 });
    $$('.rv').forEach(function (el) { if (el.getBoundingClientRect().top > innerHeight * 0.9) { el.classList.add('pre'); io.observe(el); } });
  }
})();
