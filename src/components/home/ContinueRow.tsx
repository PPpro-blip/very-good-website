"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GameCard } from "@/components/games/GameCard";
import { getGame, PLAY_ROUTE } from "@/data/games";
import { useWowStore } from "@/lib/store";

/** "Pick up where you left off" — only appears once the player actually has history. */
export function ContinueRow() {
  const state = useWowStore();
  const recent = state.recent
    .map((r) => ({ ...r, game: getGame(r.slug) }))
    .filter((r): r is typeof r & { game: NonNullable<typeof r.game> } => Boolean(r.game))
    .slice(0, 4);

  const favourites = state.favorites
    .map(getGame)
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 6);

  if (recent.length === 0 && favourites.length === 0) return null;

  return (
    <section aria-labelledby="continue-title" className="shell mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: "#4af2a1" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-green align-middle" />
            Saved on this device
          </p>
          <h2
            id="continue-title"
            className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl"
          >
            Pick up where you left off
          </h2>
        </div>
        <Link
          href="/games"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 transition hover:text-white"
        >
          Full library →
        </Link>
      </div>

      <div className="rail mt-5 -mx-5 px-5 md:mx-0 md:px-0">
        {recent.map(({ game }) => (
          <div key={game.slug} className="w-[264px] shrink-0 sm:w-[288px]">
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {favourites.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="eyebrow">Favourites</span>
          {favourites.map((game) => (
            <Link key={game.slug} href={PLAY_ROUTE(game.slug)} className="chip chip-interactive">
              <Icon name="heart" size={10} className="text-arc-pink" />
              {game.title}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
