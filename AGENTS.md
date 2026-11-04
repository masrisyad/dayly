# Dayly — catatan untuk agen AI

Berkas ini dibaca oleh semua agen AI yang bekerja di folder ini (Claude Code, Codex, Cursor, Copilot, Gemini, dll.). Pemilik proyek: Risyad. Bahasa percakapan: Bahasa Indonesia.

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
- Commit **tanpa** trailer `Co-Authored-By` (termasuk yang untuk Claude). Pemilik ingin hanya dirinya yang tercatat sebagai kontributor di GitHub.

## Memori proyek bersama

Memori jangka panjang proyek ini ada di **`.ai-memory/`**, dan dipakai bersama oleh semua agen.

- `.ai-memory/MEMORY.md` adalah indeksnya: satu baris per memori, berisi tautan ke file dan ringkasan satu kalimat.
- Setiap memori lain adalah satu file `.md` yang berisi satu fakta.

### Di awal setiap sesi
1. Baca `.ai-memory/MEMORY.md`.
2. Buka file memori yang relevan dengan tugas sebelum mulai bekerja.
3. Utamakan memori daripada asumsi. Memori menyimpan keputusan dan preferensi pemilik yang tidak tertulis di kode.

Claude Code sudah memuat memori ini otomatis (lewat `autoMemoryDirectory`), jadi tidak perlu membacanya ulang.

### Perintah dari pemilik
| Pemilik mengetik | Yang harus dilakukan |
|---|---|
| `ingat ini: …` | Buat file memori baru atau perbarui yang sudah ada, lalu tambah atau perbarui barisnya di `MEMORY.md` |
| `cek memori soal …` | Cari di `.ai-memory/`, lalu jawab berdasarkan isinya dan sebutkan file mana yang dipakai |
| `lupakan memori soal …` | Hapus file itu dan barisnya di `MEMORY.md` |
| `memori ini salah: …` | Perbaiki isi file yang bersangkutan, atau hapus kalau sudah tidak berlaku |

Tanpa diminta pun, simpan memori kalau pemilik memberi koreksi, preferensi kerja, atau keputusan yang akan berlaku lagi di sesi berikutnya.

### Format file memori
```markdown
---
name: <slug-kebab-case>
description: <ringkasan satu baris, dipakai untuk menilai relevansi>
metadata:
  type: user | feedback | project | reference
---

<faktanya. Untuk feedback/project tambahkan baris **Why:** dan **How to apply:**. Tautkan memori terkait dengan [[nama-slug]].>
```
- Nama file sama dengan slug, misalnya `rilis-104-alarm-jam.md`.
- Satu fakta per file. Sebelum membuat file baru, cek dulu apakah sudah ada yang membahas hal yang sama. Kalau ada, perbarui file itu.
- Tanggal ditulis absolut, misalnya "4 Nov 2026", bukan "kemarin".
- Ikuti bahasa yang sudah dipakai di file-file memori yang ada.
- `MEMORY.md` hanya berisi indeks, satu baris per memori: `- [Judul](file.md) — ringkasan`.
- Jangan simpan hal yang sudah tercatat di kode, git, atau dokumentasi proyek. Jangan simpan rahasia (password, token, API key, isi `.env`).

### Khusus repo ini
- Repo ini **publik**. `.ai-memory/` sudah masuk `.gitignore`: jangan pernah meng-commit atau mem-push-nya, dan jangan hapus entri ignore-nya.
