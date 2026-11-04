import { GENERAL, GEOGRAPHY, LOGIC, SCIENCE, SPEED_MIX, VOCABULARY, type QuizQuestion } from "./questions";

export interface StudyTopic {
  id: string;
  label: string;
  glyph: string;
  accent: string;
  accent2: string;
  blurb: string;
  /** how the round is produced */
  kind: "maths" | "bank" | "speed" | "memory";
  bank?: QuizQuestion[];
  timerMs?: number | null;
  difficultyNote: string;
}

/**
 * Study Zone topics. Maths is generated live; the rest use original question
 * banks. Memory training hands off to Brain Blast's Memory Master.
 */
export const STUDY_TOPICS: StudyTopic[] = [
  {
    id: "maths",
    label: "Maths",
    glyph: "∑",
    accent: "#4af2a1",
    accent2: "#2ee6ff",
    blurb: "Generated arithmetic that ramps up as your streak grows.",
    kind: "maths",
    difficultyNote: "Easy → tricky",
  },
  {
    id: "science",
    label: "Science",
    glyph: "⚛",
    accent: "#2ee6ff",
    accent2: "#4d7cff",
    blurb: "Space, biology, matter and the physics of everyday life.",
    kind: "bank",
    bank: SCIENCE,
    difficultyNote: "15 questions",
  },
  {
    id: "geography",
    label: "Geography",
    glyph: "◎",
    accent: "#4d7cff",
    accent2: "#8b5cf6",
    blurb: "Capitals, continents, oceans and the shape of the planet.",
    kind: "bank",
    bank: GEOGRAPHY,
    difficultyNote: "15 questions",
  },
  {
    id: "general",
    label: "General knowledge",
    glyph: "✶",
    accent: "#ffe066",
    accent2: "#ff8a3d",
    blurb: "Sport, music, film and the trivia you wish you already knew.",
    kind: "bank",
    bank: GENERAL,
    difficultyNote: "15 questions",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    glyph: "Aa",
    accent: "#ff3fd8",
    accent2: "#8b5cf6",
    blurb: "Synonyms, antonyms, spelling traps and precise word choice.",
    kind: "bank",
    bank: VOCABULARY,
    difficultyNote: "15 questions",
  },
  {
    id: "logic",
    label: "Logic puzzles",
    glyph: "◇",
    accent: "#c4b5fd",
    accent2: "#2ee6ff",
    blurb: "Sequences, deduction and the occasional delicious trick question.",
    kind: "bank",
    bank: LOGIC,
    difficultyNote: "14 puzzles",
  },
  {
    id: "memory",
    label: "Memory training",
    glyph: "◉",
    accent: "#4af2a1",
    accent2: "#ffe066",
    blurb: "Watch the sequence, repeat it back. Powered by Brain Blast.",
    kind: "memory",
    difficultyNote: "Brain Blast",
  },
  {
    id: "speed",
    label: "Speed round",
    glyph: "⚡",
    accent: "#ff8a3d",
    accent2: "#ff5470",
    blurb: "Mixed questions, 12 seconds each. Pure arcade revision.",
    kind: "speed",
    bank: SPEED_MIX,
    timerMs: 12000,
    difficultyNote: "Beat the clock",
  },
];

export function getTopic(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((t) => t.id === id);
}
