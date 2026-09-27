import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, CaretDown, CaretLeft, CaretRight, Check, Flag, Minus, Plus, Timer, X } from "@phosphor-icons/react";
import {
  ACHIEVEMENTS,
  BLOCKS,
  BLOCK_IDS,
  OFFICIAL_SECONDS_PER_QUESTION,
  fmt2,
  formatClock,
  formatMinutes,
} from "../lib/logic.js";
import { SEED_QUESTIONS } from "../data/questions.js";
import { Button, Folder, IconButton, Illustration, Paper, ProgressBar, Segmented, Sheet } from "../ui.jsx";
import { RankFolder } from "./Home.jsx";

/* ---------------------------------------------------------------------
   Configuración del simulacro
   --------------------------------------------------------------------- */
const BLOCK_CHOICES = [
  { id: "all", label: "Todo el temario", hex: "#fdfaf7", dark: false },
  ...BLOCK_IDS.map((id) => ({ id, label: BLOCKS[id].short, hex: BLOCKS[id].hex, dark: true })),
];

export function ExamSetup({ store, onSettings, onStart }) {
  const s = store.settings;
  const custom = store.customTest;
  const source = s.source === "notes" && custom ? "notes" : "bank";
  const pool = source === "notes" ? custom.questions : s.block === "all" ? SEED_QUESTIONS : SEED_QUESTIONS.filter((q) => q.block === s.block);
  const count = s.count === "all" ? pool.length : Math.min(s.count, pool.length);

  const start = () => {
    const title = source === "notes" ? custom.title : s.block === "all" ? "Simulacro · Temario completo" : `Simulacro · ${BLOCKS[s.block].short}`;
    onStart({ pool, count, feedback: s.feedback, secsPerQ: s.secsPerQ, source, title });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label text-mute">Modo examen</p>
        <h1 className="display text-[52px] mt-1">Simulacro</h1>
      </header>

      <Paper className="p-4 anim-rise">
        <Illustration name="simulacro" className="w-full" alt="" />
        <p className="label text-mute-paper mt-3">Corrección oficial IIPP</p>
        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
          <div className="rounded-[4px] bg-folder-green text-paper py-2.5">
            <p className="font-mono text-2xl font-semibold">+1</p>
            <p className="text-xs">Acierto</p>
          </div>
          <div className="rounded-[4px] bg-paper-2 py-2.5">
            <p className="font-mono text-2xl font-semibold">0</p>
            <p className="text-xs">En blanco</p>
          </div>
          <div className="rounded-[4px] bg-folder-red text-paper py-2.5">
            <p className="font-mono text-2xl font-semibold">−⅓</p>
            <p className="text-xs">Fallo</p>
          </div>
        </div>
        <p className="font-serif text-[17px] leading-snug mt-3">
          Nota = Aciertos − Errores ÷ 3. Si dudas entre varias opciones, dejarla en blanco puede salir a cuenta.
        </p>
      </Paper>

      <Segmented
        label="Origen de las preguntas"
        value={source}
        onChange={(v) => onSettings({ source: v })}
        disabledValues={custom ? [] : ["notes"]}
        options={[
          { value: "bank", label: "Banco IIPP", sub: `${SEED_QUESTIONS.length} preguntas` },
          { value: "notes", label: "Mis apuntes", sub: custom ? `${custom.questions.length} preguntas` : "Genera un test" },
        ]}
      />

      {source === "bank" && (
        <fieldset>
          <legend className="label text-mute mb-1">Bloque</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {BLOCK_CHOICES.map((b) => {
              const active = s.block === b.id;
              const n = b.id === "all" ? SEED_QUESTIONS.length : SEED_QUESTIONS.filter((q) => q.block === b.id).length;
              const color = active ? b.hex : "#2e2e2e";
              return (
                <button key={b.id} type="button" onClick={() => onSettings({ block: b.id })} aria-pressed={active} className="tap press text-left">
                  <Folder color={color} tab={<span className="text-[15px]">{b.label}</span>} tabDark={!active || b.dark} tabOffset="ml-0">
                    <p className={`px-3 py-3 font-mono text-sm ${active ? (b.dark ? "text-paper" : "text-ink") : "text-mute"}`}>{n} preguntas</p>
                  </Folder>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <Segmented
          label="Número de preguntas"
          value={s.count}
          onChange={(v) => onSettings({ count: v })}
          options={[
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 30, label: "30" },
            { value: "all", label: "Todas" },
          ]}
        />
        <p className="text-sm text-mute mt-2">
          Este test tendrá <span className="font-mono text-paper">{count}</span> preguntas.
          {count <= 10 && " La medalla Imbatible exige más de 10."}
        </p>
      </div>

      <Segmented
        label="Corrección"
        value={s.feedback}
        onChange={(v) => onSettings({ feedback: v })}
        options={[
          { value: "immediate", label: "Inmediata", sub: "tras cada respuesta" },
          { value: "final", label: "Al entregar", sub: "como el examen real" },
        ]}
      />

      <div>
        <p className="label text-mute mb-2">Tiempo por pregunta</p>
        <div className="flex items-center gap-3 rounded-folder bg-ink-2 border border-ink-3 p-2">
          <IconButton label="Menos tiempo" onClick={() => onSettings({ secsPerQ: Math.max(30, s.secsPerQ - 6) })} className="bg-ink-3">
            <Minus size={22} weight="bold" />
          </IconButton>
          <div className="flex-1 text-center">
            <p className="font-mono text-2xl font-semibold">{s.secsPerQ} s</p>
            <p className="text-xs text-mute">{s.secsPerQ === OFFICIAL_SECONDS_PER_QUESTION ? "Ritmo oficial · 150 en 135 min" : "Ritmo personalizado"}</p>
          </div>
          <IconButton label="Más tiempo" onClick={() => onSettings({ secsPerQ: Math.min(120, s.secsPerQ + 6) })} className="bg-ink-3">
            <Plus size={22} weight="bold" />
          </IconButton>
        </div>
      </div>

      <Button onClick={start} disabled={count === 0} className="w-full">
        <Timer size={22} weight="bold" />
        Empezar · {formatMinutes(count * s.secsPerQ)}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Examen en curso
   --------------------------------------------------------------------- */
export function ExamRunner({ exam, remainingMs, onSelect, onBlank, onGoto, onFinish, onAbandon }) {
  const [sheet, setSheet] = useState(null); // "finish" | "abandon" | null
  const chipRefs = useRef([]);
  const scrollRef = useRef(null);
  const n = exam.questions.length;
  const i = exam.current;
  const q = exam.questions[i];
  const block = BLOCKS[q.block];
  const chosen = exam.answers[i];
  const immediate = exam.feedback === "immediate";
  const revealed = immediate && exam.revealed[i];
  const answeredCount = exam.answers.filter((a) => a !== null).length;
  const blankCount = n - answeredCount;
  const timePct = (remainingMs / (n * exam.secsPerQ * 1000)) * 100;
  const critical = remainingMs <= 60000;
  const warning = !critical && timePct <= 20;
  const allRevealed = immediate && exam.revealed.every(Boolean);

  useEffect(() => {
    chipRefs.current[i]?.scrollIntoView?.({ behavior: "smooth", inline: "center", block: "nearest" });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [i]);

  const chipClass = (idx) => {
    const a = exam.answers[idx];
    const ring = idx === i ? "ring-2 ring-paper ring-offset-2 ring-offset-ink " : "";
    if (immediate && exam.revealed[idx]) {
      if (a === null) return ring + "bg-ink-4 text-paper";
      return ring + (a === exam.questions[idx].answer ? "bg-folder-green text-paper" : "bg-folder-red text-paper");
    }
    return ring + (a !== null ? "bg-folder-blue text-paper" : "bg-ink-2 text-mute border border-ink-3");
  };

  const optionClass = (idx) => {
    if (revealed) {
      if (idx === q.answer) return "bg-folder-green border-folder-green text-paper";
      if (idx === chosen) return "bg-folder-red border-folder-red text-paper anim-shake";
      return "bg-ink-2 border-ink-3 text-mute opacity-60";
    }
    if (idx === chosen) return "bg-folder-blue border-folder-blue text-paper";
    return "bg-ink-2 border-ink-3 text-paper hover:border-ink-4";
  };

  const verdict = chosen === q.answer ? { label: "Correcta · +1", cls: "text-folder-green" } : chosen === null ? { label: "En blanco · 0", cls: "text-mute-paper" } : { label: "Incorrecta · −0,33", cls: "text-folder-red" };

  let center;
  if (immediate && !revealed) {
    center = (
      <Button variant="ghost" onClick={onBlank} className="flex-1">
        Dejar en blanco
      </Button>
    );
  } else if (immediate && i < n - 1 && !allRevealed) {
    center = (
      <Button variant="paper" onClick={() => onGoto(i + 1)} className="flex-1">
        Siguiente <CaretRight size={20} weight="bold" />
      </Button>
    );
  } else if (immediate) {
    center = (
      <Button onClick={() => (allRevealed ? onFinish() : setSheet("finish"))} className="flex-1">
        <Flag size={20} weight="bold" /> Ver resultado
      </Button>
    );
  } else if (i === n - 1) {
    center = (
      <Button onClick={() => setSheet("finish")} className="flex-1">
        <Flag size={20} weight="bold" /> Entregar
      </Button>
    );
  } else {
    center = (
      <Button variant="paper" onClick={() => onGoto(i + 1)} className="flex-1">
        Siguiente <CaretRight size={20} weight="bold" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-ink">
      <div className="pt-safe px-4 pb-3 border-b border-ink-3">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          <IconButton label="Abandonar examen" onClick={() => setSheet("abandon")} className="bg-ink-2 border border-ink-3">
            <X size={22} weight="bold" />
          </IconButton>
          <div
            role="timer"
            aria-label={`Tiempo restante ${formatClock(remainingMs)}`}
            className={`flex items-center gap-2 px-4 h-12 rounded-full font-mono text-xl font-semibold tabular-nums transition-colors duration-500 ${
              critical ? "bg-folder-red text-paper animate-pulse" : warning ? "bg-folder-yellow text-ink" : "bg-paper text-ink"
            }`}
          >
            <Timer size={22} weight="bold" />
            {formatClock(remainingMs)}
          </div>
          <button type="button" onClick={() => setSheet("finish")} className="tap press h-12 px-4 rounded-folder border-2 border-folder-yellow text-folder-yellow font-semibold text-sm">
            Entregar
          </button>
        </div>
        <div className="max-w-md mx-auto mt-3">
          <ProgressBar pct={timePct} color={critical ? "#d71e1e" : "#ffe927"} className="h-1" label="Tiempo restante" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 px-1 py-1.5 -mx-1">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                ref={(el) => (chipRefs.current[idx] = el)}
                type="button"
                onClick={() => onGoto(idx)}
                aria-label={`Ir a la pregunta ${idx + 1}`}
                aria-current={idx === i ? "step" : undefined}
                className={`tap press w-11 h-11 shrink-0 rounded-[4px] font-mono text-sm font-semibold ${chipClass(idx)}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 scroll-area px-4 pt-4 pb-6">
        <div key={i} className="max-w-md mx-auto anim-rise">
          <Folder color={block.hex} tab={block.short} tabOffset="ml-2">
            <div className="p-2.5">
              <Paper className="p-5">
                <p className="label text-mute-paper">
                  Pregunta {i + 1} de {n}
                </p>
                <h2 className="font-serif text-[22px] leading-snug mt-2" style={{ textWrap: "pretty" }}>
                  {q.q}
                </h2>
              </Paper>
            </div>
          </Folder>

          <div className="flex flex-col gap-2.5 mt-4" role="radiogroup" aria-label="Respuestas">
            {q.options.map((opt, idx) => (
              <button
                key={`${i}-${idx}`}
                type="button"
                role="radio"
                aria-checked={chosen === idx}
                onClick={() => onSelect(idx)}
                disabled={revealed}
                className={`tap press min-h-[60px] w-full rounded-folder border-2 px-3 py-3 flex items-center gap-3 text-left ${optionClass(idx)}`}
              >
                <span className="w-9 h-9 rounded-[4px] bg-black/25 flex items-center justify-center font-mono font-semibold shrink-0">
                  {revealed && idx === q.answer ? <Check size={20} weight="bold" /> : revealed && idx === chosen ? <X size={20} weight="bold" /> : "ABCD"[idx]}
                </span>
                <span className="text-base leading-snug">{opt}</span>
              </button>
            ))}
          </div>

          {!immediate && chosen !== null && <p className="text-sm text-mute mt-3">Toca de nuevo tu respuesta para dejarla en blanco.</p>}

          {revealed && (
            <Paper className="mt-4 p-4 anim-pop" aria-live="polite">
              <p className={`label ${verdict.cls}`}>{verdict.label}</p>
              <p className="font-serif text-[17px] leading-relaxed mt-1">{q.exp}</p>
            </Paper>
          )}
        </div>
      </div>

      <div className="border-t border-ink-3 px-4 pt-3 pb-safe bg-ink">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <IconButton label="Pregunta anterior" disabled={i === 0} onClick={() => onGoto(i - 1)} className="w-14 h-14 bg-ink-2 border border-ink-3">
            <CaretLeft size={24} weight="bold" />
          </IconButton>
          {center}
          <IconButton label="Pregunta siguiente" disabled={i === n - 1} onClick={() => onGoto(i + 1)} className="w-14 h-14 bg-ink-2 border border-ink-3">
            <CaretRight size={24} weight="bold" />
          </IconButton>
        </div>
      </div>

      {sheet === "finish" && (
        <Sheet
          title="¿Entregar?"
          illustration="entregar"
          onClose={() => setSheet(null)}
          body={
            <>
              Has respondido <span className="font-mono text-ink">{answeredCount}</span> de <span className="font-mono text-ink">{n}</span>.
              {blankCount > 0 && <> Las {blankCount} sin responder cuentan como blanco y no restan.</>}
            </>
          }
          actions={
            <>
              <Button variant="blue" onClick={() => { setSheet(null); onFinish(); }}>
                Entregar y corregir
              </Button>
              <Button variant="paper" className="border-2 border-paper-3" onClick={() => setSheet(null)}>
                Seguir respondiendo
              </Button>
            </>
          }
        />
      )}
      {sheet === "abandon" && (
        <Sheet
          title="¿Abandonar?"
          illustration="abandonar"
          onClose={() => setSheet(null)}
          body="Perderás las respuestas de este intento. No suma XP ni cuenta para la racha."
          actions={
            <>
              <Button variant="red" onClick={() => { setSheet(null); onAbandon(); }}>
                Abandonar examen
              </Button>
              <Button variant="paper" className="border-2 border-paper-3" onClick={() => setSheet(null)}>
                Volver al examen
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Resultado
   --------------------------------------------------------------------- */
export function ExamResults({ result, xp, onNew, onHome }) {
  const { grade, exam, xpGained, rankBefore, rankAfter, earned, reason } = result;
  const [open, setOpen] = useState(() => new Set());
  const promoted = rankAfter.level > rankBefore.level;
  const art = reason === "timeout" ? "tiempo-agotado" : promoted ? "ascenso" : grade.over10 >= 7 ? "resultado-alto" : grade.over10 >= 4 ? "resultado-medio" : "resultado-bajo";
  const toggle = (idx) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label text-mute">{exam.title}</p>
        <h1 className="display text-[52px] mt-1">Resultado</h1>
        {reason === "timeout" && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink bg-folder-yellow rounded-[4px] px-3 py-2">
            <Timer size={18} weight="bold" /> Tiempo agotado: se entregó solo.
          </p>
        )}
      </header>

      <Paper className="p-5 anim-pop">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="label text-mute-paper">Acta de corrección</p>
            <p className="font-mono text-[56px] leading-none font-semibold tracking-tight mt-2">{fmt2(grade.net)}</p>
            <p className="font-mono text-sm text-mute-paper mt-1">
              sobre {grade.n} · {grade.correct} − {grade.wrong} ÷ 3
            </p>
          </div>
          <Illustration name={art} className="w-28 shrink-0" alt="" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-mute-paper">Nota sobre 10</span>
            <span className="font-mono font-semibold">{fmt2(grade.over10)}</span>
          </div>
          <ProgressBar pct={grade.over10 * 10} color="#191919" track="bg-paper-3" className="h-2.5" label="Nota sobre 10" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5 text-center">
          <div className="rounded-[4px] bg-folder-green text-paper py-3">
            <p className="font-mono text-2xl font-semibold">{grade.correct}</p>
            <p className="text-xs">Aciertos</p>
          </div>
          <div className="rounded-[4px] bg-folder-red text-paper py-3">
            <p className="font-mono text-2xl font-semibold">{grade.wrong}</p>
            <p className="text-xs">Fallos</p>
          </div>
          <div className="rounded-[4px] bg-paper-2 py-3">
            <p className="font-mono text-2xl font-semibold">{grade.blank}</p>
            <p className="text-xs">En blanco</p>
          </div>
        </div>
      </Paper>

      <div>
        {promoted && (
          <p className="font-serif text-xl mb-3">
            ¡Ascenso! Ahora eres <span className="text-folder-yellow">{rankAfter.name}</span>.
          </p>
        )}
        <RankFolder xp={xp} tab={`+${xpGained} XP en este test`} />
      </div>

      {earned.length > 0 && (
        <section aria-labelledby="medallas-nuevas">
          <h2 id="medallas-nuevas" className="display text-3xl mb-3">Medallas nuevas</h2>
          <div className="flex flex-col gap-2">
            {earned.map((id) => {
              const a = ACHIEVEMENTS.find((x) => x.id === id);
              return (
                <Paper key={id} className="p-3 flex items-center gap-3 anim-pop">
                  <Illustration name={a.illustration} className="w-16 shrink-0" alt="" />
                  <div>
                    <p className="font-serif text-lg leading-tight">{a.name}</p>
                    <p className="text-sm text-mute-paper">{a.desc}</p>
                  </div>
                </Paper>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onNew}>
          <ArrowCounterClockwise size={20} weight="bold" /> Nuevo test
        </Button>
        <Button variant="ghost" onClick={onHome}>
          Ir a inicio
        </Button>
      </div>

      <section aria-labelledby="revision-title">
        <h2 id="revision-title" className="display text-3xl mb-3">Revisión</h2>
        <ul className="flex flex-col gap-2">
          {exam.questions.map((q, idx) => {
            const a = exam.answers[idx];
            const status = a === null ? "blank" : a === q.answer ? "ok" : "ko";
            const isOpen = open.has(idx);
            return (
              <li key={q.id + idx} className="rounded-folder bg-ink-2 border border-ink-3 overflow-hidden">
                <button type="button" onClick={() => toggle(idx)} className="tap w-full px-3 py-3 flex items-center gap-3 text-left" aria-expanded={isOpen}>
                  <span
                    className={`w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0 ${
                      status === "ok" ? "bg-folder-green" : status === "ko" ? "bg-folder-red" : "bg-ink-4"
                    }`}
                    aria-label={status === "ok" ? "Acierto" : status === "ko" ? "Fallo" : "En blanco"}
                  >
                    {status === "ok" ? <Check size={18} weight="bold" /> : status === "ko" ? <X size={18} weight="bold" /> : <Minus size={18} weight="bold" />}
                  </span>
                  <span className="flex-1 text-[15px] leading-snug">
                    <span className="font-mono text-mute mr-1">{idx + 1}.</span>
                    {q.q}
                  </span>
                  <CaretDown size={20} weight="bold" className={`text-mute shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 anim-fade">
                    <Paper className="p-3 shadow-none">
                      <ul className="flex flex-col gap-1">
                        {q.options.map((opt, oi) => (
                          <li
                            key={oi}
                            className={`text-sm rounded-[4px] px-2.5 py-2 ${
                              oi === q.answer ? "bg-folder-green text-paper" : oi === a ? "bg-folder-red text-paper" : "text-mute-paper"
                            }`}
                          >
                            <span className="font-mono font-semibold mr-2">{"ABCD"[oi]}</span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                      <p className="font-serif text-[16px] leading-relaxed mt-3">{q.exp}</p>
                    </Paper>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
