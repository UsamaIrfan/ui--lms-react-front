import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./playwright-tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests once for flakiness resilience */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3001",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  timeout: 2 * 60 * 1000,
  expect: {
    timeout: 20 * 1000,
  },

  /* Configure projects */
  projects: [
    // ── Auth Setup (runs first, creates storageState files) ──
    {
      name: "auth-setup",
      testMatch: /auth-setup\.ts/,
    },

    // ── Unauthenticated tests (sign-in, sign-up, etc.) ──
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [
        /auth-setup\.ts/,
        /2-tenant-selection/,
        /3-role-access/,
        /4-admin/,
        /5-student/,
        /6-staff/,
      ],
    },

    // ── Admin role tests ──
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright-tests/.auth/admin.json",
      },
      dependencies: ["auth-setup"],
      testMatch: /4-admin\/.*/,
    },

    // ── Student role tests ──
    {
      name: "student",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright-tests/.auth/student.json",
      },
      dependencies: ["auth-setup"],
      testMatch: /5-student\/.*/,
    },

    // ── Staff role tests ──
    {
      name: "staff",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright-tests/.auth/staff.json",
      },
      dependencies: ["auth-setup"],
      testMatch: /6-staff\/.*/,
    },

    // ── Role-access & tenant tests (use own auth — tests login for each role) ──
    {
      name: "role-access",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["auth-setup"],
      testMatch: /[23]-.*\/.*/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? "npm run build:e2e && npm run start -- --port 3001"
      : "npm run dev -- --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
  },
});
