"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { GameArt } from "@/components/games/GameArt";
import { GAMES, PLAY_ROUTE } from "@/data/games";
import { ACHIEVEMENTS, earnedAchievements } from "@/lib/achievements";
import { audio } from "@/lib/audio";
import { useWowStore } from "@/lib/store";
import { pickRandom } from "@/lib/utils";

/** Player card summary on the homepage. Real numbers only. */
export function HomeStats() {
  const state = useWowStore();
  const { openProfile } = useArcade();
  const earned = earnedAchievements(state);
  const playerLabel = state.nickname.trim() || "Guest player";

  return (
    <section className="shell mt-16" aria-labelledby="card-title">
      <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#070b18]/80 p-6 backdrop-blur md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-[70px]"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 65%)" }}
        />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-black text-[#05060f]"
              style={{ background: "linear-gradient(135deg,#2ee6ff,#8b5cf6 58%,#ff3fd8)" }}
              aria-hidden
            >
              {playerLabel.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="eyebrow">Your arcade card</p>
              <h2
                id="card-title"
                className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white"
              >
                {playerLabel}
              </h2>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/45">
                {state.totalPlays === 0
                  ? "No runs yet. The cabinets are warm and waiting."
                  : `${state.totalPlays} rounds played · ${earned.length}/${ACHIEVEMENTS.length} achievements unlocked`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { value: state.totalPlays, label: "Rounds" },
              { value: state.favorites.length, label: "Favourites" },
              { value: Object.values(state.best).filter((v) => v > 0).length, label: "Records" },
              { value: state.studyPoints, label: "Study pts" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[84px] rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-center"
              >
                <p className="font-display text-xl font-black leading-none text-white">
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openProfile} className="btn btn-ghost btn-sm">
              <Icon name="sliders" size={13} /> <span>Player card</span>
            </button>
            <Link href="/games" className="btn btn-ghost btn-sm">
              <Icon name="grid" size={13} /> <span>Library</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Big end-of-page call to action with a real random-launch button. */
export function FinalCTA() {
  const router = useRouter();
  const motion = true; // purely decorative animation, handled by CSS + reduced-motion rules
  const [preview] = [GAMES[4]];

  return (
    <section className="shell mt-20">
      <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-[#0b1130] via-[#080c1c] to-[#0a0716] p-8 text-center md:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, rgba(46,230,255,0.22), transparent 65%), radial-gradient(50% 60% at 80% 100%, rgba(255,63,216,0.18), transparent 70%)",
          }}
        />
        <div className={`relative ${motion ? "animate-[rise_0.8s_ease-out_both]" : ""}`}>
          <span className="chip !border-arc-yellow/30 !bg-arc-yellow/10 !text-arc-yellow">
            <span className="h-1.5 w-1.5 rounded-full bg-arc-yellow" /> 1 credit remaining
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(26px,5vw,48px)] font-black uppercase leading-[0.95] text-white">
            Ready player one?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            Eleven cabinets, an original soundtrack and no excuse to stop. Let the arcade pick for
            you.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary !px-6"
              onClick={() => {
                const pick = pickRandom(GAMES);
                audio.sfx("launch");
                router.push(PLAY_ROUTE(pick.slug));
              }}
            >
              <Icon name="dice" size={15} /> <span>Launch random game</span>
            </button>
            <Link href="/custom" className="btn btn-ghost">
              <Icon name="spark" size={15} /> <span>Play the originals</span>
            </Link>
          </div>
          <div className="mt-7 flex items-center justify-center gap-2 opacity-80">
            <span className="relative h-10 w-24 overflow-hidden rounded-lg border border-white/15">
              <GameArt game={preview} />
            </span>
            <p className="max-w-[190px] text-left font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-white/30">
              No downloads. No accounts. High scores stay in your browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
