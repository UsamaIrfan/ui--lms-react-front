import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  apiCreateInstitution,
  apiDeleteInstitution,
  apiCreateDepartment,
  apiCreateGradeClass,
  apiCreateSubject,
  apiCreateAcademicYear,
  apiCreateTerm,
  apiGet,
} from "../helpers/api-requests";

// ─────────────────────────────────────────────
// Academics CRUD Tests
// ─────────────────────────────────────────────

/** Unique suffix per test run to avoid DB unique-constraint conflicts */
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

/**
 * Click the Save button inside a dialog and wait for a matching API response.
 * Sets up the response listener BEFORE clicking to avoid race conditions.
 */
async function clickSaveAndWait(
  page: Page,
  dialog: Locator,
  urlPattern: string | RegExp
) {
  const responsePromise = page.waitForResponse(
    (resp) =>
      (typeof urlPattern === "string"
        ? resp.url().includes(urlPattern)
        : urlPattern.test(resp.url())) &&
      (resp.request().method() === "POST" ||
        resp.request().method() === "PATCH" ||
        resp.request().method() === "PUT"),
    { timeout: 15000 }
  );
  await dialog.getByRole("button", { name: /save/i }).click();
  await responsePromise;
}

test.describe("Admin — Academics CRUD", () => {
  // ────────────── Institutions ──────────────

  test.describe("Institutions", () => {
    test("should create an institution via dialog", async ({ page }) => {
      const instName = `E2E Inst ${RUN}`;
      const instCode = `EI-${RUN}`;

      await page.goto("/en/admin-panel/academics/courses");
      await expect(
        page.getByTestId("admin-academics-courses-page")
      ).toBeVisible({ timeout: 15000 });

      // Click "Add Institution" button
      await page.getByRole("button", { name: /add institution/i }).click();

      // Wait for dialog
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      // Fill form fields (Label + sibling Input, no htmlFor)
      await fillField(dialog, "Institution Name", instName);
      await fillField(dialog, "Code", instCode);
      await fillField(dialog, "Email", `e2e-${RUN}@example.com`);
      await fillField(dialog, "Phone", "+1234567890");
      await fillField(dialog, "City", "Test City");
      await fillField(dialog, "Address", "123 Test Street");

      // Submit and wait for API response
      await clickSaveAndWait(page, dialog, "/institutions");

      // Wait for dialog to close
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Verify institution appears in the table
      await expect(page.getByText(instName)).toBeVisible({ timeout: 10000 });
    });

    test("should edit an institution via dialog", async ({ page }) => {
      const code = `EDIT-${RUN}`;
      const inst = await apiCreateInstitution({
        name: `Edit Inst ${RUN}`,
        code,
      });

      try {
        await page.goto("/en/admin-panel/academics/courses");
        await expect(
          page.getByTestId("admin-academics-courses-page")
        ).toBeVisible({ timeout: 15000 });
        await page.waitForLoadState("networkidle");

        // Find the row with our institution and click action menu
        const row = page.locator("tr", { hasText: `Edit Inst ${RUN}` });
        await row.locator("button").last().click();

        // Click Edit in dropdown
        await page.getByRole("menuitem", { name: /edit/i }).click();

        // Edit dialog should open with pre-filled data
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();

        // Modify institution name
        const nameInput = dialog
          .getByText("Institution Name", { exact: true })
          .locator("..")
          .locator("input");
        await nameInput.clear();
        await nameInput.fill(`Edit Inst ${RUN} Updated`);

        // Save and wait for API
        await clickSaveAndWait(page, dialog, "/institutions");
        await expect(dialog).toBeHidden({ timeout: 10000 });

        // Verify updated name appears
        await expect(page.getByText(`Edit Inst ${RUN} Updated`)).toBeVisible({
          timeout: 10000,
        });
      } finally {
        await apiDeleteInstitution(inst.id).catch(() => {});
      }
    });

    test("should delete an institution", async ({ page }) => {
      const code = `DEL-${RUN}`;
      await apiCreateInstitution({
        name: `Del Inst ${RUN}`,
        code,
      });

      await page.goto("/en/admin-panel/academics/courses");
      await expect(
        page.getByTestId("admin-academics-courses-page")
      ).toBeVisible({ timeout: 15000 });
      await page.waitForLoadState("networkidle");

      // Find the row and open action menu
      const row = page.locator("tr", { hasText: `Del Inst ${RUN}` });
      await row.locator("button").last().click();

      // Click Delete
      await page.getByRole("menuitem", { name: /delete/i }).click();

      // Confirm dialog should appear
      await expect(page.getByTestId("confirm-dialog")).toBeVisible();
      await page.getByTestId("confirm-dialog-confirm").click();

      // Verify the institution is removed from the table
      await expect(page.getByText(`Del Inst ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Departments ──────────────

  test.describe("Departments", () => {
    test("should create a department via dialog", async ({ page }) => {
      const deptName = `E2E Dept ${RUN}`;
      const deptCode = `ED-${RUN}`;

      await page.goto("/en/admin-panel/academics/courses");
      await expect(
        page.getByTestId("admin-academics-courses-page")
      ).toBeVisible({ timeout: 15000 });

      // Switch to Departments tab
      await page.getByRole("button", { name: /departments/i }).click();
      await page.waitForTimeout(500);

      // Click "Add Department" button
      await page.getByRole("button", { name: /add department/i }).click();

      // Wait for dialog
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      // Fill form
      await fillField(dialog, "Department Name", deptName);
      await fillField(dialog, "Code", deptCode);

      // Select institution from dropdown (Radix Select)
      await dialog.locator('button[role="combobox"]').click();
      await page
        .getByRole("option", { name: /sunrise international/i })
        .click();

      await fillField(dialog, "Description", "E2E test department");

      // Submit and wait for API
      await clickSaveAndWait(page, dialog, "/departments");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Verify department appears in the table
      await expect(page.getByText(deptName)).toBeVisible({ timeout: 10000 });
    });

    test("should delete a department", async ({ page }) => {
      // Fetch a valid institutionId from the API
      const institutions = await apiGet("/v1/lms/institutions");
      const instId = institutions[0].id;

      await apiCreateDepartment({
        name: `Del Dept ${RUN}`,
        code: `DD-${RUN}`,
        institutionId: instId,
      });

      await page.goto("/en/admin-panel/academics/courses");
      await expect(
        page.getByTestId("admin-academics-courses-page")
      ).toBeVisible({ timeout: 15000 });

      // Switch to Departments tab
      await page.getByRole("button", { name: /departments/i }).click();
      await page.waitForTimeout(500);
      await page.waitForLoadState("networkidle");

      // Find row and delete
      const row = page.locator("tr", { hasText: `Del Dept ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      // Confirm
      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Dept ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Classes & Sections ──────────────

  test.describe("Classes & Sections", () => {
    test("should create a class via dialog", async ({ page }) => {
      const className = `E2E Class ${RUN}`;

      await page.goto("/en/admin-panel/academics/classes");
      await expect(
        page.getByTestId("admin-academics-classes-page")
      ).toBeVisible({ timeout: 15000 });

      // Click "Add Class" — the primary button
      await page.getByRole("button", { name: /add class/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      // Fill class form
      await fillField(dialog, "Class Name", className);

      // Select institution (Radix Select)
      await dialog.locator('button[role="combobox"]').click();
      await page
        .getByRole("option", { name: /sunrise international/i })
        .click();

      await fillField(dialog, "Numeric Grade", "99");
      await fillField(dialog, "Description", "E2E test class");

      // Save and wait for API
      await clickSaveAndWait(page, dialog, "/grade-classes");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Verify
      await expect(page.getByText(className)).toBeVisible({ timeout: 10000 });
    });

    test("should create a section via dialog", async ({ page }) => {
      const sectionName = `Sec-${RUN}`;

      await page.goto("/en/admin-panel/academics/classes");
      await expect(
        page.getByTestId("admin-academics-classes-page")
      ).toBeVisible({ timeout: 15000 });

      // Click "Add Section" — the outline button
      await page.getByRole("button", { name: /add section/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      // Fill section form
      await fillField(dialog, "Section Name", sectionName);

      // Select class (Radix Select)
      await dialog.locator('button[role="combobox"]').click();
      await page.getByRole("option", { name: /grade 9/i }).click();

      const capInput = dialog
        .getByText("Capacity", { exact: true })
        .locator("..")
        .locator("input");
      await capInput.clear();
      await capInput.fill("35");

      // Save and wait for API
      await clickSaveAndWait(page, dialog, "/sections");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Verify section appears
      await expect(page.getByText(sectionName)).toBeVisible({
        timeout: 10000,
      });
    });

    test("should delete a class", async ({ page }) => {
      const institutions = await apiGet("/v1/lms/institutions");
      const instId = institutions[0].id;

      await apiCreateGradeClass({
        name: `Del Class ${RUN}`,
        numericGrade: 98,
        institutionId: instId,
      });

      await page.goto("/en/admin-panel/academics/classes");
      await expect(
        page.getByTestId("admin-academics-classes-page")
      ).toBeVisible({ timeout: 15000 });
      await page.waitForLoadState("networkidle");

      // Find row and delete
      const row = page.locator("tr", { hasText: `Del Class ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Class ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Subjects ──────────────

  test.describe("Subjects", () => {
    test("should create a subject via dialog", async ({ page }) => {
      const subjName = `E2E Subj ${RUN}`;
      const subjCode = `ES-${RUN}`;

      await page.goto("/en/admin-panel/academics/subjects");
      await expect(
        page.getByTestId("admin-academics-subjects-page")
      ).toBeVisible({ timeout: 15000 });

      await page.getByRole("button", { name: /add subject/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      await fillField(dialog, "Subject Name", subjName);
      await fillField(dialog, "Subject Code", subjCode);

      // Select department (Radix Select)
      await dialog.locator('button[role="combobox"]').click();
      await page.getByRole("option", { name: /science/i }).click();

      await fillField(dialog, "Credit Hours", "4");
      await fillField(dialog, "Description", "E2E test subject");

      // Save and wait for API
      await clickSaveAndWait(page, dialog, "/subjects");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(subjName)).toBeVisible({ timeout: 10000 });
    });

    test("should delete a subject", async ({ page }) => {
      const departments = await apiGet("/v1/lms/departments");
      const deptId = departments[0].id;

      await apiCreateSubject({
        name: `Del Subj ${RUN}`,
        code: `DS-${RUN}`,
        departmentId: deptId,
        creditHours: 2,
      });

      await page.goto("/en/admin-panel/academics/subjects");
      await expect(
        page.getByTestId("admin-academics-subjects-page")
      ).toBeVisible({ timeout: 15000 });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Del Subj ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Subj ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Academic Year ──────────────

  test.describe("Academic Year", () => {
    test("should create an academic year via dialog", async ({ page }) => {
      const yearName = `E2E Year ${RUN}`;

      await page.goto("/en/admin-panel/academics/year");
      await expect(page.getByTestId("admin-academics-year-page")).toBeVisible({
        timeout: 30000,
      });

      await page.getByRole("button", { name: /add academic year/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      await fillField(dialog, "Year Name", yearName);

      // Select institution (Radix Select)
      await dialog.locator('button[role="combobox"]').click();
      await page
        .getByRole("option", { name: /sunrise international/i })
        .click();

      await fillField(dialog, "Start Date", "2099-09-01");
      await fillField(dialog, "End Date", "2100-06-30");

      // Save and wait for API
      await clickSaveAndWait(page, dialog, "/academic-years");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(yearName)).toBeVisible({ timeout: 10000 });
    });

    test("should delete an academic year", async ({ page }) => {
      const institutions = await apiGet("/v1/lms/institutions");
      const instId = institutions[0].id;

      await apiCreateAcademicYear({
        name: `Del Year ${RUN}`,
        startDate: "2098-01-01",
        endDate: "2098-12-31",
        institutionId: instId,
      });

      await page.goto("/en/admin-panel/academics/year");
      await expect(page.getByTestId("admin-academics-year-page")).toBeVisible({
        timeout: 30000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Del Year ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Year ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });

  // ────────────── Terms ──────────────

  test.describe("Terms", () => {
    test("should create a term via dialog", async ({ page }) => {
      const termName = `E2E Term ${RUN}`;

      await page.goto("/en/admin-panel/academics/terms");
      await expect(
        page.getByTestId("admin-academics-terms-page")
      ).toBeVisible({ timeout: 30000 });

      await page.getByRole("button", { name: /add term/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      // Fill term name
      await dialog.getByTestId("term-name").fill(termName);

      // Select academic year (Radix Select)
      await dialog.getByTestId("term-academic-year").click();
      const firstOption = page.getByRole("option").first();
      await firstOption.waitFor({ timeout: 10000 });
      await firstOption.click();

      // Fill dates
      await dialog.getByTestId("term-start-date").fill("2099-01-01");
      await dialog.getByTestId("term-end-date").fill("2099-06-30");

      // Save and wait for API
      await clickSaveAndWait(page, dialog, "/terms");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(termName)).toBeVisible({ timeout: 10000 });
    });

    test("should delete a term", async ({ page }) => {
      // Create AY first (term needs an academic year)
      const institutions = await apiGet("/v1/lms/institutions");
      const instId = institutions[0].id;
      const ay = await apiCreateAcademicYear({
        name: `AY Term Del ${RUN}`,
        startDate: "2097-01-01",
        endDate: "2097-12-31",
        institutionId: instId,
      });

      await apiCreateTerm({
        name: `Del Term ${RUN}`,
        startDate: "2097-01-01",
        endDate: "2097-06-30",
        academicYearId: ay.id,
      });

      await page.goto("/en/admin-panel/academics/terms");
      await expect(
        page.getByTestId("admin-academics-terms-page")
      ).toBeVisible({ timeout: 30000 });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: `Del Term ${RUN}` });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /delete/i }).click();

      await page.getByTestId("confirm-dialog-confirm").click();

      await expect(page.getByText(`Del Term ${RUN}`)).toBeHidden({
        timeout: 10000,
      });
    });
  });
});
