// Rumah Pak Dani: dinding, pintu, ruangan, dan perabot. Perabot disalin bentuknya dari latar video.
// Satuan dunia meter. Perabot digambar dalam satuan video lalu diperkecil dengan S.
import * as THREE from "three";
import { Bangun, papanTulis } from "./bangun.js";
import { SKALA_ORANG as S } from "./karakter.js";

const TEBAL = 0.16;
const TINGGI = 3;
const LUAR = "#F7EAD3";

const RUANG = {
  tamu: "#FFF0CF",
  tengah: "#FBE4B5",
  dapur: "#FBE9C6",
  afdi: "#7FA4C9",
  gempi: "#E4D3FA",
  ortu: "#CFE5D2",
};

/* ---------- Dinding dan pintu ---------- */

export const pasangDinding = (d) => {
  const buat = ({ x1, z1, x2, z2, plus, minus, lubang = [], tinggi = TINGGI, plintPlus = "#D9A873", plintMinus = "#D9A873" }) => {
    const b = new Bangun(d.padat);
    const sumbuX = z1 === z2;
    const tetap = sumbuX ? z1 : x1;
    const u0 = sumbuX ? Math.min(x1, x2) : Math.min(z1, z2);
    const u1 = sumbuX ? Math.max(x1, x2) : Math.max(z1, z2);
    const titik = (u, y, o = 0) => (sumbuX ? [u, y, tetap + o] : [tetap + o, y, u]);
    const ukuran = (su, sy, st) => (sumbuX ? [su, sy, st] : [st, sy, su]);

    const balok = (ua, ub, ya, yb) => {
      const u = (ua + ub) / 2;
      const y = (ya + yb) / 2;
      b.k(titik(u, y, TEBAL / 4), ukuran(ub - ua, yb - ya, TEBAL / 2), plus);
      b.k(titik(u, y, -TEBAL / 4), ukuran(ub - ua, yb - ya, TEBAL / 2), minus);
      if (ya === 0) {
        b.k(titik(u, 0.07, TEBAL / 2 + 0.01), ukuran(ub - ua, 0.14, 0.02), plintPlus);
        b.k(titik(u, 0.07, -TEBAL / 2 - 0.01), ukuran(ub - ua, 0.14, 0.02), plintMinus);
      }
    };
    const padat = (ua, ub) => {
      if (ub <= ua) return;
      const u = (ua + ub) / 2;
      if (sumbuX) b.padat(u, tetap, ub - ua, TEBAL + 0.04);
      else b.padat(tetap, u, TEBAL + 0.04, ub - ua);
    };

    const penutup = { b, meshes: [], papan: [], tingkat: 1 };
    let kursor = u0;
    for (const l of [...lubang].sort((a, b2) => a.di - b2.di)) {
      const a = l.di - l.lebar / 2;
      const z = l.di + l.lebar / 2;
      const bawah = l.bawah ?? 0;
      const atas = l.atas ?? 2.2;
      balok(kursor, a, 0, tinggi);
      padat(kursor, a);
      if (bawah > 0) {
        balok(a, z, 0, bawah);
        padat(a, z);
      }
      balok(a, z, atas, tinggi);
      const kusen = l.kusen ?? "#FFFFFF";
      for (const s of [a, z]) b.k(titik(s, (bawah + atas) / 2), ukuran(0.08, atas - bawah, TEBAL + 0.06), kusen);
      b.k(titik(l.di, atas), ukuran(l.lebar + 0.08, 0.08, TEBAL + 0.06), kusen);
      if (bawah > 0) {
        b.k(titik(l.di, bawah), ukuran(l.lebar + 0.08, 0.06, TEBAL + 0.1), kusen);
        b.k(titik(l.di, (bawah + atas) / 2), ukuran(l.lebar, atas - bawah, 0.03), "#BFE3F2");
        for (const f of [-0.25, 0, 0.25]) {
          b.k(titik(l.di + l.lebar * f, (bawah + atas) / 2), ukuran(0.02, atas - bawah, 0.06), "#6F7D88");
        }
        if (l.gorden) {
          const sisi = l.gordenSisi ?? 1;
          for (const s of [-1, 1]) {
            for (const dx of [-0.08, 0.02, 0.1]) {
              b.k(
                titik(l.di + s * (l.lebar / 2 - 0.06) + dx, (bawah + atas + 0.1) / 2, sisi * 0.12),
                ukuran(0.08, atas - bawah + 0.14, 0.03),
                l.gorden,
              );
            }
          }
          b.k(titik(l.di, atas + 0.08, sisi * 0.12), ukuran(l.lebar + 0.3, 0.03, 0.03), "#8A6242");
        }
      }
      if (l.jenis === "pintu") {
        const engsel = new THREE.Group();
        engsel.position.set(...titik(a + 0.04, 0));
        const dalam = new THREE.Group();
        engsel.rotation.y = sumbuX ? 0 : -Math.PI / 2;
        engsel.add(dalam);
        const daun = new Bangun();
        const lebarDaun = l.lebar - 0.08;
        daun.k([lebarDaun / 2, (atas - 0.04) / 2, 0], [lebarDaun, atas - 0.04, 0.06], l.warna);
        daun.k([lebarDaun / 2, atas * 0.7, 0], [lebarDaun * 0.72, atas * 0.32, 0.09], "#FFFFFF");
        daun.k([lebarDaun / 2, atas * 0.28, 0], [lebarDaun * 0.72, atas * 0.32, 0.09], "#FFFFFF");
        daun.o([lebarDaun - 0.1, 1, 0.07], 0.04, "#E0B13C", null, 8);
        daun.o([lebarDaun - 0.1, 1, -0.07], 0.04, "#E0B13C", null, 8);
        penutup.daun = { daun, dalam };
        d.scene.add(engsel);
        d.pintu.push({ x: sumbuX ? l.di : tetap, z: sumbuX ? tetap : l.di, dalam, ayun: l.ayun ?? 1, buka: 0 });
      }
      if (l.papan) {
        const papan = papanTulis(l.papan, { lebar: 0.9, tinggi: 0.22, latar: "#FFFDF7", tepi: "#A9744A" });
        const sisi = l.papanSisi ?? 1;
        papan.position.set(...titik(l.di, atas + 0.2, sisi * (TEBAL / 2 + 0.03)));
        if (sumbuX) papan.rotation.y = sisi > 0 ? 0 : Math.PI;
        else papan.rotation.y = sisi > 0 ? Math.PI / 2 : -Math.PI / 2;
        d.scene.add(papan);
        penutup.papan.push(papan);
      }
      kursor = z;
    }
    balok(kursor, u1, 0, tinggi);
    padat(kursor, u1);
    d.penutup.push(penutup);
    return penutup;
  };

  // Rumah 16 x 13 meter, muka menghadap selatan (+z).
  const hijau = "#2A7F6F";
  const kayu = "#B98454";
  const dinding = {};

  // Sisi depan (z = 0)
  dinding.depanAfdi = buat({ x1: -8, z1: 0, x2: -3, z2: 0, plus: LUAR, minus: RUANG.afdi, plintPlus: "#DCE7E0", plintMinus: "#E9EEF2", lubang: [{ di: -5.5, lebar: 1.4, bawah: 0.9, atas: 2.2, gorden: "#2B3C91", gordenSisi: -1 }] });
  dinding.depanTamu = buat({
    x1: -3, z1: 0, x2: 3, z2: 0, plus: LUAR, minus: RUANG.tamu, plintPlus: "#DCE7E0",
    lubang: [
      { di: -2, lebar: 1.1, bawah: 0.9, atas: 2.2, gorden: "#2EC4B6", gordenSisi: -1 },
      { di: 0, lebar: 1.2, jenis: "pintu", warna: hijau, ayun: 1 },
      { di: 2, lebar: 1.1, bawah: 0.9, atas: 2.2, gorden: "#2EC4B6", gordenSisi: -1 },
    ],
  });
  dinding.depanOrtu = buat({ x1: 3, z1: 0, x2: 8, z2: 0, plus: LUAR, minus: RUANG.ortu, plintPlus: "#DCE7E0", lubang: [{ di: 5.5, lebar: 1.4, bawah: 0.9, atas: 2.2, gorden: "#E85D75", gordenSisi: -1 }] });

  // Sisi belakang (z = -13)
  dinding.belakangGempi = buat({ x1: -8, z1: -13, x2: -3, z2: -13, plus: RUANG.gempi, minus: LUAR, plintPlus: "#FFFFFF", plintMinus: "#DCE7E0", lubang: [{ di: -4.2, lebar: 1.2, bawah: 1, atas: 2.2, gorden: "#FF9CC2" }] });
  dinding.belakangTengah = buat({ x1: -3, z1: -13, x2: 3, z2: -13, plus: RUANG.tengah, minus: LUAR, plintMinus: "#DCE7E0", lubang: [{ di: -1.4, lebar: 1.1, bawah: 1, atas: 2.2, gorden: "#2EC4B6" }] });
  dinding.belakangDapur = buat({
    x1: 3, z1: -13, x2: 8, z2: -13, plus: RUANG.dapur, minus: LUAR, plintMinus: "#DCE7E0",
    lubang: [
      { di: 3.95, lebar: 1, bawah: 1.15, atas: 2.2, gorden: "#F2788F" },
      { di: 6.9, lebar: 1.2, jenis: "pintu", warna: kayu, ayun: -1 },
    ],
  });

  // Sisi barat dan timur
  dinding.baratAfdi = buat({ x1: -8, z1: -5.5, x2: -8, z2: 0, plus: RUANG.afdi, minus: LUAR, plintPlus: "#E9EEF2", plintMinus: "#DCE7E0", lubang: [{ di: -3.9, lebar: 1, bawah: 1.1, atas: 2.1, gorden: "#2B3C91" }] });
  dinding.baratGempi = buat({ x1: -8, z1: -13, x2: -8, z2: -5.5, plus: RUANG.gempi, minus: LUAR, plintPlus: "#FFFFFF", plintMinus: "#DCE7E0" });
  dinding.timurOrtu = buat({ x1: 8, z1: -5.5, x2: 8, z2: 0, plus: LUAR, minus: RUANG.ortu, plintPlus: "#DCE7E0", lubang: [{ di: -0.9, lebar: 0.9, bawah: 1, atas: 2.1, gorden: "#E85D75", gordenSisi: -1 }] });
  dinding.timurDapur = buat({ x1: 8, z1: -13, x2: 8, z2: -5.5, plus: LUAR, minus: RUANG.dapur, plintPlus: "#DCE7E0", lubang: [{ di: -8.5, lebar: 1.2, bawah: 1.1, atas: 2.2, gorden: "#F2788F", gordenSisi: -1 }] });

  // Sekat dalam
  dinding.sekatAfdi = buat({ x1: -3, z1: -5.5, x2: -3, z2: 0, plus: RUANG.tamu, minus: RUANG.afdi, plintMinus: "#E9EEF2", lubang: [{ di: -2.75, lebar: 1.2, jenis: "pintu", warna: "#3A4FB8", ayun: -1, papan: "Kamar Afdi", papanSisi: 1 }] });
  dinding.sekatGempi = buat({ x1: -3, z1: -13, x2: -3, z2: -5.5, plus: RUANG.tengah, minus: RUANG.gempi, plintMinus: "#FFFFFF", lubang: [{ di: -9, lebar: 1.2, jenis: "pintu", warna: "#FFB98A", ayun: -1, papan: "Kamar Gempi", papanSisi: 1 }] });
  dinding.sekatOrtu = buat({ x1: 3, z1: -5.5, x2: 3, z2: 0, plus: RUANG.ortu, minus: RUANG.tamu, lubang: [{ di: -2.75, lebar: 1.2, jenis: "pintu", warna: kayu, ayun: 1, papan: "Kamar Bapak Ibu", papanSisi: -1 }] });
  dinding.sekatDapur = buat({ x1: 3, z1: -13, x2: 3, z2: -5.5, plus: RUANG.dapur, minus: RUANG.tengah, lubang: [{ di: -9, lebar: 1.7, kusen: "#D9A873", papan: "Dapur", papanSisi: -1 }] });
  dinding.tengahAfdi = buat({ x1: -8, z1: -5.5, x2: -3, z2: -5.5, plus: RUANG.afdi, minus: RUANG.gempi, plintPlus: "#E9EEF2", plintMinus: "#FFFFFF" });
  dinding.tengahTamu = buat({ x1: -3, z1: -5.5, x2: 3, z2: -5.5, plus: RUANG.tamu, minus: RUANG.tengah, lubang: [{ di: 0, lebar: 2.4, atas: 2.4, kusen: "#D9A873" }] });
  dinding.tengahOrtu = buat({ x1: 3, z1: -5.5, x2: 8, z2: -5.5, plus: RUANG.ortu, minus: RUANG.dapur });

  return dinding;
};

