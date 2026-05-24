import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders hero and navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Build a great CV/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Open editor/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Get started/i })).toBeVisible()
  })

  test('navigates to editor on CTA click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Get started/i }).click()
    await expect(page).toHaveURL(/\/editor/)
  })

  test('schema reference section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Schema reference/i })).toBeVisible()
  })
})
