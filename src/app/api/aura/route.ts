import { NextRequest, NextResponse } from "next/server";
import { DESTINATIONS } from "@/data/destinations";

/**
 * Aura (Asisten Utama Rencana Edukasi) API Route
 * Implements the official KLN Aura System Prompt (ID & EN):
 * - Warm, polite, clear, concise, no emojis, no outcome guarantees
 * - Uses strictly "konselor" in Indonesian and "advisor" in English
 * - Never quotes tuition/living cost numbers -> refers to konselor/advisor
 * - Explains paid services clearly: GlobalReadiness.ID (GRID) for essay/interview; Aspectama for visa support
 * - Crisis detection protocol: responds with empathy, pauses study discussion, encourages reaching out to trusted person/emergency services
 * - PII protection: warns against sharing passport/financial numbers in chat
 */

const CRISIS_KEYWORDS = [
  "bunuh diri",
  "mengakhiri hidup",
  "putus asa",
  "tidak kuat hidup",
  "menyakiti diri",
  "suicide",
  "kill myself",
  "self harm",
  "end my life",
  "hopeless",
];

const PII_PATTERNS = [
  /\b[A-Z]{1,2}\s?\d{6,8}\b/, // Passport-like pattern
  /\b\d{16}\b/, // NIK / 16-digit card number
];

function isOutsideServiceHoursWIB(): boolean {
  // WIB is UTC+7, Monday-Friday 09:00-17:00
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const wibTime = (utcHours + 7) % 24;
  const wibDayOffset = utcHours + 7 >= 24 ? 1 : 0;
  const wibDay = (now.getUTCDay() + wibDayOffset) % 7; // 0 = Sun, 6 = Sat
  if (wibDay === 0 || wibDay === 6) return true;
  return wibTime < 9 || wibTime >= 17;
}

