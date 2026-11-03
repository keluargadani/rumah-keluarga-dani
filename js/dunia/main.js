// Jalan-jalan di Rumah Keluarga Dani. Satu dunia tanpa layar muat antar ruangan.
import * as THREE from "three";
import { Bangun, bahanNyala, bahanUtama } from "./bangun.js";
import { buatOrang } from "./karakter.js";
import { buatKucingKeliling } from "./kucing.js";
import { atapPelana, pasangLuar } from "./luar.js";
import { pasangBendaHidup, pasangDinding, pasangPerabot } from "./rumah.js";

const { el, daftarVideo, kartuVideo, tautanAkun, semuaVideo, urutTerbaru, urlKamar, saringan, namaPlatform } = window.RumahDani;

/* ---------- Tempat, teman, dan benda ---------- */

const ZONA = [
  { nama: "Dapur", x1: 3, x2: 8, z1: -13, z2: -5.5, dalam: true },
  { nama: "Ruang Tengah", x1: -3, x2: 3, z1: -13, z2: -5.5, dalam: true },
  { nama: "Kamar Gempi", x1: -8, x2: -3, z1: -13, z2: -5.5, dalam: true },
  { nama: "Ruang Tamu", x1: -3, x2: 3, z1: -5.5, z2: 0, dalam: true },
  { nama: "Kamar Afdi", x1: -8, x2: -3, z1: -5.5, z2: 0, dalam: true },
  { nama: "Kamar Bapak Ibu", x1: 3, x2: 8, z1: -5.5, z2: 0, dalam: true },
  { nama: "Teras", x1: -4.4, x2: 4.4, z1: 0, z2: 2.8 },
  { nama: "Halaman Depan", x1: -11.5, x2: 11.5, z1: 0, z2: 3.4 },
  { nama: "Samping Rumah", x1: -11.5, x2: -8, z1: -13, z2: 0 },
  { nama: "Samping Rumah", x1: 8, x2: 11.5, z1: -13, z2: 0 },
  { nama: "Kebun Belakang", x1: -11.5, x2: 11.5, z1: -22, z2: -13 },
  { nama: "Warung", x1: -33.5, x2: -24.5, z1: -3, z2: 3.4 },
  { nama: "Mushola", x1: -46, x2: -35.5, z1: -8, z2: 3.4 },
  { nama: "Lapangan", x1: 24, x2: 46, z1: -14, z2: 3.4 },
  { nama: "Lapangan", x1: 24, x2: 46, z1: 8.6, z2: 21 },
  { nama: "Gang", x1: -46, x2: 46, z1: 3.4, z2: 8.6 },
];

const TEMPAT = [
  { nama: "Gang depan rumah", x: 0, z: 6, rot: Math.PI },
  { nama: "Teras", x: 0, z: 2, rot: Math.PI },
  { nama: "Ruang Tamu", x: 0, z: -1.5, rot: Math.PI },
  { nama: "Ruang Tengah", x: 0, z: -7.5, rot: Math.PI },
  { nama: "Dapur", x: 4, z: -8, rot: Math.PI / 2 },
  { nama: "Kamar Afdi", x: -3.8, z: -2.75, rot: -Math.PI / 2 },
  { nama: "Kamar Gempi", x: -3.8, z: -9, rot: -Math.PI / 2 },
  { nama: "Kamar Bapak Ibu", x: 3.8, z: -2.75, rot: Math.PI / 2 },
  { nama: "Kebun Belakang", x: 6.9, z: -14.5, rot: Math.PI },
  { nama: "Warung", x: -29, z: 4.5, rot: Math.PI },
  { nama: "Lapangan", x: 30, z: 5, rot: Math.PI / 2 },
];

const TEMAN = [
  { id: "pak-dani", nama: "Pak Dani", x: -2.9, z: 1.3, rot: 0.3, pose: "diam", ucapan: "Sini, Pak Dani kasih tau!", zona: ["Teras", "Halaman Depan"] },
  { id: "bu-dani", nama: "Bu Dani", x: 6.17, z: -10.45, rot: 0, pose: "mengaduk", ucapan: "Sini Ibu kasih tau!", zona: ["Dapur"] },
  { id: "afdi", nama: "Afdi", x: -5.4, z: -2.5, rot: 0.9, pose: "mainHp", ucapan: "Sini, gua kasih tau!", zona: ["Kamar Afdi"] },
  { id: "gempi", nama: "Gempi", x: -5.5, z: -9, rot: 1, pose: "mendongeng", ucapan: "Dengar deh, Gempi punya cerita!", zona: ["Kamar Gempi"] },
];

