"use client";

import { useRef, type ReactNode } from "react";
import { useMotionEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Magnetic wrapper: the element leans toward the cursor and springs back.
 * Pointer-only (never runs on touch), motion-only, and it only moves a few
 * pixels — enough to feel alive, never enough to miss a click.
 */
export function Magnetic({
  children,
  strength = 7,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const motion = useMotionEnabled();

  return (
    <span
      ref={ref}
      className={cn("inline-flex transition-transform duration-300 ease-out will-change-transform", className)}
      onPointerMove={(event) => {
        if (!motion || event.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}
