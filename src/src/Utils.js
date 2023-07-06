/**
 * Delays execution by a number of miliseconds.
 * @param {number} duration Amount of delay in miliseconds.
 * @returns An awaitable promise that gets resolved after the provided amount of miliseconds.
 */
export function delay(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}
