import { useState } from "react";
import { ArrowCounterClockwise, Books, CaretDoubleUp, Cards, Fire, PencilSimpleLine, Scales, Star, Target, Timer } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { Toaster, toast } from "sonner";
import { ILLUSTRATIONS } from "./lib/illustrations.js";
import { RANKS, ROMAN } from "./lib/logic.js";

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
  ink: "bg-ink text-paper hover:bg-ink-2",
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

/**
 * Selector segmentado. El estado activo es una segunda capa idéntica recortada con clip-path:
 * al cambiar, el recorte se desliza y el color cambia justo en el borde (técnica de Emil Kowalski).
 * Es CSS puro: va en el hilo del compositor y se puede interrumpir a mitad.
 */
export function Segmented({ label, options, value, onChange, disabledValues = [], hideLabel = false }) {
  const n = options.length;
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cell = (o, active) => (
    <>
      {o.label}
      {o.sub && <span className={`block font-mono text-[11px] font-medium ${active ? "text-mute-paper" : "text-mute"}`}>{o.sub}</span>}
    </>
  );
  return (
    <fieldset>
      <legend className={hideLabel ? "sr-only" : "label text-mute mb-2"}>{label}</legend>
      <div className="relative rounded-folder bg-ink-2 border border-ink-3 p-1">
        <div className="grid gap-1" style={cols}>
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              disabled={disabledValues.includes(o.value)}
              aria-pressed={o.value === value}
              onClick={() => onChange(o.value)}
              className="tap press min-h-12 py-1.5 rounded-[4px] text-sm font-semibold leading-tight text-mute hover:text-paper disabled:opacity-35"
            >
              {cell(o, false)}
            </button>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-1 grid gap-1 pointer-events-none transition-[clip-path] duration-[250ms] ease-in-out"
          style={{ ...cols, clipPath: `inset(0 ${((n - 1 - index) / n) * 100}% 0 ${(index / n) * 100}% round 4px)` }}
        >
          {options.map((o) => (
            <div key={String(o.value)} className="min-h-12 py-1.5 rounded-[4px] bg-paper text-ink text-sm font-semibold leading-tight flex flex-col items-center justify-center text-center">
              {cell(o, true)}
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

/** Barra de progreso animada con transform (scaleX), no con width: no recalcula el layout. */
export function ProgressBar({ pct, color = "#ffe927", track = "bg-ink-3", className = "h-2", label }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className={`${track} rounded-full overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div
        className="h-full w-full rounded-full origin-left transition-transform duration-500 ease-out"
        style={{ transform: `scaleX(${v / 100})`, background: color }}
      />
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
   Distintivo de medalla por niveles: carpeta del color de la familia con su icono y el nivel.
   --------------------------------------------------------------------- */
const MEDAL_ICONS = { fire: Fire, target: Target, books: Books, timer: Timer, repeat: ArrowCounterClockwise, star: Star, scales: Scales, cards: Cards };

export function MedalBadge({ family, level, size = 64 }) {
  const Icon = MEDAL_ICONS[family.icon];
  const locked = level === 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`w-full h-full rounded-folder flex items-center justify-center ${locked ? "bg-ink-3 text-ink-4" : family.dark === false ? "text-ink" : "text-paper"}`}
        style={locked ? undefined : { background: family.color }}
      >
        <Icon size={size * 0.52} weight="fill" />
      </div>
      {!locked && (
        <span
          className="absolute -bottom-1.5 -right-1.5 min-w-[28px] h-7 px-1.5 rounded-full bg-paper text-ink border-2 border-ink font-mono text-xs font-semibold flex items-center justify-center"
          aria-label={`Nivel ${level}`}
        >
          {ROMAN[level]}
        </span>
      )}
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
  const aspect = meta.ratio === "wide" ? "aspect-video" : "aspect-square";

  if (attempt >= EXTENSIONS.length) {
    return (
      <div
        className={`${aspect} rounded-[4px] border-2 border-dashed border-paper-3 flex flex-col items-center justify-center gap-1 text-center px-2 ${className}`}
        role="img"
        aria-label={alt || `Ilustración pendiente: ${name}`}
      >
        <PencilSimpleLine size={22} weight="bold" className="text-mute-paper" />
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
/**
 * Hoja inferior con Vaul (librería de Emil Kowalski): se cierra arrastrando hacia abajo,
 * con inercia (un gesto rápido basta) y la curva de cajón de iOS. Siempre montada: `open` la abre y cierra.
 */
export function Sheet({ open, title, illustration, body, actions, onClose }) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md outline-none">
          <Paper className="rounded-b-none px-5 pt-3 pb-safe">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-paper-3" aria-hidden="true" />
            <div className="flex items-start gap-4">
              {illustration && <Illustration name={illustration} className="w-24 shrink-0" />}
              <div className="min-w-0">
                <Drawer.Title className="display text-3xl">{title}</Drawer.Title>
                <Drawer.Description asChild>
                  <div className="mt-2 text-[15px] text-mute-paper leading-relaxed">{body}</div>
                </Drawer.Description>
              </div>
            </div>
            <div className="mt-5 grid gap-2">{actions}</div>
          </Paper>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Avisos con Sonner (también de Emil): entran y salen por arriba y se descartan deslizando. */
export function AppToaster() {
  const top = "calc(env(safe-area-inset-top, 0px) + 12px)";
  return <Toaster position="top-center" offset={{ top }} mobileOffset={{ top, left: 16, right: 16 }} gap={8} />;
}

export function notify({ icon, color = "#581e70", kicker, text, duration = 3800 }) {
  toast.custom(
    () => (
      <Paper className="w-full px-3 py-3 flex items-center gap-3">
        <span className="w-11 h-11 rounded-[4px] flex items-center justify-center shrink-0 text-paper" style={{ background: color }}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="label text-mute-paper">{kicker}</p>
          <p className="font-semibold truncate">{text}</p>
        </div>
      </Paper>
    ),
    { duration }
  );
}
