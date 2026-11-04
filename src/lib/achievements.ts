import type { WowState } from "./store";

export interface Achievement {
  id: string;
  label: string;
  detail: string;
  glyph: string;
  test: (state: WowState) => boolean;
}

/**
 * Achievements are *derived* from real local progress — nothing is faked.
 * If the stats don't back it up, the badge stays locked.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "coin",
    label: "Coin Inserted",
    detail: "Play your first cabinet",
    glyph: "◉",
    test: (s) => s.totalPlays >= 1,
  },
  {
    id: "regular",
    label: "Arcade Regular",
    detail: "Play 10 rounds",
    glyph: "▤",
    test: (s) => s.totalPlays >= 10,
  },
  {
    id: "curator",
    label: "The Curator",
    detail: "Favourite 3 games",
    glyph: "★",
    test: (s) => s.favorites.length >= 3,
  },
  {
    id: "tourist",
    label: "Cabinet Tourist",
    detail: "Try 5 different games",
    glyph: "⧉",
    test: (s) => Object.keys(s.plays).length >= 5,
  },
  {
    id: "rush",
    label: "Rush Hour",
    detail: "Reach 50% on any Geometry Rush level",
    glyph: "▲",
    test: (s) => ["1", "2", "3"].some((lvl) => (s.best[`geometry-rush:${lvl}`] ?? 0) >= 50),
  },
  {
    id: "sky",
    label: "Sky Legend",
    detail: "Score 20 in Flappy Chaos",
    glyph: "❋",
    test: (s) => (s.best["flappy-chaos"] ?? 0) >= 20,
  },
  {
    id: "brain",
    label: "Big Brain",
    detail: "Score 500 in any Brain Blast mode",
    glyph: "◆",
    test: (s) =>
      Object.entries(s.best).some(([key, v]) => key.startsWith("brain-blast") && v >= 500),
  },
  {
    id: "scholar",
    label: "Study Buddy",
    detail: "Earn 300 study points",
    glyph: "✎",
    test: (s) => s.studyPoints >= 300,
  },
  {
    id: "named",
    label: "Welcome, Player",
    detail: "Pick a nickname",
    glyph: "☺",
    test: (s) => s.nickname.trim().length > 0,
  },
];

export function earnedAchievements(state: WowState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.test(state));
}
