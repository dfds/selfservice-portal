import type { TourDefinition } from "./types";
import {
  tour_2026_q2_customisation,
  tour_2026_q2_topbar,
} from "./releases/2026-q2";
import { tour_2026_q3_service_catalogue } from "./releases/2026-q3";

const ALL_TOURS: TourDefinition[] = [
  tour_2026_q3_service_catalogue,
  // tour_2026_q2_customisation,
  // tour_2026_q2_topbar,
];

export interface TourContext {
  isCloudEngineer: boolean;
}

// Sorted newest first, so the caller's latest visible tour is always tours[0].
export function getTours(ctx: TourContext): TourDefinition[] {
  return ALL_TOURS.filter((t) => !t.visibleTo || t.visibleTo(ctx)).sort(
    (a, b) => (a.releaseDate < b.releaseDate ? 1 : -1),
  );
}

// Latest tour *this user can see* - a tour gated behind visibleTo must never
// drive the "New: see what changed" banner for someone it's hidden from.
export function getLatestTourId(ctx: TourContext): string | null {
  return getTours(ctx)[0]?.id ?? null;
}
