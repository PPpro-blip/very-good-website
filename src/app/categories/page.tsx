import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { CATEGORIES } from "@/data/categories";
import { GAMES, gamesByCategory } from "@/data/games";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Pick an aisle: action, multiplayer, platformers, casual, experimental, puzzle, study games, sensory and arcade classics.",
};

export default function CategoriesPage() {
  return (
    <div className="shell py-10 md:py-14">
      <p className="eyebrow" style={{ color: "#8b5cf6" }}>
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-violet align-middle" />
        The aisles of the arcade
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-[clamp(32px,6vw,56px)] font-black uppercase leading-[0.92] tracking-tight text-white">
        Every aisle has its own lighting
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
        Ten ways into the arcade. Filters are live on the library page, and each category has its
        own colour identity so you always know which room you walked into.
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((category) => {
          const games =
            category.id === "featured"
              ? GAMES.filter((g) => g.featured)
              : gamesByCategory(category.id);
          return (
            <Link
              key={category.id}
              href={category.id === "featured" ? "/games" : `/games?category=${category.id}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#080c19]/80 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-[50px] transition-opacity duration-500 group-hover:opacity-45"
                style={{ background: `radial-gradient(circle, ${category.accent}, transparent 65%)` }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl border font-display text-xl font-black"
                  style={{
                    borderColor: `${category.accent}44`,
                    background: `${category.accent}14`,
                    color: category.accent,
                  }}
                  aria-hidden
                >
                  {category.glyph}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                  {games.length} {games.length === 1 ? "game" : "games"}
                </span>
              </div>

              <h2 className="relative mt-4 font-display text-lg font-black uppercase tracking-[0.02em] text-white">
                {category.label}
              </h2>
              <p className="relative mt-1.5 text-[12.5px] leading-relaxed text-white/45">
                {category.blurb}
              </p>

              <div className="relative mt-4 flex gap-2">
                {games.slice(0, 4).map((game) => (
                  <span
                    key={game.slug}
                    className="relative h-16 w-[52px] overflow-hidden rounded-lg border border-white/10"
                    title={game.title}
                  >
                    <GameArt game={game} />
                  </span>
                ))}
              </div>

              <span className="relative mt-4 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors group-hover:text-white">
                Enter aisle
                <Icon
                  name="arrowRight"
                  size={12}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