// Benda yang bisa diajak berinteraksi. Isinya hanya candaan pendek, bukan klaim apa pun.
const BENDA = [
  { x: -2.1, z: -11.3, r: 1.3, zona: "Ruang Tengah", label: "Nonton TV", jenis: "galeri" },
  { x: 1.2, z: -11.3, r: 1.5, zona: "Ruang Tengah", label: "Lihat foto dan sofa keluarga", jenis: "anggota", id: "keluarga" },
  { x: 7.3, z: -7, r: 1.2, zona: "Dapur", label: "Buka kulkas", teks: "Isinya sayur, telur, dan satu kotak yang kata Bu Dani jangan disentuh dulu." },
  { x: 4.3, z: -11.9, r: 1.2, zona: "Dapur", label: "Intip penanak nasi", teks: "Nasinya masih hangat. Baunya bikin lapar." },
  { x: 1.7, z: -8.1, r: 1.1, zona: "Ruang Tengah", label: "Buka tudung saji", teks: "Ada lauk untuk makan malam. Tutup lagi sebelum Bu Dani lihat." },
  { x: -5.1, z: -4, r: 1.1, zona: "Kamar Afdi", label: "Lihat layar komputer", teks: "Layarnya penuh bentuk warna-warni. Afdi bilang jangan dimatikan dulu." },
  { x: -7.2, z: -4.8, r: 1, zona: "Kamar Afdi", label: "Petik gitar", teks: "Jreng. Senarnya agak fals, tapi lumayan." },
  { x: -7.1, z: -8, r: 1.2, zona: "Kamar Gempi", label: "Lihat rak buku", teks: "Rak penuh buku cerita. Gempi hafal letak semuanya." },
  { x: -4.2, z: -11.1, r: 1.2, zona: "Kamar Gempi", label: "Lihat lukisan", teks: "Lukisan hutan yang belum selesai. Catnya masih basah." },
  { x: -6.3, z: -11.3, r: 1.1, zona: "Kamar Gempi", label: "Sapa mainan kancil", teks: "Mainan kancil ini teman baca Gempi. Tatapannya seperti sedang menyusun rencana." },
  { x: 5.2, z: -2.8, r: 1.1, zona: "Kamar Bapak Ibu", label: "Lihat kamar", teks: "Kamarnya rapi. Sebaiknya tetap begitu sampai kamu keluar." },
  { x: -1.55, z: 1.3, r: 0.9, zona: "Teras", label: "Cium aroma kopi", teks: "Kopi Pak Dani tinggal setengah. Kucingnya pura-pura tidak tahu." },
  { x: 6, z: 2.5, r: 1.2, zona: "Halaman Depan", label: "Lihat motor", teks: "Motornya bersih. Kuncinya tidak ada di sini, tenang saja." },
  { x: -9, z: 6.9, r: 1.3, zona: "Gang", label: "Hampiri gerobak", teks: "Kuahnya wangi sekali. Penjualnya lagi ke warung sebentar." },
  { x: -29, z: 1.7, r: 1.7, zona: "Warung", label: "Lihat dagangan", teks: "Toplesnya penuh jajanan. Warungnya ramai kalau sore." },
  { x: 26.5, z: 1.7, r: 1.5, zona: "Lapangan", label: "Duduk di pos ronda", teks: "Enak buat ngadem. Malam nanti giliran warga berjaga." },
  { x: 2.5, z: -16, r: 1.6, zona: "Kebun Belakang", label: "Pegang jemuran", teks: "Masih agak lembap. Biarkan dulu kena angin." },
  { x: -5.2, z: -16.4, r: 1.6, zona: "Kebun Belakang", label: "Lihat pohon mangga", teks: "Buahnya sudah menguning. Tunggu tanggal main." },
  { x: 8.5, z: -18.3, r: 1.2, zona: "Kebun Belakang", label: "Coba pompa air", teks: "Air mengalir sebentar lalu berhenti. Perlu dipompa lebih kuat." },
  { x: -9.3, z: -19, r: 1.3, zona: "Kebun Belakang", label: "Intip kandang ayam", teks: "Petok, petok. Belum ada telur hari ini." },
  { x: 35.5, z: -3, r: 1.3, zona: "Lapangan", label: "Tendang bola", teks: "Bolanya menggelinding sedikit. Gawangnya masih jauh." },
];

const SIMPAN_SAPA = "rumah-dani-sudah-disapa";
const bacaSapa = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SIMPAN_SAPA) ?? "[]"));
  } catch {
    return new Set();
  }
};
const simpanSapa = (sudah) => {
  try {
    localStorage.setItem(SIMPAN_SAPA, JSON.stringify([...sudah]));
  } catch {
    // Penyimpanan diblokir: daftar sapaan cukup berlaku sampai halaman ditutup.
  }
};

/* ---------- Pemeriksaan awal ---------- */

const kanvas = document.getElementById("kanvas-dunia");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: kanvas, antialias: true, powerPreference: "high-performance" });
} catch (galat) {
  // Peramban tanpa WebGL tetap bisa memakai versi halaman biasa.
  console.error(galat);
  location.replace("beranda.html");
  throw galat;
}

const adalahHp = matchMedia("(pointer: coarse)").matches;
document.body.classList.toggle("sentuh", adalahHp);

/* ---------- Bangun dunia ---------- */

await Promise.allSettled([document.fonts.load('800 40px "Baloo 2"'), document.fonts.ready]);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#CDEBF8");
scene.fog = new THREE.Fog("#CDEBF8", 42, 110);

const padat = [];
const d = { scene, padat, penutup: [], pintu: [], hidup: [], peta: [], dalam: new Bangun(padat), luar: new Bangun(padat) };

const dinding = pasangDinding(d);
pasangPerabot(d, dinding);
pasangBendaHidup(d);
pasangLuar(d);

// Atap rumah dan atap teras. Keduanya hilang saat pemain masuk atau tertutup dari kamera.
const atap = { b: new Bangun(padat), meshes: [], papan: [], tingkat: 1, atap: true };
atapPelana(atap.b, { x1: -8.6, x2: 8.6, z1: -13.7, z2: 0.7, yTepi: 2.92, yPuncak: 5.3, dinding: "#F7EAD3", dindingX1: -8, dindingX2: 8 });
atap.b.k([0, 3, -6.5], [16.2, 0.04, 13.2], "#FFFDF7");
d.penutup.push(atap);
const atapTeras = { b: new Bangun(padat), meshes: [], papan: [], tingkat: 1, atap: true };
atapTeras.b.di([0, 2.68, 1.75], [0.12, 0, 0], 1, () => {
  for (let i = 0; i < 6; i++) atapTeras.b.k([0, 0, -1.6 + i * 0.64], [9.2, 0.08, 0.66], i % 2 ? "#C98565" : "#B8704F");
});
atapTeras.b.k([0, 2.58, 2.5], [8.6, 0.12, 0.14], "#FFFDF7");
d.penutup.push(atapTeras);

// Rumah di peta kecil
d.peta.push([-8, -13, 8, 0, "#FFF0CF"]);

const bahan = bahanUtama();
scene.add(d.dalam.jadi(bahan));
scene.add(d.luar.jadi(bahan));
for (const b of [d.dalam, d.luar]) if (!b.nyala.kosong) scene.add(b.nyala.jadi(bahanNyala(), { bayangan: false }));

const bantuKotak = new THREE.Box3();
for (const p of d.penutup) {
  const m = bahanUtama();
  const mesh = p.b.jadi(m);
  mesh.geometry.computeBoundingBox();
  bantuKotak.copy(mesh.geometry.boundingBox);
  p.min = bantuKotak.min.clone();
  p.max = bantuKotak.max.clone();
  // Pucuk atap tetangga tidak perlu membuat seluruh rumah hilang.
  if (p.hilangPenuh) p.max.y -= 1.1;
  p.bahan = m;
  p.meshes.push(mesh);
  scene.add(mesh);
  if (p.daun) {
    const daun = p.daun.daun.jadi(m);
    p.daun.dalam.add(daun);
    p.meshes.push(daun);
    delete p.daun;
  }
}

