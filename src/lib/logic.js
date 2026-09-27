import { SEED_QUESTIONS } from "../data/questions.js";

/* ---------------------------------------------------------------------
   CONFIGURACIÓN
   --------------------------------------------------------------------- */
export const STORAGE_KEY = "recuento-iipp.v1";
export const XP_PER_CORRECT = 10;
// 1er ejercicio: 150 preguntas en 135 minutos → 54 s por pregunta.
// Verifica el dato en la convocatoria vigente (BOE) y ajústalo aquí.
export const OFFICIAL_SECONDS_PER_QUESTION = 54;
export const NIGHT_START_HOUR = 23;
export const NIGHT_END_HOUR = 6;

/* Cada bloque es una carpeta de color (paleta Mosby). Clases completas para que Tailwind las detecte. */
export const BLOCKS = {
  penitenciario: {
    id: "penitenciario",
    label: "Derecho Penitenciario",
    short: "Penitenciario",
    hex: "#1e4bd7",
    bg: "bg-folder-blue",
    text: "text-folder-blue",
    illustration: "bloque-penitenciario",
  },
  penal: {
    id: "penal",
    label: "Derecho Penal",
    short: "Penal",
    hex: "#d71e1e",
    bg: "bg-folder-red",
    text: "text-folder-red",
    illustration: "bloque-penal",
  },
  funcion: {
    id: "funcion",
    label: "Función Pública",
    short: "Función Pública",
    hex: "#0c7866",
    bg: "bg-folder-green",
    text: "text-folder-green",
    illustration: "bloque-funcion-publica",
  },
};
export const BLOCK_IDS = Object.keys(BLOCKS);

export const RANKS = [
  { level: 1, name: "Opositor Novato", min: 0, illustration: "rango-1-novato" },
  { level: 2, name: "Funcionario en Prácticas", min: 150, illustration: "rango-2-practicas" },
  { level: 3, name: "Jefe de Servicio", min: 400, illustration: "rango-3-jefe-servicio" },
  { level: 4, name: "Jefe de Centro", min: 800, illustration: "rango-4-jefe-centro" },
  { level: 5, name: "Director de Centro", min: 1500, illustration: "rango-5-director" },
];

export const ACHIEVEMENTS = [
  { id: "primer-turno", name: "Primer Turno", desc: "Completa tu primer test.", icon: "key", illustration: "medalla-primer-turno" },
  { id: "celda-castigo", name: "Celda de Castigo", desc: "Comete 3 fallos seguidos en un test.", icon: "cell", illustration: "medalla-celda-castigo" },
  { id: "imbatible", name: "Imbatible", desc: "Test de más de 10 preguntas sin fallos ni blancos.", icon: "shield", illustration: "medalla-imbatible" },
  { id: "nocturno", name: "Estudioso Nocturno", desc: "Termina un test entre las 23:00 y las 6:00.", icon: "moon", illustration: "medalla-estudioso-nocturno" },
];

/* ---------------------------------------------------------------------
   LÓGICA PURA
   --------------------------------------------------------------------- */
export const pad2 = (n) => String(n).padStart(2, "0");
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const keyToUTC = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const daysBetween = (a, b) => Math.round((keyToUTC(b) - keyToUTC(a)) / 86400000);
export const uniq = (arr) => Array.from(new Set(arr));
export const fmt2 = (x) => x.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const uid = () => Math.random().toString(36).slice(2, 10);

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

export function formatMinutes(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}

/** Estado visible de la racha: se rompe si pasa más de un día sin estudiar. */
export function streakView(streak, today = dateKey()) {
  if (!streak.last) return { count: 0, state: "none" };
  const diff = daysBetween(streak.last, today);
  if (diff <= 0) return { count: streak.count, state: "done" };
  if (diff === 1) return { count: streak.count, state: "pending" };
  return { count: 0, state: "broken" };
}

export function bumpStreak(streak, today) {
  const diff = streak.last ? daysBetween(streak.last, today) : null;
  const count = diff === 0 ? streak.count : diff === 1 ? streak.count + 1 : 1;
  return {
    count,
    last: today,
    best: Math.max(streak.best || 0, count),
    days: uniq([...(streak.days || []), today]).slice(-60),
  };
}

export function rankInfo(xp) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.min) idx = i;
  });
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] || null;
  const pct = next ? ((xp - rank.min) / (next.min - rank.min)) * 100 : 100;
  return { rank, next, pct: Math.min(100, Math.max(0, pct)), toNext: next ? next.min - xp : 0 };
}

