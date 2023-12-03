// @ts-check
const { test, expect } = require("@playwright/test");

test("join-capability-request", async ({ page }) => {
  await page.goto("http://localhost:3001/capabilities/cool-beans-xxx");
  await page.getByRole("button", { name: "Join" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3001/capabilities/cool-beans-xxx");
  let elem = await page.getByRole("heading", {
    name: "Membership Application",
  });
  await expect(elem).toBeVisible();
  await expect(elem).toHaveText("Membership Application Received");
});

test("join-capability-ce-force", async ({ page }) => {
  await page.goto("http://localhost:3001/capabilities/notmycapability-xx1");
  await page.getByRole("button", { name: "Join" }).click();
  await page.getByRole("button", { name: "FORCE JOIN (CE)" }).click();

  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3001/capabilities/notmycapability-xx1");
  await page.waitForTimeout(1000);
  await expect(page.getByRole("button", { name: "Join" })).toHaveCount(0, {
    timeout: 1000,
  });
});
