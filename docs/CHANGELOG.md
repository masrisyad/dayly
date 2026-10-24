# Changelog

Semua perubahan penting pada Dayly dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).
Aturan kapan menaikkan versi ada di [deploy-dan-rilis.md](deploy-dan-rilis.md#aturan-versi-semantic-versioning).

Kategori: **Ditambahkan**, **Diubah**, **Diperbaiki**, **Dihapus**, **Keamanan**, **Dokumentasi**.

## [Belum dirilis]

### Dokumentasi
- Folder `docs/` untuk dokumentasi teknis (arsitektur, model data, backup, PWA & update, tampilan, i18n, deploy & rilis).
- Folder `panduan/` berisi panduan pengguna dalam Bahasa Indonesia.
- Changelog dan aturan versi.

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

[Belum dirilis]: https://github.com/masrisyad/dayly/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/masrisyad/dayly/releases/tag/v1.0.0
