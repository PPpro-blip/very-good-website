"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { PLAY_ROUTE, type Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Compact cabinet tile — the dense end of the card family.
 * Used by the quick-launch grid and side rails where 8–12 games must be
 * scannable at once. Hover: artwork pushes in, a play chip appears, the border
 * lights up with the game's own palette.
 */
export function GameTile({ game, className }: { game: Game; className?: string }) {
  const [hover, setHover] = useState(false);
  const motion = useMotionEnabled();

  return (
    <Link
      href={PLAY_ROUTE(game.slug)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={() => audio.sfx("launch")}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070b16] transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_18px_40px_-24px_var(--g1)] focus-visible:-translate-y-0.5",
        className,
      )}
      style={{ "--g1": game.palette.from } as React.CSSProperties}
    >
      <span className="relative block aspect-[16/10] overflow-hidden">
        <span
          className={cn(
            "absolute inset-0 transition-transform duration-500 ease-out",
            hover && motion ? "scale-[1.07]" : "scale-100",
          )}
          aria-hidden
        >
          <GameArt game={game} />
        </span>
        <span className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent" aria-hidden />

        <span className="absolute left-1.5 top-1.5 flex items-center gap-1">
          {game.isNew ? (
            <span className="badge-new rounded-full px-1.5 py-[1px] font-mono text-[6.5px] font-black uppercase tracking-[0.12em]">
              New
            </span>
          ) : null}
          {game.featured ? (
            <span className="rounded-full border border-white/20 bg-black/55 px-1.5 py-[1px] font-mono text-[6.5px] font-bold uppercase tracking-[0.12em] text-white/70">
              {game.kind === "original" ? "Original" : "Featured"}
            </span>
          ) : null}
        </span>

        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-opacity duration-300",
            hover ? "opacity-100" : "opacity-0",
          )}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-[#04050c] shadow-lg"
            style={{ background: `linear-gradient(120deg, ${game.palette.from}, ${game.palette.to})` }}
          >
            <Icon name="play" size={13} />
          </span>
        </span>
      </span>

      <span className="flex items-center justify-between gap-2 px-2.5 py-2">
        <span className="truncate font-display text-[10.5px] font-bold uppercase tracking-[0.02em] text-white">
          {game.title}
        </span>
        <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.14em] text-white/35">
          {game.kind === "original" ? "original" : "hosted"}
        </span>
      </span>
    </Link>
  );
}