/* ---------- Cahaya dan kamera ---------- */

const cahayaSekitar = new THREE.HemisphereLight("#FFFFFF", "#D9C7A6", 2.35);
scene.add(cahayaSekitar);
const warnaBawahLuar = new THREE.Color("#D9C7A6");
const warnaBawahDalam = new THREE.Color("#FFF6E6");
const matahari = new THREE.DirectionalLight("#FFF1D6", 1.9);
matahari.castShadow = true;
matahari.shadow.mapSize.setScalar(adalahHp ? 1024 : 2048);
matahari.shadow.camera.left = -26;
matahari.shadow.camera.right = 26;
matahari.shadow.camera.top = 26;
matahari.shadow.camera.bottom = -26;
matahari.shadow.camera.near = 1;
matahari.shadow.camera.far = 90;
matahari.shadow.bias = -0.0006;
matahari.shadow.normalBias = 0.03;
scene.add(matahari, matahari.target);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
let batasPiksel = Math.min(devicePixelRatio, adalahHp ? 1.5 : 2);
renderer.setPixelRatio(batasPiksel);

const kamera = new THREE.PerspectiveCamera(46, 1, 0.3, 240);
const gerakDikurangi = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Tes sudut pandang: mata pemain (orang pertama) atau kamera dari belakang (orang ketiga).
const TINGGI_MATA = 1.32;
let orangPertama = true;
let lihatPitch = 0;
let goyang = 0;
const kameraSet = { yaw: 0, pitch: 0.72, jarak: 9, tahan: 0, fokusX: 0, fokusZ: 6.2, majuX: 0, majuZ: 0, yawNyata: 0.5, pitchNyata: 1.02, jarakNyata: 15 };

const ukurUlang = () => {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h, false);
  kamera.aspect = w / h;
  kamera.fov = orangPertama ? (w < h ? 78 : 68) : w < h ? 58 : 46;
  kamera.near = orangPertama ? 0.1 : 0.3;
  kamera.far = orangPertama ? 150 : 240;
  kamera.updateProjectionMatrix();
};
addEventListener("resize", ukurUlang);
ukurUlang();

/* ---------- Orang ---------- */

const pemain = buatOrang("tamu");
scene.add(pemain.akar);
const P = { x: 0, z: 6.2, y: 0, vy: 0, rot: Math.PI, n: 0, jam: 0 };

const orang = TEMAN.map((t) => {
  const o = buatOrang(t.id, { tanpaKucing: true });
  o.akar.position.set(t.x, 0.02, t.z);
  o.akar.rotation.y = t.rot;
  scene.add(o.akar);
  padat.push({ x1: t.x - 0.42, x2: t.x + 0.42, z1: t.z - 0.42, z2: t.z + 0.42 });
  return { ...t, o, n: Math.random() * 500, rotNyata: t.rot };
});

const kucing = buatKucingKeliling(scene);

/* ---------- Tampilan di atas dunia ---------- */

const $ = (id) => document.getElementById(id);
const hud = $("hud");
const namaZona = $("nama-zona");
const tombolAksi = $("tombol-aksi");
const gelembung = $("gelembung");
const kabar = $("kabar");
const misi = $("misi");
const panel = $("panel");
const panelIsi = $("panel-isi");

let data = { anggota: [] };
let sudahDisapa = bacaSapa();
const JUMLAH_TEMAN = TEMAN.length;

const tulisMisi = () => {
  const n = TEMAN.filter((t) => sudahDisapa.has(t.id)).length;
  misi.textContent = n >= JUMLAH_TEMAN ? "Semua keluarga sudah disapa" : `Sapa keluarga: ${n} dari ${JUMLAH_TEMAN}`;
};
tulisMisi();

let waktuKabar;
const tampilKabar = (teks, lama = 4200) => {
  kabar.textContent = teks;
  kabar.classList.add("muncul");
  clearTimeout(waktuKabar);
  waktuKabar = setTimeout(() => kabar.classList.remove("muncul"), lama);
};

const bukaPanel = (judul, ...isi) => {
  if (document.pointerLockElement) document.exitPointerLock();
  panelIsi.replaceChildren(el("h2", {}, judul), ...isi);
  if (!panel.open) panel.showModal();
  panelIsi.parentElement.scrollTop = 0;
  bersihkanInput();
};
$("panel-tutup").addEventListener("click", () => panel.close());
panel.addEventListener("click", (e) => {
  if (e.target === panel) panel.close();
});

const panelAnggota = (id) => {
  const a = data.anggota.find((x) => x.id === id);
  if (!a) {
    bukaPanel("Belum bisa dibuka", el("p", {}, "Data keluarga belum termuat. Coba muat ulang halaman."));
    return;
  }
  const videos = urutTerbaru(a.video ?? []);
  const platforms = [...new Set(videos.map((v) => v.platform))];
  const pilihan = [{ label: "Semua" }, ...platforms.map((p) => ({ label: namaPlatform(p), platform: p }))];
  bukaPanel(
    a.nama,
    el(
      "div",
      { class: "panel-profil", style: `--aksen:${a.warna}` },
      el("img", { src: a.foto, alt: `Ilustrasi ${a.nama}` }),
      el(
        "div",
        {},
        el("p", { class: "sifat" }, a.sifat),
        el("p", {}, a.deskripsi),
        el("ul", { class: "chips" }, (a.topik ?? []).map((t) => el("li", {}, t))),
        el("div", { class: "baris-akun" }, (a.akun ?? []).map(tautanAkun)),
      ),
    ),
    el("h3", {}, "Video"),
    videos.length
      ? el("div", {}, saringan("Saring menurut platform", pilihan, (o) => daftarVideo(o.platform ? videos.filter((v) => v.platform === o.platform) : videos, false)))
      : el("p", { class: "kecil" }, "Videonya segera hadir. Mampir lagi nanti, ya."),
    el("p", { class: "panel-kaki" }, el("a", { href: urlKamar(a) }, `Buka halaman ${a.ruang}`)),
  );
};

