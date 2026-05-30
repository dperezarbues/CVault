/**
 * Verifies every SHARED style param (available on all templates) triggers a
 * PDF recompile when changed. "New blob URL in the iframe" is the proof.
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
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Shared Params CV')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Shared Params CV')).toBeVisible()
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

async function setRange(page: Page, id: string, value: number) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    el.value = String(v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

async function setColor(page: Page, id: string, hex: string) {
  await page.locator(`input#${id}`).evaluate((el: HTMLInputElement, v) => {
    el.value = v
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, hex)
}

async function openStyleTab(page: Page) {
  await page.getByRole('tab', { name: /Style/i }).click()
}

async function expandGroup(page: Page, title: string) {
  const btn = page.locator('button').filter({ hasText: title }).filter({ hasText: '▼' })
  if ((await btn.count()) > 0) await btn.first().click()
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

  test('section rule gap triggers recompile', async ({ page }) => {
    test.setTimeout(COMPILE_TIMEOUT * 2)
    const old = await setupWithPdf(page)
    await openStyleTab(page)
    await expandGroup(page, 'Spacing')
    await setRange(page, 'section_rule_gap', 0.4)
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
    const changed = await page.locator('iframe').getAttribute('src')

    await page.getByRole('button', { name: /Reset to defaults/i }).click()
    await waitForNewPdf(page, changed as string)
  })
})
