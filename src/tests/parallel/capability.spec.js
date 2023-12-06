// @ts-check
const { test, expect } = require("@playwright/test");

test("invite-member", async ({ page }) => {
  await page.goto("http://localhost:3001/capabilities/cloudengineering-xxx");
  await page.getByPlaceholder("Enter user name").click();
  await page.getByPlaceholder("Enter user name").fill("Richard f");
  await page.getByText("Richard Fisher rifis@dfds.com").click();
  await page.locator("_react=Invitations").getByText("rifis").isVisible();
  await page.getByRole("button", { name: "Invite" }).click();

  await expect(page.getByRole("button", { name: "Success" })).toBeVisible();
  await expect(
    page.locator("_react=Invitations").getByText("rifis"),
  ).toHaveCount(0, {
    timeout: 1000,
  });

  await page.waitForTimeout(500);
});
