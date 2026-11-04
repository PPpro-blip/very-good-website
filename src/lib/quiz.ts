import type { QuizQuestion } from "@/data/questions";
import { SPELLING_WORDS } from "@/data/questions";
import { shuffle } from "./utils";

/** Small deterministic-ish helpers for the generated question types. */

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleQuestion(q: QuizQuestion): QuizQuestion {
  const correct = q.options[q.answer];
  const options = shuffle(q.options);
  return { ...q, options, answer: options.indexOf(correct) };
}

export function pickQuestions(bank: QuizQuestion[], count: number, maxLevel = 3): QuizQuestion[] {
  const pool = bank.filter((q) => q.level <= maxLevel);
  const source = pool.length >= count ? pool : bank;
  return shuffle(source).slice(0, count).map(shuffleQuestion);
}

/** Build 3 unique numeric distractors around the correct answer. */
function numericOptions(correct: number, spread = 4): { options: string[]; answer: number } {
  const values = new Set<number>();
  let guard = 0;
  while (values.size < 3 && guard++ < 80) {
    const delta = randInt(1, Math.max(2, spread));
    const candidate = correct + (Math.random() < 0.5 ? -delta : delta);
    if (candidate !== correct && candidate >= 0) values.add(candidate);
  }
  while (values.size < 3) values.add(correct + values.size + 1);
  const options = shuffle([String(correct), ...[...values].map(String)]);
  return { options, answer: options.indexOf(String(correct)) };
}

/** Quick Math — fully generated, scales with the round's difficulty. */
export function generateMathQuestion(level: number): QuizQuestion {
  const tier = Math.min(4, Math.max(1, level));
  const kinds = tier === 1 ? ["add", "sub", "mul"] : tier === 2 ? ["add", "sub", "mul", "div"] : ["mul", "div", "percent", "square", "fraction", "chain"];
  const kind = kinds[randInt(0, kinds.length - 1)];

  if (kind === "add") {
    const a = randInt(10, tier === 1 ? 20 : 89);
    const b = randInt(10, tier === 1 ? 20 : 79);
    return build(`${a} + ${b} = ?`, a + b, `Add tens and units separately: ${a} + ${b} = ${a + b}.`);
  }
  if (kind === "sub") {
    const a = randInt(30, tier === 1 ? 40 : 120);
    const b = randInt(5, a - 2);
    return build(`${a} − ${b} = ?`, a - b, `Subtract carefully: ${a} − ${b} = ${a - b}.`);
  }
  if (kind === "mul") {
    const a = randInt(2, tier === 1 ? 6 : tier === 2 ? 9 : 12);
    const b = randInt(2, tier === 1 ? 6 : tier === 2 ? 9 : 12);
    return build(`${a} × ${b} = ?`, a * b, `${a} groups of ${b} makes ${a * b}.`);
  }
  if (kind === "div") {
    const b = randInt(2, 9);
    const answer = randInt(2, 12);
    return build(`${b * answer} ÷ ${b} = ?`, answer, `${b} × ${answer} = ${b * answer}.`);
  }
  if (kind === "percent") {
    const pct = [10, 20, 25, 50][randInt(0, 3)];
    const base = [40, 60, 80, 120, 200, 160][randInt(0, 5)];
    const answer = (base * pct) / 100;
    return build(`${pct}% of ${base} = ?`, answer, `${pct}% is ${pct / 100} of the number: ${base} × ${pct / 100} = ${answer}.`);
  }
  if (kind === "square") {
    const n = randInt(4, 13);
    return build(`${n}² = ?`, n * n, `${n}² means ${n} × ${n} = ${n * n}.`);
  }
  if (kind === "fraction") {
    const den = [2, 3, 4, 5][randInt(0, 3)];
    const unit = randInt(4, 12);
    const whole = den * unit;
    return build(`1/${den} of ${whole} = ?`, unit, `Divide ${whole} into ${den} equal parts: ${whole} ÷ ${den} = ${unit}.`);
  }
  // chain: a + b × c
  const a = randInt(2, 9);
  const b = randInt(2, 6);
  const c = randInt(2, 6);
  return build(
    `${a} + ${b} × ${c} = ?`,
    a + b * c,
    `Multiplication first: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`,
  );
}

