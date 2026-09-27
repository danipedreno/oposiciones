/* Banco privado («Mi temario»): preguntas y tarjetas generadas del temario de la academia.
   No viaja en el código de la app (el repositorio es público): se importa desde un archivo
   mi-banco.json y se guarda solo en el móvil, en su propia clave de localStorage. */
import { useCallback, useState } from "react";

const BANK_KEY = "recuento-banco.v1";

function loadBank() {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/** Comprueba que el archivo tiene el formato que genera temario-privado/generar-banco.mjs. */
export function validateBank(json) {
  if (!json || json.formato !== "recuento-banco") return "El archivo no es un banco de Recuento (mi-banco.json).";
  if (!Array.isArray(json.temas) || !Array.isArray(json.preguntas) || !Array.isArray(json.flashcards)) return "El banco está incompleto.";
  const badQ = json.preguntas.find((q) => !q.id || !q.q || q.options?.length !== 4 || !(q.answer >= 0 && q.answer <= 3));
  if (badQ) return `Hay una pregunta con formato incorrecto (${badQ.id || "sin id"}).`;
  return null;
}

export function useBank() {
  const [bank, setBank] = useState(loadBank);

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

  return { bank, importFile };
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
