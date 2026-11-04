"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { QuizRound, type QuizResult } from "@/components/quiz/QuizRound";
import { STUDY_TOPICS, type StudyTopic } from "@/data/study-topics";
import type { QuizQuestion } from "@/data/questions";
import { shuffleQuestion, generateMathQuestion, pickQuestions, randInt } from "@/lib/quiz";
import { audio } from "@/lib/audio";
import { store, useWowStore } from "@/lib/store";
import { ACHIEVEMENTS, earnedAchievements } from "@/lib/achievements";
import { cn, shuffle } from "@/lib/utils";

/** Build a generator that never repeats the same question twice in a row. */
function bankGenerator(bank: QuizQuestion[]): () => QuizQuestion {
  let lastPrompt = "";
  return () => {
    let guard = 0;
    let question = shuffleQuestion(bank[randInt(0, bank.length - 1)]);
    while (question.prompt === lastPrompt && guard++ < 10) {
      question = shuffleQuestion(bank[randInt(0, bank.length - 1)]);
    }
    lastPrompt = question.prompt;
    return question;
  };
}

export function StudyZone() {
  const state = useWowStore();
  const [selected, setSelected] = useState<StudyTopic | null>(null);
  const [lastResult, setLastResult] = useState<{ topic: string; result: QuizResult } | null>(null);
  const roundRef = useRef<HTMLDivElement | null>(null);
  const earned = earnedAchievements(state);
  const earnedIds = new Set(earned.map((a) => a.id));

  const generator = useMemo(() => {
    if (!selected) return undefined;
    if (selected.kind === "maths") {
      return (index: number) => generateMathQuestion(1 + Math.floor(index / 2));
    }
    if (selected.bank) return bankGenerator(shuffle(selected.bank));
    return undefined;
  }, [selected]);

  const fixedQuestions = useMemo(() => {
    if (selected?.kind === "speed" && selected.bank) return pickQuestions(selected.bank, 8);
    return undefined;
  }, [selected]);

  const start = (topic: StudyTopic) => {
    if (topic.kind === "memory") return;
    setSelected(topic);
    setLastResult(null);
    audio.sfx("launch");
    window.setTimeout(() => roundRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const exitRound = () => {
    setSelected(null);
    audio.sfx("click");
  };

  return (
    <div className="shell py-10 md:py-14">
      {/* header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow" style={{ color: "#4af2a1" }}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-green align-middle" />
            Study Zone · learn by arcade
          </p>
          <h1 className="mt-3 font-display text-[clamp(30px,6vw,56px)] font-black uppercase leading-[0.92] tracking-tight text-white">
            Revision, but
            <br />
            <span className="arc-text">make it an arcade</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
            Eight topics, short rounds, real questions. Points build into a local score, streaks
            multiply, and nothing punishes you for taking a breath. Every question is written or
            generated for this project.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip !border-arc-green/30 !bg-arc-green/10 !text-arc-green">
              <Icon name="star" size={11} /> {state.studyPoints} study points
            </span>
            <span className="chip">
              <Icon name="trophy" size={11} /> {earned.length}/{ACHIEVEMENTS.length} achievements
            </span>
            <span className="chip">
              <Icon name="user" size={11} /> saved on this device
            </span>
          </div>
        </div>

        <div className="grid w-full max-w-md grid-cols-3 gap-2.5 lg:w-auto">
          {[
            { key: "maths", label: "Maths" },
            { key: "science", label: "Science" },
            { key: "logic", label: "Logic" },
          ].map((item) => {
            const best = state.best[`study:${item.key}`] ?? 0;
            return (
              <div key={item.key} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                <p className="font-display text-lg font-black text-white">{best > 0 ? best : "—"}</p>
                <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
                  {item.label} best
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* active round */}
      {selected ? (
        <div ref={roundRef} className="mt-10 scroll-mt-24">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow" style={{ color: selected.accent }}>
              Now playing · {selected.label}
            </p>
            <button
              type="button"
              onClick={exitRound}
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40 hover:text-white"
            >
              ← Change topic
            </button>
          </div>
          <QuizRound
            title={`${selected.label} round`}
            subtitle={
              selected.kind === "speed"
                ? "8 mixed questions · 12s each"
                : "8 questions · streak bonuses · no timer"
            }
            accent={selected.accent}
            accent2={selected.accent2}
            total={8}
            questions={fixedQuestions}
            generate={generator}
            perQuestionMs={selected.timerMs ?? null}
            scoreKey={`study:${selected.id}`}
            pointsDivisor={25}
            onExit={exitRound}
            exitLabel="Topics"
            onComplete={(result) => {
              setLastResult({ topic: selected.label, result });
              if (result.newBest) audio.sfx("levelup");
            }}
          />
        </div>
      ) : null}

      {/* topic grid */}
      <section className="mt-10" aria-label="Study topics">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-lg font-black uppercase tracking-[0.06em] text-white">
            Pick a subject
          </h2>
          {lastResult ? (
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
              Last: {lastResult.topic} · {lastResult.result.score} pts
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STUDY_TOPICS.map((topic) => {
            const best = state.best[`study:${topic.id}`] ?? 0;
            const isMemory = topic.kind === "memory";
            const cardInner = (
              <>
                <span
                  className="absolute inset-x-0 top-0 h-[2px] opacity-80"
                  style={{ background: `linear-gradient(90deg, ${topic.accent}, ${topic.accent2})` }}
                />
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl border font-display text-lg font-black"
                    style={{
                      borderColor: `${topic.accent}44`,
                      background: `${topic.accent}14`,
                      color: topic.accent,
                    }}
                    aria-hidden
                  >
                    {topic.glyph}
                  </span>
                  {best > 0 ? (
                    <span className="chip !px-2 !py-0.5 !text-[8px]">
                      <Icon name="trophy" size={9} /> {best}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white">
                  {topic.label}
                </p>
                <p className="mt-1.5 line-2 text-[12px] leading-relaxed text-white/45">{topic.blurb}</p>
                <p className="mt-3 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/30">
                  <Icon name={isMemory ? "brain" : topic.timerMs ? "clock" : "book"} size={10} />
                  {topic.difficultyNote}
                </p>
              </>
            );

            return isMemory ? (
              <Link
                key={topic.id}
                href="/play/brain-blast"
                onClick={() => audio.sfx("launch")}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#080c19]/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                {cardInner}
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-arc-cyan">
                  Open Brain Blast <Icon name="arrowRight" size={11} />
                </span>
              </Link>
            ) : (
              <button
                key={topic.id}
                type="button"
                onClick={() => start(topic)}
                className={cn(
                  "group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#080c19]/80 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/25",
                  selected?.id === topic.id && "border-white/40",
                )}
              >
                {cardInner}
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/60 group-hover:text-white">
                  Start round <Icon name="arrowRight" size={11} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* achievements + explanation */}
      <section className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-black uppercase tracking-[0.06em] text-white">
              Achievements
            </h2>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
              {earned.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const has = earnedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-2.5 py-2",
                    has
                      ? "border-arc-green/25 bg-arc-green/[0.06]"
                      : "border-white/8 bg-white/[0.02] opacity-55",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs",
                      has
                        ? "bg-gradient-to-br from-arc-green to-arc-cyan text-[#04050c]"
                        : "border border-white/10 bg-white/5 text-white/40",
                    )}
                  >
                    {has ? achievement.glyph : "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-white">{achievement.label}</p>
                    <p className="truncate text-[10px] text-white/40">{achievement.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="font-display text-base font-black uppercase tracking-[0.06em] text-white">
            How scoring works
          </h2>
          <ul className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-white/50">
            {[
              ["Base points", "Every correct answer is worth 100 points."],
              ["Streak bonus", "Each consecutive correct answer adds +20, capped at +100."],
              ["Timed rounds", "The Speed round gives 12 seconds per question — run out and it counts as wrong."],
              ["Your records", "Best scores are stored per topic in this browser. Nothing leaves your device."],
            ].map(([label, copy]) => (
              <li key={label} className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-green" />
                <span>
                  <span className="font-semibold text-white/80">{label}: </span>
                  {copy}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.1em] text-white/35">
            Tip: press 1–4 to answer, Enter for the next question.
          </p>
        </div>
      </section>
    </div>
  );
}
