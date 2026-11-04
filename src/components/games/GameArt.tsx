import type { Game, MotifId } from "@/data/games";
import { hashString, mulberry32 } from "@/lib/utils";

/**
 * GameArt — procedural poster art.
 *
 * Every cabinet gets bespoke vector artwork generated from its palette + motif.
 * No stock photography, no copyrighted game art, no image downloads: the whole
 * arcade's visual identity ships as ~10kB of deterministic SVG. Seeded PRNG keeps
 * server and client markup identical (no hydration mismatch).
 */

interface GameArtProps {
  game: Pick<Game, "slug" | "motif" | "palette" | "title" | "kind">;
  /** subtle label burnt into the art (used on the player / hero) */
  label?: string;
  className?: string;
}

const W = 480;
const H = 360;

function Stars({ seed, color, count = 28 }: { seed: number; color: string; count?: number }) {
  const rand = mulberry32(seed);
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand() * W;
        const y = rand() * H * 0.92;
        const r = 0.5 + rand() * 1.5;
        const o = 0.16 + rand() * 0.5;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o} />;
      })}
    </g>
  );
}

function FloorGrid({ color, y = 262 }: { color: string; y?: number }) {
  return (
    <g stroke={color} fill="none" opacity={0.3}>
      <path d={`M0 ${y} H${W}`} strokeWidth={1.4} />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = (i / 8) * W;
        return (
          <path
            key={i}
            d={`M${W / 2 + (x - W / 2) * 0.14} ${y} L${x} ${H}`}
            strokeWidth={0.9}
            opacity={0.55}
          />
        );
      })}
      {[0.14, 0.3, 0.5, 0.74].map((t, i) => (
        <path key={i} d={`M0 ${y + (H - y) * t} H${W}`} strokeWidth={0.7} opacity={0.4} />
      ))}
    </g>
  );
}

