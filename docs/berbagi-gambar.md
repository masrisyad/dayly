# Bagikan sebagai Gambar

Halaman **Harian** dan **Mingguan** punya tombol **Bagikan**. Tombol itu membuat gambar PNG dari planner lalu menyerahkannya ke menu berbagi sistem atau menyimpannya.

## Batasan platform (alasan desainnya begini)

Aplikasi web/PWA **tidak bisa** mengirim gambar langsung ke aplikasi tertentu:

| Tujuan | Kenapa tidak bisa langsung |
|---|---|
| Instagram Story | Hanya lewat SDK native Meta (`instagram-stories://` + pasteboard + Facebook App ID) |
| TikTok | Hanya lewat TikTok Share Kit untuk aplikasi native |
| WhatsApp | Link `wa.me` / `whatsapp://send` hanya menerima teks |

Jalur yang tersedia adalah **Web Share API Level 2** (`navigator.share({ files })`). API ini membuka menu berbagi HP, tempat pengguna memilih WhatsApp (Chat/Status), Instagram (Story/Feed/DM), TikTok, atau "Simpan Gambar". Karena itu, setiap tombol tujuan memilih **ukuran gambar** yang tepat dan menampilkan **petunjuk** aplikasi mana yang harus dipilih.

## Tujuan

| Tombol | Ukuran | Aksi |
|---|---|---|
| Simpan ke perangkat | sesuai pilihan (Story/Post) | iOS: menu berbagi, lalu "Simpan Gambar" (masuk ke Foto). Lainnya: unduh file |
| WhatsApp Chat | Post 4:5 (1080×1350) | menu berbagi |
| WhatsApp Status | Story 9:16 (1080×1920) | menu berbagi |
| Instagram Story | Story 9:16 | menu berbagi |
| TikTok | Story 9:16 | menu berbagi |

Jika browser tidak mendukung berbagi file (mis. Firefox desktop), gambar **diunduh** dan muncul pesan agar diunggah manual dari galeri.

## Kode

| File | Isi |
|---|---|
| `src/lib/shareContent.ts` | Mengubah data Harian/Mingguan menjadi `ShareContent` (fungsi murni, diuji di `src/tests/shareContent.test.ts`) |
| `src/lib/shareImage.ts` | Menggambar `ShareContent` di `<canvas>` → PNG |
| `src/components/ShareSheet.tsx` | Panel bawah: pratinjau, pilih ukuran, pilih isi (Harian), tombol tujuan. Juga `ShareButton` |
| `src/components/ShareIcons.tsx` | Ikon tujuan (versi sederhana, bukan logo resmi) |
| `src/lib/download.ts` | `downloadFile`, `canShareFile`, `shareFile` (dipakai juga oleh backup) |

### Alur
1. Tombol **Bagikan** membuka `ShareSheet`.
2. Saat panel terbuka, **kedua ukuran langsung dirender**. Ini wajib: iOS hanya mengizinkan `navigator.share()` tepat setelah ketukan, jadi tidak boleh ada proses render di antara ketukan dan pemanggilan share.
3. Saat pilihan isi berubah, gambar dirender ulang. Tombol tujuan dinonaktifkan sampai render selesai.
4. Data halaman dibaca saat panel dibuka. Panel menutupi halaman, jadi data tidak berubah selama panel terbuka.

### Isi gambar
- **Atas:** avatar + "Planner {nama}", judul gaya bubble (Daily Planner / Mingguan), pita tanggal/minggu, progress bar.
- **Tengah:** kartu bagian dengan label pill. Ini mengikuti tema halaman *daily task*: warna diambil dari token CSS (`--pink`, `--mint`, …), dan ilustrasi dari `public/illustrations`.
- **Bawah:** watermark `Dayly · <host><base>` dan dekorasi.
- **Harian** (bisa dipilih, tersimpan di `localStorage: dayly.shareDailySections`):
  - bawaan aktif: Prioritas Utama (yang terisi), Daftar Tugas, Jadwal (hanya jam yang terisi, 09–20), Pelacak Air,
  - bawaan nonaktif karena bisa bersifat pribadi: Pengingat, Catatan.
- **Mingguan:** Senin–Jumat + Self Care (warna & ikon sama dengan halaman, `WEEKDAY_TONES/ICONS`), hari ini ditandai hijau.

### Tata letak (`renderShareImage`)
- Kartu disusun **baris demi baris** (Senin | Selasa, Rabu | Kamis, …) agar urutan baca tetap. Kartu dalam satu baris disamakan tingginya.
- Teks panjang dibungkus maksimal 2 baris, lalu diberi elipsis. Daftar dibatasi 8 baris (Story) / 6 baris (Post), dan sisanya menjadi "+N lainnya". Catatan dibatasi 6 baris.
- Urutan percobaan tata letak: 1 kolom ukuran normal → 2 kolom ukuran normal → 1 kolom sedikit lebih kecil → 2 kolom makin kecil (sampai 0,52×). Dipilih yang pertama muat, lalu sisa ruang dibagi rata atas-bawah.
- Font Fredoka/Nunito dimuat dulu lewat `document.fonts.load` agar canvas memakai font yang benar.

## Menguji
- `npm test`: isi gambar (`shareContent.test.ts`).
- Manual di browser: buka Harian/Mingguan → **Bagikan**. Periksa pratinjau Story dan Post, nyalakan/matikan bagian Harian, lalu coba tiap tombol di HP asli (iPhone Safari & Android Chrome).
- Di DevTools, `navigator.share`/`canShare` bisa diganti fungsi palsu untuk memeriksa nama file dan ukuran yang dikirim tiap tombol tanpa membuka menu berbagi.
