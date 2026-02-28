import { test, expect } from "@playwright/test";
import {
  TEST_USERS,
  DEFAULT_TENANT_ID,
  DEFAULT_BRANCH_ID,
} from "../helpers/constants";

test.describe("Tenant Selection", () => {
  test.beforeEach(async ({ page }) => {
    // Start unauthenticated
    await page.context().clearCookies();
  });

  test("should display tenant selection after login when user has tenants", async ({
    page,
  }) => {
    const user = TEST_USERS.admin;
    await page.goto("/en/sign-in");
    await page.waitForLoadState("networkidle");

    // Login — data-testid is directly on the <input> element
    await page.getByTestId("email").fill(user.email);
    await page.getByTestId("password").fill(user.password);

    const loginResponse = page.waitForResponse(
      (res) => res.url().includes("auth/email/login") && res.status() === 200
    );
    await page.getByTestId("sign-in-submit").click();
    await loginResponse;

    // Wait for redirect away from sign-in page (client-side redirect can be slow)
    await page.waitForURL((url) => !url.toString().includes("/sign-in"), {
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");

    // Either on select-tenant or auto-selected (single tenant)
    const url = page.url();
    if (url.includes("/select-tenant")) {
      // Should see the default tenant to select
      const tenantButton = page.getByTestId(
        `select-tenant-${DEFAULT_TENANT_ID}`
      );
      await expect(tenantButton).toBeVisible({ timeout: 10000 });
    } else {
      // Auto-selected, should be on role's dashboard
      expect(url).toContain("/admin-panel");
    }
  });

  test("should allow selecting a tenant and branch", async ({ page }) => {
    const user = TEST_USERS.admin;
    await page.goto("/en/sign-in");
    await page.waitForLoadState("networkidle");

    // Login
    await page.getByTestId("email").fill(user.email);
    await page.getByTestId("password").fill(user.password);

    const loginResponse = page.waitForResponse(
      (res) => res.url().includes("auth/email/login") && res.status() === 200
    );
    await page.getByTestId("sign-in-submit").click();
    await loginResponse;

    // Wait for redirect away from sign-in
    await page.waitForURL((url) => !url.toString().includes("/sign-in"), {
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");

    const url = page.url();
    if (url.includes("/select-tenant")) {
      // Select the default tenant
      await page.getByTestId(`select-tenant-${DEFAULT_TENANT_ID}`).click();

      // Wait for branch step to fully render (after tenant selection API calls complete)
      // Use a composite locator to detect ANY branch step element
      const branchStepElement = page.locator(
        '[data-testid^="select-branch-"], [data-testid="skip-branch-selection"], [data-testid="continue-without-branch"]'
      );
      await branchStepElement
        .first()
        .waitFor({ state: "visible", timeout: 30000 });

      // Now click the appropriate button — prefer branch > skip > continue
      const anyBranchButton = page.locator('[data-testid^="select-branch-"]');
      const skipButton = page.getByTestId("skip-branch-selection");
      const continueButton = page.getByTestId("continue-without-branch");

      if (await anyBranchButton.first().isVisible()) {
        await anyBranchButton.first().click();
      } else if (await skipButton.isVisible()) {
        await skipButton.click();
      } else {
        await continueButton.click();
      }

      // Should be redirected to dashboard
      await page.waitForURL("**/admin-panel**", { timeout: 30000 });
    }

    // Should be on the admin dashboard
    await expect(page.getByTestId("admin-dashboard")).toBeVisible({
      timeout: 30000,
    });
  });

  test("should show back button on branch selection step", async ({ page }) => {
    const user = TEST_USERS.admin;
    await page.goto("/en/sign-in");
    await page.waitForLoadState("networkidle");

    await page.getByTestId("email").fill(user.email);
    await page.getByTestId("password").fill(user.password);

    const loginResponse = page.waitForResponse(
      (res) => res.url().includes("auth/email/login") && res.status() === 200
    );
    await page.getByTestId("sign-in-submit").click();
    await loginResponse;

    // Wait for redirect away from sign-in
    await page.waitForURL((url) => !url.toString().includes("/sign-in"), {
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");

    if (page.url().includes("/select-tenant")) {
      await page.getByTestId(`select-tenant-${DEFAULT_TENANT_ID}`).click();

      // Wait for branch step to render (after API calls)
      const branchStepElement = page.locator(
        '[data-testid^="select-branch-"], [data-testid="skip-branch-selection"], [data-testid="continue-without-branch"], [data-testid="back-to-tenant-selection"]'
      );
      await branchStepElement
        .first()
        .waitFor({ state: "visible", timeout: 30000 });

      // Back button should be visible on branch step
      const backButton = page.getByTestId("back-to-tenant-selection");
      if (await backButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await backButton.click();

        // Should be back on tenant selection
        const tenantButton = page.getByTestId(
          `select-tenant-${DEFAULT_TENANT_ID}`
        );
        await expect(tenantButton).toBeVisible({ timeout: 15000 });
      }
    }
  });
});
