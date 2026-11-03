// Karakter voxel. Desain, warna, proporsi, dan pose disalin dari project video
// (src/keluarga/...), lalu ditulis ulang untuk Three.js biasa. Jangan diubah di sini saja.
import * as THREE from "three";
import { Bangun, bahanUtama } from "./bangun.js";

/* ---------- Pose ---------- */

const NETRAL = {
  y: 0, lean: 0, tilt: 0, squash: 0,
  headX: 0, headY: 0, headZ: 0,
  leftArmX: 0, leftArmZ: -0.07, leftElbow: 0, leftElbowZ: 0,
  rightArmX: 0, rightArmZ: 0.07, rightElbow: 0, rightElbowZ: 0,
  leftHip: 0, leftKnee: 0, rightHip: 0, rightKnee: 0,
  eye: 1, mouth: 0, smile: 1,
  catY: 0, catLook: 0, catTilt: 0, catEye: 1, catTail: 0, catTailUp: 0.5,
};

const kedip = (n) => {
  const t = n % 124;
  return t < 3 ? 0.1 : t < 5 ? 0.5 : 1;
};
const napas = (n) => Math.sin((n * Math.PI * 2) / 90);

export const POSE = {
  diam: (n) => {
    const b = napas(n);
    return {
      ...NETRAL,
      squash: b * 0.018,
      headX: b * -0.018,
      headZ: Math.sin(n * 0.03) * 0.015,
      leftArmZ: -0.07 - b * 0.018,
      rightArmZ: 0.07 + b * 0.018,
      eye: kedip(n),
      catEye: kedip(n + 40),
      catLook: Math.sin(n * 0.025) * 0.28,
      catTail: Math.sin(n * 0.07) * 0.4,
    };
  },
  // Sama dengan pose "jalan" di video, tanpa putaran menyamping yang khusus untuk kamera video.
  jalan: (n) => {
    const step = (n * Math.PI * 2) / 28;
    const swing = Math.sin(step);
    return {
      ...NETRAL,
      y: Math.abs(Math.cos(step)) * 0.07,
      lean: 0.05,
      tilt: swing * 0.035,
      headX: -0.03,
      leftHip: swing * 0.62,
      leftKnee: Math.max(0, Math.sin(step + 1.2)) * 0.8,
      rightHip: -swing * 0.62,
      rightKnee: Math.max(0, Math.sin(step + 1.2 + Math.PI)) * 0.8,
      leftArmX: -swing * 0.52,
      leftElbow: -0.3,
      rightArmX: swing * 0.52,
      rightElbow: -0.3,
      eye: kedip(n),
      catEye: kedip(n + 40),
      catY: Math.abs(Math.sin(step)) * 0.05,
      catTilt: swing * 0.07,
      catTail: swing * 0.55,
    };
  },
  lompat: () => ({
    ...NETRAL,
    leftArmZ: -2.1,
    leftElbow: -0.25,
    rightArmZ: 2.1,
    rightElbow: -0.25,
    leftHip: -0.5,
    leftKnee: 0.9,
    rightHip: -0.5,
    rightKnee: 0.9,
    eye: 0.12,
    smile: 1.35,
    mouth: 0.55,
  }),
  melambai: (n) => ({
    ...POSE.diam(n),
    tilt: Math.sin(n * 0.24) * 0.025,
    headZ: Math.sin(n * 0.24) * -0.05,
    rightArmZ: 2.45,
    rightElbowZ: 0.28 + Math.sin(n * 0.42) * 0.42,
    smile: 1.3,
    mouth: 0.35,
  }),
  mengaduk: (n) => {
    const stir = n * 0.22;
    return {
      ...POSE.diam(n),
      squash: napas(n) * 0.012,
      tilt: Math.sin(stir) * 0.018,
      headX: 0.1,
      headZ: Math.sin(n * 0.03) * 0.03,
      rightArmX: -0.95 + Math.sin(stir) * 0.1,
      rightArmZ: -0.1 + Math.cos(stir) * 0.1,
      rightElbow: -0.55,
      leftArmX: -0.75,
      leftArmZ: 0.12,
      leftElbow: -0.65,
      smile: 1.15,
    };
  },
  mainHp: (n) => {
    const jempol = Math.sin(n * 0.7) * 0.025;
    return {
      ...POSE.diam(n),
      lean: 0.03,
      headX: 0.2,
      headZ: Math.sin(n * 0.02) * 0.03,
      rightArmX: -0.75,
      rightArmZ: -0.2,
      rightElbow: -1.0 + jempol,
      rightElbowZ: -0.28,
      leftArmX: -0.75,
      leftArmZ: 0.2,
      leftElbow: -1.0 - jempol,
      leftElbowZ: 0.28,
      smile: 1.1,
    };
  },
  mendongeng: (n) => {
    const g = Math.sin(n * 0.09);
    return {
      ...POSE.diam(n),
      lean: 0.02,
      headY: g * 0.14,
      headZ: g * -0.04,
      leftArmX: -0.7,
      leftArmZ: -0.55 - Math.max(0, g) * 0.45,
      leftElbow: -0.75,
      rightArmX: -0.7,
      rightArmZ: 0.55 + Math.max(0, -g) * 0.45,
      rightElbow: -0.75,
      smile: 1.25,
      mouth: 0.25 + Math.abs(Math.sin(n * 0.31)) * 0.3,
    };
  },
};

