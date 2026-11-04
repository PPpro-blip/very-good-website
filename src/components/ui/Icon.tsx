import type { SVGProps } from "react";

/** Hand-drawn icon set — no icon dependency, consistent 1.6px stroke. */

export type IconName =
  | "home"
  | "grid"
  | "layers"
  | "spark"
  | "book"
  | "user"
  | "search"
  | "dice"
  | "sound"
  | "muted"
  | "play"
  | "arrowRight"
  | "arrowLeft"
  | "arrowUpRight"
  | "star"
  | "heart"
  | "expand"
  | "minimize"
  | "rotate"
  | "close"
  | "menu"
  | "trophy"
  | "clock"
  | "check"
  | "keyboard"
  | "external"
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "bolt"
  | "brain"
  | "eye"
  | "music"
  | "sliders"
  | "flame"
  | "target"
  | "gamepad"
  | "wave"
  | "pause"
  | "info";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.8 12 3.4l9 7.4V20a1 1 0 0 1-1 1h-5v-6.2H9V21H4a1 1 0 0 1-1-1z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7.2" height="7.2" rx="1.8" />
      <rect x="13.8" y="3" width="7.2" height="7.2" rx="1.8" />
      <rect x="3" y="13.8" width="7.2" height="7.2" rx="1.8" />
      <rect x="13.8" y="13.8" width="7.2" height="7.2" rx="1.8" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 12.5 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  spark: (
    <path d="M12 2.6c.9 5.2 3.4 7.7 8.5 8.6-5.1.9-7.6 3.4-8.5 8.6-.9-5.2-3.4-7.7-8.5-8.6 5.1-.9 7.6-3.4 8.5-8.6Z" />
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7.2 8-7.2s8 2.8 8 7.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  dice: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.2" />
      <circle cx="8.4" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="8.4" cy="15.6" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="15.6" r="1.35" fill="currentColor" stroke="none" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.4h3.4L13 5v14l-5.6-4.4H4z" />
      <path d="M16.4 8.6a5 5 0 0 1 0 6.8" />
      <path d="M19 6a8.6 8.6 0 0 1 0 12" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9.4h3.4L13 5v14l-5.6-4.4H4z" />
      <path d="m16.5 9.5 5 5" />
      <path d="m21.5 9.5-5 5" />
    </>
  ),
  play: <path d="M7.4 4.6 19.8 12 7.4 19.4z" fill="currentColor" strokeLinejoin="round" />,
  pause: (
    <>
      <rect x="7" y="4.5" width="3.6" height="15" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.4" y="4.5" width="3.6" height="15" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8.4 7H17v8.6" />
    </>
  ),
  star: (
    <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z" />
  ),
  heart: (
    <path d="M12 20.3s-7.6-4.5-7.6-9.6a4.4 4.4 0 0 1 7.6-3 4.4 4.4 0 0 1 7.6 3c0 5.1-7.6 9.6-7.6 9.6Z" />
  ),
  expand: (
    <>
      <path d="M9 3.6H3.6V9" />
      <path d="M15 3.6h5.4V9" />
      <path d="M15 20.4h5.4V15" />
      <path d="M9 20.4H3.6V15" />
    </>
  ),
  minimize: (
    <>
      <path d="M3.6 9H9V3.6" />
      <path d="M20.4 9H15V3.6" />
      <path d="M20.4 15H15v5.4" />
      <path d="M3.6 15H9v5.4" />
    </>
  ),
  rotate: (
    <>
      <path d="M20.4 12a8.4 8.4 0 1 1-2.5-6" />
      <path d="M20.8 3.6v5h-5" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.5 5" />
      <path d="M16 5.5h2.5a2.5 2.5 0 0 1-2.5 5" />
      <path d="M12 13v4" />
      <path d="M8.5 21h7" />
      <path d="M9.5 17h5l1 4h-7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.4 2" />
    </>
  ),
  check: <path d="m4.8 12.6 4.6 4.6L19.4 6.6" />,
  keyboard: (
    <>
      <rect x="2.4" y="6" width="19.2" height="12" rx="2.6" />
      <path d="M6.4 10h.01M10 10h.01M13.6 10h.01M17.2 10h.01M8 14h8" />
    </>
  ),
  external: (
    <>
      <path d="M14 3.6h6.4V10" />
      <path d="M20.4 3.6 11 13" />
      <path d="M18 14v5.4a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10" />
    </>
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  bolt: <path d="M13.4 2.4 4.6 13.6h5.8l-1 8 9-11.4h-5.9z" />,
  brain: (
    <>
      <path d="M9.5 4.2A3.2 3.2 0 0 0 6.3 7.4a3 3 0 0 0-1.6 5.3A3.1 3.1 0 0 0 6.6 18a3 3 0 0 0 5.4 1.5V5.6a3 3 0 0 0-2.5-1.4Z" />
      <path d="M14.5 4.2a3.2 3.2 0 0 1 3.2 3.2 3 3 0 0 1 1.6 5.3A3.1 3.1 0 0 1 17.4 18a3 3 0 0 1-5.4 1.5" />
      <path d="M9 9.4h2M13 13h2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.4l10-2v12" />
      <circle cx="6.4" cy="18" r="2.6" />
      <circle cx="16.4" cy="15.4" r="2.6" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3" />
      <path d="M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </>
  ),
  flame: (
    <path d="M12 2.6c3.4 4 5.6 6.2 5.6 9.6A5.6 5.6 0 0 1 12 18a5.6 5.6 0 0 1-5.6-5.8c0-1.6.6-3 2-4.6.6 1.4 1.4 2.2 2.4 2.4-.6-2.4-.2-4.4 1.2-7.4Z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.4 7h9.2a4.4 4.4 0 0 1 4.3 3.5l1 6a3 3 0 0 1-5.3 2.5L14.6 17H9.4l-2 2a3 3 0 0 1-5.3-2.5l1-6A4.4 4.4 0 0 1 7.4 7Z" />
      <path d="M7 11v3M5.5 12.5h3" />
      <circle cx="16" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.2" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  wave: <path d="M2.4 12c2-5 3.6-5 5.4 0s3.4 5 5.4 0 3.4-5 5.4 0 2.4 5 4 5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.4" />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.6, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
