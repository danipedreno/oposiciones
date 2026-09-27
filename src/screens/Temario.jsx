import { BLOCKS, BLOCK_IDS } from "../lib/logic.js";
import { bankCards, bankQuestions, temasOf } from "../lib/bank.js";
import { FolderTab, Illustration, Paper } from "../ui.jsx";
import { ImportBank } from "./Cards.jsx";

/** Pestaña Temario: cargar o actualizar el banco y ver qué hay en cada carpeta. */
export default function Temario({ bank, onImport }) {
  if (!bank) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <p className="label text-mute">Tu material</p>
          <h1 className="display text-[52px] mt-1">Temario</h1>
        </header>
        <Paper className="p-4">
          <Illustration name="apuntes-vacio" className="w-full" alt="" />
          <p className="display text-[30px] mt-3">Carga tu temario</p>
          <ol className="mt-3 flex flex-col gap-2 text-[15px] text-mute-paper">
            <li>1. Guarda en el móvil el archivo <span className="font-mono text-ink">mi-banco.json</span> que te han pasado.</li>
            <li>2. Pulsa el botón y elígelo.</li>
            <li>3. Ya puedes crear tests y repasar tarjetas de todos tus temas.</li>
          </ol>
          <div className="mt-4">
            <ImportBank onImport={onImport} variant="blue" />
          </div>
          <p className="text-sm text-mute-paper mt-3">Se guarda solo en este móvil. No se sube a ningún sitio.</p>
        </Paper>
      </div>
    );
  }

  const fecha = new Date(bank.generado).toLocaleDateString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const bloques = BLOCK_IDS.filter((b) => temasOf(bank, b).length);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label text-mute">Tu material</p>
        <h1 className="display text-[52px] mt-1">Temario</h1>
      </header>

      <div className="grid grid-cols-3 border-y border-ink-3 divide-x divide-ink-3 text-center">
        {[
          { label: "Temas", value: bank.temas.length },
          { label: "Preguntas", value: bank.preguntas.length },
          { label: "Tarjetas", value: bank.flashcards.length },
        ].map((s) => (
          <div key={s.label} className="py-3">
            <p className="font-mono text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs text-mute">{s.label}</p>
          </div>
        ))}
      </div>

      {bloques.map((b) => (
        <section key={b} aria-label={BLOCKS[b].label}>
          <div className="flex items-end">
            <FolderTab color={BLOCKS[b].hex} className="ml-2 -mb-px relative z-[1]">
              {BLOCKS[b].label}
            </FolderTab>
          </div>
          <ol className="rounded-folder folder-shadow p-2 flex flex-col gap-1" style={{ background: BLOCKS[b].hex }}>
            {temasOf(bank, b).map((t) => (
              <li key={t.id} className="rounded-[4px] bg-black/20 px-3 py-2.5 flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold w-6 shrink-0">{t.numero}</span>
                <span className="flex-1 min-w-0 leading-snug">{t.titulo}</span>
                <span className="font-mono text-xs shrink-0 text-right leading-tight">
                  {bankQuestions(bank, b, t.id).length} preg.
                  <br />
                  {bankCards(bank, b, t.id).length} tarj.
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="border-t border-ink-3 pt-5 flex flex-col gap-3">
        <p className="text-sm text-mute">Versión del {fecha}. Cuando te pasen una versión nueva, actualízala aquí: tu progreso, racha y fallos se conservan.</p>
        <ImportBank onImport={onImport} label="Actualizar mi temario" variant="ghost" />
      </div>
    </div>
  );
}
