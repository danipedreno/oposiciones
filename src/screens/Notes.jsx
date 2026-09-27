import { useEffect, useRef, useState } from "react";
import { Check, FilePdf, Lightning, Sparkle, UploadSimple } from "@phosphor-icons/react";
import { BLOCKS, BLOCK_IDS, analyzeNotes } from "../lib/logic.js";
import { SAMPLE_NOTES } from "../data/questions.js";
import { Button, FolderTab, Illustration, Paper, ProgressBar } from "../ui.jsx";
import { ImportBank } from "./Cards.jsx";

const PROCESS_STEPS = ["Leyendo tus apuntes", "Detectando plazos, normas y conceptos", "Generando preguntas tipo test"];

export default function Notes({ store, bank, onImport, onSaveDraft, onSaveCustom, onStartCustom }) {
  const [text, setText] = useState(store.notesDraft.text);
  const [block, setBlock] = useState(store.notesDraft.block);
  const [upload, setUpload] = useState(null); // { name, progress, simulated }
  const [phase, setPhase] = useState("idle"); // idle | processing | done
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const timers = useRef([]);
  const current = BLOCKS[block];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const t = setTimeout(() => onSaveDraft({ text, block }), 400);
    return () => clearTimeout(t);
  }, [text, block, onSaveDraft]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const simulatePdf = (name) => {
    setError("");
    setAnalysis(null);
    setPhase("idle");
    setUpload({ name, progress: 0, simulated: true });
    [18, 42, 67, 88, 100].forEach((p, k) =>
      later(() => {
        setUpload((u) => (u ? { ...u, progress: p } : u));
        if (p === 100) setText(SAMPLE_NOTES[block]);
      }, 320 * (k + 1))
    );
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isText = /\.(txt|md)$/i.test(file.name) || (file.type || "").startsWith("text/");
    if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        setText(String(reader.result || ""));
        setUpload({ name: file.name, progress: 100, simulated: false });
      };
      reader.onerror = () => setError("No se pudo leer el archivo. Prueba a pegar el texto.");
      reader.readAsText(file);
    } else {
      // Prototipo: la extracción real se haría en local con pdf.js, como en PasaElTest.
      simulatePdf(file.name);
    }
  };

  const process = () => {
    if (text.trim().length < 80) {
      setError("Pega al menos un párrafo (80 caracteres) para generar preguntas.");
      return;
    }
    setError("");
    setPhase("processing");
    setStep(0);
    later(() => setStep(1), 650);
    later(() => setStep(2), 1300);
    later(() => {
      const result = analyzeNotes(text, block);
      setAnalysis(result);
      setPhase("done");
      onSaveCustom({
        title: `Mis apuntes · ${current.short}`,
        block,
        questions: result.questions,
        keywords: result.keywords,
        createdAt: new Date().toISOString(),
      });
    }, 1950);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label text-mute">Apuntes e IA</p>
        <h1 className="display text-[52px] mt-1">De tus apuntes a un test</h1>
      </header>

      <Paper className="p-4">
        <p className="label text-mute-paper">Tu temario de la academia</p>
        {bank ? (
          <p className="font-serif text-[17px] leading-snug mt-2">
            Importado: {bank.temas.length} temas, {bank.preguntas.length} preguntas y {bank.flashcards.length} tarjetas. Úsalo en Test y en Tarjetas.
          </p>
        ) : (
          <p className="font-serif text-[17px] leading-snug mt-2">
            Importa el archivo <span className="font-mono text-base">mi-banco.json</span> con las preguntas de todo tu temario. Se guarda solo en este móvil.
          </p>
        )}
        <div className="mt-4">
          <ImportBank onImport={onImport} label={bank ? "Actualizar mi temario" : "Importar mi temario"} variant={bank ? "ink" : "blue"} />
        </div>
      </Paper>

      {!text && phase === "idle" && (
        <Paper className="p-4 anim-rise">
          <Illustration name="apuntes-vacio" className="w-full" alt="" />
          <p className="font-serif text-[17px] leading-snug mt-3">
            Elige la carpeta del bloque, sube tu PDF o pega el texto, y la IA preparará un test de cuatro alternativas.
          </p>
        </Paper>
      )}

      <section aria-label="Bloque del temario">
        <p className="label text-mute mb-1">1 · Carpeta del bloque</p>
        <div className="flex items-end overflow-x-auto no-scrollbar" role="tablist">
          {BLOCK_IDS.map((id, k) => {
            const active = id === block;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setBlock(id)}
                className={`tap relative shrink-0 -mb-px transition-transform duration-200 ${k ? "-ml-3" : ""} ${active ? "z-10" : "z-0 translate-y-1"}`}
              >
                <FolderTab color={active ? BLOCKS[id].hex : "#2e2e2e"} dark compact>
                  <span className={`text-[14px] ${active ? "" : "text-mute"}`}>{BLOCKS[id].short}</span>
                </FolderTab>
              </button>
            );
          })}
        </div>
        <div key={block} className="rounded-folder folder-shadow p-4 anim-fade transition-colors duration-300" style={{ background: current.hex }}>
          <div className="flex items-center gap-3">
            <Paper className="w-20 h-20 p-1 shrink-0">
              <Illustration name={current.illustration} className="w-full" alt="" />
            </Paper>
            <div>
              <p className="label text-paper/75">Clasificado en</p>
              <p className="display text-[30px] mt-1">{current.label}</p>
            </div>
          </div>

          <p className="label text-paper/75 mt-5 mb-2">2 · Temario o apuntes</p>
          <label className="tap press flex items-center gap-3 rounded-folder bg-black/20 border-2 border-dashed border-paper/40 p-3 cursor-pointer focus-within:outline focus-within:outline-3 focus-within:outline-folder-yellow">
            <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" className="sr-only" onChange={onFile} />
            <span className="w-12 h-12 rounded-[4px] bg-paper text-ink flex items-center justify-center shrink-0">
              <UploadSimple size={24} weight="bold" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">Subir PDF o .txt</span>
              <span className="block text-sm text-paper/75">Se procesa en tu móvil</span>
            </span>
          </label>
          <button type="button" onClick={() => simulatePdf(`Tema-${current.short.replace(/\s/g, "")}.pdf`)} className="tap press w-full h-12 mt-2 rounded-folder font-semibold text-sm underline underline-offset-4 decoration-2">
            Probar con un PDF de ejemplo
          </button>

          {upload && (
            <div className="mt-2 rounded-folder bg-black/20 px-3 py-3 anim-rise">
              <div className="flex items-center gap-2 text-sm">
                <FilePdf size={20} weight="bold" className="shrink-0" />
                <span className="truncate flex-1">{upload.name}</span>
                <span className="font-mono text-xs">{upload.progress}%</span>
              </div>
              <ProgressBar pct={upload.progress} color="#fdfaf7" track="bg-black/30" className="h-1.5 mt-2" label="Lectura del archivo" />
              {upload.progress === 100 && upload.simulated && (
                <p className="text-xs text-paper/80 mt-2 leading-snug">
                  Simulación: se ha cargado un extracto de ejemplo. Con lectura real (pdf.js) aquí aparecería el texto de tu PDF.
                </p>
              )}
            </div>
          )}

          <label htmlFor="notes-text" className="sr-only">
            Texto de tus apuntes
          </label>
          <textarea
            id="notes-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Pega aquí tus apuntes. Ejemplo: «La clasificación de cada penado debe revisarse como máximo cada 6 meses…»"
            className="mt-3 w-full rounded-folder bg-paper text-ink placeholder:text-mute-paper px-4 py-3 font-serif text-[17px] leading-relaxed resize-none outline-none focus:ring-4 focus:ring-folder-yellow"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs text-paper/75">{text.length} caracteres</span>
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setAnalysis(null);
                  setPhase("idle");
                  setUpload(null);
                }}
                className="tap h-11 px-2 text-sm font-semibold"
              >
                Borrar texto
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm font-semibold bg-paper text-folder-red rounded-[4px] px-3 py-2 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {phase === "processing" ? (
        <Paper className="p-4 flex items-center gap-4 anim-fade" aria-live="polite">
          <Illustration name="procesando" className="w-24 shrink-0" alt="" />
          <ol className="flex flex-col gap-2.5">
            {PROCESS_STEPS.map((label, k) => (
              <li key={label} className="flex items-center gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    k < step ? "bg-folder-green text-paper" : k === step ? "bg-folder-yellow animate-pulse" : "bg-paper-2"
                  }`}
                >
                  {k < step && <Check size={14} weight="bold" />}
                </span>
                <span className={`text-sm ${k <= step ? "text-ink" : "text-mute-paper"}`}>{label}</span>
              </li>
            ))}
          </ol>
        </Paper>
      ) : (
        <Button onClick={process} className="w-full">
          <Sparkle size={22} weight="bold" /> Generar test con IA
        </Button>
      )}

      {phase === "done" && analysis && (
        <Paper className="p-4 anim-pop">
          <div className="flex items-center gap-4">
            <Illustration name="test-listo" className="w-24 shrink-0" alt="" />
            <div>
              <p className="label text-mute-paper">Test listo</p>
              <p className="display text-[34px] mt-1">{analysis.questions.length} preguntas</p>
            </div>
          </div>
          <p className="text-[15px] text-mute-paper mt-3">
            {analysis.stats.cloze} sacadas de tus apuntes y {analysis.stats.bank} del banco de {current.label}
            {analysis.stats.matched > 0 && <> ({analysis.stats.matched} relacionadas con tu texto)</>}.
          </p>
          {analysis.keywords.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-3" aria-label="Conceptos detectados">
              {analysis.keywords.map((k) => (
                <li key={k} className="px-2.5 py-1 rounded-full bg-paper-2 font-mono text-xs">
                  {k}
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 flex flex-col gap-2 border-t border-paper-3 pt-3">
            {analysis.questions.slice(0, 3).map((q) => (
              <li key={q.id} className="font-serif text-[16px] leading-snug">
                {q.q}
              </li>
            ))}
          </ul>
          <Button variant="blue" onClick={onStartCustom} className="w-full mt-4">
            <Lightning size={22} weight="bold" /> Empezar este test
          </Button>
        </Paper>
      )}
    </div>
  );
}
