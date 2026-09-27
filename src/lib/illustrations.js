/* Registro de ilustraciones: fuente única para la app, la generación y la documentación.
   - La app carga public/illustrations/<name>.svg; mientras falte, muestra un marcador.
   - `npm run illustrations` genera con Gemini las que falten y las vectoriza.
   - `npm run illustrations-doc` regenera ILUSTRACIONES.md y PROMPTS-NANO-BANANA.md.
   `fromSheet: true` = la escena ya existe en la hoja de referencia y se pide redibujarla. */

export const STYLE =
  "Clean black ink line illustration in the same style as the attached reference images: modern editorial line art, simplified but realistic human proportions, people in office clothes or prison-officer uniforms, confident even line weight, solid flat black fills on hair, ties, trousers and shoes, minimal facial features with expressive poses. Strictly black ink only, no gray, no color, no hatching-heavy shading. Plain flat off-white background #FDFAF7. Absolutely no text, letters or numbers anywhere, including on books, signs and papers. One single scene only, one image, no grid, no sheet, centered, with at least 10% empty margin on all sides.";

const redraw = (figure) => `Redraw only the ${figure} from the attached reference sheet as a single high-resolution image. Keep the same pose and design.`;

export const ILLUSTRATIONS = {
  // Inicio
  bienvenida: { ratio: "wide", screen: "Inicio", where: "Tarjeta de bienvenida mientras no hay ningún test hecho.", fromSheet: true, prompt: redraw("group of five people walking left to right carrying folders. Wide horizontal composition") },
  "racha-activa": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha cuando ya has estudiado hoy.", fromSheet: true, prompt: redraw("smiling man in a tie raising a burning torch with one fist up") },
  "racha-pendiente": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha cuando estudiaste ayer pero aún no hoy.", fromSheet: true, prompt: redraw("man yawning next to a small candle with a tiny flame") },
  "racha-apagada": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha sin racha o con la racha rota.", fromSheet: true, prompt: redraw("sad man sitting next to a blown-out candle with a curl of smoke") },
  instalar: { ratio: "square", screen: "Inicio", where: "Aviso para instalar la app en el móvil (Android).", fromSheet: true, prompt: redraw("man pushing a giant smartphone on a hand truck") },

  // Rangos (tarjeta de rango en Inicio, Resultado y escalafón en Logros)
  "rango-1-novato": { ratio: "square", screen: "Rangos", where: "Nivel 1 · Opositor Novato.", prompt: "A young beginner candidate with an oversized backpack, hugging a pile of thick law books, determined but a bit overwhelmed." },
  "rango-2-practicas": { ratio: "square", screen: "Rangos", where: "Nivel 2 · Funcionario en Prácticas.", fromSheet: true, prompt: redraw("person holding a giant ring of keys") },
  "rango-3-jefe-servicio": { ratio: "square", screen: "Rangos", where: "Nivel 3 · Jefe de Servicio.", prompt: "A prison shift supervisor in uniform holding a clipboard in one hand and a walkie-talkie in the other, confident commanding pose." },
  "rango-4-jefe-centro": { ratio: "square", screen: "Rangos", where: "Nivel 4 · Jefe de Centro.", prompt: "A head of prison center in a suit sitting behind a desk with a rubber stamp, a desk telephone and tall stacks of case folders, busy but in control." },
  "rango-5-director": { ratio: "square", screen: "Rangos", where: "Nivel 5 · Director de Centro.", prompt: "A prison director in a suit standing firm and tall, holding a flag on a pole, calm and proud like a monument." },
  ascenso: { ratio: "square", screen: "Resultado", where: "Resultado del test cuando subes de rango.", prompt: "An officer in uniform smiling while a hand from the side pins a rank insignia onto their shoulder, a few small sparkle marks around." },

  // Test
  simulacro: { ratio: "wide", screen: "Test", where: "Cabecera de la configuración del simulacro.", fromSheet: true, prompt: redraw("man at a desk with a large wall clock behind him, redrawn as an exam candidate writing an exam at the desk. Wide horizontal composition") },
  entregar: { ratio: "square", screen: "Test", where: "Hoja de confirmación «¿Entregar el examen?».", fromSheet: true, prompt: redraw("man handing a folder over a counter to a woman behind it") },
  abandonar: { ratio: "square", screen: "Test", where: "Hoja de confirmación «¿Abandonar el examen?».", prompt: "A person tiptoeing out through a half-open door, looking back over their shoulder sneakily." },
  "tiempo-agotado": { ratio: "square", screen: "Resultado", where: "Resultado cuando se acabó el tiempo.", fromSheet: true, prompt: redraw("man running away in panic from a ringing alarm clock") },
  "resultado-alto": { ratio: "square", screen: "Resultado", where: "Resultado con nota ≥ 7 sobre 10.", fromSheet: true, prompt: redraw("man jumping for joy with papers flying around him") },
  "resultado-medio": { ratio: "square", screen: "Resultado", where: "Resultado con nota entre 4 y 7.", prompt: "A person balancing a tall wobbly pile of papers on one hand and shrugging with the other, 'almost there' expression." },
  "resultado-bajo": { ratio: "square", screen: "Resultado", where: "Resultado con nota < 4.", fromSheet: true, prompt: redraw("boy sitting cross-legged among scattered papers under a small rain cloud") },

  // Apuntes
  "apuntes-vacio": { ratio: "wide", screen: "Apuntes", where: "Cabecera de Apuntes antes de cargar texto.", fromSheet: true, prompt: redraw("woman carrying a tall stack of books on her head. Wide horizontal composition, figure centered") },
  "bloque-penitenciario": { ratio: "square", screen: "Apuntes", where: "Carpeta azul · Derecho Penitenciario.", fromSheet: true, prompt: redraw("heavy cell door with a barred peephole window, adding a prison officer holding keys standing next to it") },
  "bloque-penal": { ratio: "square", screen: "Apuntes", where: "Carpeta roja · Derecho Penal.", prompt: "A person holding up a large scale of justice in one hand and a thick closed book under the other arm." },
  "bloque-funcion-publica": { ratio: "square", screen: "Apuntes", where: "Carpeta verde · Función Pública.", fromSheet: true, prompt: redraw("hand holding a rubber stamp, redrawn as a full civil servant behind a service window about to stamp a document") },
  procesando: { ratio: "square", screen: "Apuntes", where: "Mientras la IA genera el test.", prompt: "A thoughtful woman with her hand on her chin, a thought bubble above her head containing small blank documents and a light bulb." },
  "test-listo": { ratio: "square", screen: "Apuntes", where: "Cuando el test generado está listo.", prompt: "A person proudly holding up an exam sheet with one big check mark drawn on it." },

  // Logros
  "medalla-primer-turno": { ratio: "square", screen: "Logros", where: "Medalla Primer Turno.", prompt: "A new prison officer in uniform turning a giant key in the lock of a heavy door, first day on the job, excited." },
  "medalla-celda-castigo": { ratio: "square", screen: "Logros", where: "Medalla Celda de Castigo.", fromSheet: true, prompt: redraw("man peeking out from behind prison cell bars") },
  "medalla-imbatible": { ratio: "square", screen: "Logros", where: "Medalla Imbatible.", prompt: "A person in office clothes striking a superhero pose with a cape flowing behind them and a round shield on one arm." },
  "medalla-estudioso-nocturno": { ratio: "square", screen: "Logros", where: "Medalla Estudioso Nocturno.", prompt: "A person reading a book at a desk under a desk lamp at night, a crescent moon and a small owl visible through the window behind." },
  reiniciar: { ratio: "square", screen: "Logros", where: "Hoja de confirmación «¿Reiniciar progreso?».", prompt: "A person sweeping a messy pile of papers with a broom, clearing the floor." },
};

export const fullPrompt = (name) => `${STYLE}\n\n${ILLUSTRATIONS[name].prompt}`;
