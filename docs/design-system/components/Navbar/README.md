Bilah navigasi atas situs KLN: logo di kiri, empat tautan utama, dan satu tombol `primary` untuk konsultasi.

**Yang perlu disediakan konsumen:** `html[data-theme]` sesuai tema (agar logo navy atau putih yang tampil), tautan navigasi, dan tujuan tombol konsultasi. Tandai halaman aktif dengan `aria-current="page"`.

- Logo selalu berada di kiri, tinggi 40px, dan menaut ke beranda. Dua `img` (navy dan putih) dipasang berdampingan; kelas `rt-logo-light` dan `rt-logo-dark` menampilkan salah satunya sesuai tema.
- Maksimal empat tautan utama. Tautan aktif memakai `brand` dengan garis bawah; hover memakai garis bawah `sun`.
- Pada lebar di bawah 720px tautan dan tombol disembunyikan dan digantikan tombol menu 44px; konsumen menyediakan panel menunya.
- Pemilih bahasa `ID | EN` berada di sisi kanan, setelah tombol konsultasi, dan tetap tampil pada lebar kecil (di sebelah tombol menu). Bahasa aktif memakai `aria-current="true"`; setiap pilihan membawa atribut `lang` dan `hreflang`, dan menaut ke halaman yang sama dalam bahasa lain. Bahasa Indonesia adalah bawaan.
- Latar `surface-raised` dengan garis bawah `line`; jangan memberi bayangan.