function build(prompt: string, correct: number, explain: string): QuizQuestion {
  const { options, answer } = numericOptions(correct, Math.max(3, Math.round(Math.abs(correct) * 0.12)));
  return { prompt, options, answer, explain, level: 2 };
}

/** Pattern Detective — generated sequences with a single clear rule. */
export function generatePatternQuestion(level: number): QuizQuestion {
  const tier = Math.min(3, Math.max(1, level));
  const kind = randInt(0, tier === 1 ? 1 : 3);

  if (kind === 0) {
    const start = randInt(2, 12);
    const step = randInt(2, tier === 1 ? 4 : 9);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const answer = start + 4 * step;
    return { prompt: `What comes next?  ${seq.join(", ")}, …`, ...numericOptions(answer, step), explain: `The rule is +${step} each time.`, level: 2 };
  }
  if (kind === 1) {
    const start = randInt(1, 4);
    const mul = randInt(2, tier === 1 ? 2 : 3);
    const seq = [0, 1, 2, 3].map((i) => start * Math.pow(mul, i));
    const answer = start * Math.pow(mul, 4);
    return { prompt: `What comes next?  ${seq.join(", ")}, …`, ...numericOptions(answer, Math.max(2, Math.round(answer * 0.2))), explain: `Each term is multiplied by ${mul}.`, level: 3 };
  }
  if (kind === 2) {
    const start = randInt(1, 5);
    const seq = [0, 1, 2, 3].map((i) => Math.pow(start + i, 2));
    const answer = Math.pow(start + 4, 2);
    return { prompt: `What comes next?  ${seq.join(", ")}, …`, ...numericOptions(answer, start + 4), explain: "These are perfect squares: 1², 2², 3²…", level: 3 };
  }
  const a0 = randInt(1, 4);
  const a1 = randInt(2, 6);
  const seq = [a0, a1, a0 + a1, a0 + 2 * a1];
  const answer = 2 * (a0 + a1) + (a0 + 2 * a1) - (a0 + a1);
  return {
    prompt: `What comes next?  ${seq.join(", ")}, …`,
    ...numericOptions(answer, 4),
    explain: "Each term is the sum of the two before it.",
    level: 3,
  };
}

/** Mutate a word into plausible misspellings. */
function misspell(word: string): string[] {
  const out = new Set<string>();
  const letters = word.split("");
  const swapIdx = randInt(0, letters.length - 2);
  const swapped = [...letters];
  [swapped[swapIdx], swapped[swapIdx + 1]] = [swapped[swapIdx + 1], swapped[swapIdx]];
  out.add(swapped.join(""));
  const doubleIdx = randInt(1, letters.length - 1);
  out.add([...letters.slice(0, doubleIdx), letters[doubleIdx], ...letters.slice(doubleIdx)].join(""));
  const dropIdx = randInt(1, letters.length - 1);
  out.add([...letters.slice(0, dropIdx), ...letters.slice(dropIdx + 1)].join(""));
  out.delete(word);
  return [...out].slice(0, 3);
}

/** Word Wizard — spell it from a scrambled hint. */
export function generateSpellingQuestion(level: number): QuizQuestion {
  const pool = level >= 3 ? SPELLING_WORDS.filter((w) => w.word.length >= 8) : SPELLING_WORDS;
  const entry = pool[randInt(0, pool.length - 1)];
  const scrambled = shuffle(entry.word.split(""))
    .join("")
    .toUpperCase();
  const distractors = misspell(entry.word);
  const options = shuffle([entry.word, ...distractors]);
  return {
    prompt: `Unscramble: ${scrambled}  —  “${entry.hint}”`,
    options,
    answer: options.indexOf(entry.word),
    explain: `The word is “${entry.word}”.`,
    level: 2,
  };
}

/** Brain Blast Word Wizard also asks quick vocabulary questions. */
export function makeVocabularyRound(count: number, level = 2, bank: QuizQuestion[]): QuizQuestion[] {
  return pickQuestions(bank, count, level);
}