/* ---------- Lantai ---------- */

const lantai = (b, x1, z1, x2, z2, warna, nat, langkah = 0.6) => {
  const lebar = x2 - x1;
  const dalam = z2 - z1;
  b.k([(x1 + x2) / 2, 0.01, (z1 + z2) / 2], [lebar, 0.02, dalam], warna);
  if (!nat) return;
  for (let x = x1 + langkah; x < x2 - 0.01; x += langkah) b.k([x, 0.021, (z1 + z2) / 2], [0.015, 0.002, dalam], nat);
  for (let z = z1 + langkah; z < z2 - 0.01; z += langkah) b.k([(x1 + x2) / 2, 0.021, z], [lebar, 0.002, 0.015], nat);
};

/* ---------- Perabot, disalin dari latar video ---------- */

const sofa = (b) => {
  b.k([0, 0.34, 0], [3.5, 0.5, 1.1], "#2EC4B6");
  b.k([0, 1.02, -0.45], [3.5, 1, 0.25], "#27AFA2");
  for (const x of [-1.68, 1.68]) b.k([x, 0.65, 0], [0.26, 0.82, 1.14], "#27AFA2");
  for (const x of [-1.05, 0, 1.05]) b.k([x, 0.65, 0.05], [1, 0.14, 0.96], "#44D3C6");
  b.k([-1.1, 0.98, -0.2], [0.56, 0.54, 0.16], "#F4B942", [-0.2, 0.2, 0.08]);
  b.k([1.15, 0.98, -0.2], [0.56, 0.54, 0.16], "#E85D75", [-0.2, -0.2, -0.08]);
  b.padat(0, -0.1, 3.7, 1.3);
};

