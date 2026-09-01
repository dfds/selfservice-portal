import type { ReactNode } from "react";

export interface TourStep {
  target: string;
  title: string;
  body: ReactNode | string;
  route?: string;
  onEnter?: () => void | Promise<void>;
  position?: "top" | "bottom" | "left" | "right" | "auto";
  inSidebar?: boolean;
  /**
   * Return true to drop this step for the current viewport. Use for targets
   * that only exist on desktop (e.g. MRT table controls, which are unmounted
   * entirely on mobile) - without this the step stalls on waitForElement and
   * degrades to an unanchored popover.
   */
  skipIf?: (ctx: { isMobile: boolean }) => boolean;
  /**
   * Skip this step when its target never mounts, instead of stalling on the
   * element wait and degrading to an unanchored popover.
   */
  optional?: boolean;
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
