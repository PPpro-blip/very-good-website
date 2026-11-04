"use client";

import { audio } from "@/lib/audio";
import { music, type PatternId } from "@/lib/music";
import { clamp, lerp, mulberry32 } from "@/lib/utils";

/**
 * GEOMETRY RUSH — original one-button precision runner.
 *
 * Written for WOW GAMES: fixed-timestep physics, coyote time, jump buffering,
 * hold-for-height jumps, checkpoints, particle bursts, screen shake and a
 * per-level original chiptune track. Levels are authored with safe spacing
 * derived from the jump arc, so every hazard is actually clearable.
 */

export type GRState = "ready" | "running" | "paused" | "dead" | "complete";

export interface GRHud {
  level: number;
  levelName: string;
  progress: number;
  score: number;
  coins: number;
  deaths: number;
  state: GRState;
  checkpoint: number;
}

export interface GRResult {
  level: number;
  score: number;
  progress: number;
  deaths: number;
  coins: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "spike" | "block" | "saw" | "pad" | "coin" | "checkpoint" | "finish";
  used?: boolean;
  spin?: number;
}

export interface LevelSpec {
  index: number;
  name: string;
  length: number;
  speed: number;
  obstacles: Obstacle[];
  hueA: string;
  hueB: string;
  pattern: PatternId;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

const WORLD_H = 540;

/** roundRect without relying on the (newer) canvas API */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
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
const GROUND_H = 92;
const PLAYER_SIZE = 34;
const GRAVITY = 2750;
const JUMP_VELOCITY = -960;
const MAX_FALL = 1500;
const COYOTE_MS = 95;
const BUFFER_MS = 130;

export interface GROptions {
  canvas: HTMLCanvasElement;
  onHud: (hud: GRHud) => void;
  onComplete: (result: GRResult) => void;
}

/** --- level authoring --------------------------------------------------- */

/**
 * Levels are built with a cursor that always leaves a minimum clearance after
 * the *end* of the previous hazard (clusters included). That spacing is derived
 * from the level's speed and the real jump arc, which is why every section is
 * clearable — verified by scripts/simulate-geometry.ts.
 */
export function buildLevel(index: number): LevelSpec {
  const rnd = mulberry32(1337 + index * 977);
  const speed = [352, 424, 498][index] ?? 420;
  const length = [6200, 7300, 8300][index] ?? 6500;
  const groundY = WORLD_H - GROUND_H;
  const obstacles: Obstacle[] = [];
  const SPIKE_W = 34;
  const SPIKE_H = 40;

  let cursor = 780;
  // clearance is measured from the END of the previous hazard/cluster and is
  // deliberately generous: a full jump covers ~0.7s, so this leaves a real
  // reaction window after every landing (tighter on harder levels).
  const tightness = [0, 0.03, 0.07][index] ?? 0.03;
  const clearance = () => speed * (0.9 + tightness + rnd() * 0.35);

  const spike = (count = 1) => {
    cursor += clearance();
    for (let i = 0; i < count; i++) {
      obstacles.push({
        x: cursor + i * SPIKE_W,
        y: groundY - SPIKE_H,
        w: SPIKE_W,
        h: SPIKE_H,
        type: "spike",
      });
    }
    cursor += count * SPIKE_W;
  };
  const block = (h = 54) => {
    cursor += clearance();
    obstacles.push({ x: cursor, y: groundY - h, w: 52, h, type: "block" });
    cursor += 52;
  };
  const saw = () => {
    cursor += clearance();
    obstacles.push({ x: cursor, y: groundY - 26, w: 52, h: 52, type: "saw", spin: rnd() * 6 });
    cursor += 52;
  };
  const pad = () => {
    cursor += clearance();
    obstacles.push({ x: cursor, y: groundY - 14, w: 46, h: 14, type: "pad" });
    cursor += 46;
  };
  const coins = (count = 3, height = 118) => {
    const base = cursor + 60;
    for (let i = 0; i < count; i++) {
      obstacles.push({
        x: base + i * 40,
        y: groundY - height - Math.sin(i / 1.4) * 14,
        w: 22,
        h: 22,
        type: "coin",
      });
    }
  };

  const sequences: (() => void)[][] = [
    [
      () => spike(1),
      () => spike(2),
      () => coins(3),
      () => block(54),
      () => spike(1),
      () => saw(),
      () => spike(2),
      () => block(60),
      () => coins(3, 132),
      () => spike(1),
      () => pad(),
      () => spike(3),
      () => saw(),
      () => spike(1),
      () => block(48),
      () => spike(2),
      () => coins(4, 112),
      () => spike(1),
      () => saw(),
      () => spike(2),
    ],
    [
      () => spike(2),
      () => block(56),
      () => spike(1),
      () => saw(),
      () => spike(3),
      () => block(66),
      () => coins(3, 134),
      () => spike(2),
      () => pad(),
      () => saw(),
      () => spike(2),
      () => block(58),
      () => spike(1),
      () => saw(),
      () => spike(3),
      () => block(72),
      () => spike(2),
      () => saw(),
      () => pad(),
      () => spike(2),
      () => coins(4, 124),
    ],
    [
      () => spike(2),
      () => saw(),
      () => spike(3),
      () => block(62),
      () => spike(2),
      () => saw(),
      () => pad(),
      () => spike(3),
      () => saw(),
      () => spike(2),
      () => block(70),
      () => saw(),
      () => coins(3, 142),
      () => spike(3),
      () => block(66),
      () => spike(2),
      () => saw(),
      () => pad(),
      () => spike(2),
      () => block(74),
      () => spike(4),
      () => saw(),
    ],
  ];

  const sequence = sequences[Math.min(index, sequences.length - 1)];
  sequence.forEach((step) => step());

  // fill the rest of the track with a rhythm that keeps the same clearance rules
  let guard = 0;
  while (cursor < length - 1300 && guard++ < 60) {
    const roll = rnd();
    if (roll < 0.4) spike(rnd() < 0.3 ? 2 : 1);
    else if (roll < 0.6) block(48 + Math.round(rnd() * 3) * 10);
    else if (roll < 0.82) saw();
    else {
      pad();
      coins(3, 128);
    }
  }

  // checkpoints: nudge past any nearby hazard so respawns are always safe
  [0.38, 0.72].forEach((at) => {
    let cx = length * at;
    obstacles
      .filter((o) => o.type !== "coin" && Math.abs(o.x - cx) < 320)
      .forEach((o) => {
        cx = Math.max(cx, o.x + o.w + 96);
      });
    obstacles.push({ x: cx, y: groundY - 76, w: 20, h: 76, type: "checkpoint" });
  });

  obstacles.push({ x: Math.min(length, cursor + 220), y: groundY - 150, w: 26, h: 150, type: "finish" });
  obstacles.sort((a, b) => a.x - b.x);

  return {
    index,
    name: ["NEON CIRCUIT", "VOLTAGE RUN", "SINGULARITY"][index] ?? "BONUS",
    length,
    speed,
    obstacles,
    hueA: ["#2ee6ff", "#ff8a3d", "#ff3fd8"][index] ?? "#2ee6ff",
    hueB: ["#4d7cff", "#ff3fd8", "#8b5cf6"][index] ?? "#8b5cf6",
    pattern: (["rush-1", "rush-2", "rush-3"][index] ?? "rush-1") as PatternId,
  };
}

export class GeometryRushEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GROptions;
  private level: LevelSpec;
  private levelIndex: number;
  private raf = 0;
  private lastTime = 0;
  private accumulator = 0;
  private viewW = 960;
  private viewH = WORLD_H;
  private dpr = 1;
  private destroyed = false;
  private resizeObserver: ResizeObserver | null = null;

