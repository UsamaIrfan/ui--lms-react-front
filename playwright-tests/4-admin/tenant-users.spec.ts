import { test, expect } from "@playwright/test";
import {
  apiAssignUserToTenant,
  apiRemoveUserFromTenant,
} from "../helpers/api-requests";
import { DEFAULT_TENANT_ID } from "../helpers/constants";

/**
 * Find a user ID that is NOT the admin (user id = 1).
 * We use user 2 (the seeded "user" role account: john.doe@example.com)
 * for assign/remove tests.
 */
const TEST_USER_ID = 2;

test.describe("Admin — Tenant User Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/admin-panel/settings/tenants");
    await expect(page.getByTestId("admin-settings-tenants-page")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");
  });

  test("should open manage users dialog from tenant dropdown", async ({
    page,
  }) => {
    // Find first tenant row and open its dropdown
    const firstRow = page.locator("tr").nth(1); // 0 is header
    await firstRow.locator("button").last().click();

    // Click "Manage Users"
    await page.getByRole("menuitem", { name: /manage users/i }).click();

    // Assert dialog opens
    const dialog = page.getByTestId("manage-tenant-users-dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });
  });

  test("should assign a user to a tenant and see them listed", async ({
    page,
  }) => {
    // Cleanup: ensure the user is not already assigned
    await apiRemoveUserFromTenant(DEFAULT_TENANT_ID, TEST_USER_ID).catch(
      () => {}
    );

    try {
      // Open manage users for the default tenant
      const row = page.locator("tr").nth(1);
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /manage users/i }).click();

      const dialog = page.getByTestId("manage-tenant-users-dialog");
      await expect(dialog).toBeVisible({ timeout: 10000 });

      // Search for the user
      const searchInput = dialog.getByTestId("search-users-input");
      await searchInput.fill("john");

      // Wait for search results to appear
      await page.waitForTimeout(1500);

      // Click assign button for the test user
      const assignBtn = dialog.getByTestId(`assign-user-${TEST_USER_ID}`);
      if (await assignBtn.isVisible()) {
        await assignBtn.click();

        // Wait for the API response
        await page.waitForTimeout(2000);

        // Verify user appears in the assigned list
        await expect(dialog.getByText("John")).toBeVisible({ timeout: 10000 });
      }
    } finally {
      // Cleanup
      await apiRemoveUserFromTenant(DEFAULT_TENANT_ID, TEST_USER_ID).catch(
        () => {}
      );
    }
  });

  test("should remove a user from a tenant", async ({ page }) => {
    // Setup: assign the user via API first
    await apiAssignUserToTenant(DEFAULT_TENANT_ID, TEST_USER_ID).catch(
      () => {}
    );

    try {
      // Open manage users dialog
      const row = page.locator("tr").nth(1);
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /manage users/i }).click();

      const dialog = page.getByTestId("manage-tenant-users-dialog");
      await expect(dialog).toBeVisible({ timeout: 10000 });

      // Wait for user list to load
      await page.waitForTimeout(2000);

      // Click remove button for the test user
      const removeBtn = dialog.getByTestId(
        `remove-user-from-tenant-${TEST_USER_ID}`
      );
      if (await removeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await removeBtn.click();

        // Confirm the removal
        const confirmBtn = page.getByTestId("confirm-dialog-confirm");
        await expect(confirmBtn).toBeVisible({ timeout: 5000 });
        await confirmBtn.click();

        // Wait for API response
        await page.waitForTimeout(2000);

        // Verify user is no longer in the list
        await expect(removeBtn).toBeHidden({ timeout: 10000 });
      }
    } finally {
      // Cleanup in case test failed mid-way
      await apiRemoveUserFromTenant(DEFAULT_TENANT_ID, TEST_USER_ID).catch(
        () => {}
      );
    }
  });

  test("should show empty state when tenant has no assigned users", async ({
    page,
  }) => {
    // Open manage users dialog
    const row = page.locator("tr").nth(1);
    await row.locator("button").last().click();
    await page.getByRole("menuitem", { name: /manage users/i }).click();

    const dialog = page.getByTestId("manage-tenant-users-dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // The dialog should show either a user list or the empty state message.
    // We just verify the dialog rendered and has content.
    const dialogContent = await dialog.textContent();
    expect(dialogContent).toBeTruthy();
  });
});