const panelGaleri = () => {
  const videos = semuaVideo(data);
  const pemilik = data.anggota.filter((a) => videos.some((v) => v.anggota.id === a.id));
  const pilihan = [{ label: "Semua" }, ...pemilik.map((a) => ({ label: a.nama, id: a.id }))];
  bukaPanel(
    "Video keluarga",
    videos.length
      ? el("div", {}, saringan("Saring menurut anggota", pilihan, (o) => daftarVideo(o.id ? videos.filter((v) => v.anggota.id === o.id) : videos, true)))
      : el("p", { class: "kecil" }, "Videonya segera hadir."),
  );
};

const pindahKe = (t) => {
  P.x = t.x;
  P.z = t.z;
  P.rot = t.rot ?? P.rot;
  kameraSet.jarakNyata = kameraSet.jarak + 2;
  panel.close();
  tampilKabar(`Sampai di ${t.nama}.`, 2200);
};

const panelPeta = () => {
  bukaPanel(
    "Mau ke mana?",
    el("p", { class: "kecil" }, "Pilih tempat untuk langsung ke sana, atau jalan kaki saja kalau lagi santai."),
    el(
      "div",
      { class: "daftar-tempat" },
      TEMPAT.map((t) => el("button", { type: "button", class: "tombol tombol-kecil", onclick: () => pindahKe(t) }, t.nama)),
    ),
    el("h3", {}, "Cara main"),
    el(
      "ul",
      { class: "cara-main" },
      adalahHp
        ? [el("li", {}, "Geser lingkaran kiri untuk berjalan."), el("li", {}, "Geser layar untuk melihat sekeliling."), el("li", {}, "Tombol di kanan atas mengganti tampilan mata dan tampilan dari belakang."), el("li", {}, "Tombol di bawah muncul saat ada yang bisa disapa atau dilihat.")]
        : [el("li", {}, "WASD untuk berjalan, tahan Shift untuk berlari. Tombol V mengganti tampilan mata dan tampilan dari belakang."), el("li", {}, "Di tampilan mata, klik layar lalu gerakkan mouse untuk melihat sekeliling. Esc melepas mouse."), el("li", {}, "Spasi untuk melompat, E untuk menyapa atau melihat."), el("li", {}, "Geser mouse untuk memutar kamera, roda mouse untuk mendekat. Q dan R juga memutar kamera, C mengembalikannya ke belakangmu.")],
    ),
    el("p", { class: "panel-kaki" }, el("a", { href: "index.html" }, "Kembali ke menu awal"), " · ", el("a", { href: "beranda.html" }, "Buka web biasa")),
  );
};
$("tombol-peta").addEventListener("click", (e) => {
  e.currentTarget.blur();
  panelPeta();
});

const tombolSudut = $("tombol-sudut");
const pasangSudut = (pertama) => {
  orangPertama = pertama;
  document.body.classList.toggle("orang-pertama", pertama);
  tombolSudut.textContent = pertama ? "Lihat dari belakang" : "Lihat dari mata";
  pemain.akar.visible = !pertama;
  if (pertama) {
    // Melihat ke arah pemain menghadap.
    const beda = P.rot + Math.PI - kameraSet.yaw;
    kameraSet.yaw += Math.atan2(Math.sin(beda), Math.cos(beda));
    kameraSet.yawNyata = kameraSet.yaw;
    lihatPitch = 0;
  } else if (document.pointerLockElement) {
    document.exitPointerLock();
  }
  ukurUlang();
};
tombolSudut.addEventListener("click", (e) => {
  e.currentTarget.blur();
  pasangSudut(!orangPertama);
});

const jalankanAksi = (a) => {
  if (!a) return;
  if (a.kucing) {
    tampilKabar(kucing.elus());
  } else if (a.teman) {
    if (!sudahDisapa.has(a.teman.id)) {
      sudahDisapa.add(a.teman.id);
      simpanSapa(sudahDisapa);
      tulisMisi();
      if (TEMAN.every((t) => sudahDisapa.has(t.id))) tampilKabar("Semua sudah kamu sapa. Silakan lanjut jalan-jalan.");
    }
    panelAnggota(a.teman.id);
  } else if (a.jenis === "galeri") panelGaleri();
  else if (a.jenis === "anggota") panelAnggota(a.id);
  else tampilKabar(a.teks);
};
tombolAksi.addEventListener("click", () => {
  // Fokus dilepas supaya spasi berikutnya melompat, bukan menekan tombol ini lagi.
  tombolAksi.blur();
  jalankanAksi(aksiDekat);
});

/* ---------- Masukan ---------- */

const tombol = new Set();
const joy = { aktif: false, id: null, ax: 0, ay: 0, x: 0, y: 0 };
const bersihkanInput = () => {
  tombol.clear();
  joy.aktif = false;
  joy.x = joy.y = 0;
  $("joy-kenop").style.transform = "";
};
addEventListener("blur", bersihkanInput);

let main = false;
let lompatMinta = false;

addEventListener("keydown", (e) => {
  if (panel.open || document.querySelector("dialog[open]") || !main) return;
  const k = e.key.toLowerCase();
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if (e.repeat) return;
  tombol.add(k);
  if (k === " ") lompatMinta = true;
  if (k === "e" || k === "enter") {
    e.preventDefault();
    jalankanAksi(aksiDekat);
  }
  if (k === "m") panelPeta();
  if (k === "v") pasangSudut(!orangPertama);
  if (k === "c") {
    const beda = P.rot + Math.PI - kameraSet.yaw;
    kameraSet.yaw += Math.atan2(Math.sin(beda), Math.cos(beda));
    kameraSet.tahan = 0;
  }
});
addEventListener("keyup", (e) => tombol.delete(e.key.toLowerCase()));

