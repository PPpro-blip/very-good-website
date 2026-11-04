import type { CategoryId } from "./games";

export interface CategoryMeta {
  id: CategoryId | "featured";
  label: string;
  blurb: string;
  accent: string;
  accent2: string;
  glyph: string;
  /** featured is a curated view, not a real taxonomy value */
  curated?: boolean;
}

/**
 * Every category gets its own visual identity, so filtering the library
 * actually *feels* like walking to a different aisle of the arcade.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: "featured",
    label: "Featured",
    blurb: "The cabinets we push to the front of the room.",
    accent: "#2ee6ff",
    accent2: "#8b5cf6",
    glyph: "★",
    curated: true,
  },
  {
    id: "action",
    label: "Action",
    blurb: "Reflex-first, palms-sweaty games.",
    accent: "#ff5470",
    accent2: "#ff8a3d",
    glyph: "⚡",
  },
  {
    id: "multiplayer",
    label: "Multiplayer",
    blurb: "Cabinets with a second joystick.",
    accent: "#ffe066",
    accent2: "#ff8a3d",
    glyph: "⚔",
  },
  {
    id: "platformer",
    label: "Platformers",
    blurb: "Jump, land, learn the level.",
    accent: "#4af2a1",
    accent2: "#2ee6ff",
    glyph: "▲",
  },
  {
    id: "casual",
    label: "Casual",
    blurb: "Five-minute breathers. No pressure.",
    accent: "#2ee6ff",
    accent2: "#4af2a1",
    glyph: "◍",
  },
  {
    id: "experimental",
    label: "Experimental",
    blurb: "Strange little machines. Weird on purpose.",
    accent: "#ff3fd8",
    accent2: "#8b5cf6",
    glyph: "✳",
  },
  {
    id: "puzzle",
    label: "Puzzle",
    blurb: "Think first. Then think again.",
    accent: "#8b5cf6",
    accent2: "#4d7cff",
    glyph: "◆",
  },
  {
    id: "study",
    label: "Study Games",
    blurb: "Revision disguised as an arcade.",
    accent: "#4af2a1",
    accent2: "#ffe066",
    glyph: "✎",
  },
  {
    id: "sensory",
    label: "Sensory",
    blurb: "Quiet, tactile, no losing.",
    accent: "#7dd3fc",
    accent2: "#c4b5fd",
    glyph: "◌",
  },
  {
    id: "arcade",
    label: "Arcade Classics",
    blurb: "One button, infinite rage.",
    accent: "#ffe066",
    accent2: "#ff5470",
    glyph: "◇",
  },
];

export function categoryMeta(id: CategoryId | "featured"): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  action: "Action",
  multiplayer: "Multiplayer",
  platformer: "Platformer",
  casual: "Casual",
  experimental: "Experimental",
  puzzle: "Puzzle",
  study: "Study",
  sensory: "Sensory",
  arcade: "Arcade",
};