const fotoKeluarga = (b) => {
  b.k([0, 0, 0], [1.7, 1.16, 0.04], "#8A5A2B");
  b.k([0, 0, 0.025], [1.52, 0.98, 0.01], "#FFFDF7");
  for (const [x, h, c] of [[-0.5, 0.74, "#2EC4B6"], [-0.15, 0.66, "#E85D75"], [0.2, 0.82, "#3A4FB8"], [0.52, 0.5, "#FFD23F"]]) {
    b.di([x, -0.48 + h / 2, 0.035], 0, 1, () => {
      b.k([0, -0.1, 0], [0.24, h - 0.2, 0.005], c);
      b.k([0, h / 2 - 0.08, 0], [0.17, 0.17, 0.005], "#D2A679");
    });
  }
};

// Meja TV menghadap +z. Layarnya dibuat terpisah di perabot() supaya bisa bergerak.
const mejaTv = (b) => {
  b.k([0, 0.42, 0], [2.4, 0.84, 0.75], "#B98454");
  for (const x of [-0.6, 0.6]) b.k([x, 0.42, 0.385], [1.04, 0.68, 0.02], "#D9A873");
  b.k([0, 1.72, -0.02], [1.82, 1.05, 0.1], "#1E232B");
  b.n([0, 1.72, 0.04], [1.7, 0.93, 0.01], "#6BC4E8");
  b.k([0, 0.98, 0], [0.5, 0.28, 0.4], "#3E4A52");
  b.padat(0, 0, 2.5, 0.85);
};

const tanaman = (b) => {
  b.t([0, 0.34, 0], 0.34, 0.24, 0.68, "#C98A63");
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.o([Math.cos(a) * 0.32, 1.02 + (i % 2) * 0.38, Math.sin(a) * 0.32], 0.32, i % 2 === 0 ? "#57A869" : "#7DBB86", [0.6, 1.1, 0.9], 8);
  }
  b.padat(0, 0, 0.75, 0.75);
};

const konter = (b) => {
  b.k([-0.3, 0.55, 0], [5.2, 1.1, 0.9], "#D9A873");
  b.k([-0.3, 1.13, 0], [5.3, 0.07, 0.96], "#EFE7D8");
  for (const x of [-2.2, -1.2, -0.2, 0.8, 1.8]) {
    b.k([x, 0.55, 0.46], [0.9, 0.9, 0.03], "#E6BC8D");
    b.o([x + 0.3, 0.72, 0.5], 0.04, "#8A6242", null, 6);
  }
  // Bak cuci
  b.k([-1.8, 1.17, 0], [1, 0.02, 0.6], "#C5CDD2");
  b.t([-1.8, 1.4, -0.3], 0.03, 0.03, 0.46, "#B8C0C6");
  b.t([-1.8, 1.62, -0.16], 0.025, 0.025, 0.3, "#B8C0C6", [Math.PI / 2, 0, 0]);
  // Penanak nasi
  b.di([-0.45, 1.17, -0.05], 0, 1, () => {
    b.t([0, 0.2, 0], 0.26, 0.24, 0.4, "#FFFDF7");
    b.o([0, 0.4, 0], 0.26, "#F2788F", [1, 0.35, 1]);
    b.n([0, 0.14, 0.25], [0.14, 0.08, 0.02], "#FF9F1C");
  });
  // Cobek dan ulekan
  b.di([0.3, 1.17, 0.1], 0, 1, () => {
    b.t([0, 0.05, 0], 0.24, 0.14, 0.1, "#6F6A66");
    b.t([0.05, 0.14, 0], 0.04, 0.055, 0.24, "#8A8480", [0, 0, -0.9]);
  });
  // Ceret
  b.di([1.15, 1.17, 0], 0, 1, () => {
    b.t([0, 0.16, 0], 0.14, 0.22, 0.32, "#D7DEE2");
    b.t([0.24, 0.2, 0], 0.03, 0.05, 0.26, "#D7DEE2", [0, 0, -0.8]);
    b.k([0, 0.42, 0], [0.24, 0.04, 0.04], "#2A1F1A");
  });
  b.padat(-0.3, 0, 5.3, 1);
};

