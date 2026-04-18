import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Global setup warms up Turbopack routes before any test workers start.
  globalSetup: './global-setup.ts',

  // 60s per test — generous, but routes are pre-compiled by globalSetup.
  timeout: 60 * 1000,

  // Run tests in parallel — safe now that routes are pre-compiled.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI to avoid overwhelming the server.
  workers: process.env.CI ? 1 : undefined,

  // HTML reporter for local debugging.
  reporter: 'html',

  use: {
    baseURL: 'http://127.0.0.1:3000',
    // Collect trace on first retry — keeps local runs fast, CI debuggable.
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'pnpm run dev',
    cwd: '../../../',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
