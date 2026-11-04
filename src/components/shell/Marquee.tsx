import { GAMES } from "@/data/games";

/** Infinite "arcade status" ticker under the hero. Pure CSS, pauses on hover. */
export function Marquee() {
  const items = [
    "NEW · GEOMETRY RUSH",
    "3 ORIGINAL BUILDS",
    "BRAIN BLAST · 6 GAMES",
    "STUDY ZONE OPEN",
    "AURORA DRIFT · SENSORY",
    "NO DOWNLOADS",
    "LOCAL HIGH SCORES",
    "11 CABINETS ONLINE",
  ];

  return (
    <div
      className="ticker-shell relative w-full overflow-hidden border-y border-white/10 bg-[#070a16]/60 py-3 backdrop-blur"
      aria-hidden="true"
    >
      <div className="ticker gap-8 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-8">
            {items.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45"
              >
                <span className="text-arc-cyan">◆</span>
                {item}
              </span>
            ))}
            <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              <span className="text-arc-magenta">◆</span>
              {GAMES.length} PLAYABLE
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#05060f] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#05060f] to-transparent" />
    </div>
  );
}
