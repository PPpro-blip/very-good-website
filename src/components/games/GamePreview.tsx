"use client";

import { useEffect, useRef, useState } from "react";
import { GameArt } from "@/components/games/GameArt";
import type { Game } from "@/data/games";
import { LiveAttract } from "@/games/previews/LiveAttract";
import { useFinePointer, useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Cinematic card preview.
 *
 * Priority order, all of it lazy (nothing mounts until the card is active):
 *  1. real gameplay clip — `game.preview.video` (mp4/webm in /public/previews)
 *  2. live engine attract mode — `game.preview.live` (original builds only)
 *  3. animated poster — the procedural artwork with a slow light sweep
 *
 * There is never a stock clip pretending to be a game: if we do not have footage
 * of a cabinet, it gets its own animated artwork and the live/video slot stays
 * empty until real footage is added. Videos are muted, looped, inline and only
 * played on hover/focus; reduced-motion visitors get the still poster.
 */
export function GamePreview({
  game,
  active,
  className,
  showBadge = true,
}: {
  game: Game;
  active: boolean;
  className?: string;
  showBadge?: boolean;
}) {
  const motion = useMotionEnabled();
  const fine = useFinePointer();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLive, setVideoLive] = useState(false);
  const [armed, setArmed] = useState(false);

  const video = game.preview?.video;
  const live = game.preview?.live;
  // hover-only effects never run on touch or when motion is disabled
  const wants = active && motion && fine;

  // a short hover delay keeps fast mouse sweeps from booting an engine per card
  useEffect(() => {
    if (!wants) {
      setArmed(false);
      return;
    }
    const id = window.setTimeout(() => setArmed(true), 220);
    return () => window.clearTimeout(id);
  }, [wants]);

  useEffect(() => {
    const el = videoRef.current;
    if (!armed || !video || !el) {
      setVideoLive(false);
      return;
    }
    el.currentTime = 0;
    const played = el.play();
    if (played && typeof played.catch === "function") played.catch(() => setVideoLive(false));
    return () => {
      el.pause();
    };
  }, [armed, video]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* poster: always present, so there is never an empty frame */}
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-[900ms] ease-out",
          active && motion ? "scale-[1.05]" : "scale-100",
        )}
      >
        <GameArt game={game} />
      </div>

      {/* animated poster sweep (also the fallback when no footage exists) */}
      {motion ? (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            active ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="absolute inset-y-0 -left-1/2 w-[70%] animate-[sweep_7s_linear_infinite] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.13),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_115%,rgba(3,5,14,0.62),transparent_62%)]" />
        </div>
      ) : null}

      {/* real footage, when a cabinet has some */}
      {video ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            armed && videoLive ? "opacity-100" : "opacity-0",
          )}
          src={video}
          poster={game.preview?.poster}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onPlaying={() => setVideoLive(true)}
          onError={() => setVideoLive(false)}
        />
      ) : null}

      {/* live engine gameplay (original builds) */}
      {armed && !video && live ? (
        <div className="absolute inset-0 animate-[fadeIn_450ms_ease-out]">
          <LiveAttract slug={live} />
        </div>
      ) : null}

      {/* honesty labels: they describe what is actually on screen */}
      {showBadge && armed ? (
        <span
          className={cn(
            "absolute right-2 top-2 z-[3] inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.16em] backdrop-blur",
            live && !video
              ? "border-arc-cyan/50 bg-black/60 text-arc-cyan"
              : video
                ? "border-arc-green/50 bg-black/60 text-arc-green"
                : "border-white/15 bg-black/50 text-white/45",
          )}
        >
          <span
            className={cn(
              "h-1 w-1 rounded-full",
              live && !video ? "animate-pulse bg-arc-cyan" : video ? "bg-arc-green" : "bg-white/40",
            )}
          />
          {live && !video ? "live gameplay" : video ? "gameplay" : "artwork"}
        </span>
      ) : null}
    </div>
  );
}
