import { test, expect } from "@playwright/test";

test.describe("Admin — Accounts", () => {
  test.describe("Income", () => {
    test("should render income page", async ({ page }) => {
      await page.goto("/en/admin-panel/accounts/income");
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("admin-accounts-income-page")).toBeVisible({
        timeout: 30000,
      });
    });

    test("should display income content", async ({ page }) => {
      await page.goto("/en/admin-panel/accounts/income");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const hasContent = await page
        .locator("table, [role='table'], button, [class*='empty']")
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Expenses", () => {
    test("should render expenses page", async ({ page }) => {
      await page.goto("/en/admin-panel/accounts/expenses");
      await expect(
        page.getByTestId("admin-accounts-expenses-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Financial Reports", () => {
    test("should render accounts reports page", async ({ page }) => {
      await page.goto("/en/admin-panel/accounts/reports");
      await expect(page.getByTestId("admin-accounts-reports-page")).toBeVisible(
        { timeout: 15000 }
      );
    });
  });
});
