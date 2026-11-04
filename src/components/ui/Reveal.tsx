"use client";

import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect, useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal. Arms itself before paint, reveals once, then disconnects the
 * observer. With motion disabled it simply renders visible content.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const motion = useMotionEnabled();
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!motion) {
      setArmed(false);
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      // already on screen — never hide it in the first place
      setShown(true);
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motion]);

  useEffect(() => {
    if (!motion) setShown(true);
  }, [motion]);

  return (
    <div
      ref={ref}
      className={cn(armed && !shown && "reveal--armed", shown && "reveal--in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
