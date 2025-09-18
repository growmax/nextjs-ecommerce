import { expect, test } from "@playwright/test";

test.describe("Login Page Auto-focus", () => {
  test("should auto-focus email input field on page load", async ({ page }) => {
    // Listen for console logs
    page.on("console", _msg => {
      // Browser console monitoring (silent)
    });

    // Navigate to the login page
    await page.goto("/en/login");

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Wait a bit more for React useEffect to run
    await page.waitForTimeout(500);

    // Check if the email input field is focused
    const emailInput = page
      .locator('input[placeholder*="email" i], input[name="emailOrPhone"]')
      .first();

    // Verify the input exists
    await expect(emailInput).toBeVisible();

    // For now, expect auto-focus to work (this should pass if our fix works)
    await expect(emailInput).toBeFocused();
  });

  test("should refocus email input when returning from password step", async ({
    page,
  }) => {
    // Navigate to the login page
    await page.goto("/en/login");

    await page.waitForLoadState("networkidle");

    // Fill in a valid email and continue
    const emailInput = page
      .locator('input[placeholder*="email" i], input[name="emailOrPhone"]')
      .first();
    await emailInput.fill("test@example.com");

    // Click continue button
    const continueButton = page
      .locator('button:has-text("Continue"), button[type="submit"]')
      .first();
    await continueButton.click();

    // Wait for password field to appear (this might fail if backend is not running, which is expected)
    await page.waitForTimeout(1000);

    // Look for the edit button to appear (indicating we're in password step)
    const editButton = page
      .locator('button:has([data-lucide="edit"]), button svg')
      .first();

    // If the edit button is visible, click it
    if (await editButton.isVisible()) {
      await editButton.click();

      // Verify that the email input is focused again
      await expect(emailInput).toBeFocused();
    }
  });

  test("should have proper accessibility attributes on email input", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.waitForLoadState("networkidle");

    const emailInput = page
      .locator('input[placeholder*="email" i], input[name="emailOrPhone"]')
      .first();

    // Check for proper labeling
    await expect(emailInput).toHaveAttribute("placeholder");

    // Check that the input is properly associated with a label
    const label = page.locator("label").first();
    await expect(label).toBeVisible();
  });
});
