/** Headless playability simulation for Flappy Chaos (real engine, synthetic pilot). */
import { FlappyEngine } from "../src/games/flappy-chaos/engine";
import { installDomStubs, makeCanvas } from "./dom-stub";

installDomStubs();

const STEP = 1 / 120;
const GRAVITY = 1750;

type Rule = { horizon: number; bias: number; deadband: number };

function play(rule: Rule, targetScore: number) {
  const engine: any = new FlappyEngine({
    canvas: makeCanvas(960, 540) as any,
    initialBest: 0,
    initialTheme: "neon",
    onHud: () => {},
    onGameOver: () => {},
  });
  engine.restart();

  let steps = 0;
  const maxSteps = targetScore * 14 * 120;
  while (steps < maxSteps && engine.state === "running") {
    steps++;
    const bird = engine.bird;
    const pipes = (engine.pipes as any[])
      .filter((pipe) => pipe.x + 74 > bird.x - 40)
      .sort((a, b) => a.x - b.x);
    const next = pipes[0];
    if (next) {
      const target = next.gapY + next.gap * rule.bias;
      const predicted =
        bird.y + bird.vy * rule.horizon + 0.5 * GRAVITY * rule.horizon * rule.horizon;
      // flap only when we are heading below the aim point, and never crowd the ceiling
      if (predicted > target && bird.y > next.gapY + rule.deadband) engine.tap();
    } else if (bird.y > 380) {
      engine.tap();
    }
    engine.update(STEP);
  }

  const score = engine.score;
  engine.destroy();
  return score;
}

console.log("\n▶ Flappy Chaos playability (bot run against real physics)\n");
let best = { score: 0, rule: { horizon: 0, bias: 0, deadband: 0 } };
const results: string[] = [];
for (const horizon of [0, 0.04, 0.08, 0.12]) {
  for (const bias of [0.4, 0.5, 0.6, 0.7]) {
    for (const deadband of [0, 24, 48]) {
      const rule = { horizon, bias, deadband };
      const score = play(rule, 45);
      if (score > best.score) best = { score, rule };
      results.push(`h=${horizon} aim=${bias} cap=+${deadband} → ${score}`);
    }
  }
}
results.sort((a, b) => Number(b.split("→")[1]) - Number(a.split("→")[1]));
console.log("  top 6 pilots:");
results.slice(0, 6).forEach((r) => console.log("   ", r));
console.log(
  `\n  best: score ${best.score} with horizon ${best.rule.horizon}s, aim ${best.rule.bias * 100}%, ceiling cap +${best.rule.deadband}px`,
);
const ok = best.score >= 25;
console.log(
  ok
    ? "\n✅ a well-timed pilot clears 25+ pipes, so the ramp is fair and playable\n"
    : "\n❌ even the best pilot stalls early — soften the difficulty curve\n",
);
process.exit(ok ? 0 : 1);
