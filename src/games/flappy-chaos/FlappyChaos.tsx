"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CustomGameHandle } from "@/games/registry";
import { FlappyEngine, THEMES, type FlappyHud, type ThemeId } from "./engine";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";

const THEME_KEY = "wowgames.flappy.theme";

export const FlappyChaos = forwardRef<CustomGameHandle, Record<string, never>>(
  function FlappyChaos(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<FlappyEngine | null>(null);
    const [hud, setHud] = useState<FlappyHud>({
      score: 0,
      best: 0,
      state: "ready",
      theme: "neon",
      unlocked: ["neon"],
    });
    const [result, setResult] = useState<{ score: number; newBest: boolean } | null>(null);
    const [best, setBest] = useState(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const storedBest = store.getBest("flappy-chaos");
      setBest(storedBest);
      let storedTheme: ThemeId = "neon";
      try {
        const raw = window.localStorage.getItem(THEME_KEY) as ThemeId | null;
        if (raw && THEMES.some((t) => t.id === raw)) storedTheme = raw;
      } catch {
        /* ignore */
      }
      const engine = new FlappyEngine({
        canvas,
        initialBest: storedBest,
        initialTheme: storedTheme,
        onHud: setHud,
        onGameOver: (res) => {
          store.submitScore("flappy-chaos", res.score);
          setBest((prev) => Math.max(prev, res.score));
          setResult(res);
        },
      });
      engineRef.current = engine;
      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      restart: () => {
        setResult(null);
        engineRef.current?.restart();
      },
      pause: () => {
        engineRef.current?.pause();
      },
    }));

    const pickTheme = (id: ThemeId) => {
      engineRef.current?.setTheme(id);
      try {
        window.localStorage.setItem(THEME_KEY, id);
      } catch {
        /* ignore */
      }
    };

    const state = hud.state;
    const score = state === "ready" ? 0 : hud.score;

    return (
      <div className="game-surface relative h-full w-full overflow-hidden bg-[#04060f]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Flappy Chaos. Press space, click or tap to fly."
          role="img"
        />

        {/* score HUD */}
        {(state === "running" || state === "dead" || state === "paused") && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 sm:p-4">
            <div className="rounded-xl border border-white/12 bg-black/45 px-3 py-2 backdrop-blur-md">
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">
                {THEMES.find((t) => t.id === hud.theme)?.name}
              </p>
              <p className="font-display text-2xl font-black leading-none text-white">{score}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full border border-white/12 bg-black/45 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-arc-yellow backdrop-blur-md">
                <Icon name="trophy" size={10} /> {Math.max(best, hud.best)}
              </span>
              <button
                type="button"
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur-md hover:text-white"
                onClick={() => {
                  if (state === "running") engineRef.current?.pause();
                  else if (state === "paused") engineRef.current?.resume();
                }}
                aria-label={state === "paused" ? "Resume" : "Pause"}
              >
                <Icon name={state === "paused" ? "play" : "pause"} size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ready */}
        {state === "ready" ? (
          <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#03040b]/70 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-arc-yellow">
                One tap · endless skies
              </p>
              <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-[0.04em] text-white">
                Flappy Chaos
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-[12.5px] leading-relaxed text-white/55">
                Tap, click or press space to fly. Thread the pipes — gravity does the rest.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {THEMES.map((theme) => {
                  const unlocked = hud.unlocked.includes(theme.id);
                  const active = hud.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => pickTheme(theme.id)}
                      className={cn(
                        "relative overflow-hidden rounded-xl border p-2 text-left transition",
                        active
                          ? "border-white/60 bg-white/10"
                          : "border-white/12 bg-white/[0.03] hover:border-white/30",
                        !unlocked && "opacity-45",
                      )}
                      aria-pressed={active}
                      title={unlocked ? theme.blurb : `Locked — ${theme.blurb}`}
                    >
                      <span
                        className="block h-8 w-full rounded-md"
                        style={{
                          background: `linear-gradient(135deg, ${theme.sky[1]}, ${theme.sky[2]} 60%, ${theme.accent})`,
                        }}
                      />
                      <span className="mt-1.5 block truncate font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-white/80">
                        {theme.name}
                      </span>
                      {!unlocked ? (
                        <span className="mt-0.5 flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-white/45">
                          <Icon name="target" size={8} /> {theme.unlock} pts
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => engineRef.current?.restart()}
                className="btn btn-primary mt-5 !px-6"
              >
                <Icon name="play" size={14} /> <span>Start flying</span>
              </button>
              <p className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">
                Space / click / tap · R to restart · P to pause
              </p>
            </div>
          </div>
        ) : null}

        {/* paused */}
        {state === "paused" ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#03040b]/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-3xl border border-white/12 bg-[#080c19]/95 p-6 text-center">
              <p className="font-display text-xl font-black uppercase tracking-[0.1em] text-white">
                Paused
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => engineRef.current?.resume()}
                >
                  <Icon name="play" size={12} /> Resume
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setResult(null);
                    engineRef.current?.restart();
                  }}
                >
                  <Icon name="rotate" size={12} /> Restart
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* game over */}
        {state === "over" ? (
          <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#03040b]/78 p-4 backdrop-blur-sm">
            <div className="animate-pop w-full max-w-sm rounded-3xl border border-white/12 bg-[#080c19]/95 p-6 text-center">
              <span
                className={cn(
                  "chip",
                  result?.newBest
                    ? "!border-arc-yellow/50 !bg-arc-yellow/15 !text-arc-yellow"
                    : "!border-white/20 !text-white/60",
                )}
              >
                {result?.newBest ? "New personal best" : "Run over"}
              </span>
              <p className="mt-4 font-display text-[clamp(42px,10vw,64px)] font-black leading-none text-white">
                {result?.score ?? hud.score}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                pipes cleared · best {Math.max(best, hud.best)}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {THEMES.map((theme) => {
                  const unlocked = hud.unlocked.includes(theme.id);
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => pickTheme(theme.id)}
                      className={cn(
                        "rounded-xl border p-1.5",
                        hud.theme === theme.id
                          ? "border-white/50 bg-white/10"
                          : "border-white/10 bg-white/[0.03]",
                        !unlocked && "opacity-40",
                      )}
                      aria-label={`Theme ${theme.name}`}
                      aria-pressed={hud.theme === theme.id}
                    >
                      <span
                        className="block h-5 w-full rounded"
                        style={{
                          background: `linear-gradient(120deg, ${theme.sky[1]}, ${theme.accent})`,
                        }}
                      />
                      <span className="mt-1 block truncate font-mono text-[7px] uppercase tracking-[0.06em] text-white/60">
                        {unlocked ? theme.name : `Locked ${theme.unlock}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setResult(null);
                    engineRef.current?.restart();
                  }}
                >
                  <Icon name="rotate" size={12} /> One more run
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setResult(null);
                    engineRef.current?.toReady();
                  }}
                >
                  Change theme
                </button>
              </div>
              <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
                or press space to fly again
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
