# 7. Backup & Pindah HP

Karena Dayly tidak memakai server, data **hanya ada di perangkatmu**. Backup adalah satu-satunya cara agar data tidak hilang dan bisa dipindah ke perangkat lain.

## Membuat backup

1. Buka **Pengaturan → Data & backup**.
2. Ketuk **Unduh data**.
3. File `dayly-backup-TANGGAL.json` dibuat:
   - **di HP**: menu berbagi terbuka. Simpan ke **Files/File**, **Google Drive**, **AirDrop**, atau kirim ke chat milikmu sendiri,
   - **di komputer**: file langsung terunduh.

Isi backup: profil (nama, foto, bahasa), semua tugas, isi Harian, pencapaian, dan acara.
**PIN tidak ikut** di dalam backup.

> 💡 Buat backup secara rutin, misalnya seminggu sekali, dan simpan di tempat selain HP itu sendiri.

## Pindah ke HP baru

1. Di HP lama: **Unduh data**, lalu kirim file backup ke HP baru (Drive, AirDrop, chat, dll.).
2. Di HP baru: [pasang Dayly](01-memasang-aplikasi.md) lalu buka.
3. Di layar sambutan, ketuk **Pindah dari perangkat lain? Impor backup**. Jika sudah membuat profil, buka **Pengaturan → Impor data**.
4. Pilih file backup.
5. Periksa ringkasannya (tanggal backup, nama, jumlah tugas/hari/acara), lalu konfirmasi.
6. Selesai. Pasang PIN lagi di Pengaturan jika perlu.

## Hal yang perlu diketahui

- **Impor mengganti semua data** di perangkat tujuan. Data tidak digabung.
- PIN perangkat tujuan (jika ada) tetap dipakai.
- Backup dari versi Dayly yang lebih baru tidak bisa diimpor ke versi lama. Perbarui aplikasinya dulu (lihat [Pembaruan aplikasi](08-pembaruan-aplikasi.md)).
- Jika muncul pesan "File ini bukan backup Dayly" atau "File backup ini rusak", pastikan kamu memilih file `.json` yang dibuat dari tombol **Unduh data**.
