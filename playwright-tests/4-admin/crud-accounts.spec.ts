import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  apiCreateIncome,
  apiDeleteIncome,
  apiCreateExpense,
  apiDeleteExpense,
} from "../helpers/api-requests";

// ─────────────────────────────────────────────
// Accounts CRUD Tests (Income & Expenses)
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

test.describe("Admin — Accounts CRUD", () => {
  // ────────────── Income ──────────────

  test.describe("Income", () => {
    test("should create an income entry via dialog", async ({ page }) => {
      const cat = `Tuition ${RUN}`;

      await page.goto("/en/admin-panel/accounts/income");
      await expect(page.getByTestId("admin-accounts-income-page")).toBeVisible({
        timeout: 15000,
      });

      await page.getByRole("button", { name: /add income/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      await fillField(dialog, "Category", cat);
      await fillField(dialog, "Amount", "50000");
      await fillField(dialog, "Date", "2026-03-01");
      await fillField(dialog, "Received From", "Student Parent");
      await fillField(dialog, "Description", "Monthly tuition fee");
      await fillField(dialog, "Reference Number", `INC-${RUN}`);
      await fillField(dialog, "Remarks", "E2E test income");

      await clickSaveAndWait(page, dialog, "/income");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(cat)).toBeVisible({ timeout: 10000 });
    });

    test("should edit an income entry", async ({ page }) => {
      const income = await apiCreateIncome({
        category: `Edit Inc ${RUN}`,
        amount: 1000,
        date: "2026-01-15",
        receivedFrom: "Test Payer",
      });

      try {
        await page.goto("/en/admin-panel/accounts/income");
        await expect(
          page.getByTestId("admin-accounts-income-page")
        ).toBeVisible({ timeout: 15000 });
        await page.waitForLoadState("networkidle");

        const row = page.locator("tr", { hasText: `Edit Inc ${RUN}` });
        await row.locator("button").last().click();
        await page.getByRole("menuitem", { name: /edit/i }).click();

        const dialog = page.getByRole("dialog");
        await dialog.waitFor();

        const catInput = dialog
          .getByText("Category", { exact: true })
          .locator("..")
          .locator("input");
        await catInput.clear();
        await catInput.fill(`Edit Inc ${RUN} Updated`);

        await clickSaveAndWait(page, dialog, "/income");
        await expect(dialog).toBeHidden({ timeout: 10000 });

        await expect(page.getByText(`Edit Inc ${RUN} Updated`)).toBeVisible({
          timeout: 10000,
        });
      } finally {
        await apiDeleteIncome(income.id).catch(() => {});
      }
    });

    test("should delete an income entry", async ({ page }) => {
      const income = await apiCreateIncome({
        category: `Del Inc ${RUN}`,
        amount: 500,
        date: "2026-02-01",
      });

      await page.goto("/en/admin-panel/accounts/income");
      await expect(page.getByTestId("admin-accounts-income-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Del Inc ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await expect(page.getByTestId("confirm-dialog")).toBeVisible();
      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Inc ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Expenses ──────────────

  test.describe("Expenses", () => {
    test("should create an expense entry via dialog", async ({ page }) => {
      const cat = `Supplies ${RUN}`;

      await page.goto("/en/admin-panel/accounts/expenses");
      await expect(
        page.getByTestId("admin-accounts-expenses-page")
      ).toBeVisible({ timeout: 15000 });

      await page.getByRole("button", { name: /add expense/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      await fillField(dialog, "Category", cat);
      await fillField(dialog, "Amount", "2500");
      await fillField(dialog, "Date", "2026-03-15");
      await fillField(dialog, "Paid To", "Stationery Store");
      await fillField(dialog, "Description", "Paper, pens, folders");
      await fillField(dialog, "Reference Number", `EXP-${RUN}`);

      // Status uses raw <select> element
      await dialog.locator("select").selectOption("approved");

      await fillField(dialog, "Remarks", "E2E test expense");

      await clickSaveAndWait(page, dialog, "/expenses");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(cat)).toBeVisible({ timeout: 10000 });
    });

    test("should edit an expense entry", async ({ page }) => {
      const expense = await apiCreateExpense({
        category: `Edit Exp ${RUN}`,
        amount: 750,
        date: "2026-01-20",
        paidTo: "Test Vendor",
        status: "pending",
      });

      try {
        await page.goto("/en/admin-panel/accounts/expenses");
        await expect(
          page.getByTestId("admin-accounts-expenses-page")
        ).toBeVisible({ timeout: 15000 });
        await page.waitForLoadState("networkidle");

        const row = page.locator("tr", { hasText: `Edit Exp ${RUN}` });
        await row.locator("button").last().click();
        await page.getByRole("menuitem", { name: /edit/i }).click();

        const dialog = page.getByRole("dialog");
        await dialog.waitFor();

        const catInput = dialog
          .getByText("Category", { exact: true })
          .locator("..")
          .locator("input");
        await catInput.clear();
        await catInput.fill(`Edit Exp ${RUN} Updated`);

        await dialog.locator("select").selectOption("approved");

        await clickSaveAndWait(page, dialog, "/expenses");
        await expect(dialog).toBeHidden({ timeout: 10000 });

        await expect(page.getByText(`Edit Exp ${RUN} Updated`)).toBeVisible({
          timeout: 10000,
        });
      } finally {
        await apiDeleteExpense(expense.id).catch(() => {});
      }
    });

    test("should delete an expense entry", async ({ page }) => {
      const expense = await apiCreateExpense({
        category: `Del Exp ${RUN}`,
        amount: 300,
        date: "2026-02-10",
      });

      await page.goto("/en/admin-panel/accounts/expenses");
      await expect(
        page.getByTestId("admin-accounts-expenses-page")
      ).toBeVisible({ timeout: 15000 });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Del Exp ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await expect(page.getByTestId("confirm-dialog")).toBeVisible();
      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Exp ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });
});
