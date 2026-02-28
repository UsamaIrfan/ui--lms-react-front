import { test, expect } from "@playwright/test";
import { loginAsRoleViaAPI } from "../helpers/auth";

test.describe("Staff Portal — Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "staff");
  });

  test("should render staff dashboard", async ({ page }) => {
    await page.goto("/en/staff-portal");
    await expect(page.getByTestId("staff-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display dashboard heading", async ({ page }) => {
    await page.goto("/en/staff-portal");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should show dashboard cards or sections", async ({ page }) => {
    await page.goto("/en/staff-portal");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Staff portal uses AlignUI Card components (rounded-20 border classes)
    const cards = page.locator('[class*="rounded-20"][class*="border"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Staff Portal — Teacher Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "teacher");
  });

  test("should render staff dashboard for teacher", async ({ page }) => {
    await page.goto("/en/staff-portal");
    await expect(page.getByTestId("staff-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access admin panel as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel");
    await expect(page.getByTestId("admin-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student attendance as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel/students/attendance");
    await expect(
      page.getByTestId("admin-students-attendance-page")
    ).toBeVisible({ timeout: 15000 });
  });

  test("should access student exams as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel/students/exams");
    await expect(page.getByTestId("admin-students-exams-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student materials as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel/students/materials");
    await expect(page.getByTestId("admin-students-materials-page")).toBeVisible(
      { timeout: 15000 }
    );
  });

  test("should access timetable as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel/staff/timetable");
    await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access notices as teacher", async ({ page }) => {
    await page.goto("/en/admin-panel/notices");
    await expect(page.getByTestId("admin-notices-page")).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Staff Portal — Staff Role Admin Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "staff");
  });

  test("should not render admin-only staff management content", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/staff");
    // Staff management page requires ADMIN role — staff users see blank or get redirected
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
    // Either redirected away OR the admin-staff-page testid is not visible
    const isStaffPageVisible = await page
      .getByTestId("admin-staff-page")
      .isVisible()
      .catch(() => false);
    expect(isStaffPageVisible).toBeFalsy();
  });

  test("should access staff attendance admin page", async ({ page }) => {
    await page.goto("/en/admin-panel/staff/attendance");
    await expect(page.getByTestId("admin-staff-attendance-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access staff leaves admin page", async ({ page }) => {
    await page.goto("/en/admin-panel/staff/leaves");
    await expect(page.getByTestId("admin-staff-leaves-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student enquiries as staff", async ({ page }) => {
    await page.goto("/en/admin-panel/students/enquiries");
    await expect(page.getByTestId("admin-students-enquiries-page")).toBeVisible(
      { timeout: 15000 }
    );
  });

  test("should access student registrations as staff", async ({ page }) => {
    await page.goto("/en/admin-panel/students/registrations");
    await expect(
      page.getByTestId("admin-students-registrations-page")
    ).toBeVisible({ timeout: 15000 });
  });

  test("should access reports as staff", async ({ page }) => {
    await page.goto("/en/admin-panel/reports");
    await expect(page.getByTestId("admin-reports-page")).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Staff Portal — Accountant Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "accountant");
  });

  test("should access admin dashboard as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel");
    await expect(page.getByTestId("admin-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access student fees as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/students/fees");
    await expect(page.getByTestId("admin-students-fees-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access payroll as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/staff/payroll");
    await expect(page.getByTestId("admin-staff-payroll-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access income as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/accounts/income");
    await expect(page.getByTestId("admin-accounts-income-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access expenses as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/accounts/expenses");
    await expect(page.getByTestId("admin-accounts-expenses-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access financial reports as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/accounts/reports");
    await expect(page.getByTestId("admin-accounts-reports-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should access reports as accountant", async ({ page }) => {
    await page.goto("/en/admin-panel/reports");
    await expect(page.getByTestId("admin-reports-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should NOT access staff portal as accountant", async ({ page }) => {
    await page.goto("/en/staff-portal");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(
      url.includes("/admin-panel") || url.includes("/sign-in")
    ).toBeTruthy();
  });
});
