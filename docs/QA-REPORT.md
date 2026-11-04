# QA report — WOW GAMES

**Build under test:** `main` @ 2026-11-04 · Node 22.22.3 · npm 10.9.8
**Stack:** Next.js 15.5.29 (static export), React 19.2.9, TypeScript 5.7.3, Tailwind 3.4.17

This file records what was actually executed, what the results were, and — just as
importantly — what could **not** be verified in this environment.

---

## 1. Production build ✅

```
npm run build
✓ Compiled successfully
✓ Generating static pages (22/22)
✓ Exporting (2/2)
```

| Route | Size | First Load JS |
| --- | --- | --- |
| `/` | 7.32 kB | 133 kB |
| `/about` | 164 B | 106 kB |
| `/categories` | 165 B | 106 kB |
| `/custom` | 164 B | 106 kB |
| `/games` | 2.65 kB | 128 kB |
| `/play/[slug]` | 23.6 kB | 156 kB (× 11 SSG paths) |
| `/sensory` | 2.96 kB | 115 kB |
| `/study` | 4.27 kB | 126 kB |
| `/icon.svg` | — | — |
| `/_not-found` | 123 B | 103 kB |

Shared JS: 103 kB. Export size: ~4.8 MB on disk (mostly self-hosted fonts).
Zero build warnings; `tsc --noEmit` clean under `strict`.

## 2. Automated content + engine verification ✅

`npm run verify` (typecheck + three headless suites) — all green.

| Suite | What it does | Result |
| --- | --- | --- |
| `verify-content` | Validates every question bank (science, geography, general, vocabulary, logic, speed mix) and 1,500 generated maths/pattern/spelling questions: 4 unique options, in-range answer index, explanation present. Recomputes generated arithmetic answers independently. Checks spelling-word uniqueness, Study Zone wiring (≥8 questions per topic), and the 11 game records. | **pass** |
| `simulate-geometry` | Runs the real Geometry Rush engine (physics, collisions, checkpoints, respawns) in Node with a bot pilot that jumps at hazard groups. | **all 3 levels completed, 0 deaths** — L1 17.7 s, L2 17.3 s, L3 16.6 s |
| `simulate-flappy` | Runs the real Flappy Chaos engine and sweeps pilot parameters (prediction horizon × aim height × ceiling cap) to prove the difficulty ramp stays clearable. | **pass** — best pilot 45–83 pipes; threshold is 25 |

The Geometry Rush bot initially exposed genuinely unfair level spacing (hazards
landing 7 px in front of the player after a jump). The level builder was rewritten
around a clearance cursor derived from the jump arc, and the flappy difficulty curve
was softened (gap floor 132 → 158 px, slower speed/gap ramp). Both suites now pass,
and they are re-runnable by a judge in one command.

## 3. Static export smoke test ✅

Served `out/` with `npx serve out` and requested every route over HTTP:

| Request | Status |
| --- | --- |
| `/`, `/games/`, `/categories/`, `/custom/`, `/study/`, `/sensory/`, `/about/` | 200 |
| `/play/{arena-game,timepass,tnt-tag,level-not-devil,hide-and-seek-haha,error-404,ai-pet}/` | 200 |
| `/play/{geometry-rush,flappy-chaos,brain-blast,aurora-drift}/` | 200 |
| `/robots.txt`, `/icon.svg` | 200 |
| `/definitely-not-a-page` | 404 (exported `404.html`) |

All 13 assets referenced by the home page (`_next` CSS/JS/woff2) returned 200.
Content assertions on the exported HTML:

- `/games/` now contains **all 11 cabinet titles in the static HTML** (previously the
  library sat behind a `useSearchParams` Suspense boundary and only rendered client
  side; deep links are now applied on hydration instead, so the HTML is complete for
  crawlers and no-JS visitors).
