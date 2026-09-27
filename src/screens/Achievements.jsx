import { useState } from "react";
import { Check, Lock } from "@phosphor-icons/react";
import { ACHIEVEMENTS, MEDAL_FAMILIES, RANKS, ROMAN, medalProgress, rankInfo } from "../lib/logic.js";
import { Button, Folder, Illustration, MedalBadge, Paper, ProgressBar, Sheet } from "../ui.jsx";

export default function Achievements({ store, onReset }) {
  const [confirm, setConfirm] = useState(false);
  const specials = ACHIEVEMENTS.filter((a) => store.achievements[a.id]).length;
  const tiers = MEDAL_FAMILIES.map((f) => ({ f, p: medalProgress(f, store) }));
  const unlocked = specials + tiers.reduce((acc, t) => acc + t.p.level, 0);
  const total = ACHIEVEMENTS.length + MEDAL_FAMILIES.reduce((acc, f) => acc + f.tiers.length, 0);
  const { rank } = rankInfo(store.xp);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="label text-mute">Hoja de servicios</p>
          <h1 className="display text-[52px] mt-1">Logros</h1>
        </div>
        <p className="font-mono text-mute pb-1">
          <span className="text-paper text-2xl font-semibold">{unlocked}</span>/{total}
        </p>
      </header>

      <section aria-labelledby="medallas-title">
        <h2 id="medallas-title" className="display text-3xl mb-1">Medallas</h2>
        <p className="text-sm text-mute mb-3">Cada una tiene varios niveles repartidos por el mes. Sube de nivel para desbloquear el siguiente.</p>
        <ul className="flex flex-col gap-2">
          {tiers.map(({ f, p }) => (
            <li key={f.id}>
              <Paper className="p-3 flex items-center gap-4">
                <MedalBadge family={f} level={p.level} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-serif text-lg leading-tight">{f.name}</p>
                    <p className="font-mono text-xs text-mute-paper shrink-0">
                      {p.level ? `Nivel ${ROMAN[p.level]}` : "Sin empezar"} · {p.level}/{p.max}
                    </p>
                  </div>
                  <ProgressBar pct={p.pct} color={p.next ? "#191919" : "#0c7866"} track="bg-paper-3" className="h-2 mt-2" label={`Progreso de ${f.name}`} />
                  <p className="text-xs text-mute-paper mt-1.5 leading-snug">
                    {p.next ? `${Math.min(p.value, p.next)}/${p.next} ${f.unit}` : `¡Nivel máximo! ${p.value} ${f.unit}`}
                  </p>
                </div>
              </Paper>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="display text-3xl -mb-3">Especiales</h2>

      <ul className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, k) => {
          const date = store.achievements[a.id];
          return (
            <li key={a.id} className="anim-rise" style={{ animationDelay: `${k * 60}ms` }}>
              <Paper className={`h-full p-3 flex flex-col gap-2 transition-opacity duration-500 ${date ? "" : "bg-paper-2"}`}>
                <div className="relative">
                  <Illustration name={a.illustration} alt="" className={`w-full ${date ? "" : "grayscale opacity-35"}`} />
                  {!date && (
                    <span className="absolute top-1 right-1 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center" aria-label="Bloqueada">
                      <Lock size={16} weight="bold" />
                    </span>
                  )}
                </div>
                <p className="font-serif text-lg leading-tight">{a.name}</p>
                <p className="text-sm text-mute-paper leading-snug flex-1">{a.desc}</p>
                <p className={`label ${date ? "text-folder-green" : "text-mute-paper/70"}`}>
                  {date ? `Conseguida ${new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}` : "Bloqueada"}
                </p>
              </Paper>
            </li>
          );
        })}
      </ul>

      <Folder color="#581e70" tab="Escalafón">
        <ol className="p-3 flex flex-col gap-1">
          {RANKS.map((r) => {
            const reached = store.xp >= r.min;
            const current = r.level === rank.level;
            return (
              <li key={r.level} className={`flex items-center gap-3 rounded-[4px] p-2 ${current ? "bg-paper text-ink" : ""}`}>
                <span className={`w-12 h-12 rounded-[4px] shrink-0 overflow-hidden ${current ? "bg-paper-2" : "bg-paper"}`}>
                  <Illustration name={r.illustration} alt="" className={`w-full ${reached ? "" : "grayscale opacity-40"}`} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold leading-tight">{r.name}</span>
                  <span className={`block font-mono text-xs ${current ? "text-mute-paper" : "text-paper/70"}`}>Nivel {r.level} · {r.min} XP</span>
                </span>
                {reached && <Check size={20} weight="bold" className={current ? "text-folder-green" : "text-folder-yellow"} aria-label="Alcanzado" />}
              </li>
            );
          })}
        </ol>
      </Folder>

      <dl className="grid grid-cols-3 border-y border-ink-3 divide-x divide-ink-3 text-center">
        {[
          { label: "Tests", value: store.totals.tests },
          { label: "Respondidas", value: store.totals.answered },
          { label: "Mejor racha", value: store.streak.best || 0 },
        ].map((s) => (
          <div key={s.label} className="py-3">
            <dd className="font-mono text-2xl font-semibold">{s.value}</dd>
            <dt className="text-xs text-mute">{s.label}</dt>
          </div>
        ))}
      </dl>

      <button type="button" onClick={() => setConfirm(true)} className="tap press h-12 rounded-folder text-sm text-mute font-semibold underline underline-offset-4">
        Reiniciar progreso
      </button>

      <Sheet
        open={confirm}
        title="¿Reiniciar?"
        illustration="reiniciar"
        onClose={() => setConfirm(false)}
        body="Se borran racha, XP, medallas, historial y apuntes guardados en este móvil. No se puede deshacer."
        actions={
          <>
            <Button variant="red" onClick={() => { setConfirm(false); onReset(); }}>
              Borrar progreso
            </Button>
            <Button variant="paper" className="border-2 border-paper-3" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </div>
  );
}
