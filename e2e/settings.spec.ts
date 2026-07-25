import { expect, test } from '@playwright/test'

test.describe('settings', () => {
  test('saving a changed setting persists it across a reload', async ({
    page,
  }) => {
    await page.goto('/settings')

    const muteSwitch = page.getByLabel(/mute all audio/i)
    await expect(muteSwitch).not.toBeChecked()
    await muteSwitch.click()
    await expect(muteSwitch).toBeChecked()

    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/settings')
    await expect(page.getByLabel(/mute all audio/i)).toBeChecked()

    await page.reload()
    await expect(page.getByLabel(/mute all audio/i)).toBeChecked()
  })

  test('cancelling discards unsaved changes', async ({ page }) => {
    await page.goto('/settings')

    const muteSwitch = page.getByLabel(/mute all audio/i)
    await expect(muteSwitch).not.toBeChecked()
    await muteSwitch.click()
    await expect(muteSwitch).toBeChecked()

    await page.getByRole('link', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/settings')
    await expect(page.getByLabel(/mute all audio/i)).not.toBeChecked()
  })
})
