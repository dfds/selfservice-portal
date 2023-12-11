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

export function removeNonRequiredJsonSchemaProperties(jsonSchemaString) {
  const jsonSchemaCopy = JSON.parse(jsonSchemaString);
  let newProperties = JSON.parse("{}");
  if (jsonSchemaCopy.required) {
    jsonSchemaCopy.required.forEach((requiredProperty) => {
      newProperties[requiredProperty] =
        jsonSchemaCopy.properties[requiredProperty];
    });
    jsonSchemaCopy.properties = newProperties;
  }
  return JSON.stringify(jsonSchemaCopy, null, 2);
}
