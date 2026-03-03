import { test, expect, type Locator, type Page } from "@playwright/test";
import {
  apiCreateTimetable,
  apiDeleteTimetable,
  apiGet,
} from "../helpers/api-requests";

// ─────────────────────────────────────────────
// Timetable CRUD Tests (Timetable + Periods)
// ─────────────────────────────────────────────

/** Unique suffix per test run */
const RUN = Date.now().toString(36);

/**
 * Generate a unique day + time-slot pair per test run to avoid teacher
 * scheduling conflicts with leftover periods from previous runs.
 * There are 7 days × 47 start-slot positions = 329 unique combos.
 */
function getUniquePeriodSlot() {
  const DAY_LABELS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const combo = Date.now() % (7 * 46);
  const dayIdx = combo % 7;
  const timeIdx = Math.floor(combo / 7) + 1; // 1-46

  const toLabel = (idx: number) => {
    const hours = Math.floor(idx / 2);
    const minutes = idx % 2 === 0 ? "00" : "30";
    const h12 = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${h12}:${minutes} ${ampm}`;
  };

  return {
    dayLabel: DAY_LABELS[dayIdx],
    startLabel: toLabel(timeIdx),
    endLabel: toLabel(timeIdx + 1),
  };
}

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

/**
 * Select a Radix Select value by clicking the combobox trigger and choosing an option.
 * When `pickFirst` is true, pick the first matching option (avoids strict-mode violations).
 */
async function selectRadix(
  container: Locator,
  page: Page,
  label: string,
  optionName: RegExp | string,
  pickFirst = false
) {
  const trigger = container
    .getByText(label, { exact: true })
    .locator("..")
    .locator('button[role="combobox"]');
  await trigger.click();
  const options = page.getByRole("option", {
    name:
      typeof optionName === "string" ? new RegExp(optionName, "i") : optionName,
  });
  if (pickFirst) {
    await options.first().click();
  } else {
    await options.click();
  }
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

test.describe("Admin — Timetable CRUD", () => {
  // ────────────── Timetable ──────────────

  test("should create a timetable via dialog", async ({ page }) => {
    const ttName = `E2E TT ${RUN}`;

    await page.goto("/en/admin-panel/staff/timetable");
    await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /add timetable/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.waitFor();

    await fillField(dialog, "Timetable Name", ttName);
    await selectRadix(dialog, page, "Class", /grade 9/i);
    await page.waitForTimeout(500);
    await selectRadix(dialog, page, "Section", /^A$/i);
    await selectRadix(dialog, page, "Academic Year", /2025-2026/i);

    await clickSaveAndWait(page, dialog, "/timetables");
    await expect(dialog).toBeHidden({ timeout: 10000 });

    await expect(page.getByText(ttName)).toBeVisible({ timeout: 10000 });
  });

  test("should edit a timetable via dialog", async ({ page }) => {
    const ttName = `EditTT ${RUN}`;
    const gradeClasses = await apiGet("/v1/lms/grade-classes");
    const classId = gradeClasses[0].id;
    const sections = await apiGet("/v1/lms/sections");
    const sectionId =
      sections.find(
        (s: { gradeClassId: number; id: number }) => s.gradeClassId === classId
      )?.id ?? sections[0].id;
    const academicYears = await apiGet("/v1/lms/academic-years");
    const academicYearId = academicYears[0].id;
    const tt = await apiCreateTimetable({
      name: ttName,
      classId,
      sectionId,
      academicYearId,
    });

    try {
      await page.goto("/en/admin-panel/staff/timetable");
      await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: ttName });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /edit/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.waitFor();

      const nameInput = dialog
        .getByText("Timetable Name", { exact: true })
        .locator("..")
        .locator("input");
      await nameInput.clear();
      await nameInput.fill(`${ttName} Upd`);

      await clickSaveAndWait(page, dialog, "/timetables");
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await expect(page.getByText(`${ttName} Upd`)).toBeVisible({
        timeout: 10000,
      });
    } finally {
      await apiDeleteTimetable(tt.id).catch(() => {});
    }
  });

  test("should delete a timetable", async ({ page }) => {
    const ttName = `DelTT ${RUN}`;
    const gradeClasses = await apiGet("/v1/lms/grade-classes");
    const classId = gradeClasses[0].id;
    const sections = await apiGet("/v1/lms/sections");
    const sectionId =
      sections.find(
        (s: { gradeClassId: number; id: number }) => s.gradeClassId === classId
      )?.id ?? sections[0].id;
    const academicYears = await apiGet("/v1/lms/academic-years");
    const academicYearId = academicYears[0].id;
    await apiCreateTimetable({
      name: ttName,
      classId,
      sectionId,
      academicYearId,
    });

    await page.goto("/en/admin-panel/staff/timetable");
    await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");

    const row = page.locator("tr", { hasText: ttName });
    await row.locator("button").last().click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-dialog-confirm").click();

    await expect(page.getByText(ttName)).toBeHidden({ timeout: 10000 });
  });

  // ────────────── Periods (nested in timetable) ──────────────

  test("should add a period to a timetable", async ({ page }) => {
    const ttName = `PeriodTT ${RUN}`;
    const room = `Rm-${RUN}`;
    const { dayLabel, startLabel, endLabel } = getUniquePeriodSlot();
    const gradeClasses = await apiGet("/v1/lms/grade-classes");
    const classId = gradeClasses[0].id;
    const sections = await apiGet("/v1/lms/sections");
    const sectionId =
      sections.find(
        (s: { gradeClassId: number; id: number }) => s.gradeClassId === classId
      )?.id ?? sections[0].id;
    const academicYears = await apiGet("/v1/lms/academic-years");
    const academicYearId = academicYears[0].id;
    const tt = await apiCreateTimetable({
      name: ttName,
      classId,
      sectionId,
      academicYearId,
    });

    try {
      await page.goto("/en/admin-panel/staff/timetable");
      await expect(page.getByTestId("admin-staff-timetable-page")).toBeVisible({
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      const row = page.locator("tr", { hasText: ttName });
      await row.locator("button").last().click();
      await page.getByRole("menuitem", { name: /view periods/i }).click();

      const periodsDialog = page.getByRole("dialog");
      await periodsDialog.waitFor();
      await expect(periodsDialog.getByText("Periods")).toBeVisible();

      await periodsDialog.getByRole("button", { name: /add period/i }).click();

      await page.waitForTimeout(500);
      const periodDialog = page.getByRole("dialog").last();

      await selectRadix(periodDialog, page, "Subject", /^Mathematics/i);
      await selectRadix(periodDialog, page, "Teacher", /.+/, true);
      await selectRadix(
        periodDialog,
        page,
        "Day",
        new RegExp(`^${dayLabel}$`, "i")
      );
      await selectRadix(
        periodDialog,
        page,
        "Start Time",
        new RegExp(`^${startLabel.replace(":", "\\:")}$`, "i")
      );
      await selectRadix(
        periodDialog,
        page,
        "End Time",
        new RegExp(`^${endLabel.replace(":", "\\:")}$`, "i")
      );
      await fillField(periodDialog, "Room", room);

      await clickSaveAndWait(page, periodDialog, "/timetables");

      // Wait for the add-period dialog to close (2 dialogs → 1)
      await expect(page.getByRole("dialog")).toHaveCount(1, {
        timeout: 10000,
      });
      await page.waitForTimeout(1000);

      // The periods dialog should still be open and show the new period
      const remainingDialog = page.getByRole("dialog");
      await expect(remainingDialog.getByText(dayLabel)).toBeVisible({
        timeout: 15000,
      });
      await expect(remainingDialog.getByText(room)).toBeVisible({
        timeout: 15000,
      });
    } finally {
      await apiDeleteTimetable(tt.id).catch(() => {});
    }
  });
});
