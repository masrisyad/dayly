# Dokumentasi Teknis Dayly

Folder ini berisi dokumentasi untuk **pengembang**: cara kerja aplikasi, struktur kode, format data, dan proses rilis.
Panduan untuk **pengguna** ada di folder [`../panduan`](../panduan/README.md).

| Dokumen | Isi |
|---|---|
| [arsitektur.md](arsitektur.md) | Stack, struktur folder, alur aplikasi, routing |
| [model-data.md](model-data.md) | Skema IndexedDB (Dexie), aturan minggu, perhitungan progres |
| [backup.md](backup.md) | Format file backup, ekspor/impor, migrasi versi |
| [pwa-dan-update.md](pwa-dan-update.md) | Service worker, mode offline, banner versi baru, catatan iOS |
| [berbagi-gambar.md](berbagi-gambar.md) | Bagikan Harian/Mingguan sebagai gambar: batasan platform, tujuan, pembuat gambar canvas |
| [tampilan.md](tampilan.md) | Token tema, ilustrasi, breakpoint HP/tablet/landscape, safe area |
| [i18n.md](i18n.md) | Sistem bahasa (ID/EN) dan cara menambah bahasa |
| [deploy-dan-rilis.md](deploy-dan-rilis.md) | GitHub Pages, workflow CI, aturan versi & cara merilis |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan per versi |

## Aturan menjaga dokumentasi

Setiap perubahan pada aplikasi **wajib** diikuti dengan:

1. Catatan di bagian **`[Belum dirilis]`** pada [CHANGELOG.md](CHANGELOG.md).
2. Pembaruan dokumen teknis di folder ini jika perilaku, data, atau struktur berubah.
3. Pembaruan [`../panduan`](../panduan/README.md) jika ada yang berubah dari sisi pengguna (fitur, tombol, teks, alur).

Saat merilis, ikuti langkah di [deploy-dan-rilis.md](deploy-dan-rilis.md#cara-merilis-versi-baru).
