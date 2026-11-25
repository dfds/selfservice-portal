import React from "react";
import { cn } from "@/lib/utils";
import { centredAt, noise, point, slots, type StrandProps } from "../geometry";

const SPACING = 14;
const GLYPHS = ["*", "·", "+", "·", "o", "·"];
const COLOURS = [
  "text-[#be1e2d] dark:text-[#f87171]",
  "text-[#2e7d32] dark:text-[#4ade80]",
  "text-[#b7791f] dark:text-[#fbbf24]",
];
// Half-width of the label gap in pixels.
const LABEL_CLEARANCE = 74;

export default function AsciiStrand({
  direction,
  length,
  primary,
}: StrandProps) {
  const labelAt = length / 2;
  const showLabel = primary && direction === "down";

  return (
    <>
      {slots(length, SPACING).map((a, i) => {
        if (showLabel && Math.abs(a - labelAt) < LABEL_CLEARANCE) return null;
        const glyph = GLYPHS[i % GLYPHS.length];
        const [x, y] = point(direction, a, 0);
        const dot = glyph === "·";
        return (
          <span
            key={i}
            className={cn(
              "font-mono text-[11px] font-bold leading-none",
              dot
                ? "text-muted"
                : [
                    COLOURS[(i >> 1) % COLOURS.length],
                    "animate-festive-twinkle",
                  ],
            )}
            style={{
              ...centredAt(x, y),
              // The asterisk sits above the centre of its em box.
              marginTop: glyph === "*" ? 2 : 0,
              animationDelay: dot ? undefined : `${noise(i) * 2.4}s`,
            }}
          >
            {glyph}
          </span>
        );
      })}
      {showLabel && (
        <span
          className="whitespace-nowrap font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-action"
          style={{ ...centredAt(...point(direction, labelAt, 9)) }}
        >
          {"// merry christmas"}
          <span className="animate-festive-blink">_</span>
        </span>
      )}
    </>
  );
}
