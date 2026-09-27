import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Cards, CheckCircle, ClipboardText, House, Trophy, WarningCircle } from "@phosphor-icons/react";
import { applyCardsResult, applyExamResult, createExam, mistakePool } from "./lib/logic.js";
import { useBank } from "./lib/bank.js";
import CardsScreen from "./screens/Cards.jsx";
import { DEFAULT_STORE, useInstallPrompt, useNow, usePersistentStore } from "./lib/store.js";
import { AppToaster, notify } from "./ui.jsx";
import Home from "./screens/Home.jsx";
import Celebrations from "./screens/Celebration.jsx";
import Temario from "./screens/Temario.jsx";
import Login from "./screens/Login.jsx";
import Achievements from "./screens/Achievements.jsx";
import { ExamResults, ExamRunner, ExamSetup } from "./screens/Exam.jsx";

const TABS = [
  { id: "home", label: "Inicio", Icon: House, color: "#ffe927", dark: false },
  { id: "test", label: "Test", Icon: ClipboardText, color: "#1e4bd7", dark: true },
  { id: "cards", label: "Tarjetas", Icon: Cards, color: "#d71e1e", dark: true },
  { id: "badges", label: "Logros", Icon: Trophy, color: "#581e70", dark: true },
];

/**
 * Barra de pestañas. La pestaña activa es una capa de color recortada con clip-path que se desliza
 * de una pestaña a otra: el color de carpeta de cada sección cambia exactamente en el borde.
 */
