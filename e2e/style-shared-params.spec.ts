/**
 * Verifies every SHARED style param (available on all templates) triggers a
 * PDF recompile when changed. "New blob URL in the iframe" is the proof.
 */

import { expect, type Page, test } from '@playwright/test'
import {
  COMPILE_TIMEOUT,
  expandGroup,
  openEditor,
  openStyleTab,
  setColor,
  setRange,
  waitForNewPdf,
} from './helpers'

async function setupWithPdf(page: Page): Promise<string> {
  await page.getByTitle('New CV').click()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Shared Params CV')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Shared Params CV' })).toBeVisible()
  await page.getByRole('tab', { name: /Layout/i }).click()
  await page.getByRole('button', { name: 'Generate PDF' }).first().click()
  await expect(page.getByText('Generating PDF…')).not.toBeVisible({ timeout: COMPILE_TIMEOUT })
  const src = await page.locator('[data-testid="pdfjs-viewer"]').getAttribute('data-pdf-src')
  if (!src) throw new Error('data-pdf-src attribute not found after initial compile')
  expect(src).toMatch(/^blob:/)
  return src
}

// ── Typography ────────────────────────────────────────────────────────────────

test.describe('Shared style — Typography', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('font family triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await page.locator('select#font_family').selectOption('Helvetica Neue')
    await waitForNewPdf(page, old)
  })

  test('name size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await setRange(page, 'name_size', 22)
    await waitForNewPdf(page, old)
  })

  test('entry titles size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await setRange(page, 'entry_size', 11)
    await waitForNewPdf(page, old)
  })

  test('body text size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await setRange(page, 'body_size', 10)
    await waitForNewPdf(page, old)
  })

  test('section labels size triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await setRange(page, 'section_heading_size', 9)
    await waitForNewPdf(page, old)
  })
})

// ── Colors ────────────────────────────────────────────────────────────────────

test.describe('Shared style — Colors', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('body text colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    await setColor(page, 'body_color', '#cc0000')
    await waitForNewPdf(page, old)
  })

  test('headings colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    await setColor(page, 'heading_color', '#cc0000')
    await waitForNewPdf(page, old)
  })

  test('muted / meta colour triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Colors')
    await setColor(page, 'muted_color', '#cc0000')
    await waitForNewPdf(page, old)
  })
})

// ── Spacing ───────────────────────────────────────────────────────────────────

test.describe('Shared style — Spacing', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('line height triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Spacing')
    await setRange(page, 'line_height', 1.0)
    await waitForNewPdf(page, old)
  })

})

// ── Extras (toggles) ──────────────────────────────────────────────────────────

test.describe('Shared style — Extras', () => {
  test.beforeEach(async ({ page }) => { await openEditor(page) })

  test('show footer toggle triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Extras')
    await page.getByRole('switch', { name: 'Page footer' }).click()
    await waitForNewPdf(page, old)
  })

  test('show QR toggle triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Extras')
    await page.getByRole('switch', { name: 'QR code' }).click()
    await waitForNewPdf(page, old)
  })

  test('contact icons toggle triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Extras')
    await page.getByRole('switch', { name: 'Contact icons' }).click()
    await waitForNewPdf(page, old)
  })

  test('contact labels toggle triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Extras')
    await page.getByRole('switch', { name: 'Contact labels' }).click()
    await waitForNewPdf(page, old)
  })
})

// ── Reset ─────────────────────────────────────────────────────────────────────

test.describe('Shared style — Reset', () => {
  test('reset to defaults triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 3)
    await openEditor(page)
    const old = await setupWithPdf(page)

    // Make a change so reset actually produces a different output
    await openStyleTab(page)
    await setRange(page, 'name_size', 22)
    await waitForNewPdf(page, old)
    const changed = await page.locator('[data-testid="pdfjs-viewer"]').getAttribute('data-pdf-src')
    if (!changed) throw new Error('data-pdf-src not found after name_size change')
    await page.getByRole('button', { name: /Reset to defaults/i }).click()
    await waitForNewPdf(page, changed)
  })
})