const campur = (a, b, t) => {
  const hasil = {};
  for (const kunci in b) hasil[kunci] = a[kunci] + (b[kunci] - a[kunci]) * t;
  return hasil;
};

/* ---------- Rangka ---------- */

const bahan = bahanUtama();

// Satu bagian tubuh yang bisa bergerak, digabung jadi satu mesh.
const bagian = (induk, gambar) => {
  const b = new Bangun();
  gambar(b);
  const mesh = b.jadi(bahan);
  mesh.receiveShadow = false;
  induk.add(mesh);
  return mesh;
};

const grup = (induk, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  induk.add(g);
  return g;
};

// Membuat rangka dengan sendi yang sama untuk semua karakter.
// d berisi fungsi gambar per bagian dan posisi sendinya.
const buatRangka = (d) => {
  const akar = new THREE.Group();
  const tubuh = grup(akar);

  const kaki = [-1, 1].map((sisi) => {
    const paha = grup(tubuh, sisi * d.kaki.x, d.kaki.y, 0);
    bagian(paha, d.kaki.gambarPaha);
    const lutut = grup(paha, 0, -d.kaki.panjangPaha, 0);
    bagian(lutut, d.kaki.gambarBetis);
    return { paha, lutut };
  });

  const badan = grup(tubuh, 0, d.kaki.y, 0);
  bagian(badan, d.gambarBadan);

  const lengan = [-1, 1].map((sisi) => {
    const bahu = grup(badan, sisi * d.lengan.x, d.lengan.y, 0);
    bagian(bahu, d.lengan.gambarAtas);
    const siku = grup(bahu, 0, -d.lengan.panjangAtas, 0);
    bagian(siku, d.lengan.gambarBawah);
    const pegang = sisi === 1 ? d.pegangKanan : d.pegangKiri;
    if (pegang) {
      const tangan = grup(siku, 0, -d.lengan.ujung, 0.02);
      bagian(tangan, pegang);
    }
    return { bahu, siku };
  });

  const kepala = grup(badan, 0, d.kepala.y, 0);
  kepala.scale.setScalar(d.kepala.skala);
  bagian(kepala, d.kepala.gambar);

  const mata = grup(kepala);
  mata.position.y = d.kepala.mataY;
  bagian(mata, d.kepala.gambarMata);
  const mataTutup = bagian(kepala, d.kepala.gambarMataTutup);
  const mulutTutup = bagian(kepala, d.kepala.gambarMulutTutup);
  const mulutBuka = bagian(kepala, d.kepala.gambarMulutBuka);

  const kucing = d.gambarKucing ? d.gambarKucing(badan) : null;

  const pasang = (j) => {
    tubuh.position.y = j.y;
    badan.rotation.set(j.lean, 0, j.tilt);
    badan.scale.set(1 - j.squash * 0.5, 1 + j.squash, 1 - j.squash * 0.5);
    kaki[0].paha.rotation.x = j.leftHip;
    kaki[0].lutut.rotation.x = j.leftKnee;
    kaki[1].paha.rotation.x = j.rightHip;
    kaki[1].lutut.rotation.x = j.rightKnee;
    lengan[0].bahu.rotation.set(j.leftArmX, 0, j.leftArmZ);
    lengan[0].siku.rotation.set(j.leftElbow, 0, j.leftElbowZ);
    lengan[1].bahu.rotation.set(j.rightArmX, 0, j.rightArmZ);
    lengan[1].siku.rotation.set(j.rightElbow, 0, j.rightElbowZ);
    kepala.rotation.set(j.headX, j.headY, j.headZ);
    const tertutup = j.eye < 0.3;
    mata.visible = !tertutup;
    mataTutup.visible = tertutup;
    mata.scale.y = Math.max(0.3, j.eye);
    const buka = j.mouth >= 0.08;
    mulutTutup.visible = !buka;
    mulutBuka.visible = buka;
    if (buka) mulutBuka.scale.y = 0.6 + j.mouth * 0.9;
    if (kucing) kucing(j);
  };

  return { akar, pasang };
};

