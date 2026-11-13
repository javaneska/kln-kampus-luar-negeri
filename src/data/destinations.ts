import { CountryCode, UNIS_BY_COUNTRY, UniversityTuple } from "./unis";

export type StudyLevel = "s1" | "s2" | "s3";
export type BrandTone = "brand" | "ember" | "sky" | "sun" | "leaf";

export interface DestinationInfo {
  key: CountryCode;
  tone: BrandTone;
  levels: StudyLevel[];
  name: {
    id: string;
    en: string;
  };
  intake: {
    id: string;
    en: string;
  };
  language: {
    id: string;
    en: string;
  };
  considerations: {
    id: string[];
    en: string[];
  };
  universities: UniversityTuple[];
}

export const DESTINATIONS: DestinationInfo[] = [
  {
    key: "us",
    tone: "brand",
    levels: ["s1", "s2", "s3"],
    name: { id: "Amerika Serikat", en: "United States" },
    intake: { id: "Musim gugur dan semi", en: "Fall and spring" },
    language: { id: "Inggris", en: "English" },
    considerations: {
      id: [
        "Banyak kampus meminta bukti kemampuan bahasa Inggris. Sebagian juga menimbang tes seperti SAT, ACT, GRE, atau GMAT, dan kebijakannya berbeda tiap kampus.",
        "Di banyak kampus, mahasiswa sarjana dapat menentukan jurusan setelah menjalani tahun-tahun awal, sehingga ada ruang menjajaki minat.",
        "Biaya dan peluang beasiswa sangat beragam antar kampus. Bandingkan per program.",
      ],
      en: [
        "Many universities ask for proof of English. Some also weigh tests such as the SAT, ACT, GRE, or GMAT, and policies differ by university.",
        "At many universities, undergraduates can choose a major after the early years, which leaves room to explore interests.",
        "Costs and scholarship opportunities vary widely between universities. Compare by program.",
      ],
    },
    universities: UNIS_BY_COUNTRY.us,
  },
  {
    key: "ca",
    tone: "ember",
    levels: ["s1", "s2", "s3"],
    name: { id: "Kanada", en: "Canada" },
    intake: { id: "September, Januari, dan Mei", en: "September, January, and May" },
    language: {
      id: "Inggris; sebagian program di Quebec berbahasa Prancis",
      en: "English; some programs in Quebec are taught in French",
    },
    considerations: {
      id: [
        "Pilihan institusi mencakup universitas, kolese, dan politeknik. Cek jenis institusi dan jenis kredensial yang diberikan tiap program.",
        "Ketentuan dapat berbeda antarprovinsi. Konselor memeriksa ketentuan terbaru sebelum kamu memutuskan.",
        "Jadwal masuk lebih dari satu kali setahun pada banyak program memberi fleksibilitas waktu mulai.",
      ],
      en: [
        "Options include universities, colleges, and polytechnics. Check the type of institution and the credential each program awards.",
        "Rules can differ between provinces. An advisor checks the latest before you decide.",
        "More than one intake a year on many programs gives flexibility in when to start.",
      ],
    },
    universities: UNIS_BY_COUNTRY.ca,
  },
  {
    key: "uk",
    tone: "sky",
    levels: ["s1", "s2"],
    name: { id: "Inggris", en: "United Kingdom" },
    intake: { id: "September dan Januari", en: "September and January" },
    language: { id: "Inggris", en: "English" },
    considerations: {
      id: [
        "Program sarjana dan magister umumnya lebih singkat dibanding sistem lain, sehingga perlu dicek lamanya per program.",
        "Pendaftaran sarjana umumnya melalui satu sistem terpusat dengan tenggat yang ketat.",
        "Pernyataan pribadi dan referensi sering berperan penting. Siapkan jauh hari.",
      ],
      en: [
        "Bachelor’s and master’s programs are generally shorter than in other systems, so check the length of each program.",
        "Undergraduate applications generally go through one central system with firm deadlines.",
        "The personal statement and references often matter a great deal. Prepare well ahead.",
      ],
    },
    universities: UNIS_BY_COUNTRY.uk,
  },
  {
    key: "au",
    tone: "sun",
    levels: ["s1", "s2"],
    name: { id: "Australia", en: "Australia" },
    intake: { id: "Februari dan Juli", en: "February and July" },
    language: { id: "Inggris", en: "English" },
    considerations: {
      id: [
        "Program berbahasa Inggris, dan bukti kemampuan bahasa umumnya diperlukan.",
        "Aturan visa pelajar dan ketentuan terkait dapat berubah. Konselor memeriksa ketentuan terbaru sebelum kamu memutuskan.",
        "Jadwal masuk lebih dari satu kali setahun memberi fleksibilitas waktu mulai.",
      ],
      en: [
        "English-taught programs, and proof of English is generally needed.",
        "Student visa rules and related conditions can change. An advisor checks the latest before you decide.",
        "More than one intake a year gives flexibility in when to start.",
      ],
    },
    universities: UNIS_BY_COUNTRY.au,
  },
  {
    key: "nz",
    tone: "leaf",
    levels: ["s1", "s2"],
    name: { id: "Selandia Baru", en: "New Zealand" },
    intake: { id: "Februari dan Juli", en: "February and July" },
    language: { id: "Inggris", en: "English" },
    considerations: {
      id: [
        "Daftar mencakup universitas serta institusi vokasi dan kreatif. Cek jenis institusi dan pengakuan program yang kamu minati.",
        "Banyak program berorientasi praktik, sehingga cocok bila kamu menimbang jalur yang dekat dengan dunia kerja.",
        "Biaya hidup dan peluang beasiswa dibandingkan per kota dan per program.",
      ],
      en: [
        "The list includes universities as well as vocational and creative institutions. Check the type of institution and the recognition of the program you want.",
        "Many programs are practice-oriented, which suits you if you are weighing a path close to the workplace.",
        "Living costs and scholarship opportunities are compared by city and by program.",
      ],
    },
    universities: UNIS_BY_COUNTRY.nz,
  },
  {
    key: "ie",
    tone: "brand",
    levels: ["s1", "s2"],
    name: { id: "Irlandia", en: "Ireland" },
    intake: { id: "September dan Januari", en: "September and January" },
    language: { id: "Inggris", en: "English" },
    considerations: {
      id: [
        "Banyak institusi berada di kota besar, sehingga lokasi memengaruhi biaya hidup dan ketersediaan tempat tinggal. Rencanakan lebih awal.",
        "Daftar mencakup universitas, institut teknologi, dan kolese khusus. Cek jenis institusi dan bidang unggulannya.",
        "Syarat bahasa dan berkas mengikuti program. Konselor memeriksa ketentuan terbaru.",
      ],
      en: [
        "Many institutions are in larger cities, so location affects living costs and housing availability. Plan early.",
        "The list includes universities, institutes of technology, and specialist colleges. Check the type of institution and its areas of strength.",
        "Language and document requirements follow the program. An advisor checks the latest.",
      ],
    },
    universities: UNIS_BY_COUNTRY.ie,
  },
  {
    key: "my",
    tone: "ember",
    levels: ["s1", "s2", "s3"],
    name: { id: "Malaysia", en: "Malaysia" },
    intake: { id: "Beberapa kali setahun", en: "Several times a year" },
    language: {
      id: "Inggris; sebagian program berbahasa Melayu",
      en: "English; some programs in Malay",
    },
    considerations: {
      id: [
        "Sebagian program bekerja sama dengan kampus di negara lain. Cek di mana gelar diberikan dan apakah perlu penyetaraan ijazah di Indonesia.",
        "Dekat dengan Indonesia, sehingga perjalanan pulang relatif mudah.",
        "Jadwal masuk sering lebih dari sekali setahun. Cek jadwal tiap program.",
      ],
      en: [
        "Some programs are run jointly with universities in other countries. Check where the degree is awarded and whether degree equivalency is needed in Indonesia.",
        "Close to Indonesia, which makes trips home relatively easy.",
        "Intakes are often held more than once a year. Check each program’s schedule.",
      ],
    },
    universities: UNIS_BY_COUNTRY.my,
  },
];
