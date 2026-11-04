import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Emblem } from "@/components/shell/Logo";
import { GAMES, ORIGINAL_GAMES, PLAY_ROUTE } from "@/data/games";

export const metadata: Metadata = {
  title: "About",
  description:
    "WOW GAMES is a solo-built arcade by Pratham Pandey: original canvas games, hosted builds, a Study Zone and a sensory room — with no accounts and no tracking.",
};

const STACK = [
  ["Framework", "Next.js 15 · App Router, statically exported"],
  ["Language", "TypeScript, strict mode"],
  ["Styling", "Tailwind CSS 3.4 + a small hand-written design system"],
  ["Games", "HTML5 Canvas 2D, fixed-timestep loops, zero game engines"],
  ["Audio", "Web Audio API — every sound synthesised at runtime"],
  ["State", "React state + a tiny localStorage store (no backend)"],
  ["Fonts", "Orbitron · Space Grotesk · JetBrains Mono (self-hosted)"],
  ["Hosting", "Netlify static build (`out/`), no environment variables"],
];

const SHORTCUTS = [
  ["⌘ / Ctrl + K", "Search the arcade"],
  ["/", "Search (outside a game)"],
  ["Space / ↑", "Jump or flap"],
  ["P / Esc", "Pause a game"],
  ["R", "Restart"],
  ["1 – 4", "Answer quiz options / memory pads"],
  ["Alt + M", "Mute everything"],
  ["Tab", "Move through every control"],
];

