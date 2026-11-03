// Kampung di sekitar rumah: gang, halaman, tetangga, warung, mushola, lapangan, kebun belakang.
import * as THREE from "three";
import { Bangun, papanTulis } from "./bangun.js";

const GENTENG = "#C98565";
const GENTENG_TUA = "#B8704F";

// Atap pelana dengan deretan genteng. Bubungan sejajar sumbu x.
export const atapPelana = (b, { x1, x2, z1, z2, yTepi, yPuncak, dinding, dindingX1, dindingX2 }) => {
  const zTengah = (z1 + z2) / 2;
  const lebar = x2 - x1;
  const separuh = (z2 - z1) / 2;
  const naik = yPuncak - yTepi;
  const miring = Math.hypot(separuh, naik);
  const sudut = Math.atan2(naik, separuh);
  const baris = Math.max(4, Math.round(miring / 0.42));
  for (const sisi of [-1, 1]) {
    b.di([(x1 + x2) / 2, (yTepi + yPuncak) / 2, zTengah + (sisi * separuh) / 2], [sisi * sudut, 0, 0], 1, () => {
      for (let i = 0; i < baris; i++) {
        const u = -miring / 2 + ((i + 0.5) / baris) * miring;
        b.k([0, 0, u], [lebar, 0.1, miring / baris + 0.02], i % 2 === 0 ? GENTENG : GENTENG_TUA);
      }
    });
  }
  b.k([(x1 + x2) / 2, yPuncak + 0.03, zTengah], [lebar + 0.05, 0.14, 0.34], "#A85F42");
  if (dinding) {
    for (const x of [dindingX1, dindingX2]) {
      b.segitiga([x, yTepi + 0.02, zTengah - separuh + 0.1], [x, yTepi + 0.02, zTengah + separuh - 0.1], [x, yPuncak, zTengah], dinding);
    }
  }
};

const rumahTetangga = (d, { x, z, lebar, dalam, warna, hadap = 1, tinggi = 2.9, warnaPintu = "#B08A68" }) => {
  // Rumah tetangga yang menghalangi kamera hilang penuh, bukan transparan.
  const p = { b: new Bangun(d.padat), meshes: [], papan: [], tingkat: 1, hilangPenuh: true };
  d.penutup.push(p);
  const b = p.b;
  // Lantai dan pangkal dinding tetap ada saat rumah hilang dari pandangan kamera.
  d.luar.k([x, 0.01, z], [lebar, 0.02, dalam], "#E9D9BD");
  for (const s of [-1, 1]) {
    d.luar.k([x, 0.2, z + (s * dalam) / 2], [lebar, 0.4, 0.14], warna);
    d.luar.k([x + (s * lebar) / 2, 0.2, z], [0.14, 0.4, dalam], warna);
  }
  b.k([x, tinggi / 2, z], [lebar, tinggi, dalam], warna);
  b.padat(x, z, lebar, dalam);
  const muka = z + (hadap * dalam) / 2 + hadap * 0.03;
  b.k([x, 0.3, muka], [lebar, 0.6, 0.04], "#DCE7E0");
  b.k([x - lebar * 0.24, 1.05, muka + hadap * 0.01], [1.05, 2.1, 0.05], warnaPintu);
  b.k([x - lebar * 0.24, 1.05, muka + hadap * 0.03], [0.8, 1.8, 0.03], warnaPintu === "#B08A68" ? "#C09A78" : "#FFFFFF");
  b.k([x + lebar * 0.2, 1.6, muka + hadap * 0.01], [1.5, 1.2, 0.05], "#FFFFFF");
  b.k([x + lebar * 0.2, 1.6, muka + hadap * 0.03], [1.32, 1.02, 0.03], "#A9C7D8");
  for (const f of [-0.45, -0.15, 0.15, 0.45]) b.k([x + lebar * 0.2 + f, 1.6, muka + hadap * 0.05], [0.025, 1.02, 0.025], "#6F7D88");
  atapPelana(b, { x1: x - lebar / 2 - 0.25, x2: x + lebar / 2 + 0.25, z1: z - dalam / 2 - 0.5, z2: z + dalam / 2 + 0.5, yTepi: tinggi - 0.1, yPuncak: tinggi + 1.7, dinding: warna, dindingX1: x - lebar / 2, dindingX2: x + lebar / 2 });
  d.peta.push([x - lebar / 2, z - dalam / 2, x + lebar / 2, z + dalam / 2, "#D9BFA3"]);
  return b;
};

