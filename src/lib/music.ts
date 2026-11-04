"use client";

import { audio } from "./audio";

/**
 * Original chiptune sequencer — every note in WOW GAMES is composed in this file.
 * Patterns are 16-step loops scheduled with a lookahead clock so timing stays
 * rock-solid even when the main thread is busy rendering a game.
 */

export type PatternId =
  | "rush-1"
  | "rush-2"
  | "rush-3"
  | "flappy-sky"
  | "flappy-sunset"
  | "flappy-cosmos"
  | "brain";

interface Pattern {
  bpm: number;
  bass: (number | null)[];
  lead: (number | null)[];
  leadType: OscillatorType;
  bassType: OscillatorType;
  kick?: number[];
  hat?: number[];
  leadGain?: number;
  bassGain?: number;
  /** number of steps the pattern spans (16 = one bar of 16ths) */
  swing?: number;
}

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export const PATTERNS: Record<PatternId, Pattern> = {
  /* ---------------- Geometry Rush ---------------- */
  "rush-1": {
    bpm: 128,
    bassType: "square",
    leadType: "square",
    bassGain: 0.11,
    leadGain: 0.055,
    bass: [45, null, 45, 45, null, 45, 43, null, 41, null, 41, 41, 48, null, 45, null],
    lead: [69, null, 76, null, 72, null, 76, null, 67, null, 74, null, 71, null, 74, null],
    kick: [0, 4, 8, 12],
    hat: [2, 6, 10, 14],
  },
  "rush-2": {
    bpm: 142,
    bassType: "sawtooth",
    leadType: "square",
    bassGain: 0.1,
    leadGain: 0.05,
    bass: [40, null, 40, 40, 41, null, 43, null, 40, null, 40, 40, 47, null, 45, null],
    lead: [76, null, 79, null, 83, null, 79, null, 76, null, 74, null, 71, null, 74, null],
    kick: [0, 3, 4, 8, 11, 12],
    hat: [2, 6, 10, 14, 15],
  },
  "rush-3": {
    bpm: 154,
    bassType: "sawtooth",
    leadType: "square",
    bassGain: 0.105,
    leadGain: 0.05,
    bass: [38, 38, null, 38, 41, null, 41, 41, 45, null, 45, null, 48, null, 47, null],
    lead: [74, null, 77, null, 81, null, 77, null, 84, null, 81, null, 77, null, 74, null],
    kick: [0, 2, 4, 6, 8, 10, 12, 14],
    hat: [1, 3, 5, 7, 9, 11, 13, 15],
  },

  /* ---------------- Flappy Chaos ---------------- */
  "flappy-sky": {
    bpm: 100,
    bassType: "triangle",
    leadType: "triangle",
    bassGain: 0.07,
    leadGain: 0.05,
    bass: [48, null, null, null, 43, null, null, null, 45, null, null, null, 41, null, null, null],
    lead: [72, null, 76, null, 79, null, 76, null, 74, null, 79, null, 81, null, 79, null],
    hat: [4, 12],
  },
  "flappy-sunset": {
    bpm: 112,
    bassType: "triangle",
    leadType: "sine",
    bassGain: 0.075,
    leadGain: 0.055,
    bass: [45, null, null, 45, 43, null, null, 43, 41, null, null, 41, 48, null, null, null],
    lead: [69, null, 72, 74, 76, null, 74, null, 72, null, 71, null, 69, null, 67, null],
    kick: [0, 8],
    hat: [4, 12],
  },
  "flappy-cosmos": {
    bpm: 86,
    bassType: "sine",
    leadType: "sine",
    bassGain: 0.08,
    leadGain: 0.05,
    bass: [40, null, null, null, 40, null, null, null, 43, null, null, null, 45, null, null, null],
    lead: [76, null, null, 83, null, 81, null, null, 79, null, null, 76, null, 74, null, null],
    hat: [8],
  },

  /* ---------------- Brain Blast ---------------- */
  brain: {
    bpm: 118,
    bassType: "triangle",
    leadType: "square",
    bassGain: 0.075,
    leadGain: 0.04,
    bass: [43, null, null, 43, 48, null, null, 48, 41, null, null, 41, 45, null, null, 45],
    lead: [79, null, 83, null, 86, null, 83, null, 81, null, 79, null, 76, null, 79, null],
    kick: [0, 6, 8, 14],
    hat: [4, 12],
  },
};

class Sequencer {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private pattern: Pattern | null = null;
  private stepDuration = 0.125;
  private id: PatternId | null = null;

  get playing(): boolean {
    return this.timer !== null;
  }

  get current(): PatternId | null {
    return this.id;
  }

  start(id: PatternId): void {
    const ctx = audio.ensure();
    const out = audio.musicOutput;
    if (!ctx || !out) return;
    // already playing this exact loop — keep it running (no audible seam)
    if (this.timer !== null && this.id === id) return;
    this.stop();
    this.ctx = ctx;
    this.out = out;
    this.pattern = PATTERNS[id];
    this.id = id;
    this.step = 0;
    this.stepDuration = 60 / this.pattern.bpm / 4;
    this.nextTime = ctx.currentTime + 0.08;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 25);
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.id = null;
    this.pattern = null;
  }

  private tick(): void {
    const ctx = this.ctx;
    const pattern = this.pattern;
    const out = this.out;
    if (!ctx || !pattern || !out) return;
    if (ctx.state === "suspended") return;
    const horizon = ctx.currentTime + 0.16;
    let guard = 0;
    while (this.nextTime < horizon && guard++ < 32) {
      this.schedule(this.step, this.nextTime, pattern, ctx, out);
      this.nextTime += this.stepDuration;
      this.step = (this.step + 1) % 16;
    }
  }

  private schedule(
    step: number,
    time: number,
    pattern: Pattern,
    ctx: AudioContext,
    out: GainNode,
  ): void {
    const bassNote = pattern.bass[step];
    if (bassNote !== null && bassNote !== undefined) {
      this.note(ctx, out, midiToFreq(bassNote), time, this.stepDuration * 1.7, pattern.bassType, pattern.bassGain ?? 0.1);
    }
    const leadNote = pattern.lead[step];
    if (leadNote !== null && leadNote !== undefined) {
      this.note(ctx, out, midiToFreq(leadNote), time, this.stepDuration * 1.25, pattern.leadType, pattern.leadGain ?? 0.05);
    }
    if (pattern.kick?.includes(step)) this.kick(ctx, out, time);
    if (pattern.hat?.includes(step)) this.hat(ctx, out, time);
  }

  private note(
    ctx: AudioContext,
    out: GainNode,
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType,
    peak: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(out);
    osc.start(time);
    osc.stop(time + dur + 0.03);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private kick(ctx: AudioContext, out: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.13);
    gain.gain.setValueAtTime(0.26, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.17);
    osc.connect(gain).connect(out);
    osc.start(time);
    osc.stop(time + 0.2);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private hat(ctx: AudioContext, out: GainNode, time: number): void {
    const length = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 6500;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    src.connect(filter).connect(gain).connect(out);
    src.start(time);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
}

export const music = new Sequencer();
