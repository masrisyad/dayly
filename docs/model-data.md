# Model Data

Database IndexedDB bernama **`dayly`**, dikelola dengan Dexie (`src/db/db.ts`). Versi skema saat ini: **1**.

## Tabel

| Tabel | Kunci | Index | Isi |
|---|---|---|---|
| `profile` | `id` (selalu `'me'`) | – | Nama, foto, bahasa, hash PIN |
| `tasks` | `id` | `date`, `weekKey` | Tugas harian & Self Care |
| `days` | `date` | – | Prioritas, jadwal, pengingat, air, catatan per hari |
| `months` | `month` | – | Pencapaian utama per bulan |
| `events` | `id` | `date` | Acara mendatang |

### `profile`
```ts
{ id: 'me', name: string, avatar?: string /* data URL JPEG 256px */, lang: 'id' | 'en',
  pinHash?: string, pinSalt?: string, createdAt: number }
```

### `tasks`
```ts
{ id: string, date: string | null, weekKey: string, kind: 'todo' | 'selfcare',
  text: string, done: boolean, order: number }
```
- `kind: 'todo'` → punya `date`. Muncul di Harian (To-Do List), Mingguan (kartu tanggal), dan pratinjau Beranda.
- `kind: 'selfcare'` → `date: null`, hanya terikat ke `weekKey`. Muncul di kartu Self Care.
- `order` = urutan tampil di antara tugas sejenis (tanggal yang sama, atau Self Care minggu yang sama).

### `days`
```ts
{ date: 'YYYY-MM-DD', priorities: [{ text, done }] /* selalu 3 */, schedule: { '06'..'22': string },
  reminders: string[], water: 0..8, notes: string }
```
Baris dibuat saat pertama kali ada yang ditulis. Hari tanpa baris dianggap kosong (`emptyDay()`).

### `months` / `events`
```ts
{ month: 'YYYY-MM', achievements: string[] }
{ id: string, date: 'YYYY-MM-DD', title: string }
```

## Aturan minggu (`src/lib/weeks.ts`)

Dayly **tidak** memakai minggu kalender Senin–Minggu. Setiap bulan dibagi menjadi 4 potongan:

| Minggu | Tanggal |
|---|---|
| W1 | 1–7 |
| W2 | 8–14 |
| W3 | 15–21 |
| W4 | 22–akhir bulan (7–10 hari) |

`weekKey` berformat `YYYY-MM-W1`…`W4`. Fungsi utama: `weekKeyOf(date)`, `getWeekChunk(month, week)`, `getWeekChunks(month)`.

## Perhitungan progres (`src/lib/progress.ts`, `src/lib/stats.ts`)

Progres = jumlah item selesai ÷ jumlah item, dibulatkan ke persen terdekat. Daftar kosong = 0%.

| Tempat | Item yang dihitung |
|---|---|
| 3 Prioritas Utama (Beranda) | Prioritas hari ini yang **sudah diisi** |
| Kartu minggu & halaman Mingguan | Semua tugas minggu itu (to-do + Self Care) + prioritas terisi dari tiap tanggal di minggu itu |
| Ring "total" bulanan | Semua tugas bulan itu + semua prioritas terisi bulan itu |
| Hari "selesai" (hijau) di kalender | Hari yang punya minimal 1 item dan semuanya selesai |

Slot prioritas yang kosong tidak dihitung sebagai pekerjaan yang belum selesai.

## Mengubah skema

1. Tambah `this.version(n).stores({...})` baru di `DaylyDB` (jangan ubah versi lama), plus `.upgrade()` bila data lama perlu diubah.
2. Naikkan `BACKUP_SCHEMA` dan tambah langkah migrasi di `migrate()` pada `src/db/backup.ts` (lihat [backup.md](backup.md)).
3. Perbarui dokumen ini dan catat di [CHANGELOG.md](CHANGELOG.md).
