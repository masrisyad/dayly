# Dayly 🌷

A cozy, offline-first daily & weekly planner you can install on iPhone and Android.
**All data stays on your device.** There are no accounts, no servers, and no tracking.

**Live:** https://masrisyad.github.io/dayly/ · [Bahasa Indonesia ↓](#bahasa-indonesia)

| | |
|---|---|
| 📖 [**panduan/**](panduan/README.md) | User guide (Indonesian): install, every screen, backup & moving phones, FAQ |
| 🛠 [**docs/**](docs/README.md) | Technical docs: architecture, data model, backup format, PWA & updates, layout, i18n, deploy & release |
| 📝 [**CHANGELOG**](docs/CHANGELOG.md) | Version history |

## Features

- **Home**: a greeting, today's schedule at a glance, your top 3 priorities, a card for each work week of the month (4–5) with progress, and a monthly summary with a calendar, achievements, upcoming events, and overall progress.
- **Weekly**: Monday–Friday work weeks, with a to-do card for each weekday plus a Self Care list. Week 1 starts on the month's first Monday.
- **Daily**: top priorities, a to-do list, an hourly schedule (09:00–20:00), reminders, a water tracker, and notes.
- **Settings**: profile and photo, an optional PIN lock, Indonesian/English, backup download and import, persistent storage, and data reset.
- Installable PWA that works fully offline. When a new version is deployed, a "New version available" banner appears (checked when the app is reopened and every hour), and the update only happens when the user taps *Reload*.

## Your data

Data is stored in your browser's IndexedDB on this device only.

- **Moving to a new phone:** in *Settings → Download data*, save the `dayly-backup-YYYY-MM-DD.json` file (to Files, Drive, AirDrop, or a chat). On the new phone, open Dayly and choose *Import data*. You can also pick *Import a backup* on the welcome screen.
- **Importing replaces** all data on that device. The PIN is never included in backups, so each device keeps its own.
- **iPhone:** Safari and the app installed with "Add to Home Screen" keep **separate** data. Install first, then use the app from your home screen.
- The PIN is a privacy lock for the screen. It does **not** encrypt the stored data.
- Download a backup regularly. If the browser's site data is cleared, the data is gone.

## Install on your phone

- **iPhone (Safari):** tap Share, then *Add to Home Screen*.
- **Android (Chrome):** tap *Install* in the banner, or use ⋮ → *Install app*.

## Development

```bash
npm install
npm run dev       # local dev server
npm test          # unit tests (Vitest)
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Stack: Vite, React, TypeScript, Dexie (IndexedDB), vite-plugin-pwa (Workbox).

```
src/
  db/          Dexie schema, data helpers, backup export/import
  lib/         dates, month-week chunks, progress, PIN hashing, stats
  i18n/        en.ts / id.ts dictionaries
  components/  shared UI (cards, heart checkboxes, task lists, …)
  pages/       Onboarding, Lock, Home, Weekly, Daily, Settings
public/
  illustrations/  artwork cut from the "daily task" design
  icons/          app icons
```

### Adding a language

Copy `src/i18n/en.ts` to a new file and translate it (TypeScript tells you about any missing keys). Then register the file in `src/i18n/index.tsx` and add it to `LangSwitch`.

### Changing the data model

Add a new `this.version(n)` to `src/db/db.ts`. Then bump `BACKUP_SCHEMA` in `src/db/backup.ts` and add a migration step in `migrate()`, so older backups can still be imported.

## Deploying to GitHub Pages

1. Push this repository to GitHub, using `main` as the default branch.
2. In the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` runs the tests, builds the app, and publishes it to `https://<user>.github.io/<repo>/`. The base path comes from the repository name, so any repo name works.

## License

[MIT](LICENSE)

---

## Bahasa Indonesia

📖 **Panduan lengkap: [panduan/](panduan/README.md)** · Dokumentasi teknis: [docs/](docs/README.md) · Riwayat versi: [CHANGELOG](docs/CHANGELOG.md)

Dayly adalah planner harian & mingguan yang bisa dipasang di iPhone dan Android dan bisa dipakai tanpa internet.
**Semua data tersimpan di perangkatmu.** Tidak ada akun, server, atau pelacakan.

- **Pindah HP:** buka *Pengaturan → Unduh data*, lalu simpan file backup-nya. Di HP baru, buka Dayly dan pilih *Impor data*, atau *Impor backup* di layar sambutan.
- **Impor akan mengganti** semua data di perangkat tersebut. PIN tidak ikut di-backup.
- **iPhone:** data di Safari dan di app hasil "Tambahkan ke Layar Utama" **terpisah**. Pasang app dulu, lalu pakai dari layar utama.
- PIN hanya mengunci tampilan. Data yang tersimpan **tidak** dienkripsi.
- Unduh backup secara rutin.

**Pasang:** di iPhone (Safari), ketuk Bagikan lalu *Tambahkan ke Layar Utama*. Di Android (Chrome), ketuk *Pasang*.

**Deploy:** push ke GitHub, lalu buka Settings → Pages → Source: **GitHub Actions**. Setiap push ke `main` akan ter-deploy otomatis.
