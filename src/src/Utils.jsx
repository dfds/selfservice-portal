/**
 * Delays execution by a number of miliseconds.
 * @param {number} duration Amount of delay in miliseconds.
 * @returns An awaitable promise that gets resolved after the provided amount of miliseconds.
 */
export function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function isValidURL(urlString) {
  const urlRegex = /^(?:https?:\/\/)/;
  return urlRegex.test(urlString);
}

export function composeUrl(...args) {
  let url = window.apiBaseUrl;
  (args || []).forEach((x) => {
    if (x[0] === "/") {
      url += x;
    } else {
      url += "/" + x;
    }
  });
  return url;
}

/**
 *
 * @param {string[]} segments
 * @returns
 */
export function composeSegmentsUrl(segments) {
  let url = window.apiBaseUrl;
  (segments || []).forEach((x) => {
    if (x[0] === "/") {
      url += x;
    } else {
      url += "/" + x;
    }
  });
  return url;
}

export function shallowEqual(object1, object2) {
  try {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
