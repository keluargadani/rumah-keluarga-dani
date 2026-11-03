// Alat bangun dunia: ribuan balok digabung jadi satu geometri, supaya tetap ringan di HP.
import * as THREE from "three";

const warnaSimpan = new Map();
const warnaDari = (hex) => {
  let w = warnaSimpan.get(hex);
  if (!w) {
    w = new THREE.Color(hex);
    warnaSimpan.set(hex, w);
  }
  return w;
};

const BALOK = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
const bantuM = new THREE.Matrix4();
const bantuN = new THREE.Matrix3();
const bantuV = new THREE.Vector3();
const bantuQ = new THREE.Quaternion();
const bantuE = new THREE.Euler();

const matriksDari = (at, rot, skala) => {
  bantuE.set(rot?.[0] ?? 0, rot?.[1] ?? 0, rot?.[2] ?? 0);
  bantuQ.setFromEuler(bantuE);
  const s = Array.isArray(skala) ? skala : [skala ?? 1, skala ?? 1, skala ?? 1];
  return new THREE.Matrix4().compose(new THREE.Vector3(...at), bantuQ, new THREE.Vector3(...s));
};

export class Bangun {
  constructor(padat = null, tumpukan = null) {
    this.padatan = padat;
    this.tumpukan = tumpukan ?? [new THREE.Matrix4()];
    this.posisi = [];
    this.normal = [];
    this.warna = [];
    // Bagian yang menyala (layar, lampu, api): tidak terkena bayangan.
    this.nyala = tumpukan ? null : new Bangun(padat, this.tumpukan);
  }

  get m() {
    return this.tumpukan[this.tumpukan.length - 1];
  }

  // Semua yang digambar di dalam fn memakai posisi, putaran, dan skala ini.
  di(at, rot, skala, fn) {
    const putar = typeof rot === "number" ? [0, rot, 0] : rot;
    this.tumpukan.push(this.m.clone().multiply(matriksDari(at, putar, skala)));
    fn(this);
    this.tumpukan.pop();
    return this;
  }

  tambah(geo, lokal, warna) {
    const w = warnaDari(warna);
    const akhir = bantuM.copy(this.m).multiply(lokal);
    bantuN.getNormalMatrix(akhir);
    const p = geo.attributes.position;
    const n = geo.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      bantuV.fromBufferAttribute(p, i).applyMatrix4(akhir);
      this.posisi.push(bantuV.x, bantuV.y, bantuV.z);
      bantuV.fromBufferAttribute(n, i).applyMatrix3(bantuN).normalize();
      this.normal.push(bantuV.x, bantuV.y, bantuV.z);
      this.warna.push(w.r, w.g, w.b);
    }
  }

  // Balok.
  k(at, size, warna, rot) {
    this.tambah(BALOK, matriksDari(at, rot, size), warna);
    return this;
  }

  // Tabung. bawah boleh kosong.
  t(at, atas, bawah, tinggi, warna, rot, sisi = 12) {
    const geo = new THREE.CylinderGeometry(atas, bawah ?? atas, tinggi, sisi).toNonIndexed();
    this.tambah(geo, matriksDari(at, rot, 1), warna);
    geo.dispose();
    return this;
  }

  // Bola. skala boleh gepeng.
  o(at, r, warna, skala, sisi = 10) {
    const geo = new THREE.SphereGeometry(r, sisi, Math.max(6, sisi - 3)).toNonIndexed();
    this.tambah(geo, matriksDari(at, null, skala ?? 1), warna);
    geo.dispose();
    return this;
  }

  // Kerucut.
  c(at, r, tinggi, warna, rot, sisi = 8) {
    const geo = new THREE.ConeGeometry(r, tinggi, sisi).toNonIndexed();
    this.tambah(geo, matriksDari(at, rot, 1), warna);
    geo.dispose();
    return this;
  }

  // Segitiga dua sisi, untuk puncak dinding di bawah atap.
  segitiga(a, b, c, warna) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...b], 3));
    geo.computeVertexNormals();
    this.tambah(geo, new THREE.Matrix4(), warna);
    geo.dispose();
    return this;
  }

  // Tandai persegi di lantai sebagai benda yang tidak bisa ditembus.
  padat(x, z, lebar, dalam) {
    const titik = [
      [x - lebar / 2, z - dalam / 2],
      [x + lebar / 2, z - dalam / 2],
      [x + lebar / 2, z + dalam / 2],
      [x - lebar / 2, z + dalam / 2],
    ].map(([a, b]) => new THREE.Vector3(a, 0, b).applyMatrix4(this.m));
    this.padatan.push({
      x1: Math.min(...titik.map((v) => v.x)),
      x2: Math.max(...titik.map((v) => v.x)),
      z1: Math.min(...titik.map((v) => v.z)),
      z2: Math.max(...titik.map((v) => v.z)),
    });
    return this;
  }

  // Sekelompok balok yang menyala, memakai posisi yang sedang aktif.
  n(at, size, warna, rot) {
    this.nyala.k(at, size, warna, rot);
    return this;
  }

  geometri() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(this.posisi, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(this.normal, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(this.warna, 3));
    this.posisi = this.normal = this.warna = null;
    return geo;
  }

  jadi(bahan, { bayangan = true } = {}) {
    const mesh = new THREE.Mesh(this.geometri(), bahan);
    mesh.castShadow = bayangan;
    mesh.receiveShadow = true;
    return mesh;
  }

  get kosong() {
    return !this.posisi || this.posisi.length === 0;
  }
}

export const bahanUtama = () => new THREE.MeshLambertMaterial({ vertexColors: true });
export const bahanNyala = () => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });

// Papan bertulisan, digambar di kanvas. Hanya untuk tulisan buatan sendiri.
export const papanTulis = (teks, { lebar = 2, tinggi = 0.5, latar = "#FFF6E6", tinta = "#3A2A1E", tepi = null } = {}) => {
  const skala = 200;
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(lebar * skala);
  kanvas.height = Math.round(tinggi * skala);
  const g = kanvas.getContext("2d");
  g.fillStyle = latar;
  g.fillRect(0, 0, kanvas.width, kanvas.height);
  if (tepi) {
    g.strokeStyle = tepi;
    g.lineWidth = 10;
    g.strokeRect(5, 5, kanvas.width - 10, kanvas.height - 10);
  }
  g.fillStyle = tinta;
  g.textAlign = "center";
  g.textBaseline = "middle";
  let ukuran = kanvas.height * 0.62;
  g.font = `800 ${ukuran}px "Baloo 2", "Trebuchet MS", sans-serif`;
  while (g.measureText(teks).width > kanvas.width * 0.9 && ukuran > 10) {
    ukuran -= 2;
    g.font = `800 ${ukuran}px "Baloo 2", "Trebuchet MS", sans-serif`;
  }
  g.fillText(teks, kanvas.width / 2, kanvas.height * 0.54);
  const tekstur = new THREE.CanvasTexture(kanvas);
  tekstur.colorSpace = THREE.SRGBColorSpace;
  tekstur.anisotropy = 4;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(lebar, tinggi),
    new THREE.MeshBasicMaterial({ map: tekstur, toneMapped: false, side: THREE.DoubleSide }),
  );
};
