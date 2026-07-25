import { defineConfig, devices } from '@playwright/test'

/**
 * Offline/service-worker suite. Automates the manual checklist from
 * docs/issues/003-verify-offline-behavior.md. Serwist only runs in a
 * production build (see next.config.ts), so this builds and serves the
 * static export rather than using `next dev`.
 */
export default defineConfig({
  testDir: './e2e/offline',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm dlx serve --no-clipboard -l 4173 out',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
