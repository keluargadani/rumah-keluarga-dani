# Rumah Keluarga Dani

Website statis pusat video Keluarga Dani. HTML, CSS, dan JavaScript biasa, tanpa proses build.

## Menjalankan

Situs memuat data lewat `fetch`, jadi tidak bisa dibuka dengan klik dua kali pada `index.html`. Dari folder ini:

```bash
node serve.mjs
```

Lalu buka http://localhost:4173.

## Mengisi data

Semua isi ada di `data/members.json`.

Link akun: isi `link` pada `akun`. Selama kosong, tombolnya tampil "segera hadir".

Video baru: tambahkan ke `video` milik anggota.

```json
{
  "judul": "Kenapa rupiah melemah",
  "link": "https://www.youtube.com/shorts/ID_VIDEO",
  "platform": "youtube",
  "tanggal": "2026-11-03",
  "thumbnail": "",
  "pilihan": true,
  "sumber": [
    { "judul": "Bank Indonesia: Kurs", "link": "https://www.bi.go.id/" }
  ]
}
```

| Kolom | Isi |
| --- | --- |
| `platform` | `youtube`, `instagram`, atau `tiktok` |
| `tanggal` | format `TAHUN-BULAN-TANGGAL`, dipakai untuk mengurutkan video terbaru |
| `thumbnail` | boleh kosong. YouTube otomatis. Untuk Instagram dan TikTok, taruh gambar di `assets/` lalu tulis path-nya, atau biarkan memakai gambar pengganti |
| `pilihan` | `true` supaya video tampil di Galeri |
| `sumber` | boleh dihapus. Daftar sumber informasi video, tampil di kartu video sebagai "Sumber" |

Anggota baru: tambahkan satu objek di `anggota`. Halamannya otomatis ada di `kamar.html?anggota=<id>`.

## Gambar

`assets/anggota/` dirender dari komposisi Remotion (`Ep12Rupiah` untuk Pak Dani, `TesKeluarga` untuk yang lain). `assets/ilustrasi/` digambar khusus untuk situs ini. Jangan diganti dengan logo atau aset merek lain.
