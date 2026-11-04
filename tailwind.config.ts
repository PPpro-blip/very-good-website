import type { Config } from "tailwindcss";

/**
 * WOW GAMES design tokens.
 * Colours are intentionally few and loud: an almost-black navy canvas,
 * then a neon spectrum used *strategically* per game / category.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#03040b",
          900: "#05060f",
          850: "#070a18",
          800: "#0b1022",
          750: "#10162c",
          700: "#151d38",
          600: "#1e2848",
        },
        arc: {
          cyan: "#2ee6ff",
          blue: "#4d7cff",
          violet: "#8b5cf6",
          magenta: "#ff3fd8",
          pink: "#ff5470",
          orange: "#ff8a3d",
          yellow: "#ffe066",
          green: "#4af2a1",
        },
      },
      fontFamily: {
        display: ["Orbitron", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "'Space Grotesk Variable'",
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono Variable'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        shell: "1340px",
      },
      borderRadius: {
        cabinet: "26px",
      },
      boxShadow: {
        lift: "0 30px 60px -25px rgba(0,0,0,0.9), 0 0 0 1px rgba(148,163,255,0.08) inset",
        glow: "0 0 40px -8px var(--glow, rgba(46,230,255,0.55))",
        inset: "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "cubic-bezier(0.5, 1.5, 0.5, 1)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(3%, -4%, 0) scale(1.06)" },
          "66%": { transform: "translate3d(-3%, 3%, 0) scale(0.98)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-160% 0" },
          "100%": { backgroundPosition: "260% 0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "70%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(320%)" },
        },
        breathe: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        spinSlow: {
          to: { transform: "rotate(360deg)" },
        },
        blink: {
          "0%,49%": { opacity: "1" },
          "50%,100%": { opacity: "0.15" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        drift: "drift 26s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        ticker: "ticker 38s linear infinite",
        rise: "rise 0.7s cubic-bezier(0.16,1,0.3,1) both",
        pop: "pop 0.4s cubic-bezier(0.5,1.5,0.5,1) both",
        scan: "scan 7s linear infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "spin-slow": "spinSlow 18s linear infinite",
        blink: "blink 1.1s steps(1,end) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
