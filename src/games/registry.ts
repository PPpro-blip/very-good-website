import type { ComponentType, Ref } from "react";
import { AuroraDrift } from "./sensory/AuroraDrift";
import { BrainBlast } from "./brain-blast/BrainBlast";
import { FlappyChaos } from "./flappy-chaos/FlappyChaos";
import { GeometryRush } from "./geometry-rush/GeometryRush";

/**
 * Original-game registry.
 *
 * To add a game:
 *  1. add metadata to src/data/games.ts
 *  2. build a component that exposes `restart` / `pause` through a ref
 *  3. register it here.
 * The player, library, search, favourites and scoreboard pick it up automatically.
 */
export interface CustomGameHandle {
  restart: () => void;
  pause?: () => void;
}

/** Every original game accepts an optional imperative handle ref. */
export type CustomGameComponent = ComponentType<{ ref?: Ref<CustomGameHandle> }>;

export const CUSTOM_GAMES: Record<string, CustomGameComponent> = {
  "geometry-rush": GeometryRush as unknown as CustomGameComponent,
  "flappy-chaos": FlappyChaos as unknown as CustomGameComponent,
  "brain-blast": BrainBlast as unknown as CustomGameComponent,
  "aurora-drift": AuroraDrift as unknown as CustomGameComponent,
};

export function hasCustomGame(slug: string): boolean {
  return slug in CUSTOM_GAMES;
}
