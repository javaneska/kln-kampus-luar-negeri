KLN (Kampus Luar Negeri) adalah merek layanan studi luar negeri di bawah GlobalBridger.ID. Sistem ini dipakai untuk situs KLN, fitur chat Aura (Asisten Utama Rencana Edukasi), materi konsultasi, dan dokumen pendamping. Bahasa utama adalah Bahasa Indonesia; bahasa Inggris tersedia sebagai pilihan. Nama token ditulis dalam huruf kecil dengan tanda hubung dan selalu dirujuk dengan nama, bukan nilai heksadesimal.

## Prinsip

- Terang, terbuka, dan tertata, seperti ruang belajar modern: permukaan putih kebiruan, perabot berwarna biru, aksen kuning dan oranye, tanaman hijau.
- Aspiratif tetapi membumi. Tunjukkan langkah dan hasil yang bisa diverifikasi, bukan janji.
- Satu hal menonjol per layar. Biru memimpin, kuning menandai satu sorotan, sisanya tenang.
- Dapat dibaca lebih dulu daripada dihias. Kontras teks minimal 4.5:1 di tema terang dan gelap.

## Content fundamentals

- Tulis dalam Bahasa Indonesia yang jelas dan hangat. Gunakan "kamu" untuk calon mahasiswa dan "Anda" untuk orang tua, sekolah, dan institusi. Jangan mencampur keduanya dalam satu halaman.
- Sentence case untuk judul, tombol, dan label. Huruf kapital hanya pada `eyebrow`.
- Tanpa emoji dan tanpa tanda seru berlapis. Hindari klaim mutlak seperti "pasti diterima" atau "terbaik".
- Tombol berupa kata kerja dengan hasil yang jelas: "Jadwalkan konsultasi", "Lihat program", "Unggah dokumen".
- Tagline resmi: "Satu rencana, banyak kampus dunia." Tulis persis seperti itu, dengan titik di akhir dan tanpa tanda seru. Letakkan di dekat logo, bukan di dalam logo. Sebut jumlah kampus mitra hanya bila sudah diverifikasi.
- Contoh nada: "Mulai dari satu percakapan. Kami bantu menyusun rencana studimu langkah demi langkah."
- Informasi biaya, syarat, dan tenggat yang belum diverifikasi ditulis sebagai "Hubungi konselor", bukan angka perkiraan.
- Pada footer, dokumen formal, dan deck, sebut "KLN by GlobalBridger.ID" dan atribusi induk Talenta Nusantara Advisory (TNA Group).

## Bahasa (situs dua bahasa)

Situs KLN tersedia dalam Bahasa Indonesia dan bahasa Inggris. Bahasa Indonesia adalah bawaan; bahasa Inggris dipilih lewat pemilih `ID | EN` pada `Navbar`.

- Setiap halaman, termasuk formulir, Aura, Kebijakan Privasi, dan syarat penggunaan, tersedia di kedua bahasa dengan isi setara. Jangan menampilkan teks campuran dalam satu halaman, kecuali nama program, kampus, dan istilah resmi.
- Pasang `lang="id"` atau `lang="en"` pada elemen `html`, dan `hreflang` pada tautan pemilih bahasa. Alamat tiap bahasa dibedakan, misalnya `/` untuk Indonesia dan `/en/` untuk Inggris. Ingat pilihan pengguna untuk kunjungan berikutnya; bila bahasa dipilih otomatis dari peramban, pemilih bahasa harus tetap terlihat.
- Nada bahasa Inggris sama dengan bahasa Indonesia: jelas, hangat, sentence case, tanpa emoji. Gunakan "you" untuk semua pembaca; sapaan "kamu" dan "Anda" hanya berlaku di versi Indonesia. Biaya dan tenggat yang belum diverifikasi ditulis "Contact an advisor".
- Nama merek tidak diterjemahkan: "KLN" dan "Aura". Kepanjangan "Kampus Luar Negeri" tetap dicantumkan; pada versi Inggris dapat ditambah penjelasan "(Overseas Campus)" saat pertama kali muncul.
- Tagline resmi hanya yang berbahasa Indonesia: "Satu rencana, banyak kampus dunia." Terjemahan Inggris sementara: "One plan, campuses around the world." (disetujui sementara oleh pemilik merek; tinjau kembali sebelum peluncuran). Tulis persis seperti itu, dengan titik di akhir.
- Istilah peran: "konselor" di versi Indonesia dan "advisor" di versi Inggris (keputusan pemilik merek). Gunakan satu istilah itu di seluruh halaman, formulir, Aura, dan dokumen; jangan bergantian dengan "penasihat", "consultant", atau "counselor". Hindari kesan konseling psikologis dengan menjelaskan perannya, misalnya "membantu menyusun rencana studi".
- Aura menjawab dalam bahasa yang sedang dipakai pengguna dan beralih bila pengguna menulis dalam bahasa lain.
- Beri ruang untuk perbedaan panjang teks antarbahasa: tombol dan label tidak boleh dipatok lebarnya, dan judul hero harus tetap rapi bila lebih panjang atau lebih pendek.
- Tulis tanggal dengan nama bulan di kedua bahasa, misalnya "7 November 2026" dan "November 7, 2026", agar tidak ambigu antara urutan hari-bulan dan bulan-hari.

