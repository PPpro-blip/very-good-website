"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { Difficulty } from "@/components/ui/Bits";
import { FPS_GAMES, PLAY_ROUTE } from "@/data/games";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";

/**
 * FPS-GODS flagship section.
 *
 * Deliberately a different visual world from the neon arcade: black tactical
 * panels, electric-blue crosshair light, tight uppercase type. FPS-GODS is a
 * separate application — this section launches it, it never pretends to be it.
 */
export function FpsZone() {
  const game = FPS_GAMES[0];
  const motion = useMotionEnabled();
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  if (!game) return null;

  return (
    <section aria-labelledby="fps-zone-title" className="shell mt-20">
      <div
        className="relative overflow-hidden rounded-[32px] border border-white/10"
        style={{ background: "linear-gradient(160deg,#05070d 0%,#070c18 45%,#04060c 100%)" }}
        onPointerMove={(event) => {
          if (!motion) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          });
        }}
      >
        {/* artwork + tactical light */}
        <div className="absolute inset-0 opacity-70" aria-hidden>
          <GameArt game={game} />
        </div>
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          aria-hidden
          style={{
            background: `radial-gradient(520px circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(59,130,246,0.22), transparent 62%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(90deg,#04060c 4%,rgba(4,6,12,0.92) 42%,rgba(4,6,12,0.35) 100%)",
          }}
        />
        <div className="absolute inset-0 scanlines opacity-25" aria-hidden />

        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-arc-blue/50 bg-arc-blue/15 px-2.5 py-1 font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-arc-cyan">
                <Icon name="flame" size={10} /> FPS Zone
              </span>
              <span className="badge-new rounded-full px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.16em]">
                New
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                {game.players}
              </span>
            </div>

            <h2
              id="fps-zone-title"
              className="mt-4 font-display text-[clamp(38px,7vw,74px)] font-black uppercase leading-[0.86] tracking-[-0.02em] text-white"
              style={{ textShadow: "0 0 40px rgba(59,130,246,0.45)" }}
            >
              FPS<span className="text-arc-cyan">-</span>GODS
            </h2>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.42em] text-arc-cyan/80">
              Your arena. Your rules.
            </p>

            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-white/60">
              {game.description} A competitive multiplayer shooter built and hosted by our own team —
              WOW GAMES is the launcher, never a copy: your matches, your account and your servers are
              exactly the official ones.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {["Online multiplayer", "Tactical arenas", "Hosted by FPS-GODS"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/50"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/50">
                <Difficulty level={game.difficulty} compact /> {game.difficulty}/5
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={PLAY_ROUTE(game.slug)}
                onClick={() => audio.sfx("launch")}
                className="btn btn-primary !px-6"
                style={{ background: "linear-gradient(100deg,#2563eb,#22d3ee)" }}
              >
                <Icon name="play" size={14} /> <span>Play FPS-GODS</span>
              </Link>
              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audio.sfx("launch")}
                className="btn btn-ghost"
              >
                <Icon name="external" size={13} /> Official site
              </a>
            </div>
          </div>

          {/* tactical match card — no invented stats, only facts we know */}
          <div className="flex flex-col justify-end">
            <div className="rounded-2xl border border-white/10 bg-[#060a14]/85 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-white/40">
                  Cabinet dossier
                </p>
                <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.14em] text-arc-green">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arc-green" /> live app
                </span>
              </div>
              <dl className="mt-3 space-y-2.5">
                {[
                  ["Studio", "WOW GAMES · original project"],
                  ["Host", "fps-gods.vercel.app"],
                  ["Mode", "Online multiplayer"],
                  ["Launch", "Opens inside the WOW player"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-2 last:border-0 last:pb-0">
                    <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">
                      {label}
                    </dt>
                    <dd className="text-right text-[11.5px] text-white/75">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[10.5px] leading-relaxed text-white/35">
                Independent app: sign-in, lobbies and matchmaking stay inside FPS-GODS. If its host
                blocks framing, the player gives you a one-click official launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
