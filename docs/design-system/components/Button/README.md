Tombol aksi KLN dengan empat varian: `primary` (biru `brand`) untuk aksi utama, `accent` (kuning `sun`) untuk satu CTA sorotan per layar, `secondary` (garis `line-strong`) untuk aksi pendamping, dan `ghost` untuk aksi tersier.

**Yang perlu disediakan konsumen:** teks label dalam sentence case, dan elemen `button` atau `a` dengan kelas `rt-btn rt-btn-<varian>`. Tambahkan `rt-btn-sm` untuk ukuran 36px; ukuran standar 44px memenuhi target sentuh.

- Satu `primary` per kelompok aksi. `accent` dipakai paling banyak sekali per layar, biasanya CTA konsultasi.
- Label berupa kata kerja yang menjelaskan hasil: "Jadwalkan konsultasi", bukan "Klik di sini".
- Fokus keyboard memakai cincin `focus` 3px dengan offset 2px; jangan dimatikan.
- Keadaan nonaktif memakai `surface-sunken` dan `ink-muted`, dan tetap memberi alasan lewat teks bantuan di dekatnya.
- Jangan menaruh `ember` atau `sun` sebagai warna teks tombol; keduanya hanya latar, dengan teks `on-ember` dan `on-sun`.
