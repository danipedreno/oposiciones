import { useState } from "react";
import { Key, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { BLOCKS, BLOCK_IDS } from "../lib/logic.js";
import { temasOf } from "../lib/bank.js";
import { generateForTema, getGeminiKey, setGeminiKey } from "../lib/generar.js";
import { Button, Illustration, Picker } from "../ui.jsx";

/**
 * «Generar preguntas nuevas»: pide a Gemini una tanda de preguntas y tarjetas de un tema.
 * Con `temaId` fijo (desde Crea tu test) no muestra selector; sin él, deja elegir cualquier tema.
 */
export default function GeneratePanel({ bank, temaId: fixedTema, onAdd, compact = false }) {
  const [key, setKey] = useState(getGeminiKey);
  const [draftKey, setDraftKey] = useState("");
  const [editingKey, setEditingKey] = useState(false);
  const [tema, setTema] = useState(fixedTema || bank?.temas?.[0]?.id || "");
  const [status, setStatus] = useState(null); // { kind: "busy" | "ok" | "error", text }
  const temaId = fixedTema || tema;
  const busy = status?.kind === "busy";

  const saveKey = () => {
    setGeminiKey(draftKey);
    setKey(draftKey.trim());
    setDraftKey("");
    setEditingKey(false);
    setStatus(null);
  };

  const generate = async () => {
    setStatus({ kind: "busy", text: "Preparando…" });
    try {
      const r = await generateForTema({ bank, temaId, onStatus: (text) => setStatus({ kind: "busy", text }) });
      if (!r.preguntas.length && !r.flashcards.length) {
        setStatus({ kind: "error", text: "Esta vez no salió ninguna válida. Vuelve a intentarlo: usará otra parte del tema." });
        return;
      }
      onAdd({ preguntas: r.preguntas, flashcards: r.flashcards });
      setStatus({
        kind: "ok",
        text: `Añadidas ${r.preguntas.length} preguntas y ${r.flashcards.length} tarjetas nuevas.${r.descartadas ? ` (${r.descartadas} descartadas por no citar bien el temario)` : ""}`,
      });
    } catch (e) {
      setStatus({ kind: "error", text: e.message || "No se pudo generar." });
    }
  };

  const temaOptions = BLOCK_IDS.flatMap((b) =>
    temasOf(bank, b).map((t) => ({ value: t.id, label: `${BLOCKS[b].short} · Tema ${t.numero} · ${t.titulo}`, color: BLOCKS[b].hex }))
  );

  const keyForm = (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-snug">
        Para generar preguntas hace falta una clave gratuita de Gemini. Se guarda solo en este móvil. Créala en{" "}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
          aistudio.google.com/apikey
        </a>{" "}
        y pégala aquí.
      </p>
      <label htmlFor="gemini-key" className="sr-only">
        Clave de Gemini
      </label>
      <input
        id="gemini-key"
        type="password"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Clave de Gemini"
        value={draftKey}
        onChange={(e) => setDraftKey(e.target.value)}
        className="w-full h-12 rounded-full bg-card border-2 border-line px-5 text-ink outline-none focus:border-ink"
      />
      <div className="flex gap-2">
        <Button variant="blue" onClick={saveKey} disabled={draftKey.trim().length < 20} className="flex-1 h-12">
          <Key size={18} weight="bold" /> Guardar clave
        </Button>
        {key && (
          <Button variant="paper" onClick={() => setEditingKey(false)} className="h-12">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`rounded-folder bg-mint ${compact ? "p-4" : "p-5"} flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        {busy ? (
          <span className="w-16 h-16 blob bg-card p-1 shrink-0" aria-hidden="true">
            <Illustration name="generando-preguntas" fallback="procesando" className="w-full" alt="" />
          </span>
        ) : (
          <span className="w-11 h-11 blob bg-card flex items-center justify-center shrink-0" aria-hidden="true">
            <Sparkle size={22} weight="fill" />
          </span>
        )}
        <div className="min-w-0">
          <p className="display text-[22px] leading-tight">Generar preguntas nuevas</p>
          <p className="text-sm leading-snug mt-1">Gemini lee {fixedTema ? "este tema" : "el tema que elijas"} y escribe 15 preguntas y 8 tarjetas más, siempre citando el temario.</p>
        </div>
      </div>

      {!key || editingKey ? (
        keyForm
      ) : (
        <>
          {!fixedTema && <Picker id="generar-tema" label="Tema" value={tema} onChange={setTema} options={temaOptions} />}
          <Button variant="blue" onClick={generate} disabled={busy || !temaId} className="w-full">
            <Sparkle size={20} weight="fill" /> {busy ? "Generando…" : "Generar preguntas"}
          </Button>
          <div aria-live="polite" className="min-h-0">
            {status && (
              <p className={`text-sm leading-snug flex gap-2 ${status.kind === "error" ? "text-plum font-semibold" : status.kind === "ok" ? "text-olive font-semibold" : ""}`}>
                {status.kind === "error" && <WarningCircle size={18} weight="fill" className="shrink-0 mt-px" />}
                {status.text}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