- `/categories/` contains the nine deep links `/games?category=…`.
- Every `/play/<slug>/` has its own `<title>` (`Arena Game · WOW GAMES`, …), and the
  hosted cabinets contain the **exact original URL** plus a permanent "Open original"
  action.
- A build with `URL=https://…` produces absolute `og:image` (`/og.jpg`, 1200×630,
  54 KB) and `og:image:alt`; without the variable the tags are omitted (no
  localhost/placeholder domain leaks into the HTML).
- `/` contains the hero tagline, the featured rail, the four original cabinets and two
  `application/ld+json` blocks (WebSite + ItemList of all cabinets).
- `/study/` lists Science, Geography, Logic, Vocabulary, … topics; `/sensory/` lists
  AI Pet and Aurora Drift; `/about/` contains the About Me copy.

## 4. Not verified here — be honest about it ⚠️

The build environment has **no browser** (no Chromium/Firefox/WebKit, no Playwright),
so the following were reviewed by code and by static output only:

1. **Visual QA** — layout, glow/glass rendering, animation smoothness, responsive
   breakpoints at 320 / 768 / 1440 px.
2. **Client runtime behaviour** — hydration warnings, 3D card tilt, command palette,
   fullscreen transitions, localStorage round-trips, audio output.
3. **Touch gestures** — tap-to-jump/flap, pointer painting in Aurora Drift.
4. **Embedding of the seven hosted games.** Whether `skills.educologysolutions.com`,
   `arena.site` and `pppro-blip.github.io` permit framing is decided by *their*
   `X-Frame-Options` / CSP headers, which could not be inspected from here. The player
   is built for both outcomes: 9-second watchdog → "blocked/slow" overlay, permanent
   Open-original button, and no `sandbox` attribute that would break the hosted game.
5. **Lighthouse scores / Core Web Vitals** (no browser to measure them).

### 10-minute manual checklist before judging

- [ ] Home: hero animation, PLAY NOW, featured carousel arrows + autoplay, scroll cue.
- [ ] Nav: every link; search overlay (type "brain"; Enter); random cabinet; mute.
- [ ] `/games`: search, category chips, sort, favourites-only, recently-played, reset,
      deep link `/games?category=sensory` in a new tab.
- [ ] Favourite a game on a card → it appears under favourites; reload → still there.
- [ ] `/play/geometry-rush`: space to jump, hold for a higher arc, pause (P/Esc),
      restart (R), reach a checkpoint, die and respawn, finish a level → best score.
- [ ] `/play/flappy-chaos`: tap/space to flap, die, restart via the button, unlock a
      theme by scoring 10.
- [ ] `/play/brain-blast`: all six modes start, answer with keys 1–4, timers run,
      score saves per mode.
- [ ] `/play/aurora-drift`: paint with pointer, moods 1–3, sound switch, motion off.
- [ ] Hosted cabinet (e.g. `/play/ai-pet`): if the frame stays blank after ~9 s, the
      fallback appears and OPEN GAME opens the original URL in a new tab.
- [ ] Fullscreen button on a hosted and an original cabinet; Esc returns.
- [ ] `/study`: start a round, finish it, see the score + study points.
- [ ] `/sensory`: toggle sound/ambient/motion — motion off stops background animation.
- [ ] Profile panel: set a nickname, see stats, reset progress.
- [ ] Mobile width: no horizontal scrolling, dock usable, canvas fills the stage.

## 5. Deployment checklist (Netlify)

- [ ] Repo pushed to GitHub.
- [ ] Netlify: build command `npm run build`, publish directory `out`,
      `NODE_VERSION=22` (all in `netlify.toml`).
- [ ] No environment variables, no functions, no secrets.
- [ ] After deploy: repeat the smoke test on the live URLs (all 19 pages + 404).
- [ ] Confirm `https://<site>/og.jpg` resolves and the share preview shows the WOW
      GAMES card (Netlify supplies `URL`, so `metadataBase` fills in automatically).
