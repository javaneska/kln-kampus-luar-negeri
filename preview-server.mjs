import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SITE_DIR = fs.existsSync('/tmp/kln-website-update')
  ? '/tmp/kln-website-update'
  : path.join(__dirname, 'public');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const ROUTE_MAP = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/negara-tujuan': 'negara-tujuan.html',
  '/negara-tujuan.html': 'negara-tujuan.html',
  '/destinasi': 'negara-tujuan.html',
  '/faq': 'faq.html',
  '/faq.html': 'faq.html',
  '/privasi': 'privasi.html',
  '/privasi.html': 'privasi.html',
  '/syarat': 'syarat.html',
  '/syarat.html': 'syarat.html',
  '/en': 'en/index.html',
  '/en/': 'en/index.html',
  '/en/index.html': 'en/index.html',
  '/en/destinations': 'en/destinations.html',
  '/en/destinations.html': 'en/destinations.html',
  '/en/faq': 'en/faq.html',
  '/en/faq.html': 'en/faq.html',
  '/en/privacy': 'en/privacy.html',
  '/en/privacy.html': 'en/privacy.html',
  '/en/terms': 'en/terms.html',
  '/en/terms.html': 'en/terms.html',
};

function generateAuraReply(message, lang) {
  const q = String(message || '').toLowerCase();
  const isEn = lang === 'en';

  if (q.includes('biaya') || q.includes('harga') || q.includes('uang') || q.includes('cost') || q.includes('tuition') || q.includes('fee')) {
    return isEn
      ? 'Costs depend on the country, university, program, and city, and can change each academic year. KLN does not list fixed figures so you are not misled by outdated numbers.\n\nConsultation with a KLN advisor is free of charge — an advisor can check the latest official figures for the programs you are considering. [KONSELOR]'
      : 'Biaya kuliah dan biaya hidup bergantung pada negara, kampus, program, dan kota, serta dapat berubah setiap tahun akademik. KLN tidak mencantumkan angka tetap agar kamu tidak berpatokan pada angka yang mungkin sudah berubah.\n\nKonsultasi awal bersama konselor KLN tidak dipungut biaya — konselor dapat mengecek rincian resmi terbaru untuk program yang kamu pertimbangkan. [KONSELOR]';
  }

  if (q.includes('ielts') || q.includes('toefl') || q.includes('bahasa') || q.includes('english') || q.includes('duolingo')) {
    return isEn
      ? 'You can start planning before you have an IELTS or TOEFL score. Many universities offer conditional admission or academic English pathway programs. An advisor can help map out the timeline for your test and application. [KONSELOR]'
      : 'Kamu bisa mulai merencanakan studi meskipun belum memiliki skor IELTS atau TOEFL. Banyak kampus menyediakan jalur bersyarat (conditional) atau kelas persiapan bahasa. Konselor KLN dapat membantu menyusun jadwal tes dan pendaftaranmu. [KONSELOR]';
  }

  if (q.includes('beasiswa') || q.includes('scholarship') || q.includes('lpdp')) {
    return isEn
      ? 'Many partner universities offer partial tuition scholarships based on academic merit, and you can also explore full scholarships.KLN advisors help match your profile with realistic program and funding options, though admission and scholarship decisions always rest with the institution. [KONSELOR]'
      : 'Banyak kampus mitra menawarkan potongan biaya kuliah sebagian berdasarkan capaian akademik, selain opsi beasiswa penuh. Konselor KLN membantu mencocokkan profilmu dengan pilihan program yang realistis, namun keputusan penerimaan dan beasiswa tetap berada pada pihak pemberi. [KONSELOR]';
  }

  if (q.includes('visa') || q.includes('aspectama') || q.includes('grid') || q.includes('globalreadiness')) {
    return isEn
      ? 'KLN advisors provide initial guidance on the document timeline up to visa preparation. If you need intensive paid visa assistance, KLN can refer you to Aspectama, or to GlobalReadiness.ID (GRID) for intensive essay and interview coaching — both are completely optional. [KONSELOR]'
      : 'Konselor KLN memberikan arahan awal mengenai urutan berkas hingga tahap persiapan visa. Bila kamu membutuhkan pendampingan pengurusan visa berbayar yang lebih mendalam, tersedia rujukan opsional ke Aspectama, atau ke GlobalReadiness.ID (GRID) untuk bimbingan esai dan wawancara intensif. [KONSELOR]';
  }

  return isEn
    ? 'KLN helps Indonesian students compare 7 destination countries (US, Canada, UK, Australia, New Zealand, Ireland, and Malaysia), shortlist suitable programs from 527 universities, and organize application documents step by step.\n\nWould you like to discuss your study level and preferred country with a KLN advisor? [KONSELOR]'
    : 'KLN membantu pelajar Indonesia membandingkan 7 negara tujuan (Amerika Serikat, Kanada, Inggris, Australia, Selandia Baru, Irlandia, dan Malaysia), menyusun daftar pendek dari 527 kampus, serta menyiapkan dokumen pendaftaran langkah demi langkah.\n\nIngin membahas jenjang dan negara yang kamu minati langsung bersama konselor KLN? [KONSELOR]';
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 32768) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API endpoints (both Next.js /api/aura & /api/consultation and reference /api/prompt.php)
  if (req.method === 'POST' && (pathname === '/api/aura' || pathname === '/api/prompt.php' || pathname === '/en/api/prompt.php')) {
    const body = await readJsonBody(req);
    const msg = body.message || ( Array.isArray(body.messages) && body.messages.length ? body.messages[body.messages.length - 1].content : '' );
    const lang = body.lang || (pathname.startsWith('/en/') ? 'en' : 'id');
    const reply = generateAuraReply(msg, lang);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ reply }));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/consultation') {
    const body = await readJsonBody(req);
    const isEn = body.lang === 'en';
    const lines = isEn
      ? [
          'Hello KLN, I would like to schedule a consultation.',
          `Name: ${body.name || ''}`,
          `WhatsApp: ${body.wa || ''}`,
          `Email: ${body.mail || ''}`,
          `Study level: ${body.level || ''}`,
        ]
      : [
          'Halo KLN, saya ingin menjadwalkan konsultasi.',
          `Nama: ${body.name || ''}`,
          `WhatsApp: ${body.wa || ''}`,
          `Email: ${body.mail || ''}`,
          `Jenjang yang diminati: ${body.level || ''}`,
        ];
    if (body.country) lines.push(`${isEn ? 'Country of interest' : 'Negara yang diminati'}: ${body.country}`);
    if (body.plan) lines.push(`${isEn ? 'Plan & questions' : 'Rencana dan pertanyaan'}: ${body.plan}`);
    const whatsappUrl = `https://wa.me/16026005671?text=${encodeURIComponent(lines.join('\n'))}`;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, whatsappUrl }));
    return;
  }

  // Resolve static/HTML file
  let relFile = ROUTE_MAP[pathname];
  if (!relFile) {
    // Handle /en/assets/... -> assets/...
    if (pathname.startsWith('/en/assets/')) {
      relFile = pathname.slice(4);
    } else {
      relFile = pathname.replace(/^\/+/, '');
    }
  }

  const candidatePaths = [
    path.join(SITE_DIR, relFile),
    path.join(PUBLIC_DIR, relFile),
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      let content = fs.readFileSync(filePath);

      // Inject live /api/aura fallback bridge for Aura free-text chat if HTML page
      if (ext === '.html') {
        let html = content.toString('utf8');
        // Enable the #chat-in form on home page so users can also type custom questions to Aura in addition to the 4 quick buttons
        const bridgeScript = `<script>
(function(){
  window.addEventListener('DOMContentLoaded', function(){
    var f = document.getElementById('chat-in');
    if (f) f.removeAttribute('hidden');
  });
})();
</script>`;
        html = html.replace('</body>', bridgeScript + '</body>');
        content = Buffer.from(html, 'utf8');
      }

      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
      res.end(content);
      return;
    }
  }

  // 404 fallback
  const notFoundPath = path.join(SITE_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(notFoundPath));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`KLN Preview Server running at http://localhost:${PORT}`);
});
