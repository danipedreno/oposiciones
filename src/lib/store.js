import { useEffect, useState } from "react";
import { OFFICIAL_SECONDS_PER_QUESTION, STORAGE_KEY } from "./logic.js";

export const DEFAULT_STORE = {
  version: 1,
  xp: 0,
  streak: { count: 0, last: null, best: 0, days: [] },
  achievements: {},
  history: [],
  blockStats: {},
  totals: { tests: 0, answered: 0, correct: 0 },
  settings: { feedback: "immediate", count: 20, secsPerQ: OFFICIAL_SECONDS_PER_QUESTION, block: "all", source: "bank" },
  customTest: null,
  mistakes: {},
  notesDraft: { text: "", block: "penitenciario" },
  activeExam: null,
  lastResult: null,
  installDismissed: false,
};

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    const s = JSON.parse(raw);
    return {
      ...DEFAULT_STORE,
      ...s,
      streak: { ...DEFAULT_STORE.streak, ...s.streak },
      totals: { ...DEFAULT_STORE.totals, ...s.totals },
      settings: { ...DEFAULT_STORE.settings, ...s.settings },
      notesDraft: { ...DEFAULT_STORE.notesDraft, ...s.notesDraft },
    };
  } catch (e) {
    return DEFAULT_STORE;
  }
}

/** Todo el progreso vive en un único objeto en localStorage. */
export function usePersistentStore() {
  const [store, setStore] = useState(loadStore);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      /* almacenamiento no disponible (modo privado): la app sigue en memoria */
    }
  }, [store]);
  return [store, setStore];
}

/** Reloj basado en timestamps: sigue siendo exacto aunque el móvil congele la pestaña. */
export function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [active]);
  return now;
}

/** Captura el aviso de instalación de Chrome en Android para ofrecer un botón propio. */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches
  );
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const install = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    setPromptEvent(null);
  };
  return { canInstall: !!promptEvent && !installed, installed, install };
}
