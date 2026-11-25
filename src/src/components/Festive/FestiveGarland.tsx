import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SNOWFALL_SEASON,
  type FestiveStyle,
  useSnowSettings,
} from "@/context/SnowSettingsContext";
import type { Direction, StrandProps } from "./geometry";
import StatusLedStrand from "./strands/StatusLedStrand";
import AsciiStrand from "./strands/AsciiStrand";
import CandyCaneStrand from "./strands/CandyCaneStrand";
import PixelStrand from "./strands/PixelStrand";

const STRANDS: Record<FestiveStyle, React.ComponentType<StrandProps>> = {
  status: StatusLedStrand,
  ascii: AsciiStrand,
  candy: CandyCaneStrand,
  pixel: PixelStrand,
};

// The parent must be positioned. Negative offsets align the horizontal
// strands with its 1px border instead of its padding edge.
const CONTAINER: Record<Direction, string> = {
  down: "inset-x-0 -bottom-px h-0",
  up: "inset-x-0 -top-px h-0",
  right: "left-0 top-0 h-[var(--ssu-vh)] w-0",
};

export default function FestiveGarland({
  direction,
  primary,
  className,
}: {
  direction: Direction;
  primary?: boolean;
  className?: string;
}) {
  const { settings } = useSnowSettings();
  const ref = useRef<HTMLSpanElement>(null);
  const [length, setLength] = useState(0);
  const active = SNOWFALL_SEASON && settings.enabled && settings.lights;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setLength(direction === "right" ? el.offsetHeight : el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, active]);

  if (!active) return null;

  const Strand = STRANDS[settings.lightsStyle];
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-10",
        CONTAINER[direction],
        className,
      )}
    >
      {length > 0 && (
        <Strand direction={direction} length={length} primary={primary} />
      )}
    </span>
  );
}