const rakDapur = (b) => {
  b.k([0, 0, 0], [1.9, 0.06, 0.36], "#B98454");
  for (const [x, tutup] of [[-0.72, "#E85D75"], [-0.34, "#F4B942"], [0.04, "#7DBB86"], [0.42, "#FF7A3D"]]) {
    b.t([x, 0.2, 0], 0.13, 0.13, 0.34, "#F2E7CE");
    b.t([x, 0.4, 0], 0.14, 0.14, 0.06, tutup);
  }
};

const kulkas = (b) => {
  b.k([0, 1.65, 0], [1.15, 3.3, 1.05], "#BFE3D6");
  b.k([0, 2.65, 0.535], [1.1, 1.2, 0.03], "#CDEBE0");
  b.k([0, 1.02, 0.535], [1.1, 1.9, 0.03], "#CDEBE0");
  b.k([0.42, 2.25, 0.57], [0.06, 0.42, 0.05], "#8E979D");
  b.k([0.42, 1.5, 0.57], [0.06, 0.42, 0.05], "#8E979D");
  b.k([-0.15, 1.6, 0.56], [0.34, 0.46, 0.01], "#FFFDF7");
  b.o([-0.15, 1.8, 0.56], 0.05, "#E85D75", null, 6);
  b.o([0.05, 2.65, 0.56], 0.06, "#F4B942", null, 6);
  b.padat(0, 0, 1.2, 1.1);
};

const mejaMasak = (b) => {
  const y = 1.08;
  b.k([0, y - 0.03, 0], [3.3, 0.06, 1.25], "#C98F5A");
  b.k([0, y + 0.005, 0], [3.4, 0.015, 1.34], "#FFF3C7");
  for (let i = 0; i < 9; i++) b.k([-1.6 + i * 0.4, y - 0.12, 0.67], [0.34, 0.22, 0.015], i % 2 === 0 ? "#E85D75" : "#FFF3C7");
  for (const [x, z] of [[-1.5, -0.5], [1.5, -0.5], [-1.5, 0.5], [1.5, 0.5]]) b.k([x, (y - 0.06) / 2, z], [0.11, y - 0.06, 0.11], "#A97849");
  // Kompor dan wajan
  b.di([0.98, y + 0.01, -0.1], 0, 1, () => {
    b.k([0, 0.06, 0], [0.8, 0.12, 0.62], "#3E4A52");
    b.t([0, 0.34, 0], 0.46, 0.2, 0.14, "#2E2F33", null, 16);
    b.t([0, 0.42, 0], 0.42, 0.42, 0.01, "#D98A3A", null, 16);
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9;
      const r = 0.12 + (i % 3) * 0.1;
      b.k([Math.cos(a) * r, 0.44, Math.sin(a) * r], [0.07, 0.04, 0.07], ["#7DBB86", "#E85D3A", "#FFD23F"][i % 3]);
    }
  });
  // Talenan
  b.di([-1.2, y + 0.02, 0.08], 0, 1, () => {
    b.k([0, 0.03, 0], [0.75, 0.05, 0.5], "#D9A873");
    for (const x of [-0.2, -0.05, 0.1]) b.t([x, 0.07, -0.05], 0.05, 0.05, 0.02, "#E85D3A", null, 8);
    b.o([0.24, 0.1, 0.1], 0.07, "#C96A8E", null, 8);
    b.o([0.12, 0.09, 0.14], 0.055, "#C96A8E", null, 8);
  });
  // Tudung saji
  b.di([-0.28, y + 0.02, 0.2], 0, 1, () => {
    b.o([0, 0, 0], 0.42, "#E9C46A", [1, 0.55, 1]);
    b.t([0, 0.02, 0], 0.43, 0.43, 0.04, "#C9884B");
    b.o([0, 0.26, 0], 0.06, "#E85D75", null, 6);
  });
  // Tabung gas hijau
  b.di([-0.95, 0, 0.1], 0, 1, () => {
    b.t([0, 0.34, 0], 0.23, 0.23, 0.46, "#58B368");
    b.o([0, 0.57, 0], 0.23, "#58B368", [1, 0.45, 1]);
    b.o([0, 0.11, 0], 0.23, "#58B368", [1, 0.45, 1]);
    b.t([0, 0.72, 0], 0.07, 0.07, 0.08, "#E0B13C");
  });
  b.padat(0, 0, 3.5, 1.4);
};

const kasurAfdi = (b) => {
  b.k([0, 0.2, 0], [1.8, 0.34, 3.4], "#8D6A4A");
  b.k([0, 0.5, 0], [1.72, 0.32, 3.32], "#FFFDF7");
  b.k([0.02, 0.6, 0.45], [1.76, 0.2, 2.3], "#FF7A3D");
  b.k([0.02, 0.6, -0.42], [1.76, 0.21, 0.28], "#FFD8C2");
  b.o([0, 0.82, -1.25], 0.5, "#C5DDEC", [1.35, 0.42, 0.75]);
  b.k([0.3, 0.74, 0.65], [0.8, 0.08, 0.7], "#3A4FB8", [0, 0.3, 0]);
  b.padat(0, 0, 1.9, 3.5);
};

