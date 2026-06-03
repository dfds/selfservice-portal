import type { TourDefinition } from "./types";
import {
  tour_2026_q2_customisation,
  tour_2026_q2_topbar,
} from "./releases/2026-q2";

const ALL_TOURS: TourDefinition[] = [
  tour_2026_q2_customisation,
  // tour_2026_q2_topbar,
];

export interface TourContext {
  isCloudEngineer: boolean;
}

export function getTours(ctx: TourContext): TourDefinition[] {
  return ALL_TOURS.filter((t) => !t.visibleTo || t.visibleTo(ctx)).sort(
    (a, b) => (a.releaseDate < b.releaseDate ? 1 : -1),
  );
}

export const LATEST_TOUR_ID = ALL_TOURS.reduce<string | null>((latest, t) => {
  if (!latest) return t.id;
  const latestTour = ALL_TOURS.find((x) => x.id === latest)!;
  return t.releaseDate > latestTour.releaseDate ? t.id : latest;
}, null);
