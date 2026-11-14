/* KLN: halaman negara tujuan (tab negara, daftar kampus, tabel perbandingan, daftar pendek). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KLN = window.KLN;
  var SHORT = { id: 'Halo KLN, saya ingin membahas rencana kuliah di: ', en: 'Hello KLN, I would like to discuss studying in: ' };
  var JS = {
    id: {
      h1: 'Pilih negara yang cocok dengan rencanamu.', tagline: 'Satu rencana, banyak kampus dunia.', copied: 'Tersalin', copy: 'Salin',
      lvl: { s1: 'Sarjana', s2: 'Magister', s3: 'Doktor' },
      intake: 'Jadwal masuk (umum)', langl: 'Bahasa pengantar (umum)', cost: 'Biaya dan syarat', costv: 'Hubungi konselor',
      consh: 'Yang perlu dipertimbangkan', verify: 'Gambaran umum. Konselor mengonfirmasi ketentuan terbaru sebelum kamu memutuskan.',
      add: 'Tambah ke daftar pendek', added: 'Ada di daftar pendek', ask: 'Tanya Aura tentang negara ini',
      shorttitle: 'Daftar pendek:', remove: 'Hapus ', rows: ['Jenjang', 'Jadwal masuk (umum)', 'Bahasa pengantar', 'Kampus dalam daftar', 'Biaya dan syarat'],
      uni: 'Kampus dalam daftar KLN', usearch: 'Cari kampus atau kota', unote: 'Daftar per 8 Oktober 2026 dan dapat berubah. Konselor mengonfirmasi program yang tersedia.', ucount: 'kampus',
      country: 'Negara', globeA: 'Negara tujuan', pinned: 'Di daftar'
    },
    en: {
      h1: 'Choose the country that fits your plan.', tagline: 'One plan, campuses around the world.', copied: 'Copied', copy: 'Copy',
      lvl: { s1: 'Bachelor’s', s2: 'Master’s', s3: 'Doctorate' },
      intake: 'Intake (typical)', langl: 'Language of instruction (typical)', cost: 'Costs and requirements', costv: 'Contact an advisor',
      consh: 'What to consider', verify: 'A general overview. An advisor confirms the latest details before you decide.',
      add: 'Add to shortlist', added: 'On your shortlist', ask: 'Ask Aura about this country',
      shorttitle: 'Shortlist:', remove: 'Remove ', rows: ['Level', 'Intake (typical)', 'Language of instruction', 'Universities on the list', 'Costs and requirements'],
      uni: 'Universities on the KLN list', usearch: 'Search university or city', unote: 'List as of October 8, 2026, subject to change. An advisor confirms which programs are available.', ucount: 'universities',
      country: 'Country', globeA: 'Destinations', pinned: 'Listed'
    }
  };

  var UNIS = window.KLN_UNIS || {};
  var D = [
    { k: 'us', tone: 'brand', lv: ['s1', 's2', 's3'],
      name: { id: 'Amerika Serikat', en: 'United States' },
      intake: { id: 'Musim gugur (Agustus) dan semi (Januari)', en: 'Fall (August) and spring (January)' },
      lang: { id: 'Inggris', en: 'English' },
      cons: {
        id: ['Banyak kampus meminta bukti kemampuan bahasa Inggris. Sebagian juga menimbang tes seperti SAT, ACT, GRE, atau GMAT, dan kebijakannya berbeda tiap kampus.', 'Di banyak kampus, mahasiswa sarjana dapat menentukan jurusan setelah menjalani tahun-tahun awal, sehingga ada ruang menjajaki minat.', 'Biaya dan peluang beasiswa sangat beragam antar kampus. Bandingkan per program.'],
        en: ['Many universities ask for proof of English. Some also weigh tests such as the SAT, ACT, GRE, or GMAT, and policies differ by university.', 'At many universities, undergraduates can choose a major after the early years, which leaves room to explore interests.', 'Costs and scholarship opportunities vary widely between universities. Compare by program.'] } },
    { k: 'ca', tone: 'ember', lv: ['s1', 's2', 's3'],
      name: { id: 'Kanada', en: 'Canada' },
      intake: { id: 'September, Januari, dan Mei', en: 'September, January, and May' },
      lang: { id: 'Inggris; sebagian program di Quebec berbahasa Prancis', en: 'English; some programs in Quebec are taught in French' },
      cons: {
        id: ['Pilihan institusi mencakup universitas, kolese, dan politeknik. Cek jenis institusi dan jenis kredensial yang diberikan tiap program.', 'Ketentuan dapat berbeda antarprovinsi. Konselor memeriksa ketentuan terbaru sebelum kamu memutuskan.', 'Jadwal masuk lebih dari satu kali setahun pada banyak program memberi fleksibilitas waktu mulai.'],
        en: ['Options include universities, colleges, and polytechnics. Check the type of institution and the credential each program awards.', 'Rules can differ between provinces. An advisor checks the latest before you decide.', 'More than one intake a year on many programs gives flexibility in when to start.'] } },
    { k: 'uk', tone: 'sky', lv: ['s1', 's2'],
      name: { id: 'Inggris', en: 'United Kingdom' },
      intake: { id: 'September dan Januari', en: 'September and January' },
      lang: { id: 'Inggris', en: 'English' },
      cons: {
        id: ['Program sarjana dan magister umumnya lebih singkat dibanding sistem lain, sehingga perlu dicek lamanya per program.', 'Pendaftaran sarjana umumnya melalui satu sistem terpusat dengan tenggat yang ketat.', 'Pernyataan pribadi dan referensi sering berperan penting. Siapkan jauh hari.'],
        en: ['Bachelor’s and master’s programs are generally shorter than in other systems, so check the length of each program.', 'Undergraduate applications generally go through one central system with firm deadlines.', 'The personal statement and references often matter a great deal. Prepare well ahead.'] } },
    { k: 'au', tone: 'sun', lv: ['s1', 's2'],
      name: { id: 'Australia', en: 'Australia' },
      intake: { id: 'Februari dan Juli', en: 'February and July' },
      lang: { id: 'Inggris', en: 'English' },
      cons: {
        id: ['Program berbahasa Inggris, dan bukti kemampuan bahasa umumnya diperlukan.', 'Aturan visa pelajar dan ketentuan terkait dapat berubah. Konselor memeriksa ketentuan terbaru sebelum kamu memutuskan.', 'Jadwal masuk lebih dari satu kali setahun memberi fleksibilitas waktu mulai.'],
        en: ['English-taught programs, and proof of English is generally needed.', 'Student visa rules and related conditions can change. An advisor checks the latest before you decide.', 'More than one intake a year gives flexibility in when to start.'] } },
    { k: 'nz', tone: 'leaf', lv: ['s1', 's2'],
      name: { id: 'Selandia Baru', en: 'New Zealand' },
      intake: { id: 'Februari dan Juli', en: 'February and July' },
      lang: { id: 'Inggris', en: 'English' },
      cons: {
        id: ['Daftar mencakup universitas serta institusi vokasi dan kreatif. Cek jenis institusi dan pengakuan program yang kamu minati.', 'Banyak program berorientasi praktik, sehingga cocok bila kamu menimbang jalur yang dekat dengan dunia kerja.', 'Biaya hidup dan peluang beasiswa dibandingkan per kota dan per program.'],
        en: ['The list includes universities as well as vocational and creative institutions. Check the type of institution and the recognition of the program you want.', 'Many programs are practice-oriented, which suits you if you are weighing a path close to the workplace.', 'Living costs and scholarship opportunities are compared by city and by program.'] } },
    { k: 'ie', tone: 'brand', lv: ['s1', 's2'],
      name: { id: 'Irlandia', en: 'Ireland' },
      intake: { id: 'September dan Januari', en: 'September and January' },
      lang: { id: 'Inggris', en: 'English' },
      cons: {
        id: ['Banyak institusi berada di kota besar, sehingga lokasi memengaruhi biaya hidup dan ketersediaan tempat tinggal. Rencanakan lebih awal.', 'Daftar mencakup universitas, institut teknologi, dan kolese khusus. Cek jenis institusi dan bidang unggulannya.', 'Syarat bahasa dan berkas mengikuti program. Konselor memeriksa ketentuan terbaru.'],
        en: ['Many institutions are in larger cities, so location affects living costs and housing availability. Plan early.', 'The list includes universities, institutes of technology, and specialist colleges. Check the type of institution and its areas of strength.', 'Language and document requirements follow the program. An advisor checks the latest.'] } },
    { k: 'my', tone: 'ember', lv: ['s1', 's2', 's3'],
      name: { id: 'Malaysia', en: 'Malaysia' },
      intake: { id: 'Beberapa kali setahun', en: 'Several times a year' },
      lang: { id: 'Inggris; sebagian program berbahasa Melayu', en: 'English; some programs in Malay' },
      cons: {
        id: ['Sebagian program bekerja sama dengan kampus di negara lain. Cek di mana gelar diberikan dan apakah perlu penyetaraan ijazah di Indonesia.', 'Dekat dengan Indonesia, sehingga perjalanan pulang relatif mudah.', 'Jadwal masuk sering lebih dari sekali setahun. Cek jadwal tiap program.'],
        en: ['Some programs are run jointly with universities in other countries. Check where the degree is awarded and whether degree equivalency is needed in Indonesia.', 'Close to Indonesia, which makes trips home relatively easy.', 'Intakes are often held more than once a year. Check each program’s schedule.'] } }
  ];
  D.forEach(function (d) { d.u = UNIS[d.k] || []; });
  /* Gambar panel: siluet peta negara yang sama dengan kartu di beranda */
  var MAPS = window.KLN_MAPS || {};
  function mapArt(d) {
    var m = MAPS[d.k]; if (!m) return '';
    return '<svg class="pmap t-' + d.tone + '" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<path class="m-land" d="' + m.d + '"/><path class="m-route" d="' + m.route + '"/>' +
      '<circle class="m-ring" cx="' + m.pin[0] + '" cy="' + m.pin[1] + '" r="5"/><circle class="m-pin" cx="' + m.pin[0] + '" cy="' + m.pin[1] + '" r="4.5"/>' +
      '<path class="m-plane" style="offset-path:path(\'' + m.route + '\')" d="M10 0L-9-6.5L-5 0L-9 6.5Z"/></svg>';
  }
  var TONES = { brand: 'var(--brand)', sun: 'var(--sun)', leaf: 'var(--leaf)', sky: 'var(--sky)', ember: 'var(--ember)' };
  var ONS = { brand: 'var(--on-brand)', sun: 'var(--on-sun)', leaf: '#ffffff', sky: '#0e2240', ember: '#0e2240' };

  var lang = KLN.lang, cur = 0, list = [];

  /* ---------- Hero arcs ---------- */
  var LM = window.KLN_LANDMARKS || {}, lmTimer = 0, lmLast = 0;
  function buildGlobe() { /* kerangka ilustrasi sudah ada di HTML */ }
  function playLm() {                                  // putar ulang rangkaian gerakan
    var f = $('#globe'); if (reduce) return;
    lmLast = Date.now(); f.classList.remove('play'); void f.offsetWidth; f.classList.add('play');
  }
  function syncGlobe(anim) {
    var d = D[cur], m = LM[d.k], f = $('#globe'), art = $('#lm-art'); if (!m) return;
    function put() { art.innerHTML = m.svg; art.setAttribute('data-k', d.k); art.setAttribute('aria-label', m[lang]); $('#lm-name').textContent = m[lang]; f.classList.remove('swap'); if (anim) playLm(); }
    clearTimeout(lmTimer);
    if (art.getAttribute('data-k') === d.k) { $('#lm-name').textContent = m[lang]; art.setAttribute('aria-label', m[lang]); if (anim) playLm(); return; }
    if (!anim || reduce) { put(); return; }
    f.classList.add('swap'); lmTimer = setTimeout(put, 220);
  }

  /* ---------- Tabs + panels ---------- */
  function renderTabs() {
    $('#tabs').innerHTML = D.map(function (d, i) {
      return '<button class="tab' + (list.indexOf(d.k) > -1 ? ' listed' : '') + '" role="tab" id="tab-' + d.k + '" aria-controls="p-' + d.k + '" aria-selected="' + (i === cur) + '" tabindex="' + (i === cur ? 0 : -1) + '" data-i="' + i + '" style="--c:' + TONES[d.tone] + '"><i></i>' + d.name[lang] +
        '<svg class="pinned" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="' + JS[lang].pinned + '"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>';
    }).join('');
  }
  function renderPanels(anim) {
    var J = JS[lang];
    $('#panels').innerHTML = D.map(function (d, i) {
      var on = list.indexOf(d.k) > -1;
      return '<div class="panel' + (i === cur && anim ? ' swap' : '') + '" role="tabpanel" id="p-' + d.k + '" aria-labelledby="tab-' + d.k + '"' + (i === cur ? '' : ' hidden') + '>' +
        '<div class="pcard" style="--c:' + TONES[d.tone] + ';--on:' + ONS[d.tone] + '">' + mapArt(d) +
        '<div class="pills">' + d.lv.map(function (l) { return '<span class="pill">' + J.lvl[l] + '</span>'; }).join('') + '</div>' +
        '<h2>' + d.name[lang] + '</h2><div class="meta"><span><b>' + J.intake + ':</b> ' + d.intake[lang] + '</span><span><b>' + J.langl + ':</b> ' + d.lang[lang] + '</span><span><b>' + J.cost + ':</b> ' + J.costv + '</span></div></div>' +
        '<div class="pbody"><h3>' + J.consh + '</h3><ol class="cons">' + d.cons[lang].map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ol>' +
        '' + uniBlock(d, i) + '<p class="verify"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg><span>' + J.verify + '</span></p>' +
        '<div class="prow"><button type="button" class="btn btn-secondary btn-pin" data-pin="' + d.k + '" aria-pressed="' + on + '">' + (on ? J.added : J.add) + '</button></div></div></div>';
    }).join('');
  }
  function esc(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var uq = '', uopen = false;
  function uniBlock(d, i) {
    var J = JS[lang];
    return '<details class="unis"' + (i === cur && uopen ? ' open' : '') + '><summary>' + J.uni + ' <span class="ucnt">' + d.u.length + '</span></summary><div class="uwrap">' +
      '<input class="usearch" type="search" value="' + esc(uq) + '" placeholder="' + J.usearch + '" aria-label="' + J.usearch + '" autocomplete="off">' +
      '<ul class="ulist">' + d.u.map(function (u) { return '<li data-s="' + esc((u[0] + ' ' + u[1]).toLowerCase()) + '"><span>' + esc(u[0]) + (u[2] ? ' <em class="utag">' + esc(u[2]) + '</em>' : '') + '</span><small>' + esc(u[1]) + '</small></li>'; }).join('') + '</ul>' +
      '<p class="unote">' + J.unote + '</p></div></details>';
  }
  function applyUq() { $$('.ulist li').forEach(function (li) { li.hidden = !!uq && li.getAttribute('data-s').indexOf(uq) < 0; }); }
  function select(i, focus, anim) {
    cur = i; renderTabs(); renderPanels(anim !== false); syncGlobe(anim !== false); renderTable();
    if (focus) { var b = $('#tab-' + D[i].k); b.focus(); b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
  }
  $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) select(+b.getAttribute('data-i'), false); });
  $('#tabs').addEventListener('keydown', function (e) {
    var k = e.key, n = D.length, i = cur;
    if (k === 'ArrowRight') i = (cur + 1) % n; else if (k === 'ArrowLeft') i = (cur - 1 + n) % n; else if (k === 'Home') i = 0; else if (k === 'End') i = n - 1; else return;
    e.preventDefault(); select(i, true);
  });
  $('#globe').addEventListener('mouseenter', function () { if (Date.now() - lmLast > 3500) playLm(); });
  $('#globe').addEventListener('click', function (e) {
    playLm();                                           // ketuk ilustrasi untuk memutar ulang
  });
  $('#panels').addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('unis')) uopen = e.target.open; }, true);
  $('#panels').addEventListener('input', function (e) { if (e.target.classList.contains('usearch')) { uq = e.target.value.trim().toLowerCase(); $$('.usearch').forEach(function (n) { if (n !== e.target) n.value = e.target.value; }); applyUq(); } });
  $('#panels').addEventListener('click', function (e) { var b = e.target.closest('[data-pin]'); if (b) togglePin(b.getAttribute('data-pin')); });

  /* ---------- Compare table ---------- */
  function renderTable() {
    var J = JS[lang];
    var head = '<thead><tr><th scope="col">' + J.country + '</th>' + J.rows.map(function (r) { return '<th scope="col">' + r + '</th>'; }).join('') + '</tr></thead>';
    var body = '<tbody>' + D.map(function (d, i) {
      return '<tr' + (i === cur ? ' class="hl"' : '') + '><th scope="row">' + d.name[lang] + '</th><td>' + d.lv.map(function (l) { return J.lvl[l]; }).join(', ') + '</td><td>' + d.intake[lang] + '</td><td>' + d.lang[lang] + '</td><td>' + d.u.length + '</td><td><span class="tag2">' + J.costv + '</span></td></tr>';
    }).join('') + '</tbody>';
    $('#tbl').innerHTML = head + body;
  }

  /* ---------- Shortlist ---------- */
  function byKey(k) { return D.filter(function (d) { return d.k === k; })[0]; }
  function togglePin(k) { var i = list.indexOf(k); if (i > -1) list.splice(i, 1); else list.push(k); renderShort(); renderTabs(); renderPanels(false); }
  function renderShort() {
    var bar = $('#short'), J = JS[lang];
    $('#short-t').textContent = J.shorttitle;
    $('#short-chips').innerHTML = list.map(function (k) { var d = byKey(k); return '<span class="sc">' + d.name[lang] + '<button type="button" data-rm="' + k + '" aria-label="' + J.remove + d.name[lang] + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>'; }).join('');
    bar.classList.toggle('show', list.length > 0);
    document.body.classList.toggle('has-short', list.length > 0);
    bar.setAttribute('aria-hidden', String(list.length === 0));
    $$('#short a, #short button').forEach(function (n) { n.tabIndex = list.length ? 0 : -1; });
    $('#short-go').href = KLN.wa + '?text=' + encodeURIComponent(SHORT[lang] + list.map(function (k) { return byKey(k).name[lang]; }).join(', ') + '.');
  }
  $('#short-chips').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) togglePin(b.getAttribute('data-rm')); });
  $('#short-clear').addEventListener('click', function () { list = []; renderShort(); renderTabs(); renderPanels(false); });

  /* ---------- Mulai: negara dapat dipilih lewat tautan, misalnya negara-tujuan.html#au ---------- */
  var want = (location.hash || '').slice(1), jump = false;
  D.forEach(function (d, i) { if (d.k === want) { cur = i; jump = true; } });
  buildGlobe(); renderTabs(); renderPanels(false); syncGlobe(false); renderTable(); renderShort();
  if (jump) $('#jelajah').scrollIntoView();
})();
