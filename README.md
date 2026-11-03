# Rumah Keluarga Dani

Website statis pusat video Keluarga Dani. HTML, CSS, dan JavaScript biasa, tanpa proses build.

`index.html` adalah menu awal dengan dua pilihan: game 3D tempat pengunjung berjalan di kampung dan di dalam rumah, atau web biasa di `beranda.html`. Game baru dimuat saat dipilih, dan `index.html#main` langsung masuk ke game. Peramban yang tidak mendukung WebGL otomatis diarahkan ke web biasa.

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

## Dunia 3D

Kode ada di `js/dunia/`, memakai Three.js yang sudah disalin ke `js/vendor/`.

| File | Isi |
| --- | --- |
| `main.js` | tempat, teman, benda yang bisa disapa, kontrol, kamera, dan panel |
| `rumah.js` | dinding, pintu, dan perabot rumah |
| `luar.js` | gang, tetangga, warung, mushola, lapangan, kebun belakang |
| `karakter.js` | karakter dan pose, disalin dari project video |
| `kucing.js` | kucing Pak Dani yang berkeliaran dan rutenya |
| `bangun.js` | alat gabung balok dan papan tulisan |

Isi panel diambil dari `data/members.json`, jadi video baru otomatis muncul saat keluarga disapa. Teks benda ada di daftar `BENDA` di `main.js`.

## Gambar

`assets/anggota/` dirender dari komposisi Remotion (`Ep12Rupiah` untuk Pak Dani, `TesKeluarga` untuk yang lain). `assets/ilustrasi/` digambar khusus untuk situs ini. Jangan diganti dengan logo atau aset merek lain.
