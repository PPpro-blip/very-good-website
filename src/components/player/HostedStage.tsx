"use client";

import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import type { Game } from "@/data/games";
import { audio } from "@/lib/audio";
import { cn } from "@/lib/utils";

/**
 * Hosted (external) cabinets.
 *
 * Why this is poster-first instead of "always mount an iframe":
 * a page can refuse to be framed (`X-Frame-Options` / CSP `frame-ancestors`) and
 * the browser then paints an opaque grey "broken page" panel. That refusal is
 * **not detectable from JavaScript** — a cross-origin frame exposes no document,
 * and Chrome still fires `load`. So the only way to guarantee the player never
 * looks broken is to show a real cabinet poster first, keep a permanent
 * "open the original" action on screen, and let the visitor opt into the inline
 * frame. If that frame stays blank, one click returns to the poster.
 */

export type HostedStageHandle = {
  /** reload the frame, mounting it first when the poster is showing */
  reload: () => void;
  /** mount the inline frame (used by the toolbar) */
  openInline: () => void;
  /** go back to the poster */
  showPoster: () => void;
};

type Status = "poster" | "loading" | "ready" | "slow";

const SLOW_AFTER_MS = 12000;
const HINT_AFTER_MS = 2600;

export function HostedStage({
  game,
  host,
  ref,
}: {
  game: Game;
  host: string;
  ref?: Ref<HostedStageHandle>;
}) {
  const url = game.url ?? "";
  const [status, setStatus] = useState<Status>("poster");
  const [frameKey, setFrameKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const openInline = useCallback(() => {
    clearTimers();
    setShowHint(false);
    setStatus("loading");
    setFrameKey((key) => key + 1);
    audio.sfx("launch");
    timers.current.push(
      window.setTimeout(() => {
        setStatus((current) => (current === "loading" ? "slow" : current));
      }, SLOW_AFTER_MS),
    );
  }, [clearTimers]);

  const reload = useCallback(() => openInline(), [openInline]);

  const showPoster = useCallback(() => {
    clearTimers();
    setStatus("poster");
    setShowHint(false);
    audio.sfx("click");
  }, [clearTimers]);

  useEffect(() => {
    const handle = { reload, openInline, showPoster };
    if (typeof ref === "function") {
      ref(handle);
      return () => {
        ref(null);
      };
    }
    if (ref) {
      ref.current = handle;
      return () => {
        ref.current = null;
      };
    }
    return undefined;
  }, [ref, reload, openInline, showPoster]);

  const handleLoad = () => {
    clearTimers();
    // A `load` event is NOT proof that the game rendered: a blocked frame fires
    // it too. We only stop the loading animation and offer the escape hatches.
    setStatus("ready");
    setShowHint(true);
    timers.current.push(window.setTimeout(() => setShowHint(false), HINT_AFTER_MS + 6000));
  };

  const handleError = () => {
    clearTimers();
    setStatus("slow");
  };

  const title = game.title.toUpperCase();

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070f]">
      {/* poster layer — always the thing you see by default */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          status === "poster" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={status !== "poster"}
      >
        <div className="absolute inset-0 scale-105 opacity-70">
          <GameArt game={game} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-[#05070f]/78 to-[#05070f]/40" />
        <div className="relative flex h-full flex-col items-center justify-center gap-2.5 px-5 py-4 text-center">
          <span className="chip !border-arc-cyan/35 !bg-arc-cyan/10 !text-[8px] !text-arc-cyan">
            Hosted cabinet · {host}
          </span>
          <p className="font-display text-[clamp(20px,4.2vw,38px)] font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_0_24px_rgba(46,230,255,0.35)]">
            {game.title}
          </p>
          <p className="max-w-md text-[12.5px] leading-relaxed text-white/55 line-clamp-2">
            {game.tagline}
          </p>
          <div className="mt-1.5 flex w-full flex-col items-stretch justify-center gap-2 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audio.sfx("launch")}
              className="btn btn-primary justify-center"
            >
              <Icon name="external" size={14} /> OPEN {title}
            </a>
            <button type="button" onClick={openInline} className="btn btn-ghost justify-center">
              <Icon name="play" size={13} /> Play inside WOW GAMES
            </button>
          </div>
          <p className="mt-1 max-w-sm text-[10.5px] leading-relaxed text-white/35">
            Some hosts block being embedded for security. This cabinet lives on {host} — the
            button above opens the original game in a new tab and always works.
          </p>
        </div>
      </div>

      {/* inline frame */}
      {status !== "poster" ? (
        <>
          <iframe
            key={frameKey}
            src={url}
            title={`${game.title} — hosted game on ${host}`}
            className="absolute inset-0 h-full w-full border-0 bg-[#04060f]"
            allow="fullscreen; autoplay; gamepad; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* permanent escape hatches — never hidden, even over a blocked frame */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-end justify-between gap-2 p-2">
            <span className="sr-only" role="status" aria-live="polite">
              {status === "ready"
                ? `Embedded view requested for ${game.title}. If the panel is blank, open the original game.`
                : status === "slow"
                  ? `${host} did not respond inside the embedded frame.`
                  : ""}
            </span>
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-arc-cyan/40 bg-[#05070f]/90 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-arc-cyan shadow-lg backdrop-blur transition hover:border-arc-cyan hover:bg-[#05070f]"
              >
                <Icon name="external" size={11} /> Open {game.title}
              </a>
              <button
                type="button"
                onClick={showPoster}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#05070f]/90 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/70 shadow-lg backdrop-blur transition hover:border-white/45 hover:text-white"
              >
                <Icon name="grid" size={11} /> Poster
              </button>
            </div>
            {showHint && status === "ready" ? (
              <p className="pointer-events-auto mr-auto max-w-[15rem] rounded-full border border-white/12 bg-[#05070f]/90 px-3 py-1.5 text-[9.5px] leading-snug text-white/50 shadow-lg backdrop-blur">
                Panel blank? {host} may refuse embedding — use “Open {game.title}”.
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {/* loading stage */}
      {status === "loading" ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#05070f]/92 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-arc-cyan/25 border-t-arc-cyan [animation-duration:1.4s]" />
              <span className="absolute inset-2 animate-spin rounded-full border-2 border-arc-violet/25 border-b-arc-violet [animation-duration:2.1s] [animation-direction:reverse]" />
              <span className="absolute inset-[1.35rem] animate-pulse rounded-full bg-arc-cyan/25 blur-[6px]" />
              <Icon name="gamepad" size={18} className="relative text-arc-cyan" />
            </div>
            <p className="mt-4 font-display text-[13px] font-black uppercase tracking-[0.14em] text-white">
              Booting {game.title}
            </p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
              Connecting to {host}
            </p>
            <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-1/2 animate-[ticker_1.3s_linear_infinite] rounded-full bg-gradient-to-r from-arc-cyan via-arc-blue to-arc-violet" />
            </div>
            <p className="mx-auto mt-3 max-w-[16rem] text-[10.5px] leading-relaxed text-white/35">
              Hosted builds can refuse to load inside another site. If nothing appears, open the
              original game instead — it always works.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audio.sfx("launch")}
                className="btn btn-primary btn-sm"
              >
                <Icon name="external" size={12} /> Open {game.title}
              </a>
              <button type="button" onClick={showPoster} className="btn btn-ghost btn-sm">
                Back to poster
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* stuck / refused */}
      {status === "slow" ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#05070f]/95 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md text-center" role="alert">
            <span className="chip !border-arc-orange/40 !bg-arc-orange/10 !text-[8px] !text-arc-orange">
              No response from {host}
            </span>
            <p className="mt-3 font-display text-[clamp(17px,3vw,22px)] font-black uppercase tracking-[0.04em] text-white">
              {game.title} lives on its own host
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-white/50">
              The embedded frame never finished loading. Many game hosts block iframes with security
              headers — the game itself is fine, it just needs its own tab.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audio.sfx("launch")}
                className="btn btn-primary btn-sm"
              >
                <Icon name="external" size={12} /> OPEN {title}
              </a>
              <button type="button" onClick={openInline} className="btn btn-ghost btn-sm">
                <Icon name="rotate" size={12} /> Try again
              </button>
              <button type="button" onClick={showPoster} className="btn btn-ghost btn-sm">
                <Icon name="grid" size={12} /> Poster
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">
              {url}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
