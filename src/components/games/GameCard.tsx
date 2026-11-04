"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Difficulty, KindBadge } from "@/components/ui/Bits";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { GamePreview } from "@/components/games/GamePreview";
import { Magnetic } from "@/components/ui/Magnetic";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { PLAY_ROUTE, type Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { useFinePointer, useMotionEnabled } from "@/lib/hooks";
import { bestForGame, formatBest } from "@/lib/scores";
import { useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL } from "@/data/categories";

/**
 * The signature WOW GAMES card: a miniature arcade cabinet.
 *
 * Pointer behaviour (mouse only, motion only):
 *  · whole cabinet tilts up to 4.5° on each axis
 *  · artwork drifts with parallax
 *  · a gradient border + sheen follows the cursor
 *  · everything springs back on exit
 * Touch devices get a clean press state instead — no jittery tilt.
 */
export function GameCard({
  game,
  className,
  showBest = true,
}: {
  game: Game;
  className?: string;
  showBest?: boolean;
}) {
  const cabinetRef = useRef<HTMLElement | null>(null);
  const artRef = useRef<HTMLDivElement | null>(null);
  const fine = useFinePointer();
  const motion = useMotionEnabled();
  const state = useWowStore();
  const { launchGame } = useArcade();
  const interactive = fine && motion;
  const [active, setActive] = useState(false);

  const best = bestForGame(state, game.slug);
  const bestLabel = formatBest(game, best);

  const handleMove = (event: React.PointerEvent) => {
    if (!interactive) return;
    const el = cabinetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(1100px) rotateX(${(py - 0.5) * -4.5}deg) rotateY(${
      (px - 0.5) * 5.5
    }deg) translate3d(0,-4px,0)`;
    if (artRef.current) {
      artRef.current.style.transform = `translate3d(${(px - 0.5) * -12}px, ${
        (py - 0.5) * -10
      }px, 0) scale(1.07)`;
    }
  };

  const handleLeave = () => {
    setActive(false);
    const el = cabinetRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "0%");
    if (artRef.current) artRef.current.style.transform = "";
  };

  const play = () => audio.sfx(game.kind === "original" ? "launch" : "click");

  return (
    <article
      ref={cabinetRef}
      className={cn("cabinet group/card h-full transition-transform duration-200 ease-out", className)}
      style={
        {
          "--g1": game.palette.from,
          "--g2": game.palette.to,
          "--glow": `${game.palette.from}66`,
        } as React.CSSProperties
      }
      onPointerMove={handleMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={handleLeave}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onPointerCancel={handleLeave}
    >
      <div className="cabinet-card">
        <div
          className="marquee-strip"
          style={{
            background: `linear-gradient(90deg, ${game.palette.from}26, rgba(255,255,255,0.02) 60%, ${game.palette.to}1f)`,
          }}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <KindBadge game={game} />
            {game.isNew ? (
              <span className="badge-new rounded-full px-1.5 py-[1px] font-mono text-[7.5px] font-black uppercase tracking-[0.14em]">
                New
              </span>
            ) : null}
            {game.badge && game.kind === "original" ? null : (
              <span className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">
                {game.categories.slice(0, 2).map((c) => CATEGORY_LABEL[c]).join(" / ")}
              </span>
            )}
          </span>
          <FavoriteButton slug={game.slug} title={game.title} />
        </div>

        <div className="relative">
        <Link
          href={PLAY_ROUTE(game.slug)}
          onClick={play}
          className="screen scanlines vignette relative block aspect-[16/10] overflow-hidden"
          aria-label={`Open ${game.title}`}
        >
          <div
            ref={artRef}
            className="absolute inset-[-6%] transition-transform duration-500 ease-out"
            aria-hidden
          >
            <GamePreview game={game} active={active} />
          </div>

          {game.featured ? (
            <span className="cabinet-flag absolute left-2 top-2 z-[5] inline-flex items-center gap-1 rounded-full px-2 py-[3px] font-mono text-[7.5px] font-black uppercase tracking-[0.16em]">
              <Icon name="star" size={8} /> Featured
            </span>
          ) : null}

          {/* bottom info gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-1/2 bg-gradient-to-t from-[#05070f] via-[#05070f]/50 to-transparent" />

          {/* resting strip: controls + personal best */}
          <div className="absolute inset-x-0 bottom-0 z-[5] flex items-end justify-between gap-2 p-3 transition-all duration-300 group-hover/card:pointer-events-none group-hover/card:translate-y-1 group-hover/card:opacity-0 group-focus-within/card:opacity-0">
            <span className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white/75">
              {game.controls[0]?.split("—")[0]?.trim() || "Mouse + keys"}
            </span>
            {showBest && bestLabel ? (
              <span className="flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-arc-yellow backdrop-blur">
                <Icon name="trophy" size={9} />
                {bestLabel}
              </span>
            ) : null}
          </div>

          {/* hover quick-info: what it is, how it plays, who it is for */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 z-[6] translate-y-3 rounded-xl border border-white/15 bg-[#05070f]/92 p-2.5 opacity-0 backdrop-blur-md transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100">
            <p className="font-mono text-[7.5px] uppercase tracking-[0.16em] text-white/40">Quick info</p>
            <ul className="mt-1 space-y-0.5">
              {game.controls.slice(0, 2).map((control) => (
                <li key={control} className="truncate text-[10px] leading-tight text-white/70">
                  {control}
                </li>
              ))}
            </ul>
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-[0.14em] text-white/45">
              <span>{game.players}</span>
              <span className="h-2.5 w-px bg-white/15" />
              <span>{CATEGORY_LABEL[game.categories[0]]}</span>
            </div>
          </div>
        </Link>

        {/* the one control that matters — launches with the arcade transition */}
        <div className="pointer-events-none absolute inset-0 z-[7] grid place-items-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
          <Magnetic strength={9} className="pointer-events-auto">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                audio.unlock();
                launchGame(game.slug);
              }}
              className="group/play flex items-center gap-2 rounded-full border border-white/40 bg-black/60 py-2 pl-2 pr-4 backdrop-blur-md transition-colors duration-200 hover:border-white hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arc-cyan"
              aria-label={`Play ${game.title} now`}
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[#04050c] transition-transform duration-300 group-hover/play:scale-110"
                style={{ background: `linear-gradient(120deg, ${game.palette.from}, ${game.palette.to})` }}
              >
                <Icon name="play" size={12} />
              </span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Play now
              </span>
            </button>
          </Magnetic>
        </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={PLAY_ROUTE(game.slug)}
              onClick={play}
              className="font-display text-[15px] font-bold uppercase leading-tight tracking-[0.01em] text-white transition-colors group-hover/card:text-white"
            >
              {game.title}
            </Link>
            <span className="mt-1 shrink-0">
              <Difficulty level={game.difficulty} compact />
            </span>
          </div>

          <p className="line-2 mt-1.5 text-[12.5px] leading-relaxed text-white/50">{game.tagline}</p>

          <div className="mt-3 flex flex-wrap gap-1 overflow-hidden">
            {game.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/45"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">
              {game.players}
            </span>
            <Link
              href={PLAY_ROUTE(game.slug)}
              onClick={play}
              className="group/btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              Play
              <Icon
                name="arrowRight"
                size={12}
                className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="cabinet-sheen" aria-hidden />
    </article>
  );
}
