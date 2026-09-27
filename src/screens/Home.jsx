import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, CaretDown, Check, DeviceMobile, Fire, Play, Sparkle, Timer, X } from "@phosphor-icons/react";
import { BLOCKS, BLOCK_IDS, DAILY_GOALS, MASTERED_AFTER, dateKey, daysUntil, fmt2, rankInfo, streakView } from "../lib/logic.js";
import { SEED_QUESTIONS } from "../data/questions.js";
import { Button, Folder, FolderTab, Galones, IconButton, Illustration, Paper, ProgressBar, Segmented, Sheet } from "../ui.jsx";
import { GoalRing } from "./Celebration.jsx";

const WEEKDAY = ["D", "L", "M", "X", "J", "V", "S"];

// Las carpetas «salen del archivador» solo la primera vez que se abre Inicio en la sesión:
// volver a la pestaña es frecuente y repetir la animación la haría pesada.
let introPlayed = false;

export function RankFolder({ xp, tab = "Hoja de servicio", intro = false }) {
  const { rank, next, pct, toNext } = rankInfo(xp);
  return (
    <Folder color="#581e70" tab={tab} className={intro ? "anim-folder" : ""}>
      <div className="p-5 flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="label text-paper/70">
            Rango · Nivel {rank.level}/5
          </p>
          <p className="display text-[40px] mt-2">{rank.name}</p>
          <div className="mt-3">
            <Galones level={rank.level} />
          </div>
        </div>
        <Paper className="w-24 h-24 p-1.5 shrink-0 self-start">
          <Illustration name={rank.illustration} alt={rank.name} className="w-full" />
        </Paper>
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="font-mono font-semibold">{xp} XP</span>
          <span className="text-sm text-paper/75 text-right">{next ? `${toNext} XP para ${next.name}` : "Rango máximo"}</span>
        </div>
        <ProgressBar pct={pct} track="bg-black/30" className="h-2.5" label="Progreso hasta el siguiente rango" />
      </div>
    </Folder>
  );
}

