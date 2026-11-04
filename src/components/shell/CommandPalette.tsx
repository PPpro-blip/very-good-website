"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { GameArt } from "@/components/games/GameArt";
import { GAMES, PLAY_ROUTE, searchGames } from "@/data/games";
import { audio } from "@/lib/audio";
import { useLockBodyScroll } from "@/lib/hooks";
import { cn, pickRandom } from "@/lib/utils";

const QUICK = [
  { href: "/games", label: "Browse the library", icon: "grid" as const },
  { href: "/custom", label: "Original WOW builds", icon: "spark" as const },
  { href: "/study", label: "Study Zone", icon: "book" as const },
  { href: "/sensory", label: "Sensory room", icon: "wave" as const },
];

export function CommandPalette() {
  const { searchOpen, closeSearch } = useArcade();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [randomPick, setRandomPick] = useState(GAMES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useLockBodyScroll(searchOpen);

  const results = useMemo(() => {
    const found = searchGames(query);
    return found.slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery("");
    setCursor(0);
    setRandomPick(pickRandom(GAMES));
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!searchOpen) return null;

  const go = (href: string) => {
    audio.sfx("launch");
    closeSearch();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const pick = results[cursor] ?? results[0];
      if (pick) go(PLAY_ROUTE(pick.slug));
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-[#02030a]/80 backdrop-blur-md"
        onClick={closeSearch}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the arcade"
        className="animate-pop relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/12 bg-[#070a16]/95 shadow-[0_40px_120px_-40px_#000]"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Icon name="search" size={18} className="text-arc-cyan" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search games, genres, vibes…"
            aria-label="Search games"
            className="w-full bg-transparent font-sans text-[15px] text-white placeholder:text-white/30 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={closeSearch} className="kbd" aria-label="Close search">
            ESC
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <>
              <p className="eyebrow px-3 py-2">Games</p>
              <ul role="listbox" aria-label="Game results">
                {results.map((game, i) => (
                  <li key={game.slug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === cursor}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(PLAY_ROUTE(game.slug))}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                        i === cursor ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                      )}
                    >
                      <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10">
                        <GameArt game={game} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-white">
                            {game.title}
                          </span>
                          <span className="chip !px-1.5 !py-0.5 !text-[8px]">
                            {game.kind === "original" ? "ORIGINAL" : "LINK"}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-white/45">{game.tagline}</span>
                      </span>
                      <Icon name="arrowRight" size={15} className="text-white/25" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                No cabinet found
              </p>
              <p className="mt-1 text-sm text-white/40">
                Nothing matches “{query}”. Try “neon”, “brain” or “arcade”.
              </p>
            </div>
          )}

          {!query ? (
            <>
              <p className="eyebrow px-3 pb-2 pt-4">Jump to</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {QUICK.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon name={item.icon} size={15} className="text-arc-cyan/80" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(PLAY_ROUTE(randomPick.slug))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon name="dice" size={15} className="text-arc-violet" />
                  Surprise me → {randomPick.title}
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
            <span className="flex items-center gap-1">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span> navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="kbd">↵</span> play
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
            {GAMES.length} cabinets online
          </span>
        </div>
      </div>
    </div>
  );
}
