import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, CaretDoubleUp, ClipboardText, FileText, House, Key, Moon, ShieldCheck, Trophy, GridFour } from "@phosphor-icons/react";
import { ACHIEVEMENTS, applyExamResult, createExam, uid } from "./lib/logic.js";
import { DEFAULT_STORE, useInstallPrompt, useNow, usePersistentStore } from "./lib/store.js";
import { Toasts } from "./ui.jsx";
import Home from "./screens/Home.jsx";
import Notes from "./screens/Notes.jsx";
import Achievements from "./screens/Achievements.jsx";
import { ExamResults, ExamRunner, ExamSetup } from "./screens/Exam.jsx";

const TABS = [
  { id: "home", label: "Inicio", Icon: House, color: "#ffe927", dark: false },
  { id: "test", label: "Test", Icon: ClipboardText, color: "#1e4bd7", dark: true },
  { id: "notes", label: "Apuntes", Icon: FileText, color: "#0c7866", dark: true },
  { id: "badges", label: "Logros", Icon: Trophy, color: "#581e70", dark: true },
];

const ACHIEVEMENT_ICONS = { key: Key, cell: GridFour, shield: ShieldCheck, moon: Moon };

function TabBar({ tab, onChange }) {
  return (
    <nav className="fixed left-4 right-4 tabbar-pos z-40" aria-label="Navegación principal">
      <div className="max-w-md mx-auto rounded-folder bg-ink-2/95 backdrop-blur-md border border-ink-3 p-1.5 grid grid-cols-4 gap-1 shadow-2xl shadow-black/70">
        {TABS.map(({ id, label, Icon, color, dark }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              className={`tap press h-14 rounded-[4px] flex flex-col items-center justify-center gap-0.5 ${active ? (dark ? "text-paper" : "text-ink") : "text-mute hover:text-paper"}`}
              style={active ? { background: color } : undefined}
            >
              <Icon size={24} weight={active ? "fill" : "regular"} />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [store, setStore] = usePersistentStore();
  const [tab, setTab] = useState(() => (store.activeExam || store.lastResult ? "test" : "home"));
  const [toasts, setToasts] = useState([]);
  const install = useInstallPrompt();
  const storeRef = useRef(store);
  const finishedIds = useRef(new Set());
  const mainRef = useRef(null);
  storeRef.current = store;

  const exam = store.activeExam;
  const now = useNow(!!exam);
  const remainingMs = exam ? Math.max(0, exam.endsAt - now) : 0;

  const pushToast = useCallback((t) => {
    const id = uid();
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800);
  }, []);

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
      if (report.rankAfter.level > report.rankBefore.level) {
        pushToast({ icon: <CaretDoubleUp size={24} weight="bold" />, color: "#581e70", kicker: "Ascenso", text: `Ahora eres ${report.rankAfter.name}` });
      }
      report.earned.forEach((id, k) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        const Icon = ACHIEVEMENT_ICONS[a.icon];
        setTimeout(() => pushToast({ icon: <Icon size={24} weight="fill" />, color: "#0c7866", kicker: "Medalla desbloqueada", text: a.name }), 400 + k * 500);
      });
    },
    [setStore, pushToast]
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
  const onSaveDraft = useCallback((draft) => setStore((s) => ({ ...s, notesDraft: draft })), [setStore]);
  const onSaveCustom = useCallback((custom) => setStore((s) => ({ ...s, customTest: custom, settings: { ...s.settings, source: "notes" } })), [setStore]);
  const onStartCustom = () => {
    const s = storeRef.current;
    if (!s.customTest) return;
    startExam({
      pool: s.customTest.questions,
      count: s.customTest.questions.length,
      feedback: s.settings.feedback,
      secsPerQ: s.settings.secsPerQ,
      source: "notes",
      title: s.customTest.title,
    });
  };
  const onNewExam = () => {
    setStore((s) => ({ ...s, lastResult: null }));
    setTab("test");
  };
  const onReset = () => {
    finishedIds.current = new Set();
    setStore({ ...DEFAULT_STORE, installDismissed: storeRef.current.installDismissed });
    setTab("home");
    pushToast({ icon: <ArrowCounterClockwise size={24} weight="bold" />, color: "#191919", kicker: "Hecho", text: "Progreso reiniciado" });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <Toasts toasts={toasts} />
      {exam ? (
        <ExamRunner exam={exam} remainingMs={remainingMs} onSelect={onSelect} onBlank={onBlank} onGoto={onGoto} onFinish={() => finishExam("submitted")} onAbandon={onAbandon} />
      ) : (
        <>
          <main ref={mainRef} className="absolute inset-0 scroll-area">
            <div key={tab} className="max-w-md mx-auto px-4 pt-safe pb-tabbar anim-rise">
              {tab === "home" && (
                <Home
                  store={store}
                  install={install}
                  onDismissInstall={() => setStore((s) => ({ ...s, installDismissed: true }))}
                  onNewExam={onNewExam}
                  onGoNotes={() => setTab("notes")}
                />
              )}
              {tab === "test" &&
                (store.lastResult ? (
                  <ExamResults result={store.lastResult} xp={store.xp} onNew={onNewExam} onHome={() => setTab("home")} />
                ) : (
                  <ExamSetup store={store} onSettings={onSettings} onStart={startExam} />
                ))}
              {tab === "notes" && <Notes store={store} onSaveDraft={onSaveDraft} onSaveCustom={onSaveCustom} onStartCustom={onStartCustom} />}
              {tab === "badges" && <Achievements store={store} onReset={onReset} />}
            </div>
          </main>
          <TabBar tab={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}
