import { Mutex } from "async-mutex";

// @ts-check
const { test: base, expect } = require("@playwright/test");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const test = base.extend({
  resetDb: async ({ request }, use) => {
    let retry = true;
    do {
      try {
        let resp = await request.get("http://localhost:8045/test/lock");
        if (resp.status() === 200) {
          retry = false;
        } else {
          await delay(1000);
        }
      } catch {
        retry = true;
        await delay(1000);
      }
    } while (retry);

    await request.get("http://localhost:8045/db/reset");
    await use(null);
    await request.get("http://localhost:8045/db/reset");
    await request.get("http://localhost:8045/test/unlock");
  },
});

export default test;
