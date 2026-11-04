"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { audio } from "@/lib/audio";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/", label: "Home", icon: "home", exact: true },
  { href: "/games", label: "Library", icon: "grid" },
  { href: "/custom", label: "Original", icon: "spark" },
  { href: "/study", label: "Study", icon: "book" },
];

/** App-style bottom navigation for phones. Hidden while playing. */
export function MobileDock() {
  const pathname = usePathname() || "/";
  const { openProfile } = useArcade();
  if (pathname.startsWith("/play")) return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#04060f]/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-1.5">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => audio.sfx("click")}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition",
                  active ? "text-arc-cyan" : "text-white/50 active:text-white",
                )}
              >
                <span
                  className={cn(
                    "relative grid h-8 w-10 place-items-center rounded-xl transition",
                    active && "bg-arc-cyan/12",
                  )}
                >
                  <Icon name={item.icon} size={18} />
                  {active ? (
                    <span className="absolute -bottom-1 h-[3px] w-4 rounded-full bg-arc-cyan" />
                  ) : null}
                </span>
                <span className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.1em]">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openProfile}
            className="flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-white/50 transition active:text-white"
          >
            <span className="grid h-8 w-10 place-items-center rounded-xl">
              <Icon name="user" size={18} />
            </span>
            <span className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.1em]">
              You
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
