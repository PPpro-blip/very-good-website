"use client";

import { useMemo } from "react";
import { GameShelf } from "@/components/games/GameShelf";
import {
  BRAIN_GAMES,
  GAMES,
  MULTIPLAYER_GAMES,
  NEW_GAMES,
  ORIGINAL_GAMES,
  POPULAR_GAMES,
  SENSORY_GAMES,
  TRENDING_GAMES,
} from "@/data/games";
import { useWowStore } from "@/lib/store";

/**
 * Discovery shelves.
 *
 * Every shelf has its own accent, card rhythm and copy so browsing feels like
 * walking past different rooms of an arcade rather than scrolling one grid.
 * "Most played" is honest about where the numbers come from: the visitor's own
 * launches on this device, topped up with a curated list.
 */
export function DiscoveryShelves() {
  const state = useWowStore();

  const mostPlayed = useMemo(() => {
    const played = GAMES.filter((game) => (state.plays[game.slug] ?? 0) > 0).sort(
      (a, b) => (state.plays[b.slug] ?? 0) - (state.plays[a.slug] ?? 0),
    );
    const merged = [
      ...played,
      ...POPULAR_GAMES.filter((game) => !played.some((p) => p.slug === game.slug)),
    ];
    return merged.slice(0, 8);
  }, [state.plays]);

  const hasOwnPlays = mostPlayed.some((game) => (state.plays[game.slug] ?? 0) > 0);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return [...NEW_GAMES, ...ORIGINAL_GAMES].filter((game) => {
      if (seen.has(game.slug)) return false;
      seen.add(game.slug);
      return true;
    });
  }, []);

  return (
    <div className="shell mt-12 space-y-12 md:mt-16 md:space-y-14">
      <GameShelf
        id="trending"
        kicker="Trending now"
        title="What the room is playing"
        copy="The cabinets with the queue in front of them — newest first, no filler."
        games={TRENDING_GAMES}
        accent="#2ee6ff"
        href="/games"
        actionLabel="All cabinets"
        cardWidth="w-[266px] sm:w-[300px]"
        variant="spotlight"
      />

      <GameShelf
        id="recent"
        kicker="Recently added"
        title="Fresh cabinets"
        copy="Newest additions to the universe, including the multiplayer flagship."
        games={recent}
        accent="#4af2a1"
        cardWidth="w-[236px] sm:w-[250px]"
      />

      <GameShelf
        id="most-played"
        kicker={hasOwnPlays ? "Your library" : "Arcade favourites"}
        title={hasOwnPlays ? "Your most played" : "Most played"}
        copy={
          hasOwnPlays
            ? "Counted from the launches saved in this browser — nobody else sees these numbers."
            : "The cabinets players reach for first. Your own launch counts will reorder this shelf."
        }
        games={mostPlayed}
        accent="#ffe066"
        cardWidth="w-[228px] sm:w-[242px]"
      />

      <GameShelf
        id="originals"
        kicker="Original builds"
        title="Written in this repo"
        copy="Canvas engines, hand-tuned physics and original chiptunes — hover a card to watch the real engine play itself."
        games={ORIGINAL_GAMES}
        accent="#8b5cf6"
        href="/custom"
        actionLabel="Original hub"
        cardWidth="w-[256px] sm:w-[276px]"
      />

      <GameShelf
        id="multiplayer"
        kicker="Multiplayer madness"
        title="Bring a rival"
        copy="Duels, tag rounds and one competitive FPS that runs on its own servers."
        games={MULTIPLAYER_GAMES}
        accent="#ff8a3d"
        href="/games?category=multiplayer"
        actionLabel="Multiplayer"
        cardWidth="w-[236px] sm:w-[252px]"
      />

      <GameShelf
        id="brain"
        kicker="Brain games"
        title="Think fast, score faster"
        copy="Six brain modes, a full study zone and a scoreboard that only you can see."
        games={BRAIN_GAMES}
        accent="#4af2a1"
        href="/study"
        actionLabel="Study zone"
        cardWidth="w-[236px] sm:w-[252px]"
      />

      <GameShelf
        id="sensory"
        kicker="Sensory experiences"
        title="The calm corner"
        copy="No timers, no losing. Light, sound and a companion that reacts to you."
        games={SENSORY_GAMES}
        accent="#ff3fd8"
        href="/sensory"
        actionLabel="Sensory room"
        cardWidth="w-[236px] sm:w-[252px]"
      />
    </div>
  );
}
