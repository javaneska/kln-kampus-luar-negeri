import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const topoLandRaw = fs.readFileSync(path.join(__dirname, 'public/data/topo-land.json'), 'utf8');
const unisByCountry = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/unis_clean.json'), 'utf8'));

// Flatten universities into [{ c, n, city, note }]
const flatUnis = [];
for (const [code, list] of Object.entries(unisByCountry)) {
  for (const tuple of list) {
    flatUnis.push({
      c: code,
      n: tuple[0],
      city: tuple[1] || '',
      note: tuple[2] || '',
    });
  }
}

function extractTsArrayOrObj(relPath, marker) {
  const src = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error(`Marker ${marker} not found in ${relPath}`);
  const eqIdx = src.indexOf('=', idx);
  let body = src.slice(eqIdx + 1).trim();
  if (body.endsWith('as const;')) body = body.slice(0, -9).trim();
  if (body.endsWith(';')) body = body.slice(0, -1).trim();
  return body;
}

const faqItemsJs = extractTsArrayOrObj('src/data/faq.ts', 'export const FAQ_ITEMS');
const legalContentJs = extractTsArrayOrObj('src/data/legal.ts', 'export const LEGAL_CONTENT');

const DESTINATIONS = [
  {
    code: 'au',
    partnerCount: (unisByCountry.au || []).length,
    name: { id: 'Australia', en: 'Australia' },
    regionTag: { id: 'Oseania • Dekat dari Indonesia', en: 'Oceania • Close to Indonesia' },
    levels: { id: ['S1', 'S2', 'Pathway', 'Bahasa'], en: ["Bachelor's", "Master's", 'Pathway', 'English'] },
    tone: {
      id: 'Ekosistem riset kelas dunia (termasuk anggota Group of Eight) dan universitas teknologi terapan dengan zona waktu yang berdekatan dengan Indonesia.',
      en: 'World-class research ecosystem (including Group of Eight members) and applied technology universities in time zones close to Indonesia.'
    },
    intake: { id: 'Februari & Juli (utama), Oktober/November', en: 'February & July (main), October/November' },
    englishReq: { id: 'IELTS 6.0–6.5 (atau jalur ELICOS/Pathway)', en: 'IELTS 6.0–6.5 (or ELICOS/Pathway route)' }
  },
  {
    code: 'uk',
    partnerCount: (unisByCountry.uk || []).length,
    name: { id: 'Inggris Raya (UK)', en: 'United Kingdom (UK)' },
    regionTag: { id: 'Eropa • Durasi Studi Efisien', en: 'Europe • Time-Efficient Degrees' },
    levels: { id: ['S1 (3 Tahun)', 'S2 (1 Tahun)', 'Foundation'], en: ["Bachelor's (3 Yrs)", "Master's (1 Yr)", 'Foundation'] },
    tone: {
      id: 'Tradisi akademik kuat (termasuk mitra Russell Group) dengan durasi S1 tiga tahun dan S2 satu tahun yang membuat total biaya hidup lebih terukur.',
      en: 'Strong academic heritage (including Russell Group partners) with 3-year undergraduate and 1-year postgraduate degrees.'
    },
    intake: { id: 'September/Oktober (utama), Januari', en: 'September/October (main), January' },
    englishReq: { id: 'IELTS UKVI 6.0–6.5 (tergantung program)', en: 'IELTS UKVI 6.0–6.5 (program-dependent)' }
  },
  {
    code: 'us',
    partnerCount: (unisByCountry.us || []).length,
    name: { id: 'Amerika Serikat', en: 'United States' },
    regionTag: { id: 'Amerika Utara • Kurikulum Fleksibel', en: 'North America • Flexible Curriculum' },
    levels: { id: ['S1 (4 Tahun)', 'Community College 2+2', 'S2'], en: ["Bachelor's (4 Yrs)", 'Community College 2+2', "Master's"] },
    tone: {
      id: 'Pilihan kampus paling beragam di jaringan KLN — mulai dari universitas riset negeri dan swasta hingga jalur hemat Community College 2+2.',
      en: 'The broadest institutional variety in the KLN network — from public and private research universities to cost-effective 2+2 Community College transfers.'
    },
    intake: { id: 'Agustus/September (Fall), Januari (Spring)', en: 'August/September (Fall), January (Spring)' },
    englishReq: { id: 'TOEFL iBT 79–90 / IELTS 6.0–6.5 / Duolingo', en: 'TOEFL iBT 79–90 / IELTS 6.0–6.5 / Duolingo' }
  },
  {
    code: 'ca',
    partnerCount: (unisByCountry.ca || []).length,
    name: { id: 'Kanada', en: 'Canada' },
    regionTag: { id: 'Amerika Utara • Co-op & Terapan', en: 'North America • Co-op & Applied' },
    levels: { id: ['S1', 'Diploma/Politeknik', 'S2'], en: ["Bachelor's", 'Diploma/Polytechnic', "Master's"] },
    tone: {
      id: 'Kuat pada integrasi magang berbayar (co-op) di universitas komprehensif maupun politeknik negeri di British Columbia, Ontario, dan provinsi lainnya.',
      en: 'Known for paid co-op work terms across comprehensive universities and public polytechnics in British Columbia, Ontario, and beyond.'
    },
    intake: { id: 'September (Fall), Januari (Winter), Mei', en: 'September (Fall), January (Winter), May' },
    englishReq: { id: 'IELTS Academic 6.5 (tidak ada band < 6.0)', en: 'IELTS Academic 6.5 (no band < 6.0)' }
  },
  {
    code: 'nz',
    partnerCount: (unisByCountry.nz || []).length,
    name: { id: 'Selandia Baru', en: 'New Zealand' },
    regionTag: { id: 'Oseania • Lingkungan Aman & Riset', en: 'Oceania • Safe & Research-Driven' },
    levels: { id: ['S1', 'S2', 'Institut Teknologi', 'Pathway'], en: ["Bachelor's", "Master's", 'Institutes of Tech', 'Pathway'] },
    tone: {
      id: 'Mencakup seluruh 8 universitas negeri Selandia Baru serta institut teknologi terapan dengan pendekatan pembelajaran personal dan lingkungan hidup yang tenang.',
      en: 'Covers all 8 New Zealand public universities plus applied institutes of technology with personalized teaching and welcoming cities.'
    },
    intake: { id: 'Februari & Juli', en: 'February & July' },
    englishReq: { id: 'IELTS Academic 6.0–6.5', en: 'IELTS Academic 6.0–6.5' }
  },
  {
    code: 'ie',
    partnerCount: (unisByCountry.ie || []).length,
    name: { id: 'Irlandia', en: 'Ireland' },
    regionTag: { id: 'Uni Eropa • Pusat Teknologi & Farmasi', en: 'European Union • Tech & Pharma Hub' },
    levels: { id: ['S1', 'S2', 'Technological University'], en: ["Bachelor's", "Master's", 'Technological University'] },
    tone: {
      id: 'Negara berbahasa Inggris di Uni Eropa yang menjadi kantor pusat Eropa bagi banyak perusahaan teknologi, perangkat lunak, dan biofarmasi global.',
      en: 'English-speaking European Union nation hosting the European headquarters of major global technology, software, and biopharma companies.'
    },
    intake: { id: 'September (utama), Januari', en: 'September (main), January' },
    englishReq: { id: 'IELTS Academic 6.0–6.5', en: 'IELTS Academic 6.0–6.5' }
  },
  {
    code: 'my',
    partnerCount: (unisByCountry.my || []).length,
    name: { id: 'Malaysia', en: 'Malaysia' },
    regionTag: { id: 'Asia Tenggara • Kampus Cabang Internasional', en: 'Southeast Asia • International Branch Campuses' },
    levels: { id: ['S1', 'S2', 'Foundation', 'Dual Degree'], en: ["Bachelor's", "Master's", 'Foundation', 'Dual Degree'] },
    tone: {
      id: 'Rumah bagi kampus cabang resmi universitas Inggris dan Australia (Monash, Nottingham, Heriot-Watt, Southampton) serta universitas swasta unggulan dekat dari rumah.',
      en: 'Home to official UK and Australian international branch campuses (Monash, Nottingham, Heriot-Watt, Reading) and top private universities close to Indonesia.'
    },
    intake: { id: 'Februari/Maret, Juli, September/Oktober', en: 'February/March, July, September/October' },
    englishReq: { id: 'IELTS 5.5–6.5 (atau tes penempatan internal)', en: 'IELTS 5.5–6.5 (or internal placement test)' }
  }
];

