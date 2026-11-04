"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * RouteProgress — the thin neon bar that runs along the top of the shell on
 * every internal navigation.
 *
 * It is driven by real events, not decoration: the bar starts when you click an
 * internal link and finishes when the new route's pathname actually lands, so on
 * a slow connection it stays visible for as long as the page is genuinely
 * loading. If a navigation is instant (prefetched static export) it still flashes
 * for one beat, which is what makes route changes feel deliberate rather than
 * abrupt.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const firstRender = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // start on internal link clicks
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const current = window.location.pathname;
      const next = href.split("?")[0].split("#")[0];
      if (!next || next === current) return;
      setDone(false);
      setVisible(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // finish when the route lands
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setDone(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setDone(false);
    }, 340);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 220ms ease" }}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-arc-cyan via-arc-violet to-arc-magenta"
        style={{
          transform: `scaleX(${done ? 1 : visible ? 0.7 : 0})`,
          transition: done ? "transform 220ms ease-out" : "transform 2.4s cubic-bezier(0.2,0.8,0.2,1)",
          boxShadow: "0 0 12px rgba(46,230,255,0.7)",
        }}
      />
    </div>
  );
}
