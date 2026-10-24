# Dayly — catatan untuk Claude

PWA planner offline-first (Vite + React + TS + Dexie), di-deploy ke GitHub Pages dari `main` (https://masrisyad.github.io/dayly/). Detail teknis ada di `docs/`, panduan pengguna di `panduan/`.

## Wajib setiap ada perubahan

Pemilik repo ingin dokumentasi dan versi selalu rapi. Setiap perubahan pada aplikasi **harus** disertai, di commit yang sama:

1. **`docs/CHANGELOG.md`**: tambah entri di `## [Belum dirilis]` dengan kategori Ditambahkan / Diubah / Diperbaiki / Dihapus / Keamanan / Dokumentasi.
2. **`docs/`**: perbarui dokumen teknis yang terdampak (arsitektur, model data, backup, PWA, tampilan/breakpoint, i18n, deploy).
3. **`panduan/`**: perbarui bab yang terdampak bila ada yang berubah dari sisi pengguna (fitur, label tombol, teks, alur). Pakai label persis seperti di `src/i18n/id.ts`.

Saat merilis (biasanya sebelum push yang membawa perubahan aplikasi):
- Naikkan versi dengan SemVer (`npm version X.Y.Z --no-git-tag-version`). Aturannya ada di `docs/deploy-dan-rilis.md`.
- Pindahkan isi `[Belum dirilis]` ke `## [X.Y.Z] - YYYY-MM-DD`, lalu perbarui link perbandingan di bawah CHANGELOG.
- Perbarui baris "Panduan ini berlaku untuk Dayly versi …" di `panduan/README.md`.
- Buat tag `vX.Y.Z` setelah commit rilis.

Perubahan yang hanya menyentuh dokumentasi tidak menaikkan versi aplikasi.

## Konvensi

- Teks UI selalu lewat `src/i18n/en.ts` + `id.ts`, jangan di-hardcode (kecuali nama app & footer kredit).
- Breakpoint memakai lebar/tinggi, bukan `orientation`.
- Perubahan skema DB → versi Dexie baru + `BACKUP_SCHEMA` + langkah `migrate()` (lihat `docs/model-data.md`).
- Sebelum commit: `npx tsc --noEmit`, `npm test`, `npm run build`.
- Push ke `main` = deploy ke produksi. Minta izin pemilik dulu sebelum push.
