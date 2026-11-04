"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { QuizQuestion } from "@/data/questions";
import { audio } from "@/lib/audio";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface QuizResult {
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  newBest: boolean;
}

interface QuizRoundProps {
  title: string;
  subtitle?: string;
  accent: string;
  accent2: string;
  total?: number;
  /** fixed set of questions, or build each question on demand */
  questions?: QuizQuestion[];
  generate?: (index: number) => QuizQuestion;
  /** per-question countdown in ms (null = relaxed, no timer) */
  perQuestionMs?: number | null;
  scoreKey: string;
  pointsDivisor?: number;
  onExit: () => void;
  onComplete?: (result: QuizResult) => void;
  exitLabel?: string;
}

const OPTION_KEYS = ["1", "2", "3", "4", "5", "6"];
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * One reusable quiz engine powering Study Zone + four Brain Blast modes.
 * Streaks, per-question timers, keyboard answers, local best scores, no dead ends.
 */
export function QuizRound({
  title,
  subtitle,
  accent,
  accent2,
  total = 8,
  questions,
  generate,
  perQuestionMs = null,
  scoreKey,
  pointsDivisor = 20,
  onExit,
  onComplete,
  exitLabel = "Exit",
}: QuizRoundProps) {
  const makeQuestion = useCallback(
    (i: number): QuizQuestion => {
      if (generate) return generate(i);
      if (questions && questions.length > 0) return questions[i % questions.length];
      throw new Error("QuizRound needs questions or a generator");
    },
    [generate, questions],
  );

  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion>(() => makeQuestion(0));
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(perQuestionMs ?? 0);
  const [newBest, setNewBest] = useState(false);
  const [lastGain, setLastGain] = useState(0);

  const run = useRef({ score: 0, correct: 0, streak: 0, bestStreak: 0, index: 0 });
  const answered = useRef(false);
  const answerRef = useRef<(choice: number) => void>(() => {});
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const result: QuizResult = {
      score: run.current.score,
      correct: run.current.correct,
      total,
      bestStreak: run.current.bestStreak,
      newBest: false,
    };
    if (run.current.score > 0) {
      const isBest = store.submitScore(scoreKey, run.current.score);
      result.newBest = isBest;
      setNewBest(isBest);
      if (pointsDivisor > 0) store.addPoints(Math.round(run.current.score / pointsDivisor));
    }
    setDone(true);
    setScore(result.score);
    setCorrect(result.correct);
    setBestStreak(result.bestStreak);
    audio.sfx(result.correct >= total * 0.6 ? "levelup" : "success");
    onComplete?.(result);
  }, [onComplete, pointsDivisor, scoreKey, total]);

  const answer = useCallback(
    (choice: number) => {
      if (answered.current || doneRef.current) return;
      answered.current = true;
      setPicked(choice);
      const isCorrect = choice === question.answer;
      if (isCorrect) {
        run.current.score += 100 + Math.min(100, run.current.streak * 20);
        run.current.correct += 1;
        run.current.streak += 1;
        run.current.bestStreak = Math.max(run.current.bestStreak, run.current.streak);
        setLastGain(100 + Math.min(100, (run.current.streak - 1) * 20));
        audio.sfx(run.current.streak >= 3 ? "coin" : "success");
      } else {
        run.current.streak = 0;
        setLastGain(0);
        audio.sfx("error");
      }
      setScore(run.current.score);
      setCorrect(run.current.correct);
      setStreak(run.current.streak);
      setBestStreak(run.current.bestStreak);
    },
    [question.answer],
  );

  answerRef.current = answer;

  const next = useCallback(() => {
    const nextIndex = run.current.index + 1;
    if (nextIndex >= total) {
      finish();
      return;
    }
    run.current.index = nextIndex;
    setIndex(nextIndex);
    setQuestion(makeQuestion(nextIndex));
    setPicked(null);
    setLastGain(0);
    answered.current = false;
    audio.sfx("click");
  }, [finish, makeQuestion, total]);

  /* per-question countdown */
  useEffect(() => {
    if (!perQuestionMs || done) return;
    setTimeLeft(perQuestionMs);
    const started = performance.now();
    const id = window.setInterval(() => {
      const left = perQuestionMs - (performance.now() - started);
      setTimeLeft(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        answerRef.current(-1);
      }
    }, 90);
    return () => window.clearInterval(id);
    // re-arm only when a new question is shown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done, perQuestionMs]);

  /* keyboard: 1-4 answer, Enter next */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (done) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const digit = Number(event.key);
      if (digit >= 1 && digit <= question.options.length && !answered.current) {
        answerRef.current(digit - 1);
      } else if ((event.key === "Enter" || event.key === " ") && answered.current) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, question.options.length, next]);

  const restart = () => {
    run.current = { score: 0, correct: 0, streak: 0, bestStreak: 0, index: 0 };
    doneRef.current = false;
    answered.current = false;
    setDone(false);
    setIndex(0);
    setQuestion(makeQuestion(0));
    setPicked(null);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setNewBest(false);
    setLastGain(0);
    audio.sfx("click");
  };

  const progress = done ? 100 : Math.round((index / total) * 100);
  const timePct = perQuestionMs ? Math.max(0, (timeLeft / perQuestionMs) * 100) : 100;

  if (done) {
    const accuracy = Math.round((correct / total) * 100);
    return (
      <div className="animate-pop rounded-3xl border border-white/12 bg-[#070b18]/95 p-6 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="chip" style={{ borderColor: `${accent}55`, color: accent }}>
            Round complete
          </span>
          {newBest ? (
            <span className="chip !border-arc-yellow/50 !bg-arc-yellow/15 !text-arc-yellow">
              <Icon name="trophy" size={11} /> New personal best
            </span>
          ) : null}
        </div>

        <p className="mt-5 font-display text-[clamp(40px,9vw,72px)] font-black leading-none text-white">
          {score}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">points</p>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {[
            { label: "Correct", value: `${correct}/${total}` },
            { label: "Accuracy", value: `${accuracy}%` },
            { label: "Best streak", value: `×${bestStreak}` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
              <p className="font-display text-lg font-black text-white">{stat.value}</p>
              <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-white/50">
          {accuracy >= 90
            ? "Outstanding. That is arcade-grade accuracy."
            : accuracy >= 60
              ? "Solid round. The next one will be faster."
              : "Rough round — but the leaderboard is local, so nobody has to know. Try again?"}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-primary" onClick={restart}>
            <Icon name="rotate" size={14} /> <span>Play again</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            <Icon name="arrowLeft" size={14} /> <span>{exitLabel}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#070b18]/95"
      style={{ boxShadow: `0 40px 100px -60px ${accent}` }}
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="icon-btn !h-8 !w-8" onClick={onExit} aria-label={exitLabel}>
            <Icon name="arrowLeft" size={15} />
          </button>
          <div>
            <p className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-white">
              {title}
            </p>
            {subtitle ? (
              <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/35">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak >= 2 ? (
            <span
              className="animate-pop chip !text-[8px]"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              <Icon name="flame" size={10} /> ×{streak} streak
            </span>
          ) : null}
          <span className="chip !text-[8px]">
            <Icon name="star" size={10} /> {score}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* progress */}
      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full transition-[width] duration-500 ease-spring"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent2})`,
          }}
        />
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Question {index + 1}</p>
            <h3 className="mt-2 font-display text-[clamp(17px,2.6vw,25px)] font-bold leading-snug text-white">
              {question.prompt}
            </h3>
          </div>
          {perQuestionMs ? (
            <div className="relative grid h-16 w-16 shrink-0 place-items-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke={timePct < 30 ? "#ff5470" : accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={119.4}
                  strokeDashoffset={119.4 * (1 - timePct / 100)}
                  style={{ transition: "stroke-dashoffset 0.12s linear" }}
                />
              </svg>
              <span className="font-display text-sm font-black text-white">
                {Math.ceil(timeLeft / 1000)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2" role="group" aria-label="Answer options">
          {question.options.map((option, i) => {
            const isPicked = picked === i;
            const isCorrect = i === question.answer;
            const revealed = picked !== null;
            return (
              <button
                key={`${option}-${i}`}
                type="button"
                disabled={revealed}
                onClick={() => answer(i)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200",
                  !revealed && "border-white/12 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.07]",
                  revealed && isCorrect && "border-arc-green/60 bg-arc-green/15",
                  revealed && isPicked && !isCorrect && "border-arc-pink/60 bg-arc-pink/15",
                  revealed && !isCorrect && !isPicked && "border-white/8 bg-white/[0.02] opacity-45",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-[10px] font-bold",
                    revealed && isCorrect
                      ? "border-arc-green/50 bg-arc-green/25 text-arc-green"
                      : revealed && isPicked
                        ? "border-arc-pink/50 bg-arc-pink/25 text-arc-pink"
                        : "border-white/15 bg-white/5 text-white/50 group-hover:text-white",
                  )}
                >
                  {revealed && isCorrect ? (
                    <Icon name="check" size={13} />
                  ) : revealed && isPicked ? (
                    <Icon name="close" size={13} />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span className="min-w-0 flex-1 text-[13.5px] font-medium text-white/85">
                  {option}
                </span>
                <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-white/20 sm:block">
                  {OPTION_KEYS[i]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[52px]">
          {picked !== null ? (
            <div className="animate-[rise_0.3s_ease-out_both] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
              <div className="min-w-0">
                <p
                  className="font-mono text-[9px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: picked === question.answer ? "#4af2a1" : "#ff5470" }}
                >
                  {picked === question.answer
                    ? lastGain > 0
                      ? `Correct · +${lastGain}`
                      : "Correct"
                    : picked === -1
                      ? "Time up"
                      : "Not quite"}
                </p>
                <p className="mt-1 text-[12.5px] leading-snug text-white/60">{question.explain}</p>
              </div>
              <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={next}>
                {index + 1 >= total ? "See results" : "Next"}
                <Icon name="arrowRight" size={13} />
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 px-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
              <Icon name="keyboard" size={12} /> Press 1–{question.options.length} to answer
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
