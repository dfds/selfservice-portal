import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { openMobileSidebar } from "./mobileSidebar";
import { waitForDataLoaded, waitForSelector } from "./tourDom";
import type { TourDefinition, TourStep } from "./types";

const OPTIONAL_STEP_TIMEOUT_MS = 900;

const PAGE_TRANSITION_PAUSE_MS = 1400;

const TRANSITION_CLASS = "ssu-tour-transitioning";

function hideTourChrome() {
  document.documentElement.classList.add(TRANSITION_CLASS);
}

function showTourChrome() {
  document.documentElement.classList.remove(TRANSITION_CLASS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function bodyToString(body: unknown): string {
  if (typeof body === "string") return body;
  if (body == null) return "";
  return String(body);
}

export function useDriverTour() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return useCallback(
    async (tour: TourDefinition, onComplete?: () => void) => {
      const driverModule = await import("driver.js");
      // @ts-expect-error - driver.js ships CSS without TS declarations
      await import("driver.js/dist/driver.css");
      const driver = driverModule.driver;

      async function prepareStep(step: TourStep): Promise<boolean> {
        const here = window.location.pathname + window.location.search;
        if (step.route && here !== step.route) {
          const changesPage =
            step.route.split("?")[0] !== window.location.pathname;
          navigate(step.route);
          if (changesPage) {
            hideTourChrome();
            await waitForDataLoaded();
            await sleep(PAGE_TRANSITION_PAUSE_MS);
          }
        }
        if (
          isMobile &&
          (step.inSidebar || /\[data-tour="nav-/.test(step.target))
        ) {
          openMobileSidebar();
        }
        if (step.onEnter) {
          await step.onEnter();
        }
        const found = await waitForSelector(
          step.target,
          step.optional ? OPTIONAL_STEP_TIMEOUT_MS : undefined,
        );
        return !!found;
      }

      const activeSteps = tour.steps.filter((s) => !s.skipIf?.({ isMobile }));
      if (activeSteps.length === 0) {
        onComplete?.();
        return;
      }

      async function resolveStep(
        from: number,
        dir: 1 | -1,
      ): Promise<number | null> {
        for (let i = from + dir; i >= 0 && i < activeSteps.length; i += dir) {
          const found = await prepareStep(activeSteps[i]);
          if (found || !activeSteps[i].optional) return i;
        }
        return null;
      }

      let transitioning = false;
      async function travel(from: number, dir: 1 | -1): Promise<void> {
        if (transitioning) return;
        transitioning = true;
        try {
          const to = await resolveStep(from, dir);
          if (to !== null) drv.moveTo(to);
          else if (dir === 1) drv.destroy();
          // Only after moveTo has repositioned onto the new target - bringing
          // the overlay back any earlier shows the old step's spotlight.
          showTourChrome();
        } finally {
          transitioning = false;
        }
      }

      const steps = activeSteps.map((step, idx) => ({
        element: step.target,
        popover: {
          title: step.title,
          description: bodyToString(step.body),
          side: step.position ?? "auto",
          onNextClick: () => travel(idx, 1),
          onPrevClick: () => travel(idx, -1),
        },
      }));

      // Font-scale changes (--font-scale CSS var on <html>) reflow the page
      // but don't fire a resize event, so driver.js's built-in resize handling
      // doesn't reposition the popover/spotlight. Watch the root style attr and
      // refresh on each mutation.
      let rootObserver: MutationObserver | null = null;

      const drv = driver({
        showProgress: true,
        allowClose: true,
        stagePadding: 4,
        stageRadius: 6,
        smoothScroll: true,
        popoverClass: "ssu-driver-popover",
        steps: steps as any,
        onDestroyed: () => {
          rootObserver?.disconnect();
          rootObserver = null;
          showTourChrome();
          onComplete?.();
        },
      });

      await prepareStep(activeSteps[0]);
      drv.drive();
      showTourChrome();

      rootObserver = new MutationObserver(() => {
        if (drv.isActive()) drv.refresh();
      });
      rootObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style"],
      });
    },
    [navigate, isMobile],
  );
}
