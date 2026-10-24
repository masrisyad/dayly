# Arsitektur

## Prinsip

- **Offline-first & tanpa server.** Semua data disimpan di IndexedDB pada perangkat pengguna. Tidak ada akun, API, atau pelacakan.
- **Statis.** Hasil build berupa file statis yang di-host di GitHub Pages.
- **Satu sumber data.** Tugas harian disimpan sekali dan ditampilkan di halaman Harian, Mingguan, dan Beranda.

## Stack

| Bagian | Teknologi |
|---|---|
| Build | Vite |
| UI | React + TypeScript |
| Routing | `react-router-dom` (`HashRouter`, agar refresh di GitHub Pages tidak 404) |
| Database | Dexie (IndexedDB) + `dexie-react-hooks` (`useLiveQuery`) |
| PWA | `vite-plugin-pwa` (Workbox, mode `prompt`) |
| Font | `@fontsource/fredoka`, `@fontsource/nunito` (self-host, subset latin) |
| Test | Vitest + `fake-indexeddb` |

## Struktur folder

```
src/
  main.tsx            entry: font, CSS, I18nProvider, App, UpdateBanner
  App.tsx             gerbang onboarding/kunci PIN + router + menu bawah
  db/
    db.ts             skema Dexie & tipe data
    repo.ts           helper tulis data (patchDay, addTask, wipeAll, …)
    backup.ts         ekspor/impor backup JSON
  lib/
    dates.ts          helper tanggal lokal 'YYYY-MM-DD'
    weeks.ts          minggu kerja Senin–Jumat (kunci = tanggal Senin) + migrasi dari v1.0.0
    progress.ts       perhitungan persentase
    stats.ts          agregasi data bulan/minggu untuk Beranda & Mingguan
    pin.ts            hash PIN (SHA-256 + salt)
    image.ts          resize foto profil
    install.ts        deteksi iOS/standalone & prompt install Android
    assets.ts         daftar & URL ilustrasi
  i18n/               kamus en.ts / id.ts + provider
  components/         komponen UI bersama
  pages/              Onboarding, Lock, Home, Weekly, Daily, Settings
  styles/             tokens.css, global.css, pages.css
  tests/              unit test
public/
  illustrations/      ilustrasi .webp (dipotong dari desain "daily task")
  icons/              ikon aplikasi
docs/                 dokumentasi teknis (folder ini)
panduan/              panduan pengguna
```

## Alur aplikasi

```
main.tsx
 └─ I18nProvider (bahasa dari profil, default bahasa browser)
     ├─ App
     │   ├─ profil belum ada      → Onboarding
     │   ├─ profil punya PIN      → Lock (sekali per buka aplikasi)
     │   └─ selain itu            → HashRouter
     │        ├─ /                  Home
     │        ├─ /weekly/:week?     Weekly   (week = tanggal Senin 'YYYY-MM-DD'; link lama 'YYYY-MM-W1' tetap diterima)
     │        ├─ /daily/:date?      Daily    (date = 'YYYY-MM-DD')
     │        ├─ /settings          Settings
     │        └─ BottomNav
     └─ UpdateBanner (muncul saat ada versi baru)
```

- Status kunci PIN diputuskan **sekali saat aplikasi dibuka**. Memasang PIN di Pengaturan tidak langsung mengunci sesi yang sedang berjalan.
- Saat berpindah tab di menu bawah, halaman di-scroll ke atas. Berpindah tanggal/minggu di dalam halaman tidak mengubah scroll.

## Pola penyimpanan input

`components/LineField.tsx` menyimpan draf teks secara lokal saat diketik, lalu menulis ke DB:
- otomatis setelah jeda **500 ms**,
- saat field kehilangan fokus (blur),
- saat komponen dilepas (misalnya pindah halaman).

Untuk menghindari dua edit cepat saling menimpa, `patchDay(date, fn)` menerima fungsi yang menghitung perubahan dari data terbaru di dalam transaksi.
Grid di halaman Harian diberi `key={date}` agar draf yang belum tersimpan tetap masuk ke tanggal yang benar saat tanggal diganti.
