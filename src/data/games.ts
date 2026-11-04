/**
 * WOW GAMES — game registry.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for the arcade.
 * Adding a game = adding one object here (and, for original games, one entry in
 * src/games/registry.ts). Navigation, library filters, search, favourites,
 * recently-played, the player page and the homepage rails all read from this file —
 * no other code needs to change.
 */

export type CategoryId =
  | "action"
  | "multiplayer"
  | "platformer"
  | "casual"
  | "experimental"
  | "puzzle"
  | "study"
  | "sensory"
  | "arcade";

export type MotifId =
  | "arena"
  | "clock"
  | "bomb"
  | "stairs"
  | "eyes"
  | "glitch"
  | "pet"
  | "runner"
  | "wing"
  | "brain"
  | "aurora";

export type GameKind = "original" | "external";

export interface Game {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** longer copy for the player page */
  about: string;
  kind: GameKind;
  /** external builds keep their original URL, untouched */
  url?: string;
  categories: CategoryId[];
  tags: string[];
  palette: { from: string; to: string };
  motif: MotifId;
  featured: boolean;
  featuredBlurb?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  players: string;
  released: string;
  badge?: string;
  /** player-page control legend */
  controls: string[];
  /** whether the game keeps a best score locally */
  scoreLabel?: string;
  /** how likely the external host allows embedding — shown honestly in the UI */
  embedHint?: "likely" | "unknown";
  year: number;
}

