import { useState } from "react";
import { CaretDoubleUp, PencilSimpleLine } from "@phosphor-icons/react";
import { ILLUSTRATIONS } from "./lib/illustrations.js";
import { RANKS } from "./lib/logic.js";

/* ---------------------------------------------------------------------
   Carpeta con pestaña (motivo de Mosby's Files)
   --------------------------------------------------------------------- */
const WEDGE = "M0 0C8 0 10.5 3 12.2 10L16.4 34C17.6 40 20 44 24 44H0Z";

/** Pestaña de carpeta: bordes curvos a ambos lados y cuerpo del color de la carpeta. */
export function FolderTab({ color, dark = true, compact = false, children, className = "" }) {
  const w = compact ? 16 : 24;
  return (
    <div className={`flex items-end h-11 ${className}`}>
      <svg width={w} height="44" viewBox="0 0 24 44" preserveAspectRatio="none" className="-mr-px shrink-0" style={{ transform: "scaleX(-1)" }} aria-hidden="true">
        <path d={WEDGE} fill={color} />
      </svg>
      <div
        className={`h-11 flex items-center gap-2 px-1.5 font-serif text-[17px] leading-none whitespace-nowrap ${dark ? "text-paper" : "text-ink"}`}
        style={{ background: color }}
      >
        {children}
      </div>
      <svg width={w} height="44" viewBox="0 0 24 44" preserveAspectRatio="none" className="-ml-px shrink-0" aria-hidden="true">
        <path d={WEDGE} fill={color} />
      </svg>
    </div>
  );
}

/**
 * Carpeta: pestaña + cuerpo. `stacked` hace que la siguiente carpeta monte su pestaña
 * sobre esta, como el archivador de la portada de Mosby's Files.
 */
export function Folder({ color, tab, tabDark = true, stacked = false, tabOffset = "ml-3", className = "", bodyClassName = "", children, style }) {
  return (
    <section className={`relative ${className}`} style={style}>
      <div className="flex items-end">
        <FolderTab color={color} dark={tabDark} className={`${tabOffset} -mb-px relative z-[1]`}>
          {tab}
        </FolderTab>
      </div>
      <div className={`relative rounded-folder folder-shadow ${stacked ? "pb-16" : ""} ${bodyClassName}`} style={{ background: color }}>
        {children}
      </div>
    </section>
  );
}

/** Hoja de papel crema: aquí viven la lectura larga y las ilustraciones. */
export function Paper({ className = "", children, as: Tag = "div", ...rest }) {
  return (
    <Tag className={`bg-paper text-ink rounded-folder paper-shadow ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------
   Controles
   --------------------------------------------------------------------- */
const BUTTON_VARIANTS = {
  yellow: "bg-folder-yellow text-ink hover:brightness-95",
  blue: "bg-folder-blue text-paper hover:brightness-110",
  paper: "bg-paper text-ink hover:bg-paper-2",
  ghost: "bg-transparent text-paper border-2 border-ink-4 hover:border-mute",
  red: "bg-folder-red text-paper hover:brightness-110",
  green: "bg-folder-green text-paper hover:brightness-110",
};

export function Button({ variant = "yellow", className = "", children, ...rest }) {
  return (
    <button
      type="button"
      className={`tap press h-14 px-5 rounded-folder font-sans font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`tap press w-12 h-12 rounded-folder flex items-center justify-center disabled:opacity-30 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Segmented({ label, options, value, onChange, disabledValues = [] }) {
  return (
    <fieldset>
      <legend className="label text-mute mb-2">{label}</legend>
      <div className="grid gap-1 p-1 rounded-folder bg-ink-2 border border-ink-3" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const active = o.value === value;
          const disabled = disabledValues.includes(o.value);
          return (
            <button
              key={String(o.value)}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`tap press min-h-12 py-1.5 rounded-[4px] text-sm font-semibold leading-tight disabled:opacity-35 ${
                active ? "bg-paper text-ink" : "text-mute hover:text-paper"
              }`}
            >
              {o.label}
              {o.sub && <span className={`block font-mono text-[11px] font-medium ${active ? "text-mute-paper" : "text-mute/70"}`}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProgressBar({ pct, color = "#ffe927", track = "bg-ink-3", className = "h-2", label }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className={`${track} rounded-full overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

/** Galones: una insignia por nivel alcanzado. */
export function Galones({ level, onPaper = false }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nivel ${level} de ${RANKS.length}`} role="img">
      {RANKS.map((r) => (
        <CaretDoubleUp
          key={r.level}
          weight="bold"
          size={20}
          className={r.level <= level ? (onPaper ? "text-folder-purple" : "text-folder-yellow") : onPaper ? "text-paper-3" : "text-ink-4"}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Ilustraciones: carga public/illustrations/<name>.svg → .png → marcador
   --------------------------------------------------------------------- */
const EXTENSIONS = ["svg", "png", "webp"];

export function Illustration({ name, className = "", alt = "" }) {
  const meta = ILLUSTRATIONS[name] || { ratio: "square" };
  const [attempt, setAttempt] = useState(0);
  const aspect = meta.ratio === "wide" ? "aspect-[2/1]" : "aspect-square";

  if (attempt >= EXTENSIONS.length) {
    return (
      <div
        className={`${aspect} rounded-[4px] border-2 border-dashed border-paper-3 flex flex-col items-center justify-center gap-1 text-center px-2 ${className}`}
        role="img"
        aria-label={alt || `Ilustración pendiente: ${name}`}
      >
        <PencilSimpleLine size={22} weight="bold" className="text-mute-paper/70" />
        <span className="font-mono text-[10px] leading-tight text-mute-paper break-all">{name}</span>
      </div>
    );
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}illustrations/${name}.${EXTENSIONS[attempt]}`}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setAttempt((a) => a + 1)}
      className={`${aspect} object-contain ${className}`}
    />
  );
}

/* ---------------------------------------------------------------------
   Hoja inferior y avisos
   --------------------------------------------------------------------- */
export function Sheet({ title, illustration, body, actions, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center anim-fade" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <Paper className="relative w-full max-w-md rounded-b-none px-5 pt-4 pb-safe anim-sheet">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-paper-3" />
        <div className="flex items-start gap-4">
          {illustration && <Illustration name={illustration} className="w-24 shrink-0" />}
          <div className="min-w-0">
            <h3 className="display text-3xl">{title}</h3>
            <div className="mt-2 text-[15px] text-mute-paper leading-relaxed">{body}</div>
          </div>
        </div>
        <div className="mt-5 grid gap-2">{actions}</div>
      </Paper>
    </div>
  );
}

export function Toasts({ toasts }) {
  return (
    <div className="fixed left-4 right-4 toast-pos z-[60] flex flex-col items-center gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <Paper key={t.id} className="anim-toast w-full max-w-md px-3 py-3 flex items-center gap-3">
          <span className="w-11 h-11 rounded-[4px] flex items-center justify-center shrink-0 text-paper" style={{ background: t.color || "#581e70" }}>
            {t.icon}
          </span>
          <div className="min-w-0">
            <p className="label text-mute-paper">{t.kicker}</p>
            <p className="font-semibold truncate">{t.text}</p>
          </div>
        </Paper>
      ))}
    </div>
  );
}
