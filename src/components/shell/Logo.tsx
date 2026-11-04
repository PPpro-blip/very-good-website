import Link from "next/link";

export function Emblem({ size = 42 }: { size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-[13px]"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(150deg, rgba(46,230,255,0.22), rgba(139,92,246,0.28))",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 22px -12px rgba(46,230,255,0.9)",
        border: "1px solid rgba(160,220,255,0.35)",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} fill="none">
        <defs>
          <linearGradient id="emblem-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dffbff" />
            <stop offset="55%" stopColor="#2ee6ff" />
            <stop offset="100%" stopColor="#c9a7ff" />
          </linearGradient>
        </defs>
        <path
          d="M5 8.5 9.6 23.5 16 13.2 22.4 23.5 27 8.5"
          stroke="url(#emblem-g)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="27" r="1.7" fill="#2ee6ff" />
      </svg>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-xl focus-visible:outline-offset-4"
      aria-label="WOW GAMES — home"
    >
      <span className="transition-transform duration-500 ease-spring group-hover:rotate-[-6deg] group-hover:scale-105">
        <Emblem size={compact ? 36 : 42} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[clamp(15px,2.4vw,19px)] font-black tracking-[0.14em] text-white">
          WOW<span className="arc-text">GAMES</span>
        </span>
        <span className="mt-1 font-mono text-[8px] font-semibold uppercase tracking-[0.34em] text-white/40 transition-colors group-hover:text-white/70">
          The Infinite Arcade
        </span>
      </span>
    </Link>
  );
}
