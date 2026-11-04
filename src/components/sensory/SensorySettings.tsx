"use client";

import { Icon } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { audio } from "@/lib/audio";
import { store, useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Comfort controls for the Sensory room — real switches, real state. */
export function SensorySettings() {
  const { muted, ambient, motion } = useWowStore();
  const { toast } = useArcade();

  const rows = [
    {
      label: "Interface sound",
      hint: "Synthesised clicks and chimes across the arcade.",
      checked: !muted,
      onChange: (next: boolean) => {
        store.setMuted(!next);
        if (next) {
          audio.unlock();
          audio.sfx("chime");
        }
      },
      icon: "sound" as const,
    },
    {
      label: "Ambient hum",
      hint: "A slow synth pad under the whole site. Off by default.",
      checked: ambient,
      onChange: (next: boolean) => {
        store.setAmbient(next);
        if (next) {
          audio.unlock();
          audio.sfx("chime");
        }
      },
      icon: "music" as const,
    },
    {
      label: "Motion & particles",
      hint: "Turn off for a still, high-comfort arcade.",
      checked: motion,
      onChange: (next: boolean) => {
        store.setMotion(next);
        toast(next ? "Motion on" : "Still mode", next ? "Particles restored" : "Background effects paused");
      },
      icon: "wave" as const,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: "#c4b5fd" }}>
            Comfort settings
          </p>
          <p className="mt-1 text-[12px] text-white/45">
            Everything here is stored locally and applies instantly.
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-arc-violet/30 bg-arc-violet/10 text-arc-violet">
          <Icon name="sliders" size={17} />
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#080c19]/70 px-3.5 py-3"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Icon name={row.icon} size={15} className="shrink-0 text-white/45" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">{row.label}</p>
                <p className="text-[11px] leading-snug text-white/40">{row.hint}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={row.checked}
              aria-label={row.label}
              onClick={() => row.onChange(!row.checked)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300",
                row.checked ? "border-arc-cyan/50 bg-arc-cyan/25" : "border-white/15 bg-white/[0.06]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 ease-spring",
                  row.checked
                    ? "left-6 bg-gradient-to-br from-white to-arc-cyan shadow-[0_0_14px_rgba(46,230,255,0.8)]"
                    : "left-0.5 bg-white/60",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