// Geser layar untuk memutar kamera, cubit atau roda untuk mendekat.
const penunjuk = new Map();
let cubitAwal = 0;
document.addEventListener("pointerlockchange", () => penunjuk.clear());
document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== kanvas) return;
  kameraSet.yaw -= e.movementX * 0.0022;
  lihatPitch = THREE.MathUtils.clamp(lihatPitch - e.movementY * 0.0022, -1.25, 1.25);
});
kanvas.addEventListener("pointerdown", (e) => {
  if (document.pointerLockElement) return;
  try {
    kanvas.setPointerCapture(e.pointerId);
  } catch {
    // Geser tetap jalan selama penunjuk ada di atas kanvas.
  }
  if (orangPertama && e.pointerType === "mouse") {
    // Kalau peramban menolak, geser mouse sambil ditekan tetap bisa dipakai.
    kanvas.requestPointerLock?.()?.catch?.(() => {});
  }
  penunjuk.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (penunjuk.size === 2) {
    const [a, b] = [...penunjuk.values()];
    cubitAwal = Math.hypot(a.x - b.x, a.y - b.y);
  }
});
kanvas.addEventListener("pointermove", (e) => {
  const lama = penunjuk.get(e.pointerId);
  if (!lama) return;
  if (penunjuk.size === 1 && orangPertama) {
    // Pemandangan mengikuti jari.
    kameraSet.yaw += (e.clientX - lama.x) * 0.005;
    lihatPitch = THREE.MathUtils.clamp(lihatPitch + (e.clientY - lama.y) * 0.004, -1.25, 1.25);
  } else if (penunjuk.size === 1) {
    kameraSet.yaw -= (e.clientX - lama.x) * 0.0045;
    kameraSet.pitch = THREE.MathUtils.clamp(kameraSet.pitch + (e.clientY - lama.y) * 0.003, 0.32, 1.35);
    kameraSet.tahan = 2.5;
  }
  lama.x = e.clientX;
  lama.y = e.clientY;
  if (penunjuk.size === 2) {
    const [a, b] = [...penunjuk.values()];
    const jarak = Math.hypot(a.x - b.x, a.y - b.y);
    kameraSet.jarak = THREE.MathUtils.clamp(kameraSet.jarak - (jarak - cubitAwal) * 0.02, 4, 15);
    cubitAwal = jarak;
  }
});
const lepasPenunjuk = (e) => penunjuk.delete(e.pointerId);
kanvas.addEventListener("pointerup", lepasPenunjuk);
kanvas.addEventListener("pointercancel", lepasPenunjuk);
kanvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  kameraSet.jarak = THREE.MathUtils.clamp(kameraSet.jarak + e.deltaY * 0.008, 4, 15);
}, { passive: false });

// Lingkaran kendali untuk layar sentuh
const joyEl = $("joy");
const joyKenop = $("joy-kenop");
const JOY_R = 46;
joyEl.addEventListener("pointerdown", (e) => {
  joyEl.setPointerCapture(e.pointerId);
  const r = joyEl.getBoundingClientRect();
  joy.aktif = true;
  joy.id = e.pointerId;
  joy.ax = r.left + r.width / 2;
  joy.ay = r.top + r.height / 2;
  gerakJoy(e);
});
const gerakJoy = (e) => {
  if (!joy.aktif || e.pointerId !== joy.id) return;
  let dx = e.clientX - joy.ax;
  let dy = e.clientY - joy.ay;
  const pj = Math.hypot(dx, dy);
  if (pj > JOY_R) {
    dx = (dx / pj) * JOY_R;
    dy = (dy / pj) * JOY_R;
  }
  joy.x = dx / JOY_R;
  joy.y = dy / JOY_R;
  joyKenop.style.transform = `translate(${dx}px, ${dy}px)`;
};
joyEl.addEventListener("pointermove", gerakJoy);
const lepasJoy = () => {
  joy.aktif = false;
  joy.x = joy.y = 0;
  joyKenop.style.transform = "";
};
joyEl.addEventListener("pointerup", lepasJoy);
joyEl.addEventListener("pointercancel", lepasJoy);
$("tombol-lompat").addEventListener("pointerdown", () => {
  lompatMinta = true;
});

/* ---------- Tabrakan dan penutup kamera ---------- */

const RADIUS = 0.27;

const dorongKeluar = () => {
  for (let ulang = 0; ulang < 2; ulang++) {
    for (const k of padat) {
      const cx = Math.max(k.x1, Math.min(P.x, k.x2));
      const cz = Math.max(k.z1, Math.min(P.z, k.z2));
      let dx = P.x - cx;
      let dz = P.z - cz;
      const j2 = dx * dx + dz * dz;
      if (j2 >= RADIUS * RADIUS) continue;
      if (j2 > 1e-8) {
        const j = Math.sqrt(j2);
        P.x = cx + (dx / j) * RADIUS;
        P.z = cz + (dz / j) * RADIUS;
      } else {
        // Titik pusat ada di dalam benda: keluar lewat sisi terdekat.
        const kiri = P.x - k.x1;
        const kanan = k.x2 - P.x;
        const atas = P.z - k.z1;
        const bawah = k.z2 - P.z;
        const min = Math.min(kiri, kanan, atas, bawah);
        if (min === kiri) P.x = k.x1 - RADIUS;
        else if (min === kanan) P.x = k.x2 + RADIUS;
        else if (min === atas) P.z = k.z1 - RADIUS;
        else P.z = k.z2 + RADIUS;
      }
    }
  }
  P.x = THREE.MathUtils.clamp(P.x, -45.6, 45.6);
  P.z = THREE.MathUtils.clamp(P.z, -21.6, 20.6);
};

// Garis dari kamera ke titik pada tubuh pemain menembus kotak?
const garisKenaKotak = (a, b, min, max) => {
  let t0 = 0;
  let t1 = 1;
  for (const s of ["x", "y", "z"]) {
    const d0 = b[s] - a[s];
    if (Math.abs(d0) < 1e-6) {
      if (a[s] < min[s] || a[s] > max[s]) return false;
      continue;
    }
    let t2 = (min[s] - a[s]) / d0;
    let t3 = (max[s] - a[s]) / d0;
    if (t2 > t3) [t2, t3] = [t3, t2];
    t0 = Math.max(t0, t2);
    t1 = Math.min(t1, t3);
    if (t0 > t1) return false;
  }
  return true;
};

const titikTubuh = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

