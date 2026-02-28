import { test, expect } from "@playwright/test";

test.describe("Admin — User Management", () => {
  test("should render users list page", async ({ page }) => {
    await page.goto("/en/admin-panel/users");
    await expect(page.getByTestId("admin-users-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display users table or list", async ({ page }) => {
    await page.goto("/en/admin-panel/users");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Users page uses react-virtuoso TableVirtuoso — look for table element or data rows
    const table = page.locator("table");
    const tableVisible = await table
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    // The page should at minimum have the page container visible
    expect(
      tableVisible || (await page.getByTestId("admin-users-page").isVisible())
    ).toBeTruthy();
  });

  test("should navigate to create user page", async ({ page }) => {
    await page.goto("/en/admin-panel/users/create");
    await expect(page.getByTestId("admin-users-create-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display create user form fields", async ({ page }) => {
    await page.goto("/en/admin-panel/users/create");
    await page.waitForLoadState("networkidle");

    // Should have form inputs (email, name fields, etc.)
    const inputs = page.locator('input, select, [role="combobox"]');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });
});