const UI_TEXT = {
  id: {
    nav: {
      destinations: 'Destinasi Studi',
      universities: 'Universitas Mitra',
      steps: 'Cara Kerja',
      aura: 'Tanya Aura',
      faq: 'FAQ',
      consultCta: 'Konsultasi Gratis'
    },
    hero: {
      badgeFree: '100% Gratis untuk Pelajar',
      eyebrow: 'GlobalBridger.ID • Jaringan 500+ Kampus Mitra',
      headlineStart: 'Satu rencana,',
      headlineAccent: 'banyak kampus dunia.',
      subheadline: 'KLN mendampingi pelajar dan keluarga Indonesia menyusun rencana studi S1, S2, bahasa, dan pathway di 7 negara tujuan bersama konselor berpengalaman — tanpa biaya konsultasi.',
      ctaPrimary: 'Mulai Konsultasi Gratis',
      ctaSecondary: 'Telusuri 527 Universitas Mitra',
      statUniversitiesLabel: 'Universitas & Institusi Mitra',
      statCountriesLabel: 'Negara Tujuan Utama',
      statCostLabel: 'Biaya Konsultasi Pelajar',
      pauseGlobe: 'Jeda Globe',
      playGlobe: 'Putar Globe'
    },
    ribbon: {
      label: 'Pilih negara untuk melihat daftar universitas mitra',
      viewAll: 'Lihat Semua Mitra'
    },
    destinationsSection: {
      eyebrow: '7 Negara Tujuan',
      title: 'Bandingkan sistem studi dan jalur masuk lintas negara.',
      subtitle: 'Setiap negara memiliki struktur durasi kuliah, persyaratan bahasa, dan kalender pendaftaran yang berbeda. Konselor kami membantu membandingkan 2–3 negara sekaligus dalam satu rencana.',
      browseAllCta: 'Buka Direktori Lengkap',
      partnersUnit: 'Mitra',
      intakeLabel: 'Periode Masuk',
      langLabel: 'Bahasa Inggris',
      tuitionLabel: 'Estimasi Biaya Kuliah',
      tuitionValue: 'Hubungi konselor',
      exploreBtn: 'Lihat Kampus Mitra'
    },
    stepsSection: {
      eyebrow: 'Alur Pendampingan KLN',
      title: 'Empat langkah terstruktur dari eksplorasi hingga surat penerimaan.',
      subtitle: 'Tidak perlu menebak urutan dokumen sendiri. Kami menjaga proses tetap rapi dan transparan bagi pelajar maupun orang tua.',
      items: [
        {
          num: '01',
          badge: 'Gratis • 30–45 Menit',
          title: 'Pemetaan Profil & Rencana Awal',
          desc: 'Diskusikan minat jurusan, latar akademik, target tahun keberangkatan, dan estimasi anggaran keluarga bersama konselor KLN.'
        },
        {
          num: '02',
          badge: 'Gratis • 3–5 Kampus',
          title: 'Penyusunan Shortlist Kampus Mitra',
          desc: 'Konselor menyusun daftar pendek universitas mitra di 1–3 negara lengkap dengan syarat masuk, tenggat waktu, dan opsi pathway.'
        },
        {
          num: '03',
          badge: 'Gratis • Pengiriman Resmi',
          title: 'Pemeriksaan Berkas & Pengiriman Aplikasi',
          desc: 'Kami memeriksa kelengkapan dokumen akademikmu dan mengirimkan pendaftaran ke universitas mitra. Jika butuh bimbingan esai/wawancara intensif, tersedia rujukan opsional ke GlobalReadiness.ID (GRID).'
        },
        {
          num: '04',
          badge: 'LoA & Persiapan Berangkat',
          title: 'Penerimaan Offer & Panduan Tahap Visa',
          desc: 'Setelah menerima Letter of Acceptance (LoA), kami memandu langkah konfirmasi tempat dan informasi awal persiapan visa (atau rujukan pendampingan visa berbayar melalui Aspectama).'
        }
      ]
    },
    aura: {
      eyebrow: 'Aura — Asisten Informasi Awal KLN',
      title: 'Tanyakan hal mendasar sebelum sesi bersama konselor.',
      subtitle: 'Aura siap menjawab pertanyaan seputar cara kerja layanan gratis KLN, perbandingan 7 negara tujuan, persyaratan IELTS/Pathway, serta transparansi biaya setiap saat.',
      greeting: 'Halo! Saya Aura, asisten informasi awal KLN (Kampus Luar Negeri). Apakah kamu sedang merencanakan studi S1, S2, atau program Pathway? Silakan pilih pertanyaan cepat atau tulis pertanyaanmu di bawah.',
      quickPrompts: [
        'Apakah layanan konsultasi KLN benar-benar gratis?',
        'Negara mana saja yang termasuk jaringan 527 kampus mitra KLN?',
        'Bagaimana jika saya belum punya skor IELTS atau TOEFL?',
        'Apakah KLN membantu beasiswa dan pengurusan visa pelajar?',
        'Apa perbedaan peran KLN, Aspectama, dan GlobalReadiness.ID (GRID)?'
      ],
      placeholder: 'Tulis pertanyaan seputar rencana kuliah di luar negeri...',
      sendBtn: 'Kirim',
      handoffCta: 'Bicara dengan Konselor',
      disclaimer: 'Aura adalah asisten AI informasi awal dan tidak menggantikan konselor manusia. Jangan membagikan nomor paspor, NIK, atau data keuangan sensitif di kolom chat.'
    },
    consultation: {
      eyebrow: 'Jadwalkan Sesi Bersama Konselor',
      title: 'Mulai dari satu percakapan terarah.',
      subtitle: 'Isi profil singkat di samping. Setelah dikirim, kamu dapat langsung melanjutkan ke WhatsApp resmi KLN dengan ringkasan rencana studi dan daftar kampus pilihanmu.',
      nameLabel: 'Nama Lengkap',
      namePlaceholder: 'Nama pelajar atau orang tua',
      whatsappLabel: 'Nomor WhatsApp Aktif',
      whatsappPlaceholder: 'Contoh: 0812 3456 7890',
      emailLabel: 'Alamat Email',
      emailPlaceholder: 'nama@email.com',
      levelLabel: 'Jenjang Studi yang Dituju',
      levels: [
        'S1 (Sarjana / Bachelor)',
        'S2 (Magister / Master)',
        'Foundation / Pathway / Community College',
        'Persiapan Bahasa Inggris (ELICOS / Pre-sessional)'
      ],
      countryLabel: 'Negara Tujuan Utama',
      intakeLabel: 'Target Waktu Mulai Kuliah',
      intakes: [
        'Semester Ganjil / Fall 2026',
        'Semester Genap / Awal 2027',
        'Semester Ganjil / Fall 2027',
        'Masih eksplorasi awal'
      ],
      notesLabel: 'Jurusan yang Diminati / Pertanyaan Awal',
      notesPlaceholder: 'Misal: Bisnis / Ilmu Komputer, ingin membandingkan Australia dan UK...',
      consentLabel: 'Saya menyetujui Kebijakan Privasi KLN dan bersedia dihubungi oleh konselor KLN melalui WhatsApp atau email untuk penjadwalan konsultasi.',
      submitBtn: 'Kirim & Lanjutkan ke WhatsApp Konselor',
      successTitle: 'Rencana Awal Siap Dikirim ke Konselor KLN',
      successBody: 'Klik tombol di bawah untuk membuka WhatsApp resmi KLN (+1 602 600 5671) dengan pesan yang sudah terisi otomatis.',
      openWhatsappBtn: 'Buka WhatsApp Konselor Sekarang'
    },
    directoryPage: {
      eyebrow: 'Direktori Jaringan Mitra Resmi',
      title: '527 Universitas & Institusi Mitra di 7 Negara.',
      subtitle: 'Telusuri daftar institusi mitra KLN melalui kemitraan dengan PT Aspectama Nusantara. Tambahkan kampus ke daftar pendek (Shortlist) untuk didiskusikan bersama konselor.',
      searchPlaceholder: 'Cari nama universitas atau kota (mis. Monash, Manchester, Seattle, Toronto)...',
      showingCount: 'Menampilkan',
      ofTotal: 'dari',
      partnersLabel: 'institusi mitra',
      allCountries: 'Semua Negara',
      tuitionConsult: 'Hubungi konselor',
      addShortlistBtn: 'Simpan ke Shortlist',
      inShortlistBtn: 'Tersimpan di Shortlist',
      shortlistTitle: 'Kampus di Shortlist',
      shortlistClear: 'Kosongkan',
      shortlistConsultCta: 'Diskusikan dengan Konselor'
    },
    faqPage: {
      eyebrow: 'Pusat Informasi & Transparansi',
      title: 'Pertanyaan yang Sering Diajukan (FAQ).',
      subtitle: 'Jawaban jujur dan transparan mengenai layanan gratis KLN, struktur kemitraan, persyaratan aplikasi, dan pelindungan data pribadi.',
      searchPlaceholder: 'Cari kata kunci pertanyaan (mis. gratis, komisi, IELTS, visa, Aspectama)...',
      categories: {
        all: 'Semua Topik',
        kln: 'Tentang KLN',
        fee: 'Biaya & Komisi',
        choose: 'Memilih Negara & Kampus',
        docs: 'Berkas, Beasiswa & Visa',
        aura: 'Aura & Data Pribadi'
      }
    },
    footer: {
      tagline: 'Satu rencana, banyak kampus dunia.',
      about: 'Layanan perencanaan dan pendaftaran studi luar negeri di bawah merek GlobalBridger.ID, dioperasikan oleh PT Talenta Nusantara Advisory (TNA Group).',
      navTitle: 'Navigasi',
      legalTitle: 'Dokumen Hukum',
      contactTitle: 'Kontak Resmi',
      privacy: 'Kebijakan Privasi',
      terms: 'Syarat Penggunaan',
      hours: 'Senin–Jumat, 09.00–17.00 WIB',
      sla: 'Target balasan: maksimal 1 hari kerja',
      disclosure: 'Transparansi Kemitraan: KLN beroperasi di bawah PT Talenta Nusantara Advisory (TNA Group) dengan merek GlobalBridger.ID dan bertindak sebagai sub-agen dari PT Aspectama Nusantara. Layanan konsultasi dan pendaftaran ke universitas mitra gratis bagi pelajar. Layanan persiapan esai/wawancara melalui GlobalReadiness.ID (GRID) dan layanan pengurusan visa berbayar melalui Aspectama bersifat opsional dan terpisah.',
      copyright: '© 2026 PT Talenta Nusantara Advisory (GlobalBridger.ID — KLN Kampus Luar Negeri). Hak cipta dilindungi.'
    }
  },
  en: {
    nav: {
      destinations: 'Study Destinations',
      universities: 'Partner Universities',
      steps: 'How It Works',
      aura: 'Ask Aura',
      faq: 'FAQ',
      consultCta: 'Free Consultation'
    },
    hero: {
      badgeFree: '100% Free for Students',
      eyebrow: 'GlobalBridger.ID • 500+ Partner Universities Network',
      headlineStart: 'One plan,',
      headlineAccent: 'campuses around the world.',
      subheadline: 'KLN supports Indonesian students and families in planning undergraduate, postgraduate, language, and pathway study across 7 destination countries with dedicated advisors — at no consultation fee.',
      ctaPrimary: 'Book a Free Consultation',
      ctaSecondary: 'Browse 527 Partner Universities',
      statUniversitiesLabel: 'Partner Universities & Colleges',
      statCountriesLabel: 'Core Destination Countries',
      statCostLabel: 'Student Consultation Fee',
      pauseGlobe: 'Pause Globe',
      playGlobe: 'Play Globe'
    },
    ribbon: {
      label: 'Select a country to filter partner universities',
      viewAll: 'View All Partners'
    },
    destinationsSection: {
      eyebrow: '7 Destination Countries',
      title: 'Compare study systems and entry pathways across countries.',
      subtitle: 'Each country has distinct degree durations, English requirements, and intake calendars. Our advisors help you compare 2–3 countries side by side in a single plan.',
      browseAllCta: 'Open Full Directory',
      partnersUnit: 'Partners',
      intakeLabel: 'Primary Intakes',
      langLabel: 'English Requirement',
      tuitionLabel: 'Tuition Estimate',
      tuitionValue: 'Contact an advisor',
      exploreBtn: 'Explore Partner Campuses'
    },
    stepsSection: {
      eyebrow: 'How KLN Works',
      title: 'Four structured steps from exploration to your offer letter.',
      subtitle: 'No guesswork on document sequences. We keep the process clear and structured for both students and parents.',
      items: [
        {
          num: '01',
          badge: 'Free • 30–45 Mins',
          title: 'Profile Mapping & Initial Plan',
          desc: 'Discuss your intended major, academic background, target intake year, and family budget considerations with a KLN advisor.'
        },
        {
          num: '02',
          badge: 'Free • 3–5 Campuses',
          title: 'Partner University Shortlisting',
          desc: 'Your advisor builds a tailored shortlist across 1–3 countries complete with entry requirements, deadlines, and pathway options.'
        },
        {
          num: '03',
          badge: 'Free • Official Submission',
          title: 'Document Check & Application Submission',
          desc: 'We verify your academic documents and submit applications to partner institutions. Optional paid essay/interview coaching is available separately via GlobalReadiness.ID (GRID).'
        },
        {
          num: '04',
          badge: 'LoA & Pre-Departure',
          title: 'Offer Acceptance & Visa Stage Guidance',
          desc: 'Once your Letter of Acceptance (LoA) arrives, we guide you through acceptance steps and general visa preparation information (or optional paid visa handling via Aspectama).'
        }
      ]
    },
    aura: {
      eyebrow: 'Aura — KLN Initial Information Assistant',
      title: 'Get clear answers before meeting your advisor.',
      subtitle: 'Aura answers questions about how KLN’s free advisory model works, comparing our 7 destination countries, IELTS/Pathway options, and fee transparency anytime.',
      greeting: 'Hello! I am Aura, the initial information assistant for KLN (Kampus Luar Negeri). Are you planning a Bachelor’s, Master’s, or Pathway program? Pick a quick question or type yours below.',
      quickPrompts: [
        'Is KLN’s consultation service really free for students?',
        'Which countries are in KLN’s 527 partner university network?',
        'What if I do not have an IELTS or TOEFL score yet?',
        'Does KLN help with scholarships and student visas?',
        'How do KLN, Aspectama, and GlobalReadiness.ID (GRID) work together?'
      ],
      placeholder: 'Ask a question about studying abroad...',
      sendBtn: 'Send',
      handoffCta: 'Talk to an Advisor',
      disclaimer: 'Aura is an initial AI information assistant and does not replace a human advisor. Please do not share passport numbers, national ID, or sensitive financial details in chat.'
    },
    consultation: {
      eyebrow: 'Schedule a Session with an Advisor',
      title: 'Start with one focused conversation.',
      subtitle: 'Fill out your brief profile. Once submitted, you can continue directly to KLN’s official WhatsApp with your study summary and shortlisted universities pre-filled.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Student or parent name',
      whatsappLabel: 'Active WhatsApp Number',
      whatsappPlaceholder: 'e.g. +62 812 3456 7890',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@email.com',
      levelLabel: 'Target Study Level',
      levels: [
        "Bachelor's Degree (Undergraduate)",
        "Master's Degree (Postgraduate)",
        'Foundation / Pathway / Community College',
        'English Language Preparation (ELICOS / Pre-sessional)'
      ],
      countryLabel: 'Primary Destination Country',
      intakeLabel: 'Target Intake Window',
      intakes: [
        'Fall / Semester 2 2026',
        'Spring / Early 2027',
        'Fall / Semester 2 2027',
        'Early exploration stage'
      ],
      notesLabel: 'Intended Major / Initial Questions',
      notesPlaceholder: 'e.g. Business or Computer Science, comparing Australia and the UK...',
      consentLabel: 'I agree to the KLN Privacy Policy and consent to being contacted by a KLN advisor via WhatsApp or email to schedule my consultation.',
      submitBtn: 'Submit & Continue to Advisor WhatsApp',
      successTitle: 'Your Initial Plan Is Ready for a KLN Advisor',
      successBody: 'Click the button below to open KLN’s official WhatsApp (+1 602 600 5671) with your pre-filled consultation summary.',
      openWhatsappBtn: 'Open Advisor WhatsApp Now'
    },
    directoryPage: {
      eyebrow: 'Official Partner Network Directory',
      title: '527 Partner Universities & Institutions Across 7 Countries.',
      subtitle: 'Browse KLN’s partner institutions through our partnership with PT Aspectama Nusantara. Save campuses to your Shortlist to review with an advisor.',
      searchPlaceholder: 'Search university name or city (e.g. Monash, Manchester, Seattle, Toronto)...',
      showingCount: 'Showing',
      ofTotal: 'of',
      partnersLabel: 'partner institutions',
      allCountries: 'All Countries',
      tuitionConsult: 'Contact an advisor',
      addShortlistBtn: 'Add to Shortlist',
      inShortlistBtn: 'Saved in Shortlist',
      shortlistTitle: 'Shortlisted Campuses',
      shortlistClear: 'Clear all',
      shortlistConsultCta: 'Discuss with an Advisor'
    },
    faqPage: {
      eyebrow: 'Information & Transparency Hub',
      title: 'Frequently Asked Questions (FAQ).',
      subtitle: 'Clear, transparent answers about KLN’s free student service, partnership structure, application requirements, and personal data protection.',
      searchPlaceholder: 'Search FAQ keywords (e.g. free, commission, IELTS, visa, Aspectama)...',
      categories: {
        all: 'All Topics',
        kln: 'About KLN',
        fee: 'Fees & Commissions',
        choose: 'Choosing Country & Campus',
        docs: 'Documents, Scholarships & Visas',
        aura: 'Aura & Personal Data'
      }
    },
    footer: {
      tagline: 'One plan, campuses around the world.',
      about: 'Overseas study planning and application advisory under the GlobalBridger.ID brand, operated by PT Talenta Nusantara Advisory (TNA Group).',
      navTitle: 'Navigation',
      legalTitle: 'Legal Documents',
      contactTitle: 'Official Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      hours: 'Monday–Friday, 09:00–17:00 WIB (GMT+7)',
      sla: 'Reply target: within 1 business day',
      disclosure: 'Partnership Disclosure: KLN operates under PT Talenta Nusantara Advisory (TNA Group) under the GlobalBridger.ID brand and acts as a sub-agent of PT Aspectama Nusantara. Consultation and partner university applications are free for students. Intensive essay/interview prep via GlobalReadiness.ID (GRID) and paid visa handling via Aspectama are optional and billed separately.',
      copyright: '© 2026 PT Talenta Nusantara Advisory (GlobalBridger.ID — KLN Kampus Luar Negeri). All rights reserved.'
    }
  }
};