export const GAMES: Game[] = [
  {
    slug: "arena-game",
    title: "Arena Game",
    tagline: "The flagship bout",
    description:
      "Step into the arena and survive the round. Fast, punchy and built for one more attempt.",
    about:
      "The original WOW build that started it all. Arena Game is a live, hosted battle-of-attrition — jump in, learn the rhythm of the arena and see how long you last. Runs on its own hosting, launched straight from the WOW GAMES player.",
    kind: "external",
    url: "https://01a18da3-cc80-7839-8353-aa68525263f2.arena.site/",
    categories: ["action", "multiplayer", "arcade"],
    tags: ["arena", "survival", "flagship"],
    palette: { from: "#2ee6ff", to: "#4d7cff" },
    motif: "arena",
    featured: true,
    featuredBlurb: "The bout that started the arcade.",
    difficulty: 3,
    players: "1–2 players",
    released: "2025",
    badge: "FLAGSHIP",
    controls: ["Mouse / touch", "Keyboard"],
    embedHint: "likely",
    year: 2025,
  },
  {
    slug: "timepass",
    title: "Timepass",
    tagline: "A cabinet of curiosities",
    description:
      "A pocket-sized bundle of quick, weird, replayable amusements. Perfect for a five-minute break.",
    about:
      "Timepass is a tiny, lovingly-built collection of diversions: poke at it, tap around and see what happens. Built as a CodeLab original and playable straight from the arcade.",
    kind: "external",
    url: "https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-timepass",
    categories: ["casual", "arcade", "experimental"],
    tags: ["quick", "collection", "chill"],
    palette: { from: "#ffe066", to: "#ff8a3d" },
    motif: "clock",
    featured: false,
    difficulty: 2,
    players: "1 player",
    released: "2025",
    controls: ["Mouse / touch"],
    embedHint: "unknown",
    year: 2025,
  },
  {
    slug: "tnt-tag",
    title: "TNT Tag",
    tagline: "Run. Tag. Boom.",
    description:
      "A hot-potato of a game: pass the charge before the timer runs out. Nerves required.",
    about:
      "TNT Tag turns tag into a countdown. Keep moving, pass the bomb, and don't be holding it when the fuse dies. A CodeLab original, launched externally from the WOW GAMES player.",
    kind: "external",
    url: "https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-tnt-tag",
    categories: ["action", "multiplayer", "arcade"],
    tags: ["bomb", "tag", "timer"],
    palette: { from: "#ff8a3d", to: "#ff3fd8" },
    motif: "bomb",
    featured: false,
    difficulty: 4,
    players: "2+ players",
    released: "2025",
    controls: ["Mouse / touch", "Keyboard"],
    embedHint: "unknown",
    year: 2025,
  },
  {
    slug: "level-not-devil",
    title: "Level Not Devil",
    tagline: "Deceptively cruel levels",
    description:
      "A GitHub Pages platformer that punishes confidence. Every level is harder than it looks.",
    about:
      "Level Not Devil is a precision platformer hosted on GitHub Pages. The name is a warning: the levels are trickier than they appear. Loaded inside the WOW player, with a direct-open fallback.",
    kind: "external",
    url: "https://pppro-blip.github.io/Level-not-Devil/",
    categories: ["platformer", "puzzle", "arcade"],
    tags: ["precision", "levels", "hard"],
    palette: { from: "#8b5cf6", to: "#2ee6ff" },
    motif: "stairs",
    featured: false,
    difficulty: 5,
    players: "1 player",
    released: "2025",
    controls: ["Arrow keys / WASD", "Mouse / touch"],
    embedHint: "likely",
    year: 2025,
  },
  {
    slug: "hide-and-seek-haha",
    title: "Hide & Seek Haha",
    tagline: "Peekaboo, but stressful",
    description:
      "Hide, sneak and giggle. A playful chase game where being spotted is the whole joke.",
    about:
      "Hide & Seek Haha is a light-hearted take on hide-and-seek: find the spots, stay out of sight, and enjoy the chaos when you get caught. CodeLab original, launched inside the WOW player.",
    kind: "external",
    url: "https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-hide-ad-seek-haha",
    categories: ["casual", "experimental", "multiplayer"],
    tags: ["hide", "chase", "playful"],
    palette: { from: "#4af2a1", to: "#2ee6ff" },
    motif: "eyes",
    featured: false,
    difficulty: 2,
    players: "1–2 players",
    released: "2025",
    controls: ["Mouse / touch", "Arrow keys"],
    embedHint: "unknown",
    year: 2025,
  },
  {
    slug: "error-404",
    title: "Error 404",
    tagline: "The game that isn't there",
    description:
      "A glitch-poetry experiment. Something has gone wrong with reality, and you are inside it.",
    about:
      "Error 404 is an experimental build that turns a broken page into a playground. Strange, glitchy and unlike the rest of the arcade — hosted on CodeLab, launched from the WOW player.",
    kind: "external",
    url: "https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-erorr-404",
    categories: ["experimental", "puzzle", "casual"],
    tags: ["glitch", "weird", "art"],
    palette: { from: "#ff3fd8", to: "#8b5cf6" },
    motif: "glitch",
    featured: false,
    badge: "STRANGE",
    difficulty: 2,
    players: "1 player",
    released: "2025",
    controls: ["Mouse / touch", "Keyboard"],
    embedHint: "unknown",
    year: 2025,
  },
  {
    slug: "ai-pet",
    title: "AI Pet",
    tagline: "Your tiny digital companion",
    description:
      "Feed it, poke it, watch it react. A calming sensory toy that lives in a browser tab.",
    about:
      "AI Pet is a sensory companion: gentle reactions, soft animation, no way to lose. Ideal when you want something to fiddle with rather than fight. CodeLab original, with a dedicated Sensory Zone home inside WOW GAMES.",
    kind: "external",
    url: "https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-ai-pet",
    categories: ["sensory", "casual"],
    tags: ["calm", "pet", "toy"],
    palette: { from: "#4af2a1", to: "#8b5cf6" },
    motif: "pet",
    featured: true,
    featuredBlurb: "The calm corner of the arcade.",
    difficulty: 1,
    players: "1 player",
    released: "2025",
    controls: ["Mouse / touch"],
    embedHint: "unknown",
    year: 2025,
  },

  /* ---------- ORIGINAL WOW GAMES BUILDS ---------- */

  {
    slug: "geometry-rush",
    title: "Geometry Rush",
    tagline: "One button. Perfect timing.",
    description:
      "A neon one-button rhythm platformer built from scratch: three handmade levels, spikes, checkpoints and a soundtrack that reacts to you.",
    about:
      "Geometry Rush is WOW GAMES' flagship original build: a hard-coded, 60fps canvas runner with three original levels, coyote-time jumping, checkpoint respawns, a perfectly-timed original chiptune soundtrack and a scoring system that rewards clean runs. Every level, visual and note was generated in code — no borrowed artwork, music or level layouts.",
    kind: "original",
    categories: ["platformer", "arcade", "action"],
    tags: ["rhythm", "one-button", "neon", "hard"],
    palette: { from: "#2ee6ff", to: "#4d7cff" },
    motif: "runner",
    featured: true,
    featuredBlurb: "Original build. Original music. Zero mercy.",
    difficulty: 4,
    players: "1 player",
    released: "2026",
    badge: "ORIGINAL",
    controls: [
      "Space / W / ↑ / click / tap — jump (hold for a higher arc)",
      "P or Esc — pause",
      "R — restart level",
      "M — mute",
    ],
    scoreLabel: "Best progress",
    year: 2026,
  },
  {
    slug: "flappy-chaos",
    title: "Flappy Chaos",
    tagline: "Gravity is the villain",
    description:
      "A one-tap flyer with hand-built parallax worlds, unlockable themes and an obsession-forming best score.",
    about:
      "Flappy Chaos takes the one-button flyer and builds a whole world around it: animated parallax skies, a custom character with real wing physics, particle bursts, three unlockable visual themes and difficulty that ramps as your score climbs. Written from scratch for WOW GAMES.",
    kind: "original",
    categories: ["arcade", "casual", "action"],
    tags: ["one-tap", "endless", "parallax"],
    palette: { from: "#ffe066", to: "#ff3fd8" },
    motif: "wing",
    featured: true,
    featuredBlurb: "Just one more run. We both know how this ends.",
    difficulty: 3,
    players: "1 player",
    released: "2026",
    badge: "ORIGINAL",
    controls: [
      "Space / click / tap — flap",
      "P or Esc — pause",
      "R — instant restart",
      "M — mute",
    ],
    scoreLabel: "Best score",
    year: 2026,
  },
  {
    slug: "brain-blast",
    title: "Brain Blast",
    tagline: "Six games. One brain.",
    description:
      "Six complete mini-games — Quick Math, Memory Master, Word Wizard, Pattern Detective, Logic Lab and Speed Quiz.",
    about:
      "Brain Blast is a hub of six fully playable brain games, each with its own scoring, timers, difficulty curve and replay loop. Every question is generated or drawn from an original, age-appropriate question bank written for this project.",
    kind: "original",
    categories: ["puzzle", "study", "casual"],
    tags: ["brain", "quiz", "memory", "words"],
    palette: { from: "#8b5cf6", to: "#4af2a1" },
    motif: "brain",
    featured: true,
    featuredBlurb: "Study that feels like an arcade.",
    difficulty: 2,
    players: "1 player",
    released: "2026",
    badge: "ORIGINAL",
    controls: ["Mouse / touch", "1–4 keys to answer", "Esc — back to hub"],
    scoreLabel: "Best score",
    year: 2026,
  },
  {
    slug: "aurora-drift",
    title: "Aurora Drift",
    tagline: "Touch the sky",
    description:
      "A wordless sensory toy: paint ribbons of light with your pointer, in three moods, with optional sound.",
    about:
      "Aurora Drift is the WOW GAMES sensory playground. Move your pointer or finger to paint light that follows you, switch between Calm, Pulse and Prism moods, and turn on generative chimes if you want them. Nothing to win, nothing to lose — built with a reduced-motion switch for comfort.",
    kind: "original",
    categories: ["sensory", "experimental", "casual"],
    tags: ["calm", "interactive", "lights", "audio"],
    palette: { from: "#2ee6ff", to: "#ff3fd8" },
    motif: "aurora",
    featured: false,
    difficulty: 1,
    players: "1 player",
    released: "2026",
    badge: "ORIGINAL",
    controls: ["Move pointer / drag — paint light", "1 / 2 / 3 — switch mood", "C — clear"],
    year: 2026,
  },
];

