import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { SensorySettings } from "@/components/sensory/SensorySettings";
import { getGame, PLAY_ROUTE } from "@/data/games";

export const metadata: Metadata = {
  title: "Sensory room",
  description:
    "A calm corner of the arcade: AI Pet and Aurora Drift, with sound and motion controls. Nothing to win, nothing to lose.",
};

const CABINETS = [
  {
    slug: "aurora-drift",
    kicker: "Original · playable here",
    copy: "Paint ribbons of light with your pointer or finger. Three moods, optional generative chimes, and a still mode for comfort.",
    note: "Runs entirely in this browser, no embed needed.",
  },
  {
    slug: "ai-pet",
    kicker: "Hosted on CodeLab",
    copy: "A tiny digital companion that reacts to your touch. Wrapped in the WOW player with a direct-open fallback.",
    note: "Hosted build — if the embed is blocked, open it in its own tab.",
  },
];

export default function SensoryPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#08131f] via-[#0a0c1c] to-[#140a20] p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-[80px]"
          style={{ background: "radial-gradient(circle,#7dd3fc,transparent 65%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full opacity-35 blur-[80px]"
          style={{ background: "radial-gradient(circle,#c4b5fd,transparent 65%)" }}
        />
        <div className="relative max-w-2xl">
          <p className="eyebrow" style={{ color: "#c4b5fd" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#c4b5fd] align-middle" />
            Sensory room · no fail states
          </p>
          <h1 className="mt-3 font-display text-[clamp(32px,6vw,56px)] font-black uppercase leading-[0.9] tracking-tight text-white">
            A quiet corner
            <br />
            of the arcade
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Two cabinets designed to be fiddled with rather than beaten. Touch them, watch them,
            leave them running. Sound is optional, motion can be switched off, and nothing here can
            be lost.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {CABINETS.map((item) => {
            const game = getGame(item.slug)!;
            return (
              <Link
                key={item.slug}
                href={PLAY_ROUTE(game.slug)}
                className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[26px] border border-white/12 p-6"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <GameArt game={game} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#03040b] via-[#03040b]/60 to-transparent" />
                <div className="relative">
                  <span className="chip">{item.kicker}</span>
                  <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
                    {game.title}
                  </h2>
                  <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/60">{item.copy}</p>
                  <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/35">
                    {item.note}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition group-hover:bg-white/20">
                    <Icon name="play" size={12} /> Open cabinet
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="space-y-4">
          <SensorySettings />

          <div className="rounded-3xl border border-white/12 bg-white/[0.025] p-5">
            <p className="eyebrow">Why this exists</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
              Not every game needs a scoreboard. Sensory play is about feedback, rhythm and touch —
              useful for focus, decompression, or just wasting three lovely minutes. Both cabinets
              respect your reduced-motion preference.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["No timers", "Nothing counts down"],
                ["No fails", "Nothing to lose"],
                ["Touch ready", "Pointer, mouse, finger"],
                ["Optional audio", "Chimes are off-key friendly"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="text-[11.5px] font-semibold text-white">{title}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-white/12 p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
              More sensory cabinets coming
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/40">
              The registry is ready for more toys — particle gardens, breathing guides, soft physics
              puzzles. They will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