function Lanterns({ c1, c2, seed }: { c1: string; c2: string; seed: number }) {
  const rand = mulberry32(seed + 7);
  return (
    <g>
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 40 + rand() * 400;
        const y = 30 + rand() * 140;
        const r = 1.6 + rand() * 2.4;
        return (
          <g key={i} opacity={0.75}>
            <circle cx={x} cy={y} r={r * 4} fill={i % 2 ? c1 : c2} opacity={0.09} />
            <circle cx={x} cy={y} r={r} fill={i % 2 ? c1 : c2} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
}

function Motif({ id, c1, c2, seed }: { id: MotifId; c1: string; c2: string; seed: number }) {
  switch (id) {
    case "arena":
      return (
        <g>
          <g className="animate-spin-slow" style={{ transformOrigin: "240px 180px" }}>
            <circle
              cx="240"
              cy="180"
              r="126"
              fill="none"
              stroke={c1}
              strokeWidth="1.1"
              strokeDasharray="7 12"
              opacity="0.55"
            />
            <circle
              cx="240"
              cy="180"
              r="150"
              fill="none"
              stroke={c2}
              strokeWidth="0.8"
              strokeDasharray="2 16"
              opacity="0.4"
            />
          </g>
          <circle cx="240" cy="180" r="98" fill="none" stroke={c1} strokeWidth="2" opacity="0.5" />
          <circle cx="240" cy="180" r="82" fill="none" stroke={c2} strokeWidth="1" opacity="0.35" />
          <g opacity="0.9">
            <path d="M162 246 L318 114" stroke={c1} strokeWidth="9" strokeLinecap="round" />
            <path d="M318 246 L162 114" stroke={c2} strokeWidth="9" strokeLinecap="round" />
            <path d="M162 246 L318 114" stroke="#fff" strokeWidth="2" opacity="0.55" strokeLinecap="round" />
            <path d="M318 246 L162 114" stroke="#fff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
            <path d="M157 250 l-16 8 8-16z" fill={c1} />
            <path d="M323 250 l16 8 -8-16z" fill={c2} />
          </g>
          <rect
            x="228"
            y="168"
            width="24"
            height="24"
            rx="4"
            transform="rotate(45 240 180)"
            fill="#fff"
            opacity="0.92"
          />
          <circle cx="240" cy="180" r="46" fill="#fff" opacity="0.06" />
        </g>
      );

    case "clock":
      return (
        <g>
          <circle cx="240" cy="176" r="104" fill="none" stroke={c1} strokeWidth="2.4" opacity="0.8" />
          <circle cx="240" cy="176" r="88" fill="none" stroke={c2} strokeWidth="1" opacity="0.35" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const inner = i % 3 === 0 ? 76 : 84;
            return (
              <line
                key={i}
                x1={240 + Math.cos(a) * inner}
                y1={176 + Math.sin(a) * inner}
                x2={240 + Math.cos(a) * 88}
                y2={176 + Math.sin(a) * 88}
                stroke={i % 3 === 0 ? c1 : c2}
                strokeWidth={i % 3 === 0 ? 2.4 : 1}
                opacity={0.7}
              />
            );
          })}
          <path
            d="M240 176 L240 112"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path d="M240 176 L288 196" stroke={c1} strokeWidth="3" strokeLinecap="round" />
          <circle cx="240" cy="176" r="6" fill="#fff" />
          <circle cx="240" cy="176" r="16" fill={c1} opacity="0.18" />
          <path
            d="M330 122 a58 58 0 0 1 12 44"
            stroke={c2}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M150 230 a58 58 0 0 1 -8 -32"
            stroke={c1}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          <g transform="translate(348 244)" opacity="0.8">
            <circle r="13" fill="none" stroke={c2} strokeWidth="4" />
            <circle r="4" fill={c2} />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 13}
                  y1={Math.sin(a) * 13}
                  x2={Math.cos(a) * 18}
                  y2={Math.sin(a) * 18}
                  stroke={c2}
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </g>
      );

    case "bomb":
      return (
        <g>
          <circle cx="228" cy="204" r="88" fill="#0a0710" stroke={c1} strokeWidth="2.6" />
          <circle cx="228" cy="204" r="88" fill="none" stroke={c2} strokeWidth="1" opacity="0.5" />
          <ellipse cx="200" cy="170" rx="26" ry="17" fill="#fff" opacity="0.12" transform="rotate(-28 200 170)" />
          <path
            d="M282 146 q28 -30 6 -52 q-16 -16 8 -34"
            fill="none"
            stroke={c2}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g transform="translate(298 54)">
            <circle r="20" fill={c1} opacity="0.15" />
            <circle r="10" fill={c1} opacity="0.4" />
            <path d="M0 -17 V-9 M0 9 V17 M-17 0 H-9 M9 0 H17" stroke={c1} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M0 -17 V-9 M0 9 V17" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          </g>
          <g opacity="0.75">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${228 - 56 + i * 28} 268 l14 -18`}
                stroke={i % 2 ? c1 : c2}
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
          </g>
          <circle cx="228" cy="204" r="112" fill="none" stroke={c2} strokeWidth="1" strokeDasharray="4 14" opacity="0.4" />
          <path d="M96 300 H360" stroke={c1} strokeWidth="1.4" opacity="0.3" />
        </g>
      );

    case "stairs":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 108 + i * 56;
            const y = 268 - i * 40;
            return (
              <g key={i}>
                <rect x={x} y={y} width="58" height="42" fill={`rgba(10,12,26,0.92)`} stroke={c1} strokeWidth="1.6" />
                <path d={`M${x} ${y} l18 -14 h58 l-18 14 z`} fill={c2} opacity="0.32" />
                <path d={`M${x + 58} ${y} l18 -14 v42 l-18 14 z`} fill={c2} opacity="0.16" />
                <rect x={x + 10} y={y + 10} width="18" height="3" fill={c1} opacity="0.5" />
              </g>
            );
          })}
          <g transform="translate(388 96)" opacity="0.9">
            <path d="M-22 30 L0 -6 L22 30 Z" fill={c2} opacity="0.9" />
            <path d="M-13 6 l-8 -12 6 -5 7 11z" fill={c2} opacity="0.75" />
            <path d="M13 6 l8 -12 -6 -5 -7 11z" fill={c2} opacity="0.75" />
            <circle cx="-7" cy="16" r="2.6" fill="#0a0c1a" />
            <circle cx="7" cy="16" r="2.6" fill="#0a0c1a" />
            <path d="M-6 24 q6 4 12 0" stroke="#0a0c1a" strokeWidth="2" fill="none" />
          </g>
          <circle cx="176" cy="150" r="13" fill={c1} opacity="0.85" />
          <circle cx="176" cy="150" r="21" fill={c1} opacity="0.14" />
          <circle cx="232" cy="104" r="10" fill={c2} opacity="0.9" />
          <circle cx="232" cy="104" r="17" fill={c2} opacity="0.14" />
          <path d="M80 310 H400" stroke={c1} strokeWidth="1" opacity="0.25" strokeDasharray="6 10" />
        </g>
      );

    case "eyes":
      return (
        <g>
          <circle cx="370" cy="86" r="34" fill={c1} opacity="0.14" />
          <circle cx="370" cy="86" r="22" fill="#f8fbff" opacity="0.9" />
          <path d="M60 300 q30 -90 70 -90 q40 0 52 64 q16 -74 62 -74 q48 0 56 100z" fill="#07131a" stroke={c2} strokeWidth="1.6" />
          <path d="M232 300 q24 -66 52 -66 q30 0 44 66z" fill="#081a20" stroke={c1} strokeWidth="1.4" />
          {[
            { x: 150, y: 236, c: c1 },
            { x: 316, y: 262, c: c2 },
          ].map((e, i) => (
            <g key={i}>
              <ellipse cx={e.x} cy={e.y} rx="23" ry="16" fill="#f6fbff" />
              <circle cx={e.x + (i ? -5 : 6)} cy={e.y} r="8" fill="#0a1424" />
              <circle cx={e.x + (i ? -8 : 3)} cy={e.y - 3} r="2.6" fill="#fff" />
              <ellipse cx={e.x} cy={e.y} rx="30" ry="22" fill={e.c} opacity="0.14" />
            </g>
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const rand = mulberry32(seed + i * 13);
            const x = 90 + rand() * 320;
            return (
              <path
                key={i}
                d={`M${x} 300 q4 -26 -2 -40`}
                stroke={i % 2 ? c1 : c2}
                strokeWidth="2"
                fill="none"
                opacity="0.55"
              />
            );
          })}
          <g opacity="0.5">
            <circle cx="96" cy="120" r="3" fill="#fff" />
            <circle cx="120" cy="152" r="2" fill="#fff" />
            <circle cx="72" cy="168" r="2.4" fill="#fff" />
          </g>
        </g>
      );

    case "glitch":
      return (
        <g>
          <text
            x="240"
            y="214"
            textAnchor="middle"
            fontFamily="Orbitron, sans-serif"
            fontSize="128"
            fontWeight="900"
            fill={c1}
            opacity="0.28"
            letterSpacing="4"
          >
            404
          </text>
          <text
            x="234"
            y="208"
            textAnchor="middle"
            fontFamily="Orbitron, sans-serif"
            fontSize="128"
            fontWeight="900"
            fill={c2}
            opacity="0.35"
            letterSpacing="4"
          >
            404
          </text>
          <text
            x="240"
            y="204"
            textAnchor="middle"
            fontFamily="Orbitron, sans-serif"
            fontSize="128"
            fontWeight="900"
            fill="#f4f7ff"
            letterSpacing="4"
          >
            404
          </text>
          {[120, 150, 186, 220, 246, 268].map((y, i) => (
            <rect
              key={y}
              x={i % 2 ? 60 : 180}
              y={y}
              width={i % 2 ? 220 : 260}
              height={i % 2 ? 5 : 3}
              fill={i % 2 ? c1 : c2}
              opacity={0.35 + (i % 3) * 0.15}
            />
          ))}
          <rect x="112" y="228" width="118" height="16" fill={c2} opacity="0.24" />
          <rect x="248" y="142" width="96" height="10" fill={c1} opacity="0.18" />
          <g opacity="0.5" stroke={c1} strokeWidth="1.2">
            <path d="M30 40 H140" />
            <path d="M340 320 H450" />
            <path d="M30 320 H96" />
          </g>
          <circle cx="240" cy="204" r="150" fill={c1} opacity="0.05" />
        </g>
      );

    case "pet":
      return (
        <g>
          <ellipse cx="240" cy="330" rx="120" ry="16" fill={c1} opacity="0.14" />
          <g>
            <path d="M188 176 l-16 -58 54 24z" fill={c1} opacity="0.85" />
            <path d="M292 176 l16 -58 -54 24z" fill={c2} opacity="0.85" />
            <path
              d="M240 128 c58 0 84 40 84 84 c0 52 -38 78 -84 78 s-84 -26 -84 -78 c0 -44 26 -84 84 -84z"
              fill="#0b1220"
              stroke={c1}
              strokeWidth="2.4"
            />
            <ellipse cx="216" cy="204" rx="13" ry="16" fill="#eaf7ff" />
            <ellipse cx="264" cy="204" rx="13" ry="16" fill="#eaf7ff" />
            <circle cx="218" cy="208" r="6.4" fill="#08111f" />
            <circle cx="262" cy="208" r="6.4" fill="#08111f" />
            <circle cx="220" cy="204" r="2.4" fill="#fff" />
            <circle cx="264" cy="204" r="2.4" fill="#fff" />
            <ellipse cx="198" cy="236" rx="12" ry="7" fill={c2} opacity="0.55" />
            <ellipse cx="282" cy="236" rx="12" ry="7" fill={c2} opacity="0.55" />
            <path d="M228 238 q12 14 24 0" stroke={c1} strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="206" cy="292" rx="16" ry="9" fill={c1} opacity="0.7" />
            <ellipse cx="274" cy="292" rx="16" ry="9" fill={c1} opacity="0.7" />
          </g>
          <g opacity="0.9">
            <path d="M356 148 c-14 0 -20 -10 -14 -20 c-10 -6 -6 -20 6 -20 c4 -10 20 -10 24 0 c12 0 16 14 6 20 c6 10 0 20 -12 20z" fill={c2} opacity="0.7" />
            <circle cx="120" cy="180" r="5" fill={c1} />
            <circle cx="352" cy="250" r="4" fill={c1} opacity="0.8" />
            <circle cx="132" cy="268" r="3" fill={c2} />
          </g>
          <circle cx="240" cy="212" r="150" fill="none" stroke={c1} strokeWidth="1" strokeDasharray="3 14" opacity="0.35" />
        </g>
      );

    case "runner":
      return (
        <g>
          <g opacity="0.85">
            <circle cx="240" cy="152" r="66" fill={c2} opacity="0.22" />
            <circle cx="240" cy="152" r="46" fill={c2} opacity="0.3" />
            <path d="M188 150 H292 M180 166 H300 M192 182 H288" stroke={c1} strokeWidth="5" strokeLinecap="round" opacity="0.75" />
          </g>
          <FloorGrid color={c2} y={286} />
          <g>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${286 + i * 26} 250 l18 34 h-36z`}
                fill="none"
                stroke={c1}
                strokeWidth="2.2"
              />
            ))}
            <path d="M286 250 l18 34 h-36z" fill={c1} opacity="0.25" />
          </g>
          <g transform="translate(190 214)">
            <path d="M0 34 L34 0 L34 34 Z" fill={c1} opacity="0.18" />
            <path d="M10 34 L34 10 L34 34 Z" fill={c2} opacity="0.22" />
            <path d="M0 34 L24 0 L48 34 Z" fill="#0b1020" stroke={c1} strokeWidth="3" />
            <path d="M24 8 L38 30 L12 30 Z" fill={c1} opacity="0.65" />
            <circle cx="24" cy="34" r="4" fill="#fff" />
          </g>
          <g opacity="0.6">
            <path d="M84 232 H150" stroke={c1} strokeWidth="3" strokeLinecap="round" />
            <path d="M62 250 H120" stroke={c1} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M96 210 H134" stroke={c2} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </g>
          <g>
            <rect x="352" y="164" width="46" height="46" rx="6" fill="#0a0f1e" stroke={c2} strokeWidth="2" />
            <rect x="362" y="174" width="26" height="3" fill={c2} opacity="0.7" />
            <rect x="362" y="182" width="16" height="3" fill={c2} opacity="0.4" />
          </g>
        </g>
      );

    case "wing":
      return (
        <g>
          <Lanterns c1={c1} c2={c2} seed={seed} />
          {[0, 1, 2].map((i) => {
            const x = 96 + i * 130;
            const gapY = 150 + (i % 2 === 0 ? -18 : 22);
            return (
              <g key={i} opacity={0.95}>
                <rect x={x} y={44} width="40" height={gapY - 44} rx="8" fill="#0b1020" stroke={c1} strokeWidth="2" opacity="0.9" />
                <rect x={x} y={gapY + 106} width="40" height={H - gapY - 106} rx="8" fill="#0b1020" stroke={c1} strokeWidth="2" opacity="0.9" />
                <rect x={x + 8} y={50} width="6" height={Math.max(0, gapY - 58)} fill={c1} opacity="0.25" />
                <rect x={x - 6} y={gapY - 10} width="52" height="14" rx="5" fill={c2} opacity="0.75" />
                <rect x={x - 6} y={gapY + 100} width="52" height="14" rx="5" fill={c2} opacity="0.75" />
              </g>
            );
          })}
          <g transform="translate(232 178) rotate(-12)">
            <ellipse cx="-22" cy="4" rx="26" ry="13" fill={c1} opacity="0.75" transform="rotate(-18 -22 4)" />
            <ellipse cx="34" cy="4" rx="26" ry="13" fill={c2} opacity="0.75" transform="rotate(18 34 4)" />
            <circle cx="6" cy="0" r="24" fill="#0b1020" stroke="#fff" strokeWidth="2.4" />
            <circle cx="16" cy="-4" r="7" fill="#f7fbff" />
            <circle cx="18" cy="-4" r="3.4" fill="#07101f" />
            <path d="M26 6 l14 4 -14 5z" fill={c1} />
            <circle cx="6" cy="0" r="30" fill="#fff" opacity="0.06" />
          </g>
          <g opacity="0.5">
            <ellipse cx="92" cy="70" rx="34" ry="13" fill="#fff" opacity="0.16" />
            <ellipse cx="120" cy="58" rx="22" ry="10" fill="#fff" opacity="0.13" />
            <ellipse cx="392" cy="96" rx="30" ry="12" fill="#fff" opacity="0.1" />
          </g>
          <path d="M120 320 q60 -22 120 0 q60 22 120 0" stroke={c1} strokeWidth="1.4" fill="none" opacity="0.35" />
        </g>
      );

    case "brain":
      return (
        <g>
          <g transform="translate(240 178)">
            <path
              d="M-72 -22 a34 34 0 0 1 18 -44 a34 34 0 0 1 54 -6 a34 34 0 0 1 54 6 a34 34 0 0 1 18 44 a40 40 0 0 1 -10 62 a34 34 0 0 1 -62 16 a34 34 0 0 1 -62 -16 a40 40 0 0 1 -10 -62z"
              fill="#0b0f1e"
              stroke={c1}
              strokeWidth="2.6"
            />
            <path
              d="M-40 -44 q22 18 4 34 q-18 16 2 32 q16 14 -2 34"
              stroke={c2}
              strokeWidth="2"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M28 -48 q-20 20 -2 36 q18 16 -2 30 q-14 12 4 34"
              stroke={c2}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path d="M-14 -66 v40 M-14 -12 v46" stroke={c1} strokeWidth="1.6" opacity="0.5" strokeDasharray="3 6" />
            {[
              [-40, -44],
              [4, -30],
              [-36, 22],
              [30, -12],
              [26, 52],
              [-14, 34],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4.4" fill={i % 2 ? c1 : c2} />
            ))}
            <circle cx="0" cy="0" r="86" fill="none" stroke={c1} strokeWidth="1" strokeDasharray="2 12" opacity="0.5" />
          </g>
          <g transform="translate(392 92)">
            <circle r="18" fill={c1} opacity="0.2" />
            <path d="M-6 -10 a9 9 0 1 1 12 0 q-4 3 -4 8" stroke={c1} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <circle cy="7" r="2.6" fill={c1} />
          </g>
          <g transform="translate(88 108)" opacity="0.75">
            <path d="M0 0 L26 26 L56 12" stroke={c2} strokeWidth="1.6" fill="none" />
            <circle r="4" fill={c2} />
            <circle cx="26" cy="26" r="3.4" fill={c2} opacity="0.8" />
            <circle cx="56" cy="12" r="3" fill={c2} opacity="0.6" />
          </g>
        </g>
      );

    case "aurora":
      return (
        <g>
          <circle cx="368" cy="86" r="30" fill="#f4f8ff" opacity="0.9" />
          <circle cx="368" cy="86" r="46" fill="#f4f8ff" opacity="0.08" />
          {[
            { d: "M-20 300 C 80 180, 150 300, 250 170 S 420 210, 500 90", c: c1, w: 36, o: 0.2 },
            { d: "M-20 250 C 90 150, 170 260, 270 140 S 430 170, 500 110", c: c2, w: 26, o: 0.18 },
            { d: "M-20 340 C 60 260, 180 340, 250 220 S 420 250, 500 170", c: c1, w: 18, o: 0.14 },
            { d: "M-20 210 C 100 130, 190 210, 260 120 S 420 140, 500 70", c: "#ffffff", w: 6, o: 0.2 },
          ].map((ribbon, i) => (
            <path
              key={i}
              d={ribbon.d}
              stroke={ribbon.c}
              strokeWidth={ribbon.w}
              strokeLinecap="round"
              fill="none"
              opacity={ribbon.o}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={["M-20 300 C 80 180, 150 300, 250 170 S 420 210, 500 90", "M-20 250 C 90 150, 170 260, 270 140 S 430 170, 500 110", "M-20 340 C 60 260, 180 340, 250 220 S 420 250, 500 170"][i]}
              stroke={i === 1 ? c2 : c1}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          ))}
          <Stars seed={seed + 21} color="#dbe9ff" count={34} />
          <g opacity="0.8">
            {[
              [110, 120],
              [186, 84],
              [300, 112],
              [404, 168],
              [150, 196],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#fff" opacity={0.5 + (i % 3) * 0.14} />
            ))}
          </g>
        </g>
      );
  }
}

