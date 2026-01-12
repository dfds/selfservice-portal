import { Mutex } from "async-mutex";

// @ts-check
const { test: base, expect } = require("@playwright/test");

const baseUrl = "http://localhost:8045";

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function isToolApiAvailable(request) {
  try {
    await request.get(`${baseUrl}/xaxa`);
  } catch (error) {
    console.log(
      "Tool API unavailable. Falling back to no database reset and no mutex",
    );
    return false;
  }

  console.log("Tool API available. Enabling database reset and mutex");
  return true;
}

export const test = base.extend({
  resetDb: async ({ request, page }, use) => {
    let toolAvailable = await isToolApiAvailable(request);
    if (!toolAvailable) {
      await use(null);
      return;
    }

    let retry = true;
    do {
      try {
        let resp = await request.get(`${baseUrl}/test/lock`);
        if (resp.status() === 200) {
          retry = false;
        } else {
          await delay(1000);
        }
      } catch (error) {
        // console.log(error.message.includes("ECONNREFUSED"));
        retry = true;
        await delay(1000);
      }
    } while (retry);

    await request.get(`${baseUrl}/db/reset`);
    await use(null);
    await request.get(`${baseUrl}/db/reset`);
    await request.get(`${baseUrl}/test/unlock`);
  },
});

export default test;
