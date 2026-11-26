import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import {
  SNOWFALL_SEASON,
  useSnowSettings,
} from "@/context/SnowSettingsContext";
import { noise } from "./geometry";

// y = 0 is the top of the container's bottom border; frost has negative y.
// The TopBar breadcrumb and the sidebar logo end 13px above the border.
const ROOM_ABOVE = 13;
const FERN_SPACING = 16;
const SAMPLE_PX = 3;
/** Branch nodes as fractions along a fern stem. */
const NODES = [0.3, 0.5, 0.68, 0.84];

function smoothNoise(x: number, period: number, seed: number): number {
  const k = Math.floor(x / period);
  const t = (1 - Math.cos((x / period - k) * Math.PI)) / 2;
  return noise(k + seed) * (1 - t) + noise(k + 1 + seed) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Wavy profile in [0, 1]. It depends only on the page x, so frost in
 * adjacent containers meets without a step.
 */
function envelope(pageX: number): number {
  const raw =
    0.55 * smoothNoise(pageX, 70, 0) +
    0.3 * smoothNoise(pageX, 23, 500) +
    0.15 * smoothNoise(pageX, 8, 900);
  // Summed octaves cluster around 0.5; stretching restores the waves.
  return Math.min(Math.max((raw - 0.5) * 1.8 + 0.5, 0), 1);
}

function segment(x: number, y: number, deg: number, length: number) {
  const r = (deg * Math.PI) / 180;
  const x2 = x + Math.cos(r) * length;
  const y2 = y + Math.sin(r) * length;
  return {
    d: `M${x.toFixed(2)} ${y.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`,
    x2,
    y2,
  };
}

function bandPath(left: number, width: number, progress: number): string {
  const height = (x: number) =>
    (2 + 10 * progress) * (0.55 + 0.45 * envelope(left + x));
  let d = "M0 0";
  for (let x = 0; x < width; x += SAMPLE_PX) {
    d += `L${x} ${(-height(x)).toFixed(2)}`;
  }
  return `${d}L${width} ${(-height(width)).toFixed(2)}L${width} 0Z`;
}

/** Ferns sit on a page-aligned grid, so they keep their place across resizes. */
function fernPath(left: number, width: number, progress: number): string {
  let d = "";
  const first = Math.floor(left / FERN_SPACING) - 1;
  const last = Math.ceil((left + width) / FERN_SPACING) + 1;
  for (let k = first; k <= last; k++) {
    // Each fern starts on its own day and grows until 24 Dec.
    const start = noise(k * 7 + 1) * 0.5;
    const grow = smoothstep(start, start + 0.45, progress);
    if (grow <= 0) continue;
    const x =
      k * FERN_SPACING + (noise(k * 7 + 2) - 0.5) * FERN_SPACING * 0.7 - left;
    const angle = -90 + (noise(k * 7 + 3) - 0.5) * 80;
    // Capped so the tip stays below the breadcrumb at any angle.
    const length = Math.min((5 + 10 * noise(k * 7 + 4)) * grow, ROOM_ABOVE);
    const stem = segment(x, 0, angle, length);
    d += stem.d;
    for (const f of NODES) {
      const nx = x + (stem.x2 - x) * f;
      const ny = stem.y2 * f;
      const branch = length * 0.38 * (1 - f * 0.55);
      d += segment(nx, ny, angle - 55, branch).d;
      d += segment(nx, ny, angle + 55, branch).d;
    }
  }
  return d;
}

/** offsetLeft is in layout px, so it is unaffected by the UI font scale. */
function pageLeft(el: HTMLElement): number {
  let x = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement) {
    x += n.offsetLeft;
  }
  return x;
}

/**
 * Frosted glass rising from the bottom border of its positioned parent, with
 * fern crystals that lengthen each day of December.
 */
export default function WindowFrost({ className }: { className?: string }) {
  const { settings, advent } = useSnowSettings();
  const { isDark } = useTheme();
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ left: 0, width: 0 });
  const gradientId = useId();
  const active = SNOWFALL_SEASON && settings.enabled && advent.buildUp > 0;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ left: pageLeft(el), width: el.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  if (!active) return null;

  const tint = isDark ? "#ffffff" : "#a9c3df";
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-0",
        className,
      )}
    >
      {box.width > 0 && (
        <svg
          width={box.width}
          height={ROOM_ABOVE}
          viewBox={`0 ${-ROOM_ABOVE} ${box.width} ${ROOM_ABOVE}`}
          className="absolute bottom-0 left-0 overflow-visible"
        >
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={-ROOM_ABOVE}
            >
              <stop
                offset="0"
                stopColor={tint}
                stopOpacity={isDark ? 0.45 : 0.6}
              />
              <stop offset="1" stopColor={tint} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={bandPath(box.left, box.width, advent.buildUp)}
            fill={`url(#${gradientId})`}
          />
          <path
            d={fernPath(box.left, box.width, advent.buildUp)}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.8)" : "#8fadd0"}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
