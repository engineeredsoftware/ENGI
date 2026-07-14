import { defineConfig, devices } from '@playwright/test';
// Port for the public Next.js app that Playwright should test.
// Override with the PORT env var if needed, but default to 3000 so we
// exercise the user-facing app. Port 3001 is reserved for the admin app
// when both are run concurrently via the `dev:all` script, therefore using
// it here would accidentally launch / hit the admin interface instead of
// the main product and make the tests fail with `ERR_CONNECTION_REFUSED`.
const devPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// V48: /terminal product route is deleted. Ready-check a stable public route.
const appReadyUrl = process.env.PLAYWRIGHT_READY_URL || `http://127.0.0.1:${devPort}/`;
// Port for Storybook server during Playwright tests; override via STORYBOOK_PORT env var or default to 6006
const storybookPort = process.env.STORYBOOK_PORT ? parseInt(process.env.STORYBOOK_PORT, 10) : 6006;

// Determine whether to start Storybook server (default true; set START_STORYBOOK=false to skip)
const startStorybook = process.env.START_STORYBOOK !== 'false';
export default defineConfig({
  testDir: './tests/e2e',
  // Playwright only collects .spec.* files. Co-located Jest unit tests under
  // tests/e2e use .test.ts and import @jest/globals, which must not be loaded
  // by Playwright's collector (breaks `playwright test --list` / test:e2e:ui).
  testMatch: /.*\.spec\.(ts|tsx|js|jsx)$/,
  testIgnore: [/.*\.test\.(ts|tsx|js|jsx)$/, /node_modules/],
  timeout: 120000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  // Automatically start both the main app and Storybook server for component visual tests
  webServer: [
    {
      // Browser-driven route verification should boot the public Next.js app
      // directly rather than the heavier workspace `dev` chain, which also
      // triggers unrelated prebuilds and local-service startup before the
      // product route under test can even load.
      command: `pnpm dev:remote -- -p ${devPort}`,
      url: appReadyUrl,
      reuseExistingServer: true,
    },
    // Optionally start Storybook for component visual tests
    ...(startStorybook ? [{
      // Launch Storybook on configurable port
      // Start Storybook directly to avoid hard-coded port inside the npm script
      // ("storybook dev -p 6006") that would otherwise clash with the dynamic
      // port we want to supply during Playwright-runs.
      command: `pnpm exec storybook dev -p ${storybookPort}`,
      port: storybookPort,
      reuseExistingServer: true,
    }] : []),
  ],
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${devPort}`,
    headless: true,
    trace: 'on-first-retry',
    // Capture all screenshots and videos for full visual baselining
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'phone',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'widescreen',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
