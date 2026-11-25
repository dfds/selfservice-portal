import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { centredAt, point, slots, type StrandProps } from "../geometry";

const BAND = 4;
const BOW_SPACING = 280;
const RED = "#c8102e";
const RED_DARK = "#8f0b21";

const ROTATION = { down: 0, up: 180, right: -90 } as const;

function Bow({ rotation }: { rotation: number }) {
  return (
    // Centre the viewBox on the knot so it stays on the border when rotated.
    <svg
      width={26}
      height={29}
      viewBox="-10 -11 20 22"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M-0.6 0.6 L-4.5 9.5 L-2.2 8.4 L-1 10.5 Z" fill={RED_DARK} />
      <path d="M0.6 0.6 L4.5 9.5 L2.2 8.4 L1 10.5 Z" fill={RED_DARK} />
      <path d="M0 0 C-3 -6 -10 -5 -8.5 0 C-7.5 3.5 -3 2.5 0 0 Z" fill={RED} />
      <path d="M0 0 C3 -6 10 -5 8.5 0 C7.5 3.5 3 2.5 0 0 Z" fill={RED} />
      <circle r={2} fill={RED_DARK} />
    </svg>
  );
}

export default function CandyCaneStrand({ direction, length }: StrandProps) {
  const { isDark } = useTheme();
  const white = isDark ? "#e2e8f0" : "#ffffff";
  const vertical = direction === "right";

  return (
    <>
      <span
        className="absolute rounded-full shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)] animate-festive-candy"
        style={{
          left: vertical ? -BAND / 2 : 0,
          top: vertical ? 0 : -BAND / 2,
          width: vertical ? BAND : length,
          height: vertical ? length : BAND,
          backgroundImage: `linear-gradient(45deg, ${RED} 25%, ${white} 25%, ${white} 50%, ${RED} 50%, ${RED} 75%, ${white} 75%)`,
          backgroundSize: "8px 8px",
        }}
      />
      {slots(length, BOW_SPACING).map((a, i) => (
        <span key={i} style={centredAt(...point(direction, a, 0))}>
          <Bow rotation={ROTATION[direction]} />
        </span>
      ))}
    </>
  );
}
