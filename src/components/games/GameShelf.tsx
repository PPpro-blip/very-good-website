"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameCard } from "@/components/games/GameCard";
import type { Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrolling discovery shelf.
 *
 * · mouse drag-to-scroll with a click guard (dragging never opens a game)
 * · native touch swipe + CSS scroll snapping
 * · arrow controls that scroll by ~80% of the viewport
 * · every shelf can carry its own accent so sections do not look identical
 */
export function GameShelf({
  id,
  kicker,
  title,
  copy,
  games,
  accent = "#2ee6ff",
  href,
  actionLabel = "See all",
  cardWidth = "w-[248px] sm:w-[264px]",
  variant = "poster",
}: {
  id: string;
  kicker: string;
  title: string;
  copy?: string;
  games: Game[];
  accent?: string;
  href?: string;
  actionLabel?: string;
  cardWidth?: string;
  variant?: "poster" | "spotlight" | "compact";
}) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  if (games.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.82, behavior: "smooth" });
    audio.sfx("click");
  };

  return (
    <section aria-labelledby={`${id}-title`} className="relative">
      {/* accent hairline gives each shelf its own personality */}
      <div
        className="absolute inset-x-0 -top-px h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        aria-hidden
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow" style={{ color: accent }}>
            <span
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
              style={{ background: accent }}
            />
            {kicker}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-2 font-display text-[clamp(22px,3.2vw,32px)] font-black uppercase leading-[0.95] tracking-tight text-white"
          >
            {title}
          </h2>
          {copy ? <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-white/45">{copy}</p> : null}
        </div>

        <div className="flex items-center gap-1.5">
          {href ? (
            <Link
              href={href}
              onClick={() => audio.sfx("click")}
              className="mr-1 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
            >
              {actionLabel}
              <Icon name="arrowRight" size={12} />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} left`}
            className="icon-btn !h-9 !w-9"
          >
            <Icon name="arrowLeft" size={14} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} right`}
            className="icon-btn !h-9 !w-9"
          >
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>

      <div className="relative mt-4">
        <div
          ref={scroller}
          data-dragging={dragging}
          className="shelf flex gap-4 overflow-x-auto pb-2"
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse") return;
            const el = scroller.current;
            if (!el) return;
            drag.current = {
              down: true,
              startX: event.clientX,
              startLeft: el.scrollLeft,
              moved: false,
            };
          }}
          onPointerMove={(event) => {
            const state = drag.current;
            const el = scroller.current;
            if (!state.down || !el) return;
            const delta = event.clientX - state.startX;
            if (Math.abs(delta) > 6 && !state.moved) {
              state.moved = true;
              setDragging(true);
            }
            if (state.moved) el.scrollLeft = state.startLeft - delta;
          }}
          onPointerUp={() => {
            drag.current.down = false;
            setDragging(false);
          }}
          onPointerLeave={() => {
            drag.current.down = false;
            setDragging(false);
          }}
          onClickCapture={(event) => {
            if (drag.current.moved) {
              event.preventDefault();
              event.stopPropagation();
              drag.current.moved = false;
            }
          }}
        >
          {games.map((game) => (
            <div
              key={game.slug}
              className={cn(
                "shrink-0",
                cardWidth,
                variant === "spotlight" && "first:pl-0",
              )}
            >
              <GameCard game={game} showBest={variant !== "compact"} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>

        {/* edge fades hint that the shelf continues */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#05060f] to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
