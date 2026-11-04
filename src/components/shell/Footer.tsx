import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Emblem } from "@/components/shell/Logo";
import { GAMES, ORIGINAL_GAMES } from "@/data/games";

const COLUMNS = [
  {
    title: "Arcade",
    links: [
      { href: "/games", label: "All games" },
      { href: "/categories", label: "Categories" },
      { href: "/custom", label: "Original builds" },
      { href: "/games?filter=favorites", label: "Your favourites" },
    ],
  },
  {
    title: "Play",
    links: [
      { href: "/study", label: "Study Zone" },
      { href: "/sensory", label: "Sensory room" },
      { href: "/play/geometry-rush", label: "Geometry Rush" },
      { href: "/play/flappy-chaos", label: "Flappy Chaos" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/about", label: "About Wow Games" },
      { href: "/about#built", label: "How it's built" },
      { href: "/about#privacy", label: "Your data" },
      { href: "/about#contact", label: "Say hello" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-[#04060e]/80">
      <div className="shell py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <Emblem size={40} />
              <div>
                <p className="font-display text-lg font-black tracking-[0.14em] text-white">
                  WOW<span className="arc-text">GAMES</span>
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/35">
                  The infinite arcade
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              A hand-built arcade: {GAMES.length} playable cabinets, {ORIGINAL_GAMES.length} original
              games written from scratch, and not a single placeholder card. Your world. Your games.
              Your arcade.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">
                <Icon name="bolt" size={11} /> 60 fps canvas
              </span>
              <span className="chip">
                <Icon name="music" size={11} /> original chiptune
              </span>
              <span className="chip">
                <Icon name="user" size={11} /> no accounts
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/30">
            © {new Date().getFullYear()} WOW Games · Progress saved on this device only ·
            Built with Next.js &amp; Tailwind
          </p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/30">
            <span className="text-arc-cyan/80">●</span> Insert coin to continue
          </p>
        </div>
      </div>
      <div className="h-20 lg:h-0" aria-hidden="true" />
    </footer>
  );
}
