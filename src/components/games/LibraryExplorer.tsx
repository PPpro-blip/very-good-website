"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/Bits";
import { GameCard } from "@/components/games/GameCard";
import { CATEGORIES, categoryMeta } from "@/data/categories";
import {
  GAMES,
  PLAY_ROUTE,
  SORTS,
  getGame,
  searchGames,
  sortGames,
  type CategoryId,
  type SortId,
} from "@/data/games";
import { audio } from "@/lib/audio";
import { useWowStore } from "@/lib/store";
import { cn, pickRandom } from "@/lib/utils";

type Filter = "all" | "featured" | "favorites" | "recent" | CategoryId;

export function LibraryExplorer() {
  const router = useRouter();
  const state = useWowStore();

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("curated");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  /**
   * Read the deep link (?category=…&filter=favorites&q=…) from the browser
   * instead of useSearchParams, so the full library is prerendered into the
   * static HTML (SEO + no-JS friendly) and the query is applied on hydration.
   */
  useEffect(() => {
    const apply = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      setFilter((category as Filter) ?? "all");
      setQuery(params.get("q") ?? "");
      setOnlyFavorites(params.get("filter") === "favorites");
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  const results = useMemo(() => {
    let list = searchGames(query);
    if (filter === "featured") list = list.filter((g) => g.featured);
    else if (filter !== "all") list = list.filter((g) => g.categories.includes(filter as CategoryId));
    if (onlyFavorites) list = list.filter((g) => state.favorites.includes(g.slug));
    return sortGames(list, sort);
  }, [query, filter, onlyFavorites, sort, state.favorites]);

  const recent = state.recent
    .map((r) => getGame(r.slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 4);

  const activeMeta =
    filter === "featured"
      ? categoryMeta("featured")
      : CATEGORIES.some((c) => c.id === filter)
        ? categoryMeta(filter as CategoryId)
        : null;

  const reset = () => {
    setFilter("all");
    setQuery("");
    setSort("curated");
    setOnlyFavorites(false);
    audio.sfx("click");
    if (typeof window !== "undefined") window.history.replaceState(null, "", "/games/");
  };

  return (
    <div className="shell py-10 md:py-14">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow" style={{ color: "#2ee6ff" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-cyan align-middle" />
            The vault · every cabinet, playable
          </p>
          <h1 className="mt-3 font-display text-[clamp(32px,6vw,58px)] font-black uppercase leading-[0.9] tracking-tight text-white">
            All games
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            {GAMES.length} cabinets online — {GAMES.filter((g) => g.kind === "original").length}{" "}
            written from scratch for WOW GAMES, {GAMES.filter((g) => g.kind === "external").length}{" "}
            hosted builds wrapped in a proper player. Filter, search, sort, then play.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const pick = pickRandom(GAMES);
              audio.sfx("launch");
              router.push(PLAY_ROUTE(pick.slug));
            }}
          >
            <Icon name="dice" size={14} /> <span>Surprise me</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            <Icon name="rotate" size={14} /> <span>Reset</span>
          </button>
        </div>
      </div>

      {/* search + sort */}
      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.035] px-4 py-3 focus-within:border-arc-cyan/50">
          <Icon name="search" size={17} className="text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, genres, vibes…"
            aria-label="Search games"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white"
              aria-label="Clear search"
            >
              <Icon name="close" size={12} />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort games
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="h-full rounded-2xl border border-white/12 bg-[#0b1020] px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70 focus:border-arc-cyan/50 focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setOnlyFavorites((v) => !v);
              audio.sfx("click");
            }}
            aria-pressed={onlyFavorites}
            className={cn(
              "flex h-full items-center gap-2 rounded-2xl border px-3.5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition",
              onlyFavorites
                ? "border-arc-pink/50 bg-arc-pink/15 text-arc-pink"
                : "border-white/12 bg-white/[0.035] text-white/60 hover:text-white",
            )}
          >
            <Icon name="heart" size={13} /> Favourites
          </button>
        </div>
      </div>

      {/* category chips */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setFilter("all")}
          data-active={filter === "all"}
          className="chip chip-interactive shrink-0"
        >
          All games
        </button>
        <button
          type="button"
          onClick={() => setFilter("featured")}
          data-active={filter === "featured"}
          className="chip chip-interactive shrink-0"
        >
          ★ Featured
        </button>
        {CATEGORIES.filter((c) => c.id !== "featured").map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFilter(category.id as CategoryId)}
            data-active={filter === category.id}
            className="chip chip-interactive shrink-0"
          >
            <span aria-hidden style={{ color: category.accent }}>
              {category.glyph}
            </span>
            {category.label}
          </button>
        ))}
      </div>

      {activeMeta ? (
        <div
          className="mt-2 flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: `${activeMeta.accent}33`,
            background: `${activeMeta.accent}0d`,
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: activeMeta.accent }}>
            {activeMeta.label}
          </p>
          <p className="text-[12px] text-white/45">{activeMeta.blurb}</p>
        </div>
      ) : null}

      {/* recent strip */}
      {recent.length > 0 && !query && filter === "all" ? (
        <div className="mt-5">
          <p className="eyebrow mb-2">Recently played</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((game) => (
              <Link key={game.slug} href={PLAY_ROUTE(game.slug)} className="chip chip-interactive">
                <Icon name="clock" size={10} /> {game.title}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* results */}
      <div className="mt-6 flex items-center justify-between">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/35">
          {results.length} {results.length === 1 ? "cabinet" : "cabinets"}
          {onlyFavorites ? " · favourites only" : ""}
          {query ? ` · “${query}”` : ""}
        </p>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/25">
          sorted by {SORTS.find((s) => s.id === sort)?.label ?? "curated"}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((game) => (
            <div key={game.slug} className="animate-[rise_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
              <GameCard game={game} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No cabinets match"
            copy={
              onlyFavorites
                ? "You haven't favourited anything with these filters yet. Tap the heart on any cabinet to save it here."
                : "Try a different search or clear the filters — the arcade is only eleven doors deep."
            }
            action={{ href: "/games", label: "Show everything" }}
          />
        </div>
      )}
    </div>
  );
}
