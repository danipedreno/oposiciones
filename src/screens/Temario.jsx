import { useState } from "react";
import { CaretLeft, SignOut } from "@phosphor-icons/react";
import { BLOCKS, BLOCK_IDS } from "../lib/logic.js";
import { bankCards, bankQuestions, temasOf } from "../lib/bank.js";
import { Button, FolderTab, Illustration, Paper, Sheet } from "../ui.jsx";
import { ImportBank } from "./Cards.jsx";
import GeneratePanel from "./Generar.jsx";

/** Pestaña Temario: cargar o actualizar el banco y ver qué hay en cada carpeta. */
export default function Temario({ bank, onImport, onAddExtra, onBack, onLogout }) {
  const [confirm, setConfirm] = useState(false);
  const back = (
    <button type="button" onClick={onBack} className="tap press mb-3 h-11 pl-3 pr-4 rounded-full bg-card paper-shadow text-ink flex items-center gap-1 text-sm font-semibold">
      <CaretLeft size={18} weight="bold" /> Inicio
    </button>
  );
  if (!bank) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          {back}
          <h1 className="display text-[48px]">Temario</h1>
        </header>
        <Paper className="p-4">
          <div className="bg-mist blob p-3">
            <Illustration name="apuntes-vacio" fallback="bienvenida" className="w-full" alt="" />
          </div>
          <p className="display text-[30px] mt-3">Carga tu temario</p>
          <ol className="mt-3 flex flex-col gap-2 text-[15px] text-ink-soft">
            <li>1. Guarda en el móvil el archivo <span className="font-semibold text-ink">mi-banco.json</span> que te han pasado.</li>
            <li>2. Pulsa el botón y elígelo.</li>
            <li>3. Ya puedes crear tests y repasar tarjetas de todos tus temas.</li>
          </ol>
          <div className="mt-4">
            <ImportBank onImport={onImport} variant="blue" />
          </div>
          <p className="text-sm text-ink-soft mt-3">Se guarda solo en este móvil. No se sube a ningún sitio.</p>
        </Paper>
      </div>
    );
  }

  const fecha = new Date(bank.generado).toLocaleDateString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const bloques = BLOCK_IDS.filter((b) => temasOf(bank, b).length);

  return (
    <div className="flex flex-col gap-6">
      <header>
        {back}
        <h1 className="display text-[48px]">Temario</h1>
      </header>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Temas", value: bank.temas.length },
          { label: "Preguntas", value: bank.preguntas.length },
          { label: "Tarjetas", value: bank.flashcards.length },
        ].map((s) => (
          <div key={s.label} className="py-3 rounded-folder bg-card paper-shadow">
            <p className="brand text-[28px] leading-none">{s.value}</p>
            <p className="text-xs text-ink-soft mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      <GeneratePanel bank={bank} onAdd={onAddExtra} />

      {bloques.map((b) => (
        <section key={b} aria-label={BLOCKS[b].label}>
          <div className="flex items-end">
            <FolderTab color={BLOCKS[b].hex} className="-mb-px relative z-[1]">
              {BLOCKS[b].label}
            </FolderTab>
          </div>
          <ol className="rounded-folder rounded-tl-none p-2 flex flex-col gap-1" style={{ background: BLOCKS[b].hex }}>
            {temasOf(bank, b).map((t) => (
              <li key={t.id} className="rounded-[14px] bg-card/70 px-3 py-2.5 flex items-baseline gap-3">
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

      <div className="pt-2 flex flex-col gap-3">
        <p className="text-sm text-ink-soft">
          Versión del {fecha}. Cuando haya temas nuevos, la app los descarga sola al abrirla; tu progreso, racha y fallos se conservan.
        </p>
        <Button variant="ghost" onClick={() => setConfirm(true)} className="w-full">
          <SignOut size={20} weight="bold" /> Cerrar sesión
        </Button>
        <details className="text-sm text-ink-soft">
          <summary className="tap cursor-pointer py-3">Importar un archivo manualmente</summary>
          <ImportBank onImport={onImport} label="Elegir mi-banco.json" variant="ghost" />
        </details>
      </div>

      <Sheet
        open={confirm}
        title="¿Cerrar sesión?"
        onClose={() => setConfirm(false)}
        body="Se quita el temario de este móvil. Tu racha, XP y medallas se conservan. Para volver a entrar necesitarás tu usuario y contraseña."
        actions={
          <>
            <Button variant="red" onClick={() => { setConfirm(false); onLogout(); }}>
              Cerrar sesión
            </Button>
            <Button variant="paper" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </div>
  );
}
