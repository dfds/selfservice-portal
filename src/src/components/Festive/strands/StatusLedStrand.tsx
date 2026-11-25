import React from "react";
import { cn } from "@/lib/utils";
import { centredAt, point, slots, type StrandProps } from "../geometry";

const SPACING = 12;
// Match the 3s CSS cycle. A 50ms phase step repeats the wave every 60 LEDs.
const STEP_S = 0.05;
const CYCLE_S = 3;

// Reuses the portal's status colours.
const COLOURS = [
  "text-[#be1e2d] dark:text-[#f87171]",
  "text-[#4caf50] dark:text-[#4ade80]",
  "text-[#be1e2d] dark:text-[#f87171]",
  "text-[#4caf50] dark:text-[#4ade80]",
  "text-[#ed8800] dark:text-[#fbbf24]",
  "text-[#0e7cc1] dark:text-[#60a5fa]",
];

export default function StatusLedStrand({ direction, length }: StrandProps) {
  const vertical = direction === "right";
  return (
    <>
      {slots(length, SPACING).map((a, i) => {
        const [x, y] = point(direction, a, 0);
        return (
          <span
            key={i}
            className={cn(
              "rounded-[1px] bg-current shadow-[0_0_5px_1px_currentColor] animate-festive-chase",
              vertical ? "h-[6px] w-[2px]" : "h-[2px] w-[6px]",
              COLOURS[i % COLOURS.length],
            )}
            style={{
              ...centredAt(x, y),
              // Negative delays avoid full opacity while LEDs wait to animate.
              animationDelay: `${-(CYCLE_S - ((i * STEP_S) % CYCLE_S))}s`,
            }}
          />
        );
      })}
    </>
  );
}
