# PWA, Offline & Update

Konfigurasi: `vite.config.ts` (`VitePWA`), banner: `src/components/UpdateBanner.tsx`, install: `src/lib/install.ts`, `src/components/InstallBanner.tsx`.

## Manifest

| Field | Nilai |
|---|---|
| `name` / `short_name` | Dayly |
| `display` | `standalone` |
| `orientation` | `any` (bisa diputar, termasuk tablet Android) |
| `start_url` / `scope` | `.` (relatif terhadap base path, mis. `/dayly/`) |
| `theme_color` / `background_color` | `#F6EEE3` |
| Ikon | 192, 512, maskable 512 + `apple-touch-icon` 180 di `index.html` |

## Offline

Workbox mem-precache semua file build (`js, css, html, png, webp, woff2`). `navigateFallback: 'index.html'` membuat aplikasi tetap terbuka tanpa internet.
Font di-self-host sehingga tampilan tetap sama saat offline.

## Alur update (mode `prompt`)

1. Versi baru di-deploy → `sw.js` berubah.
2. Aplikasi memeriksa `sw.js` baru:
   - saat aplikasi dibuka,
   - setiap aplikasi **kembali terlihat** (`visibilitychange`). Ini penting di iPhone karena aplikasi di layar utama biasanya hanya dilanjutkan, bukan dibuka ulang,
   - setiap **1 jam** selama aplikasi terbuka.
   Pemeriksaan dilewati saat offline atau saat update sedang diunduh.
3. Versi baru diunduh di latar belakang lalu **menunggu**. Banner "Versi baru tersedia" muncul.
4. Pengguna menekan **Muat ulang** → field yang sedang fokus di-blur dulu agar drafnya tersimpan → service worker baru aktif → halaman dimuat ulang.
5. Jika pengguna menekan ✕, versi baru dipakai saat aplikasi ditutup dan dibuka lagi.

> Versi 1.0.0 awal (sebelum banner) memakai mode `autoUpdate`. Pengguna versi itu pindah otomatis satu kali ke versi dengan banner.

## Install

- **Android/Chrome**: event `beforeinstallprompt` ditangkap di `lib/install.ts`, lalu tombol "Pasang" ditampilkan di `InstallBanner`.
- **iOS/Safari**: tidak ada prompt otomatis. Banner berisi instruksi Bagikan → Tambahkan ke Layar Utama.
- Banner disembunyikan saat sudah berjalan sebagai aplikasi (`display-mode: standalone`) atau setelah ditutup (`localStorage: dayly.installDismissed`).

## Catatan iOS

- **Data Safari dan data aplikasi di layar utama terpisah.** Karena itu onboarding menyarankan memasang aplikasi dulu.
- Aplikasi yang dipasang ke layar utama tidak terkena penghapusan otomatis 7 hari milik Safari. Meski begitu, pengguna tetap disarankan rutin backup.
- Tombol "Amankan data" memanggil `navigator.storage.persist()`.

## Menguji update secara lokal

1. `npm run build && npm run preview`, lalu buka aplikasi sekali agar service worker terpasang.
2. Ubah sesuatu, lalu `npm run build` lagi (server preview tidak perlu dimatikan).
3. Di DevTools console, jalankan `document.dispatchEvent(new Event('visibilitychange'))`. Banner akan muncul dalam beberapa detik.
