"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { audio } from "@/lib/audio";
import { useMotionEnabled } from "@/lib/hooks";

const TIPS = [
  {
    text: "Press / to search every cabinet, or ⌘K if you are fancy.",
    action: "search" as const,
    label: "Search",
  },
  {
    text: "Can't decide? I can spin the wheel for you.",
    action: "roulette" as const,
    label: "Spin",
  },
  {
    text: "Hover a card and the game plays itself for a second.",
    action: null,
    label: null,
  },
];

const KEY = "wowgames.mascot.dismissed";

/**
 * Bitz, the arcade keeper. Appears once, quietly, with one useful tip at a
 * time. Dismissing is remembered; it never blocks a click and never appears
 * while a game is running.
 */
export function Mascot({
  onSearch,
  onRoulette,
}: {
  onSearch: () => void;
  onRoulette: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [tip, setTip] = useState(0);
  const motion = useMotionEnabled();

  useEffect(() => {
    let gone = false;
    try {
      gone = window.localStorage.getItem(KEY) === "1";
    } catch {
      gone = false;
    }
    setDismissed(gone);
    if (gone) return;
    const id = window.setTimeout(() => setVisible(true), 11000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 14000);
    return () => window.clearInterval(id);
  }, [visible]);

  const close = (forever: boolean) => {
    setVisible(false);
    if (forever) {
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* storage unavailable — session-only dismissal */
      }
      setDismissed(true);
    }
    audio.sfx("click");
  };

  if (dismissed || !visible) return null;
  const current = TIPS[tip];

  return (
    <div className="pointer-events-none fixed bottom-20 left-3 z-[70] sm:bottom-5 sm:left-5">
      <div className="pointer-events-auto flex max-w-[19rem] items-start gap-2.5 rounded-2xl border border-white/12 bg-[#070b16]/95 p-2.5 pr-3 shadow-[0_24px_60px_-24px_#000] backdrop-blur animate-[rise_0.4s_ease-out_both]">
        <span
          className={cnMascot(motion)}
          aria-hidden
          style={{ background: "linear-gradient(150deg,#2ee6ff,#8b5cf6 60%,#ff3fd8)" }}
        >
          <span className="mascot-eye" />
          <span className="mascot-eye" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[7.5px] uppercase tracking-[0.2em] text-arc-cyan">Bitz · arcade keeper</p>
          <p className="mt-1 text-[11.5px] leading-snug text-white/70">{current.text}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {current.action === "search" ? (
              <button
                type="button"
                onClick={() => {
                  onSearch();
                  close(false);
                }}
                className="font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-arc-cyan hover:text-white"
              >
                {current.label} →
              </button>
            ) : null}
            {current.action === "roulette" ? (
              <button
                type="button"
                onClick={() => {
                  onRoulette();
                  close(false);
                }}
                className="font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-arc-cyan hover:text-white"
              >
                {current.label} →
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => close(true)}
              className="ml-auto font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30 hover:text-white"
            >
              Got it
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => close(false)}
          aria-label="Hide tip"
          className="text-white/25 transition hover:text-white"
        >
          <Icon name="close" size={13} />
        </button>
      </div>
    </div>
  );
}

function cnMascot(motion: boolean) {
  return `relative flex h-9 w-9 shrink-0 items-center justify-center gap-1 overflow-hidden rounded-xl border border-white/20 ${
    motion ? "animate-[floaty_5s_ease-in-out_infinite]" : ""
  }`;
}
