import * as OTPAuth from "otpauth";

// @ts-check
const { test, expect, chromium } = require("@playwright/test");

const authFile = "playwright/.auth/user.json";

export default async function globalSetup(config) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Setting up global auth. This may take a few seconds.");

  await page.goto("http://localhost:3001/");

  await page.getByPlaceholder("someone@dfds.com").click();
  await page
    .getByPlaceholder("someone@dfds.com")
    .fill(process.env.E2E_TEST_USER_EMAIL);
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByPlaceholder("Password").click();
  await page
    .getByPlaceholder("Password")
    .fill(process.env.E2E_TEST_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // generate OTP code
  let parsedTotp = OTPAuth.URI.parse(process.env.E2E_TEST_USER_MFA_URL);
  let code = parsedTotp.generate();

  await page.waitForTimeout(3000);
  let requiresMfa = await page.getByPlaceholder("Code").isVisible();

  if (requiresMfa) {
    console.log("MFA detected");
    await page.getByPlaceholder("Code").click();
    await page.getByPlaceholder("Code").fill(code);
    await page.getByRole("button", { name: "Verify" }).click();
  }

  await page.waitForTimeout(6000);
  await page.reload();
  await page.waitForTimeout(6000);

  await expect(page.locator("#root")).toContainText(
    "Hello Emil Carlsen, and welcome to the Developer Portal.",
  );

  await page.context().storageState({ path: authFile });
  await browser.close();
  console.log("Global auth configured.");
}
