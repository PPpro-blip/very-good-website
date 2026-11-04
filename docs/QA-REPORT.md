# QA report — WOW GAMES

**Build under test:** `main` @ 2026-11-04 · Node 22.22.3 · npm 10.9.8
**Stack:** Next.js 15.5.29 (static export), React 19.2.9, TypeScript 5.7.3, Tailwind 3.4.17

This file records what was actually executed, what the results were, and — just as
importantly — what could **not** be verified in this environment.

---

## 0a. WOW GAMES 2.0 upgrade (2026-11-04)

### Shipped

| Area | What changed |
| --- | --- |
| Cinematic previews | New `GamePreview`: real engine attract mode for Geometry Rush / Flappy Chaos, animated poster fallback, reserved lazy `preview.video` slot (muted/loop/playsInline, 220 ms hover arming), reduced-motion + touch safe |
| Attract engines | `attract?: boolean` added to both engines with a self-playing pilot, looped deaths/restarts, faster respawn; silence scopes in `audio`/`music` so previews never make sound |
| Game cards | Live/animated preview inside the tilt+parallax cabinet, NEW badge, Featured ribbon, artwork label ("live gameplay" / "gameplay" / "artwork") |
| Featured carousel | Hover shows the slide's real gameplay, per-game glow, NEW + multiplayer chips, "Explore <category>" secondary CTA, hover hint line |
| FPS-GODS | New 12th cabinet (`fps` motif artwork, tactical palette), dedicated home `FpsZone` with dossier panel, player page banner, hero shortcut, official `fps-gods.vercel.app` link (4× reachable) |
| Discovery | 7 draggable, snapping, arrow-controlled shelves with per-shelf accents; "Most played" uses the visitor's real launch counts, honestly labelled |
| Player page | Cinematic banner behind the title, NEW badge, existing poster-first embed flow preserved |
| Profile | 8 emoji avatars persisted in `localStorage` alongside the nickname and stats |
| Layout | Removed the two duplicate home grids (originals + vault) now covered by shelves — cut the home HTML from 845 KB to 658 KB raw (106 KB gzip) |

### Verified automatically

- `npm run typecheck` — clean.
- `npm run build` — **23 routes** exported (12 cabinets), no warnings.
- `npm run verify` — content, level geometry, both engine simulators, preview engines and the export suite all pass.
  - `verify-content`: FPS-GODS URL is exactly `https://fps-gods.vercel.app/`, multiplayer category, `fps` motif; only original builds carry live previews; at most 3 cabinets marked NEW; preview videos must live under `/previews/`.
  - `verify-previews`: Geometry Rush attract reaches **7,040 px with 0 deaths in 20 s**; Flappy Chaos attract scores **10 pipes in 20 s**; the audio silence scope engages and releases.
  - `verify-export`: 12 player pages, hosted pages export **no iframe**, `/games` lists all 12 cabinets.
- Served the static export and checked: home contains the FPS zone, all seven shelf headings and the FPS URL; `/play/fps-gods/` has its title, `OPEN FPS-GODS`, the inline opt-in, four links to the official URL and no iframe; `/games` lists FPS-GODS.

### Still not verifiable here (no browser)

Hover feel, engine previews actually rendering on screen, shelf dragging on touch,
autoplay policy for video previews, and whether `fps-gods.vercel.app` permits framing
(its headers, like arena.site's, cannot be reached from this sandbox). The player's
poster-first fallback covers that last one.

---

## 0. Hosted-cabinet embedding fix (2026-11-04)

**Reported:** `/play/arena-game/` showed a blank grey panel with a broken-page icon
for `https://01a18da3-cc80-7839-8353-aa68525263f2.arena.site/`.

### Root cause

The player mounted the hosted game's iframe immediately and treated its `load` event
as success. When a host refuses to be framed (`X-Frame-Options: DENY/SAMEORIGIN` or
CSP `frame-ancestors`), the browser paints an opaque grey "broken page" panel — and
Chrome **still fires `load`**, so our loading overlay disappeared and left exactly the
rectangle that was reported. This failure is invisible to JavaScript: a cross-origin
frame exposes no document, so "did it really render?" cannot be answered from the page.

### What could and could not be inspected from this environment

| Check | Result |
| --- | --- |
| DNS for `…arena.site` | resolves (172.67.181.156, Cloudflare) |
| `curl` the URL / headers | **blocked** — TLS handshake killed by the sandbox egress policy (`SSL_ERROR_SYSCALL`); `github.com` returns 200 as a control, so the tooling is fine, the host is unreachable from here |
| GitHub Actions probe of `x-frame-options` / CSP | **not possible** — the GitHub App token cannot push `.github/workflows/*` (`workflows` permission refused) |
| Headless browser check | **not possible** — no Chromium/Playwright in the sandbox |
| Reproduce in a real browser | **not possible here** |

So the exact header the host sends could not be read. The observed symptom (grey panel
+ broken-page icon, with our overlay gone) is the standard signature of a refused
frame, which is why the fix does not depend on knowing the answer: it is correct
whether or not `arena.site` allows framing. **The original URL itself was never
modified** and was verified byte-for-byte in the exported HTML.

### The fix — poster-first, opt-in frame

`src/components/player/HostedStage.tsx` (new) replaces the auto-mounting iframe in
`PlayerClient.tsx`:

- **Default view = cabinet poster** (game art, host, title, prominent
  `OPEN ARENA GAME` in a new tab, secondary `Play inside WOW GAMES`). No iframe exists
  in the exported HTML, so a refused frame cannot appear on arrival.
- **Loading stage** when the inline frame is requested: animated orbit rings, host
  name, progress sweep, `OPEN ARENA GAME`, `Back to poster`.
- **Permanent escape hatches** above the frame once mounted: `Open Arena Game` and
  `Poster` (plus a hint pill: "Panel blank? arena.site may refuse embedding").
- **Slow/refused state** after 12 s: explanation, `OPEN ARENA GAME`, `Try again`,
  `Poster`. Never claims success.
- **Restart** now reloads (or mounts) the hosted frame instead of showing a
  "restart inside the game" toast; **fullscreen** still targets the stage element, and
  the frame keeps `allow="fullscreen"`.
- Four independent, always-reachable links to the original URL: chrome bar icon,
  poster primary button, under-stage primary button, and the on-frame pill.

### Tests run after the change

- `npm run typecheck` — clean.
- `npm run build` — 22 static pages exported, no warnings.
- `npm run verify` — content checks, both engine bot runs, **and the new
  `verify-export` suite**: all 11 player pages have a title + `<h1>`; **0 iframes in
  the hosted exports**; the original URL appears in an anchor on every hosted page;
  `Play inside WOW GAMES` present; original builds render no iframe; `/games` lists
  all 11 cabinets server-side.
- Static server smoke test: all 19 routes + `og.jpg` + `robots.txt` return 200, unknown
  routes return 404.
- `/play/arena-game/` HTML inspected: `OPEN ARENA GAME`, `Play inside WOW GAMES`,
  `Hosted cabinet · …`, four `target="_blank"` links to the exact URL, **no `<iframe>`**.

### Still not verified

Whether `arena.site` (or the six other hosts) actually renders inside a frame. The
only way to know is to click **Play inside WOW GAMES** in a real browser and watch the
DevTools console — a refusal logs
`Refused to display '…' in a frame because it set 'X-Frame-Options' to '…'`.
If that is what you see, the poster + OPEN button is the intended, permanent path.


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
