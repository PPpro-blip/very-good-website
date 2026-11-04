"use client";

import Link from "next/link";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { GameTile } from "@/components/games/GameTile";
import { Icon } from "@/components/ui/Icon";
import { GAMES, TRENDING_GAMES } from "@/data/games";

/**
 * The first thing under the hero: twelve cabinets, zero scrolling.
 * Trending order first, then the rest of the registry — every tile is a real,
 * playable destination pulled straight from the game registry.
 */
export function QuickLaunch() {
  const { openRoulette } = useArcade();

  const ordered = [
    ...TRENDING_GAMES,
    ...GAMES.filter((game) => !TRENDING_GAMES.some((t) => t.slug === game.slug)),
  ];

  return (
    <section aria-labelledby="quick-title" className="shell mt-5 md:mt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: "#2ee6ff" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-cyan align-middle" />
            Jump straight in
          </p>
          <h2
            id="quick-title"
            className="mt-1.5 font-display text-[clamp(17px,2.3vw,23px)] font-black uppercase leading-none tracking-tight text-white"
          >
            {GAMES.length} cabinets · one click each
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={openRoulette} className="btn btn-ghost btn-sm">
            <Icon name="flame" size={12} /> Surprise me
          </button>
          <Link
            href="/games"
            className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
          >
            All games <Icon name="arrowRight" size={12} />
          </Link>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {ordered.map((game) => (
          <GameTile key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
