import type { Game } from "@/data/games";
import type { WowState } from "./store";

/** Highest local score for a game, across any of its modes/levels. */
export function bestForGame(state: WowState, slug: string): number {
  let best = 0;
  for (const [key, value] of Object.entries(state.best)) {
    if ((key === slug || key.startsWith(`${slug}:`)) && value > best) best = value;
  }
  return best;
}

export function formatBest(game: Game, value: number): string {
  if (value <= 0) return "";
  if (game.slug === "geometry-rush") return `${value}%`;
  return String(value);
}

export function playsForGame(state: WowState, slug: string): number {
  return state.plays[slug] ?? 0;
}