/** Baraja las 4 alternativas y recalcula el índice correcto. */
export function prepareQuestion(q) {
  const order = shuffle([0, 1, 2, 3]);
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

export function createExam({ pool, count, feedback, secsPerQ, source, title }) {
  const questions = shuffle(pool).slice(0, Math.min(count, pool.length)).map(prepareQuestion);
  const now = Date.now();
  return {
    id: uid(),
    title,
    source,
    feedback, // "immediate" | "final"
    secsPerQ,
    startedAt: now,
    endsAt: now + questions.length * secsPerQ * 1000,
    questions,
    answers: questions.map(() => null),
    revealed: questions.map(() => false),
    current: 0,
  };
}

/** Corrección oficial IIPP: Nota = Aciertos − Errores / 3. Los blancos no puntúan. */
export function gradeExam(exam) {
  let correct = 0, wrong = 0, blank = 0, run = 0, maxWrongRun = 0;
  exam.questions.forEach((q, i) => {
    const a = exam.answers[i];
    if (a === null) {
      blank++;
      run = 0;
    } else if (a === q.answer) {
      correct++;
      run = 0;
    } else {
      wrong++;
      run++;
      maxWrongRun = Math.max(maxWrongRun, run);
    }
  });
  const n = exam.questions.length;
  const net = correct - wrong / 3;
  const over10 = n ? (Math.max(0, net) / n) * 10 : 0;
  return { n, correct, wrong, blank, net, over10, maxWrongRun };
}

/** Aplica el resultado de un examen al progreso guardado. Devuelve el nuevo estado y un informe. */
export function applyExamResult(store, exam, reason, date) {
  const grade = gradeExam(exam);
  const today = dateKey(date);
  const xpGained = grade.correct * XP_PER_CORRECT;
  const rankBefore = rankInfo(store.xp).rank;
  const xp = store.xp + xpGained;
  const rankAfter = rankInfo(xp).rank;

  const blockStats = { ...store.blockStats };
  exam.questions.forEach((q, i) => {
    const prev = blockStats[q.block] || { c: 0, t: 0 };
    blockStats[q.block] = { c: prev.c + (exam.answers[i] === q.answer ? 1 : 0), t: prev.t + 1 };
  });

  const earned = [];
  const unlock = (id, cond) => {
    if (cond && !store.achievements[id]) earned.push(id);
  };
  const hour = date.getHours();
  unlock("primer-turno", true);
  unlock("celda-castigo", grade.maxWrongRun >= 3);
  unlock("imbatible", grade.n > 10 && grade.wrong === 0 && grade.blank === 0);
  unlock("nocturno", hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR);

  const achievements = { ...store.achievements };
  earned.forEach((id) => (achievements[id] = date.toISOString()));

  const report = {
    exam,
    grade,
    xpGained,
    rankBefore,
    rankAfter,
    earned,
    reason,
    finishedAt: date.toISOString(),
  };

  return {
    report,
    store: {
      ...store,
      xp,
      blockStats,
      achievements,
      streak: bumpStreak(store.streak, today),
      totals: {
        tests: store.totals.tests + 1,
        answered: store.totals.answered + grade.correct + grade.wrong,
        correct: store.totals.correct + grade.correct,
      },
      history: [
        {
          id: exam.id,
          date: date.toISOString(),
          title: exam.title,
          n: grade.n,
          correct: grade.correct,
          wrong: grade.wrong,
          blank: grade.blank,
          net: grade.net,
          over10: grade.over10,
        },
        ...store.history,
      ].slice(0, 30),
      activeExam: null,
      lastResult: report,
    },
  };
}

/* --- Generador de preguntas desde apuntes (simula la IA) ---
   Punto de integración real: sustituir analyzeNotes() por una llamada a un
   LLM con el texto extraído (en PasaElTest, lectura local de PDF + IA). */
export const STOPWORDS = new Set(
  "para como sobre entre desde hasta según cuando donde también será serán podrá podrán tendrá deberá dicha dicho estas estos este esta cada todos todas otros otras mismo misma ellos ellas tiene tienen puede pueden través además solo sólo debe deben durante mediante contra aquellos aquellas corresponde conforme carácter general".split(" ")
);

export const TERM_FAMILIES = [
  ["régimen cerrado", "régimen ordinario", "régimen abierto", "régimen preventivo"],
  ["Juez de Vigilancia Penitenciaria", "Junta de Tratamiento", "Centro Directivo", "Comisión Disciplinaria"],
  ["la cuarta parte", "la mitad", "las dos terceras partes", "las tres cuartas partes"],
  ["funcionarios de carrera", "funcionarios interinos", "personal laboral", "personal eventual"],
  ["recurso de alzada", "recurso potestativo de reposición", "recurso extraordinario de revisión", "recurso contencioso-administrativo"],
];
export const LEGAL_RE = /\b(Ley Orgánica|Real Decreto Legislativo|Real Decreto|Ley)\s+(\d{1,4})\/(\d{4})/;
export const NUM_RE = /\b(\d{1,3})\s+(días|meses|años|horas|minutos|semanas)\b/i;
export const WORD_NUM_RE = /\b(dos|tres|cuatro|cinco|seis|siete|diez|catorce|quince|veinte|treinta)\s+(días|meses|años|horas|minutos|semanas)\b/i;
export const ART_RE = /\bartículo\s+(\d{1,3})\b/i;
export const WORD_NUMS = ["dos", "tres", "cuatro", "cinco", "seis", "siete", "diez", "catorce", "quince", "veinte", "treinta"];
export const SINGULAR = { días: "día", meses: "mes", años: "año", horas: "hora", minutos: "minuto", semanas: "semana" };

export function clozeAt(sentence, index, found, distractors) {
  const d = uniq(distractors).filter((x) => x.toLowerCase() !== found.toLowerCase());
  if (d.length < 3) return null;
  return {
    stem: `${sentence.slice(0, index)}______${sentence.slice(index + found.length)}`,
    correct: found,
    distractors: shuffle(d).slice(0, 3),
  };
}

export function clozeFrom(sentence) {
  const lower = sentence.toLowerCase();
  for (const fam of TERM_FAMILIES) {
    const hits = fam.filter((t) => lower.includes(t.toLowerCase()));
    if (hits.length > 1) return null; // varias respuestas válidas: se descarta
    if (hits.length === 1) {
      const idx = lower.indexOf(hits[0].toLowerCase());
      const found = sentence.slice(idx, idx + hits[0].length);
      return clozeAt(sentence, idx, found, fam.filter((x) => x !== hits[0]));
    }
  }
  let m = sentence.match(LEGAL_RE);
  if (m) {
    const [full, type, num, year] = m;
    const n = Number(num), y = Number(year);
    return clozeAt(sentence, m.index, full, [
      `${type} ${n + 1}/${y}`,
      `${type} ${n}/${y + 2}`,
      `${type} ${Math.max(1, n * 2 + 3)}/${y - 3}`,
    ]);
  }
  m = sentence.match(NUM_RE);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const cands = uniq([n * 2, n + 7, Math.max(1, Math.round(n / 2)), n + 1, n * 3]).filter((x) => x > 0 && x !== n);
    return clozeAt(sentence, m.index, m[0], cands.map((x) => `${x} ${x === 1 ? SINGULAR[unit] : unit}`));
  }
  m = sentence.match(WORD_NUM_RE);
  if (m) {
    const unit = m[2].toLowerCase();
    return clozeAt(sentence, m.index, m[0], WORD_NUMS.filter((w) => w !== m[1].toLowerCase()).map((w) => `${w} ${unit}`));
  }
  m = sentence.match(ART_RE);
  if (m) {
    const n = Number(m[1]);
    return clozeAt(sentence, m.index, m[0], [n + 1, n + 10, Math.max(1, n - 3), n * 2].map((x) => `artículo ${x}`));
  }
  return null;
}

