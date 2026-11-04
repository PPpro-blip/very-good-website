"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { QuizRound } from "@/components/quiz/QuizRound";
import type { CustomGameHandle } from "@/games/registry";
import { LOGIC, SPEED_MIX, VOCABULARY, type QuizQuestion } from "@/data/questions";
import {
  generateMathQuestion,
  generatePatternQuestion,
  generateSpellingQuestion,
  pickQuestions,
  randInt,
  shuffleQuestion,
} from "@/lib/quiz";
import { audio } from "@/lib/audio";
import { store } from "@/lib/store";
import { cn, shuffle } from "@/lib/utils";

type ModeId = "math" | "memory" | "words" | "pattern" | "logic" | "speed";

const MODES: {
  id: ModeId;
  name: string;
  glyph: string;
  accent: string;
  accent2: string;
  blurb: string;
  meta: string;
}[] = [
  {
    id: "math",
    name: "Quick Math",
    glyph: "∑",
    accent: "#4af2a1",
    accent2: "#2ee6ff",
    blurb: "Generated arithmetic with a 10-second clock. Difficulty ramps every two questions.",
    meta: "10 questions · 10s each",
  },
  {
    id: "memory",
    name: "Memory Master",
    glyph: "◉",
    accent: "#ffe066",
    accent2: "#ff8a3d",
    blurb: "Watch the pads light up, then repeat the sequence. Three lives, rising length.",
    meta: "Endless · 3 lives",
  },
  {
    id: "words",
    name: "Word Wizard",
    glyph: "Aa",
    accent: "#ff3fd8",
    accent2: "#8b5cf6",
    blurb: "Unscramble words and pick the precise synonym. Spelling counts.",
    meta: "10 questions · no timer",
  },
  {
    id: "pattern",
    name: "Pattern Detective",
    glyph: "◆",
    accent: "#8b5cf6",
    accent2: "#4d7cff",
    blurb: "Number sequences with a hidden rule. Find it before the options do.",
    meta: "8 puzzles · no timer",
  },
  {
    id: "logic",
    name: "Logic Lab",
    glyph: "◇",
    accent: "#c4b5fd",
    accent2: "#2ee6ff",
    blurb: "Deduction, codes and the occasional delicious trick question.",
    meta: "8 puzzles · no timer",
  },
  {
    id: "speed",
    name: "Speed Quiz",
    glyph: "⚡",
    accent: "#ff8a3d",
    accent2: "#ff5470",
    blurb: "Mixed general knowledge against an 8-second clock. Streaks are everything.",
    meta: "10 questions · 8s each",
  },
];

/* ==================================================================== */
/*                            MEMORY MASTER                              */
/* ==================================================================== */

const PADS = [
  { color: "#2ee6ff", freq: 329.63, label: "Blue" },
  { color: "#ff3fd8", freq: 440.0, label: "Pink" },
  { color: "#4af2a1", freq: 554.37, label: "Green" },
  { color: "#ffe066", freq: 659.25, label: "Yellow" },
];

