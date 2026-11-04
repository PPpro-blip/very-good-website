"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GameArt } from "@/components/games/GameArt";
import { getGame, GAMES, ORIGINAL_GAMES, PLAY_ROUTE } from "@/data/games";
import { Magnetic } from "@/components/ui/Magnetic";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";
import { useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const HEADLINES = [
  "Enter the infinite arcade.",
  `${GAMES.length} cabinets. Zero filler.`,
  "Study that feels like play.",
  "Original games, written from scratch.",
];

const SHOWCASE = getGame("geometry-rush")!;

export function Hero() {
  const router = useRouter();
  const { launchGame } = useArcade();
  const state = useWowStore();
  const motion = useMotionEnabled();
  const [headline, setHeadline] = useState(0);
  const [typed, setTyped] = useState(HEADLINES[0]);
  const cabinetRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);

  /* rotating headline — swapped whole, not letter-typed, so it never feels janky */
  useEffect(() => {
    if (!motion) return;
    const id = window.setInterval(() => {
      setHeadline((h) => (h + 1) % HEADLINES.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [motion]);

  useEffect(() => {
    setTyped(HEADLINES[headline]);
  }, [headline]);

  const continueGame = state.recent[0] ? getGame(state.recent[0].slug) : undefined;
  const primary = continueGame ?? SHOWCASE;

  const handlePointer = (event: React.PointerEvent) => {
    if (!motion) return;
    const el = cabinetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1400px) rotateY(${px * 8}deg) rotateX(${py * -6}deg)`;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${px * 10}px, ${py * 10}px)`;
    }
  };

  const handleLeave = () => {
    if (cabinetRef.current) cabinetRef.current.style.transform = "";
    if (knobRef.current) knobRef.current.style.transform = "";
  };

  return (
    <section className="relative overflow-hidden pb-6 pt-4 sm:pb-8 sm:pt-6 lg:pb-10" aria-labelledby="hero-title">
      {/* local glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full opacity-60 blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-[420px] w-[420px] rounded-full opacity-50 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(46,230,255,0.28), transparent 65%)" }}
      />

      <div className="shell relative grid items-center gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !border-arc-cyan/30 !bg-arc-cyan/10 !text-arc-cyan">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arc-cyan opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-arc-cyan" />
              </span>
              Arcade online
            </span>
            <span className="chip">{GAMES.length} playable cabinets</span>
            <span className="chip hidden sm:inline-flex">Built by one human</span>
          </div>

          <h1 id="hero-title" className="mt-5">
            <span className="sr-only">WOW GAMES — your world, your games, your arcade</span>
            <span aria-hidden className="block">
              <span className="title-hero chrome-text block text-[clamp(50px,10.5vw,112px)]">WOW</span>
              <span className="relative mt-[-0.06em] block">
                <span className="title-hero arc-text block text-[clamp(58px,13.5vw,132px)]">
                  GAMES
                </span>
                <span className="absolute -top-2 right-0 hidden rotate-[-6deg] rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 backdrop-blur sm:block">
                  est. 2026
                </span>
              </span>
            </span>
          </h1>

          <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-[11px]">
            Your world <span className="text-arc-cyan">·</span> Your games{" "}
            <span className="text-arc-violet">·</span> Your arcade
          </p>

          <div className="mt-4 flex min-h-[30px] items-center gap-2">
            <span className="font-mono text-sm text-arc-cyan" aria-hidden>
              &gt;
            </span>
            <p
              key={typed}
              className="animate-[rise_0.45s_cubic-bezier(0.16,1,0.3,1)_both] text-[clamp(15px,2.2vw,21px)] font-medium text-white/85"
            >
              {typed}
            </p>
            <span className="ml-0.5 inline-block h-[18px] w-[8px] animate-blink bg-arc-cyan" aria-hidden />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Magnetic strength={6}>
              <button
                type="button"
                onClick={() => {
                  audio.unlock();
                  launchGame(primary.slug);
                }}
                className="btn btn-primary !px-6 !py-4 text-[12px]"
              >
                <Icon name="play" size={15} />
                <span>Play now</span>
              </button>
            </Magnetic>
            <Link
              href="/games"
              onClick={() => audio.sfx("click")}
              className="btn btn-ghost !px-5 !py-4"
            >
              <Icon name="grid" size={15} />
              <span>Browse all games</span>
            </Link>
            <Link
              href={PLAY_ROUTE("fps-gods")}
              onClick={() => audio.sfx("click")}
              className="btn btn-ghost !px-5 !py-4 !border-arc-blue/45 !text-arc-cyan hover:!bg-arc-blue/15"
            >
              <Icon name="flame" size={15} />
              <span>FPS-GODS</span>
            </Link>
            <span className="hidden font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-white/30 sm:block">
              {continueGame ? (
                <>
                  Continue
                  <br />
                  <span className="text-white/55">{continueGame.title}</span>
                </>
              ) : (
                <>
                  No downloads
                  <br />
                  <span className="text-white/55">No signup</span>
                </>
              )}
            </span>
          </div>

          <dl className="mt-6 grid max-w-lg grid-cols-3 gap-3">
            {[
              { value: String(GAMES.length), label: "Cabinets" },
              { value: String(ORIGINAL_GAMES.length).padStart(2, "0"), label: "Built from scratch" },
              { value: "∞", label: "Retries" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.025] px-3.5 py-3 backdrop-blur"
              >
                <dt className="font-mono text-[8px] uppercase leading-none tracking-[0.16em] text-white/35">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-display text-xl font-black leading-none text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- hero cabinet ---------------- */}
        <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px]">
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] opacity-70 blur-[60px]"
            style={{
              background: `radial-gradient(circle at 55% 40%, ${SHOWCASE.palette.from}55, transparent 62%)`,
            }}
            aria-hidden
          />
          <div
            ref={cabinetRef}
            onPointerMove={handlePointer}
            onPointerLeave={handleLeave}
            className="relative transition-transform duration-300 ease-out will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* floating specs */}
            <div className="absolute -left-3 top-10 z-20 animate-floaty rounded-xl border border-white/15 bg-[#080c1a]/90 px-2.5 py-1.5 backdrop-blur">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">Frame rate</p>
              <p className="font-display text-sm font-black leading-tight text-arc-green">60 FPS</p>
            </div>
            <div
              className="absolute -right-2 top-1/3 z-20 hidden rounded-xl border border-white/15 bg-[#080c1a]/90 px-2.5 py-1.5 backdrop-blur sm:block"
              style={{ animationDelay: "1.2s" }}
            >
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">Mode</p>
              <p className="font-display text-sm font-black leading-tight text-arc-yellow">ONE BUTTON</p>
            </div>

            <div
              className="relative overflow-hidden rounded-[30px] border border-white/15 p-2.5 shadow-[0_50px_120px_-50px_rgba(46,230,255,0.55)]"
              style={{
                background: "linear-gradient(165deg, #161f3d 0%, #0a0f20 40%, #05070f 100%)",
              }}
            >
              {/* cabinet marquee */}
              <div className="relative flex items-center justify-between gap-2 rounded-t-2xl border border-white/10 bg-gradient-to-r from-arc-cyan/20 via-arc-violet/15 to-arc-magenta/20 px-3 py-2">
                <span className="font-display text-[10px] font-black uppercase tracking-[0.22em] text-white/90">
                  WOW GAMES
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-[0.18em] text-white/50">
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-arc-green" />
                  Cabinet 01
                </span>
              </div>

              {/* screen */}
              <Link
                href={PLAY_ROUTE(SHOWCASE.slug)}
                onClick={() => audio.sfx("launch")}
                className="screen scanlines vignette group relative mt-2 block aspect-[16/11] overflow-hidden rounded-xl border border-white/10 bg-black"
                aria-label="Play Geometry Rush, an original WOW GAMES build"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <GameArt game={SHOWCASE} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-transparent to-[#05070f]/40" />
                <div className="absolute inset-x-0 bottom-0 z-[4] p-3.5">
                  <span className="chip !border-arc-green/40 !bg-arc-green/15 !text-arc-green !text-[8px]">
                    Original build
                  </span>
                  <p className="mt-2 font-display text-xl font-black uppercase leading-none tracking-tight text-white sm:text-2xl">
                    Geometry Rush
                  </p>
                  <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/50">
                    One button · three levels · original soundtrack
                  </p>
                </div>
                <div className="absolute right-3 top-3 z-[4] flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-arc-pink" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/70">
                    Live
                  </span>
                </div>
                <div className="absolute inset-0 z-[4] grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md">
                    <Icon name="play" size={22} />
                  </span>
                </div>
              </Link>

              {/* control deck */}
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#080c1a]/80 px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-[#0b1122] shadow-inner">
                    <div
                      ref={knobRef}
                      className="h-7 w-7 rounded-full transition-transform duration-200"
                      style={{
                        background: "radial-gradient(circle at 35% 30%, #9be9ff, #2ee6ff 40%, #155e75)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.35)",
                      }}
                    />
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-1 rounded-full bg-white/10" />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { color: "#ff5470", label: "Jump" },
                      { color: "#ffe066", label: "Pause" },
                      { color: "#4af2a1", label: "Restart" },
                    ].map((btn, i) => (
                      <span
                        key={btn.label}
                        className="group/btn relative grid h-7 w-7 place-items-center rounded-full"
                        title={btn.label}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-white/20"
                          style={{
                            background: `radial-gradient(circle at 35% 30%, #fff, ${btn.color} 55%, rgba(0,0,0,0.4))`,
                            boxShadow: `0 3px 8px rgba(0,0,0,0.6), 0 0 12px ${btn.color}55`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[7.5px] uppercase tracking-[0.16em] text-white/35">
                    Insert coin
                  </p>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-arc-yellow">
                    1 CREDIT
                  </p>
                </div>
              </div>
            </div>

            {/* cabinet feet */}
            <div className="mx-auto h-2 w-[86%] rounded-b-2xl bg-gradient-to-b from-[#0a0f20] to-transparent" />
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="shell mt-12 hidden justify-center lg:flex">
        <a
          href="#featured"
          className="group flex flex-col items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-white/70"
        >
          Scroll to play
          <span className="relative h-10 w-[1px] overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scan_2.4s_ease-in-out_infinite] bg-gradient-to-b from-arc-cyan to-transparent" />
          </span>
        </a>
      </div>
    </section>
  );
}