export function extractKeywords(text, max = 8) {
  const counts = {};
  (text.toLowerCase().match(/[a-záéíóúñü]{7,}/g) || []).forEach((w) => {
    if (!STOPWORDS.has(w)) counts[w] = (counts[w] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

export function analyzeNotes(text, block, target = 15) {
  const clean = text.replace(/\bart\.\s/gi, "artículo ").replace(/\s+/g, " ").trim();
  const sentences = (clean.match(/[^.;]+[.;]?/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 280);

  const stamp = Date.now();
  const cloze = [];
  const seen = new Set();
  for (const s of sentences) {
    if (cloze.length >= 8) break;
    const c = clozeFrom(s);
    if (!c || seen.has(c.stem)) continue;
    seen.add(c.stem);
    cloze.push({
      id: `nota-${stamp}-${cloze.length}`,
      block,
      q: `Completa según tus apuntes: «${c.stem}»`,
      options: [c.correct, ...c.distractors],
      answer: 0,
      exp: `Frase original de tus apuntes: «${s}»`,
      origin: "notes",
    });
  }

  const lower = clean.toLowerCase();
  const scored = SEED_QUESTIONS.filter((q) => q.block === block)
    .map((q) => ({ q, score: q.tags.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score);
  const matched = scored.filter((x) => x.score > 0).map((x) => x.q);
  const rest = shuffle(scored.filter((x) => x.score === 0).map((x) => x.q));
  const fromBank = [...matched, ...rest].slice(0, Math.max(5, target - cloze.length));

  return {
    keywords: extractKeywords(clean),
    questions: [...cloze, ...fromBank],
    stats: { cloze: cloze.length, matched: Math.min(matched.length, fromBank.length), bank: fromBank.length },
  };
}

