import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Game } from "@/data/games";
import { cn } from "@/lib/utils";

/** Small, shared presentation pieces used across every page. */

export function SectionHead({
  kicker,
  title,
  accent,
  copy,
  action,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  accent?: string;
  copy?: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2" style={accent ? { color: accent } : undefined}>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: accent ?? "#2ee6ff", boxShadow: `0 0 10px ${accent ?? "#2ee6ff"}` }}
          />
          {kicker}
        </p>
        <h2 className="mt-2.5 font-display text-[clamp(24px,4vw,40px)] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white">
          {title}
        </h2>
        {copy ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">{copy}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
        >
          {action.label}
          <Icon
            name="arrowRight"
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}

export function Difficulty({ level, compact }: { level: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" title={`Difficulty ${level}/5`}>
      <span className="sr-only">Difficulty {level} of 5</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn("rounded-full transition-colors", compact ? "h-1 w-2.5" : "h-1.5 w-3")}
          style={{
            background:
              i < level
                ? i >= 4
                  ? "#ff5470"
                  : i >= 3
                    ? "#ff8a3d"
                    : "#2ee6ff"
                : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </span>
  );
}

export function KindBadge({ game }: { game: Game }) {
  const original = game.kind === "original";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em]"
      style={{
        color: original ? "#04050c" : "#dbe4ff",
        background: original
          ? "linear-gradient(100deg,#4af2a1,#2ee6ff)"
          : "rgba(255,255,255,0.08)",
        border: original ? "none" : "1px solid rgba(255,255,255,0.16)",
      }}
    >
      {original ? "ORIGINAL" : "LIVE LINK"}
    </span>
  );
}

export function StatBlock({
  value,
  label,
  icon,
  accent = "#2ee6ff",
}: {
  value: string | number;
  label: string;
  icon?: IconName;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2">
        {icon ? <Icon name={icon} size={14} style={{ color: accent }} /> : null}
        <p className="font-display text-xl font-black leading-none text-white">{value}</p>
      </div>
      <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
        ◌
      </span>
      <p className="mt-4 font-display text-lg font-bold uppercase tracking-[0.06em] text-white">
        {title}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-white/45">{copy}</p>
      {action ? (
        <Link href={action.href} className="btn btn-ghost btn-sm mt-5">
          {action.label}
          <Icon name="arrowRight" size={13} />
        </Link>
      ) : null}
    </div>
  );
}

export function SectionDivider() {
  return <div className="section-divider my-16 md:my-24" aria-hidden />;
}
