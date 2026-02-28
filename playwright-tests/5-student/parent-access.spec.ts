import { test, expect } from "@playwright/test";
import { loginAsRoleViaAPI } from "../helpers/auth";

test.describe("Parent Portal Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "parent");
  });

  test("should access student portal dashboard as parent", async ({ page }) => {
    await page.goto("/en/student-portal");
    await expect(page.getByTestId("student-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student attendance as parent", async ({ page }) => {
    await page.goto("/en/student-portal/attendance");
    await expect(page.getByTestId("student-attendance-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student fees as parent", async ({ page }) => {
    await page.goto("/en/student-portal/fees");
    await expect(page.getByTestId("student-fees-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student exams as parent", async ({ page }) => {
    await page.goto("/en/student-portal/exams");
    await expect(page.getByTestId("student-exams-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student materials as parent", async ({ page }) => {
    await page.goto("/en/student-portal/materials");
    await expect(page.getByTestId("student-materials-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student assignments as parent", async ({ page }) => {
    await page.goto("/en/student-portal/assignments");
    await expect(page.getByTestId("student-assignments-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student timetable as parent", async ({ page }) => {
    await page.goto("/en/student-portal/timetable");
    await expect(page.getByTestId("student-timetable-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student notices as parent", async ({ page }) => {
    await page.goto("/en/student-portal/notices");
    await expect(page.getByTestId("student-notices-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should NOT access admin panel as parent", async ({ page }) => {
    await page.goto("/en/admin-panel");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(
      url.includes("/student-portal") || url.includes("/sign-in")
    ).toBeTruthy();
  });
});