const mejaAfdi = (b) => {
  b.k([0, 1.2, 0], [2.6, 0.08, 1.05], "#8D6A4A");
  for (const x of [-1.2, 1.2]) b.k([x, 0.6, 0], [0.1, 1.2, 0.9], "#6F5238");
  // Layar hanya bentuk abstrak, tanpa aset game mana pun.
  b.di([0.25, 1.24, -0.18], 0, 1, () => {
    b.k([0, 0.82, 0], [1.6, 0.98, 0.07], "#1E232B");
    b.n([0, 0.82, 0.04], [1.48, 0.86, 0.01], "#253B6E");
    b.n([0, 0.52, 0.05], [1.48, 0.26, 0.005], "#3E8E5A");
    for (let i = 0; i < 3; i++) b.n([-0.45 + i * 0.42, 0.58 + (i % 2) * 0.08, 0.055], [0.1, 0.16, 0.005], ["#FFD23F", "#FF6FA3", "#7DE3F4"][i]);
    b.n([0.2, 1.1, 0.055], [0.5, 0.05, 0.005], "#FF7A3D");
    b.k([0, 0.2, 0], [0.1, 0.34, 0.07], "#3E4A52");
    b.k([0, 0.04, 0], [0.5, 0.05, 0.28], "#3E4A52");
  });
  b.k([0.25, 1.26, 0.28], [0.92, 0.04, 0.3], "#22272E");
  for (let i = 0; i < 5; i++) b.n([-0.11 + i * 0.18, 1.285, 0.28], [0.16, 0.01, 0.25], ["#FF6FA3", "#FFD23F", "#7DE3F4", "#2EC4B6", "#FF7A3D"][i]);
  b.o([0.92, 1.27, 0.28], 0.08, "#22272E", [0.8, 0.5, 1.2], 8);
  b.t([-0.85, 1.36, 0.1], 0.11, 0.11, 0.24, "#FF7A3D");
  b.k([-0.42, 1.42, -0.15], [0.24, 0.36, 0.22], "#2B3C91");
  // Kotak perkakas
  b.di([-0.65, 0, 0.1], 0, 1, () => {
    b.k([0, 0.22, 0], [0.92, 0.44, 0.44], "#E23D3D");
    b.k([0, 0.46, 0], [0.94, 0.06, 0.46], "#B92C2C");
    b.k([0, 0.56, 0], [0.42, 0.05, 0.06], "#22272E");
    b.k([0, 0.34, 0.23], [0.14, 0.1, 0.02], "#D7DEE2");
  });
  b.padat(0, 0, 2.7, 1.1);
};

const kursiGaming = (b) => {
  b.t([0, 0.3, 0], 0.04, 0.04, 0.6, "#3E4A52");
  b.k([0, 0.65, 0], [0.82, 0.14, 0.82], "#2B3C91");
  b.k([0, 1.32, -0.38], [0.74, 1.2, 0.14], "#2B3C91");
  b.k([0, 1.65, -0.3], [0.5, 0.2, 0.05], "#FF7A3D");
  b.padat(0, 0, 0.8, 0.8);
};

const gitar = (b) => {
  b.o([0, 0.48, 0], 0.4, "#C9884B", [1, 1.15, 0.28]);
  b.o([0, 1.06, 0], 0.3, "#C9884B", [1, 1.05, 0.28]);
  b.t([0, 0.72, 0.1], 0.11, 0.11, 0.02, "#2A1F1A", [Math.PI / 2, 0, 0]);
  b.k([0, 1.75, 0.04], [0.11, 1.2, 0.05], "#5A3D28");
  b.k([0, 2.42, 0.04], [0.18, 0.26, 0.05], "#3B2A20");
  b.padat(0, 0, 0.7, 0.4);
};

const kasurGempi = (b) => {
  b.k([0, 0.2, 0], [2.6, 0.34, 1.4], "#E9C8A0");
  b.k([-1.27, 0.7, 0], [0.1, 1.4, 1.42], "#E9C8A0");
  b.k([0, 0.5, 0], [2.52, 0.3, 1.34], "#FFFDF7");
  for (let i = 0; i < 6; i++) {
    b.k([0.05 + (i % 3) * 0.62 - 0.32, 0.67, i < 3 ? -0.33 : 0.33], [0.62, 0.05, 0.68], ["#FF9CC2", "#FFD23F", "#A8E6E0", "#B9A5F2", "#FFB98A", "#9BE3A5"][i]);
  }
  b.o([-0.92, 0.8, 0], 0.36, "#FFE3EE", [0.75, 0.4, 1.3]);
  // Mainan kancil
  b.di([0.1, 0.7, 0.1], 0, 0.75, () => {
    b.k([0, 0.18, 0], [0.3, 0.24, 0.48], "#C98A54");
    b.k([0, 0.42, 0.22], [0.24, 0.26, 0.24], "#C98A54");
    b.k([0, 0.36, 0.36], [0.14, 0.12, 0.08], "#F3DEC0");
    b.k([0, 0.38, 0.405], [0.05, 0.04, 0.02], "#2A1F1A");
    for (const s of [-1, 1]) {
      b.k([s * 0.13, 0.62, 0.2], [0.06, 0.18, 0.08], "#A9713F");
      b.k([s * 0.08, 0.46, 0.34], [0.05, 0.05, 0.01], "#2A1F1A");
      b.k([s * 0.1, 0.03, 0.14], [0.07, 0.1, 0.07], "#A9713F");
      b.k([s * 0.1, 0.03, -0.14], [0.07, 0.1, 0.07], "#A9713F");
    }
  });
  b.padat(0, 0, 2.7, 1.5);
};

const kudaKuda = (b) => {
  b.k([-0.55, 1.1, 0], [0.07, 2.25, 0.07], "#B98454", [0, 0, -0.12]);
  b.k([0.55, 1.1, 0], [0.07, 2.25, 0.07], "#B98454", [0, 0, 0.12]);
  b.k([0, 1.1, -0.42], [0.07, 2.25, 0.07], "#B98454", [-0.32, 0, 0]);
  b.k([0, 1.08, 0.08], [1.4, 0.07, 0.14], "#B98454");
  b.di([0, 1.78, 0.09], [-0.06, 0, 0], 1, () => {
    b.k([0, 0, 0], [1.4, 1.2, 0.05], "#FFFDF7");
    b.k([0, 0.28, 0.03], [1.28, 0.54, 0.005], "#A8E6F4");
    b.k([0, -0.26, 0.03], [1.28, 0.54, 0.005], "#9BE3A5");
    b.o([0.42, 0.34, 0.03], 0.13, "#FFD23F", [1, 1, 0.05]);
    b.k([-0.32, -0.08, 0.035], [0.07, 0.42, 0.005], "#8A5A2B");
    b.o([-0.32, 0.2, 0.035], 0.2, "#3FA66A", [1, 1, 0.05]);
    b.k([0.1, -0.34, 0.04], [0.5, 0.05, 0.005], "#FF6FA3");
  });
  ["#FF6FA3", "#2EC4B6", "#FFD23F"].forEach((c, i) => b.t([0.3 + i * 0.2 - 0.55, 1.2, 0.12], 0.05, 0.05, 0.12, c));
  b.padat(0, -0.1, 1.5, 0.9);
};

