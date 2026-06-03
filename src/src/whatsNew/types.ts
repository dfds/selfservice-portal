import type { ReactNode } from "react";

export interface TourStep {
  target: string;
  title: string;
  body: ReactNode | string;
  route?: string;
  onEnter?: () => void | Promise<void>;
  position?: "top" | "bottom" | "left" | "right" | "auto";
  inSidebar?: boolean;
}

export interface TourDefinition {
  id: string;
  release: string;
  releaseDate: string;
  title: string;
  summary: string;
  category?: "ui" | "feature" | "admin";
  steps: TourStep[];
  visibleTo?: (ctx: { isCloudEngineer: boolean }) => boolean;
}

export interface TourState {
  seenIds: string[];
  dismissedIds: string[];
  completedIds: string[];
  seenReleaseNoteIds: string[];
}

export const EMPTY_TOUR_STATE: TourState = {
  seenIds: [],
  dismissedIds: [],
  completedIds: [],
  seenReleaseNoteIds: [],
};
