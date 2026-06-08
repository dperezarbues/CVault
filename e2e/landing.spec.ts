import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders hero heading and navigation', async ({ page }) => {
    await page.goto('/en/')
    await expect(page.getByRole('heading', { name: /Your CV/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Open editor/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Open the editor/i }).first()).toBeVisible()
  })

  test('navigates to editor on CTA click', async ({ page }) => {
    await page.goto('/en/')
    await page.getByRole('link', { name: /Open the editor/i }).first().click()
    await expect(page).toHaveURL(/\/editor/)
  })

  test('schema reference link is visible', async ({ page }) => {
    await page.goto('/en/')
    await expect(page.getByRole('link', { name: /Schema reference/i })).toBeVisible()
  })

  test('shows Proof brand in nav', async ({ page }) => {
    await page.goto('/en/')
    await expect(page.getByRole('navigation').getByText('Proof', { exact: true })).toBeVisible()
  })
})
