# Model Data

Database IndexedDB bernama **`dayly`**, dikelola dengan Dexie (`src/db/db.ts`). Versi skema saat ini: **2** (sejak v1.1.0).

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
- `weekKey` = tanggal **Senin** dari minggu kerja tugas itu (`'YYYY-MM-DD'`). Lihat [Aturan minggu](#aturan-minggu-srclibweeksts).
- `kind: 'todo'` → punya `date`. Muncul di Harian (Daftar Tugas), pratinjau Beranda, dan Mingguan jika tanggalnya Senin–Jumat.
- `kind: 'selfcare'` → `date: null`, hanya terikat ke `weekKey`. Muncul di kartu Self Care.
- `order` = urutan tampil di antara tugas sejenis (tanggal yang sama, atau Self Care minggu yang sama).

### `days`
```ts
{ date: 'YYYY-MM-DD', priorities: [{ text, done }] /* selalu 3 */, schedule: { '09'..'20': string },
  reminders: string[], water: 0..8, notes: string }
```
Baris dibuat saat pertama kali ada yang ditulis. Hari tanpa baris dianggap kosong (`emptyDay()`).

Jam jadwal yang ditampilkan ditentukan oleh `SCHEDULE_HOURS` (09–20). Isian jam 06–08 dan 21–22 yang tersimpan oleh v1.0.0 tetap ada di data, tetapi tidak ditampilkan.

### `months` / `events`
```ts
{ month: 'YYYY-MM', achievements: string[] }
{ id: string, date: 'YYYY-MM-DD', title: string }
```

## Aturan minggu (`src/lib/weeks.ts`)

Sejak v1.1.0, satu minggu = **minggu kerja kalender Senin–Jumat**.

- Kunci minggu (`weekKey`) adalah tanggal Senin-nya, misalnya `2026-10-19`.
- Sabtu & Minggu ikut ke Senin sebelumnya (`mondayOf`), tetapi tidak ditampilkan di Mingguan.
- Minggu menjadi milik **bulan tempat hari Senin-nya berada**. "Minggu ke-N" = minggu dari Senin ke-N bulan itu, yaitu `ceil(tanggalSenin / 7)`. Satu bulan punya **4 atau 5** minggu.
- Akibatnya:
  - tanggal 1–4 yang jatuh sebelum Senin pertama masuk ke minggu terakhir bulan sebelumnya. Contoh: Kam 1 & Jum 2 Okt 2026 ada di Minggu 5 September (28 Sep – 2 Okt),
  - Jumat minggu terakhir bisa jatuh di bulan berikutnya. Contoh: Minggu 5 November 2026 = 30 Nov – 4 Des.

| Contoh | Minggu |
|---|---|
| Oktober 2026 | 5–9, 12–16, 19–23, 26–30 (4 minggu) |
| November 2026 | 2–6, 9–13, 16–20, 23–27, 30 Nov–4 Des (5 minggu) |

Fungsi utama: `mondayOf`/`weekKeyOf(date)`, `getWeek(key)`, `weeksOfMonth(month)`, `shiftWeek(key, ±n)`, `isWeekKey`, `monthCoverageEnd(month)`.

### Riwayat: v1.0.0

v1.0.0 memakai potongan bulan `YYYY-MM-W1`…`W4` (1–7, 8–14, 15–21, 22–akhir). Upgrade DB versi 2 dan impor backup `schemaVersion: 1` mengubahnya lewat `migratedWeekKey()`:
- tugas bertanggal → Senin dari minggu tanggal itu,
- Self Care → Senin pertama di dalam potongannya (nomor minggu dan bulannya tetap sama).

Link lama `#/weekly/2026-10-W1` juga diarahkan ke minggu yang setara.

## Perhitungan progres (`src/lib/progress.ts`, `src/lib/stats.ts`)

Progres = jumlah item selesai ÷ jumlah item, dibulatkan ke persen terdekat. Daftar kosong = 0%.

| Tempat | Item yang dihitung |
|---|---|
| 3 Prioritas Utama (Beranda) | Prioritas hari ini yang **sudah diisi** |
| Kartu minggu & halaman Mingguan | Tugas Senin–Jumat + Self Care minggu itu + prioritas terisi Senin–Jumat. **Sabtu/Minggu tidak dihitung** |
| Ring "total" bulanan | Semua tugas & prioritas terisi bertanggal di bulan kalender itu (termasuk akhir pekan) + Self Care dari minggu-minggu bulan itu |
| Hari "selesai" (hijau) di kalender | Hari yang punya minimal 1 item dan semuanya selesai |

Slot prioritas yang kosong tidak dihitung sebagai pekerjaan yang belum selesai.

`loadMonth(month)` memuat data dari tanggal 1 sampai `monthCoverageEnd(month)` (bisa beberapa hari ke bulan berikutnya), ditambah Self Care minggu-minggu bulan itu. Data ini dipakai oleh Beranda maupun halaman Mingguan (yang memuat bulan milik Senin-nya).

## Mengubah skema

1. Tambah `this.version(n).stores({...})` baru di `DaylyDB` (jangan ubah versi lama), plus `.upgrade()` bila data lama perlu diubah.
2. Naikkan `BACKUP_SCHEMA` dan tambah langkah migrasi di `migrate()` pada `src/db/backup.ts` (lihat [backup.md](backup.md)).
3. Perbarui dokumen ini dan catat di [CHANGELOG.md](CHANGELOG.md).
