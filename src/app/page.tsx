import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Bits";
import { Reveal } from "@/components/ui/Reveal";
import { FeaturedRail } from "@/components/games/FeaturedRail";
import { GameArt } from "@/components/games/GameArt";
import { GameCard } from "@/components/games/GameCard";
import { Hero } from "@/components/games/Hero";
import { Marquee } from "@/components/shell/Marquee";
import { ContinueRow } from "@/components/home/ContinueRow";
import { DiscoveryShelves } from "@/components/home/DiscoveryShelves";
import { QuickLaunch } from "@/components/home/QuickLaunch";
import { TopPicks } from "@/components/home/TopPicks";
import { FpsZone } from "@/components/home/FpsZone";
import { FinalCTA, HomeStats } from "@/components/home/HomeWidgets";
import { EXTERNAL_GAMES, GAMES, ORIGINAL_GAMES, PLAY_ROUTE } from "@/data/games";
import { STUDY_TOPICS } from "@/data/study-topics";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "WOW GAMES",
  alternateName: "WOW GAMES — The Infinite Arcade",
  description:
    `A futuristic neon browser arcade: ${GAMES.length} playable cabinets, ${ORIGINAL_GAMES.length} original canvas games, a Study Zone and a sensory room.`,
  inLanguage: "en",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is static, so rendering it inline is safe and avoids a client fetch.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            STRUCTURED_DATA,
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "WOW GAMES cabinets",
              numberOfItems: GAMES.length,
              itemListElement: GAMES.map((game, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: game.title,
                url: `${PLAY_ROUTE}/${game.slug}/`,
              })),
            },
          ]),
        }}
      />
      <Hero />
      <Marquee />

      <QuickLaunch />

      <div className="shell mt-10 grid gap-5 md:mt-14 xl:grid-cols-[minmax(0,1fr)_314px]">
        <div>
          <Reveal>
            <SectionHead
              kicker="Featured · the front row"
              title={
                <>
                  The front of
                  <br />
                  the arcade
                </>
              }
              copy="Hover the artwork and the featured cabinet starts playing itself. Swipe the row, or take one of the picks on the right."
              action={{ href: "/games", label: "All games" }}
            />
          </Reveal>
          <Reveal delay={60} className="mt-5">
            <FeaturedRail />
          </Reveal>
        </div>
        <Reveal delay={120} className="min-w-0">
          <TopPicks />
        </Reveal>
      </div>

      <FpsZone />

      <ContinueRow />

      <DiscoveryShelves />

      {/* ---------------- study zone ---------------- */}
      <section className="shell mt-20" aria-labelledby="study-title">
        <Reveal>
          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-gradient-to-br from-[#071a18] via-[#071018] to-[#0a0a1c] p-6 md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-50 blur-[80px]"
              style={{ background: "radial-gradient(circle,#4af2a1,transparent 65%)" }}
            />
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="eyebrow" style={{ color: "#4af2a1" }}>
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-arc-green align-middle" />
                  Study Zone
                </p>
                <h2
                  id="study-title"
                  className="mt-2.5 font-display text-[clamp(26px,4.4vw,42px)] font-black uppercase leading-[0.95] text-white"
                >
                  Revision, but make
                  <br />
                  it an arcade
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
                  Short rounds of real questions across seven subjects, with streaks, achievements
                  and a difficulty curve that actually adapts. No timers screaming at you, no
                  paywalls — just points and progress.
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {STUDY_TOPICS.slice(0, 7).map((topic) => (
                    <span key={topic.id} className="chip">
                      {topic.glyph} {topic.label}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/study" className="btn btn-primary">
                    <Icon name="book" size={15} /> <span>Enter Study Zone</span>
                  </Link>
                  <Link href="/play/brain-blast" className="btn btn-ghost">
                    <Icon name="brain" size={15} /> <span>Brain Blast</span>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-white/12 bg-[#060c14]/90 p-4 shadow-[0_30px_80px_-40px_#000]">
                  <div className="flex items-center justify-between">
                    <span className="chip !border-arc-green/30 !bg-arc-green/10 !text-arc-green">
                      MATHS · ROUND 3
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
                      streak ×4
                    </span>
                  </div>
                  <p className="mt-4 font-display text-lg font-bold text-white">
                    What is 17 × 6?
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["92", "102", "112", "108"].map((option, i) => (
                      <div
                        key={option}
                        className={`rounded-xl border px-3 py-2.5 text-sm ${
                          i === 1
                            ? "border-arc-green/60 bg-arc-green/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/50"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {option}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">
                    <span>+120 points</span>
                    <span className="text-arc-green">correct</span>
                  </div>
                </div>
                <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
                  Preview of the real quiz screen
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- sensory ---------------- */}
      <section className="shell mt-20" aria-labelledby="sensory-title">
        <Reveal>
          <SectionHead
            kicker="Sensory room"
            accent="#c4b5fd"
            title={<span id="sensory-title">Nothing to lose</span>}
            copy="Two calm cabinets for when you want to fiddle with something instead of fight it. Sound is optional, motion can be switched off."
            action={{ href: "/sensory", label: "Enter sensory room" }}
          />
        </Reveal>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {[
            {
              slug: "ai-pet",
              title: "AI Pet",
              copy: "A tiny companion that reacts to your touch. Hosted build, wrapped in the WOW player.",
              tag: "External",
            },
            {
              slug: "aurora-drift",
              title: "Aurora Drift",
              copy: "Paint ribbons of light in three moods, with optional generative chimes.",
              tag: "Original",
            },
          ].map((item, i) => {
            const game = [...ORIGINAL_GAMES, ...EXTERNAL_GAMES].find((g) => g.slug === item.slug)!;
            return (
              <Reveal key={item.slug} delay={i * 90}>
                <Link
                  href={PLAY_ROUTE(item.slug)}
                  className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-[26px] border border-white/12 p-6 transition-transform duration-500 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 opacity-80 transition-transform duration-700 group-hover:scale-105">
                    <GameArt game={game} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/60 to-transparent" />
                  <div className="relative">
                    <span className="chip">{item.tag}</span>
                    <p className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-white/60">{item.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 group-hover:text-arc-cyan">
                      <Icon name="play" size={12} /> Play
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <HomeStats />
      <FinalCTA />

      {/* quick reference strip */}
      <section className="shell mt-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "keyboard" as const, title: "Keyboard first", copy: "Space, arrows, P, R — every original game is fully playable without a mouse." },
            { icon: "trophy" as const, title: "Local records", copy: "Best scores and favourites persist in your browser. No account required." },
            { icon: "gamepad" as const, title: "Touch ready", copy: "Tap to jump, tap to fly, tap to answer. Layouts built for thumbs." },
            { icon: "bolt" as const, title: "Fast", copy: "Static export, procedural art and one lightweight canvas per game." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <Icon name={item.icon} size={18} className="text-arc-cyan" />
                <p className="mt-3 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-white">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "WOW GAMES — The Infinite Arcade",
  description:
    `YOUR WORLD. YOUR GAMES. YOUR ARCADE. ${GAMES.length} playable cabinets, ${ORIGINAL_GAMES.length} original games written from scratch, an educational Study Zone and a sensory room.`,
};