/* ---------- Pak Dani (Maskot.tsx) ---------- */

const PD = {
  kulit: "#D2A679", kulitGelap: "#BE8F60", rambut: "#3B2A20", uban: "#8F8A85",
  baju: "#2EC4B6", kerah: "#FFF8E7", celana: "#3D5A98", sandal: "#FF9F1C",
  tasbih: "#8A5A2B", aksen: "#FFD23F", rumbai: "#2FBF71", tinta: "#2A1F1A", pipi: "#F28B82",
  kucing: "#F7941D", belang: "#D96F0B", putih: "#FFFDF7", hidung: "#F78FA7",
};

const kucingPakDani = (induk) => {
  const akar = grup(induk, 0.78, 0.92, -0.02);
  bagian(akar, (b) => {
    b.k([0, 0.17, -0.03], [0.36, 0.34, 0.46], PD.kucing);
    b.k([0, 0.14, 0.205], [0.25, 0.25, 0.03], PD.putih);
    b.k([0, 0.3, -0.03], [0.37, 0.05, 0.1], PD.belang);
    b.k([0, 0.3, -0.18], [0.37, 0.05, 0.08], PD.belang);
    for (const s of [-1, 1]) b.k([s * 0.1, 0.04, 0.2], [0.1, 0.09, 0.14], PD.putih);
  });
  const ekor = grup(akar, 0, 0.1, -0.26);
  bagian(ekor, (b) => {
    b.k([0, 0, -0.14], [0.1, 0.1, 0.3], PD.kucing);
    b.k([0, 0, -0.34], [0.1, 0.1, 0.12], PD.putih);
  });
  const kepala = grup(akar, 0, 0.5, 0.03);
  bagian(kepala, (b) => {
    b.k([0, 0, 0], [0.44, 0.36, 0.36], PD.kucing);
    for (const s of [-1, 1]) {
      b.k([s * 0.145, 0.21, 0], [0.13, 0.11, 0.08], PD.kucing);
      b.k([s * 0.145, 0.24, 0.045], [0.065, 0.06, 0.01], PD.hidung);
      b.k([s * 0.09, 0.13, 0.185], [0.04, 0.07, 0.01], PD.belang);
      b.k([s * 0.11, 0.03, 0.185], [0.065, 0.075, 0.012], PD.tinta);
    }
    b.k([0, 0.125, 0.185], [0.05, 0.08, 0.01], PD.belang);
    b.k([0, -0.075, 0.185], [0.25, 0.13, 0.03], PD.putih);
    b.k([0, -0.04, 0.205], [0.05, 0.035, 0.015], PD.hidung);
  });
  return (j) => {
    akar.position.y = 0.92 + j.catY;
    akar.rotation.z = j.catTilt;
    ekor.rotation.set(-j.catTailUp, j.catTail, 0);
    kepala.rotation.y = j.catLook;
  };
};

