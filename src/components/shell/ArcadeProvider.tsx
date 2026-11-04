"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Roulette } from "@/components/shell/Roulette";
import { LaunchCurtain } from "@/components/shell/LaunchCurtain";
import { RouteProgress } from "@/components/shell/RouteProgress";
import { Mascot } from "@/components/shell/Mascot";
import { audio } from "@/lib/audio";
import { GAMES, PLAY_ROUTE, type Game } from "@/data/games";
import { useMotionAttribute } from "@/lib/hooks";
import { store, useWowStore } from "@/lib/store";

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone?: "default" | "good" | "warn";
}

interface ArcadeContextValue {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  profileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toast: (title: string, detail?: string, tone?: Toast["tone"]) => void;
  /** "Surprise me" wheel */
  rouletteOpen: boolean;
  openRoulette: () => void;
  closeRoulette: () => void;
  /** cinematic launch transition, then navigate */
  launchGame: (slug: string) => void;
}

const ArcadeContext = createContext<ArcadeContextValue | null>(null);

export function useArcade(): ArcadeContextValue {
  const ctx = useContext(ArcadeContext);
  if (!ctx) throw new Error("useArcade must be used inside <ArcadeProvider>");
  return ctx;
}

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [launching, setLaunching] = useState<Game | null>(null);
  const router = useRouter();
  const toastId = useRef(0);
  const { muted, ambient } = useWowStore();

  useMotionAttribute();

  /* cursor-reactive ambience: feed the pointer position to a fixed glow layer */
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.motion === "off") return;
    let frame = 0;
    let x = 0.5;
    let y = 0.4;
    const apply = () => {
      frame = 0;
      document.documentElement.style.setProperty("--cx", `${(x * 100).toFixed(2)}%`);
      document.documentElement.style.setProperty("--cy", `${(y * 100).toFixed(2)}%`);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX / window.innerWidth;
      y = event.clientY / window.innerHeight;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* audio can only start after a gesture — install once, globally */
  useEffect(() => {
    audio.install();
  }, []);

  /* keep the ambient pad in sync — but never before the first user gesture */
  useEffect(() => {
    if (!ambient || muted) {
      audio.stopAmbient();
      return;
    }
    if (audio.isUnlocked) {
      audio.startAmbient();
      return;
    }
    const start = () => audio.startAmbient();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [ambient, muted]);

  const toast = useCallback((title: string, detail?: string, tone: Toast["tone"] = "default") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, title, detail, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
    audio.sfx("whoosh");
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openProfile = useCallback(() => {
    setMenuOpen(false);
    setProfileOpen(true);
    audio.sfx("click");
  }, []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  /* Cmd/Ctrl+K opens search from anywhere */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      // inside a game, single-key shortcuts belong to the game
      const playing = document.body.dataset.playing === "1";
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setMenuOpen(false);
      } else if (event.key === "/" && !typing && !playing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key.toLowerCase() === "r" && !typing && !playing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setRouletteOpen(true);
        audio.sfx("whoosh");
      } else if (event.key.toLowerCase() === "m" && !typing && event.altKey) {
        const next = !store.get().muted;
        store.setMuted(next);
        if (!next) audio.sfx("click");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  const openRoulette = useCallback(() => {
    setRouletteOpen(true);
    audio.sfx("whoosh");
  }, []);
  const closeRoulette = useCallback(() => setRouletteOpen(false), []);

  const launchingRef = useRef(false);
  const launchGame = useCallback(
    (slug: string) => {
      if (launchingRef.current) return;
      launchingRef.current = true;
      const game = GAMES.find((entry) => entry.slug === slug) ?? null;
      audio.sfx("launch");
      setLaunching(game);
      window.setTimeout(() => router.push(PLAY_ROUTE(slug)), 420);
      window.setTimeout(() => {
        setLaunching(null);
        launchingRef.current = false;
      }, 900);
    },
    [router],
  );

  const value = useMemo<ArcadeContextValue>(
    () => ({
      searchOpen,
      openSearch,
      closeSearch,
      profileOpen,
      openProfile,
      closeProfile,
      menuOpen,
      setMenuOpen,
      toast,
      rouletteOpen,
      openRoulette,
      closeRoulette,
      launchGame,
    }),
    [
      searchOpen,
      openSearch,
      closeSearch,
      profileOpen,
      openProfile,
      closeProfile,
      menuOpen,
      openRoulette,
      closeRoulette,
      launchGame,
      rouletteOpen,
      toast,
    ],
  );

  return (
    <ArcadeContext.Provider value={value}>
      <div className="cursor-glow" aria-hidden />
      <RouteProgress />
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-8"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0f20]/95 px-4 py-3 shadow-[0_20px_50px_-20px_#000] backdrop-blur"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold"
              style={{
                background:
                  t.tone === "good"
                    ? "linear-gradient(135deg,#4af2a1,#2ee6ff)"
                    : t.tone === "warn"
                      ? "linear-gradient(135deg,#ff8a3d,#ff5470)"
                      : "linear-gradient(135deg,#2ee6ff,#8b5cf6)",
                color: "#04050c",
              }}
              aria-hidden
            >
              {t.tone === "warn" ? "!" : t.tone === "good" ? "★" : "◆"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-white">{t.title}</p>
              {t.detail ? (
                <p className="truncate text-xs text-white/55">{t.detail}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <Roulette
        open={rouletteOpen}
        onClose={closeRoulette}
        onPlay={(slug) => {
          closeRoulette();
          launchGame(slug);
        }}
      />
      <LaunchCurtain game={launching} />
      <Mascot onSearch={openSearch} onRoulette={openRoulette} />
    </ArcadeContext.Provider>
  );
}
