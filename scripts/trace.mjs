// Vectoriza las ilustraciones de Gemini: illustrations-src/<nombre>.(png|jpg|webp) → public/illustrations/<nombre>.svg
// Uso: npm run trace            (todas)
//      npm run trace bienvenida (solo esa)
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import potrace from "potrace";
import { ILLUSTRATIONS } from "../src/lib/illustrations.js";

const SRC = "illustrations-src";
const OUT = "public/illustrations";
const INK = "#191919";

const trace = (buffer) =>
  new Promise((resolve, reject) =>
    potrace.trace(
      buffer,
      {
        color: INK,
        background: "transparent",
        threshold: 150, // tinta frente al fondo crema
        turdSize: 12, // descarta motas sueltas
        optTolerance: 0.35, // curvas suaves sin perder detalle
      },
      (err, svg) => (err ? reject(err) : resolve(svg))
    )
  );

const only = process.argv[2];
const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && (!only || basename(f, extname(f)) === only));
if (!files.length) {
  console.log(`No hay imágenes en ${SRC}/${only ? ` con el nombre «${only}»` : ""}.`);
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

for (const file of files) {
  const name = basename(file, extname(file));
  if (!ILLUSTRATIONS[name]) console.warn(`⚠ «${name}» no es un hueco de la app (revisa src/lib/illustrations.js).`);

  const img = sharp(join(SRC, file));
  const { width, height } = await img.metadata();
  // Se amplía ×2 antes de trazar para que las curvas salgan más limpias.
  const prepared = await img
    .resize(width * 2, height * 2, { kernel: "lanczos3" })
    .flatten({ background: "#ffffff" })
    .grayscale()
    .png()
    .toBuffer();

  const raw = await trace(prepared);
  // Solo viewBox: la app decide el tamaño.
  const svg = raw
    .replace(/\s(width|height)="\d+"/g, "")
    .replace(/\s+/g, " ")
    .replace(/(\d+\.\d)\d+/g, "$1");
  writeFileSync(join(OUT, `${name}.svg`), svg);
  console.log(`✓ ${name}.svg · ${(svg.length / 1024).toFixed(0)} KB`);
}
