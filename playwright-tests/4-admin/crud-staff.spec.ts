import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  apiCreateStaff,
  apiDeleteStaff,
  apiGet,
} from "../helpers/api-requests";

// ─────────────────────────────────────────────
// Staff Management CRUD Tests
// ─────────────────────────────────────────────

/** Unique suffix per test run */
const RUN = Date.now().toString(36);

/**
 * Fill a form field by finding the label text and the sibling input.
 * AlignUI Label + Input are siblings inside a div.grid.gap-2 — no htmlFor association.
 */
async function fillField(container: Locator, labelText: string, value: string) {
  const input = container
    .getByText(labelText, { exact: true })
    .locator("..")
    .locator("input");
  await input.fill(value);
}

/** Click Save and wait for the matching API response */
async function clickSaveAndWait(
  page: Page,
  dialog: Locator,
  urlPattern: string
) {
  const responsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(urlPattern) &&
      (resp.request().method() === "POST" ||
        resp.request().method() === "PATCH" ||
        resp.request().method() === "PUT"),
    { timeout: 15000 }
  );
  await dialog.getByRole("button", { name: /save/i }).click();
  await responsePromise;
}

test.describe("Admin — Staff Management CRUD", () => {
  test("should create a staff member via dialog (Create New User mode)", async ({
    page,
  }) => {
    const email = `e2e-staff-${RUN}@example.com`;
    const desig = `Teacher ${RUN}`;

    await page.goto("/en/admin-panel/staff");
    await expect(page.getByTestId("admin-staff-page")).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /add staff/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.waitFor();

    // Default mode is "Create New User" — fill user fields
    await fillField(dialog, "First Name", "E2E");
    await fillField(dialog, "Last Name", `Staff${RUN}`);
    await fillField(dialog, "Email", email);
    await fillField(dialog, "Password", "Secret1!");

    // User Role uses raw <select>
    await dialog.locator("select").first().selectOption("teacher");

    // Select institution (Radix Select)
    const comboboxes = dialog.locator('button[role="combobox"]');
    await comboboxes.first().click();
    await page.getByRole("option", { name: /sunrise international/i }).click();

    // Fill staff details
    await fillField(dialog, "Designation", desig);
    await fillField(dialog, "Qualification", "M.Ed");
    await fillField(dialog, "Specialization", "Mathematics");
    await fillField(dialog, "Experience (years)", "5");
    await fillField(dialog, "Joining Date", "2026-03-01");
    await fillField(dialog, "Basic Salary", "50000");

    // Employment Type uses raw <select>
    await dialog.locator("select").last().selectOption("full_time");

    await fillField(dialog, "Emergency Contact", "+1234567890");
    await fillField(dialog, "Address", "123 Test Street");

    // Submit and wait for API
    await clickSaveAndWait(page, dialog, "/staff-management");
    await expect(dialog).toBeHidden({ timeout: 15000 });

    // Verify staff appears in the table
    await expect(page.getByText(desig)).toBeVisible({ timeout: 10000 });
  });

  test("should edit a staff member via dialog", async ({ page }) => {
    const desig = `OrigDesig ${RUN}`;
    const institutions = await apiGet("/v1/lms/institutions");
    const instId = institutions[0].id;

    const staff = await apiCreateStaff({
      email: `e2e-edit-${RUN}@example.com`,
      password: "Secret1!",
      firstName: "EditMe",
      lastName: "Staff",
      userRole: "staff",
      institutionId: instId,
      designation: desig,
      basicSalary: 30000,
      employmentType: "full_time",
    });

    try {
      await page.goto("/en/admin-panel/staff");
      await expect(page.getByTestId("admin-staff-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: desig });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /edit/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      const desigInput = dialog
        .getByText("Designation", { exact: true })
        .locator("..")
        .locator("input");
      await desigInput.clear();
      await desigInput.fill(`${desig} Updated`);

      await clickSaveAndWait(page, dialog, "/staff-management");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(`${desig} Updated`)).toBeVisible({
        timeout: 10000,
      });
    } finally {
      await apiDeleteStaff(staff.id).catch(() => {});
    }
  });

  test("should delete a staff member", async ({ page }) => {
    const desig = `DelDesig ${RUN}`;
    const institutions = await apiGet("/v1/lms/institutions");
    const instId = institutions[0].id;

    const staff = await apiCreateStaff({
      email: `e2e-del-${RUN}@example.com`,
      password: "Secret1!",
      firstName: "DeleteMe",
      lastName: "Staff",
      userRole: "staff",
      institutionId: instId,
      designation: desig,
      basicSalary: 25000,
      employmentType: "contract",
    });

    await page.goto("/en/admin-panel/staff");
    await expect(page.getByTestId("admin-staff-page")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr", { hasText: desig });
    await row.locator("button").last().click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-dialog-confirm").click();

    await expect(page.getByText(desig)).toBeHidden({ timeout: 10000 });
  });
});