function TabBar({ tab, onChange }) {
  const index = TABS.findIndex((t) => t.id === tab);
  const n = TABS.length;
  return (
    <nav className="fixed left-4 right-4 tabbar-pos z-40" aria-label="Navegación principal">
      <div className="relative max-w-md mx-auto rounded-folder bg-ink-2/95 backdrop-blur-md border border-ink-3 p-1.5 shadow-2xl shadow-black/70">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={tab === id ? "page" : undefined}
              className="tap press h-14 rounded-[4px] flex flex-col items-center justify-center gap-0.5 text-mute hover:text-paper"
            >
              <Icon size={24} />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
        <div
          aria-hidden="true"
          hidden={index < 0}
          className="absolute inset-1.5 grid gap-1 pointer-events-none transition-[clip-path] duration-[250ms] ease-in-out"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, clipPath: `inset(0 ${((n - 1 - index) / n) * 100}% 0 ${(index / n) * 100}% round 4px)` }}
        >
          {TABS.map(({ id, label, Icon, color, dark }) => (
            <div key={id} className={`h-14 rounded-[4px] flex flex-col items-center justify-center gap-0.5 ${dark ? "text-paper" : "text-ink"}`} style={{ background: color }}>
              <Icon size={24} weight="fill" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [store, setStore] = usePersistentStore();
  const [tab, setTab] = useState(() => (store.activeExam || store.lastResult ? "test" : "home"));
  const install = useInstallPrompt();
  const { bank, importFile, login, logout } = useBank({
    onUpdated: (b) =>
      notify({
        icon: <CheckCircle size={24} weight="fill" />,
        color: "#0c7866",
        kicker: "Temario actualizado",
        text: `${b.temas.length} temas · ${b.preguntas.length} preguntas`,
      }),
  });
  const [celebration, setCelebration] = useState(null); // { queue, report }
  const storeRef = useRef(store);
  const finishedIds = useRef(new Set());
  const mainRef = useRef(null);
  storeRef.current = store;

  const exam = store.activeExam;
  const now = useNow(!!exam);
  const remainingMs = exam ? Math.max(0, exam.endsAt - now) : 0;

  const updateExam = useCallback((fn) => setStore((s) => (s.activeExam ? { ...s, activeExam: fn(s.activeExam) } : s)), [setStore]);

  const startExam = useCallback(
    (cfg) => {
      const e = createExam(cfg);
      if (!e.questions.length) return;
      setStore((s) => ({ ...s, activeExam: e, lastResult: null }));
      setTab("test");
    },
    [setStore]
  );

  const finishExam = useCallback(
    (reason = "submitted") => {
      const s = storeRef.current;
      if (!s.activeExam || finishedIds.current.has(s.activeExam.id)) return;
      finishedIds.current.add(s.activeExam.id);
      const { store: next, report } = applyExamResult(s, s.activeExam, reason, new Date());
      setStore(next);
      setTab("test");
      // Pantallas de «¡Enhorabuena!» encadenadas; debajo queda el resultado.
      setCelebration({ queue: report.celebrations, report });
    },
    [setStore]
  );

  // Entrega automática al agotarse el tiempo (también tras reabrir la app con el examen caducado).
  useEffect(() => {
    if (exam && now >= exam.endsAt) finishExam("timeout");
  }, [exam, now, finishExam]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [tab]);

  const onSelect = (idx) =>
    updateExam((e) => {
      const i = e.current;
      if (e.feedback === "immediate") {
        if (e.revealed[i]) return e;
        return { ...e, answers: e.answers.map((a, k) => (k === i ? idx : a)), revealed: e.revealed.map((r, k) => (k === i ? true : r)) };
      }
      return { ...e, answers: e.answers.map((a, k) => (k === i ? (a === idx ? null : idx) : a)) };
    });
  const onBlank = () => updateExam((e) => ({ ...e, revealed: e.revealed.map((r, k) => (k === e.current ? true : r)) }));
  const onGoto = (i) => updateExam((e) => ({ ...e, current: Math.max(0, Math.min(e.questions.length - 1, i)) }));
  const onAbandon = () => setStore((s) => ({ ...s, activeExam: null }));

  const onSettings = useCallback((patch) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } })), [setStore]);
  const onReview = () => {
    const s = storeRef.current;
    const pool = mistakePool(s.mistakes);
    if (!pool.length) return;
    startExam({ pool, count: pool.length, feedback: s.settings.feedback, secsPerQ: s.settings.secsPerQ, source: "mistakes", title: "Repaso de fallos" });
  };
  const onImport = async (file) => {
    const r = await importFile(file);
    if (r.ok) {
      setStore((s) => ({ ...s, settings: { ...s.settings, blocks: [], tema: "all" } }));
      notify({
        icon: <CheckCircle size={24} weight="fill" />,
        color: "#0c7866",
        kicker: "Temario importado",
        text: `${r.bank.preguntas.length} preguntas y ${r.bank.flashcards.length} tarjetas`,
      });
    } else {
      notify({ icon: <WarningCircle size={24} weight="fill" />, color: "#d71e1e", kicker: "No se pudo importar", text: r.error, duration: 6000 });
    }
  };
  const onCardsFinish = (results) => {
    if (!results.length) return;
    const { store: next, report } = applyCardsResult(storeRef.current, results, new Date());
    setStore(next);
    setCelebration({ queue: report.celebrations, report });
  };
  const onNewExam = () => {
    setStore((s) => ({ ...s, lastResult: null }));
    setTab("test");
  };
  const onReset = () => {
    finishedIds.current = new Set();
    setStore({ ...DEFAULT_STORE, installDismissed: storeRef.current.installDismissed });
    setTab("home");
    notify({ icon: <ArrowCounterClockwise size={24} weight="bold" />, color: "#191919", kicker: "Hecho", text: "Progreso reiniciado" });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <AppToaster />
      {!bank ? (
        <Login onLogin={login} />
      ) : (
      <>
      {celebration && <Celebrations queue={celebration.queue} report={celebration.report} store={store} onDone={() => setCelebration(null)} />}
      {exam ? (
        <ExamRunner exam={exam} remainingMs={remainingMs} onSelect={onSelect} onBlank={onBlank} onGoto={onGoto} onFinish={() => finishExam("submitted")} onAbandon={onAbandon} />
      ) : (
        <>
          <main ref={mainRef} className="absolute inset-0 scroll-area">
            <div key={tab} className="max-w-md mx-auto px-4 pt-safe pb-tabbar anim-rise">
              {tab === "home" && (
                <Home
                  store={store}
                  bank={bank}
                  install={install}
                  onDismissInstall={() => setStore((s) => ({ ...s, installDismissed: true }))}
                  onImport={onImport}
                  onGoTemario={() => setTab("temario")}
                  onReview={onReview}
                  onPlan={(patch) => setStore((s) => ({ ...s, plan: { ...s.plan, ...patch } }))}
                />
              )}
              {tab === "test" &&
                (store.lastResult ? (
                  <ExamResults
                    result={store.lastResult}
                    xp={store.xp}
                    pendingMistakes={Object.keys(store.mistakes).length}
                    onNew={onNewExam}
                    onHome={() => setTab("home")}
                    onReview={onReview}
                  />
                ) : (
                  <ExamSetup store={store} bank={bank} onSettings={onSettings} onStart={startExam} />
                ))}
              {tab === "cards" && <CardsScreen store={store} bank={bank} onImport={onImport} onFinish={onCardsFinish} />}
              {tab === "temario" && (
                <Temario
                  bank={bank}
                  onImport={onImport}
                  onBack={() => setTab("home")}
                  onLogout={() => {
                    logout();
                    setTab("home");
                  }}
                />
              )}
              {tab === "badges" && <Achievements store={store} onReset={onReset} />}
            </div>
          </main>
          <TabBar tab={tab} onChange={setTab} />
        </>
      )}
      </>
      )}
    </div>
  );
}