const rakBuku = (b) => {
  b.k([0, 1.8, -0.19], [1.8, 3.6, 0.06], "#F4DEC0");
  for (const y of [0.06, 0.92, 1.78, 2.64, 3.5]) b.k([0, y, 0], [1.8, 0.07, 0.44], "#E9C8A0");
  for (const x of [-0.9, 0.9]) b.k([x, 1.8, 0], [0.06, 3.6, 0.44], "#E9C8A0");
  [0.1, 0.96, 1.82, 2.68].forEach((y, rak) => {
    for (let i = 0; i < 9; i++) {
      const h = 0.48 + ((i * 7 + rak * 3) % 4) * 0.08;
      b.k([-0.76 + i * 0.17, y + h / 2, 0], [0.14, h, 0.3], ["#FF6FA3", "#FFD23F", "#2EC4B6", "#8B6FE8", "#FF7A3D", "#FFFDF7"][(i + rak * 2) % 6]);
    }
  });
  b.padat(0, 0, 1.9, 0.55);
};

const gambarAnak = (b, bg, a, c, rotZ) => {
  b.di([0, 0, 0], [0, 0, rotZ], 1, () => {
    b.k([0, 0, 0], [0.74, 0.92, 0.012], bg);
    b.o([-0.1, 0.12, 0.01], 0.17, a, [1, 1, 0.05], 8);
    b.k([0.1, -0.2, 0.011], [0.42, 0.2, 0.006], c);
    b.k([0, 0.45, 0.012], [0.2, 0.06, 0.004], "#FFF3C7");
  });
};

const poster = (b, bg, a, c, rotZ) => {
  b.di([0, 0, 0], [0, 0, rotZ], 1, () => {
    b.k([0, 0, 0], [0.92, 1.28, 0.015], bg);
    b.o([0, 0.18, 0.01], 0.26, a, [1, 1, 0.05], 8);
    b.k([0, -0.32, 0.012], [0.66, 0.1, 0.01], c);
    b.k([0, -0.47, 0.012], [0.46, 0.06, 0.01], c);
  });
};

/* ---------- Mengisi ruangan ---------- */

