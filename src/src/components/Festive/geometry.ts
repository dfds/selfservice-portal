import type { CSSProperties } from "react";

/** Direction away from the border. */
export type Direction = "down" | "up" | "right";

export interface StrandProps {
  direction: Direction;
  /** Strand length in px along the border. */
  length: number;
  /** At most one strand per page carries the style's accent. */
  primary?: boolean;
}

/**
 * Returns coordinates relative to the strand container's origin.
 * `across` increases away from the border in `direction`.
 */
export function point(
  direction: Direction,
  along: number,
  across: number,
): [number, number] {
  switch (direction) {
    case "down":
      return [along, across];
    case "up":
      return [along, -across];
    case "right":
      return [across, along];
  }
}

/** Centres the slots with equal margins at both ends. */
export function slots(length: number, spacing: number): number[] {
  const count = Math.max(0, Math.floor(length / spacing));
  const start = (length - count * spacing) / 2 + spacing / 2;
  return Array.from({ length: count }, (_, i) => start + i * spacing);
}

/** Deterministic value in [0, 1), so layouts don't reshuffle on re-render. */
export function noise(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function centredAt(x: number, y: number): CSSProperties {
  return {
    position: "absolute",
    left: x,
    top: y,
    transform: "translate(-50%, -50%)",
  };
}
