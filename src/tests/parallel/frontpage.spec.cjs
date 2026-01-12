// @ts-check
const { test, expect } = require("@playwright/test");

test("hello-text", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  await expect(page.locator("#welcome-content")).toContainText(
    "Hello Emil Carlsen, and welcome to the Developer Portal.",
  );
});

test("menu-profile-name", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  await page.waitForTimeout(3000);

  await page.locator("_react=AppBarItem").click();
  await expect(page.locator("_react=AppBarItem")).toContainText("Emil Carlsen");
});
