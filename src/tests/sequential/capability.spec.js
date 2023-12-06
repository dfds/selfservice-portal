import { test } from "../base";
// @ts-check
const { expect } = require("@playwright/test");

test("join-capability-request", async ({ page, resetDb }) => {
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

test("join-capability-ce-force", async ({ page, resetDb }) => {
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

test("leave-capability", async ({ page, resetDb }) => {
  await page.goto(
    "http://localhost:3001/capabilities/marketing-department-xxx",
  );
  await page.getByRole("button", { name: "Join" }).click();
  await page.getByRole("button", { name: "FORCE JOIN (CE)" }).click();

  await page.waitForTimeout(1000);
  await page.goto(
    "http://localhost:3001/capabilities/marketing-department-xxx",
  );
  await page.getByRole("button", { name: "Leave" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Leave" }).click();
  await page.waitForTimeout(1000);
  await page.goto(
    "http://localhost:3001/capabilities/marketing-department-xxx",
  );

  await expect(page.getByRole("button", { name: "Join" })).toHaveCount(0, {
    timeout: 1000,
  });
});

test("approve-membership", async ({ page, resetDb }) => {
  await page.goto("http://localhost:3001/capabilities/cloudengineering-xxx");
  await page
    .getByRole("row", { name: "emwee@dfds.com emwee@dfds.com" })
    .getByRole("button")
    .click();
  await page.getByTitle("You have already submitted").isVisible();
  await page.getByTitle("You have already submitted").isDisabled();

  await page.goto("http://localhost:3001/capabilities/cloudengineering-xxx");

  await expect(
    page
      .getByRole("row", { name: "emwee@dfds.com emwee@dfds.com" })
      .getByRole("button"),
  ).toHaveCount(0, {
    timeout: 1000,
  });

  await page.waitForTimeout(500);
});

test("delete-capability", async ({ page, resetDb }) => {
  await page.goto("http://localhost:3001/capabilities/notmycapability-xx2");
  await page.getByRole("button", { name: "Join" }).click();
  await page.getByRole("button", { name: "FORCE JOIN (CE)" }).click();
  await page.getByRole("button", { name: "Delete Capability" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await page.getByText("Warning: Pending Deletion").isVisible();

  await page.waitForTimeout(500);
});

test("cancel-capability-deletion", async ({ page, resetDb }) => {
  await page.goto("http://localhost:3001/capabilities/notmycapability-xx3");
  await page.getByRole("button", { name: "Join" }).click();
  await page.getByRole("button", { name: "FORCE JOIN (CE)" }).click();
  await page.getByRole("button", { name: "Delete Capability" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await page.getByText("Warning: Pending Deletion").isVisible();

  await page.getByRole("button", { name: "Cancel Deletion" }).click();
  await page.getByRole("button", { name: "Delete Capability" }).isVisible();

  await page.waitForTimeout(500);
});

// getByTitle('You have already submitted')
