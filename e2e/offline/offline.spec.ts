import { allRoutes } from '../../lib/routes'
import { expect, test } from '@playwright/test'

/**
 * Automates the manual checklist from
 * docs/issues/003-verify-offline-behavior.md. Runs against a production
 * build (see playwright.offline.config.ts) since Serwist is disabled in dev.
 *
 * Not covered here (left as manual per the doc): the silent-update check
 * (requires rebuilding and re-serving mid-test) and the Tauri build check
 * (native build, out of scope for a browser-driven e2e run).
 */

const waitForServiceWorkerControl = async (
  page: import('@playwright/test').Page,
) => {
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    undefined,
    { timeout: 20_000 },
  )
}

test.describe('offline behavior', () => {
  test('registers and activates the service worker on a fresh load', async ({
    page,
  }) => {
    await page.goto('/')

    const activeState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      const active = registration.active
      if (!active) return undefined
      if (active.state === 'activated') return active.state

      return new Promise<string>((resolve) => {
        active.addEventListener('statechange', () => resolve(active.state), {
          once: true,
        })
      })
    })

    expect(activeState).toBe('activated')
  })

  test('every precached route hard-loads while offline', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await waitForServiceWorkerControl(page)

    await context.setOffline(true)

    for (const route of allRoutes) {
      const response = await page.goto(route, { waitUntil: 'load' })
      expect(response?.ok()).toBe(true)
    }

    await context.setOffline(false)
  })

  test('soft (client-side) navigation between routes works while offline', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await waitForServiceWorkerControl(page)

    await context.setOffline(true)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('menuitem', { name: 'Demo' }).click()
    await expect(
      page.getByRole('heading', { name: 'Sound Demo' }),
    ).toBeVisible()

    await context.setOffline(false)
  })

  test('settings changes persist across an offline reload', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await waitForServiceWorkerControl(page)

    await context.setOffline(true)

    await page.goto('/settings', { waitUntil: 'load' })
    const muteSwitch = page.getByLabel(/mute all audio/i)
    await expect(muteSwitch).not.toBeChecked()
    await muteSwitch.click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/settings', { waitUntil: 'load' })
    await expect(page.getByLabel(/mute all audio/i)).toBeChecked()

    await context.setOffline(false)
  })
})
