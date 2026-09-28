/* Generar preguntas nuevas desde el móvil con Gemini.
   - El texto de cada tema viaja cifrado (public/textos.enc) y, ya descifrado, se guarda en IndexedDB
     (ocupa ~6 MB: no cabe en localStorage).
   - La clave de Gemini la escribe la usuaria y se queda solo en este móvil.
   - Mismas reglas que temario-privado/generar-banco.mjs: cada pregunta trae una cita literal del temario;
     si la cita no aparece en el texto, se descarta. */
import { decryptFile, getAccess } from "./bank.js";

const GEMINI_KEY = "recuento-gemini.v1";
const CURSOR_KEY = "recuento-generar-cursor.v1"; // qué parte de cada tema toca la próxima vez
const MODELS = ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"];
const CHUNK_WORDS = 6000;
const url = (f) => `${import.meta.env.BASE_URL}${f}`;

/* ---------- Clave de Gemini (solo en este móvil) ---------- */
export function getGeminiKey() {
  try {
    return localStorage.getItem(GEMINI_KEY) || "";
  } catch (e) {
    return "";
  }
}
export function setGeminiKey(k) {
  try {
    if (k) localStorage.setItem(GEMINI_KEY, k.trim());
    else localStorage.removeItem(GEMINI_KEY);
  } catch (e) {
    /* sin almacenamiento */
  }
}

/* ---------- IndexedDB mínimo ---------- */
function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("recuento", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const r = db.transaction("kv").objectStore("kv").get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idbSet(key, value) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
/** Al cerrar sesión se borra el texto del temario del móvil. */
export async function clearTextos() {
  try {
    const db = await idb();
    db.transaction("kv", "readwrite").objectStore("kv").delete("textos");
  } catch (e) {
    /* nada que borrar */
  }
}

/** Texto de los temas: de IndexedDB si está al día; si no, se descarga y descifra (una vez por versión). */
async function loadTextos(onStatus) {
  const version = await fetch(url(`banco-version.json?t=${Date.now()}`), { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const saved = await idbGet("textos").catch(() => null);
  if (saved && (!version || saved.generado === version.generado)) return saved;
  const access = getAccess();
  if (!access) throw new Error("Vuelve a iniciar sesión para descargar el temario.");
  onStatus?.("Descargando el temario (solo la primera vez)…");
  const res = await fetch(url(`textos.enc?v=${encodeURIComponent(version?.generado || Date.now())}`), { cache: "no-store" });
  if (!res.ok) {
    if (saved) return saved;
    throw new Error("No se pudo descargar el temario. Comprueba la conexión.");
  }
  const json = await decryptFile(await res.arrayBuffer(), access.user, access.pass);
  await idbSet("textos", json).catch(() => {});
  return json;
}

/* ---------- Reglas de calidad ---------- */
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();

function citaOk(cita, textNorm) {
  const w = norm(cita).split(" ").filter(Boolean);
  if (w.length < 4) return false;
  if (textNorm.includes(w.join(" "))) return true;
  for (let i = 0; i + 8 <= w.length; i++) if (textNorm.includes(w.slice(i, i + 8).join(" "))) return true;
  return false;
}

function chunks(text) {
  const out = [];
  let cur = [];
  let words = 0;
  for (const p of text.split("\n")) {
    const n = p.split(/\s+/).length;
    if (words + n > CHUNK_WORDS && cur.length) {
      out.push(cur.join("\n"));
      cur = [];
      words = 0;
    }
    cur.push(p);
    words += n;
  }
  if (cur.length) out.push(cur.join("\n"));
  return out;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    preguntas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          pregunta: { type: "STRING" },
          opciones: { type: "ARRAY", items: { type: "STRING" } },
          correcta: { type: "INTEGER" },
          explicacion: { type: "STRING" },
          cita: { type: "STRING" },
        },
        required: ["pregunta", "opciones", "correcta", "explicacion", "cita"],
      },
    },
    flashcards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { anverso: { type: "STRING" }, reverso: { type: "STRING" }, cita: { type: "STRING" } },
        required: ["anverso", "reverso", "cita"],
      },
    },
  },
  required: ["preguntas", "flashcards"],
};

const prompt = (asignatura, tema, text, evitar) => `Eres un preparador experto de la oposición al Cuerpo de Ayudantes de Instituciones Penitenciarias (España).
A partir EXCLUSIVAMENTE del fragmento del temario de abajo (${asignatura} · ${tema}), crea:

1) 15 preguntas tipo test del estilo del examen oficial:
- Cuatro opciones, una sola correcta. Las incorrectas deben ser plausibles: otros plazos, órganos, artículos o porcentajes que un opositor podría confundir, preferiblemente tomados del propio temario.
- Pregunta sobre datos que se evalúan: plazos, órganos competentes, artículos, requisitos, clasificaciones, excepciones, definiciones.
- Reparte las preguntas por TODO el fragmento. No repitas la misma idea.
- Evita "todas son correctas" o "ninguna es correcta" salvo que sea imprescindible.
- "correcta" es el índice (0 a 3) de la opción correcta. Varía la posición de la correcta.
- "explicacion": una o dos frases que justifiquen la respuesta, citando el artículo o la norma si el temario lo menciona.

2) 8 flashcards para memorizar: anverso breve (un concepto, plazo, órgano o definición preguntado de forma directa) y reverso con la respuesta concisa (máximo 2 frases).

En ambas, "cita" debe ser un fragmento COPIADO LITERALMENTE del temario (entre 10 y 40 palabras, sin cambiar ni una palabra) que contenga la respuesta.
No inventes nada que no esté en el texto. Escribe en español de España.
${evitar.length ? `\nNO repitas estas preguntas, que la opositora ya tiene:\n${evitar.map((q) => `- ${q}`).join("\n")}\n` : ""}
TEMARIO:
"""
${text}
"""`;

