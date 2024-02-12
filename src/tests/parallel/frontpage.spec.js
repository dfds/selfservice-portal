// @ts-check
const { test, expect } = require("@playwright/test");

const profileFullName = "Emil Carlsen";

test("hello-text", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  let elem = await page.getByText(
    `Hello ${profileFullName}, and welcome to the Developer Portal`,
  );
  await expect(elem).toContainText(profileFullName);
});

test("menu-profile-name", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  await page.waitForTimeout(3000);

  await page.locator("_react=AppBarItem").click();
  await expect(page.locator("_react=AppBarItem")).toContainText("Emil Carlsen");
});