const desainPakDani = () => ({
  kaki: {
    x: 0.28, y: 0.72, panjangPaha: 0.36,
    gambarPaha: (b) => b.k([0, -0.18, 0], [0.38, 0.36, 0.42], PD.celana),
    gambarBetis: (b) => {
      b.k([0, -0.13, 0], [0.34, 0.26, 0.38], PD.celana);
      b.k([0, -0.31, 0.05], [0.38, 0.1, 0.56], PD.sandal);
    },
  },
  gambarBadan: (b) => {
    b.k([0, 0.5, 0], [1.08, 1, 0.64], PD.baju);
    b.k([0, 0.03, 0], [1.1, 0.1, 0.66], PD.celana);
    b.k([0, 0.97, 0.02], [0.58, 0.09, 0.56], PD.kerah);
    b.k([0, 0.72, 0.325], [0.11, 0.42, 0.012], PD.kerah);
    // Tasbih
    for (let i = 0; i < 15; i++) {
      const a = -Math.PI / 2 + (i / 14) * Math.PI;
      const besar = i % 7 === 0;
      b.k(
        [0.3 * Math.sin(a), 0.92 - 0.62 * Math.cos(a), 0.355],
        besar ? [0.082, 0.082, 0.07] : [0.06, 0.06, 0.055],
        besar ? PD.aksen : PD.tasbih,
        [0, 0, Math.PI / 4],
      );
    }
    for (const s of [-1, 1]) for (const z of [0.26, 0.15, 0.04, -0.07]) b.k([s * 0.3, 0.96, z], [0.06, 0.06, 0.06], PD.tasbih);
    b.k([0, 0.215, 0.36], [0.11, 0.11, 0.07], PD.aksen);
    b.k([0, 0.095, 0.36], [0.065, 0.14, 0.05], PD.rumbai);
  },
  lengan: {
    x: 0.68, y: 0.76, panjangAtas: 0.43, ujung: 0.49,
    gambarAtas: (b) => {
      b.k([0, -0.21, 0], [0.27, 0.46, 0.3], PD.baju);
      b.k([0, -0.03, 0], [0.29, 0.1, 0.32], PD.kerah);
    },
    gambarBawah: (b) => {
      b.k([0, -0.17, 0], [0.24, 0.36, 0.26], PD.kulit);
      b.k([0, -0.41, 0], [0.25, 0.17, 0.27], PD.kulitGelap);
    },
  },
  kepala: {
    y: 1.02, skala: 1, mataY: 0.74,
    gambar: (b) => {
      b.k([0, 0.1, 0], [0.34, 0.22, 0.34], PD.kulitGelap);
      b.k([0, 0.65, 0], [1.04, 0.92, 0.92], PD.kulit);
      b.k([0, 1.15, -0.02], [1.1, 0.2, 0.98], PD.rambut);
      b.k([0, 0.82, -0.44], [1.08, 0.72, 0.1], PD.rambut);
      for (const s of [-1, 1]) {
        b.k([s * 0.53, 0.95, -0.12], [0.06, 0.28, 0.58], PD.rambut);
        b.k([s * 0.53, 0.92, 0.26], [0.06, 0.24, 0.2], PD.uban);
        b.k([s * 0.23, 0.89, 0.477], [0.27, 0.065, 0.03], PD.rambut, [0, 0, s * -0.13]);
        b.k([s * 0.38, 0.51, 0.463], [0.17, 0.09, 0.012], PD.pipi);
      }
      b.k([0, 0.55, 0.5], [0.13, 0.13, 0.09], PD.kulitGelap);
      b.k([0, 0.425, 0.475], [0.44, 0.075, 0.035], PD.rambut);
    },
    gambarMata: (b) => {
      for (const s of [-1, 1]) {
        b.k([s * 0.23, 0, 0.465], [0.21, 0.2, 0.02], "#FFFFFF");
        b.k([s * 0.23, 0, 0.477], [0.115, 0.125, 0.02], PD.tinta);
      }
    },
    gambarMataTutup: (b) => {
      for (const s of [-1, 1]) b.k([s * 0.23, 0.74, 0.47], [0.21, 0.03, 0.02], PD.tinta);
    },
    gambarMulutTutup: (b) => {
      b.k([0, 0.27, 0.47], [0.2, 0.05, 0.02], PD.tinta);
      for (const s of [-1, 1]) {
        b.k([s * 0.145, 0.305, 0.47], [0.09, 0.05, 0.02], PD.tinta);
        b.k([s * 0.225, 0.345, 0.47], [0.08, 0.05, 0.02], PD.tinta);
        b.k([s * 0.31, 0.34, 0.466], [0.03, 0.13, 0.012], PD.kulitGelap);
      }
    },
    gambarMulutBuka: (b) => {
      b.k([0, 0.31, 0.47], [0.38, 0.12, 0.02], "#6E2020");
      b.k([0, 0.355, 0.482], [0.3, 0.05, 0.012], "#FFFFFF");
    },
  },
  gambarKucing: kucingPakDani,
});

/* ---------- Keluarga (TubuhKeluarga.tsx) ---------- */

