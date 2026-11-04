"use client";

import { audio } from "@/lib/audio";
import { music, type PatternId } from "@/lib/music";
import { clamp, lerp, mulberry32 } from "@/lib/utils";

/**
 * FLAPPY CHAOS — original one-tap flyer.
 * Adaptive world size, real wing physics, parallax worlds, three themes that
 * unlock with your best score, and its own chiptune loop per theme.
 */

export type FlappyState = "ready" | "running" | "paused" | "dead" | "over";
export type ThemeId = "neon" | "dunes" | "cosmos";

export interface FlappyHud {
  score: number;
  best: number;
  state: FlappyState;
  theme: ThemeId;
  unlocked: ThemeId[];
}

interface Pipe {
  x: number;
  gapY: number;
  gap: number;
  scored: boolean;
  hue: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  gravity: number;
}

interface Theme {
  id: ThemeId;
  name: string;
  sky: [string, string, string];
  sun: string;
  accent: string;
  accent2: string;
  pipe: string;
  pipeEdge: string;
  ground: string;
  music: PatternId;
  unlock: number;
  blurb: string;
}

export const THEMES: Theme[] = [
  {
    id: "neon",
    name: "Neon Sky",
    sky: ["#060a1c", "#12204a", "#1d2f6b"],
    sun: "#ff3fd8",
    accent: "#2ee6ff",
    accent2: "#8b5cf6",
    pipe: "#12c9e6",
    pipeEdge: "#8bf5ff",
    ground: "#050a16",
    music: "flappy-sky",
    unlock: 0,
    blurb: "The default downtown circuit.",
  },
  {
    id: "dunes",
    name: "Sunset Dunes",
    sky: ["#2a0c2e", "#75244a", "#e06b3f"],
    sun: "#ffe066",
    accent: "#ffb03a",
    accent2: "#ff5470",
    pipe: "#ff8a3d",
    pipeEdge: "#ffd7a8",
    ground: "#2a0f24",
    music: "flappy-sunset",
    unlock: 10,
    blurb: "Score 10 to unlock.",
  },
  {
    id: "cosmos",
    name: "Deep Cosmos",
    sky: ["#01030a", "#0a1330", "#1d1046"],
    sun: "#c4b5fd",
    accent: "#c4b5fd",
    accent2: "#4af2a1",
    pipe: "#8b5cf6",
    pipeEdge: "#d9c9ff",
    ground: "#04060f",
    music: "flappy-cosmos",
    unlock: 25,
    blurb: "Score 25 to unlock.",
  },
];

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

const WORLD_H = 560;
const GROUND_H = 74;
const GRAVITY = 1750;
const FLAP = -545;
const MAX_FALL = 900;
const BIRD_R = 17;

export interface FlappyOptions {
  canvas: HTMLCanvasElement;
  initialBest: number;
  initialTheme: ThemeId;
  onHud: (hud: FlappyHud) => void;
  onGameOver: (result: { score: number; newBest: boolean }) => void;
  /** self-playing attract loop for the cinematic hover previews (silenced by caller) */
  attract?: boolean;
}

