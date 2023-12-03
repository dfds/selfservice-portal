import * as OTPAuth from "otpauth";

// @ts-check
const { test, expect } = require("@playwright/test");

test("hello-text", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  await expect(page.locator("#root")).toContainText(
    "Hello Emil Carlsen, and welcome to the Developer Portal.",
  );
});

test("menu-profile-name", async ({ page }) => {
  await page.goto("http://localhost:3001/");

  await page.waitForTimeout(1000);

  await page.locator("_react=AppBarItem").click();
  await expect(page.locator("_react=AppBarItem")).toContainText("Emil Carlsen");
});

// test("menu-user-menu", async ({ page }) => {
//   await page.locator(".css-xmuwz2-overlay-overlay-menuCategoryStyles").click();
//   await expect(page.locator("#profile")).toContainText("Emil Carlsen");
// });
