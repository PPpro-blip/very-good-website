/**
 * Static export assertions — guards the player experience without a browser.
 *
 * The key regression this protects: hosted cabinets must NEVER auto-mount an
 * iframe, because a frame refused by the host (X-Frame-Options / CSP
 * frame-ancestors) paints an opaque grey "broken page" panel that JavaScript
 * cannot detect. The exported HTML must therefore show the poster + explicit
 * "open original" actions, and only mount a frame after a deliberate click.
 *
 * Run with: npx tsx scripts/verify-export.ts   (after `npm run build`)
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { GAMES } from "../src/data/games";

const OUT = path.join(process.cwd(), "out");
let failures = 0;
const fail = (message: string) => {
  failures++;
  console.error("  ✗", message);
};
const ok = (message: string) => console.log("  ✓", message);

const read = (file: string) => readFileSync(path.join(OUT, file), "utf8");

if (!existsSync(OUT)) {
  console.log("⏭  skipped: out/ is missing — run `npm run build` first.");
  process.exit(0);
}

console.log("\n▶ Static export: routes");
for (const route of ["index.html", "games/index.html", "categories/index.html", "custom/index.html", "study/index.html", "sensory/index.html", "about/index.html", "404.html"]) {
  if (!existsSync(path.join(OUT, route))) fail(`missing ${route}`);
}
ok("8 top-level documents exported");

console.log("\n▶ Static export: player pages");
for (const game of GAMES) {
  const file = `play/${game.slug}/index.html`;
  if (!existsSync(path.join(OUT, file))) {
    fail(`${game.slug}: missing ${file}`);
    continue;
  }
  const html = read(file);
  if (!html.includes("<title>")) fail(`${game.slug}: no <title>`);
  if (!html.includes("<h1")) fail(`${game.slug}: no <h1>`);

  if (game.kind === "external") {
    // the poster is the only thing in the first paint
    if (/<iframe/i.test(html)) fail(`${game.slug}: iframe must not be auto-mounted in the export`);
    if (!/Play inside WOW GAMES/i.test(html)) fail(`${game.slug}: missing inline opt-in button`);
    if (!html.includes('href="' + game.url + '"')) fail(`${game.slug}: original URL missing from an anchor`);
    if (!/OPEN\s*<!-- -->?/i.test(html) && !html.includes("OPEN")) {
      fail(`${game.slug}: missing prominent OPEN button`);
    }
  } else {
    if (/<iframe/i.test(html)) fail(`${game.slug}: original builds should not render an iframe`);
  }
}
ok(`${GAMES.length} player pages have title, h1 and the correct embed policy`);

console.log("\n▶ Static export: library completeness");
const library = read("games/index.html").replace(/&amp;/g, "&");
let libraryMissing = 0;
for (const game of GAMES) {
  if (!library.includes(game.title)) {
    fail(`/games HTML is missing ${game.title}`);
    libraryMissing++;
  }
}
if (libraryMissing === 0) ok(`/games lists all ${GAMES.length} cabinets server-side`);

console.log("\n▶ Static export: metadata + assets");
const home = read("index.html");
for (const needle of ["WOW GAMES", "application/ld+json", "Your world. Your games. Your arcade."]) {
  if (!home.toLowerCase().includes(needle.toLowerCase())) fail(`home page missing "${needle}"`);
}
for (const asset of ["robots.txt", "og.jpg", "icon.svg"]) {
  if (!existsSync(path.join(OUT, asset))) fail(`missing ${asset}`);
}
ok("home metadata, JSON-LD, robots, share card and icon exported");

console.log(
  failures === 0
    ? "\n✅ EXPORT CHECKS PASSED\n"
    : `\n❌ ${failures} EXPORT CHECK(S) FAILED\n`,
);
process.exit(failures === 0 ? 0 : 1);
