import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import {
  SNOWFALL_SEASON,
  useSnowSettings,
} from "@/context/SnowSettingsContext";
import { CHRISTMAS_EVE, type AdventState } from "./advent";
import { noise } from "./geometry";

const RED = "#c8102e";
const RED_DARK = "#9e0c24";
const RED_TOP = "#e2344d";

function Flame({
  x,
  y,
  scale = 1,
  delay,
  glowOpacity,
}: {
  x: number;
  y: number;
  scale?: number;
  delay: number;
  glowOpacity: number;
}) {
  const id = useId();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffc35a" stopOpacity={glowOpacity} />
          <stop offset="1" stopColor="#ffc35a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe082" />
          <stop offset="0.6" stopColor="#ffb300" />
          <stop offset="1" stopColor="#ef6c00" />
        </linearGradient>
      </defs>
      <circle cy={-3} r={8} fill={`url(#${id}-glow)`} />
      <line y1={0} y2={-1.6} stroke="#3b2f2f" strokeWidth={0.7} />
      {/* CSS transforms on SVG children resolve against the local user
          space, so origin 0 0 is the wick tip set by the parent translate. */}
      <g
        className="animate-festive-flicker"
        style={{ transformOrigin: "0px 0px", animationDelay: `${-delay}s` }}
      >
        <path
          d="M0 -7 C1.7 -4.4 2.1 -2.2 1.7 -1 C1.3 0.2 -1.3 0.2 -1.7 -1 C-2.1 -2.2 -1.7 -4.4 0 -7 Z"
          fill={`url(#${id}-flame)`}
        />
        <ellipse cy={-1.6} rx={0.7} ry={1.3} fill="#fff8e1" />
      </g>
    </g>
  );
}

// Wreath geometry, in viewBox units.
const W_CX = 50;
const W_CY = 46;
const W_RX = 38;
const W_RY = 10;
const CANDLE_W = 6;
const CANDLE_H = 24;
/** Height one Sunday's burning takes off an Advent candle. */
const SUNDAY_BURN = 4;
/** Lighting order runs clockwise from the front left. */
const CANDLE_ANGLES = [160, 235, 305, 20];
const CLUSTERS = 34;

const GREENS_LIGHT = ["#2e6b3b", "#3f8a4c", "#24552f", "#4d9a58"];
const GREENS_DARK = ["#3a7d48", "#4f9e5c", "#2d6639", "#5fb06a"];

function onRing(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [W_CX + W_RX * Math.cos(r), W_CY + W_RY * Math.sin(r)];
}

function isFront(deg: number): boolean {
  return Math.sin((deg * Math.PI) / 180) >= 0;
}

function Greenery({ front, isDark }: { front: boolean; isDark: boolean }) {
  const greens = isDark ? GREENS_DARK : GREENS_LIGHT;
  const leaves = [];
  for (let i = 0; i < CLUSTERS; i++) {
    const deg = (i / CLUSTERS) * 360 + noise(i) * 8;
    if (isFront(deg) !== front) continue;
    const [x, y] = onRing(deg);
    // Tangent of the ellipse, so needle clusters follow the ring.
    const r = (deg * Math.PI) / 180;
    const tangent =
      (Math.atan2(W_RY * Math.cos(r), -W_RX * Math.sin(r)) * 180) / Math.PI;
    leaves.push(
      <ellipse
        key={i}
        cx={x + (noise(i + 40) - 0.5) * 3}
        cy={y + (noise(i + 80) - 0.5) * 3}
        rx={5}
        ry={2.4}
        transform={`rotate(${tangent + (noise(i + 120) - 0.5) * 50} ${x} ${y})`}
        fill={greens[Math.floor(noise(i + 160) * greens.length)]}
      />,
    );
  }
  return <>{leaves}</>;
}

function Berries() {
  return (
    <>
      {[110, 140, 75, 45, 95, 175, 5].map((deg, i) => {
        const [x, y] = onRing(deg);
        const dy = 1.5 + noise(i + 200) * 1.5;
        return (
          <g key={deg}>
            <circle cx={x} cy={y + dy} r={1.4} fill={RED} />
            <circle
              cx={x - 0.45}
              cy={y + dy - 0.45}
              r={0.45}
              fill="#ffffff"
              opacity={0.6}
            />
          </g>
        );
      })}
    </>
  );
}

