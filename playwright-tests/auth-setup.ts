import { test as setup, expect, request } from "@playwright/test";
import {
  API_URL,
  DEFAULT_TENANT_ID,
  TEST_USERS,
  RoleId,
} from "./helpers/constants";

/**
 * Global auth setup — creates storageState files for each role.
 * Each role gets its own browser state with auth cookies pre-set
 * so tests can skip login flows and start authenticated.
 */

const ROLES_TO_SETUP = [
  "admin",
  "student",
  "teacher",
  "staff",
  "accountant",
  "parent",
] as const;

for (const role of ROLES_TO_SETUP) {
  setup(`authenticate as ${role}`, async ({ browser }) => {
    const user = TEST_USERS[role];

    // 1. Login via API
    const ctx = await request.newContext();
    const loginRes = await ctx.post(`${API_URL}/v1/auth/email/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(loginRes.status(), `Login failed for ${role} (${user.email})`).toBe(
      200
    );
    const loginBody = await loginRes.json();

    // 2. Select tenant via API
    const tenantRes = await ctx.post(`${API_URL}/v1/auth/tenant/select`, {
      data: { tenantId: DEFAULT_TENANT_ID },
      headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    expect(tenantRes.status(), `Tenant selection failed for ${role}`).toBe(200);
    const tenantBody = await tenantRes.json();

    // 3. Create browser context with auth cookie
    const browserContext = await browser.newContext();

    const tokenData = JSON.stringify({
      token: tenantBody.token,
      refreshToken: tenantBody.refreshToken,
      tokenExpires: tenantBody.tokenExpires,
    });

    await browserContext.addCookies([
      {
        name: "auth-token-data",
        value: encodeURIComponent(tokenData),
        domain: "localhost",
        path: "/",
      },
    ]);

    // 4. Verify auth works by navigating to role's default route
    const page = await browserContext.newPage();
    await page.goto(user.defaultRoute);
    await page.waitForLoadState("networkidle");

    // Should NOT be on sign-in page
    expect(page.url()).not.toContain("/sign-in");

    // 5. Save storage state
    await browserContext.storageState({
      path: `playwright-tests/.auth/${role}.json`,
    });

    await browserContext.close();
    await ctx.dispose();
  });
}
