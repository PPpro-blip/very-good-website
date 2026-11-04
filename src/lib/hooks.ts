"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { store, useWowStore } from "./store";

/** SSR-safe layout effect (silences the Next.js warning). */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** True when the OS asks for reduced motion OR the player switched motion off. */
export function useMotionEnabled(): boolean {
  const osReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { motion } = useWowStore();
  return motion && !osReduced;
}

/** Pointer that can genuinely hover (mouse/trackpad, not a finger). */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

export function useKeyboard(
  handler: (event: KeyboardEvent) => void,
  options: { enabled?: boolean } = {},
): void {
  const { enabled = true } = options;
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => ref.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [enabled]);
}

export interface FullscreenApi {
  isFullscreen: boolean;
  supported: boolean;
  toggle: () => Promise<void>;
}

export function useFullscreen(ref: React.RefObject<HTMLElement | null>): FullscreenApi {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported = useMounted() && typeof document !== "undefined" && !!document.fullscreenEnabled;

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: "hide" });
      } else {
        // iOS Safari fallback: fullscreen window is not available for arbitrary elements
        const anyEl = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
        if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen();
      }
    } catch {
      /* user denied or unsupported — the UI simply stays windowed */
    }
  }, [ref]);

  return { isFullscreen, supported, toggle };
}

/** Interval that pauses when the tab is hidden and cleans up after itself. */
export function useVisibleInterval(callback: () => void, delay: number | null): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    if (delay === null) return;
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(() => ref.current(), delay);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    start();
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return () => stop();
  }, [delay]);
}

/** Applies the stored motion preference to <html> so CSS can react globally. */
export function useMotionAttribute(): void {
  useEffect(() => {
    const apply = (motion: boolean) => {
      document.documentElement.dataset.motion = motion ? "on" : "off";
    };
    apply(store.get().motion);
    return store.subscribe(() => apply(store.get().motion));
  }, []);
}