const desainKeluarga = (d) => {
  const { warna } = d;
  const mata = d.mata ?? 1;
  const paha = d.pinggul / 2;
  const betis = paha - 0.1;
  return {
    kaki: {
      x: d.badan.lebar * 0.26, y: d.pinggul, panjangPaha: paha,
      gambarPaha: (b) => b.k([0, -paha / 2, 0], [d.kaki.lebar, paha, d.kaki.tebal], warna.pahaAtas),
      gambarBetis: (b) => {
        b.k([0, -betis / 2, 0], [d.kaki.lebar * 0.9, betis, d.kaki.tebal * 0.9], warna.betis);
        b.k([0, -betis - 0.05, 0.05], [d.kaki.lebar, 0.1, d.kaki.tebal * 1.35], warna.alasKaki);
      },
    },
    gambarBadan: (b) => {
      b.k([0, d.badan.tinggi / 2, 0], [d.badan.lebar, d.badan.tinggi, d.badan.tebal], warna.baju);
      b.k([0, 0.03, 0], [d.badan.lebar + 0.02, 0.1, d.badan.tebal + 0.02], warna.pinggang);
      d.pakaian(b);
    },
    lengan: {
      x: d.badan.lebar / 2 + d.lengan.lebar / 2,
      y: d.badan.tinggi * 0.76,
      panjangAtas: d.lengan.atas,
      ujung: d.lengan.bawah + 0.1,
      gambarAtas: (b) => {
        b.k([0, -d.lengan.atas / 2, 0], [d.lengan.lebar, d.lengan.atas + 0.04, d.lengan.lebar * 1.1], warna.lengan);
        b.k([0, -d.lengan.atas + 0.05, 0], [d.lengan.lebar * 1.08, 0.1, d.lengan.lebar * 1.18], warna.manset);
      },
      gambarBawah: (b) => {
        b.k([0, -d.lengan.bawah / 2, 0], [d.lengan.lebar * 0.9, d.lengan.bawah, d.lengan.lebar * 0.96], warna.lenganBawah);
        b.k([0, -d.lengan.bawah - 0.06, 0], [d.lengan.lebar * 0.94, 0.16, d.lengan.lebar], warna.kulitGelap);
      },
    },
    pegangKanan: d.pegangKanan,
    pegangKiri: d.pegangKiri,
    kepala: {
      y: d.badan.tinggi + 0.02, skala: d.kepala, mataY: 0.72,
      gambar: (b) => {
        b.k([0, 0.1, 0], [0.34, 0.22, 0.34], warna.kulitGelap);
        b.k([0, 0.65, 0], [1.04, 0.92, 0.92], warna.kulit);
        for (const s of [-1, 1]) {
          b.k([s * 0.23, 0.72 + 0.15 * mata, 0.477], [0.25, 0.055, 0.03], warna.alis, [0, 0, s * -0.13]);
          b.k([s * 0.38, 0.49, 0.463], [0.17, 0.09, 0.012], warna.pipi);
        }
        b.k([0, 0.52, 0.5], [0.11, 0.11, 0.08], warna.kulitGelap);
        d.rambut(b);
      },
      gambarMata: (b) => {
        for (const s of [-1, 1]) {
          b.k([s * 0.23, 0, 0.465], [0.21 * mata, 0.2 * mata, 0.02], "#FFFFFF");
          b.k([s * 0.23, 0, 0.477], [0.115 * mata, 0.125 * mata, 0.02], warna.tinta);
        }
      },
      gambarMataTutup: (b) => {
        for (const s of [-1, 1]) b.k([s * 0.23, 0.72, 0.47], [0.21 * mata, 0.03, 0.02], warna.tinta);
      },
      gambarMulutTutup: (b) => {
        b.k([0, 0.33, 0.47], [0.18, 0.045, 0.02], warna.tinta);
        for (const s of [-1, 1]) b.k([s * 0.13, 0.362, 0.47], [0.09, 0.045, 0.02], warna.tinta);
      },
      gambarMulutBuka: (b) => {
        b.k([0, 0.34, 0.47], [0.32, 0.12, 0.02], "#6E2020");
        b.k([0, 0.385, 0.482], [0.25, 0.04, 0.012], "#FFFFFF");
      },
    },
  };
};

const BU = { kerudung: "#F4B942", kerudungGelap: "#DD9C24", daster: "#E85D75", dasterGelap: "#C9445C", motif: "#FFF3C7", celemek: "#FFF8E7", pita: "#F4B942" };

