import { expect, test } from '@playwright/test'

test.describe('timer', () => {
  test('starts paused with a disabled POI button', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('button', { name: 'Start timer' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Point of information' }),
    ).toBeDisabled()
  })

  test('starting the timer shows the protected-start phase', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Start timer' }).click()

    await expect(
      page.getByRole('button', { name: 'Pause timer' }),
    ).toBeVisible()
    await expect(page.getByText('Protected')).toBeVisible()
  })

  test('transitions to unprotected and enables the POI button once protected-start elapses', async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')

    await page.getByRole('button', { name: 'Start timer' }).click()
    await page.clock.fastForward(61_000)

    await expect(page.getByText('Unprotected')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Point of information' }),
    ).toBeEnabled()
  })

  test('a POI can be started and stopped', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')

    await page.getByRole('button', { name: 'Start timer' }).click()
    await page.clock.fastForward(61_000)
    await page.getByRole('button', { name: 'Point of information' }).click()

    await expect(
      page.getByRole('button', { name: 'Stop point of information' }),
    ).toBeVisible()

    await page
      .getByRole('button', { name: 'Stop point of information' })
      .click()

    await expect(
      page.getByRole('button', { name: 'Point of information' }),
    ).toBeVisible()
  })

  test('soft-pausing shows preparation time and can be stopped from there', async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')

    await page.getByRole('button', { name: 'Start timer' }).click()
    await page.clock.fastForward(61_000)
    await page.getByRole('button', { name: 'Pause timer' }).click()

    await expect(page.getByText('Preparation time')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stop timer' })).toBeVisible()

    await page.getByRole('button', { name: 'Stop timer' }).click()

    await expect(
      page.getByRole('button', { name: 'Start timer' }),
    ).toBeVisible()
  })

  test('switching speech type while idle resets the timer and updates the selection', async ({
    page,
  }) => {
    await page.goto('/')

    const rebuttalButton = page.getByRole('button', {
      name: 'Rebuttal (1 min)',
    })
    await rebuttalButton.click()

    await expect(rebuttalButton).toHaveAttribute('data-slot', 'button')
    await expect(
      page.getByRole('button', { name: 'Start timer' }),
    ).toBeVisible()
  })

  test('switching speech type while running does not reset the timer', async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')

    await page.getByRole('button', { name: 'Start timer' }).click()
    await page.clock.fastForward(5_000)

    await page.getByRole('button', { name: 'Half (3.5 min)' }).click()

    await expect(
      page.getByRole('button', { name: 'Pause timer' }),
    ).toBeVisible()
  })
})
