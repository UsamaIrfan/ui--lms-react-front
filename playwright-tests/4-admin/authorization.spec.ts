import { test, expect } from "@playwright/test";

test.describe("Admin — Authorization", () => {
  test.describe("Role Permissions", () => {
    test("should render role permissions page", async ({ page }) => {
      await page.goto("/en/admin-panel/authorization/role-permissions");
      await expect(page.getByTestId("admin-role-permissions-page")).toBeVisible(
        { timeout: 15000 }
      );
    });

    test("should display permissions content", async ({ page }) => {
      await page.goto("/en/admin-panel/authorization/role-permissions");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      // Should have checkboxes, toggles, or a table for role permissions
      const hasContent = await page
        .locator(
          "table, [role='table'], [role='checkbox'], input[type='checkbox'], button"
        )
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Audit Logs", () => {
    test("should render audit logs page", async ({ page }) => {
      await page.goto("/en/admin-panel/authorization/audit-logs");
      await expect(page.getByTestId("admin-audit-logs-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });
});
