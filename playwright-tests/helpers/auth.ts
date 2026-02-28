import { Page, request, expect } from "@playwright/test";
import {
  API_URL,
  DEFAULT_TENANT_ID,
  DEFAULT_BRANCH_ID,
  TEST_USERS,
  type TestUser,
} from "./constants";

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────

/**
 * Log in via API and return { token, user }
 */
export async function apiLogin(
  email: string,
  password: string
): Promise<{ token: string; refreshToken: string; user: any }> {
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/v1/auth/email/login`, {
    data: { email, password },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body;
}

/**
 * Select a tenant after login (returns new token set with tenant context)
 */
export async function apiSelectTenant(
  token: string,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<{ token: string; refreshToken: string; user: any }> {
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/v1/auth/tenant/select`, {
    data: { tenantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  return await res.json();
}

// ─────────────────────────────────────────────
// Browser helpers
// ─────────────────────────────────────────────

/**
 * Log in as a specific role in the browser and handle tenant selection.
 * After this function completes, the page should be on the role's default dashboard.
 */
export async function loginAsRole(
  page: Page,
  role: keyof typeof TEST_USERS
): Promise<void> {
  const user = TEST_USERS[role];
  await page.goto("/en/sign-in");
  await page.waitForLoadState("networkidle");

  // Fill login form — data-testid is directly on the <input> element
  await page.getByTestId("email").fill(user.email);
  await page.getByTestId("password").fill(user.password);

  // Submit and wait for login API response
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes("auth/email/login") && res.status() === 200
  );
  await page.getByTestId("sign-in-submit").click();
  await loginResponse;

  // Handle tenant selection if redirected there
  await handleTenantSelection(page);

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");
}

/**
 * Handle tenant selection page if it appears
 */
async function handleTenantSelection(page: Page): Promise<void> {
  // Wait a bit for any redirects to settle
  await page.waitForTimeout(1000);

  const currentUrl = page.url();

  // If we're on the tenant selection page, handle it
  if (currentUrl.includes("/select-tenant")) {
    // Click the default tenant
    const tenantButton = page.getByTestId(`select-tenant-${DEFAULT_TENANT_ID}`);
    if (await tenantButton.isVisible({ timeout: 5000 })) {
      await tenantButton.click();

      // Wait for branch step or navigation
      await page.waitForTimeout(500);

      // If branch selection is showing, select the default branch
      const branchButton = page.getByTestId(
        `select-branch-${DEFAULT_BRANCH_ID}`
      );
      const skipButton = page.getByTestId("skip-branch-selection");
      const continueButton = page.getByTestId("continue-without-branch");

      if (await branchButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await branchButton.click();
      } else if (
        await skipButton.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await skipButton.click();
      } else if (
        await continueButton.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await continueButton.click();
      }
    }
  } else if (currentUrl.includes("/sign-in")) {
    // Still on sign-in, the login might auto-select tenant.
    // Wait a bit more for redirect
    await page.waitForTimeout(2000);
  }
}

/**
 * Log out the current user
 */
export async function logout(page: Page): Promise<void> {
  await page.getByTestId("user-menu").click();
  await page.getByTestId("logout-menu-item").click();
  await page.waitForURL("**/sign-in**", { timeout: 10000 });
}

/**
 * Login as a role using the API and set cookies directly (faster auth).
 * This stores the auth token as a cookie so pages can be accessed directly.
 */
export async function loginAsRoleViaAPI(
  page: Page,
  role: keyof typeof TEST_USERS
): Promise<void> {
  const user = TEST_USERS[role];

  // Login via API
  const loginResult = await apiLogin(user.email, user.password);

  // Select tenant via API
  const tenantResult = await apiSelectTenant(loginResult.token);

  // Set auth cookie in the browser (matching what the app stores)
  const tokenData = JSON.stringify({
    token: tenantResult.token,
    refreshToken: tenantResult.refreshToken,
    user: tenantResult.user,
  });

  await page.context().addCookies([
    {
      name: "auth-token-data",
      value: encodeURIComponent(tokenData),
      domain: "localhost",
      path: "/",
    },
  ]);
}

/**
 * Get the admin auth token via API (for setup operations)
 */
export async function getAdminToken(): Promise<string> {
  const admin = TEST_USERS.admin;
  const loginResult = await apiLogin(admin.email, admin.password);
  const tenantResult = await apiSelectTenant(loginResult.token);
  return tenantResult.token;
}

/**
 * Create a user with a specific role via the admin API
 */
export async function apiCreateUserWithRole(
  adminToken: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  roleId: number
): Promise<any> {
  const ctx = await request.newContext();
  const res = await ctx.post(`${API_URL}/v1/users`, {
    data: {
      email,
      password,
      firstName,
      lastName,
      role: { id: roleId },
      status: { id: 1 }, // active
    },
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  return res;
}
