"use client";

import { GameArt } from "@/components/games/GameArt";
import { Icon } from "@/components/ui/Icon";
import type { Game } from "@/data/games";

/** Brief cinematic wipe shown while a cabinet boots. Purely a transition. */
export function LaunchCurtain({ game }: { game: Game | null }) {
  if (!game) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[98] grid place-items-center"
      aria-live="polite"
      aria-label={`Launching ${game.title}`}
    >
      <div className="absolute inset-0 animate-[fadeIn_160ms_ease-out] bg-[#02030a]/92 backdrop-blur-sm" />
      <div className="relative w-full max-w-xs px-6 text-center">
        <div
          className="mx-auto h-28 w-44 overflow-hidden rounded-2xl border border-white/15"
          style={{ boxShadow: `0 24px 70px -24px ${game.palette.from}` }}
        >
          <GameArt game={game} />
        </div>
        <p className="mt-4 font-mono text-[8.5px] uppercase tracking-[0.24em] text-arc-cyan">
          Now launching
        </p>
        <p className="mt-1 font-display text-lg font-black uppercase tracking-tight text-white">
          {game.title}
        </p>
        <div className="mx-auto mt-3 h-1 w-36 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-full origin-left animate-[launchBar_420ms_ease-out_forwards] rounded-full bg-gradient-to-r from-arc-cyan to-arc-violet" />
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">
          <Icon name="gamepad" size={9} /> {game.kind === "original" ? "runs in your browser" : "hosted cabinet"}
        </p>
      </div>
    </div>
  );
}
