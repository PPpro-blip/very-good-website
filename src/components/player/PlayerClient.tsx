"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Difficulty, KindBadge } from "@/components/ui/Bits";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { GameArt } from "@/components/games/GameArt";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { CATEGORY_LABEL } from "@/data/categories";
import { GAMES, PLAY_ROUTE, type Game } from "@/data/games";
import { CUSTOM_GAMES, type CustomGameHandle } from "@/games/registry";
import { audio } from "@/lib/audio";
import { useFullscreen } from "@/lib/hooks";
import { bestForGame, formatBest } from "@/lib/scores";
import { store, useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type FrameStatus = "loading" | "loaded" | "slow" | "error";

function hostOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PlayerClient({ slug }: { slug: string }) {
  const game = useMemo(() => GAMES.find((g) => g.slug === slug), [slug]);
  const state = useWowStore();
  const { toast } = useArcade();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<CustomGameHandle | null>(null);
  const { isFullscreen, supported: fullscreenSupported, toggle: toggleFullscreen } =
    useFullscreen(stageRef);
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const [frameKey, setFrameKey] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const recorded = useRef(false);

  /* count the play exactly once per visit */
  useEffect(() => {
    if (!game || recorded.current) return;
    recorded.current = true;
    store.recordPlay(game.slug);
  }, [game]);

  /* stop global single-key shortcuts from stealing game input */
  useEffect(() => {
    document.body.dataset.playing = "1";
    return () => {
      delete document.body.dataset.playing;
    };
  }, []);

  /* external frame watchdog */
  useEffect(() => {
    if (!game || game.kind !== "external") return;
    setFrameStatus("loading");
    const timer = window.setTimeout(() => {
      setFrameStatus((current) => (current === "loading" ? "slow" : current));
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [game, frameKey]);

  if (!game) return null;

  const isOriginal = game.kind === "original";
  const GameComponent = isOriginal ? CUSTOM_GAMES[game.slug] : null;
  const best = bestForGame(state, game.slug);
  const bestLabel = formatBest(game, best);
  const host = hostOf(game.url);

  const related = GAMES.filter(
    (g) =>
      g.slug !== game.slug &&
      (isOriginal ? g.kind === "original" || g.featured : g.categories.some((c) => game.categories.includes(c))),
  ).slice(0, 3);

  const reloadFrame = () => {
    setFrameKey((k) => k + 1);
    setFrameStatus("loading");
    audio.sfx("click");
  };

  const restartGame = () => {
    if (!handleRef.current) {
      toast("Restart inside the game", "This hosted build controls its own restart.", "warn");
      return;
    }
    handleRef.current.restart();
    toast("Restarted", game.title, "good");
  };

  return (
    <div className="shell py-5 md:py-8">
      {/* breadcrumb + title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/games"
          onClick={() => audio.sfx("click")}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/60 transition hover:border-white/30 hover:text-white"
        >
          <Icon name="arrowLeft" size={13} /> Back to arcade
        </Link>
        <div className="flex items-center gap-1.5">
          <FavoriteButton slug={game.slug} title={game.title} className="!h-9 !w-9" />
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="icon-btn !h-9 !w-9"
            aria-label="How to play"
            aria-expanded={showHelp}
          >
            <Icon name="info" size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge game={game} />
            {game.badge ? (
              <span className="chip !border-arc-cyan/30 !bg-arc-cyan/10 !text-arc-cyan !text-[8px]">
                {game.badge}
              </span>
            ) : null}
            {game.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                {CATEGORY_LABEL[cat]}
              </span>
            ))}
          </div>
          <h1 className="mt-2 font-display text-[clamp(26px,5vw,44px)] font-black uppercase leading-none tracking-tight text-white">
            {game.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50">{game.tagline}</p>
        </div>
        {bestLabel ? (
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-2.5">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">
              {game.scoreLabel ?? "Your best"}
            </p>
            <p className="font-display text-xl font-black leading-none text-arc-yellow">{bestLabel}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ------------------------------ stage ------------------------------ */}
        <div>
          <div
            ref={stageRef}
            className={cn(
              "game-fullscreen overflow-hidden border border-white/12 bg-[#070b18]",
              isFullscreen ? "rounded-none" : "rounded-3xl",
            )}
            style={{ boxShadow: `0 40px 110px -70px ${game.palette.from}` }}
          >
            {/* cabinet chrome */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#0a0f1e]/90 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-arc-pink/70" />
                  <span className="h-2 w-2 rounded-full bg-arc-yellow/70" />
                  <span className="h-2 w-2 rounded-full bg-arc-green/70" />
                </span>
                <span className="ml-1 hidden truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/35 sm:block">
                  {isOriginal ? "wowgames://original/" + game.slug : `embed://${host}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isOriginal ? (
                  <button
                    type="button"
                    onClick={restartGame}
                    className="icon-btn !h-8 !w-8"
                    aria-label="Restart game"
                    title="Restart"
                  >
                    <Icon name="rotate" size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={reloadFrame}
                    className="icon-btn !h-8 !w-8"
                    aria-label="Reload embedded game"
                    title="Reload"
                  >
                    <Icon name="rotate" size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!state.muted) audio.sfx("click");
                    store.setMuted(!state.muted);
                  }}
                  className="icon-btn !h-8 !w-8"
                  aria-label={state.muted ? "Enable sound" : "Mute sound"}
                  aria-pressed={!state.muted}
                  title={isOriginal ? "Sound" : "Mutes WOW GAMES audio (the hosted game has its own)"}
                >
                  <Icon name={state.muted ? "muted" : "sound"} size={14} />
                </button>
                {game.url ? (
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-btn !h-8 !w-8"
                    aria-label="Open the original game in a new tab"
                    title="Open original"
                  >
                    <Icon name="external" size={14} />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (!fullscreenSupported) {
                      toast("Fullscreen unavailable", "Your browser does not expose fullscreen.", "warn");
                      return;
                    }
                    void toggleFullscreen();
                    audio.sfx("click");
                  }}
                  className="icon-btn !h-8 !w-8"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  title={fullscreenSupported ? "Fullscreen" : "Fullscreen not supported here"}
                  aria-pressed={isFullscreen}
                >
                  <Icon name={isFullscreen ? "minimize" : "expand"} size={14} />
                </button>
              </div>
            </div>

            {/* play area */}
            <div className="stage-body relative h-[clamp(340px,64vh,660px)] w-full">
              {isOriginal && GameComponent ? (
                <GameComponent ref={handleRef} />
              ) : (
                <>
                  <iframe
                    key={frameKey}
                    src={game.url}
                    title={`${game.title} — hosted game`}
                    className="h-full w-full border-0 bg-[#04060f]"
                    allow="fullscreen; autoplay; gamepad; clipboard-write; encrypted-media"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => {
                      setFrameStatus((current) => (current === "error" ? current : "loaded"));
                    }}
                    onError={() => setFrameStatus("error")}
                  />

                  {frameStatus === "loading" ? (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-[#05070f]">
                      <div className="w-full max-w-xs text-center">
                        <div className="relative mx-auto h-24 w-40 overflow-hidden rounded-xl border border-white/15">
                          <GameArt game={game} />
                          <span className="absolute inset-0 animate-[scan_2.2s_linear_infinite] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                        </div>
                        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-arc-cyan">
                          Connecting to {host || "host"}
                        </p>
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full w-1/2 animate-[ticker_1.4s_linear_infinite] rounded-full bg-gradient-to-r from-arc-cyan to-arc-violet" />
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-white/35">
                          Hosted build — some providers block embedding. An open-directly link is
                          always available.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {frameStatus === "slow" || frameStatus === "error" ? (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-[#05070f]/96 p-5">
                      <div className="w-full max-w-md text-center">
                        <span className="chip !border-arc-orange/40 !bg-arc-orange/10 !text-arc-orange">
                          Embedding blocked or slow
                        </span>
                        <p className="mt-4 font-display text-lg font-black uppercase tracking-[0.06em] text-white">
                          This cabinet lives on {host}
                        </p>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
                          {frameStatus === "error"
                            ? "The browser could not load the embedded frame."
                            : "No response from the embedded frame after 9 seconds. Many hosts block iframes with security headers — the game itself still works perfectly in its own tab."}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          <a
                            href={game.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            <Icon name="external" size={13} /> Open the game
                          </a>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={reloadFrame}>
                            <Icon name="rotate" size={13} /> Try again
                          </button>
                        </div>
                        <p className="mt-3 break-all font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">
                          {game.url}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* under-stage toolbar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={restartGame} className="btn btn-ghost btn-sm">
                <Icon name="rotate" size={13} /> <span>Restart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!fullscreenSupported) {
                    toast("Fullscreen unavailable", "Try a desktop browser.", "warn");
                    return;
                  }
                  void toggleFullscreen();
                }}
                className="btn btn-ghost btn-sm"
              >
                <Icon name="expand" size={13} /> <span>Fullscreen</span>
              </button>
              <Link href="/games" className="btn btn-ghost btn-sm">
                <Icon name="grid" size={13} /> <span>Arcade</span>
              </Link>
            </div>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/25">
              {isOriginal
                ? "Original build · runs fully in your browser"
                : `Hosted externally on ${host} · original URL preserved`}
            </p>
          </div>

          {/* help drawer */}
          {showHelp ? (
            <div className="animate-rise mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="eyebrow">How to play</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">{game.about}</p>
              <ul className="mt-3 space-y-1.5">
                {game.controls.map((control) => (
                  <li key={control} className="flex items-start gap-2 text-[12.5px] text-white/55">
                    <Icon name="chevronRight" size={13} className="mt-0.5 text-arc-cyan" />
                    {control}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* about */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <p className="eyebrow">About this cabinet</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">{game.about}</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                { label: "Difficulty", value: <Difficulty level={game.difficulty} compact /> },
                { label: "Players", value: <span className="text-[12px] text-white/70">{game.players}</span> },
                { label: "Released", value: <span className="text-[12px] text-white/70">{game.released}</span> },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                    {item.label}
                  </p>
                  <div className="mt-1.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------ sidebar ------------------------------ */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <p className="eyebrow">Controls</p>
            <ul className="mt-2.5 space-y-2">
              {game.controls.map((control) => (
                <li key={control} className="flex items-start gap-2 text-[12px] leading-snug text-white/60">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-cyan" />
                  {control}
                </li>
              ))}
            </ul>
            {!isOriginal ? (
              <p className="mt-3 rounded-xl border border-arc-orange/25 bg-arc-orange/[0.07] px-3 py-2 text-[11px] leading-relaxed text-arc-orange/90">
                Hosted build: audio and fullscreen inside the game are controlled by{" "}
                {host}. WOW GAMES only controls its own interface sound.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <p className="eyebrow">Personal best</p>
            <p className="mt-2 font-display text-2xl font-black text-white">
              {bestLabel || "—"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
              {bestLabel
                ? `Saved in this browser. ${state.plays[game.slug] ?? 0} plays recorded.`
                : isOriginal
                  ? "Finish a round to set your first record."
                  : "This hosted game keeps its own scores inside its frame."}
            </p>
            <button
              type="button"
              onClick={() => {
                const added = store.toggleFavorite(game.slug);
                audio.sfx(added ? "coin" : "click");
                toast(added ? "Added to favourites" : "Removed from favourites", game.title, added ? "good" : "default");
              }}
              className="btn btn-ghost btn-sm mt-3 w-full"
            >
              <Icon name="heart" size={12} />
              {state.favorites.includes(game.slug) ? "In favourites" : "Add to favourites"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <p className="eyebrow">Filed under</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {game.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/games?category=${cat}`}
                  className="chip chip-interactive"
                >
                  {CATEGORY_LABEL[cat]}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <p className="eyebrow">Next cabinet</p>
            <ul className="mt-2.5 space-y-1.5">
              {related.map((item: Game) => (
                <li key={item.slug}>
                  <Link
                    href={PLAY_ROUTE(item.slug)}
                    className="group flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-1.5 transition hover:border-white/25 hover:bg-white/[0.05]"
                  >
                    <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-white/10">
                      <GameArt game={item} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-white">
                        {item.title}
                      </span>
                      <span className="block truncate font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
                        {item.kind === "original" ? "Original" : "Hosted"}
                      </span>
                    </span>
                    <Icon name="play" size={12} className="text-arc-cyan" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/games" className="btn btn-ghost btn-sm mt-3 w-full">
              <Icon name="grid" size={12} /> All {GAMES.length} cabinets
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
