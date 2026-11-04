"use client";

import { useEffect, useRef } from "react";
import { useMotionEnabled } from "@/lib/hooks";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  phase: number;
}

const COLORS = ["#2ee6ff", "#8b5cf6", "#ff3fd8", "#4d7cff", "#4af2a1"];

/**
 * Ambient particle field.
 * Deliberately cheap: a capped particle count, DPR capped at 1.5, 30fps budget,
 * no shadows, one composite operation, and it fully stops when the tab is hidden
 * or the player has motion disabled. Content always renders above it.
 */
export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const density = window.innerWidth < 768 ? 16 : window.innerWidth < 1200 ? 30 : 44;
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.05 - Math.random() * 0.18,
        r: 0.6 + Math.random() * 1.9,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.18 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = (now: number) => {
      raf = window.requestAnimationFrame(draw);
      if (document.hidden) return;
      // ~33fps is plenty for dust and saves battery
      if (now - last < 30) return;
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.phase += 0.01 * dt;
        p.x += (p.vx + Math.sin(p.phase) * 0.06) * dt;
        p.y += p.vy * dt;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 26000 && dist2 > 1) {
            const force = (1 - dist2 / 26000) * 0.55;
            const dist = Math.sqrt(dist2);
            p.x += (dx / dist) * force * dt;
            p.y += (dy / dist) * force * dt;
          }
        }

        if (p.y < -20) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -24) p.x = width + 20;
        if (p.x > width + 24) p.x = -20;

        ctx.globalAlpha = p.alpha * (0.7 + Math.sin(p.phase) * 0.3);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    if (motionEnabled) {
      raf = window.requestAnimationFrame(draw);
    } else {
      // static frame: a single gentle scatter, no animation loop at all
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [motionEnabled]);

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-70"
      />
      <div className="noise" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(2,3,8,0.7)_100%)]"
      />
    </>
  );
}
