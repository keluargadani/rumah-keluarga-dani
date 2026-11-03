// Kucing Pak Dani yang berkeliaran sendiri. Warna dan coraknya sama dengan kucing di bahu
// pada project video (Maskot.tsx). Di video kucingnya tetap di bahu.
import * as THREE from "three";
import { Bangun, bahanUtama } from "./bangun.js";

const W = { bulu: "#F7941D", belang: "#D96F0B", putih: "#FFFDF7", hidung: "#F78FA7", tinta: "#2A1F1A" };

// Jalur tanpa halangan. Kucing hanya berjalan lurus di antara titik yang tersambung.
const TITIK = {
  dekatBapak: [-2.15, 1.6],
  teras: [0, 1.6],
  terasTimur: [2.6, 1.6],
  halamanTimur: [3, 2.92],
  sudutTimur: [8, 2.8],
  sampingTimurDepan: [9.75, 1.5],
  sampingTimur: [9.75, -6],
  sampingTimurBelakang: [9.75, -14.5],
  halamanBarat: [-3, 2.92],
  sudutBarat: [-8, 2.8],
  sampingBaratDepan: [-9.75, 1.5],
  sampingBarat: [-9.75, -6],
  sampingBaratBelakang: [-9.75, -14.5],
  gerbang: [0, 4.5],
  gang: [0, 5.6],
  gangBarat: [-7, 5.7],
  gangJauhBarat: [-15, 6],
  gangTimur: [8, 5.8],
  gangJauhTimur: [15, 6],
  pintuDepan: [0, -0.6],
  tamu: [0, -2.75],
  pintuAfdi: [-2.1, -2.75],
  kamarAfdiPintu: [-3.8, -2.75],
  kamarAfdi: [-4.3, -1.3],
  pintuOrtu: [2.1, -2.75],
  kamarOrtuPintu: [3.8, -2.75],
  kamarOrtu: [4.8, -1.3],
  lengkung: [0, -5.5],
  tengah: [0, -8.9],
  karpet: [0, -10.9],
  pintuGempi: [-2.1, -8.9],
  kamarGempiPintu: [-3.8, -9],
  kamarGempi: [-4.3, -7.2],
  masukDapur: [2.1, -8.9],
  dapurPintu: [3.8, -8.9],
  dapurBarat: [3.9, -11],
  dapurBelakang: [6.9, -11.7],
  pintuBelakang: [6.9, -14],
  kebun: [1, -15],
  kebunTimur: [6, -15.4],
  kebunBarat: [-5, -15],
};

const SAMBUNGAN = [
  ["dekatBapak", "teras"], ["teras", "terasTimur"], ["terasTimur", "halamanTimur"],
  ["halamanTimur", "sudutTimur"], ["sudutTimur", "sampingTimurDepan"],
  ["sampingTimurDepan", "sampingTimur"], ["sampingTimur", "sampingTimurBelakang"],
  ["sampingTimurBelakang", "pintuBelakang"],
  ["dekatBapak", "halamanBarat"], ["halamanBarat", "sudutBarat"], ["sudutBarat", "sampingBaratDepan"],
  ["sampingBaratDepan", "sampingBarat"], ["sampingBarat", "sampingBaratBelakang"],
  ["sampingBaratBelakang", "kebunBarat"],
  ["teras", "gerbang"], ["gerbang", "gang"], ["gang", "gangBarat"], ["gangBarat", "gangJauhBarat"],
  ["gang", "gangTimur"], ["gangTimur", "gangJauhTimur"],
  ["teras", "pintuDepan"], ["pintuDepan", "tamu"], ["tamu", "pintuAfdi"], ["pintuAfdi", "kamarAfdiPintu"],
  ["kamarAfdiPintu", "kamarAfdi"], ["tamu", "pintuOrtu"], ["pintuOrtu", "kamarOrtuPintu"],
  ["kamarOrtuPintu", "kamarOrtu"], ["tamu", "lengkung"], ["lengkung", "tengah"], ["tengah", "karpet"],
  ["tengah", "pintuGempi"], ["pintuGempi", "kamarGempiPintu"], ["kamarGempiPintu", "kamarGempi"],
  ["tengah", "masukDapur"], ["masukDapur", "dapurPintu"], ["dapurPintu", "dapurBarat"],
  ["dapurBarat", "dapurBelakang"], ["dapurBelakang", "pintuBelakang"], ["pintuBelakang", "kebunTimur"],
  ["kebunTimur", "kebun"], ["kebun", "kebunBarat"],
];

