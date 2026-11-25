import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { noise, point, slots, type StrandProps } from "../geometry";

type Palette = Record<string, string>;

// Each sprite character is one pixel. "." is transparent.
const LETTERS: Record<string, string[]> = {
  D: ["DD.", "D.D", "D.D", "D.D", "DD."],
  F: ["DDD", "D..", "DD.", "D..", "D.."],
  S: [".DD", "D..", ".D.", "..D", "DD."],
};

const FERRY = (() => {
  const width = 64;
  const height = 23;
  const g = Array.from({ length: height }, () => Array(width).fill("."));
  const lights: [number, number][] = [];
  const fill = (x0: number, x1: number, y: number, c: string) => {
    for (let x = x0; x <= x1; x++) g[y][x] = c;
  };

  // Funnel and DFDS emblem.
  const funnelLeft = (y: number) => 14 + Math.floor(y / 3);
  for (let y = 0; y <= 6; y++) {
    fill(funnelLeft(y), funnelLeft(y) + 8, y, y === 0 ? "K" : "N");
  }
  const EMBLEM = [".WWW.", "WWCWW", "WCCCW", "WWCWW", ".WWW."];
  EMBLEM.forEach((row, dy) => {
    [...row].forEach((c, dx) => {
      if (c !== ".") g[1 + dy][17 + dx] = c;
    });
  });

  // Bridge and mast.
  for (let y = 1; y <= 4; y++) g[y][41] = "M";
  fill(40, 42, 1, "M");
  fill(36, 44, 5, "E");
  for (let x = 36; x <= 44; x += 2) lights.push([x, 5]);
  fill(36, 44, 6, "b");
  g[6][36] = "E";
  g[6][44] = "E";

  // Superstructure and lifeboats.
  fill(8, 35, 7, "E");
  for (let x = 8; x <= 35; x += 2) lights.push([x, 7]);
  fill(36, 44, 7, "W");
  g[7][44] = "E";
  for (let y = 8; y <= 12; y++) {
    fill(8, 44, y, "W");
    g[y][8] = "E";
    g[y][44] = "E";
    if (y === 9 || y === 11) {
      for (let x = 10; x <= 42; x += 2) g[y][x] = "b";
    }
  }
  for (const x of [14, 22, 30]) fill(x, x + 3, 10, "o");

  // The first submerged row aligns with the border.
  const waterline = 20;
  for (let y = 13; y < height; y++) {
    const left = y < waterline ? 2 : 2 + (y - waterline + 1);
    const right = 61 - (y - 13);
    fill(left, right, y, y < waterline ? "N" : "A");
  }
  "DFDS".split("").forEach((letter, k) => {
    LETTERS[letter].forEach((row, dy) => {
      [...row].forEach((c, dx) => {
        if (c !== ".") g[15 + dy][36 + k * 4 + dx] = c;
      });
    });
  });

  // Foredeck tree with diagonal rows of lights.
  const cx = 52;
  const widths = [1, 1, 3, 3, 5, 5, 7, 7, 9, 9];
  widths.forEach((w, k) => {
    const y = 2 + k;
    const half = (w - 1) / 2;
    fill(cx - half, cx + half, y, k === 0 ? "y" : "g");
    if (k < 2) return;
    for (let x = cx - half; x <= cx + half; x++) {
      if ((((x - cx + k) % 3) + 3) % 3 === 0) lights.push([x, y]);
    }
  });
  g[12][cx] = "t";

  return {
    rows: g.map((r) => r.join("")),
    lights,
    waterline,
    funnelX: funnelLeft(0) + 4.5,
  };
})();

const LIGHT_COLOURS = [
  "#ff4d4d",
  "#ffd23f",
  "#4dabff",
  "#ffffff",
  "#ff7ad9",
  "#7dff7a",
];

const TREE = [
  "....y....",
  "...yyy...",
  "....g....",
  "...ggg...",
  "..ggrgg..",
  "...ggg...",
  "..ggggg..",
  ".gyggggr.",
  "ggggggggg",
  "....t....",
  "....t....",
];

const PRESENT = [
  "..y.y..",
  "...y...",
  "xxxyxxx",
  "xxxyxxx",
  "yyyyyyy",
  "xxxyxxx",
  "xxxyxxx",
];

const BAUBLE = ["..c..", ".xxx.", "xwxxx", "xxxxx", ".xxx."];

const STAR = ["..y..", ".yyy.", "yyyyy", ".yyy.", "..y.."];

// Ferry keys: N hull and funnel blue, K funnel cap, C cross, D hull
// lettering, A antifouling, W superstructure, E its edges, b windows,
// o lifeboats, M mast.
function palette(isDark: boolean): Palette {
  return isDark
    ? {
        N: "#3563b5",
        K: "#64748b",
        C: "#3563b5",
        D: "#ffffff",
        A: "#b91c1c",
        W: "#e2e8f0",
        E: "#94a3b8",
        b: "#fbbf24",
        o: "#fb923c",
        M: "#94a3b8",
        r: "#f87171",
        y: "#fbbf24",
        g: "#4ade80",
        t: "#a1887f",
        c: "#fbbf24",
        w: "#ffffff",
      }
    : {
        N: "#1d4189",
        K: "#1f2937",
        C: "#1d4189",
        D: "#ffffff",
        A: "#8f1d2c",
        W: "#ffffff",
        E: "#a9b6c3",
        b: "#24303f",
        o: "#f28c28",
        M: "#7b8794",
        r: "#c8102e",
        y: "#f2b632",
        g: "#2e7d32",
        t: "#6d4c41",
        c: "#d4a017",
        w: "#ffffff",
      };
}

