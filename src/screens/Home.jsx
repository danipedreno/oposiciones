import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Books, CaretRight, Check, DeviceMobile, Fire, X } from "@phosphor-icons/react";
import { DAILY_GOALS, MASTERED_AFTER, dateKey, daysUntil, rankInfo, streakView } from "../lib/logic.js";
import { PAL } from "../lib/palette.js";
import { Button, Folder, FolderTab, Galones, IconButton, Illustration, Paper, ProgressBar, Segmented, Sheet } from "../ui.jsx";
import { GoalRing } from "./Celebration.jsx";
import { ImportBank } from "./Cards.jsx";

const WEEKDAY = ["D", "L", "M", "X", "J", "V", "S"];

// El archivador de Inicio «entra» solo la primera vez que se abre en la sesión:
// volver a la pestaña es frecuente y repetir la animación la haría pesada.
let introPlayed = false;

export function RankFolder({ xp, tab = "Hoja de opositor", intro = false }) {
  return (
    <Folder color={PAL.lilac} tab={tab} className={intro ? "anim-folder" : ""}>
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
          <p className="label">Rango · nivel {rank.level} de 5</p>
          <p className="display text-[36px] mt-2">{rank.name}</p>
          <div className="mt-3">
            <Galones level={rank.level} />
          </div>
        </div>
        <div className="w-28 h-28 p-2.5 shrink-0 self-start bg-card blob">
          <Illustration name={rank.illustration} alt={rank.name} className="w-full" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="font-mono font-semibold">{xp} XP</span>
          <span className="text-sm text-right">{next ? `${toNext} XP para ${next.name}` : "Rango máximo"}</span>
        </div>
        <ProgressBar pct={pct} color={PAL.plum} track="bg-card/70" className="h-3" label="Progreso hasta el siguiente rango" />
      </div>
    </div>
  );
}

