/* Banco privado («Mi temario»): preguntas y tarjetas generadas del temario de la academia.
   El repositorio es público, así que viaja CIFRADO (public/banco.enc, AES-256-GCM). Con usuario y
   contraseña se descarga, se descifra en el móvil y se guarda en su propia clave de localStorage.
   También se puede importar a mano desde un archivo mi-banco.json. */
import { useCallback, useEffect, useMemo, useState } from "react";

const BANK_KEY = "recuento-banco.v1";
const ACCESS_KEY = "recuento-acceso.v1";
const EXTRA_KEY = "recuento-extra.v1"; // preguntas y tarjetas generadas en este móvil
const ITERATIONS = 310000; // mismo valor que temario-privado/cifrar-banco.mjs
const url = (f) => `${import.meta.env.BASE_URL}${f}`;

const readJSON = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k) || "null");
  } catch (e) {
    return null;
  }
};

/** Descifra banco.enc: "RCB1" | sal (16) | iv (12) | gzip cifrado con AES-GCM. Lanza si la clave no es correcta. */
export async function decryptFile(buffer, user, pass) {
  const bytes = new Uint8Array(buffer);
  if (new TextDecoder().decode(bytes.slice(0, 4)) !== "RCB1") throw new Error("formato");
  const salt = bytes.slice(4, 20);
  const iv = bytes.slice(20, 32);
  const secret = new TextEncoder().encode(`${user.trim().toLowerCase()}:${pass.trim()}`);
  const base = await crypto.subtle.importKey("raw", secret, "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bytes.slice(32));
  const text = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  return JSON.parse(text);
}

async function downloadBank(user, pass, version) {
  const res = await fetch(url(`banco.enc?v=${encodeURIComponent(version || Date.now())}`), { cache: "no-store" });
  if (!res.ok) throw new Error("red");
  return decryptFile(await res.arrayBuffer(), user, pass);
}

async function remoteVersion() {
  try {
    const res = await fetch(url(`banco-version.json?t=${Date.now()}`), { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch (e) {
    return null;
  }
}

const loadBank = () => readJSON(BANK_KEY);

/** Usuario y contraseña guardados al entrar (para descargar el texto del temario). */
export const getAccess = () => readJSON(ACCESS_KEY);

const emptyExtra = () => ({ preguntas: [], flashcards: [] });
const loadExtra = () => readJSON(EXTRA_KEY) || emptyExtra();

/** Comprueba que el archivo tiene el formato que genera temario-privado/generar-banco.mjs. */
export function validateBank(json) {
  if (!json || json.formato !== "recuento-banco") return "El archivo no es un banco de Recuento (mi-banco.json).";
  if (!Array.isArray(json.temas) || !Array.isArray(json.preguntas) || !Array.isArray(json.flashcards)) return "El banco está incompleto.";
  const badQ = json.preguntas.find((q) => !q.id || !q.q || q.options?.length !== 4 || !(q.answer >= 0 && q.answer <= 3));
  if (badQ) return `Hay una pregunta con formato incorrecto (${badQ.id || "sin id"}).`;
  return null;
}

export function useBank({ onUpdated } = {}) {
  const [base, setBank] = useState(loadBank);
  const [extra, setExtra] = useState(loadExtra);

  const save = (json) => {
    localStorage.setItem(BANK_KEY, JSON.stringify(json));
    setBank(json);
  };

  /** Inicia sesión: descarga y descifra el temario. Devuelve { ok, error }. */
  const login = useCallback(async (user, pass) => {
    try {
      const version = await remoteVersion();
      const json = await downloadBank(user, pass, version?.generado);
      const error = validateBank(json);
      if (error) return { ok: false, error };
      save(json);
      try {
        localStorage.setItem(ACCESS_KEY, JSON.stringify({ user: user.trim().toLowerCase(), pass: pass.trim() }));
      } catch (e) {
        /* sin almacenamiento: seguirá funcionando hasta cerrar la app */
      }
      return { ok: true, bank: json };
    } catch (e) {
      if (e.message === "red") return { ok: false, error: "No se pudo descargar el temario. Comprueba la conexión." };
      return { ok: false, error: "Usuario o contraseña incorrectos." };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(BANK_KEY);
      localStorage.removeItem(ACCESS_KEY);
    } catch (e) {
      /* nada que borrar */
    }
    setBank(null);
  }, []);

  // Al abrir la app: si hay una versión nueva publicada, se descarga sola con las credenciales guardadas.
  useEffect(() => {
    const access = readJSON(ACCESS_KEY);
    if (!access) return;
    let cancelled = false;
    (async () => {
      const version = await remoteVersion();
      const current = loadBank();
      if (!version || cancelled || (current && current.generado === version.generado)) return;
      try {
        const json = await downloadBank(access.user, access.pass, version.generado);
        if (cancelled || validateBank(json)) return;
        save(json);
        onUpdated?.(json);
      } catch (e) {
        /* sin conexión o credenciales cambiadas: se sigue con el temario guardado */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const importFile = useCallback(async (file) => {
    let json;
    try {
      json = JSON.parse(await file.text());
    } catch (e) {
      return { ok: false, error: "No se pudo leer el archivo. ¿Es el mi-banco.json que te pasaron?" };
    }
    const error = validateBank(json);
    if (error) return { ok: false, error };
    try {
      localStorage.setItem(BANK_KEY, JSON.stringify(json));
    } catch (e) {
      return { ok: false, error: "No hay espacio para guardar el banco en este navegador." };
    }
    setBank(json);
    return { ok: true, bank: json };
  }, []);

  /** Añade preguntas y tarjetas generadas en el móvil (se guardan aparte y sobreviven a las actualizaciones). */
  const addExtra = useCallback((items) => {
    setExtra((prev) => {
      const next = { preguntas: [...prev.preguntas, ...(items.preguntas || [])], flashcards: [...prev.flashcards, ...(items.flashcards || [])] };
      try {
        localStorage.setItem(EXTRA_KEY, JSON.stringify(next));
      } catch (e) {
        /* sin espacio: se quedan hasta cerrar la app */
      }
      return next;
    });
  }, []);

  // El banco que ve la app: el publicado más lo generado en este móvil.
  const bank = useMemo(
    () => (base ? { ...base, preguntas: [...base.preguntas, ...extra.preguntas], flashcards: [...base.flashcards, ...extra.flashcards] } : null),
    [base, extra]
  );

  return { bank, importFile, login, logout, addExtra, loggedIn: !!readJSON(ACCESS_KEY) };
}

export const temasOf = (bank, block) => (bank?.temas || []).filter((t) => block === "all" || t.bloque === block);

export function bankQuestions(bank, block = "all", tema = "all") {
  return (bank?.preguntas || []).filter((q) => (block === "all" || q.block === block) && (tema === "all" || q.tema === tema));
}

export function bankCards(bank, block = "all", tema = "all") {
  return (bank?.flashcards || []).filter((c) => (block === "all" || c.block === block) && (tema === "all" || c.tema === tema));
}

export const temaLabel = (bank, id) => {
  const t = bank?.temas.find((x) => x.id === id);
  return t ? `Tema ${t.numero} · ${t.titulo}` : "";
};
