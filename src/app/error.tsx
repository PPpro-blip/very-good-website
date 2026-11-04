"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Route-level error boundary — a crash never leaves a blank screen. */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WOW GAMES] route error", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="chip mb-5 border-arc-pink/40 text-arc-pink">
        SYSTEM FAULT · {error.digest ?? "UNKNOWN"}
      </p>
      <h1 className="font-display text-3xl font-black uppercase tracking-[0.06em] text-white">
        The cabinet glitched
      </h1>
      <p className="mt-3 max-w-md text-sm text-white/55">
        Something went wrong while loading this screen. Your local progress is safe. Try again — or
        head back to the arcade floor.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Retry
        </button>
        <Link href="/" className="btn btn-ghost">
          Back to arcade
        </Link>
      </div>
    </div>
  );
}