const pohon = (b, x, z, s = 1, buah = null) => {
  b.t([x, 1.1 * s, z], 0.14 * s, 0.24 * s, 2.2 * s, "#A58763", null, 8);
  b.o([x, 3 * s, z], 1.35 * s, "#86C48F");
  b.o([x + 0.8 * s, 2.5 * s, z + 0.3 * s], 0.85 * s, "#74B77F");
  b.o([x - 0.75 * s, 2.55 * s, z - 0.35 * s], 0.9 * s, "#94CF9C");
  if (buah) {
    for (let i = 0; i < 9; i++) {
      const a = i * 1.9;
      b.o([x + Math.cos(a) * 1.05 * s, 2.3 * s + (i % 3) * 0.4, z + Math.sin(a) * 1.05 * s], 0.09, buah, [0.9, 1.2, 0.9], 6);
    }
  }
  b.padat(x, z, 0.5 * s, 0.5 * s);
};

const pot = (b, x, z, warna = "#7DBB86") => {
  b.t([x, 0.13, z], 0.14, 0.1, 0.26, "#C98A63", null, 10);
  b.o([x, 0.42, z], 0.2, warna, null, 8);
  b.padat(x, z, 0.32, 0.32);
};

const tiangListrik = (b, x, z) => {
  b.t([x, 3.2, z], 0.07, 0.09, 6.4, "#8E979D", null, 8);
  b.k([x, 5.9, z], [0.08, 0.08, 1.1], "#6F7D88");
  b.k([x, 5.2, z + 0.1], [0.22, 0.34, 0.18], "#AEB6BC");
  b.padat(x, z, 0.24, 0.24);
};

const motor = (b, warna = "#E23D3D") => {
  for (const x of [-0.58, 0.58]) {
    b.t([x, 0.27, 0], 0.27, 0.27, 0.09, "#22272E", [Math.PI / 2, 0, 0], 14);
    b.t([x, 0.27, 0], 0.13, 0.13, 0.1, "#AEB6BC", [Math.PI / 2, 0, 0], 10);
  }
  b.k([0, 0.45, 0], [0.8, 0.3, 0.22], warna);
  b.k([-0.2, 0.68, 0], [0.75, 0.13, 0.26], "#2A1F1A");
  b.k([0.46, 0.62, 0], [0.16, 0.6, 0.2], warna);
  b.k([0.52, 0.95, 0], [0.08, 0.05, 0.56], "#22272E");
  b.o([0.58, 0.8, 0], 0.08, "#FFF3C7", null, 8);
  b.padat(0, 0, 1.7, 0.6);
};

const jemuran = (d, b, x, z, panjang) => {
  for (const s of [-1, 1]) b.t([x + (s * panjang) / 2, 1, z], 0.03, 0.03, 2, "#8E979D", null, 6);
  b.t([x, 1.9, z], 0.01, 0.01, panjang, "#D8D8D8", [0, 0, Math.PI / 2], 5);
  b.padat(x - panjang / 2, z, 0.1, 0.1);
  b.padat(x + panjang / 2, z, 0.1, 0.1);
  const bahan = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  [[-0.9, "#F2B5A7", 0.6, 0.72], [-0.1, "#FFFFFF", 0.52, 0.6], [0.65, "#A7CFE0", 0.58, 0.74], [1.3, "#F4B942", 0.4, 0.5]].forEach(([dx, warna, w, h], i) => {
    const kain = new Bangun();
    kain.k([0, -h / 2, 0], [w, h, 0.015], warna);
    const m = kain.jadi(bahan);
    m.position.set(x + dx, 1.9, z);
    d.scene.add(m);
    d.hidup.push((t) => {
      m.rotation.x = Math.sin(t * 1.5 + i * 1.3) * 0.12;
    });
  });
};