function AdventCandle({
  index,
  sundaysLit,
  glowOpacity,
}: {
  index: number;
  sundaysLit: number;
  glowOpacity: number;
}) {
  const [x, ringY] = onRing(CANDLE_ANGLES[index]);
  const base = ringY - 1;
  const lit = index < sundaysLit;
  // Candle n is lit on Sundays n..sundaysLit, so earlier candles are shorter.
  const height = CANDLE_H - (lit ? (sundaysLit - index) * SUNDAY_BURN : 0);
  const top = base - height;
  const left = x - CANDLE_W / 2;
  return (
    <g>
      <rect x={left} y={top} width={CANDLE_W} height={height} fill={RED} />
      <rect
        x={left + CANDLE_W - 1.5}
        y={top}
        width={1.5}
        height={height}
        fill={RED_DARK}
      />
      <rect
        x={left + 0.8}
        y={top}
        width={1.2}
        height={height}
        fill="#ffffff"
        opacity={0.18}
      />
      <ellipse cx={x} cy={top} rx={CANDLE_W / 2} ry={0.9} fill={RED_TOP} />
      {lit ? (
        <>
          <path
            d={`M${left} ${top} q0 3.2 0.9 3.2 q0.9 0 0.9 -3.2 Z`}
            fill={RED_TOP}
          />
          <Flame
            x={x}
            y={top - 0.4}
            delay={index * 0.45}
            glowOpacity={glowOpacity}
          />
        </>
      ) : (
        <line
          x1={x}
          x2={x}
          y1={top}
          y2={top - 1.8}
          stroke="#3b2f2f"
          strokeWidth={0.7}
        />
      )}
    </g>
  );
}

function Wreath({
  sundaysLit,
  isDark,
}: {
  sundaysLit: number;
  isDark: boolean;
}) {
  const band = isDark ? "#245a30" : "#1f4b29";
  const glowOpacity = isDark ? 0.55 : 0.3;
  const candles = [0, 1, 2, 3].map((i) => (
    <AdventCandle
      key={i}
      index={i}
      sundaysLit={sundaysLit}
      glowOpacity={glowOpacity}
    />
  ));
  const front = (i: number) => isFront(CANDLE_ANGLES[i]);
  return (
    <svg width={100} height={60} viewBox="0 0 100 60" overflow="visible">
      <path
        d={`M${W_CX - W_RX} ${W_CY} A${W_RX} ${W_RY} 0 0 1 ${
          W_CX + W_RX
        } ${W_CY}`}
        fill="none"
        stroke={band}
        strokeWidth={7}
      />
      {candles.filter((_, i) => !front(i))}
      <Greenery front={false} isDark={isDark} />
      <path
        d={`M${W_CX + W_RX} ${W_CY} A${W_RX} ${W_RY} 0 0 1 ${
          W_CX - W_RX
        } ${W_CY}`}
        fill="none"
        stroke={band}
        strokeWidth={7}
      />
      {candles.filter((_, i) => front(i))}
      <Greenery front={true} isDark={isDark} />
      <Berries />
    </svg>
  );
}

// Calendar candle geometry, in viewBox units.
const K_LEFT = 9;
const K_W = 12;
const K_BASE = 70;
/** Height of one day's mark. */
const K_SEG = 2.4;
/** Minimum body height that fits the day number below the flame. */
const K_NUMBER_ROOM = 9;

