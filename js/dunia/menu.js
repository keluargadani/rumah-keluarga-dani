// Menu awal. Game baru dimuat saat dipilih, jadi pengunjung web biasa tidak ikut mengunduhnya.
const tombol = document.getElementById("pilih-game");
const galat = document.getElementById("menu-galat");
const teksAwal = tombol.textContent;
let sedangMuat = false;

const mulaiGame = async () => {
  if (sedangMuat) return;
  sedangMuat = true;
  tombol.disabled = true;
  tombol.textContent = "Membangun kampung...";
  galat.hidden = true;
  try {
    await import("./main.js");
  } catch (e) {
    console.error(e);
    sedangMuat = false;
    tombol.disabled = false;
    tombol.textContent = teksAwal;
    galat.hidden = false;
  }
};

tombol.addEventListener("click", mulaiGame);

// Tautan "Jalan-jalan" dari web biasa langsung masuk ke game, tanpa lewat menu.
const cekAlamat = () => {
  if (location.hash === "#main") mulaiGame();
};
addEventListener("hashchange", cekAlamat);
cekAlamat();
