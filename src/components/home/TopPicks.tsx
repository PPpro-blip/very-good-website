"use client";

import Link from "next/link";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { GameArt } from "@/components/games/GameArt";
import { Icon } from "@/components/ui/Icon";
import { NEW_GAMES, PLAY_ROUTE, TRENDING_GAMES, type Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { useWowStore } from "@/lib/store";

/** Compact side rail next to the featured showcase: three picks + the wheel. */
export function TopPicks() {
  const { openRoulette } = useArcade();
  const state = useWowStore();

  const seen = new Set<string>();
  const picks: Game[] = [...NEW_GAMES, ...TRENDING_GAMES].filter((game) => {
    if (seen.has(game.slug)) return false;
    seen.add(game.slug);
    return true;
  }).slice(0, 3);

  return (
    <aside aria-labelledby="top-picks-title" className="flex h-full flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="top-picks-title"
          className="font-display text-[12px] font-black uppercase tracking-[0.14em] text-white"
        >
          Top picks
        </h2>
        <Link
          href="/games?filter=favorites"
          className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/35 transition hover:text-white"
        >
          Favourites ({state.favorites.length})
        </Link>
      </div>

      {picks.map((game) => (
        <Link
          key={game.slug}
          href={PLAY_ROUTE(game.slug)}
          onClick={() => audio.sfx("click")}
          className="group flex flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2 transition hover:border-white/25 hover:bg-white/[0.05]"
        >
          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <GameArt game={game} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[12px] font-bold uppercase leading-tight text-white">
              {game.title}
            </span>
            <span className="mt-0.5 block truncate text-[10.5px] text-white/40">{game.tagline}</span>
            <span className="mt-1 flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-[0.14em] text-white/30">
              {game.isNew ? <span className="badge-new rounded-full px-1.5 py-[1px] text-[6.5px] font-black">New</span> : null}
              {game.players}
            </span>
          </span>
          <Icon name="arrowRight" size={13} className="shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-arc-cyan" />
        </Link>
      ))}

      <button
        type="button"
        onClick={openRoulette}
        className="group relative flex items-center justify-between gap-2 overflow-hidden rounded-2xl border border-arc-violet/35 bg-arc-violet/[0.12] px-3 py-3 text-left transition hover:border-arc-violet/70 hover:bg-arc-violet/20"
      >
        <span>
          <span className="block font-display text-[11px] font-black uppercase tracking-[0.06em] text-white">
            Spin the wheel
          </span>
          <span className="mt-0.5 block text-[10px] text-white/45">Let the arcade choose for you</span>
        </span>
        <Icon name="flame" size={16} className="text-arc-violet transition group-hover:rotate-12 group-hover:scale-110" />
      </button>
    </aside>
  );
}
