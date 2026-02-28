import { test, expect } from "@playwright/test";

test.describe("Admin — Settings", () => {
  test.describe("Settings Overview", () => {
    test("should render settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings");
      await expect(page.getByTestId("admin-settings-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("General Settings", () => {
    test("should render general settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/general");
      await expect(page.getByTestId("admin-settings-general-page")).toBeVisible(
        { timeout: 15000 }
      );
    });

    test("should display settings form", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/general");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const hasForm = await page
        .locator("form, input, [role='combobox'], select")
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasForm).toBeTruthy();
    });
  });

  test.describe("Tenant Settings", () => {
    test("should render tenants settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/tenants");
      await expect(page.getByTestId("admin-settings-tenants-page")).toBeVisible(
        { timeout: 15000 }
      );
    });
  });

  test.describe("Branch Settings", () => {
    test("should render branches settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/branches");
      await expect(
        page.getByTestId("admin-settings-branches-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Fee Settings", () => {
    test("should render fees settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/fees");
      await expect(page.getByTestId("admin-settings-fees-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Attendance Settings", () => {
    test("should render attendance settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/attendance");
      await expect(
        page.getByTestId("admin-settings-attendance-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Notification Settings", () => {
    test("should render notifications settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/notifications");
      await expect(
        page.getByTestId("admin-settings-notifications-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Invitation Settings", () => {
    test("should render invitations settings page", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/invitations");
      await expect(
        page.getByTestId("admin-settings-invitations-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