/** Llama a Gemini probando modelos; con la API saturada se queda con el primero que conteste. */
let lastGood = null;
async function callGemini(key, body, onStatus) {
  const tried = new Set();
  for (let attempt = 1; attempt <= 10; attempt++) {
    const order = lastGood ? [lastGood, ...MODELS.filter((m) => m !== lastGood)] : MODELS;
    const model = order[(attempt - 1) % order.length];
    let res;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(150000),
      });
    } catch (e) {
      if (!navigator.onLine) throw new Error("Sin conexión a internet.");
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      const txt = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      try {
        const data = JSON.parse(txt);
        lastGood = model;
        return data;
      } catch (e) {
        continue;
      }
    }
    const msg = json.error?.message || "";
    if (res.status === 400 && /api key/i.test(msg)) throw new Error("La clave de Gemini no es válida. Revísala.");
    if (res.status === 403) throw new Error("La clave de Gemini no tiene permiso. Revísala en Google AI Studio.");
    tried.add(model);
    if (tried.size >= MODELS.length && attempt >= MODELS.length) break;
    onStatus?.("Gemini está ocupado, probando otro modelo…");
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Gemini está saturado ahora mismo. Inténtalo en unos minutos.");
}

/**
 * Genera preguntas y tarjetas nuevas de un tema. Cada vez usa la siguiente parte del tema,
 * así varias tandas seguidas recorren el tema entero. Devuelve { preguntas, flashcards, descartadas }.
 */
export async function generateForTema({ bank, temaId, onStatus }) {
  const key = getGeminiKey();
  if (!key) throw new Error("Falta la clave de Gemini.");
  const textos = await loadTextos(onStatus);
  const t = textos.temas?.[temaId];
  if (!t) throw new Error("Este tema aún no tiene texto disponible.");

  const parts = chunks(t.text);
  let cursor = {};
  try {
    cursor = JSON.parse(localStorage.getItem(CURSOR_KEY) || "{}");
  } catch (e) {
    cursor = {};
  }
  const idx = (cursor[temaId] || 0) % parts.length;
  const part = parts[idx];
  const textNorm = norm(t.text);

  const existing = (bank?.preguntas || []).filter((q) => q.tema === temaId);
  const seen = new Set(existing.map((q) => norm(q.q)));
  const seenCards = new Set((bank?.flashcards || []).filter((c) => c.tema === temaId).map((c) => norm(c.front)));

  onStatus?.(`Gemini está escribiendo preguntas (parte ${idx + 1} de ${parts.length} del tema)…`);
  const data = await callGemini(
    key,
    {
      contents: [{ parts: [{ text: prompt(t.asignatura, t.tema, part, existing.slice(-40).map((q) => q.q)) }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.6 },
    },
    onStatus
  );

  const block = temaId.replace(/-\d+$/, "");
  const stamp = Date.now().toString(36);
  let descartadas = 0;
  const preguntas = [];
  for (const q of data.preguntas || []) {
    const opts = (q.opciones || []).map((o) => String(o).trim());
    const ok = opts.length === 4 && new Set(opts.map(norm)).size === 4 && q.correcta >= 0 && q.correcta <= 3 && citaOk(q.cita, textNorm) && !seen.has(norm(q.pregunta));
    if (!ok) {
      descartadas++;
      continue;
    }
    seen.add(norm(q.pregunta));
    preguntas.push({ id: `${temaId}-x${stamp}-q${preguntas.length + 1}`, block, tema: temaId, q: q.pregunta.trim(), options: opts, answer: q.correcta, exp: String(q.explicacion || "").trim(), cita: q.cita.trim(), generada: true });
  }
  const flashcards = [];
  for (const f of data.flashcards || []) {
    if (!citaOk(f.cita, textNorm) || seenCards.has(norm(f.anverso))) {
      descartadas++;
      continue;
    }
    seenCards.add(norm(f.anverso));
    flashcards.push({ id: `${temaId}-x${stamp}-f${flashcards.length + 1}`, block, tema: temaId, front: f.anverso.trim(), back: f.reverso.trim(), cita: f.cita.trim(), generada: true });
  }

  cursor[temaId] = idx + 1;
  try {
    localStorage.setItem(CURSOR_KEY, JSON.stringify(cursor));
  } catch (e) {
    /* sin almacenamiento */
  }
  return { preguntas, flashcards, descartadas };
}