function MemoryMaster({ onExit }: { onExit: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "over">("idle");
  const [active, setActive] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [message, setMessage] = useState("Watch the pads, then repeat the pattern.");
  const timers = useRef<number[]>([]);
  const seqRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    setBest(store.getBest("brain-blast:memory"));
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const playSequence = useCallback((seq: number[]) => {
    clearTimers();
    setPhase("showing");
    setInputIndex(0);
    setMessage("Watch closely…");
    const step = Math.max(320, 640 - seq.length * 22);
    seq.forEach((pad, i) => {
      const on = window.setTimeout(() => {
        setActive(pad);
        audio.note(PADS[pad].freq, 0.24, "triangle", 0.07);
      }, i * step);
      const off = window.setTimeout(() => setActive(null), i * step + step * 0.62);
      timers.current.push(on, off);
    });
    const done = window.setTimeout(
      () => {
        setPhase("input");
        setMessage("Your turn — repeat the pattern.");
      },
      seq.length * step + 140,
    );
    timers.current.push(done);
  }, []);

  const begin = useCallback(() => {
    clearTimers();
    const first = [randInt(0, 3)];
    seqRef.current = first;
    setSequence(first);
    setLevel(1);
    setLives(3);
    setNewBest(false);
    setPhase("showing");
    audio.sfx("launch");
    playSequence(first);
  }, [playSequence]);

  const finish = useCallback(
    (finalLevel: number) => {
      clearTimers();
      const score = Math.max(0, (finalLevel - 1) * 100);
      const isBest = store.submitScore("brain-blast:memory", score);
      setNewBest(isBest);
      setPhase("over");
      audio.sfx("error");
      if (score > 0) store.addPoints(Math.round(score / 40));
    },
    [],
  );

  const pressPad = useCallback(
    (pad: number) => {
      if (phaseRef.current !== "input") return;
      setActive(pad);
      audio.note(PADS[pad].freq, 0.18, "triangle", 0.07);
      window.setTimeout(() => setActive(null), 150);

      const expected = seqRef.current[inputIndex];
      if (pad !== expected) {
        audio.sfx("error");
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          finish(level);
        } else {
          setMessage(`Missed it — ${remaining} ${remaining === 1 ? "life" : "lives"} left. Watch again.`);
          setInputIndex(0);
          playSequence(seqRef.current);
        }
        return;
      }

      const next = inputIndex + 1;
      if (next >= seqRef.current.length) {
        audio.sfx("success");
        const nextSeq = [...seqRef.current, randInt(0, 3)];
        seqRef.current = nextSeq;
        setSequence(nextSeq);
        setLevel((l) => l + 1);
        setMessage("Perfect — one more pad.");
        const delay = window.setTimeout(() => playSequence(nextSeq), 720);
        timers.current.push(delay);
        setPhase("showing");
      } else {
        setInputIndex(next);
      }
    },
    [finish, inputIndex, level, lives, playSequence],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const n = Number(event.key);
      if (n >= 1 && n <= 4) pressPad(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressPad]);

  const score = Math.max(0, (level - 1) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#070b18]/95 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="icon-btn !h-8 !w-8" onClick={onExit} aria-label="Back to hub">
          <Icon name="arrowLeft" size={15} />
        </button>
        <div className="flex items-center gap-2">
          <span className="chip !border-arc-yellow/40 !text-arc-yellow">
            <Icon name="star" size={10} /> {score} pts
          </span>
          <span className="chip !text-[8px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-3 rounded-full", i < lives ? "bg-arc-pink" : "bg-white/15")}
              />
            ))}
            <span className="ml-1">{lives} lives</span>
          </span>
          <span className="chip !text-[8px]">level {level}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {PADS.map((pad, i) => (
          <button
            key={pad.color}
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              pressPad(i);
            }}
            disabled={phase !== "input"}
            className={cn(
              "group relative aspect-[4/3] rounded-2xl border-2 transition-all duration-150",
              active === i
                ? "scale-[0.98] border-white/80"
                : "border-white/12 hover:border-white/30",
              phase === "showing" && active !== i ? "opacity-70" : "",
            )}
            style={{
              background:
                active === i
                  ? `radial-gradient(circle at 50% 40%, #ffffff, ${pad.color} 70%)`
                  : `radial-gradient(circle at 50% 40%, ${pad.color}55, ${pad.color}14)`,
              boxShadow: active === i ? `0 0 46px ${pad.color}` : "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            aria-label={`Pad ${i + 1} (${pad.label})`}
          >
            <span
              className="absolute inset-0 grid place-items-center font-display text-2xl font-black"
              style={{ color: active === i ? "#05060f" : `${pad.color}bb` }}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-white/50">{message}</p>
        <div className="flex gap-2">
          {phase === "idle" ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={begin}>
              <Icon name="play" size={12} /> Start
            </button>
          ) : null}
          {phase === "over" ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPhase("idle");
                setSequence([]);
                setLevel(1);
                setLives(3);
                setMessage("Watch the pads, then repeat the pattern.");
              }}
            >
              <Icon name="rotate" size={12} /> Play again
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearTimers();
                setPhase("idle");
                setSequence([]);
                setLevel(1);
                setLives(3);
                setMessage("Watch the pads, then repeat the pattern.");
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {phase === "idle" ? (
        <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-white/40">
            Watch the sequence, then tap it back. Three mistakes end the run. Best {best}
            {newBest ? " · new record!" : ""}. Keys 1–4 work too.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ==================================================================== */
/*                                HUB                                    */
/* ==================================================================== */

export const BrainBlast = forwardRef<CustomGameHandle, Record<string, never>>(
  function BrainBlast(_props, ref) {
    const [mode, setMode] = useState<ModeId | null>(null);
    const [bests, setBests] = useState<Record<string, number>>({});
    const [roundKey, setRoundKey] = useState(0);

    useEffect(() => {
      setBests({
        math: store.getBest("brain-blast:math"),
        memory: store.getBest("brain-blast:memory"),
        words: store.getBest("brain-blast:words"),
        pattern: store.getBest("brain-blast:pattern"),
        logic: store.getBest("brain-blast:logic"),
        speed: store.getBest("brain-blast:speed"),
      });
    }, [mode, roundKey]);

    useImperativeHandle(ref, () => ({
      restart: () => {
        if (mode) {
          setRoundKey((k) => k + 1);
        } else {
          setMode(null);
        }
      },
    }));

    const exit = () => {
      setMode(null);
      audio.sfx("click");
    };

    const activeMeta = MODES.find((m) => m.id === mode);

    if (mode === "memory") {
      return (
        <div className="game-surface h-full w-full overflow-y-auto bg-[#04060f] p-3 sm:p-5">
          <MemoryMaster onExit={exit} />
        </div>
      );
    }

    if (mode && activeMeta) {
      const config = (() => {
        switch (mode) {
          case "math":
            return {
              title: "Quick Math",
              subtitle: "10 questions · 10s each",
              total: 10,
              generate: (i: number) => generateMathQuestion(1 + Math.floor(i / 2)),
              perQuestionMs: 10000,
              scoreKey: "brain-blast:math",
            };
          case "words":
            return {
              title: "Word Wizard",
              subtitle: "10 questions · spelling & vocabulary",
              total: 10,
              generate: (i: number): QuizQuestion => {
                if (i % 2 === 0) return generateSpellingQuestion(1 + Math.floor(i / 4));
                const pool = shuffle(VOCABULARY);
                return shuffleQuestion(pool[0]);
              },
              perQuestionMs: null,
              scoreKey: "brain-blast:words",
            };
          case "pattern":
            return {
              title: "Pattern Detective",
              subtitle: "8 puzzles · find the rule",
              total: 8,
              generate: (i: number) => generatePatternQuestion(1 + Math.floor(i / 3)),
              perQuestionMs: null,
              scoreKey: "brain-blast:pattern",
            };
          case "logic":
            return {
              title: "Logic Lab",
              subtitle: "8 puzzles · deduction",
              total: 8,
              questions: pickQuestions(LOGIC, 8),
              perQuestionMs: null,
              scoreKey: "brain-blast:logic",
            };
          case "speed":
          default:
            return {
              title: "Speed Quiz",
              subtitle: "10 questions · 8s each",
              total: 10,
              questions: pickQuestions(SPEED_MIX, 10),
              perQuestionMs: 8000,
              scoreKey: "brain-blast:speed",
            };
        }
      })();

      return (
        <div className="game-surface h-full w-full overflow-y-auto bg-[#04060f] p-3 sm:p-5">
          <QuizRound
            key={`${mode}-${roundKey}`}
            title={config.title}
            subtitle={config.subtitle}
            accent={activeMeta.accent}
            accent2={activeMeta.accent2}
            total={config.total}
            generate={"generate" in config ? config.generate : undefined}
            questions={"questions" in config ? config.questions : undefined}
            perQuestionMs={config.perQuestionMs}
            scoreKey={config.scoreKey}
            pointsDivisor={30}
            onExit={exit}
            exitLabel="Games"
          />
        </div>
      );
    }

    return (
      <div className="game-surface h-full w-full overflow-y-auto bg-[#04060f]">
        <div className="relative p-4 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40 blur-[70px]"
            style={{ background: "radial-gradient(circle,#8b5cf6,transparent 65%)" }}
          />
          <div className="relative">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-arc-violet">
              Brain Blast · six games in one cabinet
            </p>
            <h3 className="mt-2 font-display text-[clamp(24px,4.4vw,38px)] font-black uppercase leading-none tracking-tight text-white">
              Pick a brain
            </h3>
            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-white/50">
              Every mode keeps its own personal best, its own difficulty curve and its own reason to
              press replay. Streaks pay more. Nothing punishes you for thinking.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setRoundKey((k) => k + 1);
                    audio.sfx("launch");
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/25"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, ${item.accent}, ${item.accent2})` }}
                  />
                  <div className="flex items-start justify-between">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl border font-display text-base font-black"
                      style={{
                        borderColor: `${item.accent}44`,
                        background: `${item.accent}14`,
                        color: item.accent,
                      }}
                    >
                      {item.glyph}
                    </span>
                    {bests[item.id] ? (
                      <span className="chip !px-2 !py-0.5 !text-[8px]">
                        <Icon name="trophy" size={9} /> {bests[item.id]}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] text-white">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{item.blurb}</p>
                  <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-white/30">
                    {item.meta}
                  </p>
                  <span className="mt-2 flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/60 group-hover:text-white">
                    Play <Icon name="arrowRight" size={11} />
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.12em] text-white/35">
              Tip: every quiz accepts keys 1–4, Enter to advance, and Esc to leave a mode. Scores
              save to this browser.
            </p>
          </div>
        </div>
      </div>
    );
  },
);