const perbaruiPenutup = (dt, diDalam) => {
  const kanan = new THREE.Vector3(Math.cos(kameraSet.yawNyata), 0, -Math.sin(kameraSet.yawNyata));
  titikTubuh[0].set(P.x, 1.3, P.z);
  titikTubuh[1].set(P.x, 0.3, P.z);
  titikTubuh[2].set(P.x, 1, P.z).addScaledVector(kanan, 0.6);
  titikTubuh[3].set(P.x, 1, P.z).addScaledVector(kanan, -0.6);
  for (const p of d.penutup) {
    let kena = false;
    for (const t of titikTubuh) {
      if (garisKenaKotak(kamera.position, t, p.min, p.max)) {
        kena = true;
        break;
      }
    }
    // Jeda sebelum muncul lagi, supaya dinding tidak berkedip saat berjalan di dekatnya.
    p.jeda = kena ? 0.4 : Math.max(0, (p.jeda ?? 0) - dt);
    const tertutup = p.jeda > 0;
    const tujuan = orangPertama ? 1 : p.atap && diDalam ? 0 : tertutup ? (p.atap || p.hilangPenuh ? 0 : 0.14) : 1;
    if (p.tingkat === tujuan) continue;
    const langkah = dt * 3.5;
    p.tingkat = p.tingkat < tujuan ? Math.min(tujuan, p.tingkat + langkah) : Math.max(tujuan, p.tingkat - langkah);
    const tembus = p.tingkat < 0.999;
    if (p.bahan.transparent !== tembus) {
      p.bahan.transparent = tembus;
      p.bahan.depthWrite = !tembus;
      p.bahan.needsUpdate = true;
    }
    p.bahan.opacity = p.tingkat;
    for (const m of p.meshes) m.visible = p.tingkat > 0.02;
    for (const m of p.papan) m.visible = p.tingkat > 0.5;
  }
};

const zonaDi = (x, z) => ZONA.find((a) => x >= a.x1 && x <= a.x2 && z >= a.z1 && z <= a.z2);

/* ---------- Peta kecil ---------- */

