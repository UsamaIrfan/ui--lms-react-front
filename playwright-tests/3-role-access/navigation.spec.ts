import { test, expect } from "@playwright/test";
import { loginAsRoleViaAPI } from "../helpers/auth";
import { ROLE_NAV_ITEMS } from "../helpers/constants";
import { navItemExists } from "../helpers/navigation";

test.describe("Sidebar Navigation Visibility", () => {
  test.describe("Admin sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "admin");
    });

    test("should show all admin nav items", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.admin) {
        const exists = await navItemExists(page, itemId);
        expect(exists, `Nav item "${itemId}" should be visible for admin`).toBe(
          true
        );
      }
    });

    test("should NOT show student-portal nav item", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      const hasStudentPortal = await navItemExists(page, "student-portal");
      expect(hasStudentPortal).toBe(false);
    });
  });

  test.describe("Student sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "student");
    });

    test("should show student portal nav items", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.student) {
        const exists = await navItemExists(page, itemId);
        expect(
          exists,
          `Nav item "${itemId}" should be visible for student`
        ).toBe(true);
      }
    });

    test("should NOT show admin nav items", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      const hasAdminDashboard = await navItemExists(page, "admin-dashboard");
      expect(hasAdminDashboard).toBe(false);
    });
  });

  test.describe("Teacher sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "teacher");
    });

    test("should show teacher-visible nav items", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.teacher) {
        const exists = await navItemExists(page, itemId);
        expect(
          exists,
          `Nav item "${itemId}" should be visible for teacher`
        ).toBe(true);
      }
    });
  });

  test.describe("Staff sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "staff");
    });

    test("should show staff-visible nav items", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.staff) {
        const exists = await navItemExists(page, itemId);
        expect(exists, `Nav item "${itemId}" should be visible for staff`).toBe(
          true
        );
      }
    });
  });

  test.describe("Accountant sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "accountant");
    });

    test("should show accountant-visible nav items", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.accountant) {
        const exists = await navItemExists(page, itemId);
        expect(
          exists,
          `Nav item "${itemId}" should be visible for accountant`
        ).toBe(true);
      }
    });
  });

  test.describe("Parent sidebar", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "parent");
    });

    test("should show parent-visible nav items (same as student portal)", async ({
      page,
    }) => {
      await page.goto("/en/student-portal");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      for (const itemId of ROLE_NAV_ITEMS.parent) {
        const exists = await navItemExists(page, itemId);
        expect(
          exists,
          `Nav item "${itemId}" should be visible for parent`
        ).toBe(true);
      }
    });
  });
});