function Pixels({
  rows,
  colours,
  px,
  from = 0,
  to = rows.length,
}: {
  rows: string[];
  colours: Palette;
  px: number;
  from?: number;
  to?: number;
}) {
  const rects: React.ReactNode[] = [];
  for (let y = from; y < to; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === c) end++;
      if (c !== ".") {
        rects.push(
          <rect
            key={`${y}-${x}`}
            x={x * px}
            y={y * px}
            width={(end - x) * px}
            height={px}
            fill={colours[c]}
          />,
        );
      }
      x = end;
    }
  }
  return <>{rects}</>;
}

function Sprite({
  rows,
  colours,
  px,
  style,
  className,
}: {
  rows: string[];
  colours: Palette;
  px: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={rows[0].length * px}
      height={rows.length * px}
      shapeRendering="crispEdges"
      className={className}
      style={{ position: "absolute", ...style }}
    >
      <Pixels rows={rows} colours={colours} px={px} />
    </svg>
  );
}

function Ferry({ length, colours }: { length: number; colours: Palette }) {
  const px = 2;
  const width = FERRY.rows[0].length * px;
  return (
    // Horizontal clipping prevents page overflow while leaving the hull and
    // smoke visible above and below the strand.
    <span className="absolute inset-x-0 top-0 h-0 overflow-x-clip">
      <span
        className="absolute left-0 animate-festive-sail"
        style={
          {
            top: -FERRY.waterline * px,
            "--festive-travel": `${length}px`,
            "--festive-start": `${-width}px`,
            // Keep the ferry at 30px per second at any strand length.
            animationDuration: `${(length + width) / 30}s`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="absolute h-[6px] w-[6px] bg-[#c9cfd5] dark:bg-[#94a3b8] animate-festive-smoke"
            style={{
              left: FERRY.funnelX * px - 3,
              top: -3,
              animationDelay: `${-i * 0.6}s`,
            }}
          />
        ))}
        <svg
          width={width}
          height={FERRY.rows.length * px}
          shapeRendering="crispEdges"
          className="block animate-festive-bob"
        >
          <Pixels
            rows={FERRY.rows}
            colours={colours}
            px={px}
            to={FERRY.waterline}
          />
          <g opacity={0.3}>
            <Pixels
              rows={FERRY.rows}
              colours={colours}
              px={px}
              from={FERRY.waterline}
            />
          </g>
          {FERRY.lights.map(([x, y], i) => (
            <rect
              key={i}
              x={x * px}
              y={y * px}
              width={px}
              height={px}
              fill={LIGHT_COLOURS[i % LIGHT_COLOURS.length]}
              className="animate-festive-blink"
              style={{
                animationDelay: `${-noise(i + 20) * 1.6}s`,
                animationDuration: `${0.8 + noise(i + 40) * 0.9}s`,
              }}
            />
          ))}
        </svg>
      </span>
    </span>
  );
}

const BAUBLE_COLOURS = ["#c8102e", "#2e7d32", "#d4a017", "#0e7cc1"];

export default function PixelStrand({
  direction,
  length,
  primary,
}: StrandProps) {
  const { isDark } = useTheme();
  const colours = palette(isDark);

  if (direction === "down" && primary) {
    return <Ferry length={length} colours={colours} />;
  }

  if (direction === "down") {
    const px = 2;
    return (
      <>
        {slots(length, 26).map((a, i) => {
          const drop = 2 + Math.round(noise(i) * 4) * px;
          return (
            <span key={i} className="absolute" style={{ left: a, top: 0 }}>
              <span
                className="absolute w-px bg-[#9ca3af] dark:bg-[#64748b]"
                style={{ left: -0.5, top: 0, height: drop }}
              />
              <Sprite
                rows={BAUBLE}
                colours={{ ...colours, x: BAUBLE_COLOURS[i % 4] }}
                px={px}
                style={{ left: -5, top: drop }}
              />
            </span>
          );
        })}
      </>
    );
  }

  if (direction === "up") {
    const px = 2;
    return (
      <>
        {slots(length, 32).map((a, i) => {
          const rows = i % 3 === 1 ? TREE : PRESENT;
          const [x, y] = point("up", a + (noise(i) - 0.5) * 8, 0);
          return (
            <Sprite
              key={i}
              rows={rows}
              colours={{ ...colours, x: BAUBLE_COLOURS[i % 4] }}
              px={px}
              style={{
                left: x - (rows[0].length * px) / 2,
                top: y - rows.length * px,
              }}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
      {slots(length, 44).map((a, i) => {
        const [x, y] = point(direction, a + (noise(i) - 0.5) * 16, 0);
        return (
          <Sprite
            key={i}
            rows={STAR}
            colours={colours}
            px={2}
            className="animate-festive-twinkle"
            style={{
              left: x + 4 + noise(i + 3) * 8,
              top: y - 5,
              animationDelay: `${noise(i + 5) * 2.4}s`,
            }}
          />
        );
      })}
    </>
  );
}