export const pasangPerabot = (d, dinding) => {
  const b = d.dalam;

  // Lantai tiap ruangan
  lantai(b, -3, -5.5, 3, 0, "#E9D9BD", "#CDBB98");
  lantai(b, -3, -13, 3, -5.5, "#E9D9BD", "#CDBB98");
  lantai(b, 3, -13, 8, -5.5, "#F1F4EE", "#CFE3DC", 0.5);
  lantai(b, -8, -5.5, -3, 0, "#CFB48F", null);
  lantai(b, -8, -13, -3, -5.5, "#E7CFA8", null);
  lantai(b, 3, -5.5, 8, 0, "#E6D4B2", "#CDBB98", 0.8);

  // Ruang tamu: kursi tamu, meja kecil, lemari pajangan
  b.di([0, 0.03, -2.7], 0, 1, () => {
    b.k([0, 0, 0], [3, 0.012, 2], "#C9445C");
    b.k([0, 0.008, 0], [2.7, 0.012, 1.7], "#F7D9A3");
  });
  const kursiTamu = (x, z, rot) =>
    b.di([x, 0, z], rot, S, () => {
      b.k([0, 0.45, 0], [1.3, 0.3, 1.2], "#B98454");
      b.k([0, 0.65, 0.02], [1.15, 0.12, 1.05], "#E85D75");
      b.k([0, 1.15, -0.52], [1.3, 1.1, 0.18], "#B98454");
      for (const s of [-1, 1]) b.k([s * 0.62, 0.75, 0], [0.12, 0.2, 1.1], "#8D6A4A");
      for (const [px, pz] of [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]]) b.k([px, 0.2, pz], [0.1, 0.4, 0.1], "#8D6A4A");
      b.padat(0, 0, 1.4, 1.35);
    });
  kursiTamu(-2.3, -0.8, Math.PI / 2 + 0.4);
  kursiTamu(-2.3, -4.7, Math.PI / 2 - 0.3);
  kursiTamu(2.3, -0.8, -Math.PI / 2 - 0.4);
  b.di([2.3, 0, -4.7], -Math.PI / 2 + 0.3, S, () => tanaman(b));
  b.di([-1.3, 0, -0.65], 0, S, () => {
    b.t([0, 0.72, 0], 0.5, 0.5, 0.06, "#8D6A4A", null, 16);
    b.t([0, 0.36, 0], 0.07, 0.14, 0.7, "#6F5238");
    b.t([0.12, 0.84, 0], 0.09, 0.09, 0.18, "#FFFDF7");
    b.t([-0.15, 0.82, 0.08], 0.13, 0.08, 0.1, "#2B7BBA");
    b.padat(0, 0, 1, 1);
  });

  // Ruang tengah: sofa, TV, karpet, meja makan
  b.k([-0.2, 0.03, -11.2], [3.4, 0.012, 2.8], "#C9445C");
  b.k([-0.2, 0.036, -11.2], [3.1, 0.012, 2.5], "#F7D9A3");
  b.di([2.4, 0, -11.3], -Math.PI / 2, S, () => sofa(b));
  b.di([-2.75, 0, -11.3], Math.PI / 2, S, () => mejaTv(b));
  b.di([-2.45, 0, -6.1], 0, S, () => tanaman(b));
  // Meja makan dengan empat kursi plastik
  b.di([1.7, 0, -6.9], 0, 1, () => {
    b.k([0, 0.73, 0], [1.7, 0.05, 1], "#C98F5A");
    b.k([0, 0.76, 0], [1.76, 0.012, 1.06], "#FFF3C7");
    for (const [x, z] of [[-0.75, -0.42], [0.75, -0.42], [-0.75, 0.42], [0.75, 0.42]]) b.k([x, 0.36, z], [0.07, 0.72, 0.07], "#A97849");
    b.o([0, 0.84, 0], 0.26, "#E9C46A", [1, 0.55, 1]);
    b.o([0, 0.98, 0], 0.035, "#E85D75", null, 6);
    for (const x of [-0.5, 0.5]) {
      b.t([x, 0.8, 0.3], 0.1, 0.07, 0.03, "#FFFFFF");
      b.t([x, 0.8, -0.3], 0.1, 0.07, 0.03, "#FFFFFF");
      for (const s of [-1, 1]) {
        b.k([x, 0.42, s * 0.72], [0.36, 0.03, 0.36], "#E23D3D");
        b.k([x, 0.2, s * 0.72], [0.3, 0.4, 0.3], "#C93030");
      }
    }
    b.padat(0, 0, 1.8, 1.9);
  });
  // Foto keluarga di dinding belakang ruang tengah
  dinding.belakangTengah.b.di([0.9, 1.75, -12.9], 0, S, () => fotoKeluarga(dinding.belakangTengah.b));

  // Dapur
  // Keramik hanya di samping jendela, supaya tidak menutup jendela dan pintu belakang.
  dinding.belakangDapur.b.k([5.4, 0.85, -12.91], [1.8, 1.7, 0.02], "#F7FBF8");
  for (let i = 0; i < 5; i++) dinding.belakangDapur.b.k([5.4, 0.14 + i * 0.32, -12.895], [1.8, 0.012, 0.004], "#CFE3DC");
  for (let i = 0; i < 6; i++) dinding.belakangDapur.b.k([4.6 + i * 0.32, 0.85, -12.895], [0.012, 1.7, 0.004], "#CFE3DC");
  dinding.belakangDapur.b.k([5.4, 1.72, -12.9], [1.8, 0.05, 0.03], "#2EC4B6");
  dinding.belakangDapur.b.di([5.3, 2, -12.82], 0, S, () => rakDapur(dinding.belakangDapur.b));
  b.di([4.75, 0, -12.65], 0, S, () => konter(b));
  b.di([7.5, 0, -6.15], Math.PI, S, () => kulkas(b));
  b.di([5.6, 0, -9.55], 0, S, () => mejaMasak(b));
  // Ember plastik dan bangku
  b.t([3.55, 0.15, -6.1], 0.2, 0.15, 0.3, "#2B7BBA");
  b.padat(3.55, -6.1, 0.42, 0.42);

  // Kamar Afdi
  b.k([-5.4, 0.03, -2.6], [2.4, 0.012, 1.8], "#E9DCC3");
  b.k([-5.4, 0.036, -2.6], [2.2, 0.012, 1.6], "#3A4FB8");
  b.di([-7.4, 0, -1.1], 0, S, () => kasurAfdi(b));
  b.di([-5.3, 0, -5.05], 0, S, () => mejaAfdi(b));
  b.di([-5, 0, -4.15], 2.9, S, () => kursiGaming(b));
  b.di([-7.45, 0, -5.15], 0.2, S, () => gitar(b));
  // Kipas berdiri (bilahnya bergerak, dibuat di bawah)
  b.di([-3.55, 0, -4.9], 0, S, () => {
    b.t([0, 0.04, 0], 0.3, 0.34, 0.08, "#F2F2EE");
    b.t([0, 0.8, 0], 0.04, 0.04, 1.5, "#D7DEE2");
    b.padat(0, 0, 0.7, 0.7);
  });
  const dindingAfdi = dinding.tengahAfdi.b;
  dindingAfdi.di([-6.4, 2.2, -5.41], 0, S, () => poster(dindingAfdi, "#FF7A3D", "#FFD23F", "#FFFDF7", -0.04));
  dindingAfdi.di([-4, 2.15, -5.41], 0, S, () => poster(dindingAfdi, "#22272E", "#2EC4B6", "#FF6FA3", 0.03));
  // Rak dinding Afdi: buku, helm, piala polos
  const baratAfdi = dinding.baratAfdi.b;
  baratAfdi.di([-7.85, 2.2, -1.2], 0, S, () => {
    baratAfdi.k([0, 0, 0], [0.38, 0.06, 2.4], "#8D6A4A");
    ["#E23D3D", "#FFD23F", "#2EC4B6", "#FFFDF7", "#3A4FB8"].forEach((c, i) => baratAfdi.k([0, 0.27, -1 + i * 0.13], [0.28, 0.48 + (i % 2) * 0.08, 0.11], c));
    baratAfdi.o([0, 0.27, 0.02], 0.25, "#22272E");
    baratAfdi.k([0.22, 0.29, 0.02], [0.06, 0.15, 0.36], "#7DE3F4");
    baratAfdi.di([0, 0.03, 0.72], 0, 1, () => {
      baratAfdi.k([0, 0.04, 0], [0.2, 0.08, 0.2], "#3B2A20");
      baratAfdi.t([0, 0.22, 0], 0.05, 0.05, 0.28, "#F2C23A");
      baratAfdi.t([0, 0.46, 0], 0.16, 0.06, 0.24, "#F2C23A");
    });
  });
  // Lampu LED berganti warna di atas dinding kamar Afdi
  const bahanLed = new THREE.MeshBasicMaterial({ color: "#FF6FA3", toneMapped: false });
  const led = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.04, 0.04), bahanLed);
  led.position.set(-5.5, 2.82, -5.38);
  d.scene.add(led);
  dinding.tengahAfdi.papan.push(led);
  d.hidup.push((t) => bahanLed.color.setHSL((t * 0.09) % 1, 0.9, 0.62));

  // Kamar Gempi
  [[1.5, "#FFFDF7"], [1.25, "#FF9CC2"], [0.9, "#FFE28A"], [0.5, "#A8E6E0"]].forEach(([r, c], i) => {
    b.t([-5.5, 0.03 + i * 0.005, -9], r, r, 0.005, c, null, 28);
  });
  b.di([-6.3, 0, -12.2], 0, S, () => kasurGempi(b));
  b.di([-3.85, 0, -11.9], -0.5, S, () => kudaKuda(b));
  b.di([-7.72, 0, -8], Math.PI / 2, S, () => rakBuku(b));
  const sekatGempi = dinding.tengahAfdi.b;
  sekatGempi.di([-6.8, 1.95, -5.6], Math.PI, S, () => gambarAnak(sekatGempi, "#FFE28A", "#FF7A3D", "#3FA66A", 0.06));
  sekatGempi.di([-5.5, 2, -5.6], Math.PI, S, () => gambarAnak(sekatGempi, "#A8E6F4", "#FFD23F", "#8B6FE8", -0.07));
  sekatGempi.di([-4.2, 1.9, -5.6], Math.PI, S, () => gambarAnak(sekatGempi, "#FFD0E0", "#2EC4B6", "#FF7A3D", -0.05));
  // Lampu tumblr di dinding kamar Gempi
  const dGempi = dinding.belakangGempi.b;
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    dGempi.o([-7.8 + t * 2.9, 2.7 - Math.sin(t * Math.PI * 3) ** 2 * 0.16, -12.88], 0.04, ["#FFE28A", "#FFB6D0", "#A8E6E0", "#FFD0A0"][i % 4], null, 6);
  }

  // Kamar Bapak dan Ibu
  b.k([5.7, 0.03, -3], [1.6, 0.012, 2.6], "#2EC4B6");
  b.di([6.9, 0, -2.75], -Math.PI / 2, 1, () => {
    b.k([0, 0.15, 0], [1.7, 0.26, 2], "#8A6242");
    b.k([0, 0.36, 0], [1.62, 0.18, 1.92], "#FFFDF7");
    b.k([0, 0.47, 0.3], [1.66, 0.06, 1.3], "#E85D75");
    b.k([0, 0.47, -0.08], [1.66, 0.065, 0.12], "#FFF3C7");
    for (const s of [-1, 1]) b.o([s * 0.42, 0.53, -0.72], 0.26, "#FFF3C7", [1.3, 0.42, 0.8]);
    b.k([0, 0.6, -1.03], [1.74, 1, 0.08], "#8A6242");
    b.padat(0, 0, 1.8, 2.15);
  });
  b.di([4.5, 0, -5.05], 0, 1, () => {
    b.k([0, 1, 0], [2.1, 2, 0.6], "#A9744A");
    for (const x of [-0.53, 0.53]) {
      b.k([x, 1, 0.31], [1, 1.86, 0.02], "#C98F5A");
      b.k([x + (x < 0 ? 0.38 : -0.38), 1, 0.33], [0.04, 0.24, 0.03], "#E0B13C");
    }
    b.padat(0, 0, 2.15, 0.65);
  });
  b.di([6.7, 0, -0.42], Math.PI, 1, () => {
    b.k([0, 0.38, 0], [1.1, 0.76, 0.46], "#C98F5A");
    b.k([0, 1.2, -0.2], [0.8, 0.9, 0.03], "#D7ECF4");
    b.k([0, 1.2, -0.22], [0.9, 1, 0.02], "#8A6242");
    b.t([-0.3, 0.84, -0.05], 0.05, 0.05, 0.14, "#E85D75");
    b.t([0.1, 0.82, -0.05], 0.04, 0.05, 0.1, "#F4B942");
    b.padat(0, 0, 1.15, 0.5);
  });
};

