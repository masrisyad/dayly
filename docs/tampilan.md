# Tampilan & Responsif

## Sumber desain

Tema, warna, dan ilustrasi **hanya** diambil dari mockup halaman *daily task* (gaya pastel 3D/clay). Mockup lain (login, beranda, weekly) hanya dipakai sebagai acuan tata letak.

## Token (`src/styles/tokens.css`)

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--bg` | `#f3e9dc` | Latar halaman |
| `--paper` / `--card` | `#fbf5ec` / `#fdf9f3` | Lembar planner & kartu |
| `--ink` / `--ink-soft` | `#5e4b47` / `#9a8580` | Teks |
| `--pink`, `--lavender`, `--mint`, `--yellow`, `--blue` | pastel | Label section, tombol |
| `--green-deep` | `#78a656` | Progress bar & ring |
| `--font-display` | Fredoka | Judul, label |
| `--font-body` | Nunito | Teks isi |

Ukuran input minimal 16px agar iOS tidak zoom saat fokus.

## Ilustrasi (`public/illustrations/*.webp`)

Dipotong dari `halaman daily task.jpeg` (resolusi sumber sekitar 736px), latar krem dibuat transparan, lalu disimpan 2× ukuran potongan. Daftar nama ada di `src/lib/assets.ts` (`AssetName`).
Untuk mengganti dengan aset resolusi lebih tinggi, simpan file dengan **nama yang sama**.
Ikon aplikasi (`public/icons`) dibuat dari ilustrasi beruang.

Gambar mockup asli tidak di-commit (`.gitignore`) karena berisi branding pihak lain.

## Breakpoint

Semua breakpoint memakai **lebar/tinggi layar, bukan orientasi**, sehingga rotasi, iPad Split View, dan Slide Over otomatis mendapat tata letak yang sesuai. Jangan memakai media query `orientation`.

| Kondisi | Perubahan |
|---|---|
| semua ukuran | Mingguan: 5 kartu Senin–Jumat + Self Care (2 kolom di HP). Sekilas Hari Ini: jadwal 09:00–20:00 dalam 2 kolom |
| ≤ 380px | Kartu Mingguan 1 kolom |
| ≥ 520px | Sekilas Hari Ini & daftar Ringkasan Bulanan jadi 2 kolom di dalam kartu |
| ≥ 640px | Konten maks. 760px; Harian 2 kolom |
| ≥ 1024px | Konten maks. 1120px. Beranda: Sekilas + Ringkasan berdampingan, semua kartu minggu (4–5) dalam satu baris. Mingguan: 3 kolom (Sen–Jum + Self Care = 2 baris rapi). Harian: jarak lebih lega |
| tinggi ≤ 500px | Menu bawah ringkas (ikon di samping label, `--nav-h: 50px`) |
| tinggi ≤ 500px & lebar ≥ 560px | Layar PIN: logo disembunyikan, info di kiri + keypad 58px di kanan |

## Safe area

`index.html` memakai `viewport-fit=cover`. Jarak dari notch/home indicator diatur lewat token `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right` (dari `env(safe-area-inset-*)`). Token ini dipakai di shell konten, menu bawah, toast, dan banner update.
