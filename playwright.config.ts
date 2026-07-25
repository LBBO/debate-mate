import { defineConfig, devices } from '@playwright/test'

/**
 * Functional e2e suite, run against `next dev`. Serwist is disabled in dev
 * (see next.config.ts), so offline/service-worker behavior is covered
 * separately by playwright.offline.config.ts against a production build.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: ['offline/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
