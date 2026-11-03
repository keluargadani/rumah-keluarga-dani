// Semua halaman dibangun dari data/members.json. Teks selalu masuk lewat textContent, tidak pernah innerHTML.

const PLATFORM = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
};
const THUMBNAIL_CADANGAN = "assets/ilustrasi/thumbnail.svg";
const JUMLAH_VIDEO_TERBARU = 6;

// ---------- Pembantu ----------

const el = (tag, atribut = {}, ...anak) => {
  const node = document.createElement(tag);
  for (const [kunci, nilai] of Object.entries(atribut)) {
    if (nilai === undefined || nilai === null || nilai === false) continue;
    if (kunci === "class") node.className = nilai;
    else if (kunci === "style") node.style.cssText = nilai;
    else if (kunci.startsWith("on")) node.addEventListener(kunci.slice(2), nilai);
    else node.setAttribute(kunci, nilai === true ? "" : nilai);
  }
  node.append(...anak.flat().filter((a) => a !== null && a !== undefined && a !== false));
  return node;
};

const namaPlatform = (platform) => PLATFORM[platform] ?? platform ?? "Video";

// Hanya link http(s) yang dipakai, supaya salah ketik di JSON tidak jadi link rusak.
const linkAman = (link) => {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

const formatTanggal = (tanggal) => {
  const waktu = new Date(`${tanggal}T00:00:00`);
  if (Number.isNaN(waktu.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(waktu);
};

const urlKamar = (anggota) => `kamar.html?anggota=${encodeURIComponent(anggota.id)}`;

// Tanggal yang salah format ditaruh paling akhir, bukan paling atas.
const kunciTanggal = (video) => (/^\d{4}-\d{2}-\d{2}$/.test(video.tanggal ?? "") ? video.tanggal : "");
const urutTerbaru = (videos) => videos.slice().sort((a, b) => kunciTanggal(b).localeCompare(kunciTanggal(a)));

const semuaVideo = (data) =>
  urutTerbaru(data.anggota.flatMap((anggota) => (anggota.video ?? []).map((video) => ({ ...video, anggota }))));

// ---------- Embed resmi ----------

const idYoutube = (link) => {
  const url = new URL(link);
  if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (url.searchParams.get("v")) return url.searchParams.get("v");
  const cocok = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/);
  return cocok ? cocok[1] : null;
};

const urlEmbed = (video) => {
  const link = linkAman(video.link);
  if (!link) return null;
  if (video.platform === "youtube") {
    const id = idYoutube(link);
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null;
  }
  if (video.platform === "tiktok") {
    const cocok = new URL(link).pathname.match(/\/video\/(\d+)/);
    return cocok ? `https://www.tiktok.com/embed/v2/${cocok[1]}` : null;
  }
  if (video.platform === "instagram") {
    const cocok = new URL(link).pathname.match(/\/(?:reels?|p)\/([\w-]+)/);
    return cocok ? `https://www.instagram.com/reel/${cocok[1]}/embed` : null;
  }
  return null;
};

const urlThumbnail = (video) => {
  if (video.thumbnail) return video.thumbnail;
  const link = linkAman(video.link);
  if (link && video.platform === "youtube") {
    const id = idYoutube(link);
    if (id) return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  }
  return THUMBNAIL_CADANGAN;
};

const putarVideo = (video) => {
  const embed = urlEmbed(video);
  const iframe = el("iframe", {
    src: embed,
    title: video.judul,
    allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
    referrerpolicy: "strict-origin-when-cross-origin",
  });
  // Dialog dibuang dari halaman supaya video di dalamnya ikut berhenti.
  const tutup = () => {
    dialog.close();
    dialog.remove();
  };
  const dialog = el(
    "dialog",
    {
      class: "pemutar",
      "aria-label": video.judul,
      // Tombol Esc menutup dialog tanpa lewat tutup().
      onclose: () => dialog.remove(),
      // Klik di luar kotak menutup pemutar.
      onclick: (event) => {
        if (event.target === dialog) tutup();
      },
    },
    el(
      "div",
      { class: "pemutar-isi" },
      el("div", { class: "pemutar-layar" }, iframe),
      el(
        "div",
        { class: "pemutar-bawah" },
        el("a", { href: linkAman(video.link), target: "_blank", rel: "noopener" }, `Buka di ${namaPlatform(video.platform)}`),
        el("button", { type: "button", class: "tombol tombol-kecil", onclick: tutup }, "Tutup"),
      ),
    ),
  );
  document.body.append(dialog);
  dialog.showModal();
};

// ---------- Komponen ----------

// Daftar sumber informasi video. Tidak tampil kalau video belum punya sumber.
const daftarSumber = (video) => {
  const sumber = (video.sumber ?? [])
    .map((item) => ({ judul: item.judul, link: linkAman(item.link) }))
    .filter((item) => item.link);
  if (!sumber.length) return null;
  return el(
    "details",
    { class: "sumber" },
    el("summary", {}, `Sumber (${sumber.length})`),
    el(
      "ul",
      {},
      sumber.map((item) =>
        el("li", {}, el("a", { href: item.link, target: "_blank", rel: "noopener" }, item.judul || new URL(item.link).hostname)),
      ),
    ),
  );
};

const kartuVideo = (video, tampilkanPemilik = false) => {
  const link = linkAman(video.link);
  const tanggal = video.tanggal ? formatTanggal(video.tanggal) : "";
  const gambar = el("img", {
    src: urlThumbnail(video),
    alt: "",
    loading: "lazy",
    onerror: (event) => {
      if (!event.target.src.endsWith(THUMBNAIL_CADANGAN)) event.target.src = THUMBNAIL_CADANGAN;
    },
  });
  const sampul = [gambar, el("span", { class: "lencana" }, namaPlatform(video.platform))];
  const bisaDiputar = urlEmbed(video) !== null;
  const aksi = bisaDiputar
    ? el(
        "button",
        {
          type: "button",
          class: "video-sampul",
          "aria-label": `Putar ${video.judul}`,
          onclick: () => putarVideo(video),
        },
        sampul,
        el("span", { class: "tombol-putar", "aria-hidden": "true" }),
      )
    : link
      ? el("a", { class: "video-sampul", href: link, target: "_blank", rel: "noopener", "aria-label": `Tonton ${video.judul}` }, sampul)
      : el("div", { class: "video-sampul" }, sampul);

  return el(
    "article",
    { class: "video" },
    aksi,
    el(
      "div",
      { class: "video-teks" },
      el("h3", {}, link ? el("a", { href: link, target: "_blank", rel: "noopener" }, video.judul) : video.judul),
      el(
        "p",
        { class: "kecil" },
        [tampilkanPemilik ? video.anggota.nama : null, tanggal || null].filter(Boolean).join(" · "),
      ),
      daftarSumber(video),
    ),
  );
};

const kotakKosong = (judul, isi) =>
  el("div", { class: "kosong" }, el("p", { class: "kosong-judul" }, judul), el("p", {}, isi));

const daftarVideo = (videos, tampilkanPemilik) =>
  el(
    "div",
    { class: "kisi-video" },
    videos.map((video) => kartuVideo(video, tampilkanPemilik)),
  );

const pintu = (anggota) =>
  el(
    "a",
    { class: "pintu", href: urlKamar(anggota), style: `--aksen:${anggota.warna}` },
    el("span", { class: "pintu-papan" }, anggota.ruang),
    el("img", { src: anggota.foto, alt: "", loading: "lazy" }),
  );

const kartuAnggota = (anggota) =>
  el(
    "article",
    { class: "anggota", style: `--aksen:${anggota.warna}` },
    el("img", { src: anggota.foto, alt: `Ilustrasi ${anggota.nama}`, loading: "lazy" }),
    el(
      "div",
      { class: "anggota-teks" },
      el("h2", {}, anggota.nama),
      el("p", { class: "sifat" }, anggota.sifat),
      el(
        "ul",
        { class: "chips" },
        (anggota.topik ?? []).map((topik) => el("li", {}, topik)),
      ),
      el("a", { class: "tombol", href: urlKamar(anggota) }, `Masuk ke ${anggota.ruang}`),
    ),
  );

const tautanAkun = (akun) => {
  const link = linkAman(akun.link);
  const nama = namaPlatform(akun.platform);
  return link
    ? el("a", { class: "tombol", href: link, target: "_blank", rel: "noopener" }, `Ikuti di ${nama}`)
    : el("span", { class: "tombol tombol-mati" }, `${nama}: segera hadir`);
};

// Tombol saring yang menggambar ulang isi wadah setiap kali dipilih.
const saringan = (label, pilihan, gambar) => {
  const wadah = el("div", {});
  const tombol = pilihan.map((opsi) =>
    el(
      "button",
      {
        type: "button",
        class: "saring",
        "aria-pressed": "false",
        onclick: () => pilih(opsi),
      },
      opsi.label,
    ),
  );
  const pilih = (opsi) => {
    pilihan.forEach((item, i) => tombol[i].setAttribute("aria-pressed", String(item === opsi)));
    wadah.replaceChildren(gambar(opsi));
  };
  pilih(pilihan[0]);
  return [pilihan.length > 2 ? el("div", { class: "baris-saring", role: "group", "aria-label": label }, tombol) : null, wadah];
};

// ---------- Kerangka: atap dan lantai ----------

const pasangKerangka = (data, halaman, idAnggota) => {
  const kamarAktif = halaman === "kamar";
  const menuKamar = el(
    "details",
    { class: "menu-kamar" },
    el("summary", { class: kamarAktif ? "aktif" : null, "aria-current": kamarAktif ? "page" : null }, "Kamar"),
    el(
      "div",
      { class: "menu-kamar-isi" },
      data.anggota.map((anggota) =>
        el("a", { href: urlKamar(anggota), "aria-current": anggota.id === idAnggota ? "page" : null }, anggota.ruang),
      ),
    ),
  );
  document.addEventListener("click", (event) => {
    if (!menuKamar.contains(event.target)) menuKamar.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menuKamar.open = false;
  });

  const tautan = (href, nama, kunci) =>
    el("a", { href, class: halaman === kunci ? "aktif" : null, "aria-current": halaman === kunci ? "page" : null }, nama);

  document.body.prepend(
    el(
      "header",
      { class: "atap" },
      el(
        "div",
        { class: "atap-isi" },
        el("a", { class: "merek", href: "index.html" }, "Rumah Keluarga Dani"),
        el(
          "nav",
          { "aria-label": "Ruangan" },
          tautan("index.html", "Menu awal", "menu"),
          tautan("index.html#main", "Jalan-jalan", "dunia"),
          tautan("beranda.html", "Beranda", "beranda"),
          tautan("ruang-tamu.html", "Ruang Tamu", "ruang-tamu"),
          menuKamar,
          tautan("galeri.html", "Galeri", "galeri"),
        ),
      ),
    ),
  );
  document.body.append(
    el(
      "footer",
      { class: "lantai" },
      el("p", {}, "Rumah Keluarga Dani"),
      el("p", { class: "kecil" }, "Semua karakter dan ilustrasi adalah karya orisinal."),
    ),
  );
};

// ---------- Halaman ----------

const halamanBeranda = (data, utama) => {
  const terbaru = semuaVideo(data).slice(0, JUMLAH_VIDEO_TERBARU);
  utama.append(
    el(
      "section",
      { class: "depan" },
      el(
        "div",
        { class: "depan-teks" },
        el("p", { class: "sapaan" }, "Ayo, silakan masuk!"),
        el("h1", {}, "Selamat datang di Rumah Keluarga Dani"),
        el(
          "p",
          {},
          "Di rumah ini semua video keluarga dikumpulkan. Ada Pak Dani dengan urusan uang, Bu Dani dengan urusan rumah, Afdi dengan tips dan obrolan anak muda, dan Gempi dengan dongengnya.",
        ),
        el(
          "div",
          { class: "baris-akun" },
          el("a", { class: "tombol tombol-besar", href: "index.html#main" }, "Jalan-jalan di rumah"),
          el("a", { class: "tombol tombol-besar", href: "ruang-tamu.html" }, "Masuk ke Ruang Tamu"),
        ),
      ),
      el("img", {
        class: "depan-gambar",
        src: "assets/ilustrasi/rumah.svg",
        alt: "Ilustrasi rumah kampung dengan atap genteng dan pintu hijau",
        width: 720,
        height: 560,
      }),
    ),
    el(
      "section",
      {},
      el("h2", {}, "Mau ke ruangan siapa?"),
      el(
        "div",
        { class: "kisi-pintu" },
        data.anggota.map(pintu),
      ),
    ),
    el(
      "section",
      {},
      el("h2", {}, "Video terbaru"),
      terbaru.length
        ? daftarVideo(terbaru, true)
        : kotakKosong("Segera hadir", "Videonya sedang ditata di rak. Mampir lagi nanti, ya."),
    ),
  );
};

const halamanRuangTamu = (data, utama) => {
  utama.append(
    el(
      "section",
      { class: "kepala-ruang" },
      el("h1", {}, "Ruang Tamu"),
      el("p", {}, "Kenalan dulu dengan penghuni rumah, lalu pilih kamar yang mau dikunjungi."),
    ),
    el(
      "div",
      { class: "kisi-anggota" },
      data.anggota.map(kartuAnggota),
    ),
  );
};

const halamanKamar = (data, utama, idAnggota) => {
  const anggota = data.anggota.find((a) => a.id === idAnggota);
  if (!anggota) {
    document.title = "Kamar tidak ditemukan | Rumah Keluarga Dani";
    utama.append(
      el(
        "section",
        { class: "kepala-ruang" },
        el("h1", {}, "Kamar ini belum ada"),
        el("p", {}, "Mungkin salah pintu. Coba pilih salah satu ruangan ini."),
      ),
      el("div", { class: "kisi-pintu" }, data.anggota.map(pintu)),
    );
    return;
  }
  document.title = `${anggota.ruang} | Rumah Keluarga Dani`;
  document.body.style.setProperty("--aksen", anggota.warna);

  const videos = urutTerbaru(anggota.video ?? []);
  const platforms = [...new Set(videos.map((video) => video.platform))];
  const pilihan = [{ label: "Semua" }, ...platforms.map((platform) => ({ label: namaPlatform(platform), platform }))];

  utama.append(
    el(
      "section",
      { class: "profil" },
      el("img", { src: anggota.foto, alt: `Ilustrasi ${anggota.nama}` }),
      el(
        "div",
        {},
        el("p", { class: "papan-nama" }, anggota.ruang),
        el("h1", {}, anggota.nama),
        el("p", { class: "sifat" }, anggota.sifat),
        el("p", {}, anggota.deskripsi),
        el(
          "ul",
          { class: "chips" },
          (anggota.topik ?? []).map((topik) => el("li", {}, topik)),
        ),
        el("div", { class: "baris-akun" }, (anggota.akun ?? []).map(tautanAkun)),
      ),
    ),
    el(
      "section",
      {},
      el("h2", {}, "Video"),
      videos.length
        ? saringan("Saring menurut platform", pilihan, (opsi) =>
            daftarVideo(opsi.platform ? videos.filter((video) => video.platform === opsi.platform) : videos, false),
          )
        : kotakKosong("Segera hadir", `Video di ${anggota.ruang} sedang ditata. Mampir lagi nanti, ya.`),
    ),
  );
};

const halamanGaleri = (data, utama) => {
  const videos = semuaVideo(data).filter((video) => video.pilihan);
  const pemilik = data.anggota.filter((anggota) => videos.some((video) => video.anggota.id === anggota.id));
  const pilihan = [{ label: "Semua" }, ...pemilik.map((anggota) => ({ label: anggota.nama, id: anggota.id }))];

  utama.append(
    el(
      "section",
      { class: "kepala-ruang" },
      el("h1", {}, "Galeri"),
      el("p", {}, "Video pilihan yang dipajang di dinding rumah."),
    ),
    videos.length
      ? el(
          "section",
          {},
          saringan("Saring menurut anggota", pilihan, (opsi) =>
            daftarVideo(opsi.id ? videos.filter((video) => video.anggota.id === opsi.id) : videos, true),
          ),
        )
      : kotakKosong("Segera hadir", "Dindingnya masih kosong. Video pilihan akan dipajang di sini."),
  );
};

// ---------- Mulai ----------

// Dunia 3D (js/dunia/main.js) memakai komponen yang sama untuk panel profil dan video.
window.RumahDani = { el, daftarVideo, kartuVideo, tautanAkun, semuaVideo, urutTerbaru, urlKamar, saringan, namaPlatform };

const mulai = async () => {
  const halaman = document.body.dataset.halaman;
  if (halaman === "dunia") return;
  const utama = document.querySelector("main");
  const idAnggota = new URLSearchParams(location.search).get("anggota");
  try {
    const jawaban = await fetch("data/members.json");
    if (!jawaban.ok) throw new Error(`HTTP ${jawaban.status}`);
    const data = await jawaban.json();
    pasangKerangka(data, halaman, idAnggota);
    if (halaman === "beranda") halamanBeranda(data, utama);
    if (halaman === "ruang-tamu") halamanRuangTamu(data, utama);
    if (halaman === "kamar") halamanKamar(data, utama, idAnggota);
    if (halaman === "galeri") halamanGaleri(data, utama);
  } catch (galat) {
    console.error(galat);
    utama.append(
      kotakKosong(
        "Data rumah belum bisa dimuat",
        location.protocol === "file:"
          ? "Situs ini perlu dibuka lewat server. Jalankan: node serve.mjs, lalu buka http://localhost:4173."
          : "Periksa apakah data/members.json ada dan isinya JSON yang benar.",
      ),
    );
  }
};

mulai();
