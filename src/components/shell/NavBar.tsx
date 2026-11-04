"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { Logo } from "@/components/shell/Logo";
import { audio } from "@/lib/audio";
import { store, useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "home", exact: true },
  { href: "/games", label: "Games", icon: "grid" },
  { href: "/categories", label: "Categories", icon: "layers" },
  { href: "/custom", label: "Original", icon: "spark" },
  { href: "/study", label: "Study", icon: "book" },
  { href: "/sensory", label: "Sensory", icon: "wave" },
  { href: "/about", label: "About", icon: "user" },
];

export function NavBar() {
  const pathname = usePathname() || "/";
  const { openSearch, openProfile, menuOpen, setMenuOpen, openRoulette } = useArcade();
  const { muted, nickname, totalPlays, favorites } = useWowStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the drawer whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [menuOpen, setMenuOpen]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === "/" : pathname.startsWith(item.href);

  const launchRandom = () => {
    // the wheel is the selection animation — it picks a real cabinet and launches it
    openRoulette();
  };

  const playerLabel = nickname?.trim() || "Guest";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-[#0a1020] focus:px-5 focus:py-3 focus:text-sm focus:text-white focus:ring-2 focus:ring-arc-cyan"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-[#04060f]/85 backdrop-blur-xl shadow-[0_16px_40px_-28px_#000]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-3">
          <Logo compact={scrolled} />

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => audio.sfx("click")}
                  className={cn(
                    "relative rounded-full px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors xl:text-[10.5px]",
                    active ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-arc-cyan via-arc-violet to-arc-magenta transition-transform duration-300 ease-spring",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="group flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-3 text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
              aria-label="Search games (press slash or Control K)"
            >
              <Icon name="search" size={17} />
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] md:inline">
                Search
              </span>
              <span className="hidden items-center gap-1 xl:flex">
                <span className="kbd">⌘</span>
                <span className="kbd">K</span>
              </span>
            </button>

            <button
              type="button"
              onClick={launchRandom}
              className="icon-btn"
              aria-label="Launch a random game"
              title="Random game"
            >
              <Icon name="dice" size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !muted;
                store.setMuted(next);
                if (!next) {
                  audio.unlock();
                  audio.sfx("click");
                }
              }}
              className="icon-btn"
              aria-pressed={!muted}
              aria-label={muted ? "Enable sound" : "Mute sound"}
              title={muted ? "Sound off — click to enable" : "Sound on — click to mute"}
            >
              <Icon name={muted ? "muted" : "sound"} size={17} />
            </button>

            <button
              type="button"
              onClick={openProfile}
              className="group relative hidden h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] pl-1.5 pr-3 transition hover:border-white/25 hover:bg-white/10 sm:flex"
              aria-label={`Player profile — ${playerLabel}`}
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full font-display text-[11px] font-black text-[#05060f]"
                style={{
                  background: "linear-gradient(135deg,#2ee6ff,#8b5cf6 60%,#ff3fd8)",
                }}
                aria-hidden
              >
                {playerLabel.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[74px] truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/70 group-hover:text-white">
                {playerLabel}
              </span>
              {totalPlays > 0 ? (
                <span
                  className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-arc-cyan px-1 font-mono text-[8px] font-bold text-[#04050c]"
                  aria-hidden
                >
                  {totalPlays > 99 ? "99+" : totalPlays}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(true);
                audio.sfx("click");
              }}
              className="icon-btn lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>

      {/* mobile / tablet drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[#03040b]/80 backdrop-blur-md transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col border-l border-white/10 bg-[#06080f]/95 transition-transform duration-500 ease-spring",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-display text-sm font-black tracking-[0.2em] text-white">
              MENU
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1.5">
              {NAV.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        audio.sfx("click");
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition",
                        active
                          ? "border-arc-cyan/40 bg-arc-cyan/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/75 hover:border-white/20 hover:bg-white/[0.05]",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border",
                          active
                            ? "border-arc-cyan/40 bg-arc-cyan/15 text-arc-cyan"
                            : "border-white/10 bg-white/[0.03] text-white/60",
                        )}
                      >
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="flex-1 font-display text-[13px] font-bold uppercase tracking-[0.12em]">
                        {item.label}
                      </span>
                      <Icon name="chevronRight" size={15} className="text-white/30" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-5 flex items-center gap-2">
              <button type="button" className="btn btn-ghost btn-sm flex-1" onClick={openSearch}>
                <Icon name="search" size={14} />
                <span>Search</span>
              </button>
              <button type="button" className="btn btn-ghost btn-sm flex-1" onClick={launchRandom}>
                <Icon name="dice" size={14} />
                <span>Random</span>
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="eyebrow mb-3">Player card</p>
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full font-display text-sm font-black text-[#05060f]"
                  style={{ background: "linear-gradient(135deg,#2ee6ff,#8b5cf6 60%,#ff3fd8)" }}
                >
                  {playerLabel.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-white">{playerLabel}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
                    {totalPlays} plays · {favorites.length} favourites
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm mt-3 w-full"
                onClick={openProfile}
              >
                <Icon name="sliders" size={14} />
                <span>Edit profile</span>
              </button>
            </div>
          </nav>

          <p className="border-t border-white/10 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
            Your world. Your games. Your arcade.
          </p>
        </div>
      </div>
    </>
  );
}
