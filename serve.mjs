// Server lokal tanpa dependensi: node serve.mjs [folder] [port]
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = normalize(process.argv[2] ?? fileURLToPath(new URL(".", import.meta.url)));
const PORT = Number(process.argv[3] ?? 4173);
const JENIS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const relatif = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const file = normalize(join(ROOT, relatif));
  const akar = ROOT.endsWith(sep) ? ROOT : ROOT + sep;
  if (!file.startsWith(akar) || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
    res.writeHead(404).end("Tidak ditemukan");
    return;
  }
  res.writeHead(200, { "Content-Type": JENIS[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Rumah Keluarga Dani: http://localhost:${PORT}`));
