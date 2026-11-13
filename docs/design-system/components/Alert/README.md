Pesan satu blok untuk informasi, keberhasilan, peringatan, dan galat.

**Yang perlu disediakan konsumen:** jenis (`info`, `success`, `warning`, `danger`), judul satu baris, dan satu atau dua kalimat penjelasan dengan langkah berikutnya. Gunakan `role="status"` untuk pesan biasa dan `role="alert"` untuk galat yang menghentikan alur.

- Setiap jenis membawa ikon dan judul sehingga artinya tidak bergantung pada warna. Hijau dan merah dibedakan juga oleh ikon dan kata.
- Latar memakai token `*-soft`, teks tetap `ink`, ikon memakai `*-ink` atau `danger`.
- Tidak ada garis tepi berwarna di satu sisi; blok tint penuh sudah cukup.
- Galat menjelaskan apa yang salah dan cara memperbaikinya, tanpa permintaan maaf berlebihan.