// Aura AI safety guardrails & bilingual response engine
const CRISIS_PATTERNS = [
  /bunuh diri/i, /ingin mati/i, /mengakhiri hidup/i, /nyakitin diri/i, /menyakiti diri/i,
  /gak kuat hidup/i, /nggak kuat hidup/i, /suicide/i, /kill myself/i, /end my life/i,
  /self[- ]harm/i, /hurt myself/i, /don'?t want to live/i,
];

const PII_PATTERNS = [
  /\b\d{16}\b/,
  /\b[A-Z]\d{7,8}\b/i,
  /\b(?:\d[ -]*?){13,16}\b/,
];

function generateAuraReply(message, lang = 'id') {
  const q = String(message || '').trim();
  const lower = q.toLowerCase();

  for (const pat of CRISIS_PATTERNS) {
    if (pat.test(q)) {
      return lang === 'id'
        ? 'Terima kasih sudah berbagi — yang kamu rasakan itu penting, dan kamu tidak harus menghadapinya sendirian.\n\nAura adalah asisten perencanaan studi dan tidak bisa mendampingi situasi krisis, tapi ada orang-orang yang siap mendengarkan sekarang:\n\n• Kemenkes RI — Layanan Kesehatan Jiwa Sehat Jiwa: hubungi 119 ext 8\n• Into The Light Indonesia: intothelightid.org\n• Yayasan Pulih: (021) 788-42580 / WhatsApp 0811-8436-633\n\nKalau memungkinkan, hubungi juga orang dewasa yang kamu percaya hari ini — orang tua, kakak, guru, atau konselor sekolah.'
        : 'Thank you for sharing — what you are feeling matters, and you do not have to go through it alone.\n\nAura is a study-planning assistant and cannot support crisis situations, but there are people ready to listen right now:\n\n• Indonesian Ministry of Health Mental Health Hotline (Sehat Jiwa): call 119 ext 8\n• Into The Light Indonesia: intothelightid.org\n• Yayasan Pulih: (021) 788-42580 / WhatsApp +62 811-8436-633\n• If you are outside Indonesia: find your local crisis line at findahelpline.com';
    }
  }

  for (const pat of PII_PATTERNS) {
    if (pat.test(q)) {
      return lang === 'id'
        ? 'Demi keamanan privasi kamu, mohon jangan membagikan nomor paspor, NIK, nomor rekening bank, atau dokumen sensitif di kolom chat ini. Kamu hanya perlu berbagi jenjang studi, negara tujuan, dan bidang minat — dokumen resmi baru akan diminta secara aman saat proses pendaftaran bersama konselor KLN.'
        : 'For your privacy and security, please do not share passport numbers, national ID (NIK), bank details, or sensitive documents in this chat. You only need to share your study level, target countries, and field of interest — official documents will be collected securely by your KLN advisor during application.';
    }
  }

  if (lower.includes('biaya') || lower.includes('gratis') || lower.includes('free') || lower.includes('cost') || lower.includes('fee') || lower.includes('bayar') || lower.includes('komisi')) {
    return lang === 'id'
      ? 'Layanan konsultasi dan perencanaan studi di KLN sepenuhnya gratis untuk pelajar dan keluarga — mulai dari sesi pemetaan awal, penyusunan daftar pendek kampus, hingga pengiriman aplikasi ke universitas mitra.\n\nKLN beroperasi di bawah PT Talenta Nusantara Advisory (TNA Group) dengan merek GlobalBridger.ID, bekerja sama sebagai sub-agen PT Aspectama Nusantara. Kami menerima komisi resmi dari institusi mitra saat pelajar berhasil mendaftar.\n\nCatatan transparan:\n• Biaya pihak ketiga (biaya pendaftaran universitas bila ada, tes IELTS/TOEFL, terjemahan tersumpah, biaya kedutaan) dibayarkan langsung ke penyelenggara terkait.\n• Bila kamu membutuhkan pendampingan esai atau wawancara mendalam, konselor kami dapat merujuk ke GlobalReadiness.ID (GRID) dengan biaya terpisah dan persetujuanmu.\n• Bila membutuhkan pendampingan pengurusan visa pelajar, layanan tersebut disediakan oleh Aspectama secara terpisah.\n\nUntuk rincian biaya kuliah spesifik tiap kampus: Hubungi konselor.'
      : 'Consultation and study planning at KLN are completely free for students and families — from initial mapping and shortlisting to submitting applications to partner universities.\n\nKLN operates under PT Talenta Nusantara Advisory (TNA Group) under the GlobalBridger.ID brand, acting as a sub-agent of PT Aspectama Nusantara. We are compensated by partner institutions when a student successfully enrolls.\n\nTransparent note:\n• Third-party costs (university application fees where applicable, IELTS/TOEFL tests, sworn translations, embassy visa fees) are paid directly to those providers.\n• If you need intensive essay or interview coaching, your advisor can refer you to GlobalReadiness.ID (GRID) as a separate paid service with your explicit consent.\n• If you need paid visa application support, that is handled directly by Aspectama under a separate agreement.\n\nFor specific tuition figures at a given university: Contact an advisor.';
  }

  if (lower.includes('visa') || lower.includes('imigrasi') || lower.includes('aspectama') || lower.includes('grid') || lower.includes('globalreadiness')) {
    return lang === 'id'
      ? 'Perbedaan peran ekosistem kami:\n• KLN (Kampus Luar Negeri): Konsultasi perencanaan studi dan pengiriman pendaftaran ke 527 kampus mitra — gratis untuk pelajar.\n• PT Aspectama Nusantara: Mitra agen utama kami; juga menyediakan layanan pendampingan pengurusan visa pelajar berbayar secara terpisah bila kamu membutuhkannya.\n• GlobalReadiness.ID (GRID): Unit saudara di bawah TNA Group untuk bimbingan esai (personal statement) dan persiapan wawancara berbayar secara opsional.\n\nSemua rujukan ke layanan berbayar hanya dilakukan atas persetujuanmu.'
      : 'How our ecosystem roles differ:\n• KLN (Kampus Luar Negeri): Study planning consultation and application submission across 527 partner campuses — free for students.\n• PT Aspectama Nusantara: Our principal partner agency; also offers optional paid student visa handling under a separate agreement.\n• GlobalReadiness.ID (GRID): Our sister unit under TNA Group offering optional paid essay coaching and interview preparation.\n\nAny referral to a paid service is strictly opt-in with your explicit consent.';
  }

  if (lower.includes('beasiswa') || lower.includes('scholarship') || lower.includes('lpdp') || lower.includes('funding')) {
    return lang === 'id'
      ? 'Banyak universitas mitra di jaringan KLN menawarkan beasiswa parsial berbasis prestasi akademik (merit scholarship) atau potongan uang kuliah untuk pelajar internasional. Selain itu, banyak pelajar Indonesia memadukan LoA (Letter of Acceptance) dari kampus mitra dengan beasiswa eksternal bila memenuhi syarat.\n\nKarena ketersediaan dan nominal beasiswa berubah setiap periode masuk (intake), kami tidak menampilkan angka tetap di chat. Hubungi konselor KLN agar kami bisa memetakan kampus mitra yang memiliki skema beasiswa sesuai profil akademikmu.'
      : 'Many partner universities in the KLN network offer merit-based partial scholarships or international tuition bursaries. Indonesian students also frequently pair a Letter of Acceptance (LoA) from a partner university with external scholarships where eligible.\n\nBecause scholarship availability and amounts change each intake, we do not quote fixed figures in chat. Contact an advisor at KLN so we can map out partner universities offering scholarships aligned with your academic profile.';
  }

  if (lower.includes('ielts') || lower.includes('toefl') || lower.includes('bahasa inggris') || lower.includes('english') || lower.includes('pathway') || lower.includes('foundation')) {
    return lang === 'id'
      ? 'Sebagian besar program S1 dan S2 di Inggris, Australia, Amerika Serikat, Kanada, Selandia Baru, Irlandia, dan Malaysia meminta bukti kemampuan bahasa Inggris (umumnya IELTS Academic 6.0–6.5 atau setara TOEFL iBT, tergantung jurusan).\n\nBelum punya skor IELTS?\n• Kamu tetap bisa memulai sesi konsultasi awal dengan konselor KLN sekarang.\n• Banyak universitas memungkinkan pengiriman aplikasi awal untuk mendapatkan Conditional Offer sambil kamu menyiapkan tes bahasa.\n• Tersedia juga jalur English language preparation atau Foundation / International Year One (Pathway) untuk jembatan akademik dan bahasa.'
      : 'Most undergraduate and postgraduate programs across the UK, Australia, the US, Canada, New Zealand, Ireland, and Malaysia require proof of English proficiency (typically IELTS Academic 6.0–6.5 or TOEFL iBT equivalent, depending on the program).\n\nDo not have an IELTS score yet?\n• You can still start your initial consultation with a KLN advisor right away.\n• Many universities allow you to apply for a Conditional Offer first and submit your English test score later.\n• We also support English language programs and Foundation / International Year One pathway options.';
  }

  if (lower.includes('negara') || lower.includes('destinasi') || lower.includes('country') || lower.includes('countries') || lower.includes('australia') || lower.includes('inggris') || lower.includes('uk') || lower.includes('amerika') || lower.includes('kanada') || lower.includes('malaysia') || lower.includes('irlandia') || lower.includes('selandia baru') || lower.includes('527') || lower.includes('500')) {
    return lang === 'id'
      ? 'Jaringan KLN mencakup 527 universitas dan institusi mitra di 7 negara tujuan:\n\n1. Amerika Serikat (180 mitra) — S1 4 tahun fleksibel, Community College 2+2, dan riset S2.\n2. Inggris Raya / UK (93 mitra) — S1 terfokus 3 tahun dan Master (S2) intensif 1 tahun.\n3. Kanada (85 mitra) — Universitas riset dan politeknik terapan dengan ekosistem co-op.\n4. Australia (79 mitra) — Termasuk anggota Group of Eight (Go8) dan universitas teknologi dekat dari Indonesia.\n5. Selandia Baru (36 mitra) — Seluruh 8 universitas negeri dan institut teknologi terapan.\n6. Irlandia (27 mitra) — Kampus berbahasa Inggris di Uni Eropa, kuat di teknologi & farmasi.\n7. Malaysia (27 mitra) — Kampus cabang internasional (UK/Australia) dan universitas swasta terkemuka dengan biaya hidup lebih terjangkau.\n\nKamu bisa membandingkan 2–3 negara sekaligus dalam satu rencana bersama konselor KLN.'
      : 'The KLN network covers 527 partner universities and institutions across 7 destination countries:\n\n1. United States (180 partners) — Flexible 4-year Bachelor’s, 2+2 Community College pathways, and graduate research.\n2. United Kingdom (93 partners) — Focused 3-year Bachelor’s and intensive 1-year Master’s degrees.\n3. Canada (85 partners) — Comprehensive universities and polytechnics known for co-op work placements.\n4. Australia (79 partners) — Including Group of Eight (Go8) and practical technology universities close to Indonesia.\n5. New Zealand (36 partners) — All 8 public universities plus applied institutes of technology.\n6. Ireland (27 partners) — English-speaking European Union hub for technology, pharma, and finance.\n7. Malaysia (27 partners) — International branch campuses (UK/Australian degrees) and leading private universities close to home.\n\nYou can compare 2–3 countries side by side in a single study plan with a KLN advisor.';
  }

  return lang === 'id'
    ? 'Terima kasih atas pertanyaannya. Untuk menyusun opsi yang paling relevan, Aura menyarankan kita mulai dari tiga hal sederhana:\n\n1. Jenjang studi yang kamu tuju (S1, S2, Bahasa Inggris, atau Pathway/Foundation)?\n2. Bidang studi atau jurusan yang sedang kamu pertimbangkan?\n3. Negara tujuan dan target tahun mulai kuliah (mis. 2026 atau 2027)?\n\nKamu bisa membalas langsung di sini, menjelajahi halaman 527 Universitas Mitra, atau mengisi formulir Konsultasi Gratis di bawah agar konselor manusia KLN menghubungi kamu lewat WhatsApp dalam 1 hari kerja.'
    : 'Thank you for your question. To help map out the most relevant options, Aura suggests starting with three simple details:\n\n1. Study level you are targeting (Bachelor’s, Master’s, English Preparation, or Pathway/Foundation)?\n2. Field of study or major you are considering?\n3. Preferred destination countries and target intake year (e.g., 2026 or 2027)?\n\nYou can reply right here, explore the 527 Partner Universities directory, or fill out the Free Consultation form below so a human KLN advisor can reach out via WhatsApp within 1 business day.';
}

