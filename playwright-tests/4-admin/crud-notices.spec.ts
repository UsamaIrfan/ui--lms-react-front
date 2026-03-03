import { test, expect, type Locator, type Page } from "@playwright/test";
import { apiCreateNotice, apiDeleteNotice } from "../helpers/api-requests";

// ─────────────────────────────────────────────
// Notices CRUD Tests
// ─────────────────────────────────────────────

/** Unique suffix per test run */
const RUN = Date.now().toString(36);

/**
 * Fill a form field by finding the label text and the sibling input.
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

test.describe("Admin — Notices CRUD", () => {
  test("should create a notice via dialog", async ({ page }) => {
    const title = `E2E Notice ${RUN}`;

    await page.goto("/en/admin-panel/notices");
    await expect(page.getByTestId("admin-notices-page")).toBeVisible({
      timeout: 15000,
    });

    // Click "Create Notice"
    await page.getByRole("button", { name: /create notice/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.waitFor();

    await fillField(dialog, "Title", title);
    await dialog
      .locator("textarea")
      .fill("This is an E2E test notice content.");
    await fillField(dialog, "Target Roles", "admin, teacher, staff");
    await fillField(dialog, "Publish Date", "2026-03-01");
    await fillField(dialog, "Expires At", "2026-12-31");

    // Check published checkbox
    await dialog.locator("#isPublished").check();

    // Submit and wait for API
    await clickSaveAndWait(page, dialog, "/notices");
    await expect(dialog).toBeHidden({ timeout: 10000 });

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
  });

  test("should edit a notice via dialog", async ({ page }) => {
    const notice = await apiCreateNotice({
      title: `Edit Notice ${RUN}`,
      content: "Original content",
      targetRoles: ["admin"],
      isPublished: true,
      publishDate: "2026-01-01",
    });

    try {
      await page.goto("/en/admin-panel/notices");
      await expect(page.getByTestId("admin-notices-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Edit Notice ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /edit/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      const titleInput = dialog
        .getByText("Title", { exact: true })
        .locator("..")
        .locator("input");
      await titleInput.clear();
      await titleInput.fill(`Edit Notice ${RUN} Updated`);

      await clickSaveAndWait(page, dialog, "/notices");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(`Edit Notice ${RUN} Updated`)).toBeVisible({
        timeout: 10000,
      });
    } finally {
      await apiDeleteNotice(notice.id).catch(() => {});
    }
  });

  test("should delete a notice via confirm dialog", async ({ page }) => {
    await apiCreateNotice({
      title: `Del Notice ${RUN}`,
      content: "To be deleted",
    });

    await page.goto("/en/admin-panel/notices");
    await expect(page.getByTestId("admin-notices-page")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr", { hasText: `Del Notice ${RUN}` });
    await row.locator("button").last().click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-dialog-confirm").click();

    await expect(page.getByText(`Del Notice ${RUN}`)).toBeHidden({
      timeout: 10000,
    });
  });

  test("should toggle notice published status", async ({ page }) => {
    const notice = await apiCreateNotice({
      title: `Toggle Notice ${RUN}`,
      content: "Test publishing toggle",
      isPublished: false,
    });

    try {
      await page.goto("/en/admin-panel/notices");
      await expect(page.getByTestId("admin-notices-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Toggle Notice ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /edit/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      await dialog.locator("#isPublished").check();

      await clickSaveAndWait(page, dialog, "/notices");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await page.waitForTimeout(1000);
      await expect(
        page.locator("tr", { hasText: `Toggle Notice ${RUN}` })
      ).toBeVisible();
    } finally {
      await apiDeleteNotice(notice.id).catch(() => {});
    }
  });
});
