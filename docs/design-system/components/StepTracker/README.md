Penunjuk lima langkah layanan KLN, dari konsultasi sampai keberangkatan. Urutan di sini adalah informasi yang sebenarnya, sehingga angka memang dipakai.

**Yang perlu disediakan konsumen:** daftar `ol` berisi lima `li`, masing-masing dengan nama langkah dan keadaan (`done`, `current`, `todo`). Tandai langkah aktif dengan `aria-current="step"`.

- `done` memakai `leaf` dengan tanda centang, `current` memakai `brand`, `todo` memakai `surface-sunken` dengan tepi `line-strong`. Keadaan juga ditulis sebagai kata, tidak hanya warna.
- Pada lebar di bawah 560px kolom berubah menjadi daftar tegak.
- Nama langkah maksimal tiga kata. Jika layanan berubah jumlahnya, perbarui `repeat(5, ...)` di `bundle.css`.
