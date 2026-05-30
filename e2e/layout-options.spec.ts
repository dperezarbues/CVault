/**
 * Verifies Layout panel controls — header style, section add/remove, columns
 * group — each trigger a PDF recompile (new blob URL in the iframe).
 */

import { expect, type Page, test } from '@playwright/test'

const COMPILE_TIMEOUT = 60_000

async function openEditor(page: Page) {
  await page.goto('/editor')
  await page.evaluate(() => localStorage.setItem('cvault-onboarded', '1'))
  await page.reload()
}

async function setupWithPdf(page: Page): Promise<string> {
  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Layout Test CV')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Layout Test CV')).toBeVisible()

  // Layout tab is the starting point — EditorShell must be mounted
  await page.getByRole('tab', { name: /Layout/i }).click()
  await page.getByRole('button', { name: 'Generate PDF' }).first().click()
  await expect(page.getByText('Generating PDF…')).not.toBeVisible({ timeout: COMPILE_TIMEOUT })

  const src = await page.locator('iframe').getAttribute('src')
  expect(src).toMatch(/^blob:/)
  return src as string
}

async function waitForNewPdf(page: Page, oldSrc: string) {
  await expect(async () => {
    const src = await page.locator('iframe').getAttribute('src')
    expect(src).toMatch(/^blob:/)
    expect(src).not.toEqual(oldSrc)
  }).toPass({ timeout: COMPILE_TIMEOUT, intervals: [500] })
}

// ── Header style ──────────────────────────────────────────────────────────────

test.describe('Layout — header style', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('switching to stacked header triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await page.getByRole('button', { name: 'stacked', exact: true }).click()
    await waitForNewPdf(page, old)
  })

  test('switching back to split header triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 3)
    const old = await setupWithPdf(page)
    await page.getByRole('button', { name: 'stacked', exact: true }).click()
    await waitForNewPdf(page, old)

    const stackedSrc = await page.locator('iframe').getAttribute('src')
    await page.getByRole('button', { name: 'split', exact: true }).click()
    await waitForNewPdf(page, stackedSrc as string)
  })
})

// ── Section management ────────────────────────────────────────────────────────

test.describe('Layout — section remove and add', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('removing a section triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await page.locator('button[data-testid="remove-section"]').first().click()
    await waitForNewPdf(page, old)
  })

  test('adding a section back triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 3)
    // Remove one first so there is an available section to add
    const old = await setupWithPdf(page)
    await page.locator('button[data-testid="remove-section"]').first().click()
    await waitForNewPdf(page, old)

    const afterRemove = await page.locator('iframe').getAttribute('src')
    const addDropdown = page.locator('select').filter({ hasText: '+ add section' })
    await addDropdown.selectOption({ index: 1 })
    await waitForNewPdf(page, afterRemove as string)
  })
})

// ── Columns group ─────────────────────────────────────────────────────────────

test.describe('Layout — columns group', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('adding a columns group triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await page.getByRole('button', { name: '+ columns' }).click()
    await waitForNewPdf(page, old)
  })
})

// ── Layout variant switcher ───────────────────────────────────────────────────

test.describe('Layout — variant selection (default template)', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('switching to Classic layout triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)

    // The layout picker is in the Template tab
    await page.getByRole('tab', { name: /Template/i }).click()
    await page.getByTestId('layout-btn-classic').click()

    // Switch back to Layout tab to resume editor view, then generate
    await page.getByRole('tab', { name: /Layout/i }).click()
    await page.getByRole('button', { name: 'Generate PDF' }).first().click()
    await expect(page.getByText('Generating PDF…')).not.toBeVisible({ timeout: COMPILE_TIMEOUT })

    const src = await page.locator('iframe').getAttribute('src')
    expect(src).toMatch(/^blob:/)
    // The blob URL after switching layout should be different from the Split-layout blob
    expect(src).not.toEqual(old)
  })
})
