import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Books, CaretRight, Check, DeviceMobile, Fire, X } from "@phosphor-icons/react";
import { DAILY_GOALS, MASTERED_AFTER, dateKey, daysUntil, rankInfo, streakView } from "../lib/logic.js";
import { Button, Folder, FolderTab, Galones, IconButton, Illustration, Paper, ProgressBar, Segmented, Sheet } from "../ui.jsx";
import { GoalRing } from "./Celebration.jsx";
import { ImportBank } from "./Cards.jsx";

const WEEKDAY = ["D", "L", "M", "X", "J", "V", "S"];

// La hoja de opositor «sale del archivador» solo la primera vez que se abre Inicio en la sesión:
// volver a la pestaña es frecuente y repetir la animación la haría pesada.
let introPlayed = false;

export function RankFolder({ xp, tab = "Hoja de opositor", intro = false }) {
  return (
    <Folder color="#581e70" tab={tab} className={intro ? "anim-folder" : ""}>
      <RankContent xp={xp} />
    </Folder>
  );
}

function RankContent({ xp }) {
  const { rank, next, pct, toNext } = rankInfo(xp);
  return (
    <div>
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
    </div>
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

/** «Tu examen»: cuenta atrás y meta de hoy, el gancho diario. */
function PlanContent({ store, onPlan }) {
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
      <div>
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
      </div>

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

/* Archivador de Inicio: tres carpetas y una sola delante; se cambia tocando su pestaña.
   Se recuerda la última elegida mientras la app esté abierta. */
const HOME_FOLDERS = [
  { id: "examen", label: "Tu examen", color: "#ffe927", dark: false },
  { id: "racha", label: "Racha", color: "#d71e1e", dark: true },
  { id: "hoja", label: "Hoja de opositor", color: "#581e70", dark: true },
];
let lastFolder = "examen";

function HomeCabinet({ store, onPlan, intro }) {
  const [active, setActive] = useState(lastFolder);
  const tabs = useRef([]);
  const current = HOME_FOLDERS.find((f) => f.id === active);
  const choose = (id) => {
    lastFolder = id;
    setActive(id);
  };
  // Patrón de pestañas: flechas para moverse entre ellas.
  const onKey = (e, k) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (k + dir + HOME_FOLDERS.length) % HOME_FOLDERS.length;
    choose(HOME_FOLDERS[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section className={intro ? "anim-folder" : ""}>
      <div role="tablist" aria-label="Tu progreso" className="flex items-end">
        {HOME_FOLDERS.map((f, k) => {
          const on = f.id === active;
          return (
            <button
              key={f.id}
              ref={(el) => (tabs.current[k] = el)}
              type="button"
              role="tab"
              id={`carpeta-tab-${f.id}`}
              aria-selected={on}
              aria-controls="carpeta-inicio"
              tabIndex={on ? 0 : -1}
              onClick={() => choose(f.id)}
              onKeyDown={(e) => onKey(e, k)}
              className={`tap relative shrink-0 -mb-px transition-transform duration-200 ease-out ${k ? "-ml-3" : ""} ${on ? "z-10" : "z-0 translate-y-1"}`}
            >
              <FolderTab color={on ? f.color : "#2e2e2e"} dark={on ? f.dark : true} compact>
                <span className={`text-[14px] ${on ? "" : "text-mute"}`}>{f.label}</span>
              </FolderTab>
            </button>
          );
        })}
      </div>
      <div
        id="carpeta-inicio"
        role="tabpanel"
        aria-labelledby={`carpeta-tab-${active}`}
        className={`rounded-folder folder-shadow transition-colors duration-200 ease-out ${current.dark ? "text-paper" : "text-ink"}`}
        style={{ background: current.color }}
      >
        <div key={active} className="anim-fade">
          {active === "examen" && <PlanContent store={store} onPlan={onPlan} />}
          {active === "racha" && (
            <div className="p-2.5">
              <StreakCard streak={store.streak} />
            </div>
          )}
          {active === "hoja" && <RankContent xp={store.xp} />}
        </div>
      </div>
    </section>
  );
}

/** Estado del temario cargado: grande mientras no hay nada, una línea discreta después. */
function TemarioCard({ bank, onImport, onGoTemario }) {
  if (!bank) {
    return (
      <Paper className="p-4">
        <Illustration name="bienvenida" className="w-full" alt="" />
        <p className="label text-mute-paper mt-3">Paso 1</p>
        <p className="display text-[34px] mt-1">Carga tu temario</p>
        <p className="text-[15px] text-mute-paper mt-2">
          Importa el archivo <span className="font-mono text-ink">mi-banco.json</span> con las preguntas y tarjetas de todos tus temas. Se guarda solo en este móvil.
        </p>
        <div className="mt-4">
          <ImportBank onImport={onImport} variant="blue" />
        </div>
      </Paper>
    );
  }
  const fecha = new Date(bank.generado).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return (
    <button type="button" onClick={onGoTemario} className="tap press w-full text-left flex items-center gap-3 rounded-folder bg-ink-2 border border-ink-3 px-4 py-3">
      <Books size={24} weight="fill" className="text-folder-green shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block font-semibold">Temario cargado</span>
        <span className="block text-sm text-mute">
          {bank.temas.length} temas · {bank.preguntas.length} preguntas · actualizado el {fecha}
        </span>
      </span>
      <CaretRight size={20} weight="bold" className="text-mute shrink-0" />
    </button>
  );
}

export default function Home({ store, bank, install, onDismissInstall, onImport, onGoTemario, onReview, onPlan }) {
  const intro = useRef(!introPlayed).current;
  useEffect(() => {
    introPlayed = true;
  }, []);
  const streakCount = streakView(store.streak).count;
  const pendingMistakes = Object.keys(store.mistakes).length;
  const dateLabel = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

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
          <button type="button" onClick={install.install} className="tap press h-11 px-3 rounded-folder bg-ink text-paper text-sm font-semibold flex items-center gap-1.5">
            <DeviceMobile size={18} weight="bold" /> Instalar
          </button>
          <IconButton label="Ocultar aviso" onClick={onDismissInstall} className="text-mute-paper -mr-1">
            <X size={20} weight="bold" />
          </IconButton>
        </Paper>
      )}

      {!bank && <TemarioCard bank={bank} onImport={onImport} onGoTemario={onGoTemario} />}
      <HomeCabinet store={store} onPlan={onPlan} intro={intro} />

      {pendingMistakes > 0 && (
        <button type="button" onClick={onReview} className="tap press text-left rounded-folder bg-folder-red text-paper p-4 flex items-center gap-4">
          <ArrowCounterClockwise size={30} weight="bold" className="shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="display text-[26px] block">Repasar fallos</span>
            <span className="text-sm leading-snug block mt-1">Salen del repaso cuando las aciertas {MASTERED_AFTER} veces seguidas</span>
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums" aria-label={`${pendingMistakes} pendientes`}>
            {pendingMistakes}
          </span>
        </button>
      )}

      {bank && <TemarioCard bank={bank} onImport={onImport} onGoTemario={onGoTemario} />}
    </div>
  );
}
