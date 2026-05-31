import { expect, test } from '@playwright/test'

test.describe('Private mode — data isolation', () => {
  test('data is written to sessionStorage, not localStorage, when private mode is on', async ({
    page,
  }) => {
    // First visit — welcome modal appears
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await expect(page.getByRole('dialog', { name: /Welcome to Proof/i })).toBeVisible()

    // Enable private mode before dismissing
    const toggle = page.getByRole('checkbox', { name: /shared computer/i })
    await toggle.check()
    await expect(toggle).toBeChecked()

    await page.getByRole('button', { name: 'Get started' }).click()
    await expect(page.getByRole('dialog', { name: /Welcome to Proof/i })).not.toBeVisible()

    // Create a new CV
    await page.getByTitle('New CV').click()
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Private CV')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Private CV' })).toBeVisible()

    // Data must be in sessionStorage, not localStorage
    const inSession = await page.evaluate(() => window.sessionStorage.getItem('proof-cvs'))
    const inLocal = await page.evaluate(() => window.localStorage.getItem('proof-cvs'))

    expect(inSession).not.toBeNull()
    const parsed = JSON.parse(inSession!) as Array<{ name: string }>
    expect(parsed.some((cv) => cv.name === 'Private CV')).toBe(true)
    expect(inLocal).toBeNull()
  })

  test('disabling private mode on a fresh visit leaves localStorage empty', async ({ page }) => {
    await page.goto('/en/editor')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Do NOT enable private mode — dismiss normally
    await expect(page.getByRole('checkbox', { name: /shared computer/i })).not.toBeChecked()
    await page.getByRole('button', { name: 'Get started' }).click()

    // Create a CV to trigger storage write
    await page.getByTitle('New CV').click()
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Normal CV')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Normal CV' })).toBeVisible()

    // Data must be in localStorage, NOT in sessionStorage
    const inLocal = await page.evaluate(() => window.localStorage.getItem('proof-cvs'))
    const inSession = await page.evaluate(() => window.sessionStorage.getItem('proof-cvs'))

    expect(inLocal).not.toBeNull()
    expect(inSession).toBeNull()
  })
})
