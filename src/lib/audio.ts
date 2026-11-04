"use client";

import { store } from "./store";

/**
 * WOW GAMES audio engine.
 * All sound is synthesised at runtime with the Web Audio API — no audio files,
 * no licensing issues, tiny bundle. Nothing plays before the first user gesture
 * (autoplay policy) and the global mute switch silences everything at the master bus.
 */

type SfxName =
  | "click"
  | "hover"
  | "launch"
  | "success"
  | "error"
  | "jump"
  | "land"
  | "coin"
  | "hit"
  | "flap"
  | "tick"
  | "levelup"
  | "whoosh"
  | "pause"
  | "chime";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private ambientNodes: { osc: OscillatorNode[]; gain: GainNode; lfo: OscillatorNode } | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private unlocked = false;
  private installed = false;
  private listenersAttached = false;

  /** Lazily create the context (never on the server). */
  ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = store.get().muted ? 0 : 0.9;
      const sfx = ctx.createGain();
      sfx.gain.value = 0.9;
      const music = ctx.createGain();
      music.gain.value = 0.55;
      sfx.connect(master);
      music.connect(master);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.sfxBus = sfx;
      this.musicBus = music;
      this.noiseBuffer = null;

      if (!this.listenersAttached) {
        this.listenersAttached = true;
        store.subscribe(() => {
          const muted = store.get().muted;
          if (this.master && this.ctx) {
            this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.02);
          }
        });
      }
      return ctx;
    } catch {
      return null;
    }
  }

  /** Must be called from a user gesture. */
  unlock(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    this.unlocked = true;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get musicOutput(): GainNode | null {
    return this.musicBus;
  }

  /** Attach one-time global gesture listeners. Safe to call repeatedly. */
  install(): void {
    if (this.installed || typeof window === "undefined") return;
    this.installed = true;
    const unlock = () => {
      this.unlock();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  private noise(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const length = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;
    return buffer;
  }

  private tone(opts: {
    freq: number;
    to?: number;
    dur: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    bus?: GainNode | null;
    attack?: number;
  }) {
    const ctx = this.ensure();
    const bus = opts.bus ?? this.sfxBus;
    if (!ctx || !bus) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(Math.max(20, opts.freq), t0);
    if (opts.to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + opts.dur);
    }
    const peak = opts.gain ?? 0.12;
    const attack = opts.attack ?? 0.006;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain).connect(bus);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private noiseHit(opts: {
    dur: number;
    gain?: number;
    filter?: "lowpass" | "highpass" | "bandpass";
    freq?: number;
    to?: number;
    delay?: number;
    bus?: GainNode | null;
  }) {
    const ctx = this.ensure();
    const bus = opts.bus ?? this.sfxBus;
    if (!ctx || !bus) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filter ?? "bandpass";
    filter.frequency.setValueAtTime(opts.freq ?? 1200, t0);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
    filter.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.0002, opts.gain ?? 0.08), t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    src.connect(filter).connect(gain).connect(bus);
    src.start(t0);
    src.stop(t0 + opts.dur + 0.02);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  sfx(name: SfxName): void {
    if (store.get().muted) return;
    if (!this.ensure()) return;
    switch (name) {
      case "click":
        this.tone({ freq: 540, to: 350, dur: 0.07, type: "triangle", gain: 0.09 });
        this.noiseHit({ dur: 0.03, freq: 3200, gain: 0.03 });
        break;
      case "hover":
        this.tone({ freq: 1180, dur: 0.035, type: "sine", gain: 0.025 });
        break;
      case "launch":
        this.tone({ freq: 180, to: 880, dur: 0.34, type: "triangle", gain: 0.1 });
        this.tone({ freq: 360, to: 1760, dur: 0.34, type: "sine", gain: 0.05, delay: 0.04 });
        this.noiseHit({ dur: 0.3, freq: 400, to: 4000, gain: 0.05, filter: "bandpass" });
        break;
      case "success":
        [523.25, 659.25, 783.99].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.22, type: "triangle", gain: 0.075, delay: i * 0.055 }),
        );
        break;
      case "levelup":
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.26, type: "square", gain: 0.05, delay: i * 0.06 }),
        );
        break;
      case "error":
        this.tone({ freq: 220, to: 110, dur: 0.19, type: "sawtooth", gain: 0.07 });
        this.tone({ freq: 165, to: 82, dur: 0.22, type: "square", gain: 0.04, delay: 0.03 });
        break;
      case "jump":
        this.tone({ freq: 320, to: 700, dur: 0.1, type: "square", gain: 0.055 });
        break;
      case "flap":
        this.tone({ freq: 420, to: 760, dur: 0.09, type: "triangle", gain: 0.07 });
        this.noiseHit({ dur: 0.08, freq: 2200, gain: 0.03, filter: "highpass" });
        break;
      case "land":
        this.noiseHit({ dur: 0.08, freq: 320, gain: 0.05, filter: "lowpass" });
        break;
      case "coin":
        this.tone({ freq: 987.77, dur: 0.07, type: "square", gain: 0.05 });
        this.tone({ freq: 1318.51, dur: 0.12, type: "square", gain: 0.045, delay: 0.065 });
        break;
      case "hit":
        this.noiseHit({ dur: 0.25, freq: 1800, to: 160, gain: 0.1, filter: "lowpass" });
        this.tone({ freq: 160, to: 48, dur: 0.3, type: "sawtooth", gain: 0.09 });
        break;
      case "tick":
        this.tone({ freq: 1400, dur: 0.025, type: "square", gain: 0.03 });
        break;
      case "whoosh":
        this.noiseHit({ dur: 0.35, freq: 300, to: 2600, gain: 0.05, filter: "bandpass" });
        break;
      case "pause":
        this.tone({ freq: 440, dur: 0.08, type: "sine", gain: 0.05 });
        this.tone({ freq: 330, dur: 0.1, type: "sine", gain: 0.04, delay: 0.07 });
        break;
      case "chime":
        this.tone({ freq: 880, dur: 0.5, type: "sine", gain: 0.04 });
        this.tone({ freq: 1320, dur: 0.6, type: "sine", gain: 0.025, delay: 0.06 });
        break;
    }
  }

  /** Public single-note helper for games that need musical pads (Memory Master). */
  note(freq: number, duration = 0.26, type: OscillatorType = "sine", gain = 0.06): void {
    if (store.get().muted) return;
    this.tone({ freq, dur: duration, type, gain });
  }

  /** Optional ambient pad (global setting, off by default). */
  startAmbient(): void {
    const ctx = this.ensure();
    if (!ctx || !this.sfxBus || this.ambientNodes) return;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(this.sfxBus);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 720;
    filter.Q.value = 3;
    filter.connect(gain);

    const oscs: OscillatorNode[] = [];
    [55, 82.41, 110, 164.81].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = i * 6 - 8;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.24;
      osc.connect(g).connect(filter);
      osc.start();
      oscs.push(osc);
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1.6);
    this.ambientNodes = { osc: oscs, gain, lfo };
  }

  stopAmbient(): void {
    const ctx = this.ctx;
    const nodes = this.ambientNodes;
    if (!ctx || !nodes) return;
    this.ambientNodes = null;
    nodes.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
    window.setTimeout(() => {
      nodes.osc.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          /* noop */
        }
      });
      try {
        nodes.lfo.stop();
        nodes.lfo.disconnect();
        nodes.gain.disconnect();
      } catch {
        /* noop */
      }
    }, 900);
  }
}

export const audio = new AudioEngine();
export type { SfxName };