export class FlappyEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: FlappyOptions;
  private raf = 0;
  private last = 0;
  private destroyed = false;
  private attract: boolean;
  private viewW = 900;
  private dpr = 1;
  private resizeObserver: ResizeObserver | null = null;

  private bird = { x: 200, y: WORLD_H / 2, vy: 0, rotation: 0 };
  private pipes: Pipe[] = [];
  private particles: Particle[] = [];
  private score = 0;
  private best: number;
  private theme: ThemeId;
  private shake = 0;
  private flash = 0;
  private scroll = 0;
  private clouds: { x: number; y: number; r: number; layer: number }[] = [];
  private stars: { x: number; y: number; r: number; layer: number }[] = [];
  private deathAt = 0;
  private lastHud = "";

  state: FlappyState = "ready";

  private readonly onKey = (event: KeyboardEvent) => {
    if ([" ", "ArrowUp", "w", "W"].includes(event.key)) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      event.preventDefault();
      this.tap();
    } else if (event.key === "r" || event.key === "R") {
      this.restart();
    } else if (event.key === "p" || event.key === "P" || event.key === "Escape") {
      if (this.state === "running") this.pause();
      else if (this.state === "paused") this.resume();
    }
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    event.preventDefault();
    this.tap();
  };

  private readonly onVisibility = () => {
    if (document.hidden && this.state === "running") this.pause();
  };

  constructor(options: FlappyOptions) {
    this.attract = options.attract === true;
    this.options = options;
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available");
    this.ctx = ctx;
    this.best = options.initialBest;
    this.theme = options.initialTheme;
    this.resize();
    this.bind();
    this.reset();
    this.render(0);
    this.emit(true);
  }

  private bind() {
    window.addEventListener("keydown", this.onKey);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    document.addEventListener("visibilitychange", this.onVisibility);
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    } else {
      window.addEventListener("resize", this.handleResize);
    }
  }

  private readonly handleResize = () => this.resize();

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width || 900);
    const cssH = Math.max(220, rect.height || 560);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(cssW * this.dpr);
    this.canvas.height = Math.floor(cssH * this.dpr);
    this.viewW = (cssW / cssH) * WORLD_H;
    this.bird.x = Math.min(this.viewW * 0.28, 260);
    if (this.state === "ready") this.render(0);
  }

  private buildDecor() {
    const rnd = mulberry32(9173);
    this.clouds = Array.from({ length: 9 }, () => ({
      x: rnd() * this.viewW,
      y: 60 + rnd() * (WORLD_H - GROUND_H - 200),
      r: 40 + rnd() * 70,
      layer: 0.15 + rnd() * 0.35,
    }));
    this.stars = Array.from({ length: 60 }, () => ({
      x: rnd() * this.viewW,
      y: rnd() * (WORLD_H - GROUND_H - 40),
      r: 0.5 + rnd() * 1.6,
      layer: 0.05 + rnd() * 0.2,
    }));
  }

  private reset() {
    this.bird = { x: Math.min(this.viewW * 0.28, 260), y: WORLD_H / 2, vy: 0, rotation: 0 };
    this.pipes = [];
    this.particles = [];
    this.score = 0;
    this.shake = 0;
    this.flash = 0;
    this.buildDecor();
  }

  setTheme(theme: ThemeId) {
    if (!this.isUnlocked(theme)) return;
    this.theme = theme;
    audio.sfx("click");
    if (this.state === "running") music.start(this.themeSpec.music);
    this.emit(true);
  }

  isUnlocked(theme: ThemeId): boolean {
    const spec = THEMES.find((t) => t.id === theme);
    if (!spec) return false;
    return this.best >= spec.unlock;
  }

  private get themeSpec(): Theme {
    return THEMES.find((t) => t.id === this.theme) ?? THEMES[0];
  }

  start() {
    if (this.state === "running") return;
    this.reset();
    this.state = "running";
    this.bird.vy = FLAP;
    audio.sfx("flap");
    music.start(this.themeSpec.music);
    this.last = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    this.emit(true);
  }

  private tap() {
    if (this.state === "dead") return;
    if (this.state !== "running") {
      this.restart();
      return;
    }
    this.bird.vy = FLAP;
    this.bird.rotation = -0.45;
    audio.sfx("flap");
    this.spawnParticles(this.bird.x - 12, this.bird.y + 8, 5, this.themeSpec.accent, 0.5);
  }

  /** back to the pre-flight screen (used by the theme picker) */
  toReady() {
    music.stop();
    this.reset();
    this.state = "ready";
    this.emit(true);
    this.render(0);
  }

  pause() {
    if (this.state !== "running") return;
    this.state = "paused";
    music.stop();
    this.emit(true);
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "running";
    this.last = performance.now();
    music.start(this.themeSpec.music);
    this.emit(true);
  }

  restart() {
    this.reset();
    this.state = "running";
    this.bird.vy = FLAP;
    audio.sfx("launch");
    music.start(this.themeSpec.music);
    this.last = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    this.emit(true);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    music.stop();
    window.removeEventListener("keydown", this.onKey);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.handleResize);
    this.resizeObserver?.disconnect();
  }

  private emit(force = false) {
    const unlocked = THEMES.filter((t) => this.best >= t.unlock).map((t) => t.id);
    const signature = `${this.score}|${this.best}|${this.state}|${this.theme}|${unlocked.length}`;
    if (force || signature !== this.lastHud) {
      this.lastHud = signature;
      this.options.onHud({
        score: this.score,
        best: this.best,
        state: this.state,
        theme: this.theme,
        unlocked,
      });
    }
  }

  private spawnParticles(x: number, y: number, count: number, color: string, power = 1) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 160 * power - 40,
        vy: (Math.random() - 0.5) * 160 * power,
        life: 0.4 + Math.random() * 0.6,
        size: 1.5 + Math.random() * 3,
        color,
        gravity: 260,
      });
    }
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
  }

  private tick = (now: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(0.045, (now - this.last) / 1000 || 0.016);
    this.last = now;

    if (this.attract && this.state === "over" && now - this.deathAt > 950) {
      this.restart();
    }
    if (this.state === "running" && this.attract) this.autopilot();
    if (this.state === "running" || this.state === "dead") this.update(dt);
    this.updateParticles(dt);
    this.render(dt);
    this.emit();
  };

  /** keep the bird near the middle of the next gap */
  private autopilot() {
    if (this.state !== "running") return;
    const next = this.pipes
      .filter((pipe) => pipe.x + 74 > this.bird.x - 40)
      .sort((a, b) => a.x - b.x)[0];
    // aim low inside the gap: a flap climbs ~85px, so this keeps the bird clear
    // of the top pipe while the floor of the gap stays far away.
    const target = next ? next.gapY + next.gap * 0.7 : 380;
    if (this.bird.y > target) this.tap();
  }

  private update(dt: number) {
    const spec = this.themeSpec;

    if (this.state === "dead") {
      this.bird.vy = Math.min(MAX_FALL, this.bird.vy + GRAVITY * dt * 1.4);
      this.bird.y += this.bird.vy * dt;
      this.bird.rotation = lerp(this.bird.rotation, 1.5, 0.12);
      if (performance.now() - this.deathAt > 620) {
        this.state = "over";
        this.emit(true);
      }
      return;
    }

    this.scroll += (160 + Math.min(120, this.score * 3.4)) * dt;
    this.bird.vy = Math.min(MAX_FALL, this.bird.vy + GRAVITY * dt);
    this.bird.y += this.bird.vy * dt;
    this.bird.rotation = lerp(
      this.bird.rotation,
      clamp(this.bird.vy / 620, -0.5, 1.1),
      clamp(dt * 9, 0, 0.4),
    );

    // ceiling: bounce softly instead of instant death (forgiving arcade feel)
    if (this.bird.y < BIRD_R + 6) {
      this.bird.y = BIRD_R + 6;
      this.bird.vy = Math.max(60, this.bird.vy);
    }

    const groundY = WORLD_H - GROUND_H;
    if (this.bird.y + BIRD_R >= groundY) {
      this.die();
      return;
    }

    // spawn pipes
    const speed = 168 + Math.min(120, this.score * 3.4);
    const spacing = clamp(312 - this.score * 1.2, 250, 312);
    const lastPipe = this.pipes[this.pipes.length - 1];
    if (!lastPipe || lastPipe.x < this.viewW + 90 - spacing) {
      const rnd = Math.random();
      const gap = clamp(206 - this.score * 2.2, 158, 206);
      const minY = 92;
      const maxY = groundY - gap - 92;
      const gapY = minY + rnd * Math.max(40, maxY - minY);
      this.pipes.push({ x: this.viewW + 90, gapY, gap, scored: false, hue: rnd });
    }

    // pipes move + scoring + collision
    for (const pipe of this.pipes) {
      pipe.x -= speed * dt;
      if (!pipe.scored && pipe.x + 38 < this.bird.x - BIRD_R) {
        pipe.scored = true;
        this.score += 1;
        audio.sfx("coin");
        this.spawnParticles(this.bird.x + 24, this.bird.y, 8, spec.accent, 0.8);
      }
      if (this.hitsPipe(pipe, groundY)) {
        this.die();
        return;
      }
    }
    this.pipes = this.pipes.filter((p) => p.x > -120);

  }

  private hitsPipe(pipe: Pipe, groundY: number): boolean {
    const bx = this.bird.x;
    const by = this.bird.y;
    const w = 74;
    const topH = pipe.gapY;
    const bottomY = pipe.gapY + pipe.gap;
    if (bx + BIRD_R < pipe.x || bx - BIRD_R > pipe.x + w) return false;
    if (by - BIRD_R < topH || by + BIRD_R > bottomY) return true;
    return by + BIRD_R > groundY;
  }

  private die() {
    if (this.state !== "running") return;
    this.state = "dead";
    this.deathAt = performance.now();
    this.shake = 14;
    this.flash = 1;
    this.spawnParticles(this.bird.x, this.bird.y, 26, "#ff5470", 1.5);
    audio.sfx("hit");
    music.stop();
    const newBest = this.score > this.best;
    if (newBest) this.best = this.score;
    this.options.onGameOver({ score: this.score, newBest });
    this.emit(true);
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 40);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.4);
  }

  /* -------------------------------- render -------------------------------- */

  private render(dt: number) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = WORLD_H;
    const spec = this.themeSpec;
    const groundY = h - GROUND_H;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (this.shake > 0.3) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, spec.sky[0]);
    sky.addColorStop(0.55, spec.sky[1]);
    sky.addColorStop(1, spec.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, w + 40, h + 40);

    // stars
    for (const star of this.stars) {
      const x = ((star.x - this.scroll * star.layer) % (w + 20) + w + 20) % (w + 20);
      ctx.globalAlpha = 0.25 + (star.r > 1.6 ? 0.5 : 0.2);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // sun / moon
    const sunX = w * 0.76;
    const sunY = h * 0.24;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 120);
    sunGlow.addColorStop(0, `${spec.sun}cc`);
    sunGlow.addColorStop(1, "transparent");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 120, sunY - 120, 240, 240);
    ctx.fillStyle = spec.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
    ctx.fill();

    // cloud / nebula layers
    for (const cloud of this.clouds) {
      const x = ((cloud.x - this.scroll * cloud.layer) % (w + 260) + w + 260) % (w + 260) - 130;
      ctx.globalAlpha = 0.15 + cloud.layer * 0.4;
      ctx.fillStyle = spec.accent;
      ctx.beginPath();
      ctx.ellipse(x, cloud.y, cloud.r, cloud.r * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // distant skyline / dunes
    this.drawBackdrop(ctx, w, groundY, spec);

    // pipes
    for (const pipe of this.pipes) this.drawPipe(ctx, pipe, groundY, spec);

    // ground
    const ground = ctx.createLinearGradient(0, groundY, 0, h);
    ground.addColorStop(0, spec.ground);
    ground.addColorStop(1, "#03040a");
    ctx.fillStyle = ground;
    ctx.fillRect(-20, groundY, w + 40, GROUND_H);
    ctx.strokeStyle = spec.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const gOffset = this.scroll % 44;
    ctx.strokeStyle = `${spec.accent}33`;
    for (let i = -1; i * 44 - gOffset < w + 44; i++) {
      const x = i * 44 - gOffset;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 18, h);
      ctx.stroke();
    }

    // particles
    for (const p of this.particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    this.drawBird(ctx);

    // flash
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,84,112,${this.flash * 0.35})`;
      ctx.fillRect(0, 0, w, h);
    }

    // vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.34, w / 2, h / 2, h);
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, "rgba(2,3,9,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  private drawBackdrop(
    ctx: CanvasRenderingContext2D,
    w: number,
    groundY: number,
    spec: Theme,
  ) {
    const build = (factor: number, color: string, height: number, step: number) => {
      const offset = (this.scroll * factor) % step;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-step, groundY);
      for (let x = -step; x < w + step; x += step) {
        const seed = Math.sin((x + Math.floor(this.scroll * factor)) * 0.01) * 0.5 + 0.5;
        ctx.lineTo(x - offset, groundY - height * (0.4 + seed * 0.9));
        ctx.lineTo(x + step * 0.5 - offset, groundY - height * (0.2 + seed * 0.5));
      }
      ctx.lineTo(w + step, groundY);
      ctx.closePath();
      ctx.fill();
    };

    if (spec.id === "dunes") {
      build(0.12, "rgba(255,138,61,0.25)", 130, 190);
      build(0.24, "rgba(255,84,112,0.28)", 90, 150);
      build(0.4, "rgba(120,30,70,0.55)", 56, 120);
    } else if (spec.id === "cosmos") {
      build(0.08, "rgba(139,92,246,0.22)", 150, 210);
      build(0.18, "rgba(74,242,161,0.12)", 100, 160);
      build(0.32, "rgba(20,16,48,0.8)", 60, 130);
      const planetX = w * 0.22;
      const planetY = 86;
      ctx.fillStyle = "rgba(196,181,253,0.55)";
      ctx.beginPath();
      ctx.arc(planetX, planetY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(196,181,253,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(planetX, planetY, 46, 12, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const offset = (this.scroll * 0.18) % 130;
      for (let i = -1; i * 130 - offset < w + 130; i++) {
        const x = i * 130 - offset;
        const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const bHeight = 80 + seed * 110;
        ctx.fillStyle = "rgba(18,28,64,0.85)";
        ctx.fillRect(x, groundY - bHeight, 104, bHeight);
        ctx.fillStyle = "rgba(46,230,255,0.16)";
        for (let wy = 0; wy < bHeight - 20; wy += 18) {
          for (let wx = 8; wx < 92; wx += 18) {
            if ((wx + wy + i) % 3 === 0) ctx.fillRect(x + wx, groundY - bHeight + wy + 8, 6, 8);
          }
        }
      }
      build(0.3, "rgba(7,10,24,0.9)", 56, 110);
    }
  }

  private drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe, groundY: number, spec: Theme) {
    const w = 74;
    const x = pipe.x;
    const topH = pipe.gapY;
    const bottomY = pipe.gapY + pipe.gap;

    const drawSegment = (y: number, height: number) => {
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, spec.pipe);
      grad.addColorStop(0.45, spec.pipeEdge);
      grad.addColorStop(1, spec.pipe);
      ctx.fillStyle = grad;
      ctx.beginPath();
      roundRectPath(ctx, x, y, w, height, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundRectPath(ctx, x, y, w, height, 10);
      ctx.stroke();
      // rim
      const rimY = y === 0 ? y + height - 16 : y;
      ctx.fillStyle = "rgba(3,6,16,0.45)";
      ctx.fillRect(x - 4, rimY, w + 8, 16);
      ctx.fillStyle = spec.accent;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x - 4, rimY, w + 8, 3);
      ctx.globalAlpha = 1;
    };

    drawSegment(0, topH);
    drawSegment(bottomY, groundY - bottomY);
  }

  private drawBird(ctx: CanvasRenderingContext2D) {
    const { x, y, rotation } = this.bird;
    const spec = this.themeSpec;
    const time = performance.now() / 1000;
    const wing = Math.sin(time * 16) * 0.5 + 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // wing back
    ctx.fillStyle = `${spec.accent}cc`;
    ctx.beginPath();
    ctx.ellipse(-8, 4, 16, 7 + wing * 4, -0.5 - wing * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // body
    const bodyGrad = ctx.createRadialGradient(-4, -6, 3, 0, 0, BIRD_R * 1.8);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(0.35, spec.accent);
    bodyGrad.addColorStop(1, "#0b1024");
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = spec.accent;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(7, -5, 6.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#08101f";
    ctx.beginPath();
    ctx.arc(8.6, -4.6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(9.8, -6.2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.moveTo(15, 2);
    ctx.lineTo(28, 6);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();

    // wing front
    ctx.fillStyle = spec.accent2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(-4, 6, 13, 6 + wing * 5, -0.25 + wing * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}