function CalendarCandle({
  advent,
  isDark,
}: {
  advent: AdventState;
  isDark: boolean;
}) {
  const clipId = useId();
  const { calendarDay, spent } = advent;
  const lit = calendarDay > 0 && !spent;
  // Marks 1..calendarDay-1 have burnt; today's mark sits under the flame.
  const remaining = spent ? 0 : CHRISTMAS_EVE + 1 - Math.max(calendarDay, 1);
  const height = remaining * K_SEG;
  const top = K_BASE - height;
  const cx = K_LEFT + K_W / 2;
  const showNumber = lit && height >= K_NUMBER_ROOM;
  const wax = isDark ? "#efe9da" : "#f8f3e6";
  const waxShade = isDark ? "#d6cbb1" : "#e6dcc4";
  const outline = isDark ? "transparent" : "#d3c7a9";

  return (
    <svg width={30} height={76} viewBox="0 0 30 76" overflow="visible">
      <ellipse cx={cx} cy={72.4} rx={13} ry={3} fill="#a07c2c" />
      <ellipse cx={cx} cy={71.2} rx={12} ry={2.3} fill="#d4af5a" />
      {spent ? (
        <>
          <ellipse cx={cx} cy={70.6} rx={6.5} ry={1.4} fill={wax} />
          <line
            x1={cx}
            x2={cx + 0.6}
            y1={70.4}
            y2={68.6}
            stroke="#3b2f2f"
            strokeWidth={0.7}
          />
        </>
      ) : (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x={K_LEFT} y={top} width={K_W} height={height} />
            </clipPath>
          </defs>
          <rect
            x={K_LEFT}
            y={top}
            width={K_W}
            height={height}
            fill={wax}
            stroke={outline}
            strokeWidth={0.5}
          />
          <g clipPath={`url(#${clipId})`}>
            <rect
              x={K_LEFT + K_W - 2}
              y={top}
              width={2}
              height={height}
              fill={waxShade}
            />
            {Array.from({ length: remaining - 1 }, (_, i) => {
              const y = top + (i + 1) * K_SEG;
              if (showNumber && y < top + K_NUMBER_ROOM) return null;
              // Longer ticks below marks 5, 10, 15 and 20.
              const long = (Math.max(calendarDay, 1) + i) % 5 === 0;
              return (
                <line
                  key={i}
                  x1={long ? K_LEFT + 1.5 : K_LEFT + 3.5}
                  x2={long ? K_LEFT + K_W - 1.5 : K_LEFT + K_W - 3.5}
                  y1={y}
                  y2={y}
                  stroke={RED}
                  strokeWidth={0.45}
                  opacity={0.75}
                />
              );
            })}
            {/* Holly near the base; the last three marks burn through it. */}
            <path
              d={`M${cx} 64.5 q-3.2 -2.2 -5 0.2 q2.6 0.4 5 -0.2 Z`}
              fill="#2e6b3b"
            />
            <path
              d={`M${cx} 64.5 q3.2 -2.2 5 0.2 q-2.6 0.4 -5 -0.2 Z`}
              fill="#3f8a4c"
            />
            <circle cx={cx - 0.9} cy={65.6} r={0.9} fill={RED} />
            <circle cx={cx + 0.9} cy={65.6} r={0.9} fill={RED} />
          </g>
          <ellipse
            cx={cx}
            cy={top}
            rx={K_W / 2}
            ry={1.2}
            fill={lit ? "#fffaf0" : wax}
            stroke={outline}
            strokeWidth={0.5}
          />
          {showNumber && (
            <text
              x={cx - 0.5}
              y={top + 7.2}
              textAnchor="middle"
              fontSize={6}
              fontWeight={700}
              fontFamily="var(--mono)"
              fill={RED}
            >
              {calendarDay}
            </text>
          )}
          {lit ? (
            <>
              <path
                d={`M${K_LEFT + 2} ${top} q0 4 1.1 4 q1.1 0 1.1 -4 Z`}
                fill={wax}
              />
              <Flame
                x={cx}
                y={top - 0.6}
                scale={1.3}
                delay={1.1}
                glowOpacity={isDark ? 0.6 : 0.32}
              />
            </>
          ) : (
            <line
              x1={cx}
              x2={cx}
              y1={top}
              y2={top - 2}
              stroke="#3b2f2f"
              strokeWidth={0.7}
            />
          )}
        </>
      )}
    </svg>
  );
}

function caption(advent: AdventState): string {
  const { ordinal, calendarDay, sundaysLit } = advent;
  if (sundaysLit === 0) return "";
  if (ordinal > CHRISTMAS_EVE + 2) return "Happy new year";
  if (ordinal >= CHRISTMAS_EVE) return "Happy holidays";
  // The first Advent Sunday is 27 Nov–3 Dec, so only it can precede 1 Dec.
  if (calendarDay === 0) return "1st Advent";
  const left = CHRISTMAS_EVE - calendarDay;
  return `${left} ${left === 1 ? "day" : "days"} to go`;
}

export default function AdventCandles({ className }: { className?: string }) {
  const { settings, advent } = useSnowSettings();
  const { isDark } = useTheme();
  if (!SNOWFALL_SEASON || !settings.enabled) return null;

  return (
    <div className={cn("px-3 pt-2 pb-1 select-none", className)}>
      {/* The caption below carries the state for screen readers. */}
      <div aria-hidden="true" className="flex items-end justify-center gap-3">
        <Wreath sundaysLit={advent.sundaysLit} isDark={isDark} />
        <CalendarCandle advent={advent} isDark={isDark} />
      </div>
      <div className="mt-1 text-right font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-muted">
        {caption(advent)}
      </div>
    </div>
  );
}
