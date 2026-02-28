import { test, expect } from "@playwright/test";

test.describe("Admin — Staff Management", () => {
  test.describe("Staff List", () => {
    test("should render staff list page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff");
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("admin-staff-page")).toBeVisible({
        timeout: 30000,
      });
    });

    test("should display staff table or content", async ({ page }) => {
      await page.goto("/en/admin-panel/staff");
      await page.waitForLoadState("networkidle");
      // Wait for the page component to render (auth HOC + data loading)
      await expect(page.getByTestId("admin-staff-page")).toBeVisible({
        timeout: 30000,
      });

      const hasContent = await page
        .locator("table, [role='table'], button, [class*='empty']")
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Staff Attendance", () => {
    test("should render staff attendance page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff/attendance");
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("admin-staff-attendance-page")).toBeVisible(
        { timeout: 30000 }
      );
    });
  });

  test.describe("Staff Leaves", () => {
    test("should render staff leaves page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff/leaves");
      await expect(page.getByTestId("admin-staff-leaves-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Staff Payroll", () => {
    test("should render payroll page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff/payroll");
      await expect(page.getByTestId("admin-staff-payroll-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Staff Timetable", () => {
    test("should render timetable page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff/timetable");
      await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });
});
