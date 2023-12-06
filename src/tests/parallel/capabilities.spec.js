import { test } from "../base";

// @ts-check
const { expect } = require("@playwright/test");

const testUserName00 = "Hristiyana Toteva hritote@";
const testUserSearchQuery00 = "Hristi";
const testUserName01 = "Paul Seghers pausegh@";
const testUserSearchQuery01 = "Paul Segh";

test("create-capability", async ({ page }) => {
  const capabilityName = `e2e${Date.now()}`;

  await page.goto("http://localhost:3001/capabilities");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByPlaceholder("Enter name of capability").click();
  await page.getByPlaceholder("Enter name of capability").fill(capabilityName);
  await page.getByPlaceholder("Enter a description").click();
  await page.getByPlaceholder("Enter a description").fill("new cap");

  await page.getByRole("button", { name: "Add" }).first().click();

  await page.waitForTimeout(2000);
  await page.goto("http://localhost:3001/capabilities");
  let capElem = await page.getByText(capabilityName);
  await expect(capElem).toBeVisible();
});

test("create-capability-with-invitees", async ({ page }) => {
  const capabilityName = `e2e${Date.now()}`;

  await page.goto("http://localhost:3001/capabilities");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByPlaceholder("Enter name of capability").click();
  await page.getByPlaceholder("Enter name of capability").fill(capabilityName);
  await page.getByPlaceholder("Enter a description").click();
  await page.getByPlaceholder("Enter a description").fill("new cap");

  // Invite user
  await page.waitForTimeout(1000);
  await page.getByPlaceholder("Enter user name").click();
  await page.getByPlaceholder("Enter user name").fill(testUserSearchQuery00);
  await page.getByText(testUserName00).click();
  await page.getByPlaceholder("Enter user name").click();
  await page.getByPlaceholder("Enter user name").fill(testUserSearchQuery01);
  await page.getByText(testUserName01).click();
  // Remove invitee
  await page
    .locator("_react=Invitations")
    .getByText("hritote")
    .dispatchEvent("click");

  await page.getByPlaceholder("Enter user name").click();
  await page.getByPlaceholder("Enter user name").fill(testUserSearchQuery00);
  await page.getByText(testUserName00).click();

  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: "Add" }).first().click();

  await page.waitForTimeout(2000);
  await page.goto("http://localhost:3001/capabilities");
  let capElem = await page.getByText(capabilityName);
  await expect(capElem).toBeVisible();
});
