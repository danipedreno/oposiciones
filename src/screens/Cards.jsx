import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cards as CardsIcon, CheckCircle, Fire, UploadSimple, X, XCircle } from "@phosphor-icons/react";
import { BLOCKS, BLOCK_IDS, COMBO_BONUS, COMBO_STEP, MASTERED_BOX, XP_PER_CARD, cardPiles, cardsForSession, dateKey, shuffle } from "../lib/logic.js";
import { bankCards, temaLabel, temasOf } from "../lib/bank.js";
import { Button, Folder, IconButton, Illustration, Paper, ProgressBar } from "../ui.jsx";

/** Botón para importar el banco privado (mi-banco.json). */
export function ImportBank({ onImport, label = "Importar mi temario", variant = "yellow" }) {
  const input = useRef(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onImport(f);
        }}
      />
      <Button variant={variant} onClick={() => input.current?.click()} className="w-full">
        <UploadSimple size={20} weight="bold" /> {label}
      </Button>
    </>
  );
}

const selectClass = "tap w-full h-12 rounded-folder bg-ink-2 border border-ink-3 px-3 text-paper font-semibold text-sm appearance-none";

function Session({ bank, queue: initial, onExit, onFinish }) {
  const [queue, setQueue] = useState(initial);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Gamificación en vivo: racha de «Lo sé» seguidos y XP acumulado en la sesión.
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const live = useRef({ bonus: 0, best: 0 });
  const results = useRef(new Map());
  const requeued = useRef(new Set());
  const card = queue[i];
  const block = BLOCKS[card.block];

  const rate = (rating) => {
    results.current.set(card.id, rating);
    const nextCombo = rating === "good" ? combo + 1 : 0;
    const milestone = nextCombo > 0 && nextCombo % COMBO_STEP === 0;
    live.current = { bonus: live.current.bonus + (milestone ? COMBO_BONUS : 0), best: Math.max(live.current.best, nextCombo) };
    setCombo(nextCombo);
    setXp((v) => v + XP_PER_CARD[rating] + (milestone ? COMBO_BONUS : 0));
    if (milestone) {
      try {
        navigator.vibrate?.(25);
      } catch (e) {
        /* sin vibración */
      }
    }
    let next = queue;
    // «Otra vez» la repite al final de esta misma sesión (una vez).
    if (rating === "again" && !requeued.current.has(card.id)) {
      requeued.current.add(card.id);
      next = [...queue, card];
      setQueue(next);
    }
    if (i + 1 >= next.length) {
      onFinish([...results.current].map(([id, r]) => ({ id, rating: r })), live.current);
      return;
    }
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-ink">
      <div className="pt-safe px-4 pb-3 border-b border-ink-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <IconButton label="Salir del repaso" onClick={onExit} className="bg-ink-2 border border-ink-3">
            <X size={22} weight="bold" />
          </IconButton>
          <div className="flex-1">
            <ProgressBar pct={(i / queue.length) * 100} className="h-2" label="Progreso del repaso" />
            <p className="font-mono text-xs text-mute tabular-nums mt-1.5">
              {i + 1} de {queue.length}
            </p>
          </div>
          <span key={xp} className="anim-pop font-mono text-sm font-semibold tabular-nums rounded-full bg-folder-yellow text-ink px-3 h-8 flex items-center" aria-label={`${xp} XP en esta sesión`}>
            +{xp} XP
          </span>
        </div>
        <div className="max-w-md mx-auto h-8 mt-2 flex items-center" aria-live="polite">
          {combo >= 2 && (
            <span key={combo} className="anim-pop inline-flex items-center gap-1.5 rounded-full bg-folder-red text-paper px-3 h-8 text-sm font-semibold">
              <Fire size={16} weight="fill" className="anim-flicker" /> Racha ×{combo}
              {combo % COMBO_STEP === 0 && <span className="font-mono">· +{COMBO_BONUS} XP</span>}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 scroll-area px-4 pt-5 pb-6">
        <div key={`${card.id}-${i}`} className="max-w-md mx-auto anim-q-next">
          <Folder color={block.hex} tab={<span className="text-[15px]">{block.short}</span>} tabOffset="ml-2">
            <div className="p-2.5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFlipped((f) => !f);
                  }
                }}
                className="flip-card w-full text-left cursor-pointer rounded-folder"
                aria-label={flipped ? "Ver la pregunta" : "Ver la respuesta"}
                data-flipped={flipped}
              >
                <div className="flip-inner">
                  <Paper className="flip-face p-5 min-h-[260px] flex flex-col">
                    <p className="label text-mute-paper">{temaLabel(bank, card.tema)}</p>
                    <p className="font-serif text-[23px] leading-snug mt-4 flex-1" style={{ textWrap: "pretty" }}>
                      {card.front}
                    </p>
                    <p className="label text-mute-paper/80 mt-4">Toca para ver la respuesta</p>
                  </Paper>
                  <Paper className="flip-face flip-back p-5 min-h-[260px] flex flex-col" aria-hidden={!flipped}>
                    <p className="label text-mute-paper">Respuesta</p>
                    <p className="font-serif text-[21px] leading-snug mt-4" style={{ textWrap: "pretty" }}>
                      {card.back}
                    </p>
                    {card.cita && <p className="text-sm text-mute-paper mt-auto pt-4 leading-snug">Del temario: «{card.cita}»</p>}
                  </Paper>
                </div>
              </div>
            </div>
          </Folder>
        </div>
      </div>

      <div className="border-t border-ink-3 px-4 pt-3 pb-safe bg-ink">
        <div className="max-w-md mx-auto">
          {flipped ? (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="red" onClick={() => rate("again")} className="px-2 whitespace-nowrap">
                Otra vez
              </Button>
              <Button variant="paper" onClick={() => rate("hard")} className="px-2">
                Difícil
              </Button>
              <Button variant="green" onClick={() => rate("good")} className="px-2 whitespace-nowrap">
                Lo sé
              </Button>
            </div>
          ) : (
            <Button variant="paper" onClick={() => setFlipped(true)} className="w-full">
              Mostrar respuesta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Caja de tarjetas («Las sé» / «No las sé») con su contador y botón de repaso. */
function Pile({ title, color, cards, icon, onReview }) {
  return (
    <Folder color={color} tab={<span className="text-[15px]">{title}</span>} tabOffset="ml-1" className="min-w-0">
      <div className="p-3 flex flex-col gap-3 text-paper">
        <div className="flex items-center justify-between">
          <span className="font-mono text-3xl font-semibold tabular-nums">{cards.length}</span>
          {icon}
        </div>
        <button
          type="button"
          onClick={onReview}
          disabled={!cards.length}
          className="tap press h-11 rounded-folder bg-paper text-ink text-sm font-semibold disabled:opacity-40"
        >
          Repasar
        </button>
      </div>
    </Folder>
  );
}

export default function CardsScreen({ store, bank, onImport, onFinish }) {
  const [block, setBlock] = useState("all");
  const [tema, setTema] = useState("all");
  const [session, setSession] = useState(null);
  const today = dateKey();
  const state = store.cards;

  const cards = useMemo(() => bankCards(bank, block, tema), [bank, block, tema]);
  const counts = useMemo(() => {
    let due = 0;
    let fresh = 0;
    let mastered = 0;
    for (const c of cards) {
      const s = state[c.id];
      if (!s) fresh++;
      else {
        if (s.due <= today) due++;
        if (s.box >= MASTERED_BOX) mastered++;
      }
    }
    return { due, fresh, mastered };
  }, [cards, state, today]);
  const queue = useMemo(() => cardsForSession(cards, state, today), [cards, state, today]);
  const piles = useMemo(() => cardPiles(cards, state), [cards, state]);
  const startPile = (list) => setSession(shuffle(list).slice(0, 20));

  if (!bank) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <p className="label text-mute">Repaso rápido</p>
          <h1 className="display text-[52px] mt-1">Tarjetas</h1>
        </header>
        <Paper className="p-5">
          <Illustration name="test-listo" className="w-40 mx-auto" alt="" />
          <p className="font-serif text-xl leading-snug mt-4">Aquí aparecerán las tarjetas de tu temario.</p>
          <p className="text-[15px] text-mute-paper mt-2">
            Importa el archivo <span className="font-mono text-ink">mi-banco.json</span> que te han pasado. Se guarda solo en este móvil.
          </p>
          <div className="mt-5">
            <ImportBank onImport={onImport} variant="blue" />
          </div>
        </Paper>
      </div>
    );
  }

  if (session) {
    // Portal a <body>: el contenedor de la pantalla está animado con transform y rompería el position: fixed.
    return createPortal(
      <Session
        bank={bank}
        queue={session}
        onExit={() => setSession(null)}
        onFinish={(results, live) => {
          setSession(null);
          onFinish(results, live);
        }}
      />,
      document.body
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label text-mute">Repaso espaciado</p>
        <h1 className="display text-[52px] mt-1">Tarjetas</h1>
      </header>

      <div className="grid grid-cols-3 border-y border-ink-3 divide-x divide-ink-3 text-center">
        {[
          { label: "Para hoy", value: counts.due },
          { label: "Nuevas", value: counts.fresh },
          { label: "Dominadas", value: counts.mastered },
        ].map((s) => (
          <div key={s.label} className="py-3">
            <p className="font-mono text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs text-mute">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <label htmlFor="cards-block" className="label text-mute block mb-2">
            Bloque
          </label>
          <select
            id="cards-block"
            value={block}
            onChange={(e) => {
              setBlock(e.target.value);
              setTema("all");
            }}
            className={selectClass}
          >
            <option value="all">Todo el temario</option>
            {BLOCK_IDS.filter((b) => temasOf(bank, b).length).map((b) => (
              <option key={b} value={b}>
                {BLOCKS[b].label}
              </option>
            ))}
          </select>
        </div>
        {block !== "all" && (
          <div>
            <label htmlFor="cards-tema" className="label text-mute block mb-2">
              Tema
            </label>
            <select id="cards-tema" value={tema} onChange={(e) => setTema(e.target.value)} className={selectClass}>
              <option value="all">Todos los temas</option>
              {temasOf(bank, block).map((t) => (
                <option key={t.id} value={t.id}>
                  Tema {t.numero} · {t.titulo}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Paper className="p-5 flex items-center gap-4">
        <span className="w-14 h-14 rounded-folder bg-folder-red text-paper flex items-center justify-center shrink-0">
          <CardsIcon size={30} weight="fill" />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-xl leading-tight">{queue.length ? `${queue.length} tarjetas en esta sesión` : "Todo al día"}</p>
          <p className="text-sm text-mute-paper mt-1 leading-snug">
            {queue.length ? "Primero las que te tocan hoy y luego hasta 10 nuevas." : "No te toca ninguna aquí. Prueba otro bloque o vuelve mañana."}
          </p>
        </div>
      </Paper>

      <Button onClick={() => setSession(queue)} disabled={!queue.length} className="w-full">
        <CardsIcon size={20} weight="bold" /> Empezar repaso
      </Button>

      <section aria-labelledby="cajas-title">
        <h2 id="cajas-title" className="display text-3xl">Tus cajas</h2>
        <p className="text-sm text-mute mt-1 mb-3">Cada tarjeta va a una caja según tu última respuesta. Repásalas cuando quieras.</p>
        <div className="grid grid-cols-2 gap-3">
          <Pile title="Las sé" color="#0c7866" cards={piles.known} icon={<CheckCircle size={28} weight="fill" />} onReview={() => startPile(piles.known)} />
          <Pile title="No las sé" color="#d71e1e" cards={piles.unknown} icon={<XCircle size={28} weight="fill" />} onReview={() => startPile(piles.unknown)} />
        </div>
      </section>

      {(store.cardsHistory || []).length > 0 && (
        <section aria-labelledby="repasos-title">
          <h2 id="repasos-title" className="display text-3xl mb-3">
            Tus repasos
          </h2>
          <ul className="flex flex-col divide-y divide-ink-3 border-y border-ink-3">
            {store.cardsHistory.slice(0, 8).map((h) => (
              <li key={h.id} className="py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {h.known} de {h.n} te las sabías
                  </p>
                  <p className="font-mono text-xs text-mute mt-0.5">
                    {new Date(h.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    {h.bestCombo >= 2 ? ` · mejor racha ×${h.bestCombo}` : ""}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-folder-yellow">+{h.xp} XP</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-mute">
        Cada tarjeta que te sabes vuelve más tarde: 1, 3, 7, 14 y 30 días. Las que fallas vuelven hoy. Cuentan para tu meta diaria y tu racha.
      </p>

      <div className="border-t border-ink-3 pt-5">
        <p className="text-sm text-mute mb-3">
          Banco importado: {bank.temas.length} temas · {bank.preguntas.length} preguntas · {bank.flashcards.length} tarjetas.
        </p>
        <ImportBank onImport={onImport} label="Actualizar mi temario" variant="ghost" />
      </div>
    </div>
  );
}
