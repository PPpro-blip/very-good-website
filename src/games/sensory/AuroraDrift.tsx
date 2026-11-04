"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CustomGameHandle } from "@/games/registry";
import { audio } from "@/lib/audio";
import { useWowStore } from "@/lib/store";
import { clamp } from "@/lib/utils";

type Mood = "calm" | "pulse" | "prism";

const MOODS: { id: Mood; name: string; blurb: string; hue: number }[] = [
  { id: "calm", name: "Calm", blurb: "Slow ribbons, cool blues.", hue: 200 },
  { id: "pulse", name: "Pulse", blurb: "Rings on every beat.", hue: 320 },
  { id: "prism", name: "Prism", blurb: "Rainbow sparks everywhere.", hue: 280 },
];

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
  size: number;
}

/** AURORA DRIFT — the WOW GAMES sensory toy. Nothing to win, nothing to lose. */
export const AuroraDrift = forwardRef<CustomGameHandle, Record<string, never>>(
  function AuroraDrift(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mood, setMood] = useState<Mood>("calm");
    const [chimes, setChimes] = useState(true);
    const [still, setStill] = useState(false);
    const { motion } = useWowStore();
    const moodRef = useRef(mood);
    const stillRef = useRef(still);
    const chimesRef = useRef(chimes);
    const resetRef = useRef<() => void>(() => {});

    moodRef.current = mood;
    stillRef.current = still;
    chimesRef.current = chimes;

    useImperativeHandle(ref, () => ({
      restart: () => resetRef.current(),
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let dpr = 1;
      let raf = 0;
      let last = performance.now();
      let lastChime = 0;
      let time = 0;
      let hueShift = 0;
      const pointer = { x: 0, y: 0, px: 0, py: 0, active: false, speed: 0 };
      const sparks: Spark[] = [];
      const ripples: { x: number; y: number; r: number; hue: number; life: number }[] = [];
      const stillMode = stillRef.current;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(240, rect.width);
        height = Math.max(200, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#04060f";
        ctx.fillRect(0, 0, width, height);
        pointer.x = width / 2;
        pointer.y = height / 2;
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      };

      const spawnSpark = (x: number, y: number, hue: number, power = 1) => {
        sparks.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 220 * power,
          vy: (Math.random() - 0.5) * 220 * power,
          life: 0.7 + Math.random() * 0.9,
          hue: hue + Math.random() * 50 - 25,
          size: 1 + Math.random() * 2.6,
        });
        if (sparks.length > 320) sparks.splice(0, sparks.length - 320);
      };

      const chime = (x: number) => {
        if (!chimesRef.current) return;
        const now = performance.now();
        if (now - lastChime < 150) return;
        lastChime = now;
        const note = SCALE[Math.floor((x / Math.max(1, width)) * SCALE.length) % SCALE.length];
        audio.note(note, 0.5, "sine", 0.035);
      };

      const onPointerMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
        pointer.active = true;
      };
      const onPointerDown = (event: PointerEvent) => {
        onPointerMove(event);
        audio.unlock();
        const m = moodRef.current;
        ripples.push({
          x: pointer.x,
          y: pointer.y,
          r: 6,
          hue: m === "calm" ? 195 : m === "pulse" ? 320 : hueShift,
          life: 1,
        });
        if (m !== "calm") {
          for (let i = 0; i < 12; i++) spawnSpark(pointer.x, pointer.y, m === "prism" ? hueShift : 320, 1.2);
        }
        chime(pointer.x);
      };
      const onPointerLeave = () => {
        pointer.active = false;
      };
      const onPointerUp = () => {
        /* keep painting while hovering */
      };

      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        time += dt;
        hueShift = (hueShift + dt * 26) % 360;
        const m = moodRef.current;
        const stillness = stillRef.current;

        // slow fade creates the ribbon trail effect
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(4,6,15,${stillness ? 0.16 : 0.085})`;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "lighter";

        // ambient drifting orbs (also the idle state)
        if (!stillness) {
          for (let i = 0; i < 5; i++) {
            const phase = time * (0.18 + i * 0.05) + i * 1.7;
            const ox = width * (0.5 + Math.sin(phase) * (0.3 + i * 0.03));
            const oy = height * (0.5 + Math.cos(phase * 1.14 + i) * (0.28 + i * 0.02));
            const r = 40 + i * 22;
            const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
            const hue = m === "calm" ? 200 + i * 12 : m === "pulse" ? 320 + i * 8 : hueShift + i * 30;
            grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.16)`);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ox, oy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // pointer ribbon
        if (pointer.active) {
          const speed = clamp(pointer.speed, 0, 80);
          const hue =
            m === "calm"
              ? 190 + Math.sin(time * 0.6) * 30
              : m === "pulse"
                ? 300 + Math.sin(time * 2.4) * 40
                : hueShift;
          const thickness = 2 + speed * 0.22;

          ctx.strokeStyle = `hsla(${hue}, 100%, 68%, 0.85)`;
          ctx.lineWidth = thickness;
          ctx.lineCap = "round";
          ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.9)`;
          ctx.shadowBlur = 22;
          ctx.beginPath();
          ctx.moveTo(pointer.px, pointer.py);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (speed > 6) {
            if (!stillness) {
              for (let i = 0; i < (m === "prism" ? 3 : 1); i++) {
                spawnSpark(pointer.x, pointer.y, m === "prism" ? hueShift : hue, 0.45);
              }
            }
            if (m !== "calm") chime(pointer.x);
          }
          if (m === "pulse" && Math.random() < 0.14) {
            ripples.push({ x: pointer.x, y: pointer.y, r: 4, hue, life: 1 });
          }
          pointer.px = pointer.x;
          pointer.py = pointer.y;
          pointer.speed *= 0.86;
        }

        // ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const ripple = ripples[i];
          ripple.r += dt * 190;
          ripple.life -= dt * 0.75;
          if (ripple.life <= 0) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `hsla(${ripple.hue}, 100%, 70%, ${ripple.life * 0.55})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
          const spark = sparks[i];
          spark.life -= dt;
          if (spark.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          spark.vx *= 0.985;
          spark.vy = spark.vy * 0.985 + 22 * dt;
          ctx.fillStyle = `hsla(${spark.hue}, 100%, 72%, ${clamp(spark.life, 0, 1) * 0.85})`;
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";

        // gentle vignette
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.3,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.75,
        );
        vignette.addColorStop(0, "transparent");
        vignette.addColorStop(1, "rgba(2,3,9,0.55)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

      };

      resetRef.current = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#04060f";
        ctx.fillRect(0, 0, width, height);
        sparks.length = 0;
        ripples.length = 0;
        audio.sfx("whoosh");
      };

      resize();
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => resize())
          : null;
      observer?.observe(canvas.parentElement ?? canvas);
      window.addEventListener("resize", resize);

      // the loop always runs: pointer painting must work even in still mode,
      // where ambient motion is skipped instead
      if (stillMode) {
        const grad = ctx.createLinearGradient(0, height, width, 0);
        grad.addColorStop(0, "rgba(46,230,255,0.14)");
        grad.addColorStop(0.5, "rgba(139,92,246,0.12)");
        grad.addColorStop(1, "rgba(255,63,216,0.14)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      raf = requestAnimationFrame(draw);

      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerLeave);

      return () => {
        cancelAnimationFrame(raf);
        observer?.disconnect();
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      };
    }, [motion, mood, still]);

    const handleMood = useCallback((next: Mood) => {
      setMood(next);
      audio.sfx("chime");
      resetRef.current();
    }, []);

    return (
      <div className="game-surface relative h-full w-full overflow-hidden bg-[#04060f]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          aria-label="Aurora Drift sensory canvas. Move your pointer to paint light."
          role="img"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
          <div className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 backdrop-blur-md">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">
              Sensory · nothing to lose
            </p>
            <p className="font-display text-sm font-black uppercase tracking-[0.08em] text-white">
              Aurora Drift
            </p>
          </div>
          <p className="pointer-events-none rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 backdrop-blur">
            move / drag to paint
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
          <div className="flex gap-1.5 rounded-full border border-white/12 bg-black/45 p-1 backdrop-blur-md">
            {MOODS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMood(item.id)}
                aria-pressed={mood === item.id}
                className={`rounded-full px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition ${
                  mood === item.id
                    ? "bg-white text-[#04050c]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
                title={item.blurb}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setChimes((v) => !v);
                if (!chimes) {
                  audio.unlock();
                  audio.sfx("chime");
                }
              }}
              aria-pressed={chimes}
              className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/45 px-3 py-2 font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/70 backdrop-blur-md transition hover:text-white"
            >
              <Icon name={chimes ? "sound" : "muted"} size={12} /> Chimes
            </button>
            <button
              type="button"
              onClick={() => setStill((v) => !v)}
              aria-pressed={still}
              className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/45 px-3 py-2 font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/70 backdrop-blur-md transition hover:text-white"
              title="Reduce animation for comfort"
            >
              <Icon name={still ? "eye" : "wave"} size={12} /> {still ? "Still" : "Motion"}
            </button>
            <button
              type="button"
              onClick={() => resetRef.current()}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-black/45 text-white/70 backdrop-blur-md transition hover:text-white"
              aria-label="Clear the canvas"
            >
              <Icon name="rotate" size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