export const FEATURED_GAMES = GAMES.filter((g) => g.featured);
export const ORIGINAL_GAMES = GAMES.filter((g) => g.kind === "original");
export const EXTERNAL_GAMES = GAMES.filter((g) => g.kind === "external");

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function getGameOrThrow(slug: string): Game {
  const game = getGame(slug);
  if (!game) throw new Error(`Unknown game slug: ${slug}`);
  return game;
}

export function gamesByCategory(category: CategoryId): Game[] {
  return GAMES.filter((g) => g.categories.includes(category));
}

export function searchGames(query: string): Game[] {
  const q = query.trim().toLowerCase();
  if (!q) return GAMES;
  return GAMES.filter((g) =>
    [g.title, g.tagline, g.description, g.tags.join(" "), g.categories.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export type SortId = "curated" | "az" | "za" | "difficulty" | "newest";

export const SORTS: { id: SortId; label: string }[] = [
  { id: "curated", label: "Curated" },
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
  { id: "difficulty", label: "Easiest" },
  { id: "newest", label: "Newest" },
];

export function sortGames(games: Game[], sort: SortId): Game[] {
  const list = [...games];
  switch (sort) {
    case "az":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return list.sort((a, b) => b.title.localeCompare(a.title));
    case "difficulty":
      return list.sort((a, b) => a.difficulty - b.difficulty);
    case "newest":
      return list.sort((a, b) => b.year - a.year);
    case "curated":
    default:
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.kind === "original") - Number(a.kind === "original"),
      );
  }
}

export const PLAY_ROUTE = (slug: string) => `/play/${slug}/`;
