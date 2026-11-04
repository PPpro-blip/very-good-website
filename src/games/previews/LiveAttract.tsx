"use client";

import { useEffect, useRef } from "react";
import { GeometryRushEngine } from "@/games/geometry-rush/engine";
import { FlappyEngine } from "@/games/flappy-chaos/engine";
import { popAudioSilence, pushAudioSilence } from "@/lib/audio";

/**
 * Live gameplay preview.
 *
 * For original builds we do not fake footage: the *real* engine runs in attract
 * mode on a small canvas — the same physics, art and level data as the game.
 * Audio is muted through a silence scope, and the loop is destroyed on unmount,
 * so nothing runs once the pointer leaves the card.
 */
export function LiveAttract({ slug }: { slug: "geometry-rush" | "flappy-chaos" }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    pushAudioSilence();
    let engine: { destroy: () => void } | null = null;

    try {
      if (slug === "geometry-rush") {
        const gr = new GeometryRushEngine({
          canvas,
          onHud: () => {},
          onComplete: () => {},
          attract: true,
        });
        gr.setLevel(0);
        gr.begin();
        engine = gr;
      } else {
        const fc = new FlappyEngine({
          canvas,
          initialBest: 0,
          initialTheme: "neon",
          onHud: () => {},
          onGameOver: () => {},
          attract: true,
        });
        fc.restart();
        engine = fc;
      }
    } catch {
      // A preview must never break the card it lives in.
      engine = null;
    }

    return () => {
      try {
        engine?.destroy();
      } finally {
        popAudioSilence();
      }
    };
  }, [slug]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      tabIndex={-1}
    />
  );
}
