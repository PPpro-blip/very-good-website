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
import { audio } from "@/lib/audio";
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
  const toastId = useRef(0);
  const { muted, ambient } = useWowStore();

  useMotionAttribute();

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
      } else if (event.key.toLowerCase() === "m" && !typing && event.altKey) {
        const next = !store.get().muted;
        store.setMuted(next);
        if (!next) audio.sfx("click");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


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
    }),
    [searchOpen, openSearch, closeSearch, profileOpen, openProfile, closeProfile, menuOpen, toast],
  );

  return (
    <ArcadeContext.Provider value={value}>
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
    </ArcadeContext.Provider>
  );
}
