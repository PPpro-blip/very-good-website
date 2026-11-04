"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { GAMES, PLAY_ROUTE, type Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * "Surprise me" wheel.
 *
 * A real selection animation: the cabinet artwork cycles for ~1.5s, decelerates
 * into one genuinely playable game (every entry comes from the registry), and
 * offers PLAY / SPIN AGAIN / BROWSE. Escape closes it, Enter plays the pick.
 */
export function Roulette({
  open,
  onClose,
  onPlay,
}: {
  open: boolean;
  onClose: () => void;
  onPlay: (slug: string) => void;
}) {
  const [current, setCurrent] = useState<Game>(GAMES[0]);
  const [pick, setPick] = useState<Game | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinTimer = useRef<number | null>(null);
  const stopTimer = useRef<number | null>(null);
  const motion = useMotionEnabled();
  const playRef = useRef<HTMLButtonElement | null>(null);

  const clearTimers = useCallback(() => {
    if (spinTimer.current) window.clearInterval(spinTimer.current);
    if (stopTimer.current) window.clearTimeout(stopTimer.current);
    spinTimer.current = null;
    stopTimer.current = null;
  }, []);

  const spin = useCallback(() => {
    clearTimers();
    setPick(null);
    setSpinning(true);
    audio.sfx("whoosh");

    let pool = GAMES;
    let i = Math.floor(Math.random() * pool.length);
    let ticks = 0;
    spinTimer.current = window.setInterval(() => {
      i = (i + 1) % pool.length;
      setCurrent(pool[i]);
      // a tick every other frame keeps the roll percussive without machine-gunning
      if (ticks % 2 === 0) audio.sfx("tick");
      ticks += 1;
    }, 80);

    stopTimer.current = window.setTimeout(() => {
      clearTimers();
      const final = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(final);
      setPick(final);
      setSpinning(false);
      audio.sfx("success");
    }, motion ? 1500 : 120);
  }, [clearTimers, motion]);

  useEffect(() => {
    if (!open) {
      clearTimers();
      setPick(null);
      setSpinning(false);
      return;
    }
    spin();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => playRef.current?.focus(), 1600);
    return () => {
      clearTimers();
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previous;
    };
  }, [open, spin, clearTimers]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter" && pick) {
        event.preventDefault();
        onPlay(pick.slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pick, onClose, onPlay]);

  if (!open) return null;
  const shown = pick ?? current;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center px-4">
      <div className="absolute inset-0 bg-[#02030a]/85 backdrop-blur-md" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="roulette-title"
        className="animate-pop relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/12 bg-[#070b16]/98 shadow-[0_50px_140px_-40px_#000]"
      >
        <div className="relative h-44 overflow-hidden sm:h-52">
          <div key={shown.slug} className="absolute inset-0 animate-[fadeIn_180ms_ease-out]">
            <GameArt game={shown} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/40 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <Icon name="flame" size={10} className={cn(spinning && "animate-pulse")} />
            {spinning ? "Spinning…" : "The arcade has chosen"}
          </span>
        </div>

        <div className="relative -mt-10 px-4 pb-4 sm:px-6 sm:pb-6">
          <h2
            id="roulette-title"
            className="font-display text-[clamp(22px,4vw,30px)] font-black uppercase leading-none tracking-tight text-white"
          >
            {shown.title}
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">{shown.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              ref={playRef}
              type="button"
              onClick={() => onPlay(shown.slug)}
              disabled={spinning}
              className="btn btn-primary btn-sm disabled:opacity-50"
            >
              <Icon name="play" size={12} /> Play {shown.title}
            </button>
            <button type="button" onClick={spin} className="btn btn-ghost btn-sm">
              <Icon name="rotate" size={12} /> Spin again
            </button>
            <a href={PLAY_ROUTE(shown.slug)} onClick={onClose} className="btn btn-ghost btn-sm">
              <Icon name="info" size={12} /> Cabinet page
            </a>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-white/35 transition hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