function generateAuraReply(message: string, requestedLang?: "id" | "en"): {
  reply: string;
  suggestAdvisor: boolean;
  detectedLang: "id" | "en";
} {
  const text = message.trim();
  const lower = text.toLowerCase();

  // Auto-detect language if user writes clearly in English or Indonesian
  const englishSignals = /\b(how|what|when|where|which|can|help|study|university|cost|fee|visa|scholarship|advisor|apply|english)\b/i;
  const indonesianSignals = /\b(apa|bagaimana|kapan|dimana|bantu|kuliah|kampus|biaya|beasiswa|konselor|daftar|dokumen|syarat|negara)\b/i;

  let lang: "id" | "en" = requestedLang === "en" ? "en" : "id";
  if (englishSignals.test(lower) && !indonesianSignals.test(lower)) {
    lang = "en";
  } else if (indonesianSignals.test(lower) && !englishSignals.test(lower)) {
    lang = "id";
  }

  const afterHours = isOutsideServiceHoursWIB();
  const handoffNoteId = afterHours
    ? "Saat ini berada di luar jam layanan konselor (Senin sampai Jumat, 09.00 sampai 17.00 WIB). Silakan isi formulir konsultasi atau kirim pesan ke WhatsApp +1 602 600 5671; pesanmu akan dibalas pada hari kerja berikutnya, paling lambat 1 hari kerja."
    : "Kamu dapat mengisi formulir konsultasi di halaman ini atau menghubungi WhatsApp +1 602 600 5671 (Senin sampai Jumat, 09.00 sampai 17.00 WIB, balasan paling lambat 1 hari kerja).";
  const handoffNoteEn = afterHours
    ? "It is currently outside advisor service hours (Monday to Friday, 09:00 to 17:00 WIB). Please fill in the consultation form or message WhatsApp +1 602 600 5671; your message will be answered on the next business day, within 1 business day at most."
    : "You can fill in the consultation form on this page or message WhatsApp +1 602 600 5671 (Monday to Friday, 09:00 to 17:00 WIB, replies within 1 business day at most).";

  // 1. Crisis protocol check
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      detectedLang: lang,
      suggestAdvisor: false,
      reply:
        lang === "en"
          ? "I am very sorry that you are going through such a heavy moment. Your safety and well-being come first, so let us set the study plan aside for now. Please reach out right away to someone you trust—a parent, family member, or close friend—or contact local emergency or mental health support services in your area. You do not have to carry this alone."
          : "Saya turut prihatin mendengar kamu sedang melewati masa yang sangat berat. Keselamatan dan keadaanmu jauh lebih penting, jadi kita kesampingkan dulu pembahasan rencana studi. Mohon segera hubungi orang yang kamu percaya—orang tua, keluarga, atau sahabat dekat—atau layanan darurat dan pendampingan terdekat di daerahmu. Kamu tidak harus menghadapi ini sendirian.",
    };
  }

  // 2. PII warning check
  if (
    PII_PATTERNS.some((re) => re.test(text)) ||
    lower.includes("nomor paspor") ||
    lower.includes("rekening") ||
    lower.includes("passport number")
  ) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? "For your privacy and security, please do not send passport numbers, national ID numbers, or financial account details in chat. When official documents are needed for an application, a KLN advisor will provide a secure submission channel."
          : "Demi keamanan data pribadimu, mohon jangan mengirim nomor paspor, nomor identitas, atau rincian data keuangan melalui chat. Bila dokumen resmi diperlukan untuk pendaftaran, konselor KLN akan memberikan jalur pengiriman yang aman.",
    };
  }

  // 3. Fees / Tuition / Living Cost / Scholarship guarantee
  if (
    /\b(biaya|harga|uang|tuition|cost|fee|fees|living cost|anggaran|budget|mahal|murah|gratis|free|komisi|commission)\b/i.test(
      lower
    )
  ) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? `KLN’s advisory service is free for students because KLN acts as a sub-agent of PT Aspectama Nusantara and receives commission from partner universities. However, tuition and living costs vary by program and change over time, so we do not quote figures here—please contact an advisor to review current official figures for your target program. ${handoffNoteEn}`
          : `Layanan konsultasi KLN gratis bagi siswa karena KLN adalah sub agen PT Aspectama Nusantara dan memperoleh komisi dari kampus mitra. Namun, biaya kuliah dan biaya hidup berbeda tiap program serta dapat berubah, sehingga saya tidak menyebut angka di sini—silakan hubungi konselor untuk memeriksa rincian resmi terbaru sesuai program tujuanmu. ${handoffNoteId}`,
    };
  }

  // 4. Visa / Immigration
  if (/\b(visa|imigrasi|immigration|izin tinggal|student visa)\b/i.test(lower)) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? `KLN does not provide immigration advice or guarantee visa outcomes. Paid visa support is available through PT Aspectama Nusantara under a direct agreement between you and Aspectama. A KLN advisor can explain the general timeline and refer you to Aspectama if you wish. ${handoffNoteEn}`
          : `KLN tidak memberi nasihat imigrasi maupun menjanjikan persetujuan visa. Bantuan pengurusan visa tersedia sebagai layanan berbayar dari PT Aspectama Nusantara dengan kontrak langsung antara siswa dan Aspectama. Konselor KLN dapat memberikan gambaran umum dan merujukmu ke Aspectama bila diperlukan. ${handoffNoteId}`,
    };
  }

  // 5. Essay review / Interview prep / GRID
  if (/\b(esai|essay|wawancara|interview|grid|globalreadiness|personal statement|motivation letter)\b/i.test(lower)) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? `KLN advisors help you check your general application checklist for free. If you would like intensive essay review or interview preparation, those are paid services offered by GlobalReadiness.ID (GRID), a separate brand under GlobalBridger.ID. Your data is only shared with GRID if you give separate consent. ${handoffNoteEn}`
          : `Konselor KLN membantu memeriksa kelengkapan daftar berkas pendaftaranmu secara gratis. Bila kamu membutuhkan tinjauan esai mendalam atau persiapan wawancara, layanan tambahan berbayar tersebut disediakan oleh GlobalReadiness.ID (GRID), merek terpisah di bawah GlobalBridger.ID. Data pribadimu hanya dibagikan ke GRID dengan persetujuan terpisah. ${handoffNoteId}`,
    };
  }

  // 6. Specific country inquiry
  for (const dest of DESTINATIONS) {
    const matchId = lower.includes(dest.name.id.toLowerCase());
    const matchEn = lower.includes(dest.name.en.toLowerCase());
    const matchAlias =
      (dest.key === "us" && /\b(usa|amerika|united states|as)\b/i.test(lower)) ||
      (dest.key === "uk" && /\b(uk|inggris|britain|london|scotland)\b/i.test(lower)) ||
      (dest.key === "nz" && /\b(nz|new zealand|selandia baru)\b/i.test(lower)) ||
      (dest.key === "au" && /\b(aussie|australia|sydney|melbourne)\b/i.test(lower));

    if (matchId || matchEn || matchAlias) {
      const count = dest.universities.length;
      const sampleUnis = dest.universities
        .slice(0, 4)
        .map((u) => u[0])
        .join(", ");
      const levelsText =
        lang === "en"
          ? dest.levels
              .map((l) => (l === "s1" ? "Bachelor’s" : l === "s2" ? "Master’s" : "Doctorate"))
              .join(", ")
          : dest.levels
              .map((l) => (l === "s1" ? "Sarjana" : l === "s2" ? "Magister" : "Doktor"))
              .join(", ");

      return {
        detectedLang: lang,
        suggestAdvisor: true,
        reply:
          lang === "en"
            ? `For ${dest.name.en}, KLN’s list currently covers ${count} partner institutions (such as ${sampleUnis}) across ${levelsText}. Typical intakes are in ${dest.intake.en}, with instruction in ${dest.language.en}. Key point to consider: ${dest.considerations.en[0]} Would you like a KLN advisor to check specific programs and official requirements for ${dest.name.en}?`
            : `Untuk ${dest.name.id}, daftar KLN saat ini mencakup ${count} institusi mitra (seperti ${sampleUnis}) untuk jenjang ${levelsText}. Jadwal masuk umumnya pada ${dest.intake.id} dengan bahasa pengantar ${dest.language.id}. Hal penting yang perlu dipertimbangkan: ${dest.considerations.id[0]} Apakah kamu ingin konselor KLN membantu mengecek program dan syarat resmi di ${dest.name.id}?`,
      };
    }
  }

  // 7. Documents / Checklist
  if (/\b(dokumen|berkas|document|documents|transkrip|ijazah|ielts|toefl|syarat)\b/i.test(lower)) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? "Usually you will need academic transcripts and diplomas, a valid passport, proof of English proficiency (such as IELTS or TOEFL), and a personal statement or motivation letter. Because exact requirements differ by university and program, tell me your target country and level—or speak with a KLN advisor to confirm the official checklist."
          : "Umumnya berkas yang perlu disiapkan meliputi transkrip nilai atau ijazah, paspor yang masih berlaku, bukti kemampuan bahasa Inggris (seperti IELTS atau TOEFL), serta esai atau surat motivasi. Karena daftar pastinya berbeda di tiap kampus dan program, sebutkan negara serta jenjang yang kamu tuju—atau hubungi konselor KLN untuk memastikan syarat resminya.",
    };
  }

  // 8. Timeline / Intake / When to apply
  if (/\b(kapan|jadwal|intake|deadline|tenggat|mulai|timeline|when|apply)\b/i.test(lower)) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? "Each destination country has its own intake calendar—for example, Fall and Spring in the US, February and July in Australia and New Zealand, and September or January in the UK, Ireland, and Canada. Application deadlines often fall 6 to 9 months before classes begin. Share your target country and level so we can map a timeline, and an advisor will confirm the official dates."
          : "Setiap negara tujuan memiliki kalender intake tersendiri—misalnya musim gugur dan semi di Amerika Serikat, Februari dan Juli di Australia serta Selandia Baru, atau September dan Januari di Inggris, Irlandia, dan Kanada. Tenggat pendaftaran sering jatuh 6 sampai 9 bulan sebelum perkuliahan dimulai. Sebutkan negara dan jenjang tujuanmu agar saya bantu menyusun garis waktunya, lalu konselor akan mengonfirmasi tanggal resminya.",
    };
  }

  // 9. Advisor / Konselor handoff
  if (/\b(konselor|advisor|manusia|human|whatsapp|jadwal|konsultasi|book)\b/i.test(lower)) {
    return {
      detectedLang: lang,
      suggestAdvisor: true,
      reply:
        lang === "en"
          ? `Of course. KLN advisors are ready to help you build your study plan and verify official program details. ${handoffNoteEn}`
          : `Tentu. Konselor KLN siap membantu menyusun rencana studimu dan memastikan rincian resmi program. ${handoffNoteId}`,
    };
  }

  // 10. Default helpful study-plan response
  return {
    detectedLang: lang,
    suggestAdvisor: true,
    reply:
      lang === "en"
        ? "I can help you explore our 7 destination countries (United States, Canada, United Kingdom, Australia, New Zealand, Ireland, and Malaysia), compare study levels (Bachelor’s, Master’s, Doctorate), and prepare your application timeline. Tell me which level and field of study you are aiming for, or ask to speak with a KLN advisor anytime."
        : "Saya dapat membantu kamu menjelajahi 7 negara tujuan KLN (Amerika Serikat, Kanada, Inggris, Australia, Selandia Baru, Irlandia, dan Malaysia), memetakan jenjang studi (Sarjana, Magister, Doktor), serta menyusun garis waktu persiapan berkas. Ceritakan jenjang dan bidang studi yang kamu minati, atau minta terhubung dengan konselor KLN kapan saja.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const lang = body?.lang === "en" ? "en" : "id";

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const result = generateAuraReply(message, lang);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
