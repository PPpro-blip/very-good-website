/**
 * WOW GAMES content verification (dev-only sanity checks).
 * Run with: npx tsx scripts/verify-content.ts
 */
import {
  generateMathQuestion,
  generatePatternQuestion,
  generateSpellingQuestion,
  pickQuestions,
} from "../src/lib/quiz";
import {
  ALL_BANKS,
  LOGIC,
  SPEED_MIX,
  VOCABULARY,
  SPELLING_WORDS,
  type QuizQuestion,
} from "../src/data/questions";
import { buildLevel } from "../src/games/geometry-rush/engine";
import { GAMES } from "../src/data/games";
import { STUDY_TOPICS } from "../src/data/study-topics";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("  ✗", msg);
};
const ok = (msg: string) => console.log("  ✓", msg);

function checkQuestion(q: QuizQuestion, where: string) {
  if (!q.prompt || typeof q.prompt !== "string") fail(`${where}: missing prompt`);
  if (!Array.isArray(q.options) || q.options.length < 2) fail(`${where}: bad options`);
  if (q.answer < 0 || q.answer >= q.options.length) fail(`${where}: answer out of range`);
  if (new Set(q.options).size !== q.options.length) fail(`${where}: duplicate options in "${q.prompt}"`);
  if (!q.explain) fail(`${where}: missing explanation`);
}

console.log("\n▶ Question banks");
for (const [name, bank] of Object.entries(ALL_BANKS)) {
  bank.forEach((q, i) => checkQuestion(q, `${name}[${i}]`));
  const correct = bank.every((q) => q.options[q.answer] !== undefined);
  if (correct) ok(`${name}: ${bank.length} questions valid`);
}
for (const [name, bank] of Object.entries({ LOGIC, SPEED_MIX, VOCABULARY })) {
  bank.forEach((q, i) => checkQuestion(q, `${name}[${i}]`));
  ok(`${name}: ${bank.length} checked`);
}
if (new Set(SPELLING_WORDS.map((w) => w.word)).size !== SPELLING_WORDS.length) {
  fail("SPELLING_WORDS contains duplicates");
} else {
  ok(`spelling words: ${SPELLING_WORDS.length} unique`);
}

console.log("\n▶ Generated questions (500 each)");
for (let i = 0; i < 500; i++) {
  checkQuestion(generateMathQuestion(1 + (i % 4)), `math#${i}`);
  checkQuestion(generatePatternQuestion(1 + (i % 3)), `pattern#${i}`);
  checkQuestion(generateSpellingQuestion(1 + (i % 3)), `spelling#${i}`);
}
ok("math / pattern / spelling generators returned 1500 valid questions");

// arithmetic correctness of generated math
for (let i = 0; i < 300; i++) {
  const q = generateMathQuestion(2);
  const m = q.prompt.match(/^(\d+) ([+−×÷]) (\d+) = \?$/);
  if (!m) continue;
  const a = Number(m[1]);
  const b = Number(m[3]);
  const expected =
    m[2] === "+" ? a + b : m[2] === "−" ? a - b : m[2] === "×" ? a * b : a / b;
  if (Number(q.options[q.answer]) !== expected) {
    fail(`math answer mismatch: ${q.prompt} -> ${q.options[q.answer]} (expected ${expected})`);
    break;
  }
}
ok("generated arithmetic answers verified");

console.log("\n▶ Study zone wiring");
for (const topic of STUDY_TOPICS) {
  if (topic.kind === "bank" && (!topic.bank || topic.bank.length < 8)) {
    fail(`study topic ${topic.id} has too few questions`);
  }
}
const picked = pickQuestions(ALL_BANKS.science, 8);
if (picked.length !== 8) fail("pickQuestions returned wrong count");
if (new Set(picked.map((q) => q.prompt)).size !== picked.length) fail("pickQuestions repeated questions");
ok("study topics wired to banks with 8+ questions");

