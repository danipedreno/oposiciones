// Genera ILUSTRACIONES.md y PROMPTS-NANO-BANANA.md a partir de src/lib/illustrations.js
import { writeFileSync } from "node:fs";
import { ILLUSTRATIONS, STYLE } from "../src/lib/illustrations.js";

const entries = Object.entries(ILLUSTRATIONS);
const screens = [...new Set(entries.map(([, v]) => v.screen))];
const size = (r) => (r === "wide" ? "16:9" : "1:1");

/* --- ILUSTRACIONES.md --- */
let md = `# Ilustraciones de Recuento

Total: **${entries.length} ilustraciones**, en line art editorial de tinta negra.

## Cómo se generan

\`\`\`bash
npm run illustrations          # genera con Gemini las que falten y las vectoriza a SVG
npm run illustrations ascenso  # regenera solo esa (útil si no te gusta el resultado)
\`\`\`

- Los PNG originales quedan en \`illustrations-src/\`; los SVG finales en \`public/illustrations/\`.
- Las imágenes de \`illustrations-src/_referencia/\` se envían a Gemini como referencia de estilo.
  Cuando una ilustración te guste mucho, cópiala ahí para que las siguientes se parezcan más.
- Si prefieres hacerlas a mano en Gemini, los prompts completos están en PROMPTS-NANO-BANANA.md.
- Medallas bloqueadas y rangos no alcanzados reutilizan la misma ilustración en gris.

`;
for (const screen of screens) {
  md += `## ${screen}\n\n| Archivo | Formato | Dónde aparece |\n|---|---|---|\n`;
  for (const [name, v] of entries.filter(([, v]) => v.screen === screen)) md += `| \`${name}\` | ${size(v.ratio)} | ${v.where} |\n`;
  md += "\n";
}
writeFileSync("ILUSTRACIONES.md", md);

/* --- PROMPTS-NANO-BANANA.md (para hacerlas a mano) --- */
let prompts = `# Prompts para Nano Banana (Gemini)

Lo normal es no usar este archivo: \`npm run illustrations\` las genera todas solas con la API.
Esto es para hacer alguna a mano en la web de Gemini.

1. Adjunta las imágenes de \`illustrations-src/_referencia/\`.
2. Elige el formato indicado y pega **ESTILO + escena**. Una ilustración por mensaje.
3. Guarda el PNG como \`illustrations-src/<nombre>.png\` y ejecuta \`npm run trace <nombre>\`.

## ESTILO

\`\`\`
${STYLE}
\`\`\`

`;
for (const screen of screens) {
  prompts += `## ${screen}\n\n`;
  for (const [name, v] of entries.filter(([, v]) => v.screen === screen)) {
    prompts += `**${name}** · ${size(v.ratio)}${v.fromSheet ? " · redibujo de la hoja" : ""}\n\`\`\`\n${v.prompt}\n\`\`\`\n\n`;
  }
}
writeFileSync("PROMPTS-NANO-BANANA.md", prompts);
console.log(`ILUSTRACIONES.md y PROMPTS-NANO-BANANA.md · ${entries.length} ilustraciones`);