export const RUTE_KUCING = { TITIK, SAMBUNGAN };

const TETANGGA = {};
for (const [a, b] of SAMBUNGAN) {
  (TETANGGA[a] ??= []).push(b);
  (TETANGGA[b] ??= []).push(a);
}

const SUARA = [
  "Prrr... kucingnya memejamkan mata.",
  "Meong. Ekornya berdiri tinggi, tanda senang.",
  "Kucingnya menggosokkan kepala ke kakimu.",
  "Sebentar saja, lalu dia pura-pura tidak kenal.",
];

const buatBadan = () => {
  const bahan = bahanUtama();
  const akar = new THREE.Group();
  akar.scale.setScalar(0.72);

  const pasang = (induk, gambar) => {
    const b = new Bangun();
    gambar(b);
    const m = b.jadi(bahan);
    m.receiveShadow = false;
    induk.add(m);
    return m;
  };
  const grup = (induk, x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    induk.add(g);
    return g;
  };

  const kaki = [
    [-0.1, 0.2, true], [0.1, 0.2, true], [-0.1, -0.2, false], [0.1, -0.2, false],
  ].map(([x, z, depan]) => {
    const g = grup(akar, x, 0.24, z);
    pasang(g, (b) => {
      b.k([0, -0.08, 0], [0.1, 0.16, 0.11], W.bulu);
      b.k([0, -0.195, 0.015], [0.105, 0.09, 0.13], W.putih);
    });
    return { g, depan, sisi: x < 0 ? -1 : 1 };
  });

  const badan = grup(akar, 0, 0.32, 0);
  pasang(badan, (b) => {
    b.k([0, 0, 0], [0.34, 0.28, 0.62], W.bulu);
    b.k([0, -0.03, 0.315], [0.24, 0.2, 0.02], W.putih);
    for (const z of [-0.2, -0.03, 0.14]) b.k([0, 0.125, z], [0.35, 0.05, 0.08], W.belang);
  });

  const ekor = grup(badan, 0, 0.06, -0.31);
  pasang(ekor, (b) => {
    b.k([0, 0, -0.14], [0.1, 0.1, 0.3], W.bulu);
    b.k([0, 0, -0.34], [0.1, 0.1, 0.12], W.putih);
  });

  const kepala = grup(badan, 0, 0.22, 0.28);
  pasang(kepala, (b) => {
    b.k([0, 0, 0], [0.44, 0.36, 0.36], W.bulu);
    for (const s of [-1, 1]) {
      b.k([s * 0.145, 0.21, 0], [0.13, 0.11, 0.08], W.bulu);
      b.k([s * 0.145, 0.24, 0.045], [0.065, 0.06, 0.01], W.hidung);
      b.k([s * 0.09, 0.13, 0.185], [0.04, 0.07, 0.01], W.belang);
    }
    b.k([0, 0.125, 0.185], [0.05, 0.08, 0.01], W.belang);
    b.k([0, -0.075, 0.185], [0.25, 0.13, 0.03], W.putih);
    b.k([0, -0.04, 0.205], [0.05, 0.035, 0.015], W.hidung);
  });
  const mata = grup(kepala, 0, 0.03, 0.185);
  pasang(mata, (b) => {
    for (const s of [-1, 1]) b.k([s * 0.11, 0, 0], [0.065, 0.075, 0.012], W.tinta);
  });

  return { akar, kaki, badan, ekor, kepala, mata };
};