function StreakContent({ streak }) {
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
    <div className="p-5">
      <div className="flex gap-4 items-center">
        <div className="w-28 h-28 p-2.5 shrink-0 bg-card blob-2">
          <Illustration name={art} className="w-full" alt="" />
        </div>
        <div className="min-w-0">
          <p className="brand text-[56px] leading-[0.9]">{view.count}</p>
          <p className="text-lg font-medium leading-tight mt-1">{view.count === 1 ? "día seguido" : "días seguidos"}</p>
          <p className="text-sm mt-1 leading-snug">{message}</p>
        </div>
      </div>
      <ol className="grid grid-cols-7 gap-1 mt-5" aria-label="Últimos 7 días">
        {days.map((d) => (
          <li key={d.k} className="flex flex-col items-center gap-1.5">
            <span className={`text-xs ${d.isToday ? "font-bold" : "font-medium"}`}>{d.label}</span>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-500 ${
                d.studied ? "bg-ink text-peach" : d.isToday ? "border-2 border-dashed border-ink/50" : "bg-card/70"
              }`}
              aria-label={d.studied ? "Estudiado" : "Sin estudiar"}
            >
              {d.studied && <Check size={18} weight="bold" />}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-sm mt-4 flex items-center gap-1.5">
        <Fire size={16} weight="fill" className={view.count ? "text-plum anim-flicker" : "text-ink/40"} />
        Mejor racha: {streak.best || 0} días
      </p>
    </div>
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
      <div className="p-5 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          {left === null ? (
            <>
              <p className="display text-[34px]">¿Cuándo es tu examen?</p>
              <p className="text-[15px] mt-2 leading-snug">Pon la fecha y la meta diaria para llevar la cuenta atrás.</p>
            </>
          ) : left < 0 ? (
            <p className="display text-[34px]">El examen ya pasó</p>
          ) : (
            <>
              <p className="brand text-[80px] leading-[0.85]">{left === 0 ? "Hoy" : left}</p>
              <p className="text-lg font-medium mt-2 leading-tight">{left === 0 ? "¡Mucha suerte!" : `${left === 1 ? "día" : "días"} para el examen`}</p>
              <p className="text-sm mt-1 first-letter:uppercase">{examLabel}</p>
            </>
          )}
        </div>
        <GoalRing done={done} goal={goal} size={112} stroke={10} color={PAL.ink} track="rgba(34,34,34,0.12)">
          <span className="font-mono text-xl font-semibold">
            {Math.min(done, 999)}/{goal}
          </span>
          <span className="text-xs font-medium">{done >= goal ? "¡meta!" : "hoy"}</span>
        </GoalRing>
      </div>
      <div className="px-5 pb-5">
        <button type="button" onClick={openEditor} className="tap press h-11 px-5 rounded-full bg-ink text-ground text-sm font-semibold">
          {left === null ? "Poner fecha y meta" : "Cambiar fecha o meta"}
        </button>
      </div>

      <Sheet
        open={editing}
        title="Tu plan"
        onClose={() => setEditing(false)}
        body={
          <div className="flex flex-col gap-4 text-ink pt-1">
            <div>
              <label htmlFor="exam-date" className="label text-ink-soft block mb-2">
                Fecha del examen
              </label>
              <input
                id="exam-date"
                type="date"
                min={today}
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="w-full h-12 rounded-full bg-ground border-2 border-line px-4 font-mono text-ink outline-none focus:border-ink"
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
            <Button variant="paper" onClick={() => setEditing(false)}>
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
  { id: "examen", label: "Tu examen", color: PAL.sun },
  { id: "racha", label: "Racha", color: PAL.peach },
  { id: "hoja", label: "Hoja de opositor", color: PAL.lilac },
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
      <div role="tablist" aria-label="Tu progreso" className="flex items-end gap-1">
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
              className={`tap relative shrink-0 -mb-px transition-transform duration-200 ease-out ${on ? "z-10" : "z-0 translate-y-1"}`}
            >
              <FolderTab color={on ? f.color : PAL.ground2} compact>
                <span className={on ? "font-semibold" : "text-ink-soft"}>{f.label}</span>
              </FolderTab>
            </button>
          );
        })}
      </div>
      <div
        id="carpeta-inicio"
        role="tabpanel"
        aria-labelledby={`carpeta-tab-${active}`}
        className={`rounded-folder text-ink transition-colors duration-200 ease-out ${active === HOME_FOLDERS[0].id ? "rounded-tl-none" : ""}`}
        style={{ background: current.color }}
      >
        <div key={active} className="anim-fade">
          {active === "examen" && <PlanContent store={store} onPlan={onPlan} />}
          {active === "racha" && <StreakContent streak={store.streak} />}
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
      <Paper className="p-5">
        <div className="bg-mist blob p-3">
          <Illustration name="bienvenida" className="w-full" alt="" />
        </div>
        <p className="display text-[34px] mt-4">Carga tu temario</p>
        <p className="text-[15px] text-ink-soft mt-2">
          Importa el archivo <span className="font-semibold text-ink">mi-banco.json</span> con las preguntas y tarjetas de todos tus temas. Se guarda solo en este móvil.
        </p>
        <div className="mt-4">
          <ImportBank onImport={onImport} variant="blue" />
        </div>
      </Paper>
    );
  }
  const fecha = new Date(bank.generado).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return (
    <button type="button" onClick={onGoTemario} className="tap press w-full text-left flex items-center gap-3 rounded-folder bg-card paper-shadow px-4 py-3">
      <span className="w-11 h-11 blob bg-mint flex items-center justify-center shrink-0">
        <Books size={22} weight="fill" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold">Temario cargado</span>
        <span className="block text-sm text-ink-soft">
          {bank.temas.length} temas · {bank.preguntas.length} preguntas · actualizado el {fecha}
        </span>
      </span>
      <CaretRight size={20} weight="bold" className="text-ink-soft shrink-0" />
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
          <h1 className="brand text-[46px]">Recuento</h1>
          <p className="label text-ink-soft mt-1.5 first-letter:uppercase">{dateLabel}</p>
        </div>
        <div className={`flex items-center gap-1.5 h-11 px-4 rounded-full ${streakCount ? "bg-sun" : "bg-card paper-shadow"}`} aria-label={`Racha de ${streakCount} días`}>
          <Fire size={20} weight="fill" className={streakCount ? "text-ink" : "text-line-strong"} />
          <span className="font-mono font-semibold">{streakCount}</span>
        </div>
      </header>

      {!install.installed && !install.canInstall && !store.installDismissed && install.browser !== "desktop" && (
        <Paper className="p-4 flex gap-3 anim-pop">
          <div className="w-16 h-16 p-1.5 shrink-0 self-start bg-mist blob">
            <Illustration name="instalar" className="w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">Instálala en tu móvil</p>
            <p className="text-sm text-ink-soft leading-snug mt-1">
              {
                {
                  chrome: "En Chrome: toca ⋮ (arriba a la derecha) → «Instalar aplicación» o «Añadir a pantalla de inicio».",
                  samsung: "En Samsung Internet: toca ≡ (abajo) → «Añadir página a» → «Pantalla de inicio».",
                  firefox: "En Firefox: toca ⋮ → «Instalar» o «Añadir a pantalla de inicio».",
                  ios: "En Safari: toca Compartir → «Añadir a pantalla de inicio».",
                }[install.browser]
              }
            </p>
          </div>
          <IconButton label="Ocultar aviso" onClick={onDismissInstall} className="text-ink-soft -mr-2 -mt-2 self-start">
            <X size={20} weight="bold" />
          </IconButton>
        </Paper>
      )}

      {install.canInstall && !store.installDismissed && (
        <Paper className="p-3 flex items-center gap-3 anim-pop">
          <div className="w-14 h-14 p-1 shrink-0 bg-mist blob">
            <Illustration name="instalar" className="w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">Instala Recuento</p>
            <p className="text-sm text-ink-soft leading-snug">Ábrela desde tu pantalla de inicio, también sin conexión.</p>
          </div>
          <button type="button" onClick={install.install} className="tap press h-11 px-4 rounded-full bg-ink text-ground text-sm font-semibold flex items-center gap-1.5">
            <DeviceMobile size={18} weight="bold" /> Instalar
          </button>
          <IconButton label="Ocultar aviso" onClick={onDismissInstall} className="text-ink-soft -mr-1">
            <X size={20} weight="bold" />
          </IconButton>
        </Paper>
      )}

      {!bank && <TemarioCard bank={bank} onImport={onImport} onGoTemario={onGoTemario} />}
      <HomeCabinet store={store} onPlan={onPlan} intro={intro} />

      {pendingMistakes > 0 && (
        <button type="button" onClick={onReview} className="tap press text-left rounded-folder bg-plum text-ground p-5 flex items-center gap-4">
          <span className="w-12 h-12 blob bg-lilac text-plum flex items-center justify-center shrink-0">
            <ArrowCounterClockwise size={24} weight="bold" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="display text-[28px] block text-lilac">Repasar fallos</span>
            <span className="text-sm leading-snug block mt-1">Salen del repaso cuando las aciertas {MASTERED_AFTER} veces seguidas</span>
          </span>
          <span className="brand text-[44px] text-lilac" aria-label={`${pendingMistakes} pendientes`}>
            {pendingMistakes}
          </span>
        </button>
      )}

      {bank && <TemarioCard bank={bank} onImport={onImport} onGoTemario={onGoTemario} />}
    </div>
  );
}