const desainBuDani = () =>
  desainKeluarga({
    pinggul: 0.62,
    badan: { lebar: 0.98, tinggi: 0.9, tebal: 0.6 },
    lengan: { lebar: 0.25, atas: 0.38, bawah: 0.34 },
    kaki: { lebar: 0.34, tebal: 0.38 },
    kepala: 0.96,
    warna: {
      kulit: "#D9AF85", kulitGelap: "#C4966A", alis: "#3B2A20", pipi: "#F28B82",
      baju: BU.daster, lengan: BU.daster, manset: BU.motif, lenganBawah: "#D9AF85",
      pinggang: BU.daster, pahaAtas: BU.dasterGelap, betis: "#D9AF85", alasKaki: "#2FBF71", tinta: "#2A1F1A",
    },
    rambut: (b) => {
      b.k([0, 1.17, -0.02], [1.16, 0.2, 1.02], BU.kerudung);
      b.k([0, 1.04, 0.47], [1.14, 0.16, 0.08], BU.kerudung);
      b.k([0, 0.62, -0.5], [1.16, 1.1, 0.1], BU.kerudung);
      for (const s of [-1, 1]) {
        b.k([s * 0.56, 0.66, 0], [0.09, 1.02, 0.98], BU.kerudung);
        b.k([s * 0.47, 0.54, 0.47], [0.13, 0.86, 0.06], BU.kerudung);
      }
      b.k([0, 0.13, 0.03], [1.14, 0.2, 1.04], BU.kerudung);
      b.k([0, 0.07, 0.47], [0.9, 0.1, 0.1], BU.kerudungGelap);
    },
    pakaian: (b) => {
      b.k([0, 0.74, 0.31], [0.8, 0.34, 0.05], BU.kerudung);
      b.k([0, 0.74, -0.31], [0.8, 0.34, 0.05], BU.kerudung);
      b.k([0, 0.3, 0.31], [0.66, 0.46, 0.03], BU.celemek);
      b.k([0, 0.2, 0.33], [0.36, 0.14, 0.02], BU.pita);
      b.k([0, -0.22, 0], [1.08, 0.5, 0.68], BU.daster);
      b.k([0, -0.22, 0.345], [0.68, 0.5, 0.03], BU.celemek);
      for (const [x, y] of [[-0.44, -0.1], [0.44, -0.3], [-0.42, -0.36], [0.43, -0.08]]) {
        b.k([x, y, 0.35], [0.08, 0.08, 0.01], BU.motif, [0, 0, Math.PI / 4]);
      }
    },
    // Sutil
    pegangKanan: (b) =>
      b.di([0, 0, 0], [1.4, 0, 0], 1, () => {
        b.t([0, 0, 0.32], 0.025, 0.025, 0.72, "#B98454", [Math.PI / 2, 0, 0], 8);
        b.k([0, 0, 0.73], [0.2, 0.025, 0.2], "#B98454");
      }),
  });

const AF = { rambut: "#241A16", kaos: "#FFFDF7", kemeja: "#3A4FB8", kemejaGelap: "#2B3C91", aksen: "#FF7A3D", jins: "#2F3A4A", sepatu: "#FFFFFF", tali: "#FFD23F" };

