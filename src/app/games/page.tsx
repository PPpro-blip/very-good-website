import type { Metadata } from "next";
import { LibraryExplorer } from "@/components/games/LibraryExplorer";

export const metadata: Metadata = {
  title: "All games",
  description:
    "Every WOW GAMES cabinet in one library: filter by category, search, sort, favourite and play. Original canvas games and hosted builds, all playable in the browser.",
};

export default function GamesPage() {
  return <LibraryExplorer />;
}
