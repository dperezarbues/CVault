/**
 * Tests multiple saved CV management: creating several CVs, switching
 * between them, deleting one, and verifying the active CV drives the
 * Generate PDF button's enabled state.
 */

import { expect, type Page, test } from '@playwright/test'

async function openEditor(page: Page) {
  await page.goto('/en/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
}

async function createCv(page: Page, name: string) {
  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(name)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: name })).toBeVisible()
}

test.describe('Multiple CVs — management', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('two CVs both appear in the sidebar list', async ({ page }) => {
    await createCv(page, 'CV Alpha')
    await createCv(page, 'CV Beta')

    await expect(page.getByRole('button', { name: 'CV Alpha' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'CV Beta' })).toBeVisible()
  })

  test('clicking a CV in the sidebar makes it active (Edit button targets it)', async ({ page }) => {
    await createCv(page, 'CV One')
    await createCv(page, 'CV Two')

    // Click CV One to select it
    await page.getByRole('button', { name: 'CV One' }).click()

    // Scope the Edit button to CV One's row (buttons are opacity-0, force click)
    await page.locator('button').filter({ hasText: 'CV One' }).locator('..').getByTitle('Edit CV data').click({ force: true })

    await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('CV One')
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('switching between CVs keeps both in the list', async ({ page }) => {
    await createCv(page, 'Switch A')
    await createCv(page, 'Switch B')

    await page.getByRole('button', { name: 'Switch A' }).click()
    await page.getByRole('button', { name: 'Switch B' }).click()
    await page.getByRole('button', { name: 'Switch A' }).click()

    // Both still present after switching
    await expect(page.getByRole('button', { name: 'Switch A' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Switch B' })).toBeVisible()
  })

  test('deleting a CV removes it from the list', async ({ page }) => {
    await createCv(page, 'Keep Me')
    await createCv(page, 'Delete Me')

    // Scope the Delete button to the correct row (buttons are opacity-0, force click)
    await page.locator('button').filter({ hasText: 'Delete Me' }).locator('..').getByTitle('Delete').click({ force: true })

    await expect(page.getByRole('button', { name: 'Delete Me' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Keep Me' })).toBeVisible()
  })

  test('Generate PDF button is enabled when a CV is active', async ({ page }) => {
    await createCv(page, 'Gen Active CV')
    const btn = page.getByRole('button', { name: 'Generate PDF' }).first()
    await expect(btn).toBeEnabled()
  })

  test('Generate PDF button is disabled when no CV is selected', async ({ page }) => {
    // Fresh editor with no CVs — button should be disabled
    const btn = page.getByRole('button', { name: 'Generate PDF' }).first()
    await expect(btn).toBeDisabled()
  })
})
