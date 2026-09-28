import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Cards, CheckCircle, ClipboardText, House, Trophy, WarningCircle } from "@phosphor-icons/react";
import { applyCardsResult, applyExamResult, createExam, mistakePool } from "./lib/logic.js";
import { useBank } from "./lib/bank.js";
import { clearTextos } from "./lib/generar.js";
import CardsScreen from "./screens/Cards.jsx";
import { DEFAULT_STORE, useInstallPrompt, useNow, usePersistentStore } from "./lib/store.js";
import { AppToaster, notify } from "./ui.jsx";
import Splash, { shouldShowSplash } from "./screens/Splash.jsx";
import { PAL } from "./lib/palette.js";
import Home from "./screens/Home.jsx";
import Celebrations from "./screens/Celebration.jsx";
import Temario from "./screens/Temario.jsx";
import Login from "./screens/Login.jsx";
import Achievements from "./screens/Achievements.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import { SEED_QUESTIONS } from "./data/questions.js";
import { setSoundEnabled } from "./lib/sound.js";
import { ExamResults, ExamRunner, ExamSetup } from "./screens/Exam.jsx";

const TABS = [
  { id: "home", label: "Inicio", Icon: House, color: PAL.sun },
  { id: "test", label: "Test", Icon: ClipboardText, color: PAL.sky },
  { id: "cards", label: "Tarjetas", Icon: Cards, color: PAL.peach },
  { id: "badges", label: "Logros", Icon: Trophy, color: PAL.lilac },
];

/**
 * Barra de pestañas. La pestaña activa es una capa de color recortada con clip-path que se desliza
 * de una pestaña a otra: el pastel de cada sección cambia exactamente en el borde.
 */
function TabBar({ tab, onChange }) {
  const index = TABS.findIndex((t) => t.id === tab);
  const n = TABS.length;
  return (
    <nav className="fixed left-4 right-4 tabbar-pos z-40" aria-label="Navegación principal">
      <div className="relative max-w-md mx-auto rounded-full bg-card p-1.5 shadow-[0_0_0_1px_#ebdfc3,0_18px_40px_-16px_rgba(33,38,51,0.45)]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={tab === id ? "page" : undefined}
              className="tap press h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-ink-soft hover:text-ink"
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div
          aria-hidden="true"
          hidden={index < 0}
          className="absolute inset-1.5 grid gap-1 pointer-events-none transition-[clip-path] duration-[250ms] ease-in-out"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, clipPath: `inset(0 ${((n - 1 - index) / n) * 100}% 0 ${(index / n) * 100}% round 999px)` }}
        >
          {TABS.map(({ id, label, Icon, color }) => (
            <div key={id} className="h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-ink" style={{ background: color }}>
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
  const { bank, importFile, login, logout, addExtra } = useBank({
    onUpdated: (b) =>
      notify({
        icon: <CheckCircle size={24} weight="fill" />,
        color: PAL.mint,
        kicker: "Temario actualizado",
        text: `${b.temas.length} temas · ${b.preguntas.length} preguntas`,
      }),
  });
  const [celebration, setCelebration] = useState(null); // { queue, report }
  const [splash, setSplash] = useState(shouldShowSplash);
  const endSplash = useCallback(() => setSplash(false), []);
  const storeRef = useRef(store);
  const finishedIds = useRef(new Set());
  const mainRef = useRef(null);
  storeRef.current = store;

  useEffect(() => {
    setSoundEnabled(store.settings.sound);
  }, [store.settings.sound]);

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
  // Test rápido de un toque: 10 preguntas al azar de todo el temario, con corrección al momento.
  const onQuickTest = () => {
    const s = storeRef.current;
    startExam({ pool: bank ? bank.preguntas : SEED_QUESTIONS, count: 10, feedback: "immediate", secsPerQ: s.settings.secsPerQ, source: bank ? "temario" : "bank", title: "Test rápido" });
  };
  const onToggleSound = () => setStore((s) => ({ ...s, settings: { ...s.settings, sound: !s.settings.sound } }));

  const onImport = async (file) => {
    const r = await importFile(file);
    if (r.ok) {
      setStore((s) => ({ ...s, settings: { ...s.settings, blocks: [], tema: "all" } }));
      notify({
        icon: <CheckCircle size={24} weight="fill" />,
        color: PAL.mint,
        kicker: "Temario importado",
        text: `${r.bank.preguntas.length} preguntas y ${r.bank.flashcards.length} tarjetas`,
      });
    } else {
      notify({ icon: <WarningCircle size={24} weight="fill" />, color: PAL.peach, kicker: "No se pudo importar", text: r.error, duration: 6000 });
    }
  };
  const onCardsFinish = (results, live) => {
    if (!results.length) return;
    const { store: next, report } = applyCardsResult(storeRef.current, results, new Date(), live);
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
    notify({ icon: <ArrowCounterClockwise size={24} weight="bold" />, color: PAL.sun, kicker: "Hecho", text: "Progreso reiniciado" });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-ground">
      <AppToaster />
      {splash && <Splash onDone={endSplash} />}
      {!bank ? (
        <Login onLogin={login} />
      ) : (
      <>
      {!store.onboarded && store.totals.answered === 0 && <Onboarding onDone={() => setStore((s) => ({ ...s, onboarded: true }))} />}
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
                  onQuickTest={onQuickTest}
                  onToggleSound={onToggleSound}
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
                  <ExamSetup store={store} bank={bank} onSettings={onSettings} onStart={startExam} onAddExtra={addExtra} />
                ))}
              {tab === "cards" && <CardsScreen store={store} bank={bank} onImport={onImport} onFinish={onCardsFinish} />}
              {tab === "temario" && (
                <Temario
                  bank={bank}
                  onImport={onImport}
                  onAddExtra={addExtra}
                  onBack={() => setTab("home")}
                  onLogout={() => {
                    logout();
                    clearTextos();
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
