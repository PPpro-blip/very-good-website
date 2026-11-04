import type { Metadata } from "next";
import { StudyZone } from "@/components/study/StudyZone";

export const metadata: Metadata = {
  title: "Study Zone",
  description:
    "Revision that feels like an arcade: maths, science, geography, general knowledge, vocabulary, logic and memory rounds with streaks, points and achievements.",
};

export default function StudyPage() {
  return <StudyZone />;
}
