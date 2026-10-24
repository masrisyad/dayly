# Deploy & Rilis

## Lingkungan

| | |
|---|---|
| Repo | https://github.com/masrisyad/dayly |
| Situs | https://masrisyad.github.io/dayly/ |
| Branch produksi | `main` |
| Workflow | `.github/workflows/deploy.yml` |

## Workflow deploy

Setiap push ke `main` (atau dijalankan manual lewat *workflow_dispatch*) menjalankan:

1. `npm ci`
2. `npm test`. Jika gagal, deploy berhenti.
3. `npm run build` dengan:
   - `VITE_BASE=/<nama-repo>/` (otomatis dari nama repo),
   - `VITE_REPO_URL=https://github.com/<owner>/<repo>`.
4. Upload `dist/`, lalu deploy ke GitHub Pages.

Pengaturan Pages: **Settings → Pages → Source: GitHub Actions**.

## Perintah lokal

```bash
npm run dev       # server pengembangan
npm test          # unit test
npm run build     # build produksi ke dist/
npm run preview   # sajikan hasil build (termasuk service worker)
```

## Aturan versi (Semantic Versioning)

Versi ada di `package.json` → `version`, dan tampil di Pengaturan → Tentang.

| Naikkan | Kapan | Contoh |
|---|---|---|
| **MAJOR** (`2.0.0`) | Perubahan yang membuat backup/data lama tidak kompatibel tanpa migrasi, atau perubahan besar alur | Format backup tidak bisa dimigrasi |
| **MINOR** (`1.1.0`) | Fitur baru yang kompatibel | Bahasa baru, halaman baru, mode tablet |
| **PATCH** (`1.0.1`) | Perbaikan bug, penyesuaian tampilan/teks | Teks terpotong, tombol meluber |

Perubahan yang hanya menyentuh dokumentasi tidak perlu menaikkan versi aplikasi. Cukup catat di CHANGELOG bagian `Dokumentasi`.

## Cara merilis versi baru

1. Pastikan semua perubahan sudah tercatat di `[Belum dirilis]` pada [CHANGELOG.md](CHANGELOG.md).
2. Tentukan nomor versi sesuai tabel di atas.
3. Ubah `version` di `package.json` (dan `package-lock.json`):
   ```bash
   npm version 1.1.0 --no-git-tag-version
   ```
4. Di CHANGELOG, ganti judul `[Belum dirilis]` menjadi `[1.1.0] - YYYY-MM-DD`, lalu buat bagian `[Belum dirilis]` kosong yang baru di atasnya.
5. Perbarui [`../panduan`](../panduan/README.md) dan dokumen di folder ini bila ada perubahan.
6. Commit, lalu buat tag:
   ```bash
   git commit -am "Release v1.1.0"
   git tag -a v1.1.0 -m "Dayly v1.1.0"
   git push origin main --follow-tags
   ```
7. Pastikan workflow di tab **Actions** berhasil, lalu buka situs dan cek versi di Pengaturan → Tentang.
8. (Opsional) Buat GitHub Release dari tag, isinya salinan bagian CHANGELOG versi tersebut.
