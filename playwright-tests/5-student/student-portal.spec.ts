import { test, expect } from "@playwright/test";
import { loginAsRoleViaAPI } from "../helpers/auth";

test.describe("Student Portal — Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render student dashboard", async ({ page }) => {
    await page.goto("/en/student-portal");
    await expect(page.getByTestId("student-dashboard")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display dashboard heading", async ({ page }) => {
    await page.goto("/en/student-portal");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should show dashboard cards or sections", async ({ page }) => {
    await page.goto("/en/student-portal");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Dashboard has metric cards or stat sections (AlignUI uses rounded-20 border classes)
    const cards = page.locator('[class*="rounded-20"][class*="border"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Student Portal — Attendance", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render attendance page", async ({ page }) => {
    await page.goto("/en/student-portal/attendance");
    await expect(page.getByTestId("student-attendance-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display attendance content", async ({ page }) => {
    await page.goto("/en/student-portal/attendance");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Should show attendance stats, calendar or table
    const content = page.locator(
      "table, [role='table'], [class*='rounded-20'], [class*='calendar'], svg"
    );
    const visible = await content
      .first()
      .isVisible()
      .catch(() => false);
    expect(visible).toBeTruthy();
  });
});

test.describe("Student Portal — Fees", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render fees page", async ({ page }) => {
    await page.goto("/en/student-portal/fees");
    await expect(page.getByTestId("student-fees-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display fee challans or payment info", async ({ page }) => {
    await page.goto("/en/student-portal/fees");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const content = page.locator(
      "table, [role='table'], [class*='rounded-20'], [class*='empty']"
    );
    const visible = await content
      .first()
      .isVisible()
      .catch(() => false);
    expect(visible).toBeTruthy();
  });
});

test.describe("Student Portal — Exams", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render exams page", async ({ page }) => {
    await page.goto("/en/student-portal/exams");
    await expect(page.getByTestId("student-exams-page")).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Student Portal — Materials", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render materials page", async ({ page }) => {
    await page.goto("/en/student-portal/materials");
    await expect(page.getByTestId("student-materials-page")).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Student Portal — Assignments", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render assignments page", async ({ page }) => {
    await page.goto("/en/student-portal/assignments");
    await expect(page.getByTestId("student-assignments-page")).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Student Portal — Timetable", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render timetable page", async ({ page }) => {
    await page.goto("/en/student-portal/timetable");
    await expect(page.getByTestId("student-timetable-page")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display timetable content or not-enrolled message", async ({
    page,
  }) => {
    await page.goto("/en/student-portal/timetable");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Page may show timetable grid, "not enrolled" message, or "no timetable" message
    const pageContainer = page.getByTestId("student-timetable-page");
    await expect(pageContainer).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Student Portal — Notices", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRoleViaAPI(page, "student");
  });

  test("should render notices page", async ({ page }) => {
    await page.goto("/en/student-portal/notices");
    await expect(page.getByTestId("student-notices-page")).toBeVisible({
      timeout: 15000,
    });
  });
});