function StreakCard({ streak }) {
  const view = streakView(streak);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const k = dateKey(d);
    return { k, label: WEEKDAY[d.getDay()], studied: (streak.days || []).includes(k), isToday: i === 6 };
  });
  const art = view.state === "done" ? "racha-activa" : view.state === "pending" ? "racha-pendiente" : "racha-apagada";
  const message = {
    done: "Hoy ya has cumplido. Vuelve mañana.",
    pending: "Haz un test hoy para no perder la racha.",
    broken: "La racha se ha cortado. Empieza otra hoy.",
    none: "Termina un test para encender tu primera racha.",
  }[view.state];

  return (
    <Paper className="p-4">
      <div className="flex gap-4 items-center">
        <Illustration name={art} className="w-28 shrink-0" alt="" />
        <div className="min-w-0">
          <p className="label text-mute-paper flex items-center gap-1.5">
            <Fire size={16} weight="fill" className={view.count ? "text-folder-red anim-flicker" : "text-paper-3"} />
            Racha de estudio
          </p>
          <p className="display text-5xl mt-1">
            {view.count} {view.count === 1 ? "día" : "días"}
          </p>
          <p className="text-sm text-mute-paper mt-1 leading-snug">{message}</p>
        </div>
      </div>
      <ol className="grid grid-cols-7 gap-1 mt-4" aria-label="Últimos 7 días">
        {days.map((d) => (
          <li key={d.k} className="flex flex-col items-center gap-1">
            <span className={`font-mono text-xs ${d.isToday ? "text-ink font-semibold" : "text-mute-paper"}`}>{d.label}</span>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-500 ${
                d.studied ? "bg-folder-yellow text-ink" : d.isToday ? "border-2 border-dashed border-ink/40" : "bg-paper-2"
              }`}
              aria-label={d.studied ? "Estudiado" : "Sin estudiar"}
            >
              {d.studied && <Check size={18} weight="bold" />}
            </span>
          </li>
        ))}
      </ol>
      <p className="font-mono text-xs text-mute-paper mt-3">Mejor racha: {streak.best || 0} días</p>
    </Paper>
  );
}

/**
 * Archivador de bloques: las carpetas están cerradas y solo se ven sus pestañas (con el dato clave).
 * Al tocar una pestaña se «saca» esa carpeta y se guarda la que estuviera abierta.
 * Cada franja mide lo mismo que una pestaña (44 px), así la pestaña siguiente asienta sobre ella sin huecos.
 */
const TAB_OFFSETS = ["ml-2", "ml-12", "ml-24"];

function BlockCabinet({ store, intro, onPractice }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="pt-1">
      {BLOCK_IDS.map((id, k) => {
        const b = BLOCKS[id];
        const s = store.blockStats[id] || { c: 0, t: 0 };
        const pct = s.t ? Math.round((s.c / s.t) * 100) : null;
        const isOpen = open === id;
        const last = k === BLOCK_IDS.length - 1;
        const bankSize = SEED_QUESTIONS.filter((q) => q.block === id).length;
        return (
          <section
            key={id}
            className={`relative ${k ? "-mt-11" : ""} ${intro ? "anim-folder" : ""}`}
            style={intro ? { animationDelay: `${120 + k * 50}ms` } : undefined}
          >
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                aria-controls={`carpeta-${id}`}
                className={`tap press relative z-[1] -mb-px ${TAB_OFFSETS[k]}`}
              >
                <FolderTab color={b.hex}>
                  {b.label}
                  <span className="font-mono text-sm text-paper/80">{pct === null ? "—" : `${pct}%`}</span>
                  <CaretDown size={16} weight="bold" className={`transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`} />
                </FolderTab>
              </button>
            </div>
            <div className="rounded-folder folder-shadow" style={{ background: b.hex }}>
              {/* Abre/cierra con grid-template-rows 0fr↔1fr: se desplaza en pantalla, así que ease-in-out. */}
              <div
                id={`carpeta-${id}`}
                role="region"
                aria-label={b.label}
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden" inert={isOpen ? undefined : ""}>
                  <div className="px-5 pt-5 pb-2">
                    <div className="flex items-end justify-between gap-4">
                      <p className="display text-5xl">{pct === null ? "—" : `${pct}%`}</p>
                      <p className="font-mono text-sm text-paper/80 text-right">{s.t ? `${s.c} de ${s.t} aciertos` : "Sin datos todavía"}</p>
                    </div>
                    <ProgressBar pct={pct ?? 0} color="#fdfaf7" track="bg-black/25" className="h-2 mt-4" label={`Aciertos en ${b.label}`} />
                    <Button variant="paper" onClick={() => onPractice(id)} className="w-full mt-5">
                      <Play size={18} weight="fill" /> Practicar · {bankSize} preguntas
                    </Button>
                  </div>
                </div>
              </div>
              {/* Franja visible con la carpeta cerrada; la última solo muestra el canto. */}
              <div className={last ? "h-3" : "h-11"} aria-hidden="true" />
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Carpeta «Tu examen»: cuenta atrás y meta de hoy, el gancho diario. */
function PlanFolder({ store, onPlan }) {
  const today = dateKey();
  const done = store.daily[today] || 0;
  const goal = store.plan.dailyGoal;
  const left = daysUntil(store.plan.examDate, today);
  const [editing, setEditing] = useState(false);
  const [draftDate, setDraftDate] = useState(store.plan.examDate || "");
  const [draftGoal, setDraftGoal] = useState(goal);
  const examLabel = store.plan.examDate
    ? new Date(`${store.plan.examDate}T12:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : null;

  const openEditor = () => {
    setDraftDate(store.plan.examDate || "");
    setDraftGoal(goal);
    setEditing(true);
  };

  return (
    <>
      <Folder color="#ffe927" tab="Tu examen" tabDark={false}>
        <div className="p-5 pb-4 text-ink flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {left === null ? (
              <>
                <p className="label text-ink/70">Cuenta atrás</p>
                <p className="display text-[34px] mt-1">¿Cuándo es tu examen?</p>
              </>
            ) : left < 0 ? (
              <>
                <p className="label text-ink/70">Examen</p>
                <p className="display text-[34px] mt-1">Ya pasó</p>
              </>
            ) : (
              <>
                <p className="display text-[72px]">{left === 0 ? "Hoy" : left}</p>
                <p className="label text-ink/80 mt-1">{left === 0 ? "¡Mucha suerte!" : `${left === 1 ? "día" : "días"} para el examen`}</p>
                <p className="text-sm text-ink/70 mt-1 first-letter:uppercase">{examLabel}</p>
              </>
            )}
          </div>
          <GoalRing done={done} goal={goal} size={112} stroke={10} color="#191919" track="rgba(25,25,25,0.15)">
            <span className="font-mono text-xl font-semibold tabular-nums">
              {Math.min(done, 999)}/{goal}
            </span>
            <span className="text-[11px] font-semibold">{done >= goal ? "¡meta!" : "hoy"}</span>
          </GoalRing>
        </div>
        <div className="px-5 pb-5">
          <button type="button" onClick={openEditor} className="tap press h-11 px-3 -ml-3 rounded-folder text-ink text-sm font-semibold underline underline-offset-4 decoration-2">
            {left === null ? "Poner fecha y meta diaria" : "Cambiar fecha o meta"}
          </button>
        </div>
      </Folder>

      <Sheet
        open={editing}
        title="Tu plan"
        onClose={() => setEditing(false)}
        body={
          <div className="flex flex-col gap-4 text-ink pt-1">
            <div>
              <label htmlFor="exam-date" className="label text-mute-paper block mb-2">
                Fecha del examen
              </label>
              <input
                id="exam-date"
                type="date"
                min={today}
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="w-full h-12 rounded-folder bg-paper-2 border-2 border-paper-3 px-3 font-mono text-ink outline-none focus:border-ink"
              />
            </div>
            <Segmented
              label="Meta diaria (preguntas)"
              value={draftGoal}
              onChange={setDraftGoal}
              options={DAILY_GOALS.map((g) => ({ value: g, label: String(g), sub: g === 40 ? "recomendada" : g === 20 ? "suave" : g === 60 ? "intensa" : "máxima" }))}
            />
          </div>
        }
        actions={
          <>
            <Button
              variant="blue"
              onClick={() => {
                onPlan({ examDate: draftDate || null, dailyGoal: draftGoal });
                setEditing(false);
              }}
            >
              Guardar plan
            </Button>
            <Button variant="paper" className="border-2 border-paper-3" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </>
  );
}

export default function Home({ store, install, onDismissInstall, onNewExam, onGoNotes, onPractice, onReview, onPlan }) {
  const intro = useRef(!introPlayed).current;
  useEffect(() => {
    introPlayed = true;
  }, []);
  const streakCount = streakView(store.streak).count;
  const pendingMistakes = Object.keys(store.mistakes).length;
  const dateLabel = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const accuracy = store.totals.answered ? Math.round((store.totals.correct / store.totals.answered) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="display text-[44px]">Recuento</h1>
          <p className="label text-mute mt-1">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1.5 h-11 px-3 rounded-full bg-ink-2 border border-ink-3" aria-label={`Racha de ${streakCount} días`}>
          <Fire size={20} weight="fill" className={streakCount ? "text-folder-yellow" : "text-ink-4"} />
          <span className="font-mono font-semibold">{streakCount}</span>
        </div>
      </header>

      {install.canInstall && !store.installDismissed && (
        <Paper className="p-3 flex items-center gap-3 anim-pop">
          <Illustration name="instalar" className="w-16 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">Instala Recuento</p>
            <p className="text-sm text-mute-paper leading-snug">Ábrela desde tu pantalla de inicio, también sin conexión.</p>
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" onClick={install.install} className="tap press h-11 px-3 rounded-folder bg-ink text-paper text-sm font-semibold flex items-center gap-1.5">
              <DeviceMobile size={18} weight="bold" /> Instalar
            </button>
          </div>
          <IconButton label="Ocultar aviso" onClick={onDismissInstall} className="text-mute-paper -mr-1">
            <X size={20} weight="bold" />
          </IconButton>
        </Paper>
      )}

      <PlanFolder store={store} onPlan={onPlan} />
      <StreakCard streak={store.streak} />
      <RankFolder xp={store.xp} intro={intro} />

      {store.history.length === 0 && (
        <Paper className="p-4">
          <Illustration name="bienvenida" className="w-full" alt="" />
          <p className="font-serif text-xl leading-snug mt-3">Tu primer turno empieza aquí.</p>
          <p className="text-[15px] text-mute-paper mt-1">
            Haz un simulacro corto para estrenar la racha y conseguir la medalla Primer Turno.
          </p>
        </Paper>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onNewExam} className="tap press text-left rounded-folder p-4 bg-folder-yellow text-ink min-h-[132px] flex flex-col justify-between">
          <Timer size={30} weight="bold" />
          <span>
            <span className="display text-[26px] block">Simulacro</span>
            <span className="text-sm leading-snug block mt-1">Cronometrado, −⅓ por fallo</span>
          </span>
        </button>
        <button type="button" onClick={onGoNotes} className="tap press text-left rounded-folder p-4 bg-ink-2 border-2 border-ink-3 min-h-[132px] flex flex-col justify-between">
          <Sparkle size={30} weight="bold" className="text-folder-yellow" />
          <span>
            <span className="display text-[26px] block">Tus apuntes</span>
            <span className="text-sm text-mute leading-snug block mt-1">Pega texto o sube un PDF</span>
          </span>
        </button>
      </div>

      {pendingMistakes > 0 && (
        <button type="button" onClick={onReview} className="tap press -mt-3 text-left rounded-folder bg-folder-red text-paper p-4 flex items-center gap-4">
          <ArrowCounterClockwise size={30} weight="bold" className="shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="display text-[26px] block">Repasar fallos</span>
            <span className="text-sm text-paper/85 leading-snug block mt-1">Salen del repaso cuando las aciertas {MASTERED_AFTER} veces seguidas</span>
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums" aria-label={`${pendingMistakes} pendientes`}>
            {pendingMistakes}
          </span>
        </button>
      )}

      <section aria-labelledby="bloques-title">
        <div className="flex items-end justify-between mb-2">
          <h2 id="bloques-title" className="display text-3xl">Por bloques</h2>
          {accuracy !== null && <span className="font-mono text-sm text-mute">Global {accuracy}%</span>}
        </div>
        <BlockCabinet store={store} intro={intro} onPractice={onPractice} />
      </section>

      {store.history.length > 0 && (
        <section aria-labelledby="historial-title">
          <h2 id="historial-title" className="display text-3xl mb-3">Últimos tests</h2>
          <ul className="flex flex-col divide-y divide-ink-3 border-y border-ink-3">
            {store.history.slice(0, 5).map((h) => (
              <li key={h.id} className="py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{h.title}</p>
                  <p className="font-mono text-xs text-mute mt-0.5">
                    {new Date(h.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {h.correct} A · {h.wrong} E · {h.blank} B
                  </p>
                </div>
                <p className="font-mono text-lg font-semibold tabular-nums">{fmt2(h.over10)}</p>
              </li>
            ))}
          </ul>
          <p className="font-mono text-xs text-mute mt-2">A aciertos · E errores · B en blanco · nota sobre 10</p>
        </section>
      )}
    </div>
  );
}