export default function AboutPage() {
  return (
    <div className="shell py-10 md:py-14">
      {/* hero / about me */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#0a1030] via-[#070b18] to-[#12081c] p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-40 blur-[80px]"
          style={{ background: "radial-gradient(circle,#2ee6ff,transparent 65%)" }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="eyebrow" style={{ color: "#2ee6ff" }}>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-cyan align-middle" />
              About the builder
            </p>
            <h1 className="mt-3 font-display text-[clamp(30px,5.4vw,52px)] font-black uppercase leading-[0.92] tracking-tight text-white">
              Hi, I&apos;m
              <br />
              <span className="arc-text">Pratham Pandey</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
              I&apos;m a student developer who likes building things that are more fun than they have
              any right to be. WOW GAMES started as a handful of browser games — a pet, a bomb tag,
              a game about a 404 page — and turned into this: a full arcade with its own physics
              engine, soundtrack and scoreboards.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">
              Every original game here was written from scratch for this project. The hosted games
              are mine too, originally built on Arena, CodeLab and GitHub Pages — WOW GAMES gives
              them a proper home with a real player around them.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/games" className="btn btn-primary">
                <Icon name="play" size={14} /> <span>Play the arcade</span>
              </Link>
              <Link
                href="https://github.com/PPpro-blip"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <Icon name="external" size={14} /> <span>GitHub</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-[#060a16]/85 p-5">
            <div className="flex items-center gap-3">
              <Emblem size={48} />
              <div>
                <p className="font-display text-sm font-black uppercase tracking-[0.1em] text-white">
                  The builder
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                  Solo project · 2026
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5">
              {[
                ["Games shipped", `${GAMES.length} in this arcade`],
                ["Original builds", "4 written from scratch"],
                ["Lines of game code", "Physics, audio, rendering"],
                ["Built for", "An academy showcase"],
                ["Accounts required", "None. Ever."],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-white/8 pb-2 last:border-0">
                  <dt className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/35">
                    {label}
                  </dt>
                  <dd className="text-right text-[11.5px] text-white/70">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-white/30">
              Progress lives in your browser only — no accounts, no tracking, no analytics.
            </p>
          </div>
        </div>
      </section>

      {/* the story */}
      <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <p className="eyebrow">The idea</p>
          <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">
            An arcade, not a
            <br />
            link list
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-white/50">
            Most &ldquo;game sites&rdquo; are eleven thumbnails pointing somewhere else. I wanted the
            opposite: a place where the games actually live, where the cards feel like cabinets you
            could put a coin into, and where the sound, the scores and the artwork are all part of
            one world.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/50">
            That meant writing real games — physics, collision, difficulty curves — and then giving
            the hosted ones a proper stage instead of pretending they were embedded when they
            weren&apos;t.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Real functionality",
              copy: "Every button does something. Every game is playable. Every score is tracked.",
              icon: "target" as const,
            },
            {
              title: "Original assets",
              copy: "Artwork, motifs and chiptunes are generated in code. No stock art, no borrowed music.",
              icon: "spark" as const,
            },
            {
              title: "Honest embeds",
              copy: "Hosted cabinets keep their original URL and always offer a direct-open fallback.",
              icon: "external" as const,
            },
            {
              title: "Built to extend",
              copy: "One registry file powers the library, search, favourites and player.",
              icon: "layers" as const,
            },
          ].map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Icon name={pillar.icon} size={17} className="text-arc-cyan" />
              <p className="mt-2.5 font-display text-[12.5px] font-bold uppercase tracking-[0.06em] text-white">
                {pillar.title}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it's built */}
      <section id="built" className="mt-14 scroll-mt-24">
        <p className="eyebrow" style={{ color: "#8b5cf6" }}>
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-violet align-middle" />
          How it&apos;s built
        </p>
        <h2 className="mt-2 font-display text-[clamp(26px,4.4vw,40px)] font-black uppercase leading-tight tracking-tight text-white">
          Under the cabinet
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left">
              <caption className="sr-only">Technology stack used by WOW GAMES</caption>
              <tbody>
                {STACK.map(([label, value]) => (
                  <tr key={label} className="border-b border-white/8 last:border-0">
                    <th
                      scope="row"
                      className="w-[38%] bg-white/[0.02] px-4 py-3 font-mono text-[8.5px] font-semibold uppercase tracking-[0.12em] text-white/35"
                    >
                      {label}
                    </th>
                    <td className="px-4 py-3 text-[12px] text-white/65">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Fixed-timestep game loops",
                copy: "Physics runs at 120Hz decoupled from rendering, so jumps feel identical at 60Hz or 144Hz. Each engine disposes its listeners, RAF handle and resize observer on unmount.",
              },
              {
                title: "Procedural everything",
                copy: "Poster artwork is deterministic SVG generated from each game's palette and motif. Music is a 16-step sequencer scheduling oscillators ahead of time. Total asset download: zero images, zero audio files.",
              },
              {
                title: "Performance discipline",
                copy: "Particles are capped, canvas DPR is clamped, background effects drop to 30fps and stop when the tab is hidden. Full respect for prefers-reduced-motion, plus an in-app still mode.",
              },
              {
                title: "No backend",
                copy: "The whole app is a static export. Favourites, recents and personal bests live in localStorage — which is why nothing is claimed to sync between devices.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.04em] text-white">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the games */}
      <section className="mt-14">
        <p className="eyebrow" style={{ color: "#4af2a1" }}>
          The collection
        </p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
          What&apos;s in the room
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={PLAY_ROUTE(game.slug)}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-3.5 py-3 transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-white">{game.title}</span>
                <span className="block truncate font-mono text-[8px] uppercase tracking-[0.12em] text-white/35">
                  {game.kind === "original" ? "Original build" : "Hosted build"} · {game.players}
                </span>
              </span>
              <Icon
                name="arrowUpRight"
                size={14}
                className="shrink-0 text-white/25 transition group-hover:text-arc-cyan"
              />
            </Link>
          ))}
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
          {ORIGINAL_GAMES.length} original · {GAMES.length - ORIGINAL_GAMES.length} hosted · all
          playable from this site
        </p>
      </section>

      {/* shortcuts */}
      <section className="mt-14 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <p className="eyebrow">Keyboard shortcuts</p>
          <ul className="mt-3 space-y-2">
            {SHORTCUTS.map(([keys, action]) => (
              <li key={keys} className="flex items-center justify-between gap-3 border-b border-white/8 pb-2 last:border-0">
                <span className="kbd shrink-0">{keys}</span>
                <span className="text-right text-[12px] text-white/55">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="privacy" className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <p className="eyebrow">Your data</p>
          <h3 className="mt-2 font-display text-lg font-black uppercase text-white">Nothing leaves this device</h3>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-white/50">
            {[
              "No accounts, no login, no email — there is nothing to sign up for.",
              "Nickname, favourites, recents and best scores are stored in your browser's localStorage.",
              "No analytics, no tracking pixels, no advertising scripts.",
              "Hosted games load in an iframe from their original host, which has its own privacy policy.",
              "Clearing site data resets everything — the profile panel has an explicit reset button.",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-green" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* contact / credits */}
      <section id="contact" className="mt-14 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Say hello</p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase text-white">
              Feedback makes it better
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/50">
              Found a bug, beat a level, or have an idea for cabinet #12? The repo and issues are
              open. Every score here is local, so screenshot your best — it&apos;s not going anywhere.
            </p>
            <a
              href="https://github.com/PPpro-blip"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm mt-4"
            >
              <Icon name="external" size={13} /> github.com/PPpro-blip
            </a>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-[11px] leading-relaxed text-white/40">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">Credits</p>
            <p className="mt-2">
              Fonts: Orbitron, Space Grotesk and JetBrains Mono via Fontsource (SIL Open Font
              License). Everything else — artwork, levels, music, sound effects, UI — was created
              for this project.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
