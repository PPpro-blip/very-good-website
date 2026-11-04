"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { GameArt } from "@/components/games/GameArt";
import { GAMES, getGame, PLAY_ROUTE } from "@/data/games";
import { ACHIEVEMENTS, earnedAchievements } from "@/lib/achievements";
import { audio } from "@/lib/audio";
import { useLockBodyScroll } from "@/lib/hooks";
import { store, useWowStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

const AVATARS = ["🕹️", "👾", "🚀", "🦊", "🐉", "⚡", "🎯", "🌌"];

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] leading-snug text-white/40">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300",
          checked
            ? "border-arc-cyan/50 bg-arc-cyan/25"
            : "border-white/15 bg-white/[0.06]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 ease-spring",
            checked
              ? "left-6 bg-gradient-to-br from-white to-arc-cyan shadow-[0_0_14px_rgba(46,230,255,0.8)]"
              : "left-0.5 bg-white/60",
          )}
        />
      </button>
    </div>
  );
}

export function ProfilePanel() {
  const { profileOpen, closeProfile, toast } = useArcade();
  const state = useWowStore();
  const [draftName, setDraftName] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useLockBodyScroll(profileOpen);

  useEffect(() => {
    if (profileOpen) {
      setDraftName(state.nickname);
      setConfirmReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen]);

  if (!profileOpen) return null;

  const earned = earnedAchievements(state);
  const earnedIds = new Set(earned.map((a) => a.id));
  const playerLabel = state.nickname.trim() || "Guest Player";
  const recent = state.recent
    .map((r) => ({ ...r, game: getGame(r.slug) }))
    .filter((r): r is typeof r & { game: NonNullable<typeof r.game> } => Boolean(r.game))
    .slice(0, 4);
  const favourites = state.favorites.map(getGame).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const bestEntries = Object.entries(state.best).filter(([, v]) => v > 0);

  const saveName = (event: React.FormEvent) => {
    event.preventDefault();
    store.setNickname(draftName);
    audio.sfx("success");
    toast("Profile saved", draftName.trim() ? `Welcome, ${draftName.trim()}` : "Playing as guest", "good");
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[#02030a]/80 backdrop-blur-md"
        onClick={closeProfile}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player profile and settings"
        className="animate-pop relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/12 bg-[#070a16]/97 shadow-[0_40px_120px_-40px_#000] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-black text-[#05060f]"
              style={{ background: "linear-gradient(135deg,#2ee6ff,#8b5cf6 58%,#ff3fd8)" }}
              aria-hidden
            >
              <span className="text-2xl leading-none" aria-hidden>
                {state.avatar || "🕹️"}
              </span>
            </span>
            <div>
              <p className="font-display text-base font-black uppercase tracking-[0.1em] text-white">
                {playerLabel}
              </p>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">
                Player card · saved on this device
              </p>
            </div>
          </div>
          <button type="button" onClick={closeProfile} className="icon-btn" aria-label="Close profile">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {/* avatar picker */}
          <div className="mb-4">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-white/40">
              Pick your avatar
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Choose avatar">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-pressed={state.avatar === emoji}
                  aria-label={`Avatar ${emoji}`}
                  onClick={() => {
                    store.setAvatar(emoji);
                    audio.sfx("click");
                  }}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl border text-lg transition",
                    state.avatar === emoji
                      ? "border-arc-cyan/60 bg-arc-cyan/15 shadow-[0_0_18px_-6px_rgba(46,230,255,0.9)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: "Rounds played", value: state.totalPlays },
              { label: "Favourites", value: state.favorites.length },
              { label: "Best scores", value: bestEntries.length },
              { label: "Study points", value: state.studyPoints },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-3"
              >
                <p className="font-display text-2xl font-black leading-none text-white">
                  {stat.value}
                </p>
                <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* nickname */}
          <form onSubmit={saveName} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="nickname">
              Nickname
            </label>
            <input
              id="nickname"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value.slice(0, 18))}
              placeholder="Enter a nickname (max 18)"
              maxLength={18}
              className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-arc-cyan/50 focus:outline-none"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Icon name="check" size={14} /> <span>Save</span>
            </button>
          </form>

          {/* continue */}
          {recent.length > 0 ? (
            <section className="mt-6">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="eyebrow">Recently played</p>
                <Link
                  href="/games?filter=favorites"
                  onClick={closeProfile}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35 hover:text-white"
                >
                  Favourites →
                </Link>
              </div>
              <ul className="space-y-1.5">
                {recent.map(({ slug, at, game }) => (
                  <li key={slug}>
                    <Link
                      href={PLAY_ROUTE(slug)}
                      onClick={() => {
                        audio.sfx("click");
                        closeProfile();
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-white/10">
                        <GameArt game={game} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-white">
                          {game.title}
                        </span>
                        <span className="block font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/35">
                          {timeAgo(at)}
                        </span>
                      </span>
                      <Icon name="play" size={13} className="text-arc-cyan" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-white/12 px-4 py-5 text-center text-sm text-white/40">
              No games yet — the arcade is warm.{" "}
              <Link href="/games" onClick={closeProfile} className="text-arc-cyan hover:underline">
                Pick a cabinet →
              </Link>
            </p>
          )}

          {/* favourites */}
          {favourites.length > 0 ? (
            <section className="mt-5">
              <p className="eyebrow mb-2.5">Your favourites</p>
              <div className="flex flex-wrap gap-1.5">
                {favourites.map((game) => (
                  <Link
                    key={game.slug}
                    href={PLAY_ROUTE(game.slug)}
                    onClick={closeProfile}
                    className="chip chip-interactive"
                  >
                    <Icon name="heart" size={10} /> {game.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* best scores */}
          {bestEntries.length > 0 ? (
            <section className="mt-5">
              <p className="eyebrow mb-2.5">Personal bests</p>
              <div className="flex flex-wrap gap-1.5">
                {bestEntries.slice(0, 8).map(([key, value]) => {
                  const [slug, mode] = key.split(":");
                  const game = GAMES.find((g) => g.slug === slug);
                  return (
                    <span key={key} className="chip">
                      <Icon name="trophy" size={10} className="text-arc-yellow" />
                      {game?.title ?? slug}
                      {mode ? ` · L${mode}` : ""}
                      <span className="text-white">{value}</span>
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* achievements */}
          <section className="mt-5">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="eyebrow">Achievements</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                {earned.length}/{ACHIEVEMENTS.length} unlocked
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {ACHIEVEMENTS.map((a) => {
                const has = earnedIds.has(a.id);
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2",
                      has
                        ? "border-arc-cyan/30 bg-arc-cyan/[0.07]"
                        : "border-white/8 bg-white/[0.02] opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm",
                        has
                          ? "bg-gradient-to-br from-arc-cyan to-arc-violet text-[#05060f]"
                          : "border border-white/10 bg-white/5 text-white/40",
                      )}
                      aria-hidden
                    >
                      {has ? a.glyph : "?"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-white">
                        {a.label}
                      </span>
                      <span className="block truncate text-[10px] text-white/40">{a.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* settings */}
          <section className="mt-5">
            <p className="eyebrow mb-2.5">Settings</p>
            <div className="space-y-2">
              <Toggle
                label="Sound effects"
                hint="Synthesised clicks, jumps, coins and explosions."
                checked={!state.muted}
                onChange={(next) => {
                  store.setMuted(!next);
                  if (next) {
                    audio.unlock();
                    audio.sfx("success");
                  }
                }}
              />
              <Toggle
                label="Ambient arcade hum"
                hint="A soft synth pad under the arcade. Never autoplays."
                checked={state.ambient}
                onChange={(next) => {
                  store.setAmbient(next);
                  if (next) {
                    audio.unlock();
                    audio.sfx("chime");
                  }
                }}
              />
              <Toggle
                label="Motion &amp; particles"
                hint="Turn off for a calm, static arcade (saves battery)."
                checked={state.motion}
                onChange={(next) => {
                  store.setMotion(next);
                  toast(
                    next ? "Motion on" : "Motion off",
                    next ? "Particles and tilt restored" : "Static mode for comfort",
                  );
                }}
              />
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-[11px] leading-relaxed text-white/40">
              Progress, favourites and scores are stored in your browser&apos;s local storage on this
              device. There is no account and no cloud sync — clearing site data resets everything.
            </p>
            {confirmReset ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm border border-arc-pink/40 bg-arc-pink/15 text-arc-pink"
                  onClick={() => {
                    store.reset();
                    setConfirmReset(false);
                    toast("Progress reset", "Clean slate. New high scores await.", "warn");
                  }}
                >
                  Yes, wipe my progress
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm mt-3"
                onClick={() => setConfirmReset(true)}
              >
                <Icon name="rotate" size={13} /> <span>Reset local data</span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
