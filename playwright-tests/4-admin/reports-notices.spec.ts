import { test, expect } from "@playwright/test";

test.describe("Admin — Reports", () => {
  test("should render reports page", async ({ page }) => {
    await page.goto("/en/admin-panel/reports");
    await expect(page.getByTestId("admin-reports-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display report content or filters", async ({ page }) => {
    await page.goto("/en/admin-panel/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Reports page should have some interactive content
    const hasContent = await page
      .locator("table, [role='table'], button, select, [class*='card']")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});

test.describe("Admin — Notices", () => {
  test("should render notices page", async ({ page }) => {
    await page.goto("/en/admin-panel/notices");
    await expect(page.getByTestId("admin-notices-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display notices list or empty state", async ({ page }) => {
    await page.goto("/en/admin-panel/notices");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const hasContent = await page
      .locator(
        "table, [role='table'], button, [class*='empty'], [class*='card']"
      )
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
