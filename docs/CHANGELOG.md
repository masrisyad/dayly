# Changelog

Semua perubahan penting pada Dayly dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).
Aturan kapan menaikkan versi ada di [deploy-dan-rilis.md](deploy-dan-rilis.md#aturan-versi-semantic-versioning).

Kategori: **Ditambahkan**, **Diubah**, **Diperbaiki**, **Dihapus**, **Keamanan**, **Dokumentasi**.

## [Belum dirilis]

### Dokumentasi
- `CLAUDE.md`: commit tidak lagi memakai trailer `Co-Authored-By`, agar hanya pemilik repo yang tercatat sebagai kontributor di GitHub. Riwayat `main` dan tag v1.0.0–v1.2.0 ditulis ulang untuk menghapus trailer tersebut; isi file tidak berubah.

## [1.2.0] - 2026-10-25

### Ditambahkan
- **Bagikan sebagai gambar** di halaman **Harian** dan **Mingguan**. Tombol tujuan: Simpan ke perangkat, WhatsApp Chat (Post 4:5), WhatsApp Status, Instagram Story, dan TikTok (Story 9:16). Gambar diserahkan lewat menu berbagi HP; aplikasi web tidak bisa memposting langsung ke aplikasi tersebut.
- Gambar bertema *daily task* berisi avatar & "Planner {nama}", judul, tanggal/minggu, progres, kartu-kartu bagian, dan watermark Dayly + alamat aplikasi.
- Harian: pilihan isi gambar (bawaan Prioritas, Tugas, Jadwal, Air; Pengingat & Catatan opt-in), diingat di perangkat.
- Pratinjau Story/Post di panel berbagi. Jika browser tidak mendukung menu berbagi, gambar diunduh.

### Diubah
- Warna & ikon label hari Mingguan dipusatkan di `shareContent.ts` agar gambar dan halaman selalu sama.
- Logika unduh file dipindah ke `src/lib/download.ts` (dipakai backup dan berbagi gambar).

### Dokumentasi
- `docs/berbagi-gambar.md` (baru), `docs/README.md`, `docs/arsitektur.md`.
- Panduan bab 10 "Bagikan sebagai gambar", serta tautan di Mingguan, Harian, dan FAQ.

## [1.1.1] - 2026-10-24

### Diperbaiki
- Tombol **Muat ulang** pada banner "Versi baru tersedia" kini selalu berpindah ke versi baru. Sebelumnya, pada sesi pertama setelah situs dibuka/dipasang, versi baru sudah aktif tetapi halaman tidak berganti dan banner tetap muncul. Ditemukan saat memverifikasi deploy v1.1.0.

### Dokumentasi
- `docs/pwa-dan-update.md`: penjelasan reload setelah update dan langkah uji kasus kunjungan pertama.

## [1.1.0] - 2026-10-24

Berdasarkan feedback v1.0.0.

### Diubah
- **Mingguan** sekarang memakai minggu kerja kalender **Senin–Jumat**. Minggu 1 dimulai dari Senin pertama di bulan itu, sehingga satu bulan punya 4–5 minggu. Sabtu & Minggu tidak ditampilkan.
- Progres minggu (halaman Mingguan & kartu minggu di Beranda) hanya menghitung Senin–Jumat + Self Care. % total bulanan tetap mencakup akhir pekan.
- **Beranda** menampilkan 4–5 kartu minggu sesuai bulan, dengan rentang Senin–Jumat (bisa menyeberang ke bulan berikutnya, mis. "30 Nov – 4 Des"). Di tablet, semuanya tampil dalam satu baris.
- **Jadwal** di Harian hanya menampilkan jam **09:00–20:00**. Sekilas Hari Ini di Beranda menampilkan seluruh rentang ini dalam dua kolom.
- Format data: `weekKey` tugas kini berupa tanggal Senin. Database lokal di-upgrade otomatis (Dexie versi 2), dan backup memakai `schemaVersion: 2`.

### Diperbaiki
- Kompatibilitas: data dan backup dari v1.0.0 otomatis disesuaikan ke minggu baru. Link lama `#/weekly/YYYY-MM-W1` tetap terbuka di minggu yang setara.

### Dokumentasi
- Folder `docs/` untuk dokumentasi teknis (arsitektur, model data, backup, PWA & update, tampilan, i18n, deploy & rilis).
- Folder `panduan/` berisi panduan pengguna dalam Bahasa Indonesia.
- Changelog dan aturan versi.
- Panduan Beranda, Mingguan, Harian, Backup, dan FAQ diperbarui untuk minggu Senin–Jumat dan jadwal 09:00–20:00.

## [1.0.0] - 2026-10-24

Rilis pertama, di-deploy ke https://masrisyad.github.io/dayly/.

### Ditambahkan
- PWA yang bisa dipasang di iPhone & Android dan berjalan penuh secara offline.
- Penyimpanan lokal di IndexedDB: tanpa akun dan tanpa server.
- **Onboarding**: nama, foto opsional, bahasa, PIN opsional, impor backup.
- **Kunci PIN** 4–6 digit (hash SHA-256 + salt), dengan opsi "Lupa PIN" yang menghapus semua data.
- **Beranda**: sapaan sesuai jam, Sekilas Hari Ini, 3 Prioritas Utama, kartu Minggu 1–4 dengan progres & badge Aktif, Ringkasan Bulanan (kalender, pencapaian, acara, % total).
- **Mingguan**: kartu per tanggal dalam potongan bulan (1–7, 8–14, 15–21, 22–akhir) + Self Care.
- **Harian**: Prioritas Utama, Daftar Tugas, Jadwal 06:00–22:00, Pengingat, Pelacak Air (8 gelas), Catatan.
- **Pengaturan**: profil & foto, bahasa, PIN, unduh/impor data, amankan penyimpanan, hapus semua data.
- Ekspor backup JSON lewat share sheet / unduhan, dan impor dengan ringkasan & konfirmasi.
- Bahasa Indonesia & English.
- Banner "Versi baru tersedia" dengan tombol Muat ulang. Update dicek saat aplikasi dibuka kembali dan tiap 1 jam.
- Tata letak tablet/landscape (≥1024px) dan rotasi layar tidak dikunci.
- Penyesuaian HP landscape: menu bawah ringkas, layar PIN berdampingan, safe area notch kiri/kanan.
- Footer kredit dengan tautan GitHub & LinkedIn.
- Deploy otomatis ke GitHub Pages lewat GitHub Actions (test → build → deploy).

[Belum dirilis]: https://github.com/masrisyad/dayly/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/masrisyad/dayly/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/masrisyad/dayly/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/masrisyad/dayly/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/masrisyad/dayly/releases/tag/v1.0.0
