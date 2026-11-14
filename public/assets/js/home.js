/* KLN: beranda (pita negara, kartu negara, demo Aura, formulir konsultasi). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KLN = window.KLN;
  var JS = {
    id: {
      tagline: 'Satu rencana, banyak kampus dunia.', copied: 'Tersalin', copy: 'Salin',
      lvl: 'Jenjang', intake: 'Intake', cost: 'Biaya dan syarat', costv: 'Hubungi konselor', view: 'Lihat program',
      levels: { s1: 'Sarjana', s2: 'Magister', s3: 'Doktor' },
      e_req: 'Isi bagian ini.', e_wa: 'Masukkan nomor WhatsApp, misalnya 0812 0000 0000 atau +62 812 0000 0000.', e_mail: 'Masukkan email yang valid, misalnya nama@email.com.', e_consent: 'Centang persetujuan untuk melanjutkan.',
      ok_t: function (n) { return 'Terima kasih, ' + n + '.'; },
      
      chat: {
        q1: ['Bantu saya memilih negara tujuan.', 'Boleh. Supaya rekomendasinya tepat, saya perlu tahu tiga hal: jenjang yang kamu tuju, bidang yang diminati, dan kapan kamu ingin mulai kuliah. Setelah itu konselor KLN mengecek biaya dan syarat terbaru bersamamu.'],
        q2: ['Kapan waktu yang tepat untuk mendaftar?', 'Setiap negara punya jadwal intake sendiri, dan tenggat pendaftaran sering jatuh beberapa bulan sebelum kuliah dimulai. Sebutkan negara dan jenjangmu, lalu saya susun garis waktunya. Tanggal resmi tetap dikonfirmasi konselor.'],
        q3: ['Dokumen apa saja yang perlu disiapkan?', 'Umumnya transkrip atau ijazah, paspor, bukti kemampuan bahasa, dan esai atau surat motivasi. Daftar pastinya berbeda tiap kampus, jadi saya buatkan daftar periksa setelah kamu memilih program.'],
        q4: ['Saya ingin bicara dengan konselor.', 'Tentu. Isi formulir konsultasi di bawah, dan konselor KLN akan menghubungimu pada jam layanan (Senin sampai Jumat, 09.00 sampai 17.00 WIB), paling lambat 1 hari kerja.']
      }
    },
    en: {
      tagline: 'One plan, campuses around the world.', copied: 'Copied', copy: 'Copy',
      lvl: 'Level', intake: 'Intake', cost: 'Costs and requirements', costv: 'Contact an advisor', view: 'See programs',
      levels: { s1: 'Bachelor’s', s2: 'Master’s', s3: 'Doctorate' },
      e_req: 'Fill in this field.', e_wa: 'Enter a WhatsApp number, for example +62 812 0000 0000.', e_mail: 'Enter a valid email, for example name@email.com.', e_consent: 'Tick the consent box to continue.',
      ok_t: function (n) { return 'Thank you, ' + n + '.'; },
      
      chat: {
        q1: ['Help me choose a destination country.', 'Happy to. To make the suggestion useful, I need three things: the level you are aiming for, your field of interest, and when you would like to start. A KLN advisor then checks the latest costs and requirements with you.'],
        q2: ['When is the right time to apply?', 'Each country has its own intake calendar, and application deadlines often fall several months before classes begin. Tell me your country and level, and I will draft a timeline. Official dates are always confirmed by an advisor.'],
        q3: ['Which documents do I need to prepare?', 'Usually a transcript or diploma, a passport, proof of language ability, and an essay or motivation letter. The exact list differs by university, so I will make a checklist once you pick a program.'],
        q4: ['I would like to talk to an advisor.', 'Of course. Fill in the consultation form below, and a KLN advisor will contact you during service hours (Monday to Friday, 09:00 to 17:00 WIB), within 1 business day at most.']
      }
    }
  };
  var DEST = [
    { k: 'us', name: { id: 'Amerika Serikat', en: 'United States' }, lv: ['s1', 's2', 's3'], tone: 'brand', intake: { id: 'Musim gugur (Agustus) dan semi (Januari)', en: 'Fall (August) and spring (January)' } },
    { k: 'ca', name: { id: 'Kanada', en: 'Canada' }, lv: ['s1', 's2', 's3'], tone: 'ember', intake: { id: 'September, Januari, dan Mei', en: 'September, January, and May' } },
    { k: 'uk', name: { id: 'Inggris', en: 'United Kingdom' }, lv: ['s1', 's2'], tone: 'sky', intake: { id: 'September dan Januari', en: 'September and January' } },
    { k: 'au', name: { id: 'Australia', en: 'Australia' }, lv: ['s1', 's2'], tone: 'sun', intake: { id: 'Februari dan Juli', en: 'February and July' } },
    { k: 'nz', name: { id: 'Selandia Baru', en: 'New Zealand' }, lv: ['s1', 's2'], tone: 'leaf', intake: { id: 'Februari dan Juli', en: 'February and July' } },
    { k: 'ie', name: { id: 'Irlandia', en: 'Ireland' }, lv: ['s1', 's2'], tone: 'brand', intake: { id: 'September dan Januari', en: 'September and January' } },
    { k: 'my', name: { id: 'Malaysia', en: 'Malaysia' }, lv: ['s1', 's2', 's3'], tone: 'ember', intake: { id: 'Beberapa kali setahun', en: 'Several times a year' } }
  ];

  var lang = KLN.lang, filter = 'all', chatLog = [];

  /* ---------- Ribbon ---------- */
  function renderTrack() {
    var names = DEST.map(function (d) { return d.name[lang]; });
    var row = names.map(function (n) { return '<span>' + n + '</span>'; }).join('');
    $('#track').innerHTML = row + row;
  }

  /* ---------- Cards ---------- */
  var TONES = { brand: 'var(--brand)', sun: 'var(--sun)', leaf: 'var(--leaf)', sky: 'var(--sky)', ember: 'var(--ember)' };
  /* Gambar kartu: siluet peta negara, penanda ibu kota, dan pesawat kertas yang terbang saat kartu disorot */
  var MAPS = window.KLN_MAPS || {};
  function mapArt(d) {
    var m = MAPS[d.k];
    if (!m) return '<div class="card-art t-' + d.tone + '" style="background:' + TONES[d.tone] + '"></div>';
    return '<svg class="card-art t-' + d.tone + '" style="background:' + TONES[d.tone] + '" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<path class="m-land" d="' + m.d + '"/><path class="m-route" d="' + m.route + '"/>' +
      '<circle class="m-ring" cx="' + m.pin[0] + '" cy="' + m.pin[1] + '" r="5"/><circle class="m-pin" cx="' + m.pin[0] + '" cy="' + m.pin[1] + '" r="4.5"/>' +
      '<path class="m-plane" style="offset-path:path(\'' + m.route + '\')" d="M10 0L-9-6.5L-5 0L-9 6.5Z"/></svg>';
  }

  function renderCards(anim) {
    var J = JS[lang];
    $('#cards').innerHTML = DEST.map(function (d) {
      var show = filter === 'all' || d.lv.indexOf(filter) > -1;
      return '<article class="card' + (anim && show ? ' pop' : '') + '"' + (show ? '' : ' hidden') + '>' +
        mapArt(d) +
        '<div class="card-body"><div class="pills">' + d.lv.map(function (l) { return '<span class="pill">' + J.levels[l] + '</span>'; }).join('') + '</div>' +
        '<h3>' + d.name[lang] + '</h3><div class="meta"><span><b>' + J.intake + ':</b> ' + d.intake[lang] + '</span><span><b>' + J.cost + ':</b> ' + J.costv + '</span></div>' +
        '<a class="btn btn-secondary btn-sm" href="' + KLN.urls.dest + '#' + d.k + '">' + J.view + '</a></div></article>';
    }).join('');
  }

  /* ---------- Chat demo ---------- */
  function renderChat() {
    var log = $('#log'), intro = $('#intro');
    $$('.msg:not(#intro), .typing', log).forEach(function (n) { n.remove(); });
    chatLog.forEach(function (m) { var d = document.createElement('div'); d.className = 'msg ' + m.r + ' still'; d.textContent = JS[lang].chat[m.q][m.r === 'u' ? 0 : 1]; log.appendChild(d); });
    log.scrollTop = log.scrollHeight;
  }
  var busy = false;
  function ask(q) {
    if (busy) return; busy = true;
    var log = $('#log'); $$('#quick button').forEach(function (b) { b.disabled = true; });
    chatLog.push({ r: 'u', q: q });
    var u = document.createElement('div'); u.className = 'msg u'; u.textContent = JS[lang].chat[q][0]; log.appendChild(u); log.scrollTop = log.scrollHeight;
    var t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
    setTimeout(function () { log.appendChild(t); log.scrollTop = log.scrollHeight; }, 350);
    setTimeout(function () {
      t.remove(); chatLog.push({ r: 'a', q: q });
      var a = document.createElement('div'); a.className = 'msg a'; a.textContent = JS[lang].chat[q][1]; log.appendChild(a); log.scrollTop = log.scrollHeight;
      if (q === 'q4') addHandoff(log);
      $$('#quick button').forEach(function (b) { b.disabled = false; }); busy = false;
    }, reduce ? 400 : 1700);
  }
  $('#quick').addEventListener('click', function (e) { var b = e.target.closest('button[data-q]'); if (b) ask(b.getAttribute('data-q')); });

  /* ---------- Form ---------- */
  var fields = { name: $('#f-name'), wa: $('#f-wa'), mail: $('#f-mail'), consent: $('#f-consent') };
  function check(k) {
    var el = fields[k], v = (el.value || '').trim(), key = '';
    if (k === 'name' && !v) key = 'e_req';
    if (k === 'wa') { if (!v) key = 'e_req'; else if (!/^\+?[0-9 ()\-]{8,18}$/.test(v)) key = 'e_wa'; }
    if (k === 'mail') { if (!v) key = 'e_req'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) key = 'e_mail'; }
    if (k === 'consent' && !el.checked) key = 'e_consent';
    var err = $('#e-' + k);
    if (key) {
      err.hidden = false; err.dataset.k = key;
      err.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/></svg><span>' + JS[lang][key] + '</span>';
      if (k !== 'consent') el.setAttribute('aria-invalid', 'true');
    } else { err.hidden = true; err.dataset.k = ''; if (k !== 'consent') el.removeAttribute('aria-invalid'); }
    return !key;
  }
  function revalidate() { Object.keys(fields).forEach(function (k) { var e = $('#e-' + k); if (!e.hidden) check(k); }); }
  ['name', 'wa', 'mail'].forEach(function (k) { fields[k].addEventListener('blur', function () { check(k); }); fields[k].addEventListener('input', function () { if (!$('#e-' + k).hidden) check(k); }); });
  fields.consent.addEventListener('change', function () { if (!$('#e-consent').hidden) check('consent'); });

  /* ---------- Serah terima chat ke konselor (WhatsApp) ---------- */
  JS.id.chat.q4[1] = 'Tentu. Kamu bisa langsung menghubungi konselor lewat WhatsApp dengan tombol di bawah, atau mengisi formulir konsultasi. Konselor KLN membalas pada jam layanan (Senin sampai Jumat, 09.00 sampai 17.00 WIB), paling lambat 1 hari kerja.';
  JS.en.chat.q4[1] = 'Of course. You can reach an advisor on WhatsApp with the button below, or fill in the consultation form. A KLN advisor replies during service hours (Monday to Friday, 09:00 to 17:00 WIB), within 1 business day at most.';
  var HAND = {
    id: { btn: 'Chat konselor di WhatsApp', text: 'Halo KLN, saya ingin berbicara dengan konselor tentang rencana studi saya.' },
    en: { btn: 'Chat with an advisor on WhatsApp', text: 'Hello KLN, I would like to talk to an advisor about my study plan.' }
  };
  function addHandoff(log) {
    var a = document.createElement('a');
    a.className = 'btn btn-primary btn-sm chat-wa'; a.target = '_blank'; a.rel = 'noopener';
    a.href = KLN.wa + '?text=' + encodeURIComponent(HAND[lang].text); a.textContent = HAND[lang].btn;
    log.appendChild(a); log.scrollTop = log.scrollHeight;
  }

  /* ---------- Formulir konsultasi: ringkasan dikirim pengguna lewat WhatsApp ---------- */
  var WA = {
    id: { hello: 'Halo KLN, saya ingin konsultasi studi luar negeri.', name: 'Nama', level: 'Jenjang', country: 'Negara tujuan', plan: 'Rencana' },
    en: { hello: 'Hello KLN, I would like a study abroad consultation.', name: 'Name', level: 'Level', country: 'Destination country', plan: 'Plan' }
  };
  function val(id) { return ($('#' + id).value || '').trim(); }
  function buildMessage() {
    var W = WA[lang], lines = [W.hello, '', W.name + ': ' + val('f-name'), 'WhatsApp: ' + val('f-wa'), 'Email: ' + val('f-mail'), W.level + ': ' + $('#f-level').value];
    if (val('f-country')) lines.push(W.country + ': ' + val('f-country'));
    if (val('f-plan')) lines.push(W.plan + ': ' + val('f-plan'));
    return lines.join('\n');
  }
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = Object.keys(fields).filter(function (k) { return !check(k); });
    if (bad.length) { fields[bad[0]].focus(); return; }
    var msg = buildMessage();
    $('#ok-title').textContent = JS[lang].ok_t(val('f-name').split(/\s+/)[0]);
    $('#ok-msg').textContent = msg;
    $('#ok-wa').href = KLN.wa + '?text=' + encodeURIComponent(msg);
    $('#form').hidden = true; $('#ok').hidden = false;
    $('#ok').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    $('#ok-wa').focus();
  });
  $('#again').addEventListener('click', function () {
    $('#form').reset(); $('#ok').hidden = true; $('#form').hidden = false;
    $$('.err').forEach(function (n) { n.hidden = true; }); $$('.in').forEach(function (n) { n.removeAttribute('aria-invalid'); });
    fields.name.focus();
  });

  /* ---------- Filter jenjang pada kartu negara ---------- */
  $$('.chip').forEach(function (c) { c.addEventListener('click', function () {
    filter = c.getAttribute('data-f'); $$('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); renderCards(true);
  }); });

  /* ---------- Langkah: rel terisi mengikuti gulir ---------- */
  var steps = $$('.step'), fill = $('#fill'), stepsEl = $('#steps'), ticking = false;
  function onScroll() {
    ticking = false;
    var r = stepsEl.getBoundingClientRect(), mark = innerHeight * 0.62, first = steps[0].getBoundingClientRect(), last = steps[steps.length - 1].getBoundingClientRect();
    var total = Math.max(1, last.top - first.top), p = Math.max(0, Math.min(1, (mark - first.top) / total));
    fill.style.height = (p * (r.height - 40)) + 'px';
    steps.forEach(function (s, i) { s.classList.toggle('on', i === 0 || s.getBoundingClientRect().top < mark); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Aura tersambung ke layanan AI (api/aura.php) ---------- */
  /* Situs menanyakan dulu apakah layanan siap. Bila belum, chat tetap berjalan dengan jawaban contoh dan tanda "Demo". */
  var AURA = { url: KLN.api + 'aura.php', live: false, hist: [] };
  var AT = {
    id: { foot: 'Aura adalah asisten AI dan dapat keliru. Jangan kirim data paspor atau keuangan lewat chat.',
      err: 'Maaf, Aura sedang tidak dapat menjawab. Coba lagi sebentar lagi, atau lanjutkan dengan konselor lewat WhatsApp.',
      rate: 'Kamu sudah mengirim cukup banyak pesan. Coba lagi nanti, atau lanjutkan dengan konselor lewat WhatsApp.',
      long: 'Pesanmu terlalu panjang. Mohon ringkas menjadi beberapa kalimat.' },
    en: { foot: 'Aura is an AI assistant and can make mistakes. Do not send passport or financial data in the chat.',
      err: 'Sorry, Aura cannot answer right now. Please try again shortly, or continue with an advisor on WhatsApp.',
      rate: 'You have sent quite a few messages. Please try again later, or continue with an advisor on WhatsApp.',
      long: 'Your message is too long. Please shorten it to a few sentences.' }
  };
  function bubble(cls, text) {
    var log = $('#log'), d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function chatLock(on) { $$('#quick button, #chat-form button, #chat-in').forEach(function (n) { n.disabled = on; }); }
  function sendLive(text) {
    text = (text || '').trim(); if (busy || !text) return;
    busy = true; chatLock(true); bubble('u', text);
    var log = $('#log'), t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t); log.scrollTop = log.scrollHeight;
    AURA.hist.push({ role: 'user', content: text });
    function fail(msg) { AURA.hist.pop(); bubble('a', msg); addHandoff(log); }
    fetch(AURA.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: lang, messages: AURA.hist.slice(-12) }) })
      .then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
      .then(function (x) {
        t.remove();
        if (x.s === 200 && x.d && x.d.reply) { AURA.hist.push({ role: 'assistant', content: x.d.reply }); bubble('a', x.d.reply); if (x.d.handoff) addHandoff(log); }
        else fail(x.s === 429 ? AT[lang].rate : x.s === 413 ? AT[lang].long : AT[lang].err);
      })
      .catch(function () { t.remove(); fail(AT[lang].err); })
      .then(function () { busy = false; chatLock(false); if (document.activeElement === document.body) $('#chat-in').focus(); });
  }
  var demoAsk = ask;
  ask = function (q) { if (AURA.live) sendLive(JS[lang].chat[q][0]); else demoAsk(q); };
  $('#chat-form').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#chat-in'), v = i.value; i.value = ''; sendLive(v); });
  if (window.fetch && /^https?:/.test(location.protocol)) {
    fetch(AURA.url, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || d.ready !== true) return;
        AURA.live = true; $('#chat-tag').hidden = true; $('#chat-form').hidden = false; $('#chat-foot').textContent = AT[lang].foot;
      })
      .catch(function () {});
  }

  /* ---------- Mulai ---------- */
  renderTrack(); renderCards(false); onScroll();
})();
