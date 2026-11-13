# KLN (Kampus Luar Negeri): Konteks Proyek Frontend

Berkas ini adalah titik masuk. Baca lebih dulu sebelum berkas lain di folder ini.

## 1. Ringkasan
KLN adalah layanan gratis bagi calon mahasiswa Indonesia yang ingin kuliah di luar negeri (sebelumnya bernama "Rantau"). Situs web dwibahasa (Indonesia default, Inggris opsional) dengan asisten AI bernama Aura.

- Tagline resmi: "Satu rencana, banyak kampus dunia."
- Tagline Inggris (sementara): "One plan, campuses around the world."
- Asisten: Aura (Asisten Utama Rencana Edukasi), aktif 24/7
- Domain: kampusluarnegeri.com
- Istilah peran: "konselor" (ID) dan "advisor" (EN). Jangan gunakan istilah lain di antarmuka, formulir, Aura, atau dokumen.

## 2. Kontak resmi
- WhatsApp: +1 602 600 5671 (https://wa.me/16026005671)
- Email: info@kampusluarnegeri.com

## 3. Jam layanan (Opsi A)
- Konselor/advisor: Senin sampai Jumat, 09.00 sampai 17.00 WIB, di luar hari libur nasional Indonesia
- Target balasan: paling lambat 1 hari kerja (WhatsApp, email, formulir)
- Aura: 24/7, dengan pesan serah terima di luar jam layanan
- Admin KLN memantau nomor WhatsApp

## 4. Model bisnis
- KLN adalah sub agen PT Aspectama Nusantara dan memperoleh komisi dari kampus. Gratis bagi siswa.
- KLN dioperasikan oleh PT Talenta Nusantara Advisory (TNA Group).
- Layanan tambahan berbayar (tinjauan esai, persiapan wawancara): GlobalReadiness.ID (GRID), merek terpisah di bawah GlobalBridger.ID. Persetujuan data dibagikan ke GRID bersifat terpisah dan opsional.
- Bantuan visa: layanan berbayar dari Aspectama, kontrak langsung antara siswa dan Aspectama. KLN tidak memberi nasihat imigrasi, hanya merujuk melalui konselor/advisor.
- Biaya per kampus tidak ditampilkan di situs: gunakan "Hubungi konselor" / "Contact an advisor".

## 5. Cakupan data
7 negara: AS, Kanada, Irlandia, Malaysia, Australia, Inggris, Selandia Baru. 527 kampus unik (data/unis_clean.json, format per negara: [nama, kota, catatan]).
Isi deskriptif per negara masih contoh ("Contoh isi") dan perlu diganti konten final.

## 6. Identitas visual
- Judul dan hero: Montserrat ExtraBold 800. Isi: Plus Jakarta Sans.
- Token, komponen, dan aturan: design-system/ (mulai dari design-system/README.md dan tokens.json).
- Logo: design-system/logos/ (versi navy dan putih, SVG).

## 7. Isi folder
- design-system/: README, tokens.json, design-system.json, komponen (README dan preview.html), bundle.css, logo
- prototypes/: index.html (beranda), dest.html (negara tujuan), faq.html (22 pertanyaan). Prototipe HTML tunggal dengan sakelar ID/EN. Gunakan sebagai acuan tata letak dan teks, bukan basis kode produksi.
- data/unis_clean.json
- aura/: prompt sistem Aura (ID dan EN)
- docs/TAUTAN-DOKUMEN.md: tautan dan cara mengekspor PRD, Syarat, Privasi, Panduan Persona

## 8. Status dan hal yang masih terbuka
Semua dokumen hukum berstatus draf.
- Syarat Penggunaan dan Kebijakan Privasi belum ditinjau penasihat hukum.
- Entitas hukum GRID serta syarat, harga, dan pengembaliannya belum ditetapkan.
- Lisensi Aspectama untuk bantuan visa di tiap negara belum diverifikasi.
- Kapasitas admin untuk target 1 hari kerja belum dikonfirmasi.
- URL final halaman hukum belum ditetapkan (usulan: /privasi, /syarat, /en/privacy, /en/terms).
- Teks demo chat Aura (q1 sampai q3 di prototipe) belum diselaraskan penuh dengan panduan persona.
- Nama kampus yang belum pasti: "Mont's St. Mary University", "St. Antonio College", "Boise University", "Centenial University".
- Konfirmasi font logo (Montserrat) belum final.

## 9. Keputusan teknis yang belum diambil (mohon diusulkan dan dikonfirmasi)
- Tumpukan teknologi (usulan awal: Next.js atau Astro, i18n ID/EN)
- Penyedia AI untuk Aura dan protokol krisis/eskalasi
- Tujuan pengiriman formulir konsultasi (email, CRM, atau WhatsApp)
- Alat penjadwalan konsultasi
- Akun pengguna ditunda ke Fase 2