## Visual foundations

**Warna.** Halaman memakai `surface-100`, kartu dan input memakai `surface-raised`, area cekung memakai `surface-sunken`. Teks utama `ink`, teks sekunder `ink-muted`.
- `brand` (biru royal) untuk identitas, tombol primer, tautan, dan langkah aktif. Teks di atasnya `on-brand`; hover memakai `brand-hover`.
- `sun` (kuning) untuk satu CTA aksen per layar atau satu sorotan; teks di atasnya `on-sun`.
- `ember` (oranye) untuk tenggat dan intake; teks di atasnya `on-ember`.
- `leaf` (hijau) untuk progres dan keberhasilan; teks di atasnya `on-leaf`.
- `sky` (biru langit) untuk ilustrasi, grafik, dan informasi.
- Teks berwarna di atas latar tint memakai pasangan `brand-ink` pada `brand-soft`, `sky-ink` pada `sky-soft`, `sun-ink` pada `sun-soft`, `ember-ink` pada `ember-soft`, `leaf-ink` pada `leaf-soft`. Jangan memakai `sun`, `ember`, atau `sky` sebagai warna teks.
- Pembeda status tidak boleh hanya warna: sertakan kata atau ikon. Hijau dan merah dibedakan juga oleh tingkat terang dan ikon.
- Tema gelap memakai navy dalam (`surface-100`) dengan `brand` yang dicerahkan; teks di atas fill terang memakai token `on-*`, bukan putih.

**Tipografi.** Judul dan hero memakai `display-xl`, `display-lg`, `heading-lg` (Montserrat ExtraBold 800, berkarakter geometris seperti huruf pada logo; jangan dimiringkan dan jangan dipakai untuk teks isi). Heading kecil, isi, label, dan keterangan memakai `heading-md` sampai `caption` (Plus Jakarta Sans, rancangan Indonesia dengan keterbacaan baik untuk Bahasa Indonesia). Panjang baris isi maksimal sekitar 65 karakter. Gunakan `eyebrow` huruf kapital untuk penanda bagian.

**Spasi dan bentuk.** Skala `space-1` sampai `space-8` (4, 8, 12, 16, 24, 32, 48, 72). Padding kartu `space-5`; gutter layar kecil `space-4`. Sudut `radius-md` untuk tombol, input, dan alert; `radius-lg` untuk kartu; `radius-xl` untuk blok hero; `radius-pill` untuk badge, chip, dan penanda langkah.

**Kedalaman.** Utamakan tepi `line` dan perbedaan permukaan. `shadow-sm` untuk kartu diam, `shadow-md` untuk hover, menu, dan dialog. Tidak ada gradien dekoratif.

**Motif.** Busur horizon: tiga setengah lingkaran konsentris yang menggambarkan matahari terbit di atas cakrawala, merujuk pada perjalanan menuju kampus di luar negeri. Digambar dengan warna `surface-100` di atas blok warna; dipakai pada kartu tujuan, cover, dan penanda bagian. Satu motif per blok, jangan diulang menjadi pola penuh.

**Fokus dan interaksi.** Semua kontrol interaktif memakai cincin `focus` 3px dengan offset 2px, solid, kontras minimal 3:1 pada setiap permukaan. Target sentuh minimal 44px. Transisi singkat (150ms) pada warna latar; hormati `prefers-reduced-motion`.

**Citra.** Foto ruang belajar yang terang dan alami, mahasiswa nyata dengan izin tertulis, dan kampus tujuan. Hindari foto stok generik yang terasa korporat dan jangan memakai bendera sebagai pengganti ilustrasi negara.

## Iconography

**Logo.** Logo KLN adalah wordmark huruf kapital tebal dengan tulisan "KAMPUS LUAR NEGERI" di bawahnya (`assets/Logos/`). Pakai `kln-logo-navy.svg` (cadangan PNG tersedia) di atas `surface-100`, `surface-raised`, `brand-soft`, dan warna terang lain; pakai `kln-logo-white.svg` di atas `brand`, navy gelap, dan tema gelap. Jangan mewarnai ulang, memiringkan, memberi bayangan, atau menaruhnya di atas foto yang ramai. Beri ruang bebas minimal setengah tinggi huruf K di sekelilingnya (usulan, belum ditetapkan pemilik merek) dan jangan menampilkannya lebih kecil dari lebar 120px. Jangan menggambar ulang atau menyusun ulang huruf. Pratinjau ada pada komponen `Logo`.

**Ikon.** Belum ada set ikon yang diberikan. Untuk ikon, gunakan garis polos satu warna dengan sudut membulat, tebal 1.75 sampai 2px pada kanvas 24px, mewarisi `currentColor` (misalnya gaya Lucide). Ikon penjelas status selalu berdampingan dengan teks. Jangan menggunakan emoji sebagai ikon.

## Komponen

`Logo`, `Button`, `TextField`, `Badge`, `DestinationCard`, `Alert`, `StepTracker`, `ChatBubble`, `Navbar`, `Hero`, `Footer`, `ConsultationForm`, `ChatWindow`. Muat `tokens.css` lebih dulu, kemudian `components/bundle.css`, dan gunakan kelas berawalan `rt-`. Panduan tiap komponen ada pada `components/<Nama>/README.md`.
