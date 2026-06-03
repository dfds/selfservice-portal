import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { openMobileSidebar } from "./mobileSidebar";
import type { TourDefinition, TourStep } from "./types";

function waitForElement(selector: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(true);
      return;
    }
    const start = performance.now();
    const interval = window.setInterval(() => {
      if (document.querySelector(selector)) {
        window.clearInterval(interval);
        resolve(true);
        return;
      }
      if (performance.now() - start > timeoutMs) {
        window.clearInterval(interval);
        resolve(false);
      }
    }, 80);
  });
}

function bodyToString(body: unknown): string {
  if (typeof body === "string") return body;
  if (body == null) return "";
  return String(body);
}

export function useDriverTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  return useCallback(
    async (tour: TourDefinition, onComplete?: () => void) => {
      const driverModule = await import("driver.js");
      // @ts-expect-error — driver.js ships CSS without TS declarations
      await import("driver.js/dist/driver.css");
      const driver = driverModule.driver;

      // Run navigation, mobile sidebar opening, the step's own onEnter, and
      // wait for the target to mount. Called BEFORE driver.js positions on the
      // step — driver.js does not await onHighlightStarted, so any prep that
      // affects which DOM node gets highlighted has to happen here, before
      // moveNext/movePrevious or the initial drive() call.
      async function prepareStep(step: TourStep): Promise<void> {
        if (step.route && location.pathname !== step.route) {
          navigate(step.route);
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
        await waitForElement(step.target);
      }

      const steps = tour.steps.map((step, idx) => ({
        element: step.target,
        popover: {
          title: step.title,
          description: bodyToString(step.body),
          side: step.position ?? "auto",
          onNextClick: async () => {
            const next = tour.steps[idx + 1];
            if (next) {
              await prepareStep(next);
              drv.moveNext();
            } else {
              drv.destroy();
            }
          },
          onPrevClick: async () => {
            const prev = tour.steps[idx - 1];
            if (prev) {
              await prepareStep(prev);
              drv.movePrevious();
            }
          },
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
          onComplete?.();
        },
      });

      await prepareStep(tour.steps[0]);
      drv.drive();

      rootObserver = new MutationObserver(() => {
        if (drv.isActive()) drv.refresh();
      });
      rootObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style"],
      });
    },
    [navigate, location.pathname, isMobile],
  );
}