export function buildStandaloneHtml(defaultRoute = '/') {
  return `<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KLN — Kampus Luar Negeri | Satu rencana, banyak kampus dunia.</title>
  <meta name="description" content="KLN membantu pelajar Indonesia merencanakan studi S1, S2, bahasa, dan pathway di luar negeri melalui jaringan 500+ universitas mitra di 7 negara — tanpa biaya konsultasi untuk pelajar." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root, [data-theme="light"] {
      --bg: #F8F7F4;
      --bg-elev: #FFFFFF;
      --bg-subtle: #F1EFEA;
      --ink: #0F1E36;
      --ink-2: #3D4E66;
      --ink-3: #6B7A90;
      --navy: #1B3F6B;
      --navy-2: #132E50;
      --teal: #2E9E91;
      --teal-ink: #1F7469;
      --teal-tint: #E6F4F1;
      --amber: #D9822B;
      --amber-tint: #FDF2E4;
      --coral: #C95B4A;
      --border: #E4E1DA;
      --border-strong: #CEC9BE;
      --shadow-sm: 0 1px 2px rgba(15, 30, 54, 0.05);
      --shadow-md: 0 8px 24px -8px rgba(15, 30, 54, 0.08), 0 2px 6px rgba(15, 30, 54, 0.04);
      --shadow-lg: 0 20px 44px -16px rgba(15, 30, 54, 0.14), 0 4px 12px rgba(15, 30, 54, 0.05);
    }
    [data-theme="dark"] {
      --bg: #0B1626;
      --bg-elev: #132238;
      --bg-subtle: #182B45;
      --ink: #F2F4F7;
      --ink-2: #B9C4D4;
      --ink-3: #7E8EA6;
      --navy: #2D5C96;
      --navy-2: #1B3F6B;
      --teal: #3BB4A6;
      --teal-ink: #6CD3C6;
      --teal-tint: rgba(59, 180, 166, 0.14);
      --amber: #E99B49;
      --amber-tint: rgba(233, 155, 73, 0.14);
      --coral: #E07867;
      --border: #213450;
      --border-strong: #2E4566;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
      --shadow-md: 0 8px 24px -8px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 20px 44px -16px rgba(0, 0, 0, 0.55);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    h1, h2, h3, h4, .font-display {
      font-family: 'Montserrat', sans-serif;
      letter-spacing: -0.025em;
    }
    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font: inherit; color: inherit; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .skip-link {
      position: absolute; left: -9999px; top: 8px; z-index: 9999;
      padding: 10px 16px; background: var(--navy); color: #fff; border-radius: 8px; font-weight: 600;
    }
    .skip-link:focus { left: 12px; }
    .navbar {
      position: sticky; top: 0; z-index: 50;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .navbar-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 74px; gap: 16px;
    }
    .nav-links { display: flex; align-items: center; gap: 4px; }
    .nav-link {
      padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 500;
      color: var(--ink-2); cursor: pointer; background: transparent; border: none;
      transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 6px;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--ink); background: var(--bg-subtle); font-weight: 600;
    }
    .badge-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;
      background: var(--teal-tint); color: var(--teal-ink);
    }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 600;
      background: var(--navy); color: #fff; border: none; cursor: pointer;
      box-shadow: var(--shadow-sm); transition: all 0.15s ease;
    }
    .btn-primary:hover { background: var(--navy-2); transform: translateY(-1px); }
    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
      background: var(--bg-elev); color: var(--ink); border: 1px solid var(--border-strong);
      cursor: pointer; transition: all 0.15s ease;
    }
    .btn-secondary:hover { background: var(--bg-subtle); }
    .hero-section {
      position: relative; overflow: hidden; padding: 48px 0 64px;
      border-bottom: 1px solid var(--border);
    }
    .hero-grid {
      display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center;
    }
    @media (max-width: 960px) {
      .hero-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
    }
    .hero-title {
      font-size: clamp(2.1rem, 3.8vw, 3.35rem); font-weight: 800; line-height: 1.1;
      color: var(--ink); margin: 16px 0;
    }
    .hero-lead {
      font-size: 17px; color: var(--ink-2); max-width: 580px; margin-bottom: 28px;
    }
    .hero-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      padding-top: 24px; margin-top: 28px; border-top: 1px solid var(--border);
    }
    .stat-num { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: var(--ink); }
    .stat-label { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
    .globe-stage {
      position: relative; width: 100%; max-width: 500px; aspect-ratio: 1 / 1; margin: 0 auto;
    }
    .ribbon { background: var(--bg-subtle); border-bottom: 1px solid var(--border); padding: 16px 0; }
    .ribbon-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .country-chip {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px;
      border-radius: 8px; background: var(--bg-elev); border: 1px solid var(--border);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
    }
    .country-chip:hover, .country-chip.active {
      border-color: var(--teal); background: var(--teal-tint); color: var(--teal-ink);
    }
    .section { padding: 72px 0; }
    .section-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 40px; }
    .eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--teal-ink); margin-bottom: 8px; }
    .section-title { font-size: clamp(1.65rem, 2.8vw, 2.25rem); font-weight: 800; line-height: 1.2; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .card {
      background: var(--bg-elev); border: 1px solid var(--border); border-radius: 16px;
      padding: 24px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
      justify-content: space-between; transition: all 0.2s ease;
    }
    .card:hover { border-color: var(--teal); box-shadow: var(--shadow-md); }
    .two-col { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 36px; align-items: start; }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
    .chat-box {
      background: var(--bg-elev); border: 1px solid var(--border); border-radius: 16px;
      box-shadow: var(--shadow-lg); overflow: hidden; display: flex; flex-direction: column;
    }
    .chat-messages {
      height: 360px; overflow-y: auto; padding: 20px; background: var(--bg);
      display: flex; flex-direction: column; gap: 14px;
    }
    .msg-bubble {
      max-width: 86%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.55;
      white-space: pre-line;
    }
    .msg-aura {
      align-self: flex-start; background: var(--bg-elev); border: 1px solid var(--border);
      border-bottom-left-radius: 4px; color: var(--ink);
    }
    .msg-user {
      align-self: flex-end; background: var(--navy); color: #fff;
      border-bottom-right-radius: 4px;
    }
    .input-field {
      width: 100%; padding: 11px 14px; border-radius: 10px;
      background: var(--bg); border: 1px solid var(--border-strong);
      font-size: 14px; color: var(--ink); outline: none;
    }
    .input-field:focus { border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-tint); }
    .shortlist-bar {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      z-index: 60; width: calc(100% - 32px); max-width: 760px;
      background: var(--bg-elev); border: 2px solid var(--teal); border-radius: 16px;
      padding: 14px 20px; box-shadow: var(--shadow-lg);
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer {
      background: var(--bg-subtle); border-top: 1px solid var(--border); padding: 56px 0 36px; margin-top: 48px;
    }
    .footer-grid {
      display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: 32px; margin-bottom: 36px;
    }
    @media (max-width: 860px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 540px) { .footer-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Langsung ke isi utama / Skip to main content</a>
  <div id="app"></div>

  <script>
    window.__KLN_DEFAULT_ROUTE__ = ${JSON.stringify(defaultRoute)};
    window.__KLN_TOPO_LAND__ = ${topoLandRaw};
    window.__KLN_UNIS__ = ${JSON.stringify(flatUnis)};
    window.__KLN_DESTINATIONS__ = ${JSON.stringify(DESTINATIONS)};
    window.__KLN_FAQS__ = ${faqItemsJs};
    window.__KLN_I18N__ = ${JSON.stringify(UI_TEXT)};
    window.__KLN_LEGAL__ = ${legalContentJs};
  </script>
  <script>
    (function() {
      const state = {
        route: window.__KLN_DEFAULT_ROUTE__ || '/',
        lang: localStorage.getItem('kln_lang') || (window.__KLN_DEFAULT_ROUTE__?.startsWith('/en') ? 'en' : 'id'),
        theme: localStorage.getItem('kln_theme') || 'light',
        shortlist: JSON.parse(localStorage.getItem('kln_shortlist') || '[]'),
        destCountry: 'all',
        destQuery: '',
        destLimit: 48,
        faqCat: 'all',
        faqQuery: '',
        faqOpenIdx: 0,
        globePaused: false,
        auraMessages: [],
        formSuccess: null
      };

      document.documentElement.setAttribute('data-theme', state.theme);
      document.documentElement.setAttribute('lang', state.lang);

      function t() {
        return window.__KLN_I18N__[state.lang] || window.__KLN_I18N__.id;
      }

      function saveShortlist() {
        localStorage.setItem('kln_shortlist', JSON.stringify(state.shortlist));
      }

      window.klnToggleTheme = function() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('kln_theme', state.theme);
        document.documentElement.setAttribute('data-theme', state.theme);
        render();
      };

      window.klnSetLang = function(newLang) {
        state.lang = newLang;
        localStorage.setItem('kln_lang', newLang);
        document.documentElement.setAttribute('lang', newLang);
        render();
      };

      window.klnNavigate = function(route, opts = {}) {
        state.route = route;
        if (opts.country) state.destCountry = opts.country;
        if (window.history && window.history.pushState && location.protocol.startsWith('http')) {
          window.history.pushState({}, '', route);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        render();
      };

      window.klnToggleShortlist = function(name, country) {
        const idx = state.shortlist.findIndex(u => u.name === name && u.country === country);
        if (idx >= 0) {
          state.shortlist.splice(idx, 1);
        } else {
          state.shortlist.push({ name, country });
        }
        saveShortlist();
        render();
      };

      window.klnClearShortlist = function() {
        state.shortlist = [];
        saveShortlist();
        render();
      };

      function logoSvg() {
        const navy = state.theme === 'dark' ? '#F2F4F7' : '#1B3F6B';
        const sub = state.theme === 'dark' ? '#9FB2CC' : '#3D4E66';
        return \`
          <span style="display:inline-flex;align-items:center;gap:12px;user-select:none">
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <circle cx="30" cy="34" r="22" stroke="#2E9E91" stroke-width="2.5" />
              <ellipse cx="30" cy="34" rx="11" ry="22" stroke="#2E9E91" stroke-width="2" />
              <line x1="8" y1="34" x2="52" y2="34" stroke="#2E9E91" stroke-width="2" />
              <path d="M13 24 C 21 26, 39 26, 47 24" stroke="#2E9E91" stroke-width="1.8" fill="none" />
              <path d="M13 44 C 21 42, 39 42, 47 44" stroke="#2E9E91" stroke-width="1.8" fill="none" />
              <path d="M14 48 C 20 26, 36 16, 54 12" stroke="\${navy}" stroke-width="2.8" stroke-linecap="round" fill="none" />
              <polygon points="60,9 46,12 51,16 53,21" fill="#2E9E91" />
            </svg>
            <span style="display:flex;flex-direction:column;line-height:1">
              <span class="font-display" style="font-weight:800;font-size:21px;color:\${navy};letter-spacing:-0.03em">KLN</span>
              <span style="font-weight:600;font-size:9px;letter-spacing:0.15em;color:\${sub};margin-top:3px">KAMPUS LUAR NEGERI</span>
            </span>
          </span>\`;
      }

      function renderNavbar() {
        const tr = t();
        return \`
          <header class="navbar">
            <div class="container navbar-inner">
              <a href="#top" onclick="event.preventDefault();klnNavigate('/')" aria-label="KLN — Kampus Luar Negeri">
                \${logoSvg()}
              </a>
              <nav class="nav-links" aria-label="Navigasi utama">
                <button class="nav-link \${state.route === '/' || state.route === '/en' ? 'active' : ''}" onclick="klnNavigate('/')">
                  \${tr.nav.destinations}
                </button>
                <button class="nav-link \${state.route.includes('dest') ? 'active' : ''}" onclick="klnNavigate('/destinasi')">
                  \${tr.nav.universities}
                  <span class="badge-pill" style="padding:2px 7px;font-size:11px">527</span>
                </button>
                <button class="nav-link" onclick="klnNavigate('/');setTimeout(()=>document.getElementById('langkah')?.scrollIntoView({behavior:'smooth'}),80)">
                  \${tr.nav.steps}
                </button>
                <button class="nav-link" onclick="klnNavigate('/');setTimeout(()=>document.getElementById('aura')?.scrollIntoView({behavior:'smooth'}),80)">
                  \${tr.nav.aura}
                </button>
                <button class="nav-link \${state.route.includes('faq') ? 'active' : ''}" onclick="klnNavigate('/faq')">
                  \${tr.nav.faq}
                </button>
              </nav>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="display:inline-flex;background:var(--bg-subtle);border:1px solid var(--border);border-radius:8px;padding:2px">
                  <button onclick="klnSetLang('id')" style="padding:4px 9px;font-size:12px;font-weight:700;border-radius:6px;border:none;cursor:pointer;background:\${state.lang==='id'?'var(--navy)':'transparent'};color:\${state.lang==='id'?'#fff':'var(--ink-2)'}">ID</button>
                  <button onclick="klnSetLang('en')" style="padding:4px 9px;font-size:12px;font-weight:700;border-radius:6px;border:none;cursor:pointer;background:\${state.lang==='en'?'var(--navy)':'transparent'};color:\${state.lang==='en'?'#fff':'var(--ink-2)'}">EN</button>
                </div>
                <button onclick="klnToggleTheme()" aria-label="Toggle theme" style="width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elev);cursor:pointer;display:inline-flex;align-items:center;justify-content:center">
                  \${state.theme === 'light' ? '☾' : '☀'}
                </button>
                <button class="btn-primary" style="padding:9px 16px;font-size:13px" onclick="klnNavigate('/');setTimeout(()=>document.getElementById('konsultasi')?.scrollIntoView({behavior:'smooth'}),80)">
                  \${tr.nav.consultCta}
                </button>
              </div>
            </div>
          </header>
        \`;
      }

      function renderFooter() {
        const tr = t();
        return \`
          <footer class="footer">
            <div class="container">
              <div class="footer-grid">
                <div>
                  \${logoSvg()}
                  <p class="font-display" style="font-weight:700;font-size:14px;margin-top:14px;color:var(--ink)">\${tr.footer.tagline}</p>
                  <p style="font-size:13px;color:var(--ink-2);margin-top:8px;max-width:360px">\${tr.footer.about}</p>
                </div>
                <div>
                  <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink);margin-bottom:12px">\${tr.footer.navTitle}</h3>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--ink-2)">
                    <a href="#destinasi" onclick="event.preventDefault();klnNavigate('/')">\${tr.nav.destinations}</a>
                    <a href="/destinasi" onclick="event.preventDefault();klnNavigate('/destinasi')">\${tr.nav.universities} (527)</a>
                    <a href="#aura" onclick="event.preventDefault();klnNavigate('/');setTimeout(()=>document.getElementById('aura')?.scrollIntoView({behavior:'smooth'}),80)">\${tr.nav.aura}</a>
                    <a href="/faq" onclick="event.preventDefault();klnNavigate('/faq')">\${tr.nav.faq}</a>
                  </div>
                </div>
                <div>
                  <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink);margin-bottom:12px">\${tr.footer.legalTitle}</h3>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--ink-2)">
                    <a href="/privasi" onclick="event.preventDefault();klnNavigate('/privasi')">\${tr.footer.privacy}</a>
                    <a href="/syarat" onclick="event.preventDefault();klnNavigate('/syarat')">\${tr.footer.terms}</a>
                  </div>
                </div>
                <div>
                  <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink);margin-bottom:12px">\${tr.footer.contactTitle}</h3>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--ink-2)">
                    <a href="https://wa.me/16026005671" target="_blank" rel="noopener noreferrer" style="color:var(--teal-ink);font-weight:600">WhatsApp: +1 602 600 5671</a>
                    <a href="mailto:info@kampusluarnegeri.com">info@kampusluarnegeri.com</a>
                    <span style="font-size:12px;color:var(--ink-3)">\${tr.footer.hours}</span>
                    <span style="font-size:12px;color:var(--ink-3)">\${tr.footer.sla}</span>
                  </div>
                </div>
              </div>
              <div style="border-top:1px solid var(--border);padding-top:20px;font-size:12px;color:var(--ink-3);display:flex;flex-direction:column;gap:8px">
                <p>\${tr.footer.disclosure}</p>
                <p>\${tr.footer.copyright}</p>
              </div>
            </div>
          </footer>
        \`;
      }

      function renderHome() {
        const tr = t();
        const dests = window.__KLN_DESTINATIONS__;
        const totalPartners = dests.reduce((s, d) => s + d.partnerCount, 0);

        if (state.auraMessages.length === 0) {
          state.auraMessages = [{ role: 'aura', text: tr.aura.greeting }];
        }

        return \`
          <section class="hero-section">
            <div class="container hero-grid">
              <div>
                <div style="display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:999px;background:var(--bg-elev);border:1px solid var(--border);margin-bottom:12px">
                  <span class="badge-pill" style="padding:2px 8px;font-size:11px">\${tr.hero.badgeFree}</span>
                  <span style="font-size:12px;font-weight:600;color:var(--ink-2)">\${tr.hero.eyebrow}</span>
                </div>
                <h1 class="hero-title">
                  \${tr.hero.headlineStart}
                  <span style="color:var(--teal);display:block;margin-top:4px">\${tr.hero.headlineAccent}</span>
                </h1>
                <p class="hero-lead">\${tr.hero.subheadline}</p>
                <div style="display:flex;flex-wrap:wrap;gap:12px">
                  <button class="btn-primary" onclick="document.getElementById('konsultasi')?.scrollIntoView({behavior:'smooth'})">
                    \${tr.hero.ctaPrimary} →
                  </button>
                  <button class="btn-secondary" onclick="klnNavigate('/destinasi')">
                    \${tr.hero.ctaSecondary}
                  </button>
                </div>
                <div class="hero-stats">
                  <div>
                    <div class="stat-num">500+</div>
                    <div class="stat-label">\${tr.hero.statUniversitiesLabel}</div>
                  </div>
                  <div>
                    <div class="stat-num">7</div>
                    <div class="stat-label">\${tr.hero.statCountriesLabel}</div>
                  </div>
                  <div>
                    <div class="stat-num" style="color:var(--teal)">Rp 0</div>
                    <div class="stat-label">\${tr.hero.statCostLabel}</div>
                  </div>
                </div>
              </div>
              <div class="globe-stage">
                <canvas id="kln-globe-canvas" style="width:100%;height:100%;display:block;cursor:grab"></canvas>
                <div id="kln-globe-labels" style="position:absolute;inset:0;pointer-events:none;overflow:hidden"></div>
                <button id="kln-globe-toggle" style="position:absolute;bottom:10px;right:10px;padding:6px 12px;border-radius:999px;border:1px solid var(--border);background:var(--bg-elev);font-size:12px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">
                  \${state.globePaused ? tr.hero.playGlobe : tr.hero.pauseGlobe}
                </button>
              </div>
            </div>
          </section>

          <section class="ribbon">
            <div class="container ribbon-inner">
              <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink-2)">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--teal)"></span>
                <span>\${tr.ribbon.label}:</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                \${dests.map(d => \`
                  <button class="country-chip" onclick="klnNavigate('/destinasi', {country: '\${d.code}'})">
                    <span style="font-size:11px;font-weight:800;color:var(--teal-ink);text-transform:uppercase">\${d.code}</span>
                    <span>\${d.name[state.lang]}</span>
                    <span style="font-size:11px;color:var(--ink-3)">\${d.partnerCount}</span>
                  </button>
                \`).join('')}
              </div>
              <button onclick="klnNavigate('/destinasi')" style="background:none;border:none;color:var(--teal-ink);font-size:13px;font-weight:700;cursor:pointer">
                \${tr.ribbon.viewAll} (\${totalPartners}) →
              </button>
            </div>
          </section>

          <section id="destinasi" class="section">
            <div class="container">
              <div class="section-header">
                <div style="max-width:640px">
                  <div class="eyebrow">\${tr.destinationsSection.eyebrow}</div>
                  <h2 class="section-title">\${tr.destinationsSection.title}</h2>
                  <p style="color:var(--ink-2);margin-top:8px">\${tr.destinationsSection.subtitle}</p>
                </div>
                <button class="btn-secondary" onclick="klnNavigate('/destinasi')">
                  \${tr.destinationsSection.browseAllCta} (527) →
                </button>
              </div>
              <div class="cards-grid">
                \${dests.map(d => \`
                  <article class="card">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
                        <div>
                          <span style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--teal-ink)">\${d.regionTag[state.lang]}</span>
                          <h3 style="font-size:20px;font-weight:800;margin-top:2px">\${d.name[state.lang]}</h3>
                        </div>
                        <span class="badge-pill">\${d.partnerCount} \${tr.destinationsSection.partnersUnit}</span>
                      </div>
                      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
                        \${d.levels[state.lang].map(l => \`<span style="font-size:12px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--bg-subtle);color:var(--ink-2)">\${l}</span>\`).join('')}
                      </div>
                      <p style="font-size:14px;color:var(--ink-2);margin-bottom:14px">\${d.tone[state.lang]}</p>
                      <div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12px;display:flex;flex-direction:column;gap:6px;margin-bottom:16px">
                        <div style="display:flex;justify-content:space-between;gap:8px"><span style="color:var(--ink-3)">\${tr.destinationsSection.intakeLabel}</span><strong style="text-align:right">\${d.intake[state.lang]}</strong></div>
                        <div style="display:flex;justify-content:space-between;gap:8px"><span style="color:var(--ink-3)">\${tr.destinationsSection.langLabel}</span><strong style="text-align:right">\${d.englishReq[state.lang]}</strong></div>
                        <div style="display:flex;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid var(--border)"><span style="color:var(--ink-3)">\${tr.destinationsSection.tuitionLabel}</span><span style="color:var(--teal-ink);font-weight:700">\${tr.destinationsSection.tuitionValue}</span></div>
                      </div>
                    </div>
                    <button class="btn-secondary" style="width:100%;font-size:13px;padding:10px" onclick="klnNavigate('/destinasi', {country: '\${d.code}'})">
                      \${tr.destinationsSection.exploreBtn} (\${d.partnerCount}) →
                    </button>
                  </article>
                \`).join('')}
              </div>
            </div>
          </section>

          <section id="langkah" class="section" style="background:var(--bg-subtle);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
            <div class="container">
              <div style="max-width:640px;margin-bottom:40px">
                <div class="eyebrow">\${tr.stepsSection.eyebrow}</div>
                <h2 class="section-title">\${tr.stepsSection.title}</h2>
                <p style="color:var(--ink-2);margin-top:8px">\${tr.stepsSection.subtitle}</p>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px">
                \${tr.stepsSection.items.map(s => \`
                  <div class="card">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                        <span class="font-display" style="width:40px;height:40px;border-radius:10px;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">\${s.num}</span>
                        <span class="badge-pill">\${s.badge}</span>
                      </div>
                      <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">\${s.title}</h3>
                      <p style="font-size:14px;color:var(--ink-2)">\${s.desc}</p>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          </section>

          <section id="aura" class="section" style="border-bottom:1px solid var(--border)">
            <div class="container two-col">
              <div>
                <div class="eyebrow">\${tr.aura.eyebrow}</div>
                <h2 class="section-title">\${tr.aura.title}</h2>
                <p style="color:var(--ink-2);margin:12px 0 24px">\${tr.aura.subtitle}</p>
                <div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:12px;padding:18px">
                  <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--ink-3);margin-bottom:10px">
                    \${state.lang === 'id' ? 'Pertanyaan Cepat' : 'Quick Questions'}
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:8px">
                    \${tr.aura.quickPrompts.map((p, idx) => \`
                      <button onclick="klnAskAuraIdx(\${idx})" style="text-align:left;font-size:13px;font-weight:500;padding:8px 13px;border-radius:999px;background:var(--bg-elev);border:1px solid var(--border);cursor:pointer">
                        \${p}
                      </button>
                    \`).join('')}
                  </div>
                </div>
                <p style="font-size:12px;color:var(--ink-3);margin-top:14px">\${tr.aura.disclaimer}</p>
              </div>

              <div class="chat-box">
                <div style="background:var(--navy);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="font-display" style="width:38px;height:38px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:800">A</div>
                    <div>
                      <div class="font-display" style="font-weight:700;font-size:15px">Aura — KLN</div>
                      <div style="font-size:12px;opacity:0.8">\${state.lang === 'id' ? 'Asisten Informasi Awal • Gratis' : 'Initial Info Assistant • Free'}</div>
                    </div>
                  </div>
                  <a href="#konsultasi" style="font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;background:rgba(255,255,255,0.14)">\${tr.aura.handoffCta}</a>
                </div>
                <div id="kln-chat-scroll" class="chat-messages">
                  \${state.auraMessages.map(m => \`
                    <div class="msg-bubble \${m.role === 'user' ? 'msg-user' : 'msg-aura'}">\${m.text}</div>
                  \`).join('')}
                </div>
                <form onsubmit="klnSubmitAura(event)" style="padding:12px 16px;background:var(--bg-elev);border-top:1px solid var(--border);display:flex;gap:10px">
                  <input id="kln-aura-input" class="input-field" type="text" placeholder="\${tr.aura.placeholder}" />
                  <button type="submit" class="btn-primary" style="padding:10px 18px">\${tr.aura.sendBtn}</button>
                </form>
              </div>
            </div>
          </section>

          <section id="konsultasi" class="section" style="background:var(--bg-subtle)">
            <div class="container two-col">
              <div>
                <div class="eyebrow">\${tr.consultation.eyebrow}</div>
                <h2 class="section-title">\${tr.consultation.title}</h2>
                <p style="color:var(--ink-2);margin:12px 0 24px">\${tr.consultation.subtitle}</p>
                <div class="card" style="gap:12px">
                  <div>
                    <div style="font-size:12px;color:var(--ink-3)">WhatsApp Resmi KLN</div>
                    <a href="https://wa.me/16026005671" target="_blank" rel="noopener noreferrer" style="font-size:16px;font-weight:700;color:var(--teal-ink)">+1 602 600 5671</a>
                  </div>
                  <div>
                    <div style="font-size:12px;color:var(--ink-3)">Email</div>
                    <a href="mailto:info@kampusluarnegeri.com" style="font-size:15px;font-weight:600">info@kampusluarnegeri.com</a>
                  </div>
                  <div style="font-size:13px;color:var(--ink-2)">\${tr.footer.hours} • \${tr.footer.sla}</div>
                </div>
              </div>
              <div class="card" style="padding:32px">
                \${state.formSuccess ? \`
                  <div style="text-align:center;padding:24px 0">
                    <div style="width:52px;height:52px;border-radius:50%;background:var(--teal-tint);color:var(--teal-ink);display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;margin-bottom:14px">✓</div>
                    <h3 style="font-size:22px;font-weight:800;margin-bottom:8px">\${tr.consultation.successTitle}</h3>
                    <p style="color:var(--ink-2);font-size:14px;margin-bottom:20px">\${tr.consultation.successBody}</p>
                    <a href="\${state.formSuccess}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background:var(--teal)">
                      \${tr.consultation.openWhatsappBtn} →
                    </a>
                  </div>
                \` : \`
                  <form onsubmit="klnSubmitConsultation(event)" style="display:flex;flex-direction:column;gap:16px">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.nameLabel} *</label>
                        <input name="name" required class="input-field" placeholder="\${tr.consultation.namePlaceholder}" />
                      </div>
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.whatsappLabel} *</label>
                        <input name="whatsapp" required class="input-field" placeholder="\${tr.consultation.whatsappPlaceholder}" />
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.emailLabel}</label>
                        <input name="email" type="email" class="input-field" placeholder="\${tr.consultation.emailPlaceholder}" />
                      </div>
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.levelLabel} *</label>
                        <select name="level" class="input-field">
                          \${tr.consultation.levels.map(l => \`<option value="\${l}">\${l}</option>\`).join('')}
                        </select>
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.countryLabel}</label>
                        <select name="country" class="input-field">
                          <option value="\${state.lang === 'id' ? 'Belum pasti (Ingin diskusi)' : 'Undecided (Open to discussion)'}">\${state.lang === 'id' ? 'Belum pasti (Ingin diskusi)' : 'Undecided (Open to discussion)'}</option>
                          \${dests.map(d => \`<option value="\${d.name[state.lang]}">\${d.name[state.lang]}</option>\`).join('')}
                        </select>
                      </div>
                      <div>
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.intakeLabel}</label>
                        <select name="intake" class="input-field">
                          \${tr.consultation.intakes.map(i => \`<option value="\${i}">\${i}</option>\`).join('')}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">\${tr.consultation.notesLabel}</label>
                      <textarea name="notes" rows="3" class="input-field" placeholder="\${tr.consultation.notesPlaceholder}"></textarea>
                    </div>
                    <label style="display:flex;align-items:flex-start;gap:10px;font-size:12px;color:var(--ink-2);cursor:pointer">
                      <input type="checkbox" required style="margin-top:3px" />
                      <span>\${tr.consultation.consentLabel}</span>
                    </label>
                    <button type="submit" class="btn-primary" style="width:100%">\${tr.consultation.submitBtn} →</button>
                  </form>
                \`}
              </div>
            </div>
          </section>
        \`;
      }

      function renderDestinasi() {
        const tr = t();
        const dests = window.__KLN_DESTINATIONS__;
        const allUnis = window.__KLN_UNIS__;
        const q = state.destQuery.trim().toLowerCase();
        const filtered = allUnis.filter(u => {
          const matchC = state.destCountry === 'all' || u.c === state.destCountry;
          const matchQ = !q || u.n.toLowerCase().includes(q) || (u.city && u.city.toLowerCase().includes(q));
          return matchC && matchQ;
        });
        const visible = filtered.slice(0, state.destLimit);

        return \`
          <section class="section" style="padding-top:40px">
            <div class="container">
              <div class="eyebrow">\${tr.directoryPage.eyebrow}</div>
              <h1 class="section-title" style="margin-bottom:10px">\${tr.directoryPage.title}</h1>
              <p style="color:var(--ink-2);max-width:720px;margin-bottom:28px">\${tr.directoryPage.subtitle}</p>

              <div class="card" style="margin-bottom:24px;padding:18px">
                <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center">
                  <input
                    id="kln-dest-search"
                    type="search"
                    value="\${state.destQuery.replace(/"/g, '&quot;')}"
                    oninput="klnUpdateDestQuery(this.value)"
                    placeholder="\${tr.directoryPage.searchPlaceholder}"
                    class="input-field"
                    style="max-width:420px"
                  />
                  <div style="font-size:13px;color:var(--ink-2)">
                    \${tr.directoryPage.showingCount} <strong>\${filtered.length}</strong> \${tr.directoryPage.ofTotal} <strong>\${allUnis.length}</strong> \${tr.directoryPage.partnersLabel}
                  </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
                  <button class="country-chip \${state.destCountry === 'all' ? 'active' : ''}" onclick="klnSetDestCountry('all')">
                    \${tr.directoryPage.allCountries} (\${allUnis.length})
                  </button>
                  \${dests.map(d => \`
                    <button class="country-chip \${state.destCountry === d.code ? 'active' : ''}" onclick="klnSetDestCountry('\${d.code}')">
                      <strong style="text-transform:uppercase;color:var(--teal-ink)">\${d.code}</strong>
                      <span>\${d.name[state.lang]}</span>
                      <span style="font-size:11px;color:var(--ink-3)">(\${d.partnerCount})</span>
                    </button>
                  \`).join('')}
                </div>
              </div>

              <div class="cards-grid">
                \${visible.map(u => {
                  const d = dests.find(x => x.code === u.c);
                  const saved = state.shortlist.some(s => s.name === u.n && s.country === u.c);
                  return \`
                    <article class="card" style="padding:18px">
                      <div>
                        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px">
                          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--teal-ink)">\${d ? d.name[state.lang] : u.c}\${u.city ? ' • ' + u.city : ''}</span>
                          \${u.note ? \`<span class="badge-pill" style="padding:1px 7px;font-size:10px">\${u.note}</span>\` : ''}
                        </div>
                        <h2 style="font-size:15px;font-weight:700;margin-bottom:8px">\${u.n}</h2>
                        <div style="font-size:12px;color:var(--ink-3);margin-bottom:14px">
                          \${tr.destinationsSection.tuitionLabel}: <strong style="color:var(--ink-2)">\${tr.directoryPage.tuitionConsult}</strong>
                        </div>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border)">
                        <button onclick="klnToggleShortlist(\${JSON.stringify(u.n).replace(/"/g, '&quot;')}, '\${u.c}')" style="padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid \${saved?'var(--teal)':'var(--border)'};background:\${saved?'var(--teal-tint)':'var(--bg-subtle)'};color:\${saved?'var(--teal-ink)':'var(--ink-2)'};cursor:pointer">
                          \${saved ? '✓ ' + tr.directoryPage.inShortlistBtn : '+ ' + tr.directoryPage.addShortlistBtn}
                        </button>
                        <button onclick="klnNavigate('/');setTimeout(()=>document.getElementById('konsultasi')?.scrollIntoView({behavior:'smooth'}),80)" style="background:none;border:none;font-size:12px;font-weight:700;color:var(--teal-ink);cursor:pointer">
                          \${tr.directoryPage.tuitionConsult} →
                        </button>
                      </div>
                    </article>
                  \`;
                }).join('')}
              </div>

              \${filtered.length > state.destLimit ? \`
                <div style="text-align:center;margin-top:32px">
                  <button class="btn-secondary" onclick="klnLoadMoreUnis()">
                    \${state.lang === 'id' ? 'Tampilkan Lebih Banyak Universitas' : 'Load More Universities'} (\${filtered.length - state.destLimit})
                  </button>
                </div>
              \` : ''}
            </div>
          </section>
        \`;
      }

      function renderFaq() {
        const tr = t();
        const faqs = window.__KLN_FAQS__;
        const q = state.faqQuery.trim().toLowerCase();
        const filtered = faqs.filter(f => {
          const matchC = state.faqCat === 'all' || f.category === state.faqCat;
          const text = state.lang === 'id' ? f.qi + ' ' + f.ai : f.qe + ' ' + f.ae;
          return matchC && (!q || text.toLowerCase().includes(q));
        });
        const cats = ['all', 'kln', 'fee', 'choose', 'docs', 'aura'];

        return \`
          <section class="section" style="padding-top:40px">
            <div class="container" style="max-width:900px">
              <div class="eyebrow">\${tr.faqPage.eyebrow}</div>
              <h1 class="section-title" style="margin-bottom:10px">\${tr.faqPage.title}</h1>
              <p style="color:var(--ink-2);margin-bottom:24px">\${tr.faqPage.subtitle}</p>

              <div class="card" style="margin-bottom:24px;padding:18px">
                <input
                  type="search"
                  value="\${state.faqQuery.replace(/"/g, '&quot;')}"
                  oninput="klnUpdateFaqQuery(this.value)"
                  placeholder="\${tr.faqPage.searchPlaceholder}"
                  class="input-field"
                />
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                  \${cats.map(c => \`
                    <button class="country-chip \${state.faqCat === c ? 'active' : ''}" onclick="klnSetFaqCat('\${c}')">
                      \${tr.faqPage.categories[c]}
                    </button>
                  \`).join('')}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:12px">
                \${filtered.map((f, idx) => {
                  const open = state.faqOpenIdx === idx;
                  return \`
                    <div class="card" style="padding:18px 22px">
                      <button onclick="klnToggleFaq(\${idx})" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;background:none;border:none;text-align:left;cursor:pointer">
                        <div>
                          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--teal-ink);display:block;margin-bottom:4px">\${tr.faqPage.categories[f.category] || f.category}</span>
                          <span class="font-display" style="font-size:16px;font-weight:700">\${state.lang === 'id' ? f.qi : f.qe}</span>
                        </div>
                        <span style="font-size:18px;font-weight:800;color:var(--teal-ink)">\${open ? '−' : '+'}</span>
                      </button>
                      \${open ? \`
                        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:14px;color:var(--ink-2)">
                          \${state.lang === 'id' ? f.ai : f.ae}
                        </div>
                      \` : ''}
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          </section>
        \`;
      }

      function renderLegal(type) {
        const doc = window.__KLN_LEGAL__[type][state.lang];
        return \`
          <section class="section" style="padding-top:40px">
            <div class="container" style="max-width:820px">
              <span class="badge-pill" style="margin-bottom:12px">\${doc.eyebrow}</span>
              <h1 class="section-title" style="margin-bottom:8px">\${doc.title}</h1>
              <p style="font-size:13px;color:var(--ink-3);margin-bottom:16px">\${doc.updated}</p>
              <p style="color:var(--ink-2);margin-bottom:28px">\${doc.intro}</p>
              <div style="display:flex;flex-direction:column;gap:16px">
                \${doc.sections.map(s => \`
                  <div class="card">
                    <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">\${s.heading}</h2>
                    <p style="font-size:14px;color:var(--ink-2)">\${s.body}</p>
                  </div>
                \`).join('')}
              </div>
            </div>
          </section>
        \`;
      }

      function renderShortlistBar() {
        if (state.shortlist.length === 0) return '';
        const tr = t();
        return \`
          <div class="shortlist-bar">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="badge-pill">\${state.shortlist.length} \${tr.directoryPage.shortlistTitle}</span>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                \${state.shortlist.slice(0, 3).map(u => \`
                  <span style="font-size:12px;padding:3px 8px;border-radius:6px;background:var(--bg-subtle);border:1px solid var(--border)">\${u.name}</span>
                \`).join('')}
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button onclick="klnClearShortlist()" style="background:none;border:none;font-size:12px;color:var(--ink-3);cursor:pointer">\${tr.directoryPage.shortlistClear}</button>
              <button class="btn-primary" style="padding:8px 14px;font-size:12px" onclick="klnNavigate('/');setTimeout(()=>document.getElementById('konsultasi')?.scrollIntoView({behavior:'smooth'}),80)">
                \${tr.directoryPage.shortlistConsultCta} →
              </button>
            </div>
          </div>
        \`;
      }

      window.klnUpdateDestQuery = function(v) { state.destQuery = v; state.destLimit = 48; render(); document.getElementById('kln-dest-search')?.focus(); };
      window.klnSetDestCountry = function(c) { state.destCountry = c; state.destLimit = 48; render(); };
      window.klnLoadMoreUnis = function() { state.destLimit += 60; render(); };
      window.klnUpdateFaqQuery = function(v) { state.faqQuery = v; render(); };
      window.klnSetFaqCat = function(c) { state.faqCat = c; render(); };
      window.klnToggleFaq = function(idx) { state.faqOpenIdx = state.faqOpenIdx === idx ? -1 : idx; render(); };

      window.klnAskAuraIdx = function(idx) {
        const prompt = t().aura.quickPrompts[idx];
        if (prompt) sendAuraMessage(prompt);
      };

      window.klnSubmitAura = function(e) {
        e.preventDefault();
        const inp = document.getElementById('kln-aura-input');
        if (!inp || !inp.value.trim()) return;
        sendAuraMessage(inp.value.trim());
      };

      async function sendAuraMessage(text) {
        state.auraMessages.push({ role: 'user', text });
        render();
        try {
          const res = await fetch('/api/aura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, lang: state.lang })
          });
          if (res.ok) {
            const data = await res.json();
            state.auraMessages.push({ role: 'aura', text: data.reply });
            render();
            const sc = document.getElementById('kln-chat-scroll');
            if (sc) sc.scrollTop = sc.scrollHeight;
            return;
          }
        } catch (_) {}
        const reply = state.lang === 'id'
          ? 'Layanan konsultasi KLN sepenuhnya gratis untuk pelajar (Rp 0). Untuk rincian biaya kuliah spesifik tiap kampus: Hubungi konselor. Sebutkan jenjang studi (S1/S2/Pathway), bidang minat, dan negara tujuanmu agar kami dapat membantu memetakan kampus mitra.'
          : 'KLN consultation services are completely free for students. For specific university tuition figures: Contact an advisor. Share your target study level, field of interest, and preferred countries so we can help map out partner campuses.';
        state.auraMessages.push({ role: 'aura', text: reply });
        render();
      }

      window.klnSubmitConsultation = async function(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
          name: fd.get('name'),
          whatsapp: fd.get('whatsapp'),
          email: fd.get('email'),
          level: fd.get('level'),
          country: fd.get('country'),
          intake: fd.get('intake'),
          notes: fd.get('notes'),
          shortlist: state.shortlist.map(u => u.name),
          lang: state.lang
        };
        const lines = [
          'Halo Konselor KLN, saya ingin menjadwalkan konsultasi studi luar negeri gratis:',
          '• Nama: ' + payload.name,
          '• WhatsApp: ' + payload.whatsapp,
          '• Jenjang: ' + payload.level,
          '• Negara Tujuan: ' + payload.country,
          '• Target Mulai: ' + payload.intake,
          payload.shortlist.length ? '• Shortlist Kampus: ' + payload.shortlist.join(', ') : '',
          payload.notes ? '• Catatan: ' + payload.notes : ''
        ].filter(Boolean).join('\\n');
        const waUrl = 'https://wa.me/16026005671?text=' + encodeURIComponent(lines);
        state.formSuccess = waUrl;
        render();
      };

      let globeAnimId = null;
      function initGlobe() {
        if (globeAnimId) cancelAnimationFrame(globeAnimId);
        const canvas = document.getElementById('kln-globe-canvas');
        const labelsHost = document.getElementById('kln-globe-labels');
        const toggleBtn = document.getElementById('kln-globe-toggle');
        if (!canvas || !labelsHost) return;
        const ctx = canvas.getContext('2d');
        const topo = window.__KLN_TOPO_LAND__;
        if (!topo || !topo.arcs) return;

        function decodeRings(topology) {
          const tf = topology.transform;
          const decodedArcs = topology.arcs.map(arc => {
            let x = 0, y = 0;
            return arc.map(pt => {
              x += pt[0]; y += pt[1];
              return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]];
            });
          });
          const rings = [];
          const geom = topology.objects.land.geometries[0];
          const polys = geom.type === 'MultiPolygon' ? geom.arcs : [geom.arcs];
          polys.forEach(poly => {
            poly.forEach((ringIndices, rIdx) => {
              if (rIdx > 0) return;
              const coords = [];
              ringIndices.forEach(idx => {
                const arc = idx >= 0 ? decodedArcs[idx] : decodedArcs[~idx].slice().reverse();
                for (let i = 0; i < arc.length; i++) coords.push(arc[i]);
              });
              if (coords.length >= 4) rings.push(coords);
            });
          });
          return rings;
        }

        const landRings = decodeRings(topo);
        const DEG = Math.PI / 180;
        const ORIGIN = [115, -2];
        const DESTS = [
          { code: 'AU', name: 'Australia', coord: [151.2, -33.8], color: '#2E9E91' },
          { code: 'UK', name: 'UK', coord: [-0.1, 51.5], color: '#2E9E91' },
          { code: 'US', name: 'USA', coord: [-74.0, 40.7], color: '#D9822B' },
          { code: 'CA', name: 'Canada', coord: [-79.3, 43.6], color: '#2E9E91' },
          { code: 'NZ', name: 'New Zealand', coord: [174.7, -36.8], color: '#2E9E91' },
          { code: 'IE', name: 'Ireland', coord: [-6.2, 53.3], color: '#2E9E91' },
          { code: 'MY', name: 'Malaysia', coord: [101.6, 3.1], color: '#D9822B' }
        ];

        labelsHost.innerHTML = '';
        const badges = DESTS.map(d => {
          const el = document.createElement('div');
          el.style.cssText = 'position:absolute;left:0;top:0;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;background:var(--bg-elev);border:1px solid var(--border);box-shadow:var(--shadow-sm);white-space:nowrap;transition:opacity 0.15s';
          el.textContent = d.name;
          labelsHost.appendChild(el);
          return { d, el };
        });

        let rotLon = -115;
        const rotLat = 12;

        function project(lon, lat, cx, cy, R) {
          const lam = (lon + rotLon) * DEG;
          const phi = lat * DEG;
          const phi0 = rotLat * DEG;
          const cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam);
          const x = R * Math.cos(phi) * Math.sin(lam);
          const y = R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam));
          return { x: cx + x, y: cy - y, visible: cosc > 0, z: cosc };
        }

        function slerp(a, b, t) {
          const lon1 = a[0] * DEG, lat1 = a[1] * DEG;
          const lon2 = b[0] * DEG, lat2 = b[1] * DEG;
          const x1 = Math.cos(lat1) * Math.cos(lon1), y1 = Math.cos(lat1) * Math.sin(lon1), z1 = Math.sin(lat1);
          const x2 = Math.cos(lat2) * Math.cos(lon2), y2 = Math.cos(lat2) * Math.sin(lon2), z2 = Math.sin(lat2);
          const dot = Math.max(-1, Math.min(1, x1*x2 + y1*y2 + z1*z2));
          const omega = Math.acos(dot);
          if (omega < 1e-5) return a;
          const so = Math.sin(omega);
          const f1 = Math.sin((1 - t) * omega) / so;
          const f2 = Math.sin(t * omega) / so;
          const x = f1 * x1 + f2 * x2, y = f1 * y1 + f2 * y2, z = f1 * z1 + f2 * z2;
          return [Math.atan2(y, x) / DEG, Math.asin(Math.max(-1, Math.min(1, z))) / DEG];
        }

        const flights = DESTS.map((d, i) => ({ dest: d, t: (i * 0.16) % 1, speed: 0.0032 }));

        if (toggleBtn) {
          toggleBtn.onclick = () => {
            state.globePaused = !state.globePaused;
            toggleBtn.textContent = state.globePaused ? t().hero.playGlobe : t().hero.pauseGlobe;
          };
        }

        function frame() {
          const rect = canvas.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const W = rect.width || 440, H = rect.height || 440;
          if (canvas.width !== Math.round(W * dpr)) {
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);

          const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.41;
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

          if (!state.globePaused) rotLon -= 0.11;

          const grad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, R*0.1, cx, cy, R);
          grad.addColorStop(0, isDark ? '#182E4C' : '#F2F6FA');
          grad.addColorStop(1, isDark ? '#0D1C31' : '#DFEAEF');
          ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
          ctx.lineWidth = 1.4; ctx.strokeStyle = isDark ? 'rgba(59,180,166,0.35)' : 'rgba(27,63,107,0.18)'; ctx.stroke();

          ctx.save();
          ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2); ctx.clip();
          ctx.fillStyle = isDark ? 'rgba(46,158,145,0.28)' : 'rgba(27,63,107,0.15)';
          landRings.forEach(ring => {
            let started = false;
            ctx.beginPath();
            for (let i = 0; i < ring.length; i += 2) {
              const p = project(ring[i][0], ring[i][1], cx, cy, R);
              if (p.visible) {
                if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                else ctx.lineTo(p.x, p.y);
              } else started = false;
            }
            ctx.closePath(); ctx.fill();
          });
          ctx.restore();

          flights.forEach(f => {
            if (!state.globePaused) f.t = (f.t + f.speed) % 1;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i <= 32; i++) {
              const u = (i / 32) * f.t;
              const ll = slerp(ORIGIN, f.dest.coord, u);
              const p = project(ll[0], ll[1], cx, cy, R);
              if (p.visible) {
                const lift = 1 + Math.sin((i / 32) * Math.PI) * 0.08;
                const lx = cx + (p.x - cx) * lift, ly = cy + (p.y - cy) * lift;
                if (!started) { ctx.moveTo(lx, ly); started = true; }
                else ctx.lineTo(lx, ly);
              } else started = false;
            }
            ctx.strokeStyle = f.dest.color; ctx.lineWidth = 1.8; ctx.stroke();
          });

          const idPos = project(ORIGIN[0], ORIGIN[1], cx, cy, R);
          if (idPos.visible) {
            ctx.beginPath(); ctx.arc(idPos.x, idPos.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#D9822B'; ctx.fill();
          }

          badges.forEach(({ d, el }) => {
            const p = project(d.coord[0], d.coord[1], cx, cy, R);
            if (p.visible && p.z > 0.15) {
              el.style.opacity = '1';
              el.style.transform = \`translate3d(\${Math.round(p.x + 8)}px, \${Math.round(p.y - 12)}px, 0)\`;
            } else {
              el.style.opacity = '0';
            }
          });

          globeAnimId = requestAnimationFrame(frame);
        }

        globeAnimId = requestAnimationFrame(frame);
      }

      function render() {
        const app = document.getElementById('app');
        if (!app) return;
        let mainHtml = '';
        if (state.route.includes('dest')) mainHtml = renderDestinasi();
        else if (state.route.includes('faq')) mainHtml = renderFaq();
        else if (state.route.includes('priv')) mainHtml = renderLegal('privacy');
        else if (state.route.includes('syarat') || state.route.includes('terms')) mainHtml = renderLegal('terms');
        else mainHtml = renderHome();

        app.innerHTML = renderNavbar() + '<main id="main">' + mainHtml + '</main>' + renderFooter() + renderShortlistBar();
        if (state.route === '/' || state.route === '/en') {
          initGlobe();
        }
      }

      render();
    })();
  </script>
</body>
</html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/data/') || pathname.startsWith('/logos/')) {
      const filePath = path.join(__dirname, 'public', pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.json' ? 'application/json' : 'text/plain';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    if (pathname === '/api/aura' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const reply = generateAuraReply(parsed.message, parsed.lang || 'id');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (pathname === '/api/consultation' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const waUrl = `https://wa.me/16026005671?text=${encodeURIComponent('Halo Konselor KLN, saya ' + (parsed.name || '') + ' ingin konsultasi studi luar negeri.')}`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, whatsappUrl: waUrl }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    const html = buildStandaloneHtml(pathname);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`KLN — Kampus Luar Negeri server listening on http://localhost:${PORT}`);
  });
}