  state: GRState = "ready";
  private player = { x: 0, y: 0, vy: 0, onGround: true, rotation: 0, holding: false };
  private lastGroundAt = 0;
  private jumpRequestedAt = -9999;
  private camX = 0;
  private particles: Particle[] = [];
  private shake = 0;
  private deathAt = 0;
  private coins = 0;
  private deaths = 0;
  private respawnX = 0;
  private checkpoint = 0;
  private levelStartAt = 0;
  private mountainLayers: { points: number[]; color: string; factor: number }[] = [];
  private lastHud = "";

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const key = event.key;
    if ([" ", "ArrowUp", "w", "W"].includes(key)) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      event.preventDefault();
      if (this.state === "ready") this.begin();
      else this.jump();
    } else if (key === "p" || key === "P" || key === "Escape") {
      if (this.state === "running") this.pause();
      else if (this.state === "paused") this.resume();
    } else if (key === "r" || key === "R") {
      this.restart();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if ([" ", "ArrowUp", "w", "W"].includes(event.key)) this.player.holding = false;
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    event.preventDefault();
    if (this.state === "ready") this.begin();
    else if (this.state === "running") this.jump();
  };

  private readonly onPointerUp = () => {
    this.player.holding = false;
  };

  private readonly onVisibility = () => {
    if (document.hidden && this.state === "running") this.pause();
  };

  constructor(options: GROptions) {
    this.options = options;
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available in this browser");
    this.ctx = ctx;
    this.levelIndex = 0;
    this.level = buildLevel(0);
    this.resize();
    this.bindEvents();
    this.resetRun();
    this.render(0);
    this.emitHud();
  }

  private bindEvents() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
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
    const cssW = Math.max(320, rect.width || 960);
    const cssH = Math.max(220, rect.height || 540);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(cssW * this.dpr);
    this.canvas.height = Math.floor(cssH * this.dpr);
    this.viewW = (cssW / cssH) * WORLD_H;
    this.viewH = WORLD_H;
    this.buildMountains();
    if (this.state === "ready") this.render(0);
  }

  private buildMountains() {
    const rnd = mulberry32(4242 + this.levelIndex * 31);
    this.mountainLayers = [
      { color: "rgba(77,124,255,0.16)", factor: 0.16, points: [] },
      { color: "rgba(139,92,246,0.2)", factor: 0.3, points: [] },
      { color: "rgba(46,230,255,0.12)", factor: 0.48, points: [] },
    ].map((layer) => {
      const points: number[] = [];
      for (let i = 0; i <= 24; i++) points.push(rnd());
      return { ...layer, points };
    });
  }

  private resetRun() {
    this.player = {
      x: 0,
      y: WORLD_H - GROUND_H - PLAYER_SIZE,
      vy: 0,
      onGround: true,
      rotation: 0,
      holding: false,
    };
    this.camX = 0;
    this.coins = 0;
    this.respawnX = 0;
    this.checkpoint = 0;
    this.particles = [];
    this.levelStartAt = performance.now();
    this.level.obstacles.forEach((o) => {
      if (o.type === "coin") o.used = false;
    });
  }

  setLevel(index: number) {
    this.levelIndex = clamp(index, 0, 2);
    this.level = buildLevel(this.levelIndex);
    this.deaths = 0;
    this.buildMountains();
    this.resetRun();
    this.state = "ready";
    music.stop();
    this.render(0);
    this.emitHud(true);
  }

  begin() {
    if (this.state === "running" || this.state === "complete") return;
    if (this.state === "ready") {
      this.resetRun();
      this.deaths = 0;
    }
    this.state = "running";
    this.levelStartAt = performance.now();
    audio.sfx("launch");
    music.start(this.level.pattern);
    this.lastTime = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    this.emitHud(true);
  }

  jump() {
    if (this.state !== "running") return;
    const now = performance.now();
    const canGround = this.player.onGround || now - this.lastGroundAt < COYOTE_MS;
    if (canGround) {
      this.player.vy = JUMP_VELOCITY;
      this.player.onGround = false;
      this.player.holding = true;
      this.spawnBurst(
        this.player.x + PLAYER_SIZE / 2,
        this.player.y + PLAYER_SIZE,
        10,
        this.level.hueA,
        0.9,
      );
      audio.sfx("jump");
    } else {
      this.jumpRequestedAt = now;
    }
  }

  pause() {
    if (this.state !== "running") return;
    this.state = "paused";
    music.stop();
    audio.sfx("pause");
    this.emitHud(true);
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "running";
    this.lastTime = performance.now();
    music.start(this.level.pattern);
    audio.sfx("click");
    this.emitHud(true);
  }

  restart() {
    const keepLevel = this.levelIndex;
    this.setLevel(keepLevel);
    this.begin();
  }

  togglePause() {
    if (this.state === "running") this.pause();
    else if (this.state === "paused") this.resume();
  }

  restartLevel(level = this.levelIndex) {
    this.setLevel(level);
    this.begin();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    music.stop();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.handleResize);
    this.resizeObserver?.disconnect();
  }

  private emitHud(force = false) {
    const progress = clamp((this.player.x / this.level.length) * 100, 0, 100);
    const hud: GRHud = {
      level: this.levelIndex + 1,
      levelName: this.level.name,
      progress,
      score: this.score(),
      coins: this.coins,
      deaths: this.deaths,
      state: this.state,
      checkpoint: this.checkpoint,
    };
    const signature = `${Math.round(progress)}|${hud.score}|${hud.coins}|${hud.deaths}|${this.state}|${this.checkpoint}|${this.levelIndex}`;
    if (force || signature !== this.lastHud) {
      this.lastHud = signature;
      this.options.onHud(hud);
    }
  }

  private score(): number {
    const progress = clamp(this.player.x / this.level.length, 0, 1);
    return Math.round(progress * 1000) + this.coins * 25;
  }

  private spawnBurst(x: number, y: number, count: number, color: string, power = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 200) * power;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        size: 1.6 + Math.random() * 3,
        color,
        gravity: 620,
      });
    }
    if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
  }

  private die() {
    if (this.state !== "running") return;
    this.state = "dead";
    this.deaths += 1;
    this.deathAt = performance.now();
    this.shake = 16;
    this.spawnBurst(
      this.player.x + PLAYER_SIZE / 2,
      this.player.y + PLAYER_SIZE / 2,
      34,
      "#ff5470",
      1.6,
    );
    audio.sfx("hit");
    music.stop();
    this.emitHud(true);
  }

  private respawn() {
    this.player.x = this.respawnX;
    this.player.y = WORLD_H - GROUND_H - PLAYER_SIZE;
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.rotation = 0;
    this.camX = Math.max(0, this.respawnX - this.viewW * 0.26);
    this.state = "running";
    this.levelStartAt = performance.now();
    music.start(this.level.pattern);
    this.emitHud(true);
  }

  private complete() {
    if (this.state !== "running") return;
    this.state = "complete";
    music.stop();
    audio.sfx("levelup");
    this.spawnBurst(
      this.player.x + PLAYER_SIZE / 2,
      this.player.y,
      50,
      this.level.hueA,
      1.6,
    );
    this.options.onHud({
      level: this.levelIndex + 1,
      levelName: this.level.name,
      progress: 100,
      score: this.score(),
      coins: this.coins,
      deaths: this.deaths,
      state: "complete",
      checkpoint: this.checkpoint,
    });
    this.options.onComplete({
      level: this.levelIndex + 1,
      score: this.score(),
      progress: 100,
      deaths: this.deaths,
      coins: this.coins,
    });
  }

  private tick = (now: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.tick);
    const delta = Math.min(0.05, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;

    if (this.state === "running" || this.state === "dead") {
      this.accumulator += delta;
      const step = 1 / 120;
      let guard = 0;
      while (this.accumulator >= step && guard++ < 8) {
        this.update(step);
        this.accumulator -= step;
      }
    }
    this.updateParticles(delta);
    if (this.state === "dead" && now - this.deathAt > 780) {
      this.respawn();
    }
    this.render(delta);
    this.emitHud();
  };

  private update(dt: number) {
    const p = this.player;
    if (this.state === "dead") {
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      return;
    }

    p.x += this.level.speed * dt;
    const prevBottom = p.y + PLAYER_SIZE;
    const gravityScale = p.holding && p.vy < 0 ? 0.62 : 1;
    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * gravityScale * dt);
    p.y += p.vy * dt;

    const groundY = WORLD_H - GROUND_H;
    let landed = false;

    if (p.y + PLAYER_SIZE >= groundY) {
      p.y = groundY - PLAYER_SIZE;
      p.vy = 0;
      landed = true;
    }

    // obstacle interaction
    for (const o of this.level.obstacles) {
      if (o.x > p.x + this.viewW * 0.7 || o.x + o.w < p.x - 200) continue;

      if (o.type === "coin") {
        if (!o.used && this.overlaps(p, o, 8)) {
          o.used = true;
          this.coins += 1;
          audio.sfx("coin");
          this.spawnBurst(o.x + 11, o.y + 11, 8, "#ffe066", 0.6);
        }
        continue;
      }

      if (o.type === "checkpoint") {
        if (this.overlaps(p, o, 2) && this.checkpoint < o.x) {
          this.checkpoint = o.x;
          this.respawnX = o.x + 44;
          audio.sfx("levelup");
          this.spawnBurst(o.x + 10, o.y, 24, "#4af2a1", 1);
        }
        continue;
      }

      if (o.type === "finish") {
        if (this.overlaps(p, o, 0)) this.complete();
        continue;
      }

      if (o.type === "block") {
        const onTop = prevBottom <= o.y + 10 && p.y + PLAYER_SIZE >= o.y && p.vy >= 0;
        const horizontally = p.x + PLAYER_SIZE > o.x + 3 && p.x < o.x + o.w - 3;
        if (onTop && horizontally) {
          p.y = o.y - PLAYER_SIZE;
          p.vy = 0;
          landed = true;
          continue;
        }
        if (this.overlaps(p, o, 5)) {
          this.die();
          return;
        }
        continue;
      }

      if (o.type === "pad") {
        if (this.overlaps(p, o, 2) && p.vy >= 0) {
          p.vy = -1320;
          p.y = o.y - PLAYER_SIZE;
          p.onGround = false;
          this.spawnBurst(o.x + o.w / 2, o.y, 16, "#ffe066", 1.1);
          audio.sfx("jump");
          continue;
        }
      }

      if (o.type === "saw") {
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;
        const dx = p.x + PLAYER_SIZE / 2 - cx;
        const dy = p.y + PLAYER_SIZE / 2 - cy;
        if (dx * dx + dy * dy < (o.w / 2 + 12) ** 2) {
          this.die();
          return;
        }
        continue;
      }

      if (o.type === "spike") {
        if (this.overlaps(p, o, 12)) {
          this.die();
          return;
        }
      }
    }

    if (landed) {
      if (!p.onGround && p.vy > 300) {
        this.spawnBurst(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE, 6, "#ffffff", 0.5);
        audio.sfx("land");
      }
      p.onGround = true;
      this.lastGroundAt = performance.now();
      p.rotation = lerp(p.rotation, 0, 0.35);
      // buffered jump
      if (performance.now() - this.jumpRequestedAt < BUFFER_MS) {
        this.jumpRequestedAt = -9999;
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
        p.holding = true;
        audio.sfx("jump");
      }
    } else {
      p.onGround = false;
      const target = clamp(p.vy / 900, -1.2, 1.2) * 0.9;
      p.rotation = lerp(p.rotation, target, 0.18);
    }

    this.camX = Math.max(0, p.x - this.viewW * 0.26);
    if (p.x > this.level.length + 40) this.complete();
    if (p.y > WORLD_H + 100) this.die();
  }

  private overlaps(
    p: { x: number; y: number },
    o: { x: number; y: number; w: number; h: number },
    inset: number,
  ): boolean {
    return (
      p.x + PLAYER_SIZE - inset > o.x + inset &&
      p.x + inset < o.x + o.w - inset &&
      p.y + PLAYER_SIZE - inset > o.y + inset &&
      p.y + inset < o.y + o.h - inset
    );
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      particle.vy += particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 46);
  }

  /* ------------------------------- rendering ------------------------------- */

  private render(dt: number) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#05060f");
    sky.addColorStop(0.55, "#080e22");
    sky.addColorStop(1, "#0b1430");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // horizon glow
    const glow = ctx.createRadialGradient(w * 0.72, h * 0.34, 10, w * 0.72, h * 0.34, h * 0.9);
    glow.addColorStop(0, `${this.level.hueB}55`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const groundY = h - GROUND_H;
    // screen shake: offset the world layer only (the sky stays put)
    ctx.save();
    if (this.shake > 0.2) {
      const amount = this.shake;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }

    // parallax mountains
    this.mountainLayers.forEach((layer, li) => {
      const offset = (this.camX * layer.factor) % 600;
      ctx.beginPath();
      ctx.moveTo(-600, groundY);
      const segW = 120;
      for (let i = 0; i < layer.points.length; i++) {
        const px = -600 + i * segW - offset;
        const py = groundY - 40 - layer.points[i] * (120 + li * 46);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(-600 + layer.points.length * segW - offset, groundY);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
    });

    // moving speed lines
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = `${this.level.hueA}88`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = 80 + i * 38;
      const x = ((i * 213 + this.camX * (0.5 + i * 0.03)) % (w + 300)) - 150;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 90, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ground
    const ground = ctx.createLinearGradient(0, groundY, 0, h);
    ground.addColorStop(0, "#0c1430");
    ground.addColorStop(1, "#04060f");
    ctx.fillStyle = ground;
    ctx.fillRect(0, groundY, w, GROUND_H);

    ctx.strokeStyle = this.level.hueA;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.level.hueA;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ground grid
    ctx.strokeStyle = "rgba(120,160,255,0.16)";
    ctx.lineWidth = 1;
    const gridOffset = this.camX % 60;
    for (let i = -1; i * 60 - gridOffset < w + 60; i++) {
      const x = i * 60 - gridOffset;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 40, h);
      ctx.stroke();
    }
    [18, 40, 66].forEach((y, i) => {
      ctx.globalAlpha = 0.4 - i * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + y);
      ctx.lineTo(w, groundY + y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // obstacles
    for (const o of this.level.obstacles) {
      const sx = o.x - this.camX;
      if (sx + o.w < -80 || sx > w + 80) continue;
      this.drawObstacle(ctx, o, sx, dt);
    }

    // player
    this.drawPlayer(ctx);

    // particles
    for (const particle of this.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x - this.camX, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.92);
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, "rgba(2,3,9,0.75)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // shake applied to the whole scene by offsetting next frame (kept subtle)
    if (this.shake > 0) {
      const s = this.shake;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,84,112,${Math.min(0.2, s / 90)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, sx: number, dt: number) {
    const x = sx;
    const y = o.y;

    if (o.type === "spike") {
      ctx.fillStyle = "rgba(255,84,112,0.18)";
      ctx.strokeStyle = "#ff5470";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x, y + o.h);
      ctx.lineTo(x + o.w / 2, y);
      ctx.lineTo(x + o.w, y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "#ff5470";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    if (o.type === "block") {
      ctx.fillStyle = "rgba(46,230,255,0.12)";
      ctx.strokeStyle = this.level.hueA;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      roundRect(ctx, x, y, o.w, o.h, 7);
      ctx.fill();
      ctx.shadowColor = this.level.hueA;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8);
      ctx.lineTo(x + o.w - 8, y + 8);
      ctx.stroke();
      return;
    }

    if (o.type === "saw") {
      const cx = x + o.w / 2;
      const cy = y + o.h / 2;
      const r = o.w / 2;
      o.spin = (o.spin ?? 0) + dt * 6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(o.spin);
      ctx.strokeStyle = "#ffe066";
      ctx.fillStyle = "rgba(255,224,102,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const rr = i % 2 === 0 ? r : r * 0.72;
        const px = Math.cos(angle) * rr;
        const py = Math.sin(angle) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = "#ffe066";
      ctx.fill();
      ctx.restore();
      return;
    }

    if (o.type === "pad") {
      ctx.fillStyle = "rgba(255,224,102,0.85)";
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundRect(ctx, x, y, o.w, o.h, 6);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (o.type === "coin") {
      if (o.used) return;
      const bob = Math.sin(performance.now() / 260 + o.x) * 3;
      ctx.save();
      ctx.translate(x + o.w / 2, o.y + bob + o.h / 2);
      ctx.fillStyle = "#ffe066";
      ctx.shadowColor = "#ffe066";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, o.w * 0.36, o.h * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(10,10,20,0.55)";
      ctx.beginPath();
      ctx.ellipse(0, 0, o.w * 0.16, o.h * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (o.type === "checkpoint") {
      const passed = this.checkpoint >= o.x;
      ctx.strokeStyle = passed ? "#4af2a1" : "rgba(255,255,255,0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + o.h);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
      ctx.fillStyle = passed ? "#4af2a1" : "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 4);
      ctx.lineTo(x + 6 + 34, y + 16);
      ctx.lineTo(x + 6, y + 30);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (o.type === "finish") {
      const pulse = 0.6 + Math.sin(performance.now() / 220) * 0.4;
      ctx.globalAlpha = 0.35 + pulse * 0.3;
      ctx.fillStyle = this.level.hueA;
      ctx.fillRect(x, 0, o.w, y + o.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, o.w, y + o.h);
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const sx = p.x - this.camX;
    const cx = sx + PLAYER_SIZE / 2;
    const cy = p.y + PLAYER_SIZE / 2;

    // trail
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = this.level.hueA;
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = 0.3 - i * 0.06;
      ctx.fillRect(cx - 14 - i * 13, cy - 10 + i * 2, 18, 20);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p.rotation);
    ctx.shadowColor = this.level.hueA;
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#0a1224";
    ctx.strokeStyle = this.level.hueA;
    ctx.lineWidth = 3;
    ctx.beginPath();
    roundRect(ctx, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.level.hueA;
    ctx.beginPath();
    roundRect(ctx, -PLAYER_SIZE / 4, -PLAYER_SIZE / 4, PLAYER_SIZE / 2, PLAYER_SIZE / 2, 3);
    ctx.fill();
    ctx.restore();

    if (this.state === "dead") {
      ctx.strokeStyle = "#ff5470";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, PLAYER_SIZE + 10 + (performance.now() - this.deathAt) / 22, 0, Math.PI * 2);
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

export const GEOMETRY_RUSH_LEVELS = 3;
