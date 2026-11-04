"use client";

import { useEffect, useState } from "react";

/**
 * WOW GAMES local profile store.
 *
 * Everything lives in localStorage — there is no backend, no account and no sync.
 * The UI never claims otherwise. A single tiny external store (with useSyncExternalStore
 * under the hood via a manual subscription) keeps every button, badge and score in sync.
 */

const KEY = "wowgames.profile.v1";

export interface PlayEntry {
  slug: string;
  at: number;
}

export interface WowState {
  version: 1;
  nickname: string;
  favorites: string[];
  recent: PlayEntry[];
  plays: Record<string, number>;
  totalPlays: number;
  best: Record<string, number>;
  achievements: string[];
  studyPoints: number;
  muted: boolean;
  ambient: boolean;
  motion: boolean;
  onboarded: boolean;
}

export const DEFAULT_STATE: WowState = {
  version: 1,
  nickname: "",
  favorites: [],
  recent: [],
  plays: {},
  totalPlays: 0,
  best: {},
  achievements: [],
  studyPoints: 0,
  muted: false,
  ambient: false,
  motion: true,
  onboarded: false,
};

let state: WowState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function safeParse(raw: string | null): WowState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<WowState>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      version: 1,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent.slice(0, 12) : [],
      plays: parsed.plays && typeof parsed.plays === "object" ? parsed.plays : {},
      best: parsed.best && typeof parsed.best === "object" ? parsed.best : {},
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      totalPlays: typeof parsed.totalPlays === "number" ? parsed.totalPlays : 0,
      studyPoints: typeof parsed.studyPoints === "number" ? parsed.studyPoints : 0,
    };
  } catch {
    return null;
  }
}

function loadFromDisk(): WowState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // storage disabled (private mode / blocked cookies) — run in memory
    return { ...DEFAULT_STATE };
  }
  const parsed = safeParse(raw);
  if (!parsed) return { ...DEFAULT_STATE };
  // Respect the OS reduced-motion setting on first visit only.
  if (!parsed.onboarded && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    parsed.motion = false;
  }
  return parsed;
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = loadFromDisk();
    loaded = true;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the app still works in-memory */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<WowState>, persistNow = true) {
  ensureLoaded();
  state = { ...state, ...patch, version: 1 };
  if (persistNow) persist();
  emit();
}

export const store = {
  /** Read synchronously (auto-loads once on the client). */
  get(): WowState {
    ensureLoaded();
    return state;
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  patch(patch: Partial<WowState>) {
    setState(patch);
  },
  setNickname(nickname: string) {
    setState({ nickname: nickname.trim().slice(0, 18), onboarded: true });
  },
  toggleFavorite(slug: string): boolean {
    ensureLoaded();
    const has = state.favorites.includes(slug);
    setState({
      favorites: has ? state.favorites.filter((s) => s !== slug) : [...state.favorites, slug],
    });
    return !has;
  },
  isFavorite(slug: string) {
    ensureLoaded();
    return state.favorites.includes(slug);
  },
  recordPlay(slug: string) {
    ensureLoaded();
    const recent = [{ slug, at: Date.now() }, ...state.recent.filter((r) => r.slug !== slug)].slice(
      0,
      12,
    );
    setState({
      recent,
      totalPlays: state.totalPlays + 1,
      plays: { ...state.plays, [slug]: (state.plays[slug] ?? 0) + 1 },
    });
  },
  /** Returns whether the score was a new personal best. */
  submitScore(key: string, score: number): boolean {
    ensureLoaded();
    const prev = state.best[key] ?? 0;
    if (score <= prev) return false;
    setState({ best: { ...state.best, [key]: score } });
    return true;
  },
  getBest(key: string): number {
    ensureLoaded();
    return state.best[key] ?? 0;
  },
  addPoints(points: number) {
    ensureLoaded();
    setState({ studyPoints: state.studyPoints + Math.max(0, Math.round(points)) });
  },
  unlock(achievement: string): boolean {
    ensureLoaded();
    if (state.achievements.includes(achievement)) return false;
    setState({ achievements: [...state.achievements, achievement] });
    return true;
  },
  setMuted(muted: boolean) {
    setState({ muted });
  },
  setAmbient(ambient: boolean) {
    setState({ ambient });
  },
  setMotion(motion: boolean) {
    setState({ motion, onboarded: true });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.motion = motion ? "on" : "off";
    }
  },
  toggleFavoriteSafe(slug: string) {
    return store.toggleFavorite(slug);
  },
  reset() {
    state = { ...DEFAULT_STATE };
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
    emit();
  },
};

/** Reactive client hook. Starts from defaults so SSR markup always matches. */
export function useWowStore() {
  const [snapshot, setSnapshot] = useState<WowState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      if (alive) setSnapshot(store.get());
    };
    sync();
    setHydrated(true);
    const unsub = store.subscribe(sync);
    // keep multiple tabs in agreement
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        loaded = false;
        sync();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { ...snapshot, hydrated };
}

export function bestKey(slug: string, mode?: string): string {
  return mode ? `${slug}:${mode}` : slug;
}
