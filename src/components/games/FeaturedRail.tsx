"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Difficulty, KindBadge } from "@/components/ui/Bits";
import { GameArt } from "@/components/games/GameArt";
import { GamePreview } from "@/components/games/GamePreview";
import { FEATURED_GAMES, PLAY_ROUTE } from "@/data/games";
import { CATEGORY_LABEL } from "@/data/categories";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Featured showcase: big artwork, auto-advance, arrows, dots and thumbnails.
 * Auto-play pauses on hover, on focus and when motion is disabled.
 */
export function FeaturedRail() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const motion = useMotionEnabled();
  const artRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const active = FEATURED_GAMES[index];
  const count = FEATURED_GAMES.length;

  useEffect(() => {
    if (paused || !motion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 7200);
    return () => window.clearInterval(id);
  }, [paused, motion, count]);

  const go = (next: number, silent = false) => {
    setIndex(((next % count) + count) % count);
    if (!silent) audio.sfx("whoosh");
  };

  const handlePointer = (event: React.PointerEvent) => {
    if (!motion) return;
    const el = panelRef.current;
    const art = artRef.current;
    if (!el || !art) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    art.style.transform = `translate3d(${px * -26}px, ${py * -18}px, 0) scale(1.06)`;
  };

  const resetPointer = () => {
    if (artRef.current) artRef.current.style.transform = "";
  };

  return (
    <section
      id="featured"
      aria-label="Featured games"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        resetPointer();
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        ref={panelRef}
        onPointerMove={handlePointer}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-[30px] border border-white/12 shadow-[0_40px_120px_-60px_#000] transition-shadow duration-500"
        style={
          {
            "--g1": active.palette.from,
            "--g2": active.palette.to,
            boxShadow: `0 40px 120px -70px ${active.palette.from}, 0 0 0 1px ${active.palette.from}22`,
          } as React.CSSProperties
        }
      >
        {/* artwork layer */}
        <div className="absolute inset-0" aria-hidden>
          <div
            ref={artRef}
            key={active.slug}
            className="absolute inset-[-4%] animate-[rise_0.7s_ease-out_both] transition-transform duration-500 ease-out"
          >
            <GamePreview game={active} active={hovered} showBadge={false} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#04060f] via-[#04060f]/85 to-[#04060f]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-transparent to-[#04060f]/50" />
          <div className="absolute inset-0 scanlines opacity-40" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-11">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#04050c]"
                style={{
                  background: `linear-gradient(100deg, ${active.palette.from}, ${active.palette.to})`,
                }}
              >
                <Icon name="star" size={10} /> Featured
              </span>
              <KindBadge game={active} />
              {active.isNew ? (
                <span className="badge-new rounded-full px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.16em]">
                  New
                </span>
              ) : null}
              {active.categories.includes("multiplayer") ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-arc-blue/40 bg-arc-blue/10 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-arc-cyan">
                  <Icon name="flame" size={9} /> {active.players}
                </span>
              ) : null}
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            <div key={`${active.slug}-title`} className="animate-[rise_0.5s_ease-out_both]">
              <h2 className="mt-4 font-display text-[clamp(32px,5.4vw,58px)] font-black uppercase leading-[0.92] tracking-[-0.01em] text-white">
                {active.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65 sm:text-[15px]">
                {active.featuredBlurb ?? active.description}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {active.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="chip !text-[8px]">
                  {CATEGORY_LABEL[cat]}
                </span>
              ))}
              <span className="chip !text-[8px]">
                <Icon name="gamepad" size={10} /> {active.players}
              </span>
              <span className="chip !text-[8px]">
                <Difficulty level={active.difficulty} compact /> {active.difficulty}/5
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={PLAY_ROUTE(active.slug)}
                onClick={() => audio.sfx("launch")}
                className="btn btn-primary !px-6"
              >
                <Icon name="play" size={14} /> <span>Play {active.title}</span>
              </Link>
              <Link
                href={`/games?category=${active.categories[0]}`}
                onClick={() => audio.sfx("click")}
                className="btn btn-ghost"
              >
                Explore {CATEGORY_LABEL[active.categories[0]]}
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/30">
              <Icon name={active.preview?.live ? "gamepad" : "external"} size={10} />
              {active.preview?.live
                ? "Hover the artwork for real in-engine gameplay"
                : active.kind === "external"
                  ? `Hosted on ${new URL(active.url ?? "https://wow.games").hostname.replace(/^www\./, "")}`
                  : "Procedural artwork · original build"}
            </p>
          </div>

          {/* thumbnail switcher */}
          <div className="flex flex-col justify-end gap-3">
            <div className="hidden lg:block" />
            <div className="grid grid-cols-5 gap-2" role="tablist" aria-label="Featured games">
              {FEATURED_GAMES.map((game, i) => (
                <button
                  key={game.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${game.title}`}
                  onClick={() => go(i)}
                  className={cn(
                    "group relative aspect-[3/4] overflow-hidden rounded-xl border transition-all duration-300",
                    i === index
                      ? "border-white/60 shadow-[0_0_20px_-4px_var(--g1)]"
                      : "border-white/12 opacity-60 hover:opacity-100",
                  )}
                >
                  <GameArt game={game} />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1 pb-1 pt-4 text-[7px] font-semibold uppercase leading-tight tracking-[0.06em] text-white/80">
                    {game.title}
                  </span>
                  {i === index ? (
                    <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-arc-cyan to-arc-magenta" />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5" aria-hidden>
                {FEATURED_GAMES.map((g, i) => (
                  <span
                    key={g.slug}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === index ? "w-6 bg-white" : "w-2.5 bg-white/25",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="icon-btn !h-9 !w-9"
                  onClick={() => go(index - 1)}
                  aria-label="Previous featured game"
                >
                  <Icon name="arrowLeft" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-btn !h-9 !w-9"
                  onClick={() => go(index + 1)}
                  aria-label="Next featured game"
                >
                  <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