const peta = $("peta-kecil");
const g = peta.getContext("2d");
const SKALA_PETA = 2.6;
const gambarPeta = () => {
  const w = peta.width;
  const h = peta.height;
  const s = SKALA_PETA * (w / 132);
  const kx = (x) => w / 2 + (x - P.x) * s;
  const kz = (z) => h / 2 + (z - P.z) * s;
  g.fillStyle = "#C6D8A8";
  g.fillRect(0, 0, w, h);
  for (const [x1, z1, x2, z2, warna] of d.peta) {
    g.fillStyle = warna;
    g.fillRect(kx(x1), kz(z1), (x2 - x1) * s, (z2 - z1) * s);
  }
  // Sekat kamar
  g.fillStyle = "#B99A70";
  for (const [x1, z1, x2, z2] of [[-8, -13, -3, -13], [-8, 0, 8, 0], [-8, -13, -8, 0], [8, -13, 8, 0], [-3, -13, -3, 0], [3, -13, 3, 0], [-8, -5.5, 8, -5.5], [-3, -13, 8, -13]]) {
    g.fillRect(kx(x1) - 1, kz(z1) - 1, Math.max(2, (x2 - x1) * s + 2), Math.max(2, (z2 - z1) * s + 2));
  }
  for (const t of orang) {
    const a = data.anggota.find((x) => x.id === t.id);
    g.fillStyle = a?.warna ?? "#3A2A1E";
    g.beginPath();
    g.arc(kx(t.x), kz(t.z), 4.5 * (w / 132), 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#F7941D";
  g.strokeStyle = "#FFFDF8";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(kx(kucing.x), kz(kucing.z), 3.5 * (w / 132), 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Pemain: segitiga searah hadap
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(-P.rot + Math.PI);
  g.fillStyle = "#F26B3A";
  g.strokeStyle = "#FFFDF8";
  g.lineWidth = 2;
  const u = 7 * (w / 132);
  g.beginPath();
  g.moveTo(0, -u);
  g.lineTo(u * 0.8, u * 0.8);
  g.lineTo(-u * 0.8, u * 0.8);
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
};

/* ---------- Putaran utama ---------- */

let aksiDekat = null;
let zonaIni = null;
let t = 0;
let akhir = performance.now();
let lambatJumlah = 0;
let lambatWaktu = 0;
let bingkai = 0;
const bantuProyeksi = new THREE.Vector3();

const langkah = (sekarang) => {
  requestAnimationFrame(langkah);
  const dt = Math.min(0.05, (sekarang - akhir) / 1000);
  akhir = sekarang;
  t += dt;
  bingkai++;

  // Kualitas turun sendiri kalau perangkat kewalahan.
  lambatWaktu += dt;
  lambatJumlah++;
  if (lambatWaktu > 3) {
    const fps = lambatJumlah / lambatWaktu;
    if (fps < 26) {
      if (batasPiksel > 1) {
        batasPiksel = Math.max(1, batasPiksel - 0.5);
        renderer.setPixelRatio(batasPiksel);
        ukurUlang();
      } else if (renderer.shadowMap.enabled) {
        renderer.shadowMap.enabled = false;
        matahari.castShadow = false;
        scene.traverse((o) => {
          if (o.material) o.material.needsUpdate = true;
        });
      }
    }
    lambatWaktu = 0;
    lambatJumlah = 0;
  }

  const bisaGerak = main && !document.querySelector("dialog[open]");

  // Gerak pemain mengikuti arah kamera
  let ix = 0;
  let iy = 0;
  let lari = false;
  if (bisaGerak) {
    if (tombol.has("w") || tombol.has("arrowup")) iy += 1;
    if (tombol.has("s") || tombol.has("arrowdown")) iy -= 1;
    if (tombol.has("a")) ix -= 1;
    if (tombol.has("d")) ix += 1;
    if (orangPertama) {
      // Panah kiri dan kanan menoleh, A dan D melangkah ke samping.
      if (tombol.has("arrowleft")) kameraSet.yaw += dt * 1.9;
      if (tombol.has("arrowright")) kameraSet.yaw -= dt * 1.9;
    } else {
      if (tombol.has("arrowleft")) ix -= 1;
      if (tombol.has("arrowright")) ix += 1;
    }
    lari = tombol.has("shift");
    if (tombol.has("q")) {
      kameraSet.yaw += dt * 1.6;
      kameraSet.tahan = 2.5;
    }
    if (tombol.has("r")) {
      kameraSet.yaw -= dt * 1.6;
      kameraSet.tahan = 2.5;
    }
    if (joy.aktif) {
      ix = joy.x;
      iy = -joy.y;
      lari = Math.hypot(joy.x, joy.y) > 0.92;
    }
  }
  const panjang = Math.hypot(ix, iy);
  if (panjang > 1) {
    ix /= panjang;
    iy /= panjang;
  }
  const gerak = Math.min(1, panjang) > 0.08;
  if (gerak) {
    const s = Math.sin(kameraSet.yaw);
    const c = Math.cos(kameraSet.yaw);
    const vx = ix * c - iy * s;
    const vz = -ix * s - iy * c;
    const laju = (lari ? 4.6 : 2.7) * dt;
    P.x += vx * laju;
    P.z += vz * laju;
    dorongKeluar();
    P.n += laju * (lari ? 8.5 : 11.5);
    if (!orangPertama) {
      const tujuan = Math.atan2(vx, vz);
      let beda = tujuan - P.rot;
      beda = Math.atan2(Math.sin(beda), Math.cos(beda));
      P.rot += beda * Math.min(1, dt * 12);
    }
    kameraSet.majuX += (vx - kameraSet.majuX) * Math.min(1, dt * 2);
    kameraSet.majuZ += (vz - kameraSet.majuZ) * Math.min(1, dt * 2);
    // Di luar rumah kamera menyusul ke belakang pemain, kecuali saat pemain berjalan ke arahnya.
    // Di dalam rumah kamera diam, supaya arah ruangan tidak ikut berputar.
    if (!orangPertama && !gerakDikurangi && kameraSet.tahan <= 0 && !zonaDi(P.x, P.z)?.dalam) {
      const selisih = Math.atan2(Math.sin(P.rot + Math.PI - kameraSet.yaw), Math.cos(P.rot + Math.PI - kameraSet.yaw));
      if (Math.abs(selisih) < 2) kameraSet.yaw += Math.sign(selisih) * Math.min(Math.abs(selisih), dt * 0.45 * Math.min(1, Math.abs(selisih) / 0.7));
    }
  } else {
    kameraSet.majuX -= kameraSet.majuX * Math.min(1, dt * 2);
    kameraSet.majuZ -= kameraSet.majuZ * Math.min(1, dt * 2);
  }
  kameraSet.tahan = Math.max(0, kameraSet.tahan - dt);
  if (orangPertama) P.rot = kameraSet.yaw + Math.PI;
  goyang += ((gerak && P.y === 0 && !gerakDikurangi ? 1 : 0) - goyang) * Math.min(1, dt * 8);

  // Lompat
  if (lompatMinta && P.y === 0 && bisaGerak) P.vy = 4.1;
  lompatMinta = false;
  if (P.vy !== 0 || P.y > 0) {
    P.vy -= 11 * dt;
    P.y += P.vy * dt;
    if (P.y <= 0) {
      P.y = 0;
      P.vy = 0;
    }
  }

  pemain.pose(P.y > 0 ? "lompat" : gerak ? "jalan" : "diam");
  P.jam += dt * 30;
  pemain.gerak(gerak ? P.n : P.jam, dt);
  pemain.akar.position.set(P.x, 0.02 + P.y, P.z);
  pemain.akar.rotation.y = P.rot;

  // Tempat sekarang
  const zona = zonaDi(P.x, P.z);
  if (zona && zona.nama !== zonaIni) {
    zonaIni = zona.nama;
    namaZona.textContent = zona.nama;
    namaZona.classList.remove("ganti");
    void namaZona.offsetWidth;
    namaZona.classList.add("ganti");
  }
  const diDalam = !!zona?.dalam;

  // Pintu terbuka sendiri saat didekati
  for (const p of d.pintu) {
    const dekat = Math.hypot(P.x - p.x, P.z - p.z) < 1.9 || Math.hypot(kucing.x - p.x, kucing.z - p.z) < 1.1;
    const tujuan = dekat ? 1 : 0;
    p.buka += (tujuan - p.buka) * Math.min(1, dt * 7);
    p.dalam.rotation.y = p.ayun * p.buka * 1.55;
  }

  // Di mata pemain, hanya yang ada di depan yang bisa disapa.
  const diDepan = (x, z, jarak) => {
    if (!orangPertama || jarak < 0.6) return true;
    return (-Math.sin(kameraSet.yaw) * (x - P.x) - Math.cos(kameraSet.yaw) * (z - P.z)) / jarak > 0.3;
  };

  // Keluarga
  let terdekat = null;
  let jarakTerdekat = Infinity;
  for (const o of orang) {
    const jarak = Math.hypot(P.x - o.x, P.z - o.z);
    const sezona = o.zona.includes(zona?.nama);
    const dekat = jarak < 3.2 && sezona;
    o.n += dt * 30;
    o.o.pose(dekat && !sudahDisapa.has(o.id) ? "melambai" : o.pose);
    o.o.gerak(o.n, dt);
    const arah = dekat ? Math.atan2(P.x - o.x, P.z - o.z) : o.rot;
    let beda = arah - o.rotNyata;
    beda = Math.atan2(Math.sin(beda), Math.cos(beda));
    o.rotNyata += beda * Math.min(1, dt * 4);
    o.o.akar.rotation.y = o.rotNyata;
    if (sezona && jarak < 1.9 && jarak < jarakTerdekat && diDepan(o.x, o.z, jarak)) {
      terdekat = o;
      jarakTerdekat = jarak;
    }
  }

  kucing.gerak(t, dt, P);
  const jarakKucing = Math.hypot(P.x - kucing.x, P.z - kucing.z);
  const kucingDekat = jarakKucing < 1.3 && zonaDi(kucing.x, kucing.z)?.nama === zona?.nama && diDepan(kucing.x, kucing.z, jarakKucing);

  // Yang bisa disentuh paling dekat
  aksiDekat = null;
  if (terdekat) {
    aksiDekat = { teman: terdekat, label: `Ngobrol dengan ${terdekat.nama}` };
  } else if (kucingDekat) {
    aksiDekat = { kucing: true, label: "Elus kucing Pak Dani" };
  } else if (zona) {
    let terbaik = Infinity;
    for (const b of BENDA) {
      if (b.zona !== zona.nama) continue;
      const j = Math.hypot(P.x - b.x, P.z - b.z);
      if (j < b.r && j < terbaik && diDepan(b.x, b.z, j)) {
        aksiDekat = b;
        terbaik = j;
      }
    }
  }
  if (main) {
    const label = aksiDekat?.label ?? "";
    if (tombolAksi.dataset.label !== label) {
      tombolAksi.dataset.label = label;
      tombolAksi.querySelector("span").textContent = label;
      tombolAksi.hidden = !label;
    }
  }

  for (const f of d.hidup) f(t, dt);

  // Kamera
  const pitchTujuan = !main ? 1.02 : diDalam ? Math.max(kameraSet.pitch, 0.95) : kameraSet.pitch;
  const jarakTujuan = !main ? 15 : diDalam ? Math.min(kameraSet.jarak, 7.6) : kameraSet.jarak;
  const halus = Math.min(1, dt * 2.5);
  if (!main) kameraSet.yaw += dt * 0.08;
  kameraSet.yawNyata += (kameraSet.yaw - kameraSet.yawNyata) * Math.min(1, dt * 9);
  kameraSet.pitchNyata += (pitchTujuan - kameraSet.pitchNyata) * halus;
  kameraSet.jarakNyata += (jarakTujuan - kameraSet.jarakNyata) * halus;
  const cp = Math.cos(kameraSet.pitchNyata);
  const pusatY = 1 + P.y * 0.12;
  const fokusTujuanX = P.x + kameraSet.majuX * 1.1;
  const fokusTujuanZ = P.z + kameraSet.majuZ * 1.1;
  if (Math.hypot(fokusTujuanX - kameraSet.fokusX, fokusTujuanZ - kameraSet.fokusZ) > 6) {
    // Pindah tempat lewat peta: kamera langsung ikut.
    kameraSet.fokusX = fokusTujuanX;
    kameraSet.fokusZ = fokusTujuanZ;
  } else {
    kameraSet.fokusX += (fokusTujuanX - kameraSet.fokusX) * Math.min(1, dt * 6);
    kameraSet.fokusZ += (fokusTujuanZ - kameraSet.fokusZ) * Math.min(1, dt * 6);
  }
  kamera.position.set(
    kameraSet.fokusX + Math.sin(kameraSet.yawNyata) * cp * kameraSet.jarakNyata,
    pusatY + Math.sin(kameraSet.pitchNyata) * kameraSet.jarakNyata,
    kameraSet.fokusZ + Math.cos(kameraSet.yawNyata) * cp * kameraSet.jarakNyata,
  );
  kamera.lookAt(kameraSet.fokusX, pusatY, kameraSet.fokusZ);

  if (orangPertama) {
    // Menimpa posisi kamera belakang: mata pemain, dengan goyangan kecil saat melangkah.
    kameraSet.yawNyata = kameraSet.yaw;
    const mataY = TINGGI_MATA + P.y + Math.sin((P.n * Math.PI * 2) / 14) * 0.022 * goyang;
    const cl = Math.cos(lihatPitch);
    kamera.position.set(P.x, mataY, P.z);
    kamera.lookAt(P.x - Math.sin(kameraSet.yaw) * cl, mataY + Math.sin(lihatPitch), P.z - Math.cos(kameraSet.yaw) * cl);
  }

  const cerah = orangPertama && diDalam ? 1 : 0;
  const lajuCahaya = Math.min(1, dt * 4);
  cahayaSekitar.intensity += (2.35 + cerah * 0.85 - cahayaSekitar.intensity) * lajuCahaya;
  cahayaSekitar.groundColor.lerp(cerah ? warnaBawahDalam : warnaBawahLuar, lajuCahaya);

  perbaruiPenutup(dt, diDalam);

  // Bayangan mengikuti pemain, dengan langkah tetap supaya tepinya tidak bergetar.
  const sx = Math.round(P.x / 2) * 2;
  const sz = Math.round(P.z / 2) * 2;
  matahari.position.set(sx + 20, 34, sz + 16);
  matahari.target.position.set(sx, 0, sz);

  // Gelembung ucapan di atas teman yang dekat
  if (terdekat && main && !document.querySelector("dialog[open]")) {
    bantuProyeksi.set(terdekat.x, orangPertama ? 1.95 : 2.1, terdekat.z).project(kamera);
    gelembung.hidden = bantuProyeksi.z > 1;
    gelembung.textContent = terdekat.ucapan;
    gelembung.style.transform = `translate(calc(${((bantuProyeksi.x + 1) / 2) * innerWidth}px - 50%), calc(${Math.max($("kanan-atas").getBoundingClientRect().bottom + 12 + gelembung.offsetHeight, ((1 - bantuProyeksi.y) / 2) * innerHeight)}px - 100%))`;
  } else {
    gelembung.hidden = true;
  }

  if (bingkai % 2 === 0) gambarPeta();
  renderer.render(scene, kamera);
};

/* ---------- Mulai ---------- */

const mulaiMain = () => {
  main = true;
  document.body.classList.add("sedang-main");
  $("layar-depan").hidden = true;
  hud.hidden = false;
  kameraSet.yaw = 0;
  kameraSet.yawNyata = ((kameraSet.yawNyata + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  P.jam = 0;
  pasangSudut(true);
  tampilKabar(adalahHp ? "Geser lingkaran kiri untuk berjalan, geser layar untuk melihat. Pak Dani ada di teras." : "WASD untuk berjalan, klik layar lalu gerakkan mouse untuk melihat. Tombol V mengganti sudut pandang.", 6000);
  kanvas.focus({ preventScroll: true });
};

// Isi data keluarga dimuat di belakang. Dunia tetap jalan kalau gagal.
fetch("data/members.json")
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((isi) => {
    data = isi;
  })
  .catch((galat) => console.error(galat));

mulaiMain();
requestAnimationFrame(langkah);

if (location.hostname === "localhost") window.__dunia = { P, d, kucing, kamera, kameraSet, TEMPAT, pindahKe, renderer };