// Ayam berkeliling di area kecil. Makhluk hidup tetap voxel.
const ayam = (d, cx, cz, jangkau, warna = "#F4EDE0") => {
  const akar = new THREE.Group();
  const bahan = new THREE.MeshLambertMaterial({ vertexColors: true });
  const badan = new Bangun();
  badan.k([0, 0.2, 0], [0.22, 0.2, 0.32], warna);
  for (const x of [-0.05, 0.05]) badan.k([x, 0.05, 0], [0.035, 0.11, 0.035], "#E9B26A");
  badan.k([0, 0.27, -0.16], [0.1, 0.14, 0.05], warna);
  const mBadan = badan.jadi(bahan);
  const leher = new THREE.Group();
  leher.position.set(0, 0.3, 0.14);
  const kepala = new Bangun();
  kepala.k([0, 0.07, 0.02], [0.13, 0.14, 0.13], warna);
  kepala.k([0, 0.17, 0.02], [0.04, 0.06, 0.09], "#D96B5F");
  kepala.k([0, 0.05, 0.11], [0.05, 0.03, 0.06], "#E9B26A");
  for (const s of [-1, 1]) kepala.k([s * 0.066, 0.09, 0.05], [0.005, 0.025, 0.025], "#2A1F1A");
  const mKepala = kepala.jadi(bahan);
  leher.add(mKepala);
  akar.add(mBadan, leher);
  akar.position.set(cx, 0.02, cz);
  d.scene.add(akar);
  let tujuanX = cx;
  let tujuanZ = cz;
  let tunggu = Math.random() * 4;
  d.hidup.push((t, dt) => {
    const dx = tujuanX - akar.position.x;
    const dz = tujuanZ - akar.position.z;
    const jarak = Math.hypot(dx, dz);
    let patuk = 0;
    if (tunggu > 0) {
      tunggu -= dt;
      patuk = Math.max(0, Math.sin(t * 6)) * (tunggu % 2 < 1 ? 1 : 0);
      if (tunggu <= 0) {
        tujuanX = cx + (Math.random() - 0.5) * jangkau;
        tujuanZ = cz + (Math.random() - 0.5) * jangkau;
      }
    } else if (jarak < 0.1) {
      tunggu = 1.5 + Math.random() * 3;
    } else {
      akar.position.x += (dx / jarak) * dt * 0.7;
      akar.position.z += (dz / jarak) * dt * 0.7;
      akar.rotation.y = Math.atan2(dx, dz);
      mBadan.rotation.z = Math.sin(t * 14) * 0.05;
    }
    leher.rotation.x = patuk * 1.1;
  });
};