export function GameArt({ game, label, className }: GameArtProps) {
  const seed = hashString(game.slug);
  const c1 = game.palette.from;
  const c2 = game.palette.to;
  const gid = `art-${game.slug}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      width="100%"
      height="100%"
      role="img"
      aria-label={`${game.title} artwork`}
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#080b1a" />
          <stop offset="46%" stopColor="#0a1024" />
          <stop offset="100%" stopColor="#04050d" />
        </linearGradient>
        <radialGradient id={`${gid}-glow1`} cx="24%" cy="12%" r="76%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-glow2`} cx="84%" cy="88%" r="70%">
          <stop offset="0%" stopColor={c2} stopOpacity="0.45" />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-beam`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.18" />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#03040b" stopOpacity="0" />
          <stop offset="100%" stopColor="#03040b" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${gid}-bg)`} />
      <rect width={W} height={H} fill={`url(#${gid}-glow1)`} />
      <rect width={W} height={H} fill={`url(#${gid}-glow2)`} />

      {/* diagonal light beams */}
      <g opacity="0.7">
        <path d="M-40 380 L210 -40 L268 -40 L18 380Z" fill={`url(#${gid}-beam)`} />
        <path d="M120 380 L370 -40 L396 -40 L146 380Z" fill={`url(#${gid}-beam)`} opacity="0.5" />
      </g>

      <Stars seed={seed} color={c1} count={26} />
      <Motif id={game.motif} c1={c1} c2={c2} seed={seed} />

      <rect y={H * 0.55} width={W} height={H * 0.45} fill={`url(#${gid}-fade)`} opacity="0.65" />
      <rect width={W} height={H} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

      {label ? (
        <g>
          <text
            x="24"
            y={H - 24}
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            letterSpacing="4"
            fill="#dbe4ff"
            opacity="0.72"
          >
            {label.toUpperCase()}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