const desainAfdi = () =>
  desainKeluarga({
    pinggul: 0.92,
    badan: { lebar: 0.94, tinggi: 1.06, tebal: 0.54 },
    lengan: { lebar: 0.24, atas: 0.48, bawah: 0.42 },
    kaki: { lebar: 0.34, tebal: 0.38 },
    kepala: 0.92,
    warna: {
      kulit: "#D2A679", kulitGelap: "#BE8F60", alis: AF.rambut, pipi: "#E8A08C",
      baju: AF.kemeja, lengan: AF.kemeja, manset: AF.aksen, lenganBawah: "#D2A679",
      pinggang: AF.kemejaGelap, pahaAtas: AF.jins, betis: AF.jins, alasKaki: AF.sepatu, tinta: "#1F1714",
    },
    rambut: (b) => {
      b.k([0, 1.15, -0.03], [1.08, 0.2, 0.96], AF.rambut);
      b.k([0, 0.85, -0.45], [1.06, 0.72, 0.08], AF.rambut);
      for (const s of [-1, 1]) b.k([s * 0.53, 0.98, -0.1], [0.05, 0.24, 0.7], AF.rambut);
      for (const [x, y, z, w, h, d] of [
        [-0.36, 1.3, 0.2, 0.34, 0.2, 0.5],
        [-0.04, 1.34, 0.08, 0.4, 0.26, 0.66],
        [0.3, 1.3, -0.04, 0.36, 0.2, 0.62],
        [-0.2, 1.1, 0.44, 0.48, 0.2, 0.12],
        [0.2, 1.14, 0.44, 0.44, 0.12, 0.12],
      ]) b.k([x, y, z], [w, h, d], AF.rambut);
    },
    pakaian: (b) => {
      b.k([0, 0.54, 0.275], [0.38, 1, 0.02], AF.kaos);
      for (const s of [-1, 1]) {
        b.k([s * 0.21, 0.54, 0.29], [0.05, 1, 0.02], AF.kemejaGelap);
        b.k([s * 0.1, 0.78, 0.295], [0.035, 0.5, 0.01], AF.tali, [0, 0, s * -0.24]);
        b.k([s * 0.28, 1.07, -0.02], [0.06, 0.06, 0.36], "#22272E");
        b.k([s * 0.27, 1.05, 0.18], [0.14, 0.2, 0.2], AF.aksen);
      }
      b.k([0, 0.42, 0.3], [0.2, 0.26, 0.02], "#FFFFFF");
      b.k([0, 0.48, 0.312], [0.14, 0.08, 0.005], AF.aksen);
      b.k([0, 1.07, -0.2], [0.56, 0.06, 0.06], "#22272E");
    },
    // HP dengan layar abstrak
    pegangKanan: (b) =>
      b.di([0, -0.04, 0.08], [0.5, 0, 0], 1, () => {
        b.k([0, 0, 0], [0.26, 0.42, 0.03], "#22272E");
        b.k([0, 0, -0.018], [0.22, 0.37, 0.005], "#7DE3F4");
      }),
  });

const GE = { rambut: "#3B2A20", kaos: "#FFD23F", overall: "#8B6FE8", overallGelap: "#6E53C9", pita: "#FF6FA3", sepatu: "#FF6FA3", cat: ["#2EC4B6", "#FF7A3D", "#FF6FA3", "#FFFFFF"] };

const desainGempi = () =>
  desainKeluarga({
    pinggul: 0.5,
    badan: { lebar: 0.76, tinggi: 0.66, tebal: 0.46 },
    lengan: { lebar: 0.19, atas: 0.28, bawah: 0.26 },
    kaki: { lebar: 0.27, tebal: 0.32 },
    kepala: 0.9,
    mata: 1.25,
    warna: {
      kulit: "#DDB48A", kulitGelap: "#C99C70", alis: GE.rambut, pipi: "#F7877E",
      baju: GE.kaos, lengan: GE.kaos, manset: "#FFFFFF", lenganBawah: "#DDB48A",
      pinggang: GE.overall, pahaAtas: GE.overall, betis: GE.overall, alasKaki: GE.sepatu, tinta: "#2A1F1A",
    },
    rambut: (b) => {
      b.k([0, 1.15, -0.02], [1.1, 0.22, 0.98], GE.rambut);
      b.k([0, 0.72, -0.45], [1.08, 0.94, 0.1], GE.rambut);
      b.k([-0.2, 1.04, 0.46], [0.62, 0.18, 0.08], GE.rambut);
      b.k([0.34, 1.07, 0.46], [0.4, 0.12, 0.08], GE.rambut);
      for (const s of [-1, 1]) {
        b.k([s * 0.54, 0.9, -0.08], [0.06, 0.42, 0.78], GE.rambut);
        b.k([s * 0.68, 0.82, -0.12], [0.18, 0.16, 0.18], GE.pita);
        b.k([s * 0.82, 0.54, -0.12], [0.26, 0.52, 0.28], GE.rambut);
        b.k([s * 0.82, 0.22, -0.12], [0.18, 0.2, 0.2], GE.rambut);
      }
      b.k([0.32, 1.06, 0.515], [0.14, 0.14, 0.02], GE.kaos, [0, 0, Math.PI / 4]);
    },
    pakaian: (b) => {
      b.k([0, 0.2, 0.235], [0.74, 0.42, 0.02], GE.overall);
      b.k([0, 0.2, -0.235], [0.74, 0.42, 0.02], GE.overall);
      b.k([0, 0.42, 0.245], [0.46, 0.2, 0.02], GE.overall);
      b.k([0, 0.3, 0.26], [0.26, 0.12, 0.012], GE.overallGelap);
      for (const s of [-1, 1]) {
        b.k([s * 0.2, 0.58, 0.24], [0.07, 0.2, 0.02], GE.overall);
        b.k([s * 0.2, 0.67, 0], [0.07, 0.02, 0.48], GE.overall);
        b.k([s * 0.2, 0.5, 0.26], [0.06, 0.06, 0.012], GE.kaos);
      }
      [[-0.26, 0.12], [0.27, 0.22], [0.12, 0.08], [-0.14, 0.36]].forEach(([x, y], i) => {
        b.k([x, y, 0.25], [0.06, 0.06, 0.005], GE.cat[i]);
      });
    },
    // Kuas
    pegangKanan: (b) =>
      b.di([0, 0, 0], [1.3, 0, 0], 1, () => {
        b.t([0, 0, 0.2], 0.018, 0.022, 0.46, "#E9B26A", [Math.PI / 2, 0, 0], 8);
        b.t([0, 0, 0.46], 0.012, 0.035, 0.1, "#2EC4B6", [Math.PI / 2, 0, 0], 8);
      }),
  });