console.log("\n▶ Geometry Rush level geometry");
const JUMP_AIRTIME = 2 * 960 / 2750; // full jump in seconds
for (let level = 0; level < 3; level++) {
  const spec = buildLevel(level);
  const hazards = spec.obstacles.filter((o) => ["spike", "block", "saw"].includes(o.type));
  const sorted = spec.obstacles.every((o, i) => i === 0 || o.x >= spec.obstacles[i - 1].x);
  if (!sorted) fail(`level ${level + 1}: obstacles are not sorted by x`);
  const jumpDistance = spec.speed * JUMP_AIRTIME;
  // adjacent spikes are authored as one cluster (you clear the whole group in a jump)
  const groups: { start: number; end: number }[] = [];
  for (const h of hazards) {
    const last = groups[groups.length - 1];
    if (last && h.x - last.end < 8) last.end = h.x + h.w;
    else groups.push({ start: h.x, end: h.x + h.w });
  }
  const finish = spec.obstacles.find((o) => o.type === "finish");
  const checkpoints = spec.obstacles.filter((o) => o.type === "checkpoint");
  if (hazards.length < 12) fail(`level ${level + 1}: only ${hazards.length} hazards`);
  if (!finish) fail(`level ${level + 1}: no finish`);
  if (checkpoints.length !== 2) fail(`level ${level + 1}: expected 2 checkpoints`);
  const widest = Math.max(...groups.map((g) => g.end - g.start));
  if (widest > jumpDistance * 0.8) {
    fail(
      `level ${level + 1}: hazard cluster ${Math.round(widest)}px wider than 80% of the ${Math.round(jumpDistance)}px jump arc`,
    );
  }
  const firstHazard = hazards[0];
  if (firstHazard.x < 480) fail(`level ${level + 1}: give the player a longer runway`);
  ok(
    `level ${level + 1} "${spec.name}": ${hazards.length} hazards in ${groups.length} groups, widest ${Math.round(widest)}px, jump reach ${Math.round(jumpDistance)}px, runway ${Math.round(firstHazard.x)}px, length ${spec.length}px`,
  );
}

console.log("\n▶ Game registry");
const fps = GAMES.find((g) => g.slug === "fps-gods");
if (!fps) fail("fps-gods is missing from the registry");
else {
  if (fps.url !== "https://fps-gods.vercel.app/") fail(`fps-gods URL changed: ${fps.url}`);
  if (!fps.categories.includes("multiplayer")) fail("fps-gods must be a multiplayer cabinet");
  if (fps.motif !== "fps") fail("fps-gods should use the dedicated fps artwork");
  ok("FPS-GODS registered with its official URL and multiplayer identity");
}
const livePreviews = GAMES.filter((g) => g.preview?.live);
for (const game of livePreviews) {
  if (game.kind !== "original") fail(`${game.slug}: only original builds can run a live engine preview`);
}
const newGames = GAMES.filter((g) => g.isNew);
if (newGames.length > 3) fail(`NEW badge is too generous (${newGames.length} games) — it must stay meaningful`);
ok(`${livePreviews.length} live engine preview(s), ${newGames.length} cabinet(s) marked NEW`);
for (const game of GAMES) {
  if (game.preview?.video && !game.preview.video.startsWith("/previews/")) {
    fail(`${game.slug}: preview.video should live under /previews/`);
  }
}
for (const game of GAMES) {
  if (!game.slug || !game.title) fail(`game missing slug/title`);
  if (game.kind === "external" && !game.url) fail(`${game.slug}: external game missing url`);
  if (game.kind === "original" && game.url) fail(`${game.slug}: original game should not have url`);
  if (!/^#[0-9a-f]{6}$/i.test(game.palette.from)) fail(`${game.slug}: bad palette`);
}
if (new Set(GAMES.map((g) => g.slug)).size !== GAMES.length) fail("duplicate game slugs");
ok(`${GAMES.length} games registered (${GAMES.filter((g) => g.kind === "original").length} original)`);

console.log(
  failures === 0
    ? "\n✅ ALL CONTENT CHECKS PASSED\n"
    : `\n❌ ${failures} CHECK(S) FAILED\n`,
);
process.exit(failures === 0 ? 0 : 1);
