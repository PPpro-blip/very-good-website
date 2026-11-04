import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Difficulty } from "@/components/ui/Bits";
import { GameArt } from "@/components/games/GameArt";
import { ORIGINAL_GAMES, PLAY_ROUTE } from "@/data/games";

export const metadata: Metadata = {
  title: "Original games",
  description:
    "Geometry Rush, Flappy Chaos, Brain Blast and Aurora Drift — four original games built from scratch with canvas, physics and Web Audio for WOW GAMES.",
};

const FEATURES: Record<string, string[]> = {
  "geometry-rush": [
    "Three handmade levels with their own colour identity and soundtrack",
    "Fixed-timestep physics: coyote time, jump buffering, hold-for-height",
    "Spikes, blocks, saws, bounce pads, coins and two checkpoints per level",
    "Death particles, screen shake, progress bar and per-level best scores",
  ],
  "flappy-chaos": [
    "One-tap flight with real wing physics and rotation",
    "Three parallax worlds that unlock as your best score climbs",
    "Gap and speed both tighten as you improve",
    "Instant restart, pause, local best and its own chiptune loop",
  ],
  "brain-blast": [
    "Six complete modes: math, memory, words, patterns, logic and speed",
    "Generated questions with difficulty that rises per round",
    "Separate personal best per mode, keyboard shortcuts throughout",
    "Streak scoring with a timer only where it adds tension",
  ],
  "aurora-drift": [
    "Paint ribbons of light with pointer, mouse or finger",
    "Three moods: Calm, Pulse and Prism — each with its own behaviour",
    "Optional generative chimes and a comfort-first still mode",
    "Nothing to win: a sensory toy you can leave running",
  ],
};

export default function CustomGamesPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow" style={{ color: "#4af2a1" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-green align-middle" />
            Original builds · written in this repository
          </p>
          <h1 className="mt-3 font-display text-[clamp(32px,6vw,58px)] font-black uppercase leading-[0.9] tracking-tight text-white">
            Made here.
            <br />
            <span className="arc-text">Not linked here.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
            Four games with custom physics, procedural artwork, synthesised sound and hand-tuned
            difficulty. No engines, no asset packs, no borrowed level designs — just canvas, maths
            and a lot of playtesting.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-auto">
          {[
            { value: "4", label: "Original games" },
            { value: "3", label: "Rush levels" },
            { value: "6", label: "Brain modes" },
            { value: "0", label: "Asset packs" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-center">
              <p className="font-display text-xl font-black leading-none text-white">{stat.value}</p>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {ORIGINAL_GAMES.map((game, index) => (
          <section key={game.slug} className="grid items-center gap-7 lg:grid-cols-2 lg:gap-10">
            <div className={index % 2 === 1 ? "lg:order-2" : ""}>
              <Link
                href={PLAY_ROUTE(game.slug)}
                className="group relative block overflow-hidden rounded-[28px] border border-white/12"
                style={{ boxShadow: `0 40px 110px -70px ${game.palette.from}` }}
              >
                <div className="screen scanlines vignette relative aspect-[16/10]">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <GameArt game={game} label={`WOW ORIGINAL · ${game.title}`} />
                  </div>
                  <span className="absolute left-3 top-3 z-[5] rounded-full border border-arc-green/40 bg-black/50 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-arc-green backdrop-blur">
                    Original build
                  </span>
                  <span className="absolute inset-0 z-[5] grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="grid h-16 w-16 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md">
                      <Icon name="play" size={22} />
                    </span>
                  </span>
                </div>
              </Link>
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/30">
                  {game.categories.join(" · ")}
                </p>
                <Difficulty level={game.difficulty} compact />
              </div>
            </div>

            <div className={index % 2 === 1 ? "lg:order-1" : ""}>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: game.palette.from }}>
                Cabinet {String(index + 1).padStart(2, "0")} · {game.badge ?? "Original"}
              </p>
              <h2 className="mt-2 font-display text-[clamp(26px,4.6vw,42px)] font-black uppercase leading-[0.95] tracking-tight text-white">
                {game.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{game.about}</p>

              <ul className="mt-4 space-y-2">
                {(FEATURES[game.slug] ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/60">
                    <span
                      className="mt-1.5 grid h-4 w-4 shrink-0 place-items-center rounded-full"
                      style={{ background: `${game.palette.from}22`, color: game.palette.from }}
                    >
                      <Icon name="check" size={10} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <span key={tag} className="chip !text-[8px]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href={PLAY_ROUTE(game.slug)} className="btn btn-primary">
                  <Icon name="play" size={14} /> <span>Play {game.title}</span>
                </Link>
                <Link href="/games" className="btn btn-ghost">
                  All cabinets
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow" style={{ color: "#2ee6ff" }}>
              Built to grow
            </p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">
              Adding cabinet #12
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Original games are registered, not hard-coded. Three small steps and a new game
              appears in the library, search, favourites, the player and the scoreboard.
            </p>
            <Link
              href="https://github.com/PPpro-blip/very-good-website"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm mt-4"
            >
              <Icon name="external" size={12} /> View the repository
            </Link>
          </div>
          <ol className="space-y-2.5">
            {[
              ["1", "Add metadata", "src/data/games.ts — title, palette, motif, controls, score label."],
              ["2", "Build the game", "A component that exposes restart() through a ref, using canvas + Web Audio."],
              ["3", "Register it", "src/games/registry.ts — one line. Everything else is automatic."],
            ].map(([step, title, copy]) => (
              <li key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-arc-cyan/15 font-mono text-[11px] font-bold text-arc-cyan">
                  {step}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="mt-0.5 break-words font-mono text-[10px] leading-relaxed text-white/40">
                    {copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