// Pengunjung: tokoh khusus situs ini, supaya semua anggota keluarga tetap bisa ditemui di tempatnya.
const TA = { baju: "#F26B3A", bajuGelap: "#D2552A", celana: "#E8D5A9", sandal: "#3D7FD9", topi: "#FFD23F", topiGelap: "#E5B72B" };

const desainTamu = () =>
  desainKeluarga({
    pinggul: 0.66,
    badan: { lebar: 0.86, tinggi: 0.82, tebal: 0.5 },
    lengan: { lebar: 0.22, atas: 0.36, bawah: 0.32 },
    kaki: { lebar: 0.3, tebal: 0.34 },
    kepala: 0.92,
    warna: {
      kulit: "#D9AF85", kulitGelap: "#C4966A", alis: "#3B2A20", pipi: "#F28B82",
      baju: TA.baju, lengan: TA.baju, manset: "#FFFDF7", lenganBawah: "#D9AF85",
      pinggang: TA.bajuGelap, pahaAtas: TA.celana, betis: "#D9AF85", alasKaki: TA.sandal, tinta: "#2A1F1A",
    },
    rambut: (b) => {
      b.k([0, 0.82, -0.44], [1.06, 0.7, 0.08], "#2E211A");
      for (const s of [-1, 1]) b.k([s * 0.53, 0.9, -0.1], [0.05, 0.3, 0.7], "#2E211A");
      b.k([0, 1.16, -0.02], [1.12, 0.24, 1], TA.topi);
      b.k([0, 1.06, 0.62], [1.06, 0.06, 0.42], TA.topiGelap);
    },
    pakaian: (b) => {
      b.k([0, 0.79, 0.02], [0.46, 0.07, 0.46], "#FFFDF7");
      b.k([0, 0.42, 0.26], [0.44, 0.2, 0.02], "#FFFDF7");
    },
  });

/* ---------- Dipakai dunia ---------- */

const DESAIN = {
  "pak-dani": desainPakDani,
  "bu-dani": desainBuDani,
  afdi: desainAfdi,
  gempi: desainGempi,
  tamu: desainTamu,
};

// Skala dunia: 1 meter. Pak Dani setinggi kira-kira 1,7 meter.
export const SKALA_ORANG = 0.58;

export const buatOrang = (id, { tanpaKucing = false } = {}) => {
  const desain = DESAIN[id]();
  // Di situs ini kucing Pak Dani turun dari bahu dan berkeliaran (lihat kucing.js).
  if (tanpaKucing) desain.gambarKucing = null;
  const rangka = buatRangka(desain);
  rangka.akar.scale.setScalar(SKALA_ORANG);
  let dariPose = POSE.diam;
  let kePose = POSE.diam;
  let campuran = 1;
  return {
    akar: rangka.akar,
    pose(nama) {
      if (POSE[nama] === kePose) return;
      dariPose = kePose;
      kePose = POSE[nama];
      campuran = 0;
    },
    gerak(n, dt) {
      campuran = Math.min(1, campuran + dt * 6);
      const j = campuran >= 1 ? kePose(n) : campur(dariPose(n), kePose(n), campuran);
      rangka.pasang(j);
    },
  };
};
