import { expect, test } from '@playwright/test'

test.describe('navigation', () => {
  test('menu links reach Settings, Demo and Licences and Back returns home', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('menuitem', { name: 'Demo' }).click()
    await expect(page).toHaveURL(/\/demo/)
    await expect(
      page.getByRole('heading', { name: 'Sound Demo' }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('menuitem', { name: 'Licenses' }).click()
    await expect(page).toHaveURL(/\/licences/)
    await expect(page.getByRole('heading', { name: 'Licences' })).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
