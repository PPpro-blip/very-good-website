# WOW GAMES — YOUR WORLD. YOUR GAMES. YOUR ARCADE.

A futuristic neon arcade built with **Next.js 15**, **React 19** and **Tailwind CSS**.
Eleven cabinets: four games written from scratch (canvas engines, original chiptune
soundtracks) and seven existing builds presented in a single, consistent player
shell.

```
██╗    ██╗ ██████╗ ██╗    ██╗    ██████╗  █████╗ ███╗   ███╗███████╗███████╗
██║    ██║██╔═══██╗██║    ██║   ██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝
██║ █╗ ██║██║   ██║██║ █╗ ██║   ██║  ███╗███████║██╔████╔██║█████╗  ███████╗
██║███╗██║██║   ██║██║███╗██║   ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║
╚███╔███╔╝╚██████╔╝╚███╔███╔╝   ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║
 ╚══╝╚══╝  ╚═════╝  ╚══╝╚══╝     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
```

- Live build: deploy `main` to Netlify (settings below) — no environment variables, no backend.
- Progress is stored **on the device** (localStorage). There are no accounts and no server.

---

## 1. The cabinets

### Original builds (written from scratch for this project)

| Game | What it is | Highlights |
| --- | --- | --- |
| **Geometry Rush** · `/play/geometry-rush` | One-button neon platformer | 3 hand-authored levels, spikes / blocks / saws / boost pads, 2 checkpoints per level, coins, screen shake, particles, pause, instant restart, per-level bests, procedural chiptune |
| **Flappy Chaos** · `/play/flappy-chaos` | One-tap flyer | Parallax worlds, real wing animation, particle bursts, difficulty ramp, 3 unlockable themes (neon / dusk / aurora), best score |
| **Brain Blast** · `/play/brain-blast` | Hub of six brain games | Quick Math, Memory Master, Word Wizard, Pattern Detective, Logic Lab, Speed Quiz — each with its own scoring and timers |
| **Aurora Drift** · `/play/aurora-drift` | Wordless sensory toy | Paint light with pointer/finger, three moods, optional generative chimes, motion-off mode |

### Existing builds (opened in the WOW player)

| Game | Source |
| --- | --- |
| Arena Game | `https://01a18da3-cc80-7839-8353-aa68525263f2.arena.site/` |
| Timepass | `https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-timepass` |
| TNT Tag | `https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-tnt-tag` |
| Level Not Devil | `https://pppro-blip.github.io/Level-not-Devil/` |
| Hide & Seek Haha | `https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-hide-ad-seek-haha` |
| Error 404 | `https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-erorr-404` |
| AI Pet | `https://skills.educologysolutions.com/codelab_view.php?slug=pratham-pandey-ai-pet` |