// Bagian yang terus bergerak di dalam rumah.
export const pasangBendaHidup = (d) => {
  const bahan = new THREE.MeshLambertMaterial({ vertexColors: true });

  // Bilah kipas di kamar Afdi
  const bilah = new Bangun();
  bilah.t([0, 0, -0.08], 0.12 * S, 0.12 * S, 0.14, "#2EC4B6", [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    bilah.k([Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0], [0.21, 0.09, 0.008], "#7DE3F4", [0, 0, a]);
  }
  const kipas = bilah.jadi(bahan);
  const baling = new THREE.Group();
  baling.position.set(-3.55, 0.93, -4.85);
  baling.add(kipas);
  d.scene.add(baling);
  d.hidup.push((t) => {
    kipas.rotation.z = t * 12;
    baling.rotation.y = -0.6 + Math.sin(t * 0.7) * 0.5;
  });

  // Api kompor
  const api = new Bangun();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    api.c([Math.cos(a) * 0.08, 0.03, Math.sin(a) * 0.08], 0.016, 0.055, "#5BB8FF");
  }
  const apiMesh = new THREE.Mesh(api.geometri(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
  apiMesh.position.set(5.6 + 0.98 * S, (1.09 + 0.14) * S, -9.55 - 0.1 * S);
  d.scene.add(apiMesh);
  d.hidup.push((t) => {
    apiMesh.scale.y = 1 + Math.sin(t * 20) * 0.25;
  });

  // Uap dari wajan
  const bahanUap = new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.25, depthWrite: false });
  const bolaUap = new THREE.SphereGeometry(1, 8, 6);
  const uap = [0, 1, 2, 3].map((i) => {
    const m = new THREE.Mesh(bolaUap, bahanUap);
    d.scene.add(m);
    return { m, i };
  });
  d.hidup.push((t) => {
    for (const { m, i } of uap) {
      const p = (t * 0.45 + i / 4) % 1;
      m.position.set(5.6 + 0.57 + Math.sin(p * 5 + i * 2) * 0.09, 0.95 + p * 0.65, -9.61 + Math.cos(p * 4 + i) * 0.06);
      m.scale.setScalar(0.03 + p * 0.08);
    }
  });

  // Layar TV: gambar kecil yang berjalan
  const bahanTv = new THREE.MeshBasicMaterial({ color: "#FFE28A", toneMapped: false });
  const tv = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.11, 0.17), bahanTv);
  d.scene.add(tv);
  d.hidup.push((t) => {
    tv.position.set(-2.71, 0.95 + Math.sin(t * 1.8) * 0.06, -11.3 + Math.sin(t * 1.2) * 0.25);
  });
};
