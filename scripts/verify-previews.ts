/**
 * Verifies the cinematic hover previews are real gameplay, not decoration:
 * both attract-mode engines must play themselves competently (silenced) so a
 * card preview never shows a frozen or dying-out game.
 */
import { GeometryRushEngine } from "../src/games/geometry-rush/engine";
import { FlappyEngine } from "../src/games/flappy-chaos/engine";
import { isAudioSilenced, pushAudioSilence, popAudioSilence } from "../src/lib/audio";
import { installDomStubs, makeCanvas } from "./dom-stub";

installDomStubs();

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("  ✗", msg);
};
const ok = (msg: string) => console.log("  ✓", msg);

console.log("\n▶ Attract-mode previews (the engines that power card hovers)");

pushAudioSilence();
if (!isAudioSilenced()) fail("audio silence scope did not engage");

/* Geometry Rush: 20 simulated seconds of self-play */
{
  const engine: any = new GeometryRushEngine({
    canvas: makeCanvas(480, 360) as any,
    onHud: () => {},
    onComplete: () => {},
    attract: true,
  });
  engine.setLevel(0);
  engine.begin();
  const step = 1 / 120;
  let furthest = 0;
  for (let i = 0; i < 20 / step; i++) {
    engine.update(step);
    furthest = Math.max(furthest, engine.player.x);
  }
  const deaths = engine.deaths;
  if (furthest < 4200) fail(`Geometry Rush attract only reached ${Math.round(furthest)}px in 20s`);
  if (deaths > 0) fail(`Geometry Rush attract died ${deaths} time(s) in 20s (preview would look broken)`);
  ok(`Geometry Rush attract: reached ${Math.round(furthest)}px, ${deaths} death(s) in 20s`);
  engine.destroy();
}

/* Flappy Chaos: 20 simulated seconds of self-play through the RAF tick */
{
  const engine: any = new FlappyEngine({
    canvas: makeCanvas(480, 360) as any,
    initialBest: 0,
    initialTheme: "neon",
    onHud: () => {},
    onGameOver: () => {},
    attract: true,
  });
  engine.restart();
  let now = performance.now();
  for (let i = 0; i < 20 * 60; i++) {
    now += 1000 / 60;
    engine.tick(now);
  }
  const score = engine.score as number;
  if (score < 3) fail(`Flappy attract only scored ${score} in 20s`);
  ok(`Flappy Chaos attract: score ${score} in 20s of self-play`);
  engine.destroy();
}

popAudioSilence();
if (isAudioSilenced()) fail("audio silence scope did not release");

console.log(failures === 0 ? "\n✅ PREVIEW ENGINES PASSED\n" : `\n❌ ${failures} PREVIEW CHECK(S) FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
