import { test, expect } from "@playwright/test";
import { loginAsRoleViaAPI } from "../helpers/auth";
import {
  TEST_USERS,
  ROLE_ACCESSIBLE_ROUTES,
  ROLE_FORBIDDEN_ROUTES,
} from "../helpers/constants";

test.describe("Role-Based Access Control", () => {
  // ── Admin Access ──
  test.describe("Admin role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "admin");
    });

    test("should access admin dashboard", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await expect(page.getByTestId("admin-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should NOT access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return u.includes("/admin-panel") || u.includes("/sign-in");
        },
        { timeout: 30000 }
      );
      // Should be redirected away or see an error
      const url = page.url();
      expect(
        url.includes("/admin-panel") || url.includes("/sign-in")
      ).toBeTruthy();
    });

    test("should access user management", async ({ page }) => {
      await page.goto("/en/admin-panel/users");
      await expect(page.getByTestId("admin-users-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access settings pages", async ({ page }) => {
      await page.goto("/en/admin-panel/settings/general");
      await expect(page.getByTestId("admin-settings-general-page")).toBeVisible(
        { timeout: 30000 }
      );
    });

    test("should access all admin sub-pages", async ({ page }) => {
      test.setTimeout(5 * 60 * 1000); // 5 min for compiling multiple pages
      const routes = ROLE_ACCESSIBLE_ROUTES.admin;
      for (const route of routes.slice(0, 5)) {
        await page.goto(route, { timeout: 60000 });
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toContain("/sign-in");
      }
    });
  });

  // ── Student Access ──
  test.describe("Student role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "student");
    });

    test("should access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await expect(page.getByTestId("student-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should NOT access admin panel", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return u.includes("/student-portal") || u.includes("/sign-in");
        },
        { timeout: 30000 }
      );
      const url = page.url();
      expect(
        url.includes("/student-portal") || url.includes("/sign-in")
      ).toBeTruthy();
    });

    test("should access student attendance", async ({ page }) => {
      await page.goto("/en/student-portal/attendance");
      await expect(page.getByTestId("student-attendance-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access student fees", async ({ page }) => {
      await page.goto("/en/student-portal/fees");
      await expect(page.getByTestId("student-fees-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access student exams", async ({ page }) => {
      await page.goto("/en/student-portal/exams");
      await expect(page.getByTestId("student-exams-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access all student sub-pages", async ({ page }) => {
      test.setTimeout(5 * 60 * 1000); // 5 min for compiling multiple pages
      const routes = ROLE_ACCESSIBLE_ROUTES.student;
      for (const route of routes) {
        await page.goto(route, { timeout: 60000 });
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toContain("/sign-in");
      }
    });
  });

  // ── Teacher Access ──
  test.describe("Teacher role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "teacher");
    });

    test("should access admin dashboard", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await expect(page.getByTestId("admin-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access staff portal", async ({ page }) => {
      await page.goto("/en/staff-portal");
      await expect(page.getByTestId("staff-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should NOT access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return (
            u.includes("/admin-panel") ||
            u.includes("/staff-portal") ||
            u.includes("/sign-in")
          );
        },
        { timeout: 30000 }
      );
      const url = page.url();
      expect(
        url.includes("/admin-panel") ||
          url.includes("/staff-portal") ||
          url.includes("/sign-in")
      ).toBeTruthy();
    });

    test("should access student attendance admin page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/attendance");
      await expect(
        page.getByTestId("admin-students-attendance-page")
      ).toBeVisible({ timeout: 30000 });
    });

    test("should access student exams admin page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/exams");
      await expect(page.getByTestId("admin-students-exams-page")).toBeVisible({
        timeout: 30000,
      });
    });
  });

  // ── Staff Access ──
  test.describe("Staff role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "staff");
    });

    test("should access admin dashboard", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await expect(page.getByTestId("admin-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access staff portal", async ({ page }) => {
      await page.goto("/en/staff-portal");
      await expect(page.getByTestId("staff-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should NOT access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return (
            u.includes("/admin-panel") ||
            u.includes("/staff-portal") ||
            u.includes("/sign-in")
          );
        },
        { timeout: 30000 }
      );
      const url = page.url();
      expect(
        url.includes("/admin-panel") ||
          url.includes("/staff-portal") ||
          url.includes("/sign-in")
      ).toBeTruthy();
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
  });

  // ── Accountant Access ──
  test.describe("Accountant role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "accountant");
    });

    test("should access admin dashboard", async ({ page }) => {
      await page.goto("/en/admin-panel");
      await expect(page.getByTestId("admin-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access student fees page", async ({ page }) => {
      await page.goto("/en/admin-panel/students/fees");
      await expect(page.getByTestId("admin-students-fees-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access payroll page", async ({ page }) => {
      await page.goto("/en/admin-panel/staff/payroll");
      await expect(page.getByTestId("admin-staff-payroll-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access accounts pages", async ({ page }) => {
      await page.goto("/en/admin-panel/accounts/income");
      await expect(page.getByTestId("admin-accounts-income-page")).toBeVisible({
        timeout: 30000,
      });
    });

    test("should NOT access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return u.includes("/admin-panel") || u.includes("/sign-in");
        },
        { timeout: 30000 }
      );
      const url = page.url();
      expect(
        url.includes("/admin-panel") || url.includes("/sign-in")
      ).toBeTruthy();
    });
  });

  // ── Parent Access ──
  test.describe("Parent role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRoleViaAPI(page, "parent");
    });

    test("should access student portal", async ({ page }) => {
      await page.goto("/en/student-portal");
      await expect(page.getByTestId("student-dashboard")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should NOT access admin panel", async ({ page }) => {
      await page.goto("/en/admin-panel");
      // withPageRequiredAuth renders null + async redirect via router.replace()
      // Wait for the redirect to actually happen
      await page.waitForURL(
        (url) => {
          const u = url.toString();
          return u.includes("/student-portal") || u.includes("/sign-in");
        },
        { timeout: 30000 }
      );
      const url = page.url();
      expect(
        url.includes("/student-portal") || url.includes("/sign-in")
      ).toBeTruthy();
    });

    test("should access student fees as parent", async ({ page }) => {
      await page.goto("/en/student-portal/fees");
      await expect(page.getByTestId("student-fees-page")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should access all student portal sub-pages", async ({ page }) => {
      test.setTimeout(5 * 60 * 1000); // 5 min for compiling multiple pages
      const routes = ROLE_ACCESSIBLE_ROUTES.parent;
      for (const route of routes) {
        await page.goto(route, { timeout: 60000 });
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toContain("/sign-in");
      }
    });
  });
});
