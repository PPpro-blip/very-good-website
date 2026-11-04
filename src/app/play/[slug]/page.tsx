import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerClient } from "@/components/player/PlayerClient";
import { GAMES, getGame } from "@/data/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Cabinet not found" };
  return {
    title: game.title,
    description: game.description,
    openGraph: {
      title: `${game.title} — play free on WOW GAMES`,
      description: game.description,
      type: "article",
    },
  };
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return <PlayerClient slug={slug} />;
}