The original URLs are never rewritten or proxied. See [§7 Hosted games](#7-hosted-games-and-embeds).

---

## 2. Site map

| Route | What lives there |
| --- | --- |
| `/` | Hero, animated headline, PLAY NOW, featured carousel, continue-playing row, live arcade stats, category tiles, study + sensory teasers |
| `/games` | Full library: search, category chips, sort, favourites-only, recently-played-only, surprise-me, result count, empty states |
| `/categories` | Ten aisles, each with its own accent colour and deep link into `/games?category=…` |
| `/custom` | The "bring your own cabinet" page: how new games are registered, what the player shell gives you |
| `/study` | Study Zone: maths, science, geography, GK, vocabulary, spelling, logic, speed — 8-question rounds, achievements, study points |
| `/sensory` | Calm corner: AI Pet + Aurora Drift, plus a real settings panel (sound, ambient pad, motion) |
| `/about` | About the builder, how the arcade was made, honest notes |
| `/play/[slug]` | Player shell for every one of the 11 cabinets (statically exported) |
| `404` | Styled lost-in-the-arcade page |

Global chrome: sticky nav with working search + random cabinet, mobile dock, command
palette (`Ctrl/⌘ + K`), profile panel (nickname, stats, reset), footer, animated
particle/grid background.

---

## 3. Stack and architecture

- **Next.js 15.5** App Router, `output: "export"` → fully static `out/` folder.
- **React 19** + **TypeScript** (strict).
- **Tailwind CSS 3.4** with a custom neon design system in `src/app/globals.css`.
- **@fontsource** self-hosted fonts (Orbitron display, Space Grotesk UI, JetBrains Mono
  numerals) — no Google Fonts request at runtime.
- **No backend, no database, no auth, no paid services.** All persistence is localStorage.

### Why not Vite?

The brief asked for "Next.js, Tailwind, Vite — everything". Next.js *is* the build
tool here: it compiles the app with its own Rust-based bundler, does the
TypeScript pass, and exports a static site. Bolting Vite on top would mean a second
compiler building the same source with a different runtime, and the App Router's
file-system routing / static export would be lost. Tailwind is wired through
PostCSS exactly as it would be in a Vite project, and the production artefact is
still a plain static bundle (`out/`) that any CDN can serve — including Netlify.
That is why the project ships with Next + Tailwind only.

### Source layout

```
src/
├─ app/                     route segments (all statically exported)
│  ├─ layout.tsx            shell, fonts, metadata, providers
│  ├─ page.tsx              home (server component; interactivity in children)
│  ├─ games/ study/ sensory/ categories/ custom/ about/
│  ├─ play/[slug]/page.tsx  generateStaticParams + generateMetadata per cabinet
│  ├─ error.tsx  404 → not-found.tsx  icon.svg
│  └─ globals.css           design tokens, glassmorphism, animations, fullscreen
├─ components/
│  ├─ shell/                ArcadeProvider, NavBar, MobileDock, CommandPalette,
│  │                        ProfilePanel, BackgroundFX, Footer, Marquee, Logo
│  ├─ home/                 Hero, FeaturedRail, ContinueRow, HomeWidgets
│  ├─ games/                GameCard (3D tilt), LibraryExplorer, GameArt, FavoriteButton
│  ├─ player/PlayerClient   cabinet chrome, iframe watchdog, fullscreen, help
│  ├─ quiz/QuizRound        shared round engine for quizzes
│  ├─ study/StudyZone       topic grid + round flow + achievements
│  ├─ sensory/SensorySettings  sound / ambient / motion switches
│  └─ ui/                   Icon set, Reveal, badges, empty states
├─ data/                    games.ts, categories.ts, questions.ts, study-topics.ts
├─ games/                   registry.ts + geometry-rush/, flappy-chaos/,
│                           brain-blast/, sensory/
└─ lib/                     store (localStorage), audio, music, hooks, quiz,
                            scores, achievements, utils
scripts/                    headless verification (see §8)
```

### Design-system notes

- Palette: midnight navy `#05060f` base, electric cyan `#2ee6ff`, neon blue `#4d7cff`,
  purple `#8b5cf6`, magenta `#ff3fd8`, plus per-category accents (orange, yellow,
  green, red).
- Glass panels layer a translucent gradient over a predeclared solid fallback colour,
  so unsupported `color-mix`/`backdrop-filter` degrades to a readable panel.
- Motion: every animation is opt-out via `prefers-reduced-motion` and the in-app
  motion switch (sets `data-motion="off"` on `<html>`).
- Cards use pointer-driven 3D tilt + a cursor-following highlight, and only enable it
  on fine-pointer devices; the spring returns via CSS transitions.

---

## 4. Player shell

`src/app/play/[slug]/page.tsx` → `PlayerClient` gives every cabinet the same chrome:

- title, category, tagline, description, players/difficulty badges
- fullscreen, restart, sound toggle, "back to arcade"
- an expandable controls/help drawer (`?` / `H`)
- best-score panel, favourite star, play counter, "up next" rail
- original games mount the canvas component from `src/games/registry.ts`
- hosted games show a **poster first** (see §7), mount an iframe only on request, and
  keep a permanent **Open <game>** action on screen — never a dead end, never a blank
  grey panel by default.

Global keyboard shortcuts (search, random, mute) automatically stand down while a
cabinet is focused (`document.body.dataset.playing === "1"`), so gameplay keys can
never navigate away from a game.

---

## 5. Persistence contract (localStorage)

Single key: `wowgames.state.v1`.

```ts
{
  nickname: string;
  favorites: string[];              // slugs
  recent: { slug: string; at: number }[];
  plays: Record<string, number>;    // plays per slug
  best: Record<string, number>;     // per-game / per-level / per-mode keys
  studyPoints: number;
  muted: boolean;
  ambient: boolean;
  motion: "on" | "off";
}
```

Best-score keys: `geometry-rush:<level>`, `flappy-chaos`, `brain-blast:<mode>`,
`study:<topicId>`. Flappy's cosmetic theme lives in `wowgames.flappy.theme`.
Writes are wrapped in `try/catch`; if storage is unavailable the arcade keeps
working in memory for that session.

---

## 6. Sound

Everything is synthesised at runtime with the Web Audio API — no audio files, no
third-party music:

- UI clicks, hover ticks, mode changes, launch whooshes, win/loss stings
- a generative ambient pad (toggleable)
- per-game chiptune loops (Geometry Rush, Flappy Chaos themes) and quiz SFX

The audio context is only created/resumed from a user gesture, so autoplay policies
are respected; a global mute in the nav, the player and the profile silences
everything, including game music.

---

## 7. Hosted games and embeds

Hosted cabinets live on other domains, and **whether they may be framed is decided
by their servers** (`X-Frame-Options` / CSP `frame-ancestors`). When a host refuses,
the browser paints an opaque grey "broken page" panel inside the iframe — and that
refusal is **not detectable from JavaScript**: a cross-origin frame exposes no
document, and Chrome still fires `load`. Anything that claims "the iframe loaded, so
it worked" is guessing.

So the player is **poster-first** and never guesses:

1. **The cabinet poster is the default view.** Game art, title, host, a prominent
   **OPEN <GAME>** button (new tab, always works) and a secondary
   **Play inside WOW GAMES** button. A refused frame can therefore never appear
   unless the visitor explicitly asks for the inline frame.
2. **Opt-in inline frame.** Clicking "Play inside WOW GAMES" mounts the iframe with a
   loading stage (animated rings, host name, an OPEN button and "Back to poster").
3. **Permanent escape hatches.** Once mounted, a translucent action pair stays on top
   of the frame — **Open <game>** and **Poster** — and a hint pill appears if the
   panel looks empty ("Panel blank? arena.site may refuse embedding"). The under-stage
   toolbar also carries a permanent **Open <game>** button.
4. **Slow/refused state.** If no `load` arrives within 12 s, or the frame errors, the
   stage switches to an explanation screen with OPEN / Try again / Poster. It never
   claims the embed succeeded.

Frame permissions requested: `fullscreen; autoplay; gamepad; clipboard-write;
encrypted-media; picture-in-picture`. No `sandbox` attribute is added, so the hosted
game keeps its own storage, canvas and fullscreen behaviour. The original URL is
never rewritten or proxied.

**Honest limitation:** the framing headers of the seven hosts could not be inspected
from the build environment (outbound access to them is blocked there), and there is
no headless browser in the sandbox. What *is* verified automatically: hosted pages
export **no iframe** in the first paint, keep the exact original URL in four
reachable actions, and always expose the poster fallback
(`scripts/verify-export.ts`). See `docs/QA-REPORT.md` for the full diagnosis.

## 8. Local development and verification

```bash
npm install
npm run dev        # http://localhost:3000

npm run build      # static export → out/
npm start          # serve out/ on 0.0.0.0:3000 (production preview)
```

Verification suite (no browser required — it runs the real engines in Node):

```bash
npm run verify
```

- `typecheck` — `tsc --noEmit` (strict).
- `verify-content` — 1,500 generated questions + every question bank: four unique
  options, in-range answer index, explanation present; generated arithmetic answers
  independently recomputed; spelling words unique; study topics wired to 8+ question
  banks; all 11 game records valid.
- `simulate-geometry` — a bot plays all three Geometry Rush levels against the real
  physics loop, including respawns, and must finish every level.
- `simulate-flappy` — a synthetic pilot sweeps control parameters against the real
  engine to prove the difficulty ramp stays clearable (passes at 25+ pipes; the best
  pilot typically clears 45–80).
- `verify-export` — reads the built `out/` folder and asserts the player contract:
  hosted cabinets ship **no iframe in the export** (poster only), keep the exact
  original URL, expose the inline opt-in and the OPEN button; original games render no
  iframe; every player page has a title and an `<h1>`; `/games` lists all 11 cabinets.
  Skipped automatically when `out/` is absent.

`docs/QA-REPORT.md` records exactly what was verified, how, and what could not be
tested in this environment.

---

## 9. Deploy to Netlify

`netlify.toml` is already committed:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "22"
```

### Option A — Netlify UI (recommended)

1. Push this repository to GitHub.
2. Netlify → **Add new site → Import an existing project → GitHub** → pick the repo.
3. Build command `npm run build`, publish directory `out` (auto-filled from
   `netlify.toml`), Node 22 from the same file.
4. No environment variables, no secrets, no server functions.
5. Deploy. The site is a static export, so it works on the free plan and on any
   static host.

### Option B — CLI

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

### Notes

- Trailing slashes are enabled (`trailingSlash: true`), matching the `…/index.html`
  files Next exports.
- Netlify serves the exported `404.html` automatically; there is deliberately **no**
  catch-all redirect, because it would shadow real routes.
- Re-deploys are pure static uploads — no cold starts.

---

## 10. Add cabinet #12

### A hosted game (2 minutes)

Append an entry to `GAMES` in `src/data/games.ts`:

```ts
{
  slug: "my-new-game",
  title: "My New Game",
  tagline: "One line of hype.",
  description: "Two sentences shown on cards and the player page.",
  about: "The longer story for the cabinet page.",
  kind: "external",
  url: "https://example.com/my-game/",
  categories: ["action"],
  tags: ["skill"],
  palette: { from: "#2ee6ff", to: "#4d7cff" },
  motif: "runner",
  featured: false,
  difficulty: 3,
  players: "1 player",
  released: "2026",
  controls: ["Arrow keys — move"],
  embedHint: "unknown",
  year: 2026,
}
```

The route, metadata, card, search entry, category listing, featured rail and
related-games rail are generated from that object — nothing else to touch.

### B original canvas game

1. Write `src/games/my-game/engine.ts` (pure `render(dt)` / `update(dt)` loop, no
   React state per frame) and `src/games/my-game/MyGame.tsx` exposing
   `restart()` through `useImperativeHandle`.
2. Register it in `src/games/registry.ts`:

   ```ts
   export const CUSTOM_GAMES: Record<string, CustomGameComponent> = {
     "my-new-game": MyGame,
   };
   ```

3. Add the matching `GAMES` entry with `kind: "original"`.
4. Optional: a best-score key via `store.submitScore("my-new-game", score)`.

The player shell handles fullscreen, sound, restart, help and best scores for you.

---

## 11. Accessibility and performance

- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `<h1>` per page, labelled
  controls, visible focus rings, `aria-live` score/status regions.
- Skip-to-content link; nav and dock are real links (keyboard + screen reader safe).
- `prefers-reduced-motion` respected globally, plus an in-app motion switch; canvas
  games degrade to still frames rather than decorative animation.
- Touch targets ≥ 44px, no horizontal overflow at 320px, safe-area padding for the
  mobile dock.
- Static export: 22 prerendered routes, all game art is inline SVG/CSS (zero image
  requests), fonts are self-hosted and subset, gameplay canvases render at
  devicePixelRatio-capped resolution, RAF loops are destroyed on unmount.
- Metadata per route (title, description, Open Graph, Twitter), `robots.txt`,
  JSON-LD on the home page, and a 1200×630 share card (`public/og.jpg`). Netlify's
  `URL` build variable is picked up automatically so OG/canonical URLs are absolute
  in production; when it is absent (local dev) the tags are simply omitted rather
  than pointing at a placeholder domain.

---

## 12. Credits

- Design, code, level layouts, question banks, art and audio: built for WOW GAMES
  (no third-party assets, no borrowed level designs, no copyrighted music).
- Fonts: Orbitron, Space Grotesk, JetBrains Mono via `@fontsource` (SIL Open Font
  License).
- The seven hosted games remain the property of their original author; WOW GAMES
  only links/embeds them at their original URLs.

Progress lives in your browser only — clear site data to reset the arcade.