export const pasangLuar = (d) => {
  const b = d.luar;
  const papan = (teks, opsi, at, rotY = 0) => {
    const m = papanTulis(teks, opsi);
    m.position.set(...at);
    m.rotation.y = rotY;
    d.scene.add(m);
    return m;
  };

  /* ---------- Tanah dan jalan ---------- */

  b.k([0, -0.06, 0], [100, 0.08, 56], "#C6D8A8");
  // Gang utama dari conblock
  b.k([0, -0.015, 6], [92, 0.03, 5.2], "#D9D3C7");
  for (let x = -46; x < 46; x += 0.8) b.k([x, 0.001, 6], [0.018, 0.002, 5.2], "#C4BEB1");
  for (let z = 3.8; z < 8.6; z += 0.8) b.k([0, 0.001, z], [92, 0.002, 0.018], "#C4BEB1");
  for (const z of [3.5, 8.5]) b.k([0, 0.03, z], [92, 0.07, 0.16], "#BDB7A8");

  // Halaman depan dan lorong samping rumah
  b.k([0, -0.012, 1.7], [23, 0.03, 3.4], "#E4DDCF");
  b.k([-9.75, -0.012, -6.5], [3.5, 0.03, 13], "#E4DDCF");
  b.k([9.75, -0.012, -6.5], [3.5, 0.03, 13], "#E4DDCF");
  // Teras keramik
  b.k([0, 0.01, 1.3], [8.6, 0.02, 2.6], "#F1E8D8");
  for (let x = -4.2; x < 4.3; x += 0.6) b.k([x, 0.021, 1.3], [0.015, 0.002, 2.6], "#D9CDB6");
  for (let z = 0.2; z < 2.6; z += 0.6) b.k([0, 0.021, z], [8.6, 0.002, 0.015], "#D9CDB6");
  // Kebun belakang
  b.k([0, -0.02, -17.5], [23, 0.02, 9], "#B9D79A");
  d.peta.push([-46, 3.4, 46, 8.6, "#E6E1D6"], [-11.5, 0, 11.5, 3.4, "#EFE9DD"], [-11.5, -13, -8, 0, "#EFE9DD"], [8, -13, 11.5, 0, "#EFE9DD"]);

  /* ---------- Teras Pak Dani ---------- */

  // Atap teras di depan rumah, dibuat di main lewat atapTeras
  for (const x of [-4.1, -1.2, 1.2, 4.1]) {
    b.k([x, 1.25, 2.5], [0.16, 2.5, 0.16], "#FFFDF7");
    b.k([x, 0.09, 2.5], [0.24, 0.18, 0.24], "#D9A873");
    b.padat(x, 2.5, 0.22, 0.22);
  }
  // Bangku kayu, meja, dan kopi
  b.di([-2.9, 0, 0.55], 0, 1, () => {
    b.k([0, 0.42, 0], [1.6, 0.06, 0.5], "#B98454");
    b.k([0, 0.72, -0.24], [1.6, 0.5, 0.05], "#B98454");
    for (const [x, z] of [[-0.72, -0.2], [0.72, -0.2], [-0.72, 0.2], [0.72, 0.2]]) b.k([x, 0.2, z], [0.07, 0.4, 0.07], "#8D6A4A");
    b.padat(0, 0, 1.65, 0.55);
  });
  b.di([-1.55, 0, 0.75], 0, 1, () => {
    b.t([0, 0.46, 0], 0.3, 0.3, 0.04, "#8D6A4A", null, 14);
    b.t([0, 0.22, 0], 0.04, 0.07, 0.44, "#6F5238");
    b.t([0.05, 0.53, 0], 0.05, 0.04, 0.09, "#FFFDF7", null, 10);
    b.t([0.05, 0.575, 0], 0.045, 0.045, 0.005, "#3B2A20", null, 10);
    b.padat(0, 0, 0.6, 0.6);
  });
  pot(b, 3.8, 0.35, "#7DBB86");
  pot(b, 3.2, 0.35, "#E85D75");
  pot(b, -3.9, 2.2, "#F4B942");
  pot(b, 1.75, 2.15);
  pot(b, -1.75, 2.15, "#E85D75");
  // Keset di depan pintu
  b.k([0, 0.028, 0.5], [1.3, 0.012, 0.65], "#8F6A44");
  // Rak sandal
  b.di([2.3, 0, 0.28], 0, 1, () => {
    b.k([0, 0.22, 0], [0.9, 0.03, 0.26], "#B98454");
    b.k([0, 0.05, 0], [0.9, 0.03, 0.26], "#B98454");
    for (const s of [-1, 1]) b.k([s * 0.44, 0.15, 0], [0.03, 0.3, 0.26], "#8D6A4A");
    for (const [x, y, c] of [[-0.25, 0.09, "#FF9F1C"], [0.15, 0.09, "#2FBF71"], [-0.1, 0.26, "#FFFFFF"]]) b.k([x, y, 0], [0.26, 0.04, 0.18], c);
    b.padat(0, 0, 0.92, 0.3);
  });
  // Motor di halaman
  b.di([6, 0, 1.6], 0.15, 1, () => motor(b));
  pot(b, -6.5, 0.45);
  pot(b, -7.3, 0.45, "#E85D75");
  pot(b, -5.7, 0.45, "#F4B942");

  /* ---------- Pagar depan ---------- */

  for (const [x1, x2] of [[-11.5, -1.4], [1.4, 11.5]]) {
    const tengah = (x1 + x2) / 2;
    const lebar = x2 - x1;
    b.k([tengah, 0.3, 3.4], [lebar, 0.6, 0.16], "#FFFDF7");
    b.k([tengah, 1.15, 3.4], [lebar, 0.05, 0.06], "#2A7F6F");
    for (let x = x1 + 0.2; x < x2; x += 0.3) b.k([x, 0.9, 3.4], [0.035, 0.6, 0.035], "#2A7F6F");
    b.padat(tengah, 3.4, lebar, 0.2);
  }
  for (const x of [-1.4, 1.4]) {
    b.k([x, 0.9, 3.4], [0.3, 1.8, 0.3], "#FFFDF7");
    b.k([x, 1.84, 3.4], [0.36, 0.08, 0.36], "#D9A873");
    b.padat(x, 3.4, 0.3, 0.3);
  }
  // Daun pagar terbuka ke dalam
  for (const s of [-1, 1]) {
    b.k([s * 1.3, 0.68, 2.75], [0.04, 1, 1.15], "#2A7F6F");
    b.padat(s * 1.3, 2.75, 0.08, 1.15);
  }
  // Papan nama rumah di atas gerbang
  for (const s of [-1, 1]) b.k([s * 1.4, 2.25, 3.4], [0.07, 1, 0.07], "#A9744A");
  b.k([0, 2.72, 3.4], [2.95, 0.48, 0.05], "#A9744A");
  papan("Rumah Keluarga Dani", { lebar: 2.8, tinggi: 0.38, latar: "#FFF6E6", tinta: "#8F3F1E" }, [0, 2.72, 3.44]);
  papan("Rumah Keluarga Dani", { lebar: 2.8, tinggi: 0.38, latar: "#FFF6E6", tinta: "#8F3F1E" }, [0, 2.72, 3.36], Math.PI);

  /* ---------- Sisi rumah: tembok pembatas dan tetangga ---------- */

  const tembok = (x1, z1, x2, z2, tinggi = 2.2, warna = "#E9DCC3") => {
    const lebar = Math.abs(x2 - x1) || 0.2;
    const dalam = Math.abs(z2 - z1) || 0.2;
    const x = (x1 + x2) / 2;
    const z = (z1 + z2) / 2;
    b.k([x, tinggi / 2, z], [lebar, tinggi, dalam], warna);
    b.k([x, tinggi + 0.04, z], [lebar + 0.06, 0.08, dalam + 0.06], "#BFB39B");
    b.padat(x, z, lebar + 0.04, dalam + 0.04);
    d.peta.push([x - lebar / 2 - 0.1, z - dalam / 2 - 0.1, x + lebar / 2 + 0.1, z + dalam / 2 + 0.1, "#A99F8C"]);
  };

  rumahTetangga(d, { x: -14.4, z: -3.5, lebar: 5.8, dalam: 9.5, warna: "#BFE3D6", hadap: 1 });
  rumahTetangga(d, { x: -19.7, z: -3.5, lebar: 4.8, dalam: 9.5, warna: "#F3C6C0", hadap: 1 });
  rumahTetangga(d, { x: 14.4, z: -3.5, lebar: 5.8, dalam: 9.5, warna: "#F6DFA8", hadap: 1 });
  rumahTetangga(d, { x: 19.7, z: -3.5, lebar: 4.8, dalam: 9.5, warna: "#C5DDEC", hadap: 1 });
  // Halaman tetangga: pagar rendah
  for (const [x1, x2] of [[-22.1, -11.5], [11.5, 22.1]]) {
    tembok(x1, 3.35, x2, 3.35, 0.9, "#FFFDF7");
    tembok(x1, 1.25, x1, 3.35, 0.9, "#FFFDF7");
  }
  pot(b, -13, 2.2);
  pot(b, 13, 2.2, "#E85D75");
  pot(b, 16.4, 2.2, "#F4B942");
  pot(b, -17, 2.2, "#F4B942");
  b.di([-19, 0, 2.2], -0.1, 1, () => motor(b, "#3A4FB8"));

  // Tembok kebun belakang dan batas rumah tetangga
  tembok(-11.5, -22, 11.5, -22);
  tembok(-11.5, -22, -11.5, 3.4);
  tembok(11.5, -22, 11.5, 3.4);

  // Deretan rumah seberang gang
  const warnaSeberang = ["#BFE3D6", "#F6DFA8", "#F3C6C0", "#C5DDEC", "#FFD9B3", "#D7E8B8", "#E4D3FA"];
  let i = 0;
  for (let x = -42.5; x < 21; x += 6.6) {
    rumahTetangga(d, { x, z: 13, lebar: 6.5, dalam: 8.4, warna: warnaSeberang[i % warnaSeberang.length], hadap: -1, tinggi: 2.8 + (i % 3) * 0.15, warnaPintu: i % 2 === 0 ? "#B08A68" : "#2A7F6F" });
    i++;
  }
  // Pepohonan di balik rumah seberang, supaya batas dunia tidak terasa
  for (let x = -44; x < 45; x += 7) pohon(b, x + (x % 3), 21.5, 1.6);
  for (let x = -44; x < 22; x += 8) pohon(b, x, -25 + (x % 2), 1.8);
  for (let z = -22; z < 20; z += 8) {
    pohon(b, 48, z, 1.7);
    pohon(b, -48, z, 1.7);
  }

  /* ---------- Isi gang ---------- */

  // Tiang di sisi utara gang, supaya tidak berdiri di antara kamera dan pemain.
  const tiang = [-36, -20, -6.5, 7.5, 20, 36];
  for (const x of tiang) tiangListrik(b, x, 3.68);
  tiang.slice(1).forEach((x, i) => {
    const lebar = x - tiang[i];
    for (const z of [3.3, 4.1]) b.t([tiang[i] + lebar / 2, 5.92, z], 0.008, 0.008, lebar, "#3A3A3A", [0, 0, Math.PI / 2], 4);
  });
  // Gerobak makanan
  b.di([-9, 0, 7.75], 0, 1, () => {
    b.k([0, 0.75, 0], [1.6, 0.7, 0.75], "#FFF3C7");
    b.k([0, 1.12, 0], [1.68, 0.04, 0.83], "#D9A873");
    b.k([0.45, 1.3, 0], [0.5, 0.35, 0.5], "#D7ECF4");
    b.t([-0.42, 1.26, 0], 0.17, 0.17, 0.26, "#C5CDD2");
    b.k([0, 1.95, 0], [1.9, 0.05, 1], "#E85D75");
    for (const [x, z] of [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]]) b.k([x, 1.5, z], [0.04, 0.9, 0.04], "#AEB6BC");
    for (const s of [-1, 1]) b.t([0.55, 0.28, s * 0.42], 0.28, 0.28, 0.06, "#22272E", [Math.PI / 2, 0, 0], 12);
    b.t([-0.9, 0.5, 0], 0.03, 0.03, 0.4, "#8D6A4A", [0, 0, 1.4], 6);
    b.padat(0, 0, 1.9, 1);
  });
  b.di([14, 0, 7.8], Math.PI, 1, () => motor(b, "#2B7BBA"));
  b.di([-30, 0, 7.8], 0.05, 1, () => motor(b, "#F4B942"));
  pot(b, -5, 8.25);
  pot(b, -4.5, 8.25, "#F4B942");
  pot(b, 6, 8.25, "#E85D75");
  pot(b, 21, 8.25);
  pot(b, -24, 8.25, "#E85D75");
  // Bendera kecil merah putih melintang gang
  b.t([0, 4.3, 3.9], 0.008, 0.008, 80, "#F2F2EE", [0, 0, Math.PI / 2], 4);
  for (let x = -40; x <= 40; x += 1.5) {
    b.k([x, 4.22, 3.9], [0.28, 0.13, 0.012], "#E23D3D");
    b.k([x, 4.1, 3.9], [0.28, 0.12, 0.012], "#FFFFFF");
  }

  /* ---------- Warung ---------- */

  b.k([-29, 1.4, -2.6], [8, 2.8, 0.16], "#FFF3C7");
  for (const x of [-33, -25]) {
    b.k([x, 1.4, -0.4], [0.16, 2.8, 4.5], "#FFF3C7");
    b.padat(x, -0.4, 0.2, 4.5);
  }
  b.padat(-29, -2.6, 8, 0.2);
  b.k([-29, 0.01, -0.2], [8, 0.02, 4.6], "#E9D9BD");
  // Etalase
  b.di([-29, 0, 0.8], 0, 1, () => {
    b.k([0, 0.45, 0], [5.8, 0.9, 0.7], "#B98454");
    b.k([0, 0.93, 0], [5.9, 0.05, 0.78], "#EFE7D8");
    for (let i = 0; i < 9; i++) {
      b.t([-2.4 + i * 0.6, 1.14, 0], 0.11, 0.11, 0.34, ["#E85D75", "#F4B942", "#7DBB86", "#FF7A3D", "#FFFDF7"][i % 5], null, 8);
      b.t([-2.4 + i * 0.6, 1.34, 0], 0.12, 0.12, 0.05, "#2A7F6F", null, 8);
    }
    b.padat(0, 0, 5.9, 0.75);
  });
  // Rak dagangan polos di belakang etalase, tanpa merek
  for (const y of [0.75, 1.3, 1.85]) {
    b.k([-29, y, -2.3], [6.8, 0.05, 0.4], "#8D6A4A");
    for (let i = 0; i < 16; i++) {
      const w = ["#E85D75", "#F4B942", "#7DBB86", "#2B7BBA", "#FFFDF7", "#FF7A3D"][(i + Math.round(y * 3)) % 6];
      b.k([-32.2 + i * 0.43, y + 0.18, -2.3], [0.3, 0.3, 0.26], w);
    }
  }
  // Bangku di depan warung
  b.di([-29, 0, 2.3], 0, 1, () => {
    b.k([0, 0.42, 0], [2.6, 0.06, 0.4], "#B98454");
    for (const x of [-1.15, 1.15]) b.k([x, 0.2, 0], [0.08, 0.4, 0.34], "#8D6A4A");
    b.padat(0, 0, 2.65, 0.44);
  });
  // Atap warung miring
  b.di([-29, 3.05, 0.2], [0.14, 0, 0], 1, () => {
    for (let i = 0; i < 9; i++) b.k([0, 0, -2.8 + i * 0.7], [8.8, 0.09, 0.72], i % 2 ? "#7DBB9E" : "#6DAA8E");
  });
  b.k([-29, 3.3, 3.22], [5.2, 0.9, 0.08], "#E85D75");
  papan("WARUNG", { lebar: 4.9, tinggi: 0.75, latar: "#E85D75", tinta: "#FFFDF7" }, [-29, 3.3, 3.28]);
  d.peta.push([-33, -2.7, -25, 1.6, "#F0DDB2"]);

  /* ---------- Mushola ---------- */

  b.k([-40.5, 0.01, -2.5], [9, 0.02, 9.2], "#E7F0E2");
  for (const [x, z, w, dl] of [[-44.9, -2.5, 0.2, 9], [-36.1, -5, 0.2, 4], [-40.5, -7, 9, 0.2]]) {
    b.k([x, 1.45, z], [w, 2.9, dl], "#FFFDF7");
    b.padat(x, z, w, dl);
  }
  for (const [x, z] of [[-44.5, 1.8], [-41.5, 1.8], [-38.5, 1.8], [-36.3, 1.8]]) {
    b.k([x, 1.4, z], [0.26, 2.8, 0.26], "#FFFDF7");
    b.padat(x, z, 0.26, 0.26);
  }
  atapPelana(b, { x1: -45.3, x2: -35.7, z1: -7.4, z2: 2.4, yTepi: 2.85, yPuncak: 4.3 });
  b.t([-40.5, 4.65, -2.5], 0.7, 1, 0.8, "#2A9D8F", null, 12);
  b.o([-40.5, 5.05, -2.5], 0.7, "#2EC4B6", [1, 0.9, 1], 12);
  b.t([-40.5, 5.8, -2.5], 0.015, 0.02, 0.4, "#E0B13C", null, 6);
  b.o([-40.5, 6.02, -2.5], 0.05, "#E0B13C", null, 8);
  for (let n = 0; n < 8; n++) b.k([-43.6 + n * 0.85, 0.026, -3.8], [0.6, 0.01, 1], n % 2 ? "#2A7F6F" : "#C9445C");
  d.peta.push([-45, -7, -36, 2, "#E7F0E2"]);
  tembok(-46, -8.6, -22.2, -8.6);
  tembok(-46, -8.6, -46, 3.4);
  tembok(-46, 8.6, -46, 3.4);
  tembok(-22.2, -8.6, -22.2, 3.4);

  /* ---------- Lapangan dan pos ronda ---------- */

  b.k([34.1, -0.018, -5.3], [23.8, 0.02, 17.4], "#B8CC8B");
  b.k([35, -0.018, 14.8], [22, 0.02, 12.4], "#B8CC8B");
  b.k([35.5, 0.003, 13], [14.4, 0.006, 7.4], "#FFFFFF");
  b.k([35.5, 0.008, 13], [14, 0.006, 7], "#C2A777");
  b.k([35.5, 0.012, 13], [0.1, 0.002, 7], "#FFFFFF");
  // Net
  for (const z of [9.1, 16.9]) {
    b.t([35.5, 1.1, z], 0.04, 0.04, 2.2, "#AEB6BC", null, 6);
    b.padat(35.5, z, 0.14, 0.14);
  }
  b.k([35.5, 1.85, 13], [0.02, 0.05, 7.8], "#FFFFFF");
  for (let y = 1.25; y < 1.8; y += 0.1) b.k([35.5, y, 13], [0.008, 0.01, 7.7], "#FFFFFF");
  for (let z = 9.2; z < 16.9; z += 0.2) b.k([35.5, 1.5, z], [0.008, 0.6, 0.01], "#FFFFFF");
  // Gawang kecil dari bambu
  for (const x of [28, 43.5]) {
    for (const s of [-1, 1]) {
      b.t([x, 0.65, -4 + s * 1.3], 0.04, 0.04, 1.3, "#D9C07A", null, 6);
      b.padat(x, -4 + s * 1.3, 0.14, 0.14);
    }
    b.t([x, 1.3, -4], 0.04, 0.04, 2.6, "#D9C07A", [Math.PI / 2, 0, 0], 6);
  }
  // Bola
  b.o([35.5, 0.11, -4], 0.11, "#FFFDF7", null, 10);
  pohon(b, 25.5, -9, 1.5);
  pohon(b, 44, -9, 1.6);
  pohon(b, 44, 2, 1.4);
  pohon(b, 25.8, 18.5, 1.3);
  pohon(b, 44, 19, 1.5);
  // Pos ronda
  b.di([26.5, 0, 0], 0, 1, () => {
    b.k([0, 0.45, 0], [2.6, 0.08, 2], "#C9A36F");
    for (const [x, z] of [[-1.25, -0.95], [1.25, -0.95], [-1.25, 0.95], [1.25, 0.95]]) b.t([x, 1.2, z], 0.07, 0.07, 2.4, "#8D6A4A", null, 8);
    for (let i = 0; i < 6; i++) b.k([-1.25 + i * 0.5, 2.5, 0], [0.54, 0.08, 2.6], i % 2 ? GENTENG : GENTENG_TUA);
    b.k([0, 0.9, -0.97], [2.5, 0.8, 0.05], "#D9B884");
    // Kentongan
    b.t([1.25, 1.75, 0.95], 0.1, 0.1, 0.55, "#7A5234", null, 8);
    b.padat(0, 0, 2.7, 2.1);
  });
  papan("POS RONDA", { lebar: 1.5, tinggi: 0.3, latar: "#FFFDF7", tinta: "#3A2A1E", tepi: "#7A5234" }, [26.5, 2.2, 1]);
  d.peta.push([24, -14, 46, 20, "#CCDCA6"], [29.5, 9.5, 41.5, 16.5, "#D1BC90"], [25.2, -1, 27.8, 1, "#D9B884"]);
  tembok(22.2, -14, 46, -14);
  tembok(46, -14, 46, 3.4);
  tembok(46, 8.6, 46, 21);
  tembok(24, 21, 46, 21);
  tembok(24, 8.6, 24, 21);
  tembok(20.2, 8.7, 24, 8.7);
  tembok(46, 3.4, 46, 8.6);
  tembok(22.2, -14, 22.2, 3.4);

  /* ---------- Kebun belakang ---------- */

  pohon(b, -6, -17.5, 1.4, "#E9B23C");
  jemuran(d, b, 2.5, -17, 4.2);
  // Pompa air dan ember
  b.di([8.5, 0, -19.5], 0, 1, () => {
    b.t([0, 0.35, 0], 0.45, 0.48, 0.7, "#BFB39B", null, 14);
    b.t([0, 0.71, 0], 0.4, 0.4, 0.02, "#6BB7D9", null, 14);
    b.t([0.75, 0.55, 0.1], 0.05, 0.05, 1.1, "#3E8E5A", null, 8);
    b.k([0.75, 1.15, 0.1], [0.5, 0.05, 0.07], "#3E8E5A");
    b.k([0.55, 0.98, 0.1], [0.05, 0.05, 0.25], "#3E8E5A");
    b.t([1.05, 0.14, 0.8], 0.17, 0.13, 0.28, "#E85D75", null, 10);
    b.padat(0, 0, 1, 1);
    b.padat(0.75, 0.1, 0.2, 0.2);
    b.padat(1.05, 0.8, 0.32, 0.32);
  });
  // Bedengan sayur
  for (const x of [-1.5, 0.2, 1.9]) {
    b.k([x, 0.08, -20.2], [1.2, 0.18, 2.4], "#8A6242");
    for (let z = -21.1; z < -19.4; z += 0.42) {
      b.o([x - 0.25, 0.27, z], 0.16, "#5AA866", [1, 0.8, 1], 6);
      b.o([x + 0.25, 0.27, z + 0.14], 0.14, "#7DBB86", [1, 0.8, 1], 6);
    }
    b.padat(x, -20.2, 1.24, 2.44);
  }
  // Kandang ayam dari bambu
  b.di([-9.3, 0, -20.2], 0, 1, () => {
    b.k([0, 0.55, 0], [2.1, 0.06, 1.5], "#C9A36F");
    for (const [x, z] of [[-1, -0.7], [1, -0.7], [-1, 0.7], [1, 0.7]]) b.t([x, 0.6, z], 0.04, 0.04, 1.2, "#D9C07A", null, 6);
    for (let x = -1; x <= 1; x += 0.2) b.t([x, 0.86, 0.7], 0.015, 0.015, 0.55, "#D9C07A", null, 5);
    b.k([0, 1.25, 0], [2.3, 0.08, 1.8], GENTENG);
    b.padat(0, 0, 2.15, 1.55);
  });
  ayam(d, -7, -18.5, 3.5);
  ayam(d, -8.2, -16.5, 3, "#D9A26A");
  ayam(d, 5, -16, 3);
  ayam(d, 32, -2, 6, "#D9A26A");
  ayam(d, -26, 6, 3);
  d.peta.push([-11.5, -22, 11.5, -13, "#C4DBA6"]);

  /* ---------- Awan yang bergerak pelan ---------- */

  const awan = new Bangun();
  for (const [x, y, z, s] of [[-30, 22, -30, 3], [5, 25, -40, 4], [32, 21, -20, 3.2], [-12, 26, 28, 3.6], [24, 24, 34, 2.8]]) {
    for (const [dx, dy, r] of [[0, 0, 0.8], [-0.9, -0.12, 0.56], [0.9, -0.12, 0.6]]) {
      awan.o([x + dx * s, y + dy * s, z], r * s, "#FFFFFF", null, 10);
    }
  }
  const awanMesh = new THREE.Mesh(awan.geometri(), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, toneMapped: false }));
  d.scene.add(awanMesh);
  d.hidup.push((t) => {
    awanMesh.position.x = ((t * 0.5 + 40) % 80) - 40;
  });
};
