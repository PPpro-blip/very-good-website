/**
 * Headless playability simulation for Geometry Rush.
 * A simple bot plays each level against the real physics code to prove that the
 * authored levels are actually clearable. Dev-only; not shipped to the browser.
 */
import { GeometryRushEngine, buildLevel } from "../src/games/geometry-rush/engine";

import { installDomStubs, makeCanvas } from "./dom-stub";

installDomStubs();
const canvas = makeCanvas(960, 540);

/* ---------- simulation ---------- */
const STEP = 1 / 120;
const AIRTIME = (2 * 960) / 2750;

function simulate(levelIndex: number) {
  const spec = buildLevel(levelIndex);
  const engine: any = new GeometryRushEngine({
    canvas: canvas as any,
    onHud: () => {},
    onComplete: () => {},
  });
  engine.setLevel(levelIndex);
  engine.begin();

  const hazards = spec.obstacles
    .filter((o) => ["spike", "block", "saw"].includes(o.type))
    .sort((a, b) => a.x - b.x);
  // group touching spikes so wide clusters are jumped as one unit
  const groups: { start: number; end: number }[] = [];
  for (const h of hazards) {
    const last = groups[groups.length - 1];
    if (last && h.x - last.end < 8) last.end = Math.max(last.end, h.x + h.w);
    else groups.push({ start: h.x, end: h.x + h.w });
  }
  const lead = spec.speed * 0.34;
  let holdSteps = 0;
  let respawnTimer = 0;
  let steps = 0;
  let deaths = 0;
  const maxSteps = Math.ceil((spec.length / spec.speed + 60) / STEP);

  while (steps < maxSteps) {
    steps++;
    const p = engine.player;
    const state = engine.state;

    if (state === "complete") break;
    if (state === "dead") {
      engine.update(STEP);
      respawnTimer += STEP;
      if (respawnTimer > 0.78) {
        engine.respawn();
        respawnTimer = 0;
      }
      continue;
    }

    if (state !== "running") break;

    // bot: jump shortly before the next hazard group, hold for a high arc
    const next = groups.find((group) => group.end > p.x + 30);
    const distance = next ? next.start - (p.x + 34) : Infinity;
    const width = next ? next.end - next.start : 0;
    const trigger = lead + Math.max(0, width - 34) * 0.45;
    if (p.onGround && next && distance < trigger && distance > -20) {
      engine.jump();
      holdSteps = Math.ceil(0.3 / STEP);
    }
    if (holdSteps > 0) {
      p.holding = true;
      holdSteps--;
    } else if (p.onGround) {
      p.holding = false;
    }

    const before = engine.deaths;
    engine.update(STEP);
    if (engine.deaths > before) {
      deaths++;
      if (process.env.DEBUG_SIM) {
        const near = spec.obstacles
          .filter((o) => Math.abs(o.x - p.x) < 260)
          .map((o) => `${o.type}@${Math.round(o.x)}|y${Math.round(o.y)}|h${Math.round(o.h)}`)
          .join(" ");
        console.log(
          `    death #${deaths} at x=${Math.round(p.x)} y=${Math.round(p.y)} vy=${Math.round(p.vy)} onGround=${p.onGround} holding=${p.holding} :: ${near}`,
        );
      }
    }
    if (p.y > 560 + 100) break;
  }

  const progress = Math.min(100, Math.round((engine.player.x / spec.length) * 100));
  const finished = engine.state === "complete";
  console.log(
    `${finished ? "  ✓" : "  ✗"} level ${levelIndex + 1} "${spec.name}": ${finished ? "COMPLETED" : `stopped at ${progress}%`}, deaths ${deaths}, sim ${(steps * STEP).toFixed(1)}s`,
  );
  engine.destroy();
  return finished;
}

console.log("\n▶ Geometry Rush playability (bot run against real physics)\n");
const results = [0, 1, 2].map(simulate);
const allFinished = results.every(Boolean);
console.log(
  allFinished
    ? "\n✅ every level is completable\n"
    : "\n❌ at least one level could not be completed by the bot — inspect the geometry\n",
);
process.exit(allFinished ? 0 : 1);
