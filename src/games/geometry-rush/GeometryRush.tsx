"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CustomGameHandle } from "@/games/registry";
import { GeometryRushEngine, type GRHud, type GRResult } from "./engine";
import { audio } from "@/lib/audio";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";

type Result = GRResult & { newBest?: boolean };

const LEVELS = [
  { id: 1, name: "Neon Circuit", blurb: "Learn the rhythm", accent: "#2ee6ff" },
  { id: 2, name: "Voltage Run", blurb: "Faster. Meaner.", accent: "#ff8a3d" },
  { id: 3, name: "Singularity", blurb: "No mercy", accent: "#ff3fd8" },
];

const INITIAL_HUD: GRHud = {
  level: 1,
  levelName: "NEON CIRCUIT",
  progress: 0,
  score: 0,
  coins: 0,
  deaths: 0,
  state: "ready",
  checkpoint: 0,
};

export const GeometryRush = forwardRef<CustomGameHandle, Record<string, never>>(
  function GeometryRush(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<GeometryRushEngine | null>(null);
    const [hud, setHud] = useState<GRHud>(INITIAL_HUD);
    const [result, setResult] = useState<Result | null>(null);
    const [bests, setBests] = useState<Record<number, number>>({});

    useEffect(() => {
      setBests({
        1: store.getBest("geometry-rush:1"),
        2: store.getBest("geometry-rush:2"),
        3: store.getBest("geometry-rush:3"),
      });
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const engine = new GeometryRushEngine({
        canvas,
        onHud: (next) => setHud(next),
        onComplete: (res) => {
          const isBest = store.submitScore(`geometry-rush:${res.level}`, res.score);
          setBests((prev) => ({
            ...prev,
            [res.level]: Math.max(prev[res.level] ?? 0, res.score),
          }));
          setResult({ ...res, newBest: isBest });
          if (isBest) audio.sfx("levelup");
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
        engineRef.current?.restartLevel((hud.level ?? 1) - 1);
      },
      pause: () => {
        engineRef.current?.togglePause();
      },
    }));

    const startLevel = useCallback((index: number) => {
      setResult(null);
      engineRef.current?.setLevel(index);
      engineRef.current?.begin();
    }, []);

    const state = hud.state;

    return (
      <div className="game-surface relative h-full w-full overflow-hidden bg-[#04060f]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Geometry Rush. Press space or tap to jump."
          role="img"
        />

        {/* ---------------- HUD ---------------- */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="rounded-xl border border-white/12 bg-black/45 px-3 py-2 backdrop-blur-md">
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">
                Level {hud.level} · {hud.levelName}
              </p>
              <p className="font-display text-lg font-black leading-none text-white">
                {hud.score.toLocaleString()}
                <span className="ml-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                  pts
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full border border-white/12 bg-black/45 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-arc-yellow backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-arc-yellow" /> {hud.coins}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-white/12 bg-black/45 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/60 backdrop-blur-md">
                  <Icon name="target" size={10} /> {hud.deaths}
                </span>
                <button
                  type="button"
                  className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur-md transition hover:text-white"
                  onClick={() => engineRef.current?.togglePause()}
                  aria-label={state === "paused" ? "Resume game" : "Pause game"}
                >
                  <Icon name={state === "paused" ? "play" : "pause"} size={13} />
                </button>
              </div>
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                Best {bests[hud.level] ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/50">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150"
                style={{
                  width: `${hud.progress}%`,
                  background: "linear-gradient(90deg,#2ee6ff,#8b5cf6,#ff3fd8)",
                  boxShadow: "0 0 16px rgba(46,230,255,0.6)",
                }}
              />
              {[38, 72].map((p) => (
                <span
                  key={p}
                  className="absolute top-0 h-full w-px bg-white/40"
                  style={{ left: `${p}%` }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-white/30">
              <span>{Math.round(hud.progress)}% through</span>
              <span>{hud.checkpoint > 0 ? "checkpoint saved" : "no checkpoint yet"}</span>
            </div>
          </div>
        </div>

        {/* ---------------- ready / level select ---------------- */}
        {state === "ready" ? (
          <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#03040b]/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg">
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.24em] text-arc-cyan">
                One button · three levels
              </p>
              <h3 className="mt-2 text-center font-display text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
                Geometry Rush
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-center text-[12.5px] leading-relaxed text-white/50">
                Jump the spikes. Clear the blocks. Hit the checkpoints. Hold jump for a higher arc,
                release for a tighter one.
              </p>

              <div className="mt-5 space-y-2">
                {LEVELS.map((level, i) => (
                  <div
                    key={level.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.03] p-2.5"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-black"
                      style={{
                        background: `${level.accent}1f`,
                        border: `1px solid ${level.accent}55`,
                        color: level.accent,
                      }}
                    >
                      {level.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-white">
                        {level.name}
                      </p>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/40">
                        {level.blurb} · best {bests[level.id] ?? 0}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startLevel(i)}
                      className="btn btn-sm shrink-0"
                      style={{
                        background: `linear-gradient(100deg, ${level.accent}, #ffffff)`,
                        color: "#04050c",
                      }}
                    >
                      <Icon name="play" size={11} /> Play
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                Space / tap to jump · P pause · R restart
              </p>
            </div>
          </div>
        ) : null}

        {/* ---------------- paused ---------------- */}
        {state === "paused" ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#03040b]/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#080c19]/95 p-6 text-center">
              <p className="font-display text-xl font-black uppercase tracking-[0.1em] text-white">
                Paused
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                Level {hud.level} · {Math.round(hud.progress)}% · {hud.score} pts
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
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
                    engineRef.current?.restartLevel(hud.level - 1);
                  }}
                >
                  <Icon name="rotate" size={12} /> Restart
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setResult(null);
                    engineRef.current?.setLevel(hud.level - 1);
                  }}
                >
                  Levels
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- death flash ---------------- */}
        {state === "dead" ? (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
            <p className="animate-pop rounded-full border border-arc-pink/40 bg-black/60 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-arc-pink backdrop-blur">
              Wrecked · returning to checkpoint
            </p>
          </div>
        ) : null}

        {/* ---------------- level complete ---------------- */}
        {state === "complete" && result ? (
          <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#03040b]/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/12 bg-[#080c19]/95 p-6 text-center">
              <span className="chip !border-arc-green/40 !bg-arc-green/15 !text-arc-green">
                Level clear
              </span>
              <p className="mt-4 font-display text-[clamp(36px,8vw,58px)] font-black leading-none text-white">
                {result.score.toLocaleString()}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                points · {result.coins} coins · {result.deaths} deaths
              </p>
              {result.newBest ? (
                <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-arc-yellow">
                  <Icon name="trophy" size={11} /> new personal best
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {result.level < 3 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => startLevel(result.level)}
                  >
                    Next level <Icon name="arrowRight" size={12} />
                  </button>
                ) : (
                  <span className="chip !border-arc-green/40 !text-arc-green">
                    <Icon name="trophy" size={11} /> arcade cleared
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => startLevel(result.level - 1)}
                >
                  <Icon name="rotate" size={12} /> Replay
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setResult(null);
                    engineRef.current?.setLevel(result.level - 1);
                  }}
                >
                  Levels
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* mobile jump button */}
        <button
          type="button"
          onClick={() => engineRef.current?.jump()}
          className={cn(
            "absolute bottom-4 right-4 z-20 grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition active:scale-95 sm:hidden",
            state !== "running" && "pointer-events-none opacity-0",
          )}
          aria-label="Jump"
        >
          <Icon name="arrowRight" size={22} className="-rotate-90" />
        </button>
      </div>
    );
  },
);
