import { test, expect } from "@playwright/test";

test.describe("Admin — Students Management", () => {
  test.describe("Student Registrations", () => {
    test("should render registrations page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/registrations");
      await expect(
        page.getByTestId("admin-students-registrations-page")
      ).toBeVisible({ timeout: 15000 });
    });

    test("should display registrations table or content", async ({ page }) => {
      await page.goto("/en/admin-panel/students/registrations");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      // Should have table or cards or empty state
      const hasContent = await page
        .locator("table, [role='table'], button, [class*='empty']")
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Admission Enquiries", () => {
    test("should render enquiries page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/enquiries");
      await expect(
        page.getByTestId("admin-students-enquiries-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Student Attendance", () => {
    test("should render attendance page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/attendance");
      await expect(
        page.getByTestId("admin-students-attendance-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Student Fees", () => {
    test("should render fees page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/fees");
      await expect(page.getByTestId("admin-students-fees-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Student Exams", () => {
    test("should render exams page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/exams");
      await expect(page.getByTestId("admin-students-exams-page")).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Student Materials", () => {
    test("should render materials page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/materials");
      await expect(
        page.getByTestId("admin-students-materials-page")
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
