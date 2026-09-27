// Genera ILUSTRACIONES.md a partir de src/lib/illustrations.js
import { writeFileSync } from "node:fs";
import { ILLUSTRATIONS } from "../src/lib/illustrations.js";

const entries = Object.entries(ILLUSTRATIONS);
const screens = [...new Set(entries.map(([, v]) => v.screen))];
const size = (r) => (r === "wide" ? "1600 × 900 (16:9)" : "800 × 800 (1:1)");

let md = `# Ilustraciones de Recuento

Total: **${entries.length} ilustraciones**, en line art editorial de tinta negra (ver la hoja de referencia y PROMPTS-NANO-BANANA.md).

## Especificaciones

- **Formato**: PNG de Gemini guardado en \`illustrations-src/<nombre>.png\`; \`npm run trace\` lo convierte a SVG.
- **Fondo transparente**. En la app siempre se colocan sobre papel crema \`#fdfaf7\`.
- **Color**: tinta \`#191919\`. Si quieres un toque de color, usa uno solo de la paleta:
  azul \`#1e4bd7\`, rojo \`#d71e1e\`, verde \`#0c7866\`, morado \`#581e70\` o amarillo \`#ffe927\`.
- **Encuadre**: deja un 6–8 % de margen para que el personaje no toque los bordes.
- **Grosor de línea**: pensado para verse bien a 96 px de ancho (tamaño mínimo en la app).
- **Dónde acaban**: \`public/illustrations/<nombre>.svg\`. La app los detecta sola;
  mientras falten se ve un marcador con el nombre.
- **Medallas bloqueadas y rangos no alcanzados** reutilizan la misma ilustración en gris: no hace falta dibujar versión bloqueada.

`;
for (const screen of screens) {
  md += `## ${screen}\n\n| Archivo | Tamaño | Dónde aparece | Qué dibujar |\n|---|---|---|---|\n`;
  for (const [name, v] of entries.filter(([, v]) => v.screen === screen)) {
    md += `| \`${name}.svg\` | ${size(v.ratio)} | ${v.where} | ${v.brief} |\n`;
  }
  md += "\n";
}
writeFileSync("ILUSTRACIONES.md", md);
console.log(`ILUSTRACIONES.md · ${entries.length} ilustraciones`);
