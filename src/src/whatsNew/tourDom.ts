import { queryClient } from "@/state/remote/client";

/**
 * Wait until the page has finished loading its data, so a tour step doesn't
 * highlight a skeleton
 */
export async function waitForDataLoaded(
  graceMs = 250,
  timeoutMs = 6000,
): Promise<void> {
  const start = performance.now();
  await new Promise((resolve) => window.setTimeout(resolve, graceMs));
  while (queryClient.isFetching() > 0) {
    if (performance.now() - start > timeoutMs) return;
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }
}

/**
 * Wait for a selector to appear, polling until it resolves or the timeout
 * elapses. Shared by the tour engine and by release files that need to touch
 * the page from a step's onEnter.
 */
export function waitForSelector(
  selector: string,
  timeoutMs = 4000,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = performance.now();
    const interval = window.setInterval(() => {
      const found = document.querySelector(selector);
      if (found) {
        window.clearInterval(interval);
        resolve(found);
        return;
      }
      if (performance.now() - start > timeoutMs) {
        window.clearInterval(interval);
        resolve(null);
      }
    }, 80);
  });
}
