import { useState } from "react";
import { Check, Lock } from "@phosphor-icons/react";
import { ACHIEVEMENTS, MEDAL_FAMILIES, RANKS, ROMAN, medalProgress, rankInfo } from "../lib/logic.js";
import { Button, Folder, Illustration, MedalBadge, Paper, ProgressBar, Sheet } from "../ui.jsx";
import { PAL } from "../lib/palette.js";

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
          <h1 className="display text-[48px]">Logros</h1>
        </div>
        <p className="font-mono text-ink-soft pb-1">
          <span className="brand text-ink text-[32px]">{unlocked}</span> de {total}
        </p>
      </header>

      <section aria-labelledby="medallas-title">
        <h2 id="medallas-title" className="display text-[30px] mb-1">Medallas</h2>
        <p className="text-sm text-ink-soft mb-3">Cada una tiene varios niveles repartidos por el mes. Sube de nivel para desbloquear el siguiente.</p>
        <ul className="flex flex-col gap-2">
          {tiers.map(({ f, p }) => (
            <li key={f.id}>
              <Paper className="p-3 flex items-center gap-4">
                <MedalBadge family={f} level={p.level} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-[17px] leading-tight">{f.name}</p>
                    <p className="text-xs text-ink-soft shrink-0">
                      {p.level ? `Nivel ${ROMAN[p.level]}` : "Sin empezar"} · {p.level}/{p.max}
                    </p>
                  </div>
                  <ProgressBar pct={p.pct} color={p.next ? PAL.ink : PAL.olive} track="bg-ground-2" className="h-2.5 mt-2" label={`Progreso de ${f.name}`} />
                  <p className="text-xs text-ink-soft mt-1.5 leading-snug">
                    {p.next ? `${Math.min(p.value, p.next)}/${p.next} ${f.unit}` : `¡Nivel máximo! ${p.value} ${f.unit}`}
                  </p>
                </div>
              </Paper>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="display text-[30px] -mb-3">Especiales</h2>

      <ul className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, k) => {
          const date = store.achievements[a.id];
          return (
            <li key={a.id} className="anim-rise" style={{ animationDelay: `${k * 60}ms` }}>
              <Paper className="h-full p-3 flex flex-col gap-2">
                <div className={`relative blob p-2 ${date ? "bg-lilac" : "bg-ground"}`}>
                  <Illustration name={a.illustration} alt="" className={`w-full ${date ? "" : "opacity-30"}`} />
                  {!date && (
                    <span className="absolute top-0 right-0 w-8 h-8 rounded-full bg-card paper-shadow text-ink flex items-center justify-center" aria-label="Bloqueada">
                      <Lock size={16} weight="bold" />
                    </span>
                  )}
                </div>
                <p className="font-semibold text-[17px] leading-tight">{a.name}</p>
                <p className="text-sm text-ink-soft leading-snug flex-1">{a.desc}</p>
                <p className={`label ${date ? "text-olive" : "text-ink-soft"}`}>
                  {date ? `Conseguida ${new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}` : "Bloqueada"}
                </p>
              </Paper>
            </li>
          );
        })}
      </ul>

      <Folder color={PAL.plum} tabDark tab="Escalafón">
        <ol className="p-3 flex flex-col gap-1">
          {RANKS.map((r) => {
            const reached = store.xp >= r.min;
            const current = r.level === rank.level;
            return (
              <li key={r.level} className={`flex items-center gap-3 rounded-[14px] p-2 ${current ? "bg-lilac text-ink" : ""}`}>
                <span className="w-12 h-12 blob shrink-0 overflow-hidden bg-card p-0.5">
                  <Illustration name={r.illustration} alt="" className={`w-full ${reached ? "" : "opacity-35"}`} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold leading-tight">{r.name}</span>
                  <span className={`block text-xs ${current ? "text-ink" : "text-lilac"}`}>Nivel {r.level} · {r.min} XP</span>
                </span>
                {reached && <Check size={20} weight="bold" className={current ? "text-plum" : "text-lilac"} aria-label="Alcanzado" />}
              </li>
            );
          })}
        </ol>
      </Folder>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Tests", value: store.totals.tests },
          { label: "Respondidas", value: store.totals.answered },
          { label: "Mejor racha", value: store.streak.best || 0 },
        ].map((s) => (
          <div key={s.label} className="py-3 rounded-folder bg-card paper-shadow flex flex-col-reverse">
            <dt className="text-xs text-ink-soft mt-1.5">{s.label}</dt>
            <dd className="brand text-[28px] leading-none">{s.value}</dd>
          </div>
        ))}
      </dl>

      <button type="button" onClick={() => setConfirm(true)} className="tap press h-12 rounded-full text-sm text-ink-soft font-semibold underline underline-offset-4">
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
            <Button variant="paper" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </div>
  );
}