export const buatKucingKeliling = (scene) => {
  const m = buatBadan();
  scene.add(m.akar);

  const K = {
    x: TITIK.dekatBapak[0],
    z: TITIK.dekatBapak[1],
    titik: "dekatBapak",
    tujuan: null,
    sebelum: null,
    tunggu: 2,
    lari: false,
    rot: 2.4,
    duduk: 1,
    langkah: 0,
    senang: 0,
    terakhirSuara: 0,
  };

  const pilihTujuan = () => {
    const pilihan = TETANGGA[K.titik];
    const bukanBalik = pilihan.filter((n) => n !== K.sebelum);
    const daftar = bukanBalik.length ? bukanBalik : pilihan;
    K.tujuan = daftar[Math.floor(Math.random() * daftar.length)];
    K.lari = Math.random() < 0.15;
  };

  return {
    get x() {
      return K.x;
    },
    get z() {
      return K.z;
    },
    elus() {
      K.senang = 3;
      K.tunggu = Math.max(K.tunggu, 3);
      K.terakhirSuara = (K.terakhirSuara + 1) % SUARA.length;
      return SUARA[K.terakhirSuara];
    },
    gerak(t, dt, P) {
      const jarakPemain = Math.hypot(P.x - K.x, P.z - K.z);
      // Berhenti dan menoleh kalau pemain mendekat, supaya bisa dielus.
      const berhenti = jarakPemain < 1.5 || K.senang > 0;
      K.senang = Math.max(0, K.senang - dt);
      let jalan = false;

      if (!berhenti) {
        if (K.tujuan) {
          const [tx, tz] = TITIK[K.tujuan];
          const dx = tx - K.x;
          const dz = tz - K.z;
          const jarak = Math.hypot(dx, dz);
          const laju = (K.lari ? 1.7 : 0.8) * dt;
          if (jarak <= laju) {
            K.x = tx;
            K.z = tz;
            K.sebelum = K.titik;
            K.titik = K.tujuan;
            K.tujuan = null;
            // Kadang duduk dulu, kadang langsung jalan lagi.
            K.tunggu = Math.random() < 0.4 ? 2 + Math.random() * 5 : 0;
          } else {
            K.x += (dx / jarak) * laju;
            K.z += (dz / jarak) * laju;
            K.langkah += laju * 13;
            jalan = true;
            const arah = Math.atan2(dx, dz);
            const beda = Math.atan2(Math.sin(arah - K.rot), Math.cos(arah - K.rot));
            K.rot += beda * Math.min(1, dt * 7);
          }
        } else if (K.tunggu > 0) {
          K.tunggu -= dt;
        } else {
          pilihTujuan();
        }
      } else if (jarakPemain > 0.05) {
        const arah = Math.atan2(P.x - K.x, P.z - K.z);
        const beda = Math.atan2(Math.sin(arah - K.rot), Math.cos(arah - K.rot));
        K.rot += beda * Math.min(1, dt * 4);
      }

      K.duduk += ((jalan ? 0 : 1) - K.duduk) * Math.min(1, dt * 6);
      const d = K.duduk;

      m.akar.position.set(K.x, 0.02, K.z);
      m.akar.rotation.y = K.rot;
      m.badan.position.y = 0.32 - d * 0.09 + (jalan ? Math.abs(Math.sin(K.langkah)) * 0.012 : 0);
      m.badan.rotation.x = -d * 0.42;
      for (const k of m.kaki) {
        const fase = k.depan === (k.sisi > 0) ? 0 : Math.PI;
        const ayun = jalan ? Math.sin(K.langkah + fase) * (K.lari ? 0.8 : 0.55) : 0;
        k.g.rotation.x = k.depan ? ayun * (1 - d) : ayun * (1 - d) + d * 1.25;
      }
      m.kepala.rotation.x = d * 0.42;
      m.kepala.rotation.y = jalan ? 0 : Math.sin(t * 0.55) * 0.3;
      const tegak = K.senang > 0 ? 1.35 : 0.6;
      m.ekor.rotation.set(-tegak, Math.sin(t * (K.senang > 0 ? 7 : 2.2)) * 0.4, 0);
      const kedip = K.senang > 0 || t % 4.1 < 0.14;
      m.mata.scale.y = kedip ? 0.2 : 1;
    },
  };
};
