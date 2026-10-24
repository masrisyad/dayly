# Backup: Ekspor & Impor

Kode: `src/db/backup.ts`, tombol impor: `src/components/ImportButton.tsx`.

## Format file

Nama file: `dayly-backup-YYYY-MM-DD.json`

```json
{
  "app": "dayly",
  "schemaVersion": 1,
  "exportedAt": "2026-10-24T08:00:00.000Z",
  "data": {
    "profile": { "id": "me", "name": "…", "avatar": "data:image/jpeg;base64,…", "lang": "id", "createdAt": 0 },
    "tasks":  [ … ],
    "days":   [ … ],
    "months": [ … ],
    "events": [ … ]
  }
}
```

- Isi `data` sama persis dengan tabel di [model-data.md](model-data.md).
- **PIN tidak pernah ikut** (`pinHash`/`pinSalt` dibuang saat ekspor). Setiap perangkat mengatur PIN sendiri.
- Foto profil ikut sebagai data URL.

## Ekspor (`downloadBackup`)

1. Membuat JSON dari semua tabel.
2. Di perangkat sentuh yang mendukung `navigator.canShare({ files })`, membuka **share sheet** (simpan ke Files/Drive/AirDrop/chat).
3. Jika tidak didukung atau gagal, mengunduh file lewat `<a download>`.
4. Jika pengguna membatalkan share sheet, tidak ada toast.

## Impor (`parseBackup` → `summarize` → `restoreBackup`)

1. Validasi file:

   | Kode error | Penyebab |
   |---|---|
   | `not-json` | Bukan JSON |
   | `not-dayly` | `app` bukan `dayly` atau struktur dasar tidak ada |
   | `too-new` | `schemaVersion` lebih baru dari yang didukung aplikasi |
   | `corrupt` | Salah satu daftar data bukan array |

2. Tampilkan ringkasan (tanggal backup, nama, jumlah tugas/hari/acara) dan minta konfirmasi.
3. **Ganti semua data** dalam satu transaksi Dexie. Data tidak digabung.
4. PIN perangkat saat ini dipertahankan.

## Kompatibilitas versi

- `BACKUP_SCHEMA` = versi format yang dibuat aplikasi sekarang.
- Backup dengan versi **lebih lama** harus tetap bisa diimpor. Setiap kali `BACKUP_SCHEMA` dinaikkan, tambah satu langkah di `migrate()` yang mengubah format lama ke format baru.
- Backup dengan versi **lebih baru** ditolak (`too-new`) dan pengguna diminta memperbarui aplikasi.

## Test

`src/tests/backup.test.ts` menguji round-trip ekspor → hapus → impor, bahwa PIN tidak ikut, bahwa impor mengganti (bukan menggabung), dan keempat kode error.
